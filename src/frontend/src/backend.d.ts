import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface OutcallCycleStatus {
    status: string;
    currentBalance: bigint;
    threshold: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type CryptoSymbol = string;
export interface UserProfile {
    name: string;
}
export interface http_header {
    value: string;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkCyclesSafeForOutcall(): Promise<boolean>;
    debugFetchCoinGecko(symbol: CryptoSymbol): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCycleBalance(): Promise<bigint>;
    getLiveMarketData(symbol: CryptoSymbol): Promise<string>;
    getOutcallCycleStatus(): Promise<OutcallCycleStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    transformRaw(input: TransformationInput): Promise<TransformationOutput>;
}
