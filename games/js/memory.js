/**
 * @version 0.1
 * @author Geng
 */

var PAUSE = false;
var COLOR = ["black", "red", "orange", "blue"];
var PIC = ["&spades;", "&hearts;", "&clubs;", "&diams;", "&#9733;", "&#9835;", "&#9787;", "&#9728;"];

var game = function(width, height) {
    if ((width + height) % 2 != 0) {
        alert("Wrong set");
        return;
    }
    var pic1 = [], pic2 = [];
    for (var i = 0; i < width * height / 2; i++) {
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
    var count = 0, n = 0;
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
        count++;
        $('#count').html(count);
        if (lastOpen.attr('pic') !== grid.attr('pic')) {
            //wait 2 seconds
            PAUSE = true;
            setTimeout(function(one, another) {
                PAUSE = false;
                one.removeClass('open');
                another.removeClass('open');
                one.html('<p>&nbsp;</p>');
                another.html('<p>&nbsp;</p>');
            }, 2000, lastOpen, grid);
        } else {
            //check winning
            
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
    $('#b4x4').click(function() { game(4, 4); });
    $('#b8x4').click(function() { game(8, 4); });
    $('#b8x8').click(function() { game(8, 8); });
    game(4, 4);
};

$(document).ready(main);
