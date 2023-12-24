/**
 * @version 0.30
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
    const CLASSNAME = "digital-numbers-dom";

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

    function adjustHorizontalLineDOMStyle(line, horizontalContainerWidth, horizontalLineWidth, horizontalLineHeight, color) {
        const lineTop = line.childNodes[0];
        const lineBottom = line.childNodes[1];
        const horizontalLineHalfHeight = horizontalLineHeight / 2;
        line.style.width = `${horizontalContainerWidth}px`;

        lineTop.style.width = `${horizontalLineWidth}px`;
        lineTop.style.borderBottom = `${horizontalLineHalfHeight}px solid ${color}`;
        lineTop.style.borderLeft = `${horizontalLineHalfHeight}px solid transparent`;
        lineTop.style.borderRight = `${horizontalLineHalfHeight}px solid transparent`;

        lineBottom.style.width = `${horizontalLineWidth}px`;
        lineBottom.style.borderTop = `${horizontalLineHalfHeight}px solid ${color}`;
        lineBottom.style.borderLeft = `${horizontalLineHalfHeight}px solid transparent`;
        lineBottom.style.borderRight = `${horizontalLineHalfHeight}px solid transparent`;
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

    function adjustVerticalLineDOMStyle(line, verticalContainerHeight, verticalLineWidth, verticalLineHeight, color = COLOR_LIT_DEFAULT) {
        const lineLeft = line.childNodes[0];
        const lineRight = line.childNodes[1];
        const verticalLineHalfWidth = verticalLineWidth / 2;
        line.style.height = `${verticalContainerHeight}px`;

        lineLeft.style.height = `${verticalLineHeight}px`;
        lineLeft.style.borderRight = `${verticalLineHalfWidth}px solid ${color}`;
        lineLeft.style.borderTop = `${verticalLineHalfWidth}px solid transparent`;
        lineLeft.style.borderBottom = `${verticalLineHalfWidth}px solid transparent`;

        lineRight.style.height = `${verticalLineHeight}px`;
        lineRight.style.borderLeft = `${verticalLineHalfWidth}px solid ${color}`;
        lineRight.style.borderTop = `${verticalLineHalfWidth}px solid transparent`;
        lineRight.style.borderBottom = `${verticalLineHalfWidth}px solid transparent`;
    }

    function getNumberDOM(number, totalWidth = TOTAL_WIDTH_DEFAULT, totalHeight = TOTAL_HEIGHT_DEFAULT, lineThickness = LINE_THICKNESS_DEFAULT, colorLit = COLOR_LIT_DEFAULT, colorUnlit = COLOR_UNLIT_DEFAULT, gap = -1) {
        if (number < 0 || number > 9) return null;
        const margin_x = Math.max(totalHeight / 20, 1);
        const litDigits = LIT_DIGITS[number];
        const size = getLineSizes(totalWidth, totalHeight, lineThickness, gap);
        const numberDOM = document.createElement("div");
        numberDOM.classList.add(CLASSNAME);
        numberDOM.style.width = `${totalWidth}px`;
        numberDOM.style.height = `${totalHeight}px`;
        numberDOM.style.position = "relative";
        numberDOM.style.display = "inline-block";
        numberDOM.style.margin = `0 ${margin_x}px`;
        numberDOM.setAttribute("data-dn-number", number);

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

    function adjustNumerDOMStyle(element, totalWidth = TOTAL_WIDTH_DEFAULT, totalHeight = TOTAL_HEIGHT_DEFAULT, lineThickness = LINE_THICKNESS_DEFAULT, colorLit = COLOR_LIT_DEFAULT, colorUnlit = COLOR_UNLIT_DEFAULT, gap = -1) {
        if (!element.classList.contains(CLASSNAME)) return;
        const number = parseInt(element.getAttribute("data-dn-number"));
        const lineDOMs = element.childNodes;
        const margin_x = Math.max(totalHeight / 20, 1);
        const litDigits = LIT_DIGITS[number];
        const size = getLineSizes(totalWidth, totalHeight, lineThickness, gap);
        
        element.style.width = `${totalWidth}px`;
        element.style.height = `${totalHeight}px`;
        element.style.margin = `0 ${margin_x}px`;

        for (let i = 0; i < 7; i++) {
            if (i % 3 === 0) {
                adjustHorizontalLineDOMStyle(lineDOMs[i], size.horizontalContainerWidth, size.horizontalLineWidth, size.horizontalLineHeight, litDigits[i] ? colorLit: colorUnlit);
            } else {
                adjustVerticalLineDOMStyle(lineDOMs[i], size.verticalContainerHeight, size.verticalLineWidth, size.verticalLineHeight, litDigits[i] ? colorLit: colorUnlit);
            }
        }

        lineDOMs[0].style.left = `${lineThickness / 2}px`;
        lineDOMs[1].style.top = `${lineThickness / 2}px`;
        lineDOMs[2].style.top = `${lineThickness / 2}px`;
        lineDOMs[3].style.top = `${(totalHeight - lineThickness) / 2}px`;
        lineDOMs[3].style.left = `${lineThickness / 2}px`;
        lineDOMs[4].style.bottom = `${lineThickness / 2}px`;
        lineDOMs[5].style.bottom = `${lineThickness / 2}px`;
        lineDOMs[6].style.left = `${lineThickness / 2}px`;
    }

    function getNumberHTML(number, totalWidth = TOTAL_WIDTH_DEFAULT, totalHeight = TOTAL_HEIGHT_DEFAULT, lineThickness = LINE_THICKNESS_DEFAULT, colorLit = COLOR_LIT_DEFAULT, colorUnlit = COLOR_UNLIT_DEFAULT, gap = -1) {
        if (number < 0 || number > 9) return null;
        const margin_x = Math.max(totalHeight / 20, 1);
        const colors = LIT_DIGITS[number].map((lit) => lit ? colorLit : colorUnlit);
        const size = getLineSizes(totalWidth, totalHeight, lineThickness, gap);
        const horizontalContainerWidth = size.horizontalContainerWidth;
        const horizontalLineWidth = size.horizontalLineWidth;
        const horizontalLineHeight = size.horizontalLineHeight;
        const horizontalLineHalfHeight = horizontalLineHeight / 2;
        const verticalContainerHeight = size.verticalContainerHeight;
        const verticalLineWidth = size.verticalLineWidth;
        const verticalLineHeight = size.verticalLineHeight;
        const verticalLineHalfWidth = verticalLineWidth / 2;

        let numberHTML = `<div style="width: ${totalWidth}px; height: ${totalHeight}px; position: relative; display: inline-block; margin: 0 ${margin_x}px;">
        <div style="width: ${horizontalContainerWidth}px; position: absolute; display: flex; flex-direction: column; justify-content: center; align-items: center; top: 0; left: ${lineThickness / 2}px;">
            <div style="width: ${horizontalLineWidth}px; height: 0; position: relative; border-bottom: ${horizontalLineHalfHeight}px solid ${colors[0]}; border-left: ${horizontalLineHalfHeight}px solid transparent; border-right: ${horizontalLineHalfHeight}px solid transparent; box-sizing: content-box;"></div>
            <div style="width: ${horizontalLineWidth}px; height: 0; position: relative; border-top: ${horizontalLineHalfHeight}px solid ${colors[0]}; border-left: ${horizontalLineHalfHeight}px solid transparent; border-right: ${horizontalLineHalfHeight}px solid transparent; box-sizing: content-box;"></div>
        </div>
        <div style="height: ${verticalContainerHeight}px; position: absolute; display: flex; flex-direction: row; justify-content: center; align-items: center; top: ${lineThickness / 2}px; left: 0;">
            <div style="width: 0; height: ${verticalLineHeight}px; position: relative; border-right: ${verticalLineHalfWidth}px solid ${colors[1]}; border-top: ${verticalLineHalfWidth}px solid transparent; border-bottom: ${verticalLineHalfWidth}px solid transparent; box-sizing: content-box;"></div>
            <div style="width: 0; height: ${verticalLineHeight}px; position: relative; border-left: ${verticalLineHalfWidth}px solid ${colors[1]}; border-top: ${verticalLineHalfWidth}px solid transparent; border-bottom: ${verticalLineHalfWidth}px solid transparent; box-sizing: content-box;"></div>
        </div>
        <div style="height: ${verticalContainerHeight}px; position: absolute; display: flex; flex-direction: row; justify-content: center; align-items: center; top: ${lineThickness / 2}px; right: 0;">
            <div style="width: 0; height: ${verticalLineHeight}px; position: relative; border-right: ${verticalLineHalfWidth}px solid ${colors[2]}; border-top: ${verticalLineHalfWidth}px solid transparent; border-bottom: ${verticalLineHalfWidth}px solid transparent; box-sizing: content-box;"></div>
            <div style="width: 0; height: ${verticalLineHeight}px; position: relative; border-left: ${verticalLineHalfWidth}px solid ${colors[2]}; border-top: ${verticalLineHalfWidth}px solid transparent; border-bottom: ${verticalLineHalfWidth}px solid transparent; box-sizing: content-box;"></div>
        </div>
        <div style="width: ${horizontalContainerWidth}px; position: absolute; display: flex; flex-direction: column; justify-content: center; align-items: center; top: ${(totalHeight - lineThickness) / 2}px; left: ${lineThickness / 2}px;">
            <div style="width: ${horizontalLineWidth}px; height: 0; position: relative; border-bottom: ${horizontalLineHalfHeight}px solid ${colors[3]}; border-left: ${horizontalLineHalfHeight}px solid transparent; border-right: ${horizontalLineHalfHeight}px solid transparent; box-sizing: content-box;"></div>
            <div style="width: ${horizontalLineWidth}px; height: 0; position: relative; border-top: ${horizontalLineHalfHeight}px solid ${colors[3]}; border-left: ${horizontalLineHalfHeight}px solid transparent; border-right: ${horizontalLineHalfHeight}px solid transparent; box-sizing: content-box;"></div>
        </div>
        <div style="height: ${verticalContainerHeight}px; position: absolute; display: flex; flex-direction: row; justify-content: center; align-items: center; bottom: ${lineThickness / 2}px; left: 0;">
            <div style="width: 0; height: ${verticalLineHeight}px; position: relative; border-right: ${verticalLineHalfWidth}px solid ${colors[4]}; border-top: ${verticalLineHalfWidth}px solid transparent; border-bottom: ${verticalLineHalfWidth}px solid transparent; box-sizing: content-box;"></div>
            <div style="width: 0; height: ${verticalLineHeight}px; position: relative; border-left: ${verticalLineHalfWidth}px solid ${colors[4]}; border-top: ${verticalLineHalfWidth}px solid transparent; border-bottom: ${verticalLineHalfWidth}px solid transparent; box-sizing: content-box;"></div>
        </div>
        <div style="height: ${verticalContainerHeight}px; position: absolute; display: flex; flex-direction: row; justify-content: center; align-items: center; bottom: ${lineThickness / 2}px; right: 0;">
            <div style="width: 0; height: ${verticalLineHeight}px; position: relative; border-right: ${verticalLineHalfWidth}px solid ${colors[5]}; border-top: ${verticalLineHalfWidth}px solid transparent; border-bottom: ${verticalLineHalfWidth}px solid transparent; box-sizing: content-box;"></div>
            <div style="width: 0; height: ${verticalLineHeight}px; position: relative; border-left: ${verticalLineHalfWidth}px solid ${colors[5]}; border-top: ${verticalLineHalfWidth}px solid transparent; border-bottom: ${verticalLineHalfWidth}px solid transparent; box-sizing: content-box;"></div>
        </div>
        <div style="width: ${horizontalContainerWidth}px; position: absolute; display: flex; flex-direction: column; justify-content: center; align-items: center; bottom: 0; left: ${lineThickness / 2}px;">
            <div style="width: ${horizontalLineWidth}px; height: 0; position: relative; border-bottom: ${horizontalLineHalfHeight}px solid ${colors[6]}; border-left: ${horizontalLineHalfHeight}px solid transparent; border-right: ${horizontalLineHalfHeight}px solid transparent; box-sizing: content-box;"></div>
            <div style="width: ${horizontalLineWidth}px; height: 0; position: relative; border-top: ${horizontalLineHalfHeight}px solid ${colors[6]}; border-left: ${horizontalLineHalfHeight}px solid transparent; border-right: ${horizontalLineHalfHeight}px solid transparent; box-sizing: content-box;"></div>
        </div></div>`;

        return numberHTML;
    }

    function processNode(parent, node, style) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.nodeValue && node.nodeValue.match(/\d/)) {
                const fragment = document.createDocumentFragment();
                node.nodeValue.split(/(\d+)/).forEach((text, index) => {
                    if (index % 2 === 1) {
                        for (let digit of text) {
                            const number = parseInt(digit);
                            fragment.appendChild(getNumberDOM(number, style.totalWidth, style.totalHeight, style.lineThickness, style.colorLit, style.colorUnlit, style.gap));
                        }
                    } else if (text) {
                        fragment.appendChild(document.createTextNode(text));
                    }
                });
                parent.replaceChild(fragment, node);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            Array.from(node.childNodes).forEach((childNode) => { processNode(node, childNode, style); });
        }
    }

    function adjustDOMStyle(element, style) {
        for (let childNode of element.childNodes) {
            if (childNode.nodeType === Node.ELEMENT_NODE) {
                if (childNode.classList.contains(CLASSNAME)) {
                    adjustNumerDOMStyle(childNode, style.totalWidth, style.totalHeight, style.lineThickness, style.colorLit, style.colorUnlit, style.gap);
                } else {
                    adjustDOMStyle(childNode, style);
                }
            }
        }
    }

    const markedDOMs = document.querySelectorAll(".digital-numbers-js");
    for (let i = 0; i < markedDOMs.length; i++) {
        const element = markedDOMs[i];
        const dynamic = element.getAttribute("data-dn-dynamic");

        function getStyleAttributes() {
            const totalWidth = element.getAttribute("data-dn-width") || TOTAL_WIDTH_DEFAULT;
            const totalHeight = element.getAttribute("data-dn-height") || TOTAL_HEIGHT_DEFAULT;
            const lineThickness = element.getAttribute("data-dn-thickness") || LINE_THICKNESS_DEFAULT;
            const gap = element.getAttribute("data-dn-gap") || -1;
            const colorLit = element.getAttribute("data-dn-color-lit") || COLOR_LIT_DEFAULT;
            const colorUnlit = element.getAttribute("data-dn-color-unlit") || COLOR_UNLIT_DEFAULT;
            return {totalWidth, totalHeight, lineThickness, gap, colorLit, colorUnlit};
        }

        const style = getStyleAttributes();
        Array.from(element.childNodes).forEach((childNode) => { processNode(element, childNode, style); });

        if (dynamic === "true") {
            let observer = new MutationObserver((mutationList, obs) => {
                const newStyle = getStyleAttributes();
                Array.from(mutationList).forEach((mutation) => {
                    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
                        Array.from(mutation.addedNodes).forEach((addedNode) => {
                            if (addedNode.classList && addedNode.classList.contains(CLASSNAME)) return;
                            processNode(mutation.target, addedNode, newStyle);
                        });
                    } else if (mutation.type === "attributes") {
                        adjustDOMStyle(mutation.target, newStyle);
                    }
                });
            });
            observer.observe(element, {attributes: true, childList: true, subtree: true, attributeFilter: ["data-dn-width", "data-dn-height", "data-dn-thickness", "data-dn-gap", "data-dn-color-lit", "data-dn-color-unlit"]});
        }
    }
})();
