export interface KidsloopAuthenticationToken {
    id?: string;
    email: string;
    iat?: number;
    exp: number;
    iss: string;
}
export declare function checkToken(token?: string): Promise<KidsloopAuthenticationToken | undefined>;
