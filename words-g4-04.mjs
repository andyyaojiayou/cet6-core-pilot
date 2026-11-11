const exam = 'https://english-exam.lazynote.cn/cet6';

function evidence([paper, anchor, form]) {
  const [year, month, set] = paper.split('-');
  const reading = anchor.startsWith('p-part3');
  const section = reading
    ? '仔细阅读第 ' + (anchor.startsWith('p-part3-section-c-2-') ? 2 : 1) + ' 篇正文'
    : ({ 1: '长对话 1', 5: '长对话 2', 9: '短文 1', 12: '短文 2', 16: '讲座 1', 19: '讲座 2', 22: '讲座 3' })[Number(anchor.split('-')[1])] + '文字稿';
  return { kind: reading ? 'reading' : 'transcript', form,
    label: year + ' 年 ' + Number(month) + ' 月第 ' + set + ' 套 · ' + section,
    url: exam + (reading ? '/paper/' : '/sections/listening/') + paper + '/#' + anchor };
}

const contrast = ([term, ipa, meaning, comparison, example, translation, ipaUS, kind]) =>
  ({ term, ipa, meaning, comparison, example, translation, ...(ipaUS ? { ipaUS } : {}), kind: kind ?? '易混' });

function sense(id, pos, meaning, collocation, example, translation, context, proof, ipa, ipaUS) {
  return { id, pos, meaning, collocation, example, translation, context,
    ...(proof ? { evidence: [evidence(proof)] } : {}), ...(ipa ? { ipa } : {}), ...(ipaUS ? { ipaUS } : {}) };
}

function card(id, pos, ipa, meaning, collocation, sentence, translation, context, proof, related, options) {
  const { theme = '社会与生活', skill = 'reading', form, ipaUS, verbs, senses, choices, writing } = options;
  const exercise = skill === 'writing'
    ? { cue: meaning + '（' + pos + '，以 ' + id[0] + ' 开头）', phraseCue: writing, accept: [collocation] }
    : { distractors: choices };
  return {
    id, pos, ipa, meaning, collocation, sentence, translation, context, theme, skills: [skill],
    tier: senses?.some(item => item.evidence?.length) ? 'A' : 'B', hint: '回忆搭配 ' + collocation + '。',
    evidence: [evidence(proof)], related: related.map(contrast), ...exercise,
    ...(form ? { form } : {}), ...(ipaUS ? { ipaUS } : {}), ...(verbs ? { past: verbs[0], participle: verbs[1] ?? verbs[0] } : {}),
    ...(senses ? { senses } : {}),
  };
}

export const g4BatchFour = [];
g4BatchFour.push(
  card('absence','n.','/ˈæbsəns/','缺席；未出席','repeated absences from school','Repeated absences from school made it harder for Dan to keep up.','丹多次缺课，更难跟上进度。','from school 说明缺席的场所。复数 absences 表示多次缺课。',['2025-06-1','p-part3-section-c-5','absences'],[
    ['attendance','/əˈtendəns/','出勤','attendance 关注到场，也可指到场率。absences 按一次次缺席计数。','Regular attendance helps students keep up.','规律出勤有助于学生跟上进度。',null,'反向'],
    ['leave','/liːv/','获准的休假','sick leave 指获准休病假。absence 只说明缺席事实。','Dan took two days of sick leave.','丹请了两天病假。'],
  ],{form:'absences',theme:'教育与出勤',choices:['学业成绩','出勤证明','课程进度'],senses:[sense('lack','n.','缺少；不存在','in the absence of evidence','In the absence of evidence, the panel postponed its decision.','由于缺少证据，小组推迟了决定。','of evidence 表明缺的是证据。')]}),
  card('abstract','n.','/ˈæbstrækt/','论文或报告的摘要','read the abstract','Read the abstract before deciding whether the paper is relevant.','先读摘要，再判断论文是否相关。','摘要概括研究目的、方法或发现，帮助读者判断正文是否有用。',['2026-06-1','p-5-2','abstract'],[
    ['summary','/ˈsʌməri/','概要','summary 可概括任何内容。abstract 常指学术文章单列的摘要。','The report ends with a summary of the findings.','报告末尾总结了研究发现。',null,'近义'],
    ['introduction','/ˌɪntrəˈdʌkʃən/','引言','introduction 引入背景与问题。abstract 概括全篇，往往提前交代结果。','The introduction explains why the issue matters.','引言解释了为什么这个问题重要。'],
  ],{skill:'listening',theme:'研究与报告',choices:['正文第一段','研究数据表','论文参考文献'],senses:[sense('conceptual','adj.','抽象的','an abstract idea','The teacher used a diagram to explain an abstract idea.','老师用图示解释了一个抽象概念。','diagram 把看不见的概念具象化。',['2025-06-1','p-16-2','abstract'])]}),
  card('abuse','n.','/əˈbjuːs/','辱骂；恶劣对待','report online abuse','Users can report online abuse without contacting the person who posted it.','用户可以举报网络辱骂，无需联系发帖者。','posted it 提示网上的恶意攻击。名词词尾读 /s/。',['2026-06-1','p-part3-section-c-3','abuse'],[
    ['harassment','/ˈhærəsmənt/','骚扰','harassment 常涉及持续骚扰。abuse 也可指一次恶劣辱骂。','Repeated threatening messages can amount to harassment.','反复发送威胁信息可能构成骚扰。','/həˈræsmənt/','近义'],
    ['criticism','/ˈkrɪtɪsɪzəm/','批评','criticism 可以理性指出问题。abuse 往往包含人身攻击。','The editor welcomed criticism of her proposal.','编辑欢迎大家批评她的提案。'],
  ],{theme:'网络与社会',verbs:['abused'],choices:['客观意见反馈','网络使用时长','账号安全提醒'],senses:[sense('misuse','v.','滥用','abuse power','Officials who abuse power can undermine public trust.','滥用权力的官员会损害公众信任。','power 是被滥用的权力。动词词尾读 /z/。',null,'/əˈbjuːz/')]}),
  card('accommodation','n.','/əˌkɒməˈdeɪʃən/','住处；住宿','find affordable accommodation','We booked our flights before finding affordable accommodation.','我们先订了机票，再找到了负担得起的住处。','flights 提示旅行。泛指住宿时英式英语通常不可数，美式英语也常用 accommodations。',['2026-06-2','p-1-4','accommodation'],[
    ['lodging','/ˈlɒdʒɪŋ/','临时住处','两者都可指住宿。lodging 常突出临时过夜，lodgings 也可指租住的房间。','Meals and lodging are included in the fee.','费用包含膳食和住宿。','/ˈlɑːdʒɪŋ/','近义'],
    ['reservation','/ˌrezəˈveɪʃən/','预订','reservation 是事先留位。accommodation 是实际可住的房间或住宿安排。','Could you confirm my reservation for Friday?','能确认一下我周五的预订吗？','/ˌrezərˈveɪʃən/'],
  ],{skill:'listening',ipaUS:'/əˌkɑːməˈdeɪʃən/',theme:'旅行与住宿',choices:['往返机票','酒店预订编号','旅行保险']}),
  card('accomplish','v.','/əˈkʌmplɪʃ/','完成；实现','accomplish a goal','The team set out to accomplish a goal that seemed impossible last year.','团队着手实现一个去年似乎不可能达到的目标。','accomplish 指把事情做成。set out to 说明这里正在尝试。',['2026-06-2','p-16-3','accomplish'],[
    ['achieve','/əˈtʃiːv/','实现；达到','achieve a goal 可互换。achieve 还常接目标水平，accomplish 常接 task，侧重做完。','We hope to achieve a higher response rate.','我们希望获得更高的回复率。',null,'近义'],
    ['undertake','/ˌʌndəˈteɪk/','承担；着手','undertake a task 表示接下任务。accomplish a task 表示完成任务。','A small team undertook the repairs.','一支小队承担了维修工作。','/ˌʌndərˈteɪk/'],
  ],{skill:'writing',ipaUS:'/əˈkɑːmplɪʃ/',theme:'目标与执行',verbs:['accomplished'],writing:'实现一个目标（动词加 a goal）'}),
  card('accurate','adj.','/ˈækjərət/','准确的；与实际相符的','make accurate forecasts','Reliable data help researchers make accurate forecasts.','可靠的数据有助于研究人员作出准确预测。','data 为 forecasts 提供依据。accurate 强调结果与实际吻合。',['2023-12-2','p-12-1','accurate'],[
    ['precise','/prɪˈsaɪs/','精确的','precise 强调细致明确。写到很多小数位的数值也可能偏离真实值。','The instrument gives precise readings to two decimal places.','这台仪器的读数精确到小数点后两位。'],
    ['reliable','/rɪˈlaɪəbəl/','可靠的','reliable 说的是来源或方法值得依靠。accurate 说的是具体结果与实际相符。','The team needs a reliable source of data.','团队需要可靠的数据来源。'],
  ],{skill:'listening',theme:'数据与预测',choices:['发布时间较早的','表达比较简洁的','容易取得的']}),
  card('activate','v.','/ˈæktɪveɪt/','启动；使开始运转','activate the alarm','Press the red button to activate the alarm.','按下红色按钮即可启动警报。','按按钮是触发操作，alarm 是由此开始工作的装置。',['2025-06-1','p-16-3','activate'],[
    ['enable','/ɪˈneɪbəl/','启用；使能够','enable a feature 可以只是允许使用。activate an alarm 表示警报开始工作。','This setting enables automatic backups.','这项设置启用了自动备份。'],
    ['disable','/dɪsˈeɪbəl/','停用','disable the alarm 会让警报无法工作。','Disable the alarm before opening the case.','打开外壳前先停用警报。',null,'反向'],
  ],{skill:'listening',theme:'技术与设备',verbs:['activated'],choices:['停用警报','记录警报编号','降低警报音量'],senses:[sense('trigger-response','v.','激发心理或生理反应','activate a memory','The smell of fresh bread can activate childhood memories.','新鲜面包的香味可能唤起童年的记忆。','memories 是被唤起的心理内容。',['2024-12-1','p-19-3','activate'])]}),
  card('actual','adj.','/ˈæktʃuəl/','实际的；真实发生或存在的','the actual cost','The actual cost was lower than the initial estimate.','实际成本比最初估算的低。','initial estimate 是事前估计。actual cost 是后来发生的费用。',['2025-12-1','p-9-1','actual'],[
    ['estimated','/ˈestɪmeɪtɪd/','估算的','estimated cost 来自粗略计算。actual cost 需要实际记录才能确认。','The estimated cost was five hundred pounds.','估算成本为五百英镑。',null,'反向'],
    ['current','/ˈkʌrənt/','当前的','current 标明时间属于现在。actual 区分事实和推测，也可修饰过去的数据。','The current price applies until Friday.','当前价格适用到周五。','/ˈkɝːənt/'],
  ],{theme:'事实与估算',choices:['预算预计的','当前报价中的','分期支付的']}),
  card('adjust','v.','/əˈdʒʌst/','校正数据或控制变量','adjust for inflation','The report adjusted for inflation before comparing wages over time.','报告先剔除了通胀影响，再比较不同时期的工资。','通胀影响不同年份金额的可比性。adjust for 表示对比较结果校正这种影响。',['2023-12-2','p-16-3','adjusting'],[
    ['account for','/əˈkaʊnt fɔː/','将因素纳入考虑','account for inflation 可泛指考虑通胀。adjust for inflation 通常包含数值或统计校正。','The calculation accounts for seasonal changes.','计算考虑了季节性变化。','/əˈkaʊnt fɔːr/'],
    ['adapt','/əˈdæpt/','适应；改编','adapt to higher prices 表示适应涨价。adjust for higher prices 多指把涨价因素纳入计算。','Households had to adapt to higher prices.','家庭不得不适应更高的价格。'],
  ],{form:'adjusted',skill:'writing',theme:'数据与经济',verbs:['adjusted'],writing:'按通胀校正（保留介词 for）',senses:[sense('small-change','v.','稍作改变；调节','adjust the seat','You can adjust the seat before you start driving.','开车前可以调一下座椅。','seat 是被直接调节的物件，可以按需要改变位置。')]}),
  card('administration','n.','/ədˌmɪnɪˈstreɪʃən/','政府；当政班子','an interim administration','An interim administration was formed until elections could be held.','举行选举前，组建了临时政府。','interim 与 elections 说明过渡期。administration 指暂时承担治理职能的一班人。',['2025-12-1','p-1-4','administration'],[
    ['government','/ˈɡʌvənmənt/','政府','government 可指整体政府机构。administration 常指某届当政团队或它的任期。','The new government announced its budget.','新政府公布了预算。','/ˈɡʌvərnmənt/','近义'],
    ['management','/ˈmænɪdʒmənt/','管理层','management 在公司里常指管理层。administration 在政治语境可指当政团队。','Management approved the new work schedule.','管理层批准了新的工作安排。'],
  ],{skill:'listening',theme:'治理与组织',choices:['选举监督规则','候选人的竞选团队','政府办公场所'],senses:[sense('public-body','n.','专名中的行政管理机构','the Food and Drug Administration','The Food and Drug Administration reviewed the safety data.','食品药品监督管理局审查了安全数据。','大写的 Administration 属于监管机构的全名。',['2026-06-1','p-16-2','Administration'])]}),
);
g4BatchFour.push(
  card('agency','n.','/ˈeɪdʒənsi/','提供服务或执行公务的机构','a public health agency','A public health agency issued new advice on food safety.','一家公共卫生机构发布了新的食品安全建议。','issued new advice 是机构开展的工作。health agency 常指有专业职能的公共机构。',['2026-06-1','p-16-2','agency'],[
    ['department','/dɪˈpɑːtmənt/','部门','department 常是大机构按职责划分的一部分。agency 可有独立职能。','The legal department reviewed the contract.','法务部门审查了合同。','/dɪˈpɑːrtmənt/'],
    ['organization','/ˌɔːɡənaɪˈzeɪʃən/','组织','organization 范围更广。agency 通常提供特定服务或执行某种职能。','A local organization runs the food bank.','一家本地组织运营这所食物银行。','/ˌɔːrɡənəˈzeɪʃən/'],
  ],{skill:'listening',theme:'机构与服务',choices:['卫生监管条例','公共卫生专家','食品安全建议'],senses:[sense('autonomous-action','n.','能动性；自主采取行动的能力','a sense of agency','Students gain a sense of agency when they can choose their own research topics.','学生能自主选题时，会更有自主感。','自行选题体现独立作出决策的能力。')]}),
  card('agenda','n.','/əˈdʒendə/','拟议事项；工作重点','set a research agenda','The institute set a research agenda focused on water quality.','研究所设定了以水质为重点的研究议程。','focused on 交代研究优先事项。agenda 可指长期计划要处理的问题。',['2021-12-2','p-22-3','agendas'],[
    ['schedule','/ˈʃedjuːl/','时间表','schedule 强调先后顺序和时间。agenda 侧重要讨论哪些事项。','The schedule allows ten minutes for each speaker.','时间表为每位发言者安排十分钟。','/ˈskedʒuːl/'],
    ['priority','/praɪˈɒrəti/','优先事项','priority 是应优先处理的一件事。agenda 可包括多个优先事项。','Water quality is the institute’s top priority.','水质是这家研究所的头等事项。','/praɪˈɔːrəti/'],
  ],{skill:'listening',theme:'研究与安排',choices:['详细经费账目','研究的最终结论','研究人员名单']}),
  card('alarm','n.','/əˈlɑːm/','闹钟；提醒或警报装置','set an alarm','I set an alarm to remind me to leave for the station.','我设了闹钟，提醒自己出发去车站。','to remind me 交代发出提醒的目的。set an alarm 也可用于其他定时任务。',['2025-06-1','p-19-3','alarm'],[
    ['reminder','/rɪˈmaɪndə/','提醒','reminder 可以是便条或提示消息。alarm 通常在预定时刻发出声音或震动。','I added a reminder to check the train times.','我设了一条提醒来查看列车时刻。','/rɪˈmaɪndər/'],
    ['alert','/əˈlɜːt/','警报；通知','alert 常针对事件或变化发出。alarm 可指装置，也可指信号。','The phone displayed a weather alert.','手机显示了一条天气预警。','/əˈlɝːt/'],
  ],{skill:'listening',ipaUS:'/əˈlɑːrm/',theme:'时间与安全',verbs:['alarmed'],choices:['车站指路牌','列车时刻表','预订车票的凭证'],senses:[sense('cause-worry','v.','使惊恐；使担忧','alarm local residents','The sudden rise in river levels alarmed local residents.','河水水位骤升，让当地居民感到担忧。','动词 alarm 表示引发担忧。alarming 常形容事态令人担忧。')]}),
  card('alien','n.','/ˈeɪliən/','外星生物','imagine an alien visitor','In the story, an alien visits Earth to study human behaviour.','故事中，一名外星来客到地球研究人类行为。','visits Earth 把来客描绘成来自地球以外的生物。',['2024-12-1','p-part3-section-c-1-1','alien'],[
    ['extraterrestrial','/ˌekstrətəˈrestriəl/','外星的；外星生物','extraterrestrial life 更明确指地球以外的生命。alien 作名词在科幻语境常见。','Scientists are looking for signs of extraterrestrial life.','科学家正在寻找外星生命的迹象。',null,'近义'],
    ['stranger','/ˈstreɪndʒə/','陌生人','stranger 只说明不认识这个人。故事中的 alien 来自地球之外。','A stranger asked me for directions.','一位陌生人向我问路。','/ˈstreɪndʒər/'],
  ],{theme:'科学与想象',choices:['初次见面的地球人','动物学家','地球原有的生物'],senses:[sense('unfamiliar','adj.','陌生的；格格不入的','be alien to someone','The idea of negotiating every price was alien to her.','对她来说，每样东西都讨价还价的做法很陌生。','alien to 后接感到陌生的人。')]}),
  card('alteration','n.','/ˌɔːltəˈreɪʃən/','对现有事物所作的改动','make alterations to a plan','We made several alterations to the plan after consulting residents.','听取居民意见后，我们对计划作了几处改动。','several 提示可以数出几处变动。to the plan 指被修改的计划。',['2024-06-1','p-1-4','alterations'],[
    ['revision','/rɪˈvɪʒən/','修订','revision 常指重看文本后修订。alteration 可描述具体一处更改，也可用于衣物和建筑。','The contract is undergoing revision.','合同正在修订。',null,'近义'],
    ['replacement','/rɪˈpleɪsmənt/','替换；替代品','replacement 以新物取代旧物。alteration 保留原物，做出调整。','The technician arranged a replacement for the faulty part.','技术人员安排了故障零件的替换件。'],
  ],{form:'alterations',theme:'计划与变动',choices:['取消整项计划','提交原计划副本','制定全新计划']}),
  card('ancestor','n.','/ˈænsestə/','祖先；进化上的祖先','share a common ancestor','These two species share a common ancestor despite looking quite different.','尽管外观很不一样，这两个物种仍有共同祖先。','species 与 common 表明两个演化支系可追溯到共同祖先。',['2021-12-2','p-9-2','ancestor'],[
    ['descendant','/dɪˈsendənt/','后代','ancestor 向上追溯来源，descendant 向下追溯后代。','The islanders are descendants of early settlers.','岛民是早期定居者的后代。',null,'反向'],
    ['predecessor','/ˈpriːdɪsesə/','前任；前身','predecessor 可指前任或旧版本。ancestor 可指血缘或进化关系。','The new model is lighter than its predecessor.','新型号比上一代更轻。','/ˈpredəsesər/'],
  ],{skill:'listening',ipaUS:'/ˈænsestər/',theme:'自然与演化',choices:['当前主要捕食者','后代物种','并存的同类']}),
  card('annual','adj.','/ˈænjuəl/','每年的；按年计算的','take annual leave','I plan to take annual leave in late November.','我打算十一月下旬休年假。','annual 修饰 leave，指按年度享有的休假。an annual report 是每年编制的报告。',['2026-06-2','p-1-2','annual'],[
    ['yearly','/ˈjɪəli/','每年的；每年','yearly 和 annual 作形容词可互换于 report 前。yearly 也可作副词。','The membership fee is paid yearly.','会费按年缴纳。','/ˈjɪrli/','近义'],
    ['regular','/ˈreɡjələ/','定期的；常规的','regular 表示有规律，间隔可长可短。annual 明确是按年计算。','The equipment needs regular checks.','设备需要定期检查。','/ˈreɡjələr/'],
  ],{skill:'listening',theme:'工作与日程',choices:['按周安排的','临时批准的','因生病申请的']}),
  card('apparent','adj.','/əˈpærənt/','明显的；可以看出的','become apparent','It soon became apparent that the machine needed repair.','很快就看出这台机器需要维修。','became apparent that 后面的从句交代逐渐显现的事实。',['2023-12-2','p-5-2','apparent'],[
    ['obvious','/ˈɒbviəs/','显而易见的','become obvious 与 become apparent 可接同一从句。obvious 更直接地说事情一眼可知。','It was obvious that the door had been forced open.','显然门曾被强行打开。','/ˈɑːbviəs/','近义'],
    ['seeming','/ˈsiːmɪŋ/','表面上的','an apparent improvement 可接近 seeming improvement。become apparent that 通常表示真相变得清楚。','Their seeming agreement concealed serious differences.','他们表面一致，实则有严重分歧。'],
  ],{skill:'listening',theme:'观察与判断',choices:['很难察觉的','暂时保密的','与维修无关的'],senses:[sense('seeming-only','adj.','表面上的；看似存在的','an apparent contradiction','The apparent contradiction disappeared when we checked the dates.','核对日期后，表面上的矛盾消失了。','核查后矛盾不复存在，说明矛盾只是看起来存在。')]}),
  card('assistance','n.','/əˈsɪstəns/','帮助；援助','provide assistance to residents','Volunteers provide assistance to residents who cannot shop on their own.','志愿者为不能自行购物的居民提供帮助。','to residents 引出接受帮助的人，后面的从句交代需要帮助的原因。',['2026-06-1','p-1-10','assistance'],[
    ['help','/help/','帮助','provide assistance 和 offer help 可表达同一大意。assistance 较正式。','Let me know if you need help with the form.','填表需要帮忙就告诉我。',null,'近义'],
    ['aid','/eɪd/','援助','aid 常见于 emergency aid 或 financial aid。assistance 也可指普通服务。','Emergency aid reached the village that evening.','紧急援助当晚到达村里。'],
  ],{skill:'writing',theme:'社区与服务',writing:'向居民提供帮助（用 provide 和 to residents）'}),
  card('association','n.','/əˌsəʊsiˈeɪʃən/','关联；可观察到的联系','an association between sleep and memory','The study found an association between sleep and memory.','这项研究发现睡眠与记忆之间存在关联。','between 连接两个研究因素。观察到联系只是判断因果关系的起点。',['2024-06-1','p-9-4','associations'],[
    ['correlation','/ˌkɒrəˈleɪʃən/','相关性','correlation 常指可量化的统计关系。association 也可描述记忆中的联想。','The researchers measured the correlation between the two variables.','研究人员测量了两个变量的相关性。','/ˌkɔːrəˈleɪʃən/','近义'],
    ['cause','/kɔːz/','原因','cause 指导致结果的因素。观察到 association 后还需要证据才能归因。','The test did not establish the cause of the fault.','这次测试没有确定故障原因。'],
  ],{ipaUS:'/əˌsoʊsiˈeɪʃən/',theme:'研究与证据',choices:['确定的因果机制','研究样本的大小','两种训练方法']}),
  card('assumption','n.','/əˈsʌmpʃən/','未经证实便接受的假定','make an assumption','Don’t make an assumption about the cause until you have checked the data.','核对数据之前，别贸然假定原因。','until you have checked 提示尚未查证。assumption 是先当真的判断。',['2021-12-2','p-1-4','assumptions'],[
    ['hypothesis','/haɪˈpɒθəsɪs/','待检验的假说','hypothesis 是为解释现象而提出的可检验说法。assumption 常是分析暂且采纳的出发点。','The experiment was designed to test the hypothesis.','该实验旨在检验这个假说。','/haɪˈpɑːθəsɪs/'],
    ['conclusion','/kənˈkluːʒən/','结论','conclusion 通常是推理结果。assumption 往往是推理开始前暂时接受的前提。','The researchers drew a cautious conclusion.','研究人员得出了谨慎的结论。'],
  ],{skill:'writing',theme:'推理与证据',writing:'作出一个假定（用 make 和 an）'}),
  card('atmosphere','n.','/ˈætməsfɪə/','包围天体的大气层','study a planet’s atmosphere','The spacecraft collected data about the planet’s atmosphere.','航天器采集了该行星的大气层数据。','spacecraft 和 planet 指向天体观测。atmosphere 是围绕行星的一层气体。',['2026-06-2','p-19-1','atmosphere'],[
    ['surface','/ˈsɜːfɪs/','表面','surface 是行星的外表层。atmosphere 是其外侧的气体。','The rover took photographs of the surface.','探测车拍摄了表面的照片。','/ˈsɝːfɪs/'],
    ['climate','/ˈklaɪmət/','气候','climate 指长期天气特征。atmosphere 在此指气体本身。','The region has a dry climate.','这一地区气候干燥。'],
  ],{skill:'listening',ipaUS:'/ˈætməsfɪr/',theme:'空间与环境',choices:['行星表面','航天器外壳','行星绕行轨道'],senses:[sense('mood','n.','气氛；场合给人的感受','a relaxed atmosphere','Soft lighting created a relaxed atmosphere in the café.','柔和的灯光营造出咖啡馆轻松的氛围。','lighting 和 café 描述室内布置，relaxed 形容在场感受到的气氛。')]}),
);
g4BatchFour.push(
  card('audio','n.','/ˈɔːdiəʊ/','录音；媒体中的声音','play the audio','Play the audio while you follow the text on screen.','一边播放录音，一边看屏幕上的文字。','play 提示这里指可播放的声音，text 则是同时阅读的文字。',['2025-12-2','p-19-3','audio'],[
    ['recording','/rɪˈkɔːdɪŋ/','录音或录像','recording 指记录下来的文件或内容。audio 强调其中的声音部分。','The interview recording lasts twenty minutes.','访谈录音时长二十分钟。','/rɪˈkɔːrdɪŋ/','近义'],
    ['transcript','/ˈtrænskrɪpt/','文字稿','transcript 把说过的话写下来。audio 可用来核对文字稿遗漏的内容。','I read the transcript after listening to the interview.','听完访谈后，我读了文字稿。'],
  ],{skill:'listening',ipaUS:'/ˈɑːdioʊ/',theme:'媒体与学习',choices:['屏幕字幕','阅读笔记','屏幕亮度']}),
  card('autonomy','n.','/ɔːˈtɒnəmi/','自主权；独立决策的能力','give students more autonomy','The school gives students more autonomy in choosing their projects.','学校在项目选择上给学生更多自主权。','choosing 表明决定由学生自己作出。autonomy 强调自己掌控选择。',['2025-12-2','p-part3-section-c-5','autonomy'],[
    ['independence','/ˌɪndɪˈpendəns/','独立','independence 还可强调生活或经济不依赖他人。autonomy 侧重在一定范围内自行决定。','Graduates often seek financial independence.','毕业生往往追求经济独立。',null,'近义'],
    ['permission','/pəˈmɪʃən/','许可','permission 是别人允许某项行动。autonomy 是自行决定的空间。','Staff need permission to enter the lab.','工作人员进入实验室需要获得许可。','/pərˈmɪʃən/'],
  ],{skill:'writing',ipaUS:'/ɑːˈtɑːnəmi/',theme:'教育与选择',writing:'给学生更多自主权（用 give students more）',senses:[sense('vehicle-control','n.','车辆自主控制的能力','levels of driving autonomy','The report compares different levels of driving autonomy.','这份报告比较了自动驾驶的不同等级。','levels 表明车辆接管转向和制动的程度有区别。',['2026-06-1','p-22-3','autonomy'])]}),
  card('autonomous','adj.','/ɔːˈtɒnəməs/','可自主运行的；自动控制的','an autonomous vehicle','An autonomous vehicle uses sensors to detect objects in its path.','自主驾驶车辆用传感器识别行进路线上的物体。','sensors 用于感知周边。autonomous 描述车辆具备自行控制的能力。',['2026-06-1','p-22-1','Autonomous'],[
    ['self-driving','/ˌself ˈdraɪvɪŋ/','自动驾驶的','self-driving 常直接用于汽车。autonomous 也可修饰机器人等具备自主运行能力的设备。','The city is testing self-driving buses.','这座城市正在测试自动驾驶公交车。',null,'近义'],
    ['remote-controlled','/rɪˌməʊt kənˈtrəʊld/','遥控的','remote-controlled 设备由远处发出指令。autonomous 设备可在一定范围内自行作出判断。','A remote-controlled camera filmed the track.','一台遥控摄像机拍摄了赛道。','/rɪˌmoʊt kənˈtroʊld/'],
  ],{skill:'listening',ipaUS:'/ɑːˈtɑːnəməs/',theme:'技术与出行',choices:['完全靠人遥控的','只在室内停放的','依靠轨道运行的']}),
  card('boundary','n.','/ˈbaʊndəri/','人际交往中的界限','set clear boundaries','It helps to set clear boundaries around calls after working hours.','为下班后的来电划清界限会有帮助。','around calls 交代界限针对哪类行为，例如是否接听下班后打来的工作电话。',['2025-12-2','p-part3-section-c-2-7','boundaries'],[
    ['limit','/ˈlɪmɪt/','限制；限度','limit 常指明确上限，如通话次数。boundary 可表示个人能接受哪类行为。','The plan sets a limit of three calls a week.','计划把通话限制为每周三次。'],
    ['border','/ˈbɔːdə/','边境；边缘','border 常用于地理分界。谈个人接受哪些互动时，set boundaries 更自然。','The river forms a border between the two regions.','这条河构成两地的分界线。','/ˈbɔːrdər/'],
  ],{form:'boundaries',skill:'writing',theme:'沟通与生活',writing:'划定清晰的界限（用 set 和复数）',senses:[sense('physical-divide','n.','界线；分隔两块区域的线','mark the boundary','A low wall marks the boundary of the garden.','一道矮墙标出了花园的边界。','wall 和 garden 表明所说的是实地界线。')]}),
  card('broadcast','n.','/ˈbrɔːdkɑːst/','广播或电视节目；播送','a live news broadcast','The news broadcast began just after the polls closed.','新闻播报在投票结束后立即开始。','began 说明这个节目开始播出。news 交代播送内容。',['2024-06-2','p-part3-section-c-1-3','broadcasts'],[
    ['programme','/ˈprəʊɡræm/','节目','programme 泛指一期节目。broadcast 也强调将内容传送给听众或观众。','The programme includes an interview with the mayor.','这档节目包括对市长的采访。','/ˈproʊɡræm/','近义'],
    ['podcast','/ˈpɒdkɑːst/','播客','podcast 通常可按需收听。live broadcast 表示节目随事件进行即时播出。','I downloaded the podcast for my commute.','我下载了播客，准备在通勤时听。','/ˈpɑːdkæst/'],
  ],{ipaUS:'/ˈbrɔːdkæst/',theme:'媒体与传播',verbs:['broadcast'],choices:['新闻采访提纲','投票统计规则','新闻播音员'],senses:[sense('transmit','v.','播送；广播','broadcast the ceremony live','The station will broadcast the ceremony live.','这家电视台将直播仪式。','the ceremony 作直接宾语，live 表示实时播出。')]}),
  card('calculate','v.','/ˈkælkjəleɪt/','计算；通过运算得出','calculate travel time','Calculate travel time before choosing when to leave.','先算出路上需要的时间，再决定几点出发。','travel time 是要计算的量。算出路程用时后可以倒推出发时间。',['2025-06-1','p-19-5','Calculate'],[
    ['estimate','/ˈestɪmeɪt/','估算','estimate 可以根据经验作近似判断。calculate 侧重用数字和方法算出来。','The engineer estimated the repair cost.','工程师估算了维修费用。',null,'近义'],
    ['measure','/ˈmeʒə/','测量','measure 常借助观察或仪器直接获得数据。calculate 用已有数据运算。','We measured the distance between the two doors.','我们测量了两扇门之间的距离。','/ˈmeʒər/'],
  ],{skill:'listening',theme:'计划与数据',verbs:['calculated'],choices:['取消一段行程','记录出发位置','缩短路上的时间']}),
  card('campaign','v.','/kæmˈpeɪn/','为某项诉求开展有组织的活动','campaign for safer streets','Residents have campaigned for safer streets for several years.','居民为改善街道安全开展活动已经有好几年了。','第一个 for 引出诉求，第二个 for 引出持续时间。',['2021-12-2','p-1-5','campaigned'],[
    ['advocate','/ˈædvəkeɪt/','主张；倡导','advocate safer streets 可指公开表达主张。campaign for 强调有组织地持续行动。','Several doctors advocate stricter pollution limits.','几位医生主张实施更严格的污染限制。',null,'近义'],
    ['protest','/prəˈtest/','抗议','protest against 表示反对某件事。campaign for 常引出争取实现的目标。','Residents protested against the road closure.','居民抗议关闭道路。'],
  ],{form:'campaigned',skill:'listening',theme:'社会与公共行动',verbs:['campaigned'],choices:['宣布道路改造完成','私下购买交通设备','统计街道长度'],senses:[sense('promotion-drive','n.','有组织的宣传活动','launch a marketing campaign','The company launched a marketing campaign for its new product.','公司为新产品发起了营销活动。','launch 表示启动这项有计划的宣传工作。',['2024-06-1','p-1-9','campaigns'])]}),
  card('capability','n.','/ˌkeɪpəˈbɪləti/','完成某项任务的能力或功能','expand storage capabilities','The upgrade expands the system’s storage capabilities.','这次升级扩展了系统的存储能力。','storage 交代系统能做什么。复数 capabilities 可概括若干功能。',['2024-06-1','p-part3-section-c-2-6','capabilities'],[
    ['capacity','/kəˈpæsəti/','容量；容纳能力','storage capacity 常指能存多少。storage capabilities 可涵盖存储方式与支持的功能。','The backup drive has a capacity of two terabytes.','备用硬盘容量为两太字节。','/kəˈpæsət̬i/'],
    ['feature','/ˈfiːtʃə/','特性；单项功能','feature 常指用户能辨认的一项特性。capability 侧重系统能够完成哪类任务。','Automatic encryption is a useful feature.','自动加密是一项实用功能。','/ˈfiːtʃər/'],
  ],{form:'capabilities',theme:'系统与技术',choices:['系统的购买价格','升级的操作步骤','用户的存储习惯']}),
  card('category','n.','/ˈkætəɡəri/','具有共同属性的一类','sort items into categories','The app sorts expenses into categories such as food and travel.','应用把开支分到餐饮、出行等类别。','such as 后列出分类实例。categories 是划分后的若干类。',['2024-06-3','p-part3-section-c-2-2','categories'],[
    ['class','/klɑːs/','种类；等级','class 和 category 都可表示分类。class 也可用于按等级划分，例如票的舱位等级。','The ticket is valid in second class.','这张票适用于二等舱。','/klæs/','近义'],
    ['label','/ˈleɪbəl/','标签；名称','label 是用来标记某物的名称。category 指标签所代表的一整类。','Each folder has a label showing its contents.','每个文件夹都贴有说明内容的标签。'],
  ],{form:'categories',ipaUS:'/ˈkætəɡɔːri/',theme:'整理与分类',choices:['开支明细的日期','每项开支的总额','账单照片的文件名']}),
  card('ceremony','n.','/ˈserəməni/','典礼；按一定程序进行的仪式','attend an award ceremony','Several former students returned to attend the award ceremony.','几位往届学生回来参加颁奖典礼。','award 指获颁奖项。ceremony 强调按程序进行的正式活动。',['2022-12-2','p-5-12','ceremony'],[
    ['celebration','/ˌseləˈbreɪʃən/','庆祝活动','celebration 强调庆祝。ceremony 强调正式程序，也可用于庄重的场合。','A celebration followed the formal speeches.','正式发言结束后举行了庆祝活动。'],
    ['event','/ɪˈvent/','活动；事件','event 范围很广。ceremony 是有特定程序的一种活动。','The school organized a public event.','学校组织了一场面向公众的活动。'],
  ],{skill:'listening',ipaUS:'/ˈserəmoʊni/',theme:'活动与社会',choices:['奖项提名名单','学校入学考试','学生返校通知']}),
  card('civilization','n.','/ˌsɪvəlaɪˈzeɪʃən/','具有共同制度和文化的文明','study ancient civilizations','Archaeologists study ancient civilizations through their buildings and tools.','考古学家通过古代建筑和工具研究古代文明。','buildings and tools 是观察过去社会如何组织的物质证据。',['2024-12-1','p-16-2','civilizations'],[
    ['society','/səˈsaɪəti/','社会','society 可指任意有组织的社会。civilization 常在历史语境概括一个文明及其发展。','Every society has rules about cooperation.','每个社会都有关于合作的规则。'],
    ['culture','/ˈkʌltʃə/','文化','culture 侧重信仰、习俗和表达方式。civilization 还涉及制度和物质生活。','The museum explains the region’s food culture.','博物馆介绍了当地饮食文化。','/ˈkʌltʃər/'],
  ],{form:'civilizations',theme:'历史与社会',choices:['历史遗迹的修复工具','特定社会的通用语言','近代考古人员的组织']}),
  card('classification','n.','/ˌklæsɪfɪˈkeɪʃən/','分类；按规则划分类别','a food classification system','The food classification system groups products by how they are processed.','这套食品分类体系根据加工方式归类产品。','groups 和 by 交代分类动作及依据。classification 也可指分类结果。',['2024-06-1','p-9-2','classification'],[
    ['category','/ˈkætəɡəri/','类别','category 是划分出来的一类。classification 是作出划分的过程或系统。','Fresh fruit belongs to a different category.','新鲜水果属于另一个类别。','/ˈkætəɡɔːri/'],
    ['ranking','/ˈræŋkɪŋ/','排名','ranking 会按表现或等级排出先后。classification 可以只分组。','The ranking is based on customer reviews.','排名依据客户评价。'],
  ],{theme:'营养与研究',choices:['食品加工技术','营养成分检测报告','食品销量排名']}),
);
g4BatchFour.push(
  card('coincidence','n.','/kəʊˈɪnsɪdəns/','两件事情意外地同时发生或相合','what a coincidence','We booked the same train without talking first. What a coincidence!','我们事先没商量，却订了同一班车。真巧！','without talking first 表明没有事先安排，订到同一班车属于巧合。',['2022-12-2','p-5-16','coincidence'],[
    ['chance','/tʃɑːns/','偶然；机会','by chance 强调偶然发生。a coincidence 常指两件事碰巧相合。','I met her by chance at the station.','我在车站碰巧遇见了她。','/tʃæns/','近义'],
    ['arrangement','/əˈreɪndʒmənt/','事先安排','arrangement 体现计划。coincidence 则说明事情并非事先商定。','We made an arrangement to travel together.','我们约好一起出行。'],
  ],{skill:'listening',ipaUS:'/koʊˈɪnsɪdəns/',theme:'日常与交流',choices:['事前商量好的安排','一次订票错误','火车晚点']}),
  card('collective','adj.','/kəˈlektɪv/','集体共同的；群体的','a collective effort','Cleaning the park will take a collective effort from local residents.','清理公园需要当地居民共同努力。','from local residents 交代参与者。collective 说明许多人作为一个整体投入。',['2025-12-2','p-part3-section-c-2','collective'],[
    ['joint','/dʒɔɪnt/','共同进行的','joint effort 可以互换。joint 常强调若干明确的参与方，collective 也可描述群体共有的记忆或意识。','The two schools launched a joint project.','两所学校启动了一个合作项目。',null,'近义'],
    ['individual','/ˌɪndɪˈvɪdʒuəl/','个人的；单独的','individual effort 关注每个人单独做的工作。collective effort 关注群体合力。','Individual contributions will be recorded.','每个人的贡献都会记录下来。',null,'反向'],
  ],{skill:'writing',theme:'合作与社会',writing:'一次集体努力（用 a 和 effort）'}),
  card('commitment','n.','/kəˈmɪtmənt/','对某事长期投入或坚持','a commitment to equal access','The school showed its commitment to equal access by offering free materials.','学校提供免费资料，体现了促进平等获取学习资源的决心。','by offering 给出了投入资源的行动。to 后接承诺坚持的目标。',['2025-12-1','p-part3-section-c-2-5','commitment'],[
    ['dedication','/ˌdedɪˈkeɪʃən/','奉献；专注投入','dedication 强调持续投入时间或精力。commitment 还可指具体承诺。','Her dedication to teaching impressed the staff.','她对教学的投入让同事印象深刻。',null,'近义'],
    ['promise','/ˈprɒmɪs/','承诺','promise 常是对某人说会做到的事。commitment 可以通过长期行动表现出来。','The director made a promise to respond by Friday.','负责人承诺周五前回复。','/ˈprɑːmɪs/'],
  ],{skill:'writing',theme:'社会与责任',writing:'致力于保障平等获取机会（用 a 和 to equal access）',senses:[sense('obligation','n.','已经承担的约定或义务','have a prior commitment','I cannot join the meeting because I have a prior commitment.','我先前已有安排，无法参加会议。','prior 表明这个安排早已答应下来。')]}),
  card('committee','n.','/kəˈmɪti/','为特定任务设立的委员会','a hiring committee','The hiring committee interviewed all four candidates.','招聘委员会面试了四位候选人。','hiring 说明设立目的。interviewed 表示成员按职责共同参加面试。',['2026-06-1','p-9-4','committee'],[
    ['panel','/ˈpænəl/','评审小组','interview panel 常是某次面试的评审人员。hiring committee 也可能参与筛选简历和最终决策。','A panel of three experts reviewed the proposals.','三位专家组成小组，审查了这些提案。',null,'近义'],
    ['department','/dɪˈpɑːtmənt/','部门','department 是相对固定的组织单位。committee 可从多个部门选人完成指定任务。','Please send the form to the personnel department.','请把表格交给人事部门。','/dɪˈpɑːrtmənt/'],
  ],{skill:'listening',ipaUS:'/kəˈmɪt̬i/',theme:'工作与招聘',choices:['全部求职者','人事部门的规章','面试地点']}),
  card('component','n.','/kəmˈpəʊnənt/','组成部分；构件','replace a faulty component','The technician replaced a faulty component in the machine.','技术人员更换了机器里的一个故障部件。','in the machine 表明部件属于整个机器。component 也可用于菜品、课程等的构成。',['2025-06-2','p-19-5','component'],[
    ['part','/pɑːt/','部分；零件','part 范围广，part of a speech 也可表示演讲的一部分。component 常指系统内承担一定功能的组成部分。','The supplier sent a replacement part.','供应商寄来一个替换零件。','/pɑːrt/','近义'],
    ['ingredient','/ɪnˈɡriːdiənt/','食材；原料','ingredient 在烹饪中指投入的原料。component 也可能指已经制成的酱汁等组合部分。','The recipe uses only five ingredients.','这份食谱只用五种食材。'],
  ],{ipaUS:'/kəmˈpoʊnənt/',theme:'工程与构成',choices:['机器的运行时长','保修所需的文件','故障检测的步骤']}),
  card('comprehensive','adj.','/ˌkɒmprɪˈhensɪv/','全面的；覆盖重要方面的','a comprehensive review','The panel conducted a comprehensive review of the safety procedures.','小组全面审查了安全流程。','comprehensive 关注审查覆盖的范围，例如是否从登记到离场都查到。',['2024-12-1','p-16-3','comprehensive'],[
    ['thorough','/ˈθʌrə/','仔细且彻底的','thorough 侧重每一步查得有多细。comprehensive 侧重覆盖了多少重要方面。','The mechanic carried out a thorough inspection.','维修人员做了细致检查。','/ˈθɝːoʊ/','近义'],
    ['partial','/ˈpɑːʃəl/','部分的','partial review 只审查一部分内容。comprehensive review 覆盖各个重要方面。','The committee released only a partial report.','委员会只公布了报告的一部分。','/ˈpɑːrʃəl/','反向'],
  ],{skill:'writing',ipaUS:'/ˌkɑːmprɪˈhensɪv/',theme:'研究与评估',writing:'一次全面审查（用 a 和 review）'}),
  card('compromise','v.','/ˈkɒmprəmaɪz/','危及；损害安全或可靠性','compromise account security','Reusing passwords can compromise account security.','重复使用密码可能危及账号安全。','账号安全是被削弱的对象。若密码已泄露，也可以说 a password has been compromised。',['2024-12-1','p-9-1','compromised'],[
    ['jeopardize','/ˈdʒepədaɪz/','使遭受风险','jeopardize account security 接近原搭配。compromise 也常暗示原有保护措施已受损。','A delayed repair could jeopardize passenger safety.','拖延维修可能危及乘客安全。','/ˈdʒepərdaɪz/','近义'],
    ['concede','/kənˈsiːd/','承认；让步','concede a point 指承认某一点。这里 compromise 描述安全受损，谈判中才常用于妥协。','The manager conceded that the deadline was unrealistic.','经理承认截止日期不切实际。'],
  ],{ipaUS:'/ˈkɑːmprəmaɪz/',theme:'技术与安全',verbs:['compromised'],choices:['提高账号安全性','隐藏用户名称','简化密码输入'],senses:[sense('agreement','n.','各方让步后达成的妥协','reach a compromise','The two groups reached a compromise on how to share the space.','两组就如何共用空间达成了妥协。','reach 和 on 表明双方通过协商在某一问题上找到折中方案。')]}),
  card('contemporary','adj.','/kənˈtempərəri/','当代的；当前时代的','contemporary society','Digital communication shapes many aspects of contemporary society.','数字沟通塑造着当代社会的许多方面。','digital communication 给出当前社会的背景。contemporary 表示属于这个时代。',['2025-12-3','p-part3-section-c-4','contemporary'],[
    ['modern','/ˈmɒdən/','现代的','modern society 可互换。modern 也可强调设计或做法较新，contemporary 更直接定位于同一时代。','The building has a modern design.','这栋建筑的设计很现代。','/ˈmɑːdərn/','近义'],
    ['traditional','/trəˈdɪʃənəl/','传统的','traditional 可指长期传承的做法。contemporary 侧重当下，即使当下仍保留传统。','The festival includes traditional music.','节庆活动包括传统音乐。'],
  ],{ipaUS:'/kənˈtempəreri/',theme:'时代与文化',choices:['古代的','仅有官方记录的','依照传统仪式的'],senses:[sense('same-time','adj.','同一时期的','contemporary with the poet','The painter was contemporary with the poet.','这位画家与那位诗人是同时代的人。','with 后引出同时生活的人，此处不限定为今天。')]}),
  card('conventional','adj.','/kənˈvenʃənəl/','惯常的；按通常做法的','conventional teaching methods','The study compared conventional teaching methods with a new approach.','研究把常规教学方法与一种新方法作了比较。','with a new approach 形成对照。conventional 指长期被采用的惯常方法。',['2024-06-1','p-9-2','conventional'],[
    ['traditional','/trəˈdɪʃənəl/','传统的','traditional 可突出代际传承。conventional 可以只是当前公认的标准做法。','The community uses traditional weaving techniques.','当地社区使用传统编织技艺。',null,'近义'],
    ['experimental','/ɪkˌsperɪˈmentəl/','试验性的','experimental methods 仍在试用或检验。conventional methods 通常已为人熟知和采用。','The team tested an experimental design.','团队测试了一种试验性设计。',null,'反向'],
  ],{skill:'writing',theme:'研究与教育',writing:'常规教学方法（用 teaching methods）'}),
  card('conviction','n.','/kənˈvɪkʃən/','坚定的信念','act on a personal conviction','She changed careers out of a conviction that public service matters.','她坚信公共服务有价值，因此转行。','that 从句说出信念的内容。out of 表明信念是改变职业的动因。',['2021-12-2','p-1-6','convictions'],[
    ['belief','/bɪˈliːf/','信念；看法','belief 可以是一般看法。conviction 常指深信不疑并可能据此行动。','He held a strong belief in equal access to education.','他坚信教育机会应当平等。',null,'近义'],
    ['opinion','/əˈpɪniən/','观点；意见','opinion 可是临时判断。conviction 带有更稳定的确信。','Her opinion changed after she saw the results.','看到结果后，她改变了看法。'],
  ],{theme:'观点与价值',choices:['个人的工作日程','职业资格证明','临时提出的猜测'],senses:[sense('criminal-verdict','n.','有罪判决','a criminal conviction','The applicant disclosed a previous criminal conviction.','申请人披露了此前的一项有罪判决。','criminal 和 previous 指既往司法记录。')]}),
  card('crucial','adj.','/ˈkruːʃəl/','对结果至关重要的','play a crucial role','Early feedback plays a crucial role in improving the design.','早期反馈对改进设计起关键作用。','in improving 交代作用指向的结果。crucial 表明这不是可有可无的帮助。',['2024-06-1','p-part3-section-c-2-3','crucial'],[
    ['essential','/ɪˈsenʃəl/','必不可少的','essential 指缺了就无法完成。crucial 突出对结果的重要影响。','Clean water is essential for the clinic.','清洁用水是诊所不可缺少的。',null,'近义'],
    ['optional','/ˈɒpʃənəl/','可选的','optional 表示可以自行取舍。crucial 表示作用很关键。','The extra training session is optional.','额外的培训场次可以自愿参加。','/ˈɑːpʃənəl/','反向'],
  ],{skill:'writing',theme:'论证与重点',writing:'起关键作用（用 play 和 a role）'}),
  card('curiosity','n.','/ˌkjʊəriˈɒsəti/','想探究的欲望；好奇心','spark curiosity','The unusual result sparked curiosity among the students.','这个不同寻常的结果激起了学生的好奇心。','unusual result 给出触发点。spark 表示引发想了解原因的欲望。',['2024-06-3','p-part3-section-c-2-11','curiosity'],[
    ['interest','/ˈɪntrəst/','兴趣；关注','interest 可以是长期爱好。curiosity 侧重想弄清尚不明白的事。','The project deepened her interest in astronomy.','这个项目加深了她对天文学的兴趣。',null,'近义'],
    ['surprise','/səˈpraɪz/','惊讶','surprise 是遇到意外的反应。curiosity 会进一步推动人去发问或查证。','To our surprise, the experiment worked.','出乎意料的是，实验成功了。','/sərˈpraɪz/'],
  ],{ipaUS:'/ˌkjʊriˈɑːsət̬i/',theme:'学习与认知',choices:['实验最后的结论','对失败的担忧','遵守实验规则的习惯']}),
  card('deadly','adj.','/ˈdedli/','致命的；可能导致死亡的','a deadly infection','Untreated, the infection can be deadly.','这种感染若不治疗可能致命。','Untreated 和 can 说明在一定条件下有致死风险。',['2022-06-1','p-9-1','deadly'],[
    ['fatal','/ˈfeɪtəl/','致命的；导致死亡的','fatal accident 通常说明已经有人死亡。deadly infection 可以指有致死能力。','A fatal accident closed the road.','一起致命事故导致道路关闭。',null,'近义'],
    ['dangerous','/ˈdeɪndʒərəs/','危险的','dangerous 包含许多程度的风险。deadly 特别指出死亡风险。','It is dangerous to drive in thick fog.','大雾中开车很危险。'],
  ],{skill:'listening',theme:'健康与风险',choices:['容易诊断的','只能短暂存在的','治疗后必然复发的']}),
  card('deliberate','v.','/dɪˈlɪbəreɪt/','仔细考虑或讨论','deliberate over a proposal','The panel will deliberate over the proposal before voting.','小组将在投票前仔细讨论这项提案。','before voting 表明讨论发生在作决定之前。动词词尾读 /reɪt/。',['2023-12-2','p-5-5','deliberating'],[
    ['consider','/kənˈsɪdə/','考虑','consider a proposal 直接接宾语。deliberate over a proposal 往往强调审慎权衡。','Please consider the costs before deciding.','决定前请考虑成本。','/kənˈsɪdər/','近义'],
    ['decide','/dɪˈsaɪd/','决定','decide 指得出决定。deliberate 指决定前的考虑过程。','The board decided to delay the vote.','董事会决定推迟投票。'],
  ],{skill:'listening',theme:'讨论与决策',verbs:['deliberated'],choices:['立即否决提案','宣布投票结果','起草投票规则'],senses:[sense('intentional','adj.','故意的；有意作出的','a deliberate decision','It was a deliberate decision to leave the screen blank.','把屏幕留空是有意作出的决定。','decision 是安排好的选择。形容词词尾弱读 /rət/。',null,'/dɪˈlɪbərət/')]}),
);
g4BatchFour.push(
  card('departure','n.','/dɪˈpɑːtʃə/','出发；离开','check the departure gate','Please check the departure gate before you leave the lounge.','请在离开休息室前确认出发登机口。','gate 与 lounge 指向机场，departure 交代是出发航班。',['2025-12-1','p-16-2','departure'],[
    ['arrival','/əˈraɪvəl/','到达','arrival time 是到达时间。departure time 是离开起点的时间。','The board shows an arrival time of ten thirty.','显示屏显示十点半抵达。',null,'反向'],
    ['boarding','/ˈbɔːdɪŋ/','登机或登船','boarding 是上飞机的过程，一般早于实际 departure。','Boarding starts forty minutes before takeoff.','起飞前四十分钟开始登机。','/ˈbɔːrdɪŋ/'],
  ],{skill:'listening',ipaUS:'/dɪˈpɑːrtʃər/',theme:'交通与旅行',choices:['到达；抵达','安检；检查','领取行李'],senses:[sense('change-from-norm','n.','背离惯常做法；与过去不同的变化','a departure from tradition','The design was a departure from tradition.','这一设计突破了传统。','from tradition 给出偏离的基准，没有地理出发点。')]}),
  card('dependent','adj.','/dɪˈpendənt/','取决于；依赖于','be dependent on the weather','The timing of the launch is dependent on the weather.','发射时间取决于天气。','天气是决定发射何时进行的条件。形容词后用 on 引出条件。',['2024-06-1','p-19-4','dependent'],[
    ['conditional','/kənˈdɪʃənəl/','有条件的','conditional on 常指须满足明确条件。dependent on 也可指受外部因素持续影响。','The offer is conditional on approval.','这项报价要获批后才有效。'],
    ['independent','/ˌɪndɪˈpendənt/','独立的；不依赖的','independent of the weather 表示天气不会左右安排。','The indoor session is independent of the weather.','室内场次不受天气影响。',null,'反向'],
  ],{skill:'writing',theme:'条件与因果',writing:'取决于天气（用 be 和 on）'}),
  card('dietary','adj.','/ˈdaɪətəri/','饮食方面的；与食物摄入有关的','follow dietary guidelines','The clinic helps patients follow dietary guidelines for reducing salt.','诊所帮助患者遵循减盐饮食指南。','reducing salt 交代饮食指南涉及摄入量。dietary 可以修饰 guidelines、needs 等。',['2024-06-1','p-9-1','Dietary'],[
    ['nutritional','/njuːˈtrɪʃənəl/','营养方面的','nutritional value 指食物的营养价值。dietary habits 指一个人的饮食习惯。','The label lists the nutritional value of each serving.','标签列出每份的营养价值。','/nuːˈtrɪʃənəl/'],
    ['culinary','/ˈkʌlɪnəri/','烹饪的','culinary techniques 指如何烹调食物。dietary advice 指应如何选择和摄入食物。','The course teaches basic culinary techniques.','课程教授基本烹饪技巧。','/ˈkʌləneri/'],
  ],{skill:'listening',ipaUS:'/ˈdaɪəteri/',theme:'饮食与健康',choices:['烹饪刀工的','医院建筑的','服药时间的']}),
  card('disaster','n.','/dɪˈzɑːstə/','彻底失败的事情（口语常用）','turn into a disaster','My first attempt at baking bread turned into a disaster.','我第一次烤面包，结果完全失败。','first attempt 与 baking 给出普通生活场景。disaster 在口语里夸张描述失败。',['2022-06-1','p-5-6','disasters'],[
    ['failure','/ˈfeɪljə/','失败','failure 可中性地描述没有达到目标。disaster 通常更强调结果糟透了。','The first test was a failure.','第一次测试失败了。','/ˈfeɪljər/','近义'],
    ['setback','/ˈsetbæk/','挫折；受阻','setback 常指可以继续克服的阻碍。disaster 暗示这次结果整体非常糟糕。','The delay was only a temporary setback.','这次延期只是暂时的挫折。'],
  ],{skill:'listening',ipaUS:'/dɪˈzæstər/',theme:'经历与结果',choices:['一次有趣的成功','一种烘焙配料','一项食物储存方法'],senses:[sense('calamity','n.','灾难；造成重大损害的事件','respond to a natural disaster','Volunteers helped the town recover after a natural disaster.','自然灾害发生后，志愿者帮助小镇恢复。','recover 和 natural 指实际发生的重大灾害。')]}),
  card('disorder','n.','/dɪsˈɔːdə/','障碍；影响正常功能的疾患','an anxiety disorder','She sought professional support for an anxiety disorder.','她因焦虑障碍寻求专业支持。','anxiety 限定疾患种类。此处 disorder 用于临床语境。',['2023-06-1','p-16-5','disorder'],[
    ['symptom','/ˈsɪmptəm/','症状','symptom 是某种问题表现出来的迹象。disorder 指整体的功能障碍。','The doctor asked when the symptoms began.','医生询问症状何时开始。'],
    ['distress','/dɪˈstres/','痛苦；强烈不安','distress 可描述短期感受。disorder 在医疗语境指一类疾患。','The sudden news caused considerable distress.','突如其来的消息让人很不安。'],
  ],{ipaUS:'/dɪsˈɔːrdər/',theme:'健康与心理',choices:['一种焦虑治疗方法','引发焦虑的单次事件','一个表达情绪的习惯'],senses:[sense('confusion','n.','混乱；失去秩序','fall into disorder','The files fell into disorder after the move.','搬迁之后，文件乱成一团。','files 指整理对象，此处表示排列失序。')]}),
  card('disposal','n.','/dɪˈspəʊzəl/','可供某人支配或使用（固定短语）','have tools at your disposal','The team had several specialist tools at its disposal.','团队有几件专用工具可供使用。','at its disposal 说明团队有权使用这些工具。',['2024-06-1','p-part3-section-c-2-6','disposal'],[
    ['available','/əˈveɪləbəl/','可用的','available to the team 说明团队可以得到工具。at its disposal 还强调团队可自行调配。','Two technicians are available to help.','有两名技术人员可以帮忙。',null,'近义'],
    ['permission','/pəˈmɪʃən/','许可','permission to use a tool 强调获准。at your disposal 说明工具已在你可支配的范围内。','We received permission to use the equipment.','我们获准使用设备。','/pərˈmɪʃən/'],
  ],{ipaUS:'/dɪˈspoʊzəl/',theme:'资源与管理',choices:['等待处理','必须出售','由外部人员保管'],senses:[sense('getting-rid-of','n.','处置；清除','the safe disposal of waste','The lab follows strict rules for the safe disposal of waste.','实验室遵守严格规定，安全处置废物。','of waste 引出待处置的物品。')]}),
  card('dominant','adj.','/ˈdɒmɪnənt/','占主导地位的；影响最强的','the dominant source of energy','Coal remained the dominant source of energy in the region for many years.','煤炭多年是当地占主导地位的能源。','remained 和 source of energy 描述不同来源中长期占主导的一种。',['2024-12-3','p-part3-section-c-1-1','dominant'],[
    ['leading','/ˈliːdɪŋ/','居领先地位的','a leading company 可能只是领先者之一。the dominant company 往往明显压过其他公司。','She works for a leading software firm.','她在一家领先的软件企业工作。',null,'近义'],
    ['secondary','/ˈsekəndəri/','次要的','secondary 表示作用或重要性居次。dominant 表示影响最大或最强。','Cost was a secondary concern.','成本是次要考虑。','/ˈsekənderi/','反向'],
  ],{ipaUS:'/ˈdɑːmɪnənt/',theme:'比较与判断',choices:['最晚开发的','运输距离最短的','仍然处于试验阶段的']}),
  card('editorial','adj.','/ˌedɪˈtɔːriəl/','与内容编辑或审稿有关的','provide editorial guidance','The magazine offers editorial guidance to new writers.','杂志为新作者提供编辑指导。','writers 是得到指导的人。editorial 表示与组织、修改文字内容有关。',['2022-06-1','p-1-4','editorial'],[
    ['administrative','/ədˈmɪnɪstrətɪv/','行政事务方面的','administrative support 可涉及日程和文书。editorial guidance 主要指导如何改进稿件。','The office provides administrative support.','办公室提供行政支持。','/ədˈmɪnɪstreɪt̬ɪv/'],
    ['proofreading','/ˈpruːfriːdɪŋ/','校对','proofreading 检查拼写、标点和排版错误。editorial work 也可能调整结构和观点表达。','The article needs proofreading before publication.','这篇文章出版前需要校对。'],
  ],{skill:'listening',theme:'写作与出版',choices:['与租用办公场地有关的','与报酬结算有关的','与读者订阅有关的'],senses:[sense('opinion-article','n.','社论；表达媒体编辑立场的文章','publish an editorial','The newspaper published an editorial on housing costs.','报纸发表了一篇讨论住房成本的社论。','publish 后接可数的文章。on 指出社论主题。')]}),
  card('eliminate','v.','/ɪˈlɪmɪneɪt/','消除；完全去掉','eliminate unnecessary delays','The new procedure aims to eliminate unnecessary delays.','新流程旨在消除不必要的延误。','aims to 表示目标。eliminate 说明要让延误不再出现。',['2024-06-2','p-part3-section-c-2-3','eliminate'],[
    ['reduce','/rɪˈdjuːs/','减少','reduce delays 可能还有少量延误。eliminate delays 目标是彻底消除。','The changes reduced waiting times.','改动缩短了等待时间。','/rɪˈduːs/'],
    ['prevent','/prɪˈvent/','防止','prevent 强调在发生前阻止。eliminate 可用于已经存在的问题。','Regular checks can prevent equipment failure.','定期检查能防止设备故障。'],
  ],{skill:'writing',theme:'因果与改进',verbs:['eliminated'],writing:'消除不必要的延误（用 unnecessary delays）'}),
  card('entry','n.','/ˈentri/','进入；进入的机会','prevent entry into a building','The new locks prevent unauthorized entry into the building.','新锁能防止未经授权者进入大楼。','into the building 给出进入的场所。unauthorized 限定无权进入。',['2021-12-2','p-16-4','entry'],[
    ['entrance','/ˈentrəns/','入口；进入','entrance 常指实际入口。entry 可以泛指进入这个动作或获准进入。','Please wait near the main entrance.','请在主入口附近等候。',null,'近义'],
    ['admission','/ədˈmɪʃən/','准许进入；入场','admission 可涉及许可、票或资格。entry 有时仅指从外部进入内部。','Admission to the gallery is free.','这家展馆免费入场。'],
  ],{theme:'空间与通行',choices:['建筑的通风条件','建筑的内部结构','房屋买卖登记'],senses:[sense('record','n.','记录中的一条项目','an entry in a diary','I found an old entry in my diary about the trip.','我在日记里找到一条关于这次旅行的旧记录。','in my diary 表明是记录中的一个项目。')]}),
  card('essay','n.','/ˈeseɪ/','就特定主题写成的短文','write an essay on a topic','Students wrote an essay on the causes of urban pollution.','学生写了一篇关于城市污染成因的短文。','on 后面交代短文讨论的主题。essay 常指学校布置的写作文章。',['2022-06-1','p-1-3','essays'],[
    ['article','/ˈɑːtɪkəl/','文章','article 常指报刊、期刊或网站上发表的文章。essay 可作为课程作业。','The journal published an article on air quality.','这本期刊发表了一篇关于空气质量的文章。','/ˈɑːrt̬ɪkəl/'],
    ['report','/rɪˈpɔːt/','报告','report 常分节呈现事实和结果。essay 常以段落展开观点或论证。','The team submitted a report on the survey.','团队提交了调查报告。','/rɪˈpɔːrt/'],
  ],{theme:'学习与写作',choices:['口头答辩','文章提纲','课程报名表']}),
  card('establishment','n.','/ɪˈstæblɪʃmənt/','某领域掌握影响力的机构或人士','the medical establishment','Some patients find it difficult to challenge the medical establishment.','有些患者觉得很难质疑有影响力的医疗界机构和人士。','the medical establishment 把一个领域中掌握权威的群体当作整体。',['2022-06-1','p-16-2','establishment'],[
    ['authority','/ɔːˈθɒrəti/','权威；主管机构','an authority 可指一个有权力的机构。the establishment 常泛指一套既有的权力结构及其成员。','The local authority reviews safety complaints.','地方主管部门审查安全投诉。','/əˈθɔːrət̬i/'],
    ['institution','/ˌɪnstɪˈtjuːʃən/','机构','institution 可指一家具体医院或学校。the establishment 可涵盖多家机构与其中有影响力的人。','The charity works with local institutions.','这家慈善机构与当地组织合作。','/ˌɪnstɪˈtuːʃən/'],
  ],{skill:'listening',theme:'机构与社会',choices:['医疗设备的生产过程','医院缴费流程','病人的私人病历'],senses:[sense('creation','n.','建立；设立','the establishment of a fund','The establishment of a fund made the scholarships possible.','基金的设立让奖学金成为可能。','of a fund 指建立的对象，这里是成立的动作。')]}),
  card('ethnic','adj.','/ˈeθnɪk/','族群的；与族裔文化或出身有关的','ethnic background','The study asked volunteers about their ethnic background.','研究询问志愿者的族裔背景。','ethnic 修饰 background，关注族群身份、渊源或文化背景。',['2022-06-1','p-19-3','ethnic'],[
    ['national','/ˈnæʃənəl/','国家的；国籍相关的','national origin 可指来自哪个国家。ethnic origin 关注族裔，一个国家可有多种族群。','The passport indicates her nationality.','护照显示了她的国籍。'],
    ['cultural','/ˈkʌltʃərəl/','文化的','cultural background 涵盖生活习惯等文化经历。ethnic background 更明确与族群身份相关。','The exhibition explores cultural influences on clothing.','展览探讨文化对服装的影响。'],
  ],{theme:'社会与身份',choices:['身体健康方面的','职业培训方面的','居住城市面积方面的']}),
  card('evaluation','n.','/ɪˌvæljuˈeɪʃən/','评估；按标准作出判断','an evaluation of the programme','The council commissioned an evaluation of the programme after its first year.','项目运行一年后，委员会委托对其进行评估。','after its first year 表明要根据运行情况判断项目价值或效果。',['2024-12-2','p-part3-section-c-2-2','evaluation'],[
    ['assessment','/əˈsesmənt/','评估；判断','assessment 与 evaluation 常互换。assessment 也常用于风险、能力或当前状况的测量。','The clinic carried out an assessment of his needs.','诊所评估了他的需求。',null,'近义'],
    ['description','/dɪˈskrɪpʃən/','描述','description 交代情况。evaluation 用标准判断表现或质量。','The report includes a description of each workshop.','报告描述了每场工作坊。'],
  ],{skill:'writing',theme:'研究与项目',writing:'对该项目的评估（用 an 和 of the programme）'}),
  card('evolution','n.','/ˌiːvəˈluːʃən/','演化；生物世代间逐渐发生的变化','study the evolution of species','The fossil record helps scientists study the evolution of species.','化石记录帮助科学家研究物种演化。','fossil record 提供跨世代证据。evolution 指群体的逐代变化。',['2024-06-1','p-19-3','evolution'],[
    ['adaptation','/ˌædæpˈteɪʃən/','适应；适应性特征','adaptation 可指一项在特定环境有利的特征。evolution 概括世代间变化的过程。','Thick fur is an adaptation to the cold.','厚毛是适应寒冷的一种特征。'],
    ['development','/dɪˈveləpmənt/','发展；发育','development 可描述一个个体成长。evolution 在生物语境通常是群体跨世代变化。','The team studied the development of seedlings.','团队研究了幼苗的生长。'],
  ],{ipaUS:'/ˌevəˈluːʃən/',theme:'自然与科学',choices:['单个动物的生长阶段','化石采集的地点','物种现存数量'],senses:[sense('gradual-change','n.','逐步演变','the evolution of urban transport','The museum traces the evolution of urban transport.','博物馆追溯了城市交通的演变。','urban transport 是随时代变化的事物，保留逐步变化的意思。')]}),
);
g4BatchFour.push(
  card('expansion','n.','/ɪkˈspænʃən/','扩张；范围或规模的扩大','the expansion of a rail network','The expansion of the rail network brought train services to several small towns.','铁路网的扩展让几个小镇通了火车。','brought train services to 表明网络服务范围扩大。of 后面是扩大了的事物。',['2023-06-1','p-12-2','expansion'],[
    ['extension','/ɪkˈstenʃən/','延长；延伸部分','a railway extension 常指接长的一段线路。expansion of the network 可包括多条新线。','The railway extension will open next year.','铁路延伸段明年开通。',null,'近义'],
    ['growth','/ɡrəʊθ/','增长','growth 常指数量或程度上升。expansion 也可指向新地区扩展。','The service saw rapid growth in demand.','这项服务的需求增长迅速。','/ɡroʊθ/'],
  ],{skill:'writing',theme:'交通与发展',writing:'铁路网的扩展（用 the 和 of a rail network）'}),
  card('explanation','n.','/ˌekspləˈneɪʃən/','对原因的解释；说明','an explanation for the decline','The researchers offered an explanation for the decline in attendance.','研究人员对出勤率下降给出了一种解释。','for the decline 表明要说明下降原因。offered an explanation 未说明解释已证实。',['2023-12-2','p-16-3','explanation'],[
    ['reason','/ˈriːzən/','原因；理由','reason 可指实际原因。explanation 是用语言提出的解释，其中可包含若干理由。','The main reason for the delay was bad weather.','延误的主要原因是恶劣天气。',null,'近义'],
    ['description','/dɪˈskrɪpʃən/','描述','description 说明出现了什么情况。explanation 可以进一步分析为何出现。','The description includes the time and place of the incident.','描述包括事件发生的时间和地点。'],
  ],{skill:'writing',theme:'论证与因果',writing:'对这次下降的解释（用 an 和 for the decline）'}),
  card('explicit','adj.','/ɪkˈsplɪsɪt/','直白呈现的；不加掩饰的','warn about explicit content','The service warns viewers about explicit content before a film begins.','服务平台会在影片开始前提醒观众，其中含有露骨内容。','warn viewers 和 content 表明此处提醒内容有直白描绘。',['2026-06-2','p-part3-section-c-2-2','explicit'],[
    ['graphic','/ˈɡræfɪk/','描写非常直接细致的','graphic 可强调画面或描述生动到令人不适。explicit 强调没有隐去或含蓄处理。','The article contains a graphic description of the accident.','文章对事故作了非常直接的描写。',null,'近义'],
    ['implicit','/ɪmˈplɪsɪt/','隐含的','implicit 表示需读者推断。explicit 可表示直接描绘或明确说明。','The warning was implicit rather than clearly stated.','警告是含蓄表达的，并未明说。',null,'反向'],
  ],{theme:'媒体与表达',choices:['只能收听的','经过摘要的','用密码保护的'],senses:[sense('clearly-stated','adj.','明确说明的','give explicit instructions','The teacher gave explicit instructions for submitting the form.','老师明确说明了如何提交表格。','instructions 指清楚说出的步骤，学习者无需猜测。')]}),
  card('expression','n.','/ɪkˈspreʃən/','把思想、身份或感受表达出来','allow the expression of different views','The discussion allowed the expression of different views.','讨论允许大家表达不同观点。','of different views 说明表达的内容。expression 表示表达这个过程。',['2025-12-2','p-part3-section-c-5','expression'],[
    ['communication','/kəˌmjuːnɪˈkeɪʃən/','沟通；传递信息','communication 关注信息在人与人之间传递。expression 关注思想或感受如何表现出来。','Clear communication helped the group avoid confusion.','清楚沟通帮助小组避免了混乱。'],
    ['suppression','/səˈpreʃən/','压制','suppression of different views 表示压制异议。expression of different views 是把不同观点说出来。','The report criticized the suppression of public debate.','报告批评了对公共辩论的压制。',null,'反向'],
  ],{theme:'语言与沟通',choices:['对不同观点的统一归档','对不同观点的否决','对讨论时间的限制'],senses:[sense('phrase','n.','固定说法；短语','a common expression','The teacher explained a common expression used in job interviews.','老师解释了求职面试中常用的一种说法。','a common expression 可数，指一条惯用表达。'),sense('face','n.','表情','a puzzled expression','A puzzled expression crossed his face.','他脸上掠过一丝困惑。','face 是表情出现的位置，puzzled 说明流露的情绪。')]}),
  card('external','adj.','/ɪkˈstɜːnəl/','来自外部的；非内部的','external factors','External factors such as fuel prices can change the cost of deliveries.','燃油价格等外部因素会改变配送成本。','such as 列出企业外部的影响来源。external 和 internal 的界限取决于讨论的主体。',['2024-06-2','p-part3-section-c-1-6','external'],[
    ['outside','/ˈaʊtsaɪd/','外部的；来自外面的','outside influences 接近 external influences，outside 更常用于日常说法。','The team received advice from an outside consultant.','团队获得了外部顾问的建议。',null,'近义'],
    ['internal','/ɪnˈtɜːnəl/','内部的','internal factors 如人员配置来自组织内部。external factors 如油价来自外部。','The audit identified several internal problems.','审计发现了几个内部问题。','/ɪnˈtɝːnəl/','反向'],
  ],{form:'external',ipaUS:'/ɪkˈstɝːnəl/',theme:'因果与管理',choices:['由内部流程产生的','用来记录历史的','只有短期影响的']}),
  card('extreme','adj.','/ɪkˈstriːm/','程度很高的；极端的','extreme levels of stress','Extreme levels of stress can make it difficult to concentrate.','极高的压力水平可能使人难以集中注意力。','levels 表明说的是程度。extreme 把压力放在很高的位置。',['2023-06-1','p-16-5','extreme'],[
    ['intense','/ɪnˈtens/','强烈的','intense stress 强调感受强烈。extreme levels 强调处在程度范围的极端。','She worked under intense pressure.','她在很大的压力下工作。',null,'近义'],
    ['moderate','/ˈmɒdərət/','适度的；中等的','moderate 指程度处在中等范围，与 extreme 对照。','The researchers observed a moderate increase.','研究人员观察到幅度中等的增长。','/ˈmɑːdərət/','反向'],
  ],{form:'extreme',skill:'listening',theme:'程度与心理',choices:['可以忽略的','刚刚产生的','有规律波动的']}),
  card('fossil','n. 作定语','/ˈfɒsəl/','化石的；在 fossil fuels 中指源自古生物遗存','rely on fossil fuels','Some power stations still rely on fossil fuels to generate electricity.','一些发电厂仍依靠化石燃料发电。','power stations 和 generate electricity 指能源用途。fossil fuels 包括煤、石油和天然气。',['2024-06-1','p-part3-section-c-2-6','fossil'],[
    ['remains','/rɪˈmeɪnz/','遗骸；遗存','remains 泛指留下的物质，包括较近时期的遗骸。fossil 通常指经长时间保存的生物遗存或痕迹。','Archaeologists found the remains of a wooden boat.','考古学家找到了木船的遗存。'],
    ['artifact','/ˈɑːtɪfækt/','人工制品；文物','artifact 强调由人制成。fossil 可指古代生物留下的痕迹。','The museum displayed artifacts from the settlement.','博物馆展出了这处定居点出土的文物。','/ˈɑːrt̬əfækt/'],
  ],{ipaUS:'/ˈfɑːsəl/',theme:'地质与能源',choices:['来自当季作物的','依靠太阳能的','用于实验检测的'],senses:[sense('ancient-remains','n.','化石；保存下来的古生物遗骸或痕迹','the fossil record','The fossil record shows how life changed over millions of years.','化石记录显示了数百万年间生命如何变化。','fossil 在 fossil record 中是名词修饰语，指化石提供的证据。')]}),
  card('foundation','n.','/faʊnˈdeɪʃən/','通过资金支持特定事业的基金会','receive funding from a foundation','The team received funding from a foundation that supports medical research.','团队获得了一家支持医学研究的基金会的资助。','funding 和 supports 说明基金会是提供支持的组织。',['2024-06-1','p-9-2','Foundation'],[
    ['charity','/ˈtʃærəti/','慈善组织','charity 可直接开展慈善服务。foundation 常管理资金并资助研究或公益。','The charity delivers meals to older residents.','这家慈善机构给年长居民送餐。','/ˈtʃærət̬i/'],
    ['grant','/ɡrɑːnt/','拨款；资助款','grant 是授予的资金。foundation 可是提供 grant 的组织。','The grant paid for new equipment.','这笔拨款用于购置新设备。','/ɡrænt/'],
  ],{skill:'listening',theme:'科研与资助',choices:['医学研究项目的结论','医疗保险合同','接受研究的患者群体'],senses:[sense('basis','n.','基础；支撑发展的起点','lay the foundation for further work','The pilot study laid the foundation for further research.','这项试点研究为进一步研究打下了基础。','lay the foundation for 表示建立后续发展所需的条件。')]}),
  card('frustration','n.','/frʌˈstreɪʃən/','受阻时的挫败感或懊恼','express frustration','Several users expressed frustration when the app lost their work.','应用丢失工作成果后，几位用户表示很懊恼。','成果丢失阻碍了用户的目标。frustration 是对此产生的情绪反应。',['2024-12-3','p-part3-section-c-2-8','frustration'],[
    ['disappointment','/ˌdɪsəˈpɔɪntmənt/','失望','disappointment 常因结果低于预期。frustration 常因想做成的事情不断受阻。','The cancellation was a disappointment.','取消活动让人失望。',null,'近义'],
    ['obstacle','/ˈɒbstəkəl/','障碍','obstacle 是阻碍本身。frustration 是受阻时人的感受。','A lack of time was the main obstacle.','时间不足是主要障碍。','/ˈɑːbstəkəl/'],
  ],{theme:'心理与问题',choices:['对应用成功的满足','解决故障的办法','系统错误的代码']}),
  card('functional','adj.','/ˈfʌŋkʃənəl/','仍可工作的；功能正常的','remain fully functional','The old printer remained fully functional despite its damaged cover.','尽管外壳坏了，那台旧打印机的功能仍然正常。','despite its damaged cover 与 fully functional 对照，说明外观有损但功能仍可用。',['2021-12-2','p-9-4','functional'],[
    ['operational','/ˌɒpəˈreɪʃənəl/','可以运行的；已投入使用的','operational 常指系统能投入使用。functional 常指具体部件还能完成其功能。','The new system is now operational.','新系统现已投入运行。','/ˌɑːpəˈreɪʃənəl/','近义'],
    ['decorative','/ˈdekərətɪv/','装饰性的','decorative 突出装饰用途。functional 可表示有实际功能。','The bowl is purely decorative.','这个碗仅作装饰。','/ˈdekərət̬ɪv/'],
  ],{theme:'设备与功能',choices:['外观毫无损伤的','刚刚投入市场的','只用于装饰的']}),
  card('gallery','n.','/ˈɡæləri/','陈列艺术品的展馆或画廊','visit an art gallery','We visited an art gallery that displays work by local artists.','我们参观了一个展出本地艺术家作品的画廊。','displays work 与 artists 表明这是展示艺术品的场所。',['2022-12-2','p-5-1','gallery'],[
    ['museum','/mjuˈziːəm/','博物馆','museum 可涵盖历史、自然或科学藏品。gallery 常指艺术品展出的馆或房间。','The museum houses a collection of fossils.','博物馆收藏了一批化石。'],
    ['exhibition','/ˌeksɪˈbɪʃən/','展览','exhibition 是一次展出。gallery 是办展或陈列作品的场所。','The exhibition runs until next month.','这场展览持续到下个月。'],
  ],{skill:'listening',theme:'艺术与文化',choices:['艺术品定价目录','当地艺术家的工作室','参观者的登记表']}),
  card('generous','adj.','/ˈdʒenərəs/','慷慨的；愿意给予的','be generous with your time','She was generous with her time and helped every new volunteer settle in.','她慷慨投入自己的时间，帮助每位新志愿者适应。','with her time 说明她愿意付出的是时间。generous 也可指乐于分享物品或金钱。',['2022-12-2','p-16-4','generous'],[
    ['kind','/kaɪnd/','善良的；友好的','kind 描述为人友善。generous 具体强调愿意给出时间、物品或资源。','It was kind of him to show us the way.','他给我们指路，真热心。'],
    ['stingy','/ˈstɪndʒi/','吝啬的','stingy 指不愿付出钱或资源，与 generous 方向相反。','The café was stingy with the portions.','这家咖啡馆给的份量很小。',null,'反向'],
  ],{theme:'人际与评价',choices:['不愿提供任何帮助的','只接受正式培训的','对新任务特别紧张的'],senses:[sense('favourable','adj.','宽厚的；给出的条件优厚的','generous tax concessions','The agreement included generous tax concessions for new businesses.','协议为新企业提供了优厚的税收优惠。','tax concessions 是优惠措施，generous 表示减免力度大。',['2026-06-1','p-part3-section-c-2-7','generous'])]}),
);
g4BatchFour.push(
  card('genuine','adj.','/ˈdʒenjuɪn/','真诚的；发自内心的','show genuine concern','She showed genuine concern when her colleague fell ill.','同事生病时，她表现出真切的关心。','show concern 说明表现出关心。genuine 强调关心出于真实感受。',['2021-12-2','p-19-1','genuine'],[
    ['sincere','/sɪnˈsɪə/','真诚的','sincere concern 可互换。genuine 还常与 fake 对照，用于物品。','He offered a sincere apology.','他真诚地道了歉。','/sɪnˈsɪr/','近义'],
    ['superficial','/ˌsuːpəˈfɪʃəl/','浮于表面的','superficial concern 只停留在表面。genuine concern 表示确实在乎。','A superficial review would miss these errors.','流于表面的审查会漏掉这些错误。','/ˌsuːpərˈfɪʃəl/','反向'],
  ],{theme:'人际与情绪',choices:['刻意装出来的','礼貌但敷衍的','只维持一瞬的'],senses:[sense('authentic-item','adj.','真品的；确实属于所说种类的','genuine leather','The label says the bag is made of genuine leather.','标签称这只包用真皮制成。','leather 是材料，genuine 表明它确实是皮革。')]}),
  card('gradually','adv.','/ˈɡrædʒuəli/','逐渐地；一点点地','gradually improve','The students’ confidence gradually improved as they practised.','随着练习，学生们的信心逐渐增强。','as they practised 表明变化随反复练习发生。gradually 不限定每次提高的幅度。',['2023-06-1','p-19-1','gradually'],[
    ['steadily','/ˈstedɪli/','稳定地；持续地','steadily 还强调趋势稳定、少有波动。gradually 只侧重变化分阶段发生。','The number of applications rose steadily.','申请数量稳步增加。',null,'近义'],
    ['suddenly','/ˈsʌdənli/','突然地','suddenly 指变化在很短时间内出现。gradually 指逐步变化。','The lights suddenly went out.','灯突然熄灭了。',null,'反向'],
  ],{skill:'listening',theme:'变化与趋势',choices:['毫无征兆地','有意隐瞒地','不计后果地']}),
  card('hazard','n.','/ˈhæzəd/','可能造成伤害的危险因素','identify workplace hazards','The inspection helped identify workplace hazards such as damaged cables.','这次检查帮助找出了电线破损等工作场所的危险因素。','such as 引出实际的危险源。identify 表示把这些危险源辨认出来。',['2024-06-1','p-part3-section-c-1-8','hazards'],[
    ['risk','/rɪsk/','风险；发生损害的可能性','damaged cables 是 hazard。由其引起触电的可能性是 risk。','Protective gloves can reduce the risk of injury.','防护手套可以降低受伤风险。'],
    ['incident','/ˈɪnsɪdənt/','事件','incident 指已经发生的事。hazard 是事前也可识别的危险源。','The supervisor recorded the incident.','主管记录了这起事件。'],
  ],{form:'hazards',skill:'writing',ipaUS:'/ˈhæzərd/',theme:'工作与安全',writing:'识别工作场所的危险因素（用 identify 和 workplace，末词用复数）'}),
  card('headline','n.','/ˈhedlaɪn/','新闻标题','read the news headlines','I usually read the news headlines on the train.','我通常在火车上浏览新闻标题。','read 与 news 表明快速浏览各条报道的标题。',['2023-12-2','p-22-1','headlines'],[
    ['title','/ˈtaɪtəl/','标题；题名','title 可用于书、影片或文章。headline 尤指新闻报道的标题。','The title of the book is printed on its cover.','书名印在封面上。',null,'近义'],
    ['caption','/ˈkæpʃən/','图片说明文字','caption 通常随图出现，解释图片内容。headline 用来给新闻报道命名。','The caption gives the photographer’s name.','图片说明标出了摄影师的姓名。'],
  ],{form:'headlines',skill:'listening',theme:'媒体与传播',choices:['整篇新闻正文','用于新闻的配图','读者的来信'],senses:[sense('make-news','短语','成为新闻焦点；引发媒体报道','make headlines','The local team made headlines after winning the national final.','赢得全国决赛后，这支地方队成了新闻焦点。','after winning 是被媒体关注的原因。make headlines 是固定搭配。',['2021-12-2','p-1-1','headlines'])]}),
  card('hierarchy','n.','/ˈhaɪərɑːki/','按权力或地位排列的等级体系','a management hierarchy','The new system removed a layer from the management hierarchy.','新制度精简了管理层级中的一级。','layer 表示一个层级。management 交代等级关系存在于组织管理中。',['2025-12-1','p-5-14','hierarchy'],[
    ['structure','/ˈstrʌktʃə/','结构','management structure 可以包括分工和汇报渠道。hierarchy 特别强调权力有高低层级。','The organization changed its management structure.','该组织改变了管理结构。','/ˈstrʌktʃər/','近义'],
    ['network','/ˈnetwɜːk/','相互联系的网络','network 侧重不同成员之间的联系。hierarchy 侧重上下级顺序。','The project built a network of local partners.','项目建立了本地合作伙伴网络。','/ˈnetwɝːk/'],
  ],{ipaUS:'/ˈhaɪərɑːrki/',theme:'组织与制度',choices:['组织的一处办公地点','所有员工的名单','客户评价的数据库']}),
  card('ideal','n.','/aɪˈdɪəl/','被认为完美、值得追求的标准','challenge a beauty ideal','The campaign challenged the idea that everyone should fit one beauty ideal.','这场倡议质疑人人都应符合单一审美标准的观念。','fit one beauty ideal 指符合一种被视为完美的外形标准。',['2024-12-1','p-part3-section-c-2-2','ideal'],[
    ['standard','/ˈstændəd/','标准','standard 可是衡量合格的最低要求。ideal 侧重被看作完美的状态。','The product meets the safety standard.','这个产品符合安全标准。','/ˈstændərd/'],
    ['reality','/riˈæləti/','现实；真实状况','reality 是实际情况。ideal 是想达到或被看作完美的状态。','The reality was more complicated than expected.','现实比预想的复杂。','/riˈælət̬i/','反向'],
  ],{ipaUS:'/aɪˈdiːəl/',theme:'文化与评价',choices:['常见服装尺码','用于整形的技术','已验证的人口统计'],senses:[sense('perfect-for','adj.','理想的；最适合的','an ideal place to study','The library is an ideal place to study in the evening.','晚上去图书馆学习很理想。','to study 给出用途，ideal 表示非常适合这种用途。')]}),
  card('immune','adj.','/ɪˈmjuːn/','免疫的；与身体防御疾病有关的','the immune system','Vaccination helps the immune system recognize a virus.','接种疫苗有助于免疫系统识别病毒。','virus 是免疫系统要识别的对象。immune system 是身体防御机制的固定表达。',['2025-06-2','p-16-1','immune'],[
    ['resistant','/rɪˈzɪstənt/','有抵抗力的','resistant to disease 可指较不容易受疾病影响。immune system 是防御系统的名称。','Some plants are resistant to this disease.','有些植物对这种病有抵抗力。'],
    ['vulnerable','/ˈvʌlnərəbəl/','容易受伤害的','vulnerable to infection 表示容易受到感染。immune to a disease 表示对该病有免疫力。','Very young animals are vulnerable to infection.','很幼小的动物容易感染。',null,'反向'],
  ],{skill:'listening',theme:'健康与科学',choices:['与消化吸收有关的','与体温测量有关的','与血液运输有关的'],senses:[sense('protected-from','adj.','不受某事影响的；免受某事的','be immune to criticism','No public figure is immune to criticism.','公众人物都可能受到批评。','criticism 是外界批评，此处把免疫引申为免受某种影响。')]}),
  card('implementation','n.','/ˌɪmplɪmenˈteɪʃən/','实施；把计划付诸行动','the implementation of a plan','The implementation of the plan began with a trial in two schools.','这项计划从两所学校的试点开始实施。','began with a trial 说明计划从构想到真正开始执行。真题中 implementation intentions 特指用于落实意图的具体计划。',['2026-06-2','p-16-2','implementation'],[
    ['planning','/ˈplænɪŋ/','规划','planning 决定要做什么、怎么做。implementation 把规划落实到行动中。','Planning took three months.','规划工作花了三个月。'],
    ['execution','/ˌeksɪˈkjuːʃən/','执行','execution 和 implementation 都可指落实。execution 也常指具体任务执行的过程和质量。','Good execution matters as much as a good plan.','出色的执行和好的计划同样重要。',null,'近义'],
  ],{skill:'writing',theme:'计划与执行',writing:'一项计划的实施（用 the 和 of a plan）'}),
  card('incidence','n.','/ˈɪnsɪdəns/','某类事件或疾病的发生率','track the incidence of flu','Researchers track the incidence of flu in different age groups.','研究人员追踪不同年龄组的流感发生率。','in different age groups 限定统计人群。incidence 描述一段时间内新发生情况。',['2026-06-1','p-part3-section-c-5','incidence'],[
    ['prevalence','/ˈprevələns/','患病率；普遍程度','prevalence 可统计某个时间点已有多少病例。incidence 关注期间新增病例。','The survey measured the prevalence of asthma.','调查测量了哮喘的患病率。'],
    ['incident','/ˈɪnsɪdənt/','一次事件','an incident 是一件具体的事。incidence 可以概括这类事件发生的多少。','The police recorded one incident that morning.','警方记录了那天早上的一起事件。'],
  ],{theme:'研究与数据',choices:['流感症状的种类','一次具体的流感病例','患者平均年龄']}),
  card('inclusive','adj.','/ɪnˈkluːsɪv/','包容的；让不同人群都能参与的','build a more inclusive community','The library aims to build a more inclusive community by making events accessible.','图书馆希望让更多人能参加活动，建设更包容的社区。','making events accessible 给出让不同人群参与的实际措施。',['2025-12-1','p-part3-section-c-2-9','inclusive'],[
    ['welcoming','/ˈwelkəmɪŋ/','使人感到受欢迎的','welcoming 强调友好感受。inclusive 也关注规则和安排是否让不同群体都能参与。','The staff created a welcoming atmosphere.','工作人员营造了热情友好的氛围。',null,'近义'],
    ['exclusive','/ɪkˈskluːsɪv/','专供部分人使用的','an exclusive club 只对某些人开放。an inclusive community 努力让不同人都参与。','The lounge is exclusive to members.','休息区仅供会员使用。',null,'反向'],
  ],{skill:'writing',theme:'社会与参与',writing:'建设一个更包容的社区（用 build a more 和 community）',senses:[sense('all-included','adj.','全包的；价格已包括各项服务的','an all-inclusive stay','We booked an all-inclusive stay with meals and drinks.','我们订了含餐饮的全包住宿。','meals and drinks 列出价格内已含的服务。作前置形容词时通常加连字符。',['2026-06-2','p-1-6','inclusive'])]}),
  card('index','n.','/ˈɪndeks/','指数；用来表示或比较情况的指标','track an index over time','Economists track a price index to see how costs change over time.','经济学家跟踪价格指数，了解成本如何随时间变化。','track 和 how costs change 表明 index 是可连续比较的数值。',['2024-12-1','p-22-2','index'],[
    ['indicator','/ˈɪndɪkeɪtə/','指标；迹象','indicator 可以是定性的线索。index 通常以数字表示，常用来比较时间或群体。','Waiting times are an indicator of demand.','等待时间是需求的一个指标。','/ˈɪndɪkeɪtər/','近义'],
    ['average','/ˈævərɪdʒ/','平均值','average 通常概括一组数的中心水平。index 可以将多个量与基准比较。','The average was higher this month.','本月平均值更高。'],
  ],{theme:'研究与经济',choices:['价格统计所依据的一张原始发票','经济学家姓名列表','商店的产品类别'],senses:[sense('lookup-list','n.','索引；查找条目的列表','look up a topic in the index','Look up the topic in the index at the back of the book.','在书末的索引里查一下这个主题。','at the back of the book 指查找工具所在位置。索引通常指向具体页码。')]}),
  card('inevitable','adj.','/ɪnˈevɪtəbəl/','不可避免的；必然会发生的','an inevitable change','As the population grew, changes to public transport became inevitable.','随着人口增长，公共交通发生调整已不可避免。','became inevitable 表明条件变化后调整难以避免。',['2024-12-2','p-part3-section-c-1-7','inevitable'],[
    ['unavoidable','/ˌʌnəˈvɔɪdəbəl/','无法避免的','unavoidable change 可互换。inevitable 也强调事情发展到这一步必然会发生。','Some delays were unavoidable during the repairs.','维修期间有些延误无法避免。',null,'近义'],
    ['likely','/ˈlaɪkli/','很可能的','likely 表示概率较高，仍可能不发生。inevitable 表示无法避开。','A short delay is likely this morning.','今天早上很可能会短暂延误。'],
  ],{theme:'因果与预测',choices:['有时可以忽略的','刚被写入记录的','由个人喜好决定的']}),
);
