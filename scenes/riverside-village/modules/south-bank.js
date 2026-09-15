import { heightAt, bankZ, claimDistrict } from './root.js';

// Completed holdings live in descendant modules. Preserve their claim API
// and the root district claim; this module owns the continuous landing access.
export function claimSouthCluster(name) {
  const state = globalThis.__southBankClusters ||= { claimed:new Set(), groups:{} };
  state.claimed.add(name);
  state.groups[name]?.removeFromParent();
  claimDistrict('south-bank');
}

export function build(THREE, ctx) {
  claimDistrict('south-bank');
  const g = new THREE.Group(); g.name='South bank: completed settlement and landing access';
  // All fifteen principal buildings and farm grounds are owned by delivered
  // descendants. Temporary district masses are permanently retired.
  // x=82 access is deliberately narrow, outside the mill reserve ending x=80.
  const points=[],indices=[],northEnd=bankZ(82,-1)-5;
  const steps=Math.ceil((northEnd+64)/1.5);
  for(let i=0;i<=steps;i++) {
    const z=-64+(northEnd+64)*i/steps;
    for(const x of [80.8,83.2])points.push(x,heightAt(x,z)+.24,z);
    if(i<steps){const a=i*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));geo.setIndex(indices);geo.computeVertexNormals();
  const access=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0xb7a77e,roughness:1,side:THREE.DoubleSide}));
  access.name='south-bank landing access';access.receiveShadow=true;g.add(access);
  return g;
}
