import fs from "node:fs";
import path from "node:path";

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});
const englishFiles = walk("en").filter((file) => file.endsWith(".html"));
const errors = [];

for (const englishFile of englishFiles) {
  const source = englishFile.replace(/^en\//, "");
  if (!fs.existsSync(source)) errors.push(`${englishFile}: Japanese counterpart missing`);
  const en = fs.readFileSync(englishFile, "utf8");
  const ja = fs.readFileSync(source, "utf8");
  if (!en.includes('<html lang="en">')) errors.push(`${englishFile}: lang=en missing`);
  if (!en.includes('class="language-switcher"')) errors.push(`${englishFile}: language switcher missing`);
  if (!en.includes('rel="alternate" hreflang="ja"')) errors.push(`${englishFile}: hreflang=ja missing`);
  if (!en.match(/rel="canonical" href="[^"]+\/homepage\/en\//)) errors.push(`${englishFile}: English canonical missing`);
  const allowedJapanese = en.replaceAll(/<span lang="ja">[\s\S]*?<\/span>/g, "");
  if (/[぀-ヿ㐀-鿿]/u.test(allowedJapanese)) errors.push(`${englishFile}: untranslated Japanese text remains`);
  if (!ja.includes('class="language-switcher"')) errors.push(`${source}: language switcher missing`);
  if (!ja.includes('rel="alternate" hreflang="en"')) errors.push(`${source}: hreflang=en missing`);
  if (source.includes("pages/methods/") || source === "pages/electronic-structure.html") {
    const sectionCount = (html) => (html.match(/class="docs-section"/g) || []).length;
    const exampleCount = (html) => (html.match(/<pre(?:\s|>)/g) || []).length;
    if (sectionCount(en) < sectionCount(ja)) errors.push(`${englishFile}: fewer documentation sections than Japanese source`);
    if (exampleCount(en) < exampleCount(ja)) errors.push(`${englishFile}: fewer executable examples than Japanese source`);
  }
  if (en.includes("http://sobereva.com/multiwfn")) errors.push(`${englishFile}: insecure Multiwfn link remains`);
  if (en.includes("<msubsup><mo>∥")) errors.push(`${englishFile}: malformed norm MathML remains`);
}

if (englishFiles.length !== 22) errors.push(`Expected 22 English pages, found ${englishFiles.length}`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`i18n check OK: ${englishFiles.length} Japanese/English page pairs`);
