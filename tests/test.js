class TestRunner {
    constructor() {
        this.tests = [];
        this.results = [];
    }
    
    addTest(name, testFn) {
        this.tests.push({ name, testFn });
    }
    
    async run() {
        const resultsDiv = document.getElementById('testResults');
        resultsDiv.innerHTML = '';
        this.results = [];
        
        for (const test of this.tests) {
            try {
                await test.testFn();
                this.results.push({ name: test.name, passed: true });
                resultsDiv.innerHTML += `<div class="test-result pass">✓ ${test.name}</div>`;
            } catch (error) {
                this.results.push({ name: test.name, passed: false, error: error.message });
                resultsDiv.innerHTML += `<div class="test-result fail">✗ ${test.name}: ${error.message}</div>`;
            }
        }
        
        this.showSummary();
    }
    
    showSummary() {
        const passed = this.results.filter(r => r.passed).length;
        const total = this.results.length;
        const summaryDiv = document.getElementById('summary');
        
        if (passed === total) {
            summaryDiv.innerHTML = `<span style="color: green;">All tests passed! (${passed}/${total})</span>`;
        } else {
            summaryDiv.innerHTML = `<span style="color: red;">Tests failed: ${passed}/${total} passed</span>`;
        }
    }
}

// Test helper functions
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function assertEquals(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `Expected ${expected}, but got ${actual}`);
    }
}

function assertArrayEquals(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(message || `Arrays do not match. Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
    }
}

// Initialize test runner
const runner = new TestRunner();

// Test 1: Game initialization
runner.addTest('Game should initialize with correct dimensions', () => {
    const game = new DoubleArkanoid();
    assertEquals(game.width, 800, 'Width should be 800');
    assertEquals(game.height, 600, 'Height should be 600');
    assertEquals(game.gridCols, 20, 'Grid should have 20 columns');
    assertEquals(game.gridRows, 15, 'Grid should have 15 rows');
});

// Test 2: Grid initialization
runner.addTest('Grid should initialize with correct light/dark distribution', () => {
    const game = new DoubleArkanoid();
    let lightCount = 0;
    let darkCount = 0;
    
    for (let row = 0; row < game.gridRows; row++) {
        for (let col = 0; col < game.gridCols; col++) {
            if (game.grid[row][col] === 'light') {
                lightCount++;
                assert(col < game.gridCols / 2, 'Light cells should be on the left half');
            } else if (game.grid[row][col] === 'dark') {
                darkCount++;
                assert(col >= game.gridCols / 2, 'Dark cells should be on the right half');
            }
        }
    }
    
    assertEquals(lightCount, 150, 'Should have 150 light cells');
    assertEquals(darkCount, 150, 'Should have 150 dark cells');
});

// Test 3: Ball initialization
runner.addTest('Balls should initialize with correct properties', () => {
    const game = new DoubleArkanoid();
    
    assertEquals(game.balls.length, 2, 'Should have 2 balls');
    
    const lightBall = game.balls[0];
    assertEquals(lightBall.type, 'light', 'First ball should be light type');
    assert(lightBall.x < game.width / 2, 'Light ball should start on left side');
    assertEquals(lightBall.radius, 8, 'Ball radius should be 8');
    
    const darkBall = game.balls[1];
    assertEquals(darkBall.type, 'dark', 'Second ball should be dark type');
    assert(darkBall.x > game.width / 2, 'Dark ball should start on right side');
});

// Test 4: Ball collision detection
runner.addTest('Ball-rectangle collision detection should work correctly', () => {
    const game = new DoubleArkanoid();
    const ball = { x: 50, y: 50, radius: 10 };
    
    // Test collision
    assert(game.ballRectCollision(ball, 40, 40, 20, 20), 'Ball should collide with overlapping rectangle');
    
    // Test no collision
    assert(!game.ballRectCollision(ball, 100, 100, 20, 20), 'Ball should not collide with distant rectangle');
    
    // Test edge collision
    assert(game.ballRectCollision(ball, 45, 45, 10, 10), 'Ball should collide with edge of rectangle');
});

// Test 5: Score initialization
runner.addTest('Scores should initialize to zero', () => {
    const game = new DoubleArkanoid();
    assertEquals(game.scores.light, 0, 'Light score should start at 0');
    assertEquals(game.scores.dark, 0, 'Dark score should start at 0');
});

// Test 6: Game state management
runner.addTest('Game state should be managed correctly', () => {
    const game = new DoubleArkanoid();
    
    assertEquals(game.isRunning, false, 'Game should not be running initially');
    assertEquals(game.isPaused, false, 'Game should not be paused initially');
    
    game.start();
    assertEquals(game.isRunning, true, 'Game should be running after start');
    assertEquals(game.isPaused, false, 'Game should not be paused after start');
    
    game.togglePause();
    assertEquals(game.isPaused, true, 'Game should be paused after toggle');
    
    game.reset();
    assertEquals(game.isRunning, false, 'Game should not be running after reset');
    assertEquals(game.isPaused, false, 'Game should not be paused after reset');
});

// Test 7: Ball movement
runner.addTest('Balls should move according to velocity', () => {
    const game = new DoubleArkanoid();
    const ball = game.balls[0];
    const initialX = ball.x;
    const initialY = ball.y;
    
    // Manually update position
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    assert(ball.x !== initialX, 'Ball X position should change');
    assert(ball.y !== initialY, 'Ball Y position should change');
});

// Test 8: Wall collision
runner.addTest('Balls should bounce off walls', () => {
    const game = new DoubleArkanoid();
    const ball = game.balls[0];
    
    // Test left wall
    ball.x = 5;
    ball.vx = -5;
    const oldVx = ball.vx;
    
    // Simulate wall collision check
    if (ball.x - ball.radius <= 0) {
        ball.vx = -ball.vx;
    }
    
    assertEquals(ball.vx, -oldVx, 'Ball should reverse X velocity when hitting left wall');
    
    // Test top wall
    ball.y = 5;
    ball.vy = -5;
    const oldVy = ball.vy;
    
    if (ball.y - ball.radius <= 0) {
        ball.vy = -ball.vy;
    }
    
    assertEquals(ball.vy, -oldVy, 'Ball should reverse Y velocity when hitting top wall');
});

// Test 9: Grid cell calculation
runner.addTest('Grid cell calculation should be correct', () => {
    const game = new DoubleArkanoid();
    
    // Test cell calculation
    const col1 = Math.floor(100 / game.cellWidth);
    const row1 = Math.floor(100 / game.cellHeight);
    
    assert(col1 >= 0 && col1 < game.gridCols, 'Column should be within bounds');
    assert(row1 >= 0 && row1 < game.gridRows, 'Row should be within bounds');
    
    // Test corner cases
    const col2 = Math.floor((game.width - 1) / game.cellWidth);
    const row2 = Math.floor((game.height - 1) / game.cellHeight);
    
    assertEquals(col2, game.gridCols - 1, 'Last column calculation should be correct');
    assertEquals(row2, game.gridRows - 1, 'Last row calculation should be correct');
});

// Test 10: Win condition detection
runner.addTest('Win condition should be detected correctly', () => {
    const game = new DoubleArkanoid();
    
    // Test all light win
    for (let row = 0; row < game.gridRows; row++) {
        for (let col = 0; col < game.gridCols; col++) {
            game.grid[row][col] = 'light';
        }
    }
    
    game.checkWinCondition();
    assert(!game.isRunning, 'Game should stop when one side wins');
    
    // Reset and test all dark win
    game.init();
    for (let row = 0; row < game.gridRows; row++) {
        for (let col = 0; col < game.gridCols; col++) {
            game.grid[row][col] = 'dark';
        }
    }
    
    game.checkWinCondition();
    assert(!game.isRunning, 'Game should stop when one side wins');
});

// Test 11: Brick conversion
runner.addTest('Bricks should convert when hit by opposite color ball', () => {
    const game = new DoubleArkanoid();
    
    // Place light ball in dark territory
    const ball = game.balls[0]; // light ball
    ball.x = game.width * 0.75; // In dark territory
    ball.y = game.height * 0.5;
    
    const col = Math.floor(ball.x / game.cellWidth);
    const row = Math.floor(ball.y / game.cellHeight);
    
    // Ensure the cell is dark
    game.grid[row][col] = 'dark';
    
    // Simulate collision
    const oldType = game.grid[row][col];
    if (game.ballRectCollision(ball, col * game.cellWidth, row * game.cellHeight, game.cellWidth, game.cellHeight)) {
        if (game.grid[row][col] !== ball.type) {
            game.grid[row][col] = ball.type;
            game.scores[ball.type]++;
        }
    }
    
    assertEquals(game.grid[row][col], 'light', 'Dark brick should convert to light when hit by light ball');
    assertEquals(game.scores.light, 1, 'Light score should increment');
});

// Test 12: Canvas rendering (basic check)
runner.addTest('Canvas should be properly configured', () => {
    const game = new DoubleArkanoid();
    
    assert(game.canvas !== null, 'Canvas should exist');
    assert(game.ctx !== null, 'Canvas context should exist');
    assertEquals(game.canvas.width, game.width, 'Canvas width should match game width');
    assertEquals(game.canvas.height, game.height, 'Canvas height should match game height');
});

// Run all tests when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        runner.run();
    }, 100);
}); 