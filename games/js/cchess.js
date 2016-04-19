/**
 * @version 0.10
 * @author Geng
 */

var roles = ["general", "guard", "minister", "horse", "chariot", "cannon", "soldier"];
var redMove = true;
var gameOver = false;
var moveFromGrid = null;
var moveSound = document.createElement('audio');
moveSound.setAttribute('src', 'sounds/move.wav');
var eatSound = document.createElement('audio');
eatSound.setAttribute('src', 'sounds/eat.wav');

function reset() {
    $('.field-grid').attr('role', null);
    $('.red').removeClass('red');
    $('.black').removeClass('black');
    
    for (var i = 0; i < 5; i++) {
        $('#p0' + (4 + i)).addClass('black').attr('role', roles[i]);
        $('#p0' + (4 - i)).addClass('black').attr('role', roles[i]);
        $('#p9' + (4 + i)).addClass('red').attr('role', roles[i]);
        $('#p9' + (4 - i)).addClass('red').attr('role', roles[i]);
    }
    $('#p21').addClass('black').attr('role', roles[5]);
    $('#p27').addClass('black').attr('role', roles[5]);
    $('#p71').addClass('red').attr('role', roles[5]);
    $('#p77').addClass('red').attr('role', roles[5]);
    for (var i = 0; i < 9; i += 2) {
        $('#p3' + i).addClass('black').attr('role', roles[6]);
        $('#p6' + i).addClass('red').attr('role', roles[6]);
    }
    
    gameOver = false;
    redMove = true;
    moveFromGrid = null;
    
    $('#rbox').removeClass('inactive');
    $('#bbox').addClass('inactive');
    $('#rwin').hide();
    $('#bwin').hide();
};

function onClickGrid() {
    if (gameOver) return;
    if (moveFromGrid) {
        if (moveFromGrid.prop('id') === $(this).prop('id')) {
            moveFromGrid.removeClass('move-from');
            moveFromGrid = undefined;
        } else if (canMove(moveFromGrid, $(this))) {
            if ($(this).attr('role')) {
                playEatSound();
            } else {
                playMoveSound();
            }
            move(moveFromGrid, $(this));
            moveFromGrid.removeClass('move-from');
            moveFromGrid = undefined;
            if (checkWin()) return;
            $('#rbox').toggleClass('inactive');
            $('#bbox').toggleClass('inactive');
            redMove = !redMove;
        }
    } else {
        if (($(this).hasClass('red') && redMove) || 
            ($(this).hasClass('black') && !redMove)) {
            moveFromGrid = $(this);
            $(this).addClass('move-from');
        }
    }
};

function canMove(from, to) {
    // Can't step on pieces with same color
    if (from.hasClass('red') && to.hasClass('red') ||
        from.hasClass('black') && to.hasClass('black')) {
        return false;
    }
    var r1 = parseInt(from.prop('id').slice(1, 2));
    var c1 = parseInt(from.prop('id').slice(2, 3));
    var r2 = parseInt(to.prop('id').slice(1, 2));
    var c2 = parseInt(to.prop('id').slice(2, 3));
    var piecesVertical = function(_r1, _r2, _c) {
        if (_r1 > _r2) return piecesVertical(_r2, _r1, _c);
        var count = 0;
        for (var r = _r1 + 1; r < _r2; r++) {
            if ($('#p' + r + '' + _c).attr('role')) {
                count++;
            }
        }
        return count;
    };
    var piecesHorizontal = function(_c1, _c2, _r) {
        if (_c1 > _c2) return piecesHorizontal(_c2, _c1, _r);
        var count = 0;
        for (var c = _c1 + 1; c < _c2; c++) {
            if ($('#p' + _r + '' + c).attr('role')) {
                count++;
            }
        }
        return count;
    };
    
    // Generals can't meet
    var redGeneral = $('.red[role="general"]');
    var blackGeneral = $('.black[role="general"]');
    var rrg = parseInt(redGeneral.prop('id').slice(1, 2));
    var crg = parseInt(redGeneral.prop('id').slice(2, 3));
    var rbg = parseInt(blackGeneral.prop('id').slice(1, 2));
    var cbg = parseInt(blackGeneral.prop('id').slice(2, 3));
    if (from.attr('role') === roles[0]) {
        if (redMove) { rrg = r2; crg = c2; }
        else         { rbg = r2; cbg = c2; }
        if (crg === cbg) {
            if (!piecesVertical(rbg, rrg, cbg)) return false;
        }
    } else {
        if (crg === cbg && crg === c1) {
            if (piecesVertical(rbg, rrg, cbg) <= 1) return false;
        }
    }
    
    // Pieces moving rules
    switch (from.attr('role')) {
        case roles[0]: //general
            return (r1 === r2 &&
                    Math.abs(c1 - c2) === 1 &&
                    Math.abs(4 - c2) <= 1) ||
                   (c1 === c2 &&
                    Math.abs(r1 - r2) === 1 &&
                    Math.abs((redMove ? 8 : 1) - r2) <= 1);
        case roles[1]: //guard
            return Math.abs(r1 - r2) === 1 &&
                   Math.abs(c1 - c2) === 1 &&
                   Math.abs(4 - c2) <= 1 &&
                   Math.abs((redMove ? 8 : 1) - r2) <= 1;
        case roles[2]: //minister
            return Math.abs(r1 - r2) === 2 &&
                   Math.abs(c1 - c2) === 2 &&
                   !$('#p' + ((r1 + r2) / 2) + '' + ((c1 + c2) / 2)).attr('role') &&
                   (redMove ? r2 >= 5 : r2 <= 4);
        case roles[3]: //horse
            return (Math.abs(r1 - r2) === 1 &&
                    Math.abs(c1 - c2) === 2 &&
                    !$('#p' + r1 + '' + ((c1 + c2) / 2)).attr('role')) ||
                   (Math.abs(r1 - r2) === 2 &&
                    Math.abs(c1 - c2) === 1 &&
                    !$('#p' + ((r1 + r2) / 2) + '' + c1).attr('role'));
        case roles[4]: //chariot
            return (r1 === r2 &&
                    !piecesHorizontal(c1, c2, r1)) ||
                   (c1 === c2 &&
                    !piecesVertical(r1, r2, c1));
        case roles[5]: //cannon
            return (!$('#p' + r2 + '' + c2).attr('role') &&
                    ((r1 === r2 &&
                     !piecesHorizontal(c1, c2, r1)) ||
                    (c1 === c2 &&
                     !piecesVertical(r1, r2, c1)))) ||
                   ($('#p' + r2 + '' + c2).attr('role') &&
                    ((r1 === r2 &&
                     piecesHorizontal(c1, c2, r1) === 1) ||
                    (c1 === c2 &&
                     piecesVertical(r1, r2, c1) === 1)));
        case roles[6]: //soldier
            return (c1 === c2 &&
                    r1 + (redMove ? -1 : 1) === r2) ||
                   (r1 === r2 &&
                    (redMove ? r2 <= 4 : r2 >= 5) &&
                    Math.abs(c1 - c2) === 1);
    }
};

function move(from, to) {
    var color = from.hasClass('red') ? 'red' : 'black';
    from.removeClass('red black');
    to.removeClass('red black');
    to.addClass(color);
    
    var role = from.attr('role');
    from.attr('role', null);
    to.attr('role', role);
};

function checkWin() {
    if ($('.black[role="general"]').length === 0) {
        gameOver = true;
        $('#rwin').show();
        $('.inactive').removeClass('inactive');
        return true;
    }
    if ($('.red[role="general"]').length === 0) {
        gameOver = true;
        $('#bwin').show();
        $('.inactive').removeClass('inactive');
        return true;
    }
    return false;
};

var playMoveSound = function () {
    // moveSound.pause()
    // moveSound.currentTime = 0;
    moveSound.load();
    moveSound.play();
};
var playEatSound = function () {
    eatSound.load();
    eatSound.play();
};

function main() {
    for (var r = 0; r < 10; r++) {
        var row = $('<div class="field-row"></div>').appendTo($('#field'));
        for (var c = 0; c < 9; c++) {
            $('<div id="p' + r.toString() + c.toString() + '" class="field-grid"></div>').appendTo(row);
        }
    }
    $('#field').on('click', '.field-grid', onClickGrid);
    $('#reset').on('click', reset);
    $('#resign').on('click', function() {
        gameOver = true;
        if (redMove) $('#bwin').show();
        else $('#rwin').show();
        $('.inactive').removeClass('inactive');
    });
    reset();
};

$(document).ready(main);
