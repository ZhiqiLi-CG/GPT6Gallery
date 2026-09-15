import {heightAt,roadNetwork,layout} from './root.js';
import {createVillageKit} from './central-village.js';

const PREFIX='central-village-tea_';
export function build(THREE,ctx){
 const world=new THREE.Group();world.name=PREFIX+'civic_pair';
 const lots=layout().lots;
 const flowerGeometry=new THREE.SphereGeometry(1,5,3);
 const palette={wood:0x69503a,dark:0x40392f,plaster:0xc3b99c,stone:0x85857a,clay:0x927054,iron:0x454c49,soil:0x615443,leaf:0x51684a};
 function assembly(name){const g=new THREE.Group();g.name=PREFIX+name;world.add(g);return [g,createVillageKit(THREE,g)];}
 function props(k){
  const {box,cylinder,beam,mesh,material}=k;
  const torus=(x,y,z,r,t,c)=>{const o=mesh(new THREE.TorusGeometry(r,t,6,20),material(c),x,y,z);o.rotation.x=Math.PI/2;return o};
  function pot(x,z,r=.22,h=.43,y=heightAt(x,z),c=palette.clay){
   const p=[new THREE.Vector2(0,0),new THREE.Vector2(r*.6,0),new THREE.Vector2(r*.95,h*.25),new THREE.Vector2(r,h*.65),new THREE.Vector2(r*.70,h),new THREE.Vector2(r*.54,h),new THREE.Vector2(r*.76,h*.62),new THREE.Vector2(r*.54,.07),new THREE.Vector2(0,.07)];
   mesh(new THREE.LatheGeometry(p,16),material(c),x,y,z);torus(x,y+h,z,r*.63,.025,c);
  }
  function barrel(x,z,r=.32,h=.75,y=heightAt(x,z),open=false){
   for(let i=0;i<16;i++){const a=i*Math.PI/8;const o=box(x+Math.cos(a)*r,y+h/2,z+Math.sin(a)*r,r*.40,h,.06,i%3?0x826a4d:0x735b42);o.rotation.y=-a+Math.PI/2;}
   for(const f of [.14,.82])torus(x,y+h*f,z,r+.018,.027,palette.iron);
   cylinder(x,y+.045,z,r*.95,r*.95,.07,0x594b39,16);
   if(!open)for(let i=-2;i<=2;i++){const zz=i*r*.36;box(x,y+h,z+zz,Math.sqrt(r*r-zz*zz)*1.93,.06,r*.33,0x867052);}
  }
  function bench(x,z,w=1.5,y=heightAt(x,z),axis='x',h=.43){
   const d=.38;const b=box(x,y+h,z,axis==='x'?w:d,.10,axis==='x'?d:w,0x7b6045);
   for(const s of [-1,1]){const xx=x+(axis==='x'?s*w*.36:0),zz=z+(axis==='x'?0:s*w*.36);const bottom=heightAt(xx,zz);box(xx,(bottom+y+h)/2,zz,.17,y+h-bottom,.27,palette.dark);}
   return b;
  }
  function workbench(x,z,w=1.4,d=.55){const y=heightAt(x,z);box(x,y+.79,z,w,.10,d,0x897052);for(const sx of [-1,1])for(const sz of [-1,1])box(x+sx*(w/2-.12),y+.4,z+sz*(d/2-.09),.10,.8,.10,palette.wood);box(x,y+.26,z,w-.15,.08,d-.1,palette.wood);box(x-.27,y+.86,z,.52,.045,.21,0xb69b71);beam([x+.2,y+.86,z-.1],[x+.55,y+.87,z+.12],.035,0xa08a62);box(x+.18,y+.88,z-.12,.18,.075,.09,palette.iron);}
  function tools(x,z){const y=heightAt(x,z);beam([x,y+.08,z],[x+.15,y+1.22,z],.045,0x9c855b);box(x-.04,y+.10,z,.30,.20,.075,palette.iron);beam([x+.3,y+.08,z],[x+.45,y+1.14,z],.04,0x8d7651);box(x+.32,y+.13,z,.36,.05,.08,palette.wood);for(let i=0;i<5;i++)beam([x+.17+i*.07,y+.12,z],[x+.17+i*.07,y+.015,z+.12],.025,palette.wood);}
  function woodpile(x,z,axis='z'){const y=heightAt(x,z);for(let row=0;row<3;row++)for(let j=0;j<4-row;j++){const xx=x+(j-(3-row)/2)*.21;const o=cylinder(xx,y+.12+row*.20,z,.105,.105,.85,0x735941,9);o.rotation.x=Math.PI/2;for(const s of [-1,1]){const end=cylinder(xx,y+.12+row*.20,z+s*.432,.080,.08,.015,0xaf9164,9);end.rotation.x=Math.PI/2;}}for(const s of [-1,1])box(x+s*.48,y+.42,z,.085,.84,.085,palette.dark);}
  function garden(x,z,w,d,rows=3){for(let a=0;a<rows;a++){const xx=x-w/2+(a+.5)*w/rows;for(let j=0;j<Math.ceil(d/.32);j++){const zz=z-d/2+(j+.5)*d/Math.ceil(d/.32),y=heightAt(xx,zz);box(xx,y+.04,zz,w/rows-.08,.10,.31,palette.soil);for(let l=0;l<5;l++){const an=l*1.256+j;const o=mesh(new THREE.SphereGeometry(1,6,4),material(l%2?0x607646:0x475e3d),xx+Math.cos(an)*.075,y+.17,zz+Math.sin(an)*.075);o.scale.set(.055,.15,.09);o.rotation.z=Math.cos(an)*.5;}}}for(const s of [-1,1]){box(x+s*w/2,heightAt(x+s*w/2,z)+.11,z,.07,.2,d+.12,0x8d7758);box(x,heightAt(x,z+s*d/2)+.11,z+s*d/2,w,.2,.07,0x8d7758);}}
  function shed(x,z,w,d){const top=heightAt(x,z)+.20;k.foundation(x,z,w,d,top);for(const sx of [-1,1])for(const sz of [-1,1])box(x+sx*w/2,top+.85,z+sz*d/2,.12,1.7,.12,palette.dark);for(let i=0;i<Math.ceil(w/.17);i++)box(x-w/2+(i+.5)*w/Math.ceil(w/.17),top+.80,z+d/2,w/Math.ceil(w/.17)-.012,1.60,.09,0x80674d);for(const s of [-1,1])box(x+s*w/2,top+.80,z,.09,1.6,d,0x8a7255);for(const yy of [.42,1.05])box(x,top+yy,z+.1,w-.1,.075,d-.25,palette.wood);k.roof({x,z,y:top+1.7,w:w+.54,d:d+.48,rise:.52,tileColor:0x586061,gableColor:0x8a7255});
   // Close the entire shed end under its tighter eaves, beyond kit gable inset.
   for(const sign of [-1,1]){const shape=new THREE.Shape();shape.moveTo(-w/2,0);for(let i=0;i<=20;i++){const xx=-w/2+i*w/20,t=Math.abs(xx)/((w+.54)/2);shape.lineTo(xx,.52*(1-t)+.26*t**7-.035);}shape.lineTo(w/2,0);shape.closePath();mesh(new THREE.ExtrudeGeometry(shape,{depth:.085,bevelEnabled:false}),material(0x8a7255),x,top+1.7,z+sign*d/2-.042);box(x,top+1.92,z+sign*d/2,.075,.43,.10,palette.dark);}
   return top;}
  function stone(x,z,w,d,extra=.05){const y=heightAt(x,z);box(x,y+extra-.06,z,w,.16,d,[0x939184,0x85867d,0xa09a88][Math.abs(Math.round(x*9+z*3))%3]);}
  return {torus,pot,barrel,bench,workbench,tools,woodpile,garden,shed,stone};
 }
 function house(k,lot,w,d,stories){
  const {box,beam}=k;let top=lot.y+.38;for(const x of [-w/2,w/2])for(const z of [-d/2,d/2])top=Math.max(top,heightAt(lot.x+x,lot.z+z)+.26);
  k.foundation(lot.x,lot.z,w,d,top);box(lot.x,top+.07,lot.z,w,.14,d,0x8f7755);
  const sh=2.62,h=sh*stories;
  function face(axis,s,len,front){
   const fixed=(axis==='x'?lot.x:lot.z)+s*(axis==='x'?w:d)/2,center=axis==='x'?lot.z:lot.x;
   function wall(u,y,ww,hh,dep=.16,col=palette.plaster,offset=0){return axis==='x'?box(fixed+s*offset,y,center+u,dep,hh,ww,col):box(center+u,y,fixed+s*offset,ww,hh,dep,col);}
   for(let level=0;level<stories;level++){
    const floor=top+level*sh;
    const openings=front&&level===0?[{u:0,w:1.6,b:.06,t:2.23,door:true},{u:-2.05,w:1.2,b:.8,t:2.0}]:[{u:-1.45,w:1.30,b:.80,t:1.99},{u:1.45,w:1.30,b:.80,t:1.99}];
    let cursor=-len/2;
    for(const op of openings.sort((a,b)=>a.u-b.u)){
     const lo=op.u-op.w/2,hi=op.u+op.w/2;
     wall((cursor+lo)/2,floor+sh/2,lo-cursor,sh);
     if(op.b>0)wall(op.u,floor+op.b/2,op.w,op.b);
     wall(op.u,floor+(op.t+sh)/2,op.w,sh-op.t);
     // Recessed shoji sits within the aperture, surrounded by separate sill/header/jambs.
     wall(op.u,floor+(op.b+op.t)/2,op.w-.08,op.t-op.b-.08,.045,0x393d33,-.045);
     wall(op.u,floor+(op.b+op.t)/2,op.w-.17,op.t-op.b-.15,.035,op.door?0xc8bea0:0xbcbca2,-.017);
     for(const u of [lo,hi])wall(u,floor+(op.b+op.t)/2,.095,op.t-op.b+.16,.23,palette.dark,.018);
     for(const yy of [op.b,op.t])wall(op.u,floor+yy,op.w+.22,.095,.27,palette.wood,.035);
     for(let j=1;j<6;j++)wall(lo+op.w*j/6,floor+(op.b+op.t)/2,.025,op.t-op.b,.065,palette.wood,.024);
     for(let j=1;j<5;j++)wall(op.u,floor+op.b+(op.t-op.b)*j/5,op.w,.025,.065,palette.wood,.024);
     if(op.door){wall(op.u,floor+1.12,.055,2.16,.08,palette.dark,.06);wall(op.u+.16,floor+1.08,.025,.17,.06,palette.iron,.10);}
     else {const su=hi+.30;wall(su,floor+1.39,.43,1.17,.07,0x81694e,.15);for(let j=0;j<5;j++)wall(su-.17+j*.085,floor+1.39,.025,1.14,.1,palette.dark,.19);}
     cursor=hi;
    }
    wall((cursor+len/2)/2,floor+sh/2,len/2-cursor,sh);
    for(const yy of [.18,.58,sh])wall(0,floor+yy,len+.14,.14,.21,palette.wood,.025);
    for(let j=0;j<=4;j++)wall(-len/2+j*len/4,floor+sh/2,.15,sh,.24,palette.dark,.025);
    if(level===0)for(let j=0;j<Math.ceil(len/.18);j++)wall(-len/2+(j+.5)*len/Math.ceil(len/.18),floor+.36,len/Math.ceil(len/.18)-.015,.34,.18,0x8b7355,.04);
   }
  }
  for(const s of [-1,1]){face('x',s,d,lot.front===(s===1?'east':'west'));face('z',s,w,false);}
  if(stories===2)box(lot.x,top+sh,lot.z,w,.16,d,0x826a4a);
  k.roof({x:lot.x,z:lot.z,y:top+h,w:(stories===2?d:w)+1.24,d:(stories===2?w:d)+1.04,rise:stories===2?1.85:1.55,axis:stories===2?'x':'z',gableColor:palette.plaster,tileColor:stories===2?0x48565a:0x515d60});
  return {top,h};
 }
 function fenceLot(k,p){const left=p.x-p.w/2+.20,right=p.x+p.w/2-.20,s=p.z-p.d/2+.18,n=p.z+p.d/2-.18;for(const [a,b] of [[[left,s],[right,s]],[[left,n],[right,n]],[[p.front==='east'?left:right,s],[p.front==='east'?left:right,n]]])k.fence(a,b,.83);const fx=p.front==='east'?right:left;k.fence([fx,s],[fx,p.z-.85],.82);k.fence([fx,p.z+.85],[fx,n],.82);for(const zz of [p.z-.85,p.z+.85]){const y=heightAt(fx,zz);k.box(fx,y+.57,zz,.17,1.14,.17,palette.dark);} // one open braced gate leaf beside the entrance
 const y=heightAt(fx,p.z+.85);k.beam([fx,y+.27,p.z+.85],[fx+(p.front==='east'?-.7:.7),y+.27,p.z+1.05],.075);k.beam([fx,y+.75,p.z+.85],[fx+(p.front==='east'?-.7:.7),y+.75,p.z+1.05],.075);k.beam([fx,y+.27,p.z+.85],[fx+(p.front==='east'?-.7:.7),y+.75,p.z+1.05],.065);
 }
 // Tea house, engawa, well and meeting space are a single owned civic compound.
 {
  const [g,k]=assembly('tea_house_and_meeting_yard'),p=lots.find(p=>p.id==='central-village-lot-5'),f=props(k),{top}=house(k,p,6,6.4,1);fenceLot(k,p);
  // Brewing hearth flue, carried from the founded floor through the east roof slope.
  const flue=new THREE.Group();flue.name=PREFIX+'brewing_flue';g.add(flue);
  const fk=createVillageKit(THREE,flue),fx=p.x+1.35,fz=p.z+1.60,throat=top+4.82;
  fk.box(fx,top+.20,fz,.62,.12,.66,0x77766b);
  const bottom=top+.26,rows=20,course=(throat-bottom)/rows;
  for(let row=0;row<rows;row++){
   const yy=bottom+(row+.5)*course,stone=row%3===0?0x7e7d71:0x77766b;
   for(const sign of [-1,1]){
    fk.box(fx+sign*.1575,yy,fz,.065,course-.012,.42,stone);
    fk.box(fx,yy,fz+sign*.1775,.25,course-.012,.065,stone);
   }
  }
  // A dark recessed liner leaves the outlet visibly open beneath its rain hood.
  fk.box(fx,throat-.27,fz,.25,.018,.29,0x252b29);
  for(const sign of [-1,1]){
   fk.box(fx+sign*.17,throat,fz,.08,.07,.46,0x555c59);
   fk.box(fx,throat,fz+sign*.19,.26,.07,.08,0x555c59);
  }
  // Folded apron follows this roof's twelve-piece tile profile around the shaft.
  const roofY=x=>{const t=Math.abs(x-p.x)/3.62,j=Math.min(11,Math.floor(t*12)),u=t*12-j;
   const profile=v=>1.55*(1-v)+.26*v**7;
   return top+2.62+profile(j/12)*(1-u)+profile((j+1)/12)*u+.17;};
  for(const sign of [-1,1]){
   fk.beam([fx-.44,roofY(fx-.44),fz+sign*.335],[fx+.44,roofY(fx+.44),fz+sign*.335],.025,0x586361,undefined,.23);
   const a=fx+sign*.19,b=fx+sign*.44;
   fk.beam([a,roofY(a),fz],[b,roofY(b),fz],.025,0x586361,undefined,.44);
   // Counter-flashing turns up at the masonry, covering the apron joint.
   fk.box(fx+sign*.199,roofY(fx+sign*.199)+.07,fz,.022,.18,.46,0x4e5957);
   fk.beam([fx-.20,roofY(fx-.20)+.065,fz+sign*.221],[fx+.20,roofY(fx+.20)+.065,fz+sign*.221],.11,0x4e5957,undefined,.025);
  }
  for(const dx of [-.155,.155])for(const dz of [-.185,.185])fk.box(fx+dx,throat+.145,fz+dz,.035,.29,.035,palette.iron);
  fk.box(fx,throat+.31,fz,.64,.065,.68,0x566064);
  for(const sign of [-1,1])fk.box(fx,throat+.267,fz+sign*.33,.64,.055,.025,0x454f50);
  let fluePart=0;flue.traverse(o=>{if(!o.name)o.name=PREFIX+'brewing_flue_part_'+(++fluePart);});
  const vx=p.x+3.59;
  for(let j=0;j<23;j++)k.box(vx,top+.04,p.z-3.1+(j+.5)*6.2/23,1.15,.12,6.2/23-.018,0x92734f);
  for(const zz of [-12.9,-10,-7.1]){const low=heightAt(vx+.40,zz)-.08;k.cylinder(vx+.40,low+.10,zz,.19,.21,.2,palette.stone,8);k.box(vx+.40,(low+top+2.30)/2,zz,.12,top+2.30-low,.12,palette.dark);}
  k.beam([vx+.4,top+2.30,-13.2],[vx+.4,top+2.30,-6.8],.13,palette.dark);
  // Individually lapped board canopy below the main eaves.
  for(let j=0;j<24;j++){const zz=-13.3+(j+.5)*6.6/24;k.beam([-22.12,top+2.6,zz],[-20.78,top+2.30,zz],.08,0x736248,undefined,.27);}
  for(const zz of [-11.8,-8.25]){k.box(vx,top+.39,zz,.68,.09,.76,0x6e4b32);for(const sx of [-1,1])for(const sz of [-1,1])k.box(vx+sx*.24,top+.22,zz+sz*.28,.065,.35,.065,palette.dark);for(const dz of [-.18,.18])f.pot(vx,zz+dz,.060,.07,top+.445,0xd6ceaf);f.pot(vx+.13,zz,.10,.12,top+.445,0x575c48);}f.bench(vx,-7.1,.90,top,'z',.27);
  for(let i=0;i<3;i++){const xx=-20.58+i*.43;f.stone(xx,-10,.39,1.02,.22-i*.065);}
  // Rear well: individually jointed annular stone courses, never a capped cylinder.
  const wx=-29.37,wz=-11.9,wy=heightAt(wx,wz),ro=.65,ri=.43;
  for(let row=0;row<3;row++)for(let j=0;j<12;j++){const a=j*Math.PI/6+(row%2)*Math.PI/12;const shape=new THREE.Shape();for(let t=0;t<=4;t++){const ang=a+.018+t*(Math.PI/6-.036)/4;const xx=Math.cos(ang)*ro,zz=Math.sin(ang)*ro;t?shape.lineTo(xx,zz):shape.moveTo(xx,zz);}for(let t=4;t>=0;t--){const ang=a+.018+t*(Math.PI/6-.036)/4;shape.lineTo(Math.cos(ang)*ri,Math.sin(ang)*ri);}shape.closePath();const o=k.mesh(new THREE.ExtrudeGeometry(shape,{depth:.235,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:1}),k.material([0x8c8c80,0x797f75,0x9b978a][j%3]),wx,wy+row*.25+.23,wz);o.rotation.x=Math.PI/2;}
  k.cylinder(wx,wy+.045,wz,.425,.425,.015,0x355c60,32);
  for(const zz of [wz-.79,wz+.79]){k.box(wx,wy+1.16,zz,.13,2.35,.13,palette.dark);k.box(wx,wy+.04,zz,.28,.14,.28,palette.stone);}
  k.beam([wx,wy+2.21,wz-.86],[wx,wy+2.21,wz+.86],.17,palette.wood);
  k.roof({x:wx,z:wz,y:wy+2.3,w:1.62,d:2.00,rise:.46,tileColor:0x556164,gableColor:0x967b59});
  const wheel=k.mesh(new THREE.TorusGeometry(.14,.038,8,20),k.material(0x8c7756),wx,wy+2.04,wz);wheel.rotation.y=Math.PI/2;
  k.beam([wx,wy+.30,wz-.13],[wx,wy+2.06,wz-.13],.019,0xb39a6e);k.beam([wx,wy+2.04,wz+.13],[wx,wy+.87,wz+.13],.019,0xb39a6e);
  f.barrel(wx,wz+.14,.16,.24,wy+.65,true);const handle=k.mesh(new THREE.TorusGeometry(.16,.016,5,14,Math.PI),k.material(palette.iron),wx,wy+.90,wz+.14);handle.rotation.y=Math.PI/2;
  // Pavers fitted to the southern gathering yard and access round the well.
  for(let i=0;i<5;i++)for(let j=0;j<3;j++)f.stone(-27.4+i*.53,-15.33+j*.49,.50,.46,.035);
  for(let j=0;j<3;j++)f.stone(-29.35,-13.20-j*.44,.66,.39,.035);
  f.bench(-26.35,-15.5,1.9);f.bench(-24.80,-14.55,1.35,undefined,'z');
  k.box(-26.35,heightAt(-26.35,-14.48)+.53,-14.48,.9,.09,.65,0x7d6041);for(const dx of [-.32,.32])k.box(-26.35+dx,heightAt(-26.35+dx,-14.48)+.25,-14.48,.09,.5,.40,palette.wood);f.pot(-26.35,-14.48,.075,.09,heightAt(-26.35,-14.48)+.58,0xb9b491);
  // One open-branched cherry of deliberately modest crown diameter.
  const tx=-29.15,tz=-14.53,ty=heightAt(tx,tz);k.beam([tx,ty-.08,tz],[tx+.10,ty+1.9,tz+.10],.17,0x67513f);
  for(let i=0;i<7;i++){const a=i*2.39996,r=.60+(i%3)*.13;const ex=tx+Math.cos(a)*r,ez=tz+Math.sin(a)*r,ey=ty+2.10+(i%3)*.27;k.beam([tx+.08,ty+1.1,tz],[ex,ey,ez],.075,0x705742);for(let j=0;j<6;j++){const ang=j*2.399+i;const o=k.mesh(new THREE.IcosahedronGeometry(1,1),k.material(j%3===0?0xc49597:j%3===1?0xd8b3ac:0xb78689),ex+Math.cos(ang)*.22,ey+Math.sin(j*3)*.19,ez+Math.sin(ang)*.22);o.scale.set(.19,.14,.18);for(let b=0;b<8;b++){const ba=b*2.39996,px=o.position.x+Math.cos(ba)*.20,py=o.position.y+.08+Math.sin(b*2.1)*.10,pz=o.position.z+Math.sin(ba)*.20;for(let pet=0;pet<5;pet++){const pa=pet*Math.PI*2/5;const flower=k.mesh(flowerGeometry,k.material(b%2?0xd4ada8:0xc7999b),px+Math.cos(pa)*.033,py,pz+Math.sin(pa)*.033);flower.scale.set(.039,.015,.028);}k.cylinder(px,py+.014,pz,.013,.013,.019,0xb89b69,5);}}}
  const sy=f.shed(-29.15,-5.40,1.70,1.42);f.pot(-29.5,-5.32,.20,.40,sy+.47);f.barrel(-28.82,-5.35,.23,.57,sy+.20);f.woodpile(-29.33,-8.3);f.tools(-28.73,-7.4);f.workbench(-26.8,-5.05,1.45,.56);f.garden(-24.50,-5.15,1.70,1.22,3);f.barrel(-22.75,-5.15,.29,.66);f.pot(-21.95,-5.18,.22,.43);f.pot(-22.4,-14.6,.25,.48);
  // Open timber tea-drying rack has braced legs and two slatted, rimmed trays.
  const rx=-20.55,rz=-5.25,ry=heightAt(rx,rz);
  for(const dx of [-.51,.51])for(const dz of [-.24,.24])k.box(rx+dx,ry+.62,rz+dz,.065,1.26,.065,palette.wood);
  for(const level of [.48,1.06]){for(let j=0;j<10;j++)k.box(rx-.50+j*.11,ry+level,rz,.082,.035,.56,0x9b8159);for(const dz of [-.28,.28])k.box(rx,ry+level+.055,rz+dz,1.16,.09,.04,palette.wood);for(let j=0;j<35;j++){const leaf=k.mesh(new THREE.SphereGeometry(1,5,3),k.material(j%2?0x72784a:0x57603b),rx-.46+(j%9)*.115,ry+level+.035,rz-.18+Math.floor(j/9)*.12);leaf.scale.set(.053,.018,.031);}}
  k.beam([rx-.51,ry+.18,rz+.24],[rx+.51,ry+1.03,rz+.24],.045,palette.dark);
  for(let j=0;j<5;j++)f.stone(-23.35+j*.66,-14.1,.57,.50,.025);
  // Tea leaves drying in shallow framed trays, with individually visible leaves.
  const dy=heightAt(-26.8,-5.05)+.86;k.box(-26.8,dy,-5.05,.75,.035,.42,0x9d8960);for(let i=0;i<25;i++){const o=k.mesh(new THREE.SphereGeometry(1,5,3),k.material(0x677046),-27.1+(i%7)*.09,dy+.035,-5.18+Math.floor(i/7)*.08);o.scale.set(.055,.012,.025);}
 }
 // Two-storey household with compact rear pantry and domestic work garden.
 {
  const [g,k]=assembly('household_and_workyard'),p=lots.find(p=>p.id==='central-village-lot-6'),f=props(k),{top}=house(k,p,6.2,6.2,2);fenceLot(k,p);
  // Small kitchen flue with flashing, masonry joints and a rain cap.
  k.box(-7.85,top+6.48,-8.10,.36,1.1,.42,0x77766b);
  for(let j=0;j<5;j++)k.box(-7.85,top+5.97+j*.21,-8.10,.38,.027,.44,0x575b53);
  for(const dx of [-.13,.13])for(const dz of [-.16,.16])k.box(-7.85+dx,top+7.13,-8.10+dz,.045,.20,.045,palette.iron);
  k.box(-7.85,top+7.25,-8.10,.57,.095,.63,0x566064);
  k.foundation(-13.5,-10,.72,1.80,top-.08);for(let i=0;i<4;i++)f.stone(-14.04-i*.39,-10,.35,1.10,.23-i*.05);
  for(const z of [-11,-9])k.box(-13.7,top+1.1,z,.10,2.2,.10,palette.dark);k.beam([-13.7,top+2.24,-11.1],[-13.7,top+2.24,-8.9],.12,palette.wood);
  for(let j=0;j<8;j++)k.beam([-12.98,top+2.47,-11.12+j*.32],[-14.05,top+2.25,-11.12+j*.32],.075,0x726044,undefined,.32);
  const sy=f.shed(-5.58,-11.35,1.25,2.08);for(const z of [-11.85,-11.3,-10.8])f.pot(-5.55,z,.20,.42,sy+1.09,0x9b805f);f.barrel(-5.58,-11.7,.28,.67,sy+.12);f.pot(-5.58,-10.9,.25,.55,sy+.12);
  f.garden(-10.78,-14.77,3.55,1.5,5);f.garden(-7.85,-14.82,1.65,1.45,2);
  f.workbench(-8.32,-5.15,1.65,.62);f.tools(-7.20,-5.02);f.woodpile(-5.65,-8.60);f.barrel(-5.64,-6.43,.32,.78);f.pot(-6.40,-5.20,.24,.45);f.pot(-13.85,-13.4,.28,.54);f.pot(-14.65,-6.12,.26,.47);f.bench(-13.8,-7.75,1.05,undefined,'z');
  // Washing tub has staves, hoops, visible water and a slatted washboard.
  const bx=-12.64,bz=-5.10,by=heightAt(bx,bz);f.barrel(bx,bz,.41,.41,by,true);k.cylinder(bx,by+.29,bz,.365,.365,.02,0x577575,24);const board=k.box(bx+.09,by+.43,bz,.35,.06,.67,0xa78c62);board.rotation.x=.45;for(let j=0;j<8;j++)k.box(bx+.09,by+.45+j*.016,bz-.23+j*.06,.33,.035,.018,0x82694c);
  const x0=-12.6,x1=-9.9,zz=-6.05;for(const xx of [x0,x1])k.box(xx,heightAt(xx,zz)+1.04,zz,.10,2.08,.10,palette.wood);const ly=Math.max(heightAt(x0,zz),heightAt(x1,zz))+1.90;k.beam([x0,ly,zz],[x1,ly,zz],.023,0xb09b76);
  for(let j=0;j<4;j++){const xx=x0+.45+j*.56;const cloth=new THREE.PlaneGeometry(.43,.85,6,8),v=cloth.attributes.position;for(let i=0;i<v.count;i++)v.setZ(i,.038*Math.sin(v.getX(i)*35+j)+.015*Math.sin(v.getY(i)*13));cloth.computeVertexNormals();const m=new THREE.MeshStandardMaterial({color:[0xbcb5a1,0x647675,0xc2b69b,0x929981][j],side:THREE.DoubleSide,roughness:1});const o=k.mesh(cloth,m,xx,ly-.44,zz);for(const dx of [-.15,.15])k.box(xx+dx,ly-.01,zz,.035,.10,.05,0x917650);}
  for(const [xx,z] of [[-14.8,-11.2],[-14.3,-12],[-13.5,-14.6],[-12,-5.85],[-9.4,-5.2],[-5.6,-7.3],[-5.5,-13.4]])f.stone(xx,z,.45,.47,.025);
 }
 // Share petal geometry in instance batches so close blossom detail stays inexpensive.
 for(const group of world.children){const batches=new Map();for(const o of [...group.children])if(o.geometry===flowerGeometry){const key=o.material.color.getHex();if(!batches.has(key))batches.set(key,[]);batches.get(key).push(o);}for(const list of batches.values()){const batch=new THREE.InstancedMesh(flowerGeometry,list[0].material,list.length);list.forEach((o,i)=>{o.updateMatrix();batch.setMatrixAt(i,o.matrix);group.remove(o);});batch.castShadow=true;batch.receiveShadow=true;batch.instanceMatrix.needsUpdate=true;group.add(batch);}}
 // Every mesh inherits the exact task prefix, including reusable kit internals.
 let n=0;world.traverse(o=>{if(!o.name)o.name=PREFIX+'part_'+(++n);});
 return world;
}
