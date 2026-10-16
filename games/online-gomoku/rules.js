export const SIZE = 15;
const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
const inside = (x, y) => x >= 0 && x < SIZE && y >= 0 && y < SIZE;
const at = (board, x, y) => inside(x, y) ? board[y * SIZE + x] : -1;
export const other = role => role === "black" ? "white" : "black";

function run(board, x, y, dx, dy, color) {
  let count = 1;
  for (const sign of [-1, 1]) {
    let i = 1;
    while (at(board, x + i * dx * sign, y + i * dy * sign) === color) { count++; i++; }
  }
  return count;
}

// Four threats are grouped by their four stones, so an open four counts once.
function fours(board, x, y) {
  const threats = new Map();
  for (let d = 0; d < directions.length; d++) {
    const [dx, dy] = directions[d];
    for (let start = -4; start <= 0; start++) {
      const stones = [], empty = [];
      for (let i = start; i < start + 5; i++) {
        const px = x + i * dx, py = y + i * dy;
        const value = at(board, px, py);
        if (value === 1) stones.push(py * SIZE + px);
        else if (value === 0) empty.push([px, py]);
      }
      if (stones.length !== 4 || empty.length !== 1) continue;
      const [ex, ey] = empty[0];
      board[ey * SIZE + ex] = 1;
      const five = run(board, ex, ey, dx, dy, 1) === 5;
      board[ey * SIZE + ex] = 0;
      if (!five) continue;
      const key = `${d}:${stones.join(",")}`;
      if (!threats.has(key)) threats.set(key, { d, stones, ends: [] });
      threats.get(key).ends.push(empty[0]);
    }
  }
  return [...threats.values()];
}

// RIF-style forbidden shapes, with recursive legal extensions for real threes.
// Opening/swap protocols and claim-based tournament adjudication are not used.
export function blackFoul(board, x, y, memo = new Map()) {
  const lengths = directions.map(([dx, dy]) => run(board, x, y, dx, dy, 1));
  if (lengths.includes(5)) return null;
  if (lengths.some(n => n > 5)) return "overline";
  const key = `${board.join("")}:${x},${y}`;
  if (memo.has(key)) return memo.get(key);
  if (fours(board, x, y).length >= 2) { memo.set(key, "doubleFour"); return "doubleFour"; }
  const threes = new Set();
  for (let d = 0; d < directions.length; d++) {
    const [dx, dy] = directions[d];
    for (let i = -3; i <= 3; i++) {
      const px = x + dx * i, py = y + dy * i;
      if (at(board, px, py) !== 0) continue;
      const index = py * SIZE + px;
      board[index] = 1;
      const candidates = fours(board, px, py).filter(f => f.d === d && f.ends.length === 2 && f.stones.includes(y * SIZE + x));
      // An extension making five is not an extension of a three (RIF definition).
      const makesFive = directions.some(([a, b]) => run(board, px, py, a, b, 1) === 5);
      if (candidates.length && !makesFive && !blackFoul(board, px, py, memo)) {
        for (const f of candidates) threes.add(`${d}:${f.stones.filter(n => n !== index).join(",")}`);
      }
      board[index] = 0;
      if (threes.size >= 2) { memo.set(key, "doubleThree"); return "doubleThree"; }
    }
  }
  memo.set(key, null);
  return null;
}

export function replay(moves, forbidden = false) {
  if (!Array.isArray(moves) || moves.length > SIZE * SIZE) throw new Error("invalidMoves");
  const board = new Uint8Array(SIZE * SIZE);
  let winner = null;
  for (let i = 0; i < moves.length; i++) {
    if (winner) throw new Error("afterEnd");
    const move = moves[i];
    if (!Array.isArray(move) || move.length !== 2 || !move.every(Number.isInteger)) throw new Error("invalidMove");
    const [x, y] = move;
    if (!inside(x, y)) throw new Error("outOfBounds");
    if (board[y * SIZE + x]) throw new Error("occupied");
    const color = i % 2 + 1;
    board[y * SIZE + x] = color;
    if (forbidden && color === 1) {
      const foul = blackFoul(board, x, y);
      if (foul) throw new Error(foul);
    }
    const win = directions.some(([dx, dy]) => {
      const n = run(board, x, y, dx, dy, color);
      return forbidden && color === 1 ? n === 5 : n >= 5;
    });
    if (win) winner = color === 1 ? "black" : "white";
  }
  return { board, winner, finished: Boolean(winner) || moves.length === SIZE * SIZE,
    turn: moves.length % 2 === 0 ? "black" : "white" };
}

export function appendMove(moves, role, move, forbidden = false) {
  const state = replay(moves, forbidden);
  if (state.finished) throw new Error("afterEnd");
  if (state.turn !== role) throw new Error("wrongTurn");
  const next = [...moves, move];
  replay(next, forbidden);
  return next;
}
