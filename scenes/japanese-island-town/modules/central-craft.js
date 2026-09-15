import {heightAt, roadNetwork, layout} from './root.js';
import {northReservations} from './north.js';
import {northCentralLayout} from './north-central.js';

export function build(THREE,ctx){
 const g=new THREE.Group();g.name='central-craft: hillside workshop and herb terraces';
 const lot=northCentralLayout().find(l=>l.index===32),sourceLot=layout().town.lots[lot.index],ox=sourceLot.x+43,oz=sourceLot.z-18;
 const roads=roadNetwork(),reservations=northReservations();
 const colors={wood:'#73533a',board:'#927451',board2:'#806347',dark:'#443c32',cut:'#bb9968',iron:'#515c5a',roof:'#526267',roof2:'#657478',stone:'#888e83',stone2:'#a0a294',moss:'#66764e',soil:'#62573f',leaf:'#4e704b',leaf2:'#6e8557',pink:'#d3a1a8',pink2:'#e2bac0',cream:'#d5c9a2',terra:'#a17858',rope:'#b2a079',water:'#708e8b'};
 const mats=Object.fromEntries(Object.entries(colors).map(([k,v])=>[k,new THREE.MeshStandardMaterial({color:v,roughness:.92,side:THREE.DoubleSide})]));
 const cube=new THREE.BoxGeometry(1,1,1),cyl=new THREE.CylinderGeometry(1,1,1,12),ball=new THREE.IcosahedronGeometry(1,1),ring=new THREE.TorusGeometry(1,.052,5,24),cone=new THREE.ConeGeometry(1,1,4),batch=new Map(),o=new THREE.Object3D();
 const H=(x,z)=>heightAt(x+ox,z+oz);
 function put(geo,m){let key=geo.uuid+m;if(!batch.has(key))batch.set(key,{geo,mat:mats[m],xs:[]});batch.get(key).xs.push(o.matrix.clone());}
 function add(geo,m,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){o.position.set(x+ox,y,z+oz);o.rotation.set(rx,ry,rz);o.scale.set(sx,sy,sz);o.updateMatrix();put(geo,m);}
 const box=(x,y,z,w,h,d,m,ry=0)=>add(cube,m,x,y,z,w,h,d,0,ry);
 function beam(a,b,r,m){let av=new THREE.Vector3(a[0]+ox,a[1],a[2]+oz),bv=new THREE.Vector3(b[0]+ox,b[1],b[2]+oz),v=bv.clone().sub(av);o.position.copy(av.add(bv).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());o.scale.set(r,v.length(),r);o.updateMatrix();put(cyl,m);}
 function clear(x,z,margin){x+=ox;z+=oz;for(const rd of roads)for(let i=1;i<rd.points.length;i++){const a=rd.points[i-1],b=rd.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));if(Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)<rd.width/2+margin)return false;}return !reservations.drains.z.some(v=>Math.abs(z-v)<reservations.drains.halfWidth+margin)&&x>-57&&x<-37&&z>10.5&&z<29;}
 // Masonry fitted independently to the ground: no hovering lower corners.
 function fitted(x,z,w,d,top,m='stone'){let base=Math.min(...[-1,1].flatMap(a=>[-1,1].map(b=>H(x+a*w/2,z+b*d/2))))-.12;box(x,(base+top)/2,z,w,top-base,d,m);}
 function stoneWall(a,b,top){const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.48);for(let i=0;i<n;i++){let x=a[0]+(b[0]-a[0])*(i+.5)/n,z=a[1]+(b[1]-a[1])*(i+.5)/n,base=H(x,z)-.13,nn=Math.max(1,Math.ceil((top-base)/.26));for(let j=0;j<nn;j++){let h=(top-base)/nn;box(x,base+(j+.5)*h,z,a[0]===b[0]?.19:Math.abs(b[0]-a[0])/n-.02,h-.017,a[1]===b[1]?.19:Math.abs(b[1]-a[1])/n-.02,(i+j)%4?'stone':'stone2');}}}
 function terrace(x,z,w,d,seed){const top=Math.max(...[-1,1].flatMap(a=>[-1,1].map(b=>H(x+a*w/2,z+b*d/2))))+.15;fitted(x,z,w-.14,d-.14,top-.065,'soil');for(const a of [-1,1]){stoneWall([x-w/2,z+a*d/2],[x+w/2,z+a*d/2],top+.11);stoneWall([x+a*w/2,z-d/2],[x+a*w/2,z+d/2],top+.11);}for(let row=0;row<2;row++)for(let j=0;j<10;j++){let xx=x-w*.4+j*w*.089,zz=z+(row-.5)*d*.42;for(let k=0;k<4;k++){let a=k*2.4+j,dx=Math.cos(a)*.11,dz=Math.sin(a)*.09;beam([xx,top,zz],[xx+dx,top+.22+(j%3)*.025,zz+dz],.014,'leaf');add(ball,(seed+j)%3?'leaf':'leaf2',xx+dx,top+.21,zz+dz,.12,.07,.08,0,a);if(seed===2||seed===0&&j%3===0){add(ball,j%2?'pink':'cream',xx+dx,top+.32,zz+dz,.07,.05,.07);}}}return top;}
 const bedA=terrace(-40,24.62,3.65,.92,0),bedB=terrace(-40,26.08,3.65,.92,1),bedC=terrace(-40,27.62,3.65,.92,2);
 // Compact complete shed; ridge runs north-south, the east door opens toward contour access.
 const sx=-47.6,sz=26.22,sw=3.05,sd=2.65,x0=sx-sw/2,x1=sx+sw/2,z0=sz-sd/2,z1=sz+sd/2;
 const floor=Math.max(H(x0,z0),H(x1,z0),H(x0,z1),H(x1,z1))+.15,wall=1.92,eave=floor+wall,rise=.72;
 fitted(sx,sz,sw,sd,floor-.12);for(const a of [-1,1]){stoneWall([x0,sz+a*sd/2],[x1,sz+a*sd/2],floor);stoneWall([sx+a*sw/2,z0],[sx+a*sw/2,z1],floor);}
 for(let i=0;i<13;i++)box(x0+(i+.5)*sw/13,floor+.035,sz,sw/13-.015,.10,sd,'board');
 // Four walls; the eastern wall is assembled around a framed door.
 for(const z of [z0,z1])for(let i=0;i<14;i++)box(x0+(i+.5)*sw/14,floor+wall/2,z,sw/14-.016,wall,.10,i%3?'board':'board2');
 for(let i=0;i<12;i++){let z=z0+(i+.5)*sd/12;box(x0,floor+wall/2,z,.10,wall,sd/12-.016,i%2?'wood':'board2');if(Math.abs(z-(sz+.22))>.48)box(x1,floor+wall/2,z,.10,wall,sd/12-.015,'board');else box(x1,eave-.12,z,.10,.24,sd/12-.015,'wood');}
 for(const x of [x0,x1])for(const z of [z0,z1])box(x,floor+wall/2,z,.15,wall+.08,.15,'wood');
 for(const z of [z0,z1]){box(sx,floor+.14,z,sw+.1,.14,.14,'wood');box(sx,eave,z,sw+.15,.15,.15,'wood');for(let i=0;i<14;i++){const x=x0+(i+.5)*sw/14,h=rise*(1-Math.abs(x-sx)/(sw/2));box(x,eave+h/2,z,sw/14-.015,h,.10,'board2');}}
 const dz=sz+.22;box(x1+.07,floor+.82,dz,.075,1.63,.86,'dark');for(let j=0;j<6;j++)box(x1+.118,floor+.83,dz-.36+j*.145,.045,1.57,.127,'board2');for(let h of [.22,1.42])box(x1+.16,floor+h,dz,.065,.09,.89,'wood');for(let z of [dz-.51,dz+.51])box(x1+.10,floor+.88,z,.18,1.81,.12,'wood');box(x1+.12,floor+1.8,dz,.18,.13,1.14,'wood');box(x1+.18,floor+.91,dz-.26,.08,.08,.19,'iron');
 for(const h of [.36,1.35])box(x1+.17,floor+h,dz+.31,.05,.055,.27,'iron');
 // Overhanging full ceramic roof panels with rows and repeated round tile ribs.
 const half=sw/2+.29,roofRise=rise+.12,theta=Math.atan2(roofRise,half),slope=Math.hypot(half,roofRise),rd=sd+.56;
 for(const side of [-1,1]){add(cube,'roof',sx+side*half/2,eave+roofRise/2,sz,slope,.12,rd,0,0,-side*theta);for(let k=0;k<18;k++){let zz=sz-rd/2+(k+.5)*rd/18;beam([sx,eave+roofRise+.075,zz],[sx+side*half,eave+.075,zz],.048,k%4?'roof':'roof2');}for(let k=1;k<5;k++){const t=k/5;box(sx+side*half*t,eave+roofRise*(1-t)+.08,sz,.035,.035,rd,'roof2');}}
 beam([sx,eave+roofRise+.12,sz-rd/2-.07],[sx,eave+roofRise+.12,sz+rd/2+.07],.115,'roof2');
 for(let k=0;k<4;k++){let xx=x1+.17+k*.24,top=floor-(k+.5)*.21;fitted(xx,dz,.245,.92,Math.max(top,H(xx,dz)+.09));}
 // Slatted shutter on the front gable and a wall-mounted tool rack.
 box(sx,floor+1.18,z0-.07,.73,.67,.07,'dark');for(let j=0;j<5;j++)box(sx-.30+j*.15,floor+1.18,z0-.13,.065,.59,.055,'wood');box(sx,floor+.84,z0-.13,.87,.08,.17,'wood');
 function basket(x,y,z,r=.27){add(cyl,'dark',x,y+.035,z,r*.8,.07,r*.8);for(let k=0;k<18;k++){let a=k*Math.PI*2/18;beam([x+Math.cos(a)*r*.72,y,z+Math.sin(a)*r*.72],[x+Math.cos(a)*r,y+r*1.15,z+Math.sin(a)*r],.015,'rope');}for(let k=0;k<7;k++){let t=k/6;add(ring,'rope',x,y+r*1.15*t,z,r*(.72+.28*t),r*(.72+.28*t),r*(.72+.28*t),Math.PI/2);}add(ring,'board',x,y+r*1.16,z,r,r,r,Math.PI/2);}
 // Bench with individually grounded feet, lower shelf, seed trays, shears, rake and hand trowel.
 const bx=-43.4,bz=24.53,bw=2.0,bd=.68,by=Math.max(H(bx-bw/2,bz-bd/2),H(bx+bw/2,bz+bd/2))+.88;
 for(const dx of [-.84,.84])for(const zz of [-.24,.24]){let yy=H(bx+dx,bz+zz);box(bx+dx,(yy+by)/2,bz+zz,.12,by-yy,.12,'wood');}
 for(let k=0;k<4;k++)box(bx,by,bz-.27+k*.18,bw,.10,.16,'board');box(bx,by-.45,bz,bw-.15,.07,bd-.08,'wood');
 basket(bx-.52,by+.06,bz,.21);basket(bx+.4,by-.41,bz,.2);
 box(bx+.3,by+.085,bz+.06,.49,.045,.30,'cut');for(let j=0;j<4;j++)box(bx+.1+j*.12,by+.12,bz+.05,.03,.055,.29,'wood');
 beam([bx+.28,by+.12,bz-.20],[bx+.75,by+.12,bz-.20],.028,'board2');add(ball,'iron',bx+.84,by+.12,bz-.20,.16,.026,.075,0,.3);
 beam([bx-.04,by+.14,bz+.20],[bx+.19,by+.14,bz+.10],.018,'iron');beam([bx-.04,by+.14,bz+.10],[bx+.20,by+.14,bz+.22],.018,'iron');for(const zz of [.11,.21])add(ring,'iron',bx-.08,by+.15,bz+zz,.055,.055,.055,Math.PI/2);
 let ry=H(-44.62,24.51);beam([-44.62,ry,24.51],[-44.51,ry+1.45,24.70],.027,'board');beam([-44.86,ry+.04,24.47],[-44.37,ry+.04,24.47],.025,'iron');for(let j=0;j<6;j++)beam([-44.86+j*.098,ry+.04,24.47],[-44.86+j*.098,ry+.02,24.30],.016,'iron');
 const basketY=H(-43.35,25.59)+.04;fitted(-43.35,25.30,.60,.60,basketY);basket(-43.35,basketY,25.30,.34);
 // Contour stones climb between the shed and beds, leaving the parent's rear access untouched.
 for(let j=0;j<20;j++){const x=-44.95+.11*Math.sin(j*.5),z=23.75+j*.23;if(clear(x,z,.46))fitted(x,z,.63,.25,H(x,z+.125)+.07,j%3?'stone':'stone2');}
 function fence(a,b){const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.82);let prev=null;for(let i=0;i<=n;i++){let t=i/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(!clear(x,z,.20)){prev=null;continue;}let y=H(x,z);box(x,y+.5,z,.115,1.12,.115,'wood');if(prev)for(let h of [.30,.81])beam([prev.x,prev.y+h,prev.z],[x,y+h,z],.036,'board');prev={x,y,z};}}
 fence([-51.7,12.0],[-51.7,22.4]);fence([-51.7,12],[-49.8,12]);fence([-48.45,12],[-44.6,12]);fence([-41.4,12],[-37.55,12]);fence([-44.6,12],[-44.6,12.8]);fence([-37.45,23.85],[-37.45,28.5]);fence([-47.4,28.5],[-37.45,28.5]);
 // Small branching blossom tree beside the uphill lane, with mossed stones at its roots.
 const tx=-50.55,tz=24.15,ty=H(tx,tz);beam([tx,ty-.12,tz],[tx+.15,ty+2.12,tz-.10],.12,'wood');for(let j=0;j<7;j++){let a=j*2.4,xx=tx+Math.cos(a)*(.5+j*.055),zz=tz+Math.sin(a)*(.5+j*.04),yy=ty+1.8+j*.13;beam([tx+.08,ty+1.1,tz],[xx,yy,zz],.048,'wood');for(let k=0;k<5;k++){let aa=k*2.4+j;add(ball,(j+k)%3?'pink':'pink2',xx+Math.cos(aa)*.26,yy+.08+Math.sin(k)*.10,zz+Math.sin(aa)*.25,.31,.22,.27);}}
 for(let j=0;j<5;j++){let x=tx+Math.cos(j*2.4)*.58,z=tz+Math.sin(j*2.4)*.48,y=H(x,z);add(ball,'stone',x,y+.10,z,.24,.20,.21);add(ball,'moss',x,y+.23,z,.20,.075,.17);}
 // Open light chamber: four stone uprights, visible opening on each side.
 const lx=-50.5,lz=21.62,ly=H(lx,lz);fitted(lx,lz,.69,.69,Math.max(H(lx-.35,lz-.35),H(lx+.35,lz+.35))+.12);const lb=H(lx,lz+.35)+.12;box(lx,lb+.36,lz,.21,.73,.21,'stone');box(lx,lb+.78,lz,.56,.14,.56,'stone2');for(const dx of [-.20,.20])for(const dz of [-.20,.20])box(lx+dx,lb+1.04,lz+dz,.07,.42,.07,'stone');box(lx,lb+.91,lz,.14,.11,.14,'cream');add(cone,'stone',lx,lb+1.34,lz,.55,.32,.55,0,Math.PI/4);add(ball,'stone',lx,lb+1.59,lz,.10,.13,.10);
 function tub(x,z,r){let y=H(x,z+r)+.03;fitted(x,z,r*1.7,r*1.7,y-.01,'stone');add(cyl,'dark',x,y+.04,z,r*.85,.08,r*.85);for(let j=0;j<16;j++){let a=j*Math.PI*2/16;box(x+Math.cos(a)*r*.93,y+.28,z+Math.sin(a)*r*.93,.12,.53,.057,'board',-a+Math.PI/2);}for(let h of [.08,.43,.55])add(ring,h===.55?'board':'iron',x,y+h,z,r,r,r,Math.PI/2);add(cyl,'water',x,y+.27,z,r*.83,.014,r*.83);}
 tub(-50.65,13,.46);tub(-50.6,14.2,.28);
 // Retained split firewood stack, with visible cut ends and a weather cap.
 const wx=-50.50,wz=17.5,wy=H(wx,wz+.65)+.12;fitted(wx,wz,1.05,1.55,wy,'stone');for(let row=0;row<4;row++)for(let j=0;j<5-row%2;j++){let x=wx-.40+j*.19+(row%2)*.09,y=wy+.11+row*.18;beam([x,y,wz-.65],[x,y,wz+.65],.09,'wood');add(cyl,'cut',x,y,wz-.66,.077,.025,.077,Math.PI/2);beam([x-.035,y,wz-.679],[x+.04,y+.014,wz-.679],.008,'dark');}for(let dx of [-.53,.53])box(wx+dx,wy+.43,wz,.08,.93,1.53,'wood');box(wx,wy+.95,wz,1.27,.085,1.68,'board2');
 function pot(x,z,r,flower){let y=H(x,z+r)+.03;fitted(x,z,r*1.45,r*1.45,y,'stone');add(cyl,'terra',x,y+r*.7,z,r*.90,r*1.35,r*.9);add(ring,'terra',x,y+r*1.4,z,r,r,r,Math.PI/2);add(cyl,'soil',x,y+r*1.38,z,r*.78,.025,r*.78);for(let j=0;j<8;j++){let a=j*2.4,xx=x+Math.cos(a)*r*.75,zz=z+Math.sin(a)*r*.75;beam([x,y+r*1.4,z],[xx,y+r*2.5,zz],.016,'leaf');add(ball,'leaf',xx,y+r*2.45,zz,r*.34,r*.32,r*.23);if(flower)add(ball,j%3?'pink':'cream',xx,y+r*2.76,zz,r*.20,r*.12,r*.20);}}
 pot(-47.6,12.85,.29,true);pot(-46.6,12.9,.32,false);pot(-45.65,13.0,.24,true);pot(-40.5,12.95,.37,false);pot(-39.5,13.0,.25,true);pot(-38.4,12.9,.33,true);
 basket(-50.5,H(-50.5,19.65)+.15,19.65,.36);fitted(-50.5,19.65,.58,.58,H(-50.5,19.65)+.15);
 for(const b of batch.values()){const mesh=new THREE.InstancedMesh(b.geo,b.mat,b.xs.length);b.xs.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);}
 return g;
}
