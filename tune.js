// Tuning layer (loaded last, leaves the other files untouched): ULTRA/AO brightness, evening lighting, maze maps (+CPU pathing), movable buttons.
// 1) AO strength + brightness compensation
{const _bp=Gfx.buildPost.bind(Gfx);Gfx.buildPost=function(){_bp();if(!this.comp)return;const c=this.cfg;let ao=false;
 this.comp.passes.forEach(p=>{if(p.params&&p.params.saoIntensity!==undefined){ao=true;Object.assign(p.params,{saoIntensity:c.ao=='HIGH'?.03:.015,saoScale:1,saoKernelRadius:c.ao=='HIGH'?30:18})}});
 this.comp.passes.forEach(p=>{if(p.material&&p.material.uniforms&&p.material.uniforms.vig){const m=p.material;m.uniforms.exp={value:ao?(c.ao=='HIGH'?1.2:1.12):1};
  m.fragmentShader=m.fragmentShader.replace('uniform float vig,sat,con;','uniform float vig,sat,con,exp;').replace('pow(max(t.rgb,0.)','pow(max(t.rgb*exp,0.)');m.needsUpdate=true}})};Gfx.buildPost()}
// 2) maze maps: lane-style labyrinth from simple walls / crates / pillars, 120 seeds
const Maze={on:false,G:0,cs:0,vo:[],ho:[],cache:{},
 cell(x,z){const c=v=>Math.max(0,Math.min(this.G-1,((v+45)/this.cs)|0));return[c(x),c(z)]},
 open(i,j,d){const G=this.G;if(d==0)return i<G-1&&this.vo[i][j];if(d==1)return i>0&&this.vo[i-1][j];if(d==2)return j<G-1&&this.ho[i][j];return j>0&&this.ho[i][j-1]},
 field(ti,tj){const k=ti*this.G+tj;if(this.cache[k])return this.cache[k];const G=this.G,d=new Int16Array(G*G).fill(-1),q=[[ti,tj]];d[ti*G+tj]=0;
  for(let h=0;h<q.length;h++){const[i,j]=q[h];for(let n=0;n<4;n++){if(!this.open(i,j,n))continue;const a=i+(n==0)-(n==1),b=j+(n==2)-(n==3);if(d[a*G+b]<0){d[a*G+b]=d[i*G+j]+1;q.push([a,b])}}}return this.cache[k]=d},
 step(p,t){const[i,j]=this.cell(p.x,p.z),[ti,tj]=this.cell(t.x,t.z);if(i==ti&&j==tj)return null;const d=this.field(ti,tj),G=this.G;let best=null,bd=d[i*G+j];
  for(let n=0;n<4;n++){if(!this.open(i,j,n))continue;const a=i+(n==0)-(n==1),b=j+(n==2)-(n==3);if(d[a*G+b]>=0&&d[a*G+b]<bd){bd=d[a*G+b];best={x:-45+this.cs*(a+.5),z:-45+this.cs*(b+.5)}}}return best}};
function mazeBuild(id){const r=rngS(900000+id*977),G=[8,10,12][id%3],cs=90/G,T=1,h0=4+id%3,br=.12+((id*7)%10)*.03,lowP=.1+((id*3)%5)*.05,crP=.1+((id*5)%6)*.04,col=PAL[id%PAL.length];
 N=0;NB=0;boxes.length=0;const vo=Array.from({length:G},()=>[]),ho=Array.from({length:G},()=>[]),seen=Array.from({length:G},()=>Array(G).fill(0)),st=[[0,0]];seen[0][0]=1;
 while(st.length){const[i,j]=st[st.length-1],nb=[];if(i>0&&!seen[i-1][j])nb.push([i-1,j,0]);if(i<G-1&&!seen[i+1][j])nb.push([i+1,j,1]);if(j>0&&!seen[i][j-1])nb.push([i,j-1,2]);if(j<G-1&&!seen[i][j+1])nb.push([i,j+1,3]);
  if(!nb.length){st.pop();continue}const[a,b,d]=nb[(r()*nb.length)|0];seen[a][b]=1;if(d==0)vo[a][j]=1;else if(d==1)vo[i][j]=1;else if(d==2)ho[i][b]=1;else ho[i][j]=1;st.push([a,b])}
 for(let i=0;i<G-1;i++)for(let j=0;j<G;j++)if(!vo[i][j]&&r()<br)vo[i][j]=1;for(let i=0;i<G;i++)for(let j=0;j<G-1;j++)if(!ho[i][j]&&r()<br)ho[i][j]=1;
 const cv=(x,z)=>Math.abs(x)<22&&Math.abs(z)>30||Math.hypot(Math.abs(x)-34,Math.abs(z)-34)<9||Math.hypot(Math.abs(x)-34,z)<9||Math.hypot(x,z-20)<9||Math.hypot(x,z)<10||(Math.abs(Math.abs(x)-30)<9&&Math.abs(z+18)<9);
 const wl=(i,j,vert)=>{const xm=vert?-45+cs*(i+1):-45+cs*(i+.5),zm=vert?-45+cs*(j+.5):-45+cs*(j+1),dx=vert?0:cs/2,dz=vert?cs/2:0;
  if(cv(xm,zm)||cv(xm-dx,zm-dz)||cv(xm+dx,zm+dz)){(vert?vo:ho)[i][j]=1;return}const h=r()<lowP?1.4:h0+r()*1.5;vert?add(xm,0,zm,T,h,cs+T,col):add(xm,0,zm,cs+T,h,T,col)};
 for(let i=0;i<G-1;i++)for(let j=0;j<G;j++)if(!vo[i][j])wl(i,j,true);for(let i=0;i<G;i++)for(let j=0;j<G-1;j++)if(!ho[i][j])wl(i,j,false);
 add(0,0,-45,90,6,1,col);add(0,0,45,90,6,1,col);add(-45,0,0,1,6,90,col);add(45,0,0,1,6,90,col);
 for(let i=0;i<G;i++)for(let j=0;j<G;j++)if(r()<crP){const x=-45+cs*(i+.5)+(r()-.5)*cs*.4,z=-45+cs*(j+.5)+(r()-.5)*cs*.4;if(!cv(x,z))add(x,0,z,2,1+(r()<.5?1:0),2,CONT[(i+j)%4])}
 [[-30,-18],[30,-18]].forEach((s,k)=>{for(let q=0;q<4;q++)add(s[0]+(q%2)*5-2.5,0,s[1]+(q>>1)*5-2.5,2,2,2,CONT[(k+q)%4])});[[-5,-5],[5,-5],[-5,5],[5,5]].forEach(p=>add(p[0],0,p[1],1,4,1,col));
 Object.assign(Maze,{on:true,G,cs,vo,ho,cache:{}});const I=World.inst;I.count=N;I.instanceMatrix.needsUpdate=true;I.instanceColor.needsUpdate=true;World.balls.count=0;World.sea.visible=false}
// 3) evening lighting + load wrapper
Modes.maze=localStorage.mz=='1';
const _wl=World.load.bind(World);World.load=function(id){Maze.on=false;_wl(id);const th=THEMES[id%10],v=(id/10)|0,wx=World.wx(id),pi=wx=='clear'?(th[4]+v)%6:wx=='snow'?4:3,hm=S.children.find(o=>o.isHemisphereLight);
 if(pi==2||pi==5){hm.color.setHex(SKY[pi][1]);hm.intensity=1.3;sun.intensity=Math.max(sun.intensity,2.8);if(pi==5)S.fog.color.setHex(0x8a7a90)}
 R.toneMappingExposure=[1.05,1.05,1.35,1,1,1.7][pi];World.sunI=sun.intensity;if(Net.on?Net.map%2==0:Modes.maze)mazeBuild(id)};
const _nm=World.name;World.name=id=>(Modes.maze?'MAZE · ':'')+_nm(id);
const _ui5=ui;ui=function(){_ui5();let z=$('mzr');if(!z){z=document.createElement('div');z.className='row';z.id='mzr';$('mapr').parentNode.insertBefore(z,$('mapr'))}
 z.innerHTML=[['0','STANDARD'],['1','MAZE']].map(a=>'<div class="opt '+((Modes.maze?'1':'0')==a[0]?'sel':'')+'" data-z="'+a[0]+'">'+a[1]+'</div>').join('');z.querySelectorAll('.opt').forEach(o=>o.onclick=()=>{Modes.maze=o.dataset.z=='1';localStorage.mz=o.dataset.z;ui()})};
// 4) movable buttons
$('ui').insertAdjacentHTML('beforeend','<div id="edit" style="display:none;position:absolute;left:0;right:0;top:110px;flex-direction:column;align-items:center;gap:10px;pointer-events:none"><div style="font-weight:700;text-shadow:0 1px 4px #000;background:rgba(0,0,0,.5);padding:6px 12px;border-radius:8px">Drag the buttons to move them</div><div class="row" style="pointer-events:auto"><div class="opt" id="erst">RESET LAYOUT</div><div class="opt go" id="edone">DONE</div></div></div>');
const Edit={on:false,d:null,ids:['joy','fire','jump','rel','ads','crc','swp','mbtn'],def:{},
 init(){this.ids.forEach(i=>this.def[i]=$(i).getAttribute('style')||'');this.apply()},
 pos(){try{return JSON.parse(localStorage.btnpos)||{}}catch(e){return{}}},
 apply(){const p=this.pos();let st=$('btnstyle');if(!st){st=document.createElement('style');st.id='btnstyle';document.head.appendChild(st)}let css='';
  this.ids.forEach(i=>{const v=p[i];if(!v)return;const x=Math.round(v[0]*innerWidth),y=Math.round(v[1]*innerHeight);if(i=='joy')css+='#joy{left:'+x+'px;top:'+y+'px;bottom:auto}';else{const e=$(i);e.style.left=x+'px';e.style.top=y+'px';e.style.right='auto';e.style.bottom='auto'}});st.textContent=css},
 start(){this.on=true;P.on=false;document.body.classList.remove('kb');$('menu').style.display='none';$('gfx').style.display='none';$('edit').style.display='flex'},
 done(){this.on=false;$('edit').style.display='none';document.body.classList.toggle('kb',Ctl.mode=='kb');$('menu').style.display='flex'},
 reset(){localStorage.removeItem('btnpos');this.ids.forEach(i=>$(i).setAttribute('style',this.def[i]));$('btnstyle').textContent=''}};
document.addEventListener('pointerdown',e=>{if(!Edit.on)return;const b=e.target.closest&&e.target.closest('.b'),z=e.target.id=='jz';if(!b&&!z)return;e.stopPropagation();e.preventDefault();const el=z?$('joy'):b;if(!Edit.ids.includes(el.id))return;
 const r=el.getBoundingClientRect();Edit.d={el,id:el.id,pid:e.pointerId,ox:z?70:e.clientX-r.left,oy:z?70:e.clientY-r.top,moved:false};el.style.right='auto';el.style.bottom='auto'},true);
document.addEventListener('pointermove',e=>{const d=Edit.d;if(!d||e.pointerId!=d.pid)return;d.x=Math.max(0,Math.min(innerWidth-d.el.offsetWidth,e.clientX-d.ox));d.y=Math.max(0,Math.min(innerHeight-d.el.offsetHeight,e.clientY-d.oy));d.moved=true;d.el.style.left=d.x+'px';d.el.style.top=d.y+'px'});
const eend=e=>{const d=Edit.d;if(!d||e.pointerId!=d.pid)return;Edit.d=null;if(d.moved){const p=Edit.pos();p[d.id]=[d.x/innerWidth,d.y/innerHeight];localStorage.btnpos=JSON.stringify(p)}if(d.id=='joy')d.el.style.left=d.el.style.top=d.el.style.bottom='';Edit.apply()};
document.addEventListener('pointerup',eend);document.addEventListener('pointercancel',eend);addEventListener('resize',()=>Edit.apply());
$('tab-set').insertAdjacentHTML('beforeend','<div class="opt" id="ebtn">CUSTOMIZE BUTTONS</div>');$('ebtn').onclick=()=>Edit.start();$('erst').onclick=()=>Edit.reset();$('edone').onclick=()=>Edit.done();
Edit.init();World.load(Modes.map);ui();$('menu').insertAdjacentHTML('beforeend','<div style="opacity:.55;font-size:12px">tune 16</div>');
