const warning = (title, text) => `<div class="callout warning"><strong>${title}</strong><p>${text}</p></div>`;

export const methodExpansions = {
  rdkit: {
    append: {
      overview: `<p>Because force-field energies and quantum-chemical electronic energies have different definitions, use RDKit primarily to prepare a diverse starting ensemble. Refine several low-energy, structurally distinct candidates at the electronic-structure level when relative energies matter.</p>`,
      smiles: warning("Specified and unspecified stereochemistry", "SMILES preserves stereochemistry only when it is explicitly encoded. Before generating conformers, inspect unassigned tetrahedral centers and double-bond stereochemistry instead of allowing an embedding workflow to choose them silently."),
      draw: `<pre><code>from rdkit.Chem import AllChem, Draw

AllChem.Compute2DCoords(mol)
Draw.MolToFile(mol, "molecule.svg", size=(420, 280))</code></pre>`,
      etkdg: `<p>Embedding returns conformer identifiers; compare their count with the requested count and preserve the random seed. Pruning during embedding uses an RMS threshold, so record <code>pruneRmsThresh</code> if it is enabled.</p>`,
      "force-fields": `<pre><code>results = AllChem.MMFFOptimizeMoleculeConfs(
    mol_h, numThreads=0, maxIters=1000, mmffVariant="MMFF94s"
)
# Each tuple is (not_converged, energy).
conformer_data = list(zip(ids, results))</code></pre><p>A status value of 0 indicates convergence. Check <code>MMFFHasAllMoleculeParams</code> before MMFF; use UFF only after confirming that its atom types are chemically sensible for the system.</p>`,
      rmsd: `<pre><code>from rdkit.ML.Cluster import Butina

rms = AllChem.GetConformerRMSMatrix(mol_h, prealigned=False)
clusters = Butina.ClusterData(
    rms, len(ids), 0.75, isDistData=True, reordering=True
)</code></pre>${warning("RMSD is not an energy criterion", "An energy window removes high-energy structures, while RMSD clustering removes geometric redundancy. A reliable ensemble workflow normally uses both.")}`,
      references: `<li><a href="https://www.rdkit.org/docs/source/rdkit.Chem.rdDistGeom.html" target="_blank" rel="noopener noreferrer">RDKit distance-geometry API</a></li><li><a href="https://www.rdkit.org/docs/source/rdkit.Chem.rdForceFieldHelpers.html" target="_blank" rel="noopener noreferrer">RDKit force-field helpers</a></li>`,
    },
    insert: [
      { after: "smiles", id: "mol-object", title: "Mol objects and sanitization", html: `<p>An RDKit <code>Mol</code> stores atoms, bonds, properties, and zero or more conformers. Parsing normally sanitizes valence, aromaticity, conjugation, hybridization, and ring information. A failed parse returns <code>None</code>; do not continue with an invalid object.</p><pre><code>mol = Chem.MolFromSmiles(smiles)
if mol is None:
    raise ValueError(f"Could not parse: {smiles}")
mol_h = Chem.AddHs(mol)
print(mol_h.GetNumAtoms(), mol_h.GetNumConformers())</code></pre>` },
      { after: "rmsd", id: "workflow", title: "Complete preparation example", html: `<ol><li>Parse and validate the molecular graph.</li><li>Assign or verify stereochemistry.</li><li>Add explicit hydrogens.</li><li>Generate many ETKDG conformers with a fixed seed.</li><li>Optimize each conformer and record convergence.</li><li>Apply an energy window and RMSD clustering.</li><li>Write conformer ID, energy, and settings to SDF properties.</li></ol>` },
    ],
  },
  xtb: {
    append: {
      overview: warning("Check the domain of applicability", "Benchmark charge states, open-shell species, transition metals, unusual bonding, reaction barriers, and small selectivity differences against an appropriate higher-level method or experiment."),
      methods: `<p>GFN0-xTB is an additional fast electronic method. GFN-FF is a force field rather than an electronic-structure method, so electronic properties available from GFN-xTB must not be assumed to exist for GFN-FF.</p>`,
      calculation: `<p><code>--chrg</code> is the total charge and <code>--uhf</code> is the number of unpaired electrons, not the spin multiplicity. Inspect the output for SCC convergence and the final total energy.</p>`,
      solvent: `<p>Implicit solvent does not represent specific solvent molecules or every change in association equilibrium. Include explicit solvent molecules when a mechanistically essential interaction requires them, and state how they were sampled.</p>`,
      workflow: `<p>For thermochemistry, confirm that the optimized geometry is a minimum and inspect low-frequency modes. Store the xTB version, method, charge, UHF value, solvent model, optimization level, and command line with every result.</p>`,
      references: `<li><a href="https://doi.org/10.1002/wcms.1493" target="_blank" rel="noopener noreferrer">GFN methods review</a></li>`,
    },
    insert: [
      { after: "calculation", id: "optimization", title: "Geometry optimization", html: `<pre><code>xtb structure.xyz --opt tight --gfn 2 --chrg 0 --uhf 0
# Optimized coordinates are normally written to xtbopt.xyz.</code></pre><p>Optimization convergence does not establish whether the structure is a minimum. Inspect chemical connectivity and follow with a Hessian when the stationary-point character matters.</p>` },
      { after: "calculation", id: "hessian", title: "Hessian, frequencies, and thermochemistry", html: `<pre><code>xtb xtbopt.xyz --hess --gfn 2 --chrg 0 --uhf 0</code></pre><p>The Hessian provides approximate vibrational frequencies and thermal corrections. Imaginary modes indicate that the geometry is not a minimum, subject to numerical noise and the treatment of very soft modes.</p>` },
    ],
  },
  gaussian: {
    append: {
      scf: `<p>For difficult convergence, diagnose the cause before changing algorithms: poor geometry, an inappropriate charge or multiplicity, near-degenerate orbitals, or an unstable reference can all produce similar symptoms. Report any nondefault convergence procedure.</p>`,
      optimization: `<p>An optimization finds a nearby stationary point, not necessarily the intended conformer or global minimum. Monitor connectivity and compare alternative starting structures.</p><pre><code>#p wB97XD/def2SVP Opt=(CalcFC,Tight) Int=UltraFine SCF=Tight</code></pre>`,
      frequency: `<p>Thermal corrections depend on temperature, pressure, standard state, and the harmonic approximation. State whether low-frequency or quasi-harmonic corrections were applied.</p>`,
      "ts-irc": warning("One imaginary frequency is necessary but not sufficient", "The displacement must correspond to the intended bond-making or bond-breaking coordinate, and both IRC endpoints must connect to the expected minima."),
      conditions: `<p>Do not combine electronic energies, thermal corrections, and solvation contributions from incompatible geometries or levels without describing the composite protocol explicitly.</p>`,
      references: `<li><a href="https://gaussian.com/irc/" target="_blank" rel="noopener noreferrer">Gaussian IRC keyword</a></li>`,
    },
    insert: [{ after: "checkpoint", id: "validation", title: "Validation checklist", html: `<ol><li>Confirm charge, multiplicity, atom order, and geometry.</li><li>Confirm SCF and geometry convergence.</li><li>Inspect spin contamination or stability when relevant.</li><li>Use frequencies to classify the stationary point.</li><li>Visualize the transition vector and verify IRC connectivity for a TS.</li><li>Record method, basis, grid, solvent, temperature, standard state, and software revision.</li></ol>` }],
  },
  grrm: {
    append: {
      overview: `<p>Search completeness depends on the starting structures, search options, energy ceiling, collision-energy parameters, and termination conditions. A generated network is therefore a model of the explored region, not proof that every pathway has been found.</p>`,
      engines: `<p>Use one consistent low-cost level during broad exploration. Re-evaluate selected structures and pathways at a common higher level rather than mixing raw energies from different engines.</p><pre><code># Conceptual workflow; use the syntax for the installed GRRM release.
grrm search-input.com
# Refine selected EQ/TS structures with the chosen Gaussian or xTB engine.</code></pre>`,
      addf: `<p>ADDF follows anharmonic downward distortion directions from an equilibrium structure. The number of directions and computational cost grow rapidly with molecular size and flexibility.</p>`,
      afir: warning("Artificial-force paths require refinement", "Energies along an AFIR path contain the artificial-force bias. Remove the force, optimize the candidate TS and minima, and validate their connection on the original potential-energy surface."),
      references: `<li><a href="https://doi.org/10.1021/acs.jpca.0c04351" target="_blank" rel="noopener noreferrer">GRRM strategy and applications</a></li>`,
    },
    insert: [{ after: "engines", id: "network", title: "Potential-energy surfaces and GRRM output", html: `<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Label</th><th>Meaning</th><th>Required check</th></tr></thead><tbody><tr><td>EQ</td><td>Equilibrium structure</td><td>No significant imaginary frequency</td></tr><tr><td>TS</td><td>First-order saddle point</td><td>One relevant imaginary mode and connected endpoints</td></tr><tr><td>DC</td><td>Dissociation channel</td><td>Fragments, charge, spin, and asymptotic behavior</td></tr></tbody></table></div>` }],
  },
  pyscf: {
    append: {
      molecule: warning("PySCF spin convention", "Set spin to Nalpha minus Nbeta. A doublet has spin=1, a triplet spin=2, and a closed-shell singlet spin=0."),
      scf: `<pre><code>mf = dft.RKS(mol).density_fit()
mf.xc = "PBE0"
mf.grids.level = 4
energy = mf.kernel()
if not mf.converged:
    raise RuntimeError("SCF did not converge")</code></pre>`,
      optimization: `<p>The optimizer calls gradients from the attached method. Recreate the electronic-structure object for the optimized geometry before subsequent properties, and verify the stationary point independently.</p>`,
      gpu: `<p>Supported CPU objects can also be converted with <code>.to_gpu()</code>. GPU acceleration changes the implementation, not the theoretical method; compare representative CPU and GPU energies and gradients within a declared tolerance.</p>`,
      colab: `<pre><code>!nvidia-smi
!pip install pyscf gpu4pyscf-cuda12x cutensor-cu12</code></pre><p>Select a GPU runtime first. Installation commands depend on the CUDA image, so record the runtime and package versions in the notebook output.</p>`,
      references: `<li><a href="https://pyscf.org/user/gpu.html" target="_blank" rel="noopener noreferrer">PySCF GPU support</a></li>`,
    },
    insert: [{ after: "colab", id: "validation", title: "Validation and provenance", html: `<ol><li>Save coordinates, units, charge, spin, basis, ECP, functional, and integration-grid settings.</li><li>Check SCF convergence, occupations, and spin.</li><li>Verify optimized structures by gradients and frequencies.</li><li>Record PySCF, GPU4PySCF, CUDA, and optimizer versions.</li><li>Export numerical results from temporary notebook runtimes.</li></ol>` }],
  },
  psi4: {
    append: {
      sapt: `<p>Exchange is normally repulsive, while electrostatics, induction, and dispersion may be attractive or repulsive depending on convention and geometry. Compare terms only at the same SAPT level and basis.</p>`,
      fragments: warning("Keep monomers in the dimer geometry", "If monomers are relaxed separately, deformation energy is mixed into the comparison. State whether counterpoise or ghost-basis conventions are used."),
      fukui: `<p>Finite-difference densities may change spin state or orbital occupation between N, N+1, and N-1 systems. Check these states explicitly; frontier-orbital approximations and relaxed finite differences are not identical definitions.</p>`,
      dual: `<p>With the convention above, positive values are commonly associated with regions more susceptible to nucleophilic attack and negative values with electrophilic attack. Always state the convention because signs are sometimes reported oppositely.</p>`,
      cube: `<pre><code>set cubeprop_tasks ["DENSITY", "FRONTIER_ORBITALS", "DUAL_DESCRIPTOR"]
set cubic_grid_spacing [0.15, 0.15, 0.15]
set cubic_grid_overage [4.0, 4.0, 4.0]
energy("b3lyp")
cubeprop()</code></pre>`,
      references: `<li><a href="https://psicode.org/psi4manual/master/optking.html" target="_blank" rel="noopener noreferrer">Psi4 geometry optimization</a></li>`,
    },
    insert: [{ after: "overview", id: "basic", title: "Energy and geometry optimization", html: `<pre><code>molecule mol {
  0 1
  O  0.0000  0.0000  0.0000
  H  0.0000 -0.7570  0.5870
  H  0.0000  0.7570  0.5870
}
set basis def2-svp
energy("b3lyp-d3bj")
optimize("b3lyp-d3bj")</code></pre><p>Check SCF and optimization convergence and use a Hessian or frequency calculation to establish the stationary-point character.</p>` }, { after: "cube", id: "validation", title: "Validation", html: `<ol><li>Verify fragment charges, multiplicities, and geometries.</li><li>Report SAPT level, basis, frozen-core and density-fitting settings.</li><li>Keep charge-state geometries and grids consistent for finite differences.</li><li>State dual-descriptor sign convention.</li><li>Check cube extents, spacing, and orbital indices.</li></ol>` }],
  },
  orca: {
    append: {
      interaction: `<p>Distinguish interaction energy from binding energy: the latter may additionally include deformation, zero-point, thermal, solvation, and standard-state terms.</p>`,
      fragments: warning("Fragment choice defines the result", "Changing fragment charge, spin, orbital occupations, or the bond that is conceptually cleaved changes the EDA path and therefore the numerical components."),
      eda: `<p>Electrostatics describes interaction between unrelaxed fragment densities, Pauli repulsion arises from antisymmetrization, orbital interaction includes polarization and charge transfer, and dispersion follows the selected dispersion treatment.</p>`,
      nocv: `<p>Report both the deformation-density isovalue and the paired energy contribution. The overall sign of a plotted deformation-density pair can be reversed, so interpret density flow with the program convention and fragment definition.</p>`,
      led: `<p>LED is most naturally paired with DLPNO-CCSD(T)-type calculations. Its preparation, electrostatic, exchange, and correlation-related terms are not numerically interchangeable with ETS-NOCV or SAPT components.</p><pre><code>! DLPNO-CCSD(T) def2-TZVP def2-TZVP/C def2/JK \
  RIJCOSX VeryTightSCF TightPNO LED

* xyz 0 1
# Assign atoms to fragments according to the installed-version manual.
*</code></pre>`,
      references: `<li><a href="https://www.faccts.de/docs/orca/6.1/manual/contents/spectroscopyproperties/nocv.html" target="_blank" rel="noopener noreferrer">ORCA EDA-NOCV example</a></li>`,
    },
    insert: [{ after: "eda", id: "input", title: "EDA-NOCV input", html: `<pre><code>! BP86 TZVP EDA

%EDA
  FRAG1 "BP86 TZVP"
  FRAG2 "BP86 TZVP"
  FRAG1_C 1
  FRAG1_M 1
  FRAG2_C 0
  FRAG2_M 1
END

* xyz 1 1
Li (1)  1.986554  0.245933  0.000797
N  (2) -0.424027 -0.022414 -0.010889
H  (2) -0.914047 -0.381589 -0.841562
H  (2) -0.958117 -0.388240  0.789150
H  (2)  0.468043 -0.535155  0.011083
*</code></pre><p>This follows the ORCA 6.1 Li+-NH3 example. Syntax and available EDA variants depend on the version; confirm fragment assignments in the output and use the manual for the installed release.</p>` }, { after: "led", id: "comparison", title: "Choosing SAPT, EDA-NOCV, or LED", html: `<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Method</th><th>Main question</th></tr></thead><tbody><tr><td>SAPT</td><td>How do intermolecular electrostatics, exchange, induction, and dispersion contribute?</td></tr><tr><td>EDA-NOCV</td><td>How do chosen fragments reorganize and exchange density when a complex forms?</td></tr><tr><td>LED</td><td>How is a local-correlation interaction energy partitioned?</td></tr></tbody></table></div>` }],
  },
  cube: {
    append: {
      overview: warning("The extension does not identify the field", "A .cube file may contain a density, orbital amplitude, potential, or derived function. Preserve the field definition, units, method, orbital number, and generation command."),
      structure: `<p>Voxel values are conventionally written with the z index changing fastest. Confirm that the number of values equals <code>Nx * Ny * Nz</code>; some variants store multiple orbitals and require additional header information.</p>`,
      grid: `<p>Gaussian-style files usually use atomic units, while some readers interpret negative voxel counts as an Angstrom convention. Do not infer units from appearance; check the producer and reader specifications.</p>`,
      fields: `<p>An orbital's global sign has no physical meaning. Before subtracting or comparing orbital cubes from separate calculations, match orbitals and align their phases.</p>`,
      generation: `<pre><code>formchk job.chk job.fchk
cubegen 0 density=scf job.fchk density.cube -2 h
cubegen 0 MO=Homo job.fchk homo.cube -2 h</code></pre>`,
      references: `<li><a href="https://gaussian.com/wp-content/uploads/dl/gv6.pdf" target="_blank" rel="noopener noreferrer">GaussView 6 cube help</a></li>`,
    },
    insert: [{ after: "visualization", id: "validation", title: "Numerical validation", html: `<ol><li>Confirm field identity, method, orbital index, and units.</li><li>Compare header dimensions with the number of voxel values.</li><li>Check that the molecule is not clipped by the grid boundary.</li><li>For density, multiply the numerical sum by the voxel volume and compare with the electron count.</li><li>For arithmetic, compare origin, axes, shape, geometry, and units programmatically.</li></ol>` }],
  },
  multiwfn: {
    append: {
      nci: `<p>The sign of the second Hessian eigenvalue multiplied by density is used as a qualitative coloring variable. Negative, near-zero, and positive regions are often described as attractive-like, weak/dispersion-like, and repulsive-like, but these are not unique energy assignments.</p>`,
      igm: `<p>Traditional IGM commonly uses promolecular atomic densities. The gradient difference reflects cancellation between independent and actual gradients; it is an indicator, not an interaction energy.</p>`,
      igmh: `<p>IGMH uses Hirshfeld-partitioned molecular density and can separate interfragment and intrafragment terms. Save the atom-to-fragment assignment because changing it changes the field.</p>`,
      iri: `<p>IRI can display covalent bonds and noncovalent regions in one framework. This broader visibility does not remove dependence on isovalue, density source, grid, or color range.</p>`,
      workflow: `<pre><code>Multiwfn molecule.fchk</code></pre>${warning("Use fixed visualization settings", "For comparative figures, keep geometry alignment, grid spacing, isovalue, color range, opacity, and camera orientation constant. Menu numbers can change between releases, so record the Multiwfn version and selected menu path.")}`,
      references: `<li><a href="https://doi.org/10.1002/jcc.22885" target="_blank" rel="noopener noreferrer">Multiwfn program paper</a></li><li><a href="https://doi.org/10.1021/ja100936w" target="_blank" rel="noopener noreferrer">NCI analysis</a></li><li><a href="https://doi.org/10.1039/C7CP02110K" target="_blank" rel="noopener noreferrer">Independent Gradient Model</a></li><li><a href="https://doi.org/10.1002/jcc.26812" target="_blank" rel="noopener noreferrer">IGMH</a></li><li><a href="https://doi.org/10.1002/cmtd.202100007" target="_blank" rel="noopener noreferrer">Interaction Region Indicator</a></li>`,
    },
    insert: [{ after: "overview", id: "input-grid", title: "Input files and the three-dimensional grid", html: `<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Input</th><th>Information available</th></tr></thead><tbody><tr><td>fchk, wfn/wfx, Molden</td><td>Wavefunction-derived density, orbitals, and derivatives</td></tr><tr><td>Cube</td><td>A precomputed scalar field on a fixed grid</td></tr><tr><td>XYZ</td><td>Geometry and promolecular approximations only</td></tr></tbody></table></div><p>Choose a grid that contains the interaction region with adequate margin and spacing. Record density source, grid, fragments, cutoff, and Multiwfn version.</p>` }, { after: "iri", id: "comparison", title: "Choosing NCI, IGM, IGMH, or IRI", html: `<p>Use NCI for the established RDG and signed-density picture, IGM for fast promolecular screening, IGMH when molecular density and fragment-resolved analysis are important, and IRI when covalent and noncovalent regions should be viewed together. Method choice should follow the chemical question rather than the appearance of the surface.</p>` }],
  },
  nciplot: {
    append: {
      density: warning("Density models are not interchangeable", "Promolecular density is inexpensive but omits density relaxation and polarization. State explicitly whether the plot uses a wavefunction or an XYZ-based promolecular density."),
      input: `<pre><code>1
water-dimer.xyz
OUTPUT 2
CUTOFFS 0.2 2.0
CUTPLOT 0.05 0.5
ISORDG 0.5</code></pre><p>Run with <code>nciplot example.nci example.out</code>. Input keywords vary across releases, so retain the exact input and version.</p>`,
      grid: `<p>Use the same grid extent, spacing, density cutoff, RDG cutoff, and plotting range for a comparative series. A visually larger surface may otherwise be a parameter artifact.</p>`,
      outputs: `<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Output</th><th>Use</th></tr></thead><tbody><tr><td>RDG cube</td><td>Defines the isosurface geometry</td></tr><tr><td>signed-density cube</td><td>Colors the surface</td></tr><tr><td>scatter data</td><td>Plots RDG against signed density</td></tr><tr><td>VMD script</td><td>Reproduces visualization settings</td></tr></tbody></table></div>`,
      visualization: `<pre><code>vmd -e example.vmd</code></pre><p>Inspect the generated VMD script before use and retain it with the cube files. It records which volumetric dataset defines the surface and which field defines its color.</p>`,
      references: `<li><a href="https://doi.org/10.1021/ja100936w" target="_blank" rel="noopener noreferrer">Foundational NCI analysis</a></li>`,
    },
    insert: [{ after: "density", id: "setup", title: "Installation and execution environment", html: `<p>Compile or install NCIplot according to the official repository, then record the program revision, compiler, and density-library setup. Test the installation with a distributed example before analyzing research data.</p>` }, { after: "visualization", id: "multiwfn", title: "Relationship to Multiwfn", html: `<p>NCIplot is a focused command-line implementation for NCI grids and plots. Multiwfn provides broader wavefunction analysis and additional IGM-family functions. The two can produce conceptually related outputs, but defaults, grids, and density sources must be matched before numerical or visual comparison.</p>` }],
  },
  py3dmol: {
    append: {
      setup: `<p>Install with <code>pip install py3Dmol</code>. In notebooks, call <code>show()</code> only after models, styles, surfaces, and camera settings have been added.</p>`,
      formats: `<pre><code>with open("structure.sdf", encoding="utf-8") as handle:
    sdf_text = handle.read()
view.addModel(sdf_text, "sdf")
view.setStyle({"stick": {}})
view.zoomTo()</code></pre>`,
      rdkit: `<p>RDKit coordinates are preserved in the Mol block. If hydrogens were removed for display, document that choice and do not use the displayed atom count as analytical data.</p>`,
      conformers: `<pre><code>for conf_id in range(mol.GetNumConformers()):
    block = Chem.MolToMolBlock(mol, confId=conf_id)
    view.addModel(block, "mol")
view.setStyle({"stick": {}})</code></pre>`,
      styles: `<p>Selections can use element, atom index, residue, chain, or model. Labels and measurements are annotations; verify distances against the underlying coordinates rather than reading them from a screenshot.</p><pre><code>view.addLabel("reactive center", {
    "position": {"x": 0.0, "y": 0.0, "z": 0.0},
    "backgroundColor": "white", "fontColor": "black"
})
view.addLine({"start": {"x": 0, "y": 0, "z": 0},
              "end": {"x": 1.5, "y": 0, "z": 0}})</code></pre>`,
      cube: `<pre><code>view.addVolumetricData(cube_text, "cube", {
    "isoval": 0.03, "color": "blue", "opacity": 0.75
})
view.addVolumetricData(cube_text, "cube", {
    "isoval": -0.03, "color": "red", "opacity": 0.75
})</code></pre>`,
      references: `<li><a href="https://3dmol.csb.pitt.edu/doc/GLViewer.html" target="_blank" rel="noopener noreferrer">3Dmol.js GLViewer API</a></li>`,
    },
    insert: [{ after: "cube", id: "publishing", title: "Publishing and reproducibility", html: `<p>For a public page, provide a fallback description or image when WebGL is unavailable, constrain viewer dimensions responsively, and test touch interaction. Store the source structure, cube file, isovalues, colors, selections, and camera orientation so the view can be reproduced.</p>${warning("A viewer is not the primary data record", "Screenshots and interactive views are presentation layers. Preserve the numerical coordinates and volumetric files separately.")}` }],
  },
  cheminformatics: {
    append: {
      overview: warning("Define chemical identity first", "Salt handling, stereochemistry, isotopes, tautomers, protonation states, and mixtures determine duplicate detection and must be fixed before modeling."),
      identity: `<p>Canonical SMILES may depend on toolkit and version. InChIKey is convenient for indexing but is irreversible; retain the standardized structure and full InChI alongside it.</p>`,
      standardization: warning("Keep the measured form", "Fragment removal or uncharging can disconnect the representation from a measurement performed on a salt or at a specified pH. Preserve the source structure and every transformation."),
      descriptors: `<p>Check for failed charge calculation, nonfinite values, and method-specific parameter limits. Store atom indices when atom-level values will later be mapped onto a drawing or a three-dimensional structure.</p>`,
      substructure: `<p>Validate each SMARTS query against positive and negative test structures. Short functional-group patterns often match more chemical environments than their informal name suggests.</p>`,
      drawing: `<pre><code>from rdkit.Chem.Draw import rdMolDraw2D

hit_atoms = list(target.GetSubstructMatch(amide))
drawer = rdMolDraw2D.MolDraw2DSVG(420, 280)
rdMolDraw2D.PrepareAndDrawMolecule(
    drawer, target, highlightAtoms=hit_atoms
)
drawer.FinishDrawing()</code></pre>`,
      references: `<li><a href="https://www.rdkit.org/docs/source/rdkit.Chem.MolStandardize.rdMolStandardize.html" target="_blank" rel="noopener noreferrer">RDKit MolStandardize API</a></li>`,
    },
  },
  "data-analysis": {
    transform: {
      regularization: (html) => html.replace(/<div class="equation">[\s\S]*?<\/div>/, `<div class="equation"><math display="block"><munder><mo>min</mo><mi>β</mi></munder><mfrac><mn>1</mn><mrow><mn>2</mn><mi>n</mi></mrow></mfrac><msubsup><mrow><mo>∥</mo><mi>y</mi><mo>-</mo><mi>X</mi><mi>β</mi><mo>∥</mo></mrow><mn>2</mn><mn>2</mn></msubsup><mo>+</mo><mi>α</mi><mi>ρ</mi><msub><mrow><mo>∥</mo><mi>β</mi><mo>∥</mo></mrow><mn>1</mn></msub><mo>+</mo><mfrac><mrow><mi>α</mi><mo>(</mo><mn>1</mn><mo>-</mo><mi>ρ</mi><mo>)</mo></mrow><mn>2</mn></mfrac><msubsup><mrow><mo>∥</mo><mi>β</mi><mo>∥</mo></mrow><mn>2</mn><mn>2</mn></msubsup></math></div>`),
    },
    append: {
      matrix: `<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Matrix element</th><th>Chemical example</th></tr></thead><tbody><tr><td>Row</td><td>Molecule, conformer, reaction, or transition-state face</td></tr><tr><td>Column</td><td>Descriptor, fingerprint bit, Sterimol value, or field feature</td></tr><tr><td>Target</td><td>Rate, energy, selectivity, or measured property</td></tr></tbody></table></div>`,
      numpy: `<p>Use <code>np.asarray</code>, inspect <code>shape</code> and <code>dtype</code>, and reject NaN or infinite values before fitting. Broadcasting can silently produce a plausible but unintended array, so test dimensions explicitly.</p>`,
      "least-squares": `<p>The formal normal-equation solution is numerically less stable than QR, SVD, or a tested least-squares solver. Inspect rank and singular values; a large condition number signals scaling differences or collinearity.</p>`,
      regularization: `<p>Standardize features before comparing penalties unless their scales are intentionally meaningful. Select both <code>alpha</code> and the Elastic Net mixing ratio inside cross-validation.</p>`,
      validation: `${warning("Preprocessing belongs inside validation", "Fit scaling, imputation, PCA, and feature selection only on each training fold. Otherwise information from the validation fold leaks into the model.")}<pre><code>from sklearn.model_selection import GroupKFold, cross_validate

cv = GroupKFold(n_splits=5)
scores = cross_validate(
    model, X, y, groups=scaffold_ids, cv=cv,
    scoring={"mae": "neg_mean_absolute_error", "r2": "r2"},
)</code></pre>`,
      pca: `<p>Report explained variance together with scores and loadings. Component signs are arbitrary; interpret groups of correlated loadings rather than assigning mechanism from a single coefficient.</p>`,
      shap: `<p>For correlated chemical descriptors, attribution can be distributed among substitutes. State the explainer, background data, output scale, and correlation assumptions.</p><pre><code>import shap

explainer = shap.Explainer(fitted_model, X_background)
shap_values = explainer(X_test)
shap.plots.beeswarm(shap_values)
shap.plots.waterfall(shap_values[0])</code></pre>`,
      references: `<li><a href="https://scikit-learn.org/stable/modules/compose.html" target="_blank" rel="noopener noreferrer">scikit-learn pipelines</a></li><li><a href="https://scikit-learn.org/stable/modules/cross_validation.html" target="_blank" rel="noopener noreferrer">Cross-validation guidance</a></li>`,
    },
    insert: [{ after: "shap", id: "workflow", title: "Practical workflow", html: `<ol><li>Define the prediction unit and target before calculating features.</li><li>Freeze structure standardization and descriptor definitions.</li><li>Reserve a chemically meaningful external or grouped test set.</li><li>Place every learned preprocessing step inside a pipeline.</li><li>Tune hyperparameters with nested or clearly separated validation.</li><li>Report baselines, uncertainty, and applicability domain.</li><li>Use coefficients, PCA, and SHAP to form hypotheses, then test them with independent chemistry.</li></ol>` }],
  },
  "steric-descriptors": {
    append: {
      representations: `<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Representation</th><th>Retained information</th><th>Lost information</th></tr></thead><tbody><tr><td>Sterimol</td><td>Length and extreme widths about an axis</td><td>Detailed angular shape</td></tr><tr><td>%Vbur</td><td>Total occupancy in a sphere</td><td>Direction of crowding</td></tr><tr><td>Quadrant %Vbur</td><td>Coarse asymmetry</td><td>Fine shape within each quadrant</td></tr><tr><td>Steric map or field</td><td>Spatial distribution</td><td>Simple low-dimensional interpretation</td></tr></tbody></table></div>`,
      conformers: warning("Population estimates inherit energy errors", "Boltzmann weighting depends exponentially on relative free energies. Report the method, temperature, duplicate treatment, and uncertainty; also inspect unweighted distributions when energy differences are uncertain."),
      vbur: `<p>%Vbur is not a universal molecular constant. The center, radius, orientation, excluded atoms, hydrogen treatment, van der Waals radii, scaling factor, and grid spacing are part of its definition.</p>`,
      map: `<p>Place the reactive center at the origin, align the reaction or coordination axis with z, and define x/y using chemically corresponding atoms. A rotation or reflection changes quadrant and pixelwise descriptors.</p>`,
      tools: `<p>DBSTEP atom indices are normally one-based. Save reference atoms and command-line options. For SambVca, preserve the center, orientation, exclusions, sphere radius, mesh, and radii scale.</p>`,
      fields: `<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Field</th><th>Possible information</th><th>Key caution</th></tr></thead><tbody><tr><td>Electron density</td><td>Molecular boundary and density deformation</td><td>Grid and isovalue dependence</td></tr><tr><td>Electrostatic potential</td><td>Spatial electrostatic tendency</td><td>Fix surface and units</td></tr><tr><td>Frontier orbital</td><td>Phase and local amplitude</td><td>Match orbitals and phases</td></tr><tr><td>NCI/IGMH/IRI</td><td>Interaction regions</td><td>Not an energy decomposition</td></tr></tbody></table></div>`,
      selectivity: warning("Correlation does not establish mechanism", "A statistically important region is a mechanistic hypothesis. Combine it with transition structures, energy decomposition, perturbation experiments, or other independent evidence."),
      references: `<li><a href="https://doi.org/10.1038/s41557-019-0319-5" target="_blank" rel="noopener noreferrer">Computer-aided design of catalytic pockets</a></li>`,
    },
  },
};

export function expandMethodSections(slug, sections) {
  const expansion = methodExpansions[slug];
  if (!expansion) return sections;

  const output = [];
  for (const section of sections) {
    const extra = expansion.append?.[section.id] || "";
    const transformed = expansion.transform?.[section.id]
      ? expansion.transform[section.id](section.html)
      : section.html;
    const html = section.id === "references" && extra
      ? transformed.replace("</ul>", `${extra}</ul>`)
      : `${transformed}${extra}`;
    output.push({ ...section, html });
    for (const inserted of expansion.insert || []) {
      if (inserted.after === section.id) output.push(inserted);
    }
  }
  return output;
}
