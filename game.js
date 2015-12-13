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
		game.world.resize(8000, 8000);
		game.add.tileSprite(0, 0, 8000, 8000, 'starfield');
	};

	var initPhysics = function() {
		window.game.physics.startSystem(Phaser.Physics.P2JS);
		game.physics.p2.restitution = 0.5;
	};

	var populate = function() {
		util.factory(Ship, ['player']);
		util.factory(Ship, ['ai']);
		for (var i=0; i < 70; i++) {
			util.factory(Scrap);
		}
	};

	var Ship = (function() {
		util.extend(Ship, util.prototypes.SpaceObj);

		function Ship(controller) {
			var self = this;

			this.controller = controller;

			if (this.controller === 'player') {
				this.x = globals.screenWidth / 2;
				this.y = globals.screenHeight / 2;
				window.ship = this;
			} else {
				this.x = game.world.width - 200;
				this.y = game.world.height - 200;
			}
			this.inputs = {};

			this.life = 100;
			this.baseAngularDamping = 0.9996;
			this.sprite = game.add.sprite(this.x, this.y, 'ship');
			this.sprite.anchor.set(0.5, 0.5);
			game.physics.p2.enable(this.sprite, false);
			this.sprite.body.setCircle(25);
			this.sprite.body.angularDamping = this.baseAngularDamping;
			this.sprite.body.damping = 0;

			this.beamImage = game.add.image(0, 0, 'beam');
			this.beamImage.anchor.set(0.5, 1);
			this.beamImage.kill();

			if (globals.collectMode === 'lock') {
				this.sprite.body.onBeginContact.add(function(body1, body2, shape1, shape2, equation) {
					var shipSprite = this.sprite;
					var shipBody = this.sprite.body;
					if (body1 !== null && body2 !== null) {
						body2.isLocked = true;
						body2.angularVelocity = 0;
						body2.velocity.x = 0;
						body2.fixedY = 0;
						body2.setZeroForce();
						window.body2 = body2;
						var distance = shipSprite.position.distance({x: body2.position[0], y: body2.position[1]});
						var angle = shipSprite.position.angle({x: body2.position[0], y: body2.position[1]});
						console.log(angle, distance);
						var constraint = game.physics.p2.createLockConstraint(shipBody, body2, [100, 0], 0);
					}
				}, this);
			}

			if (globals.collectMode === 'gravity') {
				this.sprite.body.onBeginContact.add(function(body1, body2, shape1, shape2, equation) {
					console.log('collision force is ' + equation[0].multiplier);
					self.life -= _.round(equation[0].multiplier / 100);
					//self.sprite.body.angularVelocity += util.rand(-3, 3, true);
					//self.sprite.body.angularDamping = 0.9;
				});
			}

			if (this.controller === 'player') {
				game.camera.follow(this.sprite);
			}

			this.lifeBar = game.add.text(0, 0, this.life, globals.fonts.main);
			this.lifeBar.anchor.set(0.5);

		}

		Ship.prototype.go = function() {

			this.inputs.fire = false;
			if (this.controller === 'player') {
				this.inputs.left = window.state.controls.left.isDown;
				this.inputs.right = window.state.controls.right.isDown;
				this.inputs.thrust = window.state.controls.thrust.isDown;
				this.inputs.reverse = window.state.controls.reverse.isDown;
				this.inputs.charge = window.state.controls.charge.isDown;
			}

			if (this.inputs.left) {
				this.sprite.body.angularVelocity -= 0.8;
			}
			if (this.inputs.right) {
				this.sprite.body.angularVelocity += 0.8;
			}
			if (this.inputs.thrust) {
				this.sprite.body.thrust(300);
			}
			if (this.inputs.reverse) {
				this.sprite.body.reverse(200);
			}

			if (this.sprite.body.angularDamping < this.baseAngularDamping) {
				this.sprite.body.angularDamping += 0.002;
			} else {
				this.sprite.body.angularDamping = this.baseAngularDamping;
			}

			if (globals.collectMode === 'gravity') {

				if (this.inputs.charge) {
					if (!this.weaponCharging) {
						this.weaponCharging = true;
						this.beamImage.reset(this.sprite.position.x, this.sprite.position.y);
					}
					this.beamImage.angle = this.sprite.body.angle;
					this.beamImage.x = this.sprite.position.x + (this.sprite.body.velocity.x / 60);
					this.beamImage.y = this.sprite.position.y + (this.sprite.body.velocity.y / 60);
					this.beamImage.alpha = util.rand(0.15, 0.25, true);
				}

				if (this.weaponCharging) {
					if (!this.inputs.charge) {
						this.weaponCharging = false;
						this.inputs.fire = true;
						this.beamImage.kill();
					}
				}

				var self = this;
				var shipAngle = util.angleToRad(self.sprite.body.angle);
				var shipDeltaAngle = util.angleToRad(self.sprite.body.angle - 90);
				_.forEach(window.state.processRegistry[Scrap.toString()], function(scrap) {
					if (scrap.isMagnetized) {

						var distance = self.sprite.position.distance(scrap.sprite.position),
							angleToScrap,
							angleToShip;

						if (distance < 400) {

							if (scrap.magnetizedToPlayer === false || scrap.magnetizedToPlayer === self) {

								angleToScrap = self.sprite.position.angle(scrap.sprite.position);

								// attraction zone
								if (distance < 400 && distance > 160) {
									scrap.sprite.body.velocity.x += Math.cos(angleToScrap) * ((240 - (distance - 160)) / -5);
									scrap.sprite.body.velocity.y += Math.sin(angleToScrap) * ((240 - (distance - 160)) / -5);
								}

								// too close -- repel
								if (distance < 160) {
									angleToShip = scrap.sprite.position.angle(self.sprite.position);
									var travelAngle = scrap.sprite.position.angle({
										x: scrap.sprite.position.x + scrap.sprite.body.velocity.x,
										y: scrap.sprite.position.y + scrap.sprite.body.velocity.y
									});
									var angleDelta = util.getAngleDelta(angleToShip, travelAngle);
									var repelForce = _.max([angleDelta / 2, 0.3]);
									scrap.sprite.body.velocity.x += Math.cos(angleToScrap) * ((160 - distance) / repelForce);
									scrap.sprite.body.velocity.y += Math.sin(angleToScrap) * ((160 - distance) / repelForce);
								}

								if (self.inputs.fire && distance < 350) {
									var angleDelta = util.getAngleDelta(shipDeltaAngle, angleToScrap);
									if (angleDelta < 0.3) {
										scrap.deMagnetize();
										scrap.sprite.body.velocity.x += Math.cos(shipDeltaAngle) * 2000;
										scrap.sprite.body.velocity.y += Math.sin(shipDeltaAngle) * 2000;
									}
								}

								// Beam loading
								if (self.weaponCharging && distance < 400) {
									scrap.sprite.body.velocity.x += util.getDistX(shipAngle + Math.PI) * 10;
									scrap.sprite.body.velocity.y += util.getDistY(shipAngle + Math.PI) * 10;
								}

								// Orbit drag
								if (distance < 180 && distance > 140) {
									scrap.sprite.body.velocity.x = ((scrap.sprite.body.velocity.x * 26) + self.sprite.body.velocity.x) / 27;
									scrap.sprite.body.velocity.y = ((scrap.sprite.body.velocity.y * 26) + self.sprite.body.velocity.y) / 27;
								}

								// Unlock scrap
								if (distance < 200) {
									scrap.magnetizedToPlayer = self;
								}

							}

						} else {
							if (scrap.magnetizedToPlayer === self) {
								scrap.magnetizedToPlayer = false;
							}
						}
					}
				});

			}

			this.lifeBar.x = this.sprite.x;
			this.lifeBar.y = this.sprite.y + 50;
			this.lifeBar.text = this.life;

		};

		return Ship;
	}());

	var Scrap = (function() {
		util.extend(Scrap, util.prototypes.SpaceObj);

		function Scrap(x, y) {
			this.x = x || util.rand(0, game.world.width);
			this.y = y || util.rand(0, game.world.height);
			this.isMagnetized = true;
			this.magnetizedToPlayer = false;
			this.sprite = game.add.sprite(this.x, this.y, 'scrap');
			this.sprite.anchor.set(0.5, 0.5);

			game.physics.p2.enable(this.sprite, false);
			this.sprite.body.angle = util.rand(-180, 180, true);
			this.sprite.body.thrust(util.rand(0, 5000, true));
			this.sprite.body.angle = util.rand(-180, 180, true);
			this.sprite.body.angularVelocity = util.rand(-3, 3, true);
			this.sprite.body.setCircle(25);
			this.sprite.body.angularDamping = 0;
			this.sprite.body.damping = 0;

			this.sprite.body.lock = this.lock;
		}

		Scrap.prototype.go = function() {

		}

		Scrap.prototype.deMagnetize = function() {
			var self = this;
			this.isMagnetized = false;
			setTimeout(function() {
				self.isMagnetized = true;
			}, 2000);
		}

		return Scrap;
	}());

	return gameState;

}());