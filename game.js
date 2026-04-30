const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const messageElement = document.getElementById('message');

canvas.width = 800;
canvas.height = 600;

let gameActive = false;
let score = 0;
let highScore = localStorage.getItem('asteroidVoyagerHighScore') || 0;
highScoreElement.textContent = `High Score: ${highScore}`;

let difficulty = 1;
let player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 30,
    height: 30,
    speed: 6,
    color: '#00ffff'
};

let asteroids = [];
let keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space' && !gameActive) {
        startGame();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

function startGame() {
    gameActive = true;
    score = 0;
    difficulty = 1;
    asteroids = [];
    player.x = canvas.width / 2;
    scoreElement.textContent = `Score: ${score}`;
    messageElement.textContent = '';
    requestAnimationFrame(update);
}

function spawnAsteroid() {
    // Difficulty scales the spawn rate
    if (Math.random() < 0.03 + (difficulty * 0.02)) {
        const size = Math.random() * 40 + 20;
        asteroids.push({
            x: Math.random() * (canvas.width - size),
            y: -size,
            size: size,
            speed: (Math.random() * 3 + 2) * (1 + (difficulty * 0.1)),
            rotation: 0,
            rotationSpeed: Math.random() * 0.1 - 0.05
        });
    }
}

function update() {
    if (!gameActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Difficulty scaling based on score
    difficulty = 1 + Math.floor(score / 10) * 0.5;

    // Player movement
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;

    // Draw player (spaceship)
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'cyan';
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Asteroids
    spawnAsteroid();
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const a = asteroids[i];
        a.y += a.speed;
        a.rotation += a.rotationSpeed;

        // Draw asteroid
        ctx.save();
        ctx.translate(a.x + a.size / 2, a.y + a.size / 2);
        ctx.rotate(a.rotation);
        ctx.fillStyle = '#888';
        ctx.beginPath();
        // Generate a rough polygon for asteroid look
        for (let j = 0; j < 8; j++) {
            const angle = (j / 8) * Math.PI * 2;
            const r = (a.size / 2) * (0.8 + (Math.sin(j * 1.5) * 0.2));
            if (j === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
            else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Collision detection (slightly smaller hitboxes for fairness)
        const hitPadding = 5;
        if (
            player.x + hitPadding < a.x + a.size - hitPadding &&
            player.x + player.width - hitPadding > a.x + hitPadding &&
            player.y + hitPadding < a.y + a.size - hitPadding &&
            player.y + player.height - hitPadding > a.y + hitPadding
        ) {
            gameOver();
        }

        // Off screen
        if (a.y > canvas.height) {
            asteroids.splice(i, 1);
            score++;
            scoreElement.textContent = `Score: ${score}`;
            
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('asteroidVoyagerHighScore', highScore);
                highScoreElement.textContent = `High Score: ${highScore}`;
            }
        }
    }

    if (gameActive) {
        requestAnimationFrame(update);
    }
}

function gameOver() {
    gameActive = false;
    messageElement.innerHTML = `GAME OVER<br><span style="font-size: 24px">Final Score: ${score}</span><br><br>Press SPACE to Restart`;
}

