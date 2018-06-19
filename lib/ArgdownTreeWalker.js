"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ArgdownTreeWalker = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.object.set-prototype-of");

require("core-js/modules/es6.function.name");

var _eventemitter = require("eventemitter3");

var _modelUtils = require("./model/model-utils");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Event emitter that visits every node in an Argdown Ast structure
 * and emits events for every rule entered and exited
 * and every token visited.
 */
var ArgdownTreeWalker =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(ArgdownTreeWalker, _EventEmitter);

  function ArgdownTreeWalker() {
    var _getPrototypeOf2;

    var _temp, _this;

    _classCallCheck(this, ArgdownTreeWalker);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _possibleConstructorReturn(_this, (_temp = _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(ArgdownTreeWalker)).call.apply(_getPrototypeOf2, [this].concat(args))), _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "visitNode", function (request, response, node, parentNode, childIndex, logger) {
      if (node) {
        if ((0, _modelUtils.isRuleNode)(node)) {
          _this.emit(node.name + "Entry", request, response, node, parentNode, childIndex, logger);

          if (node.children && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
              var child = node.children[i];

              _this.visitNode(request, response, child, node, i, logger);
            }
          }

          _this.emit(node.name + "Exit", request, response, node, parentNode, childIndex, logger);
        } else if ((0, _modelUtils.isTokenNode)(node)) {
          _this.emit(node.tokenType.tokenName, request, response, node, parentNode, childIndex, logger);
        }
      }
    }), _temp));
  }

  _createClass(ArgdownTreeWalker, [{
    key: "walk",
    value: function walk(request, response, logger) {
      if (response.ast) {
        this.visitNode(request, response, response.ast, null, null, logger);
      }
    }
  }]);

  return ArgdownTreeWalker;
}(_eventemitter.EventEmitter);

exports.ArgdownTreeWalker = ArgdownTreeWalker;
//# sourceMappingURL=ArgdownTreeWalker.js.map