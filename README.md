# COGNITUM 6D — the portfolio as a working model

> Not decorated with AI — **running** it. Live in your browser → **https://tusharkapoor-oop.github.io/**

By **Tushar Kapoor** (AI/ML engineer). Vanilla ES modules + Three.js + custom GLSL. No frameworks, no build step.

## What actually runs

| System | Math / ML |
|---|---|
| **Hexeract** | The 6-cube: 64 vertices, 192 edges, rotating in **all 15 bivector planes of SO(6)**, then a nested stereographic cascade **6D → 5D → 4D → 3D**. Three nested wireframes: the full figure (colored by its 6th coordinate), its 5D section (80 edges), its 4D section (a tesseract, 32 edges) — the shadows brighten as you descend. |
| **Normalizing flow** | An **affine-coupling flow (RealNVP-style)** with drifting phases. Every particle on screen is a sample `z ~ N(0, I)` pushed through invertible layers. `log p(x) = log p(z) − Σ s` is accumulated exactly and displayed live in the HUD. |
| **Hypervector memory** | **4096-dimensional bipolar vectors**, bundled by superposition. Skills and repositories share tag-vectors, so cosine similarity is genuinely compositional (shared-tag cos ≈ 0.46 vs ≈ 0.0 unrelated — unit-tested). Your **cursor builds the query**; attention softmax re-ranks all 11 repos live, driving meter bars, cell glow, and similarity arcs. |
| **Background** | **Born-rule density** `&#124;ψ&#124;²` of a 7-mode quantum superposition with iso-probability fringe contours. The cursor is a detector: the wavefunction localizes under it. |
| **HUD** | Live fps, `log p(x)`, attention entropy `H`, top match, rotating `θ_xw θ_zw θ_vu` SO(6) readout, and a `visitor_embedding` hash stirred by pointer entropy. |

## Layers

`D0 EMERGENCE` → `D1 SUBSTRATE` → `D2 MEMORY` → `D3 PROOF` → `D4 SIGNAL`

Scroll, drag, or arrow-key through a damped camera path (5 keyframes + pointer parallax).

```
index.html    structure, 5 dimension sections, HUD, loader
styles.css    dark-neon instrument system, responsive
app.js        scene orchestration, Born-rule shader, raycast, scroll-mind
hexeract.js   SO(6) rotations + 6→3 cascade projection
flow.js       affine-coupling normalizing flow + exact log-det
hrr.js        hypervector memory: bundling, cosine, softmax attention
```

Run locally: any static server (`npx serve .`) — ES modules need HTTP, not `file://`.

Same code also lives in your profile repo: [`Tusharkapoor-oop/Tusharkapoor-oop`](https://github.com/Tusharkapoor-oop/Tusharkapoor-oop).
