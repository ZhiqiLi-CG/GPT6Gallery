import {heightAt, roadNetwork, layout} from './root.js';
const RES=[[-82.5,-54.6,-72.5,-44.5],[-83.5,-59.5,-72.5,-53.5],[-80,-65.5,-76,-58.5],[-82.2,-69,-72.8,-66.8]];
const roads=roadNetwork();
export function coastClear(x,z,r=0){
 if(x-r<-94||x+r>-63||z-r<-79||z+r>-42)return false;
 if(RES.some(b=>x+r>b[0]&&x-r<b[2]&&z+r>b[1]&&z-r<b[3]))return false;
 for(const rd of roads)for(let k=1;k<rd.points.length;k++){const a=rd.points[k-1],b=rd.points[k],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));if(Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)<rd.width/2+.35+r)return false;}
 return true;
}
export function build(THREE,ctx){
 const world=new THREE.Group();world.name='shore-shrine-coast_natural-setting';
 const sea=layout().seaLevel; let seed=762391;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.94,...extra});
 const rockM=[0x4b5350,0x626762,0x59605b,0x70736a,0x454e4b].map(c=>mat(c,{flatShading:true}));
 const wet=mat(0x35483f,{roughness:.46}),moss=mat(0x677449),soil=mat(0x8b856b),bark=mat(0x66584b),barkDark=mat(0x403f35),twigM=mat(0x554b40);
 const pineM=[0x354e3d,0x405a43,0x4d6549,0x385740].map(c=>mat(c));
 const pollen=mat(0xb39267);const flowerM=[0xe4bcc3,0xf1d7d6,0xd6a8b4,0xeacbce].map(c=>mat(c));const grassM=mat(0x798360,{side:THREE.DoubleSide});
 const ico=new THREE.IcosahedronGeometry(1,1),smallIco=new THREE.IcosahedronGeometry(1,0),sphere=new THREE.SphereGeometry(1,7,5),cyl=new THREE.CylinderGeometry(.67,1,1,9);
 const rockG=Array.from({length:5},()=>{const geo=new THREE.IcosahedronGeometry(1,1);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const f=1+.13*Math.sin(x*12.3+y*7.8+z*11.2);p.setXYZ(i,x*f,y*f,z*f)}geo.computeVertexNormals();return geo});
 let group;const batches=[];const dummy=new THREE.Object3D();
 function start(id,kind){group=new THREE.Group();group.name='shore-shrine-coast_'+id;group.userData.kind=kind;world.add(group);}
 function inst(geo,m,x,y,z,sx=1,sy=1,sz=1,rot=0,quat=null){let b=batches.find(b=>b.group===group&&b.geo===geo&&b.mat===m);if(!b){b={group,geo,mat:m,items:[]};batches.push(b)}dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(0,rot,0);if(quat)dummy.quaternion.copy(quat);dummy.updateMatrix();b.items.push(dummy.matrix.clone());}
 function beam(a,b,r,m=bark){const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),v=q.clone().sub(p);const mid=p.clone().add(q).multiplyScalar(.5);inst(cyl,m,...mid.toArray(),r,v.length(),r,0,new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize()));}
 function surface(x,z,rx,rz,m,off=.025){const p=[x,heightAt(x,z)+off,z],idx=[];const n=14;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,s=.84+.16*rnd(),xx=x+Math.cos(a)*rx*s,zz=z+Math.sin(a)*rz*s;p.push(xx,heightAt(xx,zz)+off,zz);idx.push(0,1+(i+1)%n,1+i)}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,m);mesh.receiveShadow=true;group.add(mesh);}
 function rock(x,z,r,h){if([[-88.7,-55.9,.7],[-69.4,-73.15,.65]].some(p=>Math.hypot(x-p[0],z-p[1])<r+p[2]+.06))return;if(!coastClear(x,z,r*1.48))return;const y=heightAt(x,z);inst(rockG[Math.floor(rnd()*5)],rockM[Math.floor(rnd()*5)],x,y+h*.05,z,r,h,r*(.6+rnd()*.4),rnd()*6.28);}
 // Every coast placement follows the actual irregular isohypse, not the district rectangle.
 start('tidal-rocks','weathered-intertidal-rocks-pebbles-and-wrack');
 for(let i=0;i<1950;i++){const x=-93.7+rnd()*30.3,z=-78.7+rnd()*36.4,y=heightAt(x,z);if(y<-.6||y>1.12||!coastClear(x,z,.48)||Math.abs(x+77.5)<3&&z<-65)continue;const r=.17+rnd()*.56;rock(x,z,r,.26+rnd()*.55);if(i%4===0&&y>.01)surface(x,z,.4,.27,wet,.03);}
 for(let i=0;i<2300;i++){const x=-93.8+rnd()*30.5,z=-78.8+rnd()*36.5,y=heightAt(x,z);if(y<-.04||y>1.75||!coastClear(x,z,.16))continue;const r=.035+rnd()*.115;inst(smallIco,rockM[i%5],x,y+.025,z,r,r*.53,r*.71,rnd()*6.28);}
 // Draped kelp straps and attachment points on the damp upper intertidal surface.
 const kelpMat=mat(0x485a36,{side:THREE.DoubleSide,roughness:.6});
 for(let i=0;i<270;i++){const x=-94+rnd()*31,z=-79+rnd()*37,y=heightAt(x,z);if(y<.02||y>.65||!coastClear(x,z,.4))continue;for(let b=0;b<4;b++){const a=rnd()*6.28,len=.18+rnd()*.28,verts=[],ix=[];for(let k=0;k<6;k++){const xx=x+Math.cos(a)*len*k/5,zz=z+Math.sin(a)*len*k/5,w=.015*Math.sin((k+1)/7*Math.PI);for(const side of [-1,1])verts.push(xx+Math.sin(a)*w*side,heightAt(xx,zz)+.035+.025*Math.sin(k),zz-Math.cos(a)*w*side);if(k){const n=k*2;ix.push(n-2,n,n-1,n-1,n,n+1)}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(ix);geo.computeVertexNormals();group.add(new THREE.Mesh(geo,kelpMat));}}
 // Small solid rock basins: a closed stone substrate supports the shallow water and raised rim.
 start('rock-pools','two-rock-supported-tidal-pools');
 for(const [x,z,rx,rz] of [[-88.7,-55.9,.7,.48],[-69.4,-73.15,.65,.42]]){if(!coastClear(x,z,rx+.2))continue;const n=18,v=[],ix=[];let high=-Infinity,low=Infinity;for(let k=0;k<n;k++){const a=k/n*6.283;const h=heightAt(x+Math.cos(a)*rx,z+Math.sin(a)*rz);high=Math.max(high,h);low=Math.min(low,h)}const waterY=high+.12;
 for(let k=0;k<n;k++){const a=k/n*6.283,f=.94+.06*Math.sin(k*7);v.push(x+Math.cos(a)*rx*f,low-.22,z+Math.sin(a)*rz*f,x+Math.cos(a)*rx*f,waterY+.1+.035*Math.sin(k*3),z+Math.sin(a)*rz*f,x+Math.cos(a)*rx*.72,waterY-.08,z+Math.sin(a)*rz*.72);}
 for(let k=0;k<n;k++){const a=k*3,b=((k+1)%n)*3;ix.push(a,b,a+1,b,b+1,a+1,a+1,b+1,a+2,b+1,b+2,a+2)}v.push(x,waterY-.1,z);for(let k=0;k<n;k++)ix.push(n*3,k*3+2,((k+1)%n)*3+2);for(let k=0;k<ix.length;k+=3){const t=ix[k+1];ix[k+1]=ix[k+2];ix[k+2]=t;}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(ix);geo.computeVertexNormals();group.add(new THREE.Mesh(geo,rockM[0]));inst(sphere,mat(0x527f72,{roughness:.19,metalness:.2}),x,waterY-.035,z,rx*.715,.025,rz*.715);for(let j=0;j<15;j++){const a=rnd()*6.28;inst(smallIco,rockM[3],x+Math.cos(a)*rx*.83,waterY+.11,z+Math.sin(a)*rz*.83,.025,.012,.021);}}
 const needleLines=[];
 function pine(x,z,H,id){start(id,'rooted-windswept-pine');const base=heightAt(x,z);const pts=[[x,base-.09,z],[x-.15,base+H*.26,z+.12],[x-.55,base+H*.55,z+.2],[x-.8,base+H*.82,z+.15],[x-.65,base+H,z+.25]];
 for(let k=0;k<4;k++)beam(pts[k],pts[k+1],.27*(1-k*.2));
 for(let j=0;j<7;j++){const a=j/7*6.28,xx=x+Math.cos(a)*.8,zz=z+Math.sin(a)*.8;beam([x,base+.22,z],[xx,heightAt(xx,zz)+.015,zz],.11);}
 for(let j=0;j<28;j++){const a=j*2.4,yy=base+.3+rnd()*H*.6;beam([x+Math.cos(a)*.22-.25,yy,z+Math.sin(a)*.22],[x+Math.cos(a)*.23-.27,yy+.22,z+Math.sin(a)*.23],.018,barkDark);}
 for(let tier=0;tier<4;tier++)for(let j=0;j<3;j++){const a=j*2.1+tier*.78,len=(1.55-tier*.2)*( .85+rnd()*.2),root=[x-.15-tier*.16,base+H*(.39+tier*.15),z+.18],tip=[root[0]+Math.cos(a)*len-.3,root[1]+.27,root[2]+Math.sin(a)*len];if(!coastClear(tip[0],tip[2],.72))continue;beam(root,tip,.075-tier*.014);for(let f=0;f<4;f++){const ang=a+(f-1.5)*.6,end=[tip[0]+Math.cos(ang)*.47,tip[1]+.15+rnd()*.3,tip[2]+Math.sin(ang)*.47];if(!coastClear(end[0],end[2],.55))continue;beam(tip,end,.024,twigM);inst(ico,pineM[(f+tier)%4],...end,.5,.18+rnd()*.14,.43,rnd()*6.28);for(let q=0;q<42;q++){const u=rnd()*6.28,r=Math.sqrt(rnd())*.46,xx=end[0]+Math.cos(u)*r,zz=end[2]+Math.sin(u)*r,yy=end[1]+.08+rnd()*.15;needleLines.push(xx,yy,zz,xx+Math.cos(u)*.13,yy+.08,zz+Math.sin(u)*.13);}}}
 }
 pine(-87.2,-55.8,6.4,'pine-west-shore');pine(-90.4,-44.8,7.1,'pine-west-upper');pine(-66.5,-66.5,6.2,'pine-east-shore');pine(-66.5,-46.2,7.6,'pine-east-upper');
 // Cherry: an exposed forked trunk and fine radial branching carry many small blossom clusters.
 start('cherry','mature-flowering-cherry-with-root-flare-and-petals');
 const cx=-86,cz=-49,cy=heightAt(cx,cz),fork=[cx-.18,cy+2.3,cz];beam([cx,cy-.12,cz],fork,.38);beam(fork,[cx-.4,cy+4.7,cz+.3],.23);
 for(let j=0;j<8;j++){const a=j*6.283/8,xx=cx+Math.cos(a)*1.15,zz=cz+Math.sin(a)*1.15;beam([cx,cy+.32,cz],[xx,heightAt(xx,zz)+.015,zz],.12);}
 for(let j=0;j<9;j++){const a=j*2.3999,rad=1.5+rnd()*.5,tip=[cx+Math.cos(a)*rad,cy+4.25+rnd()*1.6,cz+Math.sin(a)*rad];beam(fork,tip,.13);for(let k=0;k<5;k++){const aa=a+(k-2)*.42,end=[tip[0]+Math.cos(aa)*.75,tip[1]+.35+rnd()*.65,tip[2]+Math.sin(aa)*.75];if(!coastClear(end[0],end[2],.62))continue;beam(tip,end,.038,twigM);for(let q=0;q<11;q++){const xx=end[0]+(rnd()-.5)*.75,yy=end[1]+(rnd()-.4)*.58,zz=end[2]+(rnd()-.5)*.75;if(!coastClear(xx,zz,.3))continue;cloud(xx,yy,zz,.25,q);for(let f=0;f<3;f++){const fx=xx+(rnd()-.5)*.4,fy=yy+.15+rnd()*.12,fz=zz+(rnd()-.5)*.4;for(let p=0;p<5;p++){const pa=p*1.257;inst(sphere,flowerM[(q+f)%4],fx+Math.cos(pa)*.044,fy,fz+Math.sin(pa)*.044,.045,.016,.034,pa);}inst(sphere,matCenter(),fx,fy+.013,fz,.017,.009,.017);}}}}
 // Upright inner shoots break the outer crown ring and carry a light central blossom veil.
 for(let j=0;j<5;j++){const a=j*2.4,end=[cx+Math.cos(a)*(.4+rnd()*.6),cy+5.7+rnd()*.8,cz+Math.sin(a)*(.4+rnd()*.6)];beam([cx-.4,cy+4.7,cz+.3],end,.047,twigM);for(let q=0;q<13;q++){const xx=end[0]+(rnd()-.5)*.65,yy=end[1]+(rnd()-.5)*.55,zz=end[2]+(rnd()-.5)*.65;cloud(xx,yy,zz,.23,q);for(let p=0;p<5;p++){const aa=p*1.257;inst(sphere,flowerM[(q+1)%4],xx+Math.cos(aa)*.044,yy+.19,zz+Math.sin(aa)*.044,.045,.016,.034,aa);}}}
 function cloud(x,y,z,r,index){for(let k=0;k<17;k++){const ny=1-2*(k+.5)/17,phi=k*2.39996,rr=Math.sqrt(1-ny*ny),normal=new THREE.Vector3(Math.cos(phi)*rr,ny,Math.sin(phi)*rr),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),normal),center=new THREE.Vector3(x,y,z).addScaledVector(normal,r*.83);for(let p=0;p<5;p++){const a=p*1.2566,off=new THREE.Vector3(Math.cos(a)*.047,0,Math.sin(a)*.047).applyQuaternion(q).add(center);inst(sphere,flowerM[(index+k)%4],...off.toArray(),.053,.012,.04,a,q);}inst(sphere,pollen,...center.toArray(),.015,.013,.015);}}
 function matCenter(){return pollen;} 
 for(let i=0;i<360;i++){const a=rnd()*6.28,r=Math.sqrt(rnd())*3.1,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;if(!coastClear(x,z,.08))continue;inst(sphere,flowerM[i%4],x,heightAt(x,z)+.032,z,.035,.009,.052,rnd()*6.28);}
 start('caretaker-trace','open-informal-earth-caretaker-trail');
 const trail=[[-84.4,-59.8],[-84.3,-56],[-83.7,-52.8],[-83.6,-48],[-83.4,-44],[-79,-43.1],[-73,-43.1],[-70.8,-46],[-70.7,-54],[-70.5,-57.5]];
 for(let k=1;k<trail.length;k++){const a=trail[k-1],b=trail[k],len=Math.hypot(a[0]-b[0],a[1]-b[1]);for(let t=0;t<len;t+=.3){const x=a[0]+(b[0]-a[0])*t/len,z=a[1]+(b[1]-a[1])*t/len;if(coastClear(x,z,.32))surface(x,z,.32,.35,soil,.032);}}
 start('garden-understory','rooted-moss-shrubs-coastal-grass-and-stepping-rocks');
 function onTrail(x,z){return trail.some(p=>Math.hypot(x-p[0],z-p[1])<.9)}
 const grassPos=[],grassIx=[];
 for(let i=0;i<2200;i++){const x=-93.6+rnd()*30,z=-77.8+rnd()*35.4,y=heightAt(x,z);if(y<.65||!coastClear(x,z,.8)||onTrail(x,z))continue;if(i%5===0)surface(x,z,.25+rnd()*.45,.2+rnd()*.3,moss,.028);if(i%19===0&&y>1.8){for(let s=0;s<5;s++){const xx=x+(rnd()-.5)*.5,zz=z+(rnd()-.5)*.5;inst(ico,pineM[2],xx,heightAt(xx,zz)+.18,zz,.28,.22,.26)}}
 for(let b=0;b<7;b++){const a=rnd()*6.28,l=.18+rnd()*.29,xx=x+(rnd()-.5)*.3,zz=z+(rnd()-.5)*.3,yy=heightAt(xx,zz),ix=grassPos.length/3;grassPos.push(xx-.012,yy,zz,xx+.012,yy,zz,xx+Math.cos(a)*l*.38,yy+l,zz+Math.sin(a)*l*.38);grassIx.push(ix,ix+1,ix+2);}}
 const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(grassPos,3));gg.setIndex(grassIx);gg.computeVertexNormals();group.add(new THREE.Mesh(gg,grassM));
 for(const [x,z] of [[-84.4,-58.9],[-84.3,-58.1],[-84.25,-57.3],[-70.65,-56.5],[-70.65,-55.7]])rock(x,z,.27,.14);
 // Deliberately open low garden and exposed shore retain sight through the gate.
 start('open-east-garden','open-low-coastal-garden');group.userData.registerBBox=[-72.3,1,-59,-63.1,7,-42.1];
 start('open-gate-shore','open-tidal-shore-and-gate-view');group.userData.registerBBox=[-82.2,-4,-79,-72.8,1.1,-69.05];
 for(const b of batches){const m=new THREE.InstancedMesh(b.geo,b.mat,b.items.length);b.items.forEach((v,i)=>m.setMatrixAt(i,v));m.castShadow=true;m.receiveShadow=true;m.instanceMatrix.needsUpdate=true;b.group.add(m);}
 const ng=new THREE.BufferGeometry();ng.setAttribute('position',new THREE.Float32BufferAttribute(needleLines,3));const needles=new THREE.LineSegments(ng,new THREE.LineBasicMaterial({color:0x3d5942}));needles.name='shore-shrine-coast_needle-detail';world.add(needles);
 return world;
}
