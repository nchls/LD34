window.globals = {
	screenWidth: 800,
	screenHeight: 600,

	assets: {
		graphs: {
			ship: 'assets/ship.png',
		},
	},

	fonts: {
		main: {
			font: '20px Arial',
			fill: '#fff',
			align: 'center'
		}
	},

	controls: {
		left: 'LEFT',
		right: 'RIGHT',
		fire: 'CONTROL'
	}
};

window.state = {
	processRegistry: {},
	controls: {}
};