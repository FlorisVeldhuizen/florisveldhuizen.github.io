# Peach vertex count: outcome

Done on 2026-10-10, commit `a27c2690` (with `3a781b39` and `59875bf3`). Read `HANDOVER.md` next to this file for how to measure.

## What the peach is now

- `src/peachy-keen/assets/peachy.glb` is unchanged: 7,954 vertices. `install()` in `peach.js` builds two meshes from it at load with `refine()`, which splits chosen edges and bends each midpoint 3/4 of the way onto the curved surface.
- The **body mesh** (10,537 vertices) splits only the edges in a strip along the crease and the leaf edges that bend more than 32°. The game draws it while no lingerie shows.
- The **lingerie mesh** (19,202 vertices) splits the body mesh's edges plus every edge whose score passes `EDGE_SPLIT`. The waistband's pull needs this density: on fewer vertices, skin pokes through the band.
- `setLingerie()` swaps to the lingerie mesh when lingerie shows. It starts on the body mesh's surface and lighting (`riseFrom`, `riseNormal`, `uRise`) and blends into its own shape over `RISE_SECONDS` (0.4 s), and back before it swaps out. An instant swap shows as a jump.
- Leaf and stem flags, stiffness and the fuzz mask are worked out on the 8k model and copied to new vertices as the average of the two edge ends (`carry()`).
- The soft-fuzz mask (`computeStretch()`) spreads by distance on the skin (`STRETCH_REACH`, `STRETCH_SOFT`), so it covers the same skin on any mesh. Spreading by vertex steps made smaller meshes smooth the cheek underside.
- The jiggle normal comes from `jiggleSlope()`: one call with hand-worked slopes instead of three `jiggle()` calls. **Change `jiggle()` and `jiggleSlope()` together.** The CPU copy in `idle/scenery/skin-jiggle.js` still follows `jiggle()` only.

## Measured (Mac, M2 Pro)

| | Master | Now |
|---|---|---|
| Peach GPU per frame, frozen frame, 1x, jiggling | 4.6–5.0 ms | about 3.0 ms (body mesh) |
| `npm run perf` room / disco / burst (4x CPU) | 13.1 / 9.9 / 8.7 ms | 9.9 / 6.8 / 4.7 ms |
| Load to "Tap the peach" | 5.64–5.84 s | 5.65–5.93 s (noise) |

Analytic normals alone save 0.2–0.35 ms while the peach jiggles; pixels match today's normals to 4 of 255 in all three firmness tiers.

## Rejected (do not redo without a new reason)

- Drawing only the back faces from a lighter mesh: no gain, front faces already hide them.
- One 19k mesh all the time: no swap, but about 0.85 ms of the saving lost.
- A dense strip only around the waist: the waistband moves from 70% to 30% of the height while pulled.
- A 1024 fuzz texture: same look as repeating the 512 one twice, and 140 ms more at load. Finer fuzz was not chosen.

## Checks after changing the mesh code

- The moon (`usePeachShape` in `sky.js`) and the Fractal copy the body mesh; check them.
- Lingerie: pull the waistband down slowly and look for skin through the band; dress and undress and look for a jump.
- The leaf from below, and the cheek underside fuzz.
