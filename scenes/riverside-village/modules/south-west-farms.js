import { heightAt, bankZ, roadNetwork, layout, claimDistrict } from './root.js';
import { claimSouthCluster } from './south-bank.js';

// Local ownership handshake: descendants replace their complete holding together.
export function claimWestHolding(name) {
  const state = globalThis.__southWestHoldings ||= {claimed:new Set(), groups:{}};
  state.claimed.add(name);
  state.groups[name]?.removeFromParent();
  claimDistrict('south-bank');
  claimSouthCluster('west');
}

export function westFarmPlan() {
  const houses=layout().southHouses.filter(([x])=>x < -45).map(([sx,sz])=>({
    x:sx===-58?-61:sx, z:sx===-65?-42:sz, w:sx===-58?9:10, d:sx===-65?8:10,
    holding:sz>-60?'cottages':sx<-100?'orchard':'paddock', source:[sx,sz]
  }));
  const barns=layout().barns.filter(([x])=>x < -45).map(([sx,z])=>({
    x:sx===-74?-82:sx,z,w:13,d:17,holding:sx<-100?'orchard':'paddock',source:[sx,z]
  }));
  return {houses,barns,shoreClearance:7,roadShoulder:1.2};
}

export function nearestWestRoad(x,z) {
  let best=null;
  for(const road of roadNetwork().filter(r=>r.id==='south-lane'||r.id==='bridge-south')) {
    for(let i=1;i<road.points.length;i++) {
      const [ax,az]=road.points[i-1],[bx,bz]=road.points[i];
      const t=Math.max(0,Math.min(1,((x-ax)*(bx-ax)+(z-az)*(bz-az))/((bx-ax)**2+(bz-az)**2)));
      const px=ax+t*(bx-ax),pz=az+t*(bz-az),distance=Math.hypot(x-px,z-pz);
      if(!best||distance<best.distance)best={x:px,z:pz,distance,width:road.width,id:road.id};
    }
  }
  return best;
}

// All three complete holdings now live in their child modules. Keep the shared
// plan and claim handshake, but retire provisional masses, paths and planting.
export function build(THREE, ctx) {
  claimDistrict('south-bank');
  claimSouthCluster('west');
  const group = new THREE.Group();
  group.name = 'South-west farms: completed holding integration';
  return group;
}
