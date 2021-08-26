import { Request, Response } from 'express'
import { kidsloopAuthMiddleware, NPMLoggerPartial, RFC5424LoggerPartial } from '../src/handler'
import * as jsonwebtoken from 'jsonwebtoken'

// Helpers for creating request and response objects
const createRequest = (value: string) => ({
  cookies: {
    access: value
  }
}) as unknown as Request

const createResponse = () => ({
  locals: { }
}) as unknown as Response

/* Constant Values */
const devSecret = process.env.DEV_JWT_SECRET || 'iXtZx1D5AqEB0B9pfn+hRQ=='
const userPayload = {
  email: 'test@jest.com',
  id: '1a234567-89bc-0d12-efab-c3456789d012'
}

const withDevSecret = async (secret: string, fn: Function) => {
  [secret, process.env.DEV_JWT_SECRET] = [process.env.DEV_JWT_SECRET, secret]
  process.env.DEV_JWT_SECRET = secret
  await fn()
  process.env.DEV_JWT_SECRET = secret
}

/* Tokens - Most test cases will make assertions on the behavior of the function under
    a specific configuration and given a variety of tokens.
*/
const tokens : { [Key: string]: string | undefined } = {
  valid: jsonwebtoken.sign(userPayload, devSecret, {
    issuer: 'calmid-debug',
    expiresIn: '10m',
    algorithm: 'HS256'
  }),
  invalid: '98saf7s98h69g8as798f69dsg==',
  expired: jsonwebtoken.sign({
    email: 'test.expired@jest.com',
    id: '1a234567-89bc-0d12-efab-c3456789d012'
  }, devSecret, {
    issuer: 'calmid-debug',
    expiresIn: '0',
    algorithm: 'HS256'
  }),
  undefined: undefined
}

describe('kidsloopAuthMiddleware', () => {
  // next stub function to pass to middleware
  const nextStub = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return a function', () => {
    expect(kidsloopAuthMiddleware()).toBeInstanceOf(Function)
  })

  describe('default implementation', () => {
    const targetFunction = kidsloopAuthMiddleware()
    const testConditions: [string, boolean, string|undefined ][] = [
      ['when no token is provided', false, tokens.undefined],
      ['when token is invalid', false, tokens.invalid],
      ['when token is expired', false, tokens.expired],
      ['when token is valid', true, tokens.valid]
    ]

    testConditions.forEach(([when, expectation, jwt]) => {
      it(`should set response.locals.authenticated to ${expectation} ${when}`, async () => {
        const request = createRequest(jwt)
        const response = createResponse()
        await targetFunction(request, response, nextStub)
        expect(response.locals).toMatchObject({
          authenticated: expectation
        })
      })
    })

    testConditions
      .map(([when, exp, jwt]) => [when, exp ? 'userPayload' : undefined, jwt])
      .forEach(([when, expectation, jwt]) => {
        it(`response.locals.token should be ${expectation} ${when}`, async () => {
          const request = createRequest(jwt)
          const response = createResponse()
          await targetFunction(request, response, nextStub)
          if (expectation) {
            expect(response.locals).toMatchObject({
              token: userPayload
            })
          } else {
            expect(response.locals).not.toHaveProperty('token')
          }
        })
      })
  })

  describe('custom lifecycle functions', () => {
    it('should call supplied init function when initialized', async () => {
      const stub = jest.fn()
      kidsloopAuthMiddleware({ initializationHandler: stub })
      expect(stub).toHaveBeenCalled()
    })

    it('should call supplied no token handler when no token cookie is provided', async () => {
      const stub = jest.fn()
      const fn = kidsloopAuthMiddleware({ noTokenHandler: stub })
      await fn(createRequest(tokens.undefined), createResponse(), nextStub)
      expect(stub).toHaveBeenCalled()
    })

    it('should call supplied error handler when invalid cookie is provided', async () => {
      const stub = jest.fn()
      const fn = kidsloopAuthMiddleware({ tokenErrorHandler: stub })
      await fn(createRequest(tokens.invalid), createResponse(), nextStub)
      expect(stub).toHaveBeenCalled()
    })

    it('should call supplied token registration handler when a valid cookie is provided', async () => {
      const stub = jest.fn()
      const fn = kidsloopAuthMiddleware({ tokenRegistrationHandler: stub })
      await fn(createRequest(tokens.valid), createResponse(), nextStub)
      expect(stub).toHaveBeenCalled()
    })
  })

  describe('logger support', () => {
    const scenarios = (
      logger: RFC5424LoggerPartial | NPMLoggerPartial,
      [warnStr, sillyStr]: [string, string],
      [warnStub, sillyStub]: Array<(msg: string, ...params: any) => void>
    ) => {
      it(`should map and call ${warnStr} function without error`, async () => {
        await withDevSecret('some-secret', async () => {
          kidsloopAuthMiddleware({ logger })
          expect(warnStub).toHaveBeenCalled()
        })
      })

      it(`should map and call ${sillyStr} function without error`, async () => {
        await kidsloopAuthMiddleware({ logger })(createRequest('ldsjflsd'), createResponse(), nextStub)
        expect(sillyStub).toHaveBeenCalled()
      })
    }

    describe('npm logger', () => {
      const logger: NPMLoggerPartial = {
        warn: jest.fn(),
        silly: jest.fn()
      }

      scenarios(logger, ['warn', 'silly'], [logger.warn, logger.silly])
    })

    describe('RFC5424 logger support', () => {
      const logger: RFC5424LoggerPartial = {
        warning: jest.fn(),
        debug: jest.fn()
      }

      scenarios(logger, ['warning', 'debug'], [logger.warning, logger.debug])
    })
  })
})
