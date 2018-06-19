"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ArgdownPluginError = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.map");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.reflect.construct");

require("core-js/modules/es6.object.set-prototype-of");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null) return null; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * [[IArgdownPlugin]] implementations are expected to check in their [[IArgdownPlugin.prepare]] method
 * that all required data is available in the response object. If this is not the case, they should throw an
 * [[ArgdownPluginError]].
 */
var ArgdownPluginError =
/*#__PURE__*/
function (_Error) {
  _inherits(ArgdownPluginError, _Error);

  /**
   * The name of the plugin throwing the error.
   */

  /**
   * The name of the processor the plugin is a part of.
   * Will be added automatically by [[ArgdownApplication]].
   */

  /**
   *
   * @param plugin the nname of the plugin throwing this error
   * @param message the reason why this error was thrown
   * @param e
   */
  function ArgdownPluginError(plugin, message) {
    var _this;

    _classCallCheck(this, ArgdownPluginError);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ArgdownPluginError).call(this, message)); // 'Error' breaks prototype chain here

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "plugin", void 0);

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "processor", void 0);

    Object.setPrototypeOf(_assertThisInitialized(_assertThisInitialized(_this)), (this instanceof ArgdownPluginError ? this.constructor : void 0).prototype); // restore prototype chain

    _this.plugin = plugin;
    return _this;
  }

  return ArgdownPluginError;
}(_wrapNativeSuper(Error));

exports.ArgdownPluginError = ArgdownPluginError;
//# sourceMappingURL=ArgdownPluginError.js.map