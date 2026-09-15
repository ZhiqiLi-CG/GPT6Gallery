import { heightAt, roadNetwork, layout } from './root.js';

export function build(THREE, ctx) {
  const group=new THREE.Group();group.name='South center kitchen garden and household';
  const lot=layout().town.lots[3], ox=lot.x+31, oz=lot.z+64;
  const roads=roadNetwork(), mats={};
  for(const [k,v] of Object.entries({wood:'#8b7150',cut:'#b59a6a',dark:'#50402e',iron:'#464b47',soil:'#514131',clod:'#65503a',leaf:'#557648',light:'#7f9959',deep:'#355b39',vein:'#a1ac70',root:'#ddd0aa',bamboo:'#a59b61',twine:'#b9a57a',terra:'#967059',blue:'#586f70',water:'#6c8881',compost:'#746647'}))mats[k]=new THREE.MeshStandardMaterial({color:v,roughness:k==='blue'?.46:.92});
  const box=new THREE.BoxGeometry(1,1,1),cyl=new THREE.CylinderGeometry(1,1,1,12),ball=new THREE.SphereGeometry(1,10,7),torus=new THREE.TorusGeometry(1,.055,6,32),leaf=new THREE.SphereGeometry(1,8,6), batches=new Map(),dummy=new THREE.Object3D();
  function save(geo,mat){const key=geo.uuid+mat;if(!batches.has(key))batches.set(key,{geo,mat:mats[mat],items:[]});batches.get(key).items.push(dummy.matrix.clone());}
  function put(geo,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){dummy.position.set(x+ox,y,z+oz);dummy.rotation.set(rx,ry,rz);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();save(geo,mat);}
  function beam(a,b,r,mat='wood'){const av=new THREE.Vector3(a[0]+ox,a[1],a[2]+oz),bv=new THREE.Vector3(b[0]+ox,b[1],b[2]+oz),dv=bv.clone().sub(av);dummy.position.copy(av.add(bv).multiplyScalar(.5));dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dv.clone().normalize());dummy.scale.set(r,dv.length(),r);dummy.updateMatrix();save(cyl,mat);}
  const ground=(x,z)=>heightAt(x+ox,z+oz)+.095;
  function clear(x,z,r){return roads.every(road=>road.points.slice(1).every((b,i)=>{const a=road.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x+ox-a[0])*dx+(z+oz-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x+ox-a[0]-t*dx,z+oz-a[1]-t*dz)>=road.width/2+r+.3;}));}
  function ring(x,y,z,r,mat='twine',vertical=false){put(torus,mat,x,y,z,r,r,r,vertical?0:Math.PI/2);}
  function leafSpray(x,y,z,s=.3,n=7){for(let i=0;i<n;i++){const a=i*Math.PI*2/n;put(leaf,i%2?'leaf':'light',x+Math.sin(a)*s*.5,y+s*.35,z+Math.cos(a)*s*.5,s*.29,s*.82,s*.12,.50*Math.cos(a),a,.55*Math.sin(a));beam([x,y,z],[x+Math.sin(a)*s*.62,y+s*.72,z+Math.cos(a)*s*.62],.009,'vein');}}
  function cabbage(x,z){const y=ground(x,z)+.24;put(ball,'light',x,y+.18,z,.22,.20,.22);for(let j=0;j<8;j++){const a=j*.785;put(leaf,j%2?'leaf':'deep',x+Math.cos(a)*.19,y+.12,z+Math.sin(a)*.19,.21,.065,.29,Math.sin(a)*.4,-a,Math.cos(a)*.4);beam([x,y+.2,z],[x+Math.cos(a)*.3,y+.12,z+Math.sin(a)*.3],.012,'vein');}for(let j=0;j<4;j++)put(leaf,'light',x,y+.27+j*.007,z,.19,.05,.14,.4,j*1.5,.3);}
  function bed(x,z,w,d,type){
    if(!clear(x,z,Math.hypot(w,d)/2))return;
    for(let i=0;i<Math.ceil(w/.32);i++)for(let j=0;j<Math.ceil(d/.32);j++){const xx=x-w/2+(i+.5)*w/Math.ceil(w/.32),zz=z-d/2+(j+.5)*d/Math.ceil(d/.32);put(box,'soil',xx,ground(xx,zz)+.105,zz,w/Math.ceil(w/.32)+.01,.21,d/Math.ceil(d/.32)+.01);put(ball,'clod',xx+.06*Math.sin(i+j),ground(xx,zz)+.215,zz,.065,.025,.046);}
    for(const side of [-1,1]){for(let i=0;i<Math.ceil(d/.6);i++){const zz=z-d/2+(i+.5)*d/Math.ceil(d/.6),xx=x+side*w/2;put(box,'wood',xx,ground(xx,zz)+.16,zz,.10,.33,d/Math.ceil(d/.6)+.02);}for(let i=0;i<Math.ceil(w/.6);i++){const xx=x-w/2+(i+.5)*w/Math.ceil(w/.6),zz=z+side*d/2;put(box,'wood',xx,ground(xx,zz)+.16,zz,w/Math.ceil(w/.6)+.02,.33,.10);}}
    for(const sx of [-1,1])for(const sz of [-1,1]){const xx=x+sx*w/2,zz=z+sz*d/2;put(box,'cut',xx,ground(xx,zz)+.20,zz,.13,.48,.13);put(ball,'iron',xx,ground(xx,zz)+.30,zz-sz*.071,.023,.023,.009);}
    for(let i=0;i<3;i++)for(let j=0;j<4;j++){const xx=x+(i-1)*.55,zz=z+(j-1.5)*.48;if(type==='cabbage')cabbage(xx,zz);else{const y=ground(xx,zz)+.21;if(type==='radish')put(ball,'root',xx,y+.065,zz,.08,.15,.08,0,0,.15);leafSpray(xx,y+.12,zz,type==='radish'?.27:.25,6);}}
  }
  bed(-34,-75,1.95,2.25,'cabbage');bed(-31.35,-75,1.85,2.25,'radish');bed(-34,-71.9,1.95,2.35,'bean');bed(-31.35,-71.9,1.85,2.35,'cabbage');
  // Open soil walkways between plots and the eastern gate route remain the parent ground.
  for(const x of [-34.6,-33.4]){const y=ground(x,-71.9);beam([x,y,-72.9],[x,y+2.15,-71.85],.042,'bamboo');beam([x,y,-70.9],[x,y+2.15,-71.85],.042,'bamboo');for(let k=0;k<4;k++){const zz=-72.7+k*.5;ring(x,ground(x,zz)+.15,zz,.065);}}
  const ty=Math.max(ground(-34.6,-71.9),ground(-33.4,-71.9))+2.15;beam([-34.85,ty,-71.85],[-33.15,ty,-71.85],.045,'bamboo');
  for(let i=0;i<5;i++){const x=-34.6+i*.3;beam([x,ground(x,-72.75)+.3,-72.75],[x,ty,-71.85],.009,'twine');for(let j=0;j<7;j++){const t=j/7,y=ground(x,-72.75)+.32+t*1.67,z=-72.75+t*.9;beam([x,y,z],[x+.05*Math.sin(j),y+.20,z+.11],.015,'deep');for(const side of [-1,1])put(leaf,j%2?'deep':'leaf',x+side*.09,y+.1,z,.14,.045,.09,0,side*.6,side*.3);if(j%2)put(ball,'leaf',x+.11,y,z,.025,.13,.025,0,0,.25);}}
  function basket(x,z,r=.4,h=.55,filled=false){if(!clear(x,z,r+.06))return;const y=ground(x,z);put(cyl,'dark',x,y+.025,z,r*.76,.05,r*.76);for(let k=0;k<10;k++)ring(x,y+.06+k*(h-.08)/10,z,r*(.78+.22*k/10),'wood');for(let k=0;k<22;k++){const a=k*6.283/22;beam([x+Math.cos(a)*r*.78,y+.02,z+Math.sin(a)*r*.78],[x+Math.cos(a)*r,y+h,z+Math.sin(a)*r],.018,'cut');}ring(x,y+h,z,r,'cut');ring(x,y+h-.04,z,r,'cut');if(filled){put(ball,'compost',x,y+h-.08,z,r*.88,.16,r*.88);for(let j=0;j<12;j++)put(leaf,j%2?'compost':'deep',x+Math.sin(j*2.4)*r*.6,y+h-.02,z+Math.cos(j*2.4)*r*.6,.14,.025,.06,0,j,0);}}
  basket(-27,-75.8,.51,.72,true);basket(-28.1,-75.7,.31,.39,false);
  function pot(x,z,r,h,mat='terra'){if(!clear(x,z,r+.05))return;const y=ground(x,z);const points=[[0,0],[r*.64,0],[r*.80,h*.18],[r,h*.80],[r*.94,h],[r*.80,h],[r*.82,h*.79],[r*.64,h*.18],[0,h*.12]].map(p=>new THREE.Vector2(...p));const geo=new THREE.LatheGeometry(points,20);put(geo,mat,x,y,z,1,1,1);ring(x,y+h,z,r*.9,mat);put(cyl,'soil',x,y+h*.78,z,r*.80,.05,r*.80);leafSpray(x,y+h*.8,z,r*.9,9);}
  pot(-33.9,-57.95,.43,.65,'blue');pot(-28.1,-57.95,.40,.52);pot(-27,-58.25,.25,.37,'blue');basket(-33.4,-59.25,.32,.43);
  // Small slatted storage chest fitted on four feet beside the front entrance.
  {const x=-34.6,z=-59.3,y=Math.max(...[-.42,.42].flatMap(a=>[-.32,.32].map(b=>ground(x+a,z+b))))+.16;for(const a of [-.43,.43])for(const b of [-.32,.32]){const gy=ground(x+a,z+b);put(box,'dark',x+a,(gy+y)/2,z+b,.10,y-gy+.04,.1);}for(let j=0;j<4;j++){for(const side of [-1,1])put(box,'wood',x,y+.07+j*.15,z+side*.36,1.04,.125,.07);for(const side of [-1,1])put(box,'wood',x+side*.49,y+.07+j*.15,z,.07,.125,.7);}for(let j=0;j<6;j++)put(box,j%2?'cut':'wood',x-.44+j*.176,y+.61,z,.16,.065,.8);for(const a of [-.35,.35])put(box,'iron',x+a,y+.65,z,.065,.025,.72);put(box,'iron',x,y+.46,z+.41,.12,.19,.035);}
  // Hoop-bound watering pail, hollow interior and arch handle.
  {const x=-29.75,z=-70.05,y=ground(x,z),r=.28,h=.40;for(let i=0;i<16;i++){const a=i*6.283/16;put(box,'wood',x+Math.cos(a)*r,y+h/2,z+Math.sin(a)*r,.095,h,.045,0,-a+Math.PI/2);}for(const yy of [.07,.32])ring(x,y+yy,z,r+.012,'iron');put(cyl,'water',x,y+.22,z,r*.88,.025,r*.88);for(let i=0;i<12;i++){const a=i*Math.PI/12,b=(i+1)*Math.PI/12;beam([x+Math.cos(a)*r,y+h+Math.sin(a)*r,z],[x+Math.cos(b)*r,y+h+Math.sin(b)*r,z],.018,'iron');}}
  // Two-wheeled handcart: open board bed, complete side rails, iron tires, hubs and spokes.
  {const x=-27.15,z=-72.0,y=Math.max(ground(x-.78,z),ground(x+.78,z))+.48;
    beam([x-.89,y,z],[x+.89,y,z],.075,'iron');
    for(const side of [-1,1]){const xx=x+side*.76;put(torus,'iron',xx,y,z,.48,.48,.48,0,Math.PI/2);put(torus,'wood',xx,y,z,.43,.43,.43,0,Math.PI/2);beam([xx-.09,y,z],[xx+.09,y,z],.105,'cut');for(let k=0;k<12;k++){const a=k*6.283/12;beam([xx,y,z],[xx,y+Math.sin(a)*.43,z+Math.cos(a)*.43],.023,'cut');}}
    for(let i=0;i<6;i++)put(box,i%2?'wood':'cut',x-.46+i*.184,y+.16,z,.17,.10,1.65);
    for(const side of [-1,1]){put(box,'dark',x+side*.42,y+.08,z,.11,.12,1.87);for(let j=0;j<3;j++)put(box,'wood',x+side*.55,y+.30+j*.17,z,.065,.14,1.75);for(const end of [-1,1]){put(box,'dark',x+side*.55,y+.50,z+end*.78,.09,.75,.09);beam([x+side*.42,y+.12,z-.7],[x+side*.48,ground(x+side*.48,z-2.15)+.13,z-2.15],.048,'wood');} }
    for(let j=0;j<3;j++)put(box,'wood',x,y+.30+j*.17,z+.85,1.1,.14,.07);
    for(const xx of [-.4,.4]){const gy=ground(x+xx,z-.76);put(box,'dark',x+xx,(gy+y+.08)/2,z-.76,.08,y+.08-gy,.08);}
    // Loose cut boards and a tied bundle of bamboo stakes inside the cart.
    for(let j=0;j<3;j++)put(box,'cut',x-.2+j*.18,y+.25+j*.026,z,.14,.055,1.15,0,.10);
    for(let j=0;j<5;j++)beam([x+.16+j*.045,y+.30,z-.62],[x+.16+j*.045,y+.30,z+.64],.018,'bamboo');
  }
  for(const b of batches.values()){const mesh=new THREE.InstancedMesh(b.geo,b.mat,b.items.length);b.items.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}
  return group;
}
