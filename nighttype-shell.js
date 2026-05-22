// === 夜キャラ診断 — 共通の星空背景・ナビ動作・コンステレーション ===
(function(){
  // === Stars canvas ===
  const canvas = document.getElementById('stars');
  const ctx = canvas ? canvas.getContext('2d') : null;
  if(canvas && ctx){
    let stars = [], shootingStars = [];
    function resize(){
      canvas.width = innerWidth * devicePixelRatio;
      canvas.height = innerHeight * devicePixelRatio;
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      ctx.scale(devicePixelRatio, devicePixelRatio);
      stars = [];
      const count = Math.min(180, Math.floor(innerWidth*innerHeight/9000));
      for(let i=0;i<count;i++){
        stars.push({
          x: Math.random()*innerWidth,
          y: Math.random()*innerHeight,
          r: Math.random()*1.4+0.2,
          a: Math.random(),
          ad: (Math.random()*.6+.2)*0.012,
          dir: Math.random()>.5?1:-1,
          hue: Math.random()<.18 ? (Math.random()<.5 ? 'violet':'cyan') : 'white'
        });
      }
    }
    function drawStar(s){
      const col = s.hue==='violet' ? `rgba(196,181,253,${s.a})`
                : s.hue==='cyan'   ? `rgba(165,243,252,${s.a})`
                                   : `rgba(255,255,255,${s.a})`;
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
      if(s.r>0.9){
        ctx.fillStyle = col.replace(/,([0-9.]+)\)$/, (_,a)=>`,${(+a)*0.18})`);
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r*3, 0, Math.PI*2); ctx.fill();
      }
    }
    function maybeShoot(){
      if(Math.random()<.0025 && shootingStars.length<2){
        const startX = Math.random()*innerWidth*.6 + innerWidth*.2;
        shootingStars.push({
          x:startX,y:Math.random()*innerHeight*.5,
          vx:-(4+Math.random()*4),vy:2+Math.random()*2,
          life:1, len:60+Math.random()*40
        });
      }
    }
    function drawShoot(s){
      const grad = ctx.createLinearGradient(s.x,s.y,s.x+s.len,s.y-s.len*0.5);
      grad.addColorStop(0,`rgba(255,255,255,${s.life})`);
      grad.addColorStop(.4,`rgba(196,181,253,${s.life*.6})`);
      grad.addColorStop(1,'transparent');
      ctx.strokeStyle=grad; ctx.lineWidth=1.4; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(s.x+s.len,s.y-s.len*0.5); ctx.stroke();
    }
    function loop(){
      ctx.clearRect(0,0,innerWidth,innerHeight);
      stars.forEach(s=>{
        s.a += s.ad*s.dir;
        if(s.a>1){s.a=1;s.dir=-1}
        if(s.a<0.05){s.a=0.05;s.dir=1}
        drawStar(s);
      });
      maybeShoot();
      shootingStars = shootingStars.filter(s=>{
        s.x += s.vx; s.y += s.vy; s.life -= 0.02;
        drawShoot(s);
        return s.life>0 && s.x>-100;
      });
      requestAnimationFrame(loop);
    }
    resize(); loop();
    window.addEventListener('resize', resize);
  }

  // === Constellation: drift 16 character thumbs ===
  const constellation = document.querySelector('.constellation');
  if(constellation && typeof types !== 'undefined'){
    const codes = Object.keys(types);
    codes.forEach((code,i)=>{
      const t = types[code]; if(!t.image) return;
      const el = document.createElement('div');
      el.className = 'const-char';
      // Pseudo-random but deterministic placement
      const seedX = (Math.sin(i*7.13)+1)/2;
      const seedY = (Math.cos(i*5.17)+1)/2;
      el.style.left = (seedX*90)+'%';
      el.style.top  = (seedY*90)+'%';
      el.style.animationDelay = (-i*1.7)+'s';
      el.style.animationDuration = (18 + (i%5)*2.5)+'s';
      el.innerHTML = `<img src="images/${code}.png" alt="">`;
      constellation.appendChild(el);
    });
  }

  // === Nav drawer toggle ===
  const burger = document.querySelector('.nt-burger');
  const links  = document.querySelector('.nt-nav-links');
  const ovl    = document.querySelector('.nt-overlay');

  // Privacy Policy link を全ページのハンバーガーに自動注入
  if(links && !links.querySelector('[data-privacy-link]')){
    const pp = document.createElement('a');
    pp.href = 'privacy.html';
    pp.textContent = 'プライバシーポリシー';
    pp.setAttribute('data-privacy-link', '1');
    pp.style.opacity = '.7';
    pp.style.fontSize = '13px';
    // Diagnose → の前に挿入（CTAは最後に保持）
    const cta = Array.from(links.querySelectorAll('a')).find(a => /diagnose|診断/i.test(a.textContent));
    if(cta) links.insertBefore(pp, cta);
    else links.appendChild(pp);
  }

  if(burger && links){
    function toggle(open){
      const isOpen = open ?? !links.classList.contains('open');
      links.classList.toggle('open', isOpen);
      burger.classList.toggle('open', isOpen);
      ovl?.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }
    burger.addEventListener('click', ()=>toggle());
    ovl?.addEventListener('click', ()=>toggle(false));
    links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>toggle(false)));
  }
})();
