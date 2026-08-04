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
});
