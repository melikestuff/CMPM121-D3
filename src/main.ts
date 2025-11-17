import leaflet from "leaflet";

import "leaflet/dist/leaflet.css";
import "./style.css";

import "./_leafletWorkaround.ts";
import luck from "./_luck.ts";

// -----------------------------------------
// Constants
// -----------------------------------------
const CLASSROOM = leaflet.latLng(36.997936938, -122.057035075);

// Grid constants
const TILE = 1e-4; // size of cell in degrees
const GRID_RADIUS = 12; // how many cells in each direction from player

// -----------------------------------------
// UI elements
// -----------------------------------------
const controlPanelDiv = document.createElement("div");
controlPanelDiv.id = "controlPanel";
controlPanelDiv.textContent = "World of Bits — D3.a (Stage 2)";
document.body.append(controlPanelDiv);

const statusPanelDiv = document.createElement("div");
statusPanelDiv.id = "statusPanel";
document.body.append(statusPanelDiv);

// Inventory state (still no interactions yet)
const heldToken: number | null = null;

function updateStatus() {
  if (heldToken === null) {
    statusPanelDiv.innerHTML = `Holding: <strong>nothing</strong>`;
  } else {
    statusPanelDiv.innerHTML = `Holding: <strong>${heldToken}</strong>`;
  }
}
updateStatus();

// Map container
const mapDiv = document.createElement("div");
mapDiv.id = "map";
document.body.append(mapDiv);

// -----------------------------------------
// Leaflet map setup
// -----------------------------------------
const map = leaflet.map(mapDiv, {
  center: CLASSROOM,
  zoom: 19,
  minZoom: 19,
  maxZoom: 19,
  zoomControl: false,
  scrollWheelZoom: false,
});

leaflet
  .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  })
  .addTo(map);

// Player marker
const playerMarker = leaflet.marker(CLASSROOM);
playerMarker.addTo(map).bindTooltip("You are here!");

// -----------------------------------------
// Token spawning (deterministic)
// -----------------------------------------
function computeInitialTokenValue(i: number, j: number): number | null {
  const r = luck([i, j, "spawn"].toString());

  // ~25% of cells will spawn a token
  if (r < 0.25) {
    const level = 1 + Math.floor(luck([i, j, "value"].toString()) * 3);
    return Math.pow(2, level); // 2, 4, or 8
  }

  return null;
}

// -----------------------------------------
// Draw grid cells with visible values
// -----------------------------------------
for (let i = -GRID_RADIUS; i <= GRID_RADIUS; i++) {
  for (let j = -GRID_RADIUS; j <= GRID_RADIUS; j++) {
    const lat0 = CLASSROOM.lat + i * TILE;
    const lng0 = CLASSROOM.lng + j * TILE;
    const lat1 = CLASSROOM.lat + (i + 1) * TILE;
    const lng1 = CLASSROOM.lng + (j + 1) * TILE;

    const bounds = leaflet.latLngBounds([[lat0, lng0], [lat1, lng1]]);
    const _rect = leaflet.rectangle(bounds, {
      color: "#555",
      weight: 1,
    }).addTo(map);

    const cellValue = computeInitialTokenValue(i, j);

    // Center of rectangle for label
    const center = leaflet.latLng((lat0 + lat1) / 2, (lng0 + lng1) / 2);

    const icon = leaflet.divIcon({
      className: "cellText",
      html: cellValue ? `<span>${cellValue}</span>` : "",
    });

    leaflet.marker(center, { icon }).addTo(map);
  }
}
