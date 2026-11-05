// Weapons (110 models), movement (crouch/slide/sprint), weather, matchmaking.
window.W2=10;const WCODE=['Vanguard','Raptor','Falcon','Specter','Havoc','Titan','Viper','Banshee','Cobra','Reaper','Phantom','Ranger','Tempest','Warden','Ember','Frost','Onyx','Talon','Ironclad','Nova','Saber','Valkyrie','Hydra','Mirage','Bulwark','Cinder','Drake','Echo','Fury','Gale','Harrier','Jackal','Kestrel','Lancer','Maverick','Nomad','Orion','Pike','Quasar','Rogue'];
// code,name,slot,count,dmg,rpm,mag,reload,spread,zoom,moveSpeed,mode,pellets,headMult,range,recoil,length
const FAMS=[['AR','Assault Rifle','P',14,[10,14],[560,820],[18,24],[1.9,2.4],[.008,.014],26,.95,'auto',1,2,50,1,.62],['SM','SMG','P',12,[7,10],[760,1100],[20,30],[1.5,2],[.012,.02],22,1.05,'auto',1,1.8,30,.6,.45],
['LM','LMG','P',8,[11,14],[540,760],[40,60],[3.8,5],[.014,.022],20,.85,'auto',1,1.9,55,1.1,.8],['DM','DMR','P',8,[20,26],[200,320],[6,10],[2,2.6],[.003,.006],38,.92,'semi',1,2.1,80,1.6,.75],
['SN','Sniper Rifle','P',10,[50,58],[40,70],[2,4],[2.6,3.4],[.001,.003],55,.85,'semi',1,2,120,3,.95],['SG','Shotgun','P',10,[4,5],[60,160],[4,6],[2.8,4],[.05,.07],14,.95,'semi',9,1.4,16,2,.6],
['CB','Carbine','P',8,[9,12],[640,860],[16,22],[1.6,2],[.01,.016],24,1,'auto',1,2,40,.8,.5],['BR','Burst Rifle','P',8,[14,18],[420,520],[15,24],[1.8,2.2],[.006,.01],28,.97,'burst',1,2,60,.9,.6],
['PS','Pistol','S',12,[10,14],[300,520],[7,12],[1.2,1.6],[.01,.016],12,1.1,'semi',1,2,25,.7,.22],['RV','Revolver','S',8,[23,34],[100,170],[3,6],[2,2.8],[.004,.008],16,1.05,'semi',1,2.2,40,1.6,.28],
['MP','Machine Pistol','S',7,[6,8],[800,1100],[12,20],[1.3,1.7],[.018,.028],10,1.1,'auto',1,1.7,18,.6,.24],['AP','Auto Pistol','S',5,[8,10],[500,700],[10,16],[1.2,1.5],[.012,.02],12,1.1,'auto',1,1.8,22,.6,.24]];
const WP=[];FAMS.forEach(f=>{for(let i=0;i<f[3];i++){const r=rngS(WP.length*977+13),L=a=>a[0]+(a[1]-a[0])*r();
 WP.push({code:f[0],fam:f[1],slot:f[2],name:f[0]+'-'+(3+(i*11+WP.length)%97)+' '+WCODE[(WP.length*7+i)%40],dmg:Math.round(L(f[4])),rpm:Math.round(L(f[5])),mag:Math.round(L(f[6])),rl:+L(f[7]).toFixed(1),sp:L(f[8]),zm:f[9],ms:f[10],mode:f[11],pel:f[12],hs:f[13],rng:f[14],rc:f[15],len:f[16]*(.9+r()*.25),col:[0x22262b,0x2c3326,0x3a3a40,0x4a3b2a,0x20303c,0x2a2a2a][(r()*6)|0]})}});
[['Combat Knife','K',23,150,1.15,0x9aa0a6],['Tactical Knife','K',26,130,1.15,0x2a2a2a],['Tanto','K',28,120,1.1,0x8a9096],['Kukri','K',32,100,1.1,0x7a6a50],['Brass Knuckles','B',19,220,1.12,0xc9a23a],['Spiked Knuckles','B',23,190,1.1,0x777777]].forEach(m=>WP.push({code:m[1],fam:'Melee',slot:'S',melee:1,name:m[0],dmg:m[2],rpm:m[3],mag:9999,rl:0,sp:0,zm:8,ms:m[4],mode:'auto',pel:1,hs:1.5,rng:2.4,rc:0,len:.4,col:m[5]}));
function dealHit(e,h,dm,hs){const u=e.userData;if(dm>0){if(u.remote)Net.hit(u.remote,dm);else u.hp-=dm;u.flash=.1;Dmg.pop(h.point,dm,hs);$('hit').style.opacity=1;$('hit').style.borderColor=hs?'#ff4040':'#fff';setTimeout(()=>$('hit').style.opacity=0,90)}if(!u.remote&&u.hp<=0&&!u.dead)Bots.kill(e,1)}
function melee(w){snd(180,.1,.2,'triangle');ray.setFromCamera({x:0,y:0},cam);ray.far=w.rng;const h=ray.intersectObjects(solid.concat(enemies.flatMap(e=>e.userData.parts)),false)[0];ray.far=Infinity;
 if(h&&h.object.userData.e){const e=h.object.userData.e,u=e.userData,f=new THREE.Vector3();cam.getWorldDirection(f);const bs=Math.sin(e.rotation.y)*f.x+Math.cos(e.rotation.y)*f.z>.4,hs=h.object.geometry.type=='SphereGeometry';
  dealHit(e,h,(u.team===0&&!u.remote||u.ally)?0:Math.round(w.dmg*(bs?6:hs?w.hs:1)),hs||bs)}}
function buildGun(w,G){G=G||gun;for(let i=G.children.length-1;i>=0;i--){const o=G.children[i];if(o!==mf&&o!==ml){G.remove(o);o.geometry.dispose()}}
 const c=new THREE.MeshStandardMaterial({color:w.col,metalness:.8,roughness:.35}),L=w.len,p=(x,y,z,a,b,d,m)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(a,b,d),m||c);o.position.set(x,y,z);G.add(o);return o};
 if(w.melee){p(0,-.06,.2,.08,.08,.34,gm);if(w.code=='K'){p(0,-.02,.05,.045,.07,.2,gm);p(0,0,-.05,.09,.03,.03,gm2);p(0,0,-.3,.025,.07,.42,c);p(0,0,-.54,.015,.04,.08,c)}
  else{p(0,0,-.03,.17,.06,.08,c);for(let i=0;i<4;i++){p(-.06+i*.04,.035,-.08,.03,.04,.04,c);if(w.name[0]=='S')p(-.06+i*.04,.07,-.08,.012,.04,.012,gm2)}}
  if(G===gun){hip.set(.24,-.22,-.5);adsP.set(.12,-.2,-.5);mf.position.z=3;ml.position.z=3}return}
 p(0,0,0,.07,.1,L*.6);p(0,.015,-L*.55,.035,.035,L*.5,gm2);p(0,-.1,.04,.05,.14,.07).rotation.x=.2;
 if(w.code=='SN'||w.code=='DM')p(0,.09,-.05,.04,.05,.28,gm2);if(w.code=='LM')p(0,-.12,-.05,.12,.12,.12);if(w.code=='SG')p(0,-.03,-L*.4,.05,.05,L*.5,gm2);if(w.slot=='P')p(0,-.02,L*.35,.05,.09,.25);
 if(G===gun){mf.position.z=-L*.8-.1;ml.position.z=mf.position.z-.1;hip.set(w.slot=='P'?.22:.18,-.2,-.45);adsP.set(0,-.13,-.4)}}
const Wp={sw:0,lt:0,cur:WP[0],idx:0,slots:[],lock:false,b:0,list:s=>WP.filter(w=>w.slot==s),
 sel(s){const l=this.list(s);return l[(+localStorage['w'+s]||0)%l.length]},
 pick(s,d){const l=this.list(s);localStorage['w'+s]=(((+localStorage['w'+s]||0)+d)%l.length+l.length)%l.length;ui()},
 rnd(){['P','S'].forEach(s=>localStorage['w'+s]=Math.random()*this.list(s).length|0);ui()},
 reset(){const a=this.sel('P'),b=this.sel('S');this.slots=[{w:a,ammo:a.mag},{w:b,ammo:b.mag}];this.idx=0;this.cur=a;buildGun(a);P.rel=0;Mv.crouch=false;Mv.sl=0},
 swap(){if(!P.on||this.b)return;this.slots[this.idx].ammo=P.ammo;this.idx^=1;const s=this.slots[this.idx];this.cur=s.w;P.ammo=s.ammo;P.rel=0;P.cd=.35;this.lock=false;buildGun(s.w)},
 update(){Ab.sync();Spec.update();const n=performance.now(),dt=Math.min(.05,(n-this.lt)/1000);this.lt=n;this.sw=Math.max(0,this.sw-dt*5);if(this.sw>0){const k=Math.sin(this.sw*Math.PI);gun.position.z-=.3*k;gun.position.x-=.12*k;gun.rotation.x-=.9*k}if(!held.fire)this.lock=false;$('wname').textContent='['+(this.idx+1)+'] '+this.cur.name}};
function fire1(){const w=Wp.cur;let sp=(P.ads>.5?.15:1)*w.sp*(Mv.crouch?.7:1)*(Mv.sl>0?1.5:1);if(w.code=='SN'){if(Math.hypot(joy.x,joy.y)>.3||Mv.sl>0||P.vy!==0)sp=Math.max(sp,.45);else if(P.ads<.85)sp=Math.max(sp,.09)}
 for(let k=0;k<w.pel;k++){ray.setFromCamera({x:(Math.random()-.5)*sp*2,y:(Math.random()-.5)*sp*2},cam);
  const h=ray.intersectObjects(solid.concat(enemies.flatMap(e=>e.userData.parts)),false)[0],end=h?h.point:ray.ray.at(80,new THREE.Vector3());
  if(h&&h.object.userData.e){const e=h.object.userData.e,u=e.userData,hs=h.object.geometry.type=='SphereGeometry',fall=Math.max(.4,1-Math.max(0,h.distance-w.rng)/80),dm=(u.team===0&&!u.remote||u.ally)?0:Math.round(w.dmg*(hs?w.hs:1)*fall);
   if(dm>0){if(u.remote)Net.hit(u.remote,dm);else u.hp-=dm;u.flash=.1;Dmg.pop(h.point,dm,hs);$('hit').style.opacity=1;$('hit').style.borderColor=hs?'#ff4040':'#fff';setTimeout(()=>$('hit').style.opacity=0,90)}
   if(!u.remote&&u.hp<=0&&!u.dead)Bots.kill(e,1)}
  const o=new THREE.Vector3(.2,-.2,-.9).applyMatrix4(cam.matrixWorld),l=new THREE.Line(new THREE.BufferGeometry().setFromPoints([o,end]),new THREE.LineBasicMaterial({color:0xffe0a0,transparent:true,fog:false}));S.add(l);tracers.push({l,t:.06});
  if(w.pel==1&&h&&!h.object.userData.e){const s=new THREE.Mesh(new THREE.SphereGeometry(.05,6,6),new THREE.MeshBasicMaterial({color:0x222222}));s.position.copy(h.point);S.add(s);tracers.push({l:s,t:4})}}
 snd(w.slot=='S'?260:w.code=='SN'?120:w.code=='SG'?150:220,.12,.25);ml.intensity=40;mf.material.opacity=1;mf.rotation.z=Math.random()*6;P.recoil=w.rc}
shoot=function(){if(P.dead)return;const w=Wp.cur;if(P.cd>0||P.rel>0||Wp.b||(w.mode!='auto'&&Wp.lock))return;if(w.melee){P.cd=60/w.rpm;Wp.sw=1;melee(w);return}if(P.ammo<=0){reload();return}
 Wp.lock=true;P.cd=60/w.rpm;
 if(w.mode=='burst'){Wp.b=1;P.cd=.34;for(let i=0;i<3;i++)setTimeout(()=>{if(P.ammo>0&&P.on&&P.rel<=0){P.ammo--;fire1()}if(i==2)Wp.b=0},i*70)}else{P.ammo--;fire1();if(P.ammo==0)reload()}};
reload=function(){if(P.rel<=0&&P.ammo<Wp.cur.mag){P.rel=Wp.cur.rl;snd(500,.15,.1,'square')}};
const Mv={crouch:false,sl:0,sx:0,sz:0,drop:0,sprint:false,ks:false,
 spd(){const s=Math.hypot(joy.x,joy.y);this.sprint=s>.92&&!this.crouch&&P.ads<.3&&(Ctl.mode!='kb'||this.ks);return this.sl>0||P.dead?0:5.2*Wp.cur.ms*(this.crouch?.5:this.sprint?1.35:1)-P.ads*2.2},
 toggle(){if(this.crouch){this.crouch=false;this.sl=0;return}
  if(this.sprint&&this.sl<=0&&P.vy===0){const cy=Math.cos(P.yaw),sy=Math.sin(P.yaw);this.sx=sy*joy.y+cy*joy.x;this.sz=cy*joy.y-sy*joy.x;this.sl=.85}this.crouch=true},
 update(dt){this.drop+=((this.sl>0?.85:this.crouch?.6:0)-this.drop)*Math.min(1,dt*12);
  if(this.sl>0&&P.on){this.sl-=dt;const k=Math.max(0,this.sl/.85),l=Math.hypot(this.sx,this.sz)||1,v=(2.5+7*k)*dt;P.pos.x+=this.sx/l*v;P.pos.z+=this.sz/l*v;push(P.pos,.45);P.pos.x=Math.max(-B+1,Math.min(B-1,P.pos.x));P.pos.z=Math.max(-B+1,Math.min(B-1,P.pos.z))}}};
bind('crc',()=>Mv.toggle());bind('swp',()=>Wp.swap());
addEventListener('keydown',e=>{if(Ctl.mode!='kb'||!P.on)return;if(e.code=='KeyC'||e.code=='ControlLeft')Mv.toggle();if((e.code=='Digit1'||e.code=='Digit2')&&+e.code[5]-1!=Wp.idx)Wp.swap();if(e.code=='KeyQ')Wp.swap();if(e.code=='ShiftLeft')Mv.ks=true});
addEventListener('keyup',e=>{if(e.code=='ShiftLeft')Mv.ks=false});
const Wx={t:'clear',fl:0,tm:0,n:1800,
 init(){const n=this.n,mk=()=>{const a=new Float32Array(n*3);for(let i=0;i<n*3;i++)a[i]=Math.random()*40;return a};this.rd=mk();this.sd=mk();this.rp=new Float32Array(n*6);this.sp=new Float32Array(n*3);
  const bg=a=>new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(a,3));
  this.rain=new THREE.LineSegments(bg(this.rp),new THREE.LineBasicMaterial({color:0xaabbcc,transparent:true,opacity:.45,fog:false}));this.snow=new THREE.Points(bg(this.sp),new THREE.PointsMaterial({color:0xffffff,size:.12,transparent:true,opacity:.9,fog:false}));
  [this.rain,this.snow].forEach(o=>{o.frustumCulled=false;S.add(o)})},
 set(t){this.t=t;if(!this.rain)this.init();this.rain.visible=t=='rain'||t=='storm';this.snow.visible=t=='snow'},
 update(dt){if(!this.rain)return;const c=cam.position,n=this.n,w=v=>((v%40)+40)%40;this.tm+=dt;
  if(this.rain.visible){for(let i=0;i<n;i++){const j=i*3,k=i*6;this.rd[j+1]-=dt*28;const x=c.x-20+w(this.rd[j]-c.x+20),y=c.y-20+w(this.rd[j+1]-c.y+20),z=c.z-20+w(this.rd[j+2]-c.z+20);this.rp[k]=x;this.rp[k+1]=y;this.rp[k+2]=z;this.rp[k+3]=x+.04;this.rp[k+4]=y+.7;this.rp[k+5]=z}this.rain.geometry.attributes.position.needsUpdate=true}
  if(this.snow.visible){for(let i=0;i<n;i++){const j=i*3;this.sd[j+1]-=dt*2.5;this.sd[j]+=Math.sin(this.tm+i)*dt*.6;this.sp[j]=c.x-20+w(this.sd[j]-c.x+20);this.sp[j+1]=c.y-20+w(this.sd[j+1]-c.y+20);this.sp[j+2]=c.z-20+w(this.sd[j+2]-c.z+20)}this.snow.geometry.attributes.position.needsUpdate=true}
  if(this.t=='storm'){if(Math.random()<dt*.12)this.fl=.3;if(this.fl>0){this.fl-=dt;sun.intensity=World.sunI+(this.fl>0?7*Math.random():0)}}}};
const Match={on:false,over:false,mode:'',need:0,list:[],sc:{},rn:1,dead:{},rb:0,t5(){return this.mode=='5v5'||this.mode=='ko5'},ko(){return this.on&&this.mode[0]=='k'},idx(id){return this.list.findIndex(p=>p.id==id)},
 teamOf(id){const i=this.idx(id);return this.t5()?i%2:i},ally(id){return this.on&&this.t5()&&id!=Auth.id&&this.teamOf(id)==this.teamOf(Auth.id)},
 hue(id,n){if(!this.on)return 1+n%4;return this.ally(id)?0:this.t5()?1:1+this.idx(id)%4},key(id){return this.t5()?this.teamOf(id):id},goal(){return{'1v1':10,'5v5':30,ffa:15}[this.mode]},
 kill(by,vic){if(this.ko()&&!this.over){this.dead[vic]=1;this.check();return}if(!this.on||this.over||this.idx(by)<0)return;const k=this.key(by);this.sc[k]=(this.sc[k]||0)+1;if(this.sc[k]>=this.goal())this.end(k)},
 end(k){this.over=true;P.on=false;P.dead=false;$('msg').style.display='flex';$('msg').innerHTML='<h1>'+(this.key(Auth.id)==k?'VICTORY':'DEFEAT')+'</h1><p>Tap to return to menu</p>'},
 txt(){const m=this.key(Auth.id);if(this.ko())return'KNOCKOUT · ROUND '+this.rn+'/3 · '+(this.sc[m]||0)+' - '+Math.max(0,...Object.keys(this.sc).filter(k=>k!=String(m)).map(k=>this.sc[k]));return this.t5()?'YOU '+(this.sc[m]||0)+' - '+(this.sc[1-m]||0)+' ENEMY / '+this.goal():'KILLS '+(this.sc[Auth.id]||0)+' / '+this.goal()}};
const MM={on:false,ch:null,need:{'1v1':2,'5v5':10,ffa:5,ko1:2,ko5:10},
 find(mode){if(!Auth.user)return;const need=this.need[mode];$('menu').style.display='none';$('msg').style.display='flex';this.on=true;
  if(!need){$('msg').innerHTML='<h1>CPU ONLY</h1><p>WAVE is single-player. Pick 1v1, 5v5 or 1v1v1v1v1.</p><p><b>Tap to go back</b></p>';return}
  const txt=n=>$('msg').innerHTML='<h1>SEARCHING…</h1><p>'+mode.toUpperCase()+' · '+n+' / '+need+' players · random map</p><p><b>Tap to cancel</b></p>';txt(1);
  const ch=this.ch=Auth.sb.channel('mm:'+mode,{config:{presence:{key:Auth.id}}});
  ch.on('presence',{event:'sync'},()=>{const l=Object.values(ch.presenceState()).flat().sort((a,b)=>a.t-b.t||(a.id<b.id?-1:1));if(!this.on)return;txt(Math.min(l.length,need));const top=l.slice(0,need);
   if(l.length>=need&&top.some(p=>p.id==Auth.id)){this.on=false;setTimeout(()=>this.leave(),3500);Object.assign(Match,{list:top,mode,need,sc:{},on:true,over:false,rn:1,dead:{},rb:0});$('msg').style.display='none';Net.join('m'+top[0].id.slice(0,6)+top[0].t)}})
  .subscribe(s=>{if(s==='SUBSCRIBED')ch.track({id:Auth.id,name:Auth.name,t:Date.now()})})},
 leave(){if(this.ch){this.ch.unsubscribe();this.ch=null}}};
const _mn2=Modes.menu;Modes.menu=function(){Match.on=Match.over=false;MM.on=false;MM.leave();_mn2.call(Modes)};
const _ag=Modes.again.bind(Modes);Modes.again=function(){if(MM.on){MM.on=false;MM.leave();Modes.menu();return}if(Match.over){Modes.menu();return}_ag()};
const _ui2=ui;ui=function(){_ui2();
 $('wrow').innerHTML=['P','S'].map(s=>{const w=Wp.sel(s);return'<div class="opt" data-s="'+s+'" data-d="-1">◀</div><div class="opt" style="min-width:300px;justify-content:center">'+(s=='P'?'PRIMARY ':'SECONDARY ')+w.name+' · '+w.dmg+(w.pel>1?'x'+w.pel:'')+'dmg '+w.rpm+'rpm</div><div class="opt" data-s="'+s+'" data-d="1">▶</div>'}).join('')+'<div class="opt" id="wr">RANDOM LOADOUT</div>';
 $('wrow').querySelectorAll('[data-d]').forEach(o=>o.onclick=()=>Wp.pick(o.dataset.s,+o.dataset.d));$('wr').onclick=()=>Wp.rnd();$('pqm').classList.toggle('off',!Auth.user)};
$('pqm').onclick=()=>MM.find(Modes.mode);
const Ab={w:null,last:-1,svg:{b:`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 16'><path d='M14 6L18 3H38V13H18L14 10Z' fill='#d9b44a'/><rect x='18' y='4.5' width='20' height='1.6' fill='#fff' opacity='.35'/><rect x='38' y='1.5' width='2' height='13' rx='.6' fill='#e6c968'/><path d='M1 8Q3 4.6 9 4.8L14 5.4V10.6L9 11.2Q3 11.4 1 8Z' fill='#c46a3a'/><path d='M.4 8Q.9 6 2.6 5.6V10.4Q.9 10 .4 8Z' fill='#1a1a1a'/></svg>`,
 s:`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 16'><rect x='0' y='2' width='28' height='12' rx='2' fill='#c0392b'/><rect x='28' y='1' width='12' height='14' rx='1' fill='#d9b44a'/><rect x='0' y='4' width='28' height='1.6' fill='#fff' opacity='.3'/></svg>`},
 build(w){const el=$('abar');el.innerHTML='';this.w=w;this.last=-1;if(w.melee)return;const m=w.mag,wd=w.code=='SN'?44:w.code=='SG'?34:m<=10?30:m<=20?22:m<=40?16:13,u='url("data:image/svg+xml,'+encodeURIComponent(this.svg[w.code=='SG'?'s':'b'])+'")';
  for(let i=0;i<m;i++){const e=document.createElement('i');e.style.cssText='width:'+wd+'px;height:'+wd*.4+'px;background-image:'+u;el.appendChild(e)}},
 sync(){const w=Wp.cur;if(this.w!==w)this.build(w);if(w.melee||P.ammo===this.last)return;this.last=P.ammo;const k=$('abar').children;for(let i=0;i<k.length;i++)k[i].classList.toggle('u',i>=P.ammo)}};
['gesturestart','gesturechange','gestureend'].forEach(t=>document.addEventListener(t,e=>e.preventDefault()));
document.addEventListener('touchmove',e=>{if(e.touches.length>1||!e.target.closest('#menu'))e.preventDefault()},{passive:false});addEventListener('scroll',()=>scrollTo(0,0));
let _lt=0;document.addEventListener('touchend',e=>{const n=Date.now();if(n-_lt<350&&!e.target.closest('#menu,#msg'))e.preventDefault();_lt=n},{passive:false});
document.addEventListener('dblclick',e=>e.preventDefault());
document.body.classList.toggle('kb',Ctl.mode=='kb');Wp.reset();World.load(0);ui();
