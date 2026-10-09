# peachy-keen performance: handover

State on 2026-10-09, master `7cf7e562` (deployed, standalone repo synced).

## Why this work exists

On the owner's iPhone 17 Pro (Chrome) the game got laggy and hot: in the Orchard after buying plants, on the Ripen tab, in disco (audio crackled), and on the burst. All the work below targets that. The owner judges look and feel on the phone and rejects changes that break immersion.

## How to measure

`npm run perf` (see the top of `run.mjs` for options). It compares the working tree with `origin/master` in six scenes (shop closed, Orchard, Ripen, busy room, disco, burst) in headless Chrome with a 4x slower CPU. It fails on worse frame time (re-measured before it counts), forced layouts per frame, draw calls (loose limit), audio nodes per second and long frames.

- Merge the latest `origin/master` right before a run. Commits that only the base has show up as false differences.
- `PERF_DEBUG=1` prints the stack of every forced layout. Today that found two new per-frame reads on master within hours.
- Draw calls vary with which helpers are on screen. Frame times vary between page loads. Trust repeated runs and in-page on/off comparisons, not one load.
- Mac numbers are relative. A phone GPU spends more time on pixels, so GPU savings on the Mac understate the phone gain.

## Rules that keep it fast

- Never read layout in frame code: no `window.innerWidth/innerHeight`, `getBoundingClientRect`, `offset*`, `getComputedStyle` per frame. In Chrome each one forces a full style and layout, including hidden panel content. Use `viewWidth()` / `viewHeight()` from `util.js`, the shared `sheet` object, `ResizeObserver` caches, or values the code already computed (for example `bottle.homeBox()`).
- Do not animate `box-shadow`, `filter` or SVG children for long-running effects. Crossfade fixed layers with `opacity` (see `.node-glow` in `idle.css`).
- Lights: the mood group and the disco group switch separately. A light combination draws only if its shader variant was warmed at load (`warmedLights` in `util.js`, `idle.lightStates()`); otherwise all lights stay on. Extras warm only the warmed combinations (`kit.js`).
- Hidden or fully transparent objects should be `visible = false`, not opacity 0.
- With the shop open the scene draws only above the sheet (scissor), at 0.6x resolution when the sheet is full height, and at half rate while nothing is touched (`main.js` frame loop). Any touch, pour, grab, burst or disco gives full rate at once.

## Done today (2026-10-09)

Commits `e41295c4`, `792d85d2`, `7cf7e562` and the merges around them. Measured with a 4x slower CPU:

- Intro fill worker posted a message every frame all session: now terminated after the intro.
- Per-frame layout reads removed everywhere (panel, hints, bottle, pit flights, Ryokan tag, mood spots): forced layouts per frame 1.1 to 0. Orchard 12.3 to 6.3 ms, Ripen 12.6 to 5.8 ms.
- Ripen ready-node glow and star twinkle no longer repaint.
- Lens drops drawn on the GPU into a render target (was a full canvas upload per frame).
- Raycasts: grouped chunk boxes, nearest first, early exit by far bound. 2x faster, checked against brute force.
- Disco: notes scheduled 0.3 s ahead, reverb built once, the 8-bar song pre-rendered once (`OfflineAudioContext`) and looped. Audio nodes per second about 150 to 0.
- Burst: half-peach fabric skipped without lingerie; resolution governor holds through a charge.
- iOS: `createRenderer()` retries simpler settings when the context arrives lost; `DeviceMotionEvent` guard for http.
- Reader: a reading waits until its cards are baked (crashed on slow, busy phones).

Per-helper cost alone is now close to an empty room (2.0 ms empty, 1.7 to 3.0 ms per helper). All helpers together: 5.4 ms.

## Tried and rejected (do not redo without a new reason)

- Disco ball shadow off: no measurable gain.
- Half-rate disco smoke: beams stutter on the beat, 4%.
- Simpler extras with the shop open (no shadows): shadows vanish while pouring.
- Always half-rate 3D with the shop open: choppy pour and grab. Replaced by calm half-rate.
- Counting helper hits as activity for calm half-rate: in a busy room it never drops to half rate.
- Simpler peach shading (no sheen or clearcoat): 4 to 9%, visible.
- Bounded oil raycast: no gain (the grouped raycast later fixed it).
- Pausing CSS animations of the closed panel: no gain once layout reads were gone.

## Open ideas, most promising first

1. All-helpers room (5.4 ms): spread over three.js scene upkeep. `updateMatrixWorld` walks about 400 objects, 165 inside hidden groups. Skipping hidden subtrees is risky: code reads world matrices of hidden objects.
2. One-time stutters: the Reader's first appearance (about 1 s on the Mac) and buying many helpers at once. Look at shader warm-up per extra (`kit.js warm`).
3. Smacking costs about 3 ms extra, mostly the "+juice" pop-up DOM. Pool the pop-up elements.
4. Shock pass (heat above 0.65) copies the whole frame every frame. Share one frame copy with the lens when both are active.
5. Shadow map: 1024 PCFSoft while the bottle is carried or in disco. Try 512 or PCF on phones, then judge the look.

## Testing on the owner's iPhone

- Serve the dev server: `npx vite --host --port <free port>`. Production preview builds failed to get WebGL on the phone. Check the port is free first (`lsof -iTCP:<port>`); other sessions run servers too.
- Use a link with `?mode=idle`, which opens the mode with the shop. A new address starts with an empty save.
- If the phone shows `getShaderPrecisionFormat` null, the 3D context arrived lost. `createRenderer()` now retries.
- Do not ask the owner for many phone test rounds. Reproduce in WebKit with Playwright (`webkit` with `devices["iPhone 15"]`) first.
