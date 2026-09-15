/* =========================
   ELEMENT
========================= */

const splashScreen = document.getElementById("splashScreen");

const gameContainer = document.getElementById("gameContainer");

const canvas = document.getElementById("gameCanvas");

const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");

const speedElement = document.getElementById("speed");

const finalScoreElement = document.getElementById("finalScore");

const gameOverElement = document.getElementById("gameOver");

const restartButton = document.getElementById("restartButton");

const notification = document.getElementById("notification");

const musicButton = document.getElementById("musicButton");

const loadingProgress = document.getElementById("loadingProgress");

const loadingPercent = document.getElementById("loadingPercent");

const loadingText = document.getElementById("loadingText");

const joystick = document.getElementById("joystick");

const joystickStick = document.getElementById("joystickStick");


/* =========================
   AUDIO
========================= */

const mainMusic = document.getElementById("mainMusic");

const coinSound = document.getElementById("coinSound");

const gameOverSound = document.getElementById("gameOverSound");


let musicEnabled = true;

let gameStarted = false;


mainMusic.volume = 0.35;

coinSound.volume = 0.8;

gameOverSound.volume = 0.85;


/* =========================
   GAME SETTINGS
========================= */

const GRID_SIZE = 20;

const FOOD_COUNT = 8;

const MIN_SPEED = 5;

const MAX_SPEED = 20;


let snake = [];

let foods = [];

let direction = {
    x: 1,
    y: 0
};


let nextDirection = {
    x: 1,
    y: 0
};


let score = 0;

let speed = MIN_SPEED;

let gameRunning = false;

let gameLoop = null;

let cellWidth = 0;

let cellHeight = 0;


/* =========================
   FOOD COLORS
========================= */

const foodColors = [
    "#f87171",
    "#facc15",
    "#38bdf8",
    "#a78bfa",
    "#fb7185",
    "#4ade80",
    "#f97316",
    "#e879f9"
];


/* =========================
   SNAKE COLORS
========================= */

function getSnakeColor() {

    if (score >= 15) {
        return "#a855f7";
    }

    if (score >= 10) {
        return "#f59e0b";
    }

    if (score >= 5) {
        return "#22c55e";
    }

    return "#38bdf8";
}


/* =========================
   AUDIO FUNCTIONS
========================= */

function playMainMusic() {

    if (!musicEnabled) {
        return;
    }

    mainMusic
        .play()
        .catch(() => {
            console.log(
                "Browser menunggu interaksi pengguna untuk memutar musik."
            );
        });
}


function stopMainMusic() {

    mainMusic.pause();

    mainMusic.currentTime = 0;
}


function playCoinSound() {

    coinSound.pause();

    coinSound.currentTime = 0;

    coinSound
        .play()
        .catch(() => {});
}


function playGameOverSound() {

    gameOverSound.pause();

    gameOverSound.currentTime = 0;

    gameOverSound
        .play()
        .catch(() => {});
}


/* =========================
   MUSIC BUTTON
========================= */

function updateMusicButton() {

    if (musicEnabled) {

        musicButton.textContent =
            "🔊 MUSIC ON";

        musicButton.classList.remove("off");

    } else {

        musicButton.textContent =
            "🔇 MUSIC OFF";

        musicButton.classList.add("off");

    }
}


musicButton.addEventListener(
    "click",
    function () {

        if (musicEnabled) {

            musicEnabled = false;

            stopMainMusic();

        } else {

            musicEnabled = true;

            playMainMusic();

        }

        updateMusicButton();

    }
);


updateMusicButton();


/* =========================
   AUDIO RETRY
========================= */

document.addEventListener(
    "pointerdown",
    function () {

        if (gameStarted && musicEnabled) {
            playMainMusic();
        }

    }
);


document.addEventListener(
    "keydown",
    function () {

        if (gameStarted && musicEnabled) {
            playMainMusic();
        }

    }
);


/* =========================
   CANVAS RESIZE
========================= */

function resizeCanvas() {

    const rect =
        canvas.getBoundingClientRect();

    const width =
        Math.max(1, Math.floor(rect.width));

    const height =
        Math.max(1, Math.floor(rect.height));


    const devicePixelRatio =
        window.devicePixelRatio || 1;


    canvas.width =
        width * devicePixelRatio;

    canvas.height =
        height * devicePixelRatio;


    ctx.setTransform(
        devicePixelRatio,
        0,
        0,
        devicePixelRatio,
        0,
        0
    );


    cellWidth =
        width / GRID_SIZE;

    cellHeight =
        height / GRID_SIZE;


    draw();
}


/* =========================
   INITIAL SNAKE
========================= */

function createSnake() {

    snake = [

        {
            x: 10,
            y: 10
        },

        {
            x: 9,
            y: 10
        },

        {
            x: 8,
            y: 10
        }

    ];
}


/* =========================
   RANDOM FOOD
========================= */

function randomFoodPosition() {

    let position;

    let valid = false;


    while (!valid) {

        position = {

            x:
                Math.floor(
                    Math.random() * GRID_SIZE
                ),

            y:
                Math.floor(
                    Math.random() * GRID_SIZE
                )

        };


        valid =
            !snake.some(
                part =>
                    part.x === position.x &&
                    part.y === position.y
            );


        if (valid) {

            valid =
                !foods.some(
                    food =>
                        food.x === position.x &&
                        food.y === position.y
                );

        }

    }


    return position;
}


/* =========================
   CREATE FOODS
========================= */

function createFoods() {

    foods = [];


    for (
        let i = 0;
        i < FOOD_COUNT;
        i++
    ) {

        const position =
            randomFoodPosition();


        foods.push({

            x: position.x,

            y: position.y,

            color:
                foodColors[
                    i % foodColors.length
                ]

        });

    }

}


/* =========================
   RESET GAME
========================= */

function resetGame() {

    clearTimeout(gameLoop);


    score = 0;

    speed = MIN_SPEED;


    direction = {
        x: 1,
        y: 0
    };


    nextDirection = {
        x: 1,
        y: 0
    };


    createSnake();

    createFoods();


    scoreElement.textContent =
        score;

    speedElement.textContent =
        speed;


    finalScoreElement.textContent =
        score;


    gameOverElement.classList.remove(
        "show"
    );


    gameRunning = true;


    draw();

    gameTick();

}


/* =========================
   CHANGE DIRECTION
========================= */

function changeDirection(
    newX,
    newY
) {

    if (
        newX === -direction.x &&
        newY === -direction.y
    ) {
        return;
    }


    nextDirection = {
        x: newX,
        y: newY
    };

}


/* =========================
   GAME TICK
========================= */

function gameTick() {

    if (!gameRunning) {
        return;
    }


    direction = {
        ...nextDirection
    };


    const head = snake[0];


    const newHead = {

        x:
            head.x + direction.x,

        y:
            head.y + direction.y

    };


    /* WALL COLLISION */

    if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
    ) {

        endGame();

        return;

    }


    /* SELF COLLISION */

    const hitSelf =
        snake.some(
            part =>
                part.x === newHead.x &&
                part.y === newHead.y
        );


    if (hitSelf) {

        endGame();

        return;

    }


    snake.unshift(newHead);


    /* FOOD CHECK */

    let foodIndex =
        foods.findIndex(
            food =>
                food.x === newHead.x &&
                food.y === newHead.y
        );


    if (foodIndex !== -1) {

        score++;

        speed =
            Math.min(
                MIN_SPEED +
                    Math.floor(score / 2),
                MAX_SPEED
            );


        scoreElement.textContent =
            score;

        speedElement.textContent =
            speed;


        playCoinSound();


        foods.splice(
            foodIndex,
            1
        );


        foods.push({

            ...randomFoodPosition(),

            color:
                foodColors[
                    Math.floor(
                        Math.random() *
                        foodColors.length
                    )
                ]

        });


        showNotification();

    } else {

        snake.pop();

    }


    draw();


    const delay =
        Math.max(
            45,
            180 -
                speed * 7
        );


    gameLoop =
        setTimeout(
            gameTick,
            delay
        );

}


/* =========================
   DRAW GAME
========================= */

function draw() {

    const width =
        canvas.clientWidth;

    const height =
        canvas.clientHeight;


    if (
        width <= 0 ||
        height <= 0
    ) {
        return;
    }


    /* BACKGROUND */

    ctx.fillStyle =
        "#020617";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    drawGrid();

    drawFoods();

    drawSnake();

}


/* =========================
   DRAW GRID
========================= */

function drawGrid() {

    const width =
        canvas.clientWidth;

    const height =
        canvas.clientHeight;


    ctx.strokeStyle =
        "rgba(56, 189, 248, 0.08)";

    ctx.lineWidth = 1;


    for (
        let x = 0;
        x <= GRID_SIZE;
        x++
    ) {

        const px =
            x * cellWidth;

        ctx.beginPath();

        ctx.moveTo(
            px,
            0
        );

        ctx.lineTo(
            px,
            height
        );

        ctx.stroke();

    }


    for (
        let y = 0;
        y <= GRID_SIZE;
        y++
    ) {

        const py =
            y * cellHeight;

        ctx.beginPath();

        ctx.moveTo(
            0,
            py
        );

        ctx.lineTo(
            width,
            py
        );

        ctx.stroke();

    }

}


/* =========================
   DRAW FOODS
========================= */

function drawFoods() {

    foods.forEach(
        food => {

            const centerX =
                food.x * cellWidth +
                cellWidth / 2;

            const centerY =
                food.y * cellHeight +
                cellHeight / 2;


            const radius =
                Math.min(
                    cellWidth,
                    cellHeight
                ) * 0.28;


            /* GLOW */

            ctx.beginPath();

            ctx.arc(
                centerX,
                centerY,
                radius * 1.8,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                food.color.replace(
                    ")",
                    ", 0.15)"
                );


            ctx.shadowColor =
                food.color;

            ctx.shadowBlur = 15;

            ctx.fill();

            ctx.shadowBlur = 0;


            /* FOOD */

            ctx.beginPath();

            ctx.arc(
                centerX,
                centerY,
                radius,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                food.color;

            ctx.fill();


            /* HIGHLIGHT */

            ctx.beginPath();

            ctx.arc(
                centerX - radius * 0.3,
                centerY - radius * 0.3,
                radius * 0.25,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                "rgba(255,255,255,0.75)";

            ctx.fill();

        }
    );

}


/* =========================
   DRAW SNAKE
========================= */

function drawSnake() {

    const snakeColor =
        getSnakeColor();


    snake.forEach(
        (part, index) => {

            const x =
                part.x * cellWidth;

            const y =
                part.y * cellHeight;


            /*
             * SEDIKIT OVERLAP
             * AGAR BADAN ULAR
             * SALING MENYAMBUNG
             */

            const overlap = 0.8;


            ctx.fillStyle =
                snakeColor;


            ctx.fillRect(

                x - overlap / 2,

                y - overlap / 2,

                cellWidth + overlap,

                cellHeight + overlap

            );


            /* HEAD */

            if (index === 0) {

                ctx.fillStyle =
                    "#e2e8f0";


                const eyeSize =
                    Math.max(
                        3,
                        Math.min(
                            cellWidth,
                            cellHeight
                        ) * 0.12
                    );


                let eye1X;
                let eye1Y;
                let eye2X;
                let eye2Y;


                if (direction.x === 1) {

                    eye1X =
                        x +
                        cellWidth * 0.68;

                    eye2X =
                        x +
                        cellWidth * 0.68;

                    eye1Y =
                        y +
                        cellHeight * 0.30;

                    eye2Y =
                        y +
                        cellHeight * 0.70;

                } else if (direction.x === -1) {

                    eye1X =
                        x +
                        cellWidth * 0.32;

                    eye2X =
                        x +
                        cellWidth * 0.32;

                    eye1Y =
                        y +
                        cellHeight * 0.30;

                    eye2Y =
                        y +
                        cellHeight * 0.70;

                } else if (direction.y === -1) {

                    eye1X =
                        x +
                        cellWidth * 0.30;

                    eye2X =
                        x +
                        cellWidth * 0.70;

                    eye1Y =
                        y +
                        cellHeight * 0.32;

                    eye2Y =
                        y +
                        cellHeight * 0.32;

                } else {

                    eye1X =
                        x +
                        cellWidth * 0.30;

                    eye2X =
                        x +
                        cellWidth * 0.70;

                    eye1Y =
                        y +
                        cellHeight * 0.68;

                    eye2Y =
                        y +
                        cellHeight * 0.68;

                }


                ctx.fillStyle =
                    "#ffffff";


                ctx.fillRect(
                    eye1X - eyeSize / 2,
                    eye1Y - eyeSize / 2,
                    eyeSize,
                    eyeSize
                );


                ctx.fillRect(
                    eye2X - eyeSize / 2,
                    eye2Y - eyeSize / 2,
                    eyeSize,
                    eyeSize
                );


                ctx.fillStyle =
                    "#020617";


                const pupilSize =
                    eyeSize * 0.55;


                ctx.fillRect(
                    eye1X - pupilSize / 2,
                    eye1Y - pupilSize / 2,
                    pupilSize,
                    pupilSize
                );


                ctx.fillRect(
                    eye2X - pupilSize / 2,
                    eye2Y - pupilSize / 2,
                    pupilSize,
                    pupilSize
                );

            }

        }
    );

}


/* =========================
   NOTIFICATION
========================= */

function showNotification() {

    if (score % 10 === 0) {

        notification.textContent =
            "PERFECT!";

    } else if (score % 5 === 0) {

        notification.textContent =
            "GREAT!";

    } else {

        notification.textContent =
            "NICE!";

    }


    notification.classList.remove(
        "show"
    );


    void notification.offsetWidth;


    notification.classList.add(
        "show"
    );

}


/* =========================
   GAME OVER
========================= */

function endGame() {

    gameRunning = false;

    clearTimeout(gameLoop);


    finalScoreElement.textContent =
        score;


    gameOverElement.classList.add(
        "show"
    );


    playGameOverSound();

}


/* =========================
   RESTART
========================= */

function restartGame() {

    playMainMusic();

    resetGame();

}


restartButton.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        restartGame();

    }
);


/* =========================
   KEYBOARD
========================= */

document.addEventListener(
    "keydown",
    function (event) {

        const key =
            event.key.toLowerCase();


        if (key === "arrowup" || key === "w") {

            event.preventDefault();

            changeDirection(0, -1);

        }


        else if (
            key === "arrowdown" ||
            key === "s"
        ) {

            event.preventDefault();

            changeDirection(0, 1);

        }


        else if (
            key === "arrowleft" ||
            key === "a"
        ) {

            event.preventDefault();

            changeDirection(-1, 0);

        }


        else if (
            key === "arrowright" ||
            key === "d"
        ) {

            event.preventDefault();

            changeDirection(1, 0);

        }


        else if (
            event.code === "Space"
        ) {

            event.preventDefault();


            if (!gameStarted) {

                startGame();

            } else if (!gameRunning) {

                restartGame();

            }

        }

    }
);


/* =========================
   SWIPE
========================= */

let touchStartX = 0;

let touchStartY = 0;


canvas.addEventListener(
    "touchstart",
    function (event) {

        const touch =
            event.touches[0];


        touchStartX =
            touch.clientX;

        touchStartY =
            touch.clientY;

    },
    {
        passive: true
    }
);


canvas.addEventListener(
    "touchend",
    function (event) {

        const touch =
            event.changedTouches[0];


        const dx =
            touch.clientX -
            touchStartX;

        const dy =
            touch.clientY -
            touchStartY;


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

                changeDirection(1, 0);

            } else {

                changeDirection(-1, 0);

            }

        } else {

            if (dy > 0) {

                changeDirection(0, 1);

            } else {

                changeDirection(0, -1);

            }

        }

    },
    {
        passive: true
    }
);


/* =========================
   JOYSTICK
========================= */

let joystickActive = false;

let joystickPointerId = null;


function resetJoystick() {

    joystickActive = false;

    joystickPointerId = null;


    joystickStick.style.transform =
        "translate(-50%, -50%)";

}


function handleJoystick(
    clientX,
    clientY
) {

    const rect =
        joystick.getBoundingClientRect();


    const centerX =
        rect.left +
        rect.width / 2;

    const centerY =
        rect.top +
        rect.height / 2;


    let dx =
        clientX - centerX;

    let dy =
        clientY - centerY;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    const maxDistance =
        rect.width / 2 -
        25;


    if (distance > maxDistance) {

        const ratio =
            maxDistance / distance;

        dx *= ratio;

        dy *= ratio;

    }


    joystickStick.style.transform =
        `translate(
            calc(-50% + ${dx}px),
            calc(-50% + ${dy}px)
        )`;


    if (
        Math.abs(dx) >
        Math.abs(dy)
    ) {

        if (dx > 12) {

            changeDirection(1, 0);

        } else if (dx < -12) {

            changeDirection(-1, 0);

        }

    } else {

        if (dy > 12) {

            changeDirection(0, 1);

        } else if (dy < -12) {

            changeDirection(0, -1);

        }

    }

}


joystick.addEventListener(
    "pointerdown",
    function (event) {

        event.preventDefault();


        joystickActive = true;

        joystickPointerId =
            event.pointerId;


        joystick.setPointerCapture(
            event.pointerId
        );


        handleJoystick(
            event.clientX,
            event.clientY
        );


        playMainMusic();

    }
);


joystick.addEventListener(
    "pointermove",
    function (event) {

        if (
            !joystickActive ||
            event.pointerId !==
                joystickPointerId
        ) {
            return;
        }


        event.preventDefault();


        handleJoystick(
            event.clientX,
            event.clientY
        );

    }
);


joystick.addEventListener(
    "pointerup",
    function (event) {

        if (
            event.pointerId !==
            joystickPointerId
        ) {
            return;
        }


        resetJoystick();

    }
);


joystick.addEventListener(
    "pointercancel",
    function () {

        resetJoystick();

    }
);


/* =========================
   LOADING SCREEN
========================= */

let loadingValue = 0;

let loadingTimer = null;


const loadingMessages = [

    "INITIALIZING...",

    "LOADING GAME...",

    "PREPARING SNAKE...",

    "CONNECTING...",

    "READY!"

];


function startLoading() {

    loadingValue = 0;


    loadingTimer =
        setInterval(
            function () {

                loadingValue += 2;


                if (
                    loadingValue > 100
                ) {

                    loadingValue = 100;

                }


                loadingProgress.style.width =
                    loadingValue + "%";


                loadingPercent.textContent =
                    loadingValue + "%";


                const messageIndex =
                    Math.min(
                        Math.floor(
                            loadingValue / 25
                        ),
                        loadingMessages.length - 1
                    );


                loadingText.textContent =
                    loadingMessages[
                        messageIndex
                    ];


                if (
                    loadingValue >= 100
                ) {

                    clearInterval(
                        loadingTimer
                    );


                    setTimeout(
                        startGame,
                        300
                    );

                }

            },
            40
        );

}


/* =========================
   START GAME
========================= */

function startGame() {

    if (gameStarted) {
        return;
    }


    gameStarted = true;


    clearInterval(
        loadingTimer
    );


    splashScreen.style.display =
        "none";


    gameContainer.style.display =
        "flex";


    resizeCanvas();


    resetGame();


    playMainMusic();

}


/* =========================
   WINDOW RESIZE
========================= */

window.addEventListener(
    "resize",
    function () {

        if (gameStarted) {

            resizeCanvas();

        }

    }
);


/* =========================
   START
========================= */

startLoading();