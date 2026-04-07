const vehicleData = Array.isArray(window.TECH_DATA) ? window.TECH_DATA : [];
const vehicleRoot = document.getElementById("vehicleRoot");

const vehicleOverrides = {};

function getSlug() {
    const bodySlug = document.body.dataset.techSlug;
    if (bodySlug) {
        return bodySlug;
    }

    const params = new URLSearchParams(window.location.search);
    return params.get("slug") || "";
}

function normalizeText(value) {
    return (value || "").replace(/\s+/g, " ").trim();
}

function extractFeature(description) {
    const mmMatch = description.match(/(\d+\s*(?:-|–)?\s*мм)/i);
    if (mmMatch) {
        return { label: "Озброєння", value: normalizeText(mmMatch[1]) };
    }

    const baseMatch = description.match(/на баз[^\s]*\s+([^.,]+)/i);
    if (baseMatch) {
        return { label: "База", value: normalizeText(baseMatch[1]) };
    }

    return { label: "Статус", value: "Шаблон сторінки готовий" };
}

function getVehicleConfig(item) {
    const override = vehicleOverrides[item.slug] || {};
    const feature = extractFeature(item.description);
    const itemStats = Array.isArray(item.stats) ? item.stats : null;
    const itemDetails = Array.isArray(item.details) ? item.details : null;

    return {
        eyebrow: override.eyebrow || item.eyebrow || item.category,
        lead: override.lead || item.lead || item.description,
        stats: override.stats || itemStats || [
            { label: "Категорія", value: item.category },
            feature,
            { label: "3D модель", value: item.modelFile }
        ],
        details: override.details || itemDetails || [
            `${item.title} належить до розділу "${item.category}" і вже підключений до єдиної архітектури каталогу техніки.`,
            `${item.description} Щойно ти додаси файл ${item.modelFile} у папку проєкту, ця сторінка автоматично покаже 3D-модель у правому блоці.`
        ]
    };
}

function toggleDetails() {
    const button = document.querySelector("[data-details-toggle]");
    const panel = document.querySelector("[data-details-panel]");

    if (!button || !panel) {
        return;
    }

    const isOpen = panel.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
    panel.setAttribute("aria-hidden", String(!isOpen));
    button.textContent = isOpen ? "Згорнути" : "Докладніше";
}

function attachModelState(item) {
    const modelViewer = document.querySelector("model-viewer");
    const posterFallback = document.querySelector("[data-model-fallback]");

    if (!modelViewer) {
        return;
    }

    modelViewer.addEventListener("error", () => {
        document.body.classList.add("missing-model");
        if (posterFallback) {
            posterFallback.hidden = false;
        }
    });

    modelViewer.addEventListener("load", () => {
        document.body.classList.remove("missing-model");
        if (posterFallback) {
            posterFallback.hidden = true;
        }
    });
}

function renderVehiclePage(item) {
    if (!vehicleRoot) {
        return;
    }

    if (!item) {
        document.title = "ХКБМ | Техніка";
        vehicleRoot.innerHTML = `
            <div class="navbar">
                <a href="index.html" class="iconButton">
                    <img src="home.png" alt="Головна">
                </a>
                <div class="navCenter">
                    <a href="about.html">Про бюро</a>
                    <a href="history.html">Історія</a>
                    <a href="tech.html">Техніка</a>
                    <a href="facts.html">Факти</a>
                    <a href="project.html">Про проєкт</a>
                </div>
                <div class="logoRight">
                    <img src="hkbm.png" alt="ХКБМ">
                </div>
            </div>
            <section class="vehicleFallback">
                <h1>Сторінку не знайдено</h1>
                <p>Не вдалося визначити техніку для цієї сторінки.</p>
                <a href="tech.html">Повернутися до каталогу</a>
            </section>
        `;
        return;
    }

    const config = getVehicleConfig(item);
    document.title = `ХКБМ | ${item.title}`;

    const statsMarkup = config.stats
        .map((stat) => {
            return `
                <article class="vehicleStat">
                    <span class="vehicleStatLabel">${stat.label}</span>
                    <span class="vehicleStatValue js-type" data-type-speed="24">${stat.value}</span>
                </article>
            `;
        })
        .join("");

    const detailsMarkup = config.details
        .map((paragraph) => `<p>${paragraph}</p>`)
        .join("");

    vehicleRoot.innerHTML = `
        <div class="navbar">
            <a href="index.html" class="iconButton">
                <img src="home.png" alt="Головна">
            </a>
            <div class="navCenter">
                <a href="about.html">Про бюро</a>
                <a href="history.html">Історія</a>
                <a href="tech.html">Техніка</a>
                <a href="facts.html">Факти</a>
                    <a href="project.html">Про проєкт</a>
            </div>
            <div class="logoRight">
                <img src="hkbm.png" alt="ХКБМ">
            </div>
        </div>

        <div class="vehiclePageShell">
            <a class="vehicleBackLink" href="tech.html">До каталогу техніки</a>

            <section class="vehicleHero">
                <div class="vehicleInfo">
                    <p class="vehicleEyebrow">${config.eyebrow}</p>
                    <h1 class="vehicleTitle js-type" data-type-speed="54">${item.title}</h1>
                    <p class="vehicleLead">${config.lead}</p>

                    <div class="vehicleStats">
                        ${statsMarkup}
                    </div>

                    <button class="vehicleToggle" type="button" data-details-toggle aria-expanded="false" aria-controls="vehicle-details">
                        Докладніше
                    </button>
                </div>

                <div class="vehicleViewerShell">
                    <div class="vehicleViewerFrame">
                    <img class="vehiclePosterFallback" data-model-fallback src="${item.image}" alt="${item.title}" hidden>
                    <model-viewer
                        src="${item.modelFile}"
                        poster="${item.image}"
                            alt="3D модель ${item.title}"
                            camera-controls
                            auto-rotate
                            auto-rotate-delay="0"
                            rotation-per-second="18deg"
                            shadow-intensity="1"
                            exposure="1.05"
                            environment-image="neutral"
                        interaction-prompt="none"
                        touch-action="pan-y"
                    ></model-viewer>
                    </div>
                </div>
            </section>

            <section class="vehicleDetailsPanel" id="vehicle-details" data-details-panel aria-hidden="true">
                <div class="vehicleDetailsInner">
                    ${detailsMarkup}
                </div>
            </section>
        </div>
    `;

    const toggleButton = document.querySelector("[data-details-toggle]");
    if (toggleButton) {
        toggleButton.addEventListener("click", toggleDetails);
    }

    attachModelState(item);
}

const currentSlug = getSlug();
const currentVehicle = vehicleData.find((item) => item.slug === currentSlug);

renderVehiclePage(currentVehicle);




