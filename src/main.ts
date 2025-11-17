//D3.a done! — World of Bits
import leaflet from "leaflet";

import "leaflet/dist/leaflet.css";
import "./style.css";

import "./_leafletWorkaround.ts";
import luck from "./_luck.ts";

// -----------------------------------------
// Constants
// -----------------------------------------
const CLASSROOM = leaflet.latLng(36.997936938, -122.057035075);

const TILE = 1e-4; // size of each cell in degrees
const GRID_RADIUS = 12; // visible grid radius
const INTERACT_RADIUS = 3; // how many cells away you can interact
const TARGET_VALUE = 16; // win when a token reaches this or above

// -----------------------------------------
// UI elements
// -----------------------------------------
const controlPanelDiv = document.createElement("div");
controlPanelDiv.id = "controlPanel";
controlPanelDiv.textContent = "World of Bits — D3.a (Stage 3)";
document.body.append(controlPanelDiv);

const statusPanelDiv = document.createElement("div");
statusPanelDiv.id = "statusPanel";
document.body.append(statusPanelDiv);

// Inventory state: player can hold at most one token
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

// Player marker
const playerMarker = leaflet.marker(CLASSROOM);
playerMarker.addTo(map).bindTooltip("You are here!");

// -----------------------------------------
// Helpers
// -----------------------------------------
function cellKey(i: number, j: number): string {
  return `${i},${j}`;
}

// Distance in "cell units" from origin
function cellDistance(i: number, j: number): number {
  return Math.sqrt(i * i + j * j);
}

// -----------------------------------------
// Token spawning (deterministic initial state)
// -----------------------------------------
function computeInitialTokenValue(i: number, j: number): number | null {
  const r = luck([i, j, "spawn"].toString());

  // about 25% of cells get a token
  if (r < 0.25) {
    const level = 1 + Math.floor(luck([i, j, "value"].toString()) * 3);
    return Math.pow(2, level); // 2, 4, or 8
  }

  return null;
}

// Persistent cell state for this session
const cellStates = new Map<string, number | null>();

// Initialize state for a cell (only once)
function ensureCellState(i: number, j: number): number | null {
  const key = cellKey(i, j);
  if (!cellStates.has(key)) {
    cellStates.set(key, computeInitialTokenValue(i, j));
  }
  return cellStates.get(key) ?? null;
}

// -----------------------------------------
// Draw grid cells with interactions
// -----------------------------------------
for (let i = -GRID_RADIUS; i <= GRID_RADIUS; i++) {
  for (let j = -GRID_RADIUS; j <= GRID_RADIUS; j++) {
    const lat0 = CLASSROOM.lat + i * TILE;
    const lng0 = CLASSROOM.lng + j * TILE;
    const lat1 = CLASSROOM.lat + (i + 1) * TILE;
    const lng1 = CLASSROOM.lng + (j + 1) * TILE;

    const bounds = leaflet.latLngBounds([[lat0, lng0], [lat1, lng1]]);
    const rect = leaflet.rectangle(bounds, {
      color: "#555",
      weight: 1,
    }).addTo(map);

    // Ensure this cell has an initial state
    const value = ensureCellState(i, j);

    // Center for label
    const center = leaflet.latLng((lat0 + lat1) / 2, (lng0 + lng1) / 2);
    const icon = leaflet.divIcon({
      className: "cellText",
      html: value !== null ? `<span>${value}</span>` : "",
    });
    const textMarker = leaflet.marker(center, { icon }).addTo(map);

    const dist = cellDistance(i, j);

    // Click handler: pick up / place / craft
    rect.on("click", () => {
      // Enforce near-player interaction
      if (dist > INTERACT_RADIUS) {
        alert("That cell is too far away to interact with.");
        return;
      }

      const key = cellKey(i, j);
      const current = cellStates.get(key) ?? null;
      const labelEl = textMarker.getElement();

      const setLabel = (val: number | null) => {
        if (!labelEl) return;
        labelEl.innerHTML = val === null ? "" : `<span>${val}</span>`;
      };

      // Case 1: cell is empty
      if (current === null) {
        if (heldToken !== null) {
          // Place held token into empty cell
          cellStates.set(key, heldToken);
          setLabel(heldToken);
          heldToken = null;
          updateStatus();
        } else {
          alert("Cell is empty and you're holding nothing.");
        }
        return;
      }

      // Case 2: cell has a token and player holds nothing → pick up
      if (heldToken === null) {
        heldToken = current;
        updateStatus();

        cellStates.set(key, null);
        setLabel(null);
        return;
      }

      // Case 3: both cell and hand have tokens
      if (heldToken === current) {
        // Matching values → craft
        const newValue = current * 2;
        cellStates.set(key, newValue);
        setLabel(newValue);

        heldToken = null;
        updateStatus();

        if (newValue >= TARGET_VALUE) {
          alert(`You win! Crafted a token of value ${newValue}!`);
        }
      } else {
        alert("Values don't match. You can only craft matching tokens.");
      }
    });
  }
}
