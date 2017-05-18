+ function(t) {
	"use strict";
	t.support = function() {
		var t = {
			touch: !!("ontouchstart" in window || window.DocumentTouch && document instanceof window.DocumentTouch)
		};
		return t
	}(), t.touchEvents = {
		start: t.support.touch ? "touchstart" : "mousedown",
		move: t.support.touch ? "touchmove" : "mousemove",
		end: t.support.touch ? "touchend" : "mouseup"
	}, t.getTouchPosition = function(t) {
		return t = t.originalEvent || t, "touchstart" === t.type || "touchmove" === t.type || "touchend" === t.type ? {
			x: t.targetTouches[0].pageX,
			y: t.targetTouches[0].pageY
		} : {
			x: t.pageX,
			y: t.pageY
		}
	}
}($), + function(t) {
	"use strict";
	var s = function(s) {
		this.container = t(s), this.distance = 50, this.attachEvents()
	};
	s.prototype.touchStart = function(s) {
		if(!this.container.hasClass("refreshing")) {
			var i = t.getTouchPosition(s);
			this.start = i, this.diffX = this.diffY = 0
		}
	}, s.prototype.touchMove = function(s) {
		if(!this.container.hasClass("refreshing")) {
			if(!this.start) return !1;
			if(!(this.container.scrollTop() > 0)) {
				var i = t.getTouchPosition(s);
				if(this.diffX = i.x - this.start.x, this.diffY = i.y - this.start.y, !(this.diffY < 0)) return this.container.addClass("touching"), s.preventDefault(), s.stopPropagation(), this.diffY = Math.pow(this.diffY, .8), this.statusArea.css("height", this.diffY), this.diffY < this.distance ? this.container.removeClass("pull-up").addClass("pull-down") : this.container.removeClass("pull-down").addClass("pull-up"), !1
			}
		}
	}, s.prototype.touchEnd = function() {
		return this.start = !1, this.diffY <= 0 || this.container.hasClass("refreshing") ? void 0 : (this.container.removeClass("touching"), this.container.removeClass("pull-down pull-up"), Math.abs(this.diffY) <= this.distance ? this.statusArea.css("height", 0) : (this.statusArea.css("height", 50), this.container.addClass("refreshing"), this.container.trigger("pull-to-refresh")), !1)
	}, s.prototype.attachEvents = function() {
		var s = this.container;
		s.addClass("dropload");
		var i = ['<div class="dropload-layer">', '<div class="inner">', '<div class="arrow"></div>', '<div class="loader"></div>', '<div class="down">下拉刷新</div>', '<div class="up">释放刷新</div>', '<div class="refresh">正在刷新</div></div></div>'];
		this.statusArea = t(i.join("")).prependTo(s), s.on(t.touchEvents.start, t.proxy(this.touchStart, this)), s.on(t.touchEvents.move, t.proxy(this.touchMove, this)), s.on(t.touchEvents.end, t.proxy(this.touchEnd, this))
	};
	var i = function(t) {
			new s(t)
		},
		o = function(s) {
			t(s).removeClass("refreshing"), t(s).find(".dropload-layer").css("height", 0)
		};
	t.fn.pullToRefresh = function() {
		return this.each(function() {
			i(this)
		})
	}, t.fn.pullToRefreshDone = function() {
		return this.each(function() {
			o(this)
		})
	}
}($);