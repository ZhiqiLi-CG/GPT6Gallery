import {harborLayout} from './harbor.js';
import {heightAt,roadNetwork,layout} from './root.js';

// All geometry is fitted to the same loft; local z runs from stern to bow.
export function hullPoint(p,t,a,inside=false){
 const u=2*t-1, w=p.width*.5*(.025+.975*Math.pow(Math.sin(Math.PI*t),.72));
 const bottom=-.55+.96*Math.pow(Math.abs(u),4),top=.74+.22*Math.pow(Math.abs(u),3);
 return [(w-(inside?Math.min(.085,w*.55):0))*Math.sin(a),bottom+(top-bottom)*(1-Math.cos(a))+(inside?.085*Math.cos(a):0),(t-.5)*p.length];
}
export function fleetAudit(){
 const H=harborLayout();return H.boats.map((p,i)=>{
  const transform=(x,z)=>[p.x+x*Math.cos(p.rotation)+z*Math.sin(p.rotation),p.z-x*Math.sin(p.rotation)+z*Math.cos(p.rotation)];
  const corners=[-1,1].flatMap(s=>[-1,1].map(k=>{const [x,z]=transform(s*p.width/2,k*p.length/2);return {x,z,bed:heightAt(x,z)};}));
  let clearance=Infinity,bedClearance=Infinity;
  for(let j=0;j<=80;j++)for(let k=0;k<=12;k++){
   const [x,y,z]=hullPoint(p,j/80,-Math.PI/2+k*Math.PI/12),[wx,wz]=transform(x,z);
   bedClearance=Math.min(bedClearance,y-heightAt(wx,wz));
   for(const q of H.piers)if(wz>=q.z1-.3&&wz<=q.z0)clearance=Math.min(clearance,Math.abs(wx-q.x)-q.width/2-.35);
  }
  return {id:`harbor-fleet_boat_${i+1}`,corners,minBedClearance:bedClearance,minPierAndFenderClearance:clearance};
 });
}
export function build(THREE,ctx){
 const fleet=new THREE.Group();fleet.name='harbor-fleet';
 const H=harborLayout();roadNetwork();const sea=layout().seaLevel;
 const material=c=>new THREE.MeshStandardMaterial({color:c,roughness:.9});
 const woods=[0x75614b,0x897257,0x695845,0x9b8463,0x806f58].map(material);
 const dark=material(0x443e32),rope=material(0xa79872),netmat=material(0x45544c),iron=material(0x36413f),cloth=material(0xb9b39a),fishmat=material(0x94a6a0);
 const accents=[material(0x425a63),material(0x9a804f),material(0x5c6f69)];
 const cube=new THREE.BoxGeometry(1,1,1),cylinder=new THREE.CylinderGeometry(1,1,1,8),sphere=new THREE.SphereGeometry(1,10,7);
 H.boats.forEach((p,index)=>{
  const g=new THREE.Group();g.name=`harbor-fleet_boat_${index+1}`;g.position.set(p.x,sea,p.z);g.rotation.y=p.rotation;fleet.add(g);
  const batches=new Map(),wood=woods[index%woods.length],accent=accents[index%3];
  function inst(geo,m,pos,scale,q){let batch=batches.get(geo.uuid+m.uuid);if(!batch){batch={geo,m,ms:[]};batches.set(geo.uuid+m.uuid,batch);}const o=new THREE.Object3D();o.position.set(...pos);o.scale.set(...scale);if(q)o.quaternion.copy(q);o.updateMatrix();batch.ms.push(o.matrix.clone());}
  function box(x,y,z,w,h,d,m=wood,rot=0){inst(cube,m,[x,y,z],[w,h,d],new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),rot));}
  function beam(a,b,r,m=wood){const aa=new THREE.Vector3(...a),bb=new THREE.Vector3(...b),v=bb.clone().sub(aa);inst(cylinder,m,aa.add(bb).multiplyScalar(.5).toArray(),[r,v.length(),r],new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize()));}
  function ball(x,y,z,sx,sy,sz,m){inst(sphere,m,[x,y,z],[sx,sy,sz]);}
  function tube(points,r,m,closed=false){const c=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),closed);const mesh=new THREE.Mesh(new THREE.TubeGeometry(c,Math.max(12,points.length*2),r,5,closed),m);mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);}
  function ring(x,y,z,r,m=rope,vertical=false){const pts=[];for(let j=0;j<24;j++){const a=j*Math.PI/12;pts.push(vertical?[x+Math.cos(a)*r,y+Math.sin(a)*r,z]:[x+Math.cos(a)*r,y,z+Math.sin(a)*r]);}tube(pts,.021,m,true);}
  // One watertight thick shell: exterior, inner lining, sheer rim and end closures.
  const N=48,M=20,v=[],ix=[];
  for(let side=0;side<2;side++)for(let j=0;j<=N;j++)for(let k=0;k<=M;k++)v.push(...hullPoint(p,j/N,-Math.PI/2+k*Math.PI/M,!!side));
  const offset=(N+1)*(M+1),id=(j,k)=>j*(M+1)+k;
  function quad(a,b,c,d,flip=false){if(flip)ix.push(a,c,b,a,d,c);else ix.push(a,b,c,a,c,d);}
  for(let s=0;s<2;s++)for(let j=0;j<N;j++)for(let k=0;k<M;k++){const a=s*offset+id(j,k);quad(a,a+M+1,a+M+2,a+1,s===1);}
  for(let j=0;j<N;j++){let a=id(j,0),b=id(j+1,0);quad(a,a+offset,b+offset,b);a=id(j,M);b=id(j+1,M);quad(a,b,b+offset,a+offset);}
  for(let k=0;k<M;k++){let a=id(0,k);quad(a,a+1,a+1+offset,a+offset);a=id(N,k);quad(a,a+offset,a+1+offset,a+1);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geometry.setIndex(ix);geometry.computeVertexNormals();
  // Double-sided material also preserves the interior appearance at extremely low cameras.
  const hullmat=wood.clone();hullmat.side=THREE.DoubleSide;const shell=new THREE.Mesh(geometry,hullmat);shell.name='closed thick lofted hull';shell.castShadow=true;shell.receiveShadow=true;g.add(shell);
  for(const sign of [-1,1]){
   for(let k=1;k<=5;k++){const pts=[];for(let j=0;j<=48;j++){const q=hullPoint(p,j/48,sign*k*Math.PI/10);q[0]+=sign*.012;pts.push(q);}tube(pts,k===5?.064:.015,k===5?accent:dark);}
   // Narrow painted sheer strake under the substantial gunwale.
   for(let strip=0;strip<3;strip++){const pts=[];for(let j=0;j<=48;j++)pts.push(hullPoint(p,j/48,sign*(1.43+strip*.036)));tube(pts,.026,accent);}
  }
  const keel=[];for(let j=0;j<=48;j++){const q=hullPoint(p,j/48,0);q[1]-=.025;keel.push(q);}tube(keel,.055,dark);
  for(let j=1;j<13;j++){
   const t=j/13,pts=[];for(let k=0;k<=20;k++){const q=hullPoint(p,t,-Math.PI/2+k*Math.PI/20,true);q[1]+=.03;pts.push(q);}tube(pts,.043,woods[(index+2)%5]);
   for(const sign of [-1,1]){const q=hullPoint(p,t,sign*1.35);ball(q[0]+sign*.017,q[1],q[2],.021,.024,.021,iron);}
  }
  // Fitted bilge ceiling closes the water-plane sightline below the removable sole.
  // Each transverse board terminates inside the curved lining at its own height.
  for(let j=0;j<100;j++){
   const t=(j+.5)/100,u=2*t-1,bottom=-.55+.96*Math.pow(Math.abs(u),4)+.085,top=.74+.22*Math.pow(Math.abs(u),3);
   if(bottom<.055){const a=Math.acos(Math.max(-1,Math.min(1,1-(.055-bottom)/(top-bottom))));const w=hullPoint(p,t,a,true)[0];box(0,.035,(t-.5)*p.length,w*2+.035,.065,p.length/100+.005,woods[2]);}
  }
  for(const x of [-.45,.45])box(x,.09,0,.075,.09,p.length*.63,dark);
  // Raised removable sole boards clear the bilge and give all loose loads real support.
  for(let x=-.60;x<=.61;x+=.20){const zlen=p.length*(.69-.10*Math.abs(x));box(x,.115,0,.188,.10,zlen,woods[(Math.round((x+.6)*5)+index)%5]);for(const z of [-zlen*.36,zlen*.36])box(x,.17,z,.035,.012,.035,iron);}
  for(const z of [-p.length*.16,p.length*.15]){
   const t=z/p.length+.5,w=hullPoint(p,t,Math.PI/2,true)[0];box(0,.52,z,w*2-.09,.12,.31,woods[(index+3)%5]);
   for(const s of [-1,1]){beam([s*(w-.11),.47,z],[s*.59,.14,z],.055,dark);box(s*(w-.14),.46,z,.20,.09,.46,dark);}
  }
  // Crosswise planked end decks precisely follow the narrowing hull.
  for(const sign of [-1,1])for(let j=0;j<7;j++){const t=sign<0?.035+j*.024:.821+j*.024,z=(t-.5)*p.length,w=hullPoint(p,t,Math.PI/2,true)[0];box(0,.66+Math.pow(Math.abs(t-.5)*2,3)*.14,z,Math.max(.035,2*w-.035),.095,p.length*.023,woods[(j+index)%5]);}
  for(const sign of [-1,1]){const z=sign*p.length*.34;beam([-.2,.85,z],[.2,.85,z],.043,dark);beam([0,.72,z],[0,.94,z],.055,dark);}
  function coil(x,y,z,r=.25){const pts=[];for(let j=0;j<120;j++){const a=j*.24,rad=.06+(r-.06)*j/119;pts.push([x+rad*Math.cos(a),y+.023+j*.00012,z+rad*Math.sin(a)]);}tube(pts,.021,rope);}
  coil(.02,.79,-p.length*.36,.26);coil(-.27,.175,-.35,.20);
  // Stowed oars rest across the two thwarts, with flat tapered wooden blades.
  for(const side of [-1,1]){
   const x=side*(p.width*.28),z0=-p.length*.30,z1=p.length*.28;
   beam([x,.625,z0],[x+side*.05,.625,z1],.032,woods[3]);
   const blade=new THREE.Shape();blade.moveTo(-.028,.40);blade.lineTo(-.11,.20);blade.lineTo(-.12,-.29);blade.quadraticCurveTo(0,-.39,.12,-.29);blade.lineTo(.11,.20);blade.lineTo(.028,.40);blade.closePath();
   const bladeMesh=new THREE.Mesh(new THREE.ExtrudeGeometry(blade,{depth:.045,bevelEnabled:true,bevelSize:.009,bevelThickness:.007,bevelSegments:1,steps:1}),woods[3]);bladeMesh.rotation.x=Math.PI/2;bladeMesh.position.set(x,.655,z0+.24);bladeMesh.castShadow=true;g.add(bladeMesh);
   beam([x,.625,z1-.20],[x,.625,z1+.1],.042,dark);
   const rim=hullPoint(p,.47,side*Math.PI/2);beam([rim[0],rim[1],rim[2]],[rim[0],rim[1]+.16,rim[2]],.025,iron);ring(rim[0],rim[1]+.18,rim[2],.075,iron,true);
  }
  function crate(x,z,catchFish){const y=.17,w=.66,d=.8,h=.38;box(x,y+.025,z,w,.05,d,woods[2]);for(let j=0;j<3;j++){const yy=y+.09+j*.11;for(const s of [-1,1]){box(x+s*w/2,yy,z,.055,.09,d,woods[(index+j)%5]);box(x,yy,z+s*d/2,w,.09,.055,woods[(index+j+1)%5]);}}for(const dx of [-w/2,w/2])for(const dz of [-d/2,d/2])box(x+dx,y+h/2,z+dz,.06,h,.06,dark);if(catchFish)for(let j=0;j<6;j++){const xx=x-.20+(j%3)*.19,zz=z-.22+Math.floor(j/3)*.35;ball(xx,y+.12,zz,.065,.05,.18,fishmat);box(xx,y+.13,zz-.16,.12,.026,.10,fishmat,.3);ball(xx,y+.16,zz+.10,.014,.012,.013,iron);}}
  crate(index%2?.28:-.2,-p.length*.07,index!==4);
  function basket(x,z){const y=.17,r=.28;ball(x,y+.025,z,r,.025,r,woods[2]);for(let j=0;j<8;j++)ring(x,y+.05+j*.043,z,r*(.82+.18*j/7),rope);for(let j=0;j<16;j++){const a=j*Math.PI/8;beam([x+r*.82*Math.cos(a),y+.03,z+r*.82*Math.sin(a)],[x+r*Math.cos(a),y+.38,z+r*Math.sin(a)],.014,woods[3]);}ring(x,y+.39,z,r,woods[2]);}
  basket(index%2?-.28:.3,-p.length*.25);
  // Folded mesh has visible individual crossings and irregular layered contours.
  const nx=index%2?-.20:.15,nz=p.length*.25;
  for(let layer=0;layer<3;layer++){
   const netY=(nz>p.length*.32?.78:.17)+layer*.085;
   const surf=(u,v)=>[nx+u*.65,netY+.10*(1-u*u)*(.6+.4*Math.cos(v*7+layer)),nz+v*.50];
   for(let a=-1;a<=1.01;a+=.16){let pts=[];for(let b=-1;b<=1.01;b+=.10)pts.push(surf(a,b));tube(pts,.009,netmat);pts=[];for(let b=-1;b<=1.01;b+=.10)pts.push(surf(b,a));tube(pts,.009,netmat);}
   const perimeter=[surf(-1,-1),surf(1,-1),surf(1,1),surf(-1,1)];tube(perimeter,.018,rope,true);
  }
  for(let j=0;j<5;j++){const x=nx-.45+j*.22,z=nz+.43,y=.43;ball(x,y,z,.081,.072,.13,j%2?accent:woods[3]);ring(x,y,z,.045,rope,true);}
  // Compact anchor lashed flat on the aft deck: shank, stock and two hooked flukes.
  const az=-p.length*.35,ay=.80;beam([-.36,ay,az-.16],[.34,ay,az+.16],.035,iron);beam([-.25,ay,az-.34],[-.4,ay,az+.03],.035,woods[2]);tube([[.10,ay,az-.17],[.35,ay,az+.16],[.04,ay,az+.36]],.035,iron);box(.04,ay,az+.34,.12,.04,.16,iron,.6);box(.12,ay,az-.15,.12,.04,.16,iron,-.6);ring(-.39,ay,az-.17,.068,iron);tube([[-.39,ay,az-.17],[-.5,ay,az+.1],[0,ay,az+.3]],.022,rope);
  if([1,3,5].includes(index)){
   const mz=p.length*.11,mh=index===3?5.4:4.7;
   box(0,.24,mz,.30,.17,.35,dark);beam([0,.24,mz],[0,mh,mz],.069,woods[3]);
   box(0,.54,mz,.29,.12,.26,wood);
   for(const s of [-1,1])tube([[0,mh-.16,mz],[s*p.width*.39,.86,-p.length*.20]],.016,rope);
   tube([[0,mh-.10,mz],[0,.95,p.length*.41]],.018,rope);tube([[0,mh-.1,mz],[0,.92,-p.length*.40]],.016,rope);
   const sparY=mh*.70;beam([-.75,sparY-.14,mz],[.75,sparY+.14,mz],.043,woods[2]);
   // Furled canvas wrapped along the spar, with individual gathering lashings.
   const cv=[],ci=[],slices=40,rings=12;
   for(let j=0;j<=slices;j++){const x=-.71+j*1.42/slices,r=.087+.009*Math.sin(j*1.8)+.009*Math.sin(j*.7);for(let k=0;k<=rings;k++){const a=k*Math.PI*2/rings;cv.push(x,sparY+x*.185-.025+Math.cos(a)*r,mz+.035+Math.sin(a)*(r+.012));}}
   for(let j=0;j<slices;j++)for(let k=0;k<rings;k++){const a=j*(rings+1)+k;ci.push(a,a+1,a+rings+2,a,a+rings+2,a+rings+1);}
   for(const end of [0,slices]){const center=cv.length/3;cv.push(end===0?-.71:.71,sparY+(end===0?-.71:.71)*.185-.025,mz+.035);for(let k=0;k<rings;k++)ci.push(center,end*(rings+1)+k,end*(rings+1)+k+1);}
   const sailGeo=new THREE.BufferGeometry();sailGeo.setAttribute('position',new THREE.Float32BufferAttribute(cv,3));sailGeo.setIndex(ci);sailGeo.computeVertexNormals();const sail=new THREE.Mesh(sailGeo,cloth);sail.castShadow=true;g.add(sail);
   for(let j=0;j<5;j++){const x=-.54+j*.27;const pts=[];for(let k=0;k<16;k++){const a=k*Math.PI/8;pts.push([x,sparY+x*.185+Math.cos(a)*.115,mz+.04+Math.sin(a)*.12]);}tube(pts,.013,rope,true);}
   tube([[-.72,sparY-.14,mz],[0,mh-.2,mz],[.72,sparY+.14,mz]],.016,rope);coil(.22,.585,p.length*.15,.12);
  }
  // Two mooring lines terminate at the nearest existing outer pile posts.
  const pier=H.piers.reduce((a,b)=>Math.abs(a.x-p.x)<Math.abs(b.x-p.x)?a:b),side=Math.sign(pier.x-p.x),postX=pier.x-side*(pier.width/2-.16),bays=Math.ceil((-63.25-pier.z1)/2.6);
  for(const s of [-1,1]){
   const localZ=s*p.length*.32,localX=side*hullPoint(p,localZ/p.length+.5,Math.PI/2,true)[0]*.87;
   const worldZ=p.z-localX*Math.sin(p.rotation)+localZ*Math.cos(p.rotation);let postZ=-63.25;let best=Infinity;
   for(let j=0;j<=bays;j++){const z=-63.25+(pier.z1+63.25)*j/bays;if(Math.abs(z-worldZ)<best){best=Math.abs(z-worldZ);postZ=z;}}
   const dx=postX-p.x,dz=postZ-p.z,px=dx*Math.cos(p.rotation)-dz*Math.sin(p.rotation),pz=dx*Math.sin(p.rotation)+dz*Math.cos(p.rotation);
   beam([localX,.68,localZ],[localX,.90,localZ],.045,dark);
   tube([[localX,.88,localZ],[(localX+px)/2,.98,(localZ+pz)/2],[px,1.98,pz]],.027,rope);
   ring(px,1.98,pz,.185,rope);
  }
  for(const b of batches.values()){const m=new THREE.InstancedMesh(b.geo,b.m,b.ms.length);b.ms.forEach((mat,i)=>m.setMatrixAt(i,mat));m.castShadow=true;m.receiveShadow=true;g.add(m);}
 });
 return fleet;
}
