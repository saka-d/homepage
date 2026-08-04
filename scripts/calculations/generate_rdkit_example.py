"""Generate a reproducible n-pentane ETKDG/MMFF conformer example."""

from __future__ import annotations

import csv
import json
import platform
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from rdkit import Chem, rdBase
from rdkit.Chem import AllChem, Draw, rdMolAlign

from plot_utils import draw_molecule, finish_3d, save_figure


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "assets/calculations/rdkit-pentane"
SMILES = "CCCCC"
SEED = 20260804


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    mol = Chem.AddHs(Chem.MolFromSmiles(SMILES))
    params = AllChem.ETKDGv3()
    params.randomSeed = SEED
    params.pruneRmsThresh = 0.15
    params.useSmallRingTorsions = True
    conformer_ids = list(AllChem.EmbedMultipleConfs(mol, numConfs=100, params=params))
    if not conformer_ids or not AllChem.MMFFHasAllMoleculeParams(mol):
        raise RuntimeError("ETKDG generation or MMFF parameter assignment failed")

    optimized = AllChem.MMFFOptimizeMoleculeConfs(mol, maxIters=1000)
    ranked = sorted(
        (conf_id, status, energy)
        for conf_id, (status, energy) in zip(conformer_ids, optimized)
    )
    ranked.sort(key=lambda item: item[2])
    reference_id = ranked[0][0]
    rows = []
    for rank, (conf_id, status, energy) in enumerate(ranked, start=1):
        rows.append({
            "rank": rank,
            "conformer_id": conf_id,
            "mmff_status": status,
            "mmff_energy_kcal_mol": energy,
            "relative_energy_kcal_mol": energy - ranked[0][2],
            "rmsd_to_lowest_angstrom": rdMolAlign.GetBestRMS(
                mol, mol, prbId=conf_id, refId=reference_id
            ),
        })

    with (OUTPUT / "conformer-results.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    writer = Chem.SDWriter(str(OUTPUT / "pentane-conformers.sdf"))
    for row in rows:
        for key, value in row.items():
            mol.SetProp(key, str(value))
        writer.write(mol, confId=row["conformer_id"])
    writer.close()

    molecule_2d = Chem.RemoveHs(Chem.Mol(mol))
    Draw.MolToFile(molecule_2d, str(OUTPUT / "pentane-2d.png"), size=(1200, 650))

    conformer = mol.GetConformer(reference_id)
    symbols = [atom.GetSymbol() for atom in mol.GetAtoms()]
    coordinates = np.array([list(conformer.GetAtomPosition(i)) for i in range(mol.GetNumAtoms())])
    bonds = [(bond.GetBeginAtomIdx(), bond.GetEndAtomIdx()) for bond in mol.GetBonds()]
    fig = plt.figure(figsize=(7.4, 5.2))
    ax = fig.add_subplot(111, projection="3d")
    draw_molecule(ax, symbols, coordinates, bonds)
    finish_3d(ax, coordinates, elev=19, azim=-58)
    ax.set_title("Lowest-MMFF-energy conformer", pad=4, fontsize=12, weight="bold")
    save_figure(fig, OUTPUT / "pentane-3d.png")

    fig, ax = plt.subplots(figsize=(7.4, 4.5))
    relative = np.array([row["relative_energy_kcal_mol"] for row in rows])
    rmsd = np.array([row["rmsd_to_lowest_angstrom"] for row in rows])
    scatter = ax.scatter(rmsd, relative, c=relative, cmap="viridis", s=48, edgecolor="white", linewidth=0.6)
    ax.set(xlabel="RMSD to lowest-energy conformer / Å", ylabel="Relative MMFF94 energy / kcal mol$^{-1}$")
    ax.grid(color="#d9e2ec", linewidth=0.7)
    fig.colorbar(scatter, ax=ax, label="Relative energy / kcal mol$^{-1}$")
    fig.tight_layout()
    save_figure(fig, OUTPUT / "conformer-energy-rmsd.png")

    metadata = {
        "example": "n-Pentane conformer generation",
        "canonical_smiles": Chem.MolToSmiles(Chem.RemoveHs(mol), canonical=True),
        "software": {"RDKit": rdBase.rdkitVersion, "Python": platform.python_version()},
        "method": "ETKDGv3 followed by MMFF94 optimization",
        "requested_conformers": 100,
        "generated_conformers": len(rows),
        "random_seed": SEED,
        "prune_rms_threshold_angstrom": 0.15,
        "lowest_mmff_energy_kcal_mol": ranked[0][2],
        "converged_conformers": sum(row["mmff_status"] == 0 for row in rows),
        "note": "MMFF energies rank force-field conformers and are not electronic energies.",
    }
    (OUTPUT / "metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(json.dumps(metadata, indent=2))


if __name__ == "__main__":
    main()
