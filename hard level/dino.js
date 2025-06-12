
    
        document.addEventListener('DOMContentLoaded', () => {
            const canvas = document.getElementById('game-canvas');
            const ctx = canvas.getContext('2d');
            const scoreElement = document.getElementById('score');
            const finalScoreElement = document.getElementById('final-score');
            const gameOverElement = document.getElementById('game-over');
            const startScreenElement = document.getElementById('start-screen');
            const startBtn = document.getElementById('start-btn');
            const restartBtn = document.getElementById('restart-btn');
            
            // Set canvas size
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // Game variables - EXTREME MODE SETTINGS
            let gameSpeed = 15; // Extremely fast initial speed
            let score = 0;
            let highScore = 0;
            let gameRunning = false;
            let frameCount = 0;
            let obstacles = [];
            let clouds = [];
            let stars = [];
            let groundHeight = 50;
            let groundY = canvas.height - groundHeight;
            
            // Dino variables - EXTREME MODE SETTINGS
            const dino = {
                x: 50,
                y: groundY,
                width: 60,
                height: 80,
                vy: 0,
                gravity: 1.5, // Very strong gravity
                jumpForce: -25, // Reduced jump power
                isJumping: false,
                frame: 0,
                frameCount: 0,
                runCycle: [0, 1, 2, 1] // Animation frames for running
            };
            
            // Dino sprites (simplified representation)
            function drawDinoFrame(frame) {
                ctx.fillStyle = 'green';
                
                // Base body
                ctx.fillRect(dino.x, dino.y - dino.height, dino.width, dino.height);
                
                // Legs animation
                const legWidth = 15;
                const legHeight = 25;
                
                if (frame === 0) {
                    // Frame 1 - right leg forward
                    ctx.fillRect(dino.x + 10, dino.y - legHeight, legWidth, legHeight);
                    ctx.fillRect(dino.x + 35, dino.y - legHeight + 10, legWidth, legHeight - 10);
                } else if (frame === 1) {
                    // Frame 2 - neutral
                    ctx.fillRect(dino.x + 10, dino.y - legHeight + 5, legWidth, legHeight - 5);
                    ctx.fillRect(dino.x + 35, dino.y - legHeight + 5, legWidth, legHeight - 5);
                } else if (frame === 2) {
                    // Frame 3 - left leg forward
                    ctx.fillRect(dino.x + 10, dino.y - legHeight + 10, legWidth, legHeight - 10);
                    ctx.fillRect(dino.x + 35, dino.y - legHeight, legWidth, legHeight);
                }
                
                // Eye when jumping
                if (dino.isJumping) {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(dino.x + 40, dino.y - dino.height + 20, 10, 10);
                }
            }
            
            // Initialize stars for background
            function initStars() {
                stars = [];
                for (let i = 0; i < 100; i++) {
                    stars.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * (canvas.height - groundHeight),
                        size: Math.random() * 2 + 1,
                        speed: Math.random() * 2 + 1 // Very fast stars
                    });
                }
            }
            
            // Initialize clouds
            function initClouds() {
                clouds = [];
                for (let i = 0; i < 5; i++) {
                    clouds.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * (canvas.height / 3),
                        width: Math.random() * 100 + 50,
                        height: Math.random() * 30 + 20,
                        speed: Math.random() * 5 + 3 // Very fast clouds
                    });
                }
            }
            
            // Draw stars
            function drawStars() {
                ctx.fillStyle = 'white';
                stars.forEach(star => {
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Move stars
                    star.x -= star.speed;
                    if (star.x < -star.size) {
                        star.x = canvas.width + star.size;
                        star.y = Math.random() * (canvas.height - groundHeight);
                    }
                });
            }
            
            // Draw clouds
            function drawClouds() {
                ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
                clouds.forEach(cloud => {
                    ctx.beginPath();
                    ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Move clouds
                    cloud.x -= cloud.speed;
                    if (cloud.x < -cloud.width) {
                        cloud.x = canvas.width + cloud.width;
                        cloud.y = Math.random() * (canvas.height / 3);
                    }
                });
            }
            
            // Draw ground
            function drawGround() {
                ctx.fillStyle = '#333';
                ctx.fillRect(0, groundY, canvas.width, groundHeight);
                
                // Draw ground details
                ctx.fillStyle = '#444';
                for (let x = 0; x < canvas.width; x += 40) {
                    ctx.fillRect(x, groundY, 20, 5);
                }
            }
            
            // Draw dino
            function drawDino() {
                // Update animation frame
                if (!dino.isJumping) {
                    dino.frameCount++;
                    if (dino.frameCount > 2) { // Very fast animation
                        dino.frame = (dino.frame + 1) % dino.runCycle.length;
                        dino.frameCount = 0;
                    }
                }
                
                drawDinoFrame(dino.runCycle[dino.frame]);
            }
            
            // Update dino position
            function updateDino() {
                // Apply gravity
                dino.vy += dino.gravity;
                dino.y += dino.vy;
                
                // Keep dino on ground
                if (dino.y > groundY) {
                    dino.y = groundY;
                    dino.vy = 0;
                    dino.isJumping = false;
                }
            }
            
            // Create obstacles
            function createObstacle() {
                const types = [
                    { width: 30, height: 60 }, // Cactus
                    { width: 50, height: 50 },  // Wide cactus
                    { width: 20, height: 40 },  // Small cactus
                    { width: 60, height: 30 },  // Low obstacle
                    { width: 30, height: 80 },  // Tall cactus
                    { width: 70, height: 40 }   // Wide low obstacle
                ];
                
                const type = types[Math.floor(Math.random() * types.length)];
                obstacles.push({
                    x: canvas.width,
                    y: groundY - type.height,
                    width: type.width,
                    height: type.height,
                    passed: false
                });
            }
            
            // Draw obstacles
            function drawObstacles() {
                ctx.fillStyle = '#666';
                obstacles.forEach(obstacle => {
                    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                });
            }
            
            // Update obstacles
            function updateObstacles() {
                // Move obstacles
                obstacles.forEach(obstacle => {
                    obstacle.x -= gameSpeed;
                    
                    // Check if obstacle passed by dino
                    if (!obstacle.passed && obstacle.x + obstacle.width < dino.x) {
                        obstacle.passed = true;
                        score++;
                        scoreElement.textContent = score;
                    }
                });
                
                // Remove off-screen obstacles
                obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
                
                // Very frequent obstacle generation
                if (frameCount % Math.floor(40 / (gameSpeed / 5)) === 0) {
                    if (Math.random() < 0.10) { // Very high chance (10%)
                        createObstacle();
                    }
                }
            }
            
            // Check collisions
            function checkCollisions() {
                const dinoRect = {
                    x: dino.x + 5,  // Reduced hitbox margin
                    y: dino.y - dino.height + 5,
                    width: dino.width - 10,
                    height: dino.height - 10
                };
                
                for (const obstacle of obstacles) {
                    const obstacleRect = {
                        x: obstacle.x + 2,
                        y: obstacle.y + 2,
                        width: obstacle.width - 4,
                        height: obstacle.height - 4
                    };
                    
                    if (
                        dinoRect.x < obstacleRect.x + obstacleRect.width &&
                        dinoRect.x + dinoRect.width > obstacleRect.x &&
                        dinoRect.y < obstacleRect.y + obstacleRect.height &&
                        dinoRect.y + dinoRect.height > obstacleRect.y
                    ) {
                        gameOver();
                        return;
                    }
                }
            }
            
            // Game over
            function gameOver() {
                gameRunning = false;
                finalScoreElement.textContent = `Score: ${score}`;
                gameOverElement.style.display = 'block';
                startScreenElement.style.display = 'none';
                
                if (score > highScore) {
                    highScore = score;
                }
            }
            
            // Start game
            function startGame() {
                gameRunning = true;
                score = 0;
                gameSpeed = 15; // Reset to extremely fast initial speed
                frameCount = 0;
                obstacles = [];
                dino.y = groundY;
                dino.vy = 0;
                dino.isJumping = false;
                dino.frame = 0;
                dino.frameCount = 0;
                scoreElement.textContent = '0';
                gameOverElement.style.display = 'none';
                startScreenElement.style.display = 'none';
                
                initStars();
                initClouds();
                
                // Start game loop
                requestAnimationFrame(gameLoop);
            }
            
            // Game loop
            function gameLoop() {
                if (!gameRunning) return;
                
                frameCount++;
                
                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Draw background elements
                drawStars();
                drawClouds();
                drawGround();
                
                // Update and draw game elements
                updateDino();
                drawDino();
                updateObstacles();
                drawObstacles();
                
                // Check for collisions
                checkCollisions();
                
                // Extreme speed progression
                if (frameCount % 100 === 0) { // Frequent speed increases
                    gameSpeed += 1.5; // Large speed increments
                }
                
                // Continue game loop
                requestAnimationFrame(gameLoop);
            }
            
            // Event listeners
            document.addEventListener('keydown', (e) => {
                if (!gameRunning && (e.code === 'Space' || e.key === ' ')) {
                    startGame();
                    return;
                }
                
                if ((e.code === 'Space' || e.key === ' ') && !dino.isJumping && gameRunning) {
                    dino.vy = dino.jumpForce;
                    dino.isJumping = true;
                    e.preventDefault();
                }
            });
            
            startBtn.addEventListener('click', startGame);
            restartBtn.addEventListener('click', startGame);
            
            // Handle window resize
            window.addEventListener('resize', () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                groundY = canvas.height - groundHeight;
                dino.y = groundY;
            });
            
            // Initialize game
            initStars();
            initClouds();
            
            // Show start screen
            startScreenElement.style.display = 'block';
            gameOverElement.style.display = 'none';
        });
    