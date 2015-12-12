window.states = window.states || {};
window.states.menuState = (function() {

	var menuState = function() {};

	menuState.prototype.preload = function() {
		_.forEach(global.assets.graphs, function(src, name) {
			game.load.image(name, src);
		});
	};

	menuState.prototype.create = function() {
		// initialize menu
	};

	menuState.prototype.update = function() {
		_.forEach(window.state.processRegistry, function(processes, key) {
			_.forEach(processes, function(process) {
				process.go();
			})
		});
	};

	return menuState;

}());