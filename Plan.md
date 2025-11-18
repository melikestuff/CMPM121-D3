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

## D3.B: Globe-spanning Gameplay

Movement must be possible (any method is fine right now, on-screen buttons will work too). And more functionaility to the map has to be added. Code should be refactored here too.

## Software Requirements (per assignment)

[x] Interface provides movement buttons (N/S/E/W)
[x] Grid recentered as player moves
[x] Cells appear everywhere the player pans or travels
[x] Use an earth-spanning grid anchored at Null Island
[x] Cell state does not persist once it scrolls off-screen
[x] Conversion helpers between lat/lng and cell indices
[x] Detect map scrolling (via Leaflet’s moveend)

## Gameplay Requirements (per assignment)

Player can:
[x] Move using buttons Or scroll the map freely
[x?] Interaction only allowed near the player’s true location
[x] Cells appear memoryless -> farming allowed
[x] Player should now be able to craft a higher value token
[x] Raise victory requirement appropriately

## New Global Coordinate System

[x] Create a Cell type: { i: number; j: number }
[x] Define grid origin at Null Island (0° lat, 0° lng)
[x] Replace classroom-relative grid with playerCell {i, j}
[x] Create helpers:
[x] - latLngToCell(lat, lng) function
[x] - cellToBounds(i, j) function

## Player Position changes

[x] Track player with playerCell: Cell
[x] Initialize playerCell by converting classroom lat/long to a cell
[x] Map center always reflects playerCell
[x] Update playerMarker position dynamically

## Movement Buttons

[x] Add N/S/E/W buttons to control panel, AKA W,S,D,A controls.
[x] Add movePlayer(di, dj) function
[x] Movement updates:
[x] - playerCell.i += di
[x] - playerCell.j += dj
[x] - Recenter map using map.setView()
[x] - Redraw grid
[x] Confirm interactions only work near new location

## Examine the moveend event that gets fired in Leaflet map objects to find out how to notice when the player has finished moving the map

[x] Implement moveend event listener
[x] Test if it works: Interacting with far away cells, cells close to player but far away.

## Memoryless Cells

[x] Remove Map-based persistent cell state from D3.a
[x] Always compute token value using luck when cell becomes visible
[x] Confirm:
[x] - Leaving and returning resets cell state
[x] - Farming is possible as grids regenerate off-screen

## Crafting update

[x] Increase number required to win (32?)
[x] Victory is achieved with this new number

## Double checking for submission

[x] Buttons for movement!
[x] Grid cells spawn/despawn as camera / player moves
[x] Null island
[x] Gameplay requirements for map and crafting
[x] - Map can be moved by mouse or scrolling, seeing cells
[x] - Memoryless cells, allowing for farming
[x] - Higher victory number needed to end the game?
[x] Grid representation as i and j
[x] Functions / helper functions to convert lat/lng <-> grid cell{i,j}
[x] Leaflet moveend event listener implementation

## D3.C implementation

[x] Cells should use effective memory-saving strategys so cells not visible on the map do not require memory for storage if they have not been modified by the player.
[x] Cells store their state if modified
[x] Map has a memory of their state even when not visible
[x] Use a map using cells as keys and token as values

## D3.D implementation

Player must be moved by geolocation API now (real-time movement). The game must also have capabilities to save the game state for future page loads.

[] Browser geolocation API used to control player movement instead of on-screen buttons
[] Code shouldn't depend/run when the player moves
[x] Store game state AKA save the game using browser localStorage API to persist game states between page loads
[x] Player should be able to reset their save state or start a new game
[] Be able to switch from button-based movement to geolocation-based movement
