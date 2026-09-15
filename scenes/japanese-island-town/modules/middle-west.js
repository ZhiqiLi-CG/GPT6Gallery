import { heightAt, roadNetwork, layout } from './root.js';

// Permanent fitted side-yard grounds. Descendants own furnishings and planting.
export function build(THREE,ctx){
 const group=new THREE.Group();group.name='Middle west fitted working yards and kitchen garden grounds';
 const mats={};for(const [k,color] of Object.entries({earth:'#91846d',gravel:'#a69a80',soil:'#625844',stone:'#868779',light:'#a09e8c',moss:'#73785a'}))mats[k]=new THREE.MeshStandardMaterial({color,roughness:1});
 const geo=new THREE.BoxGeometry(1,1,1),batches={},dummy=new THREE.Object3D();
 function box(x,y,z,w,h,d,m,ry=0){dummy.position.set(x,y,z);dummy.rotation.set(0,ry,0);dummy.scale.set(w,h,d);dummy.updateMatrix();(batches[m]??=[]).push(dummy.matrix.clone());}
 const roads=roadNetwork(),lots=layout().town.lots.filter(l=>[-78,-66].includes(l.x)&&[-32,-12].includes(l.z));
 function blocked(x,z){return roads.some(r=>r.points.slice(1).some((b,i)=>{const a=r.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)<r.width/2+.76;}))||lots.some(l=>Math.abs(x-l.x)<1.22&&((l.z===-32&&z>-28.5)||(l.z===-12&&z<-15.5)));}
 function ground(x0,z0,x1,z1,m,offset=.052){const p=[],ix=[],nx=Math.ceil((x1-x0)/.4),nz=Math.ceil((z1-z0)/.4);for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){let x=x0+(x1-x0)*i/nx,z=z0+(z1-z0)*j/nz;p.push(x,heightAt(x,z)+offset,z);if(i<nx&&j<nz){let a=j*(nx+1)+i;ix.push(a,a+nx+1,a+1,a+1,a+nx+1,a+nx+2);}}let g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();let mesh=new THREE.Mesh(g,mats[m]);mesh.receiveShadow=true;group.add(mesh);}
 const pads=[[-91.7,-37.65,-83.45,-24.82],[-91.7,-19.18,-83.45,-7.25],[-60.55,-37.65,-57.2,-24.82],[-60.55,-19.18,-57.2,-7.25],[-72.6,-37.65,-71.4,-28.3],[-72.6,-15.7,-71.4,-7.25]];
 // Rear service strips join the side paths, keeping the shared ground continuous
 // behind the houses while remaining beyond their masonry foundations.
 for(const [x0,x1] of [[-83.45,-72.6],[-71.4,-60.55]]){
  ground(x0,-37.65,x1,-35.9,'earth');
  ground(x0,-8.2,x1,-7.25,'earth');
  for(const [z0,z1] of [[-37.65,-35.9],[-8.2,-7.25]])for(let k=0;k<64;k++){
   const x=x0+.1+((k*37)%67)/67*(x1-x0-.2),z=z0+.08+((k*29)%71)/71*(z1-z0-.16);
   box(x,heightAt(x,z)+.068,z,.05+(k%3)*.017,.023,.04+(k%4)*.014,k%4?'stone':'light',k*1.618);
  }
 }
 pads.forEach((r,i)=>{ground(...r,i<2?'earth':'gravel');for(let k=0;k<(i<2?310:100);k++){let x=r[0]+.13+((k*47+i*13)%317)/317*(r[2]-r[0]-.26),z=r[1]+.13+((k*113+i*19)%331)/331*(r[3]-r[1]-.26);if(blocked(x,z))continue;box(x,heightAt(x,z)+.068,z,.045+(k%5)*.016,.024,.05+(k%4)*.018,k%4?'stone':'light',k*1.618);}});
 function bed(x0,z0,x1,z1){ground(x0,z0,x1,z1,'soil',.08);for(let x=x0+.2;x<x1;x+=.43)for(const z of [z0,z1])box(x,heightAt(x,z)+.14,z,.4,.22,.22,'stone');for(let z=z0+.2;z<z1;z+=.43)for(const x of [x0,x1])box(x,heightAt(x,z)+.14,z,.22,.22,.4,'stone');for(let z=z0+.4;z<z1-.1;z+=.55)for(let x=x0+.3;x<x1-.15;x+=.24)box(x,heightAt(x,z)+.12,z,.25,.08,.14,'soil');}
 bed(-91,-36.8,-87.2,-33.3);
 bed(-90.9,-12.1,-86.1,-8.15);
 // Stepping stones lead to broad shoulder workspaces, never across a house entry.
 for(const zz of [-26.0,-18.05])for(let k=0;k<10;k++){let x=-90.8+k*.73,z=zz+Math.sin(k*.8)*.1;if(!blocked(x,z))box(x,heightAt(x,z)+.1,z,.57,.14,.47,k%3?'stone':'light',Math.sin(k)*.12);}
 // Outer yard edges: individual low stones follow terrain rather than spanning it.
 for(const [z0,z1] of [[-37.5,-24.95],[-18.99,-7.4]])for(let z=z0;z<z1;z+=.51)box(-91.72,heightAt(-91.72,z)+.14,z,.28,.23,.47,Math.floor(z*3)%4?'stone':'moss');
 for(const [m,arr] of Object.entries(batches)){let mesh=new THREE.InstancedMesh(geo,mats[m],arr.length);arr.forEach((mx,i)=>mesh.setMatrixAt(i,mx));mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}
 return group;
}
