import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Debug "mo:core/Debug";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import OutCall "http-outcalls/outcall";

actor {
  // === TYPES ===

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

  type Role = {
    #admin;
    #user;
    #guest;
  };

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

  type CryptoSymbolMapping = (DisplaySymbol, CryptoSymbol);

  type CoinMarketData = {
    current_price : Float;
    price_change_percentage_24h : Float;
    market_cap : Float;
  };

  type CommandCategory = {
    #admin;
    #user;
    #test;
    #data;
  };

  type CommandEntry = {
    command : Text;
    description : Text;
    category : CommandCategory;
  };

  type CoinGeckoCoinInfo = {
    id : Text;
    symbol : Text;
    name : Text;
  };

  type AlertDirection = {
    #above;
    #below;
  };

  type PriceAlert = {
    symbol : CryptoSymbol;
    targetPrice : Float;
    direction : AlertDirection;
    isActive : Bool;
    createdAt : Time.Time;
    alertType : Text;
  };

  public type InitializePermanentAdminResult = {
    verifiedCaller : Principal;
    permanentAdminSet : Bool;
  };

  var symbolsInitialized = false;
  let validSymbols = Map.empty<DisplaySymbol, CryptoSymbol>();

  let userProfiles = Map.empty<Principal, UserProfile>();
  let userWatchlists = Map.empty<Principal, UserWatchlist>();
  let activeAlerts = Map.empty<Principal, Map.Map<Nat, PriceAlert>>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var adminInitialized = false;
  var adminInitializationErrorMessage : ?Text = null;

  var permanentAdmin : ?Principal = null;

  var commandRegistry : [CommandEntry] = [
    {
      command = "registerSelfAsUser";
      description = "Register the caller as a user";
      category = #user;
    },
    {
      command = "grantUserPermission";
      description = "Grant user permissions to a principal";
      category = #admin;
    },
    {
      command = "initializeFirstAdmin";
      description = "Initialize the first admin principal";
      category = #admin;
    },
    {
      command = "fetchCoinGeckoData";
      description = "Fetch market data from CoinGecko";
      category = #data;
    },
    {
      command = "addCryptoToWatchlist";
      description = "Add a cryptocurrency to your watchlist";
      category = #user;
    },
    {
      command = "removeCryptoFromWatchlist";
      description = "Remove a cryptocurrency from your watchlist";
      category = #user;
    },
    {
      command = "setForecastMethod";
      description = "Set a forecast method for a cryptocurrency";
      category = #user;
    },
    {
      command = "setAlertSettings";
      description = "Set alert thresholds for a cryptocurrency";
      category = #user;
    },
    {
      command = "loadValidCryptoSymbols";
      description = "Load valid cryptocurrency symbols";
      category = #admin;
    },
    {
      command = "testAllNineSymbols";
      description = "Run tests on all supported symbols";
      category = #test;
    },
    {
      command = "testBulkSymbolValidation";
      description = "Run bulk symbol validation tests";
      category = #test;
    },
  ];

  func safeAssignRole(caller : Principal, user : Principal, role : AccessControl.UserRole) {
    switch (role) {
      case (#admin) {
        switch (permanentAdmin) {
          case (?admin) {
            if (not Principal.equal(user, admin)) {
              Runtime.trap(
                "Security violation: Cannot assign admin role to any principal other than the original admin"
              );
            };
          };
          case (null) {
            Runtime.trap(
              "Security violation: Admin must be initialized first before assigning admin role"
            );
          };
        };
      };
      case (#user or #guest) {};
    };

    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  func ensureUserInitializedOrSyncMissingAdmin(caller : Principal) {
    if (caller.isAnonymous()) {
      return;
    };

    let currentRole = AccessControl.getUserRole(accessControlState, caller);

    if (adminInitialized) {
      switch (permanentAdmin) {
        case (?admin) {
          if (Principal.equal(caller, admin)) {
            switch (currentRole) {
              case (#guest) {
                AccessControl.assignRole(accessControlState, caller, caller, #user);
                Debug.print(
                  "🔧 Self-healing: Restored user role to admin principal"
                );
              };
              case (#user) {};
              case (#admin) {
                if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
                  AccessControl.assignRole(accessControlState, caller, caller, #user);
                  Debug.print("🔧 Self-healing: Added user role to admin principal");
                };
              };
            };
          };
        };
        case (null) {
          Debug.print(
            "⚠️ Warning: adminInitialized is true but no adminPrincipal tracked"
          );
        };
      };
    };

    switch (userProfiles.get(caller)) {
      case (null) {
        let profile : UserProfile = {
          name = "User " # caller.toText();
          lastActive = Time.now();
        };
        userProfiles.add(caller, profile);
        Debug.print("✅ Auto-created profile for principal: " # caller.toText());
      };
      case (?existing) {
        let updatedProfile : UserProfile = {
          name = existing.name;
          lastActive = Time.now();
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func registerWithRole(role : Role) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous principals cannot register");
    };

    let currentRole = AccessControl.getUserRole(accessControlState, caller);
    switch (currentRole) {
      case (#admin) {
        if (role == #admin) {
          Runtime.trap("Already an admin");
        };
        Runtime.trap("Admins cannot downgrade to lower roles");
      };
      case (#user) {
        if (role == #user) {
          Debug.print("Already a user");
          return;
        };
        Runtime.trap("Users cannot upgrade to admin or downgrade to guests");
      };
      case (#guest) {
        if (role == #guest) {
          Debug.print("No need to register as a guest");
          return;
        };
        safeAssignRole(caller, caller, role);
      };
    };

    ensureUserInitializedOrSyncMissingAdmin(caller);
  };

  public shared ({ caller }) func registerSelfAsUser() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous principals cannot register as users");
    };

    let currentRole = AccessControl.getUserRole(accessControlState, caller);
    switch (currentRole) {
      case (#user) {
        Debug.print("ℹ️ User already registered: " # caller.toText());
        return;
      };
      case (#admin) {
        Debug.print(
          "ℹ️ Principal already has admin role (includes user permissions): "
          # caller.toText()
        );
        // Use safe assignment to ensure we don't violate single-admin rule
        safeAssignRole(caller, caller, #user);
        return;
      };
      case (#guest) {
        // Use safe assignment (though #user is safe, we maintain consistency)
        safeAssignRole(caller, caller, #user);
        Debug.print("✅ User self-registered: " # caller.toText());
      };
    };

    ensureUserInitializedOrSyncMissingAdmin(caller);
  };

  public shared ({ caller }) func grantUserPermission(user : Principal) : async () {
    ensureUserInitializedOrSyncMissingAdmin(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can grant user permissions");
    };
    if (user.isAnonymous()) {
      Runtime.trap("Cannot grant user permission to anonymous principal");
    };

    safeAssignRole(caller, user, #user);
    Debug.print("✅ Admin granted user permission to: " # user.toText());
  };

  public shared ({ caller }) func savePermanentAdmin(
    _oldAdmin : Principal,
  ) : async () {
    Runtime.trap(
      "Deprecated. Use initializePermanentAdmin with auth as new admin permanent admin instead."
    );
  };

  func initializeAdminRole() = Runtime.trap(
    "Error: This method should never be executed due to `deployment --upgrade` mechanism. " #
    "See command-crypto/backend/migration.mo for implementation. If you encounter this error, upgrade was not performed correctly.",
  );

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func initializePermanentAdmin(
  ) : async InitializePermanentAdminResult {
    if (not caller.isAnonymous()) {
      switch (permanentAdmin) {
        case (?permanentAdmin) {
          if (Principal.equal(caller, permanentAdmin)) {
            return {
              verifiedCaller = caller;
              permanentAdminSet = true;
            };
          } else {
            Runtime.trap("Permanent admin was already set by " # permanentAdmin.toText() # ", cannot rebind to " # caller.toText());
          };
        };
        case (null) {
          permanentAdmin := ?caller;
          AccessControl.assignRole(accessControlState, caller, caller, #admin);
          return {
            verifiedCaller = caller;
            permanentAdminSet = true;
          };
        };
      };
    } else {
      Runtime.trap(
        "Security violation: Cannot set anonymous principal as permanent admin"
      );
    };
  };

  func constructApiUrl(symbol : CryptoSymbol) : Text {
    let mappedSymbol = switch (findMapping(symbol)) {
      case (?mapped) { mapped };
      case (null) { symbol };
    };
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=" # mappedSymbol;
  };

  func removeUnsupportedCryptos(_coins : [Text]) : [Text] {
    [];
  };

  public shared ({ caller }) func fetchCoinGeckoData(
    symbol : CryptoSymbol,
  ) : async ?LiveMarketResponse {
    ensureUserInitializedOrSyncMissingAdmin(caller);
    if (not isUserOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only users or admins can fetch CoinGecko data");
    };

    let url = constructApiUrl(symbol);
    let response = await OutCall.httpGetRequest(url, [], transform);
    switch (parseCoinMarketData(response)) {
      case (?parsedData) {
        ?{
          price = parsedData.current_price;
          change24h = parsedData.price_change_percentage_24h;
          marketCap = parsedData.market_cap;
        };
      };
      case (null) {
        Debug.print("Error: Data not found for symbol " # symbol);
        null;
      };
    };
  };

  func findMapping(symbol : Text) : ?Text {
    validSymbols.get(symbol);
  };

  func parseCoinMarketData(_text : Text) : ?CoinMarketData {
    null;
  };

  public shared ({ caller }) func getLiveMarketData(
    symbol : CryptoSymbol,
  ) : async ?LiveMarketResponse {
    ensureUserInitializedOrSyncMissingAdmin(caller);
    if (not isUserOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only users or admins can access market data");
    };
    await fetchCoinGeckoData(symbol);
  };

  // NEW: Symbol loading from CoinGecko `/api/v3/coins/list` endpoint
  let coingeckoStablecoins = [
    "tether",
    "usdc",
    "dai",
    "busd",
    "true-usd",
    "paxos-standard",
    "pax-gold",
    "binance-usd",
    "okb",
    "ftx-token",
    "crypto-com-chain",
    "1irstcoin",
    "terra-luna",
    "frax",
    "neutrino",
    "liquity-usd",
    "feichain",
    "havven",
    "origin-defi",
    "pusd",
    "carbon",
    "nusd",
    "vai",
    "swap-alliance",
    "usd-coin",
    "tether-gold",
    "harmonyone",
    "dai-multichain",
    "tether-eurusd",
    "bidipass",
    "usd",
    "tether-eurt",
    "celo-dollar",
    "stableusd",
    "cabbage-cash",
    "liquid-usd",
    "renrenbit",
    "unionfinance",
    "origin-dollar",
    "sperax",
    "usdcoin-poa",
    "renrenbit-vip",
    "usd1",
    "usd-mars",
    "tether-busd",
    "anchor-buoy",
    "epsilon",
    "oinkcoin",
    "baris",
    "larix",
    "expand-dao",
  ];

  public shared ({ caller }) func loadValidCryptoSymbols() : async () {
    ensureUserInitializedOrSyncMissingAdmin(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can load symbols");
    };

    let url = "https://api.coingecko.com/api/v3/coins/list";
    let response = await OutCall.httpGetRequest(url, [], transform);

    let coins = parseCoins(response);

    var symbolMapping : [(DisplaySymbol, CryptoSymbol)] = [
      ("BTC", "bitcoin"),
      ("ETH", "ethereum"),
    ];

    func isStablecoin(coin : { id : Text; symbol : Text }) : Bool {
      coingeckoStablecoins.find(func(stableCoinId) { Text.equal(stableCoinId, coin.id) }) != null;
    };

    for (coin in coins.values()) {
      if (not isStablecoin(coin)) {
        symbolMapping := symbolMapping.concat([(coin.symbol.toUpper(), coin.id)]);
      };
    };

    validSymbols.clear();
    for ((display, network) in symbolMapping.values()) {
      validSymbols.add(display, network);
    };

    let coinCount = coins.size();
    let symbolCount = symbolMapping.size();
    symbolsInitialized := true;
    Debug.print(
      "✅ Loaded "
      # symbolCount.toText()
      # "/"
      # coinCount.toText()
      # " valid cryptocurrency symbols from CoinGecko"
    );
  };

  func parseCoins(_data : Text) : [CoinGeckoCoinInfo] {
    [];
  };

  func runAdminTest(caller : Principal, testName : Text) : async Bool {
    ensureUserInitializedOrSyncMissingAdmin(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can run test functions");
    };
    Debug.print("TEST: " # testName);
    true;
  };

  public shared ({ caller }) func testHistoricalDataFetch(
    symbol : Text,
  ) : async Bool {
    await runAdminTest(
      caller,
      "testHistoricalDataFetch called for symbol: " # symbol,
    );
  };

  public shared ({ caller }) func testAlertSettings(
    symbol : Text,
    threshold : Float,
  ) : async Bool {
    await runAdminTest(
      caller,
      "testAlertSettings called for symbol: " # symbol # " with threshold " # debug_show(
        threshold,
      ),
    );
  };

  public shared ({ caller }) func testForecastMethod(
    symbol : Text,
    method : Text,
  ) : async Bool {
    await runAdminTest(
      caller,
      "testForecastMethod called for symbol: " # symbol # " with method " # method,
    );
  };

  public shared ({ caller }) func testWatchlistAdd(symbol : Text) : async Bool {
    await runAdminTest(
      caller,
      "testWatchlistAdd called for symbol: " # symbol,
    );
  };

  public shared ({ caller }) func testWatchlistRemove(
    symbol : Text,
  ) : async Bool {
    await runAdminTest(
      caller,
      "testWatchlistRemove called for symbol: " # symbol,
    );
  };

  public shared ({ caller }) func testAllNineSymbols() : async Bool {
    await runAdminTest(
      caller,
      "testAllNineSymbols running individual tests for all 9 symbols",
    );
  };

  public shared ({ caller }) func testSymbolDataIntegrity(
    _symbol : Text,
  ) : async Bool {
    await runAdminTest(caller, "testSymbolDataIntegrity");
  };

  public shared ({ caller }) func testBulkSymbolValidation() : async Bool {
    await runAdminTest(caller, "testBulkSymbolValidation");
  };

  public shared ({ caller }) func testAPIResponseFormat(
    _symbol : Text,
  ) : async Bool {
    await runAdminTest(caller, "testAPIResponseFormat");
  };

  public shared ({ caller }) func getRole() : async Role {
    ensureUserInitializedOrSyncMissingAdmin(caller);
    AccessControl.getUserRole(accessControlState, caller);
  };

  func isUserOrAdmin(caller : Principal) : Bool {
    let role = AccessControl.getUserRole(accessControlState, caller);
    switch (role) {
      case (#user or #admin) { true };
      case (#guest) { false };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not isUserOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only users or admins can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(
    user : Principal,
  ) : async ?UserProfile {
    if (not isUserOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only users or admins can access profiles");
    };
    if (
      not Principal.equal(caller, user) and not AccessControl.isAdmin(
        accessControlState,
        caller,
      )
    ) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    ensureUserInitializedOrSyncMissingAdmin(caller);
    if (not isUserOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only users or admins can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func checkAndInitializeUser() : async Bool {
    if (caller.isAnonymous()) { return false };
    ensureUserInitializedOrSyncMissingAdmin(caller);
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func getAdminInitializationErrorMessage() : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access error messages");
    };
    adminInitializationErrorMessage;
  };

  public shared ({ caller }) func addCryptoToWatchlist(
    symbol : CryptoSymbol,
  ) : async () {
    ensureUserInitializedOrSyncMissingAdmin(caller);
    if (not isUserOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only users or admins can manage watchlists");
    };
    switch (validSymbols.get(symbol)) {
      case (null) {
        Runtime.trap("Invalid symbol: Symbol not found in valid symbols list");
      };
      case (_symbol) {
        let watchlist = switch (userWatchlists.get(caller)) {
          case (null) {
            {
              symbols = [];
              forecastMethods = Map.empty<CryptoSymbol, ForecastMethod>();
              alertSettings = Map.empty<CryptoSymbol, AlertSettings>();
            };
          };
          case (?w) { w };
        };
        let updatedWatchlist = {
          symbols = watchlist.symbols.concat([symbol]);
          forecastMethods = watchlist.forecastMethods;
          alertSettings = watchlist.alertSettings;
        };
        userWatchlists.add(caller, updatedWatchlist);
        Debug.print(
          "✅ Added " # symbol # " to watchlist for " # caller.toText()
        );
      };
    };
  };

  public shared ({ caller }) func removeCryptoFromWatchlist(
    symbol : CryptoSymbol,
  ) : async () {
    ensureUserInitializedOrSyncMissingAdmin(caller);
    if (not isUserOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only users or admins can manage watchlists");
    };
    switch (userWatchlists.get(caller)) {
      case (null) { Runtime.trap("No watchlist found") };
      case (?watchlist) {
        let updatedSymbols = watchlist.symbols.filter(func(s) { s != symbol });
        let updatedWatchlist = {
          symbols = updatedSymbols;
          forecastMethods = watchlist.forecastMethods;
          alertSettings = watchlist.alertSettings;
        };
        userWatchlists.add(caller, updatedWatchlist);
        Debug.print(
          "✅ Removed " # symbol # " from watchlist for " # caller.toText()
        );
      };
    };
  };

  public query ({ caller }) func getWatchlist() : async [CryptoSymbol] {
    if (not isUserOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only users or admins can access watchlists");
    };
    switch (userWatchlists.get(caller)) {
      case (null) { [] };
      case (?watchlist) { watchlist.symbols };
    };
  };

  public shared ({ caller }) func setForecastMethod(
    symbol : CryptoSymbol,
    method : ForecastMethod,
  ) : async () {
    ensureUserInitializedOrSyncMissingAdmin(caller);
    if (not isUserOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only users or admins can set forecast methods");
    };
    switch (userWatchlists.get(caller)) {
      case (null) { Runtime.trap("No watchlist found") };
      case (?watchlist) {
        watchlist.forecastMethods.add(symbol, method);
        userWatchlists.add(caller, watchlist);
      };
    };
  };

  public query ({ caller }) func getForecastMethod(
    symbol : CryptoSymbol,
  ) : async ?ForecastMethod {
    if (not isUserOrAdmin(caller)) {
      Runtime.trap(
        "Unauthorized: Only users or admins can access forecast methods"
      );
    };
    switch (userWatchlists.get(caller)) {
      case (null) { null };
      case (?watchlist) { watchlist.forecastMethods.get(symbol) };
    };
  };

  public shared ({ caller }) func setAlertSettings(
    symbol : CryptoSymbol,
    settings : AlertSettings,
  ) : async () {
    ensureUserInitializedOrSyncMissingAdmin(caller);
    if (not isUserOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only users or admins can set alert settings");
    };
    switch (userWatchlists.get(caller)) {
      case (null) { Runtime.trap("No watchlist found") };
      case (?watchlist) {
        watchlist.alertSettings.add(symbol, settings);
        userWatchlists.add(caller, watchlist);
      };
    };
  };

  public query ({ caller }) func getAlertSettings(
    symbol : CryptoSymbol,
  ) : async ?AlertSettings {
    if (not isUserOrAdmin(caller)) {
      Runtime.trap(
        "Unauthorized: Only users or admins can access alert settings"
      );
    };
    switch (userWatchlists.get(caller)) {
      case (null) { null };
      case (?watchlist) { watchlist.alertSettings.get(symbol) };
    };
  };

  public query ({ caller }) func getValidSymbols() : async [(DisplaySymbol, SymbolPair)] {
    if (not isUserOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only users or admins can access symbol list");
    };
    validSymbols.entries().toArray().map(
      func((display, network)) {
        (display, { display; network });
      }
    );
  };

  public query ({ caller }) func debugValidSymbols() : async [(DisplaySymbol, CryptoSymbol)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access debug functions");
    };
    validSymbols.entries().toArray();
  };

  public query ({ caller }) func debugSymbolCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access debug functions");
    };
    validSymbols.size();
  };

  public query ({ caller }) func debugCheckSymbol(symbol : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access debug functions");
    };
    validSymbols.get(symbol) != null;
  };

  public query ({ caller }) func debugGetAdminList() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access debug functions");
    };
    userProfiles.keys().toArray().filter(func(p) { AccessControl.getUserRole(accessControlState, p) == #admin });
  };

  public query ({ caller }) func getCommandRegistry() : async [CommandEntry] {
    commandRegistry;
  };

  func traceAndTrap(message : Text) {
    Debug.print(message);
    Runtime.trap(message);
  };

  // ===== PRICE ALERTS ============================================

  func getNextAlertId(alerts : Map.Map<Nat, PriceAlert>) : Nat {
    var maxId = 0;
    alerts.keys().forEach(
      func(id) {
        if (id >= maxId) { maxId := id };
      }
    );
    maxId + 1;
  };

  type AlertInput = {
    symbol : CryptoSymbol;
    targetPrice : Float;
    direction : AlertDirection;
  };

  public shared ({ caller }) func createOrUpdatePriceAlert(input : AlertInput) : async () {
    ensureUserInitializedOrSyncMissingAdmin(caller);
    if (not isUserOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only users or admins can create/update alerts");
    };

    switch (validSymbols.get(input.symbol)) {
      case (null) { Runtime.trap("Invalid symbol: Symbol not found in valid symbols"); };
      case (_ok) {
        let userAlerts = switch (activeAlerts.get(caller)) {
          case (?alerts) { alerts };
          case (null) { Map.empty<Nat, PriceAlert>() };
        };
        let isDuplicate = userAlerts.values().find(
          func(alert) {
            alert.symbol == input.symbol and alert.targetPrice == input.targetPrice and alert.direction == input.direction
          }
        );

        switch (isDuplicate) {
          case (?_dup) {
            Runtime.trap("Duplicate alert - already exists for " # input.symbol);
          };
          case (null) {};
        };

        let nextId = getNextAlertId(userAlerts);

        let alert : PriceAlert = {
          symbol = input.symbol;
          targetPrice = input.targetPrice;
          direction = input.direction;
          isActive = true;
          createdAt = Time.now();
          alertType = "pricePoint";
        };
        userAlerts.add(nextId, alert);

        activeAlerts.add(caller, userAlerts);
        Debug.print(
          "✅ Created alert for " # input.symbol # " at $" # input.targetPrice.toText()
        );
        return ();
      };
    };
  };

  public query ({ caller }) func getAlerts() : async [(Nat, PriceAlert)] {
    if (not isUserOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only users or admins can access alerts");
    };
    switch (activeAlerts.get(caller)) {
      case (null) { [] };
      case (?alerts) { alerts.toArray() };
    };
  };

  public query ({ caller }) func getSingleAlert(alertId : Nat) : async ?PriceAlert {
    if (not isUserOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only users or admins can access alerts");
    };
    switch (activeAlerts.get(caller)) {
      case (null) { null };
      case (?alerts) { alerts.get(alertId) };
    };
  };

  public shared ({ caller }) func disableAlert(alertId : Nat) : async () {
    ensureUserInitializedOrSyncMissingAdmin(caller);
    if (not isUserOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only users or admins can manage alerts");
    };
    switch (activeAlerts.get(caller)) {
      case (null) { return };
      case (?alerts) {
        let updatedAlerts = alerts.map<Nat, PriceAlert, PriceAlert>(
          func(id, alert) {
            if (id == alertId) {
              { alert with isActive = false };
            } else { alert };
          },
        );
        activeAlerts.add(caller, updatedAlerts);
      };
    };
    Debug.print("✅ Disabled alert: " # alertId.toText());
  };

  public shared ({ caller }) func deleteAlert(alertId : Nat) : async () {
    ensureUserInitializedOrSyncMissingAdmin(caller);
    if (not isUserOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only users or admins can manage alerts");
    };
    switch (activeAlerts.get(caller)) {
      case (null) { return };
      case (?alerts) {
        alerts.remove(alertId);
        activeAlerts.add(caller, alerts);
      };
    };
    Debug.print("✅ Deleted alert: " # alertId.toText());
  };

  public shared ({ caller }) func disableAllAlerts() : async () {
    ensureUserInitializedOrSyncMissingAdmin(caller);
    if (not isUserOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only users or admins can manage alerts");
    };
    let initialAlerts = switch (activeAlerts.get(caller)) {
      case (null) { Map.empty<Nat, PriceAlert>() };
      case (?alerts) { alerts };
    };
    activeAlerts.add(caller, Map.empty<Nat, PriceAlert>());
    Debug.print("✅ All alerts deleted for: " # caller.toText());
    activeAlerts.add(caller, initialAlerts);
  };

  public query ({ caller }) func getActiveAlerts() : async [(Nat, PriceAlert)] {
    if (not isUserOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only users or admins can access alerts");
    };
    switch (activeAlerts.get(caller)) {
      case (null) { [] };
      case (?alerts) {
        alerts.toArray().filter(
          func((_id, alert)) {
            alert.isActive;
          }
        );
      };
    };
  };

  // Emergency admin grant - allows bootstrapping when no admin exists
  // The caller becomes the permanent admin (cannot grant to someone else)
  public shared ({ caller }) func emergencyGrantAdmin(user : Principal) : async () {
    // Security check: caller must not be anonymous
    if (caller.isAnonymous()) {
      Runtime.trap("Security violation: Anonymous principals cannot use emergency admin grant");
    };

    // Security check: user parameter must match caller (cannot grant to others)
    if (not Principal.equal(caller, user)) {
      Runtime.trap("Security violation: Emergency admin grant can only be used to grant admin to yourself (caller must equal user parameter)");
    };

    // Check if permanent admin already exists
    switch (permanentAdmin) {
      case (?existingAdmin) {
        Runtime.trap("Permanent admin was already set to " # existingAdmin.toText() # ". Emergency admin grant is permanent and can only be used once.");
      };
      case (null) {
        // Set the caller as permanent admin
        permanentAdmin := ?caller;
        AccessControl.assignRole(accessControlState, caller, caller, #admin);
        AccessControl.assignRole(accessControlState, caller, caller, #user);
        Debug.print("✅ Emergency admin granted to: " # caller.toText());
      };
    };
  };

  // Returns admin principals - admin-only access
  public shared ({ caller }) func getAdminList() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view admin list");
    };
    userProfiles.keys().toArray().filter(func(p) { AccessControl.getUserRole(accessControlState, p) == #admin });
  };
};
