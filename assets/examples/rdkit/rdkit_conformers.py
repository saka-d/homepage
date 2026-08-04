"""Generate, optimize, rank, and export acetophenone conformers."""

from pathlib import Path

from rdkit import Chem
from rdkit.Chem import AllChem, Descriptors, rdMolAlign

SMILES = "CC(=O)c1ccccc1"
OUTPUT = Path("acetophenone_conformers.sdf")

mol = Chem.MolFromSmiles(SMILES)
if mol is None:
    raise ValueError(f"Invalid SMILES: {SMILES}")

mol = Chem.AddHs(mol)
params = AllChem.ETKDGv3()
params.randomSeed = 20260804
params.pruneRmsThresh = 0.35
params.useSmallRingTorsions = True
conformer_ids = list(AllChem.EmbedMultipleConfs(mol, numConfs=100, params=params))

if not conformer_ids:
    raise RuntimeError("Conformer generation failed")
if not AllChem.MMFFHasAllMoleculeParams(mol):
    raise RuntimeError("MMFF94 parameters are unavailable")

results = AllChem.MMFFOptimizeMoleculeConfs(mol, maxIters=1000)
ranked = sorted(
    ((conf_id, status, energy) for conf_id, (status, energy) in zip(conformer_ids, results)),
    key=lambda item: item[2],
)

writer = Chem.SDWriter(str(OUTPUT))
for rank, (conf_id, status, energy) in enumerate(ranked, start=1):
    mol.SetProp("conformer_rank", str(rank))
    mol.SetProp("mmff_status", str(status))
    mol.SetProp("mmff_energy_kcal_mol", f"{energy:.6f}")
    if rank > 1:
        rmsd = rdMolAlign.GetBestRMS(mol, mol, prbId=conf_id, refId=ranked[0][0])
        mol.SetProp("rmsd_to_lowest_angstrom", f"{rmsd:.6f}")
    writer.write(mol, confId=conf_id)
writer.close()

print(f"Canonical SMILES: {Chem.MolToSmiles(Chem.RemoveHs(mol), isomericSmiles=True)}")
print(f"Molecular weight: {Descriptors.MolWt(mol):.3f}")
print(f"Conformers written: {len(ranked)} -> {OUTPUT}")
