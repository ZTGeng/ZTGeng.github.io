/**
 * @version 0.2
 * @author Geng
 */

// var coinNum; // 1 - 12
// var isHeavier;
var round = 0;
var lean = 0;
var possibleResults = [];
var results = [
    [1, true], [1, false], [2, true], [2, false], [3, true], [3, false], [4, true], [4, false],
    [5, true], [5, false], [6, true], [6, false], [7, true], [7, false], [8, true], [8, false],
    [9, true], [9, false], [10, true], [10, false], [11, true], [11, false], [12, true], [12, false]
];

var initDoms = function () {
    $('#left-pan').data("num", 0);
    $('#right-pan').data("num", 0);
    $('#left-pan').data("me", "left");
    $('#right-pan').data("me", "right");
    $('#left-pan').data("other", "#right-pan");
    $('#right-pan').data("other", "#left-pan");
    $('#left-pan, #right-pan').droppable({
        drop: function(event, ui) {
            if (ui.draggable.data("from") !== $(this).data("me")) {
                var num = $(this).data("num");
                $(this).data("num", num + 1);
                if (ui.draggable.data("from") !== "base") {
                    num = $($(this).data("other")).data("num");
                    $($(this).data("other")).data("num", num - 1);
                }
                ui.draggable.data("from", $(this).data("me"));
            }
            // console.log($('#left-pan').data("num") + " " + $('#right-pan').data("num"));
        }
    });
    for (var i = 1; i <= 12; i++) {
        $('<div class="coin-place"><div class="coin" id="coin' + i + '"><span>' + i + '</span></div></div>').appendTo($('#twelve-coins'));
    }
    $('.coin').data("from", "base");
    $('#twelve-coins').droppable({
        drop: function(event, ui) {
            if (ui.draggable.data("from") !== "base") {
                var pan = $('#' + ui.draggable.data("from") + '-pan');
                pan.data("num", pan.data("num") - 1);
                ui.draggable.data("from", "base");
            }
            ui.draggable.css({ left: 0, top: 0 });
        }
    });
    $('.coin').draggable({
        containment: "#field",
        revert: "invalid",
        opacity: 0.85,
    });
    for (var i = 1; i < 13; i++) {
        $('#coin-num').append($('<option>' + i + '</option>'));
    }
    possibleResults = [];
    for (var i = 0; i < 12; i++) {
        possibleResults.push(results[i]);
    }
};

var weight = function() {
    var leftNum = $('#left-pan').data("num");
    var rightNum = $('#right-pan').data("num");
    if (leftNum > rightNum) return -1;
    if (leftNum < rightNum) return 1;

    var possibleResultsForLeftLean = [];
    var possibleResultsForRightLean = [];
    var possibleResultsForNoLean = [];

    for (var i = 0; i < possibleResults.length; i++) {
        var result = possibleResults[i];

        switch ($('#coin' + result[0]).data("from")) {
            case "base":
                possibleResultsForNoLean.push(result);
                break;
            case "left":
                if (result[1]) {
                    possibleResultsForLeftLean.push(result);
                } else {
                    possibleResultsForRightLean.push(result);
                }
                break;
            case "right":
                if (result[1]) {
                    possibleResultsForRightLean.push(result);
                } else {
                    possibleResultsForLeftLean.push(result);
                }
        }
    }

    var maxSelect = 0;
    var maxLength = possibleResultsForNoLean.length;
    possibleResults = possibleResultsForNoLean;

    if (possibleResultsForLeftLean.length > maxLength) {
        maxLength = possibleResultsForLeftLean.length;
        maxSelect = -1;
        possibleResults = possibleResultsForLeftLean;
    }
    if (possibleResultsForRightLean.length > maxLength) {
        maxLength = possibleResultsForRightLean.length;
        maxSelect = 1;
        possibleResults = possibleResultsForRightLean;
    }

    return maxSelect;
};

var leftLean = function() {
    $('#balance').css({ "background-image": 'url("images/balance-left.jpg")' });
    var cOffset = (lean + 1) * 10; // 0: 10; -1: 0; 1: 20
    $('.coin').filter(function() {
        return $(this).data("from") === "left";
    }).each(function() {
        var ctop = $(this).offset().top;
        $(this).offset({ top: ctop + cOffset });
    });
    $('.coin').filter(function() {
        return $(this).data("from") === "right";
    }).each(function() {
        var ctop = $(this).offset().top;
        $(this).offset({ top: ctop - cOffset });
    });
    lean = -1;
};

var rightLean = function() {
    $('#balance').css({ "background-image": 'url("images/balance-right.jpg")' });
    var cOffset = (1 - lean) * 10; // 0: 10; -1: 20; 1: 0
    $('.coin').filter(function() {
        return $(this).data("from") === "left";
    }).each(function() {
        var ctop = $(this).offset().top;
        $(this).offset({ top: ctop - cOffset });
    });
    $('.coin').filter(function() {
        return $(this).data("from") === "right";
    }).each(function() {
        var ctop = $(this).offset().top;
        $(this).offset({ top: ctop + cOffset });
    });
    lean = 1;
};

var noLean = function() {
    $('#balance').css({ "background-image": 'url("images/balance-middle.jpg")' });
    var cOffset = lean * 10; // 0: 0; -1: -10; 1: 10
    $('.coin').filter(function() {
        return $(this).data("from") === "left";
    }).each(function() {
        var ctop = $(this).offset().top;
        $(this).offset({ top: ctop + cOffset });
    });
    $('.coin').filter(function() {
        return $(this).data("from") === "right";
    }).each(function() {
        var ctop = $(this).offset().top;
        $(this).offset({ top: ctop - cOffset });
    });
    lean = 0;
};

var outputWeight = function() {
    var str_en = "Round " + round +" - Coins on Left:<strong>";
    var str_zh = "第 " + round +" 次 - 左盘硬币：<strong>";
    var leftCoins = $('.coin').filter(function() {
        return $(this).data("from") === "left";
    });
    if (leftCoins.length === 0) {
        str_en += " None"
        str_zh += "无"
    } else {
        leftCoins.each(function() {
            str_en += " ";
            str_en += $(this).children('span').text();
            str_zh += " ";
            str_zh += $(this).children('span').text();
        });
    }
    str_en += "</strong>; Coins on Right:<strong>";
    str_zh += "</strong>；右盘硬币：<strong>";
    var rightCoins = $('.coin').filter(function() {
        return $(this).data("from") === "right";
    });
    if (rightCoins.length === 0) {
        str_en += " None"
        str_zh += "无"
    } else {
        rightCoins.each(function() {
            str_en += " ";
            str_en += $(this).children('span').text();
            str_zh += " ";
            str_zh += $(this).children('span').text();
        });
    }
    str_en += "</strong>. The ";
    str_zh += "</strong>。";
    switch (lean) {
        case 0:
            str_en += "Two Pans Weigh the <strong>Same</strong>."
            str_zh += "两边<strong>一样重</strong>。"
            break;
        case -1:
            str_en += "<strong>Left</strong> Pan is Heavier."
            str_zh += "<strong>左盘</strong>更重。"
            break;
        case 1:
            str_en += "<strong>Right</strong> Pan is Heavier."
            str_zh += "<strong>右盘</strong>更重。"
            break;
    }
    $('#output-en').append($('<li>' + str_en + '</li>'));
    $('#output-zh').append($('<li>' + str_zh + '</li>'));
};

var outputResult = function (guessCoin, guessHeavier) {
    var result = possibleResults[0];
    if (guessCoin === result[0] && guessHeavier === result[1]) {
        if (possibleResults.length === 1) {
            $('#output-en').append($('<li><strong>You are Right!</strong></li>'));
            $('#output-zh').append($('<li><strong>你猜对了！</strong></li>'));
        } else {
            $('#output-en').append($('<li><strong>You are Wrong!</strong> The Coin <strong>' + possibleResults[1][0] + '</strong> is <strong>' +
                                    (possibleResults[1][1] ? 'Heavier' : 'Lighter') + '</strong> than the Others.</li>'));
            $('#output-zh').append($('<li><strong>你猜错了！</strong>第 <strong>' + possibleResults[1][0] + '</strong> 号硬币比其他硬币<strong>' +
                                    (possibleResults[1][1] ? '更重' : '更轻') + '</strong>。</li>'));
        }
    } else {
        $('#output-en').append($('<li><strong>You are Wrong!</strong> The Coin <strong>' + result[0] + '</strong> is <strong>' +
                                (result[1] ? 'Heavier' : 'Lighter') + '</strong> than the Others.</li>'));
        $('#output-zh').append($('<li><strong>你猜错了！</strong>第 <strong>' + result[0] + '</strong> 号硬币比其他硬币<strong>' +
                                (result[1] ? '更重' : '更轻') + '</strong>。</li>'));
    }
};

/**
 * 主方法。初始化游戏元素
 */
var main = function () {

    initDoms();

    var heavyLightButton = $('#heavy_light');

    $('#reset').click(function () {
        // coinNum = Math.floor(Math.random() * 12) + 1;
        // isHeavier = (Math.random() < 0.5);
        $('#weight').prop("disabled", false);
        $('#ok').prop("disabled", false);
        round = 0;
        $('#round-num').text(3 - round);
        $('#coin-num').val(1);
        heavyLightButton.addClass('heavier');
        $('#heavy_light_text').text(heavyLightButton.data("heavier-text"));
        $('#output-en').html('');
        $('#output-zh').html('');
        $('#clear').trigger('click');
        $('#result').hide();
    });

    $('#weight').click(function() {
        switch (weight()) {
            case 0:
                noLean();
                break;
            case -1:
                leftLean();
                break;
            case 1:
                rightLean();
                break;
        }
        round++;
        $('#round-num').text(3 - round);
        if (round === 3) {
            $('#weight').prop("disabled", true);
        }
        outputWeight();
    });

    $('#clear').click(function() {
        $('.coin').data("from", "base");
        $('.coin').css({ top: 0, left: 0 });
        $('#left-pan').data("num", 0);
        $('#right-pan').data("num", 0);
        noLean();
    });

    $('#ok').click(function() {
        var guessCoin = parseInt($('#coin-num').val());
        var guessHeavier = heavyLightButton.hasClass('heavier');
        outputResult(guessCoin, guessHeavier);
        $('#ok').prop("disabled", true);
        $('#weight').prop("disabled", true);
    });

    heavyLightButton.click(function () {
        if (heavyLightButton.hasClass('heavier')) {
            heavyLightButton.removeClass('heavier');
            $('#heavy_light_text').text(heavyLightButton.data("lighter-text"));
        } else {
            heavyLightButton.addClass('heavier');
            $('#heavy_light_text').text(heavyLightButton.data("heavier-text"));
        }
    });

    $('#reset').trigger('click');
};

$(document).ready(main);
