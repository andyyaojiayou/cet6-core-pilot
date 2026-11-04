import { words } from './words.mjs';
import { dailyNew, day, empty, grade, parseBackup, queue, status, writingCorrect } from './learning.mjs';

const $ = id => document.getElementById(id);
const names = { listening: '听力', reading: '阅读', writing: '写作' };
const storageKey = 'cet6-core-progress-v1';
const deadline = '2026-11-27';
const dailyLimit = 30;
const study = $('study');
let state = empty();
let item;
let blocked = false;

function message(value) {
  $('notice').textContent = value;
  $('notice').hidden = !value;
}

try {
  const saved = localStorage.getItem(storageKey);
  if (saved) state = parseBackup(saved);
} catch {
  blocked = true;
  message('当前进度无法读取。请使用普通浏览窗口，或从备份恢复。');
}

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function button(text, action, className) {
  const node = element('button', text, className);
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}

function refresh(now = new Date()) {
  const tasks = queue(state, words, now);
  $('due').textContent = tasks.due.length;
  $('fresh').textContent = dailyNew(state, now);
  $('mastered').textContent = words.filter(word => status(state, word) === '已掌握').length;
  const statuses = ['已学习', '已掌握', '待巩固'];
  $('breakdown').textContent = statuses.map(label =>
    `${label} ${words.filter(word => status(state, word) === label).length}`
  ).join(' · ');
  $('progress').replaceChildren(...words.map((word, i) => {
    const row = element('li');
    const label = status(state, word);
    row.append(element('strong', label === '未学习' ? `词条 ${i + 1}` : word.id),
      element('span', word.skills.map(skill => `${names[skill]} · ${status(state, word, skill)}`).join(' / '), 'muted'));
    return row;
  }));
  return tasks;
}

function speak(text) {
  if (!('speechSynthesis' in window)) {
    message('当前浏览器不支持朗读，请在 iPhone Safari 中打开。');
    return;
  }
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-GB';
  utterance.rate = 0.86;
  utterance.onerror = event => {
    if (!['canceled', 'interrupted'].includes(event.error)) message('设备暂时无法朗读。请检查音量和英文语音，再试一次。');
  };
  speechSynthesis.speak(utterance);
}

function save(next) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(next));
    state = next;
    blocked = false;
    return true;
  } catch {
    message('浏览器未能保存进度。请检查存储空间或改用普通浏览窗口后重试。');
    return false;
  }
}

function nextTask() {
  if (blocked) {
    message('请先恢复备份，或在可保存进度的浏览器中打开。');
    return;
  }
  const now = new Date();
  const tasks = refresh(now);
  const canAdd = day(now) < deadline && dailyNew(state, now) < dailyLimit;
  item = tasks.due[0] ?? (canAdd ? (tasks.extra[0] ?? tasks.new[0]) : undefined);
  if (!item) {
    const detail = tasks.new.length && !canAdd
      ? '新词任务已停止或达到当天上限。稍后可继续到期复习。'
      : '当前没有到期卡或可学的新词。下次复习时间已保存在浏览器。';
    study.replaceChildren(element('h2', '这一轮完成了'), element('p', detail),
      button('检查到期复习', nextTask, 'primary'));
    return;
  }
  const { word, skill } = item;
  const header = element('div', '', 'row');
  header.append(element('span', names[skill], 'badge'), element('span', word.theme, 'badge'),
    element('span', tasks.due.length ? '到期复习' : '主动回忆', 'muted'));
  const title = element('h2', { listening: '听句子，辨认词义', reading: '看语境，选出词义', writing: '看中文，拼写并写出搭配' }[skill]);
  title.tabIndex = -1;
  const body = element('div', '', 'stack');
  study.replaceChildren(header, title, body);

  if (skill === 'writing') {
    const form = element('form', '', 'stack');
    const inputs = [word.cue, word.phraseCue].map((cue, index) => {
      const label = element('label', '', 'field');
      label.append(element('span', cue));
      const input = element('input');
      input.type = 'text';
      input.id = index ? 'phrase' : 'spelling';
      input.lang = 'en';
      input.required = true;
      input.autocomplete = 'off';
      input.autocapitalize = 'none';
      input.setAttribute('autocorrect', 'off');
      input.spellcheck = false;
      label.append(input);
      form.append(label);
      return input;
    });
    const submit = element('button', '提交拼写与搭配', 'primary');
    submit.type = 'submit';
    form.append(submit);
    form.addEventListener('submit', event => {
      event.preventDefault();
      feedback(writingCorrect(word, inputs[0].value, inputs[1].value), body);
    });
    body.append(form);
  } else {
    const options = element('div', '', 'options');
    if (skill === 'listening') {
      body.append(button('▶ 播放英文句子', () => {
        speak(word.sentence);
        options.hidden = false;
      }, 'primary'));
      options.hidden = true;
    } else {
      const sentence = element('p');
      sentence.lang = 'en';
      const pattern = new RegExp(`\\b${word.id}(?:s|d|ed)?\\b`, 'i');
      const match = word.sentence.match(pattern);
      if (match) {
        sentence.append(word.sentence.slice(0, match.index), element('strong', match[0]),
          word.sentence.slice(match.index + match[0].length));
      } else sentence.textContent = word.sentence;
      body.append(sentence);
    }
    const choices = [...word.distractors];
    choices.splice(Math.floor(Math.random() * 4), 0, word.meaning);
    options.append(...choices.map(value => button(value, () => feedback(value === word.meaning, body))));
    body.append(options);
  }
  body.append(button('想不起来', () => feedback(false, body)));
  title.focus({ preventScroll: true });
}

function feedback(correct, body) {
  const { word } = item;
  for (const control of body.querySelectorAll('button, input')) control.disabled = true;
  const box = element('div', '', 'feedback stack');
  const verdict = element('p', correct ? '答对了。按回忆难度评分。' : '这次需要巩固。看完解析，记录为忘记。',
    correct ? 'verdict' : 'verdict wrong');
  verdict.tabIndex = -1;
  const head = element('h2', `${word.id} ${word.ipa}`);
  head.lang = 'en';
  const example = element('p', word.sentence);
  example.lang = 'en';
  box.append(verdict, head, element('p', word.meaning),
    button('▶ 播放例句', () => speak(word.sentence)),
    element('p', `搭配 · ${word.collocation}`), example,
    element('p', word.translation, 'muted'), element('p', word.hint));
  if (word.source) {
    const link = element('a', word.source.label);
    link.href = word.source.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    box.append(link);
  } else {
    box.append(element('p', '经验推荐 · 暂无已核验的真题位置', 'muted'));
  }
  const grades = correct ? [[1, '忘记 / 猜对'], [2, '困难'], [3, '记得'], [4, '轻松']] : [[1, '记录为忘记']];
  const controls = element('div', '', 'ratings');
  for (const [rating, label] of grades) {
    controls.append(button(label, () => {
      if (save(grade(state, item, rating))) {
        message('');
        nextTask();
      }
    }, rating === 3 || !correct ? 'primary' : ''));
  }
  box.append(controls);
  body.append(box);
  verdict.focus();
}

$('start').addEventListener('click', nextTask);
$('export').addEventListener('click', () => {
  if (blocked) return;
  const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
  const link = element('a');
  link.href = url;
  link.download = `cet6-progress-${day(new Date())}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
});
$('import').addEventListener('change', async event => {
  const input = event.currentTarget;
  const [file] = input.files;
  input.value = '';
  if (!file) return;
  try {
    if (file.size > 2_000_000) throw new Error('备份文件过大');
    const data = parseBackup(await file.text());
    if (!confirm(`从备份恢复 ${Object.keys(data.firstSeen).length} 个词条？当前浏览器中的学习进度将被替换。`)) return;
    if (save(data)) {
      message('学习进度已恢复。');
      nextTask();
    }
  } catch {
    message('无法导入此文件。请选择本工具导出的有效 JSON 备份。');
  }
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) refresh();
});
setInterval(() => refresh(), 30000);
refresh();
