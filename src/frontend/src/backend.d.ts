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
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface SymbolPair {
    network: CryptoSymbol;
    display: DisplaySymbol;
}
export interface LiveMarketResponse {
    change24h: number;
    marketCap: number;
    price: number;
}
export type DisplaySymbol = string;
export type CryptoSymbol = string;
export interface AlertSettings {
    enabled: boolean;
    thresholdPercent: number;
}
export interface UserProfile {
    name: string;
    lastActive: Time;
}
export interface http_header {
    value: string;
    name: string;
}
export enum ForecastMethod {
    movingAverage = "movingAverage",
    exponentialSmoothing = "exponentialSmoothing",
    linearRegression = "linearRegression"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCryptoToWatchlist(symbol: CryptoSymbol): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    debugCheckSymbol(symbol: string): Promise<string>;
    debugFetchRawTicker(): Promise<string>;
    debugGetAdminList(): Promise<Array<Principal>>;
    debugParseTicker(symbol: string): Promise<string>;
    debugResetSystem(): Promise<string>;
    debugSymbolCount(): Promise<bigint>;
    debugTestCoinGecko(): Promise<string>;
    debugValidSymbols(): Promise<Array<[string, string]>>;
    fetchCoinGeckoData(symbol: CryptoSymbol): Promise<string | null>;
    getAlertSettings(symbol: CryptoSymbol): Promise<AlertSettings | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getForecastMethod(symbol: CryptoSymbol): Promise<ForecastMethod | null>;
    getLiveMarketData(symbol: CryptoSymbol): Promise<LiveMarketResponse | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getValidSymbols(): Promise<Array<[DisplaySymbol, SymbolPair]>>;
    getWatchlist(): Promise<Array<CryptoSymbol>>;
    initializeCryptoSystem(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    loadValidCryptoSymbols(): Promise<void>;
    removeCryptoFromWatchlist(symbol: CryptoSymbol): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAlertSettings(symbol: CryptoSymbol, settings: AlertSettings): Promise<void>;
    setForecastMethod(symbol: CryptoSymbol, method: ForecastMethod): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
