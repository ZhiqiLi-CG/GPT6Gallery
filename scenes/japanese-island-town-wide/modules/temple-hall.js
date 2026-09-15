import {heightAt, roadNetwork, layout} from './root.js';
import {templeLayout} from './temple.js';

export function build(THREE,ctx){
 const L=templeLayout(), H=L.hall, P=L.palette, ground=L.terraceY;
 const shared={roads:roadNetwork(),layout:layout()};
 const g=new THREE.Group();g.name='temple-hall_complete-worship-hall';
 const mats={}, boxes={}, cylinders={}, surfaces={};
 const colors={wood:P.wood,dark:P.darkWood,honey:0x98724d,deck:0x806044,deck2:0x896a4b,plaster:P.plaster,stone:P.stone,stone2:0x777b72,tile:P.tile,tile2:0x526169,tile3:0x3d4b54,ridge:0x627078,brass:0xa38a49,black:0x292b29,paper:0xb6ad8d,rope:0xb09a70};
 for(const [k,c] of Object.entries(colors)){mats[k]=new THREE.MeshStandardMaterial({color:c,roughness:k==='brass'?.38:.86,metalness:k==='brass'?.65:0,side:THREE.DoubleSide});boxes[k]=[];cylinders[k]=[];surfaces[k]=[];}
 const o=new THREE.Object3D(), up=new THREE.Vector3(0,1,0);
 function box(k,x,y,z,w,h,d,rx=0,ry=0,rz=0){o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.scale.set(w,h,d);o.updateMatrix();boxes[k].push(o.matrix.clone());}
 function cyl(k,a,b,r,r2=r){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),v=B.clone().sub(A);o.position.copy(A).add(B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(up,v.clone().normalize());o.scale.set(r,v.length(),r);o.updateMatrix();cylinders[k].push(o.matrix.clone());}
 function beam(k,a,b,w,d=w){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),v=B.clone().sub(A);o.position.copy(A).add(B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(up,v.clone().normalize());o.scale.set(w,v.length(),d);o.updateMatrix();boxes[k].push(o.matrix.clone());}
 function quad(k,a,b,c,d){surfaces[k].push(...a,...b,...c,...a,...c,...d);}
 function tri(k,a,b,c){surfaces[k].push(...a,...b,...c);}
 // A real plinth enters the root hill; fitted exterior stones rise above the common terrace.
 for(let x=-8.5;x<10.5;x+=1)for(let z=49;z<63;z+=1){const bottom=Math.min(heightAt(x,z),heightAt(x+1,z+1),heightAt(x+1,z),heightAt(x,z+1))-.16;box('stone2',x+.5,(bottom+25.76)/2,z+.5,1,25.76-bottom,1);}
 for(let row=0;row<2;row++){
  for(let x=-8.5;x<10.5;x+=.95)for(const z of [49,63])box((Math.floor(x*3)+row)%3?'stone':'stone2',x+.46,25.34+row*.27,z,.91,.25,.25);
  for(let z=49.4;z<62.9;z+=.95)for(const x of [-8.5,10.5])box('stone',x,25.34+row*.27,z,.25,.25,.91);
 }
 const floor=26.52;
 // Pier-supported veranda and exposed underfloor construction.
 for(let x=-8.2;x<=10.2;x+=2.3)for(const z of [49.3,50.6,61.4,62.7]){box('stone',x,25.83,z,.68,.28,.68);box('dark',x,26.11,z,.32,.5,.32);}
 for(const z of [49.35,50.5,61.5,62.65])box('dark',1,26.17,z,19.2,.29,.28);
 for(let x=-8.3;x<=10.3;x+=.65)box('wood',x,26.26,56,.14,.25,13.55);
 box('dark',1,26.37,56,16,.22,11);
 for(let z=49.2;z<62.95;z+=.22)box(Math.floor(z*10)%3?'deck':'deck2',1,26.48,z,19.2,.12,.208);
 for(const z of [49.08,62.98])box('honey',1,26.43,z,19.5,.29,.19);
 for(const x of [-8.68,10.68])box('honey',x,26.43,56,.19,.29,14.05);
 // Wide welcoming south stair reaches the courtyard path on the right.
 for(let i=0;i<5;i++){const z=47.46+i*.335,top=ground+(floor-ground)*(i+1)/5;box('stone2',3.8,(ground+top)/2,z,10.8,top-ground,.36);box('deck',3.8,top+.035,z-.018,10.95,.07,.385);box('honey',3.8,top-.045,z-.2,10.95,.12,.065);}
 // Four fully framed elevations; front two middle bays are deep sliding-door entrances.
 const front=50.5,back=61.5,xs=[-7,-3.8,-.6,2.6,5.8,9],zs=[50.5,54.1667,57.8333,61.5];
 function panel(cx,cz,width,side,entrance=false){
  const outward=side?(cx>H.x?-1:1):(cz>H.z?-1:1);
  const tr=(u,y,v=0)=>side?[cx+v*outward,y,cz+u]:[cx+u,y,cz+v*outward];
  const bx=(k,u,y,v,w,h,d)=>{const p=tr(u,y,v);box(k,...p,side?d:w,h,side?w:d);};
  if(!entrance){
   bx('plaster',0,28.63,0,width-.3,3.85,.18);
   bx('dark',0,28.4,-.12,width-.66,2.27,.13);
   bx('paper',0,28.48,-.205,width-.91,1.95,.08);
   for(let u=-width/2+.52;u<width/2-.3;u+=.22)bx('wood',u,28.48,-.28,.05,1.96,.06);
   for(const y of [27.48,27.98,28.48,28.98,29.47])bx('honey',0,y,-.29,width-.87,.045,.065);
   for(const u of [-width/2+.39,width/2-.39])bx('wood',u,28.45,-.26,.13,2.25,.15);
   for(const y of [27.31,29.59])bx('wood',0,y,-.25,width-.62,.16,.18);
   for(let u=-width/2+.3;u<width/2-.15;u+=.24)bx('wood',u,26.98,-.13,.22,.64,.11);
  }else{
   // Doorways remain open into the fully enclosed worship room.
   // Sliding leaves, with a central shadowed opening and raised geometric grids.
   for(const sign of [-1,1]){
    const u=sign*(width/2-.65);bx('wood',u,28.18,-.19,.97,3.25,.15);bx('paper',u,28.63,-.28,.78,2.04,.08);
    for(let a=-.3;a<=.31;a+=.15)bx('honey',u+a,28.62,-.35,.035,2.1,.06);
    for(let y=27.58;y<29.8;y+=.27)bx('honey',u,y,-.36,.86,.045,.06);
    bx('brass',u-sign*.3,28,-.39,.055,.3,.03);
    bx('honey',u,26.95,-.28,.77,.48,.09);
   }
   for(const y of [26.65,29.86])bx('honey',0,y,-.25,width-.3,.12,.35);
  }
  // Pierced transom lattice and scroll-like carved diagonal timber.
  bx('dark',0,30.39,0,width-.28,.74,.18);
  for(const y of [30.01,30.78])bx('honey',0,y,-.17,width-.2,.11,.16);
  for(let u=-width/2+.38;u<width/2-.35;u+=.42){beam('honey',tr(u-.16,30.16,-.16),tr(u+.16,30.63,-.16),.065);beam('wood',tr(u+.16,30.16,-.18),tr(u-.16,30.63,-.18),.055);}
 }
 for(let i=0;i<5;i++){panel((xs[i]+xs[i+1])/2,front,3.2,false,i>=1&&i<=3);panel((xs[i]+xs[i+1])/2,back,3.2,false);}
 for(let i=0;i<3;i++)for(const x of [-7,9])panel(x,(zs[i]+zs[i+1])/2,11/3,true);
 const posts=[];for(const x of xs)for(const z of [front,back])posts.push([x,z]);for(const x of [-7,9])for(const z of [zs[1],zs[2]])posts.push([x,z]);
 for(const [x,z] of posts){box('stone',x,26.57,z,.61,.13,.61);cyl('wood',[x,26.6,z],[x,31.35,z],.225);cyl('dark',[x,26.67,z],[x,26.86,z],.24);box('honey',x,31.13,z,.6,.19,.6);
  // Three stepped bracket arms with bearing blocks, pegs and carved ends.
  for(let k=0;k<3;k++){const y=31.34+k*.24,len=.85+k*.5;box('wood',x,y,z,len,.18,.27);box('wood',x,y+.09,z,.27,.18,len);for(const s of [-1,1]){box('honey',x+s*(len/2-.12),y+.15,z,.23,.22,.36);box('honey',x,y+.23,z+s*(len/2-.12),.36,.22,.23);}}
  for(const s of [-1,1]){beam('honey',[x+s*.17,30.88,z],[x+s*.71,31.42,z],.16);beam('wood',[x,30.88,z+s*.17],[x,31.42,z+s*.71],.16);}
  for(const y of [27.05,29.8])box('black',x, y,z-.232,.065,.065,.018);
 }
 for(const z of [front,back])for(const y of [26.77,29.86,31.01])box('dark',1,y,z,16.5,.2,.25);
 for(const x of [-7,9])for(const y of [26.77,29.86,31.01])box('dark',x,y,56,.25,.2,11.5);
 // Deep purlins and short roof struts transfer the sloping roof loads into the bracket stacks.
 for(const z of [50.5,61.5])box('dark',1,32.26,z,18,.26,.33);
 for(const x of [-7,9])box('dark',x,32.26,56,.33,.26,12.8);
 for(const [x,z] of posts){
  const roofY=(z===front||z===back)?33.02:33.52;
  box('wood',x,(32.38+roofY)/2,z,.23,roofY-32.38,.23);
  box('dark',x,roofY,z,.7,.17,.7);
  if(z===front||z===back){const s=z===front?-1:1;beam('wood',[x,32.37,z],[x,32.49,z+s*2.35],.17,.23);beam('honey',[x,31.94,z],[x,32.48,z+s*1.65],.13);}
  if(x===-7||x===9){const s=x===-7?-1:1;beam('wood',[x,32.37,z],[x+s*2.8,32.5,z],.2,.18);beam('honey',[x,31.94,z],[x+s*1.75,32.45,z],.13);}
 }
 // Perimeter balustrades leave the entire south stair and front promenade open.
 function rail(a,b){const dx=b[0]-a[0],dz=b[1]-a[1],n=Math.ceil(Math.hypot(dx,dz)/1.45);for(let i=0;i<=n;i++){const x=a[0]+dx*i/n,z=a[1]+dz*i/n;box('dark',x,27.04,z,.16,1.12,.16);box('honey',x,27.64,z,.24,.1,.24);cyl('brass',[x,27.68,z],[x,27.75,z],.08);}for(const y of [26.83,27.49])beam('wood',[a[0],y,a[1]],[b[0],y,b[1]],.12,.17);for(let i=0;i<n*5;i++){const t=(i+.5)/(n*5);box('honey',a[0]+dx*t,27.14,a[1]+dz*t,.052,.57,.052);}}
 rail([-8.4,49.6],[-8.4,62.7]);rail([10.4,49.6],[10.4,62.7]);rail([-8.4,62.7],[10.4,62.7]);
 // Low coffered ceiling, altar visible through the shadowed entrance, and offering furniture.
 box('dark',1,31.32,56,16,.18,11);for(let x=-6;x<9;x+=1.6)box('wood',x,31.18,56,.14,.17,10.8);for(let z=51;z<61.5;z+=1.3)box('wood',1,31.18,z,15.8,.17,.12);
 box('dark',1,27.1,59.7,3,.95,1.1);box('honey',1,27.63,59.7,3.3,.15,1.3);box('brass',1,27.8,59.8,.8,.18,.4);box('black',1,28.42,59.9,.52,1.1,.18);
 for(const x of [.71,1.29])box('brass',x,28.42,59.78,.055,1.15,.06);for(const y of [27.85,28.99])box('brass',1,y,59.78,.62,.06,.06);
 for(let y=28.1;y<28.8;y+=.13)box('brass',1,y,59.795,.14,.065,.022);
 for(const x of [-.1,2.1]){cyl('brass',[x,27.73,59.55],[x,28.14,59.55],.055);cyl('brass',[x,27.73,59.55],[x,27.78,59.55],.17);cyl('paper',[x,28.14,59.55],[x,28.48,59.55],.06);} 
 box('dark',1,26.96,49.79,2.15,.78,.72);box('honey',1,27.38,49.79,2.33,.11,.87);
 for(let x=.0;x<2.1;x+=.17)box('wood',x,27.47,49.79,.09,.07,.81);
 for(const x of [.04,1.96])for(const z of [49.44,50.12])box('brass',x,26.98,z,.09,.67,.035);
 for(let x=.21;x<1.9;x+=.22)box('honey',x,26.95,49.42,.045,.55,.04);
 box('brass',1,27.05,49.393,.38,.23,.023);
 // Rope strands twist around a curved centerline; restrained Buddhist bell fitting.
 for(let strand=0;strand<3;strand++){let last=null;for(let i=0;i<=44;i++){const t=i/44,p=[1+.065*Math.sin(t*40+strand*2.094),30.83-t*3.02,49.3+.06*Math.cos(t*40+strand*2.094)];if(last)cyl('rope',last,p,.024);last=p;}}
 cyl('brass',[1,30.6,49.3],[1,30.89,49.3],.16);for(let i=0;i<9;i++)cyl('rope',[1,27.83,49.3],[1+(i-4)*.023,27.55,49.3+.04*Math.sin(i)],.014);
 // Continuous swept hip and gable roof with individual overlapping pan tiles and raised tile rolls.
 // Coordinates here are relative to the fixed hall center.
 const C=(x,y,z)=>[H.x+x,y,H.z+z];
 function lower(side,u,t){const w=11-4*t,d=8-5*t;let x,z;if(side<2){x=u*w;z=(side===0?-1:1)*d;}else{x=(side===2?-1:1)*w;z=u*d;}return C(x,32.08+2.22*t+.55*Math.pow(1-t,5)+.34*Math.pow(Math.abs(u),8)*Math.pow(1-t,3),z);}
 function upper(side,u,t){return C(u*7,34.3+2.8*t,(side===0?-1:1)*3*(1-t));}
 function lifted(p,h){return [p[0],p[1]+h,p[2]];}
 function tiledSurface(fn,cols,rows){
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
   const u0=-1+2*c/cols,u1=-1+2*(c+1)/cols,t0=r/rows,t1=(r+1)/rows;
   const a=fn(u0,t0),b=fn(u1,t0),cc=fn(u1,t1),d=fn(u0,t1);quad('dark',lifted(a,-.12),lifted(b,-.12),lifted(cc,-.12),lifted(d,-.12));
   // Pan has three cross-sectional facets, so close-up tiles are curved ceramic, not printed lines.
   const k=['tile','tile2','tile','tile3'][(c*17+r*13)%4];
   for(let s=0;s<3;s++){const ua=u0+(u1-u0)*s/3,ub=u0+(u1-u0)*(s+1)/3,ha=.035+.055*Math.pow((s/3-.5)*2,2),hb=.035+.055*Math.pow(((s+1)/3-.5)*2,2);quad(k,lifted(fn(ua,t0),ha+.025),lifted(fn(ub,t0),hb+.025),lifted(fn(ub,t1),hb),lifted(fn(ua,t1),ha));}
   cyl('tile2',lifted(a,.12),lifted(d,.10),.052);
   beam('tile3',lifted(a,.018),lifted(b,.018),.04,.055);
  }
  for(let c=0;c<=cols;c++){const u=-1+2*c/cols;for(let r=0;r<rows;r++){const a=fn(u,r/rows),b=fn(u,(r+1)/rows);beam('honey',lifted(a,-.19),lifted(b,-.19),.075,.115);}}
  for(let c=0;c<cols;c++){const a=fn(-1+2*c/cols,0),b=fn(-1+2*(c+1)/cols,0);beam('dark',lifted(a,-.09),lifted(b,-.09),.20,.18);const mid=fn(-1+2*(c+.5)/cols,0);cyl('ridge',[mid[0],mid[1]-.03,mid[2]],[mid[0],mid[1]+.065,mid[2]],.09);}
 }
 for(let side=0;side<4;side++)tiledSurface((u,t)=>lower(side,u,t),side<2?58:42,14);
 for(let side=0;side<2;side++)tiledSurface((u,t)=>upper(side,u,t),38,11);
 // Hip seams rise to each gable foot; the caps conceal all sheet junctions.
 for(const sx of [-1,1])for(const sz of [-1,1])for(let i=0;i<18;i++){const t=i/18,t1=(i+1)/18;const f=t=>C(sx*(11-4*t),32.08+2.22*t+.89*Math.pow(1-t,5)+.13,sz*(8-5*t));cyl('ridge',f(t),f(t1),.145);}
 // East/west triangular gable infill, radial framing and deep bargeboards.
 for(const sx of [-1,1]){
  const x=H.x+sx*7.02;tri('plaster',[x,34.29,53],[x,37.1,56],[x,34.29,59]);
  for(const z of [53,59])beam('honey',[x+sx*.1,34.35,z],[x+sx*.1,37.17,56],.19,.20);
  beam('dark',[x+sx*.08,34.43,53],[x+sx*.08,34.43,59],.21);
  for(let z=53.5;z<=58.5;z+=.5){const top=37.1-Math.abs(z-56)*2.8/3;beam('wood',[x+sx*.12,34.45,z],[x+sx*.12,top,z],.095);}
  beam('honey',[x+sx*.15,34.5,54],[x+sx*.15,36.62,56],.12);beam('honey',[x+sx*.15,34.5,58],[x+sx*.15,36.62,56],.12);
 }
 for(let i=0;i<5;i++)box(i%2?'tile3':'ridge',1,37.13+i*.13,56,14.6,.12, .72-i*.075);
 for(let x=-6.6;x<8.8;x+=.31)cyl('ridge',[x,37.79,56],[x+.32,37.79,56],.20);
 // Ornamental ridge end tiles, scrolls and a small central crest.
 for(const x of [-6.45,8.45]){
  box('tile3',x,37.66,56,.26,.86,.85);
  for(let i=0;i<16;i++){const a=i*Math.PI*2/16,b=(i+1)*Math.PI*2/16;cyl('ridge',[x,37.76+.32*Math.sin(a),56+.32*Math.cos(a)],[x,37.76+.32*Math.sin(b),56+.32*Math.cos(b)],.075);}
  cyl('brass',[x-.17,37.77,56],[x+.17,37.77,56],.13);
  beam('ridge',[x,37.94,55.72],[x,38.37,55.54],.13);beam('ridge',[x,37.94,56.28],[x,38.37,56.46],.13);
 }
 // All repeated parts are instanced, roof pans are consolidated by ceramic shade.
 for(const k of Object.keys(mats)){
  if(boxes[k].length){const m=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mats[k],boxes[k].length);boxes[k].forEach((v,i)=>m.setMatrixAt(i,v));m.castShadow=true;m.receiveShadow=true;g.add(m);}
  if(cylinders[k].length){const m=new THREE.InstancedMesh(new THREE.CylinderGeometry(1,1,1,8),mats[k],cylinders[k].length);cylinders[k].forEach((v,i)=>m.setMatrixAt(i,v));m.castShadow=true;m.receiveShadow=true;g.add(m);}
  if(surfaces[k].length){const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(surfaces[k],3));geom.computeVertexNormals();const m=new THREE.Mesh(geom,mats[k]);m.castShadow=true;m.receiveShadow=true;g.add(m);}
 }
 return g;
}
