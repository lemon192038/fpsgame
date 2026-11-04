// Menu tabs, 3D weapon preview, Knockout mode (best of 3 rounds), spectating allies.
document.head.insertAdjacentHTML('beforeend','<style>.card{display:flex;flex-direction:column;align-items:center;gap:6px;border:1px solid rgba(255,255,255,.3);border-radius:12px;padding:10px;background:rgba(255,255,255,.05)}.card canvas{width:260px;height:140px}.cr{display:flex;gap:10px;align-items:center}#wrow{gap:14px;justify-content:center}</style>');
$('ui').insertAdjacentHTML('beforeend','<div id="spec" style="display:none;position:absolute;left:50%;top:76px;transform:translateX(-50%);font:700 18px sans-serif;text-shadow:0 1px 4px #000;pointer-events:none"></div>');
const Pv={init(){this.r=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});this.r.setSize(260,140);this.r.setPixelRatio(1);this.sc=new THREE.Scene();this.sc.add(new THREE.HemisphereLight(0xffffff,0x667788,1.6));
  const d=new THREE.DirectionalLight(0xffffff,1.8);d.position.set(2,3,4);this.sc.add(d);this.cam=new THREE.PerspectiveCamera(28,260/140,.05,20);this.g=new THREE.Group();this.sc.add(this.g)},
 draw(s){const c=$('pv'+s);if(!c)return;if(!this.r)this.init();buildGun(Wp.sel(s),this.g);this.g.position.set(0,0,0);this.g.rotation.set(0,-1.15,0);
  const b=new THREE.Box3().setFromObject(this.g),ct=b.getCenter(new THREE.Vector3()),sz=b.getSize(new THREE.Vector3()).length();this.g.position.sub(ct);this.cam.position.set(0,sz*.15,sz*1.55);this.cam.lookAt(0,0,0);
  this.r.render(this.sc,this.cam);const x=c.getContext('2d');x.clearRect(0,0,260,140);x.drawImage(this.r.domElement,0,0)}};
const Tabs={cur:'play',init(){const m=$('menu'),mk=id=>{const d=document.createElement('div');d.id=id;d.style.cssText='display:flex;flex-direction:column;align-items:center;gap:14px;width:100%';return d},tp=mk('tab-play'),tg=mk('tab-gear'),ts=mk('tab-set'),bar=document.createElement('div');
  bar.className='row';bar.id='tabs';m.insertBefore(bar,m.children[1]);['modes','lvs','mapr'].forEach(i=>tp.appendChild($(i)));tp.appendChild($('pcpu').parentNode);tp.appendChild($('room'));tg.appendChild($('wrow'));['langr','acct','ctlr'].forEach(i=>ts.appendChild($(i)));m.append(tp,tg,ts);this.apply()},
 apply(){[['play','tab-play'],['gear','tab-gear'],['set','tab-set']].forEach(t=>$(t[1]).style.display=Tabs.cur==t[0]?'flex':'none')},show(t){this.cur=t;this.apply();ui()}};
const Spec={on:false,i:0,
 allies(){return enemies.filter(e=>{const u=e.userData;return!u.dead&&(Net.on?u.ally:u.team===0&&!u.remote)})},
 died(){const a=this.allies();if(!a.length){if(KO.on())KO.round(0);return}this.on=true;this.i=0;P.on=true;$('msg').style.display='none';gun.visible=false;$('spec').style.display='block'},
 stop(){this.on=false;gun.visible=true;$('spec').style.display='none'},next(){const a=this.allies();if(a.length)this.i=(this.i+1)%a.length},
 update(){if(!this.on)return;if(!P.dead){this.stop();return}const a=this.allies();
  if(!a.length){this.stop();if(Net.on){$('msg').style.display='flex';$('msg').innerHTML='<h1>ELIMINATED</h1><p>'+(Match.ko()?'Wait for the round to end':'Respawning…')+'</p>'}else if(KO.on())KO.round(0);else Modes.end('DEFEAT');return}
  const e=a[this.i%a.length];cam.position.set(e.position.x,e.position.y+1.6,e.position.z);cam.rotation.y=e.rotation.y+Math.PI;cam.rotation.x=0;$('spec').textContent='SPECTATING · '+(e.userData.name||'ALLY')+' ('+(this.i%a.length+1)+'/'+a.length+')'}};
const KO={r:1,my:0,en:0,busy:false,keep:false,on(){return!Net.on&&(Modes.mode=='ko1'||Modes.mode=='ko5')},txt(){return'KNOCKOUT · ROUND '+this.r+'/3 · '+this.my+' - '+this.en},
 round(win){if(this.busy)return;this.busy=true;win?this.my++:this.en++;Spec.stop();P.on=false;
  if(this.my>=2||this.en>=2){this.busy=false;Modes.end(this.my>this.en?'VICTORY':'DEFEAT');return}
  $('msg').style.display='flex';$('msg').innerHTML='<h1>'+(win?'ROUND WON':'ROUND LOST')+'</h1><p>'+this.txt()+'</p>';setTimeout(()=>{this.r++;this.keep=true;Modes.again();this.keep=false;this.busy=false},2500)}};
const Rules={check(live){const foes=live.some(o=>o.userData.team!==0),al=live.some(o=>o.userData.team===0);
 if(!foes){if(Modes.mode=='wave'){Modes.wave++;P.wave=Modes.wave;enemies.forEach(e=>S.remove(e));enemies.length=0;Bots.horde()}else if(KO.on())KO.round(1);else Modes.end('VICTORY');return}
 if(P.dead&&!al&&Spec.on){if(KO.on())KO.round(0);else Modes.end('DEFEAT')}}};
Match.check=function(){if(this.rb)return;const alive={};this.list.forEach(p=>{if(!this.dead[p.id])alive[this.key(p.id)]=1});const ks=Object.keys(alive);if(ks.length<=1)this.roundEnd(ks[0])};
Match.roundEnd=function(w){this.rb=1;if(w!==undefined)this.sc[w]=(this.sc[w]||0)+1;if(w!==undefined&&this.sc[w]>=2){this.end(w);return}
 P.on=false;$('msg').style.display='flex';$('msg').innerHTML='<h1>'+(String(this.key(Auth.id))==w?'ROUND WON':'ROUND LOST')+'</h1><p>'+this.txt()+'</p>';
 setTimeout(()=>{if(!this.on||this.over)return;this.rn++;this.dead={};this.rb=0;Spec.stop();Wp.reset();P.hp=100;P.dead=false;P.ammo=Wp.cur.mag;P.vy=0;P.pos.set((rnd()-.5)*60,1.7,(rnd()-.5)*60);
  Object.values(Net.peers).forEach(e=>{e.userData.dead=0;e.rotation.x=0});$('msg').style.display='none';P.on=true},3000)};
const _ag3=Modes.again;Modes.again=function(){if(KO.busy&&!KO.keep)return;if(KO.on()&&!KO.keep){KO.r=1;KO.my=KO.en=0}_ag3.call(Modes);if(KO.keep)Modes.stats.m--};
const _mn3=Modes.menu;Modes.menu=function(){Spec.stop();KO.busy=false;_mn3.call(Modes)};
const _h3=hurt;hurt=function(n,by){const was=P.dead;_h3(n,by);if(!was&&P.dead)Spec.died()};
const _ui4=ui;ui=function(){_ui4();
 $('wrow').innerHTML=['P','S'].map(s=>{const w=Wp.sel(s);return'<div class="card"><canvas id="pv'+s+'" width="260" height="140"></canvas><div class="cr"><div class="opt" data-s="'+s+'" data-d="-1">◀</div><div style="min-width:170px"><b>'+(s=='P'?'PRIMARY':'SECONDARY')+'</b><br>'+w.name+'<br><small>'+w.dmg+(w.pel>1?'x'+w.pel:'')+'dmg '+w.rpm+'rpm · '+(w.melee?'∞':w.mag)+'</small></div><div class="opt" data-s="'+s+'" data-d="1">▶</div></div></div>'}).join('')+'<div class="opt" id="wr">RANDOM LOADOUT</div>';
 $('wrow').querySelectorAll('[data-d]').forEach(o=>o.onclick=()=>Wp.pick(o.dataset.s,+o.dataset.d));$('wr').onclick=()=>Wp.rnd();
 $('tabs').innerHTML=[['play','PLAY'],['gear','LOADOUT'],['set','SETTINGS']].map(t=>'<div class="opt '+(Tabs.cur==t[0]?'sel':'')+'" data-t="'+t[0]+'">'+t[1]+'</div>').join('');
 $('tabs').querySelectorAll('.opt').forEach(o=>o.onclick=()=>Tabs.show(o.dataset.t));Pv.draw('P');Pv.draw('S')};
$('ui').addEventListener('pointerdown',()=>{if(Spec.on)Spec.next()},true);
window.W3=1;Tabs.init();ui();
