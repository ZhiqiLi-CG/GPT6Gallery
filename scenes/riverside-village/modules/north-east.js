import { heightAt, roadNetwork, claimDistrict } from './root.js';

// Completed shared circulation; the composer builds each delivered holding module.
export function build(THREE, ctx) {
  claimDistrict('north-bank');
  const g=new THREE.Group();g.name='Eastern north-bank connecting lanes';
  const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.96});
  const stone=mat(0x9c9584);
  function mesh(geo,m,x=0,y=0,z=0){const a=new THREE.Mesh(geo,m);a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;g.add(a);return a;}
  function ribbon(points,width,color,lift){const v=[],indices=[];
    for(let k=0;k<points.length-1;k++){
      const [x,z]=points[k],[ex,ez]=points[k+1],dx=ex-x,dz=ez-z,len=Math.hypot(dx,dz),n=Math.ceil(len);
      for(let j=0;j<n;j++){const b=v.length/3;for(const [q,s]of [[j/n,-1],[j/n,1],[(j+1)/n,-1],[(j+1)/n,1]]){
        const px=x+dx*q-s*dz/len*width/2,pz=z+dz*q+s*dx/len*width/2;v.push(px,heightAt(px,pz)+lift,pz);
      }indices.push(b,b+2,b+1,b+1,b+2,b+3);}
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(indices);geo.computeVertexNormals();
    const a=mesh(geo,new THREE.MeshStandardMaterial({color,roughness:1,side:THREE.DoubleSide}));a.castShadow=false;
  }
  const north=roadNetwork().find(r=>r.id==='north-road');
  function roadZ(x){for(let i=1;i<north.points.length;i++){const a=north.points[i-1],b=north.points[i];if(x>=a[0]&&x<=b[0])return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}throw Error('North road does not cover lane junction');}
  const lanes=[[[38,roadZ(38)],[38,94]], [[-8,94],[38,94],[79,96]], [[61,95.12],[61,106]]];
  for(const line of lanes){ribbon(line,3.8,0x96916a,.18);ribbon(line,2.8,0xb5a17d,.23);}
  // Sparse gravel edges make these narrow, worn domestic lanes legible.
  for(const line of lanes)for(let k=0;k<line.length-1;k++){
    const [x,z]=line[k],[ex,ez]=line[k+1],dx=ex-x,dz=ez-z,len=Math.hypot(dx,dz);
    for(let j=1;j<len;j+=2.7)for(const side of [-1,1]){
      const px=x+dx*j/len-side*dz/len*1.65,pz=z+dz*j/len+side*dx/len*1.65;
      const a=mesh(new THREE.DodecahedronGeometry(.14,0),stone,px,heightAt(px,pz)+.16,pz);a.scale.y=.5;
    }
  }
  return g;
}
