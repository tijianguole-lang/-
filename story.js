/* ============================================
   焚烬纪元 · 故事集通用脚本
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ========= 防止重复初始化 ========= */
  if (window._storyJsInit) return;
  window._storyJsInit = true;

  /* ========= 阅读进度条 ========= */
  function updProgress() {
    const bar = document.getElementById('progress-bar');
    if (!bar) return;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const scrol = window.scrollY;
    const pct = docH > 0 ? (scrol / docH) * 100 : 0;
    bar.style.width = pct + '%';
  }
  window.addEventListener('scroll', updProgress);
  window.addEventListener('load', updProgress);

  /* ========= 粒子背景 ========= */
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const CNT = 45;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class P {
      constructor() { this.reset(); }
      reset() {
        this.x  = Math.random() * canvas.width;
        this.y  = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.18;
        this.vy = (Math.random() - 0.5) * 0.18;
        this.r  = Math.random() * 1.0 + 0.3;
        this.a  = Math.random() * 0.2 + 0.04;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
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
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(201,168,124,${0.035 * (1 - d / 110)})`;
            ctx.lineWidth   = 0.3;
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

  /* ========= 滚动揭示 ========= */
  const chapters = document.querySelectorAll('.sb-chapter, .db-speech');
  chapters.forEach(el => el.classList.add('reveal'));

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((ent, idx) => {
      if (ent.isIntersecting) {
        setTimeout(() => ent.target.classList.add('visible'), idx * 80);
        obs.unobserve(ent.target);
      }
    });
  }, { threshold: 0.06 });

  chapters.forEach(el => obs.observe(el));

  /* ========= 时间线导航（treaty.html） ========= */
  const dots = document.querySelectorAll('.sht-dot');
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const target = dot.getAttribute('data-target');
      const el = document.getElementById('ch-' + target);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      dots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    });
  });

  /* ========= 章节进入视口时更新时间线 ========= */
  const chapterEls = document.querySelectorAll('.sb-chapter[id]');
  if (chapterEls.length > 0) {
    const chapterObs = new IntersectionObserver((entries) => {
      entries.forEach(ent => {
        if (ent.isIntersecting) {
          const id = ent.target.id.replace('ch-', '');
          dots.forEach(d => {
            d.classList.toggle('active', d.getAttribute('data-target') === id);
          });
        }
      });
    }, { threshold: 0.3, rootMargin: '-10% 0px -60% 0px' });

    chapterEls.forEach(el => chapterObs.observe(el));
  }

  /* ========= 导航高亮 ========= */
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections  = document.querySelectorAll('section, article');
  function updNav() {
    let cur = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 130) cur = s.id;
    });
    navLinks.forEach(a => {
      a.classList.remove('active');
      const href = a.getAttribute('href') || '';
      if (href.includes(cur)) a.classList.add('active');
    });
  }
  window.addEventListener('scroll', updNav);

  /* ========= 平滑锚点 ========= */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const tgt = document.querySelector(a.getAttribute('href'));
      if (tgt) tgt.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ========= 阅读工具（字体切换 + 回到顶部） ========= */
  function addReadingTools() {
    // 避免重复添加
    if (document.querySelector('.reading-tools')) return;

    const toolBar = document.createElement('div');
    toolBar.className = 'reading-tools';
    toolBar.innerHTML = `
      <button class="rt-btn" id="rt-font-toggle" title="切换字体大小">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <text x="1" y="13" font-size="12" font-weight="700" fill="currentColor">A</text>
          <text x="8" y="11" font-size="7" fill="currentColor">a</text>
        </svg>
      </button>
      <button class="rt-btn" id="rt-scroll-top" title="回到顶部">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v12M3 7l5-5 5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    `;
    document.body.appendChild(toolBar);

    let fontLarge = false;
    document.getElementById('rt-font-toggle').addEventListener('click', () => {
      fontLarge = !fontLarge;
      document.body.classList.toggle('rt-large-text', fontLarge);
    });

    document.getElementById('rt-scroll-top').addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  setTimeout(addReadingTools, 300);

});
