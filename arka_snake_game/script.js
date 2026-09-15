// ==================== CANVAS ====================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameArea = document.getElementById("gameArea");


// ==================== GAME SETTINGS ====================

const GRID_SIZE = 20;
const FOOD_COUNT = 8;

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


// ==================== FOOD COLORS ====================

const FOOD_COLORS = [
    "#38bdf8",
    "#a855f7",
    "#22c55e",
    "#facc15",
    "#f97316",
    "#ef4444",
    "#ec4899",
    "#14b8a6"
];


// ==================== RESPONSIVE CANVAS ====================

function resizeCanvas() {

    const rect =
        gameArea.getBoundingClientRect();

    canvasWidth =
        Math.floor(rect.width);

    canvasHeight =
        Math.floor(rect.height);

    canvas.width =
        canvasWidth;

    canvas.height =
        canvasHeight;
}


// ==================== RANDOM GRID POSITION ====================

function randomGridPosition() {

    const columns =
        Math.floor(
            canvasWidth / GRID_SIZE
        );

    const rows =
        Math.floor(
            canvasHeight / GRID_SIZE
        );

    return {

        x:
            Math.floor(
                Math.random() * columns
            ) * GRID_SIZE,

        y:
            Math.floor(
                Math.random() * rows
            ) * GRID_SIZE
    };
}


// ==================== CEK POSISI ====================

function positionIsFree(x, y) {

    for (const part of snake) {

        if (
            part.x === x &&
            part.y === y
        ) {

            return false;
        }
    }

    for (const food of foods) {

        if (
            food.x === x &&
            food.y === y
        ) {

            return false;
        }
    }

    return true;
}


// ==================== MEMBUAT ULAR ====================

function createSnake() {

    const centerX =
        Math.floor(
            canvasWidth /
            GRID_SIZE /
            2
        ) * GRID_SIZE;

    const centerY =
        Math.floor(
            canvasHeight /
            GRID_SIZE /
            2
        ) * GRID_SIZE;

    snake = [];

    for (let i = 0; i < 5; i++) {

        snake.push({

            x:
                centerX -
                i * GRID_SIZE,

            y:
                centerY
        });
    }

    direction = "right";
    nextDirection = "right";
}


// ==================== MEMBUAT MAKANAN ====================

function createFoods() {

    foods = [];

    for (
        let i = 0;
        i < FOOD_COUNT;
        i++
    ) {

        let position;

        do {

            position =
                randomGridPosition();

        } while (
            !positionIsFree(
                position.x,
                position.y
            )
        );

        foods.push({

            x: position.x,

            y: position.y,

            color:
                FOOD_COLORS[
                    Math.floor(
                        Math.random() *
                        FOOD_COLORS.length
                    )
                ]
        });
    }
}


// ==================== WARNA ULAR ====================

function getSnakeColor() {

    if (score >= 15) {
        return "#f43f5e";
    }

    if (score >= 10) {
        return "#a855f7";
    }

    if (score >= 5) {
        return "#22c55e";
    }

    return "#38bdf8";
}


// ==================== GRID ====================

function drawGrid() {

    ctx.save();

    ctx.strokeStyle =
        "rgba(255,255,255,0.08)";

    ctx.lineWidth = 1;

    for (
        let x = 0;
        x <= canvasWidth;
        x += GRID_SIZE
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);

        ctx.lineTo(
            x,
            canvasHeight
        );

        ctx.stroke();
    }

    for (
        let y = 0;
        y <= canvasHeight;
        y += GRID_SIZE
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(
            canvasWidth,
            y
        );

        ctx.stroke();
    }

    ctx.restore();
}


// ==================== GAMBAR MAKANAN ====================

function drawFood(food) {

    const centerX =
        food.x +
        GRID_SIZE / 2;

    const centerY =
        food.y +
        GRID_SIZE / 2;

    const radius =
        GRID_SIZE * 0.42;

    ctx.save();

    // Glow
    ctx.shadowColor =
        food.color;

    ctx.shadowBlur = 15;

    ctx.globalAlpha = 0.65;

    ctx.fillStyle =
        food.color;

    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        radius,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Lingkaran utama
    ctx.globalAlpha = 0.9;

    ctx.shadowBlur = 0;

    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        radius * 0.72,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Highlight
    ctx.globalAlpha = 0.7;

    ctx.fillStyle = "white";

    ctx.beginPath();

    ctx.arc(
        centerX -
        radius * 0.3,

        centerY -
        radius * 0.3,

        radius * 0.2,

        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
}


// ==================== MATA ULAR ====================

function drawSnakeEyes(head) {

    const eyeSize = 4;

    let eye1;
    let eye2;

    if (direction === "right") {

        eye1 = {
            x: head.x + 14,
            y: head.y + 5
        };

        eye2 = {
            x: head.x + 14,
            y: head.y + 15
        };

    } else if (direction === "left") {

        eye1 = {
            x: head.x + 2,
            y: head.y + 5
        };

        eye2 = {
            x: head.x + 2,
            y: head.y + 15
        };

    } else if (direction === "up") {

        eye1 = {
            x: head.x + 5,
            y: head.y + 2
        };

        eye2 = {
            x: head.x + 15,
            y: head.y + 2
        };

    } else {

        eye1 = {
            x: head.x + 5,
            y: head.y + 14
        };

        eye2 = {
            x: head.x + 15,
            y: head.y + 14
        };
    }


    // Mata putih
    ctx.fillStyle = "white";

    ctx.beginPath();

    ctx.arc(
        eye1.x,
        eye1.y,
        eyeSize,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.beginPath();

    ctx.arc(
        eye2.x,
        eye2.y,
        eyeSize,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Pupil
    ctx.fillStyle = "#050814";

    ctx.beginPath();

    ctx.arc(
        eye1.x,
        eye1.y,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.beginPath();

    ctx.arc(
        eye2.x,
        eye2.y,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


// ==================== GAMBAR ULAR ====================

function drawSnake() {

    const bodyColor =
        getSnakeColor();

    for (
        let i = snake.length - 1;
        i >= 0;
        i--
    ) {

        const part =
            snake[i];

        if (i === 0) {

            let headColor =
                bodyColor;

            if (score < 5) {

                headColor =
                    "#0284c7";

            } else if (score < 10) {

                headColor =
                    "#16a34a";

            } else if (score < 15) {

                headColor =
                    "#7e22ce";

            } else {

                headColor =
                    "#be123c";
            }

            ctx.fillStyle =
                headColor;

        } else {

            ctx.fillStyle =
                bodyColor;
        }


        // Tubuh persegi penuh
        ctx.fillRect(
            part.x,
            part.y,
            GRID_SIZE,
            GRID_SIZE
        );
    }


    // Mata kepala
    drawSnakeEyes(
        snake[0]
    );
}


// ==================== GAMBAR GAME ====================

function drawGame() {

    ctx.fillStyle =
        "#1e1e2d";

    ctx.fillRect(
        0,
        0,
        canvasWidth,
        canvasHeight
    );

    drawGrid();

    for (const food of foods) {

        drawFood(food);
    }

    drawSnake();
}


// ==================== TABRAKAN MAKANAN ====================

function checkFoodCollision(head) {

    for (
        let i = 0;
        i < foods.length;
        i++
    ) {

        const food =
            foods[i];

        const foodRect = {

            x: food.x,
            y: food.y,

            width: GRID_SIZE,
            height: GRID_SIZE
        };

        const headRect = {

            x: head.x,
            y: head.y,

            width: GRID_SIZE,
            height: GRID_SIZE
        };


        // Collision menggunakan
        // konsep colliderect
        if (
            headRect.x <
                foodRect.x +
                foodRect.width &&

            headRect.x +
                headRect.width >
                foodRect.x &&

            headRect.y <
                foodRect.y +
                foodRect.height &&

            headRect.y +
                headRect.height >
                foodRect.y
        ) {

            return i;
        }
    }

    return -1;
}


// ==================== TABRAKAN DINDING ====================

function checkWallCollision(head) {

    return (

        head.x < 0 ||

        head.y < 0 ||

        head.x >= canvasWidth ||

        head.y >= canvasHeight
    );
}


// ==================== TABRAKAN TUBUH ====================

function checkSelfCollision(head) {

    for (
        let i = 1;
        i < snake.length;
        i++
    ) {

        if (

            head.x === snake[i].x &&

            head.y === snake[i].y
        ) {

            return true;
        }
    }

    return false;
}


// ==================== NOTIFIKASI ====================

function showNotification(text) {

    const notification =
        document.getElementById(
            "notification"
        );

    notification.textContent =
        text;

    notification.style.opacity =
        "1";

    setTimeout(
        () => {

            notification.style.opacity =
                "0";

        },
        700
    );
}


// ==================== GERAK ULAR ====================

function moveSnake() {

    direction =
        nextDirection;

    const head = {

        x: snake[0].x,

        y: snake[0].y
    };


    // Tentukan gerakan
    if (direction === "up") {
        head.y -= GRID_SIZE;
    }

    if (direction === "down") {
        head.y += GRID_SIZE;
    }

    if (direction === "left") {
        head.x -= GRID_SIZE;
    }

    if (direction === "right") {
        head.x += GRID_SIZE;
    }


    // Cek dinding
    if (
        checkWallCollision(head)
    ) {

        endGame();

        return;
    }


    // Cek tubuh sendiri
    if (
        checkSelfCollision(head)
    ) {

        endGame();

        return;
    }


    // Tambahkan kepala
    snake.unshift(head);


    // Cek makanan
    const foodIndex =
        checkFoodCollision(head);

    if (foodIndex !== -1) {

        score++;

        // Speed bertambah
        speed =
            Math.min(
                1 +
                Math.floor(
                    score / 2
                ),
                20
            );

        updateScore();


        // Notifikasi
        if (
            score % 10 === 0
        ) {

            showNotification(
                "PERFECT!"
            );

        } else if (
            score % 5 === 0
        ) {

            showNotification(
                "GREAT!"
            );

        } else {

            showNotification(
                "NICE!"
            );
        }


        // Hapus makanan
        foods.splice(
            foodIndex,
            1
        );


        // Buat makanan baru
        let position;

        do {

            position =
                randomGridPosition();

        } while (
            !positionIsFree(
                position.x,
                position.y
            )
        );

        foods.push({

            x: position.x,

            y: position.y,

            color:
                FOOD_COLORS[
                    Math.floor(
                        Math.random() *
                        FOOD_COLORS.length
                    )
                ]
        });

    } else {

        // Tidak makan:
        // ekor dihapus
        snake.pop();
    }
}


// ==================== GANTI ARAH ====================

function changeDirection(
    newDirection
) {

    if (
        newDirection === "up" &&
        direction !== "down"
    ) {

        nextDirection =
            "up";
    }

    if (
        newDirection === "down" &&
        direction !== "up"
    ) {

        nextDirection =
            "down";
    }

    if (
        newDirection === "left" &&
        direction !== "right"
    ) {

        nextDirection =
            "left";
    }

    if (
        newDirection === "right" &&
        direction !== "left"
    ) {

        nextDirection =
            "right";
    }
}


// ==================== KEYBOARD ====================

document.addEventListener(
    "keydown",
    function(event) {

        const key =
            event.key.toLowerCase();

        if (
            key === "arrowup" ||
            key === "w"
        ) {

            changeDirection(
                "up"
            );

            event.preventDefault();
        }

        if (
            key === "arrowdown" ||
            key === "s"
        ) {

            changeDirection(
                "down"
            );

            event.preventDefault();
        }

        if (
            key === "arrowleft" ||
            key === "a"
        ) {

            changeDirection(
                "left"
            );

            event.preventDefault();
        }

        if (
            key === "arrowright" ||
            key === "d"
        ) {

            changeDirection(
                "right"
            );

            event.preventDefault();
        }


        // Space restart
        if (
            event.code === "Space"
        ) {

            if (gameOver) {

                restartGame();
            }
        }
    }
);


// ==================== JOYSTICK ====================

const joystick =
    document.getElementById(
        "joystick"
    );

const joystickBase =
    document.getElementById(
        "joystickBase"
    );

const joystickKnob =
    document.getElementById(
        "joystickKnob"
    );

let joystickAktif = false;
let joystickTouchId = null;


// ==================== RESET JOYSTICK ====================

function resetJoystick() {

    joystickKnob.style.transform =
        "translate(-50%, -50%)";
}


// ==================== BACA ARAH JOYSTICK ====================

function arahDariJoystick(
    touchX,
    touchY
) {

    const rect =
        joystickBase.getBoundingClientRect();

    const centerX =
        rect.left +
        rect.width / 2;

    const centerY =
        rect.top +
        rect.height / 2;

    const dx =
        touchX - centerX;

    const dy =
        touchY - centerY;

    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    // Abaikan gerakan kecil
    if (distance < 12) {
        return;
    }


    // Jarak maksimum knob
    const maxDistance = 32;

    const ratio =
        Math.min(
            maxDistance / distance,
            1
        );

    const knobX =
        dx * ratio;

    const knobY =
        dy * ratio;


    // Geser knob mengikuti jempol
    joystickKnob.style.transform =
        `translate(
            calc(-50% + ${knobX}px),
            calc(-50% + ${knobY}px)
        )`;


    // Tentukan arah
    if (
        Math.abs(dx) >
        Math.abs(dy)
    ) {

        if (dx > 0) {

            changeDirection(
                "right"
            );

        } else {

            changeDirection(
                "left"
            );
        }

    } else {

        if (dy > 0) {

            changeDirection(
                "down"
            );

        } else {

            changeDirection(
                "up"
            );
        }
    }
}


// ==================== JOYSTICK DOWN ====================

joystick.addEventListener(
    "pointerdown",
    function(event) {

        event.preventDefault();

        joystickAktif = true;

        joystickTouchId =
            event.pointerId;

        joystick.setPointerCapture(
            event.pointerId
        );

        arahDariJoystick(
            event.clientX,
            event.clientY
        );
    }
);


// ==================== JOYSTICK MOVE ====================

joystick.addEventListener(
    "pointermove",
    function(event) {

        if (!joystickAktif) {
            return;
        }

        event.preventDefault();

        arahDariJoystick(
            event.clientX,
            event.clientY
        );
    }
);


// ==================== JOYSTICK UP ====================

joystick.addEventListener(
    "pointerup",
    function(event) {

        if (
            event.pointerId !==
            joystickTouchId
        ) {

            return;
        }

        joystickAktif = false;

        joystickTouchId = null;

        resetJoystick();
    }
);


// ==================== JOYSTICK CANCEL ====================

joystick.addEventListener(
    "pointercancel",
    function() {

        joystickAktif = false;

        joystickTouchId = null;

        resetJoystick();
    }
);


// ==================== SWIPE CANVAS ====================

let swipeStartX = 0;
let swipeStartY = 0;

canvas.addEventListener(
    "touchstart",
    function(event) {

        if (
            event.touches.length !== 1
        ) {

            return;
        }

        swipeStartX =
            event.touches[0].clientX;

        swipeStartY =
            event.touches[0].clientY;
    },
    {
        passive: true
    }
);

canvas.addEventListener(
    "touchend",
    function(event) {

        if (
            event.changedTouches.length !== 1
        ) {

            return;
        }

        const endX =
            event.changedTouches[0].clientX;

        const endY =
            event.changedTouches[0].clientY;

        const dx =
            endX -
            swipeStartX;

        const dy =
            endY -
            swipeStartY;

        const minSwipe = 25;


        if (
            Math.abs(dx) <
                minSwipe &&

            Math.abs(dy) <
                minSwipe
        ) {

            return;
        }


        if (
            Math.abs(dx) >
            Math.abs(dy)
        ) {

            if (dx > 0) {

                changeDirection(
                    "right"
                );

            } else {

                changeDirection(
                    "left"
                );
            }

        } else {

            if (dy > 0) {

                changeDirection(
                    "down"
                );

            } else {

                changeDirection(
                    "up"
                );
            }
        }
    },
    {
        passive: true
    }
);


// ==================== UPDATE SCORE ====================

function updateScore() {

    document.getElementById(
        "score"
    ).textContent =
        score;

    document.getElementById(
        "speed"
    ).textContent =
        speed;
}


// ==================== GAME OVER ====================

function endGame() {

    gameRunning = false;

    gameOver = true;

    document.getElementById(
        "finalScore"
    ).textContent =
        score;

    document.getElementById(
        "gameOver"
    ).style.display =
        "flex";
}


// ==================== RESTART ====================

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

    document.getElementById(
        "gameOver"
    ).style.display =
        "none";

    resetJoystick();
}


// ==================== RESTART BUTTON ====================

document.getElementById(
    "restartButton"
).addEventListener(
    "click",
    restartGame
);


// ==================== GAME LOOP ====================

function gameLoop(timestamp) {

    if (gameRunning) {

        const moveDelay =
            Math.max(
                45,
                180 -
                speed * 7
            );

        if (
            timestamp -
            lastMoveTime >=
            moveDelay
        ) {

            moveSnake();

            lastMoveTime =
                timestamp;
        }

        drawGame();
    }

    requestAnimationFrame(
        gameLoop
    );
}


// ==================== LOADING ====================

let loadingProgress = 0;

const loadingMessages = [

    "INITIALIZING SYSTEM...",
    "LOADING GAME ENGINE...",
    "GENERATING SNAKE...",
    "SCANNING GRID...",
    "PREPARING FOOD...",
    "SYSTEM READY..."
];

let loadingIndex = 0;


function loadingAnimation() {

    const progress =
        document.getElementById(
            "loadingProgress"
        );

    const percent =
        document.getElementById(
            "loadingPercent"
        );

    const text =
        document.getElementById(
            "loadingText"
        );

    const interval =
        setInterval(
            function() {

                loadingProgress += 2;

                if (
                    loadingProgress >
                    100
                ) {

                    loadingProgress =
                        100;
                }

                progress.style.width =
                    loadingProgress +
                    "%";

                percent.textContent =
                    loadingProgress +
                    "%";


                const messageIndex =
                    Math.min(

                        Math.floor(
                            loadingProgress /
                            18
                        ),

                        loadingMessages.length -
                        1
                    );


                if (
                    loadingIndex !==
                    messageIndex
                ) {

                    loadingIndex =
                        messageIndex;

                    text.textContent =
                        loadingMessages[
                            messageIndex
                        ];
                }


                if (
                    loadingProgress >=
                    100
                ) {

                    clearInterval(
                        interval
                    );

                    setTimeout(
                        startGameFromSplash,
                        400
                    );
                }

            },
            35
        );
}


// ==================== MULAI DARI SPLASH ====================

function startGameFromSplash() {

    const splash =
        document.getElementById(
            "splashScreen"
        );

    splash.style.opacity =
        "0";

    splash.style.transition =
        "opacity 0.5s ease";

    setTimeout(
        function() {

            splash.style.display =
                "none";

            restartGame();

        },
        500
    );
}


// ==================== SPACE SKIP LOADING ====================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.code === "Space"
        ) {

            const splash =
                document.getElementById(
                    "splashScreen"
                );

            if (
                splash.style.display !==
                "none"
            ) {

                startGameFromSplash();
            }
        }
    }
);


// ==================== RESPONSIVE ====================

window.addEventListener(
    "resize",
    function() {

        if (!gameRunning) {
            return;
        }

        resizeCanvas();
    }
);


// ==================== START ====================

resizeCanvas();

loadingAnimation();

requestAnimationFrame(
    gameLoop
);