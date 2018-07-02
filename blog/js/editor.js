/**
 * @version 0.10
 * @author Geng
 */

var getDate = function () {
    let date = new Date();
    return `${date.getFullYear()}-${twoDigits(date.getMonth())}-${twoDigits(date.getDate() + 1)} ${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}:${twoDigits(date.getSeconds())}`
}

var twoDigits = function (num) {
    return `${(num < 10 ? '0' : '') + num}`;
}

var parseHead = function (head) {
    return JSON.parse(`{"type": "head", "data": "${head}"}`);
}

var parseCode = function (code) {
    return JSON.parse(`{"type": "code", "data": "${code.replace(/\n/g, "\\n")}"}`);
}

var parseImage = function (url) {
    return JSON.parse(`{"type": "image", "data": "${url}"}`);
}

var parseList = function (list, isNumbered) {
    var listStr = "[";
    list.forEach(item => {
        listStr = listStr.concat(`"${item}",`);
    });
    if (listStr.slice(-1) === ",") {
        listStr = listStr.slice(0, -1);
    }
    listStr = listStr.concat("]");
    return JSON.parse(`{"type": "${isNumbered ? "number_list" : "bullet_list"}", "data": ${listStr}}`);
}

var parseQuote = function (text) {
    return JSON.parse(`{"type": "quote", "data": "${text.replace(/\n/g, "\\n")}"}`);
}

var parseLine = function () {
    return JSON.parse(`{"type": "line"}`);
}

var parsePlain = function (text) {
    return JSON.parse(`{"data": "${text.replace(/\n/g, "\\n")}"}`);
}

var parseText = function () {
    var text = $('#text-input').val()
        .replace(/\&/g, "&amp;")
        .replace(/\\/g, "&#92;")
        .replace(/\</g, "&lt;")
        .replace(/\>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/\'/g, "&apos;")
        .concat("\n\n");
    var paragraphs = [];

    var from = 0;
    var to = 0;
    while (from < text.length) {
        if (text.charAt(from) === '\n' || text.charAt(from) === ' ') {
            from++;
        } else if (text.slice(from, from + 4) === '----') {
            to = from + 4;
            while (text.charAt(to) === '-') {
                to ++;
            }
            paragraphs.push(parseLine());

            from  = to;
        } else if (text.slice(from, from + 4) === "### ") {
            from += 4; 
            to = text.indexOf('\n', from);
            if (to === -1) {
                to = text.length;
            }
            paragraphs.push(parseHead(text.slice(from, to).trim()));

            from = to + 1;
        } else if (text.slice(from, from + 4) === "```\n") {
            from += 4;
            to = text.indexOf("\n```\n", from);
            if (to === -1) {
                continue;
            }
            paragraphs.push(parseCode(text.slice(from, to)));

            from = to + 5;
        } else if (text.slice(from, from + 7) === "[[img]]") {
            from += 7;
            to = text.indexOf('\n', from);
            if (to === -1) {
                to = text.length;
            }
            paragraphs.push(parseImage(text.slice(from, to).trim()));

            from = to + 1;
        } else if (text.slice(from, from + 2) === "- ") {
            from += 2;
            to = from;
            var list = [];
            while (to < text.length) {
                to = text.indexOf('\n', to);
                if (to === -1) {
                    to = text.length;
                }
                list.push(text.slice(from, to).trim());
                from = to + 1;
                if (text.slice(from, from + 2) !== "- ") {
                    break;
                }
                from += 2;
                to = from;
            }
            paragraphs.push(parseList(list, false));
        } else if (text.slice(from, from + 2) === "# ") {
            from += 2;
            to = from;
            var list = [];
            while (to < text.length) {
                to = text.indexOf('\n', to);
                if (to === -1) {
                    to = text.length;
                }
                list.push(text.slice(from, to).trim());
                from = to + 1;
                if (text.slice(from, from + 2) !== "# ") {
                    break;
                }
                from += 2;
                to = from;
            }
            paragraphs.push(parseList(list, true));
        } else if (text.slice(from, from + 2) === "| ") {
            from += 2;
            to = from;
            var quote = "";
            while (to < text.length) {
                to = text.indexOf('\n', to);
                if (to === -1) {
                    to = text.length;
                }
                quote = quote.concat(text.slice(from, to).trim().concat('\n'));
                from = to + 1;
                if (text.slice(from, from + 2) !== "| ") {
                    break;
                }
                from += 2;
                to = from;
            }
            paragraphs.push(parseQuote(quote.trim()));
        } else {
            to = from;
            while (to < text.length) {
                to = text.indexOf('\n', to);
                if (to === -1) {
                    to = text.length;
                    break;
                }
                to++;
                if (text.charAt(to) === '\n') {
                    break;
                }
                var twoChar = text.slice(to, to + 2);
                if (twoChar === "- " || twoChar === "# " || twoChar === "| ") {
                    break;
                }
                var fourChar = text.slice(to, to + 4);
                if (fourChar === "### " || fourChar === "```\n" || fourChar === "----") {
                    break;
                }
                if (text.slice(to, to + 7) === "[[img]]") {
                    break;
                }
            }
            paragraphs.push(parsePlain(text.slice(from, to).trim()));

            from = to;
        }
    }

    return paragraphs;
}

var showOnModal = function (data) {
    $('#modalBody').text(data);
}

var showJson = function () {
    var json = JSON.parse(`{"title": "${$('#title-input').val()}", "date": "${getDate()}"}`);
    json.text = parseText();
    console.log(JSON.stringify(json));
    showOnModal(JSON.stringify(json, null, 2));
}

var main = function() {
    $('#toJson').click(showJson);
};

$(document).ready(main);