import { heightAt, roadNetwork, layout } from './root.js';

export function build(THREE, ctx) {
  const group = new THREE.Group(); group.name='Laundry home: washing court, bench and rear herbs';
  const lot=layout().town.lots[8], roads=roadNetwork();
  const X=dx=>lot.x+dx, Z=dz=>lot.z+dz;
  const ground=(x,z)=>heightAt(x,z)+.09;
  const palette={wood:'#a18a62',woodLight:'#b9a275',end:'#c5ac7d',dark:'#68543b',iron:'#505953',rope:'#b8aa7d',wicker:'#b39a61',wickerDark:'#8b744d',blue:'#596f81',cloth:'#d5cdb1',rust:'#967665',soil:'#4d4431',pot:'#8e6650',glaze:'#647d77',leaf:'#53744a',leafLight:'#769060',water:'#657f7c'};
  const mats={};for(const [k,color] of Object.entries(palette))mats[k]=new THREE.MeshStandardMaterial({color,roughness:k==='water'?.22:.87,side:THREE.DoubleSide});
  const geo={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(1,1,1,12),ball:new THREE.SphereGeometry(1,8,6),ring:new THREE.TorusGeometry(1,.035,6,48)};
  const batches=new Map(),dummy=new THREE.Object3D();
  function save(shape,mat){const key=shape.uuid+mat;if(!batches.has(key))batches.set(key,{shape,mat:mats[mat],items:[]});dummy.updateMatrix();batches.get(key).items.push(dummy.matrix.clone());}
  function item(shape,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){dummy.position.set(x,y,z);dummy.rotation.set(rx,ry,rz);dummy.scale.set(sx,sy,sz);save(shape,mat);}
  function box(mat,x,y,z,w,h,d,rx=0,ry=0,rz=0){item(geo.box,mat,x,y,z,w,h,d,rx,ry,rz);}
  function beam(a,b,r,mat='wood'){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),delta=vb.clone().sub(va);dummy.position.copy(va.add(vb).multiplyScalar(.5));dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());dummy.scale.set(r,delta.length(),r);save(geo.cyl,mat);}
  function ring(x,y,z,rx,rz,mat='iron'){item(geo.ring,mat,x,y,z,rx,rz,Math.min(rx,rz),Math.PI/2);}
  function curve(points,r,mat){const path=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const m=new THREE.Mesh(new THREE.TubeGeometry(path,Math.max(12,points.length*4),r,5,false),mats[mat]);m.castShadow=true;group.add(m);}
  function roadClear(x,z,r){return roads.every(road=>road.points.slice(1).every((b,i)=>{const a=road.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)>=road.width/2+r+.3;}));}
  const reservations=[];
  function reserve(name,x,z,r){if(!roadClear(x,z,r))throw new Error(name+' violates road clearance');reservations.push({name,x,z,r});}
  function staveVessel(x,z,r,h,handle=false){
    reserve('wash vessel',x,z,r+.08);const y=ground(x,z);
    item(geo.cyl,'dark',x,y+.055,z,r*.81,.11,r*.81);
    for(let k=0;k<28;k++){const a=k*Math.PI*2/28,rr=r*.94;box(k%4?'wood':'woodLight',x+Math.cos(a)*rr,y+h/2,z+Math.sin(a)*rr,r*.18,h,.05,0,Math.PI/2-a);}
    for(const yy of [.13,h-.07])ring(x,y+yy,z,r,r,'iron');
    ring(x,y+h,z,r*.98,r*.98,'woodLight');ring(x,y+h-.02,z,r*.88,r*.88,'wood');
    item(geo.cyl,'water',x,y+h*.68,z,r*.88,.018,r*.88);
    if(handle){for(const sign of [-1,1])box('iron',x+sign*r,y+h-.01,z,.065,.16,.06);curve([[x-r,y+h,z],[x-r*.7,y+h+r,z],[x,y+h+r*1.24,z],[x+r*.7,y+h+r,z],[x+r,y+h,z]],.026,'iron');box('wood',x,y+h+r*1.22,z,r*.9,.075,.09);}
    return y;
  }
  // Compact west-side line. Both planted feet and diagonal stays are terrain fitted.
  const lineZ=Z(-5.65),left=X(-4.55),right=X(-1.85),top=Math.max(ground(left,lineZ),ground(right,lineZ))+2.22;
  for(const [x,s] of [[left,1],[right,-1]]){
    reserve('laundry post',x,lineZ,.17);
    beam([x,heightAt(x,lineZ)-.13,lineZ],[x,top+.16,lineZ],.075,'dark');
    item(geo.cyl,'end',x,top+.17,lineZ,.078,.025,.078);
    beam([x,top-1.02,lineZ],[x+s*.37,ground(x+s*.37,lineZ+.31),lineZ+.31],.043,'wood');
    for(let k=0;k<4;k++)ring(x,top-.035+k*.03,lineZ,.083,.083,'rope');
  }
  const sag=x=>top-.12*Math.sin((x-left)/(right-left)*Math.PI);
  curve(Array.from({length:13},(_,i)=>{const x=left+(right-left)*i/12;return[x,sag(x),lineZ];}),.018,'rope');
  function cloth(cx,w,h,mat,phase){
    const verts=[],indices=[],nx=16,ny=16;
    function p(u,v){const x=cx+(u-.5)*w;return[x,sag(x)-v*h,lineZ+Math.sin(u*Math.PI*5+phase)*.034+Math.sin(v*Math.PI*.8)*.13];}
    for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++)verts.push(...p(i/nx,j/ny));
    for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i;indices.push(a,a+1,a+nx+1,a+1,a+nx+2,a+nx+1);}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geometry.setIndex(indices);geometry.computeVertexNormals();const m=new THREE.Mesh(geometry,mats[mat]);m.castShadow=true;m.receiveShadow=true;group.add(m);
    for(const v of [.03,.96])curve(Array.from({length:17},(_,i)=>p(i/16,v)),.008,mat==='blue'?'cloth':'rust');
    for(const u of [.025,.975])curve(Array.from({length:10},(_,i)=>p(u,i/9)),.007,mat);
    for(const u of [.11,.89]){const q=p(u,0);box('woodLight',q[0],q[1]-.018,q[2]-.028,.037,.13,.028,0,0,.08);box('wood',q[0],q[1]-.018,q[2]+.021,.036,.13,.026,0,0,-.08);beam([q[0]-.025,q[1]+.008,q[2]],[q[0]+.025,q[1]+.008,q[2]],.014,'iron');}
  }
  cloth(X(-4.02),.71,1.13,'cloth',0);cloth(X(-3.10),.75,1.28,'blue',1.5);cloth(X(-2.30),.47,.77,'rust',.5);
  const tubX=X(-3.6),tubZ=Z(-4.75),tubY=staveVessel(tubX,tubZ,.49,.51);
  // Washboard leans back into the tub; individual ribs, framing and top grip.
  const board=new THREE.Group();board.position.set(tubX+.05,tubY+.51,tubZ+.05);board.rotation.x=-.24;
  const localBox=(x,y,z,w,h,d,mat)=>{const m=new THREE.Mesh(geo.box,mats[mat]);m.position.set(x,y,z);m.scale.set(w,h,d);m.castShadow=true;board.add(m);};
  localBox(0,.13,0,.39,.72,.055,'wood');for(const x of [-.22,.22])localBox(x,.13,0,.055,.85,.085,'dark');
  for(let k=0;k<12;k++)localBox(0,-.19+k*.046,-.037,.38,.022,.035,'woodLight');localBox(0,.53,0,.49,.055,.09,'woodLight');localBox(0,.39,0,.38,.055,.09,'woodLight');group.add(board);
  staveVessel(X(-4.54),Z(-4.4),.22,.40,true);
  function basket(x,z,rx,rz,h){reserve('laundry basket',x,z,Math.max(rx,rz)+.03);const y=ground(x,z);item(geo.cyl,'wickerDark',x,y+.03,z,rx*.73,.06,rz*.73);
    for(let j=0;j<15;j++){const t=j/14,scale=.78+.22*t;ring(x,y+.045+t*h,z,rx*scale,rz*scale,j%2?'wicker':'wickerDark');}
    for(let i=0;i<32;i++){const a=i*Math.PI/16;const pts=[];for(let j=0;j<12;j++){const t=j/11,s=.78+.22*t+(j%2?.015:-.015);pts.push([x+Math.cos(a)*rx*s,y+.03+t*h,z+Math.sin(a)*rz*s]);}curve(pts,.012,'wicker');}
    for(const yy of [h,h+.035])ring(x,y+yy,z,rx,rz,'wicker');
    for(const side of [-1,1])curve([[x+side*rx*.91,y+h*.8,z-.13],[x+side*rx*1.04,y+h+.18,z],[x+side*rx*.91,y+h*.8,z+.13]],.027,'wicker');
    for(let k=0;k<3;k++)box(k===1?'blue':'cloth',x-.04+k*.03,y+.23+k*.065,z,rx*1.25,.075,rz*1.17,.08,k*.14,.03);
  }
  basket(X(-2.05),Z(-4.74),.40,.32,.42);
  // East corner bench: all four legs extend independently to the existing earth.
  const bx=X(3.10),bz=Z(-5.07),seat=Math.max(...[-.67,.67].flatMap(dx=>[-.20,.20].map(dz=>ground(bx+dx,bz+dz))))+.46;
  reserve('bench',bx,bz,.91);
  for(const dx of [-.65,.65])for(const dz of [-.20,.20]){const yy=ground(bx+dx,bz+dz);box('dark',bx+dx,(yy+seat)/2,bz+dz,.095,seat-yy,.095);}
  for(let j=0;j<4;j++)box(j%2?'wood':'woodLight',bx,seat,bz-.235+j*.155,1.72,.085,.14);
  for(const dx of [-.65,.65])box('dark',bx+dx,seat-.11,bz,.11,.16,.62);box('wood',bx,seat-.22,bz,1.35,.08,.08);
  for(const dx of [-.65,.65])for(let j=0;j<4;j++)item(geo.cyl,'iron',bx+dx,seat+.045,bz-.235+j*.155,.012,.008,.012);
  function pot(x,z,r,h,mat='pot',leaves=true){reserve('planter',x,z,r+.12);const y=ground(x,z);
    const profile=[[r*.63,0],[r*.69,.04],[r*.94,h*.7],[r,h*.94],[r*.97,h],[r*.80,h],[r*.78,h*.86],[r*.69,h*.18]].map(([a,b])=>new THREE.Vector2(a,b));
    const m=new THREE.Mesh(new THREE.LatheGeometry(profile,20),mats[mat]);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);ring(x,y+h*.96,z,r,r,mat);item(geo.cyl,'soil',x,y+h*.82,z,r*.78,.025,r*.78);
    if(leaves)for(let i=0;i<9;i++){const a=i*2.399,xx=x+Math.cos(a)*r*.70,zz=z+Math.sin(a)*r*.70,yy=y+h+.10+(i%3)*.07;beam([x,y+h*.83,z],[xx,yy,zz],.012,'leaf');item(geo.ball,i%2?'leaf':'leafLight',xx,yy,zz,r*.28,.13,r*.55,.35,a,.40);}
  }
  pot(X(4.44),Z(-5.85),.25,.46,'glaze');pot(X(4.53),Z(-4.84),.19,.31);pot(X(2.0),Z(-5.90),.20,.34);
  // Narrow rear storage has visible log end grain, supports and split wood.
  const lx=X(-3.15),lz=Z(4.9),base=ground(lx,lz)+.12;reserve('low firewood stack',lx,lz,1.0);
  for(const dx of [-.68,.68]){const y=ground(lx+dx,lz);box('dark',lx+dx,y+.06,lz,.17,.12,.76);}
  for(let row=0;row<3;row++)for(let j=0;j<7-row;j++){
    const xx=lx+(j-(6-row)/2)*.215,yy=base+.10+row*.19,zz=lz+(j%2)*.025,r=.098+(j%3)*.008;
    beam([xx,yy,zz-.32],[xx,yy,zz+.32],r,j%2?'dark':'wood');
    for(const side of [-1,1]){item(geo.cyl,'end',xx,yy,zz+side*.326,r*.92,.013,r*.92,Math.PI/2);item(geo.ring,'wood',xx,yy,zz+side*.336,r*.59,r*.59,r*.59);beam([xx,yy,zz+side*.342],[xx+r*.67,yy+.025,zz+side*.342],.007,'dark');}
  }
  for(const dx of [-.90,.90]){const y=ground(lx+dx,lz);box('dark',lx+dx,y+.37,lz,.085,.74,.54);}
  for(const [dx,dz,r,h] of [[-.5,4.93,.23,.34],[.15,4.93,.21,.29],[1.3,4.9,.24,.35],[2.0,4.92,.20,.28],[3.4,4.96,.23,.36]])pot(X(dx),Z(dz),r,h,dx>0?'glaze':'pot');
  staveVessel(X(4.4),Z(4.80),.18,.29,true);
  // West passage: small wall-side herbs, leaving a usable continuous gap.
  pot(X(-5.13),Z(.9),.13,.25);pot(X(-5.13),Z(1.43),.13,.22,'glaze');
  for(const b of batches.values()){const m=new THREE.InstancedMesh(b.shape,b.mat,b.items.length);b.items.forEach((mx,i)=>m.setMatrixAt(i,mx));m.castShadow=true;m.receiveShadow=true;group.add(m);}
  group.userData.clearanceChecks=reservations;group.userData.lot=8;
  return group;
}
