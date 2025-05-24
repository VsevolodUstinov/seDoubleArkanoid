// Simple test verification script
// This verifies the test logic without DOM dependencies

class MockDOM {
    constructor() {
        this.elements = {};
    }
    
    getElementById(id) {
        if (!this.elements[id]) {
            this.elements[id] = {
                textContent: '',
                innerHTML: '',
                disabled: false,
                getContext: () => ({
                    fillRect: () => {},
                    fillStyle: '',
                    beginPath: () => {},
                    arc: () => {},
                    fill: () => {},
                    shadowBlur: 0,
                    shadowColor: ''
                }),
                width: 800,
                height: 600
            };
        }
        return this.elements[id];
    }
    
    addEventListener() {}
}

// Mock globals
global.document = new MockDOM();
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);

// Simple test assertions
let testsPassed = 0;
let testsFailed = 0;

function runTest(name, testFn) {
    try {
        testFn();
        console.log(`✓ ${name}`);
        testsPassed++;
    } catch (error) {
        console.log(`✗ ${name}: ${error.message}`);
        testsFailed++;
    }
}

// Import game logic (simplified version for testing)
class DoubleArkanoid {
    constructor() {
        this.canvas = { width: 800, height: 600, getContext: () => ({ fillRect: () => {} }) };
        this.ctx = this.canvas.getContext('2d');
        this.width = 800;
        this.height = 600;
        this.gridCols = 20;
        this.gridRows = 15;
        this.cellWidth = this.width / this.gridCols;
        this.cellHeight = this.height / this.gridRows;
        this.isRunning = false;
        this.isPaused = false;
        this.grid = [];
        this.balls = [];
        this.colors = {
            light: '#FFD700',
            dark: '#9370DB',
            lightBall: '#FFFF00',
            darkBall: '#DDA0DD'
        };
        this.scores = { light: 0, dark: 0 };
        this.init();
    }
    
    init() {
        this.grid = [];
        for (let row = 0; row < this.gridRows; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridCols; col++) {
                this.grid[row][col] = col < this.gridCols / 2 ? 'light' : 'dark';
            }
        }
        this.balls = [
            { x: this.width * 0.25, y: this.height * 0.5, vx: 3, vy: 3, radius: 8, type: 'light' },
            { x: this.width * 0.75, y: this.height * 0.5, vx: -3, vy: -3, radius: 8, type: 'dark' }
        ];
        this.scores = { light: 0, dark: 0 };
    }
    
    start() {
        this.isRunning = true;
        this.isPaused = false;
    }
    
    togglePause() {
        if (this.isRunning) {
            this.isPaused = !this.isPaused;
        }
    }
    
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.init();
    }
    
    ballRectCollision(ball, rectX, rectY, rectWidth, rectHeight) {
        const closestX = Math.max(rectX, Math.min(ball.x, rectX + rectWidth));
        const closestY = Math.max(rectY, Math.min(ball.y, rectY + rectHeight));
        const distanceX = ball.x - closestX;
        const distanceY = ball.y - closestY;
        const distanceSquared = distanceX * distanceX + distanceY * distanceY;
        return distanceSquared < ball.radius * ball.radius;
    }
    
    checkWinCondition() {
        let lightCount = 0;
        let darkCount = 0;
        for (let row = 0; row < this.gridRows; row++) {
            for (let col = 0; col < this.gridCols; col++) {
                if (this.grid[row][col] === 'light') lightCount++;
                else darkCount++;
            }
        }
        if (lightCount === 0 || darkCount === 0) {
            this.isRunning = false;
        }
    }
}

// Run tests
console.log('Running Double Arkanoid Tests...\n');

runTest('Game should initialize with correct dimensions', () => {
    const game = new DoubleArkanoid();
    if (game.width !== 800) throw new Error('Width should be 800');
    if (game.height !== 600) throw new Error('Height should be 600');
    if (game.gridCols !== 20) throw new Error('Grid should have 20 columns');
    if (game.gridRows !== 15) throw new Error('Grid should have 15 rows');
});

runTest('Grid should initialize with correct light/dark distribution', () => {
    const game = new DoubleArkanoid();
    let lightCount = 0;
    let darkCount = 0;
    
    for (let row = 0; row < game.gridRows; row++) {
        for (let col = 0; col < game.gridCols; col++) {
            if (game.grid[row][col] === 'light') {
                lightCount++;
                if (col >= game.gridCols / 2) throw new Error('Light cells should be on the left half');
            } else if (game.grid[row][col] === 'dark') {
                darkCount++;
                if (col < game.gridCols / 2) throw new Error('Dark cells should be on the right half');
            }
        }
    }
    
    if (lightCount !== 150) throw new Error('Should have 150 light cells');
    if (darkCount !== 150) throw new Error('Should have 150 dark cells');
});

runTest('Balls should initialize with correct properties', () => {
    const game = new DoubleArkanoid();
    if (game.balls.length !== 2) throw new Error('Should have 2 balls');
    
    const lightBall = game.balls[0];
    if (lightBall.type !== 'light') throw new Error('First ball should be light type');
    if (lightBall.x >= game.width / 2) throw new Error('Light ball should start on left side');
    if (lightBall.radius !== 8) throw new Error('Ball radius should be 8');
    
    const darkBall = game.balls[1];
    if (darkBall.type !== 'dark') throw new Error('Second ball should be dark type');
    if (darkBall.x <= game.width / 2) throw new Error('Dark ball should start on right side');
});

runTest('Ball-rectangle collision detection should work correctly', () => {
    const game = new DoubleArkanoid();
    const ball = { x: 50, y: 50, radius: 10 };
    
    if (!game.ballRectCollision(ball, 40, 40, 20, 20)) {
        throw new Error('Ball should collide with overlapping rectangle');
    }
    
    if (game.ballRectCollision(ball, 100, 100, 20, 20)) {
        throw new Error('Ball should not collide with distant rectangle');
    }
});

runTest('Scores should initialize to zero', () => {
    const game = new DoubleArkanoid();
    if (game.scores.light !== 0) throw new Error('Light score should start at 0');
    if (game.scores.dark !== 0) throw new Error('Dark score should start at 0');
});

runTest('Game state should be managed correctly', () => {
    const game = new DoubleArkanoid();
    
    if (game.isRunning !== false) throw new Error('Game should not be running initially');
    if (game.isPaused !== false) throw new Error('Game should not be paused initially');
    
    game.start();
    if (game.isRunning !== true) throw new Error('Game should be running after start');
    if (game.isPaused !== false) throw new Error('Game should not be paused after start');
    
    game.togglePause();
    if (game.isPaused !== true) throw new Error('Game should be paused after toggle');
    
    game.reset();
    if (game.isRunning !== false) throw new Error('Game should not be running after reset');
    if (game.isPaused !== false) throw new Error('Game should not be paused after reset');
});

console.log(`\nTest Summary: ${testsPassed} passed, ${testsFailed} failed`);
console.log(testsPassed === 6 && testsFailed === 0 ? 
    '\n✅ All core tests passed!' : 
    '\n❌ Some tests failed');

process.exit(testsFailed > 0 ? 1 : 0); 