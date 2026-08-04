document.addEventListener("DOMContentLoaded", () => {
    const navToggle = document.querySelector(".nav-toggle");
    const navMenu = document.querySelector(".nav-menu");
    const yearNodes = document.querySelectorAll("[data-current-year]");

    yearNodes.forEach((node) => {
        node.textContent = new Date().getFullYear();
    });

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", () => {
            const isOpen = navMenu.classList.toggle("is-open");
            navToggle.setAttribute("aria-expanded", String(isOpen));
        });

        navMenu.addEventListener("click", (event) => {
            if (event.target instanceof HTMLAnchorElement) {
                navMenu.classList.remove("is-open");
                navToggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    document.querySelectorAll("[data-copy-target]").forEach((button) => {
        button.addEventListener("click", async () => {
            const targetId = button.getAttribute("data-copy-target");
            const target = targetId ? document.getElementById(targetId) : null;

            if (!target) {
                return;
            }

            try {
                await navigator.clipboard.writeText(target.textContent || "");
                const originalLabel = button.textContent;
                button.textContent = "Copied";
                window.setTimeout(() => {
                    button.textContent = originalLabel;
                }, 1600);
            } catch (_error) {
                button.textContent = "Select text";
            }
        });
    });

    const methodsSearch = document.querySelector("[data-methods-search]");
    const methodItems = Array.from(document.querySelectorAll(".method-sequence li"));
    const methodsCount = document.querySelector("[data-methods-count]");

    if (methodsSearch instanceof HTMLInputElement && methodItems.length) {
        const updateMethods = () => {
            const query = methodsSearch.value.trim().toLocaleLowerCase();
            let visible = 0;
            methodItems.forEach((item) => {
                const matches = !query || (item.textContent || "").toLocaleLowerCase().includes(query);
                item.hidden = !matches;
                visible += Number(matches);
            });
            if (methodsCount) methodsCount.textContent = `${visible} / ${methodItems.length}`;
        };
        methodsSearch.addEventListener("input", updateMethods);
        updateMethods();
    }

    const publicationButtons = document.querySelectorAll("[data-publication-filter]");
    const publicationItems = Array.from(document.querySelectorAll(".publications-list .publication-item"));
    const publicationCount = document.querySelector("[data-publication-count]");

    publicationButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const filter = button.getAttribute("data-publication-filter") || "all";
            let visible = 0;
            publicationButtons.forEach((candidate) => candidate.setAttribute("aria-pressed", String(candidate === button)));
            publicationItems.forEach((item) => {
                const year = item.querySelector(".publication-status")?.textContent?.trim() || "";
                const matches = filter === "all" || year.includes(filter);
                item.hidden = !matches;
                visible += Number(matches);
            });
            if (publicationCount) publicationCount.textContent = `${visible}件`;
        });
    });

    if (publicationCount && publicationItems.length) publicationCount.textContent = `${publicationItems.length}件`;
});
