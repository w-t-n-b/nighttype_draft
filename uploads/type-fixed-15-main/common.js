// ── Background Canvas ──
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function init() {
    particles = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.2 + 0.2,
        a: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.004 + 0.002,
        drift: (Math.random() - 0.5) * 0.15
      });
    }
  }

  const orbs = [
    { x: 0.2, y: 0.3, r: 180, color: 'rgba(124,58,237,0.07)' },
    { x: 0.8, y: 0.6, r: 220, color: 'rgba(236,72,153,0.05)' },
    { x: 0.5, y: 0.1, r: 150, color: 'rgba(34,211,238,0.04)' }
  ];

  function draw() {
    ctx.clearRect(0, 0, W, H);
    orbs.forEach(o => {
      const g = ctx.createRadialGradient(o.x*W, o.y*H, 0, o.x*W, o.y*H, o.r);
      g.addColorStop(0, o.color); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(o.x*W, o.y*H, o.r, 0, Math.PI*2); ctx.fill();
    });
    particles.forEach(p => {
      p.a += p.speed; p.x += p.drift;
      if (p.x > W) p.x = 0; if (p.x < 0) p.x = W;
      const alpha = (Math.sin(p.a) + 1) / 2 * 0.6 + 0.05;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(200,190,255,${alpha})`; ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize(); init(); draw();
  window.addEventListener('resize', () => { resize(); init(); });
})();

// ── Hamburger / Drawer ──
(function () {
  const burger  = document.getElementById('hamburger');
  const drawer  = document.getElementById('drawer');
  const overlay = document.getElementById('drawer-overlay');
  if (!burger || !drawer) return;

  /* ─ Inject premium drawer structure ─ */
  // Grab existing nav links
  const links = Array.from(drawer.querySelectorAll('a'));

  // Clear drawer
  drawer.innerHTML = '';

  // Build inner wrapper
  const inner = document.createElement('div');
  inner.className = 'drawer-inner';

  // Brand header
  const brand = document.createElement('div');
  brand.className = 'drawer-brand';
  brand.innerHTML = `
    <span class="drawer-brand-logo">NightType</span>
    <span class="drawer-brand-sub">あなたの夜の価値観を解析する</span>`;
  inner.appendChild(brand);

  // Nav label
  const navLabel = document.createElement('div');
  navLabel.className = 'drawer-nav-label';
  navLabel.textContent = 'Navigation';
  inner.appendChild(navLabel);

  // Re-append nav links
  links.forEach(a => inner.appendChild(a));

  drawer.appendChild(inner);

  // Footer
  const footer = document.createElement('div');
  footer.className = 'drawer-footer';
  footer.innerHTML = `<div class="drawer-footer-txt">© 2025 NightType · All Rights Reserved</div>`;
  drawer.appendChild(footer);

  /* ─ Open / Close ─ */
  function open() {
    burger.classList.add('open');
    drawer.classList.add('open');
    if (overlay) { overlay.classList.add('open'); }
    document.body.style.overflow = 'hidden';
  }
  function close() {
    burger.classList.remove('open');
    drawer.classList.remove('open');
    if (overlay) { overlay.classList.remove('open'); }
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', () => burger.classList.contains('open') ? close() : open());
  if (overlay) overlay.addEventListener('click', close);
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
})();
