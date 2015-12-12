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

		util.factory(Ship);
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
		util.extend(Ship, util.prototypes.Obj);

		function Ship() {
			this.x = globals.screenWidth / 2;
			this.y = globals.screenHeight - 40;
			this.sprite = game.add.sprite(this.x, this.y, 'ship');
			this.sprite.anchor.set(0.5, 0.5);
			this.xspeed = 0;

			game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
		}

		Ship.prototype.go = function() {

		};

		return Ship;
	}());

	return gameState;

}());