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
});
