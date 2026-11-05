import { day } from './learning.mjs';

const firstDay = Date.parse('2026-11-05');
const dayMs = 86_400_000;

const quotes = [
  ["Every word you recall makes the next reading a little easier.","今天多想起一个词，下次阅读就轻松一点。"],
  ["Before you peek, give your memory a moment.","揭晓答案前，再给自己一点时间回想。"],
  ["A word you missed is a word worth meeting again.","没想起来的词，值得再见一面。"],
  ["When a sentence feels hard, start with the words you know.","句子读不懂时，就从认识的词读起。"],
  ["One phrase you can use is a small win worth keeping.","学会一个用得上的短语，就是实实在在的进步。"],
  ["Every time you come back, you give yesterday’s effort a chance to stick.","每回来复习一次，昨天学的就记得牢一点。"],
  ["On a busy day, five focused minutes still count.","再忙，认真学五分钟也算数。"],
  ["A guess you check can teach you more than a glance at the answer.","先猜一猜再核对，比直接看答案多学一点。"],
  ["You only have to find the next word, one word at a time.","先记住眼前这个词，一个一个来。"],
  ["The sound that slipped past you is worth a second listen.","刚刚没听清的词，值得再听一遍。"],
  ["A familiar word in a new sentence is a chance to learn it again.","熟词遇上新句子，又多了一次认识它的机会。"],
  ["Some words take longer to stick, and you have time to revisit them.","有些词要多见几次才记得住，慢慢来。"],
  ["Try the phrase out loud and hear how the words fit together.","把短语念出来，听听这些词是怎么搭在一起的。"],
  ["The effort to remember is part of what helps a word stick.","每一次努力回想，都在帮你记牢这个词。"],
  ["A short review can keep a good week of learning within reach.","花一点时间复习，这一周学的词就更容易想起来。"],
  ["Read to the end of the sentence and see what becomes clearer.","读到句尾，再看看哪些地方变清楚了。"],
  ["When two words seem alike, one good example can show where they differ.","两个词看着相近，一个好例句就能看出差别。"],
  ["The phrase that comes to mind a little faster today shows how far you’ve come.","今天想得更快的那个短语，就是你进步的证据。"],
  ["Make one sentence of your own and give a new word somewhere to live.","自己造个句子，给新词找个落脚的地方。"],
  ["Start with the review you can finish today.","先做完今天力所能及的复习。"],
  ["The more often you hear a phrase, the easier it is to catch in a sentence.","一个短语听得越熟，就越容易在句子里听出来。"],
  ["Coming back after a missed day is a skill worth practicing.","哪怕中断了一天，重新开始也是一种本领。"],
  ["Say the phrase once more and notice where the stress falls.","再读一遍短语，听听重音落在哪里。"],
  ["A sentence you finally understand is worth pausing over.","终于读懂一个句子，值得停下来体会一下。"],
  ["A word that feels just out of reach today may come back faster next time.","今天差一点想起来的词，下次也许就能更快想起。"],
  ["Start with the easiest card and let it get you going.","先做最简单的一张卡，让自己进入状态。"],
  ["One useful phrase can open up a whole paragraph.","一个关键短语，有时能帮你读懂整段话。"],
  ["Leave yourself a clue you’ll recognize tomorrow.","给明天的自己留一条认得出来的线索。"],
  ["When a word keeps slipping away, try remembering it in a different sentence.","一个词总记不住，就换个句子再试试。"],
  ["Notice the words that have started to feel familiar.","留意那些已经渐渐眼熟的词。"],
  ["Rest gives tomorrow’s practice a better starting point.","休息一下，明天学起来会更有精神。"],
  ["Read the sentence again and see what you missed the first time.","把句子再读一遍，看看第一遍漏掉了什么。"],
  ["Listen for the whole phrase and see if the meaning clicks.","试着听完整个短语，意思也许就顺了。"],
  ["A small mistake tells you exactly what to practice next.","一个小错误，刚好告诉你接下来该练什么。"],
  ["Give a tricky word one clear example to come back to.","给难记的词挑一个清楚的例句，下次再用它回想。"],
  ["The words you use in your own sentences become easier to reach.","放进自己句子里用过的词，会更容易想起来。"],
  ["Take your time with a tough card and give the answer a fair chance to come back.","遇到难卡时慢一点，等一等答案浮现。"],
  ["Take a breath and read what’s in front of you, one sentence at a time.","深呼吸，专心读眼前的句子，一句一句来。"],
  ["A little distance can make yesterday’s difficult word clearer.","隔一段时间再看，昨天难懂的词可能就清楚了。"],
  ["Revisit the phrases you can imagine yourself saying.","复习那些你真的可能会用到的短语。"],
  ["Even on a slow day, one careful answer is good practice.","哪怕今天学得慢，认真答一张卡也有收获。"],
  ["Think of where you might hear this word outside a study session.","想想除了背词，你还可能在哪儿听到这个词。"],
  ["Let the next sentence show you what this word can do.","看看下一个句子里，这个词还能怎么用。"],
  ["When the right phrase comes to you on its own, take a moment to enjoy it.","当那个短语自己冒出来时，停一下，享受这一刻。"],
  ["Pick one word you’re glad to know and carry it into tomorrow.","挑一个你很高兴学会的词，把它带到明天。"],
];

export function dailyQuote(now) {
  const daysSinceFirst = (Date.parse(day(now)) - firstDay) / dayMs;
  const index = ((daysSinceFirst % quotes.length) + quotes.length) % quotes.length;
  const [english, chinese] = quotes[index];
  return { english, chinese };
}
