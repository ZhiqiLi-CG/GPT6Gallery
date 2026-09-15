import { heightAt, roadNetwork, layout } from './root.js';

// Shared fitted side/rear ground for the four east-block yards. House shells,
// street forecourts and drainage are respectively town, middle and root owned.
export function build(THREE, ctx) {
 const group=new THREE.Group(); group.name='Eastern block worked side and rear yards';
 const mat=new THREE.MeshStandardMaterial({color:'#958870',roughness:1});
 const gravel=new THREE.MeshStandardMaterial({color:'#aaa08a',roughness:1});
 const dark=new THREE.MeshStandardMaterial({color:'#776f5a',roughness:1});
 const geo=new THREE.BoxGeometry(1,1,1), dummy=new THREE.Object3D(), chips=[[],[]];
 const roads=roadNetwork();
 const onRoad=(x,z)=>roads.some(r=>r.points.slice(1).some((b,i)=>{const a=r.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)<r.width/2+.45;}));
 function patch(x0,z0,x1,z1,seed){
  const p=[],indices=[],nx=Math.ceil((x1-x0)/.35),nz=Math.ceil((z1-z0)/.35);
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
   const x=x0+(x1-x0)*i/nx,z=z0+(z1-z0)*j/nz;
   p.push(x,heightAt(x,z)+.037,z);
   if(i<nx&&j<nz){const a=j*(nx+1)+i;indices.push(a,a+nx+1,a+1,a+1,a+nx+1,a+nx+2);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geometry.setIndex(indices);geometry.computeVertexNormals();const mesh=new THREE.Mesh(geometry,mat);mesh.receiveShadow=true;group.add(mesh);
  const n=Math.ceil((x1-x0)*(z1-z0)*4);
  for(let k=0;k<n;k++){
   const u=((k*79+seed*17)%997)/997,v=((k*151+seed*43)%991)/991;
   const x=x0+.08+u*(x1-x0-.16),z=z0+.08+v*(z1-z0-.16);
   if(onRoad(x,z))continue;
   dummy.position.set(x,heightAt(x,z)+.06,z);dummy.rotation.set(0,k*2.399,0);dummy.scale.set(.035+k%4*.018,.018,.035+k%3*.019);dummy.updateMatrix();chips[k%2].push(dummy.matrix.clone());
  }
 }
 for(const [i,l] of layout().town.lots.entries()){
  if(![-7,5].includes(l.x)||![-32,-12].includes(l.z))continue;
  const w=l.w-i%3*.25,d=7+i%2*.3,left=l.x===-7?-16.78:-.92,right=l.x===-7?-1.08:12.78;
  const south=l.z===-32?-37.82:-19.06,north=l.z===-32?-24.94:-7.18;
  patch(left,south,l.x-w/2-.18,north,i);
  patch(l.x+w/2+.18,south,right,north,i+20);
  if(l.z===-32)patch(l.x-w/2-.18,south,l.x+w/2+.18,l.z-d/2-.18,i+40);
  else patch(l.x-w/2-.18,l.z+d/2+.18,l.x+w/2+.18,north,i+40);
 }
 chips.forEach((items,j)=>{const mesh=new THREE.InstancedMesh(geo,j?dark:gravel,items.length);items.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.receiveShadow=true;group.add(mesh);});
 return group;
}
