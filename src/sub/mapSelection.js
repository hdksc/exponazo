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