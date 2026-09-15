import {heightAt, bankZ, waterLevel, roadNetwork, layout, claimDistrict} from './root.js';

// Parent-owned approaches: children consume these coordinates, keeping boat works
// and vegetation clear of the same routes. All positions derive from root data.
export function landingPlan() {
  return layout().docks.map((d,i)=>{
    const bank=bankZ(d.x,d.side);
    const road=roadNetwork().find(r=>r.id===(d.side===1?'north-road':'south-lane'));
    let rz=0;
    for(let j=0;j<road.points.length-1;j++){
      const a=road.points[j],b=road.points[j+1];
      if(d.x>=Math.min(a[0],b[0])&&d.x<=Math.max(a[0],b[0]))rz=a[1]+(b[1]-a[1])*(d.x-a[0])/(b[0]-a[0]);
    }
    return {...d,id:['west','south','east'][i],bank,shoreZ:bank+d.side*2,tipZ:bank-d.side*d.length,deckY:waterLevel+1.15,roadZ:rz,pathWidth:2.5,pierWidth:3.6};
  });
}
export function claimWaterfrontPart(name) {
  const s=globalThis.__waterfrontParts ||= {claimed:new Set(),groups:{}};
  s.claimed.add(name);s.groups[name]?.removeFromParent();
}
export function build(THREE,ctx) {
  claimDistrict('waterfront');
  const g=new THREE.Group();g.name='Waterfront road approaches and grounded bank steps';
  const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.96});
  const stone=mat(0x969483);
  function box(parent,w,h,d,m,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.receiveShadow=true;o.castShadow=true;parent.add(o);return o;}
  for(const d of landingPlan()){
    // A narrow worn path rising directly from the landing to the existing lane.
    const n=Math.ceil(Math.abs(d.roadZ-d.shoreZ)/.65),v=[],ix=[];
    for(let j=0;j<=n;j++){
      const z=d.shoreZ+(d.roadZ-d.shoreZ)*j/n;
      for(const side of [-1,1]){const x=d.x+side*d.pathWidth/2;v.push(x,heightAt(x,z)+.24,z);}
      if(j<n){const k=j*2;ix.push(k,k+2,k+1,k+1,k+2,k+3);}
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(ix);geo.computeVertexNormals();
    const path=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0xb3a284,roughness:1,side:THREE.DoubleSide}));path.receiveShadow=true;g.add(path);
    // Sample every tread corner so its riser reaches the lower side of the
    // sloping bank instead of leaving the old thin stones above the ground.
    for(let j=0;j<9;j++){
      const z=d.shoreZ+d.side*(.45+j*.7),samples=[];
      for(const dx of [-1.225,0,1.225])for(const dz of [-.345,.345])samples.push(heightAt(d.x+dx,z+dz));
      const bottom=Math.min(...samples)-.12,top=Math.max(...samples)+.13;
      box(g,2.45,top-bottom,.69,stone,d.x,(top+bottom)/2,z);
    }
  }
  return g;
}
