// Shared island geometry. Coordinates: metres, +x east, +z north, +y up.
export function coastRadius(a){return 1 + .045*Math.sin(a*5+.3)+.026*Math.cos(a*9);}
export function islandRadius(x,z){return Math.hypot(x/119,(z-6)/118)/coastRadius(Math.atan2((z-6)/118,x/119));}
export function streamAt(z){const x=21+5*Math.sin((z+20)/23);return {x,width:3.6,waterY:rawHeight(x,z)-.92};}
function rawHeight(x,z){
 const r=islandRadius(x,z);if(r>=1)return -1.5-(r-1)*12;
 if(x>34&&x<107&&z<-66)return -2;
 let h=3.2+23*Math.exp(-((x+35)**2/2000+(z-53)**2/1700))+10*Math.exp(-((x-65)**2/1500+(z-66)**2/1600));
 h+=.23*Math.sin(x*.15)*Math.cos(z*.13);
 const pd=Math.hypot(Math.max(-60-x,0,x+10),Math.max(32-z,0,z-78));
 if(pd<10){let t=1-pd/10;t=t*t*(3-2*t);h=h*(1-t)+22*t;}
 if(x>=36&&z>=14&&z<74&&x<=88-Math.floor((z-14)/10)*3)h=6+Math.floor((z-14)/10)*1.5;
 return h*Math.min(1,Math.max(0,(1-r)/.16))-.25;
}
export function heightAt(x,z){let h=rawHeight(x,z);if(z>-115&&z<88){const d=Math.abs(x-streamAt(z).x);h-=1.45*Math.exp(-d*d/8);}return h;}
export function roadNetwork(){return [
 {id:'market-south',width:4.2,points:[[-88,-54],[9,-54],[28,-61],[62,-62],[89,-69]]},
 {id:'market-middle',width:4,points:[[-89,-22],[10,-22],[34,-22],[56,-2],[65,12]]},
 {id:'market-north',width:3.5,points:[[-85,8],[7,8],[34,12],[65,12]]},
 {id:'west-lane',width:3,points:[[-55,-75],[-55,15],[-53,28],[-44,32]]},
 {id:'east-lane',width:3,points:[[-19,-76],[-19,17],[-10,30]]},
 {id:'hill-path',width:3,points:[[-53,28],[-65,34],[-67,46],[-61,56],[-57,57]]},
 {id:'rice-path',width:2.2,points:[[33,12],[33,87],[53,96]]},
 {id:'shore-path',width:2.4,points:[[-78,-55],[-86,-70],[-75,-83],[-55,-91],[-36,-87],[-19,-76]]}
 ];}
export function layout(){const lots=[];let i=0;for(const z of [-64,-44,-32,-12,-2,18])for(const x of [-78,-66,-43,-31,-7,5])lots.push({id:`house-${++i}`,x,z,w:9,d:8,face:z===-64||z===-32||z===-2?'north':'south'});return {
 island:{center:[0,6],radii:[119,118]},town:{rect:[-91,-78,12,27],lots},
 temple:{rect:[-62,31,-9,79],padY:21.75,pagoda:[-27,58],hall:[-48,57],entry:[-57,36]},
 harbor:{rect:[34,-111,109,-37],quay:[38,-67,87,-61],waterY:0},
 rice:{rect:[35,14,92,88],terraces:Array.from({length:6},(_,i)=>({x0:36,x1:88-i*3,z0:14+i*10,z1:24+i*10,y:5.75+i*1.5}))},
 bridge:{x:streamAt(-22).x,z:-22,width:4,length:12},torii:{x:-55,z:-91},
 blockoutKinds:{town:'district-town-built',temple:'district-temple-built',harbor:'district-harbor-built',rice:'district-rice-built'}
 };}
export function build(THREE,ctx){
 const g=new THREE.Group();g.name='Island terrain, coast, streets and landscape';
 const mat=(c)=>new THREE.MeshStandardMaterial({color:c,roughness:.92});
 const grass=mat('#708566'),sand=mat('#b3a98b'),rock=mat('#737a73'),wood=mat('#674b34'),red=mat('#af3b2c'),roof=mat('#4d5a60'),road=mat('#b8aa8d'),pine=mat('#365b43');
 function mesh(geo,m,x=0,y=0,z=0){const a=new THREE.Mesh(geo,m);a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;g.add(a);return a;}
 function box(x,y,z,w,h,d,m){return mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z);}
 function beam(a,b,r,m){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.clone().sub(av);const o=mesh(new THREE.CylinderGeometry(r,r,d.length(),7),m,...av.clone().add(bv).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o;}
 // Interpolate the actual root terrain triangles so narrow paths cannot intersect the coarser mesh.
 function ground(x,z){const st=1.5,ix=Math.floor((x+142.5)/st),iz=Math.floor((z+136.5)/st),x0=-142.5+ix*st,z0=-136.5+iz*st,u=(x-x0)/st,v=(z-z0)/st;const a=heightAt(x0,z0),b=heightAt(x0+st,z0),c=heightAt(x0,z0+st),d=heightAt(x0+st,z0+st);return u+v<=1?a+(b-a)*u+(c-a)*v:d+(c-d)*(1-u)+(b-d)*(1-v);}
 function ribbon(points,width,m,offset=.07){const verts=[],idx=[];let n=0;for(let j=0;j<points.length-1;j++){const a=points[j],b=points[j+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]),steps=Math.ceil(len/.6),nx=-(b[1]-a[1])/len*width/2,nz=(b[0]-a[0])/len*width/2;for(let k=0;k<=steps;k++){const t=k/steps,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;for(let j=0;j<=6;j++){const f=j/3-1,xx=x+nx*f,zz=z+nz*f;verts.push(xx,ground(xx,zz)+offset,zz);}if(k<steps)for(let q=0;q<6;q++)idx.push(n+q,n+q+1,n+q+7,n+q+1,n+q+8,n+q+7);n+=7;}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(idx);geo.computeVertexNormals();mesh(geo,m);}
 function roadDistance(x,z){let best=1e6;for(const q of roadNetwork())for(let i=0;i<q.points.length-1;i++){const a=q.points[i],b=q.points[i+1],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));best=Math.min(best,Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)-q.width/2);}return best;}
 function inDistrict(x,z,pad=0){return (x>-92-pad&&x<13+pad&&z>-79-pad&&z<29+pad)||(x>-65-pad&&x<-7+pad&&z>30-pad&&z<82+pad)||(x>35-pad&&x<96+pad&&z>13-pad&&z<94+pad)||(x>34-pad&&x<110+pad&&z>-113-pad&&z<-36+pad);}
 // Continuous submerged terrain extends past the shore into a very large sea.
 const pos=[],cols=[],ids=[];const N=190,step=1.5;for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){let x=-142.5+i*step,z=-136.5+j*step,h=heightAt(x,z);pos.push(x,h,z);const r=islandRadius(x,z);const c=new THREE.Color(r>.87?'#aea78b':h>18?'#718269':'#7c9066');c.multiplyScalar(.94+.08*Math.sin(x*.39+z*.27));cols.push(c.r,c.g,c.b);if(i<N&&j<N){let a=j*(N+1)+i;ids.push(a,a+N+1,a+1,a+1,a+N+1,a+N+2);}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));geo.setIndex(ids);geo.computeVertexNormals();mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));
 const sea=mesh(new THREE.PlaneGeometry(30000,30000),new THREE.MeshStandardMaterial({color:'#609999',roughness:.78,metalness:.02}),0,-.05,0);sea.rotation.x=-Math.PI/2;
 // Low foam strokes and intertidal stones around the entire island.
 for(let i=0;i<150;i++){const a=i/150*Math.PI*2,r=coastRadius(a);const x=Math.cos(a)*119*r,z=6+Math.sin(a)*118*r;if(x>32&&x<110&&z<-65)continue;const s=.7+((i*17)%9)*.19;const stone=mesh(new THREE.DodecahedronGeometry(s,0),rock,x,heightAt(x,z)+s*.2,z);stone.scale.set(1.4,.6,1);if(i%3===0){const f=box(x*1.026,.015,(z-6)*1.026+6,3.5,.025,.15,mat('#a6c6bc'));f.rotation.y=-a-Math.PI/2;}}
 for(const r of roadNetwork())ribbon(r.points,r.width,road);
 // Stream: banks, flowing ribbon, pebbles. Bridge is excluded from the water mesh's path only vertically.
 const wp=[],wi=[];for(let z=-112,k=0;z<=88;z++,k++){const s=streamAt(z);for(const dx of [-1.4,1.4])wp.push(s.x+dx,s.waterY,z);if(k<200)wi.push(k*2,k*2+2,k*2+1,k*2+1,k*2+2,k*2+3);if(k%3===0){for(const side of [-1,1]){const x=s.x+side*2.2;mesh(new THREE.DodecahedronGeometry(.45+(k%4)*.1,0),rock,x,heightAt(x,z)+.1,z);}}}
 const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(wp,3));wg.setIndex(wi);wg.computeVertexNormals();mesh(wg,new THREE.MeshStandardMaterial({color:'#709f9a',roughness:.26,side:THREE.DoubleSide}));
 const br=layout().bridge, by=Math.max(heightAt(br.x-6,br.z),heightAt(br.x+6,br.z))+.25;
 for(let i=0;i<31;i++){let x=br.x-6+i*.4,y=by+.8*Math.sin(i/30*Math.PI);box(x,y,-22,.37,.27,4.3,wood);}
 for(const side of [-1,1]){let last=null;for(let i=0;i<=8;i++){const x=br.x-6+i*1.5,y=by+.8*Math.sin(i/8*Math.PI);box(x,y+.7,-22+side*2,.16,1.45,.16,red);const p=[x,y+1.35,-22+side*2];if(last)beam(last,p,.085,red);last=p;}box(br.x-4,by-1.5,-22+side*1.5,.45,3,.45,wood);box(br.x+4,by-1.5,-22+side*1.5,.45,3,.45,wood);}
 // Vermilion torii at the southwest shore, stone approach and lanterns.
 const tx=-55,tz=-91,ty=heightAt(tx,tz);for(const dx of [-3.3,3.3]){mesh(new THREE.CylinderGeometry(.32,.43,7,12),red,tx+dx,ty+3.5,tz);mesh(new THREE.CylinderGeometry(.47,.47,.8,12),rock,tx+dx,ty+.4,tz);}box(tx,ty+6.4,tz,9,.48,.55,red);box(tx,ty+7.2,tz,10.2,.52,.8,wood);for(const dx of [-4.8,4.8]){const tip=box(tx+dx,ty+7.38,tz,1,.3,.8,wood);tip.rotation.z=dx<0?-.18:.18;}box(tx,ty+5.7,tz,.7,1.1,.25,red);
 function lantern(x,z){const y=heightAt(x,z);box(x,y+.17,z,1.1,.34,1.1,rock);box(x,y+.9,z,.35,1.5,.35,rock);box(x,y+1.7,z,.85,.18,.85,rock);for(const dx of [-.25,.25])for(const dz of [-.25,.25])box(x+dx,y+2,z+dz,.1,.52,.1,rock);box(x,y+2,z,.16,.22,.16,mat('#ded2a8'));mesh(new THREE.ConeGeometry(.76,.5,4),rock,x,y+2.5,z).rotation.y=Math.PI/4;mesh(new THREE.SphereGeometry(.16,6,4),rock,x,y+2.82,z);}
 for(const [x,z] of [[-60,-87],[-50,-87],[-87,-58],[8,-24],[-60,28],[-64,35]])lantern(x,z);
 // Dense, varied coastal woodland and a managed grove joining the harbor to the fields.
 const bark=mat('#6b5943'),leafMats=['#365b43','#42654a','#4d7050','#58784e'].map(mat),pinkMats=['#d9a0ac','#e7b7c1','#c7899c'].map(mat),reeds=mat('#777e45'),ochre=mat('#989167');
 function tree(x,z,s,cherry=false,seed=0){const y=ground(x,z),lean=Math.sin(seed)*.6*s;beam([x,y-.15,z],[x+lean,y+5.1*s,z],.19*s,bark);const leaves=cherry?pinkMats:leafMats;for(let j=0;j<5;j++){const a=j*2.3+seed,xx=x+Math.cos(a)*1.6*s,zz=z+Math.sin(a)*1.6*s,yy=y+(3.3+j*.52)*s;beam([x+lean*.4,y+2.3*s,z],[xx,yy,zz],.095*s,bark);for(let k=0;k<5;k++){const aa=k*2.4+j,rr=k===0?0:1.0*s;const o=mesh(new THREE.IcosahedronGeometry((cherry?.9:1.1)*s,1),leaves[(j+k)%leaves.length],xx+Math.cos(aa)*rr,yy+Math.sin(k)*.23*s,zz+Math.sin(aa)*rr);o.scale.y=cherry?.84:.40;}}}
 const planted=[];
 for(let i=0;i<1200;i++){const x=Math.sin(i*127.1)*113,z=6+Math.sin(i*311.7+2)*113,r=islandRadius(x,z);if(r>.91||r<.1||heightAt(x,z)<2||inDistrict(x,z,3)||Math.abs(x-streamAt(z).x)<6||roadDistance(x,z)<3.3)continue;if(planted.some(p=>Math.hypot(x-p[0],z-p[1])<5.8))continue;planted.push([x,z]);tree(x,z,.70+(i%7)*.08,i%7===0,i);}
 // Instancing keeps fine ground vegetation cheap across the unbuilt margins.
 function instances(geom,material,items){const m=new THREE.InstancedMesh(geom,material,items.length),o=new THREE.Object3D();items.forEach((p,i)=>{o.position.set(p[0],p[1],p[2]);o.scale.set(p[3],p[4],p[5]);o.rotation.set(0,p[6]||0,0);o.updateMatrix();m.setMatrixAt(i,o.matrix);});m.castShadow=true;m.receiveShadow=true;g.add(m);}
 const bushes=[],stones=[],tufts=[];
 for(let i=0;i<16000;i++){const x=Math.sin(i*73.19+1)*120,z=6+Math.sin(i*153.71+2)*119,r=islandRadius(x,z),h=ground(x,z);if(r>.99||h<.2||inDistrict(x,z,1.3)||roadDistance(x,z)<.5||Math.abs(x-streamAt(z).x)<2)continue;const v=(i%11)/11;tufts.push([x,h+.08,z,.12+v*.16,.22+v*.35,.12+v*.16,i]);if(i%15===0)bushes.push([x,h+.22,z,.45+v,.34+v*.35,.43+v,i]);if(i%29===0)stones.push([x,h+.07,z,.25+v*.5,.13+v*.2,.25+v*.35,i]);}
 instances(new THREE.ConeGeometry(1,1,4),reeds,tufts);instances(new THREE.IcosahedronGeometry(1,0),leafMats[2],bushes);instances(new THREE.DodecahedronGeometry(1,0),rock,stones);
 // Broken-edge verge stones and fine gravel define the public lanes.
 const edging=[],gravel=[];for(const q of roadNetwork())for(let j=0;j<q.points.length-1;j++){const a=q.points[j],b=q.points[j+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/len,uz=(b[1]-a[1])/len;for(let t=0;t<len;t+=.7){const x=a[0]+ux*t,z=a[1]+uz*t;if(Math.abs(x-streamAt(z).x)<5)continue;for(const side of [-1,1]){const xx=x-uz*side*(q.width*.5+.13),zz=z+ux*side*(q.width*.5+.13);if(!inDistrict(xx,zz))edging.push([xx,ground(xx,zz)+.09,zz,.21,.13,.25,t]);}for(let k=0;k<2;k++){const f=Math.sin(t*9+k)*q.width*.42,xx=x-uz*f,zz=z+ux*f;gravel.push([xx,ground(xx,zz)+.09,zz,.035,.025,.06,t]);}}}
 instances(new THREE.DodecahedronGeometry(1,0),rock,edging);instances(new THREE.DodecahedronGeometry(1,0),ochre,gravel);
 // Secondary public crossings: level plank decks, bank footings, beams and railings.
 for(const roadId of ['market-south','market-north']){const r=roadNetwork().find(r=>r.id===roadId);const a=r.points[1],b=r.points[2];let t=.5;for(let n=0;n<8;n++){const z=a[1]+(b[1]-a[1])*t;t=(streamAt(z).x-a[0])/(b[0]-a[0]);}const cx=a[0]+(b[0]-a[0])*t,cz=a[1]+(b[1]-a[1])*t,len=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/len,uz=(b[1]-a[1])/len,L=9,W=r.width,deck=Math.max(ground(cx-ux*L/2,cz-uz*L/2),ground(cx+ux*L/2,cz+uz*L/2))+.16;const loc=(u,v,y)=>[cx+ux*u-uz*v,y,cz+uz*u+ux*v];
 for(let u=-L/2;u<=L/2;u+=.34){const p=loc(u,0,deck);const q=box(...p,.32,.22,W+.3,wood);q.rotation.y=-Math.atan2(uz,ux);}
 for(const v of [-W*.42,W*.42]){beam(loc(-L/2,v,deck-.3),loc(L/2,v,deck-.3),.19,bark);for(const u of [-4,-2,0,2,4]){beam(loc(u,v,deck),loc(u,v,deck+1.05),.08,wood);}beam(loc(-4,v,deck+1.05),loc(4,v,deck+1.05),.09,wood);}
 for(const u of [-L/2,L/2]){const p=loc(u,0,deck-.5);const q=box(...p,.8,1,W+.5,rock);q.rotation.y=-Math.atan2(uz,ux);const end=loc(u*1.5,0,0),near=loc(u,0,0),h=ground(end[0],end[2])+.09;for(let k=0;k<8;k++){const f=k/8,u2=u+(u*.5)*f,p2=loc(u2,0,deck+(h-deck)*f);const pl=box(...p2,.31,.2,W+.1,wood);pl.rotation.y=-Math.atan2(uz,ux);}}
 }
 // The main bridge has continuous structural stringers, cross braces and iron nail heads.
 const iron=mat('#434743');for(const side of [-1,1]){for(let i=0;i<30;i++){const x=br.x-6+i*.4,y=by+.8*Math.sin(i/30*Math.PI);beam([x,y-.28,-22+side*1.45],[x+.4,by+.8*Math.sin((i+1)/30*Math.PI)-.28,-22+side*1.45],.15,wood);box(x,y+.145,-22+side*1.7,.045,.016,.045,iron);}beam([br.x-4,by-1.3,-22+side*1.5],[br.x+4,by-.45,-22+side*1.5],.12,wood);}
 // A rocky spring mouth closes the uphill stream, and ripples and reeds soften its banks.
 const sz=87,sx=streamAt(sz).x,sy=streamAt(sz).waterY;
 for(let i=0;i<14;i++){const a=i/14*Math.PI*2,x=sx+Math.cos(a)*2.4,z=sz+Math.sin(a)*2;if(z<86)continue;const q=mesh(new THREE.DodecahedronGeometry(.9+(i%3)*.18),rock,x,ground(x,z)+.15,z);q.scale.y=.72;}
 const pool=mesh(new THREE.CircleGeometry(2,24),new THREE.MeshStandardMaterial({color:'#709f9a',roughness:.6}),sx,sy+.08,86.7);pool.rotation.x=-Math.PI/2;
 for(let z=-103;z<87;z+=2.3){const q=streamAt(z);if(q.waterY<0)continue;const foam=box(q.x+.45*Math.sin(z),q.waterY+.045,z,.5,.012,.045,sand);foam.rotation.y=.2*Math.sin(z);for(const side of [-1,1]){const x=q.x+side*(2.7+.3*Math.sin(z));if(roadDistance(x,z)<.5)continue;for(let j=0;j<3;j++)beam([x,ground(x,z),z],[x+(j-1)*.15,ground(x,z)+.6+j*.09,z+.15],.026,reeds);}}
 // Torii joinery, hanging braided straw rope, paper streamers and individual approach paving.
 const straw=mat('#b9a16c'),paper=mat('#e4dec8');let prev=null;for(let i=0;i<=28;i++){const x=tx-3.3+i*6.6/28,y=ty+5.75-.6*Math.sin(i/28*Math.PI);const p=[x,y,tz-.36];if(prev)beam(prev,p,.07,straw);prev=p;if(i%7===0&&i>0&&i<28){for(let k=0;k<4;k++){const o=box(x+((k%2)*.12),y-.13-k*.16,tz-.36,.22,.24,.025,paper);o.rotation.z=k%2?.5:-.5;}}}
 for(const dx of [-3.3,3.3])for(const dy of [6.4,7.2])mesh(new THREE.SphereGeometry(.08,6,4),iron,tx+dx,ty+dy,tz-.43);
 for(let i=0;i<5;i++)for(let j=0;j<3;j++){const x=tx+(j-1)*.95,z=tz+1+i*.8;box(x,ground(x,z)+.1,z,.91,.18,.76,rock);}
 return g;
}
