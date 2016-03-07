/**
 * @version 0.3
 * @author Geng
 */

var dataList;
var LEFTNUMS = [[1, 2, 3, 4], [2, 8, 9, 12], [1, 6, 7, 9]];
var RIGHTNUMS = [[5, 6, 7, 8], [3, 5, 7, 10], [5, 8, 11, 12]];
var RESMAP = {
    "lll": [5, "Lighter", "轻"],
    "llr": [7, "Heavier", "重"],
    "lls": [2, "Heavier", "重"],
    "lrl": [8, "Lighter", "轻"],
    "lrr": [-1, "", ""],
    "lrs": [3, "Heavier", "重"],
    "lsl": [1, "Heavier", "重"],
    "lsr": [6, "Lighter", "轻"],
    "lss": [4, "Heavier", "重"],
    "rll": [-1, "", ""],
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
var leftNums, rightNums, resMap;

var prepareData = function () {
    var client = new XMLHttpRequest();
    client.open('GET', 'coins.txt');
    // console.log("try get data");
    client.onreadystatechange = function () {
        if (client.responseText != '') {
            dataList = client.responseText.split("\n");
        }
    };
    client.send();
};

/**
 * 主方法。初始化游戏元素
 */
var main = function () {

    var round = 0;
    var choice = [];
    var mask = [1,2,3,4,5,6,7,8,9,10,11,12];
    
    var shuffle = function(a) {
        var i, j, temp;
        for (i = a.length; i > 0; i--) {
            j = Math.floor(Math.random() * i);
            temp = a[i - 1];
            a[i - 1] = a[j];
            a[j] = temp;
        }
    }
    
    var resetCoins = function () {
        for (var i = 0; i < 4; i++) {
            $('#left' + i).hide();
            $('#right' + i).hide();
        }
        for (var i = 1; i <= 12; i++) {
            $('#coin' + i).show();
        }
    };
    
    var resetData = function() {
        if (dataList) {
            // console.log("change data");
            var str = dataList[Math.floor((Math.random() * dataList.length))];
            var list = str.split(" ");
            var index = 0;
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 4; j++) {
                    leftNums[i][j] = parseInt(list[index++]);
                }
                for (var j = 0; j < 4; j++) {
                    rightNums[i][j] = parseInt(list[index++]);
                }
            }
            
            for (var key in resMap) {
                resMap[key] = [-1, "", ""];
            }
            resMap["sss"] = [0, "", ""];
            for (var coin = 1; coin < 13; coin++) {
                var light = "";
                var heavy = "";
                for (var i = 0; i < 3; i++) {
                    if (leftNums[i].indexOf(coin) !== -1) {
                        light += "r";
                        heavy += "l";
                    } else if (rightNums[i].indexOf(coin) !== -1) {
                        light += "l";
                        heavy += "r";
                    } else {
                        light += "s";
                        heavy += "s";
                    }
                }
                resMap[light] = [coin, "Lighter", "轻"];
                resMap[heavy] = [coin, "Heavier", "重"];
            }
            // test
            var neg = 0;
            for (var key in resMap) {
                if (resMap[key][0] === -1) neg ++;
            }
            if (neg !== 2) {
                console.log("Data error!!!");
                
            }
        }
    };

    var nextRound = function () {
        $('#round-en').html('ROUND <span class="badge" id="round-num">' + (round + 1) + '</span>');
        $('#round-zh').html('第 <span class="badge" id="round-num">' + (round + 1) + '</span> 轮');
        // enable 3 buttons
        $('.choice').prop('disabled', false);
        for (var i = 0; i < 4; i++) {
            var num = leftNums[round][i];
            $('#coin' + mask[num - 1]).hide();
            $('#left' + i).html('<span>' + mask[num - 1] + '</span>').show();

            num = rightNums[round][i];
            $('#coin' + mask[num - 1]).hide();
            $('#right' + i).html('<span>' + mask[num - 1] + '</span>').show();
        }
    };

    var nextOrEnd = function () {
        if (round < 2) {
            // console.log("reset coins");
            resetCoins();
            round++;
            nextRound();
        } else {
            // disable 3 buttons
            $('.choice').prop('disabled', true);
            var resString = choice[0] + choice[1] + choice[2];
            var result = resMap[resString];
            if (result[0] === 0) {
                $('#result-en').text('All of the coins are equally heavy.');
                $('#result-zh').text('所有的硬币重量相同。');
            } else if (result[0] === -1) {
                $('#result-en').text('It seems you didn\'t click on the correct button(s). Please try again.');
                $('#result-zh').text('您可能点击了错误的按钮。请重试。');
            } else {
                $('#result-en').html('The Coin <span id="result-number" class="label label-danger"></span> is <span id="result-heavier-en" class="label label-danger"></span> Than the Others!');
                $('#result-zh').html('第 <span id="result-number" class="label label-danger"></span> 号硬币比其他硬币较<span id="result-heavier-zh" class="label label-danger"></span>！');
                $('#result-number').text(mask[result[0] - 1]);
                $('#result-heavier-en').text(result[1]);
                $('#result-heavier-zh').text(result[2]);
            }
            $('#result').show();
        }
    };
    
    prepareData();
    leftNums = LEFTNUMS.slice(0);
    rightNums = RIGHTNUMS.slice(0);
    resMap = $.extend({}, RESMAP);

    for (var i = 0; i < 4; i++) {
        $('<div class="coin-place"><div class="coin" id="left' + i + '"><span></span></div></div>').appendTo($('#left-pan'));
        $('<div class="coin-place"><div class="coin" id="right' + i + '"><span></span></div></div>').appendTo($('#right-pan'));
    }
    for (var i = 1; i <= 12; i++) {
        $('<div class="coin-place"><div class="coin" id="coin' + i + '"><span>' + i + '</span></div></div>').appendTo($('#twelve-coins'));
    }
    $('#start').click(function () {
        resetData();
        // disable self
        $('#start').prop('disabled', true);
        nextRound();
    });
    $('#reset').click(function () {
        // disable 3 buttons
        $('.choice').prop('disabled', true);
        // enable start
        $('#start').prop('disabled', false);
        resetCoins();
        shuffle(mask);
        // console.log(mask);
        round = 0;
        choice = [];
        $('#result').hide();
        $('#round-en').text('');
        $('#round-zh').text('');
    });
    $('#left-heavier').click(function () {
        choice[round] = 'l';
        nextOrEnd();
    });
    $('#same-heavy').click(function () {
        choice[round] = 's';
        nextOrEnd();
    });
    $('#right-heavier').click(function () {
        choice[round] = 'r';
        nextOrEnd();
    });

    $('#reset').trigger('click');
};

$(document).ready(main);
