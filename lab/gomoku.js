/**
 * @version 0.11
 * @author Geng
 */

var count = 0;
var active = false;
var isBlack = true;
var ta = document.createElement('audio');
ta.setAttribute('src', 'sounds/ta.wav');
var xmlhttp;

var reset = function() {
	isBlack = true;
	active = true;
	$('.marked').removeClass('marked');
	$('.playerW').addClass('marked');
	$('#bwin, #wwin').text(" ");
	
	//$('.grid').removeClass('preBlack preWhite black white');
	$('.black').removeClass('black');
	$('.white').removeClass('white');
	
	xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange=function() {
		if (xmlhttp.readyState==4 && xmlhttp.status==200) {
			console.log(xmlhttp.responseText);
		}
	};
	xmlhttp.open("GET","a.txt",true);
	xmlhttp.send();
};

var placeAt = function(position, black) {
	var grid = $('#a' + position);
	if (grid.hasClass('black') || grid.hasClass('white')) {
		console.log('Wrong position!!');
		return;
	}
	
	grid.removeClass('preBlack preWhite');
	if (black) {
		grid.addClass('black');
		$('.playerB').addClass('marked');
		$('.playerW').removeClass('marked');
	} else{
		grid.addClass('white');
		$('.playerB').removeClass('marked');
		$('.playerW').addClass('marked');
	}
	active = true;
	ta.play();
};

var end = function() {
	$('.marked').removeClass('marked');
	if (isBlack) $('#bwin').text("胜");
	else $('#wwin').text("胜");
	$('.field').off();
};

// var count1 = function(r, c) {
	// var num = 1;
	// for (var cc = c - 1; cc >= 0; cc--) {
		// if (isSame($('#a' + (r*100+cc)))) num++;
		// else break;
	// }
	// for (var cc = c + 1; cc < 15; cc++) {
		// if (isSame($('#a' + (r*100+cc)))) num++;
		// else break;
	// }
	// return num;
// };
// var count2 = function(r, c) {
	// var num = 1;
	// for (var rr = r - 1; rr >= 0; rr--) {
		// if (isSame($('#a' + (rr*100+c)))) num++;
		// else break;
	// }
	// for (var rr = r + 1; rr < 15; rr++) {
		// if (isSame($('#a' + (rr*100+c)))) num++;
		// else break;
	// }
	// return num;
// };
// var count3 = function(r, c) {
	// var num = 1;
	// for (var rr = r - 1, cc = c - 1; rr >= 0 && cc >= 0; rr--, cc--) {
		// if (isSame($('#a' + (rr*100+cc)))) num++;
		// else break;
	// }
	// for (var rr = r + 1, cc = c + 1; rr < 15 && cc < 15; rr++, cc++) {
		// if (isSame($('#a' + (rr*100+cc)))) num++;
		// else break;
	// }
	// return num;
// };
// var count4 = function(r, c) {
	// var num = 1;
	// for (var rr = r - 1, cc = c + 1; rr >= 0 && cc < 15; rr--, cc++) {
		// if (isSame($('#a' + (rr*100+cc)))) num++;
		// else break;
	// }
	// for (var rr = r + 1, cc = c - 1; rr < 15 && cc >= 0; rr++, cc--) {
		// if (isSame($('#a' + (rr*100+cc)))) num++;
		// else break;
	// }
	// return num;
// };

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
	$('.field').off().on('mouseenter', '.grid', function() {
		if ($(this).hasClass('black') || $(this).hasClass('white')) return;
		
		if (isBlack) $(this).addClass('preBlack');
		else $(this).addClass('preWhite');
	}).on('mouseleave', '.grid', function() {
		if ($(this).hasClass('black') || $(this).hasClass('white')) return;
		
		$(this).removeClass('preBlack preWhite');
	}).on('click', '.grid', function() {
		if (!active) return;
		if ($(this).hasClass('black') || $(this).hasClass('white')) return;
	
		$(this).removeClass('preBlack preWhite');
		if (isBlack) {
			$(this).addClass('black');
			$('.playerB').addClass('marked');
			$('.playerW').removeClass('marked');
		} else{
			$(this).addClass('white');
			$('.playerB').removeClass('marked');
			$('.playerW').addClass('marked');
		}
		active = false;
		ta.play();
	});
	$('#reset').click(reset);
	reset();
};

$(document).ready(main);
