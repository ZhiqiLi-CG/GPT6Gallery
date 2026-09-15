import { heightAt, roadNetwork, layout } from './root.js';
import { shrineLayout } from './shore-shrine.js';

// All dimensions are metres; the whole gabled sanctuary, including eaves, is inside its reservation.
export function build(THREE, ctx) {
 const g=new THREE.Group();g.name='shore-shrine-sanctuary';
 const S=shrineLayout().sanctuary, X=S.x,Z=S.z,F=S.floor;
 if(!layout().shrine || !roadNetwork().some(r=>r.id==='shore-path')) throw Error('Missing shrine layout');
 const mat=(c,other={})=>new THREE.MeshStandardMaterial({color:c,roughness:.86,...other});
 const timber=[0x77583b,0x816044,0x89694a,0x735338,0x94734f].map(c=>mat(c));
 const dark=mat(0x4c3728),endgrain=mat(0xa0845d),red=mat(0x923b2b),black=mat(0x29302c),bronze=mat(0x81704a,{metalness:.52,roughness:.48});
 const stone=[0x767a70,0x808377,0x71796f,0x8a8b7f].map(c=>mat(c));
 const tiles=[0x3d494b,0x435053,0x475255,0x394548].map(c=>mat(c,{roughness:.72}));
 const rope=mat(0xbaaa83),paper=mat(0xe5dfcc,{side:THREE.DoubleSide}),shadow=mat(0x28291f),gold=mat(0xac955c,{metalness:.5});
 const unitBox=new THREE.BoxGeometry(1,1,1),unitCyl=new THREE.CylinderGeometry(1,1,1,12),batches=new Map();let part;
 function section(name){part=new THREE.Group();part.name='shore-shrine-sanctuary_'+name;g.add(part)}
 function instance(geo,m,p,s,q){const key=part.uuid+geo.uuid+m.uuid;if(!batches.has(key))batches.set(key,{geo,m,part,items:[]});batches.get(key).items.push(new THREE.Matrix4().compose(new THREE.Vector3(...p),q||new THREE.Quaternion(),new THREE.Vector3(...s)))}
 function box(x,y,z,w,h,d,m=timber[0],q){if(h>0)instance(unitBox,m,[x,y+h/2,z],[w,h,d],q)}
 function cylinder(x,y,z,r,h,m){instance(unitCyl,m,[x,y+h/2,z],[r,h,r])}
 function beam(a,b,w,m=timber[0],depth=w,round=false){const p=new THREE.Vector3(...a),v=new THREE.Vector3(...b).sub(p);instance(round?unitCyl:unitBox,m,p.addScaledVector(v,.5).toArray(),[w,v.length(),depth],new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize()))}
 function mesh(geo,m,x=0,y=0,z=0){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;part.add(o);return o}
 function tube(points,r,m){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),Math.max(12,points.length*3),r,6,false),m)}
 const rnd=n=>{const a=Math.sin(n*127.13+43.8)*43413.2;return a-Math.floor(a)};
 section('foundation');
 // Staggered perimeter stone courses each start under their own lowest terrain sample.
 function masonry(a,b,top=6.6,width=.46){const len=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/len,uz=(b[1]-a[1])/len;
  for(let row=0;row<13;row++){const lo=2.35+row*.34;if(lo>=top)break;
   for(let t=-(row%2)*.36;t<len;t+=.72){const l=Math.max(t,0),r=Math.min(t+.72,len),x=a[0]+ux*(l+r)/2,z=a[1]+uz*(l+r)/2;
    const low=Math.min(heightAt(x-.26,z-.26),heightAt(x+.26,z+.26),heightAt(x-.26,z+.26),heightAt(x+.26,z-.26))-.18;
    if(lo+.33<low)continue;const base=Math.max(lo,low),hi=Math.min(lo+.328,top-.16);
    if(hi>base)box(x,base,z,ux?r-l-.018:width,hi-base,ux?width:r-l-.018,stone[(row+Math.floor(t*7+100))%4]);
   }
  }
  const n=Math.ceil(len/.72);for(let i=0;i<n;i++){const x=a[0]+ux*(i+.5)*len/n,z=a[1]+uz*(i+.5)*len/n;box(x,top-.16,z,ux?len/n-.012:width+.09,.16,ux?width+.09:len/n-.012,stone[1])}
 }
 for(const [a,b] of [[[X-3.5,Z-3.25],[X+3.5,Z-3.25]],[[X-3.5,Z+3.25],[X+3.5,Z+3.25]],[[X-3.5,Z-3.25],[X-3.5,Z+3.25]],[[X+3.5,Z-3.25],[X+3.5,Z+3.25]]])masonry(a,b);
 // Inner piers support the floor; there is deliberately no floating concrete slab.
 for(const x of [X-3.2,X-1.6,X,X+1.6,X+3.2])for(const z of [Z-2.9,Z,Z+2.9]){
  const low=Math.min(heightAt(x-.3,z-.3),heightAt(x+.3,z+.3))-.18;
  box(x,low,z,.57,6.54-low,.57,stone[2]);box(x,6.54,z,.67,.12,.67,stone[1]);box(x,6.66,z,.26,.35,.26,dark);
 }
 section('timber_frame');
 for(const x of [X-3.25,X-1.65,X,X+1.65,X+3.25])box(x,6.78,Z,.21,.23,6.75,dark);
 for(let i=0;i<18;i++)box(X,6.95,Z-3.23+i*.38,7.3,.12,.115,timber[i%5]);
 for(let i=0;i<30;i++)box(X-3.47+i*.24,F-.08,Z,.231,.08,6.65,timber[i%5]);
 // Structural columns, ties, through-tenons, braces and restrained metal straps.
 for(const x of [X-3.4,X,X+3.4])for(const z of [Z-3.2,Z+3.2]){
  box(x,F-.2,z,.26,3.1,.26,timber[0]);box(x,F-.21,z,.34,.16,.34,dark);
  for(const y of [7.47,9.6])box(x,y,z,.276,.085,.276,black);
  for(const sign of [-1,1])if(x+sign*.62>X-3.45&&x+sign*.62<X+3.45)beam([x,9.05,z],[x+sign*.62,9.72,z],.12,timber[3]);
 }
 for(const z of [Z-3.2,Z,Z+3.2])box(X,9.72,z,7.3,.27,.26,timber[0]);
 for(const x of [X-3.4,X+3.4]){
  for(const z of [Z-1.6,Z,Z+1.6])box(x,F,z,.23,2.84,.23,timber[0]);
  for(const y of [7.24,8.25,9.72])box(x,y,Z,.23,y===9.72?.27:.13,6.98,timber[0]);
  for(const z of [Z-3.2,Z+3.2])for(const s of [-1,1])if(z+s*.7>Z-3.3&&z+s*.7<Z+3.3)beam([x,9.05,z],[x,9.74,z+s*.66],.13,timber[3]);
 }
 for(const z of [Z-3.34,Z+3.34])for(const x of [X-3.4,X,X+3.4])box(x,9.78,z,.16,.14,.20,endgrain);
 section('walls_openings');
 // Split wall planks around openings so that windows and doors have genuine recessed depth.
 function plankWall(axis,side,opening){const total=axis==='x'?6.8:6.4,n=Math.round(total/.19),step=total/n;
  for(let i=0;i<n;i++){
   const u=-total/2+(i+.5)*step,intervals=(Math.abs(u)<opening.w/2)?[[F+.1,opening.low],[opening.high,9.72]]:[[F+.1,9.72]];
   for(const [a,b] of intervals)if(b>a)box(axis==='x'?X+u:X+side,a,axis==='x'?Z+side:Z+u,axis==='x'?step-.01:.105,b-a,axis==='x'?.105:step-.01,timber[(i+side*10+1000|0)%5]);
  }
 }
 plankWall('x',-3.2,{w:2.35,low:F+.1,high:9.45});
 plankWall('x',3.2,{w:1.5,low:8.12,high:9.25});
 for(const s of [-1,1])plankWall('z',s*3.4,{w:2.25,low:8.12,high:9.22});
 // Front double doors with recessed lower panels, lattice upper lights and bronze hinge straps.
 for(const dx of [-1.24,1.24])box(X+dx,F,Z-3.24,.18,2.45,.23,dark);
 box(X,F,Z-3.3,2.66,.14,.36,dark);box(X,9.45,Z-3.25,2.73,.19,.26,timber[2]);
 for(const s of [-1,1]){const x=X+s*.575,z=Z-3.23;
  box(x,F+.15,z,1.10,2.12,.115,dark);
  for(let k=0;k<6;k++)box(x-.45+k*.18,F+.22,z-.073,.17,.85,.042,timber[(k+2)%5]);
  box(x,8.24,z-.083,1.08,1.00,.028,shadow);
  for(let k=0;k<7;k++)box(x-.46+k*.153,8.26,z-.105,.028,.96,.025,timber[2]);
  for(let k=0;k<5;k++)box(x,8.30+k*.205,z-.109,1.02,.025,.028,timber[2]);
  for(const dx of [-.52,.52])box(x+dx,F+.15,z-.075,.075,2.16,.09,timber[0]);
  for(const y of [F+.15,8.17,9.24])box(x,y,z-.075,1.1,.08,.09,timber[0]);
  for(const y of [7.65,8.94]){box(x+s*.39,y,z-.137,.28,.09,.028,bronze);for(const dx of [-.09,.09])cylinder(x+s*.39+dx,y+.022,z-.15,.018,.035,black)}
  const ring=mesh(new THREE.TorusGeometry(.064,.012,6,14),bronze,x-s*.41,8.12,z-.18);
 }
 function windowFrame(side,back=false){const w=back?1.52:2.28,cz=Z,cy=8.12;
  const put=(u,y,v,ww,hh,dd,m)=>box(back?X+u:X+side*(3.4+v),y,back?Z+3.2+v:cz+u,back?ww:dd,hh,back?dd:ww,m);
  put(0,cy,-.015,w,1.10,.04,shadow);
  for(const u of [-w/2,w/2])put(u,cy-.10,.04,.12,1.28,.17,dark);
  for(const y of [cy-.1,cy+1.08])put(0,y,.07,w+.27,.13,.22,timber[2]);
  for(let i=0;i<9;i++)put(-w/2+.1+i*(w-.2)/8,cy+.04,.06,.035,1.0,.035,timber[2]);
  for(let i=0;i<4;i++)put(0,cy+.13+i*.27,.09,w-.12,.035,.03,timber[2]);
  // Two solid, framed sliding shutter leaves parked beside the opening.
  for(const s of [-1,1]){const u=s*(w/2+.36);put(u,cy,.12,.58,1.08,.07,timber[3]);
   for(let k=0;k<4;k++)put(u-.22+k*.147,cy+.05,.166,.022,.98,.02,dark);
   for(const y of [cy+.06,cy+.96])put(u,y,.18,.58,.065,.04,timber[1]);
  }
 }
 windowFrame(-1);windowFrame(1);windowFrame(1,true);
 // Tiny timber pegs and grain marks keep the elevations legible close up.
 for(let i=0;i<24;i++){const x=X-3.2+i*.275;if(Math.abs(x-X)<1.35)continue;for(const y of [7.43,9.56])box(x,y,Z-3.265,.025,.025,.018,dark)}
 section('porch_structure');
 const pfront=-53.38,pback=-52.15;
 for(const x of [X-3.5,X-1.4,X+1.4,X+3.5]){
  const z=-53.13,low=Math.min(heightAt(x-.28,z-.28),heightAt(x+.28,z+.28))-.16;
  box(x,low,z,.6,6.57-low,.6,stone[2]);box(x,6.57,z,.67,.13,.67,stone[1]);box(x,6.70,z,.22,.34,.22,dark);
 }
 for(const z of [-53.19,-52.43])box(X,6.87,z,7.55,.18,.20,dark);
 for(let i=0;i<6;i++)box(X,F-.09,pfront+.1+i*.204,7.52,.09,.195,timber[(i+1)%5]);
 box(X,6.88,pfront,7.60,.20,.16,timber[0]);
 // Seven regular risers; tread zero seats exactly on the court at y5.9, z=-54.6.
 section('courtyard_stairs');
 const stairX=-77.7,N=7,run=1.60;
 for(let i=0;i<N;i++){const z=-54.6+(i+.5)*run/N,top=5.9+(i+1)*(F-5.9)/N;
  box(stairX,top-.12,z,2.50,.12,run/N,timber[2]);box(stairX,top-.18,z-run/(2*N)+.045,2.48,.18,.07,timber[0]);
  for(const dx of [-1,1]){const x=stairX+dx*.96,lo=Math.min(5.88,heightAt(x,z)-.10);box(x,lo,z,.17,top-.12-lo,.16,dark)}
 }
 for(const dx of [-1,1])beam([stairX+dx*1.16,5.89,-54.54],[stairX+dx*1.16,7.04,-53.04],.17,dark);
 section('porch_railings');
 function railing(a,b){const len=Math.hypot(a[0]-b[0],a[1]-b[1]),n=Math.ceil(len/1.4);
  for(let i=0;i<=n;i++){const x=a[0]+(b[0]-a[0])*i/n,z=a[1]+(b[1]-a[1])*i/n;box(x,F,z,.14,.84,.14,timber[0]);box(x,F+.82,z,.20,.09,.20,dark);cylinder(x,F+.91,z,.052,.07,bronze)}
  for(const y of [F+.21,F+.72])beam([a[0],y,a[1]],[b[0],y,b[1]],.10,timber[2]);
  const count=Math.ceil(len/.3);for(let i=1;i<count;i++){const x=a[0]+(b[0]-a[0])*i/count,z=a[1]+(b[1]-a[1])*i/count;box(x,F+.23,z,.048,.46,.048,timber[1])}
 }
 railing([X-3.68,-53.30],[stairX-1.39,-53.30]);railing([stairX+1.39,-53.30],[X+3.68,-53.30]);
 for(const s of [-1,1])railing([X+s*3.68,-53.30],[X+s*3.68,-52.2]);
 // Slender porch columns carry a real projecting beam beneath the deep gable overhang.
 for(const s of [-1,1]){const x=X+s*3.45;box(x,F,-53.19,.20,2.80,.20,timber[1]);beam([x,9.14,-53.19],[x-s*.65,9.83,-53.19],.10,timber[1])}
 box(X,9.80,-53.19,7.43,.21,.23,timber[0]);
 section('roof_joinery');
 const RW=4.72,zmin=-53.78,zmax=-44.72;
 const roofY=x=>12.50-2.95*(Math.abs(x)/RW)+.85*Math.pow(Math.abs(x)/RW,5);
 // Paired stepped bracket arms under longitudinal eave plates.
 for(const s of [-1,1])for(const z of [-52.2,-50.6,-49,-47.4,-45.8]){
  const x=X+s*3.4;for(let k=0;k<3;k++){
   box(x+s*k*.18,9.92+k*.115,z,.42+k*.24,.105,.22,timber[k%5]);
   for(const dz of [-.16,.16])box(x+s*k*.15,9.97+k*.115,z+dz,.18,.13,.17,k===0?red:timber[2]);
  }
 }
 for(const s of [-1,1])box(X+s*4.03,10.20,(zmin+zmax)/2,.18,.18,zmax-zmin-.3,timber[0]);
 for(let i=0;i<27;i++){const z=zmin+.12+i*(zmax-zmin-.24)/26;
  for(const s of [-1,1])for(let k=0;k<10;k++){const a=k*RW/10,b=(k+1)*RW/10;beam([X+s*a,roofY(a)-.22,z],[X+s*b,roofY(b)-.22,z],.085,timber[i%5],.085)}
 }
 // Gable infill planks, king post and diagonal truss are present at both ends.
 for(const z of [Z-3.2,Z+3.2]){
  for(let i=0;i<35;i++){const dx=-3.35+i*.197,top=roofY(dx)-.30;box(X+dx,9.98,z,.185,top-9.98,.115,timber[(i+1)%5])}
  box(X,9.92,z-.02,.20,2.32,.22,timber[0]);box(X,10.57,z,5.1,.14,.21,timber[0]);
  for(const s of [-1,1])beam([X+s*3.3,10.02,z],[X,12.21,z],.17,timber[0]);
  // Small gable vent, carved surround and a brass chrysanthemum-like medallion.
  box(X,11.18,z+(z<Z?-.08:.08),.72,.59,.10,dark);
  for(let i=0;i<5;i++)box(X-.28+i*.14,11.22,z+(z<Z?-.145:.145),.035,.49,.03,timber[2]);
 }
 section('tiled_roof');
 // Continuous curved roof boards and separate overlapping fired-clay tile panels.
 const patch=(a,b,c,d,offset,material)=>{
  const p=[];const steps=3;
  for(let i=0;i<steps;i++){const x0=a+(b-a)*i/steps,x1=a+(b-a)*(i+1)/steps;
   const v=[[X+x0,roofY(x0)+offset,c],[X+x1,roofY(x1)+offset,c],[X+x1,roofY(x1)+offset,d],[X+x0,roofY(x0)+offset,d]];
   for(const j of [0,1,2,0,2,3])p.push(...v[j]);
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.computeVertexNormals();mesh(geo,material);
 };
 const roofBase=mat(0x3d4038,{side:THREE.DoubleSide});patch(-RW,0,zmin,zmax,-.055,roofBase);patch(0,RW,zmin,zmax,-.055,roofBase);
 const tilePositions=[[],[],[],[]];
 function tileQuad(a,b,c,d,offset,idx){const p=tilePositions[idx];for(let k=0;k<2;k++){const x0=a+(b-a)*k/2,x1=a+(b-a)*(k+1)/2;const v=[[X+x0,roofY(x0)+offset,c],[X+x1,roofY(x1)+offset,c],[X+x1,roofY(x1)+offset,d],[X+x0,roofY(x0)+offset,d]];for(const j of [0,1,2,0,2,3])p.push(...v[j]);}}
 const rows=16,cols=29;
 for(const s of [-1,1])for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
  const a=s*row*RW/rows,b=s*Math.min(RW,(row+1)*RW/rows+.033),c=zmin+col*(zmax-zmin)/cols+.008,d=zmin+(col+1)*(zmax-zmin)/cols-.008;
  tileQuad(Math.min(a,b),Math.max(a,b),c,d,.015+(rows-row)*.001,(row+col*3)%4);
  // Raised overlap lip follows each transverse tile course.
  const x=s*(row+1)*RW/rows;beam([X+x,roofY(x)+.031,c],[X+x,roofY(x)+.031,d],.018,tiles[2],.018,true);
 }
 for(let i=0;i<4;i++){tiles[i].side=THREE.DoubleSide;const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(tilePositions[i],3));geo.computeVertexNormals();mesh(geo,tiles[i]);}
 // Round cover-tile ribs run down each slope; end discs have a small stamped rosette.
 for(let col=0;col<=cols;col++){const z=zmin+col*(zmax-zmin)/cols;for(const s of [-1,1]){
  const pts=[];for(let k=0;k<=20;k++){const x=s*k*RW/20;pts.push([X+x,roofY(x)+.075,z])}tube(pts,.045,tiles[(col+1)%4]);
  const o=mesh(new THREE.CylinderGeometry(.066,.066,.035,12),tiles[2],X+s*(RW-.015),roofY(RW)+.068,z);o.rotation.z=Math.PI/2;
  const disc=mesh(new THREE.TorusGeometry(.041,.009,5,12),tiles[0],X+s*(RW+.012),roofY(RW)+.068,z);disc.rotation.y=Math.PI/2;
 }}
 // Thick decorated bargeboards follow both gables, with visible timber undersides.
 for(const z of [zmin+.015,zmax-.015])for(const s of [-1,1])for(let k=0;k<20;k++){
  const a=s*k*RW/20,b=s*(k+1)*RW/20;
  beam([X+a,roofY(a)-.105,z],[X+b,roofY(b)-.105,z],.15,timber[0],.15);
  beam([X+a,roofY(a)+.05,z],[X+b,roofY(b)+.05,z],.065,tiles[2],.065,true);
 }
 box(X,12.42,(zmin+zmax)/2,.35,.21,zmax-zmin+.08,tiles[0]);
 for(let i=0;i<26;i++){const z=zmin+.16+i*(zmax-zmin-.32)/25;const o=mesh(new THREE.CylinderGeometry(.205,.205,.36,16,1,false,Math.PI/2,Math.PI),tiles[i%4],X,12.64,z);o.rotation.x=Math.PI/2;}
 for(const z of [zmin+.09,zmax-.09]){
  // Oni-gawara silhouette: curved ceramic shoulders, central crest and circular boss.
  box(X,12.55,z,.57,.22,.21,tiles[1]);
  const o=mesh(new THREE.SphereGeometry(.27,12,8),tiles[1],X,12.84,z);o.scale.set(1,1.2,.48);
  const boss=mesh(new THREE.TorusGeometry(.105,.026,7,16),tiles[2],X,12.86,z+(z<Z?-.15:.15));
  for(const s of [-1,1])tube([[X+s*.11,12.93,z],[X+s*.34,12.82,z],[X+s*.37,12.67,z]],.065,tiles[1]);
 }
 section('ritual_fittings');
 // Offering chest: legs, enclosed slatted body, corner straps, and open coin slots between top bars.
 const ox=X,oz=-52.68,oy=F+.15;
 for(const dx of [-.68,.68])for(const dz of [-.22,.22])box(ox+dx,F,oz+dz,.12,.23,.12,dark);
 box(ox,oy,oz,1.64,.09,.66,dark);
 for(let i=0;i<12;i++)for(const s of [-1,1])box(ox-.748+i*.136,oy+.08,oz+s*.30,.116,.54,.07,timber[(i+2)%5]);
 for(const s of [-1,1])box(ox+s*.80,oy+.08,oz,.10,.55,.60,timber[0]);
 for(const y of [oy+.10,oy+.57])for(const s of [-1,1])box(ox,y,oz+s*.35,1.73,.085,.065,timber[0]);
 box(ox,oy+.55,oz,1.60,.03,.57,shadow);
 for(let i=0;i<14;i++)box(ox-.832+i*.128,oy+.66,oz,.075,.06,.72,timber[2]);
 for(const s of [-1,1])box(ox,oy+.65,oz+s*.36,1.82,.075,.055,timber[0]);
 for(const dx of [-.79,.79])for(const s of [-1,1]){box(ox+dx,oy+.12,oz+s*.392,.07,.48,.025,bronze);for(const yy of [oy+.17,oy+.53])box(ox+dx,yy,oz+s*.41,.024,.024,.018,black)}
 // Hollow, flared bronze bell hangs above the chest; a clapper and chained hanger remain visible.
 const bz=-53.22;
 for(let i=0;i<4;i++){const o=mesh(new THREE.TorusGeometry(.057,.014,6,14),bronze,X,9.75-i*.083,bz);o.rotation.y=i%2*Math.PI/2;}
 const bellProfile=[[.025,0],[.13,-.03],[.22,-.15],[.25,-.30],[.32,-.39],[.34,-.43],[.27,-.45],[.23,-.33],[.18,-.17],[.07,-.08]].map(([x,y])=>new THREE.Vector2(x,y));
 mesh(new THREE.LatheGeometry(bellProfile,24),bronze,X,9.44,bz);mesh(new THREE.SphereGeometry(.063,12,8),black,X,9.05,bz);
 for(let j=0;j<3;j++){const pts=[];for(let i=0;i<=72;i++){const t=i/72,a=t*Math.PI*20+j*2*Math.PI/3;pts.push([X+.028*Math.cos(a),9.04-t*1.43,bz+.028*Math.sin(a)])}tube(pts,.021,j===0?red:rope)}
 cylinder(X,7.57,bz,.069,.11,rope);
 for(let i=0;i<18;i++){const a=i*Math.PI*2/18;beam([X+.05*Math.cos(a),7.61,bz+.05*Math.sin(a)],[X+.12*Math.cos(a),7.31-rnd(i)*.06,bz+.12*Math.sin(a)],.012,rope,.012,true)}
 // Sacred rice-straw rope and folded paper over the door head.
 const ry=t=>9.58-.18*Math.sin(t*Math.PI);
 for(let j=0;j<2;j++){const pts=[];for(let i=0;i<=60;i++){const t=i/60,a=t*52+j*Math.PI;pts.push([X-1.52+t*3.04,ry(t)+.025*Math.sin(a),-52.48+.025*Math.cos(a)])}tube(pts,.028,rope)}
 for(let i=0;i<4;i++){const t=.15+i*.23,x=X-1.52+t*3.04,y=ry(t);const pts=[[0,0],[.13,-.13],[.03,-.24],[.16,-.37],[.07,-.51]];
  for(let k=0;k<4;k++){const a=pts[k],b=pts[k+1];beam([x+a[0],y+a[1],-52.52-k*.015],[x+b[0],y+b[1],-52.535-k*.015],.105,paper,.015)}
 }
 section('care_details');
 // A modest ema rack, safely off the central circulation line on the east porch.
 const ex=X+2.36,ez=-52.57;
 for(const dx of [-.53,.53]){box(ex+dx,F,ez,.09,1.14,.10,timber[0]);box(ex+dx,F,ez,.32,.06,.36,dark)}
 for(const y of [7.62,8.17])box(ex,y,ez,1.26,.075,.08,timber[2]);
 for(let row=0;row<2;row++)for(let i=0;i<4;i++){const x=ex-.42+i*.28,y=7.59+row*.53,z=ez-.075;const shape=new THREE.Shape();shape.moveTo(-.102,0);shape.lineTo(.102,0);shape.lineTo(.102,.14);shape.lineTo(0,.20);shape.lineTo(-.102,.14);shape.closePath();mesh(new THREE.ExtrudeGeometry(shape,{depth:.026,bevelEnabled:false}),timber[(i+row)%5],x,y-.30,z);tube([[x-.025,y-.10,z],[x,y+.05,z],[x+.025,y-.10,z]],.007,rope);for(let k=0;k<3;k++)box(x-.055+k*.052,y-.26,z-.006,.012,.07+.015*(k%2),.008,dark)}
 // Leaning broom, bound straw bristles, and a folded cleaning cloth.
 const bx=X-2.78,bz2=-52.57;
 beam([bx,7.27,bz2],[bx+.34,8.66,bz2+.19],.026,timber[2],.026,true);
 for(let i=0;i<23;i++){const a=(i-11)*.014;beam([bx+a*.4,7.57,bz2],[bx+a,7.17,bz2-.03+rnd(i)*.08],.008,rope,.008,true)}
 for(const y of [7.47,7.53])box(bx,y,bz2,.19,.024,.083,dark);
 box(X-2.02,F+.012,-52.40,.42,.045,.28,paper);box(X-2.02,F+.055,-52.43,.38,.028,.20,paper);
 // Assemble repeated small parts as instances to keep the composed island economical to render.
 for(const {geo,m,part,items} of batches.values()){const o=new THREE.InstancedMesh(geo,m,items.length);items.forEach((v,i)=>o.setMatrixAt(i,v));o.castShadow=true;o.receiveShadow=true;o.computeBoundingBox();o.computeBoundingSphere();part.add(o)}
 return g;
}
