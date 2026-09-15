import { heightAt, roadNetwork, layout } from './root.js';

export function build(THREE, ctx) {
 const g=new THREE.Group();g.name='east-laundry washing court and kitchen garden';
 const lot=layout().town.lots.find(l=>l.x===-7&&l.z===-12);if(!lot)return g;
 const roads=roadNetwork();
 const C={wood:'#806247',dark:'#534432',bamboo:'#a28a5c',straw:'#b49b69',rim:'#927747',soil:'#665540',furrow:'#4e4437',leaf:'#486a3d',leaf2:'#68834b',vein:'#8c9e63',clay:'#a17659',glaze:'#647e77',inside:'#4b4537',water:'#729594',cream:'#d5cbb3',blue:'#526e81',rust:'#aa7967',stripe:'#aab7b7',stone:'#868574'};
 const mats={};for(const [k,color]of Object.entries(C))mats[k]=new THREE.MeshStandardMaterial({color,roughness:k==='water'?.3:.9,side:THREE.DoubleSide});
 const boxG=new THREE.BoxGeometry(1,1,1),ballG=new THREE.SphereGeometry(1,10,7),cylG=new THREE.CylinderGeometry(1,1,1,10),batches=new Map(),dummy=new THREE.Object3D();
 const ground=(x,z)=>heightAt(x,z)+.065;
 function inst(geo,m,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){const key=geo.uuid+m;if(!batches.has(key))batches.set(key,{geo,m,items:[]});dummy.position.set(x,y,z);dummy.rotation.set(rx,ry,rz);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();batches.get(key).items.push(dummy.matrix.clone());}
 function box(x,y,z,w,h,d,m='wood',rx=0,ry=0,rz=0){inst(boxG,m,x,y,z,w,h,d,rx,ry,rz);}
 function beam(a,b,r,m='wood'){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av),key=cylG.uuid+m;if(!batches.has(key))batches.set(key,{geo:cylG,m,items:[]});dummy.position.copy(av.add(bv).multiplyScalar(.5));dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());dummy.scale.set(r,v.length(),r);dummy.updateMatrix();batches.get(key).items.push(dummy.matrix.clone());}
 function mesh(geo,m,x=0,y=0,z=0){const o=new THREE.Mesh(geo,mats[m]);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
 function ring(x,y,z,r,t,m){const o=mesh(new THREE.TorusGeometry(r,t,5,28),m,x,y,z);o.rotation.x=Math.PI/2;return o;}
 function curve(points,r,m){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),Math.max(12,points.length*4),r,5,false),m);}
 function post(x,z,h=1.02){const y=ground(x,z);box(x,y+h/2-.04,z,.14,h+.08,.14);box(x,y+h+.02,z,.19,.06,.19,'dark');}
 function fence(a,b){const len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(len/1.55),p=[];for(let i=0;i<=n;i++){const t=i/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;post(x,z);p.push([x,ground(x,z),z]);}for(let i=1;i<p.length;i++){for(const h of [.35,.84])beam([p[i-1][0],p[i-1][1]+h,p[i-1][2]],[p[i][0],p[i][1]+h,p[i][2]],.043,'bamboo');for(let k=1;k<6;k++){const t=k/6,x=p[i-1][0]+(p[i][0]-p[i-1][0])*t,z=p[i-1][2]+(p[i][2]-p[i-1][2])*t;beam([x,ground(x,z)+.12,z],[x,ground(x,z)+.94,z],.023,'bamboo');}}}
 fence([-16.65,-18.98],[-16.65,-7.28]);fence([-16.65,-7.28],[-1.15,-7.28]);fence([-1.15,-7.28],[-1.15,-18.98]);
 fence([-16.65,-18.98],[-8.48,-18.98]);fence([-5.52,-18.98],[-1.15,-18.98]);
 // Open slatted gate folds inward, wholly outside the 2.4 m stair corridor.
 {const a=[-8.48,-18.96],b=[-8.9,-17.62],ay=ground(...a),by=ground(...b);for(const h of [.22,.83])beam([a[0],ay+h,a[1]],[b[0],by+h,b[1]],.05);beam([a[0],ay+.22,a[1]],[b[0],by+.83,b[1]],.035);for(let k=0;k<=7;k++){const t=k/7,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;beam([x,ground(x,z)+.18,z],[x,ground(x,z)+.92,z],.03,'bamboo');}for(const h of [.29,.75])ring(a[0],ay+h,a[1],.095,.018,'dark');}
 // Rope line stands clear of the west eave and has individually folded and pinned cloths.
 const lx=-15.35,zA=-17.9,zB=-12.25,yA=ground(lx,zA)+2.65,yB=ground(lx,zB)+2.65;
 for(const z of [zA,zB]){post(lx,z,2.65);beam([lx-.42,ground(lx,z)+2.52,z],[lx+.42,ground(lx,z)+2.52,z],.065,'bamboo');for(const dx of [-.13,.13])inst(ballG,'stone',lx+dx,ground(lx+dx,z)+.05,z,.19,.10,.19);}
 const lineY=z=>yA+(yB-yA)*(z-zA)/(zB-zA)-.16*Math.sin(Math.PI*(z-zA)/(zB-zA));
 curve(Array.from({length:17},(_,i)=>{const z=zA+(zB-zA)*i/16;return[lx,lineY(z),z];}),.018,'straw');
 function cloth(z,w,h,m,n){const p=[],idx=[],nx=12,ny=12;for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){const u=i/nx,v=j/ny,zz=z+(u-.5)*w,xx=lx+.08*Math.sin(u*Math.PI*4+n)*v+.13*v*v;p.push(xx,lineY(zz)-v*h+.045*Math.sin(u*7+n)*v,zz);if(i<nx&&j<ny){const a=j*(nx+1)+i;idx.push(a,a+1,a+nx+1,a+1,a+nx+2,a+nx+1);}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.computeVertexNormals();mesh(geo,m);for(const t of [-.4,.4]){const zz=z+t*w;box(lx,lineY(zz)+.025,zz,.05,.14,.035,'wood',0,.1);}curve(Array.from({length:13},(_,i)=>{const u=i/12,zz=z+(u-.5)*w;return[lx+.08*Math.sin(u*Math.PI*4+n)+.13,lineY(zz)-h+.045*Math.sin(u*7+n),zz];}),.012,m==='blue'?'stripe':'cream');if(m==='blue')for(const v of [.78,.86])curve(Array.from({length:13},(_,i)=>{const u=i/12,zz=z+(u-.5)*w;return[lx+.08*Math.sin(u*Math.PI*4+n)*v+.13*v*v+.006,lineY(zz)-v*h+.045*Math.sin(u*7+n)*v,zz];}),.017,'stripe');}
 cloth(-17.2,.94,1.13,'cream',1);cloth(-15.98,.91,1.36,'blue',2);cloth(-14.78,.82,.94,'rust',3);cloth(-13.55,1.07,1.26,'cream',4);
 // Hollow vessels use a closed lathe profile with visible inner wall and bottom.
 function vessel(x,z,r,h,m,baseY=ground(x,z)){const pts=[[0,0],[r*.7,0],[r*.97,h*.12],[r,h*.8],[r*.88,h],[r*.76,h],[r*.85,h*.78],[r*.76,.09],[0,.09]].map(p=>new THREE.Vector2(...p));mesh(new THREE.LatheGeometry(pts,24),m,x,baseY,z);ring(x,baseY+h,z,r*.82,.032,m);return baseY;}
 function basket(x,z,r=.4,h=.43){const y=vessel(x,z,r,h,'inside');for(let k=0;k<12;k++)ring(x,y+.065+k*(h-.06)/12,z,r*(.91+.045*Math.sin(k/12*Math.PI)),.019,k%2?'straw':'rim');for(let k=0;k<28;k++){const a=k/28*Math.PI*2;beam([x+Math.cos(a)*r*.89,y+.04,z+Math.sin(a)*r*.89],[x+Math.cos(a)*r*.97,y+h,z+Math.sin(a)*r*.97],.014,'straw');}ring(x,y+h,z,r*.97,.035,'straw');return y+h;}
 const tx=-13.28,tz=-17.25,ty=vessel(tx,tz,.63,.59,'wood');
 for(let k=0;k<20;k++){const a=k/20*Math.PI*2;beam([tx+Math.cos(a)*.59,ty+.08,tz+Math.sin(a)*.59],[tx+Math.cos(a)*.61,ty+.5,tz+Math.sin(a)*.61],.014,'dark');}for(const h of [.13,.45])ring(tx,ty+h,tz,.625,.027,'dark');inst(cylG,'water',tx,ty+.34,tz,.51,.012,.51);
 const board=new THREE.Group();board.position.set(tx+.14,ty+.39,tz+.05);board.rotation.x=-.42;g.add(board);function boardBox(x,y,z,w,h,d,m){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mats[m]);o.position.set(x,y,z);o.castShadow=true;board.add(o);}boardBox(0,0,0,.47,.98,.065,'wood');for(const x of [-.25,.25])boardBox(x,0,-.005,.055,1.05,.10,'bamboo');for(let k=0;k<13;k++)boardBox(0,-.38+k*.056,-.045,.42,.025,.04,'bamboo');
 {const x=-12.55,z=-18.33,y=vessel(x,z,.28,.4,'wood');for(const h of [.09,.31])ring(x,y+h,z,.275,.02,'dark');curve([[x-.26,y+.35,z],[x-.2,y+.69,z],[x+.2,y+.69,z],[x+.26,y+.35,z]],.022,'dark');}
 const by=basket(-13.02,-15.45,.45,.47);for(let i=0;i<3;i++)box(-13.02,by-.09+i*.055,-15.45,.57,.065,.40,i%2?'blue':'cream',0,.12*i);
 basket(-14.22,-12.05,.32,.32);
 // Low four-legged domestic work bench beside facade, outside door approach.
 {const x=-10.31,z=-17.63,top=Math.max(...[-.72,.72].flatMap(dx=>[-.32,.32].map(dz=>ground(x+dx,z+dz))))+.64;for(const dx of [-.72,.72])for(const dz of [-.31,.31]){const y=ground(x+dx,z+dz);box(x+dx,(y+top)/2,z+dz,.11,top-y,.11);}for(let k=0;k<4;k++)box(x,top,z-.33+k*.22,1.72,.085,.20,'wood');for(const dz of [-.31,.31])box(x,top-.19,z+dz,1.63,.12,.08,'dark');vessel(x+.43,z,.18,.27,'clay',top+.045);vessel(x-.13,z+.03,.16,.16,'glaze',top+.045);box(x-.51,top+.09,z,.37,.085,.36,'cream');}
 // Soil only overlays the actual vegetable bed; all surrounding parent yard stays exposed.
 const bed=[-16.18,-10.85,-12.45,-7.85],p=[],ix=[],nx=18,nz=16;
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const x=bed[0]+(bed[2]-bed[0])*i/nx,z=bed[1]+(bed[3]-bed[1])*j/nz;p.push(x,ground(x,z)+.025+.055*Math.cos((x-bed[0])/(bed[2]-bed[0])*Math.PI*8),z);if(i<nx&&j<nz){const a=j*(nx+1)+i;ix.push(a,a+nx+1,a+1,a+1,a+nx+1,a+nx+2);}}
 const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(p,3));sg.setIndex(ix);sg.computeVertexNormals();mesh(sg,'soil');
 for(const [a,b]of [[[bed[0],bed[1]],[bed[2],bed[1]]],[[bed[0],bed[3]],[bed[2],bed[3]]],[[bed[0],bed[1]],[bed[0],bed[3]]],[[bed[2],bed[1]],[bed[2],bed[3]]]])beam([a[0],ground(...a)+.06,a[1]],[b[0],ground(...b)+.06,b[1]],.06,'wood');
 for(let i=0;i<4;i++)for(let j=0;j<5;j++){const x=-15.73+i*.9,z=-10.49+j*.55,y=ground(x,z)+.08;for(let k=0;k<6;k++){const a=k*Math.PI/3+i*.4,xx=x+Math.cos(a)*.12,zz=z+Math.sin(a)*.12;inst(ballG,k%2?'leaf':'leaf2',xx,y+.14,zz,.12,.065,.24,.42,a,0);beam([x,y+.13,z],[x+Math.sin(a)*.25,y+.19,z+Math.cos(a)*.25],.009,'vein');}inst(ballG,'leaf2',x,y+.19,z,.12,.14,.12);}
 // Narrow recessed-looking soil channels separate the cultivated ridges.
 for(let row=0;row<3;row++){
  const x=-15.28+row*.9,vs=[],ids=[];
  for(let j=0;j<=16;j++){const z=-10.7+j*2.7/16;for(const dx of [-.058,.058])vs.push(x+dx,ground(x+dx,z)+.105,z);if(j<16){const a=j*2;ids.push(a,a+2,a+1,a+1,a+2,a+3);}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));geo.setIndex(ids);geo.computeVertexNormals();mesh(geo,'furrow');
 }
 // A hoe rests in the tending aisle and small pots inhabit the narrow eastern strip.
 beam([-12.04,ground(-12.04,-10.4),-10.4],[-12.18,ground(-12.04,-10.4)+1.36,-10.07],.025,'bamboo');box(-12.04,ground(-12.04,-10.4)+.04,-10.4,.28,.07,.16,'dark');
 vessel(-2.02,-17.94,.30,.55,'clay');vessel(-1.94,-16.87,.22,.36,'glaze');
 const herbY=vessel(-2.01,-9.07,.29,.36,'clay');for(let k=0;k<7;k++){const a=k*2.4;inst(ballG,'leaf',-2.01+Math.cos(a)*.12,herbY+.47,-9.07+Math.sin(a)*.12,.09,.18,.09,0,a,.4);}
 // An irregular sequence of small stepping pads links wash and tending areas.
 for(let i=0;i<6;i++){const x=-12.83+(i%2)*.16,z=-14.65+i*.57;inst(ballG,'stone',x,ground(x,z)+.018,z,.28,.065,.21,0,i*.7,0);}
 for(const {geo,m,items}of batches.values()){const o=new THREE.InstancedMesh(geo,mats[m],items.length);items.forEach((a,i)=>o.setMatrixAt(i,a));o.castShadow=true;o.receiveShadow=true;g.add(o);}
 return g;
}
