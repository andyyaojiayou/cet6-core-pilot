import { createEmptyCard, fsrs, Rating, State } from './vendor/ts-fsrs.mjs';

const scheduler = fsrs({ enable_fuzz: false });
const zone = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' });
const skills = ['listening', 'reading', 'writing'];
const key = ({ word, skill }) => `${word.id}:${skill}`;
export const day = (date) => zone.format(date);
export const empty = () => ({ version: 1, cards: {}, firstSeen: {} });

export function grade(state, item, rating, now = new Date()) {
  if (!item.word.skills.includes(item.skill) || ![1, 2, 3, 4].includes(rating)) {
    throw new Error('无效训练卡或评分');
  }
  const id = key(item);
  const previous = state.cards[id];
  const card = previous?.fsrs ?? createEmptyCard(now);
  const next = scheduler.next(card, now, rating).card;
  const spaced = previous && day(now) > day(new Date(previous.lastAt))
    && now >= new Date(card.due) && rating >= Rating.Good && next.state === State.Review;
  const entry = {
    fsrs: { ...next, due: next.due.toISOString(), last_review: next.last_review.toISOString() },
    lastAt: now.toISOString(),
    rating,
    mastered: rating > Rating.Again && Boolean(previous?.mastered || spaced),
  };
  return {
    ...state,
    cards: { ...state.cards, [id]: entry },
    firstSeen: { ...state.firstSeen, [item.word.id]: state.firstSeen[item.word.id] ?? day(now) },
  };
}

export function status(state, word, skill) {
  const entries = (skill ? [skill] : word.skills).map(mode => state.cards[key({ word, skill: mode })]);
  if (entries.every(entry => !entry)) return '未学习';
  if (entries.some(entry => entry?.rating === Rating.Again || entry?.fsrs.state === State.Relearning)) return '待巩固';
  if (entries.every(entry => entry?.mastered)) return '已掌握';
  return '已学习';
}

export function dailyNew(state, now = new Date()) {
  return Object.values(state.firstSeen).filter(value => value === day(now)).length;
}

export function queue(state, words, now = new Date()) {
  const due = [], fresh = [], extra = [];
  for (const word of words) {
    for (const skill of word.skills) {
      const item = { word, skill };
      const entry = state.cards[key(item)];
      if (entry && new Date(entry.fsrs.due) <= now) due.push(item);
      if (!entry && state.firstSeen[word.id]) extra.push(item);
    }
    if (!state.firstSeen[word.id]) fresh.push({ word, skill: word.skills[0] });
  }
  due.sort((a, b) => Date.parse(state.cards[key(a)].fsrs.due) - Date.parse(state.cards[key(b)].fsrs.due));
  return { due, new: fresh, extra };
}

const normalize = value => value.normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ');
export function writingCorrect(word, spelling, phrase) {
  return normalize(spelling) === word.id && word.accept.some(value => normalize(phrase) === normalize(value));
}

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const timestamp = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
const wordId = /^[a-z][a-z-]*$/;
const counters = ['elapsed_days', 'scheduled_days', 'learning_steps', 'reps', 'lapses'];
export function parseBackup(raw) {
  const data = JSON.parse(raw);
  if (!object(data) || data.version !== 1 || !object(data.cards) || !object(data.firstSeen)) {
    throw new Error('备份格式不正确');
  }
  for (const [id, value] of Object.entries(data.firstSeen)) {
    if (!wordId.test(id) || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !timestamp(value)) throw new Error('词条日期不正确');
  }
  for (const [id, entry] of Object.entries(data.cards)) {
    const [word, skill, tail] = id.split(':');
    const card = entry?.fsrs;
    if (!wordId.test(word) || !skills.includes(skill) || tail !== undefined || !Object.hasOwn(data.firstSeen, word)
      || !object(entry) || !timestamp(entry.lastAt) || typeof entry.mastered !== 'boolean'
      || ![1, 2, 3, 4].includes(entry.rating) || !object(card)
      || !timestamp(card.due) || !timestamp(card.last_review) || ![0, 1, 2, 3].includes(card.state)
      || !Number.isFinite(card.stability) || card.stability <= 0 || !Number.isFinite(card.difficulty)
      || !counters.every(field => Number.isInteger(card[field]) && card[field] >= 0)) {
      throw new Error('备份包含无效复习记录');
    }
  }
  const withCards = new Set(Object.keys(data.cards).map(id => id.split(':')[0]));
  if (Object.keys(data.firstSeen).some(id => !withCards.has(id))) throw new Error('备份缺少复习记录');
  return data;
}
