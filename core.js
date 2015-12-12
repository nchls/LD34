window.game = (function() {

	var game = new Phaser.Game(globals.screenWidth, globals.screenHeight, Phaser.AUTO, 'game');
	game.state.add('game', states.gameState);
	game.state.add('menu', states.menuState);
	game.state.start('game');

	return game;

}());