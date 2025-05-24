class DoubleArkanoid {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game dimensions
        this.width = 800;
        this.height = 600;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Grid settings
        this.gridCols = 20;
        this.gridRows = 15;
        this.cellWidth = this.width / this.gridCols;
        this.cellHeight = this.height / this.gridRows;
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.grid = [];
        this.balls = [];
        
        // Colors
        this.colors = {
            light: '#FFD700',
            dark: '#9370DB',
            lightBall: '#FFFF00',
            darkBall: '#DDA0DD'
        };
        
        // Scores
        this.scores = {
            light: 0,
            dark: 0
        };
        
        // Initialize
        this.init();
        this.setupEventListeners();
    }
    
    init() {
        // Initialize grid
        this.grid = [];
        for (let row = 0; row < this.gridRows; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridCols; col++) {
                // Left half is light, right half is dark
                this.grid[row][col] = col < this.gridCols / 2 ? 'light' : 'dark';
            }
        }
        
        // Initialize balls
        this.balls = [
            {
                x: this.width * 0.25,
                y: this.height * 0.5,
                vx: 3 + Math.random() * 2,
                vy: 3 + Math.random() * 2,
                radius: 8,
                type: 'light'
            },
            {
                x: this.width * 0.75,
                y: this.height * 0.5,
                vx: -(3 + Math.random() * 2),
                vy: -(3 + Math.random() * 2),
                radius: 8,
                type: 'dark'
            }
        ];
        
        // Reset scores
        this.scores.light = 0;
        this.scores.dark = 0;
        this.updateScores();
    }
    
    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            document.getElementById('startBtn').disabled = true;
            document.getElementById('pauseBtn').disabled = false;
            document.getElementById('statusMessage').textContent = 'Game in progress...';
            this.gameLoop();
        }
    }
    
    togglePause() {
        if (this.isRunning) {
            this.isPaused = !this.isPaused;
            document.getElementById('pauseBtn').textContent = this.isPaused ? 'Resume' : 'Pause';
            document.getElementById('statusMessage').textContent = this.isPaused ? 'Game paused' : 'Game in progress...';
            
            if (!this.isPaused) {
                this.gameLoop();
            }
        }
    }
    
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.init();
        this.draw();
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('pauseBtn').textContent = 'Pause';
        document.getElementById('statusMessage').textContent = 'Press Start to begin';
    }
    
    gameLoop() {
        if (!this.isRunning || this.isPaused) return;
        
        this.update();
        this.draw();
        this.checkWinCondition();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // Update each ball
        this.balls.forEach(ball => {
            // Update position
            ball.x += ball.vx;
            ball.y += ball.vy;
            
            // Check wall collisions
            if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= this.width) {
                ball.vx = -ball.vx;
                ball.x = Math.max(ball.radius, Math.min(this.width - ball.radius, ball.x));
            }
            
            if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= this.height) {
                ball.vy = -ball.vy;
                ball.y = Math.max(ball.radius, Math.min(this.height - ball.radius, ball.y));
            }
            
            // Check brick collisions
            this.checkBrickCollisions(ball);
        });
    }
    
    checkBrickCollisions(ball) {
        // Get the grid cell the ball is in
        const col = Math.floor(ball.x / this.cellWidth);
        const row = Math.floor(ball.y / this.cellHeight);
        
        // Check surrounding cells for collision
        for (let r = Math.max(0, row - 1); r <= Math.min(this.gridRows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(this.gridCols - 1, col + 1); c++) {
                if (this.grid[r][c] !== ball.type) {
                    // Check if ball is colliding with this cell
                    const cellX = c * this.cellWidth;
                    const cellY = r * this.cellHeight;
                    
                    if (this.ballRectCollision(ball, cellX, cellY, this.cellWidth, this.cellHeight)) {
                        // Convert the brick
                        this.grid[r][c] = ball.type;
                        
                        // Update score
                        this.scores[ball.type]++;
                        this.updateScores();
                        
                        // Calculate bounce direction
                        const cellCenterX = cellX + this.cellWidth / 2;
                        const cellCenterY = cellY + this.cellHeight / 2;
                        
                        // Simple bounce calculation
                        const dx = ball.x - cellCenterX;
                        const dy = ball.y - cellCenterY;
                        
                        if (Math.abs(dx) > Math.abs(dy)) {
                            ball.vx = -ball.vx;
                        } else {
                            ball.vy = -ball.vy;
                        }
                        
                        // Move ball out of collision
                        ball.x += ball.vx * 2;
                        ball.y += ball.vy * 2;
                        
                        return; // Only handle one collision per frame
                    }
                }
            }
        }
    }
    
    ballRectCollision(ball, rectX, rectY, rectWidth, rectHeight) {
        // Find closest point on rectangle to ball center
        const closestX = Math.max(rectX, Math.min(ball.x, rectX + rectWidth));
        const closestY = Math.max(rectY, Math.min(ball.y, rectY + rectHeight));
        
        // Calculate distance between ball center and closest point
        const distanceX = ball.x - closestX;
        const distanceY = ball.y - closestY;
        const distanceSquared = distanceX * distanceX + distanceY * distanceY;
        
        return distanceSquared < ball.radius * ball.radius;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw grid
        for (let row = 0; row < this.gridRows; row++) {
            for (let col = 0; col < this.gridCols; col++) {
                const x = col * this.cellWidth;
                const y = row * this.cellHeight;
                
                this.ctx.fillStyle = this.colors[this.grid[row][col]];
                this.ctx.fillRect(x, y, this.cellWidth - 1, this.cellHeight - 1);
            }
        }
        
        // Draw balls
        this.balls.forEach(ball => {
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = this.colors[ball.type + 'Ball'];
            this.ctx.fill();
            
            // Add glow effect
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = this.colors[ball.type + 'Ball'];
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
    }
    
    updateScores() {
        document.getElementById('lightScore').textContent = this.scores.light;
        document.getElementById('darkScore').textContent = this.scores.dark;
    }
    
    checkWinCondition() {
        let lightCount = 0;
        let darkCount = 0;
        
        for (let row = 0; row < this.gridRows; row++) {
            for (let col = 0; col < this.gridCols; col++) {
                if (this.grid[row][col] === 'light') {
                    lightCount++;
                } else {
                    darkCount++;
                }
            }
        }
        
        if (lightCount === 0 || darkCount === 0) {
            this.isRunning = false;
            const winner = lightCount === 0 ? 'Dark' : 'Light';
            document.getElementById('statusMessage').textContent = `${winner} wins! All bricks converted!`;
            document.getElementById('startBtn').disabled = false;
            document.getElementById('pauseBtn').disabled = true;
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new DoubleArkanoid();
    game.draw();
}); 