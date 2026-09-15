import {harborLayout} from './harbor.js';
import {heightAt,roadNetwork,layout} from './root.js';

// All locations are in world metres. The parent retains all marine structures.
export function build(THREE,ctx){
 const root=new THREE.Group();root.name='harbor-shoreworks';
 const H=harborLayout(),roads=roadNetwork(),world=layout();
 const material=c=>new THREE.MeshStandardMaterial({color:c,roughness:.9});
 const wood=[0x796047,0x866b4e,0x917455,0x705740,0x9b8060].map(material),frame=material(0x514533),iron=material(0x39433f),rope=material(0xb6a17a),netmat=material(0x626957),dark=material(0x313e3a),stone=[0x777b71,0x8a8979,0x696e65].map(material),tile=[0x414e53,0x4b575b,0x526063,0x465155].map(material),earth=material(0xa1987d),green=material(0x667752),silver=material(0xa9b9ac),fishback=material(0x637e7d),wicker=material(0xb39969),water=material(0x668e87),rust=material(0x72604c);
 const cube=new THREE.BoxGeometry(1,1,1),cyl=new THREE.CylinderGeometry(1,1,1,10),sphere=new THREE.SphereGeometry(1,10,6),rock=new THREE.DodecahedronGeometry(1,0);
 let group,batches;
 const records=[];
 function assembly(id,kind,fn){group=new THREE.Group();group.name='harbor-shoreworks_'+id;batches=new Map();root.add(group);fn();for(const b of batches.values()){const m=new THREE.InstancedMesh(b.geo,b.mat,b.items.length);b.items.forEach((v,i)=>m.setMatrixAt(i,v));m.castShadow=true;m.receiveShadow=true;group.add(m)}group.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(group);records.push({id:group.name,kind,bbox:[...b.min.toArray(),...b.max.toArray()].map(v=>+v.toFixed(3))});}
 function inst(geo,mat,p,s,q){const key=geo.uuid+mat.uuid;let b=batches.get(key);if(!b){b={geo,mat,items:[]};batches.set(key,b)}const o=new THREE.Object3D();o.position.set(...p);o.scale.set(...s);if(q)o.quaternion.copy(q);o.updateMatrix();b.items.push(o.matrix.clone());}
 const rot=(a,axis=[0,1,0])=>new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(...axis),a);
 function box(x,y,z,w,h,d,m=wood[0],a=0){inst(cube,m,[x,y,z],[w,h,d],rot(a));}
 function beam(a,b,r=.055,m=frame,square=false){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);inst(square?cube:cyl,m,av.add(bv).multiplyScalar(.5).toArray(),[square?r*2:r,v.length(),square?r*2:r],new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize()));}
 function ball(x,y,z,rx,ry,rz,m=silver){inst(sphere,m,[x,y,z],[rx,ry,rz]);}
 function tube(points,r,m=rope){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const o=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(12,points.length*2),r,5,false),m);group.add(o);}
 const rings=new Map();function ring(x,y,z,r,t=.025,m=rope,vertical=false){let geo=rings.get(t);if(!geo){geo=new THREE.TorusGeometry(1,t,5,28);rings.set(t,geo)}inst(geo,m,[x,y,z],[r,r,r],vertical?undefined:rot(Math.PI/2,[1,0,0]));}
 const rand=n=>{const s=Math.sin(n*91.713+7)*41337;return s-Math.floor(s)};
 function clearRoad(x,z,r=0){return roads.every(rd=>rd.points.slice(1).every((b,i)=>{const a=rd.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)>rd.width/2+.35+r}))}
 function footing(x,z,w,d,top){
  const nx=Math.ceil(w/.85),nz=Math.ceil(d/.7);
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const xx=x-w/2+(i+.5)*w/nx,zz=z-d/2+(j+.5)*d/nz,bot=heightAt(xx,zz)-.2;box(xx,(bot+top-.14)/2,zz,w/nx+.015,Math.max(.12,top-.14-bot),d/nz+.015,stone[2]);}
  for(const side of [-1,1])for(let i=0;i<nx;i++){const xx=x-w/2+(i+.5)*w/nx,zz=z+side*d/2,bot=heightAt(xx,zz)-.16,n=Math.max(1,Math.ceil((top-.12-bot)/.28));for(let k=0;k<n;k++)box(xx,bot+(k+.5)*(top-.12-bot)/n,zz,w/nx-.025,(top-.12-bot)/n-.018,.24,stone[(i+k)%3]);}
  for(const side of [-1,1])for(let j=0;j<nz;j++){const xx=x+side*w/2,zz=z-d/2+(j+.5)*d/nz,bot=heightAt(xx,zz)-.16,n=Math.max(1,Math.ceil((top-.12-bot)/.28));for(let k=0;k<n;k++)box(xx,bot+(k+.5)*(top-.12-bot)/n,zz,.24,(top-.12-bot)/n-.018,d/nz-.025,stone[(j+k)%3]);}
  for(let i=0;i<Math.ceil(w/.23);i++){const n=Math.ceil(w/.23);box(x-w/2+(i+.5)*w/n,top-.07,z,w/n-.012,.14,d,wood[i%5]);}
 }
 // Curved overlapping ceramic tiles: a real curved top surface with thickness.
 const tv=[],ti=[],tw=.31,tl=.47;
 for(let j=0;j<2;j++)for(let k=0;k<=6;k++){const u=k/6;tv.push((u-.5)*tw,.027+Math.sin(u*Math.PI)*.038,j*tl-tl/2)}
 for(let k=0;k<6;k++){ti.push(k,k+7,k+1,k+1,k+7,k+8)}
 const tileGeo=new THREE.BufferGeometry();tileGeo.setAttribute('position',new THREE.Float32BufferAttribute(tv,3));tileGeo.setIndex(ti);tileGeo.computeVertexNormals();tile.forEach(m=>m.side=THREE.DoubleSide);
 function roof(x,y,z,w,d,rise){const ew=w+.95,ed=d+1.05,half=ed/2,angle=Math.atan2(rise,half),slope=Math.hypot(half,rise),nx=Math.ceil(ew/.29),nr=Math.ceil(slope/.41);
  for(const side of [-1,1]){
   const q=rot(side*angle,[1,0,0]);inst(cube,frame,[x,y+rise/2-.075,z+side*half/2],[ew,.12,slope],q);
   for(let i=0;i<nx;i++)for(let j=0;j<nr;j++){const t=(j+.5)/nr;inst(tileGeo,tile[(i+j*3)%4],[x-ew/2+(i+.5)*ew/nx,y+rise*(1-t),z+side*half*t],[ew/nx/.29,1,slope/nr/.41],q);}
   for(let i=0;i<=Math.ceil(ew/.57);i++){const xx=x-ew/2+i*ew/Math.ceil(ew/.57);beam([xx,y-.1,z+side*half],[xx,y+rise-.1,z],.067,wood[3],true);}
   box(x,y-.1,z+side*half,ew+.12,.18,.13,frame);
   for(let j=1;j<4;j++)box(x,y+rise*(1-j/4)-.2,z+side*half*j/4,ew,.14,.14,wood[0]);
  }
  box(x,y+rise+.055,z,ew+.18,.16,.24,tile[0]);
  for(let i=0;i<Math.ceil(ew/.38);i++){const xx=x-ew/2+(i+.5)*ew/Math.ceil(ew/.38);beam([xx-.205,y+rise+.16,z],[xx+.205,y+rise+.16,z],.145,tile[i%4]);}
  for(const side of [-1,1]){ball(x+side*(ew/2+.08),y+rise+.19,z,.19,.23,.18,tile[0]);for(const s of [-1,1])beam([x+side*(w/2+.14),y-.08,z+s*half],[x+side*(w/2+.14),y+rise-.08,z],.10,frame,true);}
 }
 const floors=[];
 function building(p,index){const x=p.x,z=p.z,w=p.w,d=p.d,top=Math.max(...[-1,0,1].flatMap(a=>[-1,0,1].map(b=>heightAt(x+a*(w/2+.12),z+b*(d/2+.12)))))+.29,h=index===0?3.05:2.75,y=top+h;floors[index]=top;
  footing(x,z,w+.12,d+.12,top);
  // Four framed wall planes; openings remove siding instead of painting rectangles.
  function wall(axis,side,openings){const len=axis==='x'?w:d,steps=Math.ceil(len/.22),coord=axis==='x'?z+side*d/2:x+side*w/2;
   for(let i=0;i<steps;i++){const u=-len/2+(i+.5)*len/steps;let spans=[[0,h]];for(const o of openings)if(u>o[0]&&u<o[1])spans=spans.flatMap(([a,b])=>[[a,Math.min(b,o[2])],[Math.max(a,o[3]),b]].filter(([a,b])=>b>a+.02));for(const [a,b]of spans){if(axis==='x')box(x+u,top+(a+b)/2,coord,len/steps-.009,b-a,.105,wood[(i+index)%5]);else box(coord,top+(a+b)/2,z+u,.105,b-a,len/steps-.009,wood[(i+index)%5]);}}
   for(const o of openings){for(const u of [o[0],o[1]]){if(axis==='x')box(x+u,top+(o[2]+o[3])/2,coord,.13,o[3]-o[2]+.17,.19,frame);else box(coord,top+(o[2]+o[3])/2,z+u,.19,o[3]-o[2]+.17,.13,frame);}for(const yy of [o[2],o[3]]){if(axis==='x')box(x+(o[0]+o[1])/2,top+yy,coord,o[1]-o[0]+.16,.13,.2,frame);else box(coord,top+yy,z+(o[0]+o[1])/2,.2,.13,o[1]-o[0]+.16,frame);}if(o[2]>.5)for(let u=o[0]+.2;u<o[1];u+=.23){if(axis==='x')box(x+u,top+(o[2]+o[3])/2,coord,.035,o[3]-o[2],.055,wood[4]);else box(coord,top+(o[2]+o[3])/2,z+u,.055,o[3]-o[2],.035,wood[4]);}}
  }
  const front=index===0?[[-4.25,-1.6,0,2.58],[-1.35,1.35,0,2.58],[1.6,4.25,0,2.58]]:[[-w/2+.3,w/2-.3,0,2.38]];
  wall('x',-1,front);wall('x',1,[[-.65,.65,0,2.15],[-w/2+.4,-w/2+1.4,1.25,2.15]]);wall('z',-1,[[-.85,.85,1.1,2.15]]);wall('z',1,[[-1,1,1.1,2.15]]);
  for(const sx of [-1,1])for(const sz of [-1,1]){box(x+sx*w/2,top+h/2,z+sz*d/2,.20,h,.20,frame);beam([x+sx*w/2,top+h-.7,z+sz*d/2],[x+sx*(w/2-.65),top+h,z+sz*d/2],.07,frame,true);}
  for(const side of [-1,1]){box(x,y-.08,z+side*d/2,w+.3,.24,.24,frame);box(x+side*w/2,y-.08,z,.24,.24,d+.15,frame);box(x,top+.12,z+side*d/2,w,.16,.15,wood[3]);}
  // Bay columns and raised tie beams make the open hall structurally legible.
  for(const xx of index===0?[x-1.48,x+1.48]:[]){box(xx,top+h/2,z-d/2,.18,h,.2,frame);box(xx,y-.17,z,.18,.23,d,frame);}
  const rise=index===0?1.65:1.4;
  for(const side of [-1,1])for(let j=0;j<Math.ceil(d/.2);j++){const zz=-d/2+(j+.5)*d/Math.ceil(d/.2),hh=rise*(1-Math.abs(zz)/(d/2+.525));box(x+side*w/2,y+hh/2-.015,z+zz,.10,hh,.19,wood[j%5]);}
  for(const xx of [x-w/2,x,x+w/2]){beam([xx,y-.1,z-d/2],[xx,y+rise-.17,z],.09,wood[2],true);beam([xx,y+rise-.17,z],[xx,y-.1,z+d/2],.09,wood[2],true);beam([xx,y-.1,z],[xx,y+rise-.12,z],.075,frame,true);}
  roof(x,y,z,w,d,rise);
  // Open sliding shutter panels parked alongside bays; iron tracks and handles.
  for(const side of [-1,1]){const xx=x+side*(w/2-.29);box(xx,top+1.05,z-d/2-.14,.48,2.05,.08,wood[3]);for(let k=0;k<4;k++)box(xx-.18+k*.12,top+1.05,z-d/2-.19,.025,2,.025,wood[4]);ring(xx,top+1.05,z-d/2-.24,.07,.12,iron,true);}
  box(x,top+2.57,z-d/2-.16,w,.065,.07,iron);
  // Low threshold steps founded into actual ground.
  const stepW=index===0?7.5:3.5;const ground=heightAt(x,z-d/2-.7),n=Math.max(1,Math.ceil((top-ground)/.17));for(let k=0;k<n;k++){const zz=z-d/2-.25-(n-k-1)*.28,t=ground+(k+1)*(top-ground)/n,b=heightAt(x,zz)-.07;box(x,(t+b)/2,zz,stepW,t-b,.30,stone[k%3]);}
  // Name board and a modest paper work lantern.
  const signY=index===0?2.83:2.57;box(x,top+signY,z-d/2-.14,index===0?2.1:1.25,.30,.10,wood[4]);for(let i=0;i<(index===0?5:3);i++){const xx=x+(i-(index===0?2:1))*.32;box(xx,top+signY,z-d/2-.202,.035,.23,.018,frame);box(xx,top+signY+.01,z-d/2-.204,.18,.029,.018,frame);box(xx+.07,top+signY-.06,z-d/2-.204,.025,.10,.018,frame);}
  beam([x-w/2+.55,top+2.9,z-d/2-.25],[x-w/2+.55,top+2.45,z-d/2-.25],.014,iron);ball(x-w/2+.55,top+2.21,z-d/2-.25,.18,.26,.18,wicker);for(let j=0;j<5;j++)ring(x-w/2+.55,top+2.03+j*.09,z-d/2-.25,.17,.06,frame);
 }
 function coil(x,y,z,r=.35){const p=[];for(let i=0;i<100;i++){const a=i*.28,rr=.07+r*i/100;p.push([x+Math.cos(a)*rr,y+.025,z+Math.sin(a)*rr])}tube(p,.022);tube([[x+r,y+.03,z],[x+r+.18,y+.02,z+.2],[x+r+.4,y+.02,z+.13]],.022);}
 function crate(x,y,z,w=.8,d=.58,h=.58){for(let i=0;i<4;i++)box(x-w/2+(i+.5)*w/4,y+.045,z,w/4-.012,.09,d,wood[i%5]);for(const sx of [-1,1])for(const sz of [-1,1])box(x+sx*(w/2-.045),y+h/2,z+sz*(d/2-.045),.065,h,.065,wood[3]);for(let j=0;j<4;j++){const yy=y+.14+j*(h-.2)/3;for(const s of [-1,1]){box(x,yy,z+s*d/2,w,.085,.04,wood[j%5]);box(x+s*w/2,yy,z,.04,.085,d,wood[(j+2)%5]);}}}
 function tub(x,y,z,r=.4,h=.57,basket=false){const n=basket?24:16,m=basket?wicker:wood[2];inst(cyl,dark,[x,y+.05,z],[r*.77,.09,r*.77]);for(let i=0;i<n;i++){const a=i/n*Math.PI*2;beam([x+Math.cos(a)*r*.77,y+.05,z+Math.sin(a)*r*.77],[x+Math.cos(a)*r,y+h,z+Math.sin(a)*r],basket?.014:.06,m);}for(let j=0;j<(basket?12:3);j++){const t=basket?j/11:j/2;ring(x,y+.1+t*(h-.11),z,r*(.79+.21*t),basket?.045:.055,basket?wicker:iron);}if(!basket){for(const s of [-1,1])beam([x+s*r,y+h-.1,z],[x+s*r,y+h+.13,z],.025,iron);tube([[x-r,y+h+.13,z],[x,y+h+.37,z],[x+r,y+h+.13,z]],.025,iron);}}
 // Fish bodies use world transforms (including their tails/eyes) to remain attached.
 function catchFish(x,y,z,s=.6,hang=false){const axis=hang?[0,1,0]:[1,0,0];const q=hang?rot(Math.PI/2,[0,0,1]):undefined;inst(sphere,silver,[x,y,z],[hang?s*.095:s*.48,hang?s*.48:s*.095,s*.14]);inst(sphere,fishback,[x+(hang?-.052:-.04)*s,y+(hang?-.04:.052)*s,z],[hang?s*.05:s*.37,hang?s*.37:s*.05,s*.117]);
  const tg=new THREE.ConeGeometry(s*.15,s*.23,3);inst(tg,fishback,[x-axis[0]*s*.51,y-axis[1]*s*.51,z],[1,1,.43],hang?rot(Math.PI,[0,0,1]):rot(Math.PI/2,[0,0,1]));
  for(const side of [-1,1])ball(x+axis[0]*s*.29,y+axis[1]*s*.29,z+side*s*.118,s*.025,s*.025,s*.012,iron);
 }
 function table(x,y,z,w=2.5,d=1.1,catchOn=true){for(const sx of [-1,1])for(const sz of [-1,1])box(x+sx*(w/2-.16),y+.45,z+sz*(d/2-.15),.12,.9,.12,wood[3]);for(let k=0;k<5;k++)box(x,y+.95,z-d/2+(k+.5)*d/5,w,.12,d/5-.014,wood[k%5]);for(const s of [-1,1])box(x,y+.25,z+s*(d/2-.15),w-.15,.10,.11,frame);if(catchOn)for(let i=0;i<6;i++)catchFish(x-w/2+.4+i*(w-.8)/5,y+1.04,z+(i%2-.5)*.4,.47);box(x+w/2-.25,y+1.022,z+.15,.18,.032,.35,wood[4]);box(x+w/2-.23,y+1.06,z+.13,.065,.018,.25,iron);}
 function tools(x,y,z){for(const xx of [x-.08,x+.93]){box(xx,y+.69,z+.05,.06,1.38,.07,wood[3]);box(xx,y+.04,z,.15,.08,.32,wood[3]);}box(x+.42,y+1.35,z,1.1,.075,.075,frame);for(let i=0;i<4;i++){beam([x+i*.23,y,z],[x+i*.23+.12,y+1.1,z],.025,wood[4]);box(x+i*.23+.12,y+1.09,z,.20,.085,.055,iron);}for(let i=0;i<3;i++)tube([[x+.1+i*.25,y+1.35,z],[x+.1+i*.25,y+1.2,z],[x+.2+i*.25,y+1.16,z],[x+.23+i*.25,y+1.24,z]],.015,iron);}
 assembly('fish_hall','open-bay-timber-fish-hall',()=>{building(H.sheds[0],0);const y=floors[0];table(72,y,-50,2.6,1.0);table(76.5,y,-47.6,2.5,1.0);for(let i=0;i<3;i++){crate(70.25+i*.87,y,-47,.75,.7);crate(70.25+i*.87,y+.58,-47,.75,.7,.5);}tub(77.5,y,-51.7,.40,.55);tub(74.6,y,-47,.42,.55,true);coil(70.5,y,-51.6);tools(77.1,y,-46.2);});
 assembly('gear_store','timber-gear-store-with-sliding-bays',()=>{building(H.sheds[1],1);const y=floors[1];for(const zz of [-48.1,-49.4]){for(const xx of [84.6,87.9])box(xx,y+1.0,zz,.10,2,.12,frame);for(const yy of [.4,1.15,1.9]){box(86.25,y+yy,zz,3.5,.10,.65,wood[1]);for(let j=0;j<3;j++)coil(85.05+j*.9,y+yy+.08,zz,.23);}}
  // Folded repair net with separate crossing cords and cork float line on the floor.
  for(let layer=0;layer<3;layer++){for(let j=0;j<10;j++){const zz=-51.7+j*.105;const pts=[];for(let k=0;k<9;k++)pts.push([86.7+k*.13,y+.025+layer*.038+.024*Math.sin(k*.8+j),zz]);tube(pts,.012,netmat);}for(let j=0;j<9;j++){const xx=86.7+j*.13;const pts=[];for(let k=0;k<10;k++)pts.push([xx,y+.03+layer*.038+.024*Math.sin(j*.8+k),-51.7+k*.105]);tube(pts,.012,netmat);}}
  for(let i=0;i<6;i++)ball(86.7+i*.2,y+.20,-51.75,.07,.07,.1,wicker);
  crate(88.3,y,-51.1,.6,.7);tub(84.7,y,-51.6,.32,.52,true);tools(88.4,y,-48.2);});
 assembly('repair_workshop','timber-boat-repair-workshop',()=>{building(H.sheds[2],2);const y=floors[2];table(55.2,y,-52.5,3.6,.72,false);tools(54,y+1.04,-52.27);for(let i=0;i<4;i++)box(53.3+i*.2,y+1.055,-52.5,.11,.10,.31,iron);for(const xx of [53.8,56]){for(const dz of [-.38,.38])beam([xx,y,-54.4+dz],[xx,y+.75,-54.4],.065,wood[3],true);box(xx,y+.77,-54.4,.16,.11,.95,wood[2]);}
  // A short upside-up repair hull skeleton: keel, bent ribs and loose new planking.
  beam([53.2,y+.87,-54.4],[56.7,y+.87,-54.4],.065,frame,true);for(let i=0;i<9;i++){const x=53.3+i*.4,r=.20+.46*Math.sin(i/8*Math.PI);tube([[x,y+1.28,-54.4-r],[x,y+.95,-54.4-r*.65],[x,y+.87,-54.4],[x,y+.95,-54.4+r*.65],[x,y+1.28,-54.4+r]],.044,wood[2]);}for(const dz of [-.25,0,.25])box(55,y+1.3,-54.4+dz,3.4,.06,.17,wood[4]);tub(53,y,-53,.25,.4);coil(56.7,y,-55.1,.23);});
 assembly('sorting_yard','outdoor-fish-handling-and-crates',()=>{const y=heightAt(66.2,-50.2);table(66.2,y,-50.2,2.5,1.15);for(let i=0;i<3;i++){crate(64.9+i*.85,y,-48.55,.75,.62);if(i===2)crate(64.9+i*.85,y+.58,-48.55,.75,.62,.47);}for(const [x,z] of [[65.1,-51.6],[67.4,-51.7]]){tub(x,heightAt(x,z),z,.42,.6,true);for(let j=0;j<4;j++)catchFish(x-.16+j*.10,heightAt(x,z)+.14,z,.4);}tub(68.1,y,-49.1,.34,.58);});
 function netFrame(cx,z,w){const y=Math.max(heightAt(cx-w/2,z),heightAt(cx+w/2,z))+.08,top=y+2.65;
  for(const x of [cx-w/2,cx+w/2]){beam([x,heightAt(x,z)-.22,z],[x,top+.15,z],.09,wood[1]);beam([x,heightAt(x,z+.6),z+.6],[x,top-.8,z],.045,wood[3]);ball(x,top+.15,z,.105,.06,.105,wood[4]);}beam([cx-w/2-.15,top,z],[cx+w/2+.15,top,z],.07,wood[2]);beam([cx-w/2,y+.25,z],[cx+w/2,y+.25,z],.05,wood[0]);
  const nx=Math.ceil(w/.23),ny=10;const point=(i,j)=>[cx-w/2+.12+(w-.24)*i/nx,y+.36+(top-y-.48)*j/ny-.12*Math.sin(Math.PI*i/nx),z+.045*Math.sin(i*.9+j*.7)];
  for(let i=0;i<=nx;i++)for(let j=0;j<ny;j++)beam(point(i,j),point(i,j+1),.010,netmat);for(let j=0;j<=ny;j++)for(let i=0;i<nx;i++)beam(point(i,j),point(i+1,j),.010,netmat);for(let i=0;i<=nx;i++)for(let j=0;j<=ny;j++)if((i+j)%2===0){const p=point(i,j);ball(...p,.018,.018,.018,rope);}
  for(let i=0;i<9;i++){const x=cx-w/2+.2+i*(w-.4)/8;beam([x,top,z],[x,top-.16,z],.018,rope);ball(x,top-.21,z,.09,.12,.085,wicker);}coil(cx-w/2+.5,heightAt(cx-w/2+.5,z-.3),z-.3,.26);
 }
 assembly('west_net_frame','full-mesh-net-drying-frame',()=>netFrame(66.6,-44.2,5.1));
 assembly('east_net_frame','full-mesh-net-drying-frame',()=>netFrame(81.7,-44.2,4.5));
 assembly('drying_fish','hanging-fish-rack',()=>{const x=80.8,z=-50.2,y=heightAt(x,z);for(const xx of [x-.75,x+.75]){beam([xx,y,z-1.5],[xx,y+2.4,z-1.5],.065,wood[1]);beam([xx,y,z+1.5],[xx,y+2.4,z+1.5],.065,wood[1]);beam([xx,y+2.3,z-1.7],[xx,y+2.3,z+1.7],.05,wood[2]);}for(let j=0;j<9;j++){const zz=z-1.3+j*.32;beam([x-.75,y+2.3,zz],[x+.75,y+2.3,zz],.02,rope);for(const side of [-1,1]){tube([[x+side*.43,y+2.3,zz],[x+side*.43,y+2.05,zz]],.013);catchFish(x+side*.43,y+1.74,zz,.62,true);}}tub(x,y,z,.37,.5,true);});
 assembly('lumber_and_fuel','stacked-lumber-firewood-and-tools',()=>{const x=54.5,z=-48.7,y=Math.max(heightAt(52.8,z),heightAt(56.2,z));for(const xx of [53,56]){const bottom=Math.min(heightAt(xx,z-.55),heightAt(xx,z+.55))-.035;box(xx,(bottom+y+.24)/2,z,.25,y+.24-bottom,1.1,wood[3]);}for(let j=0;j<5;j++)for(let i=0;i<4;i++)box(x,y+.30+j*.16,z-.42+i*.27,3.9-(j%2)*.15,.12,.22,wood[(j+i)%5]);for(let i=0;i<25;i++){const xx=52.7+i%5*.19,zz=-50.5,yy=heightAt(xx,zz)+.10+Math.floor(i/5)*.18;beam([xx,yy,zz-.45],[xx,yy,zz+.45],.085,wood[3]);ball(xx,yy,zz-.46,.067,.067,.015,wood[4]);}tools(56.1,heightAt(56.1,-48.7),-48.7);});
 assembly('handcart','two-wheel-fish-handcart',()=>{const x=83,z=-54.2,y=heightAt(x,z),r=.47;for(const side of [-1,1]){const xx=x+side*.7;const geo=new THREE.TorusGeometry(r,.052,6,28);inst(geo,wood[3],[xx,y+r,z],[1,1,1],rot(Math.PI/2));for(let k=0;k<10;k++){const a=k*Math.PI/5;beam([xx,y+r,z],[xx,y+r+Math.sin(a)*r,z+Math.cos(a)*r],.028,wood[4]);}beam([xx-.09,y+r,z],[xx+.09,y+r,z],.085,iron);}beam([x-.8,y+r,z],[x+.8,y+r,z],.05,iron);crate(x,y+.55,z,1.18,1.5,.5);for(const side of [-1,1])beam([x+side*.49,y+.5,z+.3],[x+side*.49,y+.8,z-2.05],.045,wood[3]);for(const side of [-1,1])beam([x+side*.48,y,z-1.3],[x+side*.48,y+.66,z-1.3],.035,wood[0]);});
 assembly('cistern','stone-water-cistern-and-buckets',()=>{const x=89.8,z=-45.4,y=Math.max(...[-.7,.7].flatMap(dx=>[-.6,.6].map(dz=>heightAt(x+dx,z+dz))));box(x,y+.08,z,1.7,.16,1.45,stone[2]);for(const side of [-1,1]){box(x+side*.71,y+.47,z,.2,.78,1.45,stone[0]);box(x,y+.47,z+side*.60,1.4,.78,.2,stone[1]);}box(x,y+.64,z,1.2,.045,.97,water);beam([90.6,heightAt(90.6,z+.5),z+.5],[90.6,y+1.8,z+.5],.11,wood[3]);beam([90.6,y+1.7,z+.5],[89.8,y+1.52,z],.055,wood[2]);tube([[89.8,y+1.51,z],[89.8,y+1.1,z],[89.8,y+.66,z]],.018,water);tub(88.8,heightAt(88.8,-44.4),-44.4,.25,.43);box(x,y+.92,z+.35,1.5,.055,.25,wood[2]);});
 // Fine, sampled ground surfaces never replace terrain or extend over the sea.
 function walk(points,width){const pos=[],ix=[];for(let s=1;s<points.length;s++){const a=points[s-1],b=points[s],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),n=Math.ceil(len/.3);for(let i=0;i<n;i++){const k=pos.length/3;for(const [t,side]of [[i/n,-1],[i/n,1],[(i+1)/n,-1],[(i+1)/n,1]]){const x=a[0]+dx*t-dz/len*width/2*side,z=a[1]+dz*t+dx/len*width/2*side;pos.push(x,heightAt(x,z)+.025,z)}ix.push(k,k+1,k+2,k+1,k+3,k+2)}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(ix);geo.computeVertexNormals();group.add(new THREE.Mesh(geo,earth));}
 assembly('connected_workyard','open-circulation-workyard-and-local-walks',()=>{
  walk([[53.3,-57.7],[89,-57.7]],2.0);walk([[74,-57.7],[74,-53.5]],2.2);walk([[86.5,-57.7],[86.5,-53.5]],2.05);walk([[55,-57.7],[55,-56.2]],2.1);walk([[62.5,-54.5],[66.2,-53.3],[68,-46.2],[77.5,-44.9],[87.5,-44.9],[90,-46.5]],1.45);walk([[78.8,-44.9],[77.4,-42],[74.5,-39.1]],1.15);
  for(let i=0;i<14;i++){const t=i/13,x=78.4-3.7*t,z=-43.2+3.8*t,y=heightAt(x,z);box(x,y+.065,z,1.12,.13,.29,stone[i%3],-.5);}
 });
 assembly('slope_shoulders','rooted-grass-stones-and-workyard-wear',()=>{
  for(let i=0;i<250;i++){const x=51.3+rand(i)*40.5,z=-43+rand(i+951)*4.5;if(!clearRoad(x,z,.35)||Math.hypot((x-76)/1.2,(z+41)/1.4)<2.1)continue;const y=heightAt(x,z);if(i%5===0)inst(rock,stone[i%3],[x,y+.04,z],[.15+rand(i+8)*.2,.10,.12+rand(i+19)*.15],rot(i));else for(let j=0;j<4;j++){const a=i+j*1.4;beam([x,y-.015,z],[x+Math.cos(a)*.13,y+.17+rand(i+j)*.23,z+Math.sin(a)*.13],.013,green);}}
  for(let i=0;i<170;i++){const x=53+rand(i+1500)*36,z=-58.5+rand(i+1789)*13;if(!clearRoad(x,z,.2)||H.sheds.some(p=>Math.abs(x-p.x)<p.w/2+.5&&Math.abs(z-p.z)<p.d/2+.5))continue;const y=heightAt(x,z);inst(rock,stone[i%3],[x,y+.025,z],[.025+rand(i)*.04,.022,.035],rot(i));}
 });
 root.userData.objects=records;root.userData.interfacesRead=['harbor-layout','terrain','roads','layout'];root.userData.seaLevel=world.seaLevel;
 return root;
}
