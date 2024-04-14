document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    let gameOver = false;

    // Player object with ammo properties
    const player = { x: canvas.width / 2, y: canvas.height - 30, speed: 5, size: 20, hp: 100, ammo: 10, maxAmmo: 10, isReloading: false };

    const bullets = [];
    const enemyBullets = [];
    const enemies = [];
    const keys = {};
    let lastEnemyShotTime = Date.now();

    window.addEventListener('keydown', function(e) {
        keys[e.key] = true;
        
        // Press 'r' to manually reload
        if (e.key === 'r') {
            reloadAmmo();
        }
    });

    window.addEventListener('keyup', function(e) {
        keys[e.key] = false;
    });

    canvas.addEventListener('click', function(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        shootBullet(player.x + player.size / 2, player.y, mouseX, mouseY, bullets, true);
    });

    function shootBullet(x, y, targetX, targetY, bulletArray, isPlayer) {
        if (isPlayer && !player.isReloading) {
            if (player.ammo > 0) {
                const angle = Math.atan2(targetY - y, targetX - x);
                const speed = 10;
                const velocityX = Math.cos(angle) * speed;
                const velocityY = Math.sin(angle) * speed;
                bulletArray.push({ x: x, y: y, velocityX: velocityX, velocityY: velocityY, size: 5 });
                player.ammo -= 1;
                console.log(`Player ammo: ${player.ammo}`);

                if (player.ammo <= 0) {
                    reloadAmmo();
                }
            }
        } else if (!isPlayer) {
            // Enemy shooting logic, no ammo management
            const angle = Math.atan2(targetY - y, targetX - x);
            const speed = 10;
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;
            bulletArray.push({ x: x, y: y, velocityX: velocityX, velocityY: velocityY, size: 5 });
        }
    }

    function reloadAmmo() {
        if (player.isReloading) return;
        console.log("Starting reload...");
        player.isReloading = true;
        setTimeout(() => {
            player.ammo = player.maxAmmo;
            player.isReloading = false;
            console.log("Reload complete. Ammo refilled.");
        }, 2000); // Reload takes 2 seconds
    }


const maxEnemies = 20; // 게임에서 생성될 적의 최대 수
let totalSpawnedEnemies = 0; // 현재까지 생성된 적의 수

function spawnEnemy() {
    // 생성된 적의 수가 maxEnemies보다 작을 때만 적을 생성
    if (totalSpawnedEnemies < maxEnemies && Math.random() < 0.1) {
        enemies.push({
            x: Math.random() * (canvas.width - 20),
            y: -20,
            speed: 1,
            size: 20,
            hp: 30,
        });
        totalSpawnedEnemies++; // 생성된 적의 수를 업데이트
    }
}
    function enemyShoot() {
        const now = Date.now();
        if (now - lastEnemyShotTime > 2000) {
            enemies.forEach(enemy => {
                shootBullet(enemy.x + enemy.size / 2, enemy.y, player.x, player.y, enemyBullets);
            });
            lastEnemyShotTime = now;
        }
    }

    function updateBullets(bulletArray, isEnemy) {
        bulletArray.forEach((bullet, bulletIndex) => {
            bullet.x += bullet.velocityX;
            bullet.y += bullet.velocityY;
            if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
                bulletArray.splice(bulletIndex, 1);
            } else {
                if (isEnemy) {
                    if (bullet.x < player.x + player.size &&
                        bullet.x + bullet.size > player.x &&
                        bullet.y < player.y + player.size &&
                        bullet.y + bullet.size > player.y) {
                        bulletArray.splice(bulletIndex, 1);
                        player.hp -= 10;
                        if (player.hp <= 0) gameOver = true;
                    }
                } else {
                    enemies.forEach((enemy, enemyIndex) => {
                        if (bullet.x < enemy.x + enemy.size &&
                            bullet.x + bullet.size > enemy.x &&
                            bullet.y < enemy.y + enemy.size &&
                            bullet.y + bullet.size > enemy.y) {
                            bulletArray.splice(bulletIndex, 1);
                            enemy.hp -= 10;
                            if (enemy.hp <= 0) enemies.splice(enemyIndex, 1);
                        }
                    });
                }
            }
        });
    }

    function updateEnemies() {
        enemies.forEach(enemy => {
            const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
            enemy.x += Math.cos(angle) * enemy.speed;
            enemy.y += Math.sin(angle) * enemy.speed;
        });
    }

    function limitMovement(entity) {
        entity.x = Math.max(0, Math.min(canvas.width - entity.size, entity.x));
        entity.y = Math.max(0, Math.min(canvas.height - entity.size, entity.y));
    }

    function update() {
        if (!gameOver) {
            if (keys['w']) player.y -= player.speed;
            if (keys['s']) player.y += player.speed;
            if (keys['a']) player.x -= player.speed;
            if (keys['d']) player.x += player.speed;

            limitMovement(player);
            enemies.forEach(limitMovement);

            spawnEnemy();
            enemyShoot();
            updateBullets(bullets,

false);
            updateBullets(enemyBullets, true);
            updateEnemies();
        }
    }

function drawEnemies() {
    enemies.forEach(enemy => {
        // 적 그리기
        ctx.fillStyle = 'red';
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);

        // 적 체력바 그리기
        const healthBarWidth = 20; // 체력바의 최대 너비
        const healthBarHeight = 5; // 체력바의 높이
        const healthPercentage = enemy.hp / 30; // 적의 최대 HP를 기준으로 현재 HP 비율 계산

        // 체력바 배경 (옵션)
        ctx.fillStyle = '#555'; // 어두운 배경색
        ctx.fillRect(enemy.x, enemy.y - healthBarHeight - 5, healthBarWidth, healthBarHeight);

        // 체력바 전경
        ctx.fillStyle = '#0f0'; // 녹색 체력바
        ctx.fillRect(enemy.x, enemy.y - healthBarHeight - 5, healthBarWidth * healthPercentage, healthBarHeight);
    });
}

    function drawGameOver() {
        ctx.fillStyle = 'red'; // 빨간색으로 "Game Over" 메시지 설정
        ctx.font = '48px serif'; // 폰트 크기와 스타일 설정
        ctx.textAlign = 'center'; // 텍스트 정렬을 중앙으로 설정
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2); // 화면 중앙에 표시
    }

function drawClearScreen() {
    ctx.fillStyle = 'green'; // "Clear" 문구의 색상 설정
    ctx.font = '48px serif'; // 폰트 크기와 스타일 설정
    ctx.textAlign = 'center'; // 텍스트 정렬을 중앙으로 설정
    ctx.fillText('Clear', canvas.width / 2, canvas.height / 2); // 화면 중앙에 "Clear" 표시
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 클리어

    if (!gameOver) {
        // Player with Glow Effect
        ctx.fillStyle = 'blue';
        ctx.shadowBlur = 20;
        ctx.shadowColor = "blue";
        ctx.fillRect(player.x, player.y, player.size, player.size);
        ctx.shadowBlur = 0; // Reset shadow for other elements

        // Draw player HP with white color
        ctx.fillStyle = 'white'; 
        ctx.font = '16px Arial';
        ctx.fillText(`HP: ${player.hp}`, 10, 20);
        
        // Draw Ammo Status with white color
        ctx.fillStyle = 'white'; 
        ctx.font = '16px Arial';
        ctx.fillText(`Ammo: ${player.ammo} / ${player.maxAmmo}`, 10, 40);

        // Enemies with Glow Effect
        enemies.forEach(enemy => {
            ctx.fillStyle = 'red';
            ctx.shadowBlur = 20;
            ctx.shadowColor = "red";
            ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
            ctx.shadowBlur = 0; // Reset shadow for other elements
        });

   			// Player Bullets with Glow Effect
        bullets.forEach(bullet => {
          ctx.fillStyle = 'yellow';
          ctx.shadowBlur = 20; // 형광 효과 강도
          ctx.shadowColor = "yellow"; // 형광 색상
          ctx.beginPath();
          ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // 다른 요소에影响を及ぼさないようにリセット
        });

        // Enemy Bullets with Glow Effect
        enemyBullets.forEach(bullet => {
          ctx.fillStyle = 'green';
          ctx.shadowBlur = 20; // 형광 효과 강도
          ctx.shadowColor = "green"; // 형광 색상
          ctx.beginPath();
          ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // 다른 요소에影响を及ぼさないようにリセット
        });

        drawEnemies();
        if (enemies.length === 0 && totalSpawnedEnemies === maxEnemies) {
            drawClearScreen();
        }
    } else {
        drawGameOver();
    }
}

    function gameLoop() {
        update();
        draw();
        if (!gameOver) {
            requestAnimationFrame(gameLoop);
        }
    }

    gameLoop();
});