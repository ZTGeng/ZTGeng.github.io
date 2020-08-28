/**
 * @version 0.2
 * @author Geng
 */

var BG_COLORS = ["yellow", "aqua", "red", "green", "orange", "blue", "purple"];
var ROW_NUM = 20;
var COL_NUM = 10;
var INIT_R = 0;
var INIT_C = 3;

var SPEEDS = [1200, 800, 600, 500, 400, 300, 250, 200, 150, 120]; //milliseconds
var SPEED_THRESHOLD = 30; //lines
var ANIMATE_DURATION = 40; //milliseconds
var NEW_BLOCK_SCORE = 10;
var REMOVE_LINE_SCORE = 50;

var BLOCKS = [
    {
        shapes: [
            [ [0, 0], [0, 1], [1, 0], [1, 1] ],
            [ [0, 0], [0, 1], [1, 0], [1, 1] ],
            [ [0, 0], [0, 1], [1, 0], [1, 1] ],
            [ [0, 0], [0, 1], [1, 0], [1, 1] ]
        ],
        color: 0
        // [][]
        // [][]
    },
    {
        shapes: [
            [ [0, 0], [0, 1], [0, 2], [0, 3] ],
            [ [-1, 1], [0, 1], [1, 1], [2, 1] ],
            [ [0, 0], [0, 1], [0, 2], [0, 3] ],
            [ [-1, 1], [0, 1], [1, 1], [2, 1] ]
        ],
        color: 1
        // [][][][]
    },
    {
        shapes: [
            [ [0, 0], [0, 1], [1, 1], [1, 2] ],
            [ [0, 1], [1, 0], [1, 1], [2, 0] ],
            [ [0, 0], [0, 1], [1, 1], [1, 2] ],
            [ [0, 1], [1, 0], [1, 1], [2, 0] ]
        ],
        color: 2
        // [][]
        //   [][]
    },
    {
        shapes: [
            [ [0, 1], [0, 2], [1, 0], [1, 1] ],
            [ [0, 0], [1, 0], [1, 1], [2, 1] ],
            [ [0, 1], [0, 2], [1, 0], [1, 1] ],
            [ [0, 0], [1, 0], [1, 1], [2, 1] ]
        ],
        color: 3
        //   [][]
        // [][]
    },
    {
        shapes: [
            [ [0, 0], [0, 1], [0, 2], [1, 0] ],
            [ [0, 0], [0, 1], [1, 1], [2, 1] ],
            [ [0, 2], [1, 0], [1, 1], [1, 2] ],
            [ [0, 0], [1, 0], [2, 0], [2, 1] ]
        ],
        color: 4
        // [][][]
        // []
    },
    {
        shapes: [
            [ [0, 0], [0, 1], [0, 2], [1, 2] ],
            [ [0, 1], [1, 1], [2, 0], [2, 1] ],
            [ [0, 0], [1, 0], [1, 1], [1, 2] ],
            [ [0, 0], [0, 1], [1, 0], [2, 0] ]
        ],
        color: 5
        // [][][]
        //     []
    },
    {
        shapes: [
            [ [0, 0], [0, 1], [0, 2], [1, 1] ],
            [ [0, 1], [1, 0], [1, 1], [2, 1] ],
            [ [0, 1], [1, 0], [1, 1], [1, 2] ],
            [ [0, 0], [1, 0], [1, 1], [2, 0] ]
        ],
        color: 6
        // [][][]
        //   []
    }
];

var timer;

var hiScore = 0, score = 0, speed = 0, removeNum = 0, blockNum = 0;

var isPaused = false;
var isMovable = false;

var block = {
    r: 0,
    c: 0,
    shape: 0,
    iBlock: 0,
    iShape: 0,
    color: 0,
    isAlive: false
};
var nextBlock = 0;

var newNextBlock = function() {
    nextBlock = Math.floor(Math.random() * BLOCKS.length);
    //draw next block
    $(".grid_next").removeClass(BG_COLORS);
    var nextShape = BLOCKS[nextBlock].shapes[0];
    var nextColor = BLOCKS[nextBlock].color;
    for (var i = 0; i < nextShape.length; i++) {
        $('#n' + (nextShape[i][0]) + '_' + (nextShape[i][1])).addClass(BG_COLORS[nextColor]);
    }
}

var isGridOpen = function(r, c) {
    if (r < 0 || r >= ROW_NUM) return false;
    if (c < 0 || c >= COL_NUM) return false;
    return !$('#g' + r + '_' + c).hasClass('dead-block');
}

var isShapeOpen = function(r, c, shape) {
    for (var i = 0; i < shape.length; i++) {
        if (!isGridOpen(r + shape[i][0], c + shape[i][1])) return false;
    }
    return true;
}

var canBlockMoveTo = function(deltaR, deltaC) {
    return isShapeOpen(block.r + deltaR, block.c + deltaC, block.shape);
}

var canBlockRotate = function() {
    return isShapeOpen(block.r, block.c, BLOCKS[block.iBlock].shapes[(block.iShape + 1) % 4]);
}

var drawBlock = function() {
    // console.log("draw" + block.r + ", " + block.c);
    for (var i = 0; i < block.shape.length; i++) {
        $('#g' + (block.r + block.shape[i][0]) + '_' + (block.c + block.shape[i][1])).addClass(BG_COLORS[block.color]).addClass("block");
    }
}

var cleanBlock = function() {
    // console.log("clear " + block.r + ", " + block.c);
    $(".block").removeClass(BG_COLORS[block.color]).removeClass("block");
}

var newBlock = function() {
    // console.log("newBlock");
    isMovable = false;

    block.r = INIT_R;
    block.c = INIT_C;
    block.shape = BLOCKS[nextBlock].shapes[0];
    block.iBlock = nextBlock;
    block.iShape = 0;
    block.color = BLOCKS[nextBlock].color;

    //draw block
    drawBlock();

    newNextBlock();

    //game check
    if (!isShapeOpen(block.r, block.c, block.shape)) {
        //game over
        // console.log("GAME OVER");
        $(document).off("keydown");
        clearInterval(timer);
        $(".block").addClass("dead-block").removeClass("block");
        if (score > hiScore) {
            hiScore = score;
            $("#hi-score").text(hiScore);
        }
    } else {
        block.isAlive = true;
        isMovable = true;
        blockNum++;
        $("#blocks").text(blockNum);
    }
}

var canRemoveRow = function(r) {
    for (var c = 0; c < COL_NUM; c++) {
        if (!$('#g' + r + '_' + c).hasClass("dead-block")) return false;
    }
    return true;
}

var removeRow = function(r, callback) {
    removeNum++;
    $("#remove").text(removeNum);
    score += REMOVE_LINE_SCORE;
    $("#score").text(score);
    //adjust speed
    if (speed < SPEEDS.length - 1 && Math.floor(removeNum / SPEED_THRESHOLD) > speed) {
        speed++;
        $("#speed").text(speed);
        resetTimer();
    }
    var c = 0;
    var cleanGrid = () => {
        if (c < COL_NUM) {
            // console.log("clean " + r + ", " + c);
            $('#g' + r + '_' + c).removeClass(BG_COLORS).removeClass("dead-block");
            c++;
            setTimeout(cleanGrid, ANIMATE_DURATION);
        } else {
            var ri = r;
            var stop = false;
            while (ri > 0 && !stop) {
                stop = true;
                for (var ci = 0; ci < COL_NUM; ci++) {
                    $('#g' + ri + '_' + ci).attr("class", $('#g' + (ri - 1) + '_' + ci).attr("class"));
                    if ($('#g' + ri + '_' + ci).hasClass("dead-block")) stop = false;
                }
                ri--;
            }
            if (!stop) {
                $("#row0").children().removeClass(BG_COLORS).removeClass("dead-block");
            }
            callback();
        }
    };
    cleanGrid();
}

var tryMoveBlock = function(deltaR, deltaC) {
    // console.log("try move to: " + deltaR + ", " + deltaC);
    isMovable = false;
    if (canBlockMoveTo(deltaR, deltaC)) {
        cleanBlock();
        block.r += deltaR;
        block.c += deltaC;
        drawBlock();
    }
    isMovable = true;
}

/** return: true if dropped; false if not */
var tryDropBlock = function() {
    isMovable = false;

    //alive check
    if (canBlockMoveTo(1, 0)) {
        // console.log("tryDrop true");
        cleanBlock();
        block.r++;
        drawBlock();
        isMovable = true;
        return true;
    }

    isPaused = true;
    // console.log("tryDrop false");
    block.isAlive = false;
    $(".block").addClass("dead-block").removeClass("block");
    score += NEW_BLOCK_SCORE;
    $("#score").text(score);

    //remove check
    var rowsToRemove = [];
    for (var r = -1, i = 0; i < block.shape.length; i++) {
        var ri = block.r + block.shape[i][0];
        if (ri === r) continue;
        r = ri;
        if (canRemoveRow(r)) {
            rowsToRemove.push(r);
        }
    }
    if (rowsToRemove.length === 0) {
        newBlock();
        isPaused = false;
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

    return false;
}

var bottomDropBlock = function() {
    while (tryDropBlock());
}

var tryRotateBlock = function() {
    isMovable = false;
    if (canBlockRotate()) {
        cleanBlock();
        block.iShape = (block.iShape + 1) % 4;
        block.shape = BLOCKS[block.iBlock].shapes[block.iShape];
        drawBlock();
    }
    isMovable = true;
}

var resetTimer = function() {
    clearInterval(timer);
    timer = setInterval(() => {
        if (isPaused) return;
        // console.log("tik");
        tryDropBlock();
    }, SPEEDS[speed]);
}

var keydownEvent = (event) => {
    if (!isMovable) return false;
    isMovable = false;
    switch (event.which) {
        case 32: //space
            bottomDropBlock();
            break;
        case 37: //left
            // console.log("left")
            tryMoveBlock(0, -1);
            break;
        case 38: //up
            tryRotateBlock();
            break;
        case 39: //right
            // console.log("right")
            tryMoveBlock(0, 1);
            break;
        case 40: //down
            tryMoveBlock(1, 0);
            break;
        default:
            break;
    }
    // isMovable = true;
    return false;
}

var game = function() {
    $(document).keydown(keydownEvent);
    //set next block, put new block
    nextBlock = Math.floor(Math.random() * 7);
    newBlock();

    resetTimer();

    isMovable = true;
}

var reset = function() {
    clearInterval(timer);
    $(".grid").removeClass(BG_COLORS).removeClass(["block", "dead-block"]);
    $(".grid_next").removeClass(BG_COLORS).removeClass(["block", "dead-block"]);

    score = 0;
    speed = 0;
    removeNum = 0;
    blockNum = 0;

    $("#score").text(score);
    $("#speed").text(speed);
    $("#remove").text(removeNum);
    $("#blocks").text(blockNum);

    $(document).off("keydown");
}

var main = function() {
    for (var ri = 0; ri < ROW_NUM; ri++) {
        var row = $('<div id="row' + ri + '" class="row no-gutters row-cols-10"></div>').appendTo($('#field'));
        for (var ci = 0; ci < COL_NUM; ci++) {
            var grid = $('<div id="g' + ri + '_' + ci + '" class="grid col border border-light"></div>').appendTo(row);
        }
    }

    var row_next_0 = $('<div class="row no-gutters row-cols-4"></div>').appendTo($('#next'));
    for (var i = 0; i < 4; i++) {
        var grid = $('<div id="n0_' + i + '" class="grid_next col border border-light"></div>').appendTo(row_next_0);
    }
    var row_next_1 = $('<div class="row no-gutters row-cols-4"></div>').appendTo($('#next'));
    for (var i = 0; i < 4; i++) {
        var grid = $('<div id="n1_' + i + '" class="grid_next col border border-light"></div>').appendTo(row_next_1);
    }

    $("#start").on('click', () => {
        reset();
        game();
    });
}

$(document).ready(main);
