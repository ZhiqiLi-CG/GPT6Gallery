// GPT-6 World Gallery: pick a scene, its world-program modules are imported and built into one three.js scene.
// Each module exports build(THREE, ctx) -> Object3D in world coordinates (x east, z north, y up, metres);
// ctx carries the scene's bounds, y-range and the interfaces/objects record the modules were written against.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const sel = document.getElementById('scene'), camSel = document.getElementById('cam');
const caption = document.getElementById('caption'), status = document.getElementById('status');
const list = await (await fetch('./scenes/index.json')).json();
for (const s of list.scenes) sel.add(new Option(s.title, s.id));

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100000);
const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true;
let scene = new THREE.Scene(), current = null;

function resize() { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

async function load(id) {
  const base = './scenes/' + id + '/';
  const meta = await (await fetch(base + 'scene.json')).json();
  const record = async f => { try { const r = await fetch(base + f); return r.ok ? await r.json() : {}; } catch { return {}; } };
  const [interfaces, objects] = await Promise.all([record('interfaces.json'), record('objects.json')]);
  status.textContent = 'loading ' + meta.modules.length + ' modules…';
  const B = meta.bounds, Y = meta.y;
  const next = new THREE.Scene(); next.background = new THREE.Color(0xdfe9f3);
  next.add(new THREE.HemisphereLight(0xffffff, 0x556655, 0.9));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(B[2] - B[0], (Y[1] - Y[0]) * 1.5, B[1] - B[3]); sun.castShadow = true; next.add(sun);
  const ctx = { THREE, bounds: B, y: Y, interfaces, objects }; const failed = [];
  for (const f of meta.modules) {
    try {
      const m = await import(base + 'modules/' + f);
      if (typeof m.build !== 'function') throw new Error('no build() export');
      const g = await m.build(THREE, { ...ctx, module: f });
      if (g) { g.name = g.name || f; next.add(g); }
    } catch (e) { failed.push(f); console.error('module failed', f, e); }
  }
  scene = next; current = meta;
  camSel.innerHTML = ''; camSel.add(new Option('overview', 'overview'));
  for (const c of Object.keys(meta.cameras || {})) camSel.add(new Option(c, c));
  const st = meta.stats || {};
  caption.innerHTML = `<b>${meta.title}</b><br>${escape(meta.prompt)}` + (meta.conditions ? `<br><i>${escape(meta.conditions)}</i>` : '')
    + `<br>${meta.modules.length} modules · ${st.objects ?? '?'} objects · ${st.tasks ?? '?'} tasks / ${st.levels ?? '?'} levels · ${meta.model}`;
  status.textContent = failed.length ? 'failed to build: ' + failed.join(', ') : '';
  setCam('overview');
}

function escape(s) { return String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }

// frame a rectangle of the ground plane, looking at the height of what actually stands there
function frame(rect, az = 225, el = 45, pad = 1.1) {
  const cx = (rect[0] + rect[2]) / 2, cz = (rect[1] + rect[3]) / 2, ext = Math.max(rect[2] - rect[0], rect[3] - rect[1]) * pad;
  const box = new THREE.Box3(); let n = 0;
  scene.traverse(o => { if (o.isMesh) { const b = new THREE.Box3().setFromObject(o); if (b.max.x >= rect[0] && b.min.x <= rect[2] && b.max.z >= rect[1] && b.min.z <= rect[3]) { box.union(b); n++; } } });
  const cy = n ? Math.min(box.max.y, (box.min.y + box.max.y) / 2) : current.y[0];
  camera.fov = 45; camera.updateProjectionMatrix();
  const d = ext / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  const a = THREE.MathUtils.degToRad(az), e = THREE.MathUtils.degToRad(el);
  camera.position.set(cx + d * Math.cos(e) * Math.sin(a), cy + d * Math.sin(e), cz + d * Math.cos(e) * Math.cos(a));
  controls.target.set(cx, cy, cz);
}

function setCam(name) {
  const c = current.cameras && current.cameras[name];
  if (c) { camera.position.fromArray(c.position); controls.target.fromArray(c.target); camera.fov = c.fov || 45; camera.updateProjectionMatrix(); }
  else frame(current.bounds);
  controls.update();
}

sel.onchange = () => { location.hash = sel.value; };
addEventListener('hashchange', () => { const id = location.hash.slice(1); if (list.scenes.some(s => s.id === id) && (!current || current.id !== id)) { sel.value = id; load(id); } });
camSel.onchange = () => setCam(camSel.value);
const start = list.scenes.some(s => s.id === location.hash.slice(1)) ? location.hash.slice(1) : list.scenes[0].id;
sel.value = start; await load(start);
renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); });
window.__gallery = { get scene() { return scene; }, camera, renderer, load, setCam };
