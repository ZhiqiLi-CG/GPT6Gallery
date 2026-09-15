import { heightAt, roadNetwork, layout } from './root.js';

export function build(THREE, ctx) {
 const g=new THREE.Group();g.name='East pine household: tended bridge-side garden';
 const lot=layout().town.lots.find(l=>l.x===5&&l.z===-12);
 if(!lot) return g;
 const roads=roadNetwork();
 const colors={wood:'#786044',darkwood:'#514435',bamboo:'#a19263',rope:'#b1a17a',stone:'#888e80',lightstone:'#a4a591',moss:'#61704a',soil:'#594b38',soil2:'#736044',green:'#456448',leaf:'#637c49',newleaf:'#839459',pine:'#284c3e',pine2:'#3b6048',pine3:'#4f7050',clay:'#9d644b',blue:'#617c7c',inside:'#403b2d',basket:'#a48a5e',metal:'#5b6760'};
 const mats={};for(const [k,color]of Object.entries(colors))mats[k]=new THREE.MeshStandardMaterial({color,roughness:k==='blue'?.48:.93});
 const boxgeo=new THREE.BoxGeometry(1,1,1), sphere=new THREE.SphereGeometry(1,9,6), cyl=new THREE.CylinderGeometry(1,1,1,9),ico=new THREE.IcosahedronGeometry(1,1),batches=new Map(),dummy=new THREE.Object3D();
 function add(geo,m,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){const key=geo.uuid+m;if(!batches.has(key))batches.set(key,{geo,m,items:[]});dummy.position.set(x,y,z);dummy.rotation.set(rx,ry,rz);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();batches.get(key).items.push(dummy.matrix.clone());}
 function box(x,y,z,w,h,d,m='wood',ry=0){add(boxgeo,m,x,y,z,w,h,d,0,ry);}
 function beam(a,b,r,m='wood',taper=1){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);const geo=taper===1?cyl:new THREE.CylinderGeometry(taper,1,1,9);const key=geo.uuid+m;if(!batches.has(key))batches.set(key,{geo,m,items:[]});dummy.position.copy(av.add(bv).multiplyScalar(.5));dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());dummy.scale.set(r,v.length(),r);dummy.updateMatrix();batches.get(key).items.push(dummy.matrix.clone());}
 function ring(x,y,z,r,t,m='rope',rx=Math.PI/2){add(new THREE.TorusGeometry(r,t,5,24),m,x,y,z,1,1,1,rx);}
 const ground=(x,z)=>heightAt(x,z)+.075;
 function stone(x,z,s=.3){add(ico,'stone',x,ground(x,z)+.055,z,s,.095,s*.76,0,x*2.5);}
 function surface(x0,z0,x1,z1,m,offset=.105){const a=[],idx=[],nx=Math.ceil((x1-x0)/.22),nz=Math.ceil((z1-z0)/.22);for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const x=x0+(x1-x0)*i/nx,z=z0+(z1-z0)*j/nz;a.push(x,heightAt(x,z)+offset,z);if(i<nx&&j<nz){const k=j*(nx+1)+i;idx.push(k,k+nx+1,k+1,k+1,k+nx+1,k+nx+2);}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(a,3));geo.setIndex(idx);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,mats[m]);mesh.receiveShadow=true;g.add(mesh);}
 function post(x,z,h=1){const y=ground(x,z);box(x,y+h/2,z,.12,h,.12,'darkwood');box(x,y+h+.03,z,.17,.06,.17,'wood');}
 function fence(a,b,n=4,h=.95,bamboo=false){for(let i=0;i<=n;i++){const t=i/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;post(x,z,h);}for(const off of [.28,.76])beam([a[0],ground(...a)+off,a[1]],[b[0],ground(...b)+off,b[1]],.043,bamboo?'bamboo':'wood');const len=Math.hypot(b[0]-a[0],b[1]-a[1]),count=Math.floor(len/(bamboo?.2:.32));for(let i=1;i<count;i++){const t=i/count,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,y=ground(x,z);if(bamboo){beam([x,y+.13,z],[x,y+h-.05+(i%3)*.035,z],.025,'bamboo');for(const off of [.29,.76])ring(x,y+off,z,.036,.012);}else box(x,y+.48,z,.075,.75,.065,'wood');}}
 // Low frontage fence leaves the full parent stair corridor unobstructed.
 fence([.12,-19.01],[3.12,-19.01],3,.97);
 fence([6.85,-19.01],[9.7,-19.01],3,.97);
 fence([11.25,-19.01],[12.65,-19.01],2,.97);
 fence([12.68,-18.9],[12.68,-15.75],3,.92,true);
 fence([12.68,-10.95],[12.68,-7.45],3,1.08,true);
 // Gate hangs open into the garden with diagonal brace and visible hinge collars.
 fence([9.7,-19.01],[10.12,-17.98],1,.91,true);
 beam([9.7,ground(9.7,-19.01)+.19,-19.01],[10.12,ground(10.12,-17.98)+.83,-17.98],.026,'bamboo');
 for(const h of [.22,.69])ring(9.7,ground(9.7,-19.01)+h,-19.01,.087,.022,'metal');
 // Footstones curve into the shoulder garden without crossing the street.
 for(const [x,z]of [[10.53,-18.55],[10.42,-17.82],[10.27,-17.1],[10.12,-16.4],[10.03,-15.65],[10.03,-14.86],[10.1,-14.06],[10.14,-13.28],[10.2,-12.48],[10.2,-11.7],[10.23,-10.93],[10.23,-10.12],[10.23,-9.3],[10.25,-8.5]])stone(x,z,.34);
 // Trained black pine: tapering bent trunk, exposed roots, branch fans, dense layered needle pads.
 const tx=11.48,tz=-14.35,ty=ground(tx,tz);
 const trunk=[[tx,ty-.04,tz],[tx-.13,ty+.95,tz+.08],[tx+.13,ty+1.95,tz-.05],[tx-.05,ty+2.85,tz+.12],[tx+.18,ty+3.65,tz+.07]];
 for(let i=0;i<trunk.length-1;i++)beam(trunk[i],trunk[i+1],.15-i*.024,'darkwood',.78);
 for(let i=0;i<5;i++){const a=i*1.256;beam([tx,ty+.12,tz],[tx+Math.cos(a)*.46,ground(tx+Math.cos(a)*.46,tz+Math.sin(a)*.46),tz+Math.sin(a)*.46],.075,'darkwood',.5);}
 const pads=[[-.51,1.95,.14,.56,.68],[.5,2.35,-.17,.59,.69],[-.38,2.83,-.35,.58,.63],[.35,3.22,.36,.62,.58],[.12,3.72,.03,.58,.61]];
 for(let j=0;j<pads.length;j++){const [dx,dy,dz,rx,rz]=pads[j],x=tx+dx,y=ty+dy,z=tz+dz;beam([tx,ty+dy-.48,tz],[x,y-.12,z],.065,'darkwood',.48);for(let k=0;k<13;k++){const a=k*2.399,rr=Math.sqrt((k+.3)/13),px=x+Math.cos(a)*rx*rr*.65,pz=z+Math.sin(a)*rz*rr*.65;add(ico,['pine','pine2','pine3'][k%3],px,y+(k%3)*.055,pz,rx*.43,.17+(k%3)*.023,rz*.43,0,a);if(k%3===0)beam([x,y-.12,z],[px,y,pz],.02,'darkwood');}}
 // Fine radial needle sprays break up the silhouettes of the clipped foliage pads.
 for(let j=0;j<pads.length;j++){const [dx,dy,dz,rx,rz]=pads[j];for(let k=0;k<36;k++){const a=k*2.399,rr=Math.sqrt((k+.5)/36),x=tx+dx+Math.cos(a)*rx*rr*.91,z=tz+dz+Math.sin(a)*rz*rr*.91,y=ty+dy+.12+Math.sin(k*1.7)*.065;for(let n=0;n<3;n++){const angle=a+n*.7;beam([x,y,z],[x+Math.cos(angle)*.09,y+.08+(n%2)*.03,z+Math.sin(angle)*.09],.008,n%2?'pine3':'pine2');}}}
 for(let i=0;i<7;i++){const a=i*2.399;add(ico,'moss',tx+Math.cos(a)*.48,ground(tx+Math.cos(a)*.48,tz+Math.sin(a)*.42)+.028,tz+Math.sin(a)*.42,.21,.065,.15);}
 // Open stone lantern, deliberately distinct from the root roadside lantern.
 const lx=11.6,lz=-17.35,ly=ground(lx,lz);
 box(lx,ly+.12,lz,.94,.3,.88,'stone');box(lx,ly+.3,lz,.68,.13,.64,'lightstone');
 add(new THREE.CylinderGeometry(.18,.25,.83,8),'stone',lx,ly+.76,lz);
 box(lx,ly+1.2,lz,.65,.15,.65,'stone');box(lx,ly+1.31,lz,.53,.07,.53,'lightstone');
 for(const dx of [-.225,.225])for(const dz of [-.225,.225])box(lx+dx,ly+1.57,lz+dz,.085,.5,.085,'stone');
 box(lx,ly+1.84,lz,.63,.1,.63,'stone');
 add(new THREE.CylinderGeometry(.31,.66,.28,4),'stone',lx,ly+2.02,lz,1,1,1,0,Math.PI/4);
 box(lx,ly+2.18,lz,.36,.06,.36,'lightstone');add(sphere,'stone',lx,ly+2.3,lz,.115,.13,.115);
 box(lx,ly+1.38,lz,.12,.11,.12,'clay');add(sphere,'inside',lx,ly+1.46,lz,.023,.032,.023);
 for(let i=0;i<4;i++)add(ico,'moss',lx-.28+i*.16,ly+.285,lz+.26,.11,.025,.10);
 // Individually edged kitchen beds, furrows, soil granules and leaves.
 function bed(x0,z0,x1,z1,kind){surface(x0,z0,x1,z1,'soil');for(const z of [z0,z1])for(let x=x0+.12;x<x1;x+=.27)stone(x,z,.14);for(const x of [x0,x1])for(let z=z0+.16;z<z1;z+=.28)stone(x,z,.14);
 for(let i=0;i<110;i++){const x=x0+.13+((i*47)%109)/109*(x1-x0-.26),z=z0+.13+((i*71)%107)/107*(z1-z0-.26);add(ico,i%3?'soil2':'soil',x,heightAt(x,z)+.128,z,.028+(i%3)*.007,.025,.035);}
 for(let x=x0+.3;x<x1-.15;x+=.39){for(let z=z0+.2;z<z1-.15;z+=.24)box(x,heightAt(x,z)+.125,z,.12,.045,.25,'soil2');for(let z=z0+.32;z<z1-.15;z+=.44){const y=heightAt(x,z)+.15;if(kind==='onion'){add(sphere,'lightstone',x,y+.045,z,.065,.07,.07);for(let k=0;k<5;k++){const a=k*1.257;beam([x,y+.07,z],[x+Math.cos(a)*.1,y+.36+(k%2)*.08,z+Math.sin(a)*.1],.014,k%2?'leaf':'green');}}else{for(let k=0;k<6;k++){const a=k*Math.PI/3;add(sphere,k%2?'leaf':'newleaf',x+Math.cos(a)*.075,y+.085,z+Math.sin(a)*.075,.085,.045,.15,.45,a,.2);}add(sphere,'green',x,y+.115,z,.065,.09,.065);}}}}
 bed(.45,-18.58,2.95,-16.55,'cabbage');bed(10.76,-10.95,12.38,-9.53,'onion');bed(10.76,-9.04,12.38,-7.66,'cabbage');
 // Hollow wheel-thrown ceramic jars and woven open storage baskets.
 function pot(x,z,r,h,m='clay',plant=false){const y=ground(x,z),pts=[[0,0],[r*.63,0],[r*.84,h*.12],[r,h*.47],[r*.77,h*.83],[r*.72,h],[r*.60,h],[r*.63,h*.85],[r*.81,h*.47],[r*.58,h*.13],[0,h*.13]].map(p=>new THREE.Vector2(...p));add(new THREE.LatheGeometry(pts,20),m,x,y,z);ring(x,y+h,z,r*.67,.032,m);if(plant){add(cyl,'soil',x,y+h*.78,z,r*.58,.025,r*.58);for(let k=0;k<9;k++){const a=k*2.399;beam([x,y+h*.8,z],[x+Math.cos(a)*r*.7,y+h+.25+(k%3)*.07,z+Math.sin(a)*r*.7],.017,'green');add(sphere,'leaf',x+Math.cos(a)*r*.6,y+h+.2,z+Math.sin(a)*r*.6,.07,.14,.06,0,a,.6);}}}
 pot(7.35,-16.66,.31,.66,'blue',true);pot(8.12,-16.53,.36,.73,'clay');pot(8.87,-16.55,.24,.47,'clay',true);pot(.02,-15.45,.25,.55,'blue',true);
 function basket(x,z,r,h){const y=ground(x,z);add(cyl,'inside',x,y+.04,z,r*.75,.07,r*.75);for(let k=0;k<18;k++){const a=k*Math.PI/9;beam([x+Math.cos(a)*r*.75,y+.03,z+Math.sin(a)*r*.75],[x+Math.cos(a)*r,y+h,z+Math.sin(a)*r],.017,'basket');}for(let k=0;k<9;k++)ring(x,y+.06+k*(h-.06)/8,z,r*(.76+.24*k/8),.019,'basket');for(const s of [-1,1]){const pts=[];for(let k=0;k<=10;k++){const a=k*Math.PI/10;pts.push(new THREE.Vector3(x+s*r*.86,y+h+Math.sin(a)*.16,z+Math.cos(a)*r*.36));}const mesh=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),12,.021,5,false),mats.basket);g.add(mesh);}}
 basket(7.62,-17.86,.36,.39);basket(8.46,-18.03,.3,.46);
 for(let k=0;k<6;k++)add(sphere,k%2?'leaf':'newleaf',7.62+Math.cos(k)*.18,ground(7.62,-17.86)+.33,-17.86+Math.sin(k)*.16,.115,.115,.12);
 // Water dipper, low work stool and a garden hoe.
 const wx=12.05,wz=-11.72,wy=ground(wx,wz);
 pot(wx,wz,.3,.47,'blue');beam([wx-.05,wy+.44,wz],[wx-.28,wy+.76,wz+.1],.027,'bamboo');
 for(const dx of [-.28,.28])for(const dz of [-.18,.18])box(8.8+dx,ground(8.8+dx,-17.22+dz)+.2,-17.22+dz,.075,.4,.075,'wood');box(8.8,ground(8.8,-17.22)+.43,-17.22,.75,.1,.52,'wood');
 beam([12.48,ground(12.48,-10.99),-10.99],[12.54,ground(12.48,-10.99)+1.15,-10.81],.025,'wood');box(12.48,ground(12.48,-10.99)+.025,-10.99,.22,.045,.12,'metal');
 // Road interface guards the garden's placement against future shared layout changes.
 g.userData={house:lot.id,sharedRoads:roads.map(r=>r.id),intentionalOpenGround:'stepping-stone garden access and front household working court'};
 for(const b of batches.values()){const mesh=new THREE.InstancedMesh(b.geo,mats[b.m],b.items.length);b.items.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);}
 return g;
}
