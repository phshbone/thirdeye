# Third Eye — Smoke Test Baseline

Date: 2026-09-03
Branch: `cleanup-smoke-test`
Production target: `https://phshbone.github.io/thirdeye/`

## Primary classification

**FAIL — REPAIR REQUIRED**

The current production build is usable enough for field testing, and the new Live Smoke Test harness itself is now verified working. Product-level state and interaction defects still need cleanup before this branch becomes the new stable baseline.

## Confirmed working behavior

- App launches and renders.
- Golf mode loads satellite map, GPS marker, course HUD, wind display, controls, and bottom navigation.
- Multiple golf target flags can be placed and remain numbered in sequence up to the current hard-coded limit.
- Per-target yardage is displayed and persists in the visible target list during the active map session.
- Golf ball/coin action control is present.
- Club picker bottom sheet exists and can open.
- Shot log infrastructure exists in source.
- Course profiles and photo location profiles exist.
- Hunt mode is currently a Coming Soon placeholder.

## Confirmed defects / warnings from human field test + source inspection

### High — target list silently clears after six targets
Field testing appeared to lose flags unexpectedly. Source inspection found the exact cause: `dropPin()` executes `clearPins()` when the next target number would exceed 6. This is not an accidental Clear Pins tap. The hard-coded six-target reset must be removed or replaced with an explicit, intentional limit.

### High — ball/coin marker history is visually replaced
Dropping a later ball marker removes the previous visible marker. Source stores a singleton `S.coinMarker` and explicitly removes it before creating the next marker. Cleanup direction: preserve every recorded shot location, keep the current marker visually dominant, and shrink previous markers into small breadcrumbs.

### High — Golf → Photo mode leaves stale Golf shot-marker state
Golf target pins clear during a Golf → Photo switch, but the separate Golf coin/shot marker is not part of `clearPins()` and can remain. The shared GPS marker is redrawn for Photo, while Golf shot-marker state survives independently. Mode ownership needs to be explicit.

### High — Photo interaction is undiscoverable
Repeated map taps in Photo mode do nothing by design: `onMapTap()` currently accepts Golf/Hunt only. Photo uses drag-from-GPS-marker measurement. The live UI does not explain that interaction, so a human tester reasonably interpreted the mode as broken after repeated taps. Cleanup must either expose the drag affordance clearly or intentionally adopt a tap-first Photo workflow.

### High — club picker can immediately close after coin-button child tap
The outside-click handler excludes only `e.target.id === 'coin-btn'`. A tap landing on the SVG/circle/text inside that button has a different event target and can therefore be treated as an outside click after the sheet opens. This matches the field report that the drawer opens inconsistently.

### Medium — course switching does not isolate active target state
Switching between `Pinchbrook` and `My Home Course` leaves the same live targets visible because `cycleCourse()` changes only the active course/profile and club data. Map targets currently belong to the session, not the course.

### Medium — no Undo Last Target
Accidental target placement requires clearing all targets. Field testing produced accidental flags. Add a one-tap Undo Last Target before expanding the feature set.

### Medium — small GPS drift
A stationary drift of roughly a few feet was observed. This is normal phone-GPS behavior, but raw point-to-point movement should eventually have confidence/smoothing rules before becoming authoritative Personal Caddy training data.

### UX — top HUD consumes more map area than necessary
The separate wind panel hangs below the course bar. The consolidated bench-style HUD remains the cleanup direction.

## Product behavior to preserve

- Tap-first Golf target placement.
- Multiple simultaneous target flags.
- Numbered/color-separated targets with visible yardage list.
- Large current-position golf-ball marker.
- Bottom club picker pattern.
- One-handed, low-friction field workflow.
- Golf / Photo / Hunt visual language and bottom navigation.

## Repair priorities before feature expansion

1. Remove the silent six-target reset.
2. Repair Golf/Photo marker and state ownership.
3. Preserve shot-marker history as small breadcrumbs.
4. Repair club-picker event handling so it opens deterministically.
5. Add Undo Last Target.
6. Decide and implement course-target isolation behavior.
7. Make Photo interaction explicit and testable.
8. Consolidate the Golf HUD into the bench layout.
9. Re-run Smoke Test and Live Smoke Test against the exact repaired build.
10. Human field test the stabilized branch.
11. Then route the stabilized baseline through Puppet Master for the more efficient next-phase build.

## Live Smoke Test status

Repository-owned Playwright/GitHub Actions harness on `cleanup-smoke-test`:

- `package.json`
- `playwright.config.js`
- `tests/live-smoke.spec.js`
- `.github/workflows/smoke-test.yml`

### First run
**FAIL — HARNESS DEFECT, not product evidence.**

Playwright used `page.goto('/')` while the configured GitHub Pages base URL was a project site (`/thirdeye/`). The leading slash resolved to `https://phshbone.github.io/`, producing the GitHub Pages 404 page. The exact-deployment identity check had already succeeded, which helped isolate the failure to browser navigation rather than deployment.

### Harness repair
Changed browser navigation to the project-relative `page.goto('./')` so the `/thirdeye/` path is preserved.

### Verification run
**PASS.** Run 3 completed successfully on commit `93a9721a77a0292710a099c52d3ac8e4f475ae04` in both desktop Chromium and iPhone-like Chromium. Checkout, dependency install, Playwright Chromium install, exact deployed-build verification, browser smoke tests, and report upload all passed.

This verifies that Live Smoke Test itself is operational. It does **not** reclassify the product baseline as PASS; the confirmed field-test defects above remain the cleanup targets.
