/**
 * @version 0.10
 * @author Geng
 */

var isBlack = true;
var blackNum = 0, whiteNum = 0, seq = 1;
var lock = false;
var taken = {};
var ta = document.createElement('audio');
ta.setAttribute('src', 'sounds/ta.wav');

var group, size, groups;
var resetGroup = function() {
    group = [];
    size = [];
    groups = {};
    for (var i = 0; i < 361; i++) {
        group.push(i);
        size.push(1);
    }
};
var root = function(i) {
    while (i !== group[i]) {
        group[i] = group[group[i]];
        i = group[i];
    }
    return i;
};
var unite = function(p, q) {
    var i = root(p), j = root(q);
    if (size[i] < size[j]) {
        group[i] = j;
        size[j] += size[i];
    } else {
        group[j] = i;
        size[i] += size[j];
    }
};

var rcToNum = function(r, c) {
    return r * 19 + c;
};
var rcToId = function(r, c) {
    // return id like "0102"
    return ("0" + r).slice(-2) + ("0" + c).slice(-2);
};
var numToId = function(num) {
    var r = Math.floor(num / 19), c = num % 19;
    return rcToId(r, c);
};
var idToNum = function(id) {
    // assume id is like "0102"
    var r = parseInt(id.slice(0, 2)), c = parseInt(id.slice(2, 4));
    return rcToNum(r, c);
}

var reset = function() {
    resetGroup();
    
	isBlack = true;
    lock = false;
    $('.active').removeClass('active');
    $('#alternately').addClass('active');
    
    blackNum = 0;
    whiteNum = 0;
    seq = 1;
    taken = {};
    $('#taken').html('');
	$('.inactive').removeClass('inactive');
	$('#wbox').addClass('inactive');
	$('#bnum, #wnum').text("0");
	
    $('.seq').text("");
	$('.black').removeClass('black');
	$('.white').removeClass('white');
	$('#field').off().on('mouseenter', '.grid', function() {
		if ($(this).hasClass('black') || $(this).hasClass('white')) return;
		
		if (isBlack) $(this).addClass('preBlack');
		else $(this).addClass('preWhite');
	}).on('mouseleave', '.grid', function() {
		if ($(this).hasClass('black') || $(this).hasClass('white')) return;
		
		$(this).removeClass('preBlack preWhite');
	}).on('click', '.grid', place);
};

var place = function() {
	if ($(this).hasClass('black') || $(this).hasClass('white')) return;
		
	ta.pause()
    ta.currentTime = 0;
    ta.play();
	$(this).removeClass('preBlack preWhite');
	if (isBlack) {
        $(this).addClass('black');
        blackNum++;
    } else {
        $(this).addClass('white');
        whiteNum++;
    }
    var seqSpan = $(this).children('.seq');
    if (seqSpan.text()) {
        var prevSeq = parseInt(seqSpan.text());
        var mArray = taken[prevSeq] || [];
        mArray.push(prevSeq);
        delete taken[prevSeq];
        taken[seq] = mArray;
        printTaken();
    }
    seqSpan.text(seq++);
	
	var id = $(this).attr('id');
	var r = parseInt(id.slice(1, 3)), c = parseInt(id.slice(3, 5));
	var num = rcToNum(r, c);
    
    var neighbors = [];
    if (r > 0) neighbors.push(rcToNum(r - 1, c));
    if (r < 18) neighbors.push(rcToNum(r + 1, c));
    if (c > 0) neighbors.push(rcToNum(r, c - 1));
    if (c < 18) neighbors.push(rcToNum(r, c + 1));
    var newGroup = true;
    for (var i = 0; i < neighbors.length; i++) {
        var neighborNum = neighbors[i];
        var neighborId = numToId(neighborNum);
        var elem = $("#a" + neighborId);
        if (isSame(elem)) {
            if (newGroup) {
                unite(neighborNum, num);
                groups[root(neighborNum)].push(num);
                newGroup = false;
            } else if (root(num) !== root(neighborNum)) {
                var combine = groups[root(num)].concat(groups[root(neighborNum)]);
                delete groups[root(num)];
                delete groups[root(neighborNum)];
                unite(num, neighborNum);
                groups[root(num)] = combine;
            }
        } else if (isEnemy(elem)) {
            if (countLiberty(root(neighborNum)) === 0) {
                removeGroup(root(neighborNum), !isBlack);
            }
        }
    }
    if (newGroup) {
        groups[num] = [num];
    }
    if (countLiberty(root(num)) === 0) {
        removeGroup(root(num), isBlack);
    }
    
    $("#bnum").text(blackNum);
    $("#wnum").text(whiteNum);
    if (!lock) {
        $('#bbox, #wbox').toggleClass('inactive');
        isBlack = !isBlack;
    }
};

var printTaken = function() {
    //sort taken
    var keys = [];
    for (var key in taken) {
        if (taken.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    keys.sort(function(a, b) {
        return taken[a][0] - taken[b][0];
    });
    
    var str = '';
    for (i in keys) {
        var lastSeq = keys[i];
        for (var i = 0; i < taken[lastSeq].length; i++) {
            var prevSeq = taken[lastSeq][i];
            str += '<div class="form-group taken-grid ' + (prevSeq % 2 === 0 ? 'white' : 'black') + '"><span class="seq">' + prevSeq + '</span></div>';
        }
        str += ' = <div class="form-group taken-grid ' + (lastSeq % 2 === 0 ? 'white' : 'black') + '"><span class="seq">' + lastSeq + '</span></div>; ';
    }
    $('#taken').html(str);
};

var countLiberty = function(root) {
    var n = 0;
    var checked = {};
    var check = function(id) {
        if (!checked[id]) {
            checked[id] = true;
            if (!$("#a" + id).hasClass('black') && !$("#a" + id).hasClass('white')) n++;
        }
    };
    for (var i = 0; i < groups[root].length; i++) {
        var num = groups[root][i];
        var r = Math.floor(num / 19), c = num % 19;
        if (r > 0) {
            check(rcToId(r - 1, c));
        }
        if (r < 18) {
            check(rcToId(r + 1, c));
        }
        if (c > 0) {
            check(rcToId(r, c - 1));
        }
        if (c < 18) {
            check(rcToId(r, c + 1));
        }
    }
    return n;
};

var removeGroup = function(root, removeBlack) {
    for (var i = 0; i < groups[root].length; i++) {
        var num = groups[root][i];
        $("#a" + numToId(num)).removeClass('black white');
        // $("#a" + numToId(num)).children('.seq').text("");
        group[num] = num;
        size[num] = 1;
    }
    // console.log(groups[root]);
    if (removeBlack) blackNum -= groups[root].length;
    else whiteNum -= groups[root].length;
    delete groups[root];
};


var isSame = function(element) {
	if (isBlack && element.hasClass('black')) return true;
	if (!isBlack && element.hasClass('white')) return true;
	return false;
};
var isEnemy = function(element) {
	if (isBlack && element.hasClass('white')) return true;
	if (!isBlack && element.hasClass('black')) return true;
	return false;
};

var main = function() {
	var col;
	for (var c = 0; c < 19; c++) {
		col = $('<div class="col"></div>').appendTo($('#field'));
		for (var r = 0; r < 19; r++) {
			$('<div class="grid" id="a' + rcToId(r, c) + '"><span class="seq"></span></div>').appendTo(col);
		}
	}
    $('.seq').hide();
	
	$('#reset').click(reset);
    $('#alternately').click(function() {
        lock = false;
    });
    $('#black-only').click(function() {
        lock = true;
        isBlack = true;
        $('#bbox').removeClass('inactive');
        $('#wbox').addClass('inactive');
    });
    $('#white-only').click(function() {
        lock = true;
        isBlack = false;
        $('#wbox').removeClass('inactive');
        $('#bbox').addClass('inactive');
    });
    $('#show-number').click(function() {
        $(this).toggleClass("seq-on");
        if ($(this).hasClass("seq-on")) {
            $(this).button("on");
            $('.seq').show();
            $('#taken').show();
        } else {
            $(this).button("off");
            $('.seq').hide();
            $('#taken').hide();
        }
    });
	reset();
};

$(document).ready(main);
