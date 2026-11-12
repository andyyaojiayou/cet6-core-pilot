import { day } from './learning.mjs?v=3';
import { current, pending, startDueReview, startSession } from './session.mjs?v=12';

export const trainingOrder = ['writing', 'reading', 'listening'];
export const trainingNames = { writing: '看中文拼写', reading: '看语境选词义', listening: '听句子辨词义' };
const skillOf = id => id.split(':')[1];

// Group only the selected batch. Never reorder the deck before applying its quota.
export function groupSession(data, slot = 'session', preserveCurrent = true) {
  const session = data[slot];
  if (!session || session.check || session.grouped) return data;
  const selected = session.ids[session.cursor];
  const skill = skillOf(selected);
  const order = preserveCurrent ? [skill, ...trainingOrder.filter(value => value !== skill)] : trainingOrder;
  const ids = order.flatMap(value => session.ids.filter(id => skillOf(id) === value));
  return { ...data, [slot]: { ...session, ids, grouped: true, cursor: preserveCurrent ? ids.indexOf(selected) : 0 } };
}

export function startTraining(data, words, now, slot = 'session') {
  const preserve = Boolean(current(data, words, slot));
  const next = slot === 'review' ? startDueReview(data, words, now) : startSession(data, words, now, { newOnly: true });
  return groupSession(next, slot, preserve);
}

export function continueGroup(data, slot = 'session') {
  if (!data[slot]?.groupBreak) return data;
  const session = { ...data[slot] };
  delete session.groupBreak;
  return { ...data, [slot]: session };
}

export function sessionGroups(session) {
  if (!session) return [];
  return [...new Set(session.ids.map(skillOf))].map(skill => {
    const ids = session.ids.filter(id => skillOf(id) === skill);
    const done = ids.filter(id => session.done.includes(id)).length;
    return { skill, ids, done, total: ids.length };
  });
}

export function dailyGroups(data, words, now) {
  const tasks = pending(data, words, now);
  const today = day(now);
  return trainingOrder.map(skill => {
    const done = words.filter(word => data.progress.firstSeen[word.id] === today && word.skills[0] === skill).length;
    const remaining = tasks.new.filter(item => item.skill === skill).length;
    return { skill, done, total: done + remaining, due: tasks.due.filter(item => item.skill === skill).length };
  });
}
