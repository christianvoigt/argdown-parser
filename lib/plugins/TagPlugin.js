"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TagPlugin = void 0;

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.array.find");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.function.name");

var _ = _interopRequireWildcard(require("lodash"));

var utils = _interopRequireWildcard(require("../utils"));

var _ArgdownPluginError = require("../ArgdownPluginError");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var defaultSettings = {
  colorScheme: ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d", "#666666"]
};

var TagPlugin =
/*#__PURE__*/
function () {
  function TagPlugin(config) {
    var _this = this;

    _classCallCheck(this, TagPlugin);

    _defineProperty(this, "name", "TagPlugin");

    _defineProperty(this, "defaults", void 0);

    _defineProperty(this, "prepare", function (request) {
      var settings = _this.getSettings(request);

      _.defaultsDeep(settings, _this.defaults);

      var r = request;

      if (r.tagColorScheme) {
        settings.colorScheme = r.tagColorScheme;
      }

      if (r.tags) {
        settings.tags = r.tags;
      }
    });

    _defineProperty(this, "run", function (request, response, logger) {
      if (!response.tags) {
        throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "Missing tags field in response.");
      }

      if (!response.statements) {
        throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "Missing statements field in response.");
      }

      if (!response.arguments) {
        throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "Missing arguments field in response.");
      }

      response.tagsDictionary = {};
      var selectedTags = response.tags;

      var settings = _this.getSettings(request);

      if (settings.tags) {
        selectedTags = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = settings.tags[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var tagData = _step.value;

            if (tagData.tag) {
              selectedTags.push(tagData.tag);
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }

      var tagRequest = request;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = response.tags[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var tag = _step2.value;
          var _tagData = null;

          if (settings.tags && tagRequest.tags) {
            var tagConfig = _.find(tagRequest.tags, {
              tag: tag
            });

            _tagData = _.clone(tagConfig);
          }

          if (!_tagData) {
            _tagData = {
              tag: tag
            };
          }

          response.tagsDictionary[tag] = _tagData;
          var index = selectedTags.indexOf(tag);
          _tagData.cssClass = utils.stringToClassName("tag-" + tag);

          if (index > -1) {
            if (!_tagData.color && index < settings.colorScheme.length) {
              _tagData.color = settings.colorScheme[index];
            }

            _tagData.cssClass += " tag" + index;
            _tagData.index = index;
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      var _arr = Object.keys(response.statements);

      for (var _i = 0; _i < _arr.length; _i++) {
        var title = _arr[_i];
        var equivalenceClass = response.statements[title];

        if (equivalenceClass.tags) {
          equivalenceClass.sortedTags = _this.sortTags(equivalenceClass.tags, response);
        }
      }

      var _arr2 = Object.keys(response.arguments);

      for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
        var _title = _arr2[_i2];
        var argument = response.arguments[_title];

        if (argument.tags) {
          argument.sortedTags = _this.sortTags(argument.tags, response);
        }
      }
    });

    this.defaults = _.defaultsDeep({}, config, defaultSettings);
  }

  _createClass(TagPlugin, [{
    key: "getSettings",
    value: function getSettings(request) {
      var r = request;

      if (!r.tagPlugin) {
        r.tagPlugin = {};
      }

      return r.tagPlugin;
    }
  }, {
    key: "sortTags",
    value: function sortTags(tags, response) {
      var filtered = _.filter(tags, function (tag) {
        return response.tagsDictionary[tag].index != null;
      });

      var sorted = _.sortBy(filtered, function (tag) {
        return response.tagsDictionary[tag].index;
      });

      return sorted;
    }
  }]);

  return TagPlugin;
}();

exports.TagPlugin = TagPlugin;
//# sourceMappingURL=TagPlugin.js.map