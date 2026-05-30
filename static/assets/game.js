// =============================================
// GAME SCENE
// =============================================

let gameScene = new Phaser.Scene('GameScene');

// Runs once — load assets here
gameScene.preload = function() {
    this.load.image('player', PLAYER_SPRITE);
    this.load.image('obs_404', OBS_404);
    this.load.image('obs_anchor', OBS_ANCHOR);
};

// Runs once after preload — create game objects here
gameScene.create = function() {

    // Invisible vertical lanes — X positions across the screen
    // Player starts at x=80, finish line at x=880
    // 8 lanes evenly spaced between
    this.lanePositions = [180, 280, 380, 480, 580, 680, 780, 880];

    // Store premium status
    this.isPremium = IS_PREMIUM;

    // Timer
    this.elapsedTime = 0;
    this.timerText = this.add.text(480, 20, 'Time: 0s', {
        fontSize: '20px',
        fill: '#ffffff'
    }).setOrigin(0.5);

    // Create obstacles — one per lane, moving up/down
    this.obstacles = [];

    for (let i = 0; i < this.lanePositions.length; i++) {
        let startY = Phaser.Math.Between(50, 490);
        let speed = Phaser.Math.Between(1, 3);
        let direction = i % 2 === 0 ? 1 : -1; // alternate up/down
        let obsKey = i % 2 === 0 ? 'obs_404' : 'obs_anchor';

        let obs = this.add.image(
            this.lanePositions[i],
            startY,
             obsKey
        );
        obs.setScale(0.04);


        obs.speed = speed;
        obs.direction = direction;
        this.obstacles.push(obs);
    }

    // Player image (created last — renders on top)
    this.player = this.add.image(80, 270, 'player');
    this.player.setScale(0.12);

    // Keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();

    // Step size
    this.stepSize = 100;

    // Canvas boundaries
    this.canvasLeft = 80;
    this.canvasRight = 900;
    this.canvasTop = 20;
    this.canvasBottom = 520;

    // Finish line
    this.finishLine = this.add.rectangle(920, 270, 4, 540, 0xffdd00);

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

        if (dx < (16 + 14) && dy < (16 + 24)) {
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

    // Submit score to Django
    fetch('/game/submit-score/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            world: 'ocean',
            score: 100,
            time_seconds: Math.floor(this.elapsedTime)
        })
    }).then(() => {
        // Redirect free users to showroom
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