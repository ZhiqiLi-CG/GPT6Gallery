import {heightAt, bankZ, roadNetwork, layout, claimDistrict} from './root.js';
import {centralHoldings, claimCentralHolding} from './south-central-farms.js';

export function build(THREE, ctx) {
  claimDistrict('south-bank'); claimCentralHolding('east');
  const g=new THREE.Group(); g.name='south-central-east: working farm';
  const h=centralHoldings().east;
  // Consume the shared geography; all additions are inland of its reserves.
  const geography={bank:bankZ(29,-1),roads:roadNetwork(),layout:layout(),bounds:ctx.bounds};
  g.userData.geography={bank:geography.bank};
  const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.94});
  const m={plaster:mat(0xd9c9a4),wood:mat(0x685039),lightwood:mat(0x92734e),barn:mat(0x91704e),stone:mat(0x928b78),roof:mat(0x8b4935),tile:mat(0xa45d42),dark:mat(0x302e27),glass:mat(0x465b5d),green:mat(0x577341),dirt:mat(0xa28d67),soil:mat(0x67533a),hay:mat(0xc2a45f),iron:mat(0x47483f),water:mat(0x638484),cream:mat(0xded5bc)};
  const pools={}; const dummy=new THREE.Object3D();
  function box(x,y,z,w,hh,d,material,rx=0,ry=0,rz=0){
    const key=material.uuid; const list=(pools[key]||={mat:material,items:[]}).items;
    list.push([x,y,z,w,hh,d,rx,ry,rz]);
  }
  function mesh(geo,material,x,y,z,sx=1,sy=1,sz=1){const a=new THREE.Mesh(geo,material);a.position.set(x,y,z);a.scale.set(sx,sy,sz);a.castShadow=true;a.receiveShadow=true;g.add(a);return a;}
  function beam(a,b,r,material=m.wood){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),delta=vb.clone().sub(va);const o=mesh(new THREE.CylinderGeometry(r,r,delta.length(),6),material,...va.clone().add(vb).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return o;}
  function patch(cx,cz,w,d,material,lift=.08){const geo=new THREE.PlaneGeometry(w,d,Math.ceil(w),Math.ceil(d));geo.rotateX(-Math.PI/2);const p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,heightAt(cx+p.getX(i),cz+p.getZ(i))+lift);geo.computeVertexNormals();mesh(geo,material,cx,0,cz);}
  function path(points,width=2,lift=.13,material=m.dirt){const v=[],ind=[];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),n=Math.ceil(len);for(let j=0;j<n;j++){const off=v.length/3;for(const[t,s]of[[j/n,-1],[j/n,1],[(j+1)/n,-1],[(j+1)/n,1]]){const x=a[0]+dx*t-dz/len*width*s/2,z=a[1]+dz*t+dx/len*width*s/2;v.push(x,heightAt(x,z)+lift,z);}ind.push(off,off+1,off+2,off+1,off+3,off+2);}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(ind);geo.computeVertexNormals();mesh(geo,material,0,0,0);}
  function fence(a,b,gate=false){const len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(len/2.6);for(let i=0;i<=n;i++){const t=i/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,y=heightAt(x,z);box(x,y+.85,z,.18,1.9,.18,m.wood);}for(let i=0;i<n;i++){const t=i/n,u=(i+1)/n,aa=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t],bb=[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u];for(const yy of [.55,1.25])beam([aa[0],heightAt(...aa)+yy,aa[1]],[bb[0],heightAt(...bb)+yy,bb[1]],.065,gate?m.lightwood:m.wood);if(gate)beam([aa[0],heightAt(...aa)+.45,aa[1]],[bb[0],heightAt(...bb)+1.35,bb[1]],.055,m.lightwood);}}
  function building(x,z,w,d,wallH,barn=false){
    const corner=[[-1,-1],[-1,1],[1,-1],[1,1]].map(([a,b])=>heightAt(x+a*w/2,z+b*d/2));const floor=Math.max(...corner)+.22,low=Math.min(...corner)-.35;
    box(x,(floor+low)/2,z,w+.25,floor-low,d+.25,m.stone);
    box(x,floor+wallH/2,z,w,wallH,d,barn?m.barn:m.plaster);
    const rise=w*.38,eave=floor+wallH,ww=w+.9,dd=d+1.1;
    const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,rise);shape.closePath();mesh(new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false}),barn?m.barn:m.plaster,x,eave,z-d/2);
    const pitch=Math.atan2(rise,ww/2),slope=Math.hypot(ww/2,rise);
    for(const s of [-1,1]){box(x+s*ww/4,eave+rise/2,z,slope,.22,dd,m.roof,0,0,-s*pitch);
      for(let row=0;row<7;row++)for(let j=0;j<Math.ceil(dd/.65);j++){const t=(row+.5)/7;box(x+s*ww/2*t,eave+rise*(1-t)+.16,z-dd/2+(j+.5)*dd/Math.ceil(dd/.65),slope/7*.95,.07,.60,(j+row)%4===0?m.tile:m.roof,0,0,-s*pitch);}
      box(x+s*(w/2+.2),eave-.06,z,.18,.22,dd,m.wood);
    }
    beam([x,eave+rise+.12,z-dd/2],[x,eave+rise+.12,z+dd/2],.16,m.tile);
    for(const sx of [-1,1])for(const sz of [-1,1])box(x+sx*(w/2-.08),floor+wallH/2,z+sz*(d/2+.03),.23,wallH,.19,m.wood);
    for(const sz of [-1,1]){box(x,floor+.65,z+sz*(d/2+.06),w,.19,.13,m.wood);box(x,eave-.1,z+sz*(d/2+.07),w,.20,.15,m.wood);}
    if(barn){
      for(let xx=x-w/2+.35;xx<x+w/2;xx+=.55)for(const s of [-1,1])box(xx,floor+wallH/2,z+s*(d/2+.035),.045,wallH,.07,m.wood);
      for(let zz=z-d/2+.3;zz<z+d/2;zz+=.55)for(const s of [-1,1])box(x+s*(w/2+.04),floor+wallH/2,zz,.07,wallH,.045,m.wood);
    }
    const doorW=barn?4.2:1.45,doorH=barn?4.6:2.5;
    for(const side of [-1,1]){const zz=z+side*(d/2+.09);box(x,floor+doorH/2,zz,doorW,doorH,.14,m.dark);for(let i=0;i<(barn?10:5);i++)box(x-doorW/2+(i+.5)*doorW/(barn?10:5),floor+doorH/2,zz+side*.09,doorW/(barn?10:5)-.035,doorH-.08,.09,m.wood);
      for(const yy of [.55,doorH-.45])box(x,floor+yy,zz+side*.17,doorW,.14,.09,m.lightwood);
      if(barn){for(const s of [-1,1])beam([x+s*.07,floor+.5,zz+side*.21],[x+s*(doorW/2-.1),floor+doorH-.5,zz+side*.21],.06,m.lightwood);}else{
        for(let k=0;k<3;k++){const dz=d/2+.4+k*.45,gy=heightAt(x,z+side*dz);const top=floor-.12-k*.14;box(x,(gy+top)/2,z+side*dz,2.1,Math.max(.12,top-gy),.50,m.stone);}
      }
    }
    function window(xx,zz,sideAxis){const y=floor+(barn?4.6:3.1),rot=sideAxis?Math.PI/2:0,normal=sideAxis?Math.sign(xx-x):Math.sign(zz-z);box(xx,y,zz,1.18,1.38,.12,m.wood,0,rot);box(xx+(sideAxis?.075*normal:0),y,zz+(sideAxis?0:.075*normal),.92,1.10,.13,m.glass,0,rot);for(const s of [-1,1])box(xx+(sideAxis?0:s*.84),y,zz+(sideAxis?s*.84:0),.42,1.42,.13,m.green,0,rot);box(xx+(sideAxis?.15*normal:0),y,zz+(sideAxis?0:.15*normal),.07,1.16,.10,m.lightwood,0,rot);box(xx+(sideAxis?.15*normal:0),y,zz+(sideAxis?0:.15*normal),.98,.07,.10,m.lightwood,0,rot);}
    if(!barn){for(const side of [-1,1])for(const s of [-1,1])window(x+s*3.0,z+side*(d/2+.15),false);for(const side of [-1,1])for(const t of [-2.5,2.5])window(x+side*(w/2+.15),z+t,true);
      const cx=x-2.6,cz=z-2.2,cy=eave+rise*.7;box(cx,cy,cz,.95,4,1.1,m.stone);box(cx,cy+2.05,cz,1.2,.23,1.35,m.stone);box(cx,cy+2.19,cz,.65,.08,.75,m.dark);
    } else {box(x,eave+1.1,z+d/2+.04,1.4,1.6,.08,m.dark);for(const t of [-.4,0,.4])box(x+t,eave+1.1,z+d/2+.10,.09,1.6,.1,m.lightwood);}
    return floor;
  }
  const [hx,hz]=h.houses[0],[bx,bz]=h.barns[0];building(hx,hz,10,11,5.6);const barnFloor=building(bx,bz,13,18,6.4,true);
  for(const side of [-1,1]) {
    const v=[],idx=[],near=bz+side*9,far=near+side*3.3;
    for(let j=0;j<=8;j++)for(const xx of [bx-2.3,bx+2.3]) {const t=j/8,zz=near+(far-near)*t;v.push(xx,barnFloor*(1-t)+(heightAt(xx,far)+.16)*t,zz);}
    for(let j=0;j<8;j++){const o=j*2;idx.push(o,o+1,o+2,o+1,o+3,o+2);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(idx);geo.computeVertexNormals();const rampMat=m.dirt.clone();rampMat.side=THREE.DoubleSide;mesh(geo,rampMat,0,0,0);
  }
  patch(...h.court,m.dirt);path(h.access,2.25);path(h.doorPath,1.55);path([[17,-84],[17,-89],[29,-94]],1.6);path([[29,-95],[30,-121],[28,-123.5]],1.7);path([[17,-120],[17,-125],[10,-125]],1.5);
  // Enclosed court with clear pedestrian and cart gates.
  fence([7,-86],[14.9,-86]);fence([19.1,-86],[27.5,-86]);fence([31,-86],[36,-86]);fence([7,-86],[7,-104]);fence([7,-104],[10,-104]);fence([24,-104],[27.5,-104]);fence([31,-104],[36,-104]);fence([36,-104],[36,-86]);
  // Open livestock shelter along the east edge of the barn yard.
  const sx=32.5,sz=-112,sy=Math.max(heightAt(29.5,-117),heightAt(35.5,-117),heightAt(29.5,-107),heightAt(35.5,-107))+.15;
  for(const x of [29.5,35.5])for(const z of [-117,-112,-107]){const gy=heightAt(x,z);box(x,(gy+sy+3.2)/2,z,.23,sy+3.2-gy,.23,m.wood);}box(35.5,sy+1.4,sz,.17,2.8,10,m.barn);box(sx,sy+1.4,-117,6,2.8,.17,m.barn);
  box(sx,sy+3.45,sz,6.8,.22,11,m.roof,0,0,-.13);beam([29.3,sy+3.05,-117.5],[29.3,sy+3.05,-106.5],.13);
  // Vegetable beds with raised earth, board edges and repeated plants.
  const crops=[];for(let bed=0;bed<4;bed++){const z=-128-bed*4.4;patch(10.5,z,8,3.1,m.soil,.13);for(const zz of [z-1.6,z+1.6])path([[6.4,zz],[14.6,zz]],.12,.22,m.lightwood);for(let r=0;r<3;r++)for(let j=0;j<12;j++){const x=7+j*.64,zz=z-1+r*.95;crops.push([x,heightAt(x,zz)+.33,zz,.31,.32,.29]);}}
  const leaves=meshInstances(new THREE.DodecahedronGeometry(1,0),m.green,crops);
  fence([5.8,-124],[15.4,-124]);fence([5.8,-124],[5.8,-146.5]);fence([5.8,-146.5],[15.4,-146.5]);fence([15.4,-146.5],[15.4,-127]);
  // Gated grazing plot uses shared pasture bounds.
  const [px,pz,pw,pd]=h.pasture,x0=px-pw/2,x1=px+pw/2,z0=pz-pd/2,z1=pz+pd/2;
  fence([x0,z0],[x1,z0]);fence([x0,z0],[x0,z1]);fence([x1,z0],[x1,z1]);fence([x0,z1],[26.5,z1]);fence([30,z1],[x1,z1]);fence([26.5,z1],[30,z1],true);
  function ellipsoid(x,y,z,a,b,c,material){return mesh(new THREE.DodecahedronGeometry(1,1),material,x,y,z,a,b,c);}
  for(const [x,z]of[[24,-129],[31,-132],[26,-138],[32,-142],[23,-144],[29,-135]]){const y=heightAt(x,z);ellipsoid(x,y+.78,z,.62,.48,.95,m.cream);ellipsoid(x,y+.80,z+.93,.30,.35,.38,m.dark);for(const dx of [-.38,.38])for(const dz of [-.55,.55])box(x+dx,y+.32,z+dz,.12,.65,.12,m.dark);for(const dx of [-.29,.29])ellipsoid(x+dx,y+1.04,z+.95,.16,.1,.18,m.cream);}
  const ty=heightAt(33,-126);box(33,ty+.32,-126,3,.55,1.25,m.stone);box(33,ty+.63,-126,2.55,.03,.81,m.water);for(const zz of [-126.65,-125.35])box(33,ty+.66,zz,3.2,.28,.17,m.stone);
  // Hay under shelter and a covered firewood pile.
  for(let i=0;i<5;i++)for(let j=0;j<2;j++)box(31+j*1.7,heightAt(31+j*1.7,-114+i*1.35)+.50,-114+i*1.35,1.5,.9,1.2,m.hay);
  for(let row=0;row<4;row++)for(let j=0;j<7-row;j++){const x=8.5+j*.40+row*.2,z=-99,y=heightAt(x,z)+.22+row*.34;const log=mesh(new THREE.CylinderGeometry(.19,.19,2.6,7),m.lightwood,x,y,z);log.rotation.x=Math.PI/2;}
  box(9.5,heightAt(9.5,-99)+1.9,-99,4.2,.16,3.2,m.wood,0,0,.12);
  // Four-wheel cart with open plank bed, hubs, spokes and shafts.
  const wx=31.7,wz=-96,wy=heightAt(wx,wz);
  box(wx,wy+1.0,wz,2.35,.2,3.5,m.lightwood);
  for(const side of [-1,1]){for(let j=0;j<3;j++)box(wx+side*1.18,wy+1.25+j*.3,wz,.12,.21,3.6,m.barn);for(const zz of [-1.25,1.25]){const wheel=mesh(new THREE.TorusGeometry(.70,.09,6,16),m.iron,wx+side*1.4,wy+.72,wz+zz);wheel.rotation.y=Math.PI/2;for(let k=0;k<8;k++){const a=k*Math.PI/4;beam([wx+side*1.41,wy+.72,wz+zz],[wx+side*1.41,wy+.72+Math.sin(a)*.65,wz+zz+Math.cos(a)*.65],.035,m.lightwood);}beam([wx-1.45,wy+.72,wz+zz],[wx+1.45,wy+.72,wz+zz],.09,m.iron);}beam([wx+side*.72,wy+1,wz+1.8],[wx+side*.72,wy+.55,wz+4],.075);}
  for(let j=0;j<3;j++)box(wx,wy+1.25+j*.3,wz-1.75,2.4,.21,.12,m.barn);
  // Barrels, sacks, tools and stepping stones populate domestic and working space.
  for(const [x,z] of [[23,-87],[24,-89],[11,-102]]){const y=heightAt(x,z);mesh(new THREE.CylinderGeometry(.45,.4,1.05,10),m.lightwood,x,y+.53,z);for(const yy of [.18,.85])mesh(new THREE.TorusGeometry(.435,.035,4,12),m.iron,x,y+yy,z).rotation.x=Math.PI/2;}
  for(let i=0;i<5;i++)ellipsoid(25+i%2*.75,heightAt(25,-101)+.4,-101+Math.floor(i/2)*.6,.4,.58,.36,m.cream);
  beam([34,heightAt(34,-108),-108],[35.3,sy+2.4,-108],.05);for(let i=0;i<5;i++)beam([35.0+i*.13,sy+2.4,-108],[35.0+i*.13,sy+2.85,-108],.028);
  // Deterministic instanced meadow tufts, shrubs and cobbles, avoiding paths and buildings.
  let seed=991;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};const grass=[];
  for(let i=0;i<1700;i++){const x=5+rand()*31,z=-148+rand()*91;const pasture=x>x0+.4&&x<x1-.4&&z>z0+.4&&z<z1-.5;const margin=x<6.2||x>36||(z>-70&&Math.abs(z+65)>1.3&&Math.abs(x-29)>1.5)||(x>16.5&&x<20&&z<-125);if(!pasture&&!margin)continue;grass.push([x,heightAt(x,z)+.18,z,.10+rand()*.12,.16+rand()*.25,.12]);}
  meshInstances(new THREE.ConeGeometry(1,1,4),mat(0x819451),grass);
  const stones=[];for(let i=0;i<160;i++){const x=9+rand()*25,z=-87-rand()*16;if(x>27.8&&x<30.2)continue;stones.push([x,heightAt(x,z)+.13,z,.07+rand()*.13,.05,.10+rand()*.15]);}meshInstances(new THREE.DodecahedronGeometry(1,0),m.stone,stones);
  const shrubs=[];for(let i=0;i<24;i++){const z=-58-i*1.7;shrubs.push([35.8,heightAt(35.8,z)+.5,z,.55,.55,.65]);}meshInstances(new THREE.DodecahedronGeometry(1,1),m.green,shrubs);
  function meshInstances(geo,material,items){const inst=new THREE.InstancedMesh(geo,material,items.length);for(let i=0;i<items.length;i++){const [x,y,z,a,b,c]=items[i];dummy.position.set(x,y,z);dummy.rotation.set(0,0,0);dummy.scale.set(a,b,c);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);}inst.castShadow=true;inst.receiveShadow=true;g.add(inst);return inst;}
  for(const pool of Object.values(pools)){const inst=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),pool.mat,pool.items.length);pool.items.forEach((p,i)=>{dummy.position.set(...p.slice(0,3));dummy.scale.set(...p.slice(3,6));dummy.rotation.set(...p.slice(6,9));dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);});inst.castShadow=true;inst.receiveShadow=true;g.add(inst);}
  return g;
}
