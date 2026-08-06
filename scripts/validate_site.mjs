import fs from "node:fs";
import path from "node:path";
import { publications } from "./data/publications.mjs";
import { siteConfig } from "./site-config.mjs";

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});
const htmlFiles = ["index.html", ...walk("pages").filter((file) => file.endsWith(".html")), ...walk("en").filter((file) => file.endsWith(".html"))]
  .filter((file) => !file.endsWith("computational-chemistry.html") && !file.endsWith("gaussian-multiwfn-nci.html") && !file.endsWith("rdkit-workflow.html"));
const errors = [];
const canonicals = new Map();
const bannedJapaneseFragments = [
  "一点計算計算",
  "場s",
  "手法s",
  "グリッド data",
  "Interaction エネルギー",
  "dual 記述子",
];

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!canonical?.startsWith(`${siteConfig.baseUrl}/`)) errors.push(`${file}: invalid canonical URL`);
  if (canonical) {
    if (canonicals.has(canonical)) errors.push(`${file}: duplicate canonical with ${canonicals.get(canonical)}`);
    canonicals.set(canonical, file);
  }
  if (!html.includes('rel="alternate" hreflang="ja"') || !html.includes('rel="alternate" hreflang="en"')) errors.push(`${file}: bilingual hreflang missing`);
  if (!html.includes('meta name="description"') || !html.includes('meta name="author"')) errors.push(`${file}: description or author metadata missing`);
  const analyticsBlocks = html.match(/<script data-google-analytics>/g) || [];
  if (analyticsBlocks.length !== 1) errors.push(`${file}: expected exactly one Google Analytics block, found ${analyticsBlocks.length}`);
  if (!html.includes(siteConfig.analyticsMeasurementId)) errors.push(`${file}: Google Analytics measurement ID missing`);
  if (!html.includes('window.location.hostname === "saka-d.github.io"')) errors.push(`${file}: production-only analytics guard missing`);
  if (!/href="[^"]*privacy\.html"/.test(html)) errors.push(`${file}: analytics privacy link missing`);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json"(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
  if (schemas.length !== 1) errors.push(`${file}: expected exactly one JSON-LD block, found ${schemas.length}`);
  for (const match of schemas) {
    try {
      const schema = JSON.parse(match[1]);
      if (!Array.isArray(schema["@graph"])) errors.push(`${file}: JSON-LD @graph missing`);
    } catch (error) { errors.push(`${file}: invalid JSON-LD (${error.message})`); }
  }

  if (!file.startsWith("en/") && file.endsWith(".html")) {
    for (const fragment of bannedJapaneseFragments) {
      if (html.includes(fragment)) errors.push(`${file}: broken Japanese fragment "${fragment}"`);
    }
    if (html.includes(">Skip to content<") || html.includes('aria-label="Toggle navigation"') || html.includes('aria-label="Page contents"')) {
      errors.push(`${file}: untranslated interface label remains`);
    }
  }

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) errors.push(`${file}: duplicate IDs ${[...new Set(duplicates)].join(", ")}`);

  for (const match of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (!target || target.startsWith("#") || /^(https?:|mailto:|data:|javascript:)/.test(target)) continue;
    const clean = target.split(/[?#]/)[0];
    if (!clean) continue;
    const resolved = path.resolve(path.dirname(file), clean);
    if (!fs.existsSync(resolved)) errors.push(`${file}: missing local target ${target}`);
  }
}

for (const lang of ["ja", "en"]) {
  const file = `assets/search-index.${lang}.json`;
  let index;
  try { index = JSON.parse(fs.readFileSync(file, "utf8")); } catch (error) {
    errors.push(`${file}: invalid JSON (${error.message})`);
    continue;
  }
  if (index.length < 25) errors.push(`${file}: unexpectedly short search index`);
  const baseDir = lang === "ja" ? "pages" : "en/pages";
  for (const item of index) {
    if (!item.title || !item.url || !item.description) errors.push(`${file}: incomplete search entry`);
    if (!fs.existsSync(path.resolve(baseDir, item.url))) errors.push(`${file}: missing indexed page ${item.url}`);
  }
}

for (const file of walk("assets/calculations").filter((item) => item.endsWith("metadata.json"))) {
  try {
    const metadata = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!metadata.example || !metadata.software || !metadata.note) errors.push(`${file}: example, software, or note missing`);
  } catch (error) {
    errors.push(`${file}: invalid JSON (${error.message})`);
  }
}

const glossaryJa = fs.readFileSync("pages/methods/glossary.html", "utf8");
const glossaryEn = fs.readFileSync("en/pages/methods/glossary.html", "utf8");
if ((glossaryJa.match(/data-glossary-entry/g) || []).length < 40) errors.push("Japanese glossary has fewer than 40 entries");
if ((glossaryEn.match(/data-glossary-entry/g) || []).length < 40) errors.push("English glossary has fewer than 40 entries");
if (!glossaryEn.includes("<dt>IGM / IGMH</dt>")) errors.push("English glossary does not preserve the IGM / IGMH label");

for (const file of ["pages/publications.html", "en/pages/publications.html"]) {
  const html = fs.readFileSync(file, "utf8");
  const visibleCount = (html.match(/class="publication-item"/g) || []).length;
  if (visibleCount !== publications.length) errors.push(`${file}: expected ${publications.length} visible publications, found ${visibleCount}`);
  const raw = html.match(/<script type="application\/ld\+json" data-site-schema>([\s\S]*?)<\/script>/)?.[1];
  if (!raw) continue;
  try {
    const schema = JSON.parse(raw);
    const page = schema["@graph"]?.find((item) => item["@type"] === "CollectionPage");
    const items = page?.mainEntity?.itemListElement || [];
    if (items.length !== publications.length) errors.push(`${file}: structured publication count does not match source data`);
    for (const entry of items) {
      if (!Array.isArray(entry.item?.author) || entry.item.author.length < 2) errors.push(`${file}: publication author list is incomplete`);
    }
  } catch {
    // The general JSON-LD check reports malformed data.
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Site validation OK: ${htmlFiles.length} pages, ${canonicals.size} canonical URLs.`);
