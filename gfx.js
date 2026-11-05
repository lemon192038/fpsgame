// Graphics settings: presets, per-option controls, post-processing chain (SAO / bloom / FXAA / MSAA / grade), PBR maps, env reflections, persistence.
const GK={shadow:['OFF','LOW','MEDIUM','HIGH','ULTRA'],tex:['LOW','MEDIUM','HIGH','ULTRA'],aa:['OFF','LOW','HIGH'],ao:['OFF','LOW','HIGH'],bloom:['OFF','ON'],res:[50,75,100,125],env:['LOW','MEDIUM','HIGH']};
const GN={shadow:'Shadow Quality',tex:'Texture Quality',aa:'Anti-Aliasing',ao:'Ambient Occlusion',bloom:'Bloom',res:'Render Resolution',env:'Environment Quality'};
const GP={LOW:{shadow:'LOW',tex:'LOW',aa:'OFF',ao:'OFF',bloom:'OFF',res:75,env:'LOW'},MEDIUM:{shadow:'MEDIUM',tex:'MEDIUM',aa:'LOW',ao:'OFF',bloom:'OFF',res:100,env:'MEDIUM'},
 HIGH:{shadow:'HIGH',tex:'HIGH',aa:'HIGH',ao:'OFF',bloom:'ON',res:100,env:'HIGH'},ULTRA:{shadow:'ULTRA',tex:'ULTRA',aa:'HIGH',ao:'HIGH',bloom:'ON',res:125,env:'HIGH'}};
const FINAL={uniforms:{tDiffuse:{value:null},vig:{value:.35},sat:{value:1.1},con:{value:1.05}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'uniform sampler2D tDiffuse;uniform float vig,sat,con;varying vec2 vUv;void main(){vec4 t=texture2D(tDiffuse,vUv);vec3 c=pow(max(t.rgb,0.),vec3(1./2.2));float l=dot(c,vec3(.299,.587,.114));c=mix(vec3(l),c,sat);c=(c-.5)*con+.5;c*=vec3(1.03,1.,.97);c*=1.-vig*smoothstep(.35,.85,distance(vUv,vec2(.5)));gl_FragColor=vec4(c,t.a);}'};
document.head.insertAdjacentHTML('beforeend','<style>#gfx{position:absolute;inset:0;overflow:auto;touch-action:pan-y;display:none;background:rgba(8,10,14,.97);padding:20px 16px}#gfx .in{max-width:640px;margin:0 auto;display:flex;flex-direction:column;gap:10px}#gfx .rw{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.12);padding:8px 0}#gfx .rw b{min-width:170px}#gfx .og{display:flex;flex-wrap:wrap;gap:6px}</style>');
$('ui').insertAdjacentHTML('beforeend','<div id="gfx"></div>');
const Gfx={cfg:null,comp:null,fx:null,err:'',t:0,maps:[],
 load(){let c={};try{c=JSON.parse(localStorage.gfx).cfg||{}}catch(e){}this.cfg=Object.assign({},GP.HIGH,c);for(const k in GK)if(!GK[k].includes(this.cfg[k]))this.cfg[k]=GP.HIGH[k]},
 save(){localStorage.gfx=JSON.stringify({cfg:this.cfg})},
 qn(){return Object.keys(GP).find(n=>Object.keys(GK).every(k=>GP[n][k]==this.cfg[k]))||'CUSTOM'},
 ok125(){const m=R.capabilities.maxTextureSize;return m>=8192&&Math.min(devicePixelRatio,2)*1.25*Math.max(innerWidth,innerHeight)<=m},
 pr(){const r=this.cfg.res==125&&!this.ok125()?100:this.cfg.res;return Math.min(devicePixelRatio,2)*r/100},
 size(){const p=this.pr();R.setPixelRatio(p);R.setSize(innerWidth,innerHeight);if(this.comp){const w=Math.round(innerWidth*p),h=Math.round(innerHeight*p);this.comp.setSize(w,h);if(this.fx)this.fx.material.uniforms.resolution.value.set(1/w,1/h)}},
 lin(v){if(World.su&&World.su.lin)World.su.lin.value=v?1:0},
 setShadow(q){const sz={OFF:0,LOW:512,MEDIUM:1024,HIGH:2048,ULTRA:4096}[q],r={LOW:30,MEDIUM:40,HIGH:50,ULTRA:50}[q]||50;R.shadowMap.enabled=sz>0;sun.castShadow=sz>0;R.shadowMap.type=q=='LOW'?THREE.PCFShadowMap:THREE.PCFSoftShadowMap;
  if(sz){sun.shadow.mapSize.set(sz,sz);Object.assign(sun.shadow.camera,{left:-r,right:r,top:r,bottom:-r});sun.shadow.camera.updateProjectionMatrix();sun.shadow.bias=-.0004;sun.shadow.normalBias=.03;if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}}
  World.balls.castShadow=sz>=1024;S.traverse(o=>{if(o.material)[].concat(o.material).forEach(m=>m.needsUpdate=true)});R.shadowMap.needsUpdate=true},
 canvas(rec,sz){const c=document.createElement('canvas');c.width=c.height=sz;const g=c.getContext('2d');g.fillStyle=rec[0];g.fillRect(0,0,sz,sz);const d=g.getImageData(0,0,sz,sz);for(let i=0;i<d.data.length;i+=4){const n=(Math.random()-.5)*34;d.data[i]+=n;d.data[i+1]+=n;d.data[i+2]+=n}g.putImageData(d,0,0);
  if(rec[1]){g.save();g.scale(sz/256,sz/256);rec[1](g);g.restore()}return c},
 pbr(sz){const h=new Float32Array(sz*sz);[[8,.5],[24,.3],[64,.2]].forEach(o=>{const c=o[0],g=new Float32Array(c*c).map(()=>Math.random());for(let y=0;y<sz;y++){const fy=y/sz*c,y0=fy|0,ty=fy-y0,ya=(y0%c)*c,yb=((y0+1)%c)*c;for(let x=0;x<sz;x++){const fx=x/sz*c,x0=fx|0,tx=fx-x0,xa=x0%c,xb=(x0+1)%c;h[y*sz+x]+=o[1]*((g[ya+xa]*(1-tx)+g[ya+xb]*tx)*(1-ty)+(g[yb+xa]*(1-tx)+g[yb+xb]*tx)*ty)}}});
  const mk=()=>{const c=document.createElement('canvas');c.width=c.height=sz;const g=c.getContext('2d');return[c,g,g.createImageData(sz,sz)]},N=mk(),Rg=mk(),A=mk(),k=sz/16;
  for(let y=0;y<sz;y++)for(let x=0;x<sz;x++){const i=y*sz+x,dx=(h[y*sz+(x+1)%sz]-h[y*sz+(x+sz-1)%sz])*k,dy=(h[((y+1)%sz)*sz+x]-h[((y+sz-1)%sz)*sz+x])*k,l=Math.hypot(dx,dy,1),p=i*4,v=h[i];
   N[2].data.set([(-dx/l*.5+.5)*255,(-dy/l*.5+.5)*255,(1/l*.5+.5)*255,255],p);Rg[2].data.set([0,(.6+.4*v)*255,0,255],p);A[2].data.set([(.7+.3*v)*255,0,0,255],p)}
  [N,Rg,A].forEach(m=>m[1].putImageData(m[2],0,0));return{n:N[0],r:Rg[0],a:A[0]}},
 setTex(q){const sz={LOW:128,MEDIUM:256,HIGH:512,ULTRA:1024}[q],an={LOW:1,MEDIUM:4,HIGH:8,ULTRA:R.capabilities.getMaxAnisotropy()}[q],mf=q=='LOW'?THREE.LinearMipmapNearestFilter:THREE.LinearMipmapLinearFilter;
  const rg=t=>{if(!t||!t.userData.rec)return;t.dispose();t.image=this.canvas(t.userData.rec,sz);t.anisotropy=an;t.minFilter=mf;t.needsUpdate=true};rg(groundT);rg(World.inst.material.map);
  this.maps.forEach(t=>t.dispose());this.maps=[];const m=this.pbr(Math.min(sz,512)),G=ground.material,B=World.inst.material;
  const mk=(c,rep)=>{const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep);t.anisotropy=an;t.minFilter=mf;this.maps.push(t);return t};
  G.normalMap=mk(m.n,40);G.roughnessMap=mk(m.r,40);B.normalMap=mk(m.n,1);B.roughnessMap=mk(m.r,1);B.aoMap=mk(m.a,1);B.aoMapIntensity=.7;G.normalScale.set(.7,.7);B.normalScale.set(.5,.5);
  const geo=World.inst.geometry;if(!geo.attributes.uv2)geo.setAttribute('uv2',geo.attributes.uv);G.needsUpdate=B.needsUpdate=true},
 applyEnv(){const e=this.cfg.env;if(!this.fogBase)this.fogBase=S.fog.density;S.fog.density=this.fogBase*{LOW:1.6,MEDIUM:1,HIGH:.85}[e];const n={LOW:0,MEDIUM:12,HIGH:26}[e];World.clouds.forEach((s,i)=>s.visible=i<n);
  World.inst.material.envMapIntensity=.5;ground.material.envMapIntensity=.35;this.envUpdate()},
 envUpdate(){if(this.envRT){this.envRT.dispose();this.envRT=null}S.environment=null;if(this.cfg.env!='HIGH')return;
  try{this.lin(1);const sc=new THREE.Scene();sc.add(new THREE.Mesh(new THREE.SphereGeometry(50,32,16),World.sk.material));const pm=new THREE.PMREMGenerator(R);this.envRT=pm.fromScene(sc,0,.1,200);pm.dispose();S.environment=this.envRT.texture}catch(e){this.err='environment reflections unavailable'}this.lin(!!this.comp)},
 afterLoad(){this.fogBase=S.fog.density;this.applyEnv()},
 freePost(){if(!this.comp)return;this.comp.passes.forEach(p=>p.dispose&&p.dispose());this.comp.renderTarget1.dispose();this.comp.renderTarget2.dispose();this.comp=null;this.fx=null},
 buildPost(){const c=this.cfg;this.freePost();this.err='';
  if(c.aa=='OFF'&&c.ao=='OFF'&&c.bloom=='OFF'){this.lin(0);return}
  if(!THREE.EffectComposer||!THREE.RenderPass||!THREE.ShaderPass||!THREE.CopyShader){this.err='post-processing scripts unavailable';this.lin(0);return}
  try{const p=this.pr(),w=Math.round(innerWidth*p),h=Math.round(innerHeight*p),o={format:THREE.RGBAFormat,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter};
   const rt=c.aa=='HIGH'&&R.capabilities.isWebGL2&&THREE.WebGLMultisampleRenderTarget?new THREE.WebGLMultisampleRenderTarget(w,h,o):new THREE.WebGLRenderTarget(w,h,o),cp=new THREE.EffectComposer(R,rt);cp.addPass(new THREE.RenderPass(S,cam));
   if(c.ao!='OFF'){if(THREE.SAOPass){try{const s=new THREE.SAOPass(S,cam,false,true);Object.assign(s.params,{saoBias:.5,saoIntensity:c.ao=='HIGH'?.1:.06,saoScale:3,saoKernelRadius:c.ao=='HIGH'?70:40,saoMinResolution:0,saoBlur:true,saoBlurRadius:8,saoBlurStdDev:4,saoBlurDepthCutoff:.01});const sr=s.render.bind(s);s.render=function(...a){const h=[];S.traverse(o=>{if((o.isSprite||o.isPoints||o.isLine||o===World.sk||o===mf)&&o.visible){o.visible=false;h.push(o)}});try{sr(...a)}finally{h.forEach(o=>o.visible=true)}};cp.addPass(s)}catch(e){this.err='ambient occlusion unavailable'}}else this.err='ambient occlusion unavailable'}
   if(c.bloom=='ON'&&THREE.UnrealBloomPass)cp.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(w/2,h/2),.35,.5,.85));
   cp.addPass(new THREE.ShaderPass(FINAL));
   if(c.aa=='LOW'&&THREE.FXAAShader){const f=new THREE.ShaderPass(THREE.FXAAShader);f.material.uniforms.resolution.value.set(1/w,1/h);cp.addPass(f);this.fx=f}
   cp.passes[cp.passes.length-1].renderToScreen=true;this.comp=cp;this.lin(1)}catch(e){this.err='post-processing failed: '+e.message;this.comp=null;this.lin(0)}},
 apply(k){if(k=='shadow')this.setShadow(this.cfg.shadow);else if(k=='tex')this.setTex(this.cfg.tex);else if(k=='env')this.applyEnv();else{this.size();this.buildPost()}},
 applyAll(){this.setShadow(this.cfg.shadow);this.setTex(this.cfg.tex);this.applyEnv();this.size();this.buildPost()},
 preset(n){this.cfg=Object.assign({},GP[n]);this.applyAll();this.save();this.panel()},reset(){this.preset('HIGH')},
 set(k,v){this.cfg[k]=v;this.apply(k);this.save();this.panel()},
 spark(p,n){if(!this.sp){const N=160;this.sp={N,i:0,pos:new Float32Array(N*3).fill(-999),vel:new Float32Array(N*3),life:new Float32Array(N)};
   this.spm=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(this.sp.pos,3)),new THREE.PointsMaterial({color:0xffc060,size:.09,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));this.spm.frustumCulled=false;S.add(this.spm)}
  const s=this.sp;for(let k=0;k<n;k++){const i=s.i=(s.i+1)%s.N;s.pos[i*3]=p.x;s.pos[i*3+1]=p.y;s.pos[i*3+2]=p.z;s.vel[i*3]=(Math.random()-.5)*4;s.vel[i*3+1]=Math.random()*3;s.vel[i*3+2]=(Math.random()-.5)*4;s.life[i]=.35+Math.random()*.3}},
 sparkUpdate(dt){const s=this.sp;if(!s)return;for(let i=0;i<s.N;i++)if(s.life[i]>0){s.life[i]-=dt;s.vel[i*3+1]-=9*dt;for(let a=0;a<3;a++)s.pos[i*3+a]+=s.vel[i*3+a]*dt;if(s.life[i]<=0)s.pos[i*3+1]=-999}this.spm.geometry.attributes.position.needsUpdate=true},
 render(){const n=performance.now(),dt=Math.min(.05,(n-this.t)/1000);this.t=n;this.sparkUpdate(dt);if(this.comp)this.comp.render(dt);else R.render(S,cam)},
 panel(){const q=this.qn(),b=(k,v,l,x)=>'<div class="opt '+(this.cfg[k]==v?'sel':'')+x+'" data-k="'+k+'" data-v="'+v+'">'+l+'</div>';
  $('gfx').innerHTML='<div class="in"><h2 style="margin:0">GRAPHICS SETTINGS</h2><div class="rw"><b>QUALITY</b><div class="og">'+['LOW','MEDIUM','HIGH','ULTRA'].map(n=>'<div class="opt '+(q==n?'sel':'')+'" data-p="'+n+'">'+n+'</div>').join('')+'<div class="opt '+(q=='CUSTOM'?'sel':'')+'" style="pointer-events:none">CUSTOM</div></div></div>'
   +Object.keys(GK).map(k=>'<div class="rw"><b>'+GN[k]+'</b><div class="og">'+GK[k].map(v=>b(k,v,k=='res'?v+'%':v,k=='res'&&v==125&&!this.ok125()?' off':'')).join('')+'</div></div>').join('')
   +(this.err?'<div style="color:#f90;font-size:13px">'+this.err+'</div>':'')+'<div class="og" style="justify-content:center;padding-top:6px"><div class="opt" id="grs">RESET TO DEFAULT</div><div class="opt go" id="gbk">BACK</div></div></div>';
  const G=$('gfx');G.querySelectorAll('[data-p]').forEach(o=>o.onclick=()=>this.preset(o.dataset.p));G.querySelectorAll('[data-k]').forEach(o=>o.onclick=()=>{if(o.classList.contains('off'))return;this.set(o.dataset.k,isNaN(o.dataset.v)?o.dataset.v:+o.dataset.v)});
  $('grs').onclick=()=>this.reset();$('gbk').onclick=()=>{G.style.display='none'}}};
Gfx.load();Gfx.applyAll();
$('tab-set').insertAdjacentHTML('beforeend','<div class="opt" id="gfxbtn">GRAPHICS SETTINGS</div>');$('gfxbtn').onclick=()=>{Gfx.panel();$('gfx').style.display='block'};
addEventListener('resize',()=>Gfx.size());window.GX=1;
