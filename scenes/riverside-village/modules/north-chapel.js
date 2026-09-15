import { heightAt, roadNetwork, layout, claimDistrict } from './root.js';

// A hillside chapel and one coherent, terrain-following churchyard.
export function build(THREE, ctx) {
  claimDistrict('north-bank');
  const g=new THREE.Group();g.name='north-chapel — Saint Anne chapel and churchyard';
  const M=c=>new THREE.MeshStandardMaterial({color:c,roughness:.91});
  const stone=M(0xb7b29e), trim=M(0xd0c8b1), footing=M(0x8f9082), mortar=M(0x929184);
  const slate=[M(0x536169),M(0x59676e),M(0x5e6c72),M(0x505e65)];
  const wood=M(0x685039),iron=M(0x373d39),glass=M(0x344c51),gold=M(0xb79951);
  const pathMat=new THREE.MeshStandardMaterial({color:0xc0b398,roughness:1,side:THREE.DoubleSide});
  const moss=M(0x738552),grass=M(0x8b9f62);
  let seed=721;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  function mesh(geo,m,x,y,z,parent=g){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  const box=(w,h,d,m,x,y,z,parent=g)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,parent);
  function beam(a,b,r,m,parent=g){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);const o=mesh(new THREE.CylinderGeometry(r,r,v.length(),7),m,...av.clone().add(bv).multiplyScalar(.5).toArray(),parent);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
  const site=layout().chapel, X=site.x, Z=site.z+5, W=site.w-1, D=site.d-4;
  const x0=X-W/2,x1=X+W/2,z0=Z-D/2,z1=Z+D/2;
  const corners=[[x0,z0],[x0,z1],[x1,z0],[x1,z1]].map(([x,z])=>heightAt(x,z));
  const base=Math.max(...corners)+.25,low=Math.min(...corners)-.55,wallH=7.4,eave=base+wallH,rise=4.2;
  box(W+.6,base-low,D+.6,footing,X,(base+low)/2,Z);
  box(W,wallH,D,stone,X,base+wallH/2,Z);
  box(W+.38,.32,D+.38,trim,X,base+.12,Z);
  // Complete gable ends, with continuous roof planes and individually staggered slate courses.
  const shape=new THREE.Shape();shape.moveTo(-W/2,0);shape.lineTo(W/2,0);shape.lineTo(0,rise);shape.closePath();
  mesh(new THREE.ExtrudeGeometry(shape,{depth:D,bevelEnabled:false}),stone,X,eave,z0);
  const half=W/2+.65,rr=rise+.28,slant=Math.hypot(half,rr),pitch=Math.atan2(rr,half),length=D+1.4;
  for(const s of [-1,1]){
    const o=box(slant,.22,length,slate[0],X+s*half/2,eave+rr/2,Z);o.rotation.z=-s*pitch;
    const rows=9,cols=16;
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      const f=(r+.5)/rows,zz=Z-length/2+(c+.5)*length/cols;
      const t=box(slant/rows+.025,.065,length/cols-.04,slate[Math.floor(rnd()*4)],X+s*half*f,eave+rr*(1-f)+.17,zz);
      t.rotation.z=-s*pitch;
    }
    box(.25,.36,length+.1,wood,X+s*half,eave-.01,Z);
    for(const zz of [z0-.69,z1+.69])beam([X,eave+rr+.17,zz],[X+s*half,eave+.17,zz],.13,trim);
  }
  box(.38,.25,length+.2,slate[2],X,eave+rr+.2,Z);
  // Arched surface openings with voussoirs, jambs and glazing bars.
  function opening(x,y,z,w,h,rot,material=glass){
    const p=new THREE.Group();p.position.set(x,y,z);p.rotation.y=rot;g.add(p);
    const r=w/2,sh=new THREE.Shape();sh.moveTo(-r,0);sh.lineTo(r,0);sh.lineTo(r,h-r);sh.absarc(0,h-r,r,0,Math.PI,false);sh.closePath();
    mesh(new THREE.ExtrudeGeometry(sh,{depth:.09,bevelEnabled:false}),material,0,0,0,p);
    for(const s of [-1,1])box(.24,h-r,.3,trim,s*(r+.12),(h-r)/2,.05,p);
    for(let i=0;i<9;i++){const a=(i+.5)*Math.PI/9,o=box(.3,.36,.32,trim,Math.cos(a)*(r+.14),h-r+Math.sin(a)*(r+.14),.07,p);o.rotation.z=a-Math.PI/2;}
    box(w+.6,.23,.48,trim,0,-.08,.10,p);
    if(material===glass){box(.09,h-.16,.11,trim,0,h/2,.13,p);box(w-.1,.075,.11,trim,0,h*.46,.13,p);}
    return p;
  }
  for(const s of [-1,1])for(const zz of [Z-4.2,Z+.1,Z+4.4]){
    opening(X+s*(W/2+.025),base+2.05,zz,1.45,3.35,s*Math.PI/2);
  }
  opening(X,base+2.1,z1+.03,2.5,4.2,0);
  for(const s of [-1,1])for(const zz of [z0+.45,Z-2.1,Z+2.25,z1-.45]){
    const xx=X+s*(W/2+.38),ground=heightAt(xx,zz)-.3;
    box(.95,base+5.9-ground,1.05,stone,xx,(base+5.9+ground)/2,zz);
    box(1.18,.28,1.3,trim,xx,base+5.9,zz);
    box(1.25,.9,1.5,footing,xx,ground+.45,zz);
  }
  // Sparse masonry courses add believable scale without turning the wall into stripes.
  for(const s of [-1,1])for(let row=0;row<11;row++)for(let j=0;j<13;j++){
    const zz=z0+.45+j*1.3+(row%2)*.36;if(zz>z1-.25)continue;
    const yy=base+.55+row*.61;
    if([Z-4.2,Z+.1,Z+4.4].some(v=>Math.abs(v-zz)<1.05)&&yy>base+1.7&&yy<base+5.7)continue;
    if(rnd()<.45)box(.035,.045,.8+rnd()*.35,mortar,X+s*(W/2+.025),yy,zz);
  }
  // Square westwork tower with a genuinely open four-sided bell chamber.
  const TZ=site.z-1,tw=5.25,td=5.3,front=TZ-td/2;
  const tc=[[-1,-1],[-1,1],[1,-1],[1,1]].map(([a,b])=>heightAt(X+a*tw/2,TZ+b*td/2));
  const tlow=Math.min(...tc)-.55;
  box(tw+.45,base-tlow,td+.45,footing,X,(base+tlow)/2,TZ);
  const stage=base+12;
  box(tw,12,td,stone,X,base+6,TZ);
  for(const yy of [base+.3,base+6.6,stage-.3])box(tw+.4,.3,td+.4,trim,X,yy,TZ);
  // Corner quoins extend around all four corners.
  for(let j=0;j<18;j++)for(const s of [-1,1])for(const t of [-1,1])box(.65,.47,.65,j%3===0?footing:trim,X+s*(tw/2-.22),base+.4+j*.65,TZ+t*(td/2-.22));
  const door=opening(X,base+.05,front-.035,2.35,3.8,Math.PI,wood);
  for(let j=-3;j<=3;j++)box(.025,2.55,.04,iron,j*.29,1.34,.14,door);
  for(const y of [.8,2.2])box(2.1,.12,.08,iron,0,y,.17,door);
  mesh(new THREE.TorusGeometry(.12,.035,6,12),gold,-.34,1.5,.23,door);
  opening(X,base+7.8,front-.03,1.1,2.05,Math.PI);
  for(const s of [-1,1])opening(X+s*(tw/2+.03),base+7.8,TZ,1.05,2.05,s*Math.PI/2);
  const openingH=3.45,pier=.72;
  for(const s of [-1,1])for(const t of [-1,1])box(pier,openingH,pier,trim,X+s*(tw-pier)/2,stage+openingH/2,TZ+t*(td-pier)/2);
  // Curved arch stones on all four faces; chamber remains empty around the suspended bell.
  for(let side=0;side<4;side++){
    const p=new THREE.Group();p.position.set(X,stage,TZ);p.rotation.y=side*Math.PI/2;g.add(p);
    const r=(tw-2*pier)/2;
    for(let i=0;i<11;i++){const a=(i+.5)*Math.PI/11,o=box(.36,.48,.62,stone,Math.cos(a)*(r+.08),1.5+Math.sin(a)*(r+.08),td/2-pier/2,p);o.rotation.z=a-Math.PI/2;}
    box(tw,.44,.75,trim,0,openingH-.12,td/2-pier/2,p);
  }
  box(tw+.5,.35,td+.5,trim,X,stage+openingH+.1,TZ);
  box(3.8,.28,.28,wood,X,stage+2.95,TZ);
  beam([X,stage+2.98,TZ],[X,stage+2.3,TZ],.1,iron);
  const profile=[[.87,0],[.94,.16],[.73,.33],[.54,.68],[.44,1.12],[.22,1.3],[0,1.32]].map(([a,b])=>new THREE.Vector2(a,b));
  mesh(new THREE.LatheGeometry(profile,24),gold,X,stage+.9,TZ);
  beam([X,stage+.95,TZ],[X,stage+.52,TZ],.065,iron);
  mesh(new THREE.SphereGeometry(.14,9,7),iron,X,stage+.5,TZ);
  const capY=stage+openingH+.28;
  const cap=mesh(new THREE.ConeGeometry(4.15,2.7,4),slate[1],X,capY+1.35,TZ);cap.rotation.y=Math.PI/4;
  const crossY=capY+2.6;
  box(.33,3.65,.33,iron,X,crossY+1.7,TZ);
  box(2.45,.33,.33,iron,X,crossY+2.4,TZ);
  // Front stair rises from approach grade to the shared level nave/tower floor.
  const stairEnd=front-.03,stairStart=stairEnd-4.2,nsteps=7;
  const startGround=heightAt(X,stairStart)+.23;
  for(let i=0;i<nsteps;i++){
    const zz=stairStart+(i+.5)*(stairEnd-stairStart)/nsteps,top=startGround+(base+.1-startGround)*(i+1)/nsteps;
    const bottom=heightAt(X,zz)-.25;
    box(3.7,top-bottom,(stairEnd-stairStart)/nsteps+.035,trim,X,(top+bottom)/2,zz);
  }
  // Ground-conforming maintained paths; gate position interpolates the actual root approach.
  function path(points,width){const v=[],ix=[];
    for(let k=0;k<points.length-1;k++){const a=points[k],b=points[k+1],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),n=Math.ceil(len/.7);
      for(let j=0;j<n;j++){let o=v.length/3;for(const [t,s]of [[j/n,-1],[j/n,1],[(j+1)/n,-1],[(j+1)/n,1]]){const x=a[0]+dx*t-dz/len*s*width/2,z=a[1]+dz*t+dx/len*s*width/2;v.push(x,heightAt(x,z)+.27,z);}ix.push(o,o+2,o+1,o+1,o+2,o+3);}}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(ix);geo.computeVertexNormals();mesh(geo,pathMat,0,0,0);
  }
  const enclosure=layout().exclusions.chapel,west=enclosure[0]+1,east=enclosure[2]-1,south=enclosure[1]+1,north=enclosure[3]-1;
  const route=roadNetwork().find(r=>r.id==='chapel-path');
  let gateX=X;for(let i=1;i<route.points.length;i++){const a=route.points[i-1],b=route.points[i];if(a[1]<=south&&b[1]>=south)gateX=a[0]+(b[0]-a[0])*(south-a[1])/(b[1]-a[1]);}
  path([[gateX,south],[X,stairStart]],3.5);
  path([[X-1,90],[107.7,93],[107.7,114.8],[125,114.8],[125,93],[X,90]],1.3);
  path([[125,99],[131.5,99]],1);path([[125,107],[131.5,107]],1);
  function wall(a,b){const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),n=Math.ceil(len/1.5);
    for(let i=0;i<n;i++){const x=a[0]+dx*(i+.5)/n,z=a[1]+dz*(i+.5)/n,l=len/n;
      const hs=[heightAt(x-dx/n/2,z-dz/n/2),heightAt(x+dx/n/2,z+dz/n/2)];const lo=Math.min(...hs)-.3,top=Math.max(...hs)+1.05;
      const o=box(l+.025,top-lo,.65,stone,x,(top+lo)/2,z);o.rotation.y=-Math.atan2(dz,dx);
      const c=box(l+.07,.19,.82,trim,x,top+.08,z);c.rotation.y=o.rotation.y;
      for(let row=0;row<2;row++){const d=box(l-.05,.045,.668,mortar,x,top-.34-row*.35,z);d.rotation.y=o.rotation.y;}
    }
  }
  const gap=4.6;
  wall([west,south],[gateX-gap/2,south]);wall([gateX+gap/2,south],[east,south]);
  wall([west,south],[west,north]);wall([east,south],[east,north]);wall([west,north],[east,north]);
  for(const s of [-1,1]){
    const px=gateX+s*gap/2,yy=heightAt(px,south);
    box(.95,1.9,.95,footing,px,yy+.8,south);box(1.15,.25,1.15,trim,px,yy+1.85,south);
    // Both iron leaves stand open inside the enclosure.
    const p=new THREE.Group();p.position.set(px,yy+.2,south);p.rotation.y=s*.98;g.add(p);
    const dir=-s;for(let j=0;j<=6;j++)box(.07,1.2,.07,iron,dir*j*.31,.65,0,p);
    for(const y of [.25,1.1])box(1.95,.08,.08,iron,dir*.96,y,0,p);
  }
  // Grave plots have borders, lightly raised earth, varied markers and inset inscription plaques.
  const soil=M(0x827e63),letter=M(0x77796e);
  const plots=[];for(const x of [128,131])for(const z of [94.5,102.5,110.5])plots.push([x,z]);for(const z of [98,104,110])plots.push([105,z]);
  for(let i=0;i<plots.length;i++){
    const [x,z]=plots[i],yy=heightAt(x,z);
    const plotGeo=new THREE.PlaneGeometry(1.45,2.5,2,4);plotGeo.rotateX(-Math.PI/2);
    const pp=plotGeo.attributes.position;for(let j=0;j<pp.count;j++)pp.setY(j,heightAt(x+pp.getX(j),z+pp.getZ(j))+.13);
    plotGeo.computeVertexNormals();mesh(plotGeo,grass,x,0,z);
    for(const sx of [-.77,.77])for(let j=0;j<4;j++){const zz=z-1+j*.67;box(.12,.2,.67,footing,x+sx,heightAt(x+sx,zz)+.06,zz);}
    const mz=z+1.05,my=heightAt(x,mz);
    box(1.05,.22,.6,footing,x,my+.07,mz);
    if(i%3===0){box(.25,1.6,.24,trim,x,my+.85,mz);box(.95,.24,.24,trim,x,my+1.25,mz);}
    else {box(.86,1.18,.22,i%2?trim:footing,x,my+.66,mz);const top=mesh(new THREE.CylinderGeometry(.43,.43,.22,14),i%2?trim:footing,x,my+1.21,mz);top.rotation.x=Math.PI/2;
      for(let l=0;l<3;l++)box(.45-l*.06,.028,.025,letter,x,my+.6+l*.14,mz-.125);}
    if(i%2===0)for(let j=0;j<4;j++)mesh(new THREE.DodecahedronGeometry(.13),M(j%2?0xc8bb84:0xaaa4b1),x+(rnd()-.5)*.6,yy+.24,z-.5+rnd()*.4);
  }
  // Resting bench faces the chapel from the southeast corner.
  const bx=129,bz=88.8,by=Math.max(heightAt(127.5,bz),heightAt(130.5,bz));
  for(const x of [bx-1.15,bx+1.15])for(const z of [bz-.35,bz+.35])box(.15,by+.72-heightAt(x,z)+.1,.15,iron,x,(by+.72+heightAt(x,z)-.1)/2,z);
  for(let i=0;i<3;i++)box(3,.14,.22,wood,bx,by+.77,bz-.29+i*.29);
  for(const x of [bx-1.15,bx+1.15])box(.13,1.1,.13,iron,x,by+1.1,bz-.43);
  for(let i=0;i<2;i++)box(3,.23,.13,wood,bx,by+1.24+i*.3,bz-.43);
  // Two small yews retain clear sightlines to the tower and yard.
  for(const [x,z,h]of [[105,115,5.3],[131,115,4.7]]){
    const yy=heightAt(x,z);mesh(new THREE.CylinderGeometry(.18,.28,h*.6,7),wood,x,yy+h*.3,z);
    for(let j=0;j<3;j++)mesh(new THREE.ConeGeometry(1.4-j*.27,h*.63,9),M(0x496348),x,yy+h*.46+j*.7,z);
    for(let i=0;i<7;i++){const a=i*Math.PI*2/7;mesh(new THREE.DodecahedronGeometry(.3),moss,x+Math.cos(a)*.7,yy+.13,z+Math.sin(a)*.7);}
  }
  return g;
}
