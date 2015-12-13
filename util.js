window.util = (function() {
	var extend = function(child, parent) {
		for (var key in parent) {
			if (Object.prototype.hasOwnProperty.call(parent, key)) {
				child[key] = parent[key];
			}
		}
		function ctor() {
			this.constructor = child;
		}
		ctor.prototype = parent.prototype;
		child.prototype = new ctor;
		child.__super__ = parent.prototype;
		return child;
	};

	var factory = function(klass, props) {
		var key = klass.toString();
		if (!window.state.processRegistry.hasOwnProperty(key)) {
			window.state.processRegistry[key] = [];
		}
		var instance = new (Function.prototype.bind.apply(klass, [klass].concat(props)));
		window.state.processRegistry[key].push(instance);
		return instance;
	};

	var rand = function(min, max, floating) {
		_.forEach([min, max], function(arg) {
			if (isNaN(arg) || typeof arg !== 'number') {
				console.warn('[rand] Not a number: ', arg)
				return 0;
			}
		});
		var range = max - min;
		var num = (Math.random() * range) + min;
		if (!floating) {
			num = Math.round(num);
		}
		return num;
	};

	var angleToRad = function(angle) {
		if (isNaN(angle) || typeof angle !== 'number') {
			console.warn('[angleToRad] Not a number: ' + angle);
			return 0;
		}
		return angle * ((Math.PI * 2) / 360);
	};
	var getAngleDelta = function(angle1, angle2) {
		_.forEach([angle1, angle2], function(ang) {
			ang = normalizeRadians(ang);
		});
		var easyCase = angle2 - angle1;
		if (Math.abs(easyCase) < Math.PI) {
			return easyCase;
		}
		if (angle1 < angle2) {
			return -((angle1 + (Math.PI*2)) - angle2);
		}
		return (angle2 + (Math.PI*2)) - angle1;
	};
	var normalizeRadians = function(angle) {
		while (angle < -Math.PI) {
			angle += 2*Math.PI;
		}
		while (angle > Math.PI) {
			angle -= 2*Math.PI;
		}
		return angle;
	}

	var getDist = function(x1, y1, x2, y2) {
		_.forEach([x1, y1, x2, y2], function(arg) {
			if (isNaN(arg) || typeof arg !== 'number') {
				console.warn('[getDist] Not a number: ', arg)
				return 0;
			}
		})
		return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
	};
	var getDistX = function(angle) {
		if (isNaN(angle) || typeof angle !== 'number') {
			console.warn('[getDistX] Not a number: ' + angle);
			return 0;
		}
		return -Math.sin(angle);
	};
	var getDistY = function(angle) {
		if (isNaN(angle) || typeof angle !== 'number') {
			console.warn('[getDistY] Not a number: ' + angle);
			return 0;
		}
		return Math.cos(angle);
	};

	var prototypes = (function() {

		var Process = (function() {
			function Process() {}

			Process.prototype.die = function() {
				if (this.sprite) {
					this.sprite.destroy();
				}
				var classKey = this.constructor.toString();
				if (window.state.processRegistry[classKey]) {
					for (var i=0, l=window.state.processRegistry[classKey].length; i < l; i++) {
						if (window.state.processRegistry[classKey][i] === this) {
							window.state.processRegistry[classKey].splice(i, 1);
							return;
						}
					}
				}
			}

			return Process;
		}());

		var SpaceObj = (function() {
			extend(SpaceObj, Process);

			function SpaceObj() {
				this.xspeed = 0;
				this.yspeed = 0;
				this.turnspeed = 0;
				this.testprop = true;
			}

			SpaceObj.prototype.tick = function() {
				if (this.sprite) {
					this.sprite.x += this.xspeed;
					this.sprite.y += this.yspeed;
					this.sprite.angle += this.turnspeed;
					if (this.addAngle) {
						this.sprite.angle += this.addAngle;
					}
				}
			}

			SpaceObj.prototype.xadvance = function(angle, distance) {
				this.sprite.x += getDistX(angleToRad(angle)) * distance;
				this.sprite.y += getDistY(angleToRad(angle)) * distance;
			}

			return SpaceObj;
		}());

		return {
			Process: Process,
			SpaceObj: SpaceObj
		};

	}());

	return {
		extend: extend,
		factory: factory,
		rand: rand,
		angleToRad: angleToRad,
		getAngleDelta: getAngleDelta,
		normalizeRadians: normalizeRadians,
		getDist: getDist,
		getDistX: getDistX,
		getDistY: getDistY,
		prototypes: prototypes
	};

}());