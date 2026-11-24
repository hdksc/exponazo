// コミャク風マーカー(駒ャク)
function drawMarker(canvas, x = 50, y = 50, outerColor = "#e60012", innerColor = "white", pupilColor = "#0068b7") {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const outer = 20;
  const middle = outer / 2;
  const pupil = outer / 5;

  // 外側の丸
  ctx.beginPath();
  ctx.arc(x, y, outer, 0, Math.PI * 2);
  ctx.fillStyle = outerColor;
  ctx.fill();

  // 内側の丸
  ctx.beginPath();
  ctx.arc(x + outer / 3, y - outer / 3, middle, 0, Math.PI * 2);
  ctx.fillStyle = innerColor;
  ctx.fill();

  // 瞳
  ctx.beginPath();
  ctx.arc(x + outer / 3 + middle / 3, y - outer / 3 - middle / 3, pupil, 0, Math.PI * 2);
  ctx.fillStyle = pupilColor;
  ctx.fill();
}

function createMarkerImage() {
  const canvas = document.createElement("canvas");
  canvas.width = 100;
  canvas.height = 100;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.warn("Canvas context が取得できませんでした");
    return "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
  }

  drawMarker(canvas, 50, 50, "black", "white", "black");
  return canvas.toDataURL();
}

/* ==========================================================================
   🌟 こもんず Lite 版
   --------------------------------------------------------------------------
   元SVGの500×500座標系をそのまま縮小してCanvasに描画する。

   ・SVG (250, 250) → body.position
   ・ボディと目の相対位置は元SVGそのまま
   ・目は固定
   ・dirX / dirY は使用しない
   ・eyeX / eyeY は使用しない
   ・blink / sleep は使用しない
   ・jumpのみ物理演算用として使用
   ========================================================================== */
function drawCommonsLite(ctx, body, mainColor, radius = 20) {
  if (!ctx || !body) return;

  const exp = (typeof getExpression === "function" ? getExpression(body) : null) || { jump: 0 };

  const baseX = body.position.x;
  const baseY = body.position.y - (exp.jump || 0);

  const SVG_CENTER_X = 250;
  const SVG_CENTER_Y = 250;
  const SVG_BODY_HEIGHT = 321.20;

  const scale = (radius * 2.0) / SVG_BODY_HEIGHT;

  const offsetX = baseX - SVG_CENTER_X * scale;
  const offsetY = baseY - SVG_CENTER_Y * scale;

  const bodyPath = new Path2D(
    "M 252.22 90.85 " +
    "C 239.51 92.16, 226.63 93.37, 214.65 98.03 " +
    "C 202.68 102.70, 191.48 109.30, 181.76 117.68 " +
    "C 172.05 126.05, 163.68 136.05, 156.57 146.73 " +
    "C 149.46 157.40, 143.55 168.86, 138.99 180.89 " +
    "C 134.43 192.93, 131.10 205.32, 127.28 217.56 " +
    "C 123.45 229.81, 120.37 242.37, 115.30 254.14 " +
    "C 110.23 265.91, 102.43 276.52, 93.15 285.36 " +
    "C 83.86 294.21, 71.71 300.01, 63.87 310.23 " +
    "C 56.02 320.45, 52.95 334.59, 57.45 346.67 " +
    "C 61.95 358.74, 74.47 366.74, 87.13 367.67 " +
    "C 99.80 368.61, 111.78 360.31, 124.52 359.50 " +
    "C 137.26 358.70, 146.79 370.60, 152.83 381.83 " +
    "C 158.87 393.05, 170.97 401.04, 183.58 402.57 " +
    "C 196.19 404.11, 209.23 399.87, 219.90 392.79 " +
    "C 230.57 385.71, 244.18 380.76, 255.81 386.13 " +
    "C 267.43 391.51, 275.75 403.11, 287.89 406.93 " +
    "C 300.02 410.75, 313.94 409.64, 325.20 403.33 " +
    "C 336.46 397.01, 340.49 382.91, 351.10 375.36 " +
    "C 361.70 367.82, 375.44 373.98, 387.62 377.89 " +
    "C 399.80 381.79, 413.41 384.31, 425.01 378.72 " +
    "C 436.61 373.14, 442.58 360.19, 442.56 347.19 " +
    "C 442.54 334.19, 434.37 323.21, 425.16 314.27 " +
    "C 415.96 305.32, 405.82 296.93, 399.08 286.06 " +
    "C 392.34 275.18, 389.96 262.21, 387.24 249.66 " +
    "C 384.51 237.11, 381.59 224.63, 378.96 212.05 " +
    "C 376.33 199.47, 373.42 186.91, 368.89 174.93 " +
    "C 364.36 162.94, 358.38 151.44, 350.94 140.96 " +
    "C 343.51 130.49, 334.55 121.12, 324.15 113.56 " +
    "C 313.75 106.00, 302.26 99.96, 290.05 96.00 " +
    "C 277.84 92.05, 264.94 89.55, 252.22 90.85 Z"
  );

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  // 1. ボディ
  ctx.fillStyle = mainColor;
  ctx.fill(bodyPath);

  // 2. 目グループ
  ctx.save();
  ctx.translate(-30, 40);

  // 3. 白目
  ctx.beginPath();
  ctx.ellipse(253.00, 167.61, 46.19, 66.12, 5 * Math.PI / 180, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  // 4. 白目をクリップ領域にする
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(253.00, 167.61, 46.19, 66.12, 5 * Math.PI / 180, 0, Math.PI * 2);
  ctx.clip();

  // 5. グレーの虹彩
  ctx.beginPath();
  ctx.ellipse(243.75, 155.60, 28.35, 39.96, 5 * Math.PI / 180, 0, Math.PI * 2);
  ctx.fillStyle = "#d0d5d9";
  ctx.fill();

  // 6. 黒目
  ctx.beginPath();
  ctx.ellipse(235.71, 150, 19, 27, 5 * Math.PI / 180, 0, Math.PI * 2);
  ctx.fillStyle = "#000000";
  ctx.fill();

  // 7. 白いハイライト
  ctx.beginPath();
  ctx.ellipse(247.21, 135, 10.00, 12.50, 5 * Math.PI / 180, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.restore();
  ctx.restore();
  ctx.restore();
}

function renderOpeningCharacters(container) {
  if (!container) return;
  container.innerHTML = "";

  const leftWrap = document.createElement("div");
  leftWrap.className = "title-sub";
  const leftCanvas = document.createElement("canvas");
  leftCanvas.width = 64;
  leftCanvas.height = 64;
  drawMarker(leftCanvas, 32, 32);
  leftWrap.appendChild(leftCanvas);

  const centerImg = document.createElement("img");
  centerImg.src = "img/myaku.png";
  centerImg.className = "title-main";

  const rightWrap = document.createElement("div");
  rightWrap.className = "title-sub";
  const rightCanvas = document.createElement("canvas");
  rightCanvas.width = 64;
  rightCanvas.height = 64;
  const ctx = rightCanvas.getContext("2d");
  if (ctx) {
    drawCommonsLite(ctx, { position: { x: 32, y: 32 } }, "#e60012", 20);
  }
  rightWrap.appendChild(rightCanvas);

  container.appendChild(leftWrap);
  container.appendChild(centerImg);
  container.appendChild(rightWrap);
}

window.renderOpeningCharacters = renderOpeningCharacters;

document.addEventListener("DOMContentLoaded", () => {
  const leftContainer = document.getElementById("comyaku-left");
  if (leftContainer) {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    drawMarker(canvas, 32, 32);
    leftContainer.appendChild(canvas);
  }

  const rightContainer = document.getElementById("comyaku-right");
  if (rightContainer) {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      drawCommonsLite(ctx, { position: { x: 32, y: 32 } }, "#e60012", 20);
    }
    rightContainer.appendChild(canvas);
  }
});
