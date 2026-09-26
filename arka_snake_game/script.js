// ==================== CANVAS & SETUP ====================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameArea = document.getElementById("gameArea");

const confettiCanvas = document.getElementById("confettiCanvas");
const confettiCtx = confettiCanvas.getContext("2d");

const GRID_SIZE = 20;
let FOOD_COUNT = 30;

let canvasWidth = 800;
let canvasHeight = 600;

let snake = [];
let foods = [];

let direction = "right";
let nextDirection = "right";

let score = 0;
let speed = 5;

let gameRunning = false;
let gameOver = false;
let lastMoveTime = 0;

let playerName = "PLAYER 1";
let currentMode = "default"; // default, fruit, christmas, sweety
let confettiParticles = [];

// ==================== TEMA / MODE WARNA & VISUAL (KONSISTEN & FUTURISTIK) ====================
const THEMES = {
    default: {
        bg: "#1e1e2d",
        grid: "rgba(56, 189, 248, 0.08)",
        foodTypes: ["circle", "square", "diamond"]
    },
    fruit: {
        bg: "#0f2619",
        grid: "rgba(34, 197, 94, 0.12)",
        foodTypes: ["apple", "orange", "lemon"]
    },
    christmas: {
        bg: "#061325", // Nuansa biru es futuristik
        grid: "rgba(125, 211, 252, 0.12)", // Garis es biru terang
        foodTypes: ["gift", "star", "candy"]
    },
    sweety: {
        bg: "#251124", // Nuansa pink ungu futuristik valentine
        grid: "rgba(244, 114, 182, 0.12)",
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
    if (currentMode === "sweety") {
        if (score >= 15) return "#fb7185";
        if (score >= 10) return "#f43f5e";
        if (score >= 5) return "#ec4899";
        return "#f472b6";
    }
    if (currentMode === "christmas") {
        if (score >= 15) return "#38bdf8"; // Biru es terang
        if (score >= 10) return "#7dd3fc";
        if (score >= 5) return "#22c55e";
        return "#ffffff";
    }
    if (currentMode === "fruit") {
        if (score >= 15) return "#eab308";
        if (score >= 10) return "#f97316";
        if (score >= 5) return "#84cc16";
        return "#22c55e";
    }
    // Default
    if (score >= 15) return "#f43f5e";
    if (score >= 10) return "#a855f7";
    if (score >= 5) return "#22c55e";
    return "#38bdf8";
}

// ==================== DRAWING SYSTEM ====================
function drawGrid() {
    ctx.save();
    ctx.strokeStyle = THEMES[currentMode].grid;
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvasWidth; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
    }
    for (let y = 0; y <= canvasHeight; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
    }
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
            ctx.fillStyle = "#f43f5e";
            ctx.beginPath();
            let tc = r * 0.3;
            ctx.moveTo(cx, cy + r * 0.5);
            ctx.bezierCurveTo(cx, cy, cx - r, cy - r, cx - r, cy - tc);
            ctx.bezierCurveTo(cx - r, cy - r, cx, cy - r * 0.5, cx, cy - tc);
            ctx.bezierCurveTo(cx, cy - r * 0.5, cx + r, cy - r, cx + r, cy - tc);
            ctx.bezierCurveTo(cx + r, cy, cx, cy, cx, cy + r * 0.5);
            ctx.fill();
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
            ctx.fillStyle = "#ef4444";
            ctx.beginPath(); ctx.arc(cx, cy + 1, r * 0.85, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#22c55e";
            ctx.fillRect(cx - 1, cy - r * 0.9, 2, 5);
        } else if (food.type === "orange") {
            ctx.fillStyle = "#f97316";
            ctx.beginPath(); ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2); ctx.fill();
        } else {
            ctx.fillStyle = "#eab308";
            ctx.beginPath(); ctx.arc(cx, cy, r * 0.75, 0, Math.PI * 2); ctx.fill();
        }
    } else {
        // Default
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
}

function drawSnakeEyes(head) {
    const eyeSize = 3.5;
    let eye1, eye2;

    if (direction === "right") {
        eye1 = { x: head.x + 14, y: head.y + 5 };
        eye2 = { x: head.x + 14, y: head.y + 15 };
    } else if (direction === "left") {
        eye1 = { x: head.x + 6, y: head.y + 5 };
        eye2 = { x: head.x + 6, y: head.y + 15 };
    } else if (direction === "up") {
        eye1 = { x: head.x + 5, y: head.y + 6 };
        eye2 = { x: head.x + 15, y: head.y + 6 };
    } else {
        eye1 = { x: head.x + 5, y: head.y + 14 };
        eye2 = { x: head.x + 15, y: head.y + 14 };
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
        ctx.fillStyle = bodyColor;

        if (currentMode === "sweety" || currentMode === "fruit" || currentMode === "christmas") {
            ctx.beginPath();
            ctx.roundRect(part.x + 1, part.y + 1, GRID_SIZE - 2, GRID_SIZE - 2, 5);
            ctx.fill();
        } else {
            ctx.fillRect(part.x, part.y, GRID_SIZE, GRID_SIZE);
        }
    }
    drawSnakeEyes(snake[0]);
}

function drawGame() {
    ctx.fillStyle = THEMES[currentMode].bg;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
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
        speed = Math.min(1 + Math.floor(score / 2), 20);
        updateScore();

        if (score > 0 && score % 10 === 0) {
            triggerConfetti();
            showNotification("EPIC SCORE!");
        } else if (score % 5 === 0) {
            showNotification("GREAT!");
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
    for (let i = 0; i < 80; i++) {
        confettiParticles.push({
            x: canvasWidth / 2,
            y: canvasHeight / 2,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10 - 3,
            color: currentMode === "christmas" ? "#38bdf8" : (currentMode === "sweety" ? "#f43f5e" : "#38bdf8"),
            size: Math.random() * 6 + 4,
            life: 60
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
        p.vy += 0.2;
        p.life--;

        confettiCtx.fillStyle = p.color;
        confettiCtx.fillRect(p.x, p.y, p.size, p.size);

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
        document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentMode = btn.getAttribute("data-mode");
    });
});

document.getElementById("startMenuButton").addEventListener("click", () => {
    const inputName = document.getElementById("playerName").value.trim();
    if (inputName !== "") {
        playerName = inputName.toUpperCase();
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