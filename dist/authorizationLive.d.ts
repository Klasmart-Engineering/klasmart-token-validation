export declare type KidsloopLiveAuthorizationToken = {
    aud: string;
    exp: number;
    iat: number;
    iss: string;
    sub: string;
    roomid: string;
    userid: string;
    atartat: number;
    endat: number;
    name?: string;
    teacher?: boolean;
    materials?: unknown;
    classtype?: string;
};
export declare function checkLiveAuthorizationTokenAndUserId(token?: string, userId?: string): Promise<KidsloopLiveAuthorizationToken>;
export declare function checkLiveAuthorizationToken(token?: string): Promise<KidsloopLiveAuthorizationToken>;
//# sourceMappingURL=authorizationLive.d.ts.map