const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let paddle, ball, bricks, score, lives, gameOver, difficulty;

// 初始化遊戲
function initGame() {
    paddle = { x: canvas.width / 2 - 80, y: canvas.height - 30, width: 160, height: 10 };
    ball = { x: canvas.width / 2, y: canvas.height - 40, radius: 10, dx: 2, dy: -2 };
    bricks = [];
    score = 0;
    lives = 3; // 初始化生命數
    gameOver = false;
    initBricks();
}

// 隨機生成磚塊
function initBricks() {
    let rows, cols;

    // 設定行數和列數
    if (difficulty === 'easy') {
        rows = 4; // 簡單模式 4 行
        cols = 4; // 簡單模式  列
    } else if (difficulty === 'medium') {
        rows = 4; // 普通模式 4 行
        cols = 7; // 普通模式 7 列
    } else if (difficulty === 'hard') {
        rows = 4; // 困難模式 4 行
        cols = 8; // 困難模式 8 列
    }

    const brickWidth = 60; // 磚塊寬度
    const brickHeight = 30; // 磚塊高度
    const padding = 30; // 磚塊間距

    // 置中計算
    const totalWidth = (cols * brickWidth) + ((cols - 1) * padding);
    const startX = (canvas.width - totalWidth) / 2;
    const startY = 20; // 磚塊頂部距離

    for (let r = 0; r < rows; r++) {
        bricks[r] = [];
        for (let c = 0; c < cols; c++) {
            let color;
            let hits;

            if (difficulty === 'easy') {
                color = '#A8D8A4'; // 淺綠色
                hits = 1; // 一次擊打即可破壞
            } else if (difficulty === 'medium') {
                if (Math.random() < 0.5) {
                    color = '#FFEB7A'; // 淺黃色
                    hits = 2; // 兩次擊打
                } else {
                    color = '#A8D8A4'; // 淺綠色
                    hits = 1; // 一次擊打
                }
            } else if (difficulty === 'hard') {
                if (Math.random() < 0.33) {
                    color = '#FF8A8A'; // 淺紅色
                    hits = 3; // 三次擊打
                } else if (Math.random() < 0.5) {
                    color = '#FFEB7A'; // 淺黃色
                    hits = 2; // 兩次擊打
                } else {
                    color = '#A8D8A4'; // 淺綠色
                    hits = 1; // 一次擊打
                }
            }

            // 計算磚塊位置
            bricks[r][c] = { 
                x: startX + c * (brickWidth + padding), 
                y: startY + r * (brickHeight + padding), 
                status: 1, 
                hits, 
                color 
            };
        }
    }
}

// 繪製擋板
function drawPaddle() {
    ctx.fillStyle = '#0095DD';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// 繪製球
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

// 繪製尾跡
function drawTrail() {
    ctx.fillStyle = 'rgba(0, 149, 221, 0.2)'; // 尾跡顏色
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(ball.x - ball.dx * 10, ball.y - ball.dy * 10); // 根據球的運動方向繪製尾跡
    ctx.lineWidth = 10; // 尾跡寬度
    ctx.strokeStyle = 'rgba(0, 149, 221, 0.2)'; // 尾跡顏色
    ctx.stroke();
}

// 繪製磚塊
function drawBricks() {
    for (let r = 0; r < bricks.length; r++) {
        for (let c = 0; c < bricks[r].length; c++) {
            const b = bricks[r][c];
            if (b.status === 1) {
                ctx.fillStyle = b.color; // 根據擊打次數設置顏色
                ctx.fillRect(b.x, b.y, 80, 30); // 磚塊大小
            }
        }
    }
}

// 繪製分數和生命
function drawScoreAndLives() {
    ctx.fillStyle = '#333';
    ctx.font = '16px Arial';
    ctx.fillText('得分: ' + score, 10, 20);
    ctx.fillText('生命: ' + lives, canvas.width - 80, 20);
}

// 碰撞檢測
function collisionDetection() {
    for (let r = 0; r < bricks.length; r++) {
        for (let c = 0; c < bricks[r].length; c++) {
            const b = bricks[r][c];
            if (b.status === 1) {
                if (ball.x > b.x && ball.x < b.x + 80 && ball.y > b.y && ball.y < b.y + 30) {
                    ball.dy = -ball.dy;
                    b.hits--;

                    // 增加球的速度
                    ball.dx *= 1.05; // 增加水平速度
                    ball.dy *= 1.05; // 增加垂直速度

                    // 磚塊顏色變化邏輯
                    if (b.hits === 2 && b.color === '#FF8A8A') {
                        b.color = '#FFEB7A'; // 碰撞紅色變為黃色
                    } else if (b.hits === 1 && b.color === '#FFEB7A') {
                        b.color = '#A8D8A4'; // 碰撞黃色變為綠色
                    }

                    if (b.hits <= 0) {
                        b.status = 0; // 磚塊被擊破
                        score++;
                    }
                    if (score === bricks.flat().length) {
                        if (difficulty === 'easy') {
                            difficulty = 'medium'; // 進入普通模式
                            alert("簡單模式過關！進入普通模式。");
                            initGame(); // 重新初始化
                        } else if (difficulty === 'medium') {
                            difficulty = 'hard'; // 進入困難模式
                            alert("普通模式過關！進入困難模式。");
                            initGame(); // 重新初始化
                        } else {
                            alert("你贏了！總得分: " + score);
                            document.getElementById('restartBtn').style.display = 'block';
                            gameOver = true;
                        }
                    }
                }
            }
        }
    }
}

// 遊戲邏輯
function draw() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawTrail(); // 繪製尾跡
    drawBall();
    drawPaddle();
    drawScoreAndLives();
    collisionDetection();

    // 球的運動
    ball.x += ball.dx;
    ball.y += ball.dy;

    // 碰撞擋板
    if (ball.x > paddle.x && ball.x < paddle.x + paddle.width && ball.y + ball.radius > paddle.y) {
        ball.dy = -ball.dy;
    } else if (ball.y + ball.radius > canvas.height) {
        // 球掉落，減少生命
        lives--;
        if (lives > 0) {
            // 重置球的位置
            ball.x = canvas.width / 2;
            ball.y = canvas.height - 40;
            ball.dx = 2;
            ball.dy = -2;
        } else {
            alert("遊戲結束！你的得分: " + score);
            document.getElementById('restartBtn').style.display = 'block';
            gameOver = true;
        }
    }

    // 碰撞邊界
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }
}

// 控制擋板
document.addEventListener('mousemove', (event) => {
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    paddle.x = Math.min(Math.max(mouseX - paddle.width / 2, 0), canvas.width - paddle.width);
});

// 遊戲重置
document.getElementById('restartBtn').onclick = function() {
    initGame();
    document.getElementById('restartBtn').style.display = 'none';
};

// 開始遊戲
setInterval(draw, 10);

// 選擇難度並開始遊戲
document.getElementById('difficultySelect').addEventListener('change', (event) => {
    difficulty = event.target.value;
    initGame();
});
