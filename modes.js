// Menu, accounts (Supabase + Google), CPU difficulty, game modes, online rooms.
// [reaction s, fire interval s, base accuracy, damage, speed, aware range]
const LV={'Very Easy':[1.2,1,.35,6,2.8,38],'Easy':[.6,.6,.62,9,3.8,52],'Normal':[.35,.4,.76,10,4.3,65],'Hard':[.25,.3,.84,11,4.7,72],
'Expert':[.18,.22,.9,12,5.1,80],'Master':[.12,.16,.94,13,5.5,95],'Pro':[.08,.1,.97,14,5.9,110],'Cheater':[.05,.07,.99,16,6.4,140]};
window.MV=7;
const MODES=[['1v1','1v1'],['5v5','5v5'],['ffa','1v1v1v1v1'],['wave','WAVE']],HUE=[.6,0,.1,.33,.8];
const Modes={mode:'1v1',lv:'Normal',stats:{k:0,d:0,m:0},wave:1,
 get D(){const a=LV[this.lv];return{react:a[0],fi:a[1],acc:a[2],dmg:a[3],spd:a[4],aware:a[5]}},
 menu(){P.on=false;Net.leave();$('msg').style.display='none';$('menu').style.display='flex';ui()},
 end(title){P.on=false;$('msg').style.display='flex';$('msg').innerHTML='<h1>'+title+'</h1><p>'+P.kills+' kills</p><p><b>Tap to play again</b></p>'},
 again(){Wp.reset();World.load(Net.on?Net.map:Modes.map);enemies.forEach(e=>{if(!e.userData.remote)S.remove(e)});for(let i=enemies.length-1;i>=0;i--)if(!enemies[i].userData.remote)enemies.splice(i,1);
  Object.assign(P,{hp:100,ammo:Wp.cur.mag,kills:0,dead:false,rel:0,vy:0,wave:1});this.wave=1;
  if(Net.on)P.pos.set((rnd()-.5)*60,1.7,(rnd()-.5)*60);
  else{const m=this.mode,at=(t,n,z)=>{for(let i=0;i<n;i++)Bots.mk(t,(i-(n-1)/2)*8,z)};this.stats.m++;Auth.save();
   if(m=='1v1'){P.pos.set(0,1.7,36);at(1,1,-36)}
   else if(m=='5v5'){P.pos.set(0,1.7,36);at(0,4,38);at(1,5,-36)}
   else if(m=='ffa'){P.pos.set(0,1.7,36);[[-34,-34],[34,-34],[-34,0],[34,0]].forEach((p,i)=>Bots.mk(i+1,p[0],p[1]))}
   else{P.pos.set(0,1.7,20);Bots.horde()}}
  P.yaw=0;P.pitch=0;$('msg').style.display='none';$('menu').style.display='none';P.on=true}};
const Bots={
 mk(team,x,z,rid,name){const e=new THREE.Group(),cl=new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(HUE[team%5],.5,.3),roughness:.9}),
  sk=skin.clone(),hm=new THREE.MeshStandardMaterial({color:0x2c3326,roughness:.6}),
  body=new THREE.Mesh(new THREE.CylinderGeometry(.3,.26,1.1,10),cl),head=new THREE.Mesh(new THREE.SphereGeometry(.2,12,10),sk),
  helm=new THREE.Mesh(new THREE.SphereGeometry(.23,12,8,0,6.3,0,1.5),hm),legs=new THREE.Mesh(new THREE.CylinderGeometry(.24,.2,.7,8),cl);
  body.position.y=.95;head.position.y=1.75;helm.position.y=1.78;legs.position.y=.35;
  const parts=[body,head,helm,legs];parts.forEach(m=>{m.castShadow=true;m.userData.e=e;e.add(m)});
  e.position.set(x,0,z);e.userData={hp:100,team,cd:Modes.D.react+rnd(),off:rnd()*9,dead:0,flash:0,parts,remote:rid,name};{const li=Object.keys(LV).indexOf(Modes.lv),pw=WP.filter(w=>w.slot=='P'&&!(li<2&&(w.code=='SN'||w.code=='LM'))),sw=WP.filter(w=>w.slot=='S');e.userData.p=pw[(rnd()*pw.length)|0];e.userData.s=sw[(rnd()*sw.length)|0]}
  if(name){const c=document.createElement('canvas');c.width=256;c.height=48;const g=c.getContext('2d');g.font='bold 32px sans-serif';g.textAlign='center';g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=5;g.strokeText(name,128,36);g.fillText(name,128,36);
   const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,fog:false}));sp.scale.set(1.6,.3,1);sp.position.y=2.3;e.add(sp)}
  S.add(e);enemies.push(e);return e},
 horde(){for(let i=0;i<2+Modes.wave*2;i++){const a=rnd()*6.28;Bots.mk(1,Math.cos(a)*38,Math.sin(a)*38)}},
 banner(){const k=$('kill');k.classList.remove('show');void k.offsetWidth;k.classList.add('show');snd(700,.25,.2,'triangle')},
 kill(e,byPlayer){e.userData.dead=.001;if(byPlayer){P.kills++;Modes.stats.k++;Auth.save();Bots.banner()}},
 update(dt,now){const D=Modes.D,live=enemies.filter(e=>!e.userData.dead);
  for(const e of enemies){const u=e.userData;
   if(u.dead){u.dead=Math.min(1,u.dead+dt*2);e.rotation.x=-u.dead*1.5;e.position.y=u.dead*.3;continue}
   if(u.remote){e.position.lerp(u.tp,Math.min(1,dt*10));e.rotation.y=u.ty;continue}
   let t=null,td=1e9;
   for(const o of live){const q=o.userData;if(o===e||q.team===u.team||q.remote||q.dead)continue;const d=e.position.distanceTo(o.position);if(d<td){td=d;t=o}}
   if(!P.dead&&u.team!==0){const d=Math.hypot(P.pos.x-e.position.x,P.pos.z-e.position.z);if(d<td){td=d;t=P}}
   if(!t)continue;const tp=t===P?P.pos:t.position,dx=tp.x-e.position.x,dz=tp.z-e.position.z,d=Math.hypot(dx,dz)||1;
   const li=Object.keys(LV).indexOf(Modes.lv),mul=D.dmg/28;
   u.mt=(u.mt||0)-dt;if(u.mt<=0){u.act='';if(rnd()<dt*(.12+li*.09)){const r=rnd();u.act=r<.4?'jump':r<.75?'slide':'crouch';u.mt=u.act=='jump'?.75:u.act=='slide'?.6:1.4;if(u.act=='jump')u.vy=5.5;u.sd=rnd()<.5?1:-1}}
   u.vy=(u.vy||0)-16*dt;e.position.y+=u.vy*dt;if(e.position.y<=0){e.position.y=0;u.vy=0}
   e.scale.y=u.act=='slide'?.65:u.act=='crouch'?.8:1;e.rotation.y=Math.atan2(dx,dz);
   let wp=u.p;if(d>wp.rng*1.5&&u.s.rng>wp.rng||(d<3&&u.s.melee))wp=u.s;
   const pref=Math.max(4,Math.min(28,wp.rng*.5)),want=wp.melee?1:d>pref?1:d<pref*.5?-.6:0,st=Math.sin(now/900+u.off)*.8,spd=D.spd*(u.act=='crouch'?.5:1);
   let vx=dx/d*want+dz/d*st,vz=dz/d*want-dx/d*st;if(u.act=='slide'){vx+=dz/d*u.sd*2.2;vz-=dx/d*u.sd*2.2}
   e.position.x+=vx*spd*dt;e.position.z+=vz*spd*dt;push(e.position,.4);
   if(u.flash>0){u.flash-=dt;u.parts.forEach(m=>m.material.emissive.setHex(u.flash>0?0x992200:0))}
   u.cd-=dt;const reach=wp.melee?2.6:Math.min(D.aware,wp.rng*1.8);if(u.cd>0||d>reach)continue;
   const sh=wp.melee?1:wp.mode=='semi'?1:3,cyc=60/wp.rpm;u.cd=Math.max(D.fi*sh*(.8+rnd()*.4)+cyc*(sh-1),cyc)*(wp.melee?1.2:1);
   const o=e.position.clone();o.y=e.position.y+1.4;const end=new THREE.Vector3(tp.x,t===P?tp.y-.3:1.2,tp.z),dir=end.clone().sub(o).normalize();ray.set(o,dir);
   const wl=ray.intersectObjects(solid,false)[0];if(wl&&wl.distance<o.distanceTo(end))continue;
   if(!wp.melee){const tr=new THREE.Line(new THREE.BufferGeometry().setFromPoints([o,end]),new THREE.LineBasicMaterial({color:0xff9060,transparent:true,fog:false}));S.add(tr);tracers.push({l:tr,t:.08})}
   snd(wp.melee?180:wp.slot=='S'?260:wp.code=='SN'?120:wp.code=='SG'?150:200,.1,.1);
   const pg=D.acc*Math.min(1.15,Math.max(.7,Math.pow(.012/Math.max(wp.sp,.001),.25)))*(u.act=='crouch'?1.1:u.act=='slide'?.7:1)*Math.max(.35,1-d/110)*Math.max(.35,1-Math.max(0,d-wp.rng)/80)*(t===P&&(Mv.crouch||Mv.sl>0)?.85:1);
   let hits=0;for(let k=0;k<sh*wp.pel;k++)if(rnd()<Math.min(.99,pg))hits++;
   if(hits>0){const dmg=hits*wp.dmg*mul;if(t===P)hurt(dmg,'cpu');else{t.userData.hp-=dmg*2.5;t.userData.flash=.1;if(t.userData.hp<=0)Bots.kill(t,0)}}}
  if(Net.on||!P.on)return;
  if(!live.some(o=>o.userData.team!==0)){if(Modes.mode=='wave'){Modes.wave++;P.wave=Modes.wave;enemies.forEach(e=>S.remove(e));enemies.length=0;Bots.horde()}else Modes.end('VICTORY')}}};
const _hurt=hurt;
hurt=function(n,by){if(!Net.on){const was=P.dead;_hurt(n);if(!was&&P.dead){Modes.stats.d++;Auth.save()}return}
 if(P.dead)return;P.hp-=n;P.last=performance.now();$('dmg').style.opacity=1;setTimeout(()=>$('dmg').style.opacity=0,120);snd(90,.2,.3,'square');
 if(P.hp<=0){P.dead=true;P.on=false;Net.send('down',{id:Auth.id,by});Match.kill(by,Auth.id);Modes.stats.d++;Auth.save();$('msg').style.display='flex';$('msg').innerHTML='<h1>ELIMINATED</h1><p>Respawning…</p>';
  setTimeout(()=>{if(!Net.on||Match.over)return;P.hp=100;P.ammo=Wp.cur.mag;P.dead=false;P.pos.set((rnd()-.5)*60,1.7,(rnd()-.5)*60);$('msg').style.display='none';P.on=true},3000)}};
const Auth={id:localStorage.gid||(localStorage.gid=crypto.randomUUID()),name:'Guest'+(1000+Math.floor(Math.random()*9000)),user:null,sb:null,
 async init(){const c=window.CONFIG||{};if(c.SUPABASE_URL&&c.SUPABASE_ANON_KEY&&window.supabase){this.sb=supabase.createClient(c.SUPABASE_URL,c.SUPABASE_ANON_KEY);
  const{data}=await this.sb.auth.getSession();this.set(data.session);this.sb.auth.onAuthStateChange((_,s)=>this.set(s))}ui()},
 set(s){this.user=s&&s.user;if(this.user){this.id=this.user.id;this.name=(this.user.user_metadata.full_name||this.user.email||'Player').split(' ')[0];this.load()}ui()},
 login(){this.sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.href.split('#')[0].split('?')[0]}})},
 logout(){this.sb.auth.signOut()},
 async load(){const{data}=await this.sb.from('profiles').select('*').eq('id',this.id).maybeSingle();Modes.stats=data?{k:data.kills,d:data.deaths,m:data.matches}:{k:0,d:0,m:0};if(!data)this.save();ui()},
 save(){if(!this.user)return;clearTimeout(this.t);this.t=setTimeout(()=>this.sb.from('profiles').upsert({id:this.id,name:this.name,kills:Modes.stats.k,deaths:Modes.stats.d,matches:Modes.stats.m}),1500)}};
const Net={on:false,ch:null,peers:{},
 peer(p){if(!this.peers[p.id]){const e=Bots.mk(Match.hue(p.id,Object.keys(this.peers).length),p.x,p.z,p.id,p.name);e.userData.tp=new THREE.Vector3(p.x,p.h||0,p.z);e.userData.ty=0;e.userData.ally=Match.ally(p.id);this.peers[p.id]=e}return this.peers[p.id]},
 join(room){this.map=([...room].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7))%NM;const ch=this.ch=Auth.sb.channel('room:'+room,{config:{broadcast:{self:false},presence:{key:Auth.id}}});
  ch.on('broadcast',{event:'pose'},({payload:p})=>{const e=Net.peer(p),u=e.userData;u.tp.set(p.x,p.h||0,p.z);u.ty=p.y;e.scale.y=p.c?.75:1;if(u.dead&&performance.now()-u.downAt>2500){u.dead=0;e.rotation.x=0}})
  .on('broadcast',{event:'hit'},({payload:p})=>{if(p.to===Auth.id)hurt(p.dmg,p.by)})
  .on('broadcast',{event:'down'},({payload:p})=>{const e=Net.peers[p.id];if(e){e.userData.dead=.001;e.userData.downAt=performance.now()}Match.kill(p.by,p.id);if(p.by===Auth.id){P.kills++;Modes.stats.k++;Auth.save();Bots.banner()}})
  .on('presence',{event:'leave'},({key})=>{const e=Net.peers[key];if(e){S.remove(e);enemies.splice(enemies.indexOf(e),1);delete Net.peers[key]}})
  .subscribe(s=>{if(s==='SUBSCRIBED'){ch.track({name:Auth.name});Net.on=true;Modes.again()}})},
 leave(){if(!this.ch)return;this.ch.unsubscribe();this.ch=null;this.on=false;Object.values(this.peers).forEach(e=>{S.remove(e);enemies.splice(enemies.indexOf(e),1)});this.peers={}},
 send(ev,payload){this.ch&&this.ch.send({type:'broadcast',event:ev,payload})},hit(to,dmg){this.send('hit',{to,dmg,by:Auth.id})}};
setInterval(()=>{if(Net.on&&P.on)Net.send('pose',{id:Auth.id,name:Auth.name,x:P.pos.x,z:P.pos.z,y:P.yaw+Math.PI,h:P.pos.y-1.7,c:Mv.crouch||Mv.sl>0?1:0})},100);
function ui(){const s=Modes.stats,a=$('acct');
 a.innerHTML=Auth.user?'Signed in: <b>'+Auth.name+'</b> · '+s.k+' kills / '+s.d+' deaths · '+s.m+' matches <span class="opt" id="lo">Sign out</span>':
  'Playing as <b>'+Auth.name+'</b> (guest) '+(Auth.sb?'<span class="opt" id="li">Sign in with Google</span>':'· Supabase not configured (see README)');
 if($('li'))$('li').onclick=()=>Auth.login();if($('lo'))$('lo').onclick=()=>Auth.logout();
 $('modes').innerHTML=MODES.map(m=>'<div class="opt '+(Modes.mode==m[0]?'sel':'')+'" data-m="'+m[0]+'">'+m[1]+'</div>').join('');
 $('lvs').innerHTML=Object.keys(LV).map(l=>'<div class="opt '+(Modes.lv==l?'sel':'')+'" data-l="'+l+'">'+l+'</div>').join('');
 $('modes').querySelectorAll('.opt').forEach(o=>o.onclick=()=>{Modes.mode=o.dataset.m;ui()});
 $('lvs').querySelectorAll('.opt').forEach(o=>o.onclick=()=>{Modes.lv=o.dataset.l;ui()});
 $('ponl').classList.toggle('off',!Auth.user)}
function go(cpu){AC=AC||new(window.AudioContext||window.webkitAudioContext)();Net.leave();if(cpu)Modes.again();else if(Auth.user)Net.join($('room').value.trim()||'lobby')}
$('pcpu').onclick=()=>go(true);$('ponl').onclick=()=>go(false);bind('mbtn',()=>Modes.menu());Auth.init();
