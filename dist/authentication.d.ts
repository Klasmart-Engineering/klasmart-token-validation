export interface KidsloopAuthenticationToken {
    id?: string;
    email?: string;
    phone?: string;
    iat?: number;
    exp: number;
    iss: string;
}
export declare function checkAuthenticationToken(token?: string): Promise<KidsloopAuthenticationToken>;
//# sourceMappingURL=authentication.d.ts.map