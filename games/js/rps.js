/**
 * @version 0.31
 * @author Geng
 */

var STATE = 0;
var selection = 0;
var TIMEDELTA = 400;
var timeout;
var iszh = navigator.language.slice(0, 2) === "zh";

function countdown(callback) {
    let modal = new bootstrap.Modal('#modal-fullscreen');
    modal.show();
    // console.log(3);
    modalshow("3");
    modalfade();
    timeout = setTimeout(function() {
        // console.log("2");
        modalshow(2);
        modalfade();
        timeout = setTimeout(function() {
            // console.log(1);
            modalshow("1");
            modalfade();
            timeout = setTimeout(function() {
                $('#modal-fullscreen').modal("hide");
                callback();
            }, TIMEDELTA * 3);
        }, TIMEDELTA * 3);
    }, TIMEDELTA * 3);
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
    }, TIMEDELTA * 3);
}

function game() {
    STATE = 1;
    // console.log("Click a button!");
    $('#buttons').children().addClass('btn-danger');
    $('#buttons').children().removeAttr('disabled');

    $('#prompt').show();

    var random1 = (Math.floor(Math.random() * 100) % 9 + 1).toString() + Math.random().toFixed(4).slice(2);
    var random2 = (Math.floor(Math.random() * 100) % 9 + 1).toString() + Math.random().toFixed(4).slice(2);
    $('#random-1').val(random1);
    $('#random-2').val(random2);
    timeout = setTimeout(() => {
        var sum3 = parseInt(random1) + parseInt(random2);
        $('#sum-3').text(sum3);
        timeout = setTimeout(() => {
            var square4 = sum3 * sum3;
            $('#square-4').text(square4);
            timeout = setTimeout(() => {
                var reverse5 = (square4.toString()).split("").reverse().join("");
                $('#reverse-5').text(reverse5);
                timeout = setTimeout(() => {
                    var sqrt6 = Math.floor(Math.sqrt(parseInt(reverse5)));
                    $('#sqrt-6').html(sqrt6);
                    timeout = setTimeout(() => {
                        var odd_arr = [];
                        var sqrt6_arr = sqrt6.toString().split("").reverse();
                        var sqrt6_html = "";
                        for (var i = 0; i < sqrt6_arr.length; i++) {
                            if (i % 2 === 0) {
                                odd_arr.push(sqrt6_arr[i]);
                                sqrt6_html = "<span class='text-danger'>" + sqrt6_arr[i] + "</span>" + sqrt6_html;
                            } else {
                                sqrt6_html = "<span>" + sqrt6_arr[i] + "</span>" + sqrt6_html;
                            }
                        }
                        var oddDigits = odd_arr.reverse().join("");
                        $('#sqrt-6').html(sqrt6_html);
                        $('#odd-7').text(oddDigits);
                        timeout = setTimeout(() => {
                            var mod8 = parseInt(oddDigits) % 3;
                            $('#mod-8').text(mod8);
                            $('#com-result-' + mod8).addClass('text-danger');
                            $('#com-img-' + mod8).addClass('bg-danger');
                            $('#prompt').hide();
                            result(mod8);
                        }, TIMEDELTA / 2);
                    }, TIMEDELTA / 2);
                }, TIMEDELTA);
            }, TIMEDELTA);
        }, TIMEDELTA * 2);
    }, TIMEDELTA * 2);
    $('#buttons').fadeIn(80).fadeOut(80).fadeIn(80).fadeOut(80).fadeIn(80);
}

function result(result_num) {
    STATE = 2;
    // console.log("What you chose is " + selection);
    $('#buttons').children().removeClass('btn-danger');
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
            // console.log("Draw!");
            $('#result-text').text(iszh ? "平局！" : "DRAW!");
            break;
            case 1:
            // console.log("Computer wins!");
            $('#result-text').text(iszh ? "你输了！" : "YOU LOSE!");
            break;
            case 2:
            // console.log("You win!");
            $('#result-text').text(iszh ? "你赢了！" : "YOU WIN!");
            break;
        }
        $('#result-text').show();
    }, TIMEDELTA * 3);
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
    $('#random-1').val('');
    $('#random-2').val('');
    $('#sum-3').text('');
    $('#square-4').text('');
    $('#reverse-5').text('');
    $('#sqrt-6').html('');
    $('#odd-7').text('');
    $('#mod-8').text('');
    $('#result-text').text("");
    $('#buttons').children().removeClass('btn-danger').attr('disabled', 'disabled');
    $('#com-pic').attr('src', '');
    $('#hum-pic').attr('src', '');
    $('#prompt').hide();
    $('#com-results').children().removeClass('text-danger');
    $('.com-img').removeClass('bg-danger');
    $('#result-text').hide();
    countdown(game);
}

function main() {
    $('#reset').on('click', reset);
    $('#prompt').hide();
    $('#result-text').hide();
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