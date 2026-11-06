import { dailyNew, day, empty, grade, parseBackup, queue, status } from './learning.mjs?v=2';

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

function validateSnapshot(data) {
  parseBackup(JSON.stringify(data.progress));
  validateSession(data.session);
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
  }
  const p = data.prefs;
  if (!object(p) || !['en-US', 'en-GB'].includes(p.accent) || !['normal', 'slow'].includes(p.speed)
    || !/^([01]\d|2[0-3]):[0-5]\d$/.test(p.reminder)
    || !Number.isInteger(p.limit) || p.limit < 20 || p.limit > 40
    || !Number.isInteger(p.target) || p.target < 15 || p.target > 1200) throw new Error('学习偏好无效');
  return data;
}

export function current(data, words) {
  const id = data.session?.ids[data.session.cursor];
  if (!id) return null;
  const [wordId, skill] = id.split(':');
  const word = words.find(entry => entry.id === wordId);
  return word?.skills.includes(skill) ? { id, word, skill } : null;
}

export function pending(data, words, now) {
  const tasks = queue(data.progress, words, now);
  const capacity = day(now) < reviewStart ? Math.max(0, data.prefs.limit - dailyNew(data.progress, now)) : 0;
  return { ...tasks, new: tasks.new.slice(0, capacity), extra: day(now) < reviewStart ? tasks.extra : [] };
}

export function reviewSession(data, words, now) {
  const previous = data.session;
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
  return { ...data, session: ids.length ? { ids, cursor: 0, drafts: {}, done: [] } : null };
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

export function rate(data, words, rating, now) {
  const item = current(data, words);
  data = reviewSession(data, words, now);
  if (item?.id !== current(data, words)?.id) return data;
  const session = data.session;
  if (!item || session.done.includes(item.id)) return data;
  const answer = session.drafts[item.id]?.correct;
  if (typeof answer !== 'boolean' || (!answer && rating !== 1)) return data;
  const previous = data.progress.cards[item.id];
  const wasLearned = Object.hasOwn(data.progress.firstSeen, item.word.id);
  if (!previous && (day(now) >= reviewStart || (!wasLearned && dailyNew(data.progress, now) >= data.prefs.limit))) return data;
  const today = day(now);
  const done = [...session.done, item.id];
  const candidates = [...session.ids.slice(session.cursor + 1), ...session.ids.slice(0, session.cursor)];
  const next = candidates.find(id => !done.includes(id));
  return {
    ...data,
    progress: grade(data.progress, item, rating, now),
    reviews: previous ? { ...data.reviews, [today]: (data.reviews[today] ?? 0) + 1 } : data.reviews,
    session: next ? { ...session, done, cursor: session.ids.indexOf(next) } : null,
    undo: { progress: data.progress, reviews: data.reviews, session },
  };
}

export function undo(data) {
  if (!data.undo) return data;
  const { progress, reviews, session } = data.undo;
  return { ...data, progress, reviews, session, undo: null };
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
  const remainingDays = Math.max(0, (Date.parse(reviewStart) - time) / dayMs);
  const learned = words.filter(word => Object.hasOwn(data.progress.firstSeen, word.id)).length;
  const mastered = words.filter(word => status(data.progress, word) === '已掌握').length;
  return {
    days, today: dailyNew(data.progress, now), learned, mastered, pace, remainingDays,
    weak: words.filter(word => status(data.progress, word) === '待巩固').length,
    forecast: pace === null ? null : Math.min(words.length, Math.max(learned, Math.floor(learned + pace * remainingDays))),
  };
}
