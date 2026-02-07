import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

module {
  public func run(old : {
    userProfiles : Map.Map<Principal, { name : Text }>;
  }) : {
    userProfiles : Map.Map<Principal, { name : Text }>;
    validSymbols : Map.Map<Text, Text>;
    userWatchlists : Map.Map<Principal, Map.Map<Text, Text>>;
  } {
    let validSymbols = Map.fromIter(
      ["BTC", "ETH", "XRP"].values().map(
        func(symbol) { (symbol, symbol) }
      )
    );
    { old with validSymbols; userWatchlists = Map.empty() };
  };
};
