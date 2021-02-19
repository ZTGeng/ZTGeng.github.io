/**
 * @version 0.10
 * @author Geng
 */

(function() {
    const HEIGHT_DEFAULT = 25;
    const COLOR_DEFAULT = "orange";
    const LINES = [
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

    var digit_html = function(num = 0, height = HEIGHT_DEFAULT, color = COLOR_DEFAULT) {
        if (num < 0) return "" + num;
        if (num > 9) return digit_html(Math.floor(num / 10)) + digit_html(num % 10);

        var lines = LINES[num];
        var width = height * 0.55;
        var line_width = height * 0.44, line_height = height * 0.12;
        var margin_x = Math.max(height / 20, 1);
        var line_str1 = `<div style="position: absolute; width: ${line_width}px; height: ${line_height}px;`;
        var line_str2 = `">
            <div style="position: absolute; width: ${(line_width - line_height) * 0.94}px; height: 0; border-bottom: ${line_height / 2}px solid ${color}; border-left: ${line_height / 2}px solid transparent; border-right: ${line_height / 2}px solid transparent; top: 0; left: ${(line_width - line_height) * 0.03}px; box-sizing: content-box;"></div>
            <div style="position: absolute; width: ${(line_width - line_height) * 0.94}px; height: 0; border-top: ${line_height / 2}px solid ${color}; border-left: ${line_height / 2}px solid transparent; border-right: ${line_height / 2}px solid transparent; top: 50%; left: ${(line_width - line_height) * 0.03}px; box-sizing: content-box;"></div>
        </div>`;

        var number_str = `<div style="width: ${width}px; height: ${height}px; position: relative; display: inline-block; margin: 0 ${margin_x}px;">`;
        if (lines[0]) number_str += (line_str1 + `top: 0; left: 50%; transform: translate(-50%, 0%);` + line_str2);
        if (lines[1]) number_str += (line_str1 + `top: ${line_height / 2}px; left: 0; transform: rotate(90deg) translate(0%, -100%); transform-origin: top left;` + line_str2);
        if (lines[2]) number_str += (line_str1 + `top: ${line_height / 2}px; left: 100%; transform: rotate(90deg) translate(0%, 0%); transform-origin: top left;` + line_str2);
        if (lines[3]) number_str += (line_str1 + `top: ${line_width}px; left: 50%; transform: translate(-50%, 0%);` + line_str2);
        if (lines[4]) number_str += (line_str1 + `top: ${line_width + line_height / 2}px; left: 0; transform: rotate(90deg) translate(0%, -100%); transform-origin: top left;` + line_str2);
        if (lines[5]) number_str += (line_str1 + `top: ${line_width + line_height / 2}px; left: 100%; transform: rotate(90deg) translate(0%, 0%); transform-origin: top left;` + line_str2);
        if (lines[6]) number_str += (line_str1 + `top: ${line_width * 2}px; left: 50%; transform: translate(-50%, 0%);` + line_str2);
        number_str += `</div>`;

        return number_str;
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
                    newHtml += digit_html(num, div.data("height"), div.data("color"));
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
