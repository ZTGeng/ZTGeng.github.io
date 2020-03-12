var emsp = ' ';
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
        cStart: 0
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
            console.log("mouse down. r: " + r + ", c: " + c);
        },
        mouseEnter: function(r, c) {
            if (!this.isMouseDown) { return; }

            this.clearOverlay();
            var length, rIncrement, cIncrement;
            [length, rIncrement, cIncrement] = this.getPath(r, c);
            this.updateOverlay(length, rIncrement, cIncrement);

            console.log("mouse enter. r: " + r + ", c: " + c);
        },
        mouseUp: function(r, c) {
            if (!this.isMouseDown) { return; }
            this.isMouseDown = false;

            this.clearOverlay();
            var length, rIncrement, cIncrement;
            [length, rIncrement, cIncrement] = this.getPath(r, c);
            this.updateCanvas(length, rIncrement, cIncrement);

            console.log("mouse up. r: " + r + ", c: " + c);
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
        updateOverlay: function(length, rIncrement, cIncrement) {
            var sentence = this.textTrimmed.substring(this.textIndex, this.textIndex + length);
            length = length > sentence.length ? sentence.length : length;
            for (var i = 0, ri = this.rStart, ci = this.cStart; i < length; i++, ri += rIncrement, ci += cIncrement) {
                if (ri < 0 || ci < 0 || ri >= ROW_NUM || ci >= COL_NUM || this.canvasUsed[ri][ci]) {
                    break;
                }
                Vue.set(this.canvasOverlay[ri], ci, sentence.charAt(i));
            }
        },
        updateCanvas: function (length, rIncrement, cIncrement) {
            var sentence = this.textTrimmed.substring(this.textIndex, this.textIndex + length);
            length = length > sentence.length ? sentence.length : length;
            for (var i = 0, ri = this.rStart, ci = this.cStart; i < length; i++, ri += rIncrement, ci += cIncrement) {
                if (ri < 0 || ci < 0 || ri >= ROW_NUM || ci >= COL_NUM || this.canvasUsed[ri][ci]) {
                    break;
                }
                Vue.set(this.canvas[ri], ci, sentence.charAt(i));
                Vue.set(this.canvasUsed[ri], ci, true);
                this.textIndex += 1;
            }
        }
    }
});