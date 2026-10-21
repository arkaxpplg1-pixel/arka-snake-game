// ==================== CANVAS & SETUP ====================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameArea = document.getElementById("gameArea");

const confettiCanvas = document.getElementById("confettiCanvas");
const confettiCtx = confettiCanvas.getContext("2d");

const GRID_SIZE = 20;
let FOOD_COUNT = 25;

let canvasWidth = 800;
let canvasHeight = 600;

let snake = [];
let foods = [];

let direction = "right";
let nextDirection = "right";

let score = 0;
let speed = 1;

let gameRunning = false;
let gameOver = false;
let lastMoveTime = 0;

let playerName = "PLAYER 1";
let currentMode = "default"; // default, fruit, christmas, sweety
let confettiParticles = [];

// ==================== TEMA / MODE WARNA & VISUAL (KONSISTEN & FUTURISTIK) ====================
const THEMES = {
    default: {
        bg: "#091222",
        bgEnd: "#101f35",
        grid: "rgba(89, 190, 235, 0.1)",
        accent: "#38bdf8",
        snakeScale: 1,
        snakeColors: ["#38bdf8", "#34d399", "#a78bfa", "#fb7185", "#fbbf24", "#22d3ee", "#c084fc"],
        confetti: ["#38bdf8", "#a5f3fc", "#818cf8", "#f8fafc"],
        foodTypes: ["circle", "square", "diamond"]
    },
    fruit: {
        bg: "#102318",
        bgEnd: "#1d3824",
        grid: "rgba(156, 204, 120, 0.13)",
        accent: "#86c96b",
        snakeScale: 1,
        snakeColors: ["#86c96b", "#fbbf24", "#fb7185", "#a3e635", "#f97316", "#34d399", "#e879f9"],
        confetti: ["#f87171", "#fbbf24", "#86c96b", "#fef3c7"],
        foodTypes: ["apple", "orange", "lemon"]
    },
    christmas: {
        bg: "#081a30",
        bgEnd: "#123452",
        grid: "rgba(151, 220, 255, 0.13)",
        accent: "#9be4ff",
        snakeScale: 1,
        snakeColors: ["#9be4ff", "#86efac", "#f8fafc", "#f87171", "#fde68a", "#67e8f9", "#c4b5fd"],
        confetti: ["#e0f7ff", "#9be4ff", "#ffffff", "#70c8ed"],
        foodTypes: ["gift", "star", "candy"]
    },
    sweety: {
        bg: "#241329",
        bgEnd: "#3c1d37",
        grid: "rgba(255, 154, 196, 0.12)",
        accent: "#ff8bb8",
        snakeScale: 1,
        snakeColors: ["#ff8bb8", "#c4b5fd", "#fda4af", "#fb7185", "#f9a8d4", "#fcd34d", "#a5b4fc"],
        confetti: ["#ff8bb8", "#ffc1dc", "#c4a1ff", "#fff1f6"],
        foodTypes: ["heart", "letter", "chocolate"]
    }
};

// ==================== RESPONSIVE CANVAS ====================
function resizeCanvas() {
    const rect = gameArea.getBoundingClientRect();
    canvasWidth = Math.floor(rect.width);
    canvasHeight = Math.floor(rect.height);
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    confettiCanvas.width = canvasWidth;
    confettiCanvas.height = canvasHeight;
}

// ==================== RANDOM GRID POSITION ====================
function randomGridPosition() {
    const columns = Math.floor(canvasWidth / GRID_SIZE);
    const rows = Math.floor(canvasHeight / GRID_SIZE);
    return {
        x: Math.floor(Math.random() * columns) * GRID_SIZE,
        y: Math.floor(Math.random() * rows) * GRID_SIZE
    };
}

function positionIsFree(x, y) {
    for (const part of snake) {
        if (part.x === x && part.y === y) return false;
    }
    for (const food of foods) {
        if (food.x === x && food.y === y) return false;
    }
    return true;
}

// ==================== CREATE SNAKE & FOODS ====================
function createSnake() {
    const centerX = Math.floor(canvasWidth / GRID_SIZE / 2) * GRID_SIZE;
    const centerY = Math.floor(canvasHeight / GRID_SIZE / 2) * GRID_SIZE;
    snake = [];
    for (let i = 0; i < 5; i++) {
        snake.push({ x: centerX - i * GRID_SIZE, y: centerY });
    }
    direction = "right";
    nextDirection = "right";
}

function createFoods() {
    foods = [];
    const theme = THEMES[currentMode];
    for (let i = 0; i < FOOD_COUNT; i++) {
        let position;
        do {
            position = randomGridPosition();
        } while (!positionIsFree(position.x, position.y));

        const randomType = theme.foodTypes[Math.floor(Math.random() * theme.foodTypes.length)];
        foods.push({
            x: position.x,
            y: position.y,
            type: randomType
        });
    }
}

// ==================== WARNA ULAR BERDASARKAN SKOR & TEMA ====================
function getSnakeColor() {
    const palette = THEMES[currentMode].snakeColors;
    const colorStage = Math.floor(score / 5);
    return palette[colorStage % palette.length];
}

// ==================== DRAWING SYSTEM ====================
function drawGrid() {
    const theme = THEMES[currentMode];
    const background = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    background.addColorStop(0, theme.bg);
    background.addColorStop(1, theme.bgEnd);
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.save();
    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 1;

    if (currentMode === "fruit") {
        for (let y = 0; y < canvasHeight; y += GRID_SIZE * 2) {
            for (let x = 0; x < canvasWidth; x += GRID_SIZE * 2) {
                if ((x / GRID_SIZE + y / GRID_SIZE) % 4 === 0) {
                    ctx.fillStyle = "rgba(166, 205, 115, 0.035)";
                    ctx.fillRect(x, y, GRID_SIZE * 2, GRID_SIZE * 2);
                }
            }
        }
        for (let x = 0; x <= canvasWidth; x += GRID_SIZE) {
            ctx.globalAlpha = x % (GRID_SIZE * 2) === 0 ? 1 : 0.45;
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvasHeight); ctx.stroke();
        }
        for (let y = 0; y <= canvasHeight; y += GRID_SIZE) {
            ctx.globalAlpha = y % (GRID_SIZE * 2) === 0 ? 1 : 0.45;
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasWidth, y); ctx.stroke();
        }

        ctx.fillStyle = "rgba(189, 224, 137, 0.3)";
        for (let i = 0; i < 12; i++) {
            const x = (i * 137 + 43) % canvasWidth;
            const y = (i * 89 + 31) % canvasHeight;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((i % 2 ? 1 : -1) * 0.55);
            ctx.beginPath();
            ctx.ellipse(0, 0, 5, 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    } else if (currentMode === "christmas") {
        for (let x = 0; x <= canvasWidth; x += GRID_SIZE) {
            ctx.globalAlpha = x % (GRID_SIZE * 2) === 0 ? 1 : 0.42;
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvasHeight); ctx.stroke();
        }
        for (let y = 0; y <= canvasHeight; y += GRID_SIZE) {
            ctx.globalAlpha = y % (GRID_SIZE * 2) === 0 ? 1 : 0.42;
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasWidth, y); ctx.stroke();
        }
        const drift = (performance.now() / 55) % (canvasHeight + 20);
        ctx.fillStyle = "rgba(224, 247, 255, 0.52)";
        for (let i = 0; i < 34; i++) {
            const x = (i * 83 + 19) % canvasWidth;
            const y = (i * 127 + drift) % canvasHeight;
            const radius = i % 5 === 0 ? 1.8 : 1;
            ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
        }
    } else if (currentMode === "sweety") {
        for (let x = 0; x <= canvasWidth; x += GRID_SIZE) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvasHeight); ctx.stroke();
        }
        for (let y = 0; y <= canvasHeight; y += GRID_SIZE) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasWidth, y); ctx.stroke();
        }
        ctx.fillStyle = "rgba(255, 179, 211, 0.14)";
        for (let i = 0; i < 9; i++) {
            const x = (i * 173 + 71) % canvasWidth;
            const y = (i * 113 + 49) % canvasHeight;
            drawHeart(x, y, 3 + (i % 3), 0.5);
        }
    } else {
        for (let x = 0; x <= canvasWidth; x += GRID_SIZE) {
            ctx.globalAlpha = x % (GRID_SIZE * 5) === 0 ? 1 : 0.55;
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvasHeight); ctx.stroke();
        }
        for (let y = 0; y <= canvasHeight; y += GRID_SIZE) {
            ctx.globalAlpha = y % (GRID_SIZE * 5) === 0 ? 1 : 0.55;
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasWidth, y); ctx.stroke();
        }
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = "rgba(165, 243, 252, 0.48)";
        for (let i = 0; i < 18; i++) {
            const x = (i * 131 + 37) % canvasWidth;
            const y = (i * 79 + 23) % canvasHeight;
            ctx.fillRect(x, y, 2, 2);
        }
    }

    ctx.restore();
}

function drawHeart(x, y, size, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.8);
    ctx.bezierCurveTo(x - size * 1.4, y, x - size, y - size, x, y - size * 0.25);
    ctx.bezierCurveTo(x + size, y - size, x + size * 1.4, y, x, y + size * 0.8);
    ctx.fill();
    ctx.restore();
}

function drawFood(food) {
    const cx = food.x + GRID_SIZE / 2;
    const cy = food.y + GRID_SIZE / 2;
    const r = GRID_SIZE * 0.42;

    ctx.save();
    
    // Multi-elemen rendering berdasarkan tema
    if (currentMode === "sweety") {
        if (food.type === "heart") {
            ctx.shadowColor = "#f43f5e"; ctx.shadowBlur = 10;
            ctx.fillStyle = "#fb7185";
            drawHeart(cx, cy, r * 0.78);
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.beginPath(); ctx.arc(cx - 3, cy - 3, 1.3, 0, Math.PI * 2); ctx.fill();
        } else if (food.type === "letter") {
            ctx.shadowColor = "#fb7185"; ctx.shadowBlur = 10;
            ctx.fillStyle = "#fda4af";
            ctx.fillRect(food.x + 3, food.y + 5, GRID_SIZE - 6, GRID_SIZE - 10);
            ctx.strokeStyle = "#e11d48"; ctx.lineWidth = 1.5;
            ctx.strokeRect(food.x + 3, food.y + 5, GRID_SIZE - 6, GRID_SIZE - 10);
        } else { // chocolate
            ctx.shadowColor = "#881337"; ctx.shadowBlur = 8;
            ctx.fillStyle = "#be123c";
            ctx.fillRect(food.x + 2, food.y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
            ctx.fillStyle = "#ffe4e6";
            ctx.fillRect(cx - 2, cy - 2, 4, 4);
        }
    } else if (currentMode === "christmas") {
        if (food.type === "star") {
            ctx.shadowColor = "#38bdf8"; ctx.shadowBlur = 12;
            ctx.fillStyle = "#7dd3fc";
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                ctx.lineTo(cx + Math.cos((18 + i * 72) * Math.PI / 180) * r, cy - Math.sin((18 + i * 72) * Math.PI / 180) * r);
                ctx.lineTo(cx + Math.cos((54 + i * 72) * Math.PI / 180) * (r * 0.5), cy - Math.sin((54 + i * 72) * Math.PI / 180) * (r * 0.5));
            }
            ctx.closePath();
            ctx.fill();
        } else if (food.type === "gift") {
            ctx.shadowColor = "#22c55e"; ctx.shadowBlur = 10;
            ctx.fillStyle = "#ef4444";
            ctx.fillRect(food.x + 3, food.y + 3, GRID_SIZE - 6, GRID_SIZE - 6);
            ctx.fillStyle = "#facc15";
            ctx.fillRect(cx - 2, food.y + 3, 4, GRID_SIZE - 6);
            ctx.fillRect(food.x + 3, cy - 2, GRID_SIZE - 6, 4);
        } else { // candy
            ctx.shadowColor = "#38bdf8"; ctx.shadowBlur = 10;
            ctx.fillStyle = "#ffffff";
            ctx.beginPath(); ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#0284c7";
            ctx.fillRect(food.x + 4, cy - 2, GRID_SIZE - 8, 4);
        }
    } else if (currentMode === "fruit") {
        if (food.type === "apple") {
            ctx.shadowColor = "#ef4444"; ctx.shadowBlur = 10;
            ctx.fillStyle = "#ef4444";
            ctx.beginPath(); ctx.arc(cx, cy + 1, r * 0.85, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#65a30d";
            ctx.fillRect(cx - 1, cy - r * 0.9, 2, 5);
            ctx.fillStyle = "#a3e635";
            ctx.beginPath();
            ctx.ellipse(cx + 3, cy - r * 0.75, 3, 1.5, -0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(255, 255, 255, 0.62)";
            ctx.beginPath(); ctx.arc(cx - 3, cy - 2, 2, 0, Math.PI * 2); ctx.fill();
        } else if (food.type === "orange") {
            ctx.shadowColor = "#fb923c"; ctx.shadowBlur = 9;
            ctx.fillStyle = "#f97316";
            ctx.beginPath(); ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "rgba(255, 237, 213, 0.55)";
            ctx.beginPath(); ctx.arc(cx - 3, cy - 3, 1.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#84cc16";
            ctx.fillRect(cx - 1, cy - r * 0.85, 2, 3);
        } else {
            ctx.shadowColor = "#facc15"; ctx.shadowBlur = 8;
            ctx.fillStyle = "#eab308";
            ctx.beginPath();
            ctx.ellipse(cx, cy, r * 0.7, r * 0.95, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.beginPath(); ctx.arc(cx - 2, cy - 3, 1.4, 0, Math.PI * 2); ctx.fill();
        }
    } else {
        // Default
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
}

function drawSnakeEyes(head) {
    const eyeSize = GRID_SIZE * 0.175;
    let eye1, eye2;

    if (direction === "right") {
        eye1 = { x: head.x + GRID_SIZE * 0.7, y: head.y + GRID_SIZE * 0.25 };
        eye2 = { x: head.x + GRID_SIZE * 0.7, y: head.y + GRID_SIZE * 0.75 };
    } else if (direction === "left") {
        eye1 = { x: head.x + GRID_SIZE * 0.3, y: head.y + GRID_SIZE * 0.25 };
        eye2 = { x: head.x + GRID_SIZE * 0.3, y: head.y + GRID_SIZE * 0.75 };
    } else if (direction === "up") {
        eye1 = { x: head.x + GRID_SIZE * 0.25, y: head.y + GRID_SIZE * 0.3 };
        eye2 = { x: head.x + GRID_SIZE * 0.75, y: head.y + GRID_SIZE * 0.3 };
    } else {
        eye1 = { x: head.x + GRID_SIZE * 0.25, y: head.y + GRID_SIZE * 0.7 };
        eye2 = { x: head.x + GRID_SIZE * 0.75, y: head.y + GRID_SIZE * 0.7 };
    }

    ctx.fillStyle = "white";
    ctx.beginPath(); ctx.arc(eye1.x, eye1.y, eyeSize, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(eye2.x, eye2.y, eyeSize, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#050814";
    ctx.beginPath(); ctx.arc(eye1.x, eye1.y, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(eye2.x, eye2.y, 1.5, 0, Math.PI * 2); ctx.fill();
}

function drawSnake() {
    const bodyColor = getSnakeColor();
    for (let i = snake.length - 1; i >= 0; i--) {
        const part = snake[i];
        const isHead = i === 0;
        const cellSize = GRID_SIZE * THEMES[currentMode].snakeScale;
        const inset = (GRID_SIZE - cellSize) / 2;
        let radius = currentMode === "default" ? 4 : 7;
        if (currentMode === "christmas") radius = 9;

        ctx.save();
        ctx.shadowColor = THEMES[currentMode].accent;
        ctx.shadowBlur = isHead ? 13 : 5;
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.roundRect(part.x + inset, part.y + inset, cellSize, cellSize, radius);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (currentMode === "fruit" && !isHead && i % 3 === 0) {
            ctx.fillStyle = "rgba(218, 255, 176, 0.82)";
            ctx.beginPath();
            ctx.ellipse(part.x + 10, part.y + 10, 4.2, 1.8, i % 2 ? -0.6 : 0.6, 0, Math.PI * 2);
            ctx.fill();
        } else if (currentMode === "christmas" && !isHead) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
            ctx.beginPath();
            ctx.arc(part.x + 10, part.y + 10, 1.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (currentMode === "sweety" && !isHead) {
            ctx.fillStyle = "rgba(255, 237, 245, 0.76)";
            ctx.beginPath();
            ctx.arc(part.x + 7, part.y + 7, 1.4, 0, Math.PI * 2);
            ctx.fill();
        } else if (currentMode === "default" && !isHead) {
            ctx.strokeStyle = "rgba(224, 247, 255, 0.58)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(part.x + 6, part.y + 10);
            ctx.lineTo(part.x + 14, part.y + 10);
            ctx.stroke();
        }
        ctx.restore();
    }
    drawSnakeEyes(snake[0]);
}

function drawGame() {
    drawGrid();
    for (const food of foods) drawFood(food);
    drawSnake();
}

// ==================== COLLISION & LOGIC ====================
function checkFoodCollision(head) {
    for (let i = 0; i < foods.length; i++) {
        const food = foods[i];
        if (head.x === food.x && head.y === food.y) return i;
    }
    return -1;
}

function checkWallCollision(head) {
    return head.x < 0 || head.y < 0 || head.x >= canvasWidth || head.y >= canvasHeight;
}

function checkSelfCollision(head) {
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) return true;
    }
    return false;
}

function showNotification(text) {
    const notification = document.getElementById("notification");
    notification.textContent = text;
    notification.style.opacity = "1";
    setTimeout(() => { notification.style.opacity = "0"; }, 700);
}

function moveSnake() {
    direction = nextDirection;
    const head = { x: snake[0].x, y: snake[0].y };

    if (direction === "up") head.y -= GRID_SIZE;
    if (direction === "down") head.y += GRID_SIZE;
    if (direction === "left") head.x -= GRID_SIZE;
    if (direction === "right") head.x += GRID_SIZE;

    if (checkWallCollision(head) || checkSelfCollision(head)) {
        endGame();
        return;
    }

    snake.unshift(head);
    const foodIndex = checkFoodCollision(head);

    if (foodIndex !== -1) {
        score++;
        speed = Math.min(Math.max(1, Math.floor((score + 1) / 2)), 20);
        updateScore();

        if (score > 0 && score % 10 === 0) {
            triggerConfetti();
            showNotification("UPGRADE!");
        } else if (score % 5 === 0) {
            showNotification("UPGRADE!");
        } else {
            showNotification("NICE!");
        }

        foods.splice(foodIndex, 1);
        let position;
        do {
            position = randomGridPosition();
        } while (!positionIsFree(position.x, position.y));

        const theme = THEMES[currentMode];
        const randomType = theme.foodTypes[Math.floor(Math.random() * theme.foodTypes.length)];
        foods.push({
            x: position.x,
            y: position.y,
            type: randomType
        });
    } else {
        snake.pop();
    }
}

// ==================== DIRECTION CONTROL ====================
function changeDirection(newDirection) {
    if (newDirection === "up" && direction !== "down") nextDirection = "up";
    if (newDirection === "down" && direction !== "up") nextDirection = "down";
    if (newDirection === "left" && direction !== "right") nextDirection = "left";
    if (newDirection === "right" && direction !== "left") nextDirection = "right";
}

// Keyboard input (Hanya aktif saat game berjalan / TIDAK sedang mengetik nama)
document.addEventListener("keydown", function(event) {
    const activeElement = document.activeElement;
    if (activeElement && activeElement.tagName === "INPUT") {
        return; // Jangan cegah tombol jika sedang mengetik di input nama
    }

    const key = event.key.toLowerCase();
    if (key === "arrowup" || key === "w") { changeDirection("up"); event.preventDefault(); }
    if (key === "arrowdown" || key === "s") { changeDirection("down"); event.preventDefault(); }
    if (key === "arrowleft" || key === "a") { changeDirection("left"); event.preventDefault(); }
    if (key === "arrowright" || key === "d") { changeDirection("right"); event.preventDefault(); }

    if (event.code === "Space") {
        if (gameOver && document.getElementById("gameOver").style.display === "flex") {
            restartGame();
        }
    }
});

// Modern D-Pad Button Click / Touch
document.querySelectorAll(".dpad-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        changeDirection(btn.getAttribute("data-dir"));
    });
    btn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        changeDirection(btn.getAttribute("data-dir"));
    }, { passive: false });
});

// ==================== SCORE & PREDIKAT ====================
function updateScore() {
    document.getElementById("score").textContent = score;
    document.getElementById("speed").textContent = speed;
}

function getPredikat(s) {
    if (s >= 30) return "LEGENDARY SNAKE MASTER 👑";
    if (s >= 20) return "PRO GAMER ⚡";
    if (s >= 10) return "SKILLED HUNTER 🎯";
    if (s >= 5) return "RISING STAR 🌱";
    return "BEGINNER NOVICE 🐣";
}

function endGame() {
    gameRunning = false;
    gameOver = true;

    document.getElementById("finalScore").textContent = score;
    document.getElementById("finalPlayerName").textContent = playerName;
    document.getElementById("predikatText").textContent = getPredikat(score);
    document.getElementById("gameOver").style.display = "flex";
}

function restartGame() {
    resizeCanvas();
    score = 0;
    speed = 1;
    gameOver = false;
    gameRunning = true;
    lastMoveTime = 0;

    createSnake();
    createFoods();
    updateScore();

    document.getElementById("gameOver").style.display = "none";
    confettiParticles = [];
    confettiCtx.clearRect(0, 0, canvasWidth, canvasHeight);
}

document.getElementById("restartButton").addEventListener("click", restartGame);
document.getElementById("menuButton").addEventListener("click", () => {
    document.getElementById("gameOver").style.display = "none";
    document.getElementById("menuScreen").style.display = "flex";
});

// ==================== CONFETTI EFFECT (FIXED) ====================
function triggerConfetti() {
    confettiParticles = [];
    const theme = THEMES[currentMode];
    const shape = currentMode === "fruit" ? "leaf"
        : currentMode === "christmas" ? "snow"
        : currentMode === "sweety" ? "heart"
        : "spark";
    for (let i = 0; i < 80; i++) {
        confettiParticles.push({
            x: canvasWidth / 2,
            y: canvasHeight / 2,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10 - 3,
            color: theme.confetti[Math.floor(Math.random() * theme.confetti.length)],
            size: Math.random() * 5 + 4,
            rotation: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.16,
            shape,
            life: 65
        });
    }
}

function updateAndDrawConfetti() {
    // Selalu bersihkan canvas confetti setiap frame agar tidak menumpuk/statis
    confettiCtx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (confettiParticles.length === 0) return;

    for (let i = confettiParticles.length - 1; i >= 0; i--) {
        let p = confettiParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += currentMode === "christmas" ? 0.08 : 0.16;
        if (currentMode === "fruit") p.vx += Math.sin(p.life / 7) * 0.035;
        if (currentMode === "christmas") p.vx += Math.sin(p.life / 10) * 0.045;
        p.rotation += p.spin;
        p.life--;

        confettiCtx.save();
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate(p.rotation);
        confettiCtx.fillStyle = p.color;
        if (p.shape === "heart") {
            const s = p.size * 0.55;
            confettiCtx.beginPath();
            confettiCtx.moveTo(0, s * 0.7);
            confettiCtx.bezierCurveTo(-s * 1.5, -s * 0.2, -s, -s, 0, -s * 0.25);
            confettiCtx.bezierCurveTo(s, -s, s * 1.5, -s * 0.2, 0, s * 0.7);
            confettiCtx.fill();
        } else if (p.shape === "leaf") {
            confettiCtx.beginPath();
            confettiCtx.ellipse(0, 0, p.size, p.size * 0.42, 0, 0, Math.PI * 2);
            confettiCtx.fill();
            confettiCtx.strokeStyle = "rgba(255, 255, 255, 0.55)";
            confettiCtx.lineWidth = 1;
            confettiCtx.beginPath();
            confettiCtx.moveTo(-p.size * 0.65, 0);
            confettiCtx.lineTo(p.size * 0.65, 0);
            confettiCtx.stroke();
        } else if (p.shape === "snow") {
            confettiCtx.strokeStyle = p.color;
            confettiCtx.lineWidth = 1.5;
            confettiCtx.beginPath();
            confettiCtx.moveTo(-p.size, 0); confettiCtx.lineTo(p.size, 0);
            confettiCtx.moveTo(0, -p.size); confettiCtx.lineTo(0, p.size);
            confettiCtx.moveTo(-p.size * 0.65, -p.size * 0.65); confettiCtx.lineTo(p.size * 0.65, p.size * 0.65);
            confettiCtx.moveTo(p.size * 0.65, -p.size * 0.65); confettiCtx.lineTo(-p.size * 0.65, p.size * 0.65);
            confettiCtx.stroke();
        } else if (p.shape === "spark") {
            confettiCtx.beginPath();
            confettiCtx.moveTo(0, -p.size);
            confettiCtx.lineTo(p.size * 0.28, -p.size * 0.28);
            confettiCtx.lineTo(p.size, 0);
            confettiCtx.lineTo(p.size * 0.28, p.size * 0.28);
            confettiCtx.lineTo(0, p.size);
            confettiCtx.lineTo(-p.size * 0.28, p.size * 0.28);
            confettiCtx.lineTo(-p.size, 0);
            confettiCtx.lineTo(-p.size * 0.28, -p.size * 0.28);
            confettiCtx.closePath();
            confettiCtx.fill();
        }
        confettiCtx.restore();

        if (p.life <= 0) {
            confettiParticles.splice(i, 1);
        }
    }
}

// ==================== GAME LOOP ====================
function gameLoop(timestamp) {
    if (gameRunning) {
        const moveDelay = Math.max(45, 180 - speed * 7);
        if (timestamp - lastMoveTime >= moveDelay) {
            moveSnake();
            lastMoveTime = timestamp;
        }
        drawGame();
        updateAndDrawConfetti();
    }
    requestAnimationFrame(gameLoop);
}

// ==================== MENU & LOADING SYSTEM ====================
let loadingProgress = 0;
const loadingMessages = [
    "INITIALIZING SYSTEM...",
    "LOADING GAME ENGINE...",
    "GENERATING SNAKE...",
    "SCANNING GRID...",
    "SYSTEM READY..."
];
let loadingIndex = 0;

function loadingAnimation() {
    const progress = document.getElementById("loadingProgress");
    const percent = document.getElementById("loadingPercent");
    const text = document.getElementById("loadingText");

    const interval = setInterval(function() {
        loadingProgress += 3;
        if (loadingProgress > 100) loadingProgress = 100;

        progress.style.width = loadingProgress + "%";
        percent.textContent = loadingProgress + "%";

        const messageIndex = Math.min(Math.floor(loadingProgress / 22), loadingMessages.length - 1);
        if (loadingIndex !== messageIndex) {
            loadingIndex = messageIndex;
            text.textContent = loadingMessages[messageIndex];
        }

        if (loadingProgress >= 100) {
            clearInterval(interval);
            setTimeout(showMenuScreen, 400);
        }
    }, 30);
}

function showMenuScreen() {
    const splash = document.getElementById("splashScreen");
    splash.style.opacity = "0";
    splash.style.transition = "opacity 0.5s ease";
    setTimeout(() => {
        splash.style.display = "none";
        document.getElementById("menuScreen").style.display = "flex";
    }, 500);
}

document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".mode-btn").forEach(b => {
            b.classList.remove("active");
            b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
        currentMode = btn.getAttribute("data-mode");
        document.getElementById("menuScreen").dataset.theme = currentMode;
        document.getElementById("gameContainer").dataset.theme = currentMode;
        document.getElementById("themePreviewName").textContent = btn.getAttribute("data-label");
    });
});

document.getElementById("startMenuButton").addEventListener("click", () => {
    const inputName = document.getElementById("playerName").value;
    if (inputName.trim() !== "") {
        playerName = inputName;
    }
    document.getElementById("displayPlayerName").textContent = playerName;
    document.getElementById("menuScreen").style.display = "none";
    restartGame();
});

document.addEventListener("keydown", function(event) {
    if (event.code === "Space") {
        const splash = document.getElementById("splashScreen");
        if (splash.style.display !== "none") {
            clearInterval(loadingProgress);
            showMenuScreen();
        }
    }
});

window.addEventListener("resize", function() {
    if (!gameRunning) return;
    resizeCanvas();
});

// ==================== INITIAL START ====================
resizeCanvas();
loadingAnimation();
requestAnimationFrame(gameLoop);