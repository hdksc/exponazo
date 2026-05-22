// ===============================
// story.js
// ===============================

// デフォルトのストーリー
const introStory = [
  "どこからか懐かしい声が聞こえてきた",
"「脱出ゲームパビリオンへようこそ。これは2025年に開催された大阪・関西万博を懐かしむ脱出ゲーム。ちょっとした小謎やクイズやトリックを用意したので、頑張ってゴールで待ってる僕に会いに来て。それではベストを尽くして！」"
];

// 現在のストーリー配列
let storyLines = introStory;
let currentLine = 0;

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

  dim.style.display = "block";

  // 最初のページを表示
  storyText.innerHTML = pages[index];
  nextButton.textContent = "▶ 次へ";

  nextButton.onclick = function() {
    index++;

    if (index < pages.length) {
      storyText.innerHTML = pages[index];
    } else {
      // ストーリー終了 → 非表示
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

  storyBox.style.display = "block";
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

function restartGame() {
  localStorage.clear();
  resetTime();
  mapEngine.hideMap();

  const storyBox = document.getElementById("story-box");
  const dim = document.getElementById("screen-dim");

  storyBox.style.display = "none";
  storyBox.style.visibility = "hidden";
  storyBox.style.opacity = "0";
  storyBox.style.pointerEvents = "none";

  dim.style.display = "none";

  // ★ スクロールを先頭に戻す
  window.scrollTo(0, 0);

  startGame();
  updateStamp();
}

window.showGoodEndingStory = function() {
  const pages = [
    "大きな壁の象とは、象印の広告だ！解除キーワード「ぞうじるし」を入力すると…",
    "ピーピー！！ちがうのか！じゃあ「あべひろし」",
    "ピピピッ… ピピピッ…解除成功！ 爆発物は安全に処理された！",
    "コミャンくんと警察の活躍により、万博は無事に続行された！",
    "GOOD END"
  ];

  showStory(pages, () => {
    showRestartButton(); // GOOD END も最後はリスタートへ
  });
};

// -----------------------------------------
// ページ読み込み時にイントロ開始
// -----------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  showStory(introStory, () => {
    startGame();   // ← イントロ終了後にクイズ開始
  });
});
