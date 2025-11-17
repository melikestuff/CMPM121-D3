import leaflet from "leaflet";

import "leaflet/dist/leaflet.css";
import "./style.css";

import "./_leafletWorkaround.ts";
import luck from "./_luck.ts";

// -----------------------------------------
// Constants
// -----------------------------------------
const CLASSROOM = leaflet.latLng(36.997936938057016, -122.05703507501151);

const TILE = 1e-4; // degrees per cell
const GRID_RADIUS = 12; // grid extends this many cells in each direction
const INTERACT_RADIUS = 3; // distance allowed for interactions
const TARGET_VALUE = 16; // will increase in a later D3.b stage

// -----------------------------------------
// Global cell coordinate system (Null Island anchor)
// -----------------------------------------
type Cell = { i: number; j: number };

// Convert real lat/lng → global grid indices (anchored at 0,0)
function latLngToCell(lat: number, lng: number): Cell {
  return {
    i: Math.floor(lat / TILE),
    j: Math.floor(lng / TILE),
  };
}

// Convert global grid indices -> lat/lng bounds
function cellToBounds(cell: Cell) {
  const lat0 = cell.i * TILE;
  const lng0 = cell.j * TILE;
  const lat1 = (cell.i + 1) * TILE;
  const lng1 = (cell.j + 1) * TILE;
  return leaflet.latLngBounds([[lat0, lng0], [lat1, lng1]]);
}

function cellKey(cell: Cell): string {
  return `${cell.i},${cell.j}`;
}

// Distance in cell units from the player’s cell
function cellDistance(cell: Cell, playerCell: Cell): number {
  const di = cell.i - playerCell.i;
  const dj = cell.j - playerCell.j;
  return Math.sqrt(di * di + dj * dj);
}

// -----------------------------------------
// Player position (in both lat/lng and cell coords)
// -----------------------------------------
const playerLatLng = CLASSROOM;
const playerCell: Cell = latLngToCell(playerLatLng.lat, playerLatLng.lng);

// -----------------------------------------
// UI setup
// -----------------------------------------
const controlPanelDiv = document.createElement("div");
controlPanelDiv.id = "controlPanel";
controlPanelDiv.textContent = "World of Bits — D3.b Stage 2";
document.body.append(controlPanelDiv);

const statusPanelDiv = document.createElement("div");
statusPanelDiv.id = "statusPanel";
document.body.append(statusPanelDiv);

// Inventory: one token max
let heldToken: number | null = null;

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

// Player marker at classroom
const playerMarker = leaflet.marker(CLASSROOM);
playerMarker.addTo(map).bindTooltip("You are here!");

// -----------------------------------------
// Deterministic token spawning
// -----------------------------------------
function initialTokenValue(cell: Cell): number | null {
  const r = luck([cell.i, cell.j, "spawn"].toString());

  if (r < 0.25) {
    const lvl = 1 + Math.floor(luck([cell.i, cell.j, "value"].toString()) * 3);
    return Math.pow(2, lvl); // 2, 4, or 8
  }
  return null;
}

const cellStates = new Map<string, number | null>();

function getCellValue(cell: Cell): number | null {
  const key = cellKey(cell);
  if (cellStates.has(key)) {
    return cellStates.get(key) ?? null;
  }
  const init = initialTokenValue(cell);
  cellStates.set(key, init);
  return init;
}

function setCellValue(cell: Cell, value: number | null) {
  const key = cellKey(cell);
  cellStates.set(key, value);
}

// -----------------------------------------
// Grid drawing + interactions
// -----------------------------------------
let drawnLayers: leaflet.Layer[] = [];

function clearGrid() {
  drawnLayers.forEach((layer) => map.removeLayer(layer));
  drawnLayers = [];
}

function handleCellClick(cell: Cell, textMarker: leaflet.Marker) {
  // Enforce interaction radius based on global cell coordinates
  if (cellDistance(cell, playerCell) > INTERACT_RADIUS) {
    alert("That cell is too far away to interact with.");
    return;
  }

  const current = getCellValue(cell);
  const markerEl = textMarker.getElement();

  const setLabel = (val: number | null) => {
    if (!markerEl) return;
    markerEl.innerHTML = val === null ? "" : `<span>${val}</span>`;
  };

  // Empty cell
  if (current === null) {
    if (heldToken !== null) {
      // Place held token into empty cell
      setCellValue(cell, heldToken);
      setLabel(heldToken);
      heldToken = null;
      updateStatus();
    } else {
      alert("Cell is empty and you're holding nothing.");
    }
    return;
  }

  // Cell has a token, hand empty -> pick up
  if (heldToken === null) {
    heldToken = current;
    updateStatus();
    setCellValue(cell, null);
    setLabel(null);
    return;
  }

  // Cell has token, hand has token -> maybe craft
  if (heldToken === current) {
    const newValue = current * 2;
    setCellValue(cell, newValue);
    setLabel(newValue);
    heldToken = null;
    updateStatus();

    if (newValue >= TARGET_VALUE) {
      alert(`🎉 You win! Crafted a token of value ${newValue}!`);
    }
  } else {
    alert("Values do not match. You can only craft identical tokens.");
  }
}

function drawGrid() {
  clearGrid();

  for (let di = -GRID_RADIUS; di <= GRID_RADIUS; di++) {
    for (let dj = -GRID_RADIUS; dj <= GRID_RADIUS; dj++) {
      const cell: Cell = {
        i: playerCell.i + di,
        j: playerCell.j + dj,
      };

      const bounds = cellToBounds(cell);

      const rect = leaflet.rectangle(bounds, {
        color: "#555",
        weight: 1,
      }).addTo(map);

      const value = getCellValue(cell);
      const center = bounds.getCenter();

      const icon = leaflet.divIcon({
        className: "cellText",
        html: value !== null ? `<span>${value}</span>` : "",
      });

      const textMarker = leaflet.marker(center, { icon }).addTo(map);

      drawnLayers.push(rect, textMarker);

      rect.on("click", () => handleCellClick(cell, textMarker));
    }
  }
}

// Initial draw
drawGrid();
