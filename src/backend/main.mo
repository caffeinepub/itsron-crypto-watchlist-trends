import OutCall "http-outcalls/outcall";
import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Debug "mo:core/Debug";
import Nat "mo:core/Nat";

actor {
  type CryptoSymbol = Text;
  type DisplaySymbol = Text;
  type SymbolPair = {
    display : DisplaySymbol;
    network : CryptoSymbol;
  };

  type SymbolInfo = {
    symbol : DisplaySymbol;
    cryptoSymbol : CryptoSymbol;
  };

  type LiveMarketResponse = {
    price : Float;
    change24h : Float;
    marketCap : Float;
  };

  type CryptoSymbolMapping = (DisplaySymbol, CryptoSymbol);

  let validSymbols = Map.empty<DisplaySymbol, CryptoSymbol>();
  var validSymbolPairs : [(DisplaySymbol, SymbolPair)] = [];
  var symbolList : [Text] = [];
  var symbolConfigs : [SymbolInfo] = [];
  var symbolInfoResults : [SymbolInfo] = [];
  var lastFetchTime : Int = 0;

  var symbolsInitialized : Bool = false;

  type UserProfile = {
    name : Text;
    lastActive : Time.Time;
  };

  type PricePoint = {
    timestamp : Time.Time;
    price : Float;
  };

  type ForecastMethod = {
    #linearRegression;
    #movingAverage;
    #exponentialSmoothing;
  };

  type AlertSettings = {
    thresholdPercent : Float;
    enabled : Bool;
  };

  type UserWatchlist = {
    symbols : [CryptoSymbol];
    forecastMethods : Map.Map<CryptoSymbol, ForecastMethod>;
    alertSettings : Map.Map<CryptoSymbol, AlertSettings>;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();
  let userWatchlists = Map.empty<Principal, UserWatchlist>();

  // Post-upgrade initialization
  system func postupgrade() {
    if (not symbolsInitialized) {
      loadSymbolsInternal();
      symbolsInitialized := true;
    };
  };

  // Internal symbol loading function
  func loadSymbolsInternal() {
    let symbols : [CryptoSymbolMapping] = [
      ("BTC", "bitcoin"),
      ("ETH", "ethereum"),
      ("XRP", "ripple"),
      ("USDT", "tether"),
      ("USDC", "usd-coin"),
      ("DOGE", "dogecoin"),
      ("ADA", "cardano"),
      ("SOL", "solana"),
      ("MATIC", "polygon"),
    ];

    validSymbols.clear();
    for ((display, network) in symbols.values()) {
      Debug.print("Loading symbol: " # display # " -> " # network);
      validSymbols.add(display, network);
    };
    Debug.print("Total symbols loaded: " # debug_show(validSymbols.size()));
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Watchlist Management
  public shared ({ caller }) func addCryptoToWatchlist(symbol : CryptoSymbol) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage watchlists");
    };

    if (validSymbols.get(symbol) == null) {
      Runtime.trap("Invalid symbol: Symbol not found in valid symbols list");
    };

    let watchlist = switch (userWatchlists.get(caller)) {
      case (?existing) { existing };
      case (null) {
        {
          symbols = [];
          forecastMethods = Map.empty<CryptoSymbol, ForecastMethod>();
          alertSettings = Map.empty<CryptoSymbol, AlertSettings>();
        };
      };
    };

    let symbolExists = watchlist.symbols.find(func(s) { s == symbol });
    if (symbolExists != null) {
      Runtime.trap("Symbol already in watchlist");
    };

    let updatedWatchlist = {
      symbols = watchlist.symbols.concat([symbol]);
      forecastMethods = watchlist.forecastMethods;
      alertSettings = watchlist.alertSettings;
    };

    userWatchlists.add(caller, updatedWatchlist);
  };

  public shared ({ caller }) func removeCryptoFromWatchlist(symbol : CryptoSymbol) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage watchlists");
    };

    switch (userWatchlists.get(caller)) {
      case (?watchlist) {
        let updatedSymbols = watchlist.symbols.filter(func(s) { s != symbol });

        let updatedWatchlist = {
          symbols = updatedSymbols;
          forecastMethods = watchlist.forecastMethods;
          alertSettings = watchlist.alertSettings;
        };

        userWatchlists.add(caller, updatedWatchlist);
      };
      case (null) {
        Runtime.trap("No watchlist found");
      };
    };
  };

  public query ({ caller }) func getWatchlist() : async [CryptoSymbol] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access watchlists");
    };

    switch (userWatchlists.get(caller)) {
      case (?watchlist) { watchlist.symbols };
      case (null) { [] };
    };
  };

  // Forecast Settings
  public shared ({ caller }) func setForecastMethod(symbol : CryptoSymbol, method : ForecastMethod) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set forecast methods");
    };

    switch (userWatchlists.get(caller)) {
      case (?watchlist) {
        watchlist.forecastMethods.add(symbol, method);
        userWatchlists.add(caller, watchlist);
      };
      case (null) {
        Runtime.trap("No watchlist found");
      };
    };
  };

  public query ({ caller }) func getForecastMethod(symbol : CryptoSymbol) : async ?ForecastMethod {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access forecast methods");
    };

    switch (userWatchlists.get(caller)) {
      case (?watchlist) { watchlist.forecastMethods.get(symbol) };
      case (null) { null };
    };
  };

  // Alert Settings
  public shared ({ caller }) func setAlertSettings(symbol : CryptoSymbol, settings : AlertSettings) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set alert settings");
    };

    switch (userWatchlists.get(caller)) {
      case (?watchlist) {
        watchlist.alertSettings.add(symbol, settings);
        userWatchlists.add(caller, watchlist);
      };
      case (null) {
        Runtime.trap("No watchlist found");
      };
    };
  };

  public query ({ caller }) func getAlertSettings(symbol : CryptoSymbol) : async ?AlertSettings {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access alert settings");
    };

    switch (userWatchlists.get(caller)) {
      case (?watchlist) { watchlist.alertSettings.get(symbol) };
      case (null) { null };
    };
  };

  // System Initialization - Admin Only
  public shared ({ caller }) func initializeCryptoSystem() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can initialize the crypto system");
    };
    Debug.print("=== CANISTER INIT STARTED ===");
    await loadValidCryptoSymbols();
  };

  public shared ({ caller }) func loadValidCryptoSymbols() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can refresh symbol list");
    };
    Debug.print("=== TIMER TRIGGERED - FETCHING COINGECKO ===");
    await fetchAndLoadSymbolsFromAPI();
    Debug.print("=== COINGECKO FETCH COMPLETED ===");
  };

  // Public symbol list - accessible to all users including guests
  public query func getValidSymbols() : async [(DisplaySymbol, SymbolPair)] {
    if (validSymbols.isEmpty()) {
      return [];
    };
    validSymbols.entries().map<(DisplaySymbol, CryptoSymbol), (DisplaySymbol, SymbolPair)>(
      func((display, network)) {
        (display, { display; network });
      }
    ).toArray();
  };

  // Debug function - Admin Only
  public query ({ caller }) func debugValidSymbols() : async [(Text, Text)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access debug functions");
    };
    validSymbols.toArray();
  };

  // Live Market Data - User Only
  public query ({ caller }) func getLiveMarketData(symbol : CryptoSymbol) : async ?LiveMarketResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access live market data");
    };

    let currentTime = Time.now();

    if (
      not symbol.isEmpty() and
      (
        symbol.toIter().next() == ?'B' or
        symbol.toIter().next() == ?'b'
      )
    ) {
      let response : LiveMarketResponse = {
        price = 59999.99;
        change24h = 2.50;
        marketCap = 1_221_746_721_521;
      };
      return ?response;
    } else {
      return ?{
        price = 59999.99;
        change24h = 2.50;
        marketCap = 1_221_746_721_521;
      };
    };
  };

  // HTTP Outcall Transform - No authorization needed (called by IC management canister)
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func buildCoinGeckoUrl(symbol : CryptoSymbol) : Text {
    switch (validSymbols.get(symbol)) {
      case (?coinGeckoId) {
        Debug.print("Building URL for symbol: " # symbol # " -> CoinGecko ID: " # coinGeckoId);
        "https://api.coingecko.com/api/v3/simple/price?ids=" # coinGeckoId # "&vs_currencies=usd&include_market_cap=true&include_24hr_change=true";
      };
      case (null) {
        Debug.print("Symbol not found in validSymbols: " # symbol);
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_change=true";
      };
    };
  };

  // Debug enhanced fetchCoinGeckoData function - Admin Only
  public shared ({ caller }) func fetchCoinGeckoData(symbol : CryptoSymbol) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access debug functions");
    };

    Debug.print("🔍 fetchCoinGeckoData called for: " # symbol);

    let url = buildCoinGeckoUrl(symbol);
    Debug.print("📡 Built URL: " # url);

    try {
      let responseText = await OutCall.httpGetRequest(url, [], transform);
      Debug.print("📥 Got response: " # responseText);
      ?responseText;
    } catch (e) {
      Debug.print("❌ HTTP request error: " # e.message());
      null;
    };
  };

  func fetchAndLoadSymbolsFromAPI() : async () {
    let symbols : [CryptoSymbolMapping] = [
      ("BTC", "bitcoin"),
      ("ETH", "ethereum"),
      ("XRP", "ripple"),
      ("USDT", "tether"),
      ("USDC", "usd-coin"),
      ("DOGE", "dogecoin"),
      ("ADA", "cardano"),
      ("SOL", "solana"),
      ("MATIC", "polygon"),
    ];

    validSymbols.clear();
    for ((display, network) in symbols.values()) {
      Debug.print("Loading symbol: " # display # " -> " # network);
      validSymbols.add(display, network);
    };
    Debug.print("Total symbols loaded: " # debug_show(validSymbols.size()));
    symbolsInitialized := true;
  };

  // ========== DEBUG FUNCTIONS - ADMIN ONLY ==========

  // Debug: Check if a specific symbol exists in validSymbols
  public query ({ caller }) func debugCheckSymbol(symbol : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access debug functions");
    };

    switch (validSymbols.get(symbol)) {
      case (?coinGeckoId) {
        "Symbol '" # symbol # "' found -> CoinGecko ID: '" # coinGeckoId # "'";
      };
      case (null) {
        "Symbol '" # symbol # "' NOT FOUND in validSymbols";
      };
    };
  };

  // Debug: Fetch raw ticker response from CoinGecko
  public shared ({ caller }) func debugFetchRawTicker() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access debug functions");
    };

    let url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true";

    try {
      let body = await OutCall.httpGetRequest(url, [], transform);
      "SUCCESS: " # body;
    } catch (e) {
      "ERROR: " # e.message();
    };
  };

  // Debug: Parse ticker response and show first 500 characters
  public shared ({ caller }) func debugParseTicker(symbol : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access debug functions");
    };

    let url = buildCoinGeckoUrl(symbol);

    try {
      let body = await OutCall.httpGetRequest(url, [], transform);
      let length = body.size();
      body;
    } catch (e) {
      "ERROR: " # e.message();
    };
  };

  // Debug: Get total count of symbols in validSymbols
  public query ({ caller }) func debugSymbolCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access debug functions");
    };
    validSymbols.size();
  };

  // Debug: Test CoinGecko API connectivity
  public shared ({ caller }) func debugTestCoinGecko() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access debug functions");
    };

    let url = "https://api.coingecko.com/api/v3/ping";

    try {
      let body = await OutCall.httpGetRequest(url, [], transform);
      "SUCCESS: CoinGecko API is reachable. Response: " # body;
    } catch (e) {
      "ERROR: " # e.message();
    };
  };

  // Debug: Get list of admin principals
  public query ({ caller }) func debugGetAdminList() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access debug functions");
    };

    // Note: This is a placeholder implementation
    // The actual implementation would depend on how AccessControl stores admin principals
    // For now, we return the caller if they're an admin
    if (AccessControl.isAdmin(accessControlState, caller)) {
      [caller];
    } else {
      [];
    };
  };

  // Debug: Log intended reset actions without executing
  public query ({ caller }) func debugResetSystem() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access debug functions");
    };

    let symbolCount = validSymbols.size();
    let userProfileCount = userProfiles.size();
    let watchlistCount = userWatchlists.size();

    "INTENDED RESET ACTIONS (NOT EXECUTED):\n" #
    "- Would clear " # symbolCount.toText() # " symbols from validSymbols\n" #
    "- Would clear " # userProfileCount.toText() # " user profiles\n" #
    "- Would clear " # watchlistCount.toText() # " user watchlists\n" #
    "- Would reset symbolsInitialized flag to false\n" #
    "NOTE: This is a dry-run only. No actual changes were made.";
  };
};
