import { heightAt, bankZ, roadNetwork, layout, claimDistrict } from './root.js';
import { claimSouthCluster } from './south-bank.js';
import { claimWestHolding, westFarmPlan, nearestWestRoad } from './south-west-farms.js';

export function build(THREE, ctx) {
  claimDistrict('south-bank'); claimSouthCluster('west'); claimWestHolding('paddock');
  const group=new THREE.Group(); group.name='sw-paddock-farm complete livestock holding';
  const plan=westFarmPlan(), houses=plan.houses.filter(s=>s.holding==='paddock'), barns=plan.barns.filter(s=>s.holding==='paddock');
  const sharedRoads=roadNetwork(), village=layout();
  const materials={}; const mat=(name,color)=>materials[name] ||= new THREE.MeshStandardMaterial({color,roughness:.94});
  const plaster=mat('ochre plaster',0xd6c49e), white=mat('lime plaster',0xe1d6b8), wood=mat('aged oak',0x66503b), boards=mat('weathered boards',0x93724f), dark=mat('deep openings',0x292f2a), stone=mat('foundation',0x918b77), roof=mat('clay tiles',0x9b5841), slate=mat('slate',0x535e5d), tile=mat('tile ridges',0xad684b), green=mat('shutters',0x526b53), iron=mat('iron',0x353b38), dirt=mat('worn earth',0xa29574), soil=mat('garden soil',0x6e5b40), straw=mat('golden hay',0xb6a060), grass=mat('pasture grass',0x6d873f), leaf=mat('vegetables',0x507742), pale=mat('wool',0xe4debf), hoof=mat('sheep faces',0x504c3c), water=mat('trough water',0x6e9690);
  const batches=new Map(), cube=new THREE.BoxGeometry(1,1,1), ball=new THREE.IcosahedronGeometry(1,1), cylinder=new THREE.CylinderGeometry(1,1,1,9);
  function instance(geo,m,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0) {
    const key=geo.uuid+m.uuid; if(!batches.has(key))batches.set(key,{geo,m,items:[]});
    const o=new THREE.Object3D();o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.set(rx,ry,rz);o.updateMatrix();batches.get(key).items.push(o.matrix.clone());
  }
  const box=(x,y,z,w,h,d,m,ry=0)=>instance(cube,m,x,y,z,w,h,d,0,ry);
  const orb=(x,y,z,a,b,c,m)=>instance(ball,m,x,y,z,a,b,c);
  const cyl=(x,y,z,r,h,m,rx=0,rz=0)=>instance(cylinder,m,x,y,z,r,h,r,rx,0,rz);
  function beam(a,b,w,m=wood,d=w) {
    const mid=new THREE.Vector3().addVectors(new THREE.Vector3(...a),new THREE.Vector3(...b)).multiplyScalar(.5);
    const v=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),o=new THREE.Object3D();
    o.position.copy(mid);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());o.scale.set(w,v.length(),d);o.updateMatrix();
    const key=cube.uuid+m.uuid;if(!batches.has(key))batches.set(key,{geo:cube,m,items:[]});batches.get(key).items.push(o.matrix.clone());
  }
  const walks=[];
  function path(points,width,m=dirt,lift=.26) {
    if(m===dirt)walks.push({points,width});
    const v=[],ix=[];
    for(let k=1;k<points.length;k++) {const a=points[k-1],b=points[k],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),n=Math.ceil(len/.8);
      for(let i=0;i<n;i++){let off=v.length/3;for(const t of [i/n,(i+1)/n])for(const side of [-1,1]){const x=a[0]+dx*t-dz/len*width*.5*side,z=a[1]+dz*t+dx/len*width*.5*side;v.push(x,heightAt(x,z)+lift,z);}ix.push(off,off+1,off+2,off+1,off+3,off+2);}}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(ix);geo.computeVertexNormals();const o=new THREE.Mesh(geo,m);o.receiveShadow=true;group.add(o);
  }
  function post(x,z,h=1.45){box(x,heightAt(x,z)+h/2,z,.17,h,.17,wood);}
  function fence(a,b,gate=false) {
    const len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(len/2.4);
    for(let i=0;i<=n;i++){let t=i/n;post(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t);}
    for(let i=0;i<n;i++){let t=i/n,u=(i+1)/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,xx=a[0]+(b[0]-a[0])*u,zz=a[1]+(b[1]-a[1])*u;for(const h of [.5,1.02])beam([x,heightAt(x,z)+h,z],[xx,heightAt(xx,zz)+h,zz],.12,boards);}
  }
  function gate(a,b) {post(...a,1.6);post(...b,1.6); // leaves stand open along the entrance's sides
    const len=Math.hypot(b[0]-a[0],b[1]-a[1]);const dx=(b[0]-a[0])/len,dz=(b[1]-a[1])/len;
    for(const p of [a,b]){const q=[p[0]-dz*len*.43,p[1]+dx*len*.43];for(const h of [.35,.8,1.25])beam([p[0],heightAt(...p)+h,p[1]],[q[0],heightAt(...q)+h,q[1]],.11,boards);beam([p[0],heightAt(...p)+.35,p[1]],[q[0],heightAt(...q)+1.25,q[1]],.10);}}
  function building(s,type='house',wall=plaster) {
    const starts=new Map([...batches].map(([key,b])=>[key,b.items.length])),meshStart=group.children.length;
    let yaw=0;
    if(type==='house'&&s.w===9){const road=sharedRoads.find(r=>r.id==='bridge-south');for(let i=1;i<road.points.length;i++){const a=road.points[i-1],b=road.points[i];if(s.z<=a[1]&&s.z>=b[1])yaw=Math.atan2(a[0]-b[0],a[1]-b[1]);}}
    const world=(dx,dz)=>[s.x+Math.cos(yaw)*dx+Math.sin(yaw)*dz,s.z-Math.sin(yaw)*dx+Math.cos(yaw)*dz];
    const {x,z,w,d}=s,h=type==='barn'?6.8:type==='stable'?3.4:5.4,rise=w*.36;
    const ground=[[-1,-1],[-1,1],[1,-1],[1,1]].map(([a,b])=>heightAt(...world(a*(w/2+.2),b*(d/2+.2)))), floor=Math.max(...ground)+.18,low=Math.min(...ground)-.25,top=floor+h;
    box(x,(floor+low)/2,z,w+.3,floor-low,d+.3,stone);box(x,floor+h/2,z,w,h,d,wall);
    for(const side of [-1,1]){const zz=z+side*(d/2+.035);box(x,floor+.16,zz,w,.22,.17,wood);box(x,top-.15,zz,w,.22,.17,wood);for(const off of [-w/2+.1,0,w/2-.1])box(x+off,floor+h/2,zz,.18,h,.17,wood);}
    for(const side of [-1,1]){box(x+side*w/2,floor+.2,z,.18,.22,d,wood);box(x+side*w/2,top-.14,z,.18,.25,d,wood);for(let k=-d/2+.2;k<d/2;k+=2.7)box(x+side*(w/2+.02),floor+h/2,z+k,.16,h,.16,wood);}
    if(type!=='house')for(let k=-w/2+.3;k<w/2;k+=.45)for(const side of [-1,1])box(x+k,floor+h/2,z+side*(d/2+.06),.045,h,.06,wood);
    const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,rise);shape.closePath();
    const geo=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false});const gable=new THREE.Mesh(geo,wall);gable.position.set(x,top,z-d/2);gable.castShadow=true;group.add(gable);
    const rm=type==='house'?roof:slate,over=.48,half=w/2+over,rr=rise+over*.72,slope=Math.hypot(half,rr),ang=Math.atan2(rr,half);
    for(const side of [-1,1]) {instance(cube,rm,x+side*half/2,top+rise-rr/2,z,slope,.22,d+2*over,0,0,-side*ang);
      beam([x+side*half,top-.35,z-d/2-over],[x+side*half,top-.35,z+d/2+over],.20,wood);
      for(let row=1;row<9;row++){const t=row/9;beam([x+side*half*t,top+rise-rr*t+.16,z-d/2-over],[x+side*half*t,top+rise-rr*t+.16,z+d/2+over],.055,type==='house'?tile:stone);}
      for(const end of [-1,1])beam([x,top+rise+.06,z+end*(d/2+over)],[x+side*half,top-.33,z+end*(d/2+over)],.14,wood);
    }
    box(x,top+rise+.13,z,.28,.24,d+1.05,rm);
    const cx=x-w*.27,cz=z-d*.22,cy=top+rise*.73;box(cx,cy,cz,.85,3.2,.85,stone);box(cx,cy+1.65,cz,1.03,.22,1.03,stone);box(cx,cy+1.78,cz,.65,.07,.65,dark);
    function window(xx,zz,side=false){const yy=floor+2.9;box(xx,yy,zz,side?.13:1.18,1.45,side?1.18:.13,dark);for(const k of [-1,1]){box(xx+(side?0:k*.65),yy,zz+(side?k*.65:0),side?.20:.14,1.65,side?.14:.20,white);box(xx,yy+k*.79,zz,side?.2:1.45,.13,side?1.45:.2,white);box(xx+(side?0:k*1.03),yy,zz+(side?k*1.03:0),side?.18:.53,1.45,side?.53:.18,green);}box(xx,yy,zz,side?.2:.08,1.42,side?.08:.2,boards);box(xx,yy,zz,side?.2:1.2,.08,side?1.2:.2,boards);}
    if(type==='house') {for(const side of [-1,1])for(const off of [-w*.28,w*.28])window(x+off,z+side*(d/2+.12));for(const side of [-1,1])window(x+side*(w/2+.12),z,true);}
    else {window(x-w*.29,z+d/2+.13);box(x,top+.7,z+d/2+.04,1.7,1.25,.12,dark);box(x,top+.04,z+d/2+.22,2.1,.17,.7,boards);}
    const doorW=type==='barn'?3.8:type==='stable'?2.1:1.38,doorH=type==='barn'?3.7:2.35,zz=z+d/2+.14;
    box(x,floor+doorH/2,zz,doorW,doorH,.20,boards);for(let off=-doorW/2+.13;off<doorW/2;off+=.27)box(x+off,floor+doorH/2,zz+.12,.028,doorH,.035,wood);
    for(const side of [-1,1])box(x+side*(doorW/2+.11),floor+doorH/2,zz,.2,doorH+.25,.3,wood);box(x,floor+doorH+.1,zz,doorW+.4,.2,.3,wood);
    for(const yy of [.5,1.8])box(x,floor+yy,zz+.13,doorW,.1,.10,iron);beam([x-doorW/2,floor+.25,zz+.15],[x+doorW/2,floor+doorH-.2,zz+.15],.12,wood);
    for(let k=0;k<3;k++){const pz=zz+.35+k*.43,gy=heightAt(...world(0,pz-z)),sy=floor-.10-k*.12;box(x,(sy+gy)/2,pz,doorW+.4,Math.max(.13,sy-gy),.46,stone);}
    if(yaw){const transform=new THREE.Matrix4().makeTranslation(x,0,z).multiply(new THREE.Matrix4().makeRotationY(yaw)).multiply(new THREE.Matrix4().makeTranslation(-x,0,-z));for(const [key,b] of batches){for(let i=starts.get(key)||0;i<b.items.length;i++)b.items[i].premultiply(transform);}for(let i=meshStart;i<group.children.length;i++)group.children[i].applyMatrix4(transform);}
    return {x,z,w,d,floor,yaw,door:world(0,zz+1.2-z)};
  }
  const built=houses.map((s,i)=>building(s,'house',i?white:plaster));const barn=building(barns[0],'barn',boards);
  const stable=building({x:-96,z:-112,w:5,d:8},'stable',boards);
  // Connections are recreated after the complete parent holding is claimed.
  const entry=nearestWestRoad(-94,-60);
  path([[entry.x,entry.z],[-94,-68],[-94,-91],[-89,-99],[-82,-99],barn.door],3.25);
  path([[-90,-99],[-74,-99]],7.5);
  path([[-93,-99],[-91.4,-112],[-91.4,-126]],2.2);
  path([[-91.4,-105],stable.door],1.8);
  path([built[0].door,[-82,-69],[-94,-69]],1.55);
  path([built[1].door,[-61,-70],[-73,-69],[-94,-69]],1.4);
  path([[-82,-91],[-82,-98]],1.2);
  path([[-68,-89],[-72,-94],[-75,-99]],1.2);
  // Three-sided productive gardens with an actual entrance gap.
  function garden(x,z,w,d){fence([x-w/2-.4,z+d/2+.4],[x+w/2+.4,z+d/2+.4]);path([[x-w/2,z],[x+w/2,z]],d,soil,.20);for(let a=-w/2+.65;a<w/2;a+=1.15)for(let b=-d/2+.55;b<d/2;b+=.7){orb(x+a,heightAt(x+a,z+b)+.35,z+b,.27,.24,.29,leaf);orb(x+a+.14,heightAt(x+a,z+b)+.32,z+b,.17,.20,.21,grass);}
    fence([x-w/2-.4,z-d/2-.4],[x-w/2-.4,z+d/2+.4]);fence([x+w/2+.4,z-d/2-.4],[x+w/2+.4,z+d/2+.4]);fence([x-w/2-.4,z-d/2-.4],[x-1,z-d/2-.4]);fence([x+1,z-d/2-.4],[x+w/2+.4,z-d/2-.4]);gate([x-1,z-d/2-.4],[x+1,z-d/2-.4]);}
  garden(-82,-90,8,5);garden(-70,-88.8,4,6);
  fence([-98,-72],[-96,-72]);gate([-96,-72],[-92,-72]);fence([-92,-72],[-89,-72]);
  fence([-73,-96],[-73,-105]);fence([-73,-105],[-75,-105]);
  // Paddock wholly west of the diagonal road; open gate joins the barn passage.
  fence([-97,-125],[-93,-125]);gate([-93,-125],[-90,-125]);fence([-90,-125],[-84,-125]);
  fence([-84,-125],[-84,-146]);fence([-84,-146],[-97,-146]);fence([-97,-146],[-97,-125]);
  path([[-91.5,-125],[-92,-132]],1.4,dirt,.22);
  // Open-front livestock shelter: back and side boards, posts, pitched roof and bedding.
  const sx=-93.8,sz=-141.5,sy=Math.max(...[-96.3,-91.3].flatMap(x=>[-144,-139].map(z=>heightAt(x,z))))+.08;
  const shelterLow=Math.min(...[-96.4,-91.2].flatMap(x=>[-144,-139].map(z=>heightAt(x,z))))-.15;
  box(sx,(shelterLow+sy)/2,sz,5.2,sy-shelterLow,4.7,stone);
  box(sx,sy+.1,sz,5.2,.2,4.7,straw);box(sx,sy+1.55,sz-2.25,5.2,3.1,.18,boards);
  for(const side of [-1,1]){box(sx+side*2.5,sy+1.55,sz,.18,3.1,4.5,boards);box(sx+side*2.5,sy+1.6,sz+2.25,.2,3.2,.2,wood);instance(cube,slate,sx+side*1.38,sy+3.5,sz,2.9,.18,5.3,0,0,-side*.27);}
  box(sx,sy+3.9,sz,.25,.2,5.4,slate);box(sx,sy+3.05,sz+2.35,5.25,.24,.22,wood);
  // Hollow stone trough with a visible water surface.
  const tx=-85.3,tz=-130.3,ty=heightAt(tx,tz);box(tx,ty+.18,tz,1.3,.25,3.1,stone);
  for(const side of [-1,1]){box(tx+side*.57,ty+.55,tz,.17,.7,3.1,stone);box(tx,ty+.55,tz+side*1.46,1.3,.7,.18,stone);}box(tx,ty+.62,tz,.96,.035,2.75,water);
  // Sheep in varied poses, all volumetric with four legs, ears, head and tail.
  for(const [x,z,angle] of [[-94.8,-130,.2],[-88.2,-128,1.5],[-90.1,-134,.7],[-95,-135.5,2.3],[-87,-139,2.8],[-89,-143,1.2],[-93,-137.5,3.2]]){
    const y=heightAt(x,z),p=(a,b,c)=>[x+Math.cos(angle)*a+Math.sin(angle)*c,y+b,z-Math.sin(angle)*a+Math.cos(angle)*c];
    let q=p(0,.91,0);instance(ball,pale,...q,.51,.5,.78,0,angle);for(const a of [-.3,.3])for(const c of [-.45,.45]){q=p(a,.32,c);box(...q,.12,.63,.12,hoof);}
    q=p(0,.95,.82);orb(...q,.24,.3,.32,hoof);for(const a of [-.29,.29]){q=p(a,1.1,.79);orb(...q,.18,.08,.12,hoof);}q=p(0,.96,-.81);orb(...q,.14,.14,.22,pale);
  }
  // Four-wheel wagon, planked bed, side boards, axles, spokes and shafts.
  const wx=-77,wz=-98,wy=heightAt(wx,wz);
  box(wx,wy+1.05,wz,2.7,.24,4.3,wood);
  for(let i=0;i<7;i++)box(wx-1.17+i*.39,wy+1.2,wz,.34,.16,4.2,boards);
  for(const side of [-1,1])for(const h of [1.45,1.78,2.1])box(wx+side*1.37,wy+h,wz,.12,.23,4.3,boards);
  for(const z of [wz-1.35,wz+1.35]){beam([wx-1.7,wy+.8,z],[wx+1.7,wy+.8,z],.15,iron);for(const side of [-1,1]){const x=wx+side*1.65;const tor=new THREE.Mesh(new THREE.TorusGeometry(.73,.095,6,14),wood);tor.rotation.y=Math.PI/2;tor.position.set(x,wy+.8,z);tor.castShadow=true;group.add(tor);cyl(x,wy+.8,z,.17,.28,iron,0,Math.PI/2);for(let j=0;j<8;j++){const a=j*Math.PI/4;beam([x,wy+.8,z],[x,wy+.8+Math.sin(a)*.69,z+Math.cos(a)*.69],.065,boards);}}}
  for(const side of [-1,1])beam([wx+side*.95,wy+1,wz+1.6],[wx+side*.95,wy+.55,wz+5.5],.13,wood);
  function bale(x,z,y=0){const base=heightAt(x,z)+y;box(x,base+.55,z,1.35,1.1,1.95,straw);for(const a of [-.4,.4])box(x+a,base+.57,z,.055,1.15,2.01,wood);}
  for(const [x,z,y] of [[-86,-102,0],[-87.5,-102,0],[-86.8,-102,1.1],[-79,-118,0],[-77.5,-118,0],[-77,-98,1.32]])bale(x,z,y);
  // Firewood, covered by a simple full-depth lean-to beside the stable.
  for(let row=0;row<3;row++)for(let j=0;j<5-row;j++){const x=-96.9+j*.43+row*.2,z=-119.4;cyl(x,heightAt(x,z)+.22+row*.36,z,.2,2.1,boards,Math.PI/2);}
  for(const x of [-98,-94.3])box(x,heightAt(x,-119.4)+1.25,-119.4,.16,2.5,.16,wood);
  instance(cube,slate,-96.2,heightAt(-96.2,-119.4)+2.5,-119.4,4.1,.15,3,0,0,.06);
  // Barrels and hand tools on the stable apron.
  for(const [x,z] of [[-98,-105.8],[-96.5,-105.8],[-89,-100.8]]){const y=heightAt(x,z);cyl(x,y+.6,z,.44,1.2,boards);for(const h of [.22,.95])cyl(x,y+h,z,.46,.08,iron);cyl(x,y+1.21,z,.38,.06,dark);}
  for(let i=0;i<3;i++){const x=-94.4+i*.32,z=-107.9,y=heightAt(x,z);beam([x,y,z+.4],[x+.2,y+2.1,z],.06,boards);box(x+.2,y+2.15,z,.3,.38,.07,iron);}
  box(-90,heightAt(-90,-103)+.65,-103,1.8,.16,.8,boards);for(const x of [-90.65,-89.35])for(const z of [-103.25,-102.75])box(x,heightAt(x,z)+.32,z,.1,.64,.1,wood);
  // Fruit trees shade domestic margins without closing the entrance walks.
  for(const [x,z] of [[-88,-65],[-70,-63],[-97,-86]]){const y=heightAt(x,z);cyl(x,y+1.8,z,.18,3.6,wood);for(const [dx,dz] of [[-1.2,.5],[1.1,.5],[0,-1.1]]){beam([x,y+2.1,z],[x+dx,y+3.6,z+dz],.16);orb(x+dx,y+4,z+dz,1.4,1.65,1.4,leaf);}orb(x,y+5,z,1.5,1.5,1.4,grass);for(let i=0;i<8;i++){const a=i*2.4;orb(x+Math.sin(a)*1.7,y+3.6+(i%3)*.45,z+Math.cos(a)*1.4,.13,.14,.13,mat('apples',0xa28b38));}}
  for(const s of built){const x=s.door[0]-2*Math.cos(s.yaw)-.7*Math.sin(s.yaw),z=s.door[1]+2*Math.sin(s.yaw)-.7*Math.cos(s.yaw),y=heightAt(x,z);cyl(x,y+.24,z,.29,.48,roof);orb(x,y+.65,z,.38,.34,.38,leaf);for(const dx of [-.18,.18])orb(x+dx,y+.88,z,.13,.12,.12,mat('flowers',0xb59a65));}
  // Deterministic scattered grass and pebbles, excluding structures, walks and road shoulders.
  let seed=62341;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  const occupied=[...houses,...barns,{x:-96,z:-112,w:5,d:8},{x:sx,z:sz,w:5.5,d:5},{x:-82,z:-90,w:10,d:7},{x:-70,z:-89,w:6,d:8}];
  for(let i=0;i<2100;i++){const x=-99+random()*53,z=-149+random()*91,r=nearestWestRoad(x,z);if(r.distance<r.width/2+1.2||z>bankZ(x,-1)-7)continue;
    if(walks.some(({points,width})=>points.slice(1).some((b,i)=>{const a=points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)<width/2+.22;})))continue;
    if(occupied.some(s=>Math.abs(x-s.x)<s.w/2+(s.w===9?2:.6)&&Math.abs(z-s.z)<s.d/2+(s.w===9?2:.6)))continue;
    if((x>-94&&x<-72&&z>-104&&z<-95)||(Math.abs(x+94)<2&&z>-95)||(Math.abs(x+91.4)<1.4&&z<-100&&z>-130)||(Math.abs(z+69)<1.2&&x<-60))continue;
    // East of the authoritative bridge road is only sparse meadow texture.
    const bridge=sharedRoads.find(r=>r.id==='bridge-south');let east=false;
    for(let k=1;k<bridge.points.length;k++){const a=bridge.points[k-1],b=bridge.points[k];if(z<=a[1]&&z>=b[1]){const bx=a[0]+(b[0]-a[0])*(z-a[1])/(b[1]-a[1]);east=x>bx;break;}}
    if(east&&random()<.88)continue;
    const y=heightAt(x,z),h=.16+random()*.32;instance(cube,grass,x,y+h/2+.12,z,.055,h,.28,0,random()*Math.PI,.18);if(i%5===0)orb(x+.15,y+.14,z,.14,.08,.10,stone);
  }
  for(let i=0;i<130;i++){const x=-90+random()*15,z=-102+random()*6;orb(x,heightAt(x,z)+.30,z,.07+random()*.09,.04,.10,stone);}
  for(const {geo,m,items} of batches.values()){const inst=new THREE.InstancedMesh(geo,m,items.length);items.forEach((matrix,i)=>inst.setMatrixAt(i,matrix));inst.castShadow=true;inst.receiveShadow=true;group.add(inst);}
  return group;
}
