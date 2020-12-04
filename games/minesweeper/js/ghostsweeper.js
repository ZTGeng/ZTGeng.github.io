/**
 * @version 0.1
 * @author Geng
 */

// (function() {
    const REPLAY_DURATION = 100;
    const ANIMATE_DURATION = 600;

    const GAME_SET = {
        "15x15": {
            width: 15,
            height: 15,
            grid_num: 225,
            mine_num: 36,
            live_num: 2
        },
        "30x15": {
            width: 30,
            height: 15,
            grid_num: 450,
            mine_num: 72,
            live_num: 3
        },
        "30x30": {
            width: 30,
            height: 30,
            grid_num: 900,
            mine_num: 144,
            live_num: 4
        },
        "10lives": {
            width: 30,
            height: 30,
            grid_num: 900,
            mine_num: 144,
            live_num: 10
        }
    };

    var ghostColors = [
        "bg-primary text-white",
        "bg-secondary text-white",
        "bg-success text-white",
        "bg-danger text-white",
        "bg-warning text-dark",
        "bg-info text-white",
        "bg-white text-dark"
    ];
    
    var gameOverFlag = false;
    var gameSet = GAME_SET["15x15"];
    var lives = 2;
    var seconds = 0;
    var timer;
    var ghostTimer;
    var ghosts = [];
    var recordBuffer = [];
    var currentPosition = { x: -1, y: -1 };
    var eventBuffer = [];
    
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
        clearInterval(ghostTimer);
        $('.grid').each((_, el) => {
            if ($(el).data('number') === -1) {
                $(el).addClass('mine').addClass('opened');
            }
        });
        $('.ghost-cursor').hide(ANIMATE_DURATION, function() {
            $(this).addClass('invisible');
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

    var recordFrame = function() {
        recordBuffer.push({
            x: currentPosition.x,
            y: currentPosition.y,
            e: eventBuffer.shift()
        });
    }

    var replayFrame = function(ghost, time) {
        let record = ghost.records[time];
        $(ghost.id).css({ top: record.y, left: record.x });
        $(ghost.timeId).text(((ghost.records.length - time) * REPLAY_DURATION / 1000).toFixed(1));
        if (record.e) {
            const grid = $(record.e.id);
            switch (record.e.name) {
                case "open":
                    open(grid, false);
                    break;
                case "mark":
                    if (!grid.hasClass('marked')) {
                        mark(grid, false);
                    }
                    break;
                case "unmark":
                    if (grid.hasClass('marked')) {
                        mark(grid, false);
                    } 
                    break;
                case "die":
                    if (!grid.hasClass('opened') && !grid.hasClass('marked')) {
                        grid.addClass('tomb');
                    }
                    break;
                default:
                    break;
            }
        }
    }

    // Verbose code to reduce operations in loop
    var resetGhostTimer = function(shouldRecord, shouldReplay) {
        if (shouldRecord && !shouldReplay) {
            // Check ghosts for the edge case of hitting mine at the first move.
            if (ghosts.length === 0) {
                clearInterval(ghostTimer);
                ghostTimer = setInterval(recordFrame, REPLAY_DURATION);
            }
            return;
        }
        if (shouldRecord && shouldReplay) {
            clearInterval(ghostTimer);
            let t = 0, ghostsCopy = ghosts.slice();
            ghostsCopy.forEach(ghost => $(ghost.id).removeClass('invisible'));

            ghostTimer = setInterval(() => {
                recordFrame();
                let g = ghostsCopy.length;
                while (g--) {
                    if (ghostsCopy[g].records[t]) {
                        replayFrame(ghostsCopy[g], t);
                    } else {
                        $(ghostsCopy[g].id).hide(ANIMATE_DURATION, function() {
                            $(this).addClass('invisible');
                        });
                        ghostsCopy.splice(g, 1);
                    }
                }
                t++;
            }, REPLAY_DURATION);
            return;
        }
        if (!shouldRecord && shouldReplay) {
            clearInterval(ghostTimer);
            let t = 0, ghostsCopy = ghosts.slice();
            ghostsCopy.forEach(ghost => $(ghost.id).removeClass('invisible'));
             
            ghostTimer = setInterval(() => {
                let g = ghostsCopy.length;
                while (g--) {
                    if (ghostsCopy[g].records[t]) {
                        replayFrame(ghostsCopy[g], t);
                    } else {
                        $(ghostsCopy[g].id).hide(ANIMATE_DURATION, function() {
                            $(this).addClass('invisible');
                        });
                        ghostsCopy.splice(g, 1);
                    }
                }
                if (ghostsCopy.length === 0) {
                    clearInterval(ghostTimer);
                }
                t++;
            }, REPLAY_DURATION);
        }
    }

    var addGhost = function(tombId) {
        var num = gameSet.live_num - lives;
        $('#ghost-num').text(num);
        var id = "ghost" + (num - 1);
        recordBuffer.push({
            x: currentPosition.x,
            y: currentPosition.y,
            e: { id: tombId, name: "die" }
        });
        ghosts.push({ id: "#" + id, timeId: "#" + id + "-time", records: recordBuffer });
        recordBuffer = [];

        $('<div id="' + id + '" class="ghost-cursor d-flex align-items-start invisible">'
            + '<img src="images/mouse1.png">'
            + '<div id="' + id + '-time" class="' + ghostColors[num % ghostColors.length] + ' rounded mt-3 px-1"></div></div>')
            .appendTo('#field-container');
    }

    var resetField = function() {
        $('.grid').text("");
        $('.opened').removeClass('opened');
        $('.marked').removeClass('marked');
        $('.mine').removeClass('mine');
        $('.exploded').removeClass('exploded');
        $('.tomb').removeClass('tomb');
        $('#mine-num').text(gameSet.mine_num);
        $('#time').text(0);
        seconds = 0;
    }
    
    var open = function(grid, shouldRecord) {
        if (grid.hasClass('opened') || grid.hasClass('marked') || grid.hasClass('tomb')) {
            return;
        }
        grid.addClass('opened');
        let number = grid.data('number');
        if (number === -1) {
            lives--;
            $('#live-num').text(lives);
            grid.addClass('mine').addClass('exploded');
            if (lives === 0) {
                // All lives gone. Really gameover.
                $('#result').text("You Lose!");
                gameover();
            } else {
                // Lost one live. Continue.
                gameOverFlag = true;
                clearInterval(ghostTimer);
                addGhost("#" + grid.attr('id'));
                $('<div class="grid mine exploded position-absolute"></div>')
                    .css({ top: grid.position().top, left: grid.position().left })
                    .appendTo("#field-container")
                    .animate({
                        width: "425px", height: "425px", 
                        top: (grid.position().top - 200) + "px", 
                        left: (grid.position().left - 200) + "px", 
                        opacity: 0 }, ANIMATE_DURATION * 2, function() {
                        $(this).remove();
                        gameOverFlag = false;
                        resetField();
                        // No need to record for the last live.
                        resetGhostTimer(lives > 1, true);
                    });
            }
            return;
        }
    
        checkWin();

        if (shouldRecord) eventBuffer.push({ id: "#" + grid.attr('id'), name: 'open' });

        if (number > 0) {
            grid.text(number);
            return;
        }
        // number === 0
        for (let nearByGrid of nearbyGrids(grid)) {
            open(nearByGrid, false);
        }
    }
    
    var mark = function(grid, shouldRecord) {
        if (grid.hasClass('opened')) {
            return;
        }
        grid.removeClass('tomb');
        if (!grid.hasClass('marked') && gameSet.mine_num === $('.marked').length) {
            return;
        }
        if (shouldRecord) eventBuffer.push({ id: "#" + grid.attr('id'), name: grid.hasClass('marked') ? 'unmark' : 'mark' });
        grid.toggleClass('marked');
        $('#mine-num').text(gameSet.mine_num - $('.marked').length);
    }
    
    var mouseup = function(event) {
        if (gameOverFlag) {
            return;
        }
        switch (event.which) {
            case 1:
                open($(this), true);
                break;
            case 3:
                mark($(this), true);
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
    }
    
    var reset = function() {
        gameOverFlag = false;
        lives = gameSet.live_num;
        seconds = 0;
        clearInterval(timer);
        clearInterval(ghostTimer);
        currentPosition.x = -1;
        currentPosition.y = -1;
        eventBuffer.length = 0;
        ghosts.length = 0;
        recordBuffer.length = 0;
        ghostColors = shuffle(ghostColors);
    
        $('#mine-num').text(gameSet.mine_num);
        $('#live-num').text(gameSet.live_num);
        $('#ghost-num').text(0);
        $('#time').text(0);
        $('#result').text('');
        $('.ghost-cursor').remove();
        init();
        $('#field')
            .off()
            .on('mousemove', (event) => {
                currentPosition.x = event.pageX;
                currentPosition.y = event.pageY;
            })
            .one('mouseup', () => {
                timer = setInterval(() => {
                    seconds++;
                    $('#time').text(seconds);
                }, 1000);
                resetGhostTimer(true, false);
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
        $('#b15x15').on('click', setGame("15x15"));
        $('#b30x15').on('click', setGame("30x15"));
        $('#b30x30').on('click', setGame("30x30"));
        $('#b10lives').on('click', setGame("10lives"));
        setGame("15x15")();
    }
    
    $(document).ready(main);
// })();
