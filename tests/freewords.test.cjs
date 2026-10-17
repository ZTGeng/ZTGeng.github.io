// Run with: node --test tests/freewords.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../tools/js/freewords.js'), 'utf8');

function session() {
    let hit = null;
    const captured = new Set();
    const listeners = {};
    const canvas = {
        contains: cell => cell.inside,
        setPointerCapture: id => captured.add(id),
        hasPointerCapture: id => captured.has(id),
        releasePointerCapture: id => captured.delete(id)
    };
    const context = {
        document: { elementFromPoint: () => hit },
        window: {
            addEventListener: (name, fn) => { listeners[name] = fn; },
            removeEventListener: name => { delete listeners[name]; }
        },
        Vue: function(options) {
            Object.assign(this, options.data);
            this.$refs = { canvas };
            for (const [name, fn] of Object.entries(options.methods)) this[name] = fn.bind(this);
            for (const [name, get] of Object.entries(options.computed)) {
                Object.defineProperty(this, name, { get: get.bind(this) });
            }
            options.mounted.call(this);
        }
    };
    context.Vue.set = (row, col, value) => { row[col] = value; };
    vm.runInNewContext(source, context);
    const app = context.app;
    app.textInput = '甲乙丙丁戊己庚辛壬癸';
    return {
        app, captured, listeners,
        at(row, col, inside = true) {
            hit = row === null ? null : {
                closest: () => ({ dataset: { row, col }, inside })
            };
        },
        event(pointerId = 1, extra = {}) {
            return { pointerId, isPrimary: true, button: 0, preventDefault() {}, ...extra };
        }
    };
}

test('touch, pen and mouse preview a line, commit once, and can undo', () => {
    for (const pointerType of ['touch', 'pen', 'mouse']) {
        const s = session();
        const event = s.event(1, { pointerType });
        s.at(0, 0);
        s.app.pointerDown(event);
        assert.ok(s.captured.has(1));
        s.at(0, 3);
        s.app.pointerMove(event);
        assert.equal(s.app.textOutput, '甲乙丙丁');
        assert.equal(s.app.canvasUsed[0][0], false);
        s.app.pointerUp(event);
        s.app.pointerUp(event);
        assert.equal(s.app.sentenceStack.length, 1);
        assert.equal(s.app.canvasUsed[0][3], true);
        assert.equal(s.captured.size, 0);
        s.app.undoLast();
        assert.equal(s.app.textOutput, '');
        assert.equal(s.app.textIndex, 0);
    }
});

test('a second finger cannot move or finish the active stroke; release outside commits last preview', () => {
    const s = session();
    s.at(1, 1);
    s.app.pointerDown(s.event());
    s.at(3, 1);
    s.app.pointerMove(s.event());
    s.at(4, 4);
    s.app.pointerDown(s.event(2, { isPrimary: false }));
    s.app.pointerMove(s.event(2));
    s.app.pointerUp(s.event(2));
    assert.equal(s.app.activePointerId, 1);
    assert.equal(s.app.textIndex, 3);
    s.at(null);
    s.app.pointerUp(s.event());
    assert.equal(s.app.sentenceStack.length, 1);
    assert.equal(s.app.isMouseDown, false);
    s.at(4, 4);
    s.app.pointerDown(s.event(3));
    s.app.pointerUp(s.event(3));
    assert.equal(s.app.sentenceStack.length, 2);
});

test('cancellation, lost capture, blur, clear and undo remove uncommitted preview', () => {
    for (const finish of [
        s => s.app.pointerCancel(s.event()),
        s => { s.captured.clear(); s.app.pointerCancel(s.event(1, { type: 'lostpointercapture' })); },
        s => s.listeners.blur(),
        s => s.app.clearCanvas(),
        s => s.app.undoLast()
    ]) {
        const s = session();
        s.at(0, 0);
        s.app.pointerDown(s.event());
        s.at(2, 2);
        s.app.pointerMove(s.event());
        finish(s);
        assert.equal(s.app.textOutput, '');
        assert.equal(s.app.textIndex, 0);
        assert.equal(s.app.tempSentence, undefined);
        assert.equal(s.app.activePointerId, null);
        assert.equal(s.app.isMouseDown, false);
        assert.equal(s.captured.size, 0);
    }
});

test('tap places one character; used cells, external cells and right button cannot start', () => {
    const s = session();
    s.at(0, 0);
    s.app.pointerDown(s.event());
    s.app.pointerUp(s.event());
    assert.equal(s.app.textOutput, '甲');
    s.app.pointerDown(s.event());
    assert.equal(s.app.activePointerId, null);
    s.at(1, 1, false);
    s.app.pointerDown(s.event());
    assert.equal(s.app.activePointerId, null);
    s.at(1, 1);
    s.app.pointerDown(s.event(1, { button: 2 }));
    assert.equal(s.app.activePointerId, null);
});

test('diagonal strokes stop at canvas boundaries and completed strokes expand the bottom', () => {
    const s = session();
    s.at(18, 0);
    s.app.pointerDown(s.event());
    s.at(19, 2);
    s.app.pointerMove(s.event());
    assert.equal(s.app.textIndex, 2);
    s.app.pointerUp(s.event());
    assert.equal(s.app.canvas.length, 30);
    assert.equal(s.app.canvasUsed[19][1], true);
});
