(() => {
  // xiren/filters.mjs
  var initialFilters = {
    mode: "single",
    seasons: [],
    role: "",
    gender: "",
    tag: "",
    query: ""
  };
  function changeMode(filters, mode) {
    return {
      ...filters,
      mode,
      seasons: mode === "single" ? filters.seasons.slice(0, 1) : filters.seasons
    };
  }
  function toggleSeason(filters, id) {
    const selected = filters.seasons.includes(id);
    return {
      ...filters,
      seasons: filters.mode === "single" ? selected ? [] : [id] : selected ? filters.seasons.filter((value) => value !== id) : [...filters.seasons, id]
    };
  }
  function filterPeople(people, filters) {
    const query = filters.query.trim().toLocaleLowerCase();
    return people.filter((person) => {
      const hasSeason = (id) => person.participations.some(
        (p) => p.seasonId === id && (!filters.role || p.roles.includes(filters.role))
      );
      const seasonsMatch = !filters.seasons.length || (filters.mode === "all" ? filters.seasons.every(hasSeason) : filters.seasons.some(hasSeason));
      const roleMatch = !filters.role || person.participations.some((p) => p.roles.includes(filters.role));
      const searchText = [
        person.name,
        ...person.aliases || [],
        ...person.participations.flatMap((p) => [...p.teams, ...p.groups])
      ].join(" ").toLocaleLowerCase();
      return seasonsMatch && roleMatch && (!filters.gender || person.gender === filters.gender) && (!filters.tag || person.tags.includes(filters.tag)) && (!query || searchText.includes(query));
    });
  }
  function getTags(people) {
    return [...new Set(people.flatMap((p) => p.tags))];
  }

  // xiren/app.jsx
  var { useState, useEffect, useMemo, useRef } = React;
  var seasonColors = ["coral", "gold", "green", "blue"];
  var modes = [
    ["single", "\u5355\u5B63"],
    ["all", "\u540C\u65F6\u53C2\u52A0 \xB7 \u4EA4\u96C6"],
    ["any", "\u53C2\u52A0\u4EFB\u4E00 \xB7 \u5E76\u96C6"]
  ];
  function Avatar({ person, large = false }) {
    const [failed, setFailed] = useState(false);
    const url = typeof person.avatar === "string" ? person.avatar : person.avatar?.url;
    const tone = [...person.name].reduce((sum, c) => sum + c.codePointAt(0), 0) % 5;
    return /* @__PURE__ */ React.createElement("div", { className: `avatar tone-${tone} ${large ? "large" : ""}` }, url && !failed ? /* @__PURE__ */ React.createElement(
      "img",
      {
        src: url,
        alt: `${person.name}\u7684\u5934\u50CF`,
        loading: "lazy",
        referrerPolicy: "no-referrer",
        onError: () => setFailed(true)
      }
    ) : /* @__PURE__ */ React.createElement("div", { className: "placeholder", "aria-label": `${person.name}\uFF0C\u6682\u65E0\u5934\u50CF` }, /* @__PURE__ */ React.createElement("span", { className: "face" }, /* @__PURE__ */ React.createElement("i", null), /* @__PURE__ */ React.createElement("i", null), /* @__PURE__ */ React.createElement("b", null)), /* @__PURE__ */ React.createElement("span", { className: "avatar-name" }, person.name.slice(-2)), /* @__PURE__ */ React.createElement("small", null, "\u7B49\u4E00\u5F20\u7B11\u8138")));
  }
  function ProfileLink({ url }) {
    if (!url) return /* @__PURE__ */ React.createElement("small", { className: "muted" }, "\u6682\u65E0\u4EBA\u7269\u8D44\u6599\u94FE\u63A5");
    let label = "\u4EBA\u7269\u8D44\u6599";
    try {
      const host = new URL(url).hostname;
      if (host.includes("baidu.com")) label = "\u767E\u5EA6\u767E\u79D1";
      if (host.includes("douban.com")) label = "\u8C46\u74E3\u4EBA\u7269";
    } catch {
    }
    return /* @__PURE__ */ React.createElement("a", { className: "baike-link", href: url, target: "_blank", rel: "noreferrer" }, label, " \u2197");
  }
  function Chip({ active, children, onClick, className = "" }) {
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: `chip ${active ? "selected" : ""} ${className}`,
        "aria-pressed": active,
        onClick
      },
      children
    );
  }
  function Detail({ person, data, onClose }) {
    const ref = useRef(null);
    const closeRef = useRef(null);
    const hasWorks = person.participations.some((part) => part.works.length > 0);
    const worksById = useMemo(
      () => new Map(data.works.map((w) => [w.id, w])),
      [data]
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
              'button, a[href], summary, [tabindex="0"]'
            )
          ].filter(
            (el) => el.getClientRects().length > 0 && (!el.closest("details:not([open])") || el.tagName === "SUMMARY")
          );
          const first = els[0], last = els.at(-1);
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
    return /* @__PURE__ */ React.createElement("div", { className: "drawer-layer", onClick: onClose }, /* @__PURE__ */ React.createElement(
      "aside",
      {
        ref,
        className: "drawer",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "person-title",
        onClick: (e) => e.stopPropagation()
      },
      /* @__PURE__ */ React.createElement("div", { className: "drawer-top" }, /* @__PURE__ */ React.createElement("span", null, "\u559C\u4EBA\u6863\u6848 / PROFILE"), /* @__PURE__ */ React.createElement(
        "button",
        {
          ref: closeRef,
          className: "close",
          "aria-label": "\u5173\u95ED\u8BE6\u60C5",
          onClick: onClose
        },
        "\xD7"
      )),
      /* @__PURE__ */ React.createElement("div", { className: "profile" }, /* @__PURE__ */ React.createElement(Avatar, { person, large: true }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "eyebrow" }, "\u5F88\u9AD8\u5174\uFF0C\u5728\u8FD9\u91CC\u89C1\u5230\u4F60"), /* @__PURE__ */ React.createElement("h2", { id: "person-title" }, person.name), /* @__PURE__ */ React.createElement("div", { className: "profile-tags" }, person.tags.map((t) => /* @__PURE__ */ React.createElement("span", { key: t }, "#", t))), /* @__PURE__ */ React.createElement("p", { className: "muted" }, "\u6027\u522B\uFF1A", person.gender), /* @__PURE__ */ React.createElement(ProfileLink, { url: person.baike }))),
      /* @__PURE__ */ React.createElement("div", { className: "works-heading" }, /* @__PURE__ */ React.createElement("h3", null, "TA \u7684\u559C\u4EBA\u8DB3\u8FF9"), /* @__PURE__ */ React.createElement("span", null, person.participations.length, " \u5B63\u8DB3\u8FF9")),
      hasWorks && /* @__PURE__ */ React.createElement("p", { className: "credit-note" }, "\u4F5C\u54C1\u5173\u8054\u4F9D\u636E\u8282\u76EE\u7F72\u540D\u3001\u56E2\u961F\u5173\u7CFB\u53CA\u4E0A\u53F0\u8BB0\u5F55\u6574\u7406\uFF1B\u4E3B\u6F14\u3001\u52A9\u6F14\u540D\u5355\u53EF\u80FD\u4E0D\u5B8C\u6574\u3002"),
      person.participations.map((part) => {
        const season = data.seasons.find((s) => s.id === part.seasonId);
        return /* @__PURE__ */ React.createElement("section", { className: "season-works", key: part.seasonId }, /* @__PURE__ */ React.createElement("div", { className: "season-heading" }, /* @__PURE__ */ React.createElement(
          "span",
          {
            className: `season-label ${seasonColors[data.seasons.indexOf(season)]}`
          },
          season.tag
        ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", null, season.name), /* @__PURE__ */ React.createElement("small", null, season.year, " \xB7", " ", part.roleDetails.length ? part.roleDetails.join(" / ") : part.roles.join(" / ")))), (part.teams.length > 0 || part.groups.length > 0) && /* @__PURE__ */ React.createElement("div", { className: "affiliation" }, part.teams.length > 0 && /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("span", null, "\u5C0F\u961F"), part.teams.join("\u3001")), part.groups.length > 0 && /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("span", null, "\u5927\u56E2"), part.groups.join("\u3001"))), part.additionalSources?.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "source-links muted" }, part.additionalSources.map((url, i) => /* @__PURE__ */ React.createElement(
          "a",
          {
            key: url,
            href: url,
            target: "_blank",
            rel: "noopener noreferrer"
          },
          "\u8865\u5145\u540D\u5355\u6765\u6E90",
          part.additionalSources.length > 1 ? i + 1 : "",
          " \u2197"
        ))), part.works.length > 0 && /* @__PURE__ */ React.createElement("ul", { className: "work-list" }, part.works.map((item) => {
          const work = worksById.get(item.workId);
          return work ? /* @__PURE__ */ React.createElement("li", { key: item.workId }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, "\u300A", work.title, "\u300B"), /* @__PURE__ */ React.createElement(
            "small",
            {
              className: item.creditType === "\u4E2A\u4EBA\u7F72\u540D" ? "direct-credit" : ""
            },
            item.creditType
          )), /* @__PURE__ */ React.createElement("details", null, /* @__PURE__ */ React.createElement("summary", null, "\u67E5\u770B\u7F72\u540D\u4E0E\u6765\u6E90"), /* @__PURE__ */ React.createElement("p", null, work.episode), /* @__PURE__ */ React.createElement("p", null, "\u539F\u59CB\u7F72\u540D\uFF1A", work.sourceCredit), work.note && /* @__PURE__ */ React.createElement("p", null, work.note), /* @__PURE__ */ React.createElement(
            "a",
            {
              href: work.sourceUrl,
              target: "_blank",
              rel: "noopener noreferrer"
            },
            "\u67E5\u770B\u6765\u6E90 \u2197"
          ))) : null;
        })));
      }),
      /* @__PURE__ */ React.createElement("p", { className: "drawer-foot" }, "\u6BCF\u4E00\u4E2A\u540D\u5B57\uFF0C\u90FD\u662F\u4E00\u4EFD\u5FEB\u4E50\u7684\u6765\u5904\u3002")
    ));
  }
  function App() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [attempt, setAttempt] = useState(0);
    const [filters, setFilters] = useState(initialFilters);
    const [selected, setSelected] = useState(null);
    const [sort, setSort] = useState("name");
    const [showBackToTop, setShowBackToTop] = useState(false);
    useEffect(() => {
      const updateBackToTop = () => setShowBackToTop(window.scrollY > 480);
      updateBackToTop();
      window.addEventListener("scroll", updateBackToTop, { passive: true });
      return () => window.removeEventListener("scroll", updateBackToTop);
    }, []);
    useEffect(() => {
      const controller = new AbortController();
      setError("");
      fetch("./data.json", { signal: controller.signal }).then((response) => {
        if (!response.ok) throw new Error(`\u6570\u636E\u8BF7\u6C42\u5931\u8D25\uFF08${response.status}\uFF09`);
        return response.json();
      }).then((value) => {
        if (!Array.isArray(value.people) || !Array.isArray(value.seasons) || !Array.isArray(value.works))
          throw new Error("\u6570\u636E\u683C\u5F0F\u4E0D\u6B63\u786E");
        setData(value);
      }).catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
      return () => controller.abort();
    }, [attempt]);
    const results = useMemo(() => {
      if (!data) return [];
      return filterPeople(data.people, filters).sort(
        (a, b) => (sort === "seasons" ? b.participations.length - a.participations.length : 0) || a.name.localeCompare(b.name, "zh-CN")
      );
    }, [data, filters, sort]);
    const tags = useMemo(() => data ? getTags(data.people) : [], [data]);
    const update = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
    const reset = () => setFilters({ ...initialFilters, seasons: [] });
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
      document.querySelector(".brand")?.focus({ preventScroll: true });
    };
    const activeCount = filters.seasons.length + ["role", "gender", "tag", "query"].filter((k) => filters[k]).length;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { id: "page" }, /* @__PURE__ */ React.createElement("nav", { className: "topbar" }, /* @__PURE__ */ React.createElement("a", { className: "brand", href: "./" }, /* @__PURE__ */ React.createElement("span", { className: "brand-mark" }, "\u559C"), "\u559C\u4EBA\u56FE\u9274", /* @__PURE__ */ React.createElement("span", { className: "brand-en" }, "XIREN ARCHIVE")), /* @__PURE__ */ React.createElement("a", { className: "home-link", href: "../" }, "\u56DE\u5230\u4E3B\u9875 \u2197")), /* @__PURE__ */ React.createElement("main", null, /* @__PURE__ */ React.createElement("header", { className: "hero" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "eyebrow" }, /* @__PURE__ */ React.createElement("span", { className: "live-dot" }), " \u559C\u5267\u6563\u573A\uFF0C\u5FEB\u4E50\u4E0D\u6563"), /* @__PURE__ */ React.createElement("h1", null, "\u628A\u5FEB\u4E50\u7684\u4EBA\uFF0C", /* @__PURE__ */ React.createElement("br", { className: "mobile-break" }), "\u805A\u5728", /* @__PURE__ */ React.createElement("span", { className: "highlight" }, "\u4E00\u8D77\u3002", /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 220 14", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M3 10 Q100 0 217 7" })))), /* @__PURE__ */ React.createElement("p", null, "\u4ECE\u4E00\u5E74\u4E00\u5EA6\u559C\u5267\u5927\u8D5B\u5230\u559C\u4EBA\u5947\u5999\u591C\u3002", /* @__PURE__ */ React.createElement("br", null), "\u5728\u8FD9\u91CC\u8BA4\u8BC6\u559C\u4EBA\uFF0C\u627E\u56DE\u90A3\u4E9B\u8BA9\u4F60\u7B11\u8FC7\u7684\u821E\u53F0\u3002")), /* @__PURE__ */ React.createElement("div", { className: "hero-stamp", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("span", null, "HAPPY TOGETHER"), /* @__PURE__ */ React.createElement("div", { className: "stamp-face" }, /* @__PURE__ */ React.createElement("i", null), /* @__PURE__ */ React.createElement("i", null), /* @__PURE__ */ React.createElement("b", null)), /* @__PURE__ */ React.createElement("strong", null, "\u597D\u559C\u6B22\u4F60\u4EEC\uFF01"))), /* @__PURE__ */ React.createElement("section", { className: "filters", "aria-label": "\u7B5B\u9009\u559C\u4EBA" }, /* @__PURE__ */ React.createElement("div", { className: "filter-top" }, /* @__PURE__ */ React.createElement("div", { className: "filter-title" }, /* @__PURE__ */ React.createElement("span", null, "\u2315"), /* @__PURE__ */ React.createElement("h2", null, "\u627E\u4E00\u627E\u4F60\u7684\u5FEB\u4E50\u642D\u5B50")), /* @__PURE__ */ React.createElement("label", { className: "search" }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, "\u2315"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "search",
        "aria-label": "\u641C\u7D22\u59D3\u540D\u3001\u522B\u540D\u6216\u961F\u4F0D",
        placeholder: "\u641C\u7D22\u59D3\u540D\u3001\u522B\u540D\u6216\u961F\u4F0D\u2026",
        value: filters.query,
        onChange: (e) => update("query", e.target.value)
      }
    ))), /* @__PURE__ */ React.createElement("fieldset", { className: "season-filter-block" }, /* @__PURE__ */ React.createElement("legend", null, "\u8282\u76EE\u7B5B\u9009"), /* @__PURE__ */ React.createElement("div", { className: "filter-row mode-row" }, /* @__PURE__ */ React.createElement("span", { className: "filter-label", id: "season-mode-label" }, "\u7B5B\u9009\u6A21\u5F0F"), /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "mode-group",
        role: "group",
        "aria-labelledby": "season-mode-label"
      },
      modes.map(([id, name]) => /* @__PURE__ */ React.createElement(
        Chip,
        {
          key: id,
          active: filters.mode === id,
          onClick: () => setFilters((f) => changeMode(f, id))
        },
        name
      ))
    ), /* @__PURE__ */ React.createElement("span", { className: "mode-hint" }, filters.mode === "single" ? "\u9009\u62E9\u4E00\u5B63\uFF0C\u770B\u770B\u90FD\u6709\u8C01" : filters.mode === "all" ? "\u540C\u65F6\u53C2\u52A0\u6240\u9009\u7684\u6BCF\u4E00\u5B63" : "\u53C2\u52A0\u4EFB\u610F\u4E00\u4E2A\u6240\u9009\u5B63\u5373\u53EF")), /* @__PURE__ */ React.createElement("div", { className: "filter-row season-row" }, /* @__PURE__ */ React.createElement("span", { className: "filter-label", id: "season-label" }, "\u9009\u62E9\u8282\u76EE"), /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "chips",
        role: "group",
        "aria-labelledby": "season-label"
      },
      /* @__PURE__ */ React.createElement(
        Chip,
        {
          active: !filters.seasons.length,
          onClick: () => update("seasons", [])
        },
        "\u5168\u90E8\u8282\u76EE"
      ),
      data?.seasons.map((s, i) => /* @__PURE__ */ React.createElement(
        Chip,
        {
          key: s.id,
          active: filters.seasons.includes(s.id),
          className: `season-chip ${seasonColors[i]}`,
          onClick: () => setFilters((f) => toggleSeason(f, s.id))
        },
        /* @__PURE__ */ React.createElement("span", null, s.tag),
        s.name,
        /* @__PURE__ */ React.createElement("small", null, s.year)
      ))
    ))), /* @__PURE__ */ React.createElement("div", { className: "filter-split" }, /* @__PURE__ */ React.createElement("div", { className: "filter-row" }, /* @__PURE__ */ React.createElement("span", { className: "filter-label", id: "role-label" }, "\u4EBA\u7269\u8EAB\u4EFD"), /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "chips",
        role: "group",
        "aria-labelledby": "role-label"
      },
      [
        ["", "\u5168\u90E8"],
        ["\u6F14\u5458", "\u6F14\u5458"],
        ["\u5609\u5BBE", "\u5609\u5BBE / \u4E3B\u6301\u4EBA"]
      ].map(([id, text]) => /* @__PURE__ */ React.createElement(
        Chip,
        {
          key: id,
          active: filters.role === id,
          onClick: () => update("role", id)
        },
        text
      ))
    )), /* @__PURE__ */ React.createElement("div", { className: "filter-row" }, /* @__PURE__ */ React.createElement("span", { className: "filter-label", id: "gender-label" }, "\u6027\u522B"), /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "chips",
        role: "group",
        "aria-labelledby": "gender-label"
      },
      [
        "",
        .../* @__PURE__ */ new Set([
          "\u7537",
          "\u5973",
          ...data?.people.map((p) => p.gender).filter(Boolean) || []
        ])
      ].map((g) => /* @__PURE__ */ React.createElement(
        Chip,
        {
          key: g,
          active: filters.gender === g,
          onClick: () => update("gender", g)
        },
        g || "\u5168\u90E8"
      ))
    ))), /* @__PURE__ */ React.createElement("div", { className: "filter-row tag-row" }, /* @__PURE__ */ React.createElement("span", { className: "filter-label", id: "tag-label" }, "\u81EA\u5B9A\u4E49\u6807\u7B7E"), /* @__PURE__ */ React.createElement("div", { className: "chips", role: "group", "aria-labelledby": "tag-label" }, /* @__PURE__ */ React.createElement(Chip, { active: !filters.tag, onClick: () => update("tag", "") }, "\u5168\u90E8\u6807\u7B7E"), tags.map((tag) => /* @__PURE__ */ React.createElement(
      Chip,
      {
        key: tag,
        active: filters.tag === tag,
        onClick: () => update("tag", filters.tag === tag ? "" : tag)
      },
      "# ",
      tag
    )))), /* @__PURE__ */ React.createElement("div", { className: "filter-bottom" }, /* @__PURE__ */ React.createElement("span", null, filters.seasons.length && filters.role ? "\u8EAB\u4EFD\u6309\u6240\u9009\u8282\u76EE\u5185\u7684\u8EAB\u4EFD\u5339\u914D\uFF1B" : "", "\u4E0D\u540C\u7B5B\u9009\u6761\u4EF6\u4E4B\u95F4\u53D6\u4EA4\u96C6 \xB7 \u672A\u9009\u8282\u76EE\u8868\u793A\u4E0D\u9650"), /* @__PURE__ */ React.createElement("button", { className: "reset", onClick: reset, disabled: !activeCount }, "\u21BA \u91CD\u7F6E\u7B5B\u9009", activeCount > 0 ? ` (${activeCount})` : ""))), /* @__PURE__ */ React.createElement("section", { className: "results", "aria-labelledby": "results-heading" }, /* @__PURE__ */ React.createElement("div", { className: "results-toolbar" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { id: "results-heading" }, activeCount ? "\u627E\u5230\u8FD9\u4E9B\u559C\u4EBA" : "\u6240\u6709\u559C\u4EBA", " ", /* @__PURE__ */ React.createElement("span", null, results.length, /* @__PURE__ */ React.createElement("small", null, " \u4F4D"))), /* @__PURE__ */ React.createElement("p", { "aria-live": "polite" }, data ? `\u5171\u6536\u5F55 ${data.people.length} \u4F4D \xB7 \u70B9\u51FB\u5361\u7247\uFF0C\u770B\u770B TA \u7684\u559C\u5267\u8DB3\u8FF9` : "\u6B63\u5728\u52A0\u8F7D\u559C\u4EBA\u6863\u6848\u2026")), /* @__PURE__ */ React.createElement("label", { className: "sort" }, "\u6392\u5E8F", " ", /* @__PURE__ */ React.createElement(
      "select",
      {
        "aria-label": "\u6392\u5E8F",
        value: sort,
        onChange: (e) => setSort(e.target.value)
      },
      /* @__PURE__ */ React.createElement("option", { value: "name" }, "\u59D3\u540D A\u2013Z"),
      /* @__PURE__ */ React.createElement("option", { value: "seasons" }, "\u53C2\u52A0\u5B63\u6570\u4F18\u5148")
    ))), error ? /* @__PURE__ */ React.createElement("div", { className: "empty", role: "alert" }, /* @__PURE__ */ React.createElement("span", null, ":("), /* @__PURE__ */ React.createElement("h3", null, "\u6863\u6848\u6682\u65F6\u6CA1\u6253\u5F00"), /* @__PURE__ */ React.createElement("p", null, error, "\u3002\u8BF7\u901A\u8FC7\u672C\u5730 HTTP \u670D\u52A1\u6253\u5F00\u9875\u9762\u3002"), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "primary",
        onClick: () => setAttempt((a) => a + 1)
      },
      "\u91CD\u65B0\u52A0\u8F7D"
    )) : !data ? /* @__PURE__ */ React.createElement("div", { className: "skeleton-grid", "aria-label": "\u6B63\u5728\u52A0\u8F7D" }, Array.from({ length: 12 }, (_, i) => /* @__PURE__ */ React.createElement("div", { className: "skeleton", key: i }))) : results.length ? /* @__PURE__ */ React.createElement("div", { className: "people-grid" }, results.map((person) => /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "person-card",
        key: person.id,
        onClick: () => setSelected(person),
        "aria-label": `\u67E5\u770B${person.name}\u7684\u8BE6\u60C5`
      },
      /* @__PURE__ */ React.createElement("div", { className: "portrait-wrap" }, /* @__PURE__ */ React.createElement(Avatar, { person }), /* @__PURE__ */ React.createElement("span", { className: "card-arrow", "aria-hidden": "true" }, "\u2197"), /* @__PURE__ */ React.createElement("span", { className: "season-count" }, person.participations.length, " \u5B63\u8DB3\u8FF9")),
      /* @__PURE__ */ React.createElement("div", { className: "card-info" }, /* @__PURE__ */ React.createElement("h3", null, person.name), /* @__PURE__ */ React.createElement("p", null, [
        ...new Set(
          person.participations.flatMap((p) => p.roles)
        )
      ].join(" \xB7 ")), /* @__PURE__ */ React.createElement("div", { className: "season-dots" }, data.seasons.map(
        (s, i) => person.participations.some(
          (p) => p.seasonId === s.id
        ) && /* @__PURE__ */ React.createElement("span", { key: s.id, className: seasonColors[i] }, s.tag)
      )))
    ))) : /* @__PURE__ */ React.createElement("div", { className: "empty" }, /* @__PURE__ */ React.createElement("span", null, "\u25E1"), /* @__PURE__ */ React.createElement("h3", null, "\u8FD9\u4E2A\u7EC4\u5408\uFF0C\u8FD8\u6CA1\u6709\u627E\u5230\u559C\u4EBA"), /* @__PURE__ */ React.createElement("p", null, "\u8BD5\u8BD5\u51CF\u5C11\u7B5B\u9009\u6761\u4EF6\uFF0C\u6216\u6362\u4E2A\u540D\u5B57\u3002"), /* @__PURE__ */ React.createElement("button", { className: "primary", onClick: reset }, "\u67E5\u770B\u6240\u6709\u559C\u4EBA"))), data && /* @__PURE__ */ React.createElement("details", { className: "data-notes" }, /* @__PURE__ */ React.createElement("summary", null, "\u5173\u4E8E\u8FD9\u4EFD\u56FE\u9274 \xB7 \u6570\u636E\u6765\u6E90\u4E0E\u6536\u5F55\u8BF4\u660E ", /* @__PURE__ */ React.createElement("span", null, "\u2197")), /* @__PURE__ */ React.createElement("p", null, "\u66F4\u65B0\u4E8E ", data.updatedAt, "\u3002\u6570\u636E\u4FDD\u5B58\u5728\u72EC\u7ACB\u6587\u4EF6\u4E2D\uFF0C\u53EF\u7EE7\u7EED\u6821\u5BF9\u548C\u8865\u5145\u3002"), /* @__PURE__ */ React.createElement("ul", null, data.notes.map((note) => /* @__PURE__ */ React.createElement("li", { key: note }, note))), /* @__PURE__ */ React.createElement("div", { className: "source-links" }, data.seasons.map((s) => /* @__PURE__ */ React.createElement(
      "a",
      {
        key: s.id,
        href: s.sourceUrl,
        target: "_blank",
        rel: "noopener noreferrer"
      },
      s.name,
      " \u2197"
    ))), data.unresolvedCredits.length > 0 && /* @__PURE__ */ React.createElement("p", null, "\u5F85\u6838\u5B9E\u7F72\u540D\uFF1A", data.unresolvedCredits.map((c) => `${c.unresolvedCredit}\u300A${c.work}\u300B`).join("\u3001"), "\u3002"))), /* @__PURE__ */ React.createElement("footer", null, /* @__PURE__ */ React.createElement("a", { className: "footer-brand", href: "./" }, "\u559C\u4EBA\u56FE\u9274"), /* @__PURE__ */ React.createElement("span", null, "\u732E\u7ED9\u6BCF\u4E00\u4E2A\u8BA4\u771F\u5236\u9020\u5FEB\u4E50\u7684\u4EBA\u3002"), /* @__PURE__ */ React.createElement("span", { className: "footer-small" }, "MADE FOR THE LOVE OF COMEDY")), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: `back-to-top ${showBackToTop ? "visible" : ""}`,
        "aria-label": "\u56DE\u5230\u9876\u90E8",
        "aria-hidden": !showBackToTop,
        tabIndex: showBackToTop ? 0 : -1,
        onClick: scrollToTop
      },
      /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, "\u2191"),
      /* @__PURE__ */ React.createElement("span", null, "\u56DE\u5230\u9876\u90E8")
    )), selected && /* @__PURE__ */ React.createElement(
      Detail,
      {
        person: selected,
        data,
        onClose: () => setSelected(null)
      }
    ));
  }
  ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
})();
