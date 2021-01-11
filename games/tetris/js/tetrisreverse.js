/**
 * @version 0.3
 * @author Geng
 */

(function() {

    const ROW_NUM = 20;
    const COL_NUM = 10;
    const INIT_C = 3;
    const NEW_BLOCK_SCORE = 10;
    const REMOVE_LINE_SCORE = 50;
    const SPEED_THRESHOLD = 30; //lines
    const ANIMATE_DURATION = 40; //milliseconds
    const SPEEDS = [10, 8, 5, 4]; //seconds
    const SPEEDS_deprecated = [10000, 8000, 5000, 4000]; //milliseconds
    const COLORS = ["red", "orange", "blue", "purple", "yellow", "green", "aqua"]
    const BLOCKS = [
        {
            // [][]
            // [][]
            shapes: [
                [ [0, 0], [0, 1], [1, 0], [1, 1] ],
                [ [0, 0], [0, 1], [1, 0], [1, 1] ],
                [ [0, 0], [0, 1], [1, 0], [1, 1] ],
                [ [0, 0], [0, 1], [1, 0], [1, 1] ]
            ],
            color: 0
        },
        {
            // [][][][]
            shapes: [
                [ [0, 0], [0, 1], [0, 2], [0, 3] ],
                [ [-1, 1], [0, 1], [1, 1], [2, 1] ],
                [ [0, 0], [0, 1], [0, 2], [0, 3] ],
                [ [-1, 1], [0, 1], [1, 1], [2, 1] ]
            ],
            color: 1
        },
        {
            // [][]
            //   [][]
            shapes: [
                [ [0, 0], [0, 1], [1, 1], [1, 2] ],
                [ [0, 1], [1, 0], [1, 1], [2, 0] ],
                [ [0, 0], [0, 1], [1, 1], [1, 2] ],
                [ [0, 1], [1, 0], [1, 1], [2, 0] ]
            ],
            color: 2
        },
        {
            //   [][]
            // [][]
            shapes: [
                [ [0, 1], [0, 2], [1, 0], [1, 1] ],
                [ [0, 0], [1, 0], [1, 1], [2, 1] ],
                [ [0, 1], [0, 2], [1, 0], [1, 1] ],
                [ [0, 0], [1, 0], [1, 1], [2, 1] ]
            ],
            color: 3
        },
        {
            // [][][]
            // []
            shapes: [
                [ [0, 0], [0, 1], [0, 2], [1, 0] ],
                [ [0, 0], [0, 1], [1, 1], [2, 1] ],
                [ [0, 2], [1, 0], [1, 1], [1, 2] ],
                [ [0, 0], [1, 0], [2, 0], [2, 1] ]
            ],
            color: 4
        },
        {
            // [][][]
            //     []
            shapes: [
                [ [0, 0], [0, 1], [0, 2], [1, 2] ],
                [ [0, 1], [1, 1], [2, 0], [2, 1] ],
                [ [0, 0], [1, 0], [1, 1], [1, 2] ],
                [ [0, 0], [0, 1], [1, 0], [2, 0] ]
            ],
            color: 5
        },
        {
            // [][][]
            //   []
            shapes: [
                [ [0, 0], [0, 1], [0, 2], [1, 1] ],
                [ [0, 1], [1, 0], [1, 1], [2, 1] ],
                [ [0, 1], [1, 0], [1, 1], [1, 2] ],
                [ [0, 0], [1, 0], [1, 1], [2, 0] ]
            ],
            color: 6
        }
    ];

    const MUSIC = {
        bgm: document.createElement('audio'),
        gameover: document.createElement('audio'),
        remove: document.createElement('audio')
    }
    MUSIC.bgm.setAttribute('src', 'sounds/bgm_mario.mp3');
    MUSIC.bgm.loop = true;
    MUSIC.gameover.setAttribute('src', 'sounds/gameover.mp3');
    MUSIC.remove.setAttribute('src', 'sounds/remove.mp3');

    var hiScore = 0, score = 0, speed = 0, removeNum = 0, blockNum = 0;
    var isGaming = false;
    var isPaused = false;
    var isMovable = false;
    var isMuted = false;
    var timer;
    var nextBlock = 0;
    var currentBlock = {
        r: 0,
        c: 0,
        type: 0,
        rotate: 0,
        shape: function() {
            return BLOCKS[this.type].shapes[this.rotate];
        }
    };

    var drawBlock = function(r, c, block, rotate) {
        var shape = BLOCKS[block].shapes[rotate];
        var color = COLORS[BLOCKS[block].color];
        for (let i = 0; i < shape.length; i++) {
            $("#g" + (r + shape[i][0]) + "_" + (c + shape[i][1])).addClass(color).addClass("block");
        }
    }

    var cleanBlock = function () {
        $(".block").removeClass(COLORS).removeClass("block");
    }

    var isBlockFilled = function (r, c, shape) {
        for (let i = 0; i < shape.length; i++) {
            let ri = r + shape[i][0];
            if (ri < 0 || ri >= ROW_NUM) return false;
            let ci = c + shape[i][1];
            if (ci < 0 || ci >= COL_NUM) return false;
            if (!$('#g' + ri + '_' + ci).hasClass("filled")) return false;
        }
        return true;
    }

    var findTop = function(c, shape) {
        var rmax = 0;
        for (let i = 0; i < shape.length; i++) {
            if (shape[i][0] > rmax) rmax = shape[i][0];
        }
        for (let r = 0; r < ROW_NUM - rmax; r++) {
            if (isBlockFilled(r, c, shape)) return r;
        }
        return ROW_NUM - rmax - 1;
    }

    var isValid = function(c, shape) {
        for (let i = 0; i < shape.length; i++) {
            let ci = c + shape[i][1];
            if (ci < 0 || ci >= COL_NUM) return false;
        }
        return true;
    }

    var newBlock = function() {
        currentBlock.c = INIT_C;
        currentBlock.type = nextBlock;
        currentBlock.rotate = 0;
        currentBlock.r = findTop(INIT_C, currentBlock.shape())

        drawCurrentBlock();
        updateNext();
    }

    var updateNext = function() {
        nextBlock = Math.floor(Math.random() * BLOCKS.length);
        //draw next block
        $(".grid_next").removeClass(COLORS);
        var nextShape = BLOCKS[nextBlock].shapes[0];
        var nextColor = BLOCKS[nextBlock].color;
        for (let i = 0; i < nextShape.length; i++) {
            $('#n' + (nextShape[i][0]) + '_' + (nextShape[i][1])).addClass(COLORS[nextColor]);
        }
    }

    var removeRow = function(r, callback) {
        if (!isMuted) {
            MUSIC.remove.pause();
            MUSIC.remove.load();
            MUSIC.remove.play();
        }

        removeNum++;
        $("#remove").text(removeNum);
        score += REMOVE_LINE_SCORE;
        $("#score").text(score);

        //adjust speed
        if (speed < SPEEDS.length - 1 && Math.floor(removeNum / SPEED_THRESHOLD) > speed) {
            speed++;
            $("#speed").text(speed);
            // resetTimer_deprecated();
        }

        var c = 1;
        var color = COLORS[Math.floor(Math.random() * COLORS.length)];
        var cleanGrid = () => {
            if (c < COL_NUM) {
                $('#g' + r + '_' + (c - 1)).removeClass(color);
                $('#g' + r + '_' + c).addClass(color);
                c++;
                setTimeout(cleanGrid, ANIMATE_DURATION);
            } else {
                $('#g' + r + '_' + (c - 1)).removeClass(color);
                var ri = r;
                while (ri > 0) {
                    for (let ci = 0; ci < COL_NUM; ci++) {
                        $('#g' + ri + '_' + ci).attr("class", $('#g' + (ri - 1) + '_' + ci).attr("class"));
                    }
                    ri--;
                }
                $("#row0").children().removeClass(COLORS).removeClass("filled");
                callback();
            }
        };
        $('#g' + r + '_0').addClass(color);
        setTimeout(cleanGrid, ANIMATE_DURATION);
    }

    var raise = function() {
        isMovable = false;
        if ($("#row0").children().hasClass("filled")) {
            gameover();
            return;
        }
        var shouldMoveBlock = isCurrentBlockFilled();
        if (!shouldMoveBlock) {
            cleanBlock();
        }
        for (let ri = 0; ri < ROW_NUM - 1; ri++) {
            for (let ci = 0; ci < COL_NUM; ci++) {
                $('#g' + ri + '_' + ci).attr("class", $('#g' + (ri + 1) + '_' + ci).attr("class"));
            }
        }
        $('#row' + (ROW_NUM - 1)).children().removeClass(COLORS).removeClass("block").addClass("filled");
        if (shouldMoveBlock) {
            currentBlock.r--;
        } else {
            drawCurrentBlock();
        }

        isMovable = true;
    }

    var isCurrentBlockFilled = function() {
        return isBlockFilled(currentBlock.r, currentBlock.c, currentBlock.shape());
    }

    var drawCurrentBlock = function() {
        drawBlock(currentBlock.r, currentBlock.c, currentBlock.type, currentBlock.rotate);
    }

    var tryOpenBlock = function() {
        if (!isCurrentBlockFilled()) return;

        isPaused = true;
        isMovable = false;

        $(".block").removeClass("filled");
        cleanBlock();

        blockNum++;
        $("#blocks").text(blockNum);
        score += NEW_BLOCK_SCORE;
        $("#score").text(score);

        var rowsToRemove = [];
        var shape = currentBlock.shape();
        for (let r = -1, i = 0; i < shape.length; i++) {
            let ri = currentBlock.r + shape[i][0];
            if (ri === r) continue;
            r = ri;
            if (!$('#row' + r).children().hasClass("filled")) {
                rowsToRemove.push(r);
            }
        }
        if (rowsToRemove.length === 0) {
            newBlock();
            isPaused = false;
            isMovable = true;
        } else {
            var i = 0;
            var removeNext = () => {
                if (i < rowsToRemove.length) {
                    removeRow(rowsToRemove[i++], removeNext);
                } else {
                    newBlock();
                    isPaused = false;
                    isMovable = true;
                }
            };
            removeNext();
        }
    }

    var tryMoveBlock = function(deltaC) {
        isMovable = false;
        if (isValid(currentBlock.c + deltaC, currentBlock.shape())) {
            cleanBlock();
            currentBlock.c += deltaC;
            currentBlock.r = findTop(currentBlock.c, currentBlock.shape());
            drawCurrentBlock();
        }
        isMovable = true;
    }

    var tryRotateBlock = function() {
        isMovable = false;
        var rotate = (currentBlock.rotate + 1) % 4;
        if (isValid(currentBlock.c, BLOCKS[currentBlock.type].shapes[rotate])) {
            cleanBlock();
            currentBlock.rotate = rotate;
            currentBlock.r = findTop(currentBlock.c, currentBlock.shape());
            drawCurrentBlock();
        }
        isMovable = true;
    }

    var keydownEvent = function(event) {
        if (!isMovable) {
            return false;
        }
        switch (event.which) {
            case 32: //space
                tryOpenBlock();
                break;
            case 37: //left
                tryMoveBlock(-1);
                break;
            case 38: //up
                tryRotateBlock();
                break;
            case 39: //right
                tryMoveBlock(1);
                break;
            case 40: //down
                resetTimer();
                raise();
                break;
            default:
                break;
        }
        return false;
    }

    var resetTimer = function() {
        clearInterval(timer);
        let rise_countdown = SPEEDS[speed];
        $("#next-rise").text(rise_countdown);
        timer = setInterval(() => {
            if (isPaused) return;
            
            rise_countdown--;
            if (rise_countdown > 0) {
                $("#next-rise").text(rise_countdown);
            } else {
                resetTimer();
                raise();
            }
        }, 1000);
    }

    var resetTimer_deprecated = function() {
        clearInterval(timer);
        timer = setInterval(() => {
            if (isPaused) {
                clearInterval(timer);
                setTimeout(resetTimer_deprecated, 1000);
            } else {
                raise();
            }
        }, SPEEDS_deprecated[speed]);
    }

    var gameover = function() {
        isGaming = false;
        $(document).off("keydown");
        clearInterval(timer);
        
        $("#gameover").show();

        if (score > hiScore) {
            hiScore = score;
            $("#hi-score").text(hiScore);
        }

        if (!isMuted) {
            MUSIC.bgm.pause();
            MUSIC.gameover.play();
        }
    }

    var reset = function() {
        $("#gameover").hide();

        $(".grid").removeClass(COLORS).removeClass(["block", "filled"]);
        $(".grid_next").removeClass(COLORS).removeClass("block");

        score = 0;
        speed = 0;
        removeNum = 0;
        blockNum = 0;

        $("#score").text(score);
        $("#speed").text(speed);
        $("#remove").text(removeNum);
        $("#blocks").text(blockNum);
        $("#next-rise").text("");

        MUSIC.gameover.pause();
        MUSIC.bgm.pause();
        MUSIC.bgm.load();
    }

    var game = function() {
        for (let r = ROW_NUM - 4; r < ROW_NUM; r++) {
            $('#row' + r).children().addClass("filled");
        }

        nextBlock = Math.floor(Math.random() * 7);
        newBlock();

        $(document).off("keydown");
        $(document).keydown(keydownEvent);

        resetTimer();

        isGaming = true;
        isMovable = true;

        if (!isMuted) {
            MUSIC.bgm.play();
        }
    }

    var toggleMute = function() {
        if (isMuted) {
            isMuted = false;
            $("#muteIcon").attr('src', '../../octicons/svg/mute.svg');
            $("#mute").removeClass("active");
            if (isGaming) {
                MUSIC.bgm.load();
                MUSIC.bgm.play();
            }
        } else {
            isMuted = true;
            $("#muteIcon").attr('src', '../../octicons/svg/unmute.svg');
            $("#mute").addClass("active");
            MUSIC.bgm.pause();
            MUSIC.gameover.pause();
            MUSIC.remove.pause();
        }
    }

    var main = function() {
        $("#gameover").hide();

        for (let ri = 0; ri < ROW_NUM; ri++) {
            let row = $('<div id="row' + ri + '" class="row no-gutters row-cols-' + COL_NUM + '"></div>').appendTo($('#field'));
            for (let ci = 0; ci < COL_NUM; ci++) {
                let grid = $('<div id="g' + ri + '_' + ci + '" class="grid col border border-light"></div>').appendTo(row);
                grid.css('padding-bottom', (100 / COL_NUM) + '%');
            }
        }

        for (let ri = 0; ri < 2; ri++) {
            let row = $('<div class="row no-gutters row-cols-4"></div>').appendTo($('#next'));
            for (let ci = 0; ci < 4; ci++) {
                let grid = $('<div id="n' + ri + '_' + ci + '" class="grid_next col border border-light"></div>').appendTo(row);
                grid.css('padding-bottom', '25%');
            }
        }

        $("#start").on("click", () => {
            reset();
            game();
        });

        $("#mute").on('click', toggleMute);
    }

    $(document).ready(main);
})();