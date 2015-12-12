window.globals = {
	screenWidth: document.documentElement.clientWidth,
	screenHeight: document.documentElement.clientHeight,

	assets: {
		graphs: {
			ship: 'assets/ship.png',
			scrap: 'assets/scrap1.png',
			starfield: 'assets/starfield.png',
			engine: 'assets/engine.png',
			gun: 'assets/gun.png'
		},
	},

	fonts: {
		main: {
			font: '16px Consolas, monospace',
			fill: '#fff',
			align: 'left'
		}
	},

	controls: {
		left: 'LEFT',
		right: 'RIGHT',
		thrust: 'UP',
		fire: 'CONTROL'
	}
};

window.state = {
	processRegistry: {},
	controls: {}
};