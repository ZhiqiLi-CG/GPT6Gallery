import {heightAt, roadNetwork, layout} from './root.js';

// Published interior contract: all positions are world metres.
export function templeLayout(){return {
 terraceY:25.22, terrace:{rect:[-13,40,32,68]},
 hall:{x:1,z:56,baseY:25.22,rect:[-11,47,13,66],bodyW:16,bodyD:11},
 pagoda:{x:23,z:56,baseY:25.22,rect:[15,48,31,64],tiers:5,maxY:60},
 gate:{x:7,z:40,baseY:25.22}, bell:{x:-16,z:46,baseY:25.22},
 approach:{x:7,z0:36,z1:48,width:3.6},
 palette:{wood:0x70503a,darkWood:0x42352b,tile:0x47565d,stone:0x85877c,plaster:0xd0c5ac}
}}
export function build(THREE,ctx){
 const group=new THREE.Group();group.name='temple founded precinct';
 const shared=layout(),roads=roadNetwork(),L=templeLayout();
 const mats={};const batches={};
 function mat(name,c){mats[name]=new THREE.MeshStandardMaterial({color:c,roughness:0.92});batches[name]=[];return mats[name]}
 mat('foundation',0x716e61);mat('stone',0x85877c);mat('stone2',0x939286);mat('gravel',0xb5ae96);mat('paver',0xa3a193);mat('wood',0x70503a);mat('tile',0x47565d);
 const dummy=new THREE.Object3D();
 function box(name,x,y,z,w,h,d,ry=0){dummy.position.set(x,y+h/2,z);dummy.rotation.set(0,ry,0);dummy.scale.set(w,h,d);dummy.updateMatrix();batches[name].push(dummy.matrix.clone())}
 // Small solid foundation cells follow the unmodified hill. Their bottoms enter terrain.
 for(let x=-13;x<32;x+=1.5)for(let z=40;z<68;z+=1.4){
  const w=Math.min(1.5,32-x),d=Math.min(1.4,68-z),samples=[heightAt(x,z),heightAt(x+w,z),heightAt(x,z+d),heightAt(x+w,z+d),heightAt(x+w/2,z+d/2)];
  const bottom=Math.min(...samples)-0.25;
  box('foundation',x+w/2,bottom,z+d/2,w,L.terraceY-bottom,d);
  box('gravel',x+w/2,L.terraceY,z+d/2,w,.035,d);
 }
 // Surface is maintained open courtyard; architectural reservations are kept clear.
 // Continuous gravel over the founded cells; no artificial tile grid.
 // Central processional paving and eastward pagoda connection.
 for(let z=40.5;z<48;z+=0.8)for(let x=5.5;x<9;x+=0.8)box('paver',x,25.25,z,0.77,0.075,0.77);
 for(let x=-4;x<26;x+=0.85)for(let z=45;z<47.5;z+=0.85)box('paver',x,25.25,z,0.82,0.075,0.82);
 // Paved connection ends immediately before the child's first pagoda tread.
 for(let z=47.1;z<48.95;z+=.46)for(let x=21.65;x<24.8;x+=.64)box('paver',x,25.25,z,.615,.075,.44);
 function retaining(x,z,length,alongX){
  // Shared horizontal bed joints and alternating bond, clipped to the sampled slope.
  let low=25.32;for(let t=0;t<=length;t+=.5)low=Math.min(low,heightAt(x+(alongX?t:0),z+(alongX?0:t))-.4);
  for(let row=0,y=25.32-.48;y>low-.48;y-=.48,row++){
   for(let t=-(row%2)*.575;t<length;t+=1.15){const lo=Math.max(0,t),hi=Math.min(length,t+1.15);if(hi-lo<.06)continue;
    const xx=x+(alongX?(lo+hi)/2:0),zz=z+(alongX?0:(lo+hi)/2);
    if(!alongX&&x===-13&&zz>44.6&&zz<47.5)continue;
    const bottom=Math.max(y,heightAt(xx,zz)-.3),h=y+.45-bottom;if(h<=0)continue;
    box((row+Math.floor(t*7))%4?'stone':'stone2',xx,bottom,zz,alongX?hi-lo-.035:.67,h,alongX?.67:hi-lo-.035);
   }
  }
  for(let t=0;t<length;t+=1.15){const n=Math.min(1.15,length-t),xx=x+(alongX?t+n/2:0),zz=z+(alongX?0:t+n/2);if(!alongX&&x===-13&&zz>44.6&&zz<47.5)continue;box('stone2',xx,25.32,zz,alongX?n-.02:.88,.18,alongX?.88:n-.02)}
 }
 retaining(-13,40,28,false);retaining(32,40,28,false);retaining(-13,68,45,true);retaining(-13,40,17.1,true);retaining(9.9,40,22.1,true);
 // Broad approach treads meet the root endpoint without changing either road.
 const startY=heightAt(7,36)+0.19;
 for(let i=0;i<8;i++){const z=36+i*0.5,y=Math.max(startY+(25.30-startY)*Math.min(i+1,4)/4, heightAt(5.2,z+.5)+.24,heightAt(8.8,z+.5)+.24),bottom=Math.min(heightAt(5.2,z),heightAt(8.8,z))-0.15;box('stone',7,bottom,z+0.25,3.6,Math.max(0.12,y-bottom),0.5);box(i%2?'stone':'stone2',7,y,z+.25,3.6,.025,.47)}
 // Parent grounds construction. Pooled cylinders and foliage keep detailed geometry inexpensive.
 mat('dark',0x42352b);mat('endgrain',0x997653);mat('ridge',0x5a6870);mat('bronze',0x596658);mat('brass',0x95815a);mat('rope',0xb3a183);mat('soil',0x746e52);mat('moss',0x64714f);mat('pine',0x344e3c);mat('pineLight',0x486247);mat('bark',0x665142);mat('pink',0xd8a4ac);mat('pinkLight',0xe8bdc1);mat('water',0x647e79);mat('ash',0xc0b8a5);
 const pools={};
 const cylinder=new THREE.CylinderGeometry(1,1,1,9),sphere=new THREE.IcosahedronGeometry(1,1);
 function pooled(key,geo,material,x,y,z,sx,sy,sz,q){if(!pools[key])pools[key]={geo,material,m:[]};dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.quaternion.copy(q||new THREE.Quaternion());dummy.updateMatrix();pools[key].m.push(dummy.matrix.clone())}
 function rod(name,a,b,r){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),v=vb.clone().sub(va),mid=va.clone().add(vb).multiplyScalar(.5),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());pooled('rod'+name,cylinder,mats[name],mid.x,mid.y,mid.z,r,v.length(),r,q)}
 function ball(name,x,y,z,sx,sy,sz){pooled('ball'+name,sphere,mats[name],x,y,z,sx,sy,sz)}
 function mesh(geo,name,x,y,z){const m=new THREE.Mesh(geo,mats[name]);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);return m}
 function ring(name,x,y,z,r,t,vertical=false){const m=mesh(new THREE.TorusGeometry(r,t,7,22),name,x,y,z);if(!vertical)m.rotation.x=Math.PI/2;return m}
 // Solid foundation and individually coursed battered masonry for the bell terrace.
 for(let x=-19.3;x<-12.7;x+=1.1)for(let z=42.7;z<49.3;z+=1.1){const b=Math.min(heightAt(x,z),heightAt(x+1.1,z+1.1))-.3;box('foundation',x+.55,b,z+.55,1.1,25.22-b,1.1)}
 box('paver',-16,25.22,46,6.6,.10,6.6);
 for(const edge of [[-19.3,42.7,6.6,false],[-19.3,42.7,6.6,true],[-19.3,49.3,6.6,true]])retaining(...edge);
 for(let x=-16;x<-3.8;x+=.85)for(let z=45.2;z<47;z+=.85)box('paver',x,25.25,z,.82,.075,.82);
 // Broad, gently swept tiled gable roofs: continuous surfaces, round tile ribs, transverse courses,
 // fascia, paired end disks, raised ridge and exposed closely spaced underside rafters.
 function roof(cx,cz,w,d,eave,rise){
  const profile=t=>eave+rise*Math.pow(1-t,1.6)+.25*Math.pow(t,8);
  const rows=Math.ceil(d/.68),cols=Math.ceil(w/.36);
  for(const s of [-1,1]){
   const pos=[],ix=[];
   for(let i=0;i<=rows;i++){const t=i/rows;for(let j=0;j<=cols;j++)pos.push(cx-w/2+j*w/cols,profile(t),cz+s*t*d/2)}
   for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const k=i*(cols+1)+j;ix.push(k,k+1,k+cols+1,k+1,k+cols+2,k+cols+1)}
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(ix);geo.computeVertexNormals();const m=mesh(geo,'tile',0,0,0);m.material=mats.tile.clone();m.material.side=THREE.DoubleSide;
   const pans=[];
   for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)for(let f=0;f<3;f++){
    const u0=f/3,u1=(f+1)/3,t0=r/rows,t1=(r+1)/rows;
    const pt=(u,t,lip)=>[cx-w/2+(c+.025+.95*u)*w/cols,profile(t)+.027+.035*Math.pow(2*u-1,2)+lip,cz+s*t*d/2];
    const a=pt(u0,t0,.018),b=pt(u1,t0,.018),cc=pt(u1,t1,0),dd=pt(u0,t1,0);pans.push(...a,...b,...cc,...a,...cc,...dd);
   }
   const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(pans,3));pg.computeVertexNormals();const pm=mesh(pg,'tile',0,0,0);pm.material=m.material;
   for(let j=0;j<=cols;j++){const x=cx-w/2+j*w/cols;for(let i=0;i<rows;i++){const a=i/rows,b=(i+1)/rows;rod('ridge',[x,profile(a)+.06,cz+s*a*d/2],[x,profile(b)+.06,cz+s*b*d/2],.052)}
    rod('endgrain',[x,eave+.02,cz+s*(d/2-.08)],[x,eave+.02,cz+s*(d/2+.08)],.093);
   }
   for(let i=1;i<rows;i++){const t=i/rows;rod('ridge',[cx-w/2,profile(t)+.025,cz+s*t*d/2],[cx+w/2,profile(t)+.025,cz+s*t*d/2],.023)}
   for(let j=0;j<=Math.floor(w/.48);j++){const x=cx-w/2+j*.48;for(let i=0;i<4;i++){const a=i/4,b=(i+1)/4;rod('wood',[x,profile(a)-.20,cz+s*a*d/2],[x,profile(b)-.20,cz+s*b*d/2],.085)}}
   rod('dark',[cx-w/2,eave+.10,cz+s*d/2],[cx+w/2,eave+.10,cz+s*d/2],.13);
  }
  box('dark',cx,eave+rise-.22,cz,w+.2,.28,.35);rod('ridge',[cx-w/2-.22,eave+rise+.13,cz],[cx+w/2+.22,eave+rise+.13,cz],.16);
  for(const s of [-1,1]){const x=cx+s*w/2;rod('ridge',[x,eave+rise+.08,cz],[x+s*.32,eave+rise+.65,cz],.13);ball('ridge',x+s*.35,eave+rise+.64,cz,.2,.25,.17)}
 }
 function brackets(x,z,y){for(let n=0;n<3;n++){box('endgrain',x,y+n*.18,z,.5+n*.24,.16,.35);box('wood',x,y+n*.18+.1,z,.3,.16,.65+n*.24)}}
 // South gate. Four columns flank an unobstructed 4.9m opening; secondary posts brace the leaves.
 for(const x of [4.1,9.9])for(const z of [39.3,40.7]){
  const b=heightAt(x,z)-.2;box('stone',x,b,z,.85,25.45-b,.85);rod('wood',[x,25.45,z],[x,29.72,z],.25);ring('dark',x,25.65,z,.253,.035);brackets(x,z,29.55);
  rod('wood',[x,28.9,z],[x+(x<7?.65:-.65),29.7,z],.12);
 }
 for(const z of [39.3,40.7]){box('dark',7,29.3,z,6.6,.34,.35);box('wood',7,28.65,z,6.4,.24,.25)}
 box('dark',7,29.25,39.04,1.3,.75,.16);box('brass',7,29.35,38.94,.07,.50,.025);
 for(const x of [6.65,7.35])box('brass',x,29.43,38.94,.18,.35,.025);
 // Open doors are stowed lengthwise, visibly planked and iron-strapped.
 for(const x of [4.25,9.75]){box('dark',x,25.55,41.2,.17,2.65,2.4);for(let z=40.1;z<42.3;z+=.21)box('wood',x,25.61,z,.20,2.52,.19);for(const y of [26,27.4])box('bronze',x, y,41.2,.23,.11,2.35);for(const z of [40.15,42.25])for(const y of [26.05,27.45])ball('brass',x-.13,y,z,.06,.06,.06)}
 roof(7,40,9.1,5.0,30.02,1.9);
 // Low timber/plaster precinct enclosure above the south retaining wall.
 mat('plaster',0xc5b99d);
 for(const [a,b] of [[-12.8,4.1],[9.9,31.8]]){
  box('plaster',(a+b)/2,25.5,40,b-a,1.23,.40);box('dark',(a+b)/2,26.65,40,b-a,.16,.51);
  for(let x=a;x<b;x+=2.6)box('wood',x,25.5,40,.19,1.37,.55);
  for(let x=a;x<b;x+=.33){rod('tile',[x,26.9,39.58],[x,27.07,40],.075);rod('tile',[x,27.07,40],[x,26.9,40.42],.075)}
 }
 // Bell pavilion with complete planked floor, four framed sides, brackets and suspended bonsho.
 for(let z=43.4;z<48.7;z+=.24)box('wood',-16,25.35,z,5.3,.16,.225);
 for(const x of [-18.2,-13.8])for(const z of [43.8,48.2]){box('stone',x,25.32,z,.72,.4,.72);rod('wood',[x,25.72,z],[x,30.1,z],.23);brackets(x,z,29.86);
  rod('wood',[x,28.92,z],[x+(x<-16?.85:-.85),29.8,z],.12);rod('wood',[x,28.92,z],[x,29.8,z+(z<46?.85:-.85)],.12)}
 for(const z of [43.8,48.2])box('dark',-16,29.6,z,5.1,.33,.35);
 for(const x of [-18.2,-13.8])box('dark',x,29.6,46,.35,.33,5.1);
 box('dark',-16,30.0,46,4.8,.35,.42);roof(-16,46,6.8,6.6,30.4,1.9);
 const points=[[.82,0],[.87,.13],[.76,.27],[.73,1.1],[.61,1.6],[.40,1.8],[.16,1.85]].map(p=>new THREE.Vector2(...p));
 const bell=mesh(new THREE.LatheGeometry(points,36),'bronze',-16,27.35,46);bell.material=mats.bronze.clone();bell.material.side=THREE.DoubleSide;
 for(const y of [27.46,27.64,28.15,28.85])ring('bronze',-16,y,46,y<27.7?.82:.71,.045);
 for(let i=0;i<12;i++){const a=i*Math.PI/6;for(const y of [28.4,28.65,28.88])ball('brass',-16+Math.cos(a)*.69,y,46+Math.sin(a)*.69,.06,.06,.06)}
 ring('bronze',-16,29.40,46,.21,.06,true);rod('bronze',[-16,29.4,46],[-16,30.10,46],.055);
 rod('wood',[-18.35,27.97,45.1],[-15.55,27.97,45.1],.17);
 for(const x of [-17.95,-16.1])rod('rope',[x,27.97,45.1],[x,30.1,45.1],.026);
 // Bell terrace edge rails give the open pavilion a finished perimeter.
 for(const [a,b] of [[[-18.65,43.35],[-18.65,48.65]],[[-18.65,43.35],[-13.35,43.35]],[[-18.65,48.65],[-13.35,48.65]]]){
  const n=5;for(let i=0;i<=n;i++){const x=a[0]+(b[0]-a[0])*i/n,z=a[1]+(b[1]-a[1])*i/n;box('wood',x,25.50,z,.12,.91,.12);box('endgrain',x,26.39,z,.18,.09,.18)}
  for(const y of [25.84,26.28])rod('wood',[a[0],y,a[1]],[b[0],y,b[1]],.055);
 }
 // Hand-washing basin with hollow stone bowl, bamboo spout and ladles.
 box('stone',-5,25.28,43.05,2.25,.28,1.6);
 box('stone2',-5,25.56,43.05,1.75,.52,1.2);
 for(const x of [-5.88,-4.12])box('stone',x,26.08,43.05,.2,.3,1.4);
 for(const z of [42.42,43.68])box('stone',-5,26.08,z,1.95,.3,.18);
 box('water',-5,26.1,43.05,1.55,.015,1.02);
 rod('moss',[-6.35,25.3,43.5],[-6.35,27,43.5],.075);rod('moss',[-6.35,26.9,43.5],[-5.4,26.75,43.05],.068);
 for(const x of [-5.45,-4.8]){rod('wood',[x,26.43,42.38],[x,26.43,43.35],.025);ring('endgrain',x,26.46,43.35,.12,.045)}
 // Bronze incense vessel off the through-route, ash bed and short sticks.
 box('paver',1,25.26,44.1,2.25,.16,1.75);
 for(const a of [0,2.094,4.189])rod('bronze',[1+Math.cos(a)*.48,25.44,44.1+Math.sin(a)*.48],[1+Math.cos(a)*.66,26.08,44.1+Math.sin(a)*.66],.09);
 mesh(new THREE.LatheGeometry([[.40,0],[.73,.15],[.85,.65],[.82,.77]].map(p=>new THREE.Vector2(...p)),28),'bronze',1,25.86,44.1);ring('bronze',1,26.63,44.1,.82,.075);
 mesh(new THREE.CylinderGeometry(.73,.73,.04,28),'ash',1,26.53,44.1);
 for(let i=0;i<19;i++){const a=i*2.4,r=.1+.35*((i*7)%13)/13;rod('dark',[1+Math.cos(a)*r,26.54,44.1+Math.sin(a)*r],[1+Math.cos(a)*r,26.90+(i%3)*.08,44.1+Math.sin(a)*r],.012)}
 // Six stone lanterns, each with pedestal, shaft, windowed fire chamber, swept cap and finial.
 function lantern(x,z){const y=25.32;box('stone',x,y,z,1.0,.2,1.0);mesh(new THREE.CylinderGeometry(.36,.49,.28,8),'stone2',x,y+.34,z);mesh(new THREE.CylinderGeometry(.15,.21,1.05,8),'stone',x,y+1,z);box('stone2',x,y+1.5,z,.74,.14,.74);box('dark',x,y+1.66,z,.43,.42,.43);
  for(const xx of [-.28,.28])for(const zz of [-.28,.28])box('stone',x+xx,y+1.63,z+zz,.12,.55,.12);
  box('stone2',x,y+2.18,z,.86,.14,.86);const cap=mesh(new THREE.ConeGeometry(.73,.35,4),'stone',x,y+2.49,z);cap.rotation.y=Math.PI/4;ball('stone2',x,y+2.79,z,.14,.2,.14);
 }
 for(const p of [[2.6,42.2],[11.3,42.2],[14.1,48.0],[30.7,46.5],[-10.5,45.8],[14.1,65.5]])lantern(...p);
 // Raked gravel is continuous, with narrow parallel grooves around the court furniture.
 for(const [x0,z0,x1,z1] of [[-12,41.0,-7.3,44.8],[15,41.2,24.8,44.3],[-11.5,66.3,10.5,67.6],[15.7,64.8,29.6,67.2]]){
  for(let z=z0;z<z1;z+=.18)box('soil',(x0+x1)/2,25.265,z,x1-x0,.012,.025);
 }
 const petals=[];
 for(let k=0;k<5;k++){const a=k*Math.PI*2/5,c=Math.cos(a),s=Math.sin(a),p=[c*.12,s*.12,0],l=[c*.57-s*.31,s*.57+c*.31,.10],tip=[c,s,.04],r=[c*.57+s*.31,s*.57-c*.31,.10];petals.push(...p,...l,...tip,...p,...tip,...r)}
 const blossomGeo=new THREE.BufferGeometry();blossomGeo.setAttribute('position',new THREE.Float32BufferAttribute(petals,3));blossomGeo.computeVertexNormals();mats.pink.side=THREE.DoubleSide;mats.pinkLight.side=THREE.DoubleSide;
 function blossomCluster(name,x,y,z,r,seed){for(let k=0;k<18;k++){const a=k*2.39996+seed,v=1-2*(k+.5)/18,h=Math.sqrt(1-v*v),size=.067+.025*(1+Math.sin(k*8+seed)),q=new THREE.Quaternion().setFromEuler(new THREE.Euler(k*.71,seed+k*.57,k*.31));pooled('flowers'+name,blossomGeo,mats[name],x+r*h*Math.cos(a),y+r*v*.72,z+r*h*Math.sin(a),size,size,size,q)}}
 // Branching garden trees, irregular foliage clusters and rooted peripheral understory.
 function tree(x,z,h,cherry,seed){const y=x>=-13&&x<=32&&z>=40&&z<=68?25.3:heightAt(x,z);const trunkTop=[x+.3,y+h*.68,z-.25];rod('bark',[x,y-.10,z],trunkTop,.23);
  for(let i=0;i<7;i++){const a=i*2.4+seed,rr=(cherry?1.6:1.85)+.32*Math.sin(i*9),yy=y+h*(.48+.06*i),end=[x+Math.cos(a)*rr,yy,z+Math.sin(a)*rr];rod('bark',[x+.2,y+h*.36+i*.26,z-.12],end,.095-i*.007);
   for(let j=0;j<42;j++){const aa=a+j*2.39996,r=1.05*Math.sqrt((j+.5)/42),xx=end[0]+Math.cos(aa)*r,zz=end[2]+Math.sin(aa)*r,sz=.22+.09*(1+Math.sin(j*7+i));if(cherry){const yy=end[1]+.2+Math.sin(j*9)*.24+(1-r)*.34;blossomCluster(j%3?'pink':'pinkLight',xx,yy,zz,sz,j+i+seed);if(j%7===0)rod('bark',end,[xx,yy,zz],.025)}else ball(j%3?'pine':'pineLight',xx,end[1]+.2+Math.sin(j*9)*.24+(1-r)*.34,zz,sz*1.5,sz*.48,sz*1.25)}
  }
  for(let i=0;i<5;i++){const a=i*1.25;rod('bark',[x,y+.3,z],[x+Math.cos(a)*.65,y+.02,z+Math.sin(a)*.65],.075)}
 }
 tree(-9,42.6,5.4,true,1);tree(28,42.8,5.8,true,3);tree(-18.1,60,6.2,true,5);
 for(const p of [[-18,69,7.0,2],[-8,72,6.5,5],[10,72,7.0,7],[29,71,7.5,9]])tree(p[0],p[1],p[2],false,p[3]);
 for(let i=0;i<70;i++){const x=-19.5+(i%14)*3.8+.8*Math.sin(i*7.3),z=69.6+Math.floor(i/14)*1.1+.65*Math.cos(i*4.7);if(x>31||z<68.7)continue;const y=heightAt(x,z);for(let k=0;k<5;k++){const xx=x+.35*Math.sin(k*3+i),zz=z+.35*Math.cos(k*4+i);ball(i%3?'moss':'pineLight',xx,heightAt(xx,zz)+.18,zz,.27,.22,.26)}}
 for(const [x,z] of [[-10,42],[-8.4,43],[27.2,42],[28.9,44],[-18,62],[-17,67],[12,70],[30,70]]){const y=x>=-13&&x<=32&&z<=68?25.3:heightAt(x,z);ball('stone',x,y+.34,z,.67,.51,.48);ball('moss',x-.1,y+.63,z,.32,.10,.27)}
 // Fallen petals and a broom/rake indicate routine courtyard care.
 for(let i=0;i<95;i++){const x=28+Math.sin(i*6.1)*(1.0+i%5*.29),z=42.8+Math.cos(i*3.1)*(1+i%4*.35);ball(i%2?'pink':'pinkLight',x,25.31,z,.06,.016,.045)}
 rod('wood',[-11.8,25.34,42.3],[-11.3,27.4,42.6],.035);box('wood',-11.8,25.36,42.3,.65,.08,.11);for(let x=-12.1;x<-11.5;x+=.09)rod('dark',[x,25.36,42.3],[x,25.27,42.1],.017);
 for(const {geo,material,m} of Object.values(pools)){const inst=new THREE.InstancedMesh(geo,material,m.length);m.forEach((v,i)=>inst.setMatrixAt(i,v));inst.castShadow=true;inst.receiveShadow=true;group.add(inst)}

 // Architecture now belongs entirely to the two child modules.
 for(const name of Object.keys(batches)){if(!batches[name].length)continue;const m=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mats[name],batches[name].length);batches[name].forEach((v,i)=>m.setMatrixAt(i,v));m.castShadow=true;m.receiveShadow=true;group.add(m)}
 return group;
}
