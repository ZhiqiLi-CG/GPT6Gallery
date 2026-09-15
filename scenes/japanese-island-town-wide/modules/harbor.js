import {heightAt,roadNetwork,layout} from './root.js';

// Harbor parent owns the masonry, landing, piers and berth arrangement.
// The two detail children consume this arrangement without moving shared geography.
export function harborLayout(){return {
 quay:{x0:53,x1:90,zFront:-62,zBack:-59.4,top:2.3},
 piers:[{x:59,z0:-62,z1:-77,width:2.3,top:1.52},{x:72,z0:-62,z1:-79,width:2.5,top:1.52},{x:85,z0:-62,z1:-77,width:2.3,top:1.52}],
 boats:[{x:55.7,z:-71.8,length:7,width:2.35,rotation:0.06},{x:62.8,z:-69.8,length:7.8,width:2.6,rotation:-0.04},{x:68.1,z:-72.3,length:7.2,width:2.45,rotation:0.02},{x:75.9,z:-71.5,length:8.3,width:2.7,rotation:-0.03},{x:81.3,z:-69.8,length:6.8,width:2.3,rotation:0.02},{x:88.6,z:-73,length:7.1,width:2.4,rotation:-0.05}],
 sheds:[{x:74,z:-49.5,w:9,d:7},{x:86.5,z:-50,w:5,d:6},{x:55,z:-54,w:5,d:4}],
 breakwater:{eastX:92.3,z0:-60,z1:-86.8,southX0:69,top:1.55,width:2.4},
 shoreWorkRect:[50,-58.7,93,-38],clearApron:[60,-59.4,84,-54.5],seaLevel:layout().seaLevel
};}
export function build(THREE,ctx){
 const g=new THREE.Group();g.name='harbor masonry and timber works';
 const H=harborLayout();const lanes=roadNetwork();
 const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:0.94});
 const stone=[0x72756e,0x7d8076,0x666e69,0x8c8b7d,0x747a75].map(mat);
 const timber=[0x77664c,0x8e7755,0x826c4c,0x6a5a43].map(mat);
 const dark=mat(0x45443b),iron=mat(0x3c4845),rope=mat(0xb1a07a),moss=mat(0x505f47),sand=mat(0xa49c80);
 const groups=new Map();const cube=new THREE.BoxGeometry(1,1,1),cyl=new THREE.CylinderGeometry(1,1,1,9);
 function instance(geo,m,p,s,q=null){let b=groups.get(geo.uuid+'_'+m.uuid);if(!b){b={geo,m,items:[]};groups.set(geo.uuid+'_'+m.uuid,b)}const o=new THREE.Object3D();o.position.set(...p);o.scale.set(...s);if(q)o.quaternion.copy(q);o.updateMatrix();b.items.push(o.matrix.clone());}
 function box(x,y,z,w,h,d,m,ry=0){instance(cube,m,[x,y,z],[w,h,d],new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),ry));}
 function beam(a,b,r,m=timber[0]){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);instance(cyl,m,av.add(bv).multiplyScalar(.5).toArray(),[r,v.length(),r],new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize()));}
 function tube(points,r,m){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(12,points.length*3),r,5,false),m);g.add(mesh);}
 const rand=n=>{const q=Math.sin(n*93.317+32.2)*4582.23;return q-Math.floor(q)};
 function masonry(a,b,width,top){
  const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),angle=-Math.atan2(dz,dx),nx=-dz/len,nz=dx/len;
  const N=Math.ceil(len/1.1);
  for(let i=0;i<N;i++){
   const t=(i+.5)/N,x=a[0]+dx*t,z=a[1]+dz*t;
   const bottom=Math.min(heightAt(x+nx*width/2,z+nz*width/2),heightAt(x-nx*width/2,z-nz*width/2))-.3;
   const rows=Math.ceil((top-.20-bottom)/.48),rh=(top-.20-bottom)/rows;
   // Recessed rubble core closes the joints behind the dressed stone facing.
   box(x,(bottom+top-.22)/2,z,len/N+.02,top-.22-bottom,width-.18,stone[2],angle);
   for(let j=0;j<rows;j++){
    const offset=j%2?0.18:0; const xx=x+dx/len*offset,zz=z+dz/len*offset;
    box(xx,bottom+(j+.5)*rh,zz,len/N-.045,rh-.035,width+0.12*rand(i+j*19),stone[(i+j*3)%5],angle);
    if(j===Math.floor(rows*.55)&&i%4===0)box(xx+nx*(width/2+.025),.16,zz+nz*(width/2+.025),.75,.12,.035,moss,angle);
   }
   box(x,top-.1,z,len/N-.028,.20,width+.18,stone[(i+2)%5],angle);
  }
 }
 masonry([53,-60.7],[90,-60.7],2.6,2.3);
 // Low side returns retain the apron at the cut bank.
 masonry([53,-60],[53,-57.2],1.1,2.3);
 masonry([90,-60],[90,-55.3],1.1,2.3);
 // Protecting arm joins the eastern apron. Outer toe rubble rests on the bed.
 masonry([92.3,-60],[92.3,-86.8],2.4,1.55);
 masonry([69,-86.8],[92.3,-86.8],2.4,1.55);
 masonry([90,-60],[92.3,-60],2.4,1.55);
 // Three founded treads join the quay coping to the lower breakwater walkway.
 for(let i=0;i<3;i++){const top=2.3-(i+1)*.25;box(90.76+i*.36,(top+1.3)/2,-60, .43,top-1.3,1.35,stone[(i+1)%5]);}
 for(let i=0;i<110;i++){
  let x,z;if(i<61){x=93.75+rand(i)*.65;z=-60-i/60*27}else{x=69+(i-61)/49*23;z=-88.25-rand(i)*.5}
  const h=heightAt(x,z);const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.6+rand(i+9)*.35,0),stone[i%5]);rock.position.set(x,h+.44,z);rock.scale.set(1.1,.85,1);rock.rotation.set(i*.34,i*.81,i*.17);
  // Keep the complete rotated rubble geometry inside the marine reservation.
  rock.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(rock);
  rock.position.x-=Math.max(0,bounds.max.x-94.9);rock.position.z+=Math.max(0,-89.9-bounds.min.z);
  rock.position.y=heightAt(rock.position.x,rock.position.z)+.44;g.add(rock);
 }
 // Stone access stair: each riser is founded down to sampled basin floor.
 for(let i=0;i<12;i++){const z=-62.1-i*.33,top=2.3-(i+1)*.175,bottom=heightAt(54.4,z)-.2;box(54.4,(top+bottom)/2,z,2.15,top-bottom,.35,stone[i%5]);}
 beam([53.48,3,-61.85],[53.48,.98,-66.05],.065,iron);
 for(let i=0;i<4;i++){
  const z=-62.1-i*1.2,base=2.3-(Math.round(i*1.2/.33)+1)*.175,top=3+(z+61.85)*2.02/4.2;
  box(53.48,base+.015,z,.17,.03,.17,iron);
  beam([53.48,base,z],[53.48,top,z],.045,iron);
 }
 // Slipway wedge with solid sides and transverse traction strips.
 const rampX0=86.5,rampX1=89.5,z0=-62,z1=-67.3,y0=2.3,y1=-.25,bottom=-3.3;
 const v=[rampX0,y0,z0,rampX1,y0,z0,rampX0,y1,z1,rampX1,y1,z1,rampX0,bottom,z0,rampX1,bottom,z0,rampX0,bottom,z1,rampX1,bottom,z1];
 const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(v,3));rg.setIndex([0,1,2,1,3,2,0,4,5,0,5,1,0,2,6,0,6,4,1,5,7,1,7,3,2,3,7,2,7,6,4,6,7,4,7,5]);rg.computeVertexNormals();g.add(new THREE.Mesh(rg,stone[1]));
 for(let i=0;i<18;i++){const t=(i+.5)/18;box(88,y0+(y1-y0)*t+.045,z0+(z1-z0)*t,2.85,.065,.085,stone[2]);}
 for(const [pi,p] of H.piers.entries()){
  const end=p.z1,start=-63.25,w=p.width;
  // Stairs connect 2.3 m quay to 1.52 m working decks.
  for(let i=0;i<4;i++)box(p.x,2.3-(i+1)*.195-.10,-62.1-i*.31,w,.20,.34,timber[i]);
  for(const side of [-1,1])beam([p.x+side*.76,2.02,-61.96],[p.x+side*.76,1.18,-63.44],.115,dark);
  const count=Math.ceil((start-end)/.26);
  for(let k=0;k<count;k++){
   const z=start-(k+.5)*(start-end)/count;
   box(p.x,p.top-.09,z,w,.18,(start-end)/count-.017,timber[(k+pi)%4]);
   for(const s of [-1,1]){box(p.x+s*(w/2-.20),p.top+.008,z,.038,.018,.038,iron);}
  }
  for(const s of [-1,1]){
   box(p.x+s*.79,p.top-.29,(start+end)/2,.18,.25,start-end+.4,dark);
   const n=Math.ceil((start-end)/2.6);
   for(let j=0;j<=n;j++){
    const z=start+(end-start)*j/n,x=p.x+s*(w/2-.16),bottom=heightAt(x,z)-.65,top=p.top+.65;
    beam([x,bottom,z],[x,top,z],.18,timber[(j+pi)%4]);
    for(const yy of [p.top+.38,p.top-.68]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.183,.023,5,12),iron);ring.rotation.x=Math.PI/2;ring.position.set(x,yy,z);g.add(ring);}
    if(j<n){const zz=start+(end-start)*(j+1)/n;beam([x,-.8,z],[x,p.top-.35,zz],.08);beam([x,p.top-.35,z],[x,-.8,zz],.08);}
   }
  }
  // Crossheads bear directly on each pile pair and carry both longitudinal joists.
  const pileBays=Math.ceil((start-end)/2.6);
  for(let j=0;j<=pileBays;j++){
   const z=start+(end-start)*j/pileBays;
   box(p.x,p.top-.37,z,w+.14,.23,.25,timber[(j+pi)%4]);
   for(const side of [-1,1])box(p.x+side*(w/2-.16),p.top-.35,z+.145,.075,.075,.045,iron);
  }
  for(let j=0;j<3;j++){
   const z=-65-j*4.4;for(const side of [-1,1]){
    const x=p.x+side*(w/2+.15),tie=p.x+side*(w/2-.08);
    beam([x,.18,z],[x,1.3,z],.17,dark);
    tube([[tie,p.top+.02,z-.09],[tie-side*.09,p.top+.05,z],[tie,p.top+.02,z+.09],[x,1.38,z],[x+side*.08,.8,z]],.027,rope);
    const lashing=new THREE.Mesh(new THREE.TorusGeometry(.177,.026,5,12),rope);lashing.rotation.x=Math.PI/2;lashing.position.set(x,.80,z);g.add(lashing);
   }
  }
  // Hand-rigged wooden ladder down to the water.
  const x=p.x-w/2-.1,z=end+1;for(const xx of [x-.23,x+.23])beam([xx,-.65,z],[xx,p.top+.4,z],.05);
  for(let j=0;j<7;j++)beam([x-.23,-.5+j*.3,z],[x+.23,-.5+j*.3,z],.04);
 }
 // Bollards and rope coils are attached to harbor works, outside walking centers.
 for(let x=57;x<=89;x+=4){
  beam([x,2.3,-61.45],[x,2.97,-61.45],.13,dark);beam([x-.23,2.82,-61.45],[x+.23,2.82,-61.45],.065,dark);
  if(x%3!==0){const pts=[];for(let j=0;j<95;j++){const a=j*.29,r=.12+j*.0038;pts.push([x+.65+Math.cos(a)*r,2.325+j*.00015,-61+Math.sin(a)*r]);}tube(pts,.028,rope);}
 }
 // Squat navigation lantern at the breakwater head.
 box(69.3,1.72,-86.8,1.05,.34,1.05,stone[1]);box(69.3,2.22,-86.8,.56,.68,.56,stone[3]);
 box(69.3,2.70,-86.8,.68,.13,.68,dark);
 const glass=new THREE.MeshStandardMaterial({color:0xdac390,emissive:0x5e461f,emissiveIntensity:.18,roughness:.55});box(69.3,2.97,-86.8,.4,.43,.4,glass);
 for(const dx of [-.24,.24])for(const dz of [-.24,.24])beam([69.3+dx,2.74,-86.8+dz],[69.3+dx,3.2,-86.8+dz],.035,iron);
 box(69.3,3.22,-86.8,.75,.11,.75,dark);const cap=new THREE.Mesh(new THREE.ConeGeometry(.5,.33,4),dark);cap.position.set(69.3,3.44,-86.8);cap.rotation.y=Math.PI/4;g.add(cap);
 // Shore paths are sampled to the existing root terrain and kept inside this district.
 for(let i=0;i<10;i++){const x=62,z=-55-i*.4,y=heightAt(x,z);box(x,y+.075,z,3,.15,.42,sand);}
 // A founded stone transition occupies only the parent-owned 0.7 m strip
 // between the child's yard walk and the quay; its gentle grade admits carts.
 for(let i=0;i<36;i++){
  const xa=53.45+i,xb=xa+.99,za=-59.42,zb=-58.70;
  const ya=heightAt(xa,zb)+.026,yb=heightAt(xb,zb)+.026;
  const bottom=Math.min(heightAt(xa,za),heightAt(xb,za),ya-.026,yb-.026)-.12;
  const vertices=[xa,2.3,za,xb,2.3,za,xa,ya,zb,xb,yb,zb,xa,bottom,za,xb,bottom,za,xa,bottom,zb,xb,bottom,zb];
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geo.setIndex([0,2,1,1,2,3,0,1,5,0,5,4,0,4,6,0,6,2,1,3,7,1,7,5,2,6,7,2,7,3,4,5,7,4,7,6]);geo.computeVertexNormals();
  const paving=new THREE.Mesh(geo,stone[(i+1)%5]);paving.castShadow=true;paving.receiveShadow=true;g.add(paving);
 }
 for(const b of groups.values()){const mesh=new THREE.InstancedMesh(b.geo,b.m,b.items.length);b.items.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);}
 return g;
}
