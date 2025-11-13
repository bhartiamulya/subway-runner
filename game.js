const CONFIG = {
    lanes: 3,
    laneWidth: 3,
    playerSpeed: 0.15,
    obstacleSpeed: 0.35,
    jumpHeight: 3,
    jumpDuration: 600,
    slideDuration: 500,
    spawnDistance: 50,
    minObstacleDistance: 8,
    maxObstacleDistance: 15,
    coinSpawnChance: 0.9,
    scoreIncrement: 1,
    coinValue: 10,
    trainSpawnChance: 0.3
};

const gameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    coins: 0,
    speed: CONFIG.obstacleSpeed,
    difficulty: 1
};

let scene, camera, renderer;
let player, ground = [], trains = [], pillars = [];
let obstacles = [], coins = [];
let currentLane = 1; // 0 = left, 1 = center, 2 = right
let isJumping = false;
let isSliding = false;
let jumpStartTime = 0;
let slideStartTime = 0;
let spawnTimer = 0;
let animationId;
let runningAnimation = 0;

function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 50, 150);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 2, 0);

    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('game-canvas'),
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);


    createGround();

    
    createPlayer();

    
    createWalls();

    window.addEventListener('resize', onWindowResize);
}

function createGround() {
  
    for (let i = 0; i < 3; i++) {
        
        const groundGeometry = new THREE.PlaneGeometry(CONFIG.laneWidth * CONFIG.lanes, 200);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x444444,
            roughness: 0.9
        });
        const groundSegment = new THREE.Mesh(groundGeometry, groundMaterial);
        groundSegment.rotation.x = -Math.PI / 2;
        groundSegment.position.z = -i * 200;
        groundSegment.receiveShadow = true;
        scene.add(groundSegment);
        ground.push(groundSegment);
        
        
        for (let lane = 0; lane < CONFIG.lanes; lane++) {
            const trackGeometry = new THREE.BoxGeometry(0.2, 0.1, 200);
            const trackMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
            const leftTrack = new THREE.Mesh(trackGeometry, trackMaterial);
            const rightTrack = new THREE.Mesh(trackGeometry, trackMaterial);
            
            const laneX = (lane * CONFIG.laneWidth) - (CONFIG.laneWidth * CONFIG.lanes / 2) + CONFIG.laneWidth / 2;
            leftTrack.position.set(laneX - 1, 0.05, -i * 200);
            rightTrack.position.set(laneX + 1, 0.05, -i * 200);
            
            scene.add(leftTrack);
            scene.add(rightTrack);
            ground.push(leftTrack, rightTrack);
        }
    }

  
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    for (let i = 0; i < 3; i++) {
        for (let lane = 1; lane < CONFIG.lanes; lane++) {
            const lineGeometry = new THREE.BoxGeometry(0.1, 0.1, 200);
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.position.x = (lane * CONFIG.laneWidth) - (CONFIG.laneWidth * CONFIG.lanes / 2);
            line.position.y = 0.05;
            line.position.z = -i * 200;
            scene.add(line);
            ground.push(line);
        }
    }
}

function createPlayer() {
    const playerGroup = new THREE.Group();

  
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.6);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff6b6b });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.75;
    body.castShadow = true;
    playerGroup.add(body);

   
    const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc99 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.8;
    head.castShadow = true;
    playerGroup.add(head);

   
    const armGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
    const armMaterial = new THREE.MeshStandardMaterial({ color: 0xff6b6b });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.6, 0.75, 0);
    leftArm.castShadow = true;
    playerGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.6, 0.75, 0);
    rightArm.castShadow = true;
    playerGroup.add(rightArm);

   
    const legGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x4a69bd });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.3, -0.5, 0);
    leftLeg.castShadow = true;
    playerGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.3, -0.5, 0);
    rightLeg.castShadow = true;
    playerGroup.add(rightLeg);

    playerGroup.position.set(0, 1, 5);
    scene.add(playerGroup);
    player = playerGroup;
}

function createWalls() {
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
    const pillarMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
    
    for (let i = 0; i < 3; i++) {
        
        const leftWallGeometry = new THREE.BoxGeometry(1, 8, 200);
        const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
        leftWall.position.set(-CONFIG.laneWidth * CONFIG.lanes / 2 - 2, 4, -i * 200);
        leftWall.castShadow = true;
        scene.add(leftWall);
        ground.push(leftWall);

        const rightWallGeometry = new THREE.BoxGeometry(1, 8, 200);
        const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
        rightWall.position.set(CONFIG.laneWidth * CONFIG.lanes / 2 + 2, 4, -i * 200);
        rightWall.castShadow = true;
        scene.add(rightWall);
        ground.push(rightWall);
        
       
        for (let p = 0; p < 10; p++) {
            const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 6, 8);
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(
                Math.random() > 0.5 ? -CONFIG.laneWidth * CONFIG.lanes / 2 - 1.5 : CONFIG.laneWidth * CONFIG.lanes / 2 + 1.5,
                3,
                -i * 200 - p * 20
            );
            pillar.castShadow = true;
            scene.add(pillar);
            pillars.push(pillar);
        }
    }
}

function createObstacle(lane, z) {
    const obstacleGroup = new THREE.Group();
    
    const types = ['box', 'barrier', 'cone', 'train'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let mesh;
    if (type === 'box') {
        const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const material = new THREE.MeshStandardMaterial({ color: 0xff4757 });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.75;
    } else if (type === 'barrier') {
        const geometry = new THREE.BoxGeometry(2, 1, 0.5);
        const material = new THREE.MeshStandardMaterial({ color: 0xffa502 });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.5;
    } else if (type === 'train') {
        const trainGeometry = new THREE.BoxGeometry(2.5, 2.5, 8);
        const trainMaterial = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
        mesh = new THREE.Mesh(trainGeometry, trainMaterial);
        mesh.position.y = 1.25;
       
        const windowGeometry = new THREE.BoxGeometry(2.6, 0.8, 6);
        const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x3498db, transparent: true, opacity: 0.7 });
        const windows = new THREE.Mesh(windowGeometry, windowMaterial);
        windows.position.y = 0.5;
        mesh.add(windows);
        
        
        const stripeGeometry = new THREE.BoxGeometry(2.6, 0.2, 8);
        const stripeMaterial = new THREE.MeshStandardMaterial({ color: 0xf1c40f });
        const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe.position.y = -0.8;
        mesh.add(stripe);
    } else {
        const geometry = new THREE.ConeGeometry(0.5, 1.5, 8);
        const material = new THREE.MeshStandardMaterial({ color: 0xff6348 });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.75;
    }
    
    mesh.castShadow = true;
    obstacleGroup.add(mesh);
    
    const x = (lane * CONFIG.laneWidth) - (CONFIG.laneWidth * CONFIG.lanes / 2) + CONFIG.laneWidth / 2;
    obstacleGroup.position.set(x, 0, z);
    obstacleGroup.userData = { lane, type };
    
    scene.add(obstacleGroup);
    obstacles.push(obstacleGroup);
}

function createCoin(lane, z) {
    const coinGroup = new THREE.Group();
    
    
    const geometry = new THREE.CylinderGeometry(0.4, 0.4, 0.15, 16);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xffd700,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x332200
    });
    const coin = new THREE.Mesh(geometry, material);
    coin.rotation.x = Math.PI / 2;
    coin.castShadow = true;
    coinGroup.add(coin);
    
   
    const glowGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffff00,
        transparent: true,
        opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.rotation.x = Math.PI / 2;
    coinGroup.add(glow);
    
    const x = (lane * CONFIG.laneWidth) - (CONFIG.laneWidth * CONFIG.lanes / 2) + CONFIG.laneWidth / 2;
    coinGroup.position.set(x, 1.8, z);
    coinGroup.userData = { lane, collected: false };
    
    scene.add(coinGroup);
    coins.push(coinGroup);
}

function spawnObjects() {
    
    spawnTimer++;
    if (spawnTimer >= 60) {
        spawnTimer = 0;
        
        const spawnZ = player.position.z - 40;
        
        console.log('Spawning at Z:', spawnZ, 'Player Z:', player.position.z);
        
       
        const obstacleLane = Math.floor(Math.random() * CONFIG.lanes);
        createObstacle(obstacleLane, spawnZ);
        
        for (let lane = 0; lane < CONFIG.lanes; lane++) {
            if (lane !== obstacleLane) {
            
                for (let i = 0; i < 4; i++) {
                    createCoin(lane, spawnZ - i * 3 - 2);
                }
            }
        }
        
        console.log('Spawned! Obstacles:', obstacles.length, 'Coins:', coins.length);
    }
}

function updatePlayer() {
    
    const targetX = (currentLane * CONFIG.laneWidth) - (CONFIG.laneWidth * CONFIG.lanes / 2) + CONFIG.laneWidth / 2;
    player.position.x += (targetX - player.position.x) * CONFIG.playerSpeed;
    
    
    if (isJumping) {
        const elapsed = Date.now() - jumpStartTime;
        const progress = elapsed / CONFIG.jumpDuration;
        
        if (progress < 1) {
            const jumpCurve = Math.sin(progress * Math.PI);
            player.position.y = 1 + jumpCurve * CONFIG.jumpHeight;
        } else {
            player.position.y = 1;
            isJumping = false;
        }
    }
 
    if (isSliding) {
        const elapsed = Date.now() - slideStartTime;
        if (elapsed > CONFIG.slideDuration) {
            player.scale.y = 1;
            player.position.y = 1;
            isSliding = false;
        } else {
            player.scale.y = 0.5;
            player.position.y = 0.5;
        }
    }
    
    
    runningAnimation += 0.15;
    if (!isJumping && !isSliding) {
        player.rotation.z = Math.sin(runningAnimation) * 0.05;
        player.position.y = 1 + Math.sin(runningAnimation * 2) * 0.05;
    }
    
  
    player.rotation.x = -0.1;
}

function updateGround() {
    ground.forEach(segment => {
        segment.position.z += gameState.speed;
        if (segment.position.z > 50) {
            segment.position.z -= 600;
        }
    });
    
    pillars.forEach(pillar => {
        pillar.position.z += gameState.speed;
        if (pillar.position.z > 50) {
            pillar.position.z -= 600;
        }
    });
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        
        
        obstacle.position.z += gameState.speed;
        
     
        if (obstacle.position.z > player.position.z + 5) {
            scene.remove(obstacle);
            obstacles.splice(i, 1);
            continue;
        }
        
        
        const distance = Math.abs(obstacle.position.z - player.position.z);
        const laneDistance = Math.abs(obstacle.position.x - player.position.x);
        
        if (distance < 2.5 && laneDistance < 1.2) {
           
            if (obstacle.userData.type === 'train') {
               
                console.log('Hit train!');
                gameOver();
                return;
            } else if (obstacle.userData.type === 'barrier') {
               
                if (!isSliding) {
                    console.log('Hit barrier!');
                    gameOver();
                    return;
                }
            } else {
               
                if (!isJumping) {
                    console.log('Hit obstacle!');
                    gameOver();
                    return;
                }
            }
        }
    }
}

function updateCoins() {
    for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        
      
        coin.position.z += gameState.speed;
        coin.rotation.y += 0.1; 
        
     
        coin.position.y = 1.8 + Math.sin(Date.now() * 0.005 + i) * 0.2;
        
       
        if (coin.position.z > player.position.z + 5) {
            scene.remove(coin);
            coins.splice(i, 1);
            continue;
        }
        
        if (!coin.userData.collected) {
            const distance = Math.abs(coin.position.z - player.position.z);
            const laneDistance = Math.abs(coin.position.x - player.position.x);
            if (distance < 2 && laneDistance < 1.2) {
                coin.userData.collected = true;
                collectCoin(coin, i);
            }
        }
    }
}

function collectCoin(coin, index) {
    gameState.coins++;
    gameState.score += CONFIG.coinValue;
    updateUI();
    
    audioManager.playCoin();
    
    const startScale = coin.scale.clone();
    const startY = coin.position.y;
    let animProgress = 0;
    
    const animateCoin = () => {
        animProgress += 0.1;
        if (animProgress < 1) {
            coin.scale.multiplyScalar(1.1);
            coin.position.y = startY + animProgress * 3;
            requestAnimationFrame(animateCoin);
        } else {
            scene.remove(coin);
            coins.splice(index, 1);
        }
    };
    animateCoin();
}

function updateScore() {
    gameState.score += CONFIG.scoreIncrement;
    
    if (gameState.score % 500 === 0 && gameState.score > 0) {
        gameState.speed = Math.min(CONFIG.obstacleSpeed * 1.8, gameState.speed + 0.02);
        gameState.difficulty++;
        audioManager.playMilestone();
    }
    
    updateUI();
}

function updateUI() {
    document.getElementById('score').textContent = Math.floor(gameState.score);
    document.getElementById('coins').textContent = gameState.coins;
}

function gameLoop() {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    updatePlayer();
    updateGround();
    updateObstacles();
    updateCoins();
    spawnObjects();
    updateScore();
    
    renderer.render(scene, camera);
    animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
    
    audioManager.resume();
    audioManager.playStart();
    audioManager.startBackgroundMusic();
    
    
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.coins = 0;
    gameState.speed = CONFIG.obstacleSpeed;
    gameState.difficulty = 1;
    
    currentLane = 1;
    isJumping = false;
    isSliding = false;
    spawnTimer = 0;
    
    obstacles.forEach(obs => scene.remove(obs));
    obstacles = [];
    coins.forEach(coin => scene.remove(coin));
    coins = [];
    
  
    player.position.set(0, 1, 5);
    player.scale.y = 1;
    
   
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('gameover-screen').classList.add('hidden');
    document.getElementById('pause-screen').classList.add('hidden');
    
   
    for (let i = 0; i < 3; i++) {
        const z = -15 - i * 12;
        const lane = Math.floor(Math.random() * CONFIG.lanes);
        createObstacle(lane, z);
        
      
        for (let coinLane = 0; coinLane < CONFIG.lanes; coinLane++) {
            if (coinLane !== lane) {
                createCoin(coinLane, z - 3);
                createCoin(coinLane, z - 6);
                createCoin(coinLane, z - 9);
            }
        }
    }
    
    
    spawnTimer = 0;
    
    console.log('Game started with', obstacles.length, 'obstacles and', coins.length, 'coins');
    
    updateUI();
    gameLoop();
}

function gameOver() {
    gameState.isPlaying = false;
    cancelAnimationFrame(animationId);
    
    
    audioManager.playGameOver();
    audioManager.stopBackgroundMusic();
    
    document.getElementById('final-score').textContent = Math.floor(gameState.score);
    document.getElementById('final-coins').textContent = gameState.coins;
    document.getElementById('gameover-screen').classList.remove('hidden');
}

function pauseGame() {
    if (!gameState.isPlaying) return;
    gameState.isPaused = true;
    document.getElementById('pause-screen').classList.remove('hidden');
    audioManager.stopBackgroundMusic();
}

function resumeGame() {
    gameState.isPaused = false;
    document.getElementById('pause-screen').classList.add('hidden');
    audioManager.startBackgroundMusic();
    gameLoop();
}

function returnToMenu() {
    gameState.isPlaying = false;
    gameState.isPaused = false;
    cancelAnimationFrame(animationId);
    audioManager.stopBackgroundMusic();
    
    document.getElementById('pause-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
document.addEventListener('keydown', (e) => {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            if (currentLane > 0) {
                currentLane--;
                audioManager.playLaneSwitch();
            }
            break;
        case 'ArrowRight':
            if (currentLane < CONFIG.lanes - 1) {
                currentLane++;
                audioManager.playLaneSwitch();
            }
            break;
        case 'ArrowUp':
        case ' ':
            if (!isJumping && !isSliding) {
                isJumping = true;
                jumpStartTime = Date.now();
                audioManager.playJump();
            }
            e.preventDefault();
            break;
        case 'ArrowDown':
            if (!isJumping && !isSliding) {
                isSliding = true;
                slideStartTime = Date.now();
                audioManager.playSlide();
            }
            e.preventDefault();
            break;
        case 'Escape':
            pauseGame();
            break;
    }
});


document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);
document.getElementById('resume-btn').addEventListener('click', resumeGame);
document.getElementById('menu-btn').addEventListener('click', returnToMenu);


let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        
        if (deltaX > 50 && currentLane < CONFIG.lanes - 1) {
            currentLane++;
            audioManager.playLaneSwitch();
        } else if (deltaX < -50 && currentLane > 0) {
            currentLane--;
            audioManager.playLaneSwitch();
        }
    } else {
        
        if (deltaY < -50 && !isJumping && !isSliding) {
            isJumping = true;
            jumpStartTime = Date.now();
            audioManager.playJump();
        } else if (deltaY > 50 && !isJumping && !isSliding) {
            isSliding = true;
            slideStartTime = Date.now();
            audioManager.playSlide();
        }
    }
});


document.getElementById('sound-toggle').addEventListener('click', () => {
    const btn = document.getElementById('sound-toggle');
    const enabled = audioManager.toggleSound();
    btn.textContent = enabled ? '🔊' : '🔇';
    btn.classList.toggle('muted', !enabled);
});

document.getElementById('music-toggle').addEventListener('click', () => {
    const btn = document.getElementById('music-toggle');
    const enabled = audioManager.toggleMusic();
    btn.textContent = enabled ? '🎵' : '🔇';
    btn.classList.toggle('muted', !enabled);
});


initScene();
renderer.render(scene, camera);
