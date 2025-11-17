import leaflet from "leaflet";

import "leaflet/dist/leaflet.css";
import "./style.css";

import "./_leafletWorkaround.ts";
import luck from "./_luck.ts";

// -----------------------------------------
// Constants
// -----------------------------------------
const CLASS_LAT = 36.997936938057016;
const CLASS_LNG = -122.05703507501151;

const TILE = 1e-4; // degrees per cell
const GRID_RADIUS = 12; // grid extends this many cells in each direction
const INTERACT_RADIUS = 3; // distance allowed for interactions
const TARGET_VALUE = 32; // will increase in a later D3.b stage

// -----------------------------------------
// Global cell coordinate system (Null Island anchor)
// -----------------------------------------
type Cell = { i: number; j: number };

function latLngToCell(lat: number, lng: number): Cell {
  return {
    i: Math.floor(lat / TILE),
    j: Math.floor(lng / TILE),
  };
}

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
function cellDistance(a: Cell, b: Cell): number {
  return Math.sqrt((a.i - b.i) ** 2 + (a.j - b.j) ** 2);
}

// -----------------------------------------
// Player position (in both lat/lng and cell coords)
// -----------------------------------------
const playerCell: Cell = latLngToCell(CLASS_LAT, CLASS_LNG);

function playerLatLng(): leaflet.LatLngExpression {
  return [playerCell.i * TILE, playerCell.j * TILE];
}

// -----------------------------------------
// UI setup
// -----------------------------------------
const controlPanelDiv = document.createElement("div");
controlPanelDiv.id = "controlPanel";
controlPanelDiv.textContent = "World of Bits — D3.b";
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

// -----------------------------------------
// Map setup
// -----------------------------------------
const mapDiv = document.createElement("div");
mapDiv.id = "map";
document.body.append(mapDiv);

// Map center ALWAYS follows playerCell
const map = leaflet.map(mapDiv, {
  center: playerLatLng(),
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
const playerMarker = leaflet
  .marker(playerLatLng())
  .addTo(map)
  .bindTooltip("You are here!");

// Keep marker + map centered on player
function updatePlayerPosition() {
  const pos = playerLatLng();
  playerMarker.setLatLng(pos);
  map.setView(pos, 19);
}

// -----------------------------------------
// TOKEN GENERATION (DETERMINISTIC)
// -----------------------------------------
function initialTokenValue(cell: Cell): number | null {
  const r = luck([cell.i, cell.j, "spawn"].toString());

  if (r < 0.25) {
    const lvl = 1 + Math.floor(luck([cell.i, cell.j, "value"].toString()) * 3);
    return Math.pow(2, lvl);
  }
  return null;
}

// -----------------------------------------
// CELL MEMORY (PERSIST WHILE VISIBLE, RESET WHEN OFF-SCREEN)
// -----------------------------------------
const cellStates = new Map<string, number | null>();

function getCellValue(cell: Cell): number | null {
  const key = cellKey(cell);
  if (cellStates.has(key)) return cellStates.get(key)!;

  const val = initialTokenValue(cell);
  cellStates.set(key, val);
  return val;
}

function setCellValue(cell: Cell, val: number | null) {
  cellStates.set(cellKey(cell), val);
}

// -----------------------------------------
// Grid drawing + interactions
// -----------------------------------------
let drawnLayers: leaflet.Layer[] = [];

function clearGrid() {
  drawnLayers.forEach((l) => map.removeLayer(l));
  drawnLayers = [];
}

function handleCellClick(cell: Cell, textMarker: leaflet.Marker) {
  // Enforce interaction radius based on global cell coordinates
  if (cellDistance(cell, playerCell) > INTERACT_RADIUS) {
    alert("Too far away to interact.");
    return;
  }

  const el = textMarker.getElement();
  const setLabel = (v: number | null) => {
    if (!el) return;
    el.innerHTML = v === null ? "" : `<span>${v}</span>`;
  };

  const currentText = el?.textContent?.trim();
  const current = currentText === "" ? null : Number(currentText);

  // Empty cell → place token
  if (current === null) {
    if (heldToken !== null) {
      setLabel(heldToken);
      setCellValue(cell, heldToken);
      heldToken = null;
      updateStatus();
    }
    return;
  }

  // Cell has a token, hand empty -> pick up
  if (heldToken === null) {
    heldToken = current;
    updateStatus();
    setLabel(null);
    setCellValue(cell, null);
    return;
  }

  // Cell has token, hand has token -> maybe craft
  if (heldToken === current) {
    const newVal = current * 2;
    setLabel(newVal);
    setCellValue(cell, newVal);
    heldToken = null;
    updateStatus();

    if (newVal >= TARGET_VALUE) {
      alert(`You crafted ${newVal}!`);
    }
  } else {
    alert("Values must match to craft.");
  }
}

function drawGrid(centerCell: Cell) {
  clearGrid();

  for (let di = -GRID_RADIUS; di <= GRID_RADIUS; di++) {
    for (let dj = -GRID_RADIUS; dj <= GRID_RADIUS; dj++) {
      const cell = { i: centerCell.i + di, j: centerCell.j + dj };

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
drawGrid(latLngToCell(CLASS_LAT, CLASS_LNG));

// -----------------------------------------
// Movement Buttons
// -----------------------------------------
const movementDiv = document.createElement("div");
movementDiv.style.marginTop = "1rem";

movementDiv.innerHTML = `
  <button id="north">North</button>
  <button id="south">South</button>
  <button id="east">East</button>
  <button id="west">West</button>
`;

controlPanelDiv.append(movementDiv);

function movePlayer(di: number, dj: number) {
  playerCell.i += di;
  playerCell.j += dj;

  updatePlayerPosition(); // ONLY update map position
}

document.getElementById("north")!.addEventListener(
  "click",
  () => movePlayer(1, 0),
);
document.getElementById("south")!.addEventListener(
  "click",
  () => movePlayer(-1, 0),
);
document.getElementById("east")!.addEventListener(
  "click",
  () => movePlayer(0, 1),
);
document.getElementById("west")!.addEventListener(
  "click",
  () => movePlayer(0, -1),
);

// ==========================================================
// MAP SCROLLING (TRIGGERS GRID REBUILD)
// ==========================================================
map.on("moveend", () => {
  const center = map.getCenter();
  const viewCell = latLngToCell(center.lat, center.lng);

  // Determine visible cells
  const newVisible = new Set<string>();
  for (let di = -GRID_RADIUS; di <= GRID_RADIUS; di++) {
    for (let dj = -GRID_RADIUS; dj <= GRID_RADIUS; dj++) {
      newVisible.add(`${viewCell.i + di},${viewCell.j + dj}`);
    }
  }

  drawGrid(viewCell);

  // Player stays where they are
  playerMarker.setLatLng(playerLatLng());
});
