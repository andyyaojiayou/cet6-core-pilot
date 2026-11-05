import { words } from './words.mjs?v=5';
import { dailyNew, day, status, writingCorrect } from './learning.mjs';
import { dailyQuote } from './daily-quote.mjs';
import { createData, current, draft, modes, move, pending, plan, rate, readBackup,
  reviewStart, startSession, targetDate, undo } from './session.mjs';
import { openStore, StaleProgress } from './storage.mjs';

const $ = id => document.getElementById(id);
const names = { listening: '听力', reading: '阅读', writing: '写作' };
const study = $('study');
const pages = ['learn', 'plan', 'settings'];
const audio = new Audio();
audio.preload = 'none';
let playback = 0, lastClip;
let data = createData(), revision = null, store, ready = false, active = false;
let writes = Promise.resolve();

function message(value) {
  $('notice').textContent = value;
  $('notice').hidden = !value;
}

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function exampleSentence(word) {
  const sentence = element('p', '', 'reading-sentence');
  sentence.lang = 'en';
  const target = word.form ?? word.id;
  const match = word.sentence.match(new RegExp('\\b' + target + '\\b', 'i'));
  if (!match) {
    sentence.textContent = word.sentence;
    return sentence;
  }
  sentence.append(word.sentence.slice(0, match.index), element('mark', match[0]),
    word.sentence.slice(match.index + match[0].length));
  return sentence;
}

function button(text, action, className) {
  const node = element('button', text, className);
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}

function load(record) {
  data = record.data;
  revision = record.revision;
  ready = true;
}

function save(change, after, recovery = false) {
  writes = writes.then(async () => {
    if (!store || (!ready && !recovery)) {
      message('请在支持本地存储的 Safari 标签页中打开，或恢复备份。');
      return;
    }
    try {
      const next = change(data);
      if (next !== data) load(await store.save(next, revision));
      after?.(next);
    } catch (error) {
      if (error instanceof StaleProgress) {
        load(await store.load());
        active = false;
        render();
        message('另一标签页已更新进度。已读取最新记录，请继续。');
      } else message('本次操作未确认保存，请保留当前页面后重试。');
    }
  }).catch(() => message('读取学习记录失败，请重开页面或从备份恢复。'));
  return writes;
}

function stopAudio() {
  playback++;
  audio.pause();
  window.speechSynthesis?.cancel();
}

function play(word, kind, speed = data.prefs.speed) {
  stopAudio();
  lastClip = { word, kind, speed };
  const token = playback;
  const accent = data.prefs.accent;
  const ratio = speed === 'slow' ? 0.78 : 1;
  audio.src = './audio/' + accent + '/' + word.id + '-' + kind + '.mp3';
  audio.defaultPlaybackRate = ratio;
  audio.playbackRate = ratio;
  audio.play().catch(() => {
    if (token !== playback) return;
    if (!window.speechSynthesis) {
      message('音频暂时无法播放，请检查网络和媒体音量后重试。');
      return;
    }
    const speech = new SpeechSynthesisUtterance(kind === 'word' ? word.id : word.sentence);
    speech.lang = accent;
    speech.rate = ratio;
    speech.voice = speechSynthesis.getVoices().find(voice => voice.lang === accent && voice.localService) ?? null;
    speech.onerror = () => {
      if (token === playback) message('朗读未能播放，请重新轻点播放。');
    };
    speechSynthesis.speak(speech);
    message('正在使用设备备用语音。');
  });
}

function audioControls(word, kind, onPlay) {
  const controls = element('div', '', 'row audio-controls');
  const title = kind === 'word' ? '单词' : '例句';
  const begin = speed => {
    play(word, kind, speed);
    onPlay?.();
  };
  controls.append(
    button('▶ ' + title, () => begin(data.prefs.speed), 'primary'),
    button('慢速', () => begin('slow')),
    button('重播', () => begin(lastClip?.word.id === word.id && lastClip.kind === kind ? lastClip.speed : data.prefs.speed)),
  );
  return controls;
}

function refreshToday() {
  const now = new Date();
  const { english, chinese } = dailyQuote(now);
  if ($('quote-en').textContent !== english) {
    $('quote-en').textContent = english;
    $('quote-zh').textContent = chinese;
    $('daily-quote').hidden = false;
  }
  if (!ready) return;
  const tasks = pending(data, words, now);
  const learned = dailyNew(data.progress, now);
  $('due').textContent = tasks.due.length;
  $('fresh').textContent = learned + ' / ' + (learned + tasks.new.length);
  $('remaining').textContent = data.session
    ? data.session.ids.length - data.session.done.length
    : tasks.due.length + tasks.new.length + tasks.extra.length;
}

function updateCard(item, change, after) {
  save(previous => current(previous, words)?.id === item.id ? draft(previous, change) : previous, after);
}

function renderStudy() {
  $('hero').hidden = active && !!current(data, words);
  if (!ready) return;
  const item = current(data, words);
  if (!active || !item) {
    active = false;
    const start = button(item ? '继续上次学习' : '开始学习', () => {
      save(previous => startSession(previous, words, new Date()), () => {
        active = Boolean(current(data, words));
        render();
      });
    }, 'primary');
    start.id = 'start';
    const tasks = pending(data, words, new Date());
    const empty = !item && tasks.due.length + tasks.new.length + tasks.extra.length === 0;
    const detail = item ? '会回到上次的词卡，保留未提交答案。'
      : empty ? '现在没有待做任务，可稍后检查到期词。'
      : '先复习到期卡，再做主动回忆。';
    study.replaceChildren(element('h2', item ? '从上次停下的地方继续' : '今日练习'), element('p', detail), start);
    const actions = element('div', '', 'row');
    if (data.undo) actions.append(button('撤销上次评分', undoLast));
    if (item) actions.append(button('结束当前任务', () => {
      if (!confirm('结束当前任务？未提交的答案草稿会清空，已保存的学习与复习记录会保留。')) return;
      save(previous => ({ ...previous, session: null }), render);
    }));
    if (actions.childElementCount) study.append(actions);
    return;
  }

  const { word, skill } = item;
  const session = data.session;
  const answered = session.drafts[item.id] ?? {};
  const scored = session.done.includes(item.id);
  const answeredCard = typeof answered.correct === 'boolean';
  const header = element('div', '', 'row');
  header.append(element('span', names[skill], 'badge'), element('span', word.theme, 'badge'),
    element('span', '第 ' + (session.cursor + 1) + ' / ' + session.ids.length + ' 张', 'muted'));
  const titles = { listening: '听句子，辨认词义', reading: '看语境，选出词义', writing: '看中文，拼写并写出搭配' };
  const title = element('h2', titles[skill]);
  const body = element('div', '', 'stack');
  const nav = element('div', '', 'row card-nav');
  const previous = button('上一张', () => navigate(-1));
  const next = button('下一张', () => navigate(1));
  previous.disabled = session.cursor === 0;
  next.disabled = session.cursor === session.ids.length - 1;
  nav.append(previous, next, button('返回首页', () => { stopAudio(); active = false; render(); }));
  if (data.undo) nav.append(button('撤销上次评分', undoLast));
  study.replaceChildren(header, title, body, nav);

  if (answeredCard || scored) {
    showFeedback(item, answered, scored, body);
    return;
  }
  const answer = (correct, revealed = false) => updateCard(item, { correct, revealed }, () => {
    render();
    study.querySelector('.verdict')?.focus();
  });
  if (skill === 'writing') {
    const form = element('form', '', 'stack');
    const fields = [['spelling', word.cue], ['phrase', word.phraseCue]];
    const inputs = fields.map(([id, cue]) => {
      const label = element('label', '', 'field');
      label.append(element('span', cue));
      const input = element('input');
      input.type = 'text';
      input.id = id;
      input.lang = 'en';
      input.required = true;
      input.maxLength = 180;
      input.autocomplete = 'off';
      input.autocapitalize = 'none';
      input.setAttribute('autocorrect', 'off');
      input.spellcheck = false;
      input.value = answered[id] ?? '';
      input.addEventListener('input', () => updateCard(item, { [id]: input.value }));
      label.append(input);
      form.append(label);
      return input;
    });
    const submit = element('button', '提交拼写与搭配', 'primary');
    submit.type = 'submit';
    form.append(submit);
    form.addEventListener('submit', event => {
      event.preventDefault();
      answer(writingCorrect(word, inputs[0].value, inputs[1].value));
    });
    body.append(form);
  } else {
    const options = element('div', '', 'options');
    if (skill === 'listening') {
      options.hidden = !answered.played;
      body.append(audioControls(word, 'sentence', () => {
        if (options.hidden) updateCard(item, { played: true }, () => { options.hidden = false; });
      }));
    } else {
      body.append(exampleSentence(word));
    }
    const choices = [...word.distractors];
    const correctIndex = [...word.id].reduce((sum, c) => sum + c.charCodeAt(0), 0) % 4;
    choices.splice(correctIndex, 0, word.meaning);
    options.append(...choices.map(value => button(value, () => answer(value === word.meaning))));
    body.append(options);
  }
  body.append(button('想不起来', () => answer(false, true)));
}

function navigate(offset) {
  stopAudio();
  save(previous => move(previous, offset), render);
}

function undoLast() {
  stopAudio();
  save(undo, () => {
    active = Boolean(current(data, words));
    render();
    message('已撤销上次评分，复习时间和进度已恢复。');
  });
}

function semanticFeedback(word) {
  const section = element('section', '', 'semantic-feedback stack');
  const choices = element('div', '', 'semantic-choices');
  choices.setAttribute('role', 'group');
  choices.setAttribute('aria-label', '选择要对比的表达');
  const comparison = element('div', '', 'semantic-comparison stack');
  comparison.setAttribute('aria-live', 'polite');

  function select(related, selected) {
    for (const choice of choices.children) {
      choice.setAttribute('aria-pressed', String(choice === selected));
    }
    const title = element('h4', word.id + ' / ' + related.term);
    title.lang = 'en';
    const example = element('p', related.example, 'semantic-example');
    example.lang = 'en';
    comparison.replaceChildren(title, element('p', related.comparison), example,
      element('p', related.translation, 'muted'));
  }

  for (const related of word.related) {
    const choice = button('', () => select(related, choice), 'semantic-choice');
    const term = element('strong', related.term);
    term.lang = 'en';
    choice.append(element('span', related.kind, 'semantic-kind'), term, element('span', related.meaning, 'muted'));
    choices.append(choice);
  }
  select(word.related[0], choices.firstElementChild);
  section.append(element('h3', '放在语境里对比'), choices, comparison);
  return section;
}

function showFeedback(item, { correct, revealed }, scored, body) {
  const { word } = item;
  const box = element('div', '', 'feedback stack');
  const outcome = correct ? '答对了' : revealed ? '已揭晓' : revealed === false ? '答错了' : '待巩固';
  const verdict = element('div', '', 'verdict ' + (correct ? 'right' : revealed ? 'revealed' : 'wrong'));
  verdict.tabIndex = -1;
  const icon = element('span', correct ? '✓' : revealed ? '↪' : '!', 'verdict-icon');
  icon.setAttribute('aria-hidden', 'true');
  const result = element('div');
  result.append(element('strong', outcome), element('p', scored ? '已评分 · 可回看'
    : correct ? '请按实际回忆难度评分。' : '看完解析后可记录为忘记。'));
  verdict.append(icon, result);
  const head = element('h3', word.id + ' ' + word.ipa);
  head.lang = 'en-GB';
  const meaning = element('section', '', 'explanation stack');
  const definition = element('p', word.meaning, 'definition');
  definition.prepend(element('span', word.pos, 'badge part-of-speech'));
  meaning.append(head, definition, element('h4', '语境线索'), element('p', word.context));
  const usage = element('section', '', 'explanation stack');
  const collocation = element('p', word.collocation, 'collocation');
  collocation.lang = 'en';
  usage.append(element('h3', '语境与搭配'), collocation, exampleSentence(word),
    element('p', word.translation, 'muted'), audioControls(word, 'word'), audioControls(word, 'sentence'));
  box.append(verdict, meaning, usage);
  if (word.related?.length) box.append(semanticFeedback(word));
  if (word.senses?.length) {
    const senses = element('section', '', 'senses stack');
    senses.append(element('h3', '一词多义'));
    for (const sense of word.senses) {
      const entry = element('div', '', 'explanation stack');
      const example = element('p', sense.example, 'semantic-example');
      example.lang = 'en';
      const pattern = element('p', sense.collocation, 'collocation');
      pattern.lang = 'en';
      entry.append(element('h4', sense.pos + ' ' + sense.meaning), pattern, example,
        element('p', sense.translation, 'muted'), element('p', sense.context));
      senses.append(entry);
    }
    box.append(senses);
  }
  const hint = element('details', '', 'semantic-hint');
  hint.append(element('summary', '记忆提示与易错点'), element('p', word.hint));
  box.append(hint);
  const source = element('section', '', 'source-note stack');
  source.append(element('h3', '例句与词形出处'),
    element('p', '本卡练习句、辨析句与补充义项例句均为原创教学语境。'));
  if (word.source) {
    const label = word.source.kind === 'reference' ? '参考范文词形' : '真题资料词形';
    const evidence = element('p', label + ' · ');
    const form = element('strong', word.source.form);
    form.lang = 'en';
    evidence.append(form);
    const link = element('a', word.source.label, 'source-link');
    link.href = word.source.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    source.append(evidence, link);
  } else source.append(element('p', '选词依据 · 经验推荐'));
  box.append(source);
  if (!scored) {
    const grades = correct ? [[1, '忘记 / 猜对'], [2, '困难'], [3, '记得'], [4, '轻松']] : [[1, '记录为忘记']];
    const ratings = element('div', '', 'ratings');
    for (const [rating, label] of grades) {
      ratings.append(button(label, () => {
        stopAudio();
        let saved = false;
        save(previous => {
          if (current(previous, words)?.id !== item.id) return previous;
          const next = rate(previous, words, rating, new Date());
          saved = next !== previous;
          return next;
        }, () => {
          if (saved) {
            message('');
            render();
          } else message('该卡已评分，或今日新词任务已结束。可返回首页检查到期任务。');
        });
      }, rating === 3 || !correct ? 'primary' : ''));
    }
    box.append(ratings);
  }
  body.append(box);
}

function bar(value, max, label) {
  const progress = element('progress');
  progress.max = max;
  progress.value = Math.min(value, max);
  progress.setAttribute('aria-label', label);
  return progress;
}

function renderPlan() {
  const now = new Date();
  const today = day(now);
  const stats = plan(data, words, now);
  const target = data.prefs.target;
  const percentage = Math.min(100, Math.floor(stats.mastered / target * 100));
  const statusText = stats.forecast === null ? '积累中 · 至少需要 3 个完整学习日'
    : '按实际节奏预计首轮回忆 ' + stats.forecast + ' 词 · 当前词库 ' + words.length + ' 词';
  $('goal-stats').replaceChildren(
    element('p', '已掌握 ' + stats.mastered + ' / ' + target + ' 词 · ' + percentage + '%', 'lead'),
    bar(stats.mastered, target, '总目标进度'),
    element('p', '已学习 ' + stats.learned + ' · 已掌握 ' + stats.mastered + ' · 待巩固 ' + stats.weak),
    element('p', '11 月 30 日预测 · ' + statusText, 'muted'));
  const reviewDays = ['2026-11-27', '2026-11-28', '2026-11-29', targetDate];
  const stageData = [
    ['G1 · 15 词试学', words.filter(w => !w.tier), 15],
    ['核心 A 级', words.filter(w => w.tier === 'A'), 500],
    ['次核心 B 级', words.filter(w => w.tier === 'B'), 150],
  ];
  const stageRows = stageData.map(([label, entries, goal]) => {
    const count = entries.filter(word => Object.hasOwn(data.progress.firstSeen, word.id)).length;
    const mastered = entries.filter(word => status(data.progress, word) === '已掌握').length;
    const remaining = Math.max(0, goal - count);
    let estimate = count >= goal ? '首轮完成' : entries.length < goal ? '待扩库 · 当前已开放 ' + entries.length + ' 词' : '预计日期积累中';
    if (remaining && entries.length >= goal && stats.pace > 0) {
      const days = Math.ceil(remaining / stats.pace);
      const date = new Date(Date.parse(today) + days * 86_400_000).toISOString().slice(5, 10);
      estimate = '预计 ' + date + ' · ' + (days <= stats.remainingDays ? '按计划' : '需追赶');
    }
    const row = element('article', '', 'stage stack');
    row.append(element('h3', label), bar(count, goal, label),
      element('p', '目标 ' + goal + ' · 已学 ' + count + ' · 已掌握 ' + mastered + ' · 剩余 ' + remaining),
      element('p', estimate, 'muted'));
    return row;
  });
  const completed = reviewDays.filter(date => data.reviews[date] > 0).length;
  const review = element('article', '', 'stage stack');
  review.append(element('h3', '集中复习 · 11 月 27–30 日'), bar(completed, 4, '集中复习'),
    element('p', '已复习 ' + completed + ' / 4 天 · 剩余 ' + (4 - completed) + ' 天'),
    element('p', today < reviewStart ? '11 月 27 日开始 · 预计 11 月 30 日完成' : '目标完成日 11 月 30 日', 'muted'));
  $('stages').replaceChildren(...stageRows, review);
  $('skills').replaceChildren(...modes.map(skill => {
    const applicable = words.filter(word => word.skills.includes(skill));
    const passed = applicable.filter(word => status(data.progress, word, skill) === '已掌握').length;
    const reviewed = applicable.filter(word => status(data.progress, word, skill) !== '未学习').length;
    const row = element('li');
    row.append(element('strong', names[skill]), element('span', '已学 ' + reviewed + ' · 已掌握 ' + passed + ' / ' + applicable.length));
    return row;
  }));
  $('week').replaceChildren(...stats.days.map(entry => {
    const row = element('li');
    row.append(element('strong', entry.date.slice(5)), element('span', '新学 ' + entry.learned + ' · 复习 ' + entry.reviewed));
    return row;
  }));
  $('progress').replaceChildren(...words.map((word, i) => {
    const row = element('li');
    row.append(element('strong', status(data.progress, word) === '未学习' ? '词条 ' + (i + 1) : word.id),
      element('span', word.skills.map(skill => names[skill] + ' · ' + status(data.progress, word, skill)).join(' / '), 'muted'));
    return row;
  }));
}

function renderSettings() {
  for (const key of Object.keys(data.prefs)) $(key).value = data.prefs[key];
  $('reminder-help').textContent = '网页保存的提醒时间是 ' + data.prefs.reminder + '。请在 iPhone 提醒事项里设为同一时间。';
}

function render() {
  const page = pages.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'learn';
  for (const name of pages) $(name + '-page').hidden = page !== name;
  for (const tab of document.querySelectorAll('.tabs a')) {
    if (tab.hash === '#' + page) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  }
  if (page === 'learn') {
    refreshToday();
    renderStudy();
    return;
  }
  if (!ready) return;
  if (page === 'plan') renderPlan();
  else renderSettings();
}

for (const key of ['accent', 'speed', 'limit', 'target', 'reminder']) {
  $(key).addEventListener('change', event => {
    const input = event.currentTarget;
    if (!input.value || !input.checkValidity()) {
      renderSettings();
      return;
    }
    const value = input.type === 'number' ? input.valueAsNumber : input.value;
    save(previous => ({ ...previous, prefs: { ...previous.prefs, [key]: value } }), renderSettings);
  });
}

$('copy-link').addEventListener('click', async () => {
  const link = new URL(location.href);
  link.hash = '';
  try {
    await navigator.clipboard.writeText(link.href);
    message('学习网址已复制。');
  } catch {
    message('请复制 Safari 地址栏里的学习网址。');
  }
});

$('export').addEventListener('click', () => {
  if (!ready) return;
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const link = element('a');
  link.href = url;
  link.download = 'cet6-progress-' + day(new Date()) + '.json';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
});

$('import').addEventListener('change', async event => {
  const input = event.currentTarget;
  const [file] = input.files;
  input.value = '';
  if (!file) return;
  try {
    if (file.size > 2_000_000) throw new Error('备份文件过大');
    const restored = readBackup(await file.text());
    if (!confirm('从备份恢复 ' + Object.keys(restored.progress.firstSeen).length + ' 个词条？当前学习进度将被替换。')) return;
    save(() => restored, () => {
      active = false;
      render();
      message('学习进度已恢复。');
    }, true);
  } catch {
    message('无法导入此文件。请选择词间导出的有效 JSON 备份。');
  }
});

window.addEventListener('hashchange', () => { stopAudio(); render(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshToday(); });
window.addEventListener('pageshow', refreshToday);
setInterval(refreshToday, 30000);

render();
try {
  store = await openStore();
  load(await store.load());
} catch {
  $('start').textContent = '进度读取失败';
  message('当前进度无法读取。请重开 Safari 普通标签页，或在设置中恢复备份。');
}
render();
