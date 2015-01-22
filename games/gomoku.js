/**
 * @version 0.11
 * @author Geng
 */

var isBlack = true;

var reset = function() {
	isBlack = true;
	$('.inactive').removeClass('inactive');
	$('.player').last().addClass('inactive');
	$('#bwin, #wwin').text("");
	
	$('.black').removeClass('black');
	$('.white').removeClass('white');
	$('.field').off().on('mouseenter', '.grid', function() {
		if ($(this).hasClass('black') || $(this).hasClass('white')) return;
		
		if (isBlack) $(this).addClass('preBlack');
		else $(this).addClass('preWhite');
	}).on('mouseleave', '.grid', function() {
		if ($(this).hasClass('black') || $(this).hasClass('white')) return;
		
		$(this).removeClass('preBlack preWhite');
	}).on('click', '.grid', function() {
		if ($(this).hasClass('black') || $(this).hasClass('white')) return;
		
		$(this).removeClass('preBlack preWhite');
		if (isBlack) $(this).addClass('black');
		else $(this).addClass('white');
		
		var id = +($(this).attr('id').slice(1));
		var r = Math.floor(id/100), c = id%100;
		var c1 = count1(r, c);
		if (c1 > 4) {
			flash1(r, c);
			end();
			return;
		}
		var c2 = count2(r, c);
		if (c2 > 4) {
			flash2(r, c);
			end();
			return;
		}
		var c3 = count3(r, c);
		if (c3 > 4) {
			flash3(r, c);
			end();
			return;
		}
		var c4 = count4(r, c);
		if (c4 > 4) {
			flash4(r, c);
			end();
			return;
		}
		
		$('.player').toggleClass('inactive');
		isBlack = !isBlack;
	});
};

var end = function() {
	$('.inactive').removeClass('inactive');
	if (isBlack) $('#bwin').text("胜");
	else $('#wwin').text("胜");
	$('.field').off();
};

var count1 = function(r, c) {
	var num = 1;
	for (var cc = c - 1; cc >= 0; cc--) {
		if (isSame($('#a' + (r*100+cc)))) num++;
		else break;
	}
	for (var cc = c + 1; cc < 15; cc++) {
		if (isSame($('#a' + (r*100+cc)))) num++;
		else break;
	}
	return num;
};
var count2 = function(r, c) {
	var num = 1;
	for (var rr = r - 1; rr >= 0; rr--) {
		if (isSame($('#a' + (rr*100+c)))) num++;
		else break;
	}
	for (var rr = r + 1; rr < 15; rr++) {
		if (isSame($('#a' + (rr*100+c)))) num++;
		else break;
	}
	return num;
};
var count3 = function(r, c) {
	var num = 1;
	for (var rr = r - 1, cc = c - 1; rr >= 0 && cc >= 0; rr--, cc--) {
		if (isSame($('#a' + (rr*100+cc)))) num++;
		else break;
	}
	for (var rr = r + 1, cc = c + 1; rr < 15 && cc < 15; rr++, cc++) {
		if (isSame($('#a' + (rr*100+cc)))) num++;
		else break;
	}
	return num;
};
var count4 = function(r, c) {
	var num = 1;
	for (var rr = r - 1, cc = c + 1; rr >= 0 && cc < 15; rr--, cc++) {
		if (isSame($('#a' + (rr*100+cc)))) num++;
		else break;
	}
	for (var rr = r + 1, cc = c - 1; rr < 15 && cc >= 0; rr++, cc--) {
		if (isSame($('#a' + (rr*100+cc)))) num++;
		else break;
	}
	return num;
};

var flash1 = function(r, c) {
	$('#a' + (r*100+c)).addClass('flash');
	var elem;
	for (var cc = c - 1; cc >= 0; cc--) {
		elem = $('#a' + (r*100+cc));
		if (isSame(elem)) elem.addClass('flash');
		else break;
	}
	for (var cc = c + 1; cc < 15; cc++) {
		elem = $('#a' + (r*100+cc));
		if (isSame(elem)) elem.addClass('flash');
		else break;
	}
	flash();
};
var flash2 = function(r, c) {
	$('#a' + (r*100+c)).addClass('flash');
	var elem;
	for (var rr = r - 1; rr >= 0; rr--) {
		elem = $('#a' + (rr*100+c));
		if (isSame(elem)) elem.addClass('flash');
		else break;
	}
	for (var rr = r + 1; rr < 15; rr++) {
		elem = $('#a' + (rr*100+c));
		if (isSame(elem)) elem.addClass('flash');
		else break;
	}
	flash();
};
var flash3 = function(r, c) {
	$('#a' + (r*100+c)).addClass('flash');
	var elem;
	for (var rr = r - 1, cc = c - 1; rr >= 0 && cc >= 0; rr--, cc--) {
		elem = $('#a' + (rr*100+cc));
		if (isSame(elem)) elem.addClass('flash');
		else break;
	}
	for (var rr = r + 1, cc = c + 1; rr < 15 && cc < 15; rr++, cc++) {
		elem = $('#a' + (rr*100+cc));
		if (isSame(elem)) elem.addClass('flash');
		else break;
	}
	flash();
};
var flash4 = function(r, c) {
	$('#a' + (r*100+c)).addClass('flash');
	var elem;
	for (var rr = r - 1, cc = c + 1; rr >= 0 && cc < 15; rr--, cc++) {
		elem = $('#a' + (rr*100+cc));
		if (isSame(elem)) elem.addClass('flash');
		else break;
	}
	for (var rr = r + 1, cc = c - 1; rr < 15 && cc >= 0; rr++, cc--) {
		elem = $('#a' + (rr*100+cc));
		if (isSame(elem)) elem.addClass('flash');
		else break;
	}
	flash();
};

var flash = function() {
	for (var i = 0; i < 3; i++) {
		$('.flash').animate({
			opacity: 0.3
		}, 500);
		$('.flash').animate({
			opacity: 1
		}, 500);
	}
	$('.flash').removeClass('flash');
};

var isSame = function(element) {
	if (isBlack && element.hasClass('black')) return true;
	if (!isBlack && element.hasClass('white')) return true;
	return false;
};

var main = function() {
	var row;
	for (var c = 0; c < 15; c++) {
		col = $('<div class="col"></div>').appendTo($('.field'));
		for (var r = 0; r < 15; r++) {
			$('<div class="grid" id="a' + (r*100+c) + '"></div>').appendTo(col);
		}
	}
	
	$('#reset').click(reset);
	reset();
};

$(document).ready(main);
