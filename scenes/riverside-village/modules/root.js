// Riverside shared geography. Metres; x east, z north, y up.
export const waterLevel = 0.6;
export function riverCenter(x) { return 2.8*Math.sin(x/63)+1.4*Math.sin(x/29); }
export function riverHalfWidth(x) { return 25+2.6*Math.sin(x/75+0.8); }
export function bankZ(x, side=1) { return riverCenter(x)+side*riverHalfWidth(x); }
export function heightAt(x,z) {
  const d=Math.abs(z-riverCenter(x))-riverHalfWidth(x);
  if(d< -5) return -3.4+0.3*Math.sin(x/19);
  if(d<0) return -3.4+(d+5)*0.8;
  if(d<9) return 0.6+3.8*Math.pow(d/9,0.78);
  const inland=Math.max(0,(d-24)/90);
  return 4.4+0.30*Math.sin(x/28)*Math.sin(z/24)+Math.min(12,inland*inland*(5.8+3*Math.sin(x/48)+1.4*Math.cos(z/30)));
}
export function roadNetwork() { return [
  {id:'north-road',width:6.3,points:[[-500,70],[-190,57],[-132,55],[-95,51],[-57,48],[-22,49],[15,51],[48,55],[80,61],[112,66],[160,74],[195,79],[500,115]]},
  {id:'bridge-north',width:6,points:[[-22,31],[-22,49],[-25,82],[-34,125],[-45,180],[-110,500]]},
  {id:'bridge-south',width:6,points:[[-22,-31],[-22,-48],[-43,-69],[-61,-99],[-77,-147],[-85,-190],[-170,-500]]},
  {id:'south-lane',width:4.5,points:[[-500,-122],[-145,-68],[-108,-61],[-71,-55],[-22,-48],[14,-52],[40,-48],[59,-44],[88,-52],[128,-66],[180,-81],[500,-119]]},
  {id:'chapel-path',width:3.3,points:[[108,66],[110,79],[116,94]]}
]; }
export function layout() { return {
  bridge:{x:-22,z:riverCenter(-22),width:7.2,ends:[-36,36],deckY:7.1},
  mill:{x:55,z:-36,w:16,d:15,wheel:{x:55,z:bankZ(55,-1)+1.2,radius:5.1,axis:'z'},yard:[40,-59,80,-40]},
  chapel:{x:116,z:99,w:13,d:21},
  northHouses:[[-113,70],[-91,72],[-68,69],[-45,70],[2,72],[25,75],[49,80],[74,84],[-99,36],[-72,34],[1,35],[29,39],[-80,99],[-52,96],[1,103],[30,108]],
  northBarns:[[-117,109],[61,117]],
  southHouses:[[-109,-79],[-82,-78],[-58,-81],[-7,-77],[17,-78],[86,-75],[111,-85],[-94,-42],[-65,-38],[4,-37]],
  barns:[[-113,-111],[-74,-113],[-27,-105],[17,-111],[98,-115]],
  docks:[{x:-91,side:1,length:16},{x:82,side:-1,length:17},{x:14,side:1,length:11}],
  exclusions:{crossing:[-32,-39,-12,40],mill:[38,-61,80,-17],chapel:[101,83,135,119]},
  style:'An inhabited old European riverside village. Warm plaster and timber, terracotta and slate pitched roofs, worn stone, mossy banks, muted lively greens. Full 3D structures, metres.'
}; }
// Stable district claim API for completed descendants; temporary masses are retired.
export function claimDistrict(name) {
  const s=globalThis.__riversideClaims ||= {claimed:new Set(),groups:{}};
  s.claimed.add(name); s.groups[name]?.removeFromParent();
}
export function build(THREE,ctx) {
  const g=new THREE.Group(); g.name='Riverside terrain and shared routes';
  let category='terrain';
  const mat=(c)=>new THREE.MeshStandardMaterial({color:c,roughness:0.94});
  const mesh=(geo,m,x=0,y=0,z=0)=>{const a=new THREE.Mesh(geo,m);a.position.set(x,y,z);a.receiveShadow=true;a.userData.rootCategory=category;g.add(a);return a;};
  // Terrain continues far beyond the responsibility rectangle; no slab edges.
  const geo=new THREE.PlaneGeometry(1000,1000,240,240);geo.rotateX(-Math.PI/2);
  const p=geo.attributes.position,colors=[];const grass=new THREE.Color();
  for(let i=0;i<p.count;i++) {let x=p.getX(i),z=p.getZ(i);
    // Preserve the sampled village grid and stretch only distant terrain to the horizon.
    const extend=v=>Math.sign(v)*(Math.abs(v)<=350?Math.abs(v):350+(Math.abs(v)-350)*11);
    x=extend(x);z=extend(z);p.setX(i,x);p.setZ(i,z);let h=heightAt(x,z);p.setY(i,h);
    let d=Math.abs(z-riverCenter(x))-riverHalfWidth(x);
    grass.set(d<2?0x8b8a62:d<10?0x8b9b59:0x7f994f);
    const noise=Math.sin(x*1.72+z*1.41)*Math.cos(x*0.81-z*2.1);
    const meadow=Math.min(1,Math.max(0,(Math.abs(z)-115)/55));
    grass.lerp(new THREE.Color(0x9aa35f),meadow*(0.18+0.14*Math.sin(x/34+z/27)*Math.sin(z/19)));
    grass.multiplyScalar(0.94+noise*0.055+0.04*Math.sin(x/28+z/21)); colors.push(grass.r,grass.g,grass.b);
  }
  geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
  mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));
  category='river';
  // Continuous ribbon of water with shoreline following the shared functions.
  const vertices=[],ind=[];
  for(let i=0;i<=800;i++){const x=-2000+i*5;vertices.push(x,waterLevel,bankZ(x,-1),x,waterLevel,bankZ(x,1));if(i<800){let j=i*2;ind.push(j,j+1,j+2,j+1,j+3,j+2);}}
  const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));wg.setIndex(ind);wg.computeVertexNormals();
  mesh(wg,new THREE.MeshStandardMaterial({color:0x448d91,roughness:0.32,metalness:0.12,side:THREE.DoubleSide}));
  // Low, broken ribbons of reflected current, mainly east-west.
  const shimmer=mat(0x73b2ac);const shoreStone=mat(0x9b9c84);
  let seed=32457;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<300;i++){let x=random()*530-265,z=riverCenter(x)+(random()-.5)*(riverHalfWidth(x)*1.82);const a=mesh(new THREE.PlaneGeometry(0.8+random()*5.8,.08+random()*.17),shimmer,x,.64,z);a.rotation.x=-Math.PI/2;}
  category='meadows';
  for(let side of [-1,1])for(let i=0;i<160;i++){let x=-240+i*3+random()*2,z=bankZ(x,side)+side*(.5+random()*2.7);let a=mesh(new THREE.DodecahedronGeometry(.25+random()*.65,0),shoreStone,x,heightAt(x,z)+.05,z);a.scale.set(1.4,.55,.9);}
  category='roads';
  // A single colored road surface includes its shoulders: no overlapping road layers.
  const roadPlans=roadNetwork();
  function roadDistance(x,z,skip){let best=Infinity;
    for(const r of roadPlans){if(r.id===skip)continue;for(let i=1;i<r.points.length;i++){
      const a=r.points[i-1],b=r.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));
      best=Math.min(best,Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)-r.width/2);
    }}return best;
  }
  for(const r of roadPlans){const vs=[],ix=[],cs=[],points=r.points.map(p=>[...p]);
    // Continue existing boundary routes through the outer terrain.
    for(const endpoint of [0,points.length-1]){let a=points[endpoint],b=points[endpoint===0?1:points.length-2];if(Math.max(Math.abs(a[0]),Math.abs(a[1]))<490)continue;
      const dx=a[0]-b[0],dz=a[1]-b[1],scale=1500/Math.hypot(dx,dz);a[0]+=dx*scale;a[1]+=dz*scale;
    }
    for(let k=0;k<points.length-1;k++){const a=points[k],b=points[k+1],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),nx=-dz/len,nz=dx/len,n=Math.ceil(len/2);
      const offsets=[-r.width/2-.7,-r.width/2,0,r.width/2,r.width/2+.7],off=vs.length/3;
      for(let j=0;j<=n;j++)for(let q=0;q<5;q++){const x=a[0]+dx*j/n+nx*offsets[q],z=a[1]+dz*j/n+nz*offsets[q];
        const shoulder=(q===0||q===4)&&roadDistance(x,z,r.id)>.05;
        vs.push(x,heightAt(x,z)+.20,z);const c=new THREE.Color(shoulder?0xa99d78:0xc1af89);cs.push(c.r,c.g,c.b);
      }
      for(let j=0;j<n;j++)for(let q=0;q<4;q++){const m=off+j*5+q;ix.push(m,m+5,m+1,m+1,m+5,m+6);}
    }
    const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));rg.setAttribute('color',new THREE.Float32BufferAttribute(cs,3));rg.setIndex(ix);rg.computeVertexNormals();
    mesh(rg,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide}));
  }
  category='meadows';
  // Fine scattered meadow grass beyond child-owned farm grounds, leaving all roads clear.
  const bladeGeo=new THREE.BufferGeometry();bladeGeo.setAttribute('position',new THREE.Float32BufferAttribute([-.19,0,0,0,.55,0,.19,0,0,0,0,-.17,0,.43,0,0,0,.17],3));bladeGeo.computeVertexNormals();
  const tufts=new THREE.InstancedMesh(bladeGeo,new THREE.MeshStandardMaterial({color:0x8a9952,roughness:1,side:THREE.DoubleSide}),3200),dummy=new THREE.Object3D();let count=0;
  for(let i=0;i<4200&&count<3200;i++){const x=random()*540-270,z=(random()<.5?-1:1)*(154+random()*110);if(roadDistance(x,z,null)<2)continue;
    dummy.position.set(x,heightAt(x,z)+.015,z);dummy.rotation.y=random()*Math.PI;dummy.scale.setScalar(.6+random()*.9);dummy.updateMatrix();tufts.setMatrixAt(count++,dummy.matrix);
  }tufts.count=count;tufts.userData.rootCategory='meadows';g.add(tufts);
  // Distant hedgerows tie the scene into a larger landscape.
  const leafM=[mat(0x55743b),mat(0x698345),mat(0x768b48)],trunk=mat(0x6e5b3d);
  for(let i=0;i<125;i++){let x=random()*640-320,z=(random()<.5?-1:1)*(170+random()*115),y=heightAt(x,z),h=5+random()*6;if(roadDistance(x,z,null)<5)continue;
    mesh(new THREE.CylinderGeometry(.25,.5,h*.6,6),trunk,x,y+h*.3,z);
    let a=mesh(new THREE.IcosahedronGeometry(h*.40,1),leafM[i%3],x,y+h*.72,z);a.scale.set(1,1.12,.85);
  }
  return g;
}
