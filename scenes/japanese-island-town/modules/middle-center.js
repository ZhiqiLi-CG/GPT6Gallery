import { heightAt, roadNetwork, layout } from './root.js';

// Only fitted shoulder grounds. Children own all fences, gardens and household/shop contents.
export function build(THREE, ctx) {
 const group = new THREE.Group(); group.name = 'Central block side and rear yard grounds';
 const mats = [new THREE.MeshStandardMaterial({color:'#978971',roughness:1}),new THREE.MeshStandardMaterial({color:'#a0957c',roughness:1}),new THREE.MeshStandardMaterial({color:'#8a816b',roughness:1})];
 const stoneMat=new THREE.MeshStandardMaterial({color:'#9b9b87',roughness:1});
 const roads=roadNetwork(), lots=layout().town.lots.filter(l=>(l.x===-43||l.x===-31)&&(l.z===-32||l.z===-12));
 if(lots.length!==4)throw new Error('Central block requires its four root lots');
 function roadClear(x,z){return !roads.some(r=>r.points.slice(1).some((b,i)=>{const a=r.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)<r.width/2+(r.id==='market-middle'?.75:.45);}));}
 const patches=[
 [-52.7,-37.8,-48.33,-25,0],[-37.67,-37.8,-36.33,-25,1],[-25.67,-37.8,-21.25,-25,1],
 [-48.33,-37.8,-37.67,-35.8,0],[-36.33,-37.8,-25.67,-35.95,1],
 [-52.7,-19,-48.33,-7.15,2],[-37.67,-19,-36.33,-7.15,1],[-25.67,-19,-21.25,-7.15,0],
 [-48.33,-8.2,-37.67,-7.15,2],[-36.33,-8.05,-25.67,-7.15,0]
 ];
 const stones=[], dummy=new THREE.Object3D();
 for(const [pindex,p] of patches.entries()){
  const [x0,z0,x1,z1,m]=p,nx=Math.ceil((x1-x0)/.35),nz=Math.ceil((z1-z0)/.35),vertices=[],indices=[];
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const x=x0+(x1-x0)*i/nx,z=z0+(z1-z0)*j/nz;vertices.push(x,heightAt(x,z)+.045,z);if(i<nx&&j<nz&&roadClear(x,z)){const a=j*(nx+1)+i;indices.push(a,a+nx+1,a+1,a+1,a+nx+1,a+nx+2);}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,mats[m]);mesh.receiveShadow=true;group.add(mesh);
  // Tiny embedded irregular stones break up the worn earth, leaving room for child gardens.
  const count=Math.ceil((x1-x0)*(z1-z0)*2.8);
  for(let k=0;k<count;k++){const x=x0+.09+((k*43+pindex*17)%193)/193*(x1-x0-.18),z=z0+.09+((k*71+pindex*29)%197)/197*(z1-z0-.18);if(!roadClear(x,z))continue;dummy.position.set(x,heightAt(x,z)+.06,z);dummy.rotation.set(0,k*2.3,0);dummy.scale.set(.04+(k%3)*.025,.023,.055+(k%4)*.017);dummy.updateMatrix();stones.push(dummy.matrix.clone());}
 }
 const gravel=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),stoneMat,stones.length);stones.forEach((m,i)=>gravel.setMatrixAt(i,m));gravel.receiveShadow=true;group.add(gravel);
 return group;
}
