const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const speedElement = document.getElementById('speed');
const statusElement = document.getElementById('status');

// Nokia 3310 colors
const COLORS = {
    bg: '#8bac0f',
    dark: '#0d1a00',
    light: '#9bbc0f'
};

// Game settings
const GRID_SIZE = 8;
const TILE_COUNT_X = 35;
const TILE_COUNT_Y = 25;

// Game state
let snake = [{ x: 17, y: 12 }];
let food = { x: 25, y: 12, spawnTime: Date.now() };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop = null;
let gameSpeed = 150;
let speedLevel = 1;
let isGameRunning = false;
let isPaused = false;

highScoreElement.textContent = highScore;
speedElement.textContent = speedLevel;

// Draw pixel (Nokia style block)
function drawPixel(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1);
}

// Draw apple with stem and leaf
function drawApple(x, y, scale = 1) {
    const px = x * GRID_SIZE;
    const py = y * GRID_SIZE;
    const center = GRID_SIZE / 2;
    const offset = (GRID_SIZE * (1 - scale)) / 2;
    
    ctx.fillStyle = COLORS.dark;
    
    // Apple body (circle approximation with pixels)
    const applePixels = [
        [1, 0], [2, 0], [3, 0], [4, 0],
        [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1],
        [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2],
        [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3],
        [1, 4], [2, 4], [3, 4], [4, 4],
        [2, 5], [3, 5]
    ];
    
    applePixels.forEach(([dx, dy]) => {
        ctx.fillRect(
            px + offset + dx * scale, 
            py + offset + dy * scale, 
            scale, 
            scale
        );
    });
    
    // Stem
    ctx.fillRect(px + offset + 2.5 * scale, py + offset - 1 * scale, scale, scale);
    
    // Leaf
    ctx.fillRect(px + offset + 3.5 * scale, py + offset - 1 * scale, scale, scale);
    ctx.fillRect(px + offset + 4.5 * scale, py + offset - 0.5 * scale, scale, scale);
}

// Draw food with spawn animation
function drawFood() {
    const timeSinceSpawn = Date.now() - food.spawnTime;
    const animationDuration = 500; // ms
    
    if (timeSinceSpawn < animationDuration) {
        // Pulsing scale animation
        const progress = timeSinceSpawn / animationDuration;
        const scale = 0.5 + 0.5 * Math.sin(progress * Math.PI * 2);
        drawApple(food.x, food.y, Math.max(0.3, scale));
    } else {
        // Normal apple
        drawApple(food.x, food.y, 1);
    }
}

// Draw snake with eyes on the head
function drawSnake() {
    snake.forEach((segment, index) => {
        drawPixel(segment.x, segment.y, COLORS.dark);
        
        // Add a small dot in the middle of each segment for detail
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(
            segment.x * GRID_SIZE + 2, 
            segment.y * GRID_SIZE + 2, 
            GRID_SIZE - 5, 
            GRID_SIZE - 5
        );
        
        // Draw eyes on the head (first segment)
        if (index === 0) {
            ctx.fillStyle = COLORS.dark;
            
            // Eye positions based on direction
            let leftEye, rightEye;
            const px = segment.x * GRID_SIZE;
            const py = segment.y * GRID_SIZE;
            
            if (direction.x === 1) { // Moving right
                leftEye = { x: px + 5, y: py + 2 };
                rightEye = { x: px + 5, y: py + 5 };
            } else if (direction.x === -1) { // Moving left
                leftEye = { x: px + 1, y: py + 2 };
                rightEye = { x: px + 1, y: py + 5 };
            } else if (direction.y === -1) { // Moving up
                leftEye = { x: px + 2, y: py + 1 };
                rightEye = { x: px + 5, y: py + 1 };
            } else { // Moving down
                leftEye = { x: px + 2, y: py + 5 };
                rightEye = { x: px + 5, y: py + 5 };
            }
            
            // Draw eyes (2x2 pixels each)
            ctx.fillRect(leftEye.x, leftEye.y, 2, 2);
            ctx.fillRect(rightEye.x, rightEye.y, 2, 2);
        }
    });
}

// Draw the game
function draw() {
    // Clear screen
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = COLORS.dark;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw snake with eyes
    drawSnake();

    // Draw food (animated apple)
    drawFood();
}

// Spawn food at random location
function spawnFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * TILE_COUNT_X),
            y: Math.floor(Math.random() * TILE_COUNT_Y)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    food = { ...newFood, spawnTime: Date.now() };
}

// Update game state
function update() {
    direction = nextDirection;

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Check wall collision
    if (head.x < 0 || head.x >= TILE_COUNT_X || head.y < 0 || head.y >= TILE_COUNT_Y) {
        gameOver();
        return;
    }

    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        spawnFood();
        // Increase speed slightly
        if (gameSpeed > 60) {
            gameSpeed -= 2;
            speedLevel++;
            speedElement.textContent = speedLevel;
            clearInterval(gameLoop);
            gameLoop = setInterval(gameStep, gameSpeed);
        }
    } else {
        snake.pop();
    }
}

function gameStep() {
    if (!isPaused) {
        update();
        draw();
    }
}

function startGame() {
    if (isGameRunning) {
        togglePause();
        return;
    }

    // Reset game state
    snake = [{ x: 17, y: 12 }];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    scoreElement.textContent = score;
    gameSpeed = 150;
    speedLevel = 1;
    speedElement.textContent = speedLevel;
    isGameRunning = true;
    isPaused = false;
    statusElement.textContent = '';
    
    spawnFood();
    draw();
    
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(gameStep, gameSpeed);
}

function togglePause() {
    if (!isGameRunning) return;
    isPaused = !isPaused;
    statusElement.textContent = isPaused ? 'PAUSED' : '';
}

function gameOver() {
    isGameRunning = false;
    clearInterval(gameLoop);
    statusElement.textContent = 'GAME OVER - Press OK';
    
    // Flash effect
    let flash = 0;
    const flashInterval = setInterval(() => {
        if (flash % 2 === 0) {
            ctx.fillStyle = COLORS.dark;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            draw();
        }
        flash++;
        if (flash >= 6) {
            clearInterval(flashInterval);
            draw();
        }
    }, 150);
}

// Direction change (prevent 180 degree turns)
function setDirection(x, y) {
    if (!isGameRunning || isPaused) return;
    
    // Prevent going directly opposite
    if ((x !== 0 && x === -direction.x) || (y !== 0 && y === -direction.y)) {
        return;
    }
    nextDirection = { x, y };
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            e.preventDefault();
            setDirection(0, -1);
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            e.preventDefault();
            setDirection(0, 1);
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            e.preventDefault();
            setDirection(-1, 0);
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            e.preventDefault();
            setDirection(1, 0);
            break;
        case ' ':
        case 'Enter':
            e.preventDefault();
            startGame();
            break;
    }
});

// Button controls
document.getElementById('btnUp').addEventListener('click', () => setDirection(0, -1));
document.getElementById('btnDown').addEventListener('click', () => setDirection(0, 1));
document.getElementById('btnLeft').addEventListener('click', () => setDirection(-1, 0));
document.getElementById('btnRight').addEventListener('click', () => setDirection(1, 0));
document.getElementById('btnCenter').addEventListener('click', startGame);

// Initial draw
draw();
