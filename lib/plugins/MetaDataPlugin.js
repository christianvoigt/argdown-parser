"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MetaDataPlugin = void 0;

require("core-js/modules/es6.regexp.replace");

var _ = _interopRequireWildcard(require("lodash"));

var yaml = _interopRequireWildcard(require("js-yaml"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * The default settings of the MetaDataPlugin
 */
var defaultSettings = {
  mergeFrontMatterIntoRequest: true,
  switchToBlockFormatIfMultiline: true
};
var frontMatterStartPattern = /^\s*\={3,}/;
var frontMatterEndPattern = /\={3,}\s*$/;
var blockFormatStartPattern = /^{[ \t]*(\n\r|\n)/;
var blockFormatEndPattern = /}\s*$/;
/**
 * The MetaDataPlugin parses Argdown YAML front matter and YAML meta data of statements, arguments, headings or inferences.
 * In the ParserPlugin the Argdown lexer treats these sections as single tokens so that their contents are ignored by the Argdown parser. Instead the YAML parsing is done
 * afterwards in this plugin by traversing the produced AST and using the `js-yaml` parser for parsing the content of the FrontMatter and MetaData tokens.
 *
 * The parsed metaData is added to the AST nodes and the data model elements it is meant for.
 * If multiple metaData sections exist for the same argument or equivalence class, the data is merged in order of appearance (last wins).
 *
 * The front matter data is added to the topmost AST `argdown` node and to the [[IMetaDataResponse.frontMatter]] response property.
 * By default (or if `response.metaData.mergeFrontMatterIntoRequest` is true) the front matter is also merged into the request object so that it can be used to configure subsequent plugins.
 *
 * Depends on data of: [[ParserPlugin]]
 */

var MetaDataPlugin =
/*#__PURE__*/
function () {
  function MetaDataPlugin(config) {
    var _this = this;

    _classCallCheck(this, MetaDataPlugin);

    _defineProperty(this, "name", "MetaDataPlugin");

    _defineProperty(this, "defaults", void 0);

    _defineProperty(this, "tokenListeners", void 0);

    _defineProperty(this, "prepare", function (request) {
      _.defaultsDeep(_this.getSettings(request), _this.defaults);
    });

    this.defaults = _.defaultsDeep({}, config, defaultSettings);
    this.tokenListeners = {
      MetaData: function MetaData(request, _ref, token, parentNode, _ref2, logger) {
        _objectDestructuringEmpty(_ref);

        _objectDestructuringEmpty(_ref2);

        var options = {};
        var metaDataStr = token.image;

        var settings = _this.getSettings(request);

        if (settings.switchToBlockFormatIfMultiline) {
          var match = blockFormatStartPattern.exec(metaDataStr);

          if (match) {
            metaDataStr = metaDataStr.substr(match[0].length).replace(blockFormatEndPattern, "");
          }
        }

        var metaData = yaml.safeLoad(metaDataStr, options);

        if (parentNode) {
          parentNode.metaData = metaData;
        }
      },
      FrontMatter: function FrontMatter(request, response, token, parentNode, _ref3, logger) {
        _objectDestructuringEmpty(_ref3);

        var options = {};
        var metaDataStr = token.image.replace(frontMatterStartPattern, "").replace(frontMatterEndPattern, "");
        var metaData = yaml.safeLoad(metaDataStr, options);

        if (parentNode) {
          parentNode.metaData = metaData;
        }

        response.frontMatter = metaData;

        var settings = _this.getSettings(request);

        if (metaData && _.isObject(metaData) && settings.mergeFrontMatterIntoRequest) {
          _.merge(request, metaData);
        }
      }
    };
  }

  _createClass(MetaDataPlugin, [{
    key: "getSettings",
    value: function getSettings(request) {
      var r = request;

      if (r.metadata) {
        return r.metadata;
      } else {
        r.metadata = {};
        return r.metadata;
      }
    } //   run: IRequestHandler = (request, response, logger) => {};

  }]);

  return MetaDataPlugin;
}();

exports.MetaDataPlugin = MetaDataPlugin;
//# sourceMappingURL=MetaDataPlugin.js.map