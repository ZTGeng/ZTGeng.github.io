/**
 * @version 0.20
 * @author Geng
 */

(function() {
    const TOTAL_WIDTH_DEFAULT = 15;
    const TOTAL_HEIGHT_DEFAULT = 27;
    const LINE_THICKNESS_DEFAULT = 3;
    const COLOR_LIT_DEFAULT = "#32CD32";
    const COLOR_UNLIT_DEFAULT = "#FFFFFF";
    const SHRINK_DEFAULT = 0.5;
    const SQRT1_2 = Math.sqrt(0.5);
    const PLACEHOLDER = "{{PLACEHOLDER}}";

    // [top, upper left, upper right, middle, lower left, lower right, bottom]
    const LIT_DIGITS = [
        [true, true, true, false, true, true, true], // 0
        [false, false, true, false, false, true, false], // 1
        [true, false, true, true, true, false, true], // 2
        [true, false, true, true, false, true, true], // 3
        [false, true, true, true, false, true, false], // 4
        [true, true, false, true, false, true, true], // 5
        [true, true, false, true, true, true, true], // 6
        [true, false, true, false, false, true, false], // 7
        [true, true, true, true, true, true, true], // 8
        [true, true, true, true, false, true, true] // 9
    ];

    function getLineSizes(totalWidth = TOTAL_WIDTH_DEFAULT, totalHeight = TOTAL_HEIGHT_DEFAULT, lineThickness = LINE_THICKNESS_DEFAULT, gap = -1) {
        let shrink = gap < 0 ? SHRINK_DEFAULT : gap * SQRT1_2;
        let horizontalContainerWidth = totalWidth - lineThickness;
        let horizontalLineWidth = horizontalContainerWidth - lineThickness - 2 * shrink;
        let horizontalLineHeight = lineThickness;
        let verticalContainerHeight = (totalHeight - lineThickness) / 2;
        let verticalLineWidth = lineThickness;
        let verticalLineHeight = verticalContainerHeight - lineThickness - 2 * shrink;
        return {
            horizontalContainerWidth,
            horizontalLineWidth,
            horizontalLineHeight,
            verticalContainerHeight,
            verticalLineWidth,
            verticalLineHeight
        }
    }

    function getHorizontalLineDOM(horizontalContainerWidth, horizontalLineWidth, horizontalLineHeight, color) {
        const horizontalLineHalfHeight = horizontalLineHeight / 2;
        const line = document.createElement("div");
        line.style.width = `${horizontalContainerWidth}px`;
        line.style.position = "absolute";
        line.style.display = "flex";
        line.style.flexDirection = "column";
        line.style.justifyContent = "center";
        line.style.alignItems = "center";

        const lineTop = document.createElement("div");
        lineTop.style.width = `${horizontalLineWidth}px`;
        lineTop.style.height = 0;
        lineTop.style.position = "relative";
        lineTop.style.borderBottom = `${horizontalLineHalfHeight}px solid ${color}`;
        lineTop.style.borderLeft = `${horizontalLineHalfHeight}px solid transparent`;
        lineTop.style.borderRight = `${horizontalLineHalfHeight}px solid transparent`;
        lineTop.style.boxSizing = "content-box";

        const lineBottom = document.createElement("div");
        lineBottom.style.width = `${horizontalLineWidth}px`;
        lineBottom.style.height = 0;
        lineBottom.style.position = "relative";
        lineBottom.style.borderTop = `${horizontalLineHalfHeight}px solid ${color}`;
        lineBottom.style.borderLeft = `${horizontalLineHalfHeight}px solid transparent`;
        lineBottom.style.borderRight = `${horizontalLineHalfHeight}px solid transparent`;
        lineBottom.style.boxSizing = "content-box";

        line.appendChild(lineTop);
        line.appendChild(lineBottom);
        return line;
    }

    function getVerticalLineDOM(verticalContainerHeight, verticalLineWidth, verticalLineHeight, color = COLOR_LIT_DEFAULT) {
        const verticalLineHalfWidth = verticalLineWidth / 2;
        const line = document.createElement("div");
        line.style.height = `${verticalContainerHeight}px`;
        line.style.position = "absolute";
        line.style.display = "flex";
        line.style.flexDirection = "row";
        line.style.justifyContent = "center";
        line.style.alignItems = "center";

        const lineLeft = document.createElement("div");
        lineLeft.style.width = 0;
        lineLeft.style.height = `${verticalLineHeight}px`;
        lineLeft.style.position = "relative";
        lineLeft.style.borderRight = `${verticalLineHalfWidth}px solid ${color}`;
        lineLeft.style.borderTop = `${verticalLineHalfWidth}px solid transparent`;
        lineLeft.style.borderBottom = `${verticalLineHalfWidth}px solid transparent`;
        lineLeft.style.boxSizing = "content-box";

        const lineRight = document.createElement("div");
        lineRight.style.width = 0;
        lineRight.style.height = `${verticalLineHeight}px`;
        lineRight.style.position = "relative";
        lineRight.style.borderLeft = `${verticalLineHalfWidth}px solid ${color}`;
        lineRight.style.borderTop = `${verticalLineHalfWidth}px solid transparent`;
        lineRight.style.borderBottom = `${verticalLineHalfWidth}px solid transparent`;
        lineRight.style.boxSizing = "content-box";

        line.appendChild(lineLeft);
        line.appendChild(lineRight);
        return line;
    }

    function getNumberDOM(number, totalWidth = TOTAL_WIDTH_DEFAULT, totalHeight = TOTAL_HEIGHT_DEFAULT, lineThickness = LINE_THICKNESS_DEFAULT, colorLit = COLOR_LIT_DEFAULT, colorUnlit = COLOR_UNLIT_DEFAULT, gap = -1) {
        if (number < 0 || number > 9) return null;
        const margin_x = Math.max(totalHeight / 20, 1);
        const litDigits = LIT_DIGITS[number];
        const size = getLineSizes(totalWidth, totalHeight, lineThickness, gap);
        const numberDOM = document.createElement("div");
        numberDOM.style.width = `${totalWidth}px`;
        numberDOM.style.height = `${totalHeight}px`;
        numberDOM.style.position = "relative";
        numberDOM.style.display = "inline-block";
        numberDOM.style.margin = `0 ${margin_x}px`;

        const lineDOMs = [];
        for (let i = 0; i < 7; i++) {
            const lineDOM = i % 3 === 0
                ? getHorizontalLineDOM(size.horizontalContainerWidth, size.horizontalLineWidth, size.horizontalLineHeight, litDigits[i] ? colorLit: colorUnlit)
                : getVerticalLineDOM(size.verticalContainerHeight, size.verticalLineWidth, size.verticalLineHeight, litDigits[i] ? colorLit: colorUnlit);
            lineDOMs.push(lineDOM);
        }

        // Top
        lineDOMs[0].style.top = 0;
        lineDOMs[0].style.left = `${lineThickness / 2}px`;
        numberDOM.appendChild(lineDOMs[0]);


        // Upper left
        lineDOMs[1].style.top = `${lineThickness / 2}px`;
        lineDOMs[1].style.left = 0;
        numberDOM.appendChild(lineDOMs[1]);

        // Uppder right
        lineDOMs[2].style.top = `${lineThickness / 2}px`;
        lineDOMs[2].style.right = 0;
        numberDOM.appendChild(lineDOMs[2]);

        // Middle
        lineDOMs[3].style.top = `${(totalHeight - lineThickness) / 2}px`;
        lineDOMs[3].style.left = `${lineThickness / 2}px`;
        numberDOM.appendChild(lineDOMs[3]);

        // Lower left
        lineDOMs[4].style.bottom = `${lineThickness / 2}px`;
        lineDOMs[4].style.left = 0;
        numberDOM.appendChild(lineDOMs[4]);

        // Lower right
        lineDOMs[5].style.bottom = `${lineThickness / 2}px`;
        lineDOMs[5].style.right = 0;
        numberDOM.appendChild(lineDOMs[5]);

        // Bottom
        lineDOMs[6].style.bottom = 0;
        lineDOMs[6].style.left = `${lineThickness / 2}px`;
        numberDOM.appendChild(lineDOMs[6]);

        return numberDOM;
    }

    function getHorizontalLineHTML(horizontalContainerWidth, horizontalLineWidth, horizontalLineHeight, color) {
        const horizontalLineHalfHeight = horizontalLineHeight / 2;
        return `<div style="width: ${horizontalContainerWidth}px; position: absolute; display: flex; flex-direction: column; justify-content: center; align-items: center; ${PLACEHOLDER}">
            <div style="width: ${horizontalLineWidth}px; height: 0; position: relative; border-bottom: ${horizontalLineHalfHeight}px solid ${color}; border-left: ${horizontalLineHalfHeight}px solid transparent; border-right: ${horizontalLineHalfHeight}px solid transparent; box-sizing: content-box;"></div>
            <div style="width: ${horizontalLineWidth}px; height: 0; position: relative; border-top: ${horizontalLineHalfHeight}px solid ${color}; border-left: ${horizontalLineHalfHeight}px solid transparent; border-right: ${horizontalLineHalfHeight}px solid transparent; box-sizing: content-box;"></div>
        </div>`;
    }

    function getVerticalLineHTML(verticalContainerHeight, verticalLineWidth, verticalLineHeight, color = COLOR_LIT_DEFAULT) {
        const verticalLineHalfWidth = verticalLineWidth / 2;
        return `<div style="height: ${verticalContainerHeight}px; position: absolute; display: flex; flex-direction: row; justify-content: center; align-items: center; ${PLACEHOLDER}">
            <div style="width: 0; height: ${verticalLineHeight}px; position: relative; border-right: ${verticalLineHalfWidth}px solid ${color}; border-top: ${verticalLineHalfWidth}px solid transparent; border-bottom: ${verticalLineHalfWidth}px solid transparent; box-sizing: content-box;"></div>
            <div style="width: 0; height: ${verticalLineHeight}px; position: relative; border-left: ${verticalLineHalfWidth}px solid ${color}; border-top: ${verticalLineHalfWidth}px solid transparent; border-bottom: ${verticalLineHalfWidth}px solid transparent; box-sizing: content-box;"></div>
        </div>`;
    }

    function getNumberHTML(number, totalWidth = TOTAL_WIDTH_DEFAULT, totalHeight = TOTAL_HEIGHT_DEFAULT, lineThickness = LINE_THICKNESS_DEFAULT, colorLit = COLOR_LIT_DEFAULT, colorUnlit = COLOR_UNLIT_DEFAULT, gap = -1) {
        if (number < 0 || number > 9) return null;
        const margin_x = Math.max(totalHeight / 20, 1);
        const litDigits = LIT_DIGITS[number];
        const size = getLineSizes(totalWidth, totalHeight, lineThickness, gap);

        let numberHTML = `<div style="width: ${totalWidth}px; height: ${totalHeight}px; position: relative; display: inline-block; margin: 0 ${margin_x}px;">`;

        const lineHTMLs = [];
        for (let i = 0; i < 7; i++) {
            const lineHTML = i % 3 === 0
                ? getHorizontalLineHTML(size.horizontalContainerWidth, size.horizontalLineWidth, size.horizontalLineHeight, litDigits[i] ? colorLit: colorUnlit)
                : getVerticalLineHTML(size.verticalContainerHeight, size.verticalLineWidth, size.verticalLineHeight, litDigits[i] ? colorLit: colorUnlit);
            lineHTMLs.push(lineHTML);
        }

        // Top
        numberHTML += lineHTMLs[0].replace(PLACEHOLDER, `top: 0; left: ${lineThickness / 2}px;`);

        // Upper left
        numberHTML += lineHTMLs[1].replace(PLACEHOLDER, `top: ${lineThickness / 2}px; left: 0;`);

        // Uppder right
        numberHTML += lineHTMLs[2].replace(PLACEHOLDER, `top: ${lineThickness / 2}px; right: 0;`);

        // Middle
        numberHTML += lineHTMLs[3].replace(PLACEHOLDER, `top: ${(totalHeight - lineThickness) / 2}px; left: ${lineThickness / 2}px;`);

        // Lower left
        numberHTML += lineHTMLs[4].replace(PLACEHOLDER, `bottom: ${lineThickness / 2}px; left: 0;`);

        // Lower right
        numberHTML += lineHTMLs[5].replace(PLACEHOLDER, `bottom: ${lineThickness / 2}px; right: 0;`);

        // Bottom
        numberHTML += lineHTMLs[6].replace(PLACEHOLDER, `bottom: 0; left: ${lineThickness / 2}px;`);

        return numberHTML + "</div>";
    }

    const markedDOMs = document.querySelectorAll(".digital-numbers-js");
    for (let i = 0; i < markedDOMs.length; i++) {
        const element = markedDOMs[i];
        
        const dynamic = element.getAttribute("data-dn-dynamic") || false;

        function processNode(parent, node) {
            if (node.nodeType === Node.TEXT_NODE) {
                if (node.nodeValue && node.nodeValue.match(/\d/)) {
                    const fragment = document.createDocumentFragment();
                    node.nodeValue.split(/(\d+)/).forEach((text, index) => {
                        if (index % 2 === 1) {
                            for (let digit of text) {
                                const number = parseInt(digit);
                                const totalWidth = element.getAttribute("data-dn-width") || TOTAL_WIDTH_DEFAULT;
                                const totalHeight = element.getAttribute("data-dn-height") || TOTAL_HEIGHT_DEFAULT;
                                const lineThickness = element.getAttribute("data-dn-thickness") || LINE_THICKNESS_DEFAULT;
                                const gap = element.getAttribute("data-dn-gap") || -1;
                                const colorLit = element.getAttribute("data-dn-color-lit") || COLOR_LIT_DEFAULT;
                                const colorUnlit = element.getAttribute("data-dn-color-unlit") || COLOR_UNLIT_DEFAULT;
                                fragment.appendChild(getNumberDOM(number, totalWidth, totalHeight, lineThickness, colorLit, colorUnlit, gap));
                            }
                        } else if (text) {
                            fragment.appendChild(document.createTextNode(text));
                        }
                    });
                    parent.replaceChild(fragment, node);
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                Array.from(node.childNodes).forEach((childNode) => { processNode(node, childNode); });
            }
        }

        Array.from(element.childNodes).forEach((childNode) => { processNode(element, childNode); });

        if (dynamic) {
            let observer = new MutationObserver((mutationList, obs) => {
                Array.from(element.childNodes).forEach((childNode) => { processNode(element, childNode); });
            });
            observer.observe(element, {attributes: false, childList: true, subtree: false});
        }
        
    }
})();
