import { heightAt, roadNetwork, layout } from './root.js';

export function build(THREE,ctx){
 const group=new THREE.Group();group.name='se-shed: domestic utility and kitchen garden';
 const lot=layout().town.lots[4],ox=lot.x+7,oz=lot.z+64,roads=roadNetwork();
 const palette={wood:0x796044,light:0xa38a60,dark:0x483b2d,board:0x88704e,iron:0x42494a,roof:0x505b5a,seam:0x66716c,stone:0x929081,soil:0x584b35,ridge:0x6b573a,bark:0x53422e,cut:0xc3a473,ring:0x907244,straw:0xb69a60,strawDark:0x857044,terra:0x9f674b,glaze:0x687b69,leaf:0x47723d,lightLeaf:0x72964e,darkLeaf:0x345b35,water:0x435d5a,radish:0xd8d0a6};
 const geos={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(1,1,1,12),ball:new THREE.SphereGeometry(1,8,6),ring:new THREE.TorusGeometry(1,.06,5,24),leaf:new THREE.SphereGeometry(1,7,4),rock:new THREE.DodecahedronGeometry(1,0)};
 const mats=Object.fromEntries(Object.entries(palette).map(([k,color])=>[k,new THREE.MeshStandardMaterial({color,roughness:k==='water'?.3:.93})]));
 const batches={},tmp=new THREE.Object3D(),up=new THREE.Vector3(0,1,0);
 const ground=(x,z)=>heightAt(x+ox,z+oz)+.09;
 function form(shape,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){tmp.position.set(x+ox,y,z+oz);tmp.rotation.set(rx,ry,rz);tmp.scale.set(sx,sy,sz);tmp.updateMatrix();(batches[shape+'|'+mat]??=[]).push(tmp.matrix.clone());}
 const box=(m,x,y,z,w,h,d,rx=0,ry=0,rz=0)=>form('box',m,x,y,z,w,h,d,rx,ry,rz);
 function beam(m,a,b,r=.03){const delta=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]);tmp.position.set((a[0]+b[0])/2+ox,(a[1]+b[1])/2,(a[2]+b[2])/2+oz);tmp.quaternion.setFromUnitVectors(up,delta.clone().normalize());tmp.scale.set(r,delta.length(),r);tmp.updateMatrix();(batches['cyl|'+m]??=[]).push(tmp.matrix.clone());}
 function hoop(m,x,y,z,r,thick=.035){form('ring',m,x,y,z,r,r,r,Math.PI/2);}
 function footprint(x,z,w,d,name){const r=Math.hypot(w,d)/2,xx=x+ox,zz=z+oz;if(xx-w/2<-12.7||xx+w/2>-1.2||zz-d/2<-78||zz+d/2>-56.4)throw new Error(name+' outside region');for(const road of roads)for(let i=1;i<road.points.length;i++){const a=road.points[i-1],b=road.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((xx-a[0])*dx+(zz-a[1])*dz)/(dx*dx+dz*dz)));if(Math.hypot(xx-a[0]-t*dx,zz-a[1]-t*dz)<road.width/2+r+.3)throw new Error(name+' road collision');}}
 // Raised utility shed; all four feet independently meet the existing slope.
 const sx=-10,sz=-74.65,w=3,d=2.6;
 footprint(sx,sz,3.55,3.12,'utility shed roof');
 const floor=Math.max(...[-1,0,1].flatMap(i=>[-1,0,1].map(j=>ground(sx+i*w/2,sz+j*d/2))))+.25;
 for(const x of [sx-w/2+.13,sx+w/2-.13])for(const z of [sz-d/2+.13,sz+d/2-.13]){let y=ground(x,z);box('stone',x,(y+floor)/2,z,.4,floor-y+.04,.4);box('dark',x,floor+1.04,z,.15,2.15,.15);}
 for(let i=0;i<15;i++)box(i%3?'board':'wood',sx-w/2+(i+.5)*w/15,floor,sz,w/15-.015,.12,d);
 // Back and front boards, leaving a framed north-facing door opening.
 for(let i=0;i<18;i++){const x=sx-w/2+(i+.5)*w/18;box(i%3?'board':'wood',x,floor+1,sz-d/2,w/18-.009,1.95,.085);if(Math.abs(x-sx)>.56)box(i%3?'wood':'board',x,floor+1,sz+d/2,w/18-.009,1.95,.085);}
 for(const side of [-1,1]){for(let i=0;i<16;i++)box(i%3?'board':'wood',sx+side*w/2,floor+1,sz-d/2+(i+.5)*d/16,.085,1.95,d/16-.009);for(const yy of [.2,1.87])box('dark',sx+side*w/2,floor+yy,sz,.13,.12,d);}
 for(const z of [sz-d/2,sz+d/2])for(const yy of [.15,1.98])box('dark',sx,floor+yy,z,w,.12,.13);
 for(const x of [sx-.57,sx+.57])box('dark',x,floor+.95,sz+d/2+.045,.11,1.9,.13);
 for(let i=0;i<7;i++)box(i%2?'wood':'light',sx-.49+i*.163,floor+.91,sz+d/2+.075,.153,1.77,.075);
 for(const yy of [.24,1.55])box('dark',sx,floor+yy,sz+d/2+.125,1.04,.1,.06);
 beam('dark',[sx-.47,floor+.28,sz+d/2+.15],[sx+.47,floor+1.49,sz+d/2+.15],.042);
 for(const yy of [.32,1.5]){box('iron',sx-.46,floor+yy,sz+d/2+.177,.24,.055,.035);form('cyl','iron',sx-.59,floor+yy,sz+d/2+.18,.033,.16,.033);}
 box('iron',sx+.32,floor+.92,sz+d/2+.18,.24,.045,.05);box('iron',sx+.4,floor+.9,sz+d/2+.21,.045,.15,.04);
 for(const x of [sx-.45,sx+.45])for(const yy of [.24,1.55])form('ball','iron',x,floor+yy,sz+d/2+.164,.023,.023,.012);
 // Complete gable roof, north/south slopes with seams and framed gable infill.
 const rise=.65,half=d/2+.22,ang=Math.atan2(rise,half),roofLen=Math.hypot(half,rise),eave=floor+2.04;
 for(const side of [-1,1]){box('roof',sx,eave+rise/2,sz+side*half/2,w+.5,.085,roofLen,side*ang);for(let i=0;i<=12;i++)box('seam',sx-(w+.5)/2+i*(w+.5)/12,eave+rise/2+.06,sz+side*half/2,.027,.025,roofLen,side*ang);box('dark',sx,eave,sz+side*half,w+.57,.15,.11);for(let i=0;i<7;i++)box('wood',sx-1.47+i*.49,eave+rise/2-.10,sz+side*half/2,.06,.1,roofLen,side*ang);}
 box('seam',sx,eave+rise+.05,sz,w+.57,.12,.15);
 for(const side of [-1,1]){for(let i=0;i<15;i++){const z=sz-d/2+(i+.5)*d/15,h=rise*(1-Math.abs(z-sz)/half);box('board',sx+side*w/2,eave+h/2-.015,z,.09,h,d/15-.007);}for(const s of [-1,1])beam('dark',[sx+side*(w/2+.18),eave-.04,sz+s*half],[sx+side*(w/2+.18),eave+rise,sz],.065);}
 const stepY=ground(sx,sz+d/2+.31);box('stone',sx,stepY+.12,sz+d/2+.32,1.1,.24,.45);
 // Firewood rack with separated split billets, endgrain and restraining posts.
 footprint(-10,-70.3,2.9,.92,'firewood rack');
 const ry=Math.max(ground(-11.4,-70.3),ground(-8.6,-70.3))+.16;
 for(const x of [-11.4,-8.6])for(const z of [-70.7,-69.9]){const y=ground(x,z);box('dark',x,(y+ry+1.23)/2,z,.1,ry+1.23-y,.1);}
 for(const z of [-70.66,-69.94])box('wood',-10,ry,z,2.9,.13,.09);
 for(let row=0;row<5;row++)for(let col=0;col<10-row%2;col++){const x=-11.25+col*.263+(row%2)*.13,y=ry+.12+row*.21,len=.64+.07*Math.sin(row+col);form('cyl','bark',x,y,-70.3,.13,len,.12,Math.PI/2,0,.3);for(const sign of [-1,1]){form('cyl','cut',x,y,-70.3+sign*(len/2+.004),.113,.009,.105,Math.PI/2);form('ring','ring',x,y,-70.3+sign*(len/2+.013),.07,.06,.07);beam('dark',[x,y,-70.3+sign*(len/2+.022)],[x+.063,y+.043,-70.3+sign*(len/2+.022)],.005);}box('cut',x,y+.085,-70.3,.13,.027,len,0,0,.23);}
 box('roof',-10,ry+1.32,-70.3,3.04,.09,1.02,.08);
 // Two bulging stave barrels, iron hoops, open water and a small spout.
 function barrel(x,z,r,h){footprint(x,z,r*2.2,r*2.2,'rain barrel');const y=ground(x,z);for(let i=0;i<20;i++){const a=i/20*Math.PI*2;for(let k=0;k<4;k++){const rr=r*(.85+.15*Math.sin((k+.5)/4*Math.PI));box(i%4?'wood':'light',x+Math.cos(a)*rr,y+(k+.5)*h/4,z+Math.sin(a)*rr,r*.29,h/4-.009,.055,0,Math.PI/2-a);}}for(const t of [.12,.47,.86])hoop('iron',x,y+h*t,z,r*(.85+.15*Math.sin(t*Math.PI)));hoop('light',x,y+h,z,r*.87);form('cyl','water',x,y+h-.08,z,r*.81,.02,r*.81);box('iron',x,y+.18,z+r+.06,.095,.09,.18);box('iron',x,y+.27,z+r+.12,.16,.04,.04);}
 barrel(-7.55,-75.7,.43,1.02);barrel(-7.42,-74.5,.36,.83);
 // Planted raised ridges follow the slope in small cells; cabbages and daikon differ.
 function bed(x,z,w,d,type){footprint(x,z,w+.15,d+.15,'vegetable bed');for(let i=0;i<12;i++)for(let j=0;j<8;j++){let xx=x-w/2+(i+.5)*w/12,zz=z-d/2+(j+.5)*d/8;box('soil',xx,ground(xx,zz)+.055,zz,w/12+.012,.1,d/8+.012);}for(const side of [-1,1])for(let i=0;i<12;i++){let xx=x-w/2+(i+.5)*w/12,zz=z+side*d/2;box('wood',xx,ground(xx,zz)+.13,zz,w/12+.008,.2,.08);}for(const side of [-1,1])for(let j=0;j<8;j++){let xx=x+side*w/2,zz=z-d/2+(j+.5)*d/8;box('wood',xx,ground(xx,zz)+.13,zz,.08,.2,d/8+.008);}
 for(let row=0;row<3;row++){let zz=z-d/2+.36+row*(d-.72)/2;for(let i=0;i<15;i++){let xx=x-w/2+.17+i*(w-.34)/14;form('ball','ridge',xx,ground(xx,zz)+.1,zz,.15,.095,.17);}for(let col=0;col<6;col++){let xx=x-w/2+.34+col*(w-.68)/5,yy=ground(xx,zz)+.2;if(type==='cabbage'){form('ball','lightLeaf',xx,yy+.14,zz,.17,.17,.17);for(let k=0;k<7;k++){let a=k*6.283/7;form('leaf',k%2?'leaf':'lightLeaf',xx+Math.cos(a)*.14,yy+.09,zz+Math.sin(a)*.14,.13,.045,.2,.35,-a,.2);beam('darkLeaf',[xx,yy+.08,zz],[xx+Math.cos(a)*.23,yy+.15,zz+Math.sin(a)*.23],.006);}}else{form('ball','radish',xx,yy,zz,.065,.1,.065);for(let k=0;k<6;k++){let a=k*1.047;form('leaf',k%2?'darkLeaf':'leaf',xx+Math.cos(a)*.075,yy+.23,zz+Math.sin(a)*.075,.042,.25,.065,Math.sin(a)*.48,a,Math.cos(a)*.48);}}}}
 box('light',x+w/2-.2,ground(x+w/2-.2,z+d/2)+.32,z+d/2,.05,.55,.04);box('wood',x+w/2-.2,ground(x+w/2-.2,z+d/2)+.54,z+d/2,.24,.13,.04);}
 bed(-4.25,-75.05,3.35,2.08,'cabbage');bed(-4.25,-71.75,3.35,2.05,'daikon');
 // Chopping block, embedded axe, loose split pieces and fine woven harvest basket.
 footprint(-7.35,-71.53,.65,.65,'chopping block');const cy=ground(-7.35,-71.53);form('cyl','bark',-7.35,cy+.25,-71.53,.3,.5,.28);form('cyl','cut',-7.35,cy+.51,-71.53,.28,.018,.26);hoop('ring',-7.35,cy+.524,-71.53,.18);beam('wood',[-7.35,cy+.56,-71.53],[-7.12,cy+1.23,-71.49],.032);box('iron',-7.33,cy+.69,-71.53,.27,.18,.045,0,0,-.2);
 function basket(x,z){footprint(x,z,.68,.68,'basket');let y=ground(x,z);form('cyl','strawDark',x,y+.025,z,.23,.05,.23);for(let k=0;k<12;k++)hoop(k%2?'straw':'strawDark',x,y+.05+k*.027,z,.235+k*.005);for(let i=0;i<24;i++){let a=i/24*6.283;beam('straw',[x+Math.cos(a)*.235,y+.04,z+Math.sin(a)*.235],[x+Math.cos(a)*.3,y+.38,z+Math.sin(a)*.3],.009);}hoop('straw',x,y+.38,z,.3);for(const s of [-1,1])form('ring','strawDark',x+s*.28,y+.39,z,.09,.12,.09,0,Math.PI/2);for(let i=0;i<5;i++)form('ball','lightLeaf',x+Math.cos(i*2.4)*.13,y+.28,z+Math.sin(i*2.4)*.13,.095,.1,.09);}
 basket(-6.15,-70.35);
 function pot(x,z,r,mat='terra'){footprint(x,z,r*2.5,r*2.5,'herb pot');let y=ground(x,z),h=r*1.4;form('cyl',mat,x,y+h/2,z,r*.84,h,r*.84);hoop(mat,x,y+h,z,r);form('cyl','soil',x,y+h-.025,z,r*.91,.035,r*.91);for(let i=0;i<12;i++){let a=i*2.4;let xx=x+Math.cos(a)*r*.45,zz=z+Math.sin(a)*r*.45;beam('darkLeaf',[xx,y+h,zz],[xx,y+h+.2+(i%3)*.07,zz],.008);form('leaf',i%2?'leaf':'lightLeaf',xx,y+h+.18,zz,.05,.14,.05,.4,a,.3);}}
 for(const [x,z,r] of [[-11.55,-71.7,.22],[-8.15,-73,.23],[-5.75,-69.55,.24],[-3.05,-69.5,.2],[-10.7,-58.1,.24],[-10,-58.25,.19],[-3.45,-58.15,.25],[-2.8,-58.3,.19]])pot(x,z,r,x<-7?'terra':'glaze');
 // Sparse fitted pavers articulate the usable central path, leaving the rest as yard.
 for(let i=0;i<8;i++){const x=-6.65+.09*Math.sin(i*2),z=-76.1+i*.81;form('rock','stone',x,ground(x,z)+.045,z,.25,.06,.27,0,i*.7);}
 for(const [key,matrices] of Object.entries(batches)){const [shape,mat]=key.split('|'),mesh=new THREE.InstancedMesh(geos[shape],mats[mat],matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}
 return group;
}
