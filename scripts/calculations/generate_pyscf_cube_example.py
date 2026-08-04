"""Calculate acetone fields with PySCF and render real cube isosurfaces."""

from __future__ import annotations

import json
import platform
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pyscf
from pyscf import dft, gto
from pyscf.tools import cubegen
from rdkit import Chem, rdBase
from rdkit.Chem import AllChem

from plot_utils import cube_vertices, draw_molecule, draw_surface, finish_3d, read_cube, save_figure


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "assets/calculations/pyscf-acetone"
SEED = 20260804


def rdkit_geometry():
    mol = Chem.AddHs(Chem.MolFromSmiles("CC(=O)C"))
    params = AllChem.ETKDGv3()
    params.randomSeed = SEED
    if AllChem.EmbedMolecule(mol, params) != 0:
        raise RuntimeError("Acetone embedding failed")
    if AllChem.MMFFOptimizeMolecule(mol, maxIters=1000) != 0:
        raise RuntimeError("Acetone MMFF optimization did not converge")
    conformer = mol.GetConformer()
    geometry = [
        (atom.GetSymbol(), tuple(conformer.GetAtomPosition(atom.GetIdx())))
        for atom in mol.GetAtoms()
    ]
    return mol, geometry


def render_fields(geometry):
    symbols = [symbol for symbol, _coords in geometry]
    coords_angstrom = np.array([coords for _symbol, coords in geometry])
    coords_bohr = coords_angstrom / 0.529177210903

    density = read_cube(OUTPUT / "acetone-density.cube")
    density_points, density_faces = cube_vertices(density, 0.02)
    fig = plt.figure(figsize=(7.4, 5.2))
    ax = fig.add_subplot(111, projection="3d")
    draw_surface(ax, density_points, density_faces, "#38bdf8", alpha=0.25)
    draw_molecule(ax, symbols, coords_bohr)
    finish_3d(ax, coords_bohr)
    ax.set_title("Electron-density isosurface, ρ = 0.02 e bohr$^{-3}$", fontsize=11, weight="bold")
    save_figure(fig, OUTPUT / "acetone-density.png")

    fig = plt.figure(figsize=(11, 5.2))
    for index, (name, path) in enumerate([
        ("HOMO", OUTPUT / "acetone-homo.cube"),
        ("LUMO", OUTPUT / "acetone-lumo.cube"),
    ], start=1):
        cube = read_cube(path)
        ax = fig.add_subplot(1, 2, index, projection="3d")
        for level, color in [(0.03, "#2563eb"), (-0.03, "#f59e0b")]:
            points, faces = cube_vertices(cube, level)
            draw_surface(ax, points, faces, color, alpha=0.36)
        draw_molecule(ax, symbols, coords_bohr)
        finish_3d(ax, coords_bohr)
        ax.set_title(f"{name}: ±0.03 bohr$^{{-3/2}}$", fontsize=11, weight="bold")
    fig.tight_layout()
    save_figure(fig, OUTPUT / "acetone-frontier-orbitals.png")
    return density


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    rdkit_mol, geometry = rdkit_geometry()
    atom_spec = "; ".join(
        f"{symbol} {coords[0]:.10f} {coords[1]:.10f} {coords[2]:.10f}"
        for symbol, coords in geometry
    )
    mol = gto.M(atom=atom_spec, basis="def2-svp", charge=0, spin=0, unit="Angstrom", verbose=3)
    mf = dft.RKS(mol)
    mf.xc = "B3LYP"
    mf.grids.level = 4
    mf.conv_tol = 1e-10
    energy = mf.kernel()
    if not mf.converged:
        raise RuntimeError("PySCF SCF did not converge")

    dm = mf.make_rdm1()
    homo = mol.nelectron // 2 - 1
    lumo = homo + 1
    cubegen.density(mol, str(OUTPUT / "acetone-density.cube"), dm, resolution=0.24, margin=4.0)
    cubegen.mep(mol, str(OUTPUT / "acetone-esp.cube"), dm, resolution=0.24, margin=4.0)
    cubegen.orbital(mol, str(OUTPUT / "acetone-homo.cube"), mf.mo_coeff[:, homo], resolution=0.24, margin=4.0)
    cubegen.orbital(mol, str(OUTPUT / "acetone-lumo.cube"), mf.mo_coeff[:, lumo], resolution=0.24, margin=4.0)

    with (OUTPUT / "acetone.xyz").open("w", encoding="utf-8") as handle:
        handle.write(f"{len(geometry)}\nMMFF94 geometry used for B3LYP/def2-SVP single point\n")
        for symbol, coords in geometry:
            handle.write(f"{symbol:2s} {coords[0]: .10f} {coords[1]: .10f} {coords[2]: .10f}\n")

    density = render_fields(geometry)
    voxel_volume = abs(np.linalg.det(density["axes"]))
    integrated_electrons = float(density["values"].sum() * voxel_volume)
    metadata = {
        "example": "Acetone electronic fields",
        "geometry": "RDKit ETKDGv3 and MMFF94 optimized geometry",
        "electronic_structure": "B3LYP/def2-SVP single-point calculation",
        "charge": 0,
        "spin": 0,
        "scf_converged": bool(mf.converged),
        "scf_energy_hartree": float(energy),
        "homo_energy_hartree": float(mf.mo_energy[homo]),
        "lumo_energy_hartree": float(mf.mo_energy[lumo]),
        "cube_resolution_angstrom": 0.24,
        "cube_margin_angstrom": 4.0,
        "density_integral_electrons": integrated_electrons,
        "expected_electrons": mol.nelectron,
        "software": {
            "PySCF": pyscf.__version__,
            "RDKit": rdBase.rdkitVersion,
            "Python": platform.python_version(),
        },
        "note": "This is an educational single-point example, not a converged research result.",
    }
    (OUTPUT / "metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    Chem.MolToMolFile(rdkit_mol, str(OUTPUT / "acetone.mol"))
    print(json.dumps(metadata, indent=2))


if __name__ == "__main__":
    main()
