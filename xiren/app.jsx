import {
  initialFilters,
  changeMode,
  toggleSeason,
  filterPeople,
  getTags,
} from "./filters.mjs";

const { useState, useEffect, useMemo, useRef } = React;
const seasonColors = ["coral", "gold", "green", "blue"];
const modes = [
  ["single", "单季"],
  ["all", "同时参加 · 交集"],
  ["any", "参加任一 · 并集"],
];

function Avatar({ person, large = false }) {
  const [failed, setFailed] = useState(false);
  const url =
    typeof person.avatar === "string" ? person.avatar : person.avatar?.url;
  const tone =
    [...person.name].reduce((sum, c) => sum + c.codePointAt(0), 0) % 5;
  return (
    <div className={`avatar tone-${tone} ${large ? "large" : ""}`}>
      {url && !failed ? (
        <img
          src={url}
          alt={`${person.name}的头像`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="placeholder" aria-label={`${person.name}，暂无头像`}>
          <span className="face">
            <i />
            <i />
            <b />
          </span>
          <span className="avatar-name">{person.name.slice(-2)}</span>
          <small>等一张笑脸</small>
        </div>
      )}
    </div>
  );
}

function Chip({ active, children, onClick, className = "" }) {
  return (
    <button
      type="button"
      className={`chip ${active ? "selected" : ""} ${className}`}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Detail({ person, data, onClose }) {
  const ref = useRef(null);
  const closeRef = useRef(null);
  const worksById = useMemo(
    () => new Map(data.works.map((w) => [w.id, w])),
    [data],
  );
  useEffect(() => {
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.querySelector("#page").inert = true;
    closeRef.current.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const els = [
          ...ref.current.querySelectorAll(
            'button, a[href], summary, [tabindex="0"]',
          ),
        ].filter(
          (el) =>
            el.getClientRects().length > 0 &&
            (!el.closest('details:not([open])') || el.tagName === 'SUMMARY'),
        );
        const first = els[0],
          last = els.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.querySelector("#page").inert = false;
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, []);
  return (
    <div className="drawer-layer" onClick={onClose}>
      <aside
        ref={ref}
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="person-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-top">
          <span>喜人档案 / PROFILE</span>
          <button
            ref={closeRef}
            className="close"
            aria-label="关闭详情"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="profile">
          <Avatar person={person} large />
          <div>
            <div className="eyebrow">很高兴，在这里见到你</div>
            <h2 id="person-title">{person.name}</h2>
            <div className="profile-tags">
              {person.tags.map((t) => (
                <span key={t}>#{t}</span>
              ))}
            </div>
            <p className="muted">
              性别：{person.gender} <small>（初始数据待核实）</small>
            </p>
            {person.baike ? (
              <a
                className="baike-link"
                href={person.baike}
                target="_blank"
                rel="noopener noreferrer"
              >
                百度百科 ↗
              </a>
            ) : (
              <small className="muted">暂无百度百科链接</small>
            )}
          </div>
        </div>
        <div className="works-heading">
          <h3>这些舞台，有 TA 在</h3>
          <span>{person.participations.length} 季足迹</span>
        </div>
        <p className="credit-note">
          个人署名为来源直接列名；小队／大团署名按成员关联，可能不包含完整助演名单。
        </p>
        {person.participations.map((part) => {
          const season = data.seasons.find((s) => s.id === part.seasonId);
          return (
            <section className="season-works" key={part.seasonId}>
              <div className="season-heading">
                <span
                  className={`season-label ${seasonColors[data.seasons.indexOf(season)]}`}
                >
                  {season.tag}
                </span>
                <div>
                  <h4>{season.name}</h4>
                  <small>
                    {season.year} ·{" "}
                    {part.roleDetails.length
                      ? part.roleDetails.join(" / ")
                      : part.roles.join(" / ")}
                  </small>
                </div>
              </div>
              <div className="affiliation">
                <p>
                  <span>小队</span>
                  {part.teams.join("、") || "百科未列出"}
                </p>
                {part.groups.length > 0 && (
                  <p>
                    <span>大团</span>
                    {part.groups.join("、")}
                  </p>
                )}
              </div>
              {part.additionalSources?.length > 0 && (
                <div className="source-links muted">
                  {part.additionalSources.map((url, i) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      补充名单来源
                      {part.additionalSources.length > 1 ? i + 1 : ""} ↗
                    </a>
                  ))}
                </div>
              )}
              {part.works.length ? (
                <ul className="work-list">
                  {part.works.map((item) => {
                    const work = worksById.get(item.workId);
                    return work ? (
                      <li key={item.workId}>
                        <div>
                          <span>《{work.title}》</span>
                          <small
                            className={
                              item.creditType === "个人署名"
                                ? "direct-credit"
                                : ""
                            }
                          >
                            {item.creditType}
                          </small>
                        </div>
                        <details>
                          <summary>查看署名与来源</summary>
                          <p>{work.episode}</p>
                          <p>原始署名：{work.sourceCredit}</p>
                          {work.note && <p>{work.note}</p>}
                          <a
                            href={work.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            查看来源 ↗
                          </a>
                        </details>
                      </li>
                    ) : null;
                  })}
                </ul>
              ) : (
                <p className="no-works">百科节目表暂无可关联的作品记录。</p>
              )}
            </section>
          );
        })}
        <p className="drawer-foot">每一个名字，都是一份快乐的来处。</p>
      </aside>
    </div>
  );
}

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [filters, setFilters] = useState(initialFilters);
  const [selected, setSelected] = useState(null);
  const [sort, setSort] = useState("name");
  useEffect(() => {
    const controller = new AbortController();
    setError("");
    fetch("./data.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`数据请求失败（${response.status}）`);
        return response.json();
      })
      .then((value) => {
        if (
          !Array.isArray(value.people) ||
          !Array.isArray(value.seasons) ||
          !Array.isArray(value.works)
        )
          throw new Error("数据格式不正确");
        setData(value);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => controller.abort();
  }, [attempt]);
  const results = useMemo(() => {
    if (!data) return [];
    return filterPeople(data.people, filters).sort(
      (a, b) =>
        (sort === "seasons"
          ? b.participations.length - a.participations.length
          : 0) || a.name.localeCompare(b.name, "zh-CN"),
    );
  }, [data, filters, sort]);
  const tags = useMemo(() => (data ? getTags(data.people) : []), [data]);
  const update = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const reset = () => setFilters({ ...initialFilters, seasons: [] });
  const activeCount =
    filters.seasons.length +
    ["role", "gender", "tag", "query"].filter((k) => filters[k]).length;
  return (
    <>
      <div id="page">
        <nav className="topbar">
          <a className="brand" href="./">
            <span className="brand-mark">喜</span>喜人图鉴
            <span className="brand-en">XIREN ARCHIVE</span>
          </a>
          <a className="home-link" href="../">
            回到主页 ↗
          </a>
        </nav>
        <main>
          <header className="hero">
            <div>
              <div className="eyebrow">
                <span className="live-dot" /> 喜剧散场，快乐不散
              </div>
              <h1>
                把快乐的人，
                <br className="mobile-break" />
                聚在
                <span className="highlight">
                  一起。
                  <svg viewBox="0 0 220 14" aria-hidden="true">
                    <path d="M3 10 Q100 0 217 7" />
                  </svg>
                </span>
              </h1>
              <p>
                从一喜、二喜到喜人奇妙夜。
                <br />
                在这里认识喜人，找回那些让你笑过的舞台。
              </p>
            </div>
            <div className="hero-stamp" aria-hidden="true">
              <span>HAPPY TOGETHER</span>
              <div className="stamp-face">
                <i />
                <i />
                <b />
              </div>
              <strong>好喜欢你们！</strong>
            </div>
          </header>
          <section className="filters" aria-label="筛选喜人">
            <div className="filter-top">
              <div className="filter-title">
                <span>⌕</span>
                <h2>找一找你的快乐搭子</h2>
              </div>
              <label className="search">
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  aria-label="搜索姓名、别名或队伍"
                  placeholder="搜索姓名、别名或队伍…"
                  value={filters.query}
                  onChange={(e) => update("query", e.target.value)}
                />
              </label>
            </div>
            <div className="filter-row">
              <span className="filter-label" id="season-mode-label">
                节目模式
              </span>
              <div
                className="mode-group"
                role="group"
                aria-labelledby="season-mode-label"
              >
                {modes.map(([id, name]) => (
                  <Chip
                    key={id}
                    active={filters.mode === id}
                    onClick={() => setFilters((f) => changeMode(f, id))}
                  >
                    {name}
                  </Chip>
                ))}
              </div>
              <span className="mode-hint">
                {filters.mode === "single"
                  ? "选择一季，看看都有谁"
                  : filters.mode === "all"
                    ? "同时参加所选的每一季"
                    : "参加任意一个所选季即可"}
              </span>
            </div>
            <div className="filter-row">
              <span className="filter-label" id="season-label">
                参加节目
              </span>
              <div
                className="chips"
                role="group"
                aria-labelledby="season-label"
              >
                <Chip
                  active={!filters.seasons.length}
                  onClick={() => update("seasons", [])}
                >
                  全部节目
                </Chip>
                {data?.seasons.map((s, i) => (
                  <Chip
                    key={s.id}
                    active={filters.seasons.includes(s.id)}
                    className={`season-chip ${seasonColors[i]}`}
                    onClick={() => setFilters((f) => toggleSeason(f, s.id))}
                  >
                    <span>{s.tag}</span>
                    {s.name}
                    <small>{s.year}</small>
                  </Chip>
                ))}
              </div>
            </div>
            <div className="filter-split">
              <div className="filter-row">
                <span className="filter-label" id="role-label">
                  人物身份
                </span>
                <div
                  className="chips"
                  role="group"
                  aria-labelledby="role-label"
                >
                  {[
                    ["", "全部"],
                    ["演员", "演员"],
                    ["嘉宾", "嘉宾 / 主持人"],
                  ].map(([id, text]) => (
                    <Chip
                      key={id}
                      active={filters.role === id}
                      onClick={() => update("role", id)}
                    >
                      {text}
                    </Chip>
                  ))}
                </div>
              </div>
              <div className="filter-row">
                <span className="filter-label" id="gender-label">
                  性别
                </span>
                <div
                  className="chips"
                  role="group"
                  aria-labelledby="gender-label"
                >
                  {[
                    "",
                    ...new Set([
                      "男",
                      "女",
                      ...(data?.people.map((p) => p.gender).filter(Boolean) ||
                        []),
                    ]),
                  ].map((g) => (
                    <Chip
                      key={g}
                      active={filters.gender === g}
                      onClick={() => update("gender", g)}
                    >
                      {g || "全部"}
                    </Chip>
                  ))}
                </div>
                <span
                  className="gender-note"
                  title="按维护者要求，性别初始统一设置为男，待手动修改。"
                >
                  待校对
                </span>
              </div>
            </div>
            <div className="filter-row tag-row">
              <span className="filter-label" id="tag-label">
                自定义标签
              </span>
              <div className="chips" role="group" aria-labelledby="tag-label">
                <Chip active={!filters.tag} onClick={() => update("tag", "")}>
                  全部标签
                </Chip>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    active={filters.tag === tag}
                    onClick={() =>
                      update("tag", filters.tag === tag ? "" : tag)
                    }
                  >
                    # {tag}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="filter-bottom">
              <span>
                {filters.seasons.length && filters.role
                  ? "身份按所选节目内的身份匹配；"
                  : ""}
                不同筛选条件之间取交集 · 未选节目表示不限
              </span>
              <button className="reset" onClick={reset} disabled={!activeCount}>
                ↺ 重置筛选{activeCount > 0 ? ` (${activeCount})` : ""}
              </button>
            </div>
          </section>
          <section className="results" aria-labelledby="results-heading">
            <div className="results-toolbar">
              <div>
                <h2 id="results-heading">
                  {activeCount ? "找到这些喜人" : "所有喜人"}{" "}
                  <span>
                    {results.length}
                    <small> 位</small>
                  </span>
                </h2>
                <p aria-live="polite">
                  {data
                    ? `共收录 ${data.people.length} 位 · 点击卡片，看看 TA 的喜剧足迹`
                    : "正在加载喜人档案…"}
                </p>
              </div>
              <label className="sort">
                排序{" "}
                <select
                  aria-label="排序"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="name">姓名 A–Z</option>
                  <option value="seasons">参加季数优先</option>
                </select>
              </label>
            </div>
            {error ? (
              <div className="empty" role="alert">
                <span>:(</span>
                <h3>档案暂时没打开</h3>
                <p>{error}。请通过本地 HTTP 服务打开页面。</p>
                <button
                  className="primary"
                  onClick={() => setAttempt((a) => a + 1)}
                >
                  重新加载
                </button>
              </div>
            ) : !data ? (
              <div className="skeleton-grid" aria-label="正在加载">
                {Array.from({ length: 12 }, (_, i) => (
                  <div className="skeleton" key={i} />
                ))}
              </div>
            ) : results.length ? (
              <div className="people-grid">
                {results.map((person) => (
                  <button
                    className="person-card"
                    key={person.id}
                    onClick={() => setSelected(person)}
                    aria-label={`查看${person.name}的详情`}
                  >
                    <div className="portrait-wrap">
                      <Avatar person={person} />
                      <span className="card-arrow" aria-hidden="true">
                        ↗
                      </span>
                      <span className="season-count">
                        {person.participations.length} 季足迹
                      </span>
                    </div>
                    <div className="card-info">
                      <h3>{person.name}</h3>
                      <p>
                        {[
                          ...new Set(
                            person.participations.flatMap((p) => p.roles),
                          ),
                        ].join(" · ")}
                      </p>
                      <div className="season-dots">
                        {data.seasons.map(
                          (s, i) =>
                            person.participations.some(
                              (p) => p.seasonId === s.id,
                            ) && (
                              <span key={s.id} className={seasonColors[i]}>
                                {s.tag}
                              </span>
                            ),
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty">
                <span>◡</span>
                <h3>这个组合，还没有找到喜人</h3>
                <p>试试减少筛选条件，或换个名字。性别数据尚待校对。</p>
                <button className="primary" onClick={reset}>
                  查看所有喜人
                </button>
              </div>
            )}
          </section>
          {data && (
            <details className="data-notes">
              <summary>
                关于这份图鉴 · 数据来源与收录说明 <span>↗</span>
              </summary>
              <p>
                更新于 {data.updatedAt}
                。数据保存在独立文件中，可继续校对和补充。
              </p>
              <ul>
                {data.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
              <div className="source-links">
                {data.seasons.map((s) => (
                  <a
                    key={s.id}
                    href={s.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {s.name} ↗
                  </a>
                ))}
              </div>
              {data.unresolvedCredits.length > 0 && (
                <p>
                  待核实署名：
                  {data.unresolvedCredits
                    .map((c) => `${c.unresolvedCredit}《${c.work}》`)
                    .join("、")}
                  。
                </p>
              )}
            </details>
          )}
        </main>
        <footer>
          <a className="footer-brand" href="./">
            喜人图鉴
          </a>
          <span>献给每一个认真制造快乐的人。</span>
          <span className="footer-small">MADE FOR THE LOVE OF COMEDY</span>
        </footer>
      </div>
      {selected && (
        <Detail
          person={selected}
          data={data}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
