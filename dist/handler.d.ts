import { NextFunction, Request, Response } from 'express';
import { KidsloopAuthenticationToken } from './authentication';
export interface RFC5424LoggerPartial {
    debug: (message: string, ...params: any[]) => void;
    warning: (message: string, ...params: any[]) => void;
    silly?: never;
    warn?: never;
}
export interface NPMLoggerPartial {
    silly: (message: string, ...params: any[]) => void;
    warn: (message: string, ...params: any[]) => void;
}
/**
* Configuration options for Authentication Middleware
*/
interface KidsloopAuthMiddlewareConfig {
    /**
    * Compatible NPM or RFC5424 logger. If supplied will log messages related to validation status in default handlers.
    */
    logger?: RFC5424LoggerPartial | NPMLoggerPartial;
    /**
    * Optional override for middleware initialization handler. This can be used to hook behavior into the registration process.
    * By default this only writes a warn message when development environment variables are defined.
    */
    initializationHandler?: () => void;
    /**
    * Optional override for middleware handling when no access cookie is present in the request.
    */
    noTokenHandler?: (request: Request, response: Response, next: NextFunction) => void;
    /**
    * Optional override for middleware token validation error handling. This middleware will be called when an access cookie is present but
    * it fails to validate.
    */
    tokenErrorHandler?: (err: Error, request: Request, response: Response, next: NextFunction) => void;
    /**
    * Optional override for middleware token registration handling. This middleware is called following successful validation of an access token.
    */
    tokenRegistrationHandler?: (request: Request, response: Response, next: NextFunction, token: KidsloopAuthenticationToken) => void;
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
export declare function kidsloopAuthMiddleware(config?: KidsloopAuthMiddlewareConfig): (request: Request, response: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=handler.d.ts.map