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
 Object.assign(Maze,{on:true,grid:false,G,cs,vo,ho,cache:{}});const I=World.inst;I.count=N;I.instanceMatrix.needsUpdate=true;I.instanceColor.needsUpdate=true;World.balls.count=0;World.sea.visible=false}
// 2b) shaped (non-rectangular) maps: rooms + lanes on a 36x36 grid, solid masses fill the void; CPU path via grid BFS
function shapeBuild(id){const r=rngS(1700000+id*911),G=36,cs=2.5,wk=new Uint8Array(G*G),X=i=>-45+cs*(i+.5),vc=[0x3a3d42,0x4a4640,0x35393f,0x44484e][id%4],st=id%8,rp=m=>(r()-.5)*2*m;
 const inR=(x,z,cx,cz,w,d,s)=>{const dx=Math.abs(x-cx),dz=Math.abs(z-cz),hw=w/2,hd=d/2;if(dx>hw||dz>hd)return false;if(s==1){const c=Math.min(w,d)*.28;return!(dx>hw-c&&dz>hd-c&&(dx-(hw-c))+(dz-(hd-c))>c)}if(s==2)return(dx/hw)**2+(dz/hd)**2<=1;return true};
 const room=(cx,cz,w,d,s)=>{for(let i=0;i<G;i++)for(let j=0;j<G;j++)if(inR(X(i),X(j),cx,cz,w,d,s))wk[i*G+j]=1};
 const rect=(x0,z0,x1,z1)=>{for(let i=0;i<G;i++)for(let j=0;j<G;j++){const x=X(i),z=X(j);if(x>=x0&&x<=x1&&z>=z0&&z<=z1)wk[i*G+j]=1}};
 const lane=(a,b,w)=>{const h=w*cs/2;if(r()<.5){rect(Math.min(a[0],b[0])-h,a[1]-h,Math.max(a[0],b[0])+h,a[1]+h);rect(b[0]-h,Math.min(a[1],b[1])-h,b[0]+h,Math.max(a[1],b[1])+h)}else{rect(a[0]-h,Math.min(a[1],b[1])-h,a[0]+h,Math.max(a[1],b[1])+h);rect(Math.min(a[0],b[0])-h,b[1]-h,Math.max(a[0],b[0])+h,b[1]+h)}};
 const seg=(a,b,w)=>{const dx=b[0]-a[0],dz=b[1]-a[1],L=dx*dx+dz*dz||1,h=w*cs/2;for(let i=0;i<G;i++)for(let j=0;j<G;j++){const x=X(i),z=X(j),t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/L));if(Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)<=h)wk[i*G+j]=1}};
 const cw=()=>2+((r()*3)|0),sh=()=>(r()*3)|0,cl=v=>Math.max(-40,Math.min(40,v));
 if(st==0){for(let k=0,n=2+((r()*2)|0);k<n;k++){const m=3+((r()*3)|0),q=[[rp(28),34]];for(let u=1;u<=m;u++)q.push([rp(38),34-u*68/(m+1)+rp(4)]);q.push([rp(28),-34]);for(let u=0;u<q.length-1;u++)lane(q[u],q[u+1],cw());q.forEach(p=>{if(r()<.45)room(p[0],p[1],8+r()*8,8+r()*8,sh())})}
  for(let k=0,n=1+((r()*3)|0);k<n;k++)lane([rp(36),rp(26)],[rp(36),rp(26)],cw())}
 else if(st==1){let g=new Uint8Array(G*G);for(let c=0;c<G*G;c++)g[c]=r()<.5?1:0;for(let it=0;it<4;it++){const n=new Uint8Array(G*G);for(let i=0;i<G;i++)for(let j=0;j<G;j++){let w=0;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){if(!a&&!b)continue;const x=i+a,y=j+b;if(x<0||y<0||x>=G||y>=G||!g[x*G+y])w++}n[i*G+j]=w>=5?0:1}g=n}wk.set(g)}
 else if(st==2){const cx=rp(8),cz=rp(6),rx=22+r()*14,rz=22+r()*12,t=(1.5+r()*1.5)*cs/Math.min(rx,rz);for(let i=0;i<G;i++)for(let j=0;j<G;j++)if(Math.abs(Math.hypot((X(i)-cx)/rx,(X(j)-cz)/rz)-1)<t)wk[i*G+j]=1;
  room(cx,cz,10+r()*10,10+r()*10,sh());for(let k=0,n=2+((r()*3)|0);k<n;k++){const a=r()*6.28;seg([cx,cz],[cx+Math.cos(a)*rx,cz+Math.sin(a)*rz],cw())}}
 else if(st==3){const lv=[],sp=(x0,z0,x1,z1,d)=>{if(d==0||(x1-x0<22&&z1-z0<22)){lv.push([x0,z0,x1,z1]);return}const v=(x1-x0)>(z1-z0)?true:(z1-z0)>(x1-x0)?false:r()<.5;if(v){const m=x0+(x1-x0)*(.35+r()*.3);sp(x0,z0,m,z1,d-1);sp(m,z0,x1,z1,d-1)}else{const m=z0+(z1-z0)*(.35+r()*.3);sp(x0,z0,x1,m,d-1);sp(x0,m,x1,z1,d-1)}};
  sp(-43,-43,43,43,2+((r()*2)|0));const c2=lv.map(l=>{const w=(l[2]-l[0])*(.55+r()*.35),d=(l[3]-l[1])*(.55+r()*.35),cx=(l[0]+l[2])/2+rp(2),cz=(l[1]+l[3])/2+rp(2);room(cx,cz,w,d,sh());return[cx,cz]});
  for(let q=1;q<c2.length;q++)lane(c2[q],c2[(r()*q)|0],cw());if(c2.length>3)lane(c2[0],c2[c2.length-1],cw())}
 else if(st==4){const n=5+((r()*3)|0),p=[];for(let k=0;k<n;k++){p.push([rp(36),rp(34)]);room(p[k][0],p[k][1],7+r()*8,7+r()*8,sh())}
  for(let q=1;q<n;q++){let b=0,bd=1e9;for(let a=0;a<q;a++){const d=Math.hypot(p[a][0]-p[q][0],p[a][1]-p[q][1]);if(d<bd){bd=d;b=a}}seg(p[q],p[b],cw())}for(let k=0;k<2;k++)seg(p[(r()*n)|0],p[(r()*n)|0],cw())}
 else if(st==5){const P_={n:[0,37],mn:[0,20],m:[0,0],ms:[0,-20],s:[0,-37],nw:[-34,34],ne:[34,34],sw:[-34,-34],se:[34,-34],w:[-34,0],e:[34,0]};
  room(0,20,12+r()*6,10+r()*4,sh());room(0,0,14+r()*12,14+r()*12,sh());room(0,-20,12+r()*6,10+r()*4,sh());['nw','ne','sw','se'].forEach(k=>room(P_[k][0],P_[k][1],12,12,sh()));['w','e'].forEach(k=>room(P_[k][0],P_[k][1],10+r()*4,14+r()*6,sh()));
  [['n','mn'],['mn','m'],['m','ms'],['ms','s'],['n','nw'],['n','ne'],['s','sw'],['s','se'],['m','w'],['m','e']].forEach(p=>lane(P_[p[0]],P_[p[1]],cw()));[['nw','w'],['w','sw'],['ne','e'],['e','se']].forEach(p=>{if(r()<.8)lane(P_[p[0]],P_[p[1]],cw())})}
 else if(st==6){const cx=rp(6),cz=rp(6),a=r()*6.28,rad=36+r()*4,turns=1.6+r()*1.2,steps=14+((r()*8)|0);let pp=[cl(cx+Math.cos(a)*rad*.9),cl(cz+Math.sin(a)*rad*.9)];
  for(let q=1;q<=steps;q++){const u=q/steps,aa=a+u*turns*6.28,rr=rad*(1-u*.8),np=[cl(cx+Math.cos(aa)*rr),cl(cz+Math.sin(aa)*rr)];seg(pp,np,cw());pp=np}room(pp[0],pp[1],10,10,sh())}
 else{const n=7+((r()*4)|0),p=[];for(let k=0;k<n;k++){p.push([rp(37),rp(34)]);room(p[k][0],p[k][1],7+r()*9,7+r()*9,sh())}
  p.forEach((a,k)=>{p.filter((_,q)=>q!=k).sort((x,y)=>Math.hypot(x[0]-a[0],x[1]-a[1])-Math.hypot(y[0]-a[0],y[1]-a[1])).slice(0,2).forEach(b=>r()<.5?lane(a,b,cw()):seg(a,b,cw()))})}
 room(0,37,38,9,0);room(0,-37,38,9,0);room(0,20,7,7,0);
 const cellOf=(x,z)=>[Math.max(0,Math.min(G-1,((x+45)/cs)|0)),Math.max(0,Math.min(G-1,((z+45)/cs)|0))];
 const reach=w=>{const[si,sj]=cellOf(0,-37),seen=new Uint8Array(G*G),q=[si*G+sj];if(!w[q[0]])return seen;seen[q[0]]=1;for(let h=0;h<q.length;h++){const c=q[h],i=(c/G)|0,j=c%G;for(const[a,b]of[[i+1,j],[i-1,j],[i,j+1],[i,j-1]]){if(a<0||b<0||a>=G||b>=G)continue;const n=a*G+b;if(w[n]&&!seen[n]){seen[n]=1;q.push(n)}}}return seen};
 const nearest=(s,p)=>{let best=null,bd=1e9;for(let i=0;i<G;i++)for(let j=0;j<G;j++)if(s[i*G+j]){const d=Math.hypot(X(i)-p[0],X(j)-p[1]);if(d<bd){bd=d;best=[X(i),X(j)]}}return best};
 for(let it=0;it<4;it++){const s=reach(wk);let miss=null;[[0,37],[0,20]].forEach(p=>{const[i,j]=cellOf(p[0],p[1]);if(!s[i*G+j])miss=p});if(!miss)break;const b=nearest(s,miss);if(b)lane(miss,b,2)}
 for(let k=0;k<6;k++){const s=reach(wk);let c=0;for(const v of s)c+=v;if(c>=480)break;const p=[rp(34),rp(30)];room(p[0],p[1],9+r()*8,9+r()*8,sh());const b=nearest(s,p);if(b)lane(p,b,cw())}
 const need=[[0,37],[0,20],[0,36],[12,38],[-12,38],[0,-36],[16,-36],[-16,-36]],okAll=w=>{const s=reach(w);return need.every(p=>{const[i,j]=cellOf(p[0],p[1]);return s[i*G+j]})};
 const w0=wk.slice();for(let k=0,n=3+((r()*5)|0);k<n;k++){const[i,j]=cellOf(rp(36),rp(34)),sz=r()<.5?1:2;for(let a=0;a<sz;a++)for(let b=0;b<sz;b++)if(i+a<G&&j+b<G)wk[(i+a)*G+j+b]=0}
 if(!okAll(wk))wk.set(w0);const rs=reach(wk);for(let c=0;c<G*G;c++)if(!rs[c])wk[c]=0;
 const sp=[];[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(q=>{let best=null;for(let lv=0;lv<3&&!best;lv++)for(let t=0;t<400&&!best;t++){const i=(r()*G)|0,j=(r()*G)|0;if(!wk[i*G+j])continue;const x=X(i),z=X(j);if(lv==0?(x*q[0]>10&&z*q[1]>4&&Math.abs(z)<32):lv==1?(x*q[0]>0&&z*q[1]>0):true)best=[x,z]}sp.push(best)});
 N=0;NB=0;boxes.length=0;
 for(let j=0;j<G;j++){let i=0;while(i<G){if(wk[i*G+j]){i++;continue}let k=i;while(k<G&&!wk[k*G+j])k++;add(-45+cs*(i+k)/2,0,X(j),cs*(k-i),6,cs,vc);i=k}}
 for(let c=0;c<G*G;c++)if(wk[c]&&r()<.04){const i=(c/G)|0,j=c%G;if(Math.abs(X(j))<29&&Math.hypot(X(i),X(j))>6)add(X(i),0,X(j),2,1.4+(r()<.5?.8:0),2,CONT[c%4])}
 Object.assign(Maze,{on:true,grid:true,G,cs,gw:wk,sp,cache:{}});const I=World.inst;I.count=N;I.instanceMatrix.needsUpdate=true;I.instanceColor.needsUpdate=true;World.balls.count=0;World.sea.visible=false}
Maze.far=function(){const G=this.G;for(let t=0;t<200;t++){const c=(Math.random()*G*G)|0;if(!this.gw[c])continue;const x=-45+this.cs*(((c/G)|0)+.5),z=-45+this.cs*((c%G)+.5);if(Math.hypot(x,z-20)>24)return[x,z]}return[0,-36]};
Maze.gcell=function(x,z){const c=v=>Math.max(0,Math.min(this.G-1,((v+45)/this.cs)|0));return[c(x),c(z)]};
Maze.gfield=function(ti,tj){const G=this.G,k=ti*G+tj;if(this.cache[k])return this.cache[k];const d=new Int16Array(G*G).fill(-1),q=[k];d[k]=0;for(let h=0;h<q.length;h++){const c=q[h],i=(c/G)|0,j=c%G;for(const[a,b]of[[i+1,j],[i-1,j],[i,j+1],[i,j-1]]){if(a<0||b<0||a>=G||b>=G)continue;const n=a*G+b;if(this.gw[n]&&d[n]<0){d[n]=d[c]+1;q.push(n)}}}return this.cache[k]=d};
Maze.gstep=function(p,t){const G=this.G,[i,j]=this.gcell(p.x,p.z),[ti,tj]=this.gcell(t.x,t.z);if(i==ti&&j==tj)return null;const d=this.gfield(ti,tj);let ci=i,cj=j,out=null;
 for(let s=0;s<3;s++){let bd=d[ci*G+cj],bi=-1,bj=-1;for(const[a,b]of[[ci+1,cj],[ci-1,cj],[ci,cj+1],[ci,cj-1]]){if(a<0||b<0||a>=G||b>=G)continue;const v=d[a*G+b];if(v>=0&&v<bd){bd=v;bi=a;bj=b}}if(bi<0)break;ci=bi;cj=bj;out={x:-45+this.cs*(ci+.5),z:-45+this.cs*(cj+.5)};if(ci==ti&&cj==tj)break}return out};
{const _s=Maze.step;Maze.step=function(p,t){return this.grid?this.gstep(p,t):_s.call(this,p,t)}}
// 3) evening lighting + load wrapper
Modes.kind=+localStorage.kd||0;
const _wl=World.load.bind(World);World.load=function(id){Maze.on=false;Maze.sp=null;_wl(id);const th=THEMES[id%10],v=(id/10)|0,wx=World.wx(id),pi=wx=='clear'?(th[4]+v)%6:wx=='snow'?4:3,hm=S.children.find(o=>o.isHemisphereLight);
 if(pi==2||pi==5){hm.color.setHex(SKY[pi][1]);hm.intensity=1.3;sun.intensity=Math.max(sun.intensity,2.8);if(pi==5)S.fog.color.setHex(0x8a7a90)}
 R.toneMappingExposure=[1.05,1.05,1.35,1,1,1.7][pi];World.sunI=sun.intensity;const kd=Net.on?(Net.kind===undefined?Net.map%3:Net.kind):Modes.kind;if(kd==1)mazeBuild(id);else if(kd==2)shapeBuild(id)};
const _nm=World.name;World.name=id=>['','MAZE · ','SHAPED · '][Modes.kind]+_nm(id);
const _ui5=ui;ui=function(){_ui5();let z=$('mzr');if(!z){z=document.createElement('div');z.className='row';z.id='mzr';$('mapr').parentNode.insertBefore(z,$('mapr'))}
 z.innerHTML=[['0','STANDARD'],['1','MAZE'],['2','SHAPED']].map(a=>'<div class="opt '+(Modes.kind==+a[0]?'sel':'')+'" data-z="'+a[0]+'">'+a[1]+'</div>').join('');z.querySelectorAll('.opt').forEach(o=>o.onclick=()=>{Modes.kind=+o.dataset.z;localStorage.kd=o.dataset.z;ui()})};
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
Edit.init();World.load(Modes.map);ui();$('menu').insertAdjacentHTML('beforeend','<div style="opacity:.55;font-size:12px">tune 21</div>');
// 5) minimap: static top-down map, drawn once per map load. It never draws players, enemies, allies or any moving marker.
{const c=document.createElement('canvas');c.id='mm';c.width=c.height=640;c.style.cssText='position:absolute;left:18px;top:72px;width:160px;height:160px;border-radius:8px;border:1px solid rgba(255,255,255,.45);background:#0008;pointer-events:none';$('ui').insertBefore(c,$('menu'));
 const Mini={draw(id){const g=c.getContext('2d'),k=640/96;if(Maze.on&&Maze.grid){const G=Maze.G,q=Maze.cs*k;g.fillStyle='#000';g.fillRect(0,0,640,640);g.fillStyle='#9aa0a8';for(let i=0;i<G;i++)for(let j=0;j<G;j++)if(Maze.gw[i*G+j])g.fillRect((3+Maze.cs*i)*k,(3+Maze.cs*j)*k,q+.6,q+.6);boxes.forEach(b=>{if(b.y1>=5.9)return;g.fillStyle='#6b727b';g.fillRect((b.x0+48)*k,(b.z0+48)*k,Math.max(1,(b.x1-b.x0)*k),Math.max(1,(b.z1-b.z0)*k))});return}const X=x=>(x+48)*k,h=THEMES[id%10][1],s=n=>((n*.35)|0);g.clearRect(0,0,640,640);g.fillStyle='rgb('+s(h>>16&255)+','+s(h>>8&255)+','+s(h&255)+')';g.fillRect(0,0,640,640);
  if(World.sea.visible){g.fillStyle='rgba(42,127,184,.7)';g.fillRect(X(26),X(-45),X(45)-X(26),X(45)-X(-45))}
  [...boxes].sort((a,b)=>a.y1-b.y1).forEach(b=>{const v=Math.min(235,95+b.y1*16)|0;g.fillStyle='rgb('+v+','+v+','+Math.min(255,v+8)+')';g.fillRect(X(b.x0),X(b.z0),Math.max(1,(b.x1-b.x0)*k),Math.max(1,(b.z1-b.z0)*k))});
  g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=2;g.strokeRect(X(-45),X(-45),90*k,90*k)}};
 const _wl3=World.load.bind(World);World.load=function(id){_wl3(id);Mini.draw(id)};Mini.draw(Modes.map)}

// 6) lobby name -> map ("1" Beach I, "2" Desert I ... ; "変形1" / "迷路1" pick the map kind), default lobby "1", minimap markers for self + allies ONLY
function roomMap(room){const s=String(room).normalize('NFKC').trim().toLowerCase();let m;const f=(n,k)=>({kind:k,id:(((+n-1)%120)+120)%120});
 if(m=s.match(/^(変形|shape|shaped)\s*(\d+)$/))return f(m[2],2);if(m=s.match(/^(迷路|maze)\s*(\d+)$/))return f(m[2],1);if(m=s.match(/^(標準|standard)?\s*(\d+)$/))return f(m[2],0);return null}
{const _j=Net.join.bind(Net);Net.join=function(room){_j(room);const m=roomMap(room);if(m){this.map=m.id;this.kind=m.kind}else this.kind=this.map%3}}
if($('room').value==='lobby')$('room').value='1';
$('room').insertAdjacentHTML('afterend','<div id="rhint" style="font-size:13px;opacity:.75"></div>');
{const rh=()=>{const m=roomMap($('room').value);$('rhint').textContent=m?'→ '+['','MAZE · ','SHAPED · '][m.kind]+_nm(m.id):'→ RANDOM'};$('room').addEventListener('input',rh);rh()}
{const c2=document.createElement('canvas');c2.width=c2.height=320;c2.id='mm2';c2.style.cssText='position:absolute;left:18px;top:72px;width:160px;height:160px;pointer-events:none';$('ui').insertBefore(c2,$('menu'));
 const g=c2.getContext('2d'),k=320/96,dot=(x,z,r,ring)=>{g.beginPath();g.arc((x+48)*k,(z+48)*k,r,0,7);g.fillStyle='#2f7bff';g.fill();if(ring){g.lineWidth=2;g.strokeStyle='#fff';g.stroke()}};
 setInterval(()=>{g.clearRect(0,0,320,320);if(!P.dead)dot(P.pos.x,P.pos.z,6,true);
  enemies.forEach(e=>{const u=e.userData;if(u.dead)return;if(Net.on?u.ally===true:(u.team===0&&!u.remote))dot(e.position.x,e.position.z,5,false)})},100)}

// 7) CHECK MAP buttons (CPU / online): load the map that would be played, show the minimap enlarged (static terrain only, no markers)
$('ui').insertAdjacentHTML('beforeend','<div id="mapov" style="display:none;position:absolute;inset:0;background:rgba(5,8,12,.96);flex-direction:column;align-items:center;justify-content:center;gap:12px"><div id="mapttl" style="font-weight:700;font-size:18px"></div><canvas id="mapbig" width="960" height="960" style="width:min(78vw,72vh);height:min(78vw,72vh);border:1px solid rgba(255,255,255,.4);border-radius:8px;background:#000"></canvas><div class="opt go" id="mapx">CLOSE</div></div>');
function showMap(kind,id){const k0=Modes.kind;Modes.kind=kind;World.load(id);Modes.kind=k0;const g=$('mapbig').getContext('2d');g.fillStyle='#000';g.fillRect(0,0,960,960);g.imageSmoothingEnabled=true;g.drawImage($('mm'),0,0,960,960);
 $('mapttl').textContent=['','MAZE · ','SHAPED · '][kind]+_nm(id)+' · '+(id+1)+'/120';$('mapov').style.display='flex'}
$('pcpu').parentNode.insertAdjacentHTML('afterend','<div class="row"><div class="opt" id="mapcpu">CHECK MAP · CPU</div><div class="opt" id="maponl">CHECK MAP · ONLINE</div></div>');
$('mapcpu').onclick=()=>showMap(Modes.kind,Modes.map);
$('maponl').onclick=()=>{const room=$('room').value,m=roomMap(room);if(m)showMap(m.kind,m.id);else{const h=([...room].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7))%NM;showMap(h%3,h)}};
$('mapov').addEventListener('pointerdown',e=>{e.stopPropagation();$('mapov').style.display='none'});
