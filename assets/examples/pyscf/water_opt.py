"""Run a B3LYP/def2-SVP water calculation and geomeTRIC optimization."""

from pyscf import dft, gto
from pyscf.geomopt.geometric_solver import optimize

mol = gto.M(
    atom="""
    O  0.000000  0.000000  0.117300
    H  0.000000  0.757200 -0.469200
    H  0.000000 -0.757200 -0.469200
    """,
    basis="def2-svp",
    charge=0,
    spin=0,
    unit="Angstrom",
    verbose=4,
)

mf = dft.RKS(mol)
mf.xc = "B3LYP"
mf.grids.level = 4
mf.conv_tol = 1e-10
mf.kernel()
if not mf.converged:
    raise RuntimeError("SCF did not converge")

mol_eq = optimize(mf, maxsteps=100)
print(mol_eq.tostring())
