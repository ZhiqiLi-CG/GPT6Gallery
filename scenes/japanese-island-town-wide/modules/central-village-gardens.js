import {heightAt,roadNetwork,layout} from './root.js';
import {createVillageKit} from './central-village.js';

export function build(THREE,ctx){
 const world=new THREE.Group();world.name='central-village-gardens_households';
 const lots=layout().lots.filter(l=>['central-village-lot-7','central-village-lot-8'].includes(l.id));
 const roads=roadNetwork();
 for(const lot of lots){
 const dyer=lot.id.endsWith('-7'),g=new THREE.Group();g.name='central-village-gardens_'+(dyer?'dyer_house_yard':'gardener_house_yard');world.add(g);
 const k=createVillageKit(THREE,g),{box:B,cylinder:C,beam:E,mesh:M,material:mat}=k;
 const wood=0x69513a,dark=0x42382c,pale=dyer?0xbaac8b:0xb6a48a,iron=0x474b47,earth=0x62543a,green=0x52673c;
 const x=lot.x,z=lot.z,s=lot.front==='east'?1:-1,w=5.6,d=5.6,H=dyer?5.55:3.05;
 const base=Math.max(lot.y+0.32,...[-w/2,w/2].flatMap(dx=>[-d/2,d/2].map(dz=>heightAt(x+dx,z+dz)+0.17)));
 const ground=(xx,zz)=>heightAt(xx,zz);
 function ball(xx,yy,zz,sx,sy,sz,color){const m=M(new THREE.IcosahedronGeometry(1,1),mat(color),xx,yy,zz);m.scale.set(sx,sy,sz);return m}
 function ring(xx,yy,zz,r,t,color){const m=M(new THREE.TorusGeometry(r,t,6,20),mat(color),xx,yy,zz);m.rotation.x=Math.PI/2;return m}
 function pot(xx,zz,r=.24,h=.43,color=0x8a6548,yy=ground(xx,zz)){
  const p=[new THREE.Vector2(r*.52,0),new THREE.Vector2(r*.93,h*.22),new THREE.Vector2(r,h*.62),new THREE.Vector2(r*.73,h*.9),new THREE.Vector2(r*.76,h),new THREE.Vector2(r*.61,h),new THREE.Vector2(r*.6,h*.87),new THREE.Vector2(r*.83,h*.60),new THREE.Vector2(r*.76,h*.21),new THREE.Vector2(r*.42,.055)];
  M(new THREE.LatheGeometry(p,16),mat(color),xx,yy,zz);ring(xx,yy+h,zz,r*.69,.025,color);C(xx,yy+.06,zz,r*.5,r*.5,.05,dark,16);
 }
 function barrel(xx,zz,r=.36,h=.75,open=false){const yy=ground(xx,zz);
  for(let i=0;i<18;i++){let a=i*Math.PI*2/18;const b=B(xx+Math.cos(a)*r,yy+h/2,zz+Math.sin(a)*r,.10,h,.075,i%3?wood:0x7b6145);b.rotation.y=-a+Math.PI/2;}
  for(const lev of [.12,.68,.94])ring(xx,yy+h*lev,zz,r+.024,.025,iron);
  C(xx,yy+.045,zz,r,r,.08,dark,20);
  if(open)C(xx,yy+h*.70,zz,r-.038,r-.038,.018,0x253b53,24);
  else for(let i=-2;i<=2;i++)B(xx+i*r*.32,yy+h+.015,zz,r*.30,.055,2*Math.sqrt(r*r-(i*r*.32)**2),wood);
  return yy+h;
 }
 function basket(xx,zz){const yy=ground(xx,zz),r=.27;
  for(let j=0;j<8;j++)ring(xx,yy+.06+j*.044,zz,r*(.7+j*.037),.016,0x9a8153);
  for(let j=0;j<16;j++){let a=j*Math.PI/8;E([xx+Math.cos(a)*r*.7,yy,zz+Math.sin(a)*r*.7],[xx+Math.cos(a)*r,yy+.39,zz+Math.sin(a)*r],.022,0x806742);}
  ring(xx,yy+.39,zz,r,.025,wood);for(let j=0;j<4;j++)ball(xx+.09*Math.sin(j*3),yy+.19,zz+.10*Math.cos(j*3),.11,.12,.1,green);
 }
 function tool(xx,zz,type=0){const yy=ground(xx,zz);E([xx,yy+.06,zz],[xx+.19,yy+1.1,zz+.08],.035,0x9a7d52);if(type===0){B(xx,yy+.12,zz,.20,.27,.055,iron);}else{B(xx,yy+.12,zz,.4,.06,.07,iron);for(let i=0;i<5;i++)B(xx-.17+i*.085,yy+.06,zz+.06,.025,.14,.14,iron);}}
 function bench(xx,zz,len=1.6){const yy=ground(xx,zz);for(const dx of [-len*.39,len*.39])for(const dz of [-.24,.24])B(xx+dx,yy+.38,zz+dz,.095,.79,.095,wood);for(let i=0;i<4;i++)B(xx,yy+.81,zz-.27+i*.18,len,.095,.165,0x8b7051);E([xx-len*.39,yy+.14,zz+.24],[xx+len*.39,yy+.65,zz+.24],.06,dark);return yy+.87;}
 function vegetables(xx,zz,len,rows){
  for(let row=0;row<rows;row++){const rz=zz+row*.52;let yy=ground(xx,rz);B(xx,yy+.07,rz,len,.14,.39,earth);
   for(let i=0;i<Math.floor(len/.38);i++){const px=xx-len/2+.2+i*.38,py=ground(px,rz)+.14;C(px,py+.14,rz,.025,.035,.26,green,6);for(let a=0;a<5;a++){const an=a*1.256;const leaf=ball(px+Math.cos(an)*.1,py+.14,rz+Math.sin(an)*.1,.075,.035,.19,[0x52673c,0x6f7c48,0x3f603c][i%3]);leaf.rotation.y=-an;leaf.rotation.z=.25*Math.cos(an);}}
  }
 }
 // Sampled, mortared perimeter masonry and timber floor at the published lot elevation.
 k.foundation(x,z,w,d,base);B(x,base+.065,z,w,.13,d,wood);
 // Four thick walls, segmented around genuine recessed openings.
 function wall(axis,sign,door=false){const along=axis==='x'?d:w,off=axis==='x'?w/2:d/2;
  const wb=(u,yy,ww,hh,depth,color,out=0)=>axis==='x'?B(x+sign*(off+out),base+yy,z+u,depth,hh,ww,color):B(x+u,base+yy,z+sign*(off+out),ww,hh,depth,color);
  const stories=dyer?2:1;
  for(let st=0;st<stories;st++){
   const low=st*(H/2),high=dyer?(st+1)*H/2:H,win=door&&st===0,ow=win?1.45:1.65,bot=win?.12:low+.95,top=win?2.26:low+2.05;
   wb(-(along+ow)/4,(low+high)/2,(along-ow)/2,high-low,.18,pale);wb((along+ow)/4,(low+high)/2,(along-ow)/2,high-low,.18,pale);
   if(bot>low)wb(0,(low+bot)/2,ow,bot-low,.18,pale);wb(0,(top+high)/2,ow,high-top,.18,pale);
   wb(0,(bot+top)/2,ow-.12,top-bot-.06,.05,win?0x4d4333:0x766c50,-.07);
   for(const uu of [-ow/2,ow/2])wb(uu,(bot+top)/2,.12,top-bot+.2,.30,dark,.02);
   for(const yy of [bot,top])wb(0,yy,ow+.22,.13,.31,wood,.05);
   for(let j=0;j<10;j++)wb(-ow/2+.12+j*(ow-.24)/9,(bot+top)/2,.034,top-bot-.13,.055,wood,.10);
   for(const yy of [bot+.3,top-.3])wb(0,yy,ow-.14,.042,.07,wood,.12);
   if(!win){for(const side of [-1,1]){wb(side*(ow*.71), (bot+top)/2,ow*.35,top-bot,.095,0x756047,.16);for(let j=0;j<4;j++)wb(side*(ow*.71)-ow*.13+j*ow*.087,(bot+top)/2,.025,top-bot,.12,dark,.20);}wb(0,bot-.08,ow*1.92,.085,.15,dark,.15);}
   else {wb(.24,1.05,.06,.2,.08,iron,.15);wb(0,.14,ow+.28,.10,.45,wood,.09);}
  }
  for(const uu of [-along/2,along/2])wb(uu,H/2,.19,H+.1,.23,dark,.03);
  for(const yy of [0.22,H,...(dyer?[H/2]:[])])wb(0,yy,along+.18,.18,.24,dark,.04);
  for(let i=0;i<Math.ceil(along/.22);i++){const u=-along/2+.11+i*.22;wb(u,.48,.19,.45,.045,wood,.12);}
 }
 wall('x',s,true);wall('x',-s);wall('z',1);wall('z',-1);
 if(dyer)B(x,base+H/2,z,w-.2,.14,d-.2,wood);
 k.roof({x,y:base+H,z,w:w+1.24,d:d+1.04,rise:dyer?1.65:1.55,axis:dyer?'z':'x',tileColor:dyer?0x4c585d:0x525d5c,gableColor:pale});
 // Small capped kitchen smoke vent penetrates the roof shell.
 const vx=x-s*1.55,vz=z+1.35,vy=base+H+(dyer?.98:1.02);
 B(vx,vy+.12,vz,.38,.88,.40,0x79756a);B(vx,vy+.57,vz,.44,.12,.46,0x686b62);
 for(const dx of [-.15,.15])for(const dz of [-.16,.16])B(vx+dx,vy+.75,vz+dz,.065,.27,.065,0x55574f);
 B(vx,vy+.64,vz,.28,.015,.29,0x292e2a);B(vx,vy+.91,vz,.57,.10,.59,0x515b5c);
 // Lane-facing porch stones and gate, kept outside every root road reservation.
 for(let i=0;i<5;i++){const xx=x+s*(3.05+i*.50),zz=z;const yy=ground(xx,zz);const top=Math.max(yy+.10,base+.10-i*.115);B(xx,(yy-.07+top)/2,zz,.46,top-yy+.07,1.12,0x87877a);}
 const minx=x-5.24,maxx=x+5.24,lo=.30,hi=11.70,front=x+s*5.24,back=x-s*5.24;
 k.fence([minx,lo],[maxx,lo],.88);k.fence([minx,hi],[maxx,hi],.88);k.fence([back,lo],[back,hi],.90);
 k.fence([front,lo],[front,z-.78],.86);k.fence([front,z+.78],[front,hi],.86);
 const gy=ground(front,z);for(const dz of [-.77,.77])B(front,ground(front,z+dz)+.6,z+dz,.17,1.22,.17,dark);
 // Gate leaf folds inward, leaving the route open.
 for(const lev of [.28,.76])E([front,gy+lev,z+.7],[front-s*.72,gy+lev,z+1.12],.075,wood);
 for(let j=0;j<5;j++)B(front-s*j*.18,gy+.53,z+.70+j*.105,.05,.62,.05,wood);
 // Small side/rear storage shed: boards, foundation, open doorway, exposed rafters and ceramic roof.
 const shx=x-s*4.23,shz=5.2,shw=1.35,shd=3.1,shy=Math.max(...[-.7,.7].flatMap(dx=>[-1.6,1.6].map(dz=>ground(shx+dx,shz+dz))))+.16;
 k.foundation(shx,shz,shw,shd,shy);
 for(const dx of [-shw/2,shw/2])for(const dz of [-shd/2,shd/2])B(shx+dx,shy+.98,shz+dz,.12,1.96,.12,wood);
 for(let i=0;i<15;i++)B(shx-s*shw/2,shy+.95,shz-shd/2+.105+i*.205,.10,1.8,.19,0x7b654c);
 for(let j=0;j<7;j++)for(const dz of [-shd/2,shd/2])B(shx-shw/2+.1+j*.19,shy+.95,shz+dz,.17,1.8,.1,wood);
 k.roof({x:shx,y:shy+1.97,z:shz,w:shw+.48,d:shd+.42,rise:.50,tileColor:0x555c58,gableColor:0x816b4f});
 for(let i=0;i<12;i++){let yy=shy+.14+Math.floor(i/4)*.20,zz=shz-.85+(i%4)*.22;const log=C(shx,yy,zz,.09,.10,1.1,0x806145,9);log.rotation.z=Math.PI/2;C(shx+s*.555,yy,zz,.065,.065,.015,0xb09a6b,9).rotation.z=Math.PI/2;}
 tool(shx+s*.47,shz+.85);tool(shx+s*.49,shz+1.14,1);
 if(dyer){
  // Covered dye kitchen in the southern yard; the working face remains open.
  const cx=x+.2,cz=1.48,cy=Math.max(...[-1.65,1.65].map(dx=>ground(cx+dx,cz)))+.06;
  for(const dx of [-1.75,1.75])for(const dz of [-.63,.63]){const gy=ground(cx+dx,cz+dz);B(cx+dx,gy+1.08,cz+dz,.12,2.24,.12,wood);}
  k.roof({x:cx,y:cy+2.20,z:cz,w:1.9,d:3.85,axis:'x',rise:.55,tileColor:0x566060,gableColor:0x8b7657});
  for(const dx of [-1.03,0,1.03]){const xx=cx+dx,top=barrel(xx,cz,.38,.82,true);E([xx-.15,top-.55,cz],[xx+.31,top+.66,cz+.13],.047,0xa08c62);}
  const by=bench(x+4.05,2.1,1.55);pot(x+3.80,2.1,.14,.25,0x867150,by);B(x+4.34,by+.035,2.1,.40,.06,.20,0x727165);
  // Indigo lengths are folded over a bamboo pole, with actual corrugated cloth thickness.
  for(const xx of [x-1.8,x+2.1]){const yy=ground(xx,10.6);B(xx,yy+1.3,10.6,.10,2.6,.10,wood);}
  const ry=Math.max(ground(x-1.8,10.6),ground(x+2.1,10.6))+2.4;E([x-1.8,ry,10.6],[x+2.1,ry,10.6],.07,wood);
  for(let j=0;j<4;j++){const xx=x-1.43+j*.9;const shape=new THREE.Shape();for(let n=0;n<=16;n++){const u=-.35+n*.04375,v=.045*Math.sin(n*.8);if(n===0)shape.moveTo(u,v);else shape.lineTo(u,v);}for(let n=16;n>=0;n--)shape.lineTo(-.35+n*.04375,.045*Math.sin(n*.8)+.018);shape.closePath();const cloth=M(new THREE.ExtrudeGeometry(shape,{depth:1.50,bevelEnabled:false}),mat([0x304b63,0x3d5870,0x53667c,0x394e64][j]),xx,ry-.02,10.6);cloth.rotation.x=Math.PI/2;E([xx-.33,ry+.01,10.58],[xx+.34,ry+.01,10.58],.033,0x9b8863);}
  vegetables(x-3.6,9.7,1.45,3);barrel(x+4.2,9.5,.30,.64);pot(x+4.32,7.2);pot(x+4.23,7.85,.20,.35);
 }else{
  vegetables(x-.8,1.1,6.4,3);vegetables(x-1.2,10.05,4.9,3);
  // Bamboo pea support over one bed, tied nodes and longitudinal crossbars.
  for(const xx of [x-3.5,x-2.4,x-1.3,x-.2,x+.9]){const yy=ground(xx,1.65);E([xx,yy,1.20],[xx,yy+1.62,1.70],.045,0x8d9060);E([xx,yy,2.18],[xx,yy+1.62,1.70],.045,0x8d9060);for(let j=1;j<5;j++){B(xx,yy+j*.31,1.20+j*.09,.065,.06,.065,0xc0ac77);}for(let j=0;j<4;j++)ball(xx+.06*Math.sin(j),yy+.27+j*.31,1.35+j*.09,.15,.09,.12,0x597044);}
  E([x-3.6,ground(x-3.6,1.7)+1.62,1.7],[x+1,ground(x+1,1.7)+1.62,1.7],.045,0x939264);
  const by=bench(x+4.1,9.2,1.65);pot(x+3.7,9.2,.13,.22,0x8b644b,by);E([x+4,by+.04,9.2],[x+4.6,by+.04,9.2],.04,wood);B(x+4.63,by+.045,9.2,.15,.035,.20,iron);
  basket(x-4.1,3.1);basket(x-3.7,8.8);tool(x+3.45,8.1);tool(x+3.72,8.1,1);barrel(x-4.25,9.8,.33,.75);
  for(let i=0;i<4;i++)pot(x-4.22,7.35+i*.43,.18,.30,i%2?0x977654:0x746b4e);
  // Low sculptural pine in the rear northeast corner, branching through layered needles.
  const px=x+3.84,pz=10.75,py=ground(px,pz);const trunk=[[px,py,pz],[px-.15,py+.85,pz+.06],[px+.11,py+1.75,pz],[px-.23,py+2.70,pz+.03]];
  for(let i=1;i<trunk.length;i++)E(trunk[i-1],trunk[i],.20-i*.037,0x685644);
  for(let j=0;j<7;j++){const a=j*2.399,lev=.95+j*.24,rr=j>4?.60:.92;const end=[px+Math.cos(a)*rr,py+lev+.18,pz+Math.sin(a)*rr*.67];E([px,py+lev-.15,pz],end,.066,0x675542);
   for(let b=0;b<4;b++){let ex=end[0]+Math.cos(a+b)*.23,ez=end[2]+Math.sin(a+b)*.21;E(end,[ex,end[1]+.18,ez],.025,wood);ball(ex,end[1]+.20,ez,.36,.13,.27,[0x344e3a,0x415c3e,0x516747][b%3]);for(let n=0;n<7;n++){const an=n*.9;E([ex,end[1]+.27,ez],[ex+Math.cos(an)*.26,end[1]+.31+(n%2)*.08,ez+Math.sin(an)*.23],.018,0x4b6543);}}
  }
 }
 // Scattered worn gravel follows terrain inside the working yards.
 for(let i=0;i<90;i++){const xx=x-4.9+((i*2.719)%9.8),zz=.53+((i*1.913)%10.8);if(Math.abs(xx-x)<3.1&&Math.abs(zz-z)<3.1)continue;ball(xx,ground(xx,zz)+.02,zz,.035+(i%3)*.016,.025,.04,0x918a75);}
 }
 let count=0;world.traverse(o=>{if(o.isMesh)o.name='central-village-gardens_detail_'+count++;});
 return world;
}
