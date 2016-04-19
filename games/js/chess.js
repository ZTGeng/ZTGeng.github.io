/**
 * @version 0.10
 * @author Geng
 */

var roles = ["king",    "queen",   "bishop",  "knight",  "rook",    "pawn"];
var wpics = ["&#9812;", "&#9813;", "&#9815;", "&#9816;", "&#9814;", "&#9817;"];
var bpics = ["&#9818;", "&#9819;", "&#9821;", "&#9822;", "&#9820;", "&#9823;"]
var whiteMove = true;
var gameStop = false;
var moveFromGrid = null;
var passant = null;
var setPassant = false;
var whiteKingMoved = false;
var blackKingMoved = false;
var whiteRook0Moved = false;
var blackRook0Moved = false;
var whiteRook7Moved = false;
var blackRook7Moved = false;
var moveSound = document.createElement('audio');
moveSound.setAttribute('src', 'sounds/move.wav');
var eatSound = document.createElement('audio');
eatSound.setAttribute('src', 'sounds/eat.wav');

function reset() {
    $('.field-grid').attr('role', null);
    $('.field-grid').html("");
    $('.white').removeClass('white');
    $('.black').removeClass('black');

    for (var i = 0; i < 5; i++) {
        $('#p7' + i).addClass('white').attr('role', roles[4 - i]).html(wpics[4 - i]);
        $('#p0' + i).addClass('black').attr('role', roles[4 - i]).html(bpics[4 - i]);
    }
    for (var i = 5; i < 8; i++) {
        $('#p7' + i).addClass('white').attr('role', roles[i - 3]).html(wpics[i - 3]);
        $('#p0' + i).addClass('black').attr('role', roles[i - 3]).html(bpics[i - 3]);
    }
    for (var i = 0; i < 8; i++) {
        $('#p6' + i).addClass('white').attr('role', roles[5]).html(wpics[5]);
        $('#p1' + i).addClass('black').attr('role', roles[5]).html(bpics[5]);
    }

    gameStop = false;
    whiteMove = true;
    moveFromGrid = null;
    passant = null;
    setPassant = false;
    whiteKingMoved = false;
    blackKingMoved = false;
    whiteRook0Moved = false;
    blackRook0Moved = false;
    whiteRook7Moved = false;
    blackRook7Moved = false;

    $('#promotion').hide();
    $('#wbox').removeClass('inactive');
    $('#bbox').addClass('inactive');
    $('#wwin').hide();
    $('#bwin').hide();
};

function onClickGrid() {
    var togglePlayer = function () {
        moveFromGrid.removeClass('move-from');
        moveFromGrid = null;
        if (checkWin()) return;
        $('#wbox').toggleClass('inactive');
        $('#bbox').toggleClass('inactive');
        whiteMove = !whiteMove;
    };
    if (gameStop) return;
    if (moveFromGrid) {
        if (moveFromGrid.prop('id') === $(this).prop('id')) {
            moveFromGrid.removeClass('move-from');
            moveFromGrid = undefined;
        } else if (canMoveOrEat(moveFromGrid, $(this))) {
            if ($(this).attr('role')) {
                eatSound.pause()
                eatSound.currentTime = 0;
                eatSound.play();
            } else {
                moveSound.pause()
                moveSound.currentTime = 0;
                moveSound.play();
            }
            move(moveFromGrid, $(this));
            togglePlayer();
        // Passant
        } else if (passant && moveFromGrid.attr('role') === roles[5]) {
            var passant_r = passant.prop('id').slice(1, 2);
            var passant_c = passant.prop('id').slice(2, 3);
            var passant_back_id = (passant.hasClass('white') ? 'p5' : 'p2') + passant_c;
            if ($(this).prop('id') === passant.prop('id') ||
                $(this).prop('id') === passant_back_id) {
                var moveFrom_r = moveFromGrid.prop('id').slice(1, 2);
                var moveFrom_c = moveFromGrid.prop('id').slice(2, 3);
                if (moveFrom_r === passant_r && Math.abs(parseInt(moveFrom_c) - parseInt(passant_c)) === 1) {
                    if ($(this).attr('role')) {
                        eatSound.pause()
                        eatSound.currentTime = 0;
                        eatSound.play();
                    } else {
                        moveSound.pause()
                        moveSound.currentTime = 0;
                        moveSound.play();
                    }
                    passant.removeClass('white black');
                    passant.attr('role', null);
                    passant.html("");
                    move(moveFromGrid, $('#' + passant_back_id));
                    togglePlayer();
                }
            }
        // Castling
        } else if (!((whiteMove || blackKingMoved) && (!whiteMove || whiteKingMoved)) && moveFromGrid.attr('role') === roles[0]) {
            var c = whiteMove ? "7" : "0";
            if ($(this).prop('id') === "p" + c + "2") {
                if (canCastle(moveFromGrid, $(this))) {
                    move(moveFromGrid, $(this));
                    moveSound.pause()
                    moveSound.currentTime = 0;
                    moveSound.play();
                    setTimeout(function() {
                        move($('#p' + c + '0'), $('#p' + c + '3'));
                        moveSound.pause()
                        moveSound.currentTime = 0;
                        moveSound.play();
                        togglePlayer();
                    }, 150);
                }
            } else if ($(this).prop('id') === "p" + c + "6") {
                if (canCastle(moveFromGrid, $(this))) {
                    move(moveFromGrid, $(this));
                    moveSound.pause()
                    moveSound.currentTime = 0;
                    moveSound.play();
                    setTimeout(function() {
                        move($('#p' + c + '7'), $('#p' + c + '5'));
                        moveSound.pause()
                        moveSound.currentTime = 0;
                        moveSound.play();
                        togglePlayer();
                    }, 150);
                }
            }
        }
    } else {
        if (($(this).hasClass('white') && whiteMove) ||
            ($(this).hasClass('black') && !whiteMove)) {
            moveFromGrid = $(this);
            $(this).addClass('move-from');
        }
    }
};

function canMoveOrEat(fromGrid, toGrid) {
    // Can't step on pieces with same color
    if (fromGrid.hasClass('white') && toGrid.hasClass('white') ||
        fromGrid.hasClass('black') && toGrid.hasClass('black')) {
        return false;
    }
    
    if (toGrid.attr('role')) {
        return canEat(fromGrid, toGrid);
    } else {
        return canMove(fromGrid, toGrid);
    }
}

function canMove(fromGrid, toGrid) {
    var isWhite = fromGrid.hasClass('white');
    var r1 = parseInt(fromGrid.prop('id').slice(1, 2));
    var c1 = parseInt(fromGrid.prop('id').slice(2, 3));
    var r2 = parseInt(toGrid.prop('id').slice(1, 2));
    var c2 = parseInt(toGrid.prop('id').slice(2, 3));

    // Pieces moving rules
    switch (fromGrid.attr('role')) {
        case roles[0]: //king
            return (Math.abs(r1 - r2) <= 1) && (Math.abs(c1 - c2) <= 1);
        case roles[1]: //queen
            return (r1 === r2 && emptyInHorizontal(c1, c2, r1)) ||
                (c1 === c2 && emptyInVertical(r1, r2, c1)) ||
                (Math.abs(r1 - r2) === Math.abs(c1 - c2) && emptyInDiagonal(r1, c1, r2, c2));
        case roles[2]: //bishop
            return (Math.abs(r1 - r2) === Math.abs(c1 - c2) && emptyInDiagonal(r1, c1, r2, c2));
        case roles[3]: //knight
            return (Math.abs(r1 - r2) === 1 && Math.abs(c1 - c2) === 2) ||
                (Math.abs(r1 - r2) === 2 && Math.abs(c1 - c2) === 1);
        case roles[4]: //rook
            return (r1 === r2 && emptyInHorizontal(c1, c2, r1)) ||
                (c1 === c2 && emptyInVertical(r1, r2, c1));
        case roles[5]: //pawn
            if (c1 !== c2) return false;
            if (r1 + (isWhite ? -1 : 1) === r2) return true;
            if ((isWhite && r1 === 6 && r2 === 4 && !$('#p5' + c1).attr('role')) ||
               (!isWhite && r1 === 1 && r2 === 3 && !$('#p2' + c1).attr('role'))) {
                setPassant = true;
                return true;
            }
            return false;
    }
};

function canEat(fromGrid, toGrid) {
    if (fromGrid.attr('role') === roles[5]) {
        var isWhite = fromGrid.hasClass('white');
        var r1 = parseInt(fromGrid.prop('id').slice(1, 2));
        var c1 = parseInt(fromGrid.prop('id').slice(2, 3));
        var r2 = parseInt(toGrid.prop('id').slice(1, 2));
        var c2 = parseInt(toGrid.prop('id').slice(2, 3));
        return Math.abs(c1 - c2) === 1 && r1 + (isWhite ? -1 : 1) === r2;
    } else {
        return canMove(fromGrid, toGrid);
    }
}

function canCastle(fromGrid, toGrid) {
    var isWhite = fromGrid.hasClass('white');
    if (isWhite) {
        if (toGrid.prop('id') === "p72" && !whiteRook0Moved) {
            if (!emptyInHorizontal(0, 4, 7)) return false;
            return !isCheckArray("black", [$('#p72'), $('#p73'), $('#p74')]);
        } else if (toGrid.prop('id') === "p76" && !whiteRook7Moved) {
            if (!emptyInHorizontal(4, 7, 7)) return false;
            return !isCheckArray("black", [$('#p74'), $('#p75'), $('#p76')]);
        }
        return false;
    } else {
        if (toGrid.prop('id') === "p02" && !blackRook0Moved) {
            if (!emptyInHorizontal(0, 4, 0)) return false;
            return !isCheckArray("white", [$('#p02'), $('#p03'), $('#p04')]);
        } else if (toGrid.prop('id') === "p06" && !blackRook7Moved) {
            if (!emptyInHorizontal(4, 7, 0)) return false;
            return !isCheckArray("white", [$('#p04'), $('#p05'), $('#p06')]);
        }
        return false;
    }
}

var emptyInVertical = function (_r1, _r2, _c) {
    if (_r1 > _r2) return emptyInVertical(_r2, _r1, _c);
    for (var _r = _r1 + 1; _r < _r2; _r++) {
        if ($('#p' + _r + '' + _c).attr('role')) return false;
    }
    return true;
}

var emptyInHorizontal = function (_c1, _c2, _r) {
    if (_c1 > _c2) return emptyInHorizontal(_c2, _c1, _r);
    for (var _c = _c1 + 1; _c < _c2; _c++) {
        if ($('#p' + _r + '' + _c).attr('role')) return false;
    }
    return true;
}

var emptyInDiagonal = function (_r1, _c1, _r2, _c2) {
    if (_r1 > _r2) return emptyInDiagonal(_r2, _c2, _r1, _c1);
    if (_c1 < _c2) {
        for (var _r = _r1 + 1, _c = _c1 + 1; _r < _r2; _r++ , _c++) {
            if ($('#p' + _r + '' + _c).attr('role')) return false;
        }
    } else {
        for (var _r = _r1 + 1, _c = _c1 - 1; _r < _r2; _r++ , _c--) {
            if ($('#p' + _r + '' + _c).attr('role')) return false;
        }
    }
    return true;
}

var isCheck = function (color, grid) {
    var pieces = $('.' + color);
    for (var i in pieces) {
        if (canEat(pieces[i], grid)) return true;
    }
    return false;
};

var isCheckArray = function (color, grids) {
    var pieces = $('.' + color);
    var check = false;
    for (var i in grids) {
        pieces.each(function() {
            if (!check && canEat($(this), grids[i])) check = true;
        });
        // for (var i in pieces) {
        //     if (canEat(pieces[i], grids[j])) return true;
        // }
    }
    return check;
}

function move(fromGrid, toGrid) {
    var isWhite = fromGrid.hasClass('white');
    var color = fromGrid.hasClass('white') ? 'white' : 'black';
    fromGrid.removeClass('white black');
    toGrid.removeClass('white black');
    toGrid.addClass(color);

    var role = fromGrid.attr('role');
    fromGrid.attr('role', null);
    toGrid.attr('role', role);

    var text = fromGrid.html();
    fromGrid.html("");
    toGrid.html(text);
    
    if (!whiteKingMoved && fromGrid.prop('id') === "p74") whiteKingMoved = true;
    if (!blackKingMoved && fromGrid.prop('id') === "p04") blackKingMoved = true;
    if (!whiteRook0Moved && fromGrid.prop('id') === "p70") whiteRook0Moved = true;
    if (!whiteRook7Moved && fromGrid.prop('id') === "p77") whiteRook7Moved = true;
    if (!blackRook0Moved && fromGrid.prop('id') === "p00") blackRook0Moved = true;
    if (!blackRook7Moved && fromGrid.prop('id') === "p07") blackRook7Moved = true;

    // promotion
    if (toGrid.attr('role') === roles[5] && toGrid.prop('id').slice(1, 2) === (isWhite ? "0" : "7")) {
        gameStop = true;
        for (var i = 1; i < 5; i++) {
            $('#pro-btn-' + i).html(isWhite ? wpics[i] : bpics[i]).off().on('click', function (btnid) {
                return function () {
                    toGrid.attr('role', roles[btnid]);
                    toGrid.html(isWhite ? wpics[btnid] : bpics[btnid]);
                    $('#promotion').hide();
                    gameStop = false;
                };
            } (i));
        }
        $('#promotion').show();
    }

    passant = null;
    if (setPassant) {
        passant = toGrid;
        setPassant = false;
    }
};

function checkWin() {
    if ($('.black[role="king"]').length === 0) {
        gameStop = true;
        $('#wwin').show();
        $('.inactive').removeClass('inactive');
        return true;
    }
    if ($('.white[role="king"]').length === 0) {
        gameStop = true;
        $('#bwin').show();
        $('.inactive').removeClass('inactive');
        return true;
    }
    return false;
};

function main() {
    for (var r = 0; r < 8; r++) {
        var row = $('<div class="field-row"></div>').appendTo($('#field'));
        for (var c = 0; c < 8; c++) {
            $('<div id="p' + r.toString() + c.toString() + '" class="field-grid" unselectable="on"></div>').appendTo(row);
        }
    }
    $('#field').on('click', '.field-grid', onClickGrid);
    $('#reset').on('click', reset);
    $('#resign').on('click', function () {
        gameStop = true;
        if (whiteMove) $('#bwin').show();
        else $('#wwin').show();
        $('.inactive').removeClass('inactive');
    });
    reset();
};

$(document).ready(main);
