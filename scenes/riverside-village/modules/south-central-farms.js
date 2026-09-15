import { heightAt, bankZ, roadNetwork, layout, claimDistrict } from './root.js';
import { claimSouthCluster } from './south-bank.js';

// Descendants claim complete holdings, including temporary yards and access.
// This is order-independent so modules may be composed alphabetically.
export function claimCentralHolding(name) {
  const s = globalThis.__centralFarmHoldings ||= {claimed:new Set(),groups:{}};
  s.claimed.add(name);
  s.groups[name]?.removeFromParent();
  claimSouthCluster('central');
}

export function centralHoldings() {
  const sites=layout();
  const house=x=>sites.southHouses.find(p=>p[0]===x);
  const barn=x=>sites.barns.find(p=>p[0]===x);
  const lane=roadNetwork().find(r=>r.id==='south-lane');
  function laneAt(x) {
    for(let i=1;i<lane.points.length;i++) {
      const a=lane.points[i-1],b=lane.points[i];
      if(x>=a[0]&&x<=b[0])return [x,a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0])];
    }
  }
  return {
    west:{houses:[house(-7)],barns:[barn(-27)],court:[-19,-93,21,15],
      access:[[-27,-96],[-19,-91],[-19,-67],[-19,-55]],
      roadAccess:[[-19,-55],laneAt(-19)],
      doorPath:[[-7,-71.5],[-7,-67],[-19,-67]],
      garden:[-7,-111,12,15],pasture:[-23,-134,32,20]},
    east:{houses:[house(17)],barns:[barn(17)],court:[20,-94,22,15],
      access:[[17,-102],[29,-95],[29,-65],[29,-55]],
      roadAccess:[[29,-55],laneAt(29)],
      doorPath:[[17,-72.5],[17,-65],[29,-65]],
      garden:[10,-135,10,19],pasture:[28,-135,14,23]},
    cottage:{houses:[house(4)],barns:[],court:[17,-40,12,7],
      access:[[4,-42.5],[4,-46],laneAt(4)],
      doorPath:[[9,-41],[16,-43],[18,-43]],
      garden:[29,-40,9,8],shoreLimit:bankZ(4,-1)-5}
  };
}

export function build(THREE,ctx) {
  claimDistrict('south-bank'); claimSouthCluster('central');
  const g=new THREE.Group();
  g.name='South central farms: permanent shared lane connections';
  // All three descendants now own their completed holdings. No temporary
  // buildings or plots remain in this module; their claim API stays compatible.
  const holdings=centralHoldings();
  for(const [name,width,startLift,color] of [
    ['west',2.3,.29,0xb29c75],['east',2.25,.13,0xa28d67]
  ]) {
    const [a,b]=holdings[name].roadAccess;
    const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),steps=Math.ceil(len/.5);
    const vertices=[],indices=[],colors=[];
    const farmColor=new THREE.Color(color),laneColor=new THREE.Color(0xc1af89);
    for(let j=0;j<=steps;j++) {
      const t=j/steps,flare=Math.max(0,(t-.55)/.45);
      const w=width+flare*.75,lift=startLift+(.215-startLift)*t;
      const c=farmColor.clone().lerp(laneColor,t);
      for(const side of [-1,1]) {
        const x=a[0]+dx*t-dz/len*w/2*side,z=a[1]+dz*t+dx/len*w/2*side;
        vertices.push(x,heightAt(x,z)+lift,z);colors.push(c.r,c.g,c.b);
      }
      if(j<steps) {const k=j*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    geo.setIndex(indices);geo.computeVertexNormals();
    const path=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));
    path.name='south-central-farms '+name+' road mouth';path.receiveShadow=true;g.add(path);
  }
  return g;
}
