// ===============================
// quizEngine.js
// クイズ生成・回答処理・スタンプ管理（アーカイブ探索仕様）
// ===============================

// クイズ開始
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
}

// ===============================
// クイズ要素生成
// ===============================
function createQuizElement(quiz) {
  const container = document.createElement("div");
  container.className = "quiz-block";
  container.id = `quiz-${quiz.id}`;

  const title = document.createElement("div");
  title.className = "question-title";
  title.textContent = quiz.title;
  container.appendChild(title);

  // ★ innerHTMLでHTMLタグ（色指定や改行）を許可
  const question = document.createElement("div");
  question.className = "question-text";
  question.innerHTML = quiz.question; 
  container.appendChild(question);

  const result = document.createElement("div");
  result.className = "result";

  // -----------------------------------------
  // 地図選択式クイズ
  // -----------------------------------------
  if (quiz.mapQuestion) {
    const mapBtn = document.createElement("button");
    mapBtn.textContent = "地図で選ぶ";

    // const listBtn = document.createElement("button");
    // listBtn.textContent = "名前で選ぶ";

    container.appendChild(mapBtn);
    //container.appendChild(listBtn);
    container.appendChild(result);

    mapBtn.onclick = () => showMapSelection(quiz, result, container);
    // listBtn.onclick = () => showNameSelection(quiz, result, container);

    return container;
  }

  // -----------------------------------------
  // 4択クイズ
  // -----------------------------------------
  if (quiz.options && quiz.options.length > 0) {
    const optionsWrapper = document.createElement("div");
    optionsWrapper.className = "options-wrapper";

    quiz.options.forEach((opt, idx) => {
      const label = document.createElement("label");
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = quiz.id;
      radio.value = idx;

      label.appendChild(radio);
      
      // ★ 選択肢のHTMLタグ（色など）を反映させる
      const span = document.createElement("span");
      span.innerHTML = opt;
      label.appendChild(span);
      
      optionsWrapper.appendChild(label);
    });
    container.appendChild(optionsWrapper);
    container.appendChild(result);

    const btn = document.createElement("button");
    btn.textContent = "回答する";
    btn.onclick = () => {
      const selected = container.querySelector("input[type=radio]:checked");
      if (!selected) return;
      const selectedIdx = parseInt(selected.value);

      if (typeof advanceTime === "function") advanceTime();

      const isCorrect = (selectedIdx === quiz.correctIndex);
      
      // ★ 配列マッピングがあればそれを使用。なければ正誤で分岐
      let displayKeyword = "";
      if (quiz.keywords && quiz.keywords[selectedIdx]) {
        displayKeyword = quiz.keywords[selectedIdx];
      } else {
        displayKeyword = isCorrect ? quiz.flag : (quiz.dummyFlag || "???");
      }

      // 無機質なフィードバック
      result.innerHTML = `取得キーワード：<strong>${displayKeyword}</strong>`;

      // ★ 正解・不正解にかかわらずプレイヤーが選んだルートのキーワードを記録・進行させる
      localStorage.setItem(`flag_${quiz.id}`, displayKeyword);
      updateStamp();
      unlockNext(quiz);
    };
    container.appendChild(btn);

    return container;
  }

  // -----------------------------------------
  // 記述式クイズ
  // -----------------------------------------
  const input = document.createElement("input");
  input.type = "text";
  input.className = "text-input";
  input.placeholder = "答えを入力";
  container.appendChild(input);

  container.appendChild(result);

  const btn = document.createElement("button");
  btn.textContent = "回答する";
  btn.onclick = () => {
    if (typeof advanceTime === "function") advanceTime();
    
    // ★ 大文字に統一して判定（半角/全角のブレや小文字入力に対応）
    const userAnswer = input.value.trim().toUpperCase();
    const isCorrect = (userAnswer === (quiz.correctAnswer || "").toUpperCase());

    const displayKeyword = isCorrect ? quiz.flag : (quiz.dummyFlag || "不明");
    
    result.innerHTML = `取得キーワード：<strong>${displayKeyword}</strong>`;

    localStorage.setItem(`flag_${quiz.id}`, displayKeyword);
    updateStamp();
    unlockNext(quiz);
  };
  container.appendChild(btn);

  return container;
}

// ===============================
// 地図選択モード
// ===============================
function showMapSelection(quiz, result) {
  if (typeof mapEngine !== "undefined") mapEngine.showMap();

  const ui = document.getElementById("map-ui");
  const uiText = document.getElementById("map-ui-text");
  const uiYes = document.getElementById("map-ui-yes");
  const uiNo = document.getElementById("map-ui-no");
  const uiResult = document.getElementById("map-ui-result");

  // 既存イベント解除
  if (window.pavilionMarkers) {
    Object.values(window.pavilionMarkers).forEach(marker => marker.off("click"));
  }

  // マーカークリック時の処理
  Object.entries(window.pavilionMarkers || {}).forEach(([code, marker]) => {
    marker.on("click", () => {
      const pavilion = window.pavilionList.find(p => p.code === code);
  
      uiText.innerHTML = `
        <div class="map-question">
          <strong>問題：</strong>${quiz.question}
        </div>
        ${quiz.image ? `<img src="${quiz.image}" class="map-question-image">` : ""}
        <p>対象データ：${pavilion.name}</p>
        <p>この座標を記録しますか？</p>
      `;

      uiResult.textContent = "";
      ui.classList.add("show");

      uiNo.onclick = () => {
        ui.classList.remove("show");
      };

      uiYes.onclick = () => {
        if (typeof advanceTime === "function") advanceTime();

        const isCorrect = (code === quiz.correctPavilion);

        if (isCorrect) {
          const displayKeyword = quiz.flag;
          result.innerHTML = `取得キーワード：<strong>${displayKeyword}</strong>`;
          uiResult.innerHTML = `アーカイブを更新：<strong>${displayKeyword}</strong>`;
          
          localStorage.setItem(`flag_${quiz.id}`, displayKeyword);
          updateStamp();
          unlockNext(quiz);

          setTimeout(() => {
            ui.classList.remove("show");
            if (typeof mapEngine !== "undefined") mapEngine.hideMap();
          }, 1500);

        } else {
          // 段階ヒントの処理（システムエラー風の演出に変更）
          const key = `hint_${quiz.id}`;
          let step = parseInt(localStorage.getItem(key) || "0");

          if (quiz.hints && quiz.hints[step]) {
            uiResult.textContent = "データ不一致。ログ：" + quiz.hints[step];
            step++;
            localStorage.setItem(key, step);
          } else {
            // ヒントが尽きた、または無い場合はダミーを掴ませて強制進行
            const dummyWord = quiz.dummyFlag || "座標エラー";
            result.innerHTML = `取得キーワード：<strong>${dummyWord}</strong>`;
            uiResult.innerHTML = `代替データを取得：<strong>${dummyWord}</strong>`;
            
            localStorage.setItem(`flag_${quiz.id}`, dummyWord);
            updateStamp();
            unlockNext(quiz);

            setTimeout(() => {
              ui.classList.remove("show");
              if (typeof mapEngine !== "undefined") mapEngine.hideMap();
            }, 1500);
          }
        }
      };
    });
  });
}

// ===============================
// 名前選択モード（簡易版）※現状はコメントアウト扱いですが念のため更新
// ===============================
function showNameSelection(quiz, result) {
  const modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = "20%";
  modal.style.left = "50%";
  modal.style.transform = "translateX(-50%)";
  modal.style.background = "#fff";
  modal.style.padding = "20px";
  modal.style.border = "2px solid #0077b6";
  modal.style.zIndex = 2000;

  const search = document.createElement("input");
  search.placeholder = "パビリオン名で検索";
  modal.appendChild(search);

  const list = document.createElement("ul");
  modal.appendChild(list);

  function render(filter = "") {
    list.innerHTML = "";
    (window.pavilionList || [])
      .filter(p => p.name.includes(filter))
      .forEach(p => {
        const li = document.createElement("li");
        li.textContent = p.name;
        li.style.cursor = "pointer";
        li.onclick = () => {
          document.body.removeChild(modal);
          const isCorrect = (p.code === quiz.correctPavilion);
          const displayKeyword = isCorrect ? quiz.flag : (quiz.dummyFlag || "不明");
          
          result.innerHTML = `取得キーワード：<strong>${displayKeyword}</strong>`;
          localStorage.setItem(`flag_${quiz.id}`, displayKeyword);
          updateStamp();
          unlockNext(quiz);
        };
        list.appendChild(li);
      });
  }

  search.oninput = () => render(search.value);
  render();

  document.body.appendChild(modal);
}

// ===============================
// スタンプ更新 ＆ 大謎プレビュー更新
// ===============================
function updateStamp() {
  const stampList = document.getElementById("stamp-list");
  if (!stampList) return;
  
  stampList.innerHTML = "";

  quizData.forEach(q => {
    const savedKeyword = localStorage.getItem(`flag_${q.id}`);
    
    // 1. スタンプリスト（左側や下側のUI）の更新
    if (savedKeyword) {
      const li = document.createElement("li");
      li.innerHTML = savedKeyword; // HTML（●の色など）を反映
      stampList.appendChild(li);
    }

    // 2. 大謎プレビューエリア（final-preview内）の更新
    const previewSpan = document.getElementById(`pv-${q.id}`);
    if (previewSpan) {
      if (savedKeyword) {
        previewSpan.innerHTML = savedKeyword;
        previewSpan.style.color = "#0f0"; // 埋まったら色を変えるなどの演出
      } else {
        previewSpan.textContent = "？";
        previewSpan.style.color = "#777";
      }
    }
  });
}

// ===============================
// 次の問題を解放
// ===============================
function unlockNext(quiz) {
  // 大謎等に到達した際の処理（仕様に合わせて調整してください）
  if (quiz.id === "final") {
    if (window.showGoodEndingStory) {
      window.showGoodEndingStory();
    }
  }
}
