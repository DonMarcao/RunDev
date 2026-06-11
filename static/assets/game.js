// =============================================
// WORLD CONFIGURATION
// =============================================

const WORLD_CONFIG = {
    ocean: {
        playerKey: 'player_oc',
        finishKey: 'finish_oc',
        obsKeys: ['obs_oc_0', 'obs_oc_1', 'obs_oc_2', 'obs_oc_3', 'obs_oc_4', 'obs_oc_5', 'obs_oc_6', 'obs_oc_7'],
        speedMin: 0.8,
        speedMax: 2.0,
        worldName: 'Web Ocean',
        scoreKey: 'ocean',
        obsScale: 0.05,
        playerScale: 0.05,
        finishScale: 0.08
    },
    cloud: {
        playerKey: 'player_cc',
        finishKey: 'finish_cc',
        obsKeys: ['obs_cc_0', 'obs_cc_1', 'obs_cc_2', 'obs_cc_3', 'obs_cc_4', 'obs_cc_5', 'obs_cc_6', 'obs_cc_7'],
        speedMin: 1.0,
        speedMax: 2.5,
        worldName: 'Cloud City',
        scoreKey: 'cloud',
        obsScale: 0.09,
        playerScale: 0.09,
        finishScale: 0.12
    },
    space: {
        playerKey: 'player_cs',
        finishKey: 'finish_cs',
        obsKeys: ['obs_cs_0', 'obs_cs_1', 'obs_cs_2', 'obs_cs_3', 'obs_cs_4', 'obs_cs_5', 'obs_cs_6', 'obs_cs_7'],
        speedMin: 1.3,
        speedMax: 2.8,
        worldName: 'Code Space',
        scoreKey: 'space',
        obsScale: 0.07,
        playerScale: 0.07,
        finishScale: 0.10
    },
    matrix: {
        playerKey: 'player_bm',
        finishKey: 'finish_bm',
        obsKeys: ['obs_bm_0', 'obs_bm_1', 'obs_bm_2', 'obs_bm_3', 'obs_bm_4', 'obs_bm_5', 'obs_bm_6', 'obs_bm_7'],
        speedMin: 1.6,
        speedMax: 3.0,
        worldName: 'Binary Matrix',
        scoreKey: 'matrix',
        obsScale: 0.07,
        playerScale: 0.07,
        finishScale: 0.10
    }
};

// =============================================
// GAME SCENE
// =============================================

let gameScene = new Phaser.Scene('GameScene');

// Runs once — load assets here
gameScene.preload = function() {

    // Ocean assets
    this.load.image('player_oc', PLAYER_OC);
    this.load.image('finish_oc', FINISH_OC);
    OBS_OC.forEach((url, i) => this.load.image('obs_oc_' + i, url));

    // Cloud City assets
    this.load.image('player_cc', PLAYER_CC);
    this.load.image('finish_cc', FINISH_CC);
    OBS_CC.forEach((url, i) => this.load.image('obs_cc_' + i, url));

};

// Runs once after preload — create game objects here
gameScene.create = function() {

    const config = WORLD_CONFIG[CURRENT_WORLD] || WORLD_CONFIG.ocean;

    // Invisible vertical lanes
    this.lanePositions = [180, 280, 380, 480, 580, 680, 780, 880];

    // Store world config and premium status
    this.worldConfig = config;
    this.isPremium = IS_PREMIUM;

    // Timer
    this.elapsedTime = 0;
    this.timerText = this.add.text(480, 20, 'Time: 0s', {
        fontSize: '20px',
        fill: '#ffffff'
    }).setOrigin(0.5);

    // Create obstacles — 2 per lane, moving up/down
    this.obstacles = [];

    for (let i = 0; i < this.lanePositions.length; i++) {
        let speed = (Phaser.Math.Between(
            Math.round(config.speedMin * 10),
            Math.round(config.speedMax * 10)
        )) / 10;
        let direction = i % 2 === 0 ? 1 : -1;
        let obsKey = config.obsKeys[i % config.obsKeys.length];

        for (let j = 0; j < 2; j++) {
            let obs = this.add.image(
                this.lanePositions[i],
                (j * 220) + Phaser.Math.Between(50, 150),
                obsKey
            );
            obs.setScale(config.obsScale);
            obs.speed = speed;
            obs.direction = direction;
            this.obstacles.push(obs);
        }
    }

    // Finish line
    this.add.image(910, 30, config.finishKey).setScale(config.finishScale);
    this.add.image(910, 510, config.finishKey).setScale(config.finishScale);
    this.add.rectangle(910, 270, 2, 440, 0xffdd00);

    // Player (created last — renders on top)
    this.player = this.add.image(80, 270, config.playerKey);
    this.player.setScale(config.playerScale);

    // Keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();

    // Step size
    this.stepSize = 100;

    // Canvas boundaries
    this.canvasLeft = 80;
    this.canvasRight = 880;
    this.canvasTop = 20;
    this.canvasBottom = 520;

    // Game state
    this.isGameOver = false;

};

// Runs ~60 times per second — game logic goes here
gameScene.update = function(time, delta) {

    if (this.isGameOver) return;

    // Move player right
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
        if (this.player.x + this.stepSize <= this.canvasRight) {
            this.player.x += this.stepSize;
        }
    }

    // Move player left
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
        if (this.player.x - this.stepSize >= this.canvasLeft) {
            this.player.x -= this.stepSize;
        }
    }

    // Move player up
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
        if (this.player.y - this.stepSize >= this.canvasTop) {
            this.player.y -= this.stepSize;
        }
    }

    // Move player down
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
        if (this.player.y + this.stepSize <= this.canvasBottom) {
            this.player.y += this.stepSize;
        }
    }

    // Move obstacles up and down
    for (let obs of this.obstacles) {
        obs.y += obs.speed * obs.direction;

        if (obs.y > 520) obs.direction = -1;
        if (obs.y < 20) obs.direction = 1;
    }

    // Update timer
    this.elapsedTime += delta / 1000;
    this.timerText.setText('Time: ' + Math.floor(this.elapsedTime) + 's');

    // =============================================
    // COLLISION DETECTION
    // =============================================

    for (let obs of this.obstacles) {
        let dx = Math.abs(this.player.x - obs.x);
        let dy = Math.abs(this.player.y - obs.y);

        if (dx < 25 && dy < 25) {
            this.gameOver();
        }
    }

    // =============================================
    // WIN CONDITION
    // =============================================

    if (this.player.x >= 880) {
        this.levelComplete();
    }

};

// =============================================
// GAME OVER
// =============================================

gameScene.gameOver = function() {

    this.isGameOver = true;
    this.player.setTint(0xff0000);

    this.add.text(480, 220, 'GAME OVER', {
        fontSize: '64px',
        fill: '#ff0000',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(480, 320, 'Press SPACE to restart', {
        fontSize: '24px',
        fill: '#ffffff'
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', function() {
        this.scene.restart();
    }, this);

};

// =============================================
// LEVEL COMPLETE
// =============================================

gameScene.levelComplete = function() {

    this.isGameOver = true;
    this.player.setTint(0xffdd00);

    // Calculate score — 100pts under 3s, -5pts per second after, minimum 50pts
    let score = Math.max(50, 100 - Math.max(0, Math.floor(this.elapsedTime) - 3) * 5);

    // Submit score to Django
    fetch('/game/submit-score/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            world: this.worldConfig.scoreKey,
            score: score,
            time_seconds: Math.floor(this.elapsedTime)
        })
    }).then(response => response.json())
    .then(data => {
        if (!IS_PREMIUM && CURRENT_WORLD === 'ocean') {
            setTimeout(() => {
                window.location.href = '/game/showroom/';
            }, 2000);
        } else if (IS_PREMIUM && data.worlds_unlocked) {
            const worldOrder = ['ocean', 'cloud', 'space', 'matrix'];
            const currentIndex = worldOrder.indexOf(CURRENT_WORLD);
            const nextWorld = worldOrder[currentIndex + 1];
            if (nextWorld && data.worlds_unlocked > currentIndex + 1) {
                setTimeout(() => {
                    window.location.href = '/game/?world=' + nextWorld;
                }, 3000);
            }
        }
    });

    this.add.text(480, 200, 'LEVEL COMPLETE!', {
        fontSize: '64px',
        fill: '#ffdd00',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(480, 280, 'Score: ' + score, {
        fontSize: '40px',
        fill: '#08fa04',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(480, 340, !IS_PREMIUM ? 'Redirecting...' : 'Press SPACE for next world', {
        fontSize: '20px',
        fill: '#ffffff'
    }).setOrigin(0.5);

    if (IS_PREMIUM) {
        this.input.keyboard.once('keydown-SPACE', function() {
            const worldOrder = ['ocean', 'cloud', 'space', 'matrix'];
            const currentIndex = worldOrder.indexOf(CURRENT_WORLD);
            const nextWorld = worldOrder[currentIndex + 1];
            if (nextWorld) {
                window.location.href = '/game/?world=' + nextWorld;
            } else {
                window.location.href = '/leaderboard/';
            }
        }, this);
    }

};

// =============================================
// HELPERS
// =============================================

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// =============================================
// GAME CONFIGURATION
// =============================================

let config = {
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    transparent: true,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: gameScene
};

let game = new Phaser.Game(config);