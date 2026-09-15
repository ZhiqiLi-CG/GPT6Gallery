import {heightAt,roadNetwork,layout} from './root.js';
import {createVillageKit} from './central-village.js';

// Two complete house-and-yard assemblies; coordinates remain in the root world.
export function build(THREE,ctx){
 const root=new THREE.Group();root.name='central-village-south_arrival-pair';
 const lots=layout().lots.filter(p=>['central-village-lot-1','central-village-lot-2'].includes(p.id));
 const roads=roadNetwork();
 for(let index=0;index<lots.length;index++){
  const p=lots[index],shop=index===0,sign=p.front==='east'?1:-1;
  const g=new THREE.Group();g.name='central-village-south_'+(shop?'provisions-house-yard':'potter-house-yard');root.add(g);
  const k=createVillageKit(THREE,g),{material,mesh}=k;
  const wood=0x65503a,dark=0x3f362c,plaster=shop?0x987e58:0xc4b28b,stone=0x85877c;
  const X=u=>p.x+sign*u,Z=v=>p.z+v,H=(u,v)=>heightAt(X(u),Z(v));
  const B=(u,y,v,w,h,d,m=wood)=>k.box(X(u),y,Z(v),w,h,d,m);
  const C=(u,y,v,rt,rb,h,m=wood,n=12)=>k.cylinder(X(u),y,Z(v),rt,rb,h,m,n);
  const P=(u,y,v)=>[X(u),y,Z(v)];
  const beam=(a,b,w=.10,m=wood)=>k.beam(P(...a),P(...b),w,m);
  const ring=(u,y,v,r,t,m)=>{const a=mesh(new THREE.TorusGeometry(r,t,6,20),material(m),X(u),y,Z(v));a.rotation.x=Math.PI/2;return a};
  const ellipsoid=(u,y,v,rx,ry,rz,m)=>{const a=mesh(new THREE.IcosahedronGeometry(1,1),material(m),X(u),y,Z(v));a.scale.set(rx,ry,rz);return a};
  const base=p.y+.38,hw=2.85,hd=3.25,height=shop?5.15:3.0;
  k.foundation(p.x,p.z,hw*2,hd*2,base);
  B(0,base+.035,0,hw*2-.12,.12,hd*2-.12,wood);
  // All walls are built around real openings, with jamb depth, inset panels and separate shutters.
  function wall(axis,side,story,openings){
   const length=axis==='u'?hd*2:hw*2,normal=side*(axis==='u'?hw:hd),floor=base+story*2.65,wh=shop?(story===0?2.65:2.5):3;
   const wb=(s,y,w,h,depth,m,offset=0)=>axis==='u'?B(normal+side*offset,y,s,depth,h,w,m):B(s,y,normal+side*offset,w,h,depth,m);
   const wallMat=shop&&story===0?0x7b6448:plaster;
   const cuts=[-length/2,length/2,...openings.flatMap(o=>[o.s-o.w/2,o.s+o.w/2])].sort((a,b)=>a-b);
   for(let j=1;j<cuts.length;j++){
    const s=(cuts[j]+cuts[j-1])/2,w=cuts[j]-cuts[j-1],o=openings.find(o=>s>o.s-o.w/2&&s<o.s+o.w/2);
    if(!o)wb(s,floor+wh/2,w,wh,.18,wallMat);
    else{if(o.b>0)wb(s,floor+o.b/2,w,o.b,.18,wallMat);const top=wh-o.b-o.h;if(top>0)wb(s,floor+o.b+o.h+top/2,w,top,.18,wallMat)}
   }
   for(const y of [floor+.09,floor+wh-.08])wb(0,y,length+.12,.16,.24,dark,.02);
   for(let j=0;j<=4;j++){
    const s=-length/2+j*length/4;
    if(!openings.some(o=>s>o.s-o.w/2-.05&&s<o.s+o.w/2+.05))wb(s,floor+wh/2,.16,wh,.26,dark,.03);
   }
   // Weatherboard lower panels and nail heads, kept outside every aperture.
   for(let s=-length/2+.15;s<length/2;s+=.24){
    const o=openings.find(o=>s>o.s-o.w/2-.06&&s<o.s+o.w/2+.06),h=o?Math.min(.74,o.b):.74;
    if(h>.03){wb(s,floor+h/2,.21,h,.045,shop?0x584633:0x74624a,.125);wb(s,floor+.15,.035,.035,.013,0x34332c,.155)}
   }
   if(shop&&story===0)for(let s=-length/2+.12;s<length/2;s+=.22){
    const o=openings.find(o=>s>o.s-o.w/2-.02&&s<o.s+o.w/2+.02);
    if(!o)wb(s,floor+wh/2,.022,wh-.15,.027,0x5c4934,.108);
    else{
     if(o.b>.1)wb(s,floor+o.b/2,.022,o.b-.07,.027,0x5c4934,.108);
     const h=wh-o.b-o.h;if(h>.1)wb(s,floor+o.b+o.h+h/2,.022,h-.08,.027,0x5c4934,.108);
    }
   }
   for(const o of openings){
    const cy=floor+o.b+o.h/2;
    for(const s of [o.s-o.w/2,o.s+o.w/2])wb(s,cy,.115,o.h+.15,.34,dark,.045);
    for(const y of [floor+o.b,floor+o.b+o.h])wb(o.s,y,o.w+.2,.12,.36,dark,.06);
    wb(o.s,floor+o.b-.04,o.w+.3,.085,.47,wood,.12);
    if(o.type==='counter'){
     wb(o.s,cy,o.w-.13,o.h-.1,.025,0x29271e,-.21);
     for(const y of [floor+o.b+.16,floor+o.b+.69]){wb(o.s,y,o.w-.14,.065,.37,wood,-.08);for(let t=-.65;t<.8;t+=.36)wb(o.s+t,y+.18,.24,.27,.20,0x9c895e,-.07)}
    }else if(o.type==='door'){
     wb(o.s,cy,o.w-.13,o.h-.08,.05,0x2a2922,-.23);
     for(let t=-o.w/2+.12;t<o.w/2;t+=.16)wb(o.s+t,cy,.12,o.h-.12,.065,0x716049,-.20);
     if(shop&&axis==='u'&&side===1&&story===0){
      for(const ds of [-.31,.31]){wb(o.s+ds,floor+o.h-.52,.56,1.00,.04,0x344957,.20);for(let t=-.23;t<=.23;t+=.115)wb(o.s+ds+t,floor+o.h-.52,.024,.96,.017,0x415866,.227)}
      wb(o.s,floor+o.h+.10,o.w+.45,.055,.07,wood,.22);
     }else wb(o.s+o.w*.28,floor+.95,.06,.19,.06,0x282921,-.145);
    }else{
     wb(o.s,cy,o.w-.12,o.h-.12,.045,0x38382d,-.17);
     wb(o.s,cy,o.w-.17,o.h-.16,.025,0xbeb291,-.12);
     for(let t=-o.w/2+.16;t<o.w/2;t+=.18)wb(o.s+t,cy,.045,o.h-.09,.055,wood,-.07);
     for(const y of [-.23,.23])wb(o.s,cy+y,o.w-.1,.04,.055,wood,-.035);
     const sh=o.s+o.w*.33;
     wb(sh,cy,o.w*.38,o.h-.02,.065,dark,.16);
     for(let t=-o.w*.17;t<o.w*.18;t+=.10)wb(sh+t,cy,.065,o.h-.08,.035,wood,.21);
     for(const y of [cy-o.h/2-.08,cy+o.h/2+.08])wb(o.s,y,o.w+.38,.065,.12,wood,.20);
    }
   }
  }
  for(let story=0;story<(shop?2:1);story++){
   wall('u',1,story,story===0?[{s:-1.55,w:1.4,b:0,h:2.15,type:'door'},{s:1.10,w:2.0,b:1.05,h:1.12,type:shop?'counter':'window'}]:[{s:-1.35,w:1.6,b:.75,h:1.15},{s:1.3,w:1.6,b:.75,h:1.15}]);
   wall('u',-1,story,[{s:-1.45,w:1.25,b:story===0?.85:.75,h:1.05},{s:1.35,w:1.35,b:.8,h:1.08}]);
   for(const side of [-1,1])wall('v',side,story,[{s:-1.35,w:1.2,b:.85,h:1.0},{s:1.3,w:1.1,b:.85,h:1.0}]);
   if(story>0)B(0,base+2.65,0,hw*2,.15,hd*2,dark);
  }
  for(const u of [-hw,hw])for(const v of [-hd,hd])B(u,base+height/2,v,.22,height+.16,.22,dark);
  k.roof({x:p.x,y:base+height,z:p.z,w:shop?hw*2+1.24:hd*2+1.24,d:shop?hd*2+1.04:hw*2+1.04,rise:shop?1.85:1.6,axis:shop?'z':'x',tileColor:shop?0x475356:0x525b5d,gableColor:plaster});
  // Grounded front step sequence ends clear of the root road reserve.
  for(let j=0;j<4;j++){
   const u=3.15+j*.58,ground=H(u,-1.55)-.06,top=base-.06-j*.075;
   B(u,(ground+top)/2,-1.55,.55,Math.max(.08,top-ground),1.13,stone);
  }
  const frontEdge=Math.min(5.30,Math.abs(roads.find(r=>r.id==='central-lane').points[0][0]-p.x)-1.5-.35-.10);
  const fence=(a,b,h=.95)=>k.fence([X(a[0]),Z(a[1])],[X(b[0]),Z(b[1])],h);
  fence([-5.22,-5.65],[-5.22,5.65]);fence([-5.22,-5.65],[frontEdge,-5.65]);fence([-5.22,5.65],[frontEdge,5.65]);
  fence([frontEdge,-5.65],[frontEdge,-2.3],.82);fence([frontEdge,-.78],[frontEdge,5.65],.82);
  // Gate leaves fold inward along the entrance; braced and joined, with strap hinges.
  for(const v of [-2.3,-.78]){
   const y=H(frontEdge,v);B(frontEdge,y+.55,v,.17,1.2,.17,dark);
   const end=frontEdge-.72;
   for(const yy of [.25,.72])beam([frontEdge,y+yy,v],[end,y+yy,v],.065);
   for(let u=end;u<=frontEdge;u+=.18)B(u,y+.48,v,.045,.61,.075,wood);
   beam([end,y+.22,v],[frontEdge,y+.75,v],.05,dark);
   for(const yy of [.23,.74])B(frontEdge,y+yy,v,.20,.045,.05,0x3e4037);
  }
  // Hollow lathed clay vessels have an actual inner wall and floor, not painted lids.
  function pot(u,y,v,r=.22,h=.45,color=0xa17351){
   const points=[[0,0],[r*.56,0],[r*.81,h*.08],[r,h*.45],[r*.87,h*.73],[r*.65,h*.91],[r*.66,h],[r*.51,h],[r*.50,h*.90],[r*.69,h*.72],[r*.82,h*.44],[r*.64,h*.13],[0,h*.13]].map(a=>new THREE.Vector2(...a));
   mesh(new THREE.LatheGeometry(points,18),material(color),X(u),y,Z(v));ring(u,y+h,v,r*.585,r*.075,color);
   for(let j=1;j<4;j++)ring(u,y+h*(.2+j*.15),v,r*(.83+.15*Math.sin(j)),.008,color===0xa17351?0x936347:color);
  }
  function barrel(u,v,r=.32,h=.83){
   const y=H(u,v);
   for(let j=0;j<16;j++){const a=j*Math.PI/8,m=B(u+Math.cos(a)*r*.91,y+h/2,v+Math.sin(a)*r*.91,r*.35,h,.058,j%3?wood:0x7b6549);m.rotation.y=-a*sign+Math.PI/2}
   C(u,y+.06,v,r*.83,r*.83,.09,wood);
   for(const yy of [.12,h*.48,h-.11])ring(u,y+yy,v,r,.026,0x44483c);
   for(let i=-2;i<=2;i++)B(u+i*r*.33,y+h,v,.10,.055,Math.sqrt(Math.max(0,r*r-(i*r*.33)**2))*1.85,0x7b694e);
  }
  function table(u,v,w=1.3,d=.7,level){
   const y=level??H(u,v);
   for(const du of [-w*.4,w*.4])for(const dv of [-d*.37,d*.37])B(u+du,y+.42,v+dv,.085,.84,.085,dark);
   for(let i=0;i<4;i++)B(u,y+.84,v-d/2+(i+.5)*d/4,w+.1,.095,d/4-.012,wood);
   for(const dv of [-d*.37,d*.37])B(u,y+.27,v+dv,w*.86,.08,.085,dark);
   beam([u-w*.4,y+.22,v-d*.37],[u+w*.4,y+.73,v-d*.37],.06);
   return y+.90;
  }
  function crate(u,y,v,w=.65,d=.55,h=.50){
   B(u,y+.045,v,w,.09,d,wood);
   for(const du of [-w/2,w/2])for(const dv of [-d/2,d/2])B(u+du,y+h/2,v+dv,.055,h,.055,dark);
   for(let j=0;j<3;j++){
    for(const dv of [-d/2,d/2])B(u,y+.12+j*.14,v+dv,w,.09,.05,0x8b704c);
    for(const du of [-w/2,w/2])B(u+du,y+.12+j*.14,v,.05,.09,d,0x8b704c);
   }
  }
  function basket(u,y,v,r=.28){
   const points=[[0,0],[r*.8,0],[r,.24],[r-.025,.24],[r*.72,.04],[0,.04]].map(a=>new THREE.Vector2(...a));
   mesh(new THREE.LatheGeometry(points,20),material(0x9b8155),X(u),y,Z(v));
   for(let j=0;j<6;j++)ring(u,y+.035+j*.04,v,r*(.80+j*.04),.014,0x776343);
   for(let j=0;j<18;j++){const a=j*Math.PI/9;beam([u+Math.cos(a)*r*.8,y+.025,v+Math.sin(a)*r*.8],[u+Math.cos(a)*r,y+.25,v+Math.sin(a)*r],.016,0xb39a68)}
   for(let j=0;j<8;j++){const a=j*2.4;ellipsoid(u+Math.cos(a)*r*.6,y+.25+(j%2)*.065,v+Math.sin(a)*r*.6,.082,.074,.079,j%3===0?0x92703c:j%3===1?0x687b3f:0xa66d43)}
  }
  // Rear-corner storage structure: founded posts, board back and sides, complete tiled roof.
  const su=-4.18,sv=2.5,sy=H(su,sv)+.1;
  k.foundation(X(su),Z(sv),1.38,2.10,sy+.13);
  for(const du of [-.64,.64])for(const dv of [-.99,.99])B(su+du,sy+.93,sv+dv,.12,1.86,.12,dark);
  for(let j=0;j<10;j++)B(su-.68,sy+.9,sv-.96+j*.21,.07,1.70,.19,wood);
  for(const dv of [-1,1])for(let j=0;j<7;j++)B(su-.6+j*.2,sy+.9,sv+dv,.18,1.70,.065,0x766046);
  k.roof({x:X(su),y:sy+1.84,z:Z(sv),w:1.75,d:2.5,rise:.46,tileColor:0x58615e,gableColor:0x806d4f});
  for(const yy of [.35,.93,1.44])B(su,sy+yy,sv,1.25,.08,1.88,wood);
  for(let j=0;j<7;j++)pot(su+.22,sy+.98,sv-.78+j*.25,.095,.26,shop?0x7d7350:0x9f7055);
  for(let j=0;j<9;j++){
   const u=su-.30+(j%3)*.27,v=sv-.65+Math.floor(j/3)*.48,y=sy+.25+(j%2)*.1;
   const m=C(u,y,v,.10,.12,.44,0x806243);m.rotation.x=Math.PI/2;
  }
  // Covered split firewood along rear wall, open to the working aisle.
  const fu=-4.20,fv=-2.05,fy=H(fu,fv);
  for(const du of [-.62,.62])for(const dv of [-.72,.72])B(fu+du,fy+.67,fv+dv,.09,1.35,.09,dark);
  const cover=B(fu,fy+1.40,fv,1.55,.12,1.75,0x6c6250);cover.rotation.z=sign*.11;
  for(let j=0;j<4;j++)B(fu-.6+j*.4,fy+1.46+(j-1.5)*.044,fv,.025,.055,1.75,dark);
  for(let row=0;row<4;row++)for(let col=0;col<5-row%2;col++){
   const u=fu-.48+col*.24+(row%2)*.12,v=fv,y=fy+.17+row*.22;
   const log=C(u,y,v,.115,.12,1.18,0x58432f,8);log.rotation.x=Math.PI/2;
   const cut=C(u,y,v-.596,.088,.088,.017,0xae8a58,8);cut.rotation.x=Math.PI/2;
  }
  barrel(-4.32,-.50);barrel(3.95,4.85,.27,.69);
  // Side garden: hand-built beds, individual cabbage/bean plants, stakes and twine.
  for(let row=0;row<3;row++){
   const v=-5.12+row*.46,u=-.4,y=H(u,v);
   B(u,y+.055,v,3.25,.12,.35,0x66553b);
   for(const vv of [v-.20,v+.20])B(u,y+.10,vv,3.45,.13,.055,0x827153);
   for(let col=0;col<9;col++){
    const uu=u-1.42+col*.35;
    for(let leaf=0;leaf<5;leaf++){const a=leaf*1.256,m=ellipsoid(uu+Math.cos(a)*.075,y+.15,v+Math.sin(a)*.08,.11,.035,.065,[0x637948,0x748553,0x4f693e][row]);m.rotation.z=Math.cos(a)*.4;m.rotation.x=Math.sin(a)*.4}
    ellipsoid(uu,y+.2,v,.066,.07,.064,0x849566);
   }
  }
  // Side-yard workbench and hand tools, detailed independently of the shop counter.
  const wy=table(.1,4.6,1.6,.68);
  B(-.35,wy+.025,4.6,.32,.045,.18,0x6b6c5c);
  beam([.22,wy+.04,4.43],[.61,wy+.04,4.67],.045,0x9b7950);
  B(.65,wy+.04,4.70,.19,.06,.12,0x51574e);
  beam([-2.3,H(-2.3,4.45)+.1,4.45],[-2.07,H(-2.3,4.45)+1.25,4.40],.05,0x8c734e);
  B(-2.30,H(-2.3,4.45)+.14,4.45,.27,.28,.055,0x51584c);
  // Drying pole, taut cord and individually folded cloth panels, behind the roof line.
  for(const u of [-1.8,1.7])B(u,H(u,5.25)+.88,5.25,.075,1.83,.075,wood);
  const ly=H(0,5.25)+1.70;beam([-1.8,ly,5.25],[1.7,ly,5.25],.025,0x9e9376);
  for(let j=0;j<4;j++){
   const u=-1.32+j*.74,col=j%2?0xaaa58a:0x596b71;
   B(u,ly-.4,5.25,.51,.79,.025,col);B(u,ly-.09,5.21,.51,.18,.03,col);
   for(const du of [-.18,.18])B(u+du,ly+.02,5.25,.024,.075,.06,0x806849);
  }
  // Small stepping stones link side work areas and the storage aisle.
  for(const v of [-3.9,-2.95,-1.0,.1,.95,3.8,4.8])B(-3.6,H(-3.6,v)+.045,v,.46,.12,.48,stone);
  for(const u of [-2.4,-1.5,-.6,.3,1.2,2.1,3.0,3.9])B(u,H(u,3.85)+.045,3.85,.5,.12,.40,stone);
  if(shop){
   // Street counter: planks, supports, lower stock shelf and baskets in the serving opening.
   const cy=table(3.65,1.1,.76,2.3);
   B(3.65,cy-.62,1.1,.65,.07,2.1,wood);
   for(const v of [.37,1.1,1.85])basket(3.65,cy,v,.28);
   crate(4.15,H(4.15,3.03),3.03,.66,.61);basket(4.15,H(4.15,3.03)+.51,3.03,.26);
   crate(3.65,H(3.65,.05),.05,.58,.50,.45);
   // A small hanging timber sign, metal eyes and abstract painted rice-shop emblem.
   beam([2.92,base+2.43,-2.60],[4.08,base+2.43,-2.60],.085,dark);
   for(const u of [3.48,3.94])beam([u,base+2.43,-2.6],[u,base+2.20,-2.6],.023,0x45483d);
   B(3.72,base+1.94,-2.60,.75,.48,.075,0x98794d);
   for(const du of [-.25,.25])B(3.72+du,base+1.94,-2.645,.035,.39,.025,dark);
   for(let j=-1;j<=1;j++)beam([3.72+j*.11,base+1.80,-2.65],[3.72,base+2.07,-2.65],.028,0xd0be8b);
   for(const v of [-4.0,4.4])pot(3.8,H(3.8,v),v,.26,.55,0x85784e);
   crate(-3.95,H(-3.95,-4.65),-4.65,.65,.65);basket(-3.95,H(-3.95,-4.65)+.50,-4.65,.27);
  }else{
   const ty=table(3.98,1.00,.83,2.05);
   for(let j=0;j<5;j++)pot(3.93+(j%2)*.12,ty, .20+j*.38,.13+(j%3)*.025,.26+(j%3)*.10,[0xb1825d,0x8b624b,0x7e8a78][j%3]);
   C(3.88,ty+.035,1.68,.23,.23,.055,0x9b896b,20);pot(3.88,ty+.065,1.68,.14,.21,0xaf805d);
   beam([3.65,ty+.08,.95],[4.03,ty+.08,1.05],.023,0xb99d73);
   pot(4.28,H(4.28,2.76),2.76,.34,.72);pot(3.54,H(3.54,2.68),2.68,.26,.53,0x8d694b);
   pot(4.1,H(4.1,-3.3),-3.3,.33,.62,0x8d7659);
   for(let j=0;j<4;j++)pot(-.48+j*.36,wy,4.63,.13,.23+j*.045,0xa17351);
   // Roofed exterior shelving for drying glazed vessels, attached at south wall.
   for(const u of [2.6,4.9])B(u,H(u,-4.6)+1.0,-4.55,.09,2.05,.09,dark);
   const sy2=H(3.6,-4.6);
   for(const yy of [.3,.83,1.36]){
    B(3.75,sy2+yy,-4.58,2.35,.07,.62,wood);
    for(let j=0;j<6;j++)pot(2.82+j*.36,sy2+yy+.045,-4.58,.11,.25+(j%2)*.1,j%3===0?0x788677:0xa17351);
   }
   const aw=B(3.75,sy2+2.05,-4.55,2.65,.13,.97,0x606454);aw.rotation.x=.13;
   for(let j=0;j<8;j++)B(2.53+j*.35,sy2+2.13,-4.55,.07,.045,.97,dark);
   // One modest cherry, branching above the rear garden corner, clear of both facades.
   const tu=-4.15,tv=4.50,gy=H(tu,tv);
   beam([tu,gy,tv],[tu+.12,gy+1.6,tv-.06],.17,0x66503f);
   const flowers=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),material(0xffffff),6*5*22*5);
   flowers.castShadow=true;flowers.receiveShadow=true;g.add(flowers);
   const blossomDummy=new THREE.Object3D(),blossomColor=new THREE.Color();let blossomIndex=0;
   for(let j=0;j<6;j++){
    const a=j*2.399,du=Math.cos(a)*.72,dv=Math.sin(a)*.66,yy=gy+2.0+(j%3)*.29;
    beam([tu+.07,gy+1.05,tv],[tu+du,yy,tv+dv],.07,0x715440);
    for(let q=0;q<5;q++){
     const aa=q*2.4+j,rr=.23+(q%2)*.15;
     const bu=tu+du+Math.cos(aa)*rr,bv=tv+dv+Math.sin(aa)*rr,by=yy+.16+(q%2)*.16;
     beam([tu+du,yy-.16,tv+dv],[bu,by,bv],.025,0x785645);
     for(let f=0;f<22;f++){
      const phi=f*2.39996+j,zz=1-2*(f+.5)/22,rad=Math.sqrt(1-zz*zz),fr=.20+.065*Math.sin(f*1.7+q);
      const uu=bu+Math.cos(phi)*rad*fr,vv=bv+Math.sin(phi)*rad*fr,fy=by+zz*fr*.85;
      for(let petal=0;petal<5;petal++){
       const pa=petal*Math.PI*2/5;
       blossomDummy.position.set(X(uu+Math.cos(pa)*.027),fy+.005*Math.sin(pa),Z(vv+Math.sin(pa)*.027));
       blossomDummy.rotation.set(.3*Math.sin(f),pa,.2*Math.cos(q+f));blossomDummy.scale.set(.033,.016,.022);blossomDummy.updateMatrix();
       flowers.setMatrixAt(blossomIndex,blossomDummy.matrix);flowers.setColorAt(blossomIndex++,blossomColor.setHex([0xd4a6a2,0xe7c3b7,0xc39495][(f+j+q)%3]));
      }
     }
    }
   }
   flowers.instanceMatrix.needsUpdate=true;flowers.instanceColor.needsUpdate=true;
   for(let j=0;j<16;j++){const a=j*2.4;ellipsoid(tu+Math.cos(a)*.83,gy+.025,tv+Math.sin(a)*.73,.055,.012,.035,0xc7a096)}
  }
  // Discreet hearth flue with a rain hood and an open four-sided smoke outlet.
  const flueU=-1.6,flueV=.6,roofY=base+height+(shop?.95:1.25);
  B(flueU,roofY+.15,flueV,.38,.95,.38,0x727065);
  for(const du of [-.15,.15])for(const dv of [-.15,.15])B(flueU+du,roofY+.76,flueV+dv,.055,.32,.055,0x52574e);
  B(flueU,roofY+.96,flueV,.59,.10,.56,0x535b57);
  let serial=0;g.traverse(o=>{if(o!==g)o.name=g.name+'_'+String(serial++).padStart(4,'0')});
 }
 return root;
}
