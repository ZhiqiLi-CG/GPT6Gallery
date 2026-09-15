import { heightAt, roadNetwork, layout, clearBlockout } from './root.js';

export function build(THREE, ctx) {
 clearBlockout('landmarks');
 const district=layout(), roads=roadNetwork();
 const group=new THREE.Group(); group.name='landmarks_church_and_mill';
 const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.91});
 const stone=mat('#b8ad91'), trim=mat('#d6c8a8'), mortar=mat('#928a77');
 const slate=mat('#535f60'), roofEdge=mat('#394748'), oak=mat('#67472d'), dark=mat('#302c24');
 const glass=mat('#334b4d'), iron=mat('#3d3e36'), soil=mat('#a08b67'), cloth=mat('#eee1b9');
 const greens=[mat('#4f713c'),mat('#698448'),mat('#849651')], tile=mat('#966046');
 const dummy=new THREE.Object3D(), batches=new Map();
 function mesh(geo,m,x,y,z,parent=group){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function box(x,y,z,w,h,d,m,parent=group){return mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,parent);}
 function detail(x,y,z,w,h,d,m,rot=0){if(!batches.has(m))batches.set(m,[]);batches.get(m).push([x,y,z,w,h,d,rot]);}
 function beam(a,b,r,m,parent=group){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),len=av.distanceTo(bv);const o=mesh(new THREE.CylinderGeometry(r,r,len,6),m,0,0,0,parent);o.position.copy(av).add(bv).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),bv.sub(av).normalize());return o;}
 function groundBox(x,z,w,d,top,m){const bottom=Math.min(...[-1,1].flatMap(s=>[-1,1].map(t=>heightAt(x+s*w/2,z+t*d/2))))-.35;return box(x,(top+bottom)/2,z,w,top-bottom,d,m);}
 function path(points,width){const v=[],ix=[];for(let k=0;k<points.length-1;k++){const a=points[k],b=points[k+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(L/.7),nx=-(b[1]-a[1])/L*width/2,nz=(b[0]-a[0])/L*width/2;for(let i=0;i<n;i++){const j=v.length/3;for(const [t,s]of [[i/n,1],[i/n,-1],[(i+1)/n,1],[(i+1)/n,-1]]){const x=a[0]+(b[0]-a[0])*t+nx*s,z=a[1]+(b[1]-a[1])*t+nz*s;v.push(x,heightAt(x,z)+.23,z);}ix.push(j,j+2,j+1,j+1,j+2,j+3);}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(ix);geo.computeVertexNormals();return mesh(geo,soil,0,0,0);}
 function gable(x,z,w,d,base,rise,m){const v=[-w/2,0,-d/2,w/2,0,-d/2,0,rise,-d/2,-w/2,0,d/2,w/2,0,d/2,0,rise,d/2];const q=new THREE.BufferGeometry();q.setAttribute('position',new THREE.Float32BufferAttribute(v,3));q.setIndex([0,2,1,3,4,5,0,3,5,0,5,2,1,2,5,1,5,4,0,1,4,0,4,3]);q.computeVertexNormals();return mesh(q,m,x,base,z);}
 function roof(x,z,w,d,y,h,m){gable(x,z,w,d,y,h,m);const slope=Math.hypot(w/2,h),angle=Math.atan2(h,w/2);for(const s of [-1,1]){const o=box(x+s*w/4,y+h/2+.10,z,slope,.23,d+.6,m);o.rotation.z=-s*angle;for(let k=1;k<10;k++){const t=k/10;detail(x+s*w*.5*t,y+h*(1-t)+.25,z,.10,.11,d+.7,roofEdge);}}box(x,y+h+.20,z,.38,.35,d+.8,roofEdge);}
 // An extruded arched panel, with an actual stone arch and jambs surrounding it.
 function arch(x,y,z,w,h,rotation=0,panel=glass){const a=new THREE.Group();a.position.set(x,y,z);a.rotation.y=rotation;group.add(a);const r=w/2,shoulder=h-r;const sh=new THREE.Shape();sh.moveTo(-r,0);sh.lineTo(r,0);sh.lineTo(r,shoulder);sh.absarc(0,shoulder,r,0,Math.PI,false);sh.lineTo(-r,0);const geo=new THREE.ExtrudeGeometry(sh,{depth:.15,bevelEnabled:false,curveSegments:12});mesh(geo,panel,0,0,0,a);box(-r-.15,shoulder/2,0,.27,shoulder+.15,.35,trim,a);box(r+.15,shoulder/2,0,.27,shoulder+.15,.35,trim,a);for(let i=0;i<11;i++){const t=(i+.5)*Math.PI/11;const q=box(Math.cos(t)*(r+.13),shoulder+Math.sin(t)*(r+.13),.03,.31,.33,.37,trim,a);q.rotation.z=t-Math.PI/2;}box(0,.02,.03,w+.65,.22,.45,trim,a);return a;}
 const [cx,cz]=district.church.center, nx=cx+2,nz=cz+6;
 const cy=Math.max(heightAt(nx-7,nz-10.5),heightAt(nx+7,nz+10.5),heightAt(nx-7,nz+10.5))+.15;
 groundBox(nx,nz,14.8,22.2,cy+.5,mortar);box(nx,cy+5.6,nz,14,10.7,21,stone);
 roof(nx,nz,15.5,22.2,cy+11,6.6,slate);
 // Lower chancel at the north end, including a complete gabled roof.
 groundBox(nx,cz+19,10.5,8,cy+.5,mortar);box(nx,cy+4.1,cz+19,10,7.5,8,stone);roof(nx,cz+19,11.2,8.3,cy+7.9,4.7,slate);
 // Bell tower at the village-facing entrance.
 const tz=cz-6, tw=7.5;
 groundBox(nx,tz,8.3,8.3,cy+.7,mortar);box(nx,cy+11.6,tz,tw,22.4,tw,stone);
 for(const h of [1.0,7.5,16.1,22.6])box(nx,cy+h,tz,8.05,.4,8.05,trim);
 box(nx,cy+23,tz,8.5,.55,8.5,roofEdge);
 const spire=mesh(new THREE.ConeGeometry(6.15,9,4),slate,nx,cy+27.75,tz);spire.rotation.y=Math.PI/4;
 beam([nx,cy+32.25,tz],[nx,cy+34.1,tz],.1,iron);beam([nx-.62,cy+33.35,tz],[nx+.62,cy+33.35,tz],.09,iron);
 for(const rot of [0,Math.PI/2,Math.PI,Math.PI*1.5]){const dx=Math.sin(rot)*3.83,dz=Math.cos(rot)*3.83;const a=arch(nx+dx,cy+17.1,tz+dz,3,4,rot,dark);for(let j=0;j<6;j++)box(0,.35+j*.38,.21,2.85,.16,.18,oak,a);}
 const door=arch(nx,cy+.65,tz-3.84,3.05,5.1,Math.PI,oak);
 for(let i=-3;i<=3;i++)box(i*.4,1.65,.18,.06,3.25,.05,dark,door);
 for(const yy of [.8,2.5])box(0,yy,.23,2.85,.14,.10,iron,door);
 for(const x of [-.24,.24]){const ring=mesh(new THREE.TorusGeometry(.14,.037,5,12),iron,x,1.7,.31,door);}
 path([[nx,tz-4.6],[nx-3,tz-7],[-44,55],[-48,50]],2.5);
 for(let s=0;s<3;s++)box(nx,cy+.12+s*.18,tz-4.7+s*.36,3.8,.28,1.0,trim);
 // Stonework joints are instanced. Broken vertical joints alternate each course.
 function masonry(x,z,w,d,h){for(let row=0;row<h/.66;row++){const y=cy+.75+row*.66;for(const s of [-1,1]){detail(x,y,z+s*(d/2+.013),w,.036,.035,mortar);for(let k=0;k<w/1.4;k++){const xx=x-w/2+(k+.5+(row%2)*.5)*1.4;if(xx<x+w/2)detail(xx,y+.31,z+s*(d/2+.02),.038,.61,.045,mortar);}detail(x+s*(w/2+.013),y,z,.035,.036,d,mortar);for(let k=0;k<d/1.4;k++){const zz=z-d/2+(k+.5+(row%2)*.5)*1.4;if(zz<z+d/2)detail(x+s*(w/2+.02),y+.31,zz,.045,.61,.038,mortar);}}}}
 masonry(nx,nz,14,21,10.1);masonry(nx,tz,tw,tw,21.6);masonry(nx,cz+19,10,8,7);
 for(const side of [-1,1]){
 for(const zz of [cz-1,cz+5,cz+11]){const wx=nx+side*7.06;const a=arch(wx,cy+4,zz,2.3,4.7,side*Math.PI/2);box(0,2.05,.2,.12,3.9,.13,trim,a);box(0,1.7,.2,2.25,.12,.13,trim,a);}
 for(const zz of [cz-4.5,cz+2,cz+8,cz+15]){groundBox(nx+side*7.6,zz,1.35,1.7,cy+1,trim);box(nx+side*7.6,cy+4.5,zz,1.25,8,1.35,stone);box(nx+side*7.6,cy+8.5,zz,1.45,.35,1.6,trim);box(nx+side*8,cy+2.6,zz,1.95,4.1,1.65,stone);}}
 arch(nx,cy+2.6,cz+23.07,3.0,4.6,0);
 // Yard wall is draped to the hill and broken by a real entrance opening.
 function wall(a,b){const len=Math.hypot(b[0]-a[0],b[1]-a[1]),steps=Math.ceil(len/1.15),ang=-Math.atan2(b[1]-a[1],b[0]-a[0]);for(let i=0;i<steps;i++){const t=(i+.5)/steps,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,y=heightAt(x,z);detail(x,y+.53,z,len/steps+.04,1.4,.65,stone,ang);detail(x,y+1.28,z,len/steps+.10,.2,.83,trim,ang);}}
 const walls=[[[-51,61],[-46.5,57.2]],[[-42.6,53.9],[-38,50]],[[-38,50],[-14,50]],[[-14,50],[-14,84]],[[-14,84],[-51,84]],[[-51,84],[-51,61]]];for(const [a,b]of walls)wall(a,b);
 for(const [x,z]of [[-46.5,57.2],[-42.6,53.9]])groundBox(x,z,1.05,1.05,heightAt(x,z)+2,trim);
 // Low open gate leaves, kept beside the entrance rather than across the footpath.
 for(const [x,z]of [[-46.2,57.4],[-42.4,54.3]]){for(let i=0;i<4;i++)detail(x,heightAt(x,z)+.7,z+i*.3,.12,1.15,.12,oak);detail(x,heightAt(x,z)+1.1,z+.45,.16,.14,1.25,oak);}
 path([[-44,55],[-46,61],[-46,79]],1.35);path([[-28,55],[-20,58],[-20,80]],1.4);path([[-46,79],[-20,80]],1.25);
 for(const side of [-1,1])for(let row=0;row<4;row++)for(let col=0;col<2;col++){const x=side<0?-48.6+col*3.8:-23.0+col*5.8,z=63+row*4.9,y=heightAt(x,z);groundBox(x,z,.95,.62,y+.22,mortar);box(x,y+.8,z,.78,1.23,.22,stone);mesh(new THREE.CylinderGeometry(.39,.39,.23,12,1,false,0,Math.PI),stone,x,y+1.40,z).rotation.x=Math.PI/2;detail(x,y+1,z-.13,.12,.59,.04,mortar);detail(x,y+1.11,z-.13,.39,.1,.04,mortar);const grave=mesh(new THREE.BoxGeometry(1.05,.12,2.05),soil,x,y+.05,z-1.05);}
 // Mill uses the authoritative hill and center. Rotor faces the presentation camera.
 const [mx,mz]=district.windmill.center,my=heightAt(mx,mz),millH=15;
 mesh(new THREE.CylinderGeometry(4.5,5.15,1.7,16),mortar,mx,my+.25,mz);
 mesh(new THREE.CylinderGeometry(3.05,4.45,millH,16),stone,mx,my+millH/2,mz);
 for(let row=0;row<23;row++){const y=my+.7+row*.6,r=4.45-(y-my)/millH*1.4;mesh(new THREE.CylinderGeometry(r+.025,r+.025,.045,32),mortar,mx,y,mz);}
 mesh(new THREE.CylinderGeometry(3.65,3.65,.5,16),oak,mx,my+15,mz);
 mesh(new THREE.ConeGeometry(4.15,4.1,16),slate,mx,my+17.2,mz);
 arch(mx,my+.15,mz-4.48,1.65,3.0,Math.PI,oak);arch(mx+3.69,my+6.0,mz,1.15,1.9,Math.PI/2);arch(mx-3.69,my+6.0,mz,1.15,1.9,-Math.PI/2);arch(mx,my+9.6,mz+3.6,1.0,1.65,0);
 const rotor=new THREE.Group();rotor.position.set(mx,my+14.5,mz);rotor.rotation.y=.30;group.add(rotor);
 const shaft=mesh(new THREE.CylinderGeometry(.49,.49,5.1,10),oak,0,0,-2.3,rotor);shaft.rotation.x=Math.PI/2;
 mesh(new THREE.SphereGeometry(.79,12,8),iron,0,0,-5.1,rotor);
 for(let i=0;i<4;i++){const sail=new THREE.Group();sail.position.z=-4.9;sail.rotation.z=i*Math.PI/2+Math.PI/7;rotor.add(sail);
 box(0,5.7,0,.26,11.7,.27,oak,sail);
 // Outer lattice remains visible around the slightly inset linen cloth.
 for(const x of [.20,1.15,2.10])box(x,7.0,0,.105,7.8,.12,oak,sail);
 for(let j=0;j<12;j++)box(1.1,3.15+j*.68,0,2.15,.11,.14,oak,sail);
 box(1.1,6.95,.08,1.8,7.45,.045,cloth,sail);
 // Front battens and stitched panel divisions articulate each full sail.
 for(let j=0;j<6;j++)box(1.1,3.45+j*1.34,-.08,2.18,.075,.07,oak,sail);
 }
 path([[-89,63],[-90,67],[mx,mz-4.5]],2.6);path([[-90,68],[-78,72],[-77,83]],1.9);
 // A modest timber storehouse northeast of the rotor's working space.
 const sx=mx+13,sz=mz+9,sy=Math.max(heightAt(sx-3.5,sz-2.5),heightAt(sx+3.5,sz+2.5))+.15;
 groundBox(sx,sz,7.3,5.7,sy+.2,mortar);box(sx,sy+1.9,sz,7,3.6,5.4,oak);roof(sx,sz,7.8,6.0,sy+3.7,2.2,tile);
 for(let i=0;i<17;i++)detail(sx-3.35+i*.42,sy+1.9,sz-2.73,.055,3.5,.05,dark);
 box(sx-.8,sy+1.45,sz-2.78,2.2,2.9,.12,dark);for(const xx of [-1.8,.2])box(sx+xx,sy+1.45,sz-2.9,.16,2.9,.14,trim);box(sx-.8,sy+2.93,sz-2.9,2.3,.18,.16,trim);
 function fence(points){for(let k=0;k<points.length-1;k++){const a=points[k],b=points[k+1],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/2.8);for(let i=0;i<=n;i++){const x=a[0]+(b[0]-a[0])*i/n,z=a[1]+(b[1]-a[1])*i/n,y=heightAt(x,z);detail(x,y+.75,z,.2,1.7,.2,oak);if(i<n){const xx=a[0]+(b[0]-a[0])*(i+1)/n,zz=a[1]+(b[1]-a[1])*(i+1)/n,yy=heightAt(xx,zz);for(const h of [.6,1.2])beam([x,y+h,z],[xx,yy+h,zz],.08,oak);}}}}
 fence([[-106,71],[-106,91],[-99,99],[-72,99],[-72,75],[-77,70]]);
 // Trampled work apron, sampled onto the shared hill surface.
 for(let strip=0;strip<12;strip++) {const z=mz-5.8+strip*.72;path([[mx+4.9,z],[mx+11.8+(strip>7?2:0),z]],.8);}
 // Wooden cart with spoked wheels, shaft and a load of grain sacks.
 const cartx=mx+8,cartz=mz-3,cartY=heightAt(cartx,cartz)+.9;
 box(cartx,cartY,cartz,2.15,.24,3.4,oak);for(const s of [-1,1]){box(cartx+s*1.05,cartY+.55,cartz,.13,1.1,3.4,oak);beam([cartx+s*.7,cartY-.2,cartz-1.6],[cartx+s*.7,cartY-.5,cartz-4.7],.09,oak);const wheel=new THREE.Group();wheel.position.set(cartx+s*1.35,cartY-.12,cartz);wheel.rotation.y=Math.PI/2;group.add(wheel);mesh(new THREE.TorusGeometry(.79,.105,6,14),dark,0,0,0,wheel);for(let i=0;i<8;i++){const t=i*Math.PI/4;beam([0,0,0],[Math.cos(t)*.76,Math.sin(t)*.76,0],.055,oak,wheel);}mesh(new THREE.CylinderGeometry(.18,.18,.35,8),iron,0,0,0,wheel).rotation.x=Math.PI/2;}
 box(cartx,cartY+.55,cartz+1.64,2.1,1.1,.12,oak);
 function sack(x,y,z,s=1){const o=mesh(new THREE.SphereGeometry(.48,8,7),cloth,x,y+.55*s,z);o.scale.set(.8*s,1.2*s,s);mesh(new THREE.CylinderGeometry(.12*s,.2*s,.20*s,7),oak,x,y+1.09*s,z);}
 for(let i=0;i<5;i++)sack(sx-2+i*.9,heightAt(sx-2+i*.9,sz-4),sz-4,.85);for(let i=0;i<3;i++)sack(cartx+(i%2-.5)*.7,cartY+.15,cartz-.7+i*.55,.78);
 // Millstones resting in the working yard.
 for(const [x,z]of [[mx+5,mz+4],[mx+6.2,mz+5.3]]){const y=heightAt(x,z);mesh(new THREE.CylinderGeometry(.95,.95,.32,18),trim,x,y+.18,z);mesh(new THREE.CylinderGeometry(.16,.16,.34,10),dark,x,y+.20,z);}
 let seed=61073;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
 function tree(x,z,s){const y=heightAt(x,z);beam([x,y,z],[x,y+2.6*s,z],.17*s,oak);for(const [dx,dz]of [[-1,-.5],[1,-.5],[0,1]]){beam([x,y+1.7*s,z],[x+dx*s,y+3*s,z+dz*s],.10*s,oak);mesh(new THREE.IcosahedronGeometry(1.65*s,1),greens[Math.floor(rand()*3)],x+dx*.7*s,y+3.3*s,z+dz*.7*s);}}
 for(const [x,z]of [[-102,94],[-92,95],[-82,95],[-112,103],[-101,106],[-89,107],[-77,107],[-61,78],[-60,88],[-58,99]])tree(x,z,.8+rand()*.23);
 // Meadow grasses and tiny flowers on the northern hill; instances keep it light.
 for(let i=0;i<620;i++){const x=-119+rand()*56,z=88+rand()*24;if(x>-73&&z<100)continue;let nearRoad=false;for(const r of roads)for(let j=0;j<r.points.length-1;j++){const a=r.points[j],b=r.points[j+1],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));if(Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)<r.width/2+.8)nearRoad=true;}if(nearRoad)continue;const y=heightAt(x,z);detail(x,y+.18,z,.07,.38,.07,greens[i%3],rand()*3);if(i%7===0)detail(x,y+.4,z,.18,.10,.16,cloth);}
 for(const [material,items]of batches){const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),material,items.length);items.forEach((p,i)=>{dummy.position.set(p[0],p[1],p[2]);dummy.scale.set(p[3],p[4],p[5]);dummy.rotation.set(0,p[6],0);dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix);});im.castShadow=true;im.receiveShadow=true;group.add(im);}
 return group;
}
