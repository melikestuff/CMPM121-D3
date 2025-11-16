# D3: {game title goes here}

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

# Set up

1. Create repo using instructor starter template
2. Enable GitHub Pages through GitHub Actions
3. Create this PLAN.md
4. Add initial commit with empty main.ts structure

# Delete Starter Code & start fresh

1. Copy starter main.ts -> reference.ts for safety
2. Delete the entire starter main.ts
3. Start fresh with new file structure

# Gameplay implementation

1. Create Leaflet map centered on the classroom coordinates
2. Lock zoom level
3. Add a player marker with tooltip
4. Write helper to convert cell i,j -> lat/lng bounds
5. Draw a single cell rectangle for testing
6. Draw the entire grid (15×15 around player)
7. Add a divIcon text marker at each cell to display token values
8. Use luck() with deterministic hashing to produce:
9. consistent empty/non-empty result
10. consistent token values
11. Make tokens visible without clicking
12. Restrict interaction: only allow clicks within radius (3 cells)
13. Implement picking up a token
14. Implement holding exactly one token at any time
15. Implement placing a token on an empty cell
16. Implement crafting (same value -> one token of double value)
17. Cell updates visually after interaction
18. reate status panel showing held token or “nothing”
19. Update status after each interaction
20. Detect when crafted value reaches threshold (8/16/etc.)
21. Display win notification
22. Deploy working D3.a version
