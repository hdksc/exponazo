// ===============================
// quizEngine.js
// クイズ生成・回答処理・スタンプ管理
// ===============================


let previousHeaderKeywords = {};

function resetHeaderKeywordState() {
  previousHeaderKeywords = {};
  const keywordList = document.getElementById("game-keywords");
  if (keywordList) {
    keywordList.innerHTML = "";
  }
}

function getGameFlags() {
  if (!window.gameState) {
    window.gameState = { loop: 1, flags: {}, answers: {}, hints: {} };
  }
  return window.gameState.flags;
}

function getGameAnswers() {
  if (!window.gameState) {
    window.gameState = { loop: 1, flags: {}, answers: {}, hints: {} };
  }
  return window.gameState.answers;
}

function getCurrentGameLoop() {
  return window.gameState && window.gameState.loop ? window.gameState.loop : 1;
}

// ===============================
// 一問目〜七問目の正答判定（周回考慮）
// ===============================
function isQuizAnsweredCorrectly(quiz, currentLoop) {
  const answers = getGameAnswers();
  const ans = answers[quiz.id];
  if (!ans) return false;

  if (quiz.id === "q1") {
    const loop1Idx = Array.isArray(quiz.options)
      ? quiz.options.indexOf("両腕をあげる")
      : 0;
    const expectedIndex = currentLoop === 1
      ? (loop1Idx >= 0 ? loop1Idx : 0)
      : quiz.correctIndex;
    return ans.type === "choice" && ans.selectedIndex === expectedIndex;
  }

  if (quiz.options && quiz.options.length > 0) {
    return ans.type === "choice" && ans.selectedIndex === quiz.correctIndex;
  }

  if (quiz.correctAnswer !== undefined) {
    const userVal = String(ans.value || "").trim().toUpperCase();
    const expectedVal = String(quiz.correctAnswer || "").trim().toUpperCase();
    return ans.type === "text" && userVal === expectedVal;
  }

  return false;
}

function areAllMainQuizzesCorrect() {
  const currentLoop = getCurrentGameLoop();
  const targetIds = ["q1", "q2", "q3", "q4", "q5", "q6", "q7"];
  return targetIds.every(id => {
    const q = quizData.find(item => item.id === id);
    return q ? isQuizAnsweredCorrectly(q, currentLoop) : false;
  });
}

function updateFinalButtonState() {
  const mapBtn = document.getElementById("final-map-btn");
  const errorMsg = document.getElementById("final-error-msg");
  if (!mapBtn) return;

  const allCorrect = areAllMainQuizzesCorrect();
  mapBtn.disabled = !allCorrect;
  if (errorMsg) {
    errorMsg.style.display = allCorrect ? "none" : "block";
  }
}

window.updateFinalButtonState = updateFinalButtonState;


// ===============================
// クイズ開始
// ===============================
function startGame() {
  const container = document.getElementById("quiz-container");
  container.innerHTML = "";

  const categories = [...new Set(quizData.map(q => q.category))];

  categories.forEach(cat => {
    const catDiv = document.createElement("div");
    catDiv.className = "pavilion";

    const title = document.createElement("h3");
    title.textContent = `カテゴリ：${cat}`;
    catDiv.appendChild(title);

    const questions = quizData.filter(q => q.category === cat);

    questions.forEach(q => {
      const qElem = createQuizElement(q);
      catDiv.appendChild(qElem);
    });

    container.appendChild(catDiv);
  });

  updateStamp();
  updateFinalButtonState();
}


// ===============================
// クイズ要素生成
// ===============================
function createQuizElement(quiz) {
  const flags = getGameFlags();
  const answers = getGameAnswers();

  const container = document.createElement("div");
  container.className = "quiz-block";
  container.id = `quiz-${quiz.id}`;

  // -----------------------------------------
  // 問題タイトル
  // -----------------------------------------
  const title = document.createElement("div");
  title.className = "question-title";
  title.textContent = quiz.title;
  container.appendChild(title);

  // -----------------------------------------
  // 質問文（HTML対応）
  // -----------------------------------------
  const question = document.createElement("div");
  question.className = "question-text";
  question.innerHTML = quiz.question;
  container.appendChild(question);

  // -----------------------------------------
  // ヒントエリア
  // -----------------------------------------
  const hintBox = document.createElement("div");
  hintBox.className = "hint-box";
  container.appendChild(hintBox);

  const hintBtn = document.createElement("button");
  hintBtn.className = "hint-button";
  hintBtn.style.display = "none";
  hintBtn.textContent = "ヒントを見る";
  container.appendChild(hintBtn);

  setupHintsForQuiz(quiz, hintBox, hintBtn);

  // -----------------------------------------
  // 結果表示
  // -----------------------------------------
  const result = document.createElement("div");
  result.className = "result";


  // -----------------------------------------
  // 地図選択式クイズ
  // -----------------------------------------
  if (quiz.mapQuestion) {
    const mapBtn = document.createElement("button");
    mapBtn.id = "final-map-btn";
    mapBtn.textContent = "地図で選ぶ";

    const errorMsg = document.createElement("div");
    errorMsg.id = "final-error-msg";
    errorMsg.className = "final-error-msg";
    errorMsg.textContent = "どこか間違ってるよ";

    container.appendChild(mapBtn);
    container.appendChild(errorMsg);
    container.appendChild(result);

    if (flags[quiz.id]) {
      result.innerHTML = `取得キーワード：<strong>${flags[quiz.id]}</strong>`;
    }

    mapBtn.onclick = () => {
      if (mapBtn.disabled || !areAllMainQuizzesCorrect()) return;
      showMapSelection(quiz, result, container);
    };

    return container;
  }


  // -----------------------------------------
  // 4択クイズ
  // -----------------------------------------
  if (quiz.options && quiz.options.length > 0) {
    const savedAns = answers[quiz.id];

    const optionsWrapper = document.createElement("div");
    optionsWrapper.className = "options-wrapper";

    quiz.options.forEach((opt, idx) => {

      const label = document.createElement("label");

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = quiz.id;
      radio.value = idx;
      if (savedAns && savedAns.type === "choice" && savedAns.selectedIndex === idx) {
        radio.checked = true;
      }

      label.appendChild(radio);

      // 選択肢のHTMLタグ（色など）を反映
      const span = document.createElement("span");
      span.innerHTML = opt;
      label.appendChild(span);

      optionsWrapper.appendChild(label);
    });

    if (flags[quiz.id]) {
      result.innerHTML = `取得キーワード：<strong>${flags[quiz.id]}</strong>`;
    }

    container.appendChild(optionsWrapper);
    container.appendChild(result);

    const btn = document.createElement("button");
    btn.textContent = "回答する";

    btn.onclick = () => {

      const selected =
        container.querySelector("input[type=radio]:checked");

      if (!selected) return;

      const selectedIdx = parseInt(selected.value, 10);

      if (typeof advanceTime === "function") {
        advanceTime();
      }

      const currentLoop = getCurrentGameLoop();
      let isCorrect = (selectedIdx === quiz.correctIndex);
      if (quiz.id === "q1") {
        const loop1Idx = quiz.options.indexOf("両腕をあげる");
        const expectedIdx = currentLoop === 1
          ? (loop1Idx >= 0 ? loop1Idx : 0)
          : quiz.correctIndex;
        isCorrect = (selectedIdx === expectedIdx);
      }

      answers[quiz.id] = {
        type: "choice",
        selectedIndex: selectedIdx
      };


      // -----------------------------------------
      // キーワード決定
      // -----------------------------------------
      let displayKeyword = "";

      // 選択肢ごとのキーワードが定義されている場合
      if (
        quiz.keywords &&
        quiz.keywords[selectedIdx] !== undefined
      ) {
        displayKeyword = quiz.keywords[selectedIdx];

      } else {

        // 定義されていない場合は正誤で決定
        displayKeyword =
          isCorrect
            ? quiz.flag
            : (quiz.dummyFlag || "???");
      }


      // -----------------------------------------
      // 結果表示
      // -----------------------------------------
      result.innerHTML =
        `取得キーワード：<strong>${displayKeyword}</strong>`;


      // -----------------------------------------
      // 選択したキーワードをメモリに保持
      // -----------------------------------------
      flags[quiz.id] = displayKeyword;


      // -----------------------------------------
      // 各種表示を更新
      // -----------------------------------------
      updateStamp(quiz.id);
      updateFinalButtonState();
      unlockNext(quiz);
    };

    container.appendChild(btn);

    return container;
  }


  // -----------------------------------------
  // 記述式クイズ
  // -----------------------------------------
  const savedAns = answers[quiz.id];
  const input = document.createElement("input");

  input.type = "text";
  input.className = "text-input";
  input.placeholder = "答えを入力";
  if (savedAns && savedAns.type === "text") {
    input.value = savedAns.value || "";
  }

  if (flags[quiz.id]) {
    result.innerHTML = `取得キーワード：<strong>${flags[quiz.id]}</strong>`;
  }

  container.appendChild(input);
  container.appendChild(result);

  const btn = document.createElement("button");
  btn.textContent = "回答する";

  btn.onclick = () => {

    if (typeof advanceTime === "function") {
      advanceTime();
    }


    // -----------------------------------------
    // 回答判定
    // -----------------------------------------
    const rawValue = input.value.trim();
    const userAnswer = rawValue.toUpperCase();

    const correctAnswer =
      (quiz.correctAnswer || "").toUpperCase();

    const isCorrect =
      (userAnswer === correctAnswer);

    answers[quiz.id] = {
      type: "text",
      value: rawValue
    };


    // -----------------------------------------
    // キーワード決定
    // -----------------------------------------
    const displayKeyword =
      isCorrect
        ? quiz.flag
        : (quiz.dummyFlag || "不明");


    // -----------------------------------------
    // 結果表示
    // -----------------------------------------
    result.innerHTML =
      `取得キーワード：<strong>${displayKeyword}</strong>`;


    // -----------------------------------------
    // キーワードをメモリに保持
    // -----------------------------------------
    flags[quiz.id] = displayKeyword;


    // -----------------------------------------
    // 各種表示を更新
    // -----------------------------------------
    updateStamp(quiz.id);
    updateFinalButtonState();
    unlockNext(quiz);
  };

  container.appendChild(btn);

  return container;
}


// ===============================
// ヒント設定
// ===============================
function setupHintsForQuiz(quiz, hintBox, hintBtn) {

  hintBox.innerHTML = "";

  let step = 0;

  // ヒントがない場合
  if (!quiz.hints || quiz.hints.length === 0) {
    hintBtn.style.display = "none";
    return;
  }

  hintBtn.style.display = "block";
  hintBtn.disabled = false;
  hintBtn.textContent = "ヒントを見る";


  hintBtn.onclick = () => {

    if (step < quiz.hints.length) {

      const p = document.createElement("p");

      p.innerHTML =
        `<strong>ヒント:</strong> ${quiz.hints[step]}`;

      hintBox.appendChild(p);

      step++;


      // すべてのヒントを表示した場合
      if (step >= quiz.hints.length) {

        hintBtn.textContent =
          "ヒントは以上だよ";

        hintBtn.disabled = true;
      }
    }
  };
}


// ===============================
// 大謎の文章を組み立てる
//
// quizzes.js の finalSentence に従って
// キーワードと接続詞・文章を組み立てる
// ===============================
function buildFinalSentence(sentenceData, wrapKeywordsForHeader = false) {

  if (!Array.isArray(sentenceData)) {
    return "";
  }

  const flags = getGameFlags();

  return sentenceData.map(item => {

    // -----------------------------------------
    // 固定テキスト
    // -----------------------------------------
    if (item.type === "text") {
      return item.value || "";
    }

    // -----------------------------------------
    // 隠し文字
    // -----------------------------------------
    if (item.type === "hidden") {
      return `<span class="hidden-shirushi">${item.value || ""}</span>`;
    }


    // -----------------------------------------
    // キーワード
    // -----------------------------------------
    if (item.type === "keyword") {

      const keyword = flags[item.id] || "？";

      if (wrapKeywordsForHeader) {
        return `<span class="header-kw" data-kw-id="${item.id}">${keyword}</span>`;
      }

      return keyword;
    }


    return "";

  }).join("");
}


// ===============================
// 大謎の文章定義を取得
// ===============================
function getFinalSentenceData() {

  const finalQuiz =
    quizData.find(q => q.id === "final");

  if (!finalQuiz) {
    return null;
  }

  return finalQuiz.finalSentence || null;
}


// ===============================
// 大謎の文章HTMLを組み立てる（共通参照）
// ===============================
function buildFinalSentenceHTML(wrapKeywordsForHeader = false) {
  const sentenceData = getFinalSentenceData();
  if (!sentenceData) {
    return "";
  }
  return buildFinalSentence(sentenceData, wrapKeywordsForHeader);
}


// ===============================
// 表示領域の背景色・文字色を取得して隠し文字「印」を設定
// ===============================
function getEffectiveBackgroundColor(el) {
  let curr = el;
  while (curr && curr.nodeType === 1) {
    const bg = window.getComputedStyle(curr).backgroundColor;
    if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") {
      return bg;
    }
    curr = curr.parentElement;
  }
  return window.getComputedStyle(document.body).backgroundColor || "#ffffff";
}

function applyHiddenCharColor(container) {
  if (!container || typeof window.getComputedStyle !== "function") return;
  const hiddenNodes = container.querySelectorAll(".hidden-shirushi");
  hiddenNodes.forEach(node => {
    const targetBox = node.parentElement || container;
    const bg = getEffectiveBackgroundColor(targetBox);
    const keywordColor = window.getComputedStyle(targetBox).color || "#000000";

    node.style.setProperty("--hidden-bg-color", bg);
    node.style.setProperty("--hidden-selected-color", keywordColor);
  });
}

function getNodeIndexInParent(node) {
  if (!node || !node.parentNode) return -1;
  let idx = 0;
  let sib = node.previousSibling;
  while (sib) {
    idx++;
    sib = sib.previousSibling;
  }
  return idx;
}

function doesRangeCoverHiddenNode(range, hiddenNode) {
  if (!range || !hiddenNode || range.collapsed) return false;

  const textNode = hiddenNode.firstChild && hiddenNode.firstChild.nodeType === 3
    ? hiddenNode.firstChild
    : null;
  const targetNode = textNode || hiddenNode;

  if (textNode) {
    const len = textNode.textContent ? textNode.textContent.length : 0;
    if (len === 0) return false;
    if (range.endContainer === textNode && range.endOffset <= 0) return false;
    if (range.startContainer === textNode && range.startOffset >= len) return false;
  }

  if (range.endContainer === hiddenNode && range.endOffset <= 0) return false;
  if (range.startContainer === hiddenNode && range.startOffset >= hiddenNode.childNodes.length) return false;

  const parent = hiddenNode.parentNode;
  if (parent) {
    const idx = getNodeIndexInParent(hiddenNode);
    if (idx >= 0) {
      if (range.endContainer === parent && range.endOffset <= idx) return false;
      if (range.startContainer === parent && range.startOffset >= idx + 1) return false;
    }
  }

  if (typeof range.intersectsNode === "function") {
    try {
      return range.intersectsNode(targetNode);
    } catch (e) {
      // Fallback below
    }
  }

  if (
    typeof document !== "undefined" &&
    typeof document.createRange === "function" &&
    typeof range.compareBoundaryPoints === "function" &&
    typeof Range !== "undefined"
  ) {
    try {
      const nodeRange = document.createRange();
      nodeRange.selectNodeContents(targetNode);
      const startsBeforeEnd = range.compareBoundaryPoints(Range.END_TO_START, nodeRange) < 0;
      const endsAfterStart = range.compareBoundaryPoints(Range.START_TO_END, nodeRange) > 0;
      return startsBeforeEnd && endsAfterStart;
    } catch (e) {
      return false;
    }
  }

  return false;
}

function updateHiddenMarksRevealState(explicitRange) {
  if (typeof document === "undefined" || typeof document.querySelectorAll !== "function") return;
  const hiddenNodes = document.querySelectorAll(".hidden-shirushi");
  if (!hiddenNodes || hiddenNodes.length === 0) return;

  const ranges = [];
  if (explicitRange) {
    ranges.push(explicitRange);
  } else if (typeof window.getSelection === "function") {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
      for (let i = 0; i < selection.rangeCount; i++) {
        ranges.push(selection.getRangeAt(i));
      }
    }
  }

  hiddenNodes.forEach(node => {
    const isSelected = ranges.some(range => doesRangeCoverHiddenNode(range, node));
    if (isSelected) {
      node.classList.add("is-revealed");
    } else {
      node.classList.remove("is-revealed");
    }
  });
}

if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
  document.addEventListener("selectionchange", () => {
    updateHiddenMarksRevealState();
  });
}

window.applyHiddenCharColor = applyHiddenCharColor;
window.updateHiddenMarksRevealState = updateHiddenMarksRevealState;


// ===============================
// ヘッダーキーワードの発光アニメーション再実行
// ===============================
function triggerHeaderKeywordFlash(span) {
  if (!span) return;

  if (span._flashTimer) {
    clearTimeout(span._flashTimer);
    span._flashTimer = null;
  }

  span.classList.remove("kw-flash");
  void span.offsetWidth;

  const startAnim = () => {
    span.classList.add("kw-flash");
    span.onanimationend = () => {
      span.classList.remove("kw-flash");
      if (span._flashTimer) {
        clearTimeout(span._flashTimer);
        span._flashTimer = null;
      }
    };
    span._flashTimer = setTimeout(() => {
      span.classList.remove("kw-flash");
      span._flashTimer = null;
    }, 1400);
  };

  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(startAnim);
  } else {
    startAnim();
  }
}


// ===============================
// スタンプ更新
// ＆ ステータスバー更新（変更時のみ発光演出）
// ＆ 地図解析結果更新
// ＆ 大謎プレビュー更新
// ===============================
function updateStamp(changedQuizId) {

  const flags = getGameFlags();

  const stampList =
    document.getElementById("stamp-list");

  const keywordList =
    document.getElementById("game-keywords");

  const mapKeywordList =
    document.getElementById("map-analysis-keywords");


  // -----------------------------------------
  // スタンプリストを初期化
  // -----------------------------------------
  if (stampList) {
    stampList.innerHTML = "";
  }


  // -----------------------------------------
  // スタンプリストを更新
  //
  // スタンプは quizData の順番で表示
  // -----------------------------------------
  quizData.forEach(q => {

    const savedKeyword = flags[q.id];

    if (savedKeyword && stampList) {

      const li =
        document.createElement("li");

      li.innerHTML = savedKeyword;

      stampList.appendChild(li);
    }
  });


  // -----------------------------------------
  // ステータスバーのキーワード更新（変更された部分だけ発光）
  // -----------------------------------------
  const sentenceData = getFinalSentenceData();

  if (keywordList && sentenceData) {
    const existingSpans = keywordList.querySelectorAll
      ? keywordList.querySelectorAll(".header-kw")
      : [];

    if (!existingSpans || existingSpans.length === 0) {
      keywordList.innerHTML = "🔑 " + buildFinalSentence(sentenceData, true);
      sentenceData.forEach(item => {
        if (item.type === "keyword") {
          const val = flags[item.id] || "？";
          previousHeaderKeywords[item.id] = val;
          if (changedQuizId && item.id === changedQuizId && flags[item.id]) {
            const span = keywordList.querySelector(`.header-kw[data-kw-id="${item.id}"]`);
            triggerHeaderKeywordFlash(span);
          }
        }
      });
    } else {
      sentenceData.forEach(item => {
        if (item.type !== "keyword") return;

        const nextVal = flags[item.id] || "？";
        const prevVal = previousHeaderKeywords[item.id];
        const span = keywordList.querySelector(`.header-kw[data-kw-id="${item.id}"]`);

        if (span && prevVal !== nextVal) {
          span.innerHTML = nextVal;
          previousHeaderKeywords[item.id] = nextVal;

          if (changedQuizId && item.id === changedQuizId) {
            triggerHeaderKeywordFlash(span);
          }
        }
      });
    }

    applyHiddenCharColor(keywordList);
  }


  // -----------------------------------------
  // 地図選択画面の解析結果を同期更新
  // -----------------------------------------
  if (mapKeywordList) {
    mapKeywordList.innerHTML = buildFinalSentenceHTML(false);
    applyHiddenCharColor(mapKeywordList);
  }

  const mapEl = document.getElementById("map");
  if (
    mapEl &&
    mapEl.classList.contains("visible") &&
    typeof mapEngine !== "undefined" &&
    typeof mapEngine.updateMapLayout === "function"
  ) {
    mapEngine.updateMapLayout();
  }


  // -----------------------------------------
  // 大謎プレビューを更新
  //
  // 通常キーワードは黒の太字、4つ目（q2）の黄色表示は維持
  // -----------------------------------------
  quizData.forEach(q => {

    const savedKeyword = flags[q.id];

    const previewSpan =
      document.getElementById(`pv-${q.id}`);

    if (previewSpan) {

      if (savedKeyword) {

        previewSpan.innerHTML = savedKeyword;
        previewSpan.style.fontWeight = "bold";

        if (q.id === "q2") {
          previewSpan.style.color = savedKeyword.includes("#FFD700")
            ? ""
            : "#000000";
        } else {
          previewSpan.style.color = "#000000";
        }

      } else {

        previewSpan.textContent = "？";
        previewSpan.style.color = "#777";
        previewSpan.style.fontWeight = "normal";
      }
    }
  });

  applyHiddenCharColor(document.getElementById("final-preview"));
  updateHiddenMarksRevealState();
}


// ===============================
// 次の問題を解放
// ===============================
function unlockNext(quiz) {

  // 大謎に到達した場合
  if (quiz.id === "final") {

    if (window.showGoodEndingStory) {
      window.showGoodEndingStory();
    }
  }
}
