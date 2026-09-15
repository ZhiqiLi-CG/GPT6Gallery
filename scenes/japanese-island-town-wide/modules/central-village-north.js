import {heightAt,roadNetwork,layout} from './root.js';
import {createVillageKit} from './central-village.js';

export function build(THREE,ctx){
 const all=new THREE.Group();all.name='central-village-north';
 const palette={wood:0x66503a,dark:0x40372e,plaster:0xc2b294,board:0x90765a,stone:0x85887e,leaf:0x516344,soil:0x685743};
 function part(name){const g=new THREE.Group();g.name='central-village-north_'+name;all.add(g);return g;}
 for(const [n,tall] of [[9,true],[10,false]]){
  const p=layout().lots.find(p=>p.id===`central-village-lot-${n}`),s=p.front==='east'?1:-1;
  const g=part(tall?'bookseller_house_yard':'hillward_house_yard'),k=createVillageKit(THREE,g),{material,box,cylinder,beam}=k;
  const x=u=>p.x+s*u,z=v=>p.z+v,Y=p.y+0.44,H=tall?5.35:3.02,W=6,D=6.4;
  const b=(u,y,v,w,h,d,m=palette.wood)=>box(x(u),y,z(v),w,h,d,m);
  const bm=(a,c,w,m=palette.wood)=>beam([x(a[0]),a[1],z(a[2])],[x(c[0]),c[1],z(c[2])],w,m);
  const cy=(u,y,v,r,h,m=palette.wood)=>cylinder(x(u),y,z(v),r,r,h,m,12);
  const ground=(u,v)=>heightAt(x(u),z(v));
  function footing(u,v,w,d,top){k.foundation(x(u),z(v),w,d,top);}
  footing(0,0,W,D,Y);
  // Joists, sill and genuine wall apertures; openings are assembled around empty space.
  b(0,Y+0.08,0,W,0.16,D,palette.dark);
  for(const u of [-3,3])for(const v of [-3.2,0,3.2])b(u,Y+H/2,v,0.19,H,0.19,palette.dark);
  for(const yy of [0.2,2.65,H]){
   for(const u of [-3,3])b(u,Y+yy,0,0.20,0.18,D+0.16,palette.dark);
   for(const v of [-3.2,3.2])b(0,Y+yy,v,W+0.18,0.18,0.20,palette.dark);
  }
  const openings=[{v:-0.9,w:1.24,lo:.2,hi:2.35,door:true},{v:1.65,w:1.45,lo:1.0,hi:2.18}];
  function facade(u,ops,h,base){
   const cuts=[-D/2,...ops.flatMap(o=>[o.v-o.w/2,o.v+o.w/2]),D/2].sort((a,b)=>a-b);
   for(let i=1;i<cuts.length;i++){
    const a=cuts[i-1],c=cuts[i],mid=(a+c)/2,o=ops.find(o=>mid>o.v-o.w/2&&mid<o.v+o.w/2);
    if(!o)b(u,base+h/2,mid,.16,h,c-a,tall?palette.plaster:palette.board);
    else {b(u,base+o.lo/2,mid,.16,o.lo,c-a,palette.board);b(u,base+(o.hi+h)/2,mid,.16,h-o.hi,c-a,palette.plaster);}
   }
   for(const o of ops){
    const outward=Math.sign(u),face=u+outward*.14,back=u-outward*.055;
    b(back,base+(o.lo+o.hi)/2,o.v,.055,o.hi-o.lo,o.w,0x302f29);
    b(back+outward*.025,base+(o.lo+o.hi)/2,o.v,.035,o.hi-o.lo-.12,o.w-.12,o.door?0x9a8d70:0xc0bda3);
    for(const vv of [o.v-o.w/2,o.v+o.w/2])b(face,base+(o.lo+o.hi)/2,vv,.23,o.hi-o.lo+.16,.105,palette.dark);
    for(const yy of [o.lo,o.hi])b(face,base+yy,o.v,.27,.115,o.w+.22,palette.dark);
    for(let j=1;j<(o.door?7:9);j++)b(face,base+(o.lo+o.hi)/2,o.v-o.w/2+j*o.w/(o.door?7:9),.065,o.hi-o.lo,.035,palette.wood);
    for(const f of o.door?[.3,.75]:[.3,.6])b(face,base+o.lo+(o.hi-o.lo)*f,o.v,.075,.036,o.w,palette.wood);
    b(face,base+o.lo-.10,o.v,.34,.12,o.w+.25,palette.wood);
    // Sliding shutter parked alongside the opening, board faces and guides.
    if(!o.door){const vv=o.v-o.w*.76;b(face-.035*outward,base+(o.lo+o.hi)/2,vv,.07,o.hi-o.lo,.46,palette.wood);for(let j=0;j<4;j++)b(face+.012*outward,base+(o.lo+o.hi)/2,vv-.18+j*.12,.035,o.hi-o.lo,.016,palette.dark);}
    else b(face+.055*outward,base+1.14,o.v+.20,.075,.13,.045,0x292c28);
   }
  }
  facade(3,openings,2.65,Y);facade(-3,[{v:0,w:1.5,lo:1.08,hi:2.14}],2.65,Y);
  if(tall){facade(3,[{v:-1.62,w:1.62,lo:.64,hi:1.92},{v:1.5,w:1.62,lo:.64,hi:1.92}],H-2.65,Y+2.65);facade(-3,[{v:0,w:1.8,lo:.65,hi:1.94}],H-2.65,Y+2.65);}
  else for(const u of [-3,3])b(u,Y+(2.65+H)/2,0,.16,H-2.65,D,palette.plaster);
  // Side walls with inset, separately framed windows on each storey.
  for(const v of [-3.2,3.2])for(let story=0;story<(tall?2:1);story++){
   const base=Y+story*2.65,h=story?H-2.65:(tall?2.65:H),lo=.95,hi=2.05;
   for(const u of [-1.85,1.85])b(u,base+h/2,v,2.3,h,.16,palette.plaster);
   b(0,base+lo/2,v,1.4,lo,.16,palette.board);b(0,base+(hi+h)/2,v,1.4,h-hi,.16,palette.plaster);
   b(0,base+1.5,v-Math.sign(v)*.06,1.4,1.1,.05,0xaaa98f);
   for(const u of [-.72,.72])b(u,base+1.5,v+Math.sign(v)*.13,.12,1.27,.23,palette.dark);
   for(const yy of [lo,hi])b(0,base+yy,v+Math.sign(v)*.13,1.6,.11,.24,palette.dark);
   for(let j=-3;j<=3;j++)b(j*.18,base+1.5,v+Math.sign(v)*.15,.035,1.1,.055,palette.wood);
   b(0,base+1.48,v+Math.sign(v)*.16,1.4,.035,.05,palette.wood);
   for(const u of [-2,-1,1,2])b(u,base+h/2,v,.09,h,.21,palette.wood);
  }
  // Lower weatherboards, nail heads and regular framing.
  for(const u of [-3,3])for(let j=0;j<23;j++){const vv=-3.05+j*.277;if(u===3&&Math.abs(vv+.9)<.7)continue;b(u+Math.sign(u)*.10,Y+.49,vv,.065,.65,.25,palette.board);for(const yy of [.23,.73])cy(u+Math.sign(u)*.145,Y+yy,vv,.017,.035,0x3c3931).rotation.z=Math.PI/2;}
  k.roof({x:p.x,y:Y+H,z:p.z,w:7.4,d:7.65,rise:tall?1.95:1.65,tileColor:tall?0x4b575b:0x536063,gableColor:palette.plaster});
  // Small kitchen flue: roof flashing, masonry shaft, four open vents and a stone rain cap.
  const flueY=Y+H;
  b(-1.65,flueY+1.04,1.05,.62,.10,.71,0x4b514d);
  b(-1.65,flueY+1.31,1.05,.37,1.01,.45,0x89867a);
  b(-1.65,flueY+1.85,1.05,.32,.12,.40,0x292f2c);
  for(const u of [-1.81,-1.49])for(const v of [.86,1.24])b(u,flueY+1.95,v,.065,.28,.065,0x86877c);
  b(-1.65,flueY+2.10,1.05,.58,.13,.66,0x686e66);
  // Framed shop porch / residential entry roof, with backed tile courses.
  const porchV=tall?.05:-.9,porchD=tall?5.1:2.55;
  footing(3.65,porchV,1.15,porchD,Y-.09);
  for(let j=0;j<Math.ceil(porchD/.18);j++)b(3.65,Y+.015,porchV-porchD/2+(j+.5)*porchD/Math.ceil(porchD/.18),1.15,.10,.165,palette.wood);
  for(const v of [porchV-porchD/2+.12,porchV+porchD/2-.12])b(4.13,Y+1.30,v,.13,2.6,.13,palette.dark);
  const awning=new THREE.Group();g.add(awning);
  for(let j=0;j<6;j++){
   const u=3.12+j*.20,yy=Y+2.83-(u-3)*.36;
   const slab=b(u,yy,porchV,.25,.09,porchD+.25,0x536064);slab.rotation.z=-s*.345;
   for(let l=0;l<Math.ceil(porchD/.28);l++){const vv=porchV-porchD/2+l*.28;bm([u-.12,yy+.055,vv],[u+.12,yy-.03,vv],.045,0x657174);}
  }
  for(const v of [porchV-porchD/2,porchV,porchV+porchD/2])bm([3,Y+2.76,v],[4.3,Y+2.28,v],.105,palette.dark);
  // Stair treads rise to the porch; the final stepping stone respects the root road clearance.
  for(let j=0;j<3;j++){const u=4.38+j*.38,top=Y-.06-j*.14,gr=ground(u,-.9)-.08;b(u,(top+gr)/2,-.9,.40,Math.max(.10,top-gr),1.32,palette.stone);}
  const lane=roadNetwork().find(r=>r.id==='central-lane'),edge=Math.abs(p.x-lane.points[1][0])-lane.width/2-.36;
  for(let u=5.18;u<edge-.11;u+=.32){const yy=ground(u,-.9);b(u,yy+.055,-.9,.28,.13,1.05,0x98958a);}
  // Four enclosing edges, with a working gate on the lane frontage.
  const F=(a,c,h=.88)=>k.fence([x(a[0]),z(a[1])],[x(c[0]),z(c[1])],h);
  F([-5.15,-5.6],[-5.15,5.6]);F([-5.15,-5.6],[5.12,-5.6]);F([-5.15,5.6],[5.12,5.6]);F([5.12,-5.6],[5.12,-1.7]);F([5.12,-.1],[5.12,5.6]);
  const gy=ground(5.12,-.9);for(const v of [-1.7,-.1])b(5.12,ground(5.12,v)+.68,v,.18,1.45,.18,palette.dark);
  // Gate leaf is swung inward, complete with rails and diagonal brace.
  const gateA=[5.1,gy+.17,-1.65],gateB=[4.45,gy+.17,-1.10];
  for(const dh of [0,.63])bm([gateA[0],gateA[1]+dh,gateA[2]],[gateB[0],gateB[1]+dh,gateB[2]],.075);
  for(let j=0;j<=5;j++){const t=j/5;bm([5.1-.65*t,gy+.17,-1.65+.55*t],[5.1-.65*t,gy+.8,-1.65+.55*t],.045);}
  bm(gateA,[gateB[0],gy+.8,gateB[2]],.055);
  // Tiny side storage: board back, three walls, shelves, braced posts and a real ceramic roof.
  const su=-3.7,sv=-4.67,sy=ground(su,sv)+.15;
  footing(su,sv,2.25,1.35,sy);b(su,sy+.75,sv-.6,2.2,1.5,.1,palette.board);
  for(const u of [su-1.06,su+1.06]){b(u,sy+.76,sv,.12,1.55,1.2,palette.board);for(const v of [sv-.60,sv+.60])b(u,sy+.85,v,.13,1.75,.13,palette.dark);}
  for(const yy of [.18,.78])b(su,sy+yy,sv,2.12,.10,1.1,palette.wood);
  k.roof({x:x(su),y:sy+1.7,z:z(sv),w:2.7,d:1.72,rise:.6,gableColor:palette.board,tileColor:0x525f61});
  function barrel(u,v){const yy=ground(u,v),rad=.31;cy(u,yy+.4,v,rad,.77,0x80664a);for(let i=0;i<14;i++){const a=i*Math.PI*2/14;b(u+Math.cos(a)*rad,yy+.4,v+Math.sin(a)*rad,.027,.74,.027,0x594938);}for(const h of [.13,.64]){const m=k.mesh(new THREE.TorusGeometry(rad+.015,.027,5,16),material(0x494e48),x(u),yy+h,z(v));m.rotation.x=Math.PI/2;}cy(u,yy+.79,v,.285,.045,palette.wood);b(u,yy+.821,v,.035,.02,.51,palette.dark);}
  function pot(u,v,r=.23){const yy=ground(u,v);const profile=[[0,0],[r*.65,0],[r,.13],[r*.9,.4],[r*.67,.48],[r*.66,.43],[r*.79,.38],[r*.87,.14],[r*.56,.055],[0,.055]].map(q=>new THREE.Vector2(...q));k.mesh(new THREE.LatheGeometry(profile,14),material(0x8e6850),x(u),yy,z(v));cy(u,yy+.10,v,r*.60,.01,0x33362b);}
  barrel(-4.1,-2.8);barrel(-4.8,-2.8);pot(4.45,3.0);pot(4.8,3.55,.19);pot(-4.35,1.9,.28);
  // Split logs show pale end grain, a raised rack and a little sloping shelter.
  for(let row=0;row<3;row++)for(let j=0;j<5-row;j++){
   const u=su-.73+j*.34+row*.16,yy=sy+.30+row*.27,v=sv+.10;
   const log=cy(u,yy,v,.145,.68,0x594833);log.rotation.x=Math.PI/2;
   const end=cy(u,yy,v+.35,.116,.013,0xb09972);end.rotation.x=Math.PI/2;
   bm([u-.055,yy-.05,v+.36],[u+.065,yy+.045,v+.36],.014,0x6b563d);
  }
  // Outdoor joiner's bench: tabletop planks, legs, braces, plane and hand saw.
  const bu=-1.40,bv=-4.70,by=ground(bu,bv);
  for(const u of [bu-.65,bu+.65])for(const v of [bv-.24,bv+.24])b(u,by+.4,v,.09,.8,.09);
  for(let j=0;j<4;j++)b(bu,by+.86,bv-.30+j*.20,1.60,.10,.18,palette.board);
  bm([bu-.65,by+.22,bv],[bu+.65,by+.22,bv],.08);b(bu+.22,by+.96,bv,.38,.12,.12,0x5b4936);b(bu+.20,by+1.04,bv,.10,.06,.055,0x383d3b);
  b(bu-.40,by+.93,bv-.12,.58,.025,.12,0x8c928a);b(bu-.72,by+.945,bv-.12,.18,.065,.15,palette.dark);
  bm([-2.3,ground(-2.3,-4.0),-4.0],[-2.05,ground(-2.3,-4.0)+1.38,-4.23],.045,0x8a7551);b(-2.3,ground(-2.3,-4.0)+.12,-4.0,.20,.23,.055,0x626963);
  // Kitchen beds occupy the sunny north side. Timber edges retain worked earth and staggered leaves.
  for(let row=0;row<3;row++){
   const v=4.1+row*.55,u=.65,yy=ground(u,v);
   b(u,yy+.075,v,3.8,.15,.43,palette.soil);
   for(const vv of [v-.24,v+.24])b(u,yy+.13,vv,3.93,.12,.05,palette.board);
   for(const uu of [u-1.94,u+1.94])b(uu,yy+.13,v,.05,.12,.52,palette.board);
   for(let j=0;j<9;j++){
    const uu=u-1.63+j*.40;cy(uu,yy+.20,v,.03,.22,0x647a46);
    for(let l=0;l<5;l++){const a=l*2.399,leaf=k.mesh(new THREE.SphereGeometry(1,5,4),material([0x637c48,0x798853,0x526d3e][row]),x(uu+Math.cos(a)*.105),yy+.25+Math.sin(l)*.035,z(v+Math.sin(a)*.095));leaf.scale.set(.14,.035,.085);leaf.rotation.z=s*Math.cos(a)*.5;}
   }
  }
  // Drying poles and individually clipped cloth or framed sheets in the rear working strip.
  const ru=-4.2,ry=ground(ru,0),v1=-1.8,v2=1.25;
  for(const v of [v1,v2]){b(ru,ground(ru,v)+1.1,v,.095,2.2,.095);bm([ru-.36,ground(ru,v),v+.15],[ru,ground(ru,v)+1.2,v],.055);}
  bm([ru,ry+2.05,v1],[ru,ry+2.05,v2],.025,0xaca184);
  for(let j=0;j<4;j++){
   const vv=-1.45+j*.66,yy=ry+1.49;
   b(ru,yy,vv,.035,.97,.49,tall?0xc9bfa5:[0xa8ad9c,0x738585,0xafa08a,0x8a9297][j]);
   if(tall){for(const h of [-.48,.48])b(ru+.02,yy+h,vv,.06,.035,.54);for(const v of [vv-.25,vv+.25])b(ru+.02,yy,v,.06,.99,.035);for(let l=0;l<4;l++)b(ru+.024,yy-.35+l*.21,vv,.012,.014,.40,0xb1a68f);}
   else for(let l=0;l<5;l++)b(ru+.024,yy,vv-.20+l*.10,.018,.9,.012,0x939988);
   for(const v of [vv-.16,vv+.16])b(ru,ry+2.02,v,.07,.13,.035,palette.wood);
  }
  if(tall){
   // Sheltered, dimensional book cabinets facing the lane.
   const v=1.56,u=3.35;
   b(u,Y+1.09,v,.36,1.86,1.86,palette.dark);
   for(const vv of [v-.91,v+.91])b(u+.25,Y+1.08,vv,.53,1.93,.07,palette.wood);
   for(let row=0;row<4;row++){
    const yy=Y+.24+row*.43;b(u+.22,yy,v,.54,.065,1.88,palette.board);
    for(let j=0;j<5;j++){
     const vv=v-.71+j*.34,h=.08+(j%2)*.03;
     for(let pile=0;pile<2+(j%2);pile++){
      const by=yy+.09+pile*.105,col=[0x6c786c,0x6d6660,0x9a8460,0x73606b,0x535f67][j];
      b(u+.28,by,vv,.36,h,.28,0xd0c3a3);for(const dy of [-h/2,h/2])b(u+.28,by+dy,vv,.39,.018,.31,col);
      for(const vv2 of [vv-.09,vv+.09])b(u+.475,by,vv2,.022,h+.025,.018,0x393d35);
     }
    }
   }
   // Hanging sign: book emblem, ruled page and Japanese shop mark constructed from strokes.
   bm([3,Y+2.52,2.78],[4.15,Y+2.52,2.78],.075);for(const u of [3.8,4.08])bm([u,Y+2.50,2.78],[u,Y+2.2,2.78],.022,0x44483d);
   b(3.96,Y+1.98,2.78,.52,.48,.08,0xb39b70);
   b(3.96,Y+1.98,2.83,.025,.34,.02,palette.dark);for(const u of [3.8,4.10])for(const dy of [-.11,0,.11])b(u,Y+1.98+dy,2.83,.17,.018,.023,palette.dark);
   // Low writing stool and ink tray on the shop's porch.
   b(3.58,Y+.53,-2.05,.44,.09,.52);for(const u of [3.43,3.74])for(const v of [-2.23,-1.87])b(u,Y+.28,v,.055,.5,.055);
   b(3.58,Y+.605,-2.05,.24,.03,.31,0xc7bda3);b(3.59,Y+.64,-2.1,.055,.05,.08,0x252a28);
  }
  // Grounded yard stones, moss around retaining walls and maintained stepping route to the rear.
  for(let j=0;j<9;j++){const u=-2.7+j*.65,v=-3.8,yy=ground(u,v);const stone=b(u,yy+.06,v,.45,.12,.42,j%2?0x959385:0x888d7e);stone.rotation.y=Math.sin(j)*.16;}
  for(let j=0;j<21;j++){const u=-4.8+(j%7)*.53,v=3.5+Math.floor(j/7)*.51,yy=ground(u,v);if(u>-2.9)continue;const m=k.mesh(new THREE.IcosahedronGeometry(1,0),material(j%2?0x727b55:0x8c8c73),x(u),yy+.03,z(v));m.scale.set(.13,.035,.10);}
 }
 // One compact branching cherry and one pruned pine, each in its own rear-yard pocket.
 function tree(n,pine){
  const p=layout().lots.find(p=>p.id===`central-village-lot-${n}`),xx=p.x+(pine?4.05:-4.05),zz=p.z+4.55,yy=heightAt(xx,zz),g=part(pine?'rear_pine':'rear_cherry'),k=createVillageKit(THREE,g);
  const wood=k.material(0x594c3d),trunk=[[xx,yy-.09,zz],[xx-.13,yy+1.1,zz+.07],[xx+.10,yy+2.2,zz],[xx+.04,yy+3.05,zz+.06]];
  for(let j=1;j<trunk.length;j++)k.beam(trunk[j-1],trunk[j],.17-j*.032,wood);
  for(let i=0;i<7;i++){
   const a=i*2.399,base=[xx+.02,yy+1.05+i*.21,zz],tip=[xx+Math.cos(a)*(.65+(i%2)*.15),yy+2.00+i*.13,zz+Math.sin(a)*.62];
   k.beam(base,tip,.052,wood);
   for(let j=0;j<3;j++){
    const ang=a+j*1.1,end=[tip[0]+Math.cos(ang)*.26,tip[1]+.25,tip[2]+Math.sin(ang)*.24];k.beam(tip,end,.027,wood);
    const m=k.mesh(new THREE.IcosahedronGeometry(1,1),k.material(pine?[0x344f40,0x465e47,0x526c4d][j]:[0xb98e90,0xd1a5a5,0xc79c9c][j]),...end);m.scale.set(pine?.46:.34,pine?.17:.29,pine?.38:.33);
    if(!pine)for(let f=0;f<5;f++){const a2=f*2.399;k.mesh(new THREE.IcosahedronGeometry(.065,0),k.material(0xd8b6b0),end[0]+Math.cos(a2)*.28,end[1]+.18,end[2]+Math.sin(a2)*.26);}
   }
  }
  for(let i=0;i<8;i++){const a=i*Math.PI/4;k.box(xx+Math.cos(a)*.45,yy+.06,zz+Math.sin(a)*.45,.19,.17,.19,0x88897c);}
 }
 tree(9,false);tree(10,true);
 return all;
}
