import { heightAt, roadNetwork, layout } from './root.js';

export function build(THREE, ctx) {
 const g=new THREE.Group();g.name='West household: kitchen garden, shed, washing and firewood';
 const house=layout().town.lots.find(l=>l.x===-78&&l.z===-32),roads=roadNetwork();
 if(!house||!roads.length)return g;
 const colors={wood:'#796047',board:'#8d7152',dark:'#493d30',grain:'#b99b6b',iron:'#505854',tile:'#5a686c',tile2:'#6b787b',stone:'#858678',leaf:'#527344',leaf2:'#6f8c54',heart:'#8b9c62',vein:'#9cac73',clay:'#9d6c4f',blue:'#526e76',cream:'#ccc6a8',cloth:'#586e84',cloth2:'#b6b7a0',red:'#a87b64',water:'#66817c',soil:'#64543d'};
 const mats={};for(const [k,color] of Object.entries(colors))mats[k]=new THREE.MeshStandardMaterial({color,roughness:k==='water'?.28:.88,side:THREE.DoubleSide});
 const geo={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(1,1,1,12),ball:new THREE.SphereGeometry(1,10,7),ring:new THREE.TorusGeometry(1,.06,5,20)};
 const batches=new Map(),d=new THREE.Object3D();
 function add(shape,m,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){const key=shape.uuid+m;if(!batches.has(key))batches.set(key,{shape,m,items:[]});d.position.set(x,y,z);d.rotation.set(rx,ry,rz);d.scale.set(sx,sy,sz);d.updateMatrix();batches.get(key).items.push(d.matrix.clone());}
 function box(x,y,z,w,h,dep,m='wood',rx=0,ry=0,rz=0){add(geo.box,m,x,y,z,w,h,dep,rx,ry,rz);}
 function beam(a,b,r,m='wood'){const aa=new THREE.Vector3(...a),bb=new THREE.Vector3(...b),v=bb.clone().sub(aa);const key=geo.cyl.uuid+m;if(!batches.has(key))batches.set(key,{shape:geo.cyl,m,items:[]});d.position.copy(aa.add(bb).multiplyScalar(.5));d.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());d.scale.set(r,v.length(),r);d.updateMatrix();batches.get(key).items.push(d.matrix.clone());}
 const ground=(x,z)=>heightAt(x,z)+.065;
 function post(x,z,top,r=.06,m='wood'){beam([x,heightAt(x,z)-.09,z],[x,top,z],r,m);}
 function ring(x,y,z,r,m='grain',vertical=false){add(geo.ring,m,x,y,z,r,r,r,vertical?0:Math.PI/2);}
 function pot(x,z,r=.3,h=.5,m='clay',plant=false){const y=ground(x,z),profile=[[0,0],[r*.68,0],[r*.92,h*.15],[r,h*.55],[r*.77,h*.91],[r*.81,h],[r*.65,h],[r*.62,h*.86],[r*.76,h*.5],[r*.55,h*.13],[0,h*.13]].map(p=>new THREE.Vector2(...p));add(new THREE.LatheGeometry(profile,18),m,x,y,z);if(plant){add(geo.cyl,'soil',x,y+h*.75,z,r*.66,.025,r*.66);for(let i=0;i<8;i++){let a=i*2.4;add(geo.ball,i%2?'leaf':'leaf2',x+Math.cos(a)*r*.5,y+h+.1,z+Math.sin(a)*r*.5,.11,.31,.065,.4*Math.cos(a),a,.5*Math.sin(a));}}}
 function basket(x,z,r=.38,h=.4){const y=ground(x,z);add(geo.cyl,'dark',x,y+.045,z,r*.79,.09,r*.79);for(let j=0;j<8;j++)ring(x,y+.07+j*h/8,z,r*(.8+j*.027),'grain');for(let j=0;j<22;j++){const a=j/22*Math.PI*2;beam([x+Math.cos(a)*r*.78,y,z+Math.sin(a)*r*.78],[x+Math.cos(a)*r,y+h,z+Math.sin(a)*r],.014,'board');}ring(x,y+h,z,r,'wood');}
 function stool(x,z){const y=ground(x,z),top=y+.55;for(const dx of [-.22,.22])for(const dz of [-.18,.18])beam([x+dx,ground(x+dx,z+dz),z+dz],[x+dx*.8,top-.04,z+dz*.8],.045);for(let i=0;i<3;i++)box(x,y+.57,z-.22+i*.22,.65,.09,.2,'board');beam([x-.2,y+.25,z],[x+.2,y+.25,z],.035);}
 function fence(a,b){const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.05);let prev;for(let i=0;i<=n;i++){const x=a[0]+(b[0]-a[0])*i/n,z=a[1]+(b[1]-a[1])*i/n,y=ground(x,z);post(x,z,y+.84,.055);box(x,y+.86,z,.15,.07,.15,'dark');if(prev)for(const h of [.29,.66])beam([prev[0],prev[1]+h,prev[2]],[x,y+h,z],.035,'board');prev=[x,y,z];}}
 // Fences describe the yard; the front opening is a full 2.5 m and the western stepping path is interrupted nowhere.
 fence([-83.35,-25.02],[-79.325,-25.02]);fence([-76.675,-25.02],[-72.45,-25.02]);
 fence([-91.35,-37.4],[-91.35,-26.78]);fence([-91.35,-25.24],[-91.35,-25.02]);fence([-91.35,-25.02],[-83.35,-25.02]);
 fence([-91.35,-37.4],[-84.05,-37.4]);
 // Complete 3.2 by 2.8 m storage shed, set away from the house eaves.
 const sx=-88,sz=-30,w=3.2,dep=2.8;
 const corners=[[-w/2,-dep/2],[w/2,-dep/2],[-w/2,dep/2],[w/2,dep/2]];
 const floor=Math.max(...corners.map(([x,z])=>heightAt(sx+x,sz+z)))+.23,low=Math.min(...corners.map(([x,z])=>heightAt(sx+x,sz+z)))-.14;
 box(sx,(low+floor)/2,sz,w+.14,floor-low,dep+.14,'stone');
 for(let i=0;i<11;i++)box(sx-w/2+.15+i*.29,floor+.035,sz,.27,.07,dep,'board');
 const wall=2.12,eave=floor+wall,rise=.73,run=1.65;
 for(const [dx,dz] of corners)beam([sx+dx,floor,sz+dz],[sx+dx,eave,sz+dz],.08,'dark');
 for(let i=0;i<13;i++){const x=sx-w/2+.13+i*(w-.26)/12;box(x,floor+wall/2,sz-dep/2,.23,wall,.085,i%3?'wood':'board');if(Math.abs(x-sx)>.61)box(x,floor+wall/2,sz+dep/2,.23,wall,.085,i%2?'wood':'board');}
 for(const side of [-1,1])for(let i=0;i<12;i++)box(sx+side*w/2,floor+wall/2,sz-dep/2+.12+i*(dep-.24)/11,.085,wall,.215,i%3?'wood':'board');
 for(const side of [-1,1])for(const yy of [floor+.13,eave-.12]){box(sx,yy,sz+side*dep/2,w,.1,.13,'dark');box(sx+side*w/2,yy,sz,.13,.1,dep,'dark');}
 // Dark recessed door opening, sliding plank leaf and lintel.
 box(sx,floor+.95,sz+dep/2+.01,1.18,1.9,.08,'dark');for(let i=0;i<5;i++)box(sx-.43+i*.19,floor+.95,sz+dep/2+.08,.18,1.86,.08,'board');
 for(const yy of [floor+.3,floor+1.5])box(sx-.05,yy,sz+dep/2+.135,.94,.07,.035,'dark');box(sx+.34,floor+.95,sz+dep/2+.15,.035,.21,.045,'iron');box(sx,floor+1.97,sz+dep/2+.12,1.35,.13,.18,'dark');
 const frontz=sz+dep/2+.28,gy=heightAt(sx,frontz);box(sx,(gy+floor)/2,frontz,1.3,floor-gy,.44,'stone');
 for(const side of [-1,1]){
 const vertices=[0,0,-dep/2,0,0,dep/2,0,rise,0],gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));gg.setIndex([0,1,2]);gg.computeVertexNormals();add(gg,'board',sx+side*w/2,eave,sz);
 const slope=rise/run,ang=Math.atan(slope);box(sx,eave+rise/2,sz+side*run/2,w+.55,.105,Math.hypot(run,rise),'tile',side*ang);
 for(let i=0;i<14;i++){const x=sx-(w+.55)/2+.12+i*.27;beam([x,eave+rise+.06,sz],[x,eave+.06,sz+side*run],.032,i%3?'tile2':'tile');}
 for(let j=1;j<=5;j++){const zz=j*run/5;box(sx,eave+rise-zz*slope+.065,sz+side*zz,w+.55,.035,.035,'tile2');}
 box(sx,eave-.03,sz+side*run,w+.65,.15,.12,'dark');}
 beam([sx-w/2-.34,eave+rise+.13,sz],[sx+w/2+.34,eave+rise+.13,sz],.09,'tile');
 // Tools hung on east wall, plus a wooden rake leaning against the front corner.
 for(let i=0;i<3;i++){const x=-86.26,z=-30.7+i*.49,y=ground(x,z);beam([x,y+.08,z],[x-.08,y+1.53,z+.06],.027,'board');if(i===0)box(x,y+.19,z,.1,.35,.23,'iron');if(i===1){box(x,y+1.51,z,.08,.06,.42,'dark');for(let j=0;j<6;j++)beam([x,y+1.5,z-.2+j*.08],[x+.13,y+1.35,z-.2+j*.08],.013,'wood');}if(i===2)box(x,y+.25,z,.08,.23,.2,'iron');}
 // Individual compact cabbages, six columns by five rows, with curled leaves and pale veins.
 for(let row=0;row<5;row++)for(let col=0;col<6;col++){
 const x=-90.63+col*.61,z=-36.42+row*.65,y=ground(x,z)+.1,a0=(row*7+col)*.63;
 add(geo.ball,'heart',x,y+.19,z,.19,.23,.19);
 for(let k=0;k<7;k++){const a=a0+k*Math.PI*2/7,xx=x+Math.cos(a)*.17,zz=z+Math.sin(a)*.17;add(geo.ball,k%2?'leaf':'leaf2',xx,y+.13,zz,.19,.06,.29,.23*Math.cos(a),-a,.22*Math.sin(a));beam([x,y+.17,z],[x+Math.cos(a)*.34,y+.12,z+Math.sin(a)*.34],.008,'vein');}
 }
 // Firewood shelter in the narrow gap between garden/shed and main dwelling.
 const wx=-84.95,wz=-34.8,wy=Math.max(heightAt(wx-.7,wz-.85),heightAt(wx+.7,wz+.85))+.18;
 for(const dx of [-.72,.72])for(const dz of [-.92,.92])post(wx+dx,wz+dz,wy+1.62,.055,'dark');
 for(const dx of [-.55,.55])box(wx+dx,wy,wz,.13,.13,1.95,'dark');
 for(let row=0;row<5;row++)for(let col=0;col<5;col++){
 const x=wx-.52+col*.255+(row%2)*.045,y=wy+.16+row*.225,z=wz;
 beam([x,y,z-.78],[x+.025,y,z+.78],.112,(row+col)%3?'wood':'dark');
 for(const side of [-1,1]){add(geo.cyl,'grain',x,y,z+side*.79,.10,.012,.10,Math.PI/2);for(const r of [.043,.074]){add(geo.ring,'wood',x,y,z+side*.8,r,r,r);}beam([x-.055,y-.025,z+side*.811],[x+.065,y+.016,z+side*.811],.005,'dark');}
 }
 box(wx,wy+1.68,wz,1.79,.1,2.17,'tile',.12);for(let i=0;i<7;i++)beam([wx-.8+i*.26,wy+1.84,wz-1.05],[wx-.8+i*.26,wy+1.58,wz+1.05],.025,'tile2');
 // Laundry on a sagging cross line, with folded cloth surfaces and individual wooden pegs.
 const lx0=-85.1,lx1=-80.1,lz=-26.72,ly=Math.max(ground(lx0,lz),ground(lx1,lz))+2.02;
 for(const x of [lx0,lx1]){post(x,lz,ly+.1,.065);beam([x-.26,ly,lz],[x+.26,ly,lz],.035,'dark');}
 const lineY=x=>ly-.14*Math.sin((x-lx0)/(lx1-lx0)*Math.PI);
 for(let i=0;i<20;i++){let x=lx0+(lx1-lx0)*i/20,xx=lx0+(lx1-lx0)*(i+1)/20;beam([x,lineY(x),lz],[xx,lineY(xx),lz],.014,'grain');}
 for(let c=0;c<4;c++){
 const x0=lx0+.35+c*1.1,ww=.76,hh=[1.08,.88,1.18,.92][c],p=[],idx=[],nx=12,ny=8;
 for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){const x=x0+ww*i/nx,t=j/ny;p.push(x,lineY(x)-hh*t,lz+.045+Math.sin(i/nx*Math.PI*6+c)*.055*(.25+t)+.07*t*t);if(i<nx&&j<ny){let a=j*(nx+1)+i;idx.push(a,a+1,a+nx+1,a+1,a+nx+2,a+nx+1);}}
 const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(p,3));gg.setIndex(idx);gg.computeVertexNormals();add(gg,['cloth','cream','cloth2','red'][c],0,0,0);
 for(const x of [x0+.1,x0+ww-.1])box(x,lineY(x)+.015,lz,.035,.135,.065,'board',0,0,.07);
 }
 // Staved wash tub with open water surface, iron hoops, a ribbed scrub board, basket and stool.
 const tx=-84.9,tz=-27.62,ty=ground(tx,tz);
 for(let i=0;i<18;i++){const a=i/18*Math.PI*2;box(tx+Math.cos(a)*.43,ty+.24,tz+Math.sin(a)*.43,.15,.44,.055,'board',0,Math.PI/2-a);}
 ring(tx,ty+.1,tz,.448,'iron');ring(tx,ty+.36,tz,.448,'iron');add(geo.cyl,'water',tx,ty+.26,tz,.4,.025,.4);
 box(tx,ty+.55,tz-.14,.34,.67,.045,'wood',-.27);for(let j=0;j<10;j++)box(tx,ty+.27+j*.048,tz-.055-j*.013,.31,.018,.045,'grain');
 basket(-83.75,-27.55,.38,.4);stool(-82.5,-26.65);
 pot(-74.4,-27.7,.34,.63,'clay',true);pot(-73.5,-27.55,.26,.46,'blue',true);pot(-75.22,-27.58,.27,.62,'clay');pot(-74.1,-26.75,.22,.33,'cream');
 // Low slatted household bench with bowls and basket on the eastern forecourt wing.
 const bx=-74.55,bz=-25.75,by=ground(bx,bz)+.5;
 for(const dx of [-.63,.63])for(const dz of [-.19,.19])beam([bx+dx,ground(bx+dx,bz+dz),bz+dz],[bx+dx,by,bz+dz],.04,'dark');
 for(let i=0;i<3;i++)box(bx,by,bz-.2+i*.2,1.65,.075,.18,'board');
 for(let j=0;j<3;j++){const rr=.12+j*.015;add(new THREE.LatheGeometry([new THREE.Vector2(0,0),new THREE.Vector2(rr*.6,.02),new THREE.Vector2(rr,.14),new THREE.Vector2(rr-.025,.14),new THREE.Vector2(0,.035)],14),'cream',bx-.45+j*.38,by+.04,bz);}
 basket(-73.08,-25.83,.27,.35);basket(-86.15,-32.38,.3,.4);
 // Coiled garden hose-like rope and a hand hoe stay beside the cultivated bed.
 const rx=-86.6,rz=-36.5,ry=ground(rx,rz);for(let i=0;i<4;i++)ring(rx,ry+.03+i*.022,rz,.16+i*.037,'grain');beam([-86.5,ground(-86.5,-35.8),-35.8],[-86.1,ground(-86.1,-34.4)+.13,-34.4],.024,'wood');box(-86.48,ground(-86.48,-35.75)+.08,-35.75,.3,.055,.16,'iron');
 for(const b of batches.values()){const mesh=new THREE.InstancedMesh(b.shape,mats[b.m],b.items.length);b.items.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);}
 return g;
}
