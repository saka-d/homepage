import { expandMethodSections } from "./en_method_expansions.mjs";

const electronicChapters = [
  ["rdkit", "01 RDKit"], ["xtb", "02 xTB"], ["gaussian", "03 Gaussian"],
  ["grrm", "04 GRRM"], ["pyscf", "05 PySCF"], ["psi4", "06 Psi4"],
  ["orca", "07 ORCA"], ["cube", "08 Cube"], ["multiwfn", "09 Multiwfn"],
  ["nciplot", "10 NCIplot"], ["py3dmol", "11 py3Dmol"],
];
const dataChapters = [
  ["cheminformatics", "B1 RDKit cheminformatics"],
  ["data-analysis", "B2 Data analysis"],
  ["steric-descriptors", "B3 Steric descriptors"],
];

export function chapterNav(type, active) {
  const chapters = type === "data" ? dataChapters : electronicChapters;
  const navClass = type === "data" ? "track-switcher" : "methods-switcher";
  const innerClass = type === "data" ? "track-switcher-inner" : "methods-switcher-inner";
  const label = type === "data" ? "Chemical data chapters" : "Electronic structure chapters";
  const links = chapters.map(([slug, title]) => `<a href="${slug}.html"${slug === active ? ' class="active" aria-current="page"' : ""}>${title}</a>`).join("");
  return `<nav class="${navClass}" aria-label="${label}"><div class="container ${innerClass}">${links}</div></nav>`;
}

export function methodPage({ slug, title, eyebrow, lead, position, input, output, type = "electronic", sections, description }) {
  sections = expandMethodSections(slug, sections);
  const toc = sections.map((section) => `<li><a href="#${section.id}">${section.toc || section.title}</a></li>`).join("");
  const content = sections.map((section, index) => `<section class="docs-section" id="${section.id}"><h2>${index + 1}. ${section.title}</h2>${section.html}</section>`).join("");
  const number = type === "data" ? dataChapters.find(([name]) => name === slug)?.[1].split(" ")[0] : electronicChapters.find(([name]) => name === slug)?.[1].split(" ")[0];
  return {
    file: `pages/methods/${slug}.html`, active: "methods", ogType: "article",
    title: `${title} | Computational Chemistry Notes`, description,
    subnav: chapterNav(type, slug),
    body: `<section class="page-hero docs-hero"><div class="container"><p class="breadcrumb"><a href="index.html">Computational Chemistry Notes</a> / ${number} ${title}</p><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="lead">${lead}</p><dl class="tool-summary"><div><dt>Role</dt><dd>${position}</dd></div><div><dt>Typical input</dt><dd>${input}</dd></div><div><dt>Typical output</dt><dd>${output}</dd></div></dl></div></section><section class="section-band"><div class="container docs-layout"><aside class="docs-toc" aria-label="Page contents"><h2>In this chapter</h2><ol>${toc}</ol></aside><div class="docs-content">${content}</div></div></section>`,
  };
}

export const codeBlock = (id, label, code) => `<div class="code-sample"><div class="code-label"><span>${label}</span><button class="copy-button" type="button" data-copy-target="${id}">Copy</button></div><pre id="${id}"><code>${code}</code></pre></div>`;
