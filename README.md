# Double Arkanoid

A unique twist on the classic Arkanoid game featuring two sides - Light and Dark - where balls convert opposite-colored bricks.

## Game Concept

- The playing field is divided into light (left, golden) and dark (right, purple) sides
- Each side has its own ball that bounces freely
- Balls can move through bricks of their own color without collision
- When a ball hits a brick of the opposite color, it converts that brick to the ball's color
- The game tracks how many bricks each side has converted
- Win condition: Convert all bricks to one color

## Features

- Beautiful modern UI with gradient backgrounds and glowing effects
- Smooth physics and collision detection
- Pause/Resume functionality
- Score tracking for conversions
- Responsive design

## How to Play

1. Click "Start Game" to begin
2. Watch as the light and dark balls bounce around
3. Balls will convert opposite-colored bricks on contact
4. The game ends when all bricks are converted to one color

## Running the Game

### Option 1: Direct File Access
Simply open `index.html` in a modern web browser

### Option 2: Local Server (Recommended)
```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js
npx http-server

# Using the npm script
npm start
```
Then navigate to `http://localhost:8000`

## Running Tests

Open `tests/test.html` in your browser or run:
```bash
npm test
```

## Deployment

This game is perfect for GitHub Pages:
1. Push to a GitHub repository
2. Enable GitHub Pages in repository settings
3. Select the main branch and root directory
4. Your game will be available at `https://[username].github.io/[repository-name]`

## Technical Details

- Pure frontend implementation (HTML5, CSS3, JavaScript)
- Canvas-based rendering
- No external dependencies
- Comprehensive test suite with 12 tests

## Browser Compatibility

Works on all modern browsers that support:
- HTML5 Canvas
- ES6 JavaScript features
- CSS3 animations and effects

## License

MIT License - feel free to modify and use as you wish! 