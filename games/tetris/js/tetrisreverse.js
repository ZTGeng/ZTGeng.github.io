/**
 * @version 0.1
 * @author Geng
 */

var BG_COLORS = ["yellow", "aqua", "red", "green", "orange", "blue", "purple"];
var ROW_NUM = 20;
var COL_NUM = 10;
var INIT_C = 3;
var NEW_BLOCK_SCORE = 10;
var REMOVE_LINE_SCORE = 50;
var SPEED_THRESHOLD = 50; //lines
var ANIMATE_DURATION = 40; //milliseconds
var SPEEDS = [10000, 8000, 5000];

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

var block = {
  r: 0,
  c: 0,
  shape: 0,
  iBlock: 0,
  iShape: 0,
  color: 0
};
var nextBlock = 0;

var isPaused = false;
var isMovable = false;

var isColValid = function (c, shape) {
  for (var i = 0; i < shape.length; i++) {
    var ci = c + shape[i][1];
    if (ci < 0 || ci >= COL_NUM) return false;
  }
  return true;
}

var isBlockAllFilled = function () {
  for (var i = 0; i < block.shape.length; i++) {
    if ($('#g' + (block.r + block.shape[i][0]) + '_' + (block.c + block.shape[i][1])).hasClass("open")) return false;
  }
  return true;
}

var newNextBlock = function () {
  nextBlock = Math.floor(Math.random() * BLOCKS.length);
  //draw next block
  $(".grid_next").removeClass(BG_COLORS);
  var nextShape = BLOCKS[nextBlock].shapes[0];
  var nextColor = BLOCKS[nextBlock].color;
  for (var i = 0; i < nextShape.length; i++) {
      $('#n' + (nextShape[i][0]) + '_' + (nextShape[i][1])).addClass(BG_COLORS[nextColor]);
  }
}

var cleanBlock = function () {
  $(".block").removeClass(BG_COLORS[block.color]).removeClass("block");
}

var drawBlock = function () {
  for (var i = 0; i < block.shape.length; i++) {
    $('#g' + (block.r + block.shape[i][0]) + '_' + (block.c + block.shape[i][1])).addClass(BG_COLORS[block.color]).addClass("block");
  }
}

//giving block.c ready, find proper block.r
var positionBlock = function () {
  var rmin = 0, rmax = 0;
  for (var i = 0; i < block.shape.length; i++) {
    if (block.shape[i][0] < rmin) rmin = block.shape[i][0];
    if (block.shape[i][0] > rmax) rmax = block.shape[i][0];
  }
  for (var ri = -rmin; ri < ROW_NUM - rmax; ri++) {
    block.r = ri;
    if (isBlockAllFilled()) break;
  }
}

var newBlock = function () {
  // console.log("newBlock");

  block.c = INIT_C;
  block.shape = BLOCKS[nextBlock].shapes[0];
  block.iBlock = nextBlock;
  block.iShape = 0;
  block.color = BLOCKS[nextBlock].color;

  positionBlock();
  drawBlock();

  newNextBlock();
}

var gameover = function () {
  console.log("GAME OVER!");
  $(document).off("keydown");
  clearInterval(timer);
  if (score > hiScore) {
      hiScore = score;
      $("#hi-score").text(hiScore);
  }
}

var growth = function () {
  // if (!isMovable) console.log("growth bad time");
  isMovable = false;
  if ($("#row0").children().hasClass("filled")) {
    gameover();
    return;
  }
  var shouldMoveBlock = isBlockAllFilled();
  if (!shouldMoveBlock) {
    cleanBlock();
  }
  for (var ri = 0; ri < ROW_NUM - 1; ri++) {
    for (var ci = 0; ci < COL_NUM; ci++) {
      $('#g' + ri + '_' + ci).attr("class", $('#g' + (ri + 1) + '_' + ci).attr("class"));
    }
  }
  $('#row' + (ROW_NUM - 1)).children().removeClass(BG_COLORS).removeClass(["block", "open"]).addClass("filled");
  if (shouldMoveBlock) {
    block.r--;
  } else {
    drawBlock();
  }

  isMovable = true;
}

var tryMoveBlock = function (deltaC) {
  isMovable = false;
  if (isColValid(block.c + deltaC, block.shape)) {
    cleanBlock();
    block.c += deltaC;
    positionBlock();
    drawBlock();
  }
  isMovable = true;
}

var tryRotateBlock = function () {
  isMovable = false;
  var newShape = (block.iShape + 1) % 4;
  if (isColValid(block.c, BLOCKS[block.iBlock].shapes[newShape])) {
    cleanBlock();
    block.iShape = newShape;
    block.shape = BLOCKS[block.iBlock].shapes[block.iShape];
    positionBlock();
    drawBlock();
  }
  isMovable = true;
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
  var c = 1;
  var color = BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)];
  var cleanGrid = () => {
    if (c < COL_NUM) {
      // console.log("clean " + r + ", " + c);
      $('#g' + r + '_' + (c - 1)).removeClass(color);
      $('#g' + r + '_' + c).addClass(color);
      c++;
      setTimeout(cleanGrid, ANIMATE_DURATION);
    } else {
      $('#g' + r + '_' + (c - 1)).removeClass(color);
      var ri = r;
      while (ri > 0) {
        for (var ci = 0; ci < COL_NUM; ci++) {
          $('#g' + ri + '_' + ci).attr("class", $('#g' + (ri - 1) + '_' + ci).attr("class"));
        }
        ri--;
      }
      $("#row0").children().removeClass(BG_COLORS).removeClass("filled").addClass("open");
      callback();
    }
  };
  $('#g' + r + '_0').addClass(color);
  setTimeout(cleanGrid, ANIMATE_DURATION);
}

var tryOpenBlock = function () {
  isPaused = true;
  isMovable = false;

  if (!isBlockAllFilled()) {
    isPaused = false;
    isMovable = true;
    return;
  }

  $(".block").removeClass("filled").addClass("open");
  cleanBlock();

  blockNum++;
  $("#blocks").text(blockNum);
  score += NEW_BLOCK_SCORE;
  $("#score").text(score);

  var rowsToRemove = [];
  for (var r = -1, i = 0; i < block.shape.length; i++) {
    var ri = block.r + block.shape[i][0];
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

var resetTimer = function () {
  console.log("reset");
  clearInterval(timer);
  timer = setInterval(() => {
    if (isPaused) {
      console.log("pause! try again.");
      clearInterval(timer);
      setTimeout(resetTimer, 1000);
    } else {
      growth();
    }
  }, SPEEDS[speed]);
}

var keydownEvent = (event) => {
  if (!isMovable) {
    console.log("can not move");
    return false;
  }
  isMovable = false;
  switch (event.which) {
    case 32: //space
      tryOpenBlock();
      break;
    case 37: //left
          // console.log("left")
      tryMoveBlock(-1);
      break;
    case 38: //up
      tryRotateBlock();
      break;
    case 39: //right
          // console.log("right")
      tryMoveBlock(1);
      break;
    case 40: //down

      break;
    default:
      break;
  }
  // isMovable = true;
  return false;
}

var game = function () {
  console.log("GAME START");

  for (var r = ROW_NUM - 4; r < ROW_NUM; r++) {
    $('#row' + r).children().removeClass(["open"]).addClass("filled");
  }

  nextBlock = Math.floor(Math.random() * 7);
  newBlock();

  $(document).keydown(keydownEvent);

  resetTimer();

  isMovable = true;
}

var reset = function () {
  clearInterval(timer);
  $(".grid").removeClass(BG_COLORS).removeClass(["block", "filled"]).addClass("open");
  $(".grid_next").removeClass(BG_COLORS).removeClass("block");

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

var main = function () {
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