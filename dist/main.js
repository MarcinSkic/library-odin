/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/a11y-dialog/dist/a11y-dialog.esm.js":
/*!**********************************************************!*\
  !*** ./node_modules/a11y-dialog/dist/a11y-dialog.esm.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ A11yDialog)
/* harmony export */ });
var focusableSelectors = [
  'a[href]:not([tabindex^="-"])',
  'area[href]:not([tabindex^="-"])',
  'input:not([type="hidden"]):not([type="radio"]):not([disabled]):not([tabindex^="-"])',
  'input[type="radio"]:not([disabled]):not([tabindex^="-"])',
  'select:not([disabled]):not([tabindex^="-"])',
  'textarea:not([disabled]):not([tabindex^="-"])',
  'button:not([disabled]):not([tabindex^="-"])',
  'iframe:not([tabindex^="-"])',
  'audio[controls]:not([tabindex^="-"])',
  'video[controls]:not([tabindex^="-"])',
  '[contenteditable]:not([tabindex^="-"])',
  '[tabindex]:not([tabindex^="-"])',
];

var TAB_KEY = 'Tab';
var ESCAPE_KEY = 'Escape';

/**
 * Define the constructor to instantiate a dialog
 *
 * @constructor
 * @param {Element} element
 */
function A11yDialog(element) {
  // Prebind the functions that will be bound in addEventListener and
  // removeEventListener to avoid losing references
  this._show = this.show.bind(this);
  this._hide = this.hide.bind(this);
  this._maintainFocus = this._maintainFocus.bind(this);
  this._bindKeypress = this._bindKeypress.bind(this);

  this.$el = element;
  this.shown = false;
  this._id = this.$el.getAttribute('data-a11y-dialog') || this.$el.id;
  this._previouslyFocused = null;
  this._listeners = {};

  // Initialise everything needed for the dialog to work properly
  this.create();
}

/**
 * Set up everything necessary for the dialog to be functioning
 *
 * @param {(NodeList | Element | string)} targets
 * @return {this}
 */
A11yDialog.prototype.create = function () {
  this.$el.setAttribute('aria-hidden', true);
  this.$el.setAttribute('aria-modal', true);
  this.$el.setAttribute('tabindex', -1);

  if (!this.$el.hasAttribute('role')) {
    this.$el.setAttribute('role', 'dialog');
  }

  // Keep a collection of dialog openers, each of which will be bound a click
  // event listener to open the dialog
  this._openers = $$('[data-a11y-dialog-show="' + this._id + '"]');
  this._openers.forEach(
    function (opener) {
      opener.addEventListener('click', this._show);
    }.bind(this)
  );

  // Keep a collection of dialog closers, each of which will be bound a click
  // event listener to close the dialog
  const $el = this.$el;

  this._closers = $$('[data-a11y-dialog-hide]', this.$el)
    // This filter is necessary in case there are nested dialogs, so that
    // only closers from the current dialog are retrieved and effective
    .filter(function (closer) {
      // Testing for `[aria-modal="true"]` is not enough since this attribute
      // and the collect of closers is done at instantation time, when nested
      // dialogs might not have yet been instantiated. Note that if the dialogs
      // are manually instantiated, this could still fail because none of these
      // selectors would match; this would cause closers to close all parent
      // dialogs instead of just the current one
      return closer.closest('[aria-modal="true"], [data-a11y-dialog]') === $el
    })
    .concat($$('[data-a11y-dialog-hide="' + this._id + '"]'));

  this._closers.forEach(
    function (closer) {
      closer.addEventListener('click', this._hide);
    }.bind(this)
  );

  // Execute all callbacks registered for the `create` event
  this._fire('create');

  return this
};

/**
 * Show the dialog element, disable all the targets (siblings), trap the
 * current focus within it, listen for some specific key presses and fire all
 * registered callbacks for `show` event
 *
 * @param {CustomEvent} event
 * @return {this}
 */
A11yDialog.prototype.show = function (event) {
  // If the dialog is already open, abort
  if (this.shown) {
    return this
  }

  // Keep a reference to the currently focused element to be able to restore
  // it later
  this._previouslyFocused = document.activeElement;
  this.$el.removeAttribute('aria-hidden');
  this.shown = true;

  // Set the focus to the dialog element
  moveFocusToDialog(this.$el);

  // Bind a focus event listener to the body element to make sure the focus
  // stays trapped inside the dialog while open, and start listening for some
  // specific key presses (TAB and ESC)
  document.body.addEventListener('focus', this._maintainFocus, true);
  document.addEventListener('keydown', this._bindKeypress);

  // Execute all callbacks registered for the `show` event
  this._fire('show', event);

  return this
};

/**
 * Hide the dialog element, enable all the targets (siblings), restore the
 * focus to the previously active element, stop listening for some specific
 * key presses and fire all registered callbacks for `hide` event
 *
 * @param {CustomEvent} event
 * @return {this}
 */
A11yDialog.prototype.hide = function (event) {
  // If the dialog is already closed, abort
  if (!this.shown) {
    return this
  }

  this.shown = false;
  this.$el.setAttribute('aria-hidden', 'true');

  // If there was a focused element before the dialog was opened (and it has a
  // `focus` method), restore the focus back to it
  // See: https://github.com/KittyGiraudel/a11y-dialog/issues/108
  if (this._previouslyFocused && this._previouslyFocused.focus) {
    this._previouslyFocused.focus();
  }

  // Remove the focus event listener to the body element and stop listening
  // for specific key presses
  document.body.removeEventListener('focus', this._maintainFocus, true);
  document.removeEventListener('keydown', this._bindKeypress);

  // Execute all callbacks registered for the `hide` event
  this._fire('hide', event);

  return this
};

/**
 * Destroy the current instance (after making sure the dialog has been hidden)
 * and remove all associated listeners from dialog openers and closers
 *
 * @return {this}
 */
A11yDialog.prototype.destroy = function () {
  // Hide the dialog to avoid destroying an open instance
  this.hide();

  // Remove the click event listener from all dialog openers
  this._openers.forEach(
    function (opener) {
      opener.removeEventListener('click', this._show);
    }.bind(this)
  );

  // Remove the click event listener from all dialog closers
  this._closers.forEach(
    function (closer) {
      closer.removeEventListener('click', this._hide);
    }.bind(this)
  );

  // Execute all callbacks registered for the `destroy` event
  this._fire('destroy');

  // Keep an object of listener types mapped to callback functions
  this._listeners = {};

  return this
};

/**
 * Register a new callback for the given event type
 *
 * @param {string} type
 * @param {Function} handler
 */
A11yDialog.prototype.on = function (type, handler) {
  if (typeof this._listeners[type] === 'undefined') {
    this._listeners[type] = [];
  }

  this._listeners[type].push(handler);

  return this
};

/**
 * Unregister an existing callback for the given event type
 *
 * @param {string} type
 * @param {Function} handler
 */
A11yDialog.prototype.off = function (type, handler) {
  var index = (this._listeners[type] || []).indexOf(handler);

  if (index > -1) {
    this._listeners[type].splice(index, 1);
  }

  return this
};

/**
 * Iterate over all registered handlers for given type and call them all with
 * the dialog element as first argument, event as second argument (if any). Also
 * dispatch a custom event on the DOM element itself to make it possible to
 * react to the lifecycle of auto-instantiated dialogs.
 *
 * @access private
 * @param {string} type
 * @param {CustomEvent} event
 */
A11yDialog.prototype._fire = function (type, event) {
  var listeners = this._listeners[type] || [];
  var domEvent = new CustomEvent(type, { detail: event });

  this.$el.dispatchEvent(domEvent);

  listeners.forEach(
    function (listener) {
      listener(this.$el, event);
    }.bind(this)
  );
};

/**
 * Private event handler used when listening to some specific key presses
 * (namely ESCAPE and TAB)
 *
 * @access private
 * @param {Event} event
 */
A11yDialog.prototype._bindKeypress = function (event) {
  // This is an escape hatch in case there are nested dialogs, so the keypresses
  // are only reacted to for the most recent one
  const focused = document.activeElement;
  if (focused && focused.closest('[aria-modal="true"]') !== this.$el) return

  // If the dialog is shown and the ESCAPE key is being pressed, prevent any
  // further effects from the ESCAPE key and hide the dialog, unless its role
  // is 'alertdialog', which should be modal
  if (
    this.shown &&
    event.key === ESCAPE_KEY &&
    this.$el.getAttribute('role') !== 'alertdialog'
  ) {
    event.preventDefault();
    this.hide(event);
  }

  // If the dialog is shown and the TAB key is being pressed, make sure the
  // focus stays trapped within the dialog element
  if (this.shown && event.key === TAB_KEY) {
    trapTabKey(this.$el, event);
  }
};

/**
 * Private event handler used when making sure the focus stays within the
 * currently open dialog
 *
 * @access private
 * @param {Event} event
 */
A11yDialog.prototype._maintainFocus = function (event) {
  // If the dialog is shown and the focus is not within a dialog element (either
  // this one or another one in case of nested dialogs) or within an element
  // with the `data-a11y-dialog-focus-trap-ignore` attribute, move it back to
  // its first focusable child.
  // See: https://github.com/KittyGiraudel/a11y-dialog/issues/177
  if (
    this.shown &&
    !event.target.closest('[aria-modal="true"]') &&
    !event.target.closest('[data-a11y-dialog-ignore-focus-trap]')
  ) {
    moveFocusToDialog(this.$el);
  }
};

/**
 * Convert a NodeList into an array
 *
 * @param {NodeList} collection
 * @return {Array<Element>}
 */
function toArray(collection) {
  return Array.prototype.slice.call(collection)
}

/**
 * Query the DOM for nodes matching the given selector, scoped to context (or
 * the whole document)
 *
 * @param {String} selector
 * @param {Element} [context = document]
 * @return {Array<Element>}
 */
function $$(selector, context) {
  return toArray((context || document).querySelectorAll(selector))
}

/**
 * Set the focus to the first element with `autofocus` with the element or the
 * element itself
 *
 * @param {Element} node
 */
function moveFocusToDialog(node) {
  var focused = node.querySelector('[autofocus]') || node;

  focused.focus();
}

/**
 * Get the focusable children of the given element
 *
 * @param {Element} node
 * @return {Array<Element>}
 */
function getFocusableChildren(node) {
  return $$(focusableSelectors.join(','), node).filter(function (child) {
    return !!(
      child.offsetWidth ||
      child.offsetHeight ||
      child.getClientRects().length
    )
  })
}

/**
 * Trap the focus inside the given element
 *
 * @param {Element} node
 * @param {Event} event
 */
function trapTabKey(node, event) {
  var focusableChildren = getFocusableChildren(node);
  var focusedItemIndex = focusableChildren.indexOf(document.activeElement);

  // If the SHIFT key is being pressed while tabbing (moving backwards) and
  // the currently focused item is the first one, move the focus to the last
  // focusable item from the dialog element
  if (event.shiftKey && focusedItemIndex === 0) {
    focusableChildren[focusableChildren.length - 1].focus();
    event.preventDefault();
    // If the SHIFT key is not being pressed (moving forwards) and the currently
    // focused item is the last one, move the focus to the first focusable item
    // from the dialog element
  } else if (
    !event.shiftKey &&
    focusedItemIndex === focusableChildren.length - 1
  ) {
    focusableChildren[0].focus();
    event.preventDefault();
  }
}

function instantiateDialogs() {
  $$('[data-a11y-dialog]').forEach(function (node) {
    new A11yDialog(node);
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', instantiateDialogs);
  } else {
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(instantiateDialogs);
    } else {
      window.setTimeout(instantiateDialogs, 16);
    }
  }
}




/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/style.css":
/*!*************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/style.css ***!
  \*************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "body {\n    margin: 0;\n\n    height: 100vh;\n\n    display: grid;\n    grid-template: \n        \"header header\" 100px\n        \"aside main\" 1fr /\n        300px 1fr;\n}\n\nheader {\n    grid-area: header;\n\n    color: white;\n    background-color: #5b21b6;\n    padding: 5px 10px;\n}\n\naside {\n    grid-area: aside;\n\n    background-color: #7c3aed;\n}\n\nmain {\n    grid-area: main;\n}\n\n.container {\n    padding: 10px;\n\n    display: grid;\n    grid-template-columns: repeat(auto-fill,minmax(200px,1fr));\n    grid-auto-rows: 150px;\n\n    gap: 10px;\n}\n\n.card {\n    background-color: #ede9fe;\n\n    display: grid;\n    place-items: center;\n\n    border-radius: 5px;\n}\n\n.rating-bar {\n    display: flex;\n    flex-direction: row-reverse;\n    width: min-content;\n}\n\n.star {\n    color: white;\n}\n\n.star.selected ~ .star,\n.star:hover ~ .star{\n    color: #FBC02D;\n}\n\n.star.selected,\n.star:hover{\n    color: #FBC02D;\n}\n\n.dialog-container {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n\n    position: fixed;\n    top: 0;\n    bottom: 0;\n    right: 0;\n    left: 0;\n    z-index: 2;\n}\n\n.dialog-container[aria-hidden=\"true\"] {\n    display: none;\n}\n\n.dialog-overlay {\n    background-color: rgba(0, 0, 0, 0.712);\n    position: fixed;\n    top: 0;\n    bottom: 0;\n    left: 0;\n    right: 0;\n}\n\n.dialog-content {\n    background-color: #7c3aed;\n    position: relative;\n    z-index: 2;\n}\n\n.dialog-close {\n    position: absolute;\n    top: 0;\n    right: 0;\n}", "",{"version":3,"sources":["webpack://./src/style.css"],"names":[],"mappings":"AAAA;IACI,SAAS;;IAET,aAAa;;IAEb,aAAa;IACb;;;iBAGa;AACjB;;AAEA;IACI,iBAAiB;;IAEjB,YAAY;IACZ,yBAAyB;IACzB,iBAAiB;AACrB;;AAEA;IACI,gBAAgB;;IAEhB,yBAAyB;AAC7B;;AAEA;IACI,eAAe;AACnB;;AAEA;IACI,aAAa;;IAEb,aAAa;IACb,0DAA0D;IAC1D,qBAAqB;;IAErB,SAAS;AACb;;AAEA;IACI,yBAAyB;;IAEzB,aAAa;IACb,mBAAmB;;IAEnB,kBAAkB;AACtB;;AAEA;IACI,aAAa;IACb,2BAA2B;IAC3B,kBAAkB;AACtB;;AAEA;IACI,YAAY;AAChB;;AAEA;;IAEI,cAAc;AAClB;;AAEA;;IAEI,cAAc;AAClB;;AAEA;IACI,aAAa;IACb,uBAAuB;IACvB,mBAAmB;;IAEnB,eAAe;IACf,MAAM;IACN,SAAS;IACT,QAAQ;IACR,OAAO;IACP,UAAU;AACd;;AAEA;IACI,aAAa;AACjB;;AAEA;IACI,sCAAsC;IACtC,eAAe;IACf,MAAM;IACN,SAAS;IACT,OAAO;IACP,QAAQ;AACZ;;AAEA;IACI,yBAAyB;IACzB,kBAAkB;IAClB,UAAU;AACd;;AAEA;IACI,kBAAkB;IAClB,MAAM;IACN,QAAQ;AACZ","sourcesContent":["body {\n    margin: 0;\n\n    height: 100vh;\n\n    display: grid;\n    grid-template: \n        \"header header\" 100px\n        \"aside main\" 1fr /\n        300px 1fr;\n}\n\nheader {\n    grid-area: header;\n\n    color: white;\n    background-color: #5b21b6;\n    padding: 5px 10px;\n}\n\naside {\n    grid-area: aside;\n\n    background-color: #7c3aed;\n}\n\nmain {\n    grid-area: main;\n}\n\n.container {\n    padding: 10px;\n\n    display: grid;\n    grid-template-columns: repeat(auto-fill,minmax(200px,1fr));\n    grid-auto-rows: 150px;\n\n    gap: 10px;\n}\n\n.card {\n    background-color: #ede9fe;\n\n    display: grid;\n    place-items: center;\n\n    border-radius: 5px;\n}\n\n.rating-bar {\n    display: flex;\n    flex-direction: row-reverse;\n    width: min-content;\n}\n\n.star {\n    color: white;\n}\n\n.star.selected ~ .star,\n.star:hover ~ .star{\n    color: #FBC02D;\n}\n\n.star.selected,\n.star:hover{\n    color: #FBC02D;\n}\n\n.dialog-container {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n\n    position: fixed;\n    top: 0;\n    bottom: 0;\n    right: 0;\n    left: 0;\n    z-index: 2;\n}\n\n.dialog-container[aria-hidden=\"true\"] {\n    display: none;\n}\n\n.dialog-overlay {\n    background-color: rgba(0, 0, 0, 0.712);\n    position: fixed;\n    top: 0;\n    bottom: 0;\n    left: 0;\n    right: 0;\n}\n\n.dialog-content {\n    background-color: #7c3aed;\n    position: relative;\n    z-index: 2;\n}\n\n.dialog-close {\n    position: absolute;\n    top: 0;\n    right: 0;\n}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {



/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";

      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }

      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }

      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }

      content += cssWithMappingToString(item);

      if (needLayer) {
        content += "}";
      }

      if (item[2]) {
        content += "}";
      }

      if (item[4]) {
        content += "}";
      }

      return content;
    }).join("");
  }; // import a list of modules into the list


  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }

      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }

      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }

      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {



module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || "").concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join("\n");
  }

  return [content].join("\n");
};

/***/ }),

/***/ "./src/style.css":
/*!***********************!*\
  !*** ./src/style.css ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../node_modules/css-loader/dist/cjs.js!./style.css */ "./node_modules/css-loader/dist/cjs.js!./src/style.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {



var stylesInDOM = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };

    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);

  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }

      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };

  return updater;
}

module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();

        stylesInDOM.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {



var memo = {};
/* istanbul ignore next  */

function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }

    memo[target] = styleTarget;
  }

  return memo[target];
}
/* istanbul ignore next  */


function insertBySelector(insert, style) {
  var target = getTarget(insert);

  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }

  target.appendChild(style);
}

module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}

module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;

  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}

module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";

  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }

  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }

  var needLayer = typeof obj.layer !== "undefined";

  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }

  css += obj.css;

  if (needLayer) {
    css += "}";
  }

  if (obj.media) {
    css += "}";
  }

  if (obj.supports) {
    css += "}";
  }

  var sourceMap = obj.sourceMap;

  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  options.styleTagTransform(css, styleElement, options.options);
}

function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }

  styleElement.parentNode.removeChild(styleElement);
}
/* istanbul ignore next  */


function domAPI(options) {
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}

module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }

    styleElement.appendChild(document.createTextNode(css));
  }
}

module.exports = styleTagTransform;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _style_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./style.css */ "./src/style.css");
/* harmony import */ var a11y_dialog__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! a11y-dialog */ "./node_modules/a11y-dialog/dist/a11y-dialog.esm.js");



"use strict"
class PieceOfWork{

    constructor (title,creator,isCompleted){
        this.title = title;
        this.creator = creator;
        this.isCompleted = isCompleted;
    }

    static deleteWorkFromList(index){
        this.list.splice(index,1);
    }
    
    static changeWorkState(index){
        return this.list[index].toggleCompletedState();
    }
    
    toggleCompletedState(){
        this.isCompleted = !this.isCompleted;
        return this.isCompleted;
    }
}

class Book extends PieceOfWork{
    static list  = [];

    constructor (title,creator,isCompleted,numberOfPages){
        super(title,creator,isCompleted);

        this.numberOfPages = numberOfPages;
    }
}

class Movie extends PieceOfWork{
    static list  = [];

    constructor (title,creator,isCompleted,numberOfViewings,seenInCinema){
        super(title,creator,isCompleted);

        this.numberOfViewings = numberOfViewings;
        this.seenInCinema = seenInCinema;
    }
}

class ComputerGame extends PieceOfWork {
    static list = [];

    constructor (title,creator,isCompleted,hoursPlayed){
        super(title,creator,isCompleted);

        this.hoursPlayed = hoursPlayed;
    }
}

const mainController = (function(){
    function init(){
        storageController.importFromStorage();
        displayController.generateWorkTypeForm({target: {value: "book"}});
        displayController.refreshCollection();
        displayController.initWorkPickDialog();

        assignListeners();
    }

    function assignListeners(){
        document.querySelectorAll('.pick-type').forEach(button => button.addEventListener('click',displayController.generateWorkTypeForm));
        document.querySelectorAll('.star').forEach(star => star.addEventListener('click',displayController.selectRating));
    }

    return {init};
})();

const storageController = (function(){
    const STORAGE_KEY = "piecesOfWork";

    function importFromStorage(){
        let importedLists = JSON.parse(localStorage.getItem(STORAGE_KEY));

        if(importedLists === null || importedLists === undefined){
            //NOTHING?
        } else {
            Book.list = importedLists.books.map(object => Object.assign(new Book(),object));
            Movie.list = importedLists.movies.map(object => Object.assign(new Movie(),object));
            ComputerGame.list = importedLists.computerGames.map(object => Object.assign(new ComputerGame(),object));
        }
    }

    function saveToStorage(){
        const piecesOfWork = {books: Book.list,movies: Movie.list,computerGames: ComputerGame.list}
        localStorage.setItem(STORAGE_KEY,JSON.stringify(piecesOfWork));
    }

    return {importFromStorage,saveToStorage};
})();

const piecesOfWorkController = (function(){

    function addPieceOfWorkToLibrary(event){
        event.preventDefault(); //To cancel form submition refreshing page
        const workType = event.target.dataset.type;
    
        const {title,creator,isCompleted} = displayController.getPieceOfWorkFormData();
        
        switch(workType){
            case "book":
                const {numberOfPages} = displayController.getBookFormData();

                Book.list.push(new Book(title,creator,isCompleted,numberOfPages));
                break;
            case 'movie':
                const {numberOfViewings,seenInCinema} = displayController.getMovieFormData();

                Movie.list.push(new Movie(title,creator,isCompleted,numberOfViewings,seenInCinema));
                break;
            case 'computer-game':
                const {hoursPlayed} = displayController.getComputerGameFormData();

                ComputerGame.list.push(new ComputerGame(title,creator,isCompleted,hoursPlayed));
                break;
        }
        
        storageController.saveToStorage();
        displayController.refreshCollection();
    }
    
    function deletePieceOfWork(pieceOfWorkClass,index){  //TODO, probably should be in class?

        pieceOfWorkClass.deleteWorkFromList(index);
    
        storageController.saveToStorage();
    
        displayController.refreshCollection();
    }

    return {addPieceOfWorkToLibrary,deletePieceOfWork};
})();

const displayController = (function(){

    const DOM_CLASS_INDEX_IN_CLASSLIST = 1;

    const WORK_FORM_FRAMEWORK = `
    <form class="add-new-piece-of-work" action="#">
        <div>
            <label for="title">Title</label>
            <input type="text" id="title" name="title">
        </div>
        <div>
            <label for="creator">Creator</label>
            <input type="text" id="creator" name="creator" placeholder="Author, director or developer">
        </div>
        <div>
            <label for="is-completed">Completed</label>
            <input type="checkbox" name="is-completed" id="is-completed">
        </div>
    </form>`;

    const BOOK_FORM_EXTRA = `
    <div>
        <label for="number-of-pages">Number of pages</label>
        <input type="number" min="0" name="number-of-pages" id="number-of-pages">
    </div>`

    const MOVIE_FORM_EXTRA = `
    <div>
        <label for="number-of-viewings">Number of viewings</label>
        <input type="number" min="0" name="number-of-viewings" id="number-of-viewings">
    </div>
    <div>
        <label for="seen-in-cinema">Seen in cinema</label>
        <input type="checkbox" name="seen-in-cinema" id="seen-in-cinema">
    </div>
    `

    const COMPUTER_GAME_FORM_EXTRA = `
    <div>
        <label for="hours-played">Hours played</label>
        <input type="number" min="0" name="hours-played" id="hours-played">
    </div>`

    function initWorkPickDialog(){
        const dialogContainer = document.getElementById('create-work-dialog');
        console.log(dialogContainer);
        const dialog = new a11y_dialog__WEBPACK_IMPORTED_MODULE_1__["default"](dialogContainer);

        dialog.show();
    }

    function generateWorkTypeForm(event){
        const workType = event.target.value;

        const formContainer = document.querySelector('.form-container');
        formContainer.innerHTML = "";

        const form = stringToNode(WORK_FORM_FRAMEWORK)[0];
        form.dataset.type = workType;
        form.addEventListener('submit',piecesOfWorkController.addPieceOfWorkToLibrary);

        switch(workType){
            case 'book':
                form.append(...stringToNode(BOOK_FORM_EXTRA));
                break;
            case 'movie':
                form.append(...stringToNode(MOVIE_FORM_EXTRA));
                break;
            case 'computer-game':
                form.append(...stringToNode(COMPUTER_GAME_FORM_EXTRA));
                break;
        }

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = "Add to collection";

        form.append(submitButton);

        formContainer.append(form);
    }

    function changeWorkState(event){
        const pieceOfWorkElement = event.target.closest('.card');

        const index = pieceOfWorkElement.dataset.index;
        const pieceOfWorkClass = parseNodeClass(pieceOfWorkElement.classList[DOM_CLASS_INDEX_IN_CLASSLIST]) ;

        const newState = pieceOfWorkClass.changeWorkState(index);
    
        event.target.textContent = newState ? 'V' : 'X'; //TODO
    
        storageController.saveToStorage();
    }
    

    function generateLibraryCollection(){
        const booksContainer = document.querySelector(".container.books");
    
        Book.list.forEach((work,index) => { //TODO temp
            const book = createPieceOfWorkFrameworkElement(work,index,'book');

            const numberOfPages = document.createElement('div');
            numberOfPages.classList.add('number-of-pages');
            numberOfPages.textContent = work.numberOfPages;

            book.append(numberOfPages);
            
            addButtonsToPieceOfWork(work,book);
            
            booksContainer.append(book);
        });

        const moviesContainer = document.querySelector('.container.movies');

        Movie.list.forEach((work,index) => {
            const movie = createPieceOfWorkFrameworkElement(work,index,'movie');

            const numberOfViewings = document.createElement('div');
            numberOfViewings.classList.add('number-of-viewings');
            numberOfViewings.textContent = work.numberOfViewings;

            const seenInCinema = document.createElement('div');
            seenInCinema.classList.add('seen-in-cinema');
            seenInCinema.textContent = `Seen in cinema: ${work.seenInCinema ? 'V' : 'X'}`;

            movie.append(numberOfViewings,seenInCinema);

            addButtonsToPieceOfWork(work,movie);

            moviesContainer.append(movie);
        });

        const computerGamesContainer = document.querySelector('.container.computer-games');

        ComputerGame.list.forEach((work,index) => {
            const computerGame = createPieceOfWorkFrameworkElement(work,index,'computer-game');

            const hoursPlayed = document.createElement('div');
            hoursPlayed.classList.add('hours-played');
            hoursPlayed.textContent = work.hoursPlayed;

            computerGame.append(hoursPlayed);

            addButtonsToPieceOfWork(work,computerGame);

            computerGamesContainer.append(computerGame);
        });
        
    } 

    function createPieceOfWorkFrameworkElement(work,index,workStringClass){
        const workElement = document.createElement("div");
        workElement.classList.add('card',workStringClass);
        workElement.dataset.index = index;

        const title = document.createElement('div');
        title.classList.add('title');
        title.textContent = work.title;
        
        const creator = document.createElement('div');
        creator.classList.add('creator');
        creator.textContent = work.creator;

        workElement.append(title,creator);

        return workElement;
    }

    function addButtonsToPieceOfWork(work,workElement){

        const completeButton = document.createElement('button');
        completeButton.classList.add('mark-completed');
        completeButton.textContent = work.isCompleted ? 'V' : 'X';
        completeButton.addEventListener('click',changeWorkState);

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete');
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener('click',warnAboutDeletion, {capture: true});

        workElement.append(completeButton,deleteButton);
    }

    function warnAboutDeletion(event){

        const deleteButton = event.target;
    
        deleteButton.textContent = "Are you sure?"
        
        const func = tryToDelete.bind(deleteButton);
        window.addEventListener('click',func,{once: true, capture:true});
    
        deleteButton.removeEventListener('click',warnAboutDeletion, {capture: true});
    }
    
    function tryToDelete(event){
        const lastClickedDeleteButton = this;
        const clickedElement = event.target;
        
        if(lastClickedDeleteButton.isEqualNode(clickedElement)){
            const pieceOfWorkClass = parseNodeClass(lastClickedDeleteButton.closest('.card').classList[DOM_CLASS_INDEX_IN_CLASSLIST]);
            const index = lastClickedDeleteButton.closest('.card').dataset.index;

            piecesOfWorkController.deletePieceOfWork(pieceOfWorkClass,index);
        } else {
            lastClickedDeleteButton.textContent = "Delete";
            lastClickedDeleteButton.addEventListener('click',warnAboutDeletion, {capture: true});
        }
    }
    
    function refreshCollection(){
        const containers = document.querySelectorAll('.container');
        containers.forEach(container => container.innerHTML = "");
    
        generateLibraryCollection();
    }

    function getPieceOfWorkFormData(){

        const title = document.getElementById("title").value;
        const creator = document.getElementById('creator').value;
        const isCompleted = document.getElementById('is-completed').checked;

        return {title,creator,isCompleted};
    }

    function getBookFormData(){
        const numberOfPages = document.getElementById('number-of-pages').value;

        return {numberOfPages};
    }

    function getMovieFormData(){
        const numberOfViewings = document.getElementById('number-of-viewings').value;
        const seenInCinema = document.getElementById('seen-in-cinema').checked;
        
        return {numberOfViewings,seenInCinema};
    }

    function getComputerGameFormData(){
        const hoursPlayed = document.getElementById('hours-played').value;

        return {hoursPlayed};
    }

    const stringToNode = function(string){
        const template = document.createElement('template');
        string = string.trim();
        template.innerHTML = string;
        return template.content.childNodes;
    }

    function parseNodeClass(stringClass){
        switch(stringClass){
            case 'book':
                return Book;
            case 'movie':
                return Movie;
            case 'computer-game':
                return ComputerGame;
        }
    }

    function selectRating(event){
        const ratingBar = event.currentTarget.parentNode;

        [...ratingBar.children].forEach(node => {
            node.classList.remove('selected');
        });

        event.currentTarget.classList.add('selected');
    }

    return {refreshCollection,generateWorkTypeForm,getPieceOfWorkFormData,getBookFormData,getMovieFormData,getComputerGameFormData,initWorkPickDialog,selectRating};
})();

mainController.init();
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Qjs7QUFFQTtBQUNBOztBQUVBLGdCQUFnQjtBQUNoQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQjtBQUNoQjs7QUFFQTtBQUNBOztBQUVBLGdCQUFnQjtBQUNoQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBOztBQUVBLFlBQVk7QUFDWixDQUFDOztBQUVELHNCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbGlicmFyeS1vZGluLy4vbm9kZV9tb2R1bGVzL2ExMXktZGlhbG9nL2Rpc3QvYTExeS1kaWFsb2cuZXNtLmpzIiwid2VicGFjazovL2xpYnJhcnktb2Rpbi8uL3NyYy9zdHlsZS5jc3MiLCJ3ZWJwYWNrOi8vbGlicmFyeS1vZGluLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qcyIsIndlYnBhY2s6Ly9saWJyYXJ5LW9kaW4vLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qcyIsIndlYnBhY2s6Ly9saWJyYXJ5LW9kaW4vLi9zcmMvc3R5bGUuY3NzPzcxNjMiLCJ3ZWJwYWNrOi8vbGlicmFyeS1vZGluLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzIiwid2VicGFjazovL2xpYnJhcnktb2Rpbi8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanMiLCJ3ZWJwYWNrOi8vbGlicmFyeS1vZGluLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzIiwid2VicGFjazovL2xpYnJhcnktb2Rpbi8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qcyIsIndlYnBhY2s6Ly9saWJyYXJ5LW9kaW4vLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qcyIsIndlYnBhY2s6Ly9saWJyYXJ5LW9kaW4vLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qcyIsIndlYnBhY2s6Ly9saWJyYXJ5LW9kaW4vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vbGlicmFyeS1vZGluL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL2xpYnJhcnktb2Rpbi93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vbGlicmFyeS1vZGluL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vbGlicmFyeS1vZGluL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vbGlicmFyeS1vZGluL3dlYnBhY2svcnVudGltZS9ub25jZSIsIndlYnBhY2s6Ly9saWJyYXJ5LW9kaW4vLi9zcmMvbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgZm9jdXNhYmxlU2VsZWN0b3JzID0gW1xuICAnYVtocmVmXTpub3QoW3RhYmluZGV4Xj1cIi1cIl0pJyxcbiAgJ2FyZWFbaHJlZl06bm90KFt0YWJpbmRleF49XCItXCJdKScsXG4gICdpbnB1dDpub3QoW3R5cGU9XCJoaWRkZW5cIl0pOm5vdChbdHlwZT1cInJhZGlvXCJdKTpub3QoW2Rpc2FibGVkXSk6bm90KFt0YWJpbmRleF49XCItXCJdKScsXG4gICdpbnB1dFt0eXBlPVwicmFkaW9cIl06bm90KFtkaXNhYmxlZF0pOm5vdChbdGFiaW5kZXhePVwiLVwiXSknLFxuICAnc2VsZWN0Om5vdChbZGlzYWJsZWRdKTpub3QoW3RhYmluZGV4Xj1cIi1cIl0pJyxcbiAgJ3RleHRhcmVhOm5vdChbZGlzYWJsZWRdKTpub3QoW3RhYmluZGV4Xj1cIi1cIl0pJyxcbiAgJ2J1dHRvbjpub3QoW2Rpc2FibGVkXSk6bm90KFt0YWJpbmRleF49XCItXCJdKScsXG4gICdpZnJhbWU6bm90KFt0YWJpbmRleF49XCItXCJdKScsXG4gICdhdWRpb1tjb250cm9sc106bm90KFt0YWJpbmRleF49XCItXCJdKScsXG4gICd2aWRlb1tjb250cm9sc106bm90KFt0YWJpbmRleF49XCItXCJdKScsXG4gICdbY29udGVudGVkaXRhYmxlXTpub3QoW3RhYmluZGV4Xj1cIi1cIl0pJyxcbiAgJ1t0YWJpbmRleF06bm90KFt0YWJpbmRleF49XCItXCJdKScsXG5dO1xuXG52YXIgVEFCX0tFWSA9ICdUYWInO1xudmFyIEVTQ0FQRV9LRVkgPSAnRXNjYXBlJztcblxuLyoqXG4gKiBEZWZpbmUgdGhlIGNvbnN0cnVjdG9yIHRvIGluc3RhbnRpYXRlIGEgZGlhbG9nXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnRcbiAqL1xuZnVuY3Rpb24gQTExeURpYWxvZyhlbGVtZW50KSB7XG4gIC8vIFByZWJpbmQgdGhlIGZ1bmN0aW9ucyB0aGF0IHdpbGwgYmUgYm91bmQgaW4gYWRkRXZlbnRMaXN0ZW5lciBhbmRcbiAgLy8gcmVtb3ZlRXZlbnRMaXN0ZW5lciB0byBhdm9pZCBsb3NpbmcgcmVmZXJlbmNlc1xuICB0aGlzLl9zaG93ID0gdGhpcy5zaG93LmJpbmQodGhpcyk7XG4gIHRoaXMuX2hpZGUgPSB0aGlzLmhpZGUuYmluZCh0aGlzKTtcbiAgdGhpcy5fbWFpbnRhaW5Gb2N1cyA9IHRoaXMuX21haW50YWluRm9jdXMuYmluZCh0aGlzKTtcbiAgdGhpcy5fYmluZEtleXByZXNzID0gdGhpcy5fYmluZEtleXByZXNzLmJpbmQodGhpcyk7XG5cbiAgdGhpcy4kZWwgPSBlbGVtZW50O1xuICB0aGlzLnNob3duID0gZmFsc2U7XG4gIHRoaXMuX2lkID0gdGhpcy4kZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWExMXktZGlhbG9nJykgfHwgdGhpcy4kZWwuaWQ7XG4gIHRoaXMuX3ByZXZpb3VzbHlGb2N1c2VkID0gbnVsbDtcbiAgdGhpcy5fbGlzdGVuZXJzID0ge307XG5cbiAgLy8gSW5pdGlhbGlzZSBldmVyeXRoaW5nIG5lZWRlZCBmb3IgdGhlIGRpYWxvZyB0byB3b3JrIHByb3Blcmx5XG4gIHRoaXMuY3JlYXRlKCk7XG59XG5cbi8qKlxuICogU2V0IHVwIGV2ZXJ5dGhpbmcgbmVjZXNzYXJ5IGZvciB0aGUgZGlhbG9nIHRvIGJlIGZ1bmN0aW9uaW5nXG4gKlxuICogQHBhcmFtIHsoTm9kZUxpc3QgfCBFbGVtZW50IHwgc3RyaW5nKX0gdGFyZ2V0c1xuICogQHJldHVybiB7dGhpc31cbiAqL1xuQTExeURpYWxvZy5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLiRlbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgdHJ1ZSk7XG4gIHRoaXMuJGVsLnNldEF0dHJpYnV0ZSgnYXJpYS1tb2RhbCcsIHRydWUpO1xuICB0aGlzLiRlbC5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgLTEpO1xuXG4gIGlmICghdGhpcy4kZWwuaGFzQXR0cmlidXRlKCdyb2xlJykpIHtcbiAgICB0aGlzLiRlbC5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnZGlhbG9nJyk7XG4gIH1cblxuICAvLyBLZWVwIGEgY29sbGVjdGlvbiBvZiBkaWFsb2cgb3BlbmVycywgZWFjaCBvZiB3aGljaCB3aWxsIGJlIGJvdW5kIGEgY2xpY2tcbiAgLy8gZXZlbnQgbGlzdGVuZXIgdG8gb3BlbiB0aGUgZGlhbG9nXG4gIHRoaXMuX29wZW5lcnMgPSAkJCgnW2RhdGEtYTExeS1kaWFsb2ctc2hvdz1cIicgKyB0aGlzLl9pZCArICdcIl0nKTtcbiAgdGhpcy5fb3BlbmVycy5mb3JFYWNoKFxuICAgIGZ1bmN0aW9uIChvcGVuZXIpIHtcbiAgICAgIG9wZW5lci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX3Nob3cpO1xuICAgIH0uYmluZCh0aGlzKVxuICApO1xuXG4gIC8vIEtlZXAgYSBjb2xsZWN0aW9uIG9mIGRpYWxvZyBjbG9zZXJzLCBlYWNoIG9mIHdoaWNoIHdpbGwgYmUgYm91bmQgYSBjbGlja1xuICAvLyBldmVudCBsaXN0ZW5lciB0byBjbG9zZSB0aGUgZGlhbG9nXG4gIGNvbnN0ICRlbCA9IHRoaXMuJGVsO1xuXG4gIHRoaXMuX2Nsb3NlcnMgPSAkJCgnW2RhdGEtYTExeS1kaWFsb2ctaGlkZV0nLCB0aGlzLiRlbClcbiAgICAvLyBUaGlzIGZpbHRlciBpcyBuZWNlc3NhcnkgaW4gY2FzZSB0aGVyZSBhcmUgbmVzdGVkIGRpYWxvZ3MsIHNvIHRoYXRcbiAgICAvLyBvbmx5IGNsb3NlcnMgZnJvbSB0aGUgY3VycmVudCBkaWFsb2cgYXJlIHJldHJpZXZlZCBhbmQgZWZmZWN0aXZlXG4gICAgLmZpbHRlcihmdW5jdGlvbiAoY2xvc2VyKSB7XG4gICAgICAvLyBUZXN0aW5nIGZvciBgW2FyaWEtbW9kYWw9XCJ0cnVlXCJdYCBpcyBub3QgZW5vdWdoIHNpbmNlIHRoaXMgYXR0cmlidXRlXG4gICAgICAvLyBhbmQgdGhlIGNvbGxlY3Qgb2YgY2xvc2VycyBpcyBkb25lIGF0IGluc3RhbnRhdGlvbiB0aW1lLCB3aGVuIG5lc3RlZFxuICAgICAgLy8gZGlhbG9ncyBtaWdodCBub3QgaGF2ZSB5ZXQgYmVlbiBpbnN0YW50aWF0ZWQuIE5vdGUgdGhhdCBpZiB0aGUgZGlhbG9nc1xuICAgICAgLy8gYXJlIG1hbnVhbGx5IGluc3RhbnRpYXRlZCwgdGhpcyBjb3VsZCBzdGlsbCBmYWlsIGJlY2F1c2Ugbm9uZSBvZiB0aGVzZVxuICAgICAgLy8gc2VsZWN0b3JzIHdvdWxkIG1hdGNoOyB0aGlzIHdvdWxkIGNhdXNlIGNsb3NlcnMgdG8gY2xvc2UgYWxsIHBhcmVudFxuICAgICAgLy8gZGlhbG9ncyBpbnN0ZWFkIG9mIGp1c3QgdGhlIGN1cnJlbnQgb25lXG4gICAgICByZXR1cm4gY2xvc2VyLmNsb3Nlc3QoJ1thcmlhLW1vZGFsPVwidHJ1ZVwiXSwgW2RhdGEtYTExeS1kaWFsb2ddJykgPT09ICRlbFxuICAgIH0pXG4gICAgLmNvbmNhdCgkJCgnW2RhdGEtYTExeS1kaWFsb2ctaGlkZT1cIicgKyB0aGlzLl9pZCArICdcIl0nKSk7XG5cbiAgdGhpcy5fY2xvc2Vycy5mb3JFYWNoKFxuICAgIGZ1bmN0aW9uIChjbG9zZXIpIHtcbiAgICAgIGNsb3Nlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hpZGUpO1xuICAgIH0uYmluZCh0aGlzKVxuICApO1xuXG4gIC8vIEV4ZWN1dGUgYWxsIGNhbGxiYWNrcyByZWdpc3RlcmVkIGZvciB0aGUgYGNyZWF0ZWAgZXZlbnRcbiAgdGhpcy5fZmlyZSgnY3JlYXRlJyk7XG5cbiAgcmV0dXJuIHRoaXNcbn07XG5cbi8qKlxuICogU2hvdyB0aGUgZGlhbG9nIGVsZW1lbnQsIGRpc2FibGUgYWxsIHRoZSB0YXJnZXRzIChzaWJsaW5ncyksIHRyYXAgdGhlXG4gKiBjdXJyZW50IGZvY3VzIHdpdGhpbiBpdCwgbGlzdGVuIGZvciBzb21lIHNwZWNpZmljIGtleSBwcmVzc2VzIGFuZCBmaXJlIGFsbFxuICogcmVnaXN0ZXJlZCBjYWxsYmFja3MgZm9yIGBzaG93YCBldmVudFxuICpcbiAqIEBwYXJhbSB7Q3VzdG9tRXZlbnR9IGV2ZW50XG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5BMTF5RGlhbG9nLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIC8vIElmIHRoZSBkaWFsb2cgaXMgYWxyZWFkeSBvcGVuLCBhYm9ydFxuICBpZiAodGhpcy5zaG93bikge1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyBLZWVwIGEgcmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50bHkgZm9jdXNlZCBlbGVtZW50IHRvIGJlIGFibGUgdG8gcmVzdG9yZVxuICAvLyBpdCBsYXRlclxuICB0aGlzLl9wcmV2aW91c2x5Rm9jdXNlZCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gIHRoaXMuJGVsLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nKTtcbiAgdGhpcy5zaG93biA9IHRydWU7XG5cbiAgLy8gU2V0IHRoZSBmb2N1cyB0byB0aGUgZGlhbG9nIGVsZW1lbnRcbiAgbW92ZUZvY3VzVG9EaWFsb2codGhpcy4kZWwpO1xuXG4gIC8vIEJpbmQgYSBmb2N1cyBldmVudCBsaXN0ZW5lciB0byB0aGUgYm9keSBlbGVtZW50IHRvIG1ha2Ugc3VyZSB0aGUgZm9jdXNcbiAgLy8gc3RheXMgdHJhcHBlZCBpbnNpZGUgdGhlIGRpYWxvZyB3aGlsZSBvcGVuLCBhbmQgc3RhcnQgbGlzdGVuaW5nIGZvciBzb21lXG4gIC8vIHNwZWNpZmljIGtleSBwcmVzc2VzIChUQUIgYW5kIEVTQylcbiAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMuX21haW50YWluRm9jdXMsIHRydWUpO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fYmluZEtleXByZXNzKTtcblxuICAvLyBFeGVjdXRlIGFsbCBjYWxsYmFja3MgcmVnaXN0ZXJlZCBmb3IgdGhlIGBzaG93YCBldmVudFxuICB0aGlzLl9maXJlKCdzaG93JywgZXZlbnQpO1xuXG4gIHJldHVybiB0aGlzXG59O1xuXG4vKipcbiAqIEhpZGUgdGhlIGRpYWxvZyBlbGVtZW50LCBlbmFibGUgYWxsIHRoZSB0YXJnZXRzIChzaWJsaW5ncyksIHJlc3RvcmUgdGhlXG4gKiBmb2N1cyB0byB0aGUgcHJldmlvdXNseSBhY3RpdmUgZWxlbWVudCwgc3RvcCBsaXN0ZW5pbmcgZm9yIHNvbWUgc3BlY2lmaWNcbiAqIGtleSBwcmVzc2VzIGFuZCBmaXJlIGFsbCByZWdpc3RlcmVkIGNhbGxiYWNrcyBmb3IgYGhpZGVgIGV2ZW50XG4gKlxuICogQHBhcmFtIHtDdXN0b21FdmVudH0gZXZlbnRcbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cbkExMXlEaWFsb2cucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgLy8gSWYgdGhlIGRpYWxvZyBpcyBhbHJlYWR5IGNsb3NlZCwgYWJvcnRcbiAgaWYgKCF0aGlzLnNob3duKSB7XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHRoaXMuc2hvd24gPSBmYWxzZTtcbiAgdGhpcy4kZWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG5cbiAgLy8gSWYgdGhlcmUgd2FzIGEgZm9jdXNlZCBlbGVtZW50IGJlZm9yZSB0aGUgZGlhbG9nIHdhcyBvcGVuZWQgKGFuZCBpdCBoYXMgYVxuICAvLyBgZm9jdXNgIG1ldGhvZCksIHJlc3RvcmUgdGhlIGZvY3VzIGJhY2sgdG8gaXRcbiAgLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vS2l0dHlHaXJhdWRlbC9hMTF5LWRpYWxvZy9pc3N1ZXMvMTA4XG4gIGlmICh0aGlzLl9wcmV2aW91c2x5Rm9jdXNlZCAmJiB0aGlzLl9wcmV2aW91c2x5Rm9jdXNlZC5mb2N1cykge1xuICAgIHRoaXMuX3ByZXZpb3VzbHlGb2N1c2VkLmZvY3VzKCk7XG4gIH1cblxuICAvLyBSZW1vdmUgdGhlIGZvY3VzIGV2ZW50IGxpc3RlbmVyIHRvIHRoZSBib2R5IGVsZW1lbnQgYW5kIHN0b3AgbGlzdGVuaW5nXG4gIC8vIGZvciBzcGVjaWZpYyBrZXkgcHJlc3Nlc1xuICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5fbWFpbnRhaW5Gb2N1cywgdHJ1ZSk7XG4gIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9iaW5kS2V5cHJlc3MpO1xuXG4gIC8vIEV4ZWN1dGUgYWxsIGNhbGxiYWNrcyByZWdpc3RlcmVkIGZvciB0aGUgYGhpZGVgIGV2ZW50XG4gIHRoaXMuX2ZpcmUoJ2hpZGUnLCBldmVudCk7XG5cbiAgcmV0dXJuIHRoaXNcbn07XG5cbi8qKlxuICogRGVzdHJveSB0aGUgY3VycmVudCBpbnN0YW5jZSAoYWZ0ZXIgbWFraW5nIHN1cmUgdGhlIGRpYWxvZyBoYXMgYmVlbiBoaWRkZW4pXG4gKiBhbmQgcmVtb3ZlIGFsbCBhc3NvY2lhdGVkIGxpc3RlbmVycyBmcm9tIGRpYWxvZyBvcGVuZXJzIGFuZCBjbG9zZXJzXG4gKlxuICogQHJldHVybiB7dGhpc31cbiAqL1xuQTExeURpYWxvZy5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gSGlkZSB0aGUgZGlhbG9nIHRvIGF2b2lkIGRlc3Ryb3lpbmcgYW4gb3BlbiBpbnN0YW5jZVxuICB0aGlzLmhpZGUoKTtcblxuICAvLyBSZW1vdmUgdGhlIGNsaWNrIGV2ZW50IGxpc3RlbmVyIGZyb20gYWxsIGRpYWxvZyBvcGVuZXJzXG4gIHRoaXMuX29wZW5lcnMuZm9yRWFjaChcbiAgICBmdW5jdGlvbiAob3BlbmVyKSB7XG4gICAgICBvcGVuZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9zaG93KTtcbiAgICB9LmJpbmQodGhpcylcbiAgKTtcblxuICAvLyBSZW1vdmUgdGhlIGNsaWNrIGV2ZW50IGxpc3RlbmVyIGZyb20gYWxsIGRpYWxvZyBjbG9zZXJzXG4gIHRoaXMuX2Nsb3NlcnMuZm9yRWFjaChcbiAgICBmdW5jdGlvbiAoY2xvc2VyKSB7XG4gICAgICBjbG9zZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oaWRlKTtcbiAgICB9LmJpbmQodGhpcylcbiAgKTtcblxuICAvLyBFeGVjdXRlIGFsbCBjYWxsYmFja3MgcmVnaXN0ZXJlZCBmb3IgdGhlIGBkZXN0cm95YCBldmVudFxuICB0aGlzLl9maXJlKCdkZXN0cm95Jyk7XG5cbiAgLy8gS2VlcCBhbiBvYmplY3Qgb2YgbGlzdGVuZXIgdHlwZXMgbWFwcGVkIHRvIGNhbGxiYWNrIGZ1bmN0aW9uc1xuICB0aGlzLl9saXN0ZW5lcnMgPSB7fTtcblxuICByZXR1cm4gdGhpc1xufTtcblxuLyoqXG4gKiBSZWdpc3RlciBhIG5ldyBjYWxsYmFjayBmb3IgdGhlIGdpdmVuIGV2ZW50IHR5cGVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlclxuICovXG5BMTF5RGlhbG9nLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uICh0eXBlLCBoYW5kbGVyKSB7XG4gIGlmICh0eXBlb2YgdGhpcy5fbGlzdGVuZXJzW3R5cGVdID09PSAndW5kZWZpbmVkJykge1xuICAgIHRoaXMuX2xpc3RlbmVyc1t0eXBlXSA9IFtdO1xuICB9XG5cbiAgdGhpcy5fbGlzdGVuZXJzW3R5cGVdLnB1c2goaGFuZGxlcik7XG5cbiAgcmV0dXJuIHRoaXNcbn07XG5cbi8qKlxuICogVW5yZWdpc3RlciBhbiBleGlzdGluZyBjYWxsYmFjayBmb3IgdGhlIGdpdmVuIGV2ZW50IHR5cGVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlclxuICovXG5BMTF5RGlhbG9nLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiAodHlwZSwgaGFuZGxlcikge1xuICB2YXIgaW5kZXggPSAodGhpcy5fbGlzdGVuZXJzW3R5cGVdIHx8IFtdKS5pbmRleE9mKGhhbmRsZXIpO1xuXG4gIGlmIChpbmRleCA+IC0xKSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzW3R5cGVdLnNwbGljZShpbmRleCwgMSk7XG4gIH1cblxuICByZXR1cm4gdGhpc1xufTtcblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYWxsIHJlZ2lzdGVyZWQgaGFuZGxlcnMgZm9yIGdpdmVuIHR5cGUgYW5kIGNhbGwgdGhlbSBhbGwgd2l0aFxuICogdGhlIGRpYWxvZyBlbGVtZW50IGFzIGZpcnN0IGFyZ3VtZW50LCBldmVudCBhcyBzZWNvbmQgYXJndW1lbnQgKGlmIGFueSkuIEFsc29cbiAqIGRpc3BhdGNoIGEgY3VzdG9tIGV2ZW50IG9uIHRoZSBET00gZWxlbWVudCBpdHNlbGYgdG8gbWFrZSBpdCBwb3NzaWJsZSB0b1xuICogcmVhY3QgdG8gdGhlIGxpZmVjeWNsZSBvZiBhdXRvLWluc3RhbnRpYXRlZCBkaWFsb2dzLlxuICpcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7Q3VzdG9tRXZlbnR9IGV2ZW50XG4gKi9cbkExMXlEaWFsb2cucHJvdG90eXBlLl9maXJlID0gZnVuY3Rpb24gKHR5cGUsIGV2ZW50KSB7XG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnNbdHlwZV0gfHwgW107XG4gIHZhciBkb21FdmVudCA9IG5ldyBDdXN0b21FdmVudCh0eXBlLCB7IGRldGFpbDogZXZlbnQgfSk7XG5cbiAgdGhpcy4kZWwuZGlzcGF0Y2hFdmVudChkb21FdmVudCk7XG5cbiAgbGlzdGVuZXJzLmZvckVhY2goXG4gICAgZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgICBsaXN0ZW5lcih0aGlzLiRlbCwgZXZlbnQpO1xuICAgIH0uYmluZCh0aGlzKVxuICApO1xufTtcblxuLyoqXG4gKiBQcml2YXRlIGV2ZW50IGhhbmRsZXIgdXNlZCB3aGVuIGxpc3RlbmluZyB0byBzb21lIHNwZWNpZmljIGtleSBwcmVzc2VzXG4gKiAobmFtZWx5IEVTQ0FQRSBhbmQgVEFCKVxuICpcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqL1xuQTExeURpYWxvZy5wcm90b3R5cGUuX2JpbmRLZXlwcmVzcyA9IGZ1bmN0aW9uIChldmVudCkge1xuICAvLyBUaGlzIGlzIGFuIGVzY2FwZSBoYXRjaCBpbiBjYXNlIHRoZXJlIGFyZSBuZXN0ZWQgZGlhbG9ncywgc28gdGhlIGtleXByZXNzZXNcbiAgLy8gYXJlIG9ubHkgcmVhY3RlZCB0byBmb3IgdGhlIG1vc3QgcmVjZW50IG9uZVxuICBjb25zdCBmb2N1c2VkID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgaWYgKGZvY3VzZWQgJiYgZm9jdXNlZC5jbG9zZXN0KCdbYXJpYS1tb2RhbD1cInRydWVcIl0nKSAhPT0gdGhpcy4kZWwpIHJldHVyblxuXG4gIC8vIElmIHRoZSBkaWFsb2cgaXMgc2hvd24gYW5kIHRoZSBFU0NBUEUga2V5IGlzIGJlaW5nIHByZXNzZWQsIHByZXZlbnQgYW55XG4gIC8vIGZ1cnRoZXIgZWZmZWN0cyBmcm9tIHRoZSBFU0NBUEUga2V5IGFuZCBoaWRlIHRoZSBkaWFsb2csIHVubGVzcyBpdHMgcm9sZVxuICAvLyBpcyAnYWxlcnRkaWFsb2cnLCB3aGljaCBzaG91bGQgYmUgbW9kYWxcbiAgaWYgKFxuICAgIHRoaXMuc2hvd24gJiZcbiAgICBldmVudC5rZXkgPT09IEVTQ0FQRV9LRVkgJiZcbiAgICB0aGlzLiRlbC5nZXRBdHRyaWJ1dGUoJ3JvbGUnKSAhPT0gJ2FsZXJ0ZGlhbG9nJ1xuICApIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMuaGlkZShldmVudCk7XG4gIH1cblxuICAvLyBJZiB0aGUgZGlhbG9nIGlzIHNob3duIGFuZCB0aGUgVEFCIGtleSBpcyBiZWluZyBwcmVzc2VkLCBtYWtlIHN1cmUgdGhlXG4gIC8vIGZvY3VzIHN0YXlzIHRyYXBwZWQgd2l0aGluIHRoZSBkaWFsb2cgZWxlbWVudFxuICBpZiAodGhpcy5zaG93biAmJiBldmVudC5rZXkgPT09IFRBQl9LRVkpIHtcbiAgICB0cmFwVGFiS2V5KHRoaXMuJGVsLCBldmVudCk7XG4gIH1cbn07XG5cbi8qKlxuICogUHJpdmF0ZSBldmVudCBoYW5kbGVyIHVzZWQgd2hlbiBtYWtpbmcgc3VyZSB0aGUgZm9jdXMgc3RheXMgd2l0aGluIHRoZVxuICogY3VycmVudGx5IG9wZW4gZGlhbG9nXG4gKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICovXG5BMTF5RGlhbG9nLnByb3RvdHlwZS5fbWFpbnRhaW5Gb2N1cyA9IGZ1bmN0aW9uIChldmVudCkge1xuICAvLyBJZiB0aGUgZGlhbG9nIGlzIHNob3duIGFuZCB0aGUgZm9jdXMgaXMgbm90IHdpdGhpbiBhIGRpYWxvZyBlbGVtZW50IChlaXRoZXJcbiAgLy8gdGhpcyBvbmUgb3IgYW5vdGhlciBvbmUgaW4gY2FzZSBvZiBuZXN0ZWQgZGlhbG9ncykgb3Igd2l0aGluIGFuIGVsZW1lbnRcbiAgLy8gd2l0aCB0aGUgYGRhdGEtYTExeS1kaWFsb2ctZm9jdXMtdHJhcC1pZ25vcmVgIGF0dHJpYnV0ZSwgbW92ZSBpdCBiYWNrIHRvXG4gIC8vIGl0cyBmaXJzdCBmb2N1c2FibGUgY2hpbGQuXG4gIC8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL0tpdHR5R2lyYXVkZWwvYTExeS1kaWFsb2cvaXNzdWVzLzE3N1xuICBpZiAoXG4gICAgdGhpcy5zaG93biAmJlxuICAgICFldmVudC50YXJnZXQuY2xvc2VzdCgnW2FyaWEtbW9kYWw9XCJ0cnVlXCJdJykgJiZcbiAgICAhZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWExMXktZGlhbG9nLWlnbm9yZS1mb2N1cy10cmFwXScpXG4gICkge1xuICAgIG1vdmVGb2N1c1RvRGlhbG9nKHRoaXMuJGVsKTtcbiAgfVxufTtcblxuLyoqXG4gKiBDb252ZXJ0IGEgTm9kZUxpc3QgaW50byBhbiBhcnJheVxuICpcbiAqIEBwYXJhbSB7Tm9kZUxpc3R9IGNvbGxlY3Rpb25cbiAqIEByZXR1cm4ge0FycmF5PEVsZW1lbnQ+fVxuICovXG5mdW5jdGlvbiB0b0FycmF5KGNvbGxlY3Rpb24pIHtcbiAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGNvbGxlY3Rpb24pXG59XG5cbi8qKlxuICogUXVlcnkgdGhlIERPTSBmb3Igbm9kZXMgbWF0Y2hpbmcgdGhlIGdpdmVuIHNlbGVjdG9yLCBzY29wZWQgdG8gY29udGV4dCAob3JcbiAqIHRoZSB3aG9sZSBkb2N1bWVudClcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAqIEBwYXJhbSB7RWxlbWVudH0gW2NvbnRleHQgPSBkb2N1bWVudF1cbiAqIEByZXR1cm4ge0FycmF5PEVsZW1lbnQ+fVxuICovXG5mdW5jdGlvbiAkJChzZWxlY3RvciwgY29udGV4dCkge1xuICByZXR1cm4gdG9BcnJheSgoY29udGV4dCB8fCBkb2N1bWVudCkucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpXG59XG5cbi8qKlxuICogU2V0IHRoZSBmb2N1cyB0byB0aGUgZmlyc3QgZWxlbWVudCB3aXRoIGBhdXRvZm9jdXNgIHdpdGggdGhlIGVsZW1lbnQgb3IgdGhlXG4gKiBlbGVtZW50IGl0c2VsZlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gbm9kZVxuICovXG5mdW5jdGlvbiBtb3ZlRm9jdXNUb0RpYWxvZyhub2RlKSB7XG4gIHZhciBmb2N1c2VkID0gbm9kZS5xdWVyeVNlbGVjdG9yKCdbYXV0b2ZvY3VzXScpIHx8IG5vZGU7XG5cbiAgZm9jdXNlZC5mb2N1cygpO1xufVxuXG4vKipcbiAqIEdldCB0aGUgZm9jdXNhYmxlIGNoaWxkcmVuIG9mIHRoZSBnaXZlbiBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBub2RlXG4gKiBAcmV0dXJuIHtBcnJheTxFbGVtZW50Pn1cbiAqL1xuZnVuY3Rpb24gZ2V0Rm9jdXNhYmxlQ2hpbGRyZW4obm9kZSkge1xuICByZXR1cm4gJCQoZm9jdXNhYmxlU2VsZWN0b3JzLmpvaW4oJywnKSwgbm9kZSkuZmlsdGVyKGZ1bmN0aW9uIChjaGlsZCkge1xuICAgIHJldHVybiAhIShcbiAgICAgIGNoaWxkLm9mZnNldFdpZHRoIHx8XG4gICAgICBjaGlsZC5vZmZzZXRIZWlnaHQgfHxcbiAgICAgIGNoaWxkLmdldENsaWVudFJlY3RzKCkubGVuZ3RoXG4gICAgKVxuICB9KVxufVxuXG4vKipcbiAqIFRyYXAgdGhlIGZvY3VzIGluc2lkZSB0aGUgZ2l2ZW4gZWxlbWVudFxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gbm9kZVxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqL1xuZnVuY3Rpb24gdHJhcFRhYktleShub2RlLCBldmVudCkge1xuICB2YXIgZm9jdXNhYmxlQ2hpbGRyZW4gPSBnZXRGb2N1c2FibGVDaGlsZHJlbihub2RlKTtcbiAgdmFyIGZvY3VzZWRJdGVtSW5kZXggPSBmb2N1c2FibGVDaGlsZHJlbi5pbmRleE9mKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpO1xuXG4gIC8vIElmIHRoZSBTSElGVCBrZXkgaXMgYmVpbmcgcHJlc3NlZCB3aGlsZSB0YWJiaW5nIChtb3ZpbmcgYmFja3dhcmRzKSBhbmRcbiAgLy8gdGhlIGN1cnJlbnRseSBmb2N1c2VkIGl0ZW0gaXMgdGhlIGZpcnN0IG9uZSwgbW92ZSB0aGUgZm9jdXMgdG8gdGhlIGxhc3RcbiAgLy8gZm9jdXNhYmxlIGl0ZW0gZnJvbSB0aGUgZGlhbG9nIGVsZW1lbnRcbiAgaWYgKGV2ZW50LnNoaWZ0S2V5ICYmIGZvY3VzZWRJdGVtSW5kZXggPT09IDApIHtcbiAgICBmb2N1c2FibGVDaGlsZHJlbltmb2N1c2FibGVDaGlsZHJlbi5sZW5ndGggLSAxXS5mb2N1cygpO1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgLy8gSWYgdGhlIFNISUZUIGtleSBpcyBub3QgYmVpbmcgcHJlc3NlZCAobW92aW5nIGZvcndhcmRzKSBhbmQgdGhlIGN1cnJlbnRseVxuICAgIC8vIGZvY3VzZWQgaXRlbSBpcyB0aGUgbGFzdCBvbmUsIG1vdmUgdGhlIGZvY3VzIHRvIHRoZSBmaXJzdCBmb2N1c2FibGUgaXRlbVxuICAgIC8vIGZyb20gdGhlIGRpYWxvZyBlbGVtZW50XG4gIH0gZWxzZSBpZiAoXG4gICAgIWV2ZW50LnNoaWZ0S2V5ICYmXG4gICAgZm9jdXNlZEl0ZW1JbmRleCA9PT0gZm9jdXNhYmxlQ2hpbGRyZW4ubGVuZ3RoIC0gMVxuICApIHtcbiAgICBmb2N1c2FibGVDaGlsZHJlblswXS5mb2N1cygpO1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5zdGFudGlhdGVEaWFsb2dzKCkge1xuICAkJCgnW2RhdGEtYTExeS1kaWFsb2ddJykuZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xuICAgIG5ldyBBMTF5RGlhbG9nKG5vZGUpO1xuICB9KTtcbn1cblxuaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdsb2FkaW5nJykge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBpbnN0YW50aWF0ZURpYWxvZ3MpO1xuICB9IGVsc2Uge1xuICAgIGlmICh3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGluc3RhbnRpYXRlRGlhbG9ncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGluc3RhbnRpYXRlRGlhbG9ncywgMTYpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgeyBBMTF5RGlhbG9nIGFzIGRlZmF1bHQgfTtcbiIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIFwiYm9keSB7XFxuICAgIG1hcmdpbjogMDtcXG5cXG4gICAgaGVpZ2h0OiAxMDB2aDtcXG5cXG4gICAgZGlzcGxheTogZ3JpZDtcXG4gICAgZ3JpZC10ZW1wbGF0ZTogXFxuICAgICAgICBcXFwiaGVhZGVyIGhlYWRlclxcXCIgMTAwcHhcXG4gICAgICAgIFxcXCJhc2lkZSBtYWluXFxcIiAxZnIgL1xcbiAgICAgICAgMzAwcHggMWZyO1xcbn1cXG5cXG5oZWFkZXIge1xcbiAgICBncmlkLWFyZWE6IGhlYWRlcjtcXG5cXG4gICAgY29sb3I6IHdoaXRlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjNWIyMWI2O1xcbiAgICBwYWRkaW5nOiA1cHggMTBweDtcXG59XFxuXFxuYXNpZGUge1xcbiAgICBncmlkLWFyZWE6IGFzaWRlO1xcblxcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjN2MzYWVkO1xcbn1cXG5cXG5tYWluIHtcXG4gICAgZ3JpZC1hcmVhOiBtYWluO1xcbn1cXG5cXG4uY29udGFpbmVyIHtcXG4gICAgcGFkZGluZzogMTBweDtcXG5cXG4gICAgZGlzcGxheTogZ3JpZDtcXG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoYXV0by1maWxsLG1pbm1heCgyMDBweCwxZnIpKTtcXG4gICAgZ3JpZC1hdXRvLXJvd3M6IDE1MHB4O1xcblxcbiAgICBnYXA6IDEwcHg7XFxufVxcblxcbi5jYXJkIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2VkZTlmZTtcXG5cXG4gICAgZGlzcGxheTogZ3JpZDtcXG4gICAgcGxhY2UtaXRlbXM6IGNlbnRlcjtcXG5cXG4gICAgYm9yZGVyLXJhZGl1czogNXB4O1xcbn1cXG5cXG4ucmF0aW5nLWJhciB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiByb3ctcmV2ZXJzZTtcXG4gICAgd2lkdGg6IG1pbi1jb250ZW50O1xcbn1cXG5cXG4uc3RhciB7XFxuICAgIGNvbG9yOiB3aGl0ZTtcXG59XFxuXFxuLnN0YXIuc2VsZWN0ZWQgfiAuc3RhcixcXG4uc3Rhcjpob3ZlciB+IC5zdGFye1xcbiAgICBjb2xvcjogI0ZCQzAyRDtcXG59XFxuXFxuLnN0YXIuc2VsZWN0ZWQsXFxuLnN0YXI6aG92ZXJ7XFxuICAgIGNvbG9yOiAjRkJDMDJEO1xcbn1cXG5cXG4uZGlhbG9nLWNvbnRhaW5lciB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcblxcbiAgICBwb3NpdGlvbjogZml4ZWQ7XFxuICAgIHRvcDogMDtcXG4gICAgYm90dG9tOiAwO1xcbiAgICByaWdodDogMDtcXG4gICAgbGVmdDogMDtcXG4gICAgei1pbmRleDogMjtcXG59XFxuXFxuLmRpYWxvZy1jb250YWluZXJbYXJpYS1oaWRkZW49XFxcInRydWVcXFwiXSB7XFxuICAgIGRpc3BsYXk6IG5vbmU7XFxufVxcblxcbi5kaWFsb2ctb3ZlcmxheSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC43MTIpO1xcbiAgICBwb3NpdGlvbjogZml4ZWQ7XFxuICAgIHRvcDogMDtcXG4gICAgYm90dG9tOiAwO1xcbiAgICBsZWZ0OiAwO1xcbiAgICByaWdodDogMDtcXG59XFxuXFxuLmRpYWxvZy1jb250ZW50IHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzdjM2FlZDtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICB6LWluZGV4OiAyO1xcbn1cXG5cXG4uZGlhbG9nLWNsb3NlIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDA7XFxuICAgIHJpZ2h0OiAwO1xcbn1cIiwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi9zcmMvc3R5bGUuY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFBO0lBQ0ksU0FBUzs7SUFFVCxhQUFhOztJQUViLGFBQWE7SUFDYjs7O2lCQUdhO0FBQ2pCOztBQUVBO0lBQ0ksaUJBQWlCOztJQUVqQixZQUFZO0lBQ1oseUJBQXlCO0lBQ3pCLGlCQUFpQjtBQUNyQjs7QUFFQTtJQUNJLGdCQUFnQjs7SUFFaEIseUJBQXlCO0FBQzdCOztBQUVBO0lBQ0ksZUFBZTtBQUNuQjs7QUFFQTtJQUNJLGFBQWE7O0lBRWIsYUFBYTtJQUNiLDBEQUEwRDtJQUMxRCxxQkFBcUI7O0lBRXJCLFNBQVM7QUFDYjs7QUFFQTtJQUNJLHlCQUF5Qjs7SUFFekIsYUFBYTtJQUNiLG1CQUFtQjs7SUFFbkIsa0JBQWtCO0FBQ3RCOztBQUVBO0lBQ0ksYUFBYTtJQUNiLDJCQUEyQjtJQUMzQixrQkFBa0I7QUFDdEI7O0FBRUE7SUFDSSxZQUFZO0FBQ2hCOztBQUVBOztJQUVJLGNBQWM7QUFDbEI7O0FBRUE7O0lBRUksY0FBYztBQUNsQjs7QUFFQTtJQUNJLGFBQWE7SUFDYix1QkFBdUI7SUFDdkIsbUJBQW1COztJQUVuQixlQUFlO0lBQ2YsTUFBTTtJQUNOLFNBQVM7SUFDVCxRQUFRO0lBQ1IsT0FBTztJQUNQLFVBQVU7QUFDZDs7QUFFQTtJQUNJLGFBQWE7QUFDakI7O0FBRUE7SUFDSSxzQ0FBc0M7SUFDdEMsZUFBZTtJQUNmLE1BQU07SUFDTixTQUFTO0lBQ1QsT0FBTztJQUNQLFFBQVE7QUFDWjs7QUFFQTtJQUNJLHlCQUF5QjtJQUN6QixrQkFBa0I7SUFDbEIsVUFBVTtBQUNkOztBQUVBO0lBQ0ksa0JBQWtCO0lBQ2xCLE1BQU07SUFDTixRQUFRO0FBQ1pcIixcInNvdXJjZXNDb250ZW50XCI6W1wiYm9keSB7XFxuICAgIG1hcmdpbjogMDtcXG5cXG4gICAgaGVpZ2h0OiAxMDB2aDtcXG5cXG4gICAgZGlzcGxheTogZ3JpZDtcXG4gICAgZ3JpZC10ZW1wbGF0ZTogXFxuICAgICAgICBcXFwiaGVhZGVyIGhlYWRlclxcXCIgMTAwcHhcXG4gICAgICAgIFxcXCJhc2lkZSBtYWluXFxcIiAxZnIgL1xcbiAgICAgICAgMzAwcHggMWZyO1xcbn1cXG5cXG5oZWFkZXIge1xcbiAgICBncmlkLWFyZWE6IGhlYWRlcjtcXG5cXG4gICAgY29sb3I6IHdoaXRlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjNWIyMWI2O1xcbiAgICBwYWRkaW5nOiA1cHggMTBweDtcXG59XFxuXFxuYXNpZGUge1xcbiAgICBncmlkLWFyZWE6IGFzaWRlO1xcblxcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjN2MzYWVkO1xcbn1cXG5cXG5tYWluIHtcXG4gICAgZ3JpZC1hcmVhOiBtYWluO1xcbn1cXG5cXG4uY29udGFpbmVyIHtcXG4gICAgcGFkZGluZzogMTBweDtcXG5cXG4gICAgZGlzcGxheTogZ3JpZDtcXG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoYXV0by1maWxsLG1pbm1heCgyMDBweCwxZnIpKTtcXG4gICAgZ3JpZC1hdXRvLXJvd3M6IDE1MHB4O1xcblxcbiAgICBnYXA6IDEwcHg7XFxufVxcblxcbi5jYXJkIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2VkZTlmZTtcXG5cXG4gICAgZGlzcGxheTogZ3JpZDtcXG4gICAgcGxhY2UtaXRlbXM6IGNlbnRlcjtcXG5cXG4gICAgYm9yZGVyLXJhZGl1czogNXB4O1xcbn1cXG5cXG4ucmF0aW5nLWJhciB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiByb3ctcmV2ZXJzZTtcXG4gICAgd2lkdGg6IG1pbi1jb250ZW50O1xcbn1cXG5cXG4uc3RhciB7XFxuICAgIGNvbG9yOiB3aGl0ZTtcXG59XFxuXFxuLnN0YXIuc2VsZWN0ZWQgfiAuc3RhcixcXG4uc3Rhcjpob3ZlciB+IC5zdGFye1xcbiAgICBjb2xvcjogI0ZCQzAyRDtcXG59XFxuXFxuLnN0YXIuc2VsZWN0ZWQsXFxuLnN0YXI6aG92ZXJ7XFxuICAgIGNvbG9yOiAjRkJDMDJEO1xcbn1cXG5cXG4uZGlhbG9nLWNvbnRhaW5lciB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcblxcbiAgICBwb3NpdGlvbjogZml4ZWQ7XFxuICAgIHRvcDogMDtcXG4gICAgYm90dG9tOiAwO1xcbiAgICByaWdodDogMDtcXG4gICAgbGVmdDogMDtcXG4gICAgei1pbmRleDogMjtcXG59XFxuXFxuLmRpYWxvZy1jb250YWluZXJbYXJpYS1oaWRkZW49XFxcInRydWVcXFwiXSB7XFxuICAgIGRpc3BsYXk6IG5vbmU7XFxufVxcblxcbi5kaWFsb2ctb3ZlcmxheSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC43MTIpO1xcbiAgICBwb3NpdGlvbjogZml4ZWQ7XFxuICAgIHRvcDogMDtcXG4gICAgYm90dG9tOiAwO1xcbiAgICBsZWZ0OiAwO1xcbiAgICByaWdodDogMDtcXG59XFxuXFxuLmRpYWxvZy1jb250ZW50IHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzdjM2FlZDtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICB6LWluZGV4OiAyO1xcbn1cXG5cXG4uZGlhbG9nLWNsb3NlIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDA7XFxuICAgIHJpZ2h0OiAwO1xcbn1cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gIEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKSB7XG4gIHZhciBsaXN0ID0gW107IC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcblxuICBsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgY29udGVudCA9IFwiXCI7XG4gICAgICB2YXIgbmVlZExheWVyID0gdHlwZW9mIGl0ZW1bNV0gIT09IFwidW5kZWZpbmVkXCI7XG5cbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIik7XG4gICAgICB9XG5cbiAgICAgIGNvbnRlbnQgKz0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcblxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29udGVudDtcbiAgICB9KS5qb2luKFwiXCIpO1xuICB9OyAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuXG5cbiAgbGlzdC5pID0gZnVuY3Rpb24gaShtb2R1bGVzLCBtZWRpYSwgZGVkdXBlLCBzdXBwb3J0cywgbGF5ZXIpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIHVuZGVmaW5lZF1dO1xuICAgIH1cblxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG5cbiAgICBpZiAoZGVkdXBlKSB7XG4gICAgICBmb3IgKHZhciBrID0gMDsgayA8IHRoaXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgdmFyIGlkID0gdGhpc1trXVswXTtcblxuICAgICAgICBpZiAoaWQgIT0gbnVsbCkge1xuICAgICAgICAgIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIF9rID0gMDsgX2sgPCBtb2R1bGVzLmxlbmd0aDsgX2srKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfa10pO1xuXG4gICAgICBpZiAoZGVkdXBlICYmIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgbGF5ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtWzVdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzdXBwb3J0cykge1xuICAgICAgICBpZiAoIWl0ZW1bNF0pIHtcbiAgICAgICAgICBpdGVtWzRdID0gXCJcIi5jb25jYXQoc3VwcG9ydHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs0XSA9IHN1cHBvcnRzO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIHZhciBjb250ZW50ID0gaXRlbVsxXTtcbiAgdmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuXG4gIGlmICghY3NzTWFwcGluZykge1xuICAgIHJldHVybiBjb250ZW50O1xuICB9XG5cbiAgaWYgKHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY3NzTWFwcGluZykpKSk7XG4gICAgdmFyIGRhdGEgPSBcInNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LFwiLmNvbmNhdChiYXNlNjQpO1xuICAgIHZhciBzb3VyY2VNYXBwaW5nID0gXCIvKiMgXCIuY29uY2F0KGRhdGEsIFwiICovXCIpO1xuICAgIHZhciBzb3VyY2VVUkxzID0gY3NzTWFwcGluZy5zb3VyY2VzLm1hcChmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICByZXR1cm4gXCIvKiMgc291cmNlVVJMPVwiLmNvbmNhdChjc3NNYXBwaW5nLnNvdXJjZVJvb3QgfHwgXCJcIikuY29uY2F0KHNvdXJjZSwgXCIgKi9cIik7XG4gICAgfSk7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoc291cmNlVVJMcykuY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbihcIlxcblwiKTtcbiAgfVxuXG4gIHJldHVybiBbY29udGVudF0uam9pbihcIlxcblwiKTtcbn07IiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlLmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGUuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBzdHlsZXNJbkRPTSA9IFtdO1xuXG5mdW5jdGlvbiBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG4gIHZhciByZXN1bHQgPSAtMTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlc0luRE9NLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHN0eWxlc0luRE9NW2ldLmlkZW50aWZpZXIgPT09IGlkZW50aWZpZXIpIHtcbiAgICAgIHJlc3VsdCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucykge1xuICB2YXIgaWRDb3VudE1hcCA9IHt9O1xuICB2YXIgaWRlbnRpZmllcnMgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV07XG4gICAgdmFyIGlkID0gb3B0aW9ucy5iYXNlID8gaXRlbVswXSArIG9wdGlvbnMuYmFzZSA6IGl0ZW1bMF07XG4gICAgdmFyIGNvdW50ID0gaWRDb3VudE1hcFtpZF0gfHwgMDtcbiAgICB2YXIgaWRlbnRpZmllciA9IFwiXCIuY29uY2F0KGlkLCBcIiBcIikuY29uY2F0KGNvdW50KTtcbiAgICBpZENvdW50TWFwW2lkXSA9IGNvdW50ICsgMTtcbiAgICB2YXIgaW5kZXhCeUlkZW50aWZpZXIgPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgY3NzOiBpdGVtWzFdLFxuICAgICAgbWVkaWE6IGl0ZW1bMl0sXG4gICAgICBzb3VyY2VNYXA6IGl0ZW1bM10sXG4gICAgICBzdXBwb3J0czogaXRlbVs0XSxcbiAgICAgIGxheWVyOiBpdGVtWzVdXG4gICAgfTtcblxuICAgIGlmIChpbmRleEJ5SWRlbnRpZmllciAhPT0gLTEpIHtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS5yZWZlcmVuY2VzKys7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0udXBkYXRlcihvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdXBkYXRlciA9IGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpO1xuICAgICAgb3B0aW9ucy5ieUluZGV4ID0gaTtcbiAgICAgIHN0eWxlc0luRE9NLnNwbGljZShpLCAwLCB7XG4gICAgICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIsXG4gICAgICAgIHVwZGF0ZXI6IHVwZGF0ZXIsXG4gICAgICAgIHJlZmVyZW5jZXM6IDFcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlkZW50aWZpZXJzLnB1c2goaWRlbnRpZmllcik7XG4gIH1cblxuICByZXR1cm4gaWRlbnRpZmllcnM7XG59XG5cbmZ1bmN0aW9uIGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpIHtcbiAgdmFyIGFwaSA9IG9wdGlvbnMuZG9tQVBJKG9wdGlvbnMpO1xuICBhcGkudXBkYXRlKG9iaik7XG5cbiAgdmFyIHVwZGF0ZXIgPSBmdW5jdGlvbiB1cGRhdGVyKG5ld09iaikge1xuICAgIGlmIChuZXdPYmopIHtcbiAgICAgIGlmIChuZXdPYmouY3NzID09PSBvYmouY3NzICYmIG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmIG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXAgJiYgbmV3T2JqLnN1cHBvcnRzID09PSBvYmouc3VwcG9ydHMgJiYgbmV3T2JqLmxheWVyID09PSBvYmoubGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBhcGkudXBkYXRlKG9iaiA9IG5ld09iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFwaS5yZW1vdmUoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHVwZGF0ZXI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpc3QsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGxpc3QgPSBsaXN0IHx8IFtdO1xuICB2YXIgbGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpO1xuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlKG5ld0xpc3QpIHtcbiAgICBuZXdMaXN0ID0gbmV3TGlzdCB8fCBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tpXTtcbiAgICAgIHZhciBpbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhdLnJlZmVyZW5jZXMtLTtcbiAgICB9XG5cbiAgICB2YXIgbmV3TGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKG5ld0xpc3QsIG9wdGlvbnMpO1xuXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBfaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tfaV07XG5cbiAgICAgIHZhciBfaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihfaWRlbnRpZmllcik7XG5cbiAgICAgIGlmIChzdHlsZXNJbkRPTVtfaW5kZXhdLnJlZmVyZW5jZXMgPT09IDApIHtcbiAgICAgICAgc3R5bGVzSW5ET01bX2luZGV4XS51cGRhdGVyKCk7XG5cbiAgICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKF9pbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGFzdElkZW50aWZpZXJzID0gbmV3TGFzdElkZW50aWZpZXJzO1xuICB9O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIG1lbW8gPSB7fTtcbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuXG5mdW5jdGlvbiBnZXRUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICh0eXBlb2YgbWVtb1t0YXJnZXRdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgdmFyIHN0eWxlVGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpOyAvLyBTcGVjaWFsIGNhc2UgdG8gcmV0dXJuIGhlYWQgb2YgaWZyYW1lIGluc3RlYWQgb2YgaWZyYW1lIGl0c2VsZlxuXG4gICAgaWYgKHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCAmJiBzdHlsZVRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gVGhpcyB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhY2Nlc3MgdG8gaWZyYW1lIGlzIGJsb2NrZWRcbiAgICAgICAgLy8gZHVlIHRvIGNyb3NzLW9yaWdpbiByZXN0cmljdGlvbnNcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBzdHlsZVRhcmdldC5jb250ZW50RG9jdW1lbnQuaGVhZDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIG1lbW9bdGFyZ2V0XSA9IHN0eWxlVGFyZ2V0O1xuICB9XG5cbiAgcmV0dXJuIG1lbW9bdGFyZ2V0XTtcbn1cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuXG5cbmZ1bmN0aW9uIGluc2VydEJ5U2VsZWN0b3IoaW5zZXJ0LCBzdHlsZSkge1xuICB2YXIgdGFyZ2V0ID0gZ2V0VGFyZ2V0KGluc2VydCk7XG5cbiAgaWYgKCF0YXJnZXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgc3R5bGUgdGFyZ2V0LiBUaGlzIHByb2JhYmx5IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGZvciB0aGUgJ2luc2VydCcgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuICB9XG5cbiAgdGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRCeVNlbGVjdG9yOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICBvcHRpb25zLnNldEF0dHJpYnV0ZXMoZWxlbWVudCwgb3B0aW9ucy5hdHRyaWJ1dGVzKTtcbiAgb3B0aW9ucy5pbnNlcnQoZWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0U3R5bGVFbGVtZW50OyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcyhzdHlsZUVsZW1lbnQpIHtcbiAgdmFyIG5vbmNlID0gdHlwZW9mIF9fd2VicGFja19ub25jZV9fICE9PSBcInVuZGVmaW5lZFwiID8gX193ZWJwYWNrX25vbmNlX18gOiBudWxsO1xuXG4gIGlmIChub25jZSkge1xuICAgIHN0eWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJub25jZVwiLCBub25jZSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXM7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopIHtcbiAgdmFyIGNzcyA9IFwiXCI7XG5cbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KG9iai5zdXBwb3J0cywgXCIpIHtcIik7XG4gIH1cblxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwiQG1lZGlhIFwiLmNvbmNhdChvYmoubWVkaWEsIFwiIHtcIik7XG4gIH1cblxuICB2YXIgbmVlZExheWVyID0gdHlwZW9mIG9iai5sYXllciAhPT0gXCJ1bmRlZmluZWRcIjtcblxuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwiQGxheWVyXCIuY29uY2F0KG9iai5sYXllci5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KG9iai5sYXllcikgOiBcIlwiLCBcIiB7XCIpO1xuICB9XG5cbiAgY3NzICs9IG9iai5jc3M7XG5cbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuXG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cblxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG5cbiAgdmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG5cbiAgaWYgKHNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIuY29uY2F0KGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSksIFwiICovXCIpO1xuICB9IC8vIEZvciBvbGQgSUVcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgICovXG5cblxuICBvcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xufVxuXG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KSB7XG4gIC8vIGlzdGFuYnVsIGlnbm9yZSBpZlxuICBpZiAoc3R5bGVFbGVtZW50LnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzdHlsZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQpO1xufVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cblxuZnVuY3Rpb24gZG9tQVBJKG9wdGlvbnMpIHtcbiAgdmFyIHN0eWxlRWxlbWVudCA9IG9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuICByZXR1cm4ge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKG9iaikge1xuICAgICAgYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KTtcbiAgICB9XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZG9tQVBJOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50KSB7XG4gIGlmIChzdHlsZUVsZW1lbnQuc3R5bGVTaGVldCkge1xuICAgIHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKSB7XG4gICAgICBzdHlsZUVsZW1lbnQucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgIH1cblxuICAgIHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0eWxlVGFnVHJhbnNmb3JtOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0aWQ6IG1vZHVsZUlkLFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm5jID0gdW5kZWZpbmVkOyIsImltcG9ydCAnLi9zdHlsZS5jc3MnXG5pbXBvcnQgQTExeURpYWxvZyBmcm9tICdhMTF5LWRpYWxvZyc7XG5cblwidXNlIHN0cmljdFwiXG5jbGFzcyBQaWVjZU9mV29ya3tcblxuICAgIGNvbnN0cnVjdG9yICh0aXRsZSxjcmVhdG9yLGlzQ29tcGxldGVkKXtcbiAgICAgICAgdGhpcy50aXRsZSA9IHRpdGxlO1xuICAgICAgICB0aGlzLmNyZWF0b3IgPSBjcmVhdG9yO1xuICAgICAgICB0aGlzLmlzQ29tcGxldGVkID0gaXNDb21wbGV0ZWQ7XG4gICAgfVxuXG4gICAgc3RhdGljIGRlbGV0ZVdvcmtGcm9tTGlzdChpbmRleCl7XG4gICAgICAgIHRoaXMubGlzdC5zcGxpY2UoaW5kZXgsMSk7XG4gICAgfVxuICAgIFxuICAgIHN0YXRpYyBjaGFuZ2VXb3JrU3RhdGUoaW5kZXgpe1xuICAgICAgICByZXR1cm4gdGhpcy5saXN0W2luZGV4XS50b2dnbGVDb21wbGV0ZWRTdGF0ZSgpO1xuICAgIH1cbiAgICBcbiAgICB0b2dnbGVDb21wbGV0ZWRTdGF0ZSgpe1xuICAgICAgICB0aGlzLmlzQ29tcGxldGVkID0gIXRoaXMuaXNDb21wbGV0ZWQ7XG4gICAgICAgIHJldHVybiB0aGlzLmlzQ29tcGxldGVkO1xuICAgIH1cbn1cblxuY2xhc3MgQm9vayBleHRlbmRzIFBpZWNlT2ZXb3Jre1xuICAgIHN0YXRpYyBsaXN0ICA9IFtdO1xuXG4gICAgY29uc3RydWN0b3IgKHRpdGxlLGNyZWF0b3IsaXNDb21wbGV0ZWQsbnVtYmVyT2ZQYWdlcyl7XG4gICAgICAgIHN1cGVyKHRpdGxlLGNyZWF0b3IsaXNDb21wbGV0ZWQpO1xuXG4gICAgICAgIHRoaXMubnVtYmVyT2ZQYWdlcyA9IG51bWJlck9mUGFnZXM7XG4gICAgfVxufVxuXG5jbGFzcyBNb3ZpZSBleHRlbmRzIFBpZWNlT2ZXb3Jre1xuICAgIHN0YXRpYyBsaXN0ICA9IFtdO1xuXG4gICAgY29uc3RydWN0b3IgKHRpdGxlLGNyZWF0b3IsaXNDb21wbGV0ZWQsbnVtYmVyT2ZWaWV3aW5ncyxzZWVuSW5DaW5lbWEpe1xuICAgICAgICBzdXBlcih0aXRsZSxjcmVhdG9yLGlzQ29tcGxldGVkKTtcblxuICAgICAgICB0aGlzLm51bWJlck9mVmlld2luZ3MgPSBudW1iZXJPZlZpZXdpbmdzO1xuICAgICAgICB0aGlzLnNlZW5JbkNpbmVtYSA9IHNlZW5JbkNpbmVtYTtcbiAgICB9XG59XG5cbmNsYXNzIENvbXB1dGVyR2FtZSBleHRlbmRzIFBpZWNlT2ZXb3JrIHtcbiAgICBzdGF0aWMgbGlzdCA9IFtdO1xuXG4gICAgY29uc3RydWN0b3IgKHRpdGxlLGNyZWF0b3IsaXNDb21wbGV0ZWQsaG91cnNQbGF5ZWQpe1xuICAgICAgICBzdXBlcih0aXRsZSxjcmVhdG9yLGlzQ29tcGxldGVkKTtcblxuICAgICAgICB0aGlzLmhvdXJzUGxheWVkID0gaG91cnNQbGF5ZWQ7XG4gICAgfVxufVxuXG5jb25zdCBtYWluQ29udHJvbGxlciA9IChmdW5jdGlvbigpe1xuICAgIGZ1bmN0aW9uIGluaXQoKXtcbiAgICAgICAgc3RvcmFnZUNvbnRyb2xsZXIuaW1wb3J0RnJvbVN0b3JhZ2UoKTtcbiAgICAgICAgZGlzcGxheUNvbnRyb2xsZXIuZ2VuZXJhdGVXb3JrVHlwZUZvcm0oe3RhcmdldDoge3ZhbHVlOiBcImJvb2tcIn19KTtcbiAgICAgICAgZGlzcGxheUNvbnRyb2xsZXIucmVmcmVzaENvbGxlY3Rpb24oKTtcbiAgICAgICAgZGlzcGxheUNvbnRyb2xsZXIuaW5pdFdvcmtQaWNrRGlhbG9nKCk7XG5cbiAgICAgICAgYXNzaWduTGlzdGVuZXJzKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXNzaWduTGlzdGVuZXJzKCl7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5waWNrLXR5cGUnKS5mb3JFYWNoKGJ1dHRvbiA9PiBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLGRpc3BsYXlDb250cm9sbGVyLmdlbmVyYXRlV29ya1R5cGVGb3JtKSk7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5zdGFyJykuZm9yRWFjaChzdGFyID0+IHN0YXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLGRpc3BsYXlDb250cm9sbGVyLnNlbGVjdFJhdGluZykpO1xuICAgIH1cblxuICAgIHJldHVybiB7aW5pdH07XG59KSgpO1xuXG5jb25zdCBzdG9yYWdlQ29udHJvbGxlciA9IChmdW5jdGlvbigpe1xuICAgIGNvbnN0IFNUT1JBR0VfS0VZID0gXCJwaWVjZXNPZldvcmtcIjtcblxuICAgIGZ1bmN0aW9uIGltcG9ydEZyb21TdG9yYWdlKCl7XG4gICAgICAgIGxldCBpbXBvcnRlZExpc3RzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShTVE9SQUdFX0tFWSkpO1xuXG4gICAgICAgIGlmKGltcG9ydGVkTGlzdHMgPT09IG51bGwgfHwgaW1wb3J0ZWRMaXN0cyA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIC8vTk9USElORz9cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIEJvb2subGlzdCA9IGltcG9ydGVkTGlzdHMuYm9va3MubWFwKG9iamVjdCA9PiBPYmplY3QuYXNzaWduKG5ldyBCb29rKCksb2JqZWN0KSk7XG4gICAgICAgICAgICBNb3ZpZS5saXN0ID0gaW1wb3J0ZWRMaXN0cy5tb3ZpZXMubWFwKG9iamVjdCA9PiBPYmplY3QuYXNzaWduKG5ldyBNb3ZpZSgpLG9iamVjdCkpO1xuICAgICAgICAgICAgQ29tcHV0ZXJHYW1lLmxpc3QgPSBpbXBvcnRlZExpc3RzLmNvbXB1dGVyR2FtZXMubWFwKG9iamVjdCA9PiBPYmplY3QuYXNzaWduKG5ldyBDb21wdXRlckdhbWUoKSxvYmplY3QpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNhdmVUb1N0b3JhZ2UoKXtcbiAgICAgICAgY29uc3QgcGllY2VzT2ZXb3JrID0ge2Jvb2tzOiBCb29rLmxpc3QsbW92aWVzOiBNb3ZpZS5saXN0LGNvbXB1dGVyR2FtZXM6IENvbXB1dGVyR2FtZS5saXN0fVxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShTVE9SQUdFX0tFWSxKU09OLnN0cmluZ2lmeShwaWVjZXNPZldvcmspKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge2ltcG9ydEZyb21TdG9yYWdlLHNhdmVUb1N0b3JhZ2V9O1xufSkoKTtcblxuY29uc3QgcGllY2VzT2ZXb3JrQ29udHJvbGxlciA9IChmdW5jdGlvbigpe1xuXG4gICAgZnVuY3Rpb24gYWRkUGllY2VPZldvcmtUb0xpYnJhcnkoZXZlbnQpe1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyAvL1RvIGNhbmNlbCBmb3JtIHN1Ym1pdGlvbiByZWZyZXNoaW5nIHBhZ2VcbiAgICAgICAgY29uc3Qgd29ya1R5cGUgPSBldmVudC50YXJnZXQuZGF0YXNldC50eXBlO1xuICAgIFxuICAgICAgICBjb25zdCB7dGl0bGUsY3JlYXRvcixpc0NvbXBsZXRlZH0gPSBkaXNwbGF5Q29udHJvbGxlci5nZXRQaWVjZU9mV29ya0Zvcm1EYXRhKCk7XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2god29ya1R5cGUpe1xuICAgICAgICAgICAgY2FzZSBcImJvb2tcIjpcbiAgICAgICAgICAgICAgICBjb25zdCB7bnVtYmVyT2ZQYWdlc30gPSBkaXNwbGF5Q29udHJvbGxlci5nZXRCb29rRm9ybURhdGEoKTtcblxuICAgICAgICAgICAgICAgIEJvb2subGlzdC5wdXNoKG5ldyBCb29rKHRpdGxlLGNyZWF0b3IsaXNDb21wbGV0ZWQsbnVtYmVyT2ZQYWdlcykpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbW92aWUnOlxuICAgICAgICAgICAgICAgIGNvbnN0IHtudW1iZXJPZlZpZXdpbmdzLHNlZW5JbkNpbmVtYX0gPSBkaXNwbGF5Q29udHJvbGxlci5nZXRNb3ZpZUZvcm1EYXRhKCk7XG5cbiAgICAgICAgICAgICAgICBNb3ZpZS5saXN0LnB1c2gobmV3IE1vdmllKHRpdGxlLGNyZWF0b3IsaXNDb21wbGV0ZWQsbnVtYmVyT2ZWaWV3aW5ncyxzZWVuSW5DaW5lbWEpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NvbXB1dGVyLWdhbWUnOlxuICAgICAgICAgICAgICAgIGNvbnN0IHtob3Vyc1BsYXllZH0gPSBkaXNwbGF5Q29udHJvbGxlci5nZXRDb21wdXRlckdhbWVGb3JtRGF0YSgpO1xuXG4gICAgICAgICAgICAgICAgQ29tcHV0ZXJHYW1lLmxpc3QucHVzaChuZXcgQ29tcHV0ZXJHYW1lKHRpdGxlLGNyZWF0b3IsaXNDb21wbGV0ZWQsaG91cnNQbGF5ZWQpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgc3RvcmFnZUNvbnRyb2xsZXIuc2F2ZVRvU3RvcmFnZSgpO1xuICAgICAgICBkaXNwbGF5Q29udHJvbGxlci5yZWZyZXNoQ29sbGVjdGlvbigpO1xuICAgIH1cbiAgICBcbiAgICBmdW5jdGlvbiBkZWxldGVQaWVjZU9mV29yayhwaWVjZU9mV29ya0NsYXNzLGluZGV4KXsgIC8vVE9ETywgcHJvYmFibHkgc2hvdWxkIGJlIGluIGNsYXNzP1xuXG4gICAgICAgIHBpZWNlT2ZXb3JrQ2xhc3MuZGVsZXRlV29ya0Zyb21MaXN0KGluZGV4KTtcbiAgICBcbiAgICAgICAgc3RvcmFnZUNvbnRyb2xsZXIuc2F2ZVRvU3RvcmFnZSgpO1xuICAgIFxuICAgICAgICBkaXNwbGF5Q29udHJvbGxlci5yZWZyZXNoQ29sbGVjdGlvbigpO1xuICAgIH1cblxuICAgIHJldHVybiB7YWRkUGllY2VPZldvcmtUb0xpYnJhcnksZGVsZXRlUGllY2VPZldvcmt9O1xufSkoKTtcblxuY29uc3QgZGlzcGxheUNvbnRyb2xsZXIgPSAoZnVuY3Rpb24oKXtcblxuICAgIGNvbnN0IERPTV9DTEFTU19JTkRFWF9JTl9DTEFTU0xJU1QgPSAxO1xuXG4gICAgY29uc3QgV09SS19GT1JNX0ZSQU1FV09SSyA9IGBcbiAgICA8Zm9ybSBjbGFzcz1cImFkZC1uZXctcGllY2Utb2Ytd29ya1wiIGFjdGlvbj1cIiNcIj5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJ0aXRsZVwiPlRpdGxlPC9sYWJlbD5cbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGlkPVwidGl0bGVcIiBuYW1lPVwidGl0bGVcIj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPVwiY3JlYXRvclwiPkNyZWF0b3I8L2xhYmVsPlxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgaWQ9XCJjcmVhdG9yXCIgbmFtZT1cImNyZWF0b3JcIiBwbGFjZWhvbGRlcj1cIkF1dGhvciwgZGlyZWN0b3Igb3IgZGV2ZWxvcGVyXCI+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGxhYmVsIGZvcj1cImlzLWNvbXBsZXRlZFwiPkNvbXBsZXRlZDwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgbmFtZT1cImlzLWNvbXBsZXRlZFwiIGlkPVwiaXMtY29tcGxldGVkXCI+XG4gICAgICAgIDwvZGl2PlxuICAgIDwvZm9ybT5gO1xuXG4gICAgY29uc3QgQk9PS19GT1JNX0VYVFJBID0gYFxuICAgIDxkaXY+XG4gICAgICAgIDxsYWJlbCBmb3I9XCJudW1iZXItb2YtcGFnZXNcIj5OdW1iZXIgb2YgcGFnZXM8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgdHlwZT1cIm51bWJlclwiIG1pbj1cIjBcIiBuYW1lPVwibnVtYmVyLW9mLXBhZ2VzXCIgaWQ9XCJudW1iZXItb2YtcGFnZXNcIj5cbiAgICA8L2Rpdj5gXG5cbiAgICBjb25zdCBNT1ZJRV9GT1JNX0VYVFJBID0gYFxuICAgIDxkaXY+XG4gICAgICAgIDxsYWJlbCBmb3I9XCJudW1iZXItb2Ytdmlld2luZ3NcIj5OdW1iZXIgb2Ygdmlld2luZ3M8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgdHlwZT1cIm51bWJlclwiIG1pbj1cIjBcIiBuYW1lPVwibnVtYmVyLW9mLXZpZXdpbmdzXCIgaWQ9XCJudW1iZXItb2Ytdmlld2luZ3NcIj5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2PlxuICAgICAgICA8bGFiZWwgZm9yPVwic2Vlbi1pbi1jaW5lbWFcIj5TZWVuIGluIGNpbmVtYTwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBuYW1lPVwic2Vlbi1pbi1jaW5lbWFcIiBpZD1cInNlZW4taW4tY2luZW1hXCI+XG4gICAgPC9kaXY+XG4gICAgYFxuXG4gICAgY29uc3QgQ09NUFVURVJfR0FNRV9GT1JNX0VYVFJBID0gYFxuICAgIDxkaXY+XG4gICAgICAgIDxsYWJlbCBmb3I9XCJob3Vycy1wbGF5ZWRcIj5Ib3VycyBwbGF5ZWQ8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgdHlwZT1cIm51bWJlclwiIG1pbj1cIjBcIiBuYW1lPVwiaG91cnMtcGxheWVkXCIgaWQ9XCJob3Vycy1wbGF5ZWRcIj5cbiAgICA8L2Rpdj5gXG5cbiAgICBmdW5jdGlvbiBpbml0V29ya1BpY2tEaWFsb2coKXtcbiAgICAgICAgY29uc3QgZGlhbG9nQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NyZWF0ZS13b3JrLWRpYWxvZycpO1xuICAgICAgICBjb25zb2xlLmxvZyhkaWFsb2dDb250YWluZXIpO1xuICAgICAgICBjb25zdCBkaWFsb2cgPSBuZXcgQTExeURpYWxvZyhkaWFsb2dDb250YWluZXIpO1xuXG4gICAgICAgIGRpYWxvZy5zaG93KCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVXb3JrVHlwZUZvcm0oZXZlbnQpe1xuICAgICAgICBjb25zdCB3b3JrVHlwZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcblxuICAgICAgICBjb25zdCBmb3JtQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmZvcm0tY29udGFpbmVyJyk7XG4gICAgICAgIGZvcm1Db250YWluZXIuaW5uZXJIVE1MID0gXCJcIjtcblxuICAgICAgICBjb25zdCBmb3JtID0gc3RyaW5nVG9Ob2RlKFdPUktfRk9STV9GUkFNRVdPUkspWzBdO1xuICAgICAgICBmb3JtLmRhdGFzZXQudHlwZSA9IHdvcmtUeXBlO1xuICAgICAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcscGllY2VzT2ZXb3JrQ29udHJvbGxlci5hZGRQaWVjZU9mV29ya1RvTGlicmFyeSk7XG5cbiAgICAgICAgc3dpdGNoKHdvcmtUeXBlKXtcbiAgICAgICAgICAgIGNhc2UgJ2Jvb2snOlxuICAgICAgICAgICAgICAgIGZvcm0uYXBwZW5kKC4uLnN0cmluZ1RvTm9kZShCT09LX0ZPUk1fRVhUUkEpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ21vdmllJzpcbiAgICAgICAgICAgICAgICBmb3JtLmFwcGVuZCguLi5zdHJpbmdUb05vZGUoTU9WSUVfRk9STV9FWFRSQSkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY29tcHV0ZXItZ2FtZSc6XG4gICAgICAgICAgICAgICAgZm9ybS5hcHBlbmQoLi4uc3RyaW5nVG9Ob2RlKENPTVBVVEVSX0dBTUVfRk9STV9FWFRSQSkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc3VibWl0QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIHN1Ym1pdEJ1dHRvbi50eXBlID0gJ3N1Ym1pdCc7XG4gICAgICAgIHN1Ym1pdEJ1dHRvbi50ZXh0Q29udGVudCA9IFwiQWRkIHRvIGNvbGxlY3Rpb25cIjtcblxuICAgICAgICBmb3JtLmFwcGVuZChzdWJtaXRCdXR0b24pO1xuXG4gICAgICAgIGZvcm1Db250YWluZXIuYXBwZW5kKGZvcm0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNoYW5nZVdvcmtTdGF0ZShldmVudCl7XG4gICAgICAgIGNvbnN0IHBpZWNlT2ZXb3JrRWxlbWVudCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCcuY2FyZCcpO1xuXG4gICAgICAgIGNvbnN0IGluZGV4ID0gcGllY2VPZldvcmtFbGVtZW50LmRhdGFzZXQuaW5kZXg7XG4gICAgICAgIGNvbnN0IHBpZWNlT2ZXb3JrQ2xhc3MgPSBwYXJzZU5vZGVDbGFzcyhwaWVjZU9mV29ya0VsZW1lbnQuY2xhc3NMaXN0W0RPTV9DTEFTU19JTkRFWF9JTl9DTEFTU0xJU1RdKSA7XG5cbiAgICAgICAgY29uc3QgbmV3U3RhdGUgPSBwaWVjZU9mV29ya0NsYXNzLmNoYW5nZVdvcmtTdGF0ZShpbmRleCk7XG4gICAgXG4gICAgICAgIGV2ZW50LnRhcmdldC50ZXh0Q29udGVudCA9IG5ld1N0YXRlID8gJ1YnIDogJ1gnOyAvL1RPRE9cbiAgICBcbiAgICAgICAgc3RvcmFnZUNvbnRyb2xsZXIuc2F2ZVRvU3RvcmFnZSgpO1xuICAgIH1cbiAgICBcblxuICAgIGZ1bmN0aW9uIGdlbmVyYXRlTGlicmFyeUNvbGxlY3Rpb24oKXtcbiAgICAgICAgY29uc3QgYm9va3NDb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnRhaW5lci5ib29rc1wiKTtcbiAgICBcbiAgICAgICAgQm9vay5saXN0LmZvckVhY2goKHdvcmssaW5kZXgpID0+IHsgLy9UT0RPIHRlbXBcbiAgICAgICAgICAgIGNvbnN0IGJvb2sgPSBjcmVhdGVQaWVjZU9mV29ya0ZyYW1ld29ya0VsZW1lbnQod29yayxpbmRleCwnYm9vaycpO1xuXG4gICAgICAgICAgICBjb25zdCBudW1iZXJPZlBhZ2VzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBudW1iZXJPZlBhZ2VzLmNsYXNzTGlzdC5hZGQoJ251bWJlci1vZi1wYWdlcycpO1xuICAgICAgICAgICAgbnVtYmVyT2ZQYWdlcy50ZXh0Q29udGVudCA9IHdvcmsubnVtYmVyT2ZQYWdlcztcblxuICAgICAgICAgICAgYm9vay5hcHBlbmQobnVtYmVyT2ZQYWdlcyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGFkZEJ1dHRvbnNUb1BpZWNlT2ZXb3JrKHdvcmssYm9vayk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGJvb2tzQ29udGFpbmVyLmFwcGVuZChib29rKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgbW92aWVzQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRhaW5lci5tb3ZpZXMnKTtcblxuICAgICAgICBNb3ZpZS5saXN0LmZvckVhY2goKHdvcmssaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1vdmllID0gY3JlYXRlUGllY2VPZldvcmtGcmFtZXdvcmtFbGVtZW50KHdvcmssaW5kZXgsJ21vdmllJyk7XG5cbiAgICAgICAgICAgIGNvbnN0IG51bWJlck9mVmlld2luZ3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIG51bWJlck9mVmlld2luZ3MuY2xhc3NMaXN0LmFkZCgnbnVtYmVyLW9mLXZpZXdpbmdzJyk7XG4gICAgICAgICAgICBudW1iZXJPZlZpZXdpbmdzLnRleHRDb250ZW50ID0gd29yay5udW1iZXJPZlZpZXdpbmdzO1xuXG4gICAgICAgICAgICBjb25zdCBzZWVuSW5DaW5lbWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIHNlZW5JbkNpbmVtYS5jbGFzc0xpc3QuYWRkKCdzZWVuLWluLWNpbmVtYScpO1xuICAgICAgICAgICAgc2VlbkluQ2luZW1hLnRleHRDb250ZW50ID0gYFNlZW4gaW4gY2luZW1hOiAke3dvcmsuc2VlbkluQ2luZW1hID8gJ1YnIDogJ1gnfWA7XG5cbiAgICAgICAgICAgIG1vdmllLmFwcGVuZChudW1iZXJPZlZpZXdpbmdzLHNlZW5JbkNpbmVtYSk7XG5cbiAgICAgICAgICAgIGFkZEJ1dHRvbnNUb1BpZWNlT2ZXb3JrKHdvcmssbW92aWUpO1xuXG4gICAgICAgICAgICBtb3ZpZXNDb250YWluZXIuYXBwZW5kKG1vdmllKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgY29tcHV0ZXJHYW1lc0NvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb250YWluZXIuY29tcHV0ZXItZ2FtZXMnKTtcblxuICAgICAgICBDb21wdXRlckdhbWUubGlzdC5mb3JFYWNoKCh3b3JrLGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjb21wdXRlckdhbWUgPSBjcmVhdGVQaWVjZU9mV29ya0ZyYW1ld29ya0VsZW1lbnQod29yayxpbmRleCwnY29tcHV0ZXItZ2FtZScpO1xuXG4gICAgICAgICAgICBjb25zdCBob3Vyc1BsYXllZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgaG91cnNQbGF5ZWQuY2xhc3NMaXN0LmFkZCgnaG91cnMtcGxheWVkJyk7XG4gICAgICAgICAgICBob3Vyc1BsYXllZC50ZXh0Q29udGVudCA9IHdvcmsuaG91cnNQbGF5ZWQ7XG5cbiAgICAgICAgICAgIGNvbXB1dGVyR2FtZS5hcHBlbmQoaG91cnNQbGF5ZWQpO1xuXG4gICAgICAgICAgICBhZGRCdXR0b25zVG9QaWVjZU9mV29yayh3b3JrLGNvbXB1dGVyR2FtZSk7XG5cbiAgICAgICAgICAgIGNvbXB1dGVyR2FtZXNDb250YWluZXIuYXBwZW5kKGNvbXB1dGVyR2FtZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICB9IFxuXG4gICAgZnVuY3Rpb24gY3JlYXRlUGllY2VPZldvcmtGcmFtZXdvcmtFbGVtZW50KHdvcmssaW5kZXgsd29ya1N0cmluZ0NsYXNzKXtcbiAgICAgICAgY29uc3Qgd29ya0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB3b3JrRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjYXJkJyx3b3JrU3RyaW5nQ2xhc3MpO1xuICAgICAgICB3b3JrRWxlbWVudC5kYXRhc2V0LmluZGV4ID0gaW5kZXg7XG5cbiAgICAgICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdGl0bGUuY2xhc3NMaXN0LmFkZCgndGl0bGUnKTtcbiAgICAgICAgdGl0bGUudGV4dENvbnRlbnQgPSB3b3JrLnRpdGxlO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgY3JlYXRvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBjcmVhdG9yLmNsYXNzTGlzdC5hZGQoJ2NyZWF0b3InKTtcbiAgICAgICAgY3JlYXRvci50ZXh0Q29udGVudCA9IHdvcmsuY3JlYXRvcjtcblxuICAgICAgICB3b3JrRWxlbWVudC5hcHBlbmQodGl0bGUsY3JlYXRvcik7XG5cbiAgICAgICAgcmV0dXJuIHdvcmtFbGVtZW50O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZEJ1dHRvbnNUb1BpZWNlT2ZXb3JrKHdvcmssd29ya0VsZW1lbnQpe1xuXG4gICAgICAgIGNvbnN0IGNvbXBsZXRlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGNvbXBsZXRlQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ21hcmstY29tcGxldGVkJyk7XG4gICAgICAgIGNvbXBsZXRlQnV0dG9uLnRleHRDb250ZW50ID0gd29yay5pc0NvbXBsZXRlZCA/ICdWJyA6ICdYJztcbiAgICAgICAgY29tcGxldGVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLGNoYW5nZVdvcmtTdGF0ZSk7XG5cbiAgICAgICAgY29uc3QgZGVsZXRlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGRlbGV0ZUJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdkZWxldGUnKTtcbiAgICAgICAgZGVsZXRlQnV0dG9uLnRleHRDb250ZW50ID0gXCJEZWxldGVcIjtcbiAgICAgICAgZGVsZXRlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyx3YXJuQWJvdXREZWxldGlvbiwge2NhcHR1cmU6IHRydWV9KTtcblxuICAgICAgICB3b3JrRWxlbWVudC5hcHBlbmQoY29tcGxldGVCdXR0b24sZGVsZXRlQnV0dG9uKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB3YXJuQWJvdXREZWxldGlvbihldmVudCl7XG5cbiAgICAgICAgY29uc3QgZGVsZXRlQnV0dG9uID0gZXZlbnQudGFyZ2V0O1xuICAgIFxuICAgICAgICBkZWxldGVCdXR0b24udGV4dENvbnRlbnQgPSBcIkFyZSB5b3Ugc3VyZT9cIlxuICAgICAgICBcbiAgICAgICAgY29uc3QgZnVuYyA9IHRyeVRvRGVsZXRlLmJpbmQoZGVsZXRlQnV0dG9uKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxmdW5jLHtvbmNlOiB0cnVlLCBjYXB0dXJlOnRydWV9KTtcbiAgICBcbiAgICAgICAgZGVsZXRlQnV0dG9uLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJyx3YXJuQWJvdXREZWxldGlvbiwge2NhcHR1cmU6IHRydWV9KTtcbiAgICB9XG4gICAgXG4gICAgZnVuY3Rpb24gdHJ5VG9EZWxldGUoZXZlbnQpe1xuICAgICAgICBjb25zdCBsYXN0Q2xpY2tlZERlbGV0ZUJ1dHRvbiA9IHRoaXM7XG4gICAgICAgIGNvbnN0IGNsaWNrZWRFbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICBcbiAgICAgICAgaWYobGFzdENsaWNrZWREZWxldGVCdXR0b24uaXNFcXVhbE5vZGUoY2xpY2tlZEVsZW1lbnQpKXtcbiAgICAgICAgICAgIGNvbnN0IHBpZWNlT2ZXb3JrQ2xhc3MgPSBwYXJzZU5vZGVDbGFzcyhsYXN0Q2xpY2tlZERlbGV0ZUJ1dHRvbi5jbG9zZXN0KCcuY2FyZCcpLmNsYXNzTGlzdFtET01fQ0xBU1NfSU5ERVhfSU5fQ0xBU1NMSVNUXSk7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IGxhc3RDbGlja2VkRGVsZXRlQnV0dG9uLmNsb3Nlc3QoJy5jYXJkJykuZGF0YXNldC5pbmRleDtcblxuICAgICAgICAgICAgcGllY2VzT2ZXb3JrQ29udHJvbGxlci5kZWxldGVQaWVjZU9mV29yayhwaWVjZU9mV29ya0NsYXNzLGluZGV4KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxhc3RDbGlja2VkRGVsZXRlQnV0dG9uLnRleHRDb250ZW50ID0gXCJEZWxldGVcIjtcbiAgICAgICAgICAgIGxhc3RDbGlja2VkRGVsZXRlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyx3YXJuQWJvdXREZWxldGlvbiwge2NhcHR1cmU6IHRydWV9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBmdW5jdGlvbiByZWZyZXNoQ29sbGVjdGlvbigpe1xuICAgICAgICBjb25zdCBjb250YWluZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNvbnRhaW5lcicpO1xuICAgICAgICBjb250YWluZXJzLmZvckVhY2goY29udGFpbmVyID0+IGNvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiKTtcbiAgICBcbiAgICAgICAgZ2VuZXJhdGVMaWJyYXJ5Q29sbGVjdGlvbigpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFBpZWNlT2ZXb3JrRm9ybURhdGEoKXtcblxuICAgICAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGl0bGVcIikudmFsdWU7XG4gICAgICAgIGNvbnN0IGNyZWF0b3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3JlYXRvcicpLnZhbHVlO1xuICAgICAgICBjb25zdCBpc0NvbXBsZXRlZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpcy1jb21wbGV0ZWQnKS5jaGVja2VkO1xuXG4gICAgICAgIHJldHVybiB7dGl0bGUsY3JlYXRvcixpc0NvbXBsZXRlZH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0Qm9va0Zvcm1EYXRhKCl7XG4gICAgICAgIGNvbnN0IG51bWJlck9mUGFnZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbnVtYmVyLW9mLXBhZ2VzJykudmFsdWU7XG5cbiAgICAgICAgcmV0dXJuIHtudW1iZXJPZlBhZ2VzfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRNb3ZpZUZvcm1EYXRhKCl7XG4gICAgICAgIGNvbnN0IG51bWJlck9mVmlld2luZ3MgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbnVtYmVyLW9mLXZpZXdpbmdzJykudmFsdWU7XG4gICAgICAgIGNvbnN0IHNlZW5JbkNpbmVtYSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWVuLWluLWNpbmVtYScpLmNoZWNrZWQ7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge251bWJlck9mVmlld2luZ3Msc2VlbkluQ2luZW1hfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRDb21wdXRlckdhbWVGb3JtRGF0YSgpe1xuICAgICAgICBjb25zdCBob3Vyc1BsYXllZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdob3Vycy1wbGF5ZWQnKS52YWx1ZTtcblxuICAgICAgICByZXR1cm4ge2hvdXJzUGxheWVkfTtcbiAgICB9XG5cbiAgICBjb25zdCBzdHJpbmdUb05vZGUgPSBmdW5jdGlvbihzdHJpbmcpe1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJyk7XG4gICAgICAgIHN0cmluZyA9IHN0cmluZy50cmltKCk7XG4gICAgICAgIHRlbXBsYXRlLmlubmVySFRNTCA9IHN0cmluZztcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlLmNvbnRlbnQuY2hpbGROb2RlcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXJzZU5vZGVDbGFzcyhzdHJpbmdDbGFzcyl7XG4gICAgICAgIHN3aXRjaChzdHJpbmdDbGFzcyl7XG4gICAgICAgICAgICBjYXNlICdib29rJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gQm9vaztcbiAgICAgICAgICAgIGNhc2UgJ21vdmllJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gTW92aWU7XG4gICAgICAgICAgICBjYXNlICdjb21wdXRlci1nYW1lJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gQ29tcHV0ZXJHYW1lO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2VsZWN0UmF0aW5nKGV2ZW50KXtcbiAgICAgICAgY29uc3QgcmF0aW5nQmFyID0gZXZlbnQuY3VycmVudFRhcmdldC5wYXJlbnROb2RlO1xuXG4gICAgICAgIFsuLi5yYXRpbmdCYXIuY2hpbGRyZW5dLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgICAgICBub2RlLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge3JlZnJlc2hDb2xsZWN0aW9uLGdlbmVyYXRlV29ya1R5cGVGb3JtLGdldFBpZWNlT2ZXb3JrRm9ybURhdGEsZ2V0Qm9va0Zvcm1EYXRhLGdldE1vdmllRm9ybURhdGEsZ2V0Q29tcHV0ZXJHYW1lRm9ybURhdGEsaW5pdFdvcmtQaWNrRGlhbG9nLHNlbGVjdFJhdGluZ307XG59KSgpO1xuXG5tYWluQ29udHJvbGxlci5pbml0KCk7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9