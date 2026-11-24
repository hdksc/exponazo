// ===============================
// story.js
// ===============================

// ゲーム進行状態（ブラウザストレージには保存しない・メモリ管理）
function initGameState() {
  window.gameState = {
    loop: 1,
    flags: {},
    answers: {},
    hints: {}
  };
}

initGameState();

// デフォルトのストーリー
const introStory = [
  "どこからか懐かしい声が聞こえてきた",
  "「脱出ゲームパビリオンへようこそ。これは2025年に開催された大阪・関西万博を懐かしむ脱出ゲーム。ちょっとした小謎やクイズやトリックを用意したので、頑張ってゴールで待ってる僕に会いに来て。それではベストを尽くして！」"
];

// 現在のストーリー配列
let storyLines = introStory;
let currentLine = 0;

function hideStoryImage() {
  const storyImage = document.getElementById("story-image");
  if (storyImage) {
    storyImage.style.display = "none";
    storyImage.removeAttribute("src");
    storyImage.onerror = null;
  }
  const storyCharacters = document.getElementById("story-characters");
  if (storyCharacters) {
    storyCharacters.style.display = "none";
    storyCharacters.innerHTML = "";
  }
}

function renderStoryPage(page) {
  const storyText = document.getElementById("story-text");
  const storyImage = document.getElementById("story-image");
  const storyCharacters = document.getElementById("story-characters");

  if (page && typeof page === "object") {
    storyText.innerHTML = page.text || "";

    if (storyImage && page.image) {
      storyImage.onerror = () => {
        storyImage.style.display = "none";
      };
      storyImage.src = page.image;
      storyImage.style.display = "block";
    } else if (storyImage) {
      storyImage.style.display = "none";
      storyImage.removeAttribute("src");
      storyImage.onerror = null;
    }

    if (storyCharacters && page.showOpeningCharacters && typeof window.renderOpeningCharacters === "function") {
      window.renderOpeningCharacters(storyCharacters);
      storyCharacters.style.display = "flex";
    } else if (storyCharacters) {
      storyCharacters.style.display = "none";
      storyCharacters.innerHTML = "";
    }
  } else {
    hideStoryImage();
    storyText.innerHTML = page || "";
  }
}

// -----------------------------------------
// 任意のストーリー配列を表示できる showStory
// -----------------------------------------
function showStory(pages, onEnd) {
  const storyBox = document.getElementById("story-box");
  const storyText = document.getElementById("story-text");
  const nextButton = document.getElementById("next-button");
  const dim = document.getElementById("screen-dim");

  let index = 0;

  storyBox.style.display = "block";
  storyBox.style.opacity = "1";
  storyBox.style.visibility = "visible";
  storyBox.style.pointerEvents = "auto";   // ← これが無いと2周目で死ぬ
  storyText.innerHTML = "";                // ← 前回の内容を消す
  hideStoryImage();

  dim.style.display = "block";

  // 最初のページを表示
  renderStoryPage(pages[index]);
  nextButton.textContent = "▶ 次へ";

  nextButton.onclick = function() {
    index++;

    if (index < pages.length) {
      renderStoryPage(pages[index]);
    } else {
      // ストーリー終了 → 非表示
      hideStoryImage();
      storyBox.style.display = "none";
      storyBox.style.pointerEvents = "none";
      dim.style.display = "none";

      if (typeof onEnd === "function") {
        onEnd();
      }
    }
  };
}


function showRestartButton() {
  const storyBox = document.getElementById("story-box");
  const storyText = document.getElementById("story-text");
  const nextButton = document.getElementById("next-button");
  const dim = document.getElementById("screen-dim");

  hideStoryImage();
  storyBox.style.display = "block";
  storyBox.style.opacity = "1";
  storyBox.style.visibility = "visible";
  storyBox.style.pointerEvents = "auto";
  dim.style.display = "block";

  storyText.innerHTML = "";

  nextButton.textContent = "最初からやり直す";
  nextButton.onclick = () => {
    dim.style.display = "none"; // ← ★ ここで確実に暗転を消す
    restartGame();
  };
}

// -----------------------------------------
// バッドエンドストーリー
// -----------------------------------------
window.showBadEndingStory = function() {
  const pages = [
    "21:00になってしまった…",
    "閉館時間なので退館お願いします。また来てね。",
    "BAD END"
  ];

  showStory(pages, () => {
    // ★ 最後のページを読み終わった後に呼ばれるコールバック
    showRestartButton();
  });
};

// -----------------------------------------
// 偽のエンディングストーリー（1周目：イタリア館）
// -----------------------------------------
window.showFakeEndingStory = function() {
  const pages = [
    "ローマ の 巨人 が 両腕 で <span style=\"color: #FFD700; font-weight: bold;\">●</span> を あげる ぞう。これは天球を巨人が両手で持ち上げるアトラス像のことだ。正解はイタリア館！",
    "ミャクミャク: やあ、2025年の大阪・関西万博を55年ぶりに振り返るEXPO2080脱出ゲームパビリオンは楽しんでいるかな？<br>この夢洲の地でまた万博を開催できたこと、本当にうれしいよ！",
    "えっ？ここがゴールかって？違う違う。55年前のEXPO2025のことをよーく思い出して、もう一度問題を解き直してみて"
  ];

  showStory(pages, () => {
    if (!window.gameState) {
      initGameState();
    }
    window.gameState.loop = 2;

    if (typeof resetTime === "function") {
      resetTime();
    }
    if (typeof mapEngine !== "undefined") {
      mapEngine.hideMap();
    }

    startGame();
    if (typeof updateStamp === "function") {
      updateStamp();
    }
    if (typeof updateFinalButtonState === "function") {
      updateFinalButtonState();
    }

    const firstQuiz = document.getElementById("quiz-q1");
    const statusBar = document.getElementById("status-bar");
    if (firstQuiz) {
      const offset = statusBar ? statusBar.offsetHeight + 12 : 76;
      const top = firstQuiz.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    } else {
      window.scrollTo(0, 0);
    }
  });
};

function clearGameProgressStorage() {
  if (typeof localStorage !== "undefined") {
    if (typeof quizData !== "undefined" && Array.isArray(quizData)) {
      quizData.forEach(q => {
        localStorage.removeItem(`flag_${q.id}`);
        localStorage.removeItem(`hint_${q.id}`);
      });
    }
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("flag_") || key.startsWith("hint_") || key === "game_loop") {
        localStorage.removeItem(key);
      }
    });
  }

  if (typeof sessionStorage !== "undefined") {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith("flag_") || key.startsWith("hint_") || key === "game_loop") {
        sessionStorage.removeItem(key);
      }
    });
  }
}

function restartGame() {
  clearGameProgressStorage();
  initGameState();
  storyLines = introStory;
  currentLine = 0;

  if (typeof resetTime === "function") {
    resetTime();
  }
  if (typeof mapEngine !== "undefined") {
    mapEngine.hideMap();
  }
  hideStoryImage();

  const quizContainer = document.getElementById("quiz-container");
  if (quizContainer) {
    quizContainer.innerHTML = "";
  }

  if (typeof resetHeaderKeywordState === "function") {
    resetHeaderKeywordState();
  }
  if (typeof updateStamp === "function") {
    updateStamp();
  }

  const storyBox = document.getElementById("story-box");
  const dim = document.getElementById("screen-dim");

  storyBox.style.display = "none";
  storyBox.style.visibility = "hidden";
  storyBox.style.opacity = "0";
  storyBox.style.pointerEvents = "none";
  dim.style.display = "none";

  window.scrollTo(0, 0);

  showStory(introStory, () => {
    startGame();
  });
}

// -----------------------------------------
// 真のエンディングストーリー（2周目：夢洲駅）
// -----------------------------------------
window.showGoodEndingStory = function() {
  const pages = [
    "黄色の●は第2問目のアメリカという文字が黄色だったから、漢字に直して米国の一文字目の米を意味している。ローマ の 巨人 が 片腕 で 米 を あげる。",
    "そうか、ローマの巨人とはアトラスじゃない。<br>テルマエ・ロマエでローマ人を演じたあべひろ○。つまりローマの巨人とは夢洲駅の巨大なあ○ひろしの象印広告だ！！",
    {
      text: "オープニングで聞こえたあべひ○しの声がする。『よく辿り着いた。ベストを尽くしたようだな。』",
      image: "img/zojirushi_ad.png"
    },
    {
      text: "「EXPO2080大阪・関西万博の非公式EXPO2025脱出ゲームは楽しかったかい？さようなら、またな」",
      image: "img/zojirushi_ad.png"
    },
    {
      text: "ミャクミャク:EXPO2025脱出ゲームを遊んでくれてありがとう。<br><br>EXPO2080公式マスコットキャラクター<br>こみゃく、ミャクミャク、こもんずのこ<br>がお送りしました。<br>さようなら、またね<br>END",
      showOpeningCharacters: true
    }
  ];

  showStory(pages, () => {
    showRestartButton(); // GOOD END も最後はリスタートへ
  });
};

// -----------------------------------------
// ページ読み込み時に常に新規ゲームとしてイントロ開始
// -----------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  clearGameProgressStorage();
  initGameState();
  if (typeof resetHeaderKeywordState === "function") {
    resetHeaderKeywordState();
  }
  if (typeof updateStamp === "function") {
    updateStamp();
  }
  showStory(introStory, () => {
    startGame();   // ← イントロ終了後にクイズ開始
  });
});
