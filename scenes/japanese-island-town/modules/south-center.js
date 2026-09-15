import { heightAt, roadNetwork, layout } from './root.js';

// Shared enclosure structure only: leaf children own each parcel's interior.
export function build(THREE, ctx) {
  const g = new THREE.Group(); g.name='Four southern center yard enclosures';
  const mats={};
  for(const [name,color] of Object.entries({wood:'#806747',dark:'#4e3d2d',cut:'#a78a5c',metal:'#53544c',bark:'#63503e',pine:'#365b43',pineLight:'#4d6b47',pink:'#dca6ad',pinkLight:'#ecc2c1',pollen:'#b99065'})) mats[name]=new THREE.MeshStandardMaterial({color,roughness:.93});
  const boxGeo=new THREE.BoxGeometry(1,1,1), sphere=new THREE.IcosahedronGeometry(1,1), cyl=new THREE.CylinderGeometry(1,1,1,8), batches=new Map(), d=new THREE.Object3D();
  function instance(geo,mat,x,y,z,sx,sy,sz,ry=0){d.position.set(x,y,z);d.rotation.set(0,ry,0);d.scale.set(sx,sy,sz);d.updateMatrix();save(geo,mat);}
  function save(geo,mat){const key=geo.uuid+mat;if(!batches.has(key))batches.set(key,{geo,mat:mats[mat],items:[]});batches.get(key).items.push(d.matrix.clone());}
  function beam(a,b,r,mat='wood'){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av);d.position.copy(av.add(bv).multiplyScalar(.5));d.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());d.scale.set(r,delta.length(),r);d.updateMatrix();save(cyl,mat);}
  const roads=roadNetwork();
  function clear(x,z,r){return roads.every(road=>road.points.slice(1).every((b,i)=>{const a=road.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)>=road.width/2+r+.3;}));}
  function fence(x0,z0,x1,z1,h=1.08,style=0){
    const len=Math.hypot(x1-x0,z1-z0),n=Math.ceil(len/.29),angle=Math.atan2(x1-x0,z1-z0);
    const point=t=>[x0+(x1-x0)*t,z0+(z1-z0)*t];
    for(let i=0;i<=n;i++){const [x,z]=point(i/n);if(!clear(x,z,.10))continue;const y=heightAt(x,z)+.10;instance(boxGeo,style?'cut':'wood',x,y+h*.48,z,.10,h*.96,.065,angle);}
    const panels=Math.ceil(len/1.75);
    for(let i=0;i<=panels;i++){const [x,z]=point(i/panels),y=heightAt(x,z)+.05;instance(boxGeo,'dark',x,y+(h+.12)/2,z,.16,h+.12,.16);instance(boxGeo,'cut',x,y+h+.13,z,.20,.07,.20);if(i<panels){const [xx,zz]=point((i+1)/panels);for(const level of [.25,.76])beam([x,y+h*level,z],[xx,heightAt(xx,zz)+.05+h*level,zz],.045);}}
  }
  function openGate(x,z,toward){
    for(const side of [-1,1]){
      const xx=x+side*1.4,y=heightAt(xx,z)+.10;
      instance(boxGeo,'dark',xx,y+.62,z,.20,1.24,.20);
      // Short leaves folded beside the clear approach, modeled as slats and rails.
      fence(xx,z,xx,z+toward*.82,.87,1);
      for(const yy of [.26,.70])instance(boxGeo,'metal',xx+side*.105,y+yy,z,.045,.12,.16);
      instance(boxGeo,'metal',xx,y+.66,z+toward*.74,.22,.055,.06);
    }
  }
  for(const index of [2,3,8,9]){
    const l=layout().town.lots[index],southern=l.face==='north',x=l.x;
    const front=southern?-57:-51,back=southern?-77:-38.35,lo=x-5.5,hi=x+5.5;
    fence(lo,front,x-1.4,front,index===9?.72:1.02,index%2);
    if(index!==9)fence(x+1.4,front,hi,front,.99,index%2);
    // Shop frontage east of the door is deliberately unfenced for customers.
    fence(lo,front,lo,back,index===8?.86:1.10,index%2);
    fence(hi,southern?-59:front+.5,hi,back,index===9?.76:1.02,index%2);
    if(index===3){fence(lo,back,x+1.2,back,1.14,1);fence(x+2.3,back,hi,back,1.14,1);}
    else fence(lo,back,hi,back,southern?1.12:.78,index%2);
    openGate(x,front,southern?-1:1);
  }
  function tree(x,z,pine){
    const radius=pine?1.8:2.1;if(!clear(x,z,radius))return;
    const y=heightAt(x,z),height=pine?3.8:4.3;
    beam([x,y-.08,z],[x-.12,y+1.6,z+.07],.17,'bark');
    beam([x-.12,y+1.6,z+.07],[x+.20,y+height*.83,z+.15],.115,'bark');
    for(let j=0;j<5;j++){const a=j*1.256,xx=x+Math.cos(a)*.45,zz=z+Math.sin(a)*.45;beam([xx,heightAt(xx,zz)+.03,zz],[x,y+.35,z],.065,'bark');}
    for(let k=0;k<6;k++){
      const a=k*2.4,r=pine?.80:1.06,xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r,yy=y+2.6+(k%3)*.55;
      beam([x+.12,y+1.6+k*.2,z],[xx,yy,zz],.075,'bark');
      if(pine){
        instance(sphere,k%2?'pineLight':'pine',xx,yy+.25,zz,.78,.22,.65,k);
        for(let j=0;j<48;j++){
          const b=j*2.39996+k,radius=.73*Math.sqrt((j+.5)/48),tx=xx+Math.cos(b)*radius,tz=zz+Math.sin(b)*radius*.84,ty=yy+.29+.17*Math.sqrt(1-radius/.8);
          for(let q=0;q<3;q++){const c=b+q*2.094;beam([tx,ty-.07,tz],[tx+Math.cos(c)*.10,ty+.12,tz+Math.sin(c)*.10],.012,q%2?'pine':'pineLight');}
        }
      } else {
        // Visible fine twigs carry separate five-petal blossoms, without solid crown balls.
        for(let j=0;j<18;j++){
          const b=j*2.39996+k,rad=.81*Math.sqrt((j+.5)/18),tx=xx+Math.cos(b)*rad,tz=zz+Math.sin(b)*rad*.89,ty=yy+.20+.48*(1-rad/.9);
          beam([xx,yy-.07,zz],[tx,ty,tz],.017,'bark');
          for(let q=0;q<6;q++){
            const c=q*2.39996+j,rr=.08+.035*(q%3),fx=tx+Math.cos(c)*rr,fz=tz+Math.sin(c)*rr,fy=ty+.04+(q%3)*.055;
            for(let p=0;p<5;p++){const angle=p*1.256+c;instance(sphere,(j+q+p)%3?'pinkLight':'pink',fx+Math.cos(angle)*.045,fy,fz+Math.sin(angle)*.045,.042,.019,.061,-angle+Math.PI/2);}
            instance(sphere,'pollen',fx,fy+.020,fz,.023,.014,.023);
          }
        }
      }
    }
    if(pine){instance(sphere,'pineLight',x+.2,y+height,z,.65,.22,.57);for(let j=0;j<45;j++){const a=j*2.39996,rr=.59*Math.sqrt(j/45),xx=x+.2+Math.cos(a)*rr,zz=z+Math.sin(a)*rr*.84;beam([xx,y+height+.1,zz],[xx+.07*Math.cos(a),y+height+.28,zz+.07*Math.sin(a)],.016,'pine');}}
  }
  tree(-50.6,-73.1,false);tree(-23.9,-71.8,true);
  for(const b of batches.values()){const mesh=new THREE.InstancedMesh(b.geo,b.mat,b.items.length);b.items.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);}
  return g;
}
