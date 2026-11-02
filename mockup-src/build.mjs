// Generates the static pages of the Altura mockup into public/altura-mockup/.
// Run: node mockup-src/build.mjs   (no dependencies)
// CSS, JS, fonts and icons are authored directly in public/altura-mockup/.

import { mkdirSync, writeFileSync, readFileSync, cpSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
// ROOT=1 membangun versi domain utama (alturainvestama.com): tautan di akar "/", keluaran public/site/.
const ROOT = process.env.ROOT === "1";
const OUT = join(here, "..", "public", ROOT ? "site" : "altura-mockup");
const BASE = ROOT ? "/" : "/altura-mockup/";
const SITE = ROOT ? "https://alturainvestama.com" : "https://qilo.one";
const LOGO = JSON.parse(readFileSync(join(here, "logo-path.json"), "utf8"));

/* ---------- helpers ---------- */

const escText = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escAttr = (s) => escText(s).replace(/"/g, "&quot;");
// Inline translatable text: English in the markup, Indonesian in data-id.
const T = (en, id) => `<span data-id="${escAttr(id)}">${escText(en)}</span>`;
const icon = (name, cls = "") =>
  `<svg class="icon${cls ? " " + cls : ""}" aria-hidden="true" focusable="false"><use href="${BASE}img/icons.svg#${name}"/></svg>`;
const href = (p) => BASE + p;

const MONTHS = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  id: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
};
const date = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `<time datetime="${iso}">${T(`${d} ${MONTHS.en[m - 1]} ${y}`, `${d} ${MONTHS.id[m - 1]} ${y}`)}</time>`;
};

/* ---------- shared data ---------- */

const NAV = [
  ["", "Home", "Beranda"],
  ["about/", "About", "Tentang"],
  ["focus/", "Focus", "Fokus"],
  ["portfolio/", "Portfolio", "Portofolio"],
  ["insights/", "News", "Berita"],
  ["team/", "Team", "Tim"],
  ["contact/", "Contact", "Kontak"],
];

const SECTORS = [
  {
    key: "infrastructure", icon: "zap",
    en: "Sustainable infrastructure", id: "Infrastruktur berkelanjutan",
    shortEn: "Energy, water, and logistics for the long run.", shortId: "Energi, air, dan logistik untuk jangka panjang.",
    longEn: "We back energy, water, and logistics assets that serve communities for decades. We look for stable demand, clear contracts, and operators who plan for maintenance as carefully as for growth.",
    longId: "Kami mendukung aset energi, air, dan logistik yang melayani masyarakat selama puluhan tahun. Kami mencari permintaan yang stabil, kontrak yang jelas, dan operator yang merencanakan perawatan sama cermatnya dengan pertumbuhan.",
  },
  {
    key: "technology", icon: "cpu",
    en: "Digital and technology", id: "Digital dan teknologi",
    shortEn: "Software that helps established industries work better.", shortId: "Perangkat lunak yang membantu industri mapan bekerja lebih baik.",
    longEn: "We invest in software and digital services that make established industries work better. We favour products with paying customers, honest metrics, and teams that ship steadily.",
    longId: "Kami berinvestasi pada perangkat lunak dan layanan digital yang membuat industri mapan bekerja lebih baik. Kami menyukai produk dengan pelanggan berbayar, metrik yang jujur, dan tim yang merilis secara konsisten.",
  },
  {
    key: "consumer", icon: "shopping-bag",
    en: "Consumer and retail", id: "Konsumen dan ritel",
    shortEn: "Brands that earn loyalty through quality.", shortId: "Merek yang meraih loyalitas lewat kualitas.",
    longEn: "We support consumer and retail businesses that earn loyalty through quality and fair sourcing. We pay close attention to supply chains, store economics, and how a brand treats its customers.",
    longId: "Kami mendukung bisnis konsumen dan ritel yang meraih loyalitas lewat kualitas dan pengadaan yang adil. Kami memperhatikan rantai pasok, ekonomi gerai, dan cara merek memperlakukan pelanggannya.",
  },
  {
    key: "agri", icon: "wheat",
    en: "Agriculture and food", id: "Pertanian dan pangan",
    shortEn: "Reliable, traceable food supply.", shortId: "Pasokan pangan yang andal dan dapat dilacak.",
    longEn: "We work with growers, processors, and distributors who make food supply more reliable. Traceability, fair prices for producers, and resilience to weather and market swings guide our choices.",
    longId: "Kami bekerja dengan petani, pengolah, dan distributor yang membuat pasokan pangan lebih andal. Keterlacakan, harga yang adil bagi produsen, dan ketahanan terhadap cuaca serta gejolak pasar memandu pilihan kami.",
  },
  {
    key: "health", icon: "heart-pulse",
    en: "Healthcare", id: "Kesehatan",
    shortEn: "Wider access to quality care.", shortId: "Akses lebih luas ke layanan kesehatan bermutu.",
    longEn: "We invest in clinics, diagnostics, and health services that widen access without cutting corners on quality. We expect clear clinical standards and transparent pricing.",
    longId: "Kami berinvestasi pada klinik, diagnostik, dan layanan kesehatan yang memperluas akses tanpa mengorbankan mutu. Kami mengharapkan standar klinis yang jelas dan harga yang transparan.",
  },
  {
    key: "finance", icon: "landmark",
    en: "Financial services", id: "Jasa keuangan",
    shortEn: "Tools for small businesses to grow responsibly.", shortId: "Alat bagi usaha kecil untuk tumbuh secara bertanggung jawab.",
    longEn: "We back financial tools that help small businesses keep records, manage cash, and borrow responsibly. Sound risk management and clear customer terms matter more to us than fast growth.",
    longId: "Kami mendukung perangkat keuangan yang membantu usaha kecil mencatat pembukuan, mengelola kas, dan meminjam secara bertanggung jawab. Manajemen risiko yang sehat dan ketentuan yang jelas bagi pelanggan lebih penting bagi kami daripada pertumbuhan cepat.",
  },
];
const sector = (key) => SECTORS.find((s) => s.key === key);

// Patdua and Nema are real partners. Timeline and figures elsewhere on this site are placeholders.
const PORTFOLIO = [
  { name: "Patdua", slug: "patdua", sec: "consumer", ig: "patdua_eatery", logo: "img/patdua-logo.png", bg: "img/patdua-logo.png", img: "img/patdua-facade.jpg",
    en: "Neighbourhood coffee and eatery.", id: "Kedai kopi dan makan lingkungan.",
    moreEn: "Patdua Coffee and Eatery sits across from a university campus in Surabaya and draws a young, student-heavy crowd who come to hang out, study, or sit with a drink. It also hosts live music, workshops, talkshows, bazaars, and pop-up stores.",
    moreId: "Patdua Coffee and Eatery berada di seberang sebuah kampus di Surabaya dan banyak dikunjungi anak muda, terutama mahasiswa, yang datang untuk bersantai, mengerjakan tugas, atau sekadar menikmati minuman. Kafe ini juga mengadakan musik langsung, workshop, talkshow, bazar, dan pop-up store.",
    facts: [
      ["Location", "Lokasi", "Jl. Rungkut Madya No. 203, Rungkut Kidul, Kec. Rungkut, Surabaya, Jawa Timur 60294", "Jl. Rungkut Madya No. 203, Rungkut Kidul, Kec. Rungkut, Surabaya, Jawa Timur 60294"],
      ["Hours", "Jam buka", "09:00 to 23:00 WIB", "09.00 sampai 23.00 WIB"],
      ["The name", "Asal nama", "Taken from the owner's house number, 42", "Diambil dari nomor rumah si pemilik, yaitu 42"],
      ["Site area", "Luas lahan", "379.56 m²", "379,56 m²"],
    ],
    gallery: [
      ["img/patdua-facade.jpg", "Patdua storefront at night with its green neon sign"],
      ["img/patdua-stage.jpg", "Tiered seating and stage area with a palm planted in the steps"],
      ["img/patdua-lounge.jpg", "Arched lounge corner with bean bags and the Patdua wall mural"],
      ["img/patdua-dining.jpg", "Dining room with black tables and a large arched window"],
      ["img/patdua-hall.jpg", "Long dining hall with black tables and green high chairs"],
      ["img/patdua-cups.jpg", "Three iced drinks in Patdua cups on a marble table"],
    ] },
  { name: "Nema", slug: "nema", sec: "consumer", soon: true, logo: "img/nema-logo.png", bg: "img/nema-logo-bg.png", img: "img/nema.jpg",
    en: "Social house and coffee shop.", id: "Social house dan kedai kopi.",
    moreEn: "Dark timber and red tile set the tone around a long coffee bar. Guests order at one end and collect at the pick-up counter, with car and motorbike parking on site, a musholla, and a smoking room.",
    moreId: "Kayu gelap dan ubin merah membangun suasana di sekitar bar kopi yang panjang. Tamu memesan di satu sisi dan mengambil di meja pengambilan, dengan parkir mobil dan motor di lokasi, musholla, serta ruang merokok.",
    facts: [
      ["Location", "Lokasi", "Jl. Trunojoyo No. 29, RW 1, Sidoklumpuk, Kec. Sidoarjo, Kabupaten Sidoarjo, Jawa Timur 61218", "Jl. Trunojoyo No. 29, RW 1, Sidoklumpuk, Kec. Sidoarjo, Kabupaten Sidoarjo, Jawa Timur 61218"],
      ["Status", "Status", "Coming soon", "Segera hadir"],
      ["Planned hours", "Rencana jam buka", "Mon to Fri 9am to 8.30pm, Sat and Sun 8am to 9pm", "Sen sampai Jum 09.00 sampai 20.30, Sab dan Min 08.00 sampai 21.00"],
      ["Facilities", "Fasilitas", "Order and pick-up counters, parking, musholla, toilets, smoking room", "Meja pesan dan ambil, parkir, musholla, toilet, ruang merokok"],
    ],
    gallery: [
      ["img/nema.jpg", "Render of the main room with a long timber table and a lounge corner"],
      ["img/nema-bar.jpg", "Render of the coffee bar with its red tile wall and pick-up counter"],
      ["img/nema-entrance.jpg", "Render of the entrance looking in toward the bar"],
    ] },
];
const initials = (n) => n.split(" ").map((w) => w[0]).join("").slice(0, 2);
const mark = (c) => c.logo
  ? `<span class="mono mono-img" aria-hidden="true"><img src="${href(c.logo)}" alt=""></span>`
  : `<span class="mono" aria-hidden="true">${initials(c.name)}</span>`;

const CATS = {
  investment: { icon: "chart-line", en: "Investment", id: "Investasi" },
  sme: { icon: "shopping-bag", en: "SMEs", id: "UMKM" },
  policy: { icon: "landmark", en: "Policy", id: "Kebijakan" },
};
// Real news, summarised in our own words. Each item links to the original report.
const ARTICLES = [
  { cat: "sme", d: "2026-10-29", src: "ANTARA", url: "https://www.antaranews.com/berita/5820291/menteri-umkm-kur-menembus-rp262-triliun-jangkau-lebih-4-juta-debitur",
    tEn: "KUR reaches Rp262 trillion and more than 4 million borrowers", tId: "KUR tembus Rp262 triliun, jangkau lebih dari 4 juta debitur",
    xEn: "About 1.6 million are first-time borrowers, and 65.9% of lending went to productive sectors. The SME minister wants to hold the 2027 production target near 65%.",
    xId: "Sekitar 1,6 juta debitur baru, dan 65,9% penyaluran masuk ke sektor produksi. Menteri UMKM ingin target produksi 2027 tetap sekitar 65%." },
  { cat: "sme", d: "2026-10-28", src: "Kontan", url: "https://keuangan.kontan.co.id/news/kredit-umkm-tumbuh-27-yoy-september-2026",
    tEn: "SME credit grows 2.7% year on year in September", tId: "Kredit UMKM tumbuh 2,7% yoy pada September",
    xEn: "Outstanding SME credit stands at Rp1,539.2 trillion, still short of the 7 to 9% year-end target. Investment credit rose 14.9% while working capital fell 2.6%.",
    xId: "Kredit UMKM mencapai Rp1.539,2 triliun, masih jauh dari target akhir tahun 7 sampai 9%. Kredit investasi naik 14,9% sementara modal kerja turun 2,6%." },
  { cat: "policy", d: "2026-10-21", src: "Bisnis.com", url: "https://finansial.bisnis.com/read/20261021/11/2014413/breaking-bank-indonesia-tahan-bi-rate-575-pada-rdg-oktober-2026",
    tEn: "Bank Indonesia holds its policy rate at 5.75%", tId: "Bank Indonesia menahan BI Rate di 5,75%",
    xEn: "The October board meeting kept the benchmark rate unchanged, with the rupiah's stability as the central bank's stated focus.",
    xId: "Rapat Dewan Gubernur Oktober mempertahankan suku bunga acuan, dengan stabilitas rupiah sebagai fokus bank sentral." },
  { cat: "investment", d: "2026-10-20", src: "CNBC Indonesia", url: "https://www.cnbcindonesia.com/news/20261020102140-4-777745/investasi-ri-tembus-rp5287-t-serap-745-ribu-tenaga-kerja/amp",
    tEn: "Third-quarter investment reaches Rp528.7 trillion, up 7.6%", tId: "Realisasi investasi kuartal III capai Rp528,7 triliun, naik 7,6%",
    xEn: "Investment realisation for January to September totals Rp1,539.2 trillion and has absorbed about 2.19 million workers, according to the investment ministry.",
    xId: "Realisasi investasi Januari sampai September totalnya Rp1.539,2 triliun dan menyerap sekitar 2,19 juta tenaga kerja, menurut Kementerian Investasi." },
  { cat: "investment", d: "2026-10-01", src: "KabarBursa", url: "https://www.kabarbursa.com/makro/danantara-berencana-gunakan-dividen-untuk-biayai-proyek-hilirisasi",
    tEn: "Danantara plans to channel dividends into downstreaming projects", tId: "Danantara berencana pakai dividen untuk proyek hilirisasi",
    xEn: "Its chief operating officer says the Rp120 trillion payment to the state is not yet settled, and that dividends are intended to back projects that create jobs.",
    xId: "COO Danantara menyebut setoran Rp120 triliun ke negara belum final, dan dividen dimaksudkan mendukung proyek yang membuka lapangan kerja." },
];

/* ---------- page frame ---------- */

const curves = `<svg class="hero-curves" viewBox="0 0 720 260" aria-hidden="true" focusable="false">
  <path class="c-sage" pathLength="1" d="M-10 170 C80 70 200 40 320 70 C440 100 520 150 620 160 C680 166 710 150 740 130"/>
  <path class="c-gold" pathLength="1" d="M-10 236 C250 252 470 222 600 140 C660 100 700 60 740 30"/>
</svg>`;

function frame({ path, nav, titleEn, titleId, descEn, descId, main }) {
  const links = NAV.map(([p, en, id]) => {
    const current = p === nav ? ' aria-current="page"' : "";
    return `<a href="${href(p)}"${current}>${T(en, id)}</a>`;
  }).join("\n        ");
  const foot = (items) => items.map(([p, en, id]) => `<li><a href="${href(p)}">${T(en, id)}</a></li>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title data-id="${escAttr(titleId)}">${escText(titleEn)}</title>
  <meta name="description" content="${escAttr(descEn)}" data-id-content="${escAttr(descId)}">
  ${ROOT ? "" : '<meta name="robots" content="noindex">'}
  <meta name="theme-color" content="#0F5964">
  <link rel="canonical" href="${SITE}${href(path)}">
  <link rel="icon" type="image/png" href="${BASE}img/favicon.png">
  <link rel="preload" href="${BASE}fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  <script>(function(d){d.classList.add("js");try{if(sessionStorage.getItem("altura-mockup-nav")){sessionStorage.removeItem("altura-mockup-nav");d.classList.add("is-entering")}}catch(e){}})(document.documentElement)</script>
  <link rel="stylesheet" href="${BASE}styles.css">
  <script src="${BASE}app.js" defer></script>
</head>
<body>
  <a class="skip" href="#main">${T("Skip to content", "Lewati ke konten")}</a>
  <div class="veil" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><img class="veil-logo" src="${BASE}img/logo.png" alt="" width="900" height="274"></div>

  <header class="site-header">
    <div class="wrap header-inner">
      <a class="brand" href="${href("")}" aria-label="Altura, home" data-id-aria-label="Altura, beranda">
        <img src="${BASE}img/logo.png" alt="Altura" width="900" height="274">
      </a>
      <nav class="site-nav" id="site-nav" aria-label="Main" data-id-aria-label="Utama">
        ${links}
      </nav>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Menu" data-id-aria-label="Menu">${icon("menu", "i-open")}${icon("x", "i-close")}</button>
      <div class="lang" role="group" aria-label="Language" data-id-aria-label="Bahasa">
        ${icon("languages")}
        <div class="lang-switch">
          <button type="button" data-lang="en" lang="en" aria-label="English" aria-pressed="true">EN</button>
          <button type="button" data-lang="id" lang="id" aria-label="Bahasa Indonesia" aria-pressed="false">ID</button>
        </div>
      </div>
    </div>
  </header>

  <main id="main">
${main}
  </main>

  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-grid">
        <div class="footer-brand">
          <img src="${BASE}img/logo.png" alt="Altura" width="900" height="274">
          <p class="legal-name">${icon("building-2")}<span>PT. ALTURA ABADI INVESTAMA</span></p>
          <p class="footer-line">${T("Investment and funding with a long-term perspective.", "Investasi dan pendanaan dengan perspektif jangka panjang.")}</p>
        </div>
        <nav aria-label="Company" data-id-aria-label="Perusahaan">
          <h2 class="footer-h">${T("Company", "Perusahaan")}</h2>
          <ul>${foot([["about/", "About", "Tentang"], ["team/", "Team", "Tim"], ["contact/", "Contact", "Kontak"]])}</ul>
        </nav>
        <nav aria-label="Work" data-id-aria-label="Kerja kami">
          <h2 class="footer-h">${T("Our work", "Kerja kami")}</h2>
          <ul>${foot([["focus/", "Focus areas", "Bidang fokus"], ["portfolio/", "Portfolio", "Portofolio"], ["insights/", "News", "Berita"]])}</ul>
        </nav>
      </div>
      <p class="copy">${T("© 2026 PT. Altura Abadi Investama. All rights reserved.", "© 2026 PT. Altura Abadi Investama. Hak cipta dilindungi.")}</p>
    </div>
  </footer>
</body>
</html>
`;
}

const hero = (tEn, tId, lEn, lId) => `    <section class="page-hero">
      <div class="wrap">
        <h1>${T(tEn, tId)}</h1>
        <p class="lead">${T(lEn, lId)}</p>
      </div>
      ${curves}
    </section>`;

const cta = () => `    <section class="band band-cta">
      <div class="wrap split">
        <h2>${T("Let's talk about your plans.", "Mari bicara tentang rencana Anda.")}</h2>
        <div>
          <p class="lead">${T("Tell the Altura team about your business and goals.", "Ceritakan bisnis dan tujuan Anda kepada tim Altura.")}</p>
          <a class="btn btn-light" href="${href("contact/")}">${T("Contact us", "Hubungi kami")}${icon("arrow-right")}</a>
        </div>
      </div>
    </section>`;

const sectorIcon = (key) => icon(sector(key).icon);
const nid = (a) => `news-${ARTICLES.indexOf(a) + 1}`;
const articleRow = (a) => `<li data-cat="${a.cat}">
            <button type="button" class="row row-article" data-news="${nid(a)}" aria-haspopup="dialog">
              <span class="row-date">${date(a.d)}</span>
              <span class="row-body"><strong>${T(a.tEn, a.tId)}</strong><span>${T(a.xEn, a.xId)}</span><em class="row-src">${a.src}</em></span>
              <span class="row-side">${icon(CATS[a.cat].icon)}${T(CATS[a.cat].en, CATS[a.cat].id)}</span>
              ${icon("arrow-up-right", "row-arrow")}
            </button>
          </li>`;
const newsCard = (a, i, big) => `<li class="ncard${big ? " ncard-big" : ""}">
            <button type="button" data-news="${nid(a)}" aria-haspopup="dialog">
              <span class="ncard-top"><span class="ncard-no">0${i + 1}</span><span class="ncard-cat">${icon(CATS[a.cat].icon)}${T(CATS[a.cat].en, CATS[a.cat].id)}</span></span>
              <strong class="ncard-title">${T(a.tEn, a.tId)}</strong>
              <span class="ncard-text">${T(a.xEn, a.xId)}</span>
              <span class="ncard-foot"><span>${date(a.d)} · ${a.src}</span><span class="ncard-go">${T("Read", "Baca")}${icon("arrow-up-right")}</span></span>
            </button>
          </li>`;
const newsModals = (list) => list.map((a) => `<dialog class="news-modal" id="${nid(a)}" aria-labelledby="${nid(a)}-t">
      <div class="nm-head">
        <svg class="nm-curves" viewBox="0 0 720 260" aria-hidden="true" focusable="false"><path d="M-10 170 C80 70 200 40 320 70 C440 100 520 150 620 160 C680 166 710 150 740 130"/><path class="g" d="M-10 236 C250 252 470 222 600 140 C660 100 700 60 740 30"/></svg>
        <button type="button" class="nm-close" data-close aria-label="Close" data-id-aria-label="Tutup">${icon("x")}</button>
        <p class="nm-meta"><span>${icon(CATS[a.cat].icon)}${T(CATS[a.cat].en, CATS[a.cat].id)}</span><span>${date(a.d)}</span></p>
        <h2 id="${nid(a)}-t">${T(a.tEn, a.tId)}</h2>
      </div>
      <div class="nm-body">
        <p>${T(a.xEn, a.xId)}</p>
        <p class="nm-src">${T("Source", "Sumber")}: <strong>${a.src}</strong></p>
        <div class="nm-actions">
          <a class="btn" href="${a.url}" target="_blank" rel="noopener noreferrer">${T("Read the original report", "Baca laporan aslinya")}${icon("arrow-up-right")}</a>
          <button type="button" class="link nm-dismiss" data-close>${T("Close", "Tutup")}</button>
        </div>
      </div>
    </dialog>`).join("\n    ");

/* ---------- pages ---------- */

const pages = [];

// HOME
pages.push({
  path: "", nav: "",
  titleEn: "Altura | Investing for sustainable growth", titleId: "Altura | Investasi untuk pertumbuhan berkelanjutan",
  descEn: "PT. Altura Abadi Investama: investment and funding with a long-term perspective, building value through investment and strategic partnerships.",
  descId: "PT. Altura Abadi Investama: investasi dan pendanaan dengan perspektif jangka panjang, membangun nilai melalui investasi dan kemitraan strategis.",
  main: `    <section class="home-hero">
      <div class="wrap home-hero-grid">
        <div class="home-hero-copy">
          <h1>${T("Investing for sustainable growth.", "Investasi untuk pertumbuhan berkelanjutan.")}</h1>
          <p class="lead">${T("Building long-term value through investment and strategic partnerships.", "Membangun nilai jangka panjang melalui investasi dan kemitraan strategis.")}</p>
          <div class="actions">
            <a class="btn" href="${href("focus/")}">${T("Our focus areas", "Bidang fokus kami")}${icon("arrow-right")}</a>
            <a class="link" href="${href("about/")}">${T("About Altura", "Tentang Altura")}</a>
          </div>
        </div>
        <div class="logo-stage">
          <svg class="logo-draw" viewBox="0 0 1801 549" role="img" aria-label="Altura">
            <defs>
              <clipPath id="word-clip"><rect class="word-clip" x="0" y="0" width="1801" height="549"/></clipPath>
              <mask id="logo-mask" mask-type="alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="1801" height="549"><image href="${BASE}img/logo.png" x="0" y="0" width="1801" height="549"/></mask>
            </defs>
            <g mask="url(#logo-mask)"><path class="pen" d="${LOGO.d}" data-width="${LOGO.width}"/></g>
            <image class="logo-full" href="${BASE}img/logo.png" x="0" y="0" width="1801" height="549" clip-path="url(#word-clip)"/>
            <circle class="pen-dot" r="11" cx="${LOGO.start[0]}" cy="${LOGO.start[1]}"/>
          </svg>
          <button class="replay" type="button" aria-label="Replay logo animation" data-id-aria-label="Putar ulang animasi logo">${icon("refresh-cw")}<span>${T("Replay", "Putar ulang")}</span></button>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap split">
        <div>
          <h2>${T("Structure, continuity, and a clear direction.", "Struktur, kesinambungan, dan arah yang jelas.")}</h2>
          <p class="lead">${T("PT. Altura Abadi Investama is an investment and funding company that works with a long-term perspective.", "PT. Altura Abadi Investama adalah perusahaan investasi dan pendanaan yang bekerja dengan perspektif jangka panjang.")}</p>
        </div>
        <dl class="facts">
          <div><dt>${T("Focus areas", "Bidang fokus")}</dt><dd>${SECTORS.length}</dd></div>
          <div><dt>${T("Partner companies", "Perusahaan mitra")}</dt><dd>${PORTFOLIO.length}</dd></div>
          <div><dt>${T("Approach", "Pendekatan")}</dt><dd>${T("Long-term and partner-led", "Jangka panjang dan berbasis kemitraan")}</dd></div>
        </dl>
      </div>
    </section>

    <section class="section section-tint">
      <div class="wrap">
        <div class="section-head">
          <h2>${T("Where we invest", "Tempat kami berinvestasi")}</h2>
          <a class="link" href="${href("focus/")}">${T("All focus areas", "Semua bidang fokus")}${icon("arrow-right")}</a>
        </div>
        <ul class="grid-ruled grid-3">
          ${SECTORS.map((s) => `<li class="cell">${icon(s.icon, "cell-icon")}<h3>${T(s.en, s.id)}</h3><p>${T(s.shortEn, s.shortId)}</p></li>`).join("\n          ")}
        </ul>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="section-head">
          <h2>${T("Partners we support", "Mitra yang kami dukung")}</h2>
          <a class="link" href="${href("portfolio/")}">${T("Full portfolio", "Portofolio lengkap")}${icon("arrow-right")}</a>
        </div>
        <ul class="grid-ruled grid-2 tiles">
          ${PORTFOLIO.map((c) => `<li class="tile tile-brand" style="--tile-logo: url('${href(c.bg)}')">
            <div class="tile-top">${mark(c)}<span class="tile-sector">${sectorIcon(c.sec)}${T(sector(c.sec).en, sector(c.sec).id)}</span></div>
            ${c.gallery && c.slug === "patdua"
              ? `<div class="tile-img tile-slides" data-slides role="img" aria-label="${c.name}">${c.gallery.map(([src, alt], k) => `<img class="slide${k === 0 ? " is-on" : ""}" src="${href(src)}" alt="" ${k === 0 ? "" : 'loading="lazy"'}>`).join("")}<span class="slide-dots" aria-hidden="true">${c.gallery.map((_, k) => `<i${k === 0 ? ' class="is-on"' : ""}></i>`).join("")}</span></div>`
              : `<img class="tile-img tile-img-photo" src="${href(c.img)}" alt="${c.name}" loading="lazy">`}
            <h3>${c.name}</h3>
            <p>${T(c.en, c.id)}</p>
            <p class="tile-since"><a href="${href("portfolio/")}#${c.slug}">${T("See " + c.name, "Lihat " + c.name)}</a></p>
          </li>`).join("\n          ")}
        </ul>
      </div>
    </section>

    <section class="band band-teal">
      <div class="wrap">
        <h2>${T("How Altura works", "Cara Altura bekerja")}</h2>
        <ul class="principles">
          <li>${icon("briefcase-business")}<h3>${T("Professional", "Profesional")}</h3><p>${T("We explain our approach, process, and investment goals in a concise and concrete way.", "Kami menjelaskan pendekatan, proses, dan tujuan investasi secara ringkas dan konkret.")}</p></li>
          <li>${icon("compass")}<h3>${T("Future-oriented", "Berorientasi masa depan")}</h3><p>${T("We emphasize long-term value creation, strategic partnerships, and responsible growth.", "Kami menekankan penciptaan nilai jangka panjang, kemitraan strategis, dan pertumbuhan yang bertanggung jawab.")}</p></li>
          <li>${icon("chart-line")}<h3>${T("Measurable", "Terukur")}</h3><p>${T("We share claims of impact and performance only when data supports them. We do not promise guaranteed returns.", "Klaim dampak dan kinerja kami sampaikan hanya jika ada data pendukung. Kami tidak menjanjikan keuntungan pasti.")}</p></li>
        </ul>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="section-head">
          <h2>${T("Latest news", "Berita terbaru")}</h2>
          <a class="link" href="${href("insights/")}">${T("All news", "Semua berita")}${icon("arrow-right")}</a>
        </div>
        <ul class="ncards">
          ${ARTICLES.slice(0, 3).map((a, i) => newsCard(a, i, i === 0)).join("\n          ")}
        </ul>
      </div>
    </section>
    ${newsModals(ARTICLES.slice(0, 3))}

${cta()}`,
});

// ABOUT
const VALUES = [
  ["blocks", "Clear structure", "Struktur yang jelas", "A simple framework keeps every investment decision focused and easy to explain.", "Kerangka kerja yang sederhana membuat setiap keputusan investasi terarah dan mudah dijelaskan."],
  ["waypoints", "Connected relationships", "Hubungan yang berkesinambungan", "We keep relationships and growth connected, from the first decision to a long-term partnership.", "Hubungan dan pertumbuhan kami jaga tetap terhubung, dari keputusan pertama sampai kemitraan jangka panjang."],
  ["trending-up", "Direction of growth", "Arah pertumbuhan", "We point investment toward progress and long-term value creation.", "Kami mengarahkan investasi pada kemajuan dan penciptaan nilai jangka panjang."],
  ["shield-check", "Measured claims", "Klaim yang terukur", "We speak about results only when the data is there to support them.", "Kami berbicara tentang hasil hanya ketika datanya ada untuk mendukung."],
];
const TIMELINE = [
  ["2016", "The company is established.", "Perusahaan didirikan."],
  ["2018", "First partnership signed in agriculture.", "Kemitraan pertama di bidang pertanian ditandatangani."],
  ["2020", "A portfolio support team is formed.", "Tim pendukung portofolio dibentuk."],
  ["2022", "Sustainability reporting begins.", "Pelaporan keberlanjutan dimulai."],
  ["2024", "Expansion into healthcare and financial services.", "Perluasan ke bidang kesehatan dan jasa keuangan."],
  ["2026", "Corporate identity v1.0 introduced.", "Identitas korporat v1.0 diperkenalkan."],
];
pages.push({
  path: "about/", nav: "about/",
  titleEn: "About | Altura", titleId: "Tentang | Altura",
  descEn: "Who Altura is, what we believe, and how we have grown.", descId: "Siapa Altura, apa yang kami yakini, dan bagaimana kami bertumbuh.",
  main: `${hero("About Altura", "Tentang Altura", "A long-term investment and funding company built on structure, continuity, and a clear direction.", "Perusahaan investasi dan pendanaan jangka panjang yang dibangun di atas struktur, kesinambungan, dan arah yang jelas.")}

    <section class="section">
      <div class="wrap split">
        <h2>${T("A long-term view, applied with discipline.", "Pandangan jangka panjang, dijalankan dengan disiplin.")}</h2>
        <div class="prose">
          <p>${T("Altura invests in businesses that can grow responsibly over many years. We act as a partner rather than a passing investor: we take time to understand a business, we agree on clear terms, and we stay close as it grows.", "Altura berinvestasi pada bisnis yang dapat tumbuh secara bertanggung jawab selama bertahun-tahun. Kami bertindak sebagai mitra, bukan investor yang singgah: kami meluangkan waktu untuk memahami bisnis, menyepakati ketentuan yang jelas, dan tetap dekat seiring pertumbuhannya.")}</p>
          <p>${T("Our name points upward, and so does our work. The symbol of a single flowing line stands for structure, continuity, and the direction we want every partnership to take.", "Nama kami mengarah ke atas, begitu pula pekerjaan kami. Simbol berupa satu garis yang mengalir mewakili struktur, kesinambungan, dan arah yang ingin kami tuju dalam setiap kemitraan.")}</p>
        </div>
      </div>
    </section>

    <section class="section section-tint">
      <div class="wrap duo">
        <div class="duo-item">${icon("eye", "duo-icon")}<h2>${T("Vision", "Visi")}</h2><p>${T("Sustainable growth that creates lasting value for partners, communities, and the people who work with us.", "Pertumbuhan berkelanjutan yang menciptakan nilai bertahan lama bagi mitra, masyarakat, dan orang-orang yang bekerja bersama kami.")}</p></div>
        <div class="duo-item">${icon("target", "duo-icon")}<h2>${T("Mission", "Misi")}</h2><p>${T("To invest with a long-term perspective, build strategic partnerships, and report our progress honestly.", "Berinvestasi dengan perspektif jangka panjang, membangun kemitraan strategis, dan melaporkan kemajuan kami secara jujur.")}</p></div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <h2>${T("What guides us", "Yang memandu kami")}</h2>
        <ul class="grid-ruled grid-2 spaced">
          ${VALUES.map(([i, ten, tid, den, did]) => `<li class="cell">${icon(i, "cell-icon")}<h3>${T(ten, tid)}</h3><p>${T(den, did)}</p></li>`).join("\n          ")}
        </ul>
      </div>
    </section>

    <section class="section section-tint">
      <div class="wrap split">
        <h2>${T("Our journey", "Perjalanan kami")}</h2>
        <ol class="timeline">
          ${TIMELINE.map(([y, en, id]) => `<li><span class="tl-year">${y}</span><p>${T(en, id)}</p></li>`).join("\n          ")}
        </ol>
      </div>
    </section>

${cta()}`,
});

// FOCUS
const STEPS = [
  ["Source", "Temukan", "We meet founders and operators through sector networks and referrals.", "Kami bertemu pendiri dan operator melalui jaringan sektor dan rekomendasi."],
  ["Evaluate", "Nilai", "We test the business model, the team, and the data behind the plan.", "Kami menguji model bisnis, tim, dan data di balik rencana."],
  ["Partner", "Bermitra", "We agree on terms, governance, and the support we will provide.", "Kami menyepakati ketentuan, tata kelola, dan dukungan yang akan kami berikan."],
  ["Grow", "Tumbuh", "We help with hiring, operations, and access to new markets.", "Kami membantu perekrutan, operasional, dan akses ke pasar baru."],
  ["Review", "Tinjau", "We review progress against agreed measures and adjust together.", "Kami meninjau kemajuan terhadap ukuran yang disepakati dan menyesuaikan bersama."],
];
const CRITERIA = [
  ["scale", "Sound economics", "Ekonomi yang sehat", "A business model that works at the unit level, not only on a forecast.", "Model bisnis yang berjalan di tingkat unit, bukan hanya di atas proyeksi."],
  ["users", "Capable, candid management", "Manajemen yang cakap dan terbuka", "People who share bad news early and ask for help when they need it.", "Orang-orang yang menyampaikan kabar buruk lebih awal dan meminta bantuan saat perlu."],
  ["leaf", "Responsible practices", "Praktik yang bertanggung jawab", "Fair treatment of staff, suppliers, customers, and the environment.", "Perlakuan yang adil terhadap karyawan, pemasok, pelanggan, dan lingkungan."],
  ["trending-up", "Room to grow", "Ruang untuk tumbuh", "A credible path to growing steadily over many years.", "Jalur yang dapat dipercaya untuk tumbuh stabil selama bertahun-tahun."],
];
pages.push({
  path: "focus/", nav: "focus/",
  titleEn: "Focus areas | Altura", titleId: "Bidang fokus | Altura",
  descEn: "The sectors Altura invests in and how we choose partners.", descId: "Sektor tempat Altura berinvestasi dan cara kami memilih mitra.",
  main: `${hero("Where and how we invest", "Tempat dan cara kami berinvestasi", "Six focus areas, one approach: patient capital, clear terms, and close support.", "Enam bidang fokus, satu pendekatan: modal sabar, ketentuan yang jelas, dan pendampingan yang dekat.")}

    <section class="section">
      <div class="wrap">
        <h2>${T("Focus areas", "Bidang fokus")}</h2>
        <ul class="sectors">
          ${SECTORS.map((s) => {
            const names = PORTFOLIO.filter((c) => c.sec === s.key).map((c) => c.name).join(", ");
            return `<li>${icon(s.icon, "sector-icon")}<div><h3>${T(s.en, s.id)}</h3><p>${T(s.longEn, s.longId)}</p>${names ? `<p class="in-portfolio"><strong>${T("In the portfolio", "Dalam portofolio")}</strong> ${names}</p>` : ""}</div></li>`;
          }).join("\n          ")}
        </ul>
      </div>
    </section>

    <section class="section section-tint">
      <div class="wrap">
        <h2>${T("How a partnership works", "Cara kerja sebuah kemitraan")}</h2>
        <ol class="steps">
          ${STEPS.map(([en, id, den, did], i) => `<li><span class="step-n" aria-hidden="true">${i + 1}</span><h3>${T(en, id)}</h3><p>${T(den, did)}</p></li>`).join("\n          ")}
        </ol>
      </div>
    </section>

    <section class="section">
      <div class="wrap split">
        <div>
          <h2>${T("What we look for", "Yang kami cari")}</h2>
          <p class="lead">${T("The same four questions apply in every sector.", "Empat pertanyaan yang sama berlaku di setiap sektor.")}</p>
        </div>
        <ul class="points">
          ${CRITERIA.map(([i, ten, tid, den, did]) => `<li>${icon(i)}<div><h3>${T(ten, tid)}</h3><p>${T(den, did)}</p></div></li>`).join("\n          ")}
        </ul>
      </div>
    </section>

${cta()}`,
});

// PORTFOLIO
pages.push({
  path: "portfolio/", nav: "portfolio/",
  titleEn: "Portfolio | Altura", titleId: "Portofolio | Altura",
  descEn: "Patdua and Nema, the partners Altura supports today.", descId: "Patdua dan Nema, mitra yang saat ini didukung Altura.",
  main: `${hero("Our partners", "Mitra kami", "Businesses we support over the long term.", "Bisnis yang kami dukung dalam jangka panjang.")}

${PORTFOLIO.map((c) => `    <section class="section brand brand-${c.slug}" id="${c.slug}">
      <div class="wrap">
        <div class="company-head">${mark(c)}<h2>${c.name}</h2><span class="tile-sector">${sectorIcon(c.sec)}${T(sector(c.sec).en, sector(c.sec).id)}</span></div>
        <div class="split">
          <div>
            <p class="lead">${T(c.en, c.id)}</p>
            <p class="copy-block">${T(c.moreEn, c.moreId)}</p>
            ${c.ig ? `<p class="tile-since"><a href="https://instagram.com/${c.ig}" target="_blank" rel="noopener">@${c.ig}</a></p>` : ""}
          </div>
          <dl class="facts">
            ${c.facts.map((f) => `<div><dt>${T(f[0], f[1])}</dt><dd>${T(f[2], f[3])}</dd></div>`).join("\n            ")}
          </dl>
        </div>
        <ul class="gallery">
          ${c.gallery.map((g) => `<li><img src="${href(g[0])}" alt="${g[1]}" loading="lazy"></li>`).join("\n          ")}
        </ul>
      </div>
    </section>

`).join("")}${cta()}`,
});

// INSIGHTS (index)
pages.push({
  path: "insights/", nav: "insights/",
  titleEn: "News | Altura", titleId: "Berita | Altura",
  descEn: "Current news on investment and SMEs in Indonesia, with links to the original reports.", descId: "Berita terkini investasi dan UMKM di Indonesia, dengan tautan ke laporan aslinya.",
  main: `${hero("News", "Berita", "Current news on investment and SMEs in Indonesia, with links to the original reports.", "Berita terkini investasi dan UMKM di Indonesia, dengan tautan ke laporan aslinya.")}

    <section class="section" data-filter-scope>
      <div class="wrap">
        <div class="filters" role="group" aria-label="Filter by type" data-id-aria-label="Saring menurut jenis">
          <button type="button" data-filter="all" aria-pressed="true">${T("All", "Semua")}</button>
          ${Object.entries(CATS).map(([k, c]) => `<button type="button" data-filter="${k}" aria-pressed="false">${icon(c.icon)}${T(c.en, c.id)}</button>`).join("\n          ")}
        </div>
        <ul class="rows rows-filter">
          ${ARTICLES.map(articleRow).join("\n          ")}
        </ul>
      </div>
    </section>
    ${newsModals(ARTICLES)}

${cta()}`,
});

// TEAM
pages.push({
  path: "team/", nav: "team/",
  titleEn: "Team | Altura", titleId: "Tim | Altura",
  descEn: "Contact details and office address of PT. Altura Abadi Investama.", descId: "Kontak dan alamat kantor PT. Altura Abadi Investama.",
  main: `${hero("The Altura team", "Tim Altura", "Reach the team at PT. Altura Abadi Investama directly.", "Hubungi langsung tim PT. Altura Abadi Investama.")}

    <section class="section">
      <div class="wrap split">
        <div>
          <h2>${T("Office and contact", "Kantor dan kontak")}</h2>
          <p class="lead">PT. Altura Abadi Investama</p>
        </div>
        <dl class="contact-list">
          <div><dt>${icon("mail")}<span>Email</span></dt><dd><a href="mailto:contact@alturainvestama.com">contact@alturainvestama.com</a><br><a href="mailto:reza.pr@alturainvestama.com">reza.pr@alturainvestama.com</a></dd></div>
          <div><dt>${icon("phone")}${T("Phone", "Telepon")}</dt><dd><a href="tel:+6282132402323">+62 821 3240 2323</a></dd></div>
          <div><dt>${icon("map-pin")}${T("Address", "Alamat")}</dt><dd>Saraswati AMG Tower, Jl. Dukuh Menanggal No. 1A Lt. 19, Dukuh Menanggal, Kec. Gayungan, Surabaya, Jawa Timur 60234</dd></div>
        </dl>
      </div>
    </section>

    <section class="section section-tint">
      <div class="wrap split">
        <div>
          <h2>${T("Advisors", "Penasihat")}</h2>
          <p class="lead">${T("Practitioners who challenge our thinking and open doors.", "Para praktisi yang menantang cara berpikir kami dan membuka jalan.")}</p>
        </div>
        <ul class="points">
          <li>${icon("zap")}<div><h3>${T("Energy and infrastructure", "Energi dan infrastruktur")}</h3><p>${T("Former operators of power and water utilities.", "Mantan operator utilitas listrik dan air.")}</p></div></li>
          <li>${icon("wheat")}<div><h3>${T("Agriculture and food", "Pertanian dan pangan")}</h3><p>${T("Agronomists and supply-chain specialists.", "Ahli agronomi dan spesialis rantai pasok.")}</p></div></li>
          <li>${icon("heart-pulse")}<div><h3>${T("Healthcare", "Kesehatan")}</h3><p>${T("Clinicians and health-service managers.", "Klinisi dan manajer layanan kesehatan.")}</p></div></li>
        </ul>
      </div>
    </section>

${cta()}`,
});

// CONTACT
const FAQ = [
  ["Who can contact Altura?", "Siapa yang dapat menghubungi Altura?", "Founders, operators, co-investors, and partners. Tell us briefly what you are building.", "Pendiri, operator, rekan investasi, dan mitra. Ceritakan secara singkat apa yang sedang Anda bangun."],
  ["How long does a reply take?", "Berapa lama balasan diterima?", "We aim to reply within five business days.", "Kami berupaya membalas dalam lima hari kerja."],
  ["Do you invest in early-stage ideas?", "Apakah Altura berinvestasi pada ide tahap awal?", "We focus on businesses with an operating history and a clear plan to grow responsibly.", "Kami berfokus pada bisnis yang sudah beroperasi dan memiliki rencana jelas untuk tumbuh secara bertanggung jawab."],
  ["Can I send confidential documents?", "Bolehkah saya mengirim dokumen rahasia?", "Please do not send confidential material through the form. We will agree on a secure channel after the first conversation.", "Mohon jangan kirim materi rahasia melalui formulir. Kami akan menyepakati saluran yang aman setelah percakapan pertama."],
];
pages.push({
  path: "contact/", nav: "contact/",
  titleEn: "Contact | Altura", titleId: "Kontak | Altura",
  descEn: "Get in touch with the Altura team.", descId: "Hubungi tim Altura.",
  main: `${hero("Contact", "Kontak", "Tell the Altura team about your business and goals.", "Ceritakan bisnis dan tujuan Anda kepada tim Altura.")}

    <section class="section">
      <div class="wrap split">
        <div>
          <h2>${T("Send us a message", "Kirim pesan kepada kami")}</h2>
          <form class="form" novalidate>
            <label>${T("Name", "Nama")}<input name="name" type="text" autocomplete="name" required></label>
            <label>Email<input name="email" type="email" autocomplete="email" required></label>
            <label>${T("Topic", "Topik")}
              <select name="topic">
                <option data-id="Kemitraan">Partnership</option>
                <option data-id="Rekan investasi">Co-investment</option>
                <option data-id="Media dan acara">Media and events</option>
                <option data-id="Lainnya">Other</option>
              </select>
            </label>
            <label>${T("Message", "Pesan")}<textarea name="message" rows="5" required></textarea></label>
            <button class="btn" type="submit">${icon("send")}${T("Send message", "Kirim pesan")}</button>
            <p class="form-status" role="status" data-en="This is a mockup. Nothing was sent." data-id="Ini hanyalah mockup. Tidak ada pesan yang terkirim." hidden></p>
          </form>
        </div>
        <div>
          <h2>${T("Details", "Detail")}</h2>
          <dl class="contact-list">
            <div><dt>${icon("mail")}<span>Email</span></dt><dd><a href="mailto:contact@alturainvestama.com">contact@alturainvestama.com</a><br><a href="mailto:reza.pr@alturainvestama.com">reza.pr@alturainvestama.com</a></dd></div>
            <div><dt>${icon("phone")}${T("Phone", "Telepon")}</dt><dd><a href="tel:+6282132402323">+62 821 3240 2323</a></dd></div>
            <div><dt>${icon("map-pin")}${T("Address", "Alamat")}</dt><dd>Saraswati AMG Tower, Jl. Dukuh Menanggal No. 1A Lt. 19, Dukuh Menanggal, Kec. Gayungan, Surabaya, Jawa Timur 60234</dd></div>
          </dl>
        </div>
      </div>
    </section>

    <section class="section section-tint">
      <div class="wrap split">
        <h2>${T("Before you write", "Sebelum Anda menulis")}</h2>
        <div class="faq">
          ${FAQ.map(([qen, qid, aen, aid]) => `<details><summary>${T(qen, qid)}${icon("chevron-down")}</summary><p>${T(aen, aid)}</p></details>`).join("\n          ")}
        </div>
      </div>
    </section>`,
});

/* ---------- write ---------- */

for (const p of pages) {
  const file = join(OUT, p.path, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, frame(p));
}
if (ROOT) {
  // Aset (CSS, JS, gambar, font) disalin dari versi mockup; awalan path diganti ke akar.
  const SRC = join(here, "..", "public", "altura-mockup");
  for (const f of readdirSync(SRC, { withFileTypes: true })) {
    if (f.name === "index.html" || (f.isDirectory() && !["img", "fonts"].includes(f.name))) continue;
    cpSync(join(SRC, f.name), join(OUT, f.name), { recursive: true });
  }
  for (const f of ["styles.css", "app.js"]) {
    const p = join(OUT, f);
    writeFileSync(p, readFileSync(p, "utf8").replaceAll("/altura-mockup/", "/"));
  }
}
console.log(`wrote ${pages.length} pages to ${OUT}`);
