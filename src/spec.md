# Specification

## Summary
**Goal:** Make the Backend Tester output panel reliably scrollable and correct the UI messaging so it accurately reflects which commands are live vs demo.

**Planned changes:**
- Fix the Backend Tester bottom output panel scrolling so overflow output can be scrolled via mouse wheel/trackpad, scrollbar drag, and touch, in both normal and maximized window states.
- Ensure the output area is the intended scroll container (avoid parent overflow/height constraints that prevent scrolling).
- Preserve auto-scroll behavior: keep auto-scrolling only when the user is at the bottom; do not force-scroll when the user scrolls up until they return to bottom.
- Update Backend Tester informational text and command definitions to remove misleading “demo mode” wording when live backend calls are used.
- Clearly indicate per-command status (Live for actor/canister calls, Demo for mock-returning commands) and keep wording consistent between the command list and any banner/note.
- Remove or correct any user-facing references to API sources (e.g., “Kraken API”) that are not actually used by the command implementation.

**User-visible outcome:** The Backend Tester output panel scrolls reliably in all window states, and the tester clearly shows which commands are Live vs Demo without contradictory or misleading “demo mode” messaging.
