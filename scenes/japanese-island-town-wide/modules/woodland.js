import { heightAt, roadNetwork, layout, streamX } from './root.js';

// All placements are deterministic and all shared geography is read from root.
const TAU=Math.PI*2;
function rng(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296}}
const land=layout(), districts=land.districts.filter(d=>d.id!=='woodland'),roads=roadNetwork();
function segmentDistance(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)}
export function residual(x,z,r=0){
 if(districts.some(({rect:q})=>x+r>q[0]-2&&x-r<q[2]+2&&z+r>q[1]-2&&z-r<q[3]+2))return false;
 if(land.lots.some(p=>Math.abs(x-p.x)<p.w/2+r&&Math.abs(z-p.z)<p.d/2+r))return false;
 if(Math.abs(x-streamX(z))<9+r)return false;
 for(const road of roads)for(let k=1;k<road.points.length;k++)if(segmentDistance(x,z,road.points[k-1],road.points[k])<road.width/2+1+r)return false;
 return true;
}
function dry(x,z,r,minimum=0.65){if(heightAt(x,z)<minimum)return false;for(let k=0;k<8;k++)if(heightAt(x+Math.cos(k*TAU/8)*r,z+Math.sin(k*TAU/8)*r)<minimum)return false;return true}
export const clearings=[{id:'south_meadow',x:-18,z:-74,rx:10,rz:6},{id:'headland_glade',x:82,z:13,rx:7,rz:9},{id:'north_glade',x:-42,z:63,rx:6,rz:5}];
function inClearing(x,z,r=0){return clearings.some(c=>((x-c.x)/(c.rx+r))**2+((z-c.z)/(c.rz+r))**2<1)}
export function treePlacements(){
 const rand=rng(746192),out=[];
 for(let trial=0;trial<40000&&out.length<118;trial++){
  const x=-110+rand()*220,z=-92+rand()*184,r=2.2+rand()*1.05;
  if(!residual(x,z,r)||!dry(x,z,r,1.2)||inClearing(x,z,r))continue;
  if(out.some(p=>Math.hypot(x-p.x,z-p.z)<(p.r+r)*0.93+0.7))continue;
  if(rand()>0.65+0.25*Math.sin(x/11+Math.cos(z/9)))continue;
  const cherry=out.filter(p=>p.cherry).length<11&&z<70&&heightAt(x,z)>3&&rand()<0.15;
  const h=cherry?5.1+rand()*2.2:z<-58?4.8+rand()*2.4:7.1+rand()*5;
  out.push({x,z,r,h,y:heightAt(x,z),cherry,seed:Math.floor(rand()*1e8)});
 }
 return out;
}
export function sceneObjects(){
 const out=treePlacements().map((p,i)=>({id:`woodland_${p.cherry?'cherry':'pine'}_${String(i+1).padStart(3,'0')}`,kind:p.cherry?'flowering-cherry-tree':'coastal-pine-tree',bbox:[p.x-p.r,p.y-0.2,p.z-p.r,p.x+p.r,p.y+p.h+0.9,p.z+p.r]}));
 for(const c of clearings)out.push({id:`woodland_${c.id}`,kind:'open-grassy-clearing',bbox:[c.x-c.rx,0,c.z-c.rz,c.x+c.rx,17,c.z+c.rz]});
 return out;
}
export function build(THREE,ctx){
 const group=new THREE.Group();group.name='woodland_residual_island_forest';
 const rand=rng(481519),matrix=new THREE.Matrix4(),dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),batches=new Map();
 const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:0.98});
 const bark=mat(0x615040),barkLight=mat(0x776450),barkDark=mat(0x423a30),dead=mat(0x92836a);
 const pineM=[mat(0x304b39),mat(0x3d5840),mat(0x4b6545),mat(0x536b45)];
 const flowerM=[mat(0xd49d9f),mat(0xe6b6b9),mat(0xf1cecb)];
 const grassM=[mat(0x657549),mat(0x7c8954),mat(0x939163)];
 const rockM=[mat(0x777970),mat(0x8b8b7e),mat(0x656d67)],lichen=mat(0x9da183);
 const cyl=new THREE.CylinderGeometry(0.65,1,1,8),thin=new THREE.CylinderGeometry(0.6,1,1,5);
 const trunkGeos=Array.from({length:6},(_,i)=>new THREE.CylinderGeometry((1-(i+1)/6*.82)/(1-i/6*.82),1,1,9));
 function inst(geo,m,p,s,rot=null){const key=geo.uuid+m.uuid;let batch=batches.get(key);if(!batch){batch={geo,m,transforms:[]};batches.set(key,batch)}dummy.position.set(...p);dummy.scale.set(...s);dummy.rotation.set(0,0,0);if(rot)dummy.rotation.set(...rot);dummy.updateMatrix();batch.transforms.push(dummy.matrix.clone())}
 function limb(a,b,r,m=bark,geo=cyl){const aa=new THREE.Vector3(...a),bb=new THREE.Vector3(...b),d=bb.clone().sub(aa);dummy.position.copy(aa).add(bb).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(up,d.clone().normalize());dummy.scale.set(r,d.length(),r);dummy.updateMatrix();const key=geo.uuid+m.uuid;let batch=batches.get(key);if(!batch){batch={geo,m,transforms:[]};batches.set(key,batch)}batch.transforms.push(dummy.matrix.clone())}
 function geometry(vertices){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.computeVertexNormals();return g}
 // A needle spray is many intersecting tapered needles, not a billboard or crown sphere.
 const nv=[];for(let k=0;k<48;k++){const a=k*2.399963,t=k/48,ex=Math.cos(a)*(0.7+0.3*Math.sin(k*8)),ez=Math.sin(a)*(0.7+0.3*Math.sin(k*8)),ey=(t-.3)*.55;const ox=-Math.sin(a)*.016,oz=Math.cos(a)*.016;nv.push(ox,0,oz,ex,ey,ez,-ox,0,-oz,0,.016,0,ex,ey,ez,0,-.016,0)}const needle=geometry(nv);
 const core=new THREE.IcosahedronGeometry(1,0);
 // Blossom tuft: seven distinct flowers, five cupped petals per flower.
 const fv=[];for(let n=0;n<7;n++){const a=n*2.39996,cx=Math.cos(a)*.62*Math.sqrt(n/7),cz=Math.sin(a)*.62*Math.sqrt(n/7),cy=.2*Math.sin(n*6);for(let k=0;k<5;k++){const t=k*TAU/5,s=t+.43,u=t-.43;fv.push(cx,cy,cz,cx+Math.cos(s)*.23,cy+.055,cz+Math.sin(s)*.23,cx+Math.cos(t)*.34,cy+.1,cz+Math.sin(t)*.34,cx,cy,cz,cx+Math.cos(t)*.34,cy+.1,cz+Math.sin(t)*.34,cx+Math.cos(u)*.23,cy+.055,cz+Math.sin(u)*.23)}}const blossom=geometry(fv);flowerM.forEach(m=>m.side=THREE.DoubleSide);
 const gv=[];for(let j=0;j<9;j++){const a=j*2.39996,l=.45+(j%4)*.18,x=Math.cos(a),z=Math.sin(a),w=.03;gv.push(-z*w,0,x*w,z*w,0,-x*w,x*.17+z*w,l*.6,z*.17-x*w,-z*w,0,x*w,x*.17+z*w,l*.6,z*.17-x*w,x*.17-z*w,l*.6,z*.17+x*w,x*.17-z*w,l*.6,z*.17+x*w,x*.17+z*w,l*.6,z*.17-x*w,x*.44,l,z*.44)}const grass=geometry(gv);grassM.forEach(m=>m.side=THREE.DoubleSide);
 function tuft(x,y,z,size,m,rngLocal){inst(core,m,[x,y,z],[size*.55,size*.25,size*.55],[0,rngLocal()*TAU,0]);inst(needle,m,[x,y+.02,z],[size,size*.9,size],[rngLocal()*.2,rngLocal()*TAU,rngLocal()*.15])}
 for(const [index,p] of treePlacements().entries()){
  const r=rng(p.seed),base=[p.x,p.y-.08,p.z],az=r()*TAU,drift=.65+r()*.55,pts=[base];
  for(let k=1;k<=6;k++){const t=k/6;pts.push([p.x+Math.sin(az+t*3)*drift*t,p.y+p.h*t,p.z+Math.cos(az+t*4)*drift*t]);limb(pts[k-1],pts[k],(.29+(p.h-5)*.026)*(1-(k-1)/6*.82),k%2?bark:barkLight,trunkGeos[k-1]);if(k<5)for(let q=0;q<3;q++){const a=q*TAU/3+az,rr=(.29+(p.h-5)*.026)*(1-t*.75);const aa=pts[k-1].map((v,i)=>v+(i===0?Math.cos(a)*rr:i===2?Math.sin(a)*rr:0)),bb=pts[k].map((v,i)=>v+(i===0?Math.cos(a)*rr*.7:i===2?Math.sin(a)*rr*.7:0));limb(aa,bb,.014,barkDark,thin)}}
  // Buttress roots bend over the actual local surface and bury their tips.
  for(let j=0;j<6;j++){const a=az+j*TAU/6,len=.65+r()*.65,x=p.x+Math.cos(a)*len,z=p.z+Math.sin(a)*len,mid=[p.x+Math.cos(a)*len*.4,heightAt(p.x+Math.cos(a)*len*.4,p.z+Math.sin(a)*len*.4)+.14,p.z+Math.sin(a)*len*.4];limb([p.x,p.y+.25,p.z],mid,.14,bark);limb(mid,[x,heightAt(x,z)+.03,z],.085,bark)}
  if(!p.cherry){
   for(let level=0;level<4;level++){const t=.43+level*.155,src=pts[Math.min(5,Math.round(t*6))],reach=p.r*(.78-level*.11);
    for(let arm=0;arm<3;arm++){const a=az+arm*TAU/3+level*1.36+r()*.4,end=[p.x+Math.cos(a)*reach, p.y+p.h*t+.22+r()*.35,p.z+Math.sin(a)*reach],elbow=[src[0]+Math.cos(a)*reach*.54,src[1]-.15,src[2]+Math.sin(a)*reach*.54];limb(src,elbow,.09*(1-level*.16),bark);limb(elbow,end,.055*(1-level*.12),barkLight);
     for(let branch=0;branch<3;branch++){const aa=a+(branch-1)*.6,rr=reach*(.64+branch*.09),tip=[p.x+Math.cos(aa)*rr,end[1]+(branch%2)*.18,p.z+Math.sin(aa)*rr];limb(elbow,tip,.025,barkLight,thin);
      for(let j=0;j<7;j++){const at=j*2.39996+aa,spread=.24+(j%3)*.09,x=tip[0]+Math.cos(at)*spread,z=tip[2]+Math.sin(at)*spread,size=.51+r()*.17;const d=Math.hypot(x-p.x,z-p.z),limit=p.r-size*1.08-.05,f=Math.min(1,limit/d);tuft(p.x+(x-p.x)*f,tip[1]+r()*.16,p.z+(z-p.z)*f,size,pineM[(index+branch+j)%4],r)}
     }
    }
   }
   for(let j=0;j<5;j++)tuft(pts[6][0]+Math.cos(j*2.4)*.22,pts[6][1]-.1+r()*.2,pts[6][2]+Math.sin(j*2.4)*.22,.4,pineM[(index+j)%4],r);
  }else{
   for(let arm=0;arm<7;arm++){const a=az+arm*2.39996,src=pts[arm%3+2],reach=p.r*(.62+r()*.12),end=[p.x+Math.cos(a)*reach,p.y+p.h*(.72+r()*.22),p.z+Math.sin(a)*reach];limb(src,end,.095,barkDark);
    for(let twig=0;twig<4;twig++){const aa=a+(twig-1.5)*.35,tip=[end[0]+Math.cos(aa)*.32,end[1]+.2+r()*.36,end[2]+Math.sin(aa)*.32];limb(end,tip,.035,bark,thin);for(let j=0;j<6;j++){const ang=j*2.39996,rr=.1+r()*.42;const xx=tip[0]+Math.cos(ang)*rr,zz=tip[2]+Math.sin(ang)*rr,dd=Math.hypot(xx-p.x,zz-p.z),ff=Math.min(1,(p.r-.55)/dd);inst(blossom,flowerM[(arm+j)%3],[p.x+(xx-p.x)*ff,tip[1]+r()*.3,p.z+(zz-p.z)*ff],[.5,.65,.5],[r()*.8,r()*TAU,r()*.7])}}
   }
  }
  // Needle litter and low ferns are discontinuous patches, following the soil.
  for(let j=0;j<10;j++){const a=r()*TAU,d=.6+r()*p.r,x=p.x+Math.cos(a)*d,z=p.z+Math.sin(a)*d;if(residual(x,z,.5)&&dry(x,z,.4)){inst(grass,grassM[j%3],[x,heightAt(x,z)+.02,z],[.7,.4+r()*.3,.7],[0,r()*TAU,0])}}
 }
 // Low coastal scrub, ferns and grasses fill residual land without occupying lanes.
 const groundRecords=[];
 for(let i=0;i<4600;i++){const x=-111+rand()*222,z=-94+rand()*188;
  if(!residual(x,z,.95)||!dry(x,z,.95,.7))continue;
  const y=heightAt(x,z),s=.45+rand()*.65;
  inst(grass,grassM[i%3],[x,y+.025,z],[s,.4+rand()*.6,s],[0,rand()*TAU,0]);
  if(i%6===0&&!inClearing(x,z,0)){for(let k=0;k<5;k++){const a=k*2.39996,tip=[x+Math.cos(a)*.34,y+.35+rand()*.5,z+Math.sin(a)*.34];limb([x,y,z],tip,.025,bark,thin);tuft(...tip,.35+rand()*.15,pineM[(i+k)%4],rand)}}
  groundRecords.push([x,y,z]);
 }
 // Irregular wave-weathered boulders, partly buried; each has its own terrain sample.
 const rocks=[0,1,2].map(k=>{const g=new THREE.DodecahedronGeometry(1,0),pos=g.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),f=1+.11*Math.sin(x*7+z*9+y*5+k*2);pos.setXYZ(i,x*f,y*f,z*f)}g.computeVertexNormals();return g});
 const shoreRecords=[];
 for(let i=0;i<1700;i++){const a=rand()*TAU,rr=.89+rand()*.13,x=Math.cos(a)*112*rr,z=Math.sin(a)*94*rr,y=heightAt(x,z);if(y<.15||y>3.1||!residual(x,z,1.3)||!dry(x,z,.85,.02))continue;
  const s=.4+rand()*.65;inst(rocks[i%3],rockM[i%3],[x,y+s*.24,z],[s,s*(.48+rand()*.4),s*(.65+rand()*.4)],[rand()*.3,rand()*TAU,rand()*.25]);
  if(i%4===0)inst(core,lichen,[x+s*.1,y+s*.75,z],[s*.25,.04,s*.18],[0,rand()*TAU,0]);shoreRecords.push([x,y,z]);
 }
 const fallenRecords=[];for(let i=0;i<16;i++){const trees=treePlacements(),p=trees[(i*7+3)%trees.length],a=rand()*TAU,x=p.x+Math.cos(a)*1.7,z=p.z+Math.sin(a)*1.7,x2=x+Math.cos(a)*2,z2=z+Math.sin(a)*2;if(!residual(x,z,2.3)||!dry(x,z,2.3,1)||inClearing(x,z,1))continue;const aa=[x,heightAt(x,z)+.17,z],bb=[x2,heightAt(x2,z2)+.15,z2];limb(aa,bb,.16,dead);limb([x+(x2-x)*.55,(aa[1]+bb[1])*.5,z+(z2-z)*.55],[x+.7,heightAt(x+.7,z+.8)+.45,z+.8],.065,bark);fallenRecords.push([x,aa[1],z])}
 for(const {geo,m,transforms} of batches.values()){const mesh=new THREE.InstancedMesh(geo,m,transforms.length);transforms.forEach((t,i)=>mesh.setMatrixAt(i,t));mesh.castShadow=true;mesh.receiveShadow=true;mesh.instanceMatrix.needsUpdate=true;group.add(mesh)}
 group.userData.woodland={trees:treePlacements().length,cherries:treePlacements().filter(p=>p.cherry).length,groundPatches:groundRecords.length,shoreRocks:shoreRecords.length,fallenLimbs:fallenRecords.length,groundRecords,shoreRecords,fallenRecords};
 return group;
}
