import {heightAt,roadNetwork,layout} from './root.js';
// All terrace earthwork and hydraulics remain one assembly. Farmyard reservations
// are separate so storage and horticulture can develop without moving field edges.
export const farmReservations={storage:[-95,-19,-80,-7],garden:[-73,53,-66,61]};
export const terraceFootprints=[
 {id:'west_lower',p:[[-92.8,-4.7],[-83,-5.3],[-79.4,-3],[-79.2,8.7],[-84,10],[-93.2,7.4],[-94,1.5]]},
 {id:'west_middle',p:[[-92.6,13.4],[-86,12.2],[-79.2,13.6],[-79.1,25],[-84,26.2],[-91.2,24.3],[-93.1,20.2]]},
 {id:'west_upper',p:[[-86.5,29.1],[-82.5,28.7],[-79.1,29.4],[-78.6,35.8],[-81,36.7],[-86,34.3]]},
 {id:'east_lower',p:[[-75.1,-17.5],[-69,-17.7],[-66.9,-15.6],[-66.9,-3],[-70,-1.8],[-74.9,-3]]},
 {id:'east_middle',p:[[-74.8,1.2],[-69,0.8],[-66.8,3],[-66.8,16.3],[-70.5,17.7],[-74.8,16.2]]},
 {id:'east_upper',p:[[-74.7,20.6],[-70,19.9],[-66.8,21.8],[-66.8,33],[-70.5,34.4],[-74.3,32.8]]},
 {id:'north_small',p:[[-72,47],[-70,47.5],[-67.6,49.2],[-68,51],[-70,50.2],[-72.5,48.8]]}
];
const inside=(x,z,p)=>{let b=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],c=p[j];if(((a[1]>z)!==(c[1]>z))&&(x<(c[0]-a[0])*(z-a[1])/(c[1]-a[1])+a[0]))b=!b}return b};
export function terraceLevel(p){let h=-99;const xs=p.map(a=>a[0]),zs=p.map(a=>a[1]);for(let x=Math.min(...xs);x<=Math.max(...xs);x+=.3)for(let z=Math.min(...zs);z<=Math.max(...zs);z+=.3)if(inside(x,z,p))h=Math.max(h,heightAt(x,z));for(const [x,z]of p)h=Math.max(h,heightAt(x,z));return h+.18}
export function build(THREE,ctx){
 const g=new THREE.Group();g.name='rice-terraces_founded_fields';const roads=roadNetwork(),district=layout().districts.find(d=>d.id==='rice-terraces');
 const mat=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.91,...o});
 const earth=mat(0x6b6141),mud=mat(0x504e32),stone=[mat(0x76786a),mat(0x8c8b77),mat(0x636d61),mat(0x99947f)],bank=mat(0x8b8b55),wood=mat(0x786044),darkwood=mat(0x514735),wet=mat(0x829679,{roughness:.24,metalness:.2,transparent:true,opacity:.77}),water=mat(0x729c99,{roughness:.19,metalness:.25}),moss=mat(0x607446);
 const riceM=[mat(0x6c922f,{side:THREE.DoubleSide}),mat(0x8da83c,{side:THREE.DoubleSide}),mat(0x527b2c,{side:THREE.DoubleSide})];
 function mesh(geo,m,x=0,y=0,z=0){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
 const boxGeo=new THREE.BoxGeometry(1,1,1);function box(w,h,d,m,x,y,z,rot=0){const o=mesh(boxGeo,m,x,y,z);o.scale.set(w,h,d);o.rotation.y=rot;return o}
 function beam(a,b,w,d,m){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),o=mesh(boxGeo,m);o.position.copy(av.clone().add(bv).multiplyScalar(.5));o.scale.set(w,av.distanceTo(bv),d);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),bv.sub(av).normalize());return o}
 function poly(p,y,m){const shape=new THREE.Shape();shape.moveTo(...p[0]);for(const pt of p.slice(1))shape.lineTo(...pt);shape.closePath();const q=new THREE.ShapeGeometry(shape);q.rotateX(Math.PI/2); // shape x,y -> world x,z, reversed facing; double-sided below
 const a=q.attributes.position;for(let i=0;i<a.count;i++)a.setY(i,y);q.computeVertexNormals();const o=mesh(q,m);o.material.side=THREE.DoubleSide;return o}
 function edgeDist(x,z,p){let d=99;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));d=Math.min(d,Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz))}return d}
 function laneFree(x,z){return roads.every(r=>r.points.slice(1).every((b,i)=>{const a=r.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)>r.width/2+.65}))}
 const riceVerts=[[],[],[]],riceIdx=[[],[],[]];let clumps=0;
 function rice(x,y,z,k){const a=riceVerts[k],ix=riceIdx[k];for(let j=0;j<7;j++){const theta=j*2.399+k*.31,hh=.63+.19*Math.sin(j*7.3+x*8+z),lean=.21+.07*Math.sin(j+z),dx=Math.cos(theta),dz=Math.sin(theta),wx=-dz*.027,wz=dx*.027,base=a.length/3; a.push(x+wx,y,z+wz,x-wx,y,z-wz,x+dx*lean*.5-wx*.65,y+hh*.65,z+dz*lean*.5-wz*.65,x+dx*lean*.5+wx*.65,y+hh*.65,z+dz*lean*.5+wz*.65,x+dx*lean,y+hh,z+dz*lean);ix.push(base,base+1,base+2,base,base+2,base+3,base+3,base+2,base+4)}clumps++}
 function stairs(x,z,y,dx,dz,maxLength=2.0){const length=maxLength,ground=heightAt(x+dx*length,z+dz*length)+.08,n=Math.max(2,Math.ceil((y-ground)/.21));for(let i=0;i<n;i++){const t=(i+.5)/n,xx=x+dx*t*length,zz=z+dz*t*length,top=y-(y-ground)*t,bottom=heightAt(xx,zz)-.22;box(Math.abs(dx)>.1?length/n+.025:.85,Math.max(.12,top-bottom),Math.abs(dz)>.1?length/n+.025:.85,stone[i%4],xx,(top+bottom)/2,zz)}}
 function trough(points,width=.26){for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[2]-a[2],len=Math.hypot(dx,dz),nx=-dz/len,nz=dx/len;beam([a[0],a[1]-.09,a[2]],[b[0],b[1]-.09,b[2]],width+.14,.1,darkwood);beam(a,b,width,.04,water);for(const side of [-1,1])beam([a[0]+nx*side*(width/2+.035),a[1]+.045,a[2]+nz*side*(width/2+.035)],[b[0]+nx*side*(width/2+.035),b[1]+.045,b[2]+nz*side*(width/2+.035)],.075,.16,wood);for(let j=0;j<=len;j+=1.3){const t=j/len,x=a[0]+dx*t,z=a[2]+dz*t,y=a[1]+(b[1]-a[1])*t,bottom=heightAt(x,z)-.18;if(y>bottom+.35)box(.14,y-.12-bottom,.14,darkwood,x,(y-.12+bottom)/2,z)}}}
 function basin(x,z,level){const ground=heightAt(x,z)-.15;box(1.05,level-.16-ground,1.05,stone[2],x,(level-.16+ground)/2,z);for(const dx of [-.56,.56])box(.18,.45,1.26,stone[0],x+dx,level-.06,z);for(const dz of [-.56,.56])box(1.25,.45,.18,stone[1],x,level-.06,z+dz);box(.96,.045,.96,water,x,level,z);for(let i=0;i<5;i++){const o=mesh(new THREE.DodecahedronGeometry(.26+(i%2)*.1),stone[i%4],x-.36+i*.17,level+.11,z+.68);o.scale.set(1,.7,.8)}beam([x,level+.23,z+.7],[x,level+.01,z+.35],.13,.04,water)}

 for(let f=0;f<terraceFootprints.length;f++){
  const {p,id}=terraceFootprints[f],y=terraceLevel(p),cx=p.reduce((s,a)=>s+a[0],0)/p.length,cz=p.reduce((s,a)=>s+a[1],0)/p.length;
  // Solid closed earth core follows densely sampled ground at every edge.
  const v=[],ix=[];let ring=[];for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.4);for(let j=0;j<n;j++)ring.push([a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n])}
  for(const [x,z]of ring)v.push(x,heightAt(x,z)-.4,z,x,y-.09,z);for(let i=0;i<ring.length;i++){const a=i*2,b=((i+1)%ring.length)*2;ix.push(a,b,b+1,a,b+1,a+1)}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(ix);geo.computeVertexNormals();mesh(geo,earth);poly(p,y-.085,mud);poly(p.map(a=>[cx+(a[0]-cx)*.987,cz+(a[1]-cz)*.987]),y,wet);
  // Level stone courses with staggered joints, varied sizes and a buried toe.
  for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],len=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/len,dz=(b[1]-a[1])/len,rot=-Math.atan2(dz,dx),minBase=Math.min(...ring.map(pt=>heightAt(...pt)))-.45,courses=Math.ceil((y+.14-minBase)/.29);
   for(let c=0;c<courses;c++){let start=-(c%2)*.33;while(start<len){const end=Math.min(len,start+.53+.19*(.5+.5*Math.sin(start*4+c*7+i))),left=Math.max(0,start),ss=(left+end)/2,x=a[0]+dx*ss,z=a[1]+dz*ss,top=y+.14-c*.29,bottom=Math.max(top-.275,Math.min(heightAt(x-.25*dx,z-.25*dz),heightAt(x+.25*dx,z+.25*dz))-.30);if(top>bottom&&end-left>.035)box(end-left-.019,top-bottom,.48+.04*Math.sin(c*3+ss),stone[(c+Math.floor(ss*3)+f)%4],x,(top+bottom)/2,z,rot);start=end}}
   const n=Math.ceil(len/.65);for(let j=0;j<n;j++){const t=(j+.5)/n,x=a[0]+dx*len*t,z=a[1]+dz*len*t;box(len/n+.015,.17,.65,bank,x,y+.18,z,rot);if(j%5===1)box(.2,.06,.27,moss,x,y+.28,z,rot)}
  }
  const xmin=Math.min(...p.map(a=>a[0])),xmax=Math.max(...p.map(a=>a[0])),zmin=Math.min(...p.map(a=>a[1])),zmax=Math.max(...p.map(a=>a[1]));
  for(let z=zmin+.72,row=0;z<zmax;z+=.67,row++)for(let x=xmin+.7;x<xmax;x+=.55)if(inside(x,z,p)&&edgeDist(x,z,p)>.62)rice(x+.025*Math.sin(row*2+x),y+.015,z,(row+f)%3);
  for(let zz=zmin+.65;zz<zmax;zz+=1.34)for(let xx=xmin+.8;xx<xmax;xx+=1.1)if(inside(xx,zz,p)&&edgeDist(xx,zz,p)>.75){box(.33,.009,.025,water,xx,y+.011,zz+.21);}
  // Timber gated inlet, pegged sluice, overflow lip and small shining downstream spill.
  const a=p[0],b=p[1],sx=(a[0]+b[0])*.5,sz=(a[1]+b[1])*.5,angle=-Math.atan2(b[1]-a[1],b[0]-a[0]);
  box(.88,.12,.65,darkwood,sx,y+.31,sz,angle);for(const side of [-1,1]){box(.1,.8,.12,wood,sx+side*.39,y+.57,sz);box(.1,.08,.62,wood,sx+side*.39,y+.47,sz)}for(let j=0;j<3;j++)box(.66,.12,.07,wood,sx,y+.37+j*.12,sz,angle);box(.09,.48,.09,darkwood,sx,y+.94,sz);box(.33,.07,.09,wood,sx,y+1.13,sz);
  const e=p[Math.floor(p.length/2)],tx=e[0],tz=e[1];box(.7,.07,.82,stone[1],tx,y+.12,tz);beam([tx,y+.09,tz],[tx-.3,y-.5,tz+.2],.33,.05,water);
  // Side access reaches the existing lane without moving or masking its surface.
  const east=f<3;const ax=east?xmax:xmin,az=cz;if(f===6)stairs(xmin-.28,49.1,y+.22,-1,0,1.45);else stairs(cx,f===3?zmax+.25:zmin-.24,y+.22,0,f===3?1:-1,f===0?1.10:f===3?1.50:1.65);
  // Field marker boards and spare hand trowel beside access.
  const mx=ax+(east?.04:-.04);box(.065,.85,.065,wood,mx,heightAt(mx,az)+.43,az+.8);box(.38,.22,.045,wood,mx,heightAt(mx,az)+.75,az+.8);
 }
 for(let k=0;k<3;k++){const q=new THREE.BufferGeometry();q.setAttribute('position',new THREE.Float32BufferAttribute(riceVerts[k],3));q.setIndex(riceIdx[k]);q.computeVertexNormals();mesh(q,riceM[k])}
 // Lined irrigation rills follow terrain and sit alongside the field lane. Stone
 // cheeks surround visible water; compact plank crossings bridge only the rills.
 const fieldX=z=>z<1?-77+(z-1)/24:z>28?-77+(z-28)/18:-77;
 for(const [side,z0,z1]of [[-1,-5,27],[1,-17,33]]){for(let z=z0;z<z1;z+=.65){const x=fieldX(z)+side*1.99,y=heightAt(x,z)+.10;box(.35,.06,.68,water,x,y,z);for(const dx of [-.25,.25])box(.15,.24,.68,stone[Math.floor(z+100)%4],x+dx,y+.025,z)}for(const z of [0,14,26])if(z>z0&&z<z1){const x=fieldX(z)+side*1.99,y=heightAt(x,z)+.32;for(let j=0;j<4;j++)box(.72,.09,.18,wood,x,y,z+(j-1.5)*.20);for(const dz of [-.39,.39])box(.74,.11,.09,darkwood,x,y-.07,z+dz)}}
 // Two collection basins distribute by gravity. Troughs lie on the bunds;
 // the short gap at the north lane is a buried culvert with visible outfall.
 const levels=terraceFootprints.map(f=>terraceLevel(f.p));
 const fx=-67.25,fz=36.9,fy=heightAt(fx,fz)+.57;basin(fx,fz,fy);
 trough([[fx,fy,fz-.5],[fx,levels[5]+.14,33],[-67.05,levels[5]+.10,22]]);
 trough([[-67.05,levels[5]+.1,22],[-66.85,levels[4]+.2,17],[-66.85,levels[4]+.12,3],[-66.95,levels[3]+.2,-2.7],[-66.95,levels[3]+.12,-13]]);
 // North supply disappears under the existing road; headwalls stay outside its clearance.
 trough([[fx,fy,fz+.5],[fx,fy-.035,39.1]]);
 const ny=levels[6];box(.8,.45,.35,stone[1],-67.5,heightAt(-67.5,45.55)+.12,45.55);
 trough([[-67.5,heightAt(-67.5,45.55)+.24,45.55],[-67.75,ny+.15,49.1],[-69,ny+.09,48.3]]);
 const wx=-80.3,wz=27.7,wy=Math.max(levels[1],levels[2])+.58;basin(wx,wz,wy);
 trough([[wx,wy,wz+.48],[-79.5,levels[2]+.15,29.2],[-79.15,levels[2]+.1,32.3]]);
 trough([[wx,wy,wz-.48],[-79.15,levels[1]+.16,24.3],[-79.2,levels[1]+.12,14],[-79.45,levels[0]+.17,8.5],[-79.5,levels[0]+.12,-2.3]]);
 // Short spill lips at each water level carry the feed over the inner rim.
 for(const [x,z,y,dir] of [[-79.2,18,levels[1],-1],[-79.5,3,levels[0],-1],[-79.2,31,levels[2],-1],[-67.05,27,levels[5],-1],[-66.85,10,levels[4],-1],[-66.95,-8,levels[3],-1]])trough([[x,y+.12,z],[x+dir*.62,y+.025,z]],.22);
 // Ground-following stones connect the lane margins to terrace stairs without
 // occupying either child's yard or paving over the shared road.
 for(const [x0,z0,x1,z1]of [[-78.8,11,-85.5,11],[-75.2,-.2,-71,-.2],[-75.1,18.7,-71.6,18.3],[-78.8,27.2,-82.2,27.2],[-72.7,46,-71.5,46]]){const len=Math.hypot(x1-x0,z1-z0);for(let t=.4;t<len;t+=.52){const x=x0+(x1-x0)*t/len,z=z0+(z1-z0)*t/len;if(laneFree(x,z))box(.42,.12,.38,stone[Math.floor(t*4)%4],x,heightAt(x,z)+.09,z,.12*Math.sin(t*6))}}
 // Final circulation joins stop at the child reservations: the garden begins
 // at z53, and the storage yard ends at x-80. Child construction stays intact.
 for(const [x,z] of [[-74.25,48.0],[-74.30,48.55],[-74.28,49.65],[-74.12,50.18],[-73.83,50.68],[-73.51,51.14],[-73.15,51.58],[-72.82,52.02],[-72.53,52.43],[-72.33,52.78],[-79.79,-14.05]]){
  if(!laneFree(x,z))continue;
  const top=Math.max(heightAt(x-.19,z-.16),heightAt(x+.19,z+.16),heightAt(x-.19,z+.16),heightAt(x+.19,z-.16))+.055;
  const bottom=Math.min(heightAt(x-.19,z-.16),heightAt(x+.19,z+.16))-.10;
  box(.38,top-bottom,.32,stone[Math.round((z+20)*7)%4],x,(top+bottom)/2,z,.08*Math.sin(z*3));
 }
 // Sparse bund weeds soften masonry but leave the agricultural rows dominant.
 for(let i=0;i<130;i++){const x=-94.5+27*((Math.sin(i*71.3)+1)/2),z=-5+46*((Math.sin(i*23.8)+1)/2);if(!laneFree(x,z)||terraceFootprints.some(f=>inside(x,z,f.p))||heightAt(x,z)<2)continue;const y=heightAt(x,z);for(let j=0;j<3;j++)beam([x,y,z],[x+.13*Math.sin(i+j),y+.18+.09*j,z+.15*Math.cos(i+j)],.023,.027,moss)}
 g.userData.riceClumps=clumps;g.userData.terraces=7;g.userData.reservations=farmReservations;return g;
}
