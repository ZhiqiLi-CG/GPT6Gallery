// Root owns continuous geography and settlement structure. World units are metres.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
export function streamX(z){return 43+5*Math.sin((z+15)/24)}
export function streamWater(z){return Math.max(0.02,0.075*(z+68))}
function natural(x,z){
 const a=Math.atan2(z/94,x/112); const r=Math.hypot(x/112,z/94);
 const shore=1+0.035*Math.sin(a*7)+0.022*Math.cos(a*11);
 const edge=shore-r;
 const land=6.1*smooth(edge/0.19);
 const hill=22*Math.exp(-((x-9)**2/1050+(z-51)**2/640));
 const west=5*Math.exp(-((x+68)**2/750+(z-30)**2/1700));
 const texture=(0.42*Math.sin(x/8)*Math.cos(z/11)+0.26*Math.sin((x+z)/5))*smooth(edge/0.13);
 return -4+smooth((edge+0.06)/0.1)*4+land+(hill+west)*smooth(edge/0.2)+texture;
}
const lots=[];
for(const [district,xs] of [['west-village',[-58,-43]],['central-village',[-25,-10]],['east-village',[8,23]]])for(let row=0;row<5;row++)for(let col=0;col<2;col++){
 const z=[-48,-33,-10,6,22][row],x=xs[col];
 lots.push({id:`${district}-lot-${row*2+col+1}`,district,x,z,w:11,d:12,houseW:7.3,houseD:8.0,y:natural(x,z),front:col===0?'east':'west'});
}
export function heightAt(x,z){
 let h=natural(x,z);
 for(const p of lots){const d=Math.max(Math.abs(x-p.x)-4.9,Math.abs(z-p.z)-5.8);if(d<2.4)h=h*(1-smooth((2.4-d)/2.4))+p.y*smooth((2.4-d)/2.4)}
 // Temple platform, raised naturally into a compact hill.
 const pd=Math.max(Math.abs(x-7)-18,Math.abs(z-52)-14);if(pd<8)h=h*(1-smooth((8-pd)/8))+25*smooth((8-pd)/8);
 // Graded harbor apron and a genuinely submerged protected basin.
 const apron=Math.min(smooth((x-48)/5),smooth((94-x)/5),smooth((z+64)/4),smooth((-40-z)/5));h=h*(1-apron)+2.1*apron;
 const basin=Math.min(smooth((x-49)/4),smooth((95-x)/4),smooth((-60-z)/3),smooth((z+90)/5));h=h*(1-basin)-3.0*basin;
 if(z>-85&&z<63){const dx=Math.abs(x-streamX(z)),e=smooth((z+85)/7)*smooth((63-z)/7); if(dx<8){const target=streamWater(z)+(dx<2.3?-1.0:0.8+0.1*(dx-2.3));h=h*(1-e*smooth((8-dx)/3))+target*e*smooth((8-dx)/3)}}
 return h;
}
export function roadNetwork(){return [
 {id:'harbor-lane',width:3.8,points:[[-78,-23],[-51,-23],[-18,-23],[17,-23],[36,-23],[51,-23],[56,-37],[62,-55]]},
 {id:'west-lane',width:2.8,points:[[-50.5,-59],[-50.5,-23],[-50.5,33],[-64,42],[-76,46]]},
 {id:'central-lane',width:3.0,points:[[-17.5,-59],[-17.5,-23],[-17.5,30],[-6,35],[7,36]]},
 {id:'east-lane',width:2.8,points:[[15.5,-58],[15.5,-23],[15.5,29],[7,36]]},
 {id:'shore-path',width:2.3,points:[[-50.5,-56],[-65,-60],[-77,-65]]},
 {id:'field-path',width:2.3,points:[[-78,-23],[-77,1],[-77,28],[-76,46]]},
 {id:'north-crossing',width:2.3,points:[[15.5,29],[31,31],[40,31],[50,31],[61,39]]}
 ]}
export function layout(){return {lots,seaLevel:0,stream:{zMin:-84,zMax:60,halfWidth:2.3,bridge:{x:streamX(31),z:31,width:3.4}},districts:[
 {id:'west-village',rect:[-66,-58,-35,31]}, {id:'central-village',rect:[-34,-58,-2,31]}, {id:'east-village',rect:[-1,-58,33,30]},
 {id:'temple',rect:[-22,35,34,77]}, {id:'harbor',rect:[49,-90,95,-29]}, {id:'rice-terraces',rect:[-96,-19,-66,62]},
 {id:'shore-shrine',rect:[-94,-79,-63,-42]}, {id:'stream-garden',rect:[34,-23,56,64]},
 {id:'woodland',rect:[-111,-90,111,93]}
 ],temple:{x:7,z:52,y:25},harbor:{quayZ:-59,x0:52,x1:86,deckY:2.3},shrine:{x:-77,z:-65}}}
export function build(THREE,ctx){
 const g=new THREE.Group();g.name='island geography';
 const mat=(c,extra={})=>new THREE.MeshStandardMaterial({color:c,roughness:0.94,...extra});
 const road=mat(0xa49a80),sea=mat(0x397d87,{roughness:0.31,metalness:0.17}),river=mat(0x5c9d9f,{roughness:0.28,metalness:0.15});
 // Deterministic fine surface grain; geometry and all public height functions stay fixed.
 function noiseTexture(water=false){const n=256,data=new Uint8Array(n*n*4);let seed=1729;for(let j=0;j<n;j++)for(let i=0;i<n;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const rand=seed/4294967296;const wave=Math.sin(i*0.245+2.4*Math.sin(j*0.049))*Math.sin(j*0.098);const v=water?Math.round(193+17*wave+15*rand):Math.round(204+42*rand+8*Math.sin(i*0.81)*Math.sin(j*0.73));const k=(j*n+i)*4;data[k]=data[k+1]=data[k+2]=v;data[k+3]=255}const t=new THREE.DataTexture(data,n,n);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t}
 const grain=noiseTexture(),waves=noiseTexture(true);road.map=grain;road.bumpMap=grain;road.bumpScale=0.035;road.vertexColors=true;
 river.bumpMap=waves;river.bumpScale=0.055;river.roughness=0.38;
 const seaWaves=waves.clone();seaWaves.repeat.set(1000,1000);seaWaves.needsUpdate=true;sea.bumpMap=seaWaves;sea.bumpScale=0.09;sea.roughness=0.43;
 function mesh(geo,m,x=0,y=0,z=0){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.receiveShadow=true;o.castShadow=true;g.add(o);return o}
 // Continuous seabed/land heightfield; its outside perimeter is submerged.
 const N=520,span=260,positions=[],colors=[],indices=[],uvs=[];const c=new THREE.Color();
 for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const x=-span/2+i*span/N,z=-span/2+j*span/N,y=heightAt(x,z);positions.push(x,y,z);uvs.push(x/8,z/8);c.set(y<1.7?0xb9b294:y>18?0x7d8971:0x80916a);const v=1+0.035*Math.sin(x*1.6+z*2.7)+0.025*Math.cos(z*3.3);c.multiplyScalar(v);colors.push(c.r,c.g,c.b)}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i;indices.push(a,a+N+1,a+1,a+1,a+N+1,a+N+2)}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,map:grain,bumpMap:grain,bumpScale:0.045}));
 // Join shelf water to open sea edge-to-edge: overlapping planes caused depth flicker.
 const oceanVertices=[],oceanUV=[],oceanIndices=[];for(const [x0,z0,x1,z1] of [[-6000,135,6000,6000],[-6000,-6000,6000,-135],[-6000,-135,-135,135],[135,-135,6000,135]]){const k=oceanVertices.length/3;for(const [x,z] of [[x0,z0],[x0,z1],[x1,z1],[x1,z0]]){oceanVertices.push(x,-.025,z);oceanUV.push(x/12000,z/12000)}oceanIndices.push(k,k+1,k+2,k,k+2,k+3)}const oceanGeo=new THREE.BufferGeometry();oceanGeo.setAttribute('position',new THREE.Float32BufferAttribute(oceanVertices,3));oceanGeo.setAttribute('uv',new THREE.Float32BufferAttribute(oceanUV,2));oceanGeo.setIndex(oceanIndices);oceanGeo.computeVertexNormals();const ocean=mesh(oceanGeo,sea);ocean.castShadow=false;
 function strip(points,width,m,yfun){const v=[],ix=[],uv=[],cc=[],cols=12;for(let i=0;i<points.length;i++){const p=points[i],a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);for(let c=0;c<=cols;c++){const s=(c/cols-0.5),edge=Math.abs(s)*2,x=p[0]+s*dz/len*width,z=p[1]-s*dx/len*width;let y=yfun(x,z);if(m===road)y-=0.12*Math.pow(edge,6);v.push(x,y,z);uv.push(x/8,z/8);const wheel=Math.exp(-Math.pow((Math.abs(s)-0.24)/0.12,2));const value=0.90+0.1*wheel-0.15*Math.pow(edge,5);cc.push(value,value,value);if(i&&c){const k=i*(cols+1)+c;ix.push(k-cols-2,k-1,k-cols-1,k-cols-1,k-1,k)}}}const q=new THREE.BufferGeometry();q.setAttribute('position',new THREE.Float32BufferAttribute(v,3));q.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));q.setAttribute('color',new THREE.Float32BufferAttribute(cc,3));q.setIndex(ix);q.computeVertexNormals();return mesh(q,m)}
 const rp=[];for(let z=-84;z<=60;z+=0.8)rp.push([streamX(z),z]);strip(rp,4.2,river,(x,z)=>streamWater(z)+0.035);
 for(const r of roadNetwork()){
  const pts=[];for(let k=1;k<r.points.length;k++){const a=r.points[k-1],b=r.points[k],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])*3);for(let i=0;i<n;i++)pts.push([a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n])}pts.push(r.points.at(-1));
  // The two bridge crossings are open spans, owned by the stream/harbor builders.
  let batch=[];for(const p of pts){const gap=Math.abs(p[0]-streamX(p[1]))<3.4;if(gap){if(batch.length>1)strip(batch,r.width,road,(x,z)=>heightAt(x,z)+0.19);batch=[]}else batch.push(p)}if(batch.length>1)strip(batch,r.width,road,(x,z)=>heightAt(x,z)+0.19);
 }
 // Foot streets become constructed stone stair flights where the temple hill is steep.
 // No route, width, terrain sample or child approach is moved.
 const stairMats=[0x8b8c80,0x98998b,0x82867c].map(c=>mat(c,{map:grain,bumpMap:grain,bumpScale:0.018}));
 for(const id of ['central-lane','east-lane']){const r=roadNetwork().find(r=>r.id===id);for(let k=1;k<r.points.length;k++){const a=r.points[k-1],b=r.points[k],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L,n=Math.ceil(L/0.24),run=L/n;
  for(let j=0;j<n;j++){const d=(j+.5)*run,x=a[0]+ux*d,z=a[1]+uz*d;if(z<18)continue;const h0=heightAt(x-ux*run/2,z-uz*run/2),h1=heightAt(x+ux*run/2,z+uz*run/2);let treadTop=-Infinity;for(const along of [-.5,.5])for(const across of [-.5,.5]){treadTop=Math.max(treadTop,heightAt(x+ux*run*along+uz*(r.width-.10)*across,z+uz*run*along-ux*(r.width-.10)*across)+.205)}
   for(let col=0;col<3;col++){const width=(r.width-.10)/3-.013,side=(col-1)*(r.width-.10)/3,xx=x+uz*side,zz=z-ux*side;let top=-Infinity,bottom=Infinity;for(const along of [-.5,.5])for(const across of [-.5,.5]){const q=heightAt(xx+ux*run*along+uz*width*across,zz+uz*run*along-ux*width*across);top=treadTop;bottom=Math.min(bottom,q-.18)}const step=mesh(new THREE.BoxGeometry(width,top-bottom,run+.012),stairMats[(j+col)%3],xx,(top+bottom)/2,zz);step.rotation.y=Math.atan2(ux,uz)}
  }
 }}
 // A water surface over the coastal shelf colors the shallows from the actual seabed.
 const waterPos=[],waterColor=[],waterUV=[],waterIdx=[],WN=180,extent=270;
 const deep=new THREE.Color(0x397d87),shallow=new THREE.Color(0x72a69c);
 for(let j=0;j<=WN;j++)for(let i=0;i<=WN;i++){const x=-extent/2+i*extent/WN,z=-extent/2+j*extent/WN,h=heightAt(x,z),t=0.72*smooth((h+4)/4);const col=deep.clone().lerp(shallow,t);waterPos.push(x,-0.025,z);waterColor.push(col.r,col.g,col.b);waterUV.push(x/12,z/12)}
 for(let j=0;j<WN;j++)for(let i=0;i<WN;i++){const k=j*(WN+1)+i;waterIdx.push(k,k+WN+1,k+1,k+1,k+WN+1,k+WN+2)}
 const waterGeo=new THREE.BufferGeometry();waterGeo.setAttribute('position',new THREE.Float32BufferAttribute(waterPos,3));waterGeo.setAttribute('color',new THREE.Float32BufferAttribute(waterColor,3));waterGeo.setAttribute('uv',new THREE.Float32BufferAttribute(waterUV,2));waterGeo.setIndex(waterIdx);waterGeo.computeVertexNormals();const shelf=mesh(waterGeo,mat(0xffffff,{vertexColors:true,roughness:0.43,metalness:0.17,bumpMap:waves,bumpScale:0.09}));shelf.castShadow=false;
 // Broken, low-relief wave crests only on root water; no shoreline rocks or planting.
 const foam=mat(0xa1c1b8,{transparent:true,opacity:0.20});const foamPos=[],foamIdx=[];
 for(let i=0;i<420;i++){const a=i*2.39996,r=105+27*Math.sin(i*9.3),x=Math.cos(a)*r,z=Math.sin(a)*r*0.87;if(heightAt(x,z)>-0.15)continue;const len=0.7+(i%7)*0.55;for(let k=0;k<6;k++){const xx=x+len*(k/5-0.5),zz=z+0.11*Math.sin(k*0.9+i);if(heightAt(xx,zz)>-0.12)continue;const q=foamPos.length/3;foamPos.push(xx,0.035,zz,xx+len/6,0.035,zz+0.015,xx+len/6,0.035,zz+0.045,xx,0.035,zz+0.030);foamIdx.push(q,q+2,q+1,q,q+3,q+2)}}const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.Float32BufferAttribute(foamPos,3));fg.setIndex(foamIdx);fg.computeVertexNormals();const f=mesh(fg,foam);f.castShadow=false;
 // All district construction is now delivered by its owner; root previews are retired.
 return g;
}
