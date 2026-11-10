import { words } from './words.mjs?v=10';
import { dailyNew, day, status, writingCorrect } from './learning.mjs?v=2';
import { dailyQuote } from './daily-quote.mjs';
import { beginCheck, checkAvailable, createData, current, draft, mergeBackup, modes, move, pending, plan, rate, readBackup, recordCheck,
  reviewSession, sprintBase, reviewStart, setSenseLevel, startSession, targetDate, undo } from './session.mjs?v=8';
import { openStore, StaleProgress } from './storage.mjs?v=9';

const $ = id => document.getElementById(id);
const names = { listening: '听力', reading: '阅读', writing: '写作' };
const study = $('study');
const pages = ['learn', 'plan', 'settings'];
const audio = new Audio();
audio.preload = 'none';
let playback = 0, playingButton;
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
  playingButton?.removeAttribute('data-playing');
  playingButton = null;
}

audio.addEventListener('ended', () => { if (audio.ended) stopAudio(); });

function playAudio(control, stem, fallback) {
  stopAudio();
  const token = playback;
  const accent = data.prefs.accent;
  const clip = new URL('./audio/' + accent + '/' + stem + '.mp3', import.meta.url);
  clip.search = new URL(import.meta.url).search;
  const source = clip.href;
  if (audio.src !== source) audio.src = source;
  else if (audio.readyState > 0) audio.currentTime = 0;
  else audio.load();
  const rate = data.prefs.speed === 'slow' ? 0.78 : 1;
  audio.playbackRate = rate;
  playingButton = control;
  control.dataset.playing = '';
  audio.play().catch(() => {
    if (token !== playback) return;
    if (!fallback || !window.speechSynthesis) {
      stopAudio();
      message('这段音频暂时无法播放，请检查网络和媒体音量后再点一次。');
      return;
    }
    const speech = new SpeechSynthesisUtterance(fallback);
    speech.lang = accent;
    speech.rate = rate;
    speech.voice = speechSynthesis.getVoices().find(voice => voice.lang === accent && voice.localService) ?? null;
    speech.onend = () => { if (token === playback) stopAudio(); };
    speech.onerror = () => {
      if (token !== playback) return;
      stopAudio();
      message('设备朗读未能播放，请再点一次。');
    };
    speechSynthesis.speak(speech);
    message('正在使用设备备用语音。');
  });
}

function audioButton(label, stem, fallback, { name, className, onPlay } = {}) {
  const control = button('▶ ' + label, () => {
    playAudio(control, stem, fallback);
    onPlay?.();
  }, className ?? 'audio-button');
  if (name) control.setAttribute('aria-label', name);
  return control;
}

function mainAudio(word, kind, options) {
  if (kind === 'word') return audioButton('单词', word.audioWord ?? word.id + '-word',
    word.audioWord || word.senses?.some(sense => sense.ipa) ? null : word.id, options);
  return audioButton('例句', word.audioSentence ?? word.id + '-sentence',
    word.audioSentence ? null : word.sentence, options);
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

function refreshPhase() {
  if (!ready || reviewSession(data, words, new Date()) === data) {
    refreshToday();
    return;
  }
  save(previous => reviewSession(previous, words, new Date()), () => {
    stopAudio();
    render();
  });
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
    const start = button(item ? (data.session?.check ? '继续阶段抽测' : '继续上次学习') : '开始学习', () => {
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
    if (checkAvailable(data, words, new Date())) actions.append(button('开始阶段抽测', () => {
      save(previous => beginCheck(previous, words, new Date()), () => {
        active = Boolean(current(data, words));
        render();
      });
    }));
    if (data.undo && !data.session?.check) actions.append(button('撤销上次评分', undoLast));
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
  const title = element('h2', (session.check ? '抽测 · ' : '') + titles[skill]);
  const body = element('div', '', 'stack');
  const nav = element('div', '', 'row card-nav');
  const previous = button('上一张', () => navigate(-1));
  const next = button('下一张', () => navigate(1));
  previous.disabled = session.cursor === 0;
  next.disabled = session.cursor === session.ids.length - 1;
  nav.append(previous, next, button('返回首页', () => { stopAudio(); active = false; render(); }));
  if (data.undo && !session.check) nav.append(button('撤销上次评分', undoLast));
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
      body.append(mainAudio(word, 'sentence', { className: 'primary', onPlay: () => {
        if (options.hidden) updateCard(item, { played: true }, () => { options.hidden = false; });
      } }));
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
  save(previous => reviewSession(undo(previous), words, new Date()), () => {
    active = Boolean(current(data, words));
    render();
    message('已撤销上次评分，复习时间和进度已恢复。');
  });
}

function ipaLabel(ipa, ipaUS) {
  return element('span', ipaUS && ipaUS !== ipa ? '英 ' + ipa + ' · 美 ' + ipaUS : ipa, 'ipa');
}

function evidenceLink(source, label) {
  const link = element('a', label + ' · ' + source.label, 'source-link');
  link.href = source.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

function exampleSource(entry) {
  return entry.exampleType === 'adapted'
    ? evidenceLink(entry.exampleSource, '真题语境改写')
    : element('span', '原创教学例句', 'example-origin');
}

function senseLevel(item, id, meaning) {
  const control = element('select', '', 'sense-level');
  control.setAttribute('aria-label', meaning + '的掌握度');
  for (const [value, text] of [['', '掌握度'], ['weak', '薄弱'], ['learning', '练习中'], ['strong', '熟悉']]) {
    const option = element('option', text);
    option.value = value;
    control.append(option);
  }
  const key = item.word.id + ':' + id;
  const getLevel = () => data.senseLevels?.[key] ?? '';
  control.value = getLevel();
  control.addEventListener('change', () => {
    const level = control.value;
    control.value = getLevel();
    save(previous => current(previous, words)?.id === item.id
      ? setSenseLevel(previous, item, id, level) : previous, () => { control.value = getLevel(); });
  });
  return control;
}

function usageEvidence(container, sources) {
  for (const source of sources) {
    const label = source.kind === 'reference' ? '参考范文'
      : source.kind === 'prompt' ? '真题作文题面'
        : source.kind === 'transcript' ? '真题听力文字稿' : '真题阅读正文';
    const link = evidenceLink(source, label);
    const form = element('strong', source.form);
    form.lang = 'en';
    const row = element('p');
    row.append(form, document.createTextNode(' · '), link);
    container.append(row);
  }
}

function wordSenses(item) {
  const { word } = item;
  const section = element('section', '', 'word-core stack');
  const caption = element('p', '重点词与义项', 'eyebrow');
  const heading = element('h3', word.id, 'word-head');
  heading.lang = 'en';
  section.append(caption, heading);
  const primary = { ...word, id: 'main' };
  const firstVerb = [primary, ...(word.senses ?? [])].find(sense => sense.pos.startsWith('v.'));
  for (const sense of [primary, ...(word.senses ?? [])]) {
    const isMain = sense === primary;
    const block = element('section', '', 'word-sense stack');
    block.dataset.sense = sense.id;
    const title = element('h4', sense.meaning);
    title.prepend(element('span', sense.pos, 'badge part-of-speech'));
    const header = element('div', '', 'sense-heading');
    header.append(title, senseLevel(item, sense.id, sense.meaning));
    block.append(header);
    const evidence = sense.evidence ?? (isMain && word.source?.kind !== 'reference' && word.source ? [word.source] : []);
    const statusLabel = evidence.length ? sense.evidenceLabel ?? '真题有据' : '教学补充';
    if (isMain || sense.ipa || sense.pos !== word.pos) {
      block.append(sense.ipa ? ipaLabel(sense.ipa, sense.ipaUS) : ipaLabel(word.ipa, word.ipaUS));
    }
    const pattern = element('p', sense.collocation, 'collocation');
    pattern.lang = 'en';
    const meta = element('div', '', 'sense-meta');
    meta.append(pattern, element('span', statusLabel,
      evidence.length && !sense.evidenceLabel ? 'sense-evidence verified' : 'sense-evidence'));
    block.append(meta);
    if (sense === firstVerb && word.past) {
      const forms = element('p', '', 'verb-forms');
      const past = element('strong', word.past);
      const participle = element('strong', word.participle);
      past.lang = participle.lang = 'en';
      forms.append('过去式 ', past, ' · 过去分词 ', participle);
      block.append(forms);
    }
    if (!isMain) {
      const example = element('p', sense.example, 'semantic-example');
      example.lang = 'en';
      const controls = element('div', '', 'row compact-audio');
      if (sense.ipa) controls.append(audioButton('单词', word.id + '-' + sense.id + '-word', null,
        { name: '朗读 ' + word.id + ' ' + sense.pos }));
      controls.append(audioButton('例句', word.id + '-' + sense.id + '-sentence', sense.example,
        { name: '朗读例句 ' + sense.meaning }));
      const details = element('details', '', 'semantic-hint');
      details.append(element('summary', '识别依据' + (evidence.length ? '与出处' : '')), element('p', sense.context));
      usageEvidence(details, evidence);
      block.append(example, element('p', sense.translation, 'muted'), controls, exampleSource(sense), details);
    }
    section.append(block);
  }
  return section;
}

function semanticFeedback(word) {
  const section = element('section', '', 'semantic-feedback stack');
  const choices = element('div', '', 'semantic-choices');
  choices.setAttribute('role', 'group');
  choices.setAttribute('aria-label', '选择要对比的表达');
  const comparison = element('div', '', 'semantic-comparison stack');
  comparison.setAttribute('aria-live', 'polite');
  const controls = [];
  function select(related, selected, stem) {
    stopAudio();
    for (const choice of controls) choice.setAttribute('aria-pressed', String(choice === selected));
    const sense = word.senses?.find(entry => entry.id === related.senseId) ?? word;
    const context = element('p', sense.pos + ' ' + sense.meaning, 'muted');
    const title = element('h4', word.id + ' / ' + related.term);
    title.lang = 'en';
    const example = element('p', related.example, 'semantic-example');
    example.lang = 'en';
    comparison.replaceChildren(context, title, element('p', related.comparison), example,
      element('p', related.translation, 'muted'),
      audioButton('例句', stem + '-sentence', related.example, { name: '朗读 ' + related.term + ' 对比例句' }),
      exampleSource(related));
  }

  for (const related of word.related) {
    const stem = word.id + '-' + related.term.toLowerCase().replace(/[^a-z]+/g, '-') + '-related';
    const row = element('div', '', 'semantic-option');
    const choice = button('', () => select(related, choice, stem), 'semantic-choice');
    const term = element('strong', related.term);
    term.lang = 'en';
    choice.append(element('span', related.kind, 'semantic-kind'), term, ipaLabel(related.ipa, related.ipaUS),
      element('span', related.meaning, 'muted'));
    const ambiguous = ['overestimate', 'increase', 'interrupt'].includes(related.term);
    const play = audioButton('', stem + '-word', ambiguous ? null : related.term,
      { name: '朗读 ' + related.term, className: 'semantic-play' });
    play.textContent = '▶';
    row.append(choice, play);
    controls.push(choice);
    choices.append(row);
  }
  controls[0]?.click();
  section.append(element('h3', '关联词辨析'), choices, comparison);
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
  const checking = data.session?.check;
  result.append(element('strong', outcome), element('p', checking ? (scored ? '抽测已记录' : '本题计入阶段抽测。')
    : scored ? '已评分 · 可回看'
    : correct ? '请按实际回忆难度评分。' : '看完解析后可记录为忘记。'));
  verdict.append(icon, result);
  const usage = element('section', '', 'explanation stack');
  const collocation = element('p', word.collocation, 'collocation');
  collocation.lang = 'en';
  const audioRow = element('div', '', 'main-audio');
  audioRow.append(mainAudio(word, 'word', { className: 'primary' }), mainAudio(word, 'sentence'));
  const details = element('details', '', 'semantic-hint');
  details.append(element('summary', '记忆提示与出处'), element('p', word.hint));
  usageEvidence(details, word.evidence ?? (word.source ? [word.source] : []));
  if (word.source?.kind === 'reference' && word.evidence?.length) usageEvidence(details, [word.source]);
  if (!word.source && !word.evidence?.length) details.append(element('p', '选词依据 · 教学推荐'));
  usage.append(element('h3', '语境与搭配'), collocation, exampleSentence(word),
    element('p', word.translation, 'muted'), audioRow, exampleSource(word),
    element('h4', '为什么是这个义项'), element('p', word.context), details);
  box.append(verdict, wordSenses(item), usage);
  if (word.related?.length) box.append(semanticFeedback(word));
  if (!scored && checking) {
    box.append(button('记录抽测答案', () => {
      stopAudio();
      save(previous => current(previous, words)?.id === item.id ? recordCheck(previous, words, new Date()) : previous, render);
    }, 'primary'));
  } else if (!scored) {
    const grades = [[1, '忘记'], [2, '困难'], [3, '记住'], [4, '熟练']];
    const score = element('section', '', 'score stack');
    const ratings = element('div', '', 'ratings');
    for (const [rating, label] of grades) {
      const control = button(label, () => {
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
      }, rating === (correct ? 3 : 1) ? 'primary' : '');
      control.disabled = !correct && rating !== 1;
      ratings.append(control);
    }
    score.append(element('h3', 'FSRS 记忆评分'), ratings);
    box.append(score);
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
  const sprint = stats.sprint;
  const unopened = Math.max(0, sprint.target - sprint.open);
  const remainingToday = pending(data, words, now).new.length;
  const paceText = sprint.remainingDays > 0
    ? '今天还可学 ' + remainingToday + ' 个新词 · 先完成到期复习 · 剩余 ' + sprint.remainingDays + ' 个新词日'
    : '进入集中复习 · 按 FSRS 做到期卡';
  const sprintRows = [
    element('h2', '首轮冲刺'),
    element('p', '已完成 ' + sprint.learned + ' / ' + sprint.target + ' 词 · 当前开放 ' + sprint.open + ' 词'),
    bar(sprint.learned, sprint.target, '首轮回忆进度'),
    element('p', paceText),
  ];
  if (unopened) sprintRows.push(element('p', '还有 ' + unopened + ' 个计划词条待开放。', 'muted'));
  if (sprint.shortfall && sprint.remainingDays > 0) {
    sprintRows.push(element('p', '按每日 50 个上限，首轮仍差 ' + sprint.shortfall + ' 词。', 'muted'));
  }
  $('sprint-stats').replaceChildren(...sprintRows);
  const reviewDays = ['2026-11-27', '2026-11-28', '2026-11-29', targetDate];
  const stageData = [
    ['G1 · 15 词试学', words.filter(w => !w.tier), 15],
    ['G2 · 150 词阶段', words.slice(0, 150), 150],
    ['G3 · 300 词阶段', words.slice(0, 300), 300],
    ['G4 · 完整冲刺词库', words, sprint.target],
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
  const formatResult = ({ correct, total }) => total === 0 ? '暂无样本'
    : correct + ' / ' + total + ' · ' + Math.round(100 * correct / total) + '%' + (total < 5 ? ' · 样本较少' : '');
  $('recall-results').replaceChildren(
    element('p', '跨日到期回忆 ' + formatResult(stats.retention)),
    ...modes.map(skill => element('p', names[skill] + '抽测 ' + formatResult(stats.checks[skill]))),
    element('p', '11 月 27–30 日先完成到期复习，再按听读写抽测已学词。抽测结果单独记录。', 'muted'),
  );
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
  for (const key of ['accent', 'speed', 'reminder', 'target']) $(key).value = data.prefs[key];
  $('sprintBase').value = sprintBase(data);
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

for (const key of ['accent', 'speed', 'sprintBase', 'target', 'reminder']) {
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

async function importProgress(event, combine) {
  const input = event.currentTarget;
  const [file] = input.files;
  input.value = '';
  if (!file) return;
  try {
    if (file.size > 2_000_000) throw new Error('备份文件过大');
    const restored = readBackup(await file.text());
    const count = Object.keys(restored.progress.firstSeen).length;
    const prompt = combine ? '合并备份中的 ' + count + ' 个词条？同一训练卡采用较新的排程。'
      : '从备份恢复 ' + count + ' 个词条？当前学习进度将被替换。';
    if (!confirm(prompt)) return;
    save(previous => reviewSession(combine ? mergeBackup(previous, restored) : restored, words, new Date()), () => {
      active = false;
      render();
      message(combine ? '学习进度已合并。' : '学习进度已恢复。');
    }, !combine);
  } catch {
    message('无法导入此文件。请选择词间导出的有效 JSON 备份。');
  }
}

$('import').addEventListener('change', event => importProgress(event, false));
$('merge').addEventListener('change', event => importProgress(event, true));

window.addEventListener('hashchange', () => { stopAudio(); render(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAudio();
  else refreshPhase();
});
window.addEventListener('pagehide', stopAudio);
window.addEventListener('pageshow', refreshPhase);
setInterval(refreshPhase, 30000);

const release = document.documentElement.dataset.release;
const preview = release !== 'production';
$('preview-notice').hidden = !preview;
if (release === 'g2-preview') $('release-badge').textContent = 'G2 预览 · ' + words.length + ' 词';
else if (preview) $('release-badge').textContent = 'G1 V5 · 预览';
render();
try {
  store = await openStore(release);
  load(await store.load());
  await save(previous => reviewSession(previous, words, new Date()));
} catch {
  $('start').textContent = '进度读取失败';
  message('当前进度无法读取。请重开 Safari 普通标签页，或在设置中恢复备份。');
}
render();
