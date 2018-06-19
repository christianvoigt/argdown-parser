"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DotExportPlugin = void 0;

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.regexp.search");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.function.name");

var _ = _interopRequireWildcard(require("lodash"));

var _ArgdownPluginError = require("../ArgdownPluginError");

var _model = require("../model/model");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var defaultSettings = {
  useHtmlLabels: true,
  graphname: "Argument Map",
  lineLength: 25,
  groupColors: ["#DADADA", "#BABABA", "#AAAAAA"],
  graphVizSettings: {
    rankdir: "BT",
    //BT | TB | LR | RL
    concentrate: "false",
    ratio: "auto",
    size: "10,10"
  },
  colorNodesByTag: true
};
/**
 * Exports map data to dot format.
 * The result ist stored in the [[IDotResponse.dot]] response object property.
 *
 * Depends on data from: [[MapPlugin]]
 */

var DotExportPlugin =
/*#__PURE__*/
function () {
  function DotExportPlugin(config) {
    var _this = this;

    _classCallCheck(this, DotExportPlugin);

    _defineProperty(this, "name", "DotExportPlugin");

    _defineProperty(this, "defaults", void 0);

    _defineProperty(this, "prepare", function (request, response) {
      var mapResponse = response;

      if (!mapResponse.map) {
        throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "No map property in response.");
      }

      if (!mapResponse.statements) {
        throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "No statements property in response.");
      }

      if (!mapResponse.arguments) {
        throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "No arguments property in response.");
      }

      if (!mapResponse.relations) {
        throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "No relations property in response.");
      }

      _.defaultsDeep(_this.getSettings(request), _this.defaults);
    });

    _defineProperty(this, "run", function (request, response, logger) {
      var settings = _this.getSettings(request);

      var mapResponse = response;
      response.groupCount = 0;
      var dot = 'digraph "' + settings.graphname + '" {\n\n';

      if (settings.graphVizSettings) {
        var keys = Object.keys(settings.graphVizSettings);

        for (var _i = 0; _i < keys.length; _i++) {
          var key = keys[_i];
          var value = settings.graphVizSettings[key];
          dot += key + ' = "' + value + '";\n';
        }
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = mapResponse.map.nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var node = _step.value;
          dot += _this.exportNodesRecursive(node, response, settings);
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

      dot += "\n\n";
      var edges = mapResponse.map.edges;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = edges[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var edge = _step2.value;
          var color = "green";

          if (edge.relationType == _model.RelationType.ATTACK) {
            color = "red";
          } else if (edge.relationType == _model.RelationType.UNDERCUT) {
            color = "purple";
          }

          var attributes = 'color="' + color + '", type="' + edge.type + '"';
          dot += "  " + edge.from.id + " -> " + edge.to.id + " [" + attributes + "];\n";
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

      dot += "\n}";
      response.dot = dot;
      return response;
    });

    this.defaults = _.defaultsDeep({}, config, defaultSettings);
  }

  _createClass(DotExportPlugin, [{
    key: "getSettings",
    value: function getSettings(request) {
      var r = request;

      if (r.dot) {
        return r.dot;
      } else {
        r.dot = {};
        return r.dot;
      }
    }
  }, {
    key: "exportNodesRecursive",
    value: function exportNodesRecursive(node, response, settings) {
      var dot = "";
      response.groupCount = response.groupCount === undefined ? 0 : response.groupCount;

      if (node.type === _model.ArgdownTypes.GROUP_MAP_NODE) {
        var groupNode = node;
        response.groupCount++;
        var dotGroupId = "cluster_" + response.groupCount;
        var groupLabel = node.labelTitle || "";

        if (settings.useHtmlLabels) {
          groupLabel = foldAndEscape(groupLabel, settings.lineLength || defaultSettings.lineLength);
          groupLabel = '<<FONT FACE="Arial" POINT-SIZE="10">' + groupLabel + "</FONT>>";
        } else {
          groupLabel = '"' + escapeQuotesForDot(groupLabel) + '"';
        }

        var groupColor = "#CCCCCC";

        if (settings.groupColors && settings.groupColors.length > 0) {
          var level = groupNode.level || 0;

          if (settings.groupColors.length >= level) {
            groupColor = settings.groupColors[level];
          } else {
            groupColor = settings.groupColors[settings.groupColors.length - 1];
          }
        }

        dot += "\nsubgraph " + dotGroupId + " {\n";
        dot += "  label = " + groupLabel + ";\n";
        dot += '  color = "' + groupColor + '";\n';
        dot += "  style = filled;\n";
        var labelloc = "t";

        if (settings.graphVizSettings && settings.graphVizSettings.rankdir == "BT") {
          labelloc = "b";
        }

        dot += ' labelloc = "' + labelloc + '";\n\n';

        if (groupNode.children) {
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = groupNode.children[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var child = _step3.value;
              dot += this.exportNodesRecursive(child, response, settings);
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
                _iterator3.return();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }
        }

        dot += "\n}\n\n";
        return dot;
      }

      var title = node.labelTitle || "";
      var text = node.labelText || "";
      var label = "";
      var color = "#63AEF2";

      if (settings.colorNodesByTag && node.tags && response.tagsDictionary) {
        var tag = node.tags[0];
        var tagData = response.tagsDictionary[tag];

        if (tagData && tagData.color) {
          color = tagData.color;
        }
      }

      label = getLabel(title, text, settings);

      if (node.type === _model.ArgdownTypes.ARGUMENT_MAP_NODE) {
        dot += "  " + node.id + " [label=" + label + ', shape="box", style="filled,rounded", fillcolor="' + color + '",  type="' + node.type + '"];\n';
      } else if (node.type === _model.ArgdownTypes.STATEMENT_MAP_NODE) {
        dot += "  " + node.id + " [label=" + label + ', shape="box", style="filled,rounded,bold", color="' + color + '", fillcolor="white", labelfontcolor="white", type="' + node.type + '"];\n';
      }

      return dot;
    }
  }]);

  return DotExportPlugin;
}();

exports.DotExportPlugin = DotExportPlugin;

var fold = function fold(s, n, useSpaces, a) {
  if (!s) return [];
  a = a || [];

  if (s.length <= n) {
    a.push(s);
    return a;
  }

  var line = s.substring(0, n);

  if (!useSpaces) {
    // insert newlines anywhere
    a.push(line);
    return fold(s.substring(n), n, useSpaces, a);
  } else {
    // attempt to insert newlines after whitespace
    var lastSpaceRgx = /\s(?!.*\s)/;
    var idx = line.search(lastSpaceRgx);
    var nextIdx = n;

    if (idx > 0) {
      line = line.substring(0, idx);
      nextIdx = idx;
    }

    a.push(line);
    return fold(s.substring(nextIdx), n, useSpaces, a);
  }
};

var foldAndEscape = function foldAndEscape(str, lineLength) {
  var strArray = fold(str, lineLength, true);

  for (var i = 0; i < strArray.length; i++) {
    strArray[i] = escapeForHtml(strArray[i]);
  }

  return strArray.join("<br/>");
};

var escapeForHtml = function escapeForHtml(s) {
  return s.replace(/[^0-9A-Za-z ]/g, function (c) {
    return "&#" + c.charCodeAt(0) + ";";
  });
};

var escapeQuotesForDot = function escapeQuotesForDot(str) {
  return str.replace(/\"/g, '\\"');
};

var getLabel = function getLabel(title, text, settings) {
  var label = "";

  if (settings.useHtmlLabels) {
    label += '<<FONT FACE="Arial" POINT-SIZE="8"><TABLE BORDER="0" CELLSPACING="0">';

    if (!_.isEmpty(title)) {
      var titleLabel = foldAndEscape(title, settings.lineLength || defaultSettings.lineLength);
      titleLabel = '<TR><TD ALIGN="center"><B>' + titleLabel + "</B></TD></TR>";
      label += titleLabel;
    }

    if (!_.isEmpty(text)) {
      var textLabel = foldAndEscape(text, settings.lineLength || defaultSettings.lineLength);
      textLabel = '<TR><TD ALIGN="center">' + textLabel + "</TD></TR>";
      label += textLabel;
    }

    label += "</TABLE></FONT>>";
  } else {
    label = '"' + escapeQuotesForDot(title) + '"';
  }

  return label;
};
//# sourceMappingURL=DotExportPlugin.js.map