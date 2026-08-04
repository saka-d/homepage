"""Generate an RDKit conformer and display it with py3Dmol in a notebook."""

import py3Dmol
from rdkit import Chem
from rdkit.Chem import AllChem

mol = Chem.AddHs(Chem.MolFromSmiles("CC(=O)c1ccccc1"))
params = AllChem.ETKDGv3()
params.randomSeed = 20260804
if AllChem.EmbedMolecule(mol, params) != 0:
    raise RuntimeError("Conformer generation failed")
if AllChem.MMFFOptimizeMolecule(mol, maxIters=1000) != 0:
    raise RuntimeError("MMFF optimization did not converge")

view = py3Dmol.view(width=720, height=460)
view.addModel(Chem.MolToMolBlock(mol), "mol")
view.setStyle({"stick": {"radius": 0.16}, "sphere": {"scale": 0.25}})
view.setBackgroundColor("white")
view.zoomTo()
view.show()
