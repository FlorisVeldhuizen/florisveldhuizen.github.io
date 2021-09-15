// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function(modules, entry, mainEntry, parcelRequireName, globalName) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        this
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x) {
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function(id, exports) {
    modules[id] = [
      function(require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  Object.defineProperty(newRequire, 'root', {
    get: function() {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function() {
        return mainExports;
      });

      // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }
})({"9PM7b":[function(require,module,exports) {
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SECURE = false;
var HMR_ENV_HASH = "4e5dac8afe405db7";
module.bundle.HMR_BUNDLE_ID = "f4bc4915149a9abd";
"use strict";
function _createForOfIteratorHelper(o, allowArrayLike) {
    var it;
    if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
        if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
            if (it) o = it;
            var i = 0;
            var F = function F1() {
            };
            return {
                s: F,
                n: function n() {
                    if (i >= o.length) return {
                        done: true
                    };
                    return {
                        done: false,
                        value: o[i++]
                    };
                },
                e: function e(_e) {
                    throw _e;
                },
                f: F
            };
        }
        throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var normalCompletion = true, didErr = false, err;
    return {
        s: function s() {
            it = o[Symbol.iterator]();
        },
        n: function n() {
            var step = it.next();
            normalCompletion = step.done;
            return step;
        },
        e: function e(_e2) {
            didErr = true;
            err = _e2;
        },
        f: function f() {
            try {
                if (!normalCompletion && it.return != null) it.return();
            } finally{
                if (didErr) throw err;
            }
        }
    };
}
function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
/* global HMR_HOST, HMR_PORT, HMR_ENV_HASH, HMR_SECURE */ /*::
import type {
  HMRAsset,
  HMRMessage,
} from '@parcel/reporter-dev-server/src/HMRServer.js';
interface ParcelRequire {
  (string): mixed;
  cache: {|[string]: ParcelModule|};
  hotData: mixed;
  Module: any;
  parent: ?ParcelRequire;
  isParcelRequire: true;
  modules: {|[string]: [Function, {|[string]: string|}]|};
  HMR_BUNDLE_ID: string;
  root: ParcelRequire;
}
interface ParcelModule {
  hot: {|
    data: mixed,
    accept(cb: (Function) => void): void,
    dispose(cb: (mixed) => void): void,
    // accept(deps: Array<string> | string, cb: (Function) => void): void,
    // decline(): void,
    _acceptCallbacks: Array<(Function) => void>,
    _disposeCallbacks: Array<(mixed) => void>,
  |};
}
declare var module: {bundle: ParcelRequire, ...};
declare var HMR_HOST: string;
declare var HMR_PORT: string;
declare var HMR_ENV_HASH: string;
declare var HMR_SECURE: boolean;
*/ var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
    OldModule.call(this, moduleName);
    this.hot = {
        data: module.bundle.hotData,
        _acceptCallbacks: [],
        _disposeCallbacks: [],
        accept: function accept(fn) {
            this._acceptCallbacks.push(fn || function() {
            });
        },
        dispose: function dispose(fn) {
            this._disposeCallbacks.push(fn);
        }
    };
    module.bundle.hotData = undefined;
}
module.bundle.Module = Module;
var checkedAssets, acceptedAssets, assetsToAccept;
function getHostname() {
    return HMR_HOST || (location.protocol.indexOf('http') === 0 ? location.hostname : 'localhost');
}
function getPort() {
    return HMR_PORT || location.port;
} // eslint-disable-next-line no-redeclare
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
    var hostname = getHostname();
    var port = getPort();
    var protocol = HMR_SECURE || location.protocol == 'https:' && !/localhost|127.0.0.1|0.0.0.0/.test(hostname) ? 'wss' : 'ws';
    var ws = new WebSocket(protocol + '://' + hostname + (port ? ':' + port : '') + '/'); // $FlowFixMe
    ws.onmessage = function(event) {
        checkedAssets = {
        };
        acceptedAssets = {
        };
        assetsToAccept = [];
        var data = JSON.parse(event.data);
        if (data.type === 'update') {
            // Remove error overlay if there is one
            removeErrorOverlay();
            var assets = data.assets.filter(function(asset) {
                return asset.envHash === HMR_ENV_HASH;
            }); // Handle HMR Update
            var handled = assets.every(function(asset) {
                return asset.type === 'css' || asset.type === 'js' && hmrAcceptCheck(module.bundle.root, asset.id, asset.depsByBundle);
            });
            if (handled) {
                console.clear();
                assets.forEach(function(asset) {
                    hmrApply(module.bundle.root, asset);
                });
                for(var i = 0; i < assetsToAccept.length; i++){
                    var id = assetsToAccept[i][1];
                    if (!acceptedAssets[id]) hmrAcceptRun(assetsToAccept[i][0], id);
                }
            } else window.location.reload();
        }
        if (data.type === 'error') {
            // Log parcel errors to console
            var _iterator = _createForOfIteratorHelper(data.diagnostics.ansi), _step;
            try {
                for(_iterator.s(); !(_step = _iterator.n()).done;){
                    var ansiDiagnostic = _step.value;
                    var stack = ansiDiagnostic.codeframe ? ansiDiagnostic.codeframe : ansiDiagnostic.stack;
                    console.error('🚨 [parcel]: ' + ansiDiagnostic.message + '\n' + stack + '\n\n' + ansiDiagnostic.hints.join('\n'));
                } // Render the fancy html overlay
            } catch (err) {
                _iterator.e(err);
            } finally{
                _iterator.f();
            }
            removeErrorOverlay();
            var overlay = createErrorOverlay(data.diagnostics.html); // $FlowFixMe
            document.body.appendChild(overlay);
        }
    };
    ws.onerror = function(e) {
        console.error(e.message);
    };
    ws.onclose = function() {
        console.warn('[parcel] 🚨 Connection to the HMR server was lost');
    };
}
function removeErrorOverlay() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        overlay.remove();
        console.log('[parcel] ✨ Error resolved');
    }
}
function createErrorOverlay(diagnostics) {
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    var errorHTML = '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';
    var _iterator2 = _createForOfIteratorHelper(diagnostics), _step2;
    try {
        for(_iterator2.s(); !(_step2 = _iterator2.n()).done;){
            var diagnostic = _step2.value;
            var stack = diagnostic.codeframe ? diagnostic.codeframe : diagnostic.stack;
            errorHTML += "\n      <div>\n        <div style=\"font-size: 18px; font-weight: bold; margin-top: 20px;\">\n          \uD83D\uDEA8 ".concat(diagnostic.message, "\n        </div>\n        <pre>\n          ").concat(stack, "\n        </pre>\n        <div>\n          ").concat(diagnostic.hints.map(function(hint) {
                return '<div>' + hint + '</div>';
            }).join(''), "\n        </div>\n      </div>\n    ");
        }
    } catch (err) {
        _iterator2.e(err);
    } finally{
        _iterator2.f();
    }
    errorHTML += '</div>';
    overlay.innerHTML = errorHTML;
    return overlay;
}
function getParents(bundle, id) /*: Array<[ParcelRequire, string]> */ {
    var modules = bundle.modules;
    if (!modules) return [];
    var parents = [];
    var k, d, dep;
    for(k in modules)for(d in modules[k][1]){
        dep = modules[k][1][d];
        if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) parents.push([
            bundle,
            k
        ]);
    }
    if (bundle.parent) parents = parents.concat(getParents(bundle.parent, id));
    return parents;
}
function updateLink(link) {
    var newLink = link.cloneNode();
    newLink.onload = function() {
        if (link.parentNode !== null) // $FlowFixMe
        link.parentNode.removeChild(link);
    };
    newLink.setAttribute('href', link.getAttribute('href').split('?')[0] + '?' + Date.now()); // $FlowFixMe
    link.parentNode.insertBefore(newLink, link.nextSibling);
}
var cssTimeout = null;
function reloadCSS() {
    if (cssTimeout) return;
    cssTimeout = setTimeout(function() {
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        for(var i = 0; i < links.length; i++){
            // $FlowFixMe[incompatible-type]
            var href = links[i].getAttribute('href');
            var hostname = getHostname();
            var servedFromHMRServer = hostname === 'localhost' ? new RegExp('^(https?:\\/\\/(0.0.0.0|127.0.0.1)|localhost):' + getPort()).test(href) : href.indexOf(hostname + ':' + getPort());
            var absolute = /^https?:\/\//i.test(href) && href.indexOf(window.location.origin) !== 0 && !servedFromHMRServer;
            if (!absolute) updateLink(links[i]);
        }
        cssTimeout = null;
    }, 50);
}
function hmrApply(bundle, asset) {
    var modules = bundle.modules;
    if (!modules) return;
    if (asset.type === 'css') {
        reloadCSS();
        return;
    }
    var deps = asset.depsByBundle[bundle.HMR_BUNDLE_ID];
    if (deps) {
        var fn = new Function('require', 'module', 'exports', asset.output);
        modules[asset.id] = [
            fn,
            deps
        ];
    } else if (bundle.parent) hmrApply(bundle.parent, asset);
}
function hmrAcceptCheck(bundle, id, depsByBundle) {
    var modules = bundle.modules;
    if (!modules) return;
    if (depsByBundle && !depsByBundle[bundle.HMR_BUNDLE_ID]) {
        // If we reached the root bundle without finding where the asset should go,
        // there's nothing to do. Mark as "accepted" so we don't reload the page.
        if (!bundle.parent) return true;
        return hmrAcceptCheck(bundle.parent, id, depsByBundle);
    }
    if (checkedAssets[id]) return;
    checkedAssets[id] = true;
    var cached = bundle.cache[id];
    assetsToAccept.push([
        bundle,
        id
    ]);
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) return true;
    return getParents(module.bundle.root, id).some(function(v) {
        return hmrAcceptCheck(v[0], v[1], null);
    });
}
function hmrAcceptRun(bundle, id) {
    var cached = bundle.cache[id];
    bundle.hotData = {
    };
    if (cached && cached.hot) cached.hot.data = bundle.hotData;
    if (cached && cached.hot && cached.hot._disposeCallbacks.length) cached.hot._disposeCallbacks.forEach(function(cb) {
        cb(bundle.hotData);
    });
    delete bundle.cache[id];
    bundle(id);
    cached = bundle.cache[id];
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) cached.hot._acceptCallbacks.forEach(function(cb) {
        var assetsToAlsoAccept = cb(function() {
            return getParents(module.bundle.root, id);
        });
        if (assetsToAlsoAccept && assetsToAccept.length) // $FlowFixMe[method-unbinding]
        assetsToAccept.push.apply(assetsToAccept, assetsToAlsoAccept);
    });
    acceptedAssets[id] = true;
}

},{}]},["9PM7b"], null, "parcelRequireae9f")
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
 */ var a = this, b15 = b15 || {
};
b15.WEBGL_RENDERER = 0, b15.CANVAS_RENDERER = 1, b15.VERSION = "v2.2.8", b15.blendModes = {
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
}, b15.scaleModes = {
    DEFAULT: 0,
    LINEAR: 0,
    NEAREST: 1
}, b15._UID = 0, "undefined" != typeof Float32Array ? (b15.Float32Array = Float32Array, b15.Uint16Array = Uint16Array, b15.Uint32Array = Uint32Array, b15.ArrayBuffer = ArrayBuffer) : (b15.Float32Array = Array, b15.Uint16Array = Array), b15.INTERACTION_FREQUENCY = 30, b15.AUTO_PREVENT_DEFAULT = !0, b15.PI_2 = 2 * Math.PI, b15.RAD_TO_DEG = 180 / Math.PI, b15.DEG_TO_RAD = Math.PI / 180, b15.RETINA_PREFIX = "@2x", b15.dontSayHello = !1, b15.defaultRenderOptions = {
    view: null,
    transparent: !1,
    antialias: !1,
    preserveDrawingBuffer: !1,
    resolution: 1,
    clearBeforeRender: !0,
    autoResize: !1
}, b15.sayHello = function(a1) {
    if (!b15.dontSayHello) {
        if (navigator.userAgent.toLowerCase().indexOf("chrome") > -1) {
            var c = [
                "%c %c %c Pixi.js " + b15.VERSION + " - " + a1 + "  %c  %c  http://www.pixijs.com/  %c %c ♥%c♥%c♥ ",
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
            console.log.apply(console, c);
        } else window.console && console.log("Pixi.js " + b15.VERSION + " - http://www.pixijs.com/");
        b15.dontSayHello = !0;
    }
}, b15.Point = function(a1, b1) {
    this.x = a1 || 0, this.y = b1 || 0;
}, b15.Point.prototype.clone = function() {
    return new b15.Point(this.x, this.y);
}, b15.Point.prototype.set = function(a1, b1) {
    this.x = a1 || 0, this.y = b1 || (0 !== b1 ? this.x : 0);
}, b15.Point.prototype.constructor = b15.Point, b15.Rectangle = function(a1, b1, c, d) {
    this.x = a1 || 0, this.y = b1 || 0, this.width = c || 0, this.height = d || 0;
}, b15.Rectangle.prototype.clone = function() {
    return new b15.Rectangle(this.x, this.y, this.width, this.height);
}, b15.Rectangle.prototype.contains = function(a1, b1) {
    if (this.width <= 0 || this.height <= 0) return !1;
    var c = this.x;
    if (a1 >= c && a1 <= c + this.width) {
        var d = this.y;
        if (b1 >= d && b1 <= d + this.height) return !0;
    }
    return !1;
}, b15.Rectangle.prototype.constructor = b15.Rectangle, b15.EmptyRectangle = new b15.Rectangle(0, 0, 0, 0), b15.Polygon = function(a1) {
    if (a1 instanceof Array || (a1 = Array.prototype.slice.call(arguments)), a1[0] instanceof b15.Point) {
        for(var c = [], d = 0, e = a1.length; e > d; d++)c.push(a1[d].x, a1[d].y);
        a1 = c;
    }
    this.closed = !0, this.points = a1;
}, b15.Polygon.prototype.clone = function() {
    var a1 = this.points.slice();
    return new b15.Polygon(a1);
}, b15.Polygon.prototype.contains = function(a1, b1) {
    for(var c = !1, d = this.points.length / 2, e = 0, f = d - 1; d > e; f = e++){
        var g = this.points[2 * e], h = this.points[2 * e + 1], i = this.points[2 * f], j = this.points[2 * f + 1], k = h > b1 != j > b1 && (i - g) * (b1 - h) / (j - h) + g > a1;
        k && (c = !c);
    }
    return c;
}, b15.Polygon.prototype.constructor = b15.Polygon, b15.Circle = function(a1, b1, c) {
    this.x = a1 || 0, this.y = b1 || 0, this.radius = c || 0;
}, b15.Circle.prototype.clone = function() {
    return new b15.Circle(this.x, this.y, this.radius);
}, b15.Circle.prototype.contains = function(a1, b1) {
    if (this.radius <= 0) return !1;
    var c = this.x - a1, d = this.y - b1, e = this.radius * this.radius;
    return c *= c, d *= d, e >= c + d;
}, b15.Circle.prototype.getBounds = function() {
    return new b15.Rectangle(this.x - this.radius, this.y - this.radius, 2 * this.radius, 2 * this.radius);
}, b15.Circle.prototype.constructor = b15.Circle, b15.Ellipse = function(a1, b1, c, d) {
    this.x = a1 || 0, this.y = b1 || 0, this.width = c || 0, this.height = d || 0;
}, b15.Ellipse.prototype.clone = function() {
    return new b15.Ellipse(this.x, this.y, this.width, this.height);
}, b15.Ellipse.prototype.contains = function(a1, b1) {
    if (this.width <= 0 || this.height <= 0) return !1;
    var c = (a1 - this.x) / this.width, d = (b1 - this.y) / this.height;
    return c *= c, d *= d, 1 >= c + d;
}, b15.Ellipse.prototype.getBounds = function() {
    return new b15.Rectangle(this.x - this.width, this.y - this.height, this.width, this.height);
}, b15.Ellipse.prototype.constructor = b15.Ellipse, b15.RoundedRectangle = function(a1, b1, c, d, e) {
    this.x = a1 || 0, this.y = b1 || 0, this.width = c || 0, this.height = d || 0, this.radius = e || 20;
}, b15.RoundedRectangle.prototype.clone = function() {
    return new b15.RoundedRectangle(this.x, this.y, this.width, this.height, this.radius);
}, b15.RoundedRectangle.prototype.contains = function(a1, b1) {
    if (this.width <= 0 || this.height <= 0) return !1;
    var c = this.x;
    if (a1 >= c && a1 <= c + this.width) {
        var d = this.y;
        if (b1 >= d && b1 <= d + this.height) return !0;
    }
    return !1;
}, b15.RoundedRectangle.prototype.constructor = b15.RoundedRectangle, b15.Matrix = function() {
    this.a = 1, this.b = 0, this.c = 0, this.d = 1, this.tx = 0, this.ty = 0;
}, b15.Matrix.prototype.fromArray = function(a1) {
    this.a = a1[0], this.b = a1[1], this.c = a1[3], this.d = a1[4], this.tx = a1[2], this.ty = a1[5];
}, b15.Matrix.prototype.toArray = function(a1) {
    this.array || (this.array = new b15.Float32Array(9));
    var c = this.array;
    return a1 ? (c[0] = this.a, c[1] = this.b, c[2] = 0, c[3] = this.c, c[4] = this.d, c[5] = 0, c[6] = this.tx, c[7] = this.ty, c[8] = 1) : (c[0] = this.a, c[1] = this.c, c[2] = this.tx, c[3] = this.b, c[4] = this.d, c[5] = this.ty, c[6] = 0, c[7] = 0, c[8] = 1), c;
}, b15.Matrix.prototype.apply = function(a1, c) {
    return c = c || new b15.Point, c.x = this.a * a1.x + this.c * a1.y + this.tx, c.y = this.b * a1.x + this.d * a1.y + this.ty, c;
}, b15.Matrix.prototype.applyInverse = function(a1, c) {
    c = c || new b15.Point;
    var d = 1 / (this.a * this.d + this.c * -this.b);
    return c.x = this.d * d * a1.x + -this.c * d * a1.y + (this.ty * this.c - this.tx * this.d) * d, c.y = this.a * d * a1.y + -this.b * d * a1.x + (-this.ty * this.a + this.tx * this.b) * d, c;
}, b15.Matrix.prototype.translate = function(a1, b1) {
    return this.tx += a1, this.ty += b1, this;
}, b15.Matrix.prototype.scale = function(a1, b1) {
    return this.a *= a1, this.d *= b1, this.c *= a1, this.b *= b1, this.tx *= a1, this.ty *= b1, this;
}, b15.Matrix.prototype.rotate = function(a1) {
    var b1 = Math.cos(a1), c = Math.sin(a1), d = this.a, e = this.c, f = this.tx;
    return this.a = d * b1 - this.b * c, this.b = d * c + this.b * b1, this.c = e * b1 - this.d * c, this.d = e * c + this.d * b1, this.tx = f * b1 - this.ty * c, this.ty = f * c + this.ty * b1, this;
}, b15.Matrix.prototype.append = function(a1) {
    var b1 = this.a, c = this.b, d = this.c, e = this.d;
    return this.a = a1.a * b1 + a1.b * d, this.b = a1.a * c + a1.b * e, this.c = a1.c * b1 + a1.d * d, this.d = a1.c * c + a1.d * e, this.tx = a1.tx * b1 + a1.ty * d + this.tx, this.ty = a1.tx * c + a1.ty * e + this.ty, this;
}, b15.Matrix.prototype.identity = function() {
    return this.a = 1, this.b = 0, this.c = 0, this.d = 1, this.tx = 0, this.ty = 0, this;
}, b15.identityMatrix = new b15.Matrix, b15.DisplayObject = function() {
    this.position = new b15.Point, this.scale = new b15.Point(1, 1), this.pivot = new b15.Point(0, 0), this.rotation = 0, this.alpha = 1, this.visible = !0, this.hitArea = null, this.buttonMode = !1, this.renderable = !1, this.parent = null, this.stage = null, this.worldAlpha = 1, this._interactive = !1, this.defaultCursor = "pointer", this.worldTransform = new b15.Matrix, this._sr = 0, this._cr = 1, this.filterArea = null, this._bounds = new b15.Rectangle(0, 0, 1, 1), this._currentBounds = null, this._mask = null, this._cacheAsBitmap = !1, this._cacheIsDirty = !1;
}, b15.DisplayObject.prototype.constructor = b15.DisplayObject, Object.defineProperty(b15.DisplayObject.prototype, "interactive", {
    get: function() {
        return this._interactive;
    },
    set: function(a1) {
        this._interactive = a1, this.stage && (this.stage.dirty = !0);
    }
}), Object.defineProperty(b15.DisplayObject.prototype, "worldVisible", {
    get: function() {
        var a1 = this;
        do {
            if (!a1.visible) return !1;
            a1 = a1.parent;
        }while (a1)
        return !0;
    }
}), Object.defineProperty(b15.DisplayObject.prototype, "mask", {
    get: function() {
        return this._mask;
    },
    set: function(a1) {
        this._mask && (this._mask.isMask = !1), this._mask = a1, this._mask && (this._mask.isMask = !0);
    }
}), Object.defineProperty(b15.DisplayObject.prototype, "filters", {
    get: function() {
        return this._filters;
    },
    set: function(a1) {
        if (a1) {
            for(var b1 = [], c = 0; c < a1.length; c++)for(var d = a1[c].passes, e = 0; e < d.length; e++)b1.push(d[e]);
            this._filterBlock = {
                target: this,
                filterPasses: b1
            };
        }
        this._filters = a1;
    }
}), Object.defineProperty(b15.DisplayObject.prototype, "cacheAsBitmap", {
    get: function() {
        return this._cacheAsBitmap;
    },
    set: function(a1) {
        this._cacheAsBitmap !== a1 && (a1 ? this._generateCachedSprite() : this._destroyCachedSprite(), this._cacheAsBitmap = a1);
    }
}), b15.DisplayObject.prototype.updateTransform = function() {
    var a1, c, d, e, f, g, h = this.parent.worldTransform, i = this.worldTransform;
    this.rotation % b15.PI_2 ? (this.rotation !== this.rotationCache && (this.rotationCache = this.rotation, this._sr = Math.sin(this.rotation), this._cr = Math.cos(this.rotation)), a1 = this._cr * this.scale.x, c = this._sr * this.scale.x, d = -this._sr * this.scale.y, e = this._cr * this.scale.y, f = this.position.x, g = this.position.y, (this.pivot.x || this.pivot.y) && (f -= this.pivot.x * a1 + this.pivot.y * d, g -= this.pivot.x * c + this.pivot.y * e), i.a = a1 * h.a + c * h.c, i.b = a1 * h.b + c * h.d, i.c = d * h.a + e * h.c, i.d = d * h.b + e * h.d, i.tx = f * h.a + g * h.c + h.tx, i.ty = f * h.b + g * h.d + h.ty) : (a1 = this.scale.x, e = this.scale.y, f = this.position.x - this.pivot.x * a1, g = this.position.y - this.pivot.y * e, i.a = a1 * h.a, i.b = a1 * h.b, i.c = e * h.c, i.d = e * h.d, i.tx = f * h.a + g * h.c + h.tx, i.ty = f * h.b + g * h.d + h.ty), this.worldAlpha = this.alpha * this.parent.worldAlpha;
}, b15.DisplayObject.prototype.displayObjectUpdateTransform = b15.DisplayObject.prototype.updateTransform, b15.DisplayObject.prototype.getBounds = function(a1) {
    return b15.EmptyRectangle;
}, b15.DisplayObject.prototype.getLocalBounds = function() {
    return this.getBounds(b15.identityMatrix);
}, b15.DisplayObject.prototype.setStageReference = function(a1) {
    this.stage = a1, this._interactive && (this.stage.dirty = !0);
}, b15.DisplayObject.prototype.generateTexture = function(a1, c, d) {
    var e = this.getLocalBounds(), f = new b15.RenderTexture(0 | e.width, 0 | e.height, d, c, a1);
    return b15.DisplayObject._tempMatrix.tx = -e.x, b15.DisplayObject._tempMatrix.ty = -e.y, f.render(this, b15.DisplayObject._tempMatrix), f;
}, b15.DisplayObject.prototype.updateCache = function() {
    this._generateCachedSprite();
}, b15.DisplayObject.prototype.toGlobal = function(a1) {
    return this.displayObjectUpdateTransform(), this.worldTransform.apply(a1);
}, b15.DisplayObject.prototype.toLocal = function(a1, b2) {
    return b2 && (a1 = b2.toGlobal(a1)), this.displayObjectUpdateTransform(), this.worldTransform.applyInverse(a1);
}, b15.DisplayObject.prototype._renderCachedSprite = function(a1) {
    this._cachedSprite.worldAlpha = this.worldAlpha, a1.gl ? b15.Sprite.prototype._renderWebGL.call(this._cachedSprite, a1) : b15.Sprite.prototype._renderCanvas.call(this._cachedSprite, a1);
}, b15.DisplayObject.prototype._generateCachedSprite = function() {
    this._cacheAsBitmap = !1;
    var a1 = this.getLocalBounds();
    if (this._cachedSprite) this._cachedSprite.texture.resize(0 | a1.width, 0 | a1.height);
    else {
        var c = new b15.RenderTexture(0 | a1.width, 0 | a1.height);
        this._cachedSprite = new b15.Sprite(c), this._cachedSprite.worldTransform = this.worldTransform;
    }
    var d = this._filters;
    this._filters = null, this._cachedSprite.filters = d, b15.DisplayObject._tempMatrix.tx = -a1.x, b15.DisplayObject._tempMatrix.ty = -a1.y, this._cachedSprite.texture.render(this, b15.DisplayObject._tempMatrix, !0), this._cachedSprite.anchor.x = -(a1.x / a1.width), this._cachedSprite.anchor.y = -(a1.y / a1.height), this._filters = d, this._cacheAsBitmap = !0;
}, b15.DisplayObject.prototype._destroyCachedSprite = function() {
    this._cachedSprite && (this._cachedSprite.texture.destroy(!0), this._cachedSprite = null);
}, b15.DisplayObject.prototype._renderWebGL = function(a1) {
}, b15.DisplayObject.prototype._renderCanvas = function(a1) {
}, b15.DisplayObject._tempMatrix = new b15.Matrix, Object.defineProperty(b15.DisplayObject.prototype, "x", {
    get: function() {
        return this.position.x;
    },
    set: function(a1) {
        this.position.x = a1;
    }
}), Object.defineProperty(b15.DisplayObject.prototype, "y", {
    get: function() {
        return this.position.y;
    },
    set: function(a1) {
        this.position.y = a1;
    }
}), b15.DisplayObjectContainer = function() {
    b15.DisplayObject.call(this), this.children = [];
}, b15.DisplayObjectContainer.prototype = Object.create(b15.DisplayObject.prototype), b15.DisplayObjectContainer.prototype.constructor = b15.DisplayObjectContainer, Object.defineProperty(b15.DisplayObjectContainer.prototype, "width", {
    get: function() {
        return this.scale.x * this.getLocalBounds().width;
    },
    set: function(a1) {
        var b2 = this.getLocalBounds().width;
        this.scale.x = 0 !== b2 ? a1 / b2 : 1, this._width = a1;
    }
}), Object.defineProperty(b15.DisplayObjectContainer.prototype, "height", {
    get: function() {
        return this.scale.y * this.getLocalBounds().height;
    },
    set: function(a1) {
        var b2 = this.getLocalBounds().height;
        this.scale.y = 0 !== b2 ? a1 / b2 : 1, this._height = a1;
    }
}), b15.DisplayObjectContainer.prototype.addChild = function(a1) {
    return this.addChildAt(a1, this.children.length);
}, b15.DisplayObjectContainer.prototype.addChildAt = function(a1, b2) {
    if (b2 >= 0 && b2 <= this.children.length) return a1.parent && a1.parent.removeChild(a1), a1.parent = this, this.children.splice(b2, 0, a1), this.stage && a1.setStageReference(this.stage), a1;
    throw new Error(a1 + "addChildAt: The index " + b2 + " supplied is out of bounds " + this.children.length);
}, b15.DisplayObjectContainer.prototype.swapChildren = function(a1, b2) {
    if (a1 !== b2) {
        var c = this.getChildIndex(a1), d = this.getChildIndex(b2);
        if (0 > c || 0 > d) throw new Error("swapChildren: Both the supplied DisplayObjects must be a child of the caller.");
        this.children[c] = b2, this.children[d] = a1;
    }
}, b15.DisplayObjectContainer.prototype.getChildIndex = function(a1) {
    var b2 = this.children.indexOf(a1);
    if (-1 === b2) throw new Error("The supplied DisplayObject must be a child of the caller");
    return b2;
}, b15.DisplayObjectContainer.prototype.setChildIndex = function(a1, b2) {
    if (0 > b2 || b2 >= this.children.length) throw new Error("The supplied index is out of bounds");
    var c = this.getChildIndex(a1);
    this.children.splice(c, 1), this.children.splice(b2, 0, a1);
}, b15.DisplayObjectContainer.prototype.getChildAt = function(a1) {
    if (0 > a1 || a1 >= this.children.length) throw new Error("getChildAt: Supplied index " + a1 + " does not exist in the child list, or the supplied DisplayObject must be a child of the caller");
    return this.children[a1];
}, b15.DisplayObjectContainer.prototype.removeChild = function(a1) {
    var b2 = this.children.indexOf(a1);
    if (-1 !== b2) return this.removeChildAt(b2);
}, b15.DisplayObjectContainer.prototype.removeChildAt = function(a1) {
    var b2 = this.getChildAt(a1);
    return this.stage && b2.removeStageReference(), b2.parent = void 0, this.children.splice(a1, 1), b2;
}, b15.DisplayObjectContainer.prototype.removeChildren = function(a1, b2) {
    var c = a1 || 0, d = "number" == typeof b2 ? b2 : this.children.length, e = d - c;
    if (e > 0 && d >= e) {
        for(var f = this.children.splice(c, e), g = 0; g < f.length; g++){
            var h = f[g];
            this.stage && h.removeStageReference(), h.parent = void 0;
        }
        return f;
    }
    if (0 === e && 0 === this.children.length) return [];
    throw new Error("removeChildren: Range Error, numeric values are outside the acceptable range");
}, b15.DisplayObjectContainer.prototype.updateTransform = function() {
    if (this.visible && (this.displayObjectUpdateTransform(), !this._cacheAsBitmap)) for(var a1 = 0, b2 = this.children.length; b2 > a1; a1++)this.children[a1].updateTransform();
}, b15.DisplayObjectContainer.prototype.displayObjectContainerUpdateTransform = b15.DisplayObjectContainer.prototype.updateTransform, b15.DisplayObjectContainer.prototype.getBounds = function() {
    if (0 === this.children.length) return b15.EmptyRectangle;
    for(var a1, c, d, e = 1 / 0, f = 1 / 0, g = -(1 / 0), h = -(1 / 0), i = !1, j = 0, k = this.children.length; k > j; j++){
        var l = this.children[j];
        l.visible && (i = !0, a1 = this.children[j].getBounds(), e = e < a1.x ? e : a1.x, f = f < a1.y ? f : a1.y, c = a1.width + a1.x, d = a1.height + a1.y, g = g > c ? g : c, h = h > d ? h : d);
    }
    if (!i) return b15.EmptyRectangle;
    var m = this._bounds;
    return m.x = e, m.y = f, m.width = g - e, m.height = h - f, m;
}, b15.DisplayObjectContainer.prototype.getLocalBounds = function() {
    var a1 = this.worldTransform;
    this.worldTransform = b15.identityMatrix;
    for(var c = 0, d = this.children.length; d > c; c++)this.children[c].updateTransform();
    var e = this.getBounds();
    return this.worldTransform = a1, e;
}, b15.DisplayObjectContainer.prototype.setStageReference = function(a1) {
    this.stage = a1, this._interactive && (this.stage.dirty = !0);
    for(var b2 = 0, c = this.children.length; c > b2; b2++){
        var d = this.children[b2];
        d.setStageReference(a1);
    }
}, b15.DisplayObjectContainer.prototype.removeStageReference = function() {
    for(var a1 = 0, b2 = this.children.length; b2 > a1; a1++){
        var c = this.children[a1];
        c.removeStageReference();
    }
    this._interactive && (this.stage.dirty = !0), this.stage = null;
}, b15.DisplayObjectContainer.prototype._renderWebGL = function(a1) {
    if (this.visible && !(this.alpha <= 0)) {
        if (this._cacheAsBitmap) return void this._renderCachedSprite(a1);
        var b2, c;
        if (this._mask || this._filters) {
            for(this._filters && (a1.spriteBatch.flush(), a1.filterManager.pushFilter(this._filterBlock)), this._mask && (a1.spriteBatch.stop(), a1.maskManager.pushMask(this.mask, a1), a1.spriteBatch.start()), b2 = 0, c = this.children.length; c > b2; b2++)this.children[b2]._renderWebGL(a1);
            a1.spriteBatch.stop(), this._mask && a1.maskManager.popMask(this._mask, a1), this._filters && a1.filterManager.popFilter(), a1.spriteBatch.start();
        } else for(b2 = 0, c = this.children.length; c > b2; b2++)this.children[b2]._renderWebGL(a1);
    }
}, b15.DisplayObjectContainer.prototype._renderCanvas = function(a1) {
    if (this.visible !== !1 && 0 !== this.alpha) {
        if (this._cacheAsBitmap) return void this._renderCachedSprite(a1);
        this._mask && a1.maskManager.pushMask(this._mask, a1);
        for(var b3 = 0, c = this.children.length; c > b3; b3++){
            var d = this.children[b3];
            d._renderCanvas(a1);
        }
        this._mask && a1.maskManager.popMask(a1);
    }
}, b15.Sprite = function(a1) {
    b15.DisplayObjectContainer.call(this), this.anchor = new b15.Point, this.texture = a1 || b15.Texture.emptyTexture, this._width = 0, this._height = 0, this.tint = 16777215, this.blendMode = b15.blendModes.NORMAL, this.shader = null, this.texture.baseTexture.hasLoaded ? this.onTextureUpdate() : this.texture.on("update", this.onTextureUpdate.bind(this)), this.renderable = !0;
}, b15.Sprite.prototype = Object.create(b15.DisplayObjectContainer.prototype), b15.Sprite.prototype.constructor = b15.Sprite, Object.defineProperty(b15.Sprite.prototype, "width", {
    get: function() {
        return this.scale.x * this.texture.frame.width;
    },
    set: function(a1) {
        this.scale.x = a1 / this.texture.frame.width, this._width = a1;
    }
}), Object.defineProperty(b15.Sprite.prototype, "height", {
    get: function() {
        return this.scale.y * this.texture.frame.height;
    },
    set: function(a1) {
        this.scale.y = a1 / this.texture.frame.height, this._height = a1;
    }
}), b15.Sprite.prototype.setTexture = function(a1) {
    this.texture = a1, this.cachedTint = 16777215;
}, b15.Sprite.prototype.onTextureUpdate = function() {
    this._width && (this.scale.x = this._width / this.texture.frame.width), this._height && (this.scale.y = this._height / this.texture.frame.height);
}, b15.Sprite.prototype.getBounds = function(a1) {
    var b4 = this.texture.frame.width, c = this.texture.frame.height, d = b4 * (1 - this.anchor.x), e = b4 * -this.anchor.x, f = c * (1 - this.anchor.y), g = c * -this.anchor.y, h = a1 || this.worldTransform, i = h.a, j = h.b, k = h.c, l = h.d, m = h.tx, n = h.ty, o = -(1 / 0), p = -(1 / 0), q = 1 / 0, r = 1 / 0;
    if (0 === j && 0 === k) 0 > i && (i *= -1), 0 > l && (l *= -1), q = i * e + m, o = i * d + m, r = l * g + n, p = l * f + n;
    else {
        var s = i * e + k * g + m, t = l * g + j * e + n, u = i * d + k * g + m, v = l * g + j * d + n, w = i * d + k * f + m, x = l * f + j * d + n, y = i * e + k * f + m, z = l * f + j * e + n;
        q = q > s ? s : q, q = q > u ? u : q, q = q > w ? w : q, q = q > y ? y : q, r = r > t ? t : r, r = r > v ? v : r, r = r > x ? x : r, r = r > z ? z : r, o = s > o ? s : o, o = u > o ? u : o, o = w > o ? w : o, o = y > o ? y : o, p = t > p ? t : p, p = v > p ? v : p, p = x > p ? x : p, p = z > p ? z : p;
    }
    var A = this._bounds;
    return A.x = q, A.width = o - q, A.y = r, A.height = p - r, this._currentBounds = A, A;
}, b15.Sprite.prototype._renderWebGL = function(a1) {
    if (this.visible && !(this.alpha <= 0)) {
        var b4, c;
        if (this._mask || this._filters) {
            var d = a1.spriteBatch;
            for(this._filters && (d.flush(), a1.filterManager.pushFilter(this._filterBlock)), this._mask && (d.stop(), a1.maskManager.pushMask(this.mask, a1), d.start()), d.render(this), b4 = 0, c = this.children.length; c > b4; b4++)this.children[b4]._renderWebGL(a1);
            d.stop(), this._mask && a1.maskManager.popMask(this._mask, a1), this._filters && a1.filterManager.popFilter(), d.start();
        } else for(a1.spriteBatch.render(this), b4 = 0, c = this.children.length; c > b4; b4++)this.children[b4]._renderWebGL(a1);
    }
}, b15.Sprite.prototype._renderCanvas = function(a1) {
    if (!(this.visible === !1 || 0 === this.alpha || this.texture.crop.width <= 0 || this.texture.crop.height <= 0)) {
        if (this.blendMode !== a1.currentBlendMode && (a1.currentBlendMode = this.blendMode, a1.context.globalCompositeOperation = b15.blendModesCanvas[a1.currentBlendMode]), this._mask && a1.maskManager.pushMask(this._mask, a1), this.texture.valid) {
            var c = this.texture.baseTexture.resolution / a1.resolution;
            a1.context.globalAlpha = this.worldAlpha, a1.smoothProperty && a1.scaleMode !== this.texture.baseTexture.scaleMode && (a1.scaleMode = this.texture.baseTexture.scaleMode, a1.context[a1.smoothProperty] = a1.scaleMode === b15.scaleModes.LINEAR);
            var d = this.texture.trim ? this.texture.trim.x - this.anchor.x * this.texture.trim.width : this.anchor.x * -this.texture.frame.width, e = this.texture.trim ? this.texture.trim.y - this.anchor.y * this.texture.trim.height : this.anchor.y * -this.texture.frame.height;
            a1.roundPixels ? (a1.context.setTransform(this.worldTransform.a, this.worldTransform.b, this.worldTransform.c, this.worldTransform.d, this.worldTransform.tx * a1.resolution | 0, this.worldTransform.ty * a1.resolution | 0), d = 0 | d, e = 0 | e) : a1.context.setTransform(this.worldTransform.a, this.worldTransform.b, this.worldTransform.c, this.worldTransform.d, this.worldTransform.tx * a1.resolution, this.worldTransform.ty * a1.resolution), 16777215 !== this.tint ? (this.cachedTint !== this.tint && (this.cachedTint = this.tint, this.tintedTexture = b15.CanvasTinter.getTintedTexture(this, this.tint)), a1.context.drawImage(this.tintedTexture, 0, 0, this.texture.crop.width, this.texture.crop.height, d / c, e / c, this.texture.crop.width / c, this.texture.crop.height / c)) : a1.context.drawImage(this.texture.baseTexture.source, this.texture.crop.x, this.texture.crop.y, this.texture.crop.width, this.texture.crop.height, d / c, e / c, this.texture.crop.width / c, this.texture.crop.height / c);
        }
        for(var f = 0, g = this.children.length; g > f; f++)this.children[f]._renderCanvas(a1);
        this._mask && a1.maskManager.popMask(a1);
    }
}, b15.Sprite.fromFrame = function(a1) {
    var c = b15.TextureCache[a1];
    if (!c) throw new Error('The frameId "' + a1 + '" does not exist in the texture cache' + this);
    return new b15.Sprite(c);
}, b15.Sprite.fromImage = function(a1, c, d) {
    var e = b15.Texture.fromImage(a1, c, d);
    return new b15.Sprite(e);
}, b15.SpriteBatch = function(a1) {
    b15.DisplayObjectContainer.call(this), this.textureThing = a1, this.ready = !1;
}, b15.SpriteBatch.prototype = Object.create(b15.DisplayObjectContainer.prototype), b15.SpriteBatch.prototype.constructor = b15.SpriteBatch, b15.SpriteBatch.prototype.initWebGL = function(a1) {
    this.fastSpriteBatch = new b15.WebGLFastSpriteBatch(a1), this.ready = !0;
}, b15.SpriteBatch.prototype.updateTransform = function() {
    this.displayObjectUpdateTransform();
}, b15.SpriteBatch.prototype._renderWebGL = function(a1) {
    !this.visible || this.alpha <= 0 || !this.children.length || (this.ready || this.initWebGL(a1.gl), this.fastSpriteBatch.gl !== a1.gl && this.fastSpriteBatch.setContext(a1.gl), a1.spriteBatch.stop(), a1.shaderManager.setShader(a1.shaderManager.fastShader), this.fastSpriteBatch.begin(this, a1), this.fastSpriteBatch.render(this), a1.spriteBatch.start());
}, b15.SpriteBatch.prototype._renderCanvas = function(a1) {
    if (this.visible && !(this.alpha <= 0) && this.children.length) {
        var b5 = a1.context;
        b5.globalAlpha = this.worldAlpha, this.displayObjectUpdateTransform();
        for(var c = this.worldTransform, d = !0, e = 0; e < this.children.length; e++){
            var f = this.children[e];
            if (f.visible) {
                var g = f.texture, h = g.frame;
                if (b5.globalAlpha = this.worldAlpha * f.alpha, f.rotation % (2 * Math.PI) === 0) d && (b5.setTransform(c.a, c.b, c.c, c.d, c.tx, c.ty), d = !1), b5.drawImage(g.baseTexture.source, h.x, h.y, h.width, h.height, f.anchor.x * -h.width * f.scale.x + f.position.x + 0.5 | 0, f.anchor.y * -h.height * f.scale.y + f.position.y + 0.5 | 0, h.width * f.scale.x, h.height * f.scale.y);
                else {
                    d || (d = !0), f.displayObjectUpdateTransform();
                    var i = f.worldTransform;
                    a1.roundPixels ? b5.setTransform(i.a, i.b, i.c, i.d, 0 | i.tx, 0 | i.ty) : b5.setTransform(i.a, i.b, i.c, i.d, i.tx, i.ty), b5.drawImage(g.baseTexture.source, h.x, h.y, h.width, h.height, f.anchor.x * -h.width + 0.5 | 0, f.anchor.y * -h.height + 0.5 | 0, h.width, h.height);
                }
            }
        }
    }
}, b15.MovieClip = function(a1) {
    b15.Sprite.call(this, a1[0]), this.textures = a1, this.animationSpeed = 1, this.loop = !0, this.onComplete = null, this.currentFrame = 0, this.playing = !1;
}, b15.MovieClip.prototype = Object.create(b15.Sprite.prototype), b15.MovieClip.prototype.constructor = b15.MovieClip, Object.defineProperty(b15.MovieClip.prototype, "totalFrames", {
    get: function() {
        return this.textures.length;
    }
}), b15.MovieClip.prototype.stop = function() {
    this.playing = !1;
}, b15.MovieClip.prototype.play = function() {
    this.playing = !0;
}, b15.MovieClip.prototype.gotoAndStop = function(a1) {
    this.playing = !1, this.currentFrame = a1;
    var b6 = this.currentFrame + 0.5 | 0;
    this.setTexture(this.textures[b6 % this.textures.length]);
}, b15.MovieClip.prototype.gotoAndPlay = function(a1) {
    this.currentFrame = a1, this.playing = !0;
}, b15.MovieClip.prototype.updateTransform = function() {
    if (this.displayObjectContainerUpdateTransform(), this.playing) {
        this.currentFrame += this.animationSpeed;
        var a1 = this.currentFrame + 0.5 | 0;
        this.currentFrame = this.currentFrame % this.textures.length, this.loop || a1 < this.textures.length ? this.setTexture(this.textures[a1 % this.textures.length]) : a1 >= this.textures.length && (this.gotoAndStop(this.textures.length - 1), this.onComplete && this.onComplete());
    }
}, b15.MovieClip.fromFrames = function(a2) {
    for(var c = [], d = 0; d < a2.length; d++)c.push(new b15.Texture.fromFrame(a2[d]));
    return new b15.MovieClip(c);
}, b15.MovieClip.fromImages = function(a2) {
    for(var c = [], d = 0; d < a2.length; d++)c.push(new b15.Texture.fromImage(a2[d]));
    return new b15.MovieClip(c);
}, b15.FilterBlock = function() {
    this.visible = !0, this.renderable = !0;
}, b15.FilterBlock.prototype.constructor = b15.FilterBlock, b15.Text = function(a2, c) {
    this.canvas = document.createElement("canvas"), this.context = this.canvas.getContext("2d"), this.resolution = 1, b15.Sprite.call(this, b15.Texture.fromCanvas(this.canvas)), this.setText(a2), this.setStyle(c);
}, b15.Text.prototype = Object.create(b15.Sprite.prototype), b15.Text.prototype.constructor = b15.Text, Object.defineProperty(b15.Text.prototype, "width", {
    get: function() {
        return this.dirty && (this.updateText(), this.dirty = !1), this.scale.x * this.texture.frame.width;
    },
    set: function(a2) {
        this.scale.x = a2 / this.texture.frame.width, this._width = a2;
    }
}), Object.defineProperty(b15.Text.prototype, "height", {
    get: function() {
        return this.dirty && (this.updateText(), this.dirty = !1), this.scale.y * this.texture.frame.height;
    },
    set: function(a2) {
        this.scale.y = a2 / this.texture.frame.height, this._height = a2;
    }
}), b15.Text.prototype.setStyle = function(a2) {
    a2 = a2 || {
    }, a2.font = a2.font || "bold 20pt Arial", a2.fill = a2.fill || "black", a2.align = a2.align || "left", a2.stroke = a2.stroke || "black", a2.strokeThickness = a2.strokeThickness || 0, a2.wordWrap = a2.wordWrap || !1, a2.wordWrapWidth = a2.wordWrapWidth || 100, a2.dropShadow = a2.dropShadow || !1, a2.dropShadowAngle = a2.dropShadowAngle || Math.PI / 6, a2.dropShadowDistance = a2.dropShadowDistance || 4, a2.dropShadowColor = a2.dropShadowColor || "black", a2.lineJoin = a2.lineJoin || "miter", this.style = a2, this.dirty = !0;
}, b15.Text.prototype.setText = function(a2) {
    this.text = a2.toString() || " ", this.dirty = !0;
}, b15.Text.prototype.updateText = function() {
    this.texture.baseTexture.resolution = this.resolution, this.context.font = this.style.font;
    var a2 = this.text;
    this.style.wordWrap && (a2 = this.wordWrap(this.text));
    for(var b6 = a2.split(/(?:\r\n|\r|\n)/), c = [], d = 0, e = this.determineFontProperties(this.style.font), f = 0; f < b6.length; f++){
        var g = this.context.measureText(b6[f]).width;
        c[f] = g, d = Math.max(d, g);
    }
    var h = d + this.style.strokeThickness;
    this.style.dropShadow && (h += this.style.dropShadowDistance), this.canvas.width = (h + this.context.lineWidth) * this.resolution;
    var i = e.fontSize + this.style.strokeThickness, j = i * b6.length;
    this.style.dropShadow && (j += this.style.dropShadowDistance), this.canvas.height = j * this.resolution, this.context.scale(this.resolution, this.resolution), navigator.isCocoonJS && this.context.clearRect(0, 0, this.canvas.width, this.canvas.height), this.context.font = this.style.font, this.context.strokeStyle = this.style.stroke, this.context.lineWidth = this.style.strokeThickness, this.context.textBaseline = "alphabetic", this.context.lineJoin = this.style.lineJoin;
    var k, l;
    if (this.style.dropShadow) {
        this.context.fillStyle = this.style.dropShadowColor;
        var m = Math.sin(this.style.dropShadowAngle) * this.style.dropShadowDistance, n = Math.cos(this.style.dropShadowAngle) * this.style.dropShadowDistance;
        for(f = 0; f < b6.length; f++)k = this.style.strokeThickness / 2, l = this.style.strokeThickness / 2 + f * i + e.ascent, "right" === this.style.align ? k += d - c[f] : "center" === this.style.align && (k += (d - c[f]) / 2), this.style.fill && this.context.fillText(b6[f], k + m, l + n);
    }
    for(this.context.fillStyle = this.style.fill, f = 0; f < b6.length; f++)k = this.style.strokeThickness / 2, l = this.style.strokeThickness / 2 + f * i + e.ascent, "right" === this.style.align ? k += d - c[f] : "center" === this.style.align && (k += (d - c[f]) / 2), this.style.stroke && this.style.strokeThickness && this.context.strokeText(b6[f], k, l), this.style.fill && this.context.fillText(b6[f], k, l);
    this.updateTexture();
}, b15.Text.prototype.updateTexture = function() {
    this.texture.baseTexture.width = this.canvas.width, this.texture.baseTexture.height = this.canvas.height, this.texture.crop.width = this.texture.frame.width = this.canvas.width, this.texture.crop.height = this.texture.frame.height = this.canvas.height, this._width = this.canvas.width, this._height = this.canvas.height, this.texture.baseTexture.dirty();
}, b15.Text.prototype._renderWebGL = function(a2) {
    this.dirty && (this.resolution = a2.resolution, this.updateText(), this.dirty = !1), b15.Sprite.prototype._renderWebGL.call(this, a2);
}, b15.Text.prototype._renderCanvas = function(a2) {
    this.dirty && (this.resolution = a2.resolution, this.updateText(), this.dirty = !1), b15.Sprite.prototype._renderCanvas.call(this, a2);
}, b15.Text.prototype.determineFontProperties = function(a2) {
    var c = b15.Text.fontPropertiesCache[a2];
    if (!c) {
        c = {
        };
        var d = b15.Text.fontPropertiesCanvas, e = b15.Text.fontPropertiesContext;
        e.font = a2;
        var f = Math.ceil(e.measureText("|Mq").width), g = Math.ceil(e.measureText("M").width), h = 2 * g;
        g = 1.4 * g | 0, d.width = f, d.height = h, e.fillStyle = "#f00", e.fillRect(0, 0, f, h), e.font = a2, e.textBaseline = "alphabetic", e.fillStyle = "#000", e.fillText("|MÉq", 0, g);
        var i, j, k = e.getImageData(0, 0, f, h).data, l = k.length, m = 4 * f, n = 0, o = !1;
        for(i = 0; g > i; i++){
            for(j = 0; m > j; j += 4)if (255 !== k[n + j]) {
                o = !0;
                break;
            }
            if (o) break;
            n += m;
        }
        for(c.ascent = g - i, n = l - m, o = !1, i = h; i > g; i--){
            for(j = 0; m > j; j += 4)if (255 !== k[n + j]) {
                o = !0;
                break;
            }
            if (o) break;
            n -= m;
        }
        c.descent = i - g, c.descent += 6, c.fontSize = c.ascent + c.descent, b15.Text.fontPropertiesCache[a2] = c;
    }
    return c;
}, b15.Text.prototype.wordWrap = function(a2) {
    for(var b6 = "", c = a2.split("\n"), d = 0; d < c.length; d++){
        for(var e = this.style.wordWrapWidth, f = c[d].split(" "), g = 0; g < f.length; g++){
            var h = this.context.measureText(f[g]).width, i = h + this.context.measureText(" ").width;
            0 === g || i > e ? (g > 0 && (b6 += "\n"), b6 += f[g], e = this.style.wordWrapWidth - h) : (e -= i, b6 += " " + f[g]);
        }
        d < c.length - 1 && (b6 += "\n");
    }
    return b6;
}, b15.Text.prototype.getBounds = function(a2) {
    return this.dirty && (this.updateText(), this.dirty = !1), b15.Sprite.prototype.getBounds.call(this, a2);
}, b15.Text.prototype.destroy = function(a2) {
    this.context = null, this.canvas = null, this.texture.destroy((void 0) === a2 ? !0 : a2);
}, b15.Text.fontPropertiesCache = {
}, b15.Text.fontPropertiesCanvas = document.createElement("canvas"), b15.Text.fontPropertiesContext = b15.Text.fontPropertiesCanvas.getContext("2d"), b15.BitmapText = function(a2, c) {
    b15.DisplayObjectContainer.call(this), this.textWidth = 0, this.textHeight = 0, this._pool = [], this.setText(a2), this.setStyle(c), this.updateText(), this.dirty = !1;
}, b15.BitmapText.prototype = Object.create(b15.DisplayObjectContainer.prototype), b15.BitmapText.prototype.constructor = b15.BitmapText, b15.BitmapText.prototype.setText = function(a2) {
    this.text = a2 || " ", this.dirty = !0;
}, b15.BitmapText.prototype.setStyle = function(a2) {
    a2 = a2 || {
    }, a2.align = a2.align || "left", this.style = a2;
    var c = a2.font.split(" ");
    this.fontName = c[c.length - 1], this.fontSize = c.length >= 2 ? parseInt(c[c.length - 2], 10) : b15.BitmapText.fonts[this.fontName].size, this.dirty = !0, this.tint = a2.tint;
}, b15.BitmapText.prototype.updateText = function() {
    for(var a2 = b15.BitmapText.fonts[this.fontName], c = new b15.Point, d = null, e = [], f = 0, g = [], h = 0, i = this.fontSize / a2.size, j = 0; j < this.text.length; j++){
        var k = this.text.charCodeAt(j);
        if (/(?:\r\n|\r|\n)/.test(this.text.charAt(j))) g.push(c.x), f = Math.max(f, c.x), h++, c.x = 0, c.y += a2.lineHeight, d = null;
        else {
            var l = a2.chars[k];
            l && (d && l.kerning[d] && (c.x += l.kerning[d]), e.push({
                texture: l.texture,
                line: h,
                charCode: k,
                position: new b15.Point(c.x + l.xOffset, c.y + l.yOffset)
            }), c.x += l.xAdvance, d = k);
        }
    }
    g.push(c.x), f = Math.max(f, c.x);
    var m = [];
    for(j = 0; h >= j; j++){
        var n = 0;
        "right" === this.style.align ? n = f - g[j] : "center" === this.style.align && (n = (f - g[j]) / 2), m.push(n);
    }
    var o = this.children.length, p = e.length, q = this.tint || 16777215;
    for(j = 0; p > j; j++){
        var r = o > j ? this.children[j] : this._pool.pop();
        r ? r.setTexture(e[j].texture) : r = new b15.Sprite(e[j].texture), r.position.x = (e[j].position.x + m[e[j].line]) * i, r.position.y = e[j].position.y * i, r.scale.x = r.scale.y = i, r.tint = q, r.parent || this.addChild(r);
    }
    for(; this.children.length > p;){
        var s = this.getChildAt(this.children.length - 1);
        this._pool.push(s), this.removeChild(s);
    }
    this.textWidth = f * i, this.textHeight = (c.y + a2.lineHeight) * i;
}, b15.BitmapText.prototype.updateTransform = function() {
    this.dirty && (this.updateText(), this.dirty = !1), b15.DisplayObjectContainer.prototype.updateTransform.call(this);
}, b15.BitmapText.fonts = {
}, b15.InteractionData = function() {
    this.global = new b15.Point, this.target = null, this.originalEvent = null;
}, b15.InteractionData.prototype.getLocalPosition = function(a2, c, d) {
    var e = a2.worldTransform, f = d ? d : this.global, g = e.a, h = e.c, i = e.tx, j = e.b, k = e.d, l = e.ty, m = 1 / (g * k + h * -j);
    return c = c || new b15.Point, c.x = k * m * f.x + -h * m * f.y + (l * h - i * k) * m, c.y = g * m * f.y + -j * m * f.x + (-l * g + i * j) * m, c;
}, b15.InteractionData.prototype.constructor = b15.InteractionData, b15.InteractionManager = function(a2) {
    this.stage = a2, this.mouse = new b15.InteractionData, this.touches = {
    }, this.tempPoint = new b15.Point, this.mouseoverEnabled = !0, this.pool = [], this.interactiveItems = [], this.interactionDOMElement = null, this.onMouseMove = this.onMouseMove.bind(this), this.onMouseDown = this.onMouseDown.bind(this), this.onMouseOut = this.onMouseOut.bind(this), this.onMouseUp = this.onMouseUp.bind(this), this.onTouchStart = this.onTouchStart.bind(this), this.onTouchEnd = this.onTouchEnd.bind(this), this.onTouchCancel = this.onTouchCancel.bind(this), this.onTouchMove = this.onTouchMove.bind(this), this.last = 0, this.currentCursorStyle = "inherit", this.mouseOut = !1, this.resolution = 1, this._tempPoint = new b15.Point;
}, b15.InteractionManager.prototype.constructor = b15.InteractionManager, b15.InteractionManager.prototype.collectInteractiveSprite = function(a2, b6) {
    for(var c = a2.children, d = c.length, e = d - 1; e >= 0; e--){
        var f = c[e];
        f._interactive ? (b6.interactiveChildren = !0, this.interactiveItems.push(f), f.children.length > 0 && this.collectInteractiveSprite(f, f)) : (f.__iParent = null, f.children.length > 0 && this.collectInteractiveSprite(f, b6));
    }
}, b15.InteractionManager.prototype.setTarget = function(a2) {
    this.target = a2, this.resolution = a2.resolution, null === this.interactionDOMElement && this.setTargetDomElement(a2.view);
}, b15.InteractionManager.prototype.setTargetDomElement = function(a2) {
    this.removeEvents(), window.navigator.msPointerEnabled && (a2.style["-ms-content-zooming"] = "none", a2.style["-ms-touch-action"] = "none"), this.interactionDOMElement = a2, a2.addEventListener("mousemove", this.onMouseMove, !0), a2.addEventListener("mousedown", this.onMouseDown, !0), a2.addEventListener("mouseout", this.onMouseOut, !0), a2.addEventListener("touchstart", this.onTouchStart, !0), a2.addEventListener("touchend", this.onTouchEnd, !0), a2.addEventListener("touchleave", this.onTouchCancel, !0), a2.addEventListener("touchcancel", this.onTouchCancel, !0), a2.addEventListener("touchmove", this.onTouchMove, !0), window.addEventListener("mouseup", this.onMouseUp, !0);
}, b15.InteractionManager.prototype.removeEvents = function() {
    this.interactionDOMElement && (this.interactionDOMElement.style["-ms-content-zooming"] = "", this.interactionDOMElement.style["-ms-touch-action"] = "", this.interactionDOMElement.removeEventListener("mousemove", this.onMouseMove, !0), this.interactionDOMElement.removeEventListener("mousedown", this.onMouseDown, !0), this.interactionDOMElement.removeEventListener("mouseout", this.onMouseOut, !0), this.interactionDOMElement.removeEventListener("touchstart", this.onTouchStart, !0), this.interactionDOMElement.removeEventListener("touchend", this.onTouchEnd, !0), this.interactionDOMElement.removeEventListener("touchleave", this.onTouchCancel, !0), this.interactionDOMElement.removeEventListener("touchcancel", this.onTouchCancel, !0), this.interactionDOMElement.removeEventListener("touchmove", this.onTouchMove, !0), this.interactionDOMElement = null, window.removeEventListener("mouseup", this.onMouseUp, !0));
}, b15.InteractionManager.prototype.update = function() {
    if (this.target) {
        var a2 = Date.now(), c = a2 - this.last;
        if (c = c * b15.INTERACTION_FREQUENCY / 1000, !(1 > c)) {
            this.last = a2;
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
}, b15.InteractionManager.prototype.rebuildInteractiveGraph = function() {
    this.dirty = !1;
    for(var a3 = this.interactiveItems.length, b6 = 0; a3 > b6; b6++)this.interactiveItems[b6].interactiveChildren = !1;
    this.interactiveItems = [], this.stage.interactive && this.interactiveItems.push(this.stage), this.collectInteractiveSprite(this.stage, this.stage);
}, b15.InteractionManager.prototype.onMouseMove = function(a3) {
    this.dirty && this.rebuildInteractiveGraph(), this.mouse.originalEvent = a3;
    var b6 = this.interactionDOMElement.getBoundingClientRect();
    this.mouse.global.x = (a3.clientX - b6.left) * (this.target.width / b6.width) / this.resolution, this.mouse.global.y = (a3.clientY - b6.top) * (this.target.height / b6.height) / this.resolution;
    for(var c = this.interactiveItems.length, d = 0; c > d; d++){
        var e = this.interactiveItems[d];
        e.mousemove && e.mousemove(this.mouse);
    }
}, b15.InteractionManager.prototype.onMouseDown = function(a3) {
    this.dirty && this.rebuildInteractiveGraph(), this.mouse.originalEvent = a3, b15.AUTO_PREVENT_DEFAULT && this.mouse.originalEvent.preventDefault();
    for(var c = this.interactiveItems.length, d = this.mouse.originalEvent, e = 2 === d.button || 3 === d.which, f = e ? "rightdown" : "mousedown", g = e ? "rightclick" : "click", h = e ? "__rightIsDown" : "__mouseIsDown", i = e ? "__isRightDown" : "__isDown", j = 0; c > j; j++){
        var k = this.interactiveItems[j];
        if ((k[f] || k[g]) && (k[h] = !0, k.__hit = this.hitTest(k, this.mouse), k.__hit && (k[f] && k[f](this.mouse), k[i] = !0, !k.interactiveChildren))) break;
    }
}, b15.InteractionManager.prototype.onMouseOut = function(a3) {
    this.dirty && this.rebuildInteractiveGraph(), this.mouse.originalEvent = a3;
    var b6 = this.interactiveItems.length;
    this.interactionDOMElement.style.cursor = "inherit";
    for(var c = 0; b6 > c; c++){
        var d = this.interactiveItems[c];
        d.__isOver && (this.mouse.target = d, d.mouseout && d.mouseout(this.mouse), d.__isOver = !1);
    }
    this.mouseOut = !0, this.mouse.global.x = -10000, this.mouse.global.y = -10000;
}, b15.InteractionManager.prototype.onMouseUp = function(a3) {
    this.dirty && this.rebuildInteractiveGraph(), this.mouse.originalEvent = a3;
    for(var b6 = this.interactiveItems.length, c = !1, d = this.mouse.originalEvent, e = 2 === d.button || 3 === d.which, f = e ? "rightup" : "mouseup", g = e ? "rightclick" : "click", h = e ? "rightupoutside" : "mouseupoutside", i = e ? "__isRightDown" : "__isDown", j = 0; b6 > j; j++){
        var k = this.interactiveItems[j];
        (k[g] || k[f] || k[h]) && (k.__hit = this.hitTest(k, this.mouse), k.__hit && !c ? (k[f] && k[f](this.mouse), k[i] && k[g] && k[g](this.mouse), k.interactiveChildren || (c = !0)) : k[i] && k[h] && k[h](this.mouse), k[i] = !1);
    }
}, b15.InteractionManager.prototype.hitTest = function(a3, c) {
    var d = c.global;
    if (!a3.worldVisible) return !1;
    a3.worldTransform.applyInverse(d, this._tempPoint);
    var e, f = this._tempPoint.x, g = this._tempPoint.y;
    if (c.target = a3, a3.hitArea && a3.hitArea.contains) return a3.hitArea.contains(f, g);
    if (a3 instanceof b15.Sprite) {
        var h, i = a3.texture.frame.width, j = a3.texture.frame.height, k = -i * a3.anchor.x;
        if (f > k && k + i > f && (h = -j * a3.anchor.y, g > h && h + j > g)) return !0;
    } else if (a3 instanceof b15.Graphics) {
        var l = a3.graphicsData;
        for(e = 0; e < l.length; e++){
            var m = l[e];
            if (m.fill && m.shape && m.shape.contains(f, g)) return !0;
        }
    }
    var n = a3.children.length;
    for(e = 0; n > e; e++){
        var o = a3.children[e], p = this.hitTest(o, c);
        if (p) return c.target = a3, !0;
    }
    return !1;
}, b15.InteractionManager.prototype.onTouchMove = function(a3) {
    this.dirty && this.rebuildInteractiveGraph();
    for(var b6, c, d = this.interactionDOMElement.getBoundingClientRect(), e = a3.changedTouches, f = e.length, g = this.target.width / d.width, h = this.target.height / d.height, i = navigator.isCocoonJS && !d.left && !d.top && !a3.target.style.width && !a3.target.style.height, j = 0; f > j; j++)c = e[j], i ? (c.globalX = c.clientX, c.globalY = c.clientY) : (c.globalX = (c.clientX - d.left) * g / this.resolution, c.globalY = (c.clientY - d.top) * h / this.resolution);
    for(var k = 0; f > k; k++){
        c = e[k], b6 = this.touches[c.identifier], b6.originalEvent = a3, i ? (b6.global.x = c.clientX, b6.global.y = c.clientY) : (c.globalX = b6.global.x = (c.clientX - d.left) * g / this.resolution, c.globalY = b6.global.y = (c.clientY - d.top) * h / this.resolution);
        for(var l = 0; l < this.interactiveItems.length; l++){
            var m = this.interactiveItems[l];
            m.touchmove && m.__touchData && m.__touchData[c.identifier] && m.touchmove(b6);
        }
    }
}, b15.InteractionManager.prototype.onTouchStart = function(a3) {
    this.dirty && this.rebuildInteractiveGraph();
    var c = this.interactionDOMElement.getBoundingClientRect();
    b15.AUTO_PREVENT_DEFAULT && a3.preventDefault();
    for(var d, e = a3.changedTouches, f = e.length, g = this.target.width / c.width, h = this.target.height / c.height, i = navigator.isCocoonJS && !c.left && !c.top && !a3.target.style.width && !a3.target.style.height, j = 0; f > j; j++)d = e[j], i ? (d.globalX = d.clientX, d.globalY = d.clientY) : (d.globalX = (d.clientX - c.left) * g / this.resolution, d.globalY = (d.clientY - c.top) * h / this.resolution);
    for(var k = 0; f > k; k++){
        d = e[k];
        var l = this.pool.pop();
        l || (l = new b15.InteractionData), l.originalEvent = a3, this.touches[d.identifier] = l, i ? (l.global.x = d.clientX, l.global.y = d.clientY) : (l.global.x = (d.clientX - c.left) * g / this.resolution, l.global.y = (d.clientY - c.top) * h / this.resolution);
        for(var m = this.interactiveItems.length, n = 0; m > n; n++){
            var o = this.interactiveItems[n];
            if ((o.touchstart || o.tap) && (o.__hit = this.hitTest(o, l), o.__hit && (o.touchstart && o.touchstart(l), o.__isDown = !0, o.__touchData = o.__touchData || {
            }, o.__touchData[d.identifier] = l, !o.interactiveChildren))) break;
        }
    }
}, b15.InteractionManager.prototype.onTouchEnd = function(a3) {
    this.dirty && this.rebuildInteractiveGraph();
    for(var b6, c = this.interactionDOMElement.getBoundingClientRect(), d = a3.changedTouches, e = d.length, f = this.target.width / c.width, g = this.target.height / c.height, h = navigator.isCocoonJS && !c.left && !c.top && !a3.target.style.width && !a3.target.style.height, i = 0; e > i; i++)b6 = d[i], h ? (b6.globalX = b6.clientX, b6.globalY = b6.clientY) : (b6.globalX = (b6.clientX - c.left) * f / this.resolution, b6.globalY = (b6.clientY - c.top) * g / this.resolution);
    for(var j = 0; e > j; j++){
        b6 = d[j];
        var k = this.touches[b6.identifier], l = !1;
        h ? (k.global.x = b6.clientX, k.global.y = b6.clientY) : (k.global.x = (b6.clientX - c.left) * f / this.resolution, k.global.y = (b6.clientY - c.top) * g / this.resolution);
        for(var m = this.interactiveItems.length, n = 0; m > n; n++){
            var o = this.interactiveItems[n];
            o.__touchData && o.__touchData[b6.identifier] && (o.__hit = this.hitTest(o, o.__touchData[b6.identifier]), k.originalEvent = a3, (o.touchend || o.tap) && (o.__hit && !l ? (o.touchend && o.touchend(k), o.__isDown && o.tap && o.tap(k), o.interactiveChildren || (l = !0)) : o.__isDown && o.touchendoutside && o.touchendoutside(k), o.__isDown = !1), o.__touchData[b6.identifier] = null);
        }
        this.pool.push(k), this.touches[b6.identifier] = null;
    }
}, b15.InteractionManager.prototype.onTouchCancel = function(a3) {
    this.dirty && this.rebuildInteractiveGraph();
    for(var b6, c = this.interactionDOMElement.getBoundingClientRect(), d = a3.changedTouches, e = d.length, f = this.target.width / c.width, g = this.target.height / c.height, h = navigator.isCocoonJS && !c.left && !c.top && !a3.target.style.width && !a3.target.style.height, i = 0; e > i; i++)b6 = d[i], h ? (b6.globalX = b6.clientX, b6.globalY = b6.clientY) : (b6.globalX = (b6.clientX - c.left) * f / this.resolution, b6.globalY = (b6.clientY - c.top) * g / this.resolution);
    for(var j = 0; e > j; j++){
        b6 = d[j];
        var k = this.touches[b6.identifier], l = !1;
        h ? (k.global.x = b6.clientX, k.global.y = b6.clientY) : (k.global.x = (b6.clientX - c.left) * f / this.resolution, k.global.y = (b6.clientY - c.top) * g / this.resolution);
        for(var m = this.interactiveItems.length, n = 0; m > n; n++){
            var o = this.interactiveItems[n];
            o.__touchData && o.__touchData[b6.identifier] && (o.__hit = this.hitTest(o, o.__touchData[b6.identifier]), k.originalEvent = a3, o.touchcancel && !l && (o.touchcancel(k), o.interactiveChildren || (l = !0)), o.__isDown = !1, o.__touchData[b6.identifier] = null);
        }
        this.pool.push(k), this.touches[b6.identifier] = null;
    }
}, b15.Stage = function(a3) {
    b15.DisplayObjectContainer.call(this), this.worldTransform = new b15.Matrix, this.interactive = !0, this.interactionManager = new b15.InteractionManager(this), this.dirty = !0, this.stage = this, this.stage.hitArea = new b15.Rectangle(0, 0, 100000, 100000), this.setBackgroundColor(a3);
}, b15.Stage.prototype = Object.create(b15.DisplayObjectContainer.prototype), b15.Stage.prototype.constructor = b15.Stage, b15.Stage.prototype.setInteractionDelegate = function(a3) {
    this.interactionManager.setTargetDomElement(a3);
}, b15.Stage.prototype.updateTransform = function() {
    this.worldAlpha = 1;
    for(var a3 = 0, b6 = this.children.length; b6 > a3; a3++)this.children[a3].updateTransform();
    this.dirty && (this.dirty = !1, this.interactionManager.dirty = !0), this.interactive && this.interactionManager.update();
}, b15.Stage.prototype.setBackgroundColor = function(a3) {
    this.backgroundColor = a3 || 0, this.backgroundColorSplit = b15.hex2rgb(this.backgroundColor);
    var c = this.backgroundColor.toString(16);
    c = "000000".substr(0, 6 - c.length) + c, this.backgroundColorString = "#" + c;
}, b15.Stage.prototype.getMousePosition = function() {
    return this.interactionManager.mouse.global;
}, (function(a3) {
    for(var b6 = 0, c = [
        "ms",
        "moz",
        "webkit",
        "o"
    ], d = 0; d < c.length && !a3.requestAnimationFrame; ++d)a3.requestAnimationFrame = a3[c[d] + "RequestAnimationFrame"], a3.cancelAnimationFrame = a3[c[d] + "CancelAnimationFrame"] || a3[c[d] + "CancelRequestAnimationFrame"];
    a3.requestAnimationFrame || (a3.requestAnimationFrame = function(c1) {
        var d1 = (new Date).getTime(), e = Math.max(0, 16 - (d1 - b6)), f = a3.setTimeout(function() {
            c1(d1 + e);
        }, e);
        return b6 = d1 + e, f;
    }), a3.cancelAnimationFrame || (a3.cancelAnimationFrame = function(a4) {
        clearTimeout(a4);
    }), a3.requestAnimFrame = a3.requestAnimationFrame;
})(this), b15.hex2rgb = function(a3) {
    return [
        (a3 >> 16 & 255) / 255,
        (a3 >> 8 & 255) / 255,
        (255 & a3) / 255
    ];
}, b15.rgb2hex = function(a3) {
    return (255 * a3[0] << 16) + (255 * a3[1] << 8) + 255 * a3[2];
}, "function" != typeof Function.prototype.bind && (Function.prototype.bind = (function() {
    return function(a3) {
        function b6() {
            for(var d = arguments.length, f = new Array(d); d--;)f[d] = arguments[d];
            return f = e.concat(f), c.apply(this instanceof b6 ? this : a3, f);
        }
        var c = this, d = arguments.length - 1, e = [];
        if (d > 0) for(e.length = d; d--;)e[d] = arguments[d + 1];
        if ("function" != typeof c) throw new TypeError;
        return b6.prototype = (function f(a4) {
            return a4 && (f.prototype = a4), this instanceof f ? void 0 : new f;
        })(c.prototype), b6;
    };
})()), b15.AjaxRequest = function() {
    var a3 = [
        "Msxml2.XMLHTTP.6.0",
        "Msxml2.XMLHTTP.3.0",
        "Microsoft.XMLHTTP"
    ];
    if (!window.ActiveXObject) return window.XMLHttpRequest ? new window.XMLHttpRequest : !1;
    for(var b6 = 0; b6 < a3.length; b6++)try {
        return new window.ActiveXObject(a3[b6]);
    } catch (c) {
    }
}, b15.canUseNewCanvasBlendModes = function() {
    if ("undefined" == typeof document) return !1;
    var a3 = document.createElement("canvas");
    a3.width = 1, a3.height = 1;
    var b6 = a3.getContext("2d");
    return b6.fillStyle = "#000", b6.fillRect(0, 0, 1, 1), b6.globalCompositeOperation = "multiply", b6.fillStyle = "#fff", b6.fillRect(0, 0, 1, 1), 0 === b6.getImageData(0, 0, 1, 1).data[0];
}, b15.getNextPowerOfTwo = function(a3) {
    if (a3 > 0 && 0 === (a3 & a3 - 1)) return a3;
    for(var b6 = 1; a3 > b6;)b6 <<= 1;
    return b6;
}, b15.isPowerOfTwo = function(a3, b6) {
    return a3 > 0 && 0 === (a3 & a3 - 1) && b6 > 0 && 0 === (b6 & b6 - 1);
}, b15.EventTarget = {
    call: function(a3) {
        a3 && (a3 = a3.prototype || a3, b15.EventTarget.mixin(a3));
    },
    mixin: function(a3) {
        a3.listeners = function(a4) {
            return this._listeners = this._listeners || {
            }, this._listeners[a4] ? this._listeners[a4].slice() : [];
        }, a3.emit = a3.dispatchEvent = function(a4, c) {
            if (this._listeners = this._listeners || {
            }, "object" == typeof a4 && (c = a4, a4 = a4.type), c && c.__isEventObject === !0 || (c = new b15.Event(this, a4, c)), this._listeners && this._listeners[a4]) {
                var d, e = this._listeners[a4].slice(0), f = e.length, g = e[0];
                for(d = 0; f > d; g = e[++d])if (g.call(this, c), c.stoppedImmediate) return this;
                if (c.stopped) return this;
            }
            return this.parent && this.parent.emit && this.parent.emit.call(this.parent, a4, c), this;
        }, a3.on = a3.addEventListener = function(a4, b6) {
            return this._listeners = this._listeners || {
            }, (this._listeners[a4] = this._listeners[a4] || []).push(b6), this;
        }, a3.once = function(a4, b6) {
            function c() {
                b6.apply(d.off(a4, c), arguments);
            }
            this._listeners = this._listeners || {
            };
            var d = this;
            return c._originalHandler = b6, this.on(a4, c);
        }, a3.off = a3.removeEventListener = function(a4, b6) {
            if (this._listeners = this._listeners || {
            }, !this._listeners[a4]) return this;
            for(var c = this._listeners[a4], d = b6 ? c.length : 0; (d--) > 0;)(c[d] === b6 || c[d]._originalHandler === b6) && c.splice(d, 1);
            return 0 === c.length && delete this._listeners[a4], this;
        }, a3.removeAllListeners = function(a4) {
            return this._listeners = this._listeners || {
            }, this._listeners[a4] ? (delete this._listeners[a4], this) : this;
        };
    }
}, b15.Event = function(a3, b6, c) {
    this.__isEventObject = !0, this.stopped = !1, this.stoppedImmediate = !1, this.target = a3, this.type = b6, this.data = c, this.content = c, this.timeStamp = Date.now();
}, b15.Event.prototype.stopPropagation = function() {
    this.stopped = !0;
}, b15.Event.prototype.stopImmediatePropagation = function() {
    this.stoppedImmediate = !0;
}, b15.autoDetectRenderer = function(a3, c, d) {
    a3 || (a3 = 800), c || (c = 600);
    var e = function() {
        try {
            var a4 = document.createElement("canvas");
            return !!window.WebGLRenderingContext && (a4.getContext("webgl") || a4.getContext("experimental-webgl"));
        } catch (b6) {
            return !1;
        }
    }();
    return e ? new b15.WebGLRenderer(a3, c, d) : new b15.CanvasRenderer(a3, c, d);
}, b15.autoDetectRecommendedRenderer = function(a3, c, d) {
    a3 || (a3 = 800), c || (c = 600);
    var e = function() {
        try {
            var a4 = document.createElement("canvas");
            return !!window.WebGLRenderingContext && (a4.getContext("webgl") || a4.getContext("experimental-webgl"));
        } catch (b6) {
            return !1;
        }
    }(), f = /Android/i.test(navigator.userAgent);
    return e && !f ? new b15.WebGLRenderer(a3, c, d) : new b15.CanvasRenderer(a3, c, d);
}, b15.PolyK = {
}, b15.PolyK.Triangulate = function(a3) {
    var c = !0, d = a3.length >> 1;
    if (3 > d) return [];
    for(var e = [], f = [], g = 0; d > g; g++)f.push(g);
    g = 0;
    for(var h = d; h > 3;){
        var i = f[(g + 0) % h], j = f[(g + 1) % h], k = f[(g + 2) % h], l = a3[2 * i], m = a3[2 * i + 1], n = a3[2 * j], o = a3[2 * j + 1], p = a3[2 * k], q = a3[2 * k + 1], r = !1;
        if (b15.PolyK._convex(l, m, n, o, p, q, c)) {
            r = !0;
            for(var s = 0; h > s; s++){
                var t = f[s];
                if (t !== i && t !== j && t !== k && b15.PolyK._PointInTriangle(a3[2 * t], a3[2 * t + 1], l, m, n, o, p, q)) {
                    r = !1;
                    break;
                }
            }
        }
        if (r) e.push(i, j, k), f.splice((g + 1) % h, 1), h--, g = 0;
        else if ((g++) > 3 * h) {
            if (!c) return null;
            for(e = [], f = [], g = 0; d > g; g++)f.push(g);
            g = 0, h = d, c = !1;
        }
    }
    return e.push(f[0], f[1], f[2]), e;
}, b15.PolyK._PointInTriangle = function(a3, b6, c, d, e, f, g, h) {
    var i = g - c, j = h - d, k = e - c, l = f - d, m = a3 - c, n = b6 - d, o = i * i + j * j, p = i * k + j * l, q = i * m + j * n, r = k * k + l * l, s = k * m + l * n, t = 1 / (o * r - p * p), u = (r * q - p * s) * t, v = (o * s - p * q) * t;
    return u >= 0 && v >= 0 && 1 > u + v;
}, b15.PolyK._convex = function(a3, b6, c, d, e, f, g) {
    return (b6 - d) * (e - c) + (c - a3) * (f - d) >= 0 === g;
}, b15.initDefaultShaders = function() {
}, b15.CompileVertexShader = function(a3, c) {
    return b15._CompileShader(a3, c, a3.VERTEX_SHADER);
}, b15.CompileFragmentShader = function(a3, c) {
    return b15._CompileShader(a3, c, a3.FRAGMENT_SHADER);
}, b15._CompileShader = function(a3, b6, c) {
    var d = b6.join("\n"), e = a3.createShader(c);
    return a3.shaderSource(e, d), a3.compileShader(e), a3.getShaderParameter(e, a3.COMPILE_STATUS) ? e : (window.console.log(a3.getShaderInfoLog(e)), null);
}, b15.compileProgram = function(a3, c, d) {
    var e = b15.CompileFragmentShader(a3, d), f = b15.CompileVertexShader(a3, c), g = a3.createProgram();
    return a3.attachShader(g, f), a3.attachShader(g, e), a3.linkProgram(g), a3.getProgramParameter(g, a3.LINK_STATUS) || window.console.log("Could not initialise shaders"), g;
}, b15.PixiShader = function(a3) {
    this._UID = b15._UID++, this.gl = a3, this.program = null, this.fragmentSrc = [
        "precision lowp float;",
        "varying vec2 vTextureCoord;",
        "varying vec4 vColor;",
        "uniform sampler2D uSampler;",
        "void main(void) {",
        "   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;",
        "}"
    ], this.textureCount = 0, this.firstRun = !0, this.dirty = !0, this.attributes = [], this.init();
}, b15.PixiShader.prototype.constructor = b15.PixiShader, b15.PixiShader.prototype.init = function() {
    var a3 = this.gl, c = b15.compileProgram(a3, this.vertexSrc || b15.PixiShader.defaultVertexSrc, this.fragmentSrc);
    a3.useProgram(c), this.uSampler = a3.getUniformLocation(c, "uSampler"), this.projectionVector = a3.getUniformLocation(c, "projectionVector"), this.offsetVector = a3.getUniformLocation(c, "offsetVector"), this.dimensions = a3.getUniformLocation(c, "dimensions"), this.aVertexPosition = a3.getAttribLocation(c, "aVertexPosition"), this.aTextureCoord = a3.getAttribLocation(c, "aTextureCoord"), this.colorAttribute = a3.getAttribLocation(c, "aColor"), -1 === this.colorAttribute && (this.colorAttribute = 2), this.attributes = [
        this.aVertexPosition,
        this.aTextureCoord,
        this.colorAttribute
    ];
    for(var d in this.uniforms)this.uniforms[d].uniformLocation = a3.getUniformLocation(c, d);
    this.initUniforms(), this.program = c;
}, b15.PixiShader.prototype.initUniforms = function() {
    this.textureCount = 1;
    var a3, b6 = this.gl;
    for(var c in this.uniforms){
        a3 = this.uniforms[c];
        var d = a3.type;
        "sampler2D" === d ? (a3._init = !1, null !== a3.value && this.initSampler2D(a3)) : "mat2" === d || "mat3" === d || "mat4" === d ? (a3.glMatrix = !0, a3.glValueLength = 1, "mat2" === d ? a3.glFunc = b6.uniformMatrix2fv : "mat3" === d ? a3.glFunc = b6.uniformMatrix3fv : "mat4" === d && (a3.glFunc = b6.uniformMatrix4fv)) : (a3.glFunc = b6["uniform" + d], a3.glValueLength = "2f" === d || "2i" === d ? 2 : "3f" === d || "3i" === d ? 3 : "4f" === d || "4i" === d ? 4 : 1);
    }
}, b15.PixiShader.prototype.initSampler2D = function(a3) {
    if (a3.value && a3.value.baseTexture && a3.value.baseTexture.hasLoaded) {
        var b6 = this.gl;
        if (b6.activeTexture(b6["TEXTURE" + this.textureCount]), b6.bindTexture(b6.TEXTURE_2D, a3.value.baseTexture._glTextures[b6.id]), a3.textureData) {
            var c = a3.textureData, d = c.magFilter ? c.magFilter : b6.LINEAR, e = c.minFilter ? c.minFilter : b6.LINEAR, f = c.wrapS ? c.wrapS : b6.CLAMP_TO_EDGE, g = c.wrapT ? c.wrapT : b6.CLAMP_TO_EDGE, h = c.luminance ? b6.LUMINANCE : b6.RGBA;
            if (c.repeat && (f = b6.REPEAT, g = b6.REPEAT), b6.pixelStorei(b6.UNPACK_FLIP_Y_WEBGL, !!c.flipY), c.width) {
                var i = c.width ? c.width : 512, j = c.height ? c.height : 2, k = c.border ? c.border : 0;
                b6.texImage2D(b6.TEXTURE_2D, 0, h, i, j, k, h, b6.UNSIGNED_BYTE, null);
            } else b6.texImage2D(b6.TEXTURE_2D, 0, h, b6.RGBA, b6.UNSIGNED_BYTE, a3.value.baseTexture.source);
            b6.texParameteri(b6.TEXTURE_2D, b6.TEXTURE_MAG_FILTER, d), b6.texParameteri(b6.TEXTURE_2D, b6.TEXTURE_MIN_FILTER, e), b6.texParameteri(b6.TEXTURE_2D, b6.TEXTURE_WRAP_S, f), b6.texParameteri(b6.TEXTURE_2D, b6.TEXTURE_WRAP_T, g);
        }
        b6.uniform1i(a3.uniformLocation, this.textureCount), a3._init = !0, this.textureCount++;
    }
}, b15.PixiShader.prototype.syncUniforms = function() {
    this.textureCount = 1;
    var a3, c = this.gl;
    for(var d in this.uniforms)a3 = this.uniforms[d], 1 === a3.glValueLength ? a3.glMatrix === !0 ? a3.glFunc.call(c, a3.uniformLocation, a3.transpose, a3.value) : a3.glFunc.call(c, a3.uniformLocation, a3.value) : 2 === a3.glValueLength ? a3.glFunc.call(c, a3.uniformLocation, a3.value.x, a3.value.y) : 3 === a3.glValueLength ? a3.glFunc.call(c, a3.uniformLocation, a3.value.x, a3.value.y, a3.value.z) : 4 === a3.glValueLength ? a3.glFunc.call(c, a3.uniformLocation, a3.value.x, a3.value.y, a3.value.z, a3.value.w) : "sampler2D" === a3.type && (a3._init ? (c.activeTexture(c["TEXTURE" + this.textureCount]), a3.value.baseTexture._dirty[c.id] ? b15.instances[c.id].updateTexture(a3.value.baseTexture) : c.bindTexture(c.TEXTURE_2D, a3.value.baseTexture._glTextures[c.id]), c.uniform1i(a3.uniformLocation, this.textureCount), this.textureCount++) : this.initSampler2D(a3));
}, b15.PixiShader.prototype.destroy = function() {
    this.gl.deleteProgram(this.program), this.uniforms = null, this.gl = null, this.attributes = null;
}, b15.PixiShader.defaultVertexSrc = [
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
], b15.PixiFastShader = function(a3) {
    this._UID = b15._UID++, this.gl = a3, this.program = null, this.fragmentSrc = [
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
}, b15.PixiFastShader.prototype.constructor = b15.PixiFastShader, b15.PixiFastShader.prototype.init = function() {
    var a3 = this.gl, c = b15.compileProgram(a3, this.vertexSrc, this.fragmentSrc);
    a3.useProgram(c), this.uSampler = a3.getUniformLocation(c, "uSampler"), this.projectionVector = a3.getUniformLocation(c, "projectionVector"), this.offsetVector = a3.getUniformLocation(c, "offsetVector"), this.dimensions = a3.getUniformLocation(c, "dimensions"), this.uMatrix = a3.getUniformLocation(c, "uMatrix"), this.aVertexPosition = a3.getAttribLocation(c, "aVertexPosition"), this.aPositionCoord = a3.getAttribLocation(c, "aPositionCoord"), this.aScale = a3.getAttribLocation(c, "aScale"), this.aRotation = a3.getAttribLocation(c, "aRotation"), this.aTextureCoord = a3.getAttribLocation(c, "aTextureCoord"), this.colorAttribute = a3.getAttribLocation(c, "aColor"), -1 === this.colorAttribute && (this.colorAttribute = 2), this.attributes = [
        this.aVertexPosition,
        this.aPositionCoord,
        this.aScale,
        this.aRotation,
        this.aTextureCoord,
        this.colorAttribute
    ], this.program = c;
}, b15.PixiFastShader.prototype.destroy = function() {
    this.gl.deleteProgram(this.program), this.uniforms = null, this.gl = null, this.attributes = null;
}, b15.StripShader = function(a3) {
    this._UID = b15._UID++, this.gl = a3, this.program = null, this.fragmentSrc = [
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
}, b15.StripShader.prototype.constructor = b15.StripShader, b15.StripShader.prototype.init = function() {
    var a3 = this.gl, c = b15.compileProgram(a3, this.vertexSrc, this.fragmentSrc);
    a3.useProgram(c), this.uSampler = a3.getUniformLocation(c, "uSampler"), this.projectionVector = a3.getUniformLocation(c, "projectionVector"), this.offsetVector = a3.getUniformLocation(c, "offsetVector"), this.colorAttribute = a3.getAttribLocation(c, "aColor"), this.aVertexPosition = a3.getAttribLocation(c, "aVertexPosition"), this.aTextureCoord = a3.getAttribLocation(c, "aTextureCoord"), this.attributes = [
        this.aVertexPosition,
        this.aTextureCoord
    ], this.translationMatrix = a3.getUniformLocation(c, "translationMatrix"), this.alpha = a3.getUniformLocation(c, "alpha"), this.program = c;
}, b15.StripShader.prototype.destroy = function() {
    this.gl.deleteProgram(this.program), this.uniforms = null, this.gl = null, this.attribute = null;
}, b15.PrimitiveShader = function(a3) {
    this._UID = b15._UID++, this.gl = a3, this.program = null, this.fragmentSrc = [
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
}, b15.PrimitiveShader.prototype.constructor = b15.PrimitiveShader, b15.PrimitiveShader.prototype.init = function() {
    var a3 = this.gl, c = b15.compileProgram(a3, this.vertexSrc, this.fragmentSrc);
    a3.useProgram(c), this.projectionVector = a3.getUniformLocation(c, "projectionVector"), this.offsetVector = a3.getUniformLocation(c, "offsetVector"), this.tintColor = a3.getUniformLocation(c, "tint"), this.flipY = a3.getUniformLocation(c, "flipY"), this.aVertexPosition = a3.getAttribLocation(c, "aVertexPosition"), this.colorAttribute = a3.getAttribLocation(c, "aColor"), this.attributes = [
        this.aVertexPosition,
        this.colorAttribute
    ], this.translationMatrix = a3.getUniformLocation(c, "translationMatrix"), this.alpha = a3.getUniformLocation(c, "alpha"), this.program = c;
}, b15.PrimitiveShader.prototype.destroy = function() {
    this.gl.deleteProgram(this.program), this.uniforms = null, this.gl = null, this.attributes = null;
}, b15.ComplexPrimitiveShader = function(a3) {
    this._UID = b15._UID++, this.gl = a3, this.program = null, this.fragmentSrc = [
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
}, b15.ComplexPrimitiveShader.prototype.constructor = b15.ComplexPrimitiveShader, b15.ComplexPrimitiveShader.prototype.init = function() {
    var a3 = this.gl, c = b15.compileProgram(a3, this.vertexSrc, this.fragmentSrc);
    a3.useProgram(c), this.projectionVector = a3.getUniformLocation(c, "projectionVector"), this.offsetVector = a3.getUniformLocation(c, "offsetVector"), this.tintColor = a3.getUniformLocation(c, "tint"), this.color = a3.getUniformLocation(c, "color"), this.flipY = a3.getUniformLocation(c, "flipY"), this.aVertexPosition = a3.getAttribLocation(c, "aVertexPosition"), this.attributes = [
        this.aVertexPosition,
        this.colorAttribute
    ], this.translationMatrix = a3.getUniformLocation(c, "translationMatrix"), this.alpha = a3.getUniformLocation(c, "alpha"), this.program = c;
}, b15.ComplexPrimitiveShader.prototype.destroy = function() {
    this.gl.deleteProgram(this.program), this.uniforms = null, this.gl = null, this.attribute = null;
}, b15.WebGLGraphics = function() {
}, b15.WebGLGraphics.renderGraphics = function(a3, c) {
    var d, e = c.gl, f = c.projection, g = c.offset, h = c.shaderManager.primitiveShader;
    a3.dirty && b15.WebGLGraphics.updateGraphics(a3, e);
    for(var i = a3._webGL[e.id], j = 0; j < i.data.length; j++)1 === i.data[j].mode ? (d = i.data[j], c.stencilManager.pushStencil(a3, d, c), e.drawElements(e.TRIANGLE_FAN, 4, e.UNSIGNED_SHORT, 2 * (d.indices.length - 4)), c.stencilManager.popStencil(a3, d, c)) : (d = i.data[j], c.shaderManager.setShader(h), h = c.shaderManager.primitiveShader, e.uniformMatrix3fv(h.translationMatrix, !1, a3.worldTransform.toArray(!0)), e.uniform1f(h.flipY, 1), e.uniform2f(h.projectionVector, f.x, -f.y), e.uniform2f(h.offsetVector, -g.x, -g.y), e.uniform3fv(h.tintColor, b15.hex2rgb(a3.tint)), e.uniform1f(h.alpha, a3.worldAlpha), e.bindBuffer(e.ARRAY_BUFFER, d.buffer), e.vertexAttribPointer(h.aVertexPosition, 2, e.FLOAT, !1, 24, 0), e.vertexAttribPointer(h.colorAttribute, 4, e.FLOAT, !1, 24, 8), e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, d.indexBuffer), e.drawElements(e.TRIANGLE_STRIP, d.indices.length, e.UNSIGNED_SHORT, 0));
}, b15.WebGLGraphics.updateGraphics = function(a3, c) {
    var d = a3._webGL[c.id];
    d || (d = a3._webGL[c.id] = {
        lastIndex: 0,
        data: [],
        gl: c
    }), a3.dirty = !1;
    var e;
    if (a3.clearDirty) {
        for(a3.clearDirty = !1, e = 0; e < d.data.length; e++){
            var f = d.data[e];
            f.reset(), b15.WebGLGraphics.graphicsDataPool.push(f);
        }
        d.data = [], d.lastIndex = 0;
    }
    var g;
    for(e = d.lastIndex; e < a3.graphicsData.length; e++){
        var h = a3.graphicsData[e];
        if (h.type === b15.Graphics.POLY) {
            if (h.points = h.shape.points.slice(), h.shape.closed && (h.points[0] !== h.points[h.points.length - 2] || h.points[1] !== h.points[h.points.length - 1]) && h.points.push(h.points[0], h.points[1]), h.fill && h.points.length >= 6) {
                if (h.points.length < 12) {
                    g = b15.WebGLGraphics.switchMode(d, 0);
                    var i = b15.WebGLGraphics.buildPoly(h, g);
                    i || (g = b15.WebGLGraphics.switchMode(d, 1), b15.WebGLGraphics.buildComplexPoly(h, g));
                } else g = b15.WebGLGraphics.switchMode(d, 1), b15.WebGLGraphics.buildComplexPoly(h, g);
            }
            h.lineWidth > 0 && (g = b15.WebGLGraphics.switchMode(d, 0), b15.WebGLGraphics.buildLine(h, g));
        } else g = b15.WebGLGraphics.switchMode(d, 0), h.type === b15.Graphics.RECT ? b15.WebGLGraphics.buildRectangle(h, g) : h.type === b15.Graphics.CIRC || h.type === b15.Graphics.ELIP ? b15.WebGLGraphics.buildCircle(h, g) : h.type === b15.Graphics.RREC && b15.WebGLGraphics.buildRoundedRectangle(h, g);
        d.lastIndex++;
    }
    for(e = 0; e < d.data.length; e++)g = d.data[e], g.dirty && g.upload();
}, b15.WebGLGraphics.switchMode = function(a3, c) {
    var d;
    return a3.data.length ? (d = a3.data[a3.data.length - 1], (d.mode !== c || 1 === c) && (d = b15.WebGLGraphics.graphicsDataPool.pop() || new b15.WebGLGraphicsData(a3.gl), d.mode = c, a3.data.push(d))) : (d = b15.WebGLGraphics.graphicsDataPool.pop() || new b15.WebGLGraphicsData(a3.gl), d.mode = c, a3.data.push(d)), d.dirty = !0, d;
}, b15.WebGLGraphics.buildRectangle = function(a3, c) {
    var d = a3.shape, e = d.x, f = d.y, g = d.width, h = d.height;
    if (a3.fill) {
        var i = b15.hex2rgb(a3.fillColor), j = a3.fillAlpha, k = i[0] * j, l = i[1] * j, m = i[2] * j, n = c.points, o = c.indices, p = n.length / 6;
        n.push(e, f), n.push(k, l, m, j), n.push(e + g, f), n.push(k, l, m, j), n.push(e, f + h), n.push(k, l, m, j), n.push(e + g, f + h), n.push(k, l, m, j), o.push(p, p, p + 1, p + 2, p + 3, p + 3);
    }
    if (a3.lineWidth) {
        var q = a3.points;
        a3.points = [
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
        ], b15.WebGLGraphics.buildLine(a3, c), a3.points = q;
    }
}, b15.WebGLGraphics.buildRoundedRectangle = function(a3, c) {
    var d = a3.shape, e = d.x, f = d.y, g = d.width, h = d.height, i = d.radius, j = [];
    if (j.push(e, f + i), j = j.concat(b15.WebGLGraphics.quadraticBezierCurve(e, f + h - i, e, f + h, e + i, f + h)), j = j.concat(b15.WebGLGraphics.quadraticBezierCurve(e + g - i, f + h, e + g, f + h, e + g, f + h - i)), j = j.concat(b15.WebGLGraphics.quadraticBezierCurve(e + g, f + i, e + g, f, e + g - i, f)), j = j.concat(b15.WebGLGraphics.quadraticBezierCurve(e + i, f, e, f, e, f + i)), a3.fill) {
        var k = b15.hex2rgb(a3.fillColor), l = a3.fillAlpha, m = k[0] * l, n = k[1] * l, o = k[2] * l, p = c.points, q = c.indices, r = p.length / 6, s = b15.PolyK.Triangulate(j), t = 0;
        for(t = 0; t < s.length; t += 3)q.push(s[t] + r), q.push(s[t] + r), q.push(s[t + 1] + r), q.push(s[t + 2] + r), q.push(s[t + 2] + r);
        for(t = 0; t < j.length; t++)p.push(j[t], j[++t], m, n, o, l);
    }
    if (a3.lineWidth) {
        var u = a3.points;
        a3.points = j, b15.WebGLGraphics.buildLine(a3, c), a3.points = u;
    }
}, b15.WebGLGraphics.quadraticBezierCurve = function(a3, b7, c, d, e, f) {
    function g(a4, b8, c1) {
        var d1 = b8 - a4;
        return a4 + d1 * c1;
    }
    for(var h, i, j, k, l, m, n = 20, o = [], p = 0, q = 0; n >= q; q++)p = q / n, h = g(a3, c, p), i = g(b7, d, p), j = g(c, e, p), k = g(d, f, p), l = g(h, j, p), m = g(i, k, p), o.push(l, m);
    return o;
}, b15.WebGLGraphics.buildCircle = function(a3, c) {
    var d, e, f = a3.shape, g = f.x, h = f.y;
    a3.type === b15.Graphics.CIRC ? (d = f.radius, e = f.radius) : (d = f.width, e = f.height);
    var i = 40, j = 2 * Math.PI / i, k = 0;
    if (a3.fill) {
        var l = b15.hex2rgb(a3.fillColor), m = a3.fillAlpha, n = l[0] * m, o = l[1] * m, p = l[2] * m, q = c.points, r = c.indices, s = q.length / 6;
        for(r.push(s), k = 0; i + 1 > k; k++)q.push(g, h, n, o, p, m), q.push(g + Math.sin(j * k) * d, h + Math.cos(j * k) * e, n, o, p, m), r.push(s++, s++);
        r.push(s - 1);
    }
    if (a3.lineWidth) {
        var t = a3.points;
        for(a3.points = [], k = 0; i + 1 > k; k++)a3.points.push(g + Math.sin(j * k) * d, h + Math.cos(j * k) * e);
        b15.WebGLGraphics.buildLine(a3, c), a3.points = t;
    }
}, b15.WebGLGraphics.buildLine = function(a3, c) {
    var d = 0, e = a3.points;
    if (0 !== e.length) {
        if (a3.lineWidth % 2) for(d = 0; d < e.length; d++)e[d] += 0.5;
        var f = new b15.Point(e[0], e[1]), g = new b15.Point(e[e.length - 2], e[e.length - 1]);
        if (f.x === g.x && f.y === g.y) {
            e = e.slice(), e.pop(), e.pop(), g = new b15.Point(e[e.length - 2], e[e.length - 1]);
            var h = g.x + 0.5 * (f.x - g.x), i = g.y + 0.5 * (f.y - g.y);
            e.unshift(h, i), e.push(h, i);
        }
        var j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z, A, B, C, D, E, F, G = c.points, H = c.indices, I = e.length / 2, J = e.length, K = G.length / 6, L = a3.lineWidth / 2, M = b15.hex2rgb(a3.lineColor), N = a3.lineAlpha, O = M[0] * N, P = M[1] * N, Q = M[2] * N;
        for(l = e[0], m = e[1], n = e[2], o = e[3], r = -(m - o), s = l - n, F = Math.sqrt(r * r + s * s), r /= F, s /= F, r *= L, s *= L, G.push(l - r, m - s, O, P, Q, N), G.push(l + r, m + s, O, P, Q, N), d = 1; I - 1 > d; d++)l = e[2 * (d - 1)], m = e[2 * (d - 1) + 1], n = e[2 * d], o = e[2 * d + 1], p = e[2 * (d + 1)], q = e[2 * (d + 1) + 1], r = -(m - o), s = l - n, F = Math.sqrt(r * r + s * s), r /= F, s /= F, r *= L, s *= L, t = -(o - q), u = n - p, F = Math.sqrt(t * t + u * u), t /= F, u /= F, t *= L, u *= L, x = -s + m - (-s + o), y = -r + n - (-r + l), z = (-r + l) * (-s + o) - (-r + n) * (-s + m), A = -u + q - (-u + o), B = -t + n - (-t + p), C = (-t + p) * (-u + o) - (-t + n) * (-u + q), D = x * B - A * y, Math.abs(D) < 0.1 ? (D += 10.1, G.push(n - r, o - s, O, P, Q, N), G.push(n + r, o + s, O, P, Q, N)) : (j = (y * C - B * z) / D, k = (A * z - x * C) / D, E = (j - n) * (j - n) + (k - o) + (k - o), E > 19600 ? (v = r - t, w = s - u, F = Math.sqrt(v * v + w * w), v /= F, w /= F, v *= L, w *= L, G.push(n - v, o - w), G.push(O, P, Q, N), G.push(n + v, o + w), G.push(O, P, Q, N), G.push(n - v, o - w), G.push(O, P, Q, N), J++) : (G.push(j, k), G.push(O, P, Q, N), G.push(n - (j - n), o - (k - o)), G.push(O, P, Q, N)));
        for(l = e[2 * (I - 2)], m = e[2 * (I - 2) + 1], n = e[2 * (I - 1)], o = e[2 * (I - 1) + 1], r = -(m - o), s = l - n, F = Math.sqrt(r * r + s * s), r /= F, s /= F, r *= L, s *= L, G.push(n - r, o - s), G.push(O, P, Q, N), G.push(n + r, o + s), G.push(O, P, Q, N), H.push(K), d = 0; J > d; d++)H.push(K++);
        H.push(K - 1);
    }
}, b15.WebGLGraphics.buildComplexPoly = function(a3, c) {
    var d = a3.points.slice();
    if (!(d.length < 6)) {
        var e = c.indices;
        c.points = d, c.alpha = a3.fillAlpha, c.color = b15.hex2rgb(a3.fillColor);
        for(var f, g, h = 1 / 0, i = -(1 / 0), j = 1 / 0, k = -(1 / 0), l = 0; l < d.length; l += 2)f = d[l], g = d[l + 1], h = h > f ? f : h, i = f > i ? f : i, j = j > g ? g : j, k = g > k ? g : k;
        d.push(h, j, i, j, i, k, h, k);
        var m = d.length / 2;
        for(l = 0; m > l; l++)e.push(l);
    }
}, b15.WebGLGraphics.buildPoly = function(a3, c) {
    var d = a3.points;
    if (!(d.length < 6)) {
        var e = c.points, f = c.indices, g = d.length / 2, h = b15.hex2rgb(a3.fillColor), i = a3.fillAlpha, j = h[0] * i, k = h[1] * i, l = h[2] * i, m = b15.PolyK.Triangulate(d);
        if (!m) return !1;
        var n = e.length / 6, o = 0;
        for(o = 0; o < m.length; o += 3)f.push(m[o] + n), f.push(m[o] + n), f.push(m[o + 1] + n), f.push(m[o + 2] + n), f.push(m[o + 2] + n);
        for(o = 0; g > o; o++)e.push(d[2 * o], d[2 * o + 1], j, k, l, i);
        return !0;
    }
}, b15.WebGLGraphics.graphicsDataPool = [], b15.WebGLGraphicsData = function(a3) {
    this.gl = a3, this.color = [
        0,
        0,
        0
    ], this.points = [], this.indices = [], this.buffer = a3.createBuffer(), this.indexBuffer = a3.createBuffer(), this.mode = 1, this.alpha = 1, this.dirty = !0;
}, b15.WebGLGraphicsData.prototype.reset = function() {
    this.points = [], this.indices = [];
}, b15.WebGLGraphicsData.prototype.upload = function() {
    var a3 = this.gl;
    this.glPoints = new b15.Float32Array(this.points), a3.bindBuffer(a3.ARRAY_BUFFER, this.buffer), a3.bufferData(a3.ARRAY_BUFFER, this.glPoints, a3.STATIC_DRAW), this.glIndicies = new b15.Uint16Array(this.indices), a3.bindBuffer(a3.ELEMENT_ARRAY_BUFFER, this.indexBuffer), a3.bufferData(a3.ELEMENT_ARRAY_BUFFER, this.glIndicies, a3.STATIC_DRAW), this.dirty = !1;
}, b15.glContexts = [], b15.instances = [], b15.WebGLRenderer = function(a3, c, d) {
    if (d) for(var e in b15.defaultRenderOptions)"undefined" == typeof d[e] && (d[e] = b15.defaultRenderOptions[e]);
    else d = b15.defaultRenderOptions;
    b15.defaultRenderer || (b15.sayHello("webGL"), b15.defaultRenderer = this), this.type = b15.WEBGL_RENDERER, this.resolution = d.resolution, this.transparent = d.transparent, this.autoResize = d.autoResize || !1, this.preserveDrawingBuffer = d.preserveDrawingBuffer, this.clearBeforeRender = d.clearBeforeRender, this.width = a3 || 800, this.height = c || 600, this.view = d.view || document.createElement("canvas"), this.contextLostBound = this.handleContextLost.bind(this), this.contextRestoredBound = this.handleContextRestored.bind(this), this.view.addEventListener("webglcontextlost", this.contextLostBound, !1), this.view.addEventListener("webglcontextrestored", this.contextRestoredBound, !1), this._contextOptions = {
        alpha: this.transparent,
        antialias: d.antialias,
        premultipliedAlpha: this.transparent && "notMultiplied" !== this.transparent,
        stencil: !0,
        preserveDrawingBuffer: d.preserveDrawingBuffer
    }, this.projection = new b15.Point, this.offset = new b15.Point(0, 0), this.shaderManager = new b15.WebGLShaderManager, this.spriteBatch = new b15.WebGLSpriteBatch, this.maskManager = new b15.WebGLMaskManager, this.filterManager = new b15.WebGLFilterManager, this.stencilManager = new b15.WebGLStencilManager, this.blendModeManager = new b15.WebGLBlendModeManager, this.renderSession = {
    }, this.renderSession.gl = this.gl, this.renderSession.drawCount = 0, this.renderSession.shaderManager = this.shaderManager, this.renderSession.maskManager = this.maskManager, this.renderSession.filterManager = this.filterManager, this.renderSession.blendModeManager = this.blendModeManager, this.renderSession.spriteBatch = this.spriteBatch, this.renderSession.stencilManager = this.stencilManager, this.renderSession.renderer = this, this.renderSession.resolution = this.resolution, this.initContext(), this.mapBlendModes();
}, b15.WebGLRenderer.prototype.constructor = b15.WebGLRenderer, b15.WebGLRenderer.prototype.initContext = function() {
    var a3 = this.view.getContext("webgl", this._contextOptions) || this.view.getContext("experimental-webgl", this._contextOptions);
    if (this.gl = a3, !a3) throw new Error("This browser does not support webGL. Try using the canvas renderer");
    this.glContextId = a3.id = b15.WebGLRenderer.glContextId++, b15.glContexts[this.glContextId] = a3, b15.instances[this.glContextId] = this, a3.disable(a3.DEPTH_TEST), a3.disable(a3.CULL_FACE), a3.enable(a3.BLEND), this.shaderManager.setContext(a3), this.spriteBatch.setContext(a3), this.maskManager.setContext(a3), this.filterManager.setContext(a3), this.blendModeManager.setContext(a3), this.stencilManager.setContext(a3), this.renderSession.gl = this.gl, this.resize(this.width, this.height);
}, b15.WebGLRenderer.prototype.render = function(a3) {
    if (!this.contextLost) {
        this.__stage !== a3 && (a3.interactive && a3.interactionManager.removeEvents(), this.__stage = a3), a3.updateTransform();
        var b7 = this.gl;
        a3._interactive ? a3._interactiveEventsAdded || (a3._interactiveEventsAdded = !0, a3.interactionManager.setTarget(this)) : a3._interactiveEventsAdded && (a3._interactiveEventsAdded = !1, a3.interactionManager.setTarget(this)), b7.viewport(0, 0, this.width, this.height), b7.bindFramebuffer(b7.FRAMEBUFFER, null), this.clearBeforeRender && (this.transparent ? b7.clearColor(0, 0, 0, 0) : b7.clearColor(a3.backgroundColorSplit[0], a3.backgroundColorSplit[1], a3.backgroundColorSplit[2], 1), b7.clear(b7.COLOR_BUFFER_BIT)), this.renderDisplayObject(a3, this.projection);
    }
}, b15.WebGLRenderer.prototype.renderDisplayObject = function(a3, c, d) {
    this.renderSession.blendModeManager.setBlendMode(b15.blendModes.NORMAL), this.renderSession.drawCount = 0, this.renderSession.flipY = d ? -1 : 1, this.renderSession.projection = c, this.renderSession.offset = this.offset, this.spriteBatch.begin(this.renderSession), this.filterManager.begin(this.renderSession, d), a3._renderWebGL(this.renderSession), this.spriteBatch.end();
}, b15.WebGLRenderer.prototype.resize = function(a3, b8) {
    this.width = a3 * this.resolution, this.height = b8 * this.resolution, this.view.width = this.width, this.view.height = this.height, this.autoResize && (this.view.style.width = this.width / this.resolution + "px", this.view.style.height = this.height / this.resolution + "px"), this.gl.viewport(0, 0, this.width, this.height), this.projection.x = this.width / 2 / this.resolution, this.projection.y = -this.height / 2 / this.resolution;
}, b15.WebGLRenderer.prototype.updateTexture = function(a3) {
    if (a3.hasLoaded) {
        var c = this.gl;
        return a3._glTextures[c.id] || (a3._glTextures[c.id] = c.createTexture()), c.bindTexture(c.TEXTURE_2D, a3._glTextures[c.id]), c.pixelStorei(c.UNPACK_PREMULTIPLY_ALPHA_WEBGL, a3.premultipliedAlpha), c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, c.RGBA, c.UNSIGNED_BYTE, a3.source), c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, a3.scaleMode === b15.scaleModes.LINEAR ? c.LINEAR : c.NEAREST), a3.mipmap && b15.isPowerOfTwo(a3.width, a3.height) ? (c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, a3.scaleMode === b15.scaleModes.LINEAR ? c.LINEAR_MIPMAP_LINEAR : c.NEAREST_MIPMAP_NEAREST), c.generateMipmap(c.TEXTURE_2D)) : c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, a3.scaleMode === b15.scaleModes.LINEAR ? c.LINEAR : c.NEAREST), a3._powerOf2 ? (c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.REPEAT), c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.REPEAT)) : (c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE), c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE)), a3._dirty[c.id] = !1, a3._glTextures[c.id];
    }
}, b15.WebGLRenderer.prototype.handleContextLost = function(a3) {
    a3.preventDefault(), this.contextLost = !0;
}, b15.WebGLRenderer.prototype.handleContextRestored = function() {
    this.initContext();
    for(var a3 in b15.TextureCache){
        var c = b15.TextureCache[a3].baseTexture;
        c._glTextures = [];
    }
    this.contextLost = !1;
}, b15.WebGLRenderer.prototype.destroy = function() {
    this.view.removeEventListener("webglcontextlost", this.contextLostBound), this.view.removeEventListener("webglcontextrestored", this.contextRestoredBound), b15.glContexts[this.glContextId] = null, this.projection = null, this.offset = null, this.shaderManager.destroy(), this.spriteBatch.destroy(), this.maskManager.destroy(), this.filterManager.destroy(), this.shaderManager = null, this.spriteBatch = null, this.maskManager = null, this.filterManager = null, this.gl = null, this.renderSession = null;
}, b15.WebGLRenderer.prototype.mapBlendModes = function() {
    var a3 = this.gl;
    b15.blendModesWebGL || (b15.blendModesWebGL = [], b15.blendModesWebGL[b15.blendModes.NORMAL] = [
        a3.ONE,
        a3.ONE_MINUS_SRC_ALPHA
    ], b15.blendModesWebGL[b15.blendModes.ADD] = [
        a3.SRC_ALPHA,
        a3.DST_ALPHA
    ], b15.blendModesWebGL[b15.blendModes.MULTIPLY] = [
        a3.DST_COLOR,
        a3.ONE_MINUS_SRC_ALPHA
    ], b15.blendModesWebGL[b15.blendModes.SCREEN] = [
        a3.SRC_ALPHA,
        a3.ONE
    ], b15.blendModesWebGL[b15.blendModes.OVERLAY] = [
        a3.ONE,
        a3.ONE_MINUS_SRC_ALPHA
    ], b15.blendModesWebGL[b15.blendModes.DARKEN] = [
        a3.ONE,
        a3.ONE_MINUS_SRC_ALPHA
    ], b15.blendModesWebGL[b15.blendModes.LIGHTEN] = [
        a3.ONE,
        a3.ONE_MINUS_SRC_ALPHA
    ], b15.blendModesWebGL[b15.blendModes.COLOR_DODGE] = [
        a3.ONE,
        a3.ONE_MINUS_SRC_ALPHA
    ], b15.blendModesWebGL[b15.blendModes.COLOR_BURN] = [
        a3.ONE,
        a3.ONE_MINUS_SRC_ALPHA
    ], b15.blendModesWebGL[b15.blendModes.HARD_LIGHT] = [
        a3.ONE,
        a3.ONE_MINUS_SRC_ALPHA
    ], b15.blendModesWebGL[b15.blendModes.SOFT_LIGHT] = [
        a3.ONE,
        a3.ONE_MINUS_SRC_ALPHA
    ], b15.blendModesWebGL[b15.blendModes.DIFFERENCE] = [
        a3.ONE,
        a3.ONE_MINUS_SRC_ALPHA
    ], b15.blendModesWebGL[b15.blendModes.EXCLUSION] = [
        a3.ONE,
        a3.ONE_MINUS_SRC_ALPHA
    ], b15.blendModesWebGL[b15.blendModes.HUE] = [
        a3.ONE,
        a3.ONE_MINUS_SRC_ALPHA
    ], b15.blendModesWebGL[b15.blendModes.SATURATION] = [
        a3.ONE,
        a3.ONE_MINUS_SRC_ALPHA
    ], b15.blendModesWebGL[b15.blendModes.COLOR] = [
        a3.ONE,
        a3.ONE_MINUS_SRC_ALPHA
    ], b15.blendModesWebGL[b15.blendModes.LUMINOSITY] = [
        a3.ONE,
        a3.ONE_MINUS_SRC_ALPHA
    ]);
}, b15.WebGLRenderer.glContextId = 0, b15.WebGLBlendModeManager = function() {
    this.currentBlendMode = 99999;
}, b15.WebGLBlendModeManager.prototype.constructor = b15.WebGLBlendModeManager, b15.WebGLBlendModeManager.prototype.setContext = function(a3) {
    this.gl = a3;
}, b15.WebGLBlendModeManager.prototype.setBlendMode = function(a3) {
    if (this.currentBlendMode === a3) return !1;
    this.currentBlendMode = a3;
    var c = b15.blendModesWebGL[this.currentBlendMode];
    return this.gl.blendFunc(c[0], c[1]), !0;
}, b15.WebGLBlendModeManager.prototype.destroy = function() {
    this.gl = null;
}, b15.WebGLMaskManager = function() {
}, b15.WebGLMaskManager.prototype.constructor = b15.WebGLMaskManager, b15.WebGLMaskManager.prototype.setContext = function(a3) {
    this.gl = a3;
}, b15.WebGLMaskManager.prototype.pushMask = function(a3, c) {
    var d = c.gl;
    a3.dirty && b15.WebGLGraphics.updateGraphics(a3, d), a3._webGL[d.id].data.length && c.stencilManager.pushStencil(a3, a3._webGL[d.id].data[0], c);
}, b15.WebGLMaskManager.prototype.popMask = function(a3, b8) {
    var c = this.gl;
    b8.stencilManager.popStencil(a3, a3._webGL[c.id].data[0], b8);
}, b15.WebGLMaskManager.prototype.destroy = function() {
    this.gl = null;
}, b15.WebGLStencilManager = function() {
    this.stencilStack = [], this.reverse = !0, this.count = 0;
}, b15.WebGLStencilManager.prototype.setContext = function(a3) {
    this.gl = a3;
}, b15.WebGLStencilManager.prototype.pushStencil = function(a3, b8, c) {
    var d = this.gl;
    this.bindGraphics(a3, b8, c), 0 === this.stencilStack.length && (d.enable(d.STENCIL_TEST), d.clear(d.STENCIL_BUFFER_BIT), this.reverse = !0, this.count = 0), this.stencilStack.push(b8);
    var e = this.count;
    d.colorMask(!1, !1, !1, !1), d.stencilFunc(d.ALWAYS, 0, 255), d.stencilOp(d.KEEP, d.KEEP, d.INVERT), 1 === b8.mode ? (d.drawElements(d.TRIANGLE_FAN, b8.indices.length - 4, d.UNSIGNED_SHORT, 0), this.reverse ? (d.stencilFunc(d.EQUAL, 255 - e, 255), d.stencilOp(d.KEEP, d.KEEP, d.DECR)) : (d.stencilFunc(d.EQUAL, e, 255), d.stencilOp(d.KEEP, d.KEEP, d.INCR)), d.drawElements(d.TRIANGLE_FAN, 4, d.UNSIGNED_SHORT, 2 * (b8.indices.length - 4)), this.reverse ? d.stencilFunc(d.EQUAL, 255 - (e + 1), 255) : d.stencilFunc(d.EQUAL, e + 1, 255), this.reverse = !this.reverse) : (this.reverse ? (d.stencilFunc(d.EQUAL, e, 255), d.stencilOp(d.KEEP, d.KEEP, d.INCR)) : (d.stencilFunc(d.EQUAL, 255 - e, 255), d.stencilOp(d.KEEP, d.KEEP, d.DECR)), d.drawElements(d.TRIANGLE_STRIP, b8.indices.length, d.UNSIGNED_SHORT, 0), this.reverse ? d.stencilFunc(d.EQUAL, e + 1, 255) : d.stencilFunc(d.EQUAL, 255 - (e + 1), 255)), d.colorMask(!0, !0, !0, !0), d.stencilOp(d.KEEP, d.KEEP, d.KEEP), this.count++;
}, b15.WebGLStencilManager.prototype.bindGraphics = function(a3, c, d) {
    this._currentGraphics = a3;
    var e, f = this.gl, g = d.projection, h = d.offset;
    1 === c.mode ? (e = d.shaderManager.complexPrimitiveShader, d.shaderManager.setShader(e), f.uniform1f(e.flipY, d.flipY), f.uniformMatrix3fv(e.translationMatrix, !1, a3.worldTransform.toArray(!0)), f.uniform2f(e.projectionVector, g.x, -g.y), f.uniform2f(e.offsetVector, -h.x, -h.y), f.uniform3fv(e.tintColor, b15.hex2rgb(a3.tint)), f.uniform3fv(e.color, c.color), f.uniform1f(e.alpha, a3.worldAlpha * c.alpha), f.bindBuffer(f.ARRAY_BUFFER, c.buffer), f.vertexAttribPointer(e.aVertexPosition, 2, f.FLOAT, !1, 8, 0), f.bindBuffer(f.ELEMENT_ARRAY_BUFFER, c.indexBuffer)) : (e = d.shaderManager.primitiveShader, d.shaderManager.setShader(e), f.uniformMatrix3fv(e.translationMatrix, !1, a3.worldTransform.toArray(!0)), f.uniform1f(e.flipY, d.flipY), f.uniform2f(e.projectionVector, g.x, -g.y), f.uniform2f(e.offsetVector, -h.x, -h.y), f.uniform3fv(e.tintColor, b15.hex2rgb(a3.tint)), f.uniform1f(e.alpha, a3.worldAlpha), f.bindBuffer(f.ARRAY_BUFFER, c.buffer), f.vertexAttribPointer(e.aVertexPosition, 2, f.FLOAT, !1, 24, 0), f.vertexAttribPointer(e.colorAttribute, 4, f.FLOAT, !1, 24, 8), f.bindBuffer(f.ELEMENT_ARRAY_BUFFER, c.indexBuffer));
}, b15.WebGLStencilManager.prototype.popStencil = function(a3, b8, c) {
    var d = this.gl;
    if (this.stencilStack.pop(), this.count--, 0 === this.stencilStack.length) d.disable(d.STENCIL_TEST);
    else {
        var e = this.count;
        this.bindGraphics(a3, b8, c), d.colorMask(!1, !1, !1, !1), 1 === b8.mode ? (this.reverse = !this.reverse, this.reverse ? (d.stencilFunc(d.EQUAL, 255 - (e + 1), 255), d.stencilOp(d.KEEP, d.KEEP, d.INCR)) : (d.stencilFunc(d.EQUAL, e + 1, 255), d.stencilOp(d.KEEP, d.KEEP, d.DECR)), d.drawElements(d.TRIANGLE_FAN, 4, d.UNSIGNED_SHORT, 2 * (b8.indices.length - 4)), d.stencilFunc(d.ALWAYS, 0, 255), d.stencilOp(d.KEEP, d.KEEP, d.INVERT), d.drawElements(d.TRIANGLE_FAN, b8.indices.length - 4, d.UNSIGNED_SHORT, 0), this.reverse ? d.stencilFunc(d.EQUAL, e, 255) : d.stencilFunc(d.EQUAL, 255 - e, 255)) : (this.reverse ? (d.stencilFunc(d.EQUAL, e + 1, 255), d.stencilOp(d.KEEP, d.KEEP, d.DECR)) : (d.stencilFunc(d.EQUAL, 255 - (e + 1), 255), d.stencilOp(d.KEEP, d.KEEP, d.INCR)), d.drawElements(d.TRIANGLE_STRIP, b8.indices.length, d.UNSIGNED_SHORT, 0), this.reverse ? d.stencilFunc(d.EQUAL, e, 255) : d.stencilFunc(d.EQUAL, 255 - e, 255)), d.colorMask(!0, !0, !0, !0), d.stencilOp(d.KEEP, d.KEEP, d.KEEP);
    }
}, b15.WebGLStencilManager.prototype.destroy = function() {
    this.stencilStack = null, this.gl = null;
}, b15.WebGLShaderManager = function() {
    this.maxAttibs = 10, this.attribState = [], this.tempAttribState = [];
    for(var a3 = 0; a3 < this.maxAttibs; a3++)this.attribState[a3] = !1;
    this.stack = [];
}, b15.WebGLShaderManager.prototype.constructor = b15.WebGLShaderManager, b15.WebGLShaderManager.prototype.setContext = function(a3) {
    this.gl = a3, this.primitiveShader = new b15.PrimitiveShader(a3), this.complexPrimitiveShader = new b15.ComplexPrimitiveShader(a3), this.defaultShader = new b15.PixiShader(a3), this.fastShader = new b15.PixiFastShader(a3), this.stripShader = new b15.StripShader(a3), this.setShader(this.defaultShader);
}, b15.WebGLShaderManager.prototype.setAttribs = function(a3) {
    var b8;
    for(b8 = 0; b8 < this.tempAttribState.length; b8++)this.tempAttribState[b8] = !1;
    for(b8 = 0; b8 < a3.length; b8++){
        var c = a3[b8];
        this.tempAttribState[c] = !0;
    }
    var d = this.gl;
    for(b8 = 0; b8 < this.attribState.length; b8++)this.attribState[b8] !== this.tempAttribState[b8] && (this.attribState[b8] = this.tempAttribState[b8], this.tempAttribState[b8] ? d.enableVertexAttribArray(b8) : d.disableVertexAttribArray(b8));
}, b15.WebGLShaderManager.prototype.setShader = function(a3) {
    return this._currentId === a3._UID ? !1 : (this._currentId = a3._UID, this.currentShader = a3, this.gl.useProgram(a3.program), this.setAttribs(a3.attributes), !0);
}, b15.WebGLShaderManager.prototype.destroy = function() {
    this.attribState = null, this.tempAttribState = null, this.primitiveShader.destroy(), this.complexPrimitiveShader.destroy(), this.defaultShader.destroy(), this.fastShader.destroy(), this.stripShader.destroy(), this.gl = null;
}, b15.WebGLSpriteBatch = function() {
    this.vertSize = 5, this.size = 2000;
    var a3 = 4 * this.size * 4 * this.vertSize, c = 6 * this.size;
    this.vertices = new b15.ArrayBuffer(a3), this.positions = new b15.Float32Array(this.vertices), this.colors = new b15.Uint32Array(this.vertices), this.indices = new b15.Uint16Array(c), this.lastIndexCount = 0;
    for(var d = 0, e = 0; c > d; d += 6, e += 4)this.indices[d + 0] = e + 0, this.indices[d + 1] = e + 1, this.indices[d + 2] = e + 2, this.indices[d + 3] = e + 0, this.indices[d + 4] = e + 2, this.indices[d + 5] = e + 3;
    this.drawing = !1, this.currentBatchSize = 0, this.currentBaseTexture = null, this.dirty = !0, this.textures = [], this.blendModes = [], this.shaders = [], this.sprites = [], this.defaultShader = new b15.AbstractFilter([
        "precision lowp float;",
        "varying vec2 vTextureCoord;",
        "varying vec4 vColor;",
        "uniform sampler2D uSampler;",
        "void main(void) {",
        "   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;",
        "}"
    ]);
}, b15.WebGLSpriteBatch.prototype.setContext = function(a3) {
    this.gl = a3, this.vertexBuffer = a3.createBuffer(), this.indexBuffer = a3.createBuffer(), a3.bindBuffer(a3.ELEMENT_ARRAY_BUFFER, this.indexBuffer), a3.bufferData(a3.ELEMENT_ARRAY_BUFFER, this.indices, a3.STATIC_DRAW), a3.bindBuffer(a3.ARRAY_BUFFER, this.vertexBuffer), a3.bufferData(a3.ARRAY_BUFFER, this.vertices, a3.DYNAMIC_DRAW), this.currentBlendMode = 99999;
    var c = new b15.PixiShader(a3);
    c.fragmentSrc = this.defaultShader.fragmentSrc, c.uniforms = {
    }, c.init(), this.defaultShader.shaders[a3.id] = c;
}, b15.WebGLSpriteBatch.prototype.begin = function(a3) {
    this.renderSession = a3, this.shader = this.renderSession.shaderManager.defaultShader, this.start();
}, b15.WebGLSpriteBatch.prototype.end = function() {
    this.flush();
}, b15.WebGLSpriteBatch.prototype.render = function(a3) {
    var b8 = a3.texture;
    this.currentBatchSize >= this.size && (this.flush(), this.currentBaseTexture = b8.baseTexture);
    var c = b8._uvs;
    if (c) {
        var d, e, f, g, h = a3.anchor.x, i = a3.anchor.y;
        if (b8.trim) {
            var j = b8.trim;
            e = j.x - h * j.width, d = e + b8.crop.width, g = j.y - i * j.height, f = g + b8.crop.height;
        } else d = b8.frame.width * (1 - h), e = b8.frame.width * -h, f = b8.frame.height * (1 - i), g = b8.frame.height * -i;
        var k = 4 * this.currentBatchSize * this.vertSize, l = b8.baseTexture.resolution, m = a3.worldTransform, n = m.a / l, o = m.b / l, p = m.c / l, q = m.d / l, r = m.tx, s = m.ty, t = this.colors, u = this.positions;
        this.renderSession.roundPixels ? (u[k] = n * e + p * g + r | 0, u[k + 1] = q * g + o * e + s | 0, u[k + 5] = n * d + p * g + r | 0, u[k + 6] = q * g + o * d + s | 0, u[k + 10] = n * d + p * f + r | 0, u[k + 11] = q * f + o * d + s | 0, u[k + 15] = n * e + p * f + r | 0, u[k + 16] = q * f + o * e + s | 0) : (u[k] = n * e + p * g + r, u[k + 1] = q * g + o * e + s, u[k + 5] = n * d + p * g + r, u[k + 6] = q * g + o * d + s, u[k + 10] = n * d + p * f + r, u[k + 11] = q * f + o * d + s, u[k + 15] = n * e + p * f + r, u[k + 16] = q * f + o * e + s), u[k + 2] = c.x0, u[k + 3] = c.y0, u[k + 7] = c.x1, u[k + 8] = c.y1, u[k + 12] = c.x2, u[k + 13] = c.y2, u[k + 17] = c.x3, u[k + 18] = c.y3;
        var v = a3.tint;
        t[k + 4] = t[k + 9] = t[k + 14] = t[k + 19] = (v >> 16) + (65280 & v) + ((255 & v) << 16) + (255 * a3.worldAlpha << 24), this.sprites[this.currentBatchSize++] = a3;
    }
}, b15.WebGLSpriteBatch.prototype.renderTilingSprite = function(a3) {
    var c = a3.tilingTexture;
    this.currentBatchSize >= this.size && (this.flush(), this.currentBaseTexture = c.baseTexture), a3._uvs || (a3._uvs = new b15.TextureUvs);
    var d = a3._uvs;
    a3.tilePosition.x %= c.baseTexture.width * a3.tileScaleOffset.x, a3.tilePosition.y %= c.baseTexture.height * a3.tileScaleOffset.y;
    var e = a3.tilePosition.x / (c.baseTexture.width * a3.tileScaleOffset.x), f = a3.tilePosition.y / (c.baseTexture.height * a3.tileScaleOffset.y), g = a3.width / c.baseTexture.width / (a3.tileScale.x * a3.tileScaleOffset.x), h = a3.height / c.baseTexture.height / (a3.tileScale.y * a3.tileScaleOffset.y);
    d.x0 = 0 - e, d.y0 = 0 - f, d.x1 = 1 * g - e, d.y1 = 0 - f, d.x2 = 1 * g - e, d.y2 = 1 * h - f, d.x3 = 0 - e, d.y3 = 1 * h - f;
    var i = a3.tint, j = (i >> 16) + (65280 & i) + ((255 & i) << 16) + (255 * a3.alpha << 24), k = this.positions, l = this.colors, m = a3.width, n = a3.height, o = a3.anchor.x, p = a3.anchor.y, q = m * (1 - o), r = m * -o, s = n * (1 - p), t = n * -p, u = 4 * this.currentBatchSize * this.vertSize, v = c.baseTexture.resolution, w = a3.worldTransform, x = w.a / v, y = w.b / v, z = w.c / v, A = w.d / v, B = w.tx, C = w.ty;
    k[u++] = x * r + z * t + B, k[u++] = A * t + y * r + C, k[u++] = d.x0, k[u++] = d.y0, l[u++] = j, k[u++] = x * q + z * t + B, k[u++] = A * t + y * q + C, k[u++] = d.x1, k[u++] = d.y1, l[u++] = j, k[u++] = x * q + z * s + B, k[u++] = A * s + y * q + C, k[u++] = d.x2, k[u++] = d.y2, l[u++] = j, k[u++] = x * r + z * s + B, k[u++] = A * s + y * r + C, k[u++] = d.x3, k[u++] = d.y3, l[u++] = j, this.sprites[this.currentBatchSize++] = a3;
}, b15.WebGLSpriteBatch.prototype.flush = function() {
    if (0 !== this.currentBatchSize) {
        var a3, c = this.gl;
        if (this.dirty) {
            this.dirty = !1, c.activeTexture(c.TEXTURE0), c.bindBuffer(c.ARRAY_BUFFER, this.vertexBuffer), c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, this.indexBuffer), a3 = this.defaultShader.shaders[c.id];
            var d = 4 * this.vertSize;
            c.vertexAttribPointer(a3.aVertexPosition, 2, c.FLOAT, !1, d, 0), c.vertexAttribPointer(a3.aTextureCoord, 2, c.FLOAT, !1, d, 8), c.vertexAttribPointer(a3.colorAttribute, 4, c.UNSIGNED_BYTE, !0, d, 16);
        }
        if (this.currentBatchSize > 0.5 * this.size) c.bufferSubData(c.ARRAY_BUFFER, 0, this.vertices);
        else {
            var e = this.positions.subarray(0, 4 * this.currentBatchSize * this.vertSize);
            c.bufferSubData(c.ARRAY_BUFFER, 0, e);
        }
        for(var f, g, h, i, j = 0, k = 0, l = null, m = this.renderSession.blendModeManager.currentBlendMode, n = null, o = !1, p = !1, q = 0, r = this.currentBatchSize; r > q; q++){
            if (i = this.sprites[q], f = i.texture.baseTexture, g = i.blendMode, h = i.shader || this.defaultShader, o = m !== g, p = n !== h, (l !== f || o || p) && (this.renderBatch(l, j, k), k = q, j = 0, l = f, o && (m = g, this.renderSession.blendModeManager.setBlendMode(m)), p)) {
                n = h, a3 = n.shaders[c.id], a3 || (a3 = new b15.PixiShader(c), a3.fragmentSrc = n.fragmentSrc, a3.uniforms = n.uniforms, a3.init(), n.shaders[c.id] = a3), this.renderSession.shaderManager.setShader(a3), a3.dirty && a3.syncUniforms();
                var s = this.renderSession.projection;
                c.uniform2f(a3.projectionVector, s.x, s.y);
                var t = this.renderSession.offset;
                c.uniform2f(a3.offsetVector, t.x, t.y);
            }
            j++;
        }
        this.renderBatch(l, j, k), this.currentBatchSize = 0;
    }
}, b15.WebGLSpriteBatch.prototype.renderBatch = function(a4, b8, c) {
    if (0 !== b8) {
        var d = this.gl;
        a4._dirty[d.id] ? this.renderSession.renderer.updateTexture(a4) : d.bindTexture(d.TEXTURE_2D, a4._glTextures[d.id]), d.drawElements(d.TRIANGLES, 6 * b8, d.UNSIGNED_SHORT, 6 * c * 2), this.renderSession.drawCount++;
    }
}, b15.WebGLSpriteBatch.prototype.stop = function() {
    this.flush(), this.dirty = !0;
}, b15.WebGLSpriteBatch.prototype.start = function() {
    this.dirty = !0;
}, b15.WebGLSpriteBatch.prototype.destroy = function() {
    this.vertices = null, this.indices = null, this.gl.deleteBuffer(this.vertexBuffer), this.gl.deleteBuffer(this.indexBuffer), this.currentBaseTexture = null, this.gl = null;
}, b15.WebGLFastSpriteBatch = function(a4) {
    this.vertSize = 10, this.maxSize = 6000, this.size = this.maxSize;
    var c = 4 * this.size * this.vertSize, d = 6 * this.maxSize;
    this.vertices = new b15.Float32Array(c), this.indices = new b15.Uint16Array(d), this.vertexBuffer = null, this.indexBuffer = null, this.lastIndexCount = 0;
    for(var e = 0, f = 0; d > e; e += 6, f += 4)this.indices[e + 0] = f + 0, this.indices[e + 1] = f + 1, this.indices[e + 2] = f + 2, this.indices[e + 3] = f + 0, this.indices[e + 4] = f + 2, this.indices[e + 5] = f + 3;
    this.drawing = !1, this.currentBatchSize = 0, this.currentBaseTexture = null, this.currentBlendMode = 0, this.renderSession = null, this.shader = null, this.matrix = null, this.setContext(a4);
}, b15.WebGLFastSpriteBatch.prototype.constructor = b15.WebGLFastSpriteBatch, b15.WebGLFastSpriteBatch.prototype.setContext = function(a4) {
    this.gl = a4, this.vertexBuffer = a4.createBuffer(), this.indexBuffer = a4.createBuffer(), a4.bindBuffer(a4.ELEMENT_ARRAY_BUFFER, this.indexBuffer), a4.bufferData(a4.ELEMENT_ARRAY_BUFFER, this.indices, a4.STATIC_DRAW), a4.bindBuffer(a4.ARRAY_BUFFER, this.vertexBuffer), a4.bufferData(a4.ARRAY_BUFFER, this.vertices, a4.DYNAMIC_DRAW);
}, b15.WebGLFastSpriteBatch.prototype.begin = function(a4, b8) {
    this.renderSession = b8, this.shader = this.renderSession.shaderManager.fastShader, this.matrix = a4.worldTransform.toArray(!0), this.start();
}, b15.WebGLFastSpriteBatch.prototype.end = function() {
    this.flush();
}, b15.WebGLFastSpriteBatch.prototype.render = function(a4) {
    var b8 = a4.children, c = b8[0];
    if (c.texture._uvs) {
        this.currentBaseTexture = c.texture.baseTexture, c.blendMode !== this.renderSession.blendModeManager.currentBlendMode && (this.flush(), this.renderSession.blendModeManager.setBlendMode(c.blendMode));
        for(var d = 0, e = b8.length; e > d; d++)this.renderSprite(b8[d]);
        this.flush();
    }
}, b15.WebGLFastSpriteBatch.prototype.renderSprite = function(a4) {
    if (a4.visible && (a4.texture.baseTexture === this.currentBaseTexture || (this.flush(), this.currentBaseTexture = a4.texture.baseTexture, a4.texture._uvs))) {
        var b8, c, d, e, f, g, h, i, j = this.vertices;
        if (b8 = a4.texture._uvs, c = a4.texture.frame.width, d = a4.texture.frame.height, a4.texture.trim) {
            var k = a4.texture.trim;
            f = k.x - a4.anchor.x * k.width, e = f + a4.texture.crop.width, h = k.y - a4.anchor.y * k.height, g = h + a4.texture.crop.height;
        } else e = a4.texture.frame.width * (1 - a4.anchor.x), f = a4.texture.frame.width * -a4.anchor.x, g = a4.texture.frame.height * (1 - a4.anchor.y), h = a4.texture.frame.height * -a4.anchor.y;
        i = 4 * this.currentBatchSize * this.vertSize, j[i++] = f, j[i++] = h, j[i++] = a4.position.x, j[i++] = a4.position.y, j[i++] = a4.scale.x, j[i++] = a4.scale.y, j[i++] = a4.rotation, j[i++] = b8.x0, j[i++] = b8.y1, j[i++] = a4.alpha, j[i++] = e, j[i++] = h, j[i++] = a4.position.x, j[i++] = a4.position.y, j[i++] = a4.scale.x, j[i++] = a4.scale.y, j[i++] = a4.rotation, j[i++] = b8.x1, j[i++] = b8.y1, j[i++] = a4.alpha, j[i++] = e, j[i++] = g, j[i++] = a4.position.x, j[i++] = a4.position.y, j[i++] = a4.scale.x, j[i++] = a4.scale.y, j[i++] = a4.rotation, j[i++] = b8.x2, j[i++] = b8.y2, j[i++] = a4.alpha, j[i++] = f, j[i++] = g, j[i++] = a4.position.x, j[i++] = a4.position.y, j[i++] = a4.scale.x, j[i++] = a4.scale.y, j[i++] = a4.rotation, j[i++] = b8.x3, j[i++] = b8.y3, j[i++] = a4.alpha, this.currentBatchSize++, this.currentBatchSize >= this.size && this.flush();
    }
}, b15.WebGLFastSpriteBatch.prototype.flush = function() {
    if (0 !== this.currentBatchSize) {
        var a4 = this.gl;
        if (this.currentBaseTexture._glTextures[a4.id] || this.renderSession.renderer.updateTexture(this.currentBaseTexture, a4), a4.bindTexture(a4.TEXTURE_2D, this.currentBaseTexture._glTextures[a4.id]), this.currentBatchSize > 0.5 * this.size) a4.bufferSubData(a4.ARRAY_BUFFER, 0, this.vertices);
        else {
            var b9 = this.vertices.subarray(0, 4 * this.currentBatchSize * this.vertSize);
            a4.bufferSubData(a4.ARRAY_BUFFER, 0, b9);
        }
        a4.drawElements(a4.TRIANGLES, 6 * this.currentBatchSize, a4.UNSIGNED_SHORT, 0), this.currentBatchSize = 0, this.renderSession.drawCount++;
    }
}, b15.WebGLFastSpriteBatch.prototype.stop = function() {
    this.flush();
}, b15.WebGLFastSpriteBatch.prototype.start = function() {
    var a5 = this.gl;
    a5.activeTexture(a5.TEXTURE0), a5.bindBuffer(a5.ARRAY_BUFFER, this.vertexBuffer), a5.bindBuffer(a5.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    var b10 = this.renderSession.projection;
    a5.uniform2f(this.shader.projectionVector, b10.x, b10.y), a5.uniformMatrix3fv(this.shader.uMatrix, !1, this.matrix);
    var c = 4 * this.vertSize;
    a5.vertexAttribPointer(this.shader.aVertexPosition, 2, a5.FLOAT, !1, c, 0), a5.vertexAttribPointer(this.shader.aPositionCoord, 2, a5.FLOAT, !1, c, 8), a5.vertexAttribPointer(this.shader.aScale, 2, a5.FLOAT, !1, c, 16), a5.vertexAttribPointer(this.shader.aRotation, 1, a5.FLOAT, !1, c, 24), a5.vertexAttribPointer(this.shader.aTextureCoord, 2, a5.FLOAT, !1, c, 28), a5.vertexAttribPointer(this.shader.colorAttribute, 1, a5.FLOAT, !1, c, 36);
}, b15.WebGLFilterManager = function() {
    this.filterStack = [], this.offsetX = 0, this.offsetY = 0;
}, b15.WebGLFilterManager.prototype.constructor = b15.WebGLFilterManager, b15.WebGLFilterManager.prototype.setContext = function(a5) {
    this.gl = a5, this.texturePool = [], this.initShaderBuffers();
}, b15.WebGLFilterManager.prototype.begin = function(a5, b10) {
    this.renderSession = a5, this.defaultShader = a5.shaderManager.defaultShader;
    var c = this.renderSession.projection;
    this.width = 2 * c.x, this.height = 2 * -c.y, this.buffer = b10;
}, b15.WebGLFilterManager.prototype.pushFilter = function(a5) {
    var c = this.gl, d = this.renderSession.projection, e = this.renderSession.offset;
    a5._filterArea = a5.target.filterArea || a5.target.getBounds(), this.filterStack.push(a5);
    var f = a5.filterPasses[0];
    this.offsetX += a5._filterArea.x, this.offsetY += a5._filterArea.y;
    var g = this.texturePool.pop();
    g ? g.resize(this.width, this.height) : g = new b15.FilterTexture(this.gl, this.width, this.height), c.bindTexture(c.TEXTURE_2D, g.texture);
    var h = a5._filterArea, i = f.padding;
    h.x -= i, h.y -= i, h.width += 2 * i, h.height += 2 * i, h.x < 0 && (h.x = 0), h.width > this.width && (h.width = this.width), h.y < 0 && (h.y = 0), h.height > this.height && (h.height = this.height), c.bindFramebuffer(c.FRAMEBUFFER, g.frameBuffer), c.viewport(0, 0, h.width, h.height), d.x = h.width / 2, d.y = -h.height / 2, e.x = -h.x, e.y = -h.y, c.colorMask(!0, !0, !0, !0), c.clearColor(0, 0, 0, 0), c.clear(c.COLOR_BUFFER_BIT), a5._glFilterTexture = g;
}, b15.WebGLFilterManager.prototype.popFilter = function() {
    var a5 = this.gl, c = this.filterStack.pop(), d = c._filterArea, e = c._glFilterTexture, f = this.renderSession.projection, g = this.renderSession.offset;
    if (c.filterPasses.length > 1) {
        a5.viewport(0, 0, d.width, d.height), a5.bindBuffer(a5.ARRAY_BUFFER, this.vertexBuffer), this.vertexArray[0] = 0, this.vertexArray[1] = d.height, this.vertexArray[2] = d.width, this.vertexArray[3] = d.height, this.vertexArray[4] = 0, this.vertexArray[5] = 0, this.vertexArray[6] = d.width, this.vertexArray[7] = 0, a5.bufferSubData(a5.ARRAY_BUFFER, 0, this.vertexArray), a5.bindBuffer(a5.ARRAY_BUFFER, this.uvBuffer), this.uvArray[2] = d.width / this.width, this.uvArray[5] = d.height / this.height, this.uvArray[6] = d.width / this.width, this.uvArray[7] = d.height / this.height, a5.bufferSubData(a5.ARRAY_BUFFER, 0, this.uvArray);
        var h = e, i = this.texturePool.pop();
        i || (i = new b15.FilterTexture(this.gl, this.width, this.height)), i.resize(this.width, this.height), a5.bindFramebuffer(a5.FRAMEBUFFER, i.frameBuffer), a5.clear(a5.COLOR_BUFFER_BIT), a5.disable(a5.BLEND);
        for(var j = 0; j < c.filterPasses.length - 1; j++){
            var k = c.filterPasses[j];
            a5.bindFramebuffer(a5.FRAMEBUFFER, i.frameBuffer), a5.activeTexture(a5.TEXTURE0), a5.bindTexture(a5.TEXTURE_2D, h.texture), this.applyFilterPass(k, d, d.width, d.height);
            var l = h;
            h = i, i = l;
        }
        a5.enable(a5.BLEND), e = h, this.texturePool.push(i);
    }
    var m = c.filterPasses[c.filterPasses.length - 1];
    this.offsetX -= d.x, this.offsetY -= d.y;
    var n = this.width, o = this.height, p = 0, q = 0, r = this.buffer;
    if (0 === this.filterStack.length) a5.colorMask(!0, !0, !0, !0);
    else {
        var s = this.filterStack[this.filterStack.length - 1];
        d = s._filterArea, n = d.width, o = d.height, p = d.x, q = d.y, r = s._glFilterTexture.frameBuffer;
    }
    f.x = n / 2, f.y = -o / 2, g.x = p, g.y = q, d = c._filterArea;
    var t = d.x - p, u = d.y - q;
    a5.bindBuffer(a5.ARRAY_BUFFER, this.vertexBuffer), this.vertexArray[0] = t, this.vertexArray[1] = u + d.height, this.vertexArray[2] = t + d.width, this.vertexArray[3] = u + d.height, this.vertexArray[4] = t, this.vertexArray[5] = u, this.vertexArray[6] = t + d.width, this.vertexArray[7] = u, a5.bufferSubData(a5.ARRAY_BUFFER, 0, this.vertexArray), a5.bindBuffer(a5.ARRAY_BUFFER, this.uvBuffer), this.uvArray[2] = d.width / this.width, this.uvArray[5] = d.height / this.height, this.uvArray[6] = d.width / this.width, this.uvArray[7] = d.height / this.height, a5.bufferSubData(a5.ARRAY_BUFFER, 0, this.uvArray), a5.viewport(0, 0, n * this.renderSession.resolution, o * this.renderSession.resolution), a5.bindFramebuffer(a5.FRAMEBUFFER, r), a5.activeTexture(a5.TEXTURE0), a5.bindTexture(a5.TEXTURE_2D, e.texture), this.applyFilterPass(m, d, n, o), this.texturePool.push(e), c._glFilterTexture = null;
}, b15.WebGLFilterManager.prototype.applyFilterPass = function(a5, c, d, e) {
    var f = this.gl, g = a5.shaders[f.id];
    g || (g = new b15.PixiShader(f), g.fragmentSrc = a5.fragmentSrc, g.uniforms = a5.uniforms, g.init(), a5.shaders[f.id] = g), this.renderSession.shaderManager.setShader(g), f.uniform2f(g.projectionVector, d / 2, -e / 2), f.uniform2f(g.offsetVector, 0, 0), a5.uniforms.dimensions && (a5.uniforms.dimensions.value[0] = this.width, a5.uniforms.dimensions.value[1] = this.height, a5.uniforms.dimensions.value[2] = this.vertexArray[0], a5.uniforms.dimensions.value[3] = this.vertexArray[5]), g.syncUniforms(), f.bindBuffer(f.ARRAY_BUFFER, this.vertexBuffer), f.vertexAttribPointer(g.aVertexPosition, 2, f.FLOAT, !1, 0, 0), f.bindBuffer(f.ARRAY_BUFFER, this.uvBuffer), f.vertexAttribPointer(g.aTextureCoord, 2, f.FLOAT, !1, 0, 0), f.bindBuffer(f.ARRAY_BUFFER, this.colorBuffer), f.vertexAttribPointer(g.colorAttribute, 2, f.FLOAT, !1, 0, 0), f.bindBuffer(f.ELEMENT_ARRAY_BUFFER, this.indexBuffer), f.drawElements(f.TRIANGLES, 6, f.UNSIGNED_SHORT, 0), this.renderSession.drawCount++;
}, b15.WebGLFilterManager.prototype.initShaderBuffers = function() {
    var a5 = this.gl;
    this.vertexBuffer = a5.createBuffer(), this.uvBuffer = a5.createBuffer(), this.colorBuffer = a5.createBuffer(), this.indexBuffer = a5.createBuffer(), this.vertexArray = new b15.Float32Array([
        0,
        0,
        1,
        0,
        0,
        1,
        1,
        1
    ]), a5.bindBuffer(a5.ARRAY_BUFFER, this.vertexBuffer), a5.bufferData(a5.ARRAY_BUFFER, this.vertexArray, a5.STATIC_DRAW), this.uvArray = new b15.Float32Array([
        0,
        0,
        1,
        0,
        0,
        1,
        1,
        1
    ]), a5.bindBuffer(a5.ARRAY_BUFFER, this.uvBuffer), a5.bufferData(a5.ARRAY_BUFFER, this.uvArray, a5.STATIC_DRAW), this.colorArray = new b15.Float32Array([
        1,
        16777215,
        1,
        16777215,
        1,
        16777215,
        1,
        16777215
    ]), a5.bindBuffer(a5.ARRAY_BUFFER, this.colorBuffer), a5.bufferData(a5.ARRAY_BUFFER, this.colorArray, a5.STATIC_DRAW), a5.bindBuffer(a5.ELEMENT_ARRAY_BUFFER, this.indexBuffer), a5.bufferData(a5.ELEMENT_ARRAY_BUFFER, new Uint16Array([
        0,
        1,
        2,
        1,
        3,
        2
    ]), a5.STATIC_DRAW);
}, b15.WebGLFilterManager.prototype.destroy = function() {
    var a5 = this.gl;
    this.filterStack = null, this.offsetX = 0, this.offsetY = 0;
    for(var b10 = 0; b10 < this.texturePool.length; b10++)this.texturePool[b10].destroy();
    this.texturePool = null, a5.deleteBuffer(this.vertexBuffer), a5.deleteBuffer(this.uvBuffer), a5.deleteBuffer(this.colorBuffer), a5.deleteBuffer(this.indexBuffer);
}, b15.FilterTexture = function(a5, c, d, e) {
    this.gl = a5, this.frameBuffer = a5.createFramebuffer(), this.texture = a5.createTexture(), e = e || b15.scaleModes.DEFAULT, a5.bindTexture(a5.TEXTURE_2D, this.texture), a5.texParameteri(a5.TEXTURE_2D, a5.TEXTURE_MAG_FILTER, e === b15.scaleModes.LINEAR ? a5.LINEAR : a5.NEAREST), a5.texParameteri(a5.TEXTURE_2D, a5.TEXTURE_MIN_FILTER, e === b15.scaleModes.LINEAR ? a5.LINEAR : a5.NEAREST), a5.texParameteri(a5.TEXTURE_2D, a5.TEXTURE_WRAP_S, a5.CLAMP_TO_EDGE), a5.texParameteri(a5.TEXTURE_2D, a5.TEXTURE_WRAP_T, a5.CLAMP_TO_EDGE), a5.bindFramebuffer(a5.FRAMEBUFFER, this.frameBuffer), a5.bindFramebuffer(a5.FRAMEBUFFER, this.frameBuffer), a5.framebufferTexture2D(a5.FRAMEBUFFER, a5.COLOR_ATTACHMENT0, a5.TEXTURE_2D, this.texture, 0), this.renderBuffer = a5.createRenderbuffer(), a5.bindRenderbuffer(a5.RENDERBUFFER, this.renderBuffer), a5.framebufferRenderbuffer(a5.FRAMEBUFFER, a5.DEPTH_STENCIL_ATTACHMENT, a5.RENDERBUFFER, this.renderBuffer), this.resize(c, d);
}, b15.FilterTexture.prototype.constructor = b15.FilterTexture, b15.FilterTexture.prototype.clear = function() {
    var a5 = this.gl;
    a5.clearColor(0, 0, 0, 0), a5.clear(a5.COLOR_BUFFER_BIT);
}, b15.FilterTexture.prototype.resize = function(a5, b10) {
    if (this.width !== a5 || this.height !== b10) {
        this.width = a5, this.height = b10;
        var c = this.gl;
        c.bindTexture(c.TEXTURE_2D, this.texture), c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, a5, b10, 0, c.RGBA, c.UNSIGNED_BYTE, null), c.bindRenderbuffer(c.RENDERBUFFER, this.renderBuffer), c.renderbufferStorage(c.RENDERBUFFER, c.DEPTH_STENCIL, a5, b10);
    }
}, b15.FilterTexture.prototype.destroy = function() {
    var a5 = this.gl;
    a5.deleteFramebuffer(this.frameBuffer), a5.deleteTexture(this.texture), this.frameBuffer = null, this.texture = null;
}, b15.CanvasBuffer = function(a5, b10) {
    this.width = a5, this.height = b10, this.canvas = document.createElement("canvas"), this.context = this.canvas.getContext("2d"), this.canvas.width = a5, this.canvas.height = b10;
}, b15.CanvasBuffer.prototype.constructor = b15.CanvasBuffer, b15.CanvasBuffer.prototype.clear = function() {
    this.context.setTransform(1, 0, 0, 1, 0, 0), this.context.clearRect(0, 0, this.width, this.height);
}, b15.CanvasBuffer.prototype.resize = function(a5, b10) {
    this.width = this.canvas.width = a5, this.height = this.canvas.height = b10;
}, b15.CanvasMaskManager = function() {
}, b15.CanvasMaskManager.prototype.constructor = b15.CanvasMaskManager, b15.CanvasMaskManager.prototype.pushMask = function(a5, c) {
    var d = c.context;
    d.save();
    var e = a5.alpha, f = a5.worldTransform, g = c.resolution;
    d.setTransform(f.a * g, f.b * g, f.c * g, f.d * g, f.tx * g, f.ty * g), b15.CanvasGraphics.renderGraphicsMask(a5, d), d.clip(), a5.worldAlpha = e;
}, b15.CanvasMaskManager.prototype.popMask = function(a5) {
    a5.context.restore();
}, b15.CanvasTinter = function() {
}, b15.CanvasTinter.getTintedTexture = function(a5, c) {
    var d = a5.texture;
    c = b15.CanvasTinter.roundColor(c);
    var e = "#" + ("00000" + (0 | c).toString(16)).substr(-6);
    if (d.tintCache = d.tintCache || {
    }, d.tintCache[e]) return d.tintCache[e];
    var f = b15.CanvasTinter.canvas || document.createElement("canvas");
    if (b15.CanvasTinter.tintMethod(d, c, f), b15.CanvasTinter.convertTintToImage) {
        var g = new Image;
        g.src = f.toDataURL(), d.tintCache[e] = g;
    } else d.tintCache[e] = f, b15.CanvasTinter.canvas = null;
    return f;
}, b15.CanvasTinter.tintWithMultiply = function(a5, b10, c) {
    var d = c.getContext("2d"), e = a5.crop;
    c.width = e.width, c.height = e.height, d.fillStyle = "#" + ("00000" + (0 | b10).toString(16)).substr(-6), d.fillRect(0, 0, e.width, e.height), d.globalCompositeOperation = "multiply", d.drawImage(a5.baseTexture.source, e.x, e.y, e.width, e.height, 0, 0, e.width, e.height), d.globalCompositeOperation = "destination-atop", d.drawImage(a5.baseTexture.source, e.x, e.y, e.width, e.height, 0, 0, e.width, e.height);
}, b15.CanvasTinter.tintWithOverlay = function(a5, b10, c) {
    var d = c.getContext("2d"), e = a5.crop;
    c.width = e.width, c.height = e.height, d.globalCompositeOperation = "copy", d.fillStyle = "#" + ("00000" + (0 | b10).toString(16)).substr(-6), d.fillRect(0, 0, e.width, e.height), d.globalCompositeOperation = "destination-atop", d.drawImage(a5.baseTexture.source, e.x, e.y, e.width, e.height, 0, 0, e.width, e.height);
}, b15.CanvasTinter.tintWithPerPixel = function(a5, c, d) {
    var e = d.getContext("2d"), f = a5.crop;
    d.width = f.width, d.height = f.height, e.globalCompositeOperation = "copy", e.drawImage(a5.baseTexture.source, f.x, f.y, f.width, f.height, 0, 0, f.width, f.height);
    for(var g = b15.hex2rgb(c), h = g[0], i = g[1], j = g[2], k = e.getImageData(0, 0, f.width, f.height), l = k.data, m = 0; m < l.length; m += 4)l[m + 0] *= h, l[m + 1] *= i, l[m + 2] *= j;
    e.putImageData(k, 0, 0);
}, b15.CanvasTinter.roundColor = function(a5) {
    var c = b15.CanvasTinter.cacheStepsPerColorChannel, d = b15.hex2rgb(a5);
    return d[0] = Math.min(255, d[0] / c * c), d[1] = Math.min(255, d[1] / c * c), d[2] = Math.min(255, d[2] / c * c), b15.rgb2hex(d);
}, b15.CanvasTinter.cacheStepsPerColorChannel = 8, b15.CanvasTinter.convertTintToImage = !1, b15.CanvasTinter.canUseMultiply = b15.canUseNewCanvasBlendModes(), b15.CanvasTinter.tintMethod = b15.CanvasTinter.canUseMultiply ? b15.CanvasTinter.tintWithMultiply : b15.CanvasTinter.tintWithPerPixel, b15.CanvasRenderer = function(a5, c, d) {
    if (d) for(var e in b15.defaultRenderOptions)"undefined" == typeof d[e] && (d[e] = b15.defaultRenderOptions[e]);
    else d = b15.defaultRenderOptions;
    b15.defaultRenderer || (b15.sayHello("Canvas"), b15.defaultRenderer = this), this.type = b15.CANVAS_RENDERER, this.resolution = d.resolution, this.clearBeforeRender = d.clearBeforeRender, this.transparent = d.transparent, this.autoResize = d.autoResize || !1, this.width = a5 || 800, this.height = c || 600, this.width *= this.resolution, this.height *= this.resolution, this.view = d.view || document.createElement("canvas"), this.context = this.view.getContext("2d", {
        alpha: this.transparent
    }), this.refresh = !0, this.view.width = this.width * this.resolution, this.view.height = this.height * this.resolution, this.count = 0, this.maskManager = new b15.CanvasMaskManager, this.renderSession = {
        context: this.context,
        maskManager: this.maskManager,
        scaleMode: null,
        smoothProperty: null,
        roundPixels: !1
    }, this.mapBlendModes(), this.resize(a5, c), "imageSmoothingEnabled" in this.context ? this.renderSession.smoothProperty = "imageSmoothingEnabled" : "webkitImageSmoothingEnabled" in this.context ? this.renderSession.smoothProperty = "webkitImageSmoothingEnabled" : "mozImageSmoothingEnabled" in this.context ? this.renderSession.smoothProperty = "mozImageSmoothingEnabled" : "oImageSmoothingEnabled" in this.context ? this.renderSession.smoothProperty = "oImageSmoothingEnabled" : "msImageSmoothingEnabled" in this.context && (this.renderSession.smoothProperty = "msImageSmoothingEnabled");
}, b15.CanvasRenderer.prototype.constructor = b15.CanvasRenderer, b15.CanvasRenderer.prototype.render = function(a5) {
    a5.updateTransform(), this.context.setTransform(1, 0, 0, 1, 0, 0), this.context.globalAlpha = 1, this.renderSession.currentBlendMode = b15.blendModes.NORMAL, this.context.globalCompositeOperation = b15.blendModesCanvas[b15.blendModes.NORMAL], navigator.isCocoonJS && this.view.screencanvas && (this.context.fillStyle = "black", this.context.clear()), this.clearBeforeRender && (this.transparent ? this.context.clearRect(0, 0, this.width, this.height) : (this.context.fillStyle = a5.backgroundColorString, this.context.fillRect(0, 0, this.width, this.height))), this.renderDisplayObject(a5), a5.interactive && (a5._interactiveEventsAdded || (a5._interactiveEventsAdded = !0, a5.interactionManager.setTarget(this)));
}, b15.CanvasRenderer.prototype.destroy = function(a5) {
    "undefined" == typeof a5 && (a5 = !0), a5 && this.view.parent && this.view.parent.removeChild(this.view), this.view = null, this.context = null, this.maskManager = null, this.renderSession = null;
}, b15.CanvasRenderer.prototype.resize = function(a5, b10) {
    this.width = a5 * this.resolution, this.height = b10 * this.resolution, this.view.width = this.width, this.view.height = this.height, this.autoResize && (this.view.style.width = this.width / this.resolution + "px", this.view.style.height = this.height / this.resolution + "px");
}, b15.CanvasRenderer.prototype.renderDisplayObject = function(a5, b10) {
    this.renderSession.context = b10 || this.context, this.renderSession.resolution = this.resolution, a5._renderCanvas(this.renderSession);
}, b15.CanvasRenderer.prototype.mapBlendModes = function() {
    b15.blendModesCanvas || (b15.blendModesCanvas = [], b15.canUseNewCanvasBlendModes() ? (b15.blendModesCanvas[b15.blendModes.NORMAL] = "source-over", b15.blendModesCanvas[b15.blendModes.ADD] = "lighter", b15.blendModesCanvas[b15.blendModes.MULTIPLY] = "multiply", b15.blendModesCanvas[b15.blendModes.SCREEN] = "screen", b15.blendModesCanvas[b15.blendModes.OVERLAY] = "overlay", b15.blendModesCanvas[b15.blendModes.DARKEN] = "darken", b15.blendModesCanvas[b15.blendModes.LIGHTEN] = "lighten", b15.blendModesCanvas[b15.blendModes.COLOR_DODGE] = "color-dodge", b15.blendModesCanvas[b15.blendModes.COLOR_BURN] = "color-burn", b15.blendModesCanvas[b15.blendModes.HARD_LIGHT] = "hard-light", b15.blendModesCanvas[b15.blendModes.SOFT_LIGHT] = "soft-light", b15.blendModesCanvas[b15.blendModes.DIFFERENCE] = "difference", b15.blendModesCanvas[b15.blendModes.EXCLUSION] = "exclusion", b15.blendModesCanvas[b15.blendModes.HUE] = "hue", b15.blendModesCanvas[b15.blendModes.SATURATION] = "saturation", b15.blendModesCanvas[b15.blendModes.COLOR] = "color", b15.blendModesCanvas[b15.blendModes.LUMINOSITY] = "luminosity") : (b15.blendModesCanvas[b15.blendModes.NORMAL] = "source-over", b15.blendModesCanvas[b15.blendModes.ADD] = "lighter", b15.blendModesCanvas[b15.blendModes.MULTIPLY] = "source-over", b15.blendModesCanvas[b15.blendModes.SCREEN] = "source-over", b15.blendModesCanvas[b15.blendModes.OVERLAY] = "source-over", b15.blendModesCanvas[b15.blendModes.DARKEN] = "source-over", b15.blendModesCanvas[b15.blendModes.LIGHTEN] = "source-over", b15.blendModesCanvas[b15.blendModes.COLOR_DODGE] = "source-over", b15.blendModesCanvas[b15.blendModes.COLOR_BURN] = "source-over", b15.blendModesCanvas[b15.blendModes.HARD_LIGHT] = "source-over", b15.blendModesCanvas[b15.blendModes.SOFT_LIGHT] = "source-over", b15.blendModesCanvas[b15.blendModes.DIFFERENCE] = "source-over", b15.blendModesCanvas[b15.blendModes.EXCLUSION] = "source-over", b15.blendModesCanvas[b15.blendModes.HUE] = "source-over", b15.blendModesCanvas[b15.blendModes.SATURATION] = "source-over", b15.blendModesCanvas[b15.blendModes.COLOR] = "source-over", b15.blendModesCanvas[b15.blendModes.LUMINOSITY] = "source-over"));
}, b15.CanvasGraphics = function() {
}, b15.CanvasGraphics.renderGraphics = function(a5, c) {
    var d = a5.worldAlpha;
    a5.dirty && (this.updateGraphicsTint(a5), a5.dirty = !1);
    for(var e = 0; e < a5.graphicsData.length; e++){
        var f = a5.graphicsData[e], g = f.shape, h = f._fillTint, i = f._lineTint;
        if (c.lineWidth = f.lineWidth, f.type === b15.Graphics.POLY) {
            c.beginPath();
            var j = g.points;
            c.moveTo(j[0], j[1]);
            for(var k = 1; k < j.length / 2; k++)c.lineTo(j[2 * k], j[2 * k + 1]);
            g.closed && c.lineTo(j[0], j[1]), j[0] === j[j.length - 2] && j[1] === j[j.length - 1] && c.closePath(), f.fill && (c.globalAlpha = f.fillAlpha * d, c.fillStyle = "#" + ("00000" + (0 | h).toString(16)).substr(-6), c.fill()), f.lineWidth && (c.globalAlpha = f.lineAlpha * d, c.strokeStyle = "#" + ("00000" + (0 | i).toString(16)).substr(-6), c.stroke());
        } else if (f.type === b15.Graphics.RECT) (f.fillColor || 0 === f.fillColor) && (c.globalAlpha = f.fillAlpha * d, c.fillStyle = "#" + ("00000" + (0 | h).toString(16)).substr(-6), c.fillRect(g.x, g.y, g.width, g.height)), f.lineWidth && (c.globalAlpha = f.lineAlpha * d, c.strokeStyle = "#" + ("00000" + (0 | i).toString(16)).substr(-6), c.strokeRect(g.x, g.y, g.width, g.height));
        else if (f.type === b15.Graphics.CIRC) c.beginPath(), c.arc(g.x, g.y, g.radius, 0, 2 * Math.PI), c.closePath(), f.fill && (c.globalAlpha = f.fillAlpha * d, c.fillStyle = "#" + ("00000" + (0 | h).toString(16)).substr(-6), c.fill()), f.lineWidth && (c.globalAlpha = f.lineAlpha * d, c.strokeStyle = "#" + ("00000" + (0 | i).toString(16)).substr(-6), c.stroke());
        else if (f.type === b15.Graphics.ELIP) {
            var l = 2 * g.width, m = 2 * g.height, n = g.x - l / 2, o = g.y - m / 2;
            c.beginPath();
            var p = 0.5522848, q = l / 2 * p, r = m / 2 * p, s = n + l, t = o + m, u = n + l / 2, v = o + m / 2;
            c.moveTo(n, v), c.bezierCurveTo(n, v - r, u - q, o, u, o), c.bezierCurveTo(u + q, o, s, v - r, s, v), c.bezierCurveTo(s, v + r, u + q, t, u, t), c.bezierCurveTo(u - q, t, n, v + r, n, v), c.closePath(), f.fill && (c.globalAlpha = f.fillAlpha * d, c.fillStyle = "#" + ("00000" + (0 | h).toString(16)).substr(-6), c.fill()), f.lineWidth && (c.globalAlpha = f.lineAlpha * d, c.strokeStyle = "#" + ("00000" + (0 | i).toString(16)).substr(-6), c.stroke());
        } else if (f.type === b15.Graphics.RREC) {
            var w = g.x, x = g.y, y = g.width, z = g.height, A = g.radius, B = Math.min(y, z) / 2 | 0;
            A = A > B ? B : A, c.beginPath(), c.moveTo(w, x + A), c.lineTo(w, x + z - A), c.quadraticCurveTo(w, x + z, w + A, x + z), c.lineTo(w + y - A, x + z), c.quadraticCurveTo(w + y, x + z, w + y, x + z - A), c.lineTo(w + y, x + A), c.quadraticCurveTo(w + y, x, w + y - A, x), c.lineTo(w + A, x), c.quadraticCurveTo(w, x, w, x + A), c.closePath(), (f.fillColor || 0 === f.fillColor) && (c.globalAlpha = f.fillAlpha * d, c.fillStyle = "#" + ("00000" + (0 | h).toString(16)).substr(-6), c.fill()), f.lineWidth && (c.globalAlpha = f.lineAlpha * d, c.strokeStyle = "#" + ("00000" + (0 | i).toString(16)).substr(-6), c.stroke());
        }
    }
}, b15.CanvasGraphics.renderGraphicsMask = function(a5, c) {
    var d = a5.graphicsData.length;
    if (0 !== d) {
        d > 1 && (d = 1, window.console.log("Pixi.js warning: masks in canvas can only mask using the first path in the graphics object"));
        for(var e = 0; 1 > e; e++){
            var f = a5.graphicsData[e], g = f.shape;
            if (f.type === b15.Graphics.POLY) {
                c.beginPath();
                var h = g.points;
                c.moveTo(h[0], h[1]);
                for(var i = 1; i < h.length / 2; i++)c.lineTo(h[2 * i], h[2 * i + 1]);
                h[0] === h[h.length - 2] && h[1] === h[h.length - 1] && c.closePath();
            } else if (f.type === b15.Graphics.RECT) c.beginPath(), c.rect(g.x, g.y, g.width, g.height), c.closePath();
            else if (f.type === b15.Graphics.CIRC) c.beginPath(), c.arc(g.x, g.y, g.radius, 0, 2 * Math.PI), c.closePath();
            else if (f.type === b15.Graphics.ELIP) {
                var j = 2 * g.width, k = 2 * g.height, l = g.x - j / 2, m = g.y - k / 2;
                c.beginPath();
                var n = 0.5522848, o = j / 2 * n, p = k / 2 * n, q = l + j, r = m + k, s = l + j / 2, t = m + k / 2;
                c.moveTo(l, t), c.bezierCurveTo(l, t - p, s - o, m, s, m), c.bezierCurveTo(s + o, m, q, t - p, q, t), c.bezierCurveTo(q, t + p, s + o, r, s, r), c.bezierCurveTo(s - o, r, l, t + p, l, t), c.closePath();
            } else if (f.type === b15.Graphics.RREC) {
                var u = g.points, v = u[0], w = u[1], x = u[2], y = u[3], z = u[4], A = Math.min(x, y) / 2 | 0;
                z = z > A ? A : z, c.beginPath(), c.moveTo(v, w + z), c.lineTo(v, w + y - z), c.quadraticCurveTo(v, w + y, v + z, w + y), c.lineTo(v + x - z, w + y), c.quadraticCurveTo(v + x, w + y, v + x, w + y - z), c.lineTo(v + x, w + z), c.quadraticCurveTo(v + x, w, v + x - z, w), c.lineTo(v + z, w), c.quadraticCurveTo(v, w, v, w + z), c.closePath();
            }
        }
    }
}, b15.CanvasGraphics.updateGraphicsTint = function(a5) {
    if (16777215 !== a5.tint) for(var b10 = (a5.tint >> 16 & 255) / 255, c = (a5.tint >> 8 & 255) / 255, d = (255 & a5.tint) / 255, e = 0; e < a5.graphicsData.length; e++){
        var f = a5.graphicsData[e], g = 0 | f.fillColor, h = 0 | f.lineColor;
        f._fillTint = ((g >> 16 & 255) / 255 * b10 * 255 << 16) + ((g >> 8 & 255) / 255 * c * 255 << 8) + (255 & g) / 255 * d * 255, f._lineTint = ((h >> 16 & 255) / 255 * b10 * 255 << 16) + ((h >> 8 & 255) / 255 * c * 255 << 8) + (255 & h) / 255 * d * 255;
    }
}, b15.Graphics = function() {
    b15.DisplayObjectContainer.call(this), this.renderable = !0, this.fillAlpha = 1, this.lineWidth = 0, this.lineColor = 0, this.graphicsData = [], this.tint = 16777215, this.blendMode = b15.blendModes.NORMAL, this.currentPath = null, this._webGL = [], this.isMask = !1, this.boundsPadding = 0, this._localBounds = new b15.Rectangle(0, 0, 1, 1), this.dirty = !0, this.webGLDirty = !1, this.cachedSpriteDirty = !1;
}, b15.Graphics.prototype = Object.create(b15.DisplayObjectContainer.prototype), b15.Graphics.prototype.constructor = b15.Graphics, Object.defineProperty(b15.Graphics.prototype, "cacheAsBitmap", {
    get: function() {
        return this._cacheAsBitmap;
    },
    set: function(a5) {
        this._cacheAsBitmap = a5, this._cacheAsBitmap ? this._generateCachedSprite() : (this.destroyCachedSprite(), this.dirty = !0);
    }
}), b15.Graphics.prototype.lineStyle = function(a5, c, d) {
    if (this.lineWidth = a5 || 0, this.lineColor = c || 0, this.lineAlpha = arguments.length < 3 ? 1 : d, this.currentPath) {
        if (this.currentPath.shape.points.length) return this.drawShape(new b15.Polygon(this.currentPath.shape.points.slice(-2))), this;
        this.currentPath.lineWidth = this.lineWidth, this.currentPath.lineColor = this.lineColor, this.currentPath.lineAlpha = this.lineAlpha;
    }
    return this;
}, b15.Graphics.prototype.moveTo = function(a5, c) {
    return this.drawShape(new b15.Polygon([
        a5,
        c
    ])), this;
}, b15.Graphics.prototype.lineTo = function(a5, b10) {
    return this.currentPath.shape.points.push(a5, b10), this.dirty = !0, this;
}, b15.Graphics.prototype.quadraticCurveTo = function(a5, b10, c, d) {
    this.currentPath ? 0 === this.currentPath.shape.points.length && (this.currentPath.shape.points = [
        0,
        0
    ]) : this.moveTo(0, 0);
    var e, f, g = 20, h = this.currentPath.shape.points;
    0 === h.length && this.moveTo(0, 0);
    for(var i = h[h.length - 2], j = h[h.length - 1], k = 0, l = 1; g >= l; l++)k = l / g, e = i + (a5 - i) * k, f = j + (b10 - j) * k, h.push(e + (a5 + (c - a5) * k - e) * k, f + (b10 + (d - b10) * k - f) * k);
    return this.dirty = !0, this;
}, b15.Graphics.prototype.bezierCurveTo = function(a5, b10, c, d, e, f) {
    this.currentPath ? 0 === this.currentPath.shape.points.length && (this.currentPath.shape.points = [
        0,
        0
    ]) : this.moveTo(0, 0);
    for(var g, h, i, j, k, l = 20, m = this.currentPath.shape.points, n = m[m.length - 2], o = m[m.length - 1], p = 0, q = 1; l >= q; q++)p = q / l, g = 1 - p, h = g * g, i = h * g, j = p * p, k = j * p, m.push(i * n + 3 * h * p * a5 + 3 * g * j * c + k * e, i * o + 3 * h * p * b10 + 3 * g * j * d + k * f);
    return this.dirty = !0, this;
}, b15.Graphics.prototype.arcTo = function(a5, b10, c, d, e) {
    this.currentPath ? 0 === this.currentPath.shape.points.length && this.currentPath.shape.points.push(a5, b10) : this.moveTo(a5, b10);
    var f = this.currentPath.shape.points, g = f[f.length - 2], h = f[f.length - 1], i = h - b10, j = g - a5, k = d - b10, l = c - a5, m = Math.abs(i * l - j * k);
    if (0.00000001 > m || 0 === e) (f[f.length - 2] !== a5 || f[f.length - 1] !== b10) && f.push(a5, b10);
    else {
        var n = i * i + j * j, o = k * k + l * l, p = i * k + j * l, q = e * Math.sqrt(n) / m, r = e * Math.sqrt(o) / m, s = q * p / n, t = r * p / o, u = q * l + r * j, v = q * k + r * i, w = j * (r + s), x = i * (r + s), y = l * (q + t), z = k * (q + t), A = Math.atan2(x - v, w - u), B = Math.atan2(z - v, y - u);
        this.arc(u + a5, v + b10, e, A, B, j * k > l * i);
    }
    return this.dirty = !0, this;
}, b15.Graphics.prototype.arc = function(a5, b10, c, d, e, f) {
    var g, h = a5 + Math.cos(d) * c, i = b10 + Math.sin(d) * c;
    if (this.currentPath ? (g = this.currentPath.shape.points, 0 === g.length ? g.push(h, i) : (g[g.length - 2] !== h || g[g.length - 1] !== i) && g.push(h, i)) : (this.moveTo(h, i), g = this.currentPath.shape.points), d === e) return this;
    !f && d >= e ? e += 2 * Math.PI : f && e >= d && (d += 2 * Math.PI);
    var j = f ? -1 * (d - e) : e - d, k = Math.abs(j) / (2 * Math.PI) * 40;
    if (0 === j) return this;
    for(var l = j / (2 * k), m = 2 * l, n = Math.cos(l), o = Math.sin(l), p = k - 1, q = p % 1 / p, r = 0; p >= r; r++){
        var s = r + q * r, t = l + d + m * s, u = Math.cos(t), v = -Math.sin(t);
        g.push((n * u + o * v) * c + a5, (n * -v + o * u) * c + b10);
    }
    return this.dirty = !0, this;
}, b15.Graphics.prototype.beginFill = function(a5, b10) {
    return this.filling = !0, this.fillColor = a5 || 0, this.fillAlpha = (void 0) === b10 ? 1 : b10, this.currentPath && this.currentPath.shape.points.length <= 2 && (this.currentPath.fill = this.filling, this.currentPath.fillColor = this.fillColor, this.currentPath.fillAlpha = this.fillAlpha), this;
}, b15.Graphics.prototype.endFill = function() {
    return this.filling = !1, this.fillColor = null, this.fillAlpha = 1, this;
}, b15.Graphics.prototype.drawRect = function(a5, c, d, e) {
    return this.drawShape(new b15.Rectangle(a5, c, d, e)), this;
}, b15.Graphics.prototype.drawRoundedRect = function(a5, c, d, e, f) {
    return this.drawShape(new b15.RoundedRectangle(a5, c, d, e, f)), this;
}, b15.Graphics.prototype.drawCircle = function(a5, c, d) {
    return this.drawShape(new b15.Circle(a5, c, d)), this;
}, b15.Graphics.prototype.drawEllipse = function(a5, c, d, e) {
    return this.drawShape(new b15.Ellipse(a5, c, d, e)), this;
}, b15.Graphics.prototype.drawPolygon = function(a5) {
    return a5 instanceof Array || (a5 = Array.prototype.slice.call(arguments)), this.drawShape(new b15.Polygon(a5)), this;
}, b15.Graphics.prototype.clear = function() {
    return this.lineWidth = 0, this.filling = !1, this.dirty = !0, this.clearDirty = !0, this.graphicsData = [], this;
}, b15.Graphics.prototype.generateTexture = function(a5, c) {
    a5 = a5 || 1;
    var d = this.getBounds(), e = new b15.CanvasBuffer(d.width * a5, d.height * a5), f = b15.Texture.fromCanvas(e.canvas, c);
    return f.baseTexture.resolution = a5, e.context.scale(a5, a5), e.context.translate(-d.x, -d.y), b15.CanvasGraphics.renderGraphics(this, e.context), f;
}, b15.Graphics.prototype._renderWebGL = function(a5) {
    if (this.visible !== !1 && 0 !== this.alpha && this.isMask !== !0) {
        if (this._cacheAsBitmap) return (this.dirty || this.cachedSpriteDirty) && (this._generateCachedSprite(), this.updateCachedSpriteTexture(), this.cachedSpriteDirty = !1, this.dirty = !1), this._cachedSprite.worldAlpha = this.worldAlpha, void b15.Sprite.prototype._renderWebGL.call(this._cachedSprite, a5);
        if (a5.spriteBatch.stop(), a5.blendModeManager.setBlendMode(this.blendMode), this._mask && a5.maskManager.pushMask(this._mask, a5), this._filters && a5.filterManager.pushFilter(this._filterBlock), this.blendMode !== a5.spriteBatch.currentBlendMode) {
            a5.spriteBatch.currentBlendMode = this.blendMode;
            var c = b15.blendModesWebGL[a5.spriteBatch.currentBlendMode];
            a5.spriteBatch.gl.blendFunc(c[0], c[1]);
        }
        if (this.webGLDirty && (this.dirty = !0, this.webGLDirty = !1), b15.WebGLGraphics.renderGraphics(this, a5), this.children.length) {
            a5.spriteBatch.start();
            for(var d = 0, e = this.children.length; e > d; d++)this.children[d]._renderWebGL(a5);
            a5.spriteBatch.stop();
        }
        this._filters && a5.filterManager.popFilter(), this._mask && a5.maskManager.popMask(this.mask, a5), a5.drawCount++, a5.spriteBatch.start();
    }
}, b15.Graphics.prototype._renderCanvas = function(a5) {
    if (this.visible !== !1 && 0 !== this.alpha && this.isMask !== !0) {
        if (this._cacheAsBitmap) return (this.dirty || this.cachedSpriteDirty) && (this._generateCachedSprite(), this.updateCachedSpriteTexture(), this.cachedSpriteDirty = !1, this.dirty = !1), this._cachedSprite.alpha = this.alpha, void b15.Sprite.prototype._renderCanvas.call(this._cachedSprite, a5);
        var c = a5.context, d = this.worldTransform;
        this.blendMode !== a5.currentBlendMode && (a5.currentBlendMode = this.blendMode, c.globalCompositeOperation = b15.blendModesCanvas[a5.currentBlendMode]), this._mask && a5.maskManager.pushMask(this._mask, a5);
        var e = a5.resolution;
        c.setTransform(d.a * e, d.b * e, d.c * e, d.d * e, d.tx * e, d.ty * e), b15.CanvasGraphics.renderGraphics(this, c);
        for(var f = 0, g = this.children.length; g > f; f++)this.children[f]._renderCanvas(a5);
        this._mask && a5.maskManager.popMask(a5);
    }
}, b15.Graphics.prototype.getBounds = function(a5) {
    if (this.isMask) return b15.EmptyRectangle;
    this.dirty && (this.updateLocalBounds(), this.webGLDirty = !0, this.cachedSpriteDirty = !0, this.dirty = !1);
    var c = this._localBounds, d = c.x, e = c.width + c.x, f = c.y, g = c.height + c.y, h = a5 || this.worldTransform, i = h.a, j = h.b, k = h.c, l = h.d, m = h.tx, n = h.ty, o = i * e + k * g + m, p = l * g + j * e + n, q = i * d + k * g + m, r = l * g + j * d + n, s = i * d + k * f + m, t = l * f + j * d + n, u = i * e + k * f + m, v = l * f + j * e + n, w = o, x = p, y = o, z = p;
    return y = y > q ? q : y, y = y > s ? s : y, y = y > u ? u : y, z = z > r ? r : z, z = z > t ? t : z, z = z > v ? v : z, w = q > w ? q : w, w = s > w ? s : w, w = u > w ? u : w, x = r > x ? r : x, x = t > x ? t : x, x = v > x ? v : x, this._bounds.x = y, this._bounds.width = w - y, this._bounds.y = z, this._bounds.height = x - z, this._bounds;
}, b15.Graphics.prototype.updateLocalBounds = function() {
    var a5 = 1 / 0, c = -(1 / 0), d = 1 / 0, e = -(1 / 0);
    if (this.graphicsData.length) for(var f, g, h, i, j, k, l = 0; l < this.graphicsData.length; l++){
        var m = this.graphicsData[l], n = m.type, o = m.lineWidth;
        if (f = m.shape, n === b15.Graphics.RECT || n === b15.Graphics.RREC) h = f.x - o / 2, i = f.y - o / 2, j = f.width + o, k = f.height + o, a5 = a5 > h ? h : a5, c = h + j > c ? h + j : c, d = d > i ? i : d, e = i + k > e ? i + k : e;
        else if (n === b15.Graphics.CIRC) h = f.x, i = f.y, j = f.radius + o / 2, k = f.radius + o / 2, a5 = a5 > h - j ? h - j : a5, c = h + j > c ? h + j : c, d = d > i - k ? i - k : d, e = i + k > e ? i + k : e;
        else if (n === b15.Graphics.ELIP) h = f.x, i = f.y, j = f.width + o / 2, k = f.height + o / 2, a5 = a5 > h - j ? h - j : a5, c = h + j > c ? h + j : c, d = d > i - k ? i - k : d, e = i + k > e ? i + k : e;
        else {
            g = f.points;
            for(var p = 0; p < g.length; p += 2)h = g[p], i = g[p + 1], a5 = a5 > h - o ? h - o : a5, c = h + o > c ? h + o : c, d = d > i - o ? i - o : d, e = i + o > e ? i + o : e;
        }
    }
    else a5 = 0, c = 0, d = 0, e = 0;
    var q = this.boundsPadding;
    this._localBounds.x = a5 - q, this._localBounds.width = c - a5 + 2 * q, this._localBounds.y = d - q, this._localBounds.height = e - d + 2 * q;
}, b15.Graphics.prototype._generateCachedSprite = function() {
    var a5 = this.getLocalBounds();
    if (this._cachedSprite) this._cachedSprite.buffer.resize(a5.width, a5.height);
    else {
        var c = new b15.CanvasBuffer(a5.width, a5.height), d = b15.Texture.fromCanvas(c.canvas);
        this._cachedSprite = new b15.Sprite(d), this._cachedSprite.buffer = c, this._cachedSprite.worldTransform = this.worldTransform;
    }
    this._cachedSprite.anchor.x = -(a5.x / a5.width), this._cachedSprite.anchor.y = -(a5.y / a5.height), this._cachedSprite.buffer.context.translate(-a5.x, -a5.y), this.worldAlpha = 1, b15.CanvasGraphics.renderGraphics(this, this._cachedSprite.buffer.context), this._cachedSprite.alpha = this.alpha;
}, b15.Graphics.prototype.updateCachedSpriteTexture = function() {
    var a5 = this._cachedSprite, b10 = a5.texture, c = a5.buffer.canvas;
    b10.baseTexture.width = c.width, b10.baseTexture.height = c.height, b10.crop.width = b10.frame.width = c.width, b10.crop.height = b10.frame.height = c.height, a5._width = c.width, a5._height = c.height, b10.baseTexture.dirty();
}, b15.Graphics.prototype.destroyCachedSprite = function() {
    this._cachedSprite.texture.destroy(!0), this._cachedSprite = null;
}, b15.Graphics.prototype.drawShape = function(a5) {
    this.currentPath && this.currentPath.shape.points.length <= 2 && this.graphicsData.pop(), this.currentPath = null;
    var c = new b15.GraphicsData(this.lineWidth, this.lineColor, this.lineAlpha, this.fillColor, this.fillAlpha, this.filling, a5);
    return this.graphicsData.push(c), c.type === b15.Graphics.POLY && (c.shape.closed = this.filling, this.currentPath = c), this.dirty = !0, c;
}, b15.GraphicsData = function(a5, b10, c, d, e, f, g) {
    this.lineWidth = a5, this.lineColor = b10, this.lineAlpha = c, this._lineTint = b10, this.fillColor = d, this.fillAlpha = e, this._fillTint = d, this.fill = f, this.shape = g, this.type = g.type;
}, b15.Graphics.POLY = 0, b15.Graphics.RECT = 1, b15.Graphics.CIRC = 2, b15.Graphics.ELIP = 3, b15.Graphics.RREC = 4, b15.Polygon.prototype.type = b15.Graphics.POLY, b15.Rectangle.prototype.type = b15.Graphics.RECT, b15.Circle.prototype.type = b15.Graphics.CIRC, b15.Ellipse.prototype.type = b15.Graphics.ELIP, b15.RoundedRectangle.prototype.type = b15.Graphics.RREC, b15.Strip = function(a5) {
    b15.DisplayObjectContainer.call(this), this.texture = a5, this.uvs = new b15.Float32Array([
        0,
        1,
        1,
        1,
        1,
        0,
        0,
        1
    ]), this.vertices = new b15.Float32Array([
        0,
        0,
        100,
        0,
        100,
        100,
        0,
        100
    ]), this.colors = new b15.Float32Array([
        1,
        1,
        1,
        1
    ]), this.indices = new b15.Uint16Array([
        0,
        1,
        2,
        3
    ]), this.dirty = !0, this.blendMode = b15.blendModes.NORMAL, this.canvasPadding = 0, this.drawMode = b15.Strip.DrawModes.TRIANGLE_STRIP;
}, b15.Strip.prototype = Object.create(b15.DisplayObjectContainer.prototype), b15.Strip.prototype.constructor = b15.Strip, b15.Strip.prototype._renderWebGL = function(a5) {
    !this.visible || this.alpha <= 0 || (a5.spriteBatch.stop(), this._vertexBuffer || this._initWebGL(a5), a5.shaderManager.setShader(a5.shaderManager.stripShader), this._renderStrip(a5), a5.spriteBatch.start());
}, b15.Strip.prototype._initWebGL = function(a5) {
    var b10 = a5.gl;
    this._vertexBuffer = b10.createBuffer(), this._indexBuffer = b10.createBuffer(), this._uvBuffer = b10.createBuffer(), this._colorBuffer = b10.createBuffer(), b10.bindBuffer(b10.ARRAY_BUFFER, this._vertexBuffer), b10.bufferData(b10.ARRAY_BUFFER, this.vertices, b10.DYNAMIC_DRAW), b10.bindBuffer(b10.ARRAY_BUFFER, this._uvBuffer), b10.bufferData(b10.ARRAY_BUFFER, this.uvs, b10.STATIC_DRAW), b10.bindBuffer(b10.ARRAY_BUFFER, this._colorBuffer), b10.bufferData(b10.ARRAY_BUFFER, this.colors, b10.STATIC_DRAW), b10.bindBuffer(b10.ELEMENT_ARRAY_BUFFER, this._indexBuffer), b10.bufferData(b10.ELEMENT_ARRAY_BUFFER, this.indices, b10.STATIC_DRAW);
}, b15.Strip.prototype._renderStrip = function(a5) {
    var c = a5.gl, d = a5.projection, e = a5.offset, f = a5.shaderManager.stripShader, g = this.drawMode === b15.Strip.DrawModes.TRIANGLE_STRIP ? c.TRIANGLE_STRIP : c.TRIANGLES;
    a5.blendModeManager.setBlendMode(this.blendMode), c.uniformMatrix3fv(f.translationMatrix, !1, this.worldTransform.toArray(!0)), c.uniform2f(f.projectionVector, d.x, -d.y), c.uniform2f(f.offsetVector, -e.x, -e.y), c.uniform1f(f.alpha, this.worldAlpha), this.dirty ? (this.dirty = !1, c.bindBuffer(c.ARRAY_BUFFER, this._vertexBuffer), c.bufferData(c.ARRAY_BUFFER, this.vertices, c.STATIC_DRAW), c.vertexAttribPointer(f.aVertexPosition, 2, c.FLOAT, !1, 0, 0), c.bindBuffer(c.ARRAY_BUFFER, this._uvBuffer), c.bufferData(c.ARRAY_BUFFER, this.uvs, c.STATIC_DRAW), c.vertexAttribPointer(f.aTextureCoord, 2, c.FLOAT, !1, 0, 0), c.activeTexture(c.TEXTURE0), this.texture.baseTexture._dirty[c.id] ? a5.renderer.updateTexture(this.texture.baseTexture) : c.bindTexture(c.TEXTURE_2D, this.texture.baseTexture._glTextures[c.id]), c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, this._indexBuffer), c.bufferData(c.ELEMENT_ARRAY_BUFFER, this.indices, c.STATIC_DRAW)) : (c.bindBuffer(c.ARRAY_BUFFER, this._vertexBuffer), c.bufferSubData(c.ARRAY_BUFFER, 0, this.vertices), c.vertexAttribPointer(f.aVertexPosition, 2, c.FLOAT, !1, 0, 0), c.bindBuffer(c.ARRAY_BUFFER, this._uvBuffer), c.vertexAttribPointer(f.aTextureCoord, 2, c.FLOAT, !1, 0, 0), c.activeTexture(c.TEXTURE0), this.texture.baseTexture._dirty[c.id] ? a5.renderer.updateTexture(this.texture.baseTexture) : c.bindTexture(c.TEXTURE_2D, this.texture.baseTexture._glTextures[c.id]), c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, this._indexBuffer)), c.drawElements(g, this.indices.length, c.UNSIGNED_SHORT, 0);
}, b15.Strip.prototype._renderCanvas = function(a5) {
    var c = a5.context, d = this.worldTransform;
    a5.roundPixels ? c.setTransform(d.a, d.b, d.c, d.d, 0 | d.tx, 0 | d.ty) : c.setTransform(d.a, d.b, d.c, d.d, d.tx, d.ty), this.drawMode === b15.Strip.DrawModes.TRIANGLE_STRIP ? this._renderCanvasTriangleStrip(c) : this._renderCanvasTriangles(c);
}, b15.Strip.prototype._renderCanvasTriangleStrip = function(a5) {
    var b10 = this.vertices, c = this.uvs, d = b10.length / 2;
    this.count++;
    for(var e = 0; d - 2 > e; e++){
        var f = 2 * e;
        this._renderCanvasDrawTriangle(a5, b10, c, f, f + 2, f + 4);
    }
}, b15.Strip.prototype._renderCanvasTriangles = function(a5) {
    var b10 = this.vertices, c = this.uvs, d = this.indices, e = d.length;
    this.count++;
    for(var f = 0; e > f; f += 3){
        var g = 2 * d[f], h = 2 * d[f + 1], i = 2 * d[f + 2];
        this._renderCanvasDrawTriangle(a5, b10, c, g, h, i);
    }
}, b15.Strip.prototype._renderCanvasDrawTriangle = function(a5, b10, c, d, e, f) {
    var g = this.texture.baseTexture.source, h = this.texture.width, i = this.texture.height, j = b10[d], k = b10[e], l = b10[f], m = b10[d + 1], n = b10[e + 1], o = b10[f + 1], p = c[d] * h, q = c[e] * h, r = c[f] * h, s = c[d + 1] * i, t = c[e + 1] * i, u = c[f + 1] * i;
    if (this.canvasPadding > 0) {
        var v = this.canvasPadding / this.worldTransform.a, w = this.canvasPadding / this.worldTransform.d, x = (j + k + l) / 3, y = (m + n + o) / 3, z = j - x, A = m - y, B = Math.sqrt(z * z + A * A);
        j = x + z / B * (B + v), m = y + A / B * (B + w), z = k - x, A = n - y, B = Math.sqrt(z * z + A * A), k = x + z / B * (B + v), n = y + A / B * (B + w), z = l - x, A = o - y, B = Math.sqrt(z * z + A * A), l = x + z / B * (B + v), o = y + A / B * (B + w);
    }
    a5.save(), a5.beginPath(), a5.moveTo(j, m), a5.lineTo(k, n), a5.lineTo(l, o), a5.closePath(), a5.clip();
    var C = p * t + s * r + q * u - t * r - s * q - p * u, D = j * t + s * l + k * u - t * l - s * k - j * u, E = p * k + j * r + q * l - k * r - j * q - p * l, F = p * t * l + s * k * r + j * q * u - j * t * r - s * q * l - p * k * u, G = m * t + s * o + n * u - t * o - s * n - m * u, H = p * n + m * r + q * o - n * r - m * q - p * o, I = p * t * o + s * n * r + m * q * u - m * t * r - s * q * o - p * n * u;
    a5.transform(D / C, G / C, E / C, H / C, F / C, I / C), a5.drawImage(g, 0, 0), a5.restore();
}, b15.Strip.prototype.renderStripFlat = function(a5) {
    var b10 = this.context, c = a5.vertices, d = c.length / 2;
    this.count++, b10.beginPath();
    for(var e = 1; d - 2 > e; e++){
        var f = 2 * e, g = c[f], h = c[f + 2], i = c[f + 4], j = c[f + 1], k = c[f + 3], l = c[f + 5];
        b10.moveTo(g, j), b10.lineTo(h, k), b10.lineTo(i, l);
    }
    b10.fillStyle = "#FF0000", b10.fill(), b10.closePath();
}, b15.Strip.prototype.onTextureUpdate = function() {
    this.updateFrame = !0;
}, b15.Strip.prototype.getBounds = function(a5) {
    for(var c = a5 || this.worldTransform, d = c.a, e = c.b, f = c.c, g = c.d, h = c.tx, i = c.ty, j = -(1 / 0), k = -(1 / 0), l = 1 / 0, m = 1 / 0, n = this.vertices, o = 0, p = n.length; p > o; o += 2){
        var q = n[o], r = n[o + 1], s = d * q + f * r + h, t = g * r + e * q + i;
        l = l > s ? s : l, m = m > t ? t : m, j = s > j ? s : j, k = t > k ? t : k;
    }
    if (l === -(1 / 0) || k === 1 / 0) return b15.EmptyRectangle;
    var u = this._bounds;
    return u.x = l, u.width = j - l, u.y = m, u.height = k - m, this._currentBounds = u, u;
}, b15.Strip.DrawModes = {
    TRIANGLE_STRIP: 0,
    TRIANGLES: 1
}, b15.Rope = function(a5, c) {
    b15.Strip.call(this, a5), this.points = c, this.vertices = new b15.Float32Array(4 * c.length), this.uvs = new b15.Float32Array(4 * c.length), this.colors = new b15.Float32Array(2 * c.length), this.indices = new b15.Uint16Array(2 * c.length), this.refresh();
}, b15.Rope.prototype = Object.create(b15.Strip.prototype), b15.Rope.prototype.constructor = b15.Rope, b15.Rope.prototype.refresh = function() {
    var a5 = this.points;
    if (!(a5.length < 1)) {
        var b10 = this.uvs, c = a5[0], d = this.indices, e = this.colors;
        this.count -= 0.2, b10[0] = 0, b10[1] = 0, b10[2] = 0, b10[3] = 1, e[0] = 1, e[1] = 1, d[0] = 0, d[1] = 1;
        for(var f, g, h, i = a5.length, j = 1; i > j; j++)f = a5[j], g = 4 * j, h = j / (i - 1), j % 2 ? (b10[g] = h, b10[g + 1] = 0, b10[g + 2] = h, b10[g + 3] = 1) : (b10[g] = h, b10[g + 1] = 0, b10[g + 2] = h, b10[g + 3] = 1), g = 2 * j, e[g] = 1, e[g + 1] = 1, g = 2 * j, d[g] = g, d[g + 1] = g + 1, c = f;
    }
}, b15.Rope.prototype.updateTransform = function() {
    var a5 = this.points;
    if (!(a5.length < 1)) {
        var c, d = a5[0], e = {
            x: 0,
            y: 0
        };
        this.count -= 0.2;
        for(var f, g, h, i, j, k = this.vertices, l = a5.length, m = 0; l > m; m++)f = a5[m], g = 4 * m, c = m < a5.length - 1 ? a5[m + 1] : f, e.y = -(c.x - d.x), e.x = c.y - d.y, h = 10 * (1 - m / (l - 1)), h > 1 && (h = 1), i = Math.sqrt(e.x * e.x + e.y * e.y), j = this.texture.height / 2, e.x /= i, e.y /= i, e.x *= j, e.y *= j, k[g] = f.x + e.x, k[g + 1] = f.y + e.y, k[g + 2] = f.x - e.x, k[g + 3] = f.y - e.y, d = f;
        b15.DisplayObjectContainer.prototype.updateTransform.call(this);
    }
}, b15.Rope.prototype.setTexture = function(a5) {
    this.texture = a5;
}, b15.TilingSprite = function(a5, c, d) {
    b15.Sprite.call(this, a5), this._width = c || 100, this._height = d || 100, this.tileScale = new b15.Point(1, 1), this.tileScaleOffset = new b15.Point(1, 1), this.tilePosition = new b15.Point(0, 0), this.renderable = !0, this.tint = 16777215, this.blendMode = b15.blendModes.NORMAL;
}, b15.TilingSprite.prototype = Object.create(b15.Sprite.prototype), b15.TilingSprite.prototype.constructor = b15.TilingSprite, Object.defineProperty(b15.TilingSprite.prototype, "width", {
    get: function() {
        return this._width;
    },
    set: function(a5) {
        this._width = a5;
    }
}), Object.defineProperty(b15.TilingSprite.prototype, "height", {
    get: function() {
        return this._height;
    },
    set: function(a5) {
        this._height = a5;
    }
}), b15.TilingSprite.prototype.setTexture = function(a5) {
    this.texture !== a5 && (this.texture = a5, this.refreshTexture = !0, this.cachedTint = 16777215);
}, b15.TilingSprite.prototype._renderWebGL = function(a5) {
    if (this.visible !== !1 && 0 !== this.alpha) {
        var b11, c;
        for(this._mask && (a5.spriteBatch.stop(), a5.maskManager.pushMask(this.mask, a5), a5.spriteBatch.start()), this._filters && (a5.spriteBatch.flush(), a5.filterManager.pushFilter(this._filterBlock)), !this.tilingTexture || this.refreshTexture ? (this.generateTilingTexture(!0), this.tilingTexture && this.tilingTexture.needsUpdate && (a5.renderer.updateTexture(this.tilingTexture.baseTexture), this.tilingTexture.needsUpdate = !1)) : a5.spriteBatch.renderTilingSprite(this), b11 = 0, c = this.children.length; c > b11; b11++)this.children[b11]._renderWebGL(a5);
        a5.spriteBatch.stop(), this._filters && a5.filterManager.popFilter(), this._mask && a5.maskManager.popMask(this._mask, a5), a5.spriteBatch.start();
    }
}, b15.TilingSprite.prototype._renderCanvas = function(a5) {
    if (this.visible !== !1 && 0 !== this.alpha) {
        var c = a5.context;
        this._mask && a5.maskManager.pushMask(this._mask, a5), c.globalAlpha = this.worldAlpha;
        var d, e, f = this.worldTransform, g = a5.resolution;
        if (c.setTransform(f.a * g, f.b * g, f.c * g, f.d * g, f.tx * g, f.ty * g), !this.__tilePattern || this.refreshTexture) {
            if (this.generateTilingTexture(!1), !this.tilingTexture) return;
            this.__tilePattern = c.createPattern(this.tilingTexture.baseTexture.source, "repeat");
        }
        this.blendMode !== a5.currentBlendMode && (a5.currentBlendMode = this.blendMode, c.globalCompositeOperation = b15.blendModesCanvas[a5.currentBlendMode]);
        var h = this.tilePosition, i = this.tileScale;
        for(h.x %= this.tilingTexture.baseTexture.width, h.y %= this.tilingTexture.baseTexture.height, c.scale(i.x, i.y), c.translate(h.x + this.anchor.x * -this._width, h.y + this.anchor.y * -this._height), c.fillStyle = this.__tilePattern, c.fillRect(-h.x, -h.y, this._width / i.x, this._height / i.y), c.scale(1 / i.x, 1 / i.y), c.translate(-h.x + this.anchor.x * this._width, -h.y + this.anchor.y * this._height), this._mask && a5.maskManager.popMask(a5), d = 0, e = this.children.length; e > d; d++)this.children[d]._renderCanvas(a5);
    }
}, b15.TilingSprite.prototype.getBounds = function() {
    var a5 = this._width, b12 = this._height, c = a5 * (1 - this.anchor.x), d = a5 * -this.anchor.x, e = b12 * (1 - this.anchor.y), f = b12 * -this.anchor.y, g = this.worldTransform, h = g.a, i = g.b, j = g.c, k = g.d, l = g.tx, m = g.ty, n = h * d + j * f + l, o = k * f + i * d + m, p = h * c + j * f + l, q = k * f + i * c + m, r = h * c + j * e + l, s = k * e + i * c + m, t = h * d + j * e + l, u = k * e + i * d + m, v = -(1 / 0), w = -(1 / 0), x = 1 / 0, y = 1 / 0;
    x = x > n ? n : x, x = x > p ? p : x, x = x > r ? r : x, x = x > t ? t : x, y = y > o ? o : y, y = y > q ? q : y, y = y > s ? s : y, y = y > u ? u : y, v = n > v ? n : v, v = p > v ? p : v, v = r > v ? r : v, v = t > v ? t : v, w = o > w ? o : w, w = q > w ? q : w, w = s > w ? s : w, w = u > w ? u : w;
    var z = this._bounds;
    return z.x = x, z.width = v - x, z.y = y, z.height = w - y, this._currentBounds = z, z;
}, b15.TilingSprite.prototype.onTextureUpdate = function() {
}, b15.TilingSprite.prototype.generateTilingTexture = function(a5) {
    if (this.texture.baseTexture.hasLoaded) {
        var c, d, e = this.originalTexture || this.texture, f = e.frame, g = f.width !== e.baseTexture.width || f.height !== e.baseTexture.height, h = !1;
        if (a5 ? (c = b15.getNextPowerOfTwo(f.width), d = b15.getNextPowerOfTwo(f.height), (f.width !== c || f.height !== d || e.baseTexture.width !== c || e.baseTexture.height || d) && (h = !0)) : g && (e.trim ? (c = e.trim.width, d = e.trim.height) : (c = f.width, d = f.height), h = !0), h) {
            var i;
            this.tilingTexture && this.tilingTexture.isTiling ? (i = this.tilingTexture.canvasBuffer, i.resize(c, d), this.tilingTexture.baseTexture.width = c, this.tilingTexture.baseTexture.height = d, this.tilingTexture.needsUpdate = !0) : (i = new b15.CanvasBuffer(c, d), this.tilingTexture = b15.Texture.fromCanvas(i.canvas), this.tilingTexture.canvasBuffer = i, this.tilingTexture.isTiling = !0), i.context.drawImage(e.baseTexture.source, e.crop.x, e.crop.y, e.crop.width, e.crop.height, 0, 0, c, d), this.tileScaleOffset.x = f.width / c, this.tileScaleOffset.y = f.height / d;
        } else this.tilingTexture && this.tilingTexture.isTiling && this.tilingTexture.destroy(!0), this.tileScaleOffset.x = 1, this.tileScaleOffset.y = 1, this.tilingTexture = e;
        this.refreshTexture = !1, this.originalTexture = this.texture, this.texture = this.tilingTexture, this.tilingTexture.baseTexture._powerOf2 = !0;
    }
}, b15.TilingSprite.prototype.destroy = function() {
    b15.Sprite.prototype.destroy.call(this), this.tileScale = null, this.tileScaleOffset = null, this.tilePosition = null, this.tilingTexture && (this.tilingTexture.destroy(!0), this.tilingTexture = null);
};
var c = {
    radDeg: 180 / Math.PI,
    degRad: Math.PI / 180,
    temp: [],
    Float32Array: "undefined" == typeof Float32Array ? Array : Float32Array,
    Uint16Array: "undefined" == typeof Uint16Array ? Array : Uint16Array
};
c.BoneData = function(a5, b12) {
    this.name = a5, this.parent = b12;
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
}, c.SlotData = function(a5, b12) {
    this.name = a5, this.boneData = b12;
}, c.SlotData.prototype = {
    r: 1,
    g: 1,
    b: 1,
    a: 1,
    attachmentName: null,
    additiveBlending: !1
}, c.IkConstraintData = function(a5) {
    this.name = a5, this.bones = [];
}, c.IkConstraintData.prototype = {
    target: null,
    bendDirection: 1,
    mix: 1
}, c.Bone = function(a5, b12, c1) {
    this.data = a5, this.skeleton = b12, this.parent = c1, this.setToSetupPose();
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
        var a5 = this.parent;
        if (a5) this.worldX = this.x * a5.m00 + this.y * a5.m01 + a5.worldX, this.worldY = this.x * a5.m10 + this.y * a5.m11 + a5.worldY, this.data.inheritScale ? (this.worldScaleX = a5.worldScaleX * this.scaleX, this.worldScaleY = a5.worldScaleY * this.scaleY) : (this.worldScaleX = this.scaleX, this.worldScaleY = this.scaleY), this.worldRotation = this.data.inheritRotation ? a5.worldRotation + this.rotationIK : this.rotationIK, this.worldFlipX = a5.worldFlipX != this.flipX, this.worldFlipY = a5.worldFlipY != this.flipY;
        else {
            var b12 = this.skeleton.flipX, d = this.skeleton.flipY;
            this.worldX = b12 ? -this.x : this.x, this.worldY = d != c.Bone.yDown ? -this.y : this.y, this.worldScaleX = this.scaleX, this.worldScaleY = this.scaleY, this.worldRotation = this.rotationIK, this.worldFlipX = b12 != this.flipX, this.worldFlipY = d != this.flipY;
        }
        var e = this.worldRotation * c.degRad, f = Math.cos(e), g = Math.sin(e);
        this.worldFlipX ? (this.m00 = -f * this.worldScaleX, this.m01 = g * this.worldScaleY) : (this.m00 = f * this.worldScaleX, this.m01 = -g * this.worldScaleY), this.worldFlipY != c.Bone.yDown ? (this.m10 = -g * this.worldScaleX, this.m11 = -f * this.worldScaleY) : (this.m10 = g * this.worldScaleX, this.m11 = f * this.worldScaleY);
    },
    setToSetupPose: function() {
        var a5 = this.data;
        this.x = a5.x, this.y = a5.y, this.rotation = a5.rotation, this.rotationIK = this.rotation, this.scaleX = a5.scaleX, this.scaleY = a5.scaleY, this.flipX = a5.flipX, this.flipY = a5.flipY;
    },
    worldToLocal: function(a5) {
        var b13 = a5[0] - this.worldX, d = a5[1] - this.worldY, e = this.m00, f = this.m10, g = this.m01, h = this.m11;
        this.worldFlipX != (this.worldFlipY != c.Bone.yDown) && (e = -e, h = -h);
        var i = 1 / (e * h - g * f);
        a5[0] = b13 * e * i - d * g * i, a5[1] = d * h * i - b13 * f * i;
    },
    localToWorld: function(a5) {
        var b13 = a5[0], c1 = a5[1];
        a5[0] = b13 * this.m00 + c1 * this.m01 + this.worldX, a5[1] = b13 * this.m10 + c1 * this.m11 + this.worldY;
    }
}, c.Slot = function(a5, b13) {
    this.data = a5, this.bone = b13, this.setToSetupPose();
}, c.Slot.prototype = {
    r: 1,
    g: 1,
    b: 1,
    a: 1,
    _attachmentTime: 0,
    attachment: null,
    attachmentVertices: [],
    setAttachment: function(a5) {
        this.attachment = a5, this._attachmentTime = this.bone.skeleton.time, this.attachmentVertices.length = 0;
    },
    setAttachmentTime: function(a5) {
        this._attachmentTime = this.bone.skeleton.time - a5;
    },
    getAttachmentTime: function() {
        return this.bone.skeleton.time - this._attachmentTime;
    },
    setToSetupPose: function() {
        var a5 = this.data;
        this.r = a5.r, this.g = a5.g, this.b = a5.b, this.a = a5.a;
        for(var b13 = this.bone.skeleton.data.slots, c1 = 0, d = b13.length; d > c1; c1++)if (b13[c1] == a5) {
            this.setAttachment(a5.attachmentName ? this.bone.skeleton.getAttachmentBySlotIndex(c1, a5.attachmentName) : null);
            break;
        }
    }
}, c.IkConstraint = function(a5, b13) {
    this.data = a5, this.mix = a5.mix, this.bendDirection = a5.bendDirection, this.bones = [];
    for(var c1 = 0, d = a5.bones.length; d > c1; c1++)this.bones.push(b13.findBone(a5.bones[c1].name));
    this.target = b13.findBone(a5.target.name);
}, c.IkConstraint.prototype = {
    apply: function() {
        var a5 = this.target, b13 = this.bones;
        switch(b13.length){
            case 1:
                c.IkConstraint.apply1(b13[0], a5.worldX, a5.worldY, this.mix);
                break;
            case 2:
                c.IkConstraint.apply2(b13[0], b13[1], a5.worldX, a5.worldY, this.bendDirection, this.mix);
        }
    }
}, c.IkConstraint.apply1 = function(a5, b13, d, e) {
    var f = a5.data.inheritRotation && a5.parent ? a5.parent.worldRotation : 0, g = a5.rotation, h = Math.atan2(d - a5.worldY, b13 - a5.worldX) * c.radDeg - f;
    a5.rotationIK = g + (h - g) * e;
}, c.IkConstraint.apply2 = function(a5, b13, d, e, f, g) {
    var h = b13.rotation, i = a5.rotation;
    if (!g) return b13.rotationIK = h, void (a5.rotationIK = i);
    var j, k, l = c.temp, m = a5.parent;
    m ? (l[0] = d, l[1] = e, m.worldToLocal(l), d = (l[0] - a5.x) * m.worldScaleX, e = (l[1] - a5.y) * m.worldScaleY) : (d -= a5.x, e -= a5.y), b13.parent == a5 ? (j = b13.x, k = b13.y) : (l[0] = b13.x, l[1] = b13.y, b13.parent.localToWorld(l), a5.worldToLocal(l), j = l[0], k = l[1]);
    var n = j * a5.worldScaleX, o = k * a5.worldScaleY, p = Math.atan2(o, n), q = Math.sqrt(n * n + o * o), r = b13.data.length * b13.worldScaleX, s = 2 * q * r;
    if (0.0001 > s) return void (b13.rotationIK = h + (Math.atan2(e, d) * c.radDeg - i - h) * g);
    var t = (d * d + e * e - q * q - r * r) / s;
    -1 > t ? t = -1 : t > 1 && (t = 1);
    var u = Math.acos(t) * f, v = q + r * t, w = r * Math.sin(u), x = Math.atan2(e * v - d * w, d * v + e * w), y = (x - p) * c.radDeg - i;
    y > 180 ? y -= 360 : -180 > y && (y += 360), a5.rotationIK = i + y * g, y = (u + p) * c.radDeg - h, y > 180 ? y -= 360 : -180 > y && (y += 360), b13.rotationIK = h + (y + a5.worldRotation - b13.parent.worldRotation) * g;
}, c.Skin = function(a5) {
    this.name = a5, this.attachments = {
    };
}, c.Skin.prototype = {
    addAttachment: function(a5, b13, c1) {
        this.attachments[a5 + ":" + b13] = c1;
    },
    getAttachment: function(a5, b13) {
        return this.attachments[a5 + ":" + b13];
    },
    _attachAll: function(a5, b13) {
        for(var c1 in b13.attachments){
            var d = c1.indexOf(":"), e = parseInt(c1.substring(0, d)), f = c1.substring(d + 1), g = a5.slots[e];
            if (g.attachment && g.attachment.name == f) {
                var h = this.getAttachment(e, f);
                h && g.setAttachment(h);
            }
        }
    }
}, c.Animation = function(a5, b13, c1) {
    this.name = a5, this.timelines = b13, this.duration = c1;
}, c.Animation.prototype = {
    apply: function(a5, b13, c1, d, e) {
        d && 0 != this.duration && (c1 %= this.duration, b13 %= this.duration);
        for(var f = this.timelines, g = 0, h = f.length; h > g; g++)f[g].apply(a5, b13, c1, e, 1);
    },
    mix: function(a5, b13, c1, d, e, f) {
        d && 0 != this.duration && (c1 %= this.duration, b13 %= this.duration);
        for(var g = this.timelines, h = 0, i = g.length; i > h; h++)g[h].apply(a5, b13, c1, e, f);
    }
}, c.Animation.binarySearch = function(a5, b13, c1) {
    var d = 0, e = Math.floor(a5.length / c1) - 2;
    if (!e) return c1;
    for(var f = e >>> 1;;){
        if (a5[(f + 1) * c1] <= b13 ? d = f + 1 : e = f, d == e) return (d + 1) * c1;
        f = d + e >>> 1;
    }
}, c.Animation.binarySearch1 = function(a5, b13) {
    var c1 = 0, d = a5.length - 2;
    if (!d) return 1;
    for(var e = d >>> 1;;){
        if (a5[e + 1] <= b13 ? c1 = e + 1 : d = e, c1 == d) return c1 + 1;
        e = c1 + d >>> 1;
    }
}, c.Animation.linearSearch = function(a5, b13, c1) {
    for(var d = 0, e = a5.length - c1; e >= d; d += c1)if (a5[d] > b13) return d;
    return -1;
}, c.Curves = function() {
    this.curves = [];
}, c.Curves.prototype = {
    setLinear: function(a5) {
        this.curves[19 * a5] = 0;
    },
    setStepped: function(a5) {
        this.curves[19 * a5] = 1;
    },
    setCurve: function(a5, b13, c1, d, e) {
        var f = 0.1, g = f * f, h = g * f, i = 3 * f, j = 3 * g, k = 6 * g, l = 6 * h, m = 2 * -b13 + d, n = 2 * -c1 + e, o = 3 * (b13 - d) + 1, p = 3 * (c1 - e) + 1, q = b13 * i + m * j + o * h, r = c1 * i + n * j + p * h, s = m * k + o * l, t = n * k + p * l, u = o * l, v = p * l, w = 19 * a5, x = this.curves;
        x[w++] = 2;
        for(var y = q, z = r, A = w + 19 - 1; A > w; w += 2)x[w] = y, x[w + 1] = z, q += s, r += t, s += u, t += v, y += q, z += r;
    },
    getCurvePercent: function(a5, b13) {
        b13 = 0 > b13 ? 0 : b13 > 1 ? 1 : b13;
        var c1 = this.curves, d = 19 * a5, e = c1[d];
        if (0 === e) return b13;
        if (1 == e) return 0;
        d++;
        for(var f = 0, g = d, h = d + 19 - 1; h > d; d += 2)if (f = c1[d], f >= b13) {
            var i, j;
            return d == g ? (i = 0, j = 0) : (i = c1[d - 2], j = c1[d - 1]), j + (c1[d + 1] - j) * (b13 - i) / (f - i);
        }
        var k = c1[d - 1];
        return k + (1 - k) * (b13 - f) / (1 - f);
    }
}, c.RotateTimeline = function(a5) {
    this.curves = new c.Curves(a5), this.frames = [], this.frames.length = 2 * a5;
}, c.RotateTimeline.prototype = {
    boneIndex: 0,
    getFrameCount: function() {
        return this.frames.length / 2;
    },
    setFrame: function(a5, b13, c1) {
        a5 *= 2, this.frames[a5] = b13, this.frames[a5 + 1] = c1;
    },
    apply: function(a5, b13, d, e, f) {
        var g = this.frames;
        if (!(d < g[0])) {
            var h = a5.bones[this.boneIndex];
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
}, c.TranslateTimeline = function(a5) {
    this.curves = new c.Curves(a5), this.frames = [], this.frames.length = 3 * a5;
}, c.TranslateTimeline.prototype = {
    boneIndex: 0,
    getFrameCount: function() {
        return this.frames.length / 3;
    },
    setFrame: function(a5, b13, c1, d) {
        a5 *= 3, this.frames[a5] = b13, this.frames[a5 + 1] = c1, this.frames[a5 + 2] = d;
    },
    apply: function(a5, b13, d, e, f) {
        var g = this.frames;
        if (!(d < g[0])) {
            var h = a5.bones[this.boneIndex];
            if (d >= g[g.length - 3]) return h.x += (h.data.x + g[g.length - 2] - h.x) * f, void (h.y += (h.data.y + g[g.length - 1] - h.y) * f);
            var i = c.Animation.binarySearch(g, d, 3), j = g[i - 2], k = g[i - 1], l = g[i], m = 1 - (d - l) / (g[i + -3] - l);
            m = this.curves.getCurvePercent(i / 3 - 1, m), h.x += (h.data.x + j + (g[i + 1] - j) * m - h.x) * f, h.y += (h.data.y + k + (g[i + 2] - k) * m - h.y) * f;
        }
    }
}, c.ScaleTimeline = function(a5) {
    this.curves = new c.Curves(a5), this.frames = [], this.frames.length = 3 * a5;
}, c.ScaleTimeline.prototype = {
    boneIndex: 0,
    getFrameCount: function() {
        return this.frames.length / 3;
    },
    setFrame: function(a5, b13, c1, d) {
        a5 *= 3, this.frames[a5] = b13, this.frames[a5 + 1] = c1, this.frames[a5 + 2] = d;
    },
    apply: function(a5, b13, d, e, f) {
        var g = this.frames;
        if (!(d < g[0])) {
            var h = a5.bones[this.boneIndex];
            if (d >= g[g.length - 3]) return h.scaleX += (h.data.scaleX * g[g.length - 2] - h.scaleX) * f, void (h.scaleY += (h.data.scaleY * g[g.length - 1] - h.scaleY) * f);
            var i = c.Animation.binarySearch(g, d, 3), j = g[i - 2], k = g[i - 1], l = g[i], m = 1 - (d - l) / (g[i + -3] - l);
            m = this.curves.getCurvePercent(i / 3 - 1, m), h.scaleX += (h.data.scaleX * (j + (g[i + 1] - j) * m) - h.scaleX) * f, h.scaleY += (h.data.scaleY * (k + (g[i + 2] - k) * m) - h.scaleY) * f;
        }
    }
}, c.ColorTimeline = function(a5) {
    this.curves = new c.Curves(a5), this.frames = [], this.frames.length = 5 * a5;
}, c.ColorTimeline.prototype = {
    slotIndex: 0,
    getFrameCount: function() {
        return this.frames.length / 5;
    },
    setFrame: function(a5, b13, c1, d, e, f) {
        a5 *= 5, this.frames[a5] = b13, this.frames[a5 + 1] = c1, this.frames[a5 + 2] = d, this.frames[a5 + 3] = e, this.frames[a5 + 4] = f;
    },
    apply: function(a5, b13, d, e, f) {
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
            var t = a5.slots[this.slotIndex];
            1 > f ? (t.r += (h - t.r) * f, t.g += (i - t.g) * f, t.b += (j - t.b) * f, t.a += (k - t.a) * f) : (t.r = h, t.g = i, t.b = j, t.a = k);
        }
    }
}, c.AttachmentTimeline = function(a5) {
    this.curves = new c.Curves(a5), this.frames = [], this.frames.length = a5, this.attachmentNames = [], this.attachmentNames.length = a5;
}, c.AttachmentTimeline.prototype = {
    slotIndex: 0,
    getFrameCount: function() {
        return this.frames.length;
    },
    setFrame: function(a5, b13, c1) {
        this.frames[a5] = b13, this.attachmentNames[a5] = c1;
    },
    apply: function(a5, b13, d) {
        var e = this.frames;
        if (d < e[0]) return void (b13 > d && this.apply(a5, b13, Number.MAX_VALUE, null, 0));
        b13 > d && (b13 = -1);
        var f = d >= e[e.length - 1] ? e.length - 1 : c.Animation.binarySearch1(e, d) - 1;
        if (!(e[f] < b13)) {
            var g = this.attachmentNames[f];
            a5.slots[this.slotIndex].setAttachment(g ? a5.getAttachmentBySlotIndex(this.slotIndex, g) : null);
        }
    }
}, c.EventTimeline = function(a5) {
    this.frames = [], this.frames.length = a5, this.events = [], this.events.length = a5;
}, c.EventTimeline.prototype = {
    getFrameCount: function() {
        return this.frames.length;
    },
    setFrame: function(a5, b13, c1) {
        this.frames[a5] = b13, this.events[a5] = c1;
    },
    apply: function(a5, b13, d, e, f) {
        if (e) {
            var g = this.frames, h = g.length;
            if (b13 > d) this.apply(a5, b13, Number.MAX_VALUE, e, f), b13 = -1;
            else if (b13 >= g[h - 1]) return;
            if (!(d < g[0])) {
                var i;
                if (b13 < g[0]) i = 0;
                else {
                    i = c.Animation.binarySearch1(g, b13);
                    for(var j = g[i]; i > 0 && g[i - 1] == j;)i--;
                }
                for(var k = this.events; h > i && d >= g[i]; i++)e.push(k[i]);
            }
        }
    }
}, c.DrawOrderTimeline = function(a5) {
    this.frames = [], this.frames.length = a5, this.drawOrders = [], this.drawOrders.length = a5;
}, c.DrawOrderTimeline.prototype = {
    getFrameCount: function() {
        return this.frames.length;
    },
    setFrame: function(a5, b13, c1) {
        this.frames[a5] = b13, this.drawOrders[a5] = c1;
    },
    apply: function(a5, b13, d) {
        var e = this.frames;
        if (!(d < e[0])) {
            var f;
            f = d >= e[e.length - 1] ? e.length - 1 : c.Animation.binarySearch1(e, d) - 1;
            var g = a5.drawOrder, h = (a5.slots, this.drawOrders[f]);
            if (h) for(var i = 0, j = h.length; j > i; i++)g[i] = h[i];
        }
    }
}, c.FfdTimeline = function(a5) {
    this.curves = new c.Curves(a5), this.frames = [], this.frames.length = a5, this.frameVertices = [], this.frameVertices.length = a5;
}, c.FfdTimeline.prototype = {
    slotIndex: 0,
    attachment: 0,
    getFrameCount: function() {
        return this.frames.length;
    },
    setFrame: function(a5, b13, c1) {
        this.frames[a5] = b13, this.frameVertices[a5] = c1;
    },
    apply: function(a5, b13, d, e, f) {
        var g = a5.slots[this.slotIndex];
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
}, c.IkConstraintTimeline = function(a5) {
    this.curves = new c.Curves(a5), this.frames = [], this.frames.length = 3 * a5;
}, c.IkConstraintTimeline.prototype = {
    ikConstraintIndex: 0,
    getFrameCount: function() {
        return this.frames.length / 3;
    },
    setFrame: function(a5, b13, c1, d) {
        a5 *= 3, this.frames[a5] = b13, this.frames[a5 + 1] = c1, this.frames[a5 + 2] = d;
    },
    apply: function(a5, b13, d, e, f) {
        var g = this.frames;
        if (!(d < g[0])) {
            var h = a5.ikConstraints[this.ikConstraintIndex];
            if (d >= g[g.length - 3]) return h.mix += (g[g.length - 2] - h.mix) * f, void (h.bendDirection = g[g.length - 1]);
            var i = c.Animation.binarySearch(g, d, 3), j = g[i + -2], k = g[i], l = 1 - (d - k) / (g[i + -3] - k);
            l = this.curves.getCurvePercent(i / 3 - 1, l);
            var m = j + (g[i + 1] - j) * l;
            h.mix += (m - h.mix) * f, h.bendDirection = g[i + -1];
        }
    }
}, c.FlipXTimeline = function(a5) {
    this.curves = new c.Curves(a5), this.frames = [], this.frames.length = 2 * a5;
}, c.FlipXTimeline.prototype = {
    boneIndex: 0,
    getFrameCount: function() {
        return this.frames.length / 2;
    },
    setFrame: function(a5, b13, c1) {
        a5 *= 2, this.frames[a5] = b13, this.frames[a5 + 1] = c1 ? 1 : 0;
    },
    apply: function(a5, b13, d) {
        var e = this.frames;
        if (d < e[0]) return void (b13 > d && this.apply(a5, b13, Number.MAX_VALUE, null, 0));
        b13 > d && (b13 = -1);
        var f = (d >= e[e.length - 2] ? e.length : c.Animation.binarySearch(e, d, 2)) - 2;
        e[f] < b13 || (a5.bones[boneIndex].flipX = 0 != e[f + 1]);
    }
}, c.FlipYTimeline = function(a5) {
    this.curves = new c.Curves(a5), this.frames = [], this.frames.length = 2 * a5;
}, c.FlipYTimeline.prototype = {
    boneIndex: 0,
    getFrameCount: function() {
        return this.frames.length / 2;
    },
    setFrame: function(a5, b13, c1) {
        a5 *= 2, this.frames[a5] = b13, this.frames[a5 + 1] = c1 ? 1 : 0;
    },
    apply: function(a5, b13, d) {
        var e = this.frames;
        if (d < e[0]) return void (b13 > d && this.apply(a5, b13, Number.MAX_VALUE, null, 0));
        b13 > d && (b13 = -1);
        var f = (d >= e[e.length - 2] ? e.length : c.Animation.binarySearch(e, d, 2)) - 2;
        e[f] < b13 || (a5.bones[boneIndex].flipY = 0 != e[f + 1]);
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
    findBone: function(a5) {
        for(var b13 = this.bones, c1 = 0, d = b13.length; d > c1; c1++)if (b13[c1].name == a5) return b13[c1];
        return null;
    },
    findBoneIndex: function(a5) {
        for(var b13 = this.bones, c1 = 0, d = b13.length; d > c1; c1++)if (b13[c1].name == a5) return c1;
        return -1;
    },
    findSlot: function(a5) {
        for(var b13 = this.slots, c1 = 0, d = b13.length; d > c1; c1++)if (b13[c1].name == a5) return slot[c1];
        return null;
    },
    findSlotIndex: function(a5) {
        for(var b13 = this.slots, c1 = 0, d = b13.length; d > c1; c1++)if (b13[c1].name == a5) return c1;
        return -1;
    },
    findSkin: function(a5) {
        for(var b13 = this.skins, c1 = 0, d = b13.length; d > c1; c1++)if (b13[c1].name == a5) return b13[c1];
        return null;
    },
    findEvent: function(a5) {
        for(var b13 = this.events, c1 = 0, d = b13.length; d > c1; c1++)if (b13[c1].name == a5) return b13[c1];
        return null;
    },
    findAnimation: function(a5) {
        for(var b13 = this.animations, c1 = 0, d = b13.length; d > c1; c1++)if (b13[c1].name == a5) return b13[c1];
        return null;
    },
    findIkConstraint: function(a5) {
        for(var b13 = this.ikConstraints, c1 = 0, d = b13.length; d > c1; c1++)if (b13[c1].name == a5) return b13[c1];
        return null;
    }
}, c.Skeleton = function(a5) {
    this.data = a5, this.bones = [];
    for(var b13 = 0, d = a5.bones.length; d > b13; b13++){
        var e = a5.bones[b13], f = e.parent ? this.bones[a5.bones.indexOf(e.parent)] : null;
        this.bones.push(new c.Bone(e, this, f));
    }
    this.slots = [], this.drawOrder = [];
    for(var b13 = 0, d = a5.slots.length; d > b13; b13++){
        var g = a5.slots[b13], h = this.bones[a5.bones.indexOf(g.boneData)], i = new c.Slot(g, h);
        this.slots.push(i), this.drawOrder.push(b13);
    }
    this.ikConstraints = [];
    for(var b13 = 0, d = a5.ikConstraints.length; d > b13; b13++)this.ikConstraints.push(new c.IkConstraint(a5.ikConstraints[b13], this));
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
        var a5 = this.ikConstraints, b13 = a5.length, c1 = b13 + 1, d = this.boneCache;
        d.length > c1 && (d.length = c1);
        for(var e = 0, f = d.length; f > e; e++)d[e].length = 0;
        for(; d.length < c1;)d[d.length] = [];
        var g = d[0], h = this.bones;
        a: for(var e = 0, f = h.length; f > e; e++){
            var i = h[e], j = i;
            do {
                for(var k = 0; b13 > k; k++)for(var l = a5[k], m = l.bones[0], n = l.bones[l.bones.length - 1];;){
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
        for(var a5 = this.bones, b13 = 0, c1 = a5.length; c1 > b13; b13++){
            var d = a5[b13];
            d.rotationIK = d.rotation;
        }
        for(var b13 = 0, e = this.boneCache.length - 1;;){
            for(var f = this.boneCache[b13], g = 0, h = f.length; h > g; g++)f[g].updateWorldTransform();
            if (b13 == e) break;
            this.ikConstraints[b13].apply(), b13++;
        }
    },
    setToSetupPose: function() {
        this.setBonesToSetupPose(), this.setSlotsToSetupPose();
    },
    setBonesToSetupPose: function() {
        for(var a5 = this.bones, b13 = 0, c1 = a5.length; c1 > b13; b13++)a5[b13].setToSetupPose();
        for(var d = this.ikConstraints, b13 = 0, c1 = d.length; c1 > b13; b13++){
            var e = d[b13];
            e.bendDirection = e.data.bendDirection, e.mix = e.data.mix;
        }
    },
    setSlotsToSetupPose: function() {
        for(var a5 = this.slots, b13 = 0, c1 = a5.length; c1 > b13; b13++)a5[b13].setToSetupPose(b13);
        this.resetDrawOrder();
    },
    getRootBone: function() {
        return this.bones.length ? this.bones[0] : null;
    },
    findBone: function(a5) {
        for(var b13 = this.bones, c1 = 0, d = b13.length; d > c1; c1++)if (b13[c1].data.name == a5) return b13[c1];
        return null;
    },
    findBoneIndex: function(a5) {
        for(var b13 = this.bones, c1 = 0, d = b13.length; d > c1; c1++)if (b13[c1].data.name == a5) return c1;
        return -1;
    },
    findSlot: function(a5) {
        for(var b13 = this.slots, c1 = 0, d = b13.length; d > c1; c1++)if (b13[c1].data.name == a5) return b13[c1];
        return null;
    },
    findSlotIndex: function(a5) {
        for(var b13 = this.slots, c1 = 0, d = b13.length; d > c1; c1++)if (b13[c1].data.name == a5) return c1;
        return -1;
    },
    setSkinByName: function(a5) {
        var b13 = this.data.findSkin(a5);
        if (!b13) throw "Skin not found: " + a5;
        this.setSkin(b13);
    },
    setSkin: function(a5) {
        if (a5) {
            if (this.skin) a5._attachAll(this, this.skin);
            else for(var b13 = this.slots, c1 = 0, d = b13.length; d > c1; c1++){
                var e = b13[c1], f = e.data.attachmentName;
                if (f) {
                    var g = a5.getAttachment(c1, f);
                    g && e.setAttachment(g);
                }
            }
        }
        this.skin = a5;
    },
    getAttachmentBySlotName: function(a5, b14) {
        return this.getAttachmentBySlotIndex(this.data.findSlotIndex(a5), b14);
    },
    getAttachmentBySlotIndex: function(a5, b14) {
        if (this.skin) {
            var c2 = this.skin.getAttachment(a5, b14);
            if (c2) return c2;
        }
        return this.data.defaultSkin ? this.data.defaultSkin.getAttachment(a5, b14) : null;
    },
    setAttachment: function(a5, b14) {
        for(var c3 = this.slots, d = 0, e = c3.length; e > d; d++){
            var f = c3[d];
            if (f.data.name == a5) {
                var g = null;
                if (b14 && (g = this.getAttachmentBySlotIndex(d, b14), !g)) throw "Attachment not found: " + b14 + ", for slot: " + a5;
                return void f.setAttachment(g);
            }
        }
        throw "Slot not found: " + a5;
    },
    findIkConstraint: function(a5) {
        for(var b14 = this.ikConstraints, c3 = 0, d = b14.length; d > c3; c3++)if (b14[c3].data.name == a5) return b14[c3];
        return null;
    },
    update: function(a5) {
        this.time += a5;
    },
    resetDrawOrder: function() {
        for(var a5 = 0, b14 = this.drawOrder.length; b14 > a5; a5++)this.drawOrder[a5] = a5;
    }
}, c.EventData = function(a5) {
    this.name = a5;
}, c.EventData.prototype = {
    intValue: 0,
    floatValue: 0,
    stringValue: null
}, c.Event = function(a5) {
    this.data = a5;
}, c.Event.prototype = {
    intValue: 0,
    floatValue: 0,
    stringValue: null
}, c.AttachmentType = {
    region: 0,
    boundingbox: 1,
    mesh: 2,
    skinnedmesh: 3
}, c.RegionAttachment = function(a5) {
    this.name = a5, this.offset = [], this.offset.length = 8, this.uvs = [], this.uvs.length = 8;
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
    setUVs: function(a5, b14, c3, d, e) {
        var f = this.uvs;
        e ? (f[2] = a5, f[3] = d, f[4] = a5, f[5] = b14, f[6] = c3, f[7] = b14, f[0] = c3, f[1] = d) : (f[0] = a5, f[1] = d, f[2] = a5, f[3] = b14, f[4] = c3, f[5] = b14, f[6] = c3, f[7] = d);
    },
    updateOffset: function() {
        var a5 = this.width / this.regionOriginalWidth * this.scaleX, b14 = this.height / this.regionOriginalHeight * this.scaleY, d = -this.width / 2 * this.scaleX + this.regionOffsetX * a5, e = -this.height / 2 * this.scaleY + this.regionOffsetY * b14, f = d + this.regionWidth * a5, g = e + this.regionHeight * b14, h = this.rotation * c.degRad, i = Math.cos(h), j = Math.sin(h), k = d * i + this.x, l = d * j, m = e * i + this.y, n = e * j, o = f * i + this.x, p = f * j, q = g * i + this.y, r = g * j, s = this.offset;
        s[0] = k - n, s[1] = m + l, s[2] = k - r, s[3] = q + l, s[4] = o - r, s[5] = q + p, s[6] = o - n, s[7] = m + p;
    },
    computeVertices: function(a5, b14, c3, d) {
        a5 += c3.worldX, b14 += c3.worldY;
        var e = c3.m00, f = c3.m01, g = c3.m10, h = c3.m11, i = this.offset;
        d[0] = i[0] * e + i[1] * f + a5, d[1] = i[0] * g + i[1] * h + b14, d[2] = i[2] * e + i[3] * f + a5, d[3] = i[2] * g + i[3] * h + b14, d[4] = i[4] * e + i[5] * f + a5, d[5] = i[4] * g + i[5] * h + b14, d[6] = i[6] * e + i[7] * f + a5, d[7] = i[6] * g + i[7] * h + b14;
    }
}, c.MeshAttachment = function(a5) {
    this.name = a5;
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
        var a5 = this.regionU2 - this.regionU, b14 = this.regionV2 - this.regionV, d = this.regionUVs.length;
        if (this.uvs && this.uvs.length == d || (this.uvs = new c.Float32Array(d)), this.regionRotate) for(var e = 0; d > e; e += 2)this.uvs[e] = this.regionU + this.regionUVs[e + 1] * a5, this.uvs[e + 1] = this.regionV + b14 - this.regionUVs[e] * b14;
        else for(var e = 0; d > e; e += 2)this.uvs[e] = this.regionU + this.regionUVs[e] * a5, this.uvs[e + 1] = this.regionV + this.regionUVs[e + 1] * b14;
    },
    computeWorldVertices: function(a5, b14, c3, d) {
        var e = c3.bone;
        a5 += e.worldX, b14 += e.worldY;
        var f = e.m00, g = e.m01, h = e.m10, i = e.m11, j = this.vertices, k = j.length;
        c3.attachmentVertices.length == k && (j = c3.attachmentVertices);
        for(var l = 0; k > l; l += 2){
            var m = j[l], n = j[l + 1];
            d[l] = m * f + n * g + a5, d[l + 1] = m * h + n * i + b14;
        }
    }
}, c.SkinnedMeshAttachment = function(a5) {
    this.name = a5;
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
        var a5 = this.regionU2 - this.regionU, b14 = this.regionV2 - this.regionV, d = this.regionUVs.length;
        if (this.uvs && this.uvs.length == d || (this.uvs = new c.Float32Array(d)), this.regionRotate) for(var e = 0; d > e; e += 2)this.uvs[e] = this.regionU + this.regionUVs[e + 1] * a5, this.uvs[e + 1] = this.regionV + b14 - this.regionUVs[e] * b14;
        else for(var e = 0; d > e; e += 2)this.uvs[e] = this.regionU + this.regionUVs[e] * a5, this.uvs[e + 1] = this.regionV + this.regionUVs[e + 1] * b14;
    },
    computeWorldVertices: function(a5, b14, c3, d) {
        var e, f, g, h, i, j, k, l = c3.bone.skeleton.bones, m = this.weights, n = this.bones, o = 0, p = 0, q = 0, r = 0, s = n.length;
        if (c3.attachmentVertices.length) for(var t = c3.attachmentVertices; s > p; o += 2){
            for(f = 0, g = 0, e = n[p++] + p; e > p; p++, q += 3, r += 2)h = l[n[p]], i = m[q] + t[r], j = m[q + 1] + t[r + 1], k = m[q + 2], f += (i * h.m00 + j * h.m01 + h.worldX) * k, g += (i * h.m10 + j * h.m11 + h.worldY) * k;
            d[o] = f + a5, d[o + 1] = g + b14;
        }
        else for(; s > p; o += 2){
            for(f = 0, g = 0, e = n[p++] + p; e > p; p++, q += 3)h = l[n[p]], i = m[q], j = m[q + 1], k = m[q + 2], f += (i * h.m00 + j * h.m01 + h.worldX) * k, g += (i * h.m10 + j * h.m11 + h.worldY) * k;
            d[o] = f + a5, d[o + 1] = g + b14;
        }
    }
}, c.BoundingBoxAttachment = function(a5) {
    this.name = a5, this.vertices = [];
}, c.BoundingBoxAttachment.prototype = {
    type: c.AttachmentType.boundingbox,
    computeWorldVertices: function(a5, b14, c3, d) {
        a5 += c3.worldX, b14 += c3.worldY;
        for(var e = c3.m00, f = c3.m01, g = c3.m10, h = c3.m11, i = this.vertices, j = 0, k = i.length; k > j; j += 2){
            var l = i[j], m = i[j + 1];
            d[j] = l * e + m * f + a5, d[j + 1] = l * g + m * h + b14;
        }
    }
}, c.AnimationStateData = function(a5) {
    this.skeletonData = a5, this.animationToMixTime = {
    };
}, c.AnimationStateData.prototype = {
    defaultMix: 0,
    setMixByName: function(a5, b14, c3) {
        var d = this.skeletonData.findAnimation(a5);
        if (!d) throw "Animation not found: " + a5;
        var e = this.skeletonData.findAnimation(b14);
        if (!e) throw "Animation not found: " + b14;
        this.setMix(d, e, c3);
    },
    setMix: function(a5, b14, c3) {
        this.animationToMixTime[a5.name + ":" + b14.name] = c3;
    },
    getMix: function(a5, b14) {
        var c3 = a5.name + ":" + b14.name;
        return this.animationToMixTime.hasOwnProperty(c3) ? this.animationToMixTime[c3] : this.defaultMix;
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
}, c.AnimationState = function(a5) {
    this.data = a5, this.tracks = [], this.events = [];
}, c.AnimationState.prototype = {
    onStart: null,
    onEnd: null,
    onComplete: null,
    onEvent: null,
    timeScale: 1,
    update: function(a5) {
        a5 *= this.timeScale;
        for(var b14 = 0; b14 < this.tracks.length; b14++){
            var c3 = this.tracks[b14];
            if (c3) {
                if (c3.time += a5 * c3.timeScale, c3.previous) {
                    var d = a5 * c3.previous.timeScale;
                    c3.previous.time += d, c3.mixTime += d;
                }
                var e = c3.next;
                e ? (e.time = c3.lastTime - e.delay, e.time >= 0 && this.setCurrent(b14, e)) : !c3.loop && c3.lastTime >= c3.endTime && this.clearTrack(b14);
            }
        }
    },
    apply: function(a5) {
        a5.resetDrawOrder();
        for(var b14 = 0; b14 < this.tracks.length; b14++){
            var c4 = this.tracks[b14];
            if (c4) {
                this.events.length = 0;
                var d = c4.time, e = c4.lastTime, f = c4.endTime, g = c4.loop;
                !g && d > f && (d = f);
                var h = c4.previous;
                if (h) {
                    var i = h.time;
                    !h.loop && i > h.endTime && (i = h.endTime), h.animation.apply(a5, i, i, h.loop, null);
                    var j = c4.mixTime / c4.mixDuration * c4.mix;
                    j >= 1 && (j = 1, c4.previous = null), c4.animation.mix(a5, c4.lastTime, d, g, this.events, j);
                } else 1 == c4.mix ? c4.animation.apply(a5, c4.lastTime, d, g, this.events) : c4.animation.mix(a5, c4.lastTime, d, g, this.events, c4.mix);
                for(var k = 0, l = this.events.length; l > k; k++){
                    var m = this.events[k];
                    c4.onEvent && c4.onEvent(b14, m), this.onEvent && this.onEvent(b14, m);
                }
                if (g ? e % f > d % f : f > e && d >= f) {
                    var n = Math.floor(d / f);
                    c4.onComplete && c4.onComplete(b14, n), this.onComplete && this.onComplete(b14, n);
                }
                c4.lastTime = c4.time;
            }
        }
    },
    clearTracks: function() {
        for(var a5 = 0, b14 = this.tracks.length; b14 > a5; a5++)this.clearTrack(a5);
        this.tracks.length = 0;
    },
    clearTrack: function(a5) {
        if (!(a5 >= this.tracks.length)) {
            var b14 = this.tracks[a5];
            b14 && (b14.onEnd && b14.onEnd(a5), this.onEnd && this.onEnd(a5), this.tracks[a5] = null);
        }
    },
    _expandToIndex: function(a5) {
        if (a5 < this.tracks.length) return this.tracks[a5];
        for(; a5 >= this.tracks.length;)this.tracks.push(null);
        return null;
    },
    setCurrent: function(a5, b15) {
        var c5 = this._expandToIndex(a5);
        if (c5) {
            var d = c5.previous;
            c5.previous = null, c5.onEnd && c5.onEnd(a5), this.onEnd && this.onEnd(a5), b15.mixDuration = this.data.getMix(c5.animation, b15.animation), b15.mixDuration > 0 && (b15.mixTime = 0, b15.previous = d && c5.mixTime / c5.mixDuration < 0.5 ? d : c5);
        }
        this.tracks[a5] = b15, b15.onStart && b15.onStart(a5), this.onStart && this.onStart(a5);
    },
    setAnimationByName: function(a5, b15, c5) {
        var d = this.data.skeletonData.findAnimation(b15);
        if (!d) throw "Animation not found: " + b15;
        return this.setAnimation(a5, d, c5);
    },
    setAnimation: function(a5, b15, d) {
        var e = new c.TrackEntry;
        return e.animation = b15, e.loop = d, e.endTime = b15.duration, this.setCurrent(a5, e), e;
    },
    addAnimationByName: function(a5, b15, c5, d) {
        var e = this.data.skeletonData.findAnimation(b15);
        if (!e) throw "Animation not found: " + b15;
        return this.addAnimation(a5, e, c5, d);
    },
    addAnimation: function(a5, b15, d, e) {
        var f = new c.TrackEntry;
        f.animation = b15, f.loop = d, f.endTime = b15.duration;
        var g = this._expandToIndex(a5);
        if (g) {
            for(; g.next;)g = g.next;
            g.next = f;
        } else this.tracks[a5] = f;
        return 0 >= e && (g ? e += g.endTime - this.data.getMix(g.animation, b15) : e = 0), f.delay = e, f;
    },
    getCurrent: function(a5) {
        return a5 >= this.tracks.length ? null : this.tracks[a5];
    }
}, c.SkeletonJson = function(a5) {
    this.attachmentLoader = a5;
}, c.SkeletonJson.prototype = {
    scale: 1,
    readSkeletonData: function(a5, b15) {
        var d = new c.SkeletonData;
        d.name = b15;
        var e = a5.skeleton;
        e && (d.hash = e.hash, d.version = e.spine, d.width = e.width || 0, d.height = e.height || 0);
        for(var f = a5.bones, g = 0, h = f.length; h > g; g++){
            var i = f[g], j = null;
            if (i.parent && (j = d.findBone(i.parent), !j)) throw "Parent bone not found: " + i.parent;
            var k = new c.BoneData(i.name, j);
            k.length = (i.length || 0) * this.scale, k.x = (i.x || 0) * this.scale, k.y = (i.y || 0) * this.scale, k.rotation = i.rotation || 0, k.scaleX = i.hasOwnProperty("scaleX") ? i.scaleX : 1, k.scaleY = i.hasOwnProperty("scaleY") ? i.scaleY : 1, k.inheritScale = i.hasOwnProperty("inheritScale") ? i.inheritScale : !0, k.inheritRotation = i.hasOwnProperty("inheritRotation") ? i.inheritRotation : !0, d.bones.push(k);
        }
        var l = a5.ik;
        if (l) for(var g = 0, h = l.length; h > g; g++){
            for(var m = l[g], n = new c.IkConstraintData(m.name), f = m.bones, o = 0, p = f.length; p > o; o++){
                var q = d.findBone(f[o]);
                if (!q) throw "IK bone not found: " + f[o];
                n.bones.push(q);
            }
            if (n.target = d.findBone(m.target), !n.target) throw "Target bone not found: " + m.target;
            n.bendDirection = !m.hasOwnProperty("bendPositive") || m.bendPositive ? 1 : -1, n.mix = m.hasOwnProperty("mix") ? m.mix : 1, d.ikConstraints.push(n);
        }
        for(var r = a5.slots, g = 0, h = r.length; h > g; g++){
            var s = r[g], k = d.findBone(s.bone);
            if (!k) throw "Slot bone not found: " + s.bone;
            var t = new c.SlotData(s.name, k), u = s.color;
            u && (t.r = this.toColor(u, 0), t.g = this.toColor(u, 1), t.b = this.toColor(u, 2), t.a = this.toColor(u, 3)), t.attachmentName = s.attachment, t.additiveBlending = s.additive && "true" == s.additive, d.slots.push(t);
        }
        var v = a5.skins;
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
        var E = a5.events;
        for(var F in E)if (E.hasOwnProperty(F)) {
            var G = E[F], H = new c.EventData(F);
            H.intValue = G["int"] || 0, H.floatValue = G["float"] || 0, H.stringValue = G.string || null, d.events.push(H);
        }
        var I = a5.animations;
        for(var J in I)I.hasOwnProperty(J) && this.readAnimation(J, I[J], d);
        return d;
    },
    readAttachment: function(a5, b15, d) {
        b15 = d.name || b15;
        var e = c.AttachmentType[d.type || "region"], f = d.path || b15, g = this.scale;
        if (e == c.AttachmentType.region) {
            var h = this.attachmentLoader.newRegionAttachment(a5, b15, f);
            if (!h) return null;
            h.path = f, h.x = (d.x || 0) * g, h.y = (d.y || 0) * g, h.scaleX = d.hasOwnProperty("scaleX") ? d.scaleX : 1, h.scaleY = d.hasOwnProperty("scaleY") ? d.scaleY : 1, h.rotation = d.rotation || 0, h.width = (d.width || 0) * g, h.height = (d.height || 0) * g;
            var i = d.color;
            return i && (h.r = this.toColor(i, 0), h.g = this.toColor(i, 1), h.b = this.toColor(i, 2), h.a = this.toColor(i, 3)), h.updateOffset(), h;
        }
        if (e == c.AttachmentType.mesh) {
            var j = this.attachmentLoader.newMeshAttachment(a5, b15, f);
            return j ? (j.path = f, j.vertices = this.getFloatArray(d, "vertices", g), j.triangles = this.getIntArray(d, "triangles"), j.regionUVs = this.getFloatArray(d, "uvs", 1), j.updateUVs(), i = d.color, i && (j.r = this.toColor(i, 0), j.g = this.toColor(i, 1), j.b = this.toColor(i, 2), j.a = this.toColor(i, 3)), j.hullLength = 2 * (d.hull || 0), d.edges && (j.edges = this.getIntArray(d, "edges")), j.width = (d.width || 0) * g, j.height = (d.height || 0) * g, j) : null;
        }
        if (e == c.AttachmentType.skinnedmesh) {
            var j = this.attachmentLoader.newSkinnedMeshAttachment(a5, b15, f);
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
            for(var s = this.attachmentLoader.newBoundingBoxAttachment(a5, b15), l = d.vertices, o = 0, p = l.length; p > o; o++)s.vertices.push(l[o] * g);
            return s;
        }
        throw "Unknown attachment type: " + e;
    },
    readAnimation: function(a5, b15, d) {
        var e = [], f = 0, g = b15.slots;
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
        var w = b15.bones;
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
        var E = b15.ik;
        for(var F in E)if (E.hasOwnProperty(F)) {
            var G = d.findIkConstraint(F), l = E[F], m = new c.IkConstraintTimeline(l.length);
            m.ikConstraintIndex = d.ikConstraints.indexOf(G);
            for(var n = 0, o = 0, p = l.length; p > o; o++){
                var q = l[o], H = q.hasOwnProperty("mix") ? q.mix : 1, I = !q.hasOwnProperty("bendPositive") || q.bendPositive ? 1 : -1;
                m.setFrame(n, q.time, H, I), this.readCurve(m, n, q), n++;
            }
            e.push(m), f = Math.max(f, m.frames[3 * m.frameCount - 3]);
        }
        var J = b15.ffd;
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
        var X = b15.drawOrder;
        if (X || (X = b15.draworder), X) {
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
        var ea = b15.events;
        if (ea) {
            for(var m = new c.EventTimeline(ea.length), n = 0, o = 0, p = ea.length; p > o; o++){
                var fa = ea[o], ga = d.findEvent(fa.name);
                if (!ga) throw "Event not found: " + fa.name;
                var ha = new c.Event(ga);
                ha.intValue = fa.hasOwnProperty("int") ? fa["int"] : ga.intValue, ha.floatValue = fa.hasOwnProperty("float") ? fa["float"] : ga.floatValue, ha.stringValue = fa.hasOwnProperty("string") ? fa.string : ga.stringValue, m.setFrame(n++, fa.time, ha);
            }
            e.push(m), f = Math.max(f, m.frames[m.getFrameCount() - 1]);
        }
        d.animations.push(new c.Animation(a5, e, f));
    },
    readCurve: function(a5, b15, c5) {
        var d = c5.curve;
        d ? "stepped" == d ? a5.curves.setStepped(b15) : d instanceof Array && a5.curves.setCurve(b15, d[0], d[1], d[2], d[3]) : a5.curves.setLinear(b15);
    },
    toColor: function(a5, b15) {
        if (8 != a5.length) throw "Color hexidecimal length must be 8, recieved: " + a5;
        return parseInt(a5.substring(2 * b15, 2 * b15 + 2), 16) / 255;
    },
    getFloatArray: function(a5, b15, d) {
        var e = a5[b15], f = new c.Float32Array(e.length), g = 0, h = e.length;
        if (1 == d) for(; h > g; g++)f[g] = e[g];
        else for(; h > g; g++)f[g] = e[g] * d;
        return f;
    },
    getIntArray: function(a5, b15) {
        for(var d = a5[b15], e = new c.Uint16Array(d.length), f = 0, g = d.length; g > f; f++)e[f] = 0 | d[f];
        return e;
    }
}, c.Atlas = function(a5, b15) {
    this.textureLoader = b15, this.pages = [], this.regions = [];
    var d = new c.AtlasReader(a5), e = [];
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
                f.uWrap = c.Atlas.TextureWrap.clampToEdge, f.vWrap = c.Atlas.TextureWrap.clampToEdge, "x" == m ? f.uWrap = c.Atlas.TextureWrap.repeat : "y" == m ? f.vWrap = c.Atlas.TextureWrap.repeat : "xy" == m && (f.uWrap = f.vWrap = c.Atlas.TextureWrap.repeat), b15.load(f, g, this), this.pages.push(f);
            }
        } else f = null;
    }
}, c.Atlas.prototype = {
    findRegion: function(a5) {
        for(var b15 = this.regions, c5 = 0, d = b15.length; d > c5; c5++)if (b15[c5].name == a5) return b15[c5];
        return null;
    },
    dispose: function() {
        for(var a5 = this.pages, b15 = 0, c5 = a5.length; c5 > b15; b15++)this.textureLoader.unload(a5[b15].rendererObject);
    },
    updateUVs: function(a5) {
        for(var b15 = this.regions, c5 = 0, d = b15.length; d > c5; c5++){
            var e = b15[c5];
            e.page == a5 && (e.u = e.x / a5.width, e.v = e.y / a5.height, e.rotate ? (e.u2 = (e.x + e.height) / a5.width, e.v2 = (e.y + e.width) / a5.height) : (e.u2 = (e.x + e.width) / a5.width, e.v2 = (e.y + e.height) / a5.height));
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
}, c.AtlasReader = function(a5) {
    this.lines = a5.split(/\r\n|\r|\n/);
}, c.AtlasReader.prototype = {
    index: 0,
    trim: function(a5) {
        return a5.replace(/^\s+|\s+$/g, "");
    },
    readLine: function() {
        return this.index >= this.lines.length ? null : this.lines[this.index++];
    },
    readValue: function() {
        var a5 = this.readLine(), b15 = a5.indexOf(":");
        if (-1 == b15) throw "Invalid line: " + a5;
        return this.trim(a5.substring(b15 + 1));
    },
    readTuple: function(a5) {
        var b15 = this.readLine(), c5 = b15.indexOf(":");
        if (-1 == c5) throw "Invalid line: " + b15;
        for(var d = 0, e = c5 + 1; 3 > d; d++){
            var f = b15.indexOf(",", e);
            if (-1 == f) break;
            a5[d] = this.trim(b15.substr(e, f - e)), e = f + 1;
        }
        return a5[d] = this.trim(b15.substring(e)), d + 1;
    }
}, c.AtlasAttachmentLoader = function(a5) {
    this.atlas = a5;
}, c.AtlasAttachmentLoader.prototype = {
    newRegionAttachment: function(a5, b15, d) {
        var e = this.atlas.findRegion(d);
        if (!e) throw "Region not found in atlas: " + d + " (region attachment: " + b15 + ")";
        var f = new c.RegionAttachment(b15);
        return f.rendererObject = e, f.setUVs(e.u, e.v, e.u2, e.v2, e.rotate), f.regionOffsetX = e.offsetX, f.regionOffsetY = e.offsetY, f.regionWidth = e.width, f.regionHeight = e.height, f.regionOriginalWidth = e.originalWidth, f.regionOriginalHeight = e.originalHeight, f;
    },
    newMeshAttachment: function(a5, b15, d) {
        var e = this.atlas.findRegion(d);
        if (!e) throw "Region not found in atlas: " + d + " (mesh attachment: " + b15 + ")";
        var f = new c.MeshAttachment(b15);
        return f.rendererObject = e, f.regionU = e.u, f.regionV = e.v, f.regionU2 = e.u2, f.regionV2 = e.v2, f.regionRotate = e.rotate, f.regionOffsetX = e.offsetX, f.regionOffsetY = e.offsetY, f.regionWidth = e.width, f.regionHeight = e.height, f.regionOriginalWidth = e.originalWidth, f.regionOriginalHeight = e.originalHeight, f;
    },
    newSkinnedMeshAttachment: function(a5, b15, d) {
        var e = this.atlas.findRegion(d);
        if (!e) throw "Region not found in atlas: " + d + " (skinned mesh attachment: " + b15 + ")";
        var f = new c.SkinnedMeshAttachment(b15);
        return f.rendererObject = e, f.regionU = e.u, f.regionV = e.v, f.regionU2 = e.u2, f.regionV2 = e.v2, f.regionRotate = e.rotate, f.regionOffsetX = e.offsetX, f.regionOffsetY = e.offsetY, f.regionWidth = e.width, f.regionHeight = e.height, f.regionOriginalWidth = e.originalWidth, f.regionOriginalHeight = e.originalHeight, f;
    },
    newBoundingBoxAttachment: function(a5, b15) {
        return new c.BoundingBoxAttachment(b15);
    }
}, c.SkeletonBounds = function() {
    this.polygonPool = [], this.polygons = [], this.boundingBoxes = [];
}, c.SkeletonBounds.prototype = {
    minX: 0,
    minY: 0,
    maxX: 0,
    maxY: 0,
    update: function(a5, b15) {
        var d = a5.slots, e = d.length, f = a5.x, g = a5.y, h = this.boundingBoxes, i = this.polygonPool, j = this.polygons;
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
        b15 && this.aabbCompute();
    },
    aabbCompute: function() {
        for(var a5 = this.polygons, b15 = Number.MAX_VALUE, c5 = Number.MAX_VALUE, d = Number.MIN_VALUE, e = Number.MIN_VALUE, f = 0, g = a5.length; g > f; f++)for(var h = a5[f], i = 0, j = h.length; j > i; i += 2){
            var k = h[i], l = h[i + 1];
            b15 = Math.min(b15, k), c5 = Math.min(c5, l), d = Math.max(d, k), e = Math.max(e, l);
        }
        this.minX = b15, this.minY = c5, this.maxX = d, this.maxY = e;
    },
    aabbContainsPoint: function(a5, b15) {
        return a5 >= this.minX && a5 <= this.maxX && b15 >= this.minY && b15 <= this.maxY;
    },
    aabbIntersectsSegment: function(a5, b15, c5, d) {
        var e = this.minX, f = this.minY, g = this.maxX, h = this.maxY;
        if (e >= a5 && e >= c5 || f >= b15 && f >= d || a5 >= g && c5 >= g || b15 >= h && d >= h) return !1;
        var i = (d - b15) / (c5 - a5), j = i * (e - a5) + b15;
        if (j > f && h > j) return !0;
        if (j = i * (g - a5) + b15, j > f && h > j) return !0;
        var k = (f - b15) / i + a5;
        return k > e && g > k ? !0 : (k = (h - b15) / i + a5, k > e && g > k ? !0 : !1);
    },
    aabbIntersectsSkeleton: function(a5) {
        return this.minX < a5.maxX && this.maxX > a5.minX && this.minY < a5.maxY && this.maxY > a5.minY;
    },
    containsPoint: function(a5, b15) {
        for(var c5 = this.polygons, d = 0, e = c5.length; e > d; d++)if (this.polygonContainsPoint(c5[d], a5, b15)) return this.boundingBoxes[d];
        return null;
    },
    intersectsSegment: function(a5, b15, c5, d) {
        for(var e = this.polygons, f = 0, g = e.length; g > f; f++)if (e[f].intersectsSegment(a5, b15, c5, d)) return this.boundingBoxes[f];
        return null;
    },
    polygonContainsPoint: function(a5, b15, c5) {
        for(var d = a5.length, e = d - 2, f = !1, g = 0; d > g; g += 2){
            var h = a5[g + 1], i = a5[e + 1];
            if (c5 > h && i >= c5 || c5 > i && h >= c5) {
                var j = a5[g];
                j + (c5 - h) / (i - h) * (a5[e] - j) < b15 && (f = !f);
            }
            e = g;
        }
        return f;
    },
    polygonIntersectsSegment: function(a5, b15, c5, d, e) {
        for(var f = a5.length, g = b15 - d, h = c5 - e, i = b15 * e - c5 * d, j = a5[f - 2], k = a5[f - 1], l = 0; f > l; l += 2){
            var m = a5[l], n = a5[l + 1], o = j * n - k * m, p = j - m, q = k - n, r = g * q - h * p, s = (i * p - g * o) / r;
            if ((s >= j && m >= s || s >= m && j >= s) && (s >= b15 && d >= s || s >= d && b15 >= s)) {
                var t = (i * q - h * o) / r;
                if ((t >= k && n >= t || t >= n && k >= t) && (t >= c5 && e >= t || t >= e && c5 >= t)) return !0;
            }
            j = m, k = n;
        }
        return !1;
    },
    getPolygon: function(a5) {
        var b15 = this.boundingBoxes.indexOf(a5);
        return -1 == b15 ? null : this.polygons[b15];
    },
    getWidth: function() {
        return this.maxX - this.minX;
    },
    getHeight: function() {
        return this.maxY - this.minY;
    }
}, c.Bone.yDown = !0, b15.AnimCache = {
}, b15.SpineTextureLoader = function(a5, c5) {
    b15.EventTarget.call(this), this.basePath = a5, this.crossorigin = c5, this.loadingCount = 0;
}, b15.SpineTextureLoader.prototype = b15.SpineTextureLoader, b15.SpineTextureLoader.prototype.load = function(a5, c5) {
    if (a5.rendererObject = b15.BaseTexture.fromImage(this.basePath + "/" + c5, this.crossorigin), !a5.rendererObject.hasLoaded) {
        var d = this;
        ++d.loadingCount, a5.rendererObject.addEventListener("loaded", function() {
            --d.loadingCount, d.dispatchEvent({
                type: "loadedBaseTexture",
                content: d
            });
        });
    }
}, b15.SpineTextureLoader.prototype.unload = function(a5) {
    a5.destroy(!0);
}, b15.Spine = function(a5) {
    if (b15.DisplayObjectContainer.call(this), this.spineData = b15.AnimCache[a5], !this.spineData) throw new Error("Spine data must be preloaded using PIXI.SpineLoader or PIXI.AssetLoader: " + a5);
    this.skeleton = new c.Skeleton(this.spineData), this.skeleton.updateWorldTransform(), this.stateData = new c.AnimationStateData(this.spineData), this.state = new c.AnimationState(this.stateData), this.slotContainers = [];
    for(var d = 0, e = this.skeleton.slots.length; e > d; d++){
        var f = this.skeleton.slots[d], g = f.attachment, h = new b15.DisplayObjectContainer;
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
}, b15.Spine.prototype = Object.create(b15.DisplayObjectContainer.prototype), b15.Spine.prototype.constructor = b15.Spine, Object.defineProperty(b15.Spine.prototype, "autoUpdate", {
    get: function() {
        return this.updateTransform === b15.Spine.prototype.autoUpdateTransform;
    },
    set: function(a5) {
        this.updateTransform = a5 ? b15.Spine.prototype.autoUpdateTransform : b15.DisplayObjectContainer.prototype.updateTransform;
    }
}), b15.Spine.prototype.update = function(a5) {
    this.state.update(a5), this.state.apply(this.skeleton), this.skeleton.updateWorldTransform();
    for(var d = this.skeleton.drawOrder, e = this.skeleton.slots, f = 0, g = d.length; g > f; f++)this.children[f] = this.slotContainers[d[f]];
    for(f = 0, g = e.length; g > f; f++){
        var h = e[f], i = h.attachment, j = this.slotContainers[f];
        if (i) {
            var k = i.type;
            if (k === c.AttachmentType.region) {
                if (i.rendererObject && (!h.currentSpriteName || h.currentSpriteName !== i.name)) {
                    var l = i.rendererObject.name;
                    if ((void 0) !== h.currentSprite && (h.currentSprite.visible = !1), h.sprites = h.sprites || {
                    }, (void 0) !== h.sprites[l]) h.sprites[l].visible = !0;
                    else {
                        var m = this.createSprite(h, i);
                        j.addChild(m);
                    }
                    h.currentSprite = h.sprites[l], h.currentSpriteName = l;
                }
                var n = h.bone;
                j.position.x = n.worldX + i.x * n.m00 + i.y * n.m01, j.position.y = n.worldY + i.x * n.m10 + i.y * n.m11, j.scale.x = n.worldScaleX, j.scale.y = n.worldScaleY, j.rotation = -(h.bone.worldRotation * c.degRad), h.currentSprite.tint = b15.rgb2hex([
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
                    if ((void 0) !== h.currentMesh && (h.currentMesh.visible = !1), h.meshes = h.meshes || {
                    }, (void 0) !== h.meshes[o]) h.meshes[o].visible = !0;
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
}, b15.Spine.prototype.autoUpdateTransform = function() {
    this.lastTime = this.lastTime || Date.now();
    var a5 = 0.001 * (Date.now() - this.lastTime);
    this.lastTime = Date.now(), this.update(a5), b15.DisplayObjectContainer.prototype.updateTransform.call(this);
}, b15.Spine.prototype.createSprite = function(a5, d) {
    var e = d.rendererObject, f = e.page.rendererObject, g = new b15.Rectangle(e.x, e.y, e.rotate ? e.height : e.width, e.rotate ? e.width : e.height), h = new b15.Texture(f, g), i = new b15.Sprite(h), j = e.rotate ? 0.5 * Math.PI : 0;
    return i.scale.set(e.width / e.originalWidth, e.height / e.originalHeight), i.rotation = j - d.rotation * c.degRad, i.anchor.x = i.anchor.y = 0.5, a5.sprites = a5.sprites || {
    }, a5.sprites[e.name] = i, i;
}, b15.Spine.prototype.createMesh = function(a5, c5) {
    var d = c5.rendererObject, e = d.page.rendererObject, f = new b15.Texture(e), g = new b15.Strip(f);
    return g.drawMode = b15.Strip.DrawModes.TRIANGLES, g.canvasPadding = 1.5, g.vertices = new b15.Float32Array(c5.uvs.length), g.uvs = c5.uvs, g.indices = c5.triangles, a5.meshes = a5.meshes || {
    }, a5.meshes[c5.name] = g, g;
}, b15.BaseTextureCache = {
}, b15.BaseTextureCacheIdGenerator = 0, b15.BaseTexture = function(a5, c5) {
    if (this.resolution = 1, this.width = 100, this.height = 100, this.scaleMode = c5 || b15.scaleModes.DEFAULT, this.hasLoaded = !1, this.source = a5, this._UID = b15._UID++, this.premultipliedAlpha = !0, this._glTextures = [], this.mipmap = !1, this._dirty = [
        !0,
        !0,
        !0,
        !0
    ], a5) {
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
}, b15.BaseTexture.prototype.constructor = b15.BaseTexture, b15.EventTarget.mixin(b15.BaseTexture.prototype), b15.BaseTexture.prototype.destroy = function() {
    this.imageUrl ? (delete b15.BaseTextureCache[this.imageUrl], delete b15.TextureCache[this.imageUrl], this.imageUrl = null, navigator.isCocoonJS || (this.source.src = "")) : this.source && this.source._pixiId && delete b15.BaseTextureCache[this.source._pixiId], this.source = null, this.unloadFromGPU();
}, b15.BaseTexture.prototype.updateSourceImage = function(a5) {
    this.hasLoaded = !1, this.source.src = null, this.source.src = a5;
}, b15.BaseTexture.prototype.dirty = function() {
    for(var a5 = 0; a5 < this._glTextures.length; a5++)this._dirty[a5] = !0;
}, b15.BaseTexture.prototype.unloadFromGPU = function() {
    this.dirty();
    for(var a5 = this._glTextures.length - 1; a5 >= 0; a5--){
        var c5 = this._glTextures[a5], d = b15.glContexts[a5];
        d && c5 && d.deleteTexture(c5);
    }
    this._glTextures.length = 0, this.dirty();
}, b15.BaseTexture.fromImage = function(a5, c6, d) {
    var e = b15.BaseTextureCache[a5];
    if ((void 0) === c6 && -1 === a5.indexOf("data:") && (c6 = !0), !e) {
        var f = new Image;
        c6 && (f.crossOrigin = ""), f.src = a5, e = new b15.BaseTexture(f, d), e.imageUrl = a5, b15.BaseTextureCache[a5] = e, -1 !== a5.indexOf(b15.RETINA_PREFIX + ".") && (e.resolution = 2);
    }
    return e;
}, b15.BaseTexture.fromCanvas = function(a5, c6) {
    a5._pixiId || (a5._pixiId = "canvas_" + b15.TextureCacheIdGenerator++);
    var d = b15.BaseTextureCache[a5._pixiId];
    return d || (d = new b15.BaseTexture(a5, c6), b15.BaseTextureCache[a5._pixiId] = d), d;
}, b15.TextureCache = {
}, b15.FrameCache = {
}, b15.TextureCacheIdGenerator = 0, b15.Texture = function(a5, c6, d, e) {
    this.noFrame = !1, c6 || (this.noFrame = !0, c6 = new b15.Rectangle(0, 0, 1, 1)), a5 instanceof b15.Texture && (a5 = a5.baseTexture), this.baseTexture = a5, this.frame = c6, this.trim = e, this.valid = !1, this.requiresUpdate = !1, this._uvs = null, this.width = 0, this.height = 0, this.crop = d || new b15.Rectangle(0, 0, 1, 1), a5.hasLoaded ? (this.noFrame && (c6 = new b15.Rectangle(0, 0, a5.width, a5.height)), this.setFrame(c6)) : a5.addEventListener("loaded", this.onBaseTextureLoaded.bind(this));
}, b15.Texture.prototype.constructor = b15.Texture, b15.EventTarget.mixin(b15.Texture.prototype), b15.Texture.prototype.onBaseTextureLoaded = function() {
    var a5 = this.baseTexture;
    a5.removeEventListener("loaded", this.onLoaded), this.noFrame && (this.frame = new b15.Rectangle(0, 0, a5.width, a5.height)), this.setFrame(this.frame), this.dispatchEvent({
        type: "update",
        content: this
    });
}, b15.Texture.prototype.destroy = function(a5) {
    a5 && this.baseTexture.destroy(), this.valid = !1;
}, b15.Texture.prototype.setFrame = function(a5) {
    if (this.noFrame = !1, this.frame = a5, this.width = a5.width, this.height = a5.height, this.crop.x = a5.x, this.crop.y = a5.y, this.crop.width = a5.width, this.crop.height = a5.height, !this.trim && (a5.x + a5.width > this.baseTexture.width || a5.y + a5.height > this.baseTexture.height)) throw new Error("Texture Error: frame does not fit inside the base Texture dimensions " + this);
    this.valid = a5 && a5.width && a5.height && this.baseTexture.source && this.baseTexture.hasLoaded, this.trim && (this.width = this.trim.width, this.height = this.trim.height, this.frame.width = this.trim.width, this.frame.height = this.trim.height), this.valid && this._updateUvs();
}, b15.Texture.prototype._updateUvs = function() {
    this._uvs || (this._uvs = new b15.TextureUvs);
    var a5 = this.crop, c6 = this.baseTexture.width, d = this.baseTexture.height;
    this._uvs.x0 = a5.x / c6, this._uvs.y0 = a5.y / d, this._uvs.x1 = (a5.x + a5.width) / c6, this._uvs.y1 = a5.y / d, this._uvs.x2 = (a5.x + a5.width) / c6, this._uvs.y2 = (a5.y + a5.height) / d, this._uvs.x3 = a5.x / c6, this._uvs.y3 = (a5.y + a5.height) / d;
}, b15.Texture.fromImage = function(a5, c6, d) {
    var e = b15.TextureCache[a5];
    return e || (e = new b15.Texture(b15.BaseTexture.fromImage(a5, c6, d)), b15.TextureCache[a5] = e), e;
}, b15.Texture.fromFrame = function(a5) {
    var c6 = b15.TextureCache[a5];
    if (!c6) throw new Error('The frameId "' + a5 + '" does not exist in the texture cache ');
    return c6;
}, b15.Texture.fromCanvas = function(a5, c6) {
    var d = b15.BaseTexture.fromCanvas(a5, c6);
    return new b15.Texture(d);
}, b15.Texture.addTextureToCache = function(a5, c6) {
    b15.TextureCache[c6] = a5;
}, b15.Texture.removeTextureFromCache = function(a5) {
    var c6 = b15.TextureCache[a5];
    return delete b15.TextureCache[a5], delete b15.BaseTextureCache[a5], c6;
}, b15.TextureUvs = function() {
    this.x0 = 0, this.y0 = 0, this.x1 = 0, this.y1 = 0, this.x2 = 0, this.y2 = 0, this.x3 = 0, this.y3 = 0;
}, b15.Texture.emptyTexture = new b15.Texture(new b15.BaseTexture), b15.RenderTexture = function(a5, c6, d, e, f) {
    if (this.width = a5 || 100, this.height = c6 || 100, this.resolution = f || 1, this.frame = new b15.Rectangle(0, 0, this.width * this.resolution, this.height * this.resolution), this.crop = new b15.Rectangle(0, 0, this.width * this.resolution, this.height * this.resolution), this.baseTexture = new b15.BaseTexture, this.baseTexture.width = this.width * this.resolution, this.baseTexture.height = this.height * this.resolution, this.baseTexture._glTextures = [], this.baseTexture.resolution = this.resolution, this.baseTexture.scaleMode = e || b15.scaleModes.DEFAULT, this.baseTexture.hasLoaded = !0, b15.Texture.call(this, this.baseTexture, new b15.Rectangle(0, 0, this.width * this.resolution, this.height * this.resolution)), this.renderer = d || b15.defaultRenderer, this.renderer.type === b15.WEBGL_RENDERER) {
        var g = this.renderer.gl;
        this.baseTexture._dirty[g.id] = !1, this.textureBuffer = new b15.FilterTexture(g, this.width, this.height, this.baseTexture.scaleMode), this.baseTexture._glTextures[g.id] = this.textureBuffer.texture, this.render = this.renderWebGL, this.projection = new b15.Point(0.5 * this.width, 0.5 * -this.height);
    } else this.render = this.renderCanvas, this.textureBuffer = new b15.CanvasBuffer(this.width * this.resolution, this.height * this.resolution), this.baseTexture.source = this.textureBuffer.canvas;
    this.valid = !0, this._updateUvs();
}, b15.RenderTexture.prototype = Object.create(b15.Texture.prototype), b15.RenderTexture.prototype.constructor = b15.RenderTexture, b15.RenderTexture.prototype.resize = function(a5, c6, d) {
    (a5 !== this.width || c6 !== this.height) && (this.valid = a5 > 0 && c6 > 0, this.width = a5, this.height = c6, this.frame.width = this.crop.width = a5 * this.resolution, this.frame.height = this.crop.height = c6 * this.resolution, d && (this.baseTexture.width = this.width * this.resolution, this.baseTexture.height = this.height * this.resolution), this.renderer.type === b15.WEBGL_RENDERER && (this.projection.x = this.width / 2, this.projection.y = -this.height / 2), this.valid && this.textureBuffer.resize(this.width, this.height));
}, b15.RenderTexture.prototype.clear = function() {
    this.valid && (this.renderer.type === b15.WEBGL_RENDERER && this.renderer.gl.bindFramebuffer(this.renderer.gl.FRAMEBUFFER, this.textureBuffer.frameBuffer), this.textureBuffer.clear());
}, b15.RenderTexture.prototype.renderWebGL = function(a5, b15, c6) {
    if (this.valid) {
        var d = a5.worldTransform;
        d.identity(), d.translate(0, 2 * this.projection.y), b15 && d.append(b15), d.scale(1, -1), a5.worldAlpha = 1;
        for(var e = a5.children, f = 0, g = e.length; g > f; f++)e[f].updateTransform();
        var h = this.renderer.gl;
        h.viewport(0, 0, this.width * this.resolution, this.height * this.resolution), h.bindFramebuffer(h.FRAMEBUFFER, this.textureBuffer.frameBuffer), c6 && this.textureBuffer.clear(), this.renderer.spriteBatch.dirty = !0, this.renderer.renderDisplayObject(a5, this.projection, this.textureBuffer.frameBuffer), this.renderer.spriteBatch.dirty = !0;
    }
}, b15.RenderTexture.prototype.renderCanvas = function(a5, b15, c6) {
    if (this.valid) {
        var d = a5.worldTransform;
        d.identity(), b15 && d.append(b15), a5.worldAlpha = 1;
        for(var e = a5.children, f = 0, g = e.length; g > f; f++)e[f].updateTransform();
        c6 && this.textureBuffer.clear();
        var h = this.textureBuffer.context, i = this.renderer.resolution;
        this.renderer.resolution = this.resolution, this.renderer.renderDisplayObject(a5, h), this.renderer.resolution = i;
    }
}, b15.RenderTexture.prototype.getImage = function() {
    var a5 = new Image;
    return a5.src = this.getBase64(), a5;
}, b15.RenderTexture.prototype.getBase64 = function() {
    return this.getCanvas().toDataURL();
}, b15.RenderTexture.prototype.getCanvas = function() {
    if (this.renderer.type === b15.WEBGL_RENDERER) {
        var a5 = this.renderer.gl, c6 = this.textureBuffer.width, d = this.textureBuffer.height, e = new Uint8Array(4 * c6 * d);
        a5.bindFramebuffer(a5.FRAMEBUFFER, this.textureBuffer.frameBuffer), a5.readPixels(0, 0, c6, d, a5.RGBA, a5.UNSIGNED_BYTE, e), a5.bindFramebuffer(a5.FRAMEBUFFER, null);
        var f = new b15.CanvasBuffer(c6, d), g = f.context.getImageData(0, 0, c6, d);
        return g.data.set(e), f.context.putImageData(g, 0, 0), f.canvas;
    }
    return this.textureBuffer.canvas;
}, b15.RenderTexture.tempMatrix = new b15.Matrix, b15.VideoTexture = function(a6, c7) {
    if (!a6) throw new Error("No video source element specified.");
    (a6.readyState === a6.HAVE_ENOUGH_DATA || a6.readyState === a6.HAVE_FUTURE_DATA) && a6.width && a6.height && (a6.complete = !0), b15.BaseTexture.call(this, a6, c7), this.autoUpdate = !1, this.updateBound = this._onUpdate.bind(this), a6.complete || (this._onCanPlay = this.onCanPlay.bind(this), a6.addEventListener("canplay", this._onCanPlay), a6.addEventListener("canplaythrough", this._onCanPlay), a6.addEventListener("play", this.onPlayStart.bind(this)), a6.addEventListener("pause", this.onPlayStop.bind(this)));
}, b15.VideoTexture.prototype = Object.create(b15.BaseTexture.prototype), b15.VideoTexture.constructor = b15.VideoTexture, b15.VideoTexture.prototype._onUpdate = function() {
    this.autoUpdate && (window.requestAnimationFrame(this.updateBound), this.dirty());
}, b15.VideoTexture.prototype.onPlayStart = function() {
    this.autoUpdate || (window.requestAnimationFrame(this.updateBound), this.autoUpdate = !0);
}, b15.VideoTexture.prototype.onPlayStop = function() {
    this.autoUpdate = !1;
}, b15.VideoTexture.prototype.onCanPlay = function() {
    "canplaythrough" === event.type && (this.hasLoaded = !0, this.source && (this.source.removeEventListener("canplay", this._onCanPlay), this.source.removeEventListener("canplaythrough", this._onCanPlay), this.width = this.source.videoWidth, this.height = this.source.videoHeight, this.__loaded || (this.__loaded = !0, this.dispatchEvent({
        type: "loaded",
        content: this
    }))));
}, b15.VideoTexture.prototype.destroy = function() {
    this.source && this.source._pixiId && (b15.BaseTextureCache[this.source._pixiId] = null, delete b15.BaseTextureCache[this.source._pixiId], this.source._pixiId = null, delete this.source._pixiId), b15.BaseTexture.prototype.destroy.call(this);
}, b15.VideoTexture.baseTextureFromVideo = function(a6, c7) {
    a6._pixiId || (a6._pixiId = "video_" + b15.TextureCacheIdGenerator++);
    var d = b15.BaseTextureCache[a6._pixiId];
    return d || (d = new b15.VideoTexture(a6, c7), b15.BaseTextureCache[a6._pixiId] = d), d;
}, b15.VideoTexture.textureFromVideo = function(a6, c7) {
    var d = b15.VideoTexture.baseTextureFromVideo(a6, c7);
    return new b15.Texture(d);
}, b15.VideoTexture.fromUrl = function(a6, c7) {
    var d = document.createElement("video");
    return d.src = a6, d.autoPlay = !0, d.play(), b15.VideoTexture.textureFromVideo(d, c7);
}, b15.AssetLoader = function(a6, c7) {
    this.assetURLs = a6, this.crossorigin = c7, this.loadersByType = {
        jpg: b15.ImageLoader,
        jpeg: b15.ImageLoader,
        png: b15.ImageLoader,
        gif: b15.ImageLoader,
        webp: b15.ImageLoader,
        json: b15.JsonLoader,
        atlas: b15.AtlasLoader,
        anim: b15.SpineLoader,
        xml: b15.BitmapFontLoader,
        fnt: b15.BitmapFontLoader
    };
}, b15.EventTarget.mixin(b15.AssetLoader.prototype), b15.AssetLoader.prototype.constructor = b15.AssetLoader, b15.AssetLoader.prototype._getDataType = function(a6) {
    var b15 = "data:", c7 = a6.slice(0, b15.length).toLowerCase();
    if (c7 === b15) {
        var d = a6.slice(b15.length), e = d.indexOf(",");
        if (-1 === e) return null;
        var f = d.slice(0, e).split(";")[0];
        return f && "text/plain" !== f.toLowerCase() ? f.split("/").pop().toLowerCase() : "txt";
    }
    return null;
}, b15.AssetLoader.prototype.load = function() {
    function a6(a7) {
        b16.onAssetLoaded(a7.data.content);
    }
    var b16 = this;
    this.loadCount = this.assetURLs.length;
    for(var c7 = 0; c7 < this.assetURLs.length; c7++){
        var d = this.assetURLs[c7], e = this._getDataType(d);
        e || (e = d.split("?").shift().split(".").pop().toLowerCase());
        var f = this.loadersByType[e];
        if (!f) throw new Error(e + " is an unsupported file type");
        var g = new f(d, this.crossorigin);
        g.on("loaded", a6), g.load();
    }
}, b15.AssetLoader.prototype.onAssetLoaded = function(a6) {
    this.loadCount--, this.emit("onProgress", {
        content: this,
        loader: a6,
        loaded: this.assetURLs.length - this.loadCount,
        total: this.assetURLs.length
    }), this.onProgress && this.onProgress(a6), this.loadCount || (this.emit("onComplete", {
        content: this
    }), this.onComplete && this.onComplete());
}, b15.JsonLoader = function(a6, b16) {
    this.url = a6, this.crossorigin = b16, this.baseUrl = a6.replace(/[^\/]*$/, ""), this.loaded = !1;
}, b15.JsonLoader.prototype.constructor = b15.JsonLoader, b15.EventTarget.mixin(b15.JsonLoader.prototype), b15.JsonLoader.prototype.load = function() {
    window.XDomainRequest && this.crossorigin ? (this.ajaxRequest = new window.XDomainRequest, this.ajaxRequest.timeout = 3000, this.ajaxRequest.onerror = this.onError.bind(this), this.ajaxRequest.ontimeout = this.onError.bind(this), this.ajaxRequest.onprogress = function() {
    }, this.ajaxRequest.onload = this.onJSONLoaded.bind(this)) : (this.ajaxRequest = window.XMLHttpRequest ? new window.XMLHttpRequest : new window.ActiveXObject("Microsoft.XMLHTTP"), this.ajaxRequest.onreadystatechange = this.onReadyStateChanged.bind(this)), this.ajaxRequest.open("GET", this.url, !0), this.ajaxRequest.send();
}, b15.JsonLoader.prototype.onReadyStateChanged = function() {
    4 !== this.ajaxRequest.readyState || 200 !== this.ajaxRequest.status && -1 !== window.location.href.indexOf("http") || this.onJSONLoaded();
}, b15.JsonLoader.prototype.onJSONLoaded = function() {
    if (!this.ajaxRequest.responseText) return void this.onError();
    if (this.json = JSON.parse(this.ajaxRequest.responseText), this.json.frames && this.json.meta && this.json.meta.image) {
        var a6 = this.json.meta.image;
        -1 === a6.indexOf("data:") && (a6 = this.baseUrl + a6);
        var d = new b15.ImageLoader(a6, this.crossorigin), e = this.json.frames;
        this.texture = d.texture.baseTexture, d.addEventListener("loaded", this.onLoaded.bind(this));
        for(var f in e){
            var g = e[f].frame;
            if (g) {
                var h = new b15.Rectangle(g.x, g.y, g.w, g.h), i = h.clone(), j = null;
                if (e[f].trimmed) {
                    var k = e[f].sourceSize, l = e[f].spriteSourceSize;
                    j = new b15.Rectangle(l.x, l.y, k.w, k.h);
                }
                b15.TextureCache[f] = new b15.Texture(this.texture, h, i, j);
            }
        }
        d.load();
    } else if (this.json.bones) {
        if (b15.AnimCache[this.url]) this.onLoaded();
        else {
            var m = this.url.substr(0, this.url.lastIndexOf(".")) + ".atlas", n = new b15.JsonLoader(m, this.crossorigin), o = this;
            n.onJSONLoaded = function() {
                if (!this.ajaxRequest.responseText) return void this.onError();
                var a7 = new b15.SpineTextureLoader(this.url.substring(0, this.url.lastIndexOf("/"))), d = new c.Atlas(this.ajaxRequest.responseText, a7), e = new c.AtlasAttachmentLoader(d), f = new c.SkeletonJson(e), g = f.readSkeletonData(o.json);
                b15.AnimCache[o.url] = g, o.spine = g, o.spineAtlas = d, o.spineAtlasLoader = n, a7.loadingCount > 0 ? a7.addEventListener("loadedBaseTexture", function(a8) {
                    a8.content.content.loadingCount <= 0 && o.onLoaded();
                }) : o.onLoaded();
            }, n.load();
        }
    } else this.onLoaded();
}, b15.JsonLoader.prototype.onLoaded = function() {
    this.loaded = !0, this.dispatchEvent({
        type: "loaded",
        content: this
    });
}, b15.JsonLoader.prototype.onError = function() {
    this.dispatchEvent({
        type: "error",
        content: this
    });
}, b15.AtlasLoader = function(a7, b16) {
    this.url = a7, this.baseUrl = a7.replace(/[^\/]*$/, ""), this.crossorigin = b16, this.loaded = !1;
}, b15.AtlasLoader.constructor = b15.AtlasLoader, b15.EventTarget.mixin(b15.AtlasLoader.prototype), b15.AtlasLoader.prototype.load = function() {
    this.ajaxRequest = new b15.AjaxRequest, this.ajaxRequest.onreadystatechange = this.onAtlasLoaded.bind(this), this.ajaxRequest.open("GET", this.url, !0), this.ajaxRequest.overrideMimeType && this.ajaxRequest.overrideMimeType("application/json"), this.ajaxRequest.send(null);
}, b15.AtlasLoader.prototype.onAtlasLoaded = function() {
    if (4 === this.ajaxRequest.readyState) {
        if (200 === this.ajaxRequest.status || -1 === window.location.href.indexOf("http")) {
            this.atlas = {
                meta: {
                    image: []
                },
                frames: []
            };
            var a7 = this.ajaxRequest.responseText.split(/\r?\n/), c7 = -3, d = 0, e = null, f = !1, g = 0, h = 0, i = this.onLoaded.bind(this);
            for(g = 0; g < a7.length; g++)if (a7[g] = a7[g].replace(/^\s+|\s+$/g, ""), "" === a7[g] && (f = g + 1), a7[g].length > 0) {
                if (f === g) this.atlas.meta.image.push(a7[g]), d = this.atlas.meta.image.length - 1, this.atlas.frames.push({
                }), c7 = -3;
                else if (c7 > 0) {
                    if (c7 % 7 === 1) null != e && (this.atlas.frames[d][e.name] = e), e = {
                        name: a7[g],
                        frame: {
                        }
                    };
                    else {
                        var j = a7[g].split(" ");
                        if (c7 % 7 === 3) e.frame.x = Number(j[1].replace(",", "")), e.frame.y = Number(j[2]);
                        else if (c7 % 7 === 4) e.frame.w = Number(j[1].replace(",", "")), e.frame.h = Number(j[2]);
                        else if (c7 % 7 === 5) {
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
                c7++;
            }
            if (null != e && (this.atlas.frames[d][e.name] = e), this.atlas.meta.image.length > 0) {
                for(this.images = [], h = 0; h < this.atlas.meta.image.length; h++){
                    var l = this.baseUrl + this.atlas.meta.image[h], m = this.atlas.frames[h];
                    this.images.push(new b15.ImageLoader(l, this.crossorigin));
                    for(g in m){
                        var n = m[g].frame;
                        n && (b15.TextureCache[g] = new b15.Texture(this.images[h].texture.baseTexture, {
                            x: n.x,
                            y: n.y,
                            width: n.w,
                            height: n.h
                        }), m[g].trimmed && (b15.TextureCache[g].realSize = m[g].realSize, b15.TextureCache[g].trim.x = 0, b15.TextureCache[g].trim.y = 0));
                    }
                }
                for(this.currentImageId = 0, h = 0; h < this.images.length; h++)this.images[h].on("loaded", i);
                this.images[this.currentImageId].load();
            } else this.onLoaded();
        } else this.onError();
    }
}, b15.AtlasLoader.prototype.onLoaded = function() {
    this.images.length - 1 > this.currentImageId ? (this.currentImageId++, this.images[this.currentImageId].load()) : (this.loaded = !0, this.emit("loaded", {
        content: this
    }));
}, b15.AtlasLoader.prototype.onError = function() {
    this.emit("error", {
        content: this
    });
}, b15.SpriteSheetLoader = function(a8, b16) {
    this.url = a8, this.crossorigin = b16, this.baseUrl = a8.replace(/[^\/]*$/, ""), this.texture = null, this.frames = {
    };
}, b15.SpriteSheetLoader.prototype.constructor = b15.SpriteSheetLoader, b15.EventTarget.mixin(b15.SpriteSheetLoader.prototype), b15.SpriteSheetLoader.prototype.load = function() {
    var a8 = this, c8 = new b15.JsonLoader(this.url, this.crossorigin);
    c8.on("loaded", function(b16) {
        a8.json = b16.data.content.json, a8.onLoaded();
    }), c8.load();
}, b15.SpriteSheetLoader.prototype.onLoaded = function() {
    this.emit("loaded", {
        content: this
    });
}, b15.ImageLoader = function(a8, c8) {
    this.texture = b15.Texture.fromImage(a8, c8), this.frames = [];
}, b15.ImageLoader.prototype.constructor = b15.ImageLoader, b15.EventTarget.mixin(b15.ImageLoader.prototype), b15.ImageLoader.prototype.load = function() {
    this.texture.baseTexture.hasLoaded ? this.onLoaded() : this.texture.baseTexture.on("loaded", this.onLoaded.bind(this));
}, b15.ImageLoader.prototype.onLoaded = function() {
    this.emit("loaded", {
        content: this
    });
}, b15.ImageLoader.prototype.loadFramedSpriteSheet = function(a8, c8, d) {
    this.frames = [];
    for(var e = Math.floor(this.texture.width / a8), f = Math.floor(this.texture.height / c8), g = 0, h = 0; f > h; h++)for(var i = 0; e > i; i++, g++){
        var j = new b15.Texture(this.texture.baseTexture, {
            x: i * a8,
            y: h * c8,
            width: a8,
            height: c8
        });
        this.frames.push(j), d && (b15.TextureCache[d + "-" + g] = j);
    }
    this.load();
}, b15.BitmapFontLoader = function(a8, b16) {
    this.url = a8, this.crossorigin = b16, this.baseUrl = a8.replace(/[^\/]*$/, ""), this.texture = null;
}, b15.BitmapFontLoader.prototype.constructor = b15.BitmapFontLoader, b15.EventTarget.mixin(b15.BitmapFontLoader.prototype), b15.BitmapFontLoader.prototype.load = function() {
    this.ajaxRequest = new b15.AjaxRequest, this.ajaxRequest.onreadystatechange = this.onXMLLoaded.bind(this), this.ajaxRequest.open("GET", this.url, !0), this.ajaxRequest.overrideMimeType && this.ajaxRequest.overrideMimeType("application/xml"), this.ajaxRequest.send(null);
}, b15.BitmapFontLoader.prototype.onXMLLoaded = function() {
    if (4 === this.ajaxRequest.readyState && (200 === this.ajaxRequest.status || -1 === window.location.protocol.indexOf("http"))) {
        var a8 = this.ajaxRequest.responseXML;
        if (!a8 || /MSIE 9/i.test(navigator.userAgent) || navigator.isCocoonJS) {
            if ("function" == typeof window.DOMParser) {
                var c8 = new DOMParser;
                a8 = c8.parseFromString(this.ajaxRequest.responseText, "text/xml");
            } else {
                var d = document.createElement("div");
                d.innerHTML = this.ajaxRequest.responseText, a8 = d;
            }
        }
        var e = this.baseUrl + a8.getElementsByTagName("page")[0].getAttribute("file"), f = new b15.ImageLoader(e, this.crossorigin);
        this.texture = f.texture.baseTexture;
        var g = {
        }, h = a8.getElementsByTagName("info")[0], i = a8.getElementsByTagName("common")[0];
        g.font = h.getAttribute("face"), g.size = parseInt(h.getAttribute("size"), 10), g.lineHeight = parseInt(i.getAttribute("lineHeight"), 10), g.chars = {
        };
        for(var j = a8.getElementsByTagName("char"), k = 0; k < j.length; k++){
            var l = parseInt(j[k].getAttribute("id"), 10), m = new b15.Rectangle(parseInt(j[k].getAttribute("x"), 10), parseInt(j[k].getAttribute("y"), 10), parseInt(j[k].getAttribute("width"), 10), parseInt(j[k].getAttribute("height"), 10));
            g.chars[l] = {
                xOffset: parseInt(j[k].getAttribute("xoffset"), 10),
                yOffset: parseInt(j[k].getAttribute("yoffset"), 10),
                xAdvance: parseInt(j[k].getAttribute("xadvance"), 10),
                kerning: {
                },
                texture: b15.TextureCache[l] = new b15.Texture(this.texture, m)
            };
        }
        var n = a8.getElementsByTagName("kerning");
        for(k = 0; k < n.length; k++){
            var o = parseInt(n[k].getAttribute("first"), 10), p = parseInt(n[k].getAttribute("second"), 10), q = parseInt(n[k].getAttribute("amount"), 10);
            g.chars[p].kerning[o] = q;
        }
        b15.BitmapText.fonts[g.font] = g, f.addEventListener("loaded", this.onLoaded.bind(this)), f.load();
    }
}, b15.BitmapFontLoader.prototype.onLoaded = function() {
    this.emit("loaded", {
        content: this
    });
}, b15.SpineLoader = function(a9, b16) {
    this.url = a9, this.crossorigin = b16, this.loaded = !1;
}, b15.SpineLoader.prototype.constructor = b15.SpineLoader, b15.EventTarget.mixin(b15.SpineLoader.prototype), b15.SpineLoader.prototype.load = function() {
    var a9 = this, c9 = new b15.JsonLoader(this.url, this.crossorigin);
    c9.on("loaded", function(b16) {
        a9.json = b16.data.content.json, a9.onLoaded();
    }), c9.load();
}, b15.SpineLoader.prototype.onLoaded = function() {
    this.loaded = !0, this.emit("loaded", {
        content: this
    });
}, b15.AbstractFilter = function(a9, b16) {
    this.passes = [
        this
    ], this.shaders = [], this.dirty = !0, this.padding = 0, this.uniforms = b16 || {
    }, this.fragmentSrc = a9 || [];
}, b15.AbstractFilter.prototype.constructor = b15.AbstractFilter, b15.AbstractFilter.prototype.syncUniforms = function() {
    for(var a9 = 0, b16 = this.shaders.length; b16 > a9; a9++)this.shaders[a9].dirty = !0;
}, b15.AlphaMaskFilter = function(a9) {
    b15.AbstractFilter.call(this), this.passes = [
        this
    ], a9.baseTexture._powerOf2 = !0, this.uniforms = {
        mask: {
            type: "sampler2D",
            value: a9
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
    }, a9.baseTexture.hasLoaded ? (this.uniforms.mask.value.x = a9.width, this.uniforms.mask.value.y = a9.height) : (this.boundLoadedFunction = this.onTextureLoaded.bind(this), a9.baseTexture.on("loaded", this.boundLoadedFunction)), this.fragmentSrc = [
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
}, b15.AlphaMaskFilter.prototype = Object.create(b15.AbstractFilter.prototype), b15.AlphaMaskFilter.prototype.constructor = b15.AlphaMaskFilter, b15.AlphaMaskFilter.prototype.onTextureLoaded = function() {
    this.uniforms.mapDimensions.value.x = this.uniforms.mask.value.width, this.uniforms.mapDimensions.value.y = this.uniforms.mask.value.height, this.uniforms.mask.value.baseTexture.off("loaded", this.boundLoadedFunction);
}, Object.defineProperty(b15.AlphaMaskFilter.prototype, "map", {
    get: function() {
        return this.uniforms.mask.value;
    },
    set: function(a9) {
        this.uniforms.mask.value = a9;
    }
}), b15.ColorMatrixFilter = function() {
    b15.AbstractFilter.call(this), this.passes = [
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
}, b15.ColorMatrixFilter.prototype = Object.create(b15.AbstractFilter.prototype), b15.ColorMatrixFilter.prototype.constructor = b15.ColorMatrixFilter, Object.defineProperty(b15.ColorMatrixFilter.prototype, "matrix", {
    get: function() {
        return this.uniforms.matrix.value;
    },
    set: function(a9) {
        this.uniforms.matrix.value = a9;
    }
}), b15.GrayFilter = function() {
    b15.AbstractFilter.call(this), this.passes = [
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
}, b15.GrayFilter.prototype = Object.create(b15.AbstractFilter.prototype), b15.GrayFilter.prototype.constructor = b15.GrayFilter, Object.defineProperty(b15.GrayFilter.prototype, "gray", {
    get: function() {
        return this.uniforms.gray.value;
    },
    set: function(a9) {
        this.uniforms.gray.value = a9;
    }
}), b15.DisplacementFilter = function(a9) {
    b15.AbstractFilter.call(this), this.passes = [
        this
    ], a9.baseTexture._powerOf2 = !0, this.uniforms = {
        displacementMap: {
            type: "sampler2D",
            value: a9
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
    }, a9.baseTexture.hasLoaded ? (this.uniforms.mapDimensions.value.x = a9.width, this.uniforms.mapDimensions.value.y = a9.height) : (this.boundLoadedFunction = this.onTextureLoaded.bind(this), a9.baseTexture.on("loaded", this.boundLoadedFunction)), this.fragmentSrc = [
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
}, b15.DisplacementFilter.prototype = Object.create(b15.AbstractFilter.prototype), b15.DisplacementFilter.prototype.constructor = b15.DisplacementFilter, b15.DisplacementFilter.prototype.onTextureLoaded = function() {
    this.uniforms.mapDimensions.value.x = this.uniforms.displacementMap.value.width, this.uniforms.mapDimensions.value.y = this.uniforms.displacementMap.value.height, this.uniforms.displacementMap.value.baseTexture.off("loaded", this.boundLoadedFunction);
}, Object.defineProperty(b15.DisplacementFilter.prototype, "map", {
    get: function() {
        return this.uniforms.displacementMap.value;
    },
    set: function(a9) {
        this.uniforms.displacementMap.value = a9;
    }
}), Object.defineProperty(b15.DisplacementFilter.prototype, "scale", {
    get: function() {
        return this.uniforms.scale.value;
    },
    set: function(a9) {
        this.uniforms.scale.value = a9;
    }
}), Object.defineProperty(b15.DisplacementFilter.prototype, "offset", {
    get: function() {
        return this.uniforms.offset.value;
    },
    set: function(a9) {
        this.uniforms.offset.value = a9;
    }
}), b15.PixelateFilter = function() {
    b15.AbstractFilter.call(this), this.passes = [
        this
    ], this.uniforms = {
        invert: {
            type: "1f",
            value: 0
        },
        dimensions: {
            type: "4fv",
            value: new b15.Float32Array([
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
}, b15.PixelateFilter.prototype = Object.create(b15.AbstractFilter.prototype), b15.PixelateFilter.prototype.constructor = b15.PixelateFilter, Object.defineProperty(b15.PixelateFilter.prototype, "size", {
    get: function() {
        return this.uniforms.pixelSize.value;
    },
    set: function(a9) {
        this.dirty = !0, this.uniforms.pixelSize.value = a9;
    }
}), b15.BlurXFilter = function() {
    b15.AbstractFilter.call(this), this.passes = [
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
}, b15.BlurXFilter.prototype = Object.create(b15.AbstractFilter.prototype), b15.BlurXFilter.prototype.constructor = b15.BlurXFilter, Object.defineProperty(b15.BlurXFilter.prototype, "blur", {
    get: function() {
        return this.uniforms.blur.value / (1 / 7000);
    },
    set: function(a9) {
        this.dirty = !0, this.uniforms.blur.value = 1 / 7000 * a9;
    }
}), b15.BlurYFilter = function() {
    b15.AbstractFilter.call(this), this.passes = [
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
}, b15.BlurYFilter.prototype = Object.create(b15.AbstractFilter.prototype), b15.BlurYFilter.prototype.constructor = b15.BlurYFilter, Object.defineProperty(b15.BlurYFilter.prototype, "blur", {
    get: function() {
        return this.uniforms.blur.value / (1 / 7000);
    },
    set: function(a9) {
        this.uniforms.blur.value = 1 / 7000 * a9;
    }
}), b15.BlurFilter = function() {
    this.blurXFilter = new b15.BlurXFilter, this.blurYFilter = new b15.BlurYFilter, this.passes = [
        this.blurXFilter,
        this.blurYFilter
    ];
}, b15.BlurFilter.prototype = Object.create(b15.AbstractFilter.prototype), b15.BlurFilter.prototype.constructor = b15.BlurFilter, Object.defineProperty(b15.BlurFilter.prototype, "blur", {
    get: function() {
        return this.blurXFilter.blur;
    },
    set: function(a9) {
        this.blurXFilter.blur = this.blurYFilter.blur = a9;
    }
}), Object.defineProperty(b15.BlurFilter.prototype, "blurX", {
    get: function() {
        return this.blurXFilter.blur;
    },
    set: function(a9) {
        this.blurXFilter.blur = a9;
    }
}), Object.defineProperty(b15.BlurFilter.prototype, "blurY", {
    get: function() {
        return this.blurYFilter.blur;
    },
    set: function(a9) {
        this.blurYFilter.blur = a9;
    }
}), b15.InvertFilter = function() {
    b15.AbstractFilter.call(this), this.passes = [
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
}, b15.InvertFilter.prototype = Object.create(b15.AbstractFilter.prototype), b15.InvertFilter.prototype.constructor = b15.InvertFilter, Object.defineProperty(b15.InvertFilter.prototype, "invert", {
    get: function() {
        return this.uniforms.invert.value;
    },
    set: function(a9) {
        this.uniforms.invert.value = a9;
    }
}), b15.SepiaFilter = function() {
    b15.AbstractFilter.call(this), this.passes = [
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
}, b15.SepiaFilter.prototype = Object.create(b15.AbstractFilter.prototype), b15.SepiaFilter.prototype.constructor = b15.SepiaFilter, Object.defineProperty(b15.SepiaFilter.prototype, "sepia", {
    get: function() {
        return this.uniforms.sepia.value;
    },
    set: function(a9) {
        this.uniforms.sepia.value = a9;
    }
}), b15.TwistFilter = function() {
    b15.AbstractFilter.call(this), this.passes = [
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
}, b15.TwistFilter.prototype = Object.create(b15.AbstractFilter.prototype), b15.TwistFilter.prototype.constructor = b15.TwistFilter, Object.defineProperty(b15.TwistFilter.prototype, "offset", {
    get: function() {
        return this.uniforms.offset.value;
    },
    set: function(a9) {
        this.dirty = !0, this.uniforms.offset.value = a9;
    }
}), Object.defineProperty(b15.TwistFilter.prototype, "radius", {
    get: function() {
        return this.uniforms.radius.value;
    },
    set: function(a9) {
        this.dirty = !0, this.uniforms.radius.value = a9;
    }
}), Object.defineProperty(b15.TwistFilter.prototype, "angle", {
    get: function() {
        return this.uniforms.angle.value;
    },
    set: function(a9) {
        this.dirty = !0, this.uniforms.angle.value = a9;
    }
}), b15.ColorStepFilter = function() {
    b15.AbstractFilter.call(this), this.passes = [
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
}, b15.ColorStepFilter.prototype = Object.create(b15.AbstractFilter.prototype), b15.ColorStepFilter.prototype.constructor = b15.ColorStepFilter, Object.defineProperty(b15.ColorStepFilter.prototype, "step", {
    get: function() {
        return this.uniforms.step.value;
    },
    set: function(a9) {
        this.uniforms.step.value = a9;
    }
}), b15.DotScreenFilter = function() {
    b15.AbstractFilter.call(this), this.passes = [
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
}, b15.DotScreenFilter.prototype = Object.create(b15.AbstractFilter.prototype), b15.DotScreenFilter.prototype.constructor = b15.DotScreenFilter, Object.defineProperty(b15.DotScreenFilter.prototype, "scale", {
    get: function() {
        return this.uniforms.scale.value;
    },
    set: function(a9) {
        this.dirty = !0, this.uniforms.scale.value = a9;
    }
}), Object.defineProperty(b15.DotScreenFilter.prototype, "angle", {
    get: function() {
        return this.uniforms.angle.value;
    },
    set: function(a9) {
        this.dirty = !0, this.uniforms.angle.value = a9;
    }
}), b15.CrossHatchFilter = function() {
    b15.AbstractFilter.call(this), this.passes = [
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
}, b15.CrossHatchFilter.prototype = Object.create(b15.AbstractFilter.prototype), b15.CrossHatchFilter.prototype.constructor = b15.CrossHatchFilter, Object.defineProperty(b15.CrossHatchFilter.prototype, "blur", {
    get: function() {
        return this.uniforms.blur.value / (1 / 7000);
    },
    set: function(a9) {
        this.uniforms.blur.value = 1 / 7000 * a9;
    }
}), b15.RGBSplitFilter = function() {
    b15.AbstractFilter.call(this), this.passes = [
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
}, b15.RGBSplitFilter.prototype = Object.create(b15.AbstractFilter.prototype), b15.RGBSplitFilter.prototype.constructor = b15.RGBSplitFilter, Object.defineProperty(b15.RGBSplitFilter.prototype, "red", {
    get: function() {
        return this.uniforms.red.value;
    },
    set: function(a9) {
        this.uniforms.red.value = a9;
    }
}), Object.defineProperty(b15.RGBSplitFilter.prototype, "green", {
    get: function() {
        return this.uniforms.green.value;
    },
    set: function(a9) {
        this.uniforms.green.value = a9;
    }
}), Object.defineProperty(b15.RGBSplitFilter.prototype, "blue", {
    get: function() {
        return this.uniforms.blue.value;
    },
    set: function(a9) {
        this.uniforms.blue.value = a9;
    }
}), "undefined" != typeof exports ? ("undefined" != typeof module && module.exports && (exports = module.exports = b15), exports.PIXI = b15) : "undefined" != typeof define && define.amd ? define(b15) : a.PIXI = b15;

//# sourceMappingURL=index.149a9abd.js.map
