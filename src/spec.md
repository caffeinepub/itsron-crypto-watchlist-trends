# Specification

## Summary
**Goal:** Replace the “Add Crypto” placeholder with a live, searchable Symbol Picker powered by backend `validSymbols`, and persist a per-user watchlist that updates the dashboard immediately after adds.

**Planned changes:**
- Backend: Add a `validSymbols` map in `backend/main.mo` and expose an authenticated read method (e.g., `getValidSymbols()`).
- Backend: Persist a per-user watchlist in canister state and add authenticated mutations/read endpoints (`addCryptoToWatchlist(symbol)` and `getWatchlist()`), including idempotent adds and invalid-symbol errors.
- Frontend: Replace stubbed React Query hooks in `frontend/src/hooks/useQueries.ts` with live backend calls for valid symbols, watchlist, and add-to-watchlist; gate queries/mutations on actor availability and Internet Identity initialization, and invalidate watchlist on successful add.
- Frontend: Create a reusable `SymbolPicker` component with a search input and a scrollable, case-insensitive in-memory filtered list with an English empty state.
- Frontend: Update `AddCryptoDialog.tsx` to remove the demo/placeholder message, fetch and display symbols from the backend, handle loading/error states, and trigger the add-to-watchlist mutation with clear in-flight feedback and success behavior.
- Frontend: Update `Dashboard.tsx` to source watchlist tick symbols from the backend watchlist (not hard-coded) so the watchlist display refreshes after adding a coin without a full reload.

**User-visible outcome:** Signed-in users can open “Add Crypto”, search and select from a live symbol list fetched from the backend, add a coin to their personal watchlist, and see the dashboard watchlist update immediately and persist across refreshes.
