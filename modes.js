// Menu, accounts (Supabase + Google), CPU difficulty, game modes, online rooms.
// [reaction s, fire interval s, base accuracy, damage, speed, aware range]
const LV={'Very Easy':[2.6,2.4,.1,3,1.5,22],'Easy':[1.8,1.7,.2,4,2,28],'Normal':[1.2,1.1,.36,6,2.6,38],'Hard':[.8,.8,.5,8,3.2,46],
'Expert':[.55,.55,.64,9,3.8,55],'Master':[.35,.4,.76,10,4.3,65],'Pro':[.22,.28,.87,11,4.8,75],'Cheater':[.08,.1,.97,12,5.6,120]};
const MODES=[['1v1','1v1'],['5v5','5v5'],['ffa','1v1v1v1v1'],['wave','WAVE']],HUE=[.6,0,.1,.33,.8];
const Modes={mode:'1v1',lv:'Normal',stats:{k:0,d:0,m:0},wave:1,
 get D(){const a=LV[this.lv];return{react:a[0],fi:a[1],acc:a[2],dmg:a[3],spd:a[4],aware:a[5]}},
 menu(){P.on=false;Net.leave();$('msg').style.display='none';$('menu').style.display='flex';ui()},
 end(title){P.on=false;$('msg').style.display='flex';$('msg').innerHTML='<h1>'+title+'</h1><p>'+P.kills+' kills</p><p><b>Tap to play again</b></p>'},
 again(){World.load(Net.on?Net.map:Modes.map);enemies.forEach(e=>{if(!e.userData.remote)S.remove(e)});for(let i=enemies.length-1;i>=0;i--)if(!enemies[i].userData.remote)enemies.splice(i,1);
  Object.assign(P,{hp:100,ammo:30,kills:0,dead:false,rel:0,vy:0,wave:1});this.wave=1;
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
  e.position.set(x,0,z);e.userData={hp:100,team,cd:Modes.D.react+rnd(),off:rnd()*9,dead:0,flash:0,parts,remote:rid,name};
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
   e.rotation.y=Math.atan2(dx,dz);const want=d>14?1:d<7?-.6:0,st=Math.sin(now/900+u.off)*.8;
   e.position.x+=(dx/d*want+dz/d*st)*D.spd*dt;e.position.z+=(dz/d*want-dx/d*st)*D.spd*dt;push(e.position,.4);
   if(u.flash>0){u.flash-=dt;u.parts.forEach(m=>m.material.emissive.setHex(u.flash>0?0x992200:0))}
   u.cd-=dt;if(u.cd>0||d>D.aware)continue;u.cd=D.fi*(.8+rnd()*.4);
   const o=e.position.clone();o.y=1.4;const end=new THREE.Vector3(tp.x,t===P?tp.y-.3:1.2,tp.z),dir=end.clone().sub(o).normalize();ray.set(o,dir);
   const w=ray.intersectObjects(solid,false)[0];if(w&&w.distance<o.distanceTo(end))continue;
   const tr=new THREE.Line(new THREE.BufferGeometry().setFromPoints([o,end]),new THREE.LineBasicMaterial({color:0xff9060,transparent:true,fog:false}));S.add(tr);tracers.push({l:tr,t:.08});snd(160,.1,.1);
   if(rnd()<Math.min(.97,D.acc*Math.max(.3,1-d/90))){if(t===P)hurt(D.dmg,'cpu');else{t.userData.hp-=D.dmg*2.5;t.userData.flash=.1;if(t.userData.hp<=0)Bots.kill(t,0)}}}
  if(Net.on||!P.on)return;
  if(!live.some(o=>o.userData.team!==0)){if(Modes.mode=='wave'){Modes.wave++;P.wave=Modes.wave;enemies.forEach(e=>S.remove(e));enemies.length=0;Bots.horde()}else Modes.end('VICTORY')}}};
const _hurt=hurt;
hurt=function(n,by){if(!Net.on){const was=P.dead;_hurt(n);if(!was&&P.dead){Modes.stats.d++;Auth.save()}return}
 if(P.dead)return;P.hp-=n;P.last=performance.now();$('dmg').style.opacity=1;setTimeout(()=>$('dmg').style.opacity=0,120);snd(90,.2,.3,'square');
 if(P.hp<=0){P.dead=true;P.on=false;Net.send('down',{id:Auth.id,by});Modes.stats.d++;Auth.save();$('msg').style.display='flex';$('msg').innerHTML='<h1>ELIMINATED</h1><p>Respawning…</p>';
  setTimeout(()=>{if(!Net.on)return;P.hp=100;P.ammo=30;P.dead=false;P.pos.set((rnd()-.5)*60,1.7,(rnd()-.5)*60);$('msg').style.display='none';P.on=true},3000)}};
const Auth={id:localStorage.gid||(localStorage.gid=crypto.randomUUID()),name:'Guest'+(1000+Math.floor(Math.random()*9000)),user:null,sb:null,
 async init(){const c=window.CONFIG||{};if(c.SUPABASE_URL&&c.SUPABASE_ANON_KEY&&window.supabase){this.sb=supabase.createClient(c.SUPABASE_URL,c.SUPABASE_ANON_KEY);
  const{data}=await this.sb.auth.getSession();this.set(data.session);this.sb.auth.onAuthStateChange((_,s)=>this.set(s))}ui()},
 set(s){this.user=s&&s.user;if(this.user){this.id=this.user.id;this.name=(this.user.user_metadata.full_name||this.user.email||'Player').split(' ')[0];this.load()}ui()},
 login(){this.sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.href.split('#')[0].split('?')[0]}})},
 logout(){this.sb.auth.signOut()},
 async load(){const{data}=await this.sb.from('profiles').select('*').eq('id',this.id).maybeSingle();Modes.stats=data?{k:data.kills,d:data.deaths,m:data.matches}:{k:0,d:0,m:0};if(!data)this.save();ui()},
 save(){if(!this.user)return;clearTimeout(this.t);this.t=setTimeout(()=>this.sb.from('profiles').upsert({id:this.id,name:this.name,kills:Modes.stats.k,deaths:Modes.stats.d,matches:Modes.stats.m}),1500)}};
const Net={on:false,ch:null,peers:{},
 peer(p){if(!this.peers[p.id]){const e=Bots.mk(1+Object.keys(this.peers).length%4,p.x,p.z,p.id,p.name);e.userData.tp=new THREE.Vector3(p.x,0,p.z);e.userData.ty=0;this.peers[p.id]=e}return this.peers[p.id]},
 join(room){this.map=([...room].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7))%NM;const ch=this.ch=Auth.sb.channel('room:'+room,{config:{broadcast:{self:false},presence:{key:Auth.id}}});
  ch.on('broadcast',{event:'pose'},({payload:p})=>{const e=Net.peer(p),u=e.userData;u.tp.set(p.x,0,p.z);u.ty=p.y;if(u.dead&&performance.now()-u.downAt>2500){u.dead=0;e.rotation.x=0;e.position.y=0}})
  .on('broadcast',{event:'hit'},({payload:p})=>{if(p.to===Auth.id)hurt(p.dmg,p.by)})
  .on('broadcast',{event:'down'},({payload:p})=>{const e=Net.peers[p.id];if(e){e.userData.dead=.001;e.userData.downAt=performance.now()}if(p.by===Auth.id){P.kills++;Modes.stats.k++;Auth.save();Bots.banner()}})
  .on('presence',{event:'leave'},({key})=>{const e=Net.peers[key];if(e){S.remove(e);enemies.splice(enemies.indexOf(e),1);delete Net.peers[key]}})
  .subscribe(s=>{if(s==='SUBSCRIBED'){ch.track({name:Auth.name});Net.on=true;Modes.again()}})},
 leave(){if(!this.ch)return;this.ch.unsubscribe();this.ch=null;this.on=false;Object.values(this.peers).forEach(e=>{S.remove(e);enemies.splice(enemies.indexOf(e),1)});this.peers={}},
 send(ev,payload){this.ch&&this.ch.send({type:'broadcast',event:ev,payload})},hit(to,dmg){this.send('hit',{to,dmg,by:Auth.id})}};
setInterval(()=>{if(Net.on&&P.on)Net.send('pose',{id:Auth.id,name:Auth.name,x:P.pos.x,z:P.pos.z,y:P.yaw+Math.PI})},100);
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
