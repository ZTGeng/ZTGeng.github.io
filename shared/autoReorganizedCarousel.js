/**
 * @typedef {Object} Item
 * @property {string} id - 唯一标识符
 * @property {Object} title
 * @property {string} title.en
 * @property {string} title.zh
 * @property {Object} intro
 * @property {string} intro.en
 * @property {string} intro.zh
 * @property {string} src - 链接
 * @property {string} imageSrc - 图片链接
 */

/**
 * @typedef {Object} Catalog
 * @property {string} id - 唯一标识符
 * @property {Object} title
 * @property {string} title.en
 * @property {string} title.zh
 * @property {Item[]} items
 */

const itemIdPrefix = "item-";
const catalogIdPrefix = "catalog-";
const catalogTitleIdPrefix = "catalog-title-";
const carouselIdPrefix = "carousel-";

function getNumOnPage() {
    const screenWidth = window.innerWidth;
    if (screenWidth < 768) {
        return 2;
    } else if (screenWidth < 992) {
        return 3;
    } else {
        return 4;
    }
}

/**
 * @param {Item} item
 * @param {string} [lang="en"]
 * @returns {HTMLElement}
 */
function createItem(item, lang="en") {
    const colDiv = document.createElement("div");
    colDiv.className = "col";
    colDiv.id = itemIdPrefix + item.id;

    const cardDiv = document.createElement("a");
    cardDiv.className = "card h-100 text-decoration-none";
    cardDiv.href = item.src;

    const img = document.createElement("img");
    img.className = "card-img-top";
    img.src = item.imageSrc;
    img.alt = item.title[lang] || item.title["en"];

    const cardBodyDiv = document.createElement("div");
    cardBodyDiv.className = "card-body";

    const cardTitle = document.createElement("h5");
    cardTitle.className = "card-title";
    cardTitle.textContent = item.title[lang] || item.title["en"];

    const cardText = document.createElement("p");
    cardText.className = "card-text";
    cardText.textContent = item.intro[lang] || item.intro["en"];

    cardBodyDiv.appendChild(cardTitle);
    cardBodyDiv.appendChild(cardText);

    cardDiv.appendChild(img);
    cardDiv.appendChild(cardBodyDiv);

    colDiv.appendChild(cardDiv);

    return colDiv;
}

/**
 * @param {Catalog} catalog
 * @param {string} [lang="en"]
 * @returns {HTMLElement}
 */
function createCarousel(catalog, lang="en") {
    const carouselDiv = document.createElement("div");
    carouselDiv.className = "carousel carousel-dark slide mb-4";
    carouselDiv.id = carouselIdPrefix + catalog.id;

    const carouselInner = document.createElement("div");
    carouselInner.className = "carousel-inner";

    const items = catalog.items.map(item => createItem(item, lang));
    const numOnPage = getNumOnPage();
    const numPages = Math.ceil(items.length / numOnPage);
    for (let i = 0; i < numPages; i++) {
        const carouselItem = document.createElement("div");
        carouselItem.className = "carousel-item";
        if (i === 0) {
            carouselItem.classList.add("active");
        }
        const carouselItemInner = document.createElement("div");
        carouselItemInner.className = "carousel-item-inner row row-cols-" + numOnPage + " justify-content-center g-4";
        for (let j = 0; j < numOnPage; j++) {
            if (i * numOnPage + j >= items.length) {
                break;
            }
            const item = items[i * numOnPage + j];
            if (!item.classList.contains("col")) {
                item.classList.add("col");
            }
            carouselItemInner.appendChild(item);
        }
        carouselItem.appendChild(carouselItemInner);
        carouselInner.appendChild(carouselItem);
    }

    const prevButton = document.createElement("button");
    prevButton.className = "carousel-control-prev";
    prevButton.setAttribute("type", "button");
    prevButton.setAttribute("data-bs-target", "#" + carouselDiv.id);
    prevButton.setAttribute("data-bs-slide", "prev");
    prevButton.innerHTML = '<span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Previous</span>';

    const nextButton = document.createElement("button");
    nextButton.className = "carousel-control-next";
    nextButton.setAttribute("type", "button");
    nextButton.setAttribute("data-bs-target", "#" + carouselDiv.id);
    nextButton.setAttribute("data-bs-slide", "next");
    nextButton.innerHTML = '<span class="carousel-control-next-icon" aria-hidden="true"></span><span class="visually-hidden">Next</span>';

    carouselDiv.appendChild(carouselInner);
    carouselDiv.appendChild(prevButton);
    carouselDiv.appendChild(nextButton);

    return carouselDiv;
}

/**
 * @param {Catalog} catalog
 * @param {string} [lang="en"]
 * @returns {HTMLElement}
 */
function createCatalog(catalog, lang="en") {
    const catalogDiv = document.createElement("div");
    catalogDiv.id = catalogIdPrefix + catalog.id;

    const catalogTitle = document.createElement("h4");
    catalogTitle.id = catalogTitleIdPrefix + catalog.id;
    catalogTitle.textContent = catalog.title[lang] || catalog.title["en"];

    const carouselDiv = createCarousel(catalog, lang);
    
    catalogDiv.appendChild(catalogTitle);
    catalogDiv.appendChild(carouselDiv);
    return catalogDiv;
}

/**
 * @param {Catalog[]} catalogs
 * @param {string} [lang="en"]
 * @returns {HTMLElement[]}
 */ 
function createCatalogsAndListenToResize(catalogs, lang="en") {
    const catalogDOMs = catalogs.map(catalog => createCatalog(catalog, lang));
    listenToResize(catalogDOMs);
    return catalogDOMs;
}

/**
 * @param {Catalog} catalogs 
 * @param {String} [lang="en"]
 * @returns {HTMLElement}
 */
function switchCatalogsLanguage(catalogs, lang="en") {    
    for (let catalog of catalogs) {
        const catalogTitle = document.getElementById(catalogTitleIdPrefix + catalog.id);
        if (catalogTitle) {
            catalogTitle.textContent = catalog.title[lang] || catalog.title["en"];
        }

        for (let item of catalog.items) {
            const itemDiv = document.getElementById(itemIdPrefix + item.id);
            if (itemDiv) {
                const cardTitle = itemDiv.querySelector(".card-title");
                if (cardTitle) {
                    cardTitle.textContent = item.title[lang] || item.title["en"];
                }

                const cardText = itemDiv.querySelector(".card-text");
                if (cardText) {
                    cardText.textContent = item.intro[lang] || item.intro["en"];
                }

                const imgElement = itemDiv.querySelector("img.card-img-top");
                if (imgElement) {
                    imgElement.alt = item.title[lang] || item.title["en"];
                }
            }
        }
    }
}

function reorganizeCarousel(carousel, numOnPage) {
    const carouselInner = carousel.getElementsByClassName("carousel-inner")[0];
    if (!carouselInner) {
        return;
    }
    const carouselItems = carouselInner.getElementsByClassName("carousel-item");
    const items = [];
    for (let carouselItem of carouselItems) {
        const carouselItemInner = carouselItem.querySelector(".carousel-item-inner");
        if (!carouselItemInner) {
            continue;
        }
        for (let item of carouselItemInner.children) {
            items.push(item);
        }
    }
    carouselInner.innerHTML = "";

    const numPages = Math.ceil(items.length / numOnPage);
    for (let i = 0; i < numPages; i++) {
        const carouselItem = document.createElement("div");
        carouselItem.className = "carousel-item";
        if (i === 0) {
            carouselItem.classList.add("active");
        }
        const carouselItemInner = document.createElement("div");
        carouselItemInner.className = "carousel-item-inner row row-cols-" + numOnPage + " justify-content-center g-4";
        for (let j = 0; j < numOnPage; j++) {
            if (i * numOnPage + j >= items.length) {
                break;
            }
            const item = items[i * numOnPage + j];
            carouselItemInner.appendChild(item);
        }
        carouselItem.appendChild(carouselItemInner);
        carouselInner.appendChild(carouselItem);

    }
}

function listenToResize(catalogDOMs, intervel = 200) {
    window.addEventListener("resize", () => {
        let inThrottle;
        let lastNumOnPage = getNumOnPage();
        if (!inThrottle) {
            inThrottle = true;
            setTimeout(function() {
                inThrottle = false;

                const numOnPage = getNumOnPage();
                if (numOnPage !== lastNumOnPage) {
                    lastNumOnPage = numOnPage;
                    for (let catalogDOM of catalogDOMs) {
                        const carousel = catalogDOM.querySelector(".carousel");
                        reorganizeCarousel(carousel, numOnPage);
                    }
                }
            }, intervel);
        }
    });
}