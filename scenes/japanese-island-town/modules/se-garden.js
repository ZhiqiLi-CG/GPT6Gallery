import { heightAt, roadNetwork, layout } from './root.js';

// Only lot 10 furnishings. All shared ground, gates and architecture remain with their owners.
export function build(THREE, ctx) {
  const group=new THREE.Group(); group.name='se-garden: kitchen garden household';
  const lot=layout().town.lots[10], roads=roadNetwork(), dx=lot.x+7, dz=lot.z+44;
  const colors={wood:0x827052,darkWood:0x564631,soil:0x514333,clod:0x67513a,leaf:0x46703d,lightLeaf:0x799258,vein:0x99a26b,bean:0x567844,clay:0x9b674c,rim:0xb1805b,inside:0x503f30,iron:0x464b48,water:0x658b85,straw:0xb49b68,strawDark:0x8a744a,bark:0x594638,cut:0xc19c69,ring:0x92764d,flower:0xd4a5ad,flowerWhite:0xe1d5b9,heart:0xb09a50};
  const mats=Object.fromEntries(Object.entries(colors).map(([k,v])=>[k,new THREE.MeshStandardMaterial({color:v,roughness:k==='water'?.35:.96})]));
  const geos={box:new THREE.BoxGeometry(1,1,1),ball:new THREE.SphereGeometry(1,10,7),leaf:new THREE.SphereGeometry(1,8,5),cyl:new THREE.CylinderGeometry(1,1,1,16),rock:new THREE.DodecahedronGeometry(1,0),torus:new THREE.TorusGeometry(1,.065,5,32)};
  const batches={}, tmp=new THREE.Object3D(), up=new THREE.Vector3(0,1,0), footprints=[];
  function form(shape,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){tmp.position.set(x+dx,y,z+dz);tmp.rotation.set(rx,ry,rz);tmp.scale.set(sx,sy,sz);tmp.updateMatrix();(batches[shape+'|'+mat]??=[]).push(tmp.matrix.clone());}
  function beam(a,b,r,mat='wood'){const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),v=q.clone().sub(p);tmp.position.copy(p.add(q).multiplyScalar(.5));tmp.position.x+=dx;tmp.position.z+=dz;tmp.scale.set(r,v.length(),r);tmp.quaternion.setFromUnitVectors(up,v.normalize());tmp.updateMatrix();(batches['cyl|'+mat]??=[]).push(tmp.matrix.clone());}
  const ground=(x,z)=>heightAt(x+dx,z+dz)+.09;
  const ring=(x,y,z,r,mat='rim',thickness=1)=>form('torus',mat,x,y,z,r,r,r*thickness,Math.PI/2);
  function reserve(name,x,z,w,d){const radius=Math.hypot(w,d)/2;const X=x+dx,Z=z+dz;
    for(const road of roads)for(let i=1;i<road.points.length;i++){const a=road.points[i-1],b=road.points[i],vx=b[0]-a[0],vz=b[1]-a[1],den=vx*vx+vz*vz,t=den?Math.max(0,Math.min(1,((X-a[0])*vx+(Z-a[1])*vz)/den)):0;if(Math.hypot(X-a[0]-t*vx,Z-a[1]-t*vz)<road.width/2+radius+.3)throw new Error('se-garden road clearance: '+name);}
    if(X-w/2<-12.7||X+w/2>-1.2||Z-d/2<-51.6||Z+d/2>-38.15)throw new Error('se-garden bounds: '+name);
    if(Z-d/2<-47.5&&Z+d/2>-51.6&&X+w/2>-8.4&&X-w/2<-5.6)throw new Error('se-garden entrance: '+name);
    footprints.push({name,x:X,z:Z,w,d});
  }
  function cabbage(x,z,s=1){const y=ground(x,z)+.11;
    for(let j=0;j<9;j++){const a=j*Math.PI*2/9;form('leaf',j%3?'leaf':'lightLeaf',x+Math.cos(a)*.16*s,y+.13*s,z+Math.sin(a)*.16*s,.20*s,.07*s,.12*s,0,-a,.28);beam([x,y+.13*s,z],[x+Math.cos(a)*.29*s,y+.16*s,z+Math.sin(a)*.29*s],.008*s,'vein');}
    form('ball','lightLeaf',x,y+.19*s,z,.15*s,.16*s,.15*s);
    for(let j=0;j<5;j++){const a=j*1.256;form('leaf','leaf',x+Math.cos(a)*.085*s,y+.22*s,z+Math.sin(a)*.085*s,.07*s,.12*s,.10*s,.25,a,.1);}
  }
  function bed(name,x,z,w,d,beans=false){reserve(name,x,z,w+.15,d+.15);
    const nx=Math.ceil(w/.16),nz=Math.ceil(d/.16);
    for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const xx=x-w/2+(i+.5)*w/nx,zz=z-d/2+(j+.5)*d/nz;form('box','soil',xx,ground(xx,zz)+.035,zz,w/nx,.09,d/nz);if((i+j)%3===0)form('rock','clod',xx,ground(xx,zz)+.1,zz,.055,.027,.045,0,i+j);}
    for(const side of [-1,1]){
      for(let j=0;j<Math.ceil(d/.4);j++){const zz=z-d/2+(j+.5)*d/Math.ceil(d/.4),xx=x+side*w/2;form('box','wood',xx,ground(xx,zz)+.09,zz,.065,.18,d/Math.ceil(d/.4)+.01);}
      for(let i=0;i<Math.ceil(w/.4);i++){const xx=x-w/2+(i+.5)*w/Math.ceil(w/.4),zz=z+side*d/2;form('box','wood',xx,ground(xx,zz)+.09,zz,w/Math.ceil(w/.4)+.01,.18,.065);}
    }
    if(!beans){for(let a=0;a<3;a++)for(let b=0;b<2;b++)cabbage(x+(a-1)*.59,z+(b-.5)*.6,.86+(a+b)%2*.08);}
    else{for(let k=0;k<3;k++){const zz=z+(k-1)*.52,yy=ground(x,zz);beam([x-.25,yy,zz],[x+.04,yy+1.18,zz],.021);beam([x+.29,yy,zz],[x+.04,yy+1.18,zz],.021);ring(x+.04,yy+1.05,zz,.047,'straw');for(let j=0;j<7;j++){const h=.18+j*.12,xx=x+.1*Math.sin(j*1.7);beam([xx,yy+h,zz],[xx-.025,yy+h+.13,zz],.008,'bean');for(const s of [-1,1])form('leaf','bean',xx+s*.11,yy+h+.04,zz,.14,.025,.065,0,s*.6,s*.3);if(j%2===0)form('leaf','lightLeaf',xx+.12,yy+h-.08,zz,.026,.115,.024,0,0,.2);}}
      const yy=ground(x,z);beam([x+.04,yy+1.11,z-.7],[x+.04,yy+1.11,z+.7],.016);
    }
  }
  function pot(x,z,r=.22,h=.34,flowers=true){const y=ground(x,z);form('cyl','clay',x,y+h*.4,z,r*.83,h*.8,r*.83);form('cyl','clay',x,y+h*.77,z,r,.3*h,r);ring(x,y+h*.94,z,r);form('cyl','inside',x,y+h*.90,z,r*.88,.035,r*.88);ring(x,y+.04,z,r*.8,'clay');
    for(let i=0;i<6;i++){const a=i*2.399,xx=x+Math.cos(a)*r*.6,zz=z+Math.sin(a)*r*.6,top=y+h+.18+(i%3)*.065;beam([x,y+h*.9,z],[xx,top,zz],.009,'leaf');form('leaf','leaf',xx,top-.08,zz,.065,.023,.13,.4,a,.25);if(flowers){for(let j=0;j<5;j++){const b=j*1.256;form('leaf',i%2?'flower':'flowerWhite',xx+Math.cos(b)*.042,top,zz+Math.sin(b)*.042,.048,.017,.032,0,-b); }form('ball','heart',xx,top+.008,zz,.02,.02,.02);}}
  }
  function basket(x,z,r=.3,h=.3){const y=ground(x,z);form('cyl','strawDark',x,y+.035,z,r*.76,.06,r*.76);
    for(let j=0;j<8;j++)ring(x,y+.04+j*h/8,z,r*(.79+.21*j/8),j%2?'straw':'strawDark',.65);
    for(let i=0;i<22;i++){const a=i*6.283/22;beam([x+Math.cos(a)*r*.77,y+.045,z+Math.sin(a)*r*.77],[x+Math.cos(a)*r,y+h,z+Math.sin(a)*r],.009,'straw');}
    ring(x,y+h,z,r,'straw');for(const s of [-1,1]){const xx=x+s*r*.85;for(let j=0;j<10;j++){const a=j*Math.PI/10,b=(j+1)*Math.PI/10;beam([xx,y+h+.095*Math.sin(a),z+.10*Math.cos(a)],[xx,y+h+.095*Math.sin(b),z+.10*Math.cos(b)],.013,'straw');}}
    for(let i=0;i<3;i++)form('ball','lightLeaf',x+(i-1)*r*.40,y+.17,z,.085,.085,.08);
  }
  bed('cabbage-bed',-10.32,-49.6,1.95,1.45);
  bed('bean-bed',-3.72,-49.58,1.3,1.72,true);
  reserve('flower-pots',-9.7,-48.25,1.25,.55);pot(-10.03,-48.25,.23,.36);pot(-9.43,-48.25,.18,.28);
  reserve('eastern-flower-pot',-2.32,-48.32,.56,.56);pot(-2.32,-48.32,.25,.4);
  // A slatted side bench narrow enough to sit outside the masonry foundation.
  reserve('side-bench',-11.98,-45.37,.44,1.55);
  {const x=-11.98,z=-45.37,seat=Math.max(ground(x,z-.65),ground(x,z+.65))+.48;
    for(let j=0;j<3;j++)form('box',j%2?'wood':'darkWood',x+(j-1)*.135,seat,z,.12,.065,1.48);
    for(const s of [-1,1]){const zz=z+s*.58;for(const a of [-1,1]){const xx=x+a*.14,y=ground(xx,zz);form('box','darkWood',xx,(seat+y)/2,zz,.075,seat-y,.08);}form('box','wood',x,seat-.09,zz,.42,.10,.10);}form('box','darkWood',x,seat-.2,z,.075,.09,1.2);
  }
  reserve('harvest-baskets',-4.22,-48.13,1.25,.58);basket(-4.56,-48.13,.27,.28);basket(-3.92,-48.13,.22,.24);
  reserve('watering-bucket',-8.97,-49.1,.64,.64);
  {const x=-8.97,z=-49.1,y=ground(x,z),r=.23,h=.35;form('cyl','darkWood',x,y+.025,z,r*.84,.05,r*.84);for(let i=0;i<16;i++){const a=i*6.283/16;form('box','wood',x+Math.cos(a)*r,y+h/2,z+Math.sin(a)*r,.08,h,.035,0,-a-Math.PI/2);}ring(x,y+.08,z,r+.015,'iron');ring(x,y+.29,z,r+.015,'iron');form('cyl','water',x,y+.20,z,.205,.02,.205);for(let i=0;i<16;i++){const a=i*Math.PI/16,b=(i+1)*Math.PI/16;beam([x+Math.cos(a)*r,y+h+Math.sin(a)*r,z],[x+Math.cos(b)*r,y+h+Math.sin(b)*r,z],.012,'iron');}}
  reserve('hoe',-11.7,-48.38,.3,.7);
  {const x=-11.7,z=-48.4,y=ground(x,z);beam([x,y+.06,z-.12],[x+.04,y+1.14,z+.19],.023);form('box','iron',x,y+.06,z-.22,.25,.055,.23,.3);}
  // The rear strip is less than a metre deep: no high furniture or roof intrusions.
  reserve('rear-log-stack',-9.8,-38.98,1.55,.53);
  for(let row=0;row<2;row++)for(let j=0;j<2;j++){const x=-9.8,z=-39.1+j*.235+(row?.01:0),y=ground(x,z)+.098+row*.195,r=.098;beam([x-.69,y,z],[x+.69,y,z],r,'bark');for(const s of [-1,1]){const xx=x+s*.701;form('cyl','cut',xx,y,z,r*.87,.013,r*.87,0,0,Math.PI/2);for(const rr of [.35,.65])form('torus','ring',xx+s*.008,y,z,r*rr,r*rr,r*rr,0,Math.PI/2);for(let k=0;k<3;k++){const a=k*2.094;beam([x-.67,y+Math.cos(a)*r,z+Math.sin(a)*r],[x+.67,y+Math.cos(a+.12)*r,z+Math.sin(a+.12)*r],.009,'darkWood');}}}
  reserve('squat-rear-barrel',-6.65,-38.96,.55,.55);
  {const x=-6.65,z=-38.96,y=ground(x,z),r=.24,h=.48;form('cyl','darkWood',x,y+.02,z,.22,.04,.22);for(let i=0;i<18;i++){const a=i*6.283/18;form('box','wood',x+Math.cos(a)*r,y+h/2,z+Math.sin(a)*r,.078,h,.04,0,-a-Math.PI/2);}for(const yy of [.075,.38])ring(x,y+yy,z,r+.018,'iron');form('cyl','inside',x,y+h-.055,z,r*.91,.04,r*.91);ring(x,y+h,z,r+.008,'wood');for(let j=-2;j<=2;j++){const zz=j*.081,l=2*Math.sqrt(Math.max(0,r*r-zz*zz));form('box','wood',x,y+h-.015,z+zz,l,.035,.074);}form('box','darkWood',x,y+h+.012,z,.045,.025,.42);}
  reserve('rear-herb-pots',-4.28,-38.97,1.1,.43);pot(-4.6,-38.97,.18,.23,false);pot(-4.03,-38.97,.16,.26,false);
  for(const [key,arr] of Object.entries(batches)){const [shape,mat]=key.split('|'),mesh=new THREE.InstancedMesh(geos[shape],mats[mat],arr.length);arr.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}
  group.userData.footprints=footprints;
  return group;
}
