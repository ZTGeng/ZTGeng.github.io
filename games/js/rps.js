/**
 * @version 0.10
 * @author Geng
 */

var STATE = 0;
var selection = 0;
var DIGITS = 10;
// var QUESTIONS = "??????????????????????????????????????????????????";
var QUESTIONS = "__________";
var big_num;
var TIMEDELTA = 1000;
var timeout;
var iszh = navigator.language.slice(0, 2) === "zh";

function countdown(callback) {
    $('#modal-fullscreen').modal("show");
    console.log(3);
    modalshow("3");
    modalfade();
    timeout = setTimeout(function() {
        console.log("2");
        modalshow(2);
        modalfade();
        timeout = setTimeout(function() {
            console.log(1);
            modalshow("1");
            modalfade();
            timeout = setTimeout(function() {
                $('#modal-fullscreen').modal("hide");
                callback();
            }, TIMEDELTA);
        }, TIMEDELTA);
    }, TIMEDELTA);
}

function refresh_big_num() {
    big_num = (Math.floor(Math.random() * 100) % 9 + 1).toString() +
            //   Math.random().toFixed(15).slice(2) + 
            //   Math.random().toFixed(15).slice(2) + 
              Math.random().toFixed(9).slice(2);
}

function modalshow(str) {
    $('#countdown-text').text(str);
    $('#modal-fullscreen').css({
        opacity: 1,
        fontSize: "20em"
    });
}

function modalfade() {
    $('#modal-fullscreen').stop().animate({
        opacity: 0,
        fontSize: 0
    }, TIMEDELTA);
}

function select() {
    STATE = 1;
    console.log("Click a button!");
    $('#buttons').children().addClass('btn-danger');
    $('#buttons').children().removeAttr('disabled');
    timeout = setTimeout(result, TIMEDELTA * 2);
    $('#buttons').fadeIn(80).fadeOut(80).fadeIn(80).fadeOut(80).fadeIn(80);
    refresh_big_num();
    $('#com-num').text(big_num);
}

function result() {
    STATE = 2;
    console.log("What you chose is " + selection);
    $('#buttons').children().removeClass('btn-danger');
    var result_num = 0;
    for (var i = 0; i < DIGITS; i++) {
        result_num += parseInt(big_num.charAt(i));
    }
    result_num %= 3;
    $('#com-result').text(result_num.toString());
    switch (result_num) {
        case 0:
        $('#com-pic').attr('src', 'images/rock-left.png');
        break;
        case 1:
        $('#com-pic').attr('src', 'images/scissors-left.png');
        break;
        case 2:
        $('#com-pic').attr('src', 'images/paper-left.png');
        break;
    }
    result_num += 1;
    timeout = setTimeout(function() {
        switch (is_win(result_num, selection)) {
            case 0:
            console.log("Draw!");
            $('#result-text').text(iszh ? "平局！" : "DRAW!");
            break;
            case 1:
            console.log("Computer wins!");
            $('#result-text').text(iszh ? "你输了！" : "YOU LOSE!");
            break;
            case 2:
            console.log("You win!");
            $('#result-text').text(iszh ? "你赢了！" : "YOU WIN!");
            break;
        }
    }, TIMEDELTA);
}

// human wins, return 2; computer wins, return 1; draw, return 0
function is_win(com_result, hum_result) {
    if (hum_result === 0) return 1;
    return (hum_result - com_result + 3) % 3;
}

function reset() {
    STATE = 0;
    selection = 0;
    clearTimeout(timeout);
    $('#com-num').text(QUESTIONS);
    $('#com-result').text("?");
    $('#result-text').text("");
    $('#buttons').children().attr('disabled', 'disabled');
    $('#com-pic').attr('src', '');
    $('#hum-pic').attr('src', '');
    // $('#modal-fullscreen').modal("hide");
    countdown(select);
}

function main() {
    $('#reset').on('click', reset);
    $('#com-num').text(QUESTIONS);
    $('#com-result').text("?");
    $('#button-rock').on('click', function() {
        if (STATE != 1) return;
        $('#hum-pic').attr('src', 'images/rock-right.png');
        selection = 1;
    });
    $('#button-scissors').on('click', function() {
        if (STATE != 1) return;
        $('#hum-pic').attr('src', 'images/scissors-right.png');
        selection = 2;
    });
    $('#button-paper').on('click', function() {
        if (STATE != 1) return;
        $('#hum-pic').attr('src', 'images/paper-right.png');
        selection = 3;
    });
    $('#modal-fullscreen').modal({
        backdrop: false,
        keyboard: false,
        show: false
    });
}

$(document).ready(main);