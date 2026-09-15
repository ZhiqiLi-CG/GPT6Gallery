import {heightAt,roadNetwork,layout} from './root.js';
import {templeLayout} from './temple.js';

export function build(THREE,ctx){
 const L=templeLayout(),site=L.pagoda,shared=layout(),roads=roadNetwork();
 const g=new THREE.Group();g.name='temple-pagoda: five-storey timber and ceramic tower';
 const cx=site.x,cz=site.z,base=L.terraceY;
 const materials={},batches=new Map();
 function mat(n,c,roughness=.86,metalness=0){materials[n]=new THREE.MeshStandardMaterial({color:c,roughness,metalness});}
 mat('wood',0x70503a);mat('beam',0x4c392d);mat('end',0x947052);mat('panel',0x796048);mat('grain',0x584432);mat('dark',0x262821);mat('plaster',0xb6ac92);mat('stone',0x85877c);mat('stone2',0x97998c);mat('joint',0x66685e);mat('metal',0x555e52,.52,.65);mat('brass',0x8c8160,.57,.58);
 for(let i=0;i<5;i++)mat('tile'+i,[0x47565d,0x4c5a62,0x536168,0x414e56,0x58656a][i]);
 const geo={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(1,1,1,10),ball:new THREE.SphereGeometry(1,10,6)};
 const dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0);
 function instance(shape,m,p,s,q){const key=shape+':'+m;if(!batches.has(key))batches.set(key,[]);dummy.position.set(...p);dummy.scale.set(...s);dummy.quaternion.identity();if(q)dummy.quaternion.copy(q);dummy.updateMatrix();batches.get(key).push(dummy.matrix.clone());}
 function box(m,x,y,z,w,h,d){instance('box',m,[cx+x,y,cz+z],[w,h,d]);}
 function beam(m,a,b,w,d=w,round=false){const av=new THREE.Vector3(cx+a[0],a[1],cz+a[2]),bv=new THREE.Vector3(cx+b[0],b[1],cz+b[2]),v=bv.clone().sub(av),q=new THREE.Quaternion().setFromUnitVectors(up,v.clone().normalize());instance(round?'cyl':'box',m,av.add(bv).multiplyScalar(.5).toArray(),[w,v.length(),d],q);}
 function cyl(m,x,y,z,r,h){instance('cyl',m,[cx+x,y,cz+z],[r,h,r]);}
 function ball(m,x,y,z,r){instance('ball',m,[cx+x,y,cz+z],[r,r,r]);}
 function side(s,a,y,r){return s===0?[a,y,-r]:s===1?[r,y,a]:s===2?[-a,y,r]:[-r,y,-a];}
 function sb(s,m,a,y,r,w,h,d){const p=side(s,a,y,r);box(m,...p,s%2?d:w,h,s%2?w:d);}
 // Sample the hill; the parent's solid terrace carries the buried portion below y24.
 for(let x=-5.45;x<5.45;x+=1.09)for(let z=-5.45;z<5.45;z+=1.09){const bottom=Math.max(24,Math.min(heightAt(cx+x,cz+z),heightAt(cx+x+1.09,cz+z+1.09))-.18);box('joint',x+.545,(bottom+base+.35)/2,z+.545,1.09,base+.35-bottom,1.09);}
 for(let s=0;s<4;s++)for(let row=0;row<2;row++)for(let k=0;k<10;k++)sb(s,(k+row)%3?'stone':'stone2',-4.95+k*1.1,base+.18+row*.32,5.5,1.065,.295,.44);
 box('stone2',0,base+.69,0,11.55,.25,11.55);
 const floor0=base+1.12;
 box('beam',0,floor0-.19,0,10.4,.36,10.4);
 // South approach: solid risers, worn broad treads and cheek blocks.
 for(let i=0;i<4;i++){const top=base+.25+(3-i)*.245,z=-5.35-i*.47;box('stone',0,(base+top)/2,z,3.15,top-base,.52);box('stone2',0,top+.035,z,3.24,.07,.55);}
 for(let s of [-1,1])for(let i=0;i<4;i++)box('stone',s*1.77,base+.18+(3-i)*.14,-5.4-i*.46,.34,.35+(3-i)*.28,.5);
 const tiers=[];
 for(let t=0;t<5;t++){
  const f=floor0+t*4.9,body=3.9-t*.5,bal=body+.97,eave=7.25-t*.9,ey=f+3.32,rise=2.08;
  tiers.push({f,body,bal,eave,ey,rise});
  // Upper-stage necks pass through the preceding roof and carry each floor.
  if(t>0){
   box('panel',0,f-.8,0,body*2,1.6,body*2);
   for(let s=0;s<4;s++){
    for(let a of [-body,0,body])sb(s,'beam',a,f-.76,body+.05,.18,1.65,.18);
    sb(s,'wood',0,f-.22,body+.13,body*2+.5,.23,.24);
    for(let a of [-body,body]){
     beam('wood',side(s,a,f-1.05,body),side(s,a,f-.18,bal-.12),.14,.18);
    }
   }
  }
  // Occupied square core and continuous veranda floors.
  box('dark',0,f+1.43,0,body*2-.14,2.85,body*2-.14);
  box('beam',0,f-.09,0,2*bal+.1,.22,2*bal+.1);
  for(let k=0;k<Math.ceil(2*bal/.23);k++){const x=-bal+(k+.5)*2*bal/Math.ceil(2*bal/.23);box(k%5?'panel':'wood',x,f+.055,0,2*bal/Math.ceil(2*bal/.23)-.014,.08,2*bal);}
  for(let s=0;s<4;s++){
   // Four fully framed walls, with paired central doors and flanking lattices.
   sb(s,'wood',0,f+.45,body,body*2,.7,.16);
   sb(s,'plaster',0,f+2.48,body,body*2,.58,.13);
   for(let k=-1;k<=1;k++){
    const a=k*body*.64,w=body*.56;
    sb(s,'beam',a,f+1.45,body+.08,w+.12,2.32,.19);
    sb(s,'panel',a,f+1.42,body+.195,w,2.16,.10);
    if(k===0){
     for(let j=-1;j<=1;j++)sb(s,'beam',a+j*w/2,f+1.42,body+.265,.055,2.19,.05);
     for(let j=0;j<3;j++)sb(s,'beam',a,f+.55+j*.66,body+.27,w,.055,.06);
     for(let sign of [-1,1]){const p=side(s,a+sign*.12,f+1.4,body+.30);ball('brass',...p,.048);}
    }else{
     sb(s,'dark',a,f+1.64,body+.26,w-.18,1.15,.025);
     for(let j=0;j<7;j++)sb(s,'end',a-w*.4+j*w*.8/6,f+1.64,body+.29,.033,1.18,.035);
     for(let j=0;j<4;j++)sb(s,'wood',a,f+1.1+j*.36,body+.31,w-.14,.038,.045);
    }
   }
   for(let a of [-body,-body/3,body/3,body]){
    const p=side(s,a,f+1.48,body+.16);cyl('wood',...p,.145,2.95);
    sb(s,'stone',a,f+.16,body+.16,.39,.23,.39);
    sb(s,'beam',a,f+2.89,body+.17,.43,.18,.43);
    // Three interlocking bracket levels project to the eave bearing purlin.
    for(let j=0;j<3;j++){
     const r=body+.2+j*.29,y=f+2.75+j*.16;
     sb(s,'end',a,y,r,.27,.18,.34);
     sb(s,'wood',a,y+.115,r,.78+j*.19,.14,.26);
     sb(s,'beam',a,y+.18,r,.20,.16,.82+j*.22);
     for(let sign of [-1,1])sb(s,'end',a+sign*(.29+j*.09),y+.18,r,.19,.19,.24);
    }
   }
   for(let y of [f+.86,f+2.76])sb(s,'beam',0,y,body+.19,body*2+.37,.16,.23);
   // The bearing beam follows the underside instead of piercing small upper roofs.
   const pr=body+.93;
   const underside=a=>ey+rise*Math.pow(1-(pr-.2)/(eave-.2),1.65)+.20*Math.pow((pr-.2)/(eave-.2),8)+.42*Math.pow(Math.abs(a)/eave,8)*Math.pow((pr-.2)/(eave-.2),4)-.26;
   for(let k=0;k<12;k++){
    const a=-body-.46+(2*body+.92)*k/12,b=-body-.46+(2*body+.92)*(k+1)/12;
    beam('wood',side(s,a,underside(a),pr),side(s,b,underside(b),pr),.15,.19);
   }
   for(let a of [-body,-body/3,body/3,body]){
    const hi=underside(a);sb(s,'end',a,(f+3.25+hi)/2,pr,.22,Math.max(.1,hi-f-3.25),.26);
   }
   // Balustrades with a gate opening at the south ground stair.
   const n=Math.ceil(2*bal/.7);
   for(let i=0;i<=n;i++){const a=-bal+i*2*bal/n;if(t===0&&s===0&&Math.abs(a)<1.45)continue;
    sb(s,'wood',a,f+.59,bal,.13,1.05,.13);sb(s,'end',a,f+1.15,bal,.19,.13,.19);
    const p=side(s,a,f+1.245,bal);ball('metal',...p,.075);
   }
   for(let y of [f+.36,f+.92]){
    if(t===0&&s===0){for(let sign of [-1,1])sb(s,'wood',sign*(bal+1.55)/2,y,bal,bal-1.55,.105,.115);}
    else sb(s,'wood',0,y,bal,2*bal,.105,.115);
   }
   for(let i=0;i<n*2;i++){const a=-bal+(i+.5)*bal/n;if(t===0&&s===0&&Math.abs(a)<1.5)continue;sb(s,'beam',a,f+.64,bal,.055,.49,.065);}
  }
  roof(t,eave,ey,rise,body);
 }
 function roof(t,R,Y,H,body){
  const inner=.20;
  function h(a,r){const q=Math.max(0,Math.min(1,(r-inner)/(R-inner)));return Y+H*Math.pow(1-q,1.65)+.20*Math.pow(q,8)+.42*Math.pow(Math.abs(a)/R,8)*Math.pow(q,4);}
  for(let s=0;s<4;s++){
   const vertices=[],indices=[],rows=22,cols=40;
   for(let j=0;j<=rows;j++){const r=inner+(R-inner)*j/rows;for(let k=0;k<=cols;k++){const a=-r+2*r*k/cols;const p=side(s,a,h(a,r),r);vertices.push(cx+p[0],p[1],cz+p[2]);if(j&&k){const n=j*(cols+1)+k;indices.push(n-cols-2,n-1,n,n-cols-2,n,n-cols-1);}}}
   const geoRoof=new THREE.BufferGeometry();geoRoof.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geoRoof.setIndex(indices);geoRoof.computeVertexNormals();const m=materials['tile'+t%5].clone();m.side=THREE.DoubleSide;const roofMesh=new THREE.Mesh(geoRoof,m);roofMesh.castShadow=true;roofMesh.receiveShadow=true;g.add(roofMesh);
   const courses=Math.ceil((R-inner)/.28);
   // Ceramic course lips across each trapezoidal face follow the swept surface.
   for(let j=1;j<=courses;j++){const r=inner+(R-inner)*j/courses;const segs=Math.ceil(2*r/.65);for(let k=0;k<segs;k++){const a=-r+2*r*k/segs,b=-r+2*r*(k+1)/segs;beam('tile'+((j+t)%5),side(s,a,h(a,r)+.018,r),side(s,b,h(b,r)+.018,r),.034,.034,true);}}
   // Round cover tiles embedded halfway into the roof, with small overlap joints.
   const n=Math.floor(R/.27);
   for(let k=-n;k<=n;k++){const a=k*.27,start=Math.max(inner,Math.abs(a)+.015),segs=Math.max(1,Math.ceil((R-start)/.26));
    for(let j=0;j<segs;j++){const r0=start+(R-start)*j/segs,r1=start+(R-start)*(j+1)/segs;beam('tile'+((k+j+t+100)%5),side(s,a,h(a,r0)+.032,r0),side(s,a,h(a,r1)+.032,r1),.054,.054,true);}
    const p=side(s,a,h(a,R)+.034,R);ball('tile2',...p,.074);
    const q=side(s,a,h(a,R)+.034,R+.047);ball('tile3',...q,.036);
   }
   // Swept fascia and closely spaced exposed timber rafters below the roof.
   for(let k=0;k<28;k++){const a=-R+2*R*k/28,b=-R+2*R*(k+1)/28;beam('beam',side(s,a,h(a,R)-.12,R),side(s,b,h(b,R)-.12,R),.16,.19);beam('end',side(s,a,h(a,R)-.02,R+.025),side(s,b,h(b,R)-.02,R+.025),.045,.065);}
   for(let a=-R+.18;a<R;a+=.34){const start=Math.max(body-.22,Math.abs(a)+.03);if(start>=R)continue;for(let j=0;j<5;j++){const r0=start+(R-start)*j/5,r1=start+(R-start)*(j+1)/5;beam('wood',side(s,a,h(a,r0)-.17,r0),side(s,a,h(a,r1)-.17,r1),.085,.11);}}
   // Raised hip ridge uses overlapping broad ceramic caps.
   for(let j=0;j<courses;j++){const r0=inner+(R-inner)*j/courses,r1=inner+(R-inner)*(j+1)/courses;beam('tile2',side(s,r0,h(r0,r0)+.115,r0),side(s,r1,h(r1,r1)+.115,r1),.115,.115,true);}
   const corner=side(s,R,h(R,R)+.20,R);ball('tile1',...corner,.14);
   // Small bronze wind bells under every upturned corner.
   const bp=side(s,R-.14,h(R,R)-.48,R-.14);beam('metal',[bp[0],bp[1]+.26,bp[2]],[bp[0],bp[1]-.08,bp[2]],.016,.016,true);cyl('metal',bp[0],bp[1]-.13,bp[2],.11,.14);box('metal',bp[0],bp[1]-.43,bp[2],.08,.34,.025);
  }
 }
 // Central pole and lotus-like socket anchor the ringed bronze sorin.
 const top=tiers[4].ey+tiers[4].rise;
 cyl('beam',0,top-.4,0,.21,1.7);cyl('metal',0,top+.16,0,.46,.25);cyl('metal',0,top+.4,0,.31,.3);ball('brass',0,top+.67,0,.30);
 cyl('metal',0,top+2.5,0,.068,4.4);
 for(let i=0;i<9;i++){
  const radius=.52-i*.032,y=top+.94+i*.30;
  const tor=new THREE.Mesh(new THREE.TorusGeometry(radius,.042,8,32),materials.metal);tor.rotation.x=Math.PI/2;tor.position.set(cx,y,cz);tor.castShadow=true;g.add(tor);
  for(let s=0;s<4;s++){const a=s*Math.PI/2;beam('metal',[0,y,0],[Math.cos(a)*radius,y,Math.sin(a)*radius],.023,.023,true);}
 }
 ball('brass',0,top+3.7,0,.17);
 const spire=new THREE.Mesh(new THREE.ConeGeometry(.105,1.2,12),materials.metal);spire.position.set(cx,top+4.33,cz);spire.castShadow=true;g.add(spire);
 // Fine elongated grain marks and repair plugs on the ground-storey exposed timbers.
 for(let s=0;s<4;s++)for(let k=0;k<30;k++){const a=-3.72+k*.255;sb(s,'grain',a,floor0+.3+(k%3)*.13,3.994,.007,.19+(k%4)*.055,.008);}
 for(const [key,matrices] of batches){const [shape,m]=key.split(':');const mesh=new THREE.InstancedMesh(geo[shape],materials[m],matrices.length);matrices.forEach((v,i)=>mesh.setMatrixAt(i,v));mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);}
 g.userData={tierCount:5,terraceY:base,maxY:top+4.93,rootTemple:shared.temple,connectedRoad:roads.find(r=>r.id==='east-lane')?.id};
 return g;
}
