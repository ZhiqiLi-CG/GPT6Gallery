import { heightAt, roadNetwork, layout } from './root.js';

// Internal reservations are repeated in the child work orders; geography remains root-owned.
export function shrineLayout(){return {gate:{x:-77.5,z:-68,width:8.6},court:{rect:[-83,-59,-73,-54],y:5.9},sanctuary:{rect:[-82.5,-54,-72.5,-44.5],x:-77.5,z:-49,floor:7.15},stairs:{x:-78,z0:-65,z1:-59,y0:2.05,y1:5.9,width:2.6}}}
export function build(THREE,ctx){
 const g=new THREE.Group();g.name='shore-shrine gate and approach';
 const shrine=layout().shrine, lane=roadNetwork().find(r=>r.id==='shore-path');
 if(!shrine||!lane)throw new Error('Shrine requires root layout and shore path');
 const mat=(color,more={})=>new THREE.MeshStandardMaterial({color,roughness:.88,...more});
 const red=mat(0xa93927),redLight=mat(0xb5442f),redDark=mat(0x732c24),cap=mat(0x303c3b),wood=mat(0x674931),woodLight=mat(0x967650),rope=mat(0xbba57a),paper=mat(0xe8e0c7,{side:THREE.DoubleSide}),stone=mat(0x777970),stoneLight=mat(0x94958a),stoneDark=mat(0x575f59),gravel=mat(0xa7a58e),bronze=mat(0x766747,{metalness:.38}),water=mat(0x679a91,{roughness:.23,metalness:.2}),bamboo=mat(0x85906a);
 const stoneM=[mat(0x7a7e73),mat(0x85877d),mat(0x727970),mat(0x808477),mat(0x8b8c81)];
 function mesh(geo,m,x=0,y=0,z=0){const a=new THREE.Mesh(geo,m);a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;g.add(a);return a}
 function box(x,y,z,w,h,d,m){return mesh(new THREE.BoxGeometry(w,h,d),m,x,y+h/2,z)}
 function cyl(x,y,z,r0,r1,h,m,n=16){return mesh(new THREE.CylinderGeometry(r1,r0,h,n),m,x,y+h/2,z)}
 function beam(a,b,r,m,r2=r,n=10){const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),v=q.clone().sub(p);const o=mesh(new THREE.CylinderGeometry(r2,r,v.length(),n),m,...p.clone().add(q).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o}
 function curve(points,r,m){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),Math.max(12,points.length*8),r,7,false),m)}
 const rand=n=>{const q=Math.sin(n*127.1+71.7)*43758.5453;return q-Math.floor(q)};
 // Filled retaining courses: every column starts below sampled terrain and ends at court level.
 const court=shrineLayout().court;
 for(let ix=0;ix<10;ix++)for(let iz=0;iz<5;iz++){
  const x=-82.5+ix,z=-58.5+iz,bottom=Math.min(heightAt(x-.5,z-.5),heightAt(x+.5,z-.5),heightAt(x-.5,z+.5),heightAt(x+.5,z+.5))-.12;
  if(bottom<5.81)box(x,bottom,z,1.01,5.83-bottom,1.01,stoneDark);
 }
 // Alternating joints run through level masonry courses, with restrained weathering.
 for(const [a,b] of [[[-83,-59],[-83,-54]],[[-83,-59],[-73,-59]],[[-73,-59],[-73,-54]]]){
  const vertical=a[0]===b[0],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
  for(let row=0;row<15;row++){
   const y=.76+row*.34;
   for(let t=-(row%2)*.37;t<len;t+=.74){
    const l=Math.max(0,t),r=Math.min(len,t+.74),mid=(l+r)/2;
    const x=a[0]+(b[0]-a[0])*mid/len,z=a[1]+(b[1]-a[1])*mid/len;
    if(!vertical&&x>-79.5&&x<-76.5)continue;
    const ground=heightAt(x,z)-.12;
    if(y+.32<ground)continue;
    const low=Math.max(y,ground),h=Math.min(.32,5.76-y)-(low-y);
    if(h<=0)continue;
    box(x,low,z,vertical?.33:r-l-.022,h,vertical?r-l-.022:.33,stoneM[Math.floor(rand(row*40+t)*stoneM.length)]);
   }
  }
  const n=Math.ceil(len/.75);
  for(let i=0;i<n;i++){const x=a[0]+(b[0]-a[0])*(i+.5)/n,z=a[1]+(b[1]-a[1])*(i+.5)/n;if(!vertical&&Math.abs(x+78)<1.5)continue;box(x,5.76,z,vertical?.46:len/n-.015,.14,vertical?len/n-.015:.46,stoneLight)}
 }
 box(-78,5.81,-56.5,9.95,.09,4.95,gravel);
 // Individually laid pavers, scattered gravel and deliberate swept open ground.
 for(let i=0;i<7;i++)for(let j=0;j<3;j++)box(-78+(j-1)*.74,5.9,-58.65+i*.65,.705,.07,.615,stoneM[Math.floor(rand(i*9+j+71)*stoneM.length)]);
 const pebGeo=new THREE.IcosahedronGeometry(1,0);
 for(let i=0;i<350;i++){const x=-82.8+rand(i*3)*9.55,z=-58.8+rand(i*3+1)*4.55;if(Math.abs(x+78)<1.2)continue;const o=mesh(pebGeo,i%4===0?stoneLight:gravel,x,5.91,z);o.scale.set(.035+rand(i)*.045,.018,.03+rand(i+1)*.055);o.rotation.y=i}
 function laneDistance(x,z){let best=Infinity;for(let i=1;i<lane.points.length;i++){const a=lane.points[i-1],b=lane.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));best=Math.min(best,Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz))}return best}
 // Six shore risers resolve the height difference between the gate paving and main flight.
 for(let i=0;i<6;i++){
  const z=-66.6+(i+.5)*1.6/6,top=1.175+i*.175,west=-79.65,east=-78.53;
  const low=Math.min(heightAt(west,z-.134),heightAt(east,z-.134))-.12;
  box((west+east)/2,low,z,east-west,top-low,1.6/6+.006,stone);
  box((west+east)/2,top-.045,z-.008,east-west,.055,1.6/6-.018,stoneLight);
 }
 // Lower treads fan west of the road end, preserving its full published clearance.
 // All higher risers retain the fixed courtyard connection.
 for(let i=0;i<22;i++){
  const z=-65+(i+.5)*6/22,top=2.05+(i+1)*3.85/22;
  const west=-79.3-.35*Math.max(0,1-i/8);let east=-76.7;
  while(east>west+.6&&Math.min(laneDistance(east,z-.14),laneDistance(east,z+.14))<lane.width/2+.36)east-=.025;
  const center=(west+east)/2,width=east-west;
  const bottom=Math.min(heightAt(west,z),heightAt(east,z),top-.2)-.1;
  box(center,bottom,z,width,top-bottom,6/22+.01,stone);
  box(center,top-.045,z-.015,width,.06,6/22-.018,stoneLight);
  for(const x of [west-.16,east+.16]){
   if(laneDistance(x,z)<lane.width/2+.57)continue;
   const base=heightAt(x,z)-.1;
   box(x,base,z,.27,Math.max(.1,top+.15-base),6/22+.015,stoneDark);box(x,top+.12,z,.30,.13,6/22+.015,stoneLight);
  }
 }
 for(let iz=0;iz<6;iz++)for(let ix=0;ix<4;ix++){
  const x=-78.1+(ix-1.5)*.68,z=-68.15+iz*.52,y=heightAt(x,z)+.14;
  const low=Math.min(heightAt(x-.33,z-.25),heightAt(x+.33,z-.25),heightAt(x-.33,z+.25),heightAt(x+.33,z+.25))-.06;
  box(x,low,z,.65,y+.05-low,.49,stoneM[Math.floor(rand(ix*7+iz+18)*stoneM.length)]);
 }
 for(let i=0;i<4;i++){const x=-79.24+(i%2)*.40,z=-65.5-Math.floor(i/2)*.35,low=heightAt(x-.2,z-.18)-.12,top=heightAt(x,z)+.13;box(x,low,z,.38,top-low,.33,stoneM[i])}
 // The complete torii: independent pier foundations, gently tapered round pillars and real depth.
 const gx=-77.5,gz=-68,postTop=8.74;
 for(const x of [gx-3.05,gx+3.05]){
  const corners=[heightAt(x-.62,gz-.62),heightAt(x+.62,gz-.62),heightAt(x-.62,gz+.62),heightAt(x+.62,gz+.62)];
  const bottom=Math.min(...corners)-.25,top=Math.max(...corners)+.22;
  box(x,bottom,gz,1.15,top-bottom,1.15,stoneDark);
  box(x,top-.05,gz,1.35,.18,1.35,stoneLight);
  cyl(x,top+.1,gz,.53,.50,.24,stone);
  cyl(x,top+.28,gz,.405,.32,postTop-top-.28,red,28);
  cyl(x,top+.28,gz,.438,.431,.46,cap,24);
  cyl(x,top+.76,gz,.416,.412,.12,redDark,24);
  // Supporting collars and mortise wedges on both front and rear.
  for(const z of [gz-.39,gz+.39]){box(x,7.11,z,.8,.43,.14,redDark);box(x+.42,7.22,z,.35,.16,.19,woodLight)}
  for(let k=0;k<4;k++)box(x+(k%2?-.21:.21),7.23,gz+(k<2?-.475:.475),.09,.09,.035,bronze);
 }
 box(gx,7.12,gz,7.6,.45,.49,redLight);
 box(gx,7.5,gz,.45,1.13,.42,redDark);
 box(gx,7.76,gz-.3,.66,.82,.14,cap);
 box(gx,7.82,gz-.379,.49,.66,.035,woodLight);
 // Subtle carved plaque strokes without invented lettering.
 for(let i=0;i<3;i++)box(gx,7.96+i*.15,gz-.401,.20,.034,.018,redDark);
 function curvedLintel(y,thickness,depth,m,width=8.6){
  const s=new THREE.Shape(),N=28;
  const lift=x=>.39*Math.pow(Math.abs(x/(width/2)),3);
  s.moveTo(-width/2,y+lift(-width/2));
  for(let i=1;i<=N;i++){const x=-width/2+i*width/N;s.lineTo(x,y+lift(x))}
  for(let i=N;i>=0;i--){const x=-width/2+i*width/N;s.lineTo(x,y+thickness+lift(x))}
  s.closePath();return mesh(new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.035,bevelThickness:.035}),m,gx,0,gz-depth/2);
 }
 curvedLintel(8.59,.30,.74,redDark,8.05);curvedLintel(8.86,.50,.92,redLight);curvedLintel(9.37,.18,1.09,cap,8.75);
 // A thick hanging shimenawa with visible twisted strands, knots and rice-straw tassels.
 const ropeY=t=>6.98-.46*Math.sin(Math.PI*t);
 for(let strand=0;strand<3;strand++){
  const pts=[];for(let i=0;i<=80;i++){const t=i/80,a=t*Math.PI*32+strand*Math.PI*2/3;pts.push([gx-3.05+t*6.1,ropeY(t)+Math.sin(a)*.041,gz-.39+Math.cos(a)*.041])}curve(pts,.041,rope);
 }
 for(const x of [gx-3.05,gx+3.05])for(let j=0;j<3;j++){const o=mesh(new THREE.TorusGeometry(.43,.047,6,28),rope,x,7.01+j*.09,gz);o.rotation.x=Math.PI/2}
 for(let i=0;i<5;i++){
  const t=(i+1)/6,x=gx-3.05+t*6.1,y=ropeY(t);
  for(let k=0;k<6;k++)beam([x+(k-2.5)*.021,y-.05,gz-.42],[x+(k-2.5)*.037,y-.42-rand(k+i)*.10,gz-.46],.011,rope);
  // Zigzag folded shide are thick enough to read from either side.
  const coords=[[0,0],[.23,-.12],[.07,-.29],[.31,-.42],[.13,-.64]];
  for(let k=0;k<coords.length-1;k++){
   const [ax,ay]=coords[k],[bx,by]=coords[k+1],o=box(x+(ax+bx)/2-.1,y+(ay+by)/2-.16,gz-.52-k*.012,.17,Math.hypot(bx-ax,by-ay),.025,paper);
   o.rotation.z=-Math.atan2(bx-ax,by-ay);
  }
 }
 // Perimeter shrine fence, stepped onto the supported court coping.
 function fence(a,b){const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.65),dx=(b[0]-a[0])/n,dz=(b[1]-a[1])/n;
  for(let i=0;i<=n;i++){const x=a[0]+dx*i,z=a[1]+dz*i;box(x,5.88,z,.17,1.10,.17,wood);box(x,6.94,z,.24,.11,.24,cap);if(i===n)continue;
   for(const y of [6.19,6.73]){const o=box(x+dx/2,y,z+dz/2,Math.hypot(dx,dz),.12,.11,woodLight);o.rotation.y=-Math.atan2(dz,dx)}
   for(let k=1;k<5;k++){const xx=x+dx*k/5,zz=z+dz*k/5;box(xx,6.17,zz,.065,.62,.065,wood)}
  }
 }
 fence([-82.85,-58.84],[-80,-58.84]);fence([-76,-58.84],[-73.15,-58.84]);fence([-82.85,-58.84],[-82.85,-54.1]);fence([-73.15,-58.84],[-73.15,-54.1]);
 // Two complete stone lanterns: plinth, shaft, lotus base, open fire chamber, hip cap and finial.
 function lantern(x,z){const y=5.9,base=6.05;
  box(x,y-.15,z,1.0,base-y+.15,1.0,stoneDark);box(x,base,z,1.03,.16,1.03,stone);
  cyl(x,base+.16,z,.43,.29,.21,stoneLight,8);cyl(x,base+.37,z,.21,.18,.92,stone,8);cyl(x,base+1.29,z,.23,.42,.22,stoneLight,8);
  box(x,base+1.51,z,.84,.13,.84,stone);box(x,base+1.64,z,.64,.08,.64,stoneDark);
  for(const dx of [-.25,.25])for(const dz of [-.25,.25])box(x+dx,base+1.69,z+dz,.13,.55,.13,stoneLight);
  cyl(x,base+1.72,z,.12,.12,.28,mat(0xc1a575),10);box(x,base+2.24,z,.76,.13,.76,stone);
  const o=mesh(new THREE.ConeGeometry(.73,.42,4),stoneLight,x,base+2.57,z);o.rotation.y=Math.PI/4;
  cyl(x,base+2.78,z,.14,.19,.16,stone);mesh(new THREE.SphereGeometry(.16,12,8),stoneLight,x,base+3.0,z);
 }
 lantern(-81.25,-57.9);lantern(-74.75,-57.9);
 // Hollow water basin on court; actual water surface, drain channel and bamboo tools.
 const bx=-74.7,bz=-55.85,by=5.98;
 box(bx,5.9,bz,1.6,.15,1.25,stoneDark);box(bx,by,bz,1.4,.19,1.08,stone);
 for(const z of [bz-.46,bz+.46])box(bx,by+.19,z,1.4,.6,.17,stoneLight);
 for(const x of [bx-.61,bx+.61])box(x,by+.19,bz,.18,.6,.78,stone);
 box(bx,by+.60,bz,1.02,.018,.70,water);
 for(const z of [bz-.30,bz+.30])beam([bx-.90,by+.81,z],[bx+.91,by+.81,z],.038,bamboo);
 for(let i=0;i<2;i++){const x=bx-.29+i*.51;beam([x,by+.84,bz-.6],[x,by+.84,bz+.42],.023,bamboo);cyl(x,by+.81,bz+.39,.095,.115,.14,woodLight,14);cyl(x,by+.923,bz+.39,.074,.074,.012,wood,14)}
 beam([bx+.9,by+.13,bz-.65],[bx+.9,by+1.23,bz-.65],.06,bamboo);beam([bx+.9,by+1.17,bz-.65],[bx+.26,by+1.17,bz-.36],.048,bamboo);beam([bx+.26,by+.63,bz-.36],[bx+.26,by+1.17,bz-.36],.013,water);
 return g;
}
