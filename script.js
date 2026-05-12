/* ============================================================
   EVOR — Global Script
   Handles: loader, cursor, nav scroll, mobile menu,
            page transitions, scroll reveals, card tilt,
            active nav state
   ============================================================ */

/* ── 1. Page loader ──────────────────────────────────────── */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (!loader) return;
  setTimeout(() => loader.classList.add('done'), 900);
});

/* ── 2. Custom cursor ────────────────────────────────────── */
(function initCursor() {
  const dot  = document.querySelector('.cursor');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
  });

  (function animateRing() {
    rx += (mx - rx) * .12;
    ry += (my - ry) * .12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  })();

  document.querySelectorAll('a, button, .card, .service-row, .btn')
    .forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
})();

/* ── 3. Sticky nav ───────────────────────────────────────── */
(function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── 4. Mobile hamburger ─────────────────────────────────── */
(function initBurger() {
  const burger = document.querySelector('.nav-burger');
  const menu   = document.querySelector('.nav-mobile');
  if (!burger || !menu) return;

  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      menu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

/* ── 5. Active nav link ──────────────────────────────────── */
(function initActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

/* ── 6. Page transitions ─────────────────────────────────── */
(function initTransitions() {
  const overlay = document.getElementById('page-overlay');
  if (!overlay) return;

  // Intro: fade in on arrival
  overlay.classList.add('out');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.remove('out');
      overlay.classList.add('in');
      setTimeout(() => overlay.classList.remove('in'), 600);
    });
  });

  // Exit: slide out on link click
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') ||
        href.startsWith('tel') || href.startsWith('http') ||
        a.target === '_blank') return;

    a.addEventListener('click', e => {
      e.preventDefault();
      overlay.classList.add('out');
      setTimeout(() => { window.location.href = href; }, 480);
    });
  });
})();

/* ── 7. Intersection Observer — scroll reveals ───────────── */
(function initReveals() {
  const targets = document.querySelectorAll(
    '.reveal, .reveal-fade, .reveal-scale, .reveal-left, .reveal-right'
  );
  if (!targets.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  targets.forEach(t => io.observe(t));
})();

/* ── 8. Parallax hero shapes ─────────────────────────────── */
(function initParallax() {
  const items = document.querySelectorAll('[data-parallax]');
  if (!items.length) return;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const sy = window.scrollY;
      items.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.3;
        el.style.transform = `translate3d(0, ${sy * speed}px, 0)`;
      });
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();

/* ── 9. Card 3D tilt + radial glow ──────────────────────── */
(function initCardTilt() {
  document.querySelectorAll('.card[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const px = (x / r.width)  * 100;
      const py = (y / r.height) * 100;
      card.style.setProperty('--mx', px + '%');
      card.style.setProperty('--my', py + '%');
      const rotX = ((y / r.height) - 0.5) * -8;
      const rotY = ((x / r.width)  - 0.5) *  8;
      card.style.transform =
        `translateY(-6px) perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ── 10. Smooth anchor scroll (offset for fixed nav) ─────── */
(function initAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ── 11. Counter animation ───────────────────────────────── */
function animateCounter(el) {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const start = performance.now();

  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 4);
    const current = target * ease;
    el.textContent = (Number.isInteger(target)
      ? Math.floor(current)
      : current.toFixed(1)) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => io.observe(c));
})();

/* ── 12. Testimonials carousel ───────────────────────────── */
(function initTestimonialCarousel() {
  const track = document.querySelector('.testi-track');
  if (!track) return;

  const slides = track.querySelectorAll('.testi-slide');
  let current = 0;
  let interval;

  const dots = document.querySelectorAll('.testi-dot');

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
    track.style.transform = `translateX(-${current * 100}%)`;
  }

  document.querySelector('.testi-prev')?.addEventListener('click', () => {
    clearInterval(interval);
    goTo(current - 1);
    start();
  });
  document.querySelector('.testi-next')?.addEventListener('click', () => {
    clearInterval(interval);
    goTo(current + 1);
    start();
  });
  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

  function start() {
    interval = setInterval(() => goTo(current + 1), 5000);
  }

  goTo(0);
  start();
})();
