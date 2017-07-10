/**
 * @version 0.1
 * @author Geng
 */

var GAME_SET_SMALL = {
    width: 10,
    height: 10,
    grid_num: 100,
    mine_num: 12,
    liar_num: 3,
    live_num: 1
};

var GAME_SET_MEDIUM = {
    width: 15,
    height: 15,
    grid_num: 225,
    mine_num: 36,
    liar_num: 5,
    live_num: 2
};

var GAME_SET_LARGE = {
    width: 30,
    height: 15,
    grid_num: 450,
    mine_num: 72,
    liar_num: 8,
    live_num: 3
};

var gameOverFlag = false;
var gameSet = GAME_SET_SMALL;
var lives = 1;
var seconds = 0;
var timer;

var shuffle = function(array) {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

var gameover = function() {
    gameOverFlag = true;
    clearInterval(timer);
    $('.grid').each(function() {
        if ($(this).data('number') === -1) {
            $(this).addClass('mine').addClass('opened');
        }
    });
    $('.hide-liar').each(function() {
        if ($(this).hasClass('opened')) {
            $(this).addClass('liar');
        }
    });
}

var checkWin = function() {
    if (gameSet.grid_num - $('.opened').length <= gameSet.mine_num) {
        $('#result').text("You Win!");
        gameover();
    }
}

var nearbyGrids = function*(grid) {
    let position = grid.data('position');
    for (let r = (position.r === 0 ? 0 : position.r - 1); r <= (position.r + 1 === gameSet.height ? position.r : position.r + 1); r++) {
        for (let c = (position.c === 0 ? 0 : position.c - 1); c <= (position.c + 1 === gameSet.width ? position.c : position.c + 1); c++) {
            if (r === position.r && c === position.c) {
                continue;
            }
            yield $("#r" + r + "c" + c);
        }
    }
}

var open = function(grid) {
    if (grid.hasClass('opened') || grid.hasClass('marked')) {
        return;
    }
    grid.addClass('opened');
    let number = grid.data('number');
    if (number === -1) {
        grid.addClass('mine').addClass('exploded');
        lives--;
        $('#live-num').text(lives);
        if (lives === 0) {
            $('#result').text("You Lose!");
            gameover();
        }
        return;
    }

    checkWin();
    if (number > 0) {
        grid.text(number);
        return;
    }
    // number === 0
    for (let nearByGrid of nearbyGrids(grid)) {
        open(nearByGrid);
    }
}

var mark = function(grid) {
    if (grid.hasClass('opened')) {
        if (grid.data('number') > 0) {
            if (!grid.hasClass('liar') && gameSet.liar_num === $('.liar').length) {
                return;
            }
            grid.toggleClass('liar');
            $('#liar-num').text(gameSet.liar_num - $('.liar').length);
        }
        return;
    }
    if (!grid.hasClass('marked') && gameSet.mine_num === $('.marked').length) {
        return;
    }
    grid.toggleClass('marked');
    $('#mine-num').text(gameSet.mine_num - $('.marked').length);
}

var mouseup = function(event) {
    if (gameOverFlag) {
        return;
    }
    switch (event.which) {
        case 1:
            open($(this));
            break;
        case 3:
            mark($(this));
            break;
    }
}

var init = function() {
    let field = $('#field');
    field.html('');
    for (let r = 0; r < gameSet.height; r++) {
        let row = $('<div></div>').appendTo(field);
        for (let c = 0; c < gameSet.width; c++) {
            let grid = $('<div class="grid unselectable" id="r' + r + 'c' + c + '"></div>').appendTo(row);
            grid.data('position', { r: r, c: c});
            grid.data('number', 0);
            grid.on('mouseup', mouseup);
        }
    }

    let mines = shuffle($('.grid')).slice(0, gameSet.mine_num);
    mines.each(function() {
        $(this).data('number', -1);
        for (let nearByGrid of nearbyGrids($(this))) {
            let number = nearByGrid.data('number');
            if (number !== -1) {
                nearByGrid.data('number', number + 1);
            }
        }
    });

    let liars = shuffle($('.grid').filter(function() { return $(this).data('number') > 0; })).slice(0, gameSet.liar_num);
    liars.each(function() {
        let trueNumber = $(this).data('number');
        $(this).addClass('hide-liar');
        if (trueNumber === 1) {
            $(this).data('number', 2);
        } else {
            $(this).data('number', trueNumber - 1);
        }
    });
}

var reset = function() {
    gameOverFlag = false;
    lives = gameSet.live_num;
    seconds = 0;
    clearInterval(timer);
    $('#field').off();

    $('#mine-num').text(gameSet.mine_num);
    $('#liar-num').text(gameSet.liar_num);
    $('#live-num').text(gameSet.live_num);
    $('#time').text(0);
    $('#result').text('');
    init();
    $('#field').one('mouseup', function() {
        console.log("set timer");
        timer = setInterval(function() {
            seconds++;
            $('#time').text(seconds);
        }, 1000);
    });
}

var main = function() {
    $('#reset').on('click', reset);
    $('#b10x10').on('click', () => {
        $('.btn').prop('disabled', false);
        $('#b10x10').prop('disabled', true);
        gameSet = GAME_SET_SMALL;
        reset();
    });
    $('#b15x15').on('click', () => {
        $('.btn').prop('disabled', false);
        $('#b15x15').prop('disabled', true);
        gameSet = GAME_SET_MEDIUM;
        reset();
    });
    $('#b30x15').on('click', () => {
        $('.btn').prop('disabled', false);
        $('#b30x15').prop('disabled', true);
        gameSet = GAME_SET_LARGE;
        reset();
    });
    $('#b10x10').prop('disabled', true);
    gameSet = GAME_SET_SMALL;
    reset();
}

$(document).ready(main);
