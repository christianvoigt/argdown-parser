"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JSONExportPlugin = void 0;

require("core-js/modules/es6.function.name");

var _ = _interopRequireWildcard(require("lodash"));

var _ArgdownPluginError = require("../ArgdownPluginError");

var _toJSON = require("../model/toJSON");

var _model = require("../model/model");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var defaultSettings = {
  spaces: 2,
  removeEmbeddedRelations: false,
  exportMap: true,
  exportSections: true,
  exportTags: true,
  exportMetaData: true
};
/**
 * Exports data in the response object to JSON.
 * The result ist stored in the [[IJSONResponse.json]] response object property.
 *
 * Note: The [[IArgdownResponse.ast]] object is not exported to JSON.
 *
 * Depends on data from: [[ModelPlugin]]
 * Can use data from: [[TagPlugin]], [[MetaDataPlugin]], [[MapPlugin]]
 */

var JSONExportPlugin =
/*#__PURE__*/
function () {
  function JSONExportPlugin(config) {
    var _this = this;

    _classCallCheck(this, JSONExportPlugin);

    _defineProperty(this, "name", "JSONExportPlugin");

    _defineProperty(this, "defaults", void 0);

    _defineProperty(this, "prepare", function (request) {
      _.defaultsDeep(_this.getSettings(request), _this.defaults);
    });

    _defineProperty(this, "run", function (request, response, logger) {
      if (!response.statements) {
        throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "No statements field in response.");
      }

      if (!response.arguments) {
        throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "No arguments field in response.");
      }

      if (!response.relations) {
        throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "No relations field in response.");
      }

      var argdown = {
        arguments: response.arguments,
        statements: response.statements,
        relations: response.relations
      };

      var settings = _this.getSettings(request);

      var mapResponse = response;

      if (settings.exportMap && mapResponse.map && mapResponse.map.nodes && mapResponse.map.edges) {
        argdown.map = {
          nodes: mapResponse.map.nodes,
          edges: mapResponse.map.edges
        };
      }

      if (settings.exportSections && response.sections) {
        argdown.sections = response.sections;
      }

      if (settings.exportTags && response.tags && response.tagsDictionary) {
        argdown.tags = response.tags;
        argdown.tagsDictionary = response.tagsDictionary;
      }

      response.json = (0, _toJSON.toJSON)(argdown, function (key, value) {
        if (!settings.exportMetaData && key === "metaData") {
          return undefined;
        }

        if (settings.removeEmbeddedRelations && key === "relations" && this.type && (this.type === _model.ArgdownTypes.ARGUMENT || this.types === _model.ArgdownTypes.EQUIVALENCE_CLASS)) {
          return undefined;
        }

        if (!settings.exportSections && key === "section" && this.type && (this.type === _model.ArgdownTypes.ARGUMENT || this.types === _model.ArgdownTypes.EQUIVALENCE_CLASS)) {
          return undefined;
        }

        return value;
      }, settings.spaces);
      return response;
    });

    this.defaults = _.defaultsDeep({}, config, defaultSettings);
  }

  _createClass(JSONExportPlugin, [{
    key: "getSettings",
    value: function getSettings(request) {
      var r = request;

      if (r.json) {
        return r.json;
      } else {
        r.json = {};
        return r.json;
      }
    }
  }]);

  return JSONExportPlugin;
}();

exports.JSONExportPlugin = JSONExportPlugin;
//# sourceMappingURL=JSONExportPlugin.js.map