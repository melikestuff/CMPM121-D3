# D3: World of Bits

# Game Design Vision

This game is map-based crafting game inspired by 4096 and Pokémon Go.
Players explore real-world map cells to collect and combine tokens. Matching tokens can be crafted into higher-value tokens, and the player wins when they produce a sufficiently high-value one. All interaction is restricted to nearby cells, encouraging movement.

# Technologies

- TypeScript for most game code, little to no explicit HTML, and all CSS collected in common `style.css` file
- Deno and Vite for building
- GitHub Actions + GitHub Pages for deployment automation

# Assignments

## D3.a: Core mechanics (token collection and crafting)

Key technical challenge: Can you assemble a map-based user interface using the Leaflet mapping framework?
Key gameplay challenge: Can players collect and craft tokens from nearby locations to finally make one of sufficiently high value?

### Steps

## Set up

[x] Create repo using instructor starter template
[x] Enable GitHub Pages through GitHub Actions
[x] Create this PLAN.md
[x] Add initial commit with empty main.ts structure

## Delete Starter Code & start fresh

[x]]Copy starter main.ts -> reference.ts for safety
[x] Delete the entire starter main.ts
[x] Start fresh with new file structure

### Gameplay implementation

## Map things

[x] Create Leaflet map centered on the classroom coordinates
[x] Lock zoom level
[x] Add a player marker with tooltip

## Grid Rendering

[x] Write helper to convert cell i,j -> lat/lng bounds
[x] Draw a single cell rectangle for testing
[x] Draw the entire grid (15×15 around player)
[x] Add a divIcon text marker at each cell to display token values

## Token Spawning

[x] Use luck() with deterministic hashing to produce:
[x] consistent empty/non-empty result
[x] consistent token values
[x] Make tokens visible without clicking

## Interaction

[x] Restrict interaction: only allow clicks within radius (3 cells)
[x] Implement picking up a token
[x] Implement holding exactly one token at any time
[x] ]Implement placing a token on an empty cell
[x] ]Implement crafting (same value -> one token of double value)
[x] Cell updates visually after interaction

## Inventory UI

[x] Create status panel showing held token or “nothing”
[x] Update status after each interaction

## Victionary

[x] ]Detect when crafted value reaches threshold (8/16/etc.)
[x] Display win notification

## Misc

[x] ]Touch up code if needed
[x]]Deploy working D3.a version
