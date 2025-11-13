# Subway Runner

A Subway Surfers-inspired endless runner game built with Three.js, featuring a Minecraft-style UI theme.

## Features

- **3D Graphics**: Built with Three.js for smooth 3D rendering
- **Subway Environment**: Complete with railway tracks, tunnel walls, and support pillars
- **Three Lane System**: Switch between left, center, and right lanes
- **Dynamic Obstacles**: Dodge boxes, barriers, cones, and subway trains
- **Coin Collection**: Collect glowing coins with floating animation
- **Player Actions**:
  - Jump over obstacles
  - Slide under barriers
  - Switch lanes to avoid obstacles
- **Progressive Difficulty**: Game speed increases as you score higher
- **Audio System**: Retro sound effects and background music
- **Minecraft-Style UI**: Pixelated fonts and blocky design elements

## Controls

- **← → Arrow Keys**: Switch lanes (left/right)
- **↑ Arrow / Space**: Jump
- **↓ Arrow**: Slide
- **Escape**: Pause game

## How to Play

1. Open `index.html` in a modern web browser
2. Click "START GAME" to begin
3. Avoid obstacles by switching lanes, jumping, or sliding
4. Collect coins for bonus points
5. Survive as long as possible to achieve a high score

## Game Elements

- **Player**: Blocky character with running animation
- **Environment**: Subway tracks, tunnel walls, and support pillars
- **Obstacles**:
  - Red boxes (jump over)
  - Orange barriers (slide under)
  - Orange cones (jump over)
  - Subway trains (avoid completely)
- **Coins**: Golden coins with glow effect, worth 10 points each
- **Score**: Increases automatically as you run

## Scoring System

- **Distance**: +1 point per frame
- **Coins**: +10 points per coin collected
- **Difficulty**: Speed increases every 500 points

## Dependencies

- **Three.js r128**: 3D graphics library (loaded from CDN)
- **Google Fonts**: Press Start 2P font for Minecraft-style UI
- **Web Audio API**: Built-in browser API for sound generation

## Technical Implementation

- **Engine**: Three.js for 3D rendering
- **Audio**: Web Audio API for procedural sound generation
- **Physics**: Custom collision detection system
- **Animation**: RequestAnimationFrame game loop
- **Spawning**: Timer-based object generation system

## File Structure

- `index.html` - Main HTML file with Minecraft-themed UI
- `style.css` - Minecraft-style CSS with pixelated fonts
- `game.js` - Core game logic and Three.js implementation
- `audio.js` - Audio manager with sound effects and music
- `README.md` - Project documentation


Free to use and modify for personal and educational purposes.
