"""Calculate a water-dimer wavefunction and run NCIplot on it."""

from __future__ import annotations

import json
import os
import platform
import subprocess
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pyscf
from matplotlib.colors import LinearSegmentedColormap, Normalize
from pyscf import gto, scf
from pyscf.tools import wfn_format

from plot_utils import cube_vertices, draw_colored_surface, draw_molecule, finish_3d, read_cube, save_figure


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "assets/calculations/nciplot-water-dimer"
NCIPLOT = Path(os.environ.get("NCIPLOT_BIN", "/Users/mac_poclab/Downloads/src_nciplot_4.2.1_alpha/nciplot"))
GEOMETRY = [
    ("O", (0.000000, 0.000000, 0.000000)),
    ("H", (0.957200, 0.000000, 0.000000)),
    ("H", (-0.239987, 0.927297, 0.000000)),
    ("O", (2.900000, 0.000000, 0.000000)),
    ("H", (3.139987, 0.927297, 0.000000)),
    ("H", (3.139987, -0.927297, 0.000000)),
]


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    if not NCIPLOT.is_file():
        raise FileNotFoundError(f"NCIplot executable not found: {NCIPLOT}")

    atom_spec = "; ".join(
        f"{symbol} {coords[0]} {coords[1]} {coords[2]}" for symbol, coords in GEOMETRY
    )
    mol = gto.M(atom=atom_spec, basis="def2-svp", charge=0, spin=0, unit="Angstrom", verbose=3)
    mf = scf.RHF(mol)
    mf.conv_tol = 1e-10
    energy = mf.kernel()
    if not mf.converged:
        raise RuntimeError("Water-dimer RHF calculation did not converge")

    wfn_path = OUTPUT / "water-dimer.wfn"
    with wfn_path.open("w", encoding="utf-8") as handle:
        wfn_format.write_mo(handle, mol, mf.mo_coeff, mf.mo_energy, mf.mo_occ)
    xyz_path = OUTPUT / "water-dimer.xyz"
    with xyz_path.open("w", encoding="utf-8") as handle:
        handle.write("6\nIllustrative water dimer\n")
        for symbol, coords in GEOMETRY:
            handle.write(f"{symbol:2s} {coords[0]: .8f} {coords[1]: .8f} {coords[2]: .8f}\n")

    input_text = """1
water-dimer.wfn

ONAME water-dimer
OUTPUT 3
CUBE -1.5 -1.8 -1.3 4.4 1.8 1.3
INCREMENTS 0.12 0.12 0.12
CUTOFFS 0.10 2.00
CUTPLOT 0.05 0.50
ISORDG 0.50
"""
    input_path = OUTPUT / "water-dimer.nci"
    input_path.write_text(input_text, encoding="utf-8")
    log_path = OUTPUT / "water-dimer.out"
    subprocess.run(
        [str(NCIPLOT), input_path.name, log_path.name],
        cwd=OUTPUT,
        check=True,
        env={**os.environ, "OMP_NUM_THREADS": "1"},
    )

    dat_path = next(OUTPUT.glob("*.dat"))
    data = np.loadtxt(dat_path)
    if data.ndim == 1:
        data = data.reshape(1, -1)
    fig, ax = plt.subplots(figsize=(7.4, 4.8))
    signed_density, rdg = data[:, 0], data[:, 1]
    mask = np.isfinite(signed_density) & np.isfinite(rdg) & (rdg <= 2.0)
    nci_cmap = LinearSegmentedColormap.from_list("nci_bgr", ["#2563eb", "#22c55e", "#dc2626"])
    nci_norm = Normalize(vmin=-5.0, vmax=5.0, clip=True)
    scatter = ax.scatter(
        signed_density[mask],
        rdg[mask],
        c=signed_density[mask] * 1000,
        cmap=nci_cmap,
        norm=nci_norm,
        s=3,
        alpha=0.32,
        linewidths=0,
        rasterized=True,
    )
    ax.axvline(0, color="#94a3b8", linewidth=0.9)
    ax.set(xlabel=r"sign($\lambda_2$)$\rho$ / a.u.", ylabel="Reduced density gradient")
    ax.set_xlim(-0.04, 0.04)
    ax.set_ylim(0, 2.0)
    ax.grid(color="#d9e2ec", linewidth=0.6)
    colorbar = fig.colorbar(scatter, ax=ax, pad=0.02)
    colorbar.set_label(r"sign($\lambda_2$)$\rho$ × 1000")
    fig.tight_layout()
    save_figure(fig, OUTPUT / "water-dimer-rdg-scatter.png")

    grad_path = next(OUTPUT.glob("*grad*.cube"))
    density_path = next(OUTPUT.glob("*dens*.cube"))
    gradient_cube = read_cube(grad_path)
    density_cube = read_cube(density_path)
    points, faces, grid_vertices = cube_vertices(gradient_cube, 0.50, return_indices=True)
    nearest = np.rint(grid_vertices).astype(int)
    nearest = np.clip(nearest, 0, np.asarray(density_cube["shape"]) - 1)
    signed_density = density_cube["values"][nearest[:, 0], nearest[:, 1], nearest[:, 2]]
    coords_bohr = np.asarray([coords for _symbol, coords in GEOMETRY]) / 0.529177210903
    symbols = [symbol for symbol, _coords in GEOMETRY]
    fig = plt.figure(figsize=(7.4, 5.2))
    ax = fig.add_subplot(111, projection="3d")
    cmap, norm = draw_colored_surface(ax, points, faces, signed_density, value_range=(-5.0, 5.0))
    draw_molecule(ax, symbols, coords_bohr)
    ax.plot(*coords_bohr[[1, 3]].T, color="#0f766e", linestyle="--", linewidth=1.6)
    finish_3d(ax, coords_bohr, elev=24, azim=-66)
    ax.set_title("Water dimer: RDG = 0.50 isosurface", fontsize=11, weight="bold")
    colorbar = fig.colorbar(plt.cm.ScalarMappable(norm=norm, cmap=cmap), ax=ax, shrink=0.58, pad=0.02)
    colorbar.set_label(r"sign($\lambda_2$)$\rho$ × 1000")
    save_figure(fig, OUTPUT / "water-dimer-nci-surface.png")

    metadata = {
        "example": "Water-dimer NCI analysis",
        "geometry": "Fixed illustrative O-H...O water-dimer geometry",
        "wavefunction": "RHF/def2-SVP single-point calculation",
        "scf_converged": bool(mf.converged),
        "scf_energy_hartree": float(energy),
        "density_model": "Wavefunction density from a PySCF-generated WFN file",
        "grid_increment_angstrom": [0.12, 0.12, 0.12],
        "rdg_isovalue": 0.50,
        "density_cutoff_au": 0.10,
        "software": {
            "PySCF": pyscf.__version__,
            "NCIplot": "local 4.2.1 alpha build",
            "Python": platform.python_version(),
        },
        "note": "The NCI surface identifies a low-RDG region; it is not an interaction energy.",
        "density_cube_shape": density_cube["shape"],
    }
    (OUTPUT / "metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(json.dumps(metadata, indent=2))


if __name__ == "__main__":
    main()
