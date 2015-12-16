window.states = window.states || {};
window.states.gameState = (function() {

	function gameState() {};

	var isGameResetable = false;

	gameState.prototype.preload = function() {
		game.stage.backgroundColor = '#000';
		_.forEach(globals.assets.graphs, function(src, name) {
			game.load.image(name, src);
		});
		game.load.spritesheet('explosion', 'assets/explosion.png', 64, 64, 16);
	};

	gameState.prototype.create = function() {
		initControls();
		initWorld();
		initPhysics();
		populate();
		if (window.localStorage && !window.localStorage.getItem('tutorialShown')) {
			tutorial();
		}
	};

	var viewport = {
		top: null,
		right: null,
		bottom: null,
		left: null
	};
	gameState.prototype.update = function() {
		_.forEach(window.state.processRegistry, function(processes, key) {
			_.forEach(processes, function(process) {
				if (process) {
					process.go();
				}
			});
		});
		if (isGameResetable && window.state.controls.charge.isDown) {
			isGameResetable = false;
			_.forEach(window.state.processRegistry, function(processes, key) {
				_.forEach(processes, function(process) {
					if (process !== undefined) {
						if (process.cleanup) {
							process.cleanup();
						}
						if (process.die) {
							process.die();
						}
					}
				});
			});
			populate();
		}
		viewport.left = game.world.camera.x;
		viewport.right = game.world.camera.x + globals.screenWidth;
		viewport.top = game.world.camera.y;
		viewport.bottom = game.world.camera.y + globals.screenHeight;
	};

	gameState.prototype.render = function() {

	};

	var csl;

	var initControls = function() {
		_.forEach(globals.controls, function(key, action) {
			window.state.controls[action] = game.input.keyboard.addKey(Phaser.Keyboard[key]);
		});
	};

	var initWorld = function() {
		game.world.resize(6000, 6000);
		game.add.tileSprite(0, 0, 6000, 6000, 'starfield');
	};

	var initPhysics = function() {
		window.game.physics.startSystem(Phaser.Physics.P2JS);
		game.physics.p2.restitution = 0.5;
	};

	var populate = function() {
		csl = util.factory(Console);
		util.factory(Ship, ['player', 0, game.world.width / 2, game.world.height / 2]);
		util.factory(Ship, ['ai', 0, util.rand(600, game.world.width - 600), util.rand(600, game.world.height - 600)]);
		util.factory(Ship, ['ai', 1, util.rand(600, game.world.width - 600), util.rand(600, game.world.height - 600)]);
		util.factory(Ship, ['ai', 2, util.rand(600, game.world.width - 600), util.rand(600, game.world.height - 600)]);
		util.factory(Ship, ['ai', 3, util.rand(600, game.world.width - 600), util.rand(600, game.world.height - 600)]);
		util.factory(Ship, ['ai', 4, util.rand(600, game.world.width - 600), util.rand(600, game.world.height - 600)]);
		for (var i=0; i < 6; i++) {
			util.factory(Health, [util.rand(600, game.world.width - 600), util.rand(600, game.world.height - 600)]);
		}
		for (var i=0; i < 80; i++) {
			util.factory(Scrap, [i]);
		}
	};

	var reportDeath = function(ship) {
		csl.report(ship.color + ' player died.');
		if (ship.controller === 'player') {
			csl.announce('You lose.');
			setTimeout(function() {
				csl.report('Press Charge to restart.');
				isGameResetable = true;
			}, 3000);
		}
		if (window.state.processRegistry[Ship.toString()].length === 1) {
			announceWinner(window.state.processRegistry[Ship.toString()][0]);
		}
	};

	var announceWinner = function(ship) {
		if (ship.controller !== 'player') {
			game.camera.follow(ship.sprite);
			csl.report(ship.color + ' player is the winner!');
		} else {
			csl.announce('You win!');
			setTimeout(function() {
				csl.report('Press Charge to restart.');
				isGameResetable = true;
			}, 3000);
		}
	};

	var tutorial = function() {
		var style = _.cloneDeep(globals.fonts.announcement);
		style.wordWrap = true;
		style.wordWrapWidth = globals.screenWidth - 200;

		var text = game.add.text(globals.screenWidth / 2, screenHeight / 4, 'Use the arrow keys to turn, and up to thrust.', style);
		text.fixedToCamera = true;
		text.anchor.set(0.5, 0);
		setTimeout(function() {
			text.setText('Fly near scrap to collect it. You\'ll need it for both ammo and armor.');
			setTimeout(function() {
				text.setText('Charge your weapon by holding Z. Release to fire.');
				setTimeout(function() {
					text.destroy();
				}, 7000);
			}, 7000);
		}, 7000);
		localStorage.setItem('tutorialShown', true);
	};

	var Console = (function() {
		util.extend(Console, util.prototypes.Process);

		function Console() {
			this.msgs = [];
			this.texts = [];
			this.announcement = null;
		}

		Console.prototype.go = function() {

		}

		Console.prototype.cleanup = function() {
			_.forEach(this.texts, function(text) {
				text.destroy();
			});
			if (this.announcement) {
				this.announcement.destroy();
			}
		}

		Console.prototype.announce = function(msg) {
			if (this.announcement) {
				this.announcement.destroy();
			}
			this.announcement = game.add.text(globals.screenWidth / 2, (globals.screenHeight / 2) + 100, msg, globals.fonts.announcement);
			this.announcement.anchor.set(0.5, 0.5);
			this.announcement.fixedToCamera = true;
		};

		Console.prototype.report = function(msg) {
			var self = this;
			this.msgs.unshift(msg);
			while (this.msgs.length > 10) {
				this.msgs.pop();
			}
			_.forEach(this.texts, function(text) {
				text.destroy();
			});
			var y = globals.screenHeight - 120;
			_.forEach(this.msgs, function(msg) {
				var text = game.add.text(10, y, msg, globals.fonts.console);
				text.fixedToCamera = true;
				y += 20;
				self.texts.push(text);
			});
		}

		return Console;
	}());

	var Ship = (function() {
		util.extend(Ship, util.prototypes.SpaceObj);

		function Ship(controller, i, x, y) {
			var self = this;

			this.x = x;
			this.y = y;
			this.i = i;
			this.controller = controller;

			this.inputs = {};

			this.life = 100;
			this.baseAngularDamping = 0.99999;

			var shipColors = {
				0: 'Red',
				1: 'Blue',
				2: 'Green',
				3: 'Yellow',
				4: 'White'
			};

			if (this.controller === 'player') {
				this.sprite = game.add.sprite(this.x, this.y, 'shipBlack');
				this.color = 'Black';
			} else {
				var graph = 'ship' + shipColors[this.i];
				this.color = shipColors[this.i];
				this.sprite = game.add.sprite(this.x, this.y, graph);
			}
			this.thrustImage = game.add.image(0, 0, 'engineThrust');
			this.thrustImage.anchor.set(0.5, -3.3);
			this.thrustImage.kill();

			this.sprite.anchor.set(0.5, 0.5);
			game.physics.p2.enable(this.sprite, false);
			this.sprite.body.setCircle(21);
			this.sprite.body.angularDamping = this.baseAngularDamping;
			this.sprite.body.damping = 0;

			this.beamImage = game.add.image(0, 0, 'beam');
			this.beamImage.anchor.set(0.5, 1);
			this.beamImage.kill();
			this.charge = 0;

			if (this.controller === 'ai') {
				this.minScrap = util.rand(2, 10);
				this.scrapCount = 0;
				this.attackDist = util.rand(500, 1500);
				this.chargeTime = util.rand(50, 100);
				this.attackDistance = util.rand(600, 1200);
				this.maxSpeed = util.rand(400, 900);
				this.scrapTarget = null;
				this.shipTarget = null;
				this.lastDecisions = null;

				this.indicator = game.add.image(0, 0, 'indicator' + shipColors[this.i]);
				this.indicator.anchor.set(0.5, 1);
				this.indicator.fixedToCamera = true;
				this.indicator.kill();
			}

			if (globals.collectMode === 'gravity') {
				this.sprite.body.onBeginContact.add(function(body1, body2, shape1, shape2, equation) {
					if (body1 !== null) {
						var force = util.getDist(body1.velocity.x, body1.velocity.y, body2.velocity[0], body2.velocity[1]);
						self.life -= _.round(force / 100);
						if (body2.parent.sprite) {
							util.factory(Explosion, [body2.parent.sprite.position.x, body2.parent.sprite.position.y, force]);
						}
					}
					//self.sprite.body.angularVelocity += util.rand(-3, 3, true);
					//self.sprite.body.angularDamping = 0.9;
				});
			}

			if (this.controller === 'player') {
				game.camera.follow(this.sprite);
			}

			this.lifeBar = game.add.text(0, 0, this.life, globals.fonts.main);
			this.lifeBar.anchor.set(0.5);

		};

		Ship.prototype.go = function() {

			var self = this;
			var shipAngle = util.angleToRad(this.sprite.body.angle);
			var shipDeltaAngle = util.angleToRad(this.sprite.body.angle - 90);

			this.inputs.fire = false;
			if (this.controller === 'player') {
				this.inputs.left = window.state.controls.left.isDown;
				this.inputs.right = window.state.controls.right.isDown;
				this.inputs.thrust = window.state.controls.thrust.isDown;
				this.inputs.reverse = window.state.controls.reverse.isDown;
				this.inputs.charge = window.state.controls.charge.isDown;
			}

			if (this.controller === 'ai') {

				this.inputs.left = false;
				this.inputs.right = false;
				this.inputs.thrust = false;
				this.inputs.reverse = false;
				this.scrapCount = 0;
				this.fireReady = false;
				this.isSlowingDown = false;

				var decisions = [];
				var thisAngle = util.angleToRad(this.sprite.body.angle);
				var nextSecondPosition = {
					x: self.sprite.position.x + self.sprite.body.velocity.x,
					y: self.sprite.position.y + self.sprite.body.velocity.y
				};
				var thisVelocity = self.sprite.position.distance(nextSecondPosition);
				var thisVector = self.sprite.position.angle(nextSecondPosition);
				var neededAngle = null;
				var angleDeltaFromNeeded = null;
				var neededVector = null;
				var vectorDeltaFromNeeded = null;
				var thrustNeeded = false;

				if (thisVelocity > this.maxSpeed || this.isSlowingDown) {

					if (thisVelocity > this.maxSpeed - 150) {
						this.isSlowingDown = true;
					} else {
						this.isSlowingDown = false;
					}

					decisions.push('Going too fast!', thisVelocity);
					neededAngle = thisVector - (Math.PI/2);
					angleDeltaFromNeeded = util.getAngleDelta(thisAngle, neededAngle);
					if (Math.abs(angleDeltaFromNeeded) > 0.3) {
						decisions.push('Not pointed in the right direction. Got to turn.');
						if (angleDeltaFromNeeded < 0) {
							decisions.push('Turning left.');
							this.inputs.left = true;
						} else {
							decisions.push('Turning right.');
							this.inputs.right = true;
						}
					} else {
						decisions.push('Pointed retrograde -- burning!');
						this.inputs.thrust = true;
					}

				} else {

					var closestScrap = null;
					var closestScrapDistance = 99999;
					_.forEach(window.state.processRegistry[Scrap.toString()], function(scrap) {
						if (scrap.isMagnetized) {
							if (scrap.magnetizedToPlayer === self) {
								self.scrapCount++;
							} else if (scrap.magnetizedToPlayer === false) {
								var distance = self.sprite.position.distance(scrap.sprite.position);
								if (distance < closestScrapDistance) {
									closestScrapDistance = distance;
									closestScrap = scrap;
								}
							}
						}
					});

					var closestShip = null;
					var closestShipDistance = 99999;
					_.forEach(window.state.processRegistry[Ship.toString()], function(ship) {
						if (ship !== self) {
							var distance = self.sprite.position.distance(ship.sprite.position);
							if (distance < closestShipDistance) {
								closestShip = ship;
								closestShipDistance = distance;
							}
						}
					});

					if (this.scrapCount < this.minScrap) {

						window.scrapCount = this.scrapCount;
						decisions.push('Not enough scrap (' + this.minScrap + ') finding nearest piece.');
						if (closestScrap) {
							decisions.push('Found it: ', closestScrap);
							neededVector = self.sprite.position.angle(closestScrap.sprite.position) + (Math.PI / 2);
						} else {
							decisions.push('No scrap to be found.');
						}

					} else {

						decisions.push('Got enough scrap. Checking for nearby ships.');

						if (this.charge === 0 && closestShipDistance < this.attackDistance) {
							decisions.push('Enemy in range. Charging!');
							this.inputs.charge = true;
						}

						if (this.inputs.charge) {
							this.charge++;
						}

						if (this.charge > this.chargeTime) {
							this.fireReady = true;
						}

						if (closestShip) {
							neededVector = self.sprite.position.angle(closestShip.sprite.position) + (Math.PI / 2);
						}

					}

					neededVector = util.normalizeRadians(neededVector);

					if (thisVelocity < 700) {

						decisions.push('Moving slowly. Going to point directly at target and burn');
						neededAngle = neededVector;
						angleDeltaFromNeeded = util.getAngleDelta(thisAngle, neededAngle);
						if (Math.abs(angleDeltaFromNeeded) > 0.18) {
							decisions.push('Not pointed in the right direction.');
							if (angleDeltaFromNeeded < 0) {
								decisions.push('Turning left.');
								this.inputs.left = true;
							} else {
								decisions.push('Turning right.');
								this.inputs.right = true;
							}
						} else {
							decisions.push('Pointed at target -- burning!');
							this.inputs.thrust = true;

							if (this.fireReady) {
								this.inputs.charge = false;
								this.charge = 0;
							}

						}

					} else {

						vectorDeltaFromNeeded = util.getAngleDelta(thisVector, neededVector);
						if (vectorDeltaFromNeeded > 0.18) {
							decisions.push('Not moving in the right direction. Got to burn perpendicular.');
							if (vectorDeltaFromNeeded > 0) {
								neededAngle = neededVector + (Math.PI / 2);
							} else {
								neededAngle = neededVector - (Math.PI / 2);
							}
							angleDeltaFromNeeded = util.getAngleDelta(thisAngle, neededAngle);
							if (Math.abs(angleDeltaFromNeeded) > 0.18) {
								decisions.push('Not pointed in the right direction. Got to turn.');
								if (angleDeltaFromNeeded < 0) {
									decisions.push('Turning left.');
									this.inputs.left = true;
								} else {
									decisions.push('Turning right.');
									this.inputs.right = true;
								}
							} else {
								decisions.push('Pointed perpendicular -- burning!');
								this.inputs.thrust = true;

								if (this.fireReady) {
									this.inputs.charge = false;
									this.charge = 0;
								}
							}
						} else {
							decisions.push('Moving towards it!');
							this.inputs.thrust = true;
						}

					}

				}

				if (decisions.toString() !== this.lastDecisions) {
					this.lastDecisions = decisions.toString();
				}

			}

			if (this.inputs.left) {
				this.sprite.body.angularVelocity -= 1;
			}
			if (this.inputs.right) {
				this.sprite.body.angularVelocity += 1;
			}
			if (this.inputs.thrust) {
				this.sprite.body.thrust(220);
				this.thrustImage.reset(this.sprite.position.x, this.sprite.position.y);
				this.thrustImage.angle = this.sprite.body.angle;
				this.thrustImage.x = this.sprite.position.x + (this.sprite.body.velocity.x / 60);
				this.thrustImage.y = this.sprite.position.y + (this.sprite.body.velocity.y / 60);
				this.thrustImage.alpha = util.rand(0.5, 1, true);
			} else {
				this.thrustImage.kill();
			}
			if (this.inputs.reverse) {
				this.sprite.body.reverse(140);
			}

/*
			if (this.sprite.body.angularDamping < this.baseAngularDamping) {
				this.sprite.body.angularDamping += 0.002;
			} else {
				this.sprite.body.angularDamping = this.baseAngularDamping;
			}
*/

			if (globals.collectMode === 'gravity') {

				if (this.inputs.charge) {
					if (!this.weaponCharging) {
						this.weaponCharging = true;
						this.beamImage.reset(this.sprite.position.x, this.sprite.position.y);
					}
					this.beamImage.angle = this.sprite.body.angle;
					this.beamImage.x = this.sprite.position.x + (this.sprite.body.velocity.x / 60);
					this.beamImage.y = this.sprite.position.y + (this.sprite.body.velocity.y / 60);
					this.beamImage.alpha = util.rand(0.18, 0.22, true);
				}

				if (this.weaponCharging) {
					if (!this.inputs.charge) {
						this.weaponCharging = false;
						this.inputs.fire = true;
						this.beamImage.kill();
					}
				}

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
									var angleDelta = Math.abs(util.getAngleDelta(angleToShip, travelAngle));
									var repelForce = _.max([angleDelta / 2, 0.3]);
									scrap.sprite.body.velocity.x += Math.cos(angleToScrap) * ((160 - distance) / repelForce);
									scrap.sprite.body.velocity.y += Math.sin(angleToScrap) * ((160 - distance) / repelForce);
								}

								if (self.inputs.fire && distance < 350) {
									var angleDelta = Math.abs(util.getAngleDelta(shipDeltaAngle, angleToScrap));
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

				_.forEach(window.state.processRegistry[Health.toString()], function(health) {

					if (!health) {
						return;
					}

					var distance = self.sprite.position.distance(health.sprite.position);
					if (distance < 60) {
						self.life = _.min([self.life + 50, 100]);
						health.die();
						util.factory(Health, [util.rand(600, game.world.width - 600), util.rand(600, game.world.height - 600)]);
					} else if (distance < 400) {
						var angleToHealth = self.sprite.position.angle(health.sprite.position);
						health.sprite.body.velocity.x += Math.cos(angleToHealth) * ((400 - distance) / -5);
						health.sprite.body.velocity.y += Math.sin(angleToHealth) * ((400 - distance) / -5);
					}

				});

			}

			if (this.life < 0) {
				var self = this;
				_.times(7, function() {
					util.factory(Explosion, [self.sprite.x + util.rand(-10,10), self.sprite.y + util.rand(-10,10), 1000]);
				});
				_.forEach(window.state.processRegistry[Scrap.toString()], function(scrap) {
					if (scrap.magnetizedToPlayer === self) {
						scrap.magnetizedToPlayer = false;
					}
				});
				this.cleanup();
				this.die();
				reportDeath(this);
				return;
			}

			this.lifeBar.x = this.sprite.x + (this.sprite.body.velocity.x / 60);
			this.lifeBar.y = this.sprite.y + 50 + (this.sprite.body.velocity.y / 60);
			this.lifeBar.text = this.life;

			if (this.controller === 'ai') {
				var indx;
				var indy;
				var indang = 0;
				if (this.sprite.x > viewport.left && this.sprite.x < viewport.right) {
					if (this.sprite.y < viewport.top) {
						indx = this.sprite.x - viewport.left;
						indy = 30;
					} else if (this.sprite.y > viewport.bottom) {
						indx = this.sprite.x - viewport.left;
						indy = globals.screenHeight - 30;
						indang = 180;
					}
				}
				if (this.sprite.y > viewport.top && this.sprite.y < viewport.bottom) {
					if (this.sprite.x < viewport.left) {
						indx = 30
						indy = this.sprite.y - viewport.top;
						indang = 270;
					} else if (this.sprite.x > viewport.right) {
						indx = globals.screenWidth - 30;
						indy = this.sprite.y - viewport.top;
						indang = 90;
					}
				}
				if (this.sprite.x < viewport.left) {
					if (this.sprite.y < viewport.top) {
						indx = 30;
						indy = 30;
						indang = 315;
					} else if (this.sprite.y > viewport.bottom) {
						indx = 30;
						indy = globals.screenHeight - 30;
						indang = 225;
					}
				}
				if (this.sprite.x > viewport.right) {
					if (this.sprite.y < viewport.top) {
						indx = globals.screenWidth - 30;
						indy = 30;
						indang = 45;
					} else if (this.sprite.y > viewport.bottom) {
						indx = globals.screenWidth - 30;
						indy = globals.screenHeight - 30;
						indang = 135;
					}
				}
				if (indx && indy) {
					this.indicator.reset(indx, indy);
					this.indicator.angle = indang;
					this.indicator.alpha = 0.7;
					this.indicator.fixedToCamera = true;
				} else {
					this.indicator.kill();
				}
			}

		};

		Ship.prototype.cleanup = function() {
			this.beamImage.destroy();
			this.thrustImage.destroy();
			this.lifeBar.destroy();
			this.indicator && this.indicator.destroy();
		}

		return Ship;
	}());

	var Scrap = (function() {
		util.extend(Scrap, util.prototypes.SpaceObj);

		function Scrap(i) {
			this.i = i;
			this.x = util.rand(0, game.world.width);
			this.y = util.rand(0, game.world.height);
			this.isMagnetized = true;
			this.magnetizedToPlayer = false;

			var graph = game.rnd.pick(['scrap1', 'scrap2', 'scrap3']);
			if (util.rand(0, 7) === 1) {
				graph = 'scrapExplosive';
				this.isExplosive = true;
			}
			this.sprite = game.add.sprite(this.x, this.y, graph);
			this.sprite.anchor.set(0.5, 0.5);

			game.physics.p2.enable(this.sprite, false);
			this.sprite.body.angle = util.rand(-180, 180, true);
			this.sprite.body.thrust(util.rand(0, 5000, true));
			this.sprite.body.angle = util.rand(-180, 180, true);
			this.sprite.body.angularVelocity = util.rand(-3, 3, true);
			this.sprite.body.setCircle(25);
			this.sprite.body.angularDamping = 0;
			this.sprite.body.damping = 0;

			var self = this;
			if (this.isExplosive) {
				this.sprite.body.onBeginContact.add(function(body1, body2, shape1, shape2, equation) {
					if (body1 !== null) {
						var force = util.getDist(body1.velocity.x, body1.velocity.y, body2.velocity[0], body2.velocity[1]);
						if (force > 1000) {
							util.factory(Explosion, [self.sprite.position.x, self.sprite.position.y, 5000]);
							_.forEach([Scrap.toString(), Ship.toString(), Health.toString()], function(klass) {
								_.forEach(window.state.processRegistry[klass], function(obj) {
									var distance = self.sprite.position.distance(obj.sprite.position);
									if (distance < 400) {
										var angleToObj = self.sprite.position.angle(obj.sprite.position);
										obj.sprite.body.velocity.x += Math.cos(angleToObj) * ((400 - distance) / 0.4);
										obj.sprite.body.velocity.y += Math.sin(angleToObj) * ((400 - distance) / 0.4);
										if (obj.life) {
											obj.life -= _.round((400 - distance) / 5);
										}
									}
								});
							});
							self.die();
						}
					}
					//self.sprite.body.angularVelocity += util.rand(-3, 3, true);
					//self.sprite.body.angularDamping = 0.9;
				});
			}
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

	var Health = (function() {
		util.extend(Health, util.prototypes.Process);

		function Health(x, y) {
			this.x = x;
			this.y = y;
			this.sprite = game.add.sprite(this.x, this.y, 'health');
			this.sprite.anchor.set(0.5, 0.5);

			game.physics.p2.enable(this.sprite, false);
			this.sprite.body.angle = util.rand(-180, 180, true);
			this.sprite.body.thrust(util.rand(0, 3000, true));
			this.sprite.body.angle = util.rand(-180, 180, true);
			this.sprite.body.angularVelocity = util.rand(-2, 2, true);
			this.sprite.body.setCircle(25);
			this.sprite.body.angularDamping = 0;
			this.sprite.body.damping = 0;
		}

		Health.prototype.go = function() {

		}

		return Health;
	}());

	var Explosion = (function() {
		util.extend(Explosion, util.prototypes.Process);

		function Explosion(x, y, force) {
			this.x = x;
			this.y = y;
			this.sprite = game.add.sprite(this.x, this.y, 'explosion');
			this.sprite.angle = util.rand(-180, 180);
			this.sprite.scale.x = 1 + (force / 2000);
			this.sprite.scale.y = this.sprite.scale.x;
			this.sprite.anchor.set(0.5, 0.5);
			window.exp = this;

			this.animation = this.sprite.animations.add('explode');
			this.animation.enableUpdate = true;
			this.sprite.animations.play('explode', 30);

			var self = this;
			this.sprite.animations.currentAnim.onComplete.add(function() {
				self.die();
			});
		}

		Explosion.prototype.go = function() {
			this.sprite.scale.x += 0.06;
			this.sprite.scale.y += 0.06;
			this.sprite.alpha -= 0.03;
		};

		Explosion.prototype.cleanup = function() {

		};

		return Explosion;
	}());

	return gameState;

}());