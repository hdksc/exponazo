// ===============================
// 地図選択モード
// ===============================
function getFirstTextNode(node) {
  if (!node) return null;
  if (node.nodeType === 3 && node.textContent.length > 0) return node;
  for (let i = 0; i < node.childNodes.length; i++) {
    const found = getFirstTextNode(node.childNodes[i]);
    if (found) return found;
  }
  return null;
}

function getLastTextNode(node) {
  if (!node) return null;
  if (node.nodeType === 3 && node.textContent.length > 0) return node;
  for (let i = node.childNodes.length - 1; i >= 0; i--) {
    const found = getLastTextNode(node.childNodes[i]);
    if (found) return found;
  }
  return null;
}

function selectAllAnalysisKeywords() {
  const target = document.getElementById("map-analysis-keywords");
  if (!target || typeof window.getSelection !== "function") return;

  const selection = window.getSelection();
  if (!selection) return;

  const range = document.createRange();
  const firstText = getFirstTextNode(target);
  const lastText = getLastTextNode(target);

  if (firstText && lastText) {
    range.setStart(firstText, 0);
    range.setEnd(lastText, lastText.textContent.length);
  } else {
    range.selectNodeContents(target);
  }

  selection.removeAllRanges();
  selection.addRange(range);

  if (typeof window.updateHiddenMarksRevealState === "function") {
    window.updateHiddenMarksRevealState(range);
  }
}

function showMapSelection(quiz, result) {
  if (typeof updateStamp === "function") {
    updateStamp();
  }

  const feedbackEl = document.getElementById("map-prompt-feedback");
  if (feedbackEl) {
    feedbackEl.textContent = "";
  }

  const currentLoopOnOpen = window.gameState && window.gameState.loop
    ? window.gameState.loop
    : 1;

  const MAP_LOOP2_TEXT_HINTS = [
    "黄色い●は何だろう？ピンクの●とどう違う？",
    "第2問目のアメリカが黄色い。アメリカを漢字で書くと米。黄色い●は米を表している。米を片手で持った巨人がどこかにいたような"
  ];

  const hintBtn = document.getElementById("map-hint-btn");
  const hintBox = document.getElementById("map-hint-box");
  const selectAllBtn = document.getElementById("select-all-keywords-btn");

  const renderMapHintsForStep = (step) => {
    if (selectAllBtn) {
      if (step >= 1) {
        selectAllBtn.style.display = "inline-block";
        selectAllBtn.onclick = () => {
          selectAllAnalysisKeywords();
        };
      } else {
        selectAllBtn.style.display = "none";
        selectAllBtn.onclick = null;
      }
    }

    if (hintBox) {
      hintBox.innerHTML = "";
      for (let i = 0; i < MAP_LOOP2_TEXT_HINTS.length; i++) {
        if (step >= i + 2) {
          const p = document.createElement("p");
          p.innerHTML = `<strong>ヒント:</strong> ${MAP_LOOP2_TEXT_HINTS[i]}`;
          hintBox.appendChild(p);
        }
      }
    }

    if (hintBtn) {
      if (step >= 3) {
        hintBtn.textContent = "ヒントは以上だよ";
        hintBtn.disabled = true;
      } else {
        hintBtn.textContent = "ヒントを見る";
        hintBtn.disabled = false;
      }
    }
  };

  if (currentLoopOnOpen >= 2 && quiz.id === "final") {
    if (window.gameState && !window.gameState.hints) {
      window.gameState.hints = {};
    }
    let hintStep = window.gameState && window.gameState.hints
      ? (window.gameState.hints.mapFinalStep || 0)
      : 0;

    if (hintBtn) {
      hintBtn.style.display = "inline-block";
      hintBtn.onclick = () => {
        if (hintStep < 3) {
          hintStep++;
          if (window.gameState && window.gameState.hints) {
            window.gameState.hints.mapFinalStep = hintStep;
          }
          renderMapHintsForStep(hintStep);
          if (typeof mapEngine !== "undefined" && typeof mapEngine.updateMapLayout === "function") {
            mapEngine.updateMapLayout();
          }
        }
      };
    }
    renderMapHintsForStep(hintStep);
  } else {
    if (hintBtn) {
      hintBtn.style.display = "none";
      hintBtn.disabled = false;
      hintBtn.textContent = "ヒントを見る";
      hintBtn.onclick = null;
    }
    if (hintBox) {
      hintBox.innerHTML = "";
    }
    if (selectAllBtn) {
      selectAllBtn.style.display = "none";
      selectAllBtn.onclick = null;
    }
  }

  const cancelBtn = document.getElementById("map-cancel-btn");
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      if (typeof mapEngine !== "undefined") {
        mapEngine.hideMap();
      }
    };
  }

  if (typeof mapEngine !== "undefined") {
    mapEngine.showMap();
  }

  const ui = document.getElementById("map-ui");
  const uiText = document.getElementById("map-ui-text");
  const uiYes = document.getElementById("map-ui-yes");
  const uiNo = document.getElementById("map-ui-no");
  const uiResult = document.getElementById("map-ui-result");

  // 既存イベント解除
  if (window.pavilionMarkers) {
    Object.values(window.pavilionMarkers).forEach(marker => marker.off("click"));
  }

  // マーカークリック時の処理（この時点では正誤判定を行わない）
  Object.entries(window.pavilionMarkers || {}).forEach(([code, marker]) => {
    marker.on("click", () => {
      const pavilion = (window.pavilionList || []).find(
        p => (p.id || p.code) === code
      );
      if (!pavilion) return;

      if (feedbackEl) {
        feedbackEl.textContent = "";
        if (typeof mapEngine !== "undefined" && typeof mapEngine.updateMapLayout === "function") {
          mapEngine.updateMapLayout();
        }
      }

      uiText.innerHTML = `
        <p class="map-selected-place">選択された場所「${pavilion.name}」</p>
      `;

      uiYes.textContent = "ここで決定";
      uiNo.textContent = "選び直す";
      uiResult.textContent = "";
      ui.classList.add("show");

      uiNo.onclick = () => {
        ui.classList.remove("show");
        uiResult.textContent = "";
        marker.closePopup();
        if (typeof updateStamp === "function") {
          updateStamp();
        }
      };

      uiYes.onclick = () => {
        if (typeof advanceTime === "function") {
          advanceTime();
        }

        const currentLoop = window.gameState && window.gameState.loop
          ? window.gameState.loop
          : 1;
        const selectedId = pavilion.id || pavilion.code;
        const isItaly = (selectedId === "S09It" || pavilion.name === "イタリア館");
        const isYumeshima = (selectedId === quiz.correctPavilion);

        if (currentLoop === 1) {
          if (isItaly) {
            ui.classList.remove("show");
            if (typeof mapEngine !== "undefined") {
              mapEngine.hideMap();
            }
            if (typeof window.showFakeEndingStory === "function") {
              window.showFakeEndingStory();
            }
          } else {
            // 1周目：夢洲駅およびその他の場所は不正解
            ui.classList.remove("show");
            uiResult.textContent = "";
            marker.closePopup();
            if (feedbackEl) {
              feedbackEl.textContent = "不正解です。もう一度場所を選び直してください。";
            }
            if (typeof updateStamp === "function") {
              updateStamp();
            }
            if (typeof mapEngine !== "undefined" && typeof mapEngine.updateMapLayout === "function") {
              mapEngine.updateMapLayout();
            }
          }
          return;
        }

        // 2周目以降の判定
        if (isYumeshima) {
          const displayKeyword = quiz.flag;
          result.innerHTML = `取得キーワード：<strong>${displayKeyword}</strong>`;
          if (window.gameState && window.gameState.flags) {
            window.gameState.flags[quiz.id] = displayKeyword;
          }

          if (typeof updateStamp === "function") {
            updateStamp();
          }

          ui.classList.remove("show");
          if (typeof mapEngine !== "undefined") {
            mapEngine.hideMap();
          }
          if (typeof window.showGoodEndingStory === "function") {
            window.showGoodEndingStory();
          }
        } else {
          // 2周目：イタリア館およびその他の場所は不正解
          ui.classList.remove("show");
          uiResult.textContent = "";
          marker.closePopup();
          if (feedbackEl) {
            feedbackEl.textContent = "不正解です。もう一度場所を選び直してください。";
          }
          if (typeof updateStamp === "function") {
            updateStamp();
          }
          if (typeof mapEngine !== "undefined" && typeof mapEngine.updateMapLayout === "function") {
            mapEngine.updateMapLayout();
          }
        }
      };
    });
  });
}