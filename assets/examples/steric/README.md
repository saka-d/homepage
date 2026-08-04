# Steric descriptor command templates

Check atom indices, reference-axis direction, units, and the installed DBSTEP
version before running these commands.

```console
# Sterimol along atom 2 -> atom 5
python -m dbstep conformer.xyz --sterimol --atom1 2 --atom2 5

# Percent buried volume around atom 2 with a 3.5 angstrom sphere
python -m dbstep conformer.xyz --volume --atom1 2 --radius 3.5
```

For comparisons, keep the conformer protocol, van der Waals radii, excluded
atoms, sphere center, radius, grid spacing, and molecular orientation fixed.
