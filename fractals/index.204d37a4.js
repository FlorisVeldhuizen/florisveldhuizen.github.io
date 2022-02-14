/**
 * @license
 * pixi.js - v2.2.8
 * Copyright (c) 2012-2014, Mat Groves
 * http://goodboydigital.com/
 *
 * Compiled: 2015-03-15
 *
 * pixi.js is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 */ var a = this, b = b || {
};
b.WEBGL_RENDERER = 0, b.CANVAS_RENDERER = 1, b.VERSION = "v2.2.8", b.blendModes = {
    NORMAL: 0,
    ADD: 1,
    MULTIPLY: 2,
    SCREEN: 3,
    OVERLAY: 4,
    DARKEN: 5,
    LIGHTEN: 6,
    COLOR_DODGE: 7,
    COLOR_BURN: 8,
    HARD_LIGHT: 9,
    SOFT_LIGHT: 10,
    DIFFERENCE: 11,
    EXCLUSION: 12,
    HUE: 13,
    SATURATION: 14,
    COLOR: 15,
    LUMINOSITY: 16
}, b.scaleModes = {
    DEFAULT: 0,
    LINEAR: 0,
    NEAREST: 1
}, b._UID = 0, "undefined" != typeof Float32Array ? (b.Float32Array = Float32Array, b.Uint16Array = Uint16Array, b.Uint32Array = Uint32Array, b.ArrayBuffer = ArrayBuffer) : (b.Float32Array = Array, b.Uint16Array = Array), b.INTERACTION_FREQUENCY = 30, b.AUTO_PREVENT_DEFAULT = !0, b.PI_2 = 2 * Math.PI, b.RAD_TO_DEG = 180 / Math.PI, b.DEG_TO_RAD = Math.PI / 180, b.RETINA_PREFIX = "@2x", b.dontSayHello = !1, b.defaultRenderOptions = {
    view: null,
    transparent: !1,
    antialias: !1,
    preserveDrawingBuffer: !1,
    resolution: 1,
    clearBeforeRender: !0,
    autoResize: !1
}, b.sayHello = function(a1) {
    if (!b.dontSayHello) {
        if (navigator.userAgent.toLowerCase().indexOf("chrome") > -1) {
            var c1 = [
                "%c %c %c Pixi.js " + b.VERSION + " - " + a1 + "  %c  %c  http://www.pixijs.com/  %c %c ♥%c♥%c♥ ",
                "background: #ff66a5",
                "background: #ff66a5",
                "color: #ff66a5; background: #030307;",
                "background: #ff66a5",
                "background: #ffc3dc",
                "background: #ff66a5",
                "color: #ff2424; background: #fff",
                "color: #ff2424; background: #fff",
                "color: #ff2424; background: #fff"
            ];
            console.log.apply(console, c1);
        } else window.console && console.log("Pixi.js " + b.VERSION + " - http://www.pixijs.com/");
        b.dontSayHello = !0;
    }
}, b.Point = function(a2, b1) {
    this.x = a2 || 0, this.y = b1 || 0;
}, b.Point.prototype.clone = function() {
    return new b.Point(this.x, this.y);
}, b.Point.prototype.set = function(a3, b2) {
    this.x = a3 || 0, this.y = b2 || (0 !== b2 ? this.x : 0);
}, b.Point.prototype.constructor = b.Point, b.Rectangle = function(a4, b3, c2, d) {
    this.x = a4 || 0, this.y = b3 || 0, this.width = c2 || 0, this.height = d || 0;
}, b.Rectangle.prototype.clone = function() {
    return new b.Rectangle(this.x, this.y, this.width, this.height);
}, b.Rectangle.prototype.contains = function(a5, b4) {
    if (this.width <= 0 || this.height <= 0) return !1;
    var c3 = this.x;
    if (a5 >= c3 && a5 <= c3 + this.width) {
        var d = this.y;
        if (b4 >= d && b4 <= d + this.height) return !0;
    }
    return !1;
}, b.Rectangle.prototype.constructor = b.Rectangle, b.EmptyRectangle = new b.Rectangle(0, 0, 0, 0), b.Polygon = function(a6) {
    if (a6 instanceof Array || (a6 = Array.prototype.slice.call(arguments)), a6[0] instanceof b.Point) {
        for(var c4 = [], d = 0, e = a6.length; e > d; d++)c4.push(a6[d].x, a6[d].y);
        a6 = c4;
    }
    this.closed = !0, this.points = a6;
}, b.Polygon.prototype.clone = function() {
    var a7 = this.points.slice();
    return new b.Polygon(a7);
}, b.Polygon.prototype.contains = function(a8, b5) {
    for(var c5 = !1, d = this.points.length / 2, e = 0, f = d - 1; d > e; f = e++){
        var g = this.points[2 * e], h = this.points[2 * e + 1], i = this.points[2 * f], j = this.points[2 * f + 1], k = h > b5 != j > b5 && (i - g) * (b5 - h) / (j - h) + g > a8;
        k && (c5 = !c5);
    }
    return c5;
}, b.Polygon.prototype.constructor = b.Polygon, b.Circle = function(a9, b6, c6) {
    this.x = a9 || 0, this.y = b6 || 0, this.radius = c6 || 0;
}, b.Circle.prototype.clone = function() {
    return new b.Circle(this.x, this.y, this.radius);
}, b.Circle.prototype.contains = function(a10, b7) {
    if (this.radius <= 0) return !1;
    var c7 = this.x - a10, d = this.y - b7, e = this.radius * this.radius;
    return c7 *= c7, d *= d, e >= c7 + d;
}, b.Circle.prototype.getBounds = function() {
    return new b.Rectangle(this.x - this.radius, this.y - this.radius, 2 * this.radius, 2 * this.radius);
}, b.Circle.prototype.constructor = b.Circle, b.Ellipse = function(a11, b8, c8, d) {
    this.x = a11 || 0, this.y = b8 || 0, this.width = c8 || 0, this.height = d || 0;
}, b.Ellipse.prototype.clone = function() {
    return new b.Ellipse(this.x, this.y, this.width, this.height);
}, b.Ellipse.prototype.contains = function(a12, b9) {
    if (this.width <= 0 || this.height <= 0) return !1;
    var c9 = (a12 - this.x) / this.width, d = (b9 - this.y) / this.height;
    return c9 *= c9, d *= d, 1 >= c9 + d;
}, b.Ellipse.prototype.getBounds = function() {
    return new b.Rectangle(this.x - this.width, this.y - this.height, this.width, this.height);
}, b.Ellipse.prototype.constructor = b.Ellipse, b.RoundedRectangle = function(a13, b10, c10, d, e) {
    this.x = a13 || 0, this.y = b10 || 0, this.width = c10 || 0, this.height = d || 0, this.radius = e || 20;
}, b.RoundedRectangle.prototype.clone = function() {
    return new b.RoundedRectangle(this.x, this.y, this.width, this.height, this.radius);
}, b.RoundedRectangle.prototype.contains = function(a14, b11) {
    if (this.width <= 0 || this.height <= 0) return !1;
    var c11 = this.x;
    if (a14 >= c11 && a14 <= c11 + this.width) {
        var d = this.y;
        if (b11 >= d && b11 <= d + this.height) return !0;
    }
    return !1;
}, b.RoundedRectangle.prototype.constructor = b.RoundedRectangle, b.Matrix = function() {
    this.a = 1, this.b = 0, this.c = 0, this.d = 1, this.tx = 0, this.ty = 0;
}, b.Matrix.prototype.fromArray = function(a15) {
    this.a = a15[0], this.b = a15[1], this.c = a15[3], this.d = a15[4], this.tx = a15[2], this.ty = a15[5];
}, b.Matrix.prototype.toArray = function(a16) {
    this.array || (this.array = new b.Float32Array(9));
    var c12 = this.array;
    return a16 ? (c12[0] = this.a, c12[1] = this.b, c12[2] = 0, c12[3] = this.c, c12[4] = this.d, c12[5] = 0, c12[6] = this.tx, c12[7] = this.ty, c12[8] = 1) : (c12[0] = this.a, c12[1] = this.c, c12[2] = this.tx, c12[3] = this.b, c12[4] = this.d, c12[5] = this.ty, c12[6] = 0, c12[7] = 0, c12[8] = 1), c12;
}, b.Matrix.prototype.apply = function(a17, c13) {
    return c13 = c13 || new b.Point, c13.x = this.a * a17.x + this.c * a17.y + this.tx, c13.y = this.b * a17.x + this.d * a17.y + this.ty, c13;
}, b.Matrix.prototype.applyInverse = function(a18, c14) {
    c14 = c14 || new b.Point;
    var d = 1 / (this.a * this.d + this.c * -this.b);
    return c14.x = this.d * d * a18.x + -this.c * d * a18.y + (this.ty * this.c - this.tx * this.d) * d, c14.y = this.a * d * a18.y + -this.b * d * a18.x + (-this.ty * this.a + this.tx * this.b) * d, c14;
}, b.Matrix.prototype.translate = function(a19, b12) {
    return this.tx += a19, this.ty += b12, this;
}, b.Matrix.prototype.scale = function(a20, b13) {
    return this.a *= a20, this.d *= b13, this.c *= a20, this.b *= b13, this.tx *= a20, this.ty *= b13, this;
}, b.Matrix.prototype.rotate = function(a21) {
    var b14 = Math.cos(a21), c15 = Math.sin(a21), d = this.a, e = this.c, f = this.tx;
    return this.a = d * b14 - this.b * c15, this.b = d * c15 + this.b * b14, this.c = e * b14 - this.d * c15, this.d = e * c15 + this.d * b14, this.tx = f * b14 - this.ty * c15, this.ty = f * c15 + this.ty * b14, this;
}, b.Matrix.prototype.append = function(a22) {
    var b15 = this.a, c16 = this.b, d = this.c, e = this.d;
    return this.a = a22.a * b15 + a22.b * d, this.b = a22.a * c16 + a22.b * e, this.c = a22.c * b15 + a22.d * d, this.d = a22.c * c16 + a22.d * e, this.tx = a22.tx * b15 + a22.ty * d + this.tx, this.ty = a22.tx * c16 + a22.ty * e + this.ty, this;
}, b.Matrix.prototype.identity = function() {
    return this.a = 1, this.b = 0, this.c = 0, this.d = 1, this.tx = 0, this.ty = 0, this;
}, b.identityMatrix = new b.Matrix, b.DisplayObject = function() {
    this.position = new b.Point, this.scale = new b.Point(1, 1), this.pivot = new b.Point(0, 0), this.rotation = 0, this.alpha = 1, this.visible = !0, this.hitArea = null, this.buttonMode = !1, this.renderable = !1, this.parent = null, this.stage = null, this.worldAlpha = 1, this._interactive = !1, this.defaultCursor = "pointer", this.worldTransform = new b.Matrix, this._sr = 0, this._cr = 1, this.filterArea = null, this._bounds = new b.Rectangle(0, 0, 1, 1), this._currentBounds = null, this._mask = null, this._cacheAsBitmap = !1, this._cacheIsDirty = !1;
}, b.DisplayObject.prototype.constructor = b.DisplayObject, Object.defineProperty(b.DisplayObject.prototype, "interactive", {
    get: function() {
        return this._interactive;
    },
    set: function(a23) {
        this._interactive = a23, this.stage && (this.stage.dirty = !0);
    }
}), Object.defineProperty(b.DisplayObject.prototype, "worldVisible", {
    get: function() {
        var a24 = this;
        do {
            if (!a24.visible) return !1;
            a24 = a24.parent;
        }while (a24)
        return !0;
    }
}), Object.defineProperty(b.DisplayObject.prototype, "mask", {
    get: function() {
        return this._mask;
    },
    set: function(a25) {
        this._mask && (this._mask.isMask = !1), this._mask = a25, this._mask && (this._mask.isMask = !0);
    }
}), Object.defineProperty(b.DisplayObject.prototype, "filters", {
    get: function() {
        return this._filters;
    },
    set: function(a26) {
        if (a26) {
            for(var b16 = [], c17 = 0; c17 < a26.length; c17++)for(var d = a26[c17].passes, e = 0; e < d.length; e++)b16.push(d[e]);
            this._filterBlock = {
                target: this,
                filterPasses: b16
            };
        }
        this._filters = a26;
    }
}), Object.defineProperty(b.DisplayObject.prototype, "cacheAsBitmap", {
    get: function() {
        return this._cacheAsBitmap;
    },
    set: function(a27) {
        this._cacheAsBitmap !== a27 && (a27 ? this._generateCachedSprite() : this._destroyCachedSprite(), this._cacheAsBitmap = a27);
    }
}), b.DisplayObject.prototype.updateTransform = function() {
    var a28, c18, d, e, f, g, h = this.parent.worldTransform, i = this.worldTransform;
    this.rotation % b.PI_2 ? (this.rotation !== this.rotationCache && (this.rotationCache = this.rotation, this._sr = Math.sin(this.rotation), this._cr = Math.cos(this.rotation)), a28 = this._cr * this.scale.x, c18 = this._sr * this.scale.x, d = -this._sr * this.scale.y, e = this._cr * this.scale.y, f = this.position.x, g = this.position.y, (this.pivot.x || this.pivot.y) && (f -= this.pivot.x * a28 + this.pivot.y * d, g -= this.pivot.x * c18 + this.pivot.y * e), i.a = a28 * h.a + c18 * h.c, i.b = a28 * h.b + c18 * h.d, i.c = d * h.a + e * h.c, i.d = d * h.b + e * h.d, i.tx = f * h.a + g * h.c + h.tx, i.ty = f * h.b + g * h.d + h.ty) : (a28 = this.scale.x, e = this.scale.y, f = this.position.x - this.pivot.x * a28, g = this.position.y - this.pivot.y * e, i.a = a28 * h.a, i.b = a28 * h.b, i.c = e * h.c, i.d = e * h.d, i.tx = f * h.a + g * h.c + h.tx, i.ty = f * h.b + g * h.d + h.ty), this.worldAlpha = this.alpha * this.parent.worldAlpha;
}, b.DisplayObject.prototype.displayObjectUpdateTransform = b.DisplayObject.prototype.updateTransform, b.DisplayObject.prototype.getBounds = function(a29) {
    return a29, b.EmptyRectangle;
}, b.DisplayObject.prototype.getLocalBounds = function() {
    return this.getBounds(b.identityMatrix);
}, b.DisplayObject.prototype.setStageReference = function(a30) {
    this.stage = a30, this._interactive && (this.stage.dirty = !0);
}, b.DisplayObject.prototype.generateTexture = function(a31, c19, d) {
    var e = this.getLocalBounds(), f = new b.RenderTexture(0 | e.width, 0 | e.height, d, c19, a31);
    return b.DisplayObject._tempMatrix.tx = -e.x, b.DisplayObject._tempMatrix.ty = -e.y, f.render(this, b.DisplayObject._tempMatrix), f;
}, b.DisplayObject.prototype.updateCache = function() {
    this._generateCachedSprite();
}, b.DisplayObject.prototype.toGlobal = function(a32) {
    return this.displayObjectUpdateTransform(), this.worldTransform.apply(a32);
}, b.DisplayObject.prototype.toLocal = function(a33, b17) {
    return b17 && (a33 = b17.toGlobal(a33)), this.displayObjectUpdateTransform(), this.worldTransform.applyInverse(a33);
}, b.DisplayObject.prototype._renderCachedSprite = function(a34) {
    this._cachedSprite.worldAlpha = this.worldAlpha, a34.gl ? b.Sprite.prototype._renderWebGL.call(this._cachedSprite, a34) : b.Sprite.prototype._renderCanvas.call(this._cachedSprite, a34);
}, b.DisplayObject.prototype._generateCachedSprite = function() {
    this._cacheAsBitmap = !1;
    var a35 = this.getLocalBounds();
    if (this._cachedSprite) this._cachedSprite.texture.resize(0 | a35.width, 0 | a35.height);
    else {
        var c20 = new b.RenderTexture(0 | a35.width, 0 | a35.height);
        this._cachedSprite = new b.Sprite(c20), this._cachedSprite.worldTransform = this.worldTransform;
    }
    var d = this._filters;
    this._filters = null, this._cachedSprite.filters = d, b.DisplayObject._tempMatrix.tx = -a35.x, b.DisplayObject._tempMatrix.ty = -a35.y, this._cachedSprite.texture.render(this, b.DisplayObject._tempMatrix, !0), this._cachedSprite.anchor.x = -(a35.x / a35.width), this._cachedSprite.anchor.y = -(a35.y / a35.height), this._filters = d, this._cacheAsBitmap = !0;
}, b.DisplayObject.prototype._destroyCachedSprite = function() {
    this._cachedSprite && (this._cachedSprite.texture.destroy(!0), this._cachedSprite = null);
}, b.DisplayObject.prototype._renderWebGL = function(a) {
}, b.DisplayObject.prototype._renderCanvas = function(a) {
}, b.DisplayObject._tempMatrix = new b.Matrix, Object.defineProperty(b.DisplayObject.prototype, "x", {
    get: function() {
        return this.position.x;
    },
    set: function(a36) {
        this.position.x = a36;
    }
}), Object.defineProperty(b.DisplayObject.prototype, "y", {
    get: function() {
        return this.position.y;
    },
    set: function(a37) {
        this.position.y = a37;
    }
}), b.DisplayObjectContainer = function() {
    b.DisplayObject.call(this), this.children = [];
}, b.DisplayObjectContainer.prototype = Object.create(b.DisplayObject.prototype), b.DisplayObjectContainer.prototype.constructor = b.DisplayObjectContainer, Object.defineProperty(b.DisplayObjectContainer.prototype, "width", {
    get: function() {
        return this.scale.x * this.getLocalBounds().width;
    },
    set: function(a38) {
        var b18 = this.getLocalBounds().width;
        this.scale.x = 0 !== b18 ? a38 / b18 : 1, this._width = a38;
    }
}), Object.defineProperty(b.DisplayObjectContainer.prototype, "height", {
    get: function() {
        return this.scale.y * this.getLocalBounds().height;
    },
    set: function(a39) {
        var b19 = this.getLocalBounds().height;
        this.scale.y = 0 !== b19 ? a39 / b19 : 1, this._height = a39;
    }
}), b.DisplayObjectContainer.prototype.addChild = function(a40) {
    return this.addChildAt(a40, this.children.length);
}, b.DisplayObjectContainer.prototype.addChildAt = function(a41, b20) {
    if (b20 >= 0 && b20 <= this.children.length) return a41.parent && a41.parent.removeChild(a41), a41.parent = this, this.children.splice(b20, 0, a41), this.stage && a41.setStageReference(this.stage), a41;
    throw new Error(a41 + "addChildAt: The index " + b20 + " supplied is out of bounds " + this.children.length);
}, b.DisplayObjectContainer.prototype.swapChildren = function(a42, b21) {
    if (a42 !== b21) {
        var c21 = this.getChildIndex(a42), d = this.getChildIndex(b21);
        if (0 > c21 || 0 > d) throw new Error("swapChildren: Both the supplied DisplayObjects must be a child of the caller.");
        this.children[c21] = b21, this.children[d] = a42;
    }
}, b.DisplayObjectContainer.prototype.getChildIndex = function(a43) {
    var b22 = this.children.indexOf(a43);
    if (-1 === b22) throw new Error("The supplied DisplayObject must be a child of the caller");
    return b22;
}, b.DisplayObjectContainer.prototype.setChildIndex = function(a44, b23) {
    if (0 > b23 || b23 >= this.children.length) throw new Error("The supplied index is out of bounds");
    var c22 = this.getChildIndex(a44);
    this.children.splice(c22, 1), this.children.splice(b23, 0, a44);
}, b.DisplayObjectContainer.prototype.getChildAt = function(a45) {
    if (0 > a45 || a45 >= this.children.length) throw new Error("getChildAt: Supplied index " + a45 + " does not exist in the child list, or the supplied DisplayObject must be a child of the caller");
    return this.children[a45];
}, b.DisplayObjectContainer.prototype.removeChild = function(a46) {
    var b24 = this.children.indexOf(a46);
    if (-1 !== b24) return this.removeChildAt(b24);
}, b.DisplayObjectContainer.prototype.removeChildAt = function(a47) {
    var b25 = this.getChildAt(a47);
    return this.stage && b25.removeStageReference(), b25.parent = void 0, this.children.splice(a47, 1), b25;
}, b.DisplayObjectContainer.prototype.removeChildren = function(a48, b26) {
    var c23 = a48 || 0, d = "number" == typeof b26 ? b26 : this.children.length, e = d - c23;
    if (e > 0 && d >= e) {
        for(var f = this.children.splice(c23, e), g = 0; g < f.length; g++){
            var h = f[g];
            this.stage && h.removeStageReference(), h.parent = void 0;
        }
        return f;
    }
    if (0 === e && 0 === this.children.length) return [];
    throw new Error("removeChildren: Range Error, numeric values are outside the acceptable range");
}, b.DisplayObjectContainer.prototype.updateTransform = function() {
    if (this.visible && (this.displayObjectUpdateTransform(), !this._cacheAsBitmap)) for(var a49 = 0, b27 = this.children.length; b27 > a49; a49++)this.children[a49].updateTransform();
}, b.DisplayObjectContainer.prototype.displayObjectContainerUpdateTransform = b.DisplayObjectContainer.prototype.updateTransform, b.DisplayObjectContainer.prototype.getBounds = function() {
    if (0 === this.children.length) return b.EmptyRectangle;
    for(var a50, c24, d, e = 1 / 0, f = 1 / 0, g = -1 / 0, h = -1 / 0, i = !1, j = 0, k = this.children.length; k > j; j++){
        var l = this.children[j];
        l.visible && (i = !0, a50 = this.children[j].getBounds(), e = e < a50.x ? e : a50.x, f = f < a50.y ? f : a50.y, c24 = a50.width + a50.x, d = a50.height + a50.y, g = g > c24 ? g : c24, h = h > d ? h : d);
    }
    if (!i) return b.EmptyRectangle;
    var m = this._bounds;
    return m.x = e, m.y = f, m.width = g - e, m.height = h - f, m;
}, b.DisplayObjectContainer.prototype.getLocalBounds = function() {
    var a51 = this.worldTransform;
    this.worldTransform = b.identityMatrix;
    for(var c25 = 0, d = this.children.length; d > c25; c25++)this.children[c25].updateTransform();
    var e = this.getBounds();
    return this.worldTransform = a51, e;
}, b.DisplayObjectContainer.prototype.setStageReference = function(a52) {
    this.stage = a52, this._interactive && (this.stage.dirty = !0);
    for(var b28 = 0, c26 = this.children.length; c26 > b28; b28++){
        var d = this.children[b28];
        d.setStageReference(a52);
    }
}, b.DisplayObjectContainer.prototype.removeStageReference = function() {
    for(var a53 = 0, b29 = this.children.length; b29 > a53; a53++){
        var c27 = this.children[a53];
        c27.removeStageReference();
    }
    this._interactive && (this.stage.dirty = !0), this.stage = null;
}, b.DisplayObjectContainer.prototype._renderWebGL = function(a54) {
    if (this.visible && !(this.alpha <= 0)) {
        if (this._cacheAsBitmap) return void this._renderCachedSprite(a54);
        var b30, c28;
        if (this._mask || this._filters) {
            for(this._filters && (a54.spriteBatch.flush(), a54.filterManager.pushFilter(this._filterBlock)), this._mask && (a54.spriteBatch.stop(), a54.maskManager.pushMask(this.mask, a54), a54.spriteBatch.start()), b30 = 0, c28 = this.children.length; c28 > b30; b30++)this.children[b30]._renderWebGL(a54);
            a54.spriteBatch.stop(), this._mask && a54.maskManager.popMask(this._mask, a54), this._filters && a54.filterManager.popFilter(), a54.spriteBatch.start();
        } else for(b30 = 0, c28 = this.children.length; c28 > b30; b30++)this.children[b30]._renderWebGL(a54);
    }
}, b.DisplayObjectContainer.prototype._renderCanvas = function(a55) {
    if (this.visible !== !1 && 0 !== this.alpha) {
        if (this._cacheAsBitmap) return void this._renderCachedSprite(a55);
        this._mask && a55.maskManager.pushMask(this._mask, a55);
        for(var b31 = 0, c29 = this.children.length; c29 > b31; b31++){
            var d = this.children[b31];
            d._renderCanvas(a55);
        }
        this._mask && a55.maskManager.popMask(a55);
    }
}, b.Sprite = function(a56) {
    b.DisplayObjectContainer.call(this), this.anchor = new b.Point, this.texture = a56 || b.Texture.emptyTexture, this._width = 0, this._height = 0, this.tint = 16777215, this.blendMode = b.blendModes.NORMAL, this.shader = null, this.texture.baseTexture.hasLoaded ? this.onTextureUpdate() : this.texture.on("update", this.onTextureUpdate.bind(this)), this.renderable = !0;
}, b.Sprite.prototype = Object.create(b.DisplayObjectContainer.prototype), b.Sprite.prototype.constructor = b.Sprite, Object.defineProperty(b.Sprite.prototype, "width", {
    get: function() {
        return this.scale.x * this.texture.frame.width;
    },
    set: function(a57) {
        this.scale.x = a57 / this.texture.frame.width, this._width = a57;
    }
}), Object.defineProperty(b.Sprite.prototype, "height", {
    get: function() {
        return this.scale.y * this.texture.frame.height;
    },
    set: function(a58) {
        this.scale.y = a58 / this.texture.frame.height, this._height = a58;
    }
}), b.Sprite.prototype.setTexture = function(a59) {
    this.texture = a59, this.cachedTint = 16777215;
}, b.Sprite.prototype.onTextureUpdate = function() {
    this._width && (this.scale.x = this._width / this.texture.frame.width), this._height && (this.scale.y = this._height / this.texture.frame.height);
}, b.Sprite.prototype.getBounds = function(a60) {
    var b32 = this.texture.frame.width, c30 = this.texture.frame.height, d = b32 * (1 - this.anchor.x), e = b32 * -this.anchor.x, f = c30 * (1 - this.anchor.y), g = c30 * -this.anchor.y, h = a60 || this.worldTransform, i = h.a, j = h.b, k = h.c, l = h.d, m = h.tx, n = h.ty, o = -1 / 0, p = -1 / 0, q = 1 / 0, r = 1 / 0;
    if (0 === j && 0 === k) 0 > i && (i *= -1), 0 > l && (l *= -1), q = i * e + m, o = i * d + m, r = l * g + n, p = l * f + n;
    else {
        var s = i * e + k * g + m, t = l * g + j * e + n, u = i * d + k * g + m, v = l * g + j * d + n, w = i * d + k * f + m, x = l * f + j * d + n, y = i * e + k * f + m, z = l * f + j * e + n;
        q = q > s ? s : q, q = q > u ? u : q, q = q > w ? w : q, q = q > y ? y : q, r = r > t ? t : r, r = r > v ? v : r, r = r > x ? x : r, r = r > z ? z : r, o = s > o ? s : o, o = u > o ? u : o, o = w > o ? w : o, o = y > o ? y : o, p = t > p ? t : p, p = v > p ? v : p, p = x > p ? x : p, p = z > p ? z : p;
    }
    var A = this._bounds;
    return A.x = q, A.width = o - q, A.y = r, A.height = p - r, this._currentBounds = A, A;
}, b.Sprite.prototype._renderWebGL = function(a61) {
    if (this.visible && !(this.alpha <= 0)) {
        var b33, c31;
        if (this._mask || this._filters) {
            var d = a61.spriteBatch;
            for(this._filters && (d.flush(), a61.filterManager.pushFilter(this._filterBlock)), this._mask && (d.stop(), a61.maskManager.pushMask(this.mask, a61), d.start()), d.render(this), b33 = 0, c31 = this.children.length; c31 > b33; b33++)this.children[b33]._renderWebGL(a61);
            d.stop(), this._mask && a61.maskManager.popMask(this._mask, a61), this._filters && a61.filterManager.popFilter(), d.start();
        } else for(a61.spriteBatch.render(this), b33 = 0, c31 = this.children.length; c31 > b33; b33++)this.children[b33]._renderWebGL(a61);
    }
}, b.Sprite.prototype._renderCanvas = function(a62) {
    if (!(this.visible === !1 || 0 === this.alpha || this.texture.crop.width <= 0 || this.texture.crop.height <= 0)) {
        if (this.blendMode !== a62.currentBlendMode && (a62.currentBlendMode = this.blendMode, a62.context.globalCompositeOperation = b.blendModesCanvas[a62.currentBlendMode]), this._mask && a62.maskManager.pushMask(this._mask, a62), this.texture.valid) {
            var c32 = this.texture.baseTexture.resolution / a62.resolution;
            a62.context.globalAlpha = this.worldAlpha, a62.smoothProperty && a62.scaleMode !== this.texture.baseTexture.scaleMode && (a62.scaleMode = this.texture.baseTexture.scaleMode, a62.context[a62.smoothProperty] = a62.scaleMode === b.scaleModes.LINEAR);
            var d = this.texture.trim ? this.texture.trim.x - this.anchor.x * this.texture.trim.width : this.anchor.x * -this.texture.frame.width, e = this.texture.trim ? this.texture.trim.y - this.anchor.y * this.texture.trim.height : this.anchor.y * -this.texture.frame.height;
            a62.roundPixels ? (a62.context.setTransform(this.worldTransform.a, this.worldTransform.b, this.worldTransform.c, this.worldTransform.d, this.worldTransform.tx * a62.resolution | 0, this.worldTransform.ty * a62.resolution | 0), d = 0 | d, e = 0 | e) : a62.context.setTransform(this.worldTransform.a, this.worldTransform.b, this.worldTransform.c, this.worldTransform.d, this.worldTransform.tx * a62.resolution, this.worldTransform.ty * a62.resolution), 16777215 !== this.tint ? (this.cachedTint !== this.tint && (this.cachedTint = this.tint, this.tintedTexture = b.CanvasTinter.getTintedTexture(this, this.tint)), a62.context.drawImage(this.tintedTexture, 0, 0, this.texture.crop.width, this.texture.crop.height, d / c32, e / c32, this.texture.crop.width / c32, this.texture.crop.height / c32)) : a62.context.drawImage(this.texture.baseTexture.source, this.texture.crop.x, this.texture.crop.y, this.texture.crop.width, this.texture.crop.height, d / c32, e / c32, this.texture.crop.width / c32, this.texture.crop.height / c32);
        }
        for(var f = 0, g = this.children.length; g > f; f++)this.children[f]._renderCanvas(a62);
        this._mask && a62.maskManager.popMask(a62);
    }
}, b.Sprite.fromFrame = function(a63) {
    var c33 = b.TextureCache[a63];
    if (!c33) throw new Error('The frameId "' + a63 + '" does not exist in the texture cache' + this);
    return new b.Sprite(c33);
}, b.Sprite.fromImage = function(a64, c34, d) {
    var e = b.Texture.fromImage(a64, c34, d);
    return new b.Sprite(e);
}, b.SpriteBatch = function(a65) {
    b.DisplayObjectContainer.call(this), this.textureThing = a65, this.ready = !1;
}, b.SpriteBatch.prototype = Object.create(b.DisplayObjectContainer.prototype), b.SpriteBatch.prototype.constructor = b.SpriteBatch, b.SpriteBatch.prototype.initWebGL = function(a66) {
    this.fastSpriteBatch = new b.WebGLFastSpriteBatch(a66), this.ready = !0;
}, b.SpriteBatch.prototype.updateTransform = function() {
    this.displayObjectUpdateTransform();
}, b.SpriteBatch.prototype._renderWebGL = function(a67) {
    !this.visible || this.alpha <= 0 || !this.children.length || (this.ready || this.initWebGL(a67.gl), this.fastSpriteBatch.gl !== a67.gl && this.fastSpriteBatch.setContext(a67.gl), a67.spriteBatch.stop(), a67.shaderManager.setShader(a67.shaderManager.fastShader), this.fastSpriteBatch.begin(this, a67), this.fastSpriteBatch.render(this), a67.spriteBatch.start());
}, b.SpriteBatch.prototype._renderCanvas = function(a68) {
    if (this.visible && !(this.alpha <= 0) && this.children.length) {
        var b34 = a68.context;
        b34.globalAlpha = this.worldAlpha, this.displayObjectUpdateTransform();
        for(var c35 = this.worldTransform, d = !0, e = 0; e < this.children.length; e++){
            var f = this.children[e];
            if (f.visible) {
                var g = f.texture, h = g.frame;
                if (b34.globalAlpha = this.worldAlpha * f.alpha, f.rotation % (2 * Math.PI) === 0) d && (b34.setTransform(c35.a, c35.b, c35.c, c35.d, c35.tx, c35.ty), d = !1), b34.drawImage(g.baseTexture.source, h.x, h.y, h.width, h.height, f.anchor.x * -h.width * f.scale.x + f.position.x + 0.5 | 0, f.anchor.y * -h.height * f.scale.y + f.position.y + 0.5 | 0, h.width * f.scale.x, h.height * f.scale.y);
                else {
                    d || (d = !0), f.displayObjectUpdateTransform();
                    var i = f.worldTransform;
                    a68.roundPixels ? b34.setTransform(i.a, i.b, i.c, i.d, 0 | i.tx, 0 | i.ty) : b34.setTransform(i.a, i.b, i.c, i.d, i.tx, i.ty), b34.drawImage(g.baseTexture.source, h.x, h.y, h.width, h.height, f.anchor.x * -h.width + 0.5 | 0, f.anchor.y * -h.height + 0.5 | 0, h.width, h.height);
                }
            }
        }
    }
}, b.MovieClip = function(a69) {
    b.Sprite.call(this, a69[0]), this.textures = a69, this.animationSpeed = 1, this.loop = !0, this.onComplete = null, this.currentFrame = 0, this.playing = !1;
}, b.MovieClip.prototype = Object.create(b.Sprite.prototype), b.MovieClip.prototype.constructor = b.MovieClip, Object.defineProperty(b.MovieClip.prototype, "totalFrames", {
    get: function() {
        return this.textures.length;
    }
}), b.MovieClip.prototype.stop = function() {
    this.playing = !1;
}, b.MovieClip.prototype.play = function() {
    this.playing = !0;
}, b.MovieClip.prototype.gotoAndStop = function(a70) {
    this.playing = !1, this.currentFrame = a70;
    var b = this.currentFrame + 0.5 | 0;
    this.setTexture(this.textures[b % this.textures.length]);
}, b.MovieClip.prototype.gotoAndPlay = function(a71) {
    this.currentFrame = a71, this.playing = !0;
}, b.MovieClip.prototype.updateTransform = function() {
    if (this.displayObjectContainerUpdateTransform(), this.playing) {
        this.currentFrame += this.animationSpeed;
        var a72 = this.currentFrame + 0.5 | 0;
        this.currentFrame = this.currentFrame % this.textures.length, this.loop || a72 < this.textures.length ? this.setTexture(this.textures[a72 % this.textures.length]) : a72 >= this.textures.length && (this.gotoAndStop(this.textures.length - 1), this.onComplete && this.onComplete());
    }
}, b.MovieClip.fromFrames = function(a73) {
    for(var c36 = [], d = 0; d < a73.length; d++)c36.push(new b.Texture.fromFrame(a73[d]));
    return new b.MovieClip(c36);
}, b.MovieClip.fromImages = function(a74) {
    for(var c37 = [], d = 0; d < a74.length; d++)c37.push(new b.Texture.fromImage(a74[d]));
    return new b.MovieClip(c37);
}, b.FilterBlock = function() {
    this.visible = !0, this.renderable = !0;
}, b.FilterBlock.prototype.constructor = b.FilterBlock, b.Text = function(a75, c38) {
    this.canvas = document.createElement("canvas"), this.context = this.canvas.getContext("2d"), this.resolution = 1, b.Sprite.call(this, b.Texture.fromCanvas(this.canvas)), this.setText(a75), this.setStyle(c38);
}, b.Text.prototype = Object.create(b.Sprite.prototype), b.Text.prototype.constructor = b.Text, Object.defineProperty(b.Text.prototype, "width", {
    get: function() {
        return this.dirty && (this.updateText(), this.dirty = !1), this.scale.x * this.texture.frame.width;
    },
    set: function(a76) {
        this.scale.x = a76 / this.texture.frame.width, this._width = a76;
    }
}), Object.defineProperty(b.Text.prototype, "height", {
    get: function() {
        return this.dirty && (this.updateText(), this.dirty = !1), this.scale.y * this.texture.frame.height;
    },
    set: function(a77) {
        this.scale.y = a77 / this.texture.frame.height, this._height = a77;
    }
}), b.Text.prototype.setStyle = function(a78) {
    a78 = a78 || {
    }, a78.font = a78.font || "bold 20pt Arial", a78.fill = a78.fill || "black", a78.align = a78.align || "left", a78.stroke = a78.stroke || "black", a78.strokeThickness = a78.strokeThickness || 0, a78.wordWrap = a78.wordWrap || !1, a78.wordWrapWidth = a78.wordWrapWidth || 100, a78.dropShadow = a78.dropShadow || !1, a78.dropShadowAngle = a78.dropShadowAngle || Math.PI / 6, a78.dropShadowDistance = a78.dropShadowDistance || 4, a78.dropShadowColor = a78.dropShadowColor || "black", a78.lineJoin = a78.lineJoin || "miter", this.style = a78, this.dirty = !0;
}, b.Text.prototype.setText = function(a79) {
    this.text = a79.toString() || " ", this.dirty = !0;
}, b.Text.prototype.updateText = function() {
    this.texture.baseTexture.resolution = this.resolution, this.context.font = this.style.font;
    var a80 = this.text;
    this.style.wordWrap && (a80 = this.wordWrap(this.text));
    for(var b35 = a80.split(/(?:\r\n|\r|\n)/), c39 = [], d = 0, e = this.determineFontProperties(this.style.font), f = 0; f < b35.length; f++){
        var g = this.context.measureText(b35[f]).width;
        c39[f] = g, d = Math.max(d, g);
    }
    var h = d + this.style.strokeThickness;
    this.style.dropShadow && (h += this.style.dropShadowDistance), this.canvas.width = (h + this.context.lineWidth) * this.resolution;
    var i = e.fontSize + this.style.strokeThickness, j = i * b35.length;
    this.style.dropShadow && (j += this.style.dropShadowDistance), this.canvas.height = j * this.resolution, this.context.scale(this.resolution, this.resolution), navigator.isCocoonJS && this.context.clearRect(0, 0, this.canvas.width, this.canvas.height), this.context.font = this.style.font, this.context.strokeStyle = this.style.stroke, this.context.lineWidth = this.style.strokeThickness, this.context.textBaseline = "alphabetic", this.context.lineJoin = this.style.lineJoin;
    var k, l;
    if (this.style.dropShadow) {
        this.context.fillStyle = this.style.dropShadowColor;
        var m = Math.sin(this.style.dropShadowAngle) * this.style.dropShadowDistance, n = Math.cos(this.style.dropShadowAngle) * this.style.dropShadowDistance;
        for(f = 0; f < b35.length; f++)k = this.style.strokeThickness / 2, l = this.style.strokeThickness / 2 + f * i + e.ascent, "right" === this.style.align ? k += d - c39[f] : "center" === this.style.align && (k += (d - c39[f]) / 2), this.style.fill && this.context.fillText(b35[f], k + m, l + n);
    }
    for(this.context.fillStyle = this.style.fill, f = 0; f < b35.length; f++)k = this.style.strokeThickness / 2, l = this.style.strokeThickness / 2 + f * i + e.ascent, "right" === this.style.align ? k += d - c39[f] : "center" === this.style.align && (k += (d - c39[f]) / 2), this.style.stroke && this.style.strokeThickness && this.context.strokeText(b35[f], k, l), this.style.fill && this.context.fillText(b35[f], k, l);
    this.updateTexture();
}, b.Text.prototype.updateTexture = function() {
    this.texture.baseTexture.width = this.canvas.width, this.texture.baseTexture.height = this.canvas.height, this.texture.crop.width = this.texture.frame.width = this.canvas.width, this.texture.crop.height = this.texture.frame.height = this.canvas.height, this._width = this.canvas.width, this._height = this.canvas.height, this.texture.baseTexture.dirty();
}, b.Text.prototype._renderWebGL = function(a81) {
    this.dirty && (this.resolution = a81.resolution, this.updateText(), this.dirty = !1), b.Sprite.prototype._renderWebGL.call(this, a81);
}, b.Text.prototype._renderCanvas = function(a82) {
    this.dirty && (this.resolution = a82.resolution, this.updateText(), this.dirty = !1), b.Sprite.prototype._renderCanvas.call(this, a82);
}, b.Text.prototype.determineFontProperties = function(a83) {
    var c40 = b.Text.fontPropertiesCache[a83];
    if (!c40) {
        c40 = {
        };
        var d = b.Text.fontPropertiesCanvas, e = b.Text.fontPropertiesContext;
        e.font = a83;
        var f = Math.ceil(e.measureText("|Mq").width), g = Math.ceil(e.measureText("M").width), h = 2 * g;
        g = 1.4 * g | 0, d.width = f, d.height = h, e.fillStyle = "#f00", e.fillRect(0, 0, f, h), e.font = a83, e.textBaseline = "alphabetic", e.fillStyle = "#000", e.fillText("|MÉq", 0, g);
        var i, j, k = e.getImageData(0, 0, f, h).data, l = k.length, m = 4 * f, n = 0, o = !1;
        for(i = 0; g > i; i++){
            for(j = 0; m > j; j += 4)if (255 !== k[n + j]) {
                o = !0;
                break;
            }
            if (o) break;
            n += m;
        }
        for(c40.ascent = g - i, n = l - m, o = !1, i = h; i > g; i--){
            for(j = 0; m > j; j += 4)if (255 !== k[n + j]) {
                o = !0;
                break;
            }
            if (o) break;
            n -= m;
        }
        c40.descent = i - g, c40.descent += 6, c40.fontSize = c40.ascent + c40.descent, b.Text.fontPropertiesCache[a83] = c40;
    }
    return c40;
}, b.Text.prototype.wordWrap = function(a84) {
    for(var b36 = "", c41 = a84.split("\n"), d = 0; d < c41.length; d++){
        for(var e = this.style.wordWrapWidth, f = c41[d].split(" "), g = 0; g < f.length; g++){
            var h = this.context.measureText(f[g]).width, i = h + this.context.measureText(" ").width;
            0 === g || i > e ? (g > 0 && (b36 += "\n"), b36 += f[g], e = this.style.wordWrapWidth - h) : (e -= i, b36 += " " + f[g]);
        }
        d < c41.length - 1 && (b36 += "\n");
    }
    return b36;
}, b.Text.prototype.getBounds = function(a85) {
    return this.dirty && (this.updateText(), this.dirty = !1), b.Sprite.prototype.getBounds.call(this, a85);
}, b.Text.prototype.destroy = function(a86) {
    this.context = null, this.canvas = null, this.texture.destroy(void 0 === a86 ? !0 : a86);
}, b.Text.fontPropertiesCache = {
}, b.Text.fontPropertiesCanvas = document.createElement("canvas"), b.Text.fontPropertiesContext = b.Text.fontPropertiesCanvas.getContext("2d"), b.BitmapText = function(a87, c42) {
    b.DisplayObjectContainer.call(this), this.textWidth = 0, this.textHeight = 0, this._pool = [], this.setText(a87), this.setStyle(c42), this.updateText(), this.dirty = !1;
}, b.BitmapText.prototype = Object.create(b.DisplayObjectContainer.prototype), b.BitmapText.prototype.constructor = b.BitmapText, b.BitmapText.prototype.setText = function(a88) {
    this.text = a88 || " ", this.dirty = !0;
}, b.BitmapText.prototype.setStyle = function(a89) {
    a89 = a89 || {
    }, a89.align = a89.align || "left", this.style = a89;
    var c43 = a89.font.split(" ");
    this.fontName = c43[c43.length - 1], this.fontSize = c43.length >= 2 ? parseInt(c43[c43.length - 2], 10) : b.BitmapText.fonts[this.fontName].size, this.dirty = !0, this.tint = a89.tint;
}, b.BitmapText.prototype.updateText = function() {
    for(var a90 = b.BitmapText.fonts[this.fontName], c44 = new b.Point, d = null, e = [], f = 0, g = [], h = 0, i = this.fontSize / a90.size, j = 0; j < this.text.length; j++){
        var k = this.text.charCodeAt(j);
        if (/(?:\r\n|\r|\n)/.test(this.text.charAt(j))) g.push(c44.x), f = Math.max(f, c44.x), h++, c44.x = 0, c44.y += a90.lineHeight, d = null;
        else {
            var l = a90.chars[k];
            l && (d && l.kerning[d] && (c44.x += l.kerning[d]), e.push({
                texture: l.texture,
                line: h,
                charCode: k,
                position: new b.Point(c44.x + l.xOffset, c44.y + l.yOffset)
            }), c44.x += l.xAdvance, d = k);
        }
    }
    g.push(c44.x), f = Math.max(f, c44.x);
    var m = [];
    for(j = 0; h >= j; j++){
        var n = 0;
        "right" === this.style.align ? n = f - g[j] : "center" === this.style.align && (n = (f - g[j]) / 2), m.push(n);
    }
    var o = this.children.length, p = e.length, q = this.tint || 16777215;
    for(j = 0; p > j; j++){
        var r = o > j ? this.children[j] : this._pool.pop();
        r ? r.setTexture(e[j].texture) : r = new b.Sprite(e[j].texture), r.position.x = (e[j].position.x + m[e[j].line]) * i, r.position.y = e[j].position.y * i, r.scale.x = r.scale.y = i, r.tint = q, r.parent || this.addChild(r);
    }
    for(; this.children.length > p;){
        var s = this.getChildAt(this.children.length - 1);
        this._pool.push(s), this.removeChild(s);
    }
    this.textWidth = f * i, this.textHeight = (c44.y + a90.lineHeight) * i;
}, b.BitmapText.prototype.updateTransform = function() {
    this.dirty && (this.updateText(), this.dirty = !1), b.DisplayObjectContainer.prototype.updateTransform.call(this);
}, b.BitmapText.fonts = {
}, b.InteractionData = function() {
    this.global = new b.Point, this.target = null, this.originalEvent = null;
}, b.InteractionData.prototype.getLocalPosition = function(a91, c45, d) {
    var e = a91.worldTransform, f = d ? d : this.global, g = e.a, h = e.c, i = e.tx, j = e.b, k = e.d, l = e.ty, m = 1 / (g * k + h * -j);
    return c45 = c45 || new b.Point, c45.x = k * m * f.x + -h * m * f.y + (l * h - i * k) * m, c45.y = g * m * f.y + -j * m * f.x + (-l * g + i * j) * m, c45;
}, b.InteractionData.prototype.constructor = b.InteractionData, b.InteractionManager = function(a92) {
    this.stage = a92, this.mouse = new b.InteractionData, this.touches = {
    }, this.tempPoint = new b.Point, this.mouseoverEnabled = !0, this.pool = [], this.interactiveItems = [], this.interactionDOMElement = null, this.onMouseMove = this.onMouseMove.bind(this), this.onMouseDown = this.onMouseDown.bind(this), this.onMouseOut = this.onMouseOut.bind(this), this.onMouseUp = this.onMouseUp.bind(this), this.onTouchStart = this.onTouchStart.bind(this), this.onTouchEnd = this.onTouchEnd.bind(this), this.onTouchCancel = this.onTouchCancel.bind(this), this.onTouchMove = this.onTouchMove.bind(this), this.last = 0, this.currentCursorStyle = "inherit", this.mouseOut = !1, this.resolution = 1, this._tempPoint = new b.Point;
}, b.InteractionManager.prototype.constructor = b.InteractionManager, b.InteractionManager.prototype.collectInteractiveSprite = function(a93, b37) {
    for(var c46 = a93.children, d = c46.length, e = d - 1; e >= 0; e--){
        var f = c46[e];
        f._interactive ? (b37.interactiveChildren = !0, this.interactiveItems.push(f), f.children.length > 0 && this.collectInteractiveSprite(f, f)) : (f.__iParent = null, f.children.length > 0 && this.collectInteractiveSprite(f, b37));
    }
}, b.InteractionManager.prototype.setTarget = function(a94) {
    this.target = a94, this.resolution = a94.resolution, null === this.interactionDOMElement && this.setTargetDomElement(a94.view);
}, b.InteractionManager.prototype.setTargetDomElement = function(a95) {
    this.removeEvents(), window.navigator.msPointerEnabled && (a95.style["-ms-content-zooming"] = "none", a95.style["-ms-touch-action"] = "none"), this.interactionDOMElement = a95, a95.addEventListener("mousemove", this.onMouseMove, !0), a95.addEventListener("mousedown", this.onMouseDown, !0), a95.addEventListener("mouseout", this.onMouseOut, !0), a95.addEventListener("touchstart", this.onTouchStart, !0), a95.addEventListener("touchend", this.onTouchEnd, !0), a95.addEventListener("touchleave", this.onTouchCancel, !0), a95.addEventListener("touchcancel", this.onTouchCancel, !0), a95.addEventListener("touchmove", this.onTouchMove, !0), window.addEventListener("mouseup", this.onMouseUp, !0);
}, b.InteractionManager.prototype.removeEvents = function() {
    this.interactionDOMElement && (this.interactionDOMElement.style["-ms-content-zooming"] = "", this.interactionDOMElement.style["-ms-touch-action"] = "", this.interactionDOMElement.removeEventListener("mousemove", this.onMouseMove, !0), this.interactionDOMElement.removeEventListener("mousedown", this.onMouseDown, !0), this.interactionDOMElement.removeEventListener("mouseout", this.onMouseOut, !0), this.interactionDOMElement.removeEventListener("touchstart", this.onTouchStart, !0), this.interactionDOMElement.removeEventListener("touchend", this.onTouchEnd, !0), this.interactionDOMElement.removeEventListener("touchleave", this.onTouchCancel, !0), this.interactionDOMElement.removeEventListener("touchcancel", this.onTouchCancel, !0), this.interactionDOMElement.removeEventListener("touchmove", this.onTouchMove, !0), this.interactionDOMElement = null, window.removeEventListener("mouseup", this.onMouseUp, !0));
}, b.InteractionManager.prototype.update = function() {
    if (this.target) {
        var a96 = Date.now(), c47 = a96 - this.last;
        if (c47 = c47 * b.INTERACTION_FREQUENCY / 1000, !(1 > c47)) {
            this.last = a96;
            var d = 0;
            this.dirty && this.rebuildInteractiveGraph();
            var e = this.interactiveItems.length, f = "inherit", g = !1;
            for(d = 0; e > d; d++){
                var h = this.interactiveItems[d];
                h.__hit = this.hitTest(h, this.mouse), this.mouse.target = h, h.__hit && !g ? (h.buttonMode && (f = h.defaultCursor), h.interactiveChildren || (g = !0), h.__isOver || (h.mouseover && h.mouseover(this.mouse), h.__isOver = !0)) : h.__isOver && (h.mouseout && h.mouseout(this.mouse), h.__isOver = !1);
            }
            this.currentCursorStyle !== f && (this.currentCursorStyle = f, this.interactionDOMElement.style.cursor = f);
        }
    }
}, b.InteractionManager.prototype.rebuildInteractiveGraph = function() {
    this.dirty = !1;
    for(var a97 = this.interactiveItems.length, b38 = 0; a97 > b38; b38++)this.interactiveItems[b38].interactiveChildren = !1;
    this.interactiveItems = [], this.stage.interactive && this.interactiveItems.push(this.stage), this.collectInteractiveSprite(this.stage, this.stage);
}, b.InteractionManager.prototype.onMouseMove = function(a98) {
    this.dirty && this.rebuildInteractiveGraph(), this.mouse.originalEvent = a98;
    var b39 = this.interactionDOMElement.getBoundingClientRect();
    this.mouse.global.x = (a98.clientX - b39.left) * (this.target.width / b39.width) / this.resolution, this.mouse.global.y = (a98.clientY - b39.top) * (this.target.height / b39.height) / this.resolution;
    for(var c48 = this.interactiveItems.length, d = 0; c48 > d; d++){
        var e = this.interactiveItems[d];
        e.mousemove && e.mousemove(this.mouse);
    }
}, b.InteractionManager.prototype.onMouseDown = function(a99) {
    this.dirty && this.rebuildInteractiveGraph(), this.mouse.originalEvent = a99, b.AUTO_PREVENT_DEFAULT && this.mouse.originalEvent.preventDefault();
    for(var c49 = this.interactiveItems.length, d = this.mouse.originalEvent, e = 2 === d.button || 3 === d.which, f = e ? "rightdown" : "mousedown", g = e ? "rightclick" : "click", h = e ? "__rightIsDown" : "__mouseIsDown", i = e ? "__isRightDown" : "__isDown", j = 0; c49 > j; j++){
        var k = this.interactiveItems[j];
        if ((k[f] || k[g]) && (k[h] = !0, k.__hit = this.hitTest(k, this.mouse), k.__hit && (k[f] && k[f](this.mouse), k[i] = !0, !k.interactiveChildren))) break;
    }
}, b.InteractionManager.prototype.onMouseOut = function(a100) {
    this.dirty && this.rebuildInteractiveGraph(), this.mouse.originalEvent = a100;
    var b40 = this.interactiveItems.length;
    this.interactionDOMElement.style.cursor = "inherit";
    for(var c50 = 0; b40 > c50; c50++){
        var d = this.interactiveItems[c50];
        d.__isOver && (this.mouse.target = d, d.mouseout && d.mouseout(this.mouse), d.__isOver = !1);
    }
    this.mouseOut = !0, this.mouse.global.x = -10000, this.mouse.global.y = -10000;
}, b.InteractionManager.prototype.onMouseUp = function(a101) {
    this.dirty && this.rebuildInteractiveGraph(), this.mouse.originalEvent = a101;
    for(var b41 = this.interactiveItems.length, c51 = !1, d = this.mouse.originalEvent, e = 2 === d.button || 3 === d.which, f = e ? "rightup" : "mouseup", g = e ? "rightclick" : "click", h = e ? "rightupoutside" : "mouseupoutside", i = e ? "__isRightDown" : "__isDown", j = 0; b41 > j; j++){
        var k = this.interactiveItems[j];
        (k[g] || k[f] || k[h]) && (k.__hit = this.hitTest(k, this.mouse), k.__hit && !c51 ? (k[f] && k[f](this.mouse), k[i] && k[g] && k[g](this.mouse), k.interactiveChildren || (c51 = !0)) : k[i] && k[h] && k[h](this.mouse), k[i] = !1);
    }
}, b.InteractionManager.prototype.hitTest = function(a102, c52) {
    var d = c52.global;
    if (!a102.worldVisible) return !1;
    a102.worldTransform.applyInverse(d, this._tempPoint);
    var e, f = this._tempPoint.x, g = this._tempPoint.y;
    if (c52.target = a102, a102.hitArea && a102.hitArea.contains) return a102.hitArea.contains(f, g);
    if (a102 instanceof b.Sprite) {
        var h, i = a102.texture.frame.width, j = a102.texture.frame.height, k = -i * a102.anchor.x;
        if (f > k && k + i > f && (h = -j * a102.anchor.y, g > h && h + j > g)) return !0;
    } else if (a102 instanceof b.Graphics) {
        var l = a102.graphicsData;
        for(e = 0; e < l.length; e++){
            var m = l[e];
            if (m.fill && m.shape && m.shape.contains(f, g)) return !0;
        }
    }
    var n = a102.children.length;
    for(e = 0; n > e; e++){
        var o = a102.children[e], p = this.hitTest(o, c52);
        if (p) return c52.target = a102, !0;
    }
    return !1;
}, b.InteractionManager.prototype.onTouchMove = function(a103) {
    this.dirty && this.rebuildInteractiveGraph();
    for(var b42, c53, d = this.interactionDOMElement.getBoundingClientRect(), e = a103.changedTouches, f = e.length, g = this.target.width / d.width, h = this.target.height / d.height, i = navigator.isCocoonJS && !d.left && !d.top && !a103.target.style.width && !a103.target.style.height, j = 0; f > j; j++)c53 = e[j], i ? (c53.globalX = c53.clientX, c53.globalY = c53.clientY) : (c53.globalX = (c53.clientX - d.left) * g / this.resolution, c53.globalY = (c53.clientY - d.top) * h / this.resolution);
    for(var k = 0; f > k; k++){
        c53 = e[k], b42 = this.touches[c53.identifier], b42.originalEvent = a103, i ? (b42.global.x = c53.clientX, b42.global.y = c53.clientY) : (c53.globalX = b42.global.x = (c53.clientX - d.left) * g / this.resolution, c53.globalY = b42.global.y = (c53.clientY - d.top) * h / this.resolution);
        for(var l = 0; l < this.interactiveItems.length; l++){
            var m = this.interactiveItems[l];
            m.touchmove && m.__touchData && m.__touchData[c53.identifier] && m.touchmove(b42);
        }
    }
}, b.InteractionManager.prototype.onTouchStart = function(a104) {
    this.dirty && this.rebuildInteractiveGraph();
    var c54 = this.interactionDOMElement.getBoundingClientRect();
    b.AUTO_PREVENT_DEFAULT && a104.preventDefault();
    for(var d, e = a104.changedTouches, f = e.length, g = this.target.width / c54.width, h = this.target.height / c54.height, i = navigator.isCocoonJS && !c54.left && !c54.top && !a104.target.style.width && !a104.target.style.height, j = 0; f > j; j++)d = e[j], i ? (d.globalX = d.clientX, d.globalY = d.clientY) : (d.globalX = (d.clientX - c54.left) * g / this.resolution, d.globalY = (d.clientY - c54.top) * h / this.resolution);
    for(var k = 0; f > k; k++){
        d = e[k];
        var l = this.pool.pop();
        l || (l = new b.InteractionData), l.originalEvent = a104, this.touches[d.identifier] = l, i ? (l.global.x = d.clientX, l.global.y = d.clientY) : (l.global.x = (d.clientX - c54.left) * g / this.resolution, l.global.y = (d.clientY - c54.top) * h / this.resolution);
        for(var m = this.interactiveItems.length, n = 0; m > n; n++){
            var o = this.interactiveItems[n];
            if ((o.touchstart || o.tap) && (o.__hit = this.hitTest(o, l), o.__hit && (o.touchstart && o.touchstart(l), o.__isDown = !0, o.__touchData = o.__touchData || {
            }, o.__touchData[d.identifier] = l, !o.interactiveChildren))) break;
        }
    }
}, b.InteractionManager.prototype.onTouchEnd = function(a105) {
    this.dirty && this.rebuildInteractiveGraph();
    for(var b43, c55 = this.interactionDOMElement.getBoundingClientRect(), d = a105.changedTouches, e = d.length, f = this.target.width / c55.width, g = this.target.height / c55.height, h = navigator.isCocoonJS && !c55.left && !c55.top && !a105.target.style.width && !a105.target.style.height, i = 0; e > i; i++)b43 = d[i], h ? (b43.globalX = b43.clientX, b43.globalY = b43.clientY) : (b43.globalX = (b43.clientX - c55.left) * f / this.resolution, b43.globalY = (b43.clientY - c55.top) * g / this.resolution);
    for(var j = 0; e > j; j++){
        b43 = d[j];
        var k = this.touches[b43.identifier], l = !1;
        h ? (k.global.x = b43.clientX, k.global.y = b43.clientY) : (k.global.x = (b43.clientX - c55.left) * f / this.resolution, k.global.y = (b43.clientY - c55.top) * g / this.resolution);
        for(var m = this.interactiveItems.length, n = 0; m > n; n++){
            var o = this.interactiveItems[n];
            o.__touchData && o.__touchData[b43.identifier] && (o.__hit = this.hitTest(o, o.__touchData[b43.identifier]), k.originalEvent = a105, (o.touchend || o.tap) && (o.__hit && !l ? (o.touchend && o.touchend(k), o.__isDown && o.tap && o.tap(k), o.interactiveChildren || (l = !0)) : o.__isDown && o.touchendoutside && o.touchendoutside(k), o.__isDown = !1), o.__touchData[b43.identifier] = null);
        }
        this.pool.push(k), this.touches[b43.identifier] = null;
    }
}, b.InteractionManager.prototype.onTouchCancel = function(a106) {
    this.dirty && this.rebuildInteractiveGraph();
    for(var b44, c56 = this.interactionDOMElement.getBoundingClientRect(), d = a106.changedTouches, e = d.length, f = this.target.width / c56.width, g = this.target.height / c56.height, h = navigator.isCocoonJS && !c56.left && !c56.top && !a106.target.style.width && !a106.target.style.height, i = 0; e > i; i++)b44 = d[i], h ? (b44.globalX = b44.clientX, b44.globalY = b44.clientY) : (b44.globalX = (b44.clientX - c56.left) * f / this.resolution, b44.globalY = (b44.clientY - c56.top) * g / this.resolution);
    for(var j = 0; e > j; j++){
        b44 = d[j];
        var k = this.touches[b44.identifier], l = !1;
        h ? (k.global.x = b44.clientX, k.global.y = b44.clientY) : (k.global.x = (b44.clientX - c56.left) * f / this.resolution, k.global.y = (b44.clientY - c56.top) * g / this.resolution);
        for(var m = this.interactiveItems.length, n = 0; m > n; n++){
            var o = this.interactiveItems[n];
            o.__touchData && o.__touchData[b44.identifier] && (o.__hit = this.hitTest(o, o.__touchData[b44.identifier]), k.originalEvent = a106, o.touchcancel && !l && (o.touchcancel(k), o.interactiveChildren || (l = !0)), o.__isDown = !1, o.__touchData[b44.identifier] = null);
        }
        this.pool.push(k), this.touches[b44.identifier] = null;
    }
}, b.Stage = function(a107) {
    b.DisplayObjectContainer.call(this), this.worldTransform = new b.Matrix, this.interactive = !0, this.interactionManager = new b.InteractionManager(this), this.dirty = !0, this.stage = this, this.stage.hitArea = new b.Rectangle(0, 0, 100000, 100000), this.setBackgroundColor(a107);
}, b.Stage.prototype = Object.create(b.DisplayObjectContainer.prototype), b.Stage.prototype.constructor = b.Stage, b.Stage.prototype.setInteractionDelegate = function(a108) {
    this.interactionManager.setTargetDomElement(a108);
}, b.Stage.prototype.updateTransform = function() {
    this.worldAlpha = 1;
    for(var a109 = 0, b45 = this.children.length; b45 > a109; a109++)this.children[a109].updateTransform();
    this.dirty && (this.dirty = !1, this.interactionManager.dirty = !0), this.interactive && this.interactionManager.update();
}, b.Stage.prototype.setBackgroundColor = function(a110) {
    this.backgroundColor = a110 || 0, this.backgroundColorSplit = b.hex2rgb(this.backgroundColor);
    var c57 = this.backgroundColor.toString(16);
    c57 = "000000".substr(0, 6 - c57.length) + c57, this.backgroundColorString = "#" + c57;
}, b.Stage.prototype.getMousePosition = function() {
    return this.interactionManager.mouse.global;
}, (function(a111) {
    for(var b46 = 0, c58 = [
        "ms",
        "moz",
        "webkit",
        "o"
    ], d1 = 0; d1 < c58.length && !a111.requestAnimationFrame; ++d1)a111.requestAnimationFrame = a111[c58[d1] + "RequestAnimationFrame"], a111.cancelAnimationFrame = a111[c58[d1] + "CancelAnimationFrame"] || a111[c58[d1] + "CancelRequestAnimationFrame"];
    a111.requestAnimationFrame || (a111.requestAnimationFrame = function(c59) {
        var d = (new Date).getTime(), e = Math.max(0, 16 - (d - b46)), f = a111.setTimeout(function() {
            c59(d + e);
        }, e);
        return b46 = d + e, f;
    }), a111.cancelAnimationFrame || (a111.cancelAnimationFrame = function(a112) {
        clearTimeout(a112);
    }), a111.requestAnimFrame = a111.requestAnimationFrame;
})(this), b.hex2rgb = function(a113) {
    return [
        (a113 >> 16 & 255) / 255,
        (a113 >> 8 & 255) / 255,
        (255 & a113) / 255
    ];
}, b.rgb2hex = function(a114) {
    return (255 * a114[0] << 16) + (255 * a114[1] << 8) + 255 * a114[2];
}, "function" != typeof Function.prototype.bind && (Function.prototype.bind = (function() {
    return function(a115) {
        function b47() {
            for(var d = arguments.length, f = new Array(d); d--;)f[d] = arguments[d];
            return f = e.concat(f), c60.apply(this instanceof b47 ? this : a115, f);
        }
        var c60 = this, d2 = arguments.length - 1, e = [];
        if (d2 > 0) for(e.length = d2; d2--;)e[d2] = arguments[d2 + 1];
        if ("function" != typeof c60) throw new TypeError;
        return b47.prototype = (function f(a116) {
            return a116 && (f.prototype = a116), this instanceof f ? void 0 : new f;
        })(c60.prototype), b47;
    };
})()), b.AjaxRequest = function() {
    var a117 = [
        "Msxml2.XMLHTTP.6.0",
        "Msxml2.XMLHTTP.3.0",
        "Microsoft.XMLHTTP"
    ];
    if (!window.ActiveXObject) return window.XMLHttpRequest ? new window.XMLHttpRequest : !1;
    for(var b48 = 0; b48 < a117.length; b48++)try {
        return new window.ActiveXObject(a117[b48]);
    } catch (c) {
    }
}, b.canUseNewCanvasBlendModes = function() {
    if ("undefined" == typeof document) return !1;
    var a118 = document.createElement("canvas");
    a118.width = 1, a118.height = 1;
    var b49 = a118.getContext("2d");
    return b49.fillStyle = "#000", b49.fillRect(0, 0, 1, 1), b49.globalCompositeOperation = "multiply", b49.fillStyle = "#fff", b49.fillRect(0, 0, 1, 1), 0 === b49.getImageData(0, 0, 1, 1).data[0];
}, b.getNextPowerOfTwo = function(a119) {
    if (a119 > 0 && 0 === (a119 & a119 - 1)) return a119;
    for(var b50 = 1; a119 > b50;)b50 <<= 1;
    return b50;
}, b.isPowerOfTwo = function(a120, b51) {
    return a120 > 0 && 0 === (a120 & a120 - 1) && b51 > 0 && 0 === (b51 & b51 - 1);
}, b.EventTarget = {
    call: function(a121) {
        a121 && (a121 = a121.prototype || a121, b.EventTarget.mixin(a121));
    },
    mixin: function(a122) {
        a122.listeners = function(a) {
            return this._listeners = this._listeners || {
            }, this._listeners[a] ? this._listeners[a].slice() : [];
        }, a122.emit = a122.dispatchEvent = function(a123, c61) {
            if (this._listeners = this._listeners || {
            }, "object" == typeof a123 && (c61 = a123, a123 = a123.type), c61 && c61.__isEventObject === !0 || (c61 = new b.Event(this, a123, c61)), this._listeners && this._listeners[a123]) {
                var d, e = this._listeners[a123].slice(0), f = e.length, g = e[0];
                for(d = 0; f > d; g = e[++d])if (g.call(this, c61), c61.stoppedImmediate) return this;
                if (c61.stopped) return this;
            }
            return this.parent && this.parent.emit && this.parent.emit.call(this.parent, a123, c61), this;
        }, a122.on = a122.addEventListener = function(a, b52) {
            return this._listeners = this._listeners || {
            }, (this._listeners[a] = this._listeners[a] || []).push(b52), this;
        }, a122.once = function(a124, b53) {
            function c62() {
                b53.apply(d.off(a124, c62), arguments);
            }
            this._listeners = this._listeners || {
            };
            var d = this;
            return c62._originalHandler = b53, this.on(a124, c62);
        }, a122.off = a122.removeEventListener = function(a, b54) {
            if (this._listeners = this._listeners || {
            }, !this._listeners[a]) return this;
            for(var c63 = this._listeners[a], d = b54 ? c63.length : 0; d-- > 0;)(c63[d] === b54 || c63[d]._originalHandler === b54) && c63.splice(d, 1);
            return 0 === c63.length && delete this._listeners[a], this;
        }, a122.removeAllListeners = function(a) {
            return this._listeners = this._listeners || {
            }, this._listeners[a] ? (delete this._listeners[a], this) : this;
        };
    }
}, b.Event = function(a125, b55, c64) {
    this.__isEventObject = !0, this.stopped = !1, this.stoppedImmediate = !1, this.target = a125, this.type = b55, this.data = c64, this.content = c64, this.timeStamp = Date.now();
}, b.Event.prototype.stopPropagation = function() {
    this.stopped = !0;
}, b.Event.prototype.stopImmediatePropagation = function() {
    this.stoppedImmediate = !0;
}, b.autoDetectRenderer = function(a126, c65, d) {
    a126 || (a126 = 800), c65 || (c65 = 600);
    var e = function() {
        try {
            var a127 = document.createElement("canvas");
            return !!window.WebGLRenderingContext && (a127.getContext("webgl") || a127.getContext("experimental-webgl"));
        } catch (b) {
            return !1;
        }
    }();
    return e ? new b.WebGLRenderer(a126, c65, d) : new b.CanvasRenderer(a126, c65, d);
}, b.autoDetectRecommendedRenderer = function(a128, c66, d) {
    a128 || (a128 = 800), c66 || (c66 = 600);
    var e = function() {
        try {
            var a129 = document.createElement("canvas");
            return !!window.WebGLRenderingContext && (a129.getContext("webgl") || a129.getContext("experimental-webgl"));
        } catch (b) {
            return !1;
        }
    }(), f = /Android/i.test(navigator.userAgent);
    return e && !f ? new b.WebGLRenderer(a128, c66, d) : new b.CanvasRenderer(a128, c66, d);
}, b.PolyK = {
}, b.PolyK.Triangulate = function(a130) {
    var c67 = !0, d = a130.length >> 1;
    if (3 > d) return [];
    for(var e = [], f = [], g = 0; d > g; g++)f.push(g);
    g = 0;
    for(var h = d; h > 3;){
        var i = f[(g + 0) % h], j = f[(g + 1) % h], k = f[(g + 2) % h], l = a130[2 * i], m = a130[2 * i + 1], n = a130[2 * j], o = a130[2 * j + 1], p = a130[2 * k], q = a130[2 * k + 1], r = !1;
        if (b.PolyK._convex(l, m, n, o, p, q, c67)) {
            r = !0;
            for(var s = 0; h > s; s++){
                var t = f[s];
                if (t !== i && t !== j && t !== k && b.PolyK._PointInTriangle(a130[2 * t], a130[2 * t + 1], l, m, n, o, p, q)) {
                    r = !1;
                    break;
                }
            }
        }
        if (r) e.push(i, j, k), f.splice((g + 1) % h, 1), h--, g = 0;
        else if ((g++) > 3 * h) {
            if (!c67) return null;
            for(e = [], f = [], g = 0; d > g; g++)f.push(g);
            g = 0, h = d, c67 = !1;
        }
    }
    return e.push(f[0], f[1], f[2]), e;
}, b.PolyK._PointInTriangle = function(a131, b56, c68, d, e, f, g, h) {
    var i = g - c68, j = h - d, k = e - c68, l = f - d, m = a131 - c68, n = b56 - d, o = i * i + j * j, p = i * k + j * l, q = i * m + j * n, r = k * k + l * l, s = k * m + l * n, t = 1 / (o * r - p * p), u = (r * q - p * s) * t, v = (o * s - p * q) * t;
    return u >= 0 && v >= 0 && 1 > u + v;
}, b.PolyK._convex = function(a132, b57, c69, d, e, f, g) {
    return (b57 - d) * (e - c69) + (c69 - a132) * (f - d) >= 0 === g;
}, b.initDefaultShaders = function() {
}, b.CompileVertexShader = function(a133, c70) {
    return b._CompileShader(a133, c70, a133.VERTEX_SHADER);
}, b.CompileFragmentShader = function(a134, c71) {
    return b._CompileShader(a134, c71, a134.FRAGMENT_SHADER);
}, b._CompileShader = function(a135, b58, c72) {
    var d = b58.join("\n"), e = a135.createShader(c72);
    return a135.shaderSource(e, d), a135.compileShader(e), a135.getShaderParameter(e, a135.COMPILE_STATUS) ? e : (window.console.log(a135.getShaderInfoLog(e)), null);
}, b.compileProgram = function(a136, c73, d) {
    var e = b.CompileFragmentShader(a136, d), f = b.CompileVertexShader(a136, c73), g = a136.createProgram();
    return a136.attachShader(g, f), a136.attachShader(g, e), a136.linkProgram(g), a136.getProgramParameter(g, a136.LINK_STATUS) || window.console.log("Could not initialise shaders"), g;
}, b.PixiShader = function(a137) {
    this._UID = b._UID++, this.gl = a137, this.program = null, this.fragmentSrc = [
        "precision lowp float;",
        "varying vec2 vTextureCoord;",
        "varying vec4 vColor;",
        "uniform sampler2D uSampler;",
        "void main(void) {",
        "   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;",
        "}"
    ], this.textureCount = 0, this.firstRun = !0, this.dirty = !0, this.attributes = [], this.init();
}, b.PixiShader.prototype.constructor = b.PixiShader, b.PixiShader.prototype.init = function() {
    var a138 = this.gl, c74 = b.compileProgram(a138, this.vertexSrc || b.PixiShader.defaultVertexSrc, this.fragmentSrc);
    a138.useProgram(c74), this.uSampler = a138.getUniformLocation(c74, "uSampler"), this.projectionVector = a138.getUniformLocation(c74, "projectionVector"), this.offsetVector = a138.getUniformLocation(c74, "offsetVector"), this.dimensions = a138.getUniformLocation(c74, "dimensions"), this.aVertexPosition = a138.getAttribLocation(c74, "aVertexPosition"), this.aTextureCoord = a138.getAttribLocation(c74, "aTextureCoord"), this.colorAttribute = a138.getAttribLocation(c74, "aColor"), -1 === this.colorAttribute && (this.colorAttribute = 2), this.attributes = [
        this.aVertexPosition,
        this.aTextureCoord,
        this.colorAttribute
    ];
    for(var d in this.uniforms)this.uniforms[d].uniformLocation = a138.getUniformLocation(c74, d);
    this.initUniforms(), this.program = c74;
}, b.PixiShader.prototype.initUniforms = function() {
    this.textureCount = 1;
    var a139, b59 = this.gl;
    for(var c in this.uniforms){
        a139 = this.uniforms[c];
        var d = a139.type;
        "sampler2D" === d ? (a139._init = !1, null !== a139.value && this.initSampler2D(a139)) : "mat2" === d || "mat3" === d || "mat4" === d ? (a139.glMatrix = !0, a139.glValueLength = 1, "mat2" === d ? a139.glFunc = b59.uniformMatrix2fv : "mat3" === d ? a139.glFunc = b59.uniformMatrix3fv : "mat4" === d && (a139.glFunc = b59.uniformMatrix4fv)) : (a139.glFunc = b59["uniform" + d], a139.glValueLength = "2f" === d || "2i" === d ? 2 : "3f" === d || "3i" === d ? 3 : "4f" === d || "4i" === d ? 4 : 1);
    }
}, b.PixiShader.prototype.initSampler2D = function(a140) {
    if (a140.value && a140.value.baseTexture && a140.value.baseTexture.hasLoaded) {
        var b60 = this.gl;
        if (b60.activeTexture(b60["TEXTURE" + this.textureCount]), b60.bindTexture(b60.TEXTURE_2D, a140.value.baseTexture._glTextures[b60.id]), a140.textureData) {
            var c75 = a140.textureData, d = c75.magFilter ? c75.magFilter : b60.LINEAR, e = c75.minFilter ? c75.minFilter : b60.LINEAR, f = c75.wrapS ? c75.wrapS : b60.CLAMP_TO_EDGE, g = c75.wrapT ? c75.wrapT : b60.CLAMP_TO_EDGE, h = c75.luminance ? b60.LUMINANCE : b60.RGBA;
            if (c75.repeat && (f = b60.REPEAT, g = b60.REPEAT), b60.pixelStorei(b60.UNPACK_FLIP_Y_WEBGL, !!c75.flipY), c75.width) {
                var i = c75.width ? c75.width : 512, j = c75.height ? c75.height : 2, k = c75.border ? c75.border : 0;
                b60.texImage2D(b60.TEXTURE_2D, 0, h, i, j, k, h, b60.UNSIGNED_BYTE, null);
            } else b60.texImage2D(b60.TEXTURE_2D, 0, h, b60.RGBA, b60.UNSIGNED_BYTE, a140.value.baseTexture.source);
            b60.texParameteri(b60.TEXTURE_2D, b60.TEXTURE_MAG_FILTER, d), b60.texParameteri(b60.TEXTURE_2D, b60.TEXTURE_MIN_FILTER, e), b60.texParameteri(b60.TEXTURE_2D, b60.TEXTURE_WRAP_S, f), b60.texParameteri(b60.TEXTURE_2D, b60.TEXTURE_WRAP_T, g);
        }
        b60.uniform1i(a140.uniformLocation, this.textureCount), a140._init = !0, this.textureCount++;
    }
}, b.PixiShader.prototype.syncUniforms = function() {
    this.textureCount = 1;
    var a141, c76 = this.gl;
    for(var d in this.uniforms)a141 = this.uniforms[d], 1 === a141.glValueLength ? a141.glMatrix === !0 ? a141.glFunc.call(c76, a141.uniformLocation, a141.transpose, a141.value) : a141.glFunc.call(c76, a141.uniformLocation, a141.value) : 2 === a141.glValueLength ? a141.glFunc.call(c76, a141.uniformLocation, a141.value.x, a141.value.y) : 3 === a141.glValueLength ? a141.glFunc.call(c76, a141.uniformLocation, a141.value.x, a141.value.y, a141.value.z) : 4 === a141.glValueLength ? a141.glFunc.call(c76, a141.uniformLocation, a141.value.x, a141.value.y, a141.value.z, a141.value.w) : "sampler2D" === a141.type && (a141._init ? (c76.activeTexture(c76["TEXTURE" + this.textureCount]), a141.value.baseTexture._dirty[c76.id] ? b.instances[c76.id].updateTexture(a141.value.baseTexture) : c76.bindTexture(c76.TEXTURE_2D, a141.value.baseTexture._glTextures[c76.id]), c76.uniform1i(a141.uniformLocation, this.textureCount), this.textureCount++) : this.initSampler2D(a141));
}, b.PixiShader.prototype.destroy = function() {
    this.gl.deleteProgram(this.program), this.uniforms = null, this.gl = null, this.attributes = null;
}, b.PixiShader.defaultVertexSrc = [
    "attribute vec2 aVertexPosition;",
    "attribute vec2 aTextureCoord;",
    "attribute vec4 aColor;",
    "uniform vec2 projectionVector;",
    "uniform vec2 offsetVector;",
    "varying vec2 vTextureCoord;",
    "varying vec4 vColor;",
    "const vec2 center = vec2(-1.0, 1.0);",
    "void main(void) {",
    "   gl_Position = vec4( ((aVertexPosition + offsetVector) / projectionVector) + center , 0.0, 1.0);",
    "   vTextureCoord = aTextureCoord;",
    "   vColor = vec4(aColor.rgb * aColor.a, aColor.a);",
    "}"
], b.PixiFastShader = function(a142) {
    this._UID = b._UID++, this.gl = a142, this.program = null, this.fragmentSrc = [
        "precision lowp float;",
        "varying vec2 vTextureCoord;",
        "varying float vColor;",
        "uniform sampler2D uSampler;",
        "void main(void) {",
        "   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;",
        "}"
    ], this.vertexSrc = [
        "attribute vec2 aVertexPosition;",
        "attribute vec2 aPositionCoord;",
        "attribute vec2 aScale;",
        "attribute float aRotation;",
        "attribute vec2 aTextureCoord;",
        "attribute float aColor;",
        "uniform vec2 projectionVector;",
        "uniform vec2 offsetVector;",
        "uniform mat3 uMatrix;",
        "varying vec2 vTextureCoord;",
        "varying float vColor;",
        "const vec2 center = vec2(-1.0, 1.0);",
        "void main(void) {",
        "   vec2 v;",
        "   vec2 sv = aVertexPosition * aScale;",
        "   v.x = (sv.x) * cos(aRotation) - (sv.y) * sin(aRotation);",
        "   v.y = (sv.x) * sin(aRotation) + (sv.y) * cos(aRotation);",
        "   v = ( uMatrix * vec3(v + aPositionCoord , 1.0) ).xy ;",
        "   gl_Position = vec4( ( v / projectionVector) + center , 0.0, 1.0);",
        "   vTextureCoord = aTextureCoord;",
        "   vColor = aColor;",
        "}"
    ], this.textureCount = 0, this.init();
}, b.PixiFastShader.prototype.constructor = b.PixiFastShader, b.PixiFastShader.prototype.init = function() {
    var a143 = this.gl, c77 = b.compileProgram(a143, this.vertexSrc, this.fragmentSrc);
    a143.useProgram(c77), this.uSampler = a143.getUniformLocation(c77, "uSampler"), this.projectionVector = a143.getUniformLocation(c77, "projectionVector"), this.offsetVector = a143.getUniformLocation(c77, "offsetVector"), this.dimensions = a143.getUniformLocation(c77, "dimensions"), this.uMatrix = a143.getUniformLocation(c77, "uMatrix"), this.aVertexPosition = a143.getAttribLocation(c77, "aVertexPosition"), this.aPositionCoord = a143.getAttribLocation(c77, "aPositionCoord"), this.aScale = a143.getAttribLocation(c77, "aScale"), this.aRotation = a143.getAttribLocation(c77, "aRotation"), this.aTextureCoord = a143.getAttribLocation(c77, "aTextureCoord"), this.colorAttribute = a143.getAttribLocation(c77, "aColor"), -1 === this.colorAttribute && (this.colorAttribute = 2), this.attributes = [
        this.aVertexPosition,
        this.aPositionCoord,
        this.aScale,
        this.aRotation,
        this.aTextureCoord,
        this.colorAttribute
    ], this.program = c77;
}, b.PixiFastShader.prototype.destroy = function() {
    this.gl.deleteProgram(this.program), this.uniforms = null, this.gl = null, this.attributes = null;
}, b.StripShader = function(a144) {
    this._UID = b._UID++, this.gl = a144, this.program = null, this.fragmentSrc = [
        "precision mediump float;",
        "varying vec2 vTextureCoord;",
        "uniform float alpha;",
        "uniform sampler2D uSampler;",
        "void main(void) {",
        "   gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * alpha;",
        "}"
    ], this.vertexSrc = [
        "attribute vec2 aVertexPosition;",
        "attribute vec2 aTextureCoord;",
        "uniform mat3 translationMatrix;",
        "uniform vec2 projectionVector;",
        "uniform vec2 offsetVector;",
        "varying vec2 vTextureCoord;",
        "void main(void) {",
        "   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);",
        "   v -= offsetVector.xyx;",
        "   gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / -projectionVector.y + 1.0 , 0.0, 1.0);",
        "   vTextureCoord = aTextureCoord;",
        "}"
    ], this.init();
}, b.StripShader.prototype.constructor = b.StripShader, b.StripShader.prototype.init = function() {
    var a145 = this.gl, c78 = b.compileProgram(a145, this.vertexSrc, this.fragmentSrc);
    a145.useProgram(c78), this.uSampler = a145.getUniformLocation(c78, "uSampler"), this.projectionVector = a145.getUniformLocation(c78, "projectionVector"), this.offsetVector = a145.getUniformLocation(c78, "offsetVector"), this.colorAttribute = a145.getAttribLocation(c78, "aColor"), this.aVertexPosition = a145.getAttribLocation(c78, "aVertexPosition"), this.aTextureCoord = a145.getAttribLocation(c78, "aTextureCoord"), this.attributes = [
        this.aVertexPosition,
        this.aTextureCoord
    ], this.translationMatrix = a145.getUniformLocation(c78, "translationMatrix"), this.alpha = a145.getUniformLocation(c78, "alpha"), this.program = c78;
}, b.StripShader.prototype.destroy = function() {
    this.gl.deleteProgram(this.program), this.uniforms = null, this.gl = null, this.attribute = null;
}, b.PrimitiveShader = function(a146) {
    this._UID = b._UID++, this.gl = a146, this.program = null, this.fragmentSrc = [
        "precision mediump float;",
        "varying vec4 vColor;",
        "void main(void) {",
        "   gl_FragColor = vColor;",
        "}"
    ], this.vertexSrc = [
        "attribute vec2 aVertexPosition;",
        "attribute vec4 aColor;",
        "uniform mat3 translationMatrix;",
        "uniform vec2 projectionVector;",
        "uniform vec2 offsetVector;",
        "uniform float alpha;",
        "uniform float flipY;",
        "uniform vec3 tint;",
        "varying vec4 vColor;",
        "void main(void) {",
        "   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);",
        "   v -= offsetVector.xyx;",
        "   gl_Position = vec4( v.x / projectionVector.x -1.0, (v.y / projectionVector.y * -flipY) + flipY , 0.0, 1.0);",
        "   vColor = aColor * vec4(tint * alpha, alpha);",
        "}"
    ], this.init();
}, b.PrimitiveShader.prototype.constructor = b.PrimitiveShader, b.PrimitiveShader.prototype.init = function() {
    var a147 = this.gl, c79 = b.compileProgram(a147, this.vertexSrc, this.fragmentSrc);
    a147.useProgram(c79), this.projectionVector = a147.getUniformLocation(c79, "projectionVector"), this.offsetVector = a147.getUniformLocation(c79, "offsetVector"), this.tintColor = a147.getUniformLocation(c79, "tint"), this.flipY = a147.getUniformLocation(c79, "flipY"), this.aVertexPosition = a147.getAttribLocation(c79, "aVertexPosition"), this.colorAttribute = a147.getAttribLocation(c79, "aColor"), this.attributes = [
        this.aVertexPosition,
        this.colorAttribute
    ], this.translationMatrix = a147.getUniformLocation(c79, "translationMatrix"), this.alpha = a147.getUniformLocation(c79, "alpha"), this.program = c79;
}, b.PrimitiveShader.prototype.destroy = function() {
    this.gl.deleteProgram(this.program), this.uniforms = null, this.gl = null, this.attributes = null;
}, b.ComplexPrimitiveShader = function(a148) {
    this._UID = b._UID++, this.gl = a148, this.program = null, this.fragmentSrc = [
        "precision mediump float;",
        "varying vec4 vColor;",
        "void main(void) {",
        "   gl_FragColor = vColor;",
        "}"
    ], this.vertexSrc = [
        "attribute vec2 aVertexPosition;",
        "uniform mat3 translationMatrix;",
        "uniform vec2 projectionVector;",
        "uniform vec2 offsetVector;",
        "uniform vec3 tint;",
        "uniform float alpha;",
        "uniform vec3 color;",
        "uniform float flipY;",
        "varying vec4 vColor;",
        "void main(void) {",
        "   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);",
        "   v -= offsetVector.xyx;",
        "   gl_Position = vec4( v.x / projectionVector.x -1.0, (v.y / projectionVector.y * -flipY) + flipY , 0.0, 1.0);",
        "   vColor = vec4(color * alpha * tint, alpha);",
        "}"
    ], this.init();
}, b.ComplexPrimitiveShader.prototype.constructor = b.ComplexPrimitiveShader, b.ComplexPrimitiveShader.prototype.init = function() {
    var a149 = this.gl, c80 = b.compileProgram(a149, this.vertexSrc, this.fragmentSrc);
    a149.useProgram(c80), this.projectionVector = a149.getUniformLocation(c80, "projectionVector"), this.offsetVector = a149.getUniformLocation(c80, "offsetVector"), this.tintColor = a149.getUniformLocation(c80, "tint"), this.color = a149.getUniformLocation(c80, "color"), this.flipY = a149.getUniformLocation(c80, "flipY"), this.aVertexPosition = a149.getAttribLocation(c80, "aVertexPosition"), this.attributes = [
        this.aVertexPosition,
        this.colorAttribute
    ], this.translationMatrix = a149.getUniformLocation(c80, "translationMatrix"), this.alpha = a149.getUniformLocation(c80, "alpha"), this.program = c80;
}, b.ComplexPrimitiveShader.prototype.destroy = function() {
    this.gl.deleteProgram(this.program), this.uniforms = null, this.gl = null, this.attribute = null;
}, b.WebGLGraphics = function() {
}, b.WebGLGraphics.renderGraphics = function(a150, c81) {
    var d, e = c81.gl, f = c81.projection, g = c81.offset, h = c81.shaderManager.primitiveShader;
    a150.dirty && b.WebGLGraphics.updateGraphics(a150, e);
    for(var i = a150._webGL[e.id], j = 0; j < i.data.length; j++)1 === i.data[j].mode ? (d = i.data[j], c81.stencilManager.pushStencil(a150, d, c81), e.drawElements(e.TRIANGLE_FAN, 4, e.UNSIGNED_SHORT, 2 * (d.indices.length - 4)), c81.stencilManager.popStencil(a150, d, c81)) : (d = i.data[j], c81.shaderManager.setShader(h), h = c81.shaderManager.primitiveShader, e.uniformMatrix3fv(h.translationMatrix, !1, a150.worldTransform.toArray(!0)), e.uniform1f(h.flipY, 1), e.uniform2f(h.projectionVector, f.x, -f.y), e.uniform2f(h.offsetVector, -g.x, -g.y), e.uniform3fv(h.tintColor, b.hex2rgb(a150.tint)), e.uniform1f(h.alpha, a150.worldAlpha), e.bindBuffer(e.ARRAY_BUFFER, d.buffer), e.vertexAttribPointer(h.aVertexPosition, 2, e.FLOAT, !1, 24, 0), e.vertexAttribPointer(h.colorAttribute, 4, e.FLOAT, !1, 24, 8), e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, d.indexBuffer), e.drawElements(e.TRIANGLE_STRIP, d.indices.length, e.UNSIGNED_SHORT, 0));
}, b.WebGLGraphics.updateGraphics = function(a151, c82) {
    var d = a151._webGL[c82.id];
    d || (d = a151._webGL[c82.id] = {
        lastIndex: 0,
        data: [],
        gl: c82
    }), a151.dirty = !1;
    var e;
    if (a151.clearDirty) {
        for(a151.clearDirty = !1, e = 0; e < d.data.length; e++){
            var f = d.data[e];
            f.reset(), b.WebGLGraphics.graphicsDataPool.push(f);
        }
        d.data = [], d.lastIndex = 0;
    }
    var g;
    for(e = d.lastIndex; e < a151.graphicsData.length; e++){
        var h = a151.graphicsData[e];
        if (h.type === b.Graphics.POLY) {
            if (h.points = h.shape.points.slice(), h.shape.closed && (h.points[0] !== h.points[h.points.length - 2] || h.points[1] !== h.points[h.points.length - 1]) && h.points.push(h.points[0], h.points[1]), h.fill && h.points.length >= 6) {
                if (h.points.length < 12) {
                    g = b.WebGLGraphics.switchMode(d, 0);
                    var i = b.WebGLGraphics.buildPoly(h, g);
                    i || (g = b.WebGLGraphics.switchMode(d, 1), b.WebGLGraphics.buildComplexPoly(h, g));
                } else g = b.WebGLGraphics.switchMode(d, 1), b.WebGLGraphics.buildComplexPoly(h, g);
            }
            h.lineWidth > 0 && (g = b.WebGLGraphics.switchMode(d, 0), b.WebGLGraphics.buildLine(h, g));
        } else g = b.WebGLGraphics.switchMode(d, 0), h.type === b.Graphics.RECT ? b.WebGLGraphics.buildRectangle(h, g) : h.type === b.Graphics.CIRC || h.type === b.Graphics.ELIP ? b.WebGLGraphics.buildCircle(h, g) : h.type === b.Graphics.RREC && b.WebGLGraphics.buildRoundedRectangle(h, g);
        d.lastIndex++;
    }
    for(e = 0; e < d.data.length; e++)g = d.data[e], g.dirty && g.upload();
}, b.WebGLGraphics.switchMode = function(a152, c83) {
    var d;
    return a152.data.length ? (d = a152.data[a152.data.length - 1], (d.mode !== c83 || 1 === c83) && (d = b.WebGLGraphics.graphicsDataPool.pop() || new b.WebGLGraphicsData(a152.gl), d.mode = c83, a152.data.push(d))) : (d = b.WebGLGraphics.graphicsDataPool.pop() || new b.WebGLGraphicsData(a152.gl), d.mode = c83, a152.data.push(d)), d.dirty = !0, d;
}, b.WebGLGraphics.buildRectangle = function(a153, c84) {
    var d = a153.shape, e = d.x, f = d.y, g = d.width, h = d.height;
    if (a153.fill) {
        var i = b.hex2rgb(a153.fillColor), j = a153.fillAlpha, k = i[0] * j, l = i[1] * j, m = i[2] * j, n = c84.points, o = c84.indices, p = n.length / 6;
        n.push(e, f), n.push(k, l, m, j), n.push(e + g, f), n.push(k, l, m, j), n.push(e, f + h), n.push(k, l, m, j), n.push(e + g, f + h), n.push(k, l, m, j), o.push(p, p, p + 1, p + 2, p + 3, p + 3);
    }
    if (a153.lineWidth) {
        var q = a153.points;
        a153.points = [
            e,
            f,
            e + g,
            f,
            e + g,
            f + h,
            e,
            f + h,
            e,
            f
        ], b.WebGLGraphics.buildLine(a153, c84), a153.points = q;
    }
}, b.WebGLGraphics.buildRoundedRectangle = function(a154, c85) {
    var d = a154.shape, e = d.x, f = d.y, g = d.width, h = d.height, i = d.radius, j = [];
    if (j.push(e, f + i), j = j.concat(b.WebGLGraphics.quadraticBezierCurve(e, f + h - i, e, f + h, e + i, f + h)), j = j.concat(b.WebGLGraphics.quadraticBezierCurve(e + g - i, f + h, e + g, f + h, e + g, f + h - i)), j = j.concat(b.WebGLGraphics.quadraticBezierCurve(e + g, f + i, e + g, f, e + g - i, f)), j = j.concat(b.WebGLGraphics.quadraticBezierCurve(e + i, f, e, f, e, f + i)), a154.fill) {
        var k = b.hex2rgb(a154.fillColor), l = a154.fillAlpha, m = k[0] * l, n = k[1] * l, o = k[2] * l, p = c85.points, q = c85.indices, r = p.length / 6, s = b.PolyK.Triangulate(j), t = 0;
        for(t = 0; t < s.length; t += 3)q.push(s[t] + r), q.push(s[t] + r), q.push(s[t + 1] + r), q.push(s[t + 2] + r), q.push(s[t + 2] + r);
        for(t = 0; t < j.length; t++)p.push(j[t], j[++t], m, n, o, l);
    }
    if (a154.lineWidth) {
        var u = a154.points;
        a154.points = j, b.WebGLGraphics.buildLine(a154, c85), a154.points = u;
    }
}, b.WebGLGraphics.quadraticBezierCurve = function(a155, b61, c86, d3, e, f) {
    function g(a156, b62, c87) {
        var d = b62 - a156;
        return a156 + d * c87;
    }
    for(var h, i, j, k, l, m, n = 20, o = [], p = 0, q = 0; n >= q; q++)p = q / n, h = g(a155, c86, p), i = g(b61, d3, p), j = g(c86, e, p), k = g(d3, f, p), l = g(h, j, p), m = g(i, k, p), o.push(l, m);
    return o;
}, b.WebGLGraphics.buildCircle = function(a157, c88) {
    var d, e, f = a157.shape, g = f.x, h = f.y;
    a157.type === b.Graphics.CIRC ? (d = f.radius, e = f.radius) : (d = f.width, e = f.height);
    var i = 40, j = 2 * Math.PI / i, k = 0;
    if (a157.fill) {
        var l = b.hex2rgb(a157.fillColor), m = a157.fillAlpha, n = l[0] * m, o = l[1] * m, p = l[2] * m, q = c88.points, r = c88.indices, s = q.length / 6;
        for(r.push(s), k = 0; i + 1 > k; k++)q.push(g, h, n, o, p, m), q.push(g + Math.sin(j * k) * d, h + Math.cos(j * k) * e, n, o, p, m), r.push(s++, s++);
        r.push(s - 1);
    }
    if (a157.lineWidth) {
        var t = a157.points;
        for(a157.points = [], k = 0; i + 1 > k; k++)a157.points.push(g + Math.sin(j * k) * d, h + Math.cos(j * k) * e);
        b.WebGLGraphics.buildLine(a157, c88), a157.points = t;
    }
}, b.WebGLGraphics.buildLine = function(a158, c89) {
    var d = 0, e = a158.points;
    if (0 !== e.length) {
        if (a158.lineWidth % 2) for(d = 0; d < e.length; d++)e[d] += 0.5;
        var f = new b.Point(e[0], e[1]), g = new b.Point(e[e.length - 2], e[e.length - 1]);
        if (f.x === g.x && f.y === g.y) {
            e = e.slice(), e.pop(), e.pop(), g = new b.Point(e[e.length - 2], e[e.length - 1]);
            var h = g.x + 0.5 * (f.x - g.x), i = g.y + 0.5 * (f.y - g.y);
            e.unshift(h, i), e.push(h, i);
        }
        var j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z, A, B, C, D, E, F, G = c89.points, H = c89.indices, I = e.length / 2, J = e.length, K = G.length / 6, L = a158.lineWidth / 2, M = b.hex2rgb(a158.lineColor), N = a158.lineAlpha, O = M[0] * N, P = M[1] * N, Q = M[2] * N;
        for(l = e[0], m = e[1], n = e[2], o = e[3], r = -(m - o), s = l - n, F = Math.sqrt(r * r + s * s), r /= F, s /= F, r *= L, s *= L, G.push(l - r, m - s, O, P, Q, N), G.push(l + r, m + s, O, P, Q, N), d = 1; I - 1 > d; d++)l = e[2 * (d - 1)], m = e[2 * (d - 1) + 1], n = e[2 * d], o = e[2 * d + 1], p = e[2 * (d + 1)], q = e[2 * (d + 1) + 1], r = -(m - o), s = l - n, F = Math.sqrt(r * r + s * s), r /= F, s /= F, r *= L, s *= L, t = -(o - q), u = n - p, F = Math.sqrt(t * t + u * u), t /= F, u /= F, t *= L, u *= L, x = -s + m - (-s + o), y = -r + n - (-r + l), z = (-r + l) * (-s + o) - (-r + n) * (-s + m), A = -u + q - (-u + o), B = -t + n - (-t + p), C = (-t + p) * (-u + o) - (-t + n) * (-u + q), D = x * B - A * y, Math.abs(D) < 0.1 ? (D += 10.1, G.push(n - r, o - s, O, P, Q, N), G.push(n + r, o + s, O, P, Q, N)) : (j = (y * C - B * z) / D, k = (A * z - x * C) / D, E = (j - n) * (j - n) + (k - o) + (k - o), E > 19600 ? (v = r - t, w = s - u, F = Math.sqrt(v * v + w * w), v /= F, w /= F, v *= L, w *= L, G.push(n - v, o - w), G.push(O, P, Q, N), G.push(n + v, o + w), G.push(O, P, Q, N), G.push(n - v, o - w), G.push(O, P, Q, N), J++) : (G.push(j, k), G.push(O, P, Q, N), G.push(n - (j - n), o - (k - o)), G.push(O, P, Q, N)));
        for(l = e[2 * (I - 2)], m = e[2 * (I - 2) + 1], n = e[2 * (I - 1)], o = e[2 * (I - 1) + 1], r = -(m - o), s = l - n, F = Math.sqrt(r * r + s * s), r /= F, s /= F, r *= L, s *= L, G.push(n - r, o - s), G.push(O, P, Q, N), G.push(n + r, o + s), G.push(O, P, Q, N), H.push(K), d = 0; J > d; d++)H.push(K++);
        H.push(K - 1);
    }
}, b.WebGLGraphics.buildComplexPoly = function(a159, c90) {
    var d = a159.points.slice();
    if (!(d.length < 6)) {
        var e = c90.indices;
        c90.points = d, c90.alpha = a159.fillAlpha, c90.color = b.hex2rgb(a159.fillColor);
        for(var f, g, h = 1 / 0, i = -1 / 0, j = 1 / 0, k = -1 / 0, l = 0; l < d.length; l += 2)f = d[l], g = d[l + 1], h = h > f ? f : h, i = f > i ? f : i, j = j > g ? g : j, k = g > k ? g : k;
        d.push(h, j, i, j, i, k, h, k);
        var m = d.length / 2;
        for(l = 0; m > l; l++)e.push(l);
    }
}, b.WebGLGraphics.buildPoly = function(a160, c91) {
    var d = a160.points;
    if (!(d.length < 6)) {
        var e = c91.points, f = c91.indices, g = d.length / 2, h = b.hex2rgb(a160.fillColor), i = a160.fillAlpha, j = h[0] * i, k = h[1] * i, l = h[2] * i, m = b.PolyK.Triangulate(d);
        if (!m) return !1;
        var n = e.length / 6, o = 0;
        for(o = 0; o < m.length; o += 3)f.push(m[o] + n), f.push(m[o] + n), f.push(m[o + 1] + n), f.push(m[o + 2] + n), f.push(m[o + 2] + n);
        for(o = 0; g > o; o++)e.push(d[2 * o], d[2 * o + 1], j, k, l, i);
        return !0;
    }
}, b.WebGLGraphics.graphicsDataPool = [], b.WebGLGraphicsData = function(a161) {
    this.gl = a161, this.color = [
        0,
        0,
        0
    ], this.points = [], this.indices = [], this.buffer = a161.createBuffer(), this.indexBuffer = a161.createBuffer(), this.mode = 1, this.alpha = 1, this.dirty = !0;
}, b.WebGLGraphicsData.prototype.reset = function() {
    this.points = [], this.indices = [];
}, b.WebGLGraphicsData.prototype.upload = function() {
    var a162 = this.gl;
    this.glPoints = new b.Float32Array(this.points), a162.bindBuffer(a162.ARRAY_BUFFER, this.buffer), a162.bufferData(a162.ARRAY_BUFFER, this.glPoints, a162.STATIC_DRAW), this.glIndicies = new b.Uint16Array(this.indices), a162.bindBuffer(a162.ELEMENT_ARRAY_BUFFER, this.indexBuffer), a162.bufferData(a162.ELEMENT_ARRAY_BUFFER, this.glIndicies, a162.STATIC_DRAW), this.dirty = !1;
}, b.glContexts = [], b.instances = [], b.WebGLRenderer = function(a163, c92, d) {
    if (d) for(var e in b.defaultRenderOptions)"undefined" == typeof d[e] && (d[e] = b.defaultRenderOptions[e]);
    else d = b.defaultRenderOptions;
    b.defaultRenderer || (b.sayHello("webGL"), b.defaultRenderer = this), this.type = b.WEBGL_RENDERER, this.resolution = d.resolution, this.transparent = d.transparent, this.autoResize = d.autoResize || !1, this.preserveDrawingBuffer = d.preserveDrawingBuffer, this.clearBeforeRender = d.clearBeforeRender, this.width = a163 || 800, this.height = c92 || 600, this.view = d.view || document.createElement("canvas"), this.contextLostBound = this.handleContextLost.bind(this), this.contextRestoredBound = this.handleContextRestored.bind(this), this.view.addEventListener("webglcontextlost", this.contextLostBound, !1), this.view.addEventListener("webglcontextrestored", this.contextRestoredBound, !1), this._contextOptions = {
        alpha: this.transparent,
        antialias: d.antialias,
        premultipliedAlpha: this.transparent && "notMultiplied" !== this.transparent,
        stencil: !0,
        preserveDrawingBuffer: d.preserveDrawingBuffer
    }, this.projection = new b.Point, this.offset = new b.Point(0, 0), this.shaderManager = new b.WebGLShaderManager, this.spriteBatch = new b.WebGLSpriteBatch, this.maskManager = new b.WebGLMaskManager, this.filterManager = new b.WebGLFilterManager, this.stencilManager = new b.WebGLStencilManager, this.blendModeManager = new b.WebGLBlendModeManager, this.renderSession = {
    }, this.renderSession.gl = this.gl, this.renderSession.drawCount = 0, this.renderSession.shaderManager = this.shaderManager, this.renderSession.maskManager = this.maskManager, this.renderSession.filterManager = this.filterManager, this.renderSession.blendModeManager = this.blendModeManager, this.renderSession.spriteBatch = this.spriteBatch, this.renderSession.stencilManager = this.stencilManager, this.renderSession.renderer = this, this.renderSession.resolution = this.resolution, this.initContext(), this.mapBlendModes();
}, b.WebGLRenderer.prototype.constructor = b.WebGLRenderer, b.WebGLRenderer.prototype.initContext = function() {
    var a164 = this.view.getContext("webgl", this._contextOptions) || this.view.getContext("experimental-webgl", this._contextOptions);
    if (this.gl = a164, !a164) throw new Error("This browser does not support webGL. Try using the canvas renderer");
    this.glContextId = a164.id = b.WebGLRenderer.glContextId++, b.glContexts[this.glContextId] = a164, b.instances[this.glContextId] = this, a164.disable(a164.DEPTH_TEST), a164.disable(a164.CULL_FACE), a164.enable(a164.BLEND), this.shaderManager.setContext(a164), this.spriteBatch.setContext(a164), this.maskManager.setContext(a164), this.filterManager.setContext(a164), this.blendModeManager.setContext(a164), this.stencilManager.setContext(a164), this.renderSession.gl = this.gl, this.resize(this.width, this.height);
}, b.WebGLRenderer.prototype.render = function(a165) {
    if (!this.contextLost) {
        this.__stage !== a165 && (a165.interactive && a165.interactionManager.removeEvents(), this.__stage = a165), a165.updateTransform();
        var b63 = this.gl;
        a165._interactive ? a165._interactiveEventsAdded || (a165._interactiveEventsAdded = !0, a165.interactionManager.setTarget(this)) : a165._interactiveEventsAdded && (a165._interactiveEventsAdded = !1, a165.interactionManager.setTarget(this)), b63.viewport(0, 0, this.width, this.height), b63.bindFramebuffer(b63.FRAMEBUFFER, null), this.clearBeforeRender && (this.transparent ? b63.clearColor(0, 0, 0, 0) : b63.clearColor(a165.backgroundColorSplit[0], a165.backgroundColorSplit[1], a165.backgroundColorSplit[2], 1), b63.clear(b63.COLOR_BUFFER_BIT)), this.renderDisplayObject(a165, this.projection);
    }
}, b.WebGLRenderer.prototype.renderDisplayObject = function(a166, c93, d) {
    this.renderSession.blendModeManager.setBlendMode(b.blendModes.NORMAL), this.renderSession.drawCount = 0, this.renderSession.flipY = d ? -1 : 1, this.renderSession.projection = c93, this.renderSession.offset = this.offset, this.spriteBatch.begin(this.renderSession), this.filterManager.begin(this.renderSession, d), a166._renderWebGL(this.renderSession), this.spriteBatch.end();
}, b.WebGLRenderer.prototype.resize = function(a167, b64) {
    this.width = a167 * this.resolution, this.height = b64 * this.resolution, this.view.width = this.width, this.view.height = this.height, this.autoResize && (this.view.style.width = this.width / this.resolution + "px", this.view.style.height = this.height / this.resolution + "px"), this.gl.viewport(0, 0, this.width, this.height), this.projection.x = this.width / 2 / this.resolution, this.projection.y = -this.height / 2 / this.resolution;
}, b.WebGLRenderer.prototype.updateTexture = function(a168) {
    if (a168.hasLoaded) {
        var c94 = this.gl;
        return a168._glTextures[c94.id] || (a168._glTextures[c94.id] = c94.createTexture()), c94.bindTexture(c94.TEXTURE_2D, a168._glTextures[c94.id]), c94.pixelStorei(c94.UNPACK_PREMULTIPLY_ALPHA_WEBGL, a168.premultipliedAlpha), c94.texImage2D(c94.TEXTURE_2D, 0, c94.RGBA, c94.RGBA, c94.UNSIGNED_BYTE, a168.source), c94.texParameteri(c94.TEXTURE_2D, c94.TEXTURE_MAG_FILTER, a168.scaleMode === b.scaleModes.LINEAR ? c94.LINEAR : c94.NEAREST), a168.mipmap && b.isPowerOfTwo(a168.width, a168.height) ? (c94.texParameteri(c94.TEXTURE_2D, c94.TEXTURE_MIN_FILTER, a168.scaleMode === b.scaleModes.LINEAR ? c94.LINEAR_MIPMAP_LINEAR : c94.NEAREST_MIPMAP_NEAREST), c94.generateMipmap(c94.TEXTURE_2D)) : c94.texParameteri(c94.TEXTURE_2D, c94.TEXTURE_MIN_FILTER, a168.scaleMode === b.scaleModes.LINEAR ? c94.LINEAR : c94.NEAREST), a168._powerOf2 ? (c94.texParameteri(c94.TEXTURE_2D, c94.TEXTURE_WRAP_S, c94.REPEAT), c94.texParameteri(c94.TEXTURE_2D, c94.TEXTURE_WRAP_T, c94.REPEAT)) : (c94.texParameteri(c94.TEXTURE_2D, c94.TEXTURE_WRAP_S, c94.CLAMP_TO_EDGE), c94.texParameteri(c94.TEXTURE_2D, c94.TEXTURE_WRAP_T, c94.CLAMP_TO_EDGE)), a168._dirty[c94.id] = !1, a168._glTextures[c94.id];
    }
}, b.WebGLRenderer.prototype.handleContextLost = function(a169) {
    a169.preventDefault(), this.contextLost = !0;
}, b.WebGLRenderer.prototype.handleContextRestored = function() {
    this.initContext();
    for(var a in b.TextureCache){
        var c95 = b.TextureCache[a].baseTexture;
        c95._glTextures = [];
    }
    this.contextLost = !1;
}, b.WebGLRenderer.prototype.destroy = function() {
    this.view.removeEventListener("webglcontextlost", this.contextLostBound), this.view.removeEventListener("webglcontextrestored", this.contextRestoredBound), b.glContexts[this.glContextId] = null, this.projection = null, this.offset = null, this.shaderManager.destroy(), this.spriteBatch.destroy(), this.maskManager.destroy(), this.filterManager.destroy(), this.shaderManager = null, this.spriteBatch = null, this.maskManager = null, this.filterManager = null, this.gl = null, this.renderSession = null;
}, b.WebGLRenderer.prototype.mapBlendModes = function() {
    var a170 = this.gl;
    b.blendModesWebGL || (b.blendModesWebGL = [], b.blendModesWebGL[b.blendModes.NORMAL] = [
        a170.ONE,
        a170.ONE_MINUS_SRC_ALPHA
    ], b.blendModesWebGL[b.blendModes.ADD] = [
        a170.SRC_ALPHA,
        a170.DST_ALPHA
    ], b.blendModesWebGL[b.blendModes.MULTIPLY] = [
        a170.DST_COLOR,
        a170.ONE_MINUS_SRC_ALPHA
    ], b.blendModesWebGL[b.blendModes.SCREEN] = [
        a170.SRC_ALPHA,
        a170.ONE
    ], b.blendModesWebGL[b.blendModes.OVERLAY] = [
        a170.ONE,
        a170.ONE_MINUS_SRC_ALPHA
    ], b.blendModesWebGL[b.blendModes.DARKEN] = [
        a170.ONE,
        a170.ONE_MINUS_SRC_ALPHA
    ], b.blendModesWebGL[b.blendModes.LIGHTEN] = [
        a170.ONE,
        a170.ONE_MINUS_SRC_ALPHA
    ], b.blendModesWebGL[b.blendModes.COLOR_DODGE] = [
        a170.ONE,
        a170.ONE_MINUS_SRC_ALPHA
    ], b.blendModesWebGL[b.blendModes.COLOR_BURN] = [
        a170.ONE,
        a170.ONE_MINUS_SRC_ALPHA
    ], b.blendModesWebGL[b.blendModes.HARD_LIGHT] = [
        a170.ONE,
        a170.ONE_MINUS_SRC_ALPHA
    ], b.blendModesWebGL[b.blendModes.SOFT_LIGHT] = [
        a170.ONE,
        a170.ONE_MINUS_SRC_ALPHA
    ], b.blendModesWebGL[b.blendModes.DIFFERENCE] = [
        a170.ONE,
        a170.ONE_MINUS_SRC_ALPHA
    ], b.blendModesWebGL[b.blendModes.EXCLUSION] = [
        a170.ONE,
        a170.ONE_MINUS_SRC_ALPHA
    ], b.blendModesWebGL[b.blendModes.HUE] = [
        a170.ONE,
        a170.ONE_MINUS_SRC_ALPHA
    ], b.blendModesWebGL[b.blendModes.SATURATION] = [
        a170.ONE,
        a170.ONE_MINUS_SRC_ALPHA
    ], b.blendModesWebGL[b.blendModes.COLOR] = [
        a170.ONE,
        a170.ONE_MINUS_SRC_ALPHA
    ], b.blendModesWebGL[b.blendModes.LUMINOSITY] = [
        a170.ONE,
        a170.ONE_MINUS_SRC_ALPHA
    ]);
}, b.WebGLRenderer.glContextId = 0, b.WebGLBlendModeManager = function() {
    this.currentBlendMode = 99999;
}, b.WebGLBlendModeManager.prototype.constructor = b.WebGLBlendModeManager, b.WebGLBlendModeManager.prototype.setContext = function(a171) {
    this.gl = a171;
}, b.WebGLBlendModeManager.prototype.setBlendMode = function(a172) {
    if (this.currentBlendMode === a172) return !1;
    this.currentBlendMode = a172;
    var c96 = b.blendModesWebGL[this.currentBlendMode];
    return this.gl.blendFunc(c96[0], c96[1]), !0;
}, b.WebGLBlendModeManager.prototype.destroy = function() {
    this.gl = null;
}, b.WebGLMaskManager = function() {
}, b.WebGLMaskManager.prototype.constructor = b.WebGLMaskManager, b.WebGLMaskManager.prototype.setContext = function(a173) {
    this.gl = a173;
}, b.WebGLMaskManager.prototype.pushMask = function(a174, c97) {
    var d = c97.gl;
    a174.dirty && b.WebGLGraphics.updateGraphics(a174, d), a174._webGL[d.id].data.length && c97.stencilManager.pushStencil(a174, a174._webGL[d.id].data[0], c97);
}, b.WebGLMaskManager.prototype.popMask = function(a175, b65) {
    var c = this.gl;
    b65.stencilManager.popStencil(a175, a175._webGL[c.id].data[0], b65);
}, b.WebGLMaskManager.prototype.destroy = function() {
    this.gl = null;
}, b.WebGLStencilManager = function() {
    this.stencilStack = [], this.reverse = !0, this.count = 0;
}, b.WebGLStencilManager.prototype.setContext = function(a176) {
    this.gl = a176;
}, b.WebGLStencilManager.prototype.pushStencil = function(a177, b66, c98) {
    var d = this.gl;
    this.bindGraphics(a177, b66, c98), 0 === this.stencilStack.length && (d.enable(d.STENCIL_TEST), d.clear(d.STENCIL_BUFFER_BIT), this.reverse = !0, this.count = 0), this.stencilStack.push(b66);
    var e = this.count;
    d.colorMask(!1, !1, !1, !1), d.stencilFunc(d.ALWAYS, 0, 255), d.stencilOp(d.KEEP, d.KEEP, d.INVERT), 1 === b66.mode ? (d.drawElements(d.TRIANGLE_FAN, b66.indices.length - 4, d.UNSIGNED_SHORT, 0), this.reverse ? (d.stencilFunc(d.EQUAL, 255 - e, 255), d.stencilOp(d.KEEP, d.KEEP, d.DECR)) : (d.stencilFunc(d.EQUAL, e, 255), d.stencilOp(d.KEEP, d.KEEP, d.INCR)), d.drawElements(d.TRIANGLE_FAN, 4, d.UNSIGNED_SHORT, 2 * (b66.indices.length - 4)), this.reverse ? d.stencilFunc(d.EQUAL, 255 - (e + 1), 255) : d.stencilFunc(d.EQUAL, e + 1, 255), this.reverse = !this.reverse) : (this.reverse ? (d.stencilFunc(d.EQUAL, e, 255), d.stencilOp(d.KEEP, d.KEEP, d.INCR)) : (d.stencilFunc(d.EQUAL, 255 - e, 255), d.stencilOp(d.KEEP, d.KEEP, d.DECR)), d.drawElements(d.TRIANGLE_STRIP, b66.indices.length, d.UNSIGNED_SHORT, 0), this.reverse ? d.stencilFunc(d.EQUAL, e + 1, 255) : d.stencilFunc(d.EQUAL, 255 - (e + 1), 255)), d.colorMask(!0, !0, !0, !0), d.stencilOp(d.KEEP, d.KEEP, d.KEEP), this.count++;
}, b.WebGLStencilManager.prototype.bindGraphics = function(a178, c99, d) {
    this._currentGraphics = a178;
    var e, f = this.gl, g = d.projection, h = d.offset;
    1 === c99.mode ? (e = d.shaderManager.complexPrimitiveShader, d.shaderManager.setShader(e), f.uniform1f(e.flipY, d.flipY), f.uniformMatrix3fv(e.translationMatrix, !1, a178.worldTransform.toArray(!0)), f.uniform2f(e.projectionVector, g.x, -g.y), f.uniform2f(e.offsetVector, -h.x, -h.y), f.uniform3fv(e.tintColor, b.hex2rgb(a178.tint)), f.uniform3fv(e.color, c99.color), f.uniform1f(e.alpha, a178.worldAlpha * c99.alpha), f.bindBuffer(f.ARRAY_BUFFER, c99.buffer), f.vertexAttribPointer(e.aVertexPosition, 2, f.FLOAT, !1, 8, 0), f.bindBuffer(f.ELEMENT_ARRAY_BUFFER, c99.indexBuffer)) : (e = d.shaderManager.primitiveShader, d.shaderManager.setShader(e), f.uniformMatrix3fv(e.translationMatrix, !1, a178.worldTransform.toArray(!0)), f.uniform1f(e.flipY, d.flipY), f.uniform2f(e.projectionVector, g.x, -g.y), f.uniform2f(e.offsetVector, -h.x, -h.y), f.uniform3fv(e.tintColor, b.hex2rgb(a178.tint)), f.uniform1f(e.alpha, a178.worldAlpha), f.bindBuffer(f.ARRAY_BUFFER, c99.buffer), f.vertexAttribPointer(e.aVertexPosition, 2, f.FLOAT, !1, 24, 0), f.vertexAttribPointer(e.colorAttribute, 4, f.FLOAT, !1, 24, 8), f.bindBuffer(f.ELEMENT_ARRAY_BUFFER, c99.indexBuffer));
}, b.WebGLStencilManager.prototype.popStencil = function(a179, b67, c100) {
    var d = this.gl;
    if (this.stencilStack.pop(), this.count--, 0 === this.stencilStack.length) d.disable(d.STENCIL_TEST);
    else {
        var e = this.count;
        this.bindGraphics(a179, b67, c100), d.colorMask(!1, !1, !1, !1), 1 === b67.mode ? (this.reverse = !this.reverse, this.reverse ? (d.stencilFunc(d.EQUAL, 255 - (e + 1), 255), d.stencilOp(d.KEEP, d.KEEP, d.INCR)) : (d.stencilFunc(d.EQUAL, e + 1, 255), d.stencilOp(d.KEEP, d.KEEP, d.DECR)), d.drawElements(d.TRIANGLE_FAN, 4, d.UNSIGNED_SHORT, 2 * (b67.indices.length - 4)), d.stencilFunc(d.ALWAYS, 0, 255), d.stencilOp(d.KEEP, d.KEEP, d.INVERT), d.drawElements(d.TRIANGLE_FAN, b67.indices.length - 4, d.UNSIGNED_SHORT, 0), this.reverse ? d.stencilFunc(d.EQUAL, e, 255) : d.stencilFunc(d.EQUAL, 255 - e, 255)) : (this.reverse ? (d.stencilFunc(d.EQUAL, e + 1, 255), d.stencilOp(d.KEEP, d.KEEP, d.DECR)) : (d.stencilFunc(d.EQUAL, 255 - (e + 1), 255), d.stencilOp(d.KEEP, d.KEEP, d.INCR)), d.drawElements(d.TRIANGLE_STRIP, b67.indices.length, d.UNSIGNED_SHORT, 0), this.reverse ? d.stencilFunc(d.EQUAL, e, 255) : d.stencilFunc(d.EQUAL, 255 - e, 255)), d.colorMask(!0, !0, !0, !0), d.stencilOp(d.KEEP, d.KEEP, d.KEEP);
    }
}, b.WebGLStencilManager.prototype.destroy = function() {
    this.stencilStack = null, this.gl = null;
}, b.WebGLShaderManager = function() {
    this.maxAttibs = 10, this.attribState = [], this.tempAttribState = [];
    for(var a180 = 0; a180 < this.maxAttibs; a180++)this.attribState[a180] = !1;
    this.stack = [];
}, b.WebGLShaderManager.prototype.constructor = b.WebGLShaderManager, b.WebGLShaderManager.prototype.setContext = function(a181) {
    this.gl = a181, this.primitiveShader = new b.PrimitiveShader(a181), this.complexPrimitiveShader = new b.ComplexPrimitiveShader(a181), this.defaultShader = new b.PixiShader(a181), this.fastShader = new b.PixiFastShader(a181), this.stripShader = new b.StripShader(a181), this.setShader(this.defaultShader);
}, b.WebGLShaderManager.prototype.setAttribs = function(a182) {
    var b68;
    for(b68 = 0; b68 < this.tempAttribState.length; b68++)this.tempAttribState[b68] = !1;
    for(b68 = 0; b68 < a182.length; b68++){
        var c = a182[b68];
        this.tempAttribState[c] = !0;
    }
    var d = this.gl;
    for(b68 = 0; b68 < this.attribState.length; b68++)this.attribState[b68] !== this.tempAttribState[b68] && (this.attribState[b68] = this.tempAttribState[b68], this.tempAttribState[b68] ? d.enableVertexAttribArray(b68) : d.disableVertexAttribArray(b68));
}, b.WebGLShaderManager.prototype.setShader = function(a183) {
    return this._currentId === a183._UID ? !1 : (this._currentId = a183._UID, this.currentShader = a183, this.gl.useProgram(a183.program), this.setAttribs(a183.attributes), !0);
}, b.WebGLShaderManager.prototype.destroy = function() {
    this.attribState = null, this.tempAttribState = null, this.primitiveShader.destroy(), this.complexPrimitiveShader.destroy(), this.defaultShader.destroy(), this.fastShader.destroy(), this.stripShader.destroy(), this.gl = null;
}, b.WebGLSpriteBatch = function() {
    this.vertSize = 5, this.size = 2000;
    var a184 = 4 * this.size * 4 * this.vertSize, c101 = 6 * this.size;
    this.vertices = new b.ArrayBuffer(a184), this.positions = new b.Float32Array(this.vertices), this.colors = new b.Uint32Array(this.vertices), this.indices = new b.Uint16Array(c101), this.lastIndexCount = 0;
    for(var d = 0, e = 0; c101 > d; d += 6, e += 4)this.indices[d + 0] = e + 0, this.indices[d + 1] = e + 1, this.indices[d + 2] = e + 2, this.indices[d + 3] = e + 0, this.indices[d + 4] = e + 2, this.indices[d + 5] = e + 3;
    this.drawing = !1, this.currentBatchSize = 0, this.currentBaseTexture = null, this.dirty = !0, this.textures = [], this.blendModes = [], this.shaders = [], this.sprites = [], this.defaultShader = new b.AbstractFilter([
        "precision lowp float;",
        "varying vec2 vTextureCoord;",
        "varying vec4 vColor;",
        "uniform sampler2D uSampler;",
        "void main(void) {",
        "   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;",
        "}"
    ]);
}, b.WebGLSpriteBatch.prototype.setContext = function(a185) {
    this.gl = a185, this.vertexBuffer = a185.createBuffer(), this.indexBuffer = a185.createBuffer(), a185.bindBuffer(a185.ELEMENT_ARRAY_BUFFER, this.indexBuffer), a185.bufferData(a185.ELEMENT_ARRAY_BUFFER, this.indices, a185.STATIC_DRAW), a185.bindBuffer(a185.ARRAY_BUFFER, this.vertexBuffer), a185.bufferData(a185.ARRAY_BUFFER, this.vertices, a185.DYNAMIC_DRAW), this.currentBlendMode = 99999;
    var c102 = new b.PixiShader(a185);
    c102.fragmentSrc = this.defaultShader.fragmentSrc, c102.uniforms = {
    }, c102.init(), this.defaultShader.shaders[a185.id] = c102;
}, b.WebGLSpriteBatch.prototype.begin = function(a186) {
    this.renderSession = a186, this.shader = this.renderSession.shaderManager.defaultShader, this.start();
}, b.WebGLSpriteBatch.prototype.end = function() {
    this.flush();
}, b.WebGLSpriteBatch.prototype.render = function(a187) {
    var b69 = a187.texture;
    this.currentBatchSize >= this.size && (this.flush(), this.currentBaseTexture = b69.baseTexture);
    var c103 = b69._uvs;
    if (c103) {
        var d, e, f, g, h = a187.anchor.x, i = a187.anchor.y;
        if (b69.trim) {
            var j = b69.trim;
            e = j.x - h * j.width, d = e + b69.crop.width, g = j.y - i * j.height, f = g + b69.crop.height;
        } else d = b69.frame.width * (1 - h), e = b69.frame.width * -h, f = b69.frame.height * (1 - i), g = b69.frame.height * -i;
        var k = 4 * this.currentBatchSize * this.vertSize, l = b69.baseTexture.resolution, m = a187.worldTransform, n = m.a / l, o = m.b / l, p = m.c / l, q = m.d / l, r = m.tx, s = m.ty, t = this.colors, u = this.positions;
        this.renderSession.roundPixels ? (u[k] = n * e + p * g + r | 0, u[k + 1] = q * g + o * e + s | 0, u[k + 5] = n * d + p * g + r | 0, u[k + 6] = q * g + o * d + s | 0, u[k + 10] = n * d + p * f + r | 0, u[k + 11] = q * f + o * d + s | 0, u[k + 15] = n * e + p * f + r | 0, u[k + 16] = q * f + o * e + s | 0) : (u[k] = n * e + p * g + r, u[k + 1] = q * g + o * e + s, u[k + 5] = n * d + p * g + r, u[k + 6] = q * g + o * d + s, u[k + 10] = n * d + p * f + r, u[k + 11] = q * f + o * d + s, u[k + 15] = n * e + p * f + r, u[k + 16] = q * f + o * e + s), u[k + 2] = c103.x0, u[k + 3] = c103.y0, u[k + 7] = c103.x1, u[k + 8] = c103.y1, u[k + 12] = c103.x2, u[k + 13] = c103.y2, u[k + 17] = c103.x3, u[k + 18] = c103.y3;
        var v = a187.tint;
        t[k + 4] = t[k + 9] = t[k + 14] = t[k + 19] = (v >> 16) + (65280 & v) + ((255 & v) << 16) + (255 * a187.worldAlpha << 24), this.sprites[this.currentBatchSize++] = a187;
    }
}, b.WebGLSpriteBatch.prototype.renderTilingSprite = function(a188) {
    var c104 = a188.tilingTexture;
    this.currentBatchSize >= this.size && (this.flush(), this.currentBaseTexture = c104.baseTexture), a188._uvs || (a188._uvs = new b.TextureUvs);
    var d = a188._uvs;
    a188.tilePosition.x %= c104.baseTexture.width * a188.tileScaleOffset.x, a188.tilePosition.y %= c104.baseTexture.height * a188.tileScaleOffset.y;
    var e = a188.tilePosition.x / (c104.baseTexture.width * a188.tileScaleOffset.x), f = a188.tilePosition.y / (c104.baseTexture.height * a188.tileScaleOffset.y), g = a188.width / c104.baseTexture.width / (a188.tileScale.x * a188.tileScaleOffset.x), h = a188.height / c104.baseTexture.height / (a188.tileScale.y * a188.tileScaleOffset.y);
    d.x0 = 0 - e, d.y0 = 0 - f, d.x1 = 1 * g - e, d.y1 = 0 - f, d.x2 = 1 * g - e, d.y2 = 1 * h - f, d.x3 = 0 - e, d.y3 = 1 * h - f;
    var i = a188.tint, j = (i >> 16) + (65280 & i) + ((255 & i) << 16) + (255 * a188.alpha << 24), k = this.positions, l = this.colors, m = a188.width, n = a188.height, o = a188.anchor.x, p = a188.anchor.y, q = m * (1 - o), r = m * -o, s = n * (1 - p), t = n * -p, u = 4 * this.currentBatchSize * this.vertSize, v = c104.baseTexture.resolution, w = a188.worldTransform, x = w.a / v, y = w.b / v, z = w.c / v, A = w.d / v, B = w.tx, C = w.ty;
    k[u++] = x * r + z * t + B, k[u++] = A * t + y * r + C, k[u++] = d.x0, k[u++] = d.y0, l[u++] = j, k[u++] = x * q + z * t + B, k[u++] = A * t + y * q + C, k[u++] = d.x1, k[u++] = d.y1, l[u++] = j, k[u++] = x * q + z * s + B, k[u++] = A * s + y * q + C, k[u++] = d.x2, k[u++] = d.y2, l[u++] = j, k[u++] = x * r + z * s + B, k[u++] = A * s + y * r + C, k[u++] = d.x3, k[u++] = d.y3, l[u++] = j, this.sprites[this.currentBatchSize++] = a188;
}, b.WebGLSpriteBatch.prototype.flush = function() {
    if (0 !== this.currentBatchSize) {
        var a189, c105 = this.gl;
        if (this.dirty) {
            this.dirty = !1, c105.activeTexture(c105.TEXTURE0), c105.bindBuffer(c105.ARRAY_BUFFER, this.vertexBuffer), c105.bindBuffer(c105.ELEMENT_ARRAY_BUFFER, this.indexBuffer), a189 = this.defaultShader.shaders[c105.id];
            var d = 4 * this.vertSize;
            c105.vertexAttribPointer(a189.aVertexPosition, 2, c105.FLOAT, !1, d, 0), c105.vertexAttribPointer(a189.aTextureCoord, 2, c105.FLOAT, !1, d, 8), c105.vertexAttribPointer(a189.colorAttribute, 4, c105.UNSIGNED_BYTE, !0, d, 16);
        }
        if (this.currentBatchSize > 0.5 * this.size) c105.bufferSubData(c105.ARRAY_BUFFER, 0, this.vertices);
        else {
            var e = this.positions.subarray(0, 4 * this.currentBatchSize * this.vertSize);
            c105.bufferSubData(c105.ARRAY_BUFFER, 0, e);
        }
        for(var f, g, h, i, j = 0, k = 0, l = null, m = this.renderSession.blendModeManager.currentBlendMode, n = null, o = !1, p = !1, q = 0, r = this.currentBatchSize; r > q; q++){
            if (i = this.sprites[q], f = i.texture.baseTexture, g = i.blendMode, h = i.shader || this.defaultShader, o = m !== g, p = n !== h, (l !== f || o || p) && (this.renderBatch(l, j, k), k = q, j = 0, l = f, o && (m = g, this.renderSession.blendModeManager.setBlendMode(m)), p)) {
                n = h, a189 = n.shaders[c105.id], a189 || (a189 = new b.PixiShader(c105), a189.fragmentSrc = n.fragmentSrc, a189.uniforms = n.uniforms, a189.init(), n.shaders[c105.id] = a189), this.renderSession.shaderManager.setShader(a189), a189.dirty && a189.syncUniforms();
                var s = this.renderSession.projection;
                c105.uniform2f(a189.projectionVector, s.x, s.y);
                var t = this.renderSession.offset;
                c105.uniform2f(a189.offsetVector, t.x, t.y);
            }
            j++;
        }
        this.renderBatch(l, j, k), this.currentBatchSize = 0;
    }
}, b.WebGLSpriteBatch.prototype.renderBatch = function(a190, b70, c106) {
    if (0 !== b70) {
        var d = this.gl;
        a190._dirty[d.id] ? this.renderSession.renderer.updateTexture(a190) : d.bindTexture(d.TEXTURE_2D, a190._glTextures[d.id]), d.drawElements(d.TRIANGLES, 6 * b70, d.UNSIGNED_SHORT, 6 * c106 * 2), this.renderSession.drawCount++;
    }
}, b.WebGLSpriteBatch.prototype.stop = function() {
    this.flush(), this.dirty = !0;
}, b.WebGLSpriteBatch.prototype.start = function() {
    this.dirty = !0;
}, b.WebGLSpriteBatch.prototype.destroy = function() {
    this.vertices = null, this.indices = null, this.gl.deleteBuffer(this.vertexBuffer), this.gl.deleteBuffer(this.indexBuffer), this.currentBaseTexture = null, this.gl = null;
}, b.WebGLFastSpriteBatch = function(a191) {
    this.vertSize = 10, this.maxSize = 6000, this.size = this.maxSize;
    var c107 = 4 * this.size * this.vertSize, d = 6 * this.maxSize;
    this.vertices = new b.Float32Array(c107), this.indices = new b.Uint16Array(d), this.vertexBuffer = null, this.indexBuffer = null, this.lastIndexCount = 0;
    for(var e = 0, f = 0; d > e; e += 6, f += 4)this.indices[e + 0] = f + 0, this.indices[e + 1] = f + 1, this.indices[e + 2] = f + 2, this.indices[e + 3] = f + 0, this.indices[e + 4] = f + 2, this.indices[e + 5] = f + 3;
    this.drawing = !1, this.currentBatchSize = 0, this.currentBaseTexture = null, this.currentBlendMode = 0, this.renderSession = null, this.shader = null, this.matrix = null, this.setContext(a191);
}, b.WebGLFastSpriteBatch.prototype.constructor = b.WebGLFastSpriteBatch, b.WebGLFastSpriteBatch.prototype.setContext = function(a192) {
    this.gl = a192, this.vertexBuffer = a192.createBuffer(), this.indexBuffer = a192.createBuffer(), a192.bindBuffer(a192.ELEMENT_ARRAY_BUFFER, this.indexBuffer), a192.bufferData(a192.ELEMENT_ARRAY_BUFFER, this.indices, a192.STATIC_DRAW), a192.bindBuffer(a192.ARRAY_BUFFER, this.vertexBuffer), a192.bufferData(a192.ARRAY_BUFFER, this.vertices, a192.DYNAMIC_DRAW);
}, b.WebGLFastSpriteBatch.prototype.begin = function(a193, b71) {
    this.renderSession = b71, this.shader = this.renderSession.shaderManager.fastShader, this.matrix = a193.worldTransform.toArray(!0), this.start();
}, b.WebGLFastSpriteBatch.prototype.end = function() {
    this.flush();
}, b.WebGLFastSpriteBatch.prototype.render = function(a194) {
    var b72 = a194.children, c108 = b72[0];
    if (c108.texture._uvs) {
        this.currentBaseTexture = c108.texture.baseTexture, c108.blendMode !== this.renderSession.blendModeManager.currentBlendMode && (this.flush(), this.renderSession.blendModeManager.setBlendMode(c108.blendMode));
        for(var d = 0, e = b72.length; e > d; d++)this.renderSprite(b72[d]);
        this.flush();
    }
}, b.WebGLFastSpriteBatch.prototype.renderSprite = function(a195) {
    if (a195.visible && (a195.texture.baseTexture === this.currentBaseTexture || (this.flush(), this.currentBaseTexture = a195.texture.baseTexture, a195.texture._uvs))) {
        var b73, c109, d, e, f, g, h, i, j = this.vertices;
        if (b73 = a195.texture._uvs, c109 = a195.texture.frame.width, d = a195.texture.frame.height, a195.texture.trim) {
            var k = a195.texture.trim;
            f = k.x - a195.anchor.x * k.width, e = f + a195.texture.crop.width, h = k.y - a195.anchor.y * k.height, g = h + a195.texture.crop.height;
        } else e = a195.texture.frame.width * (1 - a195.anchor.x), f = a195.texture.frame.width * -a195.anchor.x, g = a195.texture.frame.height * (1 - a195.anchor.y), h = a195.texture.frame.height * -a195.anchor.y;
        i = 4 * this.currentBatchSize * this.vertSize, j[i++] = f, j[i++] = h, j[i++] = a195.position.x, j[i++] = a195.position.y, j[i++] = a195.scale.x, j[i++] = a195.scale.y, j[i++] = a195.rotation, j[i++] = b73.x0, j[i++] = b73.y1, j[i++] = a195.alpha, j[i++] = e, j[i++] = h, j[i++] = a195.position.x, j[i++] = a195.position.y, j[i++] = a195.scale.x, j[i++] = a195.scale.y, j[i++] = a195.rotation, j[i++] = b73.x1, j[i++] = b73.y1, j[i++] = a195.alpha, j[i++] = e, j[i++] = g, j[i++] = a195.position.x, j[i++] = a195.position.y, j[i++] = a195.scale.x, j[i++] = a195.scale.y, j[i++] = a195.rotation, j[i++] = b73.x2, j[i++] = b73.y2, j[i++] = a195.alpha, j[i++] = f, j[i++] = g, j[i++] = a195.position.x, j[i++] = a195.position.y, j[i++] = a195.scale.x, j[i++] = a195.scale.y, j[i++] = a195.rotation, j[i++] = b73.x3, j[i++] = b73.y3, j[i++] = a195.alpha, this.currentBatchSize++, this.currentBatchSize >= this.size && this.flush();
    }
}, b.WebGLFastSpriteBatch.prototype.flush = function() {
    if (0 !== this.currentBatchSize) {
        var a196 = this.gl;
        if (this.currentBaseTexture._glTextures[a196.id] || this.renderSession.renderer.updateTexture(this.currentBaseTexture, a196), a196.bindTexture(a196.TEXTURE_2D, this.currentBaseTexture._glTextures[a196.id]), this.currentBatchSize > 0.5 * this.size) a196.bufferSubData(a196.ARRAY_BUFFER, 0, this.vertices);
        else {
            var b74 = this.vertices.subarray(0, 4 * this.currentBatchSize * this.vertSize);
            a196.bufferSubData(a196.ARRAY_BUFFER, 0, b74);
        }
        a196.drawElements(a196.TRIANGLES, 6 * this.currentBatchSize, a196.UNSIGNED_SHORT, 0), this.currentBatchSize = 0, this.renderSession.drawCount++;
    }
}, b.WebGLFastSpriteBatch.prototype.stop = function() {
    this.flush();
}, b.WebGLFastSpriteBatch.prototype.start = function() {
    var a197 = this.gl;
    a197.activeTexture(a197.TEXTURE0), a197.bindBuffer(a197.ARRAY_BUFFER, this.vertexBuffer), a197.bindBuffer(a197.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    var b75 = this.renderSession.projection;
    a197.uniform2f(this.shader.projectionVector, b75.x, b75.y), a197.uniformMatrix3fv(this.shader.uMatrix, !1, this.matrix);
    var c110 = 4 * this.vertSize;
    a197.vertexAttribPointer(this.shader.aVertexPosition, 2, a197.FLOAT, !1, c110, 0), a197.vertexAttribPointer(this.shader.aPositionCoord, 2, a197.FLOAT, !1, c110, 8), a197.vertexAttribPointer(this.shader.aScale, 2, a197.FLOAT, !1, c110, 16), a197.vertexAttribPointer(this.shader.aRotation, 1, a197.FLOAT, !1, c110, 24), a197.vertexAttribPointer(this.shader.aTextureCoord, 2, a197.FLOAT, !1, c110, 28), a197.vertexAttribPointer(this.shader.colorAttribute, 1, a197.FLOAT, !1, c110, 36);
}, b.WebGLFilterManager = function() {
    this.filterStack = [], this.offsetX = 0, this.offsetY = 0;
}, b.WebGLFilterManager.prototype.constructor = b.WebGLFilterManager, b.WebGLFilterManager.prototype.setContext = function(a198) {
    this.gl = a198, this.texturePool = [], this.initShaderBuffers();
}, b.WebGLFilterManager.prototype.begin = function(a199, b76) {
    this.renderSession = a199, this.defaultShader = a199.shaderManager.defaultShader;
    var c111 = this.renderSession.projection;
    this.width = 2 * c111.x, this.height = 2 * -c111.y, this.buffer = b76;
}, b.WebGLFilterManager.prototype.pushFilter = function(a200) {
    var c112 = this.gl, d = this.renderSession.projection, e = this.renderSession.offset;
    a200._filterArea = a200.target.filterArea || a200.target.getBounds(), this.filterStack.push(a200);
    var f = a200.filterPasses[0];
    this.offsetX += a200._filterArea.x, this.offsetY += a200._filterArea.y;
    var g = this.texturePool.pop();
    g ? g.resize(this.width, this.height) : g = new b.FilterTexture(this.gl, this.width, this.height), c112.bindTexture(c112.TEXTURE_2D, g.texture);
    var h = a200._filterArea, i = f.padding;
    h.x -= i, h.y -= i, h.width += 2 * i, h.height += 2 * i, h.x < 0 && (h.x = 0), h.width > this.width && (h.width = this.width), h.y < 0 && (h.y = 0), h.height > this.height && (h.height = this.height), c112.bindFramebuffer(c112.FRAMEBUFFER, g.frameBuffer), c112.viewport(0, 0, h.width, h.height), d.x = h.width / 2, d.y = -h.height / 2, e.x = -h.x, e.y = -h.y, c112.colorMask(!0, !0, !0, !0), c112.clearColor(0, 0, 0, 0), c112.clear(c112.COLOR_BUFFER_BIT), a200._glFilterTexture = g;
}, b.WebGLFilterManager.prototype.popFilter = function() {
    var a201 = this.gl, c113 = this.filterStack.pop(), d = c113._filterArea, e = c113._glFilterTexture, f = this.renderSession.projection, g = this.renderSession.offset;
    if (c113.filterPasses.length > 1) {
        a201.viewport(0, 0, d.width, d.height), a201.bindBuffer(a201.ARRAY_BUFFER, this.vertexBuffer), this.vertexArray[0] = 0, this.vertexArray[1] = d.height, this.vertexArray[2] = d.width, this.vertexArray[3] = d.height, this.vertexArray[4] = 0, this.vertexArray[5] = 0, this.vertexArray[6] = d.width, this.vertexArray[7] = 0, a201.bufferSubData(a201.ARRAY_BUFFER, 0, this.vertexArray), a201.bindBuffer(a201.ARRAY_BUFFER, this.uvBuffer), this.uvArray[2] = d.width / this.width, this.uvArray[5] = d.height / this.height, this.uvArray[6] = d.width / this.width, this.uvArray[7] = d.height / this.height, a201.bufferSubData(a201.ARRAY_BUFFER, 0, this.uvArray);
        var h = e, i = this.texturePool.pop();
        i || (i = new b.FilterTexture(this.gl, this.width, this.height)), i.resize(this.width, this.height), a201.bindFramebuffer(a201.FRAMEBUFFER, i.frameBuffer), a201.clear(a201.COLOR_BUFFER_BIT), a201.disable(a201.BLEND);
        for(var j = 0; j < c113.filterPasses.length - 1; j++){
            var k = c113.filterPasses[j];
            a201.bindFramebuffer(a201.FRAMEBUFFER, i.frameBuffer), a201.activeTexture(a201.TEXTURE0), a201.bindTexture(a201.TEXTURE_2D, h.texture), this.applyFilterPass(k, d, d.width, d.height);
            var l = h;
            h = i, i = l;
        }
        a201.enable(a201.BLEND), e = h, this.texturePool.push(i);
    }
    var m = c113.filterPasses[c113.filterPasses.length - 1];
    this.offsetX -= d.x, this.offsetY -= d.y;
    var n = this.width, o = this.height, p = 0, q = 0, r = this.buffer;
    if (0 === this.filterStack.length) a201.colorMask(!0, !0, !0, !0);
    else {
        var s = this.filterStack[this.filterStack.length - 1];
        d = s._filterArea, n = d.width, o = d.height, p = d.x, q = d.y, r = s._glFilterTexture.frameBuffer;
    }
    f.x = n / 2, f.y = -o / 2, g.x = p, g.y = q, d = c113._filterArea;
    var t = d.x - p, u = d.y - q;
    a201.bindBuffer(a201.ARRAY_BUFFER, this.vertexBuffer), this.vertexArray[0] = t, this.vertexArray[1] = u + d.height, this.vertexArray[2] = t + d.width, this.vertexArray[3] = u + d.height, this.vertexArray[4] = t, this.vertexArray[5] = u, this.vertexArray[6] = t + d.width, this.vertexArray[7] = u, a201.bufferSubData(a201.ARRAY_BUFFER, 0, this.vertexArray), a201.bindBuffer(a201.ARRAY_BUFFER, this.uvBuffer), this.uvArray[2] = d.width / this.width, this.uvArray[5] = d.height / this.height, this.uvArray[6] = d.width / this.width, this.uvArray[7] = d.height / this.height, a201.bufferSubData(a201.ARRAY_BUFFER, 0, this.uvArray), a201.viewport(0, 0, n * this.renderSession.resolution, o * this.renderSession.resolution), a201.bindFramebuffer(a201.FRAMEBUFFER, r), a201.activeTexture(a201.TEXTURE0), a201.bindTexture(a201.TEXTURE_2D, e.texture), this.applyFilterPass(m, d, n, o), this.texturePool.push(e), c113._glFilterTexture = null;
}, b.WebGLFilterManager.prototype.applyFilterPass = function(a202, c, d, e) {
    var f = this.gl, g = a202.shaders[f.id];
    g || (g = new b.PixiShader(f), g.fragmentSrc = a202.fragmentSrc, g.uniforms = a202.uniforms, g.init(), a202.shaders[f.id] = g), this.renderSession.shaderManager.setShader(g), f.uniform2f(g.projectionVector, d / 2, -e / 2), f.uniform2f(g.offsetVector, 0, 0), a202.uniforms.dimensions && (a202.uniforms.dimensions.value[0] = this.width, a202.uniforms.dimensions.value[1] = this.height, a202.uniforms.dimensions.value[2] = this.vertexArray[0], a202.uniforms.dimensions.value[3] = this.vertexArray[5]), g.syncUniforms(), f.bindBuffer(f.ARRAY_BUFFER, this.vertexBuffer), f.vertexAttribPointer(g.aVertexPosition, 2, f.FLOAT, !1, 0, 0), f.bindBuffer(f.ARRAY_BUFFER, this.uvBuffer), f.vertexAttribPointer(g.aTextureCoord, 2, f.FLOAT, !1, 0, 0), f.bindBuffer(f.ARRAY_BUFFER, this.colorBuffer), f.vertexAttribPointer(g.colorAttribute, 2, f.FLOAT, !1, 0, 0), f.bindBuffer(f.ELEMENT_ARRAY_BUFFER, this.indexBuffer), f.drawElements(f.TRIANGLES, 6, f.UNSIGNED_SHORT, 0), this.renderSession.drawCount++;
}, b.WebGLFilterManager.prototype.initShaderBuffers = function() {
    var a203 = this.gl;
    this.vertexBuffer = a203.createBuffer(), this.uvBuffer = a203.createBuffer(), this.colorBuffer = a203.createBuffer(), this.indexBuffer = a203.createBuffer(), this.vertexArray = new b.Float32Array([
        0,
        0,
        1,
        0,
        0,
        1,
        1,
        1
    ]), a203.bindBuffer(a203.ARRAY_BUFFER, this.vertexBuffer), a203.bufferData(a203.ARRAY_BUFFER, this.vertexArray, a203.STATIC_DRAW), this.uvArray = new b.Float32Array([
        0,
        0,
        1,
        0,
        0,
        1,
        1,
        1
    ]), a203.bindBuffer(a203.ARRAY_BUFFER, this.uvBuffer), a203.bufferData(a203.ARRAY_BUFFER, this.uvArray, a203.STATIC_DRAW), this.colorArray = new b.Float32Array([
        1,
        16777215,
        1,
        16777215,
        1,
        16777215,
        1,
        16777215
    ]), a203.bindBuffer(a203.ARRAY_BUFFER, this.colorBuffer), a203.bufferData(a203.ARRAY_BUFFER, this.colorArray, a203.STATIC_DRAW), a203.bindBuffer(a203.ELEMENT_ARRAY_BUFFER, this.indexBuffer), a203.bufferData(a203.ELEMENT_ARRAY_BUFFER, new Uint16Array([
        0,
        1,
        2,
        1,
        3,
        2
    ]), a203.STATIC_DRAW);
}, b.WebGLFilterManager.prototype.destroy = function() {
    var a204 = this.gl;
    this.filterStack = null, this.offsetX = 0, this.offsetY = 0;
    for(var b77 = 0; b77 < this.texturePool.length; b77++)this.texturePool[b77].destroy();
    this.texturePool = null, a204.deleteBuffer(this.vertexBuffer), a204.deleteBuffer(this.uvBuffer), a204.deleteBuffer(this.colorBuffer), a204.deleteBuffer(this.indexBuffer);
}, b.FilterTexture = function(a205, c114, d, e) {
    this.gl = a205, this.frameBuffer = a205.createFramebuffer(), this.texture = a205.createTexture(), e = e || b.scaleModes.DEFAULT, a205.bindTexture(a205.TEXTURE_2D, this.texture), a205.texParameteri(a205.TEXTURE_2D, a205.TEXTURE_MAG_FILTER, e === b.scaleModes.LINEAR ? a205.LINEAR : a205.NEAREST), a205.texParameteri(a205.TEXTURE_2D, a205.TEXTURE_MIN_FILTER, e === b.scaleModes.LINEAR ? a205.LINEAR : a205.NEAREST), a205.texParameteri(a205.TEXTURE_2D, a205.TEXTURE_WRAP_S, a205.CLAMP_TO_EDGE), a205.texParameteri(a205.TEXTURE_2D, a205.TEXTURE_WRAP_T, a205.CLAMP_TO_EDGE), a205.bindFramebuffer(a205.FRAMEBUFFER, this.frameBuffer), a205.bindFramebuffer(a205.FRAMEBUFFER, this.frameBuffer), a205.framebufferTexture2D(a205.FRAMEBUFFER, a205.COLOR_ATTACHMENT0, a205.TEXTURE_2D, this.texture, 0), this.renderBuffer = a205.createRenderbuffer(), a205.bindRenderbuffer(a205.RENDERBUFFER, this.renderBuffer), a205.framebufferRenderbuffer(a205.FRAMEBUFFER, a205.DEPTH_STENCIL_ATTACHMENT, a205.RENDERBUFFER, this.renderBuffer), this.resize(c114, d);
}, b.FilterTexture.prototype.constructor = b.FilterTexture, b.FilterTexture.prototype.clear = function() {
    var a206 = this.gl;
    a206.clearColor(0, 0, 0, 0), a206.clear(a206.COLOR_BUFFER_BIT);
}, b.FilterTexture.prototype.resize = function(a207, b78) {
    if (this.width !== a207 || this.height !== b78) {
        this.width = a207, this.height = b78;
        var c115 = this.gl;
        c115.bindTexture(c115.TEXTURE_2D, this.texture), c115.texImage2D(c115.TEXTURE_2D, 0, c115.RGBA, a207, b78, 0, c115.RGBA, c115.UNSIGNED_BYTE, null), c115.bindRenderbuffer(c115.RENDERBUFFER, this.renderBuffer), c115.renderbufferStorage(c115.RENDERBUFFER, c115.DEPTH_STENCIL, a207, b78);
    }
}, b.FilterTexture.prototype.destroy = function() {
    var a208 = this.gl;
    a208.deleteFramebuffer(this.frameBuffer), a208.deleteTexture(this.texture), this.frameBuffer = null, this.texture = null;
}, b.CanvasBuffer = function(a209, b79) {
    this.width = a209, this.height = b79, this.canvas = document.createElement("canvas"), this.context = this.canvas.getContext("2d"), this.canvas.width = a209, this.canvas.height = b79;
}, b.CanvasBuffer.prototype.constructor = b.CanvasBuffer, b.CanvasBuffer.prototype.clear = function() {
    this.context.setTransform(1, 0, 0, 1, 0, 0), this.context.clearRect(0, 0, this.width, this.height);
}, b.CanvasBuffer.prototype.resize = function(a210, b80) {
    this.width = this.canvas.width = a210, this.height = this.canvas.height = b80;
}, b.CanvasMaskManager = function() {
}, b.CanvasMaskManager.prototype.constructor = b.CanvasMaskManager, b.CanvasMaskManager.prototype.pushMask = function(a211, c116) {
    var d = c116.context;
    d.save();
    var e = a211.alpha, f = a211.worldTransform, g = c116.resolution;
    d.setTransform(f.a * g, f.b * g, f.c * g, f.d * g, f.tx * g, f.ty * g), b.CanvasGraphics.renderGraphicsMask(a211, d), d.clip(), a211.worldAlpha = e;
}, b.CanvasMaskManager.prototype.popMask = function(a212) {
    a212.context.restore();
}, b.CanvasTinter = function() {
}, b.CanvasTinter.getTintedTexture = function(a213, c117) {
    var d = a213.texture;
    c117 = b.CanvasTinter.roundColor(c117);
    var e = "#" + ("00000" + (0 | c117).toString(16)).substr(-6);
    if (d.tintCache = d.tintCache || {
    }, d.tintCache[e]) return d.tintCache[e];
    var f = b.CanvasTinter.canvas || document.createElement("canvas");
    if (b.CanvasTinter.tintMethod(d, c117, f), b.CanvasTinter.convertTintToImage) {
        var g = new Image;
        g.src = f.toDataURL(), d.tintCache[e] = g;
    } else d.tintCache[e] = f, b.CanvasTinter.canvas = null;
    return f;
}, b.CanvasTinter.tintWithMultiply = function(a214, b81, c118) {
    var d = c118.getContext("2d"), e = a214.crop;
    c118.width = e.width, c118.height = e.height, d.fillStyle = "#" + ("00000" + (0 | b81).toString(16)).substr(-6), d.fillRect(0, 0, e.width, e.height), d.globalCompositeOperation = "multiply", d.drawImage(a214.baseTexture.source, e.x, e.y, e.width, e.height, 0, 0, e.width, e.height), d.globalCompositeOperation = "destination-atop", d.drawImage(a214.baseTexture.source, e.x, e.y, e.width, e.height, 0, 0, e.width, e.height);
}, b.CanvasTinter.tintWithOverlay = function(a215, b82, c119) {
    var d = c119.getContext("2d"), e = a215.crop;
    c119.width = e.width, c119.height = e.height, d.globalCompositeOperation = "copy", d.fillStyle = "#" + ("00000" + (0 | b82).toString(16)).substr(-6), d.fillRect(0, 0, e.width, e.height), d.globalCompositeOperation = "destination-atop", d.drawImage(a215.baseTexture.source, e.x, e.y, e.width, e.height, 0, 0, e.width, e.height);
}, b.CanvasTinter.tintWithPerPixel = function(a216, c120, d) {
    var e = d.getContext("2d"), f = a216.crop;
    d.width = f.width, d.height = f.height, e.globalCompositeOperation = "copy", e.drawImage(a216.baseTexture.source, f.x, f.y, f.width, f.height, 0, 0, f.width, f.height);
    for(var g = b.hex2rgb(c120), h = g[0], i = g[1], j = g[2], k = e.getImageData(0, 0, f.width, f.height), l = k.data, m = 0; m < l.length; m += 4)l[m + 0] *= h, l[m + 1] *= i, l[m + 2] *= j;
    e.putImageData(k, 0, 0);
}, b.CanvasTinter.roundColor = function(a217) {
    var c121 = b.CanvasTinter.cacheStepsPerColorChannel, d = b.hex2rgb(a217);
    return d[0] = Math.min(255, d[0] / c121 * c121), d[1] = Math.min(255, d[1] / c121 * c121), d[2] = Math.min(255, d[2] / c121 * c121), b.rgb2hex(d);
}, b.CanvasTinter.cacheStepsPerColorChannel = 8, b.CanvasTinter.convertTintToImage = !1, b.CanvasTinter.canUseMultiply = b.canUseNewCanvasBlendModes(), b.CanvasTinter.tintMethod = b.CanvasTinter.canUseMultiply ? b.CanvasTinter.tintWithMultiply : b.CanvasTinter.tintWithPerPixel, b.CanvasRenderer = function(a218, c122, d) {
    if (d) for(var e in b.defaultRenderOptions)"undefined" == typeof d[e] && (d[e] = b.defaultRenderOptions[e]);
    else d = b.defaultRenderOptions;
    b.defaultRenderer || (b.sayHello("Canvas"), b.defaultRenderer = this), this.type = b.CANVAS_RENDERER, this.resolution = d.resolution, this.clearBeforeRender = d.clearBeforeRender, this.transparent = d.transparent, this.autoResize = d.autoResize || !1, this.width = a218 || 800, this.height = c122 || 600, this.width *= this.resolution, this.height *= this.resolution, this.view = d.view || document.createElement("canvas"), this.context = this.view.getContext("2d", {
        alpha: this.transparent
    }), this.refresh = !0, this.view.width = this.width * this.resolution, this.view.height = this.height * this.resolution, this.count = 0, this.maskManager = new b.CanvasMaskManager, this.renderSession = {
        context: this.context,
        maskManager: this.maskManager,
        scaleMode: null,
        smoothProperty: null,
        roundPixels: !1
    }, this.mapBlendModes(), this.resize(a218, c122), "imageSmoothingEnabled" in this.context ? this.renderSession.smoothProperty = "imageSmoothingEnabled" : "webkitImageSmoothingEnabled" in this.context ? this.renderSession.smoothProperty = "webkitImageSmoothingEnabled" : "mozImageSmoothingEnabled" in this.context ? this.renderSession.smoothProperty = "mozImageSmoothingEnabled" : "oImageSmoothingEnabled" in this.context ? this.renderSession.smoothProperty = "oImageSmoothingEnabled" : "msImageSmoothingEnabled" in this.context && (this.renderSession.smoothProperty = "msImageSmoothingEnabled");
}, b.CanvasRenderer.prototype.constructor = b.CanvasRenderer, b.CanvasRenderer.prototype.render = function(a219) {
    a219.updateTransform(), this.context.setTransform(1, 0, 0, 1, 0, 0), this.context.globalAlpha = 1, this.renderSession.currentBlendMode = b.blendModes.NORMAL, this.context.globalCompositeOperation = b.blendModesCanvas[b.blendModes.NORMAL], navigator.isCocoonJS && this.view.screencanvas && (this.context.fillStyle = "black", this.context.clear()), this.clearBeforeRender && (this.transparent ? this.context.clearRect(0, 0, this.width, this.height) : (this.context.fillStyle = a219.backgroundColorString, this.context.fillRect(0, 0, this.width, this.height))), this.renderDisplayObject(a219), a219.interactive && (a219._interactiveEventsAdded || (a219._interactiveEventsAdded = !0, a219.interactionManager.setTarget(this)));
}, b.CanvasRenderer.prototype.destroy = function(a220) {
    "undefined" == typeof a220 && (a220 = !0), a220 && this.view.parent && this.view.parent.removeChild(this.view), this.view = null, this.context = null, this.maskManager = null, this.renderSession = null;
}, b.CanvasRenderer.prototype.resize = function(a221, b83) {
    this.width = a221 * this.resolution, this.height = b83 * this.resolution, this.view.width = this.width, this.view.height = this.height, this.autoResize && (this.view.style.width = this.width / this.resolution + "px", this.view.style.height = this.height / this.resolution + "px");
}, b.CanvasRenderer.prototype.renderDisplayObject = function(a222, b84) {
    this.renderSession.context = b84 || this.context, this.renderSession.resolution = this.resolution, a222._renderCanvas(this.renderSession);
}, b.CanvasRenderer.prototype.mapBlendModes = function() {
    b.blendModesCanvas || (b.blendModesCanvas = [], b.canUseNewCanvasBlendModes() ? (b.blendModesCanvas[b.blendModes.NORMAL] = "source-over", b.blendModesCanvas[b.blendModes.ADD] = "lighter", b.blendModesCanvas[b.blendModes.MULTIPLY] = "multiply", b.blendModesCanvas[b.blendModes.SCREEN] = "screen", b.blendModesCanvas[b.blendModes.OVERLAY] = "overlay", b.blendModesCanvas[b.blendModes.DARKEN] = "darken", b.blendModesCanvas[b.blendModes.LIGHTEN] = "lighten", b.blendModesCanvas[b.blendModes.COLOR_DODGE] = "color-dodge", b.blendModesCanvas[b.blendModes.COLOR_BURN] = "color-burn", b.blendModesCanvas[b.blendModes.HARD_LIGHT] = "hard-light", b.blendModesCanvas[b.blendModes.SOFT_LIGHT] = "soft-light", b.blendModesCanvas[b.blendModes.DIFFERENCE] = "difference", b.blendModesCanvas[b.blendModes.EXCLUSION] = "exclusion", b.blendModesCanvas[b.blendModes.HUE] = "hue", b.blendModesCanvas[b.blendModes.SATURATION] = "saturation", b.blendModesCanvas[b.blendModes.COLOR] = "color", b.blendModesCanvas[b.blendModes.LUMINOSITY] = "luminosity") : (b.blendModesCanvas[b.blendModes.NORMAL] = "source-over", b.blendModesCanvas[b.blendModes.ADD] = "lighter", b.blendModesCanvas[b.blendModes.MULTIPLY] = "source-over", b.blendModesCanvas[b.blendModes.SCREEN] = "source-over", b.blendModesCanvas[b.blendModes.OVERLAY] = "source-over", b.blendModesCanvas[b.blendModes.DARKEN] = "source-over", b.blendModesCanvas[b.blendModes.LIGHTEN] = "source-over", b.blendModesCanvas[b.blendModes.COLOR_DODGE] = "source-over", b.blendModesCanvas[b.blendModes.COLOR_BURN] = "source-over", b.blendModesCanvas[b.blendModes.HARD_LIGHT] = "source-over", b.blendModesCanvas[b.blendModes.SOFT_LIGHT] = "source-over", b.blendModesCanvas[b.blendModes.DIFFERENCE] = "source-over", b.blendModesCanvas[b.blendModes.EXCLUSION] = "source-over", b.blendModesCanvas[b.blendModes.HUE] = "source-over", b.blendModesCanvas[b.blendModes.SATURATION] = "source-over", b.blendModesCanvas[b.blendModes.COLOR] = "source-over", b.blendModesCanvas[b.blendModes.LUMINOSITY] = "source-over"));
}, b.CanvasGraphics = function() {
}, b.CanvasGraphics.renderGraphics = function(a223, c123) {
    var d = a223.worldAlpha;
    a223.dirty && (this.updateGraphicsTint(a223), a223.dirty = !1);
    for(var e = 0; e < a223.graphicsData.length; e++){
        var f = a223.graphicsData[e], g = f.shape, h = f._fillTint, i = f._lineTint;
        if (c123.lineWidth = f.lineWidth, f.type === b.Graphics.POLY) {
            c123.beginPath();
            var j = g.points;
            c123.moveTo(j[0], j[1]);
            for(var k = 1; k < j.length / 2; k++)c123.lineTo(j[2 * k], j[2 * k + 1]);
            g.closed && c123.lineTo(j[0], j[1]), j[0] === j[j.length - 2] && j[1] === j[j.length - 1] && c123.closePath(), f.fill && (c123.globalAlpha = f.fillAlpha * d, c123.fillStyle = "#" + ("00000" + (0 | h).toString(16)).substr(-6), c123.fill()), f.lineWidth && (c123.globalAlpha = f.lineAlpha * d, c123.strokeStyle = "#" + ("00000" + (0 | i).toString(16)).substr(-6), c123.stroke());
        } else if (f.type === b.Graphics.RECT) (f.fillColor || 0 === f.fillColor) && (c123.globalAlpha = f.fillAlpha * d, c123.fillStyle = "#" + ("00000" + (0 | h).toString(16)).substr(-6), c123.fillRect(g.x, g.y, g.width, g.height)), f.lineWidth && (c123.globalAlpha = f.lineAlpha * d, c123.strokeStyle = "#" + ("00000" + (0 | i).toString(16)).substr(-6), c123.strokeRect(g.x, g.y, g.width, g.height));
        else if (f.type === b.Graphics.CIRC) c123.beginPath(), c123.arc(g.x, g.y, g.radius, 0, 2 * Math.PI), c123.closePath(), f.fill && (c123.globalAlpha = f.fillAlpha * d, c123.fillStyle = "#" + ("00000" + (0 | h).toString(16)).substr(-6), c123.fill()), f.lineWidth && (c123.globalAlpha = f.lineAlpha * d, c123.strokeStyle = "#" + ("00000" + (0 | i).toString(16)).substr(-6), c123.stroke());
        else if (f.type === b.Graphics.ELIP) {
            var l = 2 * g.width, m = 2 * g.height, n = g.x - l / 2, o = g.y - m / 2;
            c123.beginPath();
            var p = 0.5522848, q = l / 2 * p, r = m / 2 * p, s = n + l, t = o + m, u = n + l / 2, v = o + m / 2;
            c123.moveTo(n, v), c123.bezierCurveTo(n, v - r, u - q, o, u, o), c123.bezierCurveTo(u + q, o, s, v - r, s, v), c123.bezierCurveTo(s, v + r, u + q, t, u, t), c123.bezierCurveTo(u - q, t, n, v + r, n, v), c123.closePath(), f.fill && (c123.globalAlpha = f.fillAlpha * d, c123.fillStyle = "#" + ("00000" + (0 | h).toString(16)).substr(-6), c123.fill()), f.lineWidth && (c123.globalAlpha = f.lineAlpha * d, c123.strokeStyle = "#" + ("00000" + (0 | i).toString(16)).substr(-6), c123.stroke());
        } else if (f.type === b.Graphics.RREC) {
            var w = g.x, x = g.y, y = g.width, z = g.height, A = g.radius, B = Math.min(y, z) / 2 | 0;
            A = A > B ? B : A, c123.beginPath(), c123.moveTo(w, x + A), c123.lineTo(w, x + z - A), c123.quadraticCurveTo(w, x + z, w + A, x + z), c123.lineTo(w + y - A, x + z), c123.quadraticCurveTo(w + y, x + z, w + y, x + z - A), c123.lineTo(w + y, x + A), c123.quadraticCurveTo(w + y, x, w + y - A, x), c123.lineTo(w + A, x), c123.quadraticCurveTo(w, x, w, x + A), c123.closePath(), (f.fillColor || 0 === f.fillColor) && (c123.globalAlpha = f.fillAlpha * d, c123.fillStyle = "#" + ("00000" + (0 | h).toString(16)).substr(-6), c123.fill()), f.lineWidth && (c123.globalAlpha = f.lineAlpha * d, c123.strokeStyle = "#" + ("00000" + (0 | i).toString(16)).substr(-6), c123.stroke());
        }
    }
}, b.CanvasGraphics.renderGraphicsMask = function(a224, c124) {
    var d = a224.graphicsData.length;
    if (0 !== d) {
        d > 1 && (d = 1, window.console.log("Pixi.js warning: masks in canvas can only mask using the first path in the graphics object"));
        for(var e = 0; 1 > e; e++){
            var f = a224.graphicsData[e], g = f.shape;
            if (f.type === b.Graphics.POLY) {
                c124.beginPath();
                var h = g.points;
                c124.moveTo(h[0], h[1]);
                for(var i = 1; i < h.length / 2; i++)c124.lineTo(h[2 * i], h[2 * i + 1]);
                h[0] === h[h.length - 2] && h[1] === h[h.length - 1] && c124.closePath();
            } else if (f.type === b.Graphics.RECT) c124.beginPath(), c124.rect(g.x, g.y, g.width, g.height), c124.closePath();
            else if (f.type === b.Graphics.CIRC) c124.beginPath(), c124.arc(g.x, g.y, g.radius, 0, 2 * Math.PI), c124.closePath();
            else if (f.type === b.Graphics.ELIP) {
                var j = 2 * g.width, k = 2 * g.height, l = g.x - j / 2, m = g.y - k / 2;
                c124.beginPath();
                var n = 0.5522848, o = j / 2 * n, p = k / 2 * n, q = l + j, r = m + k, s = l + j / 2, t = m + k / 2;
                c124.moveTo(l, t), c124.bezierCurveTo(l, t - p, s - o, m, s, m), c124.bezierCurveTo(s + o, m, q, t - p, q, t), c124.bezierCurveTo(q, t + p, s + o, r, s, r), c124.bezierCurveTo(s - o, r, l, t + p, l, t), c124.closePath();
            } else if (f.type === b.Graphics.RREC) {
                var u = g.points, v = u[0], w = u[1], x = u[2], y = u[3], z = u[4], A = Math.min(x, y) / 2 | 0;
                z = z > A ? A : z, c124.beginPath(), c124.moveTo(v, w + z), c124.lineTo(v, w + y - z), c124.quadraticCurveTo(v, w + y, v + z, w + y), c124.lineTo(v + x - z, w + y), c124.quadraticCurveTo(v + x, w + y, v + x, w + y - z), c124.lineTo(v + x, w + z), c124.quadraticCurveTo(v + x, w, v + x - z, w), c124.lineTo(v + z, w), c124.quadraticCurveTo(v, w, v, w + z), c124.closePath();
            }
        }
    }
}, b.CanvasGraphics.updateGraphicsTint = function(a225) {
    if (16777215 !== a225.tint) for(var b85 = (a225.tint >> 16 & 255) / 255, c125 = (a225.tint >> 8 & 255) / 255, d = (255 & a225.tint) / 255, e = 0; e < a225.graphicsData.length; e++){
        var f = a225.graphicsData[e], g = 0 | f.fillColor, h = 0 | f.lineColor;
        f._fillTint = ((g >> 16 & 255) / 255 * b85 * 255 << 16) + ((g >> 8 & 255) / 255 * c125 * 255 << 8) + (255 & g) / 255 * d * 255, f._lineTint = ((h >> 16 & 255) / 255 * b85 * 255 << 16) + ((h >> 8 & 255) / 255 * c125 * 255 << 8) + (255 & h) / 255 * d * 255;
    }
}, b.Graphics = function() {
    b.DisplayObjectContainer.call(this), this.renderable = !0, this.fillAlpha = 1, this.lineWidth = 0, this.lineColor = 0, this.graphicsData = [], this.tint = 16777215, this.blendMode = b.blendModes.NORMAL, this.currentPath = null, this._webGL = [], this.isMask = !1, this.boundsPadding = 0, this._localBounds = new b.Rectangle(0, 0, 1, 1), this.dirty = !0, this.webGLDirty = !1, this.cachedSpriteDirty = !1;
}, b.Graphics.prototype = Object.create(b.DisplayObjectContainer.prototype), b.Graphics.prototype.constructor = b.Graphics, Object.defineProperty(b.Graphics.prototype, "cacheAsBitmap", {
    get: function() {
        return this._cacheAsBitmap;
    },
    set: function(a226) {
        this._cacheAsBitmap = a226, this._cacheAsBitmap ? this._generateCachedSprite() : (this.destroyCachedSprite(), this.dirty = !0);
    }
}), b.Graphics.prototype.lineStyle = function(a227, c126, d) {
    if (this.lineWidth = a227 || 0, this.lineColor = c126 || 0, this.lineAlpha = arguments.length < 3 ? 1 : d, this.currentPath) {
        if (this.currentPath.shape.points.length) return this.drawShape(new b.Polygon(this.currentPath.shape.points.slice(-2))), this;
        this.currentPath.lineWidth = this.lineWidth, this.currentPath.lineColor = this.lineColor, this.currentPath.lineAlpha = this.lineAlpha;
    }
    return this;
}, b.Graphics.prototype.moveTo = function(a228, c127) {
    return this.drawShape(new b.Polygon([
        a228,
        c127
    ])), this;
}, b.Graphics.prototype.lineTo = function(a229, b86) {
    return this.currentPath.shape.points.push(a229, b86), this.dirty = !0, this;
}, b.Graphics.prototype.quadraticCurveTo = function(a230, b87, c128, d) {
    this.currentPath ? 0 === this.currentPath.shape.points.length && (this.currentPath.shape.points = [
        0,
        0
    ]) : this.moveTo(0, 0);
    var e, f, g = 20, h = this.currentPath.shape.points;
    0 === h.length && this.moveTo(0, 0);
    for(var i = h[h.length - 2], j = h[h.length - 1], k = 0, l = 1; g >= l; l++)k = l / g, e = i + (a230 - i) * k, f = j + (b87 - j) * k, h.push(e + (a230 + (c128 - a230) * k - e) * k, f + (b87 + (d - b87) * k - f) * k);
    return this.dirty = !0, this;
}, b.Graphics.prototype.bezierCurveTo = function(a231, b88, c129, d, e, f) {
    this.currentPath ? 0 === this.currentPath.shape.points.length && (this.currentPath.shape.points = [
        0,
        0
    ]) : this.moveTo(0, 0);
    for(var g, h, i, j, k, l = 20, m = this.currentPath.shape.points, n = m[m.length - 2], o = m[m.length - 1], p = 0, q = 1; l >= q; q++)p = q / l, g = 1 - p, h = g * g, i = h * g, j = p * p, k = j * p, m.push(i * n + 3 * h * p * a231 + 3 * g * j * c129 + k * e, i * o + 3 * h * p * b88 + 3 * g * j * d + k * f);
    return this.dirty = !0, this;
}, b.Graphics.prototype.arcTo = function(a232, b89, c130, d, e) {
    this.currentPath ? 0 === this.currentPath.shape.points.length && this.currentPath.shape.points.push(a232, b89) : this.moveTo(a232, b89);
    var f = this.currentPath.shape.points, g = f[f.length - 2], h = f[f.length - 1], i = h - b89, j = g - a232, k = d - b89, l = c130 - a232, m = Math.abs(i * l - j * k);
    if (0.00000001 > m || 0 === e) (f[f.length - 2] !== a232 || f[f.length - 1] !== b89) && f.push(a232, b89);
    else {
        var n = i * i + j * j, o = k * k + l * l, p = i * k + j * l, q = e * Math.sqrt(n) / m, r = e * Math.sqrt(o) / m, s = q * p / n, t = r * p / o, u = q * l + r * j, v = q * k + r * i, w = j * (r + s), x = i * (r + s), y = l * (q + t), z = k * (q + t), A = Math.atan2(x - v, w - u), B = Math.atan2(z - v, y - u);
        this.arc(u + a232, v + b89, e, A, B, j * k > l * i);
    }
    return this.dirty = !0, this;
}, b.Graphics.prototype.arc = function(a233, b90, c131, d, e, f) {
    var g, h = a233 + Math.cos(d) * c131, i = b90 + Math.sin(d) * c131;
    if (this.currentPath ? (g = this.currentPath.shape.points, 0 === g.length ? g.push(h, i) : (g[g.length - 2] !== h || g[g.length - 1] !== i) && g.push(h, i)) : (this.moveTo(h, i), g = this.currentPath.shape.points), d === e) return this;
    !f && d >= e ? e += 2 * Math.PI : f && e >= d && (d += 2 * Math.PI);
    var j = f ? -1 * (d - e) : e - d, k = Math.abs(j) / (2 * Math.PI) * 40;
    if (0 === j) return this;
    for(var l = j / (2 * k), m = 2 * l, n = Math.cos(l), o = Math.sin(l), p = k - 1, q = p % 1 / p, r = 0; p >= r; r++){
        var s = r + q * r, t = l + d + m * s, u = Math.cos(t), v = -Math.sin(t);
        g.push((n * u + o * v) * c131 + a233, (n * -v + o * u) * c131 + b90);
    }
    return this.dirty = !0, this;
}, b.Graphics.prototype.beginFill = function(a234, b91) {
    return this.filling = !0, this.fillColor = a234 || 0, this.fillAlpha = void 0 === b91 ? 1 : b91, this.currentPath && this.currentPath.shape.points.length <= 2 && (this.currentPath.fill = this.filling, this.currentPath.fillColor = this.fillColor, this.currentPath.fillAlpha = this.fillAlpha), this;
}, b.Graphics.prototype.endFill = function() {
    return this.filling = !1, this.fillColor = null, this.fillAlpha = 1, this;
}, b.Graphics.prototype.drawRect = function(a235, c132, d, e) {
    return this.drawShape(new b.Rectangle(a235, c132, d, e)), this;
}, b.Graphics.prototype.drawRoundedRect = function(a236, c133, d, e, f) {
    return this.drawShape(new b.RoundedRectangle(a236, c133, d, e, f)), this;
}, b.Graphics.prototype.drawCircle = function(a237, c134, d) {
    return this.drawShape(new b.Circle(a237, c134, d)), this;
}, b.Graphics.prototype.drawEllipse = function(a238, c135, d, e) {
    return this.drawShape(new b.Ellipse(a238, c135, d, e)), this;
}, b.Graphics.prototype.drawPolygon = function(a239) {
    return a239 instanceof Array || (a239 = Array.prototype.slice.call(arguments)), this.drawShape(new b.Polygon(a239)), this;
}, b.Graphics.prototype.clear = function() {
    return this.lineWidth = 0, this.filling = !1, this.dirty = !0, this.clearDirty = !0, this.graphicsData = [], this;
}, b.Graphics.prototype.generateTexture = function(a240, c136) {
    a240 = a240 || 1;
    var d = this.getBounds(), e = new b.CanvasBuffer(d.width * a240, d.height * a240), f = b.Texture.fromCanvas(e.canvas, c136);
    return f.baseTexture.resolution = a240, e.context.scale(a240, a240), e.context.translate(-d.x, -d.y), b.CanvasGraphics.renderGraphics(this, e.context), f;
}, b.Graphics.prototype._renderWebGL = function(a241) {
    if (this.visible !== !1 && 0 !== this.alpha && this.isMask !== !0) {
        if (this._cacheAsBitmap) return (this.dirty || this.cachedSpriteDirty) && (this._generateCachedSprite(), this.updateCachedSpriteTexture(), this.cachedSpriteDirty = !1, this.dirty = !1), this._cachedSprite.worldAlpha = this.worldAlpha, void b.Sprite.prototype._renderWebGL.call(this._cachedSprite, a241);
        if (a241.spriteBatch.stop(), a241.blendModeManager.setBlendMode(this.blendMode), this._mask && a241.maskManager.pushMask(this._mask, a241), this._filters && a241.filterManager.pushFilter(this._filterBlock), this.blendMode !== a241.spriteBatch.currentBlendMode) {
            a241.spriteBatch.currentBlendMode = this.blendMode;
            var c137 = b.blendModesWebGL[a241.spriteBatch.currentBlendMode];
            a241.spriteBatch.gl.blendFunc(c137[0], c137[1]);
        }
        if (this.webGLDirty && (this.dirty = !0, this.webGLDirty = !1), b.WebGLGraphics.renderGraphics(this, a241), this.children.length) {
            a241.spriteBatch.start();
            for(var d = 0, e = this.children.length; e > d; d++)this.children[d]._renderWebGL(a241);
            a241.spriteBatch.stop();
        }
        this._filters && a241.filterManager.popFilter(), this._mask && a241.maskManager.popMask(this.mask, a241), a241.drawCount++, a241.spriteBatch.start();
    }
}, b.Graphics.prototype._renderCanvas = function(a242) {
    if (this.visible !== !1 && 0 !== this.alpha && this.isMask !== !0) {
        if (this._cacheAsBitmap) return (this.dirty || this.cachedSpriteDirty) && (this._generateCachedSprite(), this.updateCachedSpriteTexture(), this.cachedSpriteDirty = !1, this.dirty = !1), this._cachedSprite.alpha = this.alpha, void b.Sprite.prototype._renderCanvas.call(this._cachedSprite, a242);
        var c138 = a242.context, d = this.worldTransform;
        this.blendMode !== a242.currentBlendMode && (a242.currentBlendMode = this.blendMode, c138.globalCompositeOperation = b.blendModesCanvas[a242.currentBlendMode]), this._mask && a242.maskManager.pushMask(this._mask, a242);
        var e = a242.resolution;
        c138.setTransform(d.a * e, d.b * e, d.c * e, d.d * e, d.tx * e, d.ty * e), b.CanvasGraphics.renderGraphics(this, c138);
        for(var f = 0, g = this.children.length; g > f; f++)this.children[f]._renderCanvas(a242);
        this._mask && a242.maskManager.popMask(a242);
    }
}, b.Graphics.prototype.getBounds = function(a243) {
    if (this.isMask) return b.EmptyRectangle;
    this.dirty && (this.updateLocalBounds(), this.webGLDirty = !0, this.cachedSpriteDirty = !0, this.dirty = !1);
    var c139 = this._localBounds, d = c139.x, e = c139.width + c139.x, f = c139.y, g = c139.height + c139.y, h = a243 || this.worldTransform, i = h.a, j = h.b, k = h.c, l = h.d, m = h.tx, n = h.ty, o = i * e + k * g + m, p = l * g + j * e + n, q = i * d + k * g + m, r = l * g + j * d + n, s = i * d + k * f + m, t = l * f + j * d + n, u = i * e + k * f + m, v = l * f + j * e + n, w = o, x = p, y = o, z = p;
    return y = y > q ? q : y, y = y > s ? s : y, y = y > u ? u : y, z = z > r ? r : z, z = z > t ? t : z, z = z > v ? v : z, w = q > w ? q : w, w = s > w ? s : w, w = u > w ? u : w, x = r > x ? r : x, x = t > x ? t : x, x = v > x ? v : x, this._bounds.x = y, this._bounds.width = w - y, this._bounds.y = z, this._bounds.height = x - z, this._bounds;
}, b.Graphics.prototype.updateLocalBounds = function() {
    var a244 = 1 / 0, c140 = -1 / 0, d = 1 / 0, e = -1 / 0;
    if (this.graphicsData.length) for(var f, g, h, i, j, k, l = 0; l < this.graphicsData.length; l++){
        var m = this.graphicsData[l], n = m.type, o = m.lineWidth;
        if (f = m.shape, n === b.Graphics.RECT || n === b.Graphics.RREC) h = f.x - o / 2, i = f.y - o / 2, j = f.width + o, k = f.height + o, a244 = a244 > h ? h : a244, c140 = h + j > c140 ? h + j : c140, d = d > i ? i : d, e = i + k > e ? i + k : e;
        else if (n === b.Graphics.CIRC) h = f.x, i = f.y, j = f.radius + o / 2, k = f.radius + o / 2, a244 = a244 > h - j ? h - j : a244, c140 = h + j > c140 ? h + j : c140, d = d > i - k ? i - k : d, e = i + k > e ? i + k : e;
        else if (n === b.Graphics.ELIP) h = f.x, i = f.y, j = f.width + o / 2, k = f.height + o / 2, a244 = a244 > h - j ? h - j : a244, c140 = h + j > c140 ? h + j : c140, d = d > i - k ? i - k : d, e = i + k > e ? i + k : e;
        else {
            g = f.points;
            for(var p = 0; p < g.length; p += 2)h = g[p], i = g[p + 1], a244 = a244 > h - o ? h - o : a244, c140 = h + o > c140 ? h + o : c140, d = d > i - o ? i - o : d, e = i + o > e ? i + o : e;
        }
    }
    else a244 = 0, c140 = 0, d = 0, e = 0;
    var q = this.boundsPadding;
    this._localBounds.x = a244 - q, this._localBounds.width = c140 - a244 + 2 * q, this._localBounds.y = d - q, this._localBounds.height = e - d + 2 * q;
}, b.Graphics.prototype._generateCachedSprite = function() {
    var a245 = this.getLocalBounds();
    if (this._cachedSprite) this._cachedSprite.buffer.resize(a245.width, a245.height);
    else {
        var c141 = new b.CanvasBuffer(a245.width, a245.height), d = b.Texture.fromCanvas(c141.canvas);
        this._cachedSprite = new b.Sprite(d), this._cachedSprite.buffer = c141, this._cachedSprite.worldTransform = this.worldTransform;
    }
    this._cachedSprite.anchor.x = -(a245.x / a245.width), this._cachedSprite.anchor.y = -(a245.y / a245.height), this._cachedSprite.buffer.context.translate(-a245.x, -a245.y), this.worldAlpha = 1, b.CanvasGraphics.renderGraphics(this, this._cachedSprite.buffer.context), this._cachedSprite.alpha = this.alpha;
}, b.Graphics.prototype.updateCachedSpriteTexture = function() {
    var a246 = this._cachedSprite, b92 = a246.texture, c142 = a246.buffer.canvas;
    b92.baseTexture.width = c142.width, b92.baseTexture.height = c142.height, b92.crop.width = b92.frame.width = c142.width, b92.crop.height = b92.frame.height = c142.height, a246._width = c142.width, a246._height = c142.height, b92.baseTexture.dirty();
}, b.Graphics.prototype.destroyCachedSprite = function() {
    this._cachedSprite.texture.destroy(!0), this._cachedSprite = null;
}, b.Graphics.prototype.drawShape = function(a247) {
    this.currentPath && this.currentPath.shape.points.length <= 2 && this.graphicsData.pop(), this.currentPath = null;
    var c143 = new b.GraphicsData(this.lineWidth, this.lineColor, this.lineAlpha, this.fillColor, this.fillAlpha, this.filling, a247);
    return this.graphicsData.push(c143), c143.type === b.Graphics.POLY && (c143.shape.closed = this.filling, this.currentPath = c143), this.dirty = !0, c143;
}, b.GraphicsData = function(a248, b93, c144, d, e, f, g) {
    this.lineWidth = a248, this.lineColor = b93, this.lineAlpha = c144, this._lineTint = b93, this.fillColor = d, this.fillAlpha = e, this._fillTint = d, this.fill = f, this.shape = g, this.type = g.type;
}, b.Graphics.POLY = 0, b.Graphics.RECT = 1, b.Graphics.CIRC = 2, b.Graphics.ELIP = 3, b.Graphics.RREC = 4, b.Polygon.prototype.type = b.Graphics.POLY, b.Rectangle.prototype.type = b.Graphics.RECT, b.Circle.prototype.type = b.Graphics.CIRC, b.Ellipse.prototype.type = b.Graphics.ELIP, b.RoundedRectangle.prototype.type = b.Graphics.RREC, b.Strip = function(a249) {
    b.DisplayObjectContainer.call(this), this.texture = a249, this.uvs = new b.Float32Array([
        0,
        1,
        1,
        1,
        1,
        0,
        0,
        1
    ]), this.vertices = new b.Float32Array([
        0,
        0,
        100,
        0,
        100,
        100,
        0,
        100
    ]), this.colors = new b.Float32Array([
        1,
        1,
        1,
        1
    ]), this.indices = new b.Uint16Array([
        0,
        1,
        2,
        3
    ]), this.dirty = !0, this.blendMode = b.blendModes.NORMAL, this.canvasPadding = 0, this.drawMode = b.Strip.DrawModes.TRIANGLE_STRIP;
}, b.Strip.prototype = Object.create(b.DisplayObjectContainer.prototype), b.Strip.prototype.constructor = b.Strip, b.Strip.prototype._renderWebGL = function(a250) {
    !this.visible || this.alpha <= 0 || (a250.spriteBatch.stop(), this._vertexBuffer || this._initWebGL(a250), a250.shaderManager.setShader(a250.shaderManager.stripShader), this._renderStrip(a250), a250.spriteBatch.start());
}, b.Strip.prototype._initWebGL = function(a251) {
    var b94 = a251.gl;
    this._vertexBuffer = b94.createBuffer(), this._indexBuffer = b94.createBuffer(), this._uvBuffer = b94.createBuffer(), this._colorBuffer = b94.createBuffer(), b94.bindBuffer(b94.ARRAY_BUFFER, this._vertexBuffer), b94.bufferData(b94.ARRAY_BUFFER, this.vertices, b94.DYNAMIC_DRAW), b94.bindBuffer(b94.ARRAY_BUFFER, this._uvBuffer), b94.bufferData(b94.ARRAY_BUFFER, this.uvs, b94.STATIC_DRAW), b94.bindBuffer(b94.ARRAY_BUFFER, this._colorBuffer), b94.bufferData(b94.ARRAY_BUFFER, this.colors, b94.STATIC_DRAW), b94.bindBuffer(b94.ELEMENT_ARRAY_BUFFER, this._indexBuffer), b94.bufferData(b94.ELEMENT_ARRAY_BUFFER, this.indices, b94.STATIC_DRAW);
}, b.Strip.prototype._renderStrip = function(a252) {
    var c145 = a252.gl, d = a252.projection, e = a252.offset, f = a252.shaderManager.stripShader, g = this.drawMode === b.Strip.DrawModes.TRIANGLE_STRIP ? c145.TRIANGLE_STRIP : c145.TRIANGLES;
    a252.blendModeManager.setBlendMode(this.blendMode), c145.uniformMatrix3fv(f.translationMatrix, !1, this.worldTransform.toArray(!0)), c145.uniform2f(f.projectionVector, d.x, -d.y), c145.uniform2f(f.offsetVector, -e.x, -e.y), c145.uniform1f(f.alpha, this.worldAlpha), this.dirty ? (this.dirty = !1, c145.bindBuffer(c145.ARRAY_BUFFER, this._vertexBuffer), c145.bufferData(c145.ARRAY_BUFFER, this.vertices, c145.STATIC_DRAW), c145.vertexAttribPointer(f.aVertexPosition, 2, c145.FLOAT, !1, 0, 0), c145.bindBuffer(c145.ARRAY_BUFFER, this._uvBuffer), c145.bufferData(c145.ARRAY_BUFFER, this.uvs, c145.STATIC_DRAW), c145.vertexAttribPointer(f.aTextureCoord, 2, c145.FLOAT, !1, 0, 0), c145.activeTexture(c145.TEXTURE0), this.texture.baseTexture._dirty[c145.id] ? a252.renderer.updateTexture(this.texture.baseTexture) : c145.bindTexture(c145.TEXTURE_2D, this.texture.baseTexture._glTextures[c145.id]), c145.bindBuffer(c145.ELEMENT_ARRAY_BUFFER, this._indexBuffer), c145.bufferData(c145.ELEMENT_ARRAY_BUFFER, this.indices, c145.STATIC_DRAW)) : (c145.bindBuffer(c145.ARRAY_BUFFER, this._vertexBuffer), c145.bufferSubData(c145.ARRAY_BUFFER, 0, this.vertices), c145.vertexAttribPointer(f.aVertexPosition, 2, c145.FLOAT, !1, 0, 0), c145.bindBuffer(c145.ARRAY_BUFFER, this._uvBuffer), c145.vertexAttribPointer(f.aTextureCoord, 2, c145.FLOAT, !1, 0, 0), c145.activeTexture(c145.TEXTURE0), this.texture.baseTexture._dirty[c145.id] ? a252.renderer.updateTexture(this.texture.baseTexture) : c145.bindTexture(c145.TEXTURE_2D, this.texture.baseTexture._glTextures[c145.id]), c145.bindBuffer(c145.ELEMENT_ARRAY_BUFFER, this._indexBuffer)), c145.drawElements(g, this.indices.length, c145.UNSIGNED_SHORT, 0);
}, b.Strip.prototype._renderCanvas = function(a253) {
    var c146 = a253.context, d = this.worldTransform;
    a253.roundPixels ? c146.setTransform(d.a, d.b, d.c, d.d, 0 | d.tx, 0 | d.ty) : c146.setTransform(d.a, d.b, d.c, d.d, d.tx, d.ty), this.drawMode === b.Strip.DrawModes.TRIANGLE_STRIP ? this._renderCanvasTriangleStrip(c146) : this._renderCanvasTriangles(c146);
}, b.Strip.prototype._renderCanvasTriangleStrip = function(a254) {
    var b95 = this.vertices, c147 = this.uvs, d = b95.length / 2;
    this.count++;
    for(var e = 0; d - 2 > e; e++){
        var f = 2 * e;
        this._renderCanvasDrawTriangle(a254, b95, c147, f, f + 2, f + 4);
    }
}, b.Strip.prototype._renderCanvasTriangles = function(a255) {
    var b96 = this.vertices, c148 = this.uvs, d = this.indices, e = d.length;
    this.count++;
    for(var f = 0; e > f; f += 3){
        var g = 2 * d[f], h = 2 * d[f + 1], i = 2 * d[f + 2];
        this._renderCanvasDrawTriangle(a255, b96, c148, g, h, i);
    }
}, b.Strip.prototype._renderCanvasDrawTriangle = function(a256, b97, c149, d, e, f) {
    var g = this.texture.baseTexture.source, h = this.texture.width, i = this.texture.height, j = b97[d], k = b97[e], l = b97[f], m = b97[d + 1], n = b97[e + 1], o = b97[f + 1], p = c149[d] * h, q = c149[e] * h, r = c149[f] * h, s = c149[d + 1] * i, t = c149[e + 1] * i, u = c149[f + 1] * i;
    if (this.canvasPadding > 0) {
        var v = this.canvasPadding / this.worldTransform.a, w = this.canvasPadding / this.worldTransform.d, x = (j + k + l) / 3, y = (m + n + o) / 3, z = j - x, A = m - y, B = Math.sqrt(z * z + A * A);
        j = x + z / B * (B + v), m = y + A / B * (B + w), z = k - x, A = n - y, B = Math.sqrt(z * z + A * A), k = x + z / B * (B + v), n = y + A / B * (B + w), z = l - x, A = o - y, B = Math.sqrt(z * z + A * A), l = x + z / B * (B + v), o = y + A / B * (B + w);
    }
    a256.save(), a256.beginPath(), a256.moveTo(j, m), a256.lineTo(k, n), a256.lineTo(l, o), a256.closePath(), a256.clip();
    var C = p * t + s * r + q * u - t * r - s * q - p * u, D = j * t + s * l + k * u - t * l - s * k - j * u, E = p * k + j * r + q * l - k * r - j * q - p * l, F = p * t * l + s * k * r + j * q * u - j * t * r - s * q * l - p * k * u, G = m * t + s * o + n * u - t * o - s * n - m * u, H = p * n + m * r + q * o - n * r - m * q - p * o, I = p * t * o + s * n * r + m * q * u - m * t * r - s * q * o - p * n * u;
    a256.transform(D / C, G / C, E / C, H / C, F / C, I / C), a256.drawImage(g, 0, 0), a256.restore();
}, b.Strip.prototype.renderStripFlat = function(a257) {
    var b98 = this.context, c150 = a257.vertices, d = c150.length / 2;
    this.count++, b98.beginPath();
    for(var e = 1; d - 2 > e; e++){
        var f = 2 * e, g = c150[f], h = c150[f + 2], i = c150[f + 4], j = c150[f + 1], k = c150[f + 3], l = c150[f + 5];
        b98.moveTo(g, j), b98.lineTo(h, k), b98.lineTo(i, l);
    }
    b98.fillStyle = "#FF0000", b98.fill(), b98.closePath();
}, b.Strip.prototype.onTextureUpdate = function() {
    this.updateFrame = !0;
}, b.Strip.prototype.getBounds = function(a258) {
    for(var c151 = a258 || this.worldTransform, d = c151.a, e = c151.b, f = c151.c, g = c151.d, h = c151.tx, i = c151.ty, j = -1 / 0, k = -1 / 0, l = 1 / 0, m = 1 / 0, n = this.vertices, o = 0, p = n.length; p > o; o += 2){
        var q = n[o], r = n[o + 1], s = d * q + f * r + h, t = g * r + e * q + i;
        l = l > s ? s : l, m = m > t ? t : m, j = s > j ? s : j, k = t > k ? t : k;
    }
    if (l === -1 / 0 || k === 1 / 0) return b.EmptyRectangle;
    var u = this._bounds;
    return u.x = l, u.width = j - l, u.y = m, u.height = k - m, this._currentBounds = u, u;
}, b.Strip.DrawModes = {
    TRIANGLE_STRIP: 0,
    TRIANGLES: 1
}, b.Rope = function(a259, c152) {
    b.Strip.call(this, a259), this.points = c152, this.vertices = new b.Float32Array(4 * c152.length), this.uvs = new b.Float32Array(4 * c152.length), this.colors = new b.Float32Array(2 * c152.length), this.indices = new b.Uint16Array(2 * c152.length), this.refresh();
}, b.Rope.prototype = Object.create(b.Strip.prototype), b.Rope.prototype.constructor = b.Rope, b.Rope.prototype.refresh = function() {
    var a260 = this.points;
    if (!(a260.length < 1)) {
        var b99 = this.uvs, c153 = a260[0], d = this.indices, e = this.colors;
        this.count -= 0.2, b99[0] = 0, b99[1] = 0, b99[2] = 0, b99[3] = 1, e[0] = 1, e[1] = 1, d[0] = 0, d[1] = 1;
        for(var f, g, h, i = a260.length, j = 1; i > j; j++)f = a260[j], g = 4 * j, h = j / (i - 1), j % 2 ? (b99[g] = h, b99[g + 1] = 0, b99[g + 2] = h, b99[g + 3] = 1) : (b99[g] = h, b99[g + 1] = 0, b99[g + 2] = h, b99[g + 3] = 1), g = 2 * j, e[g] = 1, e[g + 1] = 1, g = 2 * j, d[g] = g, d[g + 1] = g + 1, c153 = f;
    }
}, b.Rope.prototype.updateTransform = function() {
    var a261 = this.points;
    if (!(a261.length < 1)) {
        var c154, d = a261[0], e = {
            x: 0,
            y: 0
        };
        this.count -= 0.2;
        for(var f, g, h, i, j, k = this.vertices, l = a261.length, m = 0; l > m; m++)f = a261[m], g = 4 * m, c154 = m < a261.length - 1 ? a261[m + 1] : f, e.y = -(c154.x - d.x), e.x = c154.y - d.y, h = 10 * (1 - m / (l - 1)), h > 1 && (h = 1), i = Math.sqrt(e.x * e.x + e.y * e.y), j = this.texture.height / 2, e.x /= i, e.y /= i, e.x *= j, e.y *= j, k[g] = f.x + e.x, k[g + 1] = f.y + e.y, k[g + 2] = f.x - e.x, k[g + 3] = f.y - e.y, d = f;
        b.DisplayObjectContainer.prototype.updateTransform.call(this);
    }
}, b.Rope.prototype.setTexture = function(a262) {
    this.texture = a262;
}, b.TilingSprite = function(a263, c155, d) {
    b.Sprite.call(this, a263), this._width = c155 || 100, this._height = d || 100, this.tileScale = new b.Point(1, 1), this.tileScaleOffset = new b.Point(1, 1), this.tilePosition = new b.Point(0, 0), this.renderable = !0, this.tint = 16777215, this.blendMode = b.blendModes.NORMAL;
}, b.TilingSprite.prototype = Object.create(b.Sprite.prototype), b.TilingSprite.prototype.constructor = b.TilingSprite, Object.defineProperty(b.TilingSprite.prototype, "width", {
    get: function() {
        return this._width;
    },
    set: function(a264) {
        this._width = a264;
    }
}), Object.defineProperty(b.TilingSprite.prototype, "height", {
    get: function() {
        return this._height;
    },
    set: function(a265) {
        this._height = a265;
    }
}), b.TilingSprite.prototype.setTexture = function(a266) {
    this.texture !== a266 && (this.texture = a266, this.refreshTexture = !0, this.cachedTint = 16777215);
}, b.TilingSprite.prototype._renderWebGL = function(a267) {
    if (this.visible !== !1 && 0 !== this.alpha) {
        var b100, c156;
        for(this._mask && (a267.spriteBatch.stop(), a267.maskManager.pushMask(this.mask, a267), a267.spriteBatch.start()), this._filters && (a267.spriteBatch.flush(), a267.filterManager.pushFilter(this._filterBlock)), !this.tilingTexture || this.refreshTexture ? (this.generateTilingTexture(!0), this.tilingTexture && this.tilingTexture.needsUpdate && (a267.renderer.updateTexture(this.tilingTexture.baseTexture), this.tilingTexture.needsUpdate = !1)) : a267.spriteBatch.renderTilingSprite(this), b100 = 0, c156 = this.children.length; c156 > b100; b100++)this.children[b100]._renderWebGL(a267);
        a267.spriteBatch.stop(), this._filters && a267.filterManager.popFilter(), this._mask && a267.maskManager.popMask(this._mask, a267), a267.spriteBatch.start();
    }
}, b.TilingSprite.prototype._renderCanvas = function(a268) {
    if (this.visible !== !1 && 0 !== this.alpha) {
        var c157 = a268.context;
        this._mask && a268.maskManager.pushMask(this._mask, a268), c157.globalAlpha = this.worldAlpha;
        var d, e, f = this.worldTransform, g = a268.resolution;
        if (c157.setTransform(f.a * g, f.b * g, f.c * g, f.d * g, f.tx * g, f.ty * g), !this.__tilePattern || this.refreshTexture) {
            if (this.generateTilingTexture(!1), !this.tilingTexture) return;
            this.__tilePattern = c157.createPattern(this.tilingTexture.baseTexture.source, "repeat");
        }
        this.blendMode !== a268.currentBlendMode && (a268.currentBlendMode = this.blendMode, c157.globalCompositeOperation = b.blendModesCanvas[a268.currentBlendMode]);
        var h = this.tilePosition, i = this.tileScale;
        for(h.x %= this.tilingTexture.baseTexture.width, h.y %= this.tilingTexture.baseTexture.height, c157.scale(i.x, i.y), c157.translate(h.x + this.anchor.x * -this._width, h.y + this.anchor.y * -this._height), c157.fillStyle = this.__tilePattern, c157.fillRect(-h.x, -h.y, this._width / i.x, this._height / i.y), c157.scale(1 / i.x, 1 / i.y), c157.translate(-h.x + this.anchor.x * this._width, -h.y + this.anchor.y * this._height), this._mask && a268.maskManager.popMask(a268), d = 0, e = this.children.length; e > d; d++)this.children[d]._renderCanvas(a268);
    }
}, b.TilingSprite.prototype.getBounds = function() {
    var a269 = this._width, b101 = this._height, c158 = a269 * (1 - this.anchor.x), d = a269 * -this.anchor.x, e = b101 * (1 - this.anchor.y), f = b101 * -this.anchor.y, g = this.worldTransform, h = g.a, i = g.b, j = g.c, k = g.d, l = g.tx, m = g.ty, n = h * d + j * f + l, o = k * f + i * d + m, p = h * c158 + j * f + l, q = k * f + i * c158 + m, r = h * c158 + j * e + l, s = k * e + i * c158 + m, t = h * d + j * e + l, u = k * e + i * d + m, v = -1 / 0, w = -1 / 0, x = 1 / 0, y = 1 / 0;
    x = x > n ? n : x, x = x > p ? p : x, x = x > r ? r : x, x = x > t ? t : x, y = y > o ? o : y, y = y > q ? q : y, y = y > s ? s : y, y = y > u ? u : y, v = n > v ? n : v, v = p > v ? p : v, v = r > v ? r : v, v = t > v ? t : v, w = o > w ? o : w, w = q > w ? q : w, w = s > w ? s : w, w = u > w ? u : w;
    var z = this._bounds;
    return z.x = x, z.width = v - x, z.y = y, z.height = w - y, this._currentBounds = z, z;
}, b.TilingSprite.prototype.onTextureUpdate = function() {
}, b.TilingSprite.prototype.generateTilingTexture = function(a270) {
    if (this.texture.baseTexture.hasLoaded) {
        var c159, d, e = this.originalTexture || this.texture, f = e.frame, g = f.width !== e.baseTexture.width || f.height !== e.baseTexture.height, h = !1;
        if (a270 ? (c159 = b.getNextPowerOfTwo(f.width), d = b.getNextPowerOfTwo(f.height), (f.width !== c159 || f.height !== d || e.baseTexture.width !== c159 || e.baseTexture.height || d) && (h = !0)) : g && (e.trim ? (c159 = e.trim.width, d = e.trim.height) : (c159 = f.width, d = f.height), h = !0), h) {
            var i;
            this.tilingTexture && this.tilingTexture.isTiling ? (i = this.tilingTexture.canvasBuffer, i.resize(c159, d), this.tilingTexture.baseTexture.width = c159, this.tilingTexture.baseTexture.height = d, this.tilingTexture.needsUpdate = !0) : (i = new b.CanvasBuffer(c159, d), this.tilingTexture = b.Texture.fromCanvas(i.canvas), this.tilingTexture.canvasBuffer = i, this.tilingTexture.isTiling = !0), i.context.drawImage(e.baseTexture.source, e.crop.x, e.crop.y, e.crop.width, e.crop.height, 0, 0, c159, d), this.tileScaleOffset.x = f.width / c159, this.tileScaleOffset.y = f.height / d;
        } else this.tilingTexture && this.tilingTexture.isTiling && this.tilingTexture.destroy(!0), this.tileScaleOffset.x = 1, this.tileScaleOffset.y = 1, this.tilingTexture = e;
        this.refreshTexture = !1, this.originalTexture = this.texture, this.texture = this.tilingTexture, this.tilingTexture.baseTexture._powerOf2 = !0;
    }
}, b.TilingSprite.prototype.destroy = function() {
    b.Sprite.prototype.destroy.call(this), this.tileScale = null, this.tileScaleOffset = null, this.tilePosition = null, this.tilingTexture && (this.tilingTexture.destroy(!0), this.tilingTexture = null);
};
var c = {
    radDeg: 180 / Math.PI,
    degRad: Math.PI / 180,
    temp: [],
    Float32Array: "undefined" == typeof Float32Array ? Array : Float32Array,
    Uint16Array: "undefined" == typeof Uint16Array ? Array : Uint16Array
};
c.BoneData = function(a271, b102) {
    this.name = a271, this.parent = b102;
}, c.BoneData.prototype = {
    length: 0,
    x: 0,
    y: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    inheritScale: !0,
    inheritRotation: !0,
    flipX: !1,
    flipY: !1
}, c.SlotData = function(a272, b103) {
    this.name = a272, this.boneData = b103;
}, c.SlotData.prototype = {
    r: 1,
    g: 1,
    b: 1,
    a: 1,
    attachmentName: null,
    additiveBlending: !1
}, c.IkConstraintData = function(a273) {
    this.name = a273, this.bones = [];
}, c.IkConstraintData.prototype = {
    target: null,
    bendDirection: 1,
    mix: 1
}, c.Bone = function(a274, b104, c160) {
    this.data = a274, this.skeleton = b104, this.parent = c160, this.setToSetupPose();
}, c.Bone.yDown = !1, c.Bone.prototype = {
    x: 0,
    y: 0,
    rotation: 0,
    rotationIK: 0,
    scaleX: 1,
    scaleY: 1,
    flipX: !1,
    flipY: !1,
    m00: 0,
    m01: 0,
    worldX: 0,
    m10: 0,
    m11: 0,
    worldY: 0,
    worldRotation: 0,
    worldScaleX: 1,
    worldScaleY: 1,
    worldFlipX: !1,
    worldFlipY: !1,
    updateWorldTransform: function() {
        var a275 = this.parent;
        if (a275) this.worldX = this.x * a275.m00 + this.y * a275.m01 + a275.worldX, this.worldY = this.x * a275.m10 + this.y * a275.m11 + a275.worldY, this.data.inheritScale ? (this.worldScaleX = a275.worldScaleX * this.scaleX, this.worldScaleY = a275.worldScaleY * this.scaleY) : (this.worldScaleX = this.scaleX, this.worldScaleY = this.scaleY), this.worldRotation = this.data.inheritRotation ? a275.worldRotation + this.rotationIK : this.rotationIK, this.worldFlipX = a275.worldFlipX != this.flipX, this.worldFlipY = a275.worldFlipY != this.flipY;
        else {
            var b105 = this.skeleton.flipX, d = this.skeleton.flipY;
            this.worldX = b105 ? -this.x : this.x, this.worldY = d != c.Bone.yDown ? -this.y : this.y, this.worldScaleX = this.scaleX, this.worldScaleY = this.scaleY, this.worldRotation = this.rotationIK, this.worldFlipX = b105 != this.flipX, this.worldFlipY = d != this.flipY;
        }
        var e = this.worldRotation * c.degRad, f = Math.cos(e), g = Math.sin(e);
        this.worldFlipX ? (this.m00 = -f * this.worldScaleX, this.m01 = g * this.worldScaleY) : (this.m00 = f * this.worldScaleX, this.m01 = -g * this.worldScaleY), this.worldFlipY != c.Bone.yDown ? (this.m10 = -g * this.worldScaleX, this.m11 = -f * this.worldScaleY) : (this.m10 = g * this.worldScaleX, this.m11 = f * this.worldScaleY);
    },
    setToSetupPose: function() {
        var a276 = this.data;
        this.x = a276.x, this.y = a276.y, this.rotation = a276.rotation, this.rotationIK = this.rotation, this.scaleX = a276.scaleX, this.scaleY = a276.scaleY, this.flipX = a276.flipX, this.flipY = a276.flipY;
    },
    worldToLocal: function(a277) {
        var b106 = a277[0] - this.worldX, d = a277[1] - this.worldY, e = this.m00, f = this.m10, g = this.m01, h = this.m11;
        this.worldFlipX != (this.worldFlipY != c.Bone.yDown) && (e = -e, h = -h);
        var i = 1 / (e * h - g * f);
        a277[0] = b106 * e * i - d * g * i, a277[1] = d * h * i - b106 * f * i;
    },
    localToWorld: function(a278) {
        var b107 = a278[0], c161 = a278[1];
        a278[0] = b107 * this.m00 + c161 * this.m01 + this.worldX, a278[1] = b107 * this.m10 + c161 * this.m11 + this.worldY;
    }
}, c.Slot = function(a279, b108) {
    this.data = a279, this.bone = b108, this.setToSetupPose();
}, c.Slot.prototype = {
    r: 1,
    g: 1,
    b: 1,
    a: 1,
    _attachmentTime: 0,
    attachment: null,
    attachmentVertices: [],
    setAttachment: function(a280) {
        this.attachment = a280, this._attachmentTime = this.bone.skeleton.time, this.attachmentVertices.length = 0;
    },
    setAttachmentTime: function(a281) {
        this._attachmentTime = this.bone.skeleton.time - a281;
    },
    getAttachmentTime: function() {
        return this.bone.skeleton.time - this._attachmentTime;
    },
    setToSetupPose: function() {
        var a282 = this.data;
        this.r = a282.r, this.g = a282.g, this.b = a282.b, this.a = a282.a;
        for(var b109 = this.bone.skeleton.data.slots, c162 = 0, d = b109.length; d > c162; c162++)if (b109[c162] == a282) {
            this.setAttachment(a282.attachmentName ? this.bone.skeleton.getAttachmentBySlotIndex(c162, a282.attachmentName) : null);
            break;
        }
    }
}, c.IkConstraint = function(a283, b110) {
    this.data = a283, this.mix = a283.mix, this.bendDirection = a283.bendDirection, this.bones = [];
    for(var c163 = 0, d = a283.bones.length; d > c163; c163++)this.bones.push(b110.findBone(a283.bones[c163].name));
    this.target = b110.findBone(a283.target.name);
}, c.IkConstraint.prototype = {
    apply: function() {
        var a284 = this.target, b111 = this.bones;
        switch(b111.length){
            case 1:
                c.IkConstraint.apply1(b111[0], a284.worldX, a284.worldY, this.mix);
                break;
            case 2:
                c.IkConstraint.apply2(b111[0], b111[1], a284.worldX, a284.worldY, this.bendDirection, this.mix);
        }
    }
}, c.IkConstraint.apply1 = function(a285, b112, d, e) {
    var f = a285.data.inheritRotation && a285.parent ? a285.parent.worldRotation : 0, g = a285.rotation, h = Math.atan2(d - a285.worldY, b112 - a285.worldX) * c.radDeg - f;
    a285.rotationIK = g + (h - g) * e;
}, c.IkConstraint.apply2 = function(a286, b113, d, e, f, g) {
    var h = b113.rotation, i = a286.rotation;
    if (!g) return b113.rotationIK = h, void (a286.rotationIK = i);
    var j, k, l = c.temp, m = a286.parent;
    m ? (l[0] = d, l[1] = e, m.worldToLocal(l), d = (l[0] - a286.x) * m.worldScaleX, e = (l[1] - a286.y) * m.worldScaleY) : (d -= a286.x, e -= a286.y), b113.parent == a286 ? (j = b113.x, k = b113.y) : (l[0] = b113.x, l[1] = b113.y, b113.parent.localToWorld(l), a286.worldToLocal(l), j = l[0], k = l[1]);
    var n = j * a286.worldScaleX, o = k * a286.worldScaleY, p = Math.atan2(o, n), q = Math.sqrt(n * n + o * o), r = b113.data.length * b113.worldScaleX, s = 2 * q * r;
    if (0.0001 > s) return void (b113.rotationIK = h + (Math.atan2(e, d) * c.radDeg - i - h) * g);
    var t = (d * d + e * e - q * q - r * r) / s;
    -1 > t ? t = -1 : t > 1 && (t = 1);
    var u = Math.acos(t) * f, v = q + r * t, w = r * Math.sin(u), x = Math.atan2(e * v - d * w, d * v + e * w), y = (x - p) * c.radDeg - i;
    y > 180 ? y -= 360 : -180 > y && (y += 360), a286.rotationIK = i + y * g, y = (u + p) * c.radDeg - h, y > 180 ? y -= 360 : -180 > y && (y += 360), b113.rotationIK = h + (y + a286.worldRotation - b113.parent.worldRotation) * g;
}, c.Skin = function(a287) {
    this.name = a287, this.attachments = {
    };
}, c.Skin.prototype = {
    addAttachment: function(a, b, c164) {
        this.attachments[a + ":" + b] = c164;
    },
    getAttachment: function(a, b) {
        return this.attachments[a + ":" + b];
    },
    _attachAll: function(a288, b114) {
        for(var c165 in b114.attachments){
            var d = c165.indexOf(":"), e = parseInt(c165.substring(0, d)), f = c165.substring(d + 1), g = a288.slots[e];
            if (g.attachment && g.attachment.name == f) {
                var h = this.getAttachment(e, f);
                h && g.setAttachment(h);
            }
        }
    }
}, c.Animation = function(a289, b115, c166) {
    this.name = a289, this.timelines = b115, this.duration = c166;
}, c.Animation.prototype = {
    apply: function(a290, b116, c167, d, e) {
        d && 0 != this.duration && (c167 %= this.duration, b116 %= this.duration);
        for(var f = this.timelines, g = 0, h = f.length; h > g; g++)f[g].apply(a290, b116, c167, e, 1);
    },
    mix: function(a291, b117, c168, d, e, f) {
        d && 0 != this.duration && (c168 %= this.duration, b117 %= this.duration);
        for(var g = this.timelines, h = 0, i = g.length; i > h; h++)g[h].apply(a291, b117, c168, e, f);
    }
}, c.Animation.binarySearch = function(a292, b118, c169) {
    var d = 0, e = Math.floor(a292.length / c169) - 2;
    if (!e) return c169;
    for(var f = e >>> 1;;){
        if (a292[(f + 1) * c169] <= b118 ? d = f + 1 : e = f, d == e) return (d + 1) * c169;
        f = d + e >>> 1;
    }
}, c.Animation.binarySearch1 = function(a293, b119) {
    var c170 = 0, d = a293.length - 2;
    if (!d) return 1;
    for(var e = d >>> 1;;){
        if (a293[e + 1] <= b119 ? c170 = e + 1 : d = e, c170 == d) return c170 + 1;
        e = c170 + d >>> 1;
    }
}, c.Animation.linearSearch = function(a294, b120, c171) {
    for(var d = 0, e = a294.length - c171; e >= d; d += c171)if (a294[d] > b120) return d;
    return -1;
}, c.Curves = function() {
    this.curves = [];
}, c.Curves.prototype = {
    setLinear: function(a) {
        this.curves[19 * a] = 0;
    },
    setStepped: function(a) {
        this.curves[19 * a] = 1;
    },
    setCurve: function(a295, b121, c172, d, e) {
        var f = 0.1, g = f * f, h = g * f, i = 3 * f, j = 3 * g, k = 6 * g, l = 6 * h, m = 2 * -b121 + d, n = 2 * -c172 + e, o = 3 * (b121 - d) + 1, p = 3 * (c172 - e) + 1, q = b121 * i + m * j + o * h, r = c172 * i + n * j + p * h, s = m * k + o * l, t = n * k + p * l, u = o * l, v = p * l, w = 19 * a295, x = this.curves;
        x[w++] = 2;
        for(var y = q, z = r, A = w + 19 - 1; A > w; w += 2)x[w] = y, x[w + 1] = z, q += s, r += t, s += u, t += v, y += q, z += r;
    },
    getCurvePercent: function(a296, b122) {
        b122 = 0 > b122 ? 0 : b122 > 1 ? 1 : b122;
        var c173 = this.curves, d = 19 * a296, e = c173[d];
        if (0 === e) return b122;
        if (1 == e) return 0;
        d++;
        for(var f = 0, g = d, h = d + 19 - 1; h > d; d += 2)if (f = c173[d], f >= b122) {
            var i, j;
            return d == g ? (i = 0, j = 0) : (i = c173[d - 2], j = c173[d - 1]), j + (c173[d + 1] - j) * (b122 - i) / (f - i);
        }
        var k = c173[d - 1];
        return k + (1 - k) * (b122 - f) / (1 - f);
    }
}, c.RotateTimeline = function(a297) {
    this.curves = new c.Curves(a297), this.frames = [], this.frames.length = 2 * a297;
}, c.RotateTimeline.prototype = {
    boneIndex: 0,
    getFrameCount: function() {
        return this.frames.length / 2;
    },
    setFrame: function(a298, b123, c174) {
        a298 *= 2, this.frames[a298] = b123, this.frames[a298 + 1] = c174;
    },
    apply: function(a299, b, d, e, f) {
        var g = this.frames;
        if (!(d < g[0])) {
            var h = a299.bones[this.boneIndex];
            if (d >= g[g.length - 2]) {
                for(var i = h.data.rotation + g[g.length - 1] - h.rotation; i > 180;)i -= 360;
                for(; -180 > i;)i += 360;
                return void (h.rotation += i * f);
            }
            var j = c.Animation.binarySearch(g, d, 2), k = g[j - 1], l = g[j], m = 1 - (d - l) / (g[j - 2] - l);
            m = this.curves.getCurvePercent(j / 2 - 1, m);
            for(var i = g[j + 1] - k; i > 180;)i -= 360;
            for(; -180 > i;)i += 360;
            for(i = h.data.rotation + (k + i * m) - h.rotation; i > 180;)i -= 360;
            for(; -180 > i;)i += 360;
            h.rotation += i * f;
        }
    }
}, c.TranslateTimeline = function(a300) {
    this.curves = new c.Curves(a300), this.frames = [], this.frames.length = 3 * a300;
}, c.TranslateTimeline.prototype = {
    boneIndex: 0,
    getFrameCount: function() {
        return this.frames.length / 3;
    },
    setFrame: function(a301, b124, c175, d) {
        a301 *= 3, this.frames[a301] = b124, this.frames[a301 + 1] = c175, this.frames[a301 + 2] = d;
    },
    apply: function(a302, b, d, e, f) {
        var g = this.frames;
        if (!(d < g[0])) {
            var h = a302.bones[this.boneIndex];
            if (d >= g[g.length - 3]) return h.x += (h.data.x + g[g.length - 2] - h.x) * f, void (h.y += (h.data.y + g[g.length - 1] - h.y) * f);
            var i = c.Animation.binarySearch(g, d, 3), j = g[i - 2], k = g[i - 1], l = g[i], m = 1 - (d - l) / (g[i + -3] - l);
            m = this.curves.getCurvePercent(i / 3 - 1, m), h.x += (h.data.x + j + (g[i + 1] - j) * m - h.x) * f, h.y += (h.data.y + k + (g[i + 2] - k) * m - h.y) * f;
        }
    }
}, c.ScaleTimeline = function(a303) {
    this.curves = new c.Curves(a303), this.frames = [], this.frames.length = 3 * a303;
}, c.ScaleTimeline.prototype = {
    boneIndex: 0,
    getFrameCount: function() {
        return this.frames.length / 3;
    },
    setFrame: function(a304, b125, c176, d) {
        a304 *= 3, this.frames[a304] = b125, this.frames[a304 + 1] = c176, this.frames[a304 + 2] = d;
    },
    apply: function(a305, b, d, e, f) {
        var g = this.frames;
        if (!(d < g[0])) {
            var h = a305.bones[this.boneIndex];
            if (d >= g[g.length - 3]) return h.scaleX += (h.data.scaleX * g[g.length - 2] - h.scaleX) * f, void (h.scaleY += (h.data.scaleY * g[g.length - 1] - h.scaleY) * f);
            var i = c.Animation.binarySearch(g, d, 3), j = g[i - 2], k = g[i - 1], l = g[i], m = 1 - (d - l) / (g[i + -3] - l);
            m = this.curves.getCurvePercent(i / 3 - 1, m), h.scaleX += (h.data.scaleX * (j + (g[i + 1] - j) * m) - h.scaleX) * f, h.scaleY += (h.data.scaleY * (k + (g[i + 2] - k) * m) - h.scaleY) * f;
        }
    }
}, c.ColorTimeline = function(a306) {
    this.curves = new c.Curves(a306), this.frames = [], this.frames.length = 5 * a306;
}, c.ColorTimeline.prototype = {
    slotIndex: 0,
    getFrameCount: function() {
        return this.frames.length / 5;
    },
    setFrame: function(a307, b126, c177, d, e, f) {
        a307 *= 5, this.frames[a307] = b126, this.frames[a307 + 1] = c177, this.frames[a307 + 2] = d, this.frames[a307 + 3] = e, this.frames[a307 + 4] = f;
    },
    apply: function(a308, b, d, e, f) {
        var g = this.frames;
        if (!(d < g[0])) {
            var h, i, j, k;
            if (d >= g[g.length - 5]) {
                var l = g.length - 1;
                h = g[l - 3], i = g[l - 2], j = g[l - 1], k = g[l];
            } else {
                var m = c.Animation.binarySearch(g, d, 5), n = g[m - 4], o = g[m - 3], p = g[m - 2], q = g[m - 1], r = g[m], s = 1 - (d - r) / (g[m - 5] - r);
                s = this.curves.getCurvePercent(m / 5 - 1, s), h = n + (g[m + 1] - n) * s, i = o + (g[m + 2] - o) * s, j = p + (g[m + 3] - p) * s, k = q + (g[m + 4] - q) * s;
            }
            var t = a308.slots[this.slotIndex];
            1 > f ? (t.r += (h - t.r) * f, t.g += (i - t.g) * f, t.b += (j - t.b) * f, t.a += (k - t.a) * f) : (t.r = h, t.g = i, t.b = j, t.a = k);
        }
    }
}, c.AttachmentTimeline = function(a309) {
    this.curves = new c.Curves(a309), this.frames = [], this.frames.length = a309, this.attachmentNames = [], this.attachmentNames.length = a309;
}, c.AttachmentTimeline.prototype = {
    slotIndex: 0,
    getFrameCount: function() {
        return this.frames.length;
    },
    setFrame: function(a, b127, c178) {
        this.frames[a] = b127, this.attachmentNames[a] = c178;
    },
    apply: function(a310, b128, d) {
        var e = this.frames;
        if (d < e[0]) return void (b128 > d && this.apply(a310, b128, Number.MAX_VALUE, null, 0));
        b128 > d && (b128 = -1);
        var f = d >= e[e.length - 1] ? e.length - 1 : c.Animation.binarySearch1(e, d) - 1;
        if (!(e[f] < b128)) {
            var g = this.attachmentNames[f];
            a310.slots[this.slotIndex].setAttachment(g ? a310.getAttachmentBySlotIndex(this.slotIndex, g) : null);
        }
    }
}, c.EventTimeline = function(a311) {
    this.frames = [], this.frames.length = a311, this.events = [], this.events.length = a311;
}, c.EventTimeline.prototype = {
    getFrameCount: function() {
        return this.frames.length;
    },
    setFrame: function(a, b129, c179) {
        this.frames[a] = b129, this.events[a] = c179;
    },
    apply: function(a312, b130, d, e, f) {
        if (e) {
            var g = this.frames, h = g.length;
            if (b130 > d) this.apply(a312, b130, Number.MAX_VALUE, e, f), b130 = -1;
            else if (b130 >= g[h - 1]) return;
            if (!(d < g[0])) {
                var i;
                if (b130 < g[0]) i = 0;
                else {
                    i = c.Animation.binarySearch1(g, b130);
                    for(var j = g[i]; i > 0 && g[i - 1] == j;)i--;
                }
                for(var k = this.events; h > i && d >= g[i]; i++)e.push(k[i]);
            }
        }
    }
}, c.DrawOrderTimeline = function(a313) {
    this.frames = [], this.frames.length = a313, this.drawOrders = [], this.drawOrders.length = a313;
}, c.DrawOrderTimeline.prototype = {
    getFrameCount: function() {
        return this.frames.length;
    },
    setFrame: function(a, b131, c180) {
        this.frames[a] = b131, this.drawOrders[a] = c180;
    },
    apply: function(a314, b, d) {
        var e = this.frames;
        if (!(d < e[0])) {
            var f;
            f = d >= e[e.length - 1] ? e.length - 1 : c.Animation.binarySearch1(e, d) - 1;
            var g = a314.drawOrder, h = (a314.slots, this.drawOrders[f]);
            if (h) for(var i = 0, j = h.length; j > i; i++)g[i] = h[i];
        }
    }
}, c.FfdTimeline = function(a315) {
    this.curves = new c.Curves(a315), this.frames = [], this.frames.length = a315, this.frameVertices = [], this.frameVertices.length = a315;
}, c.FfdTimeline.prototype = {
    slotIndex: 0,
    attachment: 0,
    getFrameCount: function() {
        return this.frames.length;
    },
    setFrame: function(a, b132, c181) {
        this.frames[a] = b132, this.frameVertices[a] = c181;
    },
    apply: function(a316, b, d, e, f) {
        var g = a316.slots[this.slotIndex];
        if (g.attachment == this.attachment) {
            var h = this.frames;
            if (!(d < h[0])) {
                var i = this.frameVertices, j = i[0].length, k = g.attachmentVertices;
                if (k.length != j && (f = 1), k.length = j, d >= h[h.length - 1]) {
                    var l = i[h.length - 1];
                    if (1 > f) for(var m = 0; j > m; m++)k[m] += (l[m] - k[m]) * f;
                    else for(var m = 0; j > m; m++)k[m] = l[m];
                } else {
                    var n = c.Animation.binarySearch1(h, d), o = h[n], p = 1 - (d - o) / (h[n - 1] - o);
                    p = this.curves.getCurvePercent(n - 1, 0 > p ? 0 : p > 1 ? 1 : p);
                    var q = i[n - 1], r = i[n];
                    if (1 > f) for(var m = 0; j > m; m++){
                        var s = q[m];
                        k[m] += (s + (r[m] - s) * p - k[m]) * f;
                    }
                    else for(var m = 0; j > m; m++){
                        var s = q[m];
                        k[m] = s + (r[m] - s) * p;
                    }
                }
            }
        }
    }
}, c.IkConstraintTimeline = function(a317) {
    this.curves = new c.Curves(a317), this.frames = [], this.frames.length = 3 * a317;
}, c.IkConstraintTimeline.prototype = {
    ikConstraintIndex: 0,
    getFrameCount: function() {
        return this.frames.length / 3;
    },
    setFrame: function(a318, b133, c182, d) {
        a318 *= 3, this.frames[a318] = b133, this.frames[a318 + 1] = c182, this.frames[a318 + 2] = d;
    },
    apply: function(a319, b, d, e, f) {
        var g = this.frames;
        if (!(d < g[0])) {
            var h = a319.ikConstraints[this.ikConstraintIndex];
            if (d >= g[g.length - 3]) return h.mix += (g[g.length - 2] - h.mix) * f, void (h.bendDirection = g[g.length - 1]);
            var i = c.Animation.binarySearch(g, d, 3), j = g[i + -2], k = g[i], l = 1 - (d - k) / (g[i + -3] - k);
            l = this.curves.getCurvePercent(i / 3 - 1, l);
            var m = j + (g[i + 1] - j) * l;
            h.mix += (m - h.mix) * f, h.bendDirection = g[i + -1];
        }
    }
}, c.FlipXTimeline = function(a320) {
    this.curves = new c.Curves(a320), this.frames = [], this.frames.length = 2 * a320;
}, c.FlipXTimeline.prototype = {
    boneIndex: 0,
    getFrameCount: function() {
        return this.frames.length / 2;
    },
    setFrame: function(a321, b134, c183) {
        a321 *= 2, this.frames[a321] = b134, this.frames[a321 + 1] = c183 ? 1 : 0;
    },
    apply: function(a322, b135, d) {
        var e = this.frames;
        if (d < e[0]) return void (b135 > d && this.apply(a322, b135, Number.MAX_VALUE, null, 0));
        b135 > d && (b135 = -1);
        var f = (d >= e[e.length - 2] ? e.length : c.Animation.binarySearch(e, d, 2)) - 2;
        e[f] < b135 || (a322.bones[boneIndex].flipX = 0 != e[f + 1]);
    }
}, c.FlipYTimeline = function(a323) {
    this.curves = new c.Curves(a323), this.frames = [], this.frames.length = 2 * a323;
}, c.FlipYTimeline.prototype = {
    boneIndex: 0,
    getFrameCount: function() {
        return this.frames.length / 2;
    },
    setFrame: function(a324, b136, c184) {
        a324 *= 2, this.frames[a324] = b136, this.frames[a324 + 1] = c184 ? 1 : 0;
    },
    apply: function(a325, b137, d) {
        var e = this.frames;
        if (d < e[0]) return void (b137 > d && this.apply(a325, b137, Number.MAX_VALUE, null, 0));
        b137 > d && (b137 = -1);
        var f = (d >= e[e.length - 2] ? e.length : c.Animation.binarySearch(e, d, 2)) - 2;
        e[f] < b137 || (a325.bones[boneIndex].flipY = 0 != e[f + 1]);
    }
}, c.SkeletonData = function() {
    this.bones = [], this.slots = [], this.skins = [], this.events = [], this.animations = [], this.ikConstraints = [];
}, c.SkeletonData.prototype = {
    name: null,
    defaultSkin: null,
    width: 0,
    height: 0,
    version: null,
    hash: null,
    findBone: function(a326) {
        for(var b138 = this.bones, c185 = 0, d = b138.length; d > c185; c185++)if (b138[c185].name == a326) return b138[c185];
        return null;
    },
    findBoneIndex: function(a327) {
        for(var b139 = this.bones, c186 = 0, d = b139.length; d > c186; c186++)if (b139[c186].name == a327) return c186;
        return -1;
    },
    findSlot: function(a328) {
        for(var b140 = this.slots, c187 = 0, d = b140.length; d > c187; c187++)if (b140[c187].name == a328) return slot[c187];
        return null;
    },
    findSlotIndex: function(a329) {
        for(var b141 = this.slots, c188 = 0, d = b141.length; d > c188; c188++)if (b141[c188].name == a329) return c188;
        return -1;
    },
    findSkin: function(a330) {
        for(var b142 = this.skins, c189 = 0, d = b142.length; d > c189; c189++)if (b142[c189].name == a330) return b142[c189];
        return null;
    },
    findEvent: function(a331) {
        for(var b143 = this.events, c190 = 0, d = b143.length; d > c190; c190++)if (b143[c190].name == a331) return b143[c190];
        return null;
    },
    findAnimation: function(a332) {
        for(var b144 = this.animations, c191 = 0, d = b144.length; d > c191; c191++)if (b144[c191].name == a332) return b144[c191];
        return null;
    },
    findIkConstraint: function(a333) {
        for(var b145 = this.ikConstraints, c192 = 0, d = b145.length; d > c192; c192++)if (b145[c192].name == a333) return b145[c192];
        return null;
    }
}, c.Skeleton = function(a334) {
    this.data = a334, this.bones = [];
    for(var b146 = 0, d = a334.bones.length; d > b146; b146++){
        var e = a334.bones[b146], f = e.parent ? this.bones[a334.bones.indexOf(e.parent)] : null;
        this.bones.push(new c.Bone(e, this, f));
    }
    this.slots = [], this.drawOrder = [];
    for(var b146 = 0, d = a334.slots.length; d > b146; b146++){
        var g = a334.slots[b146], h = this.bones[a334.bones.indexOf(g.boneData)], i = new c.Slot(g, h);
        this.slots.push(i), this.drawOrder.push(b146);
    }
    this.ikConstraints = [];
    for(var b146 = 0, d = a334.ikConstraints.length; d > b146; b146++)this.ikConstraints.push(new c.IkConstraint(a334.ikConstraints[b146], this));
    this.boneCache = [], this.updateCache();
}, c.Skeleton.prototype = {
    x: 0,
    y: 0,
    skin: null,
    r: 1,
    g: 1,
    b: 1,
    a: 1,
    time: 0,
    flipX: !1,
    flipY: !1,
    updateCache: function() {
        var a335 = this.ikConstraints, b147 = a335.length, c193 = b147 + 1, d = this.boneCache;
        d.length > c193 && (d.length = c193);
        for(var e = 0, f = d.length; f > e; e++)d[e].length = 0;
        for(; d.length < c193;)d[d.length] = [];
        var g = d[0], h = this.bones;
        a: for(var e = 0, f = h.length; f > e; e++){
            var i = h[e], j = i;
            do {
                for(var k = 0; b147 > k; k++)for(var l = a335[k], m = l.bones[0], n = l.bones[l.bones.length - 1];;){
                    if (j == n) {
                        d[k].push(i), d[k + 1].push(i);
                        continue a;
                    }
                    if (n == m) break;
                    n = n.parent;
                }
                j = j.parent;
            }while (j)
            g[g.length] = i;
        }
    },
    updateWorldTransform: function() {
        for(var a336 = this.bones, b148 = 0, c194 = a336.length; c194 > b148; b148++){
            var d = a336[b148];
            d.rotationIK = d.rotation;
        }
        for(var b148 = 0, e = this.boneCache.length - 1;;){
            for(var f = this.boneCache[b148], g = 0, h = f.length; h > g; g++)f[g].updateWorldTransform();
            if (b148 == e) break;
            this.ikConstraints[b148].apply(), b148++;
        }
    },
    setToSetupPose: function() {
        this.setBonesToSetupPose(), this.setSlotsToSetupPose();
    },
    setBonesToSetupPose: function() {
        for(var a337 = this.bones, b149 = 0, c195 = a337.length; c195 > b149; b149++)a337[b149].setToSetupPose();
        for(var d = this.ikConstraints, b149 = 0, c195 = d.length; c195 > b149; b149++){
            var e = d[b149];
            e.bendDirection = e.data.bendDirection, e.mix = e.data.mix;
        }
    },
    setSlotsToSetupPose: function() {
        for(var a338 = this.slots, b150 = 0, c196 = a338.length; c196 > b150; b150++)a338[b150].setToSetupPose(b150);
        this.resetDrawOrder();
    },
    getRootBone: function() {
        return this.bones.length ? this.bones[0] : null;
    },
    findBone: function(a339) {
        for(var b151 = this.bones, c197 = 0, d = b151.length; d > c197; c197++)if (b151[c197].data.name == a339) return b151[c197];
        return null;
    },
    findBoneIndex: function(a340) {
        for(var b152 = this.bones, c198 = 0, d = b152.length; d > c198; c198++)if (b152[c198].data.name == a340) return c198;
        return -1;
    },
    findSlot: function(a341) {
        for(var b153 = this.slots, c199 = 0, d = b153.length; d > c199; c199++)if (b153[c199].data.name == a341) return b153[c199];
        return null;
    },
    findSlotIndex: function(a342) {
        for(var b154 = this.slots, c200 = 0, d = b154.length; d > c200; c200++)if (b154[c200].data.name == a342) return c200;
        return -1;
    },
    setSkinByName: function(a343) {
        var b155 = this.data.findSkin(a343);
        if (!b155) throw "Skin not found: " + a343;
        this.setSkin(b155);
    },
    setSkin: function(a344) {
        if (a344) {
            if (this.skin) a344._attachAll(this, this.skin);
            else for(var b156 = this.slots, c201 = 0, d = b156.length; d > c201; c201++){
                var e = b156[c201], f = e.data.attachmentName;
                if (f) {
                    var g = a344.getAttachment(c201, f);
                    g && e.setAttachment(g);
                }
            }
        }
        this.skin = a344;
    },
    getAttachmentBySlotName: function(a345, b157) {
        return this.getAttachmentBySlotIndex(this.data.findSlotIndex(a345), b157);
    },
    getAttachmentBySlotIndex: function(a346, b158) {
        if (this.skin) {
            var c202 = this.skin.getAttachment(a346, b158);
            if (c202) return c202;
        }
        return this.data.defaultSkin ? this.data.defaultSkin.getAttachment(a346, b158) : null;
    },
    setAttachment: function(a347, b159) {
        for(var c203 = this.slots, d = 0, e = c203.length; e > d; d++){
            var f = c203[d];
            if (f.data.name == a347) {
                var g = null;
                if (b159 && (g = this.getAttachmentBySlotIndex(d, b159), !g)) throw "Attachment not found: " + b159 + ", for slot: " + a347;
                return void f.setAttachment(g);
            }
        }
        throw "Slot not found: " + a347;
    },
    findIkConstraint: function(a348) {
        for(var b160 = this.ikConstraints, c204 = 0, d = b160.length; d > c204; c204++)if (b160[c204].data.name == a348) return b160[c204];
        return null;
    },
    update: function(a349) {
        this.time += a349;
    },
    resetDrawOrder: function() {
        for(var a350 = 0, b161 = this.drawOrder.length; b161 > a350; a350++)this.drawOrder[a350] = a350;
    }
}, c.EventData = function(a351) {
    this.name = a351;
}, c.EventData.prototype = {
    intValue: 0,
    floatValue: 0,
    stringValue: null
}, c.Event = function(a352) {
    this.data = a352;
}, c.Event.prototype = {
    intValue: 0,
    floatValue: 0,
    stringValue: null
}, c.AttachmentType = {
    region: 0,
    boundingbox: 1,
    mesh: 2,
    skinnedmesh: 3
}, c.RegionAttachment = function(a353) {
    this.name = a353, this.offset = [], this.offset.length = 8, this.uvs = [], this.uvs.length = 8;
}, c.RegionAttachment.prototype = {
    type: c.AttachmentType.region,
    x: 0,
    y: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    width: 0,
    height: 0,
    r: 1,
    g: 1,
    b: 1,
    a: 1,
    path: null,
    rendererObject: null,
    regionOffsetX: 0,
    regionOffsetY: 0,
    regionWidth: 0,
    regionHeight: 0,
    regionOriginalWidth: 0,
    regionOriginalHeight: 0,
    setUVs: function(a354, b162, c205, d, e) {
        var f = this.uvs;
        e ? (f[2] = a354, f[3] = d, f[4] = a354, f[5] = b162, f[6] = c205, f[7] = b162, f[0] = c205, f[1] = d) : (f[0] = a354, f[1] = d, f[2] = a354, f[3] = b162, f[4] = c205, f[5] = b162, f[6] = c205, f[7] = d);
    },
    updateOffset: function() {
        var a355 = this.width / this.regionOriginalWidth * this.scaleX, b163 = this.height / this.regionOriginalHeight * this.scaleY, d = -this.width / 2 * this.scaleX + this.regionOffsetX * a355, e = -this.height / 2 * this.scaleY + this.regionOffsetY * b163, f = d + this.regionWidth * a355, g = e + this.regionHeight * b163, h = this.rotation * c.degRad, i = Math.cos(h), j = Math.sin(h), k = d * i + this.x, l = d * j, m = e * i + this.y, n = e * j, o = f * i + this.x, p = f * j, q = g * i + this.y, r = g * j, s = this.offset;
        s[0] = k - n, s[1] = m + l, s[2] = k - r, s[3] = q + l, s[4] = o - r, s[5] = q + p, s[6] = o - n, s[7] = m + p;
    },
    computeVertices: function(a356, b164, c206, d) {
        a356 += c206.worldX, b164 += c206.worldY;
        var e = c206.m00, f = c206.m01, g = c206.m10, h = c206.m11, i = this.offset;
        d[0] = i[0] * e + i[1] * f + a356, d[1] = i[0] * g + i[1] * h + b164, d[2] = i[2] * e + i[3] * f + a356, d[3] = i[2] * g + i[3] * h + b164, d[4] = i[4] * e + i[5] * f + a356, d[5] = i[4] * g + i[5] * h + b164, d[6] = i[6] * e + i[7] * f + a356, d[7] = i[6] * g + i[7] * h + b164;
    }
}, c.MeshAttachment = function(a357) {
    this.name = a357;
}, c.MeshAttachment.prototype = {
    type: c.AttachmentType.mesh,
    vertices: null,
    uvs: null,
    regionUVs: null,
    triangles: null,
    hullLength: 0,
    r: 1,
    g: 1,
    b: 1,
    a: 1,
    path: null,
    rendererObject: null,
    regionU: 0,
    regionV: 0,
    regionU2: 0,
    regionV2: 0,
    regionRotate: !1,
    regionOffsetX: 0,
    regionOffsetY: 0,
    regionWidth: 0,
    regionHeight: 0,
    regionOriginalWidth: 0,
    regionOriginalHeight: 0,
    edges: null,
    width: 0,
    height: 0,
    updateUVs: function() {
        var a358 = this.regionU2 - this.regionU, b165 = this.regionV2 - this.regionV, d = this.regionUVs.length;
        if (this.uvs && this.uvs.length == d || (this.uvs = new c.Float32Array(d)), this.regionRotate) for(var e = 0; d > e; e += 2)this.uvs[e] = this.regionU + this.regionUVs[e + 1] * a358, this.uvs[e + 1] = this.regionV + b165 - this.regionUVs[e] * b165;
        else for(var e = 0; d > e; e += 2)this.uvs[e] = this.regionU + this.regionUVs[e] * a358, this.uvs[e + 1] = this.regionV + this.regionUVs[e + 1] * b165;
    },
    computeWorldVertices: function(a359, b166, c207, d) {
        var e = c207.bone;
        a359 += e.worldX, b166 += e.worldY;
        var f = e.m00, g = e.m01, h = e.m10, i = e.m11, j = this.vertices, k = j.length;
        c207.attachmentVertices.length == k && (j = c207.attachmentVertices);
        for(var l = 0; k > l; l += 2){
            var m = j[l], n = j[l + 1];
            d[l] = m * f + n * g + a359, d[l + 1] = m * h + n * i + b166;
        }
    }
}, c.SkinnedMeshAttachment = function(a360) {
    this.name = a360;
}, c.SkinnedMeshAttachment.prototype = {
    type: c.AttachmentType.skinnedmesh,
    bones: null,
    weights: null,
    uvs: null,
    regionUVs: null,
    triangles: null,
    hullLength: 0,
    r: 1,
    g: 1,
    b: 1,
    a: 1,
    path: null,
    rendererObject: null,
    regionU: 0,
    regionV: 0,
    regionU2: 0,
    regionV2: 0,
    regionRotate: !1,
    regionOffsetX: 0,
    regionOffsetY: 0,
    regionWidth: 0,
    regionHeight: 0,
    regionOriginalWidth: 0,
    regionOriginalHeight: 0,
    edges: null,
    width: 0,
    height: 0,
    updateUVs: function() {
        var a361 = this.regionU2 - this.regionU, b167 = this.regionV2 - this.regionV, d = this.regionUVs.length;
        if (this.uvs && this.uvs.length == d || (this.uvs = new c.Float32Array(d)), this.regionRotate) for(var e = 0; d > e; e += 2)this.uvs[e] = this.regionU + this.regionUVs[e + 1] * a361, this.uvs[e + 1] = this.regionV + b167 - this.regionUVs[e] * b167;
        else for(var e = 0; d > e; e += 2)this.uvs[e] = this.regionU + this.regionUVs[e] * a361, this.uvs[e + 1] = this.regionV + this.regionUVs[e + 1] * b167;
    },
    computeWorldVertices: function(a362, b168, c208, d) {
        var e, f, g, h, i, j, k, l = c208.bone.skeleton.bones, m = this.weights, n = this.bones, o = 0, p = 0, q = 0, r = 0, s = n.length;
        if (c208.attachmentVertices.length) for(var t = c208.attachmentVertices; s > p; o += 2){
            for(f = 0, g = 0, e = n[p++] + p; e > p; p++, q += 3, r += 2)h = l[n[p]], i = m[q] + t[r], j = m[q + 1] + t[r + 1], k = m[q + 2], f += (i * h.m00 + j * h.m01 + h.worldX) * k, g += (i * h.m10 + j * h.m11 + h.worldY) * k;
            d[o] = f + a362, d[o + 1] = g + b168;
        }
        else for(; s > p; o += 2){
            for(f = 0, g = 0, e = n[p++] + p; e > p; p++, q += 3)h = l[n[p]], i = m[q], j = m[q + 1], k = m[q + 2], f += (i * h.m00 + j * h.m01 + h.worldX) * k, g += (i * h.m10 + j * h.m11 + h.worldY) * k;
            d[o] = f + a362, d[o + 1] = g + b168;
        }
    }
}, c.BoundingBoxAttachment = function(a363) {
    this.name = a363, this.vertices = [];
}, c.BoundingBoxAttachment.prototype = {
    type: c.AttachmentType.boundingbox,
    computeWorldVertices: function(a364, b169, c209, d) {
        a364 += c209.worldX, b169 += c209.worldY;
        for(var e = c209.m00, f = c209.m01, g = c209.m10, h = c209.m11, i = this.vertices, j = 0, k = i.length; k > j; j += 2){
            var l = i[j], m = i[j + 1];
            d[j] = l * e + m * f + a364, d[j + 1] = l * g + m * h + b169;
        }
    }
}, c.AnimationStateData = function(a365) {
    this.skeletonData = a365, this.animationToMixTime = {
    };
}, c.AnimationStateData.prototype = {
    defaultMix: 0,
    setMixByName: function(a366, b170, c210) {
        var d = this.skeletonData.findAnimation(a366);
        if (!d) throw "Animation not found: " + a366;
        var e = this.skeletonData.findAnimation(b170);
        if (!e) throw "Animation not found: " + b170;
        this.setMix(d, e, c210);
    },
    setMix: function(a, b, c211) {
        this.animationToMixTime[a.name + ":" + b.name] = c211;
    },
    getMix: function(a367, b171) {
        var c212 = a367.name + ":" + b171.name;
        return this.animationToMixTime.hasOwnProperty(c212) ? this.animationToMixTime[c212] : this.defaultMix;
    }
}, c.TrackEntry = function() {
}, c.TrackEntry.prototype = {
    next: null,
    previous: null,
    animation: null,
    loop: !1,
    delay: 0,
    time: 0,
    lastTime: -1,
    endTime: 0,
    timeScale: 1,
    mixTime: 0,
    mixDuration: 0,
    mix: 1,
    onStart: null,
    onEnd: null,
    onComplete: null,
    onEvent: null
}, c.AnimationState = function(a368) {
    this.data = a368, this.tracks = [], this.events = [];
}, c.AnimationState.prototype = {
    onStart: null,
    onEnd: null,
    onComplete: null,
    onEvent: null,
    timeScale: 1,
    update: function(a369) {
        a369 *= this.timeScale;
        for(var b172 = 0; b172 < this.tracks.length; b172++){
            var c213 = this.tracks[b172];
            if (c213) {
                if (c213.time += a369 * c213.timeScale, c213.previous) {
                    var d = a369 * c213.previous.timeScale;
                    c213.previous.time += d, c213.mixTime += d;
                }
                var e = c213.next;
                e ? (e.time = c213.lastTime - e.delay, e.time >= 0 && this.setCurrent(b172, e)) : !c213.loop && c213.lastTime >= c213.endTime && this.clearTrack(b172);
            }
        }
    },
    apply: function(a370) {
        a370.resetDrawOrder();
        for(var b173 = 0; b173 < this.tracks.length; b173++){
            var c214 = this.tracks[b173];
            if (c214) {
                this.events.length = 0;
                var d = c214.time, e = c214.lastTime, f = c214.endTime, g = c214.loop;
                !g && d > f && (d = f);
                var h = c214.previous;
                if (h) {
                    var i = h.time;
                    !h.loop && i > h.endTime && (i = h.endTime), h.animation.apply(a370, i, i, h.loop, null);
                    var j = c214.mixTime / c214.mixDuration * c214.mix;
                    j >= 1 && (j = 1, c214.previous = null), c214.animation.mix(a370, c214.lastTime, d, g, this.events, j);
                } else 1 == c214.mix ? c214.animation.apply(a370, c214.lastTime, d, g, this.events) : c214.animation.mix(a370, c214.lastTime, d, g, this.events, c214.mix);
                for(var k = 0, l = this.events.length; l > k; k++){
                    var m = this.events[k];
                    c214.onEvent && c214.onEvent(b173, m), this.onEvent && this.onEvent(b173, m);
                }
                if (g ? e % f > d % f : f > e && d >= f) {
                    var n = Math.floor(d / f);
                    c214.onComplete && c214.onComplete(b173, n), this.onComplete && this.onComplete(b173, n);
                }
                c214.lastTime = c214.time;
            }
        }
    },
    clearTracks: function() {
        for(var a371 = 0, b174 = this.tracks.length; b174 > a371; a371++)this.clearTrack(a371);
        this.tracks.length = 0;
    },
    clearTrack: function(a372) {
        if (!(a372 >= this.tracks.length)) {
            var b175 = this.tracks[a372];
            b175 && (b175.onEnd && b175.onEnd(a372), this.onEnd && this.onEnd(a372), this.tracks[a372] = null);
        }
    },
    _expandToIndex: function(a373) {
        if (a373 < this.tracks.length) return this.tracks[a373];
        for(; a373 >= this.tracks.length;)this.tracks.push(null);
        return null;
    },
    setCurrent: function(a374, b176) {
        var c215 = this._expandToIndex(a374);
        if (c215) {
            var d = c215.previous;
            c215.previous = null, c215.onEnd && c215.onEnd(a374), this.onEnd && this.onEnd(a374), b176.mixDuration = this.data.getMix(c215.animation, b176.animation), b176.mixDuration > 0 && (b176.mixTime = 0, b176.previous = d && c215.mixTime / c215.mixDuration < 0.5 ? d : c215);
        }
        this.tracks[a374] = b176, b176.onStart && b176.onStart(a374), this.onStart && this.onStart(a374);
    },
    setAnimationByName: function(a375, b177, c216) {
        var d = this.data.skeletonData.findAnimation(b177);
        if (!d) throw "Animation not found: " + b177;
        return this.setAnimation(a375, d, c216);
    },
    setAnimation: function(a376, b178, d) {
        var e = new c.TrackEntry;
        return e.animation = b178, e.loop = d, e.endTime = b178.duration, this.setCurrent(a376, e), e;
    },
    addAnimationByName: function(a377, b179, c217, d) {
        var e = this.data.skeletonData.findAnimation(b179);
        if (!e) throw "Animation not found: " + b179;
        return this.addAnimation(a377, e, c217, d);
    },
    addAnimation: function(a378, b180, d, e) {
        var f = new c.TrackEntry;
        f.animation = b180, f.loop = d, f.endTime = b180.duration;
        var g = this._expandToIndex(a378);
        if (g) {
            for(; g.next;)g = g.next;
            g.next = f;
        } else this.tracks[a378] = f;
        return 0 >= e && (g ? e += g.endTime - this.data.getMix(g.animation, b180) : e = 0), f.delay = e, f;
    },
    getCurrent: function(a379) {
        return a379 >= this.tracks.length ? null : this.tracks[a379];
    }
}, c.SkeletonJson = function(a380) {
    this.attachmentLoader = a380;
}, c.SkeletonJson.prototype = {
    scale: 1,
    readSkeletonData: function(a381, b181) {
        var d = new c.SkeletonData;
        d.name = b181;
        var e = a381.skeleton;
        e && (d.hash = e.hash, d.version = e.spine, d.width = e.width || 0, d.height = e.height || 0);
        for(var f = a381.bones, g = 0, h = f.length; h > g; g++){
            var i = f[g], j = null;
            if (i.parent && (j = d.findBone(i.parent), !j)) throw "Parent bone not found: " + i.parent;
            var k = new c.BoneData(i.name, j);
            k.length = (i.length || 0) * this.scale, k.x = (i.x || 0) * this.scale, k.y = (i.y || 0) * this.scale, k.rotation = i.rotation || 0, k.scaleX = i.hasOwnProperty("scaleX") ? i.scaleX : 1, k.scaleY = i.hasOwnProperty("scaleY") ? i.scaleY : 1, k.inheritScale = i.hasOwnProperty("inheritScale") ? i.inheritScale : !0, k.inheritRotation = i.hasOwnProperty("inheritRotation") ? i.inheritRotation : !0, d.bones.push(k);
        }
        var l = a381.ik;
        if (l) for(var g = 0, h = l.length; h > g; g++){
            for(var m = l[g], n = new c.IkConstraintData(m.name), f = m.bones, o = 0, p = f.length; p > o; o++){
                var q = d.findBone(f[o]);
                if (!q) throw "IK bone not found: " + f[o];
                n.bones.push(q);
            }
            if (n.target = d.findBone(m.target), !n.target) throw "Target bone not found: " + m.target;
            n.bendDirection = !m.hasOwnProperty("bendPositive") || m.bendPositive ? 1 : -1, n.mix = m.hasOwnProperty("mix") ? m.mix : 1, d.ikConstraints.push(n);
        }
        for(var r = a381.slots, g = 0, h = r.length; h > g; g++){
            var s = r[g], k = d.findBone(s.bone);
            if (!k) throw "Slot bone not found: " + s.bone;
            var t = new c.SlotData(s.name, k), u = s.color;
            u && (t.r = this.toColor(u, 0), t.g = this.toColor(u, 1), t.b = this.toColor(u, 2), t.a = this.toColor(u, 3)), t.attachmentName = s.attachment, t.additiveBlending = s.additive && "true" == s.additive, d.slots.push(t);
        }
        var v = a381.skins;
        for(var w in v)if (v.hasOwnProperty(w)) {
            var x = v[w], y = new c.Skin(w);
            for(var z in x)if (x.hasOwnProperty(z)) {
                var A = d.findSlotIndex(z), B = x[z];
                for(var C in B)if (B.hasOwnProperty(C)) {
                    var D = this.readAttachment(y, C, B[C]);
                    D && y.addAttachment(A, C, D);
                }
            }
            d.skins.push(y), "default" == y.name && (d.defaultSkin = y);
        }
        var E = a381.events;
        for(var F in E)if (E.hasOwnProperty(F)) {
            var G = E[F], H = new c.EventData(F);
            H.intValue = G["int"] || 0, H.floatValue = G["float"] || 0, H.stringValue = G.string || null, d.events.push(H);
        }
        var I = a381.animations;
        for(var J in I)I.hasOwnProperty(J) && this.readAnimation(J, I[J], d);
        return d;
    },
    readAttachment: function(a382, b182, d) {
        b182 = d.name || b182;
        var e = c.AttachmentType[d.type || "region"], f = d.path || b182, g = this.scale;
        if (e == c.AttachmentType.region) {
            var h = this.attachmentLoader.newRegionAttachment(a382, b182, f);
            if (!h) return null;
            h.path = f, h.x = (d.x || 0) * g, h.y = (d.y || 0) * g, h.scaleX = d.hasOwnProperty("scaleX") ? d.scaleX : 1, h.scaleY = d.hasOwnProperty("scaleY") ? d.scaleY : 1, h.rotation = d.rotation || 0, h.width = (d.width || 0) * g, h.height = (d.height || 0) * g;
            var i = d.color;
            return i && (h.r = this.toColor(i, 0), h.g = this.toColor(i, 1), h.b = this.toColor(i, 2), h.a = this.toColor(i, 3)), h.updateOffset(), h;
        }
        if (e == c.AttachmentType.mesh) {
            var j = this.attachmentLoader.newMeshAttachment(a382, b182, f);
            return j ? (j.path = f, j.vertices = this.getFloatArray(d, "vertices", g), j.triangles = this.getIntArray(d, "triangles"), j.regionUVs = this.getFloatArray(d, "uvs", 1), j.updateUVs(), i = d.color, i && (j.r = this.toColor(i, 0), j.g = this.toColor(i, 1), j.b = this.toColor(i, 2), j.a = this.toColor(i, 3)), j.hullLength = 2 * (d.hull || 0), d.edges && (j.edges = this.getIntArray(d, "edges")), j.width = (d.width || 0) * g, j.height = (d.height || 0) * g, j) : null;
        }
        if (e == c.AttachmentType.skinnedmesh) {
            var j = this.attachmentLoader.newSkinnedMeshAttachment(a382, b182, f);
            if (!j) return null;
            j.path = f;
            for(var k = this.getFloatArray(d, "uvs", 1), l = this.getFloatArray(d, "vertices", 1), m = [], n = [], o = 0, p = l.length; p > o;){
                var q = 0 | l[o++];
                n[n.length] = q;
                for(var r = o + 4 * q; r > o;)n[n.length] = l[o], m[m.length] = l[o + 1] * g, m[m.length] = l[o + 2] * g, m[m.length] = l[o + 3], o += 4;
            }
            return j.bones = n, j.weights = m, j.triangles = this.getIntArray(d, "triangles"), j.regionUVs = k, j.updateUVs(), i = d.color, i && (j.r = this.toColor(i, 0), j.g = this.toColor(i, 1), j.b = this.toColor(i, 2), j.a = this.toColor(i, 3)), j.hullLength = 2 * (d.hull || 0), d.edges && (j.edges = this.getIntArray(d, "edges")), j.width = (d.width || 0) * g, j.height = (d.height || 0) * g, j;
        }
        if (e == c.AttachmentType.boundingbox) {
            for(var s = this.attachmentLoader.newBoundingBoxAttachment(a382, b182), l = d.vertices, o = 0, p = l.length; p > o; o++)s.vertices.push(l[o] * g);
            return s;
        }
        throw "Unknown attachment type: " + e;
    },
    readAnimation: function(a383, b183, d) {
        var e = [], f = 0, g = b183.slots;
        for(var h in g)if (g.hasOwnProperty(h)) {
            var i = g[h], j = d.findSlotIndex(h);
            for(var k in i)if (i.hasOwnProperty(k)) {
                var l = i[k];
                if ("color" == k) {
                    var m = new c.ColorTimeline(l.length);
                    m.slotIndex = j;
                    for(var n = 0, o = 0, p = l.length; p > o; o++){
                        var q = l[o], r = q.color, s = this.toColor(r, 0), t = this.toColor(r, 1), u = this.toColor(r, 2), v = this.toColor(r, 3);
                        m.setFrame(n, q.time, s, t, u, v), this.readCurve(m, n, q), n++;
                    }
                    e.push(m), f = Math.max(f, m.frames[5 * m.getFrameCount() - 5]);
                } else {
                    if ("attachment" != k) throw "Invalid timeline type for a slot: " + k + " (" + h + ")";
                    var m = new c.AttachmentTimeline(l.length);
                    m.slotIndex = j;
                    for(var n = 0, o = 0, p = l.length; p > o; o++){
                        var q = l[o];
                        m.setFrame(n++, q.time, q.name);
                    }
                    e.push(m), f = Math.max(f, m.frames[m.getFrameCount() - 1]);
                }
            }
        }
        var w = b183.bones;
        for(var x in w)if (w.hasOwnProperty(x)) {
            var y = d.findBoneIndex(x);
            if (-1 == y) throw "Bone not found: " + x;
            var z = w[x];
            for(var k in z)if (z.hasOwnProperty(k)) {
                var l = z[k];
                if ("rotate" == k) {
                    var m = new c.RotateTimeline(l.length);
                    m.boneIndex = y;
                    for(var n = 0, o = 0, p = l.length; p > o; o++){
                        var q = l[o];
                        m.setFrame(n, q.time, q.angle), this.readCurve(m, n, q), n++;
                    }
                    e.push(m), f = Math.max(f, m.frames[2 * m.getFrameCount() - 2]);
                } else if ("translate" == k || "scale" == k) {
                    var m, A = 1;
                    "scale" == k ? m = new c.ScaleTimeline(l.length) : (m = new c.TranslateTimeline(l.length), A = this.scale), m.boneIndex = y;
                    for(var n = 0, o = 0, p = l.length; p > o; o++){
                        var q = l[o], B = (q.x || 0) * A, C = (q.y || 0) * A;
                        m.setFrame(n, q.time, B, C), this.readCurve(m, n, q), n++;
                    }
                    e.push(m), f = Math.max(f, m.frames[3 * m.getFrameCount() - 3]);
                } else {
                    if ("flipX" != k && "flipY" != k) throw "Invalid timeline type for a bone: " + k + " (" + x + ")";
                    var B = "flipX" == k, m = B ? new c.FlipXTimeline(l.length) : new c.FlipYTimeline(l.length);
                    m.boneIndex = y;
                    for(var D = B ? "x" : "y", n = 0, o = 0, p = l.length; p > o; o++){
                        var q = l[o];
                        m.setFrame(n, q.time, q[D] || !1), n++;
                    }
                    e.push(m), f = Math.max(f, m.frames[2 * m.getFrameCount() - 2]);
                }
            }
        }
        var E = b183.ik;
        for(var F in E)if (E.hasOwnProperty(F)) {
            var G = d.findIkConstraint(F), l = E[F], m = new c.IkConstraintTimeline(l.length);
            m.ikConstraintIndex = d.ikConstraints.indexOf(G);
            for(var n = 0, o = 0, p = l.length; p > o; o++){
                var q = l[o], H = q.hasOwnProperty("mix") ? q.mix : 1, I = !q.hasOwnProperty("bendPositive") || q.bendPositive ? 1 : -1;
                m.setFrame(n, q.time, H, I), this.readCurve(m, n, q), n++;
            }
            e.push(m), f = Math.max(f, m.frames[3 * m.frameCount - 3]);
        }
        var J = b183.ffd;
        for(var K in J){
            var L = d.findSkin(K), i = J[K];
            for(h in i){
                var j = d.findSlotIndex(h), M = i[h];
                for(var N in M){
                    var l = M[N], m = new c.FfdTimeline(l.length), O = L.getAttachment(j, N);
                    if (!O) throw "FFD attachment not found: " + N;
                    m.slotIndex = j, m.attachment = O;
                    var P, Q = O.type == c.AttachmentType.mesh;
                    P = Q ? O.vertices.length : O.weights.length / 3 * 2;
                    for(var n = 0, o = 0, p = l.length; p > o; o++){
                        var R, q = l[o];
                        if (q.vertices) {
                            var S = q.vertices, R = [];
                            R.length = P;
                            var T = q.offset || 0, U = S.length;
                            if (1 == this.scale) for(var V = 0; U > V; V++)R[V + T] = S[V];
                            else for(var V = 0; U > V; V++)R[V + T] = S[V] * this.scale;
                            if (Q) for(var W = O.vertices, V = 0, U = R.length; U > V; V++)R[V] += W[V];
                        } else Q ? R = O.vertices : (R = [], R.length = P);
                        m.setFrame(n, q.time, R), this.readCurve(m, n, q), n++;
                    }
                    e[e.length] = m, f = Math.max(f, m.frames[m.frameCount - 1]);
                }
            }
        }
        var X = b183.drawOrder;
        if (X || (X = b183.draworder), X) {
            for(var m = new c.DrawOrderTimeline(X.length), Y = d.slots.length, n = 0, o = 0, p = X.length; p > o; o++){
                var Z = X[o], $ = null;
                if (Z.offsets) {
                    $ = [], $.length = Y;
                    for(var V = Y - 1; V >= 0; V--)$[V] = -1;
                    var _ = Z.offsets, aa = [];
                    aa.length = Y - _.length;
                    for(var ba = 0, ca = 0, V = 0, U = _.length; U > V; V++){
                        var da = _[V], j = d.findSlotIndex(da.slot);
                        if (-1 == j) throw "Slot not found: " + da.slot;
                        for(; ba != j;)aa[ca++] = ba++;
                        $[ba + da.offset] = ba++;
                    }
                    for(; Y > ba;)aa[ca++] = ba++;
                    for(var V = Y - 1; V >= 0; V--)-1 == $[V] && ($[V] = aa[--ca]);
                }
                m.setFrame(n++, Z.time, $);
            }
            e.push(m), f = Math.max(f, m.frames[m.getFrameCount() - 1]);
        }
        var ea = b183.events;
        if (ea) {
            for(var m = new c.EventTimeline(ea.length), n = 0, o = 0, p = ea.length; p > o; o++){
                var fa = ea[o], ga = d.findEvent(fa.name);
                if (!ga) throw "Event not found: " + fa.name;
                var ha = new c.Event(ga);
                ha.intValue = fa.hasOwnProperty("int") ? fa["int"] : ga.intValue, ha.floatValue = fa.hasOwnProperty("float") ? fa["float"] : ga.floatValue, ha.stringValue = fa.hasOwnProperty("string") ? fa.string : ga.stringValue, m.setFrame(n++, fa.time, ha);
            }
            e.push(m), f = Math.max(f, m.frames[m.getFrameCount() - 1]);
        }
        d.animations.push(new c.Animation(a383, e, f));
    },
    readCurve: function(a384, b184, c218) {
        var d = c218.curve;
        d ? "stepped" == d ? a384.curves.setStepped(b184) : d instanceof Array && a384.curves.setCurve(b184, d[0], d[1], d[2], d[3]) : a384.curves.setLinear(b184);
    },
    toColor: function(a385, b185) {
        if (8 != a385.length) throw "Color hexidecimal length must be 8, recieved: " + a385;
        return parseInt(a385.substring(2 * b185, 2 * b185 + 2), 16) / 255;
    },
    getFloatArray: function(a386, b, d) {
        var e = a386[b], f = new c.Float32Array(e.length), g = 0, h = e.length;
        if (1 == d) for(; h > g; g++)f[g] = e[g];
        else for(; h > g; g++)f[g] = e[g] * d;
        return f;
    },
    getIntArray: function(a387, b) {
        for(var d = a387[b], e = new c.Uint16Array(d.length), f = 0, g = d.length; g > f; f++)e[f] = 0 | d[f];
        return e;
    }
}, c.Atlas = function(a388, b186) {
    this.textureLoader = b186, this.pages = [], this.regions = [];
    var d = new c.AtlasReader(a388), e = [];
    e.length = 4;
    for(var f = null;;){
        var g = d.readLine();
        if (null === g) break;
        if (g = d.trim(g), g.length) {
            if (f) {
                var h = new c.AtlasRegion;
                h.name = g, h.page = f, h.rotate = "true" == d.readValue(), d.readTuple(e);
                var i = parseInt(e[0]), j = parseInt(e[1]);
                d.readTuple(e);
                var k = parseInt(e[0]), l = parseInt(e[1]);
                h.u = i / f.width, h.v = j / f.height, h.rotate ? (h.u2 = (i + l) / f.width, h.v2 = (j + k) / f.height) : (h.u2 = (i + k) / f.width, h.v2 = (j + l) / f.height), h.x = i, h.y = j, h.width = Math.abs(k), h.height = Math.abs(l), 4 == d.readTuple(e) && (h.splits = [
                    parseInt(e[0]),
                    parseInt(e[1]),
                    parseInt(e[2]),
                    parseInt(e[3])
                ], 4 == d.readTuple(e) && (h.pads = [
                    parseInt(e[0]),
                    parseInt(e[1]),
                    parseInt(e[2]),
                    parseInt(e[3])
                ], d.readTuple(e))), h.originalWidth = parseInt(e[0]), h.originalHeight = parseInt(e[1]), d.readTuple(e), h.offsetX = parseInt(e[0]), h.offsetY = parseInt(e[1]), h.index = parseInt(d.readValue()), this.regions.push(h);
            } else {
                f = new c.AtlasPage, f.name = g, 2 == d.readTuple(e) && (f.width = parseInt(e[0]), f.height = parseInt(e[1]), d.readTuple(e)), f.format = c.Atlas.Format[e[0]], d.readTuple(e), f.minFilter = c.Atlas.TextureFilter[e[0]], f.magFilter = c.Atlas.TextureFilter[e[1]];
                var m = d.readValue();
                f.uWrap = c.Atlas.TextureWrap.clampToEdge, f.vWrap = c.Atlas.TextureWrap.clampToEdge, "x" == m ? f.uWrap = c.Atlas.TextureWrap.repeat : "y" == m ? f.vWrap = c.Atlas.TextureWrap.repeat : "xy" == m && (f.uWrap = f.vWrap = c.Atlas.TextureWrap.repeat), b186.load(f, g, this), this.pages.push(f);
            }
        } else f = null;
    }
}, c.Atlas.prototype = {
    findRegion: function(a389) {
        for(var b187 = this.regions, c219 = 0, d = b187.length; d > c219; c219++)if (b187[c219].name == a389) return b187[c219];
        return null;
    },
    dispose: function() {
        for(var a390 = this.pages, b188 = 0, c220 = a390.length; c220 > b188; b188++)this.textureLoader.unload(a390[b188].rendererObject);
    },
    updateUVs: function(a391) {
        for(var b189 = this.regions, c221 = 0, d = b189.length; d > c221; c221++){
            var e = b189[c221];
            e.page == a391 && (e.u = e.x / a391.width, e.v = e.y / a391.height, e.rotate ? (e.u2 = (e.x + e.height) / a391.width, e.v2 = (e.y + e.width) / a391.height) : (e.u2 = (e.x + e.width) / a391.width, e.v2 = (e.y + e.height) / a391.height));
        }
    }
}, c.Atlas.Format = {
    alpha: 0,
    intensity: 1,
    luminanceAlpha: 2,
    rgb565: 3,
    rgba4444: 4,
    rgb888: 5,
    rgba8888: 6
}, c.Atlas.TextureFilter = {
    nearest: 0,
    linear: 1,
    mipMap: 2,
    mipMapNearestNearest: 3,
    mipMapLinearNearest: 4,
    mipMapNearestLinear: 5,
    mipMapLinearLinear: 6
}, c.Atlas.TextureWrap = {
    mirroredRepeat: 0,
    clampToEdge: 1,
    repeat: 2
}, c.AtlasPage = function() {
}, c.AtlasPage.prototype = {
    name: null,
    format: null,
    minFilter: null,
    magFilter: null,
    uWrap: null,
    vWrap: null,
    rendererObject: null,
    width: 0,
    height: 0
}, c.AtlasRegion = function() {
}, c.AtlasRegion.prototype = {
    page: null,
    name: null,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    u: 0,
    v: 0,
    u2: 0,
    v2: 0,
    offsetX: 0,
    offsetY: 0,
    originalWidth: 0,
    originalHeight: 0,
    index: 0,
    rotate: !1,
    splits: null,
    pads: null
}, c.AtlasReader = function(a392) {
    this.lines = a392.split(/\r\n|\r|\n/);
}, c.AtlasReader.prototype = {
    index: 0,
    trim: function(a393) {
        return a393.replace(/^\s+|\s+$/g, "");
    },
    readLine: function() {
        return this.index >= this.lines.length ? null : this.lines[this.index++];
    },
    readValue: function() {
        var a394 = this.readLine(), b190 = a394.indexOf(":");
        if (-1 == b190) throw "Invalid line: " + a394;
        return this.trim(a394.substring(b190 + 1));
    },
    readTuple: function(a395) {
        var b191 = this.readLine(), c222 = b191.indexOf(":");
        if (-1 == c222) throw "Invalid line: " + b191;
        for(var d = 0, e = c222 + 1; 3 > d; d++){
            var f = b191.indexOf(",", e);
            if (-1 == f) break;
            a395[d] = this.trim(b191.substr(e, f - e)), e = f + 1;
        }
        return a395[d] = this.trim(b191.substring(e)), d + 1;
    }
}, c.AtlasAttachmentLoader = function(a396) {
    this.atlas = a396;
}, c.AtlasAttachmentLoader.prototype = {
    newRegionAttachment: function(a, b192, d) {
        var e = this.atlas.findRegion(d);
        if (!e) throw "Region not found in atlas: " + d + " (region attachment: " + b192 + ")";
        var f = new c.RegionAttachment(b192);
        return f.rendererObject = e, f.setUVs(e.u, e.v, e.u2, e.v2, e.rotate), f.regionOffsetX = e.offsetX, f.regionOffsetY = e.offsetY, f.regionWidth = e.width, f.regionHeight = e.height, f.regionOriginalWidth = e.originalWidth, f.regionOriginalHeight = e.originalHeight, f;
    },
    newMeshAttachment: function(a, b193, d) {
        var e = this.atlas.findRegion(d);
        if (!e) throw "Region not found in atlas: " + d + " (mesh attachment: " + b193 + ")";
        var f = new c.MeshAttachment(b193);
        return f.rendererObject = e, f.regionU = e.u, f.regionV = e.v, f.regionU2 = e.u2, f.regionV2 = e.v2, f.regionRotate = e.rotate, f.regionOffsetX = e.offsetX, f.regionOffsetY = e.offsetY, f.regionWidth = e.width, f.regionHeight = e.height, f.regionOriginalWidth = e.originalWidth, f.regionOriginalHeight = e.originalHeight, f;
    },
    newSkinnedMeshAttachment: function(a, b194, d) {
        var e = this.atlas.findRegion(d);
        if (!e) throw "Region not found in atlas: " + d + " (skinned mesh attachment: " + b194 + ")";
        var f = new c.SkinnedMeshAttachment(b194);
        return f.rendererObject = e, f.regionU = e.u, f.regionV = e.v, f.regionU2 = e.u2, f.regionV2 = e.v2, f.regionRotate = e.rotate, f.regionOffsetX = e.offsetX, f.regionOffsetY = e.offsetY, f.regionWidth = e.width, f.regionHeight = e.height, f.regionOriginalWidth = e.originalWidth, f.regionOriginalHeight = e.originalHeight, f;
    },
    newBoundingBoxAttachment: function(a, b195) {
        return new c.BoundingBoxAttachment(b195);
    }
}, c.SkeletonBounds = function() {
    this.polygonPool = [], this.polygons = [], this.boundingBoxes = [];
}, c.SkeletonBounds.prototype = {
    minX: 0,
    minY: 0,
    maxX: 0,
    maxY: 0,
    update: function(a397, b196) {
        var d = a397.slots, e = d.length, f = a397.x, g = a397.y, h = this.boundingBoxes, i = this.polygonPool, j = this.polygons;
        h.length = 0;
        for(var k = 0, l = j.length; l > k; k++)i.push(j[k]);
        j.length = 0;
        for(var k = 0; e > k; k++){
            var m = d[k], n = m.attachment;
            if (n.type == c.AttachmentType.boundingbox) {
                h.push(n);
                var o, p = i.length;
                p > 0 ? (o = i[p - 1], i.splice(p - 1, 1)) : o = [], j.push(o), o.length = n.vertices.length, n.computeWorldVertices(f, g, m.bone, o);
            }
        }
        b196 && this.aabbCompute();
    },
    aabbCompute: function() {
        for(var a398 = this.polygons, b197 = Number.MAX_VALUE, c223 = Number.MAX_VALUE, d = Number.MIN_VALUE, e = Number.MIN_VALUE, f = 0, g = a398.length; g > f; f++)for(var h = a398[f], i = 0, j = h.length; j > i; i += 2){
            var k = h[i], l = h[i + 1];
            b197 = Math.min(b197, k), c223 = Math.min(c223, l), d = Math.max(d, k), e = Math.max(e, l);
        }
        this.minX = b197, this.minY = c223, this.maxX = d, this.maxY = e;
    },
    aabbContainsPoint: function(a399, b198) {
        return a399 >= this.minX && a399 <= this.maxX && b198 >= this.minY && b198 <= this.maxY;
    },
    aabbIntersectsSegment: function(a400, b199, c224, d) {
        var e = this.minX, f = this.minY, g = this.maxX, h = this.maxY;
        if (e >= a400 && e >= c224 || f >= b199 && f >= d || a400 >= g && c224 >= g || b199 >= h && d >= h) return !1;
        var i = (d - b199) / (c224 - a400), j = i * (e - a400) + b199;
        if (j > f && h > j) return !0;
        if (j = i * (g - a400) + b199, j > f && h > j) return !0;
        var k = (f - b199) / i + a400;
        return k > e && g > k ? !0 : (k = (h - b199) / i + a400, k > e && g > k ? !0 : !1);
    },
    aabbIntersectsSkeleton: function(a401) {
        return this.minX < a401.maxX && this.maxX > a401.minX && this.minY < a401.maxY && this.maxY > a401.minY;
    },
    containsPoint: function(a402, b200) {
        for(var c225 = this.polygons, d = 0, e = c225.length; e > d; d++)if (this.polygonContainsPoint(c225[d], a402, b200)) return this.boundingBoxes[d];
        return null;
    },
    intersectsSegment: function(a403, b201, c226, d) {
        for(var e = this.polygons, f = 0, g = e.length; g > f; f++)if (e[f].intersectsSegment(a403, b201, c226, d)) return this.boundingBoxes[f];
        return null;
    },
    polygonContainsPoint: function(a404, b202, c227) {
        for(var d = a404.length, e = d - 2, f = !1, g = 0; d > g; g += 2){
            var h = a404[g + 1], i = a404[e + 1];
            if (c227 > h && i >= c227 || c227 > i && h >= c227) {
                var j = a404[g];
                j + (c227 - h) / (i - h) * (a404[e] - j) < b202 && (f = !f);
            }
            e = g;
        }
        return f;
    },
    polygonIntersectsSegment: function(a405, b203, c228, d, e) {
        for(var f = a405.length, g = b203 - d, h = c228 - e, i = b203 * e - c228 * d, j = a405[f - 2], k = a405[f - 1], l = 0; f > l; l += 2){
            var m = a405[l], n = a405[l + 1], o = j * n - k * m, p = j - m, q = k - n, r = g * q - h * p, s = (i * p - g * o) / r;
            if ((s >= j && m >= s || s >= m && j >= s) && (s >= b203 && d >= s || s >= d && b203 >= s)) {
                var t = (i * q - h * o) / r;
                if ((t >= k && n >= t || t >= n && k >= t) && (t >= c228 && e >= t || t >= e && c228 >= t)) return !0;
            }
            j = m, k = n;
        }
        return !1;
    },
    getPolygon: function(a406) {
        var b204 = this.boundingBoxes.indexOf(a406);
        return -1 == b204 ? null : this.polygons[b204];
    },
    getWidth: function() {
        return this.maxX - this.minX;
    },
    getHeight: function() {
        return this.maxY - this.minY;
    }
}, c.Bone.yDown = !0, b.AnimCache = {
}, b.SpineTextureLoader = function(a407, c229) {
    b.EventTarget.call(this), this.basePath = a407, this.crossorigin = c229, this.loadingCount = 0;
}, b.SpineTextureLoader.prototype = b.SpineTextureLoader, b.SpineTextureLoader.prototype.load = function(a408, c230) {
    if (a408.rendererObject = b.BaseTexture.fromImage(this.basePath + "/" + c230, this.crossorigin), !a408.rendererObject.hasLoaded) {
        var d = this;
        ++d.loadingCount, a408.rendererObject.addEventListener("loaded", function() {
            --d.loadingCount, d.dispatchEvent({
                type: "loadedBaseTexture",
                content: d
            });
        });
    }
}, b.SpineTextureLoader.prototype.unload = function(a409) {
    a409.destroy(!0);
}, b.Spine = function(a410) {
    if (b.DisplayObjectContainer.call(this), this.spineData = b.AnimCache[a410], !this.spineData) throw new Error("Spine data must be preloaded using PIXI.SpineLoader or PIXI.AssetLoader: " + a410);
    this.skeleton = new c.Skeleton(this.spineData), this.skeleton.updateWorldTransform(), this.stateData = new c.AnimationStateData(this.spineData), this.state = new c.AnimationState(this.stateData), this.slotContainers = [];
    for(var d = 0, e = this.skeleton.slots.length; e > d; d++){
        var f = this.skeleton.slots[d], g = f.attachment, h = new b.DisplayObjectContainer;
        if (this.slotContainers.push(h), this.addChild(h), g instanceof c.RegionAttachment) {
            var i = g.rendererObject.name, j = this.createSprite(f, g);
            f.currentSprite = j, f.currentSpriteName = i, h.addChild(j);
        } else {
            if (!(g instanceof c.MeshAttachment)) continue;
            var k = this.createMesh(f, g);
            f.currentMesh = k, f.currentMeshName = g.name, h.addChild(k);
        }
    }
    this.autoUpdate = !0;
}, b.Spine.prototype = Object.create(b.DisplayObjectContainer.prototype), b.Spine.prototype.constructor = b.Spine, Object.defineProperty(b.Spine.prototype, "autoUpdate", {
    get: function() {
        return this.updateTransform === b.Spine.prototype.autoUpdateTransform;
    },
    set: function(a411) {
        this.updateTransform = a411 ? b.Spine.prototype.autoUpdateTransform : b.DisplayObjectContainer.prototype.updateTransform;
    }
}), b.Spine.prototype.update = function(a412) {
    this.state.update(a412), this.state.apply(this.skeleton), this.skeleton.updateWorldTransform();
    for(var d = this.skeleton.drawOrder, e = this.skeleton.slots, f = 0, g = d.length; g > f; f++)this.children[f] = this.slotContainers[d[f]];
    for(f = 0, g = e.length; g > f; f++){
        var h = e[f], i = h.attachment, j = this.slotContainers[f];
        if (i) {
            var k = i.type;
            if (k === c.AttachmentType.region) {
                if (i.rendererObject && (!h.currentSpriteName || h.currentSpriteName !== i.name)) {
                    var l = i.rendererObject.name;
                    if (void 0 !== h.currentSprite && (h.currentSprite.visible = !1), h.sprites = h.sprites || {
                    }, void 0 !== h.sprites[l]) h.sprites[l].visible = !0;
                    else {
                        var m = this.createSprite(h, i);
                        j.addChild(m);
                    }
                    h.currentSprite = h.sprites[l], h.currentSpriteName = l;
                }
                var n = h.bone;
                j.position.x = n.worldX + i.x * n.m00 + i.y * n.m01, j.position.y = n.worldY + i.x * n.m10 + i.y * n.m11, j.scale.x = n.worldScaleX, j.scale.y = n.worldScaleY, j.rotation = -(h.bone.worldRotation * c.degRad), h.currentSprite.tint = b.rgb2hex([
                    h.r,
                    h.g,
                    h.b
                ]);
            } else {
                if (k !== c.AttachmentType.skinnedmesh) {
                    j.visible = !1;
                    continue;
                }
                if (!h.currentMeshName || h.currentMeshName !== i.name) {
                    var o = i.name;
                    if (void 0 !== h.currentMesh && (h.currentMesh.visible = !1), h.meshes = h.meshes || {
                    }, void 0 !== h.meshes[o]) h.meshes[o].visible = !0;
                    else {
                        var p = this.createMesh(h, i);
                        j.addChild(p);
                    }
                    h.currentMesh = h.meshes[o], h.currentMeshName = o;
                }
                i.computeWorldVertices(h.bone.skeleton.x, h.bone.skeleton.y, h, h.currentMesh.vertices);
            }
            j.visible = !0, j.alpha = h.a;
        } else j.visible = !1;
    }
}, b.Spine.prototype.autoUpdateTransform = function() {
    this.lastTime = this.lastTime || Date.now();
    var a413 = 0.001 * (Date.now() - this.lastTime);
    this.lastTime = Date.now(), this.update(a413), b.DisplayObjectContainer.prototype.updateTransform.call(this);
}, b.Spine.prototype.createSprite = function(a414, d) {
    var e = d.rendererObject, f = e.page.rendererObject, g = new b.Rectangle(e.x, e.y, e.rotate ? e.height : e.width, e.rotate ? e.width : e.height), h = new b.Texture(f, g), i = new b.Sprite(h), j = e.rotate ? 0.5 * Math.PI : 0;
    return i.scale.set(e.width / e.originalWidth, e.height / e.originalHeight), i.rotation = j - d.rotation * c.degRad, i.anchor.x = i.anchor.y = 0.5, a414.sprites = a414.sprites || {
    }, a414.sprites[e.name] = i, i;
}, b.Spine.prototype.createMesh = function(a415, c231) {
    var d = c231.rendererObject, e = d.page.rendererObject, f = new b.Texture(e), g = new b.Strip(f);
    return g.drawMode = b.Strip.DrawModes.TRIANGLES, g.canvasPadding = 1.5, g.vertices = new b.Float32Array(c231.uvs.length), g.uvs = c231.uvs, g.indices = c231.triangles, a415.meshes = a415.meshes || {
    }, a415.meshes[c231.name] = g, g;
}, b.BaseTextureCache = {
}, b.BaseTextureCacheIdGenerator = 0, b.BaseTexture = function(a416, c232) {
    if (this.resolution = 1, this.width = 100, this.height = 100, this.scaleMode = c232 || b.scaleModes.DEFAULT, this.hasLoaded = !1, this.source = a416, this._UID = b._UID++, this.premultipliedAlpha = !0, this._glTextures = [], this.mipmap = !1, this._dirty = [
        !0,
        !0,
        !0,
        !0
    ], a416) {
        if ((this.source.complete || this.source.getContext) && this.source.width && this.source.height) this.hasLoaded = !0, this.width = this.source.naturalWidth || this.source.width, this.height = this.source.naturalHeight || this.source.height, this.dirty();
        else {
            var d = this;
            this.source.onload = function() {
                d.hasLoaded = !0, d.width = d.source.naturalWidth || d.source.width, d.height = d.source.naturalHeight || d.source.height, d.dirty(), d.dispatchEvent({
                    type: "loaded",
                    content: d
                });
            }, this.source.onerror = function() {
                d.dispatchEvent({
                    type: "error",
                    content: d
                });
            };
        }
        this.imageUrl = null, this._powerOf2 = !1;
    }
}, b.BaseTexture.prototype.constructor = b.BaseTexture, b.EventTarget.mixin(b.BaseTexture.prototype), b.BaseTexture.prototype.destroy = function() {
    this.imageUrl ? (delete b.BaseTextureCache[this.imageUrl], delete b.TextureCache[this.imageUrl], this.imageUrl = null, navigator.isCocoonJS || (this.source.src = "")) : this.source && this.source._pixiId && delete b.BaseTextureCache[this.source._pixiId], this.source = null, this.unloadFromGPU();
}, b.BaseTexture.prototype.updateSourceImage = function(a417) {
    this.hasLoaded = !1, this.source.src = null, this.source.src = a417;
}, b.BaseTexture.prototype.dirty = function() {
    for(var a418 = 0; a418 < this._glTextures.length; a418++)this._dirty[a418] = !0;
}, b.BaseTexture.prototype.unloadFromGPU = function() {
    this.dirty();
    for(var a419 = this._glTextures.length - 1; a419 >= 0; a419--){
        var c233 = this._glTextures[a419], d = b.glContexts[a419];
        d && c233 && d.deleteTexture(c233);
    }
    this._glTextures.length = 0, this.dirty();
}, b.BaseTexture.fromImage = function(a420, c234, d) {
    var e = b.BaseTextureCache[a420];
    if (void 0 === c234 && -1 === a420.indexOf("data:") && (c234 = !0), !e) {
        var f = new Image;
        c234 && (f.crossOrigin = ""), f.src = a420, e = new b.BaseTexture(f, d), e.imageUrl = a420, b.BaseTextureCache[a420] = e, -1 !== a420.indexOf(b.RETINA_PREFIX + ".") && (e.resolution = 2);
    }
    return e;
}, b.BaseTexture.fromCanvas = function(a421, c235) {
    a421._pixiId || (a421._pixiId = "canvas_" + b.TextureCacheIdGenerator++);
    var d = b.BaseTextureCache[a421._pixiId];
    return d || (d = new b.BaseTexture(a421, c235), b.BaseTextureCache[a421._pixiId] = d), d;
}, b.TextureCache = {
}, b.FrameCache = {
}, b.TextureCacheIdGenerator = 0, b.Texture = function(a422, c236, d, e) {
    this.noFrame = !1, c236 || (this.noFrame = !0, c236 = new b.Rectangle(0, 0, 1, 1)), a422 instanceof b.Texture && (a422 = a422.baseTexture), this.baseTexture = a422, this.frame = c236, this.trim = e, this.valid = !1, this.requiresUpdate = !1, this._uvs = null, this.width = 0, this.height = 0, this.crop = d || new b.Rectangle(0, 0, 1, 1), a422.hasLoaded ? (this.noFrame && (c236 = new b.Rectangle(0, 0, a422.width, a422.height)), this.setFrame(c236)) : a422.addEventListener("loaded", this.onBaseTextureLoaded.bind(this));
}, b.Texture.prototype.constructor = b.Texture, b.EventTarget.mixin(b.Texture.prototype), b.Texture.prototype.onBaseTextureLoaded = function() {
    var a423 = this.baseTexture;
    a423.removeEventListener("loaded", this.onLoaded), this.noFrame && (this.frame = new b.Rectangle(0, 0, a423.width, a423.height)), this.setFrame(this.frame), this.dispatchEvent({
        type: "update",
        content: this
    });
}, b.Texture.prototype.destroy = function(a424) {
    a424 && this.baseTexture.destroy(), this.valid = !1;
}, b.Texture.prototype.setFrame = function(a425) {
    if (this.noFrame = !1, this.frame = a425, this.width = a425.width, this.height = a425.height, this.crop.x = a425.x, this.crop.y = a425.y, this.crop.width = a425.width, this.crop.height = a425.height, !this.trim && (a425.x + a425.width > this.baseTexture.width || a425.y + a425.height > this.baseTexture.height)) throw new Error("Texture Error: frame does not fit inside the base Texture dimensions " + this);
    this.valid = a425 && a425.width && a425.height && this.baseTexture.source && this.baseTexture.hasLoaded, this.trim && (this.width = this.trim.width, this.height = this.trim.height, this.frame.width = this.trim.width, this.frame.height = this.trim.height), this.valid && this._updateUvs();
}, b.Texture.prototype._updateUvs = function() {
    this._uvs || (this._uvs = new b.TextureUvs);
    var a426 = this.crop, c237 = this.baseTexture.width, d = this.baseTexture.height;
    this._uvs.x0 = a426.x / c237, this._uvs.y0 = a426.y / d, this._uvs.x1 = (a426.x + a426.width) / c237, this._uvs.y1 = a426.y / d, this._uvs.x2 = (a426.x + a426.width) / c237, this._uvs.y2 = (a426.y + a426.height) / d, this._uvs.x3 = a426.x / c237, this._uvs.y3 = (a426.y + a426.height) / d;
}, b.Texture.fromImage = function(a427, c238, d) {
    var e = b.TextureCache[a427];
    return e || (e = new b.Texture(b.BaseTexture.fromImage(a427, c238, d)), b.TextureCache[a427] = e), e;
}, b.Texture.fromFrame = function(a428) {
    var c239 = b.TextureCache[a428];
    if (!c239) throw new Error('The frameId "' + a428 + '" does not exist in the texture cache ');
    return c239;
}, b.Texture.fromCanvas = function(a429, c240) {
    var d = b.BaseTexture.fromCanvas(a429, c240);
    return new b.Texture(d);
}, b.Texture.addTextureToCache = function(a430, c) {
    b.TextureCache[c] = a430;
}, b.Texture.removeTextureFromCache = function(a) {
    var c241 = b.TextureCache[a];
    return delete b.TextureCache[a], delete b.BaseTextureCache[a], c241;
}, b.TextureUvs = function() {
    this.x0 = 0, this.y0 = 0, this.x1 = 0, this.y1 = 0, this.x2 = 0, this.y2 = 0, this.x3 = 0, this.y3 = 0;
}, b.Texture.emptyTexture = new b.Texture(new b.BaseTexture), b.RenderTexture = function(a431, c242, d, e, f) {
    if (this.width = a431 || 100, this.height = c242 || 100, this.resolution = f || 1, this.frame = new b.Rectangle(0, 0, this.width * this.resolution, this.height * this.resolution), this.crop = new b.Rectangle(0, 0, this.width * this.resolution, this.height * this.resolution), this.baseTexture = new b.BaseTexture, this.baseTexture.width = this.width * this.resolution, this.baseTexture.height = this.height * this.resolution, this.baseTexture._glTextures = [], this.baseTexture.resolution = this.resolution, this.baseTexture.scaleMode = e || b.scaleModes.DEFAULT, this.baseTexture.hasLoaded = !0, b.Texture.call(this, this.baseTexture, new b.Rectangle(0, 0, this.width * this.resolution, this.height * this.resolution)), this.renderer = d || b.defaultRenderer, this.renderer.type === b.WEBGL_RENDERER) {
        var g = this.renderer.gl;
        this.baseTexture._dirty[g.id] = !1, this.textureBuffer = new b.FilterTexture(g, this.width, this.height, this.baseTexture.scaleMode), this.baseTexture._glTextures[g.id] = this.textureBuffer.texture, this.render = this.renderWebGL, this.projection = new b.Point(0.5 * this.width, 0.5 * -this.height);
    } else this.render = this.renderCanvas, this.textureBuffer = new b.CanvasBuffer(this.width * this.resolution, this.height * this.resolution), this.baseTexture.source = this.textureBuffer.canvas;
    this.valid = !0, this._updateUvs();
}, b.RenderTexture.prototype = Object.create(b.Texture.prototype), b.RenderTexture.prototype.constructor = b.RenderTexture, b.RenderTexture.prototype.resize = function(a432, c243, d) {
    (a432 !== this.width || c243 !== this.height) && (this.valid = a432 > 0 && c243 > 0, this.width = a432, this.height = c243, this.frame.width = this.crop.width = a432 * this.resolution, this.frame.height = this.crop.height = c243 * this.resolution, d && (this.baseTexture.width = this.width * this.resolution, this.baseTexture.height = this.height * this.resolution), this.renderer.type === b.WEBGL_RENDERER && (this.projection.x = this.width / 2, this.projection.y = -this.height / 2), this.valid && this.textureBuffer.resize(this.width, this.height));
}, b.RenderTexture.prototype.clear = function() {
    this.valid && (this.renderer.type === b.WEBGL_RENDERER && this.renderer.gl.bindFramebuffer(this.renderer.gl.FRAMEBUFFER, this.textureBuffer.frameBuffer), this.textureBuffer.clear());
}, b.RenderTexture.prototype.renderWebGL = function(a433, b205, c244) {
    if (this.valid) {
        var d = a433.worldTransform;
        d.identity(), d.translate(0, 2 * this.projection.y), b205 && d.append(b205), d.scale(1, -1), a433.worldAlpha = 1;
        for(var e = a433.children, f = 0, g = e.length; g > f; f++)e[f].updateTransform();
        var h = this.renderer.gl;
        h.viewport(0, 0, this.width * this.resolution, this.height * this.resolution), h.bindFramebuffer(h.FRAMEBUFFER, this.textureBuffer.frameBuffer), c244 && this.textureBuffer.clear(), this.renderer.spriteBatch.dirty = !0, this.renderer.renderDisplayObject(a433, this.projection, this.textureBuffer.frameBuffer), this.renderer.spriteBatch.dirty = !0;
    }
}, b.RenderTexture.prototype.renderCanvas = function(a434, b206, c245) {
    if (this.valid) {
        var d = a434.worldTransform;
        d.identity(), b206 && d.append(b206), a434.worldAlpha = 1;
        for(var e = a434.children, f = 0, g = e.length; g > f; f++)e[f].updateTransform();
        c245 && this.textureBuffer.clear();
        var h = this.textureBuffer.context, i = this.renderer.resolution;
        this.renderer.resolution = this.resolution, this.renderer.renderDisplayObject(a434, h), this.renderer.resolution = i;
    }
}, b.RenderTexture.prototype.getImage = function() {
    var a435 = new Image;
    return a435.src = this.getBase64(), a435;
}, b.RenderTexture.prototype.getBase64 = function() {
    return this.getCanvas().toDataURL();
}, b.RenderTexture.prototype.getCanvas = function() {
    if (this.renderer.type === b.WEBGL_RENDERER) {
        var a436 = this.renderer.gl, c246 = this.textureBuffer.width, d = this.textureBuffer.height, e = new Uint8Array(4 * c246 * d);
        a436.bindFramebuffer(a436.FRAMEBUFFER, this.textureBuffer.frameBuffer), a436.readPixels(0, 0, c246, d, a436.RGBA, a436.UNSIGNED_BYTE, e), a436.bindFramebuffer(a436.FRAMEBUFFER, null);
        var f = new b.CanvasBuffer(c246, d), g = f.context.getImageData(0, 0, c246, d);
        return g.data.set(e), f.context.putImageData(g, 0, 0), f.canvas;
    }
    return this.textureBuffer.canvas;
}, b.RenderTexture.tempMatrix = new b.Matrix, b.VideoTexture = function(a437, c247) {
    if (!a437) throw new Error("No video source element specified.");
    (a437.readyState === a437.HAVE_ENOUGH_DATA || a437.readyState === a437.HAVE_FUTURE_DATA) && a437.width && a437.height && (a437.complete = !0), b.BaseTexture.call(this, a437, c247), this.autoUpdate = !1, this.updateBound = this._onUpdate.bind(this), a437.complete || (this._onCanPlay = this.onCanPlay.bind(this), a437.addEventListener("canplay", this._onCanPlay), a437.addEventListener("canplaythrough", this._onCanPlay), a437.addEventListener("play", this.onPlayStart.bind(this)), a437.addEventListener("pause", this.onPlayStop.bind(this)));
}, b.VideoTexture.prototype = Object.create(b.BaseTexture.prototype), b.VideoTexture.constructor = b.VideoTexture, b.VideoTexture.prototype._onUpdate = function() {
    this.autoUpdate && (window.requestAnimationFrame(this.updateBound), this.dirty());
}, b.VideoTexture.prototype.onPlayStart = function() {
    this.autoUpdate || (window.requestAnimationFrame(this.updateBound), this.autoUpdate = !0);
}, b.VideoTexture.prototype.onPlayStop = function() {
    this.autoUpdate = !1;
}, b.VideoTexture.prototype.onCanPlay = function() {
    "canplaythrough" === event.type && (this.hasLoaded = !0, this.source && (this.source.removeEventListener("canplay", this._onCanPlay), this.source.removeEventListener("canplaythrough", this._onCanPlay), this.width = this.source.videoWidth, this.height = this.source.videoHeight, this.__loaded || (this.__loaded = !0, this.dispatchEvent({
        type: "loaded",
        content: this
    }))));
}, b.VideoTexture.prototype.destroy = function() {
    this.source && this.source._pixiId && (b.BaseTextureCache[this.source._pixiId] = null, delete b.BaseTextureCache[this.source._pixiId], this.source._pixiId = null, delete this.source._pixiId), b.BaseTexture.prototype.destroy.call(this);
}, b.VideoTexture.baseTextureFromVideo = function(a438, c248) {
    a438._pixiId || (a438._pixiId = "video_" + b.TextureCacheIdGenerator++);
    var d = b.BaseTextureCache[a438._pixiId];
    return d || (d = new b.VideoTexture(a438, c248), b.BaseTextureCache[a438._pixiId] = d), d;
}, b.VideoTexture.textureFromVideo = function(a439, c249) {
    var d = b.VideoTexture.baseTextureFromVideo(a439, c249);
    return new b.Texture(d);
}, b.VideoTexture.fromUrl = function(a440, c250) {
    var d = document.createElement("video");
    return d.src = a440, d.autoPlay = !0, d.play(), b.VideoTexture.textureFromVideo(d, c250);
}, b.AssetLoader = function(a441, c251) {
    this.assetURLs = a441, this.crossorigin = c251, this.loadersByType = {
        jpg: b.ImageLoader,
        jpeg: b.ImageLoader,
        png: b.ImageLoader,
        gif: b.ImageLoader,
        webp: b.ImageLoader,
        json: b.JsonLoader,
        atlas: b.AtlasLoader,
        anim: b.SpineLoader,
        xml: b.BitmapFontLoader,
        fnt: b.BitmapFontLoader
    };
}, b.EventTarget.mixin(b.AssetLoader.prototype), b.AssetLoader.prototype.constructor = b.AssetLoader, b.AssetLoader.prototype._getDataType = function(a442) {
    var b207 = "data:", c252 = a442.slice(0, b207.length).toLowerCase();
    if (c252 === b207) {
        var d = a442.slice(b207.length), e = d.indexOf(",");
        if (-1 === e) return null;
        var f = d.slice(0, e).split(";")[0];
        return f && "text/plain" !== f.toLowerCase() ? f.split("/").pop().toLowerCase() : "txt";
    }
    return null;
}, b.AssetLoader.prototype.load = function() {
    function a443(a444) {
        b208.onAssetLoaded(a444.data.content);
    }
    var b208 = this;
    this.loadCount = this.assetURLs.length;
    for(var c253 = 0; c253 < this.assetURLs.length; c253++){
        var d = this.assetURLs[c253], e = this._getDataType(d);
        e || (e = d.split("?").shift().split(".").pop().toLowerCase());
        var f = this.loadersByType[e];
        if (!f) throw new Error(e + " is an unsupported file type");
        var g = new f(d, this.crossorigin);
        g.on("loaded", a443), g.load();
    }
}, b.AssetLoader.prototype.onAssetLoaded = function(a445) {
    this.loadCount--, this.emit("onProgress", {
        content: this,
        loader: a445,
        loaded: this.assetURLs.length - this.loadCount,
        total: this.assetURLs.length
    }), this.onProgress && this.onProgress(a445), this.loadCount || (this.emit("onComplete", {
        content: this
    }), this.onComplete && this.onComplete());
}, b.JsonLoader = function(a446, b209) {
    this.url = a446, this.crossorigin = b209, this.baseUrl = a446.replace(/[^\/]*$/, ""), this.loaded = !1;
}, b.JsonLoader.prototype.constructor = b.JsonLoader, b.EventTarget.mixin(b.JsonLoader.prototype), b.JsonLoader.prototype.load = function() {
    window.XDomainRequest && this.crossorigin ? (this.ajaxRequest = new window.XDomainRequest, this.ajaxRequest.timeout = 3000, this.ajaxRequest.onerror = this.onError.bind(this), this.ajaxRequest.ontimeout = this.onError.bind(this), this.ajaxRequest.onprogress = function() {
    }, this.ajaxRequest.onload = this.onJSONLoaded.bind(this)) : (this.ajaxRequest = window.XMLHttpRequest ? new window.XMLHttpRequest : new window.ActiveXObject("Microsoft.XMLHTTP"), this.ajaxRequest.onreadystatechange = this.onReadyStateChanged.bind(this)), this.ajaxRequest.open("GET", this.url, !0), this.ajaxRequest.send();
}, b.JsonLoader.prototype.onReadyStateChanged = function() {
    4 !== this.ajaxRequest.readyState || 200 !== this.ajaxRequest.status && -1 !== window.location.href.indexOf("http") || this.onJSONLoaded();
}, b.JsonLoader.prototype.onJSONLoaded = function() {
    if (!this.ajaxRequest.responseText) return void this.onError();
    if (this.json = JSON.parse(this.ajaxRequest.responseText), this.json.frames && this.json.meta && this.json.meta.image) {
        var a447 = this.json.meta.image;
        -1 === a447.indexOf("data:") && (a447 = this.baseUrl + a447);
        var d = new b.ImageLoader(a447, this.crossorigin), e = this.json.frames;
        this.texture = d.texture.baseTexture, d.addEventListener("loaded", this.onLoaded.bind(this));
        for(var f in e){
            var g = e[f].frame;
            if (g) {
                var h = new b.Rectangle(g.x, g.y, g.w, g.h), i = h.clone(), j = null;
                if (e[f].trimmed) {
                    var k = e[f].sourceSize, l = e[f].spriteSourceSize;
                    j = new b.Rectangle(l.x, l.y, k.w, k.h);
                }
                b.TextureCache[f] = new b.Texture(this.texture, h, i, j);
            }
        }
        d.load();
    } else if (this.json.bones) {
        if (b.AnimCache[this.url]) this.onLoaded();
        else {
            var m = this.url.substr(0, this.url.lastIndexOf(".")) + ".atlas", n = new b.JsonLoader(m, this.crossorigin), o = this;
            n.onJSONLoaded = function() {
                if (!this.ajaxRequest.responseText) return void this.onError();
                var a448 = new b.SpineTextureLoader(this.url.substring(0, this.url.lastIndexOf("/"))), d = new c.Atlas(this.ajaxRequest.responseText, a448), e = new c.AtlasAttachmentLoader(d), f = new c.SkeletonJson(e), g = f.readSkeletonData(o.json);
                b.AnimCache[o.url] = g, o.spine = g, o.spineAtlas = d, o.spineAtlasLoader = n, a448.loadingCount > 0 ? a448.addEventListener("loadedBaseTexture", function(a449) {
                    a449.content.content.loadingCount <= 0 && o.onLoaded();
                }) : o.onLoaded();
            }, n.load();
        }
    } else this.onLoaded();
}, b.JsonLoader.prototype.onLoaded = function() {
    this.loaded = !0, this.dispatchEvent({
        type: "loaded",
        content: this
    });
}, b.JsonLoader.prototype.onError = function() {
    this.dispatchEvent({
        type: "error",
        content: this
    });
}, b.AtlasLoader = function(a450, b210) {
    this.url = a450, this.baseUrl = a450.replace(/[^\/]*$/, ""), this.crossorigin = b210, this.loaded = !1;
}, b.AtlasLoader.constructor = b.AtlasLoader, b.EventTarget.mixin(b.AtlasLoader.prototype), b.AtlasLoader.prototype.load = function() {
    this.ajaxRequest = new b.AjaxRequest, this.ajaxRequest.onreadystatechange = this.onAtlasLoaded.bind(this), this.ajaxRequest.open("GET", this.url, !0), this.ajaxRequest.overrideMimeType && this.ajaxRequest.overrideMimeType("application/json"), this.ajaxRequest.send(null);
}, b.AtlasLoader.prototype.onAtlasLoaded = function() {
    if (4 === this.ajaxRequest.readyState) {
        if (200 === this.ajaxRequest.status || -1 === window.location.href.indexOf("http")) {
            this.atlas = {
                meta: {
                    image: []
                },
                frames: []
            };
            var a451 = this.ajaxRequest.responseText.split(/\r?\n/), c254 = -3, d = 0, e = null, f = !1, g = 0, h = 0, i = this.onLoaded.bind(this);
            for(g = 0; g < a451.length; g++)if (a451[g] = a451[g].replace(/^\s+|\s+$/g, ""), "" === a451[g] && (f = g + 1), a451[g].length > 0) {
                if (f === g) this.atlas.meta.image.push(a451[g]), d = this.atlas.meta.image.length - 1, this.atlas.frames.push({
                }), c254 = -3;
                else if (c254 > 0) {
                    if (c254 % 7 === 1) null != e && (this.atlas.frames[d][e.name] = e), e = {
                        name: a451[g],
                        frame: {
                        }
                    };
                    else {
                        var j = a451[g].split(" ");
                        if (c254 % 7 === 3) e.frame.x = Number(j[1].replace(",", "")), e.frame.y = Number(j[2]);
                        else if (c254 % 7 === 4) e.frame.w = Number(j[1].replace(",", "")), e.frame.h = Number(j[2]);
                        else if (c254 % 7 === 5) {
                            var k = {
                                x: 0,
                                y: 0,
                                w: Number(j[1].replace(",", "")),
                                h: Number(j[2])
                            };
                            k.w > e.frame.w || k.h > e.frame.h ? (e.trimmed = !0, e.realSize = k) : e.trimmed = !1;
                        }
                    }
                }
                c254++;
            }
            if (null != e && (this.atlas.frames[d][e.name] = e), this.atlas.meta.image.length > 0) {
                for(this.images = [], h = 0; h < this.atlas.meta.image.length; h++){
                    var l = this.baseUrl + this.atlas.meta.image[h], m = this.atlas.frames[h];
                    this.images.push(new b.ImageLoader(l, this.crossorigin));
                    for(g in m){
                        var n = m[g].frame;
                        n && (b.TextureCache[g] = new b.Texture(this.images[h].texture.baseTexture, {
                            x: n.x,
                            y: n.y,
                            width: n.w,
                            height: n.h
                        }), m[g].trimmed && (b.TextureCache[g].realSize = m[g].realSize, b.TextureCache[g].trim.x = 0, b.TextureCache[g].trim.y = 0));
                    }
                }
                for(this.currentImageId = 0, h = 0; h < this.images.length; h++)this.images[h].on("loaded", i);
                this.images[this.currentImageId].load();
            } else this.onLoaded();
        } else this.onError();
    }
}, b.AtlasLoader.prototype.onLoaded = function() {
    this.images.length - 1 > this.currentImageId ? (this.currentImageId++, this.images[this.currentImageId].load()) : (this.loaded = !0, this.emit("loaded", {
        content: this
    }));
}, b.AtlasLoader.prototype.onError = function() {
    this.emit("error", {
        content: this
    });
}, b.SpriteSheetLoader = function(a452, b211) {
    this.url = a452, this.crossorigin = b211, this.baseUrl = a452.replace(/[^\/]*$/, ""), this.texture = null, this.frames = {
    };
}, b.SpriteSheetLoader.prototype.constructor = b.SpriteSheetLoader, b.EventTarget.mixin(b.SpriteSheetLoader.prototype), b.SpriteSheetLoader.prototype.load = function() {
    var a453 = this, c255 = new b.JsonLoader(this.url, this.crossorigin);
    c255.on("loaded", function(b212) {
        a453.json = b212.data.content.json, a453.onLoaded();
    }), c255.load();
}, b.SpriteSheetLoader.prototype.onLoaded = function() {
    this.emit("loaded", {
        content: this
    });
}, b.ImageLoader = function(a454, c256) {
    this.texture = b.Texture.fromImage(a454, c256), this.frames = [];
}, b.ImageLoader.prototype.constructor = b.ImageLoader, b.EventTarget.mixin(b.ImageLoader.prototype), b.ImageLoader.prototype.load = function() {
    this.texture.baseTexture.hasLoaded ? this.onLoaded() : this.texture.baseTexture.on("loaded", this.onLoaded.bind(this));
}, b.ImageLoader.prototype.onLoaded = function() {
    this.emit("loaded", {
        content: this
    });
}, b.ImageLoader.prototype.loadFramedSpriteSheet = function(a455, c257, d) {
    this.frames = [];
    for(var e = Math.floor(this.texture.width / a455), f = Math.floor(this.texture.height / c257), g = 0, h = 0; f > h; h++)for(var i = 0; e > i; i++, g++){
        var j = new b.Texture(this.texture.baseTexture, {
            x: i * a455,
            y: h * c257,
            width: a455,
            height: c257
        });
        this.frames.push(j), d && (b.TextureCache[d + "-" + g] = j);
    }
    this.load();
}, b.BitmapFontLoader = function(a456, b213) {
    this.url = a456, this.crossorigin = b213, this.baseUrl = a456.replace(/[^\/]*$/, ""), this.texture = null;
}, b.BitmapFontLoader.prototype.constructor = b.BitmapFontLoader, b.EventTarget.mixin(b.BitmapFontLoader.prototype), b.BitmapFontLoader.prototype.load = function() {
    this.ajaxRequest = new b.AjaxRequest, this.ajaxRequest.onreadystatechange = this.onXMLLoaded.bind(this), this.ajaxRequest.open("GET", this.url, !0), this.ajaxRequest.overrideMimeType && this.ajaxRequest.overrideMimeType("application/xml"), this.ajaxRequest.send(null);
}, b.BitmapFontLoader.prototype.onXMLLoaded = function() {
    if (4 === this.ajaxRequest.readyState && (200 === this.ajaxRequest.status || -1 === window.location.protocol.indexOf("http"))) {
        var a457 = this.ajaxRequest.responseXML;
        if (!a457 || /MSIE 9/i.test(navigator.userAgent) || navigator.isCocoonJS) {
            if ("function" == typeof window.DOMParser) {
                var c258 = new DOMParser;
                a457 = c258.parseFromString(this.ajaxRequest.responseText, "text/xml");
            } else {
                var d = document.createElement("div");
                d.innerHTML = this.ajaxRequest.responseText, a457 = d;
            }
        }
        var e = this.baseUrl + a457.getElementsByTagName("page")[0].getAttribute("file"), f = new b.ImageLoader(e, this.crossorigin);
        this.texture = f.texture.baseTexture;
        var g = {
        }, h = a457.getElementsByTagName("info")[0], i = a457.getElementsByTagName("common")[0];
        g.font = h.getAttribute("face"), g.size = parseInt(h.getAttribute("size"), 10), g.lineHeight = parseInt(i.getAttribute("lineHeight"), 10), g.chars = {
        };
        for(var j = a457.getElementsByTagName("char"), k = 0; k < j.length; k++){
            var l = parseInt(j[k].getAttribute("id"), 10), m = new b.Rectangle(parseInt(j[k].getAttribute("x"), 10), parseInt(j[k].getAttribute("y"), 10), parseInt(j[k].getAttribute("width"), 10), parseInt(j[k].getAttribute("height"), 10));
            g.chars[l] = {
                xOffset: parseInt(j[k].getAttribute("xoffset"), 10),
                yOffset: parseInt(j[k].getAttribute("yoffset"), 10),
                xAdvance: parseInt(j[k].getAttribute("xadvance"), 10),
                kerning: {
                },
                texture: b.TextureCache[l] = new b.Texture(this.texture, m)
            };
        }
        var n = a457.getElementsByTagName("kerning");
        for(k = 0; k < n.length; k++){
            var o = parseInt(n[k].getAttribute("first"), 10), p = parseInt(n[k].getAttribute("second"), 10), q = parseInt(n[k].getAttribute("amount"), 10);
            g.chars[p].kerning[o] = q;
        }
        b.BitmapText.fonts[g.font] = g, f.addEventListener("loaded", this.onLoaded.bind(this)), f.load();
    }
}, b.BitmapFontLoader.prototype.onLoaded = function() {
    this.emit("loaded", {
        content: this
    });
}, b.SpineLoader = function(a458, b214) {
    this.url = a458, this.crossorigin = b214, this.loaded = !1;
}, b.SpineLoader.prototype.constructor = b.SpineLoader, b.EventTarget.mixin(b.SpineLoader.prototype), b.SpineLoader.prototype.load = function() {
    var a459 = this, c259 = new b.JsonLoader(this.url, this.crossorigin);
    c259.on("loaded", function(b215) {
        a459.json = b215.data.content.json, a459.onLoaded();
    }), c259.load();
}, b.SpineLoader.prototype.onLoaded = function() {
    this.loaded = !0, this.emit("loaded", {
        content: this
    });
}, b.AbstractFilter = function(a460, b216) {
    this.passes = [
        this
    ], this.shaders = [], this.dirty = !0, this.padding = 0, this.uniforms = b216 || {
    }, this.fragmentSrc = a460 || [];
}, b.AbstractFilter.prototype.constructor = b.AbstractFilter, b.AbstractFilter.prototype.syncUniforms = function() {
    for(var a461 = 0, b217 = this.shaders.length; b217 > a461; a461++)this.shaders[a461].dirty = !0;
}, b.AlphaMaskFilter = function(a462) {
    b.AbstractFilter.call(this), this.passes = [
        this
    ], a462.baseTexture._powerOf2 = !0, this.uniforms = {
        mask: {
            type: "sampler2D",
            value: a462
        },
        mapDimensions: {
            type: "2f",
            value: {
                x: 1,
                y: 5112
            }
        },
        dimensions: {
            type: "4fv",
            value: [
                0,
                0,
                0,
                0
            ]
        }
    }, a462.baseTexture.hasLoaded ? (this.uniforms.mask.value.x = a462.width, this.uniforms.mask.value.y = a462.height) : (this.boundLoadedFunction = this.onTextureLoaded.bind(this), a462.baseTexture.on("loaded", this.boundLoadedFunction)), this.fragmentSrc = [
        "precision mediump float;",
        "varying vec2 vTextureCoord;",
        "varying vec4 vColor;",
        "uniform sampler2D mask;",
        "uniform sampler2D uSampler;",
        "uniform vec2 offset;",
        "uniform vec4 dimensions;",
        "uniform vec2 mapDimensions;",
        "void main(void) {",
        "   vec2 mapCords = vTextureCoord.xy;",
        "   mapCords += (dimensions.zw + offset)/ dimensions.xy ;",
        "   mapCords.y *= -1.0;",
        "   mapCords.y += 1.0;",
        "   mapCords *= dimensions.xy / mapDimensions;",
        "   vec4 original =  texture2D(uSampler, vTextureCoord);",
        "   float maskAlpha =  texture2D(mask, mapCords).r;",
        "   original *= maskAlpha;",
        "   gl_FragColor =  original;",
        "}"
    ];
}, b.AlphaMaskFilter.prototype = Object.create(b.AbstractFilter.prototype), b.AlphaMaskFilter.prototype.constructor = b.AlphaMaskFilter, b.AlphaMaskFilter.prototype.onTextureLoaded = function() {
    this.uniforms.mapDimensions.value.x = this.uniforms.mask.value.width, this.uniforms.mapDimensions.value.y = this.uniforms.mask.value.height, this.uniforms.mask.value.baseTexture.off("loaded", this.boundLoadedFunction);
}, Object.defineProperty(b.AlphaMaskFilter.prototype, "map", {
    get: function() {
        return this.uniforms.mask.value;
    },
    set: function(a463) {
        this.uniforms.mask.value = a463;
    }
}), b.ColorMatrixFilter = function() {
    b.AbstractFilter.call(this), this.passes = [
        this
    ], this.uniforms = {
        matrix: {
            type: "mat4",
            value: [
                1,
                0,
                0,
                0,
                0,
                1,
                0,
                0,
                0,
                0,
                1,
                0,
                0,
                0,
                0,
                1
            ]
        }
    }, this.fragmentSrc = [
        "precision mediump float;",
        "varying vec2 vTextureCoord;",
        "varying vec4 vColor;",
        "uniform float invert;",
        "uniform mat4 matrix;",
        "uniform sampler2D uSampler;",
        "void main(void) {",
        "   gl_FragColor = texture2D(uSampler, vTextureCoord) * matrix;",
        "}"
    ];
}, b.ColorMatrixFilter.prototype = Object.create(b.AbstractFilter.prototype), b.ColorMatrixFilter.prototype.constructor = b.ColorMatrixFilter, Object.defineProperty(b.ColorMatrixFilter.prototype, "matrix", {
    get: function() {
        return this.uniforms.matrix.value;
    },
    set: function(a464) {
        this.uniforms.matrix.value = a464;
    }
}), b.GrayFilter = function() {
    b.AbstractFilter.call(this), this.passes = [
        this
    ], this.uniforms = {
        gray: {
            type: "1f",
            value: 1
        }
    }, this.fragmentSrc = [
        "precision mediump float;",
        "varying vec2 vTextureCoord;",
        "varying vec4 vColor;",
        "uniform sampler2D uSampler;",
        "uniform float gray;",
        "void main(void) {",
        "   gl_FragColor = texture2D(uSampler, vTextureCoord);",
        "   gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.2126*gl_FragColor.r + 0.7152*gl_FragColor.g + 0.0722*gl_FragColor.b), gray);",
        "}"
    ];
}, b.GrayFilter.prototype = Object.create(b.AbstractFilter.prototype), b.GrayFilter.prototype.constructor = b.GrayFilter, Object.defineProperty(b.GrayFilter.prototype, "gray", {
    get: function() {
        return this.uniforms.gray.value;
    },
    set: function(a465) {
        this.uniforms.gray.value = a465;
    }
}), b.DisplacementFilter = function(a466) {
    b.AbstractFilter.call(this), this.passes = [
        this
    ], a466.baseTexture._powerOf2 = !0, this.uniforms = {
        displacementMap: {
            type: "sampler2D",
            value: a466
        },
        scale: {
            type: "2f",
            value: {
                x: 30,
                y: 30
            }
        },
        offset: {
            type: "2f",
            value: {
                x: 0,
                y: 0
            }
        },
        mapDimensions: {
            type: "2f",
            value: {
                x: 1,
                y: 5112
            }
        },
        dimensions: {
            type: "4fv",
            value: [
                0,
                0,
                0,
                0
            ]
        }
    }, a466.baseTexture.hasLoaded ? (this.uniforms.mapDimensions.value.x = a466.width, this.uniforms.mapDimensions.value.y = a466.height) : (this.boundLoadedFunction = this.onTextureLoaded.bind(this), a466.baseTexture.on("loaded", this.boundLoadedFunction)), this.fragmentSrc = [
        "precision mediump float;",
        "varying vec2 vTextureCoord;",
        "varying vec4 vColor;",
        "uniform sampler2D displacementMap;",
        "uniform sampler2D uSampler;",
        "uniform vec2 scale;",
        "uniform vec2 offset;",
        "uniform vec4 dimensions;",
        "uniform vec2 mapDimensions;",
        "void main(void) {",
        "   vec2 mapCords = vTextureCoord.xy;",
        "   mapCords += (dimensions.zw + offset)/ dimensions.xy ;",
        "   mapCords.y *= -1.0;",
        "   mapCords.y += 1.0;",
        "   vec2 matSample = texture2D(displacementMap, mapCords).xy;",
        "   matSample -= 0.5;",
        "   matSample *= scale;",
        "   matSample /= mapDimensions;",
        "   gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x + matSample.x, vTextureCoord.y + matSample.y));",
        "   gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb, 1.0);",
        "   vec2 cord = vTextureCoord;",
        "}"
    ];
}, b.DisplacementFilter.prototype = Object.create(b.AbstractFilter.prototype), b.DisplacementFilter.prototype.constructor = b.DisplacementFilter, b.DisplacementFilter.prototype.onTextureLoaded = function() {
    this.uniforms.mapDimensions.value.x = this.uniforms.displacementMap.value.width, this.uniforms.mapDimensions.value.y = this.uniforms.displacementMap.value.height, this.uniforms.displacementMap.value.baseTexture.off("loaded", this.boundLoadedFunction);
}, Object.defineProperty(b.DisplacementFilter.prototype, "map", {
    get: function() {
        return this.uniforms.displacementMap.value;
    },
    set: function(a467) {
        this.uniforms.displacementMap.value = a467;
    }
}), Object.defineProperty(b.DisplacementFilter.prototype, "scale", {
    get: function() {
        return this.uniforms.scale.value;
    },
    set: function(a468) {
        this.uniforms.scale.value = a468;
    }
}), Object.defineProperty(b.DisplacementFilter.prototype, "offset", {
    get: function() {
        return this.uniforms.offset.value;
    },
    set: function(a469) {
        this.uniforms.offset.value = a469;
    }
}), b.PixelateFilter = function() {
    b.AbstractFilter.call(this), this.passes = [
        this
    ], this.uniforms = {
        invert: {
            type: "1f",
            value: 0
        },
        dimensions: {
            type: "4fv",
            value: new b.Float32Array([
                10000,
                100,
                10,
                10
            ])
        },
        pixelSize: {
            type: "2f",
            value: {
                x: 10,
                y: 10
            }
        }
    }, this.fragmentSrc = [
        "precision mediump float;",
        "varying vec2 vTextureCoord;",
        "varying vec4 vColor;",
        "uniform vec2 testDim;",
        "uniform vec4 dimensions;",
        "uniform vec2 pixelSize;",
        "uniform sampler2D uSampler;",
        "void main(void) {",
        "   vec2 coord = vTextureCoord;",
        "   vec2 size = dimensions.xy/pixelSize;",
        "   vec2 color = floor( ( vTextureCoord * size ) ) / size + pixelSize/dimensions.xy * 0.5;",
        "   gl_FragColor = texture2D(uSampler, color);",
        "}"
    ];
}, b.PixelateFilter.prototype = Object.create(b.AbstractFilter.prototype), b.PixelateFilter.prototype.constructor = b.PixelateFilter, Object.defineProperty(b.PixelateFilter.prototype, "size", {
    get: function() {
        return this.uniforms.pixelSize.value;
    },
    set: function(a470) {
        this.dirty = !0, this.uniforms.pixelSize.value = a470;
    }
}), b.BlurXFilter = function() {
    b.AbstractFilter.call(this), this.passes = [
        this
    ], this.uniforms = {
        blur: {
            type: "1f",
            value: 1 / 512
        }
    }, this.fragmentSrc = [
        "precision mediump float;",
        "varying vec2 vTextureCoord;",
        "varying vec4 vColor;",
        "uniform float blur;",
        "uniform sampler2D uSampler;",
        "void main(void) {",
        "   vec4 sum = vec4(0.0);",
        "   sum += texture2D(uSampler, vec2(vTextureCoord.x - 4.0*blur, vTextureCoord.y)) * 0.05;",
        "   sum += texture2D(uSampler, vec2(vTextureCoord.x - 3.0*blur, vTextureCoord.y)) * 0.09;",
        "   sum += texture2D(uSampler, vec2(vTextureCoord.x - 2.0*blur, vTextureCoord.y)) * 0.12;",
        "   sum += texture2D(uSampler, vec2(vTextureCoord.x - blur, vTextureCoord.y)) * 0.15;",
        "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * 0.16;",
        "   sum += texture2D(uSampler, vec2(vTextureCoord.x + blur, vTextureCoord.y)) * 0.15;",
        "   sum += texture2D(uSampler, vec2(vTextureCoord.x + 2.0*blur, vTextureCoord.y)) * 0.12;",
        "   sum += texture2D(uSampler, vec2(vTextureCoord.x + 3.0*blur, vTextureCoord.y)) * 0.09;",
        "   sum += texture2D(uSampler, vec2(vTextureCoord.x + 4.0*blur, vTextureCoord.y)) * 0.05;",
        "   gl_FragColor = sum;",
        "}"
    ];
}, b.BlurXFilter.prototype = Object.create(b.AbstractFilter.prototype), b.BlurXFilter.prototype.constructor = b.BlurXFilter, Object.defineProperty(b.BlurXFilter.prototype, "blur", {
    get: function() {
        return this.uniforms.blur.value / (1 / 7000);
    },
    set: function(a471) {
        this.dirty = !0, this.uniforms.blur.value = 1 / 7000 * a471;
    }
}), b.BlurYFilter = function() {
    b.AbstractFilter.call(this), this.passes = [
        this
    ], this.uniforms = {
        blur: {
            type: "1f",
            value: 1 / 512
        }
    }, this.fragmentSrc = [
        "precision mediump float;",
        "varying vec2 vTextureCoord;",
        "varying vec4 vColor;",
        "uniform float blur;",
        "uniform sampler2D uSampler;",
        "void main(void) {",
        "   vec4 sum = vec4(0.0);",
        "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 4.0*blur)) * 0.05;",
        "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 3.0*blur)) * 0.09;",
        "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 2.0*blur)) * 0.12;",
        "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - blur)) * 0.15;",
        "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * 0.16;",
        "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + blur)) * 0.15;",
        "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 2.0*blur)) * 0.12;",
        "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 3.0*blur)) * 0.09;",
        "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 4.0*blur)) * 0.05;",
        "   gl_FragColor = sum;",
        "}"
    ];
}, b.BlurYFilter.prototype = Object.create(b.AbstractFilter.prototype), b.BlurYFilter.prototype.constructor = b.BlurYFilter, Object.defineProperty(b.BlurYFilter.prototype, "blur", {
    get: function() {
        return this.uniforms.blur.value / (1 / 7000);
    },
    set: function(a472) {
        this.uniforms.blur.value = 1 / 7000 * a472;
    }
}), b.BlurFilter = function() {
    this.blurXFilter = new b.BlurXFilter, this.blurYFilter = new b.BlurYFilter, this.passes = [
        this.blurXFilter,
        this.blurYFilter
    ];
}, b.BlurFilter.prototype = Object.create(b.AbstractFilter.prototype), b.BlurFilter.prototype.constructor = b.BlurFilter, Object.defineProperty(b.BlurFilter.prototype, "blur", {
    get: function() {
        return this.blurXFilter.blur;
    },
    set: function(a473) {
        this.blurXFilter.blur = this.blurYFilter.blur = a473;
    }
}), Object.defineProperty(b.BlurFilter.prototype, "blurX", {
    get: function() {
        return this.blurXFilter.blur;
    },
    set: function(a474) {
        this.blurXFilter.blur = a474;
    }
}), Object.defineProperty(b.BlurFilter.prototype, "blurY", {
    get: function() {
        return this.blurYFilter.blur;
    },
    set: function(a475) {
        this.blurYFilter.blur = a475;
    }
}), b.InvertFilter = function() {
    b.AbstractFilter.call(this), this.passes = [
        this
    ], this.uniforms = {
        invert: {
            type: "1f",
            value: 1
        }
    }, this.fragmentSrc = [
        "precision mediump float;",
        "varying vec2 vTextureCoord;",
        "varying vec4 vColor;",
        "uniform float invert;",
        "uniform sampler2D uSampler;",
        "void main(void) {",
        "   gl_FragColor = texture2D(uSampler, vTextureCoord);",
        "   gl_FragColor.rgb = mix( (vec3(1)-gl_FragColor.rgb) * gl_FragColor.a, gl_FragColor.rgb, 1.0 - invert);",
        "}"
    ];
}, b.InvertFilter.prototype = Object.create(b.AbstractFilter.prototype), b.InvertFilter.prototype.constructor = b.InvertFilter, Object.defineProperty(b.InvertFilter.prototype, "invert", {
    get: function() {
        return this.uniforms.invert.value;
    },
    set: function(a476) {
        this.uniforms.invert.value = a476;
    }
}), b.SepiaFilter = function() {
    b.AbstractFilter.call(this), this.passes = [
        this
    ], this.uniforms = {
        sepia: {
            type: "1f",
            value: 1
        }
    }, this.fragmentSrc = [
        "precision mediump float;",
        "varying vec2 vTextureCoord;",
        "varying vec4 vColor;",
        "uniform float sepia;",
        "uniform sampler2D uSampler;",
        "const mat3 sepiaMatrix = mat3(0.3588, 0.7044, 0.1368, 0.2990, 0.5870, 0.1140, 0.2392, 0.4696, 0.0912);",
        "void main(void) {",
        "   gl_FragColor = texture2D(uSampler, vTextureCoord);",
        "   gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb * sepiaMatrix, sepia);",
        "}"
    ];
}, b.SepiaFilter.prototype = Object.create(b.AbstractFilter.prototype), b.SepiaFilter.prototype.constructor = b.SepiaFilter, Object.defineProperty(b.SepiaFilter.prototype, "sepia", {
    get: function() {
        return this.uniforms.sepia.value;
    },
    set: function(a477) {
        this.uniforms.sepia.value = a477;
    }
}), b.TwistFilter = function() {
    b.AbstractFilter.call(this), this.passes = [
        this
    ], this.uniforms = {
        radius: {
            type: "1f",
            value: 0.5
        },
        angle: {
            type: "1f",
            value: 5
        },
        offset: {
            type: "2f",
            value: {
                x: 0.5,
                y: 0.5
            }
        }
    }, this.fragmentSrc = [
        "precision mediump float;",
        "varying vec2 vTextureCoord;",
        "varying vec4 vColor;",
        "uniform vec4 dimensions;",
        "uniform sampler2D uSampler;",
        "uniform float radius;",
        "uniform float angle;",
        "uniform vec2 offset;",
        "void main(void) {",
        "   vec2 coord = vTextureCoord - offset;",
        "   float distance = length(coord);",
        "   if (distance < radius) {",
        "       float ratio = (radius - distance) / radius;",
        "       float angleMod = ratio * ratio * angle;",
        "       float s = sin(angleMod);",
        "       float c = cos(angleMod);",
        "       coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);",
        "   }",
        "   gl_FragColor = texture2D(uSampler, coord+offset);",
        "}"
    ];
}, b.TwistFilter.prototype = Object.create(b.AbstractFilter.prototype), b.TwistFilter.prototype.constructor = b.TwistFilter, Object.defineProperty(b.TwistFilter.prototype, "offset", {
    get: function() {
        return this.uniforms.offset.value;
    },
    set: function(a478) {
        this.dirty = !0, this.uniforms.offset.value = a478;
    }
}), Object.defineProperty(b.TwistFilter.prototype, "radius", {
    get: function() {
        return this.uniforms.radius.value;
    },
    set: function(a479) {
        this.dirty = !0, this.uniforms.radius.value = a479;
    }
}), Object.defineProperty(b.TwistFilter.prototype, "angle", {
    get: function() {
        return this.uniforms.angle.value;
    },
    set: function(a480) {
        this.dirty = !0, this.uniforms.angle.value = a480;
    }
}), b.ColorStepFilter = function() {
    b.AbstractFilter.call(this), this.passes = [
        this
    ], this.uniforms = {
        step: {
            type: "1f",
            value: 5
        }
    }, this.fragmentSrc = [
        "precision mediump float;",
        "varying vec2 vTextureCoord;",
        "varying vec4 vColor;",
        "uniform sampler2D uSampler;",
        "uniform float step;",
        "void main(void) {",
        "   vec4 color = texture2D(uSampler, vTextureCoord);",
        "   color = floor(color * step) / step;",
        "   gl_FragColor = color;",
        "}"
    ];
}, b.ColorStepFilter.prototype = Object.create(b.AbstractFilter.prototype), b.ColorStepFilter.prototype.constructor = b.ColorStepFilter, Object.defineProperty(b.ColorStepFilter.prototype, "step", {
    get: function() {
        return this.uniforms.step.value;
    },
    set: function(a481) {
        this.uniforms.step.value = a481;
    }
}), b.DotScreenFilter = function() {
    b.AbstractFilter.call(this), this.passes = [
        this
    ], this.uniforms = {
        scale: {
            type: "1f",
            value: 1
        },
        angle: {
            type: "1f",
            value: 5
        },
        dimensions: {
            type: "4fv",
            value: [
                0,
                0,
                0,
                0
            ]
        }
    }, this.fragmentSrc = [
        "precision mediump float;",
        "varying vec2 vTextureCoord;",
        "varying vec4 vColor;",
        "uniform vec4 dimensions;",
        "uniform sampler2D uSampler;",
        "uniform float angle;",
        "uniform float scale;",
        "float pattern() {",
        "   float s = sin(angle), c = cos(angle);",
        "   vec2 tex = vTextureCoord * dimensions.xy;",
        "   vec2 point = vec2(",
        "       c * tex.x - s * tex.y,",
        "       s * tex.x + c * tex.y",
        "   ) * scale;",
        "   return (sin(point.x) * sin(point.y)) * 4.0;",
        "}",
        "void main() {",
        "   vec4 color = texture2D(uSampler, vTextureCoord);",
        "   float average = (color.r + color.g + color.b) / 3.0;",
        "   gl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);",
        "}"
    ];
}, b.DotScreenFilter.prototype = Object.create(b.AbstractFilter.prototype), b.DotScreenFilter.prototype.constructor = b.DotScreenFilter, Object.defineProperty(b.DotScreenFilter.prototype, "scale", {
    get: function() {
        return this.uniforms.scale.value;
    },
    set: function(a482) {
        this.dirty = !0, this.uniforms.scale.value = a482;
    }
}), Object.defineProperty(b.DotScreenFilter.prototype, "angle", {
    get: function() {
        return this.uniforms.angle.value;
    },
    set: function(a483) {
        this.dirty = !0, this.uniforms.angle.value = a483;
    }
}), b.CrossHatchFilter = function() {
    b.AbstractFilter.call(this), this.passes = [
        this
    ], this.uniforms = {
        blur: {
            type: "1f",
            value: 1 / 512
        }
    }, this.fragmentSrc = [
        "precision mediump float;",
        "varying vec2 vTextureCoord;",
        "varying vec4 vColor;",
        "uniform float blur;",
        "uniform sampler2D uSampler;",
        "void main(void) {",
        "    float lum = length(texture2D(uSampler, vTextureCoord.xy).rgb);",
        "    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);",
        "    if (lum < 1.00) {",
        "        if (mod(gl_FragCoord.x + gl_FragCoord.y, 10.0) == 0.0) {",
        "            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);",
        "        }",
        "    }",
        "    if (lum < 0.75) {",
        "        if (mod(gl_FragCoord.x - gl_FragCoord.y, 10.0) == 0.0) {",
        "            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);",
        "        }",
        "    }",
        "    if (lum < 0.50) {",
        "        if (mod(gl_FragCoord.x + gl_FragCoord.y - 5.0, 10.0) == 0.0) {",
        "            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);",
        "        }",
        "    }",
        "    if (lum < 0.3) {",
        "        if (mod(gl_FragCoord.x - gl_FragCoord.y - 5.0, 10.0) == 0.0) {",
        "            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);",
        "        }",
        "    }",
        "}"
    ];
}, b.CrossHatchFilter.prototype = Object.create(b.AbstractFilter.prototype), b.CrossHatchFilter.prototype.constructor = b.CrossHatchFilter, Object.defineProperty(b.CrossHatchFilter.prototype, "blur", {
    get: function() {
        return this.uniforms.blur.value / (1 / 7000);
    },
    set: function(a484) {
        this.uniforms.blur.value = 1 / 7000 * a484;
    }
}), b.RGBSplitFilter = function() {
    b.AbstractFilter.call(this), this.passes = [
        this
    ], this.uniforms = {
        red: {
            type: "2f",
            value: {
                x: 20,
                y: 20
            }
        },
        green: {
            type: "2f",
            value: {
                x: -20,
                y: 20
            }
        },
        blue: {
            type: "2f",
            value: {
                x: 20,
                y: -20
            }
        },
        dimensions: {
            type: "4fv",
            value: [
                0,
                0,
                0,
                0
            ]
        }
    }, this.fragmentSrc = [
        "precision mediump float;",
        "varying vec2 vTextureCoord;",
        "varying vec4 vColor;",
        "uniform vec2 red;",
        "uniform vec2 green;",
        "uniform vec2 blue;",
        "uniform vec4 dimensions;",
        "uniform sampler2D uSampler;",
        "void main(void) {",
        "   gl_FragColor.r = texture2D(uSampler, vTextureCoord + red/dimensions.xy).r;",
        "   gl_FragColor.g = texture2D(uSampler, vTextureCoord + green/dimensions.xy).g;",
        "   gl_FragColor.b = texture2D(uSampler, vTextureCoord + blue/dimensions.xy).b;",
        "   gl_FragColor.a = texture2D(uSampler, vTextureCoord).a;",
        "}"
    ];
}, b.RGBSplitFilter.prototype = Object.create(b.AbstractFilter.prototype), b.RGBSplitFilter.prototype.constructor = b.RGBSplitFilter, Object.defineProperty(b.RGBSplitFilter.prototype, "red", {
    get: function() {
        return this.uniforms.red.value;
    },
    set: function(a485) {
        this.uniforms.red.value = a485;
    }
}), Object.defineProperty(b.RGBSplitFilter.prototype, "green", {
    get: function() {
        return this.uniforms.green.value;
    },
    set: function(a486) {
        this.uniforms.green.value = a486;
    }
}), Object.defineProperty(b.RGBSplitFilter.prototype, "blue", {
    get: function() {
        return this.uniforms.blue.value;
    },
    set: function(a487) {
        this.uniforms.blue.value = a487;
    }
}), "undefined" != typeof exports ? ("undefined" != typeof module && module.exports && (exports = module.exports = b), exports.PIXI = b) : "undefined" != typeof define && define.amd ? define(b) : a.PIXI = b;

//# sourceMappingURL=index.204d37a4.js.map
