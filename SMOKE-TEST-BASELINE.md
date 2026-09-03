# Third Eye — Smoke Test Baseline

Date: 2026-09-03
Branch: `cleanup-smoke-test`
Production target: `https://phshbone.github.io/thirdeye/`

## Primary classification

**FAIL — REPAIR IN PROGRESS**

The production build remains untouched on `main`. Cleanup is isolated on `cleanup-smoke-test`. The repository-owned Playwright harness is operational, and cleanup-branch browser testing now runs against an exact local preview of the checked-out branch while production Live Smoke Test remains reserved for the exact deployed `main` revision.

## Confirmed working behavior

- App launches and renders.
- Golf mode loads satellite map, GPS marker, course HUD, wind display, controls, and bottom navigation.
- Multiple golf target flags can be placed and remain numbered in sequence.
- Per-target yardage is displayed in the visible target list.
- Golf ball/coin action control exists.
- Club picker bottom sheet exists.
- Shot log infrastructure exists in source.
- Course profiles and photo location profiles exist.
- Photo drag-from-GPS measurement works when the intended gesture is used.
- Hunt mode remains a Coming Soon placeholder.

## Cleanup pass 1 — applied

The first repair pass changed only the cleanup branch and addressed field-test defects directly:

- Removed the silent six-target reset that was clearing flags after target 6.
- Added one-tap **Undo Last** for accidental target placement.
- Preserved previous ball/coin positions as small breadcrumb markers instead of deleting them.
- Added explicit Golf/Photo shot-marker ownership so Golf shot markers are hidden in Photo mode and restored in Golf.
- Repaired the club-sheet outside-click logic to recognize taps on SVG children inside the coin button.
- Cleared live target pins on golf-course switch so one course's active targets do not bleed into another course.
- Added an explicit Photo-mode instruction toast: drag from the lens marker to the subject.

## Expanded Playwright result after cleanup pass 1

The new regression suite runs four behaviors in both desktop Chromium and iPhone-like Chromium (8 checks total).

**Passed:**

- Critical shell and Golf/Photo switching.
- Photo instruction is visible.
- Photo's intended drag gesture successfully creates a photo measurement pin.
- More than six Golf targets can now be created; the old silent reset did not recur.
- Undo reduced the target count correctly before the later visibility assertion failed.

**Failures exposed by Playwright:**

1. `clearPins()` removed the button's CSS class but an inline `display:block` remained, so the Clear Pins control could stay visibly present after targets were gone.
2. The coin action button was still hidden immediately after first GPS lock. This exactly reproduces the human-test discovery that tapping the Golf tab was required before the coin control appeared. `updateCoinBtn()` was only being called during tab switching, not when GPS first became available.

These were product defects, not test-harness defects.

## Cleanup pass 2 — applied

- `onGPS()` now synchronizes the coin button as soon as location is available, removing the need to re-tap Golf after launch.
- `clearPins()` now clears both CSS classes and inline display state for Clear Pins and Undo Last, preventing stale controls after a course switch or clear action.

The next automated run is intended to exercise the same 8 regression checks again against the repaired cleanup branch.

## Remaining cleanup targets

- Verify the club drawer remains open when the nested SVG inside the coin button receives the tap.
- Verify breadcrumb creation and Golf→Photo hiding now that the coin control is available immediately after GPS lock.
- Consolidate the Golf HUD into the compact bench layout after functional repairs are green.
- Review the coin/dime visual treatment after behavior is stable.
- Keep GPS drift as a later confidence/smoothing concern rather than blocking this cleanup.

## Product behavior to preserve

- Tap-first Golf target placement.
- Multiple simultaneous target flags.
- Numbered/color-separated targets with visible yardage list.
- Large current-position golf-ball marker.
- Bottom club picker pattern.
- One-handed, low-friction field workflow.
- Golf / Photo / Hunt visual language and bottom navigation.

## Test architecture

Repository-owned browser harness:

- `package.json`
- `playwright.config.js`
- `tests/live-smoke.spec.js`
- `.github/workflows/smoke-test.yml`

For `cleanup-smoke-test`, GitHub Actions serves the exact branch checkout on a local HTTP preview and drives it with Playwright in desktop and iPhone-like Chromium. This gives browser-level second-eye testing before merge without replacing the public production app.

For `main`, the workflow verifies that the public GitHub Pages `index.html` exactly matches the tested commit before running Live Smoke Test against `https://phshbone.github.io/thirdeye/`.

## Gate before Puppet Master

1. Cleanup branch browser regression suite passes.
2. Bench HUD cleanup is applied and regression-tested.
3. Human field test on the stabilized build.
4. Merge/deploy only after the cleanup baseline is accepted.
5. Run exact-deployed Live Smoke Test on `main`.
6. Then route the stabilized baseline through Puppet Master for the more efficient next-phase build and Personal Caddy architecture.
