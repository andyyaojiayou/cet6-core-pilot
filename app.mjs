import { words } from './words.mjs?v=13';
import { dailyNew, day, nextReview, ratingDue, status, writingCorrect } from './learning.mjs?v=3';
import { dailyQuote } from './daily-quote.mjs';
import { beginCheck, checkAvailable, createData, current, draft, mergeBackup, modes, move, pending, plan, rate, readBackup, recordCheck,
  reviewSession, sprintBase, setSenseLevel, setWordLevel, undo, waitingForQuota } from './session.mjs?v=12';
import { continueGroup, dailyGroups, groupSession, sessionGroups, startTraining, trainingNames } from './training.mjs?v=1';
import { openStore, StaleProgress } from './storage.mjs?v=13';

const $ = id => document.getElementById(id);
const names = { listening: '听力', reading: '阅读', writing: '写作' };
const pages = ['learn', 'review', 'plan', 'settings'];
const audio = new Audio();
audio.preload = 'none';
let playback = 0, playingButton;
let data = createData(), revision = null, store, ready = false, active = false, reviewing = false;
let selectedWord = '', visibleWords = 50;
let renderedDay = day(new Date());
let writes = Promise.resolve();
const reviewTime = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

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

function save(change, after, { recovery = false, reread = false } = {}) {
  writes = writes.then(async () => {
    if (!store || (!ready && !recovery)) {
      message('请在支持本地存储的 Safari 标签页中打开，或恢复备份。');
      return;
    }
    try {
      const before = data;
      if (reread) {
        const record = await store.load();
        if (record.revision !== revision) load(record);
      }
      const next = change(data);
      if (next !== data) load(await store.save(next, revision));
      after?.(next, data !== before);
    } catch (error) {
      if (error instanceof StaleProgress) {
        load(await store.load());
        active = false;
        reviewing = false;
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
  const upcoming = nextReview(data.progress, words, now);
  $('review-due').textContent = tasks.due.length ? tasks.due.length + ' 张待复习'
    : upcoming ? '下次到期 · ' + reviewTime.format(upcoming) : '完成首次评分后安排复习';
  $('start-review').disabled = !tasks.due.length;
}

function refreshPhase(reread = false) {
  const now = new Date();
  const dateChanged = renderedDay !== day(now);
  if (!ready || (!reread && !dateChanged && reviewSession(data, words, now) === data)) {
    refreshToday();
    if (ready && !active && (!location.hash || location.hash === '#learn')) renderStudy();
    if (ready && !reviewing && location.hash === '#review') renderReview();
    return;
  }
  save(previous => reviewSession(previous, words, new Date()), (_, changed) => {
    if (changed || dateChanged) {
      stopAudio();
      render();
    } else refreshToday();
  }, { reread });
}

function updateCard(item, change, slot, after) {
  save(previous => current(previous, words, slot)?.id === item.id ? draft(previous, change, slot) : previous, after);
}

function taskList(groups, review = false) {
  const list = element('ol', '', 'task-list');
  for (const group of groups) {
    const total = review ? group.due : group.total;
    const done = review ? 0 : group.done;
    const row = element('li', '', 'task-row');
    row.dataset.skill = group.skill;
    const label = element('div', '', 'task-label');
    label.append(element('strong', trainingNames[group.skill]),
      element('span', review ? total + ' 张待复习' : done + ' / ' + total + ' 个', 'muted'));
    row.append(label);
    if (!review && total) row.append(bar(done, total, trainingNames[group.skill] + '完成进度'));
    const caption = review ? '' : !total ? '今天暂无安排' : done === total ? '已完成' : '集中完成这一组';
    if (caption) row.append(element('span', caption, 'muted'));
    list.append(row);
  }
  return list;
}

function renderGroupBreak(study, slot) {
  const session = data[slot];
  if (!session?.groupBreak) return false;
  const next = current(data, words, slot);
  const groups = sessionGroups(session);
  const finished = groups.find(group => group.skill === session.groupBreak);
  const upcoming = groups.find(group => group.skill === next.skill);
  const heading = element('h2', '本组完成', 'group-complete');
  const proceed = button('开始下一组 · ' + trainingNames[next.skill], () => {
    save(previous => continueGroup(previous, slot), () => { render(); window.scrollTo(0, 0); }, { reread: true });
  }, 'primary');
  proceed.id = slot + '-next-group';
  study.replaceChildren(heading,
    element('p', trainingNames[session.groupBreak] + (finished ? ' · ' + finished.done + ' / ' + finished.total : '已完成')),
    element('p', '下一组：' + trainingNames[next.skill] + '，还有 ' + (upcoming.total - upcoming.done) + ' 张。可以休息一下再继续。', 'muted'),
    proceed, button(slot === 'review' ? '返回复习' : '返回首页', () => {
      if (slot === 'review') reviewing = false;
      else active = false;
      render();
    }));
  if (data.undo && Boolean(data.undo.reviewRating) === (slot === 'review')) {
    study.append(button('撤销上次评分', undoLast));
  }
  return true;
}

function renderStudy(slot = 'session') {
  const isReview = slot === 'review';
  const study = $(isReview ? 'review-study' : 'study');
  if (!isReview) $('hero').hidden = active && !!current(data, words);
  if (!ready) return;
  if ((isReview || active) && data[slot] && !data[slot].check && !data[slot].grouped) {
    save(previous => groupSession(previous, slot), render);
    return;
  }
  const item = current(data, words, slot);
  if (!isReview && (!active || !item)) {
    active = false;
    const tasks = pending(data, words, new Date());
    const due = button('复习到期卡' + (tasks.due.length ? ' · ' + tasks.due.length : ''), () => {
      location.hash = 'review';
      beginReview();
    }, item ? '' : 'primary');
    due.id = 'start-due';
    const start = button(item ? (data.session?.check ? '继续阶段抽测' : '继续上次学习') : '开始学习', () => {
      save(previous => startTraining(previous, words, new Date()), () => {
        active = Boolean(current(data, words));
        render();
      }, { reread: true });
    }, 'primary');
    start.id = 'start';
    const empty = !item && tasks.due.length + tasks.new.length + tasks.extra.length === 0;
    start.disabled = empty;
    const detail = item ? (data.session?.groupBreak ? '上一组已完成，可以休息后再开始下一组。' : '回到原来的题型和词卡，保留未提交答案。')
      : empty ? '现在没有待做任务，可稍后检查到期词。'
      : '先复习到期卡，再按题型集中学新词。做完一组，再开始下一组。';
    const primaryActions = element('div', '', 'row');
    if (item || !tasks.due.length) primaryActions.append(start);
    if (tasks.due.length) primaryActions.append(due);
    const groups = dailyGroups(data, words, new Date());
    const total = groups.reduce((sum, group) => sum + group.total, 0);
    study.replaceChildren(element('h2', '每日任务'), element('p', detail));
    if (tasks.due.length) {
      const review = element('div', '', 'task-review');
      review.append(element('h3', '先复习 · ' + tasks.due.length + ' 张'),
        element('p', groups.filter(group => group.due).map(group => trainingNames[group.skill] + ' ' + group.due + ' 张').join(' · '), 'muted'));
      study.append(review);
    }
    study.append(element('h3', '今日新词 · ' + total + ' 个'), taskList(groups), primaryActions);
    if (tasks.extra.length) study.append(element('p', '另有 ' + tasks.extra.length + ' 张已学词的能力补练，按题型并入练习，不重复计入新词。', 'muted'));
    const actions = element('div', '', 'row');
    if (checkAvailable(data, words, new Date())) actions.append(button(data.suspendedCheck ? '继续阶段抽测' : '开始阶段抽测', () => {
      save(previous => beginCheck(previous, words, new Date()), () => {
        active = Boolean(current(data, words));
        render();
      });
    }));
    if (data.undo && !data.undo.reviewRating && !data.session?.check) actions.append(button('撤销上次评分', undoLast));
    if (item) actions.append(button('结束当前任务', () => {
      if (!confirm('结束当前任务？未提交的答案草稿会清空，已保存的学习与复习记录会保留。')) return;
      save(previous => ({ ...previous, session: null }), render);
    }));
    if (actions.childElementCount) study.append(actions);
    return;
  }
  if (!item) return;
  if (renderGroupBreak(study, slot)) return;

  const { word, skill } = item;
  const session = data[slot];
  const answered = session.drafts[item.id] ?? {};
  const scored = session.done.includes(item.id);
  const answeredCard = typeof answered.correct === 'boolean';
  const paused = !isReview && !session.check && waitingForQuota(data, words, item, new Date());
  const header = element('div', '', 'row');
  const groups = sessionGroups(session);
  const group = groups.find(entry => entry.skill === skill);
  header.append(element('span', trainingNames[skill], 'badge'),
    element('span', '本组已完成 ' + group.done + ' / ' + group.total, 'muted'));
  const titles = { listening: '听句子，辨认词义', reading: '看语境，选出词义', writing: '看中文，拼写并写出搭配' };
  const title = element('h2', (session.check ? '抽测 · ' : isReview ? '到期复习 · ' : '') + titles[skill]);
  const body = element('div', '', 'stack');
  const nav = element('div', '', 'row card-nav');
  const previous = button('上一张', () => navigate(-1, slot));
  const next = button('下一张', () => navigate(1, slot));
  const groupIndex = group.ids.indexOf(item.id);
  previous.disabled = groupIndex === 0;
  next.disabled = groupIndex === group.ids.length - 1;
  nav.append(previous, next, button(isReview ? '返回复习' : '返回首页', () => {
    stopAudio();
    if (isReview) reviewing = false;
    else active = false;
    render();
  }));
  if (data.undo && !session.check && Boolean(data.undo.reviewRating) === isReview) nav.append(button('撤销上次评分', undoLast));
  study.replaceChildren(header, title, body, nav);

  if (paused) {
    const review = element('a', '去复习', 'button');
    review.href = '#review';
    body.append(element('p', '今天的新词额度已用完。当前卡与草稿已保留，明天可以继续评分。', 'muted'), review);
  }
  if (answeredCard || scored) {
    showFeedback(item, answered, scored, body, slot, paused);
    return;
  }
  const answer = (correct, revealed = false) => updateCard(item, { correct, revealed }, slot, () => {
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
      input.id = isReview ? 'review-' + id : id;
      input.lang = 'en';
      input.required = true;
      input.maxLength = 180;
      input.autocomplete = 'off';
      input.autocapitalize = 'none';
      input.setAttribute('autocorrect', 'off');
      input.spellcheck = false;
      input.value = answered[id] ?? '';
      input.addEventListener('input', () => updateCard(item, { [id]: input.value }, slot));
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
        if (options.hidden) updateCard(item, { played: true }, slot, () => { options.hidden = false; });
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

function navigate(offset, slot) {
  stopAudio();
  save(previous => {
    const item = current(previous, words, slot);
    const group = sessionGroups(previous[slot]).find(entry => entry.skill === item?.skill);
    const id = group?.ids[group.ids.indexOf(item.id) + offset];
    return id ? move(previous, previous[slot].ids.indexOf(id) - previous[slot].cursor, slot) : previous;
  }, () => { render(); window.scrollTo(0, 0); });
}

function undoLast() {
  stopAudio();
  save(previous => reviewSession(undo(previous), words, new Date()), () => {
    active = Boolean(current(data, words));
    reviewing = location.hash === '#review' && Boolean(current(data, words, 'review'));
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

function senseLevel(item, id, meaning, slot) {
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
    save(previous => !slot || current(previous, words, slot)?.id === item.id
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

function wordSenses(item, slot, showHeading = true) {
  const { word } = item;
  const section = element('section', '', 'word-core stack');
  const caption = element('p', '重点词与义项', 'eyebrow');
  const heading = element('h3', word.id, 'word-head');
  heading.lang = 'en';
  if (showHeading) section.append(caption, heading);
  const primary = { ...word, id: 'main' };
  const firstVerb = [primary, ...(word.senses ?? [])].find(sense => sense.pos.startsWith('v.'));
  for (const sense of [primary, ...(word.senses ?? [])]) {
    const isMain = sense === primary;
    const block = element('section', '', 'word-sense stack');
    block.dataset.sense = sense.id;
    const title = element('h4', sense.meaning);
    title.prepend(element('span', sense.pos, 'badge part-of-speech'));
    const header = element('div', '', 'sense-heading');
    header.append(title, senseLevel(item, sense.id, sense.meaning, slot));
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

function showFeedback(item, { correct, revealed }, scored, body, slot, paused) {
  const { word } = item;
  const box = element('div', '', 'feedback stack');
  const outcome = correct ? '答对了' : revealed ? '已揭晓' : revealed === false ? '答错了' : '待巩固';
  const verdict = element('div', '', 'verdict ' + (correct ? 'right' : revealed ? 'revealed' : 'wrong'));
  verdict.tabIndex = -1;
  const icon = element('span', correct ? '✓' : revealed ? '↪' : '!', 'verdict-icon');
  icon.setAttribute('aria-hidden', 'true');
  const result = element('div');
  const checking = data[slot]?.check;
  const isReview = slot === 'review';
  result.append(element('strong', outcome), element('p', checking ? (scored ? '抽测已记录' : '本题计入阶段抽测。')
    : scored ? '已评分 · 可回看' : paused ? '答案已保留'
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
  box.append(verdict);
  const explanations = [wordSenses(item, slot, !isReview), usage];
  if (word.related?.length) explanations.push(semanticFeedback(word));
  if (isReview) {
    const brief = element('section', '', 'stack');
    const title = element('h3', word.id, 'word-head');
    title.lang = 'en';
    const meaning = element('p', word.meaning);
    meaning.prepend(element('span', word.pos, 'badge part-of-speech'));
    brief.append(title, meaning, mainAudio(word, 'word'));
    box.append(brief);
  } else {
    box.append(...explanations);
  }
  if (!scored && checking) {
    box.append(button('记录抽测答案', () => {
      stopAudio();
      save(previous => current(previous, words)?.id === item.id ? recordCheck(previous, words, new Date()) : previous, render);
    }, 'primary'));
  } else if (!scored && !paused) {
    const grades = [[1, '忘记'], [2, '困难'], [3, '记住'], [4, '熟练']];
    const score = element('section', '', 'score stack');
    const ratings = element('div', '', 'ratings');
    const now = new Date();
    for (const [rating, label] of grades) {
      const control = button(label, () => {
        stopAudio();
        let saved = false;
        save(previous => {
          if (current(previous, words, slot)?.id !== item.id) return previous;
          const next = rate(previous, words, rating, new Date(), slot);
          saved = next !== previous;
          return next;
        }, () => {
          if (saved) {
            const due = new Date(data.progress.cards[item.id].fsrs.due);
            message((!data[slot] ? trainingNames[item.skill] + ' · 本组完成。' : '')
              + item.word.id + ' · 下次复习 ' + reviewTime.format(due));
            render();
            window.scrollTo(0, 0);
          } else message('该卡已评分，或今日新词任务已结束。可返回首页检查到期任务。');
        });
      }, rating === (correct ? 3 : 1) ? 'primary' : '');
      control.disabled = !correct && rating !== 1;
      if (!control.disabled) {
        const minutes = Math.round((ratingDue(data.progress, item, rating, now) - now) / 60_000);
        const interval = minutes < 60 ? minutes + ' 分钟后' : minutes / 1440 + ' 天后';
        control.append(element('small', interval));
      }
      ratings.append(control);
    }
    score.append(element('h3', '按回忆难度评分'), ratings);
    box.append(score);
  }
  if (isReview) {
    const details = element('details', '', 'stack');
    details.append(element('summary', '完整释义与辨析'), ...explanations);
    box.append(details);
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

function beginReview() {
  save(previous => startTraining(previous, words, new Date(), 'review'), () => {
    selectedWord = '';
    reviewing = Boolean(current(data, words, 'review'));
    message('');
    render();
    window.scrollTo(0, 0);
  }, { reread: true });
}

function wordLevel(word) {
  return data.senseLevels?.[word.id + ':overall'] ?? '';
}

function weakWord(word) {
  return ['weak', 'learning'].includes(wordLevel(word)) || status(data.progress, word) === '待巩固'
    || ['main', ...(word.senses ?? []).map(sense => sense.id)].some(id =>
      data.senseLevels?.[word.id + ':' + id] === 'weak');
}

function renderWordList() {
  const filter = document.querySelector('.word-filters [aria-pressed="true"]').dataset.filter;
  const query = $('word-query').value.trim().toLowerCase();
  const entries = words.filter(word => word.id.includes(query) &&
    (filter === 'all' || (filter === 'weak' ? weakWord(word) : Boolean(data.progress.firstSeen[word.id]))));
  const labels = { weak: '不认识', learning: '有点生', strong: '熟悉' };
  $('word-list').replaceChildren(...entries.slice(0, visibleWords).map(word => {
    const row = element('li');
    const control = button('', () => {
      stopAudio();
      selectedWord = word.id;
      renderReview();
      $('review-word-title').focus();
      window.scrollTo(0, 0);
    }, 'word-row');
    const term = element('strong', word.id);
    term.lang = 'en';
    const progress = status(data.progress, word);
    const mark = wordLevel(word);
    const caption = mark === 'strong' && progress === '待巩固' ? progress : (labels[mark] ?? progress);
    control.append(term, element('span', caption + ' ›', 'muted'));
    row.append(control);
    return row;
  }));
  $('word-list-empty').hidden = entries.length > 0;
  $('word-list-empty').textContent = query ? '没有找到匹配的词。'
    : filter === 'weak' ? '这里会收集你标记为不熟和回忆失败的词。'
    : '评分后，学过的词会出现在这里。也可以切换到「全部」。';
  $('more-words').hidden = visibleWords >= entries.length;
}

function renderReview() {
  if (reviewing && !current(data, words, 'review')) reviewing = false;
  const word = words.find(entry => entry.id === selectedWord);
  $('review-summary').hidden = reviewing || Boolean(word);
  $('review-study').hidden = !reviewing;
  $('word-browser').hidden = reviewing || Boolean(word);
  $('review-word').hidden = !word || reviewing;
  $('review-undo').hidden = !data.undo?.reviewRating;
  $('start-review').textContent = data.review ? '继续到期复习' : '复习到期卡';
  $('review-groups').replaceChildren(taskList(dailyGroups(data, words, new Date()), true));
  if (reviewing) {
    renderStudy('review');
    return;
  }
  if (!word) {
    renderWordList();
    return;
  }
  const back = button('‹ 返回词表', () => {
    stopAudio();
    const previousWord = selectedWord;
    selectedWord = '';
    renderReview();
    const row = [...$('word-list').querySelectorAll('button')].find(control => control.firstChild.textContent === previousWord);
    (row ?? $('word-query')).focus();
  });
  const title = element('h2', word.id, 'word-head');
  title.id = 'review-word-title';
  title.lang = 'en';
  title.tabIndex = -1;
  const level = element('label', '整词熟悉度', 'field');
  const select = element('select');
  for (const [value, text] of [['', '未标记'], ['weak', '不认识'], ['learning', '有点生'], ['strong', '熟悉']]) {
    const option = element('option', text);
    option.value = value;
    select.append(option);
  }
  select.value = wordLevel(word);
  select.addEventListener('change', () => {
    const value = select.value;
    select.value = wordLevel(word);
    save(previous => setWordLevel(previous, word, value), () => { select.value = wordLevel(word); });
  });
  level.append(select);
  const audioRow = element('div', '', 'main-audio');
  audioRow.append(mainAudio(word, 'word', { className: 'primary' }), mainAudio(word, 'sentence'));
  const example = element('section', '', 'explanation stack');
  const source = element('details', '', 'semantic-hint');
  source.append(element('summary', '语境解释与出处'), element('p', word.context));
  usageEvidence(source, word.evidence ?? (word.source ? [word.source] : []));
  example.append(exampleSentence(word), element('p', word.translation, 'muted'), audioRow, exampleSource(word), source);
  const panel = $('review-word');
  const due = Math.min(...word.skills.flatMap(skill => {
    const at = data.progress.cards[word.id + ':' + skill]?.fsrs.due;
    return at ? [Date.parse(at)] : [];
  }));
  const schedule = Number.isFinite(due) ? (due <= Date.now() ? '已到期 · 去做主动回忆'
    : '下次到期 · ' + reviewTime.format(due)) : '首次主动回忆评分后安排复习';
  panel.replaceChildren(back, title, element('p', schedule, 'muted'), level,
    element('p', '标记用于筛选待巩固词。到期时间按主动回忆的评分计算。', 'muted'),
    wordSenses({ word }, undefined, false), example);
  if (word.related?.length) {
    const related = element('details');
    related.append(element('summary', '关联词辨析'), semanticFeedback(word));
    panel.append(related);
  }
}

function renderPlan() {
  const now = new Date();
  const stats = plan(data, words, now);
  const target = data.prefs.target;
  $('goal-stats').replaceChildren(
    element('p', '已掌握 ' + stats.mastered + ' / ' + target + ' 词 · 待巩固 ' + stats.weak),
    element('p', '已掌握需跨日到期复测通过。', 'muted'));
  const sprint = stats.sprint;
  const tasks = pending(data, words, now);
  const action = element('a', tasks.due.length ? '去复习' : '继续学习', 'button primary plan-actions');
  action.href = tasks.due.length ? '#review' : '#learn';
  const sprintRows = [
    element('p', '首轮已学 ' + sprint.learned + ' / ' + sprint.target + ' 词', 'plan-count'),
    bar(sprint.learned, sprint.target, '首轮回忆进度'),
    element('p', '当前到期 ' + tasks.due.length + ' 张 · 今日新词还剩 ' + tasks.new.length + ' 个'),
    taskList(dailyGroups(data, words, now)),
    element('p', '11 月 26 日首轮截止 · 11 月 27–30 日集中复习', 'muted'),
  ];
  if (sprint.shortfall && sprint.remainingDays > 0) {
    sprintRows.push(element('p', '按每日 50 个上限，首轮仍差 ' + sprint.shortfall + ' 词。', 'muted'));
  }
  $('sprint-stats').replaceChildren(...sprintRows, action);
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
}

function renderSettings() {
  for (const key of ['accent', 'speed', 'reminder', 'target']) $(key).value = data.prefs[key];
  $('sprintBase').value = sprintBase(data);
  $('reminder-help').textContent = '网页保存的提醒时间是 ' + data.prefs.reminder + '。请在 iPhone 提醒事项里设为同一时间。';
}

function render() {
  renderedDay = day(new Date());
  const page = pages.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'learn';
  for (const name of pages) $(name + '-page').hidden = page !== name;
  for (const tab of document.querySelectorAll('.tabs a')) {
    if (tab.hash === '#' + page) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  }
  refreshToday();
  if (page === 'learn') {
    renderStudy();
    return;
  }
  if (!ready) return;
  if (page === 'plan') renderPlan();
  else if (page === 'review') renderReview();
  else renderSettings();
}

$('start-review').addEventListener('click', beginReview);
$('review-undo').addEventListener('click', undoLast);
$('word-query').addEventListener('input', () => {
  visibleWords = 50;
  renderWordList();
});
for (const filter of document.querySelectorAll('.word-filters button')) {
  filter.addEventListener('click', () => {
    for (const option of document.querySelectorAll('.word-filters button')) {
      option.setAttribute('aria-pressed', String(option === filter));
    }
    visibleWords = 50;
    renderWordList();
  });
}
$('more-words').addEventListener('click', () => { visibleWords += 50; renderWordList(); });

for (const key of ['accent', 'speed', 'sprintBase', 'target', 'reminder']) {
  $(key).addEventListener('change', event => {
    const input = event.currentTarget;
    if (!input.value || !input.checkValidity()) {
      renderSettings();
      return;
    }
    const value = input.type === 'number' ? input.valueAsNumber : input.value;
    save(previous => {
      const next = { ...previous, prefs: { ...previous.prefs, [key]: value } };
      return key === 'sprintBase' ? reviewSession(next, words, new Date()) : next;
    }, renderSettings);
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
    }, { recovery: !combine });
  } catch {
    message('无法导入此文件。请选择词间导出的有效 JSON 备份。');
  }
}

$('import').addEventListener('change', event => importProgress(event, false));
$('merge').addEventListener('change', event => importProgress(event, true));

window.addEventListener('hashchange', () => { stopAudio(); render(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAudio();
  else refreshPhase(true);
});
window.addEventListener('pagehide', stopAudio);
window.addEventListener('pageshow', () => refreshPhase(true));
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
