const CJK = '\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30fa\u30fc-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff';

// ANS is short for Alphabets, Numbers, and Symbols.
//
// A includes A-Za-z\u0370-\u03ff
// N includes 0-9
// S includes `~!@#$%^&*()-_=+[]{}\|;:'",<.>/?
//
// some S below does not include all symbols

const ANY_CJK = new RegExp(`[${CJK}]`);

// the symbol part only includes ~ ! ; : , . ? but . only matches one character
const CONVERT_TO_FULLWIDTH_CJK_SYMBOLS_CJK = new RegExp(`([${CJK}])[ ]*([\\:]+|\\.)[ ]*([${CJK}])`, 'g');
const CONVERT_TO_FULLWIDTH_CJK_SYMBOLS = new RegExp(`([${CJK}])[ ]*([~\\!;,\\?]+)[ ]*`, 'g');
const DOTS_CJK = new RegExp(`([\\.]{2,}|\u2026)([${CJK}])`, 'g');
const FIX_CJK_COLON_ANS = new RegExp(`([${CJK}])\\:([A-Z0-9\\(\\)])`, 'g');

// the symbol part does not include '
const CJK_QUOTE = new RegExp(`([${CJK}])([\`"\u05f4])`, 'g');
const QUOTE_CJK = new RegExp(`([\`"\u05f4])([${CJK}])`, 'g');
const FIX_QUOTE_ANY_QUOTE = /([`"\u05f4]+)[ ]*(.+?)[ ]*([`"\u05f4]+)/g;

const CJK_SINGLE_QUOTE_BUT_POSSESSIVE = new RegExp(`([${CJK}])('[^s])`, 'g');
const SINGLE_QUOTE_CJK = new RegExp(`(')([${CJK}])`, 'g');
const FIX_POSSESSIVE_SINGLE_QUOTE = new RegExp(`([A-Za-z0-9${CJK}])( )('s)`, 'g');

const HASH_ANS_CJK_HASH = new RegExp(`([${CJK}])(#)([${CJK}]+)(#)([${CJK}])`, 'g');
const CJK_HASH = new RegExp(`([${CJK}])(#([^ ]))`, 'g');
const HASH_CJK = new RegExp(`(([^ ])#)([${CJK}])`, 'g');

// the symbol part only includes + - * / = & | < >
const CJK_OPERATOR_ANS = new RegExp(`([${CJK}])([\\+\\-\\*\\/=&\\|<>])([A-Za-z0-9])`, 'g');
const ANS_OPERATOR_CJK = new RegExp(`([A-Za-z0-9])([\\+\\-\\*\\/=&\\|<>])([${CJK}])`, 'g');

const FIX_SLASH_AS = /([/]) ([a-z\-_\./]+)/g;
const FIX_SLASH_AS_SLASH = /([/\.])([A-Za-z\-_\./]+) ([/])/g;

// the bracket part only includes ( ) [ ] { } < > “ ”
const CJK_LEFT_BRACKET = new RegExp(`([${CJK}])([\\(\\[\\{<>\u201c])`, 'g');
const RIGHT_BRACKET_CJK = new RegExp(`([\\)\\]\\}<>\u201d])([${CJK}])`, 'g');
const FIX_LEFT_BRACKET_ANY_RIGHT_BRACKET = /([\(\[\{<\u201c]+)[ ]*(.+?)[ ]*([\)\]\}>\u201d]+)/;
const ANS_CJK_LEFT_BRACKET_ANY_RIGHT_BRACKET = new RegExp(`([A-Za-z0-9${CJK}])[ ]*([\u201c])([A-Za-z0-9${CJK}\\-_ ]+)([\u201d])`, 'g');
const LEFT_BRACKET_ANY_RIGHT_BRACKET_ANS_CJK = new RegExp(`([\u201c])([A-Za-z0-9${CJK}\\-_ ]+)([\u201d])[ ]*([A-Za-z0-9${CJK}])`, 'g');

const AN_LEFT_BRACKET = /([A-Za-z0-9])([\(\[\{])/g;
const RIGHT_BRACKET_AN = /([\)\]\}])([A-Za-z0-9])/g;

const CJK_ANS = new RegExp(`([${CJK}])([A-Za-z\u0370-\u03ff0-9@\\$%\\^&\\*\\-\\+\\\\=\\|/\u00a1-\u00ff\u2150-\u218f\u2700—\u27bf])`, 'g');
const ANS_CJK = new RegExp(`([A-Za-z\u0370-\u03ff0-9~\\$%\\^&\\*\\-\\+\\\\=\\|/!;:,\\.\\?\u00a1-\u00ff\u2150-\u218f\u2700—\u27bf])([${CJK}])`, 'g');

const S_A = /(%)([A-Za-z])/g;

const MIDDLE_DOT = /([ ]*)([\u00b7\u2022\u2027])([ ]*)/g;

function convertToFullwidth(symbols) {
  return symbols
  .replace(/~/g, '～')
  .replace(/!/g, '！')
  .replace(/;/g, '；')
  .replace(/:/g, '：')
  .replace(/,/g, '，')
  .replace(/\./g, '。')
  .replace(/\?/g, '？');
}

function spacing(text) {
  if (typeof text !== 'string') {
    return text;
  }

  if (text.length <= 1 || !ANY_CJK.test(text)) {
    return text;
  }

  let newText = text;

  // https://stackoverflow.com/questions/4285472/multiple-regex-replace
  newText = newText.replace(CONVERT_TO_FULLWIDTH_CJK_SYMBOLS_CJK, (match, leftCjk, symbols, rightCjk) => {
    const fullwidthSymbols = convertToFullwidth(symbols);
    return `${leftCjk}${fullwidthSymbols}${rightCjk}`;
  });

  newText = newText.replace(CONVERT_TO_FULLWIDTH_CJK_SYMBOLS, (match, cjk, symbols) => {
    const fullwidthSymbols = convertToFullwidth(symbols);
    return `${cjk}${fullwidthSymbols}`;
  });

  newText = newText.replace(DOTS_CJK, '$1 $2');
  newText = newText.replace(FIX_CJK_COLON_ANS, '$1：$2');

  newText = newText.replace(CJK_QUOTE, '$1 $2');
  newText = newText.replace(QUOTE_CJK, '$1 $2');
  newText = newText.replace(FIX_QUOTE_ANY_QUOTE, '$1$2$3');

  newText = newText.replace(CJK_SINGLE_QUOTE_BUT_POSSESSIVE, '$1 $2');
  newText = newText.replace(SINGLE_QUOTE_CJK, '$1 $2');
  newText = newText.replace(FIX_POSSESSIVE_SINGLE_QUOTE, "$1's"); // eslint-disable-line quotes

  newText = newText.replace(HASH_ANS_CJK_HASH, '$1 $2$3$4 $5');
  newText = newText.replace(CJK_HASH, '$1 $2');
  newText = newText.replace(HASH_CJK, '$1 $3');

  newText = newText.replace(CJK_OPERATOR_ANS, '$1 $2 $3');
  newText = newText.replace(ANS_OPERATOR_CJK, '$1 $2 $3');

  newText = newText.replace(FIX_SLASH_AS, '$1$2');
  newText = newText.replace(FIX_SLASH_AS_SLASH, '$1$2$3');

  newText = newText.replace(CJK_LEFT_BRACKET, '$1 $2');
  newText = newText.replace(RIGHT_BRACKET_CJK, '$1 $2');
  newText = newText.replace(FIX_LEFT_BRACKET_ANY_RIGHT_BRACKET, '$1$2$3');
  newText = newText.replace(ANS_CJK_LEFT_BRACKET_ANY_RIGHT_BRACKET, '$1 $2$3$4');
  newText = newText.replace(LEFT_BRACKET_ANY_RIGHT_BRACKET_ANS_CJK, '$1$2$3 $4');

  newText = newText.replace(AN_LEFT_BRACKET, '$1 $2');
  newText = newText.replace(RIGHT_BRACKET_AN, '$1 $2');

  newText = newText.replace(CJK_ANS, '$1 $2');
  newText = newText.replace(ANS_CJK, '$1 $2');

  newText = newText.replace(S_A, '$1 $2');

  newText = newText.replace(MIDDLE_DOT, '・');

  // DEBUG
  // String.prototype.replace = String.prototype.rawReplace;

  return newText;
}

t=spacing("(你+我)))")
console.log(t)

function assert_equal(a, b) {
  if (a == b)
    console.log('pass')
  else
    console.error('failed')
}

function it(name, callbk) {
  console.log(name)
  callbk()
}

it('略過 _ 符號', () => {
  assert_equal(spacing('前面_後面'), '前面_後面');
  assert_equal(spacing('前面 _ 後面'), '前面 _ 後面');
  assert_equal(spacing('Vinta_Mollie'), 'Vinta_Mollie');
  assert_equal(spacing('Vinta _ Mollie'), 'Vinta _ Mollie');
});

// 兩邊都加空格

it('處理 Alphabets', () => {
  assert_equal(spacing('中文abc'), '中文 abc');
  assert_equal(spacing('abc中文'), 'abc 中文');
});

it('處理 Numbers', () => {
  assert_equal(spacing('中文123'), '中文 123');
  assert_equal(spacing('123中文'), '123 中文');
});

// https://unicode-table.com/en/blocks/latin-1-supplement/
it('處理 Latin-1 Supplement', () => {
  assert_equal(spacing('中文Ø漢字'), '中文 Ø 漢字');
  assert_equal(spacing('中文 Ø 漢字'), '中文 Ø 漢字');
});

// https://unicode-table.com/en/blocks/greek-coptic/
it('處理 Greek and Coptic', () => {
  assert_equal(spacing('中文β漢字'), '中文 β 漢字');
  assert_equal(spacing('中文 β 漢字'), '中文 β 漢字');
  assert_equal(spacing('我是α，我是Ω'), '我是 α，我是 Ω');
});

// https://unicode-table.com/en/blocks/number-forms/
it('處理 Number Forms', () => {
  assert_equal(spacing('中文Ⅶ漢字'), '中文 Ⅶ 漢字');
  assert_equal(spacing('中文 Ⅶ 漢字'), '中文 Ⅶ 漢字');
});

// https://unicode-table.com/en/blocks/cjk-radicals-supplement/
it('處理 CJK Radicals Supplement', () => {
  assert_equal(spacing('abc⻤123'), 'abc ⻤ 123');
  assert_equal(spacing('abc ⻤ 123'), 'abc ⻤ 123');
});

// https://unicode-table.com/en/blocks/kangxi-radicals/
it('處理 Kangxi Radicals', () => {
  assert_equal(spacing('abc⾗123'), 'abc ⾗ 123');
  assert_equal(spacing('abc ⾗ 123'), 'abc ⾗ 123');
});

// https://unicode-table.com/en/blocks/hiragana/
it('處理 Hiragana', () => {
  assert_equal(spacing('abcあ123'), 'abc あ 123');
  assert_equal(spacing('abc あ 123'), 'abc あ 123');
});

// https://unicode-table.com/en/blocks/katakana/
it('處理 Katakana', () => {
  assert_equal(spacing('abcア123'), 'abc ア 123');
  assert_equal(spacing('abc ア 123'), 'abc ア 123');
});

// https://unicode-table.com/en/blocks/bopomofo/
it('處理 Bopomofo', () => {
  assert_equal(spacing('abcㄅ123'), 'abc ㄅ 123');
  assert_equal(spacing('abc ㄅ 123'), 'abc ㄅ 123');
});

// https://unicode-table.com/en/blocks/enclosed-cjk-letters-and-months/
it('處理 Enclosed CJK Letters And Months', () => {
  assert_equal(spacing('abc㈱123'), 'abc ㈱ 123');
  assert_equal(spacing('abc ㈱ 123'), 'abc ㈱ 123');
});

// https://unicode-table.com/en/blocks/cjk-unified-ideographs-extension-a/
it('處理 CJK Unified Ideographs Extension-A', () => {
  assert_equal(spacing('abc㐂123'), 'abc 㐂 123');
  assert_equal(spacing('abc 㐂 123'), 'abc 㐂 123');
});

// https://unicode-table.com/en/blocks/cjk-unified-ideographs/
it('處理 CJK Unified Ideographs', () => {
  assert_equal(spacing('abc丁123'), 'abc 丁 123');
  assert_equal(spacing('abc 丁 123'), 'abc 丁 123');
});

// https://unicode-table.com/en/blocks/cjk-compatibility-ideographs/
it('處理 CJK Compatibility Ideographs', () => {
  assert_equal(spacing('abc車123'), 'abc 車 123');
  assert_equal(spacing('abc 車 123'), 'abc 車 123');
});

it('處理 $ 符號', () => {
  assert_equal(spacing('前面$後面'), '前面 $ 後面');
  assert_equal(spacing('前面 $ 後面'), '前面 $ 後面');
  assert_equal(spacing('前面$100後面'), '前面 $100 後面');
});

it('處理 % 符號', () => {
  assert_equal(spacing('前面%後面'), '前面 % 後面');
  assert_equal(spacing('前面 % 後面'), '前面 % 後面');
  assert_equal(spacing('前面100%後面'), '前面 100% 後面');
  assert_equal(spacing('新八的構造成分有95%是眼鏡、3%是水、2%是垃圾'), '新八的構造成分有 95% 是眼鏡、3% 是水、2% 是垃圾');
});

it('處理 ^ 符號', () => {
  assert_equal(spacing('前面^後面'), '前面 ^ 後面');
  assert_equal(spacing('前面 ^ 後面'), '前面 ^ 後面');
});

it('處理 & 符號', () => {
  assert_equal(spacing('前面&後面'), '前面 & 後面');
  assert_equal(spacing('前面 & 後面'), '前面 & 後面');
  assert_equal(spacing('Vinta&Mollie'), 'Vinta&Mollie');
  assert_equal(spacing('Vinta&陳上進'), 'Vinta & 陳上進');
  assert_equal(spacing('陳上進&Vinta'), '陳上進 & Vinta');
  assert_equal(spacing('得到一個A&B的結果'), '得到一個 A&B 的結果');
});

it('處理 * 符號', () => {
  assert_equal(spacing('前面*後面'), '前面 * 後面');
  assert_equal(spacing('前面 * 後面'), '前面 * 後面');
  assert_equal(spacing('前面* 後面'), '前面 * 後面');
  assert_equal(spacing('前面 *後面'), '前面 * 後面');
  assert_equal(spacing('Vinta*Mollie'), 'Vinta*Mollie');
  assert_equal(spacing('Vinta*陳上進'), 'Vinta * 陳上進');
  assert_equal(spacing('陳上進*Vinta'), '陳上進 * Vinta');
  assert_equal(spacing('得到一個A*B的結果'), '得到一個 A*B 的結果');
});

it('處理 - 符號', () => {
  assert_equal(spacing('前面-後面'), '前面 - 後面');
  assert_equal(spacing('前面 - 後面'), '前面 - 後面');
  assert_equal(spacing('Vinta-Mollie'), 'Vinta-Mollie');
  assert_equal(spacing('Vinta-陳上進'), 'Vinta - 陳上進');
  assert_equal(spacing('陳上進-Vinta'), '陳上進 - Vinta');
  assert_equal(spacing('得到一個A-B的結果'), '得到一個 A-B 的結果');
  assert_equal(spacing('长者的智慧和复杂的维斯特洛- 文章'), '长者的智慧和复杂的维斯特洛 - 文章');

  // TODO
  // assert_equal(spacing('陳上進--Vinta'), '陳上進 -- Vinta');
});

it('處理 = 符號', () => {
  assert_equal(spacing('前面=後面'), '前面 = 後面');
  assert_equal(spacing('前面 = 後面'), '前面 = 後面');
  assert_equal(spacing('Vinta=Mollie'), 'Vinta=Mollie');
  assert_equal(spacing('Vinta=陳上進'), 'Vinta = 陳上進');
  assert_equal(spacing('陳上進=Vinta'), '陳上進 = Vinta');
  assert_equal(spacing('得到一個A=B的結果'), '得到一個 A=B 的結果');
});

it('處理 + 符號', () => {
  assert_equal(spacing('前面+後面'), '前面 + 後面');
  assert_equal(spacing('前面 + 後面'), '前面 + 後面');
  assert_equal(spacing('Vinta+Mollie'), 'Vinta+Mollie');
  assert_equal(spacing('Vinta+陳上進'), 'Vinta + 陳上進');
  assert_equal(spacing('陳上進+Vinta'), '陳上進 + Vinta');
  assert_equal(spacing('得到一個A+B的結果'), '得到一個 A+B 的結果');
  assert_equal(spacing('得到一個C++的結果'), '得到一個 C++ 的結果');

  // TODO
  // assert_equal(spacing('得到一個A+的結果'), '得到一個 A+ 的結果');
});

it('處理 | 符號', () => {
  assert_equal(spacing('前面|後面'), '前面 | 後面');
  assert_equal(spacing('前面 | 後面'), '前面 | 後面');
  assert_equal(spacing('Vinta|Mollie'), 'Vinta|Mollie');
  assert_equal(spacing('Vinta|陳上進'), 'Vinta | 陳上進');
  assert_equal(spacing('陳上進|Vinta'), '陳上進 | Vinta');
  assert_equal(spacing('得到一個A|B的結果'), '得到一個 A|B 的結果');
});

it('處理 \\ 符號', () => {
  assert_equal(spacing('前面\\後面'), '前面 \\ 後面');
  assert_equal(spacing('前面 \\ 後面'), '前面 \\ 後面');
});

it('處理 / 符號', () => {
  assert_equal(spacing('前面/後面'), '前面 / 後面');
  assert_equal(spacing('前面 / 後面'), '前面 / 後面');
  assert_equal(spacing('Vinta/Mollie'), 'Vinta/Mollie');
  assert_equal(spacing('Vinta/陳上進'), 'Vinta / 陳上進');
  assert_equal(spacing('陳上進/Vinta'), '陳上進 / Vinta');
  assert_equal(spacing('Mollie/陳上進/Vinta'), 'Mollie / 陳上進 / Vinta');
  assert_equal(spacing('得到一個A/B的結果'), '得到一個 A/B 的結果');
  assert_equal(spacing('2016-12-26(奇幻电影节) / 2017-01-20(美国) / 詹姆斯麦卡沃伊'), '2016-12-26 (奇幻电影节) / 2017-01-20 (美国) / 詹姆斯麦卡沃伊');
  assert_equal(spacing('/home/和/root是Linux中的頂級目錄'), '/home/ 和 /root 是 Linux 中的頂級目錄');
  assert_equal(spacing('當你用cat和od指令查看/dev/random和/dev/urandom的內容時'), '當你用 cat 和 od 指令查看 /dev/random 和 /dev/urandom 的內容時');
});

it('處理 < 符號', () => {
  assert_equal(spacing('前面<後面'), '前面 < 後面');
  assert_equal(spacing('前面 < 後面'), '前面 < 後面');
  assert_equal(spacing('Vinta<Mollie'), 'Vinta<Mollie');
  assert_equal(spacing('Vinta<陳上進'), 'Vinta < 陳上進');
  assert_equal(spacing('陳上進<Vinta'), '陳上進 < Vinta');
  assert_equal(spacing('得到一個A<B的結果'), '得到一個 A<B 的結果');
});

it('處理 > 符號', () => {
  assert_equal(spacing('前面>後面'), '前面 > 後面');
  assert_equal(spacing('前面 > 後面'), '前面 > 後面');
  assert_equal(spacing('Vinta>Mollie'), 'Vinta>Mollie');
  assert_equal(spacing('Vinta>陳上進'), 'Vinta > 陳上進');
  assert_equal(spacing('陳上進>Vinta'), '陳上進 > Vinta');
  assert_equal(spacing('得到一個A>B的結果'), '得到一個 A>B 的結果');
});

// 只加左空格

it('處理 @ 符號', () => {
  // https://twitter.com/vinta
  // https://www.weibo.com/vintalines
  assert_equal(spacing('請@vinta吃大便'), '請 @vinta 吃大便');
  assert_equal(spacing('請@陳上進 吃大便'), '請 @陳上進 吃大便');
});

it('處理 # 符號', () => {
  assert_equal(spacing('前面#後面'), '前面 #後面');
  assert_equal(spacing('前面C#後面'), '前面 C# 後面');
  assert_equal(spacing('前面#H2G2後面'), '前面 #H2G2 後面');
  assert_equal(spacing('前面 #銀河便車指南 後面'), '前面 #銀河便車指南 後面');
  assert_equal(spacing('前面#銀河便車指南 後面'), '前面 #銀河便車指南 後面');
  assert_equal(spacing('前面#銀河公車指南 #銀河拖吊車指南 後面'), '前面 #銀河公車指南 #銀河拖吊車指南 後面');
});

// 只加右空格

it('處理 ... 符號', () => {
  assert_equal(spacing('前面...後面'), '前面... 後面');
  assert_equal(spacing('前面..後面'), '前面.. 後面');
});

// \u2026
it('處理 … 符號', () => {
  assert_equal(spacing('前面…後面'), '前面… 後面');
  assert_equal(spacing('前面……後面'), '前面…… 後面');
});

// 換成全形符號

it('處理 ~ 符號', () => {
  assert_equal(spacing('前面~後面'), '前面～後面');
  assert_equal(spacing('前面 ~ 後面'), '前面～後面');
  assert_equal(spacing('前面~ 後面'), '前面～後面');
  assert_equal(spacing('前面 ~後面'), '前面～後面');
});

it('處理 ! 符號', () => {
  assert_equal(spacing('前面!後面'), '前面！後面');
  assert_equal(spacing('前面 ! 後面'), '前面！後面');
  assert_equal(spacing('前面! 後面'), '前面！後面');
  assert_equal(spacing('前面 !後面'), '前面！後面');
});

it('處理 ; 符號', () => {
  assert_equal(spacing('前面;後面'), '前面；後面');
  assert_equal(spacing('前面 ; 後面'), '前面；後面');
  assert_equal(spacing('前面; 後面'), '前面；後面');
  assert_equal(spacing('前面 ;後面'), '前面；後面');
});

it('處理 : 符號', () => {
  assert_equal(spacing('前面:後面'), '前面：後面');
  assert_equal(spacing('前面 : 後面'), '前面：後面');
  assert_equal(spacing('前面: 後面'), '前面：後面');
  assert_equal(spacing('前面 :後面'), '前面：後面');
  assert_equal(spacing('電話:123456789'), '電話：123456789');
  assert_equal(spacing('前面:)後面'), '前面：) 後面');
  assert_equal(spacing('前面:I have no idea後面'), '前面：I have no idea 後面');
  assert_equal(spacing('前面: I have no idea後面'), '前面: I have no idea 後面');
});

it('處理 , 符號', () => {
  assert_equal(spacing('前面,後面'), '前面，後面');
  assert_equal(spacing('前面 , 後面'), '前面，後面');
  assert_equal(spacing('前面, 後面'), '前面，後面');
  assert_equal(spacing('前面 ,後面'), '前面，後面');
  assert_equal(spacing('前面,'), '前面，');
  assert_equal(spacing('前面, '), '前面，');
});

it('處理 . 符號', () => {
  assert_equal(spacing('前面.後面'), '前面。後面');
  assert_equal(spacing('前面 . 後面'), '前面。後面');
  assert_equal(spacing('前面. 後面'), '前面。後面');
  assert_equal(spacing('前面 .後面'), '前面。後面');
  assert_equal(spacing('黑人問號.jpg 後面'), '黑人問號.jpg 後面');
});

it('處理 ? 符號', () => {
  assert_equal(spacing('前面?後面'), '前面？後面');
  assert_equal(spacing('前面 ? 後面'), '前面？後面');
  assert_equal(spacing('前面? 後面'), '前面？後面');
  assert_equal(spacing('前面 ?後面'), '前面？後面');
  assert_equal(spacing('所以，請問Jackey的鼻子有幾個?3.14個'), '所以，請問 Jackey 的鼻子有幾個？3.14 個');
});

// \u00b7
it('處理 · 符號', () => {
  assert_equal(spacing('前面·後面'), '前面・後面');
  assert_equal(spacing('喬治·R·R·馬丁'), '喬治・R・R・馬丁');
  assert_equal(spacing('M·奈特·沙马兰'), 'M・奈特・沙马兰');
});

// \u2022
it('處理 • 符號', () => {
  assert_equal(spacing('前面•後面'), '前面・後面');
  assert_equal(spacing('喬治•R•R•馬丁'), '喬治・R・R・馬丁');
  assert_equal(spacing('M•奈特•沙马兰'), 'M・奈特・沙马兰');
});

// \u2027
it('處理 ‧ 符號', () => {
  assert_equal(spacing('前面‧後面'), '前面・後面');
  assert_equal(spacing('喬治‧R‧R‧馬丁'), '喬治・R・R・馬丁');
  assert_equal(spacing('M‧奈特‧沙马兰'), 'M・奈特・沙马兰');
});

// 成對符號：相異

it('處理 < > 符號', () => {
  assert_equal(spacing('前面<中文123漢字>後面'), '前面 <中文 123 漢字> 後面');
  assert_equal(spacing('前面<中文123>後面'), '前面 <中文 123> 後面');
  assert_equal(spacing('前面<123漢字>後面'), '前面 <123 漢字> 後面');
  assert_equal(spacing('前面<中文123> tail'), '前面 <中文 123> tail');
  assert_equal(spacing('head <中文123漢字>後面'), 'head <中文 123 漢字> 後面');
  assert_equal(spacing('head <中文123漢字> tail'), 'head <中文 123 漢字> tail');
});

it('處理 ( ) 符號', () => {
  assert_equal(spacing('前面(中文123漢字)後面'), '前面 (中文 123 漢字) 後面');
  assert_equal(spacing('前面(中文123)後面'), '前面 (中文 123) 後面');
  assert_equal(spacing('前面(123漢字)後面'), '前面 (123 漢字) 後面');
  assert_equal(spacing('前面(中文123) tail'), '前面 (中文 123) tail');
  assert_equal(spacing('head (中文123漢字)後面'), 'head (中文 123 漢字) 後面');
  assert_equal(spacing('head (中文123漢字) tail'), 'head (中文 123 漢字) tail');
  assert_equal(spacing('(or simply "React")'), '(or simply "React")');
  assert_equal(spacing("OperationalError: (2006, 'MySQL server has gone away')"), "OperationalError: (2006, 'MySQL server has gone away')"); // eslint-disable-line quotes
  assert_equal(spacing('我看过的电影(1404)'), '我看过的电影 (1404)');
  assert_equal(spacing('Chang Stream(变更记录流)是指collection(数据库集合)的变更事件流'), 'Chang Stream (变更记录流) 是指 collection (数据库集合) 的变更事件流');
});

it('處理 { } 符號', () => {
  assert_equal(spacing('前面{中文123漢字}後面'), '前面 {中文 123 漢字} 後面');
  assert_equal(spacing('前面{中文123}後面'), '前面 {中文 123} 後面');
  assert_equal(spacing('前面{123漢字}後面'), '前面 {123 漢字} 後面');
  assert_equal(spacing('前面{中文123} tail'), '前面 {中文 123} tail');
  assert_equal(spacing('head {中文123漢字}後面'), 'head {中文 123 漢字} 後面');
  assert_equal(spacing('head {中文123漢字} tail'), 'head {中文 123 漢字} tail');
});

it('處理 [ ] 符號', () => {
  assert_equal(spacing('前面[中文123漢字]後面'), '前面 [中文 123 漢字] 後面');
  assert_equal(spacing('前面[中文123]後面'), '前面 [中文 123] 後面');
  assert_equal(spacing('前面[123漢字]後面'), '前面 [123 漢字] 後面');
  assert_equal(spacing('前面[中文123] tail'), '前面 [中文 123] tail');
  assert_equal(spacing('head [中文123漢字]後面'), 'head [中文 123 漢字] 後面');
  assert_equal(spacing('head [中文123漢字] tail'), 'head [中文 123 漢字] tail');
});

it('處理 “ ” \\u201c \\u201d 符號', () => {
  assert_equal(spacing('前面“中文123漢字”後面'), '前面 “中文 123 漢字” 後面');
});

// 成對符號：相同

it('處理 ` ` 符號', () => {
  assert_equal(spacing('前面`中間`後面'), '前面 `中間` 後面');
});

it('處理 # # 符號', () => {
  assert_equal(spacing('前面#H2G2#後面'), '前面 #H2G2# 後面');
  assert_equal(spacing('前面#銀河閃電霹靂車指南#後面'), '前面 #銀河閃電霹靂車指南# 後面');
});

it('處理 " " 符號', () => {
  assert_equal(spacing('前面"中文123漢字"後面'), '前面 "中文 123 漢字" 後面');
  assert_equal(spacing('前面"中文123"後面'), '前面 "中文 123" 後面');
  assert_equal(spacing('前面"123漢字"後面'), '前面 "123 漢字" 後面');
  assert_equal(spacing('前面"中文123" tail'), '前面 "中文 123" tail');
  assert_equal(spacing('head "中文123漢字"後面'), 'head "中文 123 漢字" 後面');
  assert_equal(spacing('head "中文123漢字" tail'), 'head "中文 123 漢字" tail');
});

it("處理 ' ' 符號", () => { // eslint-disable-line quotes
  assert_equal(spacing("Why are Python's 'private' methods not actually private?"), "Why are Python's 'private' methods not actually private?"); // eslint-disable-line quotes
  assert_equal(spacing("陳上進 likes 林依諾's status."), "陳上進 likes 林依諾's status."); // eslint-disable-line quotes
  assert_equal(spacing("举个栗子，如果一道题只包含'A' ~ 'Z'意味着字符集大小是"), "举个栗子，如果一道题只包含 'A' ~ 'Z' 意味着字符集大小是"); // eslint-disable-line quotes
});

it('處理 ״ ״ \\u05f4 \\u05f4 符號', () => {
  assert_equal(spacing('前面״中間״後面'), '前面 ״中間״ 後面');
});

// 英文與符號

it('處理英文與 “ ” \\u201c \\u201d 符號', () => {
  assert_equal(spacing('阿里云开源“计算王牌”Blink，实时计算时代已来'), '阿里云开源 “计算王牌” Blink，实时计算时代已来');
  assert_equal(spacing('苹果撤销Facebook“企业证书”后者股价一度短线走低'), '苹果撤销 Facebook “企业证书” 后者股价一度短线走低');
  assert_equal(spacing('【UCG中字】“數毛社”DF的《戰神4》全新演示解析'), '【UCG 中字】“數毛社” DF 的《戰神 4》全新演示解析');
});

it('處理英文與 % 符號', () => {
  assert_equal(spacing("丹寧控注意Levi's全館任2件25%OFF滿額再享85折！"), "丹寧控注意 Levi's 全館任 2 件 25% OFF 滿額再享 85 折！"); // eslint-disable-line quotes
});
