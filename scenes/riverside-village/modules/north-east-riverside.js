import { heightAt, bankZ, roadNetwork, layout, claimDistrict } from './root.js';

export function build(THREE,ctx) {
  claimDistrict('north-bank');
  const group=new THREE.Group();group.name='north-east-riverside cottages and domestic holdings';
  const material=c=>new THREE.MeshStandardMaterial({color:c,roughness:.94});
  const M={stone:material(0x979184),stoneLight:material(0xb3aa94),wood:material(0x69513a),board:material(0x947456),dark:material(0x303c39),cream:material(0xd8c8a8),sage:material(0xbec0a7),red:material(0x905b44),slate:material(0x596864),soil:material(0x67543b),path:material(0xb6a283),green:material(0x557844),leaf:material(0x799247),pot:material(0xa56c4d),metal:material(0x414844),cloth:material(0xcfc8ae),skin:material(0xba9170),blue:material(0x617f85)};
  const cube=new THREE.BoxGeometry(1,1,1),sphere=new THREE.IcosahedronGeometry(1,1);
  function mesh(geo,m,x,y,z){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;group.add(o);return o;}
  function box(x,y,z,w,h,d,m){const o=mesh(cube,m,x,y,z);o.scale.set(w,h,d);return o;}
  function ball(x,y,z,s,m,sx=1,sy=1,sz=1){const o=mesh(sphere,m,x,y,z);o.scale.set(s*sx,s*sy,s*sz);return o;}
  function beam(a,b,w,m){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),d=vb.clone().sub(va);const o=box(...va.clone().add(vb).multiplyScalar(.5).toArray(),w,d.length(),w,m);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o;}
  function cyl(x,y,z,r,h,m,rt=r){return mesh(new THREE.CylinderGeometry(rt,r,h,10),m,x,y,z);}
  const road=roadNetwork().find(r=>r.id==='north-road');
  function roadZ(x){for(let j=1;j<road.points.length;j++){const a=road.points[j-1],b=road.points[j];if(x>=a[0]&&x<=b[0])return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}throw Error('Cottage outside road extent');}
  function surface(x0,z0,x1,z1,m,lift=.08){const geo=new THREE.PlaneGeometry(x1-x0,z1-z0,Math.ceil((x1-x0)*2),Math.ceil((z1-z0)*2));geo.rotateX(-Math.PI/2);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i)+(x0+x1)/2,z=p.getZ(i)+(z0+z1)/2;p.setXYZ(i,x,heightAt(x,z)+lift,z);}geo.computeVertexNormals();const o=mesh(geo,m,0,0,0);o.castShadow=false;}
  function footing(x,z,w,d){const hs=[];for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)hs.push(heightAt(x+a*w/2,z+b*d/2));const low=Math.min(...hs)-.35,base=Math.max(...hs)+.22;box(x,(low+base)/2,z,w,base-low,d,M.stone);return base;}
  function roof(x,z,w,d,y,rise,m){const hw=w/2+.42,hd=d/2+.4;const sh=new THREE.Shape();sh.moveTo(-hw,0);sh.lineTo(hw,0);sh.lineTo(0,rise);sh.closePath();mesh(new THREE.ExtrudeGeometry(sh,{depth:hd*2,bevelEnabled:false}),m,x,y,z-hd);
    const slope=Math.atan2(rise,hw),length=Math.hypot(hw,rise),rows=Math.ceil(length/.65),cols=Math.ceil(2*hd/.73);
    for(const s of [-1,1])for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const t=(r+.5)/rows;const o=box(x+s*hw*(1-t),y+rise*t+.04,z-hd+(c+.5)*2*hd/cols,length/rows-.025,.065,2*hd/cols-.035,m);o.rotation.z=-s*slope;}
    beam([x,y+rise+.10,z-hd],[x,y+rise+.10,z+hd],.21,M.stoneLight);
    for(const side of [-1,1]){beam([x-hw,y,z+side*hd],[x,y+rise,z+side*hd],.15,M.wood);beam([x,y+rise,z+side*hd],[x+hw,y,z+side*hd],.15,M.wood);}
  }
  function window(x,y,z,rot){function b(dx,dy,dz,w,h,d,m){const o=box(x+Math.cos(rot)*dx+Math.sin(rot)*dz,y+dy,z-Math.sin(rot)*dx+Math.cos(rot)*dz,w,h,d,m);o.rotation.y=rot;return o;}
    b(0,0,0,1.2,1.35,.12,M.wood);b(0,0,.075,.96,1.1,.09,M.dark);b(0,0,.14,.065,1.1,.07,M.stoneLight);b(0,0,.14,.96,.065,.07,M.stoneLight);
    b(0,-.76,.13,1.45,.15,.34,M.stoneLight);for(const s of [-1,1]){b(s*.84,0,0,.35,1.35,.12,M.green);for(let j=0;j<4;j++)b(s*.84,-.46+j*.30,.08,.33,.045,.06,M.wood);}
  }
  function fence(x0,z0,x1,z1,gate=false){const len=Math.hypot(x1-x0,z1-z0),n=Math.ceil(len/1.65);for(let i=0;i<=n;i++){const t=i/n,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t,y=heightAt(x,z);box(x,y+.65,z,.13,1.3,.13,M.wood);if(i<n){const ex=x0+(x1-x0)*(i+1)/n,ez=z0+(z1-z0)*(i+1)/n;for(const h of [.48,.95])beam([x,y+h,z],[ex,heightAt(ex,ez)+h,ez],.095,M.board);if(gate)beam([x,y+.35,z],[ex,heightAt(ex,ez)+1.04,ez],.085,M.wood);}}
  }
  function pot(x,z){let y=heightAt(x,z);cyl(x,y+.26,z,.25,.48,M.pot,.32);ball(x,y+.63,z,.32,M.green,1,.7,1);for(let i=0;i<4;i++)ball(x+Math.cos(i*2)*.18,y+.77,z+Math.sin(i*2)*.18,.065,M.cloth);}
  function barrel(x,z){const y=heightAt(x,z);cyl(x,y+.48,z,.38,.96,M.board,.33);for(const h of [.18,.72])cyl(x,y+h,z,.39,.075,M.metal);cyl(x,y+.97,z,.31,.04,M.wood);}
  function shed(x,z){const w=2.8,d=3.2,base=footing(x,z,w,d);box(x,base+1.1,z-d/2+.09,w,2.2,.18,M.wood);for(let s of [-1,1]){box(x+s*(w/2-.08),base+1.1,z,.16,2.2,d,M.board);box(x+s*(w/2-.1),base+1.13,z+d/2-.1,.18,2.26,.18,M.wood);}roof(x,z,w,d,base+2.2,.7,M.red);
    for(let layer=0;layer<4;layer++)for(let j=0;j<6;j++){const xx=x-1+j*.38+(layer%2)*.08,yy=base+.18+layer*.32,zz=z-.25;const a=cyl(xx,yy,zz,.15,2.05,M.wood);a.rotation.x=Math.PI/2;const b=cyl(xx,yy,zz+1.035,.125,.035,M.board);b.rotation.x=Math.PI/2;}
  }
  function garden(x0,z0,x1,z1){surface(x0,z0,x1,z1,M.soil);for(let x=x0+.45;x<x1-.2;x+=.72){surface(x-.16,z0+.15,x+.16,z1-.15,M.board,.095);for(let z=z0+.45;z<z1-.25;z+=.63){const h=heightAt(x,z);ball(x,h+.25,z,.25,M.green,1,.65,1);for(let a=0;a<3;a++)ball(x+Math.cos(a*2.1)*.12,h+.32,z+Math.sin(a*2.1)*.12,.13,M.leaf,1,.7,1);}}fence(x0-.2,z0-.2,x1+.2,z0-.2);fence(x0-.2,z0-.2,x0-.2,z1+.2);fence(x1+.2,z0-.2,x1+.2,z1+.2);}
  function person(x,z){const y=heightAt(x,z);for(let s of [-1,1])beam([x+s*.14,y+.12,z],[x+s*.12,y+.83,z],.16,M.wood);cyl(x,y+1.08,z,.24,.64,M.blue,.2);ball(x,y+1.60,z,.19,M.skin);cyl(x,y+1.78,z,.30,.07,M.board);beam([x-.2,y+1.31,z],[x-.39,y+.97,z+.13],.12,M.blue);beam([x+.2,y+1.31,z],[x+.45,y+1.02,z+.18],.12,M.blue);}
  for(const i of [10,11]){
    const [x,oz]=layout().northHouses[i],w=9,d=8,z=Math.max(oz,bankZ(x-4.7,1)+11.8,bankZ(x+4.7,1)+11.8),h=i===10?4.55:4.9;
    const b=footing(x,z,w+.3,d+.3);box(x,b+h/2,z,w,h,d,i===10?M.cream:M.sage);
    // Complete plaster walls, timber corners and masonry plinth courses.
    for(const s of [-1,1]){for(const end of [-1,1])box(x+s*4.44,b+h/2,z+end*3.94,.18,h,.18,M.wood);box(x+s*4.53,b+h-.14,z,.15,.20,d,M.wood);box(x,b+.35,z+s*4.035,w,.45,.12,M.stoneLight);box(x,b+h-.14,z+s*4.06,w,.20,.16,M.wood);for(const dx of [-2.6,2.6])window(x+dx,b+2.38,z+s*4.09,s===1?0:Math.PI);window(x+s*4.56,b+2.32,z,s*Math.PI/2);}
    for(let row=0;row<2;row++)for(let j=0;j<12;j++)for(const s of [-1,1])box(x-4.2+j*.76+(row%2)*.18,b-.05+row*.25,z+s*4.17,.035,.23,.025,M.wood);
    roof(x,z,w,d,b+h,3.1,i===10?M.slate:M.red);
    for(const side of [-1,1]){
      for(let row=1;row<8;row++){const yy=row*.36,ww=(w+.84)*(1-yy/3.1);box(x,b+h+yy,z+side*4.405,ww,.045,.03,M.wood);}
      box(x,b+h+1.08,z+side*4.43,.66,.88,.05,M.wood);box(x,b+h+1.08,z+side*4.465,.44,.64,.025,M.dark);box(x,b+h+1.08,z+side*4.48,.055,.64,.02,M.board);
    }
    // North-facing entrance, canopy, threshold and a short path to the road shoulder.
    const front=z+4.09;box(x,b+1.25,front,1.4,2.5,.16,M.wood);for(let j=0;j<6;j++)box(x-.56+j*.22,b+1.25,front+.1,.025,2.34,.02,M.board);ball(x+.43,b+1.15,front+.15,.07,M.metal);
    box(x,b+2.72,front+.48,2,.16,1.03,M.board);for(const s of [-1,1])beam([x+s*.83,b+2.68,front+.83],[x+s*.83,b+2.05,front+.05],.10,M.wood);
    for(let j=0;j<2;j++){const zz=front+.25+j*.37,top=b-.03-j*.10,ground=heightAt(x,zz)-.04;box(x,(top+ground)/2,zz,1.8,Math.max(.10,top-ground),.43,M.stoneLight);}
    const rz=roadZ(x),edge=rz-(road.width+1.4)/2-.25;
    surface(x-4.85,front+.45,x+4.85,edge-.20,M.path,.10);surface(x-.79,front+.5,x+.79,rz-road.width/2,M.path,.12);
    fence(x-5.0,edge-.27,x-1.02,edge-.27);fence(x+1.02,edge-.27,x+5,edge-.27);fence(x-1.02,edge-.27,x-.12,edge-.27,true);
    // Chimney passes through the solid roof, capped in stone, dark open flue inset.
    const cx=x+2.0,cz=z-1.65,cy=b+h+2.65;box(cx,cy-1.1,cz,.85,2.6,.95,M.stone);box(cx,cy+.28,cz,1.08,.19,1.15,M.stoneLight);box(cx,cy+.39,cz,.58,.025,.66,M.dark);for(let j=0;j<6;j++)box(cx,cy-2.25+j*.38,cz+.48,.85,.03,.025,M.wood);
    pot(x-1.50,front+.60);pot(x+1.55,front+.65);barrel(x+4.98,z+2.1);
    // A bench beside each court and a bucket near the threshold.
    const bx=x-3.1,bz=front+.92,by=heightAt(bx,bz);box(bx,by+.57,bz,1.6,.14,.5,M.board);for(let s of [-1,1])box(bx+s*.58,by+.27,bz,.12,.54,.40,M.wood);box(bx,by+.95,bz-.20,1.6,.55,.10,M.board);
    cyl(x+2.15,heightAt(x+2.15,front+.65)+.22,front+.65,.2,.43,M.board,.25);
    if(i===10){shed(8.65,z+.65);surface(8.1,z+2.3,9.2,edge-.6,M.path);surface(x+4.85,edge-1.4,9.2,edge-.6,M.path);garden(-9.6,z-.7,-5.25,z+5.5);fence(10.55,z-1.1,10.55,edge-.3);person(x+2.3,edge-.85);}
    else{shed(19.75,z+.35);surface(19.2,z+2.0,20.3,edge-.6,M.path);surface(19.2,edge-1.4,x-4.85,edge-.6,M.path);garden(35.35,z+.4,38.55,z+6.0);fence(17.9,z-1.3,17.9,edge-1);person(22.4,z+3.1);}
  }
  return group;
}
