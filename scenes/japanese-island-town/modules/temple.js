import { heightAt, layout } from './root.js';

export function build(THREE, ctx) {
 const group=new THREE.Group();group.name='Temple — hall, five-tier pagoda and garden precinct';
 const L=layout().temple,Y=L.padY;
 const materials={};
 const mat=(name,color)=>materials[name]=new THREE.MeshStandardMaterial({color,roughness:.87});
 const wood=mat('wood','#71503a'),dark=mat('dark','#342b26'),light=mat('lightwood','#aa8053'),red=mat('red','#8e4334'),plaster=mat('plaster','#d9d0b6'),paper=mat('paper','#bcb89f'),roof=mat('roof','#505e66'),tile=mat('tile','#64747a'),stone=mat('stone','#80867c'),stone2=mat('stone2','#98988a'),gravel=mat('gravel','#b0ac96'),moss=mat('moss','#677b4d'),green=mat('green','#355740'),green2=mat('green2','#48694a'),pink=mat('pink','#d9a5b0'),pink2=mat('pink2','#e7bac1'),bronze=mat('bronze','#68786a'),gold=mat('gold','#b39b5e'),black=mat('black','#222925');
 const bins=new Map();
 function mesh(geo,m,x=0,y=0,z=0,rx=0,ry=0,rz=0){const ob=new THREE.Mesh(geo,m);ob.position.set(x,y,z);ob.rotation.set(rx,ry,rz);if(!bins.has(m))bins.set(m,[]);bins.get(m).push(ob);return ob;}
 function box(x,y,z,w,h,d,m=wood){return mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z);}
 function cyl(x,y,z,rt,rb,h,m=wood,n=10){return mesh(new THREE.CylinderGeometry(rt,rb,h,n),m,x,y,z);}
 function ball(x,y,z,r,m,sx=1,sy=1,sz=1){const b=mesh(new THREE.IcosahedronGeometry(r,1),m,x,y,z);b.scale.set(sx,sy,sz);return b;}
 function beam(a,b,r,m=wood,n=7){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.clone().sub(av);const ob=mesh(new THREE.CylinderGeometry(r,r,d.length(),n),m,...av.clone().add(bv).multiplyScalar(.5).toArray());ob.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return ob;}
 function patch(vertices,m){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.computeVertexNormals();return mesh(geo,m);}
 // A complete curved hip roof. Four slopes, raised ceramic ribs, transverse courses,
 // hip caps, eave fascia and a capped ridge all share one parameterization.
 function hip(x,y,z,w,d,h,ridge=0){
  const corners=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]];
  const tops=[[-ridge/2,0],[ridge/2,0],[ridge/2,0],[-ridge/2,0]];
  function point(side,u,t){const a=corners[side],b=corners[(side+1)%4],c=tops[side],e=tops[(side+1)%4];const px=(c[0]+(e[0]-c[0])*u)*(1-t)+(a[0]+(b[0]-a[0])*u)*t,pz=(c[1]+(e[1]-c[1])*u)*(1-t)+(a[1]+(b[1]-a[1])*u)*t;return [x+px,y+h*Math.pow(1-t,1.7)+.3*Math.pow(t,8)+.19*Math.pow(Math.abs(u-.5)*2,6)*t*t,z+pz];}
  for(let s=0;s<4;s++){
   const vs=[];for(let j=0;j<12;j++)for(let k=0;k<12;k++){let a=point(s,k/12,j/12),b=point(s,(k+1)/12,j/12),c=point(s,k/12,(j+1)/12),d1=point(s,(k+1)/12,(j+1)/12);vs.push(...a,...c,...b,...b,...c,...d1);}
   const ob=patch(vs,roof);ob.material.side=THREE.DoubleSide;
   const count=Math.ceil((s%2?d:w)/.48);
   for(let k=0;k<=count;k++)for(let j=0;j<10;j++){let a=point(s,k/count,j/10),b=point(s,k/count,(j+1)/10);a[1]+=.07;b[1]+=.07;beam(a,b,.065,tile,5);}
   for(let j=2;j<=10;j++){let a=point(s,0,j/10),b=point(s,1,j/10);a[1]+=.075;b[1]+=.075;beam(a,b,.042,tile,5);}
   for(let j=0;j<12;j++){let a=point(s,0,j/12),b=point(s,0,(j+1)/12);a[1]+=.1;b[1]+=.1;beam(a,b,.12,tile,8);}
   for(let k=0;k<count;k++){const p=point(s,(k+.5)/count,1);ball(p[0],p[1],p[2],.10,tile);}
   beam(point(s,0,1),point(s,1,1),.14,dark);
  }
  beam([x-ridge/2,y+h+.13,z],[x+ridge/2+.001,y+h+.13,z],.2,tile);
  for(const s of [-1,1]){box(x+s*(ridge/2+.08),y+h+.22,z,.24,.48,.42,tile);ball(x+s*(ridge/2+.1),y+h+.52,z,.22,tile,.7,1,1);}
 }
 function foundation(x,z,w,d,top){let lo=Infinity;for(const dx of [-w/2,0,w/2])for(const dz of [-d/2,0,d/2])lo=Math.min(lo,heightAt(x+dx,z+dz));box(x,(lo+top)/2-.12,z,w,top-lo+.24,d,stone);for(let zz=z-d/2;zz<=z+d/2+.01;zz+=d)for(let row=0;row<3;row++)for(let xx=x-w/2+.45;xx<x+w/2;xx+=.95)box(xx,top-.2-row*.32,zz,.87,.27,.10,(row+Math.floor(xx))%2?stone:stone2);box(x,top+.08,z,w+.25,.16,d+.25,stone2);}
 function bracket(x,y,z,s=1){for(let j=0;j<3;j++){box(x,y+j*.20*s,z,(.75+j*.27)*s,.19*s,.35*s,wood);box(x,y+j*.20*s,z,.35*s,.19*s,(.75+j*.27)*s,wood);}box(x,y-.2*s,z,.38*s,.4*s,.38*s,light);}
 function stairs(x,z,w,top,n=5,dir=1){const base=Y+.1,step=(top-base)/n;for(let i=0;i<n;i++)box(x,base+(i+1)*step/2,z+dir*i*.42,w,(i+1)*step,.44,stone2);}
 function rail(x,z,w,d,y,entry=false){for(const side of [-1,1]){for(let xx=-w/2;xx<=w/2+.01;xx+=w/6){if(!(entry&&side===-1&&Math.abs(xx)<1.25))box(x+xx,y+.48,z+side*d/2,.13,.96,.13,red);}if(entry&&side===-1){for(const q of [-1,1]){box(x+q*(w/4+.6),y+.88,z+side*d/2,w/2-1.2,.13,.16,red);box(x+q*(w/4+.6),y+.35,z+side*d/2,w/2-1.2,.10,.12,red);}}else{box(x,y+.88,z+side*d/2,w+.2,.13,.16,red);box(x,y+.35,z+side*d/2,w,.10,.12,red);}for(let zz=-d/2;zz<=d/2+.01;zz+=d/5)box(x+side*w/2,y+.48,z+zz,.13,.96,.13,red);box(x+side*w/2,y+.88,z,.16,.13,d,red);box(x+side*w/2,y+.35,z,.12,.1,d,red);}}
 // Gravel precinct and grid of individually jointed approach flags.
 box(-35.5,Y+.035,55.5,50.4,.13,44.4,gravel);
 function paving(x,z,w,d){const nx=Math.ceil(w/1.1),nz=Math.ceil(d/1.35);for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)box(x-w/2+(i+.5)*w/nx,Y+.145,z-d/2+(j+.5)*d/nz,w/nx-.055,.12,d/nz-.055,(i+j)%4?stone2:stone);}
 paving(-48,46,7,3.5);paving(-44,42,4.5,19);paving(-33,46,26,3.5);paving(-27,51,3,11);paving(-59,51,2.6,13);paving(-53,45,12,2.7);paving(-39,68,35,2.5);
 for(let i=0;i<280;i++){const x=-59+((i*197)%480)/10,z=35+((i*79)%410)/10;if((Math.abs(x+48)<10.5&&Math.abs(z-57)<9)||(Math.abs(x+27)<7&&Math.abs(z-58)<7))continue;ball(x,Y+.14,z,.055+(i%3)*.02,i%3?stone2:stone,1,.4,1);}
 // Main hall, with complete walls, open worship bay, veranda and cypress joinery.
 const [hx,hz]=L.hall,F=Y+1.25;
 foundation(hx,hz,18,14,F-.12);box(hx,F,hz,18,.18,14,dark);
 for(let i=0;i<46;i++)box(hx-8.8+i*.39,F+.12,hz,.36,.15,13.8,wood);
 box(hx,F+2.2,hz,15.2,4.3,10.6,plaster);
 // timber boarding rear and sides, plus shoji windows on all elevations.
 for(const side of [-1,1]){
  for(let zz=-4.9;zz<5.2;zz+=.35)box(hx+side*7.64,F+1.1,hz+zz,.1,2,.30,wood);
  for(let xx=-7.2;xx<7.4;xx+=.4)box(hx+xx,F+.9,hz+side*5.34,.35,1.7,.1,wood);
  for(let xx=-7.4;xx<=7.5;xx+=3.7){cyl(hx+xx,F+2.6,hz+side*6.2,.20,.23,5.2,wood);bracket(hx+xx,F+4.85,hz+side*6.2);}
  for(let zz=-3.1;zz<=3.2;zz+=3.1){cyl(hx+side*8,F+2.6,hz+zz,.2,.23,5.2,wood);bracket(hx+side*8,F+4.85,hz+zz);}
  box(hx,F+4.5,hz+side*5.45,15.6,.28,.26,wood);box(hx+side*7.7,F+4.5,hz,.27,.28,11,wood);
 }
 function screen(x,y,z,w,h,rot=0){const b=box(x,y,z,w,h,.11,paper);b.rotation.y=rot;const horizontal=new THREE.Vector3(Math.cos(rot),0,-Math.sin(rot));for(let i=0;i<=Math.ceil(w/.28);i++){let q=-w/2+i*w/Math.ceil(w/.28);const b1=box(x+horizontal.x*q,y,z+horizontal.z*q,.045,h,.16,wood);b1.rotation.y=rot;}for(let j=0;j<=5;j++){const b1=box(x,y-h/2+j*h/5,z,w,.045,.16,wood);b1.rotation.y=rot;}}
 for(const xx of [-5.55,-3.7,3.7,5.55])screen(hx+xx,F+2.6,hz-5.43,1.65,2.6);
 for(const xx of [-5.5,-1.85,1.85,5.5])screen(hx+xx,F+2.6,hz+5.43,2.8,2.5);
 for(const side of [-1,1])for(const zz of [-3.2,0,3.2])screen(hx+side*7.73,F+2.6,hz+zz,2.25,2.5,Math.PI/2);
 box(hx,F+2.1,hz-5.45,3.4,3.9,.13,dark);box(hx,F+.55,hz-5.7,2.6,.7,.55,light);for(let i=0;i<10;i++)box(hx-1.15+i*.25,F+.94,hz-5.7,.10,.08,.48,dark);
 // Visible altar and gold devotional silhouette in the entrance shadow.
 box(hx,F+1.15,hz-5.56,1.55,.3,.26,red);ball(hx,F+2.28,hz-5.59,.26,gold);cyl(hx,F+1.83,hz-5.6,.15,.38,.65,gold);ball(hx,F+1.56,hz-5.6,.44,gold,1,.32,.5);
 box(hx,F+4.18,hz-5.66,1.1,.67,.12,dark);for(let i=0;i<3;i++)box(hx,F+4.34-i*.17,hz-5.75,.35-i*.04,.045,.03,gold);
 for(const xx of [-1.3,1.3])beam([hx+xx,F+4.3,hz-6.4],[hx+xx,F+1.1,hz-6.4],.06,light);
 stairs(hx,hz-9,5,F,5,1);
 for(const side of [-1,1]){box(hx+side*5.8,F+.85,hz-6.65,5.4,.15,.15,wood);for(let k=0;k<7;k++)box(hx+side*5.8-2.55+k*.85,F+.44,hz-6.65,.1,.85,.1,wood);}
 box(hx,F+4.85,hz,15.2,1.1,10.6,plaster);box(hx,F+5.25,hz,19.6,.16,15.6,dark);
 for(const side of [-1,1]){box(hx,F+5.05,hz+side*5.35,15.5,.23,.19,wood);box(hx+side*7.7,F+5.05,hz,.19,.23,10.9,wood);}
 hip(hx,F+5.3,hz,21,17,4.4,9);
 // Main entry porch, brackets and smaller projecting roof.
 for(const dx of [-2.6,2.6]){cyl(hx+dx,F+2.0,hz-7.8,.17,.20,4,wood);bracket(hx+dx,F+3.75,hz-7.8,.8);}
 hip(hx,F+4.35,hz-6.5,6.7,5.8,1.35,2.3);
 // Pagoda: five fully sided timber stages with decreasing tile roofs and galleries.
 const [px,pz]=L.pagoda;foundation(px,pz,10.7,10.7,Y+.9);stairs(px,pz-7.1,3.8,Y+1,4,1);
 for(let tier=0;tier<5;tier++){
  const w=7.7-tier*.9,b=Y+1+tier*4.35;
  box(px,b+.14,pz,w+1.3,.28,w+1.3,dark);box(px,b+1.6,pz,w,2.9,w,red);
  for(const side of [-1,1]){for(const q of [-.5,0,.5]){const o=q*(w-.35);box(px+o,b+1.55,pz+side*(w/2+.04),.22,3.1,.25,dark);box(px+side*(w/2+.04),b+1.55,pz+o,.25,3.1,.22,dark);bracket(px+o,b+2.8,pz+side*w/2,.7);bracket(px+side*w/2,b+2.8,pz+o,.7);}screen(px,b+1.65,pz+side*(w/2+.14),w*.32,1.5);screen(px+side*(w/2+.14),b+1.65,pz,w*.32,1.5,Math.PI/2);box(px,b+2.6,pz+side*w/2,w,.17,.17,light);box(px+side*w/2,b+2.6,pz,.17,.17,w,light);}
  rail(px,pz,w+.7,w+.7,b+.3,tier===0);hip(px,b+3.05,pz,w+3.8,w+3.8,1.5,0.4);
 }
 const fy=Y+1+4*4.35+4.7;cyl(px,fy+2.8,pz,.085,.15,5.6,dark);cyl(px,fy+.2,pz,.52,.68,.4,bronze);
 for(let j=0;j<9;j++){const tor=mesh(new THREE.TorusGeometry(.64-j*.042,.055,6,20),bronze,px,fy+.7+j*.4,pz,Math.PI/2);}
 ball(px,fy+5.45,pz,.28,gold);cyl(px,fy+5.95,pz,0,.18,.7,gold);
 // Boundary walls, with masonry plinths, plaster panels and tiled coping.
 function wall(x,z,length,axis='x'){
  const n=Math.ceil(length/2.3),len=length/n;
  for(let i=0;i<n;i++){const xx=x+(axis==='x'?-length/2+(i+.5)*len:0),zz=z+(axis==='z'?-length/2+(i+.5)*len:0),ground=heightAt(xx,zz),base=Y+.6;
   box(xx,(ground+base)/2,zz,axis==='x'?len:.65,Math.max(.25,base-ground),axis==='z'?len:.65,stone);
   box(xx,Y+1.38,zz,axis==='x'?len-.035:.42,1.55,axis==='z'?len-.035:.42,plaster);
   box(xx,Y+2.15,zz,axis==='x'?len:.67,.17,axis==='z'?len:.67,dark);
   const cap=box(xx,Y+2.31,zz,axis==='x'?len:.93,.17,axis==='z'?len:.93,roof);
   box(xx+(axis==='x'?len/2:0),Y+1.45,zz+(axis==='z'?len/2:0),.17,1.8,.17,wood);
   for(let k=0;k<5;k++)cyl(xx+(axis==='x'?-len/2+(k+.5)*len/5:0),Y+2.39,zz+(axis==='z'?-len/2+(k+.5)*len/5:0),.1,.1,.88,tile,6).rotation[axis==='x'?'x':'z']=Math.PI/2;
  }
 }
 wall(-54,34,14);wall(-25.5,34,31);wall(-35.5,77,51);wall(-10,55.5,43,'z');wall(-61,43.5,19,'z');wall(-61,67,20,'z');
 function gate(x,z,w,rot=0){foundation(x,z,w+1.2,2.4,Y+.26);for(const side of [-1,1]){cyl(x+side*w/2,Y+2,z,.22,.28,4,wood);bracket(x+side*w/2,Y+3.65,z,.8);}box(x,Y+3.5,z,w+1,.32,.42,wood);box(x,Y+2.7,z,w*.3,.8,.12,dark);hip(x,Y+3.9,z,w+3,3.3,1.5,w*.45);}
 gate(-44,34,5); // west opening remains wide enough for the root hill path
 for(const zz of [54,58]){box(-61,Y+1.6,zz,.65,3.2,.65,stone);box(-61,Y+3.24,zz,1,.2,1,roof);}
 // Bell pavilion and purification shelter.
 function pavilion(x,z,w,d,h){foundation(x,z,w+.8,d+.8,Y+.5);for(const dx of [-w/2,w/2])for(const dz of [-d/2,d/2]){cyl(x+dx,Y+.5+h/2,z+dz,.18,.24,h,wood);bracket(x+dx,Y+h+.22,z+dz,.8);}for(const side of [-1,1]){box(x,Y+h+.1,z+side*d/2,w+.5,.25,.25,wood);box(x+side*w/2,Y+h+.1,z,.25,.25,d+.5,wood);}hip(x,Y+h+.65,z,w+2.4,d+2.4,1.9,w*.28);}
 pavilion(-20,41.5,5,4.7,4.4);box(-20,Y+4.75,41.5,5.2,.28,.3,wood);box(-18.5,Y+4.75,41.5,.24,.24,4.9,wood);
 beam([-20,Y+4.7,41.5],[-20,Y+4.0,41.5],.08,black);cyl(-20,Y+3.2,41.5,.55,.82,1.65,bronze,20);cyl(-20,Y+2.37,41.5,.89,.89,.14,bronze,20);ball(-20,Y+4.0,41.5,.54,bronze,1,.65,1);
 for(let j=0;j<4;j++)for(let i=0;i<12;i++){let a=i*Math.PI/6;ball(-20+Math.cos(a)*(.57+j*.047),Y+3.8-j*.3,41.5+Math.sin(a)*(.57+j*.047),.06,gold);}
 beam([-18.5,Y+2.75,40.9],[-18.5,Y+2.75,43.3],.17,dark);for(const zz of [41,43])beam([-18.5,Y+2.75,zz],[-18.5,Y+4.8,zz],.035,light);
 pavilion(-55,39.8,3.6,2.7,2.7);box(-55,Y+.95,39.8,2.7,.8,1.1,stone);box(-55,Y+1.37,39.8,2.25,.03,.69,black);box(-55,Y+1.39,39.8,2.1,.025,.55,bronze);
 for(let j=0;j<3;j++){beam([-55.8+j*.7,Y+1.48,39.15],[-55.8+j*.7,Y+1.48,40.4],.035,light);cyl(-55.8+j*.7,Y+1.53,40.16,.13,.12,.13,light);}
 // Stone lanterns: separate base, shaft, firebox openings, roof and jewel.
 function lantern(x,z,s=1){const b=Y+.13;box(x,b+.14*s,z,1.15*s,.28*s,1.15*s,stone);cyl(x,b+.38*s,z,.36*s,.5*s,.22*s,stone2);cyl(x,b+1.0*s,z,.17*s,.22*s,1.1*s,stone);box(x,b+1.63*s,z,.76*s,.22*s,.76*s,stone2);box(x,b+1.99*s,z,.55*s,.55*s,.55*s,dark);for(const dx of [-.27,.27])for(const dz of [-.27,.27])box(x+dx*s,b+1.99*s,z+dz*s,.12*s,.58*s,.12*s,stone);mesh(new THREE.ConeGeometry(.78*s,.46*s,4),stone,x,b+2.48*s,z,0,Math.PI/4);ball(x,b+2.83*s,z,.17*s,stone);}
 for(const [x,z] of [[-48,38],[-40,38],[-51,46],[-45,46],[-32,49],[-22,49],[-33,64],[-21,64],[-57,69],[-39,72],[-14,46],[-58,58]])lantern(x,z,1.05);
 // Bronze incense burner, candle stands, votive plaque rack and service details.
 cyl(-48,Y+.75,46,.64,.43,.85,bronze);cyl(-48,Y+1.2,46,.72,.72,.13,bronze);for(const dx of [-.5,.5])cyl(-48+dx,Y+.32,46,.08,.13,.48,bronze);for(let i=0;i<9;i++)cyl(-48+(i%3-1)*.16,Y+1.45,46+(Math.floor(i/3)-1)*.14,.018,.018,.55,red,5);
 for(const xx of [-37,-33])box(xx,Y+1.3,38,.15,2.6,.15,wood);box(-35,Y+2.5,38,4.4,.18,.18,dark);for(let j=0;j<2;j++)for(let i=0;i<8;i++){const x=-36.7+i*.48,y=Y+1.9-j*.66;beam([x,y+.35,38],[x,y+.12,38],.016,light);box(x,y,38,.35,.31,.06,light);box(x,y,37.96,.15,.03,.015,dark);}
 hip(-35,Y+2.65,38,5,1.5,.6,3.2);
 // Memorial garden, moss islands and abundant shaped trees.
 function garden(x,z,w,d){const o=cyl(x,Y+.1,z,1,1,.17,moss,24);o.scale.set(w/2,1,d/2);for(let i=0;i<9;i++){const a=i*2.4;ball(x+Math.cos(a)*w*.42,Y+.22,z+Math.sin(a)*d*.42,.35+(i%3)*.12,stone,1,.6,1);}}
 function tree(x,z,s,cherry){const base=Math.max(Y,heightAt(x,z));const foliage=cherry?pink:green;beam([x,base,z],[x+.4*s,base+4.1*s,z+.2*s],.19*s,wood);for(let k=0;k<7;k++){let a=k*2.4,r=(k%3+1)*.6*s,xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r,yy=base+(3.1+k*.32)*s;beam([x+.22*s,base+2.2*s,z],[xx,yy,zz],.075*s,wood);ball(xx,yy,zz,(cherry?1.35:1.25)*s,k%3===0?(cherry?pink2:green2):foliage,1,cherry?.74:.34,1);if(cherry)for(let j=0;j<4;j++)ball(xx+Math.cos(j*2)*s*.9,yy+Math.sin(j*4)*s*.6,zz+Math.sin(j*2)*s*.9,.55*s,j%2?pink:pink2);}}
 for(const [x,z,w,d] of [[-55,72,9,6],[-45,73,7,5],[-15,70,6,10],[-14,52,4,8],[-33,73,8,5],[-57,44,4,4],[-30,40,4,4]])garden(x,z,w,d);
 for(const [x,z,s,c] of [[-55,72,1.15,true],[-44,73,.85,false],[-15,71,1.15,false],[-14,51,.85,true],[-33,73,1,true],[-57,44,.65,false],[-30,40,.65,true],[-58,63,.65,false]])tree(x,z,s,c);
 for(let i=0;i<7;i++){let x=-29+i*1.95,z=73.5;box(x,Y+.2,z,.85,.3,.75,stone);box(x,Y+.75,z,.46,.85,.38,stone2);ball(x,Y+1.2,z,.24,stone2,1,.6,.8);for(let j=0;j<3;j++)box(x,Y+.99-j*.16,z-.2,.10,.045,.02,dark);}
 for(let i=0;i<65;i++){let x=-58+(i*37%100)*.08,z=69+(i*53%50)*.12;const b=box(x,Y+.20,z,.07,.02,.1,pink2);b.rotation.y=i;}
 for(let i=0;i<6;i++){cyl(-57.5+i*.45,Y+.36,36.4,.17,.23,.6,wood);cyl(-57.5+i*.45,Y+.68,36.4,.19,.19,.08,dark);}
 // Merge by material for a small draw-call count while preserving every geometric detail.
 for(const [m,items] of bins){let len=0;const geos=[];for(const ob of items){ob.updateMatrix();const geo=ob.geometry.index?ob.geometry.toNonIndexed():ob.geometry;geo.applyMatrix4(ob.matrix);geos.push(geo);len+=geo.attributes.position.array.length;}
  const positions=new Float32Array(len),normals=new Float32Array(len);let off=0;for(const geo of geos){positions.set(geo.attributes.position.array,off);normals.set(geo.attributes.normal.array,off);off+=geo.attributes.position.array.length;geo.dispose();}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));geo.setAttribute('normal',new THREE.BufferAttribute(normals,3));const ob=new THREE.Mesh(geo,m);ob.castShadow=true;ob.receiveShadow=true;group.add(ob);
 }
 return group;
}
