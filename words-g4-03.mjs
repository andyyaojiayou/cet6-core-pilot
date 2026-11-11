const base = 'https://english-exam.lazynote.cn/cet6';

function exam(kind, paper, anchor, form) {
  const [year, month, set] = paper.split('-');
  const section = Number(anchor.split('-')[1]);
  const part = kind === 'transcript'
    ? ({ 1: '长对话第 1 篇', 5: '长对话第 2 篇', 9: '短文第 1 篇', 12: '短文第 2 篇', 16: '讲座第 1 篇', 19: '讲座第 2 篇', 22: '讲座第 3 篇' })[section] + '文字稿'
    : anchor.startsWith('p-part3-section-b-') ? '长篇阅读正文'
      : anchor.startsWith('p-part3-section-a-') ? '选词填空正文'
        : '仔细阅读第 ' + (anchor.startsWith('p-part3-section-c-2-') ? 2 : 1) + ' 篇正文';
  return {
    kind, form, label: year + ' 年 ' + Number(month) + ' 月第 ' + set + ' 套 · ' + part,
    url: base + (kind === 'transcript' ? '/sections/listening/' : '/paper/') + paper + '/#' + anchor,
  };
}

const L = (paper, anchor, form) => exam('transcript', paper, anchor, form);
const R = (paper, anchor, form) => exam('reading', paper, anchor, form);
const listen = (...distractors) => ({ skills: ['listening'], distractors });
const read = (...distractors) => ({ skills: ['reading'], distractors });
const write = (cue, phraseCue, ...accept) => ({ skills: ['writing'], cue, phraseCue, accept });

function comparison(kind, term, ipa, meaning, difference, example, translation, ipaUS) {
  return { kind, term, ipa, meaning, comparison: difference, example, translation, ...(ipaUS ? { ipaUS } : {}) };
}
const near = (...args) => comparison('近义', ...args);
const confuse = (...args) => comparison('易混', ...args);
const opposite = (...args) => comparison('反向', ...args);

function card(core, prompt, evidence, related, senses = []) {
  return { ...core, ...prompt, evidence, related, senses, tier: senses.some(sense => sense.evidence?.length) ? 'A' : 'B' };
}

export const g4BatchThree = [
  card({
    id: 'ambition', ipa: '/æmˈbɪʃən/', pos: 'n.', theme: '个人发展',
    meaning: '想要取得成就的强烈愿望', collocation: 'show great ambition',
    sentence: 'Her ambition drove her to keep learning long after she had found a stable job.',
    translation: '进取心使她在找到稳定工作很久以后仍坚持学习。',
    context: 'drove her to 表示这种愿望推动了长期行动。这里 ambition 说的是追求成就的动力。', hint: 'great ambition 可指远大的抱负，也可指强烈的进取心。',
  }, listen('有稳定收入的岗位', '已经取得的资格', '不愿承担风险的态度'), [L('2021-12-2', 'p-5-4', 'ambition'), R('2024-06-2', 'p-part3-section-c-1-1', 'ambition')], [
    confuse('aspiration', '/ˌæspɪˈreɪʃən/', '抱负；希望实现的目标', 'aspiration 常用来谈希望达到的未来状态。ambition 还可着重不满足现状的进取心。', 'The survey asked about students’ career aspirations.', '调查询问了学生对未来职业的期望。'),
    confuse('determination', '/dɪˌtɜːmɪˈneɪʃən/', '下定决心后坚持的意志', 'determination 侧重遇到困难仍坚持。ambition 侧重想达到的高度和成就。', 'She showed great determination during her recovery.', '她在康复期间表现出了很强的毅力。', '/dɪˌtɝːmɪˈneɪʃən/'),
  ]),
  card({
    id: 'alternative', ipa: '/ɔːlˈtɜːnətɪv/', ipaUS: '/ɑːlˈtɝːnət̬ɪv/', pos: 'n.', theme: '选择与方案',
    meaning: '可以用来替换现有方案的另一种选择', collocation: 'offer a viable alternative',
    sentence: 'A shuttle bus offers a practical alternative to driving to the airport.',
    translation: '往返巴士提供了一种可行的替代方案，乘客可以不用开车去机场。',
    context: 'to driving 引出原先的选择，a shuttle bus 是可替换它的选项。', hint: 'an alternative to 后可接名词或动名词。',
  }, write('可以用来替换现有方案的另一种选择，以 a 开头', '提供一种可行的替代方案', 'offer a viable alternative', 'provide a viable alternative'), [L('2022-12-2', 'p-12-2', 'alternative')], [
    near('option', '/ˈɒpʃən/', '可以选择的事物', 'option 指可选项。alternative 通常与现有选择形成对照。', 'The later train is another option.', '晚一点的那班火车也是一个选项。', '/ˈɑːpʃən/'),
    confuse('substitute', '/ˈsʌbstɪtjuːt/', '替代品；代替者', 'a substitute for butter 指实际可代替黄油的东西。an alternative to butter 着重它是另一种可选方案。', 'The recipe uses oil as a substitute for butter.', '这份食谱用油代替黄油。', '/ˈsʌbstətuːt/'),
  ], [
    { id: 'different-from-usual', pos: 'adj.', meaning: '非传统的；供替换选用的', collocation: 'try alternative crops',
      example: 'Some farmers are trying alternative crops that need less water.',
      translation: '一些农民正在尝试种植需水较少的替代作物。',
      context: 'alternative 修饰 crops，表示这些作物可作为当地常种作物的其他选择。',
      evidence: [R('2024-12-1', 'p-part3-section-b-7', 'alternative')] },
  ]),
  card({
    id: 'applicant', ipa: '/ˈæplɪkənt/', pos: 'n.', theme: '求职与申请',
    meaning: '正式申请职位、课程等的人', collocation: 'shortlist a strong applicant',
    sentence: 'Each applicant must send a writing sample before the interview.',
    translation: '每位申请者都必须在面试前提交一份写作样本。',
    context: 'must send 说明申请流程中的要求，before the interview 表明这些人正申请机会。', hint: 'an applicant for a job 是职位申请人。',
  }, listen('负责面试的人', '替人提交样本的人', '已经办理入职的人'), [L('2025-06-2', 'p-1-2', 'applicants'), R('2025-06-1', 'p-part3-section-c-2-10', 'applicants')], [
    near('candidate', '/ˈkændɪdət/', '候选人；应试者', 'applicant 强调已提出申请。candidate 常强调正在被考虑或评估，也可指考试应试者。', 'The panel interviewed three candidates for the post.', '评审小组面试了这个岗位的三位候选人。', '/ˈkændɪdeɪt/'),
    confuse('application', '/ˌæplɪˈkeɪʃən/', '申请；申请材料', 'an applicant 是申请的人。an application 是提出的申请或提交的材料。', 'The department received her application on Monday.', '部门周一收到了她的申请。'),
  ]),
  card({
    id: 'attitude', ipa: '/ˈætɪtjuːd/', ipaUS: '/ˈæt̬ətuːd/', pos: 'n.', theme: '心理与社会',
    form: 'attitudes', meaning: '对人、事物或做法的态度', collocation: 'change attitudes towards recycling',
    sentence: 'The school campaign aimed to change students’ attitudes towards recycling.',
    translation: '学校的宣传活动旨在改变学生对回收利用的态度。',
    context: 'towards recycling 指明态度的对象。change 表示活动要改变学生对这件事的看法或倾向。', hint: 'attitude to 或 towards 后接对象。',
  }, write('对人、事物或做法的态度，以 a 开头', '改变对回收利用的态度', 'change attitudes towards recycling', 'change attitudes toward recycling', 'change attitudes to recycling'), [L('2022-12-2', 'p-19-4', 'attitudes'), R('2022-12-2', 'p-part3-section-b-6', 'attitudes')], [
    confuse('opinion', '/əˈpɪnjən/', '具体意见；看法', 'opinion 常是可以明确说出的一个判断。attitude 还包括长期形成的好恶和行为倾向。', 'The committee asked for our opinion on the new timetable.', '委员会询问了我们对新时间表的看法。'),
    confuse('behaviour', '/bɪˈheɪvjə/', '行为', 'attitude 说明怎么看待某件事。behaviour 是实际怎么做。支持回收是一种态度，给废弃物分类是行为。', 'The researchers observed changes in consumer behaviour.', '研究人员观察了消费者行为的变化。', '/bɪˈheɪvjər/'),
  ]),
  card({
    id: 'available', ipa: '/əˈveɪləbəl/', pos: 'adj.', theme: '资源与服务',
    meaning: '可以得到、使用或购买的', collocation: 'make data available to researchers',
    sentence: 'The full report is available online without a subscription.',
    translation: '无需订阅即可在线查看完整报告。',
    context: 'online 是获取渠道，without a subscription 说明获取无需订阅。available 说明报告可以取得。', hint: 'available to someone 表示某人可以获得或使用。',
  }, read('仅供内部审查的', '需要重新发布的', '只能购买纸质版的'), [L('2024-06-1', 'p-19-2', 'available'), L('2022-06-1', 'p-9-2', 'available')], [
    near('accessible', '/əkˈsesəbəl/', '可进入、接触或理解的', '文件 available 表示有办法获得。accessible 还可以强调获取无障碍或内容容易理解。', 'The museum made its entrance accessible to wheelchair users.', '博物馆对入口进行了无障碍改造，方便轮椅使用者进入。'),
    confuse('obtainable', '/əbˈteɪnəbəl/', '可以取得的', 'obtainable 常强调能通过某种途径拿到。available 的用法更广，例如 a room is available 表示有空房。', 'Copies are obtainable from the library.', '可以从图书馆获取副本。'),
  ], [
    { id: 'free-to-do-something', pos: 'adj.', meaning: '（人）有空，可以见面或做某事', collocation: 'be available for a meeting',
      example: 'Are you available for a short call after lunch?', translation: '午饭后你有空简短通个电话吗？',
      context: 'after lunch 询问时间安排，available 表示说话对象有空。' },
  ]),
  card({
    id: 'business', ipa: '/ˈbɪznəs/', pos: 'n.', theme: '经济与创业',
    meaning: '企业；以经营获利为目的的组织', collocation: 'run a small business',
    sentence: 'She runs a small business that repairs old bicycles.',
    translation: '她经营一家修理旧自行车的小企业。',
    context: 'runs 表示经营，a small business 是可数的企业。后面说明企业提供的服务。', hint: 'a business 常指一家企业，do business 指做生意。',
  }, read('一家慈善机构', '一种自行车配件', '自行车修理课程'), [L('2022-06-1', 'p-5-1', 'business'), L('2023-06-1', 'p-12-3', 'businesses')], [
    near('company', '/ˈkʌmpəni/', '公司', 'company 通常指一家相对明确的组织。small business 也可指店主自己经营的生意。', 'The company employs twelve engineers.', '这家公司雇用了十二位工程师。'),
    confuse('commerce', '/ˈkɒmɜːs/', '商业贸易', 'commerce 多指整体商业活动或贸易领域。a business 可以是某家具体企业。', 'The port became a centre of regional commerce.', '该港口成为地区商业中心。', '/ˈkɑːmɝːs/'),
  ], [
    { id: 'commercial-activity', pos: 'n.', meaning: '商业往来；做生意的活动', collocation: 'do business with local suppliers',
      example: 'The restaurant prefers to do business with local suppliers.', translation: '这家餐馆更愿意与本地供应商做生意。',
      context: 'with 后是交易往来的对象。do business 概括商业往来，在这里没有冠词。',
      evidence: [L('2023-06-1', 'p-19-1', 'business')] },
  ]),
  card({
    id: 'career', ipa: '/kəˈrɪə/', ipaUS: '/kəˈrɪr/', pos: 'n.', theme: '工作与职业',
    meaning: '职业生涯；一段时期内的职业发展', collocation: 'pursue a career in law',
    sentence: 'After graduation, she hopes to pursue a career in environmental law.',
    translation: '毕业后，她希望从事环境法方面的工作。',
    context: 'after graduation 指未来的发展起点，in environmental law 说明她想进入的职业领域。', hint: 'a career in 后接行业或领域。',
  }, write('职业生涯；一段时期内的职业发展，以 c 开头', '从事法律职业', 'pursue a career in law', 'have a career in law', 'start a career in law'), [L('2025-06-1', 'p-5-3', 'career'), L('2025-12-1', 'p-1-3', 'career')], [
    confuse('job', '/dʒɒb/', '某一份工作', 'job 常指眼下的一份岗位。career 可以包括一段时期内先后从事的多份工作。', 'He took a summer job at the museum.', '他暑假在博物馆找了份工作。', '/dʒɑːb/'),
    confuse('profession', '/prəˈfeʃən/', '通常需要专业训练的职业', 'the legal profession 指法律行业或其中的从业者。a career in law 说的是某人的职业路径。', 'She entered the teaching profession in 2022.', '她在 2022 年进入了教师行业。'),
  ]),
  card({
    id: 'circumstance', form: 'circumstances', ipa: '/ˈsɜːkəmstæns/', ipaUS: '/ˈsɝːkəmstæns/', pos: 'n.', theme: '条件与决策',
    meaning: '影响某事的外部情形或条件', collocation: 'adapt to changing circumstances',
    sentence: 'Small teams can often adapt quickly when circumstances change.',
    translation: '外部情况发生变化时，小团队往往能迅速适应。',
    context: 'when ... change 给出需要适应的条件。circumstances 指环境、资源等影响做法的因素。', hint: 'under these circumstances 表示在这样的情况下。',
  }, listen('团队已经完成的目标', '每个人的职位名称', '与任务无关的个人喜好'), [L('2023-12-1', 'p-12-1', 'circumstances'), R('2024-06-2', 'p-part3-section-b-7', 'circumstances')], [
    near('situation', '/ˌsɪtʃuˈeɪʃən/', '局面；处境', 'situation 指整体局面。circumstances 强调构成局面、影响选择的一组条件。', 'The situation improved after the road reopened.', '道路重新开放后，情况好转了。'),
    confuse('condition', '/kənˈdɪʃən/', '条件；状态', 'conditions 可具体指工作条件或协议要求。circumstances 更常概括事情发生时的多方面背景。', 'The runners faced difficult weather conditions.', '跑步者遇到了恶劣的天气条件。'),
  ]),
  card({
    id: 'citizen', form: 'citizens', ipa: '/ˈsɪtɪzən/', ipaUS: '/ˈsɪt̬əzən/', pos: 'n.', theme: '社会与社区',
    meaning: '公民；参与公共生活的社会成员', collocation: 'encourage citizens to take part',
    sentence: 'The project allows ordinary citizens to collect data about local wildlife.',
    translation: '这个项目让普通公民也能参与收集当地野生动物的数据。',
    context: 'ordinary 与专业人员相对。citizens 指能够参与公共项目的公众成员。', hint: 'ordinary citizens 指普通民众，citizen of a country 可强调国籍。',
  }, read('受雇的研究人员', '项目购买的设备', '当地的野生动物'), [L('2023-12-2', 'p-12-1', 'citizens'), R('2025-06-3', 'p-part3-section-c-2-3', 'citizens')], [
    confuse('resident', '/ˈrezɪdənt/', '居民；居住在某地的人', 'resident 强调居住地点。citizen 可强调法律上的国籍、公民权利或公共参与。', 'Residents can apply for a parking permit.', '居民可以申请停车许可证。'),
    confuse('community', '/kəˈmjuːnəti/', '社区；有共同联系的群体', 'a citizen 是一个人。a community 是具有地理联系或共同兴趣的一群人。', 'The community helped restore the old playground.', '社区居民一起修复了旧游乐场。', '/kəˈmjuːnət̬i/'),
  ]),
  card({
    id: 'civic', ipa: '/ˈsɪvɪk/', pos: 'adj.', theme: '社会与社区',
    meaning: '与公民参与、公共生活或市政事务有关的', collocation: 'participate in civic life',
    sentence: 'The course gives young people practical ways to participate in civic life.',
    translation: '这门课教年轻人怎样切实参与公共生活。',
    context: 'participate in 表示参与。civic life 可包括参与社区决策、公共讨论和志愿服务。', hint: 'civic life、civic duty 和 civic responsibility 都围绕公共事务中的公民角色。',
  }, listen('家庭的私生活', '企业内部的绩效考核', '公民的休假安排'), [L('2023-06-1', 'p-5-5', 'civic'), R('2023-06-2', 'p-part3-section-b-5', 'civic')], [
    confuse('civil', '/ˈsɪvəl/', '民用的；公民的；民事的', 'civil rights 指公民权利，civil law 指民法。civic duty 常指参与公共生活时的责任。', 'The organisation provides advice on civil rights.', '该机构提供有关公民权利的咨询。'),
    near('public', '/ˈpʌblɪk/', '公共的；面向公众的', 'public services 是面向公众提供的服务。civic participation 强调公众在社区和公共事务中主动参与。', 'The decision was announced at a public meeting.', '这一决定在公开会议上宣布。'),
  ]),
  card({
    id: 'class', ipa: '/klɑːs/', ipaUS: '/klæs/', pos: 'n.', theme: '社会与教育',
    meaning: '社会阶层；处境相近的一群人', collocation: 'differences between social classes',
    sentence: 'The study looked at how social class affects access to higher education.',
    translation: '这项研究考察了社会阶层如何影响人们接受高等教育的机会。',
    context: 'social 限定 class 指社会阶层，后面讨论不同社会处境如何影响教育机会。', hint: 'middle class 是中产阶层，social class 是社会阶层。',
  }, read('学生参加的一节课', '入学考试的分数', '高校可供选择的专业'), [L('2025-06-1', 'p-22-2', 'class'), L('2024-12-2', 'p-19-6', 'class')], [
    confuse('status', '/ˈsteɪtəs/', '地位；身份', 'social status 指某人的社会地位。social class 是社会中地位或经济处境相近的一个群体。', 'The job brought her higher social status.', '这份工作提高了她的社会地位。', '/ˈstætəs/'),
    confuse('course', '/kɔːs/', '一门课程；一系列课程', 'class 可指其中一次上课或一个班。course 通常覆盖按顺序组织的整门课程。', 'She enrolled in a course in statistics.', '她报名参加了一门统计学课程。', '/kɔːrs/'),
  ], [
    { id: 'lesson', pos: 'n.', meaning: '一节课；一起上课的人', collocation: 'go to class',
      example: 'I left my notebook in the library and had to go to class without it.', translation: '我把笔记本落在了图书馆，只好没带笔记本去上课。',
      context: 'go to class 指去上课，notebook 是课堂用品。class 在这里是上课活动。',
      evidence: [L('2021-12-1', 'p-1-1', 'class'), R('2023-06-2', 'p-part3-section-b-11', 'class')] },
  ]),
  card({
    id: 'complaint', ipa: '/kəmˈpleɪnt/', pos: 'n.', theme: '服务与沟通',
    meaning: '对某事表达不满；提出的投诉', collocation: 'file a formal complaint',
    sentence: 'Several tenants made a complaint about the lack of heating.',
    translation: '几位租客就没有供暖提出了投诉。',
    context: 'lack of heating 是租客不满意的具体问题。make a complaint about 后接投诉内容。', hint: 'complaint about 加事由。complaint to 可以引出受理方。',
  }, listen('对新设施的肯定', '租客签署的合同', '提供供暖的设备'), [L('2024-12-1', 'p-1-11', 'complaints'), R('2023-06-3', 'p-part3-section-c-1-1', 'complaints')], [
    confuse('claim', '/kleɪm/', '索赔申请；主张', 'complaint 是表达不满。an insurance claim 是依合同申请赔偿，目的更具体。', 'She filed a claim for the damaged suitcase.', '她为损坏的行李箱提出了索赔。'),
    confuse('objection', '/əbˈdʒekʃən/', '反对意见', 'objection 通常是不同意一项提议或行动。complaint 可以针对已经遇到的问题提出不满。', 'He raised an objection to the proposed cut.', '他对拟议中的削减提出了反对意见。'),
  ]),
  card({
    id: 'cost', form: 'costs', ipa: '/kɒst/', ipaUS: '/kɑːst/', pos: 'n.', theme: '经济与取舍',
    past: 'cost', participle: 'cost', meaning: '购买、运行或完成某事所需的费用', collocation: 'keep costs down',
    sentence: 'The group held the meeting online to keep travel costs down.',
    translation: '小组在网上开会，以降低交通费用。',
    context: 'online 代替了出行，travel costs 是原本需要支付的交通费用。', hint: 'keep costs down 是控制费用，不让费用过高。',
  }, write('购买、运行或完成某事所需的费用，以 c 开头', '降低费用', 'keep costs down', 'reduce costs', 'lower costs', 'cut costs'), [L('2022-06-1', 'p-5-12', 'costs'), L('2023-12-2', 'p-19-3', 'cost')], [
    confuse('price', '/praɪs/', '价格；标价', 'price 常指商品售价。cost 可以包括购买、运行或维护所需的总费用。', 'The price of the ticket includes lunch.', '票价包含午餐。'),
    confuse('expense', '/ɪkˈspens/', '支出；一笔开销', 'expense 常强调实际支出或报销项目。cost 也可用来估算未来完成一件事的代价。', 'The company reimbursed her travel expenses.', '公司给她报销了差旅开销。'),
  ], [
    { id: 'require-payment', pos: 'v.', meaning: '花费某个金额', collocation: 'cost less than expected',
      example: 'The repair cost considerably less than we had expected.', translation: '这次修理花的钱比我们预计的少得多。',
      context: 'the repair 作主语，less 说明花费金额更小。表花费时过去式和过去分词均为 cost。',
      evidence: [L('2024-06-1', 'p-19-2', 'cost'), L('2022-12-2', 'p-5-9', 'cost')] },
    { id: 'regardless-of-consequences', pos: '短语', meaning: '不惜一切代价；无论如何', collocation: 'win at all costs',
      example: 'The coach warned us against trying to win at all costs.', translation: '教练提醒我们别为了获胜不计一切代价。',
      context: 'at all costs 强调为达到目标可以不计任何后果，代价包括金钱以外的损失。',
      evidence: [L('2024-06-1', 'p-16-3', 'costs')] },
  ]),
  card({
    id: 'current', ipa: '/ˈkʌrənt/', ipaUS: '/ˈkɝːənt/', pos: 'adj.', theme: '时事与变化',
    meaning: '目前的；现行的', collocation: 'review the current system',
    sentence: 'The current system allows each student to borrow up to six books.',
    translation: '现行制度允许每位学生最多借六本书。',
    context: 'current 修饰 system，说明是当前生效的制度。allows 说明制度允许什么。', hint: 'current situation 指目前的情况，current events 指时事。',
  }, read('从未通过的', '早已废止的', '准备明年实施的'), [L('2023-06-1', 'p-5-4', 'current'), R('2026-06-3', 'p-part3-section-c-2-2', 'current')], [
    near('present', '/ˈprezənt/', '现在的；目前的', 'the present system 与 the current system 在许多语境中可互换。current 还常指当前执行的版本。', 'The present rules apply to all visitors.', '现行规定适用于所有来访者。'),
    confuse('recent', '/ˈriːsənt/', '最近发生的', 'a recent change 是不久前发生的变化。the current rule 说的是现在有效的规则，不限定何时开始。', 'A recent change improved access to the building.', '最近的一项改动让人们更容易进入这栋楼。'),
  ], [
    { id: 'flow', pos: 'n.', meaning: '水流；电流', collocation: 'a strong ocean current',
      example: 'A strong current carried the boat away from the shore.', translation: '一股急流把船带离了岸边。',
      context: 'carried the boat 与 shore 提示这里是推动船只的水流。谈电路时，electric current 指电流。' },
  ]),
  card({
    id: 'demographic', ipa: '/ˌdeməˈɡræfɪk/', pos: 'adj.', theme: '人口与统计',
    meaning: '与人口数量、构成或变化有关的', collocation: 'track demographic changes',
    sentence: 'The report links demand for smaller homes to demographic changes.',
    translation: '报告把对小户型住宅的需求与人口结构变化联系起来。',
    context: 'demographic 修饰 changes。变化可指独居家庭增多、人口老龄化等影响住房需求的因素。', hint: 'demographic group 指按年龄等人口特征划分的一组人。',
  }, read('建筑材料的', '施工流程的', '房屋外观的'), [L('2024-06-2', 'p-19-6', 'demographic'), R('2026-06-1', 'p-part3-section-a-3', 'demographic')], [
    confuse('population', '/ˌpɒpjʊˈleɪʃən/', '人口；总体', 'population 可以指某地所有居民。demographic shift 着重人口规模或结构的变化。', 'The town’s population has doubled.', '该镇人口已增加到原来的两倍。', '/ˌpɑːpjəˈleɪʃən/'),
    confuse('census', '/ˈsensəs/', '人口普查', 'census 是收集人口资料的一项调查。demographic data 可以来自普查或其他数据来源。', 'The census recorded the size of each household.', '人口普查记录了每户的人数。'),
  ], [
    { id: 'population-characteristics', pos: 'n.（复数）', meaning: '某一人群的人口统计特征', collocation: 'compare the demographics of two groups',
      example: 'The researchers compared the demographics of two groups of volunteers.', translation: '研究人员比较了两组志愿者的人口统计特征。',
      context: 'compared the demographics 指比较年龄、性别等特征。此义通常使用复数。',
      evidence: [L('2022-06-1', 'p-19-3', 'demographics')] },
  ]),
  card({
    id: 'digital', ipa: '/ˈdɪdʒɪtəl/', ipaUS: '/ˈdɪdʒət̬əl/', pos: 'adj.', theme: '信息与技术',
    meaning: '数字化的；以计算机可处理的形式存在的', collocation: 'create a digital archive',
    sentence: 'The library created a digital archive so readers could search its records online.',
    translation: '图书馆创建了数字档案库，读者可以在线搜索记录。',
    context: 'search ... online 提示资料已用计算机可处理的形式保存。', hint: 'digital archive 是数字档案库，digital divide 指数字鸿沟。',
  }, write('数字化的；以计算机可处理的形式存在的，以 d 开头', '数字档案库', 'a digital archive', 'digital archive'), [R('2025-06-1', 'p-part3-section-b-6', 'digital'), L('2024-12-2', 'p-9-2', 'digital')], [
    confuse('electronic', '/ɪˌlekˈtrɒnɪk/', '电子的；由电子设备运行或处理的', 'electronic 强调使用电子设备或电路。digital 强调用数字编码存储或处理信息。', 'The ticket is issued in electronic form.', '这张票以电子形式签发。', '/ɪˌlekˈtrɑːnɪk/'),
    opposite('analogue', '/ˈænəlɒɡ/', '模拟式的', 'analogue 信号以连续变化传递信息。digital 信号用离散值编码。', 'The engineers replaced the old analogue recording system.', '工程师更换了旧的模拟录音系统。', '/ˈænəlɑːɡ/'),
  ]),
  card({
    id: 'disease', ipa: '/dɪˈziːz/', pos: 'n.', theme: '健康与医学',
    meaning: '疾病；影响身体正常功能的一类健康问题', collocation: 'reduce the risk of disease',
    sentence: 'The screening programme helps doctors detect disease at an early stage.',
    translation: '筛查计划帮助医生及早发现疾病。',
    context: 'screening 和 doctors 指向医学语境。detect disease 指发现身体机能受到影响的疾病。', hint: 'heart disease 表示心脏病，infectious disease 表示传染病。',
  }, listen('筛查费用', '健康档案的编号', '就诊需要的文件'), [L('2024-06-1', 'p-19-1', 'diseases'), L('2026-06-1', 'p-19-2', 'disease')], [
    near('illness', '/ˈɪlnəs/', '疾病；患病状态', 'illness 常从人的患病经历着眼。disease 在医学讨论中常指可描述病因或特征的一类疾病。', 'She returned to work after a long illness.', '病了很长时间后，她回到了工作岗位。'),
    confuse('symptom', '/ˈsɪmptəm/', '症状', 'symptom 是可察觉的表现，例如发烧。disease 是可能引起症状的疾病。', 'A persistent cough can be a symptom of infection.', '持续咳嗽可能是感染的症状。'),
  ]),
  card({
    id: 'electronic', ipa: '/ɪˌlekˈtrɒnɪk/', ipaUS: '/ɪˌlekˈtrɑːnɪk/', pos: 'adj.', theme: '信息与技术',
    meaning: '电子的；使用电子设备存储、处理或传送的', collocation: 'keep electronic records',
    sentence: 'The clinic switched from paper files to electronic records.',
    translation: '诊所将纸质档案改为了电子记录。',
    context: 'from paper files to 对比了保存形式。electronic records 用电子设备保存和处理。', hint: 'electronic book 是电子书，electronic records 是电子记录。',
  }, read('手写保存在纸上的', '不再需要记录的', '已经销毁的'), [L('2025-12-2', 'p-19-1', 'electronic'), L('2025-12-2', 'p-19-5', 'electronic')], [
    confuse('electric', '/ɪˈlektrɪk/', '用电驱动的；与电有关的', 'electric bike 强调电力驱动。electronic records 强调信息经电子设备处理。', 'The council bought three electric vehicles.', '市议会购置了三辆电动车。'),
    near('digital', '/ˈdɪdʒɪtəl/', '数字化的', 'digital files 可与 electronic files 在日常语境中互换。digital 更具体地说明信息用数字形式编码。', 'The photographer kept a digital copy of each image.', '摄影师为每张图片都保存了数字副本。', '/ˈdɪdʒət̬əl/'),
  ]),
  card({
    id: 'employee', form: 'employees', ipa: '/ɪmˈplɔɪiː/', pos: 'n.', theme: '职场与劳动',
    meaning: '受雇为某个机构工作的人', collocation: 'provide training for employees',
    sentence: 'New employees receive safety training before they enter the factory floor.',
    translation: '新员工进入工厂车间前会接受安全培训。',
    context: 'new 和 receive safety training 描述刚入职者。employees 是受到工厂雇用的人。', hint: 'employee 是受雇方，employer 是雇用方。',
  }, listen('负责制定法规的机构', '来工厂参观的人', '工厂采购的机器'), [L('2023-06-1', 'p-22-4', 'employees'), L('2025-06-1', 'p-12-4', 'employees')], [
    confuse('employer', '/ɪmˈplɔɪə/', '雇主；雇用员工的组织', 'employer 提供职位并支付报酬。employee 接受雇用并提供劳动。', 'The employer must provide a safe workplace.', '雇主必须提供安全的工作场所。', '/ɪmˈplɔɪər/'),
    confuse('contractor', '/kənˈtræktə/', '承包商；按合同提供服务的人或公司', 'contractor 常按合同完成一项工作。employee 通常处在雇佣关系中，受雇于组织。', 'A contractor repaired the roof.', '一家承包商修理了屋顶。', '/ˈkɑːntræktər/'),
  ]),
  card({
    id: 'employer', form: 'employers', ipa: '/ɪmˈplɔɪə/', ipaUS: '/ɪmˈplɔɪər/', pos: 'n.', theme: '职场与劳动',
    meaning: '雇用他人的个人或组织', collocation: 'meet the needs of employers',
    sentence: 'Local employers said they needed more workers with basic computer skills.',
    translation: '当地雇主说，他们需要更多掌握基本电脑技能的员工。',
    context: 'needed more workers 表明句子从用工方出发。employers 是聘用员工的一方。', hint: 'prospective employers 是可能雇用求职者的单位。',
  }, read('待招聘的求职者', '提供课程的学员', '考核电脑技能的题目'), [L('2023-06-1', 'p-5-4', 'employers'), R('2025-06-1', 'p-part3-section-c-2-10', 'Employers')], [
    confuse('recruiter', '/rɪˈkruːtə/', '招聘人员；招聘机构', 'recruiter 负责寻找或筛选候选人，可能为别的公司服务。employer 与员工建立雇佣关系。', 'A recruiter contacted her about the vacancy.', '一名招聘人员就这个空缺联系了她。', '/rɪˈkruːtər/'),
    confuse('employee', '/ɪmˈplɔɪiː/', '雇员；员工', 'employer 给出工作机会。employee 在雇佣关系中承担工作并取得报酬。', 'Each employee received a copy of the schedule.', '每位员工都收到了一份排班表。'),
  ]),

  card({
    id: 'entertainment', ipa: '/ˌentəˈteɪnmənt/', ipaUS: '/ˌentərˈteɪnmənt/', pos: 'n.', theme: '媒体与文化',
    meaning: '用于消遣或让观众愉悦的内容和活动', collocation: 'provide live entertainment',
    sentence: 'The festival provides live entertainment for families throughout the afternoon.',
    translation: '节日在整个下午为家庭观众安排现场娱乐节目。',
    context: 'live 表示现场，families 指观众。entertainment 是供观众欣赏消遣的节目。', hint: 'entertainment industry 是娱乐业。',
  }, read('工作人员的排班', '节日期间的道路管制', '对家庭收入的调查'), [R('2024-06-2', 'p-part3-section-c-1-8', 'entertainment'), R('2024-12-1', 'p-part3-section-c-1-6', 'entertainment')], [
    confuse('recreation', '/ˌrekriˈeɪʃən/', '休闲活动；消遣', 'recreation 可指人们主动进行的散步、球类等休闲活动。entertainment 常指供人观看、聆听的内容。', 'The park is used for recreation by local families.', '当地居民家庭常到这个公园休闲。'),
    confuse('performance', '/pəˈfɔːməns/', '一场表演；表现', 'a performance 可以是一场演出。entertainment 是更广的类别，也包括电影、游戏等内容。', 'The evening performance begins at eight.', '晚场演出八点开始。', '/pərˈfɔːrməns/'),
  ]),
  card({
    id: 'ethics', ipa: '/ˈeθɪks/', pos: 'n.', theme: '研究与价值观',
    meaning: '衡量行为是否合宜的伦理准则', collocation: 'follow research ethics',
    sentence: 'The team discussed the ethics of collecting data without clear consent.',
    translation: '团队讨论了在没有明确同意的情况下收集数据是否合乎伦理。',
    context: 'without clear consent 引出应当如何对待参与者的问题。ethics 关心的是行为合不合宜。', hint: 'research ethics 指研究伦理，ethics committee 是伦理审查委员会。',
  }, write('衡量行为是否合宜的伦理准则，以 e 开头', '研究伦理', 'research ethics'), [L('2023-12-2', 'p-19-4', 'ethics'), R('2023-12-3', 'p-part3-section-c-1-10', 'ethics')], [
    near('morality', '/məˈræləti/', '道德；关于善恶是非的观念', 'morality 可讨论个人或群体的一般道德观。ethics 常指特定职业或研究实践中的行为准则。', 'The novel explores questions of power and morality.', '这部小说探讨权力与道德的问题。', '/məˈrælət̬i/'),
    confuse('etiquette', '/ˈetɪket/', '礼仪；社交惯例', 'etiquette 涉及合乎礼节的做法，例如如何称呼别人。ethics 涉及责任、公平等原则。', 'The guide explains basic business etiquette.', '指南介绍了基本的商务礼仪。', '/ˈet̬ɪkət/'),
  ]),
  card({
    id: 'exercise', ipa: '/ˈeksəsaɪz/', ipaUS: '/ˈeksərsaɪz/', pos: 'n.', theme: '健康与行为',
    past: 'exercised', participle: 'exercised', meaning: '为增强体能或保持健康进行的身体活动', collocation: 'get regular exercise',
    sentence: 'The doctor suggested regular exercise, starting with short walks.',
    translation: '医生建议经常锻炼，可以从短时间散步开始。',
    context: 'short walks 是具体的身体活动。exercise 指为了身体健康而进行的锻炼。', hint: 'regular exercise 用不可数名词。可数的 an exercise 也能指一项练习。',
  }, listen('走路所需的装备', '医生写的证明', '调整饮食的建议'), [L('2026-06-2', 'p-16-2', 'exercise'), R('2025-12-1', 'p-part3-section-a-1', 'exercise')], [
    confuse('workout', '/ˈwɜːkaʊt/', '一次锻炼', 'workout 往往指可数的一次训练。exercise 可用不可数形式统称锻炼。', 'I did a short workout before work.', '上班前我做了一次简短的锻炼。', '/ˈwɝːkaʊt/'),
    confuse('practice', '/ˈpræktɪs/', '反复练习以提高技能', 'practice 常强调技能熟练度。exercise 也可以指一项用于练习或增强能力的具体活动。', 'The pronunciation improved with practice.', '通过练习，发音有了改善。'),
  ], [
    { id: 'use-ability-or-right', pos: 'v.', meaning: '行使权利；运用能力或判断', collocation: 'exercise independent judgment',
      example: 'Staff must exercise judgment when the instructions do not cover a case.', translation: '操作说明没有涵盖某种情况时，员工必须自行判断。',
      context: 'judgment 是可运用的判断能力。exercise 后接能力、权利或权力时表示实际使用。',
      evidence: [R('2023-06-1', 'p-part3-section-c-1-3', 'exercise'), L('2023-12-1', 'p-12-1', 'exercise')] },
    { id: 'structured-practice', pos: 'n.', meaning: '一项有具体步骤的训练或练习', collocation: 'complete a short writing exercise',
      example: 'We finished the lesson with a short writing exercise.', translation: '这堂课最后安排了一项简短的写作练习。',
      context: 'a short 写明一项，writing 限定练习形式。exercise 在这里用可数形式。',
      evidence: [R('2023-06-1', 'p-part3-section-b-6', 'exercises')] },
  ]),
  card({
    id: 'facility', form: 'facilities', ipa: '/fəˈsɪləti/', ipaUS: '/fəˈsɪlət̬i/', pos: 'n.', theme: '设施与服务',
    meaning: '为特定用途提供的建筑、设备或设施', collocation: 'improve sports facilities',
    sentence: 'The college opened its sports facilities to local residents on weekends.',
    translation: '学院周末向当地居民开放体育设施。',
    context: 'opened ... to 表示开放使用，sports 限定设施的用途，如体育馆和球场。', hint: 'facility 的复数是 facilities，常指一地配套的多项设施。',
  }, write('为特定用途提供的建筑、设备或设施，以 f 开头', '改善体育设施', 'improve sports facilities', 'upgrade sports facilities'), [R('2023-06-3', 'p-part3-section-b-11', 'facilities'), L('2025-12-1', 'p-22-3', 'facilities')], [
    confuse('equipment', '/ɪˈkwɪpmənt/', '设备；器材', 'sports equipment 指球拍或健身器材。sports facilities 还可以包括球场、游泳馆等整体场地。', 'The club bought new equipment for training.', '俱乐部购置了新的训练设备。'),
    near('amenity', '/əˈmiːnəti/', '便利生活的配套设施或服务', 'amenities 常强调居住或出行时使用的便利配套。facility 也常用于生产、研究和公共服务场所。', 'The neighbourhood has good local amenities.', '这个社区的本地生活配套很好。', '/əˈmenət̬i/'),
  ]),
  card({
    id: 'feedback', ipa: '/ˈfiːdbæk/', pos: 'n.', theme: '沟通与系统',
    meaning: '有助于了解表现或改进做法的反馈', collocation: 'give constructive feedback',
    sentence: 'The tutor gave detailed feedback on the first draft.',
    translation: '导师对初稿给出了详细反馈。',
    context: 'on the first draft 说明评价对象，detailed 表示反馈包含具体意见。', hint: 'feedback 常作不可数名词，可说 some feedback。',
  }, write('有助于了解表现或改进做法的反馈，以 f 开头', '提供建设性的反馈', 'give constructive feedback', 'provide constructive feedback', 'offer constructive feedback'), [L('2022-12-1', 'p-12-3', 'feedback'), L('2024-12-1', 'p-12-1', 'feedback')], [
    near('comment', '/ˈkɒment/', '一条意见或评论', 'a comment 是可数的一条意见。feedback 通常概括为了了解表现或帮助改进而给出的一组反馈。', 'The reviewer left a comment on the introduction.', '评阅人在引言处留了一条意见。', '/ˈkɑːment/'),
    confuse('criticism', '/ˈkrɪtɪsɪzəm/', '批评；批判性评价', 'criticism 常点出问题。feedback 可以包含批评、肯定和下一步改进建议。', 'The report drew criticism for its small sample.', '这份报告因样本太小受到批评。', '/ˈkrɪt̬əsɪzəm/'),
  ], [
    { id: 'system-loop', pos: '短语', meaning: '反馈回路；结果反过来影响后续过程', collocation: 'create a feedback loop',
      example: 'Low attendance can create a feedback loop if fewer visitors lead to fewer events.', translation: '如果来访人数减少导致活动减少，低参与度就可能形成反馈回路。',
      context: '活动变少后，来访人数可能进一步减少。结果反过来影响起初的变化。',
      evidence: [R('2022-12-2', 'p-part3-section-b-6', 'feedback')] },
  ]),
  card({
    id: 'flexible', ipa: '/ˈfleksəbəl/', pos: 'adj.', theme: '工作与安排',
    meaning: '能按情况调整的；灵活的', collocation: 'offer flexible working hours',
    sentence: 'Flexible working hours allow staff to start and finish at different times.',
    translation: '弹性工作时间让员工能在不同时间开始和结束工作。',
    context: 'different times 说明上下班时间可以调整。flexible 修饰这种安排。', hint: 'flexible hours 是弹性工时，a flexible approach 是能随情况调整的做法。',
  }, write('能按情况调整的；灵活的，以 f 开头', '提供弹性工作时间', 'offer flexible working hours', 'offer flexible work hours', 'provide flexible working hours'), [L('2023-06-1', 'p-22-4', 'flexible'), R('2024-06-3', 'p-part3-section-b-14', 'flexible')], [
    near('adaptable', '/əˈdæptəbəl/', '能适应新情况的', 'adaptable staff 容易适应变化。flexible hours 指时间安排可调整。两者都能描述做法，但侧重点不同。', 'We need staff who are adaptable when plans change.', '计划变化时，我们需要能够适应的员工。'),
    opposite('rigid', '/ˈrɪdʒɪd/', '僵硬的；不易调整的', 'a rigid schedule 很难改动。a flexible schedule 留有随情况调整的余地。', 'A rigid timetable left no room for extra questions.', '时间表安排得太死，留不出额外提问的时间。'),
  ], [
    { id: 'bendable', pos: 'adj.', meaning: '可弯曲的；不易因弯曲而损坏的', collocation: 'use a flexible tube',
      example: 'A flexible tube connects the pump to the tank.', translation: '一根柔性管将泵和水箱连接起来。',
      context: 'flexible 描述管道的物理性质。管道可以弯曲，方便绕过其他部件。' },
  ]),
  card({
    id: 'formal', ipa: '/ˈfɔːməl/', ipaUS: '/ˈfɔːrməl/', pos: 'adj.', theme: '教育与沟通',
    meaning: '正规的；按正式程序或制度进行的', collocation: 'receive formal training',
    sentence: 'Volunteers receive formal training before they start taking calls.',
    translation: '志愿者在开始接听电话前会接受正规培训。',
    context: 'before they start 指上岗前。formal training 说明培训有组织并遵循规定的流程。', hint: 'formal education 指正规教育，formal qualification 指正式资历。',
  }, read('纯靠个人摸索的', '没有组织安排的', '已经取消的'), [L('2021-06-1', 'p-16-5', 'formal'), R('2024-06-3', 'p-part3-section-c-2-4', 'formal')], [
    near('official', '/əˈfɪʃəl/', '官方的；经正式批准的', 'official 强调得到有权机构认可。formal 强调遵循正式流程、格式或礼节。', 'The school published its official response.', '学校公布了正式回应。'),
    opposite('casual', '/ˈkæʒuəl/', '随意的；非正式的', 'casual conversation 可以轻松随意。formal conversation 往往更重礼貌和表达方式。', 'We had a casual conversation over lunch.', '我们吃午饭时随意聊了一会儿。'),
  ], [
    { id: 'reserved-style', pos: 'adj.', meaning: '（行为、言谈）拘谨的；讲究礼节的', collocation: 'sound rather formal',
      example: 'His tone was so formal that the conversation felt like a job interview.', translation: '他的语气很拘谨，谈话感觉像一场求职面试。',
      context: 'tone 说明在评价说话方式。formal 在这里是克制、讲究礼节的语气。',
      evidence: [L('2025-06-1', 'p-22-1', 'formal')] },
  ]),
  card({
    id: 'freedom', ipa: '/ˈfriːdəm/', pos: 'n.', theme: '社会与选择',
    meaning: '可以自行选择或行动的自由', collocation: 'have the freedom to choose',
    sentence: 'Students have the freedom to choose how they present their findings.',
    translation: '学生可以自由选择展示研究结果的方式。',
    context: 'to choose 指学生可自己作的决定。how 引出他们能选择的具体方式。', hint: 'freedom to do 表示做某事的自由，freedom from fear 指免于恐惧。',
  }, write('可以自行选择或行动的自由，以 f 开头', '拥有选择的自由', 'have the freedom to choose', 'have freedom to choose'), [L('2023-12-2', 'p-1-7', 'freedom'), R('2025-12-1', 'p-part3-section-c-4', 'freedom')], [
    near('liberty', '/ˈlɪbəti/', '自由；法律或政治上的自由', 'liberty 常见于公民自由、法律权利等正式表达。freedom 也常指日常安排里的选择余地。', 'The charter protects individual liberty.', '该宪章保护个人自由。', '/ˈlɪbərt̬i/'),
    confuse('independence', '/ˌɪndɪˈpendəns/', '独立；不依赖他人', 'independence 强调无需依赖或受控于他人。freedom 可以指在某个具体范围内有选择权。', 'The part-time job gave him some financial independence.', '这份兼职让他在经济上有了一定的独立性。'),
  ]),
  card({
    id: 'funding', ipa: '/ˈfʌndɪŋ/', pos: 'n.', theme: '资源与研究',
    meaning: '项目或活动获得的经费支持', collocation: 'secure funding for a project',
    sentence: 'The university secured funding for a study of urban air quality.',
    translation: '大学为一项城市空气质量研究争取到了经费。',
    context: 'secured 表示成功争取到，for a study 写明经费将用于哪项活动。', hint: 'funding 通常不可数，public funding 指公共经费。',
  }, listen('研究对象的个人身份', '城市测量地点', '研究结束的日期'), [L('2023-12-1', 'p-5-8', 'funding'), R('2026-06-3', 'p-part3-section-c-2-7', 'funding')], [
    confuse('grant', '/ɡrɑːnt/', '一笔指定用途的资助款', 'a grant 是一笔可数的资助。funding 可以概括多笔资助以及其他经费来源。', 'The museum received a grant to repair the roof.', '博物馆获得一笔修缮屋顶的资助。', '/ɡrænt/'),
    confuse('budget', '/ˈbʌdʒɪt/', '预算；预先安排的开支额度', 'budget 是计划能花多少钱。funding 是项目实际可以争取或使用的经费。', 'The team completed the work within its budget.', '团队在预算范围内完成了工作。'),
  ]),

  card({
    id: 'government', ipa: '/ˈɡʌvənmənt/', ipaUS: '/ˈɡʌvərnmənt/', pos: 'n.', theme: '制度与公共事务',
    meaning: '负责治理一国或地区的政府机构', collocation: 'receive government support',
    sentence: 'The government asked local councils to publish their spending figures.',
    translation: '政府要求地方议会公开支出数据。',
    context: 'asked local councils 表明政府机构向地方机构提出了要求。', hint: 'central government 是中央政府，local government 是地方政府。',
  }, read('地方议会统计员', '公布后的支出数据', '参与调查的居民'), [L('2023-06-1', 'p-12-3', 'government'), L('2025-12-1', 'p-1-4', 'government')], [
    confuse('administration', '/ədˌmɪnɪˈstreɪʃən/', '行政当局；管理部门', 'the current administration 常指当前执政团队。government 还可指更广的治理机构。', 'The new administration revised its housing policy.', '新一届行政当局修订了住房政策。'),
    confuse('parliament', '/ˈpɑːləmənt/', '议会', 'parliament 是立法和审议的机构。government 在这里指管理公共事务的政府。', 'Parliament debated the proposal on Tuesday.', '议会周二就该提案展开辩论。', '/ˈpɑːrləmənt/'),
  ]),
  card({
    id: 'grant', ipa: '/ɡrɑːnt/', ipaUS: '/ɡrænt/', pos: 'n.', theme: '研究与资助',
    past: 'granted', participle: 'granted', meaning: '供某项活动使用的一笔资助', collocation: 'apply for a research grant',
    sentence: 'The team applied for a grant to cover the cost of fieldwork.',
    translation: '团队申请了一笔资助，以支付实地调查的费用。',
    context: 'applied for 和 cover the cost 说明该款项需申请，且用途明确。', hint: 'apply for a grant 是申请资助。win a grant 是获得资助。',
  }, listen('实地调查的问卷', '获准休假的日期', '团队分摊费用的约定'), [R('2023-12-1', 'p-part3-section-c-2-7', 'grants')], [
    confuse('loan', '/ləʊn/', '贷款；借出的钱', 'a loan 通常须偿还。a grant 在满足资助条件时通常无需偿还。', 'She took out a loan to buy the equipment.', '她贷款购买了这台设备。', '/loʊn/'),
    near('subsidy', '/ˈsʌbsədi/', '补贴', 'subsidy 常指为降低成本或扶持行业而提供的补贴。a research grant 多指获批后用于特定研究的一笔经费。', 'The subsidy helps farmers pay for irrigation.', '这项补贴帮助农民支付灌溉费用。'),
  ], [
    { id: 'officially-give', pos: 'v.', meaning: '正式授予或批准', collocation: 'grant access to the archives',
      example: 'The museum granted researchers access to its private archives.', translation: '博物馆批准研究人员查阅其非公开档案。',
      context: 'museum 有权批准访问。grant 后接获准的人及获准使用的权限。',
      evidence: [L('2023-06-1', 'p-12-3', 'granted')] },
    { id: 'assume-without-question', pos: '短语', meaning: '把某件事视为理所当然', collocation: 'take a reliable bus service for granted',
      example: 'We took the bus service for granted until it was suspended.', translation: '直到公交线路停运，我们才意识到它并非理所当然会开着。',
      context: 'until it was suspended 说明以往没留意服务可能中断。take ... for granted 表示不再想到其来之不易或不确定。',
      evidence: [L('2025-06-2', 'p-22-4', 'granted'), R('2023-06-2', 'p-part3-section-c-1-2', 'granted')] },
  ]),
  card({
    id: 'hardship', ipa: '/ˈhɑːdʃɪp/', ipaUS: '/ˈhɑːrdʃɪp/', pos: 'n.', theme: '经济与社会',
    meaning: '生活中难以忍受的困苦或艰难处境', collocation: 'face financial hardship',
    sentence: 'Many families faced financial hardship when the factory closed.',
    translation: '工厂关停后，许多家庭陷入经济困境。',
    context: 'factory closed 给出收入可能下降的原因。financial hardship 表示经济上难以维持的处境。', hint: 'economic hardship 与 financial hardship 都常用来描述经济困苦。',
  }, read('厂房改造的技术要求', '家庭储蓄的增加', '工厂关停的行政流程'), [R('2024-06-2', 'p-part3-section-c-1-3', 'hardship'), R('2025-06-1', 'p-part3-section-c-8', 'hardships')], [
    near('difficulty', '/ˈdɪfɪkəlti/', '困难；难题', 'difficulty 可以小到解一道题遇到困难。hardship 通常指持续或严重到影响生活的困苦。', 'She had difficulty opening the file.', '她在打开文件时遇到了困难。'),
    confuse('poverty', '/ˈpɒvəti/', '贫困', 'poverty 着重缺乏维持生活所需的资源。hardship 也可指疾病、失业等带来的其他困苦。', 'The programme helps families living in poverty.', '这个项目帮助生活贫困的家庭。', '/ˈpɑːvərt̬i/'),
  ]),
  card({
    id: 'household', ipa: '/ˈhaʊshəʊld/', ipaUS: '/ˈhaʊshoʊld/', pos: 'n.', theme: '消费与家庭',
    meaning: '同住的一户人家；一户', collocation: 'measure average household spending',
    sentence: 'The survey asked each household how much it spent on electricity.',
    translation: '调查询问每户人家的电费支出。',
    context: 'each household 是调查和统计的单位，it 指同住的一户人家。', hint: 'household income 是家庭总收入，按户统计时不一定只包括有亲属关系的人。',
  }, listen('一家电力企业', '一间可出租的卧室', '一次电费结算'), [L('2025-12-1', 'p-12-1', 'household')], [
    confuse('family', '/ˈfæməli/', '家人；家庭', 'family 可指分别住在几处的家人。household 按共同居住来划分。', 'Her family lives in three different cities.', '她的家人住在三个不同的城市。'),
    confuse('residence', '/ˈrezɪdəns/', '住所；居住地', 'residence 是供居住的地点。household 指住在一起的人，也可包括一个人单独居住。', 'Please enter your current residence on the form.', '请在表格上填写现居住地。'),
  ], [
    { id: 'for-use-at-home', pos: 'adj.', meaning: '家庭用的；日常家务所用的', collocation: 'buy household cleaning products',
      example: 'The shop sells household appliances such as kettles and fans.', translation: '这家商店出售水壶和风扇等家用电器。',
      context: 'household 作定语修饰 appliances，说明这些设备是供家庭使用的。',
      evidence: [L('2025-12-2', 'p-12-2', 'household'), L('2022-12-1', 'p-19-1', 'household')] },
  ]),
  card({
    id: 'infrastructure', ipa: '/ˈɪnfrəˌstrʌktʃə/', ipaUS: '/ˈɪnfrəˌstrʌktʃər/', pos: 'n.', theme: '城市与公共服务',
    meaning: '支撑地区或组织运转的基础设施和系统', collocation: 'invest in transport infrastructure',
    sentence: 'The region needs better transport infrastructure to connect small towns with the port.',
    translation: '该地区需要更好的交通基础设施，把小镇与港口连接起来。',
    context: 'connect small towns with the port 指道路或铁路等系统要承担的功能。', hint: 'transport infrastructure 指交通基础设施。digital infrastructure 可指网络等基础系统。',
  }, write('支撑地区或组织运转的基础设施和系统，以 i 开头', '投资交通基础设施', 'invest in transport infrastructure', 'invest in transportation infrastructure'), [L('2021-06-1', 'p-22-6', 'infrastructure'), R('2024-06-1', 'p-part3-section-c-2-8', 'infrastructure')], [
    confuse('facility', '/fəˈsɪləti/', '为某个用途建设的场所或设施', 'a storage facility 是一处仓储设施。infrastructure 可以概括支撑运输或生产的一整套系统。', 'The port opened a new storage facility.', '港口启用了一座新的仓储设施。', '/fəˈsɪlət̬i/'),
    confuse('utility', '/juːˈtɪləti/', '公用事业；水、电等服务', 'water and electricity utilities 是具体的公共服务。infrastructure 可涵盖提供这些服务所需的管线和电网。', 'The rent does not include utilities.', '房租不包含水电等公用事业费用。', '/juːˈtɪlət̬i/'),
  ]),
  card({
    id: 'initiative', ipa: '/ɪˈnɪʃətɪv/', ipaUS: '/ɪˈnɪʃət̬ɪv/', pos: 'n.', theme: '组织与行动',
    meaning: '为解决问题或推动改变而开展的一项行动', collocation: 'launch a new initiative',
    sentence: 'The library launched an initiative to make its services easier to use.',
    translation: '图书馆发起了一项行动，使各项服务更便于使用。',
    context: 'launched 表示新措施开始实施。to make ... 说明此举希望解决的问题。', hint: 'launch an initiative 常用于报道机构发起新行动。',
  }, read('原来的借阅规则', '来馆人员的名单', '系统发生的一次故障'), [R('2025-06-3', 'p-part3-section-c-1-3', 'initiative'), R('2025-12-2', 'p-part3-section-b-10', 'initiative')], [
    confuse('proposal', '/prəˈpəʊzəl/', '提议；待考虑的方案', 'proposal 可能仍等待讨论。launch an initiative 指已经把一项新行动发起。', 'The board discussed a proposal to extend opening hours.', '董事会讨论了延长开放时间的提议。', '/prəˈpoʊzəl/'),
    near('scheme', '/skiːm/', '有组织的计划或项目', '英式英语的 a training scheme 可指已经组织好的培训项目。initiative 常强调为推动改变而新发起。', 'The council runs a scheme to help new cyclists.', '市议会开办了一个帮助新手骑行者的项目。'),
  ], [
    { id: 'act-independently', pos: 'n.', meaning: '主动性；主动采取行动的能力或意愿', collocation: 'take the initiative',
      example: 'She took the initiative and booked a room before anyone asked.', translation: '她主动订了房间，无须别人开口。',
      context: 'before anyone asked 表明她没有等别人发出指令。take the initiative 表示主动开始行动。',
      evidence: [L('2021-12-1', 'p-22-3', 'initiative')] },
  ]),
  card({
    id: 'instruction', form: 'instructions', ipa: '/ɪnˈstrʌkʃən/', pos: 'n.', theme: '学习与操作',
    meaning: '告诉人如何操作的指示或说明', collocation: 'follow the instructions carefully',
    sentence: 'Follow the instructions on the label before using the cleaner.',
    translation: '使用清洁剂前，请按标签上的说明操作。',
    context: 'on the label 指说明的来源，before using 指应先看具体使用步骤。', hint: '操作说明常用复数 instructions。',
  }, listen('产品价格的变化', '清洁剂的气味', '购买地点的建议'), [R('2023-12-3', 'p-part3-section-b-7', 'instructions')], [
    confuse('guidance', '/ˈɡaɪdəns/', '指导；建议', 'guidance 可以提供总体建议。instructions 通常告诉人具体要做什么或如何操作。', 'New staff receive guidance from a mentor.', '新员工会得到导师指导。'),
    confuse('rule', '/ruːl/', '规定；规则', 'rule 指必须或不得做某事的规定。instructions 多按步骤告诉人怎么完成任务。', 'The rules prohibit food in the laboratory.', '规则禁止带食物进入实验室。'),
  ], [
    { id: 'teaching', pos: 'n.', meaning: '教学；授课', collocation: 'receive individual instruction',
      example: 'The course combines group lessons with individual instruction.', translation: '这门课把小组课和个别指导结合起来。',
      context: 'group lessons 和 individual instruction 都是教学形式。instruction 此处通常不可数。',
      evidence: [R('2024-12-3', 'p-part3-section-c-2-3', 'instruction'), R('2025-06-1', 'p-part3-section-c-2', 'instruction')] },
  ]),
  card({
    id: 'insurance', ipa: '/ɪnˈʃʊərəns/', ipaUS: '/ɪnˈʃʊrəns/', pos: 'n.', theme: '风险与保障',
    meaning: '通过合同为特定损失或风险提供的保险', collocation: 'take out travel insurance',
    sentence: 'Check whether your insurance covers the cost of emergency treatment abroad.',
    translation: '请检查你的保险是否承保在国外接受急诊治疗的费用。',
    context: 'covers the cost 表示按约定承担费用。emergency treatment 说明这里讨论的一种保障范围。', hint: 'take out insurance 是投保，health insurance 是健康保险。',
  }, listen('医院的治疗流程', '办理出国手续的费用', '用于支付机票的折扣'), [L('2022-06-1', 'p-16-4', 'insurance')], [
    confuse('assurance', '/əˈʃʊərəns/', '保证；使人放心的承诺', 'assurance 常指口头或书面的保证。insurance 是基于保险合同的风险保障。', 'The landlord gave us an assurance that the repairs would be made.', '房东向我们保证会进行维修。', '/əˈʃʊrəns/'),
    confuse('premium', '/ˈpriːmiəm/', '保险费；额外费用', 'premium 是为取得保险保障而支付的钱。insurance 是获得的保障或相关合同。', 'The annual premium increased by ten percent.', '年保费上涨了百分之十。'),
  ]),
  card({
    id: 'integrate', ipa: '/ˈɪntɪɡreɪt/', ipaUS: '/ˈɪntəɡreɪt/', pos: 'v.', theme: '研究与技术',
    past: 'integrated', participle: 'integrated', meaning: '把各部分整合成能协同工作的整体', collocation: 'integrate data from different sources',
    sentence: 'The team built a tool to integrate data from several sensors.',
    translation: '团队开发了一个工具，将几种传感器的数据整合起来。',
    context: 'several sensors 指不同来源。integrate 表示让数据进入同一个可用系统。', hint: 'integrate A with B 表示整合两者。integrate A into B 强调把 A 纳入 B。',
  }, write('把各部分整合成能协同工作的整体，以 i 开头', '整合来自不同来源的数据', 'integrate data from different sources', 'integrate data from multiple sources'), [L('2023-12-2', 'p-12-1', 'integrate'), R('2022-12-2', 'p-part3-section-a-2', 'integrates')], [
    near('combine', '/kəmˈbaɪn/', '合并；结合', 'combine 可用于把几项内容放到一起。integrate 更强调各部分成为可共同工作的整体。', 'The report combines results from two surveys.', '报告合并了两次调查的结果。'),
    confuse('include', '/ɪnˈkluːd/', '包括', 'include A 只说明整体里有 A。integrate A into a system 表示 A 被纳入并能参与系统运作。', 'The course includes a unit on data analysis.', '课程包括一个数据分析单元。'),
  ]),
  card({
    id: 'interview', ipa: '/ˈɪntəvjuː/', ipaUS: '/ˈɪntərvjuː/', pos: 'n.', theme: '沟通与求职',
    past: 'interviewed', participle: 'interviewed', meaning: '通过提问了解某人的面谈、访谈或面试', collocation: 'attend a job interview',
    sentence: 'At the interview, the panel asked her to describe a difficult decision.',
    translation: '面试时，评审小组请她描述一次难作的决定。',
    context: 'the panel asks questions，结合求职语境可知 interview 指用于评估候选人的面试。', hint: 'job interview 是求职面试。an interview with a researcher 可指采访。',
  }, listen('已经签订的劳动合同', '用来记录支出的表格', '结束后的书面通知'), [L('2026-06-1', 'p-9-4', 'interview'), L('2021-12-1', 'p-22-1', 'interview')], [
    confuse('meeting', '/ˈmiːtɪŋ/', '会议；会面', 'meeting 可以是多人讨论问题。interview 往往有明确的提问者和受访者。', 'The team held a short meeting before work.', '团队上班前开了个短会。'),
    confuse('questionnaire', '/ˌkwestʃəˈneə/', '问卷', 'questionnaire 是供填写的一组问题。interview 允许提问者根据回答继续追问。', 'The students filled out a short questionnaire.', '学生填写了一份简短的问卷。', '/ˌkwestʃəˈner/'),
  ], [
    { id: 'do-in-an-interview', pos: 'v.', meaning: '参加面试并表现得怎样', collocation: 'interview well',
      example: 'He interviewed well even though he had little experience.', translation: '尽管经验不多，他在面试中表现得不错。',
      context: '主语是参加面试的人，well 说明他的表现。这和 interview an applicant 的及物用法不同。',
      evidence: [L('2025-06-2', 'p-1-5', 'interviewed')] },
  ]),

  card({
    id: 'labor', ipa: '/ˈleɪbə/', ipaUS: '/ˈleɪbər/', pos: 'n.', theme: '经济与劳动', spellingAliases: ['labour'],
    meaning: '用于生产或完成任务的劳动', collocation: 'reduce labor costs',
    sentence: 'The new machine reduced the amount of manual labor needed on the farm.',
    translation: '新机器减少了农场所需的体力劳动。',
    context: 'manual 限定需要动手做的工作，the amount of 衡量需要投入的劳动量。', hint: 'labor costs 是劳动力成本，unpaid labor 是无偿劳动。英式常写 labour。',
  }, write('用于生产或完成任务的劳动，以 l 开头', '降低劳动力成本', 'reduce labor costs', 'reduce labour costs', 'cut labor costs', 'cut labour costs', 'lower labor costs', 'lower labour costs'), [L('2025-06-1', 'p-12-3', 'labor'), R('2025-06-2', 'p-part3-section-c-2-8', 'labor')], [
    near('work', '/wɜːk/', '工作；劳动', 'work 很通用，可指日常任务或就业。labor 在经济讨论中常把劳动看作投入，也可指费力工作。', 'There is still a lot of work to do.', '还有很多工作要做。', '/wɝːk/'),
    confuse('workforce', '/ˈwɜːkfɔːs/', '劳动力队伍；员工总数', 'workforce 指从事工作的人。labor 在 labor costs 或 unpaid labor 中主要指人付出的劳动。', 'Nearly half the workforce is based outside the capital.', '近半数员工在首都以外工作。', '/ˈwɝːkfɔːrs/'),
  ]),
  card({
    id: 'leadership', ipa: '/ˈliːdəʃɪp/', ipaUS: '/ˈliːdərʃɪp/', pos: 'n.', theme: '组织与协作',
    meaning: '带领和组织他人行动的能力或工作', collocation: 'develop leadership skills',
    sentence: 'The role helped her develop leadership skills by supervising a small team.',
    translation: '这个岗位让她带领一个小组，从中培养了领导能力。',
    context: 'supervising a small team 说明实践是带领团队。leadership skills 是指挥、协调与引导所需的技能。', hint: 'leadership skills 指领导技能，a leadership role 是领导岗位。',
  }, write('带领和组织他人行动的能力或工作，以 l 开头', '培养领导能力', 'develop leadership skills', 'build leadership skills'), [L('2022-12-1', 'p-12-1', 'leadership'), R('2025-12-2', 'p-part3-section-b-16', 'leadership')], [
    confuse('management', '/ˈmænɪdʒmənt/', '管理；管理层', 'management 常包括配置资源和安排工作流程。leadership 更强调确立方向、带动团队。', 'Good time management made the project easier to complete.', '妥善管理时间让项目更容易完成。'),
    confuse('authority', '/ɔːˈθɒrəti/', '权力；职权', 'authority 说明谁有权决定。leadership 还体现说服和引导他人合作的能力。', 'The supervisor has the authority to approve the purchase.', '主管有权批准这项采购。', '/əˈθɔːrət̬i/'),
  ]),
  card({
    id: 'legal', ipa: '/ˈliːɡəl/', pos: 'adj.', theme: '法律与社会',
    meaning: '与法律、法律程序或法律权利有关的', collocation: 'seek legal advice',
    sentence: 'The tenants sought legal advice before signing the agreement.',
    translation: '租客在签订协议前寻求法律意见。',
    context: 'agreement 可能涉及双方的法律权利和义务。legal advice 指有关这些权利和义务的意见。', hint: 'legal advice 是法律咨询。作表语时 legal 还可表示合法。',
  }, listen('关于装修风格的', '来自旅行社的', '有关付款日期的'), [L('2025-06-1', 'p-5-8', 'legal'), R('2023-12-2', 'p-part3-section-b-10', 'legal')], [
    confuse('judicial', '/dʒuˈdɪʃəl/', '司法的；与法院有关的', 'legal 涵盖法律事项。judicial review 进一步限定为法院进行的司法审查。', 'The decision was challenged through judicial review.', '这一决定受到司法审查程序的挑战。'),
    opposite('illegal', '/ɪˈliːɡəl/', '违法的', 'it is legal to do 表示法律允许。it is illegal to do 表示法律禁止。', 'It is illegal to dump waste in the river.', '把废弃物倾倒进河里是违法的。'),
  ], [
    { id: 'permitted-by-law', pos: 'adj.', meaning: '法律许可的；合法的', collocation: 'be perfectly legal',
      example: 'The sign makes it clear where overnight parking is legal.', translation: '标牌说明了哪些地方允许合法过夜停车。',
      context: 'where 引出地点，is legal 表示在这些地点停车符合规定。',
      evidence: [R('2024-06-1', 'p-part3-section-b-14', 'legal'), R('2025-12-1', 'p-part3-section-b-15', 'legal')] },
  ]),
  card({
    id: 'legislation', ipa: '/ˌledʒɪsˈleɪʃən/', ipaUS: '/ˌledʒəsˈleɪʃən/', pos: 'n.', theme: '法律与制度',
    meaning: '制定的法律；涉及某事项的一套立法措施', collocation: 'pass new legislation',
    sentence: 'The assembly passed legislation to improve safety in rented homes.',
    translation: '议会通过了改善出租住房安全的立法。',
    context: 'the assembly 是通过法律的机构，to improve 指立法的目的。', hint: 'legislation 通常不可数，一项立法可说 a piece of legislation。',
  }, read('一场住房安全培训', '议会临时更换的地点', '租客填写的问卷'), [R('2026-06-1', 'p-part3-section-a-5', 'legislation'), R('2026-06-1', 'p-part3-section-c-2-8', 'legislation')], [
    confuse('regulation', '/ˌreɡjʊˈleɪʃən/', '规章；具体的监管要求', 'legislation 常指经立法程序形成的法律。regulation 可以是主管部门据此制定的具体规则。', 'The new regulation limits noise at night.', '新规定限制夜间噪声。', '/ˌreɡjəˈleɪʃən/'),
    confuse('bill', '/bɪl/', '提交立法机关审议的法案', 'a bill 常指尚待审议或表决的草案。pass legislation 指通过了立法措施。', 'The committee debated the bill on Monday.', '委员会周一审议了这项法案。'),
  ]),
  card({
    id: 'literacy', ipa: '/ˈlɪtərəsi/', ipaUS: '/ˈlɪt̬ərəsi/', pos: 'n.', theme: '教育与能力',
    meaning: '识字和读写的能力', collocation: 'improve adult literacy',
    sentence: 'The centre offers evening classes to improve adult literacy.',
    translation: '该中心开设夜间课程，以提高成人的读写能力。',
    context: 'adult 指培训对象，improve literacy 表示提高阅读和书写的基本能力。', hint: 'literacy standards 是读写能力标准。digital literacy 指运用数字技术和信息的能力。',
  }, write('识字和读写的能力，以 l 开头', '提高成人读写能力', 'improve adult literacy', 'raise adult literacy'), [R('2023-06-1', 'p-part3-section-c-2-4', 'literacy'), R('2022-12-2', 'p-part3-section-c-2-9', 'literacy')], [
    confuse('literature', '/ˈlɪtrətʃə/', '文学；某领域的文献', 'literacy 是读写能力。literature 是作品或文献，可以作为阅读材料。', 'The seminar introduces modern British literature.', '研讨课介绍英国现代文学。', '/ˈlɪt̬ərətʃɚ/'),
    confuse('numeracy', '/ˈnjuːmərəsi/', '基本运算和理解数字的能力', 'numeracy 强调数字能力。literacy 通常指读写能力，两者可并列为基础技能。', 'The test measures basic numeracy skills.', '该测试衡量基础计算能力。', '/ˈnuːmərəsi/'),
  ]),
  card({
    id: 'market', ipa: '/ˈmɑːkɪt/', ipaUS: '/ˈmɑːrkɪt/', pos: 'n.', theme: '经济与交易',
    past: 'marketed', participle: 'marketed', meaning: '某类商品、服务或劳动力的供需市场', collocation: 'enter the domestic market',
    sentence: 'The company is testing the new product before entering the overseas market.',
    translation: '公司在进入海外市场前先测试这款新产品。',
    context: 'entering 指开始在这一范围内销售，overseas 说明潜在交易对象在海外。', hint: 'job market 是就业市场，a gap in the market 指尚未满足的一类市场需求。',
  }, read('供游客参观的景点', '公司内部测试流程', '海关使用的设备'), [L('2022-06-1', 'p-5-9', 'market'), L('2024-12-2', 'p-5-6', 'market')], [
    confuse('industry', '/ˈɪndəstri/', '行业；产业', 'industry 从生产和经营者着眼。market 还强调买卖双方和供需。', 'The industry employs thousands of people.', '这个行业雇用了数千人。'),
    confuse('demand', '/dɪˈmɑːnd/', '需求', 'demand 是市场中有多少人愿意购买。market 还包括供给、交易条件和市场范围。', 'Demand for the new service grew quickly.', '对新服务的需求迅速增加。', '/dɪˈmænd/'),
  ], [
    { id: 'physical-marketplace', pos: 'n.', meaning: '集市；集中买卖商品的地方', collocation: 'buy vegetables at the local market',
      example: 'We buy seasonal vegetables at the market on Saturdays.', translation: '我们周六在集市上买时令蔬菜。',
      context: 'at the market 指交易发生的地点，on Saturdays 指集市采购的时间。',
      evidence: [L('2022-12-1', 'p-19-5', 'markets'), R('2025-06-1', 'p-part3-section-b-5', 'market')] },
    { id: 'promote-for-sale', pos: 'v.', meaning: '推广并销售产品', collocation: 'market the device to hospitals',
      example: 'The company plans to market the device to small clinics.', translation: '公司计划向小型诊所推广销售这台设备。',
      context: 'plans to 后需要动词，the device 是推广销售对象，to small clinics 给出目标客户。' },
  ]),
  card({
    id: 'marketing', ipa: '/ˈmɑːkɪtɪŋ/', ipaUS: '/ˈmɑːrkət̬ɪŋ/', pos: 'n.', theme: '经济与传播',
    meaning: '了解需求并向目标人群推广产品或服务的活动', collocation: 'develop a marketing strategy',
    sentence: 'The team changed its marketing strategy after speaking to potential customers.',
    translation: '团队与潜在顾客交流后调整了营销策略。',
    context: 'potential customers 是计划接触的购买群体，strategy 指了解需求并推广产品的安排。', hint: 'marketing strategy 是营销策略，marketing department 是营销部门。',
  }, write('了解需求并向目标人群推广产品或服务的活动，以 m 开头', '制定营销策略', 'develop a marketing strategy', 'create a marketing strategy', 'formulate a marketing strategy'), [L('2023-06-1', 'p-19-1', 'Marketing'), L('2022-12-1', 'p-16-2', 'marketing')], [
    confuse('advertising', '/ˈædvətaɪzɪŋ/', '广告宣传', 'advertising 是利用广告宣传的活动。marketing 还包括调查需求、确定客户群体和价格等。', 'The store spent more on online advertising this year.', '这家商店今年在网络广告上花的钱更多。', '/ˈædvərtaɪzɪŋ/'),
    confuse('sales', '/seɪlz/', '销售；销售额', 'sales 常指达成交易的工作或成交金额。marketing 重点包括理解需求和吸引顾客。', 'Online sales rose during the holiday period.', '假期期间线上销售额有所上升。'),
  ]),
  card({
    id: 'medicine', ipa: '/ˈmedɪsən/', ipaUS: '/ˈmedəsən/', pos: 'n.', theme: '健康与职业',
    meaning: '医学；诊断、治疗和预防疾病的学科或实践', collocation: 'study medicine at university',
    sentence: 'He decided to study medicine after volunteering at a local clinic.',
    translation: '在当地一家诊所做过志愿者后，他决定学医。',
    context: 'study 指选择学习的学科，clinic 给出接触医疗实践的场景。', hint: 'study medicine 指学医。take medicine 通常指吃药。',
  }, listen('在诊所接受的治疗', '志愿服务的时间表', '为病人购买的设备'), [L('2024-12-1', 'p-5-1', 'medicine'), R('2023-06-1', 'p-part3-section-b-3', 'medicine')], [
    confuse('treatment', '/ˈtriːtmənt/', '治疗；疗法', 'treatment 是为某种疾病实施的具体治疗或疗程。medicine 还可指相关学科和专业实践。', 'The patient received treatment for a knee injury.', '患者接受了膝伤治疗。'),
    confuse('medication', '/ˌmedɪˈkeɪʃən/', '用于治疗疾病的药物', 'medication 着重为治疗而用的药物。medicine 既能指药物，也能表示学科。', 'Tell the nurse if you take any regular medication.', '如果你定期服用药物，请告诉护士。'),
  ], [
    { id: 'treatment-drug', pos: 'n.', meaning: '药物；药品', collocation: 'take medicine after meals',
      example: 'The label explains when to take the medicine.', translation: '标签说明了该在什么时候服药。',
      context: 'label 和 take 表明这里是要按要求服用的药品。' },
  ]),
  card({
    id: 'migration', ipa: '/maɪˈɡreɪʃən/', pos: 'n.', theme: '人口与环境',
    meaning: '人口或动物从一个地区迁往另一个地区', collocation: 'study patterns of migration',
    sentence: 'Migration to coastal cities increased as new ports created jobs.',
    translation: '随着新港口创造就业机会，迁往沿海城市的人更多了。',
    context: 'to coastal cities 给出迁移方向，jobs 说明吸引人口迁入的原因。', hint: 'migration 是迁移这一过程。rural-to-urban migration 指由农村迁往城市。',
  }, read('港口的货物装卸', '农村地区的物价变化', '海岸线因侵蚀而后退'), [L('2023-06-1', 'p-12-3', 'migration')], [
    confuse('immigration', '/ˌɪmɪˈɡreɪʃən/', '从国外迁入定居', 'immigration 从迁入国看人口跨国移居。migration 还包括同一国内的人口迁移及动物迁徙。', 'Immigration contributed to the city’s growth.', '移民迁入推动了这座城市的发展。'),
    confuse('commuting', '/kəˈmjuːtɪŋ/', '往返于住所与工作地点', 'commuting 指经常往返上班。migration 指迁移到另一地区，常会改变居住地。', 'The new railway cut commuting time.', '新铁路缩短了通勤时间。'),
  ]),
  card({
    id: 'minority', ipa: '/maɪˈnɒrəti/', ipaUS: '/maɪˈnɔːrət̬i/', pos: 'n.', theme: '数据与社会',
    meaning: '人数或数量较少的一部分', collocation: 'a small minority of respondents',
    sentence: 'Only a small minority chose to answer the optional question.',
    translation: '只有一小部分人选择回答这道选答题。',
    context: 'only 与 small 表明人数少。minority 指在全体人中占少数的一部分。', hint: 'a minority of participants 表示少数参与者，minority group 指少数群体。',
  }, listen('被要求回答的全体人员', '一半左右的参与者', '人数最多的一组人'), [L('2025-12-1', 'p-12-1', 'minority'), L('2021-06-1', 'p-16-1', 'minority')], [
    opposite('majority', '/məˈdʒɒrəti/', '多数；超过一半的部分', 'majority 表示数量过半。minority 指数量较少的一方。', 'A majority of voters supported the measure.', '多数投票者支持该措施。', '/məˈdʒɔːrət̬i/'),
    confuse('proportion', '/prəˈpɔːʃən/', '部分所占的比例', 'proportion 可以大也可以小。minority 已明确说的是占少数的一部分。', 'The proportion of online orders rose last year.', '去年线上订单的比例提高了。', '/prəˈpɔːrʃən/'),
  ], [
    { id: 'social-group', pos: 'n.', meaning: '社会中的少数群体', collocation: 'support ethnic minorities',
      example: 'The museum asked minority groups to help plan the exhibition.', translation: '博物馆邀请少数群体参与策划这次展览。',
      context: 'groups 指在社会中具有相同文化、族裔等特征的一些人，而非一次调查的少数选项。',
      evidence: [R('2025-06-1', 'p-part3-section-b-6', 'minority'), R('2026-06-1', 'p-part3-section-a-3', 'minorities')] },
  ]),

  card({
    id: 'national', ipa: '/ˈnæʃənəl/', pos: 'adj.', theme: '制度与公共事务',
    meaning: '国家的；覆盖全国范围的', collocation: 'introduce national standards',
    sentence: 'National standards help schools across the country assess reading skills consistently.',
    translation: '全国性标准帮助各地学校采用一致的方式评估阅读能力。',
    context: 'across the country 写明适用范围。national 修饰 standards，表示这套标准面向全国。', hint: 'national policy 指国家政策。national parks 常指国家公园。',
  }, write('国家的；覆盖全国范围的，以 n 开头', '引入全国性标准', 'introduce national standards', 'bring in national standards'), [L('2022-12-2', 'p-16-2', 'national')], [
    opposite('local', '/ˈləʊkəl/', '本地的；地方的', 'a local policy 只在某地实施。a national policy 面向国家范围。', 'The local library closes on Mondays.', '本地图书馆每周一闭馆。', '/ˈloʊkəl/'),
    confuse('international', '/ˌɪntəˈnæʃənəl/', '国际的；涉及多个国家的', 'national standards 属于一国或面向全国。international standards 通常面向多个国家。', 'The team followed an international safety standard.', '团队遵守了一项国际安全标准。', '/ˌɪntərˈnæʃənəl/'),
  ]),
  card({
    id: 'network', ipa: '/ˈnetwɜːk/', ipaUS: '/ˈnetwɝːk/', pos: 'n.', theme: '联系与组织',
    past: 'networked', participle: 'networked', meaning: '由相互联系的人或机构构成的关系网', collocation: 'build a professional network',
    sentence: 'Volunteering helped her build a network of contacts in the local community.',
    translation: '志愿服务帮助她在当地社区建立了一个人脉网络。',
    context: 'of contacts 指网络由各个有联系的人组成。build 表示逐步建立这些联系。', hint: 'a network of contacts 指人脉网，social network 可指社会关系网络。',
  }, read('志愿者的值班表', '当地社区的建筑图纸', '用于统计工时的软件'), [L('2026-06-1', 'p-1-2', 'network'), R('2025-06-1', 'p-part3-section-c-2-8', 'networks')], [
    confuse('contact', '/ˈkɒntækt/', '有联系的人；联系', 'a contact 可以指单个联系人。a network 是多个联系人构成的关系网。', 'I asked a contact at the museum for advice.', '我向博物馆的一位联系人请教了意见。', '/ˈkɑːntækt/'),
    confuse('community', '/kəˈmjuːnəti/', '因地点或共同兴趣联系在一起的群体', 'community 可强调共同归属。network 更强调成员之间的实际联系及这些联系如何连接。', 'The local community helped raise money for the clinic.', '当地社区帮助诊所筹款。', '/kəˈmjuːnət̬i/'),
  ], [
    { id: 'interconnected-system', pos: 'n.', meaning: '相互连接的道路、设备或线路系统', collocation: 'extend the rail network',
      example: 'The town joined the regional rail network after a new line opened.', translation: '一条新线路开通后，该镇接入了区域铁路网。',
      context: 'a new line 说明把一条线路接进其他线路。rail network 概括相互连接的铁路线路。',
      evidence: [R('2023-12-1', 'p-part3-section-a-3', 'network')] },
    { id: 'make-connections', pos: 'v.', meaning: '与人建立职业或社会联系', collocation: 'network with people in the industry',
      example: 'The conference gave students a chance to network with local employers.', translation: '会议让学生有机会和当地雇主建立联系。',
      context: 'with local employers 指希望结识的人。network 作动词表示主动建立职业联系。',
      evidence: [L('2021-06-1', 'p-1-7', 'network')] },
  ]),
  card({
    id: 'ordinary', ipa: '/ˈɔːdənəri/', ipaUS: '/ˈɔːrdəneri/', pos: 'adj.', theme: '社会与日常',
    meaning: '普通的；没有特殊身份、条件或特征的', collocation: 'ordinary members of the public',
    sentence: 'The project was designed for ordinary readers without specialist training.',
    translation: '这个项目面向没有受过专业训练的普通读者。',
    context: 'without specialist training 表明读者不必是专家。ordinary 指一般的公众成员。', hint: 'ordinary people 指普通人，ordinary equipment 指普通设备。',
  }, listen('受过专门培训的', '担任项目管理的', '已经完成测试的'), [L('2023-12-2', 'p-12-1', 'ordinary'), L('2024-06-1', 'p-5-6', 'ordinary')], [
    confuse('typical', '/ˈtɪpɪkəl/', '典型的；具有代表性的', 'typical example 说明能代表一类情况。ordinary example 仅表示这一例子并无特殊之处。', 'The drawing shows a typical house of the period.', '图中是一座那个时期的典型房屋。'),
    confuse('normal', '/ˈnɔːməl/', '正常的；符合预期的', 'normal results 在预期范围内。ordinary people 指没有特殊身份的人，侧重点不在是否符合标准。', 'It is normal to feel nervous before an interview.', '面试前感到紧张很正常。', '/ˈnɔːrməl/'),
  ]),
  card({
    id: 'organization', ipa: '/ˌɔːɡənaɪˈzeɪʃən/', ipaUS: '/ˌɔːrɡənəˈzeɪʃən/', pos: 'n.', theme: '机构与协作', spellingAliases: ['organisation'],
    meaning: '为共同目的而建立的组织或机构', collocation: 'work for a nonprofit organization',
    sentence: 'A nonprofit organization trained volunteers to help new arrivals.',
    translation: '一家非营利组织培训志愿者，以帮助新来的人。',
    context: 'nonprofit 说明机构的性质，trained volunteers 表明它组织人力执行公益活动。', hint: 'organization 可数时常指机构。英式也写 organisation。',
  }, write('为共同目的而建立的组织或机构，以 o 开头', '非营利组织', 'a nonprofit organization', 'nonprofit organization', 'a nonprofit organisation', 'nonprofit organisation', 'a non-profit organization', 'non-profit organization', 'a non-profit organisation', 'non-profit organisation'), [L('2024-06-1', 'p-19-2', 'organizations'), R('2025-06-1', 'p-part3-section-a-1', 'organization')], [
    confuse('institution', '/ˌɪnstɪˈtjuːʃən/', '机构；长期存在的社会制度', 'institution 常指大学或其他长期发挥特定社会作用的机构。organization 也包括刚成立的志愿团体。', 'The university is a major research institution.', '这所大学是重要的研究机构。', '/ˌɪnstəˈtuːʃən/'),
    confuse('association', '/əˌsəʊsiˈeɪʃən/', '协会；因共同利益结成的团体', 'association 常由有共同职业或兴趣的会员组成。organization 是更宽泛的称呼。', 'She joined an association for local historians.', '她加入了当地历史研究者协会。', '/əˌsoʊsiˈeɪʃən/'),
  ], [
    { id: 'arrangement', pos: 'n.', meaning: '有条理地安排工作的过程或能力', collocation: 'improve the organization of a meeting',
      example: 'Good organization helped us serve lunch to everyone on time.', translation: '组织安排得当，我们按时为所有人提供了午餐。',
      context: 'good organization 指安排流程和分配任务的方式。句中说的是组织能力。',
      evidence: [L('2025-06-2', 'p-19-2', 'organization'), L('2025-06-2', 'p-19-5', 'organization')] },
  ]),
  card({
    id: 'ownership', ipa: '/ˈəʊnəʃɪp/', ipaUS: '/ˈoʊnərʃɪp/', pos: 'n.', theme: '财产与制度',
    meaning: '对财产或物品拥有的权利或状态', collocation: 'transfer ownership of the property',
    sentence: 'The two sides signed a document to transfer ownership of the building.',
    translation: '双方签署了转移该建筑所有权的文件。',
    context: 'transfer 表示把权利从一方转给另一方。of the building 指产权对应的财产。', hint: 'ownership of + 物，指该物归谁所有。',
  }, read('两边各自使用的楼层', '物业的维修费用', '办理手续需要的时间'), [R('2024-06-1', 'p-part3-section-b-3', 'ownership'), R('2024-06-1', 'p-part3-section-b-7', 'ownership')], [
    confuse('possession', '/pəˈzeʃən/', '实际持有；占有', 'possession 强调东西由谁持有或控制。ownership 强调东西依法或实质上归谁。', 'The equipment remained in the company’s possession.', '这些设备仍由公司持有。'),
    confuse('property', '/ˈprɒpəti/', '财产；房地产', 'property 可以是建筑这项财产。ownership 是持有这项财产的所有权。', 'The property includes two small gardens.', '这处房产包含两个小花园。', '/ˈprɑːpərt̬i/'),
  ], [
    { id: 'take-responsibility', pos: '短语', meaning: '主动对事务负责', collocation: 'take ownership of a problem',
      example: 'The team took ownership of the error and corrected it quickly.', translation: '团队主动承担这个错误的责任，并迅速予以纠正。',
      context: 'corrected it 说明团队采取了行动。take ownership of a problem 是认领并负责处理问题的比喻用法。' },
  ]),
  card({
    id: 'partnership', ipa: '/ˈpɑːtnəʃɪp/', ipaUS: '/ˈpɑːrtnərʃɪp/', pos: 'n.', theme: '组织与协作',
    meaning: '各方共同工作或经营建立的合作关系', collocation: 'form a partnership with a local school',
    sentence: 'The museum formed a partnership with a local school to run history workshops.',
    translation: '博物馆与当地一所学校建立合作关系，共同举办历史工作坊。',
    context: 'with a local school 给出合作方，to run history workshops 是双方合作的目的。', hint: 'partnership with + 合作方，也可说 work in partnership with。',
  }, write('各方共同工作或经营建立的合作关系，以 p 开头', '与当地一所学校建立合作关系', 'form a partnership with a local school', 'build a partnership with a local school', 'establish a partnership with a local school'), [L('2023-06-1', 'p-12-3', 'partnerships'), R('2025-06-1', 'p-part3-section-b-3', 'partnerships')], [
    confuse('collaboration', '/kəˌlæbəˈreɪʃən/', '合作活动；合作', 'collaboration 可以是合作完成一项短任务。partnership 常强调作为伙伴的关系或安排。', 'The project was a collaboration between two laboratories.', '这个项目由两所实验室合作完成。'),
    confuse('contract', '/ˈkɒntrækt/', '合同', 'contract 载明可执行的条款。partnership 是共同工作的关系，可能有合同，也可能没有。', 'The supplier signed a three-year contract.', '供应商签订了一份三年期合同。', '/ˈkɑːntrækt/'),
  ]),
  card({
    id: 'patient', ipa: '/ˈpeɪʃənt/', pos: 'n.', theme: '医学与服务',
    meaning: '正在接受检查、护理或治疗的人', collocation: 'monitor a patient’s recovery',
    sentence: 'The nurse showed the patient how to use the new device.',
    translation: '护士给患者演示了怎样使用新设备。',
    context: 'the nurse 提供护理指导，the patient 是接受指导和医疗照护的人。', hint: 'a patient 指一位患者。作形容词时 patient 还表示有耐心。',
  }, listen('设备的制造商', '护理培训的负责人', '病房里的陪同家属'), [L('2026-06-2', 'p-5-3', 'patient'), R('2023-12-3', 'p-part3-section-b-9', 'patients')], [
    confuse('client', '/ˈklaɪənt/', '接受专业服务的客户或委托人', 'client 可用于法律或咨询服务。patient 通常指接受医疗照护的人。', 'The lawyer sent her client a copy of the document.', '律师把文件副本发给了委托人。'),
    confuse('visitor', '/ˈvɪzɪtə/', '访客；探视者', 'hospital visitor 是来探视或访问医院的人。patient 是正在接受医疗服务的人。', 'Visitors must leave the ward by eight.', '探视者必须在八点前离开病房。', '/ˈvɪzɪtər/'),
  ], [
    { id: 'able-to-wait', pos: 'adj.', meaning: '有耐心的；能平静地等候或应对困难的', collocation: 'be patient with a beginner',
      example: 'Please be patient with the new team while they learn the system.', translation: '新团队正在熟悉系统，请对他们耐心一点。',
      context: 'be 后的 patient 是形容词。while ... learn 表示应给新团队学习所需的时间。',
      evidence: [R('2023-12-1', 'p-part3-section-a-5', 'patient')] },
  ]),
  card({
    id: 'political', ipa: '/pəˈlɪtɪkəl/', ipaUS: '/pəˈlɪt̬ɪkəl/', pos: 'adj.', theme: '社会与制度',
    meaning: '与政治、公共权力或政策有关的', collocation: 'take part in political debate',
    sentence: 'The article examines the political effects of changes in local media.',
    translation: '这篇文章考察地方媒体变化造成的政治影响。',
    context: 'political 修饰 effects，表示讨论的是公共权力、政策意见或政治参与方面的影响。', hint: 'political debate 是政治讨论，political consequences 是政治后果。',
  }, read('与设备运行有关的', '与个人营养有关的', '与印刷颜色有关的'), [R('2024-06-2', 'p-part3-section-c-1-9', 'political'), R('2024-06-1', 'p-part3-section-c-2-8', 'political')], [
    confuse('politics', '/ˈpɒlətɪks/', '政治；政治活动', 'politics 是名词。修饰 decisions、effects 等名词时通常用形容词 political。', 'She became interested in politics at university.', '她在大学期间开始关注政治。', '/ˈpɑːlətɪks/'),
    confuse('partisan', '/ˌpɑːtɪˈzæn/', '偏向某一党派或立场的', 'political debate 只是政治领域的讨论。partisan debate 进一步指讨论有明显的党派立场。', 'The committee tried to avoid a partisan argument.', '委员会试图避免争论陷入党派对立。', '/ˈpɑːrtəzən/'),
  ]),
  card({
    id: 'popular', ipa: '/ˈpɒpjələ/', ipaUS: '/ˈpɑːpjələr/', pos: 'adj.', theme: '媒体与社会',
    meaning: '受到许多人喜欢或欢迎的', collocation: 'be popular with visitors',
    sentence: 'The museum’s weekend workshops are popular with local families.',
    translation: '博物馆的周末工作坊深受当地家庭欢迎。',
    context: 'with local families 给出喜欢这项活动的群体。popular 表示工作坊在这个群体中受欢迎。', hint: 'popular with 或 popular among 后可接受众群体。',
  }, listen('每周只举办一次的', '只对儿童开放的', '由家庭共同组织的'), [L('2022-12-2', 'p-16-1', 'popular'), R('2026-06-1', 'p-part3-section-b-2', 'popular')], [
    confuse('famous', '/ˈfeɪməs/', '有名的；广为人知的', 'famous 强调很多人知道。popular 进一步说明许多人喜欢、选择或支持。', 'The village is famous for its old bridge.', '这个村庄以那座古桥闻名。'),
    confuse('commonplace', '/ˈkɒmənpleɪs/', '常见的；司空见惯的', 'commonplace 强调某现象并不罕见。popular 常意味着许多人对某物持正面态度或愿意选择它。', 'Online bookings have become commonplace.', '网上预约已经司空见惯。', '/ˈkɑːmənpleɪs/'),
  ], [
    { id: 'general-public', pos: 'adj.', meaning: '面向普通公众的；通俗的', collocation: 'read a popular science book',
      example: 'She wrote a popular science book for readers with no background in physics.', translation: '她为没有物理学基础的读者写了一本科普书。',
      context: 'for readers with no background 指预期读者为普通公众。popular science 指通俗介绍科学。',
      evidence: [R('2024-12-3', 'p-part3-section-c-1-2', 'Popular')] },
  ]),

  card({
    id: 'poverty', ipa: '/ˈpɒvəti/', ipaUS: '/ˈpɑːvərt̬i/', pos: 'n.', theme: '经济与社会',
    meaning: '缺乏维持基本生活所需资源的贫困状态', collocation: 'lift people out of poverty',
    sentence: 'Affordable childcare can help parents find work and lift their families out of poverty.',
    translation: '负担得起的托育服务能帮助家长就业，使家庭摆脱贫困。',
    context: 'find work 指获得收入来源。out of poverty 表示离开难以维持基本生活的状态。', hint: 'poverty line 是贫困线，live in poverty 是生活在贫困中。',
  }, write('缺乏维持基本生活所需资源的贫困状态，以 p 开头', '使人们摆脱贫困', 'lift people out of poverty', 'help people out of poverty', 'pull people out of poverty'), [L('2024-12-2', 'p-19-3', 'poverty'), L('2021-12-1', 'p-16-4', 'poverty')], [
    confuse('inequality', '/ˌɪnɪˈkwɒləti/', '不平等；差距', 'inequality 比较群体之间的资源差距。poverty 关注一方的资源能否满足基本生活。', 'The report examines inequality in access to education.', '报告考察了教育机会的不平等。', '/ˌɪnɪˈkwɑːlət̬i/'),
    confuse('deprivation', '/ˌdeprɪˈveɪʃən/', '基本事物被剥夺或缺失的状态', 'deprivation 可指具体缺失，例如 sleep deprivation。poverty 常指整体经济处境。', 'The study looked at the effects of sleep deprivation.', '研究考察了睡眠不足的影响。'),
  ], [
    { id: 'time-scarcity', pos: '短语', meaning: '时间贫困；缺少自主可支配时间', collocation: 'experience time poverty',
      example: 'Long shifts and caring duties can leave parents experiencing time poverty.', translation: '长时间轮班和照料家人的责任可能使家长缺少可以自由支配的时间。',
      context: '轮班和照顾家人占据大量时间，poverty 在这里比喻时间资源不足。',
      evidence: [L('2025-06-1', 'p-12-4', 'poverty')] },
  ]),
  card({
    id: 'practice', ipa: '/ˈpræktɪs/', pos: 'n.', theme: '制度与学习', spellingAliases: ['practise'],
    past: 'practiced', participle: 'practiced', meaning: '实际采用或反复采用的做法', collocation: 'adopt best practices',
    sentence: 'Keeping a backup copy is standard practice in the laboratory.',
    translation: '保留备份是实验室的常规做法。',
    context: 'standard 指惯常采用，句子把备份说明为大家遵循的一项做法。', hint: 'standard practice 是常规做法，best practices 是公认的良好做法。',
  }, read('一项临时任务', '备份文件的大小', '没有实施的设想'), [L('2021-12-2', 'p-1-8', 'practices'), L('2022-12-2', 'p-16-2', 'practice')], [
    confuse('policy', '/ˈpɒlɪsi/', '政策；组织决定采用的原则', 'policy 可以写在文件中。practice 侧重实际怎么做，两者有时不一致。', 'The new policy sets limits on file sharing.', '新政策对文件共享设置了限制。', '/ˈpɑːləsi/'),
    confuse('habit', '/ˈhæbɪt/', '习惯；经常重复的行为', 'habit 常指个人习惯。practice 也可指组织或专业群体按共同约定采用的做法。', 'She developed a habit of checking the figures twice.', '她养成了把数字核对两遍的习惯。'),
  ], [
    { id: 'repeated-training', pos: 'n.', meaning: '为提高熟练程度进行的练习', collocation: 'get plenty of practice',
      example: 'With regular practice, the students became more confident speakers.', translation: '通过经常练习，学生们说话时变得更有信心。',
      context: 'regular 表示反复练习，more confident 是练习带来的结果。',
      evidence: [L('2022-06-1', 'p-12-2', 'practice')] },
    { id: 'train-a-skill', pos: 'v.', meaning: '反复练习某项技能', collocation: 'practice speaking aloud',
      example: 'I practice speaking aloud before giving a talk.', translation: '我在演讲前会出声练习。',
      context: 'I 后接动词。美式动词写 practice，英式写 practise。英式过去式和过去分词均为 practised。',
      evidence: [L('2026-06-2', 'p-16-1', 'practising')] },
  ]),
  card({
    id: 'preference', form: 'preferences', ipa: '/ˈprefərəns/', pos: 'n.', theme: '选择与消费',
    meaning: '在多个选择中更喜欢其中一种的倾向', collocation: 'take customer preferences into account',
    sentence: 'The company changed the menu to reflect customer preferences.',
    translation: '公司调整了菜单，以反映顾客的偏好。',
    context: 'changed the menu 表示根据顾客更愿意选择的菜品调整菜单。preferences 可指多项具体偏好。', hint: 'a preference for 后接更喜欢的东西。',
  }, listen('顾客填写的付款金额', '菜单改动的制作成本', '厨师的工作时间'), [L('2024-12-1', 'p-12-1', 'preferences'), L('2023-12-1', 'p-12-1', 'preferences')], [
    confuse('choice', '/tʃɔɪs/', '选择；可选择的选项', 'preference 说明更想要什么。choice 是可选的事物或最后选中的选项。', 'She made her choice after reading the reviews.', '看完评价后，她作出了选择。'),
    confuse('taste', '/teɪst/', '品味；喜好', 'taste 常指音乐、衣服等方面的一贯喜好。preference 也可用于单次决策，例如更喜欢某个时间。', 'They have very different tastes in music.', '他们的音乐品味差别很大。'),
  ]),
  card({
    id: 'purchase', ipa: '/ˈpɜːtʃəs/', ipaUS: '/ˈpɝːtʃəs/', pos: 'v.', theme: '消费与交易',
    past: 'purchased', participle: 'purchased', meaning: '付钱购买', collocation: 'purchase tickets in advance',
    sentence: 'Passengers can purchase a ticket from the machine at the entrance.',
    translation: '乘客可以在入口处的售票机买票。',
    context: 'a ticket 是购买对象，from the machine 给出购买途径。', hint: 'purchase 比 buy 正式，常用于公告、说明和商业记录。',
  }, listen('把票交给工作人员', '申请退票', '查看出发时间'), [L('2022-12-2', 'p-5-9', 'purchase'), R('2026-06-3', 'p-part3-section-b-8', 'purchase')], [
    near('buy', '/baɪ/', '买', 'buy tickets 适用于日常表达。purchase tickets 常见于正式的售票说明。', 'You can buy a day pass online.', '你可以在网上买一张日票。'),
    confuse('acquire', '/əˈkwaɪə/', '取得；获得', 'acquire 可能通过购买、受赠或积累取得。purchase 明确是付钱购买。', 'The museum acquired the letters through a donation.', '博物馆通过捐赠获得了这些信件。', '/əˈkwaɪr/'),
  ], [
    { id: 'act-or-object-bought', pos: 'n.', meaning: '购买行为；购得的物品', collocation: 'make a purchase online',
      example: 'Keep the receipt if you need to return a purchase.', translation: '请留好收据，以备退货。',
      context: 'return 表示退回已购的物品，a purchase 在这里指买到的商品。',
      evidence: [R('2023-06-2', 'p-part3-section-c-1-3', 'purchases')] },
  ]),
  card({
    id: 'quality', ipa: '/ˈkwɒləti/', ipaUS: '/ˈkwɑːlət̬i/', pos: 'n.', theme: '评价与生活',
    meaning: '某物达到的水平；质量', collocation: 'improve air quality',
    sentence: 'The city installed monitors to track air quality near schools.',
    translation: '这座城市安装了监测设备，追踪学校附近的空气质量。',
    context: 'monitors 记录空气中的相关指标，quality 指空气状况的好坏。', hint: 'air quality 是空气质量，quality of life 是生活质量。',
  }, write('某物达到的水平；质量，以 q 开头', '改善空气质量', 'improve air quality'), [L('2021-12-2', 'p-16-4', 'quality'), R('2025-06-2', 'p-part3-section-b-3', 'quality')], [
    confuse('quantity', '/ˈkwɒntəti/', '数量；总量', 'quality 表示好坏程度。quantity 衡量有多少。两者常用来讨论质量与数量的取舍。', 'The shop sells small quantities of rare tea.', '这家店出售少量珍稀茶叶。', '/ˈkwɑːntət̬i/'),
    confuse('feature', '/ˈfiːtʃə/', '特征；产品的功能', 'a feature 可以是某项功能。quality 作可数名词时可指个人品质；作质量讲时是整体水平。', 'The newest feature makes the app easier to use.', '最新功能让这个应用更容易使用。', '/ˈfiːtʃər/'),
  ], [
    { id: 'personal-characteristic', pos: 'n.', meaning: '品质；特征', collocation: 'show the qualities of a good leader',
      example: 'Curiosity is a useful quality in a researcher.', translation: '好奇心是研究人员的一项有用特质。',
      context: 'a useful quality 用可数名词，具体指研究人员身上的一种特质。',
      evidence: [R('2025-12-2', 'p-part3-section-b-2', 'quality'), R('2025-12-2', 'p-part3-section-b-15', 'quality')] },
  ]),
  card({
    id: 'remote', ipa: '/rɪˈməʊt/', ipaUS: '/rɪˈmoʊt/', pos: 'adj.', theme: '地理与工作',
    meaning: '偏远的；离主要活动地点很远的', collocation: 'reach remote communities',
    sentence: 'Mobile libraries bring books to remote villages that have no public transport.',
    translation: '流动图书馆把书送到没有公共交通的偏远村庄。',
    context: 'no public transport 表明交通不便，remote 修饰离城镇或交通线路较远的村庄。', hint: 'remote areas 是偏远地区，remote work 是远程工作。',
  }, read('人口稠密的', '以图书出版闻名的', '正在进行拆迁的'), [L('2023-06-1', 'p-12-3', 'remote'), L('2021-06-1', 'p-19-7', 'remote')], [
    near('isolated', '/ˈaɪsəleɪtɪd/', '孤立的；与外界联系少的', 'remote 侧重地理位置远。isolated 更强调联系受限，也可用于人的社会处境。', 'Flooding left several villages isolated.', '洪水让几个村庄与外界隔绝。'),
    confuse('distant', '/ˈdɪstənt/', '远处的；时间上遥远的', 'distant 表示距离远，也可谈遥远的过去。remote village 还常暗示到达或联系不便。', 'We could see the lights of a distant town.', '我们看得见远处城镇的灯光。'),
  ], [
    { id: 'away-from-workplace', pos: 'adj.', meaning: '远程进行的；不必到固定工作地点的', collocation: 'enable remote working',
      example: 'The company introduced remote working for staff who did not need to be on site.', translation: '公司为无需到现场的员工引入了远程工作安排。',
      context: 'did not need to be on site 明确员工可以从别处开展工作。',
      evidence: [R('2026-06-1', 'p-part3-section-b-11', 'remote'), R('2026-06-1', 'p-part3-section-b-5', 'remote')] },
  ]),
  card({
    id: 'rental', ipa: '/ˈrentəl/', pos: 'n.', theme: '住房与消费',
    meaning: '供租用的物品、车辆或房屋', collocation: 'book a holiday rental',
    sentence: 'They booked a holiday rental with a kitchen near the coast.',
    translation: '他们在海边订了一处带厨房的度假出租房。',
    context: 'booked 说明是临时预订，with a kitchen 指有厨房的住处。rental 表示供租用的房屋。', hint: 'holiday rental 可以指租来度假的住处。',
  }, listen('供出售的新房', '房屋修缮的服务', '安排海边出行的车票'), [L('2023-12-2', 'p-1-1', 'rental')], [
    confuse('rent', '/rent/', '租金；租用', 'rent 作名词通常是支付的租金。a rental 在这里指供租用的住处。', 'The monthly rent includes water charges.', '月租包含水费。'),
    confuse('lease', '/liːs/', '租约', 'a lease 是规定租期和义务的合同。rental 可指租赁行为或被租用的物品。', 'We signed a one-year lease.', '我们签了一份为期一年的租约。'),
  ]),
  card({
    id: 'reputation', ipa: '/ˌrepjəˈteɪʃən/', pos: 'n.', theme: '社会与评价',
    meaning: '别人根据过往表现形成的普遍评价', collocation: 'build a reputation for reliability',
    sentence: 'The repair shop built a reputation for finishing jobs on time.',
    translation: '这家维修店以按时完成工作赢得了口碑。',
    context: 'for finishing jobs on time 说明这家店积累口碑的原因。built 表示评价逐渐形成。', hint: 'reputation for 后接著称的特征或行为，reputation as 后接身份。',
  }, write('别人根据过往表现形成的普遍评价，以 r 开头', '建立可靠的口碑', 'build a reputation for reliability', 'establish a reputation for reliability'), [L('2021-06-1', 'p-1-7', 'reputation'), R('2023-12-2', 'p-part3-section-b-2', 'reputation')], [
    confuse('image', '/ˈɪmɪdʒ/', '形象；给人的印象', 'image 可通过宣传塑造。reputation 往往来自一段时间里的表现和口碑。', 'The campaign was intended to improve the company’s image.', '活动旨在改善公司的形象。'),
    confuse('prestige', '/preˈstiːʒ/', '因地位或成就得到的声望', 'prestige 通常为正面。reputation 可以好也可以坏，例如 a reputation for delays。', 'The award brought prestige to the department.', '这个奖项给该部门带来了声望。'),
  ]),
  card({
    id: 'responsible', ipa: '/rɪˈspɒnsəbəl/', ipaUS: '/rɪˈspɑːnsəbəl/', pos: 'adj.', theme: '职责与因果',
    meaning: '对工作、行为或结果负有责任的', collocation: 'be responsible for checking records',
    sentence: 'The supervisor is responsible for checking the safety records each week.',
    translation: '主管负责每周检查安全记录。',
    context: 'supervisor 是担任职责的人，for 后的 checking 指明确分配的工作。', hint: '主语是有职责的人时，be responsible for 通常可理解为负责。',
  }, read('被排除在检查之外的', '已经交接工作的', '专门负责购买物料的'), [L('2022-12-2', 'p-19-3', 'responsible')], [
    near('accountable', '/əˈkaʊntəbəl/', '应当对结果作出说明并承担后果的', 'responsible 可表示负责一项工作。accountable 更强调事后需要对结果作出说明。', 'Managers are accountable for how they spend public money.', '管理人员须对公共资金的使用负责。'),
    confuse('liable', '/ˈlaɪəbəl/', '依法有义务或应负责任的', 'liable 常见于法律和赔偿语境。responsible 可用来描述日常职责，也可表示某事是结果的成因。', 'The company may be liable for the damage.', '公司可能需为损害承担法律责任。'),
  ], [
    { id: 'cause-of-result', pos: 'adj.', meaning: '引起某结果的；造成某事的', collocation: 'be responsible for delays',
      example: 'A power failure was responsible for most of the delays.', translation: '大多数延误都是由停电引起的。',
      context: '主语是停电这一事件，没有可分派的职责。for 后说明由它造成的结果。',
      evidence: [L('2026-06-1', 'p-22-2', 'responsible')] },
  ]),
  card({
    id: 'retirement', ipa: '/rɪˈtaɪəmənt/', ipaUS: '/rɪˈtaɪrmənt/', pos: 'n.', theme: '工作与保障',
    meaning: '退休；结束职业工作后的时期', collocation: 'save for retirement',
    sentence: 'She began saving for retirement when she started her first job.',
    translation: '她从第一份工作开始就为退休存钱。',
    context: 'began saving 表示提前储蓄，for retirement 说明这些钱留作退休后使用。', hint: 'save for retirement 是为退休存钱，retirement age 是退休年龄。',
  }, listen('换工作的搬迁费用', '下一次带薪休假', '岗位入职前的训练'), [L('2022-06-1', 'p-22-2', 'retirement'), L('2022-12-2', 'p-5-1', 'retirement')], [
    confuse('pension', '/ˈpenʃən/', '养老金', 'a pension 是退休后定期发放的钱。retirement 指退休这一变化或之后的生活时期。', 'He receives a pension from his former employer.', '他从原雇主那里领取养老金。'),
    confuse('resignation', '/ˌrezɪɡˈneɪʃən/', '辞职', 'resignation 是主动离开某岗位，之后还可以去别处工作。retirement 通常是结束职业工作。', 'The director announced her resignation in June.', '主任在六月宣布辞职。'),
  ]),

  card({
    id: 'rural', ipa: '/ˈrʊərəl/', ipaUS: '/ˈrʊrəl/', pos: 'adj.', theme: '城乡与发展',
    meaning: '农村的；与乡村地区有关的', collocation: 'provide services in rural areas',
    sentence: 'The clinic sends a mobile team to rural areas every week.',
    translation: '诊所每周派一支流动团队到农村地区。',
    context: 'mobile team 要前往服务对象居住地。rural areas 指乡村地区。', hint: 'rural areas 与 urban areas 可形成城乡对照。',
  }, write('农村的；与乡村地区有关的，以 r 开头', '在农村地区提供服务', 'provide services in rural areas', 'offer services in rural areas'), [L('2025-06-2', 'p-5-4', 'rural'), R('2024-12-1', 'p-part3-section-a-1', 'rural')], [
    opposite('urban', '/ˈɜːbən/', '城市的', 'urban 指城市环境，rural 指农村环境。城乡对照常用 urban and rural areas。', 'Urban residents tend to have more transport options.', '城市居民通常有更多交通选择。', '/ˈɝːbən/'),
    confuse('remote', '/rɪˈməʊt/', '偏远的', 'rural 说明属于乡村。remote 说明距离远或不容易到达。靠近城市的村庄也可以是 rural。', 'A doctor visits the remote village twice a month.', '一名医生每月两次到这个偏远村庄出诊。', '/rɪˈmoʊt/'),
  ]),
  card({
    id: 'salary', ipa: '/ˈsæləri/', pos: 'n.', theme: '工作与收入',
    meaning: '受雇者按固定周期领取的工资', collocation: 'earn an annual salary',
    sentence: 'The job offers a fixed salary and extra pay for weekend shifts.',
    translation: '这份工作提供固定工资，周末轮班另付报酬。',
    context: 'fixed 和 extra pay 对照。salary 是固定发放的工资，轮班额外收入另算。', hint: 'annual salary 是年薪，starting salary 是起薪。',
  }, listen('工作所需的证书', '周末轮班的额外补贴', '合同的有效期限'), [L('2022-12-2', 'p-1-3', 'salary'), R('2025-06-1', 'p-part3-section-c-2-10', 'salary')], [
    confuse('wage', '/weɪdʒ/', '工资；常按小时、日或周计的报酬', 'salary 多按固定月薪或年薪计。wage 常见于 hourly wage 等按工作时间计算的报酬。', 'The minimum wage increased in April.', '最低工资标准在四月上调。'),
    confuse('income', '/ˈɪnkʌm/', '收入', 'income 可包括工资、租金和投资收益。salary 只指雇佣关系中的固定工资。', 'They report their rental income each year.', '他们每年申报租金收入。'),
  ]),
  card({
    id: 'schedule', ipa: '/ˈʃedjuːl/', ipaUS: '/ˈskedʒuːl/', pos: 'n.', theme: '时间与计划',
    past: 'scheduled', participle: 'scheduled', meaning: '列出活动及其时间的安排或表格', collocation: 'stick to a schedule',
    sentence: 'The schedule leaves time for questions after every talk.',
    translation: '时间表给每场讲座后都留出了提问时间。',
    context: 'after every talk 说明时段的先后。schedule 是给各环节分配时间的安排。', hint: 'on schedule 是按预定时间，ahead of schedule 是提前。',
  }, read('讲座的主题目录', '听众提交的问题', '大会的预算'), [L('2024-12-1', 'p-12-1', 'schedule'), R('2024-06-3', 'p-part3-section-b-12', 'schedule')], [
    near('timetable', '/ˈtaɪmteɪbəl/', '课程、交通或活动的时间表', 'timetable 常用于列明课程或交通班次的固定时间。schedule 也常指个人行程和临时活动安排。', 'The timetable shows when the last train leaves.', '时刻表列出了末班火车发车的时间。'),
    confuse('agenda', '/əˈdʒendə/', '会议议程；要处理的事项', 'agenda 侧重会议要讨论什么。schedule 侧重安排在什么时间。', 'The budget is the first item on the agenda.', '预算是议程上的第一项。'),
  ], [
    { id: 'set-a-time', pos: 'v.', meaning: '安排某事在特定时间进行', collocation: 'schedule a meeting for Tuesday',
      example: 'We scheduled the interview for Tuesday morning.', translation: '我们把面试安排在星期二上午。',
      context: 'interview 是安排的活动，for Tuesday morning 指安排到的时间。',
      evidence: [L('2023-06-1', 'p-9-3', 'Schedule'), L('2025-06-1', 'p-1-5', 'scheduling')] },
  ]),
  card({
    id: 'sector', ipa: '/ˈsektə/', ipaUS: '/ˈsektər/', pos: 'n.', theme: '经济与制度',
    meaning: '经济或公共活动中的一个部门、领域', collocation: 'work in the private sector',
    sentence: 'Investment in the transport sector created jobs in several towns.',
    translation: '对交通运输领域的投资在几个镇创造了就业机会。',
    context: 'transport 限定投资涉及的经济领域。sector 可以涵盖从事交通运输的许多机构。', hint: 'public sector 是公共部门，private sector 是私营部门。',
  }, write('经济或公共活动中的一个部门、领域，以 s 开头', '在私营部门工作', 'work in the private sector'), [L('2024-06-1', 'p-1-10', 'sector'), R('2024-12-1', 'p-part3-section-b-4', 'sector')], [
    near('industry', '/ˈɪndəstri/', '行业；产业', 'the car industry 指汽车产业。sector 可按更广的经济类型划分，例如公共部门和私营部门。', 'The film industry employs people in many different roles.', '电影业雇用许多岗位的人员。'),
    confuse('department', '/dɪˈpɑːtmənt/', '组织内的部门', 'department 通常是一家机构的内部单位。sector 可包括多个不同机构。', 'The finance department handles payments.', '财务部处理付款。', '/dɪˈpɑːrtmənt/'),
  ]),
  card({
    id: 'senior', ipa: '/ˈsiːniə/', ipaUS: '/ˈsiːnjər/', pos: 'adj.', theme: '职场与教育',
    meaning: '级别高的；资历较深的', collocation: 'report to a senior manager',
    sentence: 'Only a senior manager can approve expenses of that size.',
    translation: '只有高级管理人员才能批准那么大的一笔支出。',
    context: 'can approve 描述职位权限。senior 修饰 manager，表示在职级上较高。', hint: 'senior manager 表示高级管理人员，senior to someone 可表示职位比某人高。',
  }, listen('新入职的员工', '记录支出的人', '向公司提供商品的供应商'), [L('2024-12-1', 'p-16-2', 'senior'), R('2025-06-3', 'p-part3-section-c-1-3', 'senior')], [
    opposite('junior', '/ˈdʒuːniə/', '较低级别的；资历较浅的', 'senior developer 指资历或职级较高的开发人员。junior developer 通常是较初级的岗位。', 'A junior analyst checked the figures.', '一名初级分析员核对了数字。', '/ˈdʒuːnjər/'),
    confuse('experienced', '/ɪkˈspɪəriənst/', '有经验的', 'experienced 评价经验。senior 还可直接指组织正式划分的职级。', 'We asked an experienced teacher to review the lesson.', '我们请一位有经验的老师评审了这节课。', '/ɪkˈspɪriənst/'),
  ], [
    { id: 'final-year-student', pos: 'n.', meaning: '（美式）高中或大学毕业年级的学生', collocation: 'survey high school seniors',
      example: 'High school seniors can apply for the scholarship in April.', translation: '高中毕业年级学生可在四月申请这项奖学金。',
      context: 'high school 限定了学校阶段，seniors 指最后一年级的学生。',
      evidence: [L('2023-12-2', 'p-9-1', 'seniors'), L('2022-12-2', 'p-22-1', 'seniors')] },
  ]),
  card({
    id: 'service', ipa: '/ˈsɜːvɪs/', ipaUS: '/ˈsɝːvɪs/', pos: 'n.', theme: '社会与工作',
    past: 'serviced', participle: 'serviced', meaning: '为人提供的服务、帮助或工作', collocation: 'provide a delivery service',
    sentence: 'The library offers a free delivery service for readers who cannot travel.',
    translation: '图书馆为出行不便的读者提供免费送书服务。',
    context: 'offers 表示向读者提供，delivery 指服务的具体内容是送书。', hint: 'customer service 是客户服务，delivery service 是配送服务。',
  }, read('图书馆出售的图书', '出行受限的证明', '图书馆的收费目录'), [L('2023-06-1', 'p-12-3', 'services'), R('2025-06-1', 'p-part3-section-b-1', 'services')], [
    confuse('product', '/ˈprɒdʌkt/', '产品', 'product 指生产出来的商品或产品。service 往往指为顾客做的事情，例如配送或维修。', 'The store sells products made from recycled materials.', '这家店出售用回收材料制成的产品。', '/ˈprɑːdʌkt/'),
    confuse('assistance', '/əˈsɪstəns/', '协助；帮助', 'assistance 强调帮助某人处理问题。service 可指有组织、按流程提供的服务。', 'Please call the desk if you need assistance.', '如需帮助，请给服务台打电话。'),
  ], [
    { id: 'period-of-duty', pos: 'n.', meaning: '服役；任职或服务的时间', collocation: 'complete years of military service',
      example: 'After ten years of service in the navy, she returned to university.', translation: '在海军服役十年后，她回到大学继续学习。',
      context: 'ten years 与 in the navy 把 service 限定为一段服役时期。',
      evidence: [L('2025-12-1', 'p-1-8', 'service')] },
    { id: 'maintain-equipment', pos: 'v.', meaning: '维护或定期检修机器', collocation: 'service the equipment annually',
      example: 'A technician services the lift once a month.', translation: '技术人员每月对电梯进行一次检修。',
      context: 'technician 作主语，the lift 是接受检修的设备。once a month 说明这是例行维护。' },
  ]),
  card({
    id: 'skill', form: 'skills', ipa: '/skɪl/', pos: 'n.', theme: '教育与工作',
    meaning: '通过学习、经验或训练掌握的能力', collocation: 'develop practical skills',
    sentence: 'The course helps students develop practical skills for work in a laboratory.',
    translation: '课程帮助学生培养在实验室工作所需的实践技能。',
    context: 'develop 指逐步掌握，for work in a laboratory 说明这些能力的应用场景。', hint: 'develop skills 是培养技能，practical skills 是实践技能。',
  }, write('通过学习、经验或训练掌握的能力，以 s 开头', '培养实践技能', 'develop practical skills', 'build practical skills', 'acquire practical skills'), [L('2022-06-1', 'p-1-6', 'skill'), L('2022-06-1', 'p-5-8', 'skills')], [
    confuse('talent', '/ˈtælənt/', '天赋；擅长某事的能力', 'talent 常暗示某人有较自然的才能。skill 侧重可通过训练掌握的实际本领。', 'She has a talent for explaining difficult ideas.', '她擅长解释难懂的想法。'),
    confuse('qualification', '/ˌkwɒlɪfɪˈkeɪʃən/', '资历；资格证书', 'qualification 常是证明符合要求的资历。skill 是能做什么的实际能力。', 'The position requires a teaching qualification.', '这个岗位要求具备教师资质。', '/ˌkwɑːləfɪˈkeɪʃən/'),
  ]),
  card({
    id: 'social', ipa: '/ˈsəʊʃəl/', ipaUS: '/ˈsoʊʃəl/', pos: 'adj.', theme: '人际与社会',
    meaning: '与人与人之间的交往有关的', collocation: 'develop social skills',
    sentence: 'The after-school club gives children more opportunities for social interaction.',
    translation: '课后俱乐部给孩子们更多与人交往的机会。',
    context: 'club 是孩子一起活动的场所。social 修饰 interaction，限定为人与人之间的互动。', hint: 'social life 指社交生活，social skills 指与人交往的能力。',
  }, listen('自己安排作业的', '有关教学材料的', '加强体育锻炼的'), [L('2025-12-1', 'p-19-4', 'social'), L('2024-12-2', 'p-1-8', 'social')], [
    confuse('sociable', '/ˈsəʊʃəbəl/', '喜欢与人交往的', 'sociable 常描述人的性格。social 可修饰活动、关系或社会结构，范围更广。', 'He is quiet at first but quite sociable once he knows people.', '他一开始话不多，熟悉以后很爱交际。', '/ˈsoʊʃəbəl/'),
    confuse('societal', '/səˈsaɪətəl/', '全社会层面的', 'societal change 侧重社会整体变化。social interaction 专指人与人交往。', 'The researchers looked at broader societal changes.', '研究人员考察了更广泛的社会变化。', '/səˈsaɪət̬əl/'),
  ], [
    { id: 'society-at-large', pos: 'adj.', meaning: '与社会整体或社会群体有关的', collocation: 'examine social norms',
      example: 'Social norms influence how people behave in public places.', translation: '社会规范影响人们在公共场所的行为。',
      context: 'norms 指一群人共同认可的规范。social 指社会层面，而非一次人际交流。',
      evidence: [L('2025-06-2', 'p-5-2', 'social')] },
  ]),
  card({
    id: 'software', ipa: '/ˈsɒftweə/', ipaUS: '/ˈsɑːftwer/', pos: 'n.', theme: '信息与技术',
    meaning: '让计算机或设备执行任务的程序及其相关内容', collocation: 'install analysis software',
    sentence: 'The software checks each form for missing information before it is submitted.',
    translation: '软件会在表格提交前逐份检查是否有信息缺漏。',
    context: 'checks 是程序自动执行的功能。software 指用来运行这项检查的计算机程序。', hint: 'software 通常不可数，可说 a piece of software 或 a software application。',
  }, read('用于打印的硬件', '表格上的空白栏目', '提交者的个人记录'), [L('2024-12-1', 'p-12-1', 'software'), R('2025-12-3', 'p-part3-section-c-2-3', 'software')], [
    opposite('hardware', '/ˈhɑːdweə/', '计算机或设备的实体部件', 'hardware 指物理设备和部件。software 指运行其上的程序。', 'The old hardware cannot run the latest software.', '旧硬件无法运行最新软件。', '/ˈhɑːrdwer/'),
    confuse('application', '/ˌæplɪˈkeɪʃən/', '面向用户特定任务的应用程序', 'application 是让用户完成某项任务的软件。software 还可指操作系统和其他非用户应用程序。', 'The application helps drivers plan their routes.', '这个应用帮助司机规划路线。'),
  ]),
  card({
    id: 'solution', ipa: '/səˈluːʃən/', pos: 'n.', theme: '问题与决策',
    meaning: '解决某个问题的办法', collocation: 'find a workable solution',
    sentence: 'The team found a solution to the problem without replacing the entire system.',
    translation: '团队找到了问题的解决办法，无需更换整个系统。',
    context: 'to the problem 给出要处理的问题，without replacing 说明所找到的办法不需要全面更换。', hint: 'a solution to a problem 用介词 to。',
  }, write('解决某个问题的办法，以 s 开头', '找到可行的解决办法', 'find a workable solution', 'find a feasible solution', 'find a practical solution'), [L('2025-06-1', 'p-5-8', 'solution'), R('2024-12-2', 'p-part3-section-c-1-4', 'solution')], [
    confuse('answer', '/ˈɑːnsə/', '回答；问题的答案', 'answer 可指对提问的回答。solution 常指可实施的办法，也可指按步骤求出的题解。', 'Her answer explained why the data were missing.', '她的回答解释了为什么数据缺失。', '/ˈænsər/'),
    confuse('workaround', '/ˈwɜːkəraʊnd/', '绕过问题的临时办法', 'workaround 让任务在故障还存在时继续进行。solution 可以从根本上处理故障。', 'The team found a workaround while waiting for the update.', '等待更新时，团队找到了一个临时绕行办法。', '/ˈwɝːkəraʊnd/'),
  ], [
    { id: 'liquid-mixture', pos: 'n.', meaning: '溶液；物质溶解后形成的均匀混合物', collocation: 'prepare a salt solution',
      example: 'The students prepared a salt solution for the experiment.', translation: '学生们为实验配制了一份盐溶液。',
      context: 'salt 和 experiment 确定化学语境。solution 指盐溶解在液体后形成的混合物。' },
  ]),

  card({
    id: 'stability', ipa: '/stəˈbɪləti/', ipaUS: '/stəˈbɪlət̬i/', pos: 'n.', theme: '经济与状态',
    meaning: '稳定性；状态不易突然变化的程度', collocation: 'improve job stability',
    sentence: 'A longer contract would give the workers more job stability.',
    translation: '更长的合同会让这些工人的工作更稳定。',
    context: 'longer contract 降低了短期内失去工作的可能。job stability 指工作持续而少变动的状态。', hint: 'job stability 是工作稳定性，economic stability 是经济稳定。',
  }, read('改变工作地点的机会', '提高计件工资的幅度', '减少新员工培训的办法'), [R('2025-06-1', 'p-part3-section-c-2-10', 'stability')], [
    confuse('security', '/sɪˈkjʊərəti/', '安全；有保障的状态', 'job security 侧重不必担心失业。job stability 还强调工作持续、变化较少。', 'The permanent contract gave her greater job security.', '长期合同让她的工作更有保障。', '/sɪˈkjʊrət̬i/'),
    confuse('consistency', '/kənˈsɪstənsi/', '一致性；前后一贯', 'consistency 常比较多次结果是否一致。stability 强调一种状态能保持而不易改变。', 'The second test checked the consistency of the results.', '第二次测试检查了结果的一致性。'),
  ]),
  card({
    id: 'standard', form: 'standards', ipa: '/ˈstændəd/', ipaUS: '/ˈstændərd/', pos: 'n.', theme: '规则与评价',
    meaning: '用来衡量质量、表现或是否合格的标准', collocation: 'meet safety standards',
    sentence: 'The equipment must meet safety standards before it can be sold.',
    translation: '设备必须达到安全标准才能销售。',
    context: 'meet 表示达到要求，before it can be sold 表明这些标准是获准销售的条件。', hint: 'meet a standard 是达到标准，set a standard 是设定标准。',
  }, write('用来衡量质量、表现或是否合格的标准，以 s 开头', '达到安全标准', 'meet safety standards', 'meet the safety standards', 'satisfy safety standards', 'comply with safety standards'), [L('2024-12-1', 'p-19-1', 'standards'), R('2024-12-3', 'p-part3-section-a-1', 'standards')], [
    confuse('criterion', '/kraɪˈtɪəriən/', '评判或筛选所用的一项准则', 'criterion 是用来评估的一个具体条件，复数是 criteria。standard 也可指整体应达到的水平。', 'Cost was only one criterion for selecting the supplier.', '成本只是选择供应商的一项标准。', '/kraɪˈtɪriən/'),
    confuse('benchmark', '/ˈbentʃmɑːk/', '供比较的基准', 'benchmark 可以是一项参考数值或对照对象。standard 还可指必须达到的正式要求。', 'The team used last year’s results as a benchmark.', '团队把去年的结果用作比较基准。', '/ˈbentʃmɑːrk/'),
  ], [
    { id: 'normal-or-accepted', pos: 'adj.', meaning: '通用的；按常规或公认方式处理的', collocation: 'follow standard procedures',
      example: 'Backing up the files is part of the standard procedure.', translation: '备份文件是常规流程的一部分。',
      context: 'standard 修饰 procedure，表示大家一般遵循的流程。',
      evidence: [R('2025-12-3', 'p-part3-section-a-2', 'standard')] },
  ]),
  card({
    id: 'statement', ipa: '/ˈsteɪtmənt/', pos: 'n.', theme: '沟通与论证',
    meaning: '把观点、事实或立场表达出来的陈述', collocation: 'issue a public statement',
    sentence: 'The department issued a statement explaining why the deadline had changed.',
    translation: '部门发布了一份声明，解释截止日期变更的原因。',
    context: 'issued 表示正式发布，explaining 后给出声明要说明的事。', hint: 'make a statement 是作出陈述，issue a statement 常指公开发表声明。',
  }, read('报名截止日期本身', '延期申请的表格', '发布消息的工作人员'), [R('2026-06-3', 'p-part3-section-c-9', 'statement'), R('2024-06-2', 'p-part3-section-c-1-4', 'statements')], [
    confuse('announcement', '/əˈnaʊnsmənt/', '公告；宣布的消息', 'announcement 常把新消息告诉大家。statement 还可以阐明立场或陈述事实。', 'The announcement confirmed the new opening date.', '公告确认了新的开放日期。'),
    confuse('claim', '/kleɪm/', '声称的观点；主张', 'claim 可以是一项仍需证实的主张。statement 更中性，可以只是陈述已确认的事实。', 'The researchers found little evidence for the claim.', '研究人员几乎没找到支持这一说法的证据。'),
  ], [
    { id: 'financial-record', pos: 'n.', meaning: '列出账目、金额等信息的清单', collocation: 'check a bank statement',
      example: 'He checked his bank statement for the missing payment.', translation: '他核查银行对账单，寻找那笔不见的款项。',
      context: 'bank 和 missing payment 提示是在核查一段时间内的交易记录。' },
  ]),
  card({
    id: 'strategy', ipa: '/ˈstrætədʒi/', ipaUS: '/ˈstræt̬ədʒi/', pos: 'n.', theme: '计划与决策',
    meaning: '为实现目标而有意选择的总体做法', collocation: 'develop a strategy for reducing waste',
    sentence: 'The school adopted a new strategy to reduce food waste in its dining halls.',
    translation: '学校采用了一套新策略，减少食堂的食物浪费。',
    context: 'to reduce food waste 说明目标，strategy 指为达成该目标选定的一套做法。', hint: 'a strategy for doing 可接动名词，a strategy to do 也可表示所求目标。',
  }, write('为实现目标而有意选择的总体做法，以 s 开头', '制定减少浪费的策略', 'develop a strategy for reducing waste', 'develop a strategy to reduce waste', 'formulate a strategy to reduce waste'), [L('2024-06-1', 'p-16-1', 'strategy'), R('2024-06-2', 'p-part3-section-b-7', 'strategy')], [
    confuse('tactic', '/ˈtæktɪk/', '为达成目的采用的具体手段', 'strategy 指总体做法，tactic 常是落实总体做法的一个具体手段。', 'Giving smaller portions was one tactic for cutting waste.', '减少每份食物的分量是减少浪费的一种手段。'),
    near('plan', '/plæn/', '计划；安排', 'plan 可以只是定好时间和步骤。strategy 还着重在各种可能做法中选择能实现目标的方向。', 'The school made a plan for the renovation.', '学校制定了翻修计划。'),
  ]),
  card({
    id: 'strength', ipa: '/streŋθ/', pos: 'n.', theme: '身体与评价',
    meaning: '身体力量；肌肉发力的能力', collocation: 'build physical strength',
    sentence: 'The exercises helped her regain strength in her injured leg.',
    translation: '这些练习帮助她恢复了受伤腿部的力量。',
    context: 'in her injured leg 指身体具体部位，regain 表示恢复原有的力量。', hint: 'physical strength 是体力，build strength 表示增强力量。',
  }, listen('伤腿的皮肤颜色', '练习场地的尺寸', '剩余的康复费用'), [R('2022-12-1', 'p-part3-section-b-7', 'strength')], [
    confuse('stamina', '/ˈstæmɪnə/', '耐力；持续活动的能力', 'strength 侧重能发出多大力量。stamina 侧重能坚持活动多久。', 'Cycling to work helped build her stamina.', '骑车上班帮助她提高了耐力。'),
    confuse('advantage', '/ədˈvɑːntɪdʒ/', '优势；能带来有利条件的东西', 'a strength 可以是人或方案本身的优点。an advantage 还可来自地理位置等外部有利条件。', 'The early start gave us an advantage.', '提前出发给了我们优势。', '/ədˈvæntɪdʒ/'),
  ], [
    { id: 'strong-point', pos: 'n.', meaning: '长处；某人或某物的优势', collocation: 'identify your strengths',
      example: 'Clear writing is one of her main strengths.', translation: '写作清楚是她的主要长处之一。',
      context: 'one of 后接复数 strengths。clear writing 是其中一项值得肯定的能力。',
      evidence: [L('2021-12-2', 'p-5-1', 'strengths'), R('2025-12-2', 'p-part3-section-b-11', 'strengths')] },
    { id: 'degree-of-intensity', pos: 'n.', meaning: '关系、信号或作用的强度', collocation: 'measure the strength of a correlation',
      example: 'The researchers compared the strength of the association in two age groups.', translation: '研究人员比较了两个年龄组中这种关联的强度。',
      context: 'of the association 指要比较的关系，strength 说明这种关系有多强。',
      evidence: [L('2026-06-2', 'p-9-4', 'strength'), L('2024-12-1', 'p-22-2', 'strength')] },
  ]),
  card({
    id: 'sustainable', ipa: '/səˈsteɪnəbəl/', pos: 'adj.', theme: '环境与发展',
    meaning: '能长期维持而不严重损害资源或环境的', collocation: 'support sustainable agriculture',
    sentence: 'The programme promotes sustainable farming by helping growers use less water.',
    translation: '该项目通过帮助种植者减少用水来推广可持续农业。',
    context: 'use less water 说明降低资源消耗。sustainable farming 关注耕作能否在环境承受范围内长期继续。', hint: 'sustainable development 是可持续发展。',
  }, write('能长期维持而不严重损害资源或环境的，以 s 开头', '推广可持续农业', 'promote sustainable farming', 'promote sustainable agriculture', 'support sustainable agriculture', 'support sustainable farming'), [L('2021-12-2', 'p-22-2', 'sustainable'), R('2025-06-2', 'p-part3-section-b-11', 'sustainable')], [
    confuse('renewable', '/rɪˈnjuːəbəl/', '可再生的', 'renewable 说明资源能自然补充。sustainable 评价一种做法能否持续，还要考虑消耗速度和其他影响。', 'Wind is a renewable source of energy.', '风能是可再生能源。', '/rɪˈnuːəbəl/'),
    confuse('durable', '/ˈdjʊərəbəl/', '耐用的', 'durable 说明物品不易损坏。sustainable 还要看其资源消耗、生产和使用方式能否长期维持。', 'The case is made from a durable plastic.', '这个外壳由耐用的塑料制成。', '/ˈdʊrəbəl/'),
  ], [
    { id: 'can-be-maintained', pos: 'adj.', meaning: '能够长久坚持或维持的', collocation: 'build a sustainable exercise routine',
      example: 'She chose a sustainable routine that fitted around work and family commitments.', translation: '她选择了一套能兼顾工作和家庭责任、长期坚持的日常安排。',
      context: 'fitted around commitments 表明安排与其他事情能协调。这里说能不能长期坚持。',
      evidence: [L('2024-12-1', 'p-12-1', 'sustainable'), R('2023-12-1', 'p-part3-section-c-1-9', 'sustainable')] },
  ]),
  card({
    id: 'sustainability', ipa: '/səˌsteɪnəˈbɪləti/', ipaUS: '/səˌsteɪnəˈbɪlət̬i/', pos: 'n.', theme: '环境与发展',
    meaning: '一种做法或系统长期维持而不过度消耗资源的能力', collocation: 'improve environmental sustainability',
    sentence: 'The library improved its sustainability by reducing energy use and repairing old furniture.',
    translation: '图书馆减少能源使用并修理旧家具，提高了自身运营的可持续性。',
    context: 'reducing energy use 与 repairing old furniture 分别说明少耗能源、延长物品使用时间。', hint: 'environmental sustainability 关注环境和资源能否长期维持。',
  }, read('旧家具的购买记录', '开放时间的稳定性', '图书馆的招生办法'), [L('2023-12-2', 'p-19-1', 'sustainability'), R('2025-06-1', 'p-part3-section-b-5', 'sustainability')], [
    confuse('conservation', '/ˌkɒnsəˈveɪʃən/', '对资源、自然或文物的保护', 'conservation 常指保护资源的行动。sustainability 指一种系统长期维持的能力，可借保护行动改善。', 'The project supports the conservation of wetlands.', '该项目支持湿地保护。', '/ˌkɑːnsərˈveɪʃən/'),
    confuse('viability', '/ˌvaɪəˈbɪləti/', '可行性；得以运营的可能', 'financial viability 着重经济上能不能运作。sustainability 常进一步考虑长期的资源和环境影响。', 'The board questioned the financial viability of the plan.', '董事会质疑该计划在财务上是否可行。', '/ˌvaɪəˈbɪlət̬i/'),
  ]),
  card({
    id: 'training', ipa: '/ˈtreɪnɪŋ/', pos: 'n.', theme: '教育与工作',
    meaning: '为了掌握某项技能而进行的系统训练或培训', collocation: 'receive practical training',
    sentence: 'New staff receive training in how to handle complaints.',
    translation: '新员工接受如何处理投诉的培训。',
    context: 'in how to handle complaints 指培训要掌握的具体技能。', hint: 'receive training in 后接技能领域，a training course 指一门培训课程。',
  }, listen('应聘时提交的推荐信', '新员工的固定工资', '已经收到的投诉清单'), [L('2022-06-1', 'p-5-5', 'training'), L('2024-12-1', 'p-12-1', 'training')], [
    confuse('education', '/ˌedʒʊˈkeɪʃən/', '教育；接受教育的过程', 'education 可包括广泛的知识和长期发展。training 往往针对某个岗位或具体技能。', 'Education can broaden people’s choices.', '教育可以拓宽人们的选择。', '/ˌedʒəˈkeɪʃən/'),
    confuse('coaching', '/ˈkəʊtʃɪŋ/', '教练指导；辅导', 'coaching 常是根据个人表现给具体指导。training 可以是统一课程、个人练习和指导的组合。', 'She received coaching on how to present her ideas.', '她接受了如何陈述自己想法的指导。', '/ˈkoʊtʃɪŋ/'),
  ]),
  card({
    id: 'tradition', ipa: '/trəˈdɪʃən/', pos: 'n.', theme: '社会与文化',
    meaning: '代代相传或长期沿袭的习俗与做法', collocation: 'preserve a local tradition',
    sentence: 'The town has a long tradition of welcoming visitors into family homes.',
    translation: '这个镇有悠久的传统，会邀请来访者到家中做客。',
    context: 'a long 和 of welcoming 指持续已久的做法。tradition 表示当地人长期沿袭。', hint: 'a tradition of doing 可引出传统做法，a tradition dates back to 可介绍其起源。',
  }, read('当地为游客建造的新旅馆', '本周临时发布的公告', '给每户寄送的邀请函'), [L('2025-12-1', 'p-22-2', 'tradition'), R('2023-06-1', 'p-part3-section-b-5', 'traditions')], [
    near('custom', '/ˈkʌstəm/', '惯例；习俗', 'custom 强调一个群体通常怎么做。tradition 常进一步强调这种做法经时间传承。', 'It is a local custom to greet guests with tea.', '用茶招待客人是当地习俗。'),
    confuse('ritual', '/ˈrɪtʃuəl/', '仪式；按固定形式反复进行的做法', 'ritual 常强调固定的步骤或仪式感。tradition 可以指长期保留的一类做法，并不要求步骤固定。', 'The ceremony ended with a short ritual.', '典礼以一段简短的仪式结束。'),
  ]),

];
