/**
 * @version 0.20
 * @author Geng
 */

var getDate = function () {
    let date = new Date();
    return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())} ${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}:${twoDigits(date.getSeconds())}`
}

var twoDigits = function (num) {
    return `${(num < 10 ? '0' : '') + num}`;
}

var parseFilename = function (date) {
    return `a${date.substring(2, 4)}${date.substring(5, 7)}${date.substring(8, 10)}${date.substring(11, 13)}${date.substring(14, 16)}`;
}

var parseHead = function (head) {
    return JSON.parse(`{"type": "head", "data": "${head}"}`);
}

var parseCode = function (code) {
    var lines = code.split("\n");
    var trimHead = lines[0].length;
    lines.forEach(line => {
        if (line.trim().length != 0) {
            var spaceHead = line.search(/\S|$/);
            trimHead = Math.min(trimHead, spaceHead);
        }
    });
    var re = new RegExp("^\\s{" + trimHead + "}|\\s+$", "g");
    var codeTrimmed = lines.map(line => line.replace(re, "")).join("\\n");
    return JSON.parse(`{"type": "code", "data": "${codeTrimmed}"}`);
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
    var text = `\n${$('#textInput').val()}\n\n`
        .replace(/\&/g, "&amp;")
        .replace(/\\/g, "&#92;")
        .replace(/\</g, "&lt;")
        .replace(/\>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/\'/g, "&apos;")
        .replace(/\n\-\-\-\-*\s*\n/g, "\n---\n");
    var paragraphs = [];

    var from = 0;
    var to = 0;
    while (from < text.length) {
        if (text.charAt(from) === '\n' || text.charAt(from) === ' ') {
            from++;
        } else if (text.slice(from, from + 4) === '---\n') {
            paragraphs.push(parseLine());

            from  = from + 4;
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
        } else if (text.slice(from, from + 4) === "IMG|") {
            from += 4;
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
                if (fourChar === "### " || fourChar === "```\n" || fourChar === "---\n" || fourChar === "IMG|") {
                    break;
                }
            }
            paragraphs.push(parsePlain(text.slice(from, to).trim()));

            from = to;
        }
    }

    return paragraphs;
}

var inputToJson = function () {
    var date = getDate();
    var json = JSON.parse(`{"title": "${$('#titleInput').val()}","date":"${date}","filename":"${parseFilename(date)}"}`);
    json.text = parseText();
    return json;
}

var updateModal = function () {
    var json = inputToJson();
    $('#modalBody').html(jsonToHtml(json, false));
    $('#modalCopy').off().click(function () {
        var temp = $('<textarea>');
        temp.appendTo($('#previewModal'));
        temp.val(JSON.stringify(json, null, 2));
        temp.select();
        document.execCommand("copy");
        temp.remove();
    });
    $('#modalSave').off().click(function () {
        saveToFile(json);
    });
}

var saveToFile = function (json) {
    var temp = $('<a></a>');
    temp.attr({
        download: json.filename.concat(ARTICLE_EXT),
        href: "data:text/plain," + JSON.stringify(json, null, 2)
    });
    temp.appendTo($('body'));
    temp[0].click();
    temp.remove();
}

var main = function() {
    $('#preview').click(updateModal);
    $('#save').click(function () {
        saveToFile(inputToJson());
    });
};

$(document).ready(main);