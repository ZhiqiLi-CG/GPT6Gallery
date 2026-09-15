import { heightAt, roadNetwork, layout } from './root.js';

// One small greengrocer, its wares and low household storage. Architecture is parent-owned.
export function build(THREE, ctx) {
  const g = new THREE.Group(); g.name = 'South center vegetable and household shop';
  const lot = layout().town.lots[9], X=lot.x, Z=lot.z;
  const w=lot.w-(9%3)*.25, depth=7+(9%2)*.3;
  const floor=Math.max(...[-.5,0,.5].flatMap(a=>[-.5,0,.5].map(b=>heightAt(X+a*w,Z+b*depth))))+.38;
  g.userData.houseFloor=floor;
  const roads=roadNetwork(), batches=new Map(), dummy=new THREE.Object3D();
  const colors={wood:'#8d6d45',light:'#b59461',dark:'#58432e',end:'#c1a273',nail:'#514f48',wicker:'#b29359',rim:'#c3a16a',green:'#708648',leaf:'#4c713e',pale:'#a4b776',white:'#ded9b9',orange:'#b8823d',clay:'#997157',cream:'#c7b795',blue:'#5d787b',soil:'#514438',iron:'#535b58',bark:'#68513a'};
  const mats=Object.fromEntries(Object.entries(colors).map(([k,color])=>[k,new THREE.MeshStandardMaterial({color,roughness:k==='blue'?.47:.88,side:THREE.DoubleSide})]));
  const cube=new THREE.BoxGeometry(1,1,1), cyl=new THREE.CylinderGeometry(1,1,1,12), ball=new THREE.SphereGeometry(1,12,8), ring=new THREE.TorusGeometry(1,.08,6,24), leaf=new THREE.SphereGeometry(1,8,6);
  function save(geo,mat){const key=geo.uuid+mat;if(!batches.has(key))batches.set(key,{geo,mat:mats[mat],items:[]});batches.get(key).items.push(dummy.matrix.clone());}
  function inst(geo,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){dummy.position.set(x,y,z);dummy.rotation.set(rx,ry,rz);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();save(geo,mat);}
  function box(x,y,z,a,b,c,mat='wood',ry=0){inst(cube,mat,x,y,z,a,b,c,0,ry);}
  function beam(a,b,r,mat='wood'){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av);dummy.position.copy(av.add(bv).multiplyScalar(.5));dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());dummy.scale.set(r,delta.length(),r);dummy.updateMatrix();save(cyl,mat);}
  function hoop(x,y,z,r,mat='rim',sz=1){inst(ring,mat,x,y,z,r,r*sz,r,Math.PI/2);}
  function ground(x,z){return heightAt(x,z)+.105;}
  function clear(x,z,r){return roads.every(road=>road.points.slice(1).every((b,i)=>{const a=road.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)>=road.width/2+r+.3;}));}
  function feet(x,z,ww,dd,top){for(const dx of [-ww/2+.10,ww/2-.10])for(const dz of [-dd/2+.10,dd/2-.10]){const gy=ground(x+dx,z+dz)-.035;box(x+dx,(gy+top)/2,z+dz,.115,top-gy,.115,'dark');}}
  function table(x,z,ww,dd,h){if(!clear(x,z,Math.hypot(ww,dd)/2))throw new Error('Shop table road clearance');const y=Math.max(...[-1,1].flatMap(a=>[-1,1].map(b=>ground(x+a*ww/2,z+b*dd/2))))+h;
    feet(x,z,ww,dd,y-.07);
    for(let k=0;k<5;k++){box(x,y-.04,z-dd/2+(k+.5)*dd/5,ww,.08,dd/5-.012,k%2?'wood':'light');box(x,y-h*.68,z-dd/2+(k+.5)*dd/5,ww-.14,.055,dd/5-.015,'wood');}
    for(const s of [-1,1]){box(x,y-.21,z+s*(dd/2-.06),ww-.10,.20,.055,'dark');box(x+s*(ww/2-.08),y-.19,z,.055,.19,dd-.1,'wood');}
    for(const a of [-1,1])for(const b of [-1,1])inst(cyl,'nail',x+a*(ww/2-.1),y+.004,z+b*(dd/2-.08),.017,.01,.017);
    return y;
  }
  function crate(x,y,z,ww=.72,dd=.56,h=.4){
    for(let k=0;k<5;k++)box(x-ww/2+(k+.5)*ww/5,y+.035,z,ww/5-.013,.065,dd,'wood');
    for(const a of [-1,1])for(const b of [-1,1])box(x+a*(ww/2-.035),y+h/2,z+b*(dd/2-.035),.065,h,.065,'dark');
    for(let k=0;k<3;k++){const yy=y+.105+k*(h-.12)/3;for(const s of [-1,1]){box(x,yy,z+s*dd/2,ww,.073,.035,k%2?'light':'wood');box(x+s*ww/2,yy,z,.035,.073,dd,'light');}}
    for(const s of [-1,1])box(x+s*ww/2,y+h-.035,z,.045,.07,dd,'light');
    for(const s of [-1,1])for(const a of [-1,1])for(const yy of [.105,h-.1])inst(ball,'nail',x+a*(ww/2-.07),y+yy,z+s*(dd/2+.018),.013,.013,.009);
  }
  function basket(x,y,z,r=.29,h=.2){
    inst(cyl,'wicker',x,y+.025,z,r*.74,.04,r*.74);
    for(let j=0;j<7;j++){let t=j/6;hoop(x,y+.035+t*h,z,r*(.77+.23*t),'wicker');}
    for(let k=0;k<22;k++){const a=k*Math.PI*2/22;beam([x+Math.cos(a)*r*.74,y+.03,z+Math.sin(a)*r*.74],[x+Math.cos(a)*r,y+h+.035,z+Math.sin(a)*r],.012,k%2?'rim':'wicker');}
    hoop(x,y+h+.05,z,r,'rim');
    for(let k=-3;k<=3;k++){const xx=k*r/5,span=Math.sqrt((r*.7)**2-xx*xx);box(x+xx,y+.049,z,.022,.012,span*2,'rim');box(x,y+.055,z+xx,span*2,.012,.022,'wicker');}
  }
  const vesselCache=new Map();
  function vessel(x,y,z,r,h,mat='clay',bowl=false){const key=bowl?'bowl':'jar';if(!vesselCache.has(key)){const points=(bowl?[[0,0],[.52,0],[.63,.12],[.94,.7],[1,1],[.90,1],[.83,.67],[.50,.16],[0,.16]]:[[0,0],[.56,0],[.79,.12],[1,.42],[.90,.68],[.60,.83],[.56,1],[.44,1],[.43,.84],[.72,.62],[.76,.25],[.45,.14],[0,.14]]).map(p=>new THREE.Vector2(...p));vesselCache.set(key,new THREE.LatheGeometry(points,24));}inst(vesselCache.get(key),mat,x,y,z,r,h,r);hoop(x,y+h,z,r*(bowl?.96:.51),mat);}
  function greens(x,y,z,s=.14){for(let k=0;k<6;k++){let a=k*2.4;inst(leaf,k%2?'green':'leaf',x+Math.cos(a)*s*.53,y+s*.80,z+Math.sin(a)*s*.5,s*.28,s*1.3,s*.11,Math.sin(a)*.65,a,Math.cos(a)*.65);}}
  function cabbage(x,y,z,r=.16){inst(ball,'pale',x,y+r*.7,z,r*.82,r*.82,r*.82);for(let k=0;k<8;k++){const a=k*2.4;inst(leaf,k%3?'green':'pale',x+Math.cos(a)*r*.57,y+r*.54,z+Math.sin(a)*r*.57,r*.65,r*.74,r*.2,.15,a,.2);beam([x+Math.cos(a)*r*.86,y+r*.37,z+Math.sin(a)*r*.86],[x+Math.cos(a)*r*.3,y+r*1.1,z+Math.sin(a)*r*.3],.007,'pale');}}
  function radish(x,y,z,a){inst(ball,'white',x,y+.08,z,.065,.066,.21,0,a);const dx=Math.sin(a),dz=Math.cos(a);beam([x-dx*.18,y+.08,z-dz*.18],[x-dx*.29,y+.06,z-dz*.29],.012,'white');greens(x+dx*.18,y+.10,z+dz*.18,.11);}
  // Eastern customer-facing counter, 1.5m clear aisle to the open fence line.
  const cx=X+2.95,cz=Z-4.95,top=table(cx,cz,2.85,.87,.90);
  for(let k=0;k<3;k++)crate(cx-1.01+k*.83,top,cz,.74,.66,.29);
  for(let a=0;a<2;a++)for(let b=0;b<2;b++)cabbage(cx-1.19+a*.31,top+.10,cz-.18+b*.31,.155);
  for(let k=0;k<5;k++)radish(cx-.40+(k%2)*.24,top+.105+(k>3?.10:0),cz-.19+Math.floor(k/2)*.16,.18);
  for(let a=0;a<3;a++)for(let b=0;b<3;b++)inst(ball,'orange',cx+.47+a*.17,top+.19,cz-.20+b*.17,.09,.088,.09);
  // Little balance scale at the eastern end: pedestal, cross beam, cords and concave pans.
  const sx=cx+1.15,sz=cz+.05;box(sx,top+.045,sz,.29,.09,.31,'dark');beam([sx,top+.09,sz],[sx,top+.89,sz],.025,'iron');beam([sx-.29,top+.83,sz],[sx+.29,top+.87,sz],.016,'iron');
  for(const s of [-1,1]){const xx=sx+s*.27;vessel(xx,top+.43,sz,.135,.045,'iron',true);for(const dz of [-.095,.095])beam([xx,top+.84,sz],[xx,top+.47,sz+dz],.007,'iron');}inst(cyl,'iron',sx+.27,top+.53,sz,.034,.08,.034);
  for(let k=0;k<3;k++){basket(cx-.92+k*.85,top-.60,cz,.28,.19);if(k===1)vessel(cx-.07,top-.54,cz,.15,.16,'cream',true);}
  // Household wares on a separate low western rack, entirely beside the stair corridor.
  const wx=X-3.18,wz=Z-5.08,wt=table(wx,wz,2.33,.84,.55);
  vessel(wx-.79,wt,wz+.03,.24,.52,'blue');vessel(wx-.26,wt,wz+.06,.22,.44,'clay');
  for(let i=0;i<3;i++)vessel(wx+.30,wt+i*.075,wz,.22,.13,'cream',true);
  basket(wx+.83,wt,wz,.25,.17);vessel(wx-.9,wt-.36,wz,.15,.19,'clay');vessel(wx-.47,wt-.36,wz,.16,.20,'blue');
  basket(X-2.30,ground(X-2.30,Z-6.1),Z-6.1,.30,.19);
  // Empty stacked crates at the front-west corner.
  const ex=X-4.71,ez=Z-4.70,ey=ground(ex,ez);crate(ex,ey,ez,.62,.65,.40);crate(ex,ey+.40,ez,.62,.65,.40);
  // Narrow barrel in the west passage: individual stave seams, lid planks and metal bands.
  const bx=X-4.98,bz=Z+.2,by=ground(bx,bz),br=.29,bh=.76;
  for(let k=0;k<18;k++){const a=k*Math.PI*2/18;box(bx+Math.cos(a)*br,by+bh/2,bz+Math.sin(a)*br,.095,bh,.055,k%3?'wood':'light',Math.PI/2-a);}
  for(const h of [.10,.38,.65])hoop(bx,by+h,bz,br+.027,'iron');
  for(let k=-2;k<=2;k++){const xx=k*.10,span=Math.sqrt(br*br-xx*xx);box(bx+xx,by+bh,bz,.093,.04,span*2,'light');}box(bx,by+bh+.03,bz,.48,.04,.08,'dark');
  // Rear: low raised split wood stack and herb pots, below every eave.
  const lx=X-1.8,lz=Z+4.78,ly=ground(lx,lz);
  for(const a of [-.8,.8])box(lx+a,ly+.07,lz,.12,.14,.62,'dark');
  for(let row=0;row<3;row++)for(let k=0;k<8-row;k++){const xx=lx-.76+k*.21+row*.10,yy=ly+.20+row*.17;beam([xx,yy,lz-.23],[xx,yy,lz+.23],.092,'bark');inst(cyl,'end',xx,yy,lz-.236,.079,.018,.079,Math.PI/2);inst(cyl,'end',xx,yy,lz+.236,.079,.018,.079,Math.PI/2);beam([xx-.047,yy,lz+.247],[xx+.040,yy+.016,lz+.247],.006,'dark');}
  for(let k=0;k<6;k++){const px=X+.05+k*.61,pz=Z+4.95,py=ground(px,pz);vessel(px,py,pz,.21,.27,k%2?'clay':'cream');inst(cyl,'soil',px,py+.245,pz,.095,.022,.095);greens(px,py+.25,pz,.23);}
  // Scoop in a wicker tray alongside the rear reserve crate.
  const rx=X-4.72,rz=Z+4.48,ry=ground(rx,rz);crate(rx,ry,rz,.63,.63,.38);basket(rx,ry+.39,rz,.26,.16);vessel(rx,ry+.46,rz,.105,.07,'light',true);beam([rx,ry+.49,rz],[rx+.19,ry+.56,rz-.12],.021,'wood');
  for(const b of batches.values()){const mesh=new THREE.InstancedMesh(b.geo,b.mat,b.items.length);b.items.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);}
  return g;
}
