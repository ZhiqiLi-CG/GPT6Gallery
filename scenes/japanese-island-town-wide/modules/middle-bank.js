import {heightAt,streamX,streamWater,roadNetwork,layout} from './root.js';
export function build(THREE,ctx){
 const root=new THREE.Group();root.name='middle-bank';let seed=43197;
 const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const range=(a,b)=>a+(b-a)*rand(), V=(x,y,z)=>new THREE.Vector3(x,y,z);
 const mat=(c)=>new THREE.MeshStandardMaterial({color:c,roughness:.94});
 const stone=[0x747770,0x83847a,0x656e68,0x979589].map(mat),wood=[0x81735b,0x736650,0x94836b].map(mat),bark=mat(0x62564a),moss=mat(0x626f40),greens=[0x4e6545,0x687951,0x79865b].map(mat),pine=mat(0x3f5846),pink=[0xcda5a3,0xd9b9b1,0xb79192].map(mat),iron=mat(0x474941),rope=mat(0x9b906a),bamboo=mat(0x929366),water=mat(0x6f9690),foam=mat(0xa9c2b5);bamboo.side=THREE.DoubleSide;
 const group=(name,kind)=>{const g=new THREE.Group();g.name='middle-bank_'+name;g.userData.kind=kind;root.add(g);return g};
 const mesh=(g,geo,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o};
 const box=(g,x,y,z,w,h,d,m)=>mesh(g,new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const beam=(g,a,b,r,m,r2=r)=>{a=V(...a);b=V(...b);const q=mesh(g,new THREE.CylinderGeometry(r2,r,a.distanceTo(b),8),m);q.position.copy(a.clone().add(b).multiplyScalar(.5));q.quaternion.setFromUnitVectors(V(0,1,0),b.sub(a).normalize());return q};
 const tube=(g,pts,r,m)=>mesh(g,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>V(...p))),Math.max(8,pts.length*4),r,5,false),m);
 const ico=new THREE.IcosahedronGeometry(1,1);const pos=ico.attributes.position;for(let i=0;i<pos.count;i++){const f=range(.86,1.12);pos.setXYZ(i,pos.getX(i)*f,pos.getY(i)*f,pos.getZ(i)*f)}ico.computeVertexNormals();
 const batches=new Map();
 function instance(g,geo,m,x,y,z,sx,sy,sz,ry=0){const key=g.name+':'+geo.uuid+':'+m.uuid;if(!batches.has(key))batches.set(key,{g,geo,m,items:[]});batches.get(key).items.push({x,y,z,sx,sy,sz,ry});}
 const roads=roadNetwork(),lots=layout().lots;
 function clear(x,z,r=0){if(z-r < -19 || z+r>27 || Math.abs(x-streamX(z))+r>8)return false;if(lots.some(p=>Math.abs(x-p.x)<p.w/2+r&&Math.abs(z-p.z)<p.d/2+r))return false;for(const road of roads)for(let i=1;i<road.points.length;i++){const a=road.points[i-1],b=road.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));if(Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)<road.width/2+.35+r)return false}return true}
 const pathX=z=>streamX(z)+5.05+.20*Math.sin(z*.27);
 const deckX=streamX(4)+3.7;
 function occupied(x,z,r=0){return Math.abs(x-pathX(z))<.56+r|| (Math.abs(z-4)<1.9+r&&x>deckX-1.35-r&&x<pathX(z)+.6+r)}
 function rock(g,x,z,s=.3){const h=heightAt(x,z),sy=s*range(.55,.95);instance(g,ico,stone[Math.floor(rand()*stone.length)],x,h+sy*.18,z,s,sy,s*range(.6,1.3),rand()*6.28);if(s>.35&&rand()<.7)instance(g,ico,moss,x-.06,h+sy*.82,z,s*.7,.035,s*.55,rand()*6.28)}
 // Each gravel lens follows the owner's sampled surface rather than covering it with a slab.
 function patch(g,x,z,rx,rz,m){const a=[],ix=[];a.push(x,heightAt(x,z)+.021,z);for(let k=0;k<=18;k++){const t=k/18*Math.PI*2,xx=x+rx*Math.cos(t),zz=z+rz*Math.sin(t);a.push(xx,heightAt(xx,zz)+.018,zz);if(k)ix.push(0,k+1,k)}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(a,3));geo.setIndex(ix);geo.computeVertexNormals();mesh(g,geo,m)}
 const bankGroups=[];
 for(const side of [-1,1]){const g=group(side<0?'west_bank':'east_bank','pebbly-bank-boulders-moss-reeds');bankGroups.push(g);
  for(let i=0;i<2100;i++){const z=range(-18.8,26.8);if(rand()>Math.min(1,z+19,27-z))continue;const off=range(2.38,4.7),x=streamX(z)+side*off,s=range(.035,.135);if(!clear(x,z,s)||side>0&&occupied(x,z,s))continue;rock(g,x,z,s)}
  for(let i=0;i<125;i++){const z=range(-18.6,26.6),off=range(2.48,4.45),x=streamX(z)+side*off,s=range(.19,.57);if(clear(x,z,s*1.5)&&!(side>0&&occupied(x,z,s)))rock(g,x,z,s)}
  for(let i=0;i<75;i++){const z=range(-18,26),x=streamX(z)+side*range(3.1,6.6);if(!clear(x,z,.3)||side>0&&occupied(x,z,.35))continue;patch(g,x,z,range(.15,.35),range(.2,.55),moss)}
  const blades=[],bi=[];
  for(let c=0;c<125;c++){const z=range(-18.4,26.4),x=streamX(z)+side*range(2.38,4.4);if(!clear(x,z,.3)||side>0&&occupied(x,z,.38)||rand()>Math.min(1,z+19,27-z))continue;for(let b=0;b<10;b++){const xx=x+range(-.17,.17),zz=z+range(-.17,.17),y=heightAt(xx,zz),h=range(.32,.92),ang=rand()*6.28,dx=Math.cos(ang),dz=Math.sin(ang),w=range(.015,.035),lean=range(.14,.34),k=blades.length/3;blades.push(xx-dz*w,y,zz+dx*w,xx+dz*w,y,zz-dx*w,xx+dx*lean*.4-dz*w*.55,y+h*.6,zz+dz*lean*.4+dx*w*.55,xx+dx*lean*.4+dz*w*.55,y+h*.6,zz+dz*lean*.4-dx*w*.55,xx+dx*lean,y+h,zz+dz*lean);bi.push(k,k+2,k+1,k+1,k+2,k+3,k+2,k+4,k+3);}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(blades,3));geo.setIndex(bi);geo.computeVertexNormals();const reedmat=greens[side<0?1:2].clone();reedmat.side=THREE.DoubleSide;mesh(g,geo,reedmat);
 }
 const path=group('bank_path','informal-path-with-stone-edging');const p=[],pi=[];
 for(let i=0;i<=184;i++){const z=-19+i*.25,x=pathX(z);for(const s of [-1,1]){const xx=x+s*(.45+.04*Math.sin(z*2));p.push(xx,heightAt(xx,z)+.035,z)}if(i){const k=i*2;pi.push(k-2,k,k-1,k-1,k,k+1)}if(i%3===0&&i>3&&i<181)for(const s of [-1,1]){const xx=x+s*.61;if(z>1.9&&z<6&&s<0)continue;rock(path,xx,z,range(.08,.15))}}
 const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(p,3));pg.setIndex(pi);pg.computeVertexNormals();mesh(path,pg,mat(0x9a957d));
 for(let i=0;i<320;i++){const z=range(-18.8,26.8),x=pathX(z)+range(-.42,.42);instance(path,ico,stone[i%4],x,heightAt(x,z)+.035,z,.015,.008,.025,rand()*6)}
 // Rooted, branching trees with twig-level leaf or blossom sprays.
 function tree(z,side,isCherry,scale){const x=streamX(z)+side*(side>0?6.8:5.5),y=heightAt(x,z),g=group('tree_'+z.toString().replace('-','m'),isCherry?'rooted-cherry-tree':'rooted-small-pine');const h=scale,tip=[x+.2,y+h,z+.1];beam(g,[x,y-.16,z],tip,.19,bark,.075);
  for(let j=0;j<7;j++){const a=j*6.28/7,xx=x+Math.cos(a)*.75,zz=z+Math.sin(a)*.75;tube(g,[[x,y+.17,z],[x+Math.cos(a)*.3,heightAt(x+Math.cos(a)*.3,z+Math.sin(a)*.3)+.08,z+Math.sin(a)*.3],[xx,heightAt(xx,zz)+.018,zz]],.055,bark)}
  for(let j=0;j<(isCherry?10:12);j++){const ang=j*2.399,level=.35+j*.045,len=isCherry?range(.65,1.4):range(.5,1.25)*(1-j*.03),ax=x+.12,ay=y+h*level,az=z,tx=ax+Math.cos(ang)*len*(side>0?.48:1),ty=ay+range(.3,.8),tz=az+Math.sin(ang)*len;beam(g,[ax,ay,az],[tx,ty,tz],.075,bark,.022);
   for(let k=0;k<5;k++){const a=ang+range(-1.5,1.5),ex=tx+Math.cos(a)*.42*(side>0?.48:1),ey=ty+range(.12,.5),ez=tz+Math.sin(a)*.42;beam(g,[tx,ty,tz],[ex,ey,ez],.022,bark,.007);for(let b=0;b<(isCherry?18:15);b++){const xx=ex+range(-.33,.33),yy=ey+range(-.13,.25),zz=ez+range(-.33,.33);instance(g,ico,isCherry?(b%4===0?greens[0]:pink[b%3]):pine,Math.max(streamX(zz)-7.7,Math.min(streamX(zz)+7.7,xx)),yy,zz,isCherry?.085:.12,isCherry?.065:.045,isCherry?.08:.18,rand()*6.28)}}
  }
 }
 tree(-13,-1,true,3.5);tree(-5,1,false,3.0);tree(1,-1,false,3.3);tree(11,-1,true,3.9);tree(17,1,true,3.0);tree(23,-1,false,3.5);
 // Small work deck on the east bank; all timbers supported above actual ground.
 const work=group('washing_platform','supported-washing-deck-tub-bucket-ladle-rope-bamboo-chute');const x=deckX,z=4,w=2.2,d=2.6;
 const top=Math.max(...[-1,1].flatMap(a=>[-1,1].map(b=>heightAt(x+a*w/2,z+b*d/2))))+.32;
 for(const dx of [-.9,.9])for(const dz of [-1.1,1.1]){const xx=x+dx,zz=z+dz,h=heightAt(xx,zz);box(work,xx,(h-.25+top-.1)/2,zz,.15,top-.1-h+.25,.15,wood[1]);rock(work,xx,zz,.22)}
 for(const dz of [-1.1,0,1.1])box(work,x,top-.19,z+dz,w,.19,.14,wood[1]);
 for(const dx of [-.87,.87]){box(work,x+dx,top-.28,z,.13,.19,d,wood[1]);beam(work,[x+dx,top-.62,z-1.1],[x+dx,top-.17,z-.35],.047,wood[1]);}
 for(let i=0;i<11;i++){const xx=x-w/2+(i+.5)*w/11;box(work,xx,top-.045,z,w/11-.016,.09,d,wood[i%3]);for(const dz of [-1.1,1.1]){mesh(work,new THREE.CylinderGeometry(.018,.018,.009,6),iron,xx,top+.006,z+dz)}for(let k=0;k<2;k++)box(work,xx+range(-.06,.06),top+.002,z+range(-.7,.7),.007,.003,range(.2,.55),wood[1]);}
 // Two short supported treads down to the walking path.
 for(let i=0;i<2;i++){const xx=x+1.21+i*.26,yy=top-(i+1)*.12;box(work,xx,yy-.06,z,.28,.12,.88,wood[2]);for(const dz of [-.32,.32]){const ground=heightAt(xx,z+dz);box(work,xx,(ground+yy-.08)/2,z+dz,.10,Math.max(.05,yy-.08-ground),.10,wood[1])}}
 function hoop(cx,cy,cz,r,m,t=.02){const o=mesh(work,new THREE.TorusGeometry(r,t,6,32),m,cx,cy,cz);o.rotation.x=Math.PI/2;return o}
 function tub(cx,cz,r,h){const cy=top+.01;mesh(work,new THREE.CylinderGeometry(r*.88,r*.88,.045,24),wood[1],cx,cy+.023,cz);for(let j=0;j<20;j++){const a=j*6.28/20,rr=r*.94;const o=box(work,cx+Math.cos(a)*rr,cy+h/2,cz+Math.sin(a)*rr,r*.305,h,.045,wood[j%3]);o.rotation.y=-a+Math.PI/2;}hoop(cx,cy+h*.2,cz,r,iron);hoop(cx,cy+h*.82,cz,r,iron);mesh(work,new THREE.CylinderGeometry(r*.87,r*.87,.012,24),water,cx,cy+h*.39,cz);return cy+h;}
 const tubY=tub(x-.45,z+.62,.37,.45);tub(x+.48,z+.77,.19,.30);
 tube(work,[[x+.29,top+.29,z+.77],[x+.30,top+.52,z+.77],[x+.64,top+.52,z+.77],[x+.67,top+.29,z+.77]],.015,iron);
 beam(work,[x-.68,tubY+.06,z+.66],[x-.11,tubY+.06,z+.57],.025,wood[2]);const bowl=mesh(work,new THREE.SphereGeometry(.09,12,8,0,Math.PI*2,0,Math.PI/2),wood[2],x-.7,tubY+.06,z+.66);bowl.rotation.x=Math.PI;
 const coil=[];for(let j=0;j<130;j++){const t=j/129*6.28*3.4,r=.06+.19*j/129;coil.push([x+.46+r*Math.cos(t),top+.018,z-.76+r*Math.sin(t)])}tube(work,coil,.017,rope);tube(work,[[x+.7,top+.02,z-.8],[x+.92,top+.02,z-1],[x+1.07,top-.1,z-1.18]],.017,rope);
 // Modest split-bamboo chute: open trough, raised inlet for bucket-fed irrigation, downhill outlet.
 const ca=[x-.1,top+.37,z-1.12],cb=[x-.1,heightAt(x-.1,z-2.6)+.13,z-2.6],dv=V(...cb).sub(V(...ca)),len=dv.length();
 const trough=mesh(work,new THREE.CylinderGeometry(.085,.085,len,12,1,true,0,Math.PI),bamboo);trough.position.copy(V(...ca).add(V(...cb)).multiplyScalar(.5));trough.quaternion.setFromUnitVectors(V(0,1,0),dv.clone().normalize());
 for(const t of [.05,.4,.75]){const q=V(...ca).addScaledVector(dv,t);beam(work,[q.x,heightAt(q.x,q.z)-.1,q.z],[q.x,q.y-.02,q.z],.035,bamboo);for(const dz of [-.075,.075])beam(work,[q.x,q.y-.06,q.z],[q.x,q.y+.08,q.z+dz],.018,bamboo);}
 // Marginal shallow stones, leaving the 4.2m waterway free of structures.
 const shallows=group('shallow_stones_ripples','marginal-shallow-stones-and-ripples');for(let i=0;i<42;i++){const zz=range(-18,26),side=i%2?1:-1,xx=streamX(zz)+side*2.23;if(side>0&&occupied(xx,zz,.45))continue;const sy=range(.93,1.35);instance(shallows,ico,stone[i%4],xx,heightAt(xx,zz)+sy*.38,zz,range(.20,.38),sy,range(.24,.47),rand()*6.28);}for(const zz of [-11,-2,14,21]){const xx=streamX(zz)-2.13,y=heightAt(xx,zz);instance(shallows,ico,stone[2],xx,y+.43,zz,.23,.65,.29,zz);for(let k=0;k<2;k++){const pts=[];for(let j=0;j<16;j++){const a=.3+j/15*2.1,r=.28+k*.13,px=xx+Math.cos(a)*r,pz=zz+Math.sin(a)*r;pts.push([px,streamWater(pz)+.048,pz])}tube(shallows,pts,.009,foam)}}
 for(const {g,geo,m,items} of batches.values()){const im=new THREE.InstancedMesh(geo,m,items.length),o=new THREE.Object3D();items.forEach((p,i)=>{o.position.set(p.x,p.y,p.z);o.scale.set(p.sx,p.sy,p.sz);o.rotation.set(0,p.ry,0);o.updateMatrix();im.setMatrixAt(i,o.matrix)});im.castShadow=true;im.receiveShadow=true;g.add(im)}
 return root;
}
