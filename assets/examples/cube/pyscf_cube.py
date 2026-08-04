from pyscf import gto, scf
from pyscf.tools import cubegen


mol = gto.M(
    atom="O 0 0 0; H 0 -0.757 0.587; H 0 0.757 0.587",
    basis="def2-svp",
    unit="Angstrom",
)
mf = scf.RHF(mol).run()
dm = mf.make_rdm1()
homo = mol.nelectron // 2 - 1

cubegen.density(mol, "water_density.cube", dm, resolution=0.20)
cubegen.mep(mol, "water_esp.cube", dm, resolution=0.20)
cubegen.orbital(
    mol,
    "water_homo.cube",
    mf.mo_coeff[:, homo],
    resolution=0.20,
)
