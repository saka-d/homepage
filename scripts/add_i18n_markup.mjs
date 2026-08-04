import fs from "node:fs";
import path from "node:path";

const files = [
  "index.html",
  "pages/about.html",
  "pages/contact.html",
  "pages/cv.html",
  "pages/electronic-structure.html",
  "pages/publications.html",
  "pages/research.html",
  "pages/methods/index.html",
  "pages/methods/rdkit.html",
  "pages/methods/xtb.html",
  "pages/methods/gaussian.html",
  "pages/methods/grrm.html",
  "pages/methods/pyscf.html",
  "pages/methods/psi4.html",
  "pages/methods/orca.html",
  "pages/methods/cube.html",
  "pages/methods/multiwfn.html",
  "pages/methods/nciplot.html",
  "pages/methods/py3dmol.html",
  "pages/methods/cheminformatics.html",
  "pages/methods/data-analysis.html",
  "pages/methods/steric-descriptors.html",
  "pages/news.html",
  "pages/research-details.html",
  "pages/methods/reaction-selectivity.html",
  "pages/methods/electronic-descriptors.html",
  "pages/methods/reproducibility.html",
  "pages/methods/glossary.html",
];

for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
  if (!canonical) throw new Error(`Canonical URL not found: ${file}`);

  const englishCanonical = canonical.replace("/homepage/", "/homepage/en/");
  if (!html.includes('rel="alternate" hreflang="ja"')) {
    const alternates = [
      `<link rel="alternate" hreflang="ja" href="${canonical}">`,
      `<link rel="alternate" hreflang="en" href="${englishCanonical}">`,
      `<link rel="alternate" hreflang="x-default" href="${canonical}">`,
    ].join("");
    html = html.replace(
      /(<link rel="canonical" href="[^"]+">)/,
      `$1${alternates}`,
    );
  }

  if (!html.includes('class="language-switcher"')) {
    const currentHref = path.basename(file);
    const englishFile = path.join("en", file).replaceAll(path.sep, "/");
    const englishHref = path
      .relative(path.dirname(file), englishFile)
      .replaceAll(path.sep, "/");
    const switcher = `<div class="language-switcher" aria-label="Language"><a href="${currentHref}" lang="ja" hreflang="ja" class="active" aria-current="page" aria-label="日本語">JA</a><a href="${englishHref}" lang="en" hreflang="en" aria-label="English">EN</a></div>`;
    html = html.replace(/(<\/ul>)(\s*<\/nav>)/, `$1${switcher}$2`);
  }

  html = html.replace(/main\.css\?v=20260804-\d+/g, "main.css?v=20260804-9");
  html = html.replace("main.js?v=20260804-2", "main.js?v=20260804-3");
  fs.writeFileSync(file, html);
}
