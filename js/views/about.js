import '../../css/routes/about.css';
import { CONFIG } from '../config.js';
import { getState, setState, registerCleanup } from '../store.js';
import { esc, isReducedMotion, renderPictureHtml } from '../utils.js';
import { measureAboutTravelers, toWebpUrl, toBgImageSetCss } from '../utils/viewHelpers.js';
import { renderAdSlotHtml, activateAdSlots } from '../components/adSlots.js';
import { updateScrollEffects } from '../scrollController.js';

export function renderAbout(main) {
  if (typeof window !== 'undefined') window.__safarytiMeasureAbout = measureAboutTravelers;
  const imgs = CONFIG.about.images;
  const statementWords = [
    { text: 'اكتشف', accent: false },
    { text: 'العالم', accent: false },
    { text: 'معنا', accent: false },
    { text: 'في', accent: false },
    { text: 'رحلة', accent: true },
    { text: 'بلا', accent: true },
    { text: 'حدود', accent: true },
  ];
  const statementHtml = statementWords
    .map((w, idx) => {
      const cls = 'about-word' + (w.accent ? ' about-scatter-accent' : '');
      return '<span class="' + cls + '" style="--wi:' + idx + ';">' + esc(w.text) + '</span>';
    })
    .join(' ');

  const blockAText =
    'هنا ستبدأ مغامراتكم وتنتهي بذكريات لا تُنسى. نحن فريق من عشاق السفر والمغامرات، نهدف إلى تقديم محتوى ثري وملهم لكل من يسعى لاكتشاف جمال هذا العالم الواسع. موقعنا هو دليلك الشامل لكل ما يخص السفر، ويحتوي على معلومات متنوعة حول مختلف الدول والقارات، فضلاً عن الأنشطة المثيرة وحيل السفر المفيدة. ستجدون مقالات مميزة تستكشف وجهات سياحية رائعة من المدن العالمية الشهيرة وصولاً إلى الأماكن المخفية التي تنتظر من يكتشفها. نقدم لكم نصائح قيمة وحيل ذكية للسفر تساعدكم على التوفير والاستمتاع برحلتكم إلى أقصى حد، سواء كنتم تخططون لرحلة اقتصادية أو مغامرة فاخرة. نغطي في موقعنا جميع أنواع الأنشطة، من مغامرات في الهواء الطلق ورياضات مائية، إلى جولات طعام ثقافية وتجارب محلية فريدة. نحن هنا لنقدم لكم أدلة شاملة لكل ما تحتاجونه، من أفضل أماكن الإقامة والمطاعم، إلى نصائح الأمان والتعبئة للسفر.';
  const calloutAText =
    'نتطلع لمشاركة شغفنا معكم من خلال تقديم تجارب ونصائح مفيدة، ووجهات غير تقليدية، وسواء كنتم تحلمون برحلات فاخرة، أو تبحثون عن مغامرات اقتصادية، نحن هنا لنرشدكم لاستكشاف جمال هذا العالم الواسع، ونجعل من كل رحلة قصة تُروى!';
  const blockBText =
    'قررنا أن نترك وراءنا روتين الحياة اليومية وننطلق لاستكشاف هذا الكوكب الرائع. عبرنا القارات، وزرنا المدن الكبيرة والقرى الصغيرة، وتسلقنا الجبال وغصنا في أعماق المحيطات. من صحارى إفريقيا إلى غابات الأمازون الكثيفة، ومن شواطئ البحر الكاريبي الخلابة إلى جبال الهيمالايا الشاهقة، لم نترك مكانًا إلا واستكشفناه. خلال رحلاتنا، جمعنا تجارب لا تُنسى، والتقينا بأشخاص رائعين، واكتشفنا ثقافات جديدة ومأكولات متنوعة. لم نكتفِ بزيارة الأماكن الشهيرة فقط، بل غامرنا إلى الأماكن المخفية التي لا يعرفها الكثيرون، وجمعنا قصصًا وحكايات تنتظر من يكتشفها. اليوم، نقدم لكم في موقع سفريتي خلاصة هذه الرحلات والمغامرات. هدفنا هو أن نلهمكم بطريقتنا الخاصة، ونقدم لكم المعلومات والنصائح التي تحتاجونها لجعل كل رحلة تجربة فريدة، سواء كنتم تخططون لرحلة سياحية تقليدية أو مغامرة غير تقليدية، نحن هنا لنقدم لكم كل ما تحتاجونه من معلومات، من أفضل الوجهات وأروع الأنشطة إلى حيل السفر والنصائح القيمة.';
  const calloutBText =
    'انضموا إلينا، ودعونا نكتشف العالم معًا. لأن كل رحلة تبدأ بحلم، ونحن هنا لنساعدكم على تحقيقه.';

  const heroBgUrl =
    typeof document !== 'undefined' && document.baseURI
      ? new URL(imgs.hero.src, document.baseURI).href
      : imgs.hero.src;

  main.innerHTML =
    '<div class="about-page">' +
    '<section id="about-hero-band" class="about-hero-band on-dark no-auto-ads" aria-label="من نحن" style="--about-hero-bg:' +
    toBgImageSetCss(heroBgUrl) +
    '">' +
    '<div class="container about-hero-grid">' +
    '<div class="about-hero-main">' +
    '<h1 class="about-hero-title no-auto-ads" tabindex="-1">من نحن</h1>' +
    '<nav class="breadcrumb about-hero-breadcrumb" aria-label="مسار التنقل"><a href="#home">الرئيسية</a><span aria-hidden="true">›</span><span>من نحن</span></nav>' +
    '</div>' +
    renderAdSlotHtml('AD-TB', { wrapCls: 'is-tb', frameCls: 'is-tb', immediate: true }) +
    '</div>' +
    '</section>' +
    '<section class="about-scatter-wrapper" id="about-scatter-wrapper">' +
    '<div class="about-scatter-stage" id="about-scatter-stage">' +
    '<div class="about-scatter-tiles" aria-hidden="true">' +
    '<div class="about-tile-anchor about-anchor-wing" id="about-anchor-wing"></div>' +
    '<div class="about-tile-anchor about-anchor-temple" id="about-anchor-temple"></div>' +
    '</div>' +
    '<div class="about-scatter-copy" id="about-scatter-copy">' +
    '<p class="about-scatter-label">من نحن</p>' +
    '<h2 class="about-scatter-h2 no-auto-ads" id="about-scatter-h2">' +
    statementHtml +
    '</h2>' +
    '<p class="about-scatter-sub">هل تعشق السفر؟ إذًا أنت في المكان الصحيح!</p>' +
    '</div>' +
    '</div>' +
    '</section>' +
    '<section class="about-story-section" id="about-story-section">' +
    '<div class="container about-story-stack">' +
    '<div class="about-story-block" data-about-reveal>' +
    '<div class="about-story-media-wrap">' +
    '<div class="about-story-photo is-temple" id="about-photo-a">' +
    renderPictureHtml(imgs.temple.src, {
      alt: imgs.temple.alt,
      decoding: 'async',
      sizes: '(min-width: 1024px) 400px, 90vw',
    }) +
    '</div>' +
    '<aside class="about-callout-card" aria-label="رسالة سفريتي"><p>' +
    esc(calloutAText) +
    '</p></aside>' +
    '</div>' +
    '<div class="about-story-prose"><p>' +
    esc(blockAText) +
    '</p></div>' +
    '</div>' +
    '<div class="about-story-block is-mirrored" data-about-reveal>' +
    '<div class="about-story-media-wrap">' +
    '<div class="about-story-photo is-wing" id="about-photo-b">' +
    renderPictureHtml(imgs.wing.src, {
      alt: imgs.wing.alt,
      decoding: 'async',
      sizes: '(min-width: 1024px) 400px, 90vw',
    }) +
    '</div>' +
    '<aside class="about-callout-card" aria-label="انضموا إلينا"><p>' +
    esc(calloutBText) +
    '</p></aside>' +
    '</div>' +
    '<div class="about-story-prose"><p>' +
    esc(blockBText) +
    '</p></div>' +
    '</div>' +
    '</div>' +
    '</section>' +
    '</div>';

  activateAdSlots(main);

  [imgs.temple.src, imgs.wing.src].forEach((src) => {
    const preImg = new Image();
    preImg.src = toWebpUrl(src);
  });

  const oldTravelers = document.getElementById('about-travelers');
  if (oldTravelers && oldTravelers.parentNode) oldTravelers.parentNode.removeChild(oldTravelers);
  const travelersLayer = document.createElement('div');
  travelersLayer.id = 'about-travelers';
  travelersLayer.className = 'about-travelers';
  travelersLayer.setAttribute('aria-hidden', 'true');
  travelersLayer.innerHTML =
    '<div class="about-traveler about-traveler-wing" id="about-traveler-wing">' +
    '<div class="about-traveler-inner">' +
    renderPictureHtml(imgs.wing.src, { alt: '', decoding: 'async', sizes: '400px' }) +
    '</div>' +
    '</div>' +
    '<div class="about-traveler about-traveler-temple" id="about-traveler-temple">' +
    '<div class="about-traveler-inner">' +
    renderPictureHtml(imgs.temple.src, { alt: '', decoding: 'async', sizes: '400px' }) +
    '</div>' +
    '</div>';
  document.body.appendChild(travelersLayer);

  measureAboutTravelers();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (getState().currentView === 'about') {
        measureAboutTravelers();
        updateScrollEffects();
      }
    });
  }

  let aboutResizeTimer = null;
  function onAboutResize() {
    clearTimeout(aboutResizeTimer);
    aboutResizeTimer = setTimeout(() => {
      if (getState().currentView === 'about') {
        measureAboutTravelers();
        updateScrollEffects();
      }
    }, 150);
  }
  window.addEventListener('resize', onAboutResize, { passive: true });
  registerCleanup(() => {
    clearTimeout(aboutResizeTimer);
    window.removeEventListener('resize', onAboutResize);
    if (travelersLayer && travelersLayer.parentNode) {
      travelersLayer.parentNode.removeChild(travelersLayer);
    }
    setState({ aboutTravelerMetrics: null });
  });

  const followBtn = document.getElementById('about-follow-btn');
  const socialTray = document.getElementById('about-social-tray');
  if (followBtn && socialTray) {
    followBtn.addEventListener('click', () => {
      const isOpen = socialTray.hidden;
      socialTray.hidden = !isOpen;
      followBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  const scatterH2 = document.getElementById('about-scatter-h2');
  const storyBlocks = Array.prototype.slice.call(main.querySelectorAll('[data-about-reveal]'));

  if (isReducedMotion() || !('IntersectionObserver' in window)) {
    if (scatterH2) scatterH2.classList.add('is-revealed');
    storyBlocks.forEach((b) => {
      b.classList.add('is-revealed');
    });
    const storySecStatic = document.getElementById('about-story-section');
    if (storySecStatic) {
      storySecStatic.classList.remove('is-flying');
      storySecStatic.classList.add('is-landed');
    }
  } else {
    if (scatterH2) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (scatterH2) scatterH2.classList.add('is-revealed');
        });
      });
    }

    if (storyBlocks.length) {
      const storyIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              storyIo.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
      );
      storyBlocks.forEach((b) => {
        storyIo.observe(b);
      });
      registerCleanup(() => {
        storyIo.disconnect();
      });
    }
  }

  return 'من نحن | سفريتي';
}
