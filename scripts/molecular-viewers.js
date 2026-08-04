(() => {
    const viewerNodes = document.querySelectorAll("[data-molecular-viewer]");
    if (!viewerNodes.length) return;

    const loadText = async (url) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Could not load ${url} (${response.status})`);
        return response.text();
    };

    const parseCsv = (text) => {
        const [headerLine, ...rows] = text.trim().split(/\r?\n/);
        const headers = headerLine.split(",");
        return rows.map((row) => Object.fromEntries(row.split(",").map((value, index) => [headers[index], value])));
    };

    const setStatus = (node, message, state = "ready") => {
        const status = node.querySelector("[data-viewer-status]");
        if (status) status.textContent = message;
        node.dataset.viewerState = state;
    };

    const installCommonControls = (node, viewer) => {
        node.querySelector("[data-viewer-reset]")?.addEventListener("click", () => {
            viewer.zoomTo();
            viewer.render();
        });
        node.querySelector("[data-viewer-fullscreen]")?.addEventListener("click", async () => {
            if (!document.fullscreenElement) await node.requestFullscreen?.();
            else await document.exitFullscreen?.();
        });
        document.addEventListener("fullscreenchange", () => window.setTimeout(() => viewer.resize(), 50));
        if ("ResizeObserver" in window) new ResizeObserver(() => viewer.resize()).observe(node);
    };

    const createViewer = (node) => {
        if (!window.$3Dmol) throw new Error("3Dmol.js is unavailable");
        const canvas = node.querySelector("[data-viewer-canvas]");
        const viewer = window.$3Dmol.createViewer(canvas, {
            backgroundColor: "white",
            antialias: true,
        });
        node.molecularViewer = viewer;
        viewer.setProjection("orthographic");
        installCommonControls(node, viewer);
        return viewer;
    };

    const styleMolecule = (viewer) => {
        viewer.setStyle({}, {
            stick: { radius: 0.16, colorscheme: "Jmol" },
            sphere: { scale: 0.27, colorscheme: "Jmol" },
        });
    };

    const initializeConformerViewer = async (node) => {
        const viewer = createViewer(node);
        const [sdf, csv] = await Promise.all([loadText(node.dataset.structure), loadText(node.dataset.results)]);
        const results = parseCsv(csv);
        viewer.addModelsAsFrames(sdf, "sdf");
        styleMolecule(viewer);
        viewer.zoomTo();
        viewer.render();

        const select = node.querySelector("[data-conformer-select]");
        const readout = node.querySelector("[data-conformer-readout]");
        results.forEach((result, index) => {
            const option = document.createElement("option");
            option.value = String(index);
            option.textContent = `${node.dataset.rankLabel} ${result.rank}`;
            select.append(option);
        });
        const showFrame = async () => {
            const index = Number(select.value);
            const result = results[index];
            await viewer.setFrame(index);
            styleMolecule(viewer);
            viewer.render();
            readout.innerHTML = `<strong>${node.dataset.rankLabel} ${result.rank}</strong><span>MMFF94: ${Number(result.mmff_energy_kcal_mol).toFixed(4)} kcal mol<sup>-1</sup></span><span>ΔE: ${Number(result.relative_energy_kcal_mol).toFixed(4)} kcal mol<sup>-1</sup></span><span>RMSD: ${Number(result.rmsd_to_lowest_angstrom).toFixed(3)} Å</span>`;
        };
        select.addEventListener("change", showFrame);
        await showFrame();
        setStatus(node, node.dataset.readyLabel);
    };

    const initializeCubeViewer = async (node) => {
        const viewer = createViewer(node);
        const structure = await loadText(node.dataset.structure);
        viewer.addModel(structure, "mol");
        styleMolecule(viewer);
        const cache = new Map();
        const getVolume = async (field) => {
            if (!cache.has(field)) {
                cache.set(field, loadText(node.dataset[field]).then((text) => new window.$3Dmol.VolumeData(text, "cube")));
            }
            return cache.get(field);
        };
        const buttons = [...node.querySelectorAll("[data-volume-field]")];
        const legends = [...node.querySelectorAll("[data-field-legend]")];
        const renderField = async (field) => {
            buttons.forEach((button) => {
                const active = button.dataset.volumeField === field;
                button.setAttribute("aria-pressed", String(active));
                button.disabled = true;
            });
            setStatus(node, node.dataset.loadingLabel, "loading");
            viewer.removeAllShapes();
            if (field === "density") {
                viewer.addIsosurface(await getVolume("density"), { isoval: 0.02, color: "#38bdf8", opacity: 0.48, smoothness: 3 });
            } else if (field === "homo" || field === "lumo") {
                const volume = await getVolume(field);
                viewer.addIsosurface(volume, { isoval: 0.03, color: "#2563eb", opacity: 0.72, smoothness: 3 });
                viewer.addIsosurface(volume, { isoval: -0.03, color: "#f59e0b", opacity: 0.72, smoothness: 3 });
            } else if (field === "esp") {
                const [density, esp] = await Promise.all([getVolume("density"), getVolume("esp")]);
                viewer.addIsosurface(density, {
                    isoval: 0.02,
                    opacity: 0.78,
                    smoothness: 3,
                    voldata: esp,
                    volscheme: new window.$3Dmol.Gradient.CustomLinear(-0.08, 0.08, ["#dc2626", "#f8fafc", "#2563eb"]),
                });
            }
            legends.forEach((legend) => { legend.hidden = legend.dataset.fieldLegend !== field; });
            viewer.render();
            buttons.forEach((button) => { button.disabled = false; });
            setStatus(node, node.dataset.readyLabel);
        };
        buttons.forEach((button) => button.addEventListener("click", () => renderField(button.dataset.volumeField)));
        viewer.zoomTo();
        await renderField("density");
    };

    const initializeNciViewer = async (node) => {
        const viewer = createViewer(node);
        const [xyz, rdgText, signedText] = await Promise.all([
            loadText(node.dataset.structure),
            loadText(node.dataset.rdg),
            loadText(node.dataset.signedDensity),
        ]);
        viewer.addModel(xyz, "xyz");
        styleMolecule(viewer);
        const rdg = new window.$3Dmol.VolumeData(rdgText, "cube");
        const signedDensity = new window.$3Dmol.VolumeData(signedText, "cube");
        viewer.addIsosurface(rdg, {
            isoval: 0.50,
            opacity: 0.76,
            smoothness: 4,
            voldata: signedDensity,
            volscheme: new window.$3Dmol.Gradient.CustomLinear(-5, 5, ["#2563eb", "#22c55e", "#dc2626"]),
        });
        viewer.zoomTo();
        viewer.render();
        setStatus(node, node.dataset.readyLabel);
    };

    const initialize = async (node) => {
        if (node.dataset.initialized) return;
        node.dataset.initialized = "true";
        setStatus(node, node.dataset.loadingLabel, "loading");
        try {
            const type = node.dataset.molecularViewer;
            if (type === "conformers") await initializeConformerViewer(node);
            else if (type === "cube") await initializeCubeViewer(node);
            else if (type === "nci") await initializeNciViewer(node);
        } catch (error) {
            console.error(error);
            setStatus(node, node.dataset.errorLabel, "error");
        }
    };

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.filter((entry) => entry.isIntersecting).forEach((entry) => {
                observer.unobserve(entry.target);
                initialize(entry.target);
            });
        }, { rootMargin: "400px" });
        viewerNodes.forEach((node) => observer.observe(node));
    } else {
        viewerNodes.forEach(initialize);
    }
})();
