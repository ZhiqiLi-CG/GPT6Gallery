import {heightAt,roadNetwork,layout} from './root.js';
import {createHouse,kit,roadClear} from './east-village.js';

export function build(THREE,ctx){
 const out=new THREE.Group();out.name='east-village-laundry: wash and rope households';
 const lots=layout().lots.filter(l=>['east-village-lot-7','east-village-lot-8'].includes(l.id));
 const mats={
  cloth:new THREE.MeshStandardMaterial({color:0xc8c0a6,roughness:1,side:THREE.DoubleSide}),
  indigo:new THREE.MeshStandardMaterial({color:0x526c79,roughness:1,side:THREE.DoubleSide}),
  faded:new THREE.MeshStandardMaterial({color:0x998d78,roughness:1,side:THREE.DoubleSide}),
  clay:new THREE.MeshStandardMaterial({color:0x93715a,roughness:.96}),
  water:new THREE.MeshStandardMaterial({color:0x667c77,roughness:.28,metalness:.15}),
  iron:new THREE.MeshStandardMaterial({color:0x414741,roughness:.75}),
  leaf:new THREE.MeshStandardMaterial({color:0x3c5c3c,roughness:1}),
  yard:new THREE.MeshStandardMaterial({color:0x8b8067,roughness:1}),
 };
 for(const lot of lots){
  const west=lot.x<15.5,k=kit(THREE),g=k.group;
  g.name='east-village-laundry_'+(west?'wash_house':'rope_house');
  const H=(x,z)=>heightAt(x,z);
  const {box,beam,ball,cylinder}=k;
  function mesh(geo,mat,x,y,z,rx=0,ry=0,rz=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
  function curve(points,r=.025,mat=k.mats.rope){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),Math.max(12,points.length*3),r,6,false),mat,0,0,0);}
  function ring(x,y,z,r,t=.024,mat=mats.iron,rx=Math.PI/2){return mesh(new THREE.TorusGeometry(r,t,6,28),mat,x,y,z,rx);}
  function wornCourt(x,z,rx,rz){const verts=[x,H(x,z)+.023,z],indices=[],n=48,bands=9;for(let band=1;band<=bands;band++)for(let i=0;i<n;i++){const a=i*2*Math.PI/n,r=(1+.035*Math.sin(i*2.7))*band/bands,px=x+Math.cos(a)*rx*r,pz=z+Math.sin(a)*rz*r;verts.push(px,H(px,pz)+.023,pz);}for(let i=0;i<n;i++)indices.push(0,(i+1)%n+1,i+1);for(let band=1;band<bands;band++)for(let i=0;i<n;i++){const a=1+(band-1)*n+i,b=1+(band-1)*n+(i+1)%n,c=a+n,d=b+n;indices.push(a,b,c,b,d,c);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();const m=mesh(geo,mats.yard,0,0,0);m.castShadow=false;}
  function post(x,z,h=1.06,r=.07){const y=H(x,z);cylinder(x,y+h/2,z,r,h,'beam');box(x,y-.035,z,.22,.16,.22,'stone');return y;}
  function fence(a,b){const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.55);for(let i=0;i<=n;i++){const t=i/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(!roadClear(x,z,.15))continue;post(x,z);if(i){const u=(i-1)/n,px=a[0]+(b[0]-a[0])*u,pz=a[1]+(b[1]-a[1])*u;for(const h of [.35,.79])beam([px,H(px,pz)+h,pz],[x,H(x,z)+h,z],.04,'wood');for(let j=1;j<4;j++){const q=j/4,sx=px+(x-px)*q,sz=pz+(z-pz)*q;beam([sx,H(sx,sz)+.17,sz],[sx,H(sx,sz)+.91,sz],.022,'board');}}}}
  const rear=west?.55:31.5,front=west?13.05:17.95,south=-1.35,north=13.25;
  fence([rear,south],[front,south]);fence([rear,south],[rear,north]);fence([rear,north],[front,north]);fence([front,south],[front,5.08]);fence([front,6.92],[front,north]);
  for(const z of [5.03,6.97]){const y=post(front,z,1.3,.105);box(front,y+1.28,z,.3,.13,.28,'wood');}
  // Open gate leaf, kept beside the entrance and away from the road.
  const gx=front+(west?-.56:.56),gz=7.08,gy=H(gx,gz);
  for(let j=0;j<5;j++)box(gx+(j-2)*.19,gy+.62,gz,.08,1.02,.08,'board');
  for(const h of [.29,.91])box(gx,gy+h,gz,1,.08,.10,'beam');
  const house=createHouse(THREE,lot,west?{w:6.4,d:6.5,stories:2,tone:'gray',ridgeAcross:false,rise:2.28}:{w:6.6,d:6.2,stories:1,tone:'cream',ridgeAcross:true,rise:1.92});g.add(house);
  // Additional timber cladding panels on the lower weather skirt of the tall home.
  if(west)for(const side of [-1,1])for(let i=0;i<22;i++)box(8-3.12+i*.297,lot.y+.78,6+side*3.27,.28,.44,.045,'board');
  function barrel(x,z,r=.43,h=.98,open=false){const y=H(x,z);const profile=[new THREE.Vector2(r*.83,0),new THREE.Vector2(r,.23*h),new THREE.Vector2(r, .73*h),new THREE.Vector2(r*.86,h),new THREE.Vector2(r*.76,h),new THREE.Vector2(r*.76,.12*h)];mesh(new THREE.LatheGeometry(profile,18),k.mats.board,x,y,z);for(let j=0;j<18;j++){const a=j*Math.PI/9;beam([x+Math.cos(a)*r*.86,y+.05,z+Math.sin(a)*r*.86],[x+Math.cos(a)*r*.87,y+h-.025,z+Math.sin(a)*r*.87],.012,'beam');}for(const u of [.14,.47,.86])ring(x,y+h*u,z,r*(u===.47?1.008:.94),.026);if(!open){cylinder(x,y+h+.009,z,r*.84,.055,'board');for(let j=-2;j<=2;j++)box(x+j*r*.28,y+h+.04,z,.013,.012,Math.sqrt(Math.max(.01,(r*.8)**2-(j*r*.28)**2))*2,'wood');}else cylinder(x,y+h*.36,z,r*.75,.015,'dark');}
  function pot(x,z,r=.28,plant=true){const y=H(x,z),p=[new THREE.Vector2(r*.6,0),new THREE.Vector2(r*.94,.13),new THREE.Vector2(r,.35),new THREE.Vector2(r*.78,.5),new THREE.Vector2(r*.7,.5),new THREE.Vector2(r*.8,.37),new THREE.Vector2(r*.72,.12)];mesh(new THREE.LatheGeometry(p,16),mats.clay,x,y,z);ring(x,y+.49,z,r*.75,.04,mats.clay);cylinder(x,y+.39,z,r*.68,.025,'soil');if(plant)for(let j=0;j<7;j++){const a=j*2.4;beam([x,y+.4,z],[x+.15*Math.cos(a),y+.7+(j%2)*.15,z+.15*Math.sin(a)],.016,'leaf');ball(x+.17*Math.cos(a),y+.68,z+.17*Math.sin(a),.12,.07,.20,'leaf');}}
  function coil(x,y,z,r=.33,turns=4,vertical=false){const pts=[];for(let i=0;i<=turns*40;i++){const a=i/40*Math.PI*2,rr=r*(.6+.4*i/(turns*40));pts.push(vertical?[x+Math.cos(a)*rr,y+Math.sin(a)*rr,z+i*.0007]:[x+Math.cos(a)*rr,y+i*.0007,z+Math.sin(a)*rr]);}curve(pts,.025);}
  function tools(x,z){const y=H(x,z);for(const dx of [-.16,.70])beam([x+dx,H(x+dx,z+.08),z+.08],[x+dx,y+1.23,z+.08],.033,'wood');beam([x-.16,y+1.19,z+.08],[x+.70,y+1.19,z+.08],.038,'wood');beam([x,y+.08,z],[x+.16,y+1.55,z+.1],.026,'wood');box(x,y+.19,z,.22,.31,.06,'dark',0,0,-.08);beam([x+.14,y+1.54,z+.1],[x+.37,y+1.54,z+.1],.029,'wood');const q=x+.48;beam([q,y+.07,z],[q-.10,y+1.65,z+.05],.025,'board');box(q,y+.15,z,.47,.055,.07,'beam');for(let i=0;i<7;i++)beam([q-.22+i*.07,y+.15,z],[q-.22+i*.07,y+.05,z+.13],.012,'dark');}
  function shed(x,z,w=2.6,d=3.1){const corners=[[-w/2,-d/2],[-w/2,d/2],[w/2,-d/2],[w/2,d/2]],floor=Math.max(...corners.map(([a,b])=>H(x+a,z+b)))+.12,top=floor+2.06,rise=.62,half=w/2+.23,rz=d/2+.24;
   // Individual masonry pads reach sampled earth; open front faces south.
   for(const [a,b] of corners){const gy=H(x+a,z+b);box(x+a,(gy+floor)/2-.07,z+b,.31,floor-gy+.2,.31,'stone');beam([x+a,floor,z+b],[x+a,top,z+b],.085,'beam');}
   for(let i=0;i<Math.ceil(w/.19);i++)box(x-w/2+(i+.5)*w/Math.ceil(w/.19),floor+.025,z,w/Math.ceil(w/.19)-.015,.09,d,'board');
   for(const side of [-1,1]){for(let j=0;j<Math.ceil(d/.23);j++)box(x+side*w/2,floor+.77,z-d/2+(j+.5)*d/Math.ceil(d/.23),.075,1.5,d/Math.ceil(d/.23)-.022,'board');beam([x+side*w/2,floor+.2,z-d/2],[x+side*w/2,top-.1,z+d/2],.047,'wood');}
   for(let j=0;j<Math.ceil(w/.22);j++)box(x-w/2+(j+.5)*w/Math.ceil(w/.22),floor+.88,z+d/2,w/Math.ceil(w/.22)-.016,1.72,.075,'board');
   for(const side of [-1,1]){box(x,top,z+side*d/2,w+.16,.14,.15,'beam');beam([x-w/2,top,z+side*d/2],[x,top+rise,z+side*d/2],.055,'wood');beam([x,top+rise,z+side*d/2],[x+w/2,top,z+side*d/2],.055,'wood');}
   const sl=Math.atan2(rise,half),len=Math.hypot(half,rise);
   for(const side of [-1,1]){box(x+side*half/2,top+rise/2,z,len,.105,2*rz,'dark',0,0,-side*sl);for(let zz=-rz;zz<=rz;zz+=.36)beam([x,top+rise-.09,z+zz],[x+side*half,top-.08,z+zz],.038,'wood');for(let row=0;row<5;row++)for(let col=0;col<Math.ceil(rz*2/.29);col++){const t=(row+.5)/5;box(x+side*half*t,top+rise*(1-t)+.09,z-rz+(col+.5)*.29,len/5+.06,.07,.276,(col+row)%4?'tile':'tile2',0,0,-side*sl);}}
   for(let zz=-rz;zz<rz;zz+=.27)beam([x,top+rise+.14,z+zz],[x,top+rise+.14,z+zz+.29],.09,'tile2');
   // Split firewood has log ends, bark and a supporting sleeper rack.
   for(const a of [-.72,.72])box(x+a,floor+.15,z+.25,.10,.18,d*.65,'beam');
   for(let layer=0;layer<4;layer++)for(let col=0;col<6-layer%2;col++){const lx=x-w*.36+col*.29+(layer%2)*.14,ly=floor+.31+layer*.23;beam([lx,ly,z-.52],[lx+.025,ly+.02,z+.74],.12,'wood');cylinder(lx,ly,z-.545,.103,.025,'board',Math.PI/2);box(lx,ly,z-.56,.012,.12,.02,'beam');}
   box(x,top-.43,z+d/2-.17,w*.75,.08,.31,'wood');for(let i=0;i<4;i++)box(x-w*.25+i*.4,top-.28,z+d/2-.17,.16,.24,.18,'board');
   tools(x+w*.33,z-d/2+.2);
  }
  function garden(x,z,w,d){const nx=Math.floor(w/.25),nz=Math.floor(d/.3);for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const px=x-w/2+(i+.5)*w/nx,pz=z-d/2+(j+.5)*d/nz;box(px,H(px,pz)+.035,pz,w/nx+.006,.13,d/nz+.006,'soil');}
   for(const side of [-1,1])for(let i=0;i<Math.ceil(w/.4);i++){const px=x-w/2+(i+.5)*w/Math.ceil(w/.4),pz=z+side*d/2;box(px,H(px,pz)+.07,pz,w/Math.ceil(w/.4)-.012,.23,.16,'stone');}
   for(const side of [-1,1])for(let i=0;i<Math.ceil(d/.4);i++){const px=x+side*w/2,pz=z-d/2+(i+.5)*d/Math.ceil(d/.4);box(px,H(px,pz)+.07,pz,.16,.23,d/Math.ceil(d/.4)-.01,'stone2');}
   for(let row=0;row<3;row++)for(let j=0;j<Math.floor(w/.49);j++){const px=x-w/2+.3+j*.49,pz=z-d*.31+row*d*.31,py=H(px,pz)+.14;for(let leaf=0;leaf<6;leaf++){const a=leaf*Math.PI/3;if(row===1)beam([px,py,pz],[px+.10*Math.cos(a),py+.48,pz+.1*Math.sin(a)],.018,'leaf');else ball(px+.095*Math.cos(a),py+.1,pz+.095*Math.sin(a),.14,.075,.18,'leaf');}if(row===2)ball(px,py+.15,pz,.1,.1,.1,'cream');}
  }
  function path(points){for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.49);for(let j=0;j<=n;j++){const x=a[0]+(b[0]-a[0])*j/n,z=a[1]+(b[1]-a[1])*j/n;if(roadClear(x,z,.28))box(x,H(x,z)+.045,z,.43,.14,.41,'stone2',0,.06*Math.sin(j),0);}}}
  function clothesline(x0,x1,z){const y0=H(x0,z)+2.47,y1=H(x1,z)+2.47;for(const x of [x0,x1]){const y=H(x,z);beam([x,y-.08,z],[x,y+2.65,z],.065,'wood');beam([x,y+.45,z],[x+(x===x0?.55:-.55),y-.02,z+.43],.033,'wood');box(x,y+2.48,z,.36,.08,.10,'beam');}
   const Y=t=>y0+(y1-y0)*t-.17*Math.sin(Math.PI*t);curve(Array.from({length:31},(_,i)=>{const t=i/30;return [x0+(x1-x0)*t,Y(t),z];}),.023);
   for(let c=0;c<5;c++){const xa=x0+.4+c*(x1-x0-.8)/5,ww=.71+(c%2)*.1,hh=.83+(c%3)*.23,verts=[],indices=[],uN=12,vN=10;for(let v=0;v<=vN;v++)for(let u=0;u<=uN;u++){const x=xa+ww*u/uN,t=(x-x0)/(x1-x0),f=v/vN;verts.push(x,Y(t)-.025-hh*f,z+.05*Math.sin(u/uN*Math.PI*5)*f+.12*Math.sin(f*2.1+c)*f);}for(let v=0;v<vN;v++)for(let u=0;u<uN;u++){const a=v*(uN+1)+u,b=a+uN+1;indices.push(a,b,a+1,b,b+1,a+1);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();mesh(geo,[mats.cloth,mats.indigo,mats.faded][c%3],0,0,0);for(const x of [xa+.04,xa+ww-.04]){const t=(x-x0)/(x1-x0);box(x,Y(t)+.02,z,.032,.13,.055,'board',0,0,.08);} // stitched hanging hem follows the folded cloth
    const hem=[];for(let u=0;u<=12;u++){const x=xa+ww*u/12,t=(x-x0)/(x1-x0);hem.push([x,Y(t)-.025-hh,z+.05*Math.sin(u/12*Math.PI*5)+.12*Math.sin(2.1+c)]);}curve(hem,.009,k.mats.rope);
   }
  }
  function tub(x,z){const y=H(x,z),r=.57;for(let i=0;i<20;i++){const a=i*Math.PI/10;box(x+r*Math.cos(a),y+.30,z+r*Math.sin(a),.165,.56,.055,'board',0,-a+Math.PI/2,0);}cylinder(x,y+.07,z,r*.97,.1,'wood');ring(x,y+.12,z,r+.015,.028);ring(x,y+.48,z,r+.015,.028);cylinder(x,y+.32,z,r*.92,.02,'dark');mesh(new THREE.CircleGeometry(r*.9,28),mats.water,x,y+.334,z,-Math.PI/2);const wz=z+.2;box(x,y+.69,wz,.46,.85,.07,'board',-.28);for(let j=0;j<12;j++)box(x,y+.32+j*.051,wz+.02+(j*.051-.37)*Math.sin(.28),.39,.018,.058,'wood',-.28);for(const dx of [-.23,.23])box(x+dx,y+.69,wz,.04,.92,.09,'beam',-.28);}
  if(west){
   wornCourt(6.8,.4,5.25,1.3);
   const stoolY=H(2.4,3.95);box(2.4,stoolY+.43,3.95,.78,.09,.42,'board');for(const dx of [-.28,.28])for(const dz of [-.13,.13])box(2.4+dx,stoolY+.21,3.95+dz,.065,.42,.065,'wood');
   shed(2.2,10.9,2.45,3.1);garden(7.85,11.65,5.35,1.65);
   clothesline(4.35,10.8,-.30);clothesline(4.35,10.8,1.13);
   tub(2.25,1.6);tub(3.5,-.1);barrel(2.2,3.1,.4,.92,true);barrel(12.25,9.2,.36,.91);pot(12.25,3.65);pot(11.95,2.8,.24,false);pot(4.15,11.75,.28);tools(1.2,8.25);
   path([[12.3,6],[12.3,1.7],[11.35,.5]]);path([[12.25,7.3],[12.25,11.5],[10.8,11.5]]);path([[2.7,4.5],[2.7,7.6],[2.7,8.65]]);
   // A modest pruned pine: bent trunk, visible branches and flattened needle pads.
   const x=1.8,z=5.85,y=H(x,z);curve([[x,y-.1,z],[x+.13,y+1,z],[x-.15,y+2,z+.1],[x+.15,y+2.9,z+.12]],.095,k.mats.beam);
   for(let j=0;j<6;j++){const a=j*2.4,hy=y+1.35+j*.26,rr=.69+(j%2)*.18,ex=x+Math.cos(a)*rr,ez=z+Math.sin(a)*rr;beam([x,hy-.2,z],[ex,hy+.12,ez],.043,'wood');for(let c=0;c<5;c++){const b=c*2.4;ball(ex+.26*Math.cos(b),hy+.16+.06*(c%2),ez+.25*Math.sin(b),.42,.17,.35,'leaf');}}ball(x+.12,y+3.03,z+.1,.52,.22,.46,'leaf');
   // Stone lantern at the gate, with a hollow lit chamber and ceramic-style hip cap.
   const lx=12.4,lz=7.95,ly=H(lx,lz);box(lx,ly+.10,lz,.67,.2,.65,'stone');cylinder(lx,ly+.51,lz,.15,.68,'stone2');box(lx,ly+.90,lz,.47,.14,.47,'stone');for(const a of [-.17,.17])for(const b of [-.17,.17])box(lx+a,ly+1.18,lz+b,.065,.47,.065,'stone2');box(lx,ly+1.16,lz,.23,.28,.23,'cream');mesh(new THREE.ConeGeometry(.51,.27,4),k.mats.stone,lx,ly+1.54,lz,0,Math.PI/4);ball(lx,ly+1.75,lz,.09,.12,.09,'stone2');
  }else{
   wornCourt(24,.45,4.45,1.25);
   shed(29.55,10.95,2.8,2.9);garden(23.1,11.65,5.15,1.7);barrel(28.35,8.45);barrel(30.35,8.4,.36,.84);pot(18.45,3.4);pot(18.65,2.65,.23,false);pot(27.4,11.65);tools(30.35,6.7);
   path([[18.65,6],[18.65,1],[20,.75]]);path([[18.5,7.3],[18.5,11.5],[20,11.5]]);path([[27.9,2.1],[29.05,5],[29.1,8.9]]);
   // Long slatted ropewalk table with stretchers and three independently supported winding hooks.
   const bx=23.5,bz=.45,L=5.75,top=Math.max(H(bx-L/2,bz),H(bx+L/2,bz))+.91;
   for(const dx of [-L/2+.22,L/2-.22])for(const dz of [-.34,.34]){const y=H(bx+dx,bz+dz);box(bx+dx,(y+top)/2,bz+dz,.13,top-y,.13,'beam');}
   for(let j=0;j<5;j++)box(bx,top,bz-.38+j*.19,L,.10,.175,'board');for(const z of [bz-.33,bz+.33])beam([bx-L/2+.2,top-.54,z],[bx+L/2-.2,top-.54,z],.055,'wood');
   for(const end of [-1,1]){const x=bx+end*(L/2-.18);box(x,top+.45,bz,.12,.86,.86,'beam');for(let j=0;j<3;j++){const z=bz-.25+j*.25;beam([x,top+.5,z],[x-end*.25,top+.5,z],.03,'dark');ring(x-end*.25,top+.50,z,.08,.017,mats.iron,0);}}
   for(let strand=0;strand<3;strand++){const pts=[];for(let i=0;i<=80;i++){const t=i/80;pts.push([bx-L/2+.49+t*(L-.98),top+.5-.075*Math.sin(Math.PI*t)+.021*Math.sin(t*52+strand*2.094),bz+.025*Math.cos(t*52+strand*2.094)]);}curve(pts,.023);}
   const cx=bx-L/2+.17;beam([cx-.15,top+.5,bz],[cx-.46,top+.5,bz],.042,'dark');beam([cx-.46,top+.5,bz],[cx-.46,top+.78,bz],.033,'dark');beam([cx-.46,top+.78,bz],[cx-.65,top+.78,bz],.045,'board');coil(bx+1.28,top+.10,bz+.06,.29,4);coil(27.3,H(27.3,.7)+.08,.7,.39,5);box(bx-.5,top+.12,bz-.26,.49,.10,.19,'wood');for(let j=0;j<5;j++)cylinder(bx-.69+j*.095,top+.25,bz-.26,.02,.22,'board');
   // Float rack: tied cork and blue-glass floats under a supported horizontal rail.
   const fx=29.8,z0=2.1,z1=5.9,fy=Math.max(H(fx,z0),H(fx,z1))+2.0;for(const z of [z0,z1]){const y=H(fx,z);beam([fx,y-.04,z],[fx,fy+.08,z],.075,'wood');beam([fx,y+.7,z],[fx-.4,y,z+.2],.035,'wood');}beam([fx,fy,z0],[fx,fy,z1],.062,'beam');
   for(let j=0;j<9;j++){const z=z0+.25+j*.41,yy=fy-.4-(j%3)*.19;curve([[fx,fy,z],[fx-.015,yy+.17,z],[fx,yy,z]],.018);ball(fx,yy,z,.145,.18,.145,j%3===0?'glass':'board');ring(fx,yy,z,.153,.018,k.mats.rope);curve([[fx-.15,yy,z],[fx,yy+.18,z],[fx+.15,yy,z],[fx,yy-.18,z],[fx-.15,yy,z]],.014);}
   for(let j=0;j<3;j++){const z=z0+.6+j*1.05;coil(fx-.01,fy-.65,z,.30,3,true);curve([[fx-.02,fy-.37,z+.065],[fx-.06,fy+.015,z+.025],[fx+.06,fy+.015,z+.025],[fx+.02,fy-.37,z+.065]],.019);}
  }
  k.flush();g.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(g);g.userData={id:g.name,lot:lot.id,bbox:[...bounds.min.toArray(),...bounds.max.toArray()]};out.add(g);
 }
 return out;
}
