/* ============================================
   焚烬纪元 · 辩论实录  ——  脚本
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ========== 粒子背景（与主页共享逻辑） ========== */
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const CNT = 50; // 辩论页粒子更少，更安静

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class P {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.r  = Math.random() * 1.2 + 0.3;
        this.a  = Math.random() * 0.25 + 0.05;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,168,124,${this.a})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < CNT; i++) particles.push(new P());

    function lines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(201,168,124,${0.04 * (1 - d / 120)})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }
    }

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      lines();
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* ========== 滚动揭示 ========== */
  const items = document.querySelectorAll(
    '.db-round-header, .db-speech, .db-ending, .db-afterword'
  );
  items.forEach(el => el.classList.add('reveal'));

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((ent, i) => {
      if (ent.isIntersecting) {
        setTimeout(() => ent.target.classList.add('visible'), i * 60);
        obs.unobserve(ent.target);
      }
    });
  }, { threshold: 0.08 });

  items.forEach(el => obs.observe(el));

  /* ========== 导航高亮 ========== */
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section');

  function updNav() {
    let cur = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) cur = s.id;
    });
    navLinks.forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') && a.getAttribute('href').includes(cur)) {
        a.classList.add('active');
      }
    });
  }
  window.addEventListener('scroll', updNav);

  /* ========== 平滑锚点 ========== */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const tgt = document.querySelector(a.getAttribute('href'));
      if (tgt) tgt.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

});
