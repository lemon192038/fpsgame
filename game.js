const $=id=>document.getElementById(id);
const R=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
R.setPixelRatio(Math.min(devicePixelRatio,2));R.setSize(innerWidth,innerHeight);
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.05;R.outputEncoding=THREE.sRGBEncoding;
document.body.prepend(R.domElement);
const S=new THREE.Scene();S.fog=new THREE.FogExp2(0xc9a98a,0.012);
const cam=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.05,300);cam.rotation.order='YXZ';S.add(cam);
addEventListener('resize',()=>{R.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()});
// sky
{const c=document.createElement('canvas');c.width=2;c.height=256;const g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);
gr.addColorStop(0,'#3f6fa8');gr.addColorStop(.55,'#d9b48f');gr.addColorStop(1,'#f0c9a0');g.fillStyle=gr;g.fillRect(0,0,2,256);
const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;
S.add(window.oldSky=new THREE.Mesh(new THREE.SphereGeometry(250,24,16),new THREE.MeshBasicMaterial({map:t,side:THREE.BackSide,fog:false})));}
S.add(new THREE.HemisphereLight(0xbcd4ff,0x7a6248,.85));
const sun=new THREE.DirectionalLight(0xffdcb0,2.4);sun.position.set(40,55,25);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-50,right:50,top:50,bottom:-50,near:1,far:150});sun.shadow.bias=-.0004;S.add(sun);
// procedural textures
function tex(base,fn,rep){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle=base;g.fillRect(0,0,256,256);
const d=g.getImageData(0,0,256,256);for(let i=0;i<d.data.length;i+=4){const n=(Math.random()-.5)*34;d.data[i]+=n;d.data[i+1]+=n;d.data[i+2]+=n}g.putImageData(d,0,0);fn&&fn(g);
const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep);t.anisotropy=8;t.encoding=THREE.sRGBEncoding;return t}
const groundT=tex('#8d8472',g=>{g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=2;g.strokeRect(0,0,256,256);for(let i=0;i<40;i++){g.fillStyle='rgba(60,50,40,'+Math.random()*.15+')';g.beginPath();g.arc(Math.random()*256,Math.random()*256,Math.random()*18,0,7);g.fill()}},40);
const brickT=tex('#9a5a43',g=>{g.strokeStyle='rgba(30,20,15,.7)';g.lineWidth=3;for(let y=0;y<256;y+=32){g.beginPath();g.moveTo(0,y);g.lineTo(256,y);g.stroke();for(let x=(y/32%2)*32;x<256;x+=64){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+32);g.stroke()}}},3);
const crateT=tex('#7a5a33',g=>{g.strokeStyle='#3b2a14';g.lineWidth=14;g.strokeRect(7,7,242,242);g.lineWidth=8;g.beginPath();g.moveTo(0,0);g.lineTo(256,256);g.stroke();for(let x=0;x<256;x+=43){g.lineWidth=2;g.beginPath();g.moveTo(x,0);g.lineTo(x,256);g.stroke()}},1);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({map:groundT,roughness:.95}));
ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;S.add(ground);
// level
const boxes=[],solid=[];let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
function box(x,z,w,h,d,mat,rep){const m=mat.clone();if(m.map){m.map=m.map.clone();m.map.needsUpdate=true;m.map.repeat.set(rep||Math.max(1,w/4),rep||Math.max(1,h/4))}
const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,h/2,z);o.castShadow=o.receiveShadow=true;S.add(o);solid.push(o);boxes.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2})}
const wallM=new THREE.MeshStandardMaterial({map:brickT,roughness:.9}),crateM=new THREE.MeshStandardMaterial({map:crateT,roughness:.8}),concM=new THREE.MeshStandardMaterial({map:groundT,roughness:1,color:0xbbbbbb});
const B=45;box(0,-B,2*B,6,1,wallM);box(0,B,2*B,6,1,wallM);box(-B,0,1,6,2*B,wallM);box(B,0,1,6,2*B,wallM);
for(let i=0;i<16;i++){const x=(rnd()-.5)*76,z=(rnd()-.5)*76;if(Math.hypot(x,z)<8)continue;const t=rnd();
 if(t<.4)box(x,z,3+rnd()*5,4+rnd()*3,3+rnd()*5,wallM);else if(t<.8)box(x,z,2,2,2,crateM,1);else box(x,z,6,1.6,1,concM)}
// weapon
const gun=new THREE.Group(),gm=new THREE.MeshStandardMaterial({color:0x22262b,metalness:.8,roughness:.35}),gm2=new THREE.MeshStandardMaterial({color:0x4a4f55,metalness:.9,roughness:.3});
const part=(g,m,x,y,z,w,h,d)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);gun.add(o);return o};
part(0,gm,0,0,0,.07,.1,.5);part(0,gm2,0,.015,-.38,.035,.035,.3);part(0,gm,0,-.1,.04,.05,.14,.07).rotation.x=.2;part(0,gm,0,.065,-.1,.06,.05,.2);part(0,gm2,0,-.06,.17,.0,0,0);
const stock=part(0,gm,0,-.02,.35,.05,.09,.25);
const mf=new THREE.Mesh(new THREE.PlaneGeometry(.3,.3),new THREE.MeshBasicMaterial({color:0xffc060,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));mf.position.set(0,.015,-.62);gun.add(mf);
const ml=new THREE.PointLight(0xffa040,0,12);ml.position.set(0,.02,-.7);gun.add(ml);
const hip=new THREE.Vector3(.22,-.2,-.45),adsP=new THREE.Vector3(0,-.13,-.4);gun.position.copy(hip);cam.add(gun);
// state
const P={pos:new THREE.Vector3(0,1.7,20),vy:0,yaw:0,pitch:0,hp:100,ammo:30,rel:0,cd:0,last:0,kills:0,wave:1,on:false,dead:false,recoil:0,ads:0,bob:0};
const joy={x:0,y:0},held={fire:false,ads:false};let enemies=[],tracers=[];
const ray=new THREE.Raycaster();
function push(p,r){for(const b of boxes){if(p.x>b.x0-r&&p.x<b.x1+r&&p.z>b.z0-r&&p.z<b.z1+r){const dx=Math.min(p.x-(b.x0-r),b.x1+r-p.x),dz=Math.min(p.z-(b.z0-r),b.z1+r-p.z);
 if(dx<dz)p.x+=(p.x-(b.x0+b.x1)/2>0?dx:-dx);else p.z+=(p.z-(b.z0+b.z1)/2>0?dz:-dz)}}}
// audio
let AC;function snd(f,d,v,type){if(!AC)return;const o=AC.createOscillator(),g=AC.createGain();o.type=type||'sawtooth';o.frequency.setValueAtTime(f,AC.currentTime);o.frequency.exponentialRampToValueAtTime(30,AC.currentTime+d);g.gain.setValueAtTime(v,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.connect(g).connect(AC.destination);o.start();o.stop(AC.currentTime+d)}
// enemies
const skin=new THREE.MeshStandardMaterial({color:0xc89a7a,roughness:.7});
function spawn(){const a=rnd()*6.28,e=new THREE.Group(),cl=new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(.25+rnd()*.05,.25,.22),roughness:.9});
 const body=new THREE.Mesh(new THREE.CylinderGeometry(.3,.26,1.1,10),cl),head=new THREE.Mesh(new THREE.SphereGeometry(.2,12,10),skin),helm=new THREE.Mesh(new THREE.SphereGeometry(.23,12,8,0,6.3,0,1.5),new THREE.MeshStandardMaterial({color:0x2c3326,roughness:.6}));
 body.position.y=.95;head.position.y=1.75;helm.position.y=1.78;const legs=new THREE.Mesh(new THREE.CylinderGeometry(.24,.2,.7,8),cl);legs.position.y=.35;
 [body,head,helm,legs].forEach(m=>{m.castShadow=true;m.userData.e=e;e.add(m)});
 e.position.set(Math.cos(a)*38,0,Math.sin(a)*38);e.userData={hp:100,cd:1+rnd()*2,off:rnd()*9,dead:0,flash:0,parts:[body,head,helm,legs]};S.add(e);enemies.push(e)}
function wave(){for(let i=0;i<2+P.wave*2;i++)spawn()}
function hurt(n){if(P.dead)return;P.hp-=n;P.last=performance.now();$('dmg').style.opacity=1;setTimeout(()=>$('dmg').style.opacity=0,120);snd(90,.2,.3,'square');
 if(P.hp<=0){P.dead=true;P.on=false;$('msg').style.display='flex';$('msg').innerHTML='<h1>DOWN</h1><p>'+P.kills+' kills · reached wave '+P.wave+'</p><p><b>Tap to redeploy</b></p>'}}
function reset(){enemies.forEach(e=>S.remove(e));enemies=[];Object.assign(P,{hp:100,ammo:30,kills:0,wave:1,dead:false,rel:0,vy:0});P.pos.set(0,1.7,20);wave()}
function shoot(){if(P.cd>0||P.rel>0)return;if(P.ammo<=0){reload();return}P.ammo--;P.cd=.085;P.recoil=1;
 snd(220,.12,.25);ml.intensity=40;mf.material.opacity=1;mf.rotation.z=Math.random()*6;
 const spread=P.ads>.5?.002:.012;ray.setFromCamera({x:(Math.random()-.5)*spread*2,y:(Math.random()-.5)*spread*2},cam);
 const targets=solid.concat(enemies.flatMap(e=>e.userData.parts)),h=ray.intersectObjects(targets,false)[0];
 const end=h?h.point:ray.ray.at(80,new THREE.Vector3());
 if(h&&h.object.userData.e){const e=h.object.userData.e,u=e.userData,hs=h.object.geometry.type=='SphereGeometry';const dm=(u.team===0&&!u.remote)?0:(hs?100:34);if(u.remote)Net.hit(u.remote,dm);else u.hp-=dm;u.flash=.1;if(dm>0)Dmg.pop(h.point,dm,hs);
  $('hit').style.opacity=1;$('hit').style.borderColor=hs?'#ff4040':'#fff';setTimeout(()=>$('hit').style.opacity=0,90);
  if(!u.remote&&u.hp<=0&&!u.dead)Bots.kill(e,1);}
 const o=new THREE.Vector3(.2,-.2,-.9).applyMatrix4(cam.matrixWorld);
 const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints([o,end]),new THREE.LineBasicMaterial({color:0xffe0a0,transparent:true,fog:false}));S.add(l);tracers.push({l,t:.06});
 if(h&&!h.object.userData.e){const s=new THREE.Mesh(new THREE.SphereGeometry(.05,6,6),new THREE.MeshBasicMaterial({color:0x222222}));s.position.copy(h.point);S.add(s);tracers.push({l:s,t:4})}
 if(P.ammo==0)reload()}
function reload(){if(P.rel<=0&&P.ammo<30){P.rel=1.6;snd(500,.15,.1,'square')}}
// touch input
const ptr={};const el=$('ui');
function bind(id,dn,up){const b=$(id);b.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();b.setPointerCapture(e.pointerId);b.classList.add('on');dn()});
 const u=e=>{b.classList.remove('on');up&&up()};b.addEventListener('pointerup',u);b.addEventListener('pointercancel',u)}
bind('fire',()=>held.fire=true,()=>held.fire=false);bind('ads',()=>held.ads=!held.ads);bind('rel',()=>reload());bind('jump',()=>{if(P.vy===0)P.vy=5.2});
const js=$('jz'),jv=$('joy');let jid=null,jc;
js.addEventListener('pointerdown',e=>{e.stopPropagation();jid=e.pointerId;js.setPointerCapture(jid);jc=[e.clientX,e.clientY];jv.style.left=(e.clientX-70)+'px';jv.style.top=(e.clientY-70)+'px';jv.style.bottom='auto';jv.classList.add('on');jm(e)});
function jm(e){let dx=(e.clientX-jc[0])/55,dy=(e.clientY-jc[1])/55;const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l}joy.x=dx;joy.y=dy;$('knob').style.transform=`translate(${dx*40}px,${dy*40}px)`}
js.addEventListener('pointermove',e=>{if(e.pointerId==jid)jm(e)});
const ju=e=>{if(e.pointerId==jid){jid=null;joy.x=joy.y=0;$('knob').style.transform='';jv.style.left=jv.style.top=jv.style.bottom='';jv.classList.remove('on')}};js.addEventListener('pointerup',ju);js.addEventListener('pointercancel',ju);
el.addEventListener('pointerdown',e=>{if(!P.on)return;if(e.clientX>innerWidth*.35)ptr[e.pointerId]=[e.clientX,e.clientY]});
el.addEventListener('pointermove',e=>{const p=ptr[e.pointerId];if(!p)return;const k=P.ads>.5?.0018:.0032;P.yaw-=(e.clientX-p[0])*k;P.pitch=Math.max(-1.4,Math.min(1.4,P.pitch-(e.clientY-p[1])*k));p[0]=e.clientX;p[1]=e.clientY});
const pe=e=>delete ptr[e.pointerId];el.addEventListener('pointerup',pe);el.addEventListener('pointercancel',pe);
$('msg').addEventListener('pointerdown',e=>{e.stopPropagation();if(P.on||(P.dead&&Net.on))return;AC=AC||new(window.AudioContext||window.webkitAudioContext)();Modes.again()});
document.addEventListener('gesturestart',e=>e.preventDefault());
// loop
let T=performance.now();const fwd=new THREE.Vector3(),rgt=new THREE.Vector3();
function tick(now){requestAnimationFrame(tick);const dt=Math.min((now-T)/1000,.05);T=now;
 if(P.on){P.cd-=dt;if(P.rel>0){P.rel-=dt;if(P.rel<=0)P.ammo=Wp.cur.mag}
  if(held.fire)shoot();
  P.ads+=((held.ads?1:0)-P.ads)*Math.min(1,dt*12);
  const sp=Mv.spd()*Math.hypot(joy.x,joy.y);const cy=Math.cos(P.yaw),sy=Math.sin(P.yaw);
  P.pos.x+=(-sy*-joy.y+cy*joy.x)*Mv.spd()*dt*-1*-1;P.pos.z+=(-cy*-joy.y-sy*joy.x)*Mv.spd()*dt*-1*-1;
  P.pos.x=Math.max(-B+1,Math.min(B-1,P.pos.x));P.pos.z=Math.max(-B+1,Math.min(B-1,P.pos.z));push(P.pos,.45);
  P.vy-=16*dt;P.pos.y+=P.vy*dt;{const gy=groundAt(P.pos)+1.7;if(P.pos.y<=gy){P.pos.y=gy;P.vy=0}}
  P.bob+=sp*dt*2;if(performance.now()-P.last>4500&&P.hp<100)P.hp=Math.min(100,P.hp+dt*25);
  Bots.update(dt,now);
 }
 P.recoil*=Math.pow(.0005,dt);ml.intensity*=.3;mf.material.opacity*=.3;
 cam.position.copy(P.pos);cam.position.y+=Math.sin(P.bob)*.03*(1-P.ads)-Mv.drop;
 cam.rotation.y=P.yaw;cam.rotation.x=P.pitch+P.recoil*.012;cam.fov+=((75-P.ads*Wp.cur.zm)-cam.fov)*Math.min(1,dt*12);cam.updateProjectionMatrix();
 gun.position.lerpVectors(hip,adsP,P.ads);gun.position.z+=P.recoil*.06+(P.rel>0?.05:0);gun.position.y+=Math.sin(P.bob*.5)*.006*(1-P.ads)-(P.rel>0?.12:0);gun.rotation.x=P.recoil*.05+(P.rel>0?-.5:0);
 Dmg.update(dt);World.update(dt);Wp.update();Mv.update(dt);
 for(let i=tracers.length-1;i>=0;i--){const t=tracers[i];t.t-=dt;if(t.l.material.opacity!==undefined&&t.l.isLine)t.l.material.opacity=Math.max(0,t.t*12);if(t.t<=0){S.remove(t.l);t.l.geometry.dispose();tracers.splice(i,1)}}
 $('score').textContent=Match.on?Match.txt():'WAVE '+P.wave+' · '+P.kills+' KILLS';$('hpf').style.width=Math.max(0,P.hp)+'%';$('hpf').style.background=P.hp<35?'#e05050':'#7bd88f';
 $('ammo').textContent=P.rel>0?'RELOADING':Wp.cur.melee?'∞':P.ammo+' / ∞';R.render(S,cam)}
requestAnimationFrame(tick);
