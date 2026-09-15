import {heightAt, roadNetwork, layout} from './root.js';

// Boundary/access and outer planting only. Children furnish their lot interiors.
export function build(THREE, ctx) {
  const group=new THREE.Group();group.name='South-east yard boundaries and open gates';
  const roads=roadNetwork(),lots=layout().town.lots;
  const materials={wood:new THREE.MeshStandardMaterial({color:0x766044,roughness:1}),rail:new THREE.MeshStandardMaterial({color:0x514331,roughness:1}),cap:new THREE.MeshStandardMaterial({color:0x998265,roughness:1}),iron:new THREE.MeshStandardMaterial({color:0x383b38,roughness:.78})};
  const batches={};
  const add=(mat,x,y,z,w,h,d,ry=0)=>{(batches[mat]??=[]).push([x,y,z,w,h,d,ry]);};
  function roadClear(x,z,r=.12){return !roads.some(road=>road.points.slice(1).some((b,i)=>{const a=road.points[i],dx=b[0]-a[0],dz=b[1]-a[1],u=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-u*dx,z-a[1]-u*dz)<road.width/2+r+.3;}));}
  function post(x,z,h){if(!roadClear(x,z))return;const y=heightAt(x,z)+.04;add('rail',x,y+h/2,z,.15,h,.15);add('cap',x,y+h+.02,z,.2,.085,.2);}
  function fence(a,b,h=1){const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),n=Math.ceil(len/1.65),yaw=-Math.atan2(dz,dx);
    for(let k=0;k<=n;k++){const t=k/n;post(a[0]+dx*t,a[1]+dz*t,h+.13);}
    for(let k=0;k<n;k++){const t=(k+.5)/n,x=a[0]+dx*t,z=a[1]+dz*t,l=len/n;if(!roadClear(x,z,.13))continue;const y=heightAt(x,z)+.08;
      for(const dy of [.25,h-.16])add('rail',x,y+dy,z,l,.085,.09,yaw);
      const slats=Math.ceil(l/.23);for(let s=0;s<slats;s++){const tt=(k+(s+.5)/slats)/n,xx=a[0]+dx*tt,zz=a[1]+dz*tt,yy=heightAt(xx,zz)+.1;add('wood',xx,yy+h*.47,zz,.105,h*.94,.055,yaw);}
    }
  }
  function gate(l,z,back){const x=l.x+1.43;post(x,z,1.08);post(l.x-1.43,z,1.08);
    // An open gate leaf folds along the side of the approach, keeping its middle clear.
    const end=z+back*1.02;fence([x,z],[x,end],.8);
    const y=heightAt(x,z);for(const dy of [.28,.73]){add('iron',x-.06,y+dy,z,.1,.11,.14);add('iron',x-.07,y+dy,z+back*.13,.04,.055,.28);}
    add('iron',x-.075,heightAt(x,end)+.69,end,.045,.065,.2);
  }
  for(const idx of [4,5,10,11]){
    const l=lots[idx],south=l.face==='north',x0=l.x-5.48,x1=l.x+5.48,zFront=south?-56.8:-51.2,zBack=south?-77.05:-38.42;
    const h=idx===5?.83:idx===10?.88:1.02;
    // Different frontage lengths give the shop a generous open display margin.
    if(idx!==5)fence([x0,zFront],[l.x-1.43,zFront],h);
    fence([l.x+1.43,zFront],[idx===11?x1-.7:x1,zFront],h);
    gate(l,zFront,south?-1:1);
    if(south){fence([x0,zBack],[idx===5?l.x+2.6:x1,zBack],h);fence([x0,zBack],[x0,idx===4?-69.7:-72],h);fence([x1,zBack],[x1,idx===4?-71:-69.5],h);}
    else{fence([x0+.2,zBack],[idx===10?l.x+3.7:x1,zBack],h*.8);fence([x0,zFront],[x0,-48.8],h);if(idx===11)fence([x1,-41],[x1,zBack],h*.8);}
  }
  const box=new THREE.BoxGeometry(1,1,1),o=new THREE.Object3D();
  // The reserved planting strips stay outside every child's interior rectangle.
  const organic={};
  const palette={bark:0x5b4434,stone:0x858477,moss:0x5b6940,leaf:0x41623b,needle:0x254c3d,needleLight:0x3c6548,petal:0xddb0b7,petalLight:0xedc7c9,heart:0xad7c64};
  const shapes={ball:new THREE.IcosahedronGeometry(1,1),rock:new THREE.DodecahedronGeometry(1,0),stem:new THREE.CylinderGeometry(1,1,1,7),leaf:new THREE.SphereGeometry(1,5,3)};
  const transform=new THREE.Object3D(),up=new THREE.Vector3(0,1,0);
  const hash=n=>{const a=Math.sin(n*91.17+32.8)*41738.71;return a-Math.floor(a);};
  function form(shape,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){transform.position.set(x,y,z);transform.scale.set(sx,sy,sz);transform.rotation.set(rx,ry,rz);transform.updateMatrix();(organic[shape+'|'+mat]??=[]).push(transform.matrix.clone());}
  function branch(a,b,r){const d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]);transform.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);transform.scale.set(r,d.length(),r*.85);transform.quaternion.setFromUnitVectors(up,d.normalize());transform.updateMatrix();(organic['stem|bark']??=[]).push(transform.matrix.clone());}
  function plantingBed(x,z,rx,rz,seed){
    const pos=[],tri=[],n=52;pos.push(x,heightAt(x,z)+.045,z);
    for(let i=0;i<n;i++){const a=i/n*Math.PI*2,r=.95+.045*Math.sin(i*2.3+seed),xx=x+Math.cos(a)*rx*r,zz=z+Math.sin(a)*rz*r;pos.push(xx,heightAt(xx,zz)+.045,zz);}
    for(let i=0;i<n;i++)tri.push(0,(i+1)%n+1,i+1);
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(tri);geo.computeVertexNormals();const soil=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0x776c51,roughness:1}));soil.receiveShadow=true;group.add(soil);
    for(let i=0;i<Math.ceil(rz*9);i++){const a=i/(Math.ceil(rz*9))*Math.PI*2,xx=x+Math.cos(a)*rx,zz=z+Math.sin(a)*rz;if(!roadClear(xx,zz,.19))continue;form('rock','stone',xx,heightAt(xx,zz)+.07,zz,.16+hash(i+seed)*.04,.11,.16,0,a,.1);}
    for(let i=0;i<45;i++){const a=hash(seed+i)*6.28,r=Math.sqrt(hash(seed+90+i))*.85,xx=x+Math.cos(a)*rx*r,zz=z+Math.sin(a)*rz*r,yy=heightAt(xx,zz)+.075;form('rock','moss',xx,yy,zz,.13,.055,.17,0,a,0);
      if(i%3===0)for(let j=0;j<5;j++){const b=j*1.256;form('leaf','leaf',xx+Math.cos(b)*.075,yy+.12,zz+Math.sin(b)*.075,.035,.18,.022,Math.sin(b)*.55,b,Math.cos(b)*.55);}
    }
  }
  plantingBed(-14.75,-72.9,1.42,3.25,41);
  plantingBed(-14.8,-43.1,1.38,3.35,57);
  plantingBed(11.88,-73.2,.75,2.8,78);
  plantingBed(11.85,-43.3,.72,3.1,97);
  // A pruned cherry: bifurcated trunk, connected small branches and five-petal blossoms.
  {
    const x=-14.75,z=-72.9,y=heightAt(x,z),base=[x,y,z],fork=[x+.07,y+1.9,z+.08];
    branch(base,fork,.13);branch([x-.2,y+.03,z+.1],[x,y+.5,z],.09);
    for(let i=0;i<8;i++){const a=i*2.4,tip=[x+Math.cos(a)*(.68+.21*hash(i)),y+2.45+hash(i+3)*1.05,z+Math.sin(a)*.9];branch(fork,tip,.046);
      for(let j=0;j<3;j++){const b=a+j*1.8,end=[tip[0]+Math.cos(b)*.32,tip[1]+.15+hash(i*3+j)*.25,tip[2]+Math.sin(b)*.32];branch(tip,end,.014);
        for(let k=0;k<15;k++){const c=hash(i*53+j*17+k)*6.28,r=Math.sqrt(hash(k*13+i+j))*.28,cx=end[0]+Math.cos(c)*r,cy=end[1]+(hash(k+91)-.5)*.34,cz=end[2]+Math.sin(c)*r;
          for(let p=0;p<5;p++){const ang=p*1.256;form('leaf',k%3?'petal':'petalLight',cx+Math.cos(ang)*.047,cy,cz+Math.sin(ang)*.047,.05,.025,.035,0,-ang,.25);}
          form('ball','heart',cx,cy+.016,cz,.016,.016,.016);
        }
      }
    }
    // Support stake and lashings make the compact planted tree look tended.
    add('wood',x-.4,y+.7,z,.07,1.4,.07);add('iron',x-.22,y+1.15,z,.4,.035,.035);
  }
  // A small cloud-pruned pine with branches visible between textured needle pads.
  {
    const x=-14.8,z=-43.1,y=heightAt(x,z),bend=[x+.15,y+1.65,z];branch([x,y,z],bend,.14);branch(bend,[x-.12,y+3.15,z+.12],.08);
    for(let i=0;i<8;i++){const a=i*2.4,h=1.45+i*.21,r=i>5?.45:.83,tip=[x+Math.cos(a)*r,y+h,z+Math.sin(a)*r];branch([x+.05,y+h-.25,z],tip,.04);
      form('ball','needle',tip[0],tip[1]+.15,tip[2],.38,.16,.36);
      for(let j=0;j<90;j++){const b=hash(i*117+j)*6.28,rr=Math.sqrt(hash(j*11+i))*.4,xx=tip[0]+Math.cos(b)*rr,zz=tip[2]+Math.sin(b)*rr,yy=tip[1]+.15+hash(j+i)*.12;
        form('leaf',j%4?'needle':'needleLight',xx,yy,zz,.017,.13,.016,Math.sin(b)*.8,b,Math.cos(b)*.8);
      }
    }
  }
  // East strip gets low ferns and mossy stones; the entire planting stays west of x=13.
  for(const [x,z] of [[11.85,-74.6],[11.9,-71.6],[11.83,-45],[11.85,-41.5]]){
    const y=heightAt(x,z);form('rock','stone',x,y+.13,z,.26,.22,.37,.1,.5,0);
    for(let j=0;j<9;j++){const a=j*.698;for(let k=0;k<5;k++){const r=.045+k*.043,xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r,yy=y+.26+Math.sin(k/5*Math.PI)*.18;form('leaf','leaf',xx,yy,zz,.055,.016,.13,.3,-a,0);}}
  }
  for(const [key,matrices] of Object.entries(organic)){const [shape,mat]=key.split('|'),mesh=new THREE.InstancedMesh(shapes[shape],new THREE.MeshStandardMaterial({color:palette[mat],roughness:1}),matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}
  for(const [mat,items] of Object.entries(batches)){const mesh=new THREE.InstancedMesh(box,materials[mat],items.length);items.forEach(([x,y,z,w,h,d,ry],i)=>{o.position.set(x,y,z);o.rotation.set(0,ry,0);o.scale.set(w,h,d);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);});mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}
  return group;
}
