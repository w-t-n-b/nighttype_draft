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

  // === 全ページフッター自動注入（著作権 + 利用規約 + PP） ===
  (function ensureFooter(){
    let f = document.querySelector('footer');
    const hasLegal = f && f.querySelector('[data-legal-line]');
    if(hasLegal) return;
    // フッターが無ければ新規作成
    if(!f){
      f = document.createElement('footer');
      f.setAttribute('data-auto-footer','1');
      f.style.cssText = 'border-top:1px solid rgba(255,255,255,0.08);padding:36px 32px;text-align:center;position:relative;z-index:5;background:rgba(4,4,14,0.6);backdrop-filter:blur(12px);margin-top:auto';
      f.innerHTML = `
        <div style="font-family:'Cormorant Garamond',serif;font-size:18px;color:#e9e6ff;letter-spacing:.04em;margin-bottom:6px">夜キャラ診断</div>
      `;
      document.body.appendChild(f);
      // Sticky footer: PC でも画面下端に固定（auto-footerだけ対象）
      // 既存のbody styleを壊さないよう、必要なものだけ追加
      const bs = document.body.style;
      const cs = getComputedStyle(document.body);
      if(cs.display !== 'flex'){
        bs.display = 'flex';
        bs.flexDirection = 'column';
        bs.minHeight = '100vh';
      }
    }
    // 著作権 + 利用規約 + PP 1行
    const p = document.createElement('p');
    p.setAttribute('data-legal-line','1');
    p.style.cssText = 'margin-top:14px;font-size:11px;color:#9a96b8;letter-spacing:.04em;line-height:1.8';
    const linkCss = 'color:#9a96b8;text-decoration:underline;text-underline-offset:3px';
    p.innerHTML = `© 2026 夜キャラ診断 All rights reserved.<br><a href="terms.html" style="${linkCss}">利用規約</a> &nbsp;|&nbsp; <a href="privacy.html" style="${linkCss}">プライバシーポリシー</a>`;
    // ホバー色だけJSで設定
    p.querySelectorAll('a').forEach(a => {
      a.addEventListener('mouseover', ()=>{a.style.color='#9B7CF8'});
      a.addEventListener('mouseout',  ()=>{a.style.color='#9a96b8'});
    });
    f.appendChild(p);
  })();

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
