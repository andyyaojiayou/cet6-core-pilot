const nju = 'https://eol.nju.edu.cn/cet6/papers/202606-1.html';
const lazy = 'https://english-exam.lazynote.cn/cet6/sections/listening/2025-12-1/';
const reading = { label: '2026 年 6 月第 1 套 · 仔细阅读正文', url: nju };
const prompt = { label: '2026 年 6 月第 1 套 · 作文题面', url: nju };
const listening = { label: '2025 年 12 月第 1 套 · 长对话 1 文字稿', url: lazy };

export const words = [
  {
    id: 'undergo', skills: ['listening'], theme: '职场与变化', ipa: '/ˌʌndəˈɡəʊ/',
    meaning: '经历、接受（变化、治疗等）', collocation: 'undergo a major change',
    sentence: 'The company will undergo a major change this year.', translation: '公司今年将经历一次重大变革。',
    hint: '常接 change、training 或 surgery。过去式是 underwent。',
    distractors: ['发起一项调查', '提出一个建议', '完成一项任务'], source: listening,
  },
  {
    id: 'correlate', skills: ['reading'], theme: '研究与数据', ipa: '/ˈkɒrəleɪt/',
    meaning: '与……相关', collocation: 'correlate with',
    sentence: 'Sleep quality often correlates with stress levels.', translation: '睡眠质量往往与压力水平相关。',
    hint: '阅读里常替换成 be associated with。留意相关和因果的区别。',
    distractors: ['直接导致', '完全取决于', '与……相矛盾'], source: reading,
  },
  {
    id: 'cultivate', skills: ['writing'], theme: '教育与成长', ipa: '/ˈkʌltɪveɪt/',
    meaning: '培养（习惯、技能、信心）', collocation: 'cultivate a habit',
    sentence: 'Reading a little each day can help you cultivate a habit of learning.', translation: '每天读一点可以帮你培养持续学习的习惯。',
    hint: '从「耕种」联想到长期培养。作文可搭配 confidence 或 curiosity。',
    cue: '培养（习惯、技能或信心）', phraseCue: '培养一种习惯', accept: ['cultivate a habit', 'cultivate the habit'], source: prompt,
  },
  {
    id: 'articulate', skills: ['listening'], theme: '职场与沟通', ipa: '/ɑːˈtɪkjələt/',
    meaning: '善于清楚表达的', collocation: 'an articulate speaker',
    sentence: 'She is an articulate speaker who can explain complex ideas clearly.', translation: '她善于表达，能把复杂的想法讲清楚。',
    hint: '这里是形容词，结尾读 /lət/。动词「清楚表达」的结尾读 /leɪt/。',
    distractors: ['善于组织活动的', '格外谨慎的', '缺乏耐心的'], source: listening,
  },
  {
    id: 'disrupt', skills: ['reading'], theme: '健康与科技', ipa: '/dɪsˈrʌpt/',
    meaning: '打乱、干扰正常过程', collocation: 'disrupt sleep',
    sentence: 'Late-night notifications can disrupt your sleep.', translation: '深夜的通知会扰乱睡眠。',
    hint: '可用 interfere with 表达相近意思。注意 disrupted sleep 指受到干扰的睡眠。',
    distractors: ['逐步改善', '如期恢复', '刻意延长'], source: reading,
  },
  {
    id: 'globalization', skills: ['writing'], theme: '文化与社会', ipa: '/ˌɡləʊbəlaɪˈzeɪʃən/',
    meaning: '全球化', collocation: 'the impact of globalization',
    sentence: 'The impact of globalization can be seen in everyday life.', translation: '日常生活中处处可见全球化的影响。',
    hint: '先记 global，再记 globalization。练习统一采用 z 拼法。',
    cue: '全球化（用 z 拼法）', phraseCue: '全球化的影响', accept: ['the impact of globalization', 'impact of globalization', 'the effects of globalization', 'effects of globalization'], source: prompt,
  },
  {
    id: 'enact', skills: ['listening'], theme: '社会与政策', ipa: '/ɪˈnækt/',
    meaning: '颁布、制定（法律等）', collocation: 'enact a law',
    sentence: 'The government plans to enact a law to protect workers.', translation: '政府计划制定一部法律来保护劳动者。',
    hint: '听到 enact 时留意后面的 law 或 legislation。',
    distractors: ['废止一项规定', '评估政策效果', '违反法规'], source: listening,
  },
  {
    id: 'underestimate', skills: ['reading'], theme: '研究与判断', ipa: '/ˌʌndərˈestɪmeɪt/',
    meaning: '低估', collocation: 'underestimate the risks',
    sentence: 'New drivers may underestimate the risks of driving at night.', translation: '新手司机可能低估夜间驾驶的风险。',
    hint: 'under- + estimate。阅读替换可留意 undervalue 和 downplay。',
    distractors: ['高估', '消除', '回避'], source: reading,
  },
  {
    id: 'enhance', skills: ['writing'], theme: '教育与成长', ipa: '/ɪnˈhɑːns/',
    meaning: '提高、增强（质量、能力或体验）', collocation: 'enhance learning outcomes',
    sentence: 'Timely feedback can enhance learning outcomes.', translation: '及时反馈可以提升学习成效。',
    hint: '作文里可搭配 efficiency、quality、understanding。',
    cue: '提高、增强（质量或效果），以 en- 开头', phraseCue: '提升学习成效（outcomes）', accept: ['enhance learning outcomes'],
  },
  {
    id: 'submit', skills: ['listening'], theme: '学习与职场', ipa: '/səbˈmɪt/',
    meaning: '提交、递交', collocation: 'submit a report',
    sentence: 'Please submit the report by Friday.', translation: '请在周五前提交报告。',
    hint: '重音落在第二音节。submit a report 和 hand in a report 意思相近。',
    distractors: ['退回报告', '修改报告', '推迟截止日期'],
  },
  {
    id: 'curb', skills: ['reading'], theme: '社会与政策', ipa: '/kɜːb/',
    meaning: '遏制、控制', collocation: 'curb excessive spending',
    sentence: 'The new rules are intended to curb excessive spending.', translation: '新规旨在遏制过度支出。',
    hint: '阅读里可以与 restrain、rein in 联系。动词后常接不希望继续增长的事物。',
    distractors: ['鼓励', '计算', '公开'], source: reading,
  },
  {
    id: 'foster', skills: ['writing'], theme: '教育与成长', ipa: '/ˈfɒstə/',
    meaning: '促进、培养（发展或合作）', collocation: 'foster cooperation',
    sentence: 'Joint projects can foster cooperation between schools.', translation: '联合项目可以促进学校之间的合作。',
    hint: '适合写合作、创新和成长。常见搭配 foster trust、foster innovation。',
    cue: '促进、培养（合作或发展），以 f 开头', phraseCue: '促进合作', accept: ['foster cooperation', 'foster collaboration'],
  },
  {
    id: 'claim', skills: ['listening'], theme: '出行与服务', ipa: '/kleɪm/',
    meaning: '索赔（名词）', collocation: 'file a claim',
    sentence: 'You can file a claim if the airline loses your bag.', translation: '如果航空公司弄丢了你的行李，你可以提出索赔。',
    hint: '听到 file a claim 联想到提交索赔申请。动词 claim 也可以表示「声称」。',
    distractors: ['出具发票', '确认预订', '办理托运'],
  },
  {
    id: 'shield', skills: ['reading'], theme: '社会与政策', ipa: '/ʃiːld/',
    meaning: '保护、使免受影响（动词）', collocation: 'shield someone from harm',
    sentence: 'The policy aims to shield low-income families from sudden price increases.', translation: '这项政策旨在保护低收入家庭免受价格突然上涨的影响。',
    hint: '把名词「盾牌」转成动作。shield A from B 对应 protect A from B。',
    distractors: ['把某事归因于', '让某人承担', '把某人介绍给'], source: reading,
  },
  {
    id: 'contribute', skills: ['writing'], theme: '社会与责任', ipa: '/kənˈtrɪbjuːt/',
    meaning: '为……作贡献；促成', collocation: 'contribute to sustainable development',
    sentence: 'Better public transport can contribute to sustainable development.', translation: '更好的公共交通可以为可持续发展作贡献。',
    hint: '记住介词 to，后接名词或动名词。阅读中也可指促成坏结果。',
    cue: '为……作贡献，或成为某个结果的成因，以 c 开头', phraseCue: '为可持续发展作贡献', accept: ['contribute to sustainable development'],
  },
];
