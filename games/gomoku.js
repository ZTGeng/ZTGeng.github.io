/**
 * @author Geng
 */

var isBlack = true;

var reset = function() {
	isBlack = true;
	$('.player').removeClass('inactive');
	$('.player').last().addClass('inactive');
	$('#bwin, #wwin').text("");
	
	$('.grid').removeClass('preBlack preWhite black white');
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
		
		if (isDone($(this))) return;
		
		$('.player').toggleClass('inactive');
		isBlack = !isBlack;
		//$(this).off();
	});
	//$('#a0').addClass('white');
	//var a = "black";
	//alert($('#a1012').id);
	//alert(document.getElementById('a1012').id);
};

var isDone = function(element) {
	var id = parseInt(element.attr('id').slice(1));
	var c1 = count1(Math.floor(id/100), id%100);
	var c2 = count2(Math.floor(id/100), id%100);
	var c3 = count3(Math.floor(id/100), id%100);
	var c4 = count4(Math.floor(id/100), id%100);
	//alert(c1 + " " + c2 + " " + c3 + " " + c4);
	if (c1 > 4 || c2 > 4 || c3 > 4 || c4 > 4) {
		$('.player').removeClass('inactive');
		if (isBlack) $('#bwin').text("胜");
		else $('#wwin').text("胜");
		$('.field').off();
		return true;
	}
	return false;
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
