import {heightAt, roadNetwork, layout} from './root.js';

// Middle owns only forecourt ground surfaces and the shared street-edge drains.
// Its children own garden, shop and domestic detail around these surfaces.
export function build(THREE,ctx){
 const g=new THREE.Group();g.name='Middle street fitted forecourts and stone drainage';
 const colors={earth:'#968971',gravel:'#aea28b',stone:'#818477',light:'#a09f8c',dark:'#555c52',wood:'#67513b'};
 const mats={};for(const [k,v] of Object.entries(colors))mats[k]=new THREE.MeshStandardMaterial({color:v,roughness:.97});
 const geo=new THREE.BoxGeometry(1,1,1),batches={},dummy=new THREE.Object3D();
 function box(x,y,z,w,h,d,m,ry=0){if(!batches[m])batches[m]=[];dummy.position.set(x,y,z);dummy.rotation.set(0,ry,0);dummy.scale.set(w,h,d);dummy.updateMatrix();batches[m].push(dummy.matrix.clone());}
 function surface(x0,z0,x1,z1,m,offset=.055){const p=[],idx=[],nx=Math.ceil((x1-x0)/.45),nz=Math.ceil((z1-z0)/.45);for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const x=x0+(x1-x0)*i/nx,z=z0+(z1-z0)*j/nz;p.push(x,heightAt(x,z)+offset,z);if(i<nx&&j<nz){const a=j*(nx+1)+i;idx.push(a,a+nx+1,a+1,a+1,a+nx+1,a+nx+2);}}const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geom.setIndex(idx);geom.computeVertexNormals();const mesh=new THREE.Mesh(geom,mats[m]);mesh.receiveShadow=true;g.add(mesh);}
 const roads=roadNetwork();
 function inRoad(x,z,pad=0){return roads.some(r=>r.points.slice(1).some((b,i)=>{const a=r.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)<r.width/2+pad;}));}
 for(const [i,l] of layout().town.lots.entries()){
  if(l.z!==-32&&l.z!==-12)continue;
  const s=l.face==='north'?1:-1,d=7+(i%2)*.3,z0=l.z===-32?l.z+d/2+.28:-19.35,z1=l.z===-32?-24.65:l.z-d/2-.28;
  surface(l.x-5.3,z0,l.x+5.3,z1,i%3?'earth':'gravel');
  // Low staggered threshold stones meet the parent stairs, keeping a full 2.4 m clear approach.
  const end=l.z+s*(d/2+4.06),street=l.z===-32?-24.38:-19.62;
  surface(l.x-1.2,Math.min(end,street),l.x+1.2,Math.max(end,street),'gravel',.075);
  for(let k=0;k<3;k++){const x=l.x-.79+k*.79;box(x,heightAt(x,street)+.12,street,.75,.13,.71,k%2?'light':'stone');}
  // Fine embedded chips give the packed earth its worked surface at close camera distance.
  for(let k=0;k<93;k++){const u=((k*47+i*13)%101)/101,v=((k*61+i*19)%103)/103,x=l.x-5.14+u*10.28,z=z0+.10+v*(z1-z0-.2);if(Math.abs(x-l.x)<1.25)continue;box(x,heightAt(x,z)+.075,z,.055+(k%3)*.023,.025,.045+(k%4)*.02,k%3?'stone':'light',k*1.31);}
 }
 // Segmented, terrain-following stone-lined channels flank the root gravel street.
 // Cross streets and all twelve door corridors interrupt the channels.
 for(const z of [-24.48,-19.52])for(let x=-89;x<10.6;x+=.42){
  if(inRoad(x,z,.14))continue;
  const entrance=layout().town.lots.some(l=>(l.z===-32||l.z===-12)&&Math.abs(x-l.x)<1.24);
  if(entrance)continue;
  box(x,heightAt(x,z)+.067,z,.40,.055,.28,'dark');
  for(const dz of [-.18,.18])box(x,heightAt(x,z+dz)+.14,z+dz,.39,.18,.13,Math.floor(x*3)%3?'stone':'light');
  if(Math.round((x+89)/.42)%17===0)box(x,heightAt(x,z)+.18,z,.34,.065,.41,'stone');
 }
 for(const [m,items] of Object.entries(batches)){const mesh=new THREE.InstancedMesh(geo,mats[m],items.length);items.forEach((v,i)=>mesh.setMatrixAt(i,v));mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);}
 return g;
}
