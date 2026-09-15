import { heightAt, roadNetwork, layout } from './root.js';
import { northReservations } from './north.js';

export function build(THREE,ctx){
 const g=new THREE.Group();g.name='North-west laundry, greengrocer, workshop and vegetable yards';
 const palette={wood:'#79583d',wood2:'#99754f',dark:'#483b2d',bamboo:'#a09362',stone:'#8c8b78',gravel:'#a29779',earth:'#79644a',soil:'#514e36',leaf:'#536f3c',leaf2:'#779350',pine:'#345d47',bark:'#66503a',white:'#dbd2b7',blue:'#526b7c',red:'#a6503a',orange:'#c58d3c',pot:'#92705b',water:'#647f80',metal:'#727b77',roof:'#5b6468'};
 const mats={};for(const [k,v]of Object.entries(palette))mats[k]=new THREE.MeshStandardMaterial({color:v,roughness:.9});
 const geos={box:new THREE.BoxGeometry(1,1,1),ball:new THREE.IcosahedronGeometry(1,1),cyl:new THREE.CylinderGeometry(1,1,1,12),torus:new THREE.TorusGeometry(1,.07,5,18)};
 const batches=new Map(),o=new THREE.Object3D();
 function instance(geo,m,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.scale.set(sx,sy,sz);o.updateMatrix();put(geo,m);}
 function put(geo,m){let k=geo.uuid+m;if(!batches.has(k))batches.set(k,{geo,m,items:[]});batches.get(k).items.push(o.matrix.clone());}
 const box=(x,y,z,w,h,d,m='wood',ry=0,rx=0)=>instance(geos.box,m,x,y,z,w,h,d,rx,ry);
 const ball=(x,y,z,a,b,c,m)=>instance(geos.ball,m,x,y,z,a,b,c);
 function beam(a,b,r=.045,m='wood'){const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),v=q.clone().sub(p);o.position.copy(p.add(q).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());o.scale.set(r,v.length(),r);o.updateMatrix();put(geos.cyl,m);}
 function ring(x,y,z,r,m='dark',vertical=false){instance(geos.torus,m,x,y,z,r,r,r,vertical?0:Math.PI/2);}
 const roads=roadNetwork(),reserve=northReservations(),lots=layout().town.lots;
 function roadOK(x,z,margin=.25){return roads.every(rd=>rd.points.slice(1).every((b,i)=>{const a=rd.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)>rd.width/2+margin;}));}
 function clear(x,z){if(x< -91.8||x> -57.1||z< -6.8||z>28.8||!roadOK(x,z))return false;if(reserve.gardens.some(p=>Math.hypot(x-p.x,z-p.z)<p.r+.25))return false;return !lots.some((l,i)=>Math.abs(x-l.x)<(l.w-i%3*.25)/2+.25&&Math.abs(z-l.z)<(7+i%2*.3)/2+.25);}
 function patch(x0,z0,x1,z1,mat='gravel',step=.4){const vs=[],is=[];for(let x=x0;x<x1;x+=step)for(let z=z0;z<z1;z+=step){const xx=Math.min(x+step,x1),zz=Math.min(z+step,z1);if(![[x,z],[xx,z],[x,zz],[xx,zz]].every(p=>clear(...p)))continue;const n=vs.length/3;for(const [a,b]of [[x,z],[x,zz],[xx,z],[xx,zz]])vs.push(a,heightAt(a,b)+.10,b);is.push(n,n+1,n+2,n+2,n+1,n+3);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));geo.setIndex(is);geo.computeVertexNormals();const m=new THREE.Mesh(geo,mats[mat]);m.receiveShadow=true;g.add(m);}
 function path(points,w=.75){for(let j=1;j<points.length;j++){const a=points[j-1],b=points[j],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.4);for(let k=0;k<=n;k++){const t=k/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(clear(x,z))box(x,heightAt(x,z)+.14,z,w,.11,.36,'stone',Math.atan2(b[0]-a[0],b[1]-a[1]));}}}
 function fence(a,b,style=0){const len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(len/1.45);let prev;for(let i=0;i<=n;i++){let t=i/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,y=heightAt(x,z);if(!clear(x,z)){prev=null;continue;}box(x,y+.58,z,.13,1.28,.13,style?'bamboo':'wood');box(x,y+.02,z,.27,.18,.27,'stone');if(prev){for(const h of [.36,.89])beam([prev.x,prev.y+h,prev.z],[x,y+h,z],.055,style?'bamboo':'wood2');const count=Math.ceil(Math.hypot(x-prev.x,z-prev.z)/.24);for(let k=1;k<count;k++){const u=k/count,xx=prev.x+(x-prev.x)*u,zz=prev.z+(z-prev.z)*u,yy=heightAt(xx,zz);box(xx,yy+.57,zz,style?.045:.11,.89,.055,style?'bamboo':'wood2');}}prev={x,y,z};}}
 function gate(x,z){for(const s of [-1,1]){const xx=x+s*1.43,y=heightAt(xx,z);box(xx,y+.74,z,.18,1.5,.18,'dark');box(xx,y+1.51,z,.27,.09,.25,'wood2');}/* open leaves lie beside the access corridor */for(const s of [-1,1])fence([x+s*1.44,z],[x+s*1.44,z+(z<8?-.85:.85)],1);}
 function pot(x,z,r=.3,plant=true){const y=heightAt(x,z);instance(geos.cyl,'pot',x,y+r*.65,z,r*.8,r*1.3,r*.8);ring(x,y+r*1.3,z,r*.85,'wood2');instance(geos.cyl,'soil',x,y+r*1.31,z,r*.70,.035,r*.70);if(plant)for(let k=0;k<7;k++){const a=k*2.4;beam([x,y+r*1.3,z],[x+Math.cos(a)*r*.7,y+r*(2+k%2*.4),z+Math.sin(a)*r*.7],.017,'leaf');ball(x+Math.cos(a)*r*.6,y+r*2,z+Math.sin(a)*r*.6,r*.27,r*.35,r*.2,'leaf2');}}
 function basket(x,z,r=.38,y0=null,produce=false){const y=y0??heightAt(x,z);instance(geos.cyl,'bamboo',x,y+.22,z,r,.44,r);for(let j=0;j<6;j++)ring(x,y+.04+j*.075,z,r,'wood2');instance(geos.cyl,'dark',x,y+.445,z,r*.85,.03,r*.85);for(let k=0;k<16;k++){const a=k*Math.PI/8;beam([x+Math.cos(a)*r,y+.02,z+Math.sin(a)*r],[x+Math.cos(a)*r,y+.43,z+Math.sin(a)*r],.012,'white');}if(produce)for(let j=0;j<8;j++){let a=j*2.4;ball(x+Math.cos(a)*r*.55,y+.46+j%2*.07,z+Math.sin(a)*r*.55,.115,.12,.11,j%2?'leaf2':'orange');}}
 function crate(x,z,w=.8,d=.6,y0=null){const y=y0??heightAt(x,z);for(let j=0;j<3;j++){box(x,y+.12+j*.15,z-d/2,w,.11,.055,'wood2');box(x,y+.12+j*.15,z+d/2,w,.11,.055,'wood2');box(x-w/2,y+.12+j*.15,z,.055,.11,d,'wood');box(x+w/2,y+.12+j*.15,z,.055,.11,d,'wood');}box(x,y+.05,z,w,.08,d,'dark');for(const s of [-1,1])for(const t of [-1,1])box(x+s*w/2,y+.25,z+t*d/2,.07,.54,.07,'wood');}
 function bench(x,z,w=2,d=.8){const y=Math.max(...[-1,1].flatMap(a=>[-1,1].map(b=>heightAt(x+a*w/2,z+b*d/2))));for(const a of [-1,1])for(const b of [-1,1]){const xx=x+a*(w/2-.12),zz=z+b*(d/2-.1),low=heightAt(xx,zz);box(xx,(low+y+.8)/2,zz,.12,y+.8-low,.12);}for(let k=0;k<4;k++)box(x,y+.86,z-d/2+(k+.5)*d/4,w,.13,d/4-.018,'wood2');return y+.94;}
 // Connected yards, with individual front gates and side access.
 // Partition the complete worked-ground union at every material/area boundary.
 // Rear earth owns its rectangle; all other covered cells are gravel. Each cell
 // is tessellated once, so intersecting access strips cannot duplicate surfaces.
 const groundAreas=[
  [-91,-6.6,-83,5.4,'gravel'],[-83.7,1.8,-60.7,5.4,'gravel'],
  [-91,10.7,-83,28.6,'gravel'],[-83.7,10.7,-60.7,14.1,'gravel'],
  [-83.7,22,-59,28.6,'earth'],[-60.9,-5.8,-58.2,27.7,'gravel'],
  [-73.1,-5.8,-71.1,26.5,'gravel']
 ];
 const groundXs=[...new Set(groundAreas.flatMap(a=>[a[0],a[2]]))].sort((a,b)=>a-b);
 const groundZs=[...new Set(groundAreas.flatMap(a=>[a[1],a[3]]))].sort((a,b)=>a-b);
 for(let ix=1;ix<groundXs.length;ix++)for(let iz=1;iz<groundZs.length;iz++){
  const x0=groundXs[ix-1],x1=groundXs[ix],z0=groundZs[iz-1],z1=groundZs[iz];
  const x=(x0+x1)/2,z=(z0+z1)/2;
  const owners=groundAreas.filter(a=>x>a[0]&&x<a[2]&&z>a[1]&&z<a[3]);
  if(owners.length)patch(x0,z0,x1,z1,owners.some(a=>a[4]==='earth')?'earth':'gravel');
 }

 for(const i of [24,25,30,31]){const l=lots[i],fz=l.z<8?5.32:10.79;gate(l.x,fz);const joinZ=l.z<8?6.1:9.9;box(l.x,heightAt(l.x,joinZ)+.18,joinZ,1.7,.14,.55,'stone');fence([l.x-5.05,fz],[l.x-1.55,fz],i%2);fence([l.x+1.55,fz],[l.x+5.05,fz],i%2);path([[l.x,fz],[l.x,l.z<8?6.12:10.47]],1.6);}
 fence([-91,-5.8],[-91,5],1);fence([-84,-5.8],[-84,3.3]);fence([-91,21.2],[-91,28.6]);fence([-91,28.6],[-80,28.6]);fence([-78.8,28.6],[-72,28.6]);fence([-71.5,28.6],[-59,28.6],1);fence([-58.8,12],[-58.8,26.5],1);
 path([[-78,5.8],[-78,5.1],[-84.7,4.8],[-85.2,0],[-85.2,-5.6]]);path([[-84.7,5],[-84.7,11.3],[-84.7,22.7],[-79,23.3],[-79,28]]);path([[-66,10.6],[-60,11.4],[-59.8,22.6],[-65,23.3],[-65,28]]);path([[-66,5.8],[-66,4.9],[-60,4.9],[-59.8,-5.5]]);
 // Laundry court: paired poles, sagging rope, two pins per cloth, open wash tub.
 for(const x of [-89.7,-85.8]){const y=heightAt(x,-1.5);box(x,y+1.37,-1.5,.105,2.8,.105,'bamboo');box(x,y+.05,-1.5,.35,.18,.35,'stone');}
 const yline=Math.max(heightAt(-89.7,-1.5),heightAt(-85.8,-1.5))+2.55;let p=null;for(let k=0;k<=20;k++){const t=k/20,q=[-89.7+t*3.9,yline-.17*Math.sin(Math.PI*t),-1.5];if(p)beam(p,q,.014,'dark');p=q;}
 for(let k=0;k<4;k++){const x=-89.15+k*.86,top=yline-.17*Math.sin(Math.PI*(k+.5)/4);box(x,top-.54,-1.5,.66,1.02,.035,k%3===0?'blue':'white');for(const s of [-1,1])box(x+s*.24,top-.02,-1.48,.043,.16,.06,'wood2');for(let j=0;j<3;j++)box(x-.25+j*.24,top-.55,-1.47,.027,.98,.023,k%3===0?'blue':'white');}
 const tx=-88.2,tz=1.4,ty=heightAt(tx,tz);instance(geos.cyl,'wood',tx,ty+.28,tz,.58,.55,.58);instance(geos.cyl,'water',tx,ty+.51,tz,.50,.025,.50);ring(tx,ty+.56,tz,.58,'dark');ring(tx,ty+.15,tz,.58,'dark');for(let k=0;k<18;k++){const a=k*Math.PI/9;box(tx+Math.cos(a)*.575,ty+.29,tz+Math.sin(a)*.575,.045,.5,.06,'wood2',-a); }box(tx,ty+.72,tz,.27,.055,1.2,'wood2');basket(-89.6,2.2,.44);for(const [x,z,r]of [[-86.3,2.5,.35],[-86.2,3.4,.26],[-81.7,3.5,.36],[-80.7,3.4,.25]])pot(x,z,r);
 // Indigo shop display beside the entry, individually arranged vegetables and baskets.
 const sy=bench(-69.2,3.4,2.4,1.1);for(let c=0;c<3;c++){crate(-70+c*.8,3.4,.7,.85,sy);for(let a=0;a<3;a++)for(let b=0;b<3;b++){const x=-70+c*.8-.2+a*.2,z=3.13+b*.23;ball(x,sy+.28,z,c===1?.085:.115,c===1?.21:.105,.10,c===0?'leaf2':c===1?'white':'orange');if(c===0)for(let s=0;s<3;s++)ball(x+.06*Math.cos(s*2),sy+.32,z+.06*Math.sin(s*2),.065,.055,.075,'leaf');}}
 box(-69.2,sy-.23,4.01,2.35,.38,.04,'blue');for(let k=0;k<5;k++)box(-70.15+k*.48,sy-.22,4.04,.04,.24,.02,'white');basket(-70.5,4.6,.38,null,true);basket(-68.9,4.8,.28,null,true);crate(-62.2,2.6);crate(-62.2,2.6,.7,.5,heightAt(-62.2,2.6)+.55);
 function cart(x,z){const y=heightAt(x,z)+.55;box(x,y,z,1.05,.16,1.4);for(const s of [-1,1]){instance(geos.torus,'dark',x+s*.65,y-.11,z,.41,.41,.41,0,Math.PI/2);/* wheels in yz plane */for(let k=0;k<8;k++){const a=k*Math.PI/4;beam([x+s*.65,y-.11,z],[x+s*.65,y-.11+.4*Math.cos(a),z+.4*Math.sin(a)],.025,'wood2');}for(let q=0;q<3;q++)box(x+s*.52,y+.14+q*.16,z,.075,.1,1.4,'wood2');beam([x+s*.4,y,z-.55],[x+s*.4,y+.16,z-2],.05,'wood');}beam([x-.8,y-.11,z],[x+.8,y-.11,z],.07,'dark');basket(x,z,.3,y+.1,true);}
 cart(-59.7,.2);
 // North-west timber shed: full four walls, door, gable infill and overlapped roof boards.
 function shed(x,z,w,d){const y=Math.max(...[-1,1].flatMap(a=>[-1,1].map(b=>heightAt(x+a*w/2,z+b*d/2))))+.12;const low=Math.min(...[-1,1].flatMap(a=>[-1,1].map(b=>heightAt(x+a*w/2,z+b*d/2))))-.08;box(x,(low+y)/2,z,w+.15,y-low,d+.15,'stone');for(let a=-w/2+.1;a<w/2;a+=.21){box(x+a,y+1.0,z+d/2,.19,2.0,.09,'wood2');if(Math.abs(a)>.52)box(x+a,y+1,z-d/2,.19,2,.09,'wood');}for(const s of [-1,1]){box(x+s*w/2,y+1,z,.10,2,d,'wood');for(let a=-d/2;a<=d/2;a+=.25)box(x+s*(w/2+.055),y+1,z+a,.025,2,.025,'dark');for(const zz of [-d/2,d/2])box(x+s*w/2,y+1.02,z+zz,.14,2.15,.14,'dark');}box(x,y+.95,z-d/2-.035,1.0,1.9,.12,'wood2');for(let k=0;k<5;k++)box(x-.4+k*.2,y+.95,z-d/2-.105,.025,1.87,.025,'wood');box(x+.34,y+.97,z-d/2-.13,.08,.12,.055,'metal');beam([x-.44,y+.2,z-d/2-.12],[x+.44,y+1.7,z-d/2-.12],.04,'dark');
 const rise=.65,run=d/2+.24,ang=Math.atan(rise/run);for(const s of [-1,1]){box(x,y+2+rise/2,z+s*run/2,w+.48,.12,Math.hypot(run,rise),'roof',0,s*ang);for(let k=0;k<Math.ceil((w+.45)/.19);k++)beam([x-w/2-.15+k*.19,y+2+rise+.08,z],[x-w/2-.15+k*.19,y+2+.08,z+s*run],.025,'metal');}box(x,y+2.71,z,w+.55,.11,.18,'roof');for(const s of [-1,1]){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([x+s*w/2,y+2,z-d/2,x+s*w/2,y+2,z+d/2,x+s*w/2,y+2.6,z],3));geo.setIndex([0,1,2,2,1,0]);geo.computeVertexNormals();g.add(new THREE.Mesh(geo,mats.wood));}}
 shed(-88.2,25.7,3.7,3.3);
 const wy=bench(-83.4,25.9,2.4,.85);box(-83.1,wy+.10,25.9,1.15,.13,.3,'white');box(-84.25,wy+.1,25.9,.26,.20,.32,'metal');beam([-83.8,wy+.13,25.6],[-83.0,wy+.13,25.6],.035,'wood');box(-83.8,wy+.14,25.6,.25,.11,.07,'metal');
 for(let k=0;k<14;k++){const row=Math.floor(k/5),col=k%5,x=-86.0+col*.3,y=heightAt(-85.4,22.6)+.19+row*.28;beam([x,y,22.1],[x,y,23.25],.15,'bark');instance(geos.cyl,'wood2',x,y,22.08,.125,.03,.125,Math.PI/2);ring(x,y,22.06,.08,'dark',true);}
 for(let k=0;k<5;k++)box(-80.8,heightAt(-80.8,26.2)+.13+k*.12,26.2,1.1,.10,2.8,k%2?'wood':'wood2');crate(-81.1,23.6);basket(-83.6,23.9,.3);
 // Kitchen garden in small level terraces, individual cabbages, beans and furrows.
 function bed(x,z,w,d,type){const y=Math.max(heightAt(x-w/2,z-d/2),heightAt(x+w/2,z+d/2))+.10;const low=Math.min(heightAt(x-w/2,z-d/2),heightAt(x+w/2,z+d/2))-.04;box(x,(y+low)/2,z,w,y-low,d,'soil');for(const s of [-1,1]){box(x+s*w/2,y,z,.10,.23,d+.1,'wood');box(x,y,z+s*d/2,w,.23,.10,'wood2');}for(const s of [-1,1]){for(let yy=heightAt(x,z+s*d/2)+.08;yy<y;yy+=.18)box(x,Math.min(yy,y-.05),z+s*(d/2+.02),w,.15,.055,'wood2');for(let yy=heightAt(x+s*w/2,z)+.08;yy<y;yy+=.18)box(x+s*(w/2+.02),Math.min(yy,y-.05),z,.055,.15,d,'wood');}for(let a=0;a<Math.floor(w/.4);a++)for(let b=0;b<3;b++){const xx=x-w/2+.22+a*.4,zz=z-d/2+.22+b*(d-.4)/2;if(type===0){ball(xx,y+.15,zz,.15,.14,.15,'leaf2');for(let k=0;k<4;k++)ball(xx+.09*Math.cos(k*1.57),y+.1,zz+.09*Math.sin(k*1.57),.12,.06,.12,'leaf');}else{for(let k=0;k<4;k++)beam([xx,y,zz],[xx+.11*Math.cos(k*1.57),y+.4,zz+.11*Math.sin(k*1.57)],.025,'leaf');}}}
 for(let j=0;j<3;j++)for(const x of [-69.65,-67.55])bed(x,24.05+j*1.55,1.75,1.12,j%2);
 for(let k=0;k<5;k++){const x=-63.5+k*.48,z=26.9,y=heightAt(x,z);beam([x,y,z-.35],[x,y+1.7,z+.12],.033,'bamboo');beam([x,y,z+.65],[x,y+1.7,z+.12],.033,'bamboo');for(let q=0;q<5;q++)ball(x+Math.sin(q*2)*.15,y+.35+q*.25,z+.1,.14,.10,.14,'leaf');}beam([-63.5,heightAt(-63.5,26.9)+1.65,27.02],[-61.58,heightAt(-61.58,26.9)+1.65,27.02],.035,'bamboo');
 crate(-62,23.5);basket(-62,24.4,.35);pot(-64.1,23.4,.31);pot(-68.5,12,.3);pot(-80.9,12.2,.33);
 const px=-59.95,pz=26.8,py=heightAt(px,pz);beam([px,py,pz],[px+.16,py+2.8,pz],.12,'bark');for(let k=0;k<7;k++){const a=k*2.4,x=px+Math.cos(a)*.65,z=pz+Math.sin(a)*.65,y=py+1.5+k*.21;beam([px,py+1,pz],[x,y,z],.04,'bark');ball(x,y,z,.66,.24,.55,'pine');}
 // Front household storage leaves the full central stairs and gate corridors clear.
 const fy=heightAt(-81.2,12.2);for(let k=0;k<9;k++){const x=-81.85+(k%3)*.34,y=fy+.19+Math.floor(k/3)*.27;beam([x,y,11.82],[x,y,12.58],.15,'bark');instance(geos.cyl,'wood2',x,y,11.8,.125,.026,.125,Math.PI/2);}for(const x of [-82.1,-80.8])box(x,heightAt(x,12.2)+.55,12.2,.09,1.15,.09);box(-81.45,fy+1.12,12.2,1.65,.10,1.05,'roof');
 basket(-63.2,12.2,.34);pot(-62.3,12.3,.43,false);const cy=heightAt(-62.9,13.1);instance(geos.cyl,'metal',-62.9,cy+.24,13.1,.22,.46,.22);ring(-62.9,cy+.48,13.1,.2,'dark');beam([-62.7,cy+.18,13.1],[-62.25,cy+.44,13.1],.04,'metal');
 const stoolY=bench(-89.4,-3.8,.72,.6);box(-89.4,stoolY+.04,-3.8,.45,.06,.35,'white');
 // Scattered seated stones and small grass at the worked-yard edges.
 for(let k=0;k<90;k++){const x=-90.5+(k*7.123%31),z=-5.5+(k*5.971%33);if(clear(x,z)&&((x< -84&&z<5)||(z>23&&x< -73)))ball(x,heightAt(x,z)+.05,z,.06,.05,.09,k%4?'stone':'leaf');}
 for(const b of batches.values()){const m=new THREE.InstancedMesh(b.geo,mats[b.m],b.items.length);b.items.forEach((mx,i)=>m.setMatrixAt(i,mx));m.castShadow=true;m.receiveShadow=true;g.add(m);}return g;
}
