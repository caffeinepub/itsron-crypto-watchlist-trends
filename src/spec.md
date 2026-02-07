# Specification

## Summary
**Goal:** Prevent the app from getting stuck on “Connecting to backend” after site data is cleared, and improve Watchlist live tick error messaging for cycle-exhaustion failures.

**Planned changes:**
- Update the connection bootstrap flow to reliably re-discover/recreate the backend actor when cached configuration (e.g., backend canister ID) is missing after cache/cookies/storage clears.
- Add a time-bounded connection failure state (no infinite spinner) that shows an actionable English error screen within 45 seconds, including Retry Connection, Re-authenticate, and Refresh Page actions.
- Harden the actor initialization hook so actor-creation failures transition to an explicit error stage and propagate a meaningful Error message into the existing connection UI (ConnectionBootstrapper / ConnectionDetails).
- Improve Watchlist live price tick row error handling so IC “out of cycles” / IC0504 (or equivalent) displays a clear cycle-exhaustion message, while non-cycle failures show a generic, non-misleading error state; keep failures isolated per row.

**User-visible outcome:** After clearing site data and reloading while authenticated, the app either connects successfully or shows a clear error screen with recovery actions (instead of stalling). In the Watchlist, symbols that fail due to cycles exhaustion show an explicit “backend is out of cycles” message while other symbols continue to update normally.
