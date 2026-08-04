import { renderEnglishPage } from "./i18n/render_en.mjs";
import fs from "node:fs";
import { mainPages } from "./i18n/en_main_pages.mjs";
import { academicPages } from "./i18n/en_academic_pages.mjs";
import { methodPagesCore1 } from "./i18n/en_methods_core1.mjs";
import { methodPagesCore2 } from "./i18n/en_methods_core2.mjs";
import { methodPagesData } from "./i18n/en_methods_data.mjs";

const pages = [...mainPages, ...academicPages, ...methodPagesCore1, ...methodPagesCore2, ...methodPagesData];
for (const page of pages) renderEnglishPage(page);

const base = "https://saka-d.github.io/homepage";
const sitemapEntries = pages.flatMap((page) => {
  const ja = page.file === "index.html" ? `${base}/` : `${base}/${page.file}`;
  const en = page.file === "index.html" ? `${base}/en/` : `${base}/en/${page.file}`;
  const alternates = `<xhtml:link rel="alternate" hreflang="ja" href="${ja}"/><xhtml:link rel="alternate" hreflang="en" href="${en}"/><xhtml:link rel="alternate" hreflang="x-default" href="${ja}"/>`;
  const priority = page.file === "index.html" ? "<priority>1.0</priority>" : "";
  return [
    `<url><loc>${ja}</loc><lastmod>2026-08-04</lastmod>${priority}${alternates}</url>`,
    `<url><loc>${en}</loc><lastmod>2026-08-04</lastmod>${alternates}</url>`,
  ];
});
fs.writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapEntries.join("\n")}
</urlset>
`);
