import { claimDistrict } from './root.js';

// Stable replacement hook used by both delivered engineering modules.
// Scaffolds were retired after whole-again inspection. Retain the hook so the
// children remain independent of module composition order.
export function claimStructure(name) {
  const state = globalThis.__crossingMillClaims ||= { claimed: new Set(), groups: {} };
  state.claimed.add(name);
  state.groups[name]?.removeFromParent();
}

export function build(THREE, ctx) {
  claimDistrict('crossing-mill');
  const group = new THREE.Group();
  group.name = 'Crossing and mill — completed engineering district';
  group.userData.task = 'crossing-mill';
  group.userData.structures = ['crossing-mill-bridge', 'crossing-mill-mill'];
  // Geometry and detailed object records remain in their owning child modules.
  return group;
}
