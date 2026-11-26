import '../../css/routes/inner-shared.css';
import '../../css/routes/privacy.css';
import { IMG } from '../config.js';
import { esc, isDesktopViewport } from '../utils.js';
import { PRIVACY_DATA } from '../data/privacyData.js';
import { activateAdSlots } from '../components/adSlots.js';
import { renderInnerHeaderHtml } from '../components/innerHeader.js';

export function renderPrivacy(main) {
  const secs = PRIVACY_DATA.sections;
  const isDesktop = isDesktopViewport();
  const bodyHtml = secs
    .map((s, i) => {
      const id = 'priv-' + (i + 1);
      if (isDesktop) {
        return '<section id="' + id + '" class="privacy-section"><h2 class="t-h3" style="margin-bottom:.65rem;">' + esc(s.title) + '</h2><p>' + esc(s.body) + '</p></section>';
      }
      return (
        '<section id="' +
        id +
        '" class="privacy-section"><details class="privacy-details" open><summary>' +
        esc(s.title) +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></summary><p style="margin-top:.6rem;">' +
        esc(s.body) +
        '</p></details></section>'
      );
    })
    .join('');

  main.innerHTML =
    renderInnerHeaderHtml({
      bgImage: IMG.heroBackdrop,
      leftHtml:
        '<h1 class="t-h1 no-auto-ads" tabindex="-1">سياسة الخصوصية</h1>' +
        '<nav class="breadcrumb" aria-label="مسار التنقل"><a href="#home">الرئيسية</a><span aria-hidden="true">›</span><span>سياسة الخصوصية</span></nav>',
    }) +
    '<div class="container split-layout is-privacy">' +
    '<div class="privacy-prose no-auto-ads">' +
    bodyHtml +
    '</div>' +
    '</div>';

  activateAdSlots(main);
  return 'سياسة الخصوصية | سفريتي';
}
