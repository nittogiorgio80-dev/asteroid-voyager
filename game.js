const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const messageElement = document.getElementById('message');

canvas.width = 800;
canvas.height = 600;

let gameActive = false;
let score = 0;
let player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 30,
    height: 30,
    speed: 5,
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
    asteroids = [];
    player.x = canvas.width / 2;
    messageElement.textContent = '';
    requestAnimationFrame(update);
}

function spawnAsteroid() {
    if (Math.random() < 0.05) {
        const size = Math.random() * 40 + 20;
        asteroids.push({
            x: Math.random() * (canvas.width - size),
            y: -size,
            size: size,
            speed: Math.random() * 3 + 2,
            rotation: 0,
            rotationSpeed: Math.random() * 0.1 - 0.05
        });
    }
}

function update() {
    if (!gameActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Player movement
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;

    // Draw player (spaceship)
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'cyan';

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
        for (let j = 0; j < 6; j++) {
            const angle = (j / 6) * Math.PI * 2;
            const r = a.size / 2 * (0.8 + Math.random() * 0.4);
            ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Collision detection
        if (
            player.x < a.x + a.size &&
            player.x + player.width > a.x &&
            player.y < a.y + a.size &&
            player.y + player.height > a.y
        ) {
            gameOver();
        }

        // Off screen
        if (a.y > canvas.height) {
            asteroids.splice(i, 1);
            score++;
            scoreElement.textContent = `Score: ${score}`;
        }
    }

    if (gameActive) {
        requestAnimationFrame(update);
    }
}

function gameOver() {
    gameActive = false;
    messageElement.textContent = 'GAME OVER - Press SPACE to Restart';
}
