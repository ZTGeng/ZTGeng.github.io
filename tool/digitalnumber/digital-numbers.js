
(function() {
    var get_lines = function(num) {
        switch (num) {
            case 0:
                return [true, true, true, false, true, true, true];
            case 1:
                return [false, false, true, false, false, true, false];
            case 2:
                return [true, false, true, true, true, false, true];
            case 3:
                return [true, false, true, true, false, true, true];
            case 4:
                return [false, true, true, true, false, true, false];
            case 5:
                return [true, true, false, true, false, true, true];
            case 6:
                return [true, true, false, true, true, true, true];
            case 7:
                return [true, false, true, false, false, true, false];
            case 8:
                return [true, true, true, true, true, true, true];
            case 9:
                return [true, true, true, true, false, true, true];
            default:
                return [true, true, true, true, true, true, true];
        }
    }

    var digit_html = function(num = 0, height = 25, color = "orange") {
        var lines = get_lines(num % 10);
        var width = height * 0.55;
        var line_width = height * 0.44, line_height = height * 0.12;
        var padding = height / 20;
        padding = padding < 1 ? 1 : padding;
        var line_str = `<div style="position: absolute; width: ${line_width}px; height: ${line_height}px;">
            <div style="position: absolute; width: ${(line_width - line_height) * 0.94}px; height: 0; border-bottom: ${line_height / 2}px solid ${color}; border-left: ${line_height / 2}px solid transparent; border-right: ${line_height / 2}px solid transparent; top: 0; left: ${(line_width - line_height) * 0.03}px; box-sizing: content-box;"></div>
            <div style="position: absolute; width: ${(line_width - line_height) * 0.94}px; height: 0; border-top: ${line_height / 2}px solid ${color}; border-left: ${line_height / 2}px solid transparent; border-right: ${line_height / 2}px solid transparent; top: 50%; left: ${(line_width - line_height) * 0.03}px; box-sizing: content-box;"></div>
        </div>`;

        var container = $("<div></div>").css({"width": `${width}px`, "height": `${height}px`, "position": "relative", "display": "inline-block", "margin": `0 ${padding}px`});
        if (lines[0]) container.append($(line_str).css({"top": "0", "left": "50%", "transform": "translate(-50%, 0%)"}));
        if (lines[1]) container.append($(line_str).css({"top": `${line_height / 2}px`, "left": "0", "transform": "rotate(90deg) translate(0%, -100%)", "transform-origin": "top left"}));
        if (lines[2]) container.append($(line_str).css({"top": `${line_height / 2}px`, "left": "100%", "transform": "rotate(90deg) translate(0%, 0%)", "transform-origin": "top left"}));
        if (lines[3]) container.append($(line_str).css({"top": `${line_width}px`, "left": "50%", "transform": "translate(-50%, 0%)"}));
        if (lines[4]) container.append($(line_str).css({"top": `${line_width + line_height / 2}px`, "left": "0", "transform": "rotate(90deg) translate(0%, -100%)", "transform-origin": "top left"}));
        if (lines[5]) container.append($(line_str).css({"top": `${line_width + line_height / 2}px`, "left": "100%", "transform": "rotate(90deg) translate(0%, 0%)", "transform-origin": "top left"}));
        if (lines[6]) container.append($(line_str).css({"top": `${line_width * 2}px`, "left": "50%", "transform": "translate(-50%, 0%)"}));

        return container;
    }

    $(".digital-numbers-js").css({"display": "inline-block"});

    $(".digital-numbers-js").each(function(index) {
        let div = $(this);
        let updateHtml = function() {
            var text = div.text();
            var newHtml = "";
            for (let i = 0; i < text.length; i++) {
                var num = parseInt(text[i]);
                if (isNaN(num)) {
                    newHtml += text[i];
                } else {
                    newHtml += digit_html(num, div.data("height"), div.data("color"))[0].outerHTML;
                }
            }
            div.html(newHtml)
        }
        updateHtml();
        
        let flip_flag = false;
        let observer = new MutationObserver(function(mutationList, obs) {
            if (flip_flag) {
                flip_flag = false;
                return;
            }

            flip_flag = true;
            updateHtml();
        });
        observer.observe(this, {attributes: false, childList: true, subtree: false});
    });
})();
