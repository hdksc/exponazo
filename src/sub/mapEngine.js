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
  function addPavilionMarkers(map) {
    if (!window.pavilionList) return;

    window.pavilionList.forEach(p => {
      const [y, x] = latLng2yx(p.lat, p.lng);

      const marker = L.marker([y, x], {
        icon: createPavilionIcon('red')
      }).addTo(map);

      marker.bindPopup(`<strong>${p.name}</strong>`);
      window.pavilionMarkers[p.code] = marker;
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
  // 地図をフェードイン表示
  // -----------------------------------------
  function showMap() {
    initMap();
    document.getElementById("map").classList.add("visible");
  }

  // -----------------------------------------
  // 地図をフェードアウト非表示
  // ＋ 地図 UI のイベントを完全解除（重要）
  // -----------------------------------------
  function hideMap() {
    document.getElementById("map").classList.remove("visible");

    // ★ 地図 UI のイベント解除（今回のバグの根本対策）
    const ui = document.getElementById("map-ui");
    const uiYes = document.getElementById("map-ui-yes");
    const uiNo = document.getElementById("map-ui-no");

    ui.classList.remove("show");

    // イベント解除
    uiYes.replaceWith(uiYes.cloneNode(true));
    uiNo.replaceWith(uiNo.cloneNode(true));
    Object.values(window.pavilionMarkers).forEach(marker => {
  marker.off("click");
});

  }

  // -----------------------------------------
  // 外部公開
  // -----------------------------------------
  return {
    initMap,
    showMap,
    hideMap,
    latLng2yx
  };

})();
