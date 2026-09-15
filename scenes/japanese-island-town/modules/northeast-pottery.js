import { heightAt, roadNetwork, layout } from './root.js';
import { northReservations } from './north.js';

export function build(THREE,ctx){
 const root=new THREE.Group();root.name='Pottery shop and household kitchen garden';
 const roads=roadNetwork(), reservations=northReservations(),lots=layout().town.lots;
 const palette={wood:'#796046',light:'#aa8a61',dark:'#4c4134',bamboo:'#95936b',soil:'#62513c',soil2:'#776048',stone:'#858375',cream:'#c2b594',blue:'#536f75',green:'#718b76',ochre:'#ae8657',clay:'#9a6e51',water:'#647b78',leaf:'#567344',leaf2:'#78834e',white:'#c6c3ac',indigo:'#667987',linen:'#b8ab8b',bark:'#604938',end:'#ad8d63'};
 const mats={};for(const [k,color] of Object.entries(palette))mats[k]=new THREE.MeshStandardMaterial({color,roughness:['cream','blue','green','ochre'].includes(k)?.34:.93,side:THREE.DoubleSide});
 let g;
 function section(id,kind,fn){g=new THREE.Group();g.name='northeast-pottery_'+id;g.userData.kind=kind;root.add(g);fn();}
 function mesh(geo,m,x,y,z){const o=new THREE.Mesh(geo,mats[m]);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
 function box(x,y,z,w,h,d,m,ry=0){const o=mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z);o.rotation.y=ry;return o;}
 function beam(a,b,r,m='wood'){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),v=B.clone().sub(A);const o=mesh(new THREE.CylinderGeometry(r,r,v.length(),7),m,...A.add(B).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
 function ball(x,y,z,rx,ry,rz,m){const o=mesh(new THREE.SphereGeometry(1,9,6),m,x,y,z);o.scale.set(rx,ry,rz);return o;}
 function ring(x,y,z,r,t,m){const o=mesh(new THREE.TorusGeometry(r,t,6,20),m,x,y,z);o.rotation.x=Math.PI/2;return o;}
 function vessel(x,y,z,r,h,m='clay',type='jar'){
  const shape=type==='bowl'?[[0,0],[.46,.02],[.65,.15],[1,.85],[1,1],[.88,1],[.83,.80],[.48,.18],[0,.15]]:[[0,0],[.62,0],[.93,.18],[1,.54],[.78,.82],[.59,.9],[.59,1],[.46,1],[.46,.89],[.60,.78],[.80,.5],[.68,.18],[0,.14]];
  mesh(new THREE.LatheGeometry(shape.map(([a,b])=>new THREE.Vector2(a*r,b*h)),20),m,x,y,z);ring(x,y+h,z,r*(type==='bowl'?.96:.535),.023,m);
 }
 function ground(x,z){return heightAt(x,z)+.06;}
 function topFor(x,z,w,d,h){return Math.max(...[-1,1].flatMap(a=>[-1,1].map(b=>ground(x+a*w/2,z+b*d/2))))+h;}
 function table(x,z,w,d,h=.75){const y=topFor(x,z,w,d,h);for(const dx of [-w/2+.10,w/2-.10])for(const dz of [-d/2+.1,d/2-.1]){const yy=ground(x+dx,z+dz);box(x+dx,(yy+y)/2,z+dz,.10,y-yy,.10,'wood');}for(let i=0;i<Math.ceil(d/.18);i++)box(x,y,z-d/2+(i+.5)*d/Math.ceil(d/.18),w,.09,d/Math.ceil(d/.18)-.012,i%3?'wood':'light');return y+.05;}
 function crate(x,z,w=.9,d=.65){const y=topFor(x,z,w,d,.08);box(x,y,z,w,.12,d,'dark');for(const dx of [-w/2+.045,w/2-.045])for(const dz of [-d/2+.04,d/2-.04]){const yy=ground(x+dx,z+dz);box(x+dx,(yy+y+.53)/2,z+dz,.075,y+.53-yy,.075,'wood');}for(let i=0;i<3;i++){for(const dz of [-d/2,d/2])box(x,y+.10+i*.16,z+dz,w,.11,.05,'light');for(const dx of [-w/2,w/2])box(x+dx,y+.10+i*.16,z,.05,.11,d,'wood');}for(let k=0;k<3;k++)vessel(x-w*.28+k*w*.28,y+.07,z,.12,.38,['green','cream','clay'][k]);}
 function bucket(x,z,r=.28){const y=ground(x,z);vessel(x,y,z,r,.45,'wood');ring(x,y+.10,z,r*.89,.024,'dark');ring(x,y+.34,z,r*.78,.022,'dark');beam([x-r*.5,y+.42,z],[x-r*.5,y+.72,z],.018,'dark');beam([x+r*.5,y+.42,z],[x+r*.5,y+.72,z],.018,'dark');beam([x-r*.5,y+.72,z],[x+r*.5,y+.72,z],.032,'light');}
 function roadDistance(x,z,r){return Math.min(...r.points.slice(1).map((b,i)=>{const a=r.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);}));}
 function clear(x,z){return x>-20.8&&x<-1.15&&z>-6.9&&z<28.8&&roads.every(r=>roadDistance(x,z,r)>r.width/2+.20)&&!reservations.gardens.some(p=>Math.hypot(x-p.x,z-p.z)<p.r+.15)&&!reservations.drains.z.some(zz=>Math.abs(z-zz)<.45);}
 function fence(a,b,bamboo=false){const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.7),p=[];for(let i=0;i<=n;i++){const x=a[0]+(b[0]-a[0])*i/n,z=a[1]+(b[1]-a[1])*i/n;if(!clear(x,z)){p.push(null);continue;}const y=ground(x,z);beam([x,y-.05,z],[x,y+.86,z],bamboo?.035:.055,bamboo?'bamboo':'wood');p.push([x,y,z]);if(!bamboo)box(x,y+.81,z,.15,.08,.15,'light');}for(let i=1;i<p.length;i++)if(p[i]&&p[i-1])for(const h of [.31,.69])beam([p[i-1][0],p[i-1][1]+h,p[i-1][2]],[p[i][0],p[i][1]+h,p[i][2]],.027,bamboo?'bamboo':'wood');}
 section('jar_display','low-pottery-display-with-individual-glazed-jars',()=>{
  const l=lots[28],x=l.x-3.15,z=3.7,y=table(x,z,2.7,1.05,.46);
  for(let row=0;row<2;row++)for(let j=0;j<6;j++)vessel(x-1.08+j*.43,y,z-.28+row*.55,.17+(j%2)*.025,.36+(j%3)*.10,['blue','cream','green','ochre','clay'][(j+row*2)%5]);
  for(let j=0;j<3;j++)vessel(-10.7+j*.68,ground(-10.7+j*.68,2.35),2.35,.28,.62,['clay','green','ochre'][j]);
 });
 section('bowl_cup_rack','three-shelf-rack-of-rimmed-bowls-and-cups',()=>{
  const x=-3.7,z=3.35,w=2.3,d=.72,y=topFor(x,z,w,d,.25);
  for(const dx of [-1.09,1.09])for(const dz of [-.31,.31]){const yy=ground(x+dx,z+dz);box(x+dx,(yy+y+1.75)/2,z+dz,.09,y+1.75-yy,.09,'wood');}
  for(let k=0;k<3;k++){box(x,y+k*.58,z,w,.08,d,'light');for(let j=0;j<6;j++){vessel(x-.92+j*.37,y+.05+k*.58,z,.145,k===2?.23:.14,['cream','green','blue','ochre'][(k+j)%4],k===2?'jar':'bowl');if(k===0)vessel(x-.92+j*.37,y+.10,z,.14,.14,'cream','bowl');}}
  beam([x-1.09,y,z-.32],[x+1.09,y+1.65,z-.32],.035,'dark');
 });
 section('potter_workyard','pottery-worktable-clay-tools-buckets-and-storage-crates',()=>{
  const x=-14.25,z=-1.8,y=table(x,z,1.8,1.0,.75);
  mesh(new THREE.CylinderGeometry(.35,.35,.08,20),'stone',x,y+.06,z);
  vessel(x,y+.11,z,.24,.27,'clay','bowl');
  for(let j=0;j<4;j++)beam([x+.48,y+.04,z-.30+j*.13],[x+.76,y+.06,z-.28+j*.13],.018,'bamboo');
  ball(x-.62,y+.14,z,.18,.13,.17,'clay');box(x-.57,y+.07,z+.30,.43,.05,.15,'linen');
  bucket(-13.55,-.35);bucket(-14.35,-.15,.34);crate(-14.2,-4.45,1.35,.8);crate(-14.2,1.1,1.3,.7);
  vessel(-15.55,ground(-15.55,-3.2),-3.2,.36,.7,'ochre');
  beam([-15.3,ground(-15.3,-1),-1],[-15.1,ground(-15.3,-1)+1.25,-.8],.03,'wood');
 });
 section('shop_fences','terrain-following-pottery-yard-fence-and-open-gates',()=>{fence([-16.3,-6.25],[-16.3,4.9]);fence([-16.3,-6.25],[-12.4,-6.25]);fence([-16.3,4.95],[-12.65,4.95]);fence([-11.55,5.03],[-8.45,5.03]);fence([-5.55,5.03],[-2.05,5.03]);fence([-12.65,4.95],[-13.0,3.85]);});
 section('laundry','sloped-side-yard-laundry-poles-pins-and-four-cloths',()=>{
  const x=-14.65,z0=14.3,z1=19.3,y0=ground(x,z0)+2.7,y1=ground(x,z1)+2.4;
  for(const [z,y] of [[z0,y0],[z1,y1]]){beam([x,ground(x,z)-.12,z],[x,y+.15,z],.065);beam([x-.3,y,z],[x+.3,y,z],.035,'bamboo');}
  for(let k=0;k<12;k++){const a=k/12,b=(k+1)/12;beam([x,y0+(y1-y0)*a-.15*Math.sin(a*Math.PI),z0+(z1-z0)*a],[x,y0+(y1-y0)*b-.15*Math.sin(b*Math.PI),z0+(z1-z0)*b],.012,'linen');}
  for(let k=0;k<4;k++){const z=z0+.55+k*1.12,t=(z-z0)/(z1-z0),yt=y0+(y1-y0)*t-.15*Math.sin(t*Math.PI),verts=[],ind=[];for(let j=0;j<6;j++){const zz=z+j*.15,tt=(zz-z0)/(z1-z0),top=y0+(y1-y0)*tt-.15*Math.sin(tt*Math.PI);for(let v=0;v<2;v++)verts.push(x+.065*Math.sin(j*1.8)*(v?1:.2),top-v*(k%2?1.15:1.4),zz);}for(let j=0;j<5;j++){const n=j*2;ind.push(n,n+1,n+2,n+2,n+1,n+3);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(ind);geo.computeVertexNormals();mesh(geo,['white','indigo','linen','white'][k],0,0,0);for(const j of [0,4]){const zz=z+j*.15,tt=(zz-z0)/(z1-z0);box(x,y0+(y1-y0)*tt-.15*Math.sin(tt*Math.PI)+.025,zz,.055,.14,.04,'light');}}
 });
 section('wash_station','rimmed-wash-basin-water-scrubboard-and-handled-bucket',()=>{
  const x=-13.35,z=13.6,y=ground(x,z);vessel(x,y,z,.55,.45,'wood','bowl');mesh(new THREE.CylinderGeometry(.45,.45,.025,24),'water',x,y+.30,z);ring(x,y+.10,z,.40,.025,'dark');
  const board=box(x+.14,y+.42,z,.33,.055,.85,'light');board.rotation.x=.52;for(let i=0;i<8;i++)box(x+.14,y+.24+i*.044,z-.29+i*.07,.29,.03,.035,'wood');bucket(-13.55,12.55);
 });
 section('firewood_storage','split-firewood-stack-endgrain-chopping-block-and-storage',()=>{
  const x=-14.4,z=11.6,y=topFor(x,z,2.1,.8,.12);box(x,y,z,2.2,.10,.85,'wood');for(const dx of [-.95,.95])for(const dz of [-.32,.32]){const gy=ground(x+dx,z+dz);box(x+dx,(gy+y)/2,z+dz,.13,y-gy,.13,'wood');}
  for(let row=0;row<4;row++)for(let j=0;j<7-row%2;j++){const xx=x-.87+j*.28+(row%2)*.12,yy=y+.18+row*.23;const o=mesh(new THREE.CylinderGeometry(.14,.12,.7,5),'bark',xx,yy,z);o.rotation.x=Math.PI/2;for(const s of [-1,1]){const e=mesh(new THREE.CircleGeometry(.115,5),'end',xx,yy,z+s*.356);e.rotation.y=s<0?Math.PI:0;beam([xx-.07,yy-.04,z+s*.36],[xx+.065,yy+.045,z+s*.36],.008,'dark');}}
  for(const dx of [-1.12,1.12])beam([x+dx,ground(x+dx,z),z],[x+dx,y+1.05,z],.06);
  const xx=-13.4,zz=19.7,yy=ground(xx,zz);mesh(new THREE.CylinderGeometry(.34,.4,.52,9),'bark',xx,yy+.26,zz);mesh(new THREE.CylinderGeometry(.32,.32,.02,9),'end',xx,yy+.53,zz);beam([xx,yy+.5,zz],[xx+.3,yy+1.23,zz],.028);box(xx+.06,yy+.66,zz,.28,.16,.055,'stone');crate(-13.8,17.8,.75,.62);
 });
 section('terraced_kitchen_garden','shallow-stepped-vegetable-pockets-connected-tending-stairs-and-two-tied-trellises',()=>{
  const stats={pockets:0,vegetables:0,maxSoilFace:0,pathWidth:.60,maxRiser:0,trellises:2};
  const cells=[];
  // Sample every 5cm; a soil pocket is divided until its total exposed face is shallow.
  function samples(x0,z0,x1,z1){const ys=[],nx=Math.ceil((x1-x0)/.05),nz=Math.ceil((z1-z0)/.05);for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++)ys.push(heightAt(x0+(x1-x0)*i/nx,z0+(z1-z0)*j/nz));return {lo:Math.min(...ys),hi:Math.max(...ys)};}
  function pocket(x0,z0,x1,z1){
   const s=samples(x0,z0,x1,z1);
   if(s.hi-s.lo>.20){
    const dx=Math.abs(heightAt(x1,(z0+z1)/2)-heightAt(x0,(z0+z1)/2)),dz=Math.abs(heightAt((x0+x1)/2,z1)-heightAt((x0+x1)/2,z0));
    if(dx>dz){const m=(x0+x1)/2;pocket(x0,z0,m,z1);pocket(m,z0,x1,z1);}else{const m=(z0+z1)/2;pocket(x0,z0,x1,m);pocket(x0,m,x1,z1);}return;
   }
   const y=s.hi+.25,base=s.lo-.045;
   box((x0+x1)/2,(y+base)/2,(z0+z1)/2,x1-x0,y-base,z1-z0,'soil');
   cells.push({x0,z0,x1,z1,y});stats.pockets++;stats.maxSoilFace=Math.max(stats.maxSoilFace,y-s.lo);
   const fz=(z0+z1)/2;box((x0+x1)/2,y+.006,fz,(x1-x0)*.84,.014,.013,'soil2');
  }
  function edge(a,b){const n=Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1])/.12);for(let i=0;i<n;i++){
   const x0=a[0]+(b[0]-a[0])*i/n,z0=a[1]+(b[1]-a[1])*i/n,x1=a[0]+(b[0]-a[0])*(i+1)/n,z1=a[1]+(b[1]-a[1])*(i+1)/n;
   beam([x0,heightAt(x0,z0)+.28,z0],[x1,heightAt(x1,z1)+.28,z1],.023,'wood');
   if(i%4===0)beam([x0,heightAt(x0,z0)-.04,z0],[x0,heightAt(x0,z0)+.40,z0],.022,'wood');
  }}
  const rows=[23.48,24.63,25.78,26.93],x0=-9.44,x1=-4.12;
  rows.forEach((z,row)=>{
   for(let i=0;i<14;i++)for(let k=0;k<2;k++)pocket(x0+i*.38,z-.22+k*.22,x0+(i+1)*.38,z+k*.22);
   edge([x0,z-.235],[x1,z-.235]);edge([x0,z+.235],[x1,z+.235]);edge([x0,z-.235],[x0,z+.235]);edge([x1,z-.235],[x1,z+.235]);
   for(let i=0;i<14;i++){
    const x=x0+(i+.5)*.38,zz=z+(i%2?.035:-.035),cell=cells.find(c=>x>=c.x0-1e-6&&x<=c.x1+1e-6&&zz>=c.z0&&zz<=c.z1),y=cell.y;stats.vegetables++;
    if(row===1||row===3&&i>9){mesh(new THREE.ConeGeometry(.055,.18,7),'cream',x,y+.065,zz);for(let k=0;k<5;k++)beam([x,y+.08,zz],[x+Math.cos(k*2.4)*.12,y+.33,zz+Math.sin(k*2.4)*.12],.019,'leaf');}
    else{ball(x,y+.105,zz,.105,.105,.10,'leaf2');for(let k=0;k<5;k++){const a=k*2.4,o=ball(x+Math.cos(a)*.073,y+.105,zz+Math.sin(a)*.073,.095,.033,.14,k%2?'leaf':'leaf2');o.rotation.set(.3,a,.2);}}
   }
  });
  // Continuous stone tending surface: horizontal 14cm levels with terrain-seated
  // riser faces. Dense cells make contour-shaped steps instead of tall bed platforms.
  function path(x0,z0,x1,z1){
   const nx=Math.ceil((x1-x0)/.05),nz=Math.ceil((z1-z0)/.05),dx=(x1-x0)/nx,dz=(z1-z0)/nz,ys=[],bottom=[],v=[],ind=[];
   for(let j=0;j<nz;j++){ys[j]=[];bottom[j]=[];for(let i=0;i<nx;i++){
    const x=x0+i*dx,z=z0+j*dz,s=samples(x,z,x+dx,z+dz);const lift=.045+.205*Math.max(0,Math.min(1,((z+dz/2)-23.1)/.35,(28.05-(z+dz/2))/.35));ys[j][i]=Math.ceil(s.hi/.14)*.14+lift;bottom[j][i]=s.lo-.03;
   }}
   function quad(a,b,c,d){const k=v.length/3;v.push(...a,...b,...c,...d);ind.push(k,k+1,k+2,k,k+2,k+3);}
   for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){
    const x=x0+i*dx,z=z0+j*dz,y=ys[j][i],X=x+dx,Z=z+dz;
    quad([x,y,z],[x,y,Z],[X,y,Z],[X,y,z]);
    for(const [ni,nj,side]of[[i-1,j,0],[i+1,j,1],[i,j-1,2],[i,j+1,3]]){
     const other=ys[nj]?.[ni],low=other??bottom[j][i];if(other!==undefined)stats.maxRiser=Math.max(stats.maxRiser,Math.abs(y-other));if(low>=y-.001)continue;
     if(side===0)quad([x,low,z],[x,low,Z],[x,y,Z],[x,y,z]);
     if(side===1)quad([X,low,Z],[X,low,z],[X,y,z],[X,y,Z]);
     if(side===2)quad([X,low,z],[x,low,z],[x,y,z],[X,y,z]);
     if(side===3)quad([x,low,Z],[X,low,Z],[X,y,Z],[x,y,Z]);
    }
   }
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(ind);geo.computeVertexNormals();mesh(geo,'stone',0,0,0);
  }
  // Four aisles join the interior spine. Its ends meet, without covering,
  // the parent's south (z23.1) and north (z28.05) perimeter paths.
  path(-4.10,23.1,-3.50,28.05);
  for(const z of rows)path(-9.49,z+.26,-4.10,z+.86);
  // Soil is within 24cm of a full-width aisle, with two compact tied climbing frames.
  for(const x of [-8.7,-6.8]){
   const z=rows[3],y0=heightAt(x-.5,z)+.12,y1=heightAt(x+.5,z)+.12;
   for(const [xx,y]of[[x-.5,y0],[x+.5,y1]]){beam([xx,heightAt(xx,z-.17)-.04,z-.17],[xx,y+1.25,z],.024,'bamboo');beam([xx,heightAt(xx,z+.17)-.04,z+.17],[xx,y+1.25,z],.024,'bamboo');}
   beam([x-.55,y0+1.25,z],[x+.55,y1+1.25,z],.026,'bamboo');
   for(let i=0;i<4;i++){const xx=x-.42+i*.28,t=(xx-x+.5),base=heightAt(xx,z)+.13,top=y0+(y1-y0)*t+1.25;beam([xx,base,z],[xx,top,z],.008,'linen');for(let j=0;j<4;j++){const yy=base+.22+j*.22;ball(xx+(j%2?.065:-.065),yy,z,.085,.035,.060,'leaf');}for(const dz of [-.023,.023])beam([xx-.04,top-.028,z+dz],[xx+.04,top+.028,z-dz],.009,'linen');}
  }
  g.userData.gardenAudit=stats;
 });
 section('compost_tools','slatted-compost-bin-watering-can-hoe-and-garden-pots',()=>{
  const x=-3.0,z=27.3,y=topFor(x,z,.7,.9,.10);const gy=Math.min(ground(x-.37,z-.45),ground(x+.37,z-.45),ground(x-.37,z+.45),ground(x+.37,z+.45));box(x,(gy+y+.3)/2,z,.62,y+.3-gy,.8,'soil');for(const dx of [-.37,.37])for(const dz of [-.45,.45]){const yy=ground(x+dx,z+dz);box(x+dx,(yy+y+.7)/2,z+dz,.065,y+.7-yy,.065,'wood');}for(let j=0;j<5;j++)for(const dx of [-.37,.37])box(x+dx,y+.06+j*.14,z,.055,.09,.95,'wood');for(let j=0;j<5;j++)box(x,y+.06+j*.14,z+.45,.75,.09,.055,'wood');for(let j=0;j<12;j++)ball(x+Math.sin(j*3)*.22,y+.32,z+Math.cos(j*4)*.32,.11,.05,.13,j%2?'soil2':'leaf2');
  const xx=-2.65,zz=24.2,yy=ground(xx,zz);vessel(xx,yy,zz,.23,.4,'green');beam([xx-.18,yy+.20,zz],[xx-.55,yy+.48,zz],.055,'green');const o=mesh(new THREE.TorusGeometry(.17,.025,6,16),'dark',xx+.16,yy+.4,zz);o.rotation.y=Math.PI/2;
  beam([-2.5,ground(-2.5,25.3),25.3],[-2.55,ground(-2.5,25.3)+1.35,25.1],.025,'wood');box(-2.5,ground(-2.5,25.3)+.05,25.3,.3,.07,.15,'stone');
  for(let j=0;j<3;j++)vessel(-3.5+j*.38,ground(-3.5+j*.38,22.85),22.85,.15,.22,['clay','green','ochre'][j]);
 });
 section('household_bench','domestic-bench-folded-linen-cup-and-water-jar',()=>{
  const x=-3.8,z=12.2,y=table(x,z,1.7,.66,.43);for(let i=0;i<3;i++)box(x-.37,y+.045+i*.045,z,.65,.043,.42,i%2?'white':'linen');vessel(x+.48,y,z,.12,.18,'green');vessel(-2.8,ground(-2.8,13.25),13.25,.31,.63,'ochre');
 });
 section('household_fences','bamboo-household-fences-open-gate-and-garden-boundary',()=>{
  fence([-16.2,10.85],[-16.2,16.2],true);fence([-16.2,10.85],[-12.0,10.85],true);fence([-11.65,10.85],[-8.45,10.85],true);fence([-5.55,10.85],[-2.05,10.85],true);fence([-12,10.85],[-12.3,11.8],true);
  fence([-9.45,28.55],[-2.05,28.55],true);fence([-2.05,23.4],[-2.05,28.55],true);
 });
 return root;
}
