import { heightAt, bankZ, roadNetwork, layout, claimDistrict } from './root.js';
import { claimSouthCluster } from './south-bank.js';
import { claimWestHolding, westFarmPlan, nearestWestRoad } from './south-west-farms.js';

export function build(THREE,ctx) {
  claimDistrict('south-bank'); claimSouthCluster('west'); claimWestHolding('cottages');
  const group=new THREE.Group();group.name='sw-riverside-cottages — inhabited domestic gardens';
  const plan=westFarmPlan(),houses=plan.houses.filter(s=>s.holding==='cottages');
  const barns=plan.barns.filter(s=>s.holding==='cottages');
  const lane=roadNetwork().find(r=>r.id==='south-lane');
  const districtLayout=layout();
  group.userData={holding:'cottages',sites:houses.map(s=>s.source),barns:barns.length,style:districtLayout.style};
  const colors={cream:0xdacbad,ochre:0xc7b48b,wood:0x68523a,lightwood:0x96784f,green:0x536c56,blue:0x526b76,stone:0x99958a,darkstone:0x77776d,roof:0x975f47,roof2:0x7e5040,slate:0x657174,slate2:0x515e65,glass:0x344d51,soil:0x6e5940,path:0xb5a481,leaf:0x54713b,leaf2:0x73904c,cabbage:0x81975c,fruit:0xb67a3d,linen:0xe2dcc5,cloth:0x9caca0,iron:0x454a43,water:0x588a87,flower:0xcda66c};
  const materials=Object.fromEntries(Object.entries(colors).map(([k,color])=>[k,new THREE.MeshStandardMaterial({color,roughness:.92})]));
  const geos={box:new THREE.BoxGeometry(1,1,1),ball:new THREE.IcosahedronGeometry(1,1),cyl:new THREE.CylinderGeometry(1,1,1,8)};
  const batches=new Map(),dummy=new THREE.Object3D();
  function inst(shape,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){
    const key=shape+'_'+mat;if(!batches.has(key))batches.set(key,[]);
    dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(rx,ry,rz);dummy.updateMatrix();batches.get(key).push(dummy.matrix.clone());
  }
  const box=(m,x,y,z,w,h,d,rx=0,ry=0,rz=0)=>inst('box',m,x,y,z,w,h,d,rx,ry,rz);
  function beam(m,a,b,r=.07){const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));dummy.position.copy(new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5));dummy.scale.set(r*2,v.length(),r*2);dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());dummy.updateMatrix();const key='box_'+m;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(dummy.matrix.clone());}
  const ground=(x,z)=>heightAt(x,z);
  function clear(x,z,r=.2){const n=nearestWestRoad(x,z);return x-r>=-150&&x+r<=-45&&z-r>=-66&&z+r<=-28&&n.distance>n.width/2+plan.roadShoulder+r&&z+r<bankZ(x,-1)-plan.shoreClearance;}
  function laneZ(x){for(let i=1;i<lane.points.length;i++){const a=lane.points[i-1],b=lane.points[i];if(x>=a[0]&&x<=b[0])return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}return nearestWestRoad(x,-55).z;}
  function southEdge(x){return laneZ(x)+lane.width/2+plan.roadShoulder+1.0;}
  function northEdge(x){return bankZ(x,-1)-plan.shoreClearance-.65;}
  function ribbon(points,width,mat='path',lift=.23){const verts=[],ids=[];for(let k=1;k<points.length;k++){const a=points[k-1],b=points[k],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);if(!len)continue;const n=Math.ceil(len/.6);for(let j=0;j<n;j++){let o=verts.length/3;for(const t of [j/n,(j+1)/n])for(const side of [-1,1]){const x=a[0]+dx*t-dz/len*width/2*side,z=a[1]+dz*t+dx/len*width/2*side;verts.push(x,ground(x,z)+lift,z);}ids.push(o,o+1,o+2,o+1,o+3,o+2);}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(ids);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,materials[mat]);mesh.receiveShadow=true;group.add(mesh);}
  function foundation(x,z,w,d,floor){const low=Math.min(...[-1,1].flatMap(a=>[-1,1].map(b=>ground(x+a*(w+.3)/2,z+b*(d+.3)/2))))-.4;box('darkstone',x,(low+floor)/2,z,w+.35,floor-low,d+.35);for(const side of [-1,1])for(let a=-w/2+.4;a<w/2;a+=.85)box('stone',x+a,floor-.25,z+side*(d/2+.2),.79,.42,.13);}
  function windowAt(x,y,z,rot,shutter){
    const local=(m,lx,ly,lz,w,h,d)=>box(m,x+Math.cos(rot)*lx+Math.sin(rot)*lz,y+ly,z-Math.sin(rot)*lx+Math.cos(rot)*lz,w,h,d,0,rot);
    local('wood',0,0,0,1.32,1.65,.17);local('glass',0,0,.10,1.12,1.45,.08);
    for(const dx of [-.59,0,.59])local('linen',dx,0,.17,.07,1.51,.09);
    for(const dy of [-.75,0,.75])local('linen',0,dy,.17,1.26,.07,.09);
    local('stone',0,-.87,.12,1.55,.15,.43);
    for(const side of [-1,1]){for(let j=0;j<3;j++)local(shutter,side*.94+(j-1)*.14,0,.05,.13,1.57,.13);for(const dy of [-.51,.51])local('wood',side*.94,dy,.14,.48,.085,.06);}
  }
  function cottage(s,index){const {x,z,w,d}=s,h=4.55,rise=2.65,roof=index?'slate':'roof',alt=index?'slate2':'roof2',shutter=index?'blue':'green';
    const floor=Math.max(...[-1,1].flatMap(a=>[-1,1].map(b=>ground(x+a*w/2,z+b*d/2))))+.25,eave=floor+h;
    foundation(x,z,w,d,floor);box(index?'ochre':'cream',x,floor+h/2,z,w,h,d);
    // Solid plaster gable volume, with closed ends beneath both roof slopes.
    const vs=[-w/2,0,-d/2,-w/2,0,d/2,-w/2,rise,0,w/2,0,-d/2,w/2,0,d/2,w/2,rise,0];
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));geo.setIndex([0,1,2,3,5,4,0,3,4,0,4,1,0,2,5,0,5,3,1,4,5,1,5,2]);geo.computeVertexNormals();const gable=new THREE.Mesh(geo,materials[index?'ochre':'cream']);gable.position.set(x,eave,z);group.add(gable);
    const run=d/2+.55,angle=Math.atan2(rise,run),length=Math.hypot(run,rise);
    for(const side of [-1,1]){box(roof,x,eave+rise/2,z+side*run/2,w+1.15,.2,length,side*angle);box('wood',x,eave-.05,z+side*run,w+1.25,.22,.22);
      const rows=Math.ceil(run/.55),cols=Math.ceil((w+1.1)/.65);for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){const t=(row+.5)/rows;box((row+col)%4===0?alt:roof,x-(w+1.1)/2+(col+.5)*(w+1.1)/cols,eave+rise*(1-t)+.14,z+side*run*t,(w+1.1)/cols-.025,.11,length/rows+.04,side*angle);}
    }
    box(alt,x,eave+rise+.16,z,w+1.35,.28,.31);
    for(const side of [-1,1]){box('wood',x+side*(w/2-.1),floor+h/2,z,.19,h,.20);for(const zz of [-d/2,d/2])box('wood',x+side*(w/2-.09),floor+h/2,z+zz,.20,h,.18);}
    for(const zz of [-d/2,d/2]){box('wood',x,eave-.28,z+zz,w,.16,.13);for(const dx of [-2.65,2.65])windowAt(x+dx,floor+2.65,z+zz+(zz<0?-.06:.06),zz<0?Math.PI:0,shutter);}
    for(const side of [-1,1]){windowAt(x+side*(w/2+.06),floor+2.5,z,side*Math.PI/2,shutter);windowAt(x+side*(w/2+.06),eave+.7,z,side*Math.PI/2,shutter);}
    const front=z-d/2-.09;box('wood',x,floor+1.28,front,1.45,2.56,.2);
    for(let j=0;j<7;j++)box(shutter,x+(j-3)*.185,floor+1.24,front-.12,.17,2.35,.08);
    for(const xx of [-.82,.82])box('stone',x+xx,floor+1.3,front,.18,2.75,.35);box('stone',x,floor+2.65,front,1.8,.20,.35);inst('ball','iron',x+.43,floor+1.2,front-.22,.08,.08,.07);
    for(let j=0;j<3;j++){const zz=front-.35-j*.33,bottom=ground(x,zz)-.15,top=floor+.06-j*.11;box('stone',x,(top+bottom)/2,zz,1.9,top-bottom,.62);}
    // Chimney passes down through the roof; stone cap and dark flue remain visible.
    const cx=x+w*.28,cz=z+.9,cy=eave+rise-.3;box('stone',cx,cy,cz,.82,3.4,.9);for(let k=0;k<6;k++)box(k%2?'stone':'darkstone',cx,cy-1.45+k*.48,cz,.86,.08,.94);box('darkstone',cx,cy+1.75,cz,1.10,.22,1.15);box('iron',cx,cy+1.88,cz,.53,.08,.58);
    return {floor,front};
  }
  function fenceSegment(a,b){const dx=b[0]-a[0],dz=b[1]-a[1],n=Math.ceil(Math.hypot(dx,dz)/1.5);let prev=null;for(let i=0;i<=n;i++){const x=a[0]+dx*i/n,z=a[1]+dz*i/n;if(!clear(x,z,.15)){prev=null;continue;}const y=ground(x,z);box('lightwood',x,y+.73,z,.15,1.6,.15);if(prev)for(const h of [.43,1.05])beam('wood',[prev[0],prev[1]+h,prev[2]],[x,y+h,z],.065);prev=[x,y,z];}}
  function gate(x,z,width=2){for(const dx of [-width/2,width/2])box('wood',x+dx,ground(x+dx,z)+.82,z,.23,1.75,.23);const y=ground(x-width/2,z); // leaf swings inward from the left jamb: the opening is physically clear.
    const a=[x-width/2,y+.25,z],b=[x-width/2+.65,y+.25,z+width*.9];for(const h of [0,.76])beam('lightwood',[a[0],a[1]+h,a[2]],[b[0],b[1]+h,b[2]],.065);beam('wood',a,[b[0],b[1]+.76,b[2]],.05);for(let j=0;j<7;j++){const t=j/6;box('lightwood',a[0]+(b[0]-a[0])*t,y+.66,a[2]+(b[2]-a[2])*t,.11,1.05,.11);}}
  function shed(x,z,index){const w=3.3,d=3.4,floor=Math.max(...[-1,1].flatMap(a=>[-1,1].map(b=>ground(x+a*w/2,z+b*d/2))))+.17;foundation(x,z,w,d,floor);box('wood',x,floor+1.2,z,w,2.4,d);const shape=new THREE.Shape();shape.moveTo(-d/2,0);shape.lineTo(d/2,0);shape.lineTo(0,.87);shape.closePath();const cap=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:w,bevelEnabled:false}),materials.wood);cap.rotation.y=Math.PI/2;cap.position.set(x-w/2,floor+2.4,z);group.add(cap);inst('cyl','iron',x+.9,floor+3.35,z+.5,.09,1.0,.09);for(const side of [-1,1])for(let j=0;j<12;j++)box('lightwood',x+(j-5.5)*.27,floor+1.2,z+side*(d/2+.03),.24,2.4,.10);for(const side of [-1,1]){box('roof2',x,floor+2.8,z+side*.95,3.8,.16,2.13,side*.46);box('wood',x,floor+2.4,z+side*1.9,3.85,.18,.16);}box('roof2',x,floor+3.3,z,3.95,.17,.22);box('green',x,floor+1.06,z-d/2-.1,1.35,2.10,.12);beam('wood',[x-.55,floor+.18,z-d/2-.2],[x+.55,floor+1.9,z-d/2-.2],.065);windowAt(x+w/2+.05,floor+1.5,z,Math.PI/2,'green');return [x,z-d/2-.35];}
  function bed(x,z,w,d,type){if(!clear(x,z,Math.hypot(w,d)/2))return;ribbon([[x-w/2,z],[x+w/2,z]],d,'soil',.17);for(const side of [-1,1]){beam('lightwood',[x-w/2,ground(x-w/2,z+side*d/2)+.25,z+side*d/2],[x+w/2,ground(x+w/2,z+side*d/2)+.25,z+side*d/2],.08);}for(let xx=x-w/2+.4;xx<x+w/2;xx+=.62)for(let zz=z-d/2+.35;zz<z+d/2;zz+=.52){const y=ground(xx,zz);if(type===0){for(let k=0;k<3;k++)inst('ball',k%2?'leaf2':'cabbage',xx+Math.cos(k*2.1)*.10,y+.32,zz+Math.sin(k*2.1)*.10,.23,.18,.24);}else{for(let k=0;k<3;k++)inst('ball','leaf',xx,y+.33,zz,.08,.3,.11,0,k, .35*(k-1));if(type===2){box('lightwood',xx,y+.75,zz,.04,1.4,.04);inst('ball','fruit',xx+.14,y+.55,zz,.10,.11,.1);}}}}
  function tree(x,z,r=2.1){if(!clear(x,z,.55))return;const y=ground(x,z);inst('cyl','wood',x,y+1.45,z,.19,2.9,.19);for(let k=0;k<5;k++){const a=k*2.4,xx=x+Math.cos(a)*r*.5,zz=z+Math.sin(a)*r*.5;beam('wood',[x,y+1.7,z],[xx,y+3.0,zz],.09);inst('ball',k%2?'leaf':'leaf2',xx,y+3.5+(k%2)*.5,zz,r*.72,1.4,r*.70);for(let j=0;j<4;j++)inst('ball','fruit',xx+Math.cos(j*1.7)*r*.53,y+3.2+(j%2)*.55,zz+Math.sin(j*1.7)*r*.5,.12,.13,.12);}}
  function bench(x,z){const y=ground(x,z);for(const a of [-.78,.78])for(const b of [-.23,.23])box('wood',x+a,y+.3,z+b,.12,.65,.12);for(const b of [-.22,0,.22])box('lightwood',x,y+.67,z+b,2,.13,.18);for(const a of [-.8,.8])box('wood',x+a,y+.9,z+.28,.10,1.1,.10);box('lightwood',x,y+1.2,z+.28,2,.28,.12);}
  function logs(x,z){const y=ground(x,z);for(let row=0;row<3;row++)for(let j=0;j<5-row;j++){const xx=x+(j-(4-row)/2)*.35;inst('cyl','wood',xx,y+.22+row*.32,z,.16,1.55,.16,Math.PI/2);inst('cyl','lightwood',xx,y+.22+row*.32,z-.785,.145,.025,.145,Math.PI/2);}for(const a of [-1,1])box('wood',x+a,y+.7,z,.14,1.4,.13);box('roof2',x,y+1.48,z,2.4,.15,2.0,.12);}
  function wash(x,z){const y=ground(x,z);for(const dx of [-2.1,2.1])box('wood',x+dx,ground(x+dx,z)+1.4,z,.12,2.8,.12);beam('iron',[x-2.1,y+2.55,z],[x+2.1,y+2.55,z],.018);for(let i=0;i<4;i++){box(i%2?'cloth':'linen',x-1.45+i*.91,y+1.92,z,.69,1.2,.055,.03,0,.04*(i-2));for(const dx of [-.23,.23])box('wood',x-1.45+i*.91+dx,y+2.53,z,.06,.15,.09);}}
  function trough(x,z){const y=ground(x,z);box('darkstone',x,y+.18,z,1.75,.35,.8);for(const s of [-1,1]){box('stone',x+s*.84,y+.44,z,.14,.55,.82);box('stone',x,y+.44,z+s*.36,1.8,.55,.12);}box('water',x,y+.44,z,1.48,.035,.56);}
  function cart(x,z){const y=ground(x,z);box('wood',x,y+.65,z,1.2,.16,1.75);for(const s of [-1,1]){for(let k=0;k<3;k++)box('lightwood',x+s*.63,y+.79+k*.19,z,.10,.15,1.8);inst('cyl','iron',x+s*.78,y+.45,z,.45,.12,.45,0,0,Math.PI/2);inst('cyl','lightwood',x+s*.85,y+.45,z,.33,.13,.33,0,0,Math.PI/2);beam('wood',[x+s*.5,y+.63,z-.8],[x+s*.5,y+.30,z-2.2],.06);}box('soil',x,y+.85,z,1,.35,1.4);}
  function chicken(x,z,k){const y=ground(x,z);inst('ball',k%2?'linen':'ochre',x,y+.36,z,.28,.27,.40);inst('ball','linen',x,y+.62,z-.26,.17,.19,.17);box('fruit',x,y+.63,z-.43,.08,.07,.18);box('roof',x,y+.81,z-.27,.07,.12,.15);for(const s of [-1,1])box('wood',x+s*.1,y+.12,z,.04,.25,.04);inst('ball','wood',x,y+.47,z+.31,.12,.30,.15,.4);}
  houses.forEach((s,index)=>{
    const {front}=cottage(s,index),left=index?s.x-17:s.x-26,right=index?s.x+13:s.x+11;
    const gx=s.x,gz=southEdge(gx),r=nearestWestRoad(gx,gz);
    // Curved boundaries sampled from the actual lane and riverbank. Two-metre breaks form true gates.
    for(const [start,stop]of [[left,gx-1.3],[gx+1.3,right]])for(let x=start;x<stop;x+=1.4){const end=Math.min(x+1.4,stop);fenceSegment([x,southEdge(x)],[end,southEdge(end)]);}
    for(let x=left;x<right;x+=1.4){const end=Math.min(x+1.4,right);fenceSegment([x,northEdge(x)],[end,northEdge(end)]);}
    fenceSegment([left,southEdge(left)],[left,northEdge(left)]);fenceSegment([right,southEdge(right)],[right,northEdge(right)]);gate(gx,gz,2.6);
    ribbon([[r.x,r.z],[gx,gz],[gx,front-.8]],1.6);
    const shedPos=[s.x-(index?11.5:18.2),s.z-.3],shedDoor=shed(...shedPos,index);
    const gardenAccessX=s.x-(index?7.6:10.6);
    ribbon([[gx+6.5,front-1.2],[gardenAccessX,front-1.2],[gardenAccessX,shedDoor[1]],shedDoor],1.1);
    ribbon([[gx-2.1,front-1.2],[gx+2.1,front-1.2]],2.15);
    ribbon([[gx+6.5,front-1.2],[gx+6.5,s.z+1.5]],1.0);
    ribbon([[gx+5.8,s.z-1.8],[gx+8.4,s.z-1.8]],1.8);
    // Low flower border along the inner south fence, interrupted at the entrance.
    for(let x=left+1;x<right-1;x+=.55){if(Math.abs(x-gx)<2)continue;const z=southEdge(x)+.65;if(!clear(x,z,.22))continue;inst('ball','leaf',x,ground(x,z)+.20,z,.23,.22,.22);for(let j=0;j<2;j++)inst('ball','flower',x+(j-.5)*.16,ground(x,z)+.40,z,.095,.075,.09);}
    // Compact kitchen gardens lie west of each house, safely inside the curved perimeter.
    for(let k=0;k<3;k++)bed(s.x-(index?10.8:15.5),s.z-4.8-k*1.85,index?5.0:7.3,1.2,k);
    tree(left+4,southEdge(left+4)+5.6,2.1);tree(right-3.3,s.z-1.8,1.85);
    bench(s.x+7.5,s.z-1.8);logs(s.x+7.1,s.z+1.4);wash(s.x-(index?10:18),s.z+4.1);
    trough(s.x-6.7,s.z-2.2);cart(left+2.4,s.z-5);
    // Garden tools lean against the shed; water barrels sit at its rear corner.
    const tx=shedPos[0]+2.1,tz=shedPos[1]-.9,ty=ground(tx,tz);beam('lightwood',[tx,ty+.1,tz-.3],[tx-.20,ty+1.8,tz],.035);box('iron',tx,ty+.23,tz-.3,.34,.38,.065,.2);beam('wood',[tx+.5,ty+.1,tz-.2],[tx+.3,ty+1.9,tz],.03);box('iron',tx+.3,ty+1.9,tz,.55,.08,.08);
    inst('cyl','lightwood',shedPos[0]-2,ground(shedPos[0]-2,shedPos[1])+.55,shedPos[1],.44,1.1,.44);for(const h of [.2,.8])inst('cyl','iron',shedPos[0]-2,ground(shedPos[0]-2,shedPos[1])+h,shedPos[1],.455,.06,.455);
    for(let k=0;k<4;k++)chicken(s.x-9.1+k*.67,s.z-3.1-(k%2)*.6,k);
    // Small irregular grass tufts and border flowers give occupied plots a ground texture.
    for(let j=0;j<370;j++){const x=left+((j*.61803398875)%1)*(right-left),z=southEdge(x)+((j*.41421356)%1)*(northEdge(x)-southEdge(x));if(!clear(x,z,.35)||Math.abs(x-s.x)<s.w/2+1.3&&Math.abs(z-s.z)<s.d/2+1.3||Math.abs(x-shedPos[0])<2.3&&Math.abs(z-shedPos[1])<2.4||Math.abs(x-gx)<1.2||Math.abs(z-(front-1.2))<.8||x<s.x-6&&z<s.z-3)continue;for(let k=0;k<2;k++)inst('ball',j%8===0?'flower':'leaf2',x+k*.1,ground(x,z)+.14,z,.055,.18,.08,0,j,.3*(k?1:-1));}
  });
  for(const [key,matrices]of batches){const [shape,mat]=key.split('_'),mesh=new THREE.InstancedMesh(geos[shape],materials[mat],matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=true;mesh.receiveShadow=true;mesh.name='sw-riverside-cottages '+key;group.add(mesh);}
  return group;
}
