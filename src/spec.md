# Specification

## Summary
**Goal:** Deploy and validate an admin-only CoinGecko debug fetch in the backend canister, and align live market data fetching with the same URL-building logic for BTC/ETH/XRP.

**Planned changes:**
- Add an admin-only `debugFetchCoinGecko(symbol : CryptoSymbol) : async Text` backend method that returns the raw CoinGecko HTTP response body for BTC/ETH/XRP and returns the exact error text `❌ Error: Could not build URL for symbol: <SYMBOL>` when the URL cannot be built.
- Refactor `getLiveMarketData(symbol : CryptoSymbol)` to use shared CoinGecko URL-building logic (`buildCoinGeckoUrl(symbol)`) and provide deterministic, non-trapping unsupported-symbol error handling.
- Add developer documentation with the exact `dfx` deploy and call commands to test `debugFetchCoinGecko` for BTC, ETH, and XRP against canister `itsron_crypto_backend`.

**User-visible outcome:** An admin can call `debugFetchCoinGecko` via `dfx` to see raw CoinGecko responses for BTC/ETH/XRP, and authorized users can call `getLiveMarketData` with consistent URL handling and clear unsupported-symbol errors.
