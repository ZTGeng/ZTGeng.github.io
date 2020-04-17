var emsp = ' ';
var ROW_EXPAND = 10;
var ROW_NUM = 20;
var COL_NUM = 23;

var app = new Vue({
    el: "#app",
    data: {
        textInput: "",
        canvas: new Array(ROW_NUM).fill(0).map(() => new Array(COL_NUM).fill(emsp)),
        canvasEmoji: new Array(ROW_NUM).fill(0).map(() => new Array(COL_NUM).fill(undefined)),
        canvasUsed: new Array(ROW_NUM).fill(0).map(() => new Array(COL_NUM).fill(false)),
        textIndex: 0,

        isMouseDown: false,
        rStart: 0,
        cStart: 0,
        sentenceStack: [],
        tempSentence: undefined,

        clipboardErrorMessage: "",

        emojis: [
            [
                { text: "[微笑]", image: "images/emoji/weixiao.png"},
                { text: "[可爱]", image: "images/emoji/keai.png"},
                { text: "[太开心]", image: "images/emoji/taikaixin.png"},
                { text: "[鼓掌]", image: "images/emoji/guzhang.png"},
                { text: "[嘻嘻]", image: "images/emoji/xixi.png"},
                { text: "[哈哈]", image: "images/emoji/haha.png"},
                { text: "[笑cry]", image: "images/emoji/xiaocry.png"},
                { text: "[挤眼]", image: "images/emoji/jiyan.png"},
                { text: "[馋嘴]", image: "images/emoji/chanzui.png"},
                { text: "[黑线]", image: "images/emoji/heixian.png"},
                { text: "[汗]", image: "images/emoji/han.png"},
                { text: "[挖鼻]", image: "images/emoji/wabi.png"}
            ],
            [
                { text: "[哼]", image: "images/emoji/heng.png"},
                { text: "[怒]", image: "images/emoji/nu.png"},
                { text: "[委屈]", image: "images/emoji/weiqu.png"},
                { text: "[可怜]", image: "images/emoji/kelian.png"},
                { text: "[失望]", image: "images/emoji/shiwang.png"},
                { text: "[悲伤]", image: "images/emoji/beishang.png"},
                { text: "[泪]", image: "images/emoji/lei.png"},
                { text: "[允悲]", image: "images/emoji/yunbei.png"},
                { text: "[害羞]", image: "images/emoji/haixiu.png"},
                { text: "[污]", image: "images/emoji/wu.png"},
                { text: "[爱你]", image: "images/emoji/aini.png"},
                { text: "[亲亲]", image: "images/emoji/qinqin.png"}
            ],
            [
                { text: "[色]", image: "images/emoji/se.png"},
                { text: "[憧憬]", image: "images/emoji/chongjing.png"},
                { text: "[舔屏]", image: "images/emoji/tianping.png"},
                { text: "[坏笑]", image: "images/emoji/huaixiao.png"},
                { text: "[阴险]", image: "images/emoji/yinxian.png"},
                { text: "[笑而不语]", image: "images/emoji/xiaoerbuyu.png"},
                { text: "[偷笑]", image: "images/emoji/touxiao.png"},
                { text: "[酷]", image: "images/emoji/ku.png"},
                { text: "[并不简单]", image: "images/emoji/bingbujiandan.png"},
                { text: "[思考]", image: "images/emoji/sikao.png"},
                { text: "[疑问]", image: "images/emoji/yiwen.png"},
                { text: "[费解]", image: "images/emoji/feijie.png"}
            ],
            [
                { text: "[晕]", image: "images/emoji/yun.png"},
                { text: "[衰]", image: "images/emoji/shuai.png"},
                { text: "[骷髅]", image: "images/emoji/kulou.png"},
                { text: "[嘘]", image: "images/emoji/xu.png"},
                { text: "[闭嘴]", image: "images/emoji/bizui.png"},
                { text: "[傻眼]", image: "images/emoji/shayan.png"},
                { text: "[吃惊]", image: "images/emoji/chijing.png"},
                { text: "[吐]", image: "images/emoji/tu.png"},
                { text: "[感冒]", image: "images/emoji/ganmao.png"},
                { text: "[生病]", image: "images/emoji/shengbing.png"},
                { text: "[拜拜]", image: "images/emoji/baibai.png"},
                { text: "[鄙视]", image: "images/emoji/bishi.png"}
            ],
            [
                { text: "[白眼]", image: "images/emoji/baiyan.png"},
                { text: "[左哼哼]", image: "images/emoji/zuohengheng.png"},
                { text: "[右哼哼]", image: "images/emoji/youhengheng.png"},
                { text: "[抓狂]", image: "images/emoji/zhuakuang.png"},
                { text: "[怒骂]", image: "images/emoji/numa.png"},
                { text: "[打脸]", image: "images/emoji/dalian.png"},
                { text: "[顶]", image: "images/emoji/ding.png"},
                { text: "[互粉]", image: "images/emoji/hufen.png"},
                { text: "[钱]", image: "images/emoji/qian.png"},
                { text: "[哈欠]", image: "images/emoji/haqian.png"},
                { text: "[困]", image: "images/emoji/kun.png"},
                { text: "[睡]", image: "images/emoji/shui.png"}
            ],
            [
                { text: "[吃瓜]", image: "images/emoji/chigua.png"},
                { text: "[doge]", image: "images/emoji/doge.png"},
                { text: "[二哈]", image: "images/emoji/erha.png"},
                { text: "[喵喵]", image: "images/emoji/miaomiao.png"},
                { text: "[赞]", image: "images/emoji/zan.png"},
                { text: "[good]", image: "images/emoji/good.png"},
                { text: "[ok]", image: "images/emoji/ok.png"},
                { text: "[耶]", image: "images/emoji/ye.png"},
                { text: "[握手]", image: "images/emoji/woshou.png"},
                { text: "[作揖]", image: "images/emoji/zuoyi.png"},
                { text: "[来]", image: "images/emoji/lai.png"},
                { text: "[拳头 ]", image: "images/emoji/quantou.png"}
            ]
        ]
    },
    computed: {
        textTrimmed: function() { return this.textInput.replace(/[\r\n]/g, ''); },
        textOutput: function() {
            var output = "";
            for (var r = 0; r < this.canvas.length; r++) {
                for (var c = this.canvas[r].length - 1; c >= 0; c--) {
                    if (this.canvas[r][c] != emsp && this.canvas[r][c] != " ") {
                        output += this.canvas[r].slice(0, c + 1).join("");
                        break;
                    }
                }
                output += "\n";
            }
            return output.trimEnd();
        }
    },
    methods: {
        mouseDown: function(r, c) {
            if (this.isMouseDown || this.canvasUsed[r][c]) { return; }
            this.isMouseDown = true;
            this.rStart = r;
            this.cStart = c;

            var path = this.getPath(r, c, r, c);
            this.updateTempSentence(path);
        },
        mouseEnter: function(r, c) {
            if (!this.isMouseDown) { return; }

            var path = this.getPath(this.rStart, this.cStart, r, c);
            if (this.tempSentence && this.tempSentence.path.toString() !== path.toString()) {
                this.undoSentence(this.tempSentence);
                this.updateTempSentence(path);
            }
        },
        mouseUp: function(r, c) {
            if (!this.isMouseDown) { return; }
            this.isMouseDown = false;
            if (this.tempSentence) {
                this.usePath(this.tempSentence.path);
                this.sentenceStack.push(this.tempSentence);
                this.tempSentence = undefined;
            }
        },
        getPath: function(rFrom, cFrom, rTo, cTo) {
            var length;
            var rDelta = rTo - rFrom;
            var cDelta = cTo - cFrom;
            var rStep = rDelta === 0 ? 0 : rDelta < 0 ? -1 : 1;
            var cStep = cDelta === 0 ? 0 : cDelta < 0 ? -1 : 1;
            var rDeltaAbs = rDelta < 0 ? -rDelta : rDelta;
            var cDeltaAbs = cDelta < 0 ? -cDelta : cDelta;

            if (rDeltaAbs >= 2 * cDeltaAbs) {
                cStep = 0;
                length = rDeltaAbs + 1;
            } else if (cDeltaAbs > 2 * rDeltaAbs) {
                rStep = 0;
                length = cDeltaAbs + 1;
            } else if (rDeltaAbs > cDeltaAbs) {
                length = rDeltaAbs + 1;
            } else {
                length = cDeltaAbs + 1;
            }
            for (var i = 0, ri = rFrom, ci = cFrom; i < length; i++, ri += rStep, ci += cStep) {
                if (this.canvasUsed[ri][ci]) {
                    length = i;
                    break;
                }
            }
            return [rFrom, cFrom, length, rStep, cStep];
        },
        updateTempSentence: function(path) {
            var rStart, cStart, length, rStep, cStep;
            [rStart, cStart, length, rStep, cStep] = path;
            var originalIndex = this.textIndex;
            for (var i = 0, ri = rStart, ci = cStart; i < length; i++, ri += rStep, ci += cStep) {
                if (this.textIndex >= this.textTrimmed.length
                    || ri < 0 || ci < 0 || ri >= this.canvas.length || ci >= this.canvas[0].length
                    || this.canvasUsed[ri][ci]) {
                        length = i;
                        break;
                }
                var currentChar = this.getChar(this.textIndex);
                if (currentChar.length === 1 && currentChar.charCodeAt(0) < 128) {
                    // letters or digits
                    var nextChar = this.getChar(this.textIndex + 1);
                    if (rStep === 0 && nextChar.length === 1 && nextChar.charCodeAt(0) < 128) {
                        if (cStep < 0) {
                            Vue.set(this.canvas[ri], ci, nextChar + currentChar);
                        } else {
                            Vue.set(this.canvas[ri], ci, currentChar + nextChar);
                        }
                        this.textIndex += 2;
                    } else {
                        Vue.set(this.canvas[ri], ci, currentChar + " ");
                        this.textIndex += 1;
                    }
                } else {
                    if (currentChar.length > 2) {
                        // emojis
                        var emoji = this.getEmoji(currentChar);
                        Vue.set(this.canvasEmoji[ri], ci, "url(" + emoji.image + ")");
                    }
                    Vue.set(this.canvas[ri], ci, currentChar);
                    this.textIndex += currentChar.length;
                }
            }
            if (length > 0) {
                path[2] = length;
                this.tempSentence = {
                    path: path,
                    textLength: this.textIndex - originalIndex
                };
            }
        },
        usePath: function(path) {
            var rStart, cStart, length, rStep, cStep;
            [rStart, cStart, length, rStep, cStep] = path;
            for (var i = 0, ri = rStart, ci = cStart; i < length; i++, ri += rStep, ci += cStep) {
                Vue.set(this.canvasUsed[ri], ci, true);
            }
            var rBottom = rStep <= 0 ? rStart : rStart + rStep * length;
            if (this.canvas.length - rBottom < 5) {
                this.expandCanvas();
            }
        },
        clearCanvas: function() {
            this.canvas = new Array(ROW_NUM).fill(0).map(() => new Array(COL_NUM).fill(emsp));
            this.canvasEmoji = new Array(ROW_NUM).fill(0).map(() => new Array(COL_NUM).fill(undefined));
            this.canvasUsed = new Array(ROW_NUM).fill(0).map(() => new Array(COL_NUM).fill(false));
            this.textIndex = 0;
            this.sentenceStack = [];
            this.clipboardErrorMessage = "";
        },
        expandCanvas: function() {
            this.canvas = this.canvas.concat(new Array(ROW_EXPAND).fill(0).map(() => new Array(COL_NUM).fill(emsp)));
            this.canvasUsed = this.canvasUsed.concat(new Array(ROW_EXPAND).fill(0).map(() => new Array(COL_NUM).fill(false)));
            this.canvasEmoji = this.canvasEmoji.concat(new Array(ROW_EXPAND).fill(0).map(() => new Array(COL_NUM).fill("")));
            ROW_NUM += ROW_EXPAND;
        },
        clearPath: function(path) {
            var rStart, cStart, length, rStep, cStep;
            [rStart, cStart, length, rStep, cStep] = path;
            for (var i = 0, ri = rStart, ci = cStart; i < length; i++, ri += rStep, ci += cStep) {
                if (ri < 0 || ci < 0 || ri >= this.canvas.length || ci >= this.canvas[0].length) {
                    break;
                }
                Vue.set(this.canvas[ri], ci, emsp);
                Vue.set(this.canvasEmoji[ri], ci, undefined);
                Vue.set(this.canvasUsed[ri], ci, false);
            }
        },
        undoSentence: function(sentence) {
            this.clearPath(sentence.path);
            this.textIndex -= sentence.textLength;
        },
        undoLast: function() {
            if (this.sentenceStack.length === 0) { return; }
            this.undoSentence(this.sentenceStack.pop());
        },
        copyToClipboard: function() {
            const textarea = document.createElement("textarea");
            textarea.value = this.textOutput;
            document.body.appendChild(textarea);
            textarea.select()
            if (!document.execCommand("copy")) {
                this.clipboardErrorMessage = "浏览器不支持。请手动复制。"
            }
            document.body.removeChild(textarea);
        },
        getChar: function(i) {
            if (this.textTrimmed.charAt(i) === "[") {
                var j = this.textTrimmed.indexOf("]", i);
                if (j > i) {
                    var emojiText = this.textTrimmed.slice(i, j + 1);
                    var emoji = this.getEmoji(emojiText);
                    if (emoji) {
                        return emoji.text;
                    }
                }
            }
            return String.fromCodePoint(this.textTrimmed.codePointAt(i));
        },
        getEmoji: function(emojiText) {
            return this.emojis.flat().find(emoji => emoji.text === emojiText);
        },
        insertEmoji: function(emojiText) {
            var textArea = this.$refs.textarea;
            var cursorStart = textArea.selectionStart;
            var cursorEnd = textArea.selectionEnd;
            this.textInput = this.textInput.substring(0, cursorStart) + emojiText + this.textInput.substring(cursorEnd, this.textInput.length);
            this.$nextTick(() => {
                textArea.focus();
                textArea.selectionStart = cursorStart + emojiText.length;
                textArea.selectionEnd = cursorStart + emojiText.length;
            });
        }
    }
});