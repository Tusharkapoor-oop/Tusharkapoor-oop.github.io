# COGNITUM — a 4D neural manifold portfolio

> Descend through a working model. Every repository is a memory cell, every skill a synapse.

**Live → https://tusharkapoor-oop.github.io/**

A scroll-driven WebGL experience by **Tushar Kapoor** (AI/ML engineer). No frameworks, no build step — vanilla ES modules, Three.js, and custom GLSL.

## What's inside

| Layer | Scene |
|---|---|
| **L0 MANIFEST** | ~6,400 GPU particles assemble your name from a random cloud, projected in cyan→violet |
| **L1 CORTEX** | A real **tesseract** — 16 vertices, XW/YW/XY rotation, `k = 2.4/(3.6−w)` 4D→3D projection, reprojected every frame |
| **L2 MEMORY** | 11 repositories as raycastable memory cells orbiting a 64-node neural shell with firing GLSL pulses |
| **L3 PROOF** | Awards, honours, certifications |
| **L4 SIGNAL** | Contact |

### Engine details

- **Background** — domain-warped `fbm` fragment shader (2-pass warp, hash grain, mouse-follow glow), palette shifts as you descend
- **Neural core** — fibonacci-sphere node graph, nearest-neighbor edges, 28 additive pulse particles traveling the edges
- **Camera** — five keyframes (`p = 0 / .24 / .50 / .74 / 1.0`) on a damped virtual scroll (`wheel` / drag / arrow keys), with pointer parallax
- **HUD** — live fps, layer nav, and a `visitor_embedding` hash stirred by your pointer entropy
- **Zero deps** — `index.html` + `styles.css` + `app.js`; Three.js r160 from CDN

```
index.html   structure, 5 layer sections, HUD, loader
styles.css   dark neon system, responsive
app.js       shaders, 4D math, raycasting, scroll-mind
```

Run locally: any static server (`npx serve .`) — module imports need HTTP, not `file://`.
