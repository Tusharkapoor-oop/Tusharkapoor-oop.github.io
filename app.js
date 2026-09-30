/* COGNITUM — a 4D neural manifold portfolio. Three.js + GLSL, zero frameworks. */

const FALLBACK = () => {
  document.getElementById('fallback').hidden = false;
  document.getElementById('loader').classList.add('done');
};

let THREE;
try {
  THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');
} catch (err) {
  console.error('COGNITUM: three.js failed to load', err);
  FALLBACK();
  throw err;
}

/* ================= data ================= */
const PROJECTS = [
  { name: 'Advance_hand_gesture', short: 'ADVANCE', tag: 'VISION', blurb: 'Real-time hand-gesture recognition — MediaPipe landmarks, TensorFlow classifier, browser demo.', slug: 'Advance_hand_gesture' },
  { name: 'auracontrol-backend', short: 'AURA', tag: 'VISION', blurb: 'Real-time gesture engine — FastAPI, MediaPipe, WebSocket dispatch loop.', slug: 'auracontrol-backend' },
  { name: 'VOIS_AICTE_Oct2025_TUSHAR-KAPOOR', short: 'VOIS · EDA', tag: 'DATA', blurb: 'Netflix and Airbnb data analysis — EDA notebooks, decks, course materials.', slug: 'VOIS_AICTE_Oct2025_TUSHAR-KAPOOR' },
  { name: 'OS_LAB_Linux_Ubantu', short: 'OS · LAB', tag: 'BACKEND', blurb: 'Operating systems lab in Python — system calls, CPU scheduling, sync, memory, file systems.', slug: 'OS_LAB_Linux_Ubantu' },
  { name: 'go-bric', short: 'GO · BRIC', tag: 'AGENTS', blurb: 'Multi-agent company scouting — five specialist agents over a shared dataset. Next.js + Gemini.', slug: 'go-bric' },
  { name: 'ReflectAI', short: 'REFLECT', tag: 'ENGINEERING', blurb: 'Deterministic end-of-day reflection — structured conversation to a psychological tree output.', slug: 'ReflectAI' },
  { name: 'Sustainable-Agriculture-Project', short: 'AGRI · ML', tag: 'AI/ML', blurb: 'Crop recommendation from soil/climate features — full ML pipeline with preprocessing and evaluation.', slug: 'Sustainable-Agriculture-Project' },
  { name: 'tushar_cse-AI-and-ML-A_AI-STUDY-PLANNER', short: 'STUDY · PLANNER', tag: 'BACKEND', blurb: 'AI study planner — syllabus upload, topic extraction, video curation. Frontend + backend.', slug: 'tushar_cse-AI-and-ML-A_AI-STUDY-PLANNER' },
  { name: 'Kapoor-portfolio', short: 'PORTFOLIO', tag: 'FRONTEND', blurb: 'Personal portfolio site — React, Vite, Tailwind, GitHub Actions CI/CD.', slug: 'Kapoor-portfolio' },
  { name: 'NPU-Fit-Checker-Automated-NPU-Fallback-Diagnosis', short: 'NPU · FIT', tag: 'SYSTEMS', blurb: 'Automated NPU fallback diagnosis — which layers fell back to CPU, on which target, and why. 30/30 tests green.', slug: 'NPU-Fit-Checker-Automated-NPU-Fallback-Diagnosis' },
  { name: 'IBM-Cloud-project', short: 'IBM · CLOUD', tag: 'AI/ML', blurb: 'Predictive maintenance on IBM Cloud / Watsonx — Jupyter ML pipeline, training and evaluation.', slug: 'IBM-Cloud-project' },
];
const REPO_BASE = 'https://github.com/Tusharkapoor-oop/';

/* ================= helpers ================= */
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const isMobile = matchMedia('(max-width: 720px)').matches;

/* ================= renderer ================= */
const canvas = document.getElementById('gl');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch (err) {
  console.error('COGNITUM: WebGL unavailable', err);
  FALLBACK();
  throw err;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.autoClear = false;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 300);
camera.position.set(0, 0.4, 14.5);

/* ================= background: latent nebula (GLSL fbm) ================= */
const bgScene = new THREE.Scene();
const bgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const bgUniforms = {
  uTime: { value: 0 },
  uMouse: { value: new THREE.Vector2(0, 0) },
  uScroll: { value: 0 },
};
const bgMat = new THREE.ShaderMaterial({
  depthTest: false,
  depthWrite: false,
  uniforms: bgUniforms,
  vertexShader: `
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
  `,
  fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uScroll;

    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i), b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }
    float fbm(vec2 p){
      float v = 0.0, a = 0.5;
      for(int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.03; a *= 0.5; }
      return v;
    }

    void main(){
      vec2 p = (vUv - 0.5) * vec2(1.75, 1.0);
      float t = uTime * 0.045 + uScroll * 1.6;

      vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t * 0.7));
      vec2 r = vec2(
        fbm(p + 2.0 * q + vec2(1.7, 9.2) + t * 0.9),
        fbm(p + 2.0 * q + vec2(8.3, 2.8) - t * 0.8)
      );
      float f = fbm(p + 2.4 * r);

      vec3 deep = vec3(0.012, 0.012, 0.04);
      vec3 indigo = mix(vec3(0.16, 0.13, 0.55), vec3(0.10, 0.35, 0.55), smoothstep(0.35, 0.75, uScroll));
      vec3 violet = mix(vec3(0.42, 0.16, 0.66), vec3(0.12, 0.55, 0.62), smoothstep(0.55, 1.0, uScroll));

      vec3 col = mix(deep, indigo, clamp(f * f * 2.6, 0.0, 1.0));
      col = mix(col, violet, clamp(length(q) * 0.6, 0.0, 1.0));
      col += violet * 0.35 * pow(clamp(r.x, 0.0, 1.0), 3.0);

      float m = exp(-3.2 * length(p - uMouse * vec2(1.75, 1.0) * 0.5));
      col += indigo * m * 0.22;

      col *= 1.0 - 0.5 * length(p) * 0.75;
      col += (hash(vUv * vec2(uTime * 60.0, uTime * 47.0)) - 0.5) * 0.028;

      gl_FragColor = vec4(col, 1.0);
    }
  `,
});
bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat));

/* ================= glow sprite texture ================= */
function glowTexture(inner = 'rgba(255,255,255,1)') {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.35, 'rgba(255,255,255,0.55)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
const glowTex = glowTexture();

/* ================= starfield dust ================= */
const DUST_N = isMobile ? 1400 : 2800;
{
  const pos = new Float32Array(DUST_N * 3);
  for (let i = 0; i < DUST_N; i++) {
    const r = 22 + Math.random() * 55;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7;
    pos[i * 3 + 2] = r * Math.cos(ph);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(geo, new THREE.PointsMaterial({
    size: 0.42, map: glowTex, color: 0x8b9cf5, transparent: true, opacity: 0.75,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  }));
  dust.name = 'dust';
  scene.add(dust);
}

/* ================= title particles (sampled from canvas) ================= */
const titleUniforms = {
  uProg: { value: 0 },
  uTime: { value: 0 },
  uOpacity: { value: 1 },
  uPixel: { value: renderer.getPixelRatio() },
  uColA: { value: new THREE.Color('#22d3ee') },
  uColB: { value: new THREE.Color('#c084fc') },
};
let titlePoints = null;
{
  const W = 1240, H = 260;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.fillStyle = '#fff';
  g.font = '800 128px Arial, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('TUSHAR KAPOOR', W / 2, H / 2);
  const img = g.getImageData(0, 0, W, H).data;

  const targets = [];
  const step = isMobile ? 6 : 5;
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      if (img[(y * W + x) * 4 + 3] > 128) targets.push([x, y]);
    }
  }
  const MAX = isMobile ? 3200 : 6400;
  const stride = Math.max(1, Math.ceil(targets.length / MAX));
  const chosen = targets.filter((_, i) => i % stride === 0).slice(0, MAX);

  const n = chosen.length;
  const aTarget = new Float32Array(n * 3);
  const aStart = new Float32Array(n * 3);
  const aRnd = new Float32Array(n);
  const SCALE = 0.0116, Y_OFF = 1.85, Z_OFF = 3.4;

  for (let i = 0; i < n; i++) {
    const [px, py] = chosen[i];
    aTarget[i * 3] = (px - W / 2) * SCALE;
    aTarget[i * 3 + 1] = -(py - H / 2) * SCALE + Y_OFF;
    aTarget[i * 3 + 2] = Z_OFF + (Math.random() - 0.5) * 0.25;

    const r = 26 + Math.random() * 22;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    aStart[i * 3] = r * Math.sin(ph) * Math.cos(th);
    aStart[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    aStart[i * 3 + 2] = r * Math.cos(ph);
    aRnd[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(aTarget.slice(), 3));
  geo.setAttribute('aTarget', new THREE.BufferAttribute(aTarget, 3));
  geo.setAttribute('aStart', new THREE.BufferAttribute(aStart, 3));
  geo.setAttribute('aRnd', new THREE.BufferAttribute(aRnd, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: titleUniforms,
    vertexShader: `
      attribute vec3 aTarget;
      attribute vec3 aStart;
      attribute float aRnd;
      uniform float uProg;
      uniform float uTime;
      uniform float uPixel;
      varying float vMix;
      void main(){
        float e = clamp((uProg - aRnd * 0.45) / 0.55, 0.0, 1.0);
        e = 1.0 - pow(1.0 - e, 3.0);
        vec3 pos = mix(aStart, aTarget, e);
        pos.x += sin(uTime * 0.9 + aRnd * 40.0) * 0.07 * e;
        pos.y += cos(uTime * 0.7 + aRnd * 31.0) * 0.07 * e;
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = (2.2 + aRnd * 2.4) * uPixel * (170.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
        vMix = smoothstep(-7.0, 7.0, aTarget.x);
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform vec3 uColA;
      uniform vec3 uColB;
      uniform float uOpacity;
      varying float vMix;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.08, d) * uOpacity;
        if (a < 0.01) discard;
        gl_FragColor = vec4(mix(uColA, uColB, vMix), a);
      }
    `,
  });
  titlePoints = new THREE.Points(geo, mat);
  scene.add(titlePoints);
}

/* ================= tesseract (real 4D → 3D projection) ================= */
let tetra, tetraMat;
{
  const verts4 = [];
  for (let i = 0; i < 16; i++) {
    verts4.push([
      (i & 1) ? 1 : -1,
      (i & 2) ? 1 : -1,
      (i & 4) ? 1 : -1,
      (i & 8) ? 1 : -1,
    ]);
  }
  const edges = [];
  for (let a = 0; a < 16; a++) {
    for (let b = a + 1; b < 16; b++) {
      let diff = 0;
      for (let k = 0; k < 4; k++) if (verts4[a][k] !== verts4[b][k]) diff++;
      if (diff === 1) edges.push([a, b]);
    }
  }
  const pos = new Float32Array(edges.length * 6);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  tetraMat = new THREE.LineBasicMaterial({
    color: 0x818cf8, transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  tetra = new THREE.LineSegments(geo, tetraMat);
  tetra.userData = { verts4, edges, scale: 2.1 };
  scene.add(tetra);

  const core = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, color: 0x67e8f9, transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  core.scale.setScalar(3.2);
  core.name = 'coreGlow';
  scene.add(core);
}
function updateTesseract(t) {
  const { verts4, edges, scale } = tetra.userData;
  const a1 = t * 0.30, a2 = t * 0.21, a3 = t * 0.11;
  const c1 = Math.cos(a1), s1 = Math.sin(a1);
  const c2 = Math.cos(a2), s2 = Math.sin(a2);
  const c3 = Math.cos(a3), s3 = Math.sin(a3);
  const proj = new Array(16);
  for (let i = 0; i < 16; i++) {
    let [x, y, z, w] = verts4[i];
    // rotate in XW plane
    let nx = x * c1 - w * s1; w = x * s1 + w * c1; x = nx;
    // rotate in YW plane
    let ny = y * c2 - w * s2; w = y * s2 + w * c2; y = ny;
    // rotate in XY plane
    nx = x * c3 - y * s3; y = x * s3 + y * c3; x = nx;
    const k = 2.4 / (3.6 - w);
    proj[i] = [x * k * scale, y * k * scale, z * k * scale];
  }
  const pos = tetra.geometry.attributes.position.array;
  let o = 0;
  for (const [a, b] of edges) {
    pos[o++] = proj[a][0]; pos[o++] = proj[a][1]; pos[o++] = proj[a][2];
    pos[o++] = proj[b][0]; pos[o++] = proj[b][1]; pos[o++] = proj[b][2];
  }
  tetra.geometry.attributes.position.needsUpdate = true;
}

/* ================= neural shell + firing pulses ================= */
const NEURAL_R = 5.4;
const nodePos = [];
const edgePairs = [];
{
  const N = 64;
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = golden * i;
    nodePos.push(new THREE.Vector3(
      Math.cos(th) * rad * NEURAL_R,
      y * NEURAL_R * 0.82,
      Math.sin(th) * rad * NEURAL_R
    ));
  }
  const seen = new Set();
  for (let i = 0; i < N; i++) {
    const dists = [];
    for (let j = 0; j < N; j++) {
      if (i === j) continue;
      dists.push([j, nodePos[i].distanceToSquared(nodePos[j])]);
    }
    dists.sort((a, b) => a[1] - b[1]);
    for (let k = 0; k < 3; k++) {
      const j = dists[k][0];
      const key = i < j ? i + '-' + j : j + '-' + i;
      if (!seen.has(key)) { seen.add(key); edgePairs.push([Math.min(i, j), Math.max(i, j)]); }
    }
  }
}
{
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(edgePairs.length * 6);
  edgePairs.forEach(([a, b], i) => {
    pos.set([nodePos[a].x, nodePos[a].y, nodePos[a].z, nodePos[b].x, nodePos[b].y, nodePos[b].z], i * 6);
  });
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({
    color: 0x4f46e5, transparent: true, opacity: 0.22,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  scene.add(lines);

  const nGeo = new THREE.BufferGeometry();
  const nPos = new Float32Array(N * 3);
  nodePos.forEach((v, i) => nPos.set([v.x, v.y, v.z], i * 3));
  nGeo.setAttribute('position', new THREE.BufferAttribute(nPos, 3));
  scene.add(new THREE.Points(nGeo, new THREE.PointsMaterial({
    size: 0.5, map: glowTex, color: 0xa5b4fc, transparent: true, opacity: 0.95,
    depthWrite: false, blending: THREE.AdditiveBlending,
  })));
}
const PULSE_N = isMobile ? 16 : 28;
const pulses = [];
const pulseGeo = new THREE.BufferGeometry();
const pulsePos = new Float32Array(PULSE_N * 3);
pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3));
const pulsePoints = new THREE.Points(pulseGeo, new THREE.PointsMaterial({
  size: 0.62, map: glowTex, color: 0x67e8f9, transparent: true, opacity: 1,
  depthWrite: false, blending: THREE.AdditiveBlending,
}));
scene.add(pulsePoints);
for (let i = 0; i < PULSE_N; i++) {
  pulses.push({ edge: (Math.random() * edgePairs.length) | 0, t: Math.random(), speed: 0.45 + Math.random() * 0.8 });
}
function updatePulses(dt) {
  for (let i = 0; i < PULSE_N; i++) {
    const p = pulses[i];
    p.t += dt * p.speed;
    if (p.t >= 1) { p.t = 0; p.edge = (Math.random() * edgePairs.length) | 0; }
    const [a, b] = edgePairs[p.edge];
    pulsePos[i * 3] = lerp(nodePos[a].x, nodePos[b].x, p.t);
    pulsePos[i * 3 + 1] = lerp(nodePos[a].y, nodePos[b].y, p.t);
    pulsePos[i * 3 + 2] = lerp(nodePos[a].z, nodePos[b].z, p.t);
  }
  pulseGeo.attributes.position.needsUpdate = true;
}

/* ================= memory cells (the 11 repositories) ================= */
const cellGroup = new THREE.Group();
scene.add(cellGroup);
const cells = [];
const rayTargets = [];

function labelSprite(text) {
  const c = document.createElement('canvas');
  c.width = 640; c.height = 128;
  const g = c.getContext('2d');
  g.font = '700 46px "Cascadia Code", Consolas, monospace';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.shadowColor = 'rgba(103,232,249,0.9)';
  g.shadowBlur = 22;
  g.fillStyle = '#e2e8f0';
  g.fillText(text, 320, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, transparent: true, opacity: 0, depthWrite: false,
  }));
  spr.scale.set(3.1, 0.62, 1);
  return spr;
}

PROJECTS.forEach((proj, i) => {
  const angle = (i / PROJECTS.length) * Math.PI * 2;
  const R = 7.6;
  const holder = new THREE.Group();
  holder.position.set(Math.cos(angle) * R, Math.sin(i * 2.7) * 0.9, Math.sin(angle) * R);

  const wire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.42, 0),
    new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true, transparent: true, opacity: 0.9 })
  );
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, color: 0x4f46e5, transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  glow.scale.setScalar(2.1);

  const hit = new THREE.Mesh(
    new THREE.SphereGeometry(1.0, 8, 8),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  hit.userData.projectIndex = i;

  const label = labelSprite(proj.short);
  label.position.y = 1.15;

  holder.add(wire, glow, hit, label);
  holder.scale.setScalar(0.001);
  holder.visible = false;
  cellGroup.add(holder);
  cells.push({ holder, wire, glow, label, hover: 0, proj });
  rayTargets.push(hit);
});

/* ================= memory list (HTML twin of the cells) ================= */
const memList = document.getElementById('memoryList');
PROJECTS.forEach((p) => {
  const li = document.createElement('li');
  li.innerHTML = `<a href="${REPO_BASE}${p.slug}" target="_blank" rel="noopener"><span>${p.name}</span><small>${p.tag}</small></a>`;
  memList.appendChild(li);
});

/* ================= scroll state ================= */
let target = 0, cur = 0;
addEventListener('wheel', (e) => {
  if (e.target.closest && e.target.closest('.memory, .awards')) return;
  target = clamp(target + e.deltaY * 0.00042, 0, 1);
}, { passive: true });

let dragging = false, lastY = 0;
canvas.addEventListener('pointerdown', (e) => { dragging = true; lastY = e.clientY; });
addEventListener('pointerup', () => { dragging = false; });
addEventListener('pointermove', (e) => {
  if (dragging) {
    target = clamp(target + (lastY - e.clientY) * 0.0016, 0, 1);
    lastY = e.clientY;
  }
});
addEventListener('keydown', (e) => {
  if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { target = clamp(target + 0.1, 0, 1); e.preventDefault(); }
  if (['ArrowUp', 'PageUp'].includes(e.key)) { target = clamp(target - 0.1, 0, 1); e.preventDefault(); }
});
document.querySelectorAll('#layerNav button').forEach((b) => {
  b.addEventListener('click', () => { target = parseFloat(b.dataset.goto); });
});

/* ================= camera keyframes ================= */
const KEYS = [
  { p: 0.00, pos: new THREE.Vector3(0, 0.5, 14.5), look: new THREE.Vector3(0, 0.6, 0) },
  { p: 0.24, pos: new THREE.Vector3(4.4, 1.9, 9.2), look: new THREE.Vector3(0, 0.3, 0) },
  { p: 0.50, pos: new THREE.Vector3(0, 8.2, 8.8), look: new THREE.Vector3(0, -0.5, 0) },
  { p: 0.74, pos: new THREE.Vector3(-5.4, 1.3, 9.0), look: new THREE.Vector3(0, 0.7, 0) },
  { p: 1.00, pos: new THREE.Vector3(0, -0.8, 19.0), look: new THREE.Vector3(0, 0.3, 0) },
];
const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
function cameraAt(p, mx, my) {
  let a = KEYS[0], b = KEYS[KEYS.length - 1];
  for (let i = 0; i < KEYS.length - 1; i++) {
    if (p >= KEYS[i].p && p <= KEYS[i + 1].p) { a = KEYS[i]; b = KEYS[i + 1]; break; }
  }
  const u = sstep(0, 1, (p - a.p) / Math.max(1e-6, b.p - a.p));
  camPos.lerpVectors(a.pos, b.pos, u);
  camLook.lerpVectors(a.look, b.look, u);
  camPos.x += mx * 0.9;
  camPos.y += my * 0.55;
  camera.position.copy(camPos);
  camera.lookAt(camLook);
}

/* ================= pointer / raycast ================= */
const mouseN = new THREE.Vector2(0, 0);
const mouseS = new THREE.Vector2(0, 0);
const raycaster = new THREE.Raycaster();
let hovered = null;
const tooltip = document.getElementById('tooltip');

let entropy = 0x9e3779b9;
addEventListener('pointermove', (e) => {
  mouseN.x = (e.clientX / innerWidth) * 2 - 1;
  mouseN.y = -(e.clientY / innerHeight) * 2 + 1;
  entropy = (Math.imul(entropy ^ ((e.clientX * 73856093) ^ (e.clientY * 19349663) ^ (performance.now() & 0xfffff)), 2654435761)) >>> 0;
  if (hovered !== null) {
    tooltip.style.left = e.clientX + 18 + 'px';
    tooltip.style.top = e.clientY + 18 + 'px';
  }
});
canvas.addEventListener('click', () => {
  if (hovered !== null) window.open(REPO_BASE + cells[hovered].proj.slug, '_blank', 'noopener');
});

const embedEl = document.getElementById('embed');
setInterval(() => {
  const a = entropy >>> 0;
  const b = Math.imul(a ^ 0x5bf03635, 0x27d4eb2f) >>> 0;
  embedEl.textContent = '0x' + a.toString(16).padStart(8, '0') + b.toString(16).padStart(8, '0');
}, 1200);

/* ================= sections / HUD ================= */
const sections = [...document.querySelectorAll('section')].map((el) => ({
  el, in: parseFloat(el.dataset.in), out: parseFloat(el.dataset.out), t: 0,
}));
const navBtns = [...document.querySelectorAll('#layerNav button')];
const fpsEl = document.getElementById('fps');

function updateSections(p) {
  let activeIdx = 0;
  sections.forEach((s, i) => {
    const fade = Math.min(sstep(s.in, s.in + 0.05, p), 1 - sstep(s.out - 0.05, s.out, p));
    if (i === 0 && p < 0.04) { /* keep hero solid at very top */ }
    s.t = fade;
    s.el.style.opacity = fade.toFixed(3);
    s.el.style.transform = `translate(-50%, ${(-46 + (1 - fade) * 6).toFixed(2)}%)`;
    s.el.classList.toggle('on', fade > 0.35);
    if (fade > 0.5) activeIdx = i;
  });
  navBtns.forEach((b, i) => b.classList.toggle('active', i === activeIdx));
}

/* ================= main loop ================= */
const clock = new THREE.Clock();
let frames = 0, fpsTimer = 0, loaderHidden = false;
let bootTime = 0;
const mouseSmX = { v: 0 }, mouseSmY = { v: 0 };

function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  bootTime = t;

  // scroll damp
  cur += (target - cur) * Math.min(1, dt * 3.4);
  const p = cur;

  // pointer smoothing
  mouseSmX.v = lerp(mouseSmX.v, mouseN.x, dt * 4);
  mouseSmY.v = lerp(mouseSmY.v, mouseN.y, dt * 4);
  bgUniforms.uMouse.value.set(mouseSmX.v, mouseSmY.v);
  bgUniforms.uTime.value = t;
  bgUniforms.uScroll.value = p;

  // title assembly + fade
  titleUniforms.uProg.value = clamp((t - 0.6) / 2.4, 0, 1);
  titleUniforms.uTime.value = t;
  titleUniforms.uOpacity.value = 1 - sstep(0.05, 0.16, p);
  if (titlePoints) titlePoints.visible = titleUniforms.uOpacity.value > 0.01;

  // tesseract + core
  updateTesseract(t);
  tetraMat.opacity = 0.9 - 0.55 * sstep(0.06, 0.32, p);
  const core = scene.getObjectByName('coreGlow');
  if (core) {
    const s = 3.0 + Math.sin(t * 2.1) * 0.35;
    core.scale.setScalar(s);
    core.material.opacity = (0.75 + Math.sin(t * 2.1) * 0.2) * (1 - 0.5 * sstep(0.5, 1, p));
  }

  // pulses fire faster mid-descent
  updatePulses(dt * (1 + sstep(0.4, 0.6, p) * 1.6));

  // dust drift
  const dust = scene.getObjectByName('dust');
  if (dust) { dust.rotation.y += dt * 0.012; dust.rotation.x += dt * 0.004; }

  // memory cells appear in L2
  const sp = sstep(0.40, 0.47, p) * (1 - sstep(0.68, 0.74, p));
  cellGroup.rotation.y += dt * 0.07;
  cellGroup.visible = sp > 0.005;

  // hover raycast (only when cells visible)
  let newHover = null;
  if (sp > 0.35) {
    raycaster.setFromCamera(mouseN, camera);
    const hits = raycaster.intersectObjects(rayTargets, false);
    if (hits.length) newHover = hits[0].object.userData.projectIndex;
  }
  if (newHover !== hovered) {
    hovered = newHover;
    if (hovered !== null) {
      const pr = cells[hovered].proj;
      tooltip.innerHTML = `<b>${pr.name}</b><span>${pr.blurb}</span><span>click to open ↗</span>`;
      tooltip.classList.add('show');
      canvas.style.cursor = 'pointer';
    } else {
      tooltip.classList.remove('show');
      canvas.style.cursor = '';
    }
  }

  cells.forEach((c, i) => {
    const want = sp * (hovered === i ? 1.45 : 1);
    c.holder.visible = sp > 0.005;
    const s = lerp(c.holder.scale.x, Math.max(0.001, want), Math.min(1, dt * 8));
    c.holder.scale.setScalar(s);
    c.holder.rotation.y += dt * (hovered === i ? 1.6 : 0.5);
    c.holder.rotation.x += dt * 0.3;
    c.label.material.opacity = sp * (hovered === i ? 1 : 0.85);
    c.wire.material.color.setHex(hovered === i ? 0xa5f3fc : 0x22d3ee);
  });

  // camera + sections + HUD
  cameraAt(p, mouseSmX.v, mouseSmY.v);
  updateSections(p);

  frames++;
  fpsTimer += dt;
  if (fpsTimer >= 0.5) {
    fpsEl.textContent = 'fps ' + Math.round(frames / fpsTimer);
    frames = 0; fpsTimer = 0;
  }

  renderer.clear();
  renderer.render(bgScene, bgCam);
  renderer.clearDepth();
  renderer.render(scene, camera);

  if (!loaderHidden && t > 0.9) {
    loaderHidden = true;
    document.getElementById('loader').classList.add('done');
  }
  requestAnimationFrame(tick);
}

/* ================= resize ================= */
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  titleUniforms.uPixel.value = renderer.getPixelRatio();
});

/* ================= go ================= */
console.log('%c COGNITUM ', 'background:#4f46e5;color:#fff;font-size:16px', '— if you are reading this, you inspect like an engineer.');
requestAnimationFrame(tick);
