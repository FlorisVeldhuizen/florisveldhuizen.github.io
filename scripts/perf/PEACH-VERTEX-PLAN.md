# Peach vertex count: plan and bench

Plan written 2026-10-10 for a new session. Read `HANDOVER.md` next to this file first: it explains how to measure and which rules keep the game fast.

## Goal

Find out whether the peach can use fewer vertices, or cheaper vertex work, without a visible or felt change. The owner judges look and feel on an iPhone 17 Pro. The peach must stay smooth, round and plump, and its jiggle must stay soft. Do not change the game for the player until the owner picks a variant from the bench.

## What the peach is today

- `src/peachy-keen/assets/peachy.glb` holds the model: 7,954 vertices. `install()` in `peach.js` runs `subdivide()` once at load. The game mesh then has 29,750 vertices and 55,472 triangles.
- The peach draws twice per frame: front faces first, then back faces from a child mesh (`peach.back`, `syncBack()` in `peach.js`). Every pass runs the full vertex shader. The shadow pass (`customDepthMaterial`) draws it again when shadows are on.
- The vertex shader (`VERTEX_HEADER`, `VERTEX_NORMAL` in `peach.js`) moves each vertex for hits, grabs, lingerie and the leaf. For the normal it calls `jiggle()` three times per vertex (finite differences).
- Code that depends on the mesh vertices:
  - Load-time maths in `peach.js`: `computeSmoothNormals`, `findCrease`, `computeStiffness` (leaf and stem flags by texture colour and UV island), `computeStretch`.
  - Raycasts: `boxesFor` and `raycastNearest` in `raycast.js`.
  - The CPU copy of the jiggle in `idle/scenery/skin-jiggle.js` (`skinSpot`, `skinPose`). Helpers use it to touch the moving skin.
  - Meshes that share or copy the peach geometry: the fabric, band and bows (lingerie), the skin-fade mesh, the burst halves (`cutMaterial`), the skin layers in `extras/skin-layer.js`, the golden peach (`golden.js`), the moon (`usePeachShape` in `sky.js`), the Exe ghost (`coarseShell`), `oilshadow.js`, `coin.js` and `sippers/shadows.js`.

## Measured cost (Mac, M2 Pro, 2026-10-10)

The numbers are GPU time per frame from a frozen frame (method below), with a save that has a few helpers.

| Resolution | Whole scene | Peach (both passes) | Pixel shading | Jiggle maths | Back pass |
|---|---|---|---|---|---|
| 2x (780×1688) | 10.0 ms | 8.6 ms | 6.1 ms | 0.7 ms | 1.5 ms |
| 1x | 6.1 ms | 4.6 ms | 3.3 ms | 0.7 ms | 0.6 ms |
| 0.5x | 5.1 ms | 4.3 ms | 3.0 ms | 0.7 ms | 0.6 ms |

The peach minus its pixel shading is about 1.3 ms at low resolution. That is the most that vertex work can give back on the Mac. A phone GPU has less vertex throughput, so the share there can be larger. That is an inference: nobody measured it on the phone.

## Variants to bench

Build each one behind a bench switch, not as a replacement:

1. **A, today:** subdivided, 29,750 vertices.
2. **B, no subdivision:** the 7,954-vertex model as it is in the file. Recompute normals the same way. Expect coarser dents and a less round outline.
3. **C, in between:** about 12k to 18k vertices. Subdivide only where the eye sees it: the outline, the cheeks where dents land, the crease. Or remake the model at that density with the rules in the "Model rules" section.
4. **D, cheaper normals:** today's mesh, but compute the jiggle normal from the analytic derivative of `jiggle()` instead of two extra `jiggle()` calls. This needs no mesh change and should cut most of the 0.7 ms.
5. **E, combinations:** D with B or C. If pixels come out identical, also try a smaller vertex count only for the back pass, because back faces show only at the stem hole and the silhouette.

Variants B and C change the leaf and stem flags (`computeStiffness`), the crease (`findCrease`) and the moon. Check those flags against today's for every variant.

## Bench design

1. **Live switch on the phone.** Add a `?bench` bar (as in earlier sessions: a `bench.js` module plus `// __PK_BENCH` lines, all removed before any commit). Its buttons swap the peach variant at runtime: geometry, the CPU jiggle copy and the raycast boxes together. The owner taps the peach, pours oil and drags it, then picks by feel.
2. **Still comparison.** Publish one artifact page with screenshots of every variant in the same states:
   - at rest, front and from the side
   - right after a slap (dent and ripple)
   - while grabbed and pulled
   - oiled
   - with lingerie
   - the burst halves
   - close to the outline
   - the moon and the golden peach

   Put the measured cost under each variant: frozen-frame GPU time at 2x and 1x, load time to "Tap the peach to play", and the main-thread time of the load-time maths.
3. **Numbers first, then the owner.** Drop any variant that saves under about 0.3 ms GPU on the Mac, unless it also cuts load time a lot.

## How to measure

- **Frozen-frame GPU time.** Add a temporary dev hook in `main.js` that exposes `scene`, `renderer`, `camera` and `interaction` on `window` (remove it before committing). In the page, without awaiting between steps, call `renderer.render(scene, camera)` then `gl.readPixels(0, 0, 1, 1, …)` about 25 times. Time the loop and divide. Lock the resolution first with `quality.setMode("sharp")` or `renderer.setPixelRatio(…)`. Compare by hiding a mesh (`layers.mask = 0`) or swapping a material in the same page. Repeat 7 times and take the median.
- **Uncapped-frame timing and GPU timer queries do not work on this Mac.** `HANDOVER.md` explains why.
- **Feel.** Frame rate is not the test for feel: dents and ripples are. Compare screenshots taken right after the same `addJiggle` call on each variant.
- **Before a commit:** run `npm run perf`, merge the latest `origin/master` first, and run the after-tap test and the load-time test from `HANDOVER.md`.

## Model rules (if the model is remade)

These rules come from the 2026-10-05 model remake:

- Smooth only along the normal or the radius. Sideways moves distort the UV-mapped fuzz.
- Use an area-weighted Gaussian. Neighbour averaging on uneven triangles adds bumps.
- Cast rays onto the original with Phong-tessellated hits. Flat-face hits facet the outline.
- End with a lift step so nothing sinks below the original.
- Keep the height at 0.9575. The game scales the model by its bounding box, so a height change changes how dragging feels.
- Keep the texture JPEG, and re-run the leaf check (`computeStiffness` flags) after any change.

## Working with the owner

- Test on the phone with the dev server: `npx vite --host --port <free port>`. Check that the port is free first. Production preview builds failed to get WebGL on the phone.
- Do not ask for many phone rounds. Reproduce problems in Playwright first: WebKit with `devices["iPhone 15"]`.
- The owner rejects changes that break immersion, and picks from side-by-side benches.
- Commit messages: plain sentences, one point each, with the `Co-Authored-By` line. Do not push or deploy without asking. After a deploy, run `scripts/sync-peachy-keen.sh`.
