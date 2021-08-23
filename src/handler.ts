import { NextFunction, Request, Response } from 'express'
import { checkToken, KidsloopAuthenticationToken } from './main'

interface RFC5424Logger {
  debug: (message: string) => void;
  warning: (message: string) => void;
  silly?: never;
  warn?: never;
}

interface NPMLoggerPartial {
  silly: (message: string) => void;
  warn: (message: string) => void;
  warning?: never;
}

/**
* Configuration options for Authentication Middleware
*/
interface KidsloopAuthMiddlewareConfig {
  /**
  * Compatible NPM or RFC5424 logger. If supplied will log messages related to validation status in default handlers.
  */
  logger?: RFC5424Logger | NPMLoggerPartial

  /**
  * Optional override for middleware initialization handler. This can be used to hook behavior into the registration process.
  * By default this only writes a warn message when development environment variables are defined.
  */
  initializationHandler: () => void

  /**
  * Optional override for middleware handling when no access cookie is present in the request.
  */
  noTokenHandler?: (request: Request, response: Response, next: NextFunction) => void

  /**
  * Optional override for middleware token validation error handling. This middleware will be called when an access cookie is present but
  * it fails to validate.
  */
  tokenErrorHandler: (err: Error, request: Request, response: Response, next: NextFunction) => void

  /**
  * Optional override for middleware token registration handling. This middleware is called following successful validation of an access token.
  */
  tokenRegistrationHandler?: (request: Request, response: Response, next: NextFunction, token: KidsloopAuthenticationToken) => void
}

/**
* Creates middleware function that authenticates users based on Kidsloop access token
* Token processing is handled by the kidsloop-token-validation module. Based on the token
* validation an AuthType will be registered on response.locals for use in later processing.
*
* At the current time the access token does not seem to include any privilege or access level
* information so it only assigns AuthType.Authenticated and AuthType.Anonymous.
*
* In development environments, the environment variable DEV_JWT_SECRET can be registered for
* testing JWT integration, but in the production environment the JWT secret is provided by the
* kidsloop-token-validation module.
*/
export function kidsloopAuthMiddleware (config?: KidsloopAuthMiddlewareConfig): (request: Request, response: Response, next: NextFunction) => Promise<void> {
  /**
  * Logging functions - these will be overrided by optional logging implementations if passed.
  * Level names correlate to NPM style logging severity.
  * RFC style will be mapped to these.
  */
  let logSilly = (message: string) => {}
  let logWarn = (message: string) => {}

  // Conditionally assign actual logging functions
  if (config?.logger) {
    // If this is an RFC5424 Logger
    if (config.logger.warning) {
      // Assign passed functions or fallback to empty functions if not defined
      logSilly = config.logger.debug || logSilly
      logWarn = config.logger.warning || logWarn
    } else {
      // or if it's an NPM style logger
      logSilly = config.logger.silly || logSilly
      logWarn = config.logger.warn || logWarn
    }
  }

  function defaultNoTokenHandler (request: Request, response: Response, next: NextFunction) {
    logSilly('Unauthenticated request: No token')
    response.locals.authenticated = false
    next()
  }

  function defaultInitializationHandler () {
    if (config?.logger && process.env.DEV_JWT_SECRET) {
      logWarn('Running with development JWT secret!')
    }
  }

  function defaultTokenErrorHandler (err: Error, request: Request, response: Response, next: NextFunction) {
    logSilly(`Unauthenticated request: Bad token - ${err.message}`)
    response.locals.authenticated = false
    next()
  }

  function defaultTokenRegistrationHandler (request: Request, response: Response, next: NextFunction, token: KidsloopAuthenticationToken) {
    response.locals.authenticated = true
    response.locals.token = token
    next()
  }

  // Use custom initialization handler or fallback to default
  ;(config?.initializationHandler || defaultInitializationHandler)()

  /**
   * Actual middleware behavior
   */
  return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const token = request.cookies.access as string
    if (!token) {
      ;(config?.noTokenHandler || defaultNoTokenHandler)(request, response, next)
      return
    }

    try {
      const authenticationDetails: KidsloopAuthenticationToken = await checkToken(token)
      ;(config?.tokenRegistrationHandler || defaultTokenRegistrationHandler)(request, response, next, authenticationDetails)
    } catch (err) {
      ;(config?.tokenErrorHandler || defaultTokenErrorHandler)(err, request, response, next)
    }
  }
}
