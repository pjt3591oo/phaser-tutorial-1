class Scene1 extends Phaser.Scene {
  platforms;
  player;
  stars;
  bombs;
  score = 0;
  gameOver = false;

  RESTART = 'restart'

  constructor() {
    super("Scene1");
  }

  preload() {
    this.load.setBaseURL('https://raw.githubusercontent.com/pjt3591oo/phaser-tutorial-1/main/');

    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude',
      'assets/dude.png',
      { frameWidth: 32, frameHeight: 48 }
    );

    this.load.scenePlugin({
      key: 'rexuiplugin',
      url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
      sceneKey: 'rexUI'
    });
  }

  hitBomb(player, bomb) {
    this.physics.pause();
  
    player.setTint(0xee0000);
    player.anims.play('turn');
    this.gameOver = true;
  
    this.showDialog();
  }

  create() {
    this.makePlatform(this)
  
    this.player = this.physics.add.sprite(100, 450, 'dude');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(300);
    this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
  
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
  
    this.stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 30 }
    })
  
    this.stars.children.iterate(function (child) {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    })
  
    this.bombs = this.physics.add.group({
      key: 'bomb',
      repeat: 1,
      setXY: { x: 600, y: 100, stepX: 80 }
    })
  
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.bombs, this.platforms);
  
    this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
    this.physics.add.overlap(this.player, this.bombs, this.hitBomb, null, this);

    this.cursors = this.input.keyboard.createCursorKeys()
  }

  collectStar(player, star) {
    star.disableBody(true, true);
    this.score += 11;
  
    this.scoreText.setText('Score: ' + this.score);
    
    console.log(`remain start count: ${this.stars.countActive(true)}`);
  
    if (this.stars.countActive(true) <= 0) { // 별을 다 먹었을 떄
      // 기존 별 갯수만큼 다시 생성
      this.stars.children.iterate(function (child) {
        child.enableBody(true, child.x, 0, true, true);
      });
  
      const x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
  
      const bomb = this.bombs.create(x, 16, 'bomb');
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  
      const bomb1 = this.bombs.create(x, 300, 'bomb');
      bomb1.setBounce(0.3);
      bomb1.setCollideWorldBounds(true);
      bomb1.setVelocity(Phaser.Math.Between(-200, 200), 20);
  
    }
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);

      this.player.anims.play('left', true);
    }
    else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);

      this.player.anims.play('right', true);
    }
    else {
      this.player.setVelocityX(0);

      this.player.anims.play('turn');
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-530);
    }
  }

  showDialog() {
    const dialog = this.rexUI.add.dialog({
      x: 400,
      y: 300,
      width: 500,

      background: this.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0),

      title: this.createLabel(this, 'GameOver').setDraggable(),

      content: this.createLabel(this, `Score: ${this.score}`),

      actions: [
        this.createLabel(this, this.RESTART)
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
      // .drawBounds(this.add.graphics(), 0xff0000)
      .popUp(1000);

    // this.print = this.add.text(0, 0, '');
    dialog
      .on('button.click', function (button, groupName, index, pointer, event) {
        // this.print.text += groupName + '-' + index + ': ' + button.text + '\n';
        if (button.text === this.RESTART) {
          this.scene.start();
        }
      }, this)
      .on('button.over', function (button, groupName, index, pointer, event) {
        button.getElement('background').setStrokeStyle(1, 0xffffff);
      })
      .on('button.out', function (button, groupName, index, pointer, event) {
        button.getElement('background').setStrokeStyle();
      });
  }

  createLabel(scene, text) {
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

  makePlatform() {
    this.add.image(400, 300, 'sky');

    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    this.platforms.create(600, 400, 'ground');
    this.platforms.create(50, 250, 'ground')
    this.platforms.create(750, 220, 'ground')
  }
}