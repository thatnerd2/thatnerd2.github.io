var bullets;
var walls;
var tanks;
var players = [];
var player;
var layout;
var enemies = {};
var playState = function (game) {
  ready = false;
}

playState.prototype = {
	preload: preload, 
	create: create, 
	update: update 
}

function preload() {
  layout = getLayout(level);
  game.load.image('tankcenter', 'assets/tankcenter.png');
  game.load.image('redtankbody', 'assets/redtankbody.png');
  game.load.image('redtankhead', 'assets/redtankhead.png');
  
  if (layout.brownTanks.length > 0) {
    game.load.image('browntankhead', 'assets/browntankhead.png');
    game.load.image('browntankbody', 'assets/browntankbody.png');
  }

  if (layout.grayTanks.length > 0) {
    game.load.image('graytankbody', 'assets/graytankbody.png');
    game.load.image('graytankhead', 'assets/graytankhead.png');
  }

  if (layout.tealTanks.length > 0) {
    game.load.image('tealtankhead', 'assets/tealtankhead.png');
    game.load.image('tealtankbody', 'assets/tealtankbody.png');
  }
  
  if (layout.circleTanks.length > 0) {
    game.load.image('circletankbody', 'assets/circletankbody.png');
    game.load.image('circletankhead', 'assets/circletankhead.png');
  }
  
  if (layout.blueTanks.length > 0) {
    game.load.image('bluetankbody', 'assets/bluetankbody.png');
    game.load.image('bluetankhead', 'assets/bluetankhead.png');
  }

  if (layout.greenTanks.length > 0) {
    game.load.image('greentankbody', 'assets/greentankbody.png');
    game.load.image('greentankhead', 'assets/greentankhead.png');
  }

  game.load.image('horizontal_border', 'assets/horizontal_border.png');
  game.load.image('vertical_border', 'assets/vertical_border.png');
  game.load.image('wood-big', 'assets/wood-big.jpg');
  game.load.image('wood-small', 'assets/wood-small.jpg');
  game.load.image('wall1', 'assets/wall1.png');
  game.load.image('bullet_slow', 'assets/bullet_slow.png');
  game.physics.startSystem(Phaser.Physics.ARCADE);

  this.cursors = {
    up: game.input.keyboard.addKey(Phaser.Keyboard.W),
    down: game.input.keyboard.addKey(Phaser.Keyboard.S),
    left: game.input.keyboard.addKey(Phaser.Keyboard.A),
    right: game.input.keyboard.addKey(Phaser.Keyboard.D)
  }

}

function create() {
  if (layout.grid.length < 16) game.add.sprite(0, 0, 'wood-small');
  else game.add.sprite(0, 0, 'wood-big');
  
  bullets = createBulletGroup();
  walls = createWallGroup(layout.grid.length * WALL_HEIGHT, layout.grid[0].length * WALL_WIDTH);
  tanks = game.add.physicsGroup(Phaser.Physics.ARCADE);

  enactLayout(layout);
  
  for (var i = 0; i < layout.players.length; i++) {
    var p = new Player(game, layout.players[i].x, layout.players[i].y);
    players.push(p);
    tanks.add(p.heart);
  }

  player = (!isMultiplayer || clientType == "HOST") ? players[0] : players[1];

  game.input.onDown.add(function () {
    if (player.numBullets <= PLAYER_BULLET_LIMIT && !game.paused) {
      var angleToMouse = Math.atan2(game.input.activePointer.y - player.heart.y, game.input.activePointer.x - player.heart.x);
      var params = {
        rot: angleToMouse,
        x: player.heart.x + 30 * Math.cos(angleToMouse),
        y: player.heart.y + 30 * Math.sin(angleToMouse),
        speed: PLAYER_BULLET_SPEED,
        numBounces: PLAYER_RICOCHET
      }
      
      fire(params, player, true);
    }
  });

  

  if (!isMultiplayer || clientType == "HOST") {
    for (var id in enemies) {
       enemies[id].patrol();
    }

    game.time.events.loop(Phaser.Timer.SECOND / 10, function () {
      for (var id in enemies) {
        enemies[id].act();
      }
    }, this);

    game.time.events.loop(Phaser.Timer.SECOND, function () {
      for (var id in enemies) {
        enemies[id].move();
      }
    }, this);
    for (var id in enemies) {
      enemies[id].move();
    }

    game.time.events.loop(Phaser.Timer.SECOND, function () {
      console.log(game.time.fps + " FPS");
    }, this);
    game.time.advancedTiming = true;
  }

  watch(game.input.activePointer, ["x", "y"], function() {
    player.head.rotation = Math.atan2(game.input.activePointer.y - player.heart.y, game.input.activePointer.x - player.heart.x);
  });

  for(var key in this.cursors) {
    watch(this.cursors[key], ["isDown"], function () {
      player.handleMovement(this.cursors);
    }.bind(this));
  }
}

function update() {
  game.physics.arcade.collide(tanks, walls);
  game.physics.arcade.collide(tanks, tanks);
  game.physics.arcade.collide(bullets, walls, bulletWallCollide, null, this);
  game.physics.arcade.collide(bullets, bullets, bulletBulletCollide, null, this);
  game.physics.arcade.collide(tanks, bullets, destroyTank, null, this);
}