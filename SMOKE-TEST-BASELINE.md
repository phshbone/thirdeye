# Third Eye — Smoke Test Baseline

Date: 2026-09-03
Branch: `cleanup-smoke-test`
Production target: `https://phshbone.github.io/thirdeye/`

## Primary classification

**PASS — READY FOR HUMAN FIELD TEST**

The production build remains untouched on `main`. Cleanup is isolated on `cleanup-smoke-test`. The cleanup branch now passes the expanded Playwright regression suite in both desktop Chromium and iPhone-like Chromium after three repair/cleanup passes.

This is a cleanup-branch PASS, not yet a production release PASS. The branch still needs the user's real-device field test before merge/deployment.

## Confirmed working behavior

- App launches and renders.
- Golf mode loads satellite map, GPS marker, compact bench HUD, wind display, controls, and bottom navigation.
- Multiple Golf target flags can be placed beyond the old six-target limit and remain numbered in sequence.
- Per-target yardage is displayed in the visible target list.
- Undo Last removes only the most recent target.
- Course switching clears the prior course's live target state.
- The dime/ball-marker action appears automatically once GPS is available; re-tapping the Golf tab is no longer required.
- The club picker opens reliably even when the user's tap lands on the nested SVG inside the dime control.
- Previous shot markers are retained as small breadcrumbs instead of disappearing.
- Golf shot markers are hidden when entering Photo and restored when returning to Golf.
- Photo mode explicitly tells the user to drag from the lens marker to the subject.
- Photo drag-from-GPS measurement successfully creates a photo measurement pin.
- Shot log infrastructure remains present.
- Hunt mode remains a Coming Soon placeholder.

## Cleanup pass 1

- Removed the silent six-target reset that was clearing flags after target 6.
- Added one-tap **Undo Last**.
- Preserved previous ball/coin positions as small breadcrumb markers.
- Added explicit Golf/Photo shot-marker ownership.
- Repaired the club-sheet outside-click race using `closest()` so nested SVG taps are treated as dime-button taps.
- Cleared live target pins on golf-course switch.
- Added the Photo drag instruction toast.

## Cleanup pass 2

Playwright reproduced two additional real-device findings:

1. Clear Pins could remain visually present because an inline `display:block` survived after its class was removed.
2. The dime/coin action remained hidden after first GPS lock because `updateCoinBtn()` was called on tab changes but not on initial GPS availability.

Repairs:

- `onGPS()` now synchronizes dime-button visibility as soon as location is available.
- `clearPins()` now clears both CSS class and inline display state for Clear Pins and Undo Last.

After these repairs, the 8-check regression suite passed completely.

## Cleanup pass 3 — visual/UI cleanup

- Replaced the old large Golf wind panel with the compact **bench HUD**:
  - course name across the top bar;
  - compact wind/compass tab hanging below on the left;
  - equal switch-course tab hanging below on the right.
- Reworked the action control from the large gold coin into a smaller silver dime-style control.
- Reworked the current shot marker into a silver dime-style marker.
- Reworked historical shot breadcrumbs into smaller silver markers so the shot trail remains visible without dominating the map.
- Added accessible label `Drop ball marker` to the dime action.

## Final browser verification

Smoke Test Action run `33809193672` on commit `2b8085b7e758a93718506a37380333b03aa0972d` completed successfully.

The suite executes four workflows in both desktop Chromium and iPhone-like Chromium (8 checks total):

1. Shell, compact bench HUD, and Golf/Photo state ownership.
2. More-than-six target placement, Undo Last, and course-target isolation.
3. Dime-button nested-SVG tap, club-drawer persistence, historical breadcrumb creation, and Golf-marker hiding in Photo.
4. Photo-mode drag measurement and photo pin creation.

**Result: 8/8 PASS.**

## Test architecture

Repository-owned browser harness:

- `package.json`
- `playwright.config.js`
- `tests/live-smoke.spec.js`
- `.github/workflows/smoke-test.yml`

For `cleanup-smoke-test`, GitHub Actions serves the exact branch checkout on a local HTTP preview and drives it with Playwright in desktop and iPhone-like Chromium. This provides browser-level second-eye testing before the public site changes.

For `main`, the workflow verifies that the public GitHub Pages `index.html` exactly matches the tested commit before running Live Smoke Test against `https://phshbone.github.io/thirdeye/`.

## Remaining non-blocking items / next phase

- Real-device visual judgment of the bench HUD and dime sizing.
- Real walking/GPS field verification of breadcrumb behavior and club-drawer flow.
- GPS confidence/smoothing before Personal Caddy treats short movements as authoritative training data.
- NEW HOLE, hole-by-hole logging, and Personal Caddy learning remain next-phase product work, not cleanup work.
- Hunt remains Coming Soon pending product decision.

## Gate before Puppet Master

1. **Current:** cleanup branch browser regression suite passes.
2. **Current:** bench HUD and dime cleanup are applied and regression-tested.
3. **Next:** human field test the stabilized cleanup build on a real phone.
4. Accept or repair any real-device findings.
5. Merge/deploy only after the cleanup baseline is accepted.
6. Run exact-deployed Live Smoke Test on `main`.
7. Then route the stabilized baseline through Puppet Master for the more efficient next-phase build and Personal Caddy architecture.
