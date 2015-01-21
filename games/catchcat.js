/**
 * @version 0.1
 * @author Geng
 */
var grids;
var catPos = 40;
var step = 0;

var open = function() {
	if (!$(this).hasClass('opened') && !$(this).hasClass('occupied')) {
		$(this).addClass('opened');
		step++;
		
		var choices = around(catPos);
		if (choices.length == 0) {
			$('.result').text("你在第 " + step +" 步抓住了猫！");
			$('.occupied').addClass('end');
			$('.field').off();
			return;
		}
		catMove(findPath(choices));
		if ($(grids[catPos]).hasClass('out')) {
			$('.result').text("猫在第 " + step +" 步成功逃跑了！");
			$('.field').off();
			return;
		}
		$('.result').text("你已经用了 " + step +" 步还没抓住猫！");
	}
};

var findPath = function(choices) {
	var originals = choices.slice();
	var touched = choices.slice();
	touched.push(catPos);
	var next, original;
	while (choices.length > 0) {
		next = choices.shift();
		if ($(grids[next]).hasClass('out')) return originals[0];
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

var catMove = function(newPos) {
	$(grids[catPos]).removeClass('occupied');
	$(grids[newPos]).addClass('occupied');
	catPos = newPos;
};

var around = function(pos) {
	var choices = [];
	var row = Math.floor(pos / 9);
	var col = pos % 9;
	if (row % 2 == 0) {
		if (row > 0) {
			if (col > 0) choices.push(pos - 10);
			choices.push(pos - 9);
		}
		if (col < 8) choices.push(pos + 1);
		if (row < 8) {
			choices.push(pos + 9);
			if (col > 0) choices.push(pos + 8);
		}
		if (col > 0) choices.push(pos - 1);
	} else {
		choices.push(pos - 9);
		if (col < 8) {
			choices.push(pos - 8);
			choices.push(pos + 1);
			choices.push(pos + 10);
		}
		choices.push(pos + 9);
		if (col > 0) choices.push(pos - 1);
	}
	// if ($('.occupied').parent().hasClass('oddrow'))
		// choices = [pos - 10, pos - 9, pos + 1, pos + 9, pos + 8, pos - 1];
	// else
		// choices = [pos - 9, pos - 8, pos + 1, pos + 10, pos + 9, pos - 1];
	// for (var i = 5; i >= 0; i--) {
		// if (choices[i] < 0 || choices[i] > 80 || $('.grid').eq(choices[i]).hasClass('opened') || $('.grid').eq(choices[i]).hasClass('occupied'))
			// choices.splice(i, 1);
	// }
	return choices.filter(function(each) {
		return !($(grids[each]).hasClass('opened') || $(grids[each]).hasClass('occupied'));
	});
};

var reset = function() {
	$('.end').removeClass('end');
	$('.opened').removeClass('opened');
	for (var i = 0; i < 8; i++) {
		var random = Math.floor(Math.random() * 81);
		if (random != 40) $(grids[random]).addClass('opened');
	}
	catMove(40);
	$('.field').off().on("click", '.grid', open);
	$('.result').text("抓猫开始！");
	step = 0;
};

var main = function() {
	var field = $('.field');
	for (var i = 0; i < 9; i++) {
		var row = $('<div>').appendTo(field);
		if (i % 2 == 0) row.addClass("oddrow");
		else row.addClass("evenrow");
		for (var j = 0; j < 9; j++) {
			$('<div class="grid">').appendTo(row);
		}
	}
	
	grids = $('.grid');
	
	$('.grid:nth-child(9n)').addClass('out');
	$('.grid:nth-child(9n+1)').addClass('out');
	$('.grid:lt(8)').addClass('out');
	$('.grid:gt(72)').addClass('out');
	
	$('.reset').on('click', reset);
	$('.reset').trigger('click');
};

$(document).ready(main);
