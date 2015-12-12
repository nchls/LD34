window.states = window.states || {};
window.states.gameState = (function() {

	function gameState() {};

	gameState.prototype.preload = function() {
		game.stage.backgroundColor = '#000';
		_.forEach(globals.assets.graphs, function(src, name) {
			game.load.image(name, src);
		});
		game.time.advancedTiming = true;
	};

	gameState.prototype.create = function() {
		initControls();
		initWorld();
		initPhysics();
		populate();
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

	gameState.prototype.render = function() {
		game.debug.text(game.time.fps || '-', 2, 14, '#fff');
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

/*
			this.sprite.body.onBeginContact.add(function(body1, body2, shape1, shape2, equation) {
				var shipBody = this.sprite.body;
				if (body1 !== null && body2 !== null) {
					// body2.fixedRotation = true;
					var constraint = game.physics.p2.createLockConstraint(shipBody, body2, [100, 0], 0);
				}
			}, this);
*/

			game.camera.follow(this.sprite);

			window.ship = this;
		}

		Ship.prototype.go = function() {
			if (window.state.controls.left.isDown) {
				this.sprite.body.angularVelocity -= 0.8;
			}
			if (window.state.controls.right.isDown) {
				this.sprite.body.angularVelocity += 0.8;
			}
			if (window.state.controls.thrust.isDown) {
				this.sprite.body.thrust(300);
			}

			var self = this;
			_.forEach(window.state.processRegistry[Scrap.toString()], function(scrap) {
				var distance = self.sprite.position.distance(scrap.sprite.position),
					angle = self.sprite.position.angle(scrap.sprite.position);

				// attraction zone
				if (distance < 400 && distance > 160) {
					scrap.sprite.body.velocity.x += Math.cos(angle) * ((240 - (distance - 160)) / -10);
					scrap.sprite.body.velocity.y += Math.sin(angle) * ((240 - (distance - 160)) / -10);
				}

				if (distance < 180 && distance > 140) {
					scrap.sprite.body.velocity.x = ((scrap.sprite.body.velocity.x * 26) + self.sprite.body.velocity.x) / 27;
					scrap.sprite.body.velocity.y = ((scrap.sprite.body.velocity.y * 26) + self.sprite.body.velocity.y) / 27;
				}

				// too close -- repel
				if (distance < 160) {
					scrap.sprite.body.velocity.x += Math.cos(angle) * ((160 - distance) / 0.7);
					scrap.sprite.body.velocity.y += Math.sin(angle) * ((160 - distance) / 0.7);
				}

			});

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

		}

		return Scrap;
	}());

	return gameState;

}());