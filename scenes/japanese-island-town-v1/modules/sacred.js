import { heightAt, layout, roadNetwork } from './root.js';

export function build(THREE, ctx) {
 const g=new THREE.Group();g.name='sacred-temple-and-shore-torii';
 const L=layout(), roads=roadNetwork(), base=L.temple.y+.08;
 const C={wood:0x71472d,dark:0x463427,red:0xa94a31,cream:0xe3d3af,roof:0x404c53,tile:0x637077,stone:0x989b8b,gravel:0xc8c1a8,gold:0xbfa05c,green:0x435f40};
 const mats=new Map();function mat(c){if(!mats.has(c))mats.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.87}));return mats.get(c)}
 function mesh(geo,c,x,y,z){const m=new THREE.Mesh(geo,mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m}
 const box=(x,y,z,w,h,d,c)=>mesh(new THREE.BoxGeometry(w,h,d),c,x,y,z);
 const cyl=(x,y,z,r,h,c,rt=r)=>mesh(new THREE.CylinderGeometry(rt,r,h,10),c,x,y,z);
 function beam(a,b,r,c){const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a)),m=cyl(...a,r,v.length(),c);m.position.addScaledVector(v,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m}
 function rock(x,y,z,s,c=C.stone){const m=mesh(new THREE.DodecahedronGeometry(s,0),c,x,y,z);m.scale.set(1,.65,.8);m.rotation.set(.1,x,.15);return m}
 // Closed hipped roofs with concave slopes, raised corners, continuous hips and tile joints.
 function roof(x,y,z,w,d,h,ridge=true){
  const top=ridge?w*.25:0;
  const corners=[[-1,-1],[1,-1],[1,1],[-1,1]];
  function p(side,u,t){const a=corners[side],b=corners[(side+1)%4],xx=a[0]+(b[0]-a[0])*u,zz=a[1]+(b[1]-a[1])*u;
   return [x+xx*(w*.5*(1-t)+top*t),y+h*Math.pow(t,1.65)+.40*Math.pow(1-t,8)+.27*Math.pow(Math.abs(xx*zz),4)*Math.pow(1-t,3),z+zz*d*.5*(1-t)];}
  const vertices=[],indices=[],lines=[];
  for(let side=0;side<4;side++) {const off=vertices.length/3,n=side%2?Math.ceil(d/.65):Math.ceil(w/.65),m=10;
   for(let j=0;j<=m;j++)for(let i=0;i<=n;i++)vertices.push(...p(side,i/n,j/m));
   for(let j=0;j<m;j++)for(let i=0;i<n;i++){let a=off+j*(n+1)+i;indices.push(a,a+1,a+n+1,a+1,a+n+2,a+n+1);}
   for(let i=0;i<=n;i++)for(let j=0;j<m;j++){let a=p(side,i/n,j/m),b=p(side,i/n,(j+1)/m);a[1]+=.025;b[1]+=.025;lines.push(...a,...b)}
   for(let j=0;j<m;j++)for(let i=0;i<n;i++){let a=p(side,i/n,j/m),b=p(side,(i+1)/n,j/m);a[1]+=.028;b[1]+=.028;lines.push(...a,...b)}
   for(let i=0;i<10;i++){let a=p(side,i/10,0),b=p(side,(i+1)/10,0);beam(a,b,.13,C.roof);}
   for(let j=0;j<10;j++)beam(p(side,0,j/10),p(side,0,(j+1)/10),.095,C.tile);
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const m=mesh(geo,C.roof,0,0,0);m.material=mat(C.roof).clone();m.material.side=THREE.DoubleSide;
  const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(lines,3));g.add(new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:C.tile,transparent:true,opacity:.54})));
  box(x,y+.12,z,w-.3,.24,d-.3,C.dark);
  if(ridge){beam([x-top-.35,y+h+.12,z],[x+top+.35,y+h+.12,z],.20,C.tile);for(let s of [-1,1])beam([x+s*top,y+h,z],[x+s*(top+.55),y+h+.58,z],.15,C.tile)}
 }
 function stairs(x,z,w,top,count=5,depth=.48){for(let i=0;i<count;i++)box(x,top-(count-i)*.18,z+i*depth,w,.3,depth+.04,C.stone)}
 function lantern(x,z,y=base,s=1){box(x,y+.12*s,z,.95*s,.24*s,.95*s,C.stone);cyl(x,y+.65*s,z,.20*s,1.1*s,C.stone);box(x,y+1.23*s,z,.8*s,.20*s,.8*s,C.stone);box(x,y+1.56*s,z,.6*s,.55*s,.6*s,C.dark);for(let a of [-1,1]){box(x+a*.31*s,y+1.57*s,z,.06*s,.33*s,.38*s,C.cream);box(x,y+1.57*s,z+a*.31*s,.38*s,.33*s,.06*s,C.cream)}roof(x,y+1.84*s,z,1.35*s,1.35*s,.35*s,false);cyl(x,y+2.34*s,z,.14*s,.3*s,C.stone,0);}
 function cherry(x,z,s=1){const y=base;beam([x,y,z],[x+.3*s,y+3.8*s,z],.23*s,C.dark);for(let i=0;i<7;i++){let a=i*2.399,xx=x+Math.cos(a)*1.6*s,zz=z+Math.sin(a)*1.5*s,yy=y+(3.2+(i%3)*.55)*s;beam([x+.15*s,y+2.2*s,z],[xx,yy,zz],.10*s,C.wood);const m=mesh(new THREE.IcosahedronGeometry(1.55*s,1),i%2?0xe5b2b5:0xf1c7c3,xx,yy+.55*s,zz);m.scale.y=.8}for(let i=0;i<14;i++){let a=i*2.4,r=(i%5)*.47;box(x+Math.cos(a)*r,y+.10,z+Math.sin(a)*r,.12,.025,.16,0xe8b9bf)}}
 function pine(x,z,s=1,y=base){beam([x,y,z],[x+.5*s,y+4.5*s,z],.23*s,C.dark);for(let i=0;i<6;i++){let a=i*2.4,xx=x+Math.cos(a)*(i%2?1.8:1.1)*s,zz=z+Math.sin(a)*1.5*s,yy=y+(2.4+i*.45)*s;beam([x+.3*s,y+2*s,z],[xx,yy,zz],.12*s,C.wood);let m=mesh(new THREE.IcosahedronGeometry(1.5*s,1),i%2?0x3e6044:0x526f49,xx,yy,zz);m.scale.set(1.3,.38,1)}}
 function panelWall(x,y,z,w,h,d){box(x,y+h/2,z,w,h,d,C.cream);if(w>d){for(let xx=x-w/2;xx<=x+w/2+.1;xx+=2)box(xx,y+h/2,z,.18,h+.1,d+.08,C.wood);for(let yy of [y+.2,y+h-.2])box(x,yy,z,w,.18,d+.1,C.wood)}else{for(let zz=z-d/2;zz<=z+d/2+.1;zz+=2)box(x,y+h/2,zz,w+.08,h+.1,.18,C.wood);for(let yy of [y+.2,y+h-.2])box(x,yy,z,w+.1,.18,d,C.wood)}}
 function shoji(x,y,z,w,h,side=false){box(x,y,z,side?.10:w,h,side?w:.10,C.cream);for(let i=0;i<=4;i++){let off=(i/4-.5)*w;box(x+(side?0:off),y,z+(side?off:0),side?.15:.055,h,side?.055:.15,C.dark)}for(let i=0;i<=4;i++)box(x,y+(i/4-.5)*h,z,side?.16:w,.045,side?w:.16,C.dark)}
 // Main hall: stone plinth, raised plank veranda, four framed walls and full roof.
 const hx=-39,hz=63,hy=base+1.0;
 box(hx,base+.3,hz,20,.6,14,C.stone);box(hx,hy-.17,hz,20,.34,14,C.dark);
 for(let i=0;i<47;i++)box(hx-9.8+i*.42,hy+.02,hz,.39,.13,13.8, i%3?0x936e46:0x87603d);
 panelWall(hx,hy,hz-4.7,16,4.9,.25);panelWall(hx,hy,hz+4.7,16,4.9,.25);panelWall(hx-8,hy,hz,.25,4.9,9.4);panelWall(hx+8,hy,hz,.25,4.9,9.4);
 for(let xx of [-47,-43,-39,-35,-31])for(let zz of [hz-5.9,hz+5.9]){cyl(xx,hy+2.5,zz,.23,5,C.wood);box(xx,hy+4.9,zz,1.2,.24,.8,C.wood);box(xx,hy+5.15,zz,.7,.22,1.1,C.wood)}
 for(let xx of [-45,-41,-37,-33])for(let zz of [hz-4.86,hz+4.86])shoji(xx,hy+2.4,zz,2.9,3.9);
 for(let xx of [hx-8.16,hx+8.16])for(let zz of [hz-2.7,hz+.7,hz+3])shoji(xx,hy+2.5,zz,1.8,3.3,true);
 for(let zz of [hz-5.9,hz+5.9])box(hx,hy+4.6,zz,18,.35,.35,C.red);
 roof(hx,hy+5.2,hz,23,17,4.8,true);roof(hx,hy+3.7,hz-6.5,7,4,1.6,true);
 box(hx,hy+3.15,hz-4.99,1.8,.65,.15,C.dark);box(hx,hy+3.15,hz-5.1,.8,.36,.04,C.gold);
 stairs(hx,hz-9.3,5,hy+.10,5,.45);
 // Five-storey pagoda, diminishing tiers, visible bracket sets and continuous interior shaft.
 const px=-60,pz=63,pb=base+.7;
 box(px,base+.25,pz,12,.5,12,C.stone);box(px,pb-.12,pz,10.6,.3,10.6,C.dark);
 for(let level=0;level<5;level++){
  const yy=pb+level*4.15,w=7.9-level*.81,depth=w;
  box(px,yy+1.55,pz,w,3.1,depth,C.cream);
  for(let a of [-1,1])for(let b of [-1,1]){box(px+a*(w/2-.15),yy+1.75,pz+b*(w/2-.15),.30,3.5,.30,C.red);box(px+a*(w/2),yy+3.1,pz+b*(w/2),1,.25,.8,C.wood);}
  for(let s of [-1,1]){box(px,yy+.28,pz+s*w/2,w+.25,.28,.22,C.wood);box(px+s*w/2,yy+.28,pz,.22,.28,w+.25,C.wood);box(px,yy+2.9,pz+s*w/2,w+.4,.24,.25,C.wood);box(px+s*w/2,yy+2.9,pz,.25,.24,w+.4,C.wood);shoji(px,yy+1.75,pz+s*(w/2+.08),w*.45,2);shoji(px+s*(w/2+.08),yy+1.75,pz,w*.45,2,true);
   for(let k=-1;k<=1;k++){box(px+k*w*.32,yy+3.25,pz+s*w*.52,.7,.22,1.05,C.red);box(px+s*w*.52,yy+3.25,pz+k*w*.32,1.05,.22,.7,C.red);}}
  roof(px,yy+3.25,pz,w+4.0,depth+4.0,2.25,false);
  if(level>0)for(let s of [-1,1]){box(px,yy+.35,pz+s*(w*.5+.35),w+1,.12,.12,C.red);box(px+s*(w*.5+.35),yy+.35,pz,.12,.12,w+1,C.red)}
 }
 const fy=pb+4*4.15+5.5;
 cyl(px,fy+1.9,pz,.105,4.1,C.gold);for(let i=0;i<9;i++){let m=mesh(new THREE.TorusGeometry(.56-i*.038,.065,6,18),C.gold,px,fy+.35+i*.32,pz);m.rotation.x=Math.PI/2}cyl(px,fy+4.35,pz,.27,.6,C.gold,0);stairs(px,pz-7.0,3,pb,4,.4);
 // Entry gate and courtyard enclosure, with open circulation from both hill roads.
 const gx=-46,gz=37;
 for(let s of [-1,1])for(let dz of [-.7,.7]){box(gx+s*3,base+.15,gz+dz,.85,.3,.85,C.stone);cyl(gx+s*3,base+2.4,gz+dz,.27,4.5,C.red)}
 box(gx,base+4.4,gz,7.3,.48,1.8,C.wood);roof(gx,base+4.65,gz,10,5,2.3,true);
 for(let side of [-1,1]){box(gx+side*2.25,base+2.1,gz,.7,3.8,.20,C.wood);for(let k=0;k<3;k++)box(gx+side*2.25,base+.8+k*1.1,gz-.13,.65,.12,.12,C.gold)}
 box(gx,base+3.6,gz-.99,1.6,.65,.18,C.dark);box(gx,base+3.6,gz-1.1,.75,.37,.04,C.gold);
 for(let x of [-69,-23]){panelWall(x,base,59,.34,1.5,29);roof(x,base+1.5,59,1.25,30,.35,true)}
 panelWall(-46,base,74,45,1.5,.34);roof(-46,base+1.5,74,46,1.3,.35,true);
 // Pale gravel and jointed flagstone paths. All garden voids intentional and registered.
 box(-46,base+.035,46,38,.07,16,C.gravel);
 for(let x=-63;x<=-28;x+=1.7)for(let z of [40.5,42.2])box(x,base+.14,z,1.6,.15,1.6,((Math.round(x*10)+Math.round(z*10))%3)?0xa6a897:0xb4b4a0);
 for(let z=37;z<55;z+=1.6)for(let x of [-47,-45])box(x,base+.17,z,1.85,.14,1.5,C.stone);
 for(let z=44;z<57;z+=1.5)box(-60,base+.14,z,2.7,.12,1.4,C.stone);
 for(let xx of [-61,-26])stairs(xx,32.2,3.4,base+.38,3,.4);
 // A shallow saddle step clears the root-owned western retaining curb.
 box(-61,base+.52,33.05,3.4,.22,1.05,C.stone);
 box(-61,base+.34,33.86,3.4,.22,.55,C.stone);
 box(-61,base+.19,34.4,3.4,.20,.54,C.stone);
 // Enclosed raked gravel garden and moss islands east of processional route.
 box(-32,base+.1,47.6,9,.12,9.5,0xd4cdb5);
 for(let i=0;i<20;i++)box(-32,base+.172,43.2+i*.45,8.5,.018,.035,0xb5af98);
 for(let [x,z,s] of [[-33,48,1.35],[-30,46,.8],[-35,45,.6]]){let m=cyl(x,base+.14,z,s*1.5,.12,0x7a8655);m.scale.z=.75;rock(x,base+s*.43,z,s)}
 for(let x of [-37,-27])for(let z=43;z<=52;z+=.85)box(x,base+.28,z,.16,.45,.08,C.wood);
 for(let x of [-37,-27])for(let y of [base+.3,base+.6])box(x,y,47.5,.10,.07,9.5,C.wood);
 for(let [x,z] of [[-51,43],[-41,43],[-52,53],[-41,53],[-65,55],[-55,55]])lantern(x,z,base,1.1);
 cherry(-64,47,1.2);cherry(-52,70,.9);cherry(-27,56,1);pine(-66,71,.9);pine(-27,70,.9);pine(-55,48,.75);
 // Purification basin with four timber supports and a small complete shelter.
 box(-53,base+.55,38.5,2.4,1.0,1.35,C.stone);box(-53,base+1.06,38.5,1.9,.06,.94,0x718f89);beam([-54,base+1.2,38.5],[-52,base+1.2,38.5],.075,0xbba16d);
 for(let x of [-54.5,-51.5])for(let z of [37.5,39.5])cyl(x,base+1.5,z,.10,3,C.wood);roof(-53,base+3,38.5,4.2,3.2,1.0,true);
 // Shore torii. Footings reach terrain separately; crossbeam remains horizontal.
 const [tx,tz]=L.torii.center,ty=L.torii.y;
 for(let s of [-1,1]){const x=tx+s*3.9,gy=heightAt(x,tz);cyl(x,gy+.15,tz,.85,.6,C.stone);cyl(x,ty+3.8,tz,.48,7.6,C.red,.39);cyl(x,gy+.65,tz,.52,.75,C.dark);for(let dz of [-1.05,1.05]){let yy=heightAt(x,tz+dz);box(x,yy+.18,tz+dz,.85,.36,.9,C.stone);beam([x,yy+.3,tz+dz],[x,ty+2.5,tz],.16,C.red)}}
 box(tx,ty+5.6,tz,10.2,.47,.55,C.red);box(tx,ty+7.3,tz,11.4,.5,.83,C.red);box(tx,ty+6.5,tz,.48,1.45,.48,C.red);
 const cap=[];for(let i=0;i<=20;i++){let xx=-6.2+i*.62;cap.push([tx+xx,ty+7.7+.6*Math.pow(Math.abs(xx)/6.2,3),tz])}for(let i=0;i<20;i++){beam(cap[i],cap[i+1],.26,C.dark);beam([cap[i][0],cap[i][1]-.3,tz],[cap[i+1][0],cap[i+1][1]-.3,tz],.17,C.red)}
 box(tx,ty+6.47,tz-.33,1.08,1.32,.16,C.dark);box(tx,ty+6.47,tz-.43,.65,.91,.04,C.gold);
 for(let i=0;i<6;i++){let z=tz-2+i*.92,x=tx+(i>2?(i-2)*.7:0);box(x,heightAt(x,z)+.15,z,2.8,.27,.87,C.stone)}
 for(let s of [-1,1])lantern(tx+s*3.6,tz+3.4,heightAt(tx+s*3.6,tz+3.4),1.2);
 pine(tx-5.5,tz+3.8,.65,heightAt(tx-5.5,tz+3.8));
 // Retain shared route identity on the returned group for composition diagnostics.
 g.userData.sharedRoutes=roads.filter(r=>['upper','hill','shore'].includes(r.id)).map(r=>r.id);
 return g;
}
