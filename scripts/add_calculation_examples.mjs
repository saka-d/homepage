import fs from "node:fs";

const escapeAttributes = (attributes) => Object.entries(attributes)
  .map(([name, value]) => `data-${name}="${value}"`)
  .join(" ");

function viewer({ type, attributes, toolbar, legends = "", help, aria, resetLabel, fullscreenLabel }) {
  return `<div class="molecular-visualization" data-molecular-viewer="${type}" ${escapeAttributes(attributes)}><div class="molecular-viewer-toolbar">${toolbar}<div class="viewer-actions"><button type="button" data-viewer-reset title="${resetLabel}">${resetLabel}</button><button type="button" data-viewer-fullscreen title="${fullscreenLabel}">${fullscreenLabel}</button></div></div><div class="molecular-viewer-canvas" data-viewer-canvas role="img" aria-label="${aria}"><p class="viewer-status" data-viewer-status>${attributes["loading-label"]}</p></div>${legends}<p class="viewer-help">${help} <a href="https://3dmol.csb.pitt.edu/" target="_blank" rel="noopener noreferrer">3Dmol.js 2.5.5</a></p></div>`;
}

function conformerViewer(root, lang) {
  const ja = lang === "ja";
  return viewer({
    type: "conformers",
    attributes: {
      structure: `${root}assets/calculations/rdkit-pentane/pentane-conformers.sdf`,
      results: `${root}assets/calculations/rdkit-pentane/conformer-results.csv`,
      "rank-label": ja ? "順位" : "Rank",
      "loading-label": ja ? "3D配座を読み込んでいます..." : "Loading 3D conformers...",
      "ready-label": ja ? "3D配座を操作できます。" : "The conformer is interactive.",
      "error-label": ja ? "3D表示を読み込めませんでした。下の静止画を参照してください。" : "The 3D viewer could not be loaded. Use the fallback image below.",
    },
    toolbar: `<div class="viewer-field-controls"><label>${ja ? "表示配座" : "Conformer"} <select data-conformer-select aria-label="${ja ? "表示する配座" : "Displayed conformer"}"></select></label></div>`,
    legends: `<div class="viewer-readout" data-conformer-readout aria-live="polite"></div>`,
    help: ja ? "ドラッグで回転、ホイールまたはピンチで拡大縮小できます。" : "Drag to rotate; use the mouse wheel or pinch gesture to zoom.",
    aria: ja ? "操作可能なn-ペンタン配座" : "Interactive n-pentane conformer",
    resetLabel: ja ? "視点を戻す" : "Reset view",
    fullscreenLabel: ja ? "全画面" : "Full screen",
  });
}

function cubeViewer(root, lang) {
  const ja = lang === "ja";
  const legends = `<div class="field-legend" data-field-legend="density"><p>${ja ? "水色の半透明面: 電子密度 ρ = 0.02 e bohr<sup>-3</sup>。" : "Translucent cyan: electron density at ρ = 0.02 e bohr<sup>-3</sup>."}</p></div><div class="field-legend" data-field-legend="homo" hidden><p>${ja ? "青: 正位相、橙: 負位相。等値面は ±0.03 bohr<sup>-3/2</sup>。" : "Blue: positive phase; orange: negative phase. Isovalues are ±0.03 bohr<sup>-3/2</sup>."}</p></div><div class="field-legend" data-field-legend="lumo" hidden><p>${ja ? "青: 正位相、橙: 負位相。色は電荷ではありません。" : "Blue: positive phase; orange: negative phase. The colors are not charges."}</p></div><div class="field-legend" data-field-legend="esp" hidden><div class="scientific-colorbar esp"><span>−0.08</span><span class="colorbar-gradient" aria-hidden="true"></span><span>+0.08</span></div><p class="colorbar-caption">ESP / E<sub>h</sub> e<sup>−1</sup> (${ja ? "赤: 負、青: 正" : "red: negative, blue: positive"})</p></div>`;
  return viewer({
    type: "cube",
    attributes: {
      structure: `${root}assets/calculations/pyscf-acetone/acetone.mol`,
      density: `${root}assets/calculations/pyscf-acetone/acetone-density.cube`,
      homo: `${root}assets/calculations/pyscf-acetone/acetone-homo.cube`,
      lumo: `${root}assets/calculations/pyscf-acetone/acetone-lumo.cube`,
      esp: `${root}assets/calculations/pyscf-acetone/acetone-esp.cube`,
      "loading-label": ja ? "Cubeを読み込んでいます..." : "Loading cube data...",
      "ready-label": ja ? "表示する場を切り替えられます。" : "Choose a field to display.",
      "error-label": ja ? "Cubeの3D表示を読み込めませんでした。下の静止画を参照してください。" : "The cube viewer could not be loaded. Use the fallback images below.",
    },
    toolbar: `<div class="viewer-field-controls" role="group" aria-label="${ja ? "表示する電子場" : "Displayed electronic field"}"><button type="button" data-volume-field="density" aria-pressed="true">Density</button><button type="button" data-volume-field="homo" aria-pressed="false">HOMO</button><button type="button" data-volume-field="lumo" aria-pressed="false">LUMO</button><button type="button" data-volume-field="esp" aria-pressed="false">ESP</button></div>`,
    legends,
    help: ja ? "ドラッグで回転できます。ESPは電子密度面を別のESP Cubeで着色しています。" : "Drag to rotate. ESP colors the density isosurface using the separate ESP cube.",
    aria: ja ? "アセトンの電子密度・軌道・静電ポテンシャルの操作可能な三次元表示" : "Interactive acetone density, orbital, and electrostatic-potential view",
    resetLabel: ja ? "視点を戻す" : "Reset view",
    fullscreenLabel: ja ? "全画面" : "Full screen",
  });
}

function nciViewer(root, lang) {
  const ja = lang === "ja";
  const legends = `<div class="field-legend"><div class="scientific-colorbar"><span>−5</span><span class="colorbar-gradient" aria-hidden="true"></span><span>+5</span></div><p class="colorbar-caption">sign(λ<sub>2</sub>)ρ × 1000 (${ja ? "青: attractive-like、緑: weak-contact-like、赤: repulsive-like" : "blue: attractive-like, green: weak-contact-like, red: repulsive-like"})</p></div>`;
  return viewer({
    type: "nci",
    attributes: {
      structure: `${root}assets/calculations/nciplot-water-dimer/water-dimer.xyz`,
      rdg: `${root}assets/calculations/nciplot-water-dimer/water-dimer-grad.cube`,
      "signed-density": `${root}assets/calculations/nciplot-water-dimer/water-dimer-dens.cube`,
      "loading-label": ja ? "NCI Cubeを読み込んでいます..." : "Loading NCI cube data...",
      "ready-label": ja ? "NCI表面を操作できます。" : "The NCI surface is interactive.",
      "error-label": ja ? "NCIの3D表示を読み込めませんでした。下の静止画を参照してください。" : "The NCI viewer could not be loaded. Use the fallback image below.",
    },
    toolbar: `<div class="viewer-field-controls"><strong>RDG = 0.50</strong></div>`,
    legends,
    help: ja ? "RDG Cubeが表面形状、signed-density Cubeが表面色を決めます。色範囲は−5～+5で固定しています。" : "The RDG cube defines shape and the signed-density cube defines color. The color range is fixed at −5 to +5.",
    aria: ja ? "水二量体の操作可能なNCI等値面" : "Interactive water-dimer NCI isosurface",
    resetLabel: ja ? "視点を戻す" : "Reset view",
    fullscreenLabel: ja ? "全画面" : "Full screen",
  });
}

function rdkitExample(root, lang) {
  const ja = lang === "ja";
  return `<section class="docs-section calculation-example" id="example-results"><p class="example-label">Reproducible Example</p><h2>9. ${ja ? "n-ペンタンの配座生成" : "Calculated example: n-pentane conformers"}</h2><p>${ja ? "n-ペンタン（<code>CCCCC</code>）について、ETKDGv3で100配座を要求し、生成時に0.15 ÅのRMSD pruningを適用した後、MMFF94で最適化しました。" : "ETKDGv3 requested 100 n-pentane conformers with a 0.15 Å generation-time RMSD pruning threshold, followed by MMFF94 optimization."}</p><div class="calculation-summary"><div><span>${ja ? "生成配座" : "Generated"}</span><strong>8</strong></div><div><span>${ja ? "MMFF収束" : "MMFF converged"}</span><strong>8 / 8</strong></div><div><span>${ja ? "乱数seed" : "Random seed"}</span><strong>20260804</strong></div><div><span>${ja ? "最低energy" : "Lowest energy"}</span><strong>-5.2718 kcal mol<sup>-1</sup></strong></div></div>${conformerViewer(root, lang)}<div class="result-figure-grid"><figure><img src="${root}assets/calculations/rdkit-pentane/conformer-energy-rmsd.png" alt="${ja ? "n-ペンタン配座のRMSDと相対MMFF94エネルギー" : "Relative MMFF94 energy versus RMSD for n-pentane conformers"}" width="1628" height="990"><figcaption>${ja ? "最低energy配座からのRMSDと相対MMFF94 energy。" : "RMSD from the lowest-energy conformer versus relative MMFF94 energy."}</figcaption></figure><figure><img src="${root}assets/calculations/rdkit-pentane/pentane-3d.png" alt="${ja ? "n-ペンタン最低エネルギー配座" : "Lowest-MMFF-energy n-pentane conformer"}" width="1628" height="1144"><figcaption>${ja ? "最低energy配座の静止画。WebGLを利用できない場合の参照にも使えます。" : "Fallback image of the lowest-energy conformer."}</figcaption></figure></div><div class="figure-interpretation"><h3>${ja ? "図の見方" : "How to read these views"}</h3><ul><li>${ja ? "散布図の横軸は最低energy配座からの全原子RMSD、縦軸はMMFF94相対energyです。" : "The scatter x-axis is all-atom RMSD from the lowest-energy conformer; the y-axis is relative MMFF94 energy."}</li><li>${ja ? "同じenergy・RMSD付近の点は、最適化後にほぼ同じ構造へ収束した候補です。生成後の重複除去が必要であることを示します。" : "Points at nearly identical energy and RMSD correspond to candidates that collapsed to essentially the same optimized geometry."}</li><li>${ja ? "MMFF94は配座の前処理・screeningに有用ですが、この順位をDFT energyや溶液中の存在比と同一視しません。" : "MMFF94 is useful for preparation and screening, but its ranking is not a DFT ranking or a solution-phase population."}</li></ul></div><div class="result-downloads"><a href="${root}assets/calculations/rdkit-pentane/conformer-results.csv" download>${ja ? "結果CSV" : "Results CSV"}</a><a href="${root}assets/calculations/rdkit-pentane/pentane-conformers.sdf" download>${ja ? "全配座SDF" : "Conformer SDF"}</a><a href="${root}assets/calculations/rdkit-pentane/metadata.json">${ja ? "計算条件JSON" : "Metadata JSON"}</a><a href="${root}scripts/calculations/generate_rdkit_example.py">${ja ? "生成script" : "Generation script"}</a></div></section>`;
}

function cubeExample(root, lang) {
  const ja = lang === "ja";
  return `<section class="docs-section calculation-example" id="example-results"><p class="example-label">Reproducible Example</p><h2>9. ${ja ? "アセトンの電子密度・HOMO・LUMO・ESP" : "Calculated example: acetone cube fields"}</h2><p>${ja ? "RDKitで作成したアセトン構造に対し、PySCF 2.14.0でB3LYP/def2-SVP single-point計算を行い、0.24 Å間隔、4.0 Å marginのCubeを出力しました。" : "An RDKit-prepared acetone geometry was used for a PySCF 2.14.0 B3LYP/def2-SVP single-point calculation, with 0.24 Å spacing and a 4.0 Å margin."}</p><div class="calculation-summary"><div><span>SCF</span><strong>${ja ? "収束" : "Converged"}</strong></div><div><span>${ja ? "全energy" : "Total energy"}</span><strong>-193.01179457 E<sub>h</sub></strong></div><div><span>HOMO / LUMO</span><strong>-0.24841 / -0.01895 E<sub>h</sub></strong></div><div><span>${ja ? "密度積分" : "Density integral"}</span><strong>32.0389 e (${ja ? "期待値" : "expected"} 32)</strong></div></div>${cubeViewer(root, lang)}<div class="result-figure-grid"><figure><img src="${root}assets/calculations/pyscf-acetone/acetone-density.png" alt="${ja ? "アセトン電子密度等値面" : "Acetone electron-density isosurface"}" width="1628" height="1144"><figcaption>${ja ? "電子密度のρ = 0.02 e bohr<sup>-3</sup>等値面。" : "Electron density at ρ = 0.02 e bohr<sup>-3</sup>."}</figcaption></figure><figure><img src="${root}assets/calculations/pyscf-acetone/acetone-frontier-orbitals.png" alt="${ja ? "アセトンのHOMOとLUMO" : "Acetone HOMO and LUMO"}" width="2427" height="1144"><figcaption>${ja ? "HOMOとLUMOの正負の軌道位相。" : "Positive and negative phases of the HOMO and LUMO."}</figcaption></figure></div><div class="figure-interpretation"><h3>${ja ? "図の見方" : "How to read these fields"}</h3><ul><li>${ja ? "Density面は指定した電子密度値を満たす境界であり、原子半径そのものではありません。等値を変えると外形も変化します。" : "The density surface is a boundary at a chosen density value, not an atomic radius; changing the isovalue changes its extent."}</li><li>${ja ? "HOMO/LUMOの青と橙は波動関数の位相です。正電荷・負電荷を意味せず、色が切り替わる境界は節に対応します。" : "Blue and orange indicate orbital phase, not positive and negative charge; phase boundaries correspond to nodes."}</li><li>${ja ? "ESPはρ = 0.02のdensity面上へ写像しています。赤は負、青は正のpotentialですが、反応位置は軌道・立体・溶媒などと併せて判断します。" : "ESP is mapped onto the ρ = 0.02 density surface. Red is negative and blue positive, but reactivity also depends on orbitals, sterics, and environment."}</li><li>${ja ? "この構造はDFT最適化・振動数解析を行った研究用構造ではなく、Cube操作を示すsingle-point例です。" : "This is a single-point cube demonstration, not a research geometry validated by DFT optimization and frequencies."}</li></ul></div><div class="result-downloads"><a href="${root}assets/calculations/pyscf-acetone/acetone-density.cube" download>Density Cube</a><a href="${root}assets/calculations/pyscf-acetone/acetone-homo.cube" download>HOMO Cube</a><a href="${root}assets/calculations/pyscf-acetone/acetone-lumo.cube" download>LUMO Cube</a><a href="${root}assets/calculations/pyscf-acetone/acetone-esp.cube" download>ESP Cube</a><a href="${root}assets/calculations/pyscf-acetone/metadata.json">${ja ? "計算条件JSON" : "Metadata JSON"}</a><a href="${root}scripts/calculations/generate_pyscf_cube_example.py">${ja ? "生成script" : "Generation script"}</a></div></section>`;
}

function nciExample(root, lang) {
  const ja = lang === "ja";
  return `<section class="docs-section calculation-example" id="example-results"><p class="example-label">Reproducible Example</p><h2>9. ${ja ? "水二量体のNCI解析" : "Calculated example: water-dimer NCI"}</h2><p>${ja ? "固定した水二量体構造についてPySCFでRHF/def2-SVP波動関数を計算し、NCIplot 4.2.1 alphaでwavefunction-density由来のNCI解析を行いました。" : "A fixed water-dimer geometry was calculated at RHF/def2-SVP and analyzed with NCIplot 4.2.1 alpha using wavefunction-derived density."}</p><div class="calculation-summary"><div><span>SCF</span><strong>${ja ? "収束" : "Converged"}</strong></div><div><span>${ja ? "全energy" : "Total energy"}</span><strong>-151.89476531 E<sub>h</sub></strong></div><div><span>${ja ? "grid間隔" : "Grid spacing"}</span><strong>0.12 Å</strong></div><div><span>RDG isovalue</span><strong>0.50</strong></div></div>${nciViewer(root, lang)}<div class="result-figure-grid"><figure><img src="${root}assets/calculations/nciplot-water-dimer/water-dimer-nci-surface.png" alt="${ja ? "水二量体のNCI等値面" : "Water-dimer NCI isosurface"}" width="1628" height="1144"><figcaption>${ja ? "RDG = 0.50の面をsign(λ2)ρ × 1000で着色。" : "RDG = 0.50 colored by sign(λ2)ρ × 1000."}</figcaption></figure><figure><img src="${root}assets/calculations/nciplot-water-dimer/water-dimer-rdg-scatter.png" alt="${ja ? "水二量体の標準的なNCI scatter" : "Standard water-dimer NCI scatter plot"}" width="1628" height="1056"><figcaption>${ja ? "横軸sign(λ2)ρ、縦軸RDGのscatter。点色とカラーバーは表面色に対応します。" : "RDG versus sign(λ2)ρ; point and color-bar colors match the surface."}</figcaption></figure></div><div class="figure-interpretation"><h3>${ja ? "図の見方" : "How to read the NCI plots"}</h3><ul><li>${ja ? "低RDGかつsign(λ2)ρが負の点はattractive-likeです。この例ではO-H···O間の青寄りの面と負側のspikeが対応します。" : "Low-RDG points at negative sign(λ2)ρ are attractive-like; here they correspond to the blue-shifted surface and negative-side spike along O-H···O."}</li><li>${ja ? "0付近の緑は弱い接触・分散的領域として現れやすく、正側の赤はrepulsive/steric-likeな密度重なりに対応します。" : "Green near zero is commonly weak-contact or dispersion-like; positive red regions are repulsive/steric-like density overlap."}</li><li>${ja ? "色は相互作用の定性的指標です。表面積、色、spike位置から水素結合energyを直接求めることはできません。" : "The colors are qualitative interaction indicators; surface area, color, or spike position does not directly yield a hydrogen-bond energy."}</li><li>${ja ? "density model、grid、cutoff、isovalueを変えると図も変わるため、比較では同じ設定を固定します。" : "Density model, grid, cutoffs, and isovalue affect the plot and must be held fixed in comparisons."}</li></ul></div><div class="result-downloads"><a href="${root}assets/calculations/nciplot-water-dimer/water-dimer.nci" download>NCI input</a><a href="${root}assets/calculations/nciplot-water-dimer/water-dimer.wfn" download>WFN</a><a href="${root}assets/calculations/nciplot-water-dimer/water-dimer-grad.cube" download>RDG Cube</a><a href="${root}assets/calculations/nciplot-water-dimer/water-dimer-dens.cube" download>Color Cube</a><a href="${root}assets/calculations/nciplot-water-dimer/water-dimer.dat" download>Scatter data</a><a href="${root}assets/calculations/nciplot-water-dimer/metadata.json">${ja ? "計算条件JSON" : "Metadata JSON"}</a><a href="${root}scripts/calculations/generate_nci_example.py">${ja ? "生成script" : "Generation script"}</a></div></section>`;
}

const pages = [
  { file: "pages/methods/rdkit.html", root: "../../", lang: "ja", toc: "参考文献", reference: "参考文献・公式資料", example: rdkitExample },
  { file: "pages/methods/cube.html", root: "../../", lang: "ja", toc: "参考資料", reference: "参考資料", example: cubeExample },
  { file: "pages/methods/nciplot.html", root: "../../", lang: "ja", toc: "参考文献", reference: "参考文献・公式資料", example: nciExample },
  { file: "en/pages/methods/rdkit.html", root: "../../../", lang: "en", toc: "References", reference: "References", example: rdkitExample },
  { file: "en/pages/methods/cube.html", root: "../../../", lang: "en", toc: "References", reference: "References", example: cubeExample },
  { file: "en/pages/methods/nciplot.html", root: "../../../", lang: "en", toc: "References", reference: "References", example: nciExample },
];

for (const page of pages) {
  let html = fs.readFileSync(page.file, "utf8");
  const exampleHtml = page.example(page.root, page.lang);
  const existingExample = /<section class="docs-section calculation-example" id="example-results">[\s\S]*?<\/section>/;
  if (existingExample.test(html)) {
    html = html.replace(existingExample, exampleHtml);
  } else {
    const tocNeedle = `<li><a href="#references">${page.toc}</a></li>`;
    const referenceNeedle = `<section class="docs-section" id="references"><h2>9. ${page.reference}</h2>`;
    if (!html.includes(tocNeedle) || !html.includes(referenceNeedle)) throw new Error(`Insertion point not found: ${page.file}`);
    html = html.replace(tocNeedle, `<li><a href="#example-results">${page.lang === "ja" ? "実計算例" : "Calculated example"}</a></li>${tocNeedle}`);
    html = html.replace(referenceNeedle, `${exampleHtml}\n<section class="docs-section" id="references"><h2>10. ${page.reference}</h2>`);
  }
  if (!html.includes("3Dmol-min.js")) {
    html = html.replace("</body>", `<script src="${page.root}assets/vendor/3dmol/3Dmol-min.js"></script><script src="${page.root}scripts/molecular-viewers.js?v=20260804-2"></script>\n</body>`);
  }
  html = html.replace("molecular-viewers.js?v=20260804-1", "molecular-viewers.js?v=20260804-2");
  fs.writeFileSync(page.file, html, "utf8");
}
