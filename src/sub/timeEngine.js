// ===============================
// timeEngine.js
// ===============================

// ★ 初期時間を定数化
const INITIAL_HOUR = 9;
const INITIAL_MINUTE = 0;

// ゲーム内時間
let gameHour = INITIAL_HOUR;
let gameMinute = INITIAL_MINUTE;

// 回答ごとに進む時間（分）
const TIME_PER_ACTION = 60;

// ゲームオーバー時刻
const GAME_OVER_HOUR = 21;


// ステータス欄の更新
function updateGameTimeDisplay() {
  const timeStr = `${gameHour}:${String(gameMinute).padStart(2, "0")}`;
  document.getElementById("game-time").textContent = `🕒 ${timeStr}`;
}

// 時間を進める
function advanceTime() {
  gameMinute += TIME_PER_ACTION;

  if (gameMinute >= 60) {
    gameMinute -= 60;
    gameHour += 1;
  }

  updateGameTimeDisplay();

  // ゲームオーバー判定
  if (gameHour > GAME_OVER_HOUR) {
    triggerBadEnding();
  }
}

// バッドエンド処理
function triggerBadEnding() {
  alert("時間切れ！");

  // ストーリー表示（story.js の関数を呼ぶ）
  if (window.showBadEndingStory) {
    window.showBadEndingStory();
  }

  // ゲーム停止（必要なら）
}

function resetTime() {
  gameHour = INITIAL_HOUR;
  gameMinute = INITIAL_MINUTE;
  updateGameTimeDisplay();
}
