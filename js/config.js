import { resolveHashedAssetPath } from './assetMap.js';

export const LOGO_SVG =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='170' height='70' viewBox='0 0 170 70'>" +
      "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='#e93314'/><stop offset='100%' stop-color='#ff6f3c'/></linearGradient></defs>" +
      "<path d='M118 14c22-6 42 4 44 21 2 15-11 27-29 27-14 0-26-7-29-17 7 5 17 7 26 4 11-4 17-14 14-23-3-8-14-12-26-12z' fill='url(#g)'/>" +
      "<path d='M124 27l22-8-8 20-5-7-9-5z' fill='#ffffff'/>" +
      "<text x='98' y='45' text-anchor='end' font-family='Cairo,Tahoma,Arial,sans-serif' font-size='30' font-weight='700' fill='#292929'>سفريتي</text>" +
      '</svg>'
  );

export const LOGO_LIGHT_SVG =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='170' height='70' viewBox='0 0 170 70'>" +
      "<defs><linearGradient id='gl' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='#e93314'/><stop offset='100%' stop-color='#ff6f3c'/></linearGradient></defs>" +
      "<path d='M118 14c22-6 42 4 44 21 2 15-11 27-29 27-14 0-26-7-29-17 7 5 17 7 26 4 11-4 17-14 14-23-3-8-14-12-26-12z' fill='url(#gl)'/>" +
      "<path d='M124 27l22-8-8 20-5-7-9-5z' fill='#ffffff'/>" +
      "<text x='98' y='45' text-anchor='end' font-family='Cairo,Tahoma,Arial,sans-serif' font-size='30' font-weight='700' fill='#ffffff'>سفريتي</text>" +
      '</svg>'
  );

export const DB_LOGO_SVG =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='140' height='40' viewBox='0 0 140 40'>" +
      "<circle cx='16' cy='20' r='10' fill='#e93314'/>" +
      "<text x='34' y='25' font-family='Cairo,Tahoma,Arial,sans-serif' font-size='15' font-weight='700' fill='#ffffff'>Digital Bond</text>" +
      '</svg>'
  );

export const IMG = {
  suez: './src/assets/images/hero_suez_canal_1794996466961.jpg',
  marsa: './src/assets/images/hero_marsa_alam_1794996468348.jpg',
  taba: './src/assets/images/hero_taba_citadel_1794996468396.jpg',
  expand: './src/assets/images/expand_horizon_road_1794996468234.jpg',
  asia: './src/assets/images/region_asia_landscape_1794996469512.jpg',
  europe: './src/assets/images/region_europe_alpine_1794996469940.jpg',
  na: './src/assets/images/region_americas_canyon_1794996470001.jpg',
  sa: './src/assets/images/region_south_america_andes_1794996469994.jpg',
  oceania: './src/assets/images/region_oceania_coast_1794996470039.jpg',
  pyramids: './src/assets/images/fact_giza_pyramids_1794996471282.jpg',
  sphinx: './src/assets/images/fact_giza_sphinx_1794996471257.jpg',
  pillars: './src/assets/images/about_temple_pillars_1794996471329.jpg',
  heroAd1: './src/assets/images/hero_ad_resort_1795088419124.jpg',
  heroAd2: './src/assets/images/hero_ad_lodge_1795088418758.jpg',
  heroBackdrop: './src/assets/images/hero_zone_backdrop_1795088843394.jpg',
  aboutWing: './src/assets/images/about_airplane_wing_1795352381013.jpg',
  aboutHeroPlane: './src/assets/images/about_plane_sunset_roof_1795352382468.jpg',
  skyImage: './src/assets/images/about_sunset_sky_1795352381897.jpg',
  skyImage2: './src/assets/images/about_warm_clouds_1795352383366.jpg',
  foodSudanese: './src/assets/images/food_sudanese_cuisine_1795420971980.jpg',
  foodWorld: './src/assets/images/food_world_cuisines_1795420971675.jpg',
  foodEgyptian: './src/assets/images/food_egyptian_street_1795420971065.jpg',
};

export function resolveBaseAssetUrl(relPath) {
  if (!relPath) return '';
  const resolved = resolveHashedAssetPath(relPath);
  if (typeof document !== 'undefined' && document.baseURI) {
    return new URL(resolved, document.baseURI).href;
  }
  return resolved;
}

export const CONFIG = {
  assets: {
    logo: resolveBaseAssetUrl('./assets/aistudio/logo_ebd6693e.png'),
    logoLight: LOGO_LIGHT_SVG,
    favicon: resolveBaseAssetUrl('./favicon.svg'),
    expandImage: IMG.expand,
    skyImage: IMG.skyImage,
    skyImage2: IMG.skyImage2,
    dbLogo: resolveBaseAssetUrl('./assets/aistudio/1111_f9de6c5d.png'),
  },
  ads: {
    adsenseClient: '',
    autoFormats: false,
    'AD-SKY-L':   { type: 'direct', src: './partners/fourseasons-tall.svg', href: '#contact', alt: 'إعلان Four Seasons Private Residences Baltimore', slot: '' },
    'AD-SKY-R':   { type: 'direct', src: './partners/fourseasons-tall.svg', href: '#contact', alt: 'إعلان منتجعات فور سيزونز', slot: '' },
    'AD-STICKY':  { type: 'direct', src: './partners/digitalbond-card.svg', href: '#contact', alt: 'تريد زيادة أرباح مشروعك؟ احجز المساحة الإعلانية', slot: '' },
    'AD-H1':      { type: 'direct', src: './partners/redsea-resort.jpg',    href: '#contact', alt: 'إقامات ومنتجعات ساحلية فاخرة على البحر الأحمر', slot: '' },
    'AD-H2':      { type: 'direct', src: './partners/oasis-lodge.jpg',      href: '#contact', alt: 'تجارب إقامة صحراوية فاخرة في الواحات المصرية', slot: '' },
    'AD-H3':      { type: 'direct', src: './partners/redsea-wide.svg',      href: '#contact', alt: 'عطلات فاخرة على شواطئ الجونة ومرسى علم', slot: '' },
    'AD-H4':      { type: 'direct', src: './partners/hilton-card.svg',      href: '#contact', alt: 'إعلان فنادق هيلتون', slot: '' },
    'AD-H5':      { type: 'direct', src: './partners/fourseasons-card.svg', href: '#contact', alt: 'إعلان فنادق ومنتجعات فور سيزونز', slot: '' },
    'AD-SB-HALF': { type: 'direct', src: './partners/hilton-card.svg',      href: '#contact', alt: 'إعلان فنادق هيلتون', slot: '' },
    'AD-TB':      { type: 'direct', src: './partners/luxor-wide.svg',       href: '#contact', alt: 'رحلات النيل الفاخرة بين الأقصر وأسوان', slot: '' },
    'AD-BB':      { type: 'direct', src: './partners/suez-billboard.svg',   href: '#contact', alt: 'عروض الطيران والإقامة الموسمية حول العالم', slot: '' },
    'AD-SB1':     { type: 'direct', src: './partners/marriott-card.svg',    href: '#contact', alt: 'إعلان فنادق ماريوت', slot: '' },
    'AD-A1':      { type: 'direct', src: './partners/fourseasons-card.svg', href: '#contact', alt: 'فخامة الإقامة على البحر الأحمر - فور سيزونز', slot: '' },
    'AD-A2':      { type: 'direct', src: './partners/nile-strip.svg',       href: '#contact', alt: 'عروض المسافرين من ماريوت بونفوي', slot: '' },
  },
  // TODO: confirm the final phone, WhatsApp number, email domain and legal entity
  whatsapp: '201021551322',
  email: 'takeoff@musaferist.com',
  phone: '00201021551322',
  address: '11 Ahmed Al Shatouri, Ad Doqi, Giza, Egypt',
  formEndpoint: 'https://api.safaryti.example/contact',
  contact: {
    image: './src/assets/images/contact_temple_traveler_1795429682873.jpg',
    imageAlt: 'مسافر يعبر بوابة معبد',
    phoneDisplay: '+20 102 155 1322',
    phoneTel: '+201021551322',
  },
  social: {
    facebook: 'https://facebook.com',
    x: 'https://x.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
  },
  stories: [
    { id: 'suez-landmarks', title: 'معالم السويس السياحية', category: 'إفريقيا', date: '2026-11-16', views: 6348, excerpt: 'خطط لرحلتك إلى السويس واستكشف أشهر المعالم السياحية والشواطئ والحدائق، وأفضل الأماكن المناسبة للعائلات ومحبي الطبيعة.', image: IMG.suez, href: '#article/suez-landmarks' },
    { id: 'medical-egypt', title: 'السياحة العلاجية في مصر', category: 'إفريقيا', date: '2026-11-16', views: 5817, excerpt: 'تعرف على أفضل أماكن السياحة العلاجية في مصر، من حمامات فرعون وسيوة إلى سفاجا والواحات البحرية، وأبرز التجارب الطبيعية والاستشفائية.', image: IMG.pillars, href: '#article/medical-egypt' },
    { id: 'samadai-marsa', title: 'محمية صمداي مرسى علم', category: 'إفريقيا', date: '2026-11-16', views: 7720, excerpt: 'خطط لرحلتك إلى بيت الدلافين في مرسى علم، واستمتع بمشاهدة الدلافين والشعاب المرجانية، واكتشف أفضل وقت للزيارة وطريقة الوصول.', image: IMG.marsa, href: '#article/samadai-marsa' },
    { id: 'saladin-taba', title: 'قلعة صلاح الدين طابا', category: 'إفريقيا', date: '2026-11-16', views: 5585, excerpt: 'اكتشف قلعة صلاح الدين طابا بجزيرة فرعون، وتعرّف على بنائها وموقعها وأبرز معالمها الأثرية، مع معلومات عن مواعيد الزيارة وطريقة الوصول.', image: IMG.taba, href: '#article/saladin-taba' },
    { id: 'galala-sokhna', title: 'جبل الجلالة العين السخنة', category: 'إفريقيا', date: '2026-11-15', views: 8128, excerpt: 'هل تبحث عن وجهة تجمع بين الجبال والبحر؟ تعرّف على جبل الجلالة العين السخنة وأهم معالمه والأنشطة التي يمكنك الاستمتاع بها.', image: IMG.expand, href: '#article/galala-sokhna' },
    { id: 'sokhna-healing', title: 'السياحة العلاجية في العين السخنة', category: 'إفريقيا', date: '2026-11-15', views: 7126, excerpt: 'خطط لرحلة استشفاء في العين السخنة، واستكشف الينابيع الكبريتية والمناطق الطبيعية والمنتجعات الصحية، مع معلومات عن الإقامة وأفضل وقت للزيارة.', image: IMG.suez, href: '#article/sokhna-healing' },
    { id: 'giftun-hurghada', title: 'جزيرة الجفتون الغردقة', category: 'إفريقيا', date: '2026-11-15', views: 5093, excerpt: 'خطط لرحلتك إلى جزيرة الجفتون في الغردقة، واكتشف شواطئ أورانج باي وباراديس ومحمية، مع معلومات عن القوارب والأنشطة البحرية.', image: IMG.marsa, href: '#article/giftun-hurghada' },
    { id: 'soho-sharm', title: 'ميدان سوهو شرم الشيخ', category: 'إفريقيا', date: '2026-11-15', views: 1585, excerpt: 'اكتشف ميدان سوهو شرم الشيخ، واستمتع بالنافورة الراقصة والمطاعم والمقاهي والتسوق والتزلج على الجليد، وتعرّف على أبرز الأنشطة ونصائح الزيارة.', image: IMG.taba, href: '#article/soho-sharm' },
    { id: 'nabq-sharm', title: 'محمية نبق شرم الشيخ', category: 'إفريقيا', date: '2026-11-12', views: 6870, excerpt: 'اكتشف محمية نبق شرم الشيخ، واستمتع بغابات المانجروف والشواطئ والشعاب المرجانية، وتعرّف على أشهر المعالم والأنشطة وأسعار الدخول.', image: IMG.oceania, href: '#article/nabq-sharm' },
    { id: 'white-island-sharm', title: 'الجزيرة البيضاء شرم الشيخ', category: 'إفريقيا', date: '2026-11-12', views: 6780, excerpt: 'دليل لزيارة الجزيرة البيضاء شرم الشيخ يشمل تفاصيل الرحلات البحرية والغوص والسنوركلينج، وأهم النصائح للاستمتاع بتجربة مميزة.', image: IMG.marsa, href: '#article/white-island-sharm' },
    // TODO: real photo per story (image rights)
    { id: 'sudanese-food', title: 'اسماء أكلات سودانية مشهورة', category: 'المأكولات العالمية', theme: 'food', date: '2024-10-22', views: 33351, excerpt: 'تعرّف على أشهر الأطباق السودانية التقليدية ونكهاتها الأصيلة المتوارثة.', image: IMG.foodSudanese, href: '#article/sudanese-food' },
    { id: 'world-cuisines', title: 'اليك اشهر الماكولات في العالم', category: 'المأكولات العالمية', theme: 'food', date: '2024-09-19', views: 31965, excerpt: 'رحلة بين مطابخ العالم لاكتشاف الأطباق الأشهر وتجارب الطعام المحلية.', image: IMG.foodWorld, href: '#article/world-cuisines' },
    { id: 'egyptian-food', title: 'تعرف على اشهر الاكلات الشعبية المصرية', category: 'المأكولات العالمية', theme: 'food', date: '2024-09-03', views: 28960, excerpt: 'من الكشري والفول إلى الأطباق الريفية الأصيلة في شوارع مصر.', image: IMG.foodEgyptian, href: '#article/egyptian-food' },
    { id: 'world-heritage', title: 'تعرف على الشعوب الغنية بالتراث والتقاليد حول العالم', category: 'التراث والتقاليد', theme: 'heritage', date: '2024-07-03', views: 14933, excerpt: 'قصص مجتمعات حافظت على عاداتها وفنونها عبر الأجيال.', image: IMG.pillars, href: '#article/world-heritage' },
    { id: 'smart-booking-guide', title: 'كيف تحجز تذاكر الطيران والفنادق بأفضل سعر؟', category: 'نصائح السفر', theme: 'tips', sub: 'trip-planning', isTip: true, date: '2024-10-18', views: 19420, excerpt: 'استراتيجيات عملية لتحديد توقيت الحجز المثالي وتجنب الرسوم الخفية عند التخطيط لرحلتك.', image: IMG.aboutHeroPlane, href: '#article/smart-booking-guide' },
    { id: 'packing-checklist', title: 'دليل تجهيز حقيبة السفر المثالية لأي وجهة', category: 'نصائح السفر', theme: 'tips', sub: 'trip-planning', isTip: true, date: '2024-09-25', views: 16840, excerpt: 'قائمة ذكية لترتيب المستندات والملابس والأجهزة دون وزن زائد في المطار.', image: IMG.expand, href: '#article/packing-checklist' },
    { id: 'public-transport-tips', title: 'التنقل داخل المدن الكبرى: بطاقات المواصلات والقطارات', category: 'نصائح السفر', theme: 'tips', sub: 'trip-planning', isTip: true, date: '2024-08-30', views: 14210, excerpt: 'كيف تختار بين بطاقات المترو اليومية والقطارات السريعة لتوفير الوقت والميزانية.', image: IMG.europe, href: '#article/public-transport-tips' },
    { id: 'travel-insurance-guide', title: 'أهمية التأمين الطبي وتأمين الرحلات قبل السفر للخارج', category: 'نصائح السفر', theme: 'tips', sub: 'travel-safety', isTip: true, date: '2024-10-05', views: 15630, excerpt: 'ما الذي يغطيه تأمين السفر، وكيف تختار الوثيقة المناسبة لمسار رحلتك وأنشطتك.', image: IMG.heroAd1, href: '#article/travel-insurance-guide' },
    { id: 'passport-documents-safety', title: 'حماية جواز السفر والمستندات والبطاقات البنكية أثناء السفر', category: 'نصائح السفر', theme: 'tips', sub: 'travel-safety', isTip: true, date: '2024-08-12', views: 13480, excerpt: 'خطوات استباقية لنسخ الوثائق احتياطيًا وتأمين معاملاتك المالية في الخارج.', image: IMG.aboutWing, href: '#article/passport-documents-safety' },
  ],
  popular: [
    { id: 'algeria-places', title: 'افضل اماكن سياحية في الجزائر', category: 'إفريقيا', views: 77763, date: '2024-11-05', excerpt: 'جولة شاملة في أجمل المدن الساحلية والصحراوية والجبال الخلابة في الجزائر.', image: IMG.na, href: '#article/algeria-places' },
    { id: 'sudanese-food', title: 'اسماء أكلات سودانية مشهورة', category: 'المأكولات العالمية', views: 33351, date: '2024-10-22', excerpt: 'تعرّف على أشهر الأطباق السودانية التقليدية ونكهاتها الأصيلة المتوارثة.', image: IMG.pillars, href: '#article/sudanese-food' },
    { id: 'top10-world', title: 'أفضل 10 أماكن سياحية في العالم', category: 'أوروبا', views: 33278, date: '2025-04-29', excerpt: 'قائمة مختارة لأشهر الوجهات العالمية التي تستحق الزيارة في كل موسم.', image: IMG.europe, href: '#article/top10-world' },
    { id: 'egypt-summer', title: 'افضل اماكن سياحية في مصر في الصيف', category: 'إفريقيا', views: 32086, date: '2024-07-28', excerpt: 'أفضل الشواطئ والمدن الساحلية لقضاء عطلة صيفية ممتعة في مصر.', image: IMG.marsa, href: '#article/egypt-summer' },
    { id: 'world-cuisines', title: 'اليك اشهر الماكولات في العالم', category: 'المأكولات العالمية', views: 31965, date: '2024-09-19', excerpt: 'رحلة بين مطابخ العالم لاكتشاف الأطباق الأشهر وتجارب الطعام المحلية.', image: IMG.asia, href: '#article/world-cuisines' },
    { id: 'oran-places', title: 'اماكن جميلة في وهران', category: 'إفريقيا', views: 31809, date: '2024-10-28', excerpt: 'اكتشف الواجهة البحرية والمعالم التاريخية في عروس المتوسط وهران.', image: IMG.expand, href: '#article/oran-places' },
    { id: 'egyptian-food', title: 'تعرف على اشهر الاكلات الشعبية المصرية', category: 'المأكولات العالمية', views: 28960, date: '2024-09-03', excerpt: 'من الكشري والفول إلى الأطباق الريفية الأصيلة في شوارع مصر.', image: IMG.pyramids, href: '#article/egyptian-food' },
    { id: 'algiers-places', title: 'أماكن سياحية بالجزائر العاصمة', category: 'إفريقيا', views: 24401, date: '2024-10-02', excerpt: 'دليل القصبة والحدائق والمتاحف وإطلالات البحر في الجزائر العاصمة.', image: IMG.taba, href: '#article/algiers-places' },
    { id: 'largest-city', title: 'أكبر مدينة في العالم من حيث عدد السكان', category: 'آسيا', views: 23835, date: '2024-12-24', excerpt: 'تعرّف على طوكيو وأكبر الحواضر العالمية وتجارب السفر والحياة فيها.', image: IMG.asia, href: '#article/largest-city' },
    { id: 'lebanon-places', title: 'افضل الاماكن السياحية في لبنان', category: 'آسيا', views: 23809, date: '2024-08-15', excerpt: 'من جبل لبنان ومغارة جعيتا إلى جبيل وبيروت في دليل متكامل.', image: IMG.sa, href: '#article/lebanon-places' },
    { id: 'africa-ranking', title: 'ترتيب الدول السياحية في افريقيا', category: 'إفريقيا', views: 21985, date: '2024-10-15', excerpt: 'نظرة على أبرز الوجهات الإفريقية وتنوعها البيئي والثقافي.', image: IMG.sphinx, href: '#article/africa-ranking' },
    { id: 'egypt-resorts', title: 'أفضل أماكن مصيف في مصر', category: 'إفريقيا', views: 21907, date: '2024-08-19', excerpt: 'مقارنة بين الساحل الشمالي والبحر الأحمر وجنوب سيناء للعائلات.', image: IMG.suez, href: '#article/egypt-resorts' },
    { id: 'africa-2024', title: 'اجمل دول افريقيا للسياحة في عام 2024', category: 'إفريقيا', views: 20563, date: '2024-09-01', excerpt: 'وجهات إفريقية مميزة للسفاري والشواطئ والمدن التاريخية.', image: IMG.pillars, href: '#article/africa-2024' },
  ],
  picks: [
    { id: 'travel-safety', title: 'الأمن والسلامة الشخصية خلال السفر: كيف تحمي نفسك أثناء استكشاف العالم؟', category: 'أمريكا الشمالية', date: '2024-07-03', views: 12195, excerpt: 'إرشادات عملية للحفاظ على سلامتك وممتلكاتك في كل مراحل الرحلة.', image: IMG.na, href: '#article/travel-safety', isTip: true, sub: 'travel-safety' },
    { id: 'world-heritage', title: 'تعرف على الشعوب الغنية بالتراث والتقاليد حول العالم', category: 'التراث والتقاليد', date: '2024-07-03', views: 14933, excerpt: 'قصص مجتمعات حافظت على عاداتها وفنونها عبر الأجيال.', image: IMG.pillars, href: '#article/world-heritage' },
    { id: 'antarctica-wonders', title: 'عجائب قارة الجليد البيضاء والحياة البرية الفريدة في أنتاركتيكا', category: 'أمريكا الجنوبية', date: '2024-07-03', views: 9103, excerpt: 'مشاهد جليدية مهيبة وفرص نادرة لمراقبة الحياة البحرية القطبية.', image: IMG.oceania, href: '#article/antarctica-wonders' },
    { id: 'australia-oceania', title: 'لديك شغف بالسفر إلى أستراليا وأوقيانوسيا؟ معلومات لا تفوتك!', category: 'أستراليا', date: '2024-07-03', views: 6591, excerpt: 'كل ما تحتاجه للتخطيط لرحلة إلى مدن أستراليا وسواحلها المذهلة.', image: IMG.oceania, href: '#article/australia-oceania' },
    { id: 'south-america-tour', title: 'جولة لاستكشاف أمريكا الجنوبية.. موطن الجمال الطبيعي', category: 'أمريكا الجنوبية', date: '2024-07-03', views: 10725, excerpt: 'من جبال الأنديز إلى الأنهار الاستوائية، رحلة في قلب الطبيعة البكر.', image: IMG.sa, href: '#article/south-america-tour' },
    { id: 'north-america-gate', title: 'أمريكا الشمالية وبوابة إلى عالم من التنوع والثقافة', category: 'أمريكا الشمالية', date: '2024-07-03', views: 7997, excerpt: 'تنوع حضاري وجغرافي يمتد من المنتزهات الوطنية إلى المدن الكبرى.', image: IMG.na, href: '#article/north-america-gate' },
    { id: 'europe-old-continent', title: 'ما لا تعرفه عن أوروبا القارة العجوز ذات التاريخ العريق', category: 'أوروبا', date: '2024-07-03', views: 11236, excerpt: 'مدن تاريخية ومتاحف عريقة ومسارات قطار ساحرة عبر القارة.', image: IMG.europe, href: '#article/europe-old-continent' },
    { id: 'discover-asia', title: 'استكشف آسيا.. تنوع ثقافي وجمال طبيعي لا يضاهى', category: 'آسيا', date: '2024-07-03', views: 3853, excerpt: 'معابد تاريخية وأسواق نابضة وطبيعة جبلية وبحرية متفردة.', image: IMG.asia, href: '#article/discover-asia' },
    { id: 'africa-adventure', title: 'تبحث عن المغامرة؟ لنذهب إلى أدغال إفريقيا ونستكشف القارة السمراء', category: 'إفريقيا', date: '2024-07-03', views: 6618, excerpt: 'مغامرات السفاري والشواطئ الذهبية والحضارات العريقة في إفريقيا.', image: IMG.suez, href: '#article/africa-adventure' },
  ],
  // TODO: Replace routes.discover and routes.culture with final production URL slugs when deployed
  routes: {
    discover: '#discover',
    culture: '#culture',
  },
  nav: [
    { key: 'home', label: 'الرئيسية', href: '#home' },
    {
      key: 'discover',
      label: 'اكتشف العالم',
      href: '#discover',
      dropdownId: 'dd-world',
      dropdownLabel: 'قارات العالم',
      menuPanelId: 'menu-acc-discover',
      children: [
        { slug: 'europe', label: 'أوروبا', href: '#category/europe' },
        { slug: 'north-america', label: 'أمريكا الشمالية', href: '#category/north-america' },
        { slug: 'south-america', label: 'أمريكا الجنوبية', href: '#category/south-america' },
        { slug: 'australia', label: 'أستراليا', href: '#category/australia' },
      ],
    },
    {
      key: 'culture',
      label: 'ثقافات وتجارب',
      href: '#culture',
      dropdownId: 'dd-cultures',
      dropdownLabel: 'ثقافات وتجارب',
      menuPanelId: 'menu-acc-culture',
      children: [
        { slug: 'heritage', label: 'التراث والتقاليد', href: '#category/heritage' },
        { slug: 'food', label: 'المأكولات العالمية', href: '#category/food' },
      ],
    },
    {
      key: 'tips',
      label: 'نصائح السفر',
      href: '#category/tips',
      dropdownId: 'dd-tips',
      dropdownLabel: 'نصائح السفر',
      menuPanelId: 'menu-acc-tips',
      children: [
        { slug: 'trip-planning', label: 'تخطيط الرحلات والتنقل', href: '#category/trip-planning' },
      ],
    },
    { key: 'africa', label: 'إفريقيا', href: '#category/africa' },
    { key: 'asia', label: 'آسيا', href: '#category/asia' },
    { key: 'all-stories', label: 'كل القصص', href: '#all-stories' },
  ],
  footerSiteLinks: [
    { key: 'about', label: 'من نحن', href: '#about' },
    { key: 'contact', label: 'تواصل معنا', href: '#contact' },
    { key: 'privacy', label: 'سياسة الخصوصية', href: '#privacy' },
  ],
  // TODO: Reconcile hubCount (265/180/166/65/13/12) vs category/aside count (256/177/163/63/13/12), and swap placeholder region images with real photography
  regions: [
    { slug: 'asia', name: 'آسيا', count: 256, hubCount: 265, image: IMG.asia, blurb: 'قصص وأدلة سفر عن آسيا بين التراث العريق والطبيعة الخلابة.' },
    { slug: 'africa', name: 'إفريقيا', count: 177, hubCount: 180, image: IMG.suez, blurb: 'قصص وأدلة سفر عن إفريقيا وشواطئها ومعالمها التاريخية.' },
    { slug: 'europe', name: 'أوروبا', count: 163, hubCount: 166, image: IMG.europe, blurb: 'قصص وأدلة سفر عن أوروبا ومساراتها الثقافية والجبلية.' },
    { slug: 'north-america', name: 'أمريكا الشمالية', count: 63, hubCount: 65, image: IMG.na, blurb: 'قصص وأدلة سفر عن أمريكا الشمالية ومدنها ومنتزهاتها الوطنية.' },
    { slug: 'south-america', name: 'أمريكا الجنوبية', count: 13, hubCount: 13, image: IMG.sa, blurb: 'قصص وأدلة سفر عن أمريكا الجنوبية وجبال الأنديز وغاباتها.' },
    { slug: 'australia', name: 'أستراليا (أوقيانوسيا)', shortName: 'أستراليا', count: 12, hubCount: 12, image: IMG.oceania, blurb: 'قصص وأدلة سفر عن أستراليا وأوقيانوسيا وسواحلها الفريدة.' },
  ],
  // TODO: Swap placeholder theme images for food and heritage with real photography
  themes: [
    { slug: 'food', name: 'المأكولات العالمية', count: 60, image: IMG.heroAd2 },
    { slug: 'heritage', name: 'التراث والتقاليد', count: 38, image: IMG.pillars },
    { slug: 'tips', name: 'نصائح السفر', count: 130, bestKnown: true, image: IMG.expand },
    { slug: 'trip-planning', name: 'تخطيط الرحلات والتنقل', count: 74, image: IMG.aboutWing, parentSlug: 'tips', parentName: 'نصائح السفر' },
    { slug: 'travel-safety', name: 'الأمن والسلامة في السفر', count: 56, image: IMG.heroAd1, parentSlug: 'tips', parentName: 'نصائح السفر' },
  ],
  facts: [
    {
      heading: 'أهرامات الجيزة',
      text: 'أهرامات الجيزة مصممة بحيث تشير إلى النقاط الأساسية الأربعة (الشمال، الجنوب، الشرق، الغرب) بدقة مذهلة، وكان القدماء المصريين يمتلكون معرفة فلكية وهندسية متقدمة للغاية.',
      image: IMG.pyramids,
    },
    {
      heading: 'أبو الهول',
      text: 'تمثال أبو الهول في الجيزة هو أكبر تمثال منحوت من قطعة واحدة من الصخر في العالم، حيث يبلغ طوله حوالي 73 مترًا (240 قدمًا) وارتفاعه حوالي 20 مترًا (66 قدمًا).',
      image: IMG.sphinx,
    },
    {
      heading: 'معبد الكرنك',
      text: 'يُعد مجمع معابد الكرنك في الأقصر أكبر موقع ديني أثري مفتوح في العالم، ويضم بهو الأعمدة الكبرى الذي يشتمل على 134 عمودًا حجريًا شاهقًا منقوشًا بالهيروغليفية.',
      image: IMG.pillars,
    },
    {
      heading: 'قلعة صلاح الدين بطابا',
      text: 'تقع قلعة صلاح الدين على جزيرة فرعون في خليج العقبة بمدينة طابا، وقد شُيّدت في القرن الثاني عشر الميلادي لحماية طرق الحج والتجارة بين مصر والشام والحجاز.',
      image: IMG.taba,
    },
    {
      heading: 'قناة السويس',
      text: 'تربط قناة السويس البحر الأحمر بالبحر المتوسط مباشرة بطول يقارب 193 كيلومترًا، وتُعد أحد أهم الممرات الملاحية العالمية التي اختصرت رحلات السفن بين الشرق والغرب.',
      image: IMG.suez,
    },
  ],
  about: {
    images: {
      temple: { src: IMG.pillars, alt: 'أعمدة معبد مصري قديم' },
      wing: { src: IMG.aboutWing, alt: 'جناح طائرة عند الغروب' },
      hero: { src: IMG.aboutHeroPlane, alt: 'طائرة تعبر سماء غروب' },
    },
  },
  aboutStats: [
    { value: 800, prefix: '+', label: 'مقال ودليل سفر', shortLabel: 'مقال ودليل سفر' },
    { value: 6, prefix: '', label: 'قارات ومناطق نغطيها', shortLabel: 'قارات ومناطق' },
    { value: 3, prefix: '', label: 'أقسام: وجهات وثقافات ونصائح', shortLabel: 'أقسام' },
  ],
};

if (typeof window !== 'undefined') {
  // @ts-ignore - preserve global config reference for external scripts/tests
  window.__SAFARYTI_CONFIG = CONFIG;
}
