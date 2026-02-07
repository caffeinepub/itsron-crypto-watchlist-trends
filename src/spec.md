# Specification

## Summary
**Goal:** Prevent CoinGecko HTTPS outcalls from failing due to canister cycle exhaustion and provide in-app cycle diagnostics plus clearer cycle-related UI errors.

**Planned changes:**
- Add backend cycle-safety guards for CoinGecko outcalls in `getLiveMarketData(symbol)` and `debugFetchCoinGecko(symbol)` that skip the outcall when cycles are below a configured threshold and return a deterministic English low/out-of-cycles error message.
- Add backend cycle diagnostics methods: a query for current cycle balance and a structured cycle status payload (balance + threshold + English status/message) callable from the existing frontend actor.
- Add Backend Tester commands (in `frontend/src/utils/backendTesterCommands.ts`) to fetch and print cycle balance/status in the existing `SimulatedBashPanel` output.
- Update Dashboard crypto card error handling so errors containing “out of cycles” / “IC0504” show a concise English message indicating cycle exhaustion and that live data is unavailable until an admin tops up cycles.

**User-visible outcome:** When the canister is low/out of cycles, live market data and debug fetches fail fast with a clear cycles message (without attempting the outcall), the app provides a tester command to view cycle balance/status in-app, and crypto cards show an understandable cycle-exhaustion error for IC0504/out-of-cycles failures.
