export async function checkToken(token?: string): Promise<KidsloopAuthenticationToken | undefined>


export interface KidsloopAuthenticationToken {
  id?: string,
  email: string,
  
  // Standard JWT properties
  iat?: number
  exp: number,
  iss: string,
}
