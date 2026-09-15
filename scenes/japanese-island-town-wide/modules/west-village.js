import {heightAt,roadNetwork,layout} from './root.js';

export function build(THREE,ctx){
 const group=new THREE.Group();group.name='west-village: ten farming households';
 const material=c=>new THREE.MeshStandardMaterial({color:c,roughness:.88});
 const m={wood:material(0x49382a),woodLight:material(0x8b6846),board:material(0x74543a),dark:material(0x263434),plaster:[material(0xc7b99c),material(0xb5ac93),material(0xd3c3a2),material(0xa89e83)],tile:[material(0x414d56),material(0x515c63),material(0x626b6d)],stone:[material(0x797d74),material(0x919186),material(0x646a64)],soil:material(0x5d4932),earth:material(0x958267),green:[material(0x4b6337),material(0x6a7e3e),material(0x35513a)],pink:[material(0xd8a6b0),material(0xe9bfc4),material(0xc88f9f)],clay:material(0x9b6347),iron:material(0x3e4541),rope:material(0xb2a07a),orange:material(0xc98237),cream:material(0xdbd0ae)};
 const batches=new Map(),boxGeo=new THREE.BoxGeometry(1,1,1),cylGeo=new THREE.CylinderGeometry(1,1,1,10),ballGeo=new THREE.IcosahedronGeometry(1,1),dummy=new THREE.Object3D();
 function add(geo,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){const key=geo.uuid+mat.uuid;if(!batches.has(key))batches.set(key,{geo,mat,transforms:[]});dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(rx,ry,rz);dummy.updateMatrix();batches.get(key).transforms.push(dummy.matrix.clone());}
 const box=(x,y,z,w,h,d,mat=m.wood,ry=0)=>add(boxGeo,mat,x,y,z,w,h,d,0,ry);
 const cyl=(x,y,z,r,h,mat=m.wood)=>add(cylGeo,mat,x,y,z,r,h,r);
 const ball=(x,y,z,rx,ry,rz,mat)=>add(ballGeo,mat,x,y,z,rx,ry,rz);
 function beam(a,b,r,mat=m.wood){const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));dummy.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);dummy.scale.set(r,v.length(),r);dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());dummy.updateMatrix();const key=cylGeo.uuid+mat.uuid;if(!batches.has(key))batches.set(key,{geo:cylGeo,mat,transforms:[]});batches.get(key).transforms.push(dummy.matrix.clone());}
 const roads=roadNetwork();
 function clear(x,z,margin=0){return roads.every(r=>r.points.slice(1).every((b,i)=>{let a=r.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)>r.width/2+.35+margin;}));}
 function fence(a,b){const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.5);for(let i=0;i<=n;i++){let x=a[0]+(b[0]-a[0])*i/n,z=a[1]+(b[1]-a[1])*i/n,y=heightAt(x,z);box(x,y+.62,z,.12,1.24,.12);if(i<n){let xx=a[0]+(b[0]-a[0])*(i+1)/n,zz=a[1]+(b[1]-a[1])*(i+1)/n,yy=heightAt(xx,zz);for(let h of [.38,.91])beam([x,y+h,z],[xx,yy+h,zz],.045,m.woodLight);}}}
 function pot(x,z,r=.3,plant=true){let y=heightAt(x,z);const pts=[new THREE.Vector2(r*.55,0),new THREE.Vector2(r*.95,.12),new THREE.Vector2(r,.48),new THREE.Vector2(r*1.07,.51),new THREE.Vector2(r*.87,.53),new THREE.Vector2(r*.79,.43)];let geo=new THREE.LatheGeometry(pts,12);add(geo,m.clay,x,y+.03,z,1,1,1);cyl(x,y+.45,z,r*.79,.035,m.soil);if(plant)for(let i=0;i<7;i++){let a=i*2.4;ball(x+Math.cos(a)*r*.7,y+.65,z+Math.sin(a)*r*.7,.1,.28,.09,m.green[i%3]);}}
 function barrel(x,z,r=.39){let y=heightAt(x,z);cyl(x,y+.47,z,r,.91,m.woodLight);for(let i=0;i<12;i++){let a=i*Math.PI/6;beam([x+r*Math.cos(a),y+.08,z+r*Math.sin(a)],[x+r*Math.cos(a),y+.88,z+r*Math.sin(a)],.016,m.board);}for(let h of [.17,.7]){const geo=new THREE.TorusGeometry(r+.012,.025,5,16);add(geo,m.iron,x,y+h,z,1,1,1,Math.PI/2);}cyl(x,y+.94,z,r*.93,.045,m.board);}
 function basket(x,z){let y=heightAt(x,z);cyl(x,y+.23,z,.32,.43,m.rope);for(let h=.06;h<.46;h+=.075)add(new THREE.TorusGeometry(.326,.018,4,16),m.board,x,y+h,z,1,1,1,Math.PI/2);for(let i=0;i<7;i++)ball(x+.2*Math.sin(i*2.4),y+.48,z+.2*Math.cos(i*2.4),.105,.085,.11,m.orange);}
 function lantern(x,z){let y=heightAt(x,z);box(x,y+.12,z,.7,.24,.7,m.stone[1]);cyl(x,y+.65,z,.18,.92,m.stone[0]);box(x,y+1.12,z,.54,.16,.54,m.stone[1]);box(x,y+1.42,z,.36,.48,.36,m.dark);for(let dx of [-.23,.23])for(let dz of [-.23,.23])box(x+dx,y+1.4,z+dz,.1,.5,.1,m.stone[1]);add(new THREE.ConeGeometry(.61,.35,4),m.stone[0],x,y+1.82,z,1,1,1,0,Math.PI/4);ball(x,y+2.07,z,.13,.16,.13,m.stone[1]);}
 // Shared tree geometry: tapering woody segments, individual five-petal flowers,
 // and open fans of three-dimensional needles. All six trees reuse these assets.
 const treeWood=material(0x514338),twigWood=material(0x695242),pineColors=[material(0x304833),material(0x42603c),material(0x61794a)];
 const taperGeo=new THREE.CylinderGeometry(.62,1,1,8),flowerVerts=[],needleVerts=[];
 function treeAppend(target,geo){const q=geo.index?geo.toNonIndexed():geo;target.push(...q.attributes.position.array);if(q!==geo)q.dispose();geo.dispose();}
 for(let petal=0;petal<5;petal++){const a=petal*Math.PI*2/5,g=new THREE.IcosahedronGeometry(1,0);g.scale(.017,.007,.011);g.rotateY(-a);g.translate(.020*Math.cos(a),0,.020*Math.sin(a));treeAppend(flowerVerts,g);}
 for(let n=0;n<11;n++){const a=n*2.39996,len=.15+.07*(.5+.5*Math.sin(n*8.3));const end=new THREE.Vector3(Math.cos(a)*len*.74,.06+len*.54,Math.sin(a)*len*.74),g=new THREE.ConeGeometry(.006,end.length(),3);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),end.clone().normalize()));g.translate(end.x/2,end.y/2,end.z/2);treeAppend(needleVerts,g);}
 const flowerGeo=new THREE.BufferGeometry(),needleGeo=new THREE.BufferGeometry();
 flowerGeo.setAttribute('position',new THREE.Float32BufferAttribute(flowerVerts,3));flowerGeo.computeVertexNormals();needleGeo.setAttribute('position',new THREE.Float32BufferAttribute(needleVerts,3));needleGeo.computeVertexNormals();
 function tree(x,z,cherry,seed){
  const y=heightAt(x,z),rand=n=>{const a=Math.sin(n*127.1+seed*311.7+17.2)*43758.5453;return a-Math.floor(a);};
  const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
  function wood(a,b,r,tiny=false){const aa=new THREE.Vector3(x+a[0],y+a[1],z+a[2]),bb=new THREE.Vector3(x+b[0],y+b[1],z+b[2]),v=bb.clone().sub(aa),mat=tiny?twigWood:treeWood;dummy.position.copy(aa.add(bb).multiplyScalar(.5));dummy.scale.set(r,v.length(),r);dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());dummy.updateMatrix();const key=taperGeo.uuid+mat.uuid;if(!batches.has(key))batches.set(key,{geo:taperGeo,mat,transforms:[]});batches.get(key).transforms.push(dummy.matrix.clone());}
  // A bent bole and buttress roots divide into unequal, genuinely connected forks.
  const t0=[0,0,0],t1=[.12*Math.sin(seed+1),.92,.08],t2=[-.12,1.78,.17],t3=[.10,2.52,.06],t4=[-.12,3.40,-.09],t5=[.08,4.22,.06];
  for(let k=0;k<5;k++){const a=k*1.256+seed,b=[Math.cos(a)*.48,.015,Math.sin(a)*.48];wood(b,[t1[0]*.4,.42,t1[2]*.4],.08);}
  wood(t0,t1,.23);wood(t1,t2,.17);wood(t2,t3,.13);wood(t3,t4,.091);wood(t4,t5,.054);
  // Small bark fissures follow the lower trunk; their scale stays below the branching.
  for(let k=0;k<14;k++){const a=k*2.4,hh=.25+rand(k)*1.5,rr=.19-hh*.035;wood([Math.cos(a)*rr,hh,Math.sin(a)*rr+.08],[Math.cos(a)*rr,hh+.12+rand(k+9)*.12,Math.sin(a)*rr+.08],.009,true);}
  if(cherry){
   for(let limb=0;limb<8;limb++){
    const a=limb*2.39996+seed*.81,root=limb<3?t2:limb<6?t3:t4,reach=1.35+rand(limb+10)*.45;
    const elbow=[Math.cos(a)*reach*.58,2.65+limb*.17,Math.sin(a)*reach*.58],tip=[Math.cos(a)*reach,3.30+limb*.16+rand(limb+20)*.22,Math.sin(a)*reach];
    wood(root,elbow,.105-limb*.006);wood(elbow,tip,.067-limb*.003);
    for(let branch=0;branch<3;branch++){
     const ab=a+(branch-1)*.58,origin=mix(elbow,tip,.48+branch*.19),end=[tip[0]+Math.cos(ab)*(.36+rand(limb*9+branch)*.23),tip[1]+.20+branch*.11,tip[2]+Math.sin(ab)*(.36+rand(limb*9+branch)*.23)];
     wood(origin,end,.030,true);
     for(let tw=0;tw<4;tw++){
      const at=ab+(tw-1.5)*.65,base=mix(origin,end,.45+tw*.17),finish=[end[0]+Math.cos(at)*(.24+rand(limb*73+branch*11+tw)*.16),end[1]+.10+rand(tw+limb*9)*.28,end[2]+Math.sin(at)*(.24+rand(limb*73+branch*11+tw)*.16)];
      wood(base,finish,.011,true);
      for(let fork=0;fork<2;fork++){const start=mix(base,finish,.56+fork*.23),aa=at+(fork?1:-1)*.8,ft=[finish[0]+Math.cos(aa)*.14,finish[1]+.09,finish[2]+Math.sin(aa)*.14];wood(start,ft,.0045,true);}
      // Flowers grow in loose sprays along the twig, with open spaces revealing wood.
      for(let f=0;f<34;f++){
       const id=limb*1500+branch*410+tw*80+f,tt=.3+rand(id+100)*.95,c=mix(base,finish,tt),aa=rand(id+200)*Math.PI*2,rr=Math.sqrt(rand(id+300))*.22;
       const fx=c[0]+Math.cos(aa)*rr,fy=c[1]+(rand(id+400)-.4)*.24,fz=c[2]+Math.sin(aa)*rr,scl=.82+rand(id+500)*.43;
       add(flowerGeo,m.pink[Math.floor(rand(id+600)*3)],x+fx,y+fy,z+fz,scl,scl,scl,rand(id+700)*2.2,aa,rand(id+800)*1.6);
      }
     }
    }
   }
  }else{
   // Alternating bent boughs carry secondary branches, branchlets and needle fans.
   for(let limb=0;limb<9;limb++){
    const a=limb*2.39996+seed*.59,tier=limb/8,root=limb<3?t2:limb<6?t3:limb<8?t4:t5,reach=1.72-tier*.61+rand(limb+70)*.28;
    const elbow=[Math.cos(a)*reach*.52,root[1]-.20,Math.sin(a)*reach*.52],tip=[Math.cos(a)*reach,root[1]+.16,Math.sin(a)*reach];
    wood(root,elbow,.086-tier*.040);wood(elbow,tip,.053-tier*.025);
    for(let branch=0;branch<4;branch++){
     const ab=a+(branch%2?1:-1)*(.48+branch*.13),origin=mix(elbow,tip,.30+branch*.18),end=[origin[0]+Math.cos(ab)*(.59-tier*.13),origin[1]+.13+rand(branch+limb*17)*.15,origin[2]+Math.sin(ab)*(.59-tier*.13)];wood(origin,end,.021,true);
     for(let tw=0;tw<5;tw++){
      const at=ab+(tw%2?1:-1)*.85,base=mix(origin,end,.28+tw*.16),finish=[base[0]+Math.cos(at)*.34,base[1]+.13+rand(tw+limb*5)*.12,base[2]+Math.sin(at)*.34];wood(base,finish,.008,true);
      for(let f=0;f<8;f++){const id=limb*900+branch*100+tw*12+f,c=mix(base,finish,.20+f*.115),sc=.75+rand(id)*.47;add(needleGeo,pineColors[Math.floor(rand(id+71)*3)],x+c[0]+(rand(id+15)-.5)*.10,y+c[1],z+c[2]+(rand(id+30)-.5)*.10,sc,sc,sc,(rand(id+31)-.5)*.65,rand(id+41)*6.28,(rand(id+51)-.5)*.65);}
     }
    }
   }
   // Fine upright candles terminate the crown without a solid circular top plate.
   for(let k=0;k<8;k++){const a=k*2.399,end=[t5[0]+Math.cos(a)*.3,t5[1]+.26+rand(k)*.2,t5[2]+Math.sin(a)*.3];wood(t5,end,.010,true);for(let q=0;q<5;q++){const c=mix(t5,end,.4+q*.15);add(needleGeo,pineColors[k%3],x+c[0],y+c[1],z+c[2],1,1,1,0,a,0);}}
  }
 }
 function windowOn(x,y,z,w,h,side,shutter){const rot=side==='x'?Math.PI/2:side==='nx'?-Math.PI/2:side==='nz'?Math.PI:0;const pane=(a,b,c,d,e,f,mat)=>box(x+a*Math.cos(rot)+c*Math.sin(rot),y+b,z-a*Math.sin(rot)+c*Math.cos(rot),d,e,f,mat,rot);pane(0,0,0,w,h,.09,m.dark);for(let a of [-w/2,w/2])pane(a,0,.05,.10,h+.18,.12,m.woodLight);for(let b of [-h/2,h/2])pane(0,b,.05,w+.15,.10,.14,m.woodLight);for(let a=-w/2+.2;a<w/2;a+=.22)pane(a,0,.09,.035,h,.04,m.woodLight);pane(0,0,.09,w,.045,.045,m.woodLight);if(shutter){pane(w*.8,0,.05,w*.46,h,.08,m.board);for(let a=w*.6;a<w;a+=.12)pane(a,0,.1,.035,h,.04,m.woodLight);}}
 const lots=layout().lots.filter(p=>p.district==='west-village');
 lots.forEach((p,i)=>{
 const x=p.x,z=p.z,s=p.front==='east'?1:-1,w=6.65+(i%3)*.23,d=7.4+(i%2)*.3,base=p.y+.58,floors=[1,2,1,1,2,1,1,2,2,1][i],h=floors*2.78,axis=i%3===1?'x':'z';
 // Compacted household earth follows the shared ground without creating another lane.
 const yardPos=[],yardIx=[],N=10;
 for(let iz=0;iz<=N;iz++)for(let ix=0;ix<=N;ix++){const xx=x-5.17+ix*10.34/N,zz=z-6.02+iz*12.04/N;yardPos.push(xx,heightAt(xx,zz)+.055,zz);if(iz&&ix){let a=iz*(N+1)+ix;yardIx.push(a,a-N-2,a-1,a,a-N-1,a-N-2);}}
 const yardGeo=new THREE.BufferGeometry();yardGeo.setAttribute('position',new THREE.Float32BufferAttribute(yardPos,3));yardGeo.setIndex(yardIx);yardGeo.computeVertexNormals();const yard=new THREE.Mesh(yardGeo,m.earth);yard.receiveShadow=true;group.add(yard);
 // Individual masonry courses are founded on the terrain, including their downhill edges.
 for(let side of [-1,1])for(let a=-w/2;a<w/2;a+=.72){let xx=x+a+.34,zz=z+side*d/2,low=heightAt(xx,zz)-.16,hh=base-low;box(xx,low+hh/2,zz,.69,hh,.43,m.stone[(i+Math.round(a*7)+20)%3]);}
 for(let side of [-1,1])for(let a=-d/2+.2;a<d/2;a+=.74){let xx=x+side*w/2,zz=z+a+.34,low=heightAt(xx,zz)-.16,hh=base-low;box(xx,low+hh/2,zz,.43,hh,.7,m.stone[(i+Math.round(a*7)+40)%3]);}
 box(x,base-.08,z,w+.18,.19,d+.18,m.wood);
 for(let xx of [-w/2,w/2])box(x+xx,base+h/2,z,.16,h,d,m.plaster[i%4]);
 for(let zz of [-d/2,d/2])box(x,base+h/2,z+zz,w,h,.16,m.plaster[i%4]);
 for(let xx of [-w/2,w/2])for(let zz=-d/2;zz<=d/2+.01;zz+=d/4)box(x+xx,base+h/2,z+zz,.19,h+.1,.19);
 for(let zz of [-d/2,d/2])for(let xx=-w/2;xx<=w/2+.01;xx+=w/3)box(x+xx,base+h/2,z+zz,.19,h+.1,.19);
 for(let level=0;level<=floors;level++){let yy=base+level*2.78;for(let xx of [-w/2,w/2])box(x+xx,yy,z,.22,.19,d+.15);for(let zz of [-d/2,d/2])box(x,yy,z+zz,w+.15,.19,.22);}
 // Sill-height board cladding with individual vertical battens on all four sides.
 for(let zz of [-d/2-.09,d/2+.09]){box(x,base+.54,z+zz,w,1.04,.09,m.board);for(let xx=-w/2;xx<w/2;xx+=.26)box(x+xx,base+.54,z+zz,.035,1.04,.13,m.woodLight);}
 for(let xx of [-w/2-.09,w/2+.09]){box(x+xx,base+.54,z,.09,1.04,d,m.board);for(let zz=-d/2;zz<d/2;zz+=.26)box(x+xx,base+.54,z+zz,.13,1.04,.035,m.woodLight);}
 const fx=x+s*(w/2+.17);box(fx,base+1.05,z,.11,2.1,1.36,m.dark);for(let dz of [-.72,.72])box(fx+s*.06,base+1.08,z+dz,.16,2.25,.13,m.woodLight);box(fx,base+2.17,z,.2,.15,1.59,m.woodLight);for(let dz=-.57;dz<=.6;dz+=.16)box(fx+s*.08,base+1.04,z+dz,.05,2.02,.04,m.woodLight);box(fx+s*.12,base+.02,z,.47,.16,1.75,m.woodLight);
 for(let level=0;level<floors;level++){for(let xx of [-w/2-.15,w/2+.15])for(let zz of [-2.5,2.5])windowOn(x+xx,base+1.8+level*2.78,z+zz,1.15,1.05,xx>0?'x':'nx',(i+level)%2===0);for(let zz of [-d/2-.15,d/2+.15])for(let xx of [-1.7,1.7])windowOn(x+xx,base+1.8+level*2.78,z+zz,1.2,1.03,zz>0?'z':'nz',i%2===1);}
 const rise=1.7+(i%3)*.22;
 // Closed triangular timber gables keep the roof volume complete at both ends.
 const gw=axis==='z'?w:d,gl=axis==='z'?d:w;
 for(let end of [-1,1]){let v=[-gw/2,0,0,gw/2,0,0,0,rise*.93,0],geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex([0,1,2,2,1,0]);geo.computeVertexNormals();add(geo,m.board,x+(axis==='x'?end*gl/2:0),base+h,z+(axis==='z'?end*gl/2:0),1,1,1,0,axis==='x'?Math.PI/2:0);for(let off=-gw/2+.4;off<gw/2;off+=.55){let hh=rise*.93*(1-Math.abs(off)/(gw/2));box(x+(axis==='z'?off:end*(gl/2+.04)),base+h+hh/2,z+(axis==='z'?end*(gl/2+.04):off),axis==='z'?.07:.1,hh,axis==='z'?.1:.07,m.woodLight);}}
 makeWestRoof(THREE,group,m,{x,y:base+h,z,w:w+1.25,d:d+1.2,rise,axis,seed:i});
 // Small roof flue with louvered smoke outlet and a ceramic rain cap.
 const vx=x-s*1.7,vz=z+.9,half=(axis==='z'?w+1.25:d+1.2)/2,u=axis==='z'?1.7:.9,vy=base+h+rise*Math.pow(1-u/half,1.22);
 box(vx,vy+.29,vz,.43,.74,.43,m.stone[2]);box(vx,vy+.68,vz,.42,.17,.42,m.dark);for(let dx of [-.19,.19])for(let dz of [-.19,.19])box(vx+dx,vy+.69,vz+dz,.05,.23,.05,m.iron);box(vx,vy+.83,vz,.68,.12,.64,m.tile[i%3]);
 // Small tiled entrance canopy, supported by brackets.
 box(fx+s*.4,base+2.38,z,1.35,.16,2.12,m.tile[i%3]);for(let dz of [-.86,.86])beam([fx,base+1.85,z+dz],[fx+s*.83,base+2.35,z+dz],.045,m.woodLight);
 // Entrance steps rise from the actual approach ground and end at the lane edge.
 const edge=-50.5-s*1.48,from=fx+s*.38,n=5;
 for(let k=0;k<n;k++){let xx=from+(edge-from)*(k+.5)/n,yy=heightAt(xx,z);box(xx,yy+.12+(n-1-k)*.045,z,Math.abs(edge-from)/n*.94,.17,1.28,m.stone[k%3]);}
 const rear=x-s*4.72;
 // Kitchen gardens: narrow raised beds with damp furrows, individually planted vegetables.
 for(let row=0;row<2;row++){let xx=rear+row*s*.6;for(let k=0;k<9;k++){let zz=z-3.3+k*.72,yy=heightAt(xx,zz);box(xx,yy+.055,zz,.48,.11,.64,m.soil);if((k+i)%3===0){for(let q=0;q<5;q++){let a=q*1.256;ball(xx+.12*Math.sin(a),yy+.22,zz+.12*Math.cos(a),.19,.1,.12,m.green[q%3]);}ball(xx,yy+.25,zz,.12,.13,.12,m.green[1]);}else for(let q=0;q<3;q++)beam([xx,yy+.07,zz],[xx+.11*Math.sin(q*2.1),yy+.44+(q%2)*.12,zz+.12*Math.cos(q*2.1)],.027,m.green[(q+i)%3]);}}
 for(let zz of [-4.1,4.1])box(rear+s*.3,heightAt(rear,z+zz)+.16,z+zz,1.3,.17,.12,m.woodLight);
 fence([x-s*5.28,z-6.15],[x-s*5.28,z+6.15]);fence([x-s*5.28,z-6.15],[x+s*4.7,z-6.15]);fence([x-s*5.28,z+6.15],[x+s*4.7,z+6.15]);
 // Open side shed keeps work tools and split logs under a full weather roof.
 let sx=x-s*1.6,sz=z+5.1,sy=heightAt(sx,sz)+.1;
 for(let dx of [-1.3,1.3])for(let dz of [-.61,.61])box(sx+dx,sy+1.02,sz+dz,.12,2.04,.12,m.woodLight);
 box(sx,sy+.75,sz+.63,2.75,1.5,.1,m.board);box(sx,sy+2.1,sz,3,.14,1.68,m.tile[(i+1)%3]);for(let k=0;k<11;k++)box(sx-1.4+k*.28,sy+2.19,sz,.05,.04,1.68,m.tile[i%3]);
 for(let k=0;k<16;k++){let xx=sx-.98+(k%5)*.29,yy=sy+.15+Math.floor(k/5)*.24;beam([xx,yy,sz-.4],[xx+.05,yy,sz+.38],.12,m.board);ball(xx,yy,sz-.42,.106,.1,.017,m.woodLight);}
 for(let k=0;k<2;k++){let xx=sx+.75+k*.28;beam([xx,sy+.1,sz-.3],[xx-.3,sy+1.65,sz+.4],.025,m.woodLight);box(xx,sy+.18,sz-.29,.22,.3,.065,m.iron);}
 const rackx=x+s*1.5,rackz=z-5.15,ry=heightAt(rackx,rackz);
 for(let dx of [-1.25,1.25])box(rackx+dx,ry+1.06,rackz,.1,2.12,.1,m.woodLight);
 beam([rackx-1.35,ry+2,rackz],[rackx+1.35,ry+2,rackz],.05,m.wood);
 for(let k=0;k<9;k++){let xx=rackx-1.08+k*.27;beam([xx,ry+1.98,rackz],[xx,ry+1.5,rackz],.012,m.rope);for(let q=0;q<3;q++)ball(xx,ry+1.61-q*.18,rackz,.075,.11,.075,i%2?m.cream:m.orange);}
 barrel(x+s*4.32,z+3.3);basket(x+s*4.32,z-3.5);pot(x+s*4.22,z+1.6,.28);pot(x+s*4.2,z-1.55,.26,i%2===0);
 // Outdoor low workbench and baskets distinguish farm-facing domestic work.
 let tx=x+.1,tz=z-5.15,ty=heightAt(tx,tz);box(tx,ty+.66,tz,1.1,.12,.66,m.woodLight);for(let dx of [-.43,.43])for(let dz of [-.22,.22])box(tx+dx,ty+.32,tz+dz,.09,.64,.09,m.wood);for(let k=0;k<4;k++)ball(tx-.3+k*.2,ty+.78,tz,.08,.1,.08,m.orange);
 if(i%3===0)lantern(x+s*4.66,z+4.95);
 });
 for(const [x,z,s] of [[-61.3,-19,0],[-39,14,1],[-61.5,30,2]])if(clear(x,z,1.5))tree(x,z,true,s);
 for(const [x,z,s] of [[-38.5,-41,3],[-63,-1.7,4],[-38.8,29,5]])if(clear(x,z,1.2))tree(x,z,false,s);
 for(const {geo,mat,transforms} of batches.values()){const mesh=new THREE.InstancedMesh(geo,mat,transforms.length);transforms.forEach((a,i)=>mesh.setMatrixAt(i,a));mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}
 return group;
}
// Ceramic roof assembly. Local u crosses the ridge; v runs along it.
// x/z are world center, y is tile eave datum; w/d are total roof footprint.
function makeWestRoof(THREE, group, mats, {x,y,z,w,d,rise,axis='z',seed=0}) {
  const roof = new THREE.Group();
  roof.name = 'west-ceramic-roof';
  roof.position.set(x,y,z);
  if (axis === 'x') roof.rotation.y = Math.PI / 2;
  group.add(roof);
  const H = (axis === 'x' ? d : w)/2;
  const L = (axis === 'x' ? w : d);
  const tiles = Array.isArray(mats.tile) ? mats.tile : [mats.tile];
  const batches = [...tiles.map(()=>[]),[],[]];
  const timber = tiles.length, pale = timber+1;
  const height = u => rise*Math.pow(Math.max(0,1-Math.abs(u)/H),1.22);
  const P = (u,v,off=0) => [u,height(u)+off,v];
  function quad(batch,a,b,c,d,reverse=false) {
    const q=batches[batch];
    for (const p of (reverse ? [a,c,b,a,d,c] : [a,b,c,a,c,d])) q.push(...p);
  }
  function append(batch,geo) {
    const a=geo.index ? geo.toNonIndexed() : geo;
    batches[batch].push(...a.attributes.position.array);
    if (a!==geo) a.dispose();
    geo.dispose();
  }
  function beam(a,b,width,depth,batch=timber) {
    const va=new THREE.Vector3(...a), vb=new THREE.Vector3(...b);
    const v=vb.clone().sub(va), mid=va.clone().add(vb).multiplyScalar(.5);
    const geo=new THREE.BoxGeometry(width,v.length(),depth);
    geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize()));
    geo.translate(mid.x,mid.y,mid.z);append(batch,geo);
  }
  function tube(a,b,r,batch,sides=7) {
    const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),v=vb.clone().sub(va);
    const geo=new THREE.CylinderGeometry(r,r,v.length(),sides,1,false);
    geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize()));
    const mid=va.add(vb).multiplyScalar(.5);geo.translate(mid.x,mid.y,mid.z);append(batch,geo);
  }
  // A closed, gently swept substrate, including soffits and all four edges.
  const steps=Math.max(8,Math.ceil(H/.38));
  for (const sign of [-1,1]) {
    for (let i=0;i<steps;i++) {
      const u0=sign*H*i/steps,u1=sign*H*(i+1)/steps;
      quad(timber,P(u0,-L/2,-.065),P(u0,L/2,-.065),P(u1,L/2,-.065),P(u1,-L/2,-.065),sign<0);
      quad(pale,P(u0,-L/2,-.19),P(u0,L/2,-.19),P(u1,L/2,-.19),P(u1,-L/2,-.19),sign>0);
      for (const end of [-1,1]) {
        const v=end*L/2;
        quad(timber,P(u0,v,-.065),P(u1,v,-.065),P(u1,v,-.19),P(u0,v,-.19),sign*end<0);
      }
    }
    const u=sign*H;
    quad(timber,P(u,-L/2,-.065),P(u,L/2,-.065),P(u,L/2,-.19),P(u,-L/2,-.19),sign<0);
    // Tile pans have physical crosswise curvature, raised seams and overlapping noses.
    const rows=Math.max(5,Math.ceil(H/.34)),cols=Math.max(5,Math.floor(L/.34));
    const du=H/rows,dv=(L-.06)/cols;
    for (let row=0;row<rows;row++) for (let col=0;col<cols;col++) {
      const u0=sign*row*du,u1=sign*Math.min(H-.05,(row+1)*du+.045);
      const v0=-L/2+.03+col*dv+.018,v1=v0+dv-.018;
      const material=((row*17+col*13+seed*7)%tiles.length+tiles.length)%tiles.length;
      for (let k=0;k<4;k++) {
        const f0=k/4,f1=(k+1)/4;
        const va=v0+(v1-v0)*f0,vb=v0+(v1-v0)*f1;
        const lift0=.022+.038*Math.pow(2*f0-1,2),lift1=.022+.038*Math.pow(2*f1-1,2);
        quad(material,P(u0,va,lift0),P(u0,vb,lift1),P(u1,vb,lift1+.025),P(u1,va,lift0+.025),sign<0);
        // Exposed tile front edge gives a genuine stepped course in grazing views.
        quad(material,P(u1,va,lift0+.025),P(u1,vb,lift1+.025),P(u1,vb,lift1-.014),P(u1,va,lift0-.014),sign<0);
      }
      const vc=v0-.006;
      tube(P(u0,vc,.067),P(u1,vc,.080),.037,material,6);
    }
    // Exposed rafter tails follow the roof sweep under the tile soffit.
    const rafters=Math.max(7,Math.round((L-.28)/.56));
    for (let r=0;r<=rafters;r++) {
      const v=-L/2+.14+(L-.28)*r/rafters;
      for (let j=0;j<4;j++) {
        const ua=sign*H*j/4,ub=sign*(H-.035)*(j+1)/4;
        beam(P(ua,v,-.245),P(ub,v,-.245),.095,.12,pale);
      }
    }
    // Fascia and bargeboards remain just inside the published roof footprint.
    beam(P(sign*(H-.055),-L/2+.045,-.19),P(sign*(H-.055),L/2-.045,-.19),.11,.17,timber);
    for (const end of [-1,1]) for (let j=0;j<6;j++) {
      const ua=sign*H*j/6,ub=sign*Math.min(H-.06,H*(j+1)/6);
      beam(P(ua,end*(L/2-.075),-.21),P(ub,end*(L/2-.075),-.21),.12,.15,timber);
    }
  }
  // Layered ridge bedding and overlapping half-round fired cap tiles.
  beam([0,rise-.015,-L/2+.06],[0,rise-.015,L/2-.06],.27,.13,0);
  const caps=Math.ceil(L/.38),segment=(L-.06)/caps;
  for (let i=0;i<caps;i++) {
    const va=-L/2+.03+i*segment,vb=Math.min(L/2-.02,va+segment+.025),m=(i+seed)%tiles.length;
    for (let k=0;k<8;k++) {
      const a=k*Math.PI/8,b=(k+1)*Math.PI/8;
      const p=(t,v,r)=>[r*Math.cos(t),rise+.06+r*Math.sin(t),v];
      quad(m,p(a,va,.185),p(a,vb,.185),p(b,vb,.185),p(b,va,.185),true);
      quad(m,p(a,va,.145),p(b,va,.145),p(b,vb,.145),p(a,vb,.145),true);
      for (const vv of [va,vb]) quad(m,p(a,vv,.145),p(a,vv,.185),p(b,vv,.185),p(b,vv,.145),vv===vb);
    }
  }
  // Small tiled end finials, restrained enough for an ordinary village dwelling.
  for (const end of [-1,1]) {
    const v=end*(L/2-.10);
    tube([0,rise+.13,v],[0,rise+.35,v-end*.04],.078,0,8);
    tube([0,rise+.35,v-end*.04],[0,rise+.42,v-end*.12],.055,0,8);
  }
  batches.forEach((positions,i)=>{
    if (!positions.length) return;
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geo.computeVertexNormals();geo.computeBoundingSphere();
    const mesh=new THREE.Mesh(geo,i<tiles.length?tiles[i]:i===timber?mats.wood:mats.woodLight);
    mesh.castShadow=true;mesh.receiveShadow=true;roof.add(mesh);
  });
  return roof;
}
