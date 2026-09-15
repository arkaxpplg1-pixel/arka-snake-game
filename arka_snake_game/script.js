// ==========================================
// ARKA SNAKE GAME
// ==========================================


// ==========================================
// CANVAS
// ==========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


// ==========================================
// ELEMENT GAME
// ==========================================

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


// ==========================================
// PENGATURAN AUDIO
// ==========================================

// Hanya backsound utama yang dikontrol
// oleh tombol MUSIC ON / OFF.

let musicEnabled = true;


// Volume backsound utama
mainBackground.volume = 0.35;


// Volume sound effect
coinSound.volume = 0.75;
gameOverSound.volume = 0.85;


// ==========================================
// MEMULAI BACKSOUND
// ==========================================

function playMainBackground() {

    if (!musicEnabled) {
        return;
    }

    mainBackground.volume = 0.35;

    const playPromise =
        mainBackground.play();

    if (
        playPromise !== undefined
    ) {

        playPromise.catch(() => {

            // Browser dapat memblokir
            // autoplay audio.

        });

    }
}


// ==========================================
// MENGHENTIKAN BACKSOUND
// ==========================================

function stopMainBackground() {

    mainBackground.pause();

    mainBackground.currentTime = 0;
}


// ==========================================
// SOUND COIN
// ==========================================

function playCoinSound() {

    // Sound coin TIDAK terpengaruh
    // oleh MUSIC ON / OFF.

    coinSound.currentTime = 0;

    const playPromise =
        coinSound.play();

    if (
        playPromise !== undefined
    ) {

        playPromise.catch(() => {

            // Abaikan jika browser
            // memblokir audio.

        });

    }
}


// ==========================================
// SOUND GAME OVER
// ==========================================

function playGameOverSound() {

    // Sound Game Over TIDAK terpengaruh
    // oleh MUSIC ON / OFF.

    gameOverSound.currentTime = 0;

    const playPromise =
        gameOverSound.play();

    if (
        playPromise !== undefined
    ) {

        playPromise.catch(() => {

            // Abaikan jika browser
            // memblokir audio.

        });

    }
}


// ==========================================
// UPDATE TOMBOL MUSIK
// ==========================================

function updateMusicButton() {

    if (musicEnabled) {

        musicButton.textContent =
            "🔊 MUSIC ON";

        musicButton.classList.remove(
            "music-off"
        );

    } else {

        musicButton.textContent =
            "🔇 MUSIC OFF";

        musicButton.classList.add(
            "music-off"
        );
    }
}


// ==========================================
// TOGGLE MUSIC
// ==========================================

musicButton.addEventListener(
    "click",
    function() {

        musicEnabled =
            !musicEnabled;


        if (musicEnabled) {

            playMainBackground();

        } else {

            stopMainBackground();

        }


        updateMusicButton();

    }
);


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
// UKURAN CANVAS RESPONSIVE
// ==========================================

function resizeCanvas() {

    const area =
        document.getElementById("gameArea");

    const oldWidth =
        canvasWidth;

    const oldHeight =
        canvasHeight;


    canvasWidth =
        Math.floor(
            area.clientWidth /
            GRID_SIZE
        ) * GRID_SIZE;


    canvasHeight =
        Math.floor(
            area.clientHeight /
            GRID_SIZE
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


    // Jika game sudah berjalan,
    // pastikan posisi ular tetap berada
    // pada grid.

    if (
        snake.length > 0 &&
        oldWidth > 0 &&
        oldHeight > 0
    ) {

        snake.forEach(part => {

            part.x =
                Math.floor(
                    part.x /
                    GRID_SIZE
                ) * GRID_SIZE;


            part.y =
                Math.floor(
                    part.y /
                    GRID_SIZE
                ) * GRID_SIZE;

        });
    }
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
// POSISI RANDOM
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
// CEK POSISI TERPAKAI
// ==========================================

function positionIsFree(position) {

    for (
        const part of snake
    ) {

        if (
            part.x === position.x &&
            part.y === position.y
        ) {

            return false;
        }
    }


    for (
        const food of foods
    ) {

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

function createFood() {

    let position;
    let attempts = 0;


    do {

        position =
            randomPosition();

        attempts++;


        if (
            attempts > 100
        ) {

            break;
        }

    } while (
        !positionIsFree(position)
    );


    return {

        x: position.x,
        y: position.y,

        color:
            FOOD_COLORS[
                Math.floor(
                    Math.random() *
                    FOOD_COLORS.length
                )
            ]

    };
}


// ==========================================
// MEMBUAT SEMUA MAKANAN
// ==========================================

function createFoods() {

    foods = [];


    for (
        let i = 0;
        i < FOOD_COUNT;
        i++
    ) {

        foods.push(
            createFood()
        );
    }
}


// ==========================================
// RESET GAME
// ==========================================

function resetGame() {

    resizeCanvas();


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

    moveTimer = 0;


    createSnake();

    createFoods();


    scoreText.textContent =
        score;

    speedText.textContent =
        speed;


    gameOverScreen.classList.remove(
        "show"
    );


    gameRunning = true;


    // Main background hanya dimainkan
    // jika Music ON.

    if (musicEnabled) {

        playMainBackground();
    }
}


// ==========================================
// GRID SEMI TRANSPARAN
// ==========================================

function drawGrid() {

    ctx.strokeStyle =
        "rgba(100, 180, 220, 0.10)";

    ctx.lineWidth = 1;


    for (
        let x = 0;
        x <= canvasWidth;
        x += GRID_SIZE
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

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

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            canvasWidth,
            y
        );

        ctx.stroke();
    }
}


// ==========================================
// MAKANAN BULAT
// ==========================================

function drawFood(food) {

    const centerX =
        food.x +
        GRID_SIZE / 2;

    const centerY =
        food.y +
        GRID_SIZE / 2;


    ctx.save();


    // Glow
    ctx.shadowColor =
        food.color;

    ctx.shadowBlur = 15;


    // Lingkaran utama
    ctx.globalAlpha = 0.67;

    ctx.fillStyle =
        food.color;


    ctx.beginPath();

    ctx.arc(

        centerX,
        centerY,

        GRID_SIZE * 0.40,

        0,
        Math.PI * 2

    );

    ctx.fill();


    // Highlight
    ctx.globalAlpha = 0.45;

    ctx.fillStyle =
        "#ffffff";


    ctx.beginPath();

    ctx.arc(

        centerX - 3,
        centerY - 3,

        GRID_SIZE * 0.13,

        0,
        Math.PI * 2

    );

    ctx.fill();


    ctx.restore();
}


// ==========================================
// MATA ULAR
// ==========================================

function drawSnakeEyes(head) {

    const eyeRadius = 3.5;

    let eye1;
    let eye2;


    if (
        direction.x === 1
    ) {

        eye1 = {
            x: head.x + 14,
            y: head.y + 5
        };

        eye2 = {
            x: head.x + 14,
            y: head.y + 15
        };


    } else if (
        direction.x === -1
    ) {

        eye1 = {
            x: head.x + 6,
            y: head.y + 5
        };

        eye2 = {
            x: head.x + 6,
            y: head.y + 15
        };


    } else if (
        direction.y === -1
    ) {

        eye1 = {
            x: head.x + 5,
            y: head.y + 6
        };

        eye2 = {
            x: head.x + 15,
            y: head.y + 6
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
    ctx.fillStyle =
        "#ffffff";


    ctx.beginPath();

    ctx.arc(
        eye1.x,
        eye1.y,
        eyeRadius,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        eye2.x,
        eye2.y,
        eyeRadius,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Pupil
    ctx.fillStyle =
        "#050505";


    ctx.beginPath();

    ctx.arc(
        eye1.x,
        eye1.y,
        1.8,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        eye2.x,
        eye2.y,
        1.8,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


// ==========================================
// MENGGAMBAR ULAR
// ==========================================

function drawSnake() {

    const bodyColor =
        getSnakeColor();


    const headColor =
        darkenColor(
            bodyColor,
            35
        );


    snake.forEach(
        (part, index) => {

            if (
                index === 0
            ) {

                ctx.fillStyle =
                    headColor;

            } else {

                ctx.fillStyle =
                    bodyColor;
            }


            ctx.fillRect(

                part.x,
                part.y,

                GRID_SIZE,
                GRID_SIZE

            );

        }
    );


    drawSnakeEyes(
        snake[0]
    );
}


// ==========================================
// WARNA KEPALA
// ==========================================

function darkenColor(
    hex,
    amount
) {

    let color =
        hex.replace(
            "#",
            ""
        );


    let r =
        parseInt(
            color.substring(
                0,
                2
            ),
            16
        );


    let g =
        parseInt(
            color.substring(
                2,
                4
            ),
            16
        );


    let b =
        parseInt(
            color.substring(
                4,
                6
            ),
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
// GAMBAR GAME
// ==========================================

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


    foods.forEach(
        food => {

            drawFood(food);

        }
    );


    drawSnake();
}


// ==========================================
// COLLISION
// ==========================================

function isCollision(
    rect1,
    rect2
) {

    return (

        rect1.x <
        rect2.x + GRID_SIZE

        &&

        rect1.x + GRID_SIZE >
        rect2.x

        &&

        rect1.y <
        rect2.y + GRID_SIZE

        &&

        rect1.y + GRID_SIZE >
        rect2.y

    );
}


// ==========================================
// GERAK ULAR
// ==========================================

function moveSnake() {

    direction = {

        x: nextDirection.x,
        y: nextDirection.y

    };


    const head =
        snake[0];


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
    // COLLISION TUBUH SENDIRI
    // ======================================

    for (
        let i = 1;
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


    // ======================================
    // TAMBAHKAN KEPALA
    // ======================================

    snake.unshift(
        newHead
    );


    // ======================================
    // CEK MAKANAN
    // ======================================

    let foodEaten = false;


    for (
        let i = 0;
        i < foods.length;
        i++
    ) {

        if (
            isCollision(
                newHead,
                foods[i]
            )
        ) {

            // ==================================
            // SCORE
            // ==================================

            score++;


            scoreText.textContent =
                score;


            // ==================================
            // SPEED
            // ==================================

            speed =
                Math.min(

                    5 +
                    Math.floor(
                        score / 2
                    ),

                    20

                );


            speedText.textContent =
                speed;


            // ==================================
            // SOUND COIN
            // ==================================

            playCoinSound();


            // ==================================
            // HAPUS MAKANAN
            // ==================================

            foods.splice(
                i,
                1
            );


            // ==================================
            // BUAT MAKANAN BARU
            // ==================================

            foods.push(
                createFood()
            );


            // ==================================
            // NOTIFIKASI
            // ==================================

            showNotification();


            foodEaten = true;


            break;
        }
    }


    // ======================================
    // JIKA TIDAK MAKAN
    // HAPUS EKOR
    // ======================================

    if (!foodEaten) {

        snake.pop();
    }
}


// ==========================================
// NOTIFIKASI
// ==========================================

function showNotification() {

    let message;


    if (
        score % 10 === 0
    ) {

        message =
            "PERFECT!";

    } else if (
        score % 5 === 0
    ) {

        message =
            "GREAT!";

    } else {

        message =
            "NICE!";
    }


    notification.textContent =
        message;


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


    // ==================================
    // MATIKAN BACKSOUND UTAMA
    // ==================================

    stopMainBackground();


    // ==================================
    // MAIN GAME OVER SOUND
    // ==================================

    playGameOverSound();
}


// ==========================================
// LOOP GAME
// ==========================================

function gameLoop(timestamp) {

    if (!gameRunning) {
        return;
    }


    if (!lastTime) {

        lastTime =
            timestamp;
    }


    const deltaTime =
        timestamp -
        lastTime;


    lastTime =
        timestamp;


    const moveDelay =
        Math.max(

            45,

            180 -
            speed * 7

        );


    moveTimer +=
        deltaTime;


    if (
        moveTimer >=
        moveDelay
    ) {

        moveSnake();

        moveTimer = 0;
    }


    drawGame();


    requestAnimationFrame(
        gameLoop
    );
}


// ==========================================
// KEYBOARD
// ==========================================

document.addEventListener(
    "keydown",
    function(event) {

        const key =
            event.key.toLowerCase();


        // ==================================
        // SPACE
        // ==================================

        if (
            event.code === "Space"
        ) {

            event.preventDefault();


            if (!gameRunning) {

                resetGame();


                lastTime =
                    performance.now();


                requestAnimationFrame(
                    gameLoop
                );
            }


            return;
        }


        // ==================================
        // ATAS / W
        // ==================================

        if (

            key === "arrowup" ||
            key === "w"

        ) {

            changeDirection(
                0,
                -1
            );
        }


        // ==================================
        // BAWAH / S
        // ==================================

        else if (

            key === "arrowdown" ||
            key === "s"

        ) {

            changeDirection(
                0,
                1
            );
        }


        // ==================================
        // KIRI / A
        // ==================================

        else if (

            key === "arrowleft" ||
            key === "a"

        ) {

            changeDirection(
                -1,
                0
            );
        }


        // ==================================
        // KANAN / D
        // ==================================

        else if (

            key === "arrowright" ||
            key === "d"

        ) {

            changeDirection(
                1,
                0
            );
        }

    }
);


// ==========================================
// GANTI ARAH
// ==========================================

function changeDirection(
    x,
    y
) {

    // Mencegah ular
    // berbalik langsung.

    if (

        direction.x === -x &&
        direction.y === -y

    ) {

        return;
    }


    nextDirection = {

        x: x,
        y: y

    };
}


// ==========================================
// TOUCH CONTROL
// ==========================================

const controlButtons =
    document.querySelectorAll(
        ".control-button[data-direction]"
    );


controlButtons.forEach(
    button => {

        button.addEventListener(
            "pointerdown",
            function(event) {

                event.preventDefault();


                const dir =
                    button.dataset.direction;


                if (
                    dir === "up"
                ) {

                    changeDirection(
                        0,
                        -1
                    );

                } else if (
                    dir === "down"
                ) {

                    changeDirection(
                        0,
                        1
                    );

                } else if (
                    dir === "left"
                ) {

                    changeDirection(
                        -1,
                        0
                    );

                } else if (
                    dir === "right"
                ) {

                    changeDirection(
                        1,
                        0
                    );
                }

            }
        );

    }
);


// ==========================================
// SWIPE CONTROL
// ==========================================

let touchStartX = 0;
let touchStartY = 0;


canvas.addEventListener(
    "touchstart",
    function(event) {

        event.preventDefault();


        const touch =
            event.changedTouches[0];


        touchStartX =
            touch.clientX;


        touchStartY =
            touch.clientY;

    },
    {
        passive: false
    }
);


canvas.addEventListener(
    "touchend",
    function(event) {

        event.preventDefault();


        const touch =
            event.changedTouches[0];


        const deltaX =
            touch.clientX -
            touchStartX;


        const deltaY =
            touch.clientY -
            touchStartY;


        const minSwipe = 25;


        if (

            Math.abs(deltaX) <
            minSwipe &&

            Math.abs(deltaY) <
            minSwipe

        ) {

            return;
        }


        // Horizontal
        if (
            Math.abs(deltaX) >
            Math.abs(deltaY)
        ) {

            if (
                deltaX > 0
            ) {

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

        }


        // Vertical
        else {

            if (
                deltaY > 0
            ) {

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
        passive: false
    }
);


// ==========================================
// RESTART BUTTON
// ==========================================

restartButton.addEventListener(
    "click",
    function() {

        // Hentikan suara Game Over
        gameOverSound.pause();

        gameOverSound.currentTime = 0;


        resetGame();


        lastTime =
            performance.now();


        requestAnimationFrame(
            gameLoop
        );

    }
);


// ==========================================
// LOADING SCREEN
// ==========================================

let loading = 0;
let loadingFinished = false;
let loadingStarted = false;


// ==========================================
// START LOADING
// ==========================================

function startLoading() {

    if (loadingStarted) {
        return;
    }


    loadingStarted = true;


    const loadingInterval =
        setInterval(
            () => {

                loading +=
                    Math.floor(
                        Math.random() * 4
                    ) + 1;


                if (
                    loading >= 100
                ) {

                    loading = 100;


                    clearInterval(
                        loadingInterval
                    );


                    loadingFinished = true;


                    loadingText.textContent =
                        "SYSTEM READY";


                    loadingProgress.style.width =
                        "100%";


                    loadingPercent.textContent =
                        "100%";


                    setTimeout(
                        () => {

                            startGame();

                        },
                        500
                    );
                }


                loadingProgress.style.width =
                    loading + "%";


                loadingPercent.textContent =
                    loading + "%";


                if (
                    loading < 25
                ) {

                    loadingText.textContent =
                        "INITIALIZING...";

                } else if (
                    loading < 50
                ) {

                    loadingText.textContent =
                        "LOADING GAME SYSTEM...";

                } else if (
                    loading < 75
                ) {

                    loadingText.textContent =
                        "GENERATING SNAKE...";

                } else if (
                    loading < 100
                ) {

                    loadingText.textContent =
                        "PREPARING ARENA...";
                }

            },
            50
        );
}


// ==========================================
// SKIP LOADING
// ==========================================

document.addEventListener(
    "keydown",
    function(event) {

        if (

            event.code === "Space" &&

            !loadingFinished

        ) {

            event.preventDefault();


            loadingFinished = true;


            loading = 100;


            loadingProgress.style.width =
                "100%";


            loadingPercent.textContent =
                "100%";


            loadingText.textContent =
                "SYSTEM READY";


            setTimeout(
                () => {

                    startGame();

                },
                200
            );
        }

    }
);


// ==========================================
// MEMULAI GAME
// ==========================================

function startGame() {

    splashScreen.style.display =
        "none";


    gameContainer.style.display =
        "flex";


    resizeCanvas();


    resetGame();


    lastTime =
        performance.now();


    requestAnimationFrame(
        gameLoop
    );


    // Mulai backsound setelah
    // loading selesai.

    playMainBackground();
}


// ==========================================
// MEMBANTU AUTOPLAY AUDIO
// ==========================================

// Beberapa browser memblokir
// autoplay audio tanpa interaksi user.
//
// Jika sebelumnya diblokir, audio akan
// dicoba kembali ketika user melakukan
// interaksi pertama.

function unlockAudio() {

    if (
        musicEnabled &&
        mainBackground.paused &&
        gameRunning
    ) {

        playMainBackground();
    }

}


document.addEventListener(
    "pointerdown",
    unlockAudio,
    {
        once: true
    }
);


document.addEventListener(
    "keydown",
    unlockAudio,
    {
        once: true
    }
);


// ==========================================
// RESIZE WINDOW
// ==========================================

let resizeTimeout;


window.addEventListener(
    "resize",
    function() {

        clearTimeout(
            resizeTimeout
        );


        resizeTimeout =
            setTimeout(
                () => {

                    if (
                        gameRunning
                    ) {

                        resizeCanvas();

                        drawGame();
                    }

                },
                100
            );

    }
);


// ==========================================
// INISIALISASI TOMBOL MUSIK
// ==========================================

updateMusicButton();


// ==========================================
// JALANKAN LOADING
// ==========================================

startLoading();