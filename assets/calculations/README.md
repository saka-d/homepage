# Reproducible calculation examples

These files support the worked examples on the RDKit, Cube, and NCIplot pages.
They are tutorial calculations, not research results.

## Environment

Create `.venv`, then install the pinned direct dependencies:

```sh
.venv/bin/python -m pip install -r scripts/calculations/requirements-results.txt
```

For the NCI example, set `NCIPLOT_BIN` to a local NCIplot executable. The
published output was generated with a local 4.2.1 alpha build.

```sh
NCIPLOT_BIN=/path/to/nciplot npm run examples:generate
npm run examples:markup
npm run i18n:generate
npm run i18n:markup
npm run i18n:check
```

Each result directory contains `metadata.json` with the molecule, method,
software version, numerical settings, and key validation values. Randomized
RDKit steps use the fixed seed `20260804`.
