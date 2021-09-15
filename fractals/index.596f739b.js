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
})({"lbdsS":[function(require,module,exports) {
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SECURE = false;
var HMR_ENV_HASH = "4e5dac8afe405db7";
module.bundle.HMR_BUNDLE_ID = "5fcd1b61596f739b";
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

},{}]},["lbdsS"], null, "parcelRequireae9f")
/*! jQuery v3.6.0 | (c) OpenJS Foundation and other contributors | jquery.org/license */ !function(e, t) {
    "object" == typeof module && "object" == typeof module.exports ? module.exports = e.document ? t(e, !0) : function(e1) {
        if (!e1.document) throw new Error("jQuery requires a window with a document");
        return t(e1);
    } : t(e);
}("undefined" != typeof window ? window : this, function(C, e) {
    "use strict";
    var t2 = [], r1 = Object.getPrototypeOf, s1 = t2.slice, g = t2.flat ? function(e1) {
        return t2.flat.call(e1);
    } : function(e1) {
        return t2.concat.apply([], e1);
    }, u1 = t2.push, i1 = t2.indexOf, n1 = {
    }, o1 = n1.toString, v = n1.hasOwnProperty, a = v.toString, l1 = a.call(Object), y = {
    }, m = function(e1) {
        return "function" == typeof e1 && "number" != typeof e1.nodeType && "function" != typeof e1.item;
    }, x = function(e1) {
        return null != e1 && e1 === e1.window;
    }, E = C.document, c = {
        type: !0,
        src: !0,
        nonce: !0,
        noModule: !0
    };
    function b(e1, t1, n1) {
        var r1, i1, o1 = (n1 = n1 || E).createElement("script");
        if (o1.text = e1, t1) for(r1 in c)(i1 = t1[r1] || t1.getAttribute && t1.getAttribute(r1)) && o1.setAttribute(r1, i1);
        n1.head.appendChild(o1).parentNode.removeChild(o1);
    }
    function w(e1) {
        return null == e1 ? e1 + "" : "object" == typeof e1 || "function" == typeof e1 ? n1[o1.call(e1)] || "object" : typeof e1;
    }
    var f = "3.6.0", S = function(e1, t1) {
        return new S.fn.init(e1, t1);
    };
    function p(e1) {
        var t1 = !!e1 && "length" in e1 && e1.length, n1 = w(e1);
        return !m(e1) && !x(e1) && ("array" === n1 || 0 === t1 || "number" == typeof t1 && 0 < t1 && t1 - 1 in e1);
    }
    S.fn = S.prototype = {
        jquery: f,
        constructor: S,
        length: 0,
        toArray: function() {
            return s1.call(this);
        },
        get: function(e1) {
            return null == e1 ? s1.call(this) : e1 < 0 ? this[e1 + this.length] : this[e1];
        },
        pushStack: function(e1) {
            var t1 = S.merge(this.constructor(), e1);
            return t1.prevObject = this, t1;
        },
        each: function(e1) {
            return S.each(this, e1);
        },
        map: function(n1) {
            return this.pushStack(S.map(this, function(e1, t1) {
                return n1.call(e1, t1, e1);
            }));
        },
        slice: function() {
            return this.pushStack(s1.apply(this, arguments));
        },
        first: function() {
            return this.eq(0);
        },
        last: function() {
            return this.eq(-1);
        },
        even: function() {
            return this.pushStack(S.grep(this, function(e1, t1) {
                return (t1 + 1) % 2;
            }));
        },
        odd: function() {
            return this.pushStack(S.grep(this, function(e1, t1) {
                return t1 % 2;
            }));
        },
        eq: function(e1) {
            var t1 = this.length, n1 = +e1 + (e1 < 0 ? t1 : 0);
            return this.pushStack(0 <= n1 && n1 < t1 ? [
                this[n1]
            ] : []);
        },
        end: function() {
            return this.prevObject || this.constructor();
        },
        push: u1,
        sort: t2.sort,
        splice: t2.splice
    }, S.extend = S.fn.extend = function() {
        var e1, t1, n1, r1, i1, o1, a1 = arguments[0] || {
        }, s1 = 1, u1 = arguments.length, l1 = !1;
        for("boolean" == typeof a1 && (l1 = a1, a1 = arguments[s1] || {
        }, s1++), "object" == typeof a1 || m(a1) || (a1 = {
        }), s1 === u1 && (a1 = this, s1--); s1 < u1; s1++)if (null != (e1 = arguments[s1])) for(t1 in e1)r1 = e1[t1], "__proto__" !== t1 && a1 !== r1 && (l1 && r1 && (S.isPlainObject(r1) || (i1 = Array.isArray(r1))) ? (n1 = a1[t1], o1 = i1 && !Array.isArray(n1) ? [] : i1 || S.isPlainObject(n1) ? n1 : {
        }, i1 = !1, a1[t1] = S.extend(l1, o1, r1)) : (void 0) !== r1 && (a1[t1] = r1));
        return a1;
    }, S.extend({
        expando: "jQuery" + (f + Math.random()).replace(/\D/g, ""),
        isReady: !0,
        error: function(e1) {
            throw new Error(e1);
        },
        noop: function() {
        },
        isPlainObject: function(e1) {
            var t1, n1;
            return !(!e1 || "[object Object]" !== o1.call(e1)) && (!(t1 = r1(e1)) || "function" == typeof (n1 = v.call(t1, "constructor") && t1.constructor) && a.call(n1) === l1);
        },
        isEmptyObject: function(e1) {
            var t1;
            for(t1 in e1)return !1;
            return !0;
        },
        globalEval: function(e1, t1, n1) {
            b(e1, {
                nonce: t1 && t1.nonce
            }, n1);
        },
        each: function(e1, t1) {
            var n1, r1 = 0;
            if (p(e1)) {
                for(n1 = e1.length; r1 < n1; r1++)if (!1 === t1.call(e1[r1], r1, e1[r1])) break;
            } else for(r1 in e1)if (!1 === t1.call(e1[r1], r1, e1[r1])) break;
            return e1;
        },
        makeArray: function(e1, t1) {
            var n1 = t1 || [];
            return null != e1 && (p(Object(e1)) ? S.merge(n1, "string" == typeof e1 ? [
                e1
            ] : e1) : u1.call(n1, e1)), n1;
        },
        inArray: function(e1, t1, n1) {
            return null == t1 ? -1 : i1.call(t1, e1, n1);
        },
        merge: function(e1, t1) {
            for(var n1 = +t1.length, r1 = 0, i1 = e1.length; r1 < n1; r1++)e1[i1++] = t1[r1];
            return e1.length = i1, e1;
        },
        grep: function(e1, t1, n1) {
            for(var r1 = [], i1 = 0, o1 = e1.length, a1 = !n1; i1 < o1; i1++)!t1(e1[i1], i1) !== a1 && r1.push(e1[i1]);
            return r1;
        },
        map: function(e1, t1, n1) {
            var r1, i1, o1 = 0, a1 = [];
            if (p(e1)) for(r1 = e1.length; o1 < r1; o1++)null != (i1 = t1(e1[o1], o1, n1)) && a1.push(i1);
            else for(o1 in e1)null != (i1 = t1(e1[o1], o1, n1)) && a1.push(i1);
            return g(a1);
        },
        guid: 1,
        support: y
    }), "function" == typeof Symbol && (S.fn[Symbol.iterator] = t2[Symbol.iterator]), S.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "), function(e1, t1) {
        n1["[object " + t1 + "]"] = t1.toLowerCase();
    });
    var d = function(n1) {
        var e1, d1, b1, o1, i1, h, f1, g1, w1, u1, l1, T, C1, a1, E1, v1, s1, c1, y1, S1 = "sizzle" + 1 * new Date, p1 = n1.document, k = 0, r1 = 0, m1 = ue(), x1 = ue(), A = ue(), N = ue(), j = function(e2, t1) {
            return e2 === t1 && (l1 = !0), 0;
        }, D = {
        }.hasOwnProperty, t1 = [], q = t1.pop, L = t1.push, H = t1.push, O = t1.slice, P = function(e2, t2) {
            for(var n2 = 0, r2 = e2.length; n2 < r2; n2++)if (e2[n2] === t2) return n2;
            return -1;
        }, R = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped", M = "[\\x20\\t\\r\\n\\f]", I = "(?:\\\\[\\da-fA-F]{1,6}" + M + "?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+", W = "\\[" + M + "*(" + I + ")(?:" + M + "*([*^$|!~]?=)" + M + "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + I + "))|)" + M + "*\\]", F = ":(" + I + ")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|" + W + ")*)|.*)\\)|)", B = new RegExp(M + "+", "g"), $ = new RegExp("^" + M + "+|((?:^|[^\\\\])(?:\\\\.)*)" + M + "+$", "g"), _ = new RegExp("^" + M + "*," + M + "*"), z = new RegExp("^" + M + "*([>+~]|" + M + ")" + M + "*"), U = new RegExp(M + "|>"), X = new RegExp(F), V = new RegExp("^" + I + "$"), G = {
            ID: new RegExp("^#(" + I + ")"),
            CLASS: new RegExp("^\\.(" + I + ")"),
            TAG: new RegExp("^(" + I + "|[*])"),
            ATTR: new RegExp("^" + W),
            PSEUDO: new RegExp("^" + F),
            CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + M + "*(even|odd|(([+-]|)(\\d*)n|)" + M + "*(?:([+-]|)" + M + "*(\\d+)|))" + M + "*\\)|)", "i"),
            bool: new RegExp("^(?:" + R + ")$", "i"),
            needsContext: new RegExp("^" + M + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + M + "*((?:-\\d)?\\d*)" + M + "*\\)|)(?=[^-]|$)", "i")
        }, Y = /HTML$/i, Q = /^(?:input|select|textarea|button)$/i, J = /^h\d$/i, K = /^[^{]+\{\s*\[native \w/, Z = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, ee = /[+~]/, te = new RegExp("\\\\[\\da-fA-F]{1,6}" + M + "?|\\\\([^\\r\\n\\f])", "g"), ne = function(e2, t2) {
            var n2 = "0x" + e2.slice(1) - 65536;
            return t2 || (n2 < 0 ? String.fromCharCode(n2 + 65536) : String.fromCharCode(n2 >> 10 | 55296, 1023 & n2 | 56320));
        }, re = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g, ie = function(e2, t2) {
            return t2 ? "\0" === e2 ? "\ufffd" : e2.slice(0, -1) + "\\" + e2.charCodeAt(e2.length - 1).toString(16) + " " : "\\" + e2;
        }, oe = function() {
            T();
        }, ae = be(function(e2) {
            return !0 === e2.disabled && "fieldset" === e2.nodeName.toLowerCase();
        }, {
            dir: "parentNode",
            next: "legend"
        });
        try {
            H.apply(t1 = O.call(p1.childNodes), p1.childNodes), t1[p1.childNodes.length].nodeType;
        } catch (e2) {
            H = {
                apply: t1.length ? function(e3, t2) {
                    L.apply(e3, O.call(t2));
                } : function(e3, t2) {
                    var n2 = e3.length, r2 = 0;
                    while(e3[n2++] = t2[r2++]);
                    e3.length = n2 - 1;
                }
            };
        }
        function se(t2, e2, n2, r2) {
            var i2, o2, a2, s2, u2, l2, c2, f2 = e2 && e2.ownerDocument, p2 = e2 ? e2.nodeType : 9;
            if (n2 = n2 || [], "string" != typeof t2 || !t2 || 1 !== p2 && 9 !== p2 && 11 !== p2) return n2;
            if (!r2 && (T(e2), e2 = e2 || C1, E1)) {
                if (11 !== p2 && (u2 = Z.exec(t2))) {
                    if (i2 = u2[1]) {
                        if (9 === p2) {
                            if (!(a2 = e2.getElementById(i2))) return n2;
                            if (a2.id === i2) return n2.push(a2), n2;
                        } else if (f2 && (a2 = f2.getElementById(i2)) && y1(e2, a2) && a2.id === i2) return n2.push(a2), n2;
                    } else {
                        if (u2[2]) return H.apply(n2, e2.getElementsByTagName(t2)), n2;
                        if ((i2 = u2[3]) && d1.getElementsByClassName && e2.getElementsByClassName) return H.apply(n2, e2.getElementsByClassName(i2)), n2;
                    }
                }
                if (d1.qsa && !N[t2 + " "] && (!v1 || !v1.test(t2)) && (1 !== p2 || "object" !== e2.nodeName.toLowerCase())) {
                    if (c2 = t2, f2 = e2, 1 === p2 && (U.test(t2) || z.test(t2))) {
                        (f2 = ee.test(t2) && ye(e2.parentNode) || e2) === e2 && d1.scope || ((s2 = e2.getAttribute("id")) ? s2 = s2.replace(re, ie) : e2.setAttribute("id", s2 = S1)), o2 = (l2 = h(t2)).length;
                        while(o2--)l2[o2] = (s2 ? "#" + s2 : ":scope") + " " + xe(l2[o2]);
                        c2 = l2.join(",");
                    }
                    try {
                        return H.apply(n2, f2.querySelectorAll(c2)), n2;
                    } catch (e3) {
                        N(t2, !0);
                    } finally{
                        s2 === S1 && e2.removeAttribute("id");
                    }
                }
            }
            return g1(t2.replace($, "$1"), e2, n2, r2);
        }
        function ue() {
            var r2 = [];
            return function e2(t2, n2) {
                return r2.push(t2 + " ") > b1.cacheLength && delete e2[r2.shift()], e2[t2 + " "] = n2;
            };
        }
        function le(e2) {
            return e2[S1] = !0, e2;
        }
        function ce(e2) {
            var t2 = C1.createElement("fieldset");
            try {
                return !!e2(t2);
            } catch (e3) {
                return !1;
            } finally{
                t2.parentNode && t2.parentNode.removeChild(t2), t2 = null;
            }
        }
        function fe(e2, t2) {
            var n2 = e2.split("|"), r2 = n2.length;
            while(r2--)b1.attrHandle[n2[r2]] = t2;
        }
        function pe(e2, t2) {
            var n2 = t2 && e2, r2 = n2 && 1 === e2.nodeType && 1 === t2.nodeType && e2.sourceIndex - t2.sourceIndex;
            if (r2) return r2;
            if (n2) while(n2 = n2.nextSibling)if (n2 === t2) return -1;
            return e2 ? 1 : -1;
        }
        function de(t2) {
            return function(e2) {
                return "input" === e2.nodeName.toLowerCase() && e2.type === t2;
            };
        }
        function he(n2) {
            return function(e2) {
                var t2 = e2.nodeName.toLowerCase();
                return ("input" === t2 || "button" === t2) && e2.type === n2;
            };
        }
        function ge(t2) {
            return function(e2) {
                return "form" in e2 ? e2.parentNode && !1 === e2.disabled ? "label" in e2 ? "label" in e2.parentNode ? e2.parentNode.disabled === t2 : e2.disabled === t2 : e2.isDisabled === t2 || e2.isDisabled !== !t2 && ae(e2) === t2 : e2.disabled === t2 : "label" in e2 && e2.disabled === t2;
            };
        }
        function ve(a2) {
            return le(function(o2) {
                return o2 = +o2, le(function(e2, t2) {
                    var n2, r2 = a2([], e2.length, o2), i2 = r2.length;
                    while(i2--)e2[n2 = r2[i2]] && (e2[n2] = !(t2[n2] = e2[n2]));
                });
            });
        }
        function ye(e2) {
            return e2 && "undefined" != typeof e2.getElementsByTagName && e2;
        }
        for(e1 in d1 = se.support = {
        }, i1 = se.isXML = function(e2) {
            var t2 = e2 && e2.namespaceURI, n2 = e2 && (e2.ownerDocument || e2).documentElement;
            return !Y.test(t2 || n2 && n2.nodeName || "HTML");
        }, T = se.setDocument = function(e2) {
            var t2, n2, r2 = e2 ? e2.ownerDocument || e2 : p1;
            return r2 != C1 && 9 === r2.nodeType && r2.documentElement && (a1 = (C1 = r2).documentElement, E1 = !i1(C1), p1 != C1 && (n2 = C1.defaultView) && n2.top !== n2 && (n2.addEventListener ? n2.addEventListener("unload", oe, !1) : n2.attachEvent && n2.attachEvent("onunload", oe)), d1.scope = ce(function(e3) {
                return a1.appendChild(e3).appendChild(C1.createElement("div")), "undefined" != typeof e3.querySelectorAll && !e3.querySelectorAll(":scope fieldset div").length;
            }), d1.attributes = ce(function(e3) {
                return e3.className = "i", !e3.getAttribute("className");
            }), d1.getElementsByTagName = ce(function(e3) {
                return e3.appendChild(C1.createComment("")), !e3.getElementsByTagName("*").length;
            }), d1.getElementsByClassName = K.test(C1.getElementsByClassName), d1.getById = ce(function(e3) {
                return a1.appendChild(e3).id = S1, !C1.getElementsByName || !C1.getElementsByName(S1).length;
            }), d1.getById ? (b1.filter.ID = function(e3) {
                var t3 = e3.replace(te, ne);
                return function(e4) {
                    return e4.getAttribute("id") === t3;
                };
            }, b1.find.ID = function(e3, t3) {
                if ("undefined" != typeof t3.getElementById && E1) {
                    var n3 = t3.getElementById(e3);
                    return n3 ? [
                        n3
                    ] : [];
                }
            }) : (b1.filter.ID = function(e3) {
                var n4 = e3.replace(te, ne);
                return function(e4) {
                    var t3 = "undefined" != typeof e4.getAttributeNode && e4.getAttributeNode("id");
                    return t3 && t3.value === n4;
                };
            }, b1.find.ID = function(e3, t3) {
                if ("undefined" != typeof t3.getElementById && E1) {
                    var n4, r3, i2, o2 = t3.getElementById(e3);
                    if (o2) {
                        if ((n4 = o2.getAttributeNode("id")) && n4.value === e3) return [
                            o2
                        ];
                        i2 = t3.getElementsByName(e3), r3 = 0;
                        while(o2 = i2[r3++])if ((n4 = o2.getAttributeNode("id")) && n4.value === e3) return [
                            o2
                        ];
                    }
                    return [];
                }
            }), b1.find.TAG = d1.getElementsByTagName ? function(e3, t3) {
                return "undefined" != typeof t3.getElementsByTagName ? t3.getElementsByTagName(e3) : d1.qsa ? t3.querySelectorAll(e3) : void 0;
            } : function(e3, t3) {
                var n5, r4 = [], i3 = 0, o3 = t3.getElementsByTagName(e3);
                if ("*" === e3) {
                    while(n5 = o3[i3++])1 === n5.nodeType && r4.push(n5);
                    return r4;
                }
                return o3;
            }, b1.find.CLASS = d1.getElementsByClassName && function(e3, t3) {
                if ("undefined" != typeof t3.getElementsByClassName && E1) return t3.getElementsByClassName(e3);
            }, s1 = [], v1 = [], (d1.qsa = K.test(C1.querySelectorAll)) && (ce(function(e3) {
                var t3;
                a1.appendChild(e3).innerHTML = "<a id='" + S1 + "'></a><select id='" + S1 + "-\r\\' msallowcapture=''><option selected=''></option></select>", e3.querySelectorAll("[msallowcapture^='']").length && v1.push("[*^$]=" + M + "*(?:''|\"\")"), e3.querySelectorAll("[selected]").length || v1.push("\\[" + M + "*(?:value|" + R + ")"), e3.querySelectorAll("[id~=" + S1 + "-]").length || v1.push("~="), (t3 = C1.createElement("input")).setAttribute("name", ""), e3.appendChild(t3), e3.querySelectorAll("[name='']").length || v1.push("\\[" + M + "*name" + M + "*=" + M + "*(?:''|\"\")"), e3.querySelectorAll(":checked").length || v1.push(":checked"), e3.querySelectorAll("a#" + S1 + "+*").length || v1.push(".#.+[+~]"), e3.querySelectorAll("\\\f"), v1.push("[\\r\\n\\f]");
            }), ce(function(e3) {
                e3.innerHTML = "<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>";
                var t3 = C1.createElement("input");
                t3.setAttribute("type", "hidden"), e3.appendChild(t3).setAttribute("name", "D"), e3.querySelectorAll("[name=d]").length && v1.push("name" + M + "*[*^$|!~]?="), 2 !== e3.querySelectorAll(":enabled").length && v1.push(":enabled", ":disabled"), a1.appendChild(e3).disabled = !0, 2 !== e3.querySelectorAll(":disabled").length && v1.push(":enabled", ":disabled"), e3.querySelectorAll("*,:x"), v1.push(",.*:");
            })), (d1.matchesSelector = K.test(c1 = a1.matches || a1.webkitMatchesSelector || a1.mozMatchesSelector || a1.oMatchesSelector || a1.msMatchesSelector)) && ce(function(e3) {
                d1.disconnectedMatch = c1.call(e3, "*"), c1.call(e3, "[s!='']:x"), s1.push("!=", F);
            }), v1 = v1.length && new RegExp(v1.join("|")), s1 = s1.length && new RegExp(s1.join("|")), t2 = K.test(a1.compareDocumentPosition), y1 = t2 || K.test(a1.contains) ? function(e3, t3) {
                var n5 = 9 === e3.nodeType ? e3.documentElement : e3, r4 = t3 && t3.parentNode;
                return e3 === r4 || !(!r4 || 1 !== r4.nodeType || !(n5.contains ? n5.contains(r4) : e3.compareDocumentPosition && 16 & e3.compareDocumentPosition(r4)));
            } : function(e3, t3) {
                if (t3) while(t3 = t3.parentNode)if (t3 === e3) return !0;
                return !1;
            }, j = t2 ? function(e3, t3) {
                if (e3 === t3) return l1 = !0, 0;
                var n5 = !e3.compareDocumentPosition - !t3.compareDocumentPosition;
                return n5 || (1 & (n5 = (e3.ownerDocument || e3) == (t3.ownerDocument || t3) ? e3.compareDocumentPosition(t3) : 1) || !d1.sortDetached && t3.compareDocumentPosition(e3) === n5 ? e3 == C1 || e3.ownerDocument == p1 && y1(p1, e3) ? -1 : t3 == C1 || t3.ownerDocument == p1 && y1(p1, t3) ? 1 : u1 ? P(u1, e3) - P(u1, t3) : 0 : 4 & n5 ? -1 : 1);
            } : function(e3, t3) {
                if (e3 === t3) return l1 = !0, 0;
                var n5, r4 = 0, i3 = e3.parentNode, o3 = t3.parentNode, a2 = [
                    e3
                ], s2 = [
                    t3
                ];
                if (!i3 || !o3) return e3 == C1 ? -1 : t3 == C1 ? 1 : i3 ? -1 : o3 ? 1 : u1 ? P(u1, e3) - P(u1, t3) : 0;
                if (i3 === o3) return pe(e3, t3);
                n5 = e3;
                while(n5 = n5.parentNode)a2.unshift(n5);
                n5 = t3;
                while(n5 = n5.parentNode)s2.unshift(n5);
                while(a2[r4] === s2[r4])r4++;
                return r4 ? pe(a2[r4], s2[r4]) : a2[r4] == p1 ? -1 : s2[r4] == p1 ? 1 : 0;
            }), C1;
        }, se.matches = function(e2, t2) {
            return se(e2, null, null, t2);
        }, se.matchesSelector = function(e2, t2) {
            if (T(e2), d1.matchesSelector && E1 && !N[t2 + " "] && (!s1 || !s1.test(t2)) && (!v1 || !v1.test(t2))) try {
                var n2 = c1.call(e2, t2);
                if (n2 || d1.disconnectedMatch || e2.document && 11 !== e2.document.nodeType) return n2;
            } catch (e3) {
                N(t2, !0);
            }
            return 0 < se(t2, C1, null, [
                e2
            ]).length;
        }, se.contains = function(e2, t2) {
            return (e2.ownerDocument || e2) != C1 && T(e2), y1(e2, t2);
        }, se.attr = function(e2, t2) {
            (e2.ownerDocument || e2) != C1 && T(e2);
            var n2 = b1.attrHandle[t2.toLowerCase()], r2 = n2 && D.call(b1.attrHandle, t2.toLowerCase()) ? n2(e2, t2, !E1) : void 0;
            return (void 0) !== r2 ? r2 : d1.attributes || !E1 ? e2.getAttribute(t2) : (r2 = e2.getAttributeNode(t2)) && r2.specified ? r2.value : null;
        }, se.escape = function(e2) {
            return (e2 + "").replace(re, ie);
        }, se.error = function(e2) {
            throw new Error("Syntax error, unrecognized expression: " + e2);
        }, se.uniqueSort = function(e2) {
            var t2, n2 = [], r2 = 0, i3 = 0;
            if (l1 = !d1.detectDuplicates, u1 = !d1.sortStable && e2.slice(0), e2.sort(j), l1) {
                while(t2 = e2[i3++])t2 === e2[i3] && (r2 = n2.push(i3));
                while(r2--)e2.splice(n2[r2], 1);
            }
            return u1 = null, e2;
        }, o1 = se.getText = function(e2) {
            var t2, n2 = "", r2 = 0, i3 = e2.nodeType;
            if (i3) {
                if (1 === i3 || 9 === i3 || 11 === i3) {
                    if ("string" == typeof e2.textContent) return e2.textContent;
                    for(e2 = e2.firstChild; e2; e2 = e2.nextSibling)n2 += o1(e2);
                } else if (3 === i3 || 4 === i3) return e2.nodeValue;
            } else while(t2 = e2[r2++])n2 += o1(t2);
            return n2;
        }, (b1 = se.selectors = {
            cacheLength: 50,
            createPseudo: le,
            match: G,
            attrHandle: {
            },
            find: {
            },
            relative: {
                ">": {
                    dir: "parentNode",
                    first: !0
                },
                " ": {
                    dir: "parentNode"
                },
                "+": {
                    dir: "previousSibling",
                    first: !0
                },
                "~": {
                    dir: "previousSibling"
                }
            },
            preFilter: {
                ATTR: function(e2) {
                    return e2[1] = e2[1].replace(te, ne), e2[3] = (e2[3] || e2[4] || e2[5] || "").replace(te, ne), "~=" === e2[2] && (e2[3] = " " + e2[3] + " "), e2.slice(0, 4);
                },
                CHILD: function(e2) {
                    return e2[1] = e2[1].toLowerCase(), "nth" === e2[1].slice(0, 3) ? (e2[3] || se.error(e2[0]), e2[4] = +(e2[4] ? e2[5] + (e2[6] || 1) : 2 * ("even" === e2[3] || "odd" === e2[3])), e2[5] = +(e2[7] + e2[8] || "odd" === e2[3])) : e2[3] && se.error(e2[0]), e2;
                },
                PSEUDO: function(e2) {
                    var t2, n2 = !e2[6] && e2[2];
                    return G.CHILD.test(e2[0]) ? null : (e2[3] ? e2[2] = e2[4] || e2[5] || "" : n2 && X.test(n2) && (t2 = h(n2, !0)) && (t2 = n2.indexOf(")", n2.length - t2) - n2.length) && (e2[0] = e2[0].slice(0, t2), e2[2] = n2.slice(0, t2)), e2.slice(0, 3));
                }
            },
            filter: {
                TAG: function(e2) {
                    var t2 = e2.replace(te, ne).toLowerCase();
                    return "*" === e2 ? function() {
                        return !0;
                    } : function(e3) {
                        return e3.nodeName && e3.nodeName.toLowerCase() === t2;
                    };
                },
                CLASS: function(e2) {
                    var t2 = m1[e2 + " "];
                    return t2 || (t2 = new RegExp("(^|" + M + ")" + e2 + "(" + M + "|$)")) && m1(e2, function(e3) {
                        return t2.test("string" == typeof e3.className && e3.className || "undefined" != typeof e3.getAttribute && e3.getAttribute("class") || "");
                    });
                },
                ATTR: function(n2, r2, i3) {
                    return function(e2) {
                        var t2 = se.attr(e2, n2);
                        return null == t2 ? "!=" === r2 : !r2 || (t2 += "", "=" === r2 ? t2 === i3 : "!=" === r2 ? t2 !== i3 : "^=" === r2 ? i3 && 0 === t2.indexOf(i3) : "*=" === r2 ? i3 && -1 < t2.indexOf(i3) : "$=" === r2 ? i3 && t2.slice(-i3.length) === i3 : "~=" === r2 ? -1 < (" " + t2.replace(B, " ") + " ").indexOf(i3) : "|=" === r2 && (t2 === i3 || t2.slice(0, i3.length + 1) === i3 + "-"));
                    };
                },
                CHILD: function(h1, e2, t2, g2, v2) {
                    var y2 = "nth" !== h1.slice(0, 3), m2 = "last" !== h1.slice(-4), x2 = "of-type" === e2;
                    return 1 === g2 && 0 === v2 ? function(e3) {
                        return !!e3.parentNode;
                    } : function(e3, t3, n2) {
                        var r2, i3, o3, a2, s2, u2, l2 = y2 !== m2 ? "nextSibling" : "previousSibling", c2 = e3.parentNode, f2 = x2 && e3.nodeName.toLowerCase(), p2 = !n2 && !x2, d2 = !1;
                        if (c2) {
                            if (y2) {
                                while(l2){
                                    a2 = e3;
                                    while(a2 = a2[l2])if (x2 ? a2.nodeName.toLowerCase() === f2 : 1 === a2.nodeType) return !1;
                                    u2 = l2 = "only" === h1 && !u2 && "nextSibling";
                                }
                                return !0;
                            }
                            if (u2 = [
                                m2 ? c2.firstChild : c2.lastChild
                            ], m2 && p2) {
                                d2 = (s2 = (r2 = (i3 = (o3 = (a2 = c2)[S1] || (a2[S1] = {
                                }))[a2.uniqueID] || (o3[a2.uniqueID] = {
                                }))[h1] || [])[0] === k && r2[1]) && r2[2], a2 = s2 && c2.childNodes[s2];
                                while(a2 = (++s2) && a2 && a2[l2] || (d2 = s2 = 0) || u2.pop())if (1 === a2.nodeType && ++d2 && a2 === e3) {
                                    i3[h1] = [
                                        k,
                                        s2,
                                        d2
                                    ];
                                    break;
                                }
                            } else if (p2 && (d2 = s2 = (r2 = (i3 = (o3 = (a2 = e3)[S1] || (a2[S1] = {
                            }))[a2.uniqueID] || (o3[a2.uniqueID] = {
                            }))[h1] || [])[0] === k && r2[1]), !1 === d2) while(a2 = (++s2) && a2 && a2[l2] || (d2 = s2 = 0) || u2.pop())if ((x2 ? a2.nodeName.toLowerCase() === f2 : 1 === a2.nodeType) && ++d2 && (p2 && ((i3 = (o3 = a2[S1] || (a2[S1] = {
                            }))[a2.uniqueID] || (o3[a2.uniqueID] = {
                            }))[h1] = [
                                k,
                                d2
                            ]), a2 === e3)) break;
                            return (d2 -= v2) === g2 || d2 % g2 == 0 && 0 <= d2 / g2;
                        }
                    };
                },
                PSEUDO: function(e2, o3) {
                    var t2, a2 = b1.pseudos[e2] || b1.setFilters[e2.toLowerCase()] || se.error("unsupported pseudo: " + e2);
                    return a2[S1] ? a2(o3) : 1 < a2.length ? (t2 = [
                        e2,
                        e2,
                        "",
                        o3
                    ], b1.setFilters.hasOwnProperty(e2.toLowerCase()) ? le(function(e3, t3) {
                        var n2, r2 = a2(e3, o3), i3 = r2.length;
                        while(i3--)e3[n2 = P(e3, r2[i3])] = !(t3[n2] = r2[i3]);
                    }) : function(e3) {
                        return a2(e3, 0, t2);
                    }) : a2;
                }
            },
            pseudos: {
                not: le(function(e2) {
                    var r2 = [], i3 = [], s2 = f1(e2.replace($, "$1"));
                    return s2[S1] ? le(function(e3, t2, n2, r4) {
                        var i4, o3 = s2(e3, null, r4, []), a2 = e3.length;
                        while(a2--)(i4 = o3[a2]) && (e3[a2] = !(t2[a2] = i4));
                    }) : function(e3, t2, n2) {
                        return r2[0] = e3, s2(r2, null, n2, i3), r2[0] = null, !i3.pop();
                    };
                }),
                has: le(function(t2) {
                    return function(e2) {
                        return 0 < se(t2, e2).length;
                    };
                }),
                contains: le(function(t2) {
                    return t2 = t2.replace(te, ne), function(e2) {
                        return -1 < (e2.textContent || o1(e2)).indexOf(t2);
                    };
                }),
                lang: le(function(n2) {
                    return V.test(n2 || "") || se.error("unsupported lang: " + n2), n2 = n2.replace(te, ne).toLowerCase(), function(e2) {
                        var t2;
                        do {
                            if (t2 = E1 ? e2.lang : e2.getAttribute("xml:lang") || e2.getAttribute("lang")) return (t2 = t2.toLowerCase()) === n2 || 0 === t2.indexOf(n2 + "-");
                        }while ((e2 = e2.parentNode) && 1 === e2.nodeType)
                        return !1;
                    };
                }),
                target: function(e2) {
                    var t2 = n1.location && n1.location.hash;
                    return t2 && t2.slice(1) === e2.id;
                },
                root: function(e2) {
                    return e2 === a1;
                },
                focus: function(e2) {
                    return e2 === C1.activeElement && (!C1.hasFocus || C1.hasFocus()) && !!(e2.type || e2.href || ~e2.tabIndex);
                },
                enabled: ge(!1),
                disabled: ge(!0),
                checked: function(e2) {
                    var t2 = e2.nodeName.toLowerCase();
                    return "input" === t2 && !!e2.checked || "option" === t2 && !!e2.selected;
                },
                selected: function(e2) {
                    return e2.parentNode && e2.parentNode.selectedIndex, !0 === e2.selected;
                },
                empty: function(e2) {
                    for(e2 = e2.firstChild; e2; e2 = e2.nextSibling)if (e2.nodeType < 6) return !1;
                    return !0;
                },
                parent: function(e2) {
                    return !b1.pseudos.empty(e2);
                },
                header: function(e2) {
                    return J.test(e2.nodeName);
                },
                input: function(e2) {
                    return Q.test(e2.nodeName);
                },
                button: function(e2) {
                    var t2 = e2.nodeName.toLowerCase();
                    return "input" === t2 && "button" === e2.type || "button" === t2;
                },
                text: function(e2) {
                    var t2;
                    return "input" === e2.nodeName.toLowerCase() && "text" === e2.type && (null == (t2 = e2.getAttribute("type")) || "text" === t2.toLowerCase());
                },
                first: ve(function() {
                    return [
                        0
                    ];
                }),
                last: ve(function(e2, t2) {
                    return [
                        t2 - 1
                    ];
                }),
                eq: ve(function(e2, t2, n2) {
                    return [
                        n2 < 0 ? n2 + t2 : n2
                    ];
                }),
                even: ve(function(e2, t2) {
                    for(var n2 = 0; n2 < t2; n2 += 2)e2.push(n2);
                    return e2;
                }),
                odd: ve(function(e2, t2) {
                    for(var n2 = 1; n2 < t2; n2 += 2)e2.push(n2);
                    return e2;
                }),
                lt: ve(function(e2, t2, n2) {
                    for(var r2 = n2 < 0 ? n2 + t2 : t2 < n2 ? t2 : n2; 0 <= --r2;)e2.push(r2);
                    return e2;
                }),
                gt: ve(function(e2, t2, n2) {
                    for(var r2 = n2 < 0 ? n2 + t2 : n2; (++r2) < t2;)e2.push(r2);
                    return e2;
                })
            }
        }).pseudos.nth = b1.pseudos.eq, {
            radio: !0,
            checkbox: !0,
            file: !0,
            password: !0,
            image: !0
        })b1.pseudos[e1] = de(e1);
        for(e1 in {
            submit: !0,
            reset: !0
        })b1.pseudos[e1] = he(e1);
        function me() {
        }
        function xe(e2) {
            for(var t2 = 0, n2 = e2.length, r2 = ""; t2 < n2; t2++)r2 += e2[t2].value;
            return r2;
        }
        function be(s2, e2, t2) {
            var u2 = e2.dir, l2 = e2.next, c2 = l2 || u2, f2 = t2 && "parentNode" === c2, p2 = r1++;
            return e2.first ? function(e3, t3, n2) {
                while(e3 = e3[u2])if (1 === e3.nodeType || f2) return s2(e3, t3, n2);
                return !1;
            } : function(e3, t3, n2) {
                var r2, i3, o3, a2 = [
                    k,
                    p2
                ];
                if (n2) {
                    while(e3 = e3[u2])if ((1 === e3.nodeType || f2) && s2(e3, t3, n2)) return !0;
                } else while(e3 = e3[u2])if (1 === e3.nodeType || f2) {
                    if (i3 = (o3 = e3[S1] || (e3[S1] = {
                    }))[e3.uniqueID] || (o3[e3.uniqueID] = {
                    }), l2 && l2 === e3.nodeName.toLowerCase()) e3 = e3[u2] || e3;
                    else {
                        if ((r2 = i3[c2]) && r2[0] === k && r2[1] === p2) return a2[2] = r2[2];
                        if ((i3[c2] = a2)[2] = s2(e3, t3, n2)) return !0;
                    }
                }
                return !1;
            };
        }
        function we(i3) {
            return 1 < i3.length ? function(e2, t2, n2) {
                var r2 = i3.length;
                while(r2--)if (!i3[r2](e2, t2, n2)) return !1;
                return !0;
            } : i3[0];
        }
        function Te(e2, t2, n2, r2, i3) {
            for(var o3, a2 = [], s2 = 0, u2 = e2.length, l2 = null != t2; s2 < u2; s2++)(o3 = e2[s2]) && (n2 && !n2(o3, r2, i3) || (a2.push(o3), l2 && t2.push(s2)));
            return a2;
        }
        function Ce(d2, h1, g2, v2, y2, e2) {
            return v2 && !v2[S1] && (v2 = Ce(v2)), y2 && !y2[S1] && (y2 = Ce(y2, e2)), le(function(e3, t2, n2, r2) {
                var i3, o3, a2, s2 = [], u2 = [], l2 = t2.length, c2 = e3 || function(e4, t3, n5) {
                    for(var r4 = 0, i4 = t3.length; r4 < i4; r4++)se(e4, t3[r4], n5);
                    return n5;
                }(h1 || "*", n2.nodeType ? [
                    n2
                ] : n2, []), f2 = !d2 || !e3 && h1 ? c2 : Te(c2, s2, d2, n2, r2), p2 = g2 ? y2 || (e3 ? d2 : l2 || v2) ? [] : t2 : f2;
                if (g2 && g2(f2, p2, n2, r2), v2) {
                    i3 = Te(p2, u2), v2(i3, [], n2, r2), o3 = i3.length;
                    while(o3--)(a2 = i3[o3]) && (p2[u2[o3]] = !(f2[u2[o3]] = a2));
                }
                if (e3) {
                    if (y2 || d2) {
                        if (y2) {
                            i3 = [], o3 = p2.length;
                            while(o3--)(a2 = p2[o3]) && i3.push(f2[o3] = a2);
                            y2(null, p2 = [], i3, r2);
                        }
                        o3 = p2.length;
                        while(o3--)(a2 = p2[o3]) && -1 < (i3 = y2 ? P(e3, a2) : s2[o3]) && (e3[i3] = !(t2[i3] = a2));
                    }
                } else p2 = Te(p2 === t2 ? p2.splice(l2, p2.length) : p2), y2 ? y2(null, t2, p2, r2) : H.apply(t2, p2);
            });
        }
        function Ee(e2) {
            for(var i3, t2, n2, r2 = e2.length, o3 = b1.relative[e2[0].type], a2 = o3 || b1.relative[" "], s2 = o3 ? 1 : 0, u2 = be(function(e3) {
                return e3 === i3;
            }, a2, !0), l2 = be(function(e3) {
                return -1 < P(i3, e3);
            }, a2, !0), c2 = [
                function(e3, t3, n5) {
                    var r4 = !o3 && (n5 || t3 !== w1) || ((i3 = t3).nodeType ? u2(e3, t3, n5) : l2(e3, t3, n5));
                    return i3 = null, r4;
                }
            ]; s2 < r2; s2++)if (t2 = b1.relative[e2[s2].type]) c2 = [
                be(we(c2), t2)
            ];
            else {
                if ((t2 = b1.filter[e2[s2].type].apply(null, e2[s2].matches))[S1]) {
                    for(n2 = ++s2; n2 < r2; n2++)if (b1.relative[e2[n2].type]) break;
                    return Ce(1 < s2 && we(c2), 1 < s2 && xe(e2.slice(0, s2 - 1).concat({
                        value: " " === e2[s2 - 2].type ? "*" : ""
                    })).replace($, "$1"), t2, s2 < n2 && Ee(e2.slice(s2, n2)), n2 < r2 && Ee(e2 = e2.slice(n2)), n2 < r2 && xe(e2));
                }
                c2.push(t2);
            }
            return we(c2);
        }
        return me.prototype = b1.filters = b1.pseudos, b1.setFilters = new me, h = se.tokenize = function(e2, t2) {
            var n2, r2, i3, o3, a2, s2, u2, l2 = x1[e2 + " "];
            if (l2) return t2 ? 0 : l2.slice(0);
            a2 = e2, s2 = [], u2 = b1.preFilter;
            while(a2){
                for(o3 in n2 && !(r2 = _.exec(a2)) || (r2 && (a2 = a2.slice(r2[0].length) || a2), s2.push(i3 = [])), n2 = !1, (r2 = z.exec(a2)) && (n2 = r2.shift(), i3.push({
                    value: n2,
                    type: r2[0].replace($, " ")
                }), a2 = a2.slice(n2.length)), b1.filter)!(r2 = G[o3].exec(a2)) || u2[o3] && !(r2 = u2[o3](r2)) || (n2 = r2.shift(), i3.push({
                    value: n2,
                    type: o3,
                    matches: r2
                }), a2 = a2.slice(n2.length));
                if (!n2) break;
            }
            return t2 ? a2.length : a2 ? se.error(e2) : x1(e2, s2).slice(0);
        }, f1 = se.compile = function(e2, t2) {
            var n2, v2, y2, m2, x2, r2, i3 = [], o3 = [], a2 = A[e2 + " "];
            if (!a2) {
                t2 || (t2 = h(e2)), n2 = t2.length;
                while(n2--)(a2 = Ee(t2[n2]))[S1] ? i3.push(a2) : o3.push(a2);
                (a2 = A(e2, (v2 = o3, m2 = 0 < (y2 = i3).length, x2 = 0 < v2.length, r2 = function(e3, t3, n5, r4, i4) {
                    var o4, a3, s2, u2 = 0, l2 = "0", c2 = e3 && [], f2 = [], p2 = w1, d2 = e3 || x2 && b1.find.TAG("*", i4), h1 = k += null == p2 ? 1 : Math.random() || 0.1, g2 = d2.length;
                    for(i4 && (w1 = t3 == C1 || t3 || i4); l2 !== g2 && null != (o4 = d2[l2]); l2++){
                        if (x2 && o4) {
                            a3 = 0, t3 || o4.ownerDocument == C1 || (T(o4), n5 = !E1);
                            while(s2 = v2[a3++])if (s2(o4, t3 || C1, n5)) {
                                r4.push(o4);
                                break;
                            }
                            i4 && (k = h1);
                        }
                        m2 && ((o4 = !s2 && o4) && u2--, e3 && c2.push(o4));
                    }
                    if (u2 += l2, m2 && l2 !== u2) {
                        a3 = 0;
                        while(s2 = y2[a3++])s2(c2, f2, t3, n5);
                        if (e3) {
                            if (0 < u2) while(l2--)c2[l2] || f2[l2] || (f2[l2] = q.call(r4));
                            f2 = Te(f2);
                        }
                        H.apply(r4, f2), i4 && !e3 && 0 < f2.length && 1 < u2 + y2.length && se.uniqueSort(r4);
                    }
                    return i4 && (k = h1, w1 = p2), c2;
                }, m2 ? le(r2) : r2))).selector = e2;
            }
            return a2;
        }, g1 = se.select = function(e2, t2, n2, r2) {
            var i3, o3, a2, s2, u2, l2 = "function" == typeof e2 && e2, c2 = !r2 && h(e2 = l2.selector || e2);
            if (n2 = n2 || [], 1 === c2.length) {
                if (2 < (o3 = c2[0] = c2[0].slice(0)).length && "ID" === (a2 = o3[0]).type && 9 === t2.nodeType && E1 && b1.relative[o3[1].type]) {
                    if (!(t2 = (b1.find.ID(a2.matches[0].replace(te, ne), t2) || [])[0])) return n2;
                    l2 && (t2 = t2.parentNode), e2 = e2.slice(o3.shift().value.length);
                }
                i3 = G.needsContext.test(e2) ? 0 : o3.length;
                while(i3--){
                    if (a2 = o3[i3], b1.relative[s2 = a2.type]) break;
                    if ((u2 = b1.find[s2]) && (r2 = u2(a2.matches[0].replace(te, ne), ee.test(o3[0].type) && ye(t2.parentNode) || t2))) {
                        if (o3.splice(i3, 1), !(e2 = r2.length && xe(o3))) return H.apply(n2, r2), n2;
                        break;
                    }
                }
            }
            return (l2 || f1(e2, c2))(r2, t2, !E1, n2, !t2 || ee.test(e2) && ye(t2.parentNode) || t2), n2;
        }, d1.sortStable = S1.split("").sort(j).join("") === S1, d1.detectDuplicates = !!l1, T(), d1.sortDetached = ce(function(e2) {
            return 1 & e2.compareDocumentPosition(C1.createElement("fieldset"));
        }), ce(function(e2) {
            return e2.innerHTML = "<a href='#'></a>", "#" === e2.firstChild.getAttribute("href");
        }) || fe("type|href|height|width", function(e2, t2, n2) {
            if (!n2) return e2.getAttribute(t2, "type" === t2.toLowerCase() ? 1 : 2);
        }), d1.attributes && ce(function(e2) {
            return e2.innerHTML = "<input/>", e2.firstChild.setAttribute("value", ""), "" === e2.firstChild.getAttribute("value");
        }) || fe("value", function(e2, t2, n2) {
            if (!n2 && "input" === e2.nodeName.toLowerCase()) return e2.defaultValue;
        }), ce(function(e2) {
            return null == e2.getAttribute("disabled");
        }) || fe(R, function(e2, t2, n2) {
            var r2;
            if (!n2) return !0 === e2[t2] ? t2.toLowerCase() : (r2 = e2.getAttributeNode(t2)) && r2.specified ? r2.value : null;
        }), se;
    }(C);
    S.find = d, S.expr = d.selectors, S.expr[":"] = S.expr.pseudos, S.uniqueSort = S.unique = d.uniqueSort, S.text = d.getText, S.isXMLDoc = d.isXML, S.contains = d.contains, S.escapeSelector = d.escape;
    var h = function(e1, t1, n1) {
        var r1 = [], i1 = (void 0) !== n1;
        while((e1 = e1[t1]) && 9 !== e1.nodeType)if (1 === e1.nodeType) {
            if (i1 && S(e1).is(n1)) break;
            r1.push(e1);
        }
        return r1;
    }, T = function(e1, t1) {
        for(var n1 = []; e1; e1 = e1.nextSibling)1 === e1.nodeType && e1 !== t1 && n1.push(e1);
        return n1;
    }, k = S.expr.match.needsContext;
    function A(e1, t1) {
        return e1.nodeName && e1.nodeName.toLowerCase() === t1.toLowerCase();
    }
    var N = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;
    function j(e1, n1, r1) {
        return m(n1) ? S.grep(e1, function(e2, t1) {
            return !!n1.call(e2, t1, e2) !== r1;
        }) : n1.nodeType ? S.grep(e1, function(e2) {
            return e2 === n1 !== r1;
        }) : "string" != typeof n1 ? S.grep(e1, function(e2) {
            return -1 < i1.call(n1, e2) !== r1;
        }) : S.filter(n1, e1, r1);
    }
    S.filter = function(e1, t1, n1) {
        var r1 = t1[0];
        return n1 && (e1 = ":not(" + e1 + ")"), 1 === t1.length && 1 === r1.nodeType ? S.find.matchesSelector(r1, e1) ? [
            r1
        ] : [] : S.find.matches(e1, S.grep(t1, function(e2) {
            return 1 === e2.nodeType;
        }));
    }, S.fn.extend({
        find: function(e1) {
            var t1, n1, r1 = this.length, i1 = this;
            if ("string" != typeof e1) return this.pushStack(S(e1).filter(function() {
                for(t1 = 0; t1 < r1; t1++)if (S.contains(i1[t1], this)) return !0;
            }));
            for(n1 = this.pushStack([]), t1 = 0; t1 < r1; t1++)S.find(e1, i1[t1], n1);
            return 1 < r1 ? S.uniqueSort(n1) : n1;
        },
        filter: function(e1) {
            return this.pushStack(j(this, e1 || [], !1));
        },
        not: function(e1) {
            return this.pushStack(j(this, e1 || [], !0));
        },
        is: function(e1) {
            return !!j(this, "string" == typeof e1 && k.test(e1) ? S(e1) : e1 || [], !1).length;
        }
    });
    var D, q = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;
    (S.fn.init = function(e1, t1, n1) {
        var r1, i1;
        if (!e1) return this;
        if (n1 = n1 || D, "string" == typeof e1) {
            if (!(r1 = "<" === e1[0] && ">" === e1[e1.length - 1] && 3 <= e1.length ? [
                null,
                e1,
                null
            ] : q.exec(e1)) || !r1[1] && t1) return !t1 || t1.jquery ? (t1 || n1).find(e1) : this.constructor(t1).find(e1);
            if (r1[1]) {
                if (t1 = t1 instanceof S ? t1[0] : t1, S.merge(this, S.parseHTML(r1[1], t1 && t1.nodeType ? t1.ownerDocument || t1 : E, !0)), N.test(r1[1]) && S.isPlainObject(t1)) for(r1 in t1)m(this[r1]) ? this[r1](t1[r1]) : this.attr(r1, t1[r1]);
                return this;
            }
            return (i1 = E.getElementById(r1[2])) && (this[0] = i1, this.length = 1), this;
        }
        return e1.nodeType ? (this[0] = e1, this.length = 1, this) : m(e1) ? (void 0) !== n1.ready ? n1.ready(e1) : e1(S) : S.makeArray(e1, this);
    }).prototype = S.fn, D = S(E);
    var L = /^(?:parents|prev(?:Until|All))/, H = {
        children: !0,
        contents: !0,
        next: !0,
        prev: !0
    };
    function O(e1, t1) {
        while((e1 = e1[t1]) && 1 !== e1.nodeType);
        return e1;
    }
    S.fn.extend({
        has: function(e1) {
            var t1 = S(e1, this), n1 = t1.length;
            return this.filter(function() {
                for(var e2 = 0; e2 < n1; e2++)if (S.contains(this, t1[e2])) return !0;
            });
        },
        closest: function(e1, t1) {
            var n1, r1 = 0, i1 = this.length, o1 = [], a1 = "string" != typeof e1 && S(e1);
            if (!k.test(e1)) for(; r1 < i1; r1++)for(n1 = this[r1]; n1 && n1 !== t1; n1 = n1.parentNode)if (n1.nodeType < 11 && (a1 ? -1 < a1.index(n1) : 1 === n1.nodeType && S.find.matchesSelector(n1, e1))) {
                o1.push(n1);
                break;
            }
            return this.pushStack(1 < o1.length ? S.uniqueSort(o1) : o1);
        },
        index: function(e1) {
            return e1 ? "string" == typeof e1 ? i1.call(S(e1), this[0]) : i1.call(this, e1.jquery ? e1[0] : e1) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1;
        },
        add: function(e1, t1) {
            return this.pushStack(S.uniqueSort(S.merge(this.get(), S(e1, t1))));
        },
        addBack: function(e1) {
            return this.add(null == e1 ? this.prevObject : this.prevObject.filter(e1));
        }
    }), S.each({
        parent: function(e1) {
            var t1 = e1.parentNode;
            return t1 && 11 !== t1.nodeType ? t1 : null;
        },
        parents: function(e1) {
            return h(e1, "parentNode");
        },
        parentsUntil: function(e1, t1, n1) {
            return h(e1, "parentNode", n1);
        },
        next: function(e1) {
            return O(e1, "nextSibling");
        },
        prev: function(e1) {
            return O(e1, "previousSibling");
        },
        nextAll: function(e1) {
            return h(e1, "nextSibling");
        },
        prevAll: function(e1) {
            return h(e1, "previousSibling");
        },
        nextUntil: function(e1, t1, n1) {
            return h(e1, "nextSibling", n1);
        },
        prevUntil: function(e1, t1, n1) {
            return h(e1, "previousSibling", n1);
        },
        siblings: function(e1) {
            return T((e1.parentNode || {
            }).firstChild, e1);
        },
        children: function(e1) {
            return T(e1.firstChild);
        },
        contents: function(e1) {
            return null != e1.contentDocument && r1(e1.contentDocument) ? e1.contentDocument : (A(e1, "template") && (e1 = e1.content || e1), S.merge([], e1.childNodes));
        }
    }, function(r1, i1) {
        S.fn[r1] = function(e1, t1) {
            var n1 = S.map(this, i1, e1);
            return "Until" !== r1.slice(-5) && (t1 = e1), t1 && "string" == typeof t1 && (n1 = S.filter(t1, n1)), 1 < this.length && (H[r1] || S.uniqueSort(n1), L.test(r1) && n1.reverse()), this.pushStack(n1);
        };
    });
    var P = /[^\x20\t\r\n\f]+/g;
    function R(e1) {
        return e1;
    }
    function M(e1) {
        throw e1;
    }
    function I(e1, t1, n1, r1) {
        var i1;
        try {
            e1 && m(i1 = e1.promise) ? i1.call(e1).done(t1).fail(n1) : e1 && m(i1 = e1.then) ? i1.call(e1, t1, n1) : t1.apply(void 0, [
                e1
            ].slice(r1));
        } catch (e2) {
            n1.apply(void 0, [
                e2
            ]);
        }
    }
    S.Callbacks = function(r1) {
        var e1, n1;
        r1 = "string" == typeof r1 ? (e1 = r1, n1 = {
        }, S.each(e1.match(P) || [], function(e2, t1) {
            n1[t1] = !0;
        }), n1) : S.extend({
        }, r1);
        var i1, t1, o1, a1, s1 = [], u1 = [], l1 = -1, c1 = function() {
            for(a1 = a1 || r1.once, o1 = i1 = !0; u1.length; l1 = -1){
                t1 = u1.shift();
                while((++l1) < s1.length)!1 === s1[l1].apply(t1[0], t1[1]) && r1.stopOnFalse && (l1 = s1.length, t1 = !1);
            }
            r1.memory || (t1 = !1), i1 = !1, a1 && (s1 = t1 ? [] : "");
        }, f1 = {
            add: function() {
                return s1 && (t1 && !i1 && (l1 = s1.length - 1, u1.push(t1)), (function n2(e2) {
                    S.each(e2, function(e3, t2) {
                        m(t2) ? r1.unique && f1.has(t2) || s1.push(t2) : t2 && t2.length && "string" !== w(t2) && n2(t2);
                    });
                })(arguments), t1 && !i1 && c1()), this;
            },
            remove: function() {
                return S.each(arguments, function(e2, t2) {
                    var n2;
                    while(-1 < (n2 = S.inArray(t2, s1, n2)))s1.splice(n2, 1), n2 <= l1 && l1--;
                }), this;
            },
            has: function(e2) {
                return e2 ? -1 < S.inArray(e2, s1) : 0 < s1.length;
            },
            empty: function() {
                return s1 && (s1 = []), this;
            },
            disable: function() {
                return a1 = u1 = [], s1 = t1 = "", this;
            },
            disabled: function() {
                return !s1;
            },
            lock: function() {
                return a1 = u1 = [], t1 || i1 || (s1 = t1 = ""), this;
            },
            locked: function() {
                return !!a1;
            },
            fireWith: function(e2, t2) {
                return a1 || (t2 = [
                    e2,
                    (t2 = t2 || []).slice ? t2.slice() : t2
                ], u1.push(t2), i1 || c1()), this;
            },
            fire: function() {
                return f1.fireWith(this, arguments), this;
            },
            fired: function() {
                return !!o1;
            }
        };
        return f1;
    }, S.extend({
        Deferred: function(e1) {
            var o1 = [
                [
                    "notify",
                    "progress",
                    S.Callbacks("memory"),
                    S.Callbacks("memory"),
                    2
                ],
                [
                    "resolve",
                    "done",
                    S.Callbacks("once memory"),
                    S.Callbacks("once memory"),
                    0,
                    "resolved"
                ],
                [
                    "reject",
                    "fail",
                    S.Callbacks("once memory"),
                    S.Callbacks("once memory"),
                    1,
                    "rejected"
                ]
            ], i1 = "pending", a1 = {
                state: function() {
                    return i1;
                },
                always: function() {
                    return s2.done(arguments).fail(arguments), this;
                },
                "catch": function(e2) {
                    return a1.then(null, e2);
                },
                pipe: function() {
                    var i3 = arguments;
                    return S.Deferred(function(r1) {
                        S.each(o1, function(e2, t1) {
                            var n1 = m(i3[t1[4]]) && i3[t1[4]];
                            s2[t1[1]](function() {
                                var e3 = n1 && n1.apply(this, arguments);
                                e3 && m(e3.promise) ? e3.promise().progress(r1.notify).done(r1.resolve).fail(r1.reject) : r1[t1[0] + "With"](this, n1 ? [
                                    e3
                                ] : arguments);
                            });
                        }), i3 = null;
                    }).promise();
                },
                then: function(t1, n1, r1) {
                    var u1 = 0;
                    function l1(i3, o3, a2, s2) {
                        return function() {
                            var n2 = this, r2 = arguments, e2 = function() {
                                var e3, t2;
                                if (!(i3 < u1)) {
                                    if ((e3 = a2.apply(n2, r2)) === o3.promise()) throw new TypeError("Thenable self-resolution");
                                    t2 = e3 && ("object" == typeof e3 || "function" == typeof e3) && e3.then, m(t2) ? s2 ? t2.call(e3, l1(u1, o3, R, s2), l1(u1, o3, M, s2)) : (u1++, t2.call(e3, l1(u1, o3, R, s2), l1(u1, o3, M, s2), l1(u1, o3, R, o3.notifyWith))) : (a2 !== R && (n2 = void 0, r2 = [
                                        e3
                                    ]), (s2 || o3.resolveWith)(n2, r2));
                                }
                            }, t2 = s2 ? e2 : function() {
                                try {
                                    e2();
                                } catch (e3) {
                                    S.Deferred.exceptionHook && S.Deferred.exceptionHook(e3, t2.stackTrace), u1 <= i3 + 1 && (a2 !== M && (n2 = void 0, r2 = [
                                        e3
                                    ]), o3.rejectWith(n2, r2));
                                }
                            };
                            i3 ? t2() : (S.Deferred.getStackHook && (t2.stackTrace = S.Deferred.getStackHook()), C.setTimeout(t2));
                        };
                    }
                    return S.Deferred(function(e2) {
                        o1[0][3].add(l1(0, e2, m(r1) ? r1 : R, e2.notifyWith)), o1[1][3].add(l1(0, e2, m(t1) ? t1 : R)), o1[2][3].add(l1(0, e2, m(n1) ? n1 : M));
                    }).promise();
                },
                promise: function(e2) {
                    return null != e2 ? S.extend(e2, a1) : a1;
                }
            }, s2 = {
            };
            return S.each(o1, function(e2, t1) {
                var n1 = t1[2], r1 = t1[5];
                a1[t1[1]] = n1.add, r1 && n1.add(function() {
                    i1 = r1;
                }, o1[3 - e2][2].disable, o1[3 - e2][3].disable, o1[0][2].lock, o1[0][3].lock), n1.add(t1[3].fire), s2[t1[0]] = function() {
                    return s2[t1[0] + "With"](this === s2 ? void 0 : this, arguments), this;
                }, s2[t1[0] + "With"] = n1.fireWith;
            }), a1.promise(s2), e1 && e1.call(s2, s2), s2;
        },
        when: function(e1) {
            var n1 = arguments.length, t1 = n1, r1 = Array(t1), i1 = s1.call(arguments), o1 = S.Deferred(), a1 = function(t2) {
                return function(e2) {
                    r1[t2] = this, i1[t2] = 1 < arguments.length ? s1.call(arguments) : e2, (--n1) || o1.resolveWith(r1, i1);
                };
            };
            if (n1 <= 1 && (I(e1, o1.done(a1(t1)).resolve, o1.reject, !n1), "pending" === o1.state() || m(i1[t1] && i1[t1].then))) return o1.then();
            while(t1--)I(i1[t1], a1(t1), o1.reject);
            return o1.promise();
        }
    });
    var W = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;
    S.Deferred.exceptionHook = function(e1, t1) {
        C.console && C.console.warn && e1 && W.test(e1.name) && C.console.warn("jQuery.Deferred exception: " + e1.message, e1.stack, t1);
    }, S.readyException = function(e1) {
        C.setTimeout(function() {
            throw e1;
        });
    };
    var F = S.Deferred();
    function B() {
        E.removeEventListener("DOMContentLoaded", B), C.removeEventListener("load", B), S.ready();
    }
    S.fn.ready = function(e1) {
        return F.then(e1)["catch"](function(e2) {
            S.readyException(e2);
        }), this;
    }, S.extend({
        isReady: !1,
        readyWait: 1,
        ready: function(e1) {
            (!0 === e1 ? --S.readyWait : S.isReady) || (S.isReady = !0) !== e1 && 0 < --S.readyWait || F.resolveWith(E, [
                S
            ]);
        }
    }), S.ready.then = F.then, "complete" === E.readyState || "loading" !== E.readyState && !E.documentElement.doScroll ? C.setTimeout(S.ready) : (E.addEventListener("DOMContentLoaded", B), C.addEventListener("load", B));
    var $ = function(e1, t1, n1, r1, i1, o1, a1) {
        var s2 = 0, u1 = e1.length, l1 = null == n1;
        if ("object" === w(n1)) for(s2 in i1 = !0, n1)$(e1, t1, s2, n1[s2], !0, o1, a1);
        else if ((void 0) !== r1 && (i1 = !0, m(r1) || (a1 = !0), l1 && (a1 ? (t1.call(e1, r1), t1 = null) : (l1 = t1, t1 = function(e2, t2, n2) {
            return l1.call(S(e2), n2);
        })), t1)) for(; s2 < u1; s2++)t1(e1[s2], n1, a1 ? r1 : r1.call(e1[s2], s2, t1(e1[s2], n1)));
        return i1 ? e1 : l1 ? t1.call(e1) : u1 ? t1(e1[0], n1) : o1;
    }, _ = /^-ms-/, z = /-([a-z])/g;
    function U(e1, t1) {
        return t1.toUpperCase();
    }
    function X(e1) {
        return e1.replace(_, "ms-").replace(z, U);
    }
    var V = function(e1) {
        return 1 === e1.nodeType || 9 === e1.nodeType || !+e1.nodeType;
    };
    function G() {
        this.expando = S.expando + G.uid++;
    }
    G.uid = 1, G.prototype = {
        cache: function(e1) {
            var t1 = e1[this.expando];
            return t1 || (t1 = {
            }, V(e1) && (e1.nodeType ? e1[this.expando] = t1 : Object.defineProperty(e1, this.expando, {
                value: t1,
                configurable: !0
            }))), t1;
        },
        set: function(e1, t1, n1) {
            var r1, i1 = this.cache(e1);
            if ("string" == typeof t1) i1[X(t1)] = n1;
            else for(r1 in t1)i1[X(r1)] = t1[r1];
            return i1;
        },
        get: function(e1, t1) {
            return (void 0) === t1 ? this.cache(e1) : e1[this.expando] && e1[this.expando][X(t1)];
        },
        access: function(e1, t1, n1) {
            return (void 0) === t1 || t1 && "string" == typeof t1 && (void 0) === n1 ? this.get(e1, t1) : (this.set(e1, t1, n1), (void 0) !== n1 ? n1 : t1);
        },
        remove: function(e1, t1) {
            var n1, r1 = e1[this.expando];
            if ((void 0) !== r1) {
                if ((void 0) !== t1) {
                    n1 = (t1 = Array.isArray(t1) ? t1.map(X) : (t1 = X(t1)) in r1 ? [
                        t1
                    ] : t1.match(P) || []).length;
                    while(n1--)delete r1[t1[n1]];
                }
                ((void 0) === t1 || S.isEmptyObject(r1)) && (e1.nodeType ? e1[this.expando] = void 0 : delete e1[this.expando]);
            }
        },
        hasData: function(e1) {
            var t1 = e1[this.expando];
            return (void 0) !== t1 && !S.isEmptyObject(t1);
        }
    };
    var Y = new G, Q = new G, J = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/, K = /[A-Z]/g;
    function Z(e1, t1, n1) {
        var r1, i1;
        if ((void 0) === n1 && 1 === e1.nodeType) {
            if (r1 = "data-" + t1.replace(K, "-$&").toLowerCase(), "string" == typeof (n1 = e1.getAttribute(r1))) {
                try {
                    n1 = "true" === (i1 = n1) || "false" !== i1 && ("null" === i1 ? null : i1 === +i1 + "" ? +i1 : J.test(i1) ? JSON.parse(i1) : i1);
                } catch (e2) {
                }
                Q.set(e1, t1, n1);
            } else n1 = void 0;
        }
        return n1;
    }
    S.extend({
        hasData: function(e1) {
            return Q.hasData(e1) || Y.hasData(e1);
        },
        data: function(e1, t1, n1) {
            return Q.access(e1, t1, n1);
        },
        removeData: function(e1, t1) {
            Q.remove(e1, t1);
        },
        _data: function(e1, t1, n1) {
            return Y.access(e1, t1, n1);
        },
        _removeData: function(e1, t1) {
            Y.remove(e1, t1);
        }
    }), S.fn.extend({
        data: function(n1, e1) {
            var t1, r1, i1, o1 = this[0], a1 = o1 && o1.attributes;
            if ((void 0) === n1) {
                if (this.length && (i1 = Q.get(o1), 1 === o1.nodeType && !Y.get(o1, "hasDataAttrs"))) {
                    t1 = a1.length;
                    while(t1--)a1[t1] && 0 === (r1 = a1[t1].name).indexOf("data-") && (r1 = X(r1.slice(5)), Z(o1, r1, i1[r1]));
                    Y.set(o1, "hasDataAttrs", !0);
                }
                return i1;
            }
            return "object" == typeof n1 ? this.each(function() {
                Q.set(this, n1);
            }) : $(this, function(e2) {
                var t2;
                if (o1 && (void 0) === e2) return (void 0) !== (t2 = Q.get(o1, n1)) ? t2 : (void 0) !== (t2 = Z(o1, n1)) ? t2 : void 0;
                this.each(function() {
                    Q.set(this, n1, e2);
                });
            }, null, e1, 1 < arguments.length, null, !0);
        },
        removeData: function(e1) {
            return this.each(function() {
                Q.remove(this, e1);
            });
        }
    }), S.extend({
        queue: function(e1, t1, n1) {
            var r1;
            if (e1) return t1 = (t1 || "fx") + "queue", r1 = Y.get(e1, t1), n1 && (!r1 || Array.isArray(n1) ? r1 = Y.access(e1, t1, S.makeArray(n1)) : r1.push(n1)), r1 || [];
        },
        dequeue: function(e1, t1) {
            t1 = t1 || "fx";
            var n1 = S.queue(e1, t1), r1 = n1.length, i1 = n1.shift(), o1 = S._queueHooks(e1, t1);
            "inprogress" === i1 && (i1 = n1.shift(), r1--), i1 && ("fx" === t1 && n1.unshift("inprogress"), delete o1.stop, i1.call(e1, function() {
                S.dequeue(e1, t1);
            }, o1)), !r1 && o1 && o1.empty.fire();
        },
        _queueHooks: function(e1, t1) {
            var n1 = t1 + "queueHooks";
            return Y.get(e1, n1) || Y.access(e1, n1, {
                empty: S.Callbacks("once memory").add(function() {
                    Y.remove(e1, [
                        t1 + "queue",
                        n1
                    ]);
                })
            });
        }
    }), S.fn.extend({
        queue: function(t1, n1) {
            var e1 = 2;
            return "string" != typeof t1 && (n1 = t1, t1 = "fx", e1--), arguments.length < e1 ? S.queue(this[0], t1) : (void 0) === n1 ? this : this.each(function() {
                var e2 = S.queue(this, t1, n1);
                S._queueHooks(this, t1), "fx" === t1 && "inprogress" !== e2[0] && S.dequeue(this, t1);
            });
        },
        dequeue: function(e1) {
            return this.each(function() {
                S.dequeue(this, e1);
            });
        },
        clearQueue: function(e1) {
            return this.queue(e1 || "fx", []);
        },
        promise: function(e1, t1) {
            var n1, r1 = 1, i1 = S.Deferred(), o1 = this, a1 = this.length, s2 = function() {
                (--r1) || i1.resolveWith(o1, [
                    o1
                ]);
            };
            "string" != typeof e1 && (t1 = e1, e1 = void 0), e1 = e1 || "fx";
            while(a1--)(n1 = Y.get(o1[a1], e1 + "queueHooks")) && n1.empty && (r1++, n1.empty.add(s2));
            return s2(), i1.promise(t1);
        }
    });
    var ee = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source, te = new RegExp("^(?:([+-])=|)(" + ee + ")([a-z%]*)$", "i"), ne = [
        "Top",
        "Right",
        "Bottom",
        "Left"
    ], re = E.documentElement, ie = function(e1) {
        return S.contains(e1.ownerDocument, e1);
    }, oe = {
        composed: !0
    };
    re.getRootNode && (ie = function(e1) {
        return S.contains(e1.ownerDocument, e1) || e1.getRootNode(oe) === e1.ownerDocument;
    });
    var ae = function(e1, t1) {
        return "none" === (e1 = t1 || e1).style.display || "" === e1.style.display && ie(e1) && "none" === S.css(e1, "display");
    };
    function se(e1, t1, n1, r1) {
        var i1, o1, a1 = 20, s2 = r1 ? function() {
            return r1.cur();
        } : function() {
            return S.css(e1, t1, "");
        }, u1 = s2(), l1 = n1 && n1[3] || (S.cssNumber[t1] ? "" : "px"), c1 = e1.nodeType && (S.cssNumber[t1] || "px" !== l1 && +u1) && te.exec(S.css(e1, t1));
        if (c1 && c1[3] !== l1) {
            u1 /= 2, l1 = l1 || c1[3], c1 = +u1 || 1;
            while(a1--)S.style(e1, t1, c1 + l1), (1 - o1) * (1 - (o1 = s2() / u1 || 0.5)) <= 0 && (a1 = 0), c1 /= o1;
            c1 *= 2, S.style(e1, t1, c1 + l1), n1 = n1 || [];
        }
        return n1 && (c1 = +c1 || +u1 || 0, i1 = n1[1] ? c1 + (n1[1] + 1) * n1[2] : +n1[2], r1 && (r1.unit = l1, r1.start = c1, r1.end = i1)), i1;
    }
    var ue = {
    };
    function le(e1, t1) {
        for(var n1, r1, i1, o1, a1, s2, u1, l1 = [], c1 = 0, f1 = e1.length; c1 < f1; c1++)(r1 = e1[c1]).style && (n1 = r1.style.display, t1 ? ("none" === n1 && (l1[c1] = Y.get(r1, "display") || null, l1[c1] || (r1.style.display = "")), "" === r1.style.display && ae(r1) && (l1[c1] = (u1 = a1 = o1 = void 0, a1 = (i1 = r1).ownerDocument, s2 = i1.nodeName, (u1 = ue[s2]) || (o1 = a1.body.appendChild(a1.createElement(s2)), u1 = S.css(o1, "display"), o1.parentNode.removeChild(o1), "none" === u1 && (u1 = "block"), ue[s2] = u1)))) : "none" !== n1 && (l1[c1] = "none", Y.set(r1, "display", n1)));
        for(c1 = 0; c1 < f1; c1++)null != l1[c1] && (e1[c1].style.display = l1[c1]);
        return e1;
    }
    S.fn.extend({
        show: function() {
            return le(this, !0);
        },
        hide: function() {
            return le(this);
        },
        toggle: function(e1) {
            return "boolean" == typeof e1 ? e1 ? this.show() : this.hide() : this.each(function() {
                ae(this) ? S(this).show() : S(this).hide();
            });
        }
    });
    var ce, fe, pe = /^(?:checkbox|radio)$/i, de = /<([a-z][^\/\0>\x20\t\r\n\f]*)/i, he = /^$|^module$|\/(?:java|ecma)script/i;
    ce = E.createDocumentFragment().appendChild(E.createElement("div")), (fe = E.createElement("input")).setAttribute("type", "radio"), fe.setAttribute("checked", "checked"), fe.setAttribute("name", "t"), ce.appendChild(fe), y.checkClone = ce.cloneNode(!0).cloneNode(!0).lastChild.checked, ce.innerHTML = "<textarea>x</textarea>", y.noCloneChecked = !!ce.cloneNode(!0).lastChild.defaultValue, ce.innerHTML = "<option></option>", y.option = !!ce.lastChild;
    var ge = {
        thead: [
            1,
            "<table>",
            "</table>"
        ],
        col: [
            2,
            "<table><colgroup>",
            "</colgroup></table>"
        ],
        tr: [
            2,
            "<table><tbody>",
            "</tbody></table>"
        ],
        td: [
            3,
            "<table><tbody><tr>",
            "</tr></tbody></table>"
        ],
        _default: [
            0,
            "",
            ""
        ]
    };
    function ve(e1, t1) {
        var n1;
        return n1 = "undefined" != typeof e1.getElementsByTagName ? e1.getElementsByTagName(t1 || "*") : "undefined" != typeof e1.querySelectorAll ? e1.querySelectorAll(t1 || "*") : [], (void 0) === t1 || t1 && A(e1, t1) ? S.merge([
            e1
        ], n1) : n1;
    }
    function ye(e1, t1) {
        for(var n1 = 0, r1 = e1.length; n1 < r1; n1++)Y.set(e1[n1], "globalEval", !t1 || Y.get(t1[n1], "globalEval"));
    }
    ge.tbody = ge.tfoot = ge.colgroup = ge.caption = ge.thead, ge.th = ge.td, y.option || (ge.optgroup = ge.option = [
        1,
        "<select multiple='multiple'>",
        "</select>"
    ]);
    var me = /<|&#?\w+;/;
    function xe(e1, t1, n1, r1, i1) {
        for(var o1, a1, s2, u1, l1, c1, f1 = t1.createDocumentFragment(), p1 = [], d1 = 0, h1 = e1.length; d1 < h1; d1++)if ((o1 = e1[d1]) || 0 === o1) {
            if ("object" === w(o1)) S.merge(p1, o1.nodeType ? [
                o1
            ] : o1);
            else if (me.test(o1)) {
                a1 = a1 || f1.appendChild(t1.createElement("div")), s2 = (de.exec(o1) || [
                    "",
                    ""
                ])[1].toLowerCase(), u1 = ge[s2] || ge._default, a1.innerHTML = u1[1] + S.htmlPrefilter(o1) + u1[2], c1 = u1[0];
                while(c1--)a1 = a1.lastChild;
                S.merge(p1, a1.childNodes), (a1 = f1.firstChild).textContent = "";
            } else p1.push(t1.createTextNode(o1));
        }
        f1.textContent = "", d1 = 0;
        while(o1 = p1[d1++])if (r1 && -1 < S.inArray(o1, r1)) i1 && i1.push(o1);
        else if (l1 = ie(o1), a1 = ve(f1.appendChild(o1), "script"), l1 && ye(a1), n1) {
            c1 = 0;
            while(o1 = a1[c1++])he.test(o1.type || "") && n1.push(o1);
        }
        return f1;
    }
    var be = /^([^.]*)(?:\.(.+)|)/;
    function we() {
        return !0;
    }
    function Te() {
        return !1;
    }
    function Ce(e1, t1) {
        return e1 === (function() {
            try {
                return E.activeElement;
            } catch (e2) {
            }
        })() == ("focus" === t1);
    }
    function Ee(e1, t1, n1, r1, i1, o1) {
        var a1, s2;
        if ("object" == typeof t1) {
            for(s2 in "string" != typeof n1 && (r1 = r1 || n1, n1 = void 0), t1)Ee(e1, s2, n1, r1, t1[s2], o1);
            return e1;
        }
        if (null == r1 && null == i1 ? (i1 = n1, r1 = n1 = void 0) : null == i1 && ("string" == typeof n1 ? (i1 = r1, r1 = void 0) : (i1 = r1, r1 = n1, n1 = void 0)), !1 === i1) i1 = Te;
        else if (!i1) return e1;
        return 1 === o1 && (a1 = i1, (i1 = function(e2) {
            return S().off(e2), a1.apply(this, arguments);
        }).guid = a1.guid || (a1.guid = S.guid++)), e1.each(function() {
            S.event.add(this, t1, i1, r1, n1);
        });
    }
    function Se(e1, i1, o1) {
        o1 ? (Y.set(e1, i1, !1), S.event.add(e1, i1, {
            namespace: !1,
            handler: function(e2) {
                var t1, n1, r1 = Y.get(this, i1);
                if (1 & e2.isTrigger && this[i1]) {
                    if (r1.length) (S.event.special[i1] || {
                    }).delegateType && e2.stopPropagation();
                    else if (r1 = s1.call(arguments), Y.set(this, i1, r1), t1 = o1(this, i1), this[i1](), r1 !== (n1 = Y.get(this, i1)) || t1 ? Y.set(this, i1, !1) : n1 = {
                    }, r1 !== n1) return e2.stopImmediatePropagation(), e2.preventDefault(), n1 && n1.value;
                } else r1.length && (Y.set(this, i1, {
                    value: S.event.trigger(S.extend(r1[0], S.Event.prototype), r1.slice(1), this)
                }), e2.stopImmediatePropagation());
            }
        })) : (void 0) === Y.get(e1, i1) && S.event.add(e1, i1, we);
    }
    S.event = {
        global: {
        },
        add: function(t1, e1, n1, r1, i1) {
            var o1, a1, s2, u1, l1, c1, f1, p1, d1, h1, g1, v1 = Y.get(t1);
            if (V(t1)) {
                n1.handler && (n1 = (o1 = n1).handler, i1 = o1.selector), i1 && S.find.matchesSelector(re, i1), n1.guid || (n1.guid = S.guid++), (u1 = v1.events) || (u1 = v1.events = Object.create(null)), (a1 = v1.handle) || (a1 = v1.handle = function(e2) {
                    return "undefined" != typeof S && S.event.triggered !== e2.type ? S.event.dispatch.apply(t1, arguments) : void 0;
                }), l1 = (e1 = (e1 || "").match(P) || [
                    ""
                ]).length;
                while(l1--)d1 = g1 = (s2 = be.exec(e1[l1]) || [])[1], h1 = (s2[2] || "").split(".").sort(), d1 && (f1 = S.event.special[d1] || {
                }, d1 = (i1 ? f1.delegateType : f1.bindType) || d1, f1 = S.event.special[d1] || {
                }, c1 = S.extend({
                    type: d1,
                    origType: g1,
                    data: r1,
                    handler: n1,
                    guid: n1.guid,
                    selector: i1,
                    needsContext: i1 && S.expr.match.needsContext.test(i1),
                    namespace: h1.join(".")
                }, o1), (p1 = u1[d1]) || ((p1 = u1[d1] = []).delegateCount = 0, f1.setup && !1 !== f1.setup.call(t1, r1, h1, a1) || t1.addEventListener && t1.addEventListener(d1, a1)), f1.add && (f1.add.call(t1, c1), c1.handler.guid || (c1.handler.guid = n1.guid)), i1 ? p1.splice(p1.delegateCount++, 0, c1) : p1.push(c1), S.event.global[d1] = !0);
            }
        },
        remove: function(e1, t1, n1, r1, i1) {
            var o1, a1, s2, u1, l1, c1, f1, p1, d1, h1, g1, v1 = Y.hasData(e1) && Y.get(e1);
            if (v1 && (u1 = v1.events)) {
                l1 = (t1 = (t1 || "").match(P) || [
                    ""
                ]).length;
                while(l1--)if (d1 = g1 = (s2 = be.exec(t1[l1]) || [])[1], h1 = (s2[2] || "").split(".").sort(), d1) {
                    f1 = S.event.special[d1] || {
                    }, p1 = u1[d1 = (r1 ? f1.delegateType : f1.bindType) || d1] || [], s2 = s2[2] && new RegExp("(^|\\.)" + h1.join("\\.(?:.*\\.|)") + "(\\.|$)"), a1 = o1 = p1.length;
                    while(o1--)c1 = p1[o1], !i1 && g1 !== c1.origType || n1 && n1.guid !== c1.guid || s2 && !s2.test(c1.namespace) || r1 && r1 !== c1.selector && ("**" !== r1 || !c1.selector) || (p1.splice(o1, 1), c1.selector && p1.delegateCount--, f1.remove && f1.remove.call(e1, c1));
                    a1 && !p1.length && (f1.teardown && !1 !== f1.teardown.call(e1, h1, v1.handle) || S.removeEvent(e1, d1, v1.handle), delete u1[d1]);
                } else for(d1 in u1)S.event.remove(e1, d1 + t1[l1], n1, r1, !0);
                S.isEmptyObject(u1) && Y.remove(e1, "handle events");
            }
        },
        dispatch: function(e1) {
            var t1, n1, r1, i1, o1, a1, s2 = new Array(arguments.length), u1 = S.event.fix(e1), l1 = (Y.get(this, "events") || Object.create(null))[u1.type] || [], c1 = S.event.special[u1.type] || {
            };
            for(s2[0] = u1, t1 = 1; t1 < arguments.length; t1++)s2[t1] = arguments[t1];
            if (u1.delegateTarget = this, !c1.preDispatch || !1 !== c1.preDispatch.call(this, u1)) {
                a1 = S.event.handlers.call(this, u1, l1), t1 = 0;
                while((i1 = a1[t1++]) && !u1.isPropagationStopped()){
                    u1.currentTarget = i1.elem, n1 = 0;
                    while((o1 = i1.handlers[n1++]) && !u1.isImmediatePropagationStopped())u1.rnamespace && !1 !== o1.namespace && !u1.rnamespace.test(o1.namespace) || (u1.handleObj = o1, u1.data = o1.data, (void 0) !== (r1 = ((S.event.special[o1.origType] || {
                    }).handle || o1.handler).apply(i1.elem, s2)) && !1 === (u1.result = r1) && (u1.preventDefault(), u1.stopPropagation()));
                }
                return c1.postDispatch && c1.postDispatch.call(this, u1), u1.result;
            }
        },
        handlers: function(e1, t1) {
            var n1, r1, i1, o1, a1, s2 = [], u1 = t1.delegateCount, l1 = e1.target;
            if (u1 && l1.nodeType && !("click" === e1.type && 1 <= e1.button)) for(; l1 !== this; l1 = l1.parentNode || this)if (1 === l1.nodeType && ("click" !== e1.type || !0 !== l1.disabled)) {
                for(o1 = [], a1 = {
                }, n1 = 0; n1 < u1; n1++)(void 0) === a1[i1 = (r1 = t1[n1]).selector + " "] && (a1[i1] = r1.needsContext ? -1 < S(i1, this).index(l1) : S.find(i1, this, null, [
                    l1
                ]).length), a1[i1] && o1.push(r1);
                o1.length && s2.push({
                    elem: l1,
                    handlers: o1
                });
            }
            return l1 = this, u1 < t1.length && s2.push({
                elem: l1,
                handlers: t1.slice(u1)
            }), s2;
        },
        addProp: function(t1, e1) {
            Object.defineProperty(S.Event.prototype, t1, {
                enumerable: !0,
                configurable: !0,
                get: m(e1) ? function() {
                    if (this.originalEvent) return e1(this.originalEvent);
                } : function() {
                    if (this.originalEvent) return this.originalEvent[t1];
                },
                set: function(e2) {
                    Object.defineProperty(this, t1, {
                        enumerable: !0,
                        configurable: !0,
                        writable: !0,
                        value: e2
                    });
                }
            });
        },
        fix: function(e1) {
            return e1[S.expando] ? e1 : new S.Event(e1);
        },
        special: {
            load: {
                noBubble: !0
            },
            click: {
                setup: function(e1) {
                    var t1 = this || e1;
                    return pe.test(t1.type) && t1.click && A(t1, "input") && Se(t1, "click", we), !1;
                },
                trigger: function(e1) {
                    var t1 = this || e1;
                    return pe.test(t1.type) && t1.click && A(t1, "input") && Se(t1, "click"), !0;
                },
                _default: function(e1) {
                    var t1 = e1.target;
                    return pe.test(t1.type) && t1.click && A(t1, "input") && Y.get(t1, "click") || A(t1, "a");
                }
            },
            beforeunload: {
                postDispatch: function(e1) {
                    (void 0) !== e1.result && e1.originalEvent && (e1.originalEvent.returnValue = e1.result);
                }
            }
        }
    }, S.removeEvent = function(e1, t1, n1) {
        e1.removeEventListener && e1.removeEventListener(t1, n1);
    }, S.Event = function(e1, t1) {
        if (!(this instanceof S.Event)) return new S.Event(e1, t1);
        e1 && e1.type ? (this.originalEvent = e1, this.type = e1.type, this.isDefaultPrevented = e1.defaultPrevented || (void 0) === e1.defaultPrevented && !1 === e1.returnValue ? we : Te, this.target = e1.target && 3 === e1.target.nodeType ? e1.target.parentNode : e1.target, this.currentTarget = e1.currentTarget, this.relatedTarget = e1.relatedTarget) : this.type = e1, t1 && S.extend(this, t1), this.timeStamp = e1 && e1.timeStamp || Date.now(), this[S.expando] = !0;
    }, S.Event.prototype = {
        constructor: S.Event,
        isDefaultPrevented: Te,
        isPropagationStopped: Te,
        isImmediatePropagationStopped: Te,
        isSimulated: !1,
        preventDefault: function() {
            var e1 = this.originalEvent;
            this.isDefaultPrevented = we, e1 && !this.isSimulated && e1.preventDefault();
        },
        stopPropagation: function() {
            var e1 = this.originalEvent;
            this.isPropagationStopped = we, e1 && !this.isSimulated && e1.stopPropagation();
        },
        stopImmediatePropagation: function() {
            var e1 = this.originalEvent;
            this.isImmediatePropagationStopped = we, e1 && !this.isSimulated && e1.stopImmediatePropagation(), this.stopPropagation();
        }
    }, S.each({
        altKey: !0,
        bubbles: !0,
        cancelable: !0,
        changedTouches: !0,
        ctrlKey: !0,
        detail: !0,
        eventPhase: !0,
        metaKey: !0,
        pageX: !0,
        pageY: !0,
        shiftKey: !0,
        view: !0,
        "char": !0,
        code: !0,
        charCode: !0,
        key: !0,
        keyCode: !0,
        button: !0,
        buttons: !0,
        clientX: !0,
        clientY: !0,
        offsetX: !0,
        offsetY: !0,
        pointerId: !0,
        pointerType: !0,
        screenX: !0,
        screenY: !0,
        targetTouches: !0,
        toElement: !0,
        touches: !0,
        which: !0
    }, S.event.addProp), S.each({
        focus: "focusin",
        blur: "focusout"
    }, function(e1, t1) {
        S.event.special[e1] = {
            setup: function() {
                return Se(this, e1, Ce), !1;
            },
            trigger: function() {
                return Se(this, e1), !0;
            },
            _default: function() {
                return !0;
            },
            delegateType: t1
        };
    }), S.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout",
        pointerenter: "pointerover",
        pointerleave: "pointerout"
    }, function(e1, i1) {
        S.event.special[e1] = {
            delegateType: i1,
            bindType: i1,
            handle: function(e2) {
                var t1, n1 = e2.relatedTarget, r1 = e2.handleObj;
                return n1 && (n1 === this || S.contains(this, n1)) || (e2.type = r1.origType, t1 = r1.handler.apply(this, arguments), e2.type = i1), t1;
            }
        };
    }), S.fn.extend({
        on: function(e1, t1, n1, r1) {
            return Ee(this, e1, t1, n1, r1);
        },
        one: function(e1, t1, n1, r1) {
            return Ee(this, e1, t1, n1, r1, 1);
        },
        off: function(e1, t1, n1) {
            var r1, i1;
            if (e1 && e1.preventDefault && e1.handleObj) return r1 = e1.handleObj, S(e1.delegateTarget).off(r1.namespace ? r1.origType + "." + r1.namespace : r1.origType, r1.selector, r1.handler), this;
            if ("object" == typeof e1) {
                for(i1 in e1)this.off(i1, t1, e1[i1]);
                return this;
            }
            return !1 !== t1 && "function" != typeof t1 || (n1 = t1, t1 = void 0), !1 === n1 && (n1 = Te), this.each(function() {
                S.event.remove(this, e1, n1, t1);
            });
        }
    });
    var ke = /<script|<style|<link/i, Ae = /checked\s*(?:[^=]|=\s*.checked.)/i, Ne = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;
    function je(e1, t1) {
        return A(e1, "table") && A(11 !== t1.nodeType ? t1 : t1.firstChild, "tr") && S(e1).children("tbody")[0] || e1;
    }
    function De(e1) {
        return e1.type = (null !== e1.getAttribute("type")) + "/" + e1.type, e1;
    }
    function qe(e1) {
        return "true/" === (e1.type || "").slice(0, 5) ? e1.type = e1.type.slice(5) : e1.removeAttribute("type"), e1;
    }
    function Le(e1, t1) {
        var n1, r1, i1, o1, a1, s2;
        if (1 === t1.nodeType) {
            if (Y.hasData(e1) && (s2 = Y.get(e1).events)) for(i1 in Y.remove(t1, "handle events"), s2)for(n1 = 0, r1 = s2[i1].length; n1 < r1; n1++)S.event.add(t1, i1, s2[i1][n1]);
            Q.hasData(e1) && (o1 = Q.access(e1), a1 = S.extend({
            }, o1), Q.set(t1, a1));
        }
    }
    function He(n1, r1, i1, o1) {
        r1 = g(r1);
        var e1, t1, a1, s2, u1, l1, c1 = 0, f1 = n1.length, p1 = f1 - 1, d1 = r1[0], h1 = m(d1);
        if (h1 || 1 < f1 && "string" == typeof d1 && !y.checkClone && Ae.test(d1)) return n1.each(function(e2) {
            var t2 = n1.eq(e2);
            h1 && (r1[0] = d1.call(this, e2, t2.html())), He(t2, r1, i1, o1);
        });
        if (f1 && (t1 = (e1 = xe(r1, n1[0].ownerDocument, !1, n1, o1)).firstChild, 1 === e1.childNodes.length && (e1 = t1), t1 || o1)) {
            for(s2 = (a1 = S.map(ve(e1, "script"), De)).length; c1 < f1; c1++)u1 = e1, c1 !== p1 && (u1 = S.clone(u1, !0, !0), s2 && S.merge(a1, ve(u1, "script"))), i1.call(n1[c1], u1, c1);
            if (s2) for(l1 = a1[a1.length - 1].ownerDocument, S.map(a1, qe), c1 = 0; c1 < s2; c1++)u1 = a1[c1], he.test(u1.type || "") && !Y.access(u1, "globalEval") && S.contains(l1, u1) && (u1.src && "module" !== (u1.type || "").toLowerCase() ? S._evalUrl && !u1.noModule && S._evalUrl(u1.src, {
                nonce: u1.nonce || u1.getAttribute("nonce")
            }, l1) : b(u1.textContent.replace(Ne, ""), u1, l1));
        }
        return n1;
    }
    function Oe(e1, t1, n1) {
        for(var r1, i1 = t1 ? S.filter(t1, e1) : e1, o1 = 0; null != (r1 = i1[o1]); o1++)n1 || 1 !== r1.nodeType || S.cleanData(ve(r1)), r1.parentNode && (n1 && ie(r1) && ye(ve(r1, "script")), r1.parentNode.removeChild(r1));
        return e1;
    }
    S.extend({
        htmlPrefilter: function(e1) {
            return e1;
        },
        clone: function(e1, t1, n1) {
            var r1, i1, o1, a1, s2, u1, l1, c1 = e1.cloneNode(!0), f1 = ie(e1);
            if (!(y.noCloneChecked || 1 !== e1.nodeType && 11 !== e1.nodeType || S.isXMLDoc(e1))) for(a1 = ve(c1), r1 = 0, i1 = (o1 = ve(e1)).length; r1 < i1; r1++)s2 = o1[r1], u1 = a1[r1], "input" === (l1 = u1.nodeName.toLowerCase()) && pe.test(s2.type) ? u1.checked = s2.checked : "input" !== l1 && "textarea" !== l1 || (u1.defaultValue = s2.defaultValue);
            if (t1) {
                if (n1) for(o1 = o1 || ve(e1), a1 = a1 || ve(c1), r1 = 0, i1 = o1.length; r1 < i1; r1++)Le(o1[r1], a1[r1]);
                else Le(e1, c1);
            }
            return 0 < (a1 = ve(c1, "script")).length && ye(a1, !f1 && ve(e1, "script")), c1;
        },
        cleanData: function(e1) {
            for(var t1, n1, r1, i1 = S.event.special, o1 = 0; (void 0) !== (n1 = e1[o1]); o1++)if (V(n1)) {
                if (t1 = n1[Y.expando]) {
                    if (t1.events) for(r1 in t1.events)i1[r1] ? S.event.remove(n1, r1) : S.removeEvent(n1, r1, t1.handle);
                    n1[Y.expando] = void 0;
                }
                n1[Q.expando] && (n1[Q.expando] = void 0);
            }
        }
    }), S.fn.extend({
        detach: function(e1) {
            return Oe(this, e1, !0);
        },
        remove: function(e1) {
            return Oe(this, e1);
        },
        text: function(e1) {
            return $(this, function(e2) {
                return (void 0) === e2 ? S.text(this) : this.empty().each(function() {
                    1 !== this.nodeType && 11 !== this.nodeType && 9 !== this.nodeType || (this.textContent = e2);
                });
            }, null, e1, arguments.length);
        },
        append: function() {
            return He(this, arguments, function(e1) {
                1 !== this.nodeType && 11 !== this.nodeType && 9 !== this.nodeType || je(this, e1).appendChild(e1);
            });
        },
        prepend: function() {
            return He(this, arguments, function(e1) {
                if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                    var t1 = je(this, e1);
                    t1.insertBefore(e1, t1.firstChild);
                }
            });
        },
        before: function() {
            return He(this, arguments, function(e1) {
                this.parentNode && this.parentNode.insertBefore(e1, this);
            });
        },
        after: function() {
            return He(this, arguments, function(e1) {
                this.parentNode && this.parentNode.insertBefore(e1, this.nextSibling);
            });
        },
        empty: function() {
            for(var e1, t2 = 0; null != (e1 = this[t2]); t2++)1 === e1.nodeType && (S.cleanData(ve(e1, !1)), e1.textContent = "");
            return this;
        },
        clone: function(e1, t2) {
            return e1 = null != e1 && e1, t2 = null == t2 ? e1 : t2, this.map(function() {
                return S.clone(this, e1, t2);
            });
        },
        html: function(e1) {
            return $(this, function(e2) {
                var t2 = this[0] || {
                }, n1 = 0, r1 = this.length;
                if ((void 0) === e2 && 1 === t2.nodeType) return t2.innerHTML;
                if ("string" == typeof e2 && !ke.test(e2) && !ge[(de.exec(e2) || [
                    "",
                    ""
                ])[1].toLowerCase()]) {
                    e2 = S.htmlPrefilter(e2);
                    try {
                        for(; n1 < r1; n1++)1 === (t2 = this[n1] || {
                        }).nodeType && (S.cleanData(ve(t2, !1)), t2.innerHTML = e2);
                        t2 = 0;
                    } catch (e3) {
                    }
                }
                t2 && this.empty().append(e2);
            }, null, e1, arguments.length);
        },
        replaceWith: function() {
            var n1 = [];
            return He(this, arguments, function(e1) {
                var t2 = this.parentNode;
                S.inArray(this, n1) < 0 && (S.cleanData(ve(this)), t2 && t2.replaceChild(e1, this));
            }, n1);
        }
    }), S.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function(e1, a1) {
        S.fn[e1] = function(e2) {
            for(var t2, n1 = [], r1 = S(e2), i1 = r1.length - 1, o1 = 0; o1 <= i1; o1++)t2 = o1 === i1 ? this : this.clone(!0), S(r1[o1])[a1](t2), u1.apply(n1, t2.get());
            return this.pushStack(n1);
        };
    });
    var Pe = new RegExp("^(" + ee + ")(?!px)[a-z%]+$", "i"), Re = function(e1) {
        var t2 = e1.ownerDocument.defaultView;
        return t2 && t2.opener || (t2 = C), t2.getComputedStyle(e1);
    }, Me = function(e1, t2, n1) {
        var r1, i1, o1 = {
        };
        for(i1 in t2)o1[i1] = e1.style[i1], e1.style[i1] = t2[i1];
        for(i1 in r1 = n1.call(e1), t2)e1.style[i1] = o1[i1];
        return r1;
    }, Ie = new RegExp(ne.join("|"), "i");
    function We(e1, t2, n1) {
        var r1, i1, o1, a1, s2 = e1.style;
        return (n1 = n1 || Re(e1)) && ("" !== (a1 = n1.getPropertyValue(t2) || n1[t2]) || ie(e1) || (a1 = S.style(e1, t2)), !y.pixelBoxStyles() && Pe.test(a1) && Ie.test(t2) && (r1 = s2.width, i1 = s2.minWidth, o1 = s2.maxWidth, s2.minWidth = s2.maxWidth = s2.width = a1, a1 = n1.width, s2.width = r1, s2.minWidth = i1, s2.maxWidth = o1)), (void 0) !== a1 ? a1 + "" : a1;
    }
    function Fe(e1, t2) {
        return {
            get: function() {
                if (!e1()) return (this.get = t2).apply(this, arguments);
                delete this.get;
            }
        };
    }
    !function() {
        function e1() {
            if (l2) {
                u2.style.cssText = "position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0", l2.style.cssText = "position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%", re.appendChild(u2).appendChild(l2);
                var e2 = C.getComputedStyle(l2);
                n2 = "1%" !== e2.top, s2 = 12 === t3(e2.marginLeft), l2.style.right = "60%", o3 = 36 === t3(e2.right), r2 = 36 === t3(e2.width), l2.style.position = "absolute", i3 = 12 === t3(l2.offsetWidth / 3), re.removeChild(u2), l2 = null;
            }
        }
        function t3(e3) {
            return Math.round(parseFloat(e3));
        }
        var n2, r2, i3, o3, a1, s2, u2 = E.createElement("div"), l2 = E.createElement("div");
        l2.style && (l2.style.backgroundClip = "content-box", l2.cloneNode(!0).style.backgroundClip = "", y.clearCloneStyle = "content-box" === l2.style.backgroundClip, S.extend(y, {
            boxSizingReliable: function() {
                return e1(), r2;
            },
            pixelBoxStyles: function() {
                return e1(), o3;
            },
            pixelPosition: function() {
                return e1(), n2;
            },
            reliableMarginLeft: function() {
                return e1(), s2;
            },
            scrollboxSize: function() {
                return e1(), i3;
            },
            reliableTrDimensions: function() {
                var e3, t4, n5, r4;
                return null == a1 && (e3 = E.createElement("table"), t4 = E.createElement("tr"), n5 = E.createElement("div"), e3.style.cssText = "position:absolute;left:-11111px;border-collapse:separate", t4.style.cssText = "border:1px solid", t4.style.height = "1px", n5.style.height = "9px", n5.style.display = "block", re.appendChild(e3).appendChild(t4).appendChild(n5), r4 = C.getComputedStyle(t4), a1 = parseInt(r4.height, 10) + parseInt(r4.borderTopWidth, 10) + parseInt(r4.borderBottomWidth, 10) === t4.offsetHeight, re.removeChild(e3)), a1;
            }
        }));
    }();
    var Be = [
        "Webkit",
        "Moz",
        "ms"
    ], $e = E.createElement("div").style, _e = {
    };
    function ze(e1) {
        var t3 = S.cssProps[e1] || _e[e1];
        return t3 || (e1 in $e ? e1 : _e[e1] = (function(e3) {
            var t4 = e3[0].toUpperCase() + e3.slice(1), n2 = Be.length;
            while(n2--)if ((e3 = Be[n2] + t4) in $e) return e3;
        })(e1) || e1);
    }
    var Ue = /^(none|table(?!-c[ea]).+)/, Xe = /^--/, Ve = {
        position: "absolute",
        visibility: "hidden",
        display: "block"
    }, Ge = {
        letterSpacing: "0",
        fontWeight: "400"
    };
    function Ye(e1, t3, n2) {
        var r2 = te.exec(t3);
        return r2 ? Math.max(0, r2[2] - (n2 || 0)) + (r2[3] || "px") : t3;
    }
    function Qe(e1, t3, n2, r2, i3, o3) {
        var a1 = "width" === t3 ? 1 : 0, s2 = 0, u2 = 0;
        if (n2 === (r2 ? "border" : "content")) return 0;
        for(; a1 < 4; a1 += 2)"margin" === n2 && (u2 += S.css(e1, n2 + ne[a1], !0, i3)), r2 ? ("content" === n2 && (u2 -= S.css(e1, "padding" + ne[a1], !0, i3)), "margin" !== n2 && (u2 -= S.css(e1, "border" + ne[a1] + "Width", !0, i3))) : (u2 += S.css(e1, "padding" + ne[a1], !0, i3), "padding" !== n2 ? u2 += S.css(e1, "border" + ne[a1] + "Width", !0, i3) : s2 += S.css(e1, "border" + ne[a1] + "Width", !0, i3));
        return !r2 && 0 <= o3 && (u2 += Math.max(0, Math.ceil(e1["offset" + t3[0].toUpperCase() + t3.slice(1)] - o3 - u2 - s2 - 0.5)) || 0), u2;
    }
    function Je(e1, t3, n2) {
        var r2 = Re(e1), i3 = (!y.boxSizingReliable() || n2) && "border-box" === S.css(e1, "boxSizing", !1, r2), o3 = i3, a1 = We(e1, t3, r2), s2 = "offset" + t3[0].toUpperCase() + t3.slice(1);
        if (Pe.test(a1)) {
            if (!n2) return a1;
            a1 = "auto";
        }
        return (!y.boxSizingReliable() && i3 || !y.reliableTrDimensions() && A(e1, "tr") || "auto" === a1 || !parseFloat(a1) && "inline" === S.css(e1, "display", !1, r2)) && e1.getClientRects().length && (i3 = "border-box" === S.css(e1, "boxSizing", !1, r2), (o3 = s2 in e1) && (a1 = e1[s2])), (a1 = parseFloat(a1) || 0) + Qe(e1, t3, n2 || (i3 ? "border" : "content"), o3, r2, a1) + "px";
    }
    function Ke(e1, t3, n2, r2, i3) {
        return new Ke.prototype.init(e1, t3, n2, r2, i3);
    }
    S.extend({
        cssHooks: {
            opacity: {
                get: function(e1, t3) {
                    if (t3) {
                        var n2 = We(e1, "opacity");
                        return "" === n2 ? "1" : n2;
                    }
                }
            }
        },
        cssNumber: {
            animationIterationCount: !0,
            columnCount: !0,
            fillOpacity: !0,
            flexGrow: !0,
            flexShrink: !0,
            fontWeight: !0,
            gridArea: !0,
            gridColumn: !0,
            gridColumnEnd: !0,
            gridColumnStart: !0,
            gridRow: !0,
            gridRowEnd: !0,
            gridRowStart: !0,
            lineHeight: !0,
            opacity: !0,
            order: !0,
            orphans: !0,
            widows: !0,
            zIndex: !0,
            zoom: !0
        },
        cssProps: {
        },
        style: function(e1, t3, n5, r2) {
            if (e1 && 3 !== e1.nodeType && 8 !== e1.nodeType && e1.style) {
                var i3, o3, a1, s2 = X(t3), u2 = Xe.test(t3), l2 = e1.style;
                if (u2 || (t3 = ze(s2)), a1 = S.cssHooks[t3] || S.cssHooks[s2], (void 0) === n5) return a1 && "get" in a1 && (void 0) !== (i3 = a1.get(e1, !1, r2)) ? i3 : l2[t3];
                "string" === (o3 = typeof n5) && (i3 = te.exec(n5)) && i3[1] && (n5 = se(e1, t3, i3), o3 = "number"), null != n5 && n5 == n5 && ("number" !== o3 || u2 || (n5 += i3 && i3[3] || (S.cssNumber[s2] ? "" : "px")), y.clearCloneStyle || "" !== n5 || 0 !== t3.indexOf("background") || (l2[t3] = "inherit"), a1 && "set" in a1 && (void 0) === (n5 = a1.set(e1, n5, r2)) || (u2 ? l2.setProperty(t3, n5) : l2[t3] = n5));
            }
        },
        css: function(e1, t3, n5, r2) {
            var i4, o4, a2, s3 = X(t3);
            return Xe.test(t3) || (t3 = ze(s3)), (a2 = S.cssHooks[t3] || S.cssHooks[s3]) && "get" in a2 && (i4 = a2.get(e1, !0, n5)), (void 0) === i4 && (i4 = We(e1, t3, r2)), "normal" === i4 && t3 in Ge && (i4 = Ge[t3]), "" === n5 || n5 ? (o4 = parseFloat(i4), !0 === n5 || isFinite(o4) ? o4 || 0 : i4) : i4;
        }
    }), S.each([
        "height",
        "width"
    ], function(e1, u3) {
        S.cssHooks[u3] = {
            get: function(e3, t3, n5) {
                if (t3) return !Ue.test(S.css(e3, "display")) || e3.getClientRects().length && e3.getBoundingClientRect().width ? Je(e3, u3, n5) : Me(e3, Ve, function() {
                    return Je(e3, u3, n5);
                });
            },
            set: function(e3, t3, n5) {
                var r2, i4 = Re(e3), o4 = !y.scrollboxSize() && "absolute" === i4.position, a2 = (o4 || n5) && "border-box" === S.css(e3, "boxSizing", !1, i4), s3 = n5 ? Qe(e3, u3, n5, a2, i4) : 0;
                return a2 && o4 && (s3 -= Math.ceil(e3["offset" + u3[0].toUpperCase() + u3.slice(1)] - parseFloat(i4[u3]) - Qe(e3, u3, "border", !1, i4) - 0.5)), s3 && (r2 = te.exec(t3)) && "px" !== (r2[3] || "px") && (e3.style[u3] = t3, t3 = S.css(e3, u3)), Ye(0, t3, s3);
            }
        };
    }), S.cssHooks.marginLeft = Fe(y.reliableMarginLeft, function(e1, t3) {
        if (t3) return (parseFloat(We(e1, "marginLeft")) || e1.getBoundingClientRect().left - Me(e1, {
            marginLeft: 0
        }, function() {
            return e1.getBoundingClientRect().left;
        })) + "px";
    }), S.each({
        margin: "",
        padding: "",
        border: "Width"
    }, function(i4, o4) {
        S.cssHooks[i4 + o4] = {
            expand: function(e1) {
                for(var t3 = 0, n5 = {
                }, r2 = "string" == typeof e1 ? e1.split(" ") : [
                    e1
                ]; t3 < 4; t3++)n5[i4 + ne[t3] + o4] = r2[t3] || r2[t3 - 2] || r2[0];
                return n5;
            }
        }, "margin" !== i4 && (S.cssHooks[i4 + o4].set = Ye);
    }), S.fn.extend({
        css: function(e1, t3) {
            return $(this, function(e3, t4, n5) {
                var r2, i4, o4 = {
                }, a2 = 0;
                if (Array.isArray(t4)) {
                    for(r2 = Re(e3), i4 = t4.length; a2 < i4; a2++)o4[t4[a2]] = S.css(e3, t4[a2], !1, r2);
                    return o4;
                }
                return (void 0) !== n5 ? S.style(e3, t4, n5) : S.css(e3, t4);
            }, e1, t3, 1 < arguments.length);
        }
    }), ((S.Tween = Ke).prototype = {
        constructor: Ke,
        init: function(e1, t3, n5, r2, i4, o4) {
            this.elem = e1, this.prop = n5, this.easing = i4 || S.easing._default, this.options = t3, this.start = this.now = this.cur(), this.end = r2, this.unit = o4 || (S.cssNumber[n5] ? "" : "px");
        },
        cur: function() {
            var e1 = Ke.propHooks[this.prop];
            return e1 && e1.get ? e1.get(this) : Ke.propHooks._default.get(this);
        },
        run: function(e1) {
            var t3, n5 = Ke.propHooks[this.prop];
            return this.options.duration ? this.pos = t3 = S.easing[this.easing](e1, this.options.duration * e1, 0, 1, this.options.duration) : this.pos = t3 = e1, this.now = (this.end - this.start) * t3 + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), n5 && n5.set ? n5.set(this) : Ke.propHooks._default.set(this), this;
        }
    }).init.prototype = Ke.prototype, (Ke.propHooks = {
        _default: {
            get: function(e1) {
                var t3;
                return 1 !== e1.elem.nodeType || null != e1.elem[e1.prop] && null == e1.elem.style[e1.prop] ? e1.elem[e1.prop] : (t3 = S.css(e1.elem, e1.prop, "")) && "auto" !== t3 ? t3 : 0;
            },
            set: function(e1) {
                S.fx.step[e1.prop] ? S.fx.step[e1.prop](e1) : 1 !== e1.elem.nodeType || !S.cssHooks[e1.prop] && null == e1.elem.style[ze(e1.prop)] ? e1.elem[e1.prop] = e1.now : S.style(e1.elem, e1.prop, e1.now + e1.unit);
            }
        }
    }).scrollTop = Ke.propHooks.scrollLeft = {
        set: function(e1) {
            e1.elem.nodeType && e1.elem.parentNode && (e1.elem[e1.prop] = e1.now);
        }
    }, S.easing = {
        linear: function(e1) {
            return e1;
        },
        swing: function(e1) {
            return 0.5 - Math.cos(e1 * Math.PI) / 2;
        },
        _default: "swing"
    }, S.fx = Ke.prototype.init, S.fx.step = {
    };
    var Ze, et, tt, nt, rt = /^(?:toggle|show|hide)$/, it = /queueHooks$/;
    function ot() {
        et && (!1 === E.hidden && C.requestAnimationFrame ? C.requestAnimationFrame(ot) : C.setTimeout(ot, S.fx.interval), S.fx.tick());
    }
    function at() {
        return C.setTimeout(function() {
            Ze = void 0;
        }), Ze = Date.now();
    }
    function st(e1, t3) {
        var n5, r2 = 0, i4 = {
            height: e1
        };
        for(t3 = t3 ? 1 : 0; r2 < 4; r2 += 2 - t3)i4["margin" + (n5 = ne[r2])] = i4["padding" + n5] = e1;
        return t3 && (i4.opacity = i4.width = e1), i4;
    }
    function ut(e1, t3, n5) {
        for(var r2, i4 = (lt.tweeners[t3] || []).concat(lt.tweeners["*"]), o4 = 0, a2 = i4.length; o4 < a2; o4++)if (r2 = i4[o4].call(n5, t3, e1)) return r2;
    }
    function lt(o4, e1, t3) {
        var n5, a2, r2 = 0, i4 = lt.prefilters.length, s3 = S.Deferred().always(function() {
            delete u3.elem;
        }), u3 = function() {
            if (a2) return !1;
            for(var e3 = Ze || at(), t4 = Math.max(0, l3.startTime + l3.duration - e3), n6 = 1 - (t4 / l3.duration || 0), r4 = 0, i5 = l3.tweens.length; r4 < i5; r4++)l3.tweens[r4].run(n6);
            return s3.notifyWith(o4, [
                l3,
                n6,
                t4
            ]), n6 < 1 && i5 ? t4 : (i5 || s3.notifyWith(o4, [
                l3,
                1,
                0
            ]), s3.resolveWith(o4, [
                l3
            ]), !1);
        }, l3 = s3.promise({
            elem: o4,
            props: S.extend({
            }, e1),
            opts: S.extend(!0, {
                specialEasing: {
                },
                easing: S.easing._default
            }, t3),
            originalProperties: e1,
            originalOptions: t3,
            startTime: Ze || at(),
            duration: t3.duration,
            tweens: [],
            createTween: function(e3, t4) {
                var n6 = S.Tween(o4, l3.opts, e3, t4, l3.opts.specialEasing[e3] || l3.opts.easing);
                return l3.tweens.push(n6), n6;
            },
            stop: function(e3) {
                var t4 = 0, n6 = e3 ? l3.tweens.length : 0;
                if (a2) return this;
                for(a2 = !0; t4 < n6; t4++)l3.tweens[t4].run(1);
                return e3 ? (s3.notifyWith(o4, [
                    l3,
                    1,
                    0
                ]), s3.resolveWith(o4, [
                    l3,
                    e3
                ])) : s3.rejectWith(o4, [
                    l3,
                    e3
                ]), this;
            }
        }), c1 = l3.props;
        for(!function(e3, t4) {
            var n6, r4, i5, o5, a3;
            for(n6 in e3)if (i5 = t4[r4 = X(n6)], o5 = e3[n6], Array.isArray(o5) && (i5 = o5[1], o5 = e3[n6] = o5[0]), n6 !== r4 && (e3[r4] = o5, delete e3[n6]), (a3 = S.cssHooks[r4]) && "expand" in a3) for(n6 in o5 = a3.expand(o5), delete e3[r4], o5)n6 in e3 || (e3[n6] = o5[n6], t4[n6] = i5);
            else t4[r4] = i5;
        }(c1, l3.opts.specialEasing); r2 < i4; r2++)if (n5 = lt.prefilters[r2].call(l3, o4, c1, l3.opts)) return m(n5.stop) && (S._queueHooks(l3.elem, l3.opts.queue).stop = n5.stop.bind(n5)), n5;
        return S.map(c1, ut, l3), m(l3.opts.start) && l3.opts.start.call(o4, l3), l3.progress(l3.opts.progress).done(l3.opts.done, l3.opts.complete).fail(l3.opts.fail).always(l3.opts.always), S.fx.timer(S.extend(u3, {
            elem: o4,
            anim: l3,
            queue: l3.opts.queue
        })), l3;
    }
    S.Animation = S.extend(lt, {
        tweeners: {
            "*": [
                function(e1, t3) {
                    var n5 = this.createTween(e1, t3);
                    return se(n5.elem, e1, te.exec(t3), n5), n5;
                }
            ]
        },
        tweener: function(e1, t3) {
            m(e1) ? (t3 = e1, e1 = [
                "*"
            ]) : e1 = e1.match(P);
            for(var n5, r2 = 0, i4 = e1.length; r2 < i4; r2++)n5 = e1[r2], lt.tweeners[n5] = lt.tweeners[n5] || [], lt.tweeners[n5].unshift(t3);
        },
        prefilters: [
            function(e1, t3, n5) {
                var r2, i4, o4, a2, s3, u3, l3, c1, f1 = "width" in t3 || "height" in t3, p1 = this, d1 = {
                }, h1 = e1.style, g1 = e1.nodeType && ae(e1), v1 = Y.get(e1, "fxshow");
                for(r2 in n5.queue || (null == (a2 = S._queueHooks(e1, "fx")).unqueued && (a2.unqueued = 0, s3 = a2.empty.fire, a2.empty.fire = function() {
                    a2.unqueued || s3();
                }), a2.unqueued++, p1.always(function() {
                    p1.always(function() {
                        a2.unqueued--, S.queue(e1, "fx").length || a2.empty.fire();
                    });
                })), t3)if (i4 = t3[r2], rt.test(i4)) {
                    if (delete t3[r2], o4 = o4 || "toggle" === i4, i4 === (g1 ? "hide" : "show")) {
                        if ("show" !== i4 || !v1 || (void 0) === v1[r2]) continue;
                        g1 = !0;
                    }
                    d1[r2] = v1 && v1[r2] || S.style(e1, r2);
                }
                if ((u3 = !S.isEmptyObject(t3)) || !S.isEmptyObject(d1)) for(r2 in f1 && 1 === e1.nodeType && (n5.overflow = [
                    h1.overflow,
                    h1.overflowX,
                    h1.overflowY
                ], null == (l3 = v1 && v1.display) && (l3 = Y.get(e1, "display")), "none" === (c1 = S.css(e1, "display")) && (l3 ? c1 = l3 : (le([
                    e1
                ], !0), l3 = e1.style.display || l3, c1 = S.css(e1, "display"), le([
                    e1
                ]))), ("inline" === c1 || "inline-block" === c1 && null != l3) && "none" === S.css(e1, "float") && (u3 || (p1.done(function() {
                    h1.display = l3;
                }), null == l3 && (c1 = h1.display, l3 = "none" === c1 ? "" : c1)), h1.display = "inline-block")), n5.overflow && (h1.overflow = "hidden", p1.always(function() {
                    h1.overflow = n5.overflow[0], h1.overflowX = n5.overflow[1], h1.overflowY = n5.overflow[2];
                })), u3 = !1, d1)u3 || (v1 ? "hidden" in v1 && (g1 = v1.hidden) : v1 = Y.access(e1, "fxshow", {
                    display: l3
                }), o4 && (v1.hidden = !g1), g1 && le([
                    e1
                ], !0), p1.done(function() {
                    for(r2 in g1 || le([
                        e1
                    ]), Y.remove(e1, "fxshow"), d1)S.style(e1, r2, d1[r2]);
                })), u3 = ut(g1 ? v1[r2] : 0, r2, p1), r2 in v1 || (v1[r2] = u3.start, g1 && (u3.end = u3.start, u3.start = 0));
            }
        ],
        prefilter: function(e1, t3) {
            t3 ? lt.prefilters.unshift(e1) : lt.prefilters.push(e1);
        }
    }), S.speed = function(e1, t3, n5) {
        var r2 = e1 && "object" == typeof e1 ? S.extend({
        }, e1) : {
            complete: n5 || !n5 && t3 || m(e1) && e1,
            duration: e1,
            easing: n5 && t3 || t3 && !m(t3) && t3
        };
        return S.fx.off ? r2.duration = 0 : "number" != typeof r2.duration && (r2.duration in S.fx.speeds ? r2.duration = S.fx.speeds[r2.duration] : r2.duration = S.fx.speeds._default), null != r2.queue && !0 !== r2.queue || (r2.queue = "fx"), r2.old = r2.complete, r2.complete = function() {
            m(r2.old) && r2.old.call(this), r2.queue && S.dequeue(this, r2.queue);
        }, r2;
    }, S.fn.extend({
        fadeTo: function(e1, t3, n5, r2) {
            return this.filter(ae).css("opacity", 0).show().end().animate({
                opacity: t3
            }, e1, n5, r2);
        },
        animate: function(t3, e1, n5, r2) {
            var i4 = S.isEmptyObject(t3), o4 = S.speed(e1, n5, r2), a2 = function() {
                var e3 = lt(this, S.extend({
                }, t3), o4);
                (i4 || Y.get(this, "finish")) && e3.stop(!0);
            };
            return a2.finish = a2, i4 || !1 === o4.queue ? this.each(a2) : this.queue(o4.queue, a2);
        },
        stop: function(i4, e1, o4) {
            var a2 = function(e3) {
                var t3 = e3.stop;
                delete e3.stop, t3(o4);
            };
            return "string" != typeof i4 && (o4 = e1, e1 = i4, i4 = void 0), e1 && this.queue(i4 || "fx", []), this.each(function() {
                var e3 = !0, t3 = null != i4 && i4 + "queueHooks", n5 = S.timers, r2 = Y.get(this);
                if (t3) r2[t3] && r2[t3].stop && a2(r2[t3]);
                else for(t3 in r2)r2[t3] && r2[t3].stop && it.test(t3) && a2(r2[t3]);
                for(t3 = n5.length; t3--;)n5[t3].elem !== this || null != i4 && n5[t3].queue !== i4 || (n5[t3].anim.stop(o4), e3 = !1, n5.splice(t3, 1));
                !e3 && o4 || S.dequeue(this, i4);
            });
        },
        finish: function(a2) {
            return !1 !== a2 && (a2 = a2 || "fx"), this.each(function() {
                var e1, t3 = Y.get(this), n5 = t3[a2 + "queue"], r2 = t3[a2 + "queueHooks"], i4 = S.timers, o4 = n5 ? n5.length : 0;
                for(t3.finish = !0, S.queue(this, a2, []), r2 && r2.stop && r2.stop.call(this, !0), e1 = i4.length; e1--;)i4[e1].elem === this && i4[e1].queue === a2 && (i4[e1].anim.stop(!0), i4.splice(e1, 1));
                for(e1 = 0; e1 < o4; e1++)n5[e1] && n5[e1].finish && n5[e1].finish.call(this);
                delete t3.finish;
            });
        }
    }), S.each([
        "toggle",
        "show",
        "hide"
    ], function(e1, r2) {
        var i4 = S.fn[r2];
        S.fn[r2] = function(e3, t3, n5) {
            return null == e3 || "boolean" == typeof e3 ? i4.apply(this, arguments) : this.animate(st(r2, !0), e3, t3, n5);
        };
    }), S.each({
        slideDown: st("show"),
        slideUp: st("hide"),
        slideToggle: st("toggle"),
        fadeIn: {
            opacity: "show"
        },
        fadeOut: {
            opacity: "hide"
        },
        fadeToggle: {
            opacity: "toggle"
        }
    }, function(e1, r2) {
        S.fn[e1] = function(e3, t3, n5) {
            return this.animate(r2, e3, t3, n5);
        };
    }), S.timers = [], S.fx.tick = function() {
        var e1, t3 = 0, n5 = S.timers;
        for(Ze = Date.now(); t3 < n5.length; t3++)(e1 = n5[t3])() || n5[t3] !== e1 || n5.splice(t3--, 1);
        n5.length || S.fx.stop(), Ze = void 0;
    }, S.fx.timer = function(e1) {
        S.timers.push(e1), S.fx.start();
    }, S.fx.interval = 13, S.fx.start = function() {
        et || (et = !0, ot());
    }, S.fx.stop = function() {
        et = null;
    }, S.fx.speeds = {
        slow: 600,
        fast: 200,
        _default: 400
    }, S.fn.delay = function(r2, e1) {
        return r2 = S.fx && S.fx.speeds[r2] || r2, e1 = e1 || "fx", this.queue(e1, function(e3, t3) {
            var n5 = C.setTimeout(e3, r2);
            t3.stop = function() {
                C.clearTimeout(n5);
            };
        });
    }, tt = E.createElement("input"), nt = E.createElement("select").appendChild(E.createElement("option")), tt.type = "checkbox", y.checkOn = "" !== tt.value, y.optSelected = nt.selected, (tt = E.createElement("input")).value = "t", tt.type = "radio", y.radioValue = "t" === tt.value;
    var ct, ft = S.expr.attrHandle;
    S.fn.extend({
        attr: function(e1, t3) {
            return $(this, S.attr, e1, t3, 1 < arguments.length);
        },
        removeAttr: function(e1) {
            return this.each(function() {
                S.removeAttr(this, e1);
            });
        }
    }), S.extend({
        attr: function(e1, t3, n5) {
            var r2, i4, o4 = e1.nodeType;
            if (3 !== o4 && 8 !== o4 && 2 !== o4) return "undefined" == typeof e1.getAttribute ? S.prop(e1, t3, n5) : (1 === o4 && S.isXMLDoc(e1) || (i4 = S.attrHooks[t3.toLowerCase()] || (S.expr.match.bool.test(t3) ? ct : void 0)), (void 0) !== n5 ? null === n5 ? void S.removeAttr(e1, t3) : i4 && "set" in i4 && (void 0) !== (r2 = i4.set(e1, n5, t3)) ? r2 : (e1.setAttribute(t3, n5 + ""), n5) : i4 && "get" in i4 && null !== (r2 = i4.get(e1, t3)) ? r2 : null == (r2 = S.find.attr(e1, t3)) ? void 0 : r2);
        },
        attrHooks: {
            type: {
                set: function(e1, t3) {
                    if (!y.radioValue && "radio" === t3 && A(e1, "input")) {
                        var n5 = e1.value;
                        return e1.setAttribute("type", t3), n5 && (e1.value = n5), t3;
                    }
                }
            }
        },
        removeAttr: function(e1, t3) {
            var n6, r2 = 0, i4 = t3 && t3.match(P);
            if (i4 && 1 === e1.nodeType) while(n6 = i4[r2++])e1.removeAttribute(n6);
        }
    }), ct = {
        set: function(e1, t3, n6) {
            return !1 === t3 ? S.removeAttr(e1, n6) : e1.setAttribute(n6, n6), n6;
        }
    }, S.each(S.expr.match.bool.source.match(/\w+/g), function(e1, t3) {
        var a2 = ft[t3] || S.find.attr;
        ft[t3] = function(e3, t4, n6) {
            var r2, i4, o4 = t4.toLowerCase();
            return n6 || (i4 = ft[o4], ft[o4] = r2, r2 = null != a2(e3, t4, n6) ? o4 : null, ft[o4] = i4), r2;
        };
    });
    var pt = /^(?:input|select|textarea|button)$/i, dt = /^(?:a|area)$/i;
    function ht(e1) {
        return (e1.match(P) || []).join(" ");
    }
    function gt(e1) {
        return e1.getAttribute && e1.getAttribute("class") || "";
    }
    function vt(e1) {
        return Array.isArray(e1) ? e1 : "string" == typeof e1 && e1.match(P) || [];
    }
    S.fn.extend({
        prop: function(e1, t3) {
            return $(this, S.prop, e1, t3, 1 < arguments.length);
        },
        removeProp: function(e1) {
            return this.each(function() {
                delete this[S.propFix[e1] || e1];
            });
        }
    }), S.extend({
        prop: function(e1, t3, n6) {
            var r2, i4, o4 = e1.nodeType;
            if (3 !== o4 && 8 !== o4 && 2 !== o4) return 1 === o4 && S.isXMLDoc(e1) || (t3 = S.propFix[t3] || t3, i4 = S.propHooks[t3]), (void 0) !== n6 ? i4 && "set" in i4 && (void 0) !== (r2 = i4.set(e1, n6, t3)) ? r2 : e1[t3] = n6 : i4 && "get" in i4 && null !== (r2 = i4.get(e1, t3)) ? r2 : e1[t3];
        },
        propHooks: {
            tabIndex: {
                get: function(e1) {
                    var t3 = S.find.attr(e1, "tabindex");
                    return t3 ? parseInt(t3, 10) : pt.test(e1.nodeName) || dt.test(e1.nodeName) && e1.href ? 0 : -1;
                }
            }
        },
        propFix: {
            "for": "htmlFor",
            "class": "className"
        }
    }), y.optSelected || (S.propHooks.selected = {
        get: function(e1) {
            var t3 = e1.parentNode;
            return t3 && t3.parentNode && t3.parentNode.selectedIndex, null;
        },
        set: function(e1) {
            var t3 = e1.parentNode;
            t3 && (t3.selectedIndex, t3.parentNode && t3.parentNode.selectedIndex);
        }
    }), S.each([
        "tabIndex",
        "readOnly",
        "maxLength",
        "cellSpacing",
        "cellPadding",
        "rowSpan",
        "colSpan",
        "useMap",
        "frameBorder",
        "contentEditable"
    ], function() {
        S.propFix[this.toLowerCase()] = this;
    }), S.fn.extend({
        addClass: function(t3) {
            var e1, n6, r2, i4, o4, a2, s3, u3 = 0;
            if (m(t3)) return this.each(function(e3) {
                S(this).addClass(t3.call(this, e3, gt(this)));
            });
            if ((e1 = vt(t3)).length) while(n6 = this[u3++])if (i4 = gt(n6), r2 = 1 === n6.nodeType && " " + ht(i4) + " ") {
                a2 = 0;
                while(o4 = e1[a2++])r2.indexOf(" " + o4 + " ") < 0 && (r2 += o4 + " ");
                i4 !== (s3 = ht(r2)) && n6.setAttribute("class", s3);
            }
            return this;
        },
        removeClass: function(t3) {
            var e1, n6, r2, i4, o4, a2, s3, u3 = 0;
            if (m(t3)) return this.each(function(e3) {
                S(this).removeClass(t3.call(this, e3, gt(this)));
            });
            if (!arguments.length) return this.attr("class", "");
            if ((e1 = vt(t3)).length) while(n6 = this[u3++])if (i4 = gt(n6), r2 = 1 === n6.nodeType && " " + ht(i4) + " ") {
                a2 = 0;
                while(o4 = e1[a2++])while(-1 < r2.indexOf(" " + o4 + " "))r2 = r2.replace(" " + o4 + " ", " ");
                i4 !== (s3 = ht(r2)) && n6.setAttribute("class", s3);
            }
            return this;
        },
        toggleClass: function(i4, t3) {
            var o4 = typeof i4, a2 = "string" === o4 || Array.isArray(i4);
            return "boolean" == typeof t3 && a2 ? t3 ? this.addClass(i4) : this.removeClass(i4) : m(i4) ? this.each(function(e1) {
                S(this).toggleClass(i4.call(this, e1, gt(this), t3), t3);
            }) : this.each(function() {
                var e1, t4, n6, r2;
                if (a2) {
                    t4 = 0, n6 = S(this), r2 = vt(i4);
                    while(e1 = r2[t4++])n6.hasClass(e1) ? n6.removeClass(e1) : n6.addClass(e1);
                } else (void 0) !== i4 && "boolean" !== o4 || ((e1 = gt(this)) && Y.set(this, "__className__", e1), this.setAttribute && this.setAttribute("class", e1 || !1 === i4 ? "" : Y.get(this, "__className__") || ""));
            });
        },
        hasClass: function(e1) {
            var t3, n6, r2 = 0;
            t3 = " " + e1 + " ";
            while(n6 = this[r2++])if (1 === n6.nodeType && -1 < (" " + ht(gt(n6)) + " ").indexOf(t3)) return !0;
            return !1;
        }
    });
    var yt = /\r/g;
    S.fn.extend({
        val: function(n6) {
            var r2, e1, i4, t3 = this[0];
            return arguments.length ? (i4 = m(n6), this.each(function(e3) {
                var t4;
                1 === this.nodeType && (null == (t4 = i4 ? n6.call(this, e3, S(this).val()) : n6) ? t4 = "" : "number" == typeof t4 ? t4 += "" : Array.isArray(t4) && (t4 = S.map(t4, function(e4) {
                    return null == e4 ? "" : e4 + "";
                })), (r2 = S.valHooks[this.type] || S.valHooks[this.nodeName.toLowerCase()]) && "set" in r2 && (void 0) !== r2.set(this, t4, "value") || (this.value = t4));
            })) : t3 ? (r2 = S.valHooks[t3.type] || S.valHooks[t3.nodeName.toLowerCase()]) && "get" in r2 && (void 0) !== (e1 = r2.get(t3, "value")) ? e1 : "string" == typeof (e1 = t3.value) ? e1.replace(yt, "") : null == e1 ? "" : e1 : void 0;
        }
    }), S.extend({
        valHooks: {
            option: {
                get: function(e1) {
                    var t3 = S.find.attr(e1, "value");
                    return null != t3 ? t3 : ht(S.text(e1));
                }
            },
            select: {
                get: function(e1) {
                    var t3, n6, r2, i4 = e1.options, o4 = e1.selectedIndex, a2 = "select-one" === e1.type, s3 = a2 ? null : [], u3 = a2 ? o4 + 1 : i4.length;
                    for(r2 = o4 < 0 ? u3 : a2 ? o4 : 0; r2 < u3; r2++)if (((n6 = i4[r2]).selected || r2 === o4) && !n6.disabled && (!n6.parentNode.disabled || !A(n6.parentNode, "optgroup"))) {
                        if (t3 = S(n6).val(), a2) return t3;
                        s3.push(t3);
                    }
                    return s3;
                },
                set: function(e1, t3) {
                    var n6, r2, i4 = e1.options, o4 = S.makeArray(t3), a2 = i4.length;
                    while(a2--)((r2 = i4[a2]).selected = -1 < S.inArray(S.valHooks.option.get(r2), o4)) && (n6 = !0);
                    return n6 || (e1.selectedIndex = -1), o4;
                }
            }
        }
    }), S.each([
        "radio",
        "checkbox"
    ], function() {
        S.valHooks[this] = {
            set: function(e1, t3) {
                if (Array.isArray(t3)) return e1.checked = -1 < S.inArray(S(e1).val(), t3);
            }
        }, y.checkOn || (S.valHooks[this].get = function(e1) {
            return null === e1.getAttribute("value") ? "on" : e1.value;
        });
    }), y.focusin = "onfocusin" in C;
    var mt = /^(?:focusinfocus|focusoutblur)$/, xt = function(e1) {
        e1.stopPropagation();
    };
    S.extend(S.event, {
        trigger: function(e1, t3, n6, r2) {
            var i4, o4, a2, s3, u3, l3, c1, f1, p1 = [
                n6 || E
            ], d1 = v.call(e1, "type") ? e1.type : e1, h1 = v.call(e1, "namespace") ? e1.namespace.split(".") : [];
            if (o4 = f1 = a2 = n6 = n6 || E, 3 !== n6.nodeType && 8 !== n6.nodeType && !mt.test(d1 + S.event.triggered) && (-1 < d1.indexOf(".") && (d1 = (h1 = d1.split(".")).shift(), h1.sort()), u3 = d1.indexOf(":") < 0 && "on" + d1, (e1 = e1[S.expando] ? e1 : new S.Event(d1, "object" == typeof e1 && e1)).isTrigger = r2 ? 2 : 3, e1.namespace = h1.join("."), e1.rnamespace = e1.namespace ? new RegExp("(^|\\.)" + h1.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, e1.result = void 0, e1.target || (e1.target = n6), t3 = null == t3 ? [
                e1
            ] : S.makeArray(t3, [
                e1
            ]), c1 = S.event.special[d1] || {
            }, r2 || !c1.trigger || !1 !== c1.trigger.apply(n6, t3))) {
                if (!r2 && !c1.noBubble && !x(n6)) {
                    for(s3 = c1.delegateType || d1, mt.test(s3 + d1) || (o4 = o4.parentNode); o4; o4 = o4.parentNode)p1.push(o4), a2 = o4;
                    a2 === (n6.ownerDocument || E) && p1.push(a2.defaultView || a2.parentWindow || C);
                }
                i4 = 0;
                while((o4 = p1[i4++]) && !e1.isPropagationStopped())f1 = o4, e1.type = 1 < i4 ? s3 : c1.bindType || d1, (l3 = (Y.get(o4, "events") || Object.create(null))[e1.type] && Y.get(o4, "handle")) && l3.apply(o4, t3), (l3 = u3 && o4[u3]) && l3.apply && V(o4) && (e1.result = l3.apply(o4, t3), !1 === e1.result && e1.preventDefault());
                return e1.type = d1, r2 || e1.isDefaultPrevented() || c1._default && !1 !== c1._default.apply(p1.pop(), t3) || !V(n6) || u3 && m(n6[d1]) && !x(n6) && ((a2 = n6[u3]) && (n6[u3] = null), S.event.triggered = d1, e1.isPropagationStopped() && f1.addEventListener(d1, xt), n6[d1](), e1.isPropagationStopped() && f1.removeEventListener(d1, xt), S.event.triggered = void 0, a2 && (n6[u3] = a2)), e1.result;
            }
        },
        simulate: function(e1, t3, n6) {
            var r2 = S.extend(new S.Event, n6, {
                type: e1,
                isSimulated: !0
            });
            S.event.trigger(r2, null, t3);
        }
    }), S.fn.extend({
        trigger: function(e1, t3) {
            return this.each(function() {
                S.event.trigger(e1, t3, this);
            });
        },
        triggerHandler: function(e1, t3) {
            var n6 = this[0];
            if (n6) return S.event.trigger(e1, t3, n6, !0);
        }
    }), y.focusin || S.each({
        focus: "focusin",
        blur: "focusout"
    }, function(n6, r2) {
        var i4 = function(e1) {
            S.event.simulate(r2, e1.target, S.event.fix(e1));
        };
        S.event.special[r2] = {
            setup: function() {
                var e1 = this.ownerDocument || this.document || this, t3 = Y.access(e1, r2);
                t3 || e1.addEventListener(n6, i4, !0), Y.access(e1, r2, (t3 || 0) + 1);
            },
            teardown: function() {
                var e1 = this.ownerDocument || this.document || this, t3 = Y.access(e1, r2) - 1;
                t3 ? Y.access(e1, r2, t3) : (e1.removeEventListener(n6, i4, !0), Y.remove(e1, r2));
            }
        };
    });
    var bt = C.location, wt = {
        guid: Date.now()
    }, Tt = /\?/;
    S.parseXML = function(e1) {
        var t3, n6;
        if (!e1 || "string" != typeof e1) return null;
        try {
            t3 = (new C.DOMParser).parseFromString(e1, "text/xml");
        } catch (e3) {
        }
        return n6 = t3 && t3.getElementsByTagName("parsererror")[0], t3 && !n6 || S.error("Invalid XML: " + (n6 ? S.map(n6.childNodes, function(e3) {
            return e3.textContent;
        }).join("\n") : e1)), t3;
    };
    var Ct = /\[\]$/, Et = /\r?\n/g, St = /^(?:submit|button|image|reset|file)$/i, kt = /^(?:input|select|textarea|keygen)/i;
    function At(n6, e1, r2, i4) {
        var t3;
        if (Array.isArray(e1)) S.each(e1, function(e3, t4) {
            r2 || Ct.test(n6) ? i4(n6, t4) : At(n6 + "[" + ("object" == typeof t4 && null != t4 ? e3 : "") + "]", t4, r2, i4);
        });
        else if (r2 || "object" !== w(e1)) i4(n6, e1);
        else for(t3 in e1)At(n6 + "[" + t3 + "]", e1[t3], r2, i4);
    }
    S.param = function(e1, t3) {
        var n6, r2 = [], i4 = function(e3, t4) {
            var n7 = m(t4) ? t4() : t4;
            r2[r2.length] = encodeURIComponent(e3) + "=" + encodeURIComponent(null == n7 ? "" : n7);
        };
        if (null == e1) return "";
        if (Array.isArray(e1) || e1.jquery && !S.isPlainObject(e1)) S.each(e1, function() {
            i4(this.name, this.value);
        });
        else for(n6 in e1)At(n6, e1[n6], t3, i4);
        return r2.join("&");
    }, S.fn.extend({
        serialize: function() {
            return S.param(this.serializeArray());
        },
        serializeArray: function() {
            return this.map(function() {
                var e1 = S.prop(this, "elements");
                return e1 ? S.makeArray(e1) : this;
            }).filter(function() {
                var e1 = this.type;
                return this.name && !S(this).is(":disabled") && kt.test(this.nodeName) && !St.test(e1) && (this.checked || !pe.test(e1));
            }).map(function(e1, t3) {
                var n6 = S(this).val();
                return null == n6 ? null : Array.isArray(n6) ? S.map(n6, function(e3) {
                    return {
                        name: t3.name,
                        value: e3.replace(Et, "\r\n")
                    };
                }) : {
                    name: t3.name,
                    value: n6.replace(Et, "\r\n")
                };
            }).get();
        }
    });
    var Nt = /%20/g, jt = /#.*$/, Dt = /([?&])_=[^&]*/, qt = /^(.*?):[ \t]*([^\r\n]*)$/gm, Lt = /^(?:GET|HEAD)$/, Ht = /^\/\//, Ot = {
    }, Pt = {
    }, Rt = "*/".concat("*"), Mt = E.createElement("a");
    function It(o4) {
        return function(e1, t3) {
            "string" != typeof e1 && (t3 = e1, e1 = "*");
            var n6, r2 = 0, i4 = e1.toLowerCase().match(P) || [];
            if (m(t3)) while(n6 = i4[r2++])"+" === n6[0] ? (n6 = n6.slice(1) || "*", (o4[n6] = o4[n6] || []).unshift(t3)) : (o4[n6] = o4[n6] || []).push(t3);
        };
    }
    function Wt(t3, i4, o4, a2) {
        var s3 = {
        }, u3 = t3 === Pt;
        function l3(e1) {
            var r2;
            return s3[e1] = !0, S.each(t3[e1] || [], function(e3, t4) {
                var n6 = t4(i4, o4, a2);
                return "string" != typeof n6 || u3 || s3[n6] ? u3 ? !(r2 = n6) : void 0 : (i4.dataTypes.unshift(n6), l3(n6), !1);
            }), r2;
        }
        return l3(i4.dataTypes[0]) || !s3["*"] && l3("*");
    }
    function Ft(e1, t3) {
        var n6, r2, i4 = S.ajaxSettings.flatOptions || {
        };
        for(n6 in t3)(void 0) !== t3[n6] && ((i4[n6] ? e1 : r2 || (r2 = {
        }))[n6] = t3[n6]);
        return r2 && S.extend(!0, e1, r2), e1;
    }
    Mt.href = bt.href, S.extend({
        active: 0,
        lastModified: {
        },
        etag: {
        },
        ajaxSettings: {
            url: bt.href,
            type: "GET",
            isLocal: /^(?:about|app|app-storage|.+-extension|file|res|widget):$/.test(bt.protocol),
            global: !0,
            processData: !0,
            async: !0,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            accepts: {
                "*": Rt,
                text: "text/plain",
                html: "text/html",
                xml: "application/xml, text/xml",
                json: "application/json, text/javascript"
            },
            contents: {
                xml: /\bxml\b/,
                html: /\bhtml/,
                json: /\bjson\b/
            },
            responseFields: {
                xml: "responseXML",
                text: "responseText",
                json: "responseJSON"
            },
            converters: {
                "* text": String,
                "text html": !0,
                "text json": JSON.parse,
                "text xml": S.parseXML
            },
            flatOptions: {
                url: !0,
                context: !0
            }
        },
        ajaxSetup: function(e1, t3) {
            return t3 ? Ft(Ft(e1, S.ajaxSettings), t3) : Ft(S.ajaxSettings, e1);
        },
        ajaxPrefilter: It(Ot),
        ajaxTransport: It(Pt),
        ajax: function(e1, t3) {
            "object" == typeof e1 && (t3 = e1, e1 = void 0), t3 = t3 || {
            };
            var c1, f1, p1, n6, d1, r2, h1, g1, i4, o4, v1 = S.ajaxSetup({
            }, t3), y1 = v1.context || v1, m1 = v1.context && (y1.nodeType || y1.jquery) ? S(y1) : S.event, x1 = S.Deferred(), b1 = S.Callbacks("once memory"), w1 = v1.statusCode || {
            }, a2 = {
            }, s3 = {
            }, u3 = "canceled", T1 = {
                readyState: 0,
                getResponseHeader: function(e3) {
                    var t4;
                    if (h1) {
                        if (!n6) {
                            n6 = {
                            };
                            while(t4 = qt.exec(p1))n6[t4[1].toLowerCase() + " "] = (n6[t4[1].toLowerCase() + " "] || []).concat(t4[2]);
                        }
                        t4 = n6[e3.toLowerCase() + " "];
                    }
                    return null == t4 ? null : t4.join(", ");
                },
                getAllResponseHeaders: function() {
                    return h1 ? p1 : null;
                },
                setRequestHeader: function(e3, t4) {
                    return null == h1 && (e3 = s3[e3.toLowerCase()] = s3[e3.toLowerCase()] || e3, a2[e3] = t4), this;
                },
                overrideMimeType: function(e3) {
                    return null == h1 && (v1.mimeType = e3), this;
                },
                statusCode: function(e3) {
                    var t4;
                    if (e3) {
                        if (h1) T1.always(e3[T1.status]);
                        else for(t4 in e3)w1[t4] = [
                            w1[t4],
                            e3[t4]
                        ];
                    }
                    return this;
                },
                abort: function(e3) {
                    var t4 = e3 || u3;
                    return c1 && c1.abort(t4), l3(0, t4), this;
                }
            };
            if (x1.promise(T1), v1.url = ((e1 || v1.url || bt.href) + "").replace(Ht, bt.protocol + "//"), v1.type = t3.method || t3.type || v1.method || v1.type, v1.dataTypes = (v1.dataType || "*").toLowerCase().match(P) || [
                ""
            ], null == v1.crossDomain) {
                r2 = E.createElement("a");
                try {
                    r2.href = v1.url, r2.href = r2.href, v1.crossDomain = Mt.protocol + "//" + Mt.host != r2.protocol + "//" + r2.host;
                } catch (e3) {
                    v1.crossDomain = !0;
                }
            }
            if (v1.data && v1.processData && "string" != typeof v1.data && (v1.data = S.param(v1.data, v1.traditional)), Wt(Ot, v1, t3, T1), h1) return T1;
            for(i4 in (g1 = S.event && v1.global) && 0 == S.active++ && S.event.trigger("ajaxStart"), v1.type = v1.type.toUpperCase(), v1.hasContent = !Lt.test(v1.type), f1 = v1.url.replace(jt, ""), v1.hasContent ? v1.data && v1.processData && 0 === (v1.contentType || "").indexOf("application/x-www-form-urlencoded") && (v1.data = v1.data.replace(Nt, "+")) : (o4 = v1.url.slice(f1.length), v1.data && (v1.processData || "string" == typeof v1.data) && (f1 += (Tt.test(f1) ? "&" : "?") + v1.data, delete v1.data), !1 === v1.cache && (f1 = f1.replace(Dt, "$1"), o4 = (Tt.test(f1) ? "&" : "?") + "_=" + wt.guid++ + o4), v1.url = f1 + o4), v1.ifModified && (S.lastModified[f1] && T1.setRequestHeader("If-Modified-Since", S.lastModified[f1]), S.etag[f1] && T1.setRequestHeader("If-None-Match", S.etag[f1])), (v1.data && v1.hasContent && !1 !== v1.contentType || t3.contentType) && T1.setRequestHeader("Content-Type", v1.contentType), T1.setRequestHeader("Accept", v1.dataTypes[0] && v1.accepts[v1.dataTypes[0]] ? v1.accepts[v1.dataTypes[0]] + ("*" !== v1.dataTypes[0] ? ", " + Rt + "; q=0.01" : "") : v1.accepts["*"]), v1.headers)T1.setRequestHeader(i4, v1.headers[i4]);
            if (v1.beforeSend && (!1 === v1.beforeSend.call(y1, T1, v1) || h1)) return T1.abort();
            if (u3 = "abort", b1.add(v1.complete), T1.done(v1.success), T1.fail(v1.error), c1 = Wt(Pt, v1, t3, T1)) {
                if (T1.readyState = 1, g1 && m1.trigger("ajaxSend", [
                    T1,
                    v1
                ]), h1) return T1;
                v1.async && 0 < v1.timeout && (d1 = C.setTimeout(function() {
                    T1.abort("timeout");
                }, v1.timeout));
                try {
                    h1 = !1, c1.send(a2, l3);
                } catch (e3) {
                    if (h1) throw e3;
                    l3(-1, e3);
                }
            } else l3(-1, "No Transport");
            function l3(e3, t4, n7, r4) {
                var i5, o5, a3, s4, u4, l4 = t4;
                h1 || (h1 = !0, d1 && C.clearTimeout(d1), c1 = void 0, p1 = r4 || "", T1.readyState = 0 < e3 ? 4 : 0, i5 = 200 <= e3 && e3 < 300 || 304 === e3, n7 && (s4 = (function(e4, t5, n8) {
                    var r5, i6, o6, a4, s5 = e4.contents, u5 = e4.dataTypes;
                    while("*" === u5[0])u5.shift(), (void 0) === r5 && (r5 = e4.mimeType || t5.getResponseHeader("Content-Type"));
                    if (r5) for(i6 in s5)if (s5[i6] && s5[i6].test(r5)) {
                        u5.unshift(i6);
                        break;
                    }
                    if (u5[0] in n8) o6 = u5[0];
                    else {
                        for(i6 in n8){
                            if (!u5[0] || e4.converters[i6 + " " + u5[0]]) {
                                o6 = i6;
                                break;
                            }
                            a4 || (a4 = i6);
                        }
                        o6 = o6 || a4;
                    }
                    if (o6) return o6 !== u5[0] && u5.unshift(o6), n8[o6];
                })(v1, T1, n7)), !i5 && -1 < S.inArray("script", v1.dataTypes) && S.inArray("json", v1.dataTypes) < 0 && (v1.converters["text script"] = function() {
                }), s4 = (function(e4, t5, n8, r5) {
                    var i6, o6, a4, s5, u5, l5 = {
                    }, c2 = e4.dataTypes.slice();
                    if (c2[1]) for(a4 in e4.converters)l5[a4.toLowerCase()] = e4.converters[a4];
                    o6 = c2.shift();
                    while(o6)if (e4.responseFields[o6] && (n8[e4.responseFields[o6]] = t5), !u5 && r5 && e4.dataFilter && (t5 = e4.dataFilter(t5, e4.dataType)), u5 = o6, o6 = c2.shift()) {
                        if ("*" === o6) o6 = u5;
                        else if ("*" !== u5 && u5 !== o6) {
                            if (!(a4 = l5[u5 + " " + o6] || l5["* " + o6])) for(i6 in l5)if ((s5 = i6.split(" "))[1] === o6 && (a4 = l5[u5 + " " + s5[0]] || l5["* " + s5[0]])) {
                                !0 === a4 ? a4 = l5[i6] : !0 !== l5[i6] && (o6 = s5[0], c2.unshift(s5[1]));
                                break;
                            }
                            if (!0 !== a4) {
                                if (a4 && e4["throws"]) t5 = a4(t5);
                                else try {
                                    t5 = a4(t5);
                                } catch (e5) {
                                    return {
                                        state: "parsererror",
                                        error: a4 ? e5 : "No conversion from " + u5 + " to " + o6
                                    };
                                }
                            }
                        }
                    }
                    return {
                        state: "success",
                        data: t5
                    };
                })(v1, s4, T1, i5), i5 ? (v1.ifModified && ((u4 = T1.getResponseHeader("Last-Modified")) && (S.lastModified[f1] = u4), (u4 = T1.getResponseHeader("etag")) && (S.etag[f1] = u4)), 204 === e3 || "HEAD" === v1.type ? l4 = "nocontent" : 304 === e3 ? l4 = "notmodified" : (l4 = s4.state, o5 = s4.data, i5 = !(a3 = s4.error))) : (a3 = l4, !e3 && l4 || (l4 = "error", e3 < 0 && (e3 = 0))), T1.status = e3, T1.statusText = (t4 || l4) + "", i5 ? x1.resolveWith(y1, [
                    o5,
                    l4,
                    T1
                ]) : x1.rejectWith(y1, [
                    T1,
                    l4,
                    a3
                ]), T1.statusCode(w1), w1 = void 0, g1 && m1.trigger(i5 ? "ajaxSuccess" : "ajaxError", [
                    T1,
                    v1,
                    i5 ? o5 : a3
                ]), b1.fireWith(y1, [
                    T1,
                    l4
                ]), g1 && (m1.trigger("ajaxComplete", [
                    T1,
                    v1
                ]), (--S.active) || S.event.trigger("ajaxStop")));
            }
            return T1;
        },
        getJSON: function(e1, t3, n6) {
            return S.get(e1, t3, n6, "json");
        },
        getScript: function(e1, t3) {
            return S.get(e1, void 0, t3, "script");
        }
    }), S.each([
        "get",
        "post"
    ], function(e1, i4) {
        S[i4] = function(e3, t3, n6, r2) {
            return m(t3) && (r2 = r2 || n6, n6 = t3, t3 = void 0), S.ajax(S.extend({
                url: e3,
                type: i4,
                dataType: r2,
                data: t3,
                success: n6
            }, S.isPlainObject(e3) && e3));
        };
    }), S.ajaxPrefilter(function(e1) {
        var t3;
        for(t3 in e1.headers)"content-type" === t3.toLowerCase() && (e1.contentType = e1.headers[t3] || "");
    }), S._evalUrl = function(e1, t3, n6) {
        return S.ajax({
            url: e1,
            type: "GET",
            dataType: "script",
            cache: !0,
            async: !1,
            global: !1,
            converters: {
                "text script": function() {
                }
            },
            dataFilter: function(e3) {
                S.globalEval(e3, t3, n6);
            }
        });
    }, S.fn.extend({
        wrapAll: function(e1) {
            var t3;
            return this[0] && (m(e1) && (e1 = e1.call(this[0])), t3 = S(e1, this[0].ownerDocument).eq(0).clone(!0), this[0].parentNode && t3.insertBefore(this[0]), t3.map(function() {
                var e3 = this;
                while(e3.firstElementChild)e3 = e3.firstElementChild;
                return e3;
            }).append(this)), this;
        },
        wrapInner: function(n6) {
            return m(n6) ? this.each(function(e1) {
                S(this).wrapInner(n6.call(this, e1));
            }) : this.each(function() {
                var e1 = S(this), t3 = e1.contents();
                t3.length ? t3.wrapAll(n6) : e1.append(n6);
            });
        },
        wrap: function(t3) {
            var n6 = m(t3);
            return this.each(function(e1) {
                S(this).wrapAll(n6 ? t3.call(this, e1) : t3);
            });
        },
        unwrap: function(e1) {
            return this.parent(e1).not("body").each(function() {
                S(this).replaceWith(this.childNodes);
            }), this;
        }
    }), S.expr.pseudos.hidden = function(e1) {
        return !S.expr.pseudos.visible(e1);
    }, S.expr.pseudos.visible = function(e1) {
        return !!(e1.offsetWidth || e1.offsetHeight || e1.getClientRects().length);
    }, S.ajaxSettings.xhr = function() {
        try {
            return new C.XMLHttpRequest;
        } catch (e1) {
        }
    };
    var Bt = {
        0: 200,
        1223: 204
    }, $t = S.ajaxSettings.xhr();
    y.cors = !!$t && "withCredentials" in $t, y.ajax = $t = !!$t, S.ajaxTransport(function(i4) {
        var o4, a2;
        if (y.cors || $t && !i4.crossDomain) return {
            send: function(e1, t3) {
                var n6, r2 = i4.xhr();
                if (r2.open(i4.type, i4.url, i4.async, i4.username, i4.password), i4.xhrFields) for(n6 in i4.xhrFields)r2[n6] = i4.xhrFields[n6];
                for(n6 in i4.mimeType && r2.overrideMimeType && r2.overrideMimeType(i4.mimeType), i4.crossDomain || e1["X-Requested-With"] || (e1["X-Requested-With"] = "XMLHttpRequest"), e1)r2.setRequestHeader(n6, e1[n6]);
                o4 = function(e3) {
                    return function() {
                        o4 && (o4 = a2 = r2.onload = r2.onerror = r2.onabort = r2.ontimeout = r2.onreadystatechange = null, "abort" === e3 ? r2.abort() : "error" === e3 ? "number" != typeof r2.status ? t3(0, "error") : t3(r2.status, r2.statusText) : t3(Bt[r2.status] || r2.status, r2.statusText, "text" !== (r2.responseType || "text") || "string" != typeof r2.responseText ? {
                            binary: r2.response
                        } : {
                            text: r2.responseText
                        }, r2.getAllResponseHeaders()));
                    };
                }, r2.onload = o4(), a2 = r2.onerror = r2.ontimeout = o4("error"), (void 0) !== r2.onabort ? r2.onabort = a2 : r2.onreadystatechange = function() {
                    4 === r2.readyState && C.setTimeout(function() {
                        o4 && a2();
                    });
                }, o4 = o4("abort");
                try {
                    r2.send(i4.hasContent && i4.data || null);
                } catch (e3) {
                    if (o4) throw e3;
                }
            },
            abort: function() {
                o4 && o4();
            }
        };
    }), S.ajaxPrefilter(function(e1) {
        e1.crossDomain && (e1.contents.script = !1);
    }), S.ajaxSetup({
        accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
        },
        contents: {
            script: /\b(?:java|ecma)script\b/
        },
        converters: {
            "text script": function(e1) {
                return S.globalEval(e1), e1;
            }
        }
    }), S.ajaxPrefilter("script", function(e1) {
        (void 0) === e1.cache && (e1.cache = !1), e1.crossDomain && (e1.type = "GET");
    }), S.ajaxTransport("script", function(n6) {
        var r2, i4;
        if (n6.crossDomain || n6.scriptAttrs) return {
            send: function(e1, t3) {
                r2 = S("<script>").attr(n6.scriptAttrs || {
                }).prop({
                    charset: n6.scriptCharset,
                    src: n6.url
                }).on("load error", i4 = function(e3) {
                    r2.remove(), i4 = null, e3 && t3("error" === e3.type ? 404 : 200, e3.type);
                }), E.head.appendChild(r2[0]);
            },
            abort: function() {
                i4 && i4();
            }
        };
    });
    var _t, zt = [], Ut = /(=)\?(?=&|$)|\?\?/;
    S.ajaxSetup({
        jsonp: "callback",
        jsonpCallback: function() {
            var e1 = zt.pop() || S.expando + "_" + wt.guid++;
            return this[e1] = !0, e1;
        }
    }), S.ajaxPrefilter("json jsonp", function(e1, t3, n6) {
        var r2, i4, o4, a2 = !1 !== e1.jsonp && (Ut.test(e1.url) ? "url" : "string" == typeof e1.data && 0 === (e1.contentType || "").indexOf("application/x-www-form-urlencoded") && Ut.test(e1.data) && "data");
        if (a2 || "jsonp" === e1.dataTypes[0]) return r2 = e1.jsonpCallback = m(e1.jsonpCallback) ? e1.jsonpCallback() : e1.jsonpCallback, a2 ? e1[a2] = e1[a2].replace(Ut, "$1" + r2) : !1 !== e1.jsonp && (e1.url += (Tt.test(e1.url) ? "&" : "?") + e1.jsonp + "=" + r2), e1.converters["script json"] = function() {
            return o4 || S.error(r2 + " was not called"), o4[0];
        }, e1.dataTypes[0] = "json", i4 = C[r2], C[r2] = function() {
            o4 = arguments;
        }, n6.always(function() {
            (void 0) === i4 ? S(C).removeProp(r2) : C[r2] = i4, e1[r2] && (e1.jsonpCallback = t3.jsonpCallback, zt.push(r2)), o4 && m(i4) && i4(o4[0]), o4 = i4 = void 0;
        }), "script";
    }), y.createHTMLDocument = ((_t = E.implementation.createHTMLDocument("").body).innerHTML = "<form></form><form></form>", 2 === _t.childNodes.length), S.parseHTML = function(e1, t3, n6) {
        var r2, i4, o4;
        return "string" != typeof e1 ? [] : ("boolean" == typeof t3 && (n6 = t3, t3 = !1), t3 || (y.createHTMLDocument ? ((r2 = (t3 = E.implementation.createHTMLDocument("")).createElement("base")).href = E.location.href, t3.head.appendChild(r2)) : t3 = E), o4 = !n6 && [], (i4 = N.exec(e1)) ? [
            t3.createElement(i4[1])
        ] : (i4 = xe([
            e1
        ], t3, o4), o4 && o4.length && S(o4).remove(), S.merge([], i4.childNodes)));
    }, S.fn.load = function(e1, t3, n6) {
        var r2, i4, o4, a2 = this, s3 = e1.indexOf(" ");
        return -1 < s3 && (r2 = ht(e1.slice(s3)), e1 = e1.slice(0, s3)), m(t3) ? (n6 = t3, t3 = void 0) : t3 && "object" == typeof t3 && (i4 = "POST"), 0 < a2.length && S.ajax({
            url: e1,
            type: i4 || "GET",
            dataType: "html",
            data: t3
        }).done(function(e3) {
            o4 = arguments, a2.html(r2 ? S("<div>").append(S.parseHTML(e3)).find(r2) : e3);
        }).always(n6 && function(e3, t4) {
            a2.each(function() {
                n6.apply(this, o4 || [
                    e3.responseText,
                    t4,
                    e3
                ]);
            });
        }), this;
    }, S.expr.pseudos.animated = function(t3) {
        return S.grep(S.timers, function(e1) {
            return t3 === e1.elem;
        }).length;
    }, S.offset = {
        setOffset: function(e1, t3, n6) {
            var r2, i4, o4, a2, s3, u3, l3 = S.css(e1, "position"), c1 = S(e1), f1 = {
            };
            "static" === l3 && (e1.style.position = "relative"), s3 = c1.offset(), o4 = S.css(e1, "top"), u3 = S.css(e1, "left"), ("absolute" === l3 || "fixed" === l3) && -1 < (o4 + u3).indexOf("auto") ? (a2 = (r2 = c1.position()).top, i4 = r2.left) : (a2 = parseFloat(o4) || 0, i4 = parseFloat(u3) || 0), m(t3) && (t3 = t3.call(e1, n6, S.extend({
            }, s3))), null != t3.top && (f1.top = t3.top - s3.top + a2), null != t3.left && (f1.left = t3.left - s3.left + i4), "using" in t3 ? t3.using.call(e1, f1) : c1.css(f1);
        }
    }, S.fn.extend({
        offset: function(t3) {
            if (arguments.length) return (void 0) === t3 ? this : this.each(function(e1) {
                S.offset.setOffset(this, t3, e1);
            });
            var e1, n6, r2 = this[0];
            return r2 ? r2.getClientRects().length ? (e1 = r2.getBoundingClientRect(), n6 = r2.ownerDocument.defaultView, {
                top: e1.top + n6.pageYOffset,
                left: e1.left + n6.pageXOffset
            }) : {
                top: 0,
                left: 0
            } : void 0;
        },
        position: function() {
            if (this[0]) {
                var e1, t3, n6, r2 = this[0], i4 = {
                    top: 0,
                    left: 0
                };
                if ("fixed" === S.css(r2, "position")) t3 = r2.getBoundingClientRect();
                else {
                    t3 = this.offset(), n6 = r2.ownerDocument, e1 = r2.offsetParent || n6.documentElement;
                    while(e1 && (e1 === n6.body || e1 === n6.documentElement) && "static" === S.css(e1, "position"))e1 = e1.parentNode;
                    e1 && e1 !== r2 && 1 === e1.nodeType && ((i4 = S(e1).offset()).top += S.css(e1, "borderTopWidth", !0), i4.left += S.css(e1, "borderLeftWidth", !0));
                }
                return {
                    top: t3.top - i4.top - S.css(r2, "marginTop", !0),
                    left: t3.left - i4.left - S.css(r2, "marginLeft", !0)
                };
            }
        },
        offsetParent: function() {
            return this.map(function() {
                var e3 = this.offsetParent;
                while(e3 && "static" === S.css(e3, "position"))e3 = e3.offsetParent;
                return e3 || re;
            });
        }
    }), S.each({
        scrollLeft: "pageXOffset",
        scrollTop: "pageYOffset"
    }, function(t4, i5) {
        var o4 = "pageYOffset" === i5;
        S.fn[t4] = function(e3) {
            return $(this, function(e4, t5, n7) {
                var r4;
                if (x(e4) ? r4 = e4 : 9 === e4.nodeType && (r4 = e4.defaultView), (void 0) === n7) return r4 ? r4[i5] : e4[t5];
                r4 ? r4.scrollTo(o4 ? r4.pageXOffset : n7, o4 ? n7 : r4.pageYOffset) : e4[t5] = n7;
            }, t4, e3, arguments.length);
        };
    }), S.each([
        "top",
        "left"
    ], function(e3, n7) {
        S.cssHooks[n7] = Fe(y.pixelPosition, function(e4, t4) {
            if (t4) return t4 = We(e4, n7), Pe.test(t4) ? S(e4).position()[n7] + "px" : t4;
        });
    }), S.each({
        Height: "height",
        Width: "width"
    }, function(a2, s3) {
        S.each({
            padding: "inner" + a2,
            content: s3,
            "": "outer" + a2
        }, function(r4, o4) {
            S.fn[o4] = function(e3, t4) {
                var n7 = arguments.length && (r4 || "boolean" != typeof e3), i5 = r4 || (!0 === e3 || !0 === t4 ? "margin" : "border");
                return $(this, function(e4, t5, n8) {
                    var r5;
                    return x(e4) ? 0 === o4.indexOf("outer") ? e4["inner" + a2] : e4.document.documentElement["client" + a2] : 9 === e4.nodeType ? (r5 = e4.documentElement, Math.max(e4.body["scroll" + a2], r5["scroll" + a2], e4.body["offset" + a2], r5["offset" + a2], r5["client" + a2])) : (void 0) === n8 ? S.css(e4, t5, i5) : S.style(e4, t5, n8, i5);
                }, s3, n7 ? e3 : void 0, n7);
            };
        });
    }), S.each([
        "ajaxStart",
        "ajaxStop",
        "ajaxComplete",
        "ajaxError",
        "ajaxSuccess",
        "ajaxSend"
    ], function(e3, t4) {
        S.fn[t4] = function(e4) {
            return this.on(t4, e4);
        };
    }), S.fn.extend({
        bind: function(e3, t4, n7) {
            return this.on(e3, null, t4, n7);
        },
        unbind: function(e3, t4) {
            return this.off(e3, null, t4);
        },
        delegate: function(e3, t4, n7, r4) {
            return this.on(t4, e3, n7, r4);
        },
        undelegate: function(e3, t4, n7) {
            return 1 === arguments.length ? this.off(e3, "**") : this.off(t4, e3 || "**", n7);
        },
        hover: function(e3, t4) {
            return this.mouseenter(e3).mouseleave(t4 || e3);
        }
    }), S.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "), function(e3, n7) {
        S.fn[n7] = function(e4, t4) {
            return 0 < arguments.length ? this.on(n7, null, e4, t4) : this.trigger(n7);
        };
    });
    var Xt = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    S.proxy = function(e3, t4) {
        var n7, r4, i5;
        if ("string" == typeof t4 && (n7 = e3[t4], t4 = e3, e3 = n7), m(e3)) return r4 = s1.call(arguments, 2), (i5 = function() {
            return e3.apply(t4 || this, r4.concat(s1.call(arguments)));
        }).guid = e3.guid = e3.guid || S.guid++, i5;
    }, S.holdReady = function(e3) {
        e3 ? S.readyWait++ : S.ready(!0);
    }, S.isArray = Array.isArray, S.parseJSON = JSON.parse, S.nodeName = A, S.isFunction = m, S.isWindow = x, S.camelCase = X, S.type = w, S.now = Date.now, S.isNumeric = function(e3) {
        var t4 = S.type(e3);
        return ("number" === t4 || "string" === t4) && !isNaN(e3 - parseFloat(e3));
    }, S.trim = function(e3) {
        return null == e3 ? "" : (e3 + "").replace(Xt, "");
    }, "function" == typeof define && define.amd && define("jquery", [], function() {
        return S;
    });
    var Vt = C.jQuery, Gt = C.$;
    return S.noConflict = function(e3) {
        return C.$ === S && (C.$ = Gt), e3 && C.jQuery === S && (C.jQuery = Vt), S;
    }, "undefined" == typeof e && (C.jQuery = C.$ = S), S;
});

//# sourceMappingURL=index.596f739b.js.map
