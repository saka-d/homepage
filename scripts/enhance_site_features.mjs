import fs from "node:fs";
import path from "node:path";
import { renderEnglishPage } from "./i18n/render_en.mjs";
import { renderJapanesePage } from "./i18n/render_ja.mjs";
import { publicationJsonLd } from "./data/publications.mjs";
import { siteConfig } from "./site-config.mjs";

const base = siteConfig.baseUrl;
const analyticsHost = new URL(base).hostname;
const pageFiles = [
  "index.html", "pages/about.html", "pages/contact.html", "pages/cv.html",
  "pages/electronic-structure.html", "pages/news.html", "pages/publications.html",
  "pages/research-details.html", "pages/research.html", "pages/methods/cheminformatics.html",
  "pages/methods/cube.html", "pages/methods/data-analysis.html",
  "pages/methods/electronic-descriptors.html", "pages/methods/gaussian.html",
  "pages/methods/glossary.html", "pages/methods/grrm.html", "pages/methods/index.html",
  "pages/methods/multiwfn.html", "pages/methods/nciplot.html", "pages/methods/orca.html",
  "pages/methods/psi4.html", "pages/methods/py3dmol.html", "pages/methods/pyscf.html",
  "pages/methods/rdkit.html", "pages/methods/reaction-selectivity.html",
  "pages/methods/reproducibility.html", "pages/methods/steric-descriptors.html",
  "pages/methods/xtb.html", "pages/privacy.html", "pages/search.html",
];

const analyticsTag = `<!-- Google tag (gtag.js) -->
<script data-google-analytics>
  if (window.location.hostname === ${JSON.stringify(analyticsHost)}) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){window.dataLayer.push(arguments);};
    window.gtag('js', new Date());
    window.gtag('config', ${JSON.stringify(siteConfig.analyticsMeasurementId)});
    const googleTag = document.createElement('script');
    googleTag.async = true;
    googleTag.src = 'https://www.googletagmanager.com/gtag/js?id=${siteConfig.analyticsMeasurementId}';
    document.head.appendChild(googleTag);
  }
</script>`;

const privacyBody = (lang) => {
  const ja = lang === "ja";
  return `<section class="page-hero"><div class="container"><p class="eyebrow">Privacy</p><h1>${ja ? "アクセス解析とプライバシー" : "Analytics and Privacy"}</h1><p class="lead">${ja ? "このサイトで行うアクセス解析と、取得される情報について説明します。" : "How this website uses analytics and handles related information."}</p></div></section><section class="section-band"><div class="container docs-content"><section class="docs-section"><h2>${ja ? "Google Analyticsの利用" : "Use of Google Analytics"}</h2><p>${ja ? "このサイトでは、閲覧状況を把握して内容と操作性を改善するため、Google Analytics 4を利用しています。Google Analyticsは、閲覧ページ、参照元、端末・ブラウザーの種類、おおよその地域などの利用情報をCookie等により収集する場合があります。" : "This website uses Google Analytics 4 to understand site usage and improve its content and usability. Google Analytics may use cookies and similar technologies to collect information such as pages viewed, referral source, device and browser type, and approximate location."}</p><p>${ja ? "このサイトでは氏名やメールアドレスをGoogle Analyticsへ送信する独自設定を行っていません。収集された情報はGoogleの規約とプライバシーポリシーに基づいて処理されます。" : "This website does not configure Google Analytics to send names, email addresses, or other directly identifying information. Collected information is processed under Google's terms and privacy policy."}</p></section><section class="docs-section"><h2>${ja ? "計測を無効にする方法" : "How to opt out"}</h2><p>${ja ? "Cookieはブラウザーの設定から制限または削除できます。また、Googleが提供するオプトアウトアドオンを利用してGoogle Analyticsによる計測を無効にできます。" : "You can restrict or delete cookies in your browser settings. Google also provides an opt-out browser add-on that can disable measurement by Google Analytics."}</p><ul class="link-list"><li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">${ja ? "Google プライバシーポリシー" : "Google Privacy Policy"}</a></li><li><a href="https://tools.google.com/dlpage/gaoptout/" target="_blank" rel="noopener noreferrer">${ja ? "Google Analytics オプトアウト アドオン" : "Google Analytics Opt-out Browser Add-on"}</a></li></ul></section><section class="docs-section"><h2>${ja ? "ローカル環境" : "Local preview"}</h2><p>${ja ? "localhost、127.0.0.1、またはHTMLファイルを直接開いた場合には、Google Analyticsを読み込みません。" : "Google Analytics is not loaded for localhost, 127.0.0.1, or pages opened directly as local files."}</p></section><p class="method-review">${ja ? `最終更新: ${siteConfig.lastReviewedJa}` : `Last updated: ${siteConfig.lastReviewedEn}`}</p></div></section>`;
};

renderJapanesePage({
  file: "pages/privacy.html", active: "", title: "アクセス解析とプライバシー | 坂口 大門",
  description: "坂口大門のホームページにおけるGoogle Analyticsの利用とプライバシーに関する説明です。",
  ogType: "website", body: privacyBody("ja"),
});
renderEnglishPage({
  file: "pages/privacy.html", active: "", title: "Analytics and Privacy | Daimon Sakaguchi",
  description: "Information about Google Analytics and privacy on Daimon Sakaguchi's website.",
  ogType: "website", body: privacyBody("en"),
});

const searchBody = (lang) => {
  const ja = lang === "ja";
  return `<section class="page-hero"><div class="container"><p class="eyebrow">Site Search</p><h1>${ja ? "サイト全体検索" : "Search this site"}</h1><p class="lead">${ja ? "研究、業績、計算化学ノート、用語集を横断して検索します。" : "Search across research, publications, computational chemistry notes, and the glossary."}</p></div></section><section class="section-band"><div class="container search-page" data-site-search data-index-url="${ja ? "../assets/search-index.ja.json" : "../../assets/search-index.en.json"}"><form class="site-search-form" role="search"><label for="site-search-input">${ja ? "検索語" : "Search terms"}</label><div class="site-search-row"><input id="site-search-input" name="q" type="search" autocomplete="off" placeholder="${ja ? "例: Multiwfn、NCI、反応選択性" : "e.g., Multiwfn, NCI, reaction selectivity"}" data-site-search-input><button type="submit">${ja ? "検索" : "Search"}</button></div></form><p class="search-status" data-site-search-status aria-live="polite">${ja ? "検索語を入力してください。" : "Enter one or more search terms."}</p><ol class="site-search-results" data-site-search-results></ol><noscript><p>${ja ? "サイト内検索にはJavaScriptが必要です。" : "JavaScript is required for site search."}</p></noscript></div></section>`;
};

renderJapanesePage({
  file: "pages/search.html", active: "", title: "サイト全体検索 | 坂口 大門",
  description: "坂口大門の研究、業績、計算化学ノート、用語集を横断検索します。",
  ogType: "website", body: searchBody("ja"),
});
renderEnglishPage({
  file: "pages/search.html", active: "", title: "Site Search | Daimon Sakaguchi",
  description: "Search the research, publications, computational chemistry notes, and glossary on Daimon Sakaguchi's website.",
  ogType: "website", body: searchBody("en"),
});

const glossary = [
  ["AFIR", "人工力誘起反応法。反応物間または分子内に人工力を加え、反応経路候補を系統的に探索する手法。", "Artificial Force Induced Reaction method for systematically exploring reaction-path candidates by applying artificial forces.", "grrm.html"],
  ["基底関数系 / Basis set", "分子軌道を展開する既知関数の集合。計算精度と計算量を左右する。", "A set of known functions used to expand molecular orbitals; it controls both accuracy and cost.", "gaussian.html"],
  ["Boltzmann weight", "各配座の相対自由エネルギーと温度から求める統計的な存在比。", "A statistical population derived from conformer relative free energies and temperature.", "steric-descriptors.html#conformers"],
  ["Canonical SMILES", "同一構造に対して一意になるよう特定実装で正規化したSMILES。異なる実装間での同一性は保証されない。", "A SMILES string canonicalized by a particular implementation; identity across implementations is not guaranteed.", "cheminformatics.html"],
  ["配座 / Conformer", "結合を切らずに主として単結合回転で相互変換できる三次元構造。", "A three-dimensional structure interconvertible mainly by bond rotation without changing connectivity.", "rdkit.html#conformers"],
  ["Cube", "原子座標と、規則的な三次元格子上のスカラー値を格納するファイル形式。", "A file format storing atomic coordinates and scalar values on a regular three-dimensional grid.", "cube.html"],
  ["DFT", "電子密度を基本変数として多電子系を扱う密度汎関数理論。", "Density functional theory, which treats many-electron systems using electron density as the basic variable.", "gaussian.html"],
  ["Dual descriptor", "電子付加と電子除去に対する局所応答の差で、求電子・求核反応性の傾向を表す概念DFT記述子。", "A conceptual-DFT descriptor comparing local responses to electron addition and removal.", "psi4.html"],
  ["EDA", "定義した参照状態に基づき、相互作用エネルギーを静電、Pauli反発、軌道相互作用などへ分解する解析。", "Energy decomposition analysis that partitions an interaction energy into terms defined by a chosen reference scheme.", "orca.html"],
  ["ESP", "原子核と電子が空間中の点に作る静電ポテンシャル。評価位置または写像面を明示する。", "Electrostatic potential generated by nuclei and electrons at a point in space; the evaluation surface must be specified.", "electronic-descriptors.html"],
  ["ETKDG", "実験由来のねじれ角知識を距離幾何法へ組み込んだRDKitの配座生成法。", "RDKit conformer generation that augments distance geometry with experimentally derived torsional preferences.", "rdkit.html#conformers"],
  ["Fingerprint", "分子部分構造や局所環境の有無をビット列または数値ベクトルで表した記述子。", "A bit or count vector encoding molecular substructures or local environments.", "cheminformatics.html"],
  ["Fukui function", "電子数の変化に対する電子密度の局所応答を表す概念DFT量。", "A conceptual-DFT quantity describing the local density response to a change in electron number.", "psi4.html"],
  ["Gasteiger charge", "結合関係と原子種から反復的に推定する経験的部分電荷。量子化学的電荷とは異なる。", "An empirical partial charge estimated iteratively from atom types and connectivity; it is not a quantum-chemical charge.", "cheminformatics.html"],
  ["GRRM", "反応経路自動探索のためのプログラム群。ADDF、AFIRなどの探索法を備える。", "A program suite for automated reaction-route mapping, including ADDF and AFIR approaches.", "grrm.html"],
  ["IGM / IGMH", "密度勾配の打ち消しを利用して相互作用領域を可視化する手法。IGMHはHirshfeld分割を用いる。", "Interaction-region analyses based on density-gradient cancellation; IGMH uses Hirshfeld partitioning.", "multiwfn.html", "IGM / IGMH"],
  ["InChIKey", "InChIから生成される固定長文字列。検索に便利だが、元構造へ復号できない。", "A fixed-length string derived from InChI; useful for lookup but not reversible to the original structure.", "cheminformatics.html"],
  ["IRC", "遷移状態から反応物側と生成物側へ辿る固有反応座標。", "The intrinsic reaction coordinate followed from a transition state toward reactants and products.", "gaussian.html"],
  ["Isovalue", "スカラー場の等値面を描くときに固定する値。面の大きさと解釈はこの値に依存する。", "The scalar value selected to draw an isosurface; surface extent and interpretation depend on it.", "cube.html"],
  ["LASSO", "L1罰則により係数を縮小し、一部を厳密にゼロにできる正則化回帰。", "Regularized regression using an L1 penalty, capable of shrinking some coefficients exactly to zero.", "data-analysis.html"],
  ["MC-AFIR", "複数成分間へ人工力を適用し、多様な会合・反応経路を探索するAFIR法。", "A multicomponent AFIR approach that explores association and reaction pathways between components.", "grrm.html"],
  ["MMFF", "主に有機分子向けのMerck Molecular Force Field。配座の初期最適化などに用いる。", "The Merck Molecular Force Field, commonly used for initial optimization of organic conformers.", "rdkit.html"],
  ["NCI", "低電子密度かつ低換算密度勾配の領域から非共有結合相互作用を調べる解析。相互作用エネルギーそのものではない。", "Analysis of noncovalent interactions using low-density, low-reduced-gradient regions; it is not an interaction energy.", "nciplot.html"],
  ["NCIplot", "NCI解析用の格子データと可視化ファイルを生成するプログラム。", "A program for generating grids and visualization files for NCI analysis.", "nciplot.html"],
  ["分子軌道 / Molecular orbital", "一電子関数として表現される軌道。描画色は通常、電荷ではなく位相を表す。", "An orbital represented as a one-electron function; plot colors normally indicate phase, not charge.", "cube.html#orbitals"],
  ["PCA", "分散が大きい直交方向へデータを射影する主成分分析。前処理は検証分割の内側で学習する。", "Principal component analysis projects data onto orthogonal high-variance directions; preprocessing must be fit within validation folds.", "data-analysis.html"],
  ["RDG", "電子密度とその勾配から作る無次元の換算密度勾配。NCI解析の基本量。", "The dimensionless reduced density gradient derived from electron density and its gradient.", "nciplot.html"],
  ["RMSD", "原子対応を定め、最適重ね合わせ後に求める二構造間の二乗平均平方根偏差。", "Root-mean-square deviation between two structures after defining atom correspondence and optimal alignment.", "rdkit.html#rmsd"],
  ["SAPT", "分子間相互作用を静電、交換、誘起、分散などへ摂動論的に分解する方法。", "A perturbative decomposition of intermolecular interactions into electrostatics, exchange, induction, dispersion, and related terms.", "psi4.html"],
  ["SC-AFIR", "単一成分内へ人工力を適用し、異性化や解離経路を探索するAFIR法。", "A single-component AFIR approach for exploring intramolecular rearrangement and dissociation pathways.", "grrm.html"],
  ["SCF", "入力密度から得た軌道が新しい密度を作り、所定の基準まで自己無撞着に反復する手続き。", "An iterative procedure in which orbitals generated from a density produce a new density until self-consistency is reached.", "gaussian.html#scf"],
  ["SHAP", "予測値と基準値との差を特徴量寄与へ加法的に配分する説明手法。因果効果を直接示すものではない。", "An explanation method that allocates the difference between a prediction and a baseline among feature contributions; it is not causal evidence.", "data-analysis.html"],
  ["SMILES", "原子、結合、分岐、環などを文字列で表す分子表記。三次元配座は通常含まない。", "A line notation for atoms, bonds, branches, and rings; it normally does not encode a three-dimensional conformer.", "rdkit.html#smiles"],
  ["Steric map", "基準座標系から見た立体的な混雑度を二次元面へ投影した地図。", "A map projecting steric congestion in a defined coordinate system onto a two-dimensional plane.", "steric-descriptors.html"],
  ["Sterimol", "定義した主軸に沿う置換基長Lと、軸に垂直な最小幅B1・最大幅B5。", "Substituent length L and minimum/maximum widths B1/B5 relative to a defined primary axis.", "steric-descriptors.html#sterimol"],
  ["遷移状態 / Transition state", "ポテンシャルエネルギー面上の一次鞍点。通常、一つの虚振動と反応経路への接続を確認する。", "A first-order saddle point on a potential-energy surface, normally checked by one imaginary frequency and pathway connectivity.", "gaussian.html#optimization"],
  ["UFF", "元素被覆範囲の広いUniversal Force Field。適用可能性と電荷状態を確認して使う。", "The broadly element-covering Universal Force Field; applicability and charge state should be checked.", "rdkit.html"],
  ["Voxel", "三次元格子を構成する一つの体積要素。場を機械学習へ渡すときの基本単位。", "One volume element of a three-dimensional grid and a basic unit for field-based machine learning.", "cube.html"],
  ["波動関数 / Wavefunction", "量子状態を表す関数。解析用ファイルには軌道係数や基底関数情報などが保存される。", "A function representing a quantum state; analysis files may store orbital coefficients, basis information, and related data.", "multiwfn.html"],
  ["%Vbur", "指定球内で原子のvan der Waals体積が占める割合。中心、半径、原子半径系に依存する。", "Percent buried volume within a defined sphere; it depends on the center, radius, and atomic-radius convention.", "steric-descriptors.html#vbur"],
  ["ΔΔG‡", "競合する経路間の活性化自由エネルギー差。比との変換では温度と符号規約を固定する。", "The activation-free-energy difference between competing pathways; conversion from ratios requires a fixed temperature and sign convention.", "reaction-selectivity.html"],
];

const glossaryBody = (lang) => {
  const ja = lang === "ja";
  const groups = [["a-f", "A–F"], ["g-m", "G–M"], ["n-s", "N–S"], ["t-z", ja ? "T–Z・記号" : "T–Z and symbols"]];
  const groupFor = (term) => {
    const sortable = term.includes(" / ") ? term.split(" / ").at(-1) : term;
    const c = sortable.replace(/^%/, "V").replace(/^Δ/, "Z")[0].toUpperCase();
    if (c <= "F") return "a-f";
    if (c <= "M") return "g-m";
    if (c <= "S") return "n-s";
    return "t-z";
  };
  const sections = groups.map(([id, label], index) => {
    const terms = glossary.filter((entry) => groupFor(entry[0]) === id).map(([term, jaText, enText, href, englishTerm]) => {
      const displayTerm = ja ? term : (englishTerm || (term.includes(" / ") ? term.split(" / ").at(-1) : term));
      return `<div data-glossary-entry><dt>${displayTerm}</dt><dd>${ja ? jaText : enText} <a href="${href}">${ja ? "関連章" : "Related chapter"}</a></dd></div>`;
    }).join("");
    return `<section class="docs-section" id="${id}"><h2>${index + 1}. ${label}</h2><dl class="glossary-list">${terms}</dl></section>`;
  }).join("");
  return `<section class="page-hero docs-hero"><div class="container"><p class="breadcrumb"><a href="index.html">${ja ? "計算化学ノート" : "Computational Chemistry Notes"}</a> / ${ja ? "用語集" : "Glossary"}</p><p class="eyebrow">Terms and Definitions</p><h1>${ja ? "計算化学・ケモインフォマティクス用語集" : "Computational Chemistry and Cheminformatics Glossary"}</h1><p class="lead">${ja ? "サイト内で用いる略語と専門用語を、対応する解説ページへの入口として整理します。" : "Definitions of abbreviations and technical terms used throughout this site, linked to their detailed chapters."}</p></div></section><section class="section-band"><div class="container docs-layout"><aside class="docs-toc" aria-label="${ja ? "ページ内目次" : "Page contents"}"><h2>${ja ? "この章の内容" : "On this page"}</h2><ol>${groups.map(([id, label]) => `<li><a href="#${id}">${label}</a></li>`).join("")}</ol></aside><div class="docs-content"><div class="glossary-filter"><label for="glossary-filter">${ja ? "用語を絞り込む" : "Filter terms"}</label><input id="glossary-filter" type="search" autocomplete="off" placeholder="${ja ? "用語または説明を入力" : "Enter a term or definition"}" data-glossary-search><p data-glossary-count aria-live="polite"></p></div>${sections}<p class="method-review">${ja ? `最終確認: ${siteConfig.lastReviewedJa}` : `Last reviewed: ${siteConfig.lastReviewedEn}`}</p></div></div></section>`;
};

for (const [file, lang] of [["pages/methods/glossary.html", "ja"], ["en/pages/methods/glossary.html", "en"]]) {
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(/<main id="main">[\s\S]*?<\/main>/, `<main id="main">${glossaryBody(lang)}</main>`);
  fs.writeFileSync(file, html);
}

for (const [file, lang] of [["pages/methods/reproducibility.html", "ja"], ["en/pages/methods/reproducibility.html", "en"]]) {
  const ja = lang === "ja";
  let html = fs.readFileSync(file, "utf8");
  const section = `<section class="docs-section" id="site-maintenance"><h2>7. ${ja ? "このサイトの再生成と保守" : "Regenerating and maintaining this site"}</h2><p>${ja ? "本文、日英ページ、計算例への接続、検索索引、構造化データはスクリプトから再生成します。生成物だけを直接直すと次回の実行で失われるため、対応する <code>scripts/i18n/</code> または後処理スクリプトを修正します。" : "Page content, bilingual pages, calculation-example links, search indexes, and structured data are regenerated by scripts. Edit the corresponding source under <code>scripts/i18n/</code> or the enhancement scripts instead of changing generated output alone."}</p><pre><code>npm run i18n:generate
npm run i18n:markup
npm run verify:site</code></pre><ul><li>${ja ? "<code>i18n:generate</code>: 日英ページ、計算例、章間リンク、検索索引、JSON-LDを再生成。" : "<code>i18n:generate</code>: regenerate bilingual pages, examples, cross-links, search indexes, and JSON-LD."}</li><li>${ja ? "<code>i18n:check</code>: 日英ページ数、翻訳漏れ、章・コード例の対応を検査。" : "<code>i18n:check</code>: check page pairs, untranslated text, and chapter/example parity."}</li><li>${ja ? "<code>site:validate</code>: ローカルリンク、重複ID、canonical、JSON-LD、検索索引、計算メタデータを検査。" : "<code>site:validate</code>: check local links, duplicate IDs, canonical URLs, JSON-LD, search indexes, and calculation metadata."}</li></ul><div class="callout"><strong>${ja ? "計算例の来歴" : "Calculation provenance"}</strong><p>${ja ? "各 <code>assets/calculations/*/metadata.json</code> に分子、手法、ソフトウェアバージョン、乱数シードまたは格子条件、検証値、教育用例である旨を保存します。" : "Each <code>assets/calculations/*/metadata.json</code> records the molecule, method, software versions, seed or grid settings, validation values, and the educational scope of the example."}</p></div></section>`;
  if (!html.includes('id="site-maintenance"')) {
    html = html.replace(/(<\/ol><\/aside>)/, `<li><a href="#site-maintenance">${ja ? "サイトの保守" : "Site maintenance"}</a></li>$1`);
    html = html.replace(/(<p class="method-review">)/, `${section}$1`);
  }
  fs.writeFileSync(file, html);
}

const decode = (value) => value
  .replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'")
  .replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
const attr = (html, name) => html.match(new RegExp(`<meta name="${name}" content="([^"]*)"`))?.[1] || "";
const tagText = (html, tag) => decode(html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))?.[1] || "");

const polishJapaneseContent = (html) => {
  const replacements = [
    ["single-point計算", "一点計算"],
    ["single-point例", "一点計算の例"],
    ["全energy", "全エネルギー"],
    ["最低energy", "最低エネルギー"],
    ["相対MMFF94 energy", "MMFF94相対エネルギー"],
    ["DFT energy", "DFTエネルギー"],
    ["同じenergy・RMSD", "同じエネルギー・RMSD"],
    ["生成script", "生成スクリプト"],
    ["乱数seed", "乱数シード"],
    ["Density面", "電子密度面"],
    ["density面", "電子密度面"],
    ["正のpotential", "正のポテンシャル"],
    ["相互作用energy", "相互作用エネルギー"],
    ["遷移状態energy", "遷移状態エネルギー"],
    ["energy decomposition", "エネルギー分解解析"],
    ["voxel field", "ボクセル場"],
    ["低sample", "少数標本"],
    ["MO / LUMO field", "HOMO / LUMO場"],
    ["Fukui / dual descriptor", "Fukui関数 / デュアル記述子"],
    ["dual descriptor", "デュアル記述子"],
    ["frontier orbital", "フロンティア軌道"],
    ["frontier field", "フロンティア軌道場"],
    ["低gradient領域", "低勾配領域"],
    ["fragment間", "フラグメント間"],
    ["fragment、isovalue、grid依存", "フラグメント、等値、グリッド依存"],
    ["color range", "カラーレンジ"],
  ];
  return replacements.reduce((result, [from, to]) => result.replaceAll(from, to), html);
};

const person = {
  "@type": "Person", "@id": `${base}/#person`, name: "Daimon Sakaguchi",
  alternateName: "坂口 大門", url: `${base}/`, affiliation: {
    "@type": "CollegeOrUniversity", name: "Yokohama National University",
    url: "https://www.ynu.ac.jp/english/",
  },
  sameAs: ["https://researchmap.jp/sakaguchi-daimon", "https://scholar.google.co.jp/citations?user=vYnG95MAAAAJ&hl=ja&oi=ao", "https://github.com/saka-d"],
  knowsAbout: ["Computational chemistry", "Physical organic chemistry", "Reaction selectivity", "Cheminformatics", "Stereoelectronic-state informatics"],
};

const websiteFor = (lang) => ({
  "@type": "WebSite",
  "@id": `${base}/#website`,
  name: "坂口 大門 | Daimon Sakaguchi",
  url: `${base}/`,
  inLanguage: ["ja", "en"],
  potentialAction: {
    "@type": "SearchAction",
    target: `${base}/${lang === "en" ? "en/" : ""}pages/search.html?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

for (const source of pageFiles) {
  for (const lang of ["ja", "en"]) {
    const file = lang === "ja" ? source : path.join("en", source);
    let html = fs.readFileSync(file, "utf8");
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    const title = tagText(html, "title");
    const description = attr(html, "description");
    const outputDir = path.dirname(file);
    const searchTarget = lang === "ja" ? "pages/search.html" : "en/pages/search.html";
    const searchHref = path.relative(outputDir, searchTarget).replaceAll(path.sep, "/");
    const privacyTarget = lang === "ja" ? "pages/privacy.html" : "en/pages/privacy.html";
    const privacyHref = path.relative(outputDir, privacyTarget).replaceAll(path.sep, "/");
    html = html.replace(/<a class="site-search-link"[\s\S]*?<\/a>/, "");
    html = html.replace(/(<div class="language-switcher")/, `<a class="site-search-link" href="${searchHref}" aria-label="${lang === "ja" ? "サイト全体を検索" : "Search this site"}">${lang === "ja" ? "検索" : "Search"}</a>$1`);
    html = html.replace(/<meta name="author"[^>]*>/g, "").replace(/<meta name="robots"[^>]*>/g, "").replace(/<meta name="DC\.creator"[^>]*>/g, "");
    const robots = source === "pages/search.html" ? "noindex,follow" : "index,follow,max-image-preview:large";
    html = html.replace("<meta name=\"description\"", `<meta name="author" content="Daimon Sakaguchi"><meta name="DC.creator" content="Daimon Sakaguchi"><meta name="robots" content="${robots}"><meta name="description"`);
    html = html.replace(/<script type="application\/ld\+json"(?:\s[^>]*)?>[\s\S]*?<\/script>/g, "");
    html = html.replace(/\s*<!-- Google tag \(gtag\.js\) -->[\s\S]*?<script data-google-analytics>[\s\S]*?<\/script>\s*/g, "");
    html = html.replace(/<head>\s*/, `<head>\n${analyticsTag}\n`);
    html = html.replace(/(<footer class="site-footer">[\s\S]*?<div class="container footer-inner">[\s\S]*?<p>)(<a href="https:\/\/github\.com\/saka-d"[^>]*>GitHub<\/a>)(<\/p>)/,
      `$1<a href="${privacyHref}">${lang === "ja" ? "アクセス解析とプライバシー" : "Analytics and Privacy"}</a> · $2$3`);
    let pageSchema;
    if (source === "index.html") {
      pageSchema = { "@type": "ProfilePage", "@id": `${canonical}#profile`, url: canonical, name: title, description, inLanguage: lang, dateModified: siteConfig.lastModified, mainEntity: { "@id": `${base}/#person` }, isPartOf: { "@id": `${base}/#website` } };
    } else if (source === "pages/publications.html") {
      pageSchema = { "@type": "CollectionPage", "@id": `${canonical}#page`, url: canonical, name: title, description, inLanguage: lang, dateModified: siteConfig.lastModified, author: { "@id": `${base}/#person` }, isPartOf: { "@id": `${base}/#website` }, mainEntity: { "@type": "ItemList", numberOfItems: publicationJsonLd.length, itemListElement: publicationJsonLd.map((item, index) => ({ "@type": "ListItem", position: index + 1, item })) } };
    } else if (source.includes("pages/methods/") || source === "pages/electronic-structure.html") {
      pageSchema = { "@type": "TechArticle", "@id": `${canonical}#article`, url: canonical, headline: tagText(html, "h1") || title, description, inLanguage: lang, dateModified: siteConfig.lastModified, author: { "@id": `${base}/#person` }, isPartOf: { "@id": `${base}/#website` } };
    } else {
      pageSchema = { "@type": "WebPage", "@id": `${canonical}#page`, url: canonical, name: title, description, inLanguage: lang, dateModified: siteConfig.lastModified, author: { "@id": `${base}/#person` }, isPartOf: { "@id": `${base}/#website` } };
    }
    const schema = { "@context": "https://schema.org", "@graph": [websiteFor(lang), person, pageSchema] };
    html = html.replace("</head>", `<script type="application/ld+json" data-site-schema>${JSON.stringify(schema)}</script></head>`);
    html = html.replace(/main\.css\?v=[^"']+/g, `main.css?v=${siteConfig.assetVersion}`);
    html = html.replace(/main\.js\?v=[^"']+/g, `main.js?v=${siteConfig.assetVersion}`);
    if (lang === "ja") {
      html = html
        .replace(/>Skip to content</g, ">本文へ移動<")
        .replace(/aria-label="Toggle navigation"/g, 'aria-label="ナビゲーションを開く"')
        .replace(/aria-label="Main navigation"/g, 'aria-label="メインナビゲーション"')
        .replace(/aria-label="Page contents"/g, 'aria-label="ページ内目次"')
        .replace(/aria-label="Language"/g, 'aria-label="言語"')
        .replace(/aria-label="English"/g, 'aria-label="英語"')
        .replace(/<ul class="nav-menu"([\s\S]*?)<\/ul>/, (menu) => menu
          .replace(/>Home</g, ">ホーム<")
          .replace(/>About</g, ">プロフィール<")
          .replace(/>Research</g, ">研究<")
          .replace(/>Methods</g, ">計算化学ノート<")
          .replace(/>Publications</g, ">業績<")
          .replace(/>CV</g, ">経歴<")
          .replace(/>Contact</g, ">リンク<"));
      html = polishJapaneseContent(html);
    }
    fs.writeFileSync(file, html, "utf8");
  }
}

const buildIndex = (lang) => pageFiles.filter((file) => file !== "pages/search.html").map((source) => {
  const file = lang === "ja" ? source : path.join("en", source);
  const html = fs.readFileSync(file, "utf8");
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1] || "";
  const headings = [...main.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/g)].map((match) => decode(match[1]));
  const outputDir = lang === "ja" ? "pages" : "en/pages";
  return {
    title: tagText(html, "title"), description: attr(html, "description"),
    url: path.relative(outputDir, file).replaceAll(path.sep, "/"),
    headings, text: decode(main).slice(0, 9000),
  };
});
fs.writeFileSync("assets/search-index.ja.json", JSON.stringify(buildIndex("ja")));
fs.writeFileSync("assets/search-index.en.json", JSON.stringify(buildIndex("en")));

console.log(`Enhanced ${pageFiles.length * 2} pages and generated bilingual search indexes.`);
