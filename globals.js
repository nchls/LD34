window.globals = {
	screenWidth: document.documentElement.clientWidth,
	screenHeight: document.documentElement.clientHeight,

	assets: {
		graphs: {
			ship: 'assets/ship.png',
			scrap: 'assets/scrap1.png',
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