// Procedural world: 1,200 structure ids (16 archetypes x 75 variants), 120 maps (10 themes x 12), sky/clouds, damage numbers, keyboard/touch controls.
const NS=1200,NM=120;
const THEMES=[['Beach',0xe8d29a,.12,[12,13,14,15,2,8,19],1],['Desert',0xd9b57a,.2,[2,3,5,8,9,10,16],0],['Forest',0x7a9a5a,.3,[11,2,8,0,4],3],['Suburb',0x93ad74,.35,[0,2,2,4,7,11],0],['Downtown',0x85858a,.75,[0,1,0,1,6,7,3,8,18,16],0],['Industrial',0x8e8a84,.5,[3,5,9,10,0,8,2,16,17,16,19],3],['Snow',0xeaf1f7,.3,[2,4,8,11,0,5,17],4],['Ruins',0x94876c,.5,[8,9,10,0,2,11,18],5],['Harbor',0x8c9094,.45,[5,9,3,0,6,7,16,17,16,18],2],['Highrise',0x9c9ca2,.9,[0,1,0,1,6,0,18],2]];
// top, horizon, sun dir, sun colour, fog, fog density, sun intensity, cloud tint
const SKY=[[0x3f78c8,0xcfe0f0,[.5,.8,.3],0xfff1d6,0xbcd0e0,.008,2.6,0xffffff],[0x6a8fc8,0xf2c8a0,[.9,.25,.2],0xffc890,0xe6bfa0,.012,2,0xffe8d0],[0x3a5a96,0xf0a070,[-.8,.18,.4],0xff9a50,0xd8a080,.012,2.2,0xffb89a],[0x7d8896,0xb4bcc4,[.3,.6,.4],0xdfe4ea,0xaab2ba,.015,1.2,0xc8ccd2],[0x8e9aa6,0xc8ccd0,[.2,.4,.5],0xe8e8e8,0xc4c8cc,.03,1,0xd8dadc],[0x1c2a4a,0x7a6a8a,[-.6,.12,.3],0xffb070,0x5a5470,.014,1.4,0xb89aa8]];
const PAL=[0xb9a58a,0x9aa3ab,0xc2b8a6,0xa66f58,0x7e8a94,0xd4c9b0,0x8c7f72,0xb08a6a,0xa8b4a0,0xcfcfcf],CONT=[0xb5473a,0x3f6f9a,0xd0a23a,0x4f8a5a],UMB=[0xe84a3a,0x2f8fd0,0xf0c030,0x3fb06a],BALL=[0xe84a3a,0xf0c030,0x2f8fd0,0xffffff];
function rngS(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let N=0,NB=0;const D3=new THREE.Object3D(),CC=new THREE.Color();
function add(cx,y0,cz,w,h,d,c){if(w<.02||h<.02||d<.02||N>=7500)return;D3.position.set(cx,y0+h/2,cz);D3.scale.set(w,h,d);D3.updateMatrix();World.inst.setMatrixAt(N,D3.matrix);World.inst.setColorAt(N,CC.setHex(c));N++;
 boxes.push({x0:cx-w/2,x1:cx+w/2,z0:cz-d/2,z1:cz+d/2,y0,y1:y0+h})}
function ball(x,z,r,c){if(NB>=300)return;D3.position.set(x,r,z);D3.scale.setScalar(r);D3.updateMatrix();World.balls.setMatrixAt(NB,D3.matrix);World.balls.setColorAt(NB,CC.setHex(c));NB++}
function wall(ax,x,z,len,y0,h,c,op){const T=.35,n=Math.round(len/3);for(let i=0;i<n;i++){const px=ax=='x'?x+i*3:x,pz=ax=='x'?z:z+i*3,o=op[i];
 const sg=(o0,l,yy,hh)=>hh>0&&(ax=='x'?add(px+o0+l/2,yy,pz,l,hh,T,c):add(px,yy,pz+o0+l/2,T,hh,l,c));
 if(o=='w'){sg(0,.8,y0,h);sg(2.2,.8,y0,h);sg(.8,1.4,y0,1);sg(.8,1.4,y0+2.3,h-2.3)}else if(o=='d'){sg(0,.7,y0,h);sg(2.3,.7,y0,h);sg(.7,1.6,y0+2.4,h-2.4)}else sg(0,3,y0,h)}}
function slab(x0,x1,z0,z1,y,c,hx0,hx1,hz0,hz1){const q=(a,b,e,f)=>add((a+b)/2,y,(e+f)/2,b-a,.3,f-e,c);if(hx0===undefined)return q(x0,x1,z0,z1);q(x0,hx0,z0,z1);q(hx1,x1,z0,z1);q(hx0,hx1,z0,hz0);q(hx0,hx1,hz1,z1)}
function building(cx,cz,s){const w=s.w,d=s.d,fl=s.fl,fh=s.fh||3.2,c=s.c,r=s.r,x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2,h=fh-.3,nx=w/3,nz=d/3;
 for(let f=0;f<fl;f++){const y=f*fh,o=(n,dr)=>Array.from({length:n},(_,i)=>f==0&&dr&&i==(n>>1)?'d':r()<.7?'w':'s');
  wall('x',x0,z0,w,y,h,c,o(nx,cz>0));wall('x',x0,z1,w,y,h,c,o(nx,cz<=0));wall('z',x0,z0,d,y,h,c,o(nz));wall('z',x1,z0,d,y,h,c,o(nz));
  const L=(f+1)*fh-.3;
  if(s.ns){slab(x0,x1,z0,z1,L,c);continue}
  const k=f%2,hx0=k?x1-2.6:x0+.6,hz0=k?z1-4.8:z0;slab(x0,x1,z0,z1,L,c,hx0,hx0+2,hz0,hz0+4.8);
  for(let i=0;i<8;i++)add(hx0+1,y,k?z1-.3-.6*i:z0+.3+.6*i,2,(i+1)*fh/8,.6,0x777777)}
 if(!s.ns){const t=fl*fh,p=(a,b,e,f)=>add((a+b)/2,t,(e+f)/2,b-a,.9,f-e,c);p(x0,x1,z0,z0+.3);p(x0,x1,z1-.3,z1);p(x0,x0+.3,z0,z1);p(x1-.3,x1,z0,z1)}}
function spec(id){const a=id%20,v=(id/20)|0,r=rngS(id+1),s={a,v,c:PAL[(r()*PAL.length)|0],r,w:3,d:3,fl:1};
 switch(a){case 0:s.w=9+3*(v%3);s.d=9+3*(v%2);s.fl=3+v%4;break;case 1:s.w=s.d=9+3*(v%2);s.fl=6+v%3;break;case 2:s.w=6+3*(v%2);s.d=6+3*((v>>1)%2);s.fl=1+v%2;break;
 case 3:s.w=15;s.d=12;s.fh=6.3;s.ns=1;break;case 4:s.w=6+3*(v%2);s.d=6;break;case 5:s.n=1+v%3;s.m=1+((v/3)|0)%3;s.k=1+((v/9)|0)%3;s.w=s.n*2.6;s.d=s.m*6.2;break;
 case 6:s.w=12;s.d=9+3*(v%2);s.fl=2+v%3;break;case 7:s.w=v%3?2.2:2.6;s.d=v%3?4.6:11;break;case 8:{const l=6+v%7*2;s.h=1.2+v%4*.4;if(v%2){s.w=.4;s.d=l}else{s.w=l;s.d=.4}break}
 case 9:case 14:s.w=s.d=4;break;case 10:s.w=s.d=8;break;case 11:s.w=s.d=3;break;case 12:s.w=s.d=3.2;break;case 13:s.w=s.d=1.6;break;case 16:s.cols=2+v%3;s.rows=2+((v/3)|0)%3;s.w=s.cols*5.1;s.d=s.rows*8.4;break;case 17:s.w=8;s.d=6;break;case 18:s.w=22;s.d=4;break;case 19:s.w=s.d=4;break;case 15:s.w=3;s.d=7}
 return s}
function place(s,x,z){const{a,v,c}=s;
 if(a<5&&a!=5||a==6)return building(x,z,s);
 if(a==5){for(let i=0;i<s.n;i++)for(let j=0;j<s.m;j++)for(let k=0;k<s.k;k++)add(x-s.w/2+1.3+i*2.6,k*2.5,z-s.d/2+3.1+j*6.2,2.5,2.5,6,CONT[(v+i+j)%4]);return}
 if(a==7){add(x,.3,z,s.w,.8,s.d,c);add(x,1.1,z,s.w-.3,.7,v%3?s.d*.5:s.d-.4,c);return}
 if(a==8)return add(x,0,z,s.w,s.h,s.d,c);
 if(a==9){for(let i=0;i<3+v%4;i++){const lv=(i/3)|0;add(x-1.1+(i%3)*1.1,lv,z+(v%2?.5:-.5)*lv,1,1,1,0x8a6a3c)}return}
 if(a==10){[[-3,-3],[3,-3],[-3,3],[3,3]].forEach((p,i)=>add(x+p[0],0,z+p[1],.9,2+(v+i)%4,.9,c));add(x,0,z-3,5,1.2+v%3*.5,.5,c);add(x-3,0,z,.5,2+v%3,4,c);return}
 if(a==11){const t=3+v%3;add(x,0,z,.5,t,.5,0x6b4a2b);add(x,t-.5,z,2.6,1.6,2.6,0x3f7a3a);add(x,t+.9,z,1.7,1.4,1.7,0x4a8a42);return}
 if(a==12){add(x,0,z,.12,2.4,.12,0xdddddd);add(x,2.4,z,3,.12,3,UMB[v%4]);return}
 if(a==13)return ball(x,z,.5+v%4*.12,BALL[v%4]);
 if(a==14){add(x,0,z,3,1,3,0x8a8a85);add(x+.3,1,z,2,.9,2,0x8a8a85);add(x,1.9,z,1.1,.6,1.1,0x8a8a85);return}
 if(a==16){for(let i=0;i<s.cols;i++)for(let j=0;j<s.rows;j++){const st=1+(v+i+j*2)%3;for(let k=0;k<st;k++)add(x-s.w/2+1.3+i*5.1,k*2.5,z-s.d/2+3.2+j*8.4,2.5,2.5,6,CONT[(v+i+j)%4])}return}
 if(a==17){const ox=x-2.5;add(ox,0,z,2.5,2.5,6,CONT[v%4]);add(ox,2.5,z+1.5,2.5,2.5,3,CONT[(v+1)%4]);for(let i=0;i<6;i++)add(ox+1.55+.6*(5-i),0,z-1.5,.6,(i+1)*2.5/6,1.2,0x777777);return}
 if(a==18){add(x,2.8,z,14,.4,4,c);[-6.5,0,6.5].forEach(p=>add(x+p,0,z,1,2.8,1.2,0x6a6a6a));for(let i=0;i<8;i++){const h=(i+1)*.4,o=7.25+.5*(7-i);add(x-o,0,z,.5,h,2.5,0x777777);add(x+o,0,z,.5,h,2.5,0x777777)}return}
 if(a==19){[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(p=>add(x+p[0],0,z+p[1],.3,6,.3,0x6a6a6a));add(x,6,z,3.4,3,3.4,0x9aa4aa);return}
 [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(p=>add(x+p[0],0,z-1.5+p[1],.15,2.4,.15,0xcccccc));add(x,2.4,z-1.5,2.4,.2,2.4,0xeeeeee);add(x,5,z-1.5,2.8,.15,2.8,0xe84a3a);
 for(let i=0;i<6;i++)add(x,0,z-.1+.6*(5-i),1.4,(i+1)*.43,.6,0xcccccc)}
function cloudTex(){const c=document.createElement('canvas');c.width=256;c.height=128;const g=c.getContext('2d');for(let i=0;i<14;i++){const x=40+Math.random()*176,y=44+Math.random()*40,r=26+Math.random()*30,gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,7);g.fill()}return new THREE.CanvasTexture(c)}
const World={inst:null,wx:id=>{const v=(id/10)|0;return THEMES[id%10][0]=='Snow'?'snow':v%6==2?'rain':v%6==5?'storm':'clear'},name:id=>THEMES[id%10][0]+' '+['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'][(id/10)|0],
 init(){this.inst=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({map:tex('#cfcfcf',null,1),roughness:.88}),7500);
  Object.assign(this.inst,{castShadow:true,receiveShadow:true,frustumCulled:false});this.inst.setColorAt(0,new THREE.Color());S.add(this.inst);
  this.balls=new THREE.InstancedMesh(new THREE.SphereGeometry(1,14,10),new THREE.MeshStandardMaterial({roughness:.4}),300);this.balls.castShadow=true;this.balls.frustumCulled=false;this.balls.setColorAt(0,new THREE.Color());S.add(this.balls);
  oldSky.visible=false;this.su={top:{value:new THREE.Color()},hor:{value:new THREE.Color()},sd:{value:new THREE.Vector3(0,1,0)},sc:{value:new THREE.Color()},lin:{value:0}};
  const sk=new THREE.Mesh(new THREE.SphereGeometry(260,32,16),new THREE.ShaderMaterial({uniforms:this.su,side:THREE.BackSide,depthWrite:false,fog:false,
   vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
   fragmentShader:'uniform vec3 top,hor,sc,sd;uniform float lin;varying vec3 p;void main(){vec3 n=normalize(p);float h=clamp(n.y,0.,1.);vec3 c=mix(hor,top,pow(h,.5));float s=max(dot(n,normalize(sd)),0.);c+=sc*(pow(s,900.)*4.+pow(s,10.)*.3);gl_FragColor=vec4(lin>.5?pow(c,vec3(2.2)):c,1.);}'}));S.add(this.sk=sk);
  this.cm=[0,1,2].map(()=>new THREE.SpriteMaterial({map:cloudTex(),transparent:true,depthWrite:false,fog:false,opacity:.9}));this.clouds=[];
  for(let i=0;i<26;i++){const s=new THREE.Sprite(this.cm[i%3]),a=Math.random()*6.28,d=90+Math.random()*130;s.position.set(Math.cos(a)*d,55+Math.random()*50,Math.sin(a)*d);s.scale.set(90+Math.random()*60,35+Math.random()*20,1);s.userData.sp=1.5+Math.random()*2;S.add(s);this.clouds.push(s)}
  this.sea=new THREE.Mesh(new THREE.PlaneGeometry(19,90),new THREE.MeshStandardMaterial({color:0x2a7fb8,metalness:.3,roughness:.15,transparent:true,opacity:.92}));this.sea.rotation.x=-Math.PI/2;this.sea.position.set(35.5,.03,0);this.sea.receiveShadow=true;S.add(this.sea)},
 update(dt){Wx.update(dt);if(this.clouds)this.clouds.forEach(s=>{s.position.x+=dt*s.userData.sp;if(s.position.x>230)s.position.x=-230})},
 load(id){if(!this.inst)this.init();const th=THEMES[id%10],v=(id/10)|0,r=rngS(5000+id*131),wx=World.wx(id),pr=wx=='clear'?SKY[(th[4]+v)%6]:SKY[wx=='snow'?4:3],dens=th[2]*(.7+.6*(v*7%12)/11),sea=th[0]=='Beach'||th[0]=='Harbor';
  for(const o of solid)if(o!==this.inst)S.remove(o);solid.length=0;solid.push(this.inst);boxes.length=0;N=0;NB=0;
  const u=this.su;u.top.value.setHex(pr[0]);u.hor.value.setHex(pr[1]);u.sd.value.set(...pr[2]).normalize();u.sc.value.setHex(pr[3]);
  sun.position.copy(u.sd.value).multiplyScalar(80);sun.color.setHex(pr[3]);sun.intensity=pr[6];S.fog.color.setHex(pr[4]);S.fog.density=pr[5];Wx.set(wx);this.sunI=pr[6];
  const hm=S.children.find(o=>o.isHemisphereLight);hm.color.setHex(pr[0]);hm.groundColor.setHex(th[1]);hm.intensity=.55+pr[6]*.12;
  ground.material.color.setHex(th[1]).multiplyScalar(1.7);this.cm.forEach(m=>m.color.setHex(pr[7]));this.sea.visible=sea;
  add(0,0,-45,90,4,1,th[1]);add(0,0,45,90,4,1,th[1]);add(-45,0,0,1,4,90,th[1]);add(45,0,0,1,4,90,th[1]);
  const placed=[],target=Math.round(10+dens*70);let tries=0;
  while(placed.length<target&&tries++<700&&N<6800){const a=th[3][(r()*th[3].length)|0],s=spec(a+20*((r()*60)|0)),x=(r()-.5)*84,z=(r()-.5)*84,m=a>10?1:2.5;
   if(Math.abs(x)+s.w/2>43||Math.abs(z)+s.d/2>43||sea&&x+s.w/2>24)continue;
   if(Math.abs(z)+s.d/2>28&&Math.abs(x)-s.w/2<22||Math.hypot(x,z-20)<s.w/2+7)continue;
   if(placed.some(p=>Math.abs(p.x-x)<(p.w+s.w)/2+m&&Math.abs(p.z-z)<(p.d+s.d)/2+m))continue;
   placed.push({x,z,w:s.w,d:s.d});place(s,x,z)}
  if(th[0]=='Beach')for(let i=0;i<10+v*2;i++)ball((r()-.5)*70,(r()-.5)*70<0?(r()*-40):r()*20,.45+r()*.3,BALL[i%4]);
  this.inst.count=N;this.inst.instanceMatrix.needsUpdate=true;this.inst.instanceColor.needsUpdate=true;this.balls.count=NB;this.balls.instanceMatrix.needsUpdate=true;this.balls.instanceColor.needsUpdate=true;if(typeof Gfx!='undefined')Gfx.afterLoad()}};
push=function(p,r){const feet=p===P.pos?p.y-1.7:p.y,head=feet+1.8;for(const b of boxes){if(feet>=b.y1-.5||head<=b.y0)continue;
 if(p.x>b.x0-r&&p.x<b.x1+r&&p.z>b.z0-r&&p.z<b.z1+r){const dx=Math.min(p.x-(b.x0-r),b.x1+r-p.x),dz=Math.min(p.z-(b.z0-r),b.z1+r-p.z);if(dx<dz)p.x+=(p.x-(b.x0+b.x1)/2>0?dx:-dx);else p.z+=(p.z-(b.z0+b.z1)/2>0?dz:-dz)}}};
function groundAt(p){const f=p.y-1.7;let g=0;for(const b of boxes)if(b.y1<=f+.5&&b.y1>g&&p.x>b.x0-.2&&p.x<b.x1+.2&&p.z>b.z0-.2&&p.z<b.z1+.2)g=b.y1;return g}
const Dmg={a:[],pop(pt,n,hs){const c=document.createElement('canvas');c.width=128;c.height=64;const g=c.getContext('2d');g.font='bold '+(hs?50:40)+'px sans-serif';g.textAlign='center';g.lineWidth=7;g.strokeStyle='#000';g.fillStyle=hs?'#ffd23c':'#fff';g.strokeText(n,64,46);g.fillText(n,64,46);
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,fog:false,transparent:true})),k=Math.max(1,cam.position.distanceTo(pt)/7);s.position.copy(pt);s.position.y+=.3;s.scale.set((hs?1.3:1)*k,(hs?.65:.5)*k,1);s.renderOrder=9;S.add(s);this.a.push({s,t:.9,vx:(Math.random()-.5)*1.2})},
 update(dt){for(let i=this.a.length-1;i>=0;i--){const d=this.a[i];d.t-=dt;d.s.position.y+=dt*1.6;d.s.position.x+=d.vx*dt;d.s.material.opacity=Math.min(1,d.t*3);if(d.t<=0){S.remove(d.s);d.s.material.map.dispose();d.s.material.dispose();this.a.splice(i,1)}}},
 taken(n){const e=$('dmgin');e.textContent='-'+Math.round(n);e.style.opacity=1;clearTimeout(this.tt);this.tt=setTimeout(()=>e.style.opacity=0,700)}};
const _h2=hurt;hurt=function(n,by){_h2(n,by);Dmg.taken(n)};
const Ctl={mode:localStorage.ctl||'touch',keys:{},set(m){this.mode=m;localStorage.ctl=m;document.body.classList.toggle('kb',m=='kb');ui()},
 lock(){if(this.mode=='kb'&&!document.pointerLockElement&&document.body.requestPointerLock)document.body.requestPointerLock()},
 upd(){const k=this.keys,x=(k.KeyD?1:0)-(k.KeyA?1:0),y=(k.KeyS?1:0)-(k.KeyW?1:0),l=Math.hypot(x,y)||1;joy.x=x/l;joy.y=y/l}};
addEventListener('keydown',e=>{if(Ctl.mode!='kb'||!P.on)return;Ctl.keys[e.code]=1;Ctl.upd();if(e.code=='Space'){e.preventDefault();if(P.vy===0)P.vy=5.2}if(e.code=='KeyR')reload()});
addEventListener('keyup',e=>{Ctl.keys[e.code]=0;if(Ctl.mode=='kb')Ctl.upd()});
addEventListener('mousedown',e=>{if(Ctl.mode!='kb'||!P.on)return;Ctl.lock();if(e.button==0)held.fire=true;if(e.button==2)held.ads=true});
addEventListener('mouseup',e=>{if(Ctl.mode!='kb')return;if(e.button==0)held.fire=false;if(e.button==2)held.ads=false});
addEventListener('mousemove',e=>{if(Ctl.mode!='kb'||!document.pointerLockElement||!P.on)return;const k=P.ads>.5?.0014:.0022;P.yaw-=e.movementX*k;P.pitch=Math.max(-1.4,Math.min(1.4,P.pitch-e.movementY*k))});
addEventListener('contextmenu',e=>{if(Ctl.mode=='kb')e.preventDefault()});
document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement&&Ctl.mode=='kb'&&P.on)Modes.menu()});
const _mn=Modes.menu.bind(Modes);Modes.menu=function(){held.fire=held.ads=false;Ctl.keys={};joy.x=joy.y=0;if(document.pointerLockElement)document.exitPointerLock();_mn()};
const _go=go;go=function(c){_go(c);Ctl.lock()};
Modes.map=0;const _ui=ui;
ui=function(){_ui();$('mapr').innerHTML='<div class="opt" id="mp">◀</div><div class="opt" style="min-width:230px;justify-content:center">'+({clear:'☀',rain:'🌧',storm:'⛈',snow:'❄'})[World.wx(Modes.map)]+' '+World.name(Modes.map)+' · '+(Modes.map+1)+'/'+NM+'</div><div class="opt" id="mn">▶</div><div class="opt" id="mr">RANDOM</div>';
 $('mp').onclick=()=>{Modes.map=(Modes.map+NM-1)%NM;ui()};$('mn').onclick=()=>{Modes.map=(Modes.map+1)%NM;ui()};$('mr').onclick=()=>{Modes.map=Math.random()*NM|0;ui()};
 $('ctlr').innerHTML='<span>CONTROLS</span><div class="opt '+(Ctl.mode=='touch'?'sel':'')+'" data-c="touch">TOUCH</div><div class="opt '+(Ctl.mode=='kb'?'sel':'')+'" data-c="kb">KEYBOARD + MOUSE</div><span>'+NS+' structure types</span>';
 $('ctlr').querySelectorAll('.opt').forEach(o=>o.onclick=()=>Ctl.set(o.dataset.c))};
