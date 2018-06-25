/**
 * @version 0.10
 * @author Geng
 */

var getDate = function () {
    let date = new Date();
    return `${date.getFullYear()}-${twoDigits(date.getMonth())}-${twoDigits(date.getDate())} ${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}:${twoDigits(date.getSeconds())}`
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

var parseBulletList = function (list) {

}

var parseNumberList = function (list) {

}

var parseQuote = function (text) {

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
        .concat('\n');
    var paragraphs = [];

    var from = 0;
    var to = 0;
    while (from < text.length) {
        if (text.charAt(from) === '\n' || text.charAt(from) === ' ') {
            from++;
        } else if (text.slice(from, from + 4) === "### ") {
            from += 4;
            to = from;
            while (to < text.length && text.charAt(to) !== '\n') {
                to++;
            }
            paragraphs.push(parseHead(text.slice(from, to).trim()));

            from = to;
        } else if (text.slice(from, from + 4) === "```\n") {
            from += 4;
            to = text.indexOf("\n```\n", from);
            if (to === -1) {
                continue;
            }
            paragraphs.push(parseCode(text.slice(from, to)));

            from = to + 4;
        } else if (text.slice(from, from + 7) === "[[img]]") {
            from += 7;
            to = from;
            while (to < text.length && text.charAt(to) !== '\n') {
                to++;
            }
            paragraphs.push(parseImage(text.slice(from, to).trim()));

            from = to;
        } else if (text.slice(from, from + 2) === "- ") {
            from += 2;
            to = from;

        } else if (text.slice(from, from + 2) === "# ") {
            from += 2;
            to = from;

        } else if (text.slice(from, from + 2) === "| ") {
            from += 2;
            to = from;

        } else {
            to = from;
            while (to + 1 < text.length && (text.charAt(to) !== '\n' || text.charAt(to + 1) !== '\n')) {
                to++;
            }
            paragraphs.push(parsePlain(text.slice(from, to + 1).trim()));

            from = to + 1;
        }
    }

    return paragraphs;
}

var showModal = function (data) {

}

var showJson = function () {
    var json = JSON.parse(`{"title": "${$('#title-input').val()}", "date": "${getDate()}"}`);
    json.text = parseText();
    console.log(JSON.stringify(json));
    showModal(json);
}

var main = function() {
    $('#to-json').click(showJson);
};

$(document).ready(main);