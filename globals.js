window.globals = {
	screenWidth: document.documentElement.clientWidth,
	screenHeight: document.documentElement.clientHeight,

	assets: {
		graphs: {
			ship: 'assets/ship.png',
			scrap: 'assets/scrap1.png'
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
		thrust: 'UP',
		fire: 'CONTROL'
	}
};

window.state = {
	processRegistry: {},
	controls: {}
};