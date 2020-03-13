var emsp = ' ';
var ROW_EXPAND = 10;
var ROW_NUM = 20;
var COL_NUM = 23;

var app = new Vue({
    el: "#app",
    data: {
        textInput: "",
        canvas: new Array(ROW_NUM).fill(0).map(() => new Array(COL_NUM).fill(emsp)),
        canvasOverlay: new Array(ROW_NUM).fill(0).map(() => new Array(COL_NUM).fill(emsp)),
        canvasUsed: new Array(ROW_NUM).fill(0).map(() => new Array(COL_NUM).fill(false)),
        textIndex: 0,

        isMouseDown: false,
        rStart: 0,
        cStart: 0,
        pathStack: [],

        clipboardErrorMessage: ""
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
            return output.trim();
        }
    },
    methods: {
        mouseDown: function(r, c) {
            if (this.isMouseDown || this.canvasUsed[r][c]) { return; }
            this.isMouseDown = true;
            this.rStart = r;
            this.cStart = c;
            this.updateOverlay(1, 0, 0);
        },
        mouseEnter: function(r, c) {
            if (!this.isMouseDown) { return; }

            this.clearOverlay();
            var length, rIncrement, cIncrement;
            [length, rIncrement, cIncrement] = this.getPath(r, c);
            this.updateOverlay(length, rIncrement, cIncrement);

        },
        mouseUp: function(r, c) {
            if (!this.isMouseDown) { return; }
            this.isMouseDown = false;

            this.clearOverlay();
            var length, rIncrement, cIncrement;
            [length, rIncrement, cIncrement] = this.getPath(r, c);
            this.updateCanvas(length, rIncrement, cIncrement);

        },
        getPath: function(r, c) {
            var length;
            var rDelta = r - this.rStart;
            var cDelta = c - this.cStart;
            var rIncrement = rDelta < 0 ? -1 : 1;
            var cIncrement = cDelta < 0 ? -1 : 1;
            var rDeltaAbs = rDelta < 0 ? -rDelta : rDelta;
            var cDeltaAbs = cDelta < 0 ? -cDelta : cDelta;

            if (rDeltaAbs >= 2 * cDeltaAbs) {
                cIncrement = 0;
                length = rDeltaAbs + 1;
            } else if (cDeltaAbs > 2 * rDeltaAbs) {
                rIncrement = 0;
                length = cDeltaAbs + 1;
            } else if (rDeltaAbs > cDeltaAbs) {
                length = rDeltaAbs + 1;
            } else {
                length = cDeltaAbs + 1;
            }
            return [length, rIncrement, cIncrement];
        },
        clearOverlay: function () {
            this.canvasOverlay = new Array(ROW_NUM).fill(0).map(() => new Array(COL_NUM).fill(emsp));
        },
        clearCanvas: function() {
            this.canvas = new Array(ROW_NUM).fill(0).map(() => new Array(COL_NUM).fill(emsp));
            this.canvasUsed = new Array(ROW_NUM).fill(0).map(() => new Array(COL_NUM).fill(false));
            this.textIndex = 0;
            this.pathStack = [];
            this.clipboardErrorMessage = "";
        },
        updateOverlay: function(length, rIncrement, cIncrement) {
            var textIndex = this.textIndex;
            for (var i = 0, ri = this.rStart, ci = this.cStart; i < length; i++, ri += rIncrement, ci += cIncrement) {
                if (textIndex >= this.textTrimmed.length
                    || ri < 0 || ci < 0 || ri >= this.canvas.length || ci >= this.canvas[0].length
                    || this.canvasUsed[ri][ci]) {
                    break;
                }
                if (this.textTrimmed.charCodeAt(textIndex) < 128) {
                    if (rIncrement === 0 && textIndex + 1 < this.textTrimmed.length && this.textTrimmed.charCodeAt(textIndex + 1) < 128) {
                        if (cIncrement < 0) {
                            Vue.set(this.canvasOverlay[ri], ci, this.getChar(textIndex + 1) + this.getChar(textIndex));
                        } else {
                            Vue.set(this.canvasOverlay[ri], ci, this.getChar(textIndex) + this.getChar(textIndex + 1));
                        }
                        textIndex += 2;
                    } else {
                        Vue.set(this.canvasOverlay[ri], ci, this.getChar(textIndex) + " ");
                        textIndex += 1;
                    }
                } else {
                    Vue.set(this.canvasOverlay[ri], ci, this.getChar(textIndex));
                    textIndex += 1
                }
            }
        },
        updateCanvas: function (length, rIncrement, cIncrement) {
            var originalIndex = this.textIndex;
            var needExpand = false;
            for (var i = 0, ri = this.rStart, ci = this.cStart; i < length; i++, ri += rIncrement, ci += cIncrement) {
                if (this.textIndex >= this.textTrimmed.length
                    || ri < 0 || ci < 0 || ri >= this.canvas.length || ci >= this.canvas[0].length
                    || this.canvasUsed[ri][ci]) {
                    length = i;
                    break;
                }
                if (this.textTrimmed.charCodeAt(this.textIndex) < 128) {
                    if (rIncrement === 0 && this.textIndex + 1 < this.textTrimmed.length && this.textTrimmed.charCodeAt(this.textIndex + 1) < 128) {
                        if (cIncrement < 0) {
                            Vue.set(this.canvas[ri], ci, this.getChar(this.textIndex + 1) + this.getChar(this.textIndex));
                        } else {
                            Vue.set(this.canvas[ri], ci, this.getChar(this.textIndex) + this.getChar(this.textIndex + 1));
                        }
                        this.textIndex += 2;
                    } else {
                        Vue.set(this.canvas[ri], ci, this.getChar(this.textIndex) + " ");
                        this.textIndex += 1;
                    }
                } else {
                    Vue.set(this.canvas[ri], ci, this.getChar(this.textIndex));
                        this.textIndex += 1;
                }
                Vue.set(this.canvasUsed[ri], ci, true);
                if (this.canvas.length - ri < 5) {
                    needExpand = true;
                }
            }
            if (length > 0) {
                this.pathStack.push({
                    spaceLength: length,
                    textLength: this.textIndex - originalIndex,
                    rStart: this.rStart,
                    cStart: this.cStart,
                    rIncrement: rIncrement,
                    cIncrement: cIncrement
                });
            }
            if (needExpand) {
                this.expandCanvas();
            }
        },
        expandCanvas: function() {
            this.canvas = this.canvas.concat(new Array(ROW_EXPAND).fill(0).map(() => new Array(COL_NUM).fill(emsp)));
            this.canvasUsed = this.canvasUsed.concat(new Array(ROW_EXPAND).fill(0).map(() => new Array(COL_NUM).fill(false)));
            this.canvasOverlay = this.canvasOverlay.concat(new Array(ROW_EXPAND).fill(0).map(() => new Array(COL_NUM).fill(emsp)));
            ROW_NUM += ROW_EXPAND;
        },
        undoLast: function() {
            if (this.pathStack.length == 0) { return; }
            var lastPath = this.pathStack.pop();
            for (var i = 0, ri = lastPath.rStart, ci = lastPath.cStart; i < lastPath.spaceLength; i++, ri += lastPath.rIncrement, ci += lastPath.cIncrement) {
                if (ri < 0 || ci < 0 || ri >= this.canvas.length || ci >= this.canvas[0].length) {
                    break;
                }
                Vue.set(this.canvas[ri], ci, emsp);
                Vue.set(this.canvasUsed[ri], ci, false);
            }
            this.textIndex -= lastPath.textLength;
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
            return this.textTrimmed.charAt(i);
        }
    }
});