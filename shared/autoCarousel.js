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
function createCarousel(items, id) {
    const carouselDiv = document.createElement("div");
    carouselDiv.className = "carousel carousel-dark slide mb-4";
    carouselDiv.id = id;

    const carouselInner = document.createElement("div");
    carouselInner.className = "carousel-inner";

    let numOnPage = getNumOnPage();
    let numPages = Math.ceil(items.length / numOnPage);
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

function reorganizeItems(carousels, numOnPage) {
    for (let carousel of carousels) {
        const carouselInner = carousel.getElementsByClassName("carousel-inner")[0];
        if (!carouselInner) {
            continue;
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

}

function listenToResize(carousels, intervel = 200) {
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
                    reorganizeItems(carousels, numOnPage);
                }
            }, intervel);
        }
    });
}