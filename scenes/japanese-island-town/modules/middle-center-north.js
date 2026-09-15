import { heightAt, roadNetwork, layout } from './root.js';

export function build(THREE, ctx) {
 const g=new THREE.Group();g.name='Northern central laundry garden and household goods shop';
 const lots=layout().town.lots.filter(l=>(l.x===-43||l.x===-31)&&l.z===-12);
 if(lots.length!==2||!roadNetwork().length)throw new Error('Missing northern central lots or roads');
 const colors={wood:'#806044',edge:'#533d2e',light:'#b59a69',wicker:'#b29a68',weave:'#82653f',bamboo:'#92966a',rope:'#d1b88a',iron:'#444c49',clay:'#a56d50',glaze:'#566f67',soil:'#61513b',soil2:'#786049',green:'#476a3b',leaf:'#698348',pink:'#cf9daa',pink2:'#e3b3bc',pink3:'#b98096',bark:'#66503f',water:'#6c9390',stone:'#929687',white:'#c9c4ad',blue:'#647d89',red:'#a37665'};
 const mats={};for(const [k,v] of Object.entries(colors))mats[k]=new THREE.MeshStandardMaterial({color:v,roughness:k==='water'?.36:.92,side:THREE.DoubleSide});
 const boxGeo=new THREE.BoxGeometry(1,1,1),cylGeo=new THREE.CylinderGeometry(1,1,1,10),ballGeo=new THREE.IcosahedronGeometry(1,1),batches=new Map(),dummy=new THREE.Object3D();
 const geomCache=new Map();
 function instance(geo,m,p,s=[1,1,1],rot=[0,0,0]){const key=geo.uuid+m;if(!batches.has(key))batches.set(key,{geo,m,items:[]});dummy.position.set(...p);dummy.rotation.set(...rot);dummy.scale.set(...s);dummy.updateMatrix();batches.get(key).items.push(dummy.matrix.clone());}
 function box(x,y,z,w,h,d,m='wood',rot=[0,0,0]){instance(boxGeo,m,[x,y,z],[w,h,d],rot);}
 function ball(x,y,z,rx,ry,rz,m){instance(ballGeo,m,[x,y,z],[rx,ry,rz]);}
 function rod(a,b,r,m='wood'){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.clone().sub(av);const key=cylGeo.uuid+m;if(!batches.has(key))batches.set(key,{geo:cylGeo,m,items:[]});dummy.position.copy(av.add(bv).multiplyScalar(.5));dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());dummy.scale.set(r,d.length(),r);dummy.updateMatrix();batches.get(key).items.push(dummy.matrix.clone());}
 const ground=(x,z)=>heightAt(x,z)+.065;
 function ring(x,y,z,r,t,m,vertical=false){const key='ring'+r+','+t;if(!geomCache.has(key))geomCache.set(key,new THREE.TorusGeometry(r,t,5,24));instance(geomCache.get(key),m,[x,y,z],[1,1,1],vertical?[0,0,0]:[Math.PI/2,0,0]);}
 function vessel(x,y,z,r,h,m='clay',kind='pot'){
  const key=kind+r+','+h;
  if(!geomCache.has(key)){const points=(kind==='bowl'?[[.01,0],[r*.5,0],[r*.83,h*.35],[r,h],[r-.045,h],[r*.71,h*.34],[r*.4,.07],[.01,.07]]:[[.01,0],[r*.65,0],[r,h*.45],[r*.82,h*.85],[r*.72,h],[r*.62,h],[r*.68,h*.82],[r*.83,h*.45],[r*.53,.07],[.01,.07]]).map(v=>new THREE.Vector2(...v));geomCache.set(key,new THREE.LatheGeometry(points,20));}
  instance(geomCache.get(key),m,[x,y,z]);ring(x,y+h,z,r*(kind==='bowl'?1:.68),.028,m);
 }
 function basket(x,y,z,r,h){
  // Open woven wall: separate horizontal courses and outward-sloping stakes, visible interior bottom.
  instance(cylGeo,'weave',[x,y+.035,z],[r*.70,.07,r*.70]);
  const courses=Math.ceil(h/.055);for(let j=0;j<=courses;j++){const t=j/courses;ring(x,y+.05+t*h,z,r*(.71+.29*t),.019,j%3?'wicker':'weave');}
  for(let i=0;i<24;i++){const a=i*Math.PI/12;rod([x+Math.cos(a)*r*.71,y+.04,z+Math.sin(a)*r*.71],[x+Math.cos(a)*r,y+h+.05,z+Math.sin(a)*r],.017,'light');}
  ring(x,y+h+.055,z,r,.036,'wicker');
  for(let k=-3;k<=3;k++){const d=k*r*.16,L=Math.sqrt(Math.max(0,(r*.67)**2-d*d));rod([x-L,y+.078,z+d],[x+L,y+.078,z+d],.016,'wicker');rod([x+d,y+.084,z-L],[x+d,y+.084,z+L],.014,'light');}
 }
 function bucket(x,y,z,r=.3,h=.48){
  instance(cylGeo,'edge',[x,y+.035,z],[r*.8,.07,r*.8]);
  for(let i=0;i<16;i++){const a=i*Math.PI/8;box(x+Math.sin(a)*r*.9,y+h/2,z+Math.cos(a)*r*.9,.105,h,.055,i%3?'wood':'light',[0,a,0]);}
  for(const t of [.12,.83])ring(x,y+h*t,z,r,.025,'iron');
  for(let i=0;i<14;i++){const a=i*Math.PI/14,b=(i+1)*Math.PI/14;rod([x+r*Math.cos(a),y+h+r*Math.sin(a),z],[x+r*Math.cos(b),y+h+r*Math.sin(b),z],.024,'iron');}
 }
 function table(x,z,w,d,h=.92){const top=Math.max(...[-w/2,w/2].flatMap(dx=>[-d/2,d/2].map(dz=>ground(x+dx,z+dz))))+h;
  for(const dx of [-w/2+.13,w/2-.13])for(const dz of [-d/2+.12,d/2-.12]){const yy=ground(x+dx,z+dz);box(x+dx,(yy+top)/2,z+dz,.12,top-yy,.12);}
  const n=Math.ceil(d/.16);for(let j=0;j<n;j++)box(x,top,z-d/2+(j+.5)*d/n,w,.11,d/n-.012,j%3?'wood':'light');
  for(const dz of [-d/2+.04,d/2-.04])box(x,top-.22,z+dz,w,.22,.08,'edge');
  for(const dx of [-w/2+.13,w/2-.13])box(x+dx,top-.55,z,.075,.075,d);
  return top+.06;
 }
 function fence(points,h,type='bamboo'){
  for(let k=1;k<points.length;k++){const a=points[k-1],b=points[k],len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(len/1.15);let previous=null;
   for(let i=0;i<=n;i++){const x=a[0]+(b[0]-a[0])*i/n,z=a[1]+(b[1]-a[1])*i/n,y=ground(x,z);rod([x,y-.08,z],[x,y+h+.08,z],.063,type==='bamboo'?'bamboo':'edge');
    if(previous)for(const t of [.27,.77])rod([previous.x,previous.y+h*t,previous.z],[x,y+h*t,z],.035,type==='bamboo'?'bamboo':'wood');
    if(previous&&type==='bamboo')for(let q=1;q<4;q++){const xx=previous.x+(x-previous.x)*q/4,zz=previous.z+(z-previous.z)*q/4,yy=ground(xx,zz);rod([xx,yy+.12,zz],[xx,yy+h,zz],.032,'bamboo');}
    ring(x,y+h*.77,z,.071,.014,'rope');previous={x,y,z};
   }
  }
 }
 function broom(x,z,angle=.12){const y=ground(x,z);rod([x,y+.19,z],[x+angle,y+1.75,z+.18],.024,'bamboo');for(let i=0;i<15;i++)rod([x-.23+i*.033,y+.08,z+.03*Math.sin(i)],[x,y+.60,z+.05],.012,i%2?'light':'wicker');for(const h of [.39,.48])box(x,y+h,z+.06,.23,.025,.06,'rope');}
 function stone(x,z,s=.45){ball(x,ground(x,z)+.025,z,s,.075,s*.7,'stone');}
 // Domestic bamboo enclosure: a 1.45 m west gate and a clear front approach.
 fence([[-52.45,-18.65],[-52.45,-17.3]],1.02);
 fence([[-52.45,-15.85],[-52.45,-7.5],[-48.65,-7.5]],.9);
 fence([[-52.45,-18.65],[-49,-18.65]],.9);
 fence([[-47.6,-18.7],[-44.45,-18.7]],.78);
 fence([[-41.55,-18.7],[-38.1,-18.7]],.78);
 // Open gate leaf held back inside the west yard, with hinge and diagonal brace.
 fence([[-52.40,-15.85],[-51.45,-15.40]],.83);
 rod([-52.4,ground(-52.4,-15.85)+.16,-15.85],[-51.45,ground(-51.45,-15.4)+.75,-15.4],.03,'bamboo');
 // Tiny terraced kitchen bed, bounded soil only; visibly separate rows and varied crops.
 for(let row=0;row<3;row++){
  const x=-51.9+row*.67,z=-17.05,zz0=-18.0,zz1=-16.05;
  for(let j=0;j<12;j++){const zz=zz0+(j+.5)*(zz1-zz0)/12;box(x,ground(x,zz)+.09,zz,.51,.14,(zz1-zz0)/12,'soil');for(let k=0;k<4;k++)ball(x-.2+k*.125,ground(x,zz)+.18,zz,.055,.04,.068,(k+j)%2?'soil':'soil2');}
  for(let j=0;j<5;j++){const zz=-17.78+j*.36,y=ground(x,zz)+.20;if(row===1){ball(x,y+.10,zz,.08,.15,.08,'white');for(let k=0;k<5;k++){const a=k*1.26;rod([x,y+.1,zz],[x+Math.sin(a)*.13,y+.39,zz+Math.cos(a)*.13],.021,'green');}}else{for(let k=0;k<6;k++){const a=k*Math.PI/3;ball(x+Math.sin(a)*.08,y+.11,zz+Math.cos(a)*.08,.13,.065,.1,k%2?'green':'leaf');}ball(x,y+.16,zz,.10,.12,.1,'leaf');}}
  for(const xx of [x-.3,x+.3])rod([xx,ground(xx,zz0)+.18,zz0],[xx,ground(xx,zz1)+.18,zz1],.04,'wood');
 }
 for(let j=0;j<6;j++)stone(-49.22,-17.6+j*1.15,.29);
 // Laundry poles, cross-line, separately rippled cloth panels and pins.
 const lx=-50.35,zA=-14.55,zB=-11.1,ly=Math.max(ground(lx,zA),ground(lx,zB))+2.25;
 for(const z of [zA,zB]){rod([lx,ground(lx,z)-.10,z],[lx,ly+.14,z],.065,'bamboo');rod([lx-.35,ly,z],[lx+.35,ly,z],.035,'bamboo');}
 rod([lx,ly,zA],[lx,ly,zB],.024,'bamboo');
 for(let i=0;i<4;i++){const z=zA+.17+i*.78,w=.60,h=[1.1,.87,1.25,.73][i],p=[],idx=[],nx=5,ny=6;
  for(let j=0;j<=ny;j++)for(let k=0;k<=nx;k++){const u=k/nx,v=j/ny;p.push(lx+Math.sin(u*10+i)*.045+v*.13,ly-.045-v*h,z+u*w);if(k<nx&&j<ny){const a=j*(nx+1)+k;idx.push(a,a+1,a+nx+1,a+1,a+nx+2,a+nx+1);}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.computeVertexNormals();const cloth=new THREE.Mesh(geo,mats[['white','blue','white','red'][i]]);cloth.castShadow=true;g.add(cloth);
  for(const zz of [z+.08,z+w-.08])box(lx,ly+.012,zz,.08,.13,.037,'wood');
  rod([lx+.12,ly-.045-h,z],[lx+.12,ly-.045-h,z+w],.012,i%2?'white':'blue');
 }
 const tubx=-51.5,tubz=-13.7,tuby=ground(tubx,tubz);bucket(tubx,tuby,tubz,.47,.43);instance(cylGeo,'water',[tubx,tuby+.29,tubz],[.40,.025,.40]);
 box(tubx+.12,tuby+.49,tubz+.12,.39,.06,.75,'light',[.55,0,0]);for(let i=0;i<8;i++)box(tubx+.12,tuby+.35+i*.038,tubz-.16+i*.06,.34,.025,.035,'wood');
 basket(-49.27,ground(-49.27,-13.55),-13.55,.41,.31);bucket(-51.48,ground(-51.48,-12.4),-12.4,.23,.35);
 // Compact cherry crown safely between lane and western roof edge.
 const tx=-50.65,tz=-9.15,ty=ground(tx,tz);rod([tx,ty,tz],[tx+.09,ty+1.8,tz],.105,'bark');
 for(let i=0;i<7;i++){const a=i*2.4,bx=tx+Math.cos(a)*.68,bz=tz+Math.sin(a)*.63,by=ty+2.05+(i%3)*.23;rod([tx+.04,ty+1.05,tz],[bx,by,bz],.045,'bark');ball(bx,by+.2,bz,.57,.44,.54,['pink','pink2','pink3'][i%3]);for(let j=0;j<7;j++){const aa=j*2.39;ball(bx+Math.cos(aa)*.43,by+.27+Math.sin(j*4)*.21,bz+Math.sin(aa)*.4,.13,.1,.13,j%2?'pink2':'pink');}}
 for(let i=0;i<20;i++){const x=tx+Math.sin(i*3.7)*.9,z=tz+Math.cos(i*2.9)*.83;ball(x,ground(x,z)+.018,z,.025,.012,.035,'pink2');}
 // Domestic facade bench and planted pots, with clear central stairs.
 const bench=table(-46.1,-17.15,2.0,.57,.48);basket(-46.58,bench,-17.14,.27,.21);box(-45.64,bench+.075,-17.15,.52,.13,.36,'blue');
 for(const [x,z,r,h] of [[-40,-17.35,.34,.51],[-39.1,-17.25,.26,.35],[-49.4,-10.35,.28,.46]]){const y=ground(x,z);vessel(x,y,z,r,h,'clay');for(let i=0;i<5;i++){const a=i*1.25;rod([x,y+h*.85,z],[x+Math.cos(a)*.21,y+h+.35,z+Math.sin(a)*.19],.016,'green');ball(x+Math.cos(a)*.18,y+h+.25,z+Math.sin(a)*.18,.14,.065,.09,'leaf');}}
 // Household-goods shop counters flank the 2.4 m central stair corridor.
 const left=table(-34.15,-17.4,2.55,1.08),right=table(-27.9,-17.4,2.55,1.05);
 basket(-34.85,left,-17.4,.38,.38);basket(-34.85,left+.18,-17.4,.31,.32);basket(-34.85,left+.37,-17.4,.245,.24);
 basket(-33.85,left,-17.4,.38,.25);basket(-33.0,left,-17.4,.24,.40);
 for(let i=0;i<3;i++){vessel(-28.6+i*.62,right,-17.52,.25,.17,'wood','bowl');vessel(-28.6+i*.62,right+.105,-17.52,.20,.14,'light','bowl');}
 bucket(-27.22,right,-17.38,.25,.4);
 bucket(-35.3,ground(-35.3,-18.5),-18.5,.34,.55);basket(-33.7,ground(-33.7,-18.6),-18.6,.32,.28);
 // Shop boundary has horizontal timber rails, side gate and low front ends.
 fence([[-21.55,-18.7],[-21.55,-17.65]],1.05,'timber');
 fence([[-21.55,-16.1],[-21.55,-7.5],[-25.3,-7.5]],.9,'timber');
 fence([[-25.1,-18.8],[-21.55,-18.8]],.73,'timber');
 fence([[-35.95,-18.8],[-35.95,-17.7]],.73,'timber');
 fence([[-21.6,-16.1],[-22.5,-15.6]],.88,'timber');
 // Fitted compact storage rack: feet, floor, back, side boards, three shelves and pitched solid cap.
 const sx=-23.55,sz=-11.15,sw=2.5,sd=1.28,base=Math.max(...[-1.25,1.25].flatMap(dx=>[-.64,.64].map(dz=>ground(sx+dx,sz+dz))))+.16;
 for(const dx of [-sw/2+.08,sw/2-.08])for(const dz of [-sd/2+.08,sd/2-.08]){const y=ground(sx+dx,sz+dz);box(sx+dx,(y+base+2.1)/2,sz+dz,.12,base+2.1-y,.12,'edge');}
 for(const h of [0,.72,1.45])for(let i=0;i<7;i++)box(sx,base+h,sz-sd/2+(i+.5)*sd/7,sw,.085,sd/7-.012,'wood');
 for(let i=0;i<12;i++)box(sx-sw/2+(i+.5)*sw/12,base+1.02,sz+sd/2,sw/12-.018,2.07,.075,i%3?'wood':'light');
 for(const dx of [-sw/2,sw/2])for(let i=0;i<6;i++)box(sx+dx,base+1.02,sz-sd/2+(i+.5)*sd/6,.075,2.07,sd/6-.014,'wood');
 for(let i=0;i<13;i++)box(sx-sw/2-.12+(i+.5)*(sw+.24)/13,base+2.16,sz,(sw+.24)/13-.008,.10,sd+.35,'edge',[.13,0,0]);
 for(let i=0;i<3;i++){bucket(sx-.78+i*.76,base+.045,sz-.04,.26,.46);basket(sx-.76+i*.76,base+.765,sz-.03,.28,.29);vessel(sx-.75+i*.75,base+1.495,sz,.25,.16,'light','bowl');vessel(sx-.75+i*.75,base+1.58,sz,.2,.14,'wood','bowl');}
 const work=table(-23.72,-14.2,2.25,.91,.76);basket(-24.37,work,-14.2,.32,.30);
 for(let i=0;i<8;i++)rod([-23.7,work+.022+i*.012,-14.40+i*.055],[-22.83,work+.035+i*.012,-14.37+i*.055],.014,i%2?'bamboo':'light');
 vessel(-23.04,work,-14.0,.13,.33,'wood');for(let i=0;i<7;i++){const x=-23.12+(i%3)*.07,z=-14.06+Math.floor(i/3)*.06;rod([x,work+.1,z],[x+(i-3)*.014,work+.8+(i%2)*.13,z],.016,'bamboo');ball(x+(i-3)*.014,work+.82+(i%2)*.13,z,.045,.08,.02,'light');}
 broom(-22.18,-12.9,-.11);broom(-22.47,-12.8,.1);bucket(-24.63,ground(-24.63,-16.15),-16.15,.36,.55);
 basket(-22.70,ground(-22.70,-8.55),-8.55,.43,.24);basket(-23.8,ground(-23.8,-8.6),-8.6,.35,.3);
 for(let i=0;i<5;i++)stone(-23.3,-18.0+i*.65,.29);
 // Only low, removable items in the narrow central passage and rear edges.
 vessel(-37.03,ground(-37.03,-17.8),-17.8,.23,.33,'glaze');basket(-37.0,ground(-37,-9),-9,.22,.22);
 for(const b of batches.values()){const mesh=new THREE.InstancedMesh(b.geo,mats[b.m],b.items.length);b.items.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);}
 return g;
}
