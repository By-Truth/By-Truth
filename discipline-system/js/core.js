/* Core: dates, starter templates, storage, migration and stats. Everything is saved in this browser only. */
(function () {
  "use strict";
  const DS = (window.DS = window.DS || {});

  const STORE_KEY = "discipline-system-v2";
  const OLD_KEY = "discipline-system-v1";

  // ---------- small helpers ----------
  const uid = () => Math.random().toString(36).slice(2, 10);
  const pad = (n) => String(n).padStart(2, "0");
  const keyOf = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
  const keyOfDate = (dt) => keyOf(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const parseKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (k, n) => { const d = parseKey(k); d.setDate(d.getDate() + n); return keyOfDate(d); };
  const daysIn = (y, m) => new Date(y, m + 1, 0).getDate();
  const monthKey = (y, m) => `${y}-${pad(m + 1)}`;
  const todayKey = () => keyOfDate(new Date());
  const daysBetween = (a, b) => Math.round((parseKey(b) - parseKey(a)) / 86400000);
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const WD_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const WD_LETTER = ["S", "M", "T", "W", "T", "F", "S"];
  const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

  Object.assign(DS, { uid, pad, keyOf, keyOfDate, parseKey, addDays, daysIn, monthKey, todayKey, daysBetween, MONTHS, WD_SHORT, WD_LETTER, ALL_DAYS });

  // ---------- starter templates ----------
  // A habit: { name, type: "check" | "count", target, unit, section: "core" | "other", days }
  const H = (name, extra = {}) => Object.assign({ name, type: "check", target: 1, unit: "", section: "core", days: ALL_DAYS.slice() }, extra);
  const WEEKDAYS = [1, 2, 3, 4, 5];

  DS.PACKS = [
    { id: "discipline", name: "Discipline", blurb: "The classic non-negotiables", habits: [
      H("Wake up before 6am"), H("Cold shower"), H("No phone until 11am"), H("Workout"), H("Read 20 pages"),
      H("Meditate 10 min"), H("Eat clean"), H("Drink water", { type: "count", target: 8, unit: "glasses" }), H("No alcohol"), H("Sleep by 10:30pm")] },
    { id: "fitness", name: "Fitness", blurb: "Train, move and recover", habits: [
      H("Workout", { days: [1, 2, 3, 4, 5, 6] }), H("Walk", { type: "count", target: 10000, unit: "steps" }), H("Stretch 10 min"),
      H("Hit protein goal"), H("Sleep 8 hours"), H("Track my food", { section: "other" })] },
    { id: "student", name: "Student", blurb: "Study habits that stick", habits: [
      H("Study", { type: "count", target: 2, unit: "hours", days: WEEKDAYS }), H("Review today's notes", { days: WEEKDAYS }),
      H("No social media before homework"), H("Read 20 pages"), H("Plan tomorrow"), H("Sleep by 11pm")] },
    { id: "faith", name: "Faith", blurb: "Prayer, scripture and gratitude", habits: [
      H("Morning prayer"), H("Read scripture"), H("Write 3 things I'm grateful for"), H("Night prayer"),
      H("Attend service", { days: [0], section: "other" })] },
    { id: "business", name: "Business & content", blurb: "Build the brand every day", habits: [
      H("Deep work", { type: "count", target: 2, unit: "hours", days: WEEKDAYS }), H("Post content"), H("Reach out to people", { type: "count", target: 5, unit: "people", days: WEEKDAYS }),
      H("Learn something new"), H("Review money", { days: [0], section: "other" })] },
    { id: "mind", name: "Mind & health", blurb: "Calm head, healthy body", habits: [
      H("Meditate 10 min"), H("Journal"), H("Drink water", { type: "count", target: 8, unit: "glasses" }), H("No sugar"),
      H("Walk outside"), H("No screens after 10pm", { section: "other" })] },
  ];

  DS.ROUTINE_TEMPLATES = [
    { name: "Morning routine", time: "05:30", steps: ["Wake up, no snooze", "Drink a glass of water", "Make the bed", "Pray or meditate", "Move my body", "Cold shower", "Plan the day"] },
    { name: "Evening routine", time: "21:30", steps: ["Review today", "Tidy my space", "Plan tomorrow's top 3", "Read", "Phone away", "Lights out"] },
    { name: "Work start", time: "09:00", steps: ["Clear desk", "Pick one deep-work task", "Phone on silent", "Start focus timer"] },
  ];

  DS.DEFAULT_LIES = ["I'll start tomorrow", "I'm too tired", "I don't have time", "I'll do it later",
    "I need motivation first", "This doesn't matter", "I'm just not disciplined", "I'll start when things calm down",
    "It's only one day", "I deserve a break", "I work better under pressure", "I'm not seeing results",
    "I don't know where to start", "I'll do it when I'm ready", "I'm too young", "I'm too old",
    "I'm not good enough", "I need more money", "I'll start when I feel ready", "I don't have support",
    "Everyone else has it easier", "I'm just not built for this", "I'll do it perfectly or not at all",
    "I need to figure everything out", "I'll start next month", "I'm not consistent", "I keep failing",
    "What's the point?", "Nobody will notice", "I have to be in the mood"];
  DS.DEFAULT_TRUTHS = ["Action comes first, motivation comes after.", "Small steps every day > big plans never started.",
    "Discipline is a decision, not a feeling.", "I choose my future."];
  DS.QUOTES = ["Discipline today, freedom tomorrow.", "Keep showing up. Your future self is counting on you.",
    "Small steps every day.", "Don't break the chain.", "Do it tired. Do it scared. Just do it.",
    "Motivation gets you started. Systems keep you going.", "Win the morning, win the day."];

  const items = (names) => names.map((name) => ({ id: uid(), name }));
  const habitFrom = (t) => ({ id: uid(), name: t.name, type: t.type || "check", target: Number(t.target) || 1, unit: t.unit || "",
    section: t.section === "other" ? "other" : "core", days: Array.isArray(t.days) && t.days.length ? t.days.slice() : ALL_DAYS.slice() });
  const routineFrom = (t) => ({ id: uid(), name: t.name, time: t.time || "", steps: (t.steps || []).map((s) => ({ id: uid(), name: typeof s === "string" ? s : s.name })) });
  Object.assign(DS, { habitFrom, routineFrom, items });

  DS.freshState = () => ({
    v: 2,
    profile: { name: "", title: "My Discipline System", why: "", setupDone: false },
    style: { paper: "lined", tone: "white", pen: "blue", font: "patrick" },
    habits: [],
    routines: [],
    goals: [],
    lies: items(DS.DEFAULT_LIES),
    truths: items(DS.DEFAULT_TRUTHS),
    reminder: "Discipline today,\nfreedom tomorrow.",
    days: {},   // "YYYY-MM-DD" -> day record (see blankDay)
    beaten: {}, // "YYYY-MM" -> [lieId]
    settings: { remindAt: "", focusMins: 25, breakMins: 5 },
  });
  DS.blankDay = () => ({ h: {}, r: {}, will: [{ text: "", done: false }, { text: "", done: false }, { text: "", done: false }], notes: "", win: "", mood: 0, energy: 0, focus: 0, sessions: [] });

  // ---------- load / save ----------
  function migrateV1(old) {
    const s = DS.freshState();
    const toHabit = (h, section) => ({ id: h.id, name: h.name, type: "check", target: 1, unit: "", section, days: ALL_DAYS.slice() });
    s.habits = (old.habits || []).map((h) => toHabit(h, "core")).concat((old.others || []).map((h) => toHabit(h, "other")));
    if (Array.isArray(old.lies) && old.lies.length) s.lies = old.lies;
    if (Array.isArray(old.truths) && old.truths.length) s.truths = old.truths;
    if (typeof old.reminder === "string") s.reminder = old.reminder;
    s.beaten = old.beaten || {};
    for (const [k, d] of Object.entries(old.days || {})) {
      const nd = DS.blankDay();
      Object.assign(nd.h, d.h || {});
      for (const [id, v] of Object.entries(d.o || {})) if (v) nd.h[id] = 1;
      (d.will || []).forEach((t, i) => { if (i < 3) nd.will[i].text = t || ""; });
      nd.notes = d.notes || "";
      s.days[k] = nd;
    }
    s.profile.setupDone = s.habits.length > 0;
    return s;
  }

  function normalize(data) {
    const s = Object.assign(DS.freshState(), data);
    s.profile = Object.assign(DS.freshState().profile, data.profile);
    s.style = Object.assign(DS.freshState().style, data.style);
    s.settings = Object.assign(DS.freshState().settings, data.settings);
    return s;
  }

  DS.storageOk = true;
  DS.load = function () {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return normalize(JSON.parse(raw));
      const old = localStorage.getItem(OLD_KEY);
      if (old) return migrateV1(JSON.parse(old));
    } catch (e) { DS.storageOk = false; }
    return DS.freshState();
  };
  DS.persist = function (state) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); DS.storageOk = true; return true; }
    catch (e) { DS.storageOk = false; return false; }
  };
  DS.normalize = normalize;

  // ---------- habit logic ----------
  // Stats only count from the first day the notebook was used, so new users don't start at 1%.
  DS.firstDay = (state) => Object.keys(state.days).sort()[0] || todayKey();
  DS.dueOn = (h, k) => !h.days || h.days.length === 0 || h.days.includes(parseKey(k).getDay());
  DS.isDone = (h, v) => (h.type === "count" ? Number(v) >= (h.target || 1) : v === 1);
  DS.dayOf = (state, k) => state.days[k] || DS.blankDay();
  DS.dayForWrite = (state, k) => {
    if (!state.days[k]) state.days[k] = DS.blankDay();
    const d = state.days[k];
    // older records may miss newer fields
    for (const [f, v] of Object.entries(DS.blankDay())) if (d[f] === undefined) d[f] = v;
    return d;
  };

  // Score for one day: share of due core habits done. null when nothing was due.
  DS.dayScore = function (state, k) {
    const due = state.habits.filter((h) => h.section === "core" && DS.dueOn(h, k));
    if (!due.length) return null;
    const rec = DS.dayOf(state, k);
    const done = due.filter((h) => DS.isDone(h, rec.h[h.id])).length;
    return { done, due: due.length, pct: done / due.length };
  };
  DS.won = (state, k) => { const s = DS.dayScore(state, k); return !!s && s.done === s.due; };

  // A day with no due core habits keeps the streak going without adding to it.
  DS.streak = function (state, fromKey) {
    let k = fromKey || todayKey();
    if (!DS.won(state, k)) k = addDays(k, -1);
    let n = 0, guard = 0;
    while (guard++ < 3660) {
      const s = DS.dayScore(state, k);
      if (s === null) { if (!hasHistoryBefore(state, k)) break; k = addDays(k, -1); continue; }
      if (s.done !== s.due) break;
      n++; k = addDays(k, -1);
    }
    return n;
  };
  function hasHistoryBefore(state, k) { return Object.keys(state.days).some((d) => d < k); }

  DS.bestStreak = function (state) {
    const keys = Object.keys(state.days).sort();
    if (!keys.length) return 0;
    let best = 0, cur = 0, k = keys[0];
    const end = todayKey();
    while (k <= end) {
      const s = DS.dayScore(state, k);
      if (s !== null) { if (s.done === s.due) { cur++; best = Math.max(best, cur); } else cur = 0; }
      k = addDays(k, 1);
    }
    return best;
  };

  DS.habitStats = function (state, h, days = 30) {
    const today = todayKey();
    let due = 0, done = 0;
    const first = DS.firstDay(state);
    for (let i = 0; i < days; i++) {
      const k = addDays(today, -i);
      if (k < first) break;
      if (!DS.dueOn(h, k)) continue;
      // today only counts once it's done, so an unfinished morning doesn't drag the number down
      const ok = DS.isDone(h, DS.dayOf(state, k).h[h.id]);
      if (i === 0 && !ok) continue;
      due++; if (ok) done++;
    }
    let streak = 0, k = today;
    if (!DS.isDone(h, DS.dayOf(state, k).h[h.id])) k = addDays(k, -1);
    for (let g = 0; g < 3660; g++) {
      if (!DS.dueOn(h, k)) { k = addDays(k, -1); if (!hasHistoryBefore(state, k)) break; continue; }
      if (!DS.isDone(h, DS.dayOf(state, k).h[h.id])) break;
      streak++; k = addDays(k, -1);
    }
    return { due, done, pct: due ? done / due : 0, streak };
  };

  DS.monthProgress = function (state, y, m) {
    const now = new Date();
    const cur = now.getFullYear() * 12 + now.getMonth(), v = y * 12 + m;
    const n = v < cur ? daysIn(y, m) : v === cur ? now.getDate() : 0;
    let done = 0, due = 0, wonDays = 0;
    const first = DS.firstDay(state), today = todayKey();
    for (let d = 1; d <= n; d++) {
      const k = keyOf(y, m, d), s = DS.dayScore(state, k);
      if (!s || k < first || (k === today && s.done < s.due)) continue;
      done += s.done; due += s.due; if (s.done === s.due) wonDays++;
    }
    return { pct: due ? Math.round((done / due) * 100) : 0, wonDays, days: n };
  };

  DS.goalProgress = (g) => {
    if (g.done) return 1;
    const ms = g.milestones || [];
    return ms.length ? ms.filter((m) => m.done).length / ms.length : 0;
  };

  // ---------- sharing a setup (no personal history) ----------
  DS.exportSetup = function (state) {
    return {
      kind: "discipline-system-setup", v: 1,
      from: state.profile.name || "",
      title: state.profile.title,
      habits: state.habits.map(({ name, type, target, unit, section, days }) => ({ name, type, target, unit, section, days })),
      routines: state.routines.map((r) => ({ name: r.name, time: r.time, steps: r.steps.map((s) => s.name) })),
      goals: state.goals.filter((g) => !g.done).map((g) => ({ title: g.title, why: g.why, milestones: (g.milestones || []).map((m) => m.name) })),
      lies: state.lies.map((l) => l.name), truths: state.truths.map((t) => t.name),
      reminder: state.reminder, style: state.style,
    };
  };
  const b64urlEncode = (str) => {
    const bytes = new TextEncoder().encode(str);
    let bin = ""; bytes.forEach((b) => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };
  const b64urlDecode = (s) => {
    const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  };
  DS.encodeSetup = (setup) => b64urlEncode(JSON.stringify(setup));
  DS.decodeSetup = function (text) {
    let raw = String(text || "").trim();
    const m = raw.match(/[#&?]setup=([A-Za-z0-9_-]+)/);
    if (m) raw = m[1];
    let data;
    try { data = JSON.parse(raw); } catch (e) { data = JSON.parse(b64urlDecode(raw)); }
    if (!data || data.kind !== "discipline-system-setup" || !Array.isArray(data.habits)) throw new Error("not a setup");
    return data;
  };
  // Apply a shared setup over a state, keeping that person's own history.
  DS.applySetup = function (state, setup, opts = {}) {
    state.habits = setup.habits.map(habitFrom);
    if (Array.isArray(setup.routines)) state.routines = setup.routines.map(routineFrom);
    if (opts.goals !== false && Array.isArray(setup.goals)) {
      state.goals = state.goals.concat(setup.goals.map((g) => ({ id: uid(), title: g.title, why: g.why || "", due: "", area: "", done: false,
        created: todayKey(), milestones: (g.milestones || []).map((name) => ({ id: uid(), name, done: false })) })));
    }
    if (Array.isArray(setup.lies) && setup.lies.length) state.lies = items(setup.lies);
    if (Array.isArray(setup.truths) && setup.truths.length) state.truths = items(setup.truths);
    if (typeof setup.reminder === "string") state.reminder = setup.reminder;
    if (setup.title) state.profile.title = setup.title;
    if (opts.style !== false && setup.style) state.style = Object.assign(state.style, setup.style);
    return state;
  };
})();
