/*
 *	STRIWENSKO LIBRARY HTML ELEMENT CLASS
 *  v 1.2
 */
Object.extend = function(destination, source) {
	for (var property in source)
		destination[property] = source[property];
	return destination;
};

function addEvent(obj, evt, fn)
{
	if (obj.addEventListener)
	{
		obj.addEventListener(evt, fn, false);
	}
	else if (obj.attachEvent)
	{
		obj.attachEvent('on' + evt, fn);
	}
}

function removeEvent(obj, evt, fn)
{
	if (obj.removeEventListener)
	{
		obj.removeEventListener(evt, fn, false);
	}
	else if (obj.detachEvent)
	{
		obj.detachEvent('on' + evt, fn);
	}
}

Event = {};

Event.CANCEL = "cancel";
Event.OPEN = "open";
Event.CLOSE = 'close';
Event.COMPLETE = "onComplete";
Event.CHANGE = "onChange";
Event.MOVE = "MOVE";
Event.START = "START";
Event.STOP = "STOP";
Event.RESIZE = "resize";
Event.SELECT = "select";
Event.RENDER = "render";
Event.REFRESH = "refresh";
Event.STATE_CHANGE = "stateChange";
Event.SOUND_COMPLETE = "soundComplete";
Event.FOCUS_OUT = "focusOut";
Event.FOCUS_IN = "focusIn";
Event.REMOVE = 'remove';
Event.PROGRESS = 'progress';
Event.UPLOAD = 'upload';

/**
*	EVENT DISPATCHER
*/

var Event_Dispatcher = {}

function ADD_EVENT_DISPACTHER(element)
{
	Object.extend(element, Event_Dispatcher);
}
function ADD_EVENT_DISPATCHER(element)
{
	Object.extend(element, Event_Dispatcher);
}

Event_Dispatcher.addEventListener = function(type, listener, scope)
{
	if (!this.events)
	{
		this.events = {};
	}
	if (!this.events[type])
	{
		this.events[type] = new Array();
	}
	this.events[type].push({listener:listener, scope:scope});

	if (this.events['promise.' + type])
	{
		var data = this.events['promise.' + type];
		if ((typeof listener).toString() == "function")
		{
			scope.eventRecieverFunction = listener;
			scope.eventRecieverFunction({currentTarget:this, type:type, data:data});
		}
		else
		{
			scope[listener]({currentTarget:this, type:type, data:data});
		}
	}
}

Event_Dispatcher.dispatchEvent = function(type, data, promise)
{
	if (!this.events)
	{
		this.events = {};
	}
	if (promise)
	{
		this.events['promise.' + type] = data;
	}
	if (this.events[type])
	{
		var events = this.events[type];
		for (var iEvent = 0; iEvent < events.length; iEvent++)
		{
			var listener = events[iEvent].listener;
			var scope = events[iEvent].scope;

			if ((typeof listener).toString() == "function")
			{
				scope.eventRecieverFunction = listener;
				scope.eventRecieverFunction({currentTarget:this, type:type, data:data});
			}
			else
			{
				scope[listener]({currentTarget:this, type:type, data:data});
			}
		}
	}
}

Event_Dispatcher.removeEventListener = function(type, listener, scope)
{
	if (!this.events)
	{
		return false;
	}
	if (!this.events[type])
	{
		return false;
	}

	var events = this.events[type];
	for (var iEvent = 0; iEvent < events.length; iEvent++)
	{
		if ((listener == events[iEvent].listener) && (scope == events[iEvent].scope))
		{
			events.splice(iEvent, 1);
		}
	}
}


Event_Dispatcher._addEventListener = Event_Dispatcher.addEventListener;

Event_Dispatcher._dispatchEvent = Event_Dispatcher.dispatchEvent;

Event_Dispatcher._removeEventListener = Event_Dispatcher.removeEventListener;






function TimeLine(duration, interval)
{
	this.duration = duration;
	this.direction = 1;
	this.position = 0;
	this.status = "STOP";
	this.startTime = 0;
	this.interval = interval;
	
	this.intervalObj;
	
	this.data = {};
	this.events = {}
	
	
	
	ADD_EVENT_DISPACTHER(this);
	
	var self = this;
	var iFrame = 0;
	this.REQ_ANIMATION = function(timeStamp){self.update();/*console.log(timeStamp, iFrame);iFrame++;*/}
}

TimeLine.prototype.play = function ()
{
	if (((this.direction == 1) && (this.position == this.duration)) || ((this.direction == -1) && (this.position == 0)))
	{
	}
	else
	{
		this.startTime = new Date().getTime() - this.position;
		if (this.status != 'PLAY')
		{
			var self = this;
			var doAnimation = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;
			
			if (doAnimation)
			{
				doAnimation(this.REQ_ANIMATION);
			}
			else
			{
				var self = this;
				this.intervalObj = setInterval(function(){self.update()}, this.interval);
			}
		}
		this.status = 'PLAY';
	}
}

TimeLine.prototype.pause = function ()
{
	this.status = 'PAUSE';
	clearInterval(this.intervalObj);
}

TimeLine.prototype.stop = function ()
{
	this.status = 'STOP';
	clearInterval(this.intervalObj);
}

TimeLine.prototype.position = function (value)
{
	this.position = value;
	this.startTime = new Date().getTime() - this.position;
}

TimeLine.prototype.update = function ()
{
	if (!Date.now)
	{
		Date.now = function()
		{
			return new Date().getTime();
		};
	}
	if (this.status != 'PLAY')
	{
		return false;
	}
	var TIME = Date.now();
	if (this.direction == 1)
	{
		this.position =  TIME - this.startTime;
		this.position = Math.min(this.duration, this.position);
		if (this.position == this.duration)
		{
			this.status = 'STOP';
			clearInterval(this.intervalObj);
			this.dispatchEvent(Event.COMPLETE);
			
			if (this.onComplete)
			{
				this.onComplete();
			}
		}
		else if (this.status == 'PLAY')
		{
			var doAnimation = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;
			
			if (doAnimation)
			{
				doAnimation(this.REQ_ANIMATION);
			}
		}
	}
	else
	{
		this.position = Math.max((2 * this.position) - (TIME - this.startTime), 0);
		this.startTime = TIME - this.position;
		if (this.position == 0)
		{
			this.status = 'STOP';
			clearInterval(this.intervalObj);
			this.dispatchEvent(Event.COMPLETE);
			
			if (this.onComplete)
			{
				this.onComplete();
			}
		}
		else if (this.status == 'PLAY')
		{
			var doAnimation = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;
			
			if (doAnimation)
			{
				doAnimation(this.REQ_ANIMATION);
			}
		}
	}
	
	this.dispatchEvent(Event.CHANGE);
}



TimeLine.prototype.getTime = function(timeOffset, duration, easeFunction)
{
	var time = Math.min(Math.max(this.position - timeOffset, 0), duration);
	if (easeFunction != null)
	{
		return easeFunction(time, 0, 1, duration);
	}
	return this.easeInOut(time, 0, 1, duration);
}

TimeLine.prototype.easeInOut = function (t, b, c, d)
{
	return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
}


TimeLine.prototype.easeInOutPos = function (pos, b, c, d)
{
	return  Math.acos(-(pos - b) * (2 / c)  + 1) * d / Math.PI;
}

var EFFECT = {};
EFFECT.FADE = 'fade';
EFFECT.ZOOM_IN = 'zoomIn';
EFFECT.ZOOM_OUT = 'zoomOut';
EFFECT.SLIDE = 'slide';

var EFFECTS = {
	JUMP: function (t, b, c, d) {
		return c*Math.floor(t/d) + b;
	},
	LINEAR: function (t, b, c, d) {
		return c*t/d + b;
	},
	EASE_IN_QUAD: function ( t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	EASE_OUT_QUAD: function ( t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	EASE_IN_OUT_QUAD: function ( t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	EASE_IN_CUBIC: function ( t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	EASE_OUT_CUBIC: function ( t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	EASE_IN_OUT_CUBIC: function ( t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	EASE_IN_QUART: function ( t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	EASE_OUT_QUART: function ( t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	EASE_IN_OUT_QUART: function ( t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	EASE_IN_QUINT: function ( t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	EASE_OUT_QUINT: function ( t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	EASE_IN_OUT_QUINT: function ( t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	EASE_IN_SINE: function ( t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	EASE_OUT_SINE: function ( t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	EASE_IN_OUT_SINE: function ( t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	EASE_IN_EXPO: function ( t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	EASE_OUT_EXPO: function ( t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	EASE_IN_OUT_EXPO: function ( t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	EASE_IN_CIRC: function ( t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	EASE_OUT_CIRC: function ( t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	EASE_IN_OUT_CIRC: function ( t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	EASE_IN_ELASTIC: function ( t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	EASE_OUT_ELASTIC: function ( t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	EASE_IN_OUT_ELASTIC: function ( t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	EASE_IN_BACK: function ( t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	EASE_OUT_BACK: function ( t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	EASE_IN_OUT_BACK: function ( t, b, c, d, s) {
		if (s == undefined) s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	EASE_IN_BOUNCE: function ( t, b, c, d) {
		return c - EFFECTS.EASE_OUT_BOUNCE ( d-t, 0, c, d) + b;
	},
	EASE_OUT_BOUNCE: function ( t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	EASE_IN_OUT_BOUNCE: function ( t, b, c, d) {
		if (t < d/2) return EFFECTS.EASE_IN_BOUNCE ( t*2, 0, c, d) * .5 + b;
		return EFFECTS.EASE_OUT_BOUNCE ( t*2-d, 0, c, d) * .5 + c*.5 + b;
	}
	
}




function AD(settings)
{
	this.settings = settings;
	
	this.holder = document.getElementById(settings.id);
	this.holder.style.display = '';
	
	this.events = this.settings.events || [];
	this.items = [];
	
	for (var iAnimation = 0; iAnimation < settings.animation.length; iAnimation++)
	{
		var selector = settings.animation[iAnimation].selector;
		settings.animation[iAnimation].elements = this.holder.querySelectorAll(selector) || [];
		this.items.push(settings.animation[iAnimation]);
	}

	
	this.timeLine = new TimeLine(settings.duration, 33);
	this.timeLine.addEventListener(Event.CHANGE, 'render', this);
}
AD.prototype.play = function()
{
	this.timeLine.play();
}
AD.prototype.applyMatrix = function(elements, matrix, debug)
{
	var scale = (matrix.hasOwnProperty('scale') ? matrix.scale : 1);
	var scaleX = (matrix.hasOwnProperty('scaleX') ? matrix.scaleX * scale : scale);
	var scaleY = (matrix.hasOwnProperty('scaleY') ? matrix.scaleY * scale : scale);
	var rotation = (matrix.hasOwnProperty('rotation') ? matrix.rotation : 0) * (180 / Math.PI);
	var x = (matrix.hasOwnProperty('x') ? matrix.x : 0);
	var y = (matrix.hasOwnProperty('y') ? matrix.y : 0);
	var opacity = (matrix.hasOwnProperty('opacity') ? matrix.opacity : 1);
	
	if (matrix.hasOwnProperty('radius') && matrix.hasOwnProperty('angle'))
	{
		var radius = matrix.radius;
		var angle = matrix.angle;
		
		x = Math.round(radius * Math.cos(angle * Math.PI / 180) * 100) / 100 + x;
		y = Math.round(radius * Math.sin(angle * Math.PI / 180) * 100) / 100 + y;
		
	}
	
	
	var data = [scaleX * Math.cos(rotation), -Math.sin(rotation)       ,
			    Math.sin(rotation)        , scaleY * Math.cos(rotation), x, y];
	
	
	var transform = 'matrix(' + data.join(',') + ')';
	
	for (var iElem = 0; iElem < elements.length; iElem++)
	{
		var enableTransform = false;
		var element = elements[iElem];
		if (!element.animation)
		{
			element.animation = {};
		}
		if (element.animation.x != x)
		{
			element.animation.x = x;
			enableTransform = true;
		}
		if (element.animation.y != y)
		{
			element.animation.y = y;
			enableTransform = true;
		}
		if (element.animation.scaleX != scaleX)
		{
			element.animation.scaleX = scaleX;
			enableTransform = true;
		}
		if (element.animation.scaleY != scaleY)
		{
			element.animation.scaleY = scaleY;
			enableTransform = true;
		}
		if (element.animation.rotation != matrix.rotation)
		{
			element.animation.rotation = matrix.rotation;
			enableTransform = true;
		}
		if (matrix.hasOwnProperty('text'))
		{
			if (element.animation.text != matrix.text)
			{
				element.innerHTML = matrix.text;
				element.animation.text = matrix.text;
			}
		}
		if (matrix.hasOwnProperty('zIndex'))
		{
			if (element.animation.zIndex != matrix.zIndex)
			{
				element.style.zIndex = matrix.zIndex;
				element.animation.zIndex = matrix.zIndex;
			}
		}
		if (matrix.hasOwnProperty('opacity'))
		{
			if (element.animation.opacity != opacity)
			{
				element.style.opacity = opacity;
				element.animation.opacity = opacity;
			}
		}
		
		if (enableTransform)
		{
			element.style.transform = transform;
			element.style.MozTransform = transform;
			element.style.WebkitTransform = transform;
			element.style.msTransform = transform;
			element.style.OTransform = transform;
		}
		
	}
}
AD.prototype.transform = function(matrixA, matrixB, pct)
{
	var matrix = {};
	
	if (matrixA.hasOwnProperty('opacity'))
	{
		matrix.opacity = matrixA.opacity + (matrixB.opacity - matrixA.opacity) * pct;
	}
	if (matrixA.hasOwnProperty('x'))
	{
		matrix.x = matrixA.x + (matrixB.x - matrixA.x) * pct;
	}
	if (matrixA.hasOwnProperty('y'))
	{
		matrix.y = matrixA.y + (matrixB.y - matrixA.y) * pct;
	}
	if (matrixA.hasOwnProperty('rotation'))
	{
		matrix.rotation = matrixA.rotation + (matrixB.rotation - matrixA.rotation) * pct;
	}
	if (matrixA.hasOwnProperty('scale'))
	{
		matrix.scale = matrixA.scale + (matrixB.scale - matrixA.scale) * pct;
	}
	return matrix;
}
AD.prototype.render = function()
{
	var time = this.timeLine.position;
	
	for (var iEvent = 0; iEvent < this.events.length; iEvent++)
	{
		if (this.events[iEvent].time < time && !this.events[iEvent].completed)
		{
			this.events[iEvent].fn(time);
			this.events[iEvent].completed = true;
		}
	}
	for (var iItem = 0; iItem < this.items.length; iItem++)
	{
		var elements = this.items[iItem].elements;
		var properties = this.items[iItem].property || [];
		
		for (var iProp = 0; iProp < properties.length; iProp++)
		{
			
			
			var preffix = ((properties[iProp].preffix) ? properties[iProp].preffix : '');
			var property = properties[iProp].name;
			var steps = properties[iProp].steps;
			var ease = properties[iProp].ease;
			
			if (property == 'matrix')
			{
				var transform = {x:0, y:0, scale:1, rotation:0, opacity:1};
				//console.log("time:" + time)
				for (var property in properties[iProp].data)
				{
					var data = properties[iProp].data[property];
					var isAnim = false;
					var value;
					
					
					for (var iData = 0; iData < data.length; iData++)
					{
						if (time < data[iData].time)
						{
							isAnim = true;
							if (iData == 0)
							{
								value = data[iData].value;
							}
							else
							{
								var duration = data[iData].time - data[iData - 1].time;
								var pct = this.timeLine.getTime(data[iData - 1].time, duration, data[iData].ease);
								value = data[iData - 1].value + (data[iData].value - data[iData - 1].value) * pct;
								if (property == 'zIndex')
								{
									value = data[iData - 1].value;
								}
								if (property == 'text')
								{
									value = data[iData - 1].value;
								}
							}
							break;
						}
					}
					if (!isAnim)
					{
						value = data[data.length - 1].value;	
					}
					
					transform[property] = value;

					//this.applyMatrix(elements, value);/**/
					//console.log(data, property, value)
				}
				
				this.applyMatrix(elements, transform, this.items[iItem].debug);
				//console.log(properties[iProp].data)
				continue;
			}
			
			if (property == 'transform')
			{
				var isAnim = false;
				var value;
				for (var iStep = 0; iStep < steps.length; iStep++)
				{
					if (time < steps[iStep].time)
					{
						isAnim = true;
						if (iStep == 0)
						{
							value = steps[iStep];
						}
						else
						{
							var duration = steps[iStep].time - steps[iStep - 1].time;
							var pct = this.timeLine.getTime(steps[iStep - 1].time, duration, ease);
							value = this.transform(steps[iStep - 1], steps[iStep], pct);
						}
						break;
					}
				}
				if (!isAnim)
				{
					value = steps[steps.length - 1];
				}
				
				this.applyMatrix(elements, value);
				
				continue;
			}
			
			var isAnim = false;
			var value;
			for (var iStep = 0; iStep < steps.length; iStep++)
			{
				if (time < steps[iStep].time)
				{
					isAnim = true;
					if (iStep == 0)
					{
						value = steps[iStep].value + preffix;
					}
					else
					{
						var end = steps[iStep].value;
						var start = steps[iStep - 1].value;
						var duration = steps[iStep].time - steps[iStep - 1].time;
						value = start + (end - start) * this.timeLine.getTime(steps[iStep - 1].time, duration, ease);
						value = value + preffix;
					}
					break;
				}
			}
			if (!isAnim)
			{
				value = steps[steps.length - 1].value + preffix;
			}

			if (property == 'scale')
			{
				this.scale(elements, value);
			}
			else if (property == 'rotate')
			{
				this.rotate(elements, value);
			}
			else
			{
				for (var iElem = 0; iElem < elements.length; iElem++)
				{
					elements[iElem].style[property] = value;
				}
			}
		}
	}
}
AD.prototype.rotate = function(elements, rotate)
{
	for (var iElem = 0; iElem < elements.length; iElem++)
	{
		var element = elements[iElem];
		var transform = "rotate(" + rotate + "deg)";

		element.style.transform = transform;
		element.style.MozTransform = transform;
		element.style.WebkitTransform = transform;
		element.style.msTransform = transform;
		element.style.OTransform = transform;
	}
}
AD.prototype.scale = function(elements, scale)
{
	for (var iElem = 0; iElem < elements.length; iElem++)
	{
		var element = elements[iElem];
		var transform = "scale(" + scale + "," + scale + ")";

		element.style.transform = transform;
		element.style.MozTransform = transform;
		element.style.WebkitTransform = transform;
		element.style.msTransform = transform;
		element.style.OTransform = transform;
	}
}


		function Track(settings)
		{
			var self = this;
			this.settings = settings;
			this.duration = 0;
			this.progress = 0;
			this.audio = document.createElement('audio');
			this.audio.ontimeupdate  = function()
			{
				self.time = this.currentTime;
				self.dispatchEvent(Event.CHANGE);
			}
			this.audio.onprogress = function(event)
			{
				if (!isNaN(this.duration))
				{
					self.duration = this.duration;
				}
				if (this.buffered.length > 0)
				{
					self.progress = this.buffered.end(this.buffered.length - 1) / this.duration;
					//console.log(this.buffered.end(this.buffered.length - 1));
				}
				self.dispatchEvent('loadProgress');
				//console.log(event, this.duration);
			}
			this.gain = settings.gain || 1;
			
			this.loop = (settings.loop > 0) ? settings.loop : false;
			 
            this.m4a = !!(this.audio.canPlayType && this.audio.canPlayType('audio/mp4; codecs="mp4a.40.2"').replace(/no/, ''));
            this.mp3 = !!(this.audio.canPlayType && this.audio.canPlayType('audio/mpeg;').replace(/no/, ''));
            this.ogg = !!(this.audio.canPlayType && this.audio.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''));
			
			//alert("this.mp3:" + this.mp3 + "\nthis.ogg:" + this.ogg + "\n" + "this.m4a:" + this.m4a);
			this.url = '';
			if (this.mp3 && settings.mp3)
			{
				this.url = settings.mp3;
			}
			else if (this.ogg && settings.ogg)
			{
				this.url = settings.ogg;
			}
			else if (this.m4a && settings.m4a)
			{
				this.url = settings.m4a;
			}
			//alert(settings.src + this.ext);
			this.audio.src = this.url;
			this.audio.load();
			this.disable = false;
			
			this.volume = settings.volume || 0.5;
			this.audio.volume = this.volume * this.gain;
			
			this.status = Track.STOP;
			this.isReady = false;
			
			addEvent(this.audio, 'canplaythrough', function(event){self.ready(event)});
			addEvent(this.audio, 'ended', function(event){self.onEnd(event)});
			ADD_EVENT_DISPACTHER(this);
		}
		Track.prototype.getTimeString = function()
		{
			var time = Math.floor(this.time);
			var seconds = time % 60;
			var minutes = Math.floor(time / 60);
			seconds = ((seconds < 10) ? '0' : '') + seconds;
			minutes = ((minutes < 10) ? '0' : '') + minutes;
			
			return minutes + ':' + seconds;
		}
		Track.prototype.getTime = function()
		{
			return this.time;
		}
		Track.PLAY = 'PLAY';
		Track.PAUSE = 'PAUSE'
		Track.STOP = 'STOP';
		Track.prototype.ready = function(event)
		{
			this.isReady = true;
			this.dispatchEvent('ready');
		}
		Track.prototype.onEnd = function(event)
		{
			//console.log(event);
			//alert("end");
			//alert("end" + this.settings.loop +  this.disable)
			if (this.loop && (this.status == Track.PLAY))
			{
				var self = this;
				this.timeout = setTimeout(function(){self.play()}, this.loop);
			}
			else
			{
				this.status = Track.STOP;
			}
			this.dispatchEvent(Event.COMPLETE);
			this.dispatchEvent(Event.STATE_CHANGE);
		}
		Track.prototype.getVolume = function()
		{
			return this.volume;
		}
		Track.prototype.setVolume = function(value)
		{
			this.volume = value;
			this.audio.volume = this.volume * this.gain;
		}
		
		Track.prototype.play = function()
		{
			this.audio.play();
			this.status = Track.PLAY;
			this.dispatchEvent(Event.STATE_CHANGE);
		}
		Track.prototype.pause = function()
		{
			this.audio.pause();
			this.status = Track.PAUSE;
			this.dispatchEvent(Event.STATE_CHANGE);
			
		}
		Track.prototype.stop = function()
		{
			this.audio.pause();
			if (this.isReady)
			{
				this.audio.currentTime = 0;
			}
			clearTimeout(this.timeout);
			this.status = Track.STOP;
		}

/*
http://www.w3schools.com/css/css3_2dtransforms.asp
*/