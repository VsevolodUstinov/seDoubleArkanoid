class DoubleArkanoid {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Speed multiplier
        this.speedMultiplier = 1;
        
        // Setup canvas with responsive sizing
        this.setupCanvas();
        
        // Grid settings
        this.gridCols = 20;
        this.gridRows = 15;
        this.cellWidth = this.width / this.gridCols;
        this.cellHeight = this.height / this.gridRows;
        
        // Game state
        this.isRunning = true;  // Auto-start
        this.isPaused = false;
        this.grid = [];
        this.balls = [];
        
        // Colors - balls are now opposite colors
        this.colors = {
            light: '#FFD700',
            dark: '#9370DB',
            lightBall: '#9370DB',  // Dark purple for light ball
            darkBall: '#FFD700'    // Gold for dark ball
        };
        
        // Scores
        this.scores = {
            light: 0,
            dark: 0
        };
        
        // Initialize
        this.init();
        this.setupEventListeners();
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Start game loop immediately
        this.gameLoop();
    }
    
    setupCanvas() {
        // Fixed size for desktop, responsive for mobile
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            const container = document.querySelector('.canvas-container');
            const maxWidth = window.innerWidth - 50;
            const maxHeight = window.innerHeight - 250;
            
            const aspectRatio = 4 / 3;
            
            if (maxWidth / aspectRatio <= maxHeight) {
                this.width = maxWidth;
                this.height = this.width / aspectRatio;
            } else {
                this.height = maxHeight;
                this.width = this.height * aspectRatio;
            }
        } else {
            // Desktop sizing - fit within viewport
            const maxHeight = window.innerHeight - 280; // Leave room for header, scores, padding
            const maxWidth = Math.min(800, window.innerWidth - 100);
            const aspectRatio = 4 / 3;
            
            // Calculate size that fits within viewport while maintaining aspect ratio
            if (maxWidth / aspectRatio <= maxHeight) {
                this.width = maxWidth;
                this.height = this.width / aspectRatio;
            } else {
                this.height = maxHeight;
                this.width = this.height * aspectRatio;
            }
            
            // Cap maximum size for very large screens
            if (this.width > 720) {
                this.width = 720;
                this.height = 540;
            }
        }
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Set CSS size for proper display
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
    }
    
    handleResize() {
        const oldWidth = this.width;
        const oldHeight = this.height;
        
        this.setupCanvas();
        this.cellWidth = this.width / this.gridCols;
        this.cellHeight = this.height / this.gridRows;
        
        // Adjust ball positions proportionally
        if (this.balls.length > 0) {
            this.balls.forEach(ball => {
                ball.x = (ball.x / oldWidth) * this.width;
                ball.y = (ball.y / oldHeight) * this.height;
                ball.radius = Math.min(this.width, this.height) / 75;
            });
        }
        
        this.draw();
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
        
        // Initialize balls with base velocities
        const baseSpeed = Math.min(this.width, this.height) / 200; // Scale speed with canvas size
        
        this.balls = [
            {
                x: this.width * 0.25,
                y: this.height * 0.5,
                vx: baseSpeed * (0.8 + Math.random() * 0.4),
                vy: baseSpeed * (0.8 + Math.random() * 0.4),
                radius: Math.min(this.width, this.height) / 75, // Scale radius with canvas
                type: 'light'
            },
            {
                x: this.width * 0.75,
                y: this.height * 0.5,
                vx: -baseSpeed * (0.8 + Math.random() * 0.4),
                vy: -baseSpeed * (0.8 + Math.random() * 0.4),
                radius: Math.min(this.width, this.height) / 75,
                type: 'dark'
            }
        ];
        
        // Reset scores
        this.scores.light = 0;
        this.scores.dark = 0;
        this.updateScores();
    }
    
    setupEventListeners() {
        // Speed control buttons
        const speedButtons = document.querySelectorAll('.speed-btn');
        speedButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                speedButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.speedMultiplier = parseFloat(e.target.dataset.speed);
            });
        });
    }
    
    gameLoop() {
        if (!this.isRunning || this.isPaused) return;
        
        // Apply speed multiplier by running update multiple times
        for (let i = 0; i < this.speedMultiplier; i++) {
            this.update();
        }
        
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
        
        // Draw the entire grid without any gaps
        for (let row = 0; row < this.gridRows; row++) {
            for (let col = 0; col < this.gridCols; col++) {
                const x = col * this.cellWidth;
                const y = row * this.cellHeight;
                
                this.ctx.fillStyle = this.colors[this.grid[row][col]];
                // Draw slightly larger rectangles to prevent gaps
                this.ctx.fillRect(
                    Math.floor(x), 
                    Math.floor(y), 
                    Math.ceil(this.cellWidth) + 1, 
                    Math.ceil(this.cellHeight) + 1
                );
            }
        }
        
        // Draw balls with enhanced glow
        this.balls.forEach(ball => {
            // Outer glow
            this.ctx.shadowBlur = 30;
            this.ctx.shadowColor = this.colors[ball.type + 'Ball'];
            
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = this.colors[ball.type + 'Ball'];
            this.ctx.fill();
            
            // Inner core with white highlight
            this.ctx.shadowBlur = 0;
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius * 0.7, 0, Math.PI * 2);
            const gradient = this.ctx.createRadialGradient(
                ball.x - ball.radius * 0.3, 
                ball.y - ball.radius * 0.3, 
                0,
                ball.x, 
                ball.y, 
                ball.radius
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(0.5, this.colors[ball.type + 'Ball']);
            gradient.addColorStop(1, this.colors[ball.type + 'Ball']);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
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
            const winner = lightCount === 0 ? 'Dark' : 'Light';
            // Just restart the game after a brief pause
            setTimeout(() => {
                this.init();
            }, 2000);
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new DoubleArkanoid();
}); 