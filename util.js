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
		var range = max - min;
		var num = (Math.random() * range) + min;
		if (!floating) {
			num = Math.round(num);
		}
		return num;
	};

	var angleToRad = function(angle) {
		return angle * ((Math.PI * 2) / 360);
	};

	var getDistX = function(angle) {
		return Math.cos(angle);
	};
	var getDistY = function(angle) {
		return -Math.sin(angle);
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

		var Obj = (function() {
			extend(Obj, Process);

			function Obj() {}

			Obj.prototype.xadvance = function(angle, distance) {
				this.sprite.x += getDistX(angleToRad(angle)) * distance;
				this.sprite.y += getDistY(angleToRad(angle)) * distance;
			}

			return Obj;
		}());

		return {
			Process: Process,
			Obj: Obj
		};

	}());

	return {
		extend: extend,
		factory: factory,
		rand: rand,
		angleToRad: angleToRad,
		getDistX: getDistX,
		getDistY: getDistY,
		prototypes: prototypes
	};

}());