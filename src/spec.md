# Specification

## Summary
**Goal:** Add a CoinGecko raw-response debug endpoint and ensure `getLiveMarketData` supports BTC/ETH/XRP using consistent URL-building logic, without impacting existing user-profile authorization behavior.

**Planned changes:**
- Add `debugFetchCoinGecko(symbol : CryptoSymbol) : async Text` to `backend/main.mo` that builds the CoinGecko URL, performs an HTTP GET outcall, logs `Fetching:` + `Raw response:`, and returns the raw response body as `Text` (or `Error: Could not build URL` when URL creation fails).
- Ensure `getLiveMarketData(symbol : CryptoSymbol)` is exposed in the backend candid interface and callable for `("BTC")`, `("ETH")`, and `("XRP")`, using the same CoinGecko URL-building logic as the debug endpoint.
- Preserve existing profile methods and access control behavior in `backend/main.mo` while adding the new crypto endpoints.

**User-visible outcome:** Developers can call `debugFetchCoinGecko("BTC"|"ETH"|"XRP")` to retrieve CoinGecko’s raw response and can call `getLiveMarketData` for BTC/ETH/XRP without method-not-found errors, enabling consistent debugging of live market data issues.
