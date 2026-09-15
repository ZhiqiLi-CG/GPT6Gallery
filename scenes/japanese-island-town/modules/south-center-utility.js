import { heightAt, roadNetwork, layout } from './root.js';

// One inhabited utility parcel. All architecture, enclosure and ground belong to ancestors.
export function build(THREE, ctx) {
 const g=new THREE.Group(); g.name='South-center utility household';
 const lot=layout().town.lots[2], ox=lot.x+43, oz=lot.z+64;
 const colors={wood:'#846747',light:'#ab8b5a',dark:'#493c2c',board:'#725b40',end:'#c49e65',bark:'#67513a',iron:'#555951',roof:'#64645a',roofLight:'#6d6a5d',reed:'#b8a06a',reedDark:'#8c784f',clay:'#a37156',blue:'#526e72',soil:'#4e4735',leaf:'#547147',leaf2:'#728459',water:'#617f78',stone:'#8b8c7b'};
 const mats={}; for(const [k,c] of Object.entries(colors))mats[k]=new THREE.MeshStandardMaterial({color:c,roughness:k==='water'?.25:.9});
 const cube=new THREE.BoxGeometry(1,1,1),cyl=new THREE.CylinderGeometry(1,1,1,16),sphere=new THREE.SphereGeometry(1,8,6),ring=new THREE.TorusGeometry(1,.035,5,28),batches=new Map(),dummy=new THREE.Object3D();
 function save(geo,mat){let key=geo.uuid+mat;if(!batches.has(key))batches.set(key,{geo,mat,items:[]});dummy.updateMatrix();batches.get(key).items.push(dummy.matrix.clone());}
 function inst(geo,mat,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){dummy.position.set(x+ox,y,z+oz);dummy.rotation.set(rx,ry,rz);dummy.scale.set(sx,sy,sz);save(geo,mat);}
 function box(x,y,z,w,h,d,mat='wood',rx=0,ry=0,rz=0){inst(cube,mat,x,y,z,w,h,d,rx,ry,rz);}
 function beam(a,b,r,mat='wood'){const av=new THREE.Vector3(a[0]+ox,a[1],a[2]+oz),bv=new THREE.Vector3(b[0]+ox,b[1],b[2]+oz),v=bv.clone().sub(av);dummy.position.copy(av.add(bv).multiplyScalar(.5));dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());dummy.scale.set(r,v.length(),r);save(cyl,mat);}
 const ground=(x,z)=>heightAt(x+ox,z+oz)+.10;
 const roads=roadNetwork();
 function reserve(x,z,r){for(const road of roads)for(let i=1;i<road.points.length;i++){const a=road.points[i-1],b=road.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=THREE.MathUtils.clamp(((x+ox-a[0])*dx+(z+oz-a[1])*dz)/(dx*dx+dz*dz),0,1);if(Math.hypot(x+ox-a[0]-t*dx,z+oz-a[1]-t*dz)<road.width/2+r+.3)throw Error('Utility furnishing intersects '+road.id);}}
 function foot(x,z,top,r=.095){const y=ground(x,z);box(x,(y+top)/2,z,r*2,top-y,r*2,'dark');}
 function hoop(x,y,z,r,mat='iron',thick=1){inst(ring,mat,x,y,z,r,r,r*thick,Math.PI/2);}
 function lathe(points,mat,x,y,z,s=1){const geo=new THREE.LatheGeometry(points.map(p=>new THREE.Vector2(...p)),28);inst(geo,mat,x,y,z,s,s,s);}
 function vessel(x,z,r,h,mat,plant=false){reserve(x,z,r+.18);const y=ground(x,z);lathe([[.56,0],[.72,.08],[.95,.63],[1,.88],[1,.99],[.84,1],[.82,.89],[.77,.65],[.54,.15],[0,.15]],mat,x,y,z,r); // scale vertical independently below
 // Resize this lathe vertically without changing radius.
 const b=Array.from(batches.values()).at(-1),m=b.items.at(-1);m.elements[5]*=h/r;
 hoop(x,y+h*.96,z,r*.94,mat);
 inst(cyl,'soil',x,y+h*.80,z,r*.80,.045,r*.80);
 if(plant)for(let j=0;j<11;j++){const a=j*2.4,rr=r*(.25+(j%3)*.19),yy=y+h+.10+(j%4)*.12;beam([x,y+h*.79,z],[x+Math.cos(a)*rr,yy,z+Math.sin(a)*rr],.018,'leaf');inst(sphere,j%2?'leaf':'leaf2',x+Math.cos(a)*rr,yy+.035,z+Math.sin(a)*rr,.11,.26,.055,.5*Math.cos(a),a,.4*Math.sin(a));}
 }
 function basket(x,z,r=.36,h=.44,yBase=null){reserve(x,z,r+.05);const y=yBase??ground(x,z);inst(cyl,'reedDark',x,y+.035,z,r*.70,.07,r*.70);for(let j=0;j<11;j++){const yy=(j+.5)*h/11,rr=r*(.72+.28*yy/h);hoop(x,y+yy,z,rr,j%2?'reed':'reedDark');}for(let j=0;j<24;j++){const a=j/24*Math.PI*2;beam([x+Math.cos(a)*r*.72,y+.04,z+Math.sin(a)*r*.72],[x+Math.cos(a)*r,y+h,z+Math.sin(a)*r],.012,'reed');}hoop(x,y+h,z,r,'reed');hoop(x,y+h-.045,z,r*.99,'reed');for(const side of [-1,1]){const handle=new THREE.TorusGeometry(r*.30,.022,5,12,Math.PI);inst(handle,'reed',x+side*r*.93,y+h,z,1,1,1,0,Math.PI/2);}}
 function barrel(x,z,r=.43,h=1.12,bucket=false){reserve(x,z,r+.1);const y=ground(x,z);lathe([[0,0],[r*.84,0],[r*.99,h*.30],[r,h*.65],[r*.86,h],[r*.75,h],[r*.82,h*.7],[r*.8,h*.15],[0,h*.15]],'wood',x,y,z);for(let j=0;j<22;j++){const a=j/22*Math.PI*2;beam([x+Math.cos(a)*r*.86,y+.06,z+Math.sin(a)*r*.86],[x+Math.cos(a)*r*.91,y+h-.03,z+Math.sin(a)*r*.91],.012,'light');}for(const t of [.14,.49,.86])hoop(x,y+h*t,z,r*(t===.49?1:.96),'iron');inst(cyl,'water',x,y+h*.82,z,r*.80,.022,r*.80);hoop(x,y+h,z,r*.86,'dark');if(bucket){const arc=new THREE.TorusGeometry(r*.87,.023,6,20,Math.PI);inst(arc,'iron',x,y+h,z);}else {beam([x+r*.86,y+h*.26,z],[x+r+.18,y+h*.26,z],.043,'iron');box(x+r+.12,y+h*.33,z,.07,.13,.06,'iron');}}
 // Shed: fitted feet, floorboards, four boarded walls, framed open south doorway, complete gable roof.
 const sx=-45.5,sz=-73.5,sw=2.6,sd=2.5;reserve(sx,sz,2.1);
 const fy=Math.max(...[-1,0,1].flatMap(a=>[-1,0,1].map(b=>ground(sx+a*sw/2,sz+b*sd/2))))+.18, eave=fy+2.05;
 for(const a of [-1,1])for(const b of [-1,1]){foot(sx+a*1.17,sz+b*1.10,fy+.08,.11);box(sx+a*1.19,fy+1.03,sz+b*1.15,.15,2.16,.15,'dark');}
 for(let k=0;k<13;k++)box(sx-1.2+k*.2,fy,sz,.185,.12,sd,'board');
 for(const side of [-1,1]){for(let k=0;k<13;k++)box(sx+side*sw/2,fy+1,sz-1.2+k*.2,.075,2,.185,k%3?'wood':'board');for(const level of [.13,1.90])box(sx+side*sw/2,fy+level,sz,.14,.13,sd+.10,'dark');}
 for(let k=0;k<13;k++){const xx=sx-1.2+k*.2;box(xx,fy+1,sz+sd/2,.185,2,.075,k%3?'wood':'board');if(Math.abs(xx-sx)>.5)box(xx,fy+1,sz-sd/2,.185,2,.075,k%3?'wood':'board');else box(xx,fy+1.95,sz-sd/2,.185,.10,.075,'board');}
 for(const zz of [sz-sd/2,sz+sd/2]){box(sx,eave-.05,zz,sw+.12,.14,.14,'dark');for(let k=0;k<13;k++){const xx=-1.2+k*.2,hh=.61*(1-Math.abs(xx)/1.3);box(sx+xx,eave+hh/2,zz,.185,hh,.07,'board');}}
 for(const a of [-.55,.55])box(sx+a,fy+.95,sz-sd/2-.045,.10,1.95,.13,'dark');
 // Sliding door parked left of its open aperture, with battens, handle, top track.
 for(let k=0;k<5;k++)box(sx-1.36+k*.19,fy+.95,sz-sd/2-.12,.17,1.8,.08,'light');
 for(const yy of [.27,1.50])box(sx-.98,fy+yy,sz-sd/2-.18,.96,.10,.08,'dark');
 box(sx,eave-.1,sz-sd/2-.17,2.3,.09,.09,'iron');box(sx-.64,fy+1.0,sz-sd/2-.22,.04,.2,.04,'iron');
 const angle=Math.atan2(.70,1.52),slopeLen=Math.hypot(.70,1.52);
 for(const side of [-1,1])for(let k=0;k<15;k++){const zz=sz-1.46+k*.208;box(sx+side*.76,eave+.35,zz,slopeLen,.09,.199,k%3?'roof':'roofLight',0,0,-side*angle);}
 box(sx,eave+.73,sz,.17,.13,3.15,'dark');
 for(const side of [-1,1]){box(sx+side*1.53,eave,sz,.12,.16,3.17,'dark');for(const zz of [sz-1.56,sz+1.56])beam([sx,eave+.71,zz],[sx+side*1.54,eave,zz],.062,'dark');}
 beam([sx-1.27,fy+.2,sz+1.30],[sx+1.27,fy+1.82,sz+1.30],.044,'light');
 box(sx,fy+.74,sz+.91,2.26,.10,.42,'wood');for(const xx of [-.95,.95])box(sx+xx,fy+.38,sz+.96,.08,.72,.09,'dark');basket(sx-.60,sz+.91,.26,.31,fy+.80);
 box(sx,ground(sx,sz-1.48)+.07,sz-1.48,1.03,.14,.36,'stone');
 // Covered fuel rack, oriented so the pale split ends face south into the working yard.
 const rx=-41.15,rz=-75.38,ry= Math.max(...[-1,1].flatMap(a=>[-1,1].map(b=>ground(rx+a*1.3,rz+b*.42))))+.18;reserve(rx,rz,1.62);
 for(const a of [-1,1])for(const b of [-1,1]){foot(rx+a*1.35,rz+b*.42,ry+.04,.075);box(rx+a*1.35,ry+.72,rz+b*.42,.12,1.48,.12,'dark');}
 for(const b of [-1,1])box(rx,ry,rz+b*.38,2.85,.12,.13,'dark');
 for(let j=0;j<10;j++)box(rx-1.35+j*.3,ry+1.54,rz,.29,.10,1.35,'roof',.10);
 // A split-log prism has bark sides and two pale end faces; all copies share geometry.
 const shape=[[-.11,-.075],[.11,-.075],[.135,.025],[.065,.105],[-.075,.10],[-.135,.02]];
 const verts=[],ids=[];for(const z of [-.48,.48])for(const [x,y]of shape)verts.push(x,y,z);
 for(let i=0;i<6;i++){const j=(i+1)%6;ids.push(i,j,6+j,i,6+j,6+i);}const barkCount=ids.length;for(let i=1;i<5;i++){ids.push(0,i+1,i,6,6+i,7+i);}const logGeo=new THREE.BufferGeometry();logGeo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));logGeo.setIndex(ids);logGeo.addGroup(0,barkCount,0);logGeo.addGroup(barkCount,ids.length-barkCount,1);logGeo.computeVertexNormals();
 // Multi-material mesh instancing is collected separately.
 mats.log=[mats.bark,mats.end];
 const growthRing=new THREE.TorusGeometry(.056,.005,3,9,Math.PI*1.4);
 for(let row=0;row<6;row++)for(let col=0;col<9;col++){const x=rx-1.14+col*.28+(row%2)*.07,y=ry+.15+row*.20,z=rz+Math.sin(col*3+row)*.055;inst(logGeo,'log',x,y,z,1,1,1,0,0,(col%3-1)*.12);for(const end of [-1,1]){inst(growthRing,'bark',x,y,z+end*.485,1,.7,1,0,0,col*.6);}}
 // Chopping block with bark facets, growth rings, split pieces and an embedded axe.
 const cx=-42.25,cz=-72.45,cy=ground(cx,cz);reserve(cx,cz,.78);inst(cyl,'bark',cx,cy+.28,cz,.38,.56,.34);inst(cyl,'end',cx,cy+.568,cz,.365,.02,.325);for(const r of [.10,.18,.27])hoop(cx,cy+.582,cz,r,'bark');
 for(let j=0;j<12;j++){const a=j*Math.PI/6;beam([cx+Math.cos(a)*.375,cy+.02,cz+Math.sin(a)*.337],[cx+Math.cos(a)*.366,cy+.51,cz+Math.sin(a)*.328],.01,'dark');}
 beam([cx-.05,cy+.53,cz],[cx+.43,cy+1.4,cz+.05],.031,'light');box(cx+.03,cy+.70,cz,.32,.23,.055,'iron',0,0,-.5);
 for(let j=0;j<4;j++)inst(logGeo,'log',cx+.55+(j%2)*.27,ground(cx+.55,cz+.4)+.14+Math.floor(j/2)*.17,cz+.5,1,1,.57,0,(j%2)*.3,.4);
 for(let j=0;j<13;j++)box(cx+Math.sin(j*7)*.7,ground(cx,cz)+.025,cz+Math.cos(j*9)*.69,.035,.025,.10,'end',0,j,0);
 barrel(-39.50,-71.0,.46,1.17);barrel(-39.90,-72.25,.24,.43,true);
 // Low tool bench; clear east passage remains at x=-37.96.
 const bx=-40.05,bz=-69.45,by=Math.max(ground(bx-.75,bz),ground(bx+.75,bz))+.69;reserve(bx,bz,1.03);
 for(const a of [-1,1])for(const b of [-1,1])foot(bx+a*.73,bz+b*.25,by,.055);
 for(let j=0;j<3;j++)box(bx,by,bz-.24+j*.24,1.65,.10,.22,'light');
 for(let j=0;j<5;j++)hoop(bx-.40,by+.07+j*.028,bz,.17+j*.012,'reed');
 beam([bx+.12,by+.07,bz],[bx+.55,by+.07,bz+.08],.025,'wood');box(bx+.58,by+.08,bz+.08,.17,.07,.08,'iron');
 // Rake and spade leaning against shed's east wall, handles and blades visible.
 for(const t of [0,1]){const xx=sx+1.57,zz=sz+.25+t*.52,yy=ground(xx,zz);beam([xx+.28,yy+.15,zz],[xx,yy+1.73,zz],.026,'light');if(t===0){beam([xx+.06,yy+.10,zz],[xx+.50,yy+.10,zz],.023,'iron');for(let k=0;k<6;k++)beam([xx+.06+k*.09,yy+.10,zz],[xx+.06+k*.09,yy+.03,zz-.12],.011,'iron');}else box(xx+.26,yy+.20,zz,.22,.33,.035,'iron',0,0,-.17);}
 basket(-46.8,-71.6,.39,.48);basket(-40.7,-73.65,.32,.38);
 // Both sides of the entrance; no item enters x=[-44.2,-41.8].
 vessel(-45.8,-58.6,.42,.57,'clay',true);vessel(-40.1,-58.5,.36,.52,'blue',true);
 basket(-46.75,-58.1,.34,.39);basket(-39.1,-58.15,.38,.42);
 for(let j=0;j<5;j++){const a=j*2.4;inst(sphere,'end',-39.1+Math.cos(a)*.14,ground(-39.1,-58.15)+.36,-58.15+Math.sin(a)*.13,.10,.12,.10);}
 vessel(-45.0,-59.15,.23,.31,'blue',true);
 for(const b of batches.values()){const m=new THREE.InstancedMesh(b.geo,mats[b.mat],b.items.length);b.items.forEach((matrix,i)=>m.setMatrixAt(i,matrix));m.castShadow=true;m.receiveShadow=true;g.add(m);}
 return g;
}
