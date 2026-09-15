import { heightAt, roadNetwork, layout } from './root.js';

// A single cultivated household garden; all shared ground and house structure belongs to ancestors.
export function build(THREE,ctx){
 const g=new THREE.Group();g.name='West garden cherry household';
 const colors={wood:'#796044',dark:'#46382c',cut:'#ad8b60',bamboo:'#989062',joint:'#665c3d',rope:'#b09d78',stone:'#939488',stoneDark:'#626b60',moss:'#697653',leaf:'#536a42',leafLight:'#79834e',pink:'#dcacb8',pale:'#edc8cd',rose:'#c68f9f',clay:'#9a6048',glaze:'#687e77',soil:'#4c4334',iron:'#535d5b',water:'#567c7b',flower:'#e4d7ae'};
 const mats={};for(const [k,color]of Object.entries(colors))mats[k]=new THREE.MeshStandardMaterial({color,roughness:k==='glaze'?.5:.93});
 const geometries={box:new THREE.BoxGeometry(1,1,1),ball:new THREE.IcosahedronGeometry(1,1),cyl:new THREE.CylinderGeometry(1,1,1,10),cone:new THREE.CylinderGeometry(.4,1,1,10),torus:new THREE.TorusGeometry(1,.07,5,20)};
 const batches=new Map(),dummy=new THREE.Object3D();
 function put(type,m,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){const key=type+':'+m;if(!batches.has(key))batches.set(key,{geo:geometries[type],mat:mats[m],items:[]});dummy.position.set(x,y,z);dummy.rotation.set(rx,ry,rz);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();batches.get(key).items.push(dummy.matrix.clone());}
 function box(x,y,z,w,h,d,m='wood',ry=0){put('box',m,x,y,z,w,h,d,0,ry);}
 function ball(x,y,z,r,m,sx=1,sy=1,sz=1){put('ball',m,x,y,z,r*sx,r*sy,r*sz);}
 function beam(a,b,r,m='wood',r2=r){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av),key='cyl:'+m;if(!batches.has(key))batches.set(key,{geo:geometries.cyl,mat:mats[m],items:[]});dummy.position.copy(av.add(bv).multiplyScalar(.5));dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());dummy.scale.set(r,v.length(),r2);dummy.updateMatrix();batches.get(key).items.push(dummy.matrix.clone());}
 function ring(x,y,z,r,m='rope',vertical=false){put('torus',m,x,y,z,r,r,r,vertical?0:Math.PI/2);}
 const ground=(x,z)=>heightAt(x,z)+.10;
 // Read shared lot/road records and enforce placement eligibility for the household.
 const lot=layout().town.lots.find(l=>l.x===-78&&l.z===-12),roads=roadNetwork();if(!lot||!roads.length)return g;
 function plant(x,z,size=.35,flowers=false){const y=ground(x,z);for(let j=0;j<7;j++){let a=j*2.399;beam([x,y,z],[x+Math.cos(a)*size*.45,y+size*.85,z+Math.sin(a)*size*.45],.012,'leaf');put('ball',j%2?'leaf':'leafLight',x+Math.cos(a)*size*.55,y+size*.45,z+Math.sin(a)*size*.55,size*.16,size*.48,size*.11,.35, a,.25);if(flowers&&j%2===0){const xx=x+Math.cos(a)*size*.45,zz=z+Math.sin(a)*size*.45;for(let q=0;q<5;q++)ball(xx+Math.cos(q*1.257)*.045,y+size*.86,zz+Math.sin(q*1.257)*.045,.045,'flower',1,.5,1);}}}
 function pot(x,z,r=.3,h=.5,m='clay',planted=false,base=null){const y=base??ground(x,z);put('cone',m,x,y+h*.48,z,r,h,r,Math.PI);ring(x,y+h*.94,z,r,m);put('cyl','soil',x,y+h*.89,z,r*.87,.035,r*.87);ring(x,y+.07,z,r*.65,m);if(planted){for(let k=0;k<8;k++){let a=k*2.4;beam([x,y+h,z],[x+Math.cos(a)*r*.7,y+h+.46,z+Math.sin(a)*r*.7],.015,'leaf');put('ball',k%2?'leaf':'leafLight',x+Math.cos(a)*r*.78,y+h+.33,z+Math.sin(a)*r*.78,.095,.24,.055,.2,a,.2);}}}
 function basket(x,z,r=.38,h=.4,base=null){const y=base??ground(x,z);put('cyl','dark',x,y+.03,z,r*.8,.055,r*.8);for(let k=0;k<9;k++)ring(x,y+.035+k*h/9,z,r*(.8+.2*k/9),'rope');for(let k=0;k<20;k++){const a=k*Math.PI/10;beam([x+Math.cos(a)*r*.8,y+.035,z+Math.sin(a)*r*.8],[x+Math.cos(a)*r,y+h,z+Math.sin(a)*r],.012,'bamboo');}ring(x,y+h,z,r,'bamboo');}
 // Bent cherry trunk and successive real branch forks, small clustered blossoms rather than canopy balls.
 const tx=-88.5,tz=-10.25,ty=ground(tx,tz);
 beam([tx,ty-.1,tz],[tx-.18,ty+1.5,tz+.07],.19,'dark');beam([tx-.18,ty+1.5,tz+.07],[tx+.12,ty+2.85,tz-.14],.125,'wood');
 for(let k=0;k<6;k++){let a=k*1.047+.3;beam([tx,ty+.15,tz],[tx+Math.cos(a)*.58,ground(tx+Math.cos(a)*.58,tz+Math.sin(a)*.58),tz+Math.sin(a)*.58],.085,'dark');}
 for(let k=0;k<9;k++){
  const a=k*2.399,rad=1.05+(k%3)*.19,root=[tx+.05,ty+1.6+(k%3)*.38,tz],fork=[tx+Math.cos(a)*rad*.66,ty+2.9+(k%4)*.15,tz+Math.sin(a)*rad*.65];beam(root,fork,.075,'wood');
  for(let j=0;j<3;j++){let aa=a+(j-1)*.36;const end=[tx+Math.cos(aa)*rad,ty+3.4+(k%3)*.25+j*.14,tz+Math.sin(aa)*rad*.85];beam(fork,end,.033,'dark');for(let p=0;p<8;p++){let angle=p*2.4+k,rr=.12+.16*(p%3),xx=end[0]+Math.cos(angle)*rr,yy=end[1]+Math.sin(p*1.8)*.24,zz=end[2]+Math.sin(angle)*rr;beam(end,[xx,yy,zz],.01,'wood');for(let q=0;q<5;q++)ball(xx+Math.cos(q*1.257)*.065,yy+(q%2)*.038,zz+Math.sin(q*1.257)*.065,.085,['pink','pale','rose'][(q+k+p)%3],1,.7,1);}}
 }
 // Groundcover patches, staggered bulbs and petals inside the parent's edged bed.
 for(let k=0;k<38;k++){const x=-90.45+((k*37)%101)/101*3.9,z=-11.75+((k*53)%103)/103*3.2;if(Math.hypot(x-tx,z-tz)<.45)continue;plant(x,z,.17+(k%3)*.065,k%3===0);}
 for(let k=0;k<110;k++){const x=-90.6+((k*47)%113)/113*4.25,z=-12.7+((k*71)%127)/127*4.4;put('ball',k%2?'pink':'pale',x,ground(x,z)+.025,z,.034,.009,.024,0,k*.8);}
 // Stone lantern, open chamber, four posts, tiered curved cap and finial.
 {const x=-85.7,z=-14.6,y=ground(x,z);box(x,y+.10,z,.87,.22,.86,'stoneDark');box(x,y+.25,z,.65,.13,.65,'stone');put('cone','stone',x,y+.7,z,.26,.8,.26);box(x,y+1.14,z,.67,.16,.67,'stone');box(x,y+1.26,z,.54,.10,.54,'stoneDark');for(const dx of [-.23,.23])for(const dz of [-.23,.23])box(x+dx,y+1.51,z+dz,.095,.49,.095,'stone');ball(x,y+1.38,z,.10,'flower');box(x,y+1.78,z,.69,.12,.69,'stone');for(let i=0;i<5;i++)box(x,y+1.86+i*.075,z,1.02-i*.15,.085,1.02-i*.15,'stone');put('cone','stoneDark',x,y+2.32,z,.14,.24,.14);ball(x,y+2.49,z,.10,'stone');ball(x-.3,y+.25,z+.16,.16,'moss',1,.18,1);}
 // Level slatted potting bench with terrain-fitted feet and a lower shelf.
 {const x=-89.35,z=-15.25,top=Math.max(...[-1.05,1.05].flatMap(dx=>[-.38,.38].map(dz=>ground(x+dx,z+dz))))+.95;
 for(const dx of [-1.02,1.02])for(const dz of [-.34,.34]){let gy=ground(x+dx,z+dz);box(x+dx,(gy+top)/2,z+dz,.12,top-gy,.12,'wood');box(x+dx,gy+.025,z+dz,.21,.08,.21,'stoneDark');}
 for(let j=0;j<5;j++)box(x,top,z-.36+j*.18,2.45,.105,.16,'cut');for(let j=0;j<4;j++)box(x,top-.5,z-.3+j*.2,2.16,.065,.16,'wood');for(const dz of [-.39,.39])box(x,top-.15,z+dz,2.25,.18,.07,'wood');
 pot(x-.83,z,.19,.30,'clay',false,top+.06);pot(x-.35,z+.09,.17,.24,'glaze',false,top+.06);basket(x+.72,z+.07,.26,.23,top+.055);
 beam([x-.27,top+.09,z-.25],[x+.38,top+.09,z-.2],.035,'cut');box(x+.49,top+.08,z-.2,.26,.035,.15,'iron',-.08);
 beam([x+.1,top+.1,z+.2],[x+.59,top+.1,z+.26],.026,'wood');for(let i=0;i<4;i++)box(x+.66,top+.1,z+.17+i*.055,.19,.04,.018,'iron');
 pot(x-.6,z,.28,.38,'clay',false,top-.47);pot(x+.1,z,.24,.32,'clay',false,top-.47);
 // Small seed tray with nine separate soil cells and seedlings.
 box(x-.18,top+.09,z-.06,.44,.045,.25,'dark');for(let i=0;i<3;i++)for(let j=0;j<3;j++)ball(x-.33+i*.14,top+.15,z-.14+j*.08,.035,'leafLight');
 }
 // Water bucket: stave body, hoops, visible water and raised handle.
 {let x=-87.25,z=-16.05,y=ground(x,z),r=.3;for(let i=0;i<16;i++){let a=i*Math.PI/8;box(x+Math.cos(a)*r,y+.24,z+Math.sin(a)*r,.116,.47,.048,'cut',-a+Math.PI/2);}ring(x,y+.07,z,r,'iron');ring(x,y+.4,z,r,'iron');put('cyl','water',x,y+.32,z,.26,.025,.26);ring(x,y+.6,z,.28,'iron',true);}
 basket(-90.65,-16.6,.43,.37);basket(-89.7,-16.8,.34,.3);
 // Bundled bamboo plant supports and hand broom leaned against the low garden boundary.
 for(let k=0;k<6;k++)beam([-90.9+k*.07,ground(-90.9+k*.07,-13.5),-13.5],[-90.7+k*.07,ground(-90.9,-13.5)+1.18,-13.31],.025,'bamboo');
 {let x=-84.75,z=-16.7,y=ground(x,z);beam([x,y+.1,z],[x+.24,y+1.1,z+.08],.028,'wood');for(let k=0;k<14;k++)beam([x,y+.32,z],[x-.18+k*.027,y+.05,z+.02],.012,'rope');}
 // Fitted bamboo fence with black lashings and continuous sloped rails. Open gate 2.7m wide.
 function fence(x0,z0,x1,z1){const n=Math.ceil(Math.hypot(x1-x0,z1-z0)/1.2);let last=null;for(let i=0;i<=n;i++){let t=i/n,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t,y=ground(x,z);beam([x,y-.03,z],[x,y+.89,z],.058,'bamboo');for(let j=0;j<3;j++)ring(x,y+.16+j*.29,z,.061,'joint');if(last){for(const h of [.30,.70])beam([last.x,last.y+h,last.z],[x,y+h,z],.037,'bamboo');for(let j=1;j<=4;j++){let u=j/5,xx=last.x+(x-last.x)*u,zz=last.z+(z-last.z)*u,yy=ground(xx,zz);beam([xx,yy+.08,zz],[xx,yy+.76,zz],.026,'bamboo');for(let h of [.30,.70])box(xx,yy+h,zz,.074,.045,.081,'dark');}}last={x,y,z};}}
 fence(-91.35,-17.35,-91.35,-7.65);fence(-91.3,-18.91,-79.38,-18.91);fence(-76.62,-18.91,-72.55,-18.91);
 // Forecourt pots and small island plantings stop short of stairs and parent stepping stones.
 pot(-81.35,-16.5,.34,.57,'glaze',true);pot(-82.45,-16.7,.25,.43,'clay',true);pot(-74.75,-16.55,.34,.54,'clay',true);pot(-73.65,-17.2,.23,.4,'glaze',true);
 for(const [x,z,s]of [[-90.8,-7.8,.35],[-85.1,-8,.38],[-84.4,-10,.33],[-84.45,-12.4,.28],[-86.2,-16.8,.3],[-90.7,-17.1,.25],[-82.4,-18.65,.20],[-74.4,-18.65,.24]])plant(x,z,s,true);
 // A small kneeling stool, wood pegs, and neatly stored spare plant pots.
 {const x=-85.0,z=-17.2,y=Math.max(ground(x-.3,z),ground(x+.3,z))+.36;box(x,y,z,.72,.085,.42,'cut');for(let dx of [-.24,.24]){const yy=ground(x+dx,z);box(x+dx,(yy+y)/2,z,.1,y-yy,.33,'wood');}}
 pot(-84.6,-15.9,.19,.28,'clay');pot(-84.6,-15.9,.16,.22,'clay',false,ground(-84.6,-15.9)+.19);
 for(const batch of batches.values()){const mesh=new THREE.InstancedMesh(batch.geo,batch.mat,batch.items.length);batch.items.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);}
 return g;
}
