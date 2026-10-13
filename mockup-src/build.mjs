// Generates the static pages of the Altura mockup into public/altura-mockup/.
// Run: node mockup-src/build.mjs   (no dependencies)
// CSS, JS, fonts and icons are authored directly in public/altura-mockup/.

import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, "..", "public", "altura-mockup");
const BASE = "/altura-mockup/";
const SITE = "https://qilo.one";
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
  ["insights/", "Insights", "Wawasan"],
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

// All company names, people, and figures below are invented placeholders.
const PORTFOLIO = [
  { name: "Lumora Energy", sec: "infrastructure", since: 2021, en: "Rooftop solar and storage for mid-sized factories.", id: "Panel surya atap dan penyimpanan energi untuk pabrik skala menengah." },
  { name: "Tirta Grid", sec: "infrastructure", since: 2022, en: "Water recycling systems for industrial parks.", id: "Sistem daur ulang air untuk kawasan industri." },
  { name: "Corevia Labs", sec: "technology", since: 2020, en: "Workflow software for logistics operators.", id: "Perangkat lunak alur kerja untuk operator logistik." },
  { name: "Nusa Ledger", sec: "finance", since: 2021, en: "Bookkeeping and credit tools for small merchants.", id: "Pembukuan dan alat kredit untuk pedagang kecil." },
  { name: "Pasar Hijau", sec: "consumer", since: 2019, en: "Neighbourhood grocery network with local sourcing.", id: "Jaringan toko kelontong lingkungan dengan pasokan lokal." },
  { name: "Kebun Kita", sec: "agri", since: 2022, en: "Cooperative farming platform linking growers to buyers.", id: "Platform pertanian koperasi yang menghubungkan petani dengan pembeli." },
  { name: "Satya Mills", sec: "agri", since: 2018, en: "Regional grain processing with a traceable supply chain.", id: "Pengolahan biji-bijian regional dengan rantai pasok yang dapat dilacak." },
  { name: "Harbor Health", sec: "health", since: 2023, en: "Outpatient clinics with shared diagnostic services.", id: "Klinik rawat jalan dengan layanan diagnostik bersama." },
  { name: "Tandra Home", sec: "consumer", since: 2020, en: "Furniture and home goods made from certified timber.", id: "Furnitur dan perlengkapan rumah dari kayu bersertifikat." },
];
const initials = (n) => n.split(" ").map((w) => w[0]).join("").slice(0, 2);

const CATS = {
  report: { icon: "file-text", en: "Report", id: "Laporan" },
  article: { icon: "newspaper", en: "Article", id: "Artikel" },
  event: { icon: "calendar-days", en: "Event", id: "Acara" },
};
const ARTICLES = [
  { slug: "patient-capital-in-practice", cat: "article", d: "2026-09-18", min: 6,
    tEn: "Patient capital in practice", tId: "Modal sabar dalam praktik",
    xEn: "What a ten-year view changes about how we choose, support, and review a partnership.",
    xId: "Apa yang berubah dari cara kami memilih, mendampingi, dan meninjau kemitraan ketika kami memandang sepuluh tahun ke depan." },
  { slug: "sustainability-framework-v1", cat: "report", d: "2026-08-27", min: 12,
    tEn: "Our sustainability framework, version 1", tId: "Kerangka keberlanjutan kami, versi 1",
    xEn: "How we define measurable impact, and which data we require before we make a claim.",
    xId: "Cara kami mendefinisikan dampak yang terukur, dan data apa yang kami butuhkan sebelum menyampaikan klaim." },
  { slug: "partner-briefing-2026", cat: "event", d: "2026-11-12", min: 0,
    tEn: "Partner briefing: long-term value in 2027", tId: "Pertemuan mitra: nilai jangka panjang di 2027",
    xEn: "An evening for partners and co-investors to review progress and discuss the year ahead.",
    xId: "Pertemuan malam bagi mitra dan rekan investasi untuk meninjau kemajuan dan membahas tahun mendatang." },
  { slug: "reading-a-balance-sheet-for-resilience", cat: "article", d: "2026-07-30", min: 5,
    tEn: "Reading a balance sheet for resilience", tId: "Membaca neraca untuk melihat ketahanan",
    xEn: "Five questions we ask before we decide whether a business can handle a slow year.",
    xId: "Lima pertanyaan yang kami ajukan untuk menilai apakah sebuah bisnis sanggup melewati tahun yang lesu." },
  { slug: "sector-outlook-agriculture-food", cat: "report", d: "2026-06-24", min: 14,
    tEn: "Sector outlook: agriculture and food", tId: "Prospek sektor: pertanian dan pangan",
    xEn: "Supply, pricing, and traceability trends that shape our view of food businesses.",
    xId: "Tren pasokan, harga, dan keterlacakan yang membentuk pandangan kami terhadap bisnis pangan." },
  { slug: "what-we-look-for-in-a-founding-team", cat: "article", d: "2026-05-14", min: 7,
    tEn: "What we look for in a founding team", tId: "Yang kami cari dalam tim pendiri",
    xEn: "Candour, steady execution, and the habit of asking for help early.",
    xId: "Keterusterangan, eksekusi yang konsisten, dan kebiasaan meminta bantuan sejak dini." },
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
  <meta name="robots" content="noindex">
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
  <div class="veil" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span></div>

  <div class="mock-note" role="note">
    <div class="wrap">${icon("info")}<p>${T("Design mockup. Every name, figure, article, and date on this site is a placeholder.", "Mockup desain. Semua nama, angka, artikel, dan tanggal di situs ini hanyalah contoh.")}</p></div>
  </div>

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
          <ul>${foot([["focus/", "Focus areas", "Bidang fokus"], ["portfolio/", "Portfolio", "Portofolio"], ["insights/", "Insights", "Wawasan"]])}</ul>
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
const companyRow = (c) => `<li>
            <a class="row" href="${href("portfolio/")}">
              <span class="mono" aria-hidden="true">${initials(c.name)}</span>
              <span class="row-body"><strong>${c.name}</strong><span>${T(c.en, c.id)}</span></span>
              <span class="row-side">${sectorIcon(c.sec)}${T(sector(c.sec).en, sector(c.sec).id)}</span>
              ${icon("arrow-up-right", "row-arrow")}
            </a>
          </li>`;
const articleRow = (a) => `<li data-cat="${a.cat}">
            <a class="row row-article" href="${href(`insights/${a.slug}/`)}">
              <span class="row-date">${date(a.d)}</span>
              <span class="row-body"><strong>${T(a.tEn, a.tId)}</strong><span>${T(a.xEn, a.xId)}</span></span>
              <span class="row-side">${icon(CATS[a.cat].icon)}${T(CATS[a.cat].en, CATS[a.cat].id)}</span>
              ${icon("arrow-up-right", "row-arrow")}
            </a>
          </li>`;

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
            <defs><clipPath id="word-clip"><rect class="word-clip" x="0" y="0" width="1801" height="549"/></clipPath></defs>
            <path class="pen" d="${LOGO.d}" data-width="${LOGO.width}"/>
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
          <div><dt>${T("Active since", "Aktif sejak")}</dt><dd>2016</dd></div>
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
        <ul class="rows">
          ${[PORTFOLIO[0], PORTFOLIO[2], PORTFOLIO[5]].map(companyRow).join("\n          ")}
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
          <h2>${T("Latest insights", "Wawasan terbaru")}</h2>
          <a class="link" href="${href("insights/")}">${T("All insights", "Semua wawasan")}${icon("arrow-right")}</a>
        </div>
        <ul class="rows">
          ${ARTICLES.slice(0, 3).map(articleRow).join("\n          ")}
        </ul>
      </div>
    </section>

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
            return `<li>${icon(s.icon, "sector-icon")}<div><h3>${T(s.en, s.id)}</h3><p>${T(s.longEn, s.longId)}</p><p class="in-portfolio"><strong>${T("In the portfolio", "Dalam portofolio")}</strong> ${names}</p></div></li>`;
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
  descEn: "Placeholder companies that show how Altura presents its partners.", descId: "Perusahaan contoh yang menunjukkan cara Altura menampilkan mitranya.",
  main: `${hero("Our partners", "Mitra kami", "Businesses we support over the long term, across six focus areas.", "Bisnis yang kami dukung dalam jangka panjang, di enam bidang fokus.")}

    <section class="section" data-filter-scope>
      <div class="wrap">
        <div class="filters" role="group" aria-label="Filter by focus area" data-id-aria-label="Saring menurut bidang fokus">
          <button type="button" data-filter="all" aria-pressed="true">${T("All", "Semua")}</button>
          ${SECTORS.map((s) => `<button type="button" data-filter="${s.key}" aria-pressed="false">${T(s.en, s.id)}</button>`).join("\n          ")}
        </div>
        <ul class="grid-ruled grid-3 tiles">
          ${PORTFOLIO.map((c) => `<li class="tile" data-cat="${c.sec}">
            <div class="tile-top"><span class="mono" aria-hidden="true">${initials(c.name)}</span><span class="tile-sector">${sectorIcon(c.sec)}${T(sector(c.sec).en, sector(c.sec).id)}</span></div>
            <h3>${c.name}</h3>
            <p>${T(c.en, c.id)}</p>
            <p class="tile-since">${T("Partner since", "Mitra sejak")} ${c.since}</p>
          </li>`).join("\n          ")}
        </ul>
      </div>
    </section>

${cta()}`,
});

// INSIGHTS (index)
pages.push({
  path: "insights/", nav: "insights/",
  titleEn: "Insights | Altura", titleId: "Wawasan | Altura",
  descEn: "Reports, articles, and events from the Altura team.", descId: "Laporan, artikel, dan acara dari tim Altura.",
  main: `${hero("Insights", "Wawasan", "Reports, articles, and events from the Altura team.", "Laporan, artikel, dan acara dari tim Altura.")}

    <section class="section" data-filter-scope>
      <div class="wrap">
        <div class="filters" role="group" aria-label="Filter by type" data-id-aria-label="Saring menurut jenis">
          <button type="button" data-filter="all" aria-pressed="true">${T("All", "Semua")}</button>
          ${Object.entries(CATS).map(([k, c]) => `<button type="button" data-filter="${k}" aria-pressed="false">${icon(c.icon)}${T(c.en + "s", c.id)}</button>`).join("\n          ")}
        </div>
        <ul class="rows rows-filter">
          ${ARTICLES.map(articleRow).join("\n          ")}
        </ul>
      </div>
    </section>

${cta()}`,
});

// INSIGHTS (articles)
const BODY = {
  h1: ["Why this matters", "Mengapa ini penting"],
  p1: ["Altura writes in plain language. We explain our approach, our process, and our goals, and we share claims of impact and performance only when data supports them.", "Altura menulis dengan bahasa yang lugas. Kami menjelaskan pendekatan, proses, dan tujuan kami, dan kami menyampaikan klaim dampak dan kinerja hanya jika ada data pendukung."],
  q: ["We do not promise guaranteed returns. We promise a clear process and honest reporting.", "Kami tidak menjanjikan keuntungan pasti. Kami menjanjikan proses yang jelas dan pelaporan yang jujur."],
  h2: ["What comes next", "Yang akan datang"],
  p2: ["Real articles would add figures, sources, and the names of the people who contributed. Until then, every name, number, and date on this site is a stand-in.", "Artikel sungguhan akan menambahkan angka, sumber, dan nama orang-orang yang berkontribusi. Sampai saat itu, setiap nama, angka, dan tanggal di situs ini hanyalah pengganti."],
  intro: ["This page is placeholder content for the website mockup. It shows how a full article would be laid out: a clear headline, a short summary, readable paragraphs, and related reading at the end.", "Halaman ini berisi konten contoh untuk mockup situs. Halaman ini menunjukkan tata letak artikel lengkap: judul yang jelas, ringkasan singkat, paragraf yang mudah dibaca, dan bacaan terkait di akhir."],
};
for (const a of ARTICLES) {
  const related = ARTICLES.filter((r) => r.slug !== a.slug).slice(0, 2);
  const eventBox = a.cat === "event"
    ? `<dl class="event-box"><div><dt>${icon("calendar-days")}${T("Date", "Tanggal")}</dt><dd>${date(a.d)}</dd></div><div><dt>${icon("clock")}${T("Time", "Waktu")}</dt><dd>${T("18:00 to 20:00 WIB", "18.00 sampai 20.00 WIB")}</dd></div><div><dt>${icon("map-pin")}${T("Venue", "Lokasi")}</dt><dd>${T("To be announced", "Segera diumumkan")}</dd></div></dl>`
    : "";
  const meta = `<p class="article-meta"><span>${icon(CATS[a.cat].icon)}${T(CATS[a.cat].en, CATS[a.cat].id)}</span><span>${date(a.d)}</span>${a.min ? `<span>${icon("clock")}${T(`${a.min} min read`, `${a.min} menit baca`)}</span>` : ""}</p>`;
  pages.push({
    path: `insights/${a.slug}/`, nav: "insights/",
    titleEn: `${a.tEn} | Altura`, titleId: `${a.tId} | Altura`,
    descEn: a.xEn, descId: a.xId,
    main: `${hero(a.tEn, a.tId, a.xEn, a.xId)}

    <article class="section">
      <div class="wrap article">
        <a class="link back" href="${href("insights/")}">${icon("arrow-left")}${T("All insights", "Semua wawasan")}</a>
        ${meta}
        ${eventBox}
        <div class="prose">
          <p>${T(BODY.intro[0], BODY.intro[1])}</p>
          <h2>${T(...BODY.h1)}</h2>
          <p>${T(...BODY.p1)}</p>
          <blockquote><p>${T(...BODY.q)}</p></blockquote>
          <h2>${T(...BODY.h2)}</h2>
          <p>${T(...BODY.p2)}</p>
        </div>
        <section class="related" aria-labelledby="related-h">
          <h2 id="related-h">${T("Related reading", "Bacaan terkait")}</h2>
          <ul class="rows">
            ${related.map(articleRow).join("\n            ")}
          </ul>
        </section>
      </div>
    </article>`,
  });
}

// TEAM
const TEAM = [
  ["Anindya Prasetyo", "Managing Partner", "Mitra Pengelola", "Leads investment strategy and partner relationships.", "Memimpin strategi investasi dan hubungan dengan mitra."],
  ["Raka Wiranata", "Chief Investment Officer", "Kepala Investasi", "Oversees sourcing, evaluation, and portfolio decisions.", "Mengawasi pencarian, penilaian, dan keputusan portofolio."],
  ["Maya Kusuma", "Head of Sustainability", "Kepala Keberlanjutan", "Defines how impact is measured and reported.", "Menetapkan cara dampak diukur dan dilaporkan."],
  ["Dimas Hartono", "Head of Portfolio Support", "Kepala Dukungan Portofolio", "Works with partner teams on operations and hiring.", "Bekerja dengan tim mitra dalam operasional dan perekrutan."],
  ["Sekar Lestari", "Chief Financial Officer", "Kepala Keuangan", "Manages reporting, treasury, and financial controls.", "Mengelola pelaporan, perbendaharaan, dan pengendalian keuangan."],
  ["Bima Santoso", "General Counsel", "Penasihat Hukum Utama", "Leads legal structuring, governance, and compliance.", "Memimpin penataan hukum, tata kelola, dan kepatuhan."],
];
pages.push({
  path: "team/", nav: "team/",
  titleEn: "Team | Altura", titleId: "Tim | Altura",
  descEn: "Placeholder profiles that show how Altura presents its leadership.", descId: "Profil contoh yang menunjukkan cara Altura menampilkan para pemimpinnya.",
  main: `${hero("The people at Altura", "Orang-orang di Altura", "A small team with deep sector experience and a habit of staying close to partners.", "Tim kecil dengan pengalaman sektor yang dalam dan kebiasaan tetap dekat dengan mitra.")}

    <section class="section">
      <div class="wrap">
        <h2>${T("Leadership", "Kepemimpinan")}</h2>
        <ul class="grid-ruled grid-3 spaced">
          ${TEAM.map(([n, ren, rid, ben, bid]) => `<li class="cell person"><span class="mono mono-lg" aria-hidden="true">${initials(n)}</span><h3>${n}</h3><p class="role">${T(ren, rid)}</p><p>${T(ben, bid)}</p></li>`).join("\n          ")}
        </ul>
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
            <div><dt>${icon("mail")}<span>Email</span></dt><dd>hello@altura.example</dd></div>
            <div><dt>${icon("phone")}${T("Phone", "Telepon")}</dt><dd>+62 00 0000 0000</dd></div>
            <div><dt>${icon("map-pin")}${T("Address", "Alamat")}</dt><dd>${T("Office address to be announced", "Alamat kantor segera diumumkan")}</dd></div>
            <div><dt>${icon("clock")}${T("Hours", "Jam kerja")}</dt><dd>${T("Monday to Friday, 09:00 to 17:00 WIB", "Senin sampai Jumat, 09.00 sampai 17.00 WIB")}</dd></div>
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
console.log(`wrote ${pages.length} pages to ${OUT}`);
