import '../../css/routes/inner-shared.css';
import '../../css/routes/contact.css';
import { CONFIG, resolveBaseAssetUrl } from '../config.js';
import { registerCleanup } from '../store.js';
import { esc, isReducedMotion, socialSvg, renderPictureHtml } from '../utils.js';
import { activateAdSlots } from '../components/adSlots.js';
import { renderInnerHeaderHtml } from '../components/innerHeader.js';

const CONTACT_HERO_TITLE = 'تواصل معنا';
const CONTACT_HERO_BG = './src/assets/images/hero_marsa_alam_1794996468348.jpg';
const CONTACT_PHOTO_IMG = './src/assets/images/contact_temple_traveler_1795429682873.jpg';
const CONTACT_PHOTO_ALT = 'مسافر يعبر بوابة معبد';

export function renderContact(main) {
  const ARAB_COUNTRIES = [
    { iso: 'eg', name: 'مصر', dial: '+20' },
    { iso: 'sa', name: 'السعودية', dial: '+966' },
    { iso: 'ae', name: 'الإمارات', dial: '+971' },
    { iso: 'kw', name: 'الكويت', dial: '+965' },
    { iso: 'qa', name: 'قطر', dial: '+974' },
    { iso: 'bh', name: 'البحرين', dial: '+973' },
    { iso: 'om', name: 'عُمان', dial: '+968' },
    { iso: 'jo', name: 'الأردن', dial: '+962' },
    { iso: 'lb', name: 'لبنان', dial: '+961' },
    { iso: 'iq', name: 'العراق', dial: '+964' },
    { iso: 'ma', name: 'المغرب', dial: '+212' },
    { iso: 'dz', name: 'الجزائر', dial: '+213' },
    { iso: 'tn', name: 'تونس', dial: '+216' },
    { iso: 'ly', name: 'ليبيا', dial: '+218' },
    { iso: 'sd', name: 'السودان', dial: '+249' },
  ];
  let selectedCountry = ARAB_COUNTRIES[0];
  const contactImgSrc = CONTACT_PHOTO_IMG;
  const contactImgAlt = CONTACT_PHOTO_ALT;
  const phoneDisplay = (CONFIG.contact && CONFIG.contact.phoneDisplay) || '+20 102 155 1322';
  const phoneTel = (CONFIG.contact && CONFIG.contact.phoneTel) || '+201021551322';

  function renderFlagHtml(iso) {
    return (
      '<span class="cf-flag-wrap">' +
      '<img class="cf-flag-img" src="https://flagcdn.com/w40/' +
      esc(iso) +
      '.png" alt="" width="20" height="14" loading="lazy" referrerpolicy="no-referrer" data-iso="' +
      esc(iso.toUpperCase()) +
      '">' +
      '</span>'
    );
  }

  const pinIcon =
    '<svg class="contact-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
  const phoneIcon =
    '<svg class="contact-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>';
  const mailIcon =
    '<svg class="contact-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>';
  const chevronIcon =
    '<svg class="cf-country-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  const checkIcon =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

  const countryOptionsHtml = ARAB_COUNTRIES.map((c, idx) => {
    return (
      '<li role="option" id="cf-country-opt-' +
      esc(c.iso) +
      '" class="cf-country-option" data-country-iso="' +
      esc(c.iso) +
      '" aria-selected="' +
      (idx === 0 ? 'true' : 'false') +
      '">' +
      '<span class="cf-country-option-main">' +
      renderFlagHtml(c.iso) +
      '<span>' +
      esc(c.name) +
      '</span></span>' +
      '<span class="cf-country-option-dial tabular"><bdi dir="ltr">' +
      esc(c.dial) +
      '</bdi></span>' +
      '</li>'
    );
  }).join('');

  const heroBgPictureHtml = renderPictureHtml(CONTACT_HERO_BG, {
    cls: 'inner-header-bg-img',
    alt: '',
    isHero: true,
    loading: 'eager',
    fetchpriority: 'high',
    decoding: 'async',
    sizes: '100vw',
  });

  const photoImgHtml = contactImgSrc
    ? renderPictureHtml(contactImgSrc, {
        id: 'contact-photo-img',
        cls: 'contact-photo-img',
        alt: contactImgAlt,
        loading: 'eager',
        decoding: 'async',
        referrerpolicy: 'no-referrer',
        sizes: '(min-width: 1024px) 480px, 92vw',
      })
    : '';

  main.innerHTML =
    renderInnerHeaderHtml({
      bgPictureHtml: heroBgPictureHtml,
      leftHtml:
        '<h1 class="t-h1 no-auto-ads" tabindex="-1">' +
        CONTACT_HERO_TITLE +
        '</h1>' +
        '<nav class="breadcrumb" aria-label="مسار التنقل"><a href="#home">الرئيسية</a><span aria-hidden="true">›</span><span>' +
        CONTACT_HERO_TITLE +
        '</span></nav>',
    }) +
    '<section class="container contact-section" aria-labelledby="contact-heading">' +
    '<h2 id="contact-heading" class="contact-section-heading no-auto-ads">ارسل لنا رسالة</h2>' +
    '<div class="contact-grid">' +
    '<div class="contact-form-card contact-reveal" data-contact-delay="100">' +
    '<div id="contact-form-wrap" class="contact-form-wrap">' +
    '<form id="contact-form" class="contact-form no-auto-ads" novalidate data-endpoint="' +
    esc(CONFIG.formEndpoint) +
    '">' +
    '<div class="cf-hp" aria-hidden="true" inert>' +
    '<label for="cf-website">الموقع الإلكتروني</label>' +
    '<input id="cf-website" name="website" type="text" tabindex="-1" autocomplete="off">' +
    '</div>' +
    '<div class="cf-group">' +
    '<div class="cf-float-field" data-float-field="name">' +
    '<input id="cf-name" name="name" type="text" autocomplete="name" class="cf-control" placeholder=" " required>' +
    '<label for="cf-name" class="cf-float-label">الاسم</label>' +
    '</div>' +
    '<p id="err-name" class="cf-error" role="alert" hidden></p>' +
    '</div>' +
    '<div class="cf-group" id="cf-phone-group">' +
    '<div class="cf-phone-shell" id="cf-phone-shell">' +
    '<button type="button" id="cf-country-btn" class="cf-country-btn" aria-haspopup="listbox" aria-expanded="false" aria-controls="cf-country-listbox" aria-label="اختر رمز الدولة">' +
    '<span id="cf-country-flag">' +
    renderFlagHtml(selectedCountry.iso) +
    '</span>' +
    '<span id="cf-country-dial" class="tabular"><bdi dir="ltr">' +
    esc(selectedCountry.dial) +
    '</bdi></span>' +
    chevronIcon +
    '</button>' +
    '<div class="cf-phone-input-wrap" data-float-field="phone">' +
    '<input id="cf-phone" name="phone" type="tel" inputmode="tel" dir="ltr" class="cf-phone-input" placeholder="+20 000 000 0000" required>' +
    '<label for="cf-phone" class="cf-float-label">الموبايل</label>' +
    '</div>' +
    '<ul id="cf-country-listbox" class="cf-country-listbox" role="listbox" aria-label="قائمة الدول العربية" hidden>' +
    countryOptionsHtml +
    '</ul>' +
    '</div>' +
    '<p id="err-phone" class="cf-error" role="alert" hidden></p>' +
    '</div>' +
    '<div class="cf-group">' +
    '<div class="cf-float-field" data-float-field="email">' +
    '<input id="cf-email" name="email" type="email" autocomplete="email" class="cf-control" placeholder=" ">' +
    '<label for="cf-email" class="cf-float-label">البريد الإلكتروني</label>' +
    '</div>' +
    '<p id="err-email" class="cf-error" role="alert" hidden></p>' +
    '</div>' +
    '<div class="cf-group">' +
    '<div class="cf-float-field" data-float-field="message">' +
    '<textarea id="cf-message" name="message" rows="6" maxlength="500" class="cf-control cf-textarea" placeholder=" " required></textarea>' +
    '<label for="cf-message" class="cf-float-label">رسالتك</label>' +
    '</div>' +
    '<div class="cf-field-footer">' +
    '<p id="err-message" class="cf-error" role="alert" hidden></p>' +
    '<span id="cf-char-counter" class="cf-char-counter tabular" dir="ltr" aria-live="off">0 / 500</span>' +
    '</div>' +
    '</div>' +
    '<p class="cf-nojs-note">التفعيل يتطلب JavaScript</p>' +
    '<div class="contact-form-footer">' +
    '<button type="submit" id="contact-submit-btn" class="contact-submit-btn">ارسال</button>' +
    '</div>' +
    '</form>' +
    '</div>' +
    '<div id="contact-success-state" class="contact-success-state" role="status" aria-live="polite" hidden>' +
    '<div class="contact-success-badge" aria-hidden="true">' +
    checkIcon +
    '</div>' +
    '<p class="contact-success-text">تم إرسال رسالتك. سنرد عليك قريبًا.</p>' +
    '<button type="button" id="contact-reset-btn" class="contact-reset-btn">إرسال رسالة أخرى</button>' +
    '</div>' +
    '</div>' +
    '<div class="contact-photo-card contact-reveal">' +
    '<div class="contact-photo-frame">' +
    '<div class="contact-photo-fallback" aria-hidden="true">' +
    '<img src="' +
    esc(resolveBaseAssetUrl('./assets/aistudio/logo_ebd6693e.webp')) +
    '" alt="" width="272" height="112" loading="lazy" decoding="async" onerror="window.__safarytiLogoFallback&&window.__safarytiLogoFallback(this,true)">' +
    '</div>' +
    photoImgHtml +
    '<div class="contact-photo-scrim" aria-hidden="true"></div>' +
    '</div>' +
    '<aside class="contact-details-panel on-dark" aria-label="التفاصيل">' +
    '<h3 class="contact-details-title">التفاصيل</h3>' +
    '<div class="contact-details-list">' +
    '<div class="contact-detail-row">' +
    pinIcon +
    '<div class="contact-detail-body">' +
    '<span class="contact-detail-label">العنوان:</span>' +
    '<span class="contact-detail-val"><bdi dir="ltr">' +
    esc(CONFIG.address) +
    '</bdi></span>' +
    '</div>' +
    '</div>' +
    '<div class="contact-detail-row">' +
    phoneIcon +
    '<div class="contact-detail-body">' +
    '<span class="contact-detail-label">الموبايل:</span>' +
    '<span class="contact-detail-val"><a href="tel:' +
    esc(phoneTel) +
    '" class="contact-detail-link tabular"><bdi dir="ltr">' +
    esc(phoneDisplay) +
    '</bdi></a></span>' +
    '</div>' +
    '</div>' +
    '<div class="contact-detail-row">' +
    mailIcon +
    '<div class="contact-detail-body">' +
    '<span class="contact-detail-label">البريد:</span>' +
    '<span class="contact-detail-val"><a href="mailto:' +
    esc(CONFIG.email) +
    '" class="contact-detail-link"><bdi dir="ltr">' +
    esc(CONFIG.email) +
    '</bdi></a></span>' +
    '</div>' +
    '</div>' +
    '<div class="contact-social-row">' +
    '<span class="contact-detail-label">تابعنا على:</span>' +
    '<div class="contact-social-list">' +
    '<a href="' +
    esc(CONFIG.social.facebook) +
    '" target="_blank" rel="noopener" class="contact-social-circle" aria-label="فيسبوك">' +
    socialSvg('facebook') +
    '</a>' +
    '<a href="' +
    esc(CONFIG.social.x) +
    '" target="_blank" rel="noopener" class="contact-social-circle" aria-label="إكس">' +
    socialSvg('x') +
    '</a>' +
    '<a href="' +
    esc(CONFIG.social.instagram) +
    '" target="_blank" rel="noopener" class="contact-social-circle" aria-label="إنستجرام">' +
    socialSvg('instagram') +
    '</a>' +
    '<a href="' +
    esc(CONFIG.social.linkedin) +
    '" target="_blank" rel="noopener" class="contact-social-circle" aria-label="لينكد ان">' +
    socialSvg('linkedin') +
    '</a>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</aside>' +
    '</div>' +
    '</div>' +
    '</section>';

  activateAdSlots(main);

  const contactPhotoImg = document.getElementById('contact-photo-img');
  if (contactPhotoImg) {
    contactPhotoImg.addEventListener(
      'error',
      () => {
        contactPhotoImg.hidden = true;
      },
      { once: true }
    );
  }
  function wireFlagFallbacks(scope) {
    scope.querySelectorAll('.cf-flag-img').forEach((imgEl) => {
      if (imgEl.dataset.fallbackWired) return;
      imgEl.dataset.fallbackWired = '1';
      const replaceWithChip = () => {
        const chip = document.createElement('span');
        chip.className = 'cf-flag-chip';
        chip.textContent = imgEl.getAttribute('data-iso') || 'EG';
        if (imgEl.parentNode) imgEl.parentNode.replaceChild(chip, imgEl);
      };
      imgEl.addEventListener('error', replaceWithChip, { once: true });
      if (imgEl.complete && imgEl.naturalWidth === 0) replaceWithChip();
    });
  }
  wireFlagFallbacks(main);

  const revealEls = Array.prototype.slice.call(main.querySelectorAll('.contact-reveal'));
  if (isReducedMotion() || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => {
      el.classList.add('is-revealed');
    });
  } else {
    const revObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            revObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    revealEls.forEach((el) => {
      revObs.observe(el);
    });
    registerCleanup(() => {
      revObs.disconnect();
    });
  }

  const form = document.getElementById('contact-form');
  const formWrap = document.getElementById('contact-form-wrap');
  const successState = document.getElementById('contact-success-state');
  const resetBtn = document.getElementById('contact-reset-btn');
  const phoneShell = document.getElementById('cf-phone-shell');
  const msgEl = document.getElementById('cf-message');
  const charCounter = document.getElementById('cf-char-counter');
  const hpInput = document.getElementById('cf-website');

  const fields = [
    { key: 'name', input: document.getElementById('cf-name'), err: document.getElementById('err-name'), required: true },
    { key: 'phone', input: document.getElementById('cf-phone'), err: document.getElementById('err-phone'), required: true },
    { key: 'email', input: document.getElementById('cf-email'), err: document.getElementById('err-email'), required: false },
    { key: 'message', input: msgEl, err: document.getElementById('err-message'), required: true },
  ];

  function syncFloatState(inputEl) {
    const wrap = inputEl.closest('[data-float-field]');
    if (!wrap) return;
    wrap.classList.toggle('has-value', inputEl.value.length > 0);
  }

  function updateCharCounter() {
    const len = Math.min(500, msgEl.value.length);
    if (msgEl.value.length > 500) msgEl.value = msgEl.value.slice(0, 500);
    charCounter.textContent = len + ' / 500';
    charCounter.classList.toggle('is-warn', len > 480);
  }

  function clearFieldError(f) {
    f.err.textContent = '';
    f.err.hidden = true;
    f.input.removeAttribute('aria-invalid');
    f.input.removeAttribute('aria-describedby');
    if (f.key === 'phone' && phoneShell) phoneShell.classList.remove('is-invalid');
  }

  fields.forEach((f) => {
    syncFloatState(f.input);
    f.input.addEventListener('input', () => {
      syncFloatState(f.input);
      if (f.key === 'message') updateCharCounter();
      if (f.input.getAttribute('aria-invalid') === 'true') {
        clearFieldError(f);
      }
    });
    f.input.addEventListener('change', () => {
      syncFloatState(f.input);
    });
  });
  updateCharCounter();

  const countryBtn = document.getElementById('cf-country-btn');
  const countryListbox = document.getElementById('cf-country-listbox');
  const countryFlagSlot = document.getElementById('cf-country-flag');
  const countryDialSlot = document.getElementById('cf-country-dial');
  const countryOptionEls = Array.prototype.slice.call(countryListbox.querySelectorAll('[role="option"]'));
  let focusedOptIdx = 0;

  function setSelectedCountry(iso) {
    const found = ARAB_COUNTRIES.filter((c) => c.iso === iso)[0] || ARAB_COUNTRIES[0];
    selectedCountry = found;
    countryFlagSlot.innerHTML = renderFlagHtml(found.iso);
    wireFlagFallbacks(countryFlagSlot);
    countryDialSlot.innerHTML = '<bdi dir="ltr">' + esc(found.dial) + '</bdi>';
    document.getElementById('cf-phone').setAttribute('placeholder', found.dial + ' 000 000 0000');
    countryOptionEls.forEach((opt, idx) => {
      const isMatch = opt.getAttribute('data-country-iso') === found.iso;
      opt.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      if (isMatch) focusedOptIdx = idx;
    });
  }

  function highlightOption(idx) {
    focusedOptIdx = (idx + countryOptionEls.length) % countryOptionEls.length;
    countryOptionEls.forEach((opt, i) => {
      opt.classList.toggle('is-focused', i === focusedOptIdx);
    });
    const activeOpt = countryOptionEls[focusedOptIdx];
    if (activeOpt) {
      countryListbox.setAttribute('aria-activedescendant', activeOpt.id);
      activeOpt.scrollIntoView({ block: 'nearest' });
    }
  }

  function closeCountryList(returnFocus) {
    countryListbox.hidden = true;
    countryBtn.setAttribute('aria-expanded', 'false');
    countryOptionEls.forEach((opt) => {
      opt.classList.remove('is-focused');
    });
    if (returnFocus) countryBtn.focus();
  }

  function openCountryList() {
    countryListbox.hidden = false;
    countryBtn.setAttribute('aria-expanded', 'true');
    highlightOption(focusedOptIdx);
  }

  countryBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (countryListbox.hidden) openCountryList();
    else closeCountryList(false);
  });

  countryBtn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (countryListbox.hidden) {
        openCountryList();
      } else {
        highlightOption(focusedOptIdx + (e.key === 'ArrowDown' ? 1 : -1));
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (!countryListbox.hidden) {
        e.preventDefault();
        const opt = countryOptionEls[focusedOptIdx];
        if (opt) setSelectedCountry(opt.getAttribute('data-country-iso'));
        closeCountryList(true);
      }
    } else if (e.key === 'Escape' && !countryListbox.hidden) {
      e.preventDefault();
      closeCountryList(true);
    }
  });

  countryOptionEls.forEach((opt) => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      setSelectedCountry(opt.getAttribute('data-country-iso'));
      closeCountryList(true);
    });
  });

  function onDocClick(e) {
    if (!countryListbox.hidden && !phoneShell.contains(e.target)) {
      closeCountryList(false);
    }
  }
  document.addEventListener('click', onDocClick);

  let successTimer = null;
  function showSuccessState() {
    if (isReducedMotion()) {
      formWrap.hidden = true;
      successState.hidden = false;
      successState.classList.add('is-visible');
      resetBtn.focus();
      return;
    }
    formWrap.classList.add('is-fading-out');
    clearTimeout(successTimer);
    successTimer = window.setTimeout(() => {
      formWrap.hidden = true;
      formWrap.classList.remove('is-fading-out');
      successState.hidden = false;
      requestAnimationFrame(() => {
        successState.classList.add('is-visible');
        resetBtn.focus();
      });
    }, 190);
  }

  registerCleanup(() => {
    document.removeEventListener('click', onDocClick);
    clearTimeout(successTimer);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (hpInput && hpInput.value.trim()) {
      showSuccessState();
      return;
    }
    let firstInvalid = null;

    fields.forEach((f) => {
      const val = f.input.value.trim();
      let msg = '';
      if (f.required && !val) {
        msg = 'هذا الحقل مطلوب';
      } else if (f.key === 'email' && val && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val)) {
        msg = 'أدخل بريدًا إلكترونيًا صحيحًا';
      }
      if (msg) {
        f.err.textContent = msg;
        f.err.hidden = false;
        f.input.setAttribute('aria-invalid', 'true');
        f.input.setAttribute('aria-describedby', f.err.id);
        if (f.key === 'phone' && phoneShell) phoneShell.classList.add('is-invalid');
        if (!firstInvalid) firstInvalid = f.input;
      } else {
        clearFieldError(f);
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    showSuccessState();
  });

  resetBtn.addEventListener('click', () => {
    form.reset();
    setSelectedCountry('eg');
    fields.forEach((f) => {
      clearFieldError(f);
      syncFloatState(f.input);
    });
    updateCharCounter();
    successState.classList.remove('is-visible');
    successState.hidden = true;
    formWrap.hidden = false;
    document.getElementById('cf-name').focus();
  });

  return 'تواصل معنا | سفريتي';
}
