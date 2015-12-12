window.states = window.states || {};
window.states.gameState = (function() {

	function gameState() {};

	gameState.prototype.preload = function() {
		_.forEach(globals.assets.graphs, function(src, name) {
			game.load.image(name, src);
		});
	};

	gameState.prototype.create = function() {
		// initialize game
		_.forEach(globals.controls, function(key, action) {
			window.state.controls[action] = game.input.keyboard.addKey(Phaser.Keyboard[key]);
		});

		gameState.arenaWidth = 5000;
		gameState.arenaHeight = 5000;

		util.factory(Ship);
		for (var i=0; i < 50; i++) {
			util.factory(Scrap);
		}
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

	var Ship = (function() {
		util.extend(Ship, util.prototypes.SpaceObj);

		function Ship() {
			this.x = globals.screenWidth / 2;
			this.y = globals.screenHeight / 2;
			this.xspeed = 0;
			this.yspeed = 0;
			this.sprite = game.add.sprite(this.x, this.y, 'ship');
			this.sprite.anchor.set(0.5, 0.5);
			this.sprite.angle = 0;
			this.sprite.angle = 180;
			this.addAngle = 0;

			window.ship = this;

			game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
		}

		Ship.prototype.go = function() {
			this.addAngle *= 0.83;

			if (window.state.controls.left.isDown) {
				this.addAngle--;
			}
			if (window.state.controls.right.isDown) {
				this.addAngle++;
			}
			if (window.state.controls.thrust.isDown) {
				this.xspeed += util.getDistX(util.angleToRad(this.sprite.angle)) * 0.2;
				this.yspeed += util.getDistY(util.angleToRad(this.sprite.angle)) * 0.2;
			}
			if (window.state.controls.fire.isDown) {

			}

			this.sprite.x += this.xspeed;
			this.sprite.y += this.yspeed;
			this.sprite.angle += this.addAngle;
			//Ship.__super__.tick.call(this);
		};

		return Ship;
	}());

	var Scrap = (function() {
		util.extend(Scrap, util.prototypes.SpaceObj);

		function Scrap(x, y) {
			this.x = x || util.rand(0, gameState.arenaWidth);
			this.y = y || util.rand(0, gameState.arenaHeight);
			this.xspeed = util.rand(-1, 1, true);
			this.yspeed = util.rand(-1, 1, true);
			this.sprite = game.add.sprite(this.x, this.y, 'scrap');
			this.sprite.anchor.set(0.5, 0.5);
			this.sprite.angle = util.rand(-180, 180, true);
			this.addAngle = util.rand(-2, 2, true);

			game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
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