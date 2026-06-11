// =============================================
// GAME SCENE
// =============================================

let gameScene = new Phaser.Scene('GameScene');

// Runs once — load assets here
gameScene.preload = function() {
    this.load.image('player', PLAYER_SPRITE);
    this.load.image('obs_404', OBS_404);
    this.load.image('obs_anchor', OBS_ANCHOR);
    this.load.image('obs_cookie', OBS_COOKIE);
    this.load.image('obs_jellyfish', OBS_JELLYFISH);
    this.load.image('obs_snail', OBS_SNAIL);
    this.load.image('obs_virus', OBS_VIRUS);
    this.load.image('obs_link', OBS_LINK);
    this.load.image('obs_ladybug', OBS_LADYBUG);
    this.load.image('finish', OBS_FINISH);
};

// Runs once after preload — create game objects here
gameScene.create = function() {

    // Invisible vertical lanes — X positions across the screen
    this.lanePositions = [180, 280, 380, 480, 580, 680, 780, 880];

    // Store premium status
    this.isPremium = IS_PREMIUM;

    // Timer
    this.elapsedTime = 0;
    this.timerText = this.add.text(480, 20, 'Time: 0s', {
        fontSize: '20px',
        fill: '#ffffff'
    }).setOrigin(0.5);

    // Obstacle sprites per lane
    const obsKeys = [
        'obs_404', 'obs_anchor', 'obs_cookie', 'obs_jellyfish',
        'obs_snail', 'obs_virus', 'obs_link', 'obs_ladybug'
    ];

    // Create obstacles — 2 per lane, moving up/down
    this.obstacles = [];

    for (let i = 0; i < this.lanePositions.length; i++) {
        let speed = (Phaser.Math.Between(5, 20)) / 10;
        let direction = i % 2 === 0 ? 1 : -1;

        for (let j = 0; j < 2; j++) {
            let obs = this.add.image(
                this.lanePositions[i],
                (j * 220) + Phaser.Math.Between(50, 150),
                obsKeys[i]
            );
            obs.setScale(0.05);
            obs.speed = speed;
            obs.direction = direction;
            this.obstacles.push(obs);
        }
    }

    // Finish line markers
    this.add.image(910, 30, 'finish').setScale(0.08);
    this.add.image(910, 510, 'finish').setScale(0.08);

    // Finish line — thin yellow line between markers
    this.add.rectangle(910, 270, 2, 440, 0xffdd00);   

    // Player image (created last — renders on top)
    this.player = this.add.image(80, 270, 'player');
    this.player.setScale(0.05);

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

        // Reverse direction at boundaries
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
            world: 'ocean',
            score: score,
            time_seconds: Math.floor(this.elapsedTime)
        })
    }).then(() => {
        if (!IS_PREMIUM) {
            setTimeout(() => {
                window.location.href = '/game/showroom/';
            }, 2000);
        }
    });

    this.add.text(480, 220, 'LEVEL COMPLETE!', {
        fontSize: '64px',
        fill: '#ffdd00',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(480, 320, !IS_PREMIUM ? 'Redirecting...' : 'Press SPACE to restart', {
        fontSize: '24px',
        fill: '#ffffff'
    }).setOrigin(0.5);

    if (IS_PREMIUM) {
        this.input.keyboard.once('keydown-SPACE', function() {
            this.scene.restart();
        }, this);
    }

};

// =============================================
// HELPERS
// =============================================

// Get CSRF token from cookie
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