import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";
import MixinAuthorization "authorization/MixinAuthorization";
import Debug "mo:core/Debug";
import Text "mo:core/Text";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  public type CryptoSymbol = Text; // "BTC", "ETH", "XRP" allowed

  let userProfiles = Map.empty<Principal, UserProfile>();

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

  func mapToApiId(symbol : Text) : ?Text {
    switch (symbol) {
      case ("BTC") { ?"bitcoin" };
      case ("ETH") { ?"ethereum" };
      case ("XRP") { ?"ripple" };
      case (_) { null };
    };
  };

  public shared ({ caller }) func getLiveMarketData(symbol : CryptoSymbol) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch live market data");
    };

    let apiId = switch (mapToApiId(symbol)) {
      case (?id) { id };
      case (null) {
        return "Unsupported symbol: " # symbol # ". Only BTC, ETH, and XRP supported.";
      };
    };

    let url = "https://api.coingecko.com/api/v3/simple/price?ids=" # apiId # "&vs_currencies=usd";
    await OutCall.httpGetRequest(url, [], transformRaw);
  };

  public shared ({ caller }) func debugFetchCoinGecko(symbol : CryptoSymbol) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can use debug functions");
    };

    let url = switch (buildCoinGeckoUrl(symbol)) {
      case (?url) {
        Debug.print("DEBUG: Fetching from: " # url);
        url;
      };
      case (null) {
        return "❌ Error: Could not build URL for symbol: " # symbol;
      };
    };

    await debugHttpRequest(url);
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

  public query func transformRaw(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func debugHttpRequest(url : Text) : async Text {
    let response = await OutCall.httpGetRequest(url, [], transformRaw);
    Debug.print("DEBUG: Raw HTTP response from URL: " # url # "\n" # response);
    response;
  };
};
