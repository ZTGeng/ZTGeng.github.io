/**
 * @version 0.10
 * @author Geng
 */

(function() {
    let toSpans = function(div) {
        let newHtml = "";
        let _element = document.createElement("div");
        div.innerHTML.split(/<br\s*\/?>/).forEach(html => {
            _element.innerHTML = html;
            let text = _element.innerText;
            newHtml += ("<span>" + text.split("").join("</span><span>") + "</span><br>");
        });
        _element.remove();
        div.innerHTML = newHtml.slice(0, -4);
    }

    let setColor = function(element, color) {
        element.style.color = "rgb(" + color[0] + ", " + color[1] + ", " + color[2] + ")";
    }

    let setGradientColors = function(div, colorLeft, colorRight) {
        let divLeft = div.offsetLeft;
        let divWidth = div.scrollWidth;
        if (divWidth === 0) return;
        div.querySelectorAll("span").forEach(function(span) {
            let ratio = (span.offsetLeft - divLeft) / divWidth;
            if (ratio < 0) ratio = 0;
            if (ratio > 1) ratio = 1;
            let color = [
                colorLeft[0] * (1 - ratio) + colorRight[0] * ratio,
                colorLeft[1] * (1 - ratio) + colorRight[1] * ratio,
                colorLeft[2] * (1 - ratio) + colorRight[2] * ratio,
            ];
            setColor(span, color);
        });
    }

    let getRgbFromData = function(div, dataName) {
        let _element = document.createElement("div");
        _element.style.color = div.getAttribute(dataName);
        div.append(_element);
        let match = getComputedStyle(_element).color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
        _element.remove();
        if (match && match.length === 4) return [match[1], match[2], match[3]];
        return null;
    }

    let divs = document.querySelectorAll(".colorful-text-js");
    for(let i = 0; i < divs.length; i++) {
        let div = divs[i];

        let colorLeft = getRgbFromData(div, "data-color-left");
        let colorRight = getRgbFromData(div, "data-color-right");

        let onTextChange = function() {
            toSpans(div);
            setGradientColors(div, colorLeft, colorRight);
        }

        let onWidthChange = function() {
            setGradientColors(div, colorLeft, colorRight);
        }

        if (colorLeft) {
            if (colorRight) {
                if (colorLeft[0] === colorRight[0] && colorLeft[1] === colorRight[1] && colorLeft[2] === colorRight[2]) {
                    setColor(div, colorLeft);
                    continue;
                }

                // Set gradient colors
                onTextChange();
        
                let flip_flag = false;
                new MutationObserver((mutations, obs) => {
                    if (flip_flag) {
                        flip_flag = false;
                        return;
                    }
                    
                    flip_flag = true;
                    onTextChange();
                }).observe(div, {attributes: false, childList: true, subtree: false});
                
                let divWidth = div.scrollWidth;
                new ResizeObserver(entries => {
                    if (divWidth !== div.scrollWidth) {
                        onWidthChange();
                        divWidth = div.scrollWidth;
                    }
                }).observe(div);
            } else {
                setColor(div, colorLeft);
            }
        } else {
            if (colorRight) {
                setColor(div, colorRight);
            }
        }
    };
})()