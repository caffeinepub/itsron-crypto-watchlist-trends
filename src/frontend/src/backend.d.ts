import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface AlertInput {
    direction: AlertDirection;
    targetPrice: number;
    symbol: CryptoSymbol;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface InitializePermanentAdminResult {
    verifiedCaller: Principal;
    permanentAdminSet: boolean;
}
export interface PriceAlert {
    alertType: string;
    direction: AlertDirection;
    createdAt: Time;
    targetPrice: number;
    isActive: boolean;
    symbol: CryptoSymbol;
}
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
export interface CommandEntry {
    description: string;
    command: string;
    category: CommandCategory;
}
export enum AlertDirection {
    above = "above",
    below = "below"
}
export enum CommandCategory {
    admin = "admin",
    data = "data",
    test = "test",
    user = "user"
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
    checkAndInitializeUser(): Promise<boolean>;
    createOrUpdatePriceAlert(input: AlertInput): Promise<void>;
    debugCheckSymbol(symbol: string): Promise<boolean>;
    debugGetAdminList(): Promise<Array<Principal>>;
    debugSymbolCount(): Promise<bigint>;
    debugValidSymbols(): Promise<Array<[DisplaySymbol, CryptoSymbol]>>;
    deleteAlert(alertId: bigint): Promise<void>;
    disableAlert(alertId: bigint): Promise<void>;
    disableAllAlerts(): Promise<void>;
    emergencyGrantAdmin(user: Principal): Promise<void>;
    fetchCoinGeckoData(symbol: CryptoSymbol): Promise<LiveMarketResponse | null>;
    getActiveAlerts(): Promise<Array<[bigint, PriceAlert]>>;
    getAdminInitializationErrorMessage(): Promise<string | null>;
    getAdminList(): Promise<Array<Principal>>;
    getAlertSettings(symbol: CryptoSymbol): Promise<AlertSettings | null>;
    getAlerts(): Promise<Array<[bigint, PriceAlert]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommandRegistry(): Promise<Array<CommandEntry>>;
    getForecastMethod(symbol: CryptoSymbol): Promise<ForecastMethod | null>;
    getLiveMarketData(symbol: CryptoSymbol): Promise<LiveMarketResponse | null>;
    getRole(): Promise<Role>;
    getSingleAlert(alertId: bigint): Promise<PriceAlert | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getValidSymbols(): Promise<Array<[DisplaySymbol, SymbolPair]>>;
    getWatchlist(): Promise<Array<CryptoSymbol>>;
    grantUserPermission(user: Principal): Promise<void>;
    initializePermanentAdmin(): Promise<InitializePermanentAdminResult>;
    isCallerAdmin(): Promise<boolean>;
    loadValidCryptoSymbols(): Promise<void>;
    registerSelfAsUser(): Promise<void>;
    registerWithRole(role: Role): Promise<void>;
    removeCryptoFromWatchlist(symbol: CryptoSymbol): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    savePermanentAdmin(_oldAdmin: Principal): Promise<void>;
    setAlertSettings(symbol: CryptoSymbol, settings: AlertSettings): Promise<void>;
    setForecastMethod(symbol: CryptoSymbol, method: ForecastMethod): Promise<void>;
    testAPIResponseFormat(_symbol: string): Promise<boolean>;
    testAlertSettings(symbol: string, threshold: number): Promise<boolean>;
    testAllNineSymbols(): Promise<boolean>;
    testBulkSymbolValidation(): Promise<boolean>;
    testForecastMethod(symbol: string, method: string): Promise<boolean>;
    testHistoricalDataFetch(symbol: string): Promise<boolean>;
    testSymbolDataIntegrity(_symbol: string): Promise<boolean>;
    testWatchlistAdd(symbol: string): Promise<boolean>;
    testWatchlistRemove(symbol: string): Promise<boolean>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
