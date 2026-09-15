import {heightAt,roadNetwork,layout} from './root.js';
import {createHouse,kit,roadClear} from './east-village.js';

export function build(THREE,ctx){
 const out=new THREE.Group();out.name='east-village-nets complete households';
 const clothMats=[0x77868a,0xb9b6a3,0x637782].map(color=>new THREE.MeshStandardMaterial({color,roughness:1,side:THREE.DoubleSide}));
 const lots=layout().lots.filter(l=>['east-village-lot-3','east-village-lot-4'].includes(l.id));
 for(const [idx,lot] of lots.entries()){
  const g=new THREE.Group();g.name=`east-village-nets_house_${idx+1}`;out.add(g);
  const k=kit(THREE),{box,beam,cylinder,ball}=k;g.add(k.group);
  g.add(createHouse(THREE,lot,{w:idx?6.6:6.8,d:6.7,stories:idx?1:2,tone:idx?'gray':'plaster',ridgeAcross:idx===1,rise:idx?1.85:2.15}));
  const minX=idx?17.65:.2,maxX=idx?30.4:13.35,z0=-39.8,z1=-26.2;
  // Each fence post and each rail end follows the ground; gates open to the lane.
  function fence(a,b){const n=Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1])/1.25);for(let i=0;i<=n;i++){const t=i/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,y=heightAt(x,z);if(!roadClear(x,z,.12))continue;box(x,y+.53,z,.13,1.13,.13,'beam');box(x,y+1.12,z,.18,.06,.18,'board');if(i<n){const u=(i+1)/n,xx=a[0]+(b[0]-a[0])*u,zz=a[1]+(b[1]-a[1])*u,yy=heightAt(xx,zz);for(const h of [.36,.85])beam([x,y+h,z],[xx,yy+h,zz],.045,'wood');for(let j=1;j<4;j++){const xx2=x+(xx-x)*j/4,zz2=z+(zz-z)*j/4,yy2=heightAt(xx2,zz2);box(xx2,yy2+.6,zz2,.055,.84,.06,'board')}}}}
  fence([minX,z0],[maxX,z0]);fence([minX,z1],[maxX,z1]);const back=idx?maxX:minX,front=idx?minX:maxX;
  fence([back,z0],[back,z1]);fence([front,z0],[front,-34.05]);fence([front,-31.95],[front,z1]);
  // Open slatted sheds, physically separate from the main eaves.
  function shed(x,z){const w=2.5,d=3.3,top=Math.max(...[-1,1].flatMap(a=>[-1,1].map(b=>heightAt(x+a*w/2,z+b*d/2))))+.19;
   for(const a of [-1,1])for(const b of [-1,1]){const px=x+a*w/2,pz=z+b*d/2,gy=heightAt(px,pz);box(px,(gy+top)/2,pz,.36,top-gy+.18,.38,'stone');box(px,top+1.03,pz,.14,2.1,.14,'beam')}
   for(let i=0;i<10;i++)box(x-w/2+(i+.5)*w/10,top+.02,z,w/10-.02,.09,d,'board');
   for(let i=0;i<8;i++){let zz=z-d/2+(i+.5)*d/8;box(x+(idx?1:-1)*w/2,top+.9,zz,.07,1.7,d/8-.06,'wood')}
   for(let i=0;i<7;i++)box(x-w/2+(i+.5)*w/7,top+.9,z-d/2,w/7-.06,1.7,.07,'board');
   for(const a of [-1,1]){box(x+a*w/2,top+2.04,z,.15,.17,d+.2,'beam');box(x,top+2.04,z+a*d/2,w+.2,.16,.14,'beam')}
   const half=w/2+.24,rise=.65,len=Math.hypot(half,rise),roof=top+2.12;
   for(const s of [-1,1]){box(x+s*half/2,roof+rise/2,z,len,.10,d+.52,'dark',0,0,-s*Math.atan2(rise,half));for(let zz=z-d/2-.24;zz<=z+d/2+.24;zz+=.35)beam([x,roof+rise-.08,zz],[x+s*half,roof-.08,zz],.044,'wood');for(let r=0;r<5;r++)for(let c=0;c<12;c++){const t=(r+.5)/5;box(x+s*half*t,roof+rise*(1-t)+.07,z-(d+.52)/2+(c+.5)*(d+.52)/12,len/5+.04,.065,(d+.52)/12-.012,(c+r)%4?'tile':'tile2',0,0,-s*Math.atan2(rise,half))}}
   for(let zz=z-d/2-.26;zz<z+d/2+.26;zz+=.28)beam([x,roof+rise+.13,zz],[x,roof+rise+.13,zz+.29],.105,'tile2');
   for(const s of [-1,1]){beam([x-half,roof,z+s*d/2],[x,roof+rise,z+s*d/2],.055,'beam');beam([x,roof+rise,z+s*d/2],[x+half,roof,z+s*d/2],.055,'beam')}
   box(x,top+.65,z-.8,w-.25,.10,.55,'board');return top;
  }
  const shedX=idx?28.8:1.9,shedZ=-34.7,sy=shed(shedX,shedZ);
  // Circular rope and basket work is real tubular geometry.
  function ring(x,y,z,r,t,mat='rope',vertical=false){const mesh=new THREE.Mesh(new THREE.TorusGeometry(r,t,5,32),k.mats[mat]);mesh.position.set(x,y,z);if(!vertical)mesh.rotation.x=Math.PI/2;mesh.castShadow=true;k.group.add(mesh)}
  function coil(x,z,r=.33,y=heightAt(x,z)+.08){for(let i=0;i<5;i++)ring(x,y+i*.019,z,r-i*.046,.022);beam([x+r,y,z],[x+r+.28,y-.01,z+.18],.024,'rope')}
  function barrel(x,z,y=heightAt(x,z)){const h=.85,r=.34;for(let j=0;j<16;j++){const a=j*Math.PI/8;box(x+Math.cos(a)*r,y+h/2,z+Math.sin(a)*r,.125,h,.07,j%3?'wood':'board',0,-a-Math.PI/2,0)}for(const hh of [.13,.69,.82])ring(x,y+hh,z,r+.035,.025,'dark');cylinder(x,y+h-.04,z,r-.015,.07,'board');for(let j=-2;j<=2;j++)box(x+j*.115,y+h+.003,z,.009,.012,2*Math.sqrt(Math.max(0,r*r-j*j*.115*.115)),'beam')}
  function basket(x,z,y=heightAt(x,z),r=.32){for(let j=0;j<14;j++){const a=j*Math.PI/7;beam([x+Math.cos(a)*r*.7,y+.04,z+Math.sin(a)*r*.7],[x+Math.cos(a)*r,y+.45,z+Math.sin(a)*r],.015,'rope')}for(let j=0;j<8;j++)ring(x,y+.04+j*.056,z,r*(.7+.3*j/7),.016);cylinder(x,y+.035,z,r*.68,.04,'board');ring(x,y+.48,z,r,.026)}
  barrel(shedX-.55,shedZ+.6,sy+.08);barrel(shedX+.5,shedZ+.65,sy+.08);basket(shedX,shedZ-.8,sy+.72,.26);
  function bench(x,z){const y=Math.max(...[-1,1].flatMap(a=>[-1,1].map(b=>heightAt(x+a*.85,z+b*.28))))+.85;for(const a of [-1,1])for(const b of [-1,1]){const xx=x+a*.85,zz=z+b*.28,gy=heightAt(xx,zz);box(xx,(gy+y)/2,zz,.11,y-gy,.12,'beam')}for(let j=0;j<4;j++)box(x,y,z-.31+j*.21,2.05,.095,.19,'board');beam([x-.85,y-.25,z],[x+.85,y-.25,z],.065,'wood');return y+.055}
  const bx=idx?23.4:6.8,bz=-38.2,by=bench(bx,bz);
  coil(bx-.45,bz,.27,by+.055);for(const dx of [.28,.7]){cylinder(bx+dx,by+.15,bz,.105,.3,'rope');for(const h of [.015,.30])cylinder(bx+dx,by+h,bz,.16,.035,'board')}
  // Netting shuttle with split fork and lashings on the repair table.
  for(const dx of [-.08,.08])box(bx+.1+dx,by+.04,bz-.22,.035,.035,.5,'wood');box(bx+.1,by+.04,bz-.35,.2,.035,.07,'board');
  if(!idx){
   const point=(i,j)=>{const t=j/8;return [bx-.87+i*1.74/14,by+.025-Math.max(0,.47-t)*1.12,bz-.77+t*.68]};
   for(let i=0;i<=14;i++)for(let j=0;j<=8;j++){if(i<14)beam(point(i,j),point(i+1,j),.009,'rope');if(j<8)beam(point(i,j),point(i,j+1),.009,'rope')}
  }
  basket(bx+1.5,bz+.25);coil(bx+1.35,bz+1.05);barrel(idx?27.5:3.6,-38.65);
  // Supported work lines; actual crossing strands, knots and a draped hem.
  const ax=idx?20.2:4.4,az=-27.6,span=idx?4.4:5.6;
  const yy=Math.max(heightAt(ax,az),heightAt(ax+span,az))+2.3;
  for(const x of [ax,ax+span]){const gy=heightAt(x,az);box(x,(gy+yy)/2,az,.12,yy-gy+.14,.12,'wood');beam([x,yy-.7,az],[x+.4,gy,az+.48],.04,'wood')}
  function top(t){return yy-.18*Math.sin(t*Math.PI)}
  for(let j=0;j<24;j++){const a=j/24,b=(j+1)/24;beam([ax+span*a,top(a),az],[ax+span*b,top(b),az],.024,'rope')}
  if(!idx){const ny=9,nx=28;for(let i=0;i<=nx;i++)for(let j=0;j<=ny;j++){const t=i/nx,v=j/ny,x=ax+span*t,y=top(t)-v*1.48,z=az+.10*Math.sin(t*5)*v;ball(x,y,z,.023,.023,.023,'rope');if(i<nx){const tt=(i+1)/nx;beam([x,y,z],[ax+span*tt,top(tt)-v*1.48,az+.10*Math.sin(tt*5)*v],.011,'rope')}if(j<ny)beam([x,y,z],[x,top(t)-(j+1)/ny*1.48,az+.10*Math.sin(t*5)*(j+1)/ny],.011,'rope')}
   for(let i=0;i<9;i++)ball(ax+.25+i*.63,top((.25+i*.63)/span)+.02,az,.095,.065,.065,'board');
  }else{for(let i=0;i<4;i++){const x=ax+.35+i*1.03,w=.76,h=i%2?1.02:.8,geo=new THREE.PlaneGeometry(w,h,8,8),p=geo.attributes.position;for(let n=0;n<p.count;n++){const u=p.getX(n),v=p.getY(n);p.setZ(n,.07*Math.sin(u*14+i)*(h/2-v)/h)}geo.computeVertexNormals();const m=new THREE.Mesh(geo,clothMats[i%3]);m.position.set(x+w/2,top((x+w/2-ax)/span)-h/2,az);m.castShadow=true;k.group.add(m);for(const xx of [x+.07,x+w-.07])box(xx,top((xx-ax)/span),az,.035,.10,.05,'wood')}}
  // Three narrow terraced kitchen beds. Every retaining segment descends to local ground.
  const gx=idx?29:1.55,gz=-28.7;
  for(let row=0;row<3;row++){const z=gz+row*.69,w=2.15,d=.47;for(let j=0;j<7;j++){const x=gx-w/2+(j+.5)*w/7,y=heightAt(x,z);box(x,y+.095,z,w/7-.015,.19,d,'soil');for(const s of [-1,1])box(x,y+.11,z+s*d/2,w/7,.23,.07,'stone');for(let p=0;p<2;p++){const px=x+(p-.5)*.10,py=heightAt(px,z);beam([px,py+.14,z],[px,py+.38,z],.014,'leaf');for(let a=0;a<4;a++)ball(px+Math.cos(a*Math.PI/2)*.08,py+.27,z+Math.sin(a*Math.PI/2)*.08,.105,.045,.055,'leaf')}}for(const s of [-1,1]){const x=gx+s*w/2,y=heightAt(x,z);box(x,y+.1,z,.07,.25,d,'stone')}}
  // Hollow pots, herb leaves, a hoe and broom alongside the store.
  for(let j=0;j<3;j++){const x=idx?26.8+j*.53:3.7+j*.49,z=-28.3,y=heightAt(x,z),r=.18+j*.025;cylinder(x,y+.16,z,r,.28,'board');ring(x,y+.31,z,r+.01,.035,'wood');cylinder(x,y+.30,z,r*.8,.025,'soil');for(let a=0;a<5;a++)beam([x,y+.31,z],[x+.15*Math.cos(a*1.26),y+.65+.08*(a%2),z+.15*Math.sin(a*1.26)],.022,'leaf')}
  const tx=idx?27.15:3.5,tz=-35.1,ty=heightAt(tx,tz);beam([tx,ty+.05,tz],[tx-.23,ty+1.5,tz+.14],.024,'wood');box(tx,ty+.06,tz,.35,.075,.13,'dark');beam([tx,ty+.05,tz+.5],[tx-.17,ty+1.45,tz+.62],.025,'wood');for(let j=0;j<9;j++)beam([tx-.11+j*.028,ty+.02,tz+.48],[tx-.045,ty+.40,tz+.54],.013,'rope');
  if(!idx){const x=1.9,z=-38.45,y=heightAt(x,z);beam([x,y-.08,z],[x+.22,y+2.65,z+.12],.115,'wood');for(let j=0;j<5;j++){const a=j*2.4,h=1.45+j*.33,xx=x+Math.cos(a)*.65,zz=z+Math.sin(a)*.65;beam([x+.1,y+h-.3,z],[xx,y+h,zz],.05,'wood');for(let t=0;t<5;t++)ball(xx+Math.cos(t*1.26)*.24,y+h+.12,zz+Math.sin(t*1.26)*.28,.45,.17,.36,'leaf')}}
  // Low flat walking stones link the working zones without making a new road.
  for(let j=0;j<5;j++){const x=idx?18.7:12.25,z=-35-j*.73,y=heightAt(x,z);box(x,y+.055,z,.48,.11,.40,'stone2',0,.13*Math.sin(j),0)}
  k.flush();g.userData={lot:lot.id,household:idx?'gray plaster laundry and rope household':'two storey net maker',roads:roadNetwork().map(r=>r.id)};
 }
 return out;
}
