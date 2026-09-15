import { heightAt, roadNetwork, layout } from './root.js';

export function build(THREE, ctx) {
 const g=new THREE.Group();g.name='Shore-side shops and four worked yards';
 const roads=roadNetwork(),lots=layout().town.lots, batches=new Map();
 const palette={wood:'#806044',light:'#aa8960',dark:'#4c3b2b',iron:'#434945',soil:'#574d34',leaf:'#56724a',leaf2:'#789454',red:'#b66d49',pot:'#8e5946',blue:'#647d7e',cream:'#c6c0a3',stone:'#898a76',water:'#526f6c',cloth:'#a2ada6',tea:'#8d996b'};
 const geometries={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(1,1,1,12),ball:new THREE.SphereGeometry(1,8,6),rock:new THREE.DodecahedronGeometry(1,0),ring:new THREE.TorusGeometry(1,.07,5,18)};
 const dummy=new THREE.Object3D();
 function put(type,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){const key=type+'/'+mat;if(!batches.has(key))batches.set(key,[]);batches.get(key).push([x,y,z,sx,sy,sz,rx,ry,rz]);}
 function box(x,y,z,w,h,d,m='wood',rx=0,ry=0,rz=0){put('box',m,x,y,z,w,h,d,rx,ry,rz);}
 function beam(a,b,w=.07,m='wood'){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize()),e=new THREE.Euler().setFromQuaternion(q);put('box',m,...av.add(bv).multiplyScalar(.5).toArray(),w,v.length(),w,e.x,e.y,e.z);}
 function h(x,z){return heightAt(x,z)+.10;}
 function dist(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);}
 function clear(x,z,r=.1){return !roads.some(p=>p.points.slice(1).some((b,i)=>dist(x,z,p.points[i],b)<p.width/2+r+.3));}
 function ring(x,y,z,r,m='iron',rx=Math.PI/2,ry=0){put('ring',m,x,y,z,r,r,r,rx,ry);}
 function pot(x,z,r=.28,mat='pot',base=null,planted=true){const y=base??h(x,z);put('cyl',mat,x,y+r*.62,z,r*.84,r*1.24,r*.84);ring(x,y+r*1.22,z,r,mat);put('cyl','soil',x,y+r*1.2,z,r*.87,.025,r*.87);if(planted)for(let i=0;i<7;i++){const a=i*2.4;put('ball',i%2?'leaf':'leaf2',x+Math.cos(a)*r*.48,y+r*(1.4+(i%3)*.16),z+Math.sin(a)*r*.48,r*.27,r*.65,r*.13,Math.sin(a)*.6,a,Math.cos(a)*.6);}}
 function barrel(x,z,r=.38){if(!clear(x,z,r))return;const y=h(x,z);put('cyl','wood',x,y+.5,z,r,1,r);for(let i=0;i<12;i++){const a=i*Math.PI/6;box(x+Math.cos(a)*r,y+.5,z+Math.sin(a)*r,.03,.91,.038,'light',0,-a,0);}for(const yy of [.12,.5,.88])ring(x,y+yy,z,r*1.02);put('cyl','water',x,y+.96,z,r*.87,.025,r*.87);ring(x,y+.99,z,r,'dark');}
 function basket(x,z,r=.30,base=null,goods='leaf'){const y=base??h(x,z);put('cyl','light',x,y+r*.48,z,r,.85*r,r);for(let k=0;k<4;k++)ring(x,y+k*r*.22,z,r,'wood');for(let j=0;j<10;j++){const a=j*Math.PI/5;box(x+Math.cos(a)*r,y+r*.43,z+Math.sin(a)*r,.032,r*.88,.032,'wood');}if(goods)for(let k=0;k<9;k++){const a=k*2.4;put('ball',goods,x+Math.cos(a)*r*.65,y+r*.95+(k%2)*.045,z+Math.sin(a)*r*.65,.10,.10,.09);}}
 function fence(x0,z0,x1,z1,height=.92){const len=Math.hypot(x1-x0,z1-z0),n=Math.ceil(len/.23);for(let i=0;i<=n;i++){const t=i/n,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t;if(!clear(x,z,.12))continue;const y=h(x,z);box(x,y+height/2,z,.085,height,.085,'light');}const posts=Math.ceil(len/1.35);for(let i=0;i<=posts;i++){const t=i/posts,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t;if(clear(x,z,.14)){box(x,h(x,z)+height*.55,z,.16,height*1.1,.16,'wood');put('ball','dark',x,h(x,z)+height*1.1,z,.10,.045,.10);}}for(let i=0;i<n;i++){const t=i/n,u=(i+1)/n,a=[x0+(x1-x0)*t,z0+(z1-z0)*t],b=[x0+(x1-x0)*u,z0+(z1-z0)*u];if(clear(...a,.13)&&clear(...b,.13))for(const v of [.25,.72])beam([a[0],h(...a)+height*v,a[1]],[b[0],h(...b)+height*v,b[1]],.08);}}
 function openGate(x,z,dir=1){const y=h(x,z);fence(x,z,x,z+dir*.95,.82);box(x+.08,y+.48,z+dir*.16,.09,.09,.22,'iron');ring(x+.10,y+.48,z+dir*.21,.075,'iron',0,Math.PI/2);}
 function table(x,z,w=2,d=.85){const top=Math.max(h(x-w/2,z-d/2),h(x+w/2,z+d/2))+1;for(const dx of [-w*.42,w*.42])for(const dz of [-d*.36,d*.36]){const yy=h(x+dx,z+dz);box(x+dx,(top+yy)/2,z+dz,.11,top-yy,.11);}for(let j=0;j<Math.ceil(w/.2);j++)box(x-w/2+(j+.5)*w/Math.ceil(w/.2),top,z,w/Math.ceil(w/.2)-.014,.10,d,'light');beam([x-w*.43,top-.35,z],[x+w*.43,top-.35,z],.09);return top+.05;}
 function woodpile(x,z){const y=h(x,z);for(let row=0;row<3;row++)for(let col=0;col<5-row;col++){const xx=x+col*.22+row*.11-.4,yy=y+.12+row*.21;put('cyl','dark',xx,yy,z,.105,.85,.105,Math.PI/2);for(const s of [-1,1]){put('cyl','light',xx,yy,z+s*.433,.087,.012,.087,Math.PI/2);ring(xx,yy,z+s*.442,.056,'wood',0);}}box(x,y+.8,z,1.45,.08,1.05,'wood',0,0,.06);}
 // Front fence runs preserve a 2.8m door/step corridor and a single shared lot boundary.
 for(const i of [0,1,6,7]){const l=lots[i],zz=i<6?-57.05:-50.95;fence(l.x-5.45,zz,l.x-1.48,zz,.77);fence(l.x+1.48,zz,l.x+5.40,zz,.77);openGate(l.x+1.48,zz,i<6?-1:1);}
 fence(-72,-76.6,-72,-70,.95);fence(-72,-61,-72,-57.1,.85);fence(-72,-50.9,-72,-47.8,.7);
 fence(-81.5,-76.6,-77.8,-76.6);fence(-76.3,-76.6,-72,-76.6);fence(-72,-76.6,-61.2,-76.6,1.05);fence(-61.2,-76.6,-61.2,-70.5,1.05);
 fence(-83.3,-38.3,-79.8,-38.3,.58);fence(-78.2,-38.3,-73,-38.3,.58);fence(-71,-38.3,-63.9,-38.3,.62);fence(-62.5,-38.3,-60.7,-38.3,.62);
 // Produce vendor on house 0: three different vegetable baskets and stacked slatted crates.
 const produce=table(-74.6,-58.65,2,.83);for(let k=0;k<3;k++)basket(-75.25+k*.64,-58.65,.24,produce,k===0?'red':k===1?'leaf':'cream');
 for(let q=0;q<2;q++){const x=-74.45+q*.66,z=-60.1,y=h(x,z);for(let k=0;k<4;k++){box(x,y+.1+k*.12,z-.25,.54,.08,.04,'light');box(x,y+.1+k*.12,z+.25,.54,.08,.04,'light');}for(const dx of [-.25,.25])box(x+dx,y+.28,z,.04,.52,.5,'wood');basket(x,z,.22,y+.49,'red');}
 barrel(-73.15,-69.4);pot(-76.2,-59.2,.3);pot(-80.7,-69.4,.34);
 // Household goods at house 1, open shelving and visible ceramic wares.
 const goods=table(-69.3,-58.8,1.8,.8);for(let k=0;k<3;k++)pot(-69.9+k*.6,-58.8,.2,k%2?'blue':'pot',goods,false);
 for(const dx of [-.82,.82])box(-69.3+dx,goods+.58,-59.05,.09,1.2,.09,'dark');box(-69.3,goods+.72,-59.05,1.8,.07,.44,'light');for(let k=0;k<4;k++)pot(-69.9+k*.4,-59.05,.14,'cream',goods+.76,false);basket(-63,-58.7,.4,null,null);basket(-63.8,-59.9,.3,null,null);barrel(-61.15,-69.2);
 // House 6 domestic frontage: water jars, plants and a working stool.
 for(const [x,z,r] of [[-81,-49.1,.39],[-80.2,-49.8,.24],[-75,-48.9,.29]])if(clear(x,z,r))pot(x,z,r,x<-80?'blue':'pot');table(-74.8,-49.9,.8,.56);basket(-75.8,-49.1,.28,null,'cream');
 // Tea frontage of house 7: long bench, serving tray, small teapot and cups.
 const tea=table(-63.15,-49.4,1.7,.82);box(-63.15,tea+.05,-49.4,1.18,.07,.56,'dark');pot(-63.3,-49.4,.18,'blue',tea+.09,false);put('cyl','blue',-63.3,tea+.34,-49.4,.13,.04,.13);put('ball','dark',-63.3,tea+.40,-49.4,.05,.05,.05);beam([-63.44,tea+.24,-49.4],[-63.66,tea+.31,-49.4],.07,'blue');ring(-63.09,tea+.25,-49.4,.10,'blue',0);for(let j=0;j<3;j++)pot(-62.93+j*.22,-49.45,.07,'cream',tea+.10,false);
 const by=h(-69,-49.5)+.43;box(-69,by,-49.5,2.0,.12,.55,'wood');for(const dx of [-.75,.75])box(-69+dx,(by+h(-69+dx,-49.5))/2,-49.5,.13,by-h(-69+dx,-49.5),.4);pot(-61.1,-48.7,.32,'blue');
 // Low northern strips, safely below the eaves.
 woodpile(-80.1,-39.05);for(let j=0;j<4;j++)pot(-76.8+j*.65,-38.7,.20,j%2?'pot':'blue');woodpile(-69.6,-39.05);for(let j=0;j<3;j++)pot(-66.7+j*.75,-38.6,.22,'pot');
 // Vegetable beds follow the sloping terrain instead of levelling the yard.
 for(let bed=0;bed<3;bed++){const x=-79.8+bed*1.4;for(let k=0;k<9;k++){const z=-75.6+k*.51;if(!clear(x,z,.78))continue;box(x,h(x,z)+.02,z,1.02,.06,.52,'soil');for(const side of [-1,1])put('rock','stone',x+side*.6,h(x+side*.6,z)+.09,z,.12,.10,.21);for(const dx of [-.25,.25]){const xx=x+dx,yy=h(xx,z);for(let leaf=0;leaf<4;leaf++)put('ball',leaf%2?'leaf':'leaf2',xx+Math.cos(leaf*1.57)*.10,yy+.22,z+Math.sin(leaf*1.57)*.10,.15,.21,.075,0,leaf*1.57,.3);}}}
 // Laundry, independently fitted poles, line and thick draped cloth panels.
 const la=[-70.7,-75.1],lb=[-66.7,-75.1],ly=Math.max(h(...la),h(...lb))+2.25;for(const [x,z] of [la,lb])box(x,(h(x,z)+ly)/2,z,.10,ly-h(x,z),.10,'dark');beam([la[0],ly,la[1]],[lb[0],ly,lb[1]],.025,'cream');for(let i=0;i<5;i++){const x=-70.2+i*.68;box(x,ly-.48,-75.1,.52,.9,.034,i%2?'cloth':'cream',.07,0,.03);for(const dx of [-.17,.17])box(x+dx,ly-.01,-75.1,.04,.12,.07,'wood');}basket(-70.5,-73.5,.38,null,null);
 // Fitted shed: pier foundations, four boarded walls, studs, door, pitched complete roof.
 const sx=-63.6,sz=-73.4,sw=2.8,sd=3.4,sy=Math.max(...[-1,1].flatMap(a=>[-1,1].map(b=>h(sx+a*sw/2,sz+b*sd/2))))+.12;
 for(const dx of [-sw/2,sw/2])for(const dz of [-sd/2,sd/2]){const yy=h(sx+dx,sz+dz);box(sx+dx,(sy+yy)/2,sz+dz,.27,sy-yy+.05,.27,'stone');box(sx+dx,sy+1,sz+dz,.14,2,.14,'dark');}
 box(sx,sy,sz,sw,.13,sd,'wood');for(let j=0;j<14;j++)for(const side of [-1,1])box(sx-sw/2+(j+.5)*sw/14,sy+.94,sz+side*sd/2,sw/14-.015,1.85,.09,'wood');for(let j=0;j<17;j++)for(const side of [-1,1])box(sx+side*sw/2,sy+.94,sz-sd/2+(j+.5)*sd/17,.09,1.85,sd/17-.015,'light');
 box(sx,sy+.86,sz-sd/2-.07,1.06,1.68,.08,'dark');for(let j=0;j<5;j++)box(sx-.43+j*.215,sy+.86,sz-sd/2-.12,.195,1.61,.055,'light');box(sx+.34,sy+.89,sz-sd/2-.16,.09,.08,.10,'iron');for(const yy of [.3,1.5])box(sx,sy+yy,sz-sd/2-.17,1.05,.085,.055,'wood');
 const rise=.68,run=sd/2+.24,angle=Math.atan2(rise,run);for(const side of [-1,1]){box(sx,sy+1.96+rise/2,sz+side*run/2,sw+.5,.14,Math.hypot(run,rise),'dark',side*angle);for(let j=0;j<15;j++)box(sx-(sw+.4)/2+j*(sw+.4)/14,sy+2.05+rise/2,sz+side*run/2,.055,.04,Math.hypot(run,rise),'light',side*angle);}beam([sx-sw/2-.25,sy+2.70,sz],[sx+sw/2+.25,sy+2.70,sz],.14,'wood');for(const side of [-1,1])for(let j=0;j<8;j++){const zz=-sd/2+(j+.5)*sd/8,hh=rise*(1-Math.abs(zz)/(sd/2));box(sx+side*sw/2,sy+1.87+hh/2,sz+zz,.09,hh,sd/8,'wood');}
 woodpile(-68.5,-70.2);barrel(-65.65,-71.3);pot(-73.4,-75.5,.34);basket(-66.4,-76,.30,null,null);
 // Parked handcart: plank bed, tall sides, axle, hooped wheels and eight spokes per wheel.
 const cx=-74.55,cz=-72.4,cy=Math.max(h(cx-.7,cz),h(cx+.7,cz))+.50;
 box(cx,cy-.10,cz,1.65,.10,.10,'iron');for(let j=0;j<6;j++)box(cx-.5+j*.2,cy+.10,cz,.185,.10,1.65,'light');for(const side of [-1,1]){const xx=cx+side*.76;ring(xx,cy-.02,cz,.45,'iron',0,Math.PI/2);put('cyl','wood',xx,cy-.02,cz,.12,.18,.12,0,0,Math.PI/2);for(let j=0;j<8;j++){const a=j*Math.PI/4;beam([xx,cy-.02,cz],[xx,cy-.02+Math.sin(a)*.43,cz+Math.cos(a)*.43],.045,'light');}for(let j=0;j<3;j++)box(cx+side*.57,cy+.30+j*.19,cz,.06,.12,1.7,'wood');beam([cx+side*.47,cy+.05,cz+.6],[cx+side*.47,h(cx+side*.47,cz+2.4)+.15,cz+2.4],.075,'wood');}basket(cx,cz,.32,cy+.17,'leaf');
 // Irregular western boundary stones and plants avoid the full diagonal shore path.
 for(let j=0;j<53;j++){const z=-77+j*.71,x=-83.3+.28*Math.sin(j*1.7);if(!clear(x,z,.24))continue;put('rock','stone',x,h(x,z)+.08,z,.19+.05*Math.sin(j),.15,.22,0,j,0);if(j%3===0)for(let k=0;k<4;k++)put('ball','leaf',x+.20*Math.sin(k*2),h(x,z)+.24,z+.22*Math.cos(k*2),.20,.30,.13,0,k,0);}
 for(let j=0;j<21;j++){const z=-76.8+j*.35,x=-86+(-70-z)*11/13+2.25+.09*Math.sin(j*2);if(!clear(x,z,.25))continue;put('rock','stone',x,h(x,z)+.1,z,.22,.16,.21,0,j,0);if(j%3===0)put('ball','leaf2',x+.18,h(x+.18,z)+.25,z,.20,.28,.19);}
 for(const [key,items] of batches){const [type,m]=key.split('/'),mesh=new THREE.InstancedMesh(geometries[type],new THREE.MeshStandardMaterial({color:palette[m],roughness:.88}),items.length);items.forEach((v,i)=>{dummy.position.set(...v.slice(0,3));dummy.scale.set(...v.slice(3,6));dummy.rotation.set(...v.slice(6,9));dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);}
 return g;
}
