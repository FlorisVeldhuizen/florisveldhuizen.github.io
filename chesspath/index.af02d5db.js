// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (modules, entry, mainEntry, parcelRequireName, globalName) {
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
      var res = localRequire.resolve(x);
      return res === false ? {} : newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
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
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  Object.defineProperty(newRequire, 'root', {
    get: function () {
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
      define(function () {
        return mainExports;
      });

      // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }
})({"iM15Q":[function(require,module,exports) {
"use strict";
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SECURE = false;
var HMR_ENV_HASH = "d6ea1d42532a7575";
module.bundle.HMR_BUNDLE_ID = "489edce6af02d5db";
function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
function _createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (!it) {
        if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
            if (it) o = it;
            var i = 0;
            var F = function F() {
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
            it = it.call(o);
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
            if (typeof document !== 'undefined') removeErrorOverlay();
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
                }
            } catch (err) {
                _iterator.e(err);
            } finally{
                _iterator.f();
            }
            if (typeof document !== 'undefined') {
                // Render the fancy html overlay
                removeErrorOverlay();
                var overlay = createErrorOverlay(data.diagnostics.html); // $FlowFixMe
                document.body.appendChild(overlay);
            }
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
            errorHTML += "\n      <div>\n        <div style=\"font-size: 18px; font-weight: bold; margin-top: 20px;\">\n          \uD83D\uDEA8 ".concat(diagnostic.message, "\n        </div>\n        <pre>").concat(stack, "</pre>\n        <div>\n          ").concat(diagnostic.hints.map(function(hint) {
                return '<div>💡 ' + hint + '</div>';
            }).join(''), "\n        </div>\n        ").concat(diagnostic.documentation ? "<div>\uD83D\uDCDD <a style=\"color: violet\" href=\"".concat(diagnostic.documentation, "\" target=\"_blank\">Learn more</a></div>") : '', "\n      </div>\n    ");
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
    if (asset.type === 'css') reloadCSS();
    else if (asset.type === 'js') {
        var deps = asset.depsByBundle[bundle.HMR_BUNDLE_ID];
        if (deps) {
            if (modules[asset.id]) {
                // Remove dependencies that are removed and will become orphaned.
                // This is necessary so that if the asset is added back again, the cache is gone, and we prevent a full page reload.
                var oldDeps = modules[asset.id][1];
                for(var dep in oldDeps)if (!deps[dep] || deps[dep] !== oldDeps[dep]) {
                    var id = oldDeps[dep];
                    var parents = getParents(module.bundle.root, id);
                    if (parents.length === 1) hmrDelete(module.bundle.root, id);
                }
            }
            var fn = new Function('require', 'module', 'exports', asset.output);
            modules[asset.id] = [
                fn,
                deps
            ];
        } else if (bundle.parent) hmrApply(bundle.parent, asset);
    }
}
function hmrDelete(bundle, id1) {
    var modules = bundle.modules;
    if (!modules) return;
    if (modules[id1]) {
        // Collect dependencies that will become orphaned when this module is deleted.
        var deps = modules[id1][1];
        var orphans = [];
        for(var dep in deps){
            var parents = getParents(module.bundle.root, deps[dep]);
            if (parents.length === 1) orphans.push(deps[dep]);
        } // Delete the module. This must be done before deleting dependencies in case of circular dependencies.
        delete modules[id1];
        delete bundle.cache[id1]; // Now delete the orphans.
        orphans.forEach(function(id) {
            hmrDelete(module.bundle.root, id);
        });
    } else if (bundle.parent) hmrDelete(bundle.parent, id1);
}
function hmrAcceptCheck(bundle, id, depsByBundle) {
    if (hmrAcceptCheckOne(bundle, id, depsByBundle)) return true;
     // Traverse parents breadth first. All possible ancestries must accept the HMR update, or we'll reload.
    var parents = getParents(module.bundle.root, id);
    var accepted = false;
    while(parents.length > 0){
        var v = parents.shift();
        var a = hmrAcceptCheckOne(v[0], v[1], null);
        if (a) // If this parent accepts, stop traversing upward, but still consider siblings.
        accepted = true;
        else {
            // Otherwise, queue the parents in the next level upward.
            var p = getParents(module.bundle.root, v[1]);
            if (p.length === 0) {
                // If there are no parents, then we've reached an entry without accepting. Reload.
                accepted = false;
                break;
            }
            parents.push.apply(parents, _toConsumableArray(p));
        }
    }
    return accepted;
}
function hmrAcceptCheckOne(bundle, id, depsByBundle) {
    var modules = bundle.modules;
    if (!modules) return;
    if (depsByBundle && !depsByBundle[bundle.HMR_BUNDLE_ID]) {
        // If we reached the root bundle without finding where the asset should go,
        // there's nothing to do. Mark as "accepted" so we don't reload the page.
        if (!bundle.parent) return true;
        return hmrAcceptCheck(bundle.parent, id, depsByBundle);
    }
    if (checkedAssets[id]) return true;
    checkedAssets[id] = true;
    var cached = bundle.cache[id];
    assetsToAccept.push([
        bundle,
        id
    ]);
    if (!cached || cached.hot && cached.hot._acceptCallbacks.length) return true;
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

},{}],"lQMrW":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
/* global Phaser, $ */ var _pathfinding = require("pathfinding");
var _pathfindingDefault = parcelHelpers.interopDefault(_pathfinding);
var _groundPng = require("../img/ground.png");
var _groundPngDefault = parcelHelpers.interopDefault(_groundPng);
var _knightPng = require("../img/knight.png");
var _knightPngDefault = parcelHelpers.interopDefault(_knightPng);
var _bishopPng = require("../img/bishop.png");
var _bishopPngDefault = parcelHelpers.interopDefault(_bishopPng);
var _bishopOddPng = require("../img/bishop-odd.png");
var _bishopOddPngDefault = parcelHelpers.interopDefault(_bishopOddPng);
var _princhessPng = require("../img/princhess.png");
var _princhessPngDefault = parcelHelpers.interopDefault(_princhessPng);
const tileSize = 48;
let score = 0;
console.log("game start!");
/*
 * -----------------------------
 *      CHESS PATHFINDING
 * -----------------------------
 */ function getChessNeighbors(node) {
    const { nodes  } = this;
    let explore;
    const curx = node.x;
    const cury = node.y;
    const possibleMoves = [];
    const { piece  } = this;
    const findMove = (dx, dy, grid1)=>{
        let x = curx + dx;
        let y = cury + dy;
        while(grid1.isWalkableAt(x, y)){
            possibleMoves.push(nodes[y][x]);
            if (explore.single) break;
            x += dx;
            y += dy;
        }
    };
    if (piece === "rook") explore = [
        [
            0,
            1
        ],
        [
            1,
            0
        ],
        [
            0,
            -1
        ],
        [
            -1,
            0
        ], 
    ];
    else if (piece === "bishop") explore = [
        [
            1,
            1
        ],
        [
            1,
            -1
        ],
        [
            -1,
            1
        ],
        [
            -1,
            -1
        ], 
    ];
    else if (piece === "knight") {
        explore = [
            [
                2,
                1
            ],
            [
                1,
                2
            ],
            [
                -1,
                2
            ],
            [
                -2,
                1
            ],
            [
                -2,
                -1
            ],
            [
                -1,
                -2
            ],
            [
                1,
                -2
            ],
            [
                2,
                -1
            ], 
        ];
        explore.single = true;
    } else if (piece === "king" || piece === "queen") {
        explore = [
            [
                1,
                0
            ],
            [
                0,
                1
            ],
            [
                -1,
                0
            ],
            [
                0,
                -1
            ],
            [
                1,
                1
            ],
            [
                1,
                -1
            ],
            [
                -1,
                -1
            ],
            [
                -1,
                1
            ], 
        ];
        if (piece === "king") explore.single = true;
    }
    for(let i = 0; i < explore.length; i += 1){
        const dx = explore[i][0];
        const dy = explore[i][1];
        findMove(dx, dy, this);
    }
    return possibleMoves;
}
// game level (walkability)
const matrix = [
    [
        0,
        0,
        0,
        1,
        0,
        0,
        1,
        0,
        0,
        0,
        1,
        0
    ],
    [
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        1,
        0,
        1,
        0,
        1
    ],
    [
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
        1,
        0,
        1,
        0
    ],
    [
        1,
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
        1
    ],
    [
        0,
        0,
        1,
        0,
        0,
        0,
        1,
        0,
        1,
        0,
        1,
        0
    ],
    [
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        1,
        1
    ],
    [
        1,
        0,
        0,
        0,
        1,
        0,
        1,
        0,
        1,
        1,
        0,
        0
    ],
    [
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1
    ],
    [
        1,
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
        1
    ],
    [
        0,
        0,
        1,
        0,
        0,
        0,
        1,
        0,
        1,
        0,
        1,
        0
    ],
    [
        1,
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
        1
    ],
    [
        0,
        0,
        1,
        0,
        0,
        0,
        1,
        0,
        1,
        0,
        1,
        0
    ], 
];
const grid = new _pathfindingDefault.default.Grid(matrix);
const finder = new _pathfindingDefault.default.AStarFinder({
    heuristic (x, y) {
        return 0.1 * (x + y); // Lower number means better paths, worse performace.
    }
});
const findPath = (x1, y1, x2, y2, piece)=>{
    const chessGrid = grid.clone();
    chessGrid.piece = piece;
    chessGrid.getNeighbors = getChessNeighbors;
    const path = finder.findPath(x1, y1, x2, y2, chessGrid);
    return path;
};
findPath(1, 7, 5, 6, "knight");
/*
 * -----------------
 *      PHASER
 * -----------------
 */ // global game variables
let map;
let enemies;
let mainCharacter;
let uiOverlay;
let game;
const enemytypes = [
    "knight",
    "bishop"
];
// global game functions
const preload = ()=>{
    game.load.image("ground", _groundPngDefault.default);
    game.load.image("enemy-knight", _knightPngDefault.default);
    game.load.image("enemy-bishop", _bishopPngDefault.default);
    game.load.image("enemy-bishop-odd", _bishopOddPngDefault.default);
    game.load.spritesheet("main-character", _princhessPngDefault.default, 24, 35);
};
const update = ()=>{
};
const render = ()=>{
};
// Other Global functions
const drawMoves = (moves)=>{
    uiOverlay.beginFill(26112, 0.5);
    for(let i = 0; i < moves.length; i += 1){
        const sx = moves[i].x;
        const sy = moves[i].y;
        uiOverlay.drawCircle(sx * tileSize + tileSize / 2, sy * tileSize + tileSize / 2, tileSize / 1.5);
    }
    uiOverlay.endFill();
};
const getUpdatedGrid = ()=>{
    const newGrid = grid.clone();
    for(let i = 0; i < enemies.children.length; i += 1){
        const x = Math.floor(enemies.children[i].x / tileSize);
        const y = Math.floor(enemies.children[i].y / tileSize);
        newGrid.setWalkableAt(x, y, false);
    }
    return newGrid;
};
const moveEnemies = ()=>{
    for(let i = 0; i < enemies.children.length; i += 1){
        const x = Math.floor(enemies.children[i].x / tileSize);
        const y = Math.floor(enemies.children[i].y / tileSize);
        const currentGrid = getUpdatedGrid();
        currentGrid.piece = enemies.children[i].piece;
        currentGrid.getNeighbors = getChessNeighbors;
        const path = finder.findPath(x, y, Math.floor(mainCharacter.x / tileSize), Math.floor(mainCharacter.y / tileSize), currentGrid);
        if (path.length > 0) {
            enemies.children[i].x = path[1][0] * tileSize;
            enemies.children[i].y = path[1][1] * tileSize;
        }
    }
};
const addEnemy = (x, y, type)=>{
    enemies.create(x * tileSize, y * tileSize, `enemy-${type}${x % 2 * (y % 2) + (x + 1) % 2 * ((y + 1) % 2) === 1 && type === "bishop" ? "-odd" : ""}`);
    enemies.children[enemies.children.length - 1].piece = type;
    enemies.children[enemies.children.length - 1].anchor.y = 0.35;
    enemies.children[enemies.children.length - 1].anchor.x = -0.15;
};
const addRandomEnemy = ()=>{
    const x = Math.floor(Math.random() * matrix.length);
    const y = Math.floor(Math.random() * matrix.length);
    const currentGrid = getUpdatedGrid();
    currentGrid.setWalkableAt(Math.floor(mainCharacter.x / tileSize), Math.floor(mainCharacter.y / tileSize), false);
    if (currentGrid.isWalkableAt(x, y)) addEnemy(x, y, enemytypes[Math.floor(Math.random() * enemytypes.length)]);
    else addRandomEnemy();
};
const getMainMoves = (forceLegal)=>{
    // First, check if our move was legal. Based on previously determined legal moves/current position
    let legalMove = forceLegal === true;
    for(let i = 0; i < mainCharacter.oldMoves.length && !legalMove; i += 1)legalMove = mainCharacter.oldMoves[i].x === Math.floor(mainCharacter.x / tileSize) && mainCharacter.oldMoves[i].y === Math.floor(mainCharacter.y / tileSize);
    for(let i1 = 0; i1 < enemies.children.length && !legalMove; i1 += 1)legalMove = Math.floor(enemies.children[i1].x / tileSize) === Math.floor(mainCharacter.x / tileSize) && Math.floor(enemies.children[i1].y / tileSize) === Math.floor(mainCharacter.y / tileSize);
    // If the move is legal, move the character, get new possible moves and draw those.
    if (legalMove) {
        // erase possible moves
        uiOverlay.clear();
        // move character
        mainCharacter.oldPosition = {
            x: mainCharacter.x,
            y: mainCharacter.y
        };
        const x = Math.floor(mainCharacter.x / tileSize);
        const y = Math.floor(mainCharacter.y / tileSize);
        //
        const node = {
            x,
            y
        };
        let currentGrid = getUpdatedGrid();
        currentGrid.piece = "queen";
        currentGrid.getNeighbors = getChessNeighbors;
        // check if any enemy was killed
        const enemyKilled = !currentGrid.isWalkableAt(x, y);
        if (enemyKilled) {
            console.log("you killed an enemy!");
            score += 1;
            $("h1").html(score);
            for(let i = 0; i < enemies.children.length; i += 1){
                const ex = Math.floor(enemies.children[i].x / tileSize);
                const ey = Math.floor(enemies.children[i].y / tileSize);
                if (x === ex && y === ey) {
                    enemies.children[i].kill();
                    enemies.removeChild(enemies.children[i]);
                }
            }
        }
        moveEnemies();
        if (enemyKilled) {
            addRandomEnemy();
            addRandomEnemy();
        }
        // check if dead
        if (!getUpdatedGrid().isWalkableAt(x, y)) {
            console.log("you're dead!");
            mainCharacter.kill();
            $("body").append('<h1><a href="index.html">Game over :( - Play again!</a></h1>');
            return;
        }
        currentGrid = getUpdatedGrid();
        currentGrid.piece = "queen";
        currentGrid.getNeighbors = getChessNeighbors;
        const moves = currentGrid.getNeighbors(node, null);
        mainCharacter.oldMoves = moves;
        drawMoves(moves);
    } else {
        mainCharacter.x = mainCharacter.oldPosition.x;
        mainCharacter.y = mainCharacter.oldPosition.y;
    }
};
const create = ()=>{
    // initialize and draw map
    map = game.add.tilemap();
    map.tileWidth = tileSize;
    map.tileHeight = tileSize;
    map.addTilesetImage("ground");
    const levelLayer = map.create("level1", matrix[0].length, matrix.length, tileSize, tileSize);
    levelLayer.resizeWorld();
    for(let y = 0; y < matrix.length; y += 1)for(let x = 0; x < matrix[y].length; x += 1)map.putTile(matrix[y][x] * 2 + x % 2 * (y % 2) + (x + 1) % 2 * ((y + 1) % 2), x, y, levelLayer);
    // UI Overlay
    uiOverlay = game.add.graphics(0, 0);
    // Enemies
    enemies = game.add.group();
    addEnemy(3, 3, "knight");
    // main character
    mainCharacter = game.add.sprite(0, 0, "main-character");
    mainCharacter.oldPosition = {
        x: 0,
        y: 0
    };
    mainCharacter.oldMoves = [];
    mainCharacter.width = 24;
    mainCharacter.height = 35;
    mainCharacter.anchor.x = -0.475;
    mainCharacter.anchor.y = -0.1825;
    mainCharacter.animations.add("idle", [
        0,
        1,
        2,
        3
    ], 5, true);
    mainCharacter.animations.play("idle");
    mainCharacter.inputEnabled = true;
    mainCharacter.input.enableDrag();
    mainCharacter.input.enableSnap(tileSize, tileSize, false, true);
    mainCharacter.input.useHandCursor = true;
    mainCharacter.events.onDragStop.add(getMainMoves);
    getMainMoves(true);
};
game = new Phaser.Game(tileSize * matrix.length, tileSize * matrix.length, Phaser.CANVAS, "chess", {
    preload,
    create,
    update,
    render
});

},{"pathfinding":"lKIQA","../img/ground.png":"h6qr5","../img/knight.png":"fMWAA","../img/bishop.png":"6g5EO","../img/bishop-odd.png":"1vndg","../img/princhess.png":"e6SrJ","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"lKIQA":[function(require,module,exports) {
module.exports = require('./src/PathFinding');

},{"./src/PathFinding":"dGlIt"}],"dGlIt":[function(require,module,exports) {
module.exports = {
    'Heap': require('heap'),
    'Node': require('./core/Node'),
    'Grid': require('./core/Grid'),
    'Util': require('./core/Util'),
    'DiagonalMovement': require('./core/DiagonalMovement'),
    'Heuristic': require('./core/Heuristic'),
    'AStarFinder': require('./finders/AStarFinder'),
    'BestFirstFinder': require('./finders/BestFirstFinder'),
    'BreadthFirstFinder': require('./finders/BreadthFirstFinder'),
    'DijkstraFinder': require('./finders/DijkstraFinder'),
    'BiAStarFinder': require('./finders/BiAStarFinder'),
    'BiBestFirstFinder': require('./finders/BiBestFirstFinder'),
    'BiBreadthFirstFinder': require('./finders/BiBreadthFirstFinder'),
    'BiDijkstraFinder': require('./finders/BiDijkstraFinder'),
    'IDAStarFinder': require('./finders/IDAStarFinder'),
    'JumpPointFinder': require('./finders/JumpPointFinder')
};

},{"heap":"j0cbr","./core/Node":"ka13k","./core/Grid":"5hN4J","./core/Util":"eNIGb","./core/DiagonalMovement":"851FJ","./core/Heuristic":"2no8Q","./finders/AStarFinder":"cCmc5","./finders/BestFirstFinder":"kVeV4","./finders/BreadthFirstFinder":"d8YK3","./finders/DijkstraFinder":"2qj8o","./finders/BiAStarFinder":"j3Dsq","./finders/BiBestFirstFinder":"4DHQl","./finders/BiBreadthFirstFinder":"cdDnY","./finders/BiDijkstraFinder":"4f6FG","./finders/IDAStarFinder":"c5H0a","./finders/JumpPointFinder":"lFhfR"}],"j0cbr":[function(require,module,exports) {
module.exports = require('./lib/heap');

},{"./lib/heap":"gZPHW"}],"gZPHW":[function(require,module,exports) {
// Generated by CoffeeScript 1.8.0
(function() {
    var Heap1, defaultCmp, floor, heapify, heappop, heappush, heappushpop, heapreplace, insort, min, nlargest, nsmallest, updateItem, _siftdown, _siftup;
    floor = Math.floor, min = Math.min;
    /*
  Default comparison function to be used
   */ defaultCmp = function(x, y) {
        if (x < y) return -1;
        if (x > y) return 1;
        return 0;
    };
    /*
  Insert item x in list a, and keep it sorted assuming a is sorted.
  
  If x is already in a, insert it to the right of the rightmost x.
  
  Optional args lo (default 0) and hi (default a.length) bound the slice
  of a to be searched.
   */ insort = function(a, x, lo, hi, cmp) {
        var mid;
        if (lo == null) lo = 0;
        if (cmp == null) cmp = defaultCmp;
        if (lo < 0) throw new Error('lo must be non-negative');
        if (hi == null) hi = a.length;
        while(lo < hi){
            mid = floor((lo + hi) / 2);
            if (cmp(x, a[mid]) < 0) hi = mid;
            else lo = mid + 1;
        }
        return [].splice.apply(a, [
            lo,
            lo - lo
        ].concat(x)), x;
    };
    /*
  Push item onto heap, maintaining the heap invariant.
   */ heappush = function(array, item, cmp) {
        if (cmp == null) cmp = defaultCmp;
        array.push(item);
        return _siftdown(array, 0, array.length - 1, cmp);
    };
    /*
  Pop the smallest item off the heap, maintaining the heap invariant.
   */ heappop = function(array, cmp) {
        var lastelt, returnitem;
        if (cmp == null) cmp = defaultCmp;
        lastelt = array.pop();
        if (array.length) {
            returnitem = array[0];
            array[0] = lastelt;
            _siftup(array, 0, cmp);
        } else returnitem = lastelt;
        return returnitem;
    };
    /*
  Pop and return the current smallest value, and add the new item.
  
  This is more efficient than heappop() followed by heappush(), and can be
  more appropriate when using a fixed size heap. Note that the value
  returned may be larger than item! That constrains reasonable use of
  this routine unless written as part of a conditional replacement:
      if item > array[0]
        item = heapreplace(array, item)
   */ heapreplace = function(array, item, cmp) {
        var returnitem;
        if (cmp == null) cmp = defaultCmp;
        returnitem = array[0];
        array[0] = item;
        _siftup(array, 0, cmp);
        return returnitem;
    };
    /*
  Fast version of a heappush followed by a heappop.
   */ heappushpop = function(array, item, cmp) {
        var _ref;
        if (cmp == null) cmp = defaultCmp;
        if (array.length && cmp(array[0], item) < 0) {
            _ref = [
                array[0],
                item
            ], item = _ref[0], array[0] = _ref[1];
            _siftup(array, 0, cmp);
        }
        return item;
    };
    /*
  Transform list into a heap, in-place, in O(array.length) time.
   */ heapify = function(array, cmp) {
        var i, _i, _j1, _len, _ref2, _ref1, _results, _results1;
        if (cmp == null) cmp = defaultCmp;
        _ref1 = (function() {
            _results1 = [];
            for(var _j = 0, _ref = floor(array.length / 2); 0 <= _ref ? _j < _ref : _j > _ref; 0 <= _ref ? _j++ : _j--)_results1.push(_j);
            return _results1;
        }).apply(this).reverse();
        _results = [];
        for(_i = 0, _len = _ref1.length; _i < _len; _i++){
            i = _ref1[_i];
            _results.push(_siftup(array, i, cmp));
        }
        return _results;
    };
    /*
  Update the position of the given item in the heap.
  This function should be called every time the item is being modified.
   */ updateItem = function(array, item, cmp) {
        var pos;
        if (cmp == null) cmp = defaultCmp;
        pos = array.indexOf(item);
        if (pos === -1) return;
        _siftdown(array, 0, pos, cmp);
        return _siftup(array, pos, cmp);
    };
    /*
  Find the n largest elements in a dataset.
   */ nlargest = function(array, n, cmp) {
        var elem, result, _i, _len, _ref;
        if (cmp == null) cmp = defaultCmp;
        result = array.slice(0, n);
        if (!result.length) return result;
        heapify(result, cmp);
        _ref = array.slice(n);
        for(_i = 0, _len = _ref.length; _i < _len; _i++){
            elem = _ref[_i];
            heappushpop(result, elem, cmp);
        }
        return result.sort(cmp).reverse();
    };
    /*
  Find the n smallest elements in a dataset.
   */ nsmallest = function(array, n, cmp) {
        var elem, i, los, result, _i, _j, _len, _ref, _ref1, _results;
        if (cmp == null) cmp = defaultCmp;
        if (n * 10 <= array.length) {
            result = array.slice(0, n).sort(cmp);
            if (!result.length) return result;
            los = result[result.length - 1];
            _ref = array.slice(n);
            for(_i = 0, _len = _ref.length; _i < _len; _i++){
                elem = _ref[_i];
                if (cmp(elem, los) < 0) {
                    insort(result, elem, 0, null, cmp);
                    result.pop();
                    los = result[result.length - 1];
                }
            }
            return result;
        }
        heapify(array, cmp);
        _results = [];
        for(i = _j = 0, _ref1 = min(n, array.length); 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j)_results.push(heappop(array, cmp));
        return _results;
    };
    _siftdown = function(array, startpos, pos, cmp) {
        var newitem, parent, parentpos;
        if (cmp == null) cmp = defaultCmp;
        newitem = array[pos];
        while(pos > startpos){
            parentpos = pos - 1 >> 1;
            parent = array[parentpos];
            if (cmp(newitem, parent) < 0) {
                array[pos] = parent;
                pos = parentpos;
                continue;
            }
            break;
        }
        return array[pos] = newitem;
    };
    _siftup = function(array, pos, cmp) {
        var childpos, endpos, newitem, rightpos, startpos;
        if (cmp == null) cmp = defaultCmp;
        endpos = array.length;
        startpos = pos;
        newitem = array[pos];
        childpos = 2 * pos + 1;
        while(childpos < endpos){
            rightpos = childpos + 1;
            if (rightpos < endpos && !(cmp(array[childpos], array[rightpos]) < 0)) childpos = rightpos;
            array[pos] = array[childpos];
            pos = childpos;
            childpos = 2 * pos + 1;
        }
        array[pos] = newitem;
        return _siftdown(array, startpos, pos, cmp);
    };
    Heap1 = (function() {
        Heap.push = heappush;
        Heap.pop = heappop;
        Heap.replace = heapreplace;
        Heap.pushpop = heappushpop;
        Heap.heapify = heapify;
        Heap.updateItem = updateItem;
        Heap.nlargest = nlargest;
        Heap.nsmallest = nsmallest;
        function Heap(cmp) {
            this.cmp = cmp != null ? cmp : defaultCmp;
            this.nodes = [];
        }
        Heap.prototype.push = function(x) {
            return heappush(this.nodes, x, this.cmp);
        };
        Heap.prototype.pop = function() {
            return heappop(this.nodes, this.cmp);
        };
        Heap.prototype.peek = function() {
            return this.nodes[0];
        };
        Heap.prototype.contains = function(x) {
            return this.nodes.indexOf(x) !== -1;
        };
        Heap.prototype.replace = function(x) {
            return heapreplace(this.nodes, x, this.cmp);
        };
        Heap.prototype.pushpop = function(x) {
            return heappushpop(this.nodes, x, this.cmp);
        };
        Heap.prototype.heapify = function() {
            return heapify(this.nodes, this.cmp);
        };
        Heap.prototype.updateItem = function(x) {
            return updateItem(this.nodes, x, this.cmp);
        };
        Heap.prototype.clear = function() {
            return this.nodes = [];
        };
        Heap.prototype.empty = function() {
            return this.nodes.length === 0;
        };
        Heap.prototype.size = function() {
            return this.nodes.length;
        };
        Heap.prototype.clone = function() {
            var heap;
            heap = new Heap();
            heap.nodes = this.nodes.slice(0);
            return heap;
        };
        Heap.prototype.toArray = function() {
            return this.nodes.slice(0);
        };
        Heap.prototype.insert = Heap.prototype.push;
        Heap.prototype.top = Heap.prototype.peek;
        Heap.prototype.front = Heap.prototype.peek;
        Heap.prototype.has = Heap.prototype.contains;
        Heap.prototype.copy = Heap.prototype.clone;
        return Heap;
    })();
    if (typeof module !== "undefined" && module !== null ? module.exports : void 0) module.exports = Heap1;
    else window.Heap = Heap1;
}).call(this);

},{}],"ka13k":[function(require,module,exports) {
/**
 * A node in grid. 
 * This class holds some basic information about a node and custom 
 * attributes may be added, depending on the algorithms' needs.
 * @constructor
 * @param {number} x - The x coordinate of the node on the grid.
 * @param {number} y - The y coordinate of the node on the grid.
 * @param {boolean} [walkable] - Whether this node is walkable.
 */ function Node(x, y, walkable) {
    /**
     * The x coordinate of the node on the grid.
     * @type number
     */ this.x = x;
    /**
     * The y coordinate of the node on the grid.
     * @type number
     */ this.y = y;
    /**
     * Whether this node can be walked through.
     * @type boolean
     */ this.walkable = walkable === undefined ? true : walkable;
}
module.exports = Node;

},{}],"5hN4J":[function(require,module,exports) {
var Node = require('./Node');
var DiagonalMovement = require('./DiagonalMovement');
/**
 * The Grid class, which serves as the encapsulation of the layout of the nodes.
 * @constructor
 * @param {number|Array<Array<(number|boolean)>>} width_or_matrix Number of columns of the grid, or matrix
 * @param {number} height Number of rows of the grid.
 * @param {Array<Array<(number|boolean)>>} [matrix] - A 0-1 matrix
 *     representing the walkable status of the nodes(0 or false for walkable).
 *     If the matrix is not supplied, all the nodes will be walkable.  */ function Grid(width_or_matrix, height, matrix) {
    var width;
    if (typeof width_or_matrix !== 'object') width = width_or_matrix;
    else {
        height = width_or_matrix.length;
        width = width_or_matrix[0].length;
        matrix = width_or_matrix;
    }
    /**
     * The number of columns of the grid.
     * @type number
     */ this.width = width;
    /**
     * The number of rows of the grid.
     * @type number
     */ this.height = height;
    /**
     * A 2D array of nodes.
     */ this.nodes = this._buildNodes(width, height, matrix);
}
/**
 * Build and return the nodes.
 * @private
 * @param {number} width
 * @param {number} height
 * @param {Array<Array<number|boolean>>} [matrix] - A 0-1 matrix representing
 *     the walkable status of the nodes.
 * @see Grid
 */ Grid.prototype._buildNodes = function(width, height, matrix) {
    var i, j, nodes = new Array(height);
    for(i = 0; i < height; ++i){
        nodes[i] = new Array(width);
        for(j = 0; j < width; ++j)nodes[i][j] = new Node(j, i);
    }
    if (matrix === undefined) return nodes;
    if (matrix.length !== height || matrix[0].length !== width) throw new Error('Matrix size does not fit');
    for(i = 0; i < height; ++i){
        for(j = 0; j < width; ++j)if (matrix[i][j]) // 0, false, null will be walkable
        // while others will be un-walkable
        nodes[i][j].walkable = false;
    }
    return nodes;
};
Grid.prototype.getNodeAt = function(x, y) {
    return this.nodes[y][x];
};
/**
 * Determine whether the node at the given position is walkable.
 * (Also returns false if the position is outside the grid.)
 * @param {number} x - The x coordinate of the node.
 * @param {number} y - The y coordinate of the node.
 * @return {boolean} - The walkability of the node.
 */ Grid.prototype.isWalkableAt = function(x, y) {
    return this.isInside(x, y) && this.nodes[y][x].walkable;
};
/**
 * Determine whether the position is inside the grid.
 * XXX: `grid.isInside(x, y)` is wierd to read.
 * It should be `(x, y) is inside grid`, but I failed to find a better
 * name for this method.
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */ Grid.prototype.isInside = function(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
};
/**
 * Set whether the node on the given position is walkable.
 * NOTE: throws exception if the coordinate is not inside the grid.
 * @param {number} x - The x coordinate of the node.
 * @param {number} y - The y coordinate of the node.
 * @param {boolean} walkable - Whether the position is walkable.
 */ Grid.prototype.setWalkableAt = function(x, y, walkable) {
    this.nodes[y][x].walkable = walkable;
};
/**
 * Get the neighbors of the given node.
 *
 *     offsets      diagonalOffsets:
 *  +---+---+---+    +---+---+---+
 *  |   | 0 |   |    | 0 |   | 1 |
 *  +---+---+---+    +---+---+---+
 *  | 3 |   | 1 |    |   |   |   |
 *  +---+---+---+    +---+---+---+
 *  |   | 2 |   |    | 3 |   | 2 |
 *  +---+---+---+    +---+---+---+
 *
 *  When allowDiagonal is true, if offsets[i] is valid, then
 *  diagonalOffsets[i] and
 *  diagonalOffsets[(i + 1) % 4] is valid.
 * @param {Node} node
 * @param {DiagonalMovement} diagonalMovement
 */ Grid.prototype.getNeighbors = function(node, diagonalMovement) {
    var x = node.x, y = node.y, neighbors = [], s0 = false, d0 = false, s1 = false, d1 = false, s2 = false, d2 = false, s3 = false, d3 = false, nodes = this.nodes;
    // ↑
    if (this.isWalkableAt(x, y - 1)) {
        neighbors.push(nodes[y - 1][x]);
        s0 = true;
    }
    // →
    if (this.isWalkableAt(x + 1, y)) {
        neighbors.push(nodes[y][x + 1]);
        s1 = true;
    }
    // ↓
    if (this.isWalkableAt(x, y + 1)) {
        neighbors.push(nodes[y + 1][x]);
        s2 = true;
    }
    // ←
    if (this.isWalkableAt(x - 1, y)) {
        neighbors.push(nodes[y][x - 1]);
        s3 = true;
    }
    if (diagonalMovement === DiagonalMovement.Never) return neighbors;
    if (diagonalMovement === DiagonalMovement.OnlyWhenNoObstacles) {
        d0 = s3 && s0;
        d1 = s0 && s1;
        d2 = s1 && s2;
        d3 = s2 && s3;
    } else if (diagonalMovement === DiagonalMovement.IfAtMostOneObstacle) {
        d0 = s3 || s0;
        d1 = s0 || s1;
        d2 = s1 || s2;
        d3 = s2 || s3;
    } else if (diagonalMovement === DiagonalMovement.Always) {
        d0 = true;
        d1 = true;
        d2 = true;
        d3 = true;
    } else throw new Error('Incorrect value of diagonalMovement');
    // ↖
    if (d0 && this.isWalkableAt(x - 1, y - 1)) neighbors.push(nodes[y - 1][x - 1]);
    // ↗
    if (d1 && this.isWalkableAt(x + 1, y - 1)) neighbors.push(nodes[y - 1][x + 1]);
    // ↘
    if (d2 && this.isWalkableAt(x + 1, y + 1)) neighbors.push(nodes[y + 1][x + 1]);
    // ↙
    if (d3 && this.isWalkableAt(x - 1, y + 1)) neighbors.push(nodes[y + 1][x - 1]);
    return neighbors;
};
/**
 * Get a clone of this grid.
 * @return {Grid} Cloned grid.
 */ Grid.prototype.clone = function() {
    var i, j, width = this.width, height = this.height, thisNodes = this.nodes, newGrid = new Grid(width, height), newNodes = new Array(height);
    for(i = 0; i < height; ++i){
        newNodes[i] = new Array(width);
        for(j = 0; j < width; ++j)newNodes[i][j] = new Node(j, i, thisNodes[i][j].walkable);
    }
    newGrid.nodes = newNodes;
    return newGrid;
};
module.exports = Grid;

},{"./Node":"ka13k","./DiagonalMovement":"851FJ"}],"851FJ":[function(require,module,exports) {
var DiagonalMovement = {
    Always: 1,
    Never: 2,
    IfAtMostOneObstacle: 3,
    OnlyWhenNoObstacles: 4
};
module.exports = DiagonalMovement;

},{}],"eNIGb":[function(require,module,exports) {
/**
 * Backtrace according to the parent records and return the path.
 * (including both start and end nodes)
 * @param {Node} node End node
 * @return {Array<Array<number>>} the path
 */ function backtrace(node) {
    var path = [
        [
            node.x,
            node.y
        ]
    ];
    while(node.parent){
        node = node.parent;
        path.push([
            node.x,
            node.y
        ]);
    }
    return path.reverse();
}
exports.backtrace = backtrace;
/**
 * Backtrace from start and end node, and return the path.
 * (including both start and end nodes)
 * @param {Node}
 * @param {Node}
 */ function biBacktrace(nodeA, nodeB) {
    var pathA = backtrace(nodeA), pathB = backtrace(nodeB);
    return pathA.concat(pathB.reverse());
}
exports.biBacktrace = biBacktrace;
/**
 * Compute the length of the path.
 * @param {Array<Array<number>>} path The path
 * @return {number} The length of the path
 */ function pathLength(path) {
    var i, sum = 0, a, b, dx, dy;
    for(i = 1; i < path.length; ++i){
        a = path[i - 1];
        b = path[i];
        dx = a[0] - b[0];
        dy = a[1] - b[1];
        sum += Math.sqrt(dx * dx + dy * dy);
    }
    return sum;
}
exports.pathLength = pathLength;
/**
 * Given the start and end coordinates, return all the coordinates lying
 * on the line formed by these coordinates, based on Bresenham's algorithm.
 * http://en.wikipedia.org/wiki/Bresenham's_line_algorithm#Simplification
 * @param {number} x0 Start x coordinate
 * @param {number} y0 Start y coordinate
 * @param {number} x1 End x coordinate
 * @param {number} y1 End y coordinate
 * @return {Array<Array<number>>} The coordinates on the line
 */ function interpolate(x0, y0, x1, y1) {
    var abs = Math.abs, line = [], sx, sy, dx, dy, err, e2;
    dx = abs(x1 - x0);
    dy = abs(y1 - y0);
    sx = x0 < x1 ? 1 : -1;
    sy = y0 < y1 ? 1 : -1;
    err = dx - dy;
    while(true){
        line.push([
            x0,
            y0
        ]);
        if (x0 === x1 && y0 === y1) break;
        e2 = 2 * err;
        if (e2 > -dy) {
            err = err - dy;
            x0 = x0 + sx;
        }
        if (e2 < dx) {
            err = err + dx;
            y0 = y0 + sy;
        }
    }
    return line;
}
exports.interpolate = interpolate;
/**
 * Given a compressed path, return a new path that has all the segments
 * in it interpolated.
 * @param {Array<Array<number>>} path The path
 * @return {Array<Array<number>>} expanded path
 */ function expandPath(path) {
    var expanded = [], len = path.length, coord0, coord1, interpolated, interpolatedLen, i, j;
    if (len < 2) return expanded;
    for(i = 0; i < len - 1; ++i){
        coord0 = path[i];
        coord1 = path[i + 1];
        interpolated = interpolate(coord0[0], coord0[1], coord1[0], coord1[1]);
        interpolatedLen = interpolated.length;
        for(j = 0; j < interpolatedLen - 1; ++j)expanded.push(interpolated[j]);
    }
    expanded.push(path[len - 1]);
    return expanded;
}
exports.expandPath = expandPath;
/**
 * Smoothen the give path.
 * The original path will not be modified; a new path will be returned.
 * @param {PF.Grid} grid
 * @param {Array<Array<number>>} path The path
 */ function smoothenPath(grid, path) {
    var len = path.length, x0 = path[0][0], y0 = path[0][1], x1 = path[len - 1][0], y1 = path[len - 1][1], sx, sy, ex, ey, newPath, i, j, coord, line, testCoord, blocked;
    sx = x0;
    sy = y0;
    newPath = [
        [
            sx,
            sy
        ]
    ];
    for(i = 2; i < len; ++i){
        coord = path[i];
        ex = coord[0];
        ey = coord[1];
        line = interpolate(sx, sy, ex, ey);
        blocked = false;
        for(j = 1; j < line.length; ++j){
            testCoord = line[j];
            if (!grid.isWalkableAt(testCoord[0], testCoord[1])) {
                blocked = true;
                break;
            }
        }
        if (blocked) {
            lastValidCoord = path[i - 1];
            newPath.push(lastValidCoord);
            sx = lastValidCoord[0];
            sy = lastValidCoord[1];
        }
    }
    newPath.push([
        x1,
        y1
    ]);
    return newPath;
}
exports.smoothenPath = smoothenPath;
/**
 * Compress a path, remove redundant nodes without altering the shape
 * The original path is not modified
 * @param {Array<Array<number>>} path The path
 * @return {Array<Array<number>>} The compressed path
 */ function compressPath(path) {
    // nothing to compress
    if (path.length < 3) return path;
    var compressed = [], sx = path[0][0], sy = path[0][1], px = path[1][0], py = path[1][1], dx = px - sx, dy = py - sy, lx, ly, ldx, ldy, sq, i;
    // normalize the direction
    sq = Math.sqrt(dx * dx + dy * dy);
    dx /= sq;
    dy /= sq;
    // start the new path
    compressed.push([
        sx,
        sy
    ]);
    for(i = 2; i < path.length; i++){
        // store the last point
        lx = px;
        ly = py;
        // store the last direction
        ldx = dx;
        ldy = dy;
        // next point
        px = path[i][0];
        py = path[i][1];
        // next direction
        dx = px - lx;
        dy = py - ly;
        // normalize
        sq = Math.sqrt(dx * dx + dy * dy);
        dx /= sq;
        dy /= sq;
        // if the direction has changed, store the point
        if (dx !== ldx || dy !== ldy) compressed.push([
            lx,
            ly
        ]);
    }
    // store the last point
    compressed.push([
        px,
        py
    ]);
    return compressed;
}
exports.compressPath = compressPath;

},{}],"2no8Q":[function(require,module,exports) {
/**
 * @namespace PF.Heuristic
 * @description A collection of heuristic functions.
 */ module.exports = {
    /**
   * Manhattan distance.
   * @param {number} dx - Difference in x.
   * @param {number} dy - Difference in y.
   * @return {number} dx + dy
   */ manhattan: function(dx, dy) {
        return dx + dy;
    },
    /**
   * Euclidean distance.
   * @param {number} dx - Difference in x.
   * @param {number} dy - Difference in y.
   * @return {number} sqrt(dx * dx + dy * dy)
   */ euclidean: function(dx, dy) {
        return Math.sqrt(dx * dx + dy * dy);
    },
    /**
   * Octile distance.
   * @param {number} dx - Difference in x.
   * @param {number} dy - Difference in y.
   * @return {number} sqrt(dx * dx + dy * dy) for grids
   */ octile: function(dx, dy) {
        var F = Math.SQRT2 - 1;
        return dx < dy ? F * dx + dy : F * dy + dx;
    },
    /**
   * Chebyshev distance.
   * @param {number} dx - Difference in x.
   * @param {number} dy - Difference in y.
   * @return {number} max(dx, dy)
   */ chebyshev: function(dx, dy) {
        return Math.max(dx, dy);
    }
};

},{}],"cCmc5":[function(require,module,exports) {
var Heap = require('heap');
var Util = require('../core/Util');
var Heuristic = require('../core/Heuristic');
var DiagonalMovement = require('../core/DiagonalMovement');
/**
 * A* path-finder. Based upon https://github.com/bgrins/javascript-astar
 * @constructor
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching 
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 * @param {number} opt.weight Weight to apply to the heuristic to allow for
 *     suboptimal paths, in order to speed up the search.
 */ function AStarFinder(opt) {
    opt = opt || {
    };
    this.allowDiagonal = opt.allowDiagonal;
    this.dontCrossCorners = opt.dontCrossCorners;
    this.heuristic = opt.heuristic || Heuristic.manhattan;
    this.weight = opt.weight || 1;
    this.diagonalMovement = opt.diagonalMovement;
    if (!this.diagonalMovement) {
        if (!this.allowDiagonal) this.diagonalMovement = DiagonalMovement.Never;
        else if (this.dontCrossCorners) this.diagonalMovement = DiagonalMovement.OnlyWhenNoObstacles;
        else this.diagonalMovement = DiagonalMovement.IfAtMostOneObstacle;
    }
    // When diagonal movement is allowed the manhattan heuristic is not
    //admissible. It should be octile instead
    if (this.diagonalMovement === DiagonalMovement.Never) this.heuristic = opt.heuristic || Heuristic.manhattan;
    else this.heuristic = opt.heuristic || Heuristic.octile;
}
/**
 * Find and return the the path.
 * @return {Array<Array<number>>} The path, including both start and
 *     end positions.
 */ AStarFinder.prototype.findPath = function(startX, startY, endX, endY, grid) {
    var openList = new Heap(function(nodeA, nodeB) {
        return nodeA.f - nodeB.f;
    }), startNode = grid.getNodeAt(startX, startY), endNode = grid.getNodeAt(endX, endY), heuristic = this.heuristic, diagonalMovement = this.diagonalMovement, weight = this.weight, abs = Math.abs, SQRT2 = Math.SQRT2, node, neighbors, neighbor, i, l, x, y, ng;
    // set the `g` and `f` value of the start node to be 0
    startNode.g = 0;
    startNode.f = 0;
    // push the start node into the open list
    openList.push(startNode);
    startNode.opened = true;
    // while the open list is not empty
    while(!openList.empty()){
        // pop the position of node which has the minimum `f` value.
        node = openList.pop();
        node.closed = true;
        // if reached the end position, construct the path and return it
        if (node === endNode) return Util.backtrace(endNode);
        // get neigbours of the current node
        neighbors = grid.getNeighbors(node, diagonalMovement);
        for(i = 0, l = neighbors.length; i < l; ++i){
            neighbor = neighbors[i];
            if (neighbor.closed) continue;
            x = neighbor.x;
            y = neighbor.y;
            // get the distance between current node and the neighbor
            // and calculate the next g score
            ng = node.g + (x - node.x === 0 || y - node.y === 0 ? 1 : SQRT2);
            // check if the neighbor has not been inspected yet, or
            // can be reached with smaller cost from the current node
            if (!neighbor.opened || ng < neighbor.g) {
                neighbor.g = ng;
                neighbor.h = neighbor.h || weight * heuristic(abs(x - endX), abs(y - endY));
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = node;
                if (!neighbor.opened) {
                    openList.push(neighbor);
                    neighbor.opened = true;
                } else // the neighbor can be reached with smaller cost.
                // Since its f value has been updated, we have to
                // update its position in the open list
                openList.updateItem(neighbor);
            }
        } // end for each neighbor
    } // end while not open list empty
    // fail to find the path
    return [];
};
module.exports = AStarFinder;

},{"heap":"j0cbr","../core/Util":"eNIGb","../core/Heuristic":"2no8Q","../core/DiagonalMovement":"851FJ"}],"kVeV4":[function(require,module,exports) {
var AStarFinder = require('./AStarFinder');
/**
 * Best-First-Search path-finder.
 * @constructor
 * @extends AStarFinder
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 */ function BestFirstFinder(opt) {
    AStarFinder.call(this, opt);
    var orig = this.heuristic;
    this.heuristic = function(dx, dy) {
        return orig(dx, dy) * 1000000;
    };
}
BestFirstFinder.prototype = new AStarFinder();
BestFirstFinder.prototype.constructor = BestFirstFinder;
module.exports = BestFirstFinder;

},{"./AStarFinder":"cCmc5"}],"d8YK3":[function(require,module,exports) {
var Util = require('../core/Util');
var DiagonalMovement = require('../core/DiagonalMovement');
/**
 * Breadth-First-Search path finder.
 * @constructor
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 */ function BreadthFirstFinder(opt) {
    opt = opt || {
    };
    this.allowDiagonal = opt.allowDiagonal;
    this.dontCrossCorners = opt.dontCrossCorners;
    this.diagonalMovement = opt.diagonalMovement;
    if (!this.diagonalMovement) {
        if (!this.allowDiagonal) this.diagonalMovement = DiagonalMovement.Never;
        else if (this.dontCrossCorners) this.diagonalMovement = DiagonalMovement.OnlyWhenNoObstacles;
        else this.diagonalMovement = DiagonalMovement.IfAtMostOneObstacle;
    }
}
/**
 * Find and return the the path.
 * @return {Array<Array<number>>} The path, including both start and
 *     end positions.
 */ BreadthFirstFinder.prototype.findPath = function(startX, startY, endX, endY, grid) {
    var openList = [], diagonalMovement = this.diagonalMovement, startNode = grid.getNodeAt(startX, startY), endNode = grid.getNodeAt(endX, endY), neighbors, neighbor, node, i, l;
    // push the start pos into the queue
    openList.push(startNode);
    startNode.opened = true;
    // while the queue is not empty
    while(openList.length){
        // take the front node from the queue
        node = openList.shift();
        node.closed = true;
        // reached the end position
        if (node === endNode) return Util.backtrace(endNode);
        neighbors = grid.getNeighbors(node, diagonalMovement);
        for(i = 0, l = neighbors.length; i < l; ++i){
            neighbor = neighbors[i];
            // skip this neighbor if it has been inspected before
            if (neighbor.closed || neighbor.opened) continue;
            openList.push(neighbor);
            neighbor.opened = true;
            neighbor.parent = node;
        }
    }
    // fail to find the path
    return [];
};
module.exports = BreadthFirstFinder;

},{"../core/Util":"eNIGb","../core/DiagonalMovement":"851FJ"}],"2qj8o":[function(require,module,exports) {
var AStarFinder = require('./AStarFinder');
/**
 * Dijkstra path-finder.
 * @constructor
 * @extends AStarFinder
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 */ function DijkstraFinder(opt) {
    AStarFinder.call(this, opt);
    this.heuristic = function(dx, dy) {
        return 0;
    };
}
DijkstraFinder.prototype = new AStarFinder();
DijkstraFinder.prototype.constructor = DijkstraFinder;
module.exports = DijkstraFinder;

},{"./AStarFinder":"cCmc5"}],"j3Dsq":[function(require,module,exports) {
var Heap = require('heap');
var Util = require('../core/Util');
var Heuristic = require('../core/Heuristic');
var DiagonalMovement = require('../core/DiagonalMovement');
/**
 * A* path-finder.
 * based upon https://github.com/bgrins/javascript-astar
 * @constructor
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 * @param {number} opt.weight Weight to apply to the heuristic to allow for
 *     suboptimal paths, in order to speed up the search.
 */ function BiAStarFinder(opt) {
    opt = opt || {
    };
    this.allowDiagonal = opt.allowDiagonal;
    this.dontCrossCorners = opt.dontCrossCorners;
    this.diagonalMovement = opt.diagonalMovement;
    this.heuristic = opt.heuristic || Heuristic.manhattan;
    this.weight = opt.weight || 1;
    if (!this.diagonalMovement) {
        if (!this.allowDiagonal) this.diagonalMovement = DiagonalMovement.Never;
        else if (this.dontCrossCorners) this.diagonalMovement = DiagonalMovement.OnlyWhenNoObstacles;
        else this.diagonalMovement = DiagonalMovement.IfAtMostOneObstacle;
    }
    //When diagonal movement is allowed the manhattan heuristic is not admissible
    //It should be octile instead
    if (this.diagonalMovement === DiagonalMovement.Never) this.heuristic = opt.heuristic || Heuristic.manhattan;
    else this.heuristic = opt.heuristic || Heuristic.octile;
}
/**
 * Find and return the the path.
 * @return {Array<Array<number>>} The path, including both start and
 *     end positions.
 */ BiAStarFinder.prototype.findPath = function(startX, startY, endX, endY, grid) {
    var cmp = function(nodeA, nodeB) {
        return nodeA.f - nodeB.f;
    }, startOpenList = new Heap(cmp), endOpenList = new Heap(cmp), startNode = grid.getNodeAt(startX, startY), endNode = grid.getNodeAt(endX, endY), heuristic = this.heuristic, diagonalMovement = this.diagonalMovement, weight = this.weight, abs = Math.abs, SQRT2 = Math.SQRT2, node, neighbors, neighbor, i, l, x, y, ng, BY_START = 1, BY_END = 2;
    // set the `g` and `f` value of the start node to be 0
    // and push it into the start open list
    startNode.g = 0;
    startNode.f = 0;
    startOpenList.push(startNode);
    startNode.opened = BY_START;
    // set the `g` and `f` value of the end node to be 0
    // and push it into the open open list
    endNode.g = 0;
    endNode.f = 0;
    endOpenList.push(endNode);
    endNode.opened = BY_END;
    // while both the open lists are not empty
    while(!startOpenList.empty() && !endOpenList.empty()){
        // pop the position of start node which has the minimum `f` value.
        node = startOpenList.pop();
        node.closed = true;
        // get neigbours of the current node
        neighbors = grid.getNeighbors(node, diagonalMovement);
        for(i = 0, l = neighbors.length; i < l; ++i){
            neighbor = neighbors[i];
            if (neighbor.closed) continue;
            if (neighbor.opened === BY_END) return Util.biBacktrace(node, neighbor);
            x = neighbor.x;
            y = neighbor.y;
            // get the distance between current node and the neighbor
            // and calculate the next g score
            ng = node.g + (x - node.x === 0 || y - node.y === 0 ? 1 : SQRT2);
            // check if the neighbor has not been inspected yet, or
            // can be reached with smaller cost from the current node
            if (!neighbor.opened || ng < neighbor.g) {
                neighbor.g = ng;
                neighbor.h = neighbor.h || weight * heuristic(abs(x - endX), abs(y - endY));
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = node;
                if (!neighbor.opened) {
                    startOpenList.push(neighbor);
                    neighbor.opened = BY_START;
                } else // the neighbor can be reached with smaller cost.
                // Since its f value has been updated, we have to
                // update its position in the open list
                startOpenList.updateItem(neighbor);
            }
        } // end for each neighbor
        // pop the position of end node which has the minimum `f` value.
        node = endOpenList.pop();
        node.closed = true;
        // get neigbours of the current node
        neighbors = grid.getNeighbors(node, diagonalMovement);
        for(i = 0, l = neighbors.length; i < l; ++i){
            neighbor = neighbors[i];
            if (neighbor.closed) continue;
            if (neighbor.opened === BY_START) return Util.biBacktrace(neighbor, node);
            x = neighbor.x;
            y = neighbor.y;
            // get the distance between current node and the neighbor
            // and calculate the next g score
            ng = node.g + (x - node.x === 0 || y - node.y === 0 ? 1 : SQRT2);
            // check if the neighbor has not been inspected yet, or
            // can be reached with smaller cost from the current node
            if (!neighbor.opened || ng < neighbor.g) {
                neighbor.g = ng;
                neighbor.h = neighbor.h || weight * heuristic(abs(x - startX), abs(y - startY));
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = node;
                if (!neighbor.opened) {
                    endOpenList.push(neighbor);
                    neighbor.opened = BY_END;
                } else // the neighbor can be reached with smaller cost.
                // Since its f value has been updated, we have to
                // update its position in the open list
                endOpenList.updateItem(neighbor);
            }
        } // end for each neighbor
    } // end while not open list empty
    // fail to find the path
    return [];
};
module.exports = BiAStarFinder;

},{"heap":"j0cbr","../core/Util":"eNIGb","../core/Heuristic":"2no8Q","../core/DiagonalMovement":"851FJ"}],"4DHQl":[function(require,module,exports) {
var BiAStarFinder = require('./BiAStarFinder');
/**
 * Bi-direcitional Best-First-Search path-finder.
 * @constructor
 * @extends BiAStarFinder
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 */ function BiBestFirstFinder(opt) {
    BiAStarFinder.call(this, opt);
    var orig = this.heuristic;
    this.heuristic = function(dx, dy) {
        return orig(dx, dy) * 1000000;
    };
}
BiBestFirstFinder.prototype = new BiAStarFinder();
BiBestFirstFinder.prototype.constructor = BiBestFirstFinder;
module.exports = BiBestFirstFinder;

},{"./BiAStarFinder":"j3Dsq"}],"cdDnY":[function(require,module,exports) {
var Util = require('../core/Util');
var DiagonalMovement = require('../core/DiagonalMovement');
/**
 * Bi-directional Breadth-First-Search path finder.
 * @constructor
 * @param {object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 */ function BiBreadthFirstFinder(opt) {
    opt = opt || {
    };
    this.allowDiagonal = opt.allowDiagonal;
    this.dontCrossCorners = opt.dontCrossCorners;
    this.diagonalMovement = opt.diagonalMovement;
    if (!this.diagonalMovement) {
        if (!this.allowDiagonal) this.diagonalMovement = DiagonalMovement.Never;
        else if (this.dontCrossCorners) this.diagonalMovement = DiagonalMovement.OnlyWhenNoObstacles;
        else this.diagonalMovement = DiagonalMovement.IfAtMostOneObstacle;
    }
}
/**
 * Find and return the the path.
 * @return {Array<Array<number>>} The path, including both start and
 *     end positions.
 */ BiBreadthFirstFinder.prototype.findPath = function(startX, startY, endX, endY, grid) {
    var startNode = grid.getNodeAt(startX, startY), endNode = grid.getNodeAt(endX, endY), startOpenList = [], endOpenList = [], neighbors, neighbor, node, diagonalMovement = this.diagonalMovement, BY_START = 0, BY_END = 1, i, l;
    // push the start and end nodes into the queues
    startOpenList.push(startNode);
    startNode.opened = true;
    startNode.by = BY_START;
    endOpenList.push(endNode);
    endNode.opened = true;
    endNode.by = BY_END;
    // while both the queues are not empty
    while(startOpenList.length && endOpenList.length){
        // expand start open list
        node = startOpenList.shift();
        node.closed = true;
        neighbors = grid.getNeighbors(node, diagonalMovement);
        for(i = 0, l = neighbors.length; i < l; ++i){
            neighbor = neighbors[i];
            if (neighbor.closed) continue;
            if (neighbor.opened) {
                // if this node has been inspected by the reversed search,
                // then a path is found.
                if (neighbor.by === BY_END) return Util.biBacktrace(node, neighbor);
                continue;
            }
            startOpenList.push(neighbor);
            neighbor.parent = node;
            neighbor.opened = true;
            neighbor.by = BY_START;
        }
        // expand end open list
        node = endOpenList.shift();
        node.closed = true;
        neighbors = grid.getNeighbors(node, diagonalMovement);
        for(i = 0, l = neighbors.length; i < l; ++i){
            neighbor = neighbors[i];
            if (neighbor.closed) continue;
            if (neighbor.opened) {
                if (neighbor.by === BY_START) return Util.biBacktrace(neighbor, node);
                continue;
            }
            endOpenList.push(neighbor);
            neighbor.parent = node;
            neighbor.opened = true;
            neighbor.by = BY_END;
        }
    }
    // fail to find the path
    return [];
};
module.exports = BiBreadthFirstFinder;

},{"../core/Util":"eNIGb","../core/DiagonalMovement":"851FJ"}],"4f6FG":[function(require,module,exports) {
var BiAStarFinder = require('./BiAStarFinder');
/**
 * Bi-directional Dijkstra path-finder.
 * @constructor
 * @extends BiAStarFinder
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 */ function BiDijkstraFinder(opt) {
    BiAStarFinder.call(this, opt);
    this.heuristic = function(dx, dy) {
        return 0;
    };
}
BiDijkstraFinder.prototype = new BiAStarFinder();
BiDijkstraFinder.prototype.constructor = BiDijkstraFinder;
module.exports = BiDijkstraFinder;

},{"./BiAStarFinder":"j3Dsq"}],"c5H0a":[function(require,module,exports) {
var Util = require('../core/Util');
var Heuristic = require('../core/Heuristic');
var Node = require('../core/Node');
var DiagonalMovement = require('../core/DiagonalMovement');
/**
 * Iterative Deeping A Star (IDA*) path-finder.
 *
 * Recursion based on:
 *   http://www.apl.jhu.edu/~hall/AI-Programming/IDA-Star.html
 *
 * Path retracing based on:
 *  V. Nageshwara Rao, Vipin Kumar and K. Ramesh
 *  "A Parallel Implementation of Iterative-Deeping-A*", January 1987.
 *  ftp://ftp.cs.utexas.edu/.snapshot/hourly.1/pub/AI-Lab/tech-reports/UT-AI-TR-87-46.pdf
 *
 * @author Gerard Meier (www.gerardmeier.com)
 *
 * @constructor
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 * @param {number} opt.weight Weight to apply to the heuristic to allow for
 *     suboptimal paths, in order to speed up the search.
 * @param {boolean} opt.trackRecursion Whether to track recursion for
 *     statistical purposes.
 * @param {number} opt.timeLimit Maximum execution time. Use <= 0 for infinite.
 */ function IDAStarFinder(opt) {
    opt = opt || {
    };
    this.allowDiagonal = opt.allowDiagonal;
    this.dontCrossCorners = opt.dontCrossCorners;
    this.diagonalMovement = opt.diagonalMovement;
    this.heuristic = opt.heuristic || Heuristic.manhattan;
    this.weight = opt.weight || 1;
    this.trackRecursion = opt.trackRecursion || false;
    this.timeLimit = opt.timeLimit || Infinity; // Default: no time limit.
    if (!this.diagonalMovement) {
        if (!this.allowDiagonal) this.diagonalMovement = DiagonalMovement.Never;
        else if (this.dontCrossCorners) this.diagonalMovement = DiagonalMovement.OnlyWhenNoObstacles;
        else this.diagonalMovement = DiagonalMovement.IfAtMostOneObstacle;
    }
    // When diagonal movement is allowed the manhattan heuristic is not
    // admissible, it should be octile instead
    if (this.diagonalMovement === DiagonalMovement.Never) this.heuristic = opt.heuristic || Heuristic.manhattan;
    else this.heuristic = opt.heuristic || Heuristic.octile;
}
/**
 * Find and return the the path. When an empty array is returned, either
 * no path is possible, or the maximum execution time is reached.
 *
 * @return {Array<Array<number>>} The path, including both start and
 *     end positions.
 */ IDAStarFinder.prototype.findPath = function(startX, startY, endX, endY, grid) {
    // Used for statistics:
    var nodesVisited = 0;
    // Execution time limitation:
    var startTime = new Date().getTime();
    // Heuristic helper:
    var h = (function(a, b) {
        return this.heuristic(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    }).bind(this);
    // Step cost from a to b:
    var cost = function(a, b) {
        return a.x === b.x || a.y === b.y ? 1 : Math.SQRT2;
    };
    /**
     * IDA* search implementation.
     *
     * @param {Node} The node currently expanding from.
     * @param {number} Cost to reach the given node.
     * @param {number} Maximum search depth (cut-off value).
     * @param {Array<Array<number>>} The found route.
     * @param {number} Recursion depth.
     *
     * @return {Object} either a number with the new optimal cut-off depth,
     * or a valid node instance, in which case a path was found.
     */ var search = (function(node, g, cutoff, route, depth) {
        nodesVisited++;
        // Enforce timelimit:
        if (this.timeLimit > 0 && new Date().getTime() - startTime > this.timeLimit * 1000) // Enforced as "path-not-found".
        return Infinity;
        var f = g + h(node, end) * this.weight;
        // We've searched too deep for this iteration.
        if (f > cutoff) return f;
        if (node == end) {
            route[depth] = [
                node.x,
                node.y
            ];
            return node;
        }
        var min, t, k, neighbour;
        var neighbours = grid.getNeighbors(node, this.diagonalMovement);
        // Sort the neighbours, gives nicer paths. But, this deviates
        // from the original algorithm - so I left it out.
        //neighbours.sort(function(a, b){
        //    return h(a, end) - h(b, end);
        //});
        /*jshint -W084 */ //Disable warning: Expected a conditional expression and instead saw an assignment
        for(k = 0, min = Infinity; neighbour = neighbours[k]; ++k){
            /*jshint +W084 */ //Enable warning: Expected a conditional expression and instead saw an assignment
            if (this.trackRecursion) {
                // Retain a copy for visualisation. Due to recursion, this
                // node may be part of other paths too.
                neighbour.retainCount = neighbour.retainCount + 1 || 1;
                if (neighbour.tested !== true) neighbour.tested = true;
            }
            t = search(neighbour, g + cost(node, neighbour), cutoff, route, depth + 1);
            if (t instanceof Node) {
                route[depth] = [
                    node.x,
                    node.y
                ];
                // For a typical A* linked list, this would work:
                // neighbour.parent = node;
                return t;
            }
            // Decrement count, then determine whether it's actually closed.
            if (this.trackRecursion && --neighbour.retainCount === 0) neighbour.tested = false;
            if (t < min) min = t;
        }
        return min;
    }).bind(this);
    // Node instance lookups:
    var start = grid.getNodeAt(startX, startY);
    var end = grid.getNodeAt(endX, endY);
    // Initial search depth, given the typical heuristic contraints,
    // there should be no cheaper route possible.
    var cutOff = h(start, end);
    var j, route1, t1;
    // With an overflow protection.
    for(j = 0;; ++j){
        route1 = [];
        // Search till cut-off depth:
        t1 = search(start, 0, cutOff, route1, 0);
        // Route not possible, or not found in time limit.
        if (t1 === Infinity) return [];
        // If t is a node, it's also the end node. Route is now
        // populated with a valid path to the end node.
        if (t1 instanceof Node) return route1;
        // Try again, this time with a deeper cut-off. The t score
        // is the closest we got to the end node.
        cutOff = t1;
    }
    // This _should_ never to be reached.
    return [];
};
module.exports = IDAStarFinder;

},{"../core/Util":"eNIGb","../core/Heuristic":"2no8Q","../core/Node":"ka13k","../core/DiagonalMovement":"851FJ"}],"lFhfR":[function(require,module,exports) {
/**
 * @author aniero / https://github.com/aniero
 */ var DiagonalMovement = require('../core/DiagonalMovement');
var JPFNeverMoveDiagonally = require('./JPFNeverMoveDiagonally');
var JPFAlwaysMoveDiagonally = require('./JPFAlwaysMoveDiagonally');
var JPFMoveDiagonallyIfNoObstacles = require('./JPFMoveDiagonallyIfNoObstacles');
var JPFMoveDiagonallyIfAtMostOneObstacle = require('./JPFMoveDiagonallyIfAtMostOneObstacle');
/**
 * Path finder using the Jump Point Search algorithm
 * @param {Object} opt
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 * @param {DiagonalMovement} opt.diagonalMovement Condition under which diagonal
 *      movement will be allowed.
 */ function JumpPointFinder(opt) {
    opt = opt || {
    };
    if (opt.diagonalMovement === DiagonalMovement.Never) return new JPFNeverMoveDiagonally(opt);
    else if (opt.diagonalMovement === DiagonalMovement.Always) return new JPFAlwaysMoveDiagonally(opt);
    else if (opt.diagonalMovement === DiagonalMovement.OnlyWhenNoObstacles) return new JPFMoveDiagonallyIfNoObstacles(opt);
    else return new JPFMoveDiagonallyIfAtMostOneObstacle(opt);
}
module.exports = JumpPointFinder;

},{"../core/DiagonalMovement":"851FJ","./JPFNeverMoveDiagonally":"5wTy0","./JPFAlwaysMoveDiagonally":"eWm9a","./JPFMoveDiagonallyIfNoObstacles":"4gyuR","./JPFMoveDiagonallyIfAtMostOneObstacle":"1nwId"}],"5wTy0":[function(require,module,exports) {
/**
 * @author imor / https://github.com/imor
 */ var JumpPointFinderBase = require('./JumpPointFinderBase');
var DiagonalMovement = require('../core/DiagonalMovement');
/**
 * Path finder using the Jump Point Search algorithm allowing only horizontal
 * or vertical movements.
 */ function JPFNeverMoveDiagonally(opt) {
    JumpPointFinderBase.call(this, opt);
}
JPFNeverMoveDiagonally.prototype = new JumpPointFinderBase();
JPFNeverMoveDiagonally.prototype.constructor = JPFNeverMoveDiagonally;
/**
 * Search recursively in the direction (parent -> child), stopping only when a
 * jump point is found.
 * @protected
 * @return {Array<Array<number>>} The x, y coordinate of the jump point
 *     found, or null if not found
 */ JPFNeverMoveDiagonally.prototype._jump = function(x, y, px, py) {
    var grid = this.grid, dx = x - px, dy = y - py;
    if (!grid.isWalkableAt(x, y)) return null;
    if (this.trackJumpRecursion === true) grid.getNodeAt(x, y).tested = true;
    if (grid.getNodeAt(x, y) === this.endNode) return [
        x,
        y
    ];
    if (dx !== 0) {
        if (grid.isWalkableAt(x, y - 1) && !grid.isWalkableAt(x - dx, y - 1) || grid.isWalkableAt(x, y + 1) && !grid.isWalkableAt(x - dx, y + 1)) return [
            x,
            y
        ];
    } else if (dy !== 0) {
        if (grid.isWalkableAt(x - 1, y) && !grid.isWalkableAt(x - 1, y - dy) || grid.isWalkableAt(x + 1, y) && !grid.isWalkableAt(x + 1, y - dy)) return [
            x,
            y
        ];
        //When moving vertically, must check for horizontal jump points
        if (this._jump(x + 1, y, x, y) || this._jump(x - 1, y, x, y)) return [
            x,
            y
        ];
    } else throw new Error("Only horizontal and vertical movements are allowed");
    return this._jump(x + dx, y + dy, x, y);
};
/**
 * Find the neighbors for the given node. If the node has a parent,
 * prune the neighbors based on the jump point search algorithm, otherwise
 * return all available neighbors.
 * @return {Array<Array<number>>} The neighbors found.
 */ JPFNeverMoveDiagonally.prototype._findNeighbors = function(node) {
    var parent = node.parent, x = node.x, y = node.y, grid = this.grid, px, py, nx, ny, dx, dy, neighbors = [], neighborNodes, neighborNode, i, l;
    // directed pruning: can ignore most neighbors, unless forced.
    if (parent) {
        px = parent.x;
        py = parent.y;
        // get the normalized direction of travel
        dx = (x - px) / Math.max(Math.abs(x - px), 1);
        dy = (y - py) / Math.max(Math.abs(y - py), 1);
        if (dx !== 0) {
            if (grid.isWalkableAt(x, y - 1)) neighbors.push([
                x,
                y - 1
            ]);
            if (grid.isWalkableAt(x, y + 1)) neighbors.push([
                x,
                y + 1
            ]);
            if (grid.isWalkableAt(x + dx, y)) neighbors.push([
                x + dx,
                y
            ]);
        } else if (dy !== 0) {
            if (grid.isWalkableAt(x - 1, y)) neighbors.push([
                x - 1,
                y
            ]);
            if (grid.isWalkableAt(x + 1, y)) neighbors.push([
                x + 1,
                y
            ]);
            if (grid.isWalkableAt(x, y + dy)) neighbors.push([
                x,
                y + dy
            ]);
        }
    } else {
        neighborNodes = grid.getNeighbors(node, DiagonalMovement.Never);
        for(i = 0, l = neighborNodes.length; i < l; ++i){
            neighborNode = neighborNodes[i];
            neighbors.push([
                neighborNode.x,
                neighborNode.y
            ]);
        }
    }
    return neighbors;
};
module.exports = JPFNeverMoveDiagonally;

},{"./JumpPointFinderBase":"803Iv","../core/DiagonalMovement":"851FJ"}],"803Iv":[function(require,module,exports) {
/**
 * @author imor / https://github.com/imor
 */ var Heap = require('heap');
var Util = require('../core/Util');
var Heuristic = require('../core/Heuristic');
var DiagonalMovement = require('../core/DiagonalMovement');
/**
 * Base class for the Jump Point Search algorithm
 * @param {object} opt
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 */ function JumpPointFinderBase(opt) {
    opt = opt || {
    };
    this.heuristic = opt.heuristic || Heuristic.manhattan;
    this.trackJumpRecursion = opt.trackJumpRecursion || false;
}
/**
 * Find and return the path.
 * @return {Array<Array<number>>} The path, including both start and
 *     end positions.
 */ JumpPointFinderBase.prototype.findPath = function(startX, startY, endX, endY, grid) {
    var openList = this.openList = new Heap(function(nodeA, nodeB) {
        return nodeA.f - nodeB.f;
    }), startNode = this.startNode = grid.getNodeAt(startX, startY), endNode = this.endNode = grid.getNodeAt(endX, endY), node;
    this.grid = grid;
    // set the `g` and `f` value of the start node to be 0
    startNode.g = 0;
    startNode.f = 0;
    // push the start node into the open list
    openList.push(startNode);
    startNode.opened = true;
    // while the open list is not empty
    while(!openList.empty()){
        // pop the position of node which has the minimum `f` value.
        node = openList.pop();
        node.closed = true;
        if (node === endNode) return Util.expandPath(Util.backtrace(endNode));
        this._identifySuccessors(node);
    }
    // fail to find the path
    return [];
};
/**
 * Identify successors for the given node. Runs a jump point search in the
 * direction of each available neighbor, adding any points found to the open
 * list.
 * @protected
 */ JumpPointFinderBase.prototype._identifySuccessors = function(node) {
    var grid = this.grid, heuristic = this.heuristic, openList = this.openList, endX = this.endNode.x, endY = this.endNode.y, neighbors, neighbor, jumpPoint, i, l, x = node.x, y = node.y, jx, jy, dx, dy, d, ng, jumpNode, abs = Math.abs, max = Math.max;
    neighbors = this._findNeighbors(node);
    for(i = 0, l = neighbors.length; i < l; ++i){
        neighbor = neighbors[i];
        jumpPoint = this._jump(neighbor[0], neighbor[1], x, y);
        if (jumpPoint) {
            jx = jumpPoint[0];
            jy = jumpPoint[1];
            jumpNode = grid.getNodeAt(jx, jy);
            if (jumpNode.closed) continue;
            // include distance, as parent may not be immediately adjacent:
            d = Heuristic.octile(abs(jx - x), abs(jy - y));
            ng = node.g + d; // next `g` value
            if (!jumpNode.opened || ng < jumpNode.g) {
                jumpNode.g = ng;
                jumpNode.h = jumpNode.h || heuristic(abs(jx - endX), abs(jy - endY));
                jumpNode.f = jumpNode.g + jumpNode.h;
                jumpNode.parent = node;
                if (!jumpNode.opened) {
                    openList.push(jumpNode);
                    jumpNode.opened = true;
                } else openList.updateItem(jumpNode);
            }
        }
    }
};
module.exports = JumpPointFinderBase;

},{"heap":"j0cbr","../core/Util":"eNIGb","../core/Heuristic":"2no8Q","../core/DiagonalMovement":"851FJ"}],"eWm9a":[function(require,module,exports) {
/**
 * @author imor / https://github.com/imor
 */ var JumpPointFinderBase = require('./JumpPointFinderBase');
var DiagonalMovement = require('../core/DiagonalMovement');
/**
 * Path finder using the Jump Point Search algorithm which always moves
 * diagonally irrespective of the number of obstacles.
 */ function JPFAlwaysMoveDiagonally(opt) {
    JumpPointFinderBase.call(this, opt);
}
JPFAlwaysMoveDiagonally.prototype = new JumpPointFinderBase();
JPFAlwaysMoveDiagonally.prototype.constructor = JPFAlwaysMoveDiagonally;
/**
 * Search recursively in the direction (parent -> child), stopping only when a
 * jump point is found.
 * @protected
 * @return {Array<Array<number>>} The x, y coordinate of the jump point
 *     found, or null if not found
 */ JPFAlwaysMoveDiagonally.prototype._jump = function(x, y, px, py) {
    var grid = this.grid, dx = x - px, dy = y - py;
    if (!grid.isWalkableAt(x, y)) return null;
    if (this.trackJumpRecursion === true) grid.getNodeAt(x, y).tested = true;
    if (grid.getNodeAt(x, y) === this.endNode) return [
        x,
        y
    ];
    // check for forced neighbors
    // along the diagonal
    if (dx !== 0 && dy !== 0) {
        if (grid.isWalkableAt(x - dx, y + dy) && !grid.isWalkableAt(x - dx, y) || grid.isWalkableAt(x + dx, y - dy) && !grid.isWalkableAt(x, y - dy)) return [
            x,
            y
        ];
        // when moving diagonally, must check for vertical/horizontal jump points
        if (this._jump(x + dx, y, x, y) || this._jump(x, y + dy, x, y)) return [
            x,
            y
        ];
    } else if (dx !== 0) {
        if (grid.isWalkableAt(x + dx, y + 1) && !grid.isWalkableAt(x, y + 1) || grid.isWalkableAt(x + dx, y - 1) && !grid.isWalkableAt(x, y - 1)) return [
            x,
            y
        ];
    } else {
        if (grid.isWalkableAt(x + 1, y + dy) && !grid.isWalkableAt(x + 1, y) || grid.isWalkableAt(x - 1, y + dy) && !grid.isWalkableAt(x - 1, y)) return [
            x,
            y
        ];
    }
    return this._jump(x + dx, y + dy, x, y);
};
/**
 * Find the neighbors for the given node. If the node has a parent,
 * prune the neighbors based on the jump point search algorithm, otherwise
 * return all available neighbors.
 * @return {Array<Array<number>>} The neighbors found.
 */ JPFAlwaysMoveDiagonally.prototype._findNeighbors = function(node) {
    var parent = node.parent, x = node.x, y = node.y, grid = this.grid, px, py, nx, ny, dx, dy, neighbors = [], neighborNodes, neighborNode, i, l;
    // directed pruning: can ignore most neighbors, unless forced.
    if (parent) {
        px = parent.x;
        py = parent.y;
        // get the normalized direction of travel
        dx = (x - px) / Math.max(Math.abs(x - px), 1);
        dy = (y - py) / Math.max(Math.abs(y - py), 1);
        // search diagonally
        if (dx !== 0 && dy !== 0) {
            if (grid.isWalkableAt(x, y + dy)) neighbors.push([
                x,
                y + dy
            ]);
            if (grid.isWalkableAt(x + dx, y)) neighbors.push([
                x + dx,
                y
            ]);
            if (grid.isWalkableAt(x + dx, y + dy)) neighbors.push([
                x + dx,
                y + dy
            ]);
            if (!grid.isWalkableAt(x - dx, y)) neighbors.push([
                x - dx,
                y + dy
            ]);
            if (!grid.isWalkableAt(x, y - dy)) neighbors.push([
                x + dx,
                y - dy
            ]);
        } else if (dx === 0) {
            if (grid.isWalkableAt(x, y + dy)) neighbors.push([
                x,
                y + dy
            ]);
            if (!grid.isWalkableAt(x + 1, y)) neighbors.push([
                x + 1,
                y + dy
            ]);
            if (!grid.isWalkableAt(x - 1, y)) neighbors.push([
                x - 1,
                y + dy
            ]);
        } else {
            if (grid.isWalkableAt(x + dx, y)) neighbors.push([
                x + dx,
                y
            ]);
            if (!grid.isWalkableAt(x, y + 1)) neighbors.push([
                x + dx,
                y + 1
            ]);
            if (!grid.isWalkableAt(x, y - 1)) neighbors.push([
                x + dx,
                y - 1
            ]);
        }
    } else {
        neighborNodes = grid.getNeighbors(node, DiagonalMovement.Always);
        for(i = 0, l = neighborNodes.length; i < l; ++i){
            neighborNode = neighborNodes[i];
            neighbors.push([
                neighborNode.x,
                neighborNode.y
            ]);
        }
    }
    return neighbors;
};
module.exports = JPFAlwaysMoveDiagonally;

},{"./JumpPointFinderBase":"803Iv","../core/DiagonalMovement":"851FJ"}],"4gyuR":[function(require,module,exports) {
/**
 * @author imor / https://github.com/imor
 */ var JumpPointFinderBase = require('./JumpPointFinderBase');
var DiagonalMovement = require('../core/DiagonalMovement');
/**
 * Path finder using the Jump Point Search algorithm which moves
 * diagonally only when there are no obstacles.
 */ function JPFMoveDiagonallyIfNoObstacles(opt) {
    JumpPointFinderBase.call(this, opt);
}
JPFMoveDiagonallyIfNoObstacles.prototype = new JumpPointFinderBase();
JPFMoveDiagonallyIfNoObstacles.prototype.constructor = JPFMoveDiagonallyIfNoObstacles;
/**
 * Search recursively in the direction (parent -> child), stopping only when a
 * jump point is found.
 * @protected
 * @return {Array<Array<number>>} The x, y coordinate of the jump point
 *     found, or null if not found
 */ JPFMoveDiagonallyIfNoObstacles.prototype._jump = function(x, y, px, py) {
    var grid = this.grid, dx = x - px, dy = y - py;
    if (!grid.isWalkableAt(x, y)) return null;
    if (this.trackJumpRecursion === true) grid.getNodeAt(x, y).tested = true;
    if (grid.getNodeAt(x, y) === this.endNode) return [
        x,
        y
    ];
    // check for forced neighbors
    // along the diagonal
    if (dx !== 0 && dy !== 0) {
        // if ((grid.isWalkableAt(x - dx, y + dy) && !grid.isWalkableAt(x - dx, y)) ||
        // (grid.isWalkableAt(x + dx, y - dy) && !grid.isWalkableAt(x, y - dy))) {
        // return [x, y];
        // }
        // when moving diagonally, must check for vertical/horizontal jump points
        if (this._jump(x + dx, y, x, y) || this._jump(x, y + dy, x, y)) return [
            x,
            y
        ];
    } else {
        if (dx !== 0) {
            if (grid.isWalkableAt(x, y - 1) && !grid.isWalkableAt(x - dx, y - 1) || grid.isWalkableAt(x, y + 1) && !grid.isWalkableAt(x - dx, y + 1)) return [
                x,
                y
            ];
        } else if (dy !== 0) {
            if (grid.isWalkableAt(x - 1, y) && !grid.isWalkableAt(x - 1, y - dy) || grid.isWalkableAt(x + 1, y) && !grid.isWalkableAt(x + 1, y - dy)) return [
                x,
                y
            ];
        // When moving vertically, must check for horizontal jump points
        // if (this._jump(x + 1, y, x, y) || this._jump(x - 1, y, x, y)) {
        // return [x, y];
        // }
        }
    }
    // moving diagonally, must make sure one of the vertical/horizontal
    // neighbors is open to allow the path
    if (grid.isWalkableAt(x + dx, y) && grid.isWalkableAt(x, y + dy)) return this._jump(x + dx, y + dy, x, y);
    else return null;
};
/**
 * Find the neighbors for the given node. If the node has a parent,
 * prune the neighbors based on the jump point search algorithm, otherwise
 * return all available neighbors.
 * @return {Array<Array<number>>} The neighbors found.
 */ JPFMoveDiagonallyIfNoObstacles.prototype._findNeighbors = function(node) {
    var parent = node.parent, x = node.x, y = node.y, grid = this.grid, px, py, nx, ny, dx, dy, neighbors = [], neighborNodes, neighborNode, i, l;
    // directed pruning: can ignore most neighbors, unless forced.
    if (parent) {
        px = parent.x;
        py = parent.y;
        // get the normalized direction of travel
        dx = (x - px) / Math.max(Math.abs(x - px), 1);
        dy = (y - py) / Math.max(Math.abs(y - py), 1);
        // search diagonally
        if (dx !== 0 && dy !== 0) {
            if (grid.isWalkableAt(x, y + dy)) neighbors.push([
                x,
                y + dy
            ]);
            if (grid.isWalkableAt(x + dx, y)) neighbors.push([
                x + dx,
                y
            ]);
            if (grid.isWalkableAt(x, y + dy) && grid.isWalkableAt(x + dx, y)) neighbors.push([
                x + dx,
                y + dy
            ]);
        } else {
            var isNextWalkable;
            if (dx !== 0) {
                isNextWalkable = grid.isWalkableAt(x + dx, y);
                var isTopWalkable = grid.isWalkableAt(x, y + 1);
                var isBottomWalkable = grid.isWalkableAt(x, y - 1);
                if (isNextWalkable) {
                    neighbors.push([
                        x + dx,
                        y
                    ]);
                    if (isTopWalkable) neighbors.push([
                        x + dx,
                        y + 1
                    ]);
                    if (isBottomWalkable) neighbors.push([
                        x + dx,
                        y - 1
                    ]);
                }
                if (isTopWalkable) neighbors.push([
                    x,
                    y + 1
                ]);
                if (isBottomWalkable) neighbors.push([
                    x,
                    y - 1
                ]);
            } else if (dy !== 0) {
                isNextWalkable = grid.isWalkableAt(x, y + dy);
                var isRightWalkable = grid.isWalkableAt(x + 1, y);
                var isLeftWalkable = grid.isWalkableAt(x - 1, y);
                if (isNextWalkable) {
                    neighbors.push([
                        x,
                        y + dy
                    ]);
                    if (isRightWalkable) neighbors.push([
                        x + 1,
                        y + dy
                    ]);
                    if (isLeftWalkable) neighbors.push([
                        x - 1,
                        y + dy
                    ]);
                }
                if (isRightWalkable) neighbors.push([
                    x + 1,
                    y
                ]);
                if (isLeftWalkable) neighbors.push([
                    x - 1,
                    y
                ]);
            }
        }
    } else {
        neighborNodes = grid.getNeighbors(node, DiagonalMovement.OnlyWhenNoObstacles);
        for(i = 0, l = neighborNodes.length; i < l; ++i){
            neighborNode = neighborNodes[i];
            neighbors.push([
                neighborNode.x,
                neighborNode.y
            ]);
        }
    }
    return neighbors;
};
module.exports = JPFMoveDiagonallyIfNoObstacles;

},{"./JumpPointFinderBase":"803Iv","../core/DiagonalMovement":"851FJ"}],"1nwId":[function(require,module,exports) {
/**
 * @author imor / https://github.com/imor
 */ var JumpPointFinderBase = require('./JumpPointFinderBase');
var DiagonalMovement = require('../core/DiagonalMovement');
/**
 * Path finder using the Jump Point Search algorithm which moves
 * diagonally only when there is at most one obstacle.
 */ function JPFMoveDiagonallyIfAtMostOneObstacle(opt) {
    JumpPointFinderBase.call(this, opt);
}
JPFMoveDiagonallyIfAtMostOneObstacle.prototype = new JumpPointFinderBase();
JPFMoveDiagonallyIfAtMostOneObstacle.prototype.constructor = JPFMoveDiagonallyIfAtMostOneObstacle;
/**
 * Search recursively in the direction (parent -> child), stopping only when a
 * jump point is found.
 * @protected
 * @return {Array<Array<number>>} The x, y coordinate of the jump point
 *     found, or null if not found
 */ JPFMoveDiagonallyIfAtMostOneObstacle.prototype._jump = function(x, y, px, py) {
    var grid = this.grid, dx = x - px, dy = y - py;
    if (!grid.isWalkableAt(x, y)) return null;
    if (this.trackJumpRecursion === true) grid.getNodeAt(x, y).tested = true;
    if (grid.getNodeAt(x, y) === this.endNode) return [
        x,
        y
    ];
    // check for forced neighbors
    // along the diagonal
    if (dx !== 0 && dy !== 0) {
        if (grid.isWalkableAt(x - dx, y + dy) && !grid.isWalkableAt(x - dx, y) || grid.isWalkableAt(x + dx, y - dy) && !grid.isWalkableAt(x, y - dy)) return [
            x,
            y
        ];
        // when moving diagonally, must check for vertical/horizontal jump points
        if (this._jump(x + dx, y, x, y) || this._jump(x, y + dy, x, y)) return [
            x,
            y
        ];
    } else if (dx !== 0) {
        if (grid.isWalkableAt(x + dx, y + 1) && !grid.isWalkableAt(x, y + 1) || grid.isWalkableAt(x + dx, y - 1) && !grid.isWalkableAt(x, y - 1)) return [
            x,
            y
        ];
    } else {
        if (grid.isWalkableAt(x + 1, y + dy) && !grid.isWalkableAt(x + 1, y) || grid.isWalkableAt(x - 1, y + dy) && !grid.isWalkableAt(x - 1, y)) return [
            x,
            y
        ];
    }
    // moving diagonally, must make sure one of the vertical/horizontal
    // neighbors is open to allow the path
    if (grid.isWalkableAt(x + dx, y) || grid.isWalkableAt(x, y + dy)) return this._jump(x + dx, y + dy, x, y);
    else return null;
};
/**
 * Find the neighbors for the given node. If the node has a parent,
 * prune the neighbors based on the jump point search algorithm, otherwise
 * return all available neighbors.
 * @return {Array<Array<number>>} The neighbors found.
 */ JPFMoveDiagonallyIfAtMostOneObstacle.prototype._findNeighbors = function(node) {
    var parent = node.parent, x = node.x, y = node.y, grid = this.grid, px, py, nx, ny, dx, dy, neighbors = [], neighborNodes, neighborNode, i, l;
    // directed pruning: can ignore most neighbors, unless forced.
    if (parent) {
        px = parent.x;
        py = parent.y;
        // get the normalized direction of travel
        dx = (x - px) / Math.max(Math.abs(x - px), 1);
        dy = (y - py) / Math.max(Math.abs(y - py), 1);
        // search diagonally
        if (dx !== 0 && dy !== 0) {
            if (grid.isWalkableAt(x, y + dy)) neighbors.push([
                x,
                y + dy
            ]);
            if (grid.isWalkableAt(x + dx, y)) neighbors.push([
                x + dx,
                y
            ]);
            if (grid.isWalkableAt(x, y + dy) || grid.isWalkableAt(x + dx, y)) neighbors.push([
                x + dx,
                y + dy
            ]);
            if (!grid.isWalkableAt(x - dx, y) && grid.isWalkableAt(x, y + dy)) neighbors.push([
                x - dx,
                y + dy
            ]);
            if (!grid.isWalkableAt(x, y - dy) && grid.isWalkableAt(x + dx, y)) neighbors.push([
                x + dx,
                y - dy
            ]);
        } else {
            if (dx === 0) {
                if (grid.isWalkableAt(x, y + dy)) {
                    neighbors.push([
                        x,
                        y + dy
                    ]);
                    if (!grid.isWalkableAt(x + 1, y)) neighbors.push([
                        x + 1,
                        y + dy
                    ]);
                    if (!grid.isWalkableAt(x - 1, y)) neighbors.push([
                        x - 1,
                        y + dy
                    ]);
                }
            } else if (grid.isWalkableAt(x + dx, y)) {
                neighbors.push([
                    x + dx,
                    y
                ]);
                if (!grid.isWalkableAt(x, y + 1)) neighbors.push([
                    x + dx,
                    y + 1
                ]);
                if (!grid.isWalkableAt(x, y - 1)) neighbors.push([
                    x + dx,
                    y - 1
                ]);
            }
        }
    } else {
        neighborNodes = grid.getNeighbors(node, DiagonalMovement.IfAtMostOneObstacle);
        for(i = 0, l = neighborNodes.length; i < l; ++i){
            neighborNode = neighborNodes[i];
            neighbors.push([
                neighborNode.x,
                neighborNode.y
            ]);
        }
    }
    return neighbors;
};
module.exports = JPFMoveDiagonallyIfAtMostOneObstacle;

},{"./JumpPointFinderBase":"803Iv","../core/DiagonalMovement":"851FJ"}],"h6qr5":[function(require,module,exports) {
module.exports = require('./helpers/bundle-url').getBundleURL('6eyz8') + "../ground.0ef35416.png" + "?" + Date.now();

},{"./helpers/bundle-url":"lgJ39"}],"lgJ39":[function(require,module,exports) {
"use strict";
var bundleURL = {
};
function getBundleURLCached(id) {
    var value = bundleURL[id];
    if (!value) {
        value = getBundleURL();
        bundleURL[id] = value;
    }
    return value;
}
function getBundleURL() {
    try {
        throw new Error();
    } catch (err) {
        var matches = ('' + err.stack).match(/(https?|file|ftp):\/\/[^)\n]+/g);
        if (matches) // The first two stack frames will be this function and getBundleURLCached.
        // Use the 3rd one, which will be a runtime in the original bundle.
        return getBaseURL(matches[2]);
    }
    return '/';
}
function getBaseURL(url) {
    return ('' + url).replace(/^((?:https?|file|ftp):\/\/.+)\/[^/]+$/, '$1') + '/';
} // TODO: Replace uses with `new URL(url).origin` when ie11 is no longer supported.
function getOrigin(url) {
    var matches = ('' + url).match(/(https?|file|ftp):\/\/[^/]+/);
    if (!matches) throw new Error('Origin not found');
    return matches[0];
}
exports.getBundleURL = getBundleURLCached;
exports.getBaseURL = getBaseURL;
exports.getOrigin = getOrigin;

},{}],"fMWAA":[function(require,module,exports) {
module.exports = require('./helpers/bundle-url').getBundleURL('6eyz8') + "../knight.b9ea02c0.png" + "?" + Date.now();

},{"./helpers/bundle-url":"lgJ39"}],"6g5EO":[function(require,module,exports) {
module.exports = require('./helpers/bundle-url').getBundleURL('6eyz8') + "../bishop.817252d5.png" + "?" + Date.now();

},{"./helpers/bundle-url":"lgJ39"}],"1vndg":[function(require,module,exports) {
module.exports = require('./helpers/bundle-url').getBundleURL('6eyz8') + "../bishop-odd.c6623a13.png" + "?" + Date.now();

},{"./helpers/bundle-url":"lgJ39"}],"e6SrJ":[function(require,module,exports) {
module.exports = require('./helpers/bundle-url').getBundleURL('6eyz8') + "../princhess.e3c01711.png" + "?" + Date.now();

},{"./helpers/bundle-url":"lgJ39"}],"gkKU3":[function(require,module,exports) {
exports.interopDefault = function(a) {
    return a && a.__esModule ? a : {
        default: a
    };
};
exports.defineInteropFlag = function(a) {
    Object.defineProperty(a, '__esModule', {
        value: true
    });
};
exports.exportAll = function(source, dest) {
    Object.keys(source).forEach(function(key) {
        if (key === 'default' || key === '__esModule' || dest.hasOwnProperty(key)) return;
        Object.defineProperty(dest, key, {
            enumerable: true,
            get: function() {
                return source[key];
            }
        });
    });
    return dest;
};
exports.export = function(dest, destName, get) {
    Object.defineProperty(dest, destName, {
        enumerable: true,
        get: get
    });
};

},{}]},["iM15Q","lQMrW"], "lQMrW", "parcelRequireae9f")

//# sourceMappingURL=index.af02d5db.js.map
