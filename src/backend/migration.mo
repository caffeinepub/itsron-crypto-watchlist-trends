import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
