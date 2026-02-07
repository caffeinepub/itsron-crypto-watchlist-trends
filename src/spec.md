# Specification

## Summary
**Goal:** Replace the Watchlist “Live Price Ticks” placeholder with a working UI that fetches and displays live crypto price ticks for a small, deterministic set of supported symbols.

**Planned changes:**
- Update `frontend/src/components/WatchlistPriceTicks.tsx` to remove the hard-coded “Coming Soon” `Alert` and render a list UI of symbols with per-row loading and formatted USD price.
- For each displayed symbol, fetch live data via the existing `useGetLiveMarketData(symbol)` hook and parse/format results using `parseCoinGeckoResponse()` from `frontend/src/utils/coinGeckoMarketData.ts`.
- Add robust error handling so any hook error (including cycle exhaustion) produces a clear English error message within the card without crashing, and ensure no user-facing text mentions “Demo Mode”.
- Wire `WatchlistPriceTicks` into `frontend/src/pages/Dashboard.tsx` by passing an explicit, deterministic list of supported symbols (BTC/ETH/XRP) and adjust the card header/subtitle copy to be accurate and non-misleading (not implying a backend watchlist is being loaded).

**User-visible outcome:** The Dashboard’s “Live Price Ticks” card shows live price rows (e.g., BTC/ETH/XRP) with loading states and formatted USD prices, and displays a clear in-card error message if live data cannot be fetched.
