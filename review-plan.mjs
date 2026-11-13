export const fixedSchedule = 'fixed-days-v1';
export const reviewOffsets = [0, 1, 3, 7];
const zone = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' });
export const calendarDay = date => zone.format(date);
export const addDays = (date, days) => new Date(Date.parse(date) + days * 86400000).toISOString().slice(0, 10);
export const startOfDay = date => Date.parse(date + 'T00:00:00+08:00');
const offsetOn = (origin, date) => Math.floor((Date.parse(date) - Date.parse(origin)) / 86400000);
const throughOn = (origin, date) => reviewOffsets.filter(offset => offset <= offsetOn(origin, date)).at(-1) ?? -1;

export function newReviewPlan(origin) {
  return { origin, through: -1, due: origin, lastReview: null, complete: false, history: [] };
}

export function recordReview(plan, correct, now) {
  const date = calendarDay(now);
  const through = Math.max(plan.through, throughOn(plan.origin, date));
  const complete = correct && through === 7;
  const nextOffset = reviewOffsets.find(offset => offset > through);
  const due = complete ? null : !correct ? addDays(date, 1) : addDays(plan.origin, nextOffset);
  return { ...plan, through, due, complete, lastReview: date,
    history: [...plan.history, { at: now.toISOString(), correct, through }] };
}

export function migrateProgress(progress) {
  if (progress.schedule === fixedSchedule && Object.values(progress.cards).every(entry => entry.fixed)) return progress;
  const cards = Object.fromEntries(Object.entries(progress.cards).map(([id, entry]) => {
    if (entry.fixed) return [id, entry];
    const origin = entry.fsrs.reps === 1 ? calendarDay(new Date(entry.lastAt)) : progress.firstSeen[id.split(':')[0]];
    let fixed = newReviewPlan(origin);
    // A last review is evidenced only when the legacy card has more than one answer.
    if (entry.fsrs.reps > 1) {
      fixed = recordReview(fixed, entry.rating > 1, new Date(entry.lastAt));
      fixed.history = []; // Earlier individual review events are not reconstructible.
    }
    return [id, { ...entry, fixed }];
  }));
  return { ...progress, schedule: fixedSchedule, cards };
}

export function dueTime(progress, entry) {
  if (!entry) return Infinity;
  if (progress.schedule !== fixedSchedule) return Date.parse(entry.fsrs.due);
  return entry.fixed?.due ? startOfDay(entry.fixed.due) : Infinity;
}

export function validReviewPlan(plan) {
  const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  return plan && date(plan.origin) && [-1, ...reviewOffsets].includes(plan.through)
    && typeof plan.complete === 'boolean' && (plan.complete ? plan.through === 7 && plan.due === null : date(plan.due) && plan.due >= plan.origin)
    && (plan.lastReview === null || date(plan.lastReview) && plan.lastReview >= plan.origin)
    && Array.isArray(plan.history) && plan.history.every(event => event && typeof event.at === 'string'
      && Number.isFinite(Date.parse(event.at)) && typeof event.correct === 'boolean' && reviewOffsets.includes(event.through));
}
