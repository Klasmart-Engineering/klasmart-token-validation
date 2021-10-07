export declare type KidsloopLiveAuthorizationToken = {
    aud: string;
    exp: number;
    iat: number;
    iss: string;
    sub: string;
    roomid: string;
    userid: string;
    name?: string;
    teacher?: boolean;
    materials?: unknown;
};
export declare function checkLiveAuthorizationToken(token?: string): Promise<KidsloopLiveAuthorizationToken>;
//# sourceMappingURL=authorizationLive.d.ts.map