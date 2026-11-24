// ===============================
// quizData.js
// 脱出ゲーム クイズデータ（叙述トリック仕様）
// ===============================

const quizData = [
  {
    id: "q1",
    category: "小謎",
    level: 1,
    title: "第1問",
    question: "今回の万博から「55年前」に行われた大阪の万博。その会場に設置されていた、白い（一部赤や黄色い部分もある）巨大なモニュメントはどんなポーズをしていた？",
        // ヒントボタンで出す補足情報
    hints: [
      "当時を知らない人は<br>白い巨大な万博モニュメント<br>について画像検索して確認してもいいよ",
    ],
    options: [
      "両腕をあげる", 
      "片腕をあげる", 
      "頭の上でダブルピース", 
      "正座"
    ],
    // 選択肢と1対1で対応するキーワード配列
    keywords: [
      "両腕", 
      "片腕", 
      "偶像", 
      "静止"
    ],
    correctIndex: 1, // 真実（2025年）の正解は「片腕（ガンダム）」
    flag: "片腕"
  },

  {
    id: "q2",
    category: "小謎",
    level: 1,
    title: "第2問",
    question: "その55年前の万博で「月の石」が展示されていた人気パビリオンは？",
    hints: [
      "「アポロ計画」で検索するとどこの国か分かるよ",
    ],
    options: [
      "<span style=\"color: blue; font-weight: bold;\">イタリア</span>館", 
      "<span style=\"color: #FFD700; font-weight: bold;\">アメリカ</span>館", 
      "日本館", 
      "<span style=\"color: green; font-weight: bold;\">イギリス</span>館"
    ],
    // 各選択肢に紐づくキーワード
    keywords: [
      "斜塔", 
      "<span style=\"color: #FFD700; font-weight: bold;\">●</span>", 
      "はにわ", 
      "英国旗"
    ],
    correctIndex: 1,
    flag: "<span style=\"color: #FFD700; font-weight: bold;\">●</span>"
  },
    
  {
    id: "q3",
    category: "小謎",
    level: 1,
    title: "第3問：",
    question: "万博会場にあったガンダム、大屋根リングにタッチしているように見えるミャクミャク、ウサイン・ボルト像に共通するポーズは？",
    hints: [
      "「ミャクミャクモニュメント　ワクワク」で画像検索してみよう",
    ],
    options: [
      "飛ぶ", 
      "手をあげる", 
      "走る", 
      "寝る"
    ],
    // 選択肢と1対1で対応するキーワード配列
    keywords: [
      "とぶ", 
      "あげる", 
      "はしる", 
      "ねる"
    ],
    correctIndex: 1, 
    flag: "あげる",
    dummyFlag: ""
  },

  {
    id: "q4",
    category: "小謎",
    level: 1,
    title: "第4問",
    question: `
      <div class="riddle-container" style="line-height: 1.6;">
        <span style="color: red;">フランス</span><br>
        <span style="color: green;">イギリス</span><br>
        <span style="color: #ff69b4;">中国</span><br>
        <span style="color: blue;">イタリア</span><br>
        <br>
<span style="color: red; font-weight: bold;">←</span>
 ＝ 人<br>
        <span style="color: green; font-weight: bold">↑</span> ＝ 草<br>
        <span style="color: #ff69b4; font-weight: bold">●</span> ＝ 中<br>
        <span style="color: blue; font-weight: bold">←</span> ＝ ②<br>
        ②に当てはまる漢字を答えよ
      </div>
    `,
    // ヒントボタンで出す補足情報
    hints: [
      "色がついた言葉を漢字一文字に略してみましょう。",
      "記号はその漢字の「パーツの場所」を指しているよ。例：英の上側(↑)は『草(くさかんむり)』"
    ],
    correctAnswer: "人",
    explanation: `
      各色を漢字略称に変換します：青＝伊、黒＝欧。<br>
      ②は「伊」の左側（←）なので「人」。
    `,
    flag: "ローマ",
    dummyFlag: "エラー"
  }
,
  {
    id: "q5",
    category: "小謎",
    level: 1,
    title: "第5問",
    question: `
      <div class="riddle-container" style="line-height: 1.6;">
        <span style="color: red;">フランス</span><br>
        <span style="color: green;">イギリス</span><br>
        <span style="color: #ff69b4;">中国</span><br>
        <span style="color: blue;">イタリア</span><br>
        <span style="color: brown;">ヨーロッパ</span><br>
        <br>
        <span style="color: red;">←</span> ＝ 人<br>
        <span style="color: green;">↑</span> ＝ 草<br>
        <span style="color: #ff69b4;">●</span> ＝ 中<br>
        <span style="color: blue;">←</span> ＝ ②<br>
        ※① ＝ <span style="color: brown;">←</span><br>
        <br>
        <strong>ルール：</strong>
        ※(米印)はコとメを入れ替える記号
        <br>
        ※コ＝メ<br>
        が成立するとき
        <br>
        <br>
        ①と②に当てはまる漢字を並べてできた単語「①②」を答えよ<br>
        (②は第4問の答えと同じ)
      </div>
    `,
    // ヒントボタンで出す補足情報
    hints: [
      "色がついた言葉を漢字一文字（仏、英、中、伊）に略してみましょう。ヨーロッパは漢字で「何州」？",
      "記号はその漢字の「パーツの場所」を指しています。例：仏の左側(←)は『人(にんべん)』です。",
      "※(米印)は『コ』と『メ』に見える部分を変換します。"
    ],
    correctAnswer: "巨人",
    explanation: `
      各色を漢字略称に変換します：青＝伊、茶＝欧。<br>
      ②は「伊」の左側（←）なので「人」。<br>
      ①は「欧」の左側（←）である「区」ですが、米印（※）の指示「コ＝メ」に従い、「区」の中の「メ」を「コ」に入れ替えると「巨」になります。<br>
      よって、答えは「巨人」です。
    `,
    flag: "巨人"
  }
,
{
    id: "q6",
    category: "小謎",
    level: 1,
    title: "第6問",
    question: `
      タイパビリオンの前に飾られていた木彫りの動物のモニュメントは「▲□の▲□」<br><br>
      ▲□をひらがな二文字で答えよ。
    `,
        hints: [
      "コートジボワールにもあったかも",
      "タイパビリオン前、でググって画像を見てみよう",
    ],
    correctAnswer: "ぞう",
    flag: "ぞう",
    dummyFlag: "エラー"
  },
  
  {
    id: "q7",
    category: "小謎",
    level: 1,
    title: "第7問",
    question: "1970年と2025年の万博に展示されて話題を呼んだ未来の家電機器は何でしょう？<br>○○○○にあたる部分をひらがな四文字で入力せよ。<br><br>人間○○○○機<br>ヒント:まるごと○○○○",
    correctAnswer: "せんたく",
    flag: "まるごとせんたく",
    dummyFlag: "エラー"
  },

  {
  id: "final",
  category: "大謎",
  level: 2,
  title: "最終問題",

  question: `
    <strong>【僕はどこにいる？】</strong><br><br>
    これまでに取得したキーワードを並べると、ある光景が浮かびあがる<br><br>

    <strong>【現在の解析結果】</strong><br>
    <div id="final-preview">
      <span id="pv-q4">？</span> の
      <span id="pv-q5">？</span> が
      <span id="pv-q1">？</span> で
      <span id="pv-q2">？</span> を
      <span id="pv-q3">？</span>
      <span id="pv-q6">？</span><span id="pv-hidden-shirushi" class="hidden-shirushi">印</span>
    </div>

    <br>
    導き出された場所を地図から選択せよ。
  `,

  // 大謎で使用する文章の構造
  finalSentence: [
    { type: "keyword", id: "q4" },
    { type: "text", value: " の " },

    { type: "keyword", id: "q5" },
    { type: "text", value: " が " },

    { type: "keyword", id: "q1" },
    { type: "text", value: " で " },

    { type: "keyword", id: "q2" },
    { type: "text", value: " を " },

    { type: "keyword", id: "q3" },
    { type: "text", value: " " },

    { type: "keyword", id: "q6" },
    { type: "hidden", value: "印" }
  ],

  mapQuestion: true,
  correctPavilion: "yumeshima_station",
  flag: "ゴール"
}
];
