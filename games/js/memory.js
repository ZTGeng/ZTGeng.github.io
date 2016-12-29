/**
 * @version 0.1
 * @author Geng
 */

var PAUSE = false;
var COLOR = ["black", "red", "orange", "blue"];
var PIC = ["&spades;", "&hearts;", "&clubs;", "&diams;", "&#9733;", "&#9835;", "&#9787;", "&#9728;"];

var game = function(num) {
    // if (num % 2 != 0) {
    //     alert("Wrong set");
    //     return;
    // }
    var width, height, best, time;
    switch (num) {
        case 16:
            width = 4;
            height = 4;
            time = 1000;
            break;
        case 32:
            width = 8;
            height = 4;
            time = 1500;
            break;
        case 64:
            width = 8;
            height = 8;
            time = 2000;
            break;
        default:
            alert("Wrong set");
            return;
    }
    try {
        best = localStorage.getItem("best" + num);
    } catch(err) {
        console.log(err.message);
    }
    if (best) {
        $('#best-en').text(best + " Unnecessary Opens");
        $('#best-zh').text(best + " 次不匹配点击");
    } else {
        $('#best-en').text("No Record");
        $('#best-zh').text("无记录");
    }
    var pic1 = [], pic2 = [];
    for (var i = 0; i < num / 2; i++) {
        pic1.push(i);
        pic2.push(i);
    }
    shuffle(pic1);
    shuffle(pic2);
    var pic = pic1.concat(pic2);
    var lastOpen = null;
    var board = $('#board');
    board.empty();
    for (var i = 0; i < width; i++) {
        var col = $('<div class="col"></div>').appendTo(board);
        for (var j = 0; j < height; j++) {
            $('<div class="grid" pic="no"><p>&nbsp;</p></div>').appendTo(col);
        }
    }
    var count = - Math.ceil(num / 4), n = 0;
    $('#count').text(0);
    PAUSE = false;
    board.off().on('click', '.grid', function() {
        //if (PAUSE) { return; }
        var grid = $(this);
        if (grid.hasClass('open')) { return; }
        if (grid.attr('pic') === "no") {
            if (count >= pic.length) {
                alert("Out of bound!");
                return;
            }
            // assign a pic
            grid.css('color', COLOR[Math.floor(pic[n] / 8)]);
            grid.attr('pic', pic[n++]);
        }
        grid.html('<p>' + PIC[parseInt(grid.attr('pic')) % 8] + '</p>');
        grid.addClass('open');
        if (lastOpen === null) {
            lastOpen = grid;
            return;
        }
        if (lastOpen.attr('pic') !== grid.attr('pic')) {
            count++;
            if (count > 0) {
                $('#count').text(count);
            }
            //wait 1 - 2 seconds
            PAUSE = true;
            setTimeout(function(one, another) {
                PAUSE = false;
                one.removeClass('open');
                another.removeClass('open');
                one.html('<p>&nbsp;</p>');
                another.html('<p>&nbsp;</p>');
            }, time, lastOpen, grid);
        } else {
            //chexk win
            if ($('.open').length === num) {
                //update best record
                if (!best || best > count) {
                    $('#best-en').text(count + " Unnecessary Opens");
                    $('#best-zh').text(count + " 次不匹配点击");
                    try {
                        localStorage.setItem("best" + num, count);
                    } catch(err) {
                        console.log(err.message);
                    }
                }
            }
        }
        lastOpen = null;
    });
}

/* knuth-shuffle */
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

var main = function() {
    $('#b4x4').click(function() { game(16); });
    $('#b8x4').click(function() { game(32); });
    $('#b8x8').click(function() { game(64); });
    game(16);
};

$(document).ready(main);
