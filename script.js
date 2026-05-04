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
    const s = toggle.querySelectorAll('span');
    s[0].style.transform = open ? 'rotate(45deg) translate(5px, 5px)'  : '';
    s[1].style.opacity   = open ? '0' : '1';
    s[2].style.transform = open ? 'rotate(-45deg) translate(5px, -5px)' : '';
  });

  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      drawer.classList.remove('open');
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

/* ── Stagger feature items ── */
document.querySelectorAll('.feature-item, .why-item, .timeline-item, .value-card').forEach((el, i) => {
  if (!el.hasAttribute('data-anim')) {
    el.setAttribute('data-anim', 'up');
    el.style.setProperty('--delay', `${i * 70}ms`);
    animObserver.observe(el);
  }
});

