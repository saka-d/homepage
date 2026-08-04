document.addEventListener("DOMContentLoaded", () => {
    const navToggle = document.querySelector(".nav-toggle");
    const navMenu = document.querySelector(".nav-menu");
    const yearNodes = document.querySelectorAll("[data-current-year]");
    const isJapanesePage = document.documentElement.lang === "ja";

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
        if (isJapanesePage && button.textContent.trim() === "Copy") button.textContent = "コピー";
        button.addEventListener("click", async () => {
            const targetId = button.getAttribute("data-copy-target");
            const target = targetId ? document.getElementById(targetId) : null;

            if (!target) {
                return;
            }

            try {
                await navigator.clipboard.writeText(target.textContent || "");
                const originalLabel = button.textContent;
                button.textContent = isJapanesePage ? "コピーしました" : "Copied";
                window.setTimeout(() => {
                    button.textContent = originalLabel;
                }, 1600);
            } catch (_error) {
                button.textContent = isJapanesePage ? "テキストを選択" : "Select text";
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

    const formatPublicationCount = (count) => isJapanesePage
        ? `${count}件`
        : `${count} publication${count === 1 ? "" : "s"}`;

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
            if (publicationCount) publicationCount.textContent = formatPublicationCount(visible);
        });
    });

    if (publicationCount && publicationItems.length) {
        publicationCount.textContent = formatPublicationCount(publicationItems.length);
    }

    document.querySelectorAll(".methods-switcher-inner, .track-switcher-inner").forEach((scroller) => {
        const active = scroller.querySelector(".active, [aria-current='page']");
        if (!(active instanceof HTMLElement) || scroller.scrollWidth <= scroller.clientWidth) return;
        scroller.scrollLeft = Math.max(0, active.offsetLeft - (scroller.clientWidth - active.offsetWidth) / 2);
    });

    const glossarySearch = document.querySelector("[data-glossary-search]");
    const glossaryEntries = Array.from(document.querySelectorAll("[data-glossary-entry]"));
    const glossaryCount = document.querySelector("[data-glossary-count]");

    if (glossarySearch instanceof HTMLInputElement && glossaryEntries.length) {
        const updateGlossary = () => {
            const query = glossarySearch.value.trim().toLocaleLowerCase();
            let visible = 0;
            glossaryEntries.forEach((entry) => {
                const matches = !query || (entry.textContent || "").toLocaleLowerCase().includes(query);
                entry.hidden = !matches;
                visible += Number(matches);
            });
            document.querySelectorAll(".glossary-list").forEach((list) => {
                list.closest(".docs-section").hidden = !Array.from(list.children).some((entry) => !entry.hidden);
            });
            if (glossaryCount) glossaryCount.textContent = `${visible} / ${glossaryEntries.length}`;
        };
        glossarySearch.addEventListener("input", updateGlossary);
        updateGlossary();
    }

    const siteSearch = document.querySelector("[data-site-search]");
    const siteSearchInput = document.querySelector("[data-site-search-input]");
    const siteSearchResults = document.querySelector("[data-site-search-results]");
    const siteSearchStatus = document.querySelector("[data-site-search-status]");

    if (siteSearch && siteSearchInput instanceof HTMLInputElement && siteSearchResults && siteSearchStatus) {
        const isJapanese = document.documentElement.lang === "ja";
        let searchIndex = [];
        const normalize = (value) => value.normalize("NFKC").toLocaleLowerCase();
        const renderResults = (query) => {
            const terms = normalize(query).split(/\s+/).filter(Boolean);
            siteSearchResults.replaceChildren();
            if (!terms.length) {
                siteSearchStatus.textContent = isJapanese ? "検索語を入力してください。" : "Enter one or more search terms.";
                return;
            }
            const ranked = searchIndex.map((page) => {
                const title = normalize(page.title);
                const headings = normalize(page.headings.join(" "));
                const text = normalize(`${page.description} ${page.text}`);
                if (!terms.every((term) => title.includes(term) || headings.includes(term) || text.includes(term))) return null;
                const score = terms.reduce((total, term) => total + Number(title.includes(term)) * 8 + Number(headings.includes(term)) * 4 + Number(text.includes(term)), 0);
                return { page, score };
            }).filter(Boolean).sort((a, b) => b.score - a.score || a.page.title.localeCompare(b.page.title)).slice(0, 30);

            ranked.forEach(({ page }) => {
                const item = document.createElement("li");
                const link = document.createElement("a");
                const description = document.createElement("p");
                link.href = page.url;
                link.textContent = page.title;
                description.textContent = page.description;
                item.append(link, description);
                siteSearchResults.append(item);
            });
            siteSearchStatus.textContent = isJapanese ? `${ranked.length}件見つかりました。` : `${ranked.length} result${ranked.length === 1 ? "" : "s"}.`;
        };

        fetch(siteSearch.getAttribute("data-index-url"))
            .then((response) => {
                if (!response.ok) throw new Error(`Search index: ${response.status}`);
                return response.json();
            })
            .then((index) => {
                searchIndex = index;
                const query = new URLSearchParams(window.location.search).get("q") || "";
                siteSearchInput.value = query;
                renderResults(query);
            })
            .catch(() => {
                siteSearchStatus.textContent = isJapanese ? "検索索引を読み込めませんでした。" : "The search index could not be loaded.";
            });

        siteSearch.querySelector("form")?.addEventListener("submit", (event) => {
            event.preventDefault();
            const query = siteSearchInput.value.trim();
            const url = new URL(window.location.href);
            if (query) url.searchParams.set("q", query);
            else url.searchParams.delete("q");
            window.history.replaceState({}, "", url);
            renderResults(query);
        });
    }
});
