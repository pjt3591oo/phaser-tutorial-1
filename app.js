const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 } // gravity: 중력
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

function preload() {
  this.load.setBaseURL('https://raw.githubusercontent.com/pjt3591oo/phaser-tutorial-1/main/');

  this.load.image('sky', 'assets/sky.png');
  this.load.image('ground', 'assets/platform.png');
  this.load.image('star', 'assets/star.png');
  this.load.image('bomb', 'assets/bomb.png');
  this.load.spritesheet('dude',
    'assets/dude.png',
    { frameWidth: 32, frameHeight: 48 }
  );

  console.log(123)

  this.load.scenePlugin({
    key: 'rexuiplugin',
    url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
    sceneKey: 'rexUI'
  });
}


let platforms;
let player;
let stars;
let bombs;
let score = 0;
let gameOver = false;

const RESTART = 'restart'

function create() {
  makePlatform(this)

  player = this.physics.add.sprite(100, 450, 'dude');
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  player.body.setGravityY(300);
  scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  })
  this.anims.create({
    key: 'turn',
    frames: [{ key: 'dude', frame: 4 }],
    frameRate: 20,
  })
  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  })

  stars = this.physics.add.group({
    key: 'star',
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 30 }
  })

  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  })

  bombs = this.physics.add.group({
    key: 'bomb',
    repeat: 1,
    setXY: { x: 600, y: 100, stepX: 80 }
  })

  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(bombs, platforms);

  this.physics.add.overlap(player, stars, collectStar, null, this);
  this.physics.add.overlap(player, bombs, hitBomb, null, this);
}

function collectStar(player, star) {
  star.disableBody(true, true);
  score += 11;

  scoreText.setText('Score: ' + score);
  console.log(stars.countActive(true));

  if (stars.countActive(true) === 0) { // 별을 다 먹었을 떄
    // 기존 별 갯수만큼 다시 생성
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });

    const x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

    const bomb = bombs.create(x, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

    const bomb1 = bombs.create(x, 300, 'bomb');
    bomb1.setBounce(0.3);
    bomb1.setCollideWorldBounds(true);
    bomb1.setVelocity(Phaser.Math.Between(-200, 200), 20);

  }
}

function hitBomb(player, bomb) {
  this.physics.pause();

  player.setTint(0xee0000);
  player.anims.play('turn');
  gameOver = true;

  showDialog(this);
}

const showDialog = (self) => {
  const dialog = self.rexUI.add.dialog({
    x: 400,
    y: 300,
    width: 500,

    background: self.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0),

    title: createLabel(self, 'GameOver').setDraggable(),

    content: createLabel(self, `Score: ${score}`),

    actions: [
      createLabel(self, RESTART)
    ],

    space: {
      left: 20,
      right: 20,
      top: -20,
      bottom: -20,

      title: 25,
      titleLeft: 30,
      content: 25,
      description: 25,
      descriptionLeft: 20,
      descriptionRight: 20,
      choices: 25,

      toolbarItem: 5,
      choice: 15,
      action: 15,
    },

    expand: {
      title: false,
    },

    align: {
      title: 'center',
      actions: 'right', // 'center'|'left'|'right'
    },

    click: {
      mode: 'release'
    }
  })
    .setDraggable('background')   // Draggable-background
    .layout()
    // .drawBounds(self.add.graphics(), 0xff0000)
    .popUp(1000);

  // self.print = self.add.text(0, 0, '');
  dialog
    .on('button.click', function (button, groupName, index, pointer, event) {
      // self.print.text += groupName + '-' + index + ': ' + button.text + '\n';
      if (button.text === RESTART) {
        self.scene.start();
      }
    }, this)
    .on('button.over', function (button, groupName, index, pointer, event) {
      button.getElement('background').setStrokeStyle(1, 0xffffff);
    })
    .on('button.out', function (button, groupName, index, pointer, event) {
      button.getElement('background').setStrokeStyle();
    });
}

const createLabel = function (scene, text) {
  return scene.rexUI.add.label({
    width: 40, // Minimum width of round-rectangle
    height: 40, // Minimum height of round-rectangle

    background: scene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x5e92f3),

    text: scene.add.text(0, 0, text, {
      fontSize: '24px'
    }),

    space: {
      left: 10,
      right: 10,
      top: 10,
      bottom: 10
    }
  });
}

function update() {
  cursors = this.input.keyboard.createCursorKeys()
  if (cursors.left.isDown) {
    player.setVelocityX(-160);

    player.anims.play('left', true);
  }
  else if (cursors.right.isDown) {
    player.setVelocityX(160);

    player.anims.play('right', true);
  }
  else {
    player.setVelocityX(0);

    player.anims.play('turn');
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-530);
  }
}

function makePlatform(self) {
  self.add.image(400, 300, 'sky');

  platforms = self.physics.add.staticGroup();
  platforms.create(400, 568, 'ground').setScale(2).refreshBody();
  platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground')
  platforms.create(750, 220, 'ground')
}