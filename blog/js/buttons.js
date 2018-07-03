/**
 * @version 0.10
 * @author Geng
 */

var textInput;
var cachedText;

var onBtnBClick = function () {
    var text = textInput.val();
    var start = textInput[0].selectionStart;
    var end = textInput[0].selectionEnd;

    var selectText = start === end ? "bold text" : text.slice(start, end);
    cachedText = text;
    textInput.val(text.slice(0, start).concat(`**${selectText}**`).concat(text.slice(end, text.length)));
}

var onBtnIClick = function () {
    var text = textInput.val();
    var start = textInput[0].selectionStart;
    var end = textInput[0].selectionEnd;

    var selectText = start === end ? "italic text" : text.slice(start, end);
    cachedText = text;
    textInput.val(text.slice(0, start).concat(`//${selectText}//`).concat(text.slice(end, text.length)));
}

var onBtnHeadClick = function () {
    var text = textInput.val();
    var start = textInput[0].selectionStart;
    var end = textInput[0].selectionEnd;

    if ((start === 0 || text.charAt(start - 1) === '\n') && (end === text.length || text.charAt(end) === '\n')) {
        var selectText = start === end ? "Head text" : text.slice(start, end);
        if (selectText.indexOf('\n') === -1) {
            cachedText = text;
            textInput.val(text.slice(0, start).concat(`\n### ${selectText}\n`).concat(text.slice(end, text.length)));
        }
    }
}

var onBtnQuoteClick = function () {
    var text = textInput.val();
    var start = textInput[0].selectionStart;
    var end = textInput[0].selectionEnd;

    if ((start === 0 || text.charAt(start - 1) === '\n') && (end === text.length || text.charAt(end) === '\n')) {
        var selectText = start === end ? "Quote text" : text.slice(start, end).replace(/\n/g, "\n\| ");
        cachedText = text;
        textInput.val(text.slice(0, start).concat(`\n\| ${selectText}\n`).concat(text.slice(end, text.length)));
    }
}

var onBtnCodeClick = function () {
    var text = textInput.val();
    var start = textInput[0].selectionStart;
    var end = textInput[0].selectionEnd;

    if ((start === 0 || text.charAt(start - 1) === '\n') && (end === text.length || text.charAt(end) === '\n')) {
        // Block code
        var selectText = start === end ? "for (int i = 0; i < 100; i++) {\n    System.out.println(i);\n}" : text.slice(start, end);
        cachedText = text;
        textInput.val(text.slice(0, start).concat(`\n\`\`\`\n${selectText}\n\`\`\`\n`).concat(text.slice(end, text.length)));
    } else {
        // Inline code
        var selectText = start === end ? "inline code" : text.slice(start, end);
        if (selectText.indexOf('\n') === -1) {
            cachedText = text;
            textInput.val(text.slice(0, start).concat(`\`\`${selectText}\`\``).concat(text.slice(end, text.length)));
        }
    }
}

var onBtnImageClick = function () {
    var text = textInput.val();
    var start = textInput[0].selectionStart;
    var end = textInput[0].selectionEnd;

    if ((start === 0 || text.charAt(start - 1) === '\n') && (end === text.length || text.charAt(end) === '\n')) {
        var selectText = start === end ? "image_url" : text.slice(start, end);
        if (selectText.indexOf('\n') === -1) {
            cachedText = text;
            textInput.val(text.slice(0, start).concat(`IMG|${selectText}\n`).concat(text.slice(end, text.length)));
        }
    }
}

var onBtnLinkClick = function () {
    var text = textInput.val();
    var start = textInput[0].selectionStart;
    var end = textInput[0].selectionEnd;

    var selectText = start === end ? "link text" : text.slice(start, end);
    cachedText = text;
    textInput.val(text.slice(0, start).concat(`[[URL|${selectText}]]`).concat(text.slice(end, text.length)));
}

var onBtnHrClick = function () {
    var text = textInput.val();
    var start = textInput[0].selectionStart;
    var end = textInput[0].selectionEnd;

    if (start === end && (start === 0 || text.charAt(start - 1) === '\n') && (end === text.length || text.charAt(end) === '\n')) {
        cachedText = text;
        textInput.val(text.slice(0, start).concat(`\n---\n`).concat(text.slice(end, text.length)));
    }
}

var onBtnBListClick = function () {
    var text = textInput.val();
    var start = textInput[0].selectionStart;
    var end = textInput[0].selectionEnd;

    if ((start === 0 || text.charAt(start - 1) === '\n') && (end === text.length || text.charAt(end) === '\n')) {
        var selectText = start === end ? "List item" : text.slice(start, end).replace(/\n/g, "\n\- ");
        cachedText = text;
        textInput.val(text.slice(0, start).concat(`\n\- ${selectText}\n`).concat(text.slice(end, text.length)));
    }
}

var onBtnNListClick = function () {
    var text = textInput.val();
    var start = textInput[0].selectionStart;
    var end = textInput[0].selectionEnd;

    if ((start === 0 || text.charAt(start - 1) === '\n') && (end === text.length || text.charAt(end) === '\n')) {
        var selectText = start === end ? "List item" : text.slice(start, end).replace(/\n/g, "\n\# ");
        cachedText = text;
        textInput.val(text.slice(0, start).concat(`\n\# ${selectText}\n`).concat(text.slice(end, text.length)));
    }
}

var onBtnBackClick = function () {
    textInput.val(cachedText);
}

var main = function () {
    textInput = $('#textInput');

    $('#editBtnB').click(onBtnBClick);
    $('#editBtnI').click(onBtnIClick);
    $('#editBtnHead').click(onBtnHeadClick);
    $('#editBtnQuote').click(onBtnQuoteClick);
    $('#editBtnCode').click(onBtnCodeClick);
    $('#editBtnImage').click(onBtnImageClick);
    $('#editBtnLink').click(onBtnLinkClick);
    $('#editBtnHr').click(onBtnHrClick);
    $('#editBtnBList').click(onBtnBListClick);
    $('#editBtnNList').click(onBtnNListClick);
    $('#editBtnBack').click(onBtnBackClick);
};

$(document).ready(main);