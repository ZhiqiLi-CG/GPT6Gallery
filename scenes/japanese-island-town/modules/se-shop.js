import { heightAt, roadNetwork, layout } from './root.js';

export function build(THREE, ctx) {
  const group=new THREE.Group();group.name='se-shop fishmonger and worked rear yard';
  const lot=layout().town.lots[5], roads=roadNetwork(), ox=lot.x-5, oz=lot.z+64;
  const H=(x,z)=>heightAt(x+ox,z+oz)+.095;
  const palette={wood:0x89694a,dark:0x53412e,light:0xa4885c,iron:0x3e4544,straw:0xb39a67,strawDark:0x8d754c,silver:0xb9ceca,back:0x526e73,eye:0x171f21,white:0xe5dfc8,leaf:0x47733e,leafLight:0x739058,soil:0x65503c,carrot:0xc28746,eggplant:0x514358,cloth:0x526f7c,cream:0xc7bfa6,water:0x526d6a};
  const mats=Object.fromEntries(Object.entries(palette).map(([k,color])=>[k,new THREE.MeshStandardMaterial({color,roughness:k==='silver'?.42:.92,metalness:k==='silver'?.25:0,side:THREE.DoubleSide})]));
  const shapes={box:new THREE.BoxGeometry(1,1,1),ball:new THREE.SphereGeometry(1,12,8),rod:new THREE.CylinderGeometry(1,1,1,10),cone:new THREE.ConeGeometry(1,1,10),ring:new THREE.TorusGeometry(1,.065,6,32),thinRing:new THREE.TorusGeometry(1,.022,5,32)};
  const batches={},dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0);
  function shape(g,m,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){dummy.position.set(x+ox,y,z+oz);dummy.rotation.set(rx,ry,rz);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();(batches[g+'|'+m]??=[]).push(dummy.matrix.clone());}
  const box=(m,x,y,z,w,h,d,rx=0,ry=0,rz=0)=>shape('box',m,x,y,z,w,h,d,rx,ry,rz);
  const ball=(m,x,y,z,a,b,c,rx=0,ry=0,rz=0)=>shape('ball',m,x,y,z,a,b,c,rx,ry,rz);
  function beam(m,a,b,r){const v=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]);dummy.position.set((a[0]+b[0])/2+ox,(a[1]+b[1])/2,(a[2]+b[2])/2+oz);dummy.quaternion.setFromUnitVectors(up,v.clone().normalize());dummy.scale.set(r,v.length(),r);dummy.updateMatrix();(batches['rod|'+m]??=[]).push(dummy.matrix.clone());}
  function ring(m,x,y,z,r,rx=Math.PI/2,ry=0,thin=false){shape(thin?'thinRing':'ring',m,x,y,z,r,r,r,rx,ry);}
  const checks=[];
  function reserve(name,x,z,w,d){const r=Math.hypot(w,d)/2;for(const road of roads)for(let i=1;i<road.points.length;i++){const a=road.points[i-1],b=road.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x+ox-a[0])*dx+(z+oz-a[1])*dz)/(dx*dx+dz*dz)));if(Math.hypot(x+ox-a[0]-t*dx,z+oz-a[1]-t*dz)<road.width/2+r+.3)throw Error(name+' encroaches '+road.id);}
    if(x-w/2<-.8||x+w/2>10.8||z-d/2<-78||z+d/2>-56.4)throw Error(name+' outside lot');
    if(z+d/2>-60.6&&z-d/2<-56.4&&x+w/2>3.6&&x-w/2<6.4)throw Error(name+' obstructs entrance');
    if(x+w/2>.55&&x-w/2<9.45&&z+d/2>-67.9&&z-d/2<-60.1)throw Error(name+' touches house');checks.push({name,x,z,w,d});
  }
  function tray(x,y,z,w,d){for(let j=0;j<4;j++)box('light',x,y,z-d/2+(j+.5)*d/4,w,.045,d/4-.012);for(const s of [-1,1]){box('wood',x+s*w/2,y+.095,z,.04,.19,d+.05);box('wood',x,y+.095,z+s*d/2,w,.19,.04);}}
  function veg(x,y,z,type,k=0){if(type===0){ball('leafLight',x,y+.115,z,.14,.12,.13);for(let j=0;j<6;j++){const a=j*1.047;ball(j%2?'leaf':'leafLight',x+.07*Math.cos(a),y+.115,z+.07*Math.sin(a),.065,.13,.08,.3,a,.3);}}
    else if(type===1){ball('white',x,y+.09,z,.065,.07,.19,0,.2);for(let j=0;j<4;j++)ball('leaf',x+.028*(j-1.5),y+.17,z-.15,.027,.15,.025,.5,0,(j-1.5)*.2);}
    else {ball('eggplant',x,y+.075,z,.07,.07,.15,0,.3);ball('leaf',x,y+.11,z-.12,.08,.025,.06);}}
  function basket(x,y,z,r=.34,contents=0){shape('rod','strawDark',x,y+.035,z,r*.73,.07,r*.73);for(let j=0;j<9;j++){const h=.07+j*.035;ring(j%2?'straw':'strawDark',x,y+h,z,r*(.75+.25*j/8),Math.PI/2,0,true);}ring('straw',x,y+.37,z,r);
    for(let j=0;j<24;j++){const a=j/24*Math.PI*2;beam('straw',[x+Math.cos(a)*r*.74,y+.04,z+Math.sin(a)*r*.74],[x+Math.cos(a)*r,y+.37,z+Math.sin(a)*r],.013);}
    for(let j=0;j<5;j++){const a=j*2.4;veg(x+Math.cos(a)*r*.48,y+.29,z+Math.sin(a)*r*.48,contents,j);}}
  function fish(x,y,z,flip=1){ball('silver',x,y+.055,z,.095,.055,.28);ball('back',x-.014,y+.096,z-.025,.056,.012,.205);ball('silver',x,y+.04,z+.25,.028,.035,.065);
    for(const s of [-1,1]){ball('back',x+s*.048,y+.052,z+.32,.047,.015,.10,0,s*.5);ball('silver',x+s*.10,y+.047,z-.01,.065,.012,.08,0,s*.45);ball('white',x+s*.071,y+.077,z-.183,.025,.014,.026);ball('eye',x+s*.077,y+.09,z-.183,.012,.009,.014);}
    for(let j=0;j<4;j++)beam('back',[x-.078,y+.073,z-.11+j*.024],[x+.05,y+.092,z-.1+j*.024],.003);}
  // Four independently fitted feet carry a level slatted fish counter.
  reserve('fish produce counter',1.8,-58.55,2.55,.93);
  const top=Math.max(...[.62,2.98].flatMap(x=>[-58.93,-58.17].map(z=>H(x,z))))+1.02;
  for(const x of [.62,2.98])for(const z of [-58.9,-58.2]){const y=H(x,z);box('dark',x,(y+top-.08)/2,z,.09,top-.08-y,.09);box('iron',x,y+.09,z,.101,.11,.101);}
  for(let j=0;j<6;j++)box(j%2?'light':'wood',1.8,top,-58.96+(j+.5)*.14,2.6,.08,.132);
  for(const z of [-58.9,-58.2])box('dark',1.8,top-.3,z,2.4,.095,.08);
  tray(1.14,top+.065,-58.55,1.15,.66);tray(2.44,top+.065,-58.55,1.12,.66);
  for(let i=0;i<4;i++)fish(.75+i*.25,top+.105,-58.55);
  for(let i=0;i<3;i++)for(let j=0;j<2;j++)veg(2.08+i*.31,top+.13,-58.72+j*.33,(i+j)%3);
  for(const [x,z,r,t] of [[.65,-57.5,.32,0],[1.65,-57.46,.34,1],[2.72,-57.52,.32,2]]){reserve('front woven basket',x,z,r*2+.05,r*2+.05);basket(x,H(x,z),z,r,t);}
  // Slatted crates have open sides, posts, nail heads and diagonal end braces.
  function crate(x,y,z,w=.8,d=.65,h=.65){for(let i=0;i<5;i++)box('light',x-w/2+(i+.5)*w/5,y+.045,z,w/5-.014,.08,d);for(const a of [-1,1])for(const b of [-1,1])box('dark',x+a*(w/2-.045),y+h/2,z+b*(d/2-.04),.065,h,.065);
    for(let i=0;i<4;i++)for(const s of [-1,1]){const yy=y+.16+i*(h-.18)/4;box('wood',x,yy,z+s*d/2,w,.088,.045);box('light',x+s*w/2,yy,z,.045,.088,d);for(const t of [-1,1])ball('iron',x+t*(w/2-.06),yy,z+s*(d/2+.027),.014,.014,.008);}
    beam('dark',[x-w/2,y+.1,z+d/2+.03],[x+w/2,y+h-.08,z+d/2+.03],.025);}
  function sack(x,y,z){ball('cream',x,y+.34,z,.27,.36,.24);ball('straw',x,y+.67,z,.105,.085,.10);ring('dark',x,y+.625,z,.085,Math.PI/2,0,true);for(let i=0;i<4;i++)beam('strawDark',[x+.05*(i-1.5),y+.17,z+.23],[x+.025*(i-1.5),y+.60,z+.1],.006);}
  reserve('rear handcart and shafts',2.15,-72.6,2.65,4.45);
  const cx=2.15,cz=-73.6,r=.61,wl=H(cx-1.12,cz)+r,wr=H(cx+1.12,cz)+r,cy=(wl+wr)/2;
  beam('iron',[cx-1.3,wl,cz],[cx+1.3,wr,cz],.068);
  for(const [x,y] of [[cx-1.12,wl],[cx+1.12,wr]]){ring('dark',x,y,cz,r,0,Math.PI/2);ring('iron',x,y,cz,r+.021,0,Math.PI/2,true);shape('rod','dark',x,y,cz,.115,.29,.115,0,0,Math.PI/2);for(let j=0;j<12;j++){const a=j*Math.PI/6;beam('light',[x,y,cz],[x,y+Math.cos(a)*r*.95,cz+Math.sin(a)*r*.95],.029);}ball('iron',x+(x<cx?-.16:.16),y,cz,.045,.074,.074);}
  const bed=cy+.14;
  for(let i=0;i<8;i++)box(i%2?'wood':'light',cx-.83+(i+.5)*1.66/8,bed,cz,1.66/8-.015,.12,2.08);
  for(const s of [-1,1]){box('dark',cx+s*.67,bed-.14,cz,.10,.20,2.35);for(const t of [-1,1])box('dark',cx+s*.87,bed+.35,cz+t*1.02,.085,.76,.085);for(let i=0;i<3;i++){box('wood',cx+s*.87,bed+.17+i*.18,cz,.065,.13,2.13);box('light',cx,bed+.17+i*.18,cz+s*1.05,1.75,.13,.065);}
    beam('dark',[cx+s*.67,bed-.09,cz-.85],[cx+s*.67,bed-.23,-70.53],.055);beam('light',[cx+s*.67,bed-.23,-70.86],[cx+s*.67,bed-.23,-70.46],.07);
    const sy=H(cx+s*.65,-71.85);box('dark',cx+s*.65,(sy+bed-.09)/2,-71.85,.075,bed-.09-sy,.075);}
  crate(cx-.35,bed+.065,cz-.35,.77,.74,.54);sack(cx+.47,bed+.065,cz+.3);
  reserve('rear stock crates and sacks',.95,-75.84,1.8,1.15);crate(.68,H(.68,-75.8),-75.8,.86,.8,.67);crate(.68,H(.68,-75.8)+.69,-75.8,.75,.72,.53);sack(1.62,H(1.62,-75.95),-75.95);
  // Open stave vessels show individual boards, metal hoops, dark interiors and handles.
  function tub(x,z,r,h,barrel=false){const y=H(x,z);shape('rod','dark',x,y+h*.28,z,r*.9,h*.5,r*.9);for(let j=0;j<22;j++){const a=j*Math.PI*2/22;box(j%3?'wood':'light',x+Math.cos(a)*r,y+h/2,z+Math.sin(a)*r,.065,h,2*Math.PI*r/22*.87,0,-a);}
    for(const f of [.13,.78,.95])ring('iron',x,y+h*f,z,r+.025);shape('rod','water',x,y+h*.74,z,r*.91,.012,r*.91);ring('light',x,y+h,z,r);
    if(!barrel){for(const s of [-1,1])beam('iron',[x+s*r,y+h*.78,z],[x+s*r,y+h+ r*.75,z],.014);beam('iron',[x-r,y+h+r*.75,z],[x+r,y+h+r*.75,z],.018);}else{beam('dark',[x,y+.24,z+r],[x,y+.24,z+r+.17],.035);box('iron',x,y+.29,z+r+.1,.05,.16,.045);}}
  reserve('rain barrel',9.0,-69.75,1.05,1.2);tub(9,-69.75,.45,1.17,true);
  reserve('washing buckets',6.85,-70.14,1.45,.9);tub(6.43,-70.14,.26,.45);tub(7.22,-70.12,.23,.38);
  // Rear washing line with sag, poles, pegged cloth folds and a folded stack.
  reserve('laundry and folded cloth',5.5,-75.65,3.15,.75);
  const ly=Math.max(H(4.05,-75.65),H(6.95,-75.65))+2.15;
  for(const x of [4.05,6.95]){const y=H(x,-75.65);beam('wood',[x,y,-75.65],[x,ly+.12,-75.65],.045);box('light',x,ly+.08,-75.65,.22,.05,.07);}
  for(let j=0;j<20;j++){const a=j/20,b=(j+1)/20;beam('strawDark',[4.05+2.9*a,ly-.11*Math.sin(a*Math.PI),-75.65],[4.05+2.9*b,ly-.11*Math.sin(b*Math.PI),-75.65],.012);}
  for(let i=0;i<4;i++){
    const x=4.28+i*.65,w=.51,h=i%2?.73:.94,ty=ly-.10,nx=16,ny=8,vertices=[],indices=[];
    // A continuous double-surface fabric connects its folds without gaps.
    for(let side=0;side<2;side++)for(let v=0;v<=ny;v++)for(let u=0;u<=nx;u++){
      const fx=u/nx,fy=v/ny;vertices.push(x+fx*w+ox,ty-fy*h+.018*Math.sin(fx*7)*fy,-75.65+oz+.035*Math.sin(fx*4*Math.PI)*(.3+.7*fy)+(side?-.006:.006));
    }
    const layer=(nx+1)*(ny+1);
    for(let side=0;side<2;side++)for(let v=0;v<ny;v++)for(let u=0;u<nx;u++){const a=side*layer+v*(nx+1)+u,b=a+1,c=a+nx+1,d=c+1;indices.push(a,c,b,b,c,d);}
    for(let u=0;u<nx;u++)for(const v of [0,ny]){const a=v*(nx+1)+u,b=a+1;indices.push(a,b,a+layer,b,b+layer,a+layer);}
    for(let v=0;v<ny;v++)for(const u of [0,nx]){const a=v*(nx+1)+u,b=a+nx+1;indices.push(a,b,a+layer,b,b+layer,a+layer);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const cloth=new THREE.Mesh(geo,mats[i%2?'cream':'cloth']);cloth.castShadow=true;cloth.receiveShadow=true;group.add(cloth);
    for(let j=0;j<16;j++){const f=j/16,g=(j+1)/16;beam(i%2?'straw':'back',[x+f*w,ty-h+.025+.018*Math.sin(f*7),-75.641+.035*Math.sin(f*4*Math.PI)],[x+g*w,ty-h+.025+.018*Math.sin(g*7),-75.641+.035*Math.sin(g*4*Math.PI)],.005);}
    for(const dx of [.07,w-.07])box('light',x+dx,ty+.026,-75.65,.027,.10,.037);
  }
  reserve('folded laundry bench',5.08,-74.65,1.05,.43);
  box('wood',5.08,H(5.08,-74.65)+.26,-74.65,1.05,.12,.43);for(const x of [4.65,5.5])box('dark',x,H(x,-74.65)+.12,-74.65,.08,.24,.33);for(let i=0;i<3;i++)box(i%2?'cloth':'cream',5.08,H(5.08,-74.65)+.355+i*.055,-74.65,.52,.052,.34);
  // Two worked beds have fitted soil cells, edging and individually planted leaves.
  function garden(x,z,w,d,type){reserve('vegetable bed',x,z,w+.14,d+.14);for(let i=0;i<Math.ceil(w/.3);i++)for(let j=0;j<Math.ceil(d/.3);j++){const xx=x-w/2+(i+.5)*w/Math.ceil(w/.3),zz=z-d/2+(j+.5)*d/Math.ceil(d/.3);box('soil',xx,H(xx,zz)+.035,zz,w/Math.ceil(w/.3)+.005,.07,d/Math.ceil(d/.3)+.005);}
    for(const s of [-1,1]){for(let j=0;j<Math.ceil(d/.3);j++){const zz=z-d/2+(j+.5)*d/Math.ceil(d/.3);box('wood',x+s*w/2,H(x+s*w/2,zz)+.08,zz,.065,.17,d/Math.ceil(d/.3)+.008);}for(let j=0;j<Math.ceil(w/.3);j++){const xx=x-w/2+(j+.5)*w/Math.ceil(w/.3);box('wood',xx,H(xx,z+s*d/2)+.08,z+s*d/2,w/Math.ceil(w/.3)+.008,.17,.065);}}
    for(let i=0;i<4;i++)for(let j=0;j<6;j++){const xx=x-w*.36+i*w*.24,zz=z-d*.40+j*d*.16,yy=H(xx,zz)+.075;if(type===0)veg(xx,yy,zz,0);else {ball('white',xx,yy+.055,zz,.065,.1,.06);for(let k=0;k<5;k++)ball(k%2?'leaf':'leafLight',xx+.035*Math.cos(k*1.26),yy+.2,zz+.035*Math.sin(k*1.26),.025,.22,.025,.25*Math.sin(k),0,.24*Math.cos(k));}}}
  garden(8.65,-73.28,1.72,2.14,1);garden(8.65,-75.76,1.72,1.52,0);
  reserve('herb baskets',5.85,-72.35,1.65,.72);basket(5.43,H(5.43,-72.35),-72.35,.30,0);basket(6.27,H(6.27,-72.35),-72.35,.30,1);
  for(const [key,matrices] of Object.entries(batches)){const [g,m]=key.split('|'),mesh=new THREE.InstancedMesh(shapes[g],mats[m],matrices.length);matrices.forEach((a,i)=>mesh.setMatrixAt(i,a));mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}
  group.userData.clearanceChecks=checks;
  return group;
}
