var rightSound = document.createElement('audio');
rightSound.setAttribute('src', 'sound/right.wav');
var wrongSound = document.createElement('audio');
wrongSound.setAttribute('src', 'sound/wrong.wav');

var questions = [
    "中国道家思想的创始人是春秋末年的_______，他的著作《道德经》对后来的中国人产生了非常深远的影响。",
    "明代著名医药学家李时珍编写的《_______》收集了1892种药物和11096个药方，是中国古代药物学和植物学巨著。",
    "_______著名僧人玄奘从长安出发，沿着丝绸之路，克服重重险阻到达印度，带回了650多部佛经。这就是有名的“唐僧取经”。",
    "《阿Q正传》是中国著名现代文学家_______先生的小说代表作。",
    "京剧脸谱表示“忠勇”的象征颜色是_______。",
    "道教是中国土生土长的宗教，道教的建筑称“宫”或_______。",
    "中国人常说的“令堂”指的是_______",
    "《三国演义》、《红楼梦》、《水浒》和_______合称中国古代四大文学名著。",
    "_______是中国古代著名的兵书，已被译为英、法、日、德、俄等多种文字。",
    "_______起源于中国，是中国最古老的棋类,有黑白两种棋子。隋唐时期传到日本，19世纪时又传到欧洲，现在已发展成为一种重要的国际体育竞赛项目。",
    
    "中国少数民族的节日多姿多彩，丰富的节日活动集中地反映了少数民族的风俗和生活情趣。请选择下列节日对应的民族。",
    "中国民间音乐文化历史悠久，在漫长的历史中，发展出一系列富有鲜明民族特色的乐器。试列举出你知道的三至五种。",
    "请列举出你知道的中国功夫（至少三项）。",
    "茶是中国的传统饮品，你知道中国茶有哪些品种（至少两项）？",
    "文学是中国文化中最灿烂的一部分，从远古神话到唐诗宋词、明清小说，到当代……涌现出了许多不朽的文学作品。请列举你熟悉的作家或作品（至少三项）。",
    "“棍、寸、论”这一组字的读音韵母相同，都是“_______”。",
    "“ü”在“_______、_______、_______”这三个声母后，书写时应该去掉“ü”上的两点。",
    "“好”在汉语中是个多音字，在词语“好人好事”中读作_______；在词语“业余爱好”中读作_______。",
    "古代汉字有_______、指事、会意、形声等四种造字法。",
    "形声字构成的词语“蜘蛛”的形旁都是“_______”，声旁是“_______”和“_______”。",
    
    "形声字“城”的形旁是“_______”，声旁是“_______”。",
    "汉语口语中有这样的说法：“满肚子的墨水”，意思是“_______”。",
    "汉语成语“_______”，原指“要画好竹子，在心里要有一幅竹子的形象”，后来比喻做事之前已作好充分准备，对事情的成功已有了十分的把握；又比喻遇事不慌，十分沉着。",
    "“才四点半，你怎么这么早_______下班回家了？”",
    "“_______能在下个月的HSK考试中取得理想的成绩，她这段时间一直很努力。”",
    "“_______火车站到我们大学，大概需要坐四十分钟的公共汽车，真不近！”",
    "“读了一遍_______一遍，他仍然记不住这些新课的生词。”",
    "请为下面的名词选择合适的量词。",
    "中国位于亚洲大陆东部、太平洋西岸，陆地面积约_______平方公里。",
    "中华人民共和国国旗是_______，旗面为红色，旗面左上方缀有五颗黄色五角星。",
    
    "_______是世界上最珍贵的动物之一，数量十分稀少，属于国家一级保护动物，体色为黑白相间，被誉为“中国国宝”。现存的主要栖息地在中国四川、陕西等周边山区。",
    "中国人口在地域上的分布特点是_______多_______少。",
    "中华人民共和国的法定货币是_______，它的单位是元，辅币单位是角和分。",
    "中国古代著名的_______就是通过河西走廊，进入塔里木盆地，再通过西亚到达欧洲的。",
    "2006年7月1日，_______铁路全线通车，它是目前世界上海拔最高的铁路。",
    "发源于青藏高原，流经中国十个省、市、自治区，与黄河并称为中国的“母亲河”的中国第一大河是_______。",
    "中华人民共和国国徽中的建筑物是_______。",
    "中华人民共和国的国歌是1935年由聂耳谱曲的_______。",
    "请为下列省会选择其所在省份。",
    "请为下列历史名人选择其所在朝代。",
    
    "下列中国古代著名的乐曲中，哪一首表现了中国古代传说中的爱情故事？",
    "北京的传统民居叫_______，它是中国古老传统的文化象征。",
    "中国是一个多民族的国家，共有_______个民族。",
    "中国政府提出的“一带一路”是“丝绸之路经济带”和“21世纪_______”的简称。",
    "请在下列地名后选择当地的特色小吃。"
];

var answers = [
    [0, "A 庄子", "B 老子", "C 韩非子", "D 孔子", 2],
    [0, "A 黄帝内经", "B 本草纲目", "C 伤寒杂病论", "D 神农本草经", 2],
    [0, "A 宋朝", "B 隋朝", "C 唐朝", "D 元朝", 3],
    [0, "A 老舍", "B 巴金", "C 鲁迅", "D 茅盾", 3],
    [0, "A 白色", "B 红色", "C 蓝色", "D 黑色", 2],
    [0, "A 寺", "B 观", "C 庙", "D 庵", 2],
    [0, "A 对方的母亲", "B 对方的父亲", "C 对方的女儿", "D 对方的儿子", 1],
    [1, "答案：《西游记》"],
    [1, "答案：《孙子兵法》"],
    [1, "答案：围棋"],
    
    [3, 4, "泼水节", "火把节", "古尔邦节", "那达慕大会", "彝族", "傣族", "蒙古族", "信奉伊斯兰教的民族", 2, 1, 4, 3],
    [2, "参考答案：二胡、古筝、笛子、琵琶、箫等。"],
    [2, "参考答案：太极拳、 咏春拳、猴拳、八卦掌等。"],
    [2, "参考答案：绿茶、花茶、红茶、沱茶等。"],
    [2, "参考答案：李白、杜甫、巴金、鲁迅、老舍，《家春秋》、《骆驼祥子》、《祥林嫂》等。"],
    [1, "答案：un (uen)"],
    [1, "答案：j q x"],
    [1, "答案：在“好人好事”读作“hao3”, 在“业余爱好”中读作“hao4”"],
    [1, "答案：象形"],
    [1, "答案：“蜘蛛”的形旁都是“虫”，声旁是“知”和“朱”"],
    
    [1, "答案：“城”的形旁是“土”，声旁是“成”"],
    [1, "答案：很有学问（很有知识）"],
    [1, "答案：胸有成竹"],
    [1, "答案：就"],
    [1, "答案：为了"],
    [1, "答案：从"],
    [0, "A 还", "B 又", "C 且", "D 而", 2],
    [3, 5, "一枚", "一尾", "一部", "一块", "一扇", "电影", "窗", "邮票", "鱼", "手表", 3, 4, 1, 5, 2],
    [1, "答案：960万"],
    [1, "答案：五星红旗"],
    
    [1, "答案：熊猫"],
    [1, "答案：东，西"],
    [1, "答案：人民币"],
    [1, "答案：丝绸之路"],
    [1, "答案：青藏铁路"],
    [1, "答案：长江"],
    [1, "答案：天安门"],
    [0, "A 《义勇军进行曲》", "B 《黄河》", "C 《难忘今宵》", "D 《我的祖国》", 1],
    [3, 5, "南京", "兰州", "成都", "武汉", "太原", "山西", "四川", "江苏", "甘肃", "湖北", 3, 4, 2, 5, 1],
    [3, 4, "屈原", "曹操", "李白", "李时珍", "明朝", "战国时期", "三国时期", "唐朝", 2, 3, 4, 1],
    
    [0, "A 《高山流水》", "B 《梁山伯与祝英台》", "C 《二泉映月》", "D 《阳春白雪》", 2],
    [0, "A 大杂院", "B 四合院", "C 别墅", "D 围屋", 2],
    [0, "A 50", "B 55", "C 32", "D 56", 4],
    [1, "答案：海上丝绸之路"],
    [3, 5, "陕西", "山东", "新疆", "兰州", "浙江", "羊肉串", "拉面", "羊肉泡馍", "煎饼卷大葱", "东坡肉", 3, 4, 1, 2, 5]
];

var images = [];
images[4] = "image/5.jpg";
images[19] = "image/20.jpg";
images[20] = "image/21.jpg";
images[22] = "image/23.jpg";
images[30] = "image/31.jpg";
images[34] = "image/35.jpg";
images[36] = "image/37.jpg";

var s = [40, 14, 17, 34, 20, 36, 21, 42, 12, 31, 19, 24, 16, 33, 22, 43, 35, 30, 27, 1, 15, 3, 11, 5, 18, 44, 
               26, 38, 39, 29, 7, 6, 28, 2, 37, 4, 9, 25, 41, 0, 23, 13, 32, 10, 8];


function main() {
    var n = 1;
    for (var i = 0; i < 9; i++) {
        var row = $('<div class="btn-group btn-group-sm" role="group"></div>')
        row.css({"margin": 2});
        while (n <= 45) {
            var button = $('<button class="btn btn-primary" id="q-' + (n - 1) + '">' + n + '题</button>');
            button.css({width: 50});
            button.on('click', showQuestion);
            row.append(button);
            if (n++ % 5 == 0) break;
        }
        $('#id-btns').append(row);
    }
    $('#reset-btn').on('click', function() {
        $('.btn-group .btn').removeClass('active');
        $('#question').text("");
        $('#pic').prop('src', "");
        $('#answer').html("");
    });
};
function showQuestion() {
    if ($(this).hasClass('active')) {
        return;
    }
    $(this).addClass('active');
    var q_id = parseInt($(this).prop('id').substring(2));
    $('#question').text(questions[s[q_id]]);
    $('#pic').prop('src', images[s[q_id]] || "");
    
    var answer = answers[s[q_id]];
    $('#answer').html("");
    if (answer[0] == 0) {
        for (var i = 1; i < 5; i++) {
            var button = $('<button class="btn btn-default btn-lg col-sm-4 col-sm-offset-1" style="margin-top:5px">' + answer[i] + '</button>');
            if (answer[5] == i) button.addClass('correct');
            button.on('click', onSelect);
            $('#answer').append(button);
        }
    } else if (answer[0] == 3) {
        $('#answer').append($('<div class="btn-group" style="margin-bottom:10px"><button id="restart" class="btn btn-default">重新开始</button><button id="submit" class="btn btn-default" disabled>显示答案</button></div><br>'));
        $('#restart').on('click', function() {
            $('#items .active').removeClass('active');
            $('#items :hidden').show();
            $('#submit').prop('disabled', true);
        });
        $('#submit').on('click', onSubmit);
        
        var num = answer[1];
        $('#answer').append($('<div class="form-horizontal" id="items"></div>'));
        var choices = $('<div class="btn-group"></div>');
        for (var i = 0; i < num; i++) {
            var button = $('<button class="btn btn-default" data-choice=' + i + '>' + answer[i + 2 + num] + '</button>');
            choices.append(button);
        }
        for (var i = 0; i < num; i++) {
            var item = $('<div class="form-group item"><label class="col-sm-3 control-label">' + answer[i + 2] + '</label></div>');
            var choices_clone = choices.clone();
            choices_clone.on('click', 'button', onChoose);
            choices_clone.children(':nth-child(' + answer[i + 2 + 2 * num] + ')').addClass('correct');
            item.append(choices_clone);
            $('#items').append(item);
        }
    } else {
        var button = $('<button class="btn btn-default btn-lg">显示答案</button>');
        button.on('click', function() {
            $('#answer-text').text(answer[1]);
        });
        $('#answer').append(button);
        $('#answer').append('<h3 id="answer-text" class="text-info"></h3>');
    }
};
function onSelect() {
    if ($(this).hasClass('correct')) {
        $('#pic').prop('src', "image/right.jpg");
        rightSound.play();
    } else {
        $('#pic').prop('src', "image/wrong.jpg");
        wrongSound.play();
    }
};
function onChoose() {
    if ($(this).hasClass('active')) return;
    $(this).addClass('active');
    $(this).siblings('button').hide();
    var choice = $(this);
    $('[data-choice=' + $(this).data('choice') + ']').each(function() {
        if (!$(this).is(choice)) {
            $(this).hide();
        }
    });
    if ($('#items .active').length + 1 >= $('.item').length) {
        $('#submit').prop('disabled', false);
    }
};
function onSubmit() {
    var isCorrect = true;
    $('#items .active').each(function() {
        if (!$(this).hasClass('correct')) {
            isCorrect = false;
        }
    });
    if (isCorrect) {
        $('#pic').prop('src', "image/right.jpg");
        rightSound.play();
    } else {
        $('#pic').prop('src', "image/wrong.jpg");
        wrongSound.play();
    }
};

$(document).ready(main);