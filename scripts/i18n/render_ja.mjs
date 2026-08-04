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

const relative = (fromDir, target) => path.relative(fromDir, target).replaceAll(path.sep, "/") || ".";

export function renderJapanesePage(page) {
  const output = page.file;
  const outputDir = path.dirname(output);
  const assets = relative(outputDir, "assets");
  const styles = relative(outputDir, "styles");
  const scripts = relative(outputDir, "scripts");
  const englishHref = relative(outputDir, path.join("en", page.file));
  const sourceUrl = page.file === "index.html" ? `${base}/` : `${base}/${page.file}`;
  const englishUrl = page.file === "index.html" ? `${base}/en/` : `${base}/en/${page.file}`;
  const nav = navItems.map(([key, label, target]) => {
    const current = key === page.active ? ' class="active" aria-current="page"' : "";
    return `<li><a href="${relative(outputDir, target)}"${current}>${label}</a></li>`;
  }).join("");

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(output, `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${page.description}">
    <link rel="canonical" href="${sourceUrl}"><link rel="alternate" hreflang="ja" href="${sourceUrl}"><link rel="alternate" hreflang="en" href="${englishUrl}"><link rel="alternate" hreflang="x-default" href="${sourceUrl}">
    <meta property="og:type" content="${page.ogType || "article"}"><meta property="og:locale" content="ja_JP"><meta property="og:site_name" content="坂口 大門 | Daimon Sakaguchi"><meta property="og:title" content="${page.title}"><meta property="og:description" content="${page.description}"><meta property="og:url" content="${sourceUrl}"><meta name="twitter:card" content="summary">
    <title>${page.title}</title><link rel="icon" href="${assets}/profile-placeholder.svg" type="image/svg+xml"><link rel="stylesheet" href="${styles}/main.css?v=20260804-9">
</head>
<body>
    <a class="skip-link" href="#main">本文へ移動</a>
    <header class="site-header"><nav class="navbar" aria-label="Main navigation"><a class="site-title" href="${relative(outputDir, "index.html")}">坂口大門のページ</a><button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" aria-label="ナビゲーションを開く"><span></span><span></span><span></span></button><ul class="nav-menu" id="primary-navigation">${nav}</ul><div class="language-switcher" aria-label="Language"><a href="${path.basename(output)}" lang="ja" hreflang="ja" class="active" aria-current="page" aria-label="日本語">JA</a><a href="${englishHref}" lang="en" hreflang="en" aria-label="English">EN</a></div></nav></header>
${page.subnav || ""}
    <main id="main">${page.body}</main>
    <footer class="site-footer"><div class="container footer-inner"><p>&copy; <span data-current-year>2026</span> Sakaguchi Daimon.</p><p><a href="https://github.com/saka-d" target="_blank" rel="noopener noreferrer">GitHub</a></p></div></footer>
    <script src="${scripts}/main.js?v=20260804-3"></script>
</body>
</html>
`, "utf8");
}
