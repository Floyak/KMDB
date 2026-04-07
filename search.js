const catalogData = Array.isArray(window.TECH_DATA) ? window.TECH_DATA : [];
const catalogRoot = document.getElementById("catalogRoot");
const searchInput = document.getElementById("searchInput");
const catalogMeta = document.getElementById("catalogMeta");

function groupByCategory(items) {
    const groups = new Map();

    items.forEach((item) => {
        if (!groups.has(item.category)) {
            groups.set(item.category, []);
        }

        groups.get(item.category).push(item);
    });

    return Array.from(groups.entries()).map(([title, entries]) => ({ title, entries }));
}

function renderCatalog(items) {
    if (!catalogRoot) {
        return;
    }

    if (!items.length) {
        catalogRoot.innerHTML = `
            <div class="catalogEmpty">
                <h2>Нічого не знайдено</h2>
                <p>Спробуйте змінити запит або очистити поле пошуку.</p>
            </div>
        `;

        return;
    }

    const sectionsMarkup = groupByCategory(items)
        .map(({ title, entries }) => {
            const cardsMarkup = entries
                .map((item) => {
                    return `
                        <a class="catalogCard" href="${item.page}">
                            <div class="catalogCardImageWrap">
                                <img src="${item.image}" alt="${item.title}">
                            </div>
                            <div class="catalogCardBody">
                                <p class="catalogCardMeta">${item.category}</p>
                                <h3>${item.title}</h3>
                                <p>${item.description}</p>
                                <span class="catalogCardAction">Відкрити сторінку</span>
                            </div>
                        </a>
                    `;
                })
                .join("");

            return `
                <section class="catalogSection">
                    <div class="catalogSectionHeader">
                        <h2>${title}</h2>
                        <span>${entries.length} од.</span>
                    </div>
                    <div class="catalogGrid">${cardsMarkup}</div>
                </section>
            `;
        })
        .join("");

    catalogRoot.innerHTML = sectionsMarkup;
}

function updateMeta(items) {
    if (!catalogMeta) {
        return;
    }

    const total = catalogData.length;
    catalogMeta.textContent = `Показано ${items.length} з ${total} позицій`;
}

function filterCatalog(query) {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
        renderCatalog(catalogData);
        updateMeta(catalogData);
        return;
    }

    const filtered = catalogData.filter((item) => {
        const haystack = `${item.title} ${item.category} ${item.description}`.toLowerCase();
        return haystack.includes(normalizedQuery);
    });

    renderCatalog(filtered);
    updateMeta(filtered);
}

renderCatalog(catalogData);
updateMeta(catalogData);

if (searchInput) {
    searchInput.addEventListener("input", (event) => {
        filterCatalog(event.target.value);
    });
}


