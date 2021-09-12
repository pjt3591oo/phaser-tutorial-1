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
  scene: [Scene1]
};

const game = new Phaser.Game(config);

