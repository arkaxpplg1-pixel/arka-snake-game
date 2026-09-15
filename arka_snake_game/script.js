/* =========================================
   ARKA SNAKE GAME
========================================= */


/* =========================================
   ELEMENT
========================================= */

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");

const splashScreen =
    document.getElementById("splashScreen");

const gameContainer =
    document.getElementById("gameContainer");

const scoreElement =
    document.getElementById("score");

const speedElement =
    document.getElementById("speed");

const finalScoreElement =
    document.getElementById("finalScore");

const notification =
    document.getElementById("notification");

const gameOverScreen =
    document.getElementById("gameOver");

const restartButton =
    document.getElementById("restartButton");

const musicButton =
    document.getElementById("musicButton");

const loadingProgress =
    document.getElementById("loadingProgress");

const loadingText =
    document.getElementById("loadingText");

const loadingPercent =
    document.getElementById("loadingPercent");

const joystick =
    document.getElementById("joystick");

const joystickStick =
    document.getElementById("joystickStick");


/* =========================================
   AUDIO
========================================= */

const mainMusic =
    document.getElementById("mainMusic");

const coinSound =
    document.getElementById("coinSound");

const gameOverSound =
    document.getElementById("gameOverSound");


let musicEnabled = true;


/* VOLUME */

mainMusic.volume = 0.35;

coinSound.volume = 0.8;

gameOverSound.volume = 0.85;


/* =========================================
   AUDIO FUNCTION
========================================= */

function playMainMusic() {

    if (!musicEnabled) {
        return;
    }

    const promise =
        mainMusic.play();

    if (promise !== undefined) {

        promise.catch(() => {

            console.log(
                "Autoplay diblokir browser."
            );

        });
    }
}


function stopMainMusic() {

    mainMusic.pause();

    mainMusic.currentTime = 0;
}


function playCoinSound() {

    /*
        Tidak dipengaruhi MUSIC ON/OFF.
    */

    coinSound.pause();

    coinSound.currentTime = 0;

    const promise =
        coinSound.play();

    if (promise !== undefined) {

        promise.catch(() => {});
    }
}


function playGameOverSound() {

    /*
        Tidak dipengaruhi MUSIC ON/OFF.
    */

    gameOverSound.pause();

    gameOverSound.currentTime = 0;

    const promise =
        gameOverSound.play();

    if (promise !== undefined) {

        promise.catch(() => {});
    }
}


/* =========================================
   MUSIC BUTTON
========================================= */

function updateMusicButton() {

    if (musicEnabled) {

        musicButton.textContent =
            "🔊 MUSIC ON";

        musicButton.classList.remove(
            "off"
        );

    } else {

        musicButton.textContent =
            "🔇 MUSIC OFF";

        musicButton.classList.add(
            "off"
        );
    }
}


musicButton.addEventListener(
    "click",
    function () {

        musicEnabled =
            !musicEnabled;


        updateMusicButton();


        if (musicEnabled) {

            playMainMusic();

        } else {

            stopMainMusic();
        }

    }
);


updateMusicButton();


/* =========================================
   GAME SETTINGS
========================================= */

const GRID_SIZE = 20;

const FOOD_COUNT = 8;

let cellSize = 20;

let snake = [];

let foods = [];

let score = 0;

let speed = 5;


let direction = {
    x: 1,
    y: 0
};


let nextDirection = {
    x: 1,
    y: 0
};


let gameRunning = false;

let gameOver = false;

let gameLoopTimer = null;


/* =========================================
   FOOD COLORS
========================================= */

const foodColors = [

    "#ff4d6d",
    "#ffd166",
    "#06d6a0",
    "#4dabf7",
    "#c77dff",
    "#ff9f1c",
    "#00f5d4",
    "#f72585"

];


/* =========================================
   RESIZE CANVAS
========================================= */

function resizeCanvas() {

    const rect =
        canvas.getBoundingClientRect();

    const size =
        Math.min(
            rect.width,
            rect.height
        );


    canvas.width = size;

    canvas.height = size;

    cellSize =
        size / GRID_SIZE;
}


/* =========================================
   CREATE SNAKE
========================================= */

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


/* =========================================
   RANDOM FOOD
========================================= */

function randomFoodPosition() {

    let position;


    do {

        position = {

            x:
                Math.floor(
                    Math.random() *
                    GRID_SIZE
                ),

            y:
                Math.floor(
                    Math.random() *
                    GRID_SIZE
                )

        };

    } while (

        snake.some(
            part =>

                part.x === position.x &&
                part.y === position.y
        )
    );


    return position;
}


/* =========================================
   CREATE FOOD
========================================= */

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
                    i %
                    foodColors.length
                ]

        });
    }
}


/* =========================================
   RESET GAME
========================================= */

function resetGame() {

    clearTimeout(gameLoopTimer);


    score = 0;

    speed = 5;


    direction = {
        x: 1,
        y: 0
    };


    nextDirection = {
        x: 1,
        y: 0
    };


    gameOver = false;

    gameRunning = true;


    scoreElement.textContent =
        score;

    speedElement.textContent =
        speed;


    gameOverScreen.style.display =
        "none";


    createSnake();

    createFoods();

    resizeCanvas();

    draw();

    startGameLoop();
}


/* =========================================
   SPEED
========================================= */

function updateSpeed() {

    speed =
        Math.min(
            5 +
            Math.floor(
                score / 2
            ),
            20
        );


    speedElement.textContent =
        speed;
}


/* =========================================
   SNAKE COLOR
========================================= */

function getSnakeColor() {

    if (score >= 15) {

        return "#ff4d6d";

    }

    if (score >= 10) {

        return "#ffd166";

    }

    if (score >= 5) {

        return "#36a8ff";
    }


    return "#20d86b";
}


/* =========================================
   DRAW BACKGROUND
========================================= */

function drawBackground() {

    ctx.fillStyle =
        "#07101c";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* GRID */

    ctx.strokeStyle =
        "rgba(60, 100, 140, 0.12)";

    ctx.lineWidth = 1;


    for (
        let i = 0;
        i <= GRID_SIZE;
        i++
    ) {

        const position =
            i * cellSize;


        ctx.beginPath();

        ctx.moveTo(
            position,
            0
        );

        ctx.lineTo(
            position,
            canvas.height
        );

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            0,
            position
        );

        ctx.lineTo(
            canvas.width,
            position
        );

        ctx.stroke();
    }
}


/* =========================================
   DRAW FOOD
========================================= */

function drawFoods() {

    foods.forEach(
        food => {

            const centerX =
                food.x *
                cellSize +
                cellSize / 2;


            const centerY =
                food.y *
                cellSize +
                cellSize / 2;


            const radius =
                cellSize * 0.3;


            ctx.shadowBlur = 15;

            ctx.shadowColor =
                food.color;

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


            ctx.shadowBlur = 0;


            /* HIGHLIGHT */

            ctx.fillStyle =
                "rgba(255,255,255,0.7)";


            ctx.beginPath();

            ctx.arc(

                centerX -
                    radius * 0.3,

                centerY -
                    radius * 0.3,

                radius * 0.25,

                0,

                Math.PI * 2

            );

            ctx.fill();

        }
    );


    ctx.shadowBlur = 0;
}


/* =========================================
   DRAW SNAKE
========================================= */

function drawSnake() {

    const snakeColor =
        getSnakeColor();


    /*
        Setiap bagian ular dibuat kotak
        tanpa border-radius.

        Ukurannya sedikit diperbesar
        supaya antar bagian benar-benar
        menyatu.
    */

    snake.forEach(
        (part, index) => {

            const x =
                part.x * cellSize;

            const y =
                part.y * cellSize;


            /*
                Tidak ada jarak antar
                tubuh ular.
            */

            const overlap =
                0.8;


            ctx.fillStyle =
                snakeColor;


            ctx.shadowBlur =
                index === 0 ? 12 : 5;

            ctx.shadowColor =
                snakeColor;


            /*
                RECTANGLE TANPA RADIUS
            */

            ctx.fillRect(

                x - overlap / 2,

                y - overlap / 2,

                cellSize + overlap,

                cellSize + overlap

            );


            ctx.shadowBlur = 0;


            /*
                HEAD EYES
            */

            if (index === 0) {

                drawSnakeEyes(
                    x,
                    y
                );
            }

        }
    );
}


/* =========================================
   DRAW SNAKE EYES
========================================= */

function drawSnakeEyes(
    x,
    y
) {

    const eyeSize =
        Math.max(
            2,
            cellSize * 0.1
        );


    let eye1X;
    let eye1Y;

    let eye2X;
    let eye2Y;


    if (direction.x === 1) {

        eye1X =
            x +
            cellSize * 0.7;

        eye1Y =
            y +
            cellSize * 0.3;


        eye2X =
            x +
            cellSize * 0.7;

        eye2Y =
            y +
            cellSize * 0.7;


    } else if (
        direction.x === -1
    ) {

        eye1X =
            x +
            cellSize * 0.3;

        eye1Y =
            y +
            cellSize * 0.3;


        eye2X =
            x +
            cellSize * 0.3;

        eye2Y =
            y +
            cellSize * 0.7;


    } else if (
        direction.y === -1
    ) {

        eye1X =
            x +
            cellSize * 0.3;

        eye1Y =
            y +
            cellSize * 0.3;


        eye2X =
            x +
            cellSize * 0.7;

        eye2Y =
            y +
            cellSize * 0.3;


    } else {

        eye1X =
            x +
            cellSize * 0.3;

        eye1Y =
            y +
            cellSize * 0.7;


        eye2X =
            x +
            cellSize * 0.7;

        eye2Y =
            y +
            cellSize * 0.7;
    }


    ctx.fillStyle =
        "#ffffff";


    ctx.beginPath();

    ctx.arc(
        eye1X,
        eye1Y,
        eyeSize,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        eye2X,
        eye2Y,
        eyeSize,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


/* =========================================
   DRAW GAME
========================================= */

function draw() {

    drawBackground();

    drawFoods();

    drawSnake();
}


/* =========================================
   CHANGE DIRECTION
========================================= */

function changeDirection(
    newDirection
) {

    if (!gameRunning) {
        return;
    }


    /*
        Mencegah ular berbalik
        langsung ke belakang.
    */

    if (

        newDirection.x ===
            -direction.x &&

        newDirection.y ===
            -direction.y

    ) {

        return;
    }


    nextDirection =
        newDirection;
}


/* =========================================
   MOVE SNAKE
========================================= */

function moveSnake() {

    direction =
        nextDirection;


    const head =
        snake[0];


    const newHead = {

        x:
            head.x +
            direction.x,

        y:
            head.y +
            direction.y

    };


    /* WALL */

    if (

        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE

    ) {

        endGame();

        return;
    }


    /* SELF */

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


    snake.unshift(
        newHead
    );


    /* FOOD */

    const foodIndex =
        foods.findIndex(
            food =>

                food.x ===
                    newHead.x &&

                food.y ===
                    newHead.y
        );


    if (foodIndex !== -1) {

        eatFood(
            foodIndex
        );

    } else {

        snake.pop();
    }


    draw();
}


/* =========================================
   EAT FOOD
========================================= */

function eatFood(
    foodIndex
) {

    score++;


    scoreElement.textContent =
        score;


    /* SOUND */

    playCoinSound();


    /* SPEED */

    updateSpeed();


    /* NOTIFICATION */

    if (score % 10 === 0) {

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


    /* REMOVE FOOD */

    foods.splice(
        foodIndex,
        1
    );


    /* NEW FOOD */

    const position =
        randomFoodPosition();


    foods.push({

        x: position.x,

        y: position.y,

        color:
            foodColors[
                Math.floor(
                    Math.random() *
                    foodColors.length
                )
            ]

    });
}


/* =========================================
   NOTIFICATION
========================================= */

function showNotification(
    text
) {

    notification.textContent =
        text;


    notification.classList.remove(
        "show"
    );


    void notification.offsetWidth;


    notification.classList.add(
        "show"
    );
}


/* =========================================
   GAME OVER
========================================= */

function endGame() {

    if (gameOver) {
        return;
    }


    gameOver = true;

    gameRunning = false;


    clearTimeout(
        gameLoopTimer
    );


    finalScoreElement.textContent =
        score;


    gameOverScreen.style.display =
        "flex";


    /*
        Matikan musik utama.
    */

    stopMainMusic();


    /*
        Game over sound
        tetap berbunyi.
    */

    playGameOverSound();
}


/* =========================================
   GAME LOOP
========================================= */

function startGameLoop() {

    clearTimeout(
        gameLoopTimer
    );


    if (!gameRunning) {
        return;
    }


    const delay =
        Math.max(
            45,
            180 -
                speed * 7
        );


    gameLoopTimer =
        setTimeout(
            function () {

                moveSnake();

                startGameLoop();

            },
            delay
        );
}


/* =========================================
   KEYBOARD
========================================= */

document.addEventListener(
    "keydown",
    function (event) {

        const key =
            event.key.toLowerCase();


        if (
            key === "arrowup" ||
            key === "w"
        ) {

            event.preventDefault();


            changeDirection({

                x: 0,
                y: -1

            });


        } else if (
            key === "arrowdown" ||
            key === "s"
        ) {

            event.preventDefault();


            changeDirection({

                x: 0,
                y: 1

            });


        } else if (
            key === "arrowleft" ||
            key === "a"
        ) {

            event.preventDefault();


            changeDirection({

                x: -1,
                y: 0

            });


        } else if (
            key === "arrowright" ||
            key === "d"
        ) {

            event.preventDefault();


            changeDirection({

                x: 1,
                y: 0

            });
        }


        /* SPACE */

        if (
            event.code === "Space"
        ) {

            event.preventDefault();


            if (!gameRunning) {

                resetGame();

                playMainMusic();
            }
        }

    }
);


/* =========================================
   RESTART BUTTON
========================================= */

restartButton.addEventListener(
    "click",
    function () {

        resetGame();

        playMainMusic();

    }
);


/* =========================================
   SWIPE
========================================= */

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


        if (

            Math.abs(dx) < 20 &&
            Math.abs(dy) < 20

        ) {

            return;
        }


        if (
            Math.abs(dx) >
            Math.abs(dy)
        ) {

            if (dx > 0) {

                changeDirection({

                    x: 1,
                    y: 0

                });

            } else {

                changeDirection({

                    x: -1,
                    y: 0

                });
            }

        } else {

            if (dy > 0) {

                changeDirection({

                    x: 0,
                    y: 1

                });

            } else {

                changeDirection({

                    x: 0,
                    y: -1

                });
            }
        }

    },
    {
        passive: true
    }
);


/* =========================================
   JOYSTICK
========================================= */

let joystickActive = false;


function resetJoystick() {

    joystickStick.style.left =
        "50%";

    joystickStick.style.top =
        "50%";
}


function handleJoystick(
    event
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
        event.clientX -
        centerX;


    let dy =
        event.clientY -
        centerY;


    const maxDistance =
        rect.width / 2 -
        28;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (
        distance > maxDistance
    ) {

        const ratio =
            maxDistance /
            distance;


        dx *= ratio;

        dy *= ratio;
    }


    joystickStick.style.left =
        `calc(50% + ${dx}px)`;


    joystickStick.style.top =
        `calc(50% + ${dy}px)`;


    /* DEAD ZONE */

    if (distance < 15) {
        return;
    }


    if (
        Math.abs(dx) >
        Math.abs(dy)
    ) {

        if (dx > 0) {

            changeDirection({

                x: 1,
                y: 0

            });

        } else {

            changeDirection({

                x: -1,
                y: 0

            });
        }

    } else {

        if (dy > 0) {

            changeDirection({

                x: 0,
                y: 1

            });

        } else {

            changeDirection({

                x: 0,
                y: -1

            });
        }
    }
}


joystick.addEventListener(
    "pointerdown",
    function (event) {

        joystickActive = true;


        joystick.setPointerCapture(
            event.pointerId
        );


        handleJoystick(event);
    }
);


joystick.addEventListener(
    "pointermove",
    function (event) {

        if (!joystickActive) {
            return;
        }


        handleJoystick(event);
    }
);


joystick.addEventListener(
    "pointerup",
    function () {

        joystickActive = false;

        resetJoystick();
    }
);


joystick.addEventListener(
    "pointercancel",
    function () {

        joystickActive = false;

        resetJoystick();
    }
);


/* =========================================
   LOADING SCREEN
========================================= */

let loadingValue = 0;

let loadingTimer = null;

let gameStarted = false;


function startLoading() {

    loadingValue = 0;


    loadingProgress.style.width =
        "0%";


    loadingPercent.textContent =
        "0%";


    loadingText.textContent =
        "INITIALIZING...";


    loadingTimer =
        setInterval(
            function () {

                loadingValue++;


                loadingProgress.style.width =
                    `${loadingValue}%`;


                loadingPercent.textContent =
                    `${loadingValue}%`;


                if (
                    loadingValue < 30
                ) {

                    loadingText.textContent =
                        "INITIALIZING...";

                } else if (
                    loadingValue < 60
                ) {

                    loadingText.textContent =
                        "LOADING GAME...";

                } else if (
                    loadingValue < 85
                ) {

                    loadingText.textContent =
                        "PREPARING SNAKE...";

                } else {

                    loadingText.textContent =
                        "READY...";
                }


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
            25
        );
}


/* =========================================
   START GAME
========================================= */

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


    resetGame();


    /*
        Coba jalankan musik.
    */

    playMainMusic();
}


/* =========================================
   SPACE SKIP
========================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (

            event.code === "Space" &&
            !gameStarted

        ) {

            event.preventDefault();

            startGame();
        }

    }
);


/* =========================================
   AUTOPLAY BACKUP
========================================= */

function startMusicAfterInteraction() {

    if (
        gameStarted &&
        musicEnabled
    ) {

        playMainMusic();
    }
}


document.addEventListener(
    "click",
    startMusicAfterInteraction,
    {
        once: true
    }
);


document.addEventListener(
    "touchstart",
    startMusicAfterInteraction,
    {
        once: true
    }
);


document.addEventListener(
    "keydown",
    startMusicAfterInteraction,
    {
        once: true
    }
);


/* =========================================
   RESIZE
========================================= */

window.addEventListener(
    "resize",
    function () {

        if (!gameStarted) {
            return;
        }


        resizeCanvas();

        draw();
    }
);


/* =========================================
   START APPLICATION
========================================= */

startLoading();