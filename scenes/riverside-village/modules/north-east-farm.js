import { heightAt, bankZ, roadNetwork, layout, claimDistrict } from './root.js';

// One holding; root geography and the parent's connecting lanes remain authoritative.
export function build(THREE, ctx) {
  claimDistrict('north-bank');
  const g=new THREE.Group();g.name='north-east-farm: two households and the uphill working barn';
  const sites=layout();
  if(!roadNetwork().some(r=>r.id==='north-road') || bankZ(61,1)>=91) throw Error('Farm shared geography is unavailable');
  const palette={plaster:0xd7c6a3,cream:0xe3d5b6,sage:0xbfc0a4,wood:0x79583c,board:0x96704c,trim:0x514332,stone:0x969080,mortar:0x77796e,roof:0x945c43,tile:0xa96a4c,slate:0x596665,slatetile:0x72807a,glass:0x354e4b,shutter:0x61735b,iron:0x42453f,soil:0x72583c,dirt:0xb49e79,wear:0x9c8764,leaf:0x577b3c,leaf2:0x749249,leaf3:0x648346,grass:0x8a9c52,hay:0xbca466,straw:0xd1b775,fruit:0xb75133,flower:0xc09b73,water:0x648f8c,wool:0xd7d2b9,skin:0xbe9870,shirt:0x8794a0,cloth:0x9f7862};
  const mats=Object.fromEntries(Object.entries(palette).map(([k,v])=>[k,new THREE.MeshStandardMaterial({color:v,roughness:.93})]));
  const geos={box:new THREE.BoxGeometry(1,1,1),ball:new THREE.IcosahedronGeometry(1,1),cyl:new THREE.CylinderGeometry(1,1,1,8),cone:new THREE.ConeGeometry(1,1,9)};
  const batches=new Map(),dummy=new THREE.Object3D();
  function item(type,m,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){const key=type+':'+m;if(!batches.has(key))batches.set(key,[]);batches.get(key).push([x,y,z,sx,sy,sz,rx,ry,rz]);}
  const box=(x,y,z,w,h,d,m,ry=0,rx=0,rz=0)=>item('box',m,x,y,z,w,h,d,rx,ry,rz);
  const ball=(x,y,z,w,h,d,m)=>item('ball',m,x,y,z,w,h,d);
  const cyl=(x,y,z,r,h,m)=>item('cyl',m,x,y,z,r,h,r);
  function beam(a,b,r,m='wood') {const aa=new THREE.Vector3(...a),bb=new THREE.Vector3(...b),v=bb.clone().sub(aa),mid=aa.add(bb).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());const e=new THREE.Euler().setFromQuaternion(dummy.quaternion);item('cyl',m,mid.x,mid.y,mid.z,r,v.length(),r,e.x,e.y,e.z);}
  let seed=14617;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  function mesh(geo,m,x=0,y=0,z=0){const a=new THREE.Mesh(geo,mats[m]);a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;g.add(a);return a;}
  function patch(points,width,m='dirt',lift=.25){const v=[],ix=[];for(let i=1;i<points.length;i++){const [x,z]=points[i-1],[xx,zz]=points[i],dx=xx-x,dz=zz-z,len=Math.hypot(dx,dz),n=Math.ceil(len/.7);for(let j=0;j<n;j++){const k=v.length/3;for(const t of [j/n,(j+1)/n])for(const s of [-1,1]){const px=x+dx*t-dz/len*width*s/2,pz=z+dz*t+dx/len*width*s/2;v.push(px,heightAt(px,pz)+lift,pz);}ix.push(k,k+1,k+2,k+1,k+3,k+2);}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(ix);geo.computeVertexNormals();mesh(geo,m).castShadow=false;}
  function roof(x,z,w,d,y,rise,slate=false){const half=w/2+.5,angle=Math.atan2(rise,half),len=Math.hypot(half,rise),rm=slate?'slate':'roof',tm=slate?'slatetile':'tile';
    const sh=new THREE.Shape();sh.moveTo(-w/2,0);sh.lineTo(w/2,0);sh.lineTo(0,rise-.12);sh.closePath();mesh(new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:false}),'wood',x,y-.07,z-d/2);
    for(const s of [-1,1]){box(x+s*half/2,y+rise/2,z,len,.23,d+1.15,rm,0,0,-s*angle);box(x+s*half,y-.04,z,.18,.23,d+1.22,'trim');
      for(let t=.10;t<1;t+=.105) {box(x+s*half*t,y+rise*(1-t)+.13,z,.055,.05,d+1.12,tm,0,0,-s*angle);for(let zz=-d/2-.3;zz<d/2+.5;zz+=.83)box(x+s*half*(t+.036),y+rise*(1-t-.036)+.14,z+zz,len*.07,.035,.045,tm,0,0,-s*angle);}
    }
    box(x,y+rise+.14,z,.28,.22,d+1.25,tm);
    for(const s of [-1,1]){const zz=z+s*(d/2+.56);beam([x-w/2-.5,y,zz],[x,y+rise,zz],.105,'trim');beam([x,y+rise,zz],[x+w/2+.5,y,zz],.105,'trim');box(x,y-.02,zz,w+1,.2,.18,'trim');}
  }
  function windowAt(x,y,z,rot=0,small=false){const c=Math.cos(rot),s=Math.sin(rot),sc=small?.72:1;const p=(dx,dy,dz,w,h,d,m)=>box(x+dx*c*sc+dz*s,y+dy*sc,z-dx*s*sc+dz*c,w*sc,h*sc,d,m,rot);
    p(0,0,0,1.08,1.4,.12,'glass');for(const a of [-.61,.61])p(a,0,.05,.13,1.68,.2,'cream');for(const a of [-.76,.76])p(0,a,.05,1.34,.13,.2,'cream');p(0,0,.1,.07,1.42,.1,'cream');p(0,0,.1,1.1,.07,.1,'cream');p(0,-.87,.17,1.5,.16,.43,'stone');
    for(const a of [-1,1]){p(a*.95,0,0,.48,1.5,.13,'shutter');for(let yy=-.52;yy<.65;yy+=.26)p(a*.95,yy,.08,.46,.045,.08,'trim');}
  }
  function doorAt(x,y,z,w,h,rot=0){const c=Math.cos(rot),s=Math.sin(rot),p=(dx,dy,dz,ww,hh,dd,m)=>box(x+dx*c+dz*s,y+dy,z-dx*s+dz*c,ww,hh,dd,m,rot);
    p(0,h/2,0,w,h,.19,'trim');for(let xx=-w/2+.13;xx<w/2;xx+=.25)p(xx,h/2,.12,.215,h-.08,.13,'board');for(const a of [-1,1])p(a*(w/2+.1),h/2,.02,.2,h+.25,.28,'trim');p(0,h+.1,.06,w+.4,.24,.3,'trim');for(const yy of [.6,h-.65])p(0,yy,.2,w-.1,.11,.09,'iron');p(w*.34,h*.44,.23,.11,.18,.12,'iron');
    const cv=(dx,yy,dz)=>[x+dx*c+dz*s,y+yy,z-dx*s+dz*c];beam(cv(-w/2+.12,.25,.22),cv(w/2-.12,h-.25,.22),.07,'trim');
  }
  function foundation(x,z,w,d){const cs=[-1,1].flatMap(a=>[-1,1].map(b=>heightAt(x+a*(w/2+.22),z+b*(d/2+.22)))),floor=Math.max(...cs)+.16,lo=Math.min(...cs)-.32;
    box(x,(floor+lo)/2,z,w+.4,floor-lo,d+.4,'mortar');
    for(const s of [-1,1]){for(let xx=-w/2;xx<w/2;xx+=1.05){const zz=z+s*(d/2+.21),xxw=x+xx;for(let yy=heightAt(xxw,zz)+.15;yy<floor;yy+=.35)box(xxw,Math.min(yy,floor-.12),zz,.96,.29,.10,'stone');}for(let zz=-d/2;zz<d/2;zz+=1.05){const xx=x+s*(w/2+.21),zzw=z+zz;for(let yy=heightAt(xx,zzw)+.15;yy<floor;yy+=.35)box(xx,Math.min(yy,floor-.12),zzw,.1,.29,.97,'stone');}}
    return floor;
  }
  function steps(x,z,floor,face=-1,w=2.3){const delta=floor-heightAt(x,z),n=Math.max(3,Math.ceil(delta/.22));for(let k=0;k<n;k++){const zz=z+face*(.26+k*.34),top=floor-k*.20,bot=heightAt(x,zz)-.1;box(x,(top+bot)/2,zz,w,Math.max(.12,top-bot),.4,'stone');}return z+face*(n*.34+.2);}
  function cottage(index,w,d,slate=false){const [x,z]=sites.northHouses[index],floor=foundation(x,z,w,d),h=5.4,rise=3.1;
    box(x,floor+h/2,z,w,h,d,slate?'sage':'plaster');
    for(const s of [-1,1]){for(const xx of [-w/2+.1,0,w/2-.1])box(x+xx,floor+h/2,z+s*(d/2+.04),.18,h,.16,'trim');for(const zz of [-d/2+.1,0,d/2-.1])box(x+s*(w/2+.04),floor+h/2,z+zz,.16,h,.18,'trim');for(const yy of [.2,3.8,h-.1]){box(x,floor+yy,z+s*(d/2+.06),w,.16,.18,'trim');box(x+s*(w/2+.06),floor+yy,z,.18,.16,d,'trim');}
      for(const xx of [-w*.29,w*.29])windowAt(x+xx,floor+2.5,z+s*(d/2+.16),s===1?0:Math.PI);
      for(const zz of [-d*.25,d*.25])windowAt(x+s*(w/2+.16),floor+2.5,z+zz,s*Math.PI/2);
      windowAt(x,floor+6.1,z+s*(d/2+.13),s===1?0:Math.PI,true);
    }
    roof(x,z,w,d,floor+h,rise,slate);doorAt(x,floor,z-d/2-.14,1.55,2.7,Math.PI);const entry=steps(x,z-d/2-.3,floor);patch([[x,95.92],[x,entry]],1.75);doorAt(x,floor,z+d/2+.13,1.4,2.55);steps(x,z+d/2+.25,floor,1);
    const cx=x+w*.28,cz=z+d*.2,cy=floor+h+rise*.67;box(cx,cy,cz,.85,3.35,1,'stone');for(let k=0;k<7;k++)box(cx,cy-1.4+k*.45,cz,.90,.07,1.05,'mortar');box(cx,cy+1.73,cz,1.12,.22,1.3,'trim');box(cx,cy+1.85,cz,.61,.06,.75,'iron');
    // Door lantern and a bench at each household.
    box(x+1.15,floor+2.3,z-d/2-.32,.25,.4,.25,'iron');box(x+1.15,floor+2.3,z-d/2-.48,.16,.26,.07,'straw');
    const bx=x+w/2+1.2,bz=z-2,by=heightAt(bx,bz);box(bx,by+.7,bz,.65,.13,2.2,'board');for(const t of [-.8,.8])box(bx,by+.35,bz+t,.35,.7,.17,'trim');box(bx+.29,by+1.18,bz,.1,.65,2.2,'wood');
    return {x,z,w,d,floor};
  }
  function fence(a,b){const dx=b[0]-a[0],dz=b[1]-a[1],n=Math.ceil(Math.hypot(dx,dz)/2.6);for(let i=0;i<=n;i++){const x=a[0]+dx*i/n,z=a[1]+dz*i/n,y=heightAt(x,z);box(x,y+.8,z,.17,1.7,.17,'wood');if(i){const xx=a[0]+dx*(i-1)/n,zz=a[1]+dz*(i-1)/n;for(const h of [.58,1.2])beam([xx,heightAt(xx,zz)+h,zz],[x,y+h,z],.065,'board');}}}
  function gate(x,z,w,angle=.85){const hx=x-w/2,ex=hx+w*Math.cos(angle),ez=z+w*Math.sin(angle);for(const xx of [hx,x+w/2])box(xx,heightAt(xx,z)+.92,z,.23,1.92,.23,'trim');for(const h of [.4,.95,1.45])beam([hx,heightAt(hx,z)+h,z],[ex,heightAt(ex,ez)+h,ez],.065,'wood');beam([hx,heightAt(hx,z)+.35,z],[ex,heightAt(ex,ez)+1.45,ez],.065,'board');}
  function shed(x,z,w=4,d=5){const f=foundation(x,z,w,d);box(x,f+1.35,z,w,2.7,d,'wood');for(const s of [-1,1])for(let zz=-d/2+.1;zz<d/2;zz+=.4)box(x+s*(w/2+.03),f+1.35,z+zz,.09,2.7,.05,'board');roof(x,z,w,d,f+2.7,1.05,true);doorAt(x,f,z-d/2-.12,1.7,2.35,Math.PI);steps(x,z-d/2-.23,f,-1,1.95);return f;}
  function barrel(x,z,r=.5){const y=heightAt(x,z);cyl(x,y+.65,z,r,1.2,'wood');for(const yy of [.17,.95,1.15])cyl(x,y+yy,z,r+.035,.07,'iron');cyl(x,y+1.26,z,r*.86,.05,'water');}
  function garden(x0,z0,x1,z1){patch([[(x0+x1)/2,z0],[(x0+x1)/2,z1]],x1-x0,'soil',.27);for(let x=x0+.55;x<x1;x+=1.15){patch([[x,z0+.3],[x,z1-.3]],.19,'wear',.30);for(let z=z0+.6;z<z1-.4;z+=.64){ball(x,heightAt(x,z)+.42,z,.27,.20,.3,'leaf2');for(const dx of [-.16,.16])ball(x+dx,heightAt(x+dx,z)+.40,z+.08,.2,.12,.25,'leaf');if(Math.floor(x)%3===0)beam([x,heightAt(x,z)+.3,z],[x+.13,heightAt(x,z)+.9,z],.045,'leaf3');}}for(const z of [z0,z1])fence([x0,z],[x1,z]);}
  const h1=cottage(14,10,9),h2=cottage(15,11,10,true);
  // Domestic holdings north of the cross-lane. Gates align with both south entrances.
  for(const [xmin,xmax,h] of [[-9,17,h1],[20,45,h2]]){const zmin=97,back=132;fence([xmin,zmin],[h.x-1.45,zmin]);fence([h.x+1.45,zmin],[xmax,zmin]);gate(h.x,zmin,2.9,.95);fence([xmin,zmin],[xmin,back]);fence([xmax,zmin],[xmax,back]);fence([xmin,back],[h.x-1.6,back]);fence([h.x+1.6,back],[xmax,back]);gate(h.x,back,3.2,.5);patch([[h.x,h.z+h.d/2+1],[h.x,134]],1.4);}
  garden(-6,114,-.6,127);garden(2.6,114,8,127);garden(23,120,28.4,129);garden(31.6,120,36,129);
  shed(12.7,117,4.2,5);shed(40.5,120,4.0,5.4);
  patch([[h1.x,110],[11,110],[12.7,114.3]],1.5);patch([[h2.x,115],[40.5,115],[40.5,117.2]],1.5);
  patch([[-5,110.5],[11.8,110.5]],2.6);patch([[22,115.8],[43,115.8]],2.4);
  barrel(7.1,104);barrel(37,109);barrel(15.5,115.2);
  // Firewood stacks, chopping blocks, pots and clotheslines show daily use.
  for(const [x,z] of [[13,122],[41,124.3]]){const y=heightAt(x,z);for(let j=0;j<3;j++)for(let k=0;k<5;k++)beam([x-1+k*.42,y+.23+j*.35,z-.7],[x-1+k*.42,y+.23+j*.35,z+.7],.18,'wood');cyl(x-2.3,heightAt(x-2.3,z)+.35,z,.42,.7,'wood');beam([x-2.3,heightAt(x-2.3,z)+.7,z],[x-1.9,heightAt(x-2.3,z)+1.55,z+.2],.05,'trim');box(x-2, heightAt(x-2.3,z)+1.45,z+.15,.38,.26,.08,'iron');}
  for(const [x,z] of [[-5,99],[7.2,99],[24,101],[36,104]]){const y=heightAt(x,z);item('cone','roof',x,y+.24,z,.30,.48,.30,Math.PI,0,0);for(let k=0;k<5;k++)ball(x+(rand()-.5)*.5,y+.65+rand()*.2,z+(rand()-.5)*.5,.15,.17,.15,k%2?'leaf':'flower');}
  for(const [x,z] of [[10,128],[38,130]]){for(const xx of [x,x+5])box(xx,heightAt(xx,z)+1.6,z,.1,3.2,.1,'wood');const y=Math.max(heightAt(x,z),heightAt(x+5,z))+2.9;beam([x,y,z],[x+5,y,z],.018,'cream');for(let k=0;k<3;k++)box(x+.9+k*1.4,y-.65,z,.95,1.3,.05,k%2?'cloth':'cream');}
  // Main barn has long-side wagon doors: their ramp follows the uphill grade.
  const [bx,bz]=sites.northBarns[1],bw=14,bd=18,bf=foundation(bx,bz,bw,bd),bh=7.0;
  box(bx,bf+bh/2,bz,bw,bh,bd,'wood');
  for(const s of [-1,1]){for(let x=-bw/2+.2;x<bw/2;x+=.55)box(bx+x,bf+bh/2,bz+s*(bd/2+.04),.055,bh,.11,'board');for(let z=-bd/2+.2;z<bd/2;z+=.55)box(bx+s*(bw/2+.04),bf+bh/2,bz+z,.11,bh,.055,'board');for(const z of [-bd/2,0,bd/2])box(bx+s*(bw/2+.09),bf+bh/2,bz+z,.24,bh,.24,'trim');for(const yy of [.22,4.8,bh]){box(bx,bf+yy,bz+s*(bd/2+.09),bw,.25,.23,'trim');box(bx+s*(bw/2+.09),bf+yy,bz,.23,.25,bd,'trim');}
    for(const x of [-bw/2,0,bw/2])box(bx+x,bf+bh/2,bz+s*(bd/2+.09),.25,bh,.25,'trim');
    for(const z of [-6,6]){beam([bx+s*(bw/2+.15),bf+1,bz+z-2],[bx+s*(bw/2+.15),bf+4.6,bz+z+2],.11,'trim');windowAt(bx+s*(bw/2+.16),bf+5.8,bz+z,s*Math.PI/2,true);}
  }
  roof(bx,bz,bw,bd,bf+bh,4.7,true);
  doorAt(bx+bw/2+.16,bf,bz,4.9,4.65,Math.PI/2);doorAt(bx-4.8,bf,bz-bd/2-.15,2.0,3.2,Math.PI);
  steps(bx-4.8,bz-bd/2-.35,bf,-1,2.5);
  // South loft hatch, projecting hoist and pulley; north loft vent.
  for(const s of [-1,1]){const zz=bz+s*(bd/2+.16);box(bx,bf+8.05,zz,1.8,2.1,.12,'glass');for(const xx of [-1,1])box(bx+xx*.99,bf+8.05,zz+s*.06,.18,2.3,.22,'trim');for(const yy of [6.92,9.17])box(bx,bf+yy,zz+s*.06,2.15,.17,.24,'trim');box(bx+1.55,bf+8.05,zz+s*.38,1.15,2.08,.12,'board',s*.55);box(bx,bf+6.93,zz+s*.28,2.2,.17,.7,'wood');}
  box(bx-.28,bf+7.18,bz-9.26,.9,.36,.2,'hay');
  beam([bx,bf+10.1,bz-8.8],[bx,bf+10.1,bz-11.3],.14,'trim');beam([bx,bf+8.9,bz-8.8],[bx,bf+10.1,bz-10.9],.085,'wood');beam([bx,bf+10,bz-11],[bx,bf+3.4,bz-11],.025,'cream');
  // A filled stone ramp, 11 m long, gives the wagon doors a genuinely usable approach.
  const rx=bx+bw/2+.17,ex=81,rz=bz,rw=5.4,vs=[];
  for(const bottom of [false,true])for(const xx of [rx,ex])for(const zz of [rz-rw/2,rz+rw/2])vs.push(xx,bottom?heightAt(xx,zz)-.15:xx===rx?bf+.025:heightAt(xx,zz)+.27,zz);
  const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));rg.setIndex([0,1,2,1,3,2,4,6,5,5,6,7,0,4,1,1,4,5,2,3,6,3,7,6,0,2,4,2,6,4,1,5,3,3,5,7]);rg.computeVertexNormals();mesh(rg,'stone');
  patch([[48,103.2],[56,103.2]],7.6);patch([[65.5,103.2],[89,103.2]],7.6);patch([[61,106],[76,106],[82,111],[82,117]],4.5);patch([[48,109],[48,130],[69,130]],2.4);
  for(const s of [-1,1])patch([[63,106+s*.85],[76,106+s*.85],[81+s*.85,112]],.22,'wear',.29);
  // Inter-house access joins the working court without crossing a building or duplicating lanes.
  patch([[45.1,110],[48,110],[48,106]],1.7);fence([47,99],[56,99]);fence([65,99],[94,99]);fence([94,99],[94,117]);
  for(const [x,z] of [[51,118],[52,124],[55,130]]){const y=heightAt(x,z);for(let j=0;j<3;j++)for(let k=0;k<3-j;k++){box(x+(k-(2-j)/2)*1.65,y+.47+j*.86,z,1.55,.82,2.5,'hay');for(const dz of [-.7,.7])box(x+(k-(2-j)/2)*1.65,y+.47+j*.86,z+dz,1.58,.86,.06,'wood');}}
  barrel(70.1,110.5);barrel(71.3,110.5);
  // Four-wheel farm wagon with open plank bed, hubs, iron tyres and spoke wheels.
  function wagon(x,z){const y=heightAt(x,z);box(x,y+1.12,z,2.3,.19,3.6,'wood');for(let k=0;k<7;k++)box(x,y+1.25,z-1.5+k*.48,2.22,.09,.43,'board');for(const s of [-1,1]){for(const yy of [1.45,1.75,2.05])box(x+s*1.16,y+yy,z,.13,.22,3.6,'board');for(const zz of [-1.35,1.35]){beam([x-1.6,y+.79,z+zz],[x+1.6,y+.79,z+zz],.12,'iron');const wx=x+s*1.48,wz=z+zz;const wh=new THREE.Mesh(new THREE.TorusGeometry(.72,.07,6,18),mats.iron);wh.rotation.y=Math.PI/2;wh.position.set(wx,y+.8,wz);g.add(wh);for(let k=0;k<10;k++){const a=k*Math.PI/5;beam([wx,y+.8,wz],[wx,y+.8+Math.cos(a)*.68,wz+Math.sin(a)*.68],.04,'board');}beam([wx-.15,y+.8,wz],[wx+.15,y+.8,wz],.17,'trim');}beam([x+s*.85,y+1,z-1.7],[x+s*.72,y+.66,z-4.4],.08,'wood');}for(let k=0;k<3;k++)box(x+(k%2-.5)*.95,y+1.6+Math.floor(k/2)*.55,z+.3,.85,.57,1.15,'hay');}
  wagon(86,106);
  // Small tool rack beside the barn, sacks, crates and a pitchfork.
  for(let k=0;k<4;k++){const x=56+k*.65,z=106.1,y=heightAt(x,z);beam([x,y+.1,z],[x+.35,y+2.7,z+.45],.045,'board');for(let t=-1;t<=1;t++)beam([x+.35+t*.12,y+2.55,z+.45],[x+.35+t*.12,y+3.0,z+.43],.023,'iron');}
  for(let k=0;k<5;k++){const x=71+(k%3)*.75,z=123+Math.floor(k/3)*.85;ball(x,heightAt(x,z)+.5,z,.43,.65,.4,'cream');cyl(x,heightAt(x,z)+1.13,z,.12,.16,'wood');}
  for(const [x,z] of [[91,110],[91,112]]){const y=heightAt(x,z);box(x,y+.6,z,1.1,1.15,1.1,'board');for(const a of [-.42,.42])box(x+a,y+.6,z,.11,1.22,1.16,'trim');}
  // Modest fenced sheep paddock and a tiny open shelter behind the barn court.
  fence([73,121],[81,121]);fence([85,121],[95,121]);gate(83,121,4,1.0);fence([73,121],[73,148]);fence([73,148],[95,148]);fence([95,148],[95,121]);patch([[83,118],[83,125]],2.7);patch([[79,125],[91,125]],5,'wear');
  const sx=91.7,sz=142,sw=4,sd=5,sf=foundation(sx,sz,sw,sd);box(sx,sf+1.2,sz+sd/2,sw,2.4,.17,'wood');for(const s of [-1,1]){box(sx+s*sw/2,sf+1.2,sz,.18,2.4,sd,'wood');for(const zz of [-sd/2,sd/2])box(sx+s*sw/2,sf+1.25,sz+zz,.19,2.5,.19,'trim');}roof(sx,sz,sw,sd,sf+2.5,.9);box(sx,sf+.15,sz,3.6,.20,4.6,'hay');
  function sheep(x,z,i){const y=heightAt(x,z);for(const xx of [-.37,.37])for(const zz of [-.56,.56])beam([x+xx,y+.08,z+zz],[x+xx,y+.77,z+zz],.072,'trim');ball(x,y+1.05,z,.66,.57,.91,'wool');for(let k=0;k<5;k++)ball(x+(rand()-.5)*.8,y+1.34,z+(rand()-.5),.34,.31,.34,'cream');ball(x,y+1.19,z-.99,.27,.3,.38,'trim');for(const xx of [-.3,.3])ball(x+xx,y+1.35,z-1,.2,.09,.14,'wool');ball(x,y+1.1,z+1,.12,.18,.18,'wool');}
  [[78,128],[85,129],[89,134],[78,139],[84,144],[81,133]].forEach(([x,z],i)=>sheep(x,z,i));
  const tx=77,tz=123,ty=heightAt(tx,tz);box(tx,ty+.38,tz,3.4,.55,.9,'stone');box(tx,ty+.68,tz,3.05,.045,.64,'water');
  // Orchard trees form a porous transition to meadow, with visible trunks and fruit.
  function tree(x,z,h=5.6){const y=heightAt(x,z);beam([x,y-.1,z],[x+.13,y+2.7,z],.22,'wood');for(let k=0;k<5;k++){const a=k*6.283/5,dx=Math.cos(a)*1.45,dz=Math.sin(a)*1.45,yy=y+h*.62+rand()*.5;beam([x,y+2,z],[x+dx,yy,z+dz],.1,'wood');ball(x+dx,yy+.75,z+dz,1.6,1.45,1.55,['leaf','leaf2','leaf3'][k%3]);for(let j=0;j<6;j++){const aa=rand()*6.283;ball(x+dx+Math.cos(aa)*1.2,yy+.55+rand()*.4,z+dz+Math.sin(aa)*1.2,.11,.13,.11,'fruit');}}}
  for(const x of [-5,7,20,33,45])for(const z of [138,146])tree(x,z,z===146?5.8:5.2);
  patch([[-7,133.7],[45,133.7],[48,130]],1.65);fence([-9,136],[-9,148]);fence([-9,149],[48,149]);
  // Small cereal patch rather than another building in the rear meadow.
  for(let x=52;x<69;x+=1.1){patch([[x,136],[x,147]],.3,'soil',.24);for(let z=136.2;z<147;z+=.65){const y=heightAt(x,z);beam([x,y+.2,z],[x+.12,y+1.0,z],.022,'straw');ball(x+.12,y+1.04,z,.075,.22,.085,'hay');}}
  // Harvest ladder and fruit baskets.
  const lx=19,lz=138,ly=heightAt(lx,lz);for(const dx of [-.35,.35])beam([lx+dx,ly,lz-1.7],[lx+dx+.65,ly+3.1,lz],.045,'board');for(let k=0;k<9;k++)beam([lx-.35+.072*k,ly+.345*k,lz-1.7+.189*k],[lx+.35+.072*k,ly+.345*k,lz-1.7+.189*k],.035,'wood');
  for(const [x,z] of [[17,135],[19,134.5]]){cyl(x,heightAt(x,z)+.25,z,.42,.5,'wood');for(let k=0;k<7;k++)ball(x+(rand()-.5)*.5,heightAt(x,z)+.56,z+(rand()-.5)*.5,.12,.13,.12,'fruit');}
  function person(x,z,m){const y=heightAt(x,z);for(const dx of [-.14,.14])beam([x+dx,y+.08,z],[x+dx,y+.8,z],.10,'trim');item('cone',m,x,y+1.10,z,.32,.76,.24);ball(x,y+1.68,z,.22,.26,.22,'skin');cyl(x,y+1.88,z,.32,.10,'hay');for(const s of [-1,1])beam([x+s*.27,y+1.35,z],[x+s*.40,y+.84,z-.14],.085,m);}
  person(79,108,'shirt');person(10,111,'cloth');person(22,132.5,'shutter');
  for(let k=0;k<6;k++){const x=44+rand()*4,z=114+rand()*7,y=heightAt(x,z);ball(x,y+.32,z,.22,.25,.3,k%2?'cream':'cloth');ball(x,y+.57,z-.2,.1,.13,.11,'cream');item('cone','hay',x,y+.55,z-.33,.08,.18,.08,Math.PI/2);for(const dx of [-.08,.08])beam([x+dx,y,z],[x+dx,y+.22,z],.02,'hay');}
  // Broken tufts, stones and flowers soften worn edges and the meadow boundary.
  for(let k=0;k<850;k++){const x=-8+rand()*103,z=134+rand()*14.5;if((x>50&&x<70)||(x>73&&z<146))continue;const y=heightAt(x,z);ball(x,y+.22,z,.10+rand()*.16,.15,.12,k%17===0?'flower':'grass');}
  for(const [key,rows]of batches){const [type,m]=key.split(':');if(!mats[m])throw Error('Unknown farm material '+m);const inst=new THREE.InstancedMesh(geos[type],mats[m],rows.length);for(let i=0;i<rows.length;i++){const [x,y,z,sx,sy,sz,rx,ry,rz]=rows[i];dummy.position.set(x,y,z);dummy.rotation.set(rx,ry,rz);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);}inst.castShadow=true;inst.receiveShadow=true;g.add(inst);}
  return g;
}
