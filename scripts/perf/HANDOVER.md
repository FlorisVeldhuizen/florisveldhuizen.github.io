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
- The perf test runs with uncapped frames. Two side effects follow. First, the resolution governor drops to 1x, so the test measures CPU cost, not pixel cost. Second, Chrome queues GPU work far ahead, and the first shader link then waits for the whole queue. That gives false freezes of 0.5 to 1 s. Measure one-time stutters with normal vsync (leave out `--disable-gpu-vsync` and `--disable-frame-rate-limit`).
- GPU timer queries (`EXT_disjoint_timer_query_webgl2`) give wrong numbers in Chrome on the Mac: 65 ms GPU per frame at a steady 60 fps. Do not use them.

- The test cannot see GPU cost, but the busy room is GPU-bound even on the Mac: at 2x resolution it misses 60 fps, at 1x it holds 60 fps. Measure GPU cost with a frozen frame instead: render the scene about 25 times in one synchronous loop and read back one pixel after each render (`gl.readPixels`), which forces the GPU to finish. Hide one object or swap one shader and compare. This is stable to about 0.1 ms. Timing uncapped frames is not: it varies by 2 to 5 ms with nothing changed.
- The first seconds after the intro tap are a separate test: throttle the CPU before the tap, keep vsync, record frame times and `linkProgram` calls from the tap for 5 s. Before 2026-10-10 the all-helpers room froze 470 ms and then stuttered for 2.5 s here.

## Rules that keep it fast

- Never read layout in frame code: no `window.innerWidth/innerHeight`, `getBoundingClientRect`, `offset*`, `getComputedStyle` per frame. In Chrome each one forces a full style and layout, including hidden panel content. Use `viewWidth()` / `viewHeight()` from `util.js`, the shared `sheet` object, `ResizeObserver` caches, or values the code already computed (for example `bottle.homeBox()`).
- Do not animate `box-shadow`, `filter` or SVG children for long-running effects. Crossfade fixed layers with `opacity` (see `.node-glow` in `idle.css`).
- Lights: the mood group and the disco group switch separately. A light combination draws only if its shader variant was warmed at load (`warmedLights` in `util.js`, `idle.lightStates()`); otherwise all lights stay on. Extras warm only the warmed combinations (`kit.js`).
- Hidden or fully transparent objects should be `visible = false`, not opacity 0.
- A light that is visible at intensity 0 still costs a full light calculation per pixel on every lit material. Put lights that switch off into a light group (`lightGroups` in `util.js`). The golden peach glow is the third group.
- Anything a helper builds or bakes on first use belongs in loading: `idle.settle()` builds the owned helpers' extras, paints the butterflies and shapes the moon during the ripening fill, after the full skin is in. New extras should build in `create` when they can, so `settle` covers them.
- Objects built after the load-time warm-up (like the privacy tag board) need hidden stand-in meshes with their materials, or their shaders compile on first sight.
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
- Lens drops: the blob shader is warmed for its render target. Before, it compiled on the first drop and froze one frame (about 100 ms at 4x CPU).

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

## Done 2026-10-09/10 (branch peachy-helper-perf)

- Golden glow light switched off when unlit (third light group). Frozen-frame GPU at 2x on the Mac: 11.4 to 9.6 ms with a few helpers, 18.6 to 16.1 ms with all.
- Peach drawn front faces first, then back faces from a synced copy of the material: 8.85 to 8.06 ms, pixels identical.
- Helpers, butterflies, moon and the peach plant fit are prepared during loading. After the tap in the all-helpers room: 470 ms freeze plus 25 long frames became one 100 ms frame, no shader compiles. Load to "Tap the peach" is about 0.75 s longer on the Mac (4.5 to 5.26 s), and the fill includes the helper step.

The peach is about 90% of the room's GPU time (its skin fragment shader). Cheap shader tricks (uniform guards, loops that run 0 or 1 times) gave erratic results on the Mac compiler and changed pixels; removing whole features saves the most, but oil and hand prints are active 65 to 100% of play.

## Open ideas, most promising first

0. Peach vertex count and vertex work: done on 2026-10-10, see `PEACH-VERTEX-PLAN.md` for what changed and what to check.

1. All-helpers room (5.4 ms): spread over three.js scene upkeep. `updateMatrixWorld` walks about 400 objects, 165 inside hidden groups. Skipping hidden subtrees is risky: code reads world matrices of hidden objects.
2. One-time stutters when a helper is bought mid-game (owned helpers are now prepared at load): the first Moon costs one 100 ms frame at 4x CPU (`usePeachShape` in `sky.js`), the first Fractal 67 to 83 ms. Other helpers stay under 50 ms.
3. Smacking adds about 1.5 ms main-thread time per frame at 4x CPU, 0.9 ms of it style, layout and paint of the "+juice" pop-ups. Pooling the elements saves only part of that, because paint stays.
4. Shock pass (heat above 0.65) copies the whole frame every frame. Share one frame copy with the lens when both are active.
5. Shadow map: 1024 PCFSoft while the bottle is carried or in disco. Try 512 or PCF on phones, then judge the look.

## Testing on the owner's iPhone

- Serve the dev server: `npx vite --host --port <free port>`. Production preview builds failed to get WebGL on the phone. Check the port is free first (`lsof -iTCP:<port>`); other sessions run servers too.
- Use a link with `?mode=idle`, which opens the mode with the shop. A new address starts with an empty save.
- If the phone shows `getShaderPrecisionFormat` null, the 3D context arrived lost. `createRenderer()` now retries.
- Do not ask the owner for many phone test rounds. Reproduce in WebKit with Playwright (`webkit` with `devices["iPhone 15"]`) first.
