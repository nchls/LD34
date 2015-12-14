window.globals = {
	screenWidth: document.getElementById('aplomb-game').clientWidth,
	screenHeight: document.getElementById('aplomb-game').clientHeight,

	assets: {
		graphs: {
			shipRed: 'assets/ship-red.png',
			shipGreen: 'assets/ship-green.png',
			shipBlue: 'assets/ship-blue.png',
			shipYellow: 'assets/ship-yellow.png',
			shipBlack: 'assets/ship-black.png',
			shipWhite: 'assets/ship-white.png',
			engineThrust: 'assets/enginesFiring.png',
			indicatorBlue: 'assets/indicator-blue.png',
			indicatorRed: 'assets/indicator-red.png',
			indicatorGreen: 'assets/indicator-green.png',
			indicatorWhite: 'assets/indicator-white.png',
			indicatorYellow: 'assets/indicator-yellow.png',
			scrap: 'assets/scrap1.png',
			particle: 'assets/particle.png',
			starfield: 'assets/starfield.png',
			engine: 'assets/engine.png',
			gun: 'assets/gun.png',
			beam: 'assets/beam.png'
		},
	},

	fonts: {
		main: {
			font: '20px Consolas, monospace',
			fill: '#fff',
			align: 'center'
		},
		console: {
			font: '20px Consolas, monospace',
			fill: '#fff',
			align: 'left'
		},
		announcement: {
			font: '40px Consolas, monospace',
			fill: '#fff',
			align: 'center'
		}
	},

	controls: {
		left: 'LEFT',
		right: 'RIGHT',
		thrust: 'UP',
		reverse: 'DOWN',
		charge: 'CONTROL'
	},

	collectMode: 'gravity'
};

window.state = {
	processRegistry: {},
	controls: {}
};