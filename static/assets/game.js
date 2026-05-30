// =============================================
// GAME SCENE
// =============================================

let gameScene = new Phaser.Scene('GameScene');

// Runs once — load assets here
gameScene.preload = function() {
    this.load.spritesheet('player', PLAYER_SPRITE, {
        frameWidth: 84,
        frameHeight: 123
    });
};

// Runs once after preload — create game objects here
gameScene.create = function() {

    // Invisible vertical lanes — X positions across the screen
    // Player starts at x=80, finish line at x=880
    // 8 lanes evenly spaced between
    this.lanePositions = [200, 280, 360, 440, 520, 600, 680, 760];

    // Store premium status
    this.isPremium = IS_PREMIUM;

    // Create obstacles — one per lane, moving up/down
    this.obstacles = [];

    for (let i = 0; i < this.lanePositions.length; i++) {
        let startY = Phaser.Math.Between(50, 490);
        let speed = Phaser.Math.Between(2, 5);
        let direction = i % 2 === 0 ? 1 : -1; // alternate up/down

        let obs = this.add.rectangle(
            this.lanePositions[i],
            startY,
            28, 48,
            0xff0000
        );

        obs.speed = speed;
        obs.direction = direction;
        this.obstacles.push(obs);
    }

    // Player sprite (created last — renders on top)
    this.player = this.add.sprite(80, 270, 'player');
    this.player.setFrame(0);
    this.player.setScale(0.35);

    // Walk animations
    this.anims.create({
        key: 'walk-right',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
        frameRate: 6,
        repeat: 0
    });

    // Keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();

    // Step size
    this.stepSize = 80;

    // Canvas boundaries
    this.canvasLeft = 80;
    this.canvasRight = 880;
    this.canvasTop = 20;
    this.canvasBottom = 520;

    // Finish line
    this.finishLine = this.add.rectangle(900, 270, 4, 540, 0xffdd00);

    // Game state
    this.isGameOver = false;

};

// Runs ~60 times per second — game logic goes here
gameScene.update = function() {

    if (this.isGameOver) return;

    // Move player right
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
        if (this.player.x + this.stepSize <= this.canvasRight) {
            this.player.x += this.stepSize;
            this.player.play('walk-right');
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

    if (this.player.x >= this.canvasRight) {
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

    this.add.text(480, 220, 'LEVEL COMPLETE!', {
        fontSize: '64px',
        fill: '#ffdd00',
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