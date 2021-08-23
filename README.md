## Basic Usage
```typescript
export async function checkToken(token?: string): Promise<KidsloopAuthenticationToken | undefined>


export interface KidsloopAuthenticationToken {
  id?: string,
  email: string,
  
  // Standard JWT properties
  iat?: number
  exp: number,
  iss: string,
}
```
## Using Express Middleware
This middleware registers an express middleware handler to read the token using checkToken and assign authentication data to `response.locals` such that later middleware functions can access it. By default it will assign a boolean value to `response.locals.authenticated` representing whether a user was successfully authenticated and the full JWT payload (KidsloopAuthenticationToken) to `response.locals.token`.

```typescript
const app = express();
app.use(cookieParser());
app.use(kidsloopAuthMiddleware());
```

Later in request processing you can then validate authentication and access token properties using the `response.locals` object.

```typescript
app.use((request: Request, response: Response, next: NextFunction) => {
  if (!response.locals.token) {
    // User was not authenticated
    respones.sendStatus(401);
    return;
  }
  log.debug(`Request to ${request.path} from user with ID: ${response.locals.token?.id}.`);
})

```

### Additional Configuration

#### Logger
When calling the middleware function an optional configuration object can be passed. This will accept an RFC5424 or NPM Logging compatible logger, which will allow the default handlers to log some authentication steps to NPM logging SILLY and WARN levels. If an RFC5424 logger is passed the NPM SILLY and WARN logs will be mapped to RFC5424 DEBUG and WARNING log functions.

#### Overriding Handler Lifecycle Stages
Custom handlers can be supplied to override default functionality at each stage of token processing. These stages described below:

1. Initialization - Called once when the kidsloopAuthMiddleware function is called at middleware registration. This is not called upon request receival. This allows for some custom configuration to happen at setup time.
2. NoTokenHandler - Called when a request is received but the request has no access cookie.
3. TokenErrorHandler - Called when a request is received and an access cookie is present, but it is not valid.
4. TokenRegistrationHandler - Called upon successful token validation.

Note on overriding lifecycle stages: The call to next occurs inside of the default handler functions (except for initialization, as there is no request when it is called). If you override them, be sure that your custom implementation calls next where appropriate, otherwise requests may be unexpectedly dropped.