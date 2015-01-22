/**
 * @version 0.21
 * @author Geng
 */
var grids;		// grids = $('.grid');
var cat;		// cat = $('<div id="cat"></div>').appendTo($('.field'));
var catPos = 40;
var step = 0;

/**
 * 点击格子，并依次判断：
 * 若格子被标记，则函数终止。否则继续
 * 若该格子为猫屎格，则回合数加1，游戏结束，玩家失败。否则继续
 * 若该格子已打开或被猫占据，则函数终止。否则继续
 * 将该格子标记为打开，回合数加1，显示周围猫屎数量
 * 若猫格周围没有未打开的格子（choices长度为0），则游戏结束，玩家获胜
 * 否则，猫移动一步
 * 若猫进入边缘格子，则游戏结束，玩家失败
 * 否则，更新提示文字
 */
var open = function() {
	if ($(this).hasClass('marked')) return;
	
	if ($(this).hasClass('poo')) {
		step++;
		$('.result').text("你在第 " + step + " 步踩到了猫屎！");
		$('.poo').addClass('showPoo');
		$('.field').off();
		return;
	}

	if ($(this).hasClass('opened') || $(this).hasClass('occupied')) {
		return;
	}

	$(this).addClass('opened');
	step++;
	showNum(grids.index(this));

	var choices = around(catPos).filter(function(each) {
		return !$(grids[each]).hasClass('poo');
	});
	if (choices.length == 0) {
		$('.result').text("你在第 " + step + " 步抓住了猫！");
		cat.css('background', 'url("images/cat2-30px.jpg")');
		$('.poo').addClass('showPoo');
		$('.field').off();
		return;
	}
	catMove(findPath(choices));		// choices长度大于0
	if ($(grids[catPos]).hasClass('out')) {
		$('.result').text("猫在第 " + step + " 步成功逃跑了！");
		$('.poo').addClass('showPoo');
		$('.field').off();
		return;
	}
	$('.result').text("你已经用了 " + step + " 步还没抓住猫！");
};

/**
 * 标记或取消标记一个未打开、为被猫占据的格子
 */
var mark = function() {
	if ($(this).hasClass('opened') || $(this).hasClass('occupied')) {
		return false;
	}
	
	$(this).toggleClass('marked');
	return false;
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
	var checked = choices.slice();
	checked.push(catPos);
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
		original = originals.shift();

		if ($(grids[next]).hasClass('poo'))
			continue;
		if ($(grids[next]).hasClass('out'))
			return original;

		around(next).forEach(function(each) {
			if (checked.indexOf(each) == -1) {
				choices.push(each);
				originals.push(original);
				checked.push(each);
			}
		});
	}
	return original;
};

/**
 * 将猫从当前位置移到序列号为newPos的格
 * 若newPos格已被标记，则清除标记
 */
var catMove = function(newPos) {
	catAnime(catPos, newPos);
	$(grids[catPos]).removeClass('occupied');
	$(grids[newPos]).addClass('occupied');
	$(grids[newPos]).removeClass('marked');
	catPos = newPos;
};

/**
 * 猫移动的动画特效
 */
var catAnime = function(pos1, pos2) {
	var position1 = $(grids[pos1]).position();
	var position2 = $(grids[pos2]).position();
	cat.animate({
		left : "+=" + (position2.left - position1.left) + "px",
		top : "+=" + (position2.top - position1.top) + "px"
	}, 200);
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
		return !($(grids[each]).hasClass('opened') || $(grids[each]).hasClass('occupied'));
	});
};

/**
 * 计算序列号为pos的格子周围猫屎格的数量，若大于0则显示在格子上
 */
var showNum = function(pos) {
	var num = around(pos).filter(function(each) {
		return $(grids[each]).hasClass('poo');
	}).length;
	if (num > 0)
		$(grids[pos]).html("<p>" + num + "</p>");
};

/**
 * 重新开始一局游戏
 */
var reset = function() {
	$('.occupied').removeClass('occupied');	// 重置被猫占据的格
	$('.poo').removeClass('showPoo poo');	// 重置所有猫屎格
	$('.opened').removeClass('opened');		// 重置所有已打开的格
	$('.marked').removeClass('marked');		// 重置所有已标记的格
	grids.html("");							// 重置所有格子的显示文字（清空格子内容）
	// 随机将不多于8个格子设为猫屎格，避开40号中央格
	for (var i = 0; i < 8; i++) {
		var random = Math.floor(Math.random() * 81);
		if (random != 40)
			$(grids[random]).addClass('poo');
	}
	// 随机打开不多于8个格子，避开猫屎格和40号中央格
	for (var i = 0; i < 8; i++) {
		var random = Math.floor(Math.random() * 81);
		if (!(random == 40 || $(grids[random]).hasClass('poo'))) {
			$(grids[random]).addClass('opened');
			showNum(random);
		}
	}
	// 40号中央格标记为被猫占据，重置猫的位置变量、猫的图像位置
	// 重置猫的图像为站立的猫
	$(grids[40]).addClass('occupied');
	catPos = 40;
	cat.offset({
		left: $(grids[40]).position().left,
		top:  $(grids[40]).position().top
	});
	cat.css('background', 'url("images/cat1-30px.jpg")');
	// 重置所有格子的点击事件监听
	$('.field').off().on('click', '.grid', open).on('contextmenu', '.grid', mark);
	// 重置显示文字和回合数变量
	$('.result').text("抓猫开始！");
	step = 0;
};

/**
 * 主方法。初始化游戏元素
 */
var main = function() {
	// 产生9x9个格子，添加类名'grid'，全部储存入变量grids
	for (var i = 0; i < 9; i++) {
		var row = $('<div></div>').appendTo($('.field'));
		if (i % 2 == 0)
			row.addClass("oddrow");
		else
			row.addClass("evenrow");
		for (var j = 0; j < 9; j++) {
			$('<div class="grid"></div>').appendTo(row);
		}
	}
	grids = $('.grid');
	// 给边缘的格子添加类名'out'
	$('.grid:nth-child(9n)').addClass('out');
	$('.grid:nth-child(9n+1)').addClass('out');
	$('.grid:lt(8)').addClass('out');
	$('.grid:gt(72)').addClass('out');
	// 产生猫的图像格子，添加类名'cat'，储存入变量cat
	cat = $('<div id="cat"></div>').appendTo($('.field'));
	// 给重置按钮添加点击事件，并触发一次
	$('.reset').on('click', reset);
	$('.reset').trigger('click');
};

$(document).ready(main);
