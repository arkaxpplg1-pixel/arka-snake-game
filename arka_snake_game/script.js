// ==========================================
// ARKA SNAKE GAME
// ==========================================


// ==========================================
// ELEMENT
// ==========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const splashScreen =
    document.getElementById("splashScreen");

const gameContainer =
    document.getElementById("gameContainer");

const loadingProgress =
    document.getElementById("loadingProgress");

const loadingPercent =
    document.getElementById("loadingPercent");

const loadingText =
    document.getElementById("loadingText");

const scoreText =
    document.getElementById("score");

const speedText =
    document.getElementById("speed");

const finalScoreText =
    document.getElementById("finalScore");

const notification =
    document.getElementById("notification");

const gameOverScreen =
    document.getElementById("gameOver");

const restartButton =
    document.getElementById("restartButton");


// ==========================================
// AUDIO
// ==========================================

const mainBackground =
    document.getElementById("mainBackground");

const coinSound =
    document.getElementById("coinSound");

const gameOverSound =
    document.getElementById("gameOverSound");

const musicButton =
    document.getElementById("musicButton");


let musicEnabled = true;


// Volume audio

mainBackground.volume = 0.35;
coinSound.volume = 0.75;
gameOverSound.volume = 0.85;



// ==========================================
// MUSIC CONTROL
// ==========================================

function playMainMusic() {

    if (!musicEnabled) {
        return;
    }

    mainBackground.currentTime = 0;

    const musicPromise =
        mainBackground.play();

    if (musicPromise !== undefined) {

        musicPromise.catch(() => {

            // Browser dapat memblokir autoplay.
            // Akan dicoba lagi setelah user melakukan
            // interaksi dengan halaman.

        });
    }
}


function stopMainMusic() {

    mainBackground.pause();

    mainBackground.currentTime = 0;
}


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


musicButton.addEventListener("click", () => {

    musicEnabled = !musicEnabled;

    updateMusicButton();

    if (musicEnabled) {

        mainBackground.play().catch(() => {});

    } else {

        stopMainMusic();
    }

});


// Jika browser sebelumnya memblokir autoplay,
// coba mulai setelah user menyentuh layar.

function retryMusicAfterInteraction() {

    if (
        musicEnabled &&
        gameRunning &&
        mainBackground.paused
    ) {

        mainBackground.play().catch(() => {});
    }
}


document.addEventListener(
    "pointerdown",
    retryMusicAfterInteraction,
    {
        once: false
    }
);


document.addEventListener(
    "keydown",
    retryMusicAfterInteraction,
    {
        once: false
    }
);



// ==========================================
// SOUND COIN
// ==========================================

function playCoinSound() {

    coinSound.pause();

    coinSound.currentTime = 0;

    coinSound.play().catch(() => {});
}



// ==========================================
// SOUND GAME OVER
// ==========================================

function playGameOverSound() {

    gameOverSound.pause();

    gameOverSound.currentTime = 0;

    gameOverSound.play().catch(() => {});
}



// ==========================================
// PENGATURAN GAME
// ==========================================

const GRID_SIZE = 20;

const FOOD_COUNT = 8;


let canvasWidth = 800;
let canvasHeight = 600;


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

let speed = 5;


let gameRunning = false;

let gameOver = false;


let lastTime = 0;

let moveTimer = 0;



// ==========================================
// WARNA MAKANAN
// ==========================================

const FOOD_COLORS = [

    "#ff4f81",
    "#ffb347",
    "#ffe066",
    "#4dff88",
    "#36d9ff",
    "#6d7cff",
    "#c66cff",
    "#ff66d9"

];



// ==========================================
// WARNA ULAR BERDASARKAN SKOR
// ==========================================

function getSnakeColor() {

    if (score >= 15) {

        return "#b94cff";
    }


    if (score >= 10) {

        return "#ff4fa3";
    }


    if (score >= 5) {

        return "#36d9ff";
    }


    return "#20b978";
}



// ==========================================
// RESIZE CANVAS
// ==========================================

function resizeCanvas() {

    const area =
        document.getElementById("gameArea");


    canvasWidth =
        Math.floor(
            area.clientWidth / GRID_SIZE
        ) * GRID_SIZE;


    canvasHeight =
        Math.floor(
            area.clientHeight / GRID_SIZE
        ) * GRID_SIZE;


    if (
        canvasWidth <
        GRID_SIZE * 10
    ) {

        canvasWidth =
            GRID_SIZE * 10;
    }


    if (
        canvasHeight <
        GRID_SIZE * 8
    ) {

        canvasHeight =
            GRID_SIZE * 8;
    }


    canvas.width =
        canvasWidth;

    canvas.height =
        canvasHeight;


    // Pastikan ular tetap berada
    // di dalam canvas.

    snake.forEach(part => {

        part.x =
            Math.max(
                0,
                Math.min(
                    part.x,
                    canvasWidth - GRID_SIZE
                )
            );


        part.y =
            Math.max(
                0,
                Math.min(
                    part.y,
                    canvasHeight - GRID_SIZE
                )
            );

    });

}



// ==========================================
// MEMBUAT ULAR
// ==========================================

function createSnake() {

    const centerX =
        Math.floor(
            canvasWidth /
            2 /
            GRID_SIZE
        ) * GRID_SIZE;


    const centerY =
        Math.floor(
            canvasHeight /
            2 /
            GRID_SIZE
        ) * GRID_SIZE;


    snake = [

        {
            x: centerX,
            y: centerY
        },

        {
            x:
                centerX -
                GRID_SIZE,

            y: centerY
        },

        {
            x:
                centerX -
                GRID_SIZE * 2,

            y: centerY
        }

    ];
}



// ==========================================
// RANDOM POSITION
// ==========================================

function randomPosition() {

    const columns =
        Math.floor(
            canvasWidth /
            GRID_SIZE
        );


    const rows =
        Math.floor(
            canvasHeight /
            GRID_SIZE
        );


    return {

        x:
            Math.floor(
                Math.random() *
                columns
            ) * GRID_SIZE,


        y:
            Math.floor(
                Math.random() *
                rows
            ) * GRID_SIZE

    };
}



// ==========================================
// CEK POSISI
// ==========================================

function positionIsFree(position) {

    for (const part of snake) {

        if (
            part.x === position.x &&
            part.y === position.y
        ) {

            return false;
        }
    }


    for (const food of foods) {

        if (
            food.x === position.x &&
            food.y === position.y
        ) {

            return false;
        }
    }


    return true;
}



// ==========================================
// MEMBUAT MAKANAN
// ==========================================

function createFoods() {

    foods = [];


    while (
        foods.length <
        FOOD_COUNT
    ) {

        const position =
            randomPosition();


        if (
            positionIsFree(position)
        ) {

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
}



// ==========================================
// RESET GAME
// ==========================================

function resetGame() {

    resizeCanvas();

    createSnake();

    createFoods();


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


    moveTimer = 0;

    gameOver = false;

    gameRunning = true;


    scoreText.textContent =
        score;

    speedText.textContent =
        speed;


    finalScoreText.textContent =
        score;


    gameOverScreen.classList.remove(
        "show"
    );
}



// ==========================================
// CHANGE DIRECTION
// ==========================================

function changeDirection(x, y) {

    // Tidak boleh langsung berbalik
    // ke arah berlawanan.

    if (
        direction.x === -x &&
        direction.y === -y
    ) {

        return;
    }


    if (
        nextDirection.x === -x &&
        nextDirection.y === -y
    ) {

        return;
    }


    nextDirection = {
        x: x,
        y: y
    };
}



// ==========================================
// UPDATE GAME
// ==========================================

function updateGame() {

    if (!gameRunning) {
        return;
    }


    direction =
        nextDirection;


    const head = snake[0];


    const newHead = {

        x:
            head.x +
            direction.x *
            GRID_SIZE,

        y:
            head.y +
            direction.y *
            GRID_SIZE

    };


    // ======================================
    // COLLISION DINDING
    // ======================================

    if (

        newHead.x < 0 ||

        newHead.x >= canvasWidth ||

        newHead.y < 0 ||

        newHead.y >= canvasHeight

    ) {

        endGame();

        return;
    }



    // ======================================
    // COLLISION BADAN
    // ======================================

    for (
        let i = 0;
        i < snake.length;
        i++
    ) {

        if (

            newHead.x === snake[i].x &&
            newHead.y === snake[i].y

        ) {

            endGame();

            return;
        }
    }



    snake.unshift(newHead);



    // ======================================
    // CEK MAKANAN
    // ======================================

    let ateFood = false;


    for (
        let i = 0;
        i < foods.length;
        i++
    ) {

        const food = foods[i];


        if (

            newHead.x === food.x &&
            newHead.y === food.y

        ) {

            ateFood = true;


            // Tambah score

            score++;


            // Tambah speed

            speed =
                Math.min(
                    5 +
                    Math.floor(score / 2),
                    20
                );


            scoreText.textContent =
                score;


            speedText.textContent =
                speed;


            // Suara coin
            // TIDAK dipengaruhi MUSIC ON/OFF

            playCoinSound();


            // Notifikasi

            showNotification();


            // Hapus makanan

            foods.splice(i, 1);


            // Buat makanan baru

            let newFood;

            do {

                newFood =
                    randomPosition();

            } while (
                !positionIsFree(newFood)
            );


            foods.push({

                x: newFood.x,

                y: newFood.y,

                color:
                    FOOD_COLORS[
                        Math.floor(
                            Math.random() *
                            FOOD_COLORS.length
                        )
                    ]

            });


            break;
        }
    }


    // Kalau tidak makan,
    // ekor dihapus.

    if (!ateFood) {

        snake.pop();
    }

}



// ==========================================
// DRAW GAME
// ==========================================

function drawGame() {

    ctx.clearRect(
        0,
        0,
        canvasWidth,
        canvasHeight
    );


    // ======================================
    // BACKGROUND
    // ======================================

    ctx.fillStyle =
        "#1e1e2d";

    ctx.fillRect(
        0,
        0,
        canvasWidth,
        canvasHeight
    );



    // ======================================
    // GRID
    // ======================================

    ctx.strokeStyle =
        "rgba(255,255,255,0.035)";

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



    // ======================================
    // FOOD
    // ======================================

    foods.forEach(food => {

        const centerX =
            food.x +
            GRID_SIZE / 2;


        const centerY =
            food.y +
            GRID_SIZE / 2;


        ctx.save();


        ctx.shadowColor =
            food.color;

        ctx.shadowBlur = 15;


        ctx.fillStyle =
            food.color;


        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            GRID_SIZE * 0.32,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.restore();

    });



    // ======================================
    // SNAKE
    // ======================================

    const snakeColor =
        getSnakeColor();


    snake.forEach(
        (part, index) => {

            const padding =
                index === 0
                    ? 1
                    : 2;


            ctx.fillStyle =
                index === 0
                    ? darkenColor(
                        snakeColor,
                        25
                    )
                    : snakeColor;


            ctx.shadowColor =
                snakeColor;

            ctx.shadowBlur =
                index === 0
                    ? 15
                    : 8;


            ctx.fillRect(

                part.x + padding,

                part.y + padding,

                GRID_SIZE -
                    padding * 2,

                GRID_SIZE -
                    padding * 2

            );


            ctx.shadowBlur = 0;


            // ==================================
            // MATA ULAR
            // ==================================

            if (index === 0) {

                drawSnakeEyes(part);
            }

        }
    );

}



// ==========================================
// DARKEN COLOR
// ==========================================

function darkenColor(
    hex,
    amount
) {

    let color =
        hex.replace("#", "");


    let r =
        parseInt(
            color.substring(0, 2),
            16
        );


    let g =
        parseInt(
            color.substring(2, 4),
            16
        );


    let b =
        parseInt(
            color.substring(4, 6),
            16
        );


    r = Math.max(
        0,
        r - amount
    );


    g = Math.max(
        0,
        g - amount
    );


    b = Math.max(
        0,
        b - amount
    );


    return `rgb(${r}, ${g}, ${b})`;
}



// ==========================================
// DRAW EYES
// ==========================================

function drawSnakeEyes(head) {

    ctx.fillStyle = "white";


    let eye1;
    let eye2;


    if (direction.x !== 0) {

        const eyeY =
            head.y + 5;

        const eyeY2 =
            head.y + 15;


        if (direction.x > 0) {

            eye1 = {
                x: head.x + 14,
                y: eyeY
            };

            eye2 = {
                x: head.x + 14,
                y: eyeY2
            };

        } else {

            eye1 = {
                x: head.x + 3,
                y: eyeY
            };

            eye2 = {
                x: head.x + 3,
                y: eyeY2
            };
        }

    } else {

        const eyeX =
            head.x + 5;

        const eyeX2 =
            head.x + 15;


        if (direction.y > 0) {

            eye1 = {
                x: eyeX,
                y: head.y + 14
            };

            eye2 = {
                x: eyeX2,
                y: head.y + 14
            };

        } else {

            eye1 = {
                x: eyeX,
                y: head.y + 3
            };

            eye2 = {
                x: eyeX2,
                y: head.y + 3
            };
        }
    }


    ctx.beginPath();

    ctx.arc(
        eye1.x,
        eye1.y,
        2.5,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        eye2.x,
        eye2.y,
        2.5,
        0,
        Math.PI * 2
    );

    ctx.fill();
}



// ==========================================
// NOTIFICATION
// ==========================================

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



// ==========================================
// GAME OVER
// ==========================================

function endGame() {

    gameRunning = false;

    gameOver = true;


    finalScoreText.textContent =
        score;


    gameOverScreen.classList.add(
        "show"
    );


    // Matikan musik utama.

    stopMainMusic();


    // Game Over sound tetap berbunyi
    // walaupun Music OFF.

    playGameOverSound();
}



// ==========================================
// GAME LOOP
// ==========================================

function gameLoop(timestamp) {

    if (!lastTime) {

        lastTime =
            timestamp;
    }


    const delta =
        timestamp -
        lastTime;


    lastTime =
        timestamp;


    if (gameRunning) {

        moveTimer += delta;


        const moveDelay =
            Math.max(
                45,
                180 -
                speed * 7
            );


        if (
            moveTimer >=
            moveDelay
        ) {

            moveTimer = 0;

            updateGame();
        }


        drawGame();
    }


    requestAnimationFrame(
        gameLoop
    );
}



// ==========================================
// KEYBOARD CONTROL
// ==========================================

document.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();


        if (
            key === "arrowup" ||
            key === "w"
        ) {

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


            if (gameOver) {

                resetGame();

                playMainMusic();
            }
        }

    }
);



// ==========================================
// RESTART BUTTON
// ==========================================

restartButton.addEventListener(
    "click",
    () => {

        resetGame();

        playMainMusic();

    }
);



// ==========================================
// SWIPE CONTROL
// ==========================================

let touchStartX = 0;
let touchStartY = 0;


canvas.addEventListener(
    "touchstart",
    event => {

        const touch =
            event.changedTouches[0];


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
    event => {

        const touch =
            event.changedTouches[0];


        const dx =
            touch.clientX -
            touchStartX;


        const dy =
            touch.clientY -
            touchStartY;


        const minSwipe =
            20;


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
                    1,
                    0
                );

            } else {

                changeDirection(
                    -1,
                    0
                );
            }

        } else {

            if (dy > 0) {

                changeDirection(
                    0,
                    1
                );

            } else {

                changeDirection(
                    0,
                    -1
                );
            }
        }

    },
    {
        passive: true
    }
);



// ==========================================
// JOYSTICK
// ==========================================

const joystickArea =
    document.getElementById(
        "joystickArea"
    );

const joystick =
    document.getElementById(
        "joystick"
    );

const joystickStick =
    document.getElementById(
        "joystickStick"
    );


let joystickActive = false;

let joystickPointerId = null;



// Batas gerakan stick

const JOYSTICK_LIMIT = 34;



function resetJoystick() {

    joystickActive = false;

    joystickPointerId = null;

    joystick.classList.remove(
        "active"
    );


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
        clientX -
        centerX;


    let dy =
        clientY -
        centerY;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (
        distance >
        JOYSTICK_LIMIT
    ) {

        const ratio =
            JOYSTICK_LIMIT /
            distance;


        dx *= ratio;

        dy *= ratio;
    }


    joystickStick.style.transform =
        `translate(
            calc(-50% + ${dx}px),
            calc(-50% + ${dy}px)
        )`;


    // Belum cukup jauh
    // untuk menentukan arah.

    if (
        distance < 15
    ) {

        return;
    }


    // Tentukan arah berdasarkan
    // gerakan terbesar.

    if (
        Math.abs(dx) >
        Math.abs(dy)
    ) {

        if (dx > 0) {

            changeDirection(
                1,
                0
            );

        } else {

            changeDirection(
                -1,
                0
            );
        }

    } else {

        if (dy > 0) {

            changeDirection(
                0,
                1
            );

        } else {

            changeDirection(
                0,
                -1
            );
        }
    }
}



// ==========================================
// JOYSTICK POINTER DOWN
// ==========================================

joystickArea.addEventListener(
    "pointerdown",
    event => {

        event.preventDefault();


        joystickActive = true;

        joystickPointerId =
            event.pointerId;


        joystick.setPointerCapture(
            event.pointerId
        );


        joystick.classList.add(
            "active"
        );


        handleJoystick(
            event.clientX,
            event.clientY
        );

    }
);



// ==========================================
// JOYSTICK POINTER MOVE
// ==========================================

joystickArea.addEventListener(
    "pointermove",
    event => {

        if (
            !joystickActive
        ) {

            return;
        }


        if (
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



// ==========================================
// JOYSTICK POINTER UP
// ==========================================

joystickArea.addEventListener(
    "pointerup",
    event => {

        if (
            event.pointerId ===
            joystickPointerId
        ) {

            resetJoystick();
        }

    }
);


joystickArea.addEventListener(
    "pointercancel",
    resetJoystick
);


joystickArea.addEventListener(
    "lostpointercapture",
    resetJoystick
);



// ==========================================
// START GAME
// ==========================================

function startGame() {

    splashScreen.style.display =
        "none";


    gameContainer.style.display =
        "flex";


    resizeCanvas();

    resetGame();


    // Mulai musik setelah
    // loading selesai.

    playMainMusic();
}



// ==========================================
// LOADING SCREEN
// ==========================================

let loadingValue = 0;

let loadingFinished = false;


const loadingMessages = [

    "INITIALIZING...",

    "LOADING ASSETS...",

    "PREPARING SNAKE...",

    "SETTING GAME...",

    "READY!"

];


function startLoading() {

    const interval =
        setInterval(() => {

            if (loadingFinished) {

                clearInterval(
                    interval
                );

                return;
            }


            loadingValue += 1;


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

                loadingFinished =
                    true;


                clearInterval(
                    interval
                );


                setTimeout(() => {

                    startGame();

                }, 400);
            }

        }, 30);
}



// ==========================================
// SKIP LOADING DENGAN SPACE
// ==========================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.code === "Space" &&
            !loadingFinished
        ) {

            event.preventDefault();


            loadingFinished =
                true;


            loadingValue = 100;


            loadingProgress.style.width =
                "100%";


            loadingPercent.textContent =
                "100%";


            loadingText.textContent =
                "READY!";


            startGame();
        }

    }
);



// ==========================================
// RESPONSIVE
// ==========================================

window.addEventListener(
    "resize",
    () => {

        if (gameRunning) {

            resizeCanvas();

            drawGame();
        }

    }
);



// ==========================================
// INITIAL
// ==========================================

updateMusicButton();

startLoading();

requestAnimationFrame(
    gameLoop
);