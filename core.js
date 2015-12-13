window.game = (function() {

	var container = document.getElementById('aplomb-game');
	var game = new Phaser.Game(container.clientWidth, container.clientHeight, Phaser.AUTO, 'aplomb-game');
	game.state.add('game', states.gameState);
	game.state.add('menu', states.menuState);
	game.state.start('game');

	return game;

}());