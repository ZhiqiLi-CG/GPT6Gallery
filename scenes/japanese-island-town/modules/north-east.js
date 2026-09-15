import { heightAt, roadNetwork, layout } from './root.js';
import { northReservations } from './north.js';

// Parent-owned common ground; children own every furnishing, fence, bed and shed.
export function build(THREE, ctx) {
 const group=new THREE.Group();group.name='Northeast market yard ground and access';
 const roads=roadNetwork(),reserve=northReservations(),all=layout().town.lots;
 const lots=all.map((l,i)=>({...l,i})).filter(l=>[28,29,34,35].includes(l.i));
 const earth=new THREE.MeshStandardMaterial({color:'#9a8b70',roughness:1,side:THREE.DoubleSide,vertexColors:true});
 const path=new THREE.MeshStandardMaterial({color:'#b2a38a',roughness:1,side:THREE.DoubleSide,vertexColors:true});
 const grit=new THREE.MeshStandardMaterial({color:'#a49d86',roughness:1});
 function distance(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);}
 function allowed(x,z,entry=false){
  if(x < -21 || x > 13 || z < -7 || z >29)return false;
  if(roads.some(r=>r.points.slice(1).some((p,i)=>distance(x,z,r.points[i],p)<r.width/2+(entry?-.005:.06))))return false;
  if(reserve.gardens.some(p=>Math.hypot(x-p.x,z-p.z)<p.r+.18))return false;
  if(x>=reserve.drains.x[0]&&x<=reserve.drains.x[1]&&reserve.drains.z.some(zz=>Math.abs(z-zz)<reserve.drains.halfWidth+.07)&&!lots.some(l=>Math.abs(x-l.x)<reserve.entryHalfWidth-.1))return false;
  if(lots.some(l=>Math.abs(x-l.x)<(9-l.i%3*.25)/2+.24&&Math.abs(z-l.z)<(7+l.i%2*.3)/2+.24))return false;
  return true;
 }
 const pebbles=[],drawn=[];
 // Subtract earlier ground rectangles so neighboring surfaces never overlap.
 function patch(x0,z0,x1,z1,mat,texture=false,entry=false){
  let parts=[[x0,z0,x1,z1]];
  for(const [a,b,c,d] of drawn){const next=[];for(const [x,z,X,Z] of parts){
   const loX=Math.max(x,a),hiX=Math.min(X,c),loZ=Math.max(z,b),hiZ=Math.min(Z,d);
   if(loX>=hiX||loZ>=hiZ){next.push([x,z,X,Z]);continue;}
   if(x<loX)next.push([x,z,loX,Z]);if(hiX<X)next.push([hiX,z,X,Z]);
   if(z<loZ)next.push([loX,z,hiX,loZ]);if(hiZ<Z)next.push([loX,hiZ,hiX,Z]);
  }parts=next;}
  drawn.push([x0,z0,x1,z1]);
  for(const r of parts)surface(...r,mat,texture,entry);
 }
 function surface(x0,z0,x1,z1,mat,texture,entry){
  const vertices=[],indices=[],colors=[],step=.20,nx=Math.ceil((x1-x0)/step),nz=Math.ceil((z1-z0)/step);
  function offset(x,z){
   if(!entry)return .045;
   const edge=Math.min(...roads.flatMap(r=>r.points.slice(1).map((p,i)=>distance(x,z,r.points[i],p)-r.width/2)));
   return .045+.195*Math.max(0,1-edge/.6);
  }
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){
   const xa=x0+(x1-x0)*i/nx,xb=x0+(x1-x0)*(i+1)/nx,za=z0+(z1-z0)*j/nz,zb=z0+(z1-z0)*(j+1)/nz;
   if(![[xa,za],[xb,za],[xa,zb],[xb,zb]].every(([x,z])=>allowed(x,z,entry)))continue;
   const n=vertices.length/3;for(const [x,z]of[[xa,za],[xa,zb],[xb,za],[xb,zb]]){
    vertices.push(x,heightAt(x,z)+offset(x,z),z);
    // Continuous soil mottling and smoother wear in the middle of existing paths.
    const m=.95+.035*Math.sin(x*3.7+z*1.3)+.025*Math.cos(x*1.2-z*4.1);
    colors.push(m,m,m);
   }
   indices.push(n,n+1,n+2,n+2,n+1,n+3);
   if(texture&&(i*7+j*11)%13===0){const x=(xa+xb)/2,z=(za+zb)/2;pebbles.push([x,heightAt(x,z)+.06,z]);}
  }
  if(!indices.length)return;
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,mat);mesh.receiveShadow=true;group.add(mesh);
 }
 for(const l of lots){
  const southern=l.z<0,front=southern?1.8:10.5,end=southern?5.48:14.3;
  patch(l.x-5.3,front,l.x+5.3,end,earth,true);
  // Clear central approach follows the stairs toward the public lane.
  patch(l.x-1.16,southern?5.48:9.75,l.x+1.16,southern?6.25:10.5,path,false,true);
  const left=l.x-5.35,right=l.x+5.35;
  patch(left,l.z-4.0,left+.66,l.z+5.8,path,true);
  patch(right-.66,l.z-4.0,right,l.z+5.8,path,true);
  if(!southern){
   patch(l.x-4.9,22.35,l.x+4.9,23.1,earth,true);
   patch(l.x-4.9,23.1,l.x-4.2,28.5,path,true);
   patch(l.x+4.2,23.1,l.x+4.9,28.5,path,true);
   patch(l.x-4.9,28.05,l.x+4.9,28.65,path,true);
  } else patch(l.x-4.9,-6.65,l.x+4.9,-5.85,earth,true);
 }
 const geo=new THREE.IcosahedronGeometry(1,0),im=new THREE.InstancedMesh(geo,grit,pebbles.length),d=new THREE.Object3D();pebbles.forEach((p,i)=>{d.position.set(...p);d.rotation.set(0,i*2.4,0);d.scale.set(.035+(i%3)*.01,.025,.055);d.updateMatrix();im.setMatrixAt(i,d.matrix);});im.receiveShadow=true;group.add(im);
 return group;
}
