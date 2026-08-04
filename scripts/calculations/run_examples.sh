#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
PYTHON="$ROOT/.venv/bin/python"
export MPLCONFIGDIR="${TMPDIR:-/tmp}/sakaguchi-homepage-matplotlib"
mkdir -p "$MPLCONFIGDIR"

"$PYTHON" "$ROOT/scripts/calculations/generate_rdkit_example.py"
"$PYTHON" "$ROOT/scripts/calculations/generate_pyscf_cube_example.py"
"$PYTHON" "$ROOT/scripts/calculations/generate_nci_example.py"
