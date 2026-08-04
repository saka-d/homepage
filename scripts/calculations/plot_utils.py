"""Small plotting and cube-file helpers for the website examples."""

from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.colors import LinearSegmentedColormap, Normalize
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
from skimage.measure import marching_cubes


ATOM_COLORS = {"H": "#e5e7eb", "C": "#374151", "O": "#dc2626"}
ATOM_SIZES = {"H": 55, "C": 125, "O": 145}
COVALENT_RADII = {"H": 0.31, "C": 0.76, "O": 0.66}


def read_cube(path: Path):
    lines = path.read_text(encoding="utf-8").splitlines()
    atom_count, *origin = lines[2].split()
    natoms = abs(int(atom_count))
    origin = np.asarray(origin, dtype=float)
    shape = []
    axes = []
    for line in lines[3:6]:
        count, *axis = line.split()
        shape.append(abs(int(count)))
        axes.append([float(value) for value in axis])
    atoms = []
    for line in lines[6 : 6 + natoms]:
        atomic_number, _charge, x, y, z = line.split()
        atoms.append((int(float(atomic_number)), np.array([float(x), float(y), float(z)])))
    values = np.fromstring(" ".join(lines[6 + natoms :]), sep=" ")
    return {
        "origin": origin,
        "shape": tuple(shape),
        "axes": np.asarray(axes),
        "atoms": atoms,
        "values": values.reshape(shape),
    }


def cube_vertices(cube, level, return_indices=False):
    vertices, faces, _normals, _values = marching_cubes(cube["values"], level=level)
    points = cube["origin"] + vertices @ cube["axes"]
    if return_indices:
        return points, faces, vertices
    return points, faces


def draw_molecule(ax, symbols, coordinates, bonds=None):
    coordinates = np.asarray(coordinates)
    if bonds is None:
        bonds = []
        for i in range(len(symbols)):
            for j in range(i + 1, len(symbols)):
                threshold = 1.25 * (COVALENT_RADII[symbols[i]] + COVALENT_RADII[symbols[j]])
                if np.linalg.norm(coordinates[i] - coordinates[j]) <= threshold:
                    bonds.append((i, j))
    for i, j in bonds:
        ax.plot(*coordinates[[i, j]].T, color="#64748b", linewidth=2.4, zorder=2)
    for symbol in sorted(set(symbols), key=lambda item: ATOM_SIZES[item], reverse=True):
        mask = np.asarray([item == symbol for item in symbols])
        ax.scatter(
            *coordinates[mask].T,
            s=ATOM_SIZES[symbol],
            c=ATOM_COLORS[symbol],
            edgecolors="#ffffff",
            linewidths=0.8,
            depthshade=True,
            zorder=3,
        )


def draw_surface(ax, points, faces, color, alpha=0.34):
    ax.plot_trisurf(
        points[:, 0],
        points[:, 1],
        points[:, 2],
        triangles=faces,
        color=color,
        linewidth=0,
        antialiased=False,
        alpha=alpha,
        shade=True,
    )


def draw_colored_surface(ax, points, faces, vertex_values, value_range=(-5.0, 5.0), alpha=0.72):
    cmap = LinearSegmentedColormap.from_list("nci", ["#2563eb", "#22c55e", "#dc2626"])
    norm = Normalize(vmin=value_range[0], vmax=value_range[1], clip=True)
    face_values = vertex_values[faces].mean(axis=1)
    collection = Poly3DCollection(points[faces], linewidths=0, alpha=alpha)
    collection.set_facecolor(cmap(norm(face_values)))
    ax.add_collection3d(collection)
    return cmap, norm


def finish_3d(ax, coordinates, elev=22, azim=-62):
    coordinates = np.asarray(coordinates)
    center = coordinates.mean(axis=0)
    span = max(np.ptp(coordinates, axis=0).max(), 2.5) * 0.72
    ax.set_xlim(center[0] - span, center[0] + span)
    ax.set_ylim(center[1] - span, center[1] + span)
    ax.set_zlim(center[2] - span, center[2] + span)
    ax.set_box_aspect((1, 1, 1))
    ax.view_init(elev=elev, azim=azim)
    ax.set_axis_off()


def save_figure(fig, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(path, dpi=220, facecolor="white")
    plt.close(fig)
