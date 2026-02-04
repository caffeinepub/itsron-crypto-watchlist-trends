# Specification

## Summary
**Goal:** Add backend-only admin bootstrapping and admin verification canister methods callable via `dfx`.

**Planned changes:**
- In `backend/main.mo`, add a public shared canister method `emergencyGrantAdmin(user : Principal) : async ()` to grant the specified principal both `admin` and `user` permissions for bootstrap.
- Ensure `emergencyGrantAdmin` binds the permanent admin only once: if a permanent admin is already set, prevent using this method to make a different principal the permanent admin.
- Add a public canister method `getAdminList` that returns the list of admin principals.
- Protect `getAdminList` so only admins can call it successfully.

**User-visible outcome:** The operator can run `dfx canister call itsron_crypto_backend emergencyGrantAdmin '(principal "<principal>")'` to bootstrap permanent admin+user access, and then run `dfx canister call itsron_crypto_backend getAdminList` (as an admin) to verify the principal is in the admin list.
