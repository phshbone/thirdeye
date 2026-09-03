# Third Eye — Smoke Test Baseline

Date: 2026-09-03
Branch: `cleanup-smoke-test`
Production target: `https://phshbone.github.io/thirdeye/`

## Primary classification

**FAIL — REPAIR REQUIRED**

The core Golf workflow is usable enough for field testing, but multiple state-management and interaction defects prevent this build from being treated as a stable baseline for the next feature phase.

## Confirmed working behavior

- App launches and renders.
- Golf mode loads satellite map, GPS marker, course HUD, wind display, controls, and bottom navigation.
- Multiple golf target flags can be placed and remain numbered in sequence during normal use.
- Per-target yardage is displayed and persisted in the visible target list during the active map session.
- Golf ball/coin action control is present.
- Club picker bottom sheet exists and can open.
- Shot log infrastructure exists in source.
- Course profiles and photo location profiles exist.
- Hunt mode is currently a Coming Soon placeholder.

## Confirmed defects / warnings from human field test

### High — ball/coin marker history is visually replaced
Dropping a later ball marker removes the previous visible marker. This prevents a visible shot trail and makes it difficult for the user to verify that prior shot locations remain represented.

Static confirmation: source currently stores a singleton `S.coinMarker` and explicitly removes it before creating the next marker.

### High — Golf → Photo mode leaves stale Golf marker state
Golf target pins clear when switching to Photo, but the Golf ball/coin marker can remain visible. The user had to force-close and restart to recover a clean Photo state.

### High — Photo interaction is not discoverable / currently unusable in field test
In Photo mode, repeated map taps produced no visible response. The intended interaction may still be drag-from-GPS rather than tap, but the live UI provides no clear affordance or tutorial, so the workflow is effectively undiscoverable and could not be completed during field testing.

### High — club picker opening is inconsistent in real use
The club drawer does not reliably remain open after every marker action. Source contains an outside-click handler that excludes only `e.target.id === 'coin-btn'`; tapping a child SVG element inside the coin button can therefore be interpreted as an outside click immediately after the sheet opens. This is a likely implementation cause and should be verified during repair.

### Medium — course switching does not isolate active map targets
Switching between `Pinchbrook` and `My Home Course` leaves the same map target pins visible. Course profile selection and live map target state are therefore not isolated.

### Medium — no Undo Last Target
Accidental target placement requires clearing all targets. Human field testing produced accidental flags, confirming a one-tap undo is needed.

### Medium — GPS drift
Small stationary drift (approximately a few feet during the observed test) was visible. This is expected for phone GPS but should be considered before using raw point-to-point measurements as authoritative caddy training data. Smoothing / confidence rules should be considered later.

### UX — top HUD consumes more map area than necessary
The separate large wind panel hangs below the course bar. A consolidated bench-style HUD remains the preferred cleanup direction.

## Product behavior to preserve

- Tap-first Golf target placement.
- Multiple simultaneous target flags.
- Numbered/color-separated targets with visible yardage list.
- Large current-position golf-ball marker.
- Bottom club picker pattern.
- One-handed, low-friction field workflow.
- Golf / Photo / Hunt visual language and bottom navigation.

## Repair priorities before feature expansion

1. Repair marker/state ownership between Golf and Photo.
2. Make ball-marker history durable while keeping only the current marker visually dominant; shrink prior markers into small breadcrumbs rather than deleting them.
3. Repair club picker event handling so it opens deterministically.
4. Add Undo Last Target.
5. Decide and implement target/course isolation behavior.
6. Make Photo mode interaction explicit and testable.
7. Consolidate the Golf HUD into the bench layout.
8. Re-run Smoke Test.
9. Run Live Smoke Test after the exact repaired revision is deployed.
10. Only then route the stabilized baseline through Puppet Master for the more efficient rebuild / next-phase architecture decision.

## Live Smoke Test readiness

A repository-owned Playwright/GitHub Actions harness has been added on `cleanup-smoke-test`:

- `package.json`
- `playwright.config.js`
- `tests/live-smoke.spec.js`
- `.github/workflows/smoke-test.yml`

The workflow includes exact deployed `index.html` identity checking. Once product code on this branch diverges from production, Live Smoke Test should correctly refuse to treat the old production deployment as evidence for the new branch. After merge/deployment, the same harness can verify the exact released build.
