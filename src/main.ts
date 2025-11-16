// @deno-types="npm:@types/leaflet"
import leaflet from "leaflet";

// Styles
import "leaflet/dist/leaflet.css";
import "./style.css";

// Fix Leaflet marker icons
import "./_leafletWorkaround.ts";

// Deterministic RNG (we'll use this later)

// -----------------------------------------
// Constants
// -----------------------------------------
const CLASSROOM = leaflet.latLng(36.997936938, -122.057035075);

// -----------------------------------------
// Basic UI elements
// -----------------------------------------
const controlPanelDiv = document.createElement("div");
controlPanelDiv.id = "controlPanel";
controlPanelDiv.textContent = "World of Bits — D3.a (Stage 1)";
document.body.append(controlPanelDiv);

const statusPanelDiv = document.createElement("div");
statusPanelDiv.id = "statusPanel";
document.body.append(statusPanelDiv);

// Inventory state (for now just display "nothing")
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

// Base map tiles
leaflet
  .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  })
  .addTo(map);

// Player marker
const playerMarker = leaflet.marker(CLASSROOM);
playerMarker.addTo(map).bindTooltip("You are here!");
