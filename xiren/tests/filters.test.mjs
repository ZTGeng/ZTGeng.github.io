import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  filterPeople,
  initialFilters,
  changeMode,
  toggleSeason,
  getTags,
} from "../filters.mjs";

const data = JSON.parse(
  readFileSync(new URL("../data.json", import.meta.url), "utf8"),
);
const run = (changes) =>
  filterPeople(data.people, { ...initialFilters, ...changes });
const names = (people) => people.map((p) => p.name);

test("initial state shows everyone, with no season restriction in any mode", () => {
  for (const mode of ["single", "all", "any"])
    assert.equal(run({ mode }).length, data.people.length);
});

test("all 16 season subsets obey intersection and union semantics", () => {
  const ids = data.seasons.map((s) => s.id);
  for (let mask = 1; mask < 16; mask++) {
    const seasons = ids.filter((_, i) => mask & (1 << i));
    const sets = seasons.map((id) => new Set(names(run({ seasons: [id] }))));
    const expectedAll = names(data.people).filter((n) =>
      sets.every((set) => set.has(n)),
    );
    const expectedAny = names(data.people).filter((n) =>
      sets.some((set) => set.has(n)),
    );
    assert.deepEqual(names(run({ seasons, mode: "all" })), expectedAll);
    assert.deepEqual(names(run({ seasons, mode: "any" })), expectedAny);
  }
});

test("single mode replaces selection, deselects on a second click, and clamps multi-selection", () => {
  let f = toggleSeason(initialFilters, "yixi");
  f = toggleSeason(f, "erxi");
  assert.deepEqual(f.seasons, ["erxi"]);
  assert.deepEqual(toggleSeason(f, "erxi").seasons, []);
  assert.deepEqual(
    changeMode({ ...f, seasons: ["yixi", "erxi"], mode: "any" }, "single")
      .seasons,
    ["yixi"],
  );
});

test("role is evaluated within selected seasons; guest and actor roles may coexist", () => {
  assert.ok(names(run({ seasons: ["yixi"], role: "演员" })).includes("金靖"));
  assert.ok(!names(run({ seasons: ["xi1"], role: "演员" })).includes("金靖"));
  assert.ok(names(run({ seasons: ["xi1"], role: "嘉宾" })).includes("金靖"));
  assert.ok(
    names(
      run({ seasons: ["erxi", "xi1"], mode: "all", role: "演员" }),
    ).includes("土豆"),
  );
});

test("custom tags, gender, search and seasons compose, including manually edited female data", () => {
  const sample = structuredClone(data.people.find((p) => p.name === "土豆"));
  sample.gender = "女";
  sample.tags.push("我的收藏");
  const f = {
    ...initialFilters,
    mode: "all",
    seasons: ["yixi", "erxi"],
    role: "演员",
    gender: "女",
    tag: "我的收藏",
    query: "胖达人",
  };
  assert.equal(filterPeople([sample], f).length, 1);
  assert.equal(filterPeople([sample], { ...f, gender: "男" }).length, 0);
  assert.ok(getTags([sample]).includes("我的收藏"));
  assert.ok(names(run({ query: " 鑫仔 " })).includes("詹鑫"));
  assert.ok(names(run({ query: "铁男" })).includes("周铁男"));
  assert.equal(run({ query: "不存在的演员名字" }).length, 0);
});

test("every participation and work reference is valid, unique, and season-consistent", () => {
  assert.equal(new Set(data.people.map((p) => p.id)).size, data.people.length);
  assert.equal(
    new Set(data.people.map((p) => p.name)).size,
    data.people.length,
  );
  const works = new Map(data.works.map((w) => [w.id, w]));
  const referenced = new Set();
  assert.equal(works.size, data.works.length);
  for (const p of data.people) {
    assert.equal(typeof p.gender, "string"); // Gender remains manually editable.
    assert.equal(
      new Set(p.participations.map((a) => a.seasonId)).size,
      p.participations.length,
    );
    for (const a of p.participations) {
      const season = data.seasons.find((s) => s.id === a.seasonId);
      assert.ok(season);
      assert.ok(p.tags.includes(season.tag));
      assert.equal(new Set(a.works.map((w) => w.workId)).size, a.works.length);
      for (const r of a.roles) assert.ok(p.tags.includes(r));
      for (const w of a.works) {
        assert.equal(works.get(w.workId)?.seasonId, a.seasonId);
        referenced.add(w.workId);
      }
    }
  }
  assert.equal(referenced.size, works.size);
  assert.equal(data.unresolvedCredits.length, 0);
});

test("source coverage includes all performance-table rows and supplemented opening teams", () => {
  const sources = JSON.parse(
    readFileSync(new URL("../sources.json", import.meta.url), "utf8"),
  );
  const columns = {
    yixi: [3, 4, 4, 4, 4, 3, 3],
    erxi: [2, 3, 3, 4, 2],
    xi1: [2, 2, 2, 2, 2, 3],
    xi2: [2, 4, 4, 3, 2, 2],
  };
  for (const s of sources) {
    for (const [i, col] of columns[s.seasonId].entries()) {
      const sourceRows = s.tables.find((t) => t.index === i + 1).rows;
      for (const [rowIndex, row] of sourceRows.entries()) {
        if (/^《.+》$/.test(row[col]))
          assert.ok(
            data.works.some(
              (w) =>
                w.seasonId === s.seasonId &&
                w.sourceTable === i + 1 &&
                w.sourceRow === rowIndex,
            ),
            `${s.seasonId} table ${i + 1} row ${rowIndex}`,
          );
      }
    }
  }
  const lei = data.people.find((p) => p.name === "雷淞然");
  assert.ok(
    lei.participations
      .find((p) => p.seasonId === "erxi")
      .teams.includes("小心打雷"),
  );
  assert.ok(
    !data.people.some((p) =>
      ["就这个呀", "壮哈兄弟", "三板大斧子"].includes(p.name),
    ),
  );
  assert.ok(
    data.people.find((p) => p.name === "张娜娜").participations.length === 3,
  );
  for (const seasonId of ["erxi", "xi2"])
    assert.ok(
      data.people
        .find((p) => p.name === "那英")
        .participations.some((p) => p.seasonId === seasonId),
    );
  const finale = data.works.find((w) => w.title === "花园网吧");
  assert.ok(
    finale &&
      data.people
        .find((p) => p.name === "王天放")
        .participations.find((p) => p.seasonId === "xi2")
        .works.some((w) => w.workId === finale.id),
  );

  const xi1CollaborationWorks = data.works.filter(
    (w) => w.seasonId === "xi1" && [3, 4].includes(w.sourceTable),
  );
  assert.equal(xi1CollaborationWorks.length, 18);
  for (const work of xi1CollaborationWorks) {
    const group = work.sourceCredit.split("（")[0];
    const creditedMembers = data.people.filter((person) =>
      person.participations.some((part) =>
        part.works.some(
          (item) => item.workId === work.id && item.creditType === "大团署名",
        ),
      ),
    );
    assert.ok(creditedMembers.length > 0, `${work.title}: ${group}`);
    for (const member of creditedMembers) {
      const participation = member.participations.find(
        (part) => part.seasonId === "xi1",
      );
      assert.ok(
        participation.groups.includes(group),
        `${work.title}: ${member.name}`,
      );
    }
  }
});
