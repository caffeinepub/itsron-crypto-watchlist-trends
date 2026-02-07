import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";
import MixinAuthorization "authorization/MixinAuthorization";
import Text "mo:core/Text";
import Migration "migration";
import Nat "mo:core/Nat";
import Cycles "mo:core/Cycles";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  public type CryptoSymbol = Text; // "BTC", "ETH", "XRP" allowed

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Cycle threshold for safe outcalls (currently set to 100B)
  var outcallThresholdCycles : Nat = 100_000_000_000;

  public type OutcallCycleStatus = {
    currentBalance : Nat;
    threshold : Nat;
    status : Text;
  };

  // Get current cycle balance in Nats
  public query ({ caller }) func getCycleBalance() : async Nat {
    Cycles.balance();
  };

  // Check if cycle balance is above threshold
  public shared ({ caller }) func checkCyclesSafeForOutcall() : async Bool {
    Cycles.balance() > outcallThresholdCycles;
  };

  // Get detailed outcall cycle status
  public shared ({ caller }) func getOutcallCycleStatus() : async OutcallCycleStatus {
    let balance = Cycles.balance();

    let status = if (balance > outcallThresholdCycles) {
      "✅ Sufficient cycles for safe outcalls";
    } else if (balance > (outcallThresholdCycles / 2)) {
      "⚠️ Warning: Cycle balance below threshold";
    } else {
      "❌ Critical: Outcalls not possible, immediate top-up required";
    };

    {
      currentBalance = balance;
      threshold = outcallThresholdCycles;
      status;
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  func buildCoinGeckoUrl(symbol : CryptoSymbol) : ?Text {
    func baseUrl(id : Text) : Text {
      "https://api.coingecko.com/api/v3/simple/price?ids=" # id # "&vs_currencies=usd";
    };

    switch (symbol) {
      case ("BTC") { ?baseUrl("bitcoin") };
      case ("ETH") { ?baseUrl("ethereum") };
      case ("XRP") { ?baseUrl("ripple") };
      case (_) { null };
    };
  };

  public shared ({ caller }) func getLiveMarketData(symbol : CryptoSymbol) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch live market data");
    };

    let url = switch (buildCoinGeckoUrl(symbol)) {
      case (?url) { url };
      case (null) {
        return "❌ Unsupported symbol: " # symbol # ". Only BTC, ETH, and XRP are supported.";
      };
    };

    if (not (await checkCyclesSafeForOutcall())) {
      let currentBalance = await getCycleBalance();
      Runtime.trap(
        "❌ Canister not enough cycles for outcall (threshold: "
        # outcallThresholdCycles.toText()
        # " cycles, current balance: "
        # currentBalance.toText()
        # " cycles). Contact admin for top up! See `getOutcallCycleStatus()` for details.\n ",
      );
    };

    await OutCall.httpGetRequest(url, [], transformRaw);
  };

  public query func transformRaw(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func debugFetchCoinGecko(symbol : CryptoSymbol) : async Text {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can fetch debug data");
    };

    switch (buildCoinGeckoUrl(symbol)) {
      case (null) {
        "❌ Unsupported symbol: " # symbol # ". Only BTC, ETH, and XRP are supported.";
      };
      case (?url) {
        if (not (await checkCyclesSafeForOutcall())) {
          let currentBalance = await getCycleBalance();
          Runtime.trap(
            "❌ Canister not enough cycles for outcall (threshold: "
            # outcallThresholdCycles.toText()
            # " cycles, current balance: "
            # currentBalance.toText()
            # " cycles). Contact admin for top up! See `getOutcallCycleStatus()` for details.\n ",
          );
        };
        await OutCall.httpGetRequest(url, [], transformRaw);
      };
    };
  };
};
