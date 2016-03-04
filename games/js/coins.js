/**
 * @version 0.1
 * @author Geng
 */


/**
 * 主方法。初始化游戏元素
 */
var main = function() {
	var leftNums  = [[1,2,3,4],[2,8,9,12],[1,6,7,9]];
	var rightNums = [[5,6,7,8],[3,5,7,10],[5,8,11,12]];
	var round = 0;
	var choice = [];
	var resMap = {
		"lll": [5, "Lighter", "轻"],
		"llr": [7, "Heavier", "重"],
		"lls": [2, "Heavier", "重"],
		"lrl": [8, "Lighter", "轻"],
		"lrr": [0, "", ""],
		"lrs": [3, "Heavier", "重"],
		"lsl": [1, "Heavier", "重"],
		"lsr": [6, "Lighter", "轻"],
		"lss": [4, "Heavier", "重"],
		"rll": [0, "", ""],
		"rlr": [8, "Heavier", "重"],
		"rls": [3, "Lighter", "轻"],
		"rrl": [7, "Lighter", "轻"],
		"rrr": [5, "Heavier", "重"],
		"rrs": [2, "Lighter", "轻"],
		"rsl": [6, "Heavier", "重"],
		"rsr": [1, "Lighter", "轻"],
		"rss": [4, "Lighter", "轻"],
		"sll": [9, "Heavier", "重"],
		"slr": [12, "Heavier", "重"],
		"sls": [10, "Lighter", "轻"],
		"srl": [12, "Lighter", "轻"],
		"srr": [9, "Lighter", "轻"],
		"srs": [10, "Heavier", "重"],
		"ssl": [11, "Lighter", "轻"],
		"ssr": [11, "Heavier", "重"],
		"sss": [0, "", ""]
	};
	
	var resetCoins = function() {
		for (var i = 0; i < 4; i++) {
			$('#left' + i).hide();
			$('#right' + i).hide();
		}
		for (var i = 1; i <= 12; i++) {
			$('#coin' + i).show();
		}
	};
	
	var nextRound = function() {
		$('#round_en').html('ROUND <span class="badge" id="round-num">' + (round + 1) + '</span>');
		$('#round_zh').html('第 <span class="badge" id="round-num">' + (round + 1) + '</span> 轮');
		// enable 3 buttons
		$('.choice').prop('disabled', false);
		for (var i = 0; i < 4; i++) {
			var num = leftNums[round][i];
			$('#coin' + num).hide();
			$('#left' + i).html('<span>' + num + '</span>').show();
			
			num = rightNums[round][i];
			$('#coin' + num).hide();
			$('#right' + i).html('<span>' + num + '</span>').show();
		}
	};
	
	var nextOrEnd = function() {
		if (round < 2) {
			console.log("reset coins");
			resetCoins();
			round++;
			nextRound();
		} else {
			// disable 3 buttons
			$('.choice').prop('disabled', true);
			var resString = choice[0] + choice[1] + choice[2];
			var result = resMap[resString];
            if (result[0] === 0) {
                $('#result_en').text('All of the coins are equally heavy.');
                $('#result_zh').text('所有的硬币重量相同。');
            } else {
                $('#result_en').html('The Coin <span id="result_number" class="label label-danger"></span> is <span id="result_heavier_en" class="label label-danger"></span> Than the Others!');
                $('#result_zh').html('第 <span id="result_number" class="label label-danger"></span> 号硬币比其他硬币较<span id="result_heavier_zh" class="label label-danger"></span>！');
                $('#result_number').text(result[0]);
                $('#result_heavier_en').text(result[1]);
                $('#result_heavier_zh').text(result[2]);
            }
			$('#result').show();
		}
	};
	
	for (var i = 0; i < 4; i++) {
		$('<div class="coin_place"><div class="coin" id="left' + i + '"><span></span></div></div>').appendTo($('#left_pan'));
		$('<div class="coin_place"><div class="coin" id="right' + i + '"><span></span></div></div>').appendTo($('#right_pan'));
	}
	for (var i = 1; i <= 12; i++) {
		$('<div class="coin_place"><div class="coin" id="coin' + i + '"><span>' + i + '</span></div></div>').appendTo($('#twelve_coins'));
	}
	$('#start').click(function() {
		// disable self
		$('#start').prop('disabled', true);
		nextRound();
	});
	$('#reset').click(function() {
		// disable 3 buttons
		$('.choice').prop('disabled', true);
		// enable start
		$('#start').prop('disabled', false);
		resetCoins();
		round = 0;
		choice = [];
		$('#result').hide();
		$('#round_en').text('');
		$('#round_zh').text('');
	});
	$('#left_heavier').click(function() {
		choice[round] = 'l';
		nextOrEnd();
	});
	$('#same_heavy').click(function() {
		choice[round] = 's';
		nextOrEnd();
	});
	$('#right_heavier').click(function() {
		choice[round] = 'r';
		nextOrEnd();
	});
	
	$('#reset').trigger('click');
};

$(document).ready(main);