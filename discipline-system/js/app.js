/* App: pages, setup wizard, sharing, focus timer, reminders and install. */
(function () {
  "use strict";
  const DS = window.DS;
  const $ = (id) => document.getElementById(id);

  let state = DS.load();
  const now0 = new Date();
  const ui = {
    page: "today",
    day: DS.todayKey(),
    view: { y: now0.getFullYear(), m: now0.getMonth() },
    habitEditor: null,    // habit id being edited, or "new"
    routineEditor: null,
    goalEditor: null,
    editLists: { lies: false, truths: false },
    confirm: null,        // key of a button waiting for its second tap
    shared: null,         // a setup someone shared through a link
    journalQuery: "",
    journalLimit: 30,
    wiz: null,
    moreOpen: false,
  };

  // ---------- saving ----------
  let saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      if (!DS.persist(state)) toast("Not saved: this browser has storage turned off");
    }, 250);
  }
  window.addEventListener("pagehide", () => { clearTimeout(saveTimer); DS.persist(state); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) { clearTimeout(saveTimer); DS.persist(state); } });

  let toastTimer = null;
  function toast(msg) {
    const t = $("status");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
  }

  // ---------- DOM helper ----------
  function el(tag, attrs = {}, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === false || v == null) continue;
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
      else if (k === "value") n.value = v;
      else if (k in n && typeof v !== "string") n[k] = v;
      else n.setAttribute(k, v === true ? "" : v);
    }
    kids.flat(Infinity).forEach((c) => c != null && c !== false && n.append(c));
    return n;
  }
  const svgNS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs = {}, ...kids) {
    const n = document.createElementNS(svgNS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    kids.flat().forEach((c) => c != null && n.append(c));
    return n;
  }

  const ICONS = {
    today: "M4 5h16v15H4zM4 9h16M8 3v4M16 3v4M8.5 14.5l2 2 4-4.5",
    tracker: "M4 4h16v16H4zM4 9.3h16M4 14.6h16M9.3 4v16M14.6 4v16",
    goals: "M6 21V4M6 4h11l-2 4 2 4H6",
    focus: "M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4l3 2M10 2h4",
    more: "M5 12h.01M12 12h.01M19 12h.01",
  };
  const icon = (name) => svg("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": name === "more" ? "3.2" : "1.8", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" }, svg("path", { d: ICONS[name] }));

  const fmtNum = (n) => (n >= 1000 ? `${+(n / 1000).toFixed(1)}k` : String(+Number(n).toFixed(1)));
  const dateLabel = (k) => { const d = DS.parseKey(k); return `${DS.WD_SHORT[d.getDay()]} ${DS.pad(d.getDate())}/${DS.pad(d.getMonth() + 1)}`; };
  const longDate = (k) => DS.parseKey(k).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const isFuture = (k) => k > DS.todayKey();
  const quoteOfDay = () => { const d = new Date(); const n = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000); return DS.QUOTES[n % DS.QUOTES.length]; };

  // Two-tap confirmation for destructive buttons (dialogs aren't reliable everywhere).
  function confirmBtn(key, label, armedLabel, action, cls = "btn danger") {
    const armed = ui.confirm === key;
    return el("button", { class: cls, text: armed ? armedLabel : label, onclick: () => {
      if (ui.confirm !== key) { ui.confirm = key; render(); setTimeout(() => { if (ui.confirm === key) { ui.confirm = null; render(); } }, 4000); return; }
      ui.confirm = null; action();
    } });
  }

  // ---------- style ----------
  function applyStyle() {
    const r = document.documentElement, s = state.style;
    r.dataset.paper = s.paper; r.dataset.tone = s.tone; r.dataset.pen = s.pen; r.dataset.font = s.font;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", getComputedStyle(r).getPropertyValue("--desk").trim() || "#d6d7d4");
  }

  // ---------- navigation ----------
  const PAGES = {
    today: { label: "Today", icon: "today" },
    tracker: { label: "Tracker", icon: "tracker" },
    goals: { label: "Goals", icon: "goals" },
    focus: { label: "Focus", icon: "focus" },
    journal: { label: "Journal" },
    stats: { label: "Stats" },
    lies: { label: "30 Lies" },
    settings: { label: "Settings" },
  };
  const PHONE_MAIN = ["today", "tracker", "goals", "focus"];

  function go(page) {
    ui.scrollToday = true;
    ui.page = PAGES[page] || page === "setup" ? page : "today";
    ui.moreOpen = false;
    try { history.replaceState(null, "", "#" + ui.page); } catch (e) { /* ignore */ }
    render();
    window.scrollTo(0, 0);
  }

  function renderNav() {
    const nav = $("nav");
    nav.hidden = ui.page === "setup";
    nav.replaceChildren(
      ...Object.entries(PAGES).map(([id, p]) => el("button", {
        class: PHONE_MAIN.includes(id) ? "" : "wide-only",
        "aria-current": ui.page === id ? "page" : "false",
        onclick: () => go(id),
      }, p.icon ? icon(p.icon) : null, el("span", { text: p.label }))),
      el("button", { class: "phone-only", "aria-current": PHONE_MAIN.includes(ui.page) ? "false" : "page", "aria-expanded": String(ui.moreOpen),
        onclick: () => { ui.moreOpen = !ui.moreOpen; renderNav(); } }, icon("more"), el("span", { text: "More" }))
    );
    const menu = $("more-menu");
    menu.hidden = !ui.moreOpen;
    menu.replaceChildren(...["journal", "stats", "lies", "settings"].map((id) => el("button", { text: PAGES[id].label, onclick: () => go(id) })));
  }

  // ---------- render ----------
  function render() {
    applyStyle();
    renderNav();
    const focusId = document.activeElement && document.activeElement.id;
    const page = $("page");
    const fn = { today: pageToday, tracker: pageTracker, goals: pageGoals, focus: pageFocus, journal: pageJournal,
      stats: pageStats, lies: pageLies, settings: pageSettings, setup: pageSetup }[ui.page] || pageToday;
    page.replaceChildren(...[].concat(fn()).filter((c) => c != null && c !== false));
    page.setAttribute("aria-label", ui.page === "setup" ? "Set up" : PAGES[ui.page].label);
    if (focusId) { const f = document.getElementById(focusId); if (f) f.focus({ preventScroll: true }); }
    if (ui.page === "tracker" && ui.scrollToday !== false) {
      const wrap = page.querySelector(".scroll-x"), cell = page.querySelector(".tracker thead th.today");
      if (wrap && cell) wrap.scrollLeft = Math.max(0, cell.offsetLeft - wrap.clientWidth + 120);
      ui.scrollToday = false;
    }
  }

  // ---------- shared pieces ----------
  function setHabitValue(h, k, v) {
    const r = DS.dayForWrite(state, k);
    if (!v) delete r.h[h.id]; else r.h[h.id] = v;
    const s = DS.dayScore(state, k);
    if (h.section === "core" && s && s.done === s.due && DS.isDone(h, v)) toast("Every non-negotiable done. Day won!");
    save(); render();
  }

  function habitItem(h, k, rec, locked) {
    const v = rec.h[h.id];
    const done = DS.isDone(h, v);
    const li = el("li", { class: done ? "done" : v === -1 ? "missed" : "" });
    if (h.type === "count") {
      const n = Number(v) > 0 ? Number(v) : 0;
      const step = h.target >= 100 ? Math.round(h.target / 10) : 1;
      li.append(
        el("span", { class: "name", style: "flex:1" }, h.name, h.unit ? el("span", { class: "meta", text: `  ${h.unit}` }) : null),
        el("div", { class: "counter" + (done ? " full" : "") },
          el("button", { id: `dec-${h.id}`, "aria-label": `Less ${h.name}`, text: "−", disabled: locked || n <= 0, onclick: () => setHabitValue(h, k, Math.max(0, n - step)) }),
          el("output", { text: `${fmtNum(n)}/${fmtNum(h.target)}` }),
          el("button", { id: `inc-${h.id}`, "aria-label": `More ${h.name}`, text: "+", disabled: locked, onclick: () => setHabitValue(h, k, n + step) })));
    } else {
      li.append(el("label", {},
        el("input", { type: "checkbox", class: "box", id: `hb-${h.id}`, checked: done, disabled: locked,
          onchange: (e) => setHabitValue(h, k, e.target.checked ? 1 : 0) }),
        el("span", { class: "name", text: h.name })));
    }
    return li;
  }

  function scaleRow(label, field, rec, k, locked, faces) {
    return el("div", { class: "scale-row" },
      el("span", { class: "lbl", text: label }),
      el("div", { class: "scale", role: "group", "aria-label": label },
        [1, 2, 3, 4, 5].map((n) => el("button", {
          id: `${field}-${n}`, text: faces[n - 1], "aria-pressed": String(rec[field] === n), "aria-label": `${label} ${n} of 5`, disabled: locked,
          onclick: () => { const r = DS.dayForWrite(state, k); r[field] = r[field] === n ? 0 : n; save(); render(); } }))));
  }

  // ============ TODAY ============
  function pageToday() {
    const k = ui.day, today = DS.todayKey(), rec = DS.dayOf(state, k), locked = isFuture(k);
    const core = state.habits.filter((h) => h.section === "core");
    const other = state.habits.filter((h) => h.section === "other");
    const dueCore = core.filter((h) => DS.dueOn(h, k)), restCore = core.filter((h) => !DS.dueOn(h, k));
    const dueOther = other.filter((h) => DS.dueOn(h, k));
    const score = DS.dayScore(state, k);
    const hr = new Date().getHours();
    const hello = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
    const out = [];

    if (ui.shared) out.push(sharedBanner());
    if (!isStandalone() && !state.settings.hideInstallHint) {
      out.push(el("div", { class: "banner" },
        el("p", {}, "Use this like an app: install it on your phone's home screen. It works offline and keeps everything on your device."),
        el("div", { class: "btn-row" },
          el("button", { class: "btn primary", text: "How to install", onclick: () => go("settings") }),
          el("button", { class: "small-btn", text: "Hide", onclick: () => { state.settings.hideInstallHint = true; save(); render(); } }))));
    }

    out.push(el("div", { class: "title-row" },
      el("h1", { text: state.profile.title || "My Discipline System" }),
      el("div", { class: "day-nav" },
        el("button", { id: "day-prev", "aria-label": "Previous day", text: "‹", onclick: () => { ui.day = DS.addDays(ui.day, -1); render(); } }),
        el("span", { class: "date-chip", text: dateLabel(k) }),
        el("button", { id: "day-next", "aria-label": "Next day", text: "›", onclick: () => { ui.day = DS.addDays(ui.day, 1); render(); } }))));

    out.push(el("p", { class: "greeting" },
      k === today ? `${hello}${state.profile.name ? ", " + state.profile.name : ""}.` : `${longDate(k)}. `,
      k !== today ? el("button", { class: "linkish", text: "Back to today", onclick: () => { ui.day = today; render(); } }) : null,
      state.profile.why && k === today ? el("span", { class: "sub", text: `  Why: ${state.profile.why}` }) : null));

    const nnList = el("ul", { class: "checklist" }, dueCore.map((h) => habitItem(h, k, rec, locked)));
    if (!core.length) nnList.append(el("li", { class: "empty" }, "No non-negotiables yet. ", el("button", { class: "linkish", text: "Add habits", onclick: () => go("settings") })));
    else if (!dueCore.length) nnList.append(el("li", { class: "empty", text: "Rest day. Nothing is scheduled." }));

    out.push(el("div", { class: "grid-2 mt" },
      el("section", {},
        el("div", { class: "sec-head" }, el("h2", { text: "Daily Non-Negotiables" }), score ? el("span", { class: "count", text: `${score.done}/${score.due}` }) : null),
        nnList,
        restCore.length ? el("p", { class: "hint", text: `Not scheduled today: ${restCore.map((h) => h.name).join(", ")}` }) : null),
      el("div", { class: "stack" },
        el("section", { class: "boxed" },
          el("div", { class: "sec-head" }, el("h2", { text: "Other Habits" }),
            dueOther.length ? el("span", { class: "count", text: `${dueOther.filter((h) => DS.isDone(h, rec.h[h.id])).length}/${dueOther.length}` }) : null),
          el("ul", { class: "checklist" }, dueOther.length ? dueOther.map((h) => habitItem(h, k, rec, locked)) : el("li", { class: "empty", text: "Nothing extra today." }))),
        el("section", {},
          el("h2", { text: "Reminder:" }),
          el("textarea", { class: "reminder-text", id: "reminder", rows: 2, "aria-label": "Reminder", value: state.reminder,
            oninput: (e) => { state.reminder = e.target.value; save(); } })))));

    if (state.routines.length) {
      out.push(el("section", { class: "mt" },
        el("h2", { text: "Routines" }),
        el("div", { class: "grid-even" }, state.routines.map((r) => routineBlock(r, k, rec, locked)))));
    }

    const will = rec.will || DS.blankDay().will;
    out.push(el("div", { class: "grid-2 mt" },
      el("section", {},
        el("h2", { text: k === today ? "Today I Will:" : "That Day I Will:" }),
        el("div", {}, [0, 1, 2].map((i) => el("div", { class: "will-row" },
          el("input", { type: "checkbox", class: "box", id: `will-done-${i}`, checked: !!(will[i] && will[i].done), disabled: locked, "aria-label": `Done: intention ${i + 1}`,
            onchange: (e) => { DS.dayForWrite(state, k).will[i].done = e.target.checked; save(); } }),
          el("input", { class: "line-input", id: `will-${i}`, value: (will[i] && will[i].text) || "", "aria-label": `Intention ${i + 1}`,
            placeholder: ["Stay focused", "Block out distractions", "Be the person I want to become"][i],
            oninput: (e) => { DS.dayForWrite(state, k).will[i].text = e.target.value; save(); } })))),
        el("div", { class: "mt" },
          scaleRow("Mood", "mood", rec, k, locked, ["1", "2", "3", "4", "5"]),
          scaleRow("Energy", "energy", rec, k, locked, ["1", "2", "3", "4", "5"]))),
      el("section", {},
        el("h2", { text: "Notes / Reflections" }),
        el("div", { class: "will-row" }, el("span", { class: "sub", text: "Win:" }),
          el("input", { class: "line-input", id: "win", value: rec.win || "", placeholder: "One thing I'm proud of", "aria-label": "Win of the day",
            oninput: (e) => { DS.dayForWrite(state, k).win = e.target.value; save(); } })),
        el("textarea", { class: "notes", id: "notes", value: rec.notes || "", "aria-label": "Notes and reflections",
          placeholder: "- Energy was low in the morning\n- Better in the evening\n- Need to plan meals better",
          oninput: (e) => { DS.dayForWrite(state, k).notes = e.target.value; save(); } }))));

    const mp = DS.monthProgress(state, DS.parseKey(k).getFullYear(), DS.parseKey(k).getMonth());
    out.push(el("div", { class: "footer-row" },
      el("div", { class: "score" },
        el("span", { class: "label", text: "Today's progress:" }),
        el("span", { class: "pct", text: score ? `${Math.round(score.pct * 100)}%` : "—" }),
        el("div", { class: "stats-inline" },
          el("span", {}, "streak ", el("b", { text: DS.streak(state) }), " days"),
          el("span", {}, "month ", el("b", { text: `${mp.pct}%` })),
          rec.focus ? el("span", {}, "focus ", el("b", { text: rec.focus }), " min") : null)),
      el("p", { class: "motto", text: quoteOfDay() })));
    return out;
  }

  function routineBlock(r, k, rec, locked) {
    const doneIds = new Set((rec.r && rec.r[r.id]) || []);
    const doneCount = r.steps.filter((s) => doneIds.has(s.id)).length;
    const det = el("details", { class: "routine", open: doneCount < r.steps.length },
      el("summary", {}, el("span", { class: "rname", text: r.name }),
        el("span", { class: "count", text: `${r.time ? r.time + " · " : ""}${doneCount}/${r.steps.length}` })),
      el("ul", { class: "checklist" }, r.steps.map((s) => el("li", { class: doneIds.has(s.id) ? "done" : "" },
        el("label", {}, el("input", { type: "checkbox", class: "box", id: `rs-${s.id}`, checked: doneIds.has(s.id), disabled: locked,
          onchange: (e) => {
            const d = DS.dayForWrite(state, k);
            const set = new Set(d.r[r.id] || []);
            e.target.checked ? set.add(s.id) : set.delete(s.id);
            d.r[r.id] = [...set];
            if (r.steps.every((st) => set.has(st.id))) toast(`${r.name} complete`);
            save(); render();
          } }), el("span", { class: "name", text: s.name }))))));
    return det;
  }

  // ============ TRACKER ============
  function pageTracker() {
    const { y, m } = ui.view, n = DS.daysIn(y, m), today = DS.todayKey();
    const keys = Array.from({ length: n }, (_, i) => DS.keyOf(y, m, i + 1));
    const mp = DS.monthProgress(state, y, m);

    const head = el("tr", {}, el("th", { scope: "col", text: "Habits" }),
      keys.map((k, i) => el("th", { scope: "col", class: [k === today && "today"].filter(Boolean).join(" ") },
        el("button", { class: "day-head", disabled: isFuture(k), "aria-label": `Open ${longDate(k)}`, onclick: () => { ui.day = k; go("today"); } },
          el("span", { text: i + 1 }), el("small", { text: DS.WD_LETTER[DS.parseKey(k).getDay()] })))),
      el("th", { scope: "col", class: "end", text: "%" }));

    const first = DS.firstDay(state);
    const rowsFor = (list) => list.map((h) => {
      let due = 0, done = 0;
      const cells = keys.map((k, i) => {
        const fut = isFuture(k), isDue = DS.dueOn(h, k), v = DS.dayOf(state, k).h[h.id];
        const ok = DS.isDone(h, v);
        if (isDue && !fut && k >= first && (k !== today || ok)) { due++; if (ok) done++; }
        const cls = [k === today && "today", fut && "future", !isDue && "rest"].filter(Boolean).join(" ");
        let txt = "", state_ = "0";
        if (ok) { txt = "✓"; state_ = "1"; } else if (v === -1) { txt = "✗"; state_ = "-1"; }
        const btn = el("button", { class: "cell" + (!isDue ? " off" : ""), "data-v": state_, disabled: fut,
          "aria-label": `${h.name}, ${longDate(k)}: ${ok ? "done" : v === -1 ? "missed" : isDue ? "not marked" : "rest day"}`,
          onclick: () => {
            const cur = DS.dayOf(state, k).h[h.id];
            let next;
            if (DS.isDone(h, cur)) next = -1; else if (cur === -1) next = 0; else next = h.type === "count" ? h.target : 1;
            const r = DS.dayForWrite(state, k);
            if (next) r.h[h.id] = next; else delete r.h[h.id];
            save(); render();
          } });
        if (txt) btn.textContent = txt;
        else if (h.type === "count" && Number(v) > 0) btn.append(el("span", { class: "num", text: fmtNum(v) }));
        else if (!isDue && !fut) btn.textContent = "·";
        return el("td", { class: cls }, btn);
      });
      return el("tr", {}, el("th", { scope: "row", title: h.name, text: h.name }), cells,
        el("td", { class: "end", text: due ? `${Math.round((done / due) * 100)}%` : "" }));
    });

    const core = state.habits.filter((h) => h.section === "core"), other = state.habits.filter((h) => h.section === "other");
    const body = el("tbody", {}, rowsFor(core));
    if (other.length) {
      body.append(el("tr", {}, el("th", { scope: "rowgroup", class: "sub", text: "Other habits" }), el("td", { colspan: n + 1, style: "border-left:0;border-right:0" })));
      body.append(...rowsFor(other));
    }
    if (!state.habits.length) body.append(el("tr", {}, el("th", { text: "Add habits in Settings to start tracking" })));

    const foot = el("tr", {}, el("th", { text: "Score" }), keys.map((k) => {
      const s = DS.dayScore(state, k);
      return el("td", { class: k === today ? "today" : "", text: isFuture(k) || !s ? "" : `${s.done}` });
    }), el("td", { class: "end" }));

    const wonNums = el("tr"), wonMarks = el("tr");
    keys.forEach((k, i) => {
      const w = DS.won(state, k), cls = k === today ? "today" : "";
      wonNums.append(el("td", { class: cls, text: i + 1 }));
      wonMarks.append(el("td", { class: cls, text: w ? "✗" : "", title: w ? "Day won" : "" }));
    });

    return [
      el("div", { class: "title-row" }, el("h1", { text: "Habit Tracker" }),
        el("div", { class: "month-nav" },
          el("button", { id: "m-prev", "aria-label": "Previous month", text: "‹", onclick: () => { ui.view.m--; if (ui.view.m < 0) { ui.view.m = 11; ui.view.y--; } render(); } }),
          el("span", { class: "month-label", text: `${DS.MONTHS[m]} ${y}` }),
          el("button", { id: "m-next", "aria-label": "Next month", text: "›", onclick: () => { ui.view.m++; if (ui.view.m > 11) { ui.view.m = 0; ui.view.y++; } render(); } }))),
      el("p", { class: "hint", text: "Tap a box: empty → ✓ done → ✗ missed → empty. Striped boxes are rest days. Tap a day number to open that day." }),
      el("div", { class: "scroll-x" }, el("table", { class: "tracker" }, el("thead", {}, head), body, el("tfoot", {}, foot))),
      el("section", { class: "mt" },
        el("h2", { text: "Progress this month:" }),
        el("p", { class: "hint", text: "A day gets an ✗ when every non-negotiable is done." }),
        el("div", { class: "scroll-x" }, el("table", { class: "won-row" }, el("tbody", {}, wonNums, wonMarks)))),
      el("div", { class: "footer-row" },
        el("div", { class: "score" }, el("span", { class: "label", text: "Overall progress:" }), el("span", { class: "pct", text: `${mp.pct}%` }),
          el("div", { class: "stats-inline" }, el("span", {}, "days won ", el("b", { text: mp.wonDays })), el("span", {}, "streak ", el("b", { text: DS.streak(state) })))),
        el("p", { class: "motto" }, "Keep ", el("u", { text: "showing up." }), el("br"), "Your future self is", el("br"), el("u", { text: "counting on you." }))),
    ];
  }

  // ============ GOALS ============
  const AREAS = ["Health", "Mind", "Faith", "Money", "Career", "School", "Relationships", "Skills", "Other"];

  function goalEditor(g) {
    const isNew = !g;
    const draft = g ? { ...g, milestones: (g.milestones || []).map((m) => ({ ...m })) } : { title: "", why: "", due: "", area: "Health", milestones: [] };
    const f = {};
    const form = el("form", { class: "editor form", onsubmit: (e) => {
      e.preventDefault();
      const title = f.title.value.trim();
      if (!title) { toast("Give the goal a name"); f.title.focus(); return; }
      const lines = f.ms.value.split("\n").map((s) => s.trim()).filter(Boolean);
      const old = new Map(draft.milestones.map((m) => [m.name, m]));
      const milestones = lines.map((name) => old.get(name) || { id: DS.uid(), name, done: false });
      if (isNew) state.goals.unshift({ id: DS.uid(), title, why: f.why.value.trim(), due: f.due.value, area: f.area.value, milestones, done: false, created: DS.todayKey() });
      else Object.assign(g, { title, why: f.why.value.trim(), due: f.due.value, area: f.area.value, milestones });
      ui.goalEditor = null; save(); render(); toast(isNew ? "Goal added" : "Goal saved");
    } },
      el("label", { class: "field" }, el("span", { text: "Goal" }), f.title = el("input", { id: "g-title", value: draft.title, placeholder: "Run a half marathon", required: true })),
      el("label", { class: "field" }, el("span", { text: "Why it matters" }), f.why = el("input", { id: "g-why", value: draft.why, placeholder: "To prove I can finish hard things" })),
      el("div", { class: "field-row" },
        el("label", { class: "field" }, el("span", { text: "Target date" }), f.due = el("input", { id: "g-due", type: "date", value: draft.due })),
        el("label", { class: "field" }, el("span", { text: "Area" }), f.area = el("select", { id: "g-area" }, AREAS.map((a) => el("option", { value: a, text: a, selected: a === draft.area }))))),
      el("label", { class: "field" }, el("span", { text: "Milestones (one per line)" }),
        f.ms = el("textarea", { id: "g-ms", value: draft.milestones.map((m) => m.name).join("\n"), placeholder: "Run 5k without stopping\nRun 10k\nRun 15k\nRace day" })),
      el("div", { class: "btn-row" },
        el("button", { class: "btn primary", type: "submit", text: isNew ? "Add goal" : "Save goal" }),
        el("button", { class: "btn", type: "button", text: "Cancel", onclick: () => { ui.goalEditor = null; render(); } })));
    return form;
  }

  function goalCard(g) {
    if (ui.goalEditor === g.id) return goalEditor(g);
    const p = DS.goalProgress(g);
    let dueChip = null;
    if (g.due && !g.done) {
      const left = DS.daysBetween(DS.todayKey(), g.due);
      dueChip = el("span", { class: "chip" + (left <= 7 ? " due-soon" : ""), text: left < 0 ? `${-left} days overdue` : left === 0 ? "Due today" : `${left} days left` });
    }
    return el("article", { class: "goal" + (g.done ? " achieved" : "") },
      el("div", { class: "goal-meta" }, el("span", { class: "chip", text: g.area || "Goal" }), g.done ? el("span", { class: "stamp", text: "Achieved" }) : dueChip),
      el("div", { class: "gtitle", text: g.title }),
      g.why ? el("p", { class: "why", text: g.why }) : null,
      el("div", { class: "bar", role: "img", "aria-label": `${Math.round(p * 100)}% complete` }, el("span", { style: `width:${Math.round(p * 100)}%` })),
      el("div", { class: "goal-meta" }, el("span", { text: `${Math.round(p * 100)}% done` }), g.due ? el("span", { text: `Target ${dateLabel(g.due)}` }) : null),
      (g.milestones || []).length ? el("ul", { class: "checklist" }, g.milestones.map((ms) => el("li", { class: ms.done ? "done" : "" },
        el("label", {}, el("input", { type: "checkbox", class: "box", id: `ms-${ms.id}`, checked: ms.done, onchange: (e) => {
          ms.done = e.target.checked;
          if (g.milestones.every((x) => x.done) && !g.done) toast("All milestones done. Mark the goal achieved!");
          save(); render();
        } }), el("span", { class: "name", text: ms.name }))))) : null,
      el("div", { class: "btn-row" },
        el("button", { class: "btn", text: g.done ? "Reopen" : "Mark achieved", onclick: () => { g.done = !g.done; g.doneOn = g.done ? DS.todayKey() : ""; save(); render(); if (g.done) toast("Goal achieved. Well done!"); } }),
        el("button", { class: "small-btn", text: "Edit", onclick: () => { ui.goalEditor = g.id; render(); } }),
        confirmBtn(`del-goal-${g.id}`, "Delete", "Tap again to delete", () => { state.goals = state.goals.filter((x) => x !== g); save(); render(); }, "small-btn")));
  }

  function pageGoals() {
    const active = state.goals.filter((g) => !g.done), achieved = state.goals.filter((g) => g.done);
    return [
      el("div", { class: "title-row" }, el("h1", { text: "My Goals" }),
        el("button", { class: "btn primary", id: "add-goal", text: "+ New goal", onclick: () => { ui.goalEditor = "new"; render(); } })),
      el("p", { class: "hint", text: "Break each goal into milestones. Your daily habits are how you reach them." }),
      ui.goalEditor === "new" ? goalEditor(null) : null,
      el("div", { class: "grid-even mt" }, active.length ? active.map(goalCard) : el("p", { class: "empty", text: "No goals yet. Add one you want to reach in the next 3 to 12 months." })),
      achieved.length ? el("details", { class: "mt" }, el("summary", { text: `Achieved (${achieved.length})` }),
        el("div", { class: "grid-even mt" }, achieved.map(goalCard))) : null,
    ];
  }

  // ============ FOCUS TIMER ============
  const timer = { mode: "focus", running: false, endAt: 0, remaining: 0, task: "" };
  function timerLength(mode) { return (mode === "focus" ? state.settings.focusMins : state.settings.breakMins) * 60000; }
  timer.remaining = timerLength("focus");
  function timerLeft() { return timer.running ? Math.max(0, timer.endAt - Date.now()) : timer.remaining; }
  function fmtClock(ms) { const s = Math.ceil(ms / 1000); return `${DS.pad(Math.floor(s / 60))}:${DS.pad(s % 60)}`; }

  function timerFinish() {
    timer.running = false;
    if (timer.mode === "focus") {
      const mins = state.settings.focusMins;
      const d = DS.dayForWrite(state, DS.todayKey());
      d.focus = (d.focus || 0) + mins;
      d.sessions = (d.sessions || []).concat([{ at: new Date().toTimeString().slice(0, 5), mins, task: timer.task.trim() }]);
      save();
      notify("Focus session done", `${mins} minutes of deep work logged. Take a break.`);
      toast(`${mins} minutes logged`);
      timer.mode = "break";
    } else {
      notify("Break over", "Back to work. Start the next focus session.");
      timer.mode = "focus";
    }
    timer.remaining = timerLength(timer.mode);
    beep();
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    if (ui.page === "focus") render();
  }
  setInterval(() => {
    if (!timer.running) return;
    if (timerLeft() <= 0) { timerFinish(); return; }
    if (ui.page === "focus") {
      const c = $("clock"); if (c) c.textContent = fmtClock(timerLeft());
      const arc = $("arc"); if (arc) arc.setAttribute("stroke-dashoffset", String(arcOffset()));
    }
    document.title = timer.running ? `${fmtClock(timerLeft())} · Focus` : "My Discipline System";
  }, 500);
  const ARC_LEN = 2 * Math.PI * 90;
  const arcOffset = () => ARC_LEN * (1 - timerLeft() / timerLength(timer.mode));

  let audioCtx = null;
  function beep() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.25, 0.5].forEach((t) => {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.frequency.value = 880; g.gain.value = 0.15;
        o.connect(g); g.connect(audioCtx.destination);
        o.start(audioCtx.currentTime + t); o.stop(audioCtx.currentTime + t + 0.15);
      });
    } catch (e) { /* audio not available */ }
  }

  function pageFocus() {
    const rec = DS.dayOf(state, DS.todayKey());
    let week = 0;
    for (let i = 0; i < 7; i++) week += DS.dayOf(state, DS.addDays(DS.todayKey(), -i)).focus || 0;
    const setMode = (mode) => { if (timer.running) return; timer.mode = mode; timer.remaining = timerLength(mode); render(); };
    const lenSelect = (id, label, field, opts) => el("label", { class: "field" }, el("span", { text: label }),
      el("select", { id, onchange: (e) => { state.settings[field] = Number(e.target.value); if (!timer.running) timer.remaining = timerLength(timer.mode); save(); render(); } },
        opts.map((o) => el("option", { value: o, text: `${o} min`, selected: state.settings[field] === o }))));

    return [
      el("div", { class: "title-row" }, el("h1", { text: "Deep Work" }), el("span", { class: "date-chip", text: dateLabel(DS.todayKey()) })),
      el("div", { class: "timer" },
        el("div", { class: "seg", role: "group", "aria-label": "Timer mode" },
          el("button", { "aria-pressed": String(timer.mode === "focus"), text: "Focus", onclick: () => setMode("focus") }),
          el("button", { "aria-pressed": String(timer.mode === "break"), text: "Break", onclick: () => setMode("break") })),
        el("div", { class: "ring-wrap" },
          svg("svg", { class: "ring", viewBox: "0 0 200 200", "aria-hidden": "true" },
            svg("circle", { cx: 100, cy: 100, r: 90, fill: "none", stroke: "var(--rule)", "stroke-width": 6 }),
            svg("circle", { id: "arc", cx: 100, cy: 100, r: 90, fill: "none", stroke: "var(--pen)", "stroke-width": 6, "stroke-linecap": "round",
              "stroke-dasharray": ARC_LEN, "stroke-dashoffset": arcOffset(), transform: "rotate(-90 100 100)" })),
          el("div", { class: "clock", id: "clock", role: "timer", text: fmtClock(timerLeft()) })),
        el("div", { class: "mode", text: timer.mode === "focus" ? "Focus time" : "Break time" }),
        el("input", { class: "line-input task", id: "task", value: timer.task, placeholder: "What are you working on?", "aria-label": "Task",
          oninput: (e) => { timer.task = e.target.value; } }),
        el("div", { class: "btn-row" },
          el("button", { class: "btn primary", id: "t-start", text: timer.running ? "Pause" : timerLeft() < timerLength(timer.mode) ? "Resume" : "Start", onclick: () => {
            if (timer.running) { timer.remaining = timerLeft(); timer.running = false; }
            else { timer.endAt = Date.now() + timer.remaining; timer.running = true; askNotify(); }
            render();
          } }),
          el("button", { class: "btn", text: "Reset", onclick: () => { timer.running = false; timer.remaining = timerLength(timer.mode); render(); } }),
          el("button", { class: "btn", text: "Skip", onclick: () => { timer.running = false; timer.mode = timer.mode === "focus" ? "break" : "focus"; timer.remaining = timerLength(timer.mode); render(); } }))),
      el("div", { class: "grid-2 mt" },
        el("section", {},
          el("h2", { text: "Today's sessions" }),
          el("p", { class: "stats-inline" }, el("span", {}, "today ", el("b", { text: rec.focus || 0 }), " min"), el("span", {}, "last 7 days ", el("b", { text: (week / 60).toFixed(1) }), " h")),
          el("ul", { class: "checklist" }, (rec.sessions || []).length ? rec.sessions.slice().reverse().map((s) => el("li", {},
            el("span", { class: "name", style: "flex:1", text: s.task || "Focus session" }), el("span", { class: "meta", text: `${s.at} · ${s.mins} min` })))
            : el("li", { class: "empty", text: "No sessions yet today." }))),
        el("section", {},
          el("h2", { text: "Timer settings" }),
          el("div", { class: "field-row" },
            lenSelect("focus-len", "Focus length", "focusMins", [15, 25, 30, 45, 50, 60, 90]),
            lenSelect("break-len", "Break length", "breakMins", [3, 5, 10, 15, 20])),
          el("p", { class: "hint", style: "margin-top:8px", text: "Finished sessions are added to today's focus minutes. Keep the app open while the timer runs." }))),
    ];
  }

  // ============ JOURNAL ============
  function pageJournal() {
    const q = ui.journalQuery.trim().toLowerCase();
    const keys = Object.keys(state.days).filter((k) => {
      const d = state.days[k];
      const text = [d.notes, d.win, ...(d.will || []).map((w) => w.text)].join(" ").trim();
      if (!text && !d.mood) return false;
      return !q || text.toLowerCase().includes(q);
    }).sort().reverse();
    const prompts = ["What did I do today that my future self will thank me for?", "Where did I lie to myself today?", "What drained my energy, and what gave it back?",
      "What is one thing I will do better tomorrow?", "What am I grateful for right now?", "What would the person I want to become do tomorrow?"];
    const prompt = prompts[new Date().getDate() % prompts.length];

    return [
      el("div", { class: "title-row" }, el("h1", { text: "Journal" }), el("span", { class: "date-chip", text: `${keys.length} entries` })),
      el("div", { class: "boxed" }, el("h3", { text: "Prompt for today" }), el("p", { style: "font-size:1.1em", text: prompt }),
        el("button", { class: "linkish", text: "Answer in today's notes", onclick: () => {
          const d = DS.dayForWrite(state, DS.todayKey());
          if (!d.notes.includes(prompt)) d.notes = (d.notes ? d.notes + "\n" : "") + prompt + "\n- ";
          save(); ui.day = DS.todayKey(); go("today");
          setTimeout(() => { const n = $("notes"); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 50);
        } })),
      el("input", { class: "search mt", id: "j-search", type: "search", placeholder: "Search your notes...", value: ui.journalQuery, "aria-label": "Search journal",
        oninput: (e) => { ui.journalQuery = e.target.value; const pos = e.target.selectionStart; render(); const s = $("j-search"); if (s) s.setSelectionRange(pos, pos); } }),
      el("div", { class: "mt" }, keys.length ? keys.slice(0, ui.journalLimit).map((k) => {
        const d = state.days[k], s = DS.dayScore(state, k);
        const wills = (d.will || []).filter((w) => w.text);
        return el("article", { class: "entry" },
          el("button", { class: "date", text: longDate(k), onclick: () => { ui.day = k; go("today"); } }),
          el("div", { class: "meta-row" },
            s ? el("span", { text: `score ${s.done}/${s.due}` }) : null,
            d.mood ? el("span", { text: `mood ${d.mood}/5` }) : null,
            d.energy ? el("span", { text: `energy ${d.energy}/5` }) : null,
            d.focus ? el("span", { text: `focus ${d.focus} min` }) : null),
          d.win ? el("p", {}, el("b", { style: "font-weight:400;color:var(--pen)", text: "Win: " }), d.win) : null,
          wills.length ? el("p", { class: "sub", text: "Will: " + wills.map((w) => (w.done ? "✓ " : "") + w.text).join(" · ") }) : null,
          d.notes ? el("p", { text: d.notes }) : null);
      }) : el("p", { class: "empty", text: q ? "No entries match that search." : "Nothing written yet. Notes from the Today page show up here." })),
      keys.length > ui.journalLimit ? el("button", { class: "btn mt", text: "Show older entries", onclick: () => { ui.journalLimit += 30; render(); } }) : null,
    ];
  }

  // ============ STATS ============
  function pageStats() {
    const today = DS.todayKey();
    const range = (days) => {
      let done = 0, due = 0;
      const first = DS.firstDay(state);
      for (let i = 0; i < days; i++) {
        const k = DS.addDays(today, -i), s = DS.dayScore(state, k);
        if (k < first) break;
        if (!s || (i === 0 && s.done < s.due)) continue;
        done += s.done; due += s.due;
      }
      return due ? Math.round((done / due) * 100) : 0;
    };
    let focus30 = 0, wonTotal = 0;
    for (let i = 0; i < 30; i++) focus30 += DS.dayOf(state, DS.addDays(today, -i)).focus || 0;
    Object.keys(state.days).forEach((k) => { if (DS.won(state, k)) wonTotal++; });

    const tile = (big, lbl) => el("div", { class: "tile" }, el("div", { class: "big", text: big }), el("div", { class: "lbl", text: lbl }));

    // heatmap: last 26 weeks, columns are weeks starting Sunday
    const start = DS.addDays(today, -(7 * 25 + DS.parseKey(today).getDay()));
    const heat = el("div", { class: "heat", role: "img", "aria-label": "Daily score for the last 26 weeks" });
    for (let i = 0; i < 26 * 7; i++) {
      const k = DS.addDays(start, i);
      if (k > today) { heat.append(el("span", { class: "blank" })); continue; }
      const s = DS.dayScore(state, k);
      const lvl = !s ? 0 : s.pct === 1 ? 4 : s.pct >= 0.75 ? 3 : s.pct >= 0.5 ? 2 : s.pct > 0 ? 1 : 0;
      heat.append(el("span", { "data-l": String(lvl), title: `${dateLabel(k)}: ${s ? `${s.done}/${s.due}` : "rest day"}` }));
    }

    // weekday averages over the last 12 weeks
    const wk = Array.from({ length: 7 }, () => ({ sum: 0, n: 0 }));
    for (let i = 1; i <= 84; i++) {
      const k = DS.addDays(today, -i), s = DS.dayScore(state, k);
      if (!s || !state.days[k]) continue;
      const w = wk[DS.parseKey(k).getDay()]; w.sum += s.pct; w.n++;
    }
    const order = [1, 2, 3, 4, 5, 6, 0];
    const weekBars = el("div", { class: "week-bars", role: "img", "aria-label": "Average score by weekday" }, order.map((d) => {
      const v = wk[d].n ? Math.round((wk[d].sum / wk[d].n) * 100) : 0;
      return el("div", { class: "col", title: `${DS.WD_SHORT[d]}: ${wk[d].n ? v + "%" : "no data"}` },
        el("span", { class: "v", text: wk[d].n ? `${v}%` : "–" }),
        el("div", { class: "fill", style: `height:${Math.max(2, v)}%` }),
        el("span", { class: "d", text: DS.WD_SHORT[d] }));
    }));

    // mood over the last 30 days
    const W = 300, Hh = 100, pts = [];
    for (let i = 29; i >= 0; i--) {
      const k = DS.addDays(today, -i), mood = DS.dayOf(state, k).mood;
      if (mood) pts.push({ x: ((29 - i) / 29) * (W - 20) + 10, y: Hh - 10 - ((mood - 1) / 4) * (Hh - 20), k, mood });
    }
    const spark = svg("svg", { class: "spark", viewBox: `0 0 ${W} ${Hh}`, preserveAspectRatio: "none", role: "img", "aria-label": "Mood over the last 30 days" },
      [1, 3, 5].map((v) => svg("line", { x1: 10, x2: W - 10, y1: Hh - 10 - ((v - 1) / 4) * (Hh - 20), y2: Hh - 10 - ((v - 1) / 4) * (Hh - 20), stroke: "var(--rule)", "stroke-width": 1, "vector-effect": "non-scaling-stroke" })),
      pts.length > 1 ? svg("polyline", { points: pts.map((p) => `${p.x},${p.y}`).join(" "), fill: "none", stroke: "var(--pen)", "stroke-width": 2, "vector-effect": "non-scaling-stroke", "stroke-linejoin": "round" }) : null);

    const habits = state.habits.map((h) => ({ h, s: DS.habitStats(state, h, 30) }));

    return [
      el("div", { class: "title-row" }, el("h1", { text: "My Stats" }), el("span", { class: "date-chip", text: dateLabel(today) })),
      el("div", { class: "tiles" },
        tile(DS.streak(state), "day streak"), tile(DS.bestStreak(state), "best streak"), tile(wonTotal, "days won, all time"),
        tile(`${range(7)}%`, "last 7 days"), tile(`${range(30)}%`, "last 30 days"), tile((focus30 / 60).toFixed(1) + "h", "focus, last 30 days")),
      el("section", { class: "mt" }, el("h2", { text: "Last 26 weeks" }),
        el("div", { class: "scroll-x" }, heat),
        el("div", { class: "heat-legend" }, "less ", [0, 1, 2, 3, 4].map((l) => el("span", { class: "heat-cell", "data-l": String(l), style: l ? `background:${l === 4 ? "var(--pen)" : `color-mix(in srgb, var(--pen) ${l * 25}%, transparent)`}` : "" })), " more")),
      el("div", { class: "grid-2 mt" },
        el("section", {}, el("h2", { text: "Best and worst weekdays" }), el("p", { class: "hint", text: "Average score, last 12 weeks" }), weekBars),
        el("section", {}, el("h2", { text: "Mood, last 30 days" }),
          pts.length > 1 ? el("div", {}, spark, el("p", { class: "hint", text: "Lines at 1, 3 and 5. Log your mood on the Today page." }))
            : el("p", { class: "empty", text: "Log your mood on the Today page for a few days to see the trend." }))),
      el("section", { class: "mt" }, el("h2", { text: "Each habit, last 30 days" }),
        habits.length ? el("div", { class: "scroll-x" }, el("table", { class: "habit-stats" },
          el("thead", {}, el("tr", {}, el("th", { text: "Habit" }), el("th", { text: "Done" }), el("th", { class: "n", text: "%" }), el("th", { class: "n", text: "Streak" }))),
          el("tbody", {}, habits.map(({ h, s }) => el("tr", {},
            el("td", { text: h.name }),
            el("td", {}, el("div", { class: "bar", title: `${s.done} of ${s.due} days` }, el("span", { style: `width:${Math.round(s.pct * 100)}%` }))),
            el("td", { class: "n", text: s.due ? `${Math.round(s.pct * 100)}%` : "–" }),
            el("td", { class: "n", text: s.streak })))))) : el("p", { class: "empty", text: "Add habits to see stats." })),
    ];
  }

  // ============ 30 LIES ============
  function inlineListEditor(listName) {
    const list = state[listName];
    const input = el("input", { id: `add-${listName}`, placeholder: "Add new...", "aria-label": "New item" });
    const add = () => { const v = input.value.trim(); if (!v) return; list.push({ id: DS.uid(), name: v }); save(); render(); const a = $(`add-${listName}`); if (a) a.focus(); };
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") add(); });
    return el("ul", { class: "edit-list" },
      list.map((it) => el("li", {},
        el("input", { class: "line-input", value: it.name, "aria-label": "Edit", oninput: (e) => { it.name = e.target.value; save(); } }),
        el("button", { class: "x-btn", "aria-label": `Remove ${it.name}`, text: "×", onclick: () => { state[listName] = list.filter((x) => x !== it); save(); render(); } }))),
      el("li", { class: "edit-row" }, input, el("button", { class: "btn", text: "Add", onclick: add })));
  }
  const editToggle = (name) => el("button", { class: "small-btn", text: ui.editLists[name] ? "Done editing" : "Edit list", onclick: () => {
    ui.editLists[name] = !ui.editLists[name];
    if (!ui.editLists[name]) state[name] = state[name].filter((i) => i.name.trim());
    save(); render();
  } });

  function pageLies() {
    const n = new Date(), mk = DS.monthKey(n.getFullYear(), n.getMonth());
    const beaten = new Set(state.beaten[mk] || []);
    return [
      el("div", { class: "title-row" }, el("h1", { text: `${state.lies.length} Lies I Told Myself` }), el("span", { class: "date-chip", text: DS.MONTHS[n.getMonth()] })),
      el("p", { class: "hint", text: `Tick a lie when you catch yourself telling it and act anyway. ${beaten.size} beaten this month. Ticks reset each month.` }),
      ui.editLists.lies ? inlineListEditor("lies") : el("ul", { class: "lies" }, state.lies.map((lie, i) => el("li", { class: beaten.has(lie.id) ? "beaten" : "" },
        el("span", { class: "num", text: `${i + 1}.` }),
        el("label", {}, el("input", { type: "checkbox", class: "box", id: `lie-${lie.id}`, checked: beaten.has(lie.id), onchange: (e) => {
          const set = new Set(state.beaten[mk] || []);
          e.target.checked ? set.add(lie.id) : set.delete(lie.id);
          state.beaten[mk] = [...set]; save(); render();
        } }), el("span", { class: "name", text: lie.name }))))),
      editToggle("lies"),
      el("div", { class: "grid-2 mt" },
        el("section", {}, el("h2", { text: "The Truth:" }),
          ui.editLists.truths ? inlineListEditor("truths") : el("ul", { class: "truths" }, state.truths.map((t) => el("li", { text: t.name }))),
          editToggle("truths")),
        el("section", { class: "boxed" }, el("h2", { text: "Reminder" }),
          el("p", { style: "font-size:1.1em;white-space:pre-line", text: state.reminder }),
          el("p", { style: "font-size:1.1em;margin-top:6px" }, "Don't lie to yourself again.", el("br"), "Prove it."))),
      el("div", { class: "footer-row" }, el("span"), el("p", { class: "motto" }, "Discipline is a decision,", el("br"), el("u", { text: "not a feeling." }))),
    ];
  }

  // ============ SETTINGS ============
  function habitEditor(h) {
    const isNew = !h;
    const d = h ? { ...h, days: h.days.slice() } : { name: "", type: "check", target: 1, unit: "", section: "core", days: DS.ALL_DAYS.slice() };
    const f = {};
    const daysPick = el("div", { class: "days-pick", role: "group", "aria-label": "Days" }, [1, 2, 3, 4, 5, 6, 0].map((wd) => el("button", {
      type: "button", text: DS.WD_LETTER[wd], "aria-label": DS.WD_SHORT[wd], "aria-pressed": String(d.days.includes(wd)),
      onclick: (e) => { d.days = d.days.includes(wd) ? d.days.filter((x) => x !== wd) : d.days.concat(wd); e.target.setAttribute("aria-pressed", String(d.days.includes(wd))); } })));
    const countFields = el("div", { class: "field-row", hidden: d.type !== "count" },
      el("label", { class: "field" }, el("span", { text: "Daily target" }), f.target = el("input", { id: "h-target", type: "number", min: 1, step: "any", value: d.target })),
      el("label", { class: "field" }, el("span", { text: "Unit" }), f.unit = el("input", { id: "h-unit", value: d.unit, placeholder: "glasses, pages, steps" })));
    return el("form", { class: "editor form", onsubmit: (e) => {
      e.preventDefault();
      const name = f.name.value.trim();
      if (!name) { toast("Give the habit a name"); return; }
      if (!d.days.length) { toast("Pick at least one day"); return; }
      const vals = { name, type: f.type.value, section: f.section.value, days: d.days.sort(), target: f.type.value === "count" ? Math.max(1, Number(f.target.value) || 1) : 1, unit: f.type.value === "count" ? f.unit.value.trim() : "" };
      if (isNew) state.habits.push(Object.assign({ id: DS.uid() }, vals)); else Object.assign(h, vals);
      ui.habitEditor = null; save(); render(); toast(isNew ? "Habit added" : "Habit saved");
    } },
      el("label", { class: "field" }, el("span", { text: "Habit" }), f.name = el("input", { id: "h-name", value: d.name, placeholder: "Read 20 pages", required: true })),
      el("div", { class: "field-row" },
        el("label", { class: "field" }, el("span", { text: "List" }), f.section = el("select", { id: "h-section" },
          el("option", { value: "core", text: "Non-negotiable (counts for your score)", selected: d.section === "core" }),
          el("option", { value: "other", text: "Other habit (bonus)", selected: d.section === "other" }))),
        el("label", { class: "field" }, el("span", { text: "Type" }), f.type = el("select", { id: "h-type", onchange: (e) => { countFields.hidden = e.target.value !== "count"; } },
          el("option", { value: "check", text: "Yes / no", selected: d.type === "check" }),
          el("option", { value: "count", text: "Count toward a number", selected: d.type === "count" })))),
      countFields,
      el("div", { class: "field" }, el("span", { text: "Which days?" }), daysPick),
      el("div", { class: "btn-row" },
        el("button", { class: "btn primary", type: "submit", text: isNew ? "Add habit" : "Save habit" }),
        el("button", { class: "btn", type: "button", text: "Cancel", onclick: () => { ui.habitEditor = null; render(); } })));
  }

  function routineEditor(r) {
    const isNew = !r;
    const f = {};
    return el("form", { class: "editor form", onsubmit: (e) => {
      e.preventDefault();
      const name = f.name.value.trim();
      if (!name) { toast("Give the routine a name"); return; }
      const lines = f.steps.value.split("\n").map((s) => s.trim()).filter(Boolean);
      const old = new Map(((r && r.steps) || []).map((s) => [s.name, s]));
      const steps = lines.map((n) => old.get(n) || { id: DS.uid(), name: n });
      if (isNew) state.routines.push({ id: DS.uid(), name, time: f.time.value, steps });
      else Object.assign(r, { name, time: f.time.value, steps });
      ui.routineEditor = null; save(); render(); toast("Routine saved");
    } },
      el("div", { class: "field-row" },
        el("label", { class: "field" }, el("span", { text: "Routine" }), f.name = el("input", { id: "r-name", value: r ? r.name : "", placeholder: "Morning routine", required: true })),
        el("label", { class: "field" }, el("span", { text: "Start time" }), f.time = el("input", { id: "r-time", type: "time", value: r ? r.time : "" }))),
      el("label", { class: "field" }, el("span", { text: "Steps, in order (one per line)" }),
        f.steps = el("textarea", { id: "r-steps", value: r ? r.steps.map((s) => s.name).join("\n") : "", placeholder: "Wake up, no snooze\nDrink water\nWorkout" })),
      el("div", { class: "btn-row" },
        el("button", { class: "btn primary", type: "submit", text: isNew ? "Add routine" : "Save routine" }),
        el("button", { class: "btn", type: "button", text: "Cancel", onclick: () => { ui.routineEditor = null; render(); } })));
  }

  const move = (list, i, dir) => { const j = i + dir; if (j < 0 || j >= list.length) return; [list[i], list[j]] = [list[j], list[i]]; save(); render(); };
  const scheduleText = (h) => (h.days.length === 7 ? "every day" : h.days.length === 5 && [1, 2, 3, 4, 5].every((d) => h.days.includes(d)) ? "weekdays" : [1, 2, 3, 4, 5, 6, 0].filter((d) => h.days.includes(d)).map((d) => DS.WD_SHORT[d]).join(" "));

  function stylePicker(style, onChange) {
    const group = (label, key, options) => el("div", { class: "field" }, el("span", { text: label }),
      el("div", { class: "choice-grid" }, options.map((o) => el("button", { type: "button", class: "choice", "aria-pressed": String(style[key] === o.v),
        onclick: () => { style[key] = o.v; onChange(); } }, o.preview || null, el("span", { text: o.label, style: o.font ? `font-family:${o.font}` : "" }), o.sub ? el("small", { text: o.sub }) : null))));
    const paperSwatch = (bg) => el("span", { class: "swatch", style: `background-color:var(--paper);background-image:${bg};background-size:12px 12px` });
    return el("div", { class: "form" },
      group("Paper", "paper", [
        { v: "lined", label: "Lined", preview: paperSwatch("linear-gradient(to bottom, transparent 11px, var(--rule) 11px)") },
        { v: "grid", label: "Grid", preview: paperSwatch("linear-gradient(to bottom, transparent 11px, var(--rule) 11px), linear-gradient(to right, transparent 11px, var(--rule) 11px)") },
        { v: "dots", label: "Dots", preview: paperSwatch("radial-gradient(circle, var(--rule) 1.5px, transparent 2px)") },
        { v: "plain", label: "Plain", preview: paperSwatch("none") }]),
      group("Tone", "tone", [
        { v: "white", label: "White paper" }, { v: "cream", label: "Cream paper" }, { v: "grey", label: "Grey paper" },
        { v: "night", label: "Night", sub: "Dark desk, dark paper" }, { v: "auto", label: "Match my phone", sub: "Light by day, dark at night" }]),
      group("Pen colour", "pen", ["black", "blue", "green", "purple", "red"].map((c) => ({ v: c, label: c[0].toUpperCase() + c.slice(1), preview: el("span", { class: "ink-dot", style: `background:var(--pen-${c})` }) }))),
      group("Handwriting", "font", [
        { v: "patrick", label: "Neat print", font: "'Patrick Hand'" }, { v: "caveat", label: "Quick script", font: "'Caveat'" },
        { v: "kalam", label: "Marker", font: "'Kalam'" }, { v: "indie", label: "Loose and round", font: "'Indie Flower'" },
        { v: "architects", label: "Block capitals", font: "'Architects Daughter'" }]));
  }

  function pageSettings() {
    const p = state.profile;
    const core = state.habits;
    const shareUrl = shareLink();
    const sec = (title, ...kids) => el("section", { class: "mt" }, el("h2", { text: title }), ...kids);

    return [
      el("div", { class: "title-row" }, el("h1", { text: "Settings" })),
      el("p", { class: "hint", text: "Make the notebook yours. Everything is saved on this device only." }),

      sec("Me",
        el("div", { class: "form" },
          el("div", { class: "field-row" },
            el("label", { class: "field" }, el("span", { text: "My name" }), el("input", { id: "p-name", value: p.name, placeholder: "Enoch", oninput: (e) => { p.name = e.target.value; save(); } })),
            el("label", { class: "field" }, el("span", { text: "Notebook title" }), el("input", { id: "p-title", value: p.title, oninput: (e) => { p.title = e.target.value; save(); } }))),
          el("label", { class: "field" }, el("span", { text: "My why (shown every morning)" }), el("input", { id: "p-why", value: p.why, placeholder: "Become someone my family can count on", oninput: (e) => { p.why = e.target.value; save(); } })))),

      sec("Notebook style", stylePicker(state.style, () => { save(); render(); })),

      sec("Habits",
        el("p", { class: "hint", text: "Non-negotiables count toward your daily score and streak. Other habits are bonus." }),
        el("ul", { class: "edit-list" }, core.map((h, i) => ui.habitEditor === h.id ? el("li", { style: "display:block" }, habitEditor(h)) : el("li", {},
          el("span", { class: "name" }, h.name, el("br"), el("span", { class: "meta", text: `${h.section === "core" ? "non-negotiable" : "other"} · ${scheduleText(h)}${h.type === "count" ? ` · ${fmtNum(h.target)} ${h.unit}` : ""}` })),
          el("button", { class: "move-btn", "aria-label": `Move ${h.name} up`, text: "↑", onclick: () => move(state.habits, i, -1) }),
          el("button", { class: "move-btn", "aria-label": `Move ${h.name} down`, text: "↓", onclick: () => move(state.habits, i, 1) }),
          el("button", { class: "small-btn", text: "Edit", onclick: () => { ui.habitEditor = h.id; render(); } }),
          confirmBtn(`del-h-${h.id}`, "×", "Delete?", () => { state.habits = state.habits.filter((x) => x !== h); save(); render(); }, "x-btn")))),
        ui.habitEditor === "new" ? habitEditor(null) : null,
        el("div", { class: "btn-row mt" },
          el("button", { class: "btn primary", id: "add-habit", text: "+ Add habit", onclick: () => { ui.habitEditor = "new"; render(); } }),
          el("select", { class: "btn", id: "add-pack", "aria-label": "Add habits from a starter pack", onchange: (e) => {
            const pack = DS.PACKS.find((x) => x.id === e.target.value);
            if (!pack) return;
            const have = new Set(state.habits.map((h) => h.name.toLowerCase()));
            const add = pack.habits.filter((t) => !have.has(t.name.toLowerCase())).map(DS.habitFrom);
            state.habits.push(...add); save(); render(); toast(`Added ${add.length} habits from ${pack.name}`);
          } }, el("option", { value: "", text: "Add a starter pack..." }), DS.PACKS.map((pk) => el("option", { value: pk.id, text: pk.name }))))),

      sec("Routines",
        el("ul", { class: "edit-list" }, state.routines.map((r, i) => ui.routineEditor === r.id ? el("li", { style: "display:block" }, routineEditor(r)) : el("li", {},
          el("span", { class: "name" }, r.name, el("br"), el("span", { class: "meta", text: `${r.time || "any time"} · ${r.steps.length} steps` })),
          el("button", { class: "move-btn", "aria-label": `Move ${r.name} up`, text: "↑", onclick: () => move(state.routines, i, -1) }),
          el("button", { class: "small-btn", text: "Edit", onclick: () => { ui.routineEditor = r.id; render(); } }),
          confirmBtn(`del-r-${r.id}`, "×", "Delete?", () => { state.routines = state.routines.filter((x) => x !== r); save(); render(); }, "x-btn")))),
        ui.routineEditor === "new" ? routineEditor(null) : null,
        el("div", { class: "btn-row mt" },
          el("button", { class: "btn primary", text: "+ Add routine", onclick: () => { ui.routineEditor = "new"; render(); } }),
          el("select", { class: "btn", "aria-label": "Add a routine template", onchange: (e) => {
            const t = DS.ROUTINE_TEMPLATES[Number(e.target.value)];
            if (!t) return;
            state.routines.push(DS.routineFrom(t)); save(); render(); toast(`${t.name} added`);
          } }, el("option", { value: "", text: "Add a template..." }), DS.ROUTINE_TEMPLATES.map((t, i) => el("option", { value: i, text: t.name }))))),

      sec("Daily reminder",
        el("div", { class: "field-row" },
          el("label", { class: "field" }, el("span", { text: "Remind me to check in at" }), el("input", { id: "remind-at", type: "time", value: state.settings.remindAt,
            onchange: (e) => { state.settings.remindAt = e.target.value; save(); if (e.target.value) askNotify(true); } }))),
        el("p", { class: "hint", text: "You get a notification at this time if today's non-negotiables aren't done yet. Your phone only allows it while the app is open or running in the background." })),

      sec("Install on my phone", installSection()),

      sec("Share my system",
        el("p", { text: "Send this link to a friend. They get your habits, routines, goals and notebook style as a starting point, and can change everything. Your ticks, notes and history are never included." }),
        el("textarea", { class: "share-box mt", id: "share-link", readOnly: true, value: shareUrl, "aria-label": "Share link" }),
        el("div", { class: "btn-row mt" },
          el("button", { class: "btn primary", text: "Copy link", onclick: () => copyText(shareUrl, "share-link", "Link copied") }),
          navigator.share ? el("button", { class: "btn", text: "Share...", onclick: () => navigator.share({ title: state.profile.title, text: "Here's my discipline system. Make it yours:", url: shareUrl }).catch(() => {}) }) : null),
        el("details", { class: "mt" }, el("summary", { text: "Someone sent me a system" }),
          el("p", { class: "hint", text: "Open their link, or paste it here." }),
          el("textarea", { class: "share-box", id: "import-setup", placeholder: "Paste the link here", "aria-label": "Shared link" }),
          el("button", { class: "btn mt", text: "Load it", onclick: () => {
            try { ui.shared = DS.decodeSetup($("import-setup").value); go("today"); }
            catch (e) { toast("That link isn't a shared system. Copy the whole link and try again."); }
          } }))),

      sec("Backup",
        el("p", { class: "hint", text: "Save a backup file before you change phones or clear your browser." }),
        el("div", { class: "btn-row" },
          el("button", { class: "btn primary", text: "Download backup", onclick: downloadBackup }),
          el("label", { class: "btn", style: "cursor:pointer" }, "Restore from file", el("input", { type: "file", accept: "application/json,.json", hidden: true, onchange: (e) => restoreFile(e.target.files[0]) })),
          el("button", { class: "btn", text: "Copy as text", onclick: () => copyText(JSON.stringify(state), null, "Backup copied") }))),

      sec("Start over",
        el("div", { class: "btn-row" },
          el("button", { class: "btn", text: "Run setup again", onclick: () => startWizard() }),
          confirmBtn("erase", "Erase everything", "Tap again to erase all your data", () => {
            state = DS.freshState(); DS.persist(state); ui.day = DS.todayKey(); startWizard(); toast("Everything erased");
          }))),
      el("p", { class: "hint mt", text: "My Discipline System · works offline · your data stays on this device" }),
    ];
  }

  function copyText(text, selectId, okMsg) {
    const fallback = () => { const t = selectId && $(selectId); if (t) { t.focus(); t.select(); } toast("Press and hold to copy"); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => toast(okMsg), fallback);
    else fallback();
  }

  function downloadBackup() {
    const blob = new Blob([JSON.stringify(state, null, 1)], { type: "application/json" });
    const a = el("a", { href: URL.createObjectURL(blob), download: `discipline-backup-${DS.todayKey()}.json` });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast("Backup downloaded");
  }
  function restoreFile(file) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (!data || !Array.isArray(data.habits) || typeof data.days !== "object") throw new Error("shape");
        state = DS.normalize(data); state.profile.setupDone = true; save(); go("today"); toast("Backup restored");
      } catch (e) { toast("That file isn't a backup from this app"); }
    };
    r.readAsText(file);
  }

  // ---------- sharing ----------
  function shareLink() {
    const base = window.DS_SHARE_BASE || (location.protocol.startsWith("http") ? location.origin + location.pathname : "https://by-truth.github.io/By-Truth/discipline-system/");
    return `${base}#setup=${DS.encodeSetup(DS.exportSetup(state))}`;
  }
  function sharedBanner() {
    const s = ui.shared;
    return el("div", { class: "banner" },
      el("p", {}, el("b", { style: "font-weight:400;color:var(--pen)", text: s.from ? `${s.from} shared their system with you. ` : "Someone shared their system with you. " }),
        `${s.habits.length} habits, ${(s.routines || []).length} routines, ${(s.goals || []).length} goals.`),
      el("p", { class: "hint", text: s.habits.map((h) => h.name).join(" · ") }),
      el("div", { class: "btn-row" },
        el("button", { class: "btn primary", text: "Add their habits to mine", onclick: () => {
          const have = new Set(state.habits.map((h) => h.name.toLowerCase()));
          state.habits.push(...s.habits.filter((h) => !have.has(h.name.toLowerCase())).map(DS.habitFrom));
          state.routines.push(...(s.routines || []).filter((r) => !state.routines.some((x) => x.name === r.name)).map(DS.routineFrom));
          ui.shared = null; save(); render(); toast("Added. Change anything in Settings.");
        } }),
        el("button", { class: "btn", text: "Replace mine with theirs", onclick: () => { DS.applySetup(state, s, { goals: false, style: false }); ui.shared = null; save(); render(); toast("Switched to their system. Your history is kept."); } }),
        el("button", { class: "small-btn", text: "No thanks", onclick: () => { ui.shared = null; render(); } })));
  }

  // ---------- install ----------
  let installEvent = null;
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEvent = e; if (ui.page === "settings") render(); });
  window.addEventListener("appinstalled", () => { installEvent = null; toast("Installed. Open it from your home screen."); });
  const isStandalone = () => (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  function installSection() {
    if (isStandalone()) return el("p", { text: "Installed. You're using the app version. It works offline." });
    return el("div", { class: "form" },
      installEvent ? el("button", { class: "btn primary", text: "Install app", onclick: async () => { installEvent.prompt(); await installEvent.userChoice.catch(() => {}); installEvent = null; render(); } }) : null,
      el("p", {}, isIOS()
        ? "On iPhone: open this page in Safari, tap the Share button, then “Add to Home Screen”."
        : "On Android: open the browser menu (⋮) and tap “Install app” or “Add to Home screen”. On a computer, use the install icon in the address bar."),
      el("p", { class: "hint", text: "Once installed it opens full screen like an app, works without internet and keeps your data on your phone." }));
  }

  // ---------- notifications ----------
  function askNotify(explicit) {
    if (!("Notification" in window) || Notification.permission !== "default") {
      if (explicit && "Notification" in window && Notification.permission === "denied") toast("Notifications are blocked. Allow them in your browser settings.");
      return;
    }
    Notification.requestPermission().catch(() => {});
  }
  async function notify(title, body) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    try {
      const reg = navigator.serviceWorker && (await navigator.serviceWorker.getRegistration());
      if (reg) reg.showNotification(title, { body, icon: "icons/icon-192.png", badge: "icons/icon-192.png", tag: title });
      else new Notification(title, { body, icon: "icons/icon-192.png" });
    } catch (e) { /* notifications not supported here */ }
  }
  function checkReminder() {
    const at = state.settings.remindAt;
    if (!at) return;
    const n = new Date(), k = DS.todayKey();
    if (state.settings.remindedOn === k || n.toTimeString().slice(0, 5) < at) return;
    state.settings.remindedOn = k; save();
    const s = DS.dayScore(state, k);
    if (s && s.done < s.due) notify(state.profile.title || "My Discipline System", `${s.due - s.done} non-negotiables left today. Keep showing up.`);
  }

  // ---------- setup wizard ----------
  function startWizard(shared) {
    ui.wiz = makeWiz(shared);
    go("setup");
  }
  function makeWiz(shared) {
    const fromShare = shared || null;
    return {
      step: 0,
      name: state.profile.name, goal: "", why: state.profile.why,
      packs: new Set(fromShare ? [] : ["discipline"]),
      picks: fromShare ? fromShare.habits.map((t) => ({ t, on: true })) : DS.PACKS[0].habits.map((t) => ({ t, on: true })),
      custom: "",
      routines: fromShare && fromShare.routines && fromShare.routines.length ? fromShare.routines.map((t) => ({ t, on: true })) : DS.ROUTINE_TEMPLATES.map((t, i) => ({ t, on: i < 2 })),
      style: Object.assign({}, state.style, fromShare && fromShare.style ? fromShare.style : {}),
      shared: fromShare,
    };
  }

  function rebuildPicks(w) {
    const keep = new Map(w.picks.map((p) => [p.t.name.toLowerCase(), p]));
    const next = [];
    DS.PACKS.filter((p) => w.packs.has(p.id)).forEach((p) => p.habits.forEach((t) => {
      const key = t.name.toLowerCase();
      if (next.some((x) => x.t.name.toLowerCase() === key)) return;
      next.push(keep.get(key) || { t, on: true });
    }));
    w.picks.filter((p) => p.custom || p.shared).forEach((p) => { if (!next.some((x) => x.t.name.toLowerCase() === p.t.name.toLowerCase())) next.push(p); });
    w.picks = next;
  }

  function pageSetup() {
    const w = ui.wiz || (ui.wiz = makeWiz());
    const steps = el("div", { class: "wizard-steps", "aria-hidden": "true" }, [0, 1, 2, 3].map((i) => el("span", { class: i <= w.step ? "on" : "" })));
    const nav = (canBack, nextLabel, onNext) => el("div", { class: "btn-row mt" },
      canBack ? el("button", { class: "btn", text: "Back", onclick: () => { w.step--; render(); window.scrollTo(0, 0); } }) : null,
      el("button", { class: "btn primary", id: "wiz-next", text: nextLabel, onclick: onNext }));
    const next = () => { w.step++; render(); window.scrollTo(0, 0); };
    const out = [steps];

    if (w.step === 0) {
      out.push(el("h1", { text: "Build your system" }),
        w.shared ? el("div", { class: "banner mt" }, el("p", { text: `${w.shared.from ? w.shared.from + " shared" : "You opened"} a ready-made system with ${w.shared.habits.length} habits. It's filled in below, and you can change anything.` })) : null,
        el("p", { class: "mt", text: "Systems are what stay after motivation leaves. Answer a few questions and your notebook is set up for your own habits, routines and goals." }),
        el("div", { class: "form mt" },
          el("label", { class: "field" }, el("span", { text: "What should I call you?" }), el("input", { id: "w-name", value: w.name, placeholder: "Your first name", oninput: (e) => { w.name = e.target.value; } })),
          el("label", { class: "field" }, el("span", { text: "One big goal you're working toward" }), el("input", { id: "w-goal", value: w.goal, placeholder: "Lose 10kg, finish my degree, grow my business...", oninput: (e) => { w.goal = e.target.value; } })),
          el("label", { class: "field" }, el("span", { text: "Why does it matter to you?" }), el("input", { id: "w-why", value: w.why, placeholder: "Discipline today, freedom tomorrow", oninput: (e) => { w.why = e.target.value; } }))),
        nav(false, "Next: my habits", next));
    } else if (w.step === 1) {
      const custom = el("input", { id: "w-custom", placeholder: "Add your own habit...", "aria-label": "Your own habit" });
      const addCustom = () => { const v = custom.value.trim(); if (!v) return; w.picks.push({ t: { name: v, type: "check", target: 1, unit: "", section: "core", days: DS.ALL_DAYS.slice() }, on: true, custom: true }); render(); const c = $("w-custom"); if (c) c.focus(); };
      custom.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } });
      out.push(el("h1", { text: "Pick your habits" }),
        el("p", { class: "mt", text: "Choose what fits your life. Pick one or more starter packs, then untick anything you don't want." }),
        el("div", { class: "choice-grid mt" }, DS.PACKS.map((p) => el("button", { class: "choice", "aria-pressed": String(w.packs.has(p.id)),
          onclick: () => { w.packs.has(p.id) ? w.packs.delete(p.id) : w.packs.add(p.id); rebuildPicks(w); render(); } },
          el("span", { text: p.name }), el("small", { text: p.blurb })))),
        el("h2", { class: "mt", style: "margin-top:22px", text: `Your habits (${w.picks.filter((p) => p.on).length})` }),
        el("ul", { class: "checklist" }, w.picks.length ? w.picks.map((p, i) => el("li", {}, el("label", {},
          el("input", { type: "checkbox", class: "box", id: `pick-${i}`, checked: p.on, onchange: (e) => { p.on = e.target.checked; render(); } }),
          el("span", { class: "name" }, p.t.name, p.t.type === "count" ? el("span", { class: "meta", text: `  ${fmtNum(p.t.target)} ${p.t.unit}` } ) : null,
            p.t.section === "other" ? el("span", { class: "meta", text: "  bonus" }) : null))))
          : el("li", { class: "empty", text: "Pick a pack above or add your own below." })),
        el("div", { class: "edit-row" }, custom, el("button", { class: "btn", text: "Add", onclick: addCustom })),
        el("p", { class: "hint", text: "You can set which days each habit is for, and add counts like glasses of water, in Settings later." }),
        nav(true, "Next: my routines", () => { if (!w.picks.some((p) => p.on)) { toast("Pick at least one habit"); return; } next(); }));
    } else if (w.step === 2) {
      out.push(el("h1", { text: "Your routines" }),
        el("p", { class: "mt", text: "A routine is a short list of steps you do in the same order. Pick any you want. You can edit the steps later." }),
        el("div", { class: "grid-even mt" }, w.routines.map((r, i) => el("div", { class: "boxed" },
          el("label", { style: "display:flex;gap:10px;align-items:center;cursor:pointer" },
            el("input", { type: "checkbox", class: "box", id: `rt-${i}`, checked: r.on, onchange: (e) => { r.on = e.target.checked; } }),
            el("span", { text: `${r.t.name}${r.t.time ? " · " + r.t.time : ""}` })),
          el("ul", { class: "pack-habits" }, r.t.steps.map((s) => el("li", { class: "sub", text: `- ${typeof s === "string" ? s : s.name}` })))))),
        nav(true, "Next: my notebook style", next));
    } else {
      out.push(el("h1", { text: "Style your notebook" }),
        el("p", { class: "mt", text: "Pick the paper, pen and handwriting you like. It changes as you tap." }),
        el("div", { class: "mt" }, stylePicker(w.style, () => { state.style = Object.assign({}, w.style); render(); })),
        nav(true, "Start my system", finishWizard));
    }
    return out;
  }

  function finishWizard() {
    const w = ui.wiz;
    state.profile.name = w.name.trim();
    state.profile.why = w.why.trim();
    state.style = Object.assign({}, w.style);
    const chosen = w.picks.filter((p) => p.on).map((p) => p.t);
    const existing = new Map(state.habits.map((h) => [h.name.toLowerCase(), h]));
    state.habits = chosen.map((t) => existing.get(t.name.toLowerCase()) || DS.habitFrom(t)); // keep ids so history still lines up
    const exR = new Map(state.routines.map((r) => [r.name, r]));
    state.routines = w.routines.filter((r) => r.on).map((r) => exR.get(r.t.name) || DS.routineFrom(r.t));
    if (w.shared) {
      if (w.shared.lies && w.shared.lies.length) state.lies = DS.items(w.shared.lies);
      if (w.shared.truths && w.shared.truths.length) state.truths = DS.items(w.shared.truths);
      if (w.shared.reminder) state.reminder = w.shared.reminder;
      (w.shared.goals || []).forEach((g) => state.goals.push({ id: DS.uid(), title: g.title, why: g.why || "", due: "", area: "Other", done: false, created: DS.todayKey(), milestones: (g.milestones || []).map((name) => ({ id: DS.uid(), name, done: false })) }));
    }
    if (w.goal.trim()) state.goals.unshift({ id: DS.uid(), title: w.goal.trim(), why: w.why.trim(), due: "", area: "Other", done: false, created: DS.todayKey(), milestones: [] });
    state.profile.setupDone = true;
    ui.wiz = null; ui.shared = null;
    save(); go("today");
    toast("Your system is ready. Keep showing up.");
  }

  // ---------- start ----------
  function readHash() {
    const h = location.hash || "";
    const m = h.match(/setup=([A-Za-z0-9_-]+)/);
    if (m) {
      try {
        const setup = DS.decodeSetup(m[1]);
        if (state.profile.setupDone) { ui.shared = setup; ui.page = "today"; }
        else { startWizard(setup); return; }
      } catch (e) { toast("That share link is broken. Ask for a new one."); }
      try { history.replaceState(null, "", "#today"); } catch (e) { /* ignore */ }
    } else {
      const page = h.replace("#", "");
      if (PAGES[page]) { ui.page = page; ui.scrollToday = true; }
    }
    if (!state.profile.setupDone) { startWizard(); return; }
    render();
  }
  window.addEventListener("hashchange", () => { const p = location.hash.replace("#", ""); if (PAGES[p] && p !== ui.page) go(p); });
  document.addEventListener("click", (e) => { if (ui.moreOpen && !e.target.closest("#more-menu") && !e.target.closest(".nav")) { ui.moreOpen = false; renderNav(); } });

  // new day while the app stays open
  let lastDay = DS.todayKey();
  setInterval(() => {
    const k = DS.todayKey();
    if (k !== lastDay) { if (ui.day === lastDay) ui.day = k; lastDay = k; const n = new Date(); ui.view = { y: n.getFullYear(), m: n.getMonth() }; if (ui.page !== "setup") render(); }
    checkReminder();
  }, 30000);

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

  applyStyle();
  readHash();
  checkReminder();
})();
