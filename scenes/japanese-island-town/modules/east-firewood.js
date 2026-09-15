import { heightAt, roadNetwork, layout } from './root.js';

export function build(THREE, ctx) {
 const g=new THREE.Group();g.name='East firewood household: shed, fuel, working yard and cherry';
 const lot=layout().town.lots.find(l=>l.x===-7&&l.z===-32);if(!lot)return g;
 const roads=roadNetwork();
 const colors={wood:'#73513b',light:'#94704e',dark:'#493a2d',end:'#c09c6c',ring:'#96734d',tile:'#626a69',iron:'#444b48',stone:'#818276',clay:'#9c6750',blue:'#546c70',water:'#526b64',pink:'#d4a2ad',pale:'#e9bec6',leaf:'#74815d'};
 const m={};for(const [k,c]of Object.entries(colors))m[k]=new THREE.MeshStandardMaterial({color:c,roughness:k==='water'?.3:.9});
 const blossoms=[],boxes={},dummy=new THREE.Object3D(),cube=new THREE.BoxGeometry(1,1,1);
 function box(x,y,z,w,h,d,mat='wood',rx=0,ry=0,rz=0){dummy.position.set(x,y,z);dummy.rotation.set(rx,ry,rz);dummy.scale.set(w,h,d);dummy.updateMatrix();(boxes[mat]??=[]).push(dummy.matrix.clone());}
 function mesh(geo,mat,x,y,z){const o=new THREE.Mesh(geo,m[mat]);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
 function beam(a,b,r=.05,mat='wood'){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);const o=mesh(new THREE.CylinderGeometry(r,r,v.length(),7),mat,...av.clone().add(bv).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
 const ground=(x,z)=>heightAt(x,z)+.045;
 function post(x,z,h=1.12){const y=ground(x,z);box(x,y+h/2,z,.14,h,.14,'dark');box(x,y+h+.025,z,.19,.07,.19,'light');}
 function fence(a,b){const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.45);for(let i=0;i<=n;i++){const t=i/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;post(x,z);if(i){const t0=(i-1)/n,xx=a[0]+(b[0]-a[0])*t0,zz=a[1]+(b[1]-a[1])*t0;for(const h of [.35,.87])beam([xx,ground(xx,zz)+h,zz],[x,ground(x,z)+h,z],.044,'wood');}}
  const slats=Math.floor(Math.hypot(b[0]-a[0],b[1]-a[1])/.24);for(let i=1;i<slats;i++){const t=i/slats,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;box(x,ground(x,z)+.57,z,.055,.93,.055,'light');}}
 fence([-16.65,-37.65],[-16.65,-25.06]);fence([-16.65,-37.65],[-1.16,-37.65]);fence([-1.16,-37.65],[-1.16,-25.06]);
 fence([-16.65,-25.06],[-8.45,-25.06]);fence([-5.55,-25.06],[-1.16,-25.06]);
 // Gate leaves stand open inside the yard, preserving the 2.4m entrance corridor.
 for(const x of [-8.45,-5.55]){const z0=-25.10,z1=-26.34;for(const h of [.28,.92])beam([x,ground(x,z0)+h,z0],[x,ground(x,z1)+h,z1],.045);for(let i=0;i<6;i++){const z=z0-i*(z0-z1)/5;box(x,ground(x,z)+.6,z,.065,.96,.075,'light');}beam([x,ground(x,z0)+.3,z0],[x,ground(x,z1)+.9,z1],.036,'dark');for(const h of [.3,.86])box(x,ground(x,z0)+h,z0,.19,.09,.09,'iron');}
 // Complete small boarded shed, north-facing door, pitched timber-shingle roof.
 const sx=-14.65,sz=-35.1,w=2.65,d=3.25;
 const samples=[[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2],[w/2,d/2]].map(([x,z])=>ground(sx+x,sz+z));
 const floor=Math.max(...samples)+.17,low=Math.min(...samples)-.15,eave=floor+2.18,rise=.64;
 box(sx,(floor+low)/2,sz,w+.14,floor-low,d+.14,'stone');
 for(let j=0;j<12;j++)box(sx,floor+.035,sz-d/2+(j+.5)*d/12,w,.085,d/12-.016,'light');
 for(const side of [-1,1]){for(let j=0;j<13;j++)box(sx+side*w/2,floor+1.09,sz-d/2+(j+.5)*d/13,.09,2.18,d/13-.015,j%3?'wood':'light');for(let j=0;j<11;j++){const x=sx-w/2+(j+.5)*w/11;if(side===1&&Math.abs(x-sx)<.48)continue;box(x,floor+1.09,sz+side*d/2,w/11-.012,2.18,.09,j%3?'wood':'light');}
 for(const z of [sz-d/2,sz+d/2])box(sx+side*w/2,floor+1.1,z,.16,2.3,.16,'dark');for(const h of [.15,2.12]){box(sx+side*w/2,floor+h,sz,.13,.12,d+.12,'dark');box(sx,floor+h,sz+side*d/2,w+.16,.12,.13,'dark');}}
 const front=sz+d/2+.075;
 box(sx,floor+1,front,.94,1.99,.10,'dark');for(let i=0;i<5;i++)box(sx-.38+i*.19,floor+1,front+.055,.175,1.93,.07,'light');
 for(const h of [.27,1.7])box(sx,floor+h,front+.1,.92,.10,.06,'wood');beam([sx-.4,floor+.3,front+.14],[sx+.4,floor+1.69,front+.14],.043,'wood');box(sx+.3,floor+.95,front+.15,.055,.15,.05,'iron');
 for(const x of [sx-.52,sx+.52])box(x,floor+1.06,front,.1,2.19,.15,'dark');box(sx,floor+2.12,front,1.15,.13,.15,'dark');
 const stz=front+.35,sty=ground(sx,stz);box(sx,(floor+sty)/2,stz,1.12,Math.max(.09,floor-sty),.5,'stone');
 // Recessed side window with lattice and lintel.
 box(sx-w/2-.065,floor+1.42,sz-.25,.045,.68,.85,'dark');for(let i=0;i<5;i++)box(sx-w/2-.10,floor+1.42,sz-.61+i*.18,.05,.62,.035,'light');box(sx-w/2-.1,floor+1.4,sz-.25,.05,.045,.85,'light');
 for(const side of [-1,1]){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([-w/2,0,0,w/2,0,0,0,rise,0],3));geo.setIndex(side>0?[0,1,2]:[2,1,0]);geo.computeVertexNormals();mesh(geo,'wood',sx,eave,sz+side*d/2);}
 const run=w/2+.23,ang=Math.atan(rise/run),len=Math.hypot(run,rise);
 for(const side of [-1,1]){box(sx+side*run/2,eave+rise/2,sz,len,.105,d+.44,'dark',0,0,-side*ang);
 for(let row=0;row<6;row++)for(let col=0;col<12;col++){const t=(row+.5)/6,xx=sx+side*run*t,zz=sz-(d+.39)/2+(col+.5)*(d+.39)/12;box(xx,eave+rise*(1-t)+.072,zz,len/6+.045,.065,(d+.39)/12-.016,(row+col)%4?'tile':'stone',0,0,-side*ang);}}
 box(sx,eave+rise+.11,sz,.16,.13,d+.53,'tile');
 // Log stack on raised bearers. Angular split sections have pale end faces.
 const stackX=-15.12,stackZ=-31.62,base=ground(stackX,stackZ)+.18;
 for(const x of [stackX-.94,stackX+.94])box(x,base-.06,stackZ,.14,.24,1.03,'dark');
 const splitGeo=new THREE.CylinderGeometry(.13,.15,.88,5);const capGeo=new THREE.CircleGeometry(.125,5);
 for(let row=0;row<5;row++)for(let col=0;col<8-row%2;col++){const x=stackX-.91+col*.25+(row%2)*.12,y=base+.13+row*.215,z=stackZ+(col%3-.8)*.025;const o=mesh(splitGeo,(col+row)%3?'wood':'dark',x,y,z);o.rotation.x=Math.PI/2;
 const cap=mesh(capGeo,'end',x,y,z+.446);cap.rotation.z=col*.41;beam([x-.08,y+.015,z+.451],[x+.065,y-.014,z+.451],.007,'ring');
 }
 for(const x of [stackX-1.13,stackX+1.13]){post(x,stackZ,1.45);beam([x,ground(x,stackZ)+.2,stackZ+.48],[x,ground(x,stackZ)+1.15,stackZ],.045,'light');}
 // Chopping stump, embedded axe, scattered split billets and small kindling bundle.
 const cx=-13.24,cz=-30.02,cy=ground(cx,cz);
 mesh(new THREE.CylinderGeometry(.35,.43,.56,11),'wood',cx,cy+.28,cz);mesh(new THREE.CylinderGeometry(.346,.346,.024,16),'end',cx,cy+.568,cz);
 for(const r of [.12,.23,.31]){const ring=mesh(new THREE.TorusGeometry(r,.008,4,24),'ring',cx,cy+.583,cz);ring.rotation.x=Math.PI/2;}
 beam([cx+.04,cy+.57,cz],[cx+.42,cy+1.44,cz+.12],.025,'light');box(cx+.07,cy+.69,cz,.34,.19,.06,'iron',0,0,-.36);
 for(let k=0;k<7;k++){const x=cx+.55+(k%3)*.16,z=cz-.42+Math.floor(k/3)*.19;box(x,ground(x,z)+.07,z,.11,.10,.38,'end',0,k*.57);}
 for(let k=0;k<13;k++){const x=-13.28+(k%4)*.065,z=-32.39;beam([x,ground(x,z)+.1+Math.floor(k/4)*.07,z-.28],[x+.03,ground(x,z)+.13+Math.floor(k/4)*.07,z+.3],.027,k%2?'light':'wood');}
 // A bow saw hangs on the shed side facing the work space.
 const sy=floor+1.52;beam([sx+.69,sy,front+.13],[sx+1.18,sy,front+.13],.018,'iron');for(const x of [sx+.69,sx+1.18])beam([x,sy,front+.13],[x,sy+.29,front+.13],.023,'wood');beam([sx+.69,sy+.29,front+.13],[sx+1.18,sy+.29,front+.13],.025,'wood');
 function jar(x,z,s,mat,water=false){const y=ground(x,z),pts=[[.16,0],[.28,.10],[.37,.38],[.32,.66],[.22,.78],[.22,.85],[.18,.85],[.18,.77],[.25,.63],[.28,.39]].map(([r,h])=>new THREE.Vector2(r*s,h*s));mesh(new THREE.LatheGeometry(pts,20),mat,x,y,z);if(water)mesh(new THREE.CylinderGeometry(.20*s,.20*s,.015,20),'water',x,y+.73*s,z);const rim=mesh(new THREE.TorusGeometry(.20*s,.025*s,7,20),mat,x,y+.85*s,z);rim.rotation.x=Math.PI/2;}
 jar(-3.15,-26.28,1.25,'blue',true);jar(-4.10,-26.31,.64,'clay');jar(-2.53,-27.42,.68,'clay');
 // Dipper spans water jar mouth.
 beam([-3.5,ground(-3.15,-26.28)+1.10,-26.22],[-2.92,ground(-3.15,-26.28)+1.10,-26.22],.017,'light');
 mesh(new THREE.CylinderGeometry(.09,.07,.1,10),'light',-2.92,ground(-3.15,-26.28)+1.12,-26.22);
 // Compact multi-branched cherry contained entirely in west shoulder.
 const tx=-14.73,tz=-27.06,ty=ground(tx,tz);beam([tx,ty,tz],[tx+.10,ty+2.42,tz-.08],.10,'dark');
 for(let j=0;j<7;j++){const a=j*2.399,r=.53+(j%3)*.20,x=tx+Math.cos(a)*r,z=tz+Math.sin(a)*r,y=ty+2.38+(j%3)*.35;beam([tx+.07,ty+1.25,tz],[x,y,z],.046,'wood');for(let k=0;k<5;k++){const b=k*2.399+j,xx=x+Math.cos(b)*.34,zz=z+Math.sin(b)*.34;const o=mesh(new THREE.IcosahedronGeometry(.41+(k%2)*.08,1),k%3?'pink':'pale',xx,y+Math.sin(k)*.16,zz);o.scale.y=.77;
 for(let n=0;n<14;n++){const a=n*2.399,vy=1-2*(n+.5)/14,rr=Math.sqrt(1-vy*vy)*(.41+(k%2)*.08);dummy.position.set(xx+Math.cos(a)*rr,y+Math.sin(k)*.16+vy*(.41+(k%2)*.08)*.77,zz+Math.sin(a)*rr);dummy.rotation.set(n*.4,j,0);dummy.scale.setScalar(.047+(n%3)*.013);dummy.updateMatrix();blossoms.push(dummy.matrix.clone());}
 }}
 for(let i=0;i<17;i++){const a=i*2.399,r=.25+(i%5)*.17,x=tx+Math.cos(a)*r,z=tz+Math.sin(a)*r;box(x,ground(x,z)+.018,z,.04,.012,.035,i%3?'pink':'pale',0,a);}
 // Root protection stones mark intentional planting; they do not cover the shared yard.
 for(let i=0;i<12;i++){const a=i*Math.PI/6,x=tx+Math.cos(a)*.67,z=tz+Math.sin(a)*.67;const o=mesh(new THREE.DodecahedronGeometry(.105,0),'stone',x,ground(x,z)+.04,z);o.scale.set(1,.65,.85);}
 for(const [mat,items]of Object.entries(boxes)){const o=new THREE.InstancedMesh(cube,m[mat],items.length);items.forEach((matrix,i)=>o.setMatrixAt(i,matrix));o.castShadow=true;o.receiveShadow=true;g.add(o);}
 const blooms=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),m.pale,blossoms.length);blossoms.forEach((matrix,i)=>blooms.setMatrixAt(i,matrix));blooms.castShadow=true;g.add(blooms);
 g.userData.sharedRoadCount=roads.length;
 return g;
}
