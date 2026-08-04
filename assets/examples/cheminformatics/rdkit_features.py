from rdkit import Chem, DataStructs
from rdkit.Chem import AllChem, Descriptors, inchi, rdFingerprintGenerator


smiles_list = ["CCO", "CCCO", "c1ccccc1O", "CC(=O)NC1=CC=CC=C1"]
mols = [Chem.MolFromSmiles(smiles) for smiles in smiles_list]
if any(mol is None for mol in mols):
    raise ValueError("At least one SMILES string could not be parsed")

generator = rdFingerprintGenerator.GetMorganGenerator(radius=2, fpSize=2048)
fingerprints = [generator.GetFingerprint(mol) for mol in mols]
amide = Chem.MolFromSmarts("[NX3][CX3](=[OX1])")

for smiles, mol, fingerprint in zip(smiles_list, mols, fingerprints):
    AllChem.ComputeGasteigerCharges(mol)
    row = {
        "input_smiles": smiles,
        "canonical_smiles": Chem.MolToSmiles(mol, isomericSmiles=True),
        "inchi_key": inchi.MolToInchiKey(mol),
        "mol_wt": Descriptors.MolWt(mol),
        "log_p": Descriptors.MolLogP(mol),
        "tpsa": Descriptors.TPSA(mol),
        "has_amide": mol.HasSubstructMatch(amide),
        "gasteiger_charge": [
            atom.GetDoubleProp("_GasteigerCharge") for atom in mol.GetAtoms()
        ],
    }
    print(row)

print(DataStructs.BulkTanimotoSimilarity(fingerprints[0], fingerprints[1:]))
