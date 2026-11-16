/* ============================================
   ARDENA PLATFORMS AFRICA
   ============================================ */

/* ── Nav scroll shadow ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ── Mobile drawer ── */
const toggle = document.getElementById('navToggle');
const drawer = document.getElementById('navDrawer');

if (toggle && drawer) {
  toggle.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    const s = toggle.querySelectorAll('span');
    s[0].style.transform = open ? 'rotate(45deg) translate(5px, 5px)'  : '';
    s[1].style.opacity   = open ? '0' : '1';
    s[2].style.transform = open ? 'rotate(-45deg) translate(5px, -5px)' : '';
  });

  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      drawer.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelectorAll('span').forEach(s => {
        s.style.transform = '';
        s.style.opacity   = '';
      });
    });
  });
}

/* ── Contact form — Formspree ── */
async function handleSubmit(e) {
  e.preventDefault();
  const form    = e.target;
  const success = document.getElementById('formSuccess');
  const btn     = form.querySelector('button[type="submit"]');
  if (!form || !success) return;

  btn.disabled    = true;
  btn.textContent = 'Sending…';

  try {
    const res = await fetch('https://formspree.io/f/maqawyjz', {
      method:  'POST',
      body:    new FormData(form),
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      form.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      form.style.opacity    = '0';
      form.style.transform  = 'translateY(-8px)';
      setTimeout(() => {
        form.style.display = 'none';
        success.classList.add('visible');
      }, 300);
    } else {
      btn.disabled    = false;
      btn.textContent = 'Send message';
      alert('Something went wrong. Please try again.');
    }
  } catch {
    btn.disabled    = false;
    btn.textContent = 'Send message';
    alert('Network error. Please check your connection and try again.');
  }
}

/* ── FAQ accordion ── */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item    = btn.closest('.faq-item');
    const isOpen  = item.classList.contains('open');

    // Close every open item first
    document.querySelectorAll('.faq-item.open').forEach(open => {
      open.classList.remove('open');
      open.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });

    // If it wasn't open, open it
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ── Scroll-triggered animations ── */
const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      animObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -48px 0px'
});

// Stagger child elements within containers marked data-stagger
document.querySelectorAll('[data-anim]').forEach(el => {
  animObserver.observe(el);
});

/* ── Stagger product cards on products section ── */
const prodCards = document.querySelectorAll('.prod-card');
prodCards.forEach((card, i) => {
  if (!card.hasAttribute('data-anim')) {
    card.setAttribute('data-anim', 'up');
    card.style.setProperty('--delay', `${i * 100}ms`);
    animObserver.observe(card);
  }
});

/* ── Stagger feature items — index resets per container, so a page with
      several feature lists doesn't accumulate a second-long delay ── */
const staggerCounts = new Map();

document.querySelectorAll('.feature-item, .why-item, .timeline-item, .value-card, .service-card, .team-card, .card, .steps li').forEach(el => {
  if (el.hasAttribute('data-anim')) return;

  const parent = el.parentElement;
  const i = staggerCounts.get(parent) ?? 0;
  staggerCounts.set(parent, i + 1);

  el.setAttribute('data-anim', 'up');
  el.style.setProperty('--delay', `${i * 70}ms`);
  animObserver.observe(el);
});


/* ============================================
   HERO — rotating word ("Building the ___ Africa runs on.")
   ============================================ */
(() => {
  const el = document.getElementById('heroWord');
  if (!el) return;
  const words = (el.dataset.words || '').split(',').filter(Boolean);
  if (words.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const HOLD = 2400;
  const LEAVE = 320;
  let i = 0;

  const cycle = () => {
    el.classList.add('is-leaving');
    setTimeout(() => {
      i = (i + 1) % words.length;
      el.textContent = words[i];
      el.classList.remove('is-leaving');
      // Restart the rise-in animation for the new word.
      el.classList.remove('is-entering');
      void el.offsetWidth;
      el.classList.add('is-entering');
      setTimeout(cycle, HOLD);
    }, LEAVE);
  };
  setTimeout(cycle, HOLD);
})();

/* ============================================
   HERO — dot terrain
   A plane of dots seen in perspective rolls like a slow swell beneath the
   headline. The cursor lifts the ground under it, and now and then a ripple
   spreads out from a point on the plane, as if something just landed.
   Pauses when off screen or the tab is hidden; still under reduced motion.
   ============================================ */
(() => {
  const canvas = document.getElementById('heroField');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;

  const INK = '32, 32, 32';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0, height = 0, frame = 0;
  let running = false, visible = true;
  let cols = 0, rows = 0;
  let ripples = [];
  let nextRipple = 1500;
  const pointer = { x: -1e4, y: -1e4, lift: 0 };

  const grid = () => {
    // Denser on wide screens, within what a 2D canvas draws smoothly.
    cols = Math.round(Math.min(Math.max(width / 13, 60), 130));
    rows = Math.round(Math.min(Math.max(height / 20, 28), 48));
  };

  // Plane coordinates: u across (-1..1), v into the distance (0 near .. 1 far).
  const project = (u, v, h) => {
    const depth = 1 + v * 3.2;
    const horizon = height * 0.66;
    const ground = height * 0.38;
    return {
      x: width / 2 + (u * width * 0.95) / depth,
      y: horizon + (ground - h * height * 0.07) / depth,
      depth,
    };
  };

  const draw = (time) => {
    ctx.clearRect(0, 0, width, height);
    const t = time;

    for (let r = rows - 1; r >= 0; r--) {
      const v = r / (rows - 1);
      for (let c = 0; c < cols; c++) {
        const u = (c / (cols - 1)) * 2 - 1;

        // The swell: a few slow waves crossing at different angles.
        let h =
          Math.sin(u * 3.2 + t * 0.00055) * 0.55 +
          Math.sin(v * 7.0 - t * 0.0007) * 0.45 +
          Math.sin((u + v) * 5.0 + t * 0.0004) * 0.3;

        // Ripples spread outward from where they start and fade as they go.
        for (const rp of ripples) {
          const age = (t - rp.start) / 1000;
          const d = Math.hypot(u - rp.u, (v - rp.v) * 1.6);
          const front = age * 0.55;
          const band = d - front;
          if (Math.abs(band) < 0.25) {
            h += Math.cos(band * 18) * (1 - Math.abs(band) / 0.25) * 1.4 * Math.max(0, 1 - age / 3.2);
          }
        }

        let p = project(u, v, h);

        // The cursor lifts the ground beneath it.
        const dx = p.x - pointer.x, dy = p.y - pointer.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 40000) {
          const lift = Math.exp(-dist2 / 9000) * 3.2 * pointer.lift;
          h += lift;
          p = project(u, v, h);
        }

        const near = 1 - v;
        const size = 0.7 + near * 1.9 + Math.max(0, h) * 0.18;
        // Fade toward the horizon and toward the sides, so the copy stays clear.
        const edge = 1 - Math.abs(u) * 0.55;
        const alpha = (0.06 + near * 0.62 + Math.max(0, h) * 0.06) * edge;
        ctx.globalAlpha = Math.min(alpha, 0.9);
        ctx.fillStyle = `rgb(${INK})`;
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      }
    }
    ctx.globalAlpha = 1;
  };

  const tick = (time) => {
    ripples = ripples.filter((rp) => time - rp.start < 3200);
    if (time > nextRipple && ripples.length < 2) {
      ripples.push({ u: Math.random() * 1.4 - 0.7, v: 0.1 + Math.random() * 0.5, start: time });
      nextRipple = time + 2600 + Math.random() * 2600;
    }
    // Ease the cursor's lift in and out rather than snapping.
    const target = pointer.x > -1e3 ? 1 : 0;
    pointer.lift += (target - pointer.lift) * 0.06;
    draw(time);
    frame = requestAnimationFrame(tick);
  };

  const start = () => {
    if (running || reducedMotion || !visible || document.hidden || width === 0) return;
    running = true;
    frame = requestAnimationFrame(tick);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(frame);
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    grid();
    if (width === 0) stop();
    else if (reducedMotion) draw(2000);
    else start();
  };

  new ResizeObserver(resize).observe(canvas);
  resize();

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visible ? start() : stop();
  }).observe(canvas);

  // The canvas sits behind the copy, so listen on the page.
  window.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => {
    pointer.x = -1e4;
    pointer.y = -1e4;
  });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
})();
