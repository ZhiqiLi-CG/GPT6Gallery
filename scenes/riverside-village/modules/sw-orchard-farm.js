import { heightAt, bankZ, roadNetwork, layout, claimDistrict } from './root.js';
import { claimSouthCluster } from './south-bank.js';
import { claimWestHolding, westFarmPlan, nearestWestRoad } from './south-west-farms.js';

export function build(THREE, ctx) {
  claimDistrict('south-bank'); claimSouthCluster('west'); claimWestHolding('orchard');
  const g=new THREE.Group();g.name='sw-orchard-farm — orchard and working holding';
  const plan=westFarmPlan(), houses=plan.houses.filter(s=>s.holding==='orchard'), barns=plan.barns.filter(s=>s.holding==='orchard');
  const palette={plaster:0xd8c7a3,wood:0x715239,trim:0x4c3c2b,door:0x8c6945,roof:0x9b5940,tile:0xb37452,stone:0x999383,glass:0x344f50,green:0x596a41,soil:0x72563a,dirt:0xae9670,wear:0x97835f,leaf:0x658744,leaf2:0x77924a,leaf3:0x547b3e,grass:0x899951,hay:0xc3aa62,iron:0x444641,fruit:0xb9472e,cream:0xe4d9bb,water:0x668b88};
  const mats={};for(const [k,c]of Object.entries(palette))mats[k]=new THREE.MeshStandardMaterial({color:c,roughness:.94});
  const geometries={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(1,1,1,8),ball:new THREE.IcosahedronGeometry(1,1)};
  const batches=new Map(), dummy=new THREE.Object3D();
  function item(type,m,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){const k=type+':'+m;if(!batches.has(k))batches.set(k,[]);batches.get(k).push([x,y,z,sx,sy,sz,rx,ry,rz]);}
  const box=(x,y,z,w,h,d,m,ry=0,rx=0,rz=0)=>item('box',m,x,y,z,w,h,d,rx,ry,rz);
  const ball=(x,y,z,w,h,d,m)=>item('ball',m,x,y,z,w,h,d);
  function beam(a,b,r,m='wood'){const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a)),mid=new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());const e=new THREE.Euler().setFromQuaternion(dummy.quaternion);item('cyl',m,mid.x,mid.y,mid.z,r,v.length(),r,e.x,e.y,e.z);}
  let seed=93841;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  const ground=(x,z)=>heightAt(x,z);
  function clear(x,z,r=0){const road=nearestWestRoad(x,z);return x-r>=ctx.bounds[0]&&x+r<-100 && z-r>=-150 && z+r<bankZ(x,-1)-plan.shoreClearance && road.distance>road.width/2+plan.roadShoulder+r;}
  function patch(points,width,mat='dirt',lift=.28){const vs=[],ix=[];for(let j=1;j<points.length;j++){const [ax,az]=points[j-1],[bx,bz]=points[j],dx=bx-ax,dz=bz-az,len=Math.hypot(dx,dz),n=Math.ceil(len/.8);for(let k=0;k<n;k++){let off=vs.length/3;for(const t of [k/n,(k+1)/n])for(const side of [-1,1]){const x=ax+dx*t-dz/len*width/2*side,z=az+dz*t+dx/len*width/2*side;vs.push(x,ground(x,z)+lift,z);}ix.push(off,off+1,off+2,off+1,off+3,off+2);}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));geo.setIndex(ix);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,mats[mat]);mesh.receiveShadow=true;g.add(mesh);}
  function roof(x,z,w,d,y,rise,mat='roof'){
    const slope=Math.atan2(rise,w/2+.5),length=Math.hypot(w/2+.5,rise);
    for(const side of [-1,1]){
      box(x+side*(w/2+.5)/2,y+rise/2,z,length,.24,d+1.1,mat,0,0,-side*slope);
      for(let t=.1;t<1;t+=.15)for(let zz=-d/2-.3;zz<d/2+.5;zz+=1.05)box(x+side*(w/2+.5)*t,y+rise*(1-t)+.14,z+zz,.09,.07,1,'tile',0,0,-side*slope);
      box(x+side*(w/2+.52),y-.05,z,.18,.26,d+1.2,'trim');
    }
    box(x,y+rise+.16,z,.34,.27,d+1.3,'tile');
    const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,rise-.12);shape.closePath();
    const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false}),mats.wood);mesh.position.set(x,y-.1,z-d/2);mesh.castShadow=true;g.add(mesh);
  }
  function windowAt(x,y,z,rotation=0){const c=Math.cos(rotation),s=Math.sin(rotation),put=(dx,dy,dz,w,h,d,m)=>box(x+dx*c+dz*s,y+dy,z-dx*s+dz*c,w,h,d,m,rotation);
    put(0,0,0,1.13,1.42,.10,'glass');for(const a of [-.64,.64])put(a,0,.05,.13,1.68,.18,'cream');for(const a of [-.79,.79])put(0,a,.05,1.4,.13,.18,'cream');put(0,0,.12,.08,1.4,.1,'cream');put(0,0,.12,1.13,.08,.1,'cream');
    for(const side of [-1,1]){put(side*.98,0,.03,.48,1.47,.13,'green');for(let q=-.55;q<.7;q+=.25)put(side*.98,q,.11,.48,.05,.05,'trim');}put(0,-.89,.22,1.6,.15,.5,'stone');
  }
  function building(s,barn=false){const {x,z,w,d}=s,h=barn?6.4:5.1,rise=barn?3.8:3.0;const corners=[[-1,-1],[-1,1],[1,-1],[1,1]].map(([a,b])=>ground(x+a*(w/2+.25),z+b*(d/2+.25)));const floor=Math.max(...corners)+.2,low=Math.min(...corners)-.4;
    box(x,(floor+low)/2,z,w+.4,floor-low,d+.4,'stone');box(x,floor+h/2,z,w,h,d,barn?'wood':'plaster');
    for(const side of [-1,1]){for(let t=-w/2+.3;t<w/2;t+=barn?.62:2.35){box(x+t,floor+h/2,z+side*(d/2+.04),barn?.06:.14,h,.12,barn?'door':'trim');}for(let t=-d/2+.2;t<d/2;t+=barn?.65:2.4)box(x+side*(w/2+.04),floor+h/2,z+t,.12,h,barn?.07:.14,barn?'door':'trim');box(x,floor+.2,z+side*(d/2+.1),w,.22,.19,'trim');}
    roof(x,z,w,d,floor+h,rise);
    for(const side of [-1,1]){box(x+side*(w/2-.12),floor+h/2,z-d/2-.1,.24,h,.25,'trim');box(x+side*(w/2-.12),floor+h/2,z+d/2+.1,.24,h,.25,'trim');}
    const face=barn?1:-1,dz=z+face*(d/2+.13),dw=barn?4.5:1.65,dh=barn?4.6:2.8;
    box(x,floor+dh/2,dz,dw,dh,.2,'trim');for(let t=-dw/2+.13;t<dw/2;t+=.26)box(x+t,floor+dh/2,dz+face*.13,.22,dh-.12,.12,'door');
    for(const side of [-1,1])box(x+side*(dw/2+.12),floor+dh/2,dz,.2,dh+.2,.35,'stone');box(x,floor+dh+.13,dz,dw+.5,.25,.4,'trim');
    for(const yy of [.6,dh-.7])box(x,floor+yy,dz+face*.23,dw-.2,.1,.09,'iron');
    beam([x-dw/2+.2,floor+.4,dz+face*.26],[x+dw/2-.2,floor+dh-.4,dz+face*.26],.07,'trim');
    if(barn){
      const near=dz+face*.12,far=dz+face*5.0,half=(dw+.7)/2,vs=[];
      for(const bottom of [false,true])for(const zz of [near,far])for(const xx of [x-half,x+half])vs.push(xx,bottom?ground(xx,zz)-.1:zz===near?floor-.03:ground(xx,zz)+.29,zz);
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));geo.setIndex([0,2,1,1,2,3,4,5,6,5,7,6,0,1,4,1,5,4,2,6,3,3,6,7,0,4,2,2,4,6,1,3,5,3,7,5]);geo.computeVertexNormals();const m=mats.stone.clone();m.side=THREE.DoubleSide;const ramp=new THREE.Mesh(geo,m);ramp.castShadow=true;ramp.receiveShadow=true;g.add(ramp);
      box(x,floor+.02,dz,dw+.35,.17,.4,'stone');
    }else for(let k=0;k<3;k++){const zz=dz+face*(.4+k*.52),top=floor-.05-k*.18,bot=ground(x,zz)-.1;box(x,(top+bot)/2,zz,dw+.7,Math.max(.15,top-bot),.6,'stone');}
    for(const side of [-1,1]){if(!barn)for(const dx of [-3.1,3.1])windowAt(x+dx,floor+2.7,z+side*(d/2+.15),side===1?0:Math.PI);windowAt(x+side*(w/2+.15),floor+3.0,z+(barn?-3:0),side*Math.PI/2);}
    if(barn){windowAt(x,floor+7.2,z+d/2+.14);box(x,floor+5.6,z-d/2-.13,2.2,.5,.15,'trim');}
    else windowAt(x,floor+6.0,z-d/2-.13,Math.PI);
    const cx=x+w*.26,cz=z+d*.22;box(cx,floor+h+rise*.78,cz,.95,3.4,1.1,'stone');box(cx,floor+h+rise*.78+1.75,cz,1.24,.25,1.34,'trim');box(cx,floor+h+rise*.78+1.9,cz,.72,.07,.8,'iron');
    return {...s,floor};
  }
  const cottage=houses.map(s=>building(s))[0], barn=barns.map(s=>building(s,true))[0];
  const lane=nearestWestRoad(-125,-70);patch([[lane.x,lane.z],[-125,-73],[-125,-89],[-117,-95],[barn.x,barn.z+barn.d/2+.2]],3.5);
  patch([[-122,-96],[-105,-96]],10);patch([[cottage.x,cottage.z-cottage.d/2],[-110,-89],[-114,-96]],2.0);
  patch([[-124,-96],[-125,-110],[-125,-144]],2.3);patch([[-124,-101],[-137,-101]],2.3);patch([[-104,-97],[-103.6,-122],[-115,-122],[-115,-129],[-108,-130.5]],1.5);
  for(const side of [-1,1])patch([[-125+side*.85,-73],[-125+side*.85,-88],[-117+side*.85,-95]],.28,'wear',.30);
  function post(x,z,h=1.55){if(!clear(x,z,.2))return;box(x,ground(x,z)+h/2,z,.2,h,.2,'wood');}
  function fence(a,b){const dx=b[0]-a[0],dz=b[1]-a[1],n=Math.ceil(Math.hypot(dx,dz)/2.7);for(let i=0;i<=n;i++){const x=a[0]+dx*i/n,z=a[1]+dz*i/n;post(x,z);if(i){const px=a[0]+dx*(i-1)/n,pz=a[1]+dz*(i-1)/n;for(const h of [.6,1.15])beam([px,ground(px,pz)+h,pz],[x,ground(x,z)+h,z],.075);}}}
  function gate(x,z,width,angle=0){for(const s of [-1,1])post(x+s*width/2,z,1.9);const hinge=x-width/2,ex=hinge+width*Math.cos(angle),ez=z+width*Math.sin(angle);for(const y of [.45,.95,1.45])beam([hinge,ground(hinge,z)+y,z],[ex,ground(ex,ez)+y,ez],.07,'door');beam([hinge,ground(hinge,z)+.4,z],[ex,ground(ex,ez)+1.45,ez],.07,'door');}
  // Entry rails leave a genuine 4m gap; the open gate swings into the holding.
  fence([-148,-74],[-127,-74]);fence([-123,-74],[-120,-74]);gate(-125,-74,4,-1.57);
  fence([-148,-74],[-148,-148]);fence([-148,-148],[-127,-148]);
  fence([-127,-148],[-127,-104]);fence([-127,-98],[-127,-89]);
  for(const h of [.45,.95,1.45])beam([-127,ground(-127,-104)+h,-104],[-130.3,ground(-130.3,-99.5)+h,-99.5],.07,'door');
  beam([-127,ground(-127,-104)+.4,-104],[-130.3,ground(-130.3,-99.5)+1.45,-99.5],.07,'door');
  // Domestic kitchen beds west of the cottage.
  for(let x=-120;x<-115;x+=2.1){patch([[x,-85],[x,-76]],1.5,'soil',.30);for(let z=-84.5;z<-76;z+=.72){ball(x,ground(x,z)+.47,z,.32,.22,.32,'leaf2');ball(x+.29,ground(x+.29,z)+.45,z,.22,.18,.26,'leaf');}}
  fence([-122,-86],[-116,-86]);fence([-122,-86],[-122,-75]);
  // Stable, with full walls and a smaller pitched roof, south of the main barn.
  const stable=building({x:-108,z:-136,w:8,d:8},true);
  // Fenced exercise yard west of the stable, with access through a gap at its north.
  fence([-122,-124],[-117,-124]);fence([-113,-124],[-102,-124]);gate(-115,-124,4,.95);
  fence([-122,-124],[-122,-147]);fence([-122,-147],[-102,-147]);fence([-102,-147],[-102,-124]);
  patch([[-115,-125],[-115,-133]],4,'wear');
  // Covered hay and firewood bay adjacent to the barn: rear and side walls, open front.
  const sx=-123,sz=-114,sy=Math.max(...[-1,1].flatMap(a=>[-1,1].map(b=>ground(sx+a*2.15,sz+b*3.5))))+.12;
  const storeLow=Math.min(...[-1,1].flatMap(a=>[-1,1].map(b=>ground(sx+a*2.15,sz+b*3.5))))-.18;
  box(sx,(sy+storeLow)/2,sz,4.3,sy-storeLow,7,'stone');
  box(sx,sy+.12,sz,4.3,.25,7,'stone');box(sx-2,sy+1.8,sz,.2,3.6,7,'wood');box(sx,sy+1.8,sz-3.4,4.2,3.6,.2,'wood');
  for(const dx of [-1.9,1.9])for(const dz of [-3.3,3.3])box(sx+dx,sy+1.9,sz+dz,.23,3.8,.23,'trim');roof(sx,sz,4.3,7,sy+3.8,1.2);
  for(let j=0;j<4;j++)for(let i=0;i<5;i++)beam([sx-1.3+i*.48,sy+.38+j*.4,sz-2.7],[sx-1.3+i*.48,sy+.38+j*.4,sz-.9],.22,'wood');
  for(let j=0;j<2;j++)for(let i=0;i<2;i++){box(sx-.8+i*1.55,sy+.48+j*.8,sz+1.1,1.4,.75,1.7,'hay');box(sx-.8+i*1.55,sy+.48+j*.8,sz+1.1,.08,.8,1.75,'door');}
  // Orchard: pruned bifurcating trunks, five crowns per tree and individually instanced fruit.
  for(const x of [-141,-132])for(const z of [-94,-106,-118,-130,-142]){
    const y=ground(x,z);beam([x,y-.1,z],[x+.12,y+2.8,z],.23,'wood');
    for(let j=0;j<5;j++){const a=j*Math.PI*2/5+.3,dx=Math.cos(a)*1.7,dz=Math.sin(a)*1.7,yy=y+3.5+rand()*.8;beam([x,y+1.9,z],[x+dx,yy,z+dz],.115,'wood');beam([x+dx*.6,y+2.8,z+dz*.6],[x+dx*1.3,yy+.6,z+dz*1.3],.065,'wood');ball(x+dx,yy+.8,z+dz,1.8,1.55,1.65,['leaf','leaf2','leaf3'][j%3]);for(let k=0;k<7;k++){const a2=rand()*6.28;ball(x+dx+Math.cos(a2)*1.4,yy+.45+rand(),z+dz+Math.sin(a2)*1.35,.11,.13,.11,'fruit');}}
    for(let k=0;k<55;k++){const a=rand()*6.28,r=.5+rand()*3.3,xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r;ball(xx,ground(xx,zz)+.20,zz,.11+rand()*.3,.12,.12+rand()*.28,k%8===0?'hay':'grass');}
    for(let k=0;k<8;k++){const xx=x+(rand()-.5)*3,zz=z+(rand()-.5)*3;ball(xx,ground(xx,zz)+.32,zz,.11,.11,.11,'fruit');}
  }
  // Pruning bundles and an orchard ladder support the harvest scene.
  for(let k=0;k<15;k++){const x=-136+(rand()-.5)*1.4,z=-113+(rand()-.5)*.7,y=ground(x,z)+.3+rand()*.25;beam([x-1.2,y,z-.4],[x+1.1,y+.15,z+.4],.035,'wood');}
  const ox=-139,oz=-105,oy=ground(ox,oz);for(const dx of [-.35,.35])beam([ox+dx,oy,oz+1.8],[ox+dx-.9,oy+3.8,oz],.055);for(let k=0;k<10;k++)beam([ox-.35-.09*k,oy+.38*k,oz+1.8-.18*k],[ox+.35-.09*k,oy+.38*k,oz+1.8-.18*k],.04,'door');
  // Meadow edges, with roots kept away from shared road shoulders.
  for(let i=0;i<850;i++){const x=-149+rand()*48,z=-149+rand()*77;if(!clear(x,z,.3))continue;const edge=x<-145||z<-145||(x<-128&&Math.abs((z+94)%12)>4);if(!edge)continue;item('cyl',i%7===0?'hay':'grass',x,ground(x,z)+.26,z,.045,.4+rand()*.35,.045,0,rand()*6.28,.25);}
  function basket(x,z){let y=ground(x,z);item('cyl','door',x,y+.32,z,.46,.5,.46);item('cyl','trim',x,y+.59,z,.48,.08,.48);item('cyl','soil',x,y+.635,z,.4,.035,.4);for(let k=0;k<12;k++)ball(x+(rand()-.5)*.55,y+.7+rand()*.08,z+(rand()-.5)*.55,.12,.12,.12,'fruit');}
  for(const [x,z]of [[-136,-101],[-138,-102],[-124,-96],[-121,-98],[-112,-89]])basket(x,z);
  // Harvest cart: open plank body, four spoked wheels, axle and shafts.
  const cx=-117,cz=-96,cy=ground(cx,cz);box(cx,cy+1.0,cz,2.3,.18,3.7,'wood');for(const side of [-1,1]){for(let y=1.25;y<2.05;y+=.26)box(cx+side*1.1,cy+y,cz,.13,.19,3.7,'door');for(const dz of [-1.35,1.35]){
    beam([cx-1.45,cy+.7,cz+dz],[cx+1.45,cy+.7,cz+dz],.11,'iron');const wheel=new THREE.Mesh(new THREE.TorusGeometry(.67,.08,6,14),mats.trim);wheel.rotation.y=Math.PI/2;wheel.position.set(cx+side*1.4,cy+.73,cz+dz);wheel.castShadow=true;g.add(wheel);for(let a=0;a<Math.PI;a+=Math.PI/4)beam([cx+side*1.4,cy+.73+Math.cos(a)*.61,cz+dz+Math.sin(a)*.61],[cx+side*1.4,cy+.73-Math.cos(a)*.61,cz+dz-Math.sin(a)*.61],.037,'door');}
    beam([cx+side*.8,cy+.9,cz+1.5],[cx+side*.8,cy+.8,cz+4.2],.075);}
  for(let k=0;k<4;k++)box(cx+(k%2-.5),cy+1.38,cz+Math.floor(k/2)-.6,.8,.5,.75,'hay');
  // Trough with visible water, bucket and farm tools.
  const tx=-120,tz=-130,ty=ground(tx,tz);box(tx,ty+.28,tz,1.2,.45,3.3,'stone');for(const side of [-1,1])box(tx+side*.6,ty+.62,tz,.18,.5,3.4,'stone');for(const side of [-1,1])box(tx,ty+.62,tz+side*1.6,1.2,.5,.18,'stone');box(tx,ty+.60,tz,1.03,.04,3.03,'water');
  for(let k=0;k<3;k++){const x=-105.3+k*.47,z=-102.5,y=ground(x,z);beam([x,y,z-1],[x-.4,y+2.4,z],.045);box(x-.4,y+2.45,z,.45,.5,.10,k===0?'iron':'wood');}
  const ly=ground(-121,-105);for(const dx of [-.4,.4])beam([-121+dx,ly,-105],[-120.1+dx,ly+4.2,-108],.065);for(let k=0;k<10;k++)beam([-121+.09*k-.4,ly+.42*k,-105-.3*k],[-121+.09*k+.4,ly+.42*k,-105-.3*k],.045,'door');
  // Small flock in the stable yard: volumetric wool, heads, ears and four legs.
  for(const [x,z,a]of [[-117,-137,.2],[-116,-141,1.2],[-119,-144,2.3],[-113,-128,-.3]]){const y=ground(x,z);ball(x,y+.86,z,.61,.56,.95,'cream');const dx=Math.sin(a),dz=Math.cos(a);ball(x+dx*.86,y+1.03,z+dz*.86,.28,.31,.34,'trim');for(const s of [-1,1])ball(x+dx*.89+s*.29,y+1.14,z+dz*.89,.2,.08,.1,'cream');for(const xx of [-.35,.35])for(const zz of [-.5,.5])beam([x+xx,y+.12,z+zz],[x+xx,y+.75,z+zz],.08,'trim');}
  // Small cobbles and yard straw break up the court surface without blocking travel.
  for(let k=0;k<190;k++){const x=-122+rand()*18,z=-101+rand()*10;if(k%3===0)ball(x,ground(x,z)+.31,z,.10+rand()*.18,.06,.12,'stone');else box(x,ground(x,z)+.31,z,.035,.02,.35,'hay',rand()*6.28);}
  for(const [key,rows]of batches){const [type,m]=key.split(':'),mesh=new THREE.InstancedMesh(geometries[type],mats[m],rows.length);rows.forEach((r,i)=>{dummy.position.set(r[0],r[1],r[2]);dummy.scale.set(r[3],r[4],r[5]);dummy.rotation.set(r[6],r[7],r[8]);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.castShadow=true;mesh.receiveShadow=true;mesh.name='sw-orchard-farm '+key;g.add(mesh);}
  return g;
}
