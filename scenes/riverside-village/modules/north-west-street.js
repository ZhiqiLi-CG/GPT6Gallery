import { heightAt, bankZ, roadNetwork, layout, claimDistrict } from './root.js';

export function build(THREE, ctx) {
  claimDistrict('north-bank');
  const group = new THREE.Group(); group.name = 'north-west-street: four inhabited street households';
  const M = c => new THREE.MeshStandardMaterial({color:c, roughness:.93});
  const wood=M(0x65513b), lightwood=M(0x968066), stone=M(0x9c9684), mortar=M(0xb2aa93), dark=M(0x283c3a), iron=M(0x444b43);
  const wall=[M(0xd7c4a1),M(0xc3c4ac),M(0xddcbb0),M(0xcbb590)], roof=[M(0x945e46),M(0x586769),M(0x8b614b),M(0xa06b50)];
  const tile=[M(0xa47154),M(0x6c7977),M(0x9b7256),M(0xb47a59)];
  const leaves=[M(0x55763a),M(0x6c8645),M(0x78934b)], soil=M(0x66523a), plant=M(0x5e813a), fruit=M(0xb97943), cloth=[M(0xd5cdb5),M(0x819ea0),M(0xb58c7b)];
  function mesh(geo,mat,x=0,y=0,z=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
  function box(x,y,z,w,h,d,m){return mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z);}
  function beam(a,b,r,m=wood){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);const o=mesh(new THREE.CylinderGeometry(r,r,v.length(),6),m,...av.clone().add(bv).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
  function groundPatch(x,z,w,d,mat,lift=.09){const geo=new THREE.PlaneGeometry(w,d,Math.ceil(w),Math.ceil(d));geo.rotateX(-Math.PI/2);const p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,heightAt(x+p.getX(i),z+p.getZ(i))+lift);geo.computeVertexNormals();const o=mesh(geo,mat,x,0,z);o.castShadow=false;}
  const pathMat=M(0xb4a17f);pathMat.side=THREE.DoubleSide;
  function path(a,b,width=1.5){const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),v=[],idx=[];for(let j=0;j<=Math.ceil(len);j++){let t=j/Math.ceil(len);for(const s of [-1,1]){let x=a[0]+dx*t-dz/len*s*width/2,z=a[1]+dz*t+dx/len*s*width/2;v.push(x,heightAt(x,z)+.25,z);}if(j){let k=j*2-2;idx.push(k,k+2,k+1,k+1,k+2,k+3);}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(idx);geo.computeVertexNormals();const o=mesh(geo,pathMat);o.castShadow=false;}
  function fence(a,b,gate=false){const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/2);for(let i=0;i<=n;i++){let t=i/n,x=a[0]+t*(b[0]-a[0]),z=a[1]+t*(b[1]-a[1]);box(x,heightAt(x,z)+.66,z,.14,1.32,.14,wood);if(i<n){let tx=a[0]+(i+1)/n*(b[0]-a[0]),tz=a[1]+(i+1)/n*(b[1]-a[1]);for(const y of [.45,1.05])beam([x,heightAt(x,z)+y,z],[tx,heightAt(tx,tz)+y,tz],.055,lightwood);if(gate)beam([x,heightAt(x,z)+.4,z],[tx,heightAt(tx,tz)+1.05,tz],.045,wood);}}}
  function foundation(x,z,w,d){const hs=[[-1,-1],[-1,1],[1,-1],[1,1]].map(([a,b])=>heightAt(x+a*(w+.4)/2,z+b*(d+.4)/2));const base=Math.max(...hs)+.15,low=Math.min(...hs)-.25;box(x,(low+base)/2,z,w+.4,base-low,d+.4,stone);return base;}
  function pitched(x,z,w,d,y,rise,mat){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,rise);s.closePath();mesh(new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false}),mat,x,y,z-d/2);}
  function roofCover(x,z,w,d,y,rise,mat){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(0,rise);s.lineTo(w/2,0);s.lineTo(w/2,-.3);s.lineTo(0,rise-.3);s.lineTo(-w/2,-.3);s.closePath();mesh(new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false}),mat,x,y,z-d/2);}
  function windowAt(x,y,z,side,shutters=true){const a=side===0;box(x,y,z,a?1.15:.10,1.35,a?.10:1.15,dark);box(x,y-.73,z,a?1.4:.23,.13,a?.23:1.4,stone);for(const k of [-1,1])box(x+(a?k*.62:0),y,z+(a?0:k*.62),a?.12:.16,1.5,a?.16:.12,wood);box(x,y,z,a?.09:.18,1.35,a?.18:.09,lightwood);box(x,y,z,a?1.2:.18,.09,a?.18:1.2,lightwood);if(shutters)for(const k of [-1,1])box(x+(a?k*.88:0),y,z+(a?0:k*.88),a?.4:.14,1.4,a?.14:.4,wood);}
  function house(x,z,w,d,h,i){const base=foundation(x,z,w,d);box(x,base+h/2,z,w,h,d,wall[i]);
    const eave=base+h,rise=w*.4;pitched(x,z,w,d,eave,rise,wall[i]);roofCover(x,z,w+1,d+1,eave-.10,rise+.40,roof[i]);
    // Solid roofs with ridge caps and repeated tile courses on both slopes.
    for(let k=0;k<11;k++){const t=(k+.5)/11;for(const side of [-1,1]){let tx=x+side*(w+1)/2*t,ty=eave-.10+(rise+.40)*(1-t)+.05;beam([tx,ty,z-d/2-.48],[tx,ty,z+d/2+.48],.035,tile[i]);}}
    for(let zz=z-d/2-.4;zz<z+d/2+.5;zz+=.7)for(const side of [-1,1])beam([x,eave+rise+.34,zz],[x+side*(w+1)/2,eave-.04,zz],.018,tile[i]);
    for(let q=-d/2;q<d/2+.5;q+=.48)box(x,eave+rise+.33,z+q,.32,.20,.44,tile[i]);
    for(const s of [-1,1]){box(x,base+.45,z+s*(d/2+.025),w,.19,.15,wood);box(x,eave-.1,z+s*(d/2+.04),w,.23,.20,wood);for(const k of [-1,1])box(x+k*(w/2-.1),base+h/2,z+s*(d/2+.04),.22,h,.19,wood);}
    for(const s of [-1,1]){box(x+s*(w/2+.02),eave-.12,z,.15,.22,d,wood);for(const k of [-1,1])windowAt(x+s*(w/2+.08),base+2.5,z+k*d*.23,1);windowAt(x-w*.26,base+2.5,z+s*(d/2+.08),0);windowAt(x+w*.26,base+2.5,z+s*(d/2+.08),0);windowAt(x,eave+1.05,z+s*(d/2+.09),0,false);}
    if(i===1||i===3)for(const s of [-1,1])box(x,base+h*.65,z+s*(d/2+.06),w,.19,.16,wood);
    box(x,base+1.2,z-d/2-.09,1.5,2.4,.16,wood);for(const k of [-.5,0,.5])box(x+k,base+1.2,z-d/2-.19,.035,2.25,.03,lightwood);mesh(new THREE.SphereGeometry(.065,7,5),iron,x+.5,base+1.2,z-d/2-.22);
    const stepY=heightAt(x,z-d/2-.6);box(x,(base+stepY)/2,z-d/2-.65,2.2,Math.max(.15,base-stepY),1.2,stone);
    const cx=x+w*.26,cz=z+d*.23,chimBottom=eave+rise*.4;box(cx,chimBottom+1.85,cz,.85,3.7,.9,stone);box(cx,chimBottom+3.75,cz,1.05,.25,1.1,mortar);box(cx,chimBottom+3.9,cz,.62,.08,.65,dark);for(let q=0;q<5;q++)box(cx,chimBottom+q*.6+.7,cz-.461,.83,.045,.025,mortar);
    return base;
  }
  function shed(x,z,i){const w=3.4,d=3.7,base=foundation(x,z,w,d),h=2.5;box(x,base+h/2,z,w,h,d,wood);pitched(x,z,w+.5,d+.5,base+h,1.1,roof[i]);for(let k=-1.7;k<=1.8;k+=.32)box(x+k,base+1.25,z-d/2-.03,.045,2.5,.07,lightwood);box(x,base+1,z-d/2-.1,1.3,2,.14,dark);for(const s of [-1,1])box(x+s*.67,base+1,z-d/2-.2,.10,2.15,.1,lightwood);beam([x-.6,base+.15,z-d/2-.21],[x+.6,base+1.8,z-d/2-.21],.065,lightwood);}
  function garden(x,z,w,d){groundPatch(x,z,w,d,soil,.12);for(const s of [-1,1]){fence([x-w/2,z+s*d/2],[x+w/2,z+s*d/2]);}for(let r=0;r<4;r++){let xx=x-w*.36+r*w*.24;for(let j=0;j<7;j++){let zz=z-d*.39+j*d*.13;const yy=heightAt(xx,zz);const p=mesh(new THREE.IcosahedronGeometry(.25,0),leaves[(r+j)%3],xx,yy+.33,zz);p.scale.set(1,.65,1);if(r===3)beam([xx,yy,zz],[xx,yy+.9,zz],.025,lightwood);}}}
  function tree(x,z,i){const y=heightAt(x,z);beam([x,y,z],[x,y+3.8,z],.18);for(let k=0;k<5;k++){let a=k*Math.PI*2/5,xx=x+Math.cos(a)*1.2,zz=z+Math.sin(a)*1.2;beam([x,y+2.3,z],[xx,y+4,zz],.08);const o=mesh(new THREE.IcosahedronGeometry(1.45,1),leaves[(k+i)%3],xx,y+4.15+(k%2)*.4,zz);o.scale.y=.9;for(let q=0;q<3;q++)mesh(new THREE.SphereGeometry(.13,6,4),fruit,xx+Math.cos(q*2+k)*1.15,y+3.6+q*.25,zz+Math.sin(q*2+k)*1.0);}}
  function barrel(x,z){const y=heightAt(x,z);mesh(new THREE.CylinderGeometry(.39,.35,.85,10),wood,x,y+.43,z);for(const q of [.15,.68]){const o=mesh(new THREE.TorusGeometry(.39,.035,5,12),iron,x,y+q,z);o.rotation.x=Math.PI/2;}}
  function person(x,z,i){const y=heightAt(x,z);for(const s of [-1,1])beam([x+s*.13,y+.1,z],[x+s*.1,y+.7,z],.09,wood);mesh(new THREE.CylinderGeometry(.22,.31,.66,7),cloth[i%3],x,y+1,z);mesh(new THREE.SphereGeometry(.19,8,6),M(0xc6a179),x,y+1.55,z);for(const s of [-1,1])beam([x+s*.21,y+1.23,z],[x+s*.36,y+.87,z+.1],.07,cloth[i%3]);}
  const north=roadNetwork().find(r=>r.id==='north-road');
  function roadZ(x){for(let j=1;j<north.points.length;j++){const a=north.points[j-1],b=north.points[j];if(x>=a[0]&&x<=b[0])return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}throw Error('road coverage');}

  function cart(x,z,i){const y=heightAt(x,z);box(x,y+.85,z,1.5,.16,2.3,wood);for(const side of [-1,1]){for(let k=0;k<3;k++)box(x+side*.76,y+.98+k*.19,z,.12,.14,2.3,lightwood);const wheel=mesh(new THREE.TorusGeometry(.63,.075,6,16),wood,x+side*.98,y+.65,z+.15);wheel.rotation.y=Math.PI/2;for(let k=0;k<8;k++){const a=k*Math.PI/4;beam([x+side*.98,y+.65,z+.15],[x+side*.98,y+.65+Math.sin(a)*.6,z+.15+Math.cos(a)*.6],.035,lightwood);}beam([x+side*.55,y+.9,z-1],[x+side*.55,y+.47,z-2.7],.065);}box(x,y+1.16,z+1.1,1.5,.62,.12,wood);for(let k=0;k<4;k++)mesh(new THREE.SphereGeometry(.24,7,5),i?fruit:soil,x-.4+k*.25,y+1.1,z+.2);}
  const plans=[
    {index:0,left:-126,right:-102,w:10.6,d:10,h:6.2,sx:-120,sz:79.5},
    {index:1,left:-101,right:-80,w:9,d:9,h:5.5,sx:-97,sz:79.8},
    {index:2,left:-79,right:-57,w:11,d:10,h:6.7,sx:-74,sz:79.8},
    {index:3,left:-56,right:-40,w:8.4,d:10,h:5.6,sx:-53,sz:79.8}
  ];
  plans.forEach((p,i)=>{
    let [x,z]=layout().northHouses[p.index];if(i===3)x-=2;
    const front=Math.max(roadZ(p.left),roadZ(p.right))+north.width/2+1.5,back=82.8;
    if(front<bankZ(x,1)+10)throw Error('Street yard encroaches on waterfront');
    const base=house(x,z,p.w,p.d,p.h,i);shed(p.sx,p.sz,i);
    // Paths join actual root-road geometry, and terminate at the parent's rear lane centre.
    path([x,roadZ(x)],[x,z-p.d/2-.2],1.65);
    groundPatch(x,z-p.d/2-2.0,5.3,3.5,pathMat,.12);
    const sideX=i===3?-41.7:x+p.w/2+1.3,gateX=i===3?-44:sideX;
    path([x,z-p.d/2-2],[sideX,z-p.d/2-2],1.2);
    path([sideX,z-p.d/2-2],[sideX,78],1.2);
    path([sideX,78],[gateX,81.5],1.2);path([gateX,81.5],[gateX,85],1.35);
    path([p.sx,p.sz-2],[gateX,78],1.1);
    fence([p.left,front],[x-1,front]);fence([x+1,front],[p.right,front]);
    // Front and rear gates have cross braces, latches, and an obvious paired-post opening.
    fence([x-1,front],[x+1,front],true);
    fence([p.left,front],[p.left,back]);
    if(i===3){fence([p.right,front],[p.right,78]);fence([p.right,78],[-42.6,back]);}
    else fence([p.right,front],[p.right,back]);
    const rearRight=i===3?-42.6:p.right;
    fence([p.left,back],[gateX-.85,back]);fence([gateX+.85,back],[rearRight,back]);fence([gateX-.85,back],[gateX+.85,back],true);
    for(const [gx,gz]of [[x,front],[gateX,back]])box(gx+.45,heightAt(gx,gz)+.91,gz-.09,.3,.07,.06,iron);
    // Individual kitchen gardens stay entirely behind the root road shoulder.
    garden(p.left+4.2,front+4.2,5.7,5.6);
    tree(p.right-3.3,front+5.0,i);
    if(i===0)garden(-110.8,80.5,4.0,3.0);
    if(i===1)garden(-88.8,80.6,3.3,2.8);
    if(i===2)garden(-65,80.5,4.1,3.0);
    // Stone quoins anchor every corner; two facades show diagonal timber bracing.
    for(const a of [-1,1])for(const b of [-1,1])for(let k=0;k<6;k++)box(x+a*(p.w/2-.14),base+.3+k*.52,z+b*(p.d/2+.045),.46,.24,.18,k%2?stone:mortar);
    if(i===0||i===2)for(const side of [-1,1]){
      box(x,base+4.15,z+side*(p.d/2+.1),p.w,.2,.18,wood);
      for(const a of [-1,1])beam([x+a*p.w*.47,base+4.3,z+side*(p.d/2+.14)],[x+a*p.w*.25,base+p.h-.2,z+side*(p.d/2+.14)],.075,wood);
    }
    // A small full timber porch on the taller houses.
    if(i===0||i===2){const py=base+2.8,pz=z-p.d/2-.75;
      const aw=box(x,py,pz,2.5,.18,1.7,roof[i]);aw.rotation.x=-.13;
      for(const side of [-1,1])beam([x+side*1.05,heightAt(x+side*1.05,pz-.6),pz-.6],[x+side*1.05,py-.08,pz-.6],.085);
    }
    barrel(p.sx+1.15,p.sz-2.35);barrel(x-p.w/2-.7,z-2.0);
    // Wood piles, benches and laundry give the small back yards a domestic use.
    const lx=p.left+1.5,lz=z+1;
    for(let row=0;row<3;row++)for(let k=0;k<5-row;k++){
      const zz=lz+k*.34,yy=heightAt(lx,zz)+.17+row*.3;
      beam([lx-.6,yy,zz],[lx+.6,yy,zz],.15,wood);
      const end=mesh(new THREE.CylinderGeometry(.13,.13,.03,8),lightwood,lx+.62,yy,zz);end.rotation.z=Math.PI/2;
    }
    box(lx,heightAt(lx,lz)+1.08,lz+.5,1.65,.12,2.1,wood);
    const ax=p.left+1,az=z-5.5,bz=z-1;
    beam([ax,heightAt(ax,az),az],[ax,heightAt(ax,az)+2.1,az],.06);
    beam([ax,heightAt(ax,bz),bz],[ax,heightAt(ax,bz)+2.1,bz],.06);
    beam([ax,heightAt(ax,az)+2.1,az],[ax,heightAt(ax,bz)+2.1,bz],.018,lightwood);
    for(let k=0;k<3;k++)box(ax,heightAt(ax,az+k+1)+1.65,az+k*1.1+.8,.04,.8,.75,cloth[(i+k)%3]);
    const bx=x-2.4,bz2=z-p.d/2-1.0,by=heightAt(bx,bz2);
    box(bx,by+.63,bz2,1.8,.15,.52,wood);for(const side of [-1,1])box(bx+side*.64,by+.3,bz2,.15,.6,.4,wood);
    for(const side of [-1,1]){const fx=x+side*1.25,fz=z-p.d/2-.38,fy=heightAt(fx,fz);mesh(new THREE.CylinderGeometry(.32,.24,.48,8),roof[i],fx,fy+.25,fz);for(let k=0;k<5;k++){const xx=fx+Math.sin(k*2)*.24,zz=fz+Math.cos(k*2)*.24;beam([xx,fy+.4,zz],[xx,fy+.85,zz],.018,plant);mesh(new THREE.SphereGeometry(.10,6,4),k%2?fruit:cloth[2],xx,fy+.85,zz);}}
    person(x+.7,front+2,i);if(i===2)person(gateX,80.6,1);
    if(i===0||i===2)cart(x+4.1,front+3.9,i);
    // Grain sacks and stacked boxes by each tool shed.
    const crateX=p.sx-1.0,crateZ=p.sz-2.4,crateY=heightAt(crateX,crateZ);
    box(crateX,crateY+.42,crateZ,.8,.8,.7,wood);for(let k=0;k<4;k++)box(crateX,crateY+.12+k*.19,crateZ-.36,.83,.045,.035,lightwood);
    const sack=mesh(new THREE.SphereGeometry(.4,8,6),cloth[0],crateX+.85,crateY+.42,crateZ);sack.scale.set(.85,1.15,.8);
  });
  return group;
}
