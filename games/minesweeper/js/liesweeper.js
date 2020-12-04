/**
 * @version 0.3
 * @author Geng
 */

(function() {
    var GAME_SET = {
        "10x10": {
            width: 10,
            height: 10,
            grid_num: 100,
            mine_num: 12,
            liar_num: 3,
            live_num: 1
        },
        "15x15": {
            width: 15,
            height: 15,
            grid_num: 225,
            mine_num: 36,
            liar_num: 5,
            live_num: 2
        },
        "30x15": {
            width: 30,
            height: 15,
            grid_num: 450,
            mine_num: 72,
            liar_num: 8,
            live_num: 3
        }
    };

    var gameOverFlag = false;
    var gameSet = GAME_SET["10x10"];
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
        $('.grid').each((_, el) => {
            if ($(el).data('number') === -1) {
                $(el).addClass('mine').addClass('opened');
            }
        });
        $('.hidden-liar').each((_, el) => {
            if ($(el).hasClass('opened')) {
                $(el).addClass('liar');
            }
        });
    }

    var checkWin = function() {
        // Covered grids num <= remaining mines num
        if (gameSet.grid_num - $('.opened').length <= gameSet.mine_num - $('.exploded').length) {
            $('#result').text("You Win!");
            gameover();
        }
    }

    // generator
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
            } else {
                $('#mine-num').text(gameSet.mine_num - $('.marked').length - $('.mine').length);
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
        if (!grid.hasClass('marked') && gameSet.mine_num <= ($('.marked').length + $('.mine').length)) {
            return;
        }
        grid.toggleClass('marked');
        $('#mine-num').text(gameSet.mine_num - $('.marked').length - $('.mine').length);
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

        shuffle($('.grid'))
            .slice(0, gameSet.mine_num)
            .each((_, el) => {
                $(el).data('number', -1);
                for (let nearByGrid of nearbyGrids($(el))) {
                    let number = nearByGrid.data('number');
                    if (number !== -1) {
                        nearByGrid.data('number', number + 1);
                    }
                }
            });

        shuffle($('.grid').filter((_, el) => { return $(el).data('number') > 0; }))
            .slice(0, gameSet.liar_num)
            .each((_, el) => {
                let trueNumber = $(el).data('number');
                $(el).addClass('hidden-liar');
                if (trueNumber === 1) {
                    $(el).data('number', 2);
                } else {
                    $(el).data('number', trueNumber - 1);
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
        $('#field').one('mouseup', () => {
            timer = setInterval(() => {
                seconds++;
                $('#time').text(seconds);
            }, 1000);
        });
    }

    var setGame = function(size) {
        return () => {
            $('.btn').prop('disabled', false);
            $("#b" + size).prop('disabled', true);
            gameSet = GAME_SET[size];
            reset();
        };
    }

    var main = function() {
        $('#reset').on('click', reset);
        $('#b10x10').on('click', setGame("10x10"));
        $('#b15x15').on('click', setGame("15x15"));
        $('#b30x15').on('click', setGame("30x15"));
        setGame("10x10")();
    }

    $(document).ready(main);
})()
