var emsp = ' ';
var getDirection = function(rDelta, cDelta) {
    var rDeltaAbs = rDelta < 0 ? -rDelta : rDelta;
    var cDeltaAbs = cDelta < 0 ? -cDelta : cDelta;
    if (rDeltaAbs >= 2 * cDeltaAbs) {
        return rDelta < 0 ? "W" : "E";
    }
    if (cDeltaAbs >= 2 * rDeltaAbs) {
        return cDelta < 0 ? "N" : "S";
    }
    if (rDelta < 0) {
        return cDelta < 0 ? "NW" : "SW";
    }
    return cDelta < 0 ? "NE" : "SE";
};
var app = new Vue({
    el: "#app",
    data: {
        textInput: "",
        canvas: new Array(20).fill(0).map(() => new Array(23).fill(emsp)),
        canvasOverlay: new Array(20).fill(0).map(() => new Array(23).fill(emsp)),
        canvasUsed: new Array(20).fill(0).map(() => new Array(23).fill(false)),
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
            var direction = getDirection(r - rStart, c - cStart);
            

            console.log("mouse enter. r: " + r + ", c: " + c);
        },
        mouseUp: function(r, c) {
            if (!this.isMouseDown) { return; }
            this.isMouseDown = false;
            console.log("mouse up. r: " + r + ", c: " + c);
        }
    }
});