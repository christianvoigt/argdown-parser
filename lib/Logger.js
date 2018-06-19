"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Logger = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var getPriority = function getPriority(level) {
  switch (level) {
    case "verbose":
      return 1;

    case "warning":
      return 2;

    case "error":
      return 3;

    default:
      return -1;
  }
};

var Logger =
/*#__PURE__*/
function () {
  function Logger() {
    _classCallCheck(this, Logger);

    _defineProperty(this, "logLevel", "");
  }

  _createClass(Logger, [{
    key: "setLevel",
    value: function setLevel(level) {
      this.logLevel = level;
    }
  }, {
    key: "log",
    value: function log(level, message) {
      var messagePriority = getPriority(level);
      var loggerPriority = getPriority(this.logLevel);

      if (messagePriority >= loggerPriority) {
        if (level === "error") {
          console.error(message);
        } else if (level === "warning") {
          console.warn(message);
        } else {
          console.log(message);
        }
      }
    }
  }]);

  return Logger;
}();

exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map