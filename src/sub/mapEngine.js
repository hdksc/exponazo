// ===============================
// mapEngine.js
// 万博画像マップの初期化・管理モジュール
// ===============================

window.mapEngine = (() => {

  // Leaflet の地図オブジェクト（1回だけ初期化）
  let map = null;

  // パビリオンマーカー一覧（code → marker）
  window.pavilionMarkers = {};

  // プレイヤーマーカー
  window.playerMarker = null;

  // -----------------------------------------
  // 緯度経度 → 画像座標に変換
  // -----------------------------------------
  function latLng2yx(lat, lng) {
    const minLat = 34.64325;
    const maxLat = 34.65624;
    const minLng = 135.37360;
    const maxLng = 135.39250;

    const imageWidth = 2176;
    const imageHeight = 1874;

    const x = (lng - minLng) / (maxLng - minLng) * imageWidth;
    const y = (lat - minLat) / (maxLat - minLat) * imageHeight;

    const offsetY = -5;
    return [y + offsetY, x];
  }

  // -----------------------------------------
  // 地図の初期化（1回だけ）
  // -----------------------------------------
  function initMap() {
    if (map) return map;

    map = L.map("map", {
      crs: L.CRS.Simple,
      minZoom: -2,
      maxZoom: 3
    });

    const imageWidth = 2176;
    const imageHeight = 1874;
    const bounds = [[0, 0], [imageHeight, imageWidth]];

    L.imageOverlay("./osm-expo.PNG", bounds).addTo(map);
    map.fitBounds(bounds);
    map.setZoom(map.getZoom() + 1);
    map.attributionControl.addAttribution('© OpenStreetMap');
    addPavilionMarkers(map);
    //addPlayerMarker(map);

    return map;
  }

  // -----------------------------------------
  // プレイヤーマーカー追加
  // -----------------------------------------
  function addPlayerMarker(map) {
    const myMarkerIcon = L.icon({
      iconUrl: createMarkerImage(),
      iconSize: [100, 100],
      iconAnchor: [50, 50],
      className: 'my-marker-icon'
    });

    const [py, px] = latLng2yx(34.6504164, 135.3895644);

    window.playerMarker = L.marker([py, px], {
      icon: myMarkerIcon,
      zIndexOffset: 1000
    }).addTo(map);
  }

  // -----------------------------------------
  // パビリオンマーカー追加
  // -----------------------------------------
  const FEATURED_PAVILION_LABELS = {
    S09It: "イタリア館",
    P11: "アメリカ館",
    S22: "イギリス館",
    P28: "中国館",
    P12: "フランス館"
  };

  function addPavilionMarkers(map) {
    if (!window.pavilionList) return;

    window.pavilionList.forEach(p => {
      const [y, x] = latLng2yx(p.lat, p.lng);
      const markerKey = p.id || p.code;

      const marker = L.marker([y, x], {
        icon: createPavilionIcon('red')
      }).addTo(map);

      marker.bindPopup(`<strong>${p.name}</strong>`);
      if (FEATURED_PAVILION_LABELS[markerKey] && typeof marker.bindTooltip === "function") {
        marker.bindTooltip(FEATURED_PAVILION_LABELS[markerKey], {
          permanent: true,
          interactive: true,
          direction: "top",
          offset: [0, -6],
          className: "pavilion-label-tooltip"
        });
      }
      window.pavilionMarkers[markerKey] = marker;
    });
  }

  function createPavilionIcon(color = 'red') {
    return L.divIcon({
      className: 'pavilion-icon',
      html: `<div style="color: ${color}; font-size: 20px;">▼</div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  }

  // -----------------------------------------
  // 地図とヘッダー・問題パネルの配置同期
  // -----------------------------------------
  function updateMapLayout() {
    const statusBar = document.getElementById("status-bar");
    const headerPanel = document.getElementById("map-header-panel");
    const mapEl = document.getElementById("map");
    if (!mapEl) return;

    const statusHeight = statusBar ? statusBar.offsetHeight : 0;
    let panelHeight = 0;

    if (headerPanel && !headerPanel.classList.contains("map-header-hidden")) {
      headerPanel.style.top = `${statusHeight}px`;
      panelHeight = headerPanel.offsetHeight;
    }

    const mapTop = statusHeight + panelHeight;
    mapEl.style.top = `${mapTop}px`;
    mapEl.style.height = `calc(100vh - ${mapTop}px)`;

    if (map) {
      map.invalidateSize();
    }
  }

  window.addEventListener("resize", () => {
    const mapEl = document.getElementById("map");
    if (mapEl && mapEl.classList.contains("visible")) {
      updateMapLayout();
    }
  });

  // -----------------------------------------
  // 地図をフェードイン表示
  // -----------------------------------------
  function showMap() {
    const headerPanel = document.getElementById("map-header-panel");
    if (headerPanel) {
      headerPanel.classList.remove("map-header-hidden");
    }

    if (typeof window.applyHiddenCharColor === "function") {
      window.applyHiddenCharColor(document.getElementById("map-analysis-keywords"));
    }

    initMap();
    updateMapLayout();
    document.getElementById("map").classList.add("visible");

    setTimeout(updateMapLayout, 80);
    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 650);
  }

  // -----------------------------------------
  // 地図をフェードアウト非表示
  // ＋ 地図 UI のイベントを完全解除（重要）
  // -----------------------------------------
  function hideMap() {
    document.getElementById("map").classList.remove("visible");

    const headerPanel = document.getElementById("map-header-panel");
    if (headerPanel) {
      headerPanel.classList.add("map-header-hidden");
    }

    const hintBtn = document.getElementById("map-hint-btn");
    if (hintBtn) {
      hintBtn.style.display = "none";
      hintBtn.disabled = false;
      hintBtn.textContent = "ヒントを見る";
      hintBtn.onclick = null;
    }

    const hintBox = document.getElementById("map-hint-box");
    if (hintBox) {
      hintBox.innerHTML = "";
    }

    const selectAllBtn = document.getElementById("select-all-keywords-btn");
    if (selectAllBtn) {
      selectAllBtn.style.display = "none";
      selectAllBtn.onclick = null;
    }

    const cancelBtn = document.getElementById("map-cancel-btn");
    if (cancelBtn) {
      cancelBtn.onclick = null;
    }

    if (typeof window.getSelection === "function") {
      const sel = window.getSelection();
      if (sel) sel.removeAllRanges();
    }
    if (typeof window.updateHiddenMarksRevealState === "function") {
      window.updateHiddenMarksRevealState();
    }

    const feedbackEl = document.getElementById("map-prompt-feedback");
    if (feedbackEl) {
      feedbackEl.textContent = "";
    }

    // ★ 地図 UI のイベント解除（今回のバグの根本対策）
    const ui = document.getElementById("map-ui");
    const uiYes = document.getElementById("map-ui-yes");
    const uiNo = document.getElementById("map-ui-no");
    const uiText = document.getElementById("map-ui-text");
    const uiResult = document.getElementById("map-ui-result");

    ui.classList.remove("show");
    if (uiText) {
      uiText.innerHTML = "";
    }
    if (uiResult) {
      uiResult.textContent = "";
    }

    // イベント解除
    uiYes.replaceWith(uiYes.cloneNode(true));
    uiNo.replaceWith(uiNo.cloneNode(true));
    Object.values(window.pavilionMarkers).forEach(marker => {
      marker.off("click");
      marker.closePopup();
    });
  }

  // -----------------------------------------
  // 外部公開
  // -----------------------------------------
  return {
    initMap,
    showMap,
    hideMap,
    updateMapLayout,
    latLng2yx
  };

})();
