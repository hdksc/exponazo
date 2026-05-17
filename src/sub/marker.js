 //コミャク風マーカー(駒ャク)
  function drawMarker(canvas, x = 50, y = 50, outerColor = "black", innerColor = "white", pupilColor = "black") {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const outer = 20;
  const middle = outer / 2;
  const pupil = outer / 5;

  // 赤い丸（外側）
  ctx.beginPath();
  ctx.arc(x, y, outer, 0, Math.PI * 2);
  ctx.fillStyle = outerColor;
  ctx.fill();

  // 白い丸（内側）
  ctx.beginPath();
  ctx.arc(x + outer / 3, y - outer / 3, middle, 0, Math.PI * 2);
  ctx.fillStyle = innerColor;
  ctx.fill();

  // 青い瞳
  ctx.beginPath();
  ctx.arc(x + outer / 3 + middle / 3, y - outer / 3 - middle / 3, pupil, 0, Math.PI * 2);
  ctx.fillStyle = pupilColor;
  ctx.fill();
}


//SVGを画像に変換
function createMarkerImage() {
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.warn("Canvas context が取得できませんでした");
    return 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png'; // Leaflet標準マーカーにフォールバック
  }

  drawMarker(canvas, 50, 50); // 中心に描画
  return canvas.toDataURL(); // ← 画像データとして返す！
}
