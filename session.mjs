import { dailyNew, day, empty, grade, parseBackup, queue, status } from './learning.mjs?v=2';

const sprintStart = '2026-11-10';
const sprintTarget = 650;
export const reviewStart = '2026-11-27';
export const targetDate = '2026-11-30';
export const modes = ['listening', 'reading', 'writing'];
const dayMs = 86_400_000;
const defaults = { accent: 'en-US', speed: 'normal', reminder: '20:30', limit: 30, target: 500 };
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const cardPattern = /^[a-z][a-z-]*:(listening|reading|writing)$/;
const sensePattern = /^[a-z][a-z-]*:[a-z][a-z-]*$/;
const senseLevels = ['weak', 'learning', 'strong'];
const cardId = item => `${item.word.id}:${item.skill}`;

export const createData = (progress = empty()) => ({
  version: 2, progress, prefs: { ...defaults }, session: null, undo: null, reviews: {},
});

function validateSession(session) {
  if (session === null) return;
  if (!object(session) || !Array.isArray(session.ids) || !session.ids.every(id => cardPattern.test(id))
    || new Set(session.ids).size !== session.ids.length || !Number.isInteger(session.cursor)
    || session.cursor < 0 || session.cursor >= session.ids.length || !object(session.drafts)
    || (session.check !== undefined && session.check !== true)
    || !Array.isArray(session.done) || new Set(session.done).size !== session.done.length
    || !session.done.every(id => session.ids.includes(id))) throw new Error('续学位置无效');
  validateDrafts(session.drafts, id => session.ids.includes(id));
}

function validateDrafts(drafts, validId) {
  if (!object(drafts)) throw new Error('答案草稿无效');
  for (const [id, data] of Object.entries(drafts)) {
    if (!validId(id) || !object(data)
      || ['spelling', 'phrase'].some(key => data[key] !== undefined && (typeof data[key] !== 'string' || data[key].length > 180))
      || ['played', 'correct', 'revealed'].some(key => data[key] !== undefined && typeof data[key] !== 'boolean')) {
      throw new Error('答案草稿无效');
    }
  }
}

function validateResults(results) {
  if (results === undefined) return;
  if (!object(results) || !Object.entries(results).every(([date, answers]) =>
    datePattern.test(date) && object(answers) && Object.entries(answers).every(([id, answer]) =>
      cardPattern.test(id) && typeof answer === 'boolean'))) throw new Error('复测结果无效');
}

function validateSnapshot(data) {
  parseBackup(JSON.stringify(data.progress));
  validateSession(data.session);
  validateResults(data.retention);
  validateResults(data.checks);
  if (!object(data.reviews) || !Object.entries(data.reviews).every(([date, count]) =>
    datePattern.test(date) && Number.isInteger(count) && count >= 0)) throw new Error('复习记录无效');
}

export function readBackup(raw) {
  const data = JSON.parse(raw);
  if (data?.version === 1) return createData(parseBackup(raw));
  if (data?.version !== 2) throw new Error('备份版本无效');
  validateSnapshot(data);
  if (data.deferredDrafts !== undefined) validateDrafts(data.deferredDrafts, id => cardPattern.test(id));
  if (data.senseLevels !== undefined && (!object(data.senseLevels)
    || !Object.entries(data.senseLevels).every(([key, level]) => sensePattern.test(key) && senseLevels.includes(level)))) {
    throw new Error('义项记录无效');
  }
  if (data.undo !== null) {
    if (!object(data.undo)) throw new Error('撤销记录无效');
    validateSnapshot(data.undo);
    if (data.undo.deferredDrafts !== undefined) validateDrafts(data.undo.deferredDrafts, id => cardPattern.test(id));
  }
  const p = data.prefs;
  if (!object(p) || !['en-US', 'en-GB'].includes(p.accent) || !['normal', 'slow'].includes(p.speed)
    || !/^([01]\d|2[0-3]):[0-5]\d$/.test(p.reminder)
    || !Number.isInteger(p.limit) || p.limit < 20 || p.limit > 40
    || (p.sprintBase !== undefined && (!Number.isInteger(p.sprintBase) || p.sprintBase < 30 || p.sprintBase > 50))
    || !Number.isInteger(p.target) || p.target < 15 || p.target > 1200) throw new Error('学习偏好无效');
  return data;
}

function unfinishedDrafts(data) {
  const pending = { ...data.deferredDrafts };
  for (const [id, answer] of Object.entries(data.session?.drafts ?? {})) {
    if (!data.session.done.includes(id)) pending[id] = answer;
  }
  return pending;
}

function mergeSnapshot(local, imported) {
  const cards = { ...local.progress.cards };
  for (const [id, entry] of Object.entries(imported.progress.cards)) {
    if (!cards[id] || Date.parse(entry.lastAt) > Date.parse(cards[id].lastAt)) cards[id] = entry;
  }
  const firstSeen = { ...local.progress.firstSeen };
  for (const [id, date] of Object.entries(imported.progress.firstSeen)) {
    if (!Object.hasOwn(firstSeen, id) || date < firstSeen[id]) firstSeen[id] = date;
  }
  const reviews = { ...local.reviews };
  for (const [date, count] of Object.entries(imported.reviews)) reviews[date] = Math.max(reviews[date] ?? 0, count);

  const owner = local.session ? local : imported;
  const deferredDrafts = { ...unfinishedDrafts(imported), ...unfinishedDrafts(local) };
  let session = owner.session;
  if (session) {
    const original = session;
    const active = original.ids[original.cursor];
    const ids = original.ids.filter(id => original.done.includes(id)
      || cards[id]?.lastAt === owner.progress.cards[id]?.lastAt);
    const pending = ids.filter(id => !original.done.includes(id));
    const drafts = {};
    for (const id of ids) {
      const answer = original.done.includes(id) ? original.drafts[id] : deferredDrafts[id];
      if (answer) drafts[id] = answer;
      delete deferredDrafts[id];
    }
    const cursor = ids.indexOf(pending.includes(active) ? active : pending[0]);
    session = pending.length ? { ...original, ids, cursor, drafts } : null;
  }
  const merged = { progress: { version: 1, cards, firstSeen }, reviews, session, deferredDrafts };
  for (const field of ['retention', 'checks']) {
    if (!local[field] && !imported[field]) continue;
    const days = { ...local[field] };
    for (const [date, answers] of Object.entries(imported[field] ?? {})) {
      days[date] = { ...answers, ...days[date] };
    }
    merged[field] = days;
  }
  return merged;
}

export function mergeBackup(local, imported) {
  const merged = mergeSnapshot(local, imported);
  const mergedUndo = local.undo ? mergeSnapshot(local.undo, imported) : null;
  const untouched = !local.session && !Object.keys(local.progress.cards).length;
  return {
    ...local, ...merged,
    senseLevels: { ...imported.senseLevels, ...local.senseLevels },
    undo: mergedUndo ?? (untouched ? imported.undo : null),
  };
}

function resumeDrafts(data, ids) {
  const drafts = {};
  const deferredDrafts = { ...data.deferredDrafts };
  for (const id of ids) {
    const answer = deferredDrafts[id];
    if (!answer) continue;
    if (Object.hasOwn(data.progress.cards, id)) {
      const { spelling, phrase } = answer;
      drafts[id] = { spelling, phrase };
    } else {
      drafts[id] = answer;
    }
    delete deferredDrafts[id];
  }
  return { drafts, deferredDrafts };
}

export function current(data, words) {
  const id = data.session?.ids[data.session.cursor];
  if (!id) return null;
  const [wordId, skill] = id.split(':');
  const word = words.find(entry => entry.id === wordId);
  return word?.skills.includes(skill) ? { id, word, skill } : null;
}

export function sprintBase(data) {
  return data.prefs.sprintBase ?? Math.max(30, data.prefs.limit);
}

function sprintPlan(data, words, date) {
  const remainingDays = Math.max(0, (Date.parse(reviewStart) - Date.parse(date)) / dayMs);
  let learned = 0;
  let today = 0;
  for (const { id } of words) {
    const firstSeen = data.progress.firstSeen[id];
    if (!firstSeen) continue;
    learned++;
    if (firstSeen === date) today++;
  }
  const remaining = Math.max(0, sprintTarget - learned);
  const atStart = remaining + today;
  const required = remainingDays > 0 ? Math.ceil(atStart / remainingDays) : 0;
  const base = sprintBase(data);
  const quota = date < sprintStart ? data.prefs.limit
    : remainingDays === 0 ? 0
    : Math.min(atStart, 50, date === sprintStart ? base : Math.max(base, required));
  return {
    target: sprintTarget, open: words.length, learned, today, remaining, remainingDays, quota,
    required, shortfall: Math.max(0, remaining - Math.max(0, 50 * remainingDays - today)),
  };
}

export function pending(data, words, now) {
  const date = day(now);
  const tasks = queue(data.progress, words, now);
  const sprint = sprintPlan(data, words, date);
  const capacity = Math.max(0, sprint.quota - sprint.today);
  return { ...tasks, new: tasks.new.slice(0, capacity), extra: date < reviewStart ? tasks.extra : [] };
}

export function reviewSession(data, words, now) {
  const previous = data.session;
  if (previous?.check) return day(now) > targetDate ? { ...data, session: null } : data;
  if (day(now) < reviewStart || !previous?.ids.some(id => !Object.hasOwn(data.progress.cards, id))) return data;
  const ids = pending(data, words, now).due.map(cardId).filter(id => !previous.done.includes(id));
  const drafts = {};
  const deferredDrafts = { ...data.deferredDrafts };
  for (const [id, answer] of Object.entries(previous.drafts)) {
    if (ids.includes(id)) drafts[id] = answer;
    else if (!previous.done.includes(id)) deferredDrafts[id] = answer;
  }
  const cursor = Math.max(0, ids.indexOf(previous.ids[previous.cursor]));
  const session = ids.length ? { ids, cursor, drafts, done: [] } : null;
  return Object.keys(deferredDrafts).length ? { ...data, session, deferredDrafts } : { ...data, session };
}

export function startSession(data, words, now) {
  const reviewed = reviewSession(data, words, now);
  if (reviewed !== data) return reviewed;
  const item = current(data, words);
  const tasks = pending(data, words, now);
  if (item) {
    if (Object.hasOwn(data.progress.cards, item.id)) return data;
    const due = tasks.due.map(cardId).filter(id => !data.session.done.includes(id));
    if (!due.length) return data;
    const ids = data.session.ids.filter(id => !due.includes(id));
    const cursor = ids.indexOf(item.id);
    ids.splice(cursor, 0, ...due);
    return { ...data, session: { ...data.session, ids, cursor } };
  }
  const ids = [...tasks.due, ...tasks.extra, ...tasks.new].map(cardId);
  if (!ids.length) return { ...data, session: null };
  const { drafts, deferredDrafts } = resumeDrafts(data, ids);
  return { ...data, deferredDrafts, session: { ids, cursor: 0, drafts, done: [] } };
}

export function move(data, offset) {
  if (!data.session) return data;
  const cursor = Math.max(0, Math.min(data.session.ids.length - 1, data.session.cursor + offset));
  return { ...data, session: { ...data.session, cursor } };
}

export function draft(data, change) {
  const session = data.session;
  const id = session?.ids[session.cursor];
  if (!id || session.done.includes(id)) return data;
  return { ...data, session: { ...session, drafts: { ...session.drafts, [id]: { ...session.drafts[id], ...change } } } };
}

export function setSenseLevel(data, item, senseId, level) {
  if (!item || (senseId !== 'main' && !item.word.senses?.some(sense => sense.id === senseId))
    || (level !== '' && !senseLevels.includes(level))) return data;
  const key = `${item.word.id}:${senseId}`;
  if ((data.senseLevels?.[key] ?? '') === level) return data;
  const next = { ...data.senseLevels };
  if (level) next[key] = level;
  else delete next[key];
  return { ...data, senseLevels: next };
}

function checkPools(data, words, date) {
  const checked = data.checks?.[date] ?? {};
  return modes.map(skill => ({
    remaining: Math.max(0, 5 - Object.keys(checked).filter(id => id.endsWith(':' + skill)).length),
    ids: words.filter(word => word.skills.includes(skill)
      && data.progress.firstSeen[word.id] < date
      && Object.hasOwn(data.progress.cards, word.id + ':' + skill)
      && !Object.hasOwn(checked, word.id + ':' + skill))
      .map(word => word.id + ':' + skill),
  }));
}

export function checkAvailable(data, words, now) {
  const date = day(now);
  return date >= reviewStart && date <= targetDate && !data.session && !queue(data.progress, words, now).due.length
    && checkPools(data, words, date).some(pool => pool.remaining && pool.ids.length);
}

export function beginCheck(data, words, now, random = Math.random) {
  if (!checkAvailable(data, words, now)) return data;
  const selected = [];
  for (const { remaining, ids } of checkPools(data, words, day(now))) {
    for (let index = 0; index < remaining && ids.length; index++) {
      selected.push(ids.splice(Math.floor(random() * ids.length), 1)[0]);
    }
  }
  return { ...data, session: { ids: selected, cursor: 0, drafts: {}, done: [], check: true } };
}

function advanceSession(session, id) {
  const done = [...session.done, id];
  const candidates = [...session.ids.slice(session.cursor + 1), ...session.ids.slice(0, session.cursor)];
  const next = candidates.find(candidate => !done.includes(candidate));
  return next ? { ...session, done, cursor: session.ids.indexOf(next) } : null;
}

function noteResult(results, date, id, answer) {
  if (Object.hasOwn(results?.[date] ?? {}, id)) return results;
  return { ...results, [date]: { ...results?.[date], [id]: answer } };
}

export function recordCheck(data, words, now) {
  const session = data.session;
  const date = day(now);
  if (!session?.check || date < reviewStart || date > targetDate) return data;
  const item = current(data, words);
  if (!item || session.done.includes(item.id)) return data;
  const answer = session.drafts[item.id]?.correct;
  if (typeof answer !== 'boolean') return data;
  return { ...data, checks: noteResult(data.checks, date, item.id, answer), session: advanceSession(session, item.id) };
}

export function rate(data, words, rating, now) {
  const item = current(data, words);
  data = reviewSession(data, words, now);
  if (item?.id !== current(data, words)?.id) return data;
  const session = data.session;
  if (!item || session.check || session.done.includes(item.id)) return data;
  const answer = session.drafts[item.id]?.correct;
  if (typeof answer !== 'boolean' || (!answer && rating !== 1)) return data;
  const previous = data.progress.cards[item.id];
  const wasLearned = Object.hasOwn(data.progress.firstSeen, item.word.id);
  const today = day(now);
  if (!previous) {
    if (today >= reviewStart) return data;
    if (!wasLearned) {
      const sprint = sprintPlan(data, words, today);
      if (sprint.today >= sprint.quota) return data;
    }
  }
  const next = {
    ...data,
    progress: grade(data.progress, item, rating, now),
    reviews: previous ? { ...data.reviews, [today]: (data.reviews[today] ?? 0) + 1 } : data.reviews,
    session: advanceSession(session, item.id),
    undo: { progress: data.progress, reviews: data.reviews, session },
  };
  if (previous && day(new Date(previous.lastAt)) < today && new Date(previous.fsrs.due) <= now) {
    next.retention = noteResult(data.retention, today, item.id, answer);
    next.undo.retention = data.retention ?? {};
  }
  return next;
}

export function undo(data) {
  if (!data.undo) return data;
  const { progress, reviews, session } = data.undo;
  const restored = { ...data, progress, reviews, session, undo: null };
  if (data.undo.retention !== undefined) restored.retention = data.undo.retention;
  if (data.undo.deferredDrafts !== undefined) restored.deferredDrafts = data.undo.deferredDrafts;
  return restored;
}

function countResults(results, skill) {
  let correct = 0;
  let total = 0;
  for (const answers of Object.values(results ?? {})) {
    for (const [id, answer] of Object.entries(answers)) {
      if (skill && !id.endsWith(':' + skill)) continue;
      total++;
      if (answer) correct++;
    }
  }
  return { correct, total };
}

export function plan(data, words, now) {
  const today = day(now);
  const dates = Object.values(data.progress.firstSeen);
  const time = Date.parse(today);
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(time - (6 - i) * dayMs).toISOString().slice(0, 10);
    return { date, learned: dates.filter(value => value === date).length, reviewed: data.reviews[date] ?? 0 };
  });
  const completed = days.slice(0, -1);
  const studied = completed.filter(entry => entry.learned > 0 || entry.reviewed > 0);
  const first = [...dates].sort()[0];
  const measured = completed.filter(entry => entry.date >= first && entry.date < reviewStart);
  const pace = studied.length >= 3 && measured.length >= 3
    ? measured.reduce((sum, entry) => sum + entry.learned, 0) / measured.length : null;
  const sprint = sprintPlan(data, words, today);
  const { learned, remainingDays } = sprint;
  const mastered = words.filter(word => status(data.progress, word) === '已掌握').length;
  return {
    days, sprint, retention: countResults(data.retention),
    checks: Object.fromEntries(modes.map(skill => [skill, countResults(data.checks, skill)])),
    today: dailyNew(data.progress, now), learned, mastered, pace, remainingDays,
    weak: words.filter(word => status(data.progress, word) === '待巩固').length,
    forecast: pace === null ? null : Math.min(words.length, Math.max(learned, Math.floor(learned + pace * remainingDays))),
  };
}
