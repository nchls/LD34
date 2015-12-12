window.states = window.states || {};
window.states.gameState = (function() {

	function gameState() {};

	gameState.prototype.preload = function() {
		game.stage.backgroundColor = '#000';
		_.forEach(globals.assets.graphs, function(src, name) {
			game.load.image(name, src);
		});
	};

	gameState.prototype.create = function() {
		initControls();
		initWorld();
		initPhysics();
		populate();

		/*
		var sprites = [];
		_.forEach(state.processRegistry, function(processes) {
			sprites = sprites.concat(_.pluck(processes, 'sprite'));
		});
		game.physics.p2.enable(sprites, false);

		_.forEach(sprites, function(sprite) {
			sprite.body.setCircle(40);
		});
		*/

	};

	gameState.prototype.update = function() {
		_.forEach(window.state.processRegistry, function(processes, key) {
			_.forEach(processes, function(process) {
				if (process) {
					process.go();
				}
			});
		});
	};

	var initControls = function() {
		_.forEach(globals.controls, function(key, action) {
			window.state.controls[action] = game.input.keyboard.addKey(Phaser.Keyboard[key]);
		});
	};

	var initWorld = function() {
		game.world.resize(5000, 5000);
		game.add.tileSprite(0, 0, 5000, 5000, 'starfield');
	};

	var initPhysics = function() {
		window.game.physics.startSystem(Phaser.Physics.P2JS);
		game.physics.p2.restitution = 0.5;
	};

	var populate = function() {
		util.factory(Ship);
		for (var i=0; i < 100; i++) {
			util.factory(Scrap);
		}
	};

	var Ship = (function() {
		util.extend(Ship, util.prototypes.SpaceObj);

		function Ship() {
			this.x = globals.screenWidth / 2;
			this.y = globals.screenHeight / 2;
			this.sprite = game.add.sprite(this.x, this.y, 'ship');
			this.sprite.anchor.set(0.5, 0.5);
			game.physics.p2.enable(this.sprite, false);
			this.sprite.body.setCircle(25);
			this.sprite.body.angularDamping = 0.999;
			this.sprite.body.damping = 0;

			game.camera.follow(this.sprite);

			window.ship = this;

		}

		Ship.prototype.go = function() {

			if (window.state.controls.left.isDown) {
				this.sprite.body.angularVelocity -= 1;
			}
			if (window.state.controls.right.isDown) {
				this.sprite.body.angularVelocity += 1;
			}
			if (window.state.controls.thrust.isDown) {
				this.sprite.body.thrust(500);
			}

		};

		return Ship;
	}());

	var Scrap = (function() {
		util.extend(Scrap, util.prototypes.SpaceObj);

		function Scrap(x, y) {
			this.x = x || util.rand(0, game.world.width);
			this.y = y || util.rand(0, game.world.height);
			this.sprite = game.add.sprite(this.x, this.y, 'scrap');
			this.sprite.anchor.set(0.5, 0.5);

			game.physics.p2.enable(this.sprite, false);
			this.sprite.body.angle = util.rand(0, 360, true);
			this.sprite.body.thrust(util.rand(0, 5000, true));
			this.sprite.body.angle = util.rand(0, 360, true);
			this.sprite.body.angularVelocity = util.rand(-3, 3, true);
			this.sprite.body.setCircle(25);
			this.sprite.body.angularDamping = 0;
			this.sprite.body.damping = 0;
		}

		Scrap.prototype.go = function() {

			this.sprite.x += this.xspeed;
			this.sprite.y += this.yspeed;
			this.sprite.angle += this.addAngle;
		}

		return Scrap;
	}());

	return gameState;

}());