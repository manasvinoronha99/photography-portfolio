/* ═══════════════════════════════════════════════════════════
   MANASVI NORONHA — Automotive Photography Portfolio
   main.js
═══════════════════════════════════════════════════════════ */

// ─── SCROLL RESET ────────────────────────────────────────────
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('load', () => window.scrollTo(0, 0));

// ─── SMOOTH SCROLL (hand-rolled easer — no browser jank) ─────
// Uses an ease-out expo curve: feels like it decelerates into place.
function smoothScrollTo(targetY, duration) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  let startTime = null;

  function ease(t) {
    // Ease-out expo: fast start, silky deceleration
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + distance * ease(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// Intercept all nav anchor clicks
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = document.querySelector('nav')?.offsetHeight || 0;
    const targetY = target.getBoundingClientRect().top + window.scrollY - navH;
    smoothScrollTo(targetY, 900); // 900ms feels editorial without being slow
  });
});

// ─── CUSTOM CURSOR ───────────────────────────────────────────





// ─── SCROLL PROGRESS BAR ─────────────────────────────────────
const progressBar = document.getElementById('progress');
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  progressBar.style.width = pct + '%';
}, { passive: true });

// ─── SCROLL REVEAL (general .reveal elements) ────────────────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in-view'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ─── FROSTED CARD ENTRANCE (CSS @keyframes, GPU-driven) ──────
// Sets data-visible attribute which triggers the CSS animation.
// Once visible, never hides again (one-shot per page load).
const cardObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.hasAttribute('data-visible')) {
      // Stagger sibling cards slightly
      const cards = [...document.querySelectorAll('#about,#legacy-in-motion,#la-auto-show,#petersen,#balboa,#closing')];
      const idx = cards.indexOf(entry.target);
      entry.target.style.animationDelay = (idx * 0.05) + 's';
      entry.target.setAttribute('data-visible', '');
      cardObs.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.04,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('#about,#legacy-in-motion,#la-auto-show,#petersen,#balboa,#closing')
  .forEach(card => cardObs.observe(card));

// ─── NAV — frosted on hero, solid white after ────────────────
const nav = document.querySelector('nav');
function updateNav() {
  const pastHero = window.scrollY > window.innerHeight * 0.85;
  nav.classList.toggle('scrolled', pastHero);
  document.documentElement.classList.toggle('bg-blurred', pastHero);
}
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// ─── ACTIVE NAV LINK ─────────────────────────────────────────
const allSections = document.querySelectorAll('section[id]');
const navLinks    = document.querySelectorAll('.nav-links a');
function updateActiveNav() {
  let current = '';
  allSections.forEach(s => {
    if (s.getBoundingClientRect().top <= window.innerHeight * 0.45) current = s.id;
  });
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
}
window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();

// ─── LIGHTBOX ────────────────────────────────────────────────
let lbPhotos = [], lbIndex = 0;
const lightbox  = document.getElementById('lightbox');
const lbImg     = document.getElementById('lb-img');
const lbCounter = document.getElementById('lb-counter');

function parseGallery(section) {
  try { return JSON.parse(section.dataset.gallery || '[]'); }
  catch { return []; }
}

function openLightbox(previewEl) {
  const section = previewEl.closest('.event-section');
  if (!section) return;
  const gallery = parseGallery(section);
  if (!gallery.length) return;
  const img = previewEl.querySelector('img');
  let idx = 0;
  if (img) { const m = gallery.findIndex(p => img.src.endsWith(p.src.replace(/^.*\//, ''))); if (m !== -1) idx = m; }
  showLightbox(gallery, idx);
}

function openLightboxSrc(src, alt) {
  for (const section of document.querySelectorAll('.event-section')) {
    const gallery = parseGallery(section);
    const idx = gallery.findIndex(p => p.src === src);
    if (idx !== -1) { showLightbox(gallery, idx); return; }
  }
  showLightbox([{ src, alt }], 0);
}

function openLightboxFromModal(src, alt) {
  const gallery = window._modalGallery || [{ src, alt }];
  const idx = gallery.findIndex(p => p.src === src);
  showLightbox(gallery, idx !== -1 ? idx : 0);
}

function showLightbox(gallery, index) {
  lbPhotos = gallery; lbIndex = index;
  renderLightbox();
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function renderLightbox() {
  const p = lbPhotos[lbIndex];
  if (!p) return;
  lbImg.src = p.src; lbImg.alt = p.alt || '';
  lbCounter.textContent = (lbIndex + 1) + ' / ' + lbPhotos.length;
}

function closeLightbox() {
  lightbox.classList.remove('active');
  if (!document.getElementById('grid-modal').classList.contains('active')) document.body.style.overflow = '';
}

function lbNav(dir) { lbIndex = (lbIndex + dir + lbPhotos.length) % lbPhotos.length; renderLightbox(); }

lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (lightbox.classList.contains('active')) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') lbNav(1);
    if (e.key === 'ArrowLeft')  lbNav(-1);
    return;
  }
  if (document.getElementById('grid-modal').classList.contains('active') && e.key === 'Escape') closeGridModal();
});

// ─── GRID MODAL ──────────────────────────────────────────────
const gridModal    = document.getElementById('grid-modal');
const gridBackdrop = document.getElementById('grid-modal-backdrop');
const gmGrid       = document.getElementById('gm-grid');
const gmTitle      = document.getElementById('gm-title');
const gmBgBleed    = document.getElementById('gm-bg-bleed');
let bleedTimer = null;

function openGridModal(section) {
  if (!section) return;
  const gallery = parseGallery(section);
  window._modalGallery = gallery;
  gmTitle.textContent = section.dataset.galleryTitle || '';
  gmGrid.innerHTML = '';

  gallery.forEach((photo, i) => {
    const item = document.createElement('div');
    item.className = 'gm-photo';
    const img = document.createElement('img');
    img.src = photo.src; img.alt = photo.alt || ''; img.loading = 'lazy';
    img.onerror = function() {
      this.remove();
      const ph = document.createElement('div');
      ph.className = 'gm-placeholder';
      ph.innerHTML = '<p class="placeholder-label">' + (photo.alt || 'Photo ' + (i+1)) + '</p>';
      item.appendChild(ph);
    };
    img.addEventListener('click', () => openLightboxFromModal(photo.src, photo.alt));
    item.addEventListener('mouseenter', () => {
      clearTimeout(bleedTimer);
      gmBgBleed.style.backgroundImage = 'url("' + photo.src + '")';
      gmBgBleed.classList.add('visible');
    });
    item.addEventListener('mouseleave', () => { bleedTimer = setTimeout(() => gmBgBleed.classList.remove('visible'), 250); });
    item.appendChild(img);
    gmGrid.appendChild(item);
  });

  gridModal.classList.add('active');
  gridBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
  gmGrid.scrollTop = 0;
}

function closeGridModal() {
  gridModal.classList.remove('active');
  gridBackdrop.classList.remove('active');
  gmBgBleed.classList.remove('visible');
  clearTimeout(bleedTimer);
  if (!lightbox.classList.contains('active')) document.body.style.overflow = '';
}

// Expose globals for inline onclick handlers
window.openLightbox          = openLightbox;
window.openLightboxSrc       = openLightboxSrc;
window.openLightboxFromModal = openLightboxFromModal;
window.closeLightbox         = closeLightbox;
window.lbNav                 = lbNav;
window.openGridModal         = openGridModal;
window.closeGridModal        = closeGridModal;
