// Root-owned island structure. Metres; x east, z north, y up.
export const SEA_LEVEL = 0;
const smooth = t => {t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
export function streamX(z) { return 34 + 7*Math.sin((z+28)*.025); }
export function heightAt(x,z) {
 const r=Math.sqrt((x/132)**2+((z-4)/119)**2);
 const coast=smooth((1-r)/.20);
 let h=3.2 + 28*Math.exp(-((x+45)**2/1900+(z-54)**2/1700)) + 13*Math.exp(-((x-63)**2/2000+(z-48)**2/3200));
 h+=.60*Math.sin(x*.06)*Math.cos(z*.07);
 h=h*coast - 3*(1-coast);
 // Fixed temple plateau, harmonized into its hill.
 const pd=Math.max(Math.abs(x+46)/24,Math.abs(z-54)/22);
 h=h*(1-smooth((1.25-pd)/.3))+26*smooth((1.25-pd)/.3);
 // Quay grading blends smoothly into the rising harbor approach.
 const qd=Math.max(53-x,x-94,-76-z,z+58,0);
 const qw=1-smooth(qd/7); h=h*(1-qw)+2.72*qw;
 const inlet=smooth((-z-74.5)/2)*smooth((x-50)/3)*smooth((97-x)/3);
 h=h*(1-inlet)-2.2*inlet;
 if(z>=-103&&z<=65) {const d=Math.abs(x-streamX(z));h-=2.4*Math.exp(-d*d/14)*coast;}
 return h;
}
export function roadNetwork() {return [
 {id:'market',width:4.5,points:[[-87,-43],[-61,-39],[-34,-30],[-11,-22],[14,-17],[41,-15],[66,-23],[89,-40]]},
 {id:'upper',width:3.5,points:[[-64,-39],[-64,-11],[-58,12],[-66,31],[-61,44]]},
 {id:'hill',width:3.1,points:[[-34,-30],[-30,-2],[-25,16],[-25,31],[-26,44]]},
 {id:'crosslane',width:3,points:[[-63,-7],[-38,-4],[-10,0],[13,5],[38,10],[69,12],[87,28]]},
 {id:'shore',width:3.5,points:[[-84,-40],[-73,-60],[-58,-76],[-28,-72],[0,-66],[22,-59],[53,-57],[79,-60]]},
 {id:'farm',width:3,points:[[65,-24],[70,0],[82,25],[87,49],[77,70]]}
 ];}
export function layout() {
 return {seaLevel:0, temple:{center:[-46,54],rect:[-70,32,-22,76],y:26},
 harbor:{quay:[53,-76,94,-58],y:2.915,waterRect:[47,-111,105,-78]},
 torii:{center:[-61,-80],y:heightAt(-61,-80)},
 bridge:{center:[streamX(-15),-15],ends:[streamX(-15)-7,streamX(-15)+7],width:4.8},
 town:{rect:[-94,-76,29,23],lots:[[-78,-30],[-78,-13],[-77,5],[-54,-27],[-49,-14],[-46,9],[-37,15],[-17,-10],[-8,13],[11,17],[15,-2],[-71,-51],[-51,-49],[-32,-45],[-12,-39],[9,-34],[22,-47],[-49,-63],[-27,-60],[-8,-56],[-86,-56],[-70,18],[-14,28],[5,32]].map((p,i)=>({id:'lot'+i,x:p[0],z:p[1],y:heightAt(...p),w:8+(i%3),d:7+(i%2)}))},
 rice:{rect:[48,22,105,82]},style:{wood:0x68462d,roof:0x424d54,plaster:0xd9c9a2,stone:0x85867a,vermilion:0xb93425}};
}
export function build(THREE,ctx) {
 const g=new THREE.Group();g.name='root-island-infrastructure';
 const mats={};const mat=c=>mats[c]||(mats[c]=new THREE.MeshStandardMaterial({color:c,roughness:.93}));
 const mesh=(geom,c,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geom,mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m};
 const box=(x,y,z,w,h,d,c)=>mesh(new THREE.BoxGeometry(w,h,d),c,x,y,z);
 const beam=(a,b,r,c)=>{let v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));let m=mesh(new THREE.CylinderGeometry(r,r,v.length(),8),c,...a);m.position.addScaledVector(v,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m};
 // Continuous bathymetry under a water surface stretching beyond every camera.
 const n=256,sz=360,geo=new THREE.PlaneGeometry(sz,sz,n,n);geo.rotateX(-Math.PI/2);
 const p=geo.attributes.position,colors=[];
 for(let i=0;i<p.count;i++){let x=p.getX(i),z=p.getZ(i),h=heightAt(x,z);p.setY(i,h);let c=new THREE.Color(h<1.7?0xc2b38b:h>22?0x788556:0x8e9b64);c.multiplyScalar(.99+.018*Math.sin(x*.23+z*.17));colors.push(c.r,c.g,c.b);}
 geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();let land=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));land.receiveShadow=true;g.add(land);
 mesh(new THREE.BoxGeometry(20000,.15,20000),0x589396,0,-.17,0);
 // Fine foam strokes and coastal rocks give the shoreline a scale.
 for(let i=0;i<155;i++){let a=i*2.39996,lo=.65,hi=1.06;for(let k=0;k<15;k++){let t=(lo+hi)/2;if(heightAt(132*t*Math.cos(a),4+119*t*Math.sin(a))>0)lo=t;else hi=t;}let t=(lo+hi)/2,x=132*t*Math.cos(a),z=4+119*t*Math.sin(a);let h=heightAt(x,z);let m=mesh(new THREE.DodecahedronGeometry(1+(i%4)*.5,0),i%3?0x868c80:0xaaa996,x,h+.5,z);m.scale.set(1.5,.6,1);m.rotation.y=a;}
 for(let i=0;i<76;i++){let a=i*.083,x=(137+(i%3))*Math.cos(a),z=4+124*Math.sin(a);let m=box(x,.025,z,3+(i%4),.025,.13,0xafd0c4);m.rotation.y=-a;}
 // Roads are sampled ribbons conforming to terrain and shared by every district.
 function ribbon(points,width,color,lift=.09,conform=true){let vs=[],idx=[];let samples=[];
 for(let j=0;j<points.length-1;j++){let a=points[j],b=points[j+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),steps=Math.ceil(L/.7);for(let k=0;k<steps;k++){let t=k/steps;samples.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}samples.push(points.at(-1));
 const cross=conform?Math.ceil(width/.7):1,stride=cross+1;
 samples.forEach((v,i)=>{let a=samples[Math.max(0,i-1)],b=samples[Math.min(samples.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);
 for(let k=0;k<=cross;k++){let s=-1+2*k/cross,x=v[0]+s*dz/L*width/2,z=v[1]-s*dx/L*width/2;vs.push(x,heightAt(x,z)+lift,z)}
 if(i)for(let k=0;k<cross;k++){let n=i*stride+k;idx.push(n-stride,n-stride+1,n,n-stride+1,n+1,n)}});
 let ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));ge.setIndex(idx);ge.computeVertexNormals();let m=new THREE.Mesh(ge,new THREE.MeshStandardMaterial({color,side:THREE.DoubleSide,roughness:1}));g.add(m);}
 for(let r of roadNetwork()){ribbon(r.points,r.width+.7,0x88816a,.28);ribbon(r.points,r.width,0xb9a789,.34)}
 // Stream bed, shallow moving water and individual bank stones.
 let sp=[];for(let z=-102;z<=65;z+=1.5)sp.push([streamX(z),z]);
 ribbon(sp,3.0,0x73a5a1,.40,false);
 for(let i=0;i<116;i++){let z=-99+i*1.4,x=streamX(z)+(i%2?1:-1)*(2.4+(i%3)*.23);let m=mesh(new THREE.DodecahedronGeometry(.58+(i%3)*.15,0),0x969b88,x,heightAt(x,z)+.3,z);m.scale.set(1.2,.7,.9)}
 // Small arched timber bridge: abutments, individual boards, posts, two handrails.
 let bc=layout().bridge.center,bx=bc[0],bz=bc[1],edgeY=Math.max(heightAt(bx-7,bz),heightAt(bx+7,bz))+.45;
 const by=x=>edgeY+1.0*Math.sin(Math.PI*(x-(bx-7))/14);
 for(let s of [-1,1]){box(bx+s*6.5,edgeY-.55,bz,2.1,1.6,6.2,0x888879);for(let j=0;j<8;j++){let x=bx-7+j*2;beam([x,by(x),bz+s*2.4],[x,by(x)+1.6,bz+s*2.4],.13,0x65452e);if(j<7)beam([x,by(x)+1.4,bz+s*2.4],[x+2,by(x+2)+1.4,bz+s*2.4],.11,0x714831)}}
 for(let i=0;i<36;i++){let x=bx-7+(i+.5)*14/36;let m=box(x,by(x),bz,.37,.22,4.9,i%4?0x9a7149:0x89613e);m.rotation.z=Math.cos(Math.PI*(x-bx+7)/14)*.20;}
 // Solid stone approach ramps meet the bridge abutments and the market lane.
 for(let side of [-1,1]){
  const x0=bx+side*7.1,x1=bx+side*11.0;
  const market=roadNetwork()[0].points;
  const roadZ=x=>{for(let i=1;i<market.length;i++){const a=market[i-1],b=market[i];if(x>=a[0]&&x<=b[0])return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}return bz};
  const z0=bz,z1=roadZ(x1),y0=edgeY+.26,y1=heightAt(x1,z1)+.37;
  const pts=[[x0,y0,z0-2.25],[x0,y0,z0+2.25],[x1,y1,z1-2.25],[x1,y1,z1+2.25]];
  const verts=pts.flat().concat(pts.map(p=>[p[0],heightAt(p[0],p[2])-.25,p[2]]).flat());
  const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));ge.setIndex([0,1,2,1,3,2,0,4,1,1,4,5,2,3,6,3,7,6,0,2,4,2,6,4,1,5,3,3,5,7]);ge.computeVertexNormals();
  const m=new THREE.Mesh(ge,new THREE.MeshStandardMaterial({color:0xa6a28c,side:THREE.DoubleSide,roughness:1}));g.add(m);
 }
 // Minor road crossings are stone culverts; the market crossing remains timber.
 for (let zz of [10,-58.2]) {let xx=streamX(zz),hh=Math.max(heightAt(xx-4,zz),heightAt(xx+4,zz))+.45;
 box(xx,hh,zz,9,.55,4.3,0xa6a28c);for(let side of [-1,1])box(xx+side*3.8,hh-1.0,zz,1.2,2,4.6,0x858b7d);}
 // Permanent blockout masses: house stone foundations, temple terrace, working quay.
 for(let l of layout().town.lots){
  // Match town's compact lot11 house while preserving the shared lot anchor.
  const elbow=l.id==='lot11';
  box(l.x+(elbow?1.2:0),l.y+.2,l.z,elbow?6.7:l.w,.7,elbow?6.3:l.d,0x969487);
 }
 box(-46,25.45,54,48,1.1,44,0x9b9a86);box(-46,26.02,54,46,.12,42,0xb5b09a);
 // Low stone retaining perimeter on plateau, open at the two approaches.
 for(let x=-68;x<=-24;x+=2.2)for(let z of [33,75]){if(z===33&&(Math.abs(x+61)<3.3||Math.abs(x+26)<3.3))continue;box(x,26.35,z,2.08,.6,1,0x878a7b)}
 // Harbor is a root-owned stone quay; child owns docks, boats, buildings and equipment.
 box(73.5,1.15,-67,41,3.3,18,0x7f857d);box(73.5,2.84,-67,41,.15,18,0xa6a18d);
 for(let x=54;x<94;x+=2.4)for(let row=0;row<2;row++)box(x+(row%2)*.5,.8+row*1.0,-76.08,2.27,.92,.12,0x95988c);
 // Riprap beneath quay edges joins rock to water, not a floating slab.
 for(let i=0;i<52;i++){let x=51+(i%22)*2.1,z=i<22?-77.5:-72+(i%8)*2;let m=mesh(new THREE.DodecahedronGeometry(1.1,0),0x858b7f,x,.2,z);m.scale.set(1.3,.8,1.1)}
 return g;
}
