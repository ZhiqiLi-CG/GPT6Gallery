import { heightAt, roadNetwork, claimDistrict } from './root.js';

// Permanent shared circulation; completed holdings are composed from child modules.
export function build(THREE, ctx) {
  claimDistrict('north-bank');
  const group = new THREE.Group(); group.name = 'Northwest lanes and holdings';
  const material = color => new THREE.MeshStandardMaterial({color, roughness: .95});
  const earth = material(0xb6a27d), edge = material(0x92906a);
  earth.side=THREE.DoubleSide;edge.side=THREE.DoubleSide;
  function add(geometry, mat, x=0,y=0,z=0) {
    const mesh = new THREE.Mesh(geometry,mat);mesh.position.set(x,y,z);
    mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;
  }
  function ribbon(points,width,mat,lift) {
    const vertices=[],indices=[];
    for(let k=1;k<points.length;k++) {
      const [x,z]=points[k-1],[ex,ez]=points[k],dx=ex-x,dz=ez-z;
      const len=Math.hypot(dx,dz),n=Math.ceil(len);
      for(let j=0;j<n;j++) {
        const b=vertices.length/3;
        for(const [q,s] of [[j/n,-1],[j/n,1],[(j+1)/n,-1],[(j+1)/n,1]]) {
          const px=x+dx*q-dz/len*width*s/2,pz=z+dz*q+dx/len*width*s/2;
          vertices.push(px,heightAt(px,pz)+lift,pz);
        }
        indices.push(b,b+2,b+1,b+1,b+2,b+3);
      }
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    geometry.setIndex(indices);geometry.computeVertexNormals();add(geometry,mat);
  }
  const main=roadNetwork().find(r=>r.id==='north-road');
  function roadZ(x) {
    for(let i=1;i<main.points.length;i++) {
      const a=main.points[i-1],b=main.points[i];
      if(x>=a[0]&&x<=b[0])return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);
    }
    throw new Error('Northwest lane junction is outside root road');
  }
  // Rear service loop skirts the western frontage and leaves x=-91 landing clear.
  const routes=[ [[-131,roadZ(-131)],[-131,85],[-40,85]],
    [[-40,85],[-37,80],[-37,roadZ(-37)]] ];
  for(const route of routes){ribbon(route,3.7,edge,.18);ribbon(route,2.9,earth,.235);}
  group.userData = { dwellingCount: 0, barnCount: 0, connects: ['north-road', 'north-west-street', 'north-west-farm'], laneWidth: 2.9, shoulderWidth: 3.7 };
  return group;
}
