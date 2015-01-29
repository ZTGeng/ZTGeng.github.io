/**
 * @version 0.31
 * @author Geng
 */
var grids;		// grids = $('.grid');
var cat0, cat1;	// cat? = $('<div id="cat"></div>').appendTo($('.field'));
var catPos0 = 39;
var catPos1 = 41;
var step = 0;
var oneStep = false;
// var cat0Stop = false;
// var cat1Stop = false;

/**
 * 点击格子，若未打开也未被猫占据，则标记为打开，回合数加1，并依次判断：
 * 若猫格周围没有未打开的格子（choices长度为0），则游戏结束，玩家获胜
 * 否则，猫移动一步
 * 若猫进入边缘格子，则游戏结束，玩家失败
 * 否则，更新提示文字
 */
var open = function() {
	if ($(this).hasClass('opened') || $(this).hasClass('occupied')) {
		return;
	}
	$(this).addClass('opened');
	
	// 每回合打开两个格。打开第一个格后不做任何操作
	oneStep = !oneStep;
	if (oneStep) return;
	
	// 打开第二个格后，更新计数器，猫开始移动
	step++;

	var choices0 = around(catPos0);
	var choices1 = around(catPos1);
	
	if (choices0.length === 0 && choices1.length === 0) {
		$('.occupied').addClass('end');
		$('.result').text("你在第 " + step + " 步抓住了猫！");
		$('.field').off();
		return;
	}
	
	if (choices0.length !== 0) {
		catMove(0, findPath(choices0));
		choices1 = around(catPos1); // around针对猫所在位置的更新无需等待动画结束
		if (choices1.length !== 0) {
			catMove(1, findPath(choices1));
		}
	} else {
		catMove(1, findPath(choices1));
		choices0 = around(catPos0);
		if (choices0.length !== 0) {
			catMove(0, findPath(choices0));
		}
	}
	if ($(grids[catPos0]).hasClass('out') || $(grids[catPos1]).hasClass('out')) {
		$('.result').text("猫在第 " + step + " 步成功逃跑了！");
		$('.field').off();
		return;
	}
	
	$('.result').text("你已经用了 " + step + " 步还没抓住猫！");
};

/**
 * 广度优先计算从猫格出发距离边缘最近的路径
 * 返回该路径起始格的序列号
 */
var findPath = function(choices) {
	// choices当前为紧邻猫格、未打开的格子序列号组成的数组，choices长度保证大于0
	// 在函数执行中，新路径上的格子不断加入choices中，执行先入先出规则
	// originals数组与choices同步更新，对新加入choices中的格子，记录其所在路径的起始格序列号
	// touched数据记录目前为止访问过的格子，防止同一个格重复加入choices
	var originals = choices.slice();
	var touched = choices.slice();
	//touched.push(catPos);
	var next, original;
	// 每次循环，从choices前部出队一个格子，记为next
	// 如果next位于边缘，结束循环，返回其在originals中对应的起始格序列号
	// 否则，将该起始格出队，记为original
	// 列出紧邻next、未被打开或被猫占据的格子序列号，其中未访问过的格子由后部入队choices
	// 同步更新originals，加入original。同时更新touched，加入新格序列号
	// 如果choices数组为空，则没有通向边缘的路径，结束循环，返回original当前值
	// choices初始长度大于0保证循环至少被执行一次，因此也保证original不为undefine
	while (choices.length > 0) {
		next = choices.shift();
		if ($(grids[next]).hasClass('out'))
			return originals[0];
		original = originals.shift();
		around(next).forEach(function(each) {
			if (touched.indexOf(each) == -1) {
				choices.push(each);
				originals.push(original);
				touched.push(each);
			}
		});
	}
	return original;
};

/**
 * 将猫从当前位置移到序列号为newPos的格
 */
var catMove = function(catNum, newPos) {
	var cat, catPos;
	if (catNum === 0) {
		cat = cat0;
		catPos = catPos0;
		catPos0 = newPos;
	} else if (catNum === 1) {
		cat = cat1;
		catPos = catPos1;
		catPos1 = newPos;
	} else {
		alert("wrong param!!");
		return;
	}
	
	//$(grids[catPos]).removeClass('end');
	$(grids[catPos]).removeClass('occupied end');
	
	cat.show();
	cat.offset({
		left: $(grids[catPos]).position().left,
		top:  $(grids[catPos]).position().top
	});
	cat.animate({
		left: "+=" + ($(grids[newPos]).position().left - $(grids[catPos]).position().left) + "px",
		top:  "+=" + ($(grids[newPos]).position().top -  $(grids[catPos]).position().top) +  "px"
	}, 200, function() {
		cat.hide();
		$(grids[newPos]).addClass('occupied');
		
		checkMovable();
	});
	
	//catPos0 = newPos;
};

var checkMovable = function() {
	var choices0 = around(catPos0);
	if (choices0.length === 0) {
		$(grids[catPos0]).addClass('end');
	}
	var choices1 = around(catPos1);
	if (choices1.length === 0) {
		$(grids[catPos1]).addClass('end');
	}
};

/**
 * 返回一个数组，包含序列号为pos的格子周围紧邻的格子，去掉已打开的和猫占据的
 * 数组中的格子为顺时针顺序：左上，右上，右，右下，左下，左
 */
var around = function(pos) {
	var choices = [];
	var row = Math.floor(pos / 9);
	var col = pos % 9;
	
	if (row % 2 == 0) {
		if (row > 0) {
			if (col > 0)
				choices.push(pos - 10);
			choices.push(pos - 9);
		}
		if (col < 8)
			choices.push(pos + 1);
		if (row < 8) {
			choices.push(pos + 9);
			if (col > 0)
				choices.push(pos + 8);
		}
		if (col > 0)
			choices.push(pos - 1);
	} else {
		choices.push(pos - 9);
		if (col < 8) {
			choices.push(pos - 8);
			choices.push(pos + 1);
			choices.push(pos + 10);
		}
		choices.push(pos + 9);
		if (col > 0)
			choices.push(pos - 1);
	}
	return choices.filter(function(each) {
		return !($(grids[each]).hasClass('opened') || each === catPos0 || each === catPos1);
	});
};

/**
 * 重新开始一局游戏
 */
var reset = function() {
	$('.occupied').removeClass('occupied');	// 重置被猫占据的格
	$('.end').removeClass('end');
	$('.opened').removeClass('opened');		// 重置所有已打开的格
	// 随机打开不多于8个格子，避开40号中央格
	for (var i = 0; i < 8; i++) {
		var random = Math.floor(Math.random() * 81);
		if (random != 39 && random != 41)
			$(grids[random]).addClass('opened');
	}
	// 39、41号中央格标记为被猫占据，重置猫的位置变量、猫的图像位置
	// 重置猫的图像为站立的猫
	$(grids[39]).addClass('occupied');
	$(grids[41]).addClass('occupied');
	catPos0 = 39;
	catPos1 = 41;
	cat0.stop().hide();
	cat1.stop().hide();
	// 重置所有格子的点击事件监听
	$('.field').off().on("click", '.grid', open);
	// 重置提示文字和回合数变量
	$('.result').text("抓猫开始！");
	step = 0;
	oneStep = false;
};

/**
 * 主方法。初始化游戏元素
 */
var main = function() {
	// 产生9x9个格子，添加类名'grid'，全部储存入变量grids
	for (var i = 0; i < 9; i++) {
		var row = $('<div></div>').appendTo($('.field'));
		if (i % 2 == 0)
			row.addClass('oddrow');
		else
			row.addClass('evenrow');
		for (var j = 0; j < 9; j++) {
			var grid = $('<div class="grid"></div>').appendTo(row);
			if (i === 0 || i === 8 || j === 0 || j === 8)
				grid.addClass('out');
		}
	}
	grids = $('.grid');
	// 产生猫的图像格子，添加类名'cat'，储存入变量cat
	cat0 = $('<div id="cat"></div>').appendTo($('.field'));
	cat1 = $('<div id="cat"></div>').appendTo($('.field'));
	// 给重置按钮添加点击事件，并触发一次
	$('.reset').on('click', reset);
	$('.reset').trigger('click');
};

$(document).ready(main);
