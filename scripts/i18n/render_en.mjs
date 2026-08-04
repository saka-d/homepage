import fs from "node:fs";
import path from "node:path";

const base = "https://saka-d.github.io/homepage";
const navItems = [
  ["home", "Home", "index.html"],
  ["about", "About", "pages/about.html"],
  ["research", "Research", "pages/research.html"],
  ["methods", "Methods", "pages/methods/index.html"],
  ["publications", "Publications", "pages/publications.html"],
  ["cv", "CV", "pages/cv.html"],
  ["contact", "Contact", "pages/contact.html"],
];

function relative(fromDir, target) {
  const value = path.relative(fromDir, target).replaceAll(path.sep, "/");
  return value || ".";
}

export function renderEnglishPage(page) {
  const source = page.file;
  const output = path.join("en", source);
  const outputDir = path.dirname(output);
  const enRoot = "en";
  const assets = relative(outputDir, "assets");
  const styles = relative(outputDir, "styles");
  const scripts = relative(outputDir, "scripts");
  const japaneseHref = relative(outputDir, source);
  const englishHref = path.basename(output);
  const sourceUrl = source === "index.html" ? `${base}/` : `${base}/${source}`;
  const englishUrl = source === "index.html" ? `${base}/en/` : `${base}/en/${source}`;
  const nav = navItems.map(([key, label, target]) => {
    const href = relative(outputDir, path.join(enRoot, target));
    const current = key === page.active ? ' class="active" aria-current="page"' : "";
    return `<li><a href="${href}"${current}>${label}</a></li>`;
  }).join("");
  const body = page.body.replaceAll("{{ASSETS}}", assets);
  const extraHead = page.extraHead?.replaceAll("{{ASSETS}}", assets) || "";

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(output, `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${page.description}">
    <link rel="canonical" href="${englishUrl}"><link rel="alternate" hreflang="ja" href="${sourceUrl}"><link rel="alternate" hreflang="en" href="${englishUrl}"><link rel="alternate" hreflang="x-default" href="${sourceUrl}">
    <meta property="og:type" content="${page.ogType || "website"}"><meta property="og:locale" content="en_US"><meta property="og:site_name" content="Daimon Sakaguchi"><meta property="og:title" content="${page.title}"><meta property="og:description" content="${page.description}"><meta property="og:url" content="${englishUrl}"><meta name="twitter:card" content="summary">
    <title>${page.title}</title><link rel="icon" href="${assets}/profile-placeholder.svg" type="image/svg+xml"><link rel="stylesheet" href="${styles}/main.css?v=20260804-6">${extraHead}
</head>
<body>
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header"><nav class="navbar" aria-label="Main navigation"><a class="site-title" href="${relative(outputDir, "en/index.html")}">Daimon Sakaguchi</a><button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" aria-label="Toggle navigation"><span></span><span></span><span></span></button><ul class="nav-menu" id="primary-navigation">${nav}</ul><div class="language-switcher" aria-label="Language"><a href="${japaneseHref}" lang="ja" hreflang="ja" aria-label="Japanese">JA</a><a href="${englishHref}" lang="en" hreflang="en" class="active" aria-current="page" aria-label="English">EN</a></div></nav></header>
${page.subnav || ""}
    <main id="main">${body}</main>
    <footer class="site-footer"><div class="container footer-inner"><p>&copy; <span data-current-year>2026</span> Sakaguchi Daimon.</p><p><a href="https://github.com/saka-d" target="_blank" rel="noopener noreferrer">GitHub</a></p></div></footer>
    <script src="${scripts}/main.js?v=20260804-2"></script>
</body>
</html>
`, "utf8");
}
