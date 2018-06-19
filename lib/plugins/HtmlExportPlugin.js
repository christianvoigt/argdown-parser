"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HtmlExportPlugin = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.function.name");

var _ = _interopRequireWildcard(require("lodash"));

var utils = _interopRequireWildcard(require("../utils"));

var _ArgdownPluginError = require("../ArgdownPluginError");

var _modelUtils = require("../model/model-utils");

var _TokenNames = require("../TokenNames");

var _RuleNames = require("../RuleNames");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var defaultSettings = {
  headless: false,
  cssFile: "./argdown.css",
  title: "Argdown Document",
  lang: "en",
  charset: "utf8",
  allowFileProtocol: false,
  validateLink: utils.validateLink,
  normalizeLink: utils.normalizeLink
};
/**
 * Request configuration data used by the HTMLExportPlugin.
 */

/**
 * Exports the Argdown code to HTML.
 *
 * Depends on data from: ParserPlugin, ModelPlugin
 *
 * Can use data from: TagPlugin
 */
var HtmlExportPlugin =
/*#__PURE__*/
function () {
  _createClass(HtmlExportPlugin, [{
    key: "getSettings",
    value: function getSettings(request) {
      var r = request;
      var settings = r.html;

      if (!settings) {
        settings = {};
        r.html = settings;
      }

      return settings;
    }
  }]);

  function HtmlExportPlugin(config) {
    var _this = this,
        _this$tokenListeners,
        _this$ruleListeners;

    _classCallCheck(this, HtmlExportPlugin);

    _defineProperty(this, "name", "HtmlExportPlugin");

    _defineProperty(this, "defaults", void 0);

    _defineProperty(this, "ruleListeners", void 0);

    _defineProperty(this, "tokenListeners", void 0);

    _defineProperty(this, "prepare", function (request, response, logger) {
      _.defaultsDeep(_this.getSettings(request), _this.defaults);

      if (!response.ast) {
        throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "No AST field in response.");
      }

      if (!response.statements) {
        throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "No statements field in response.");
      }

      if (!response.arguments) {
        throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "No arguments field in response.");
      }
    });

    this.defaults = _.defaultsDeep({}, config, defaultSettings);
    var $ = this;
    var htmlRequest;
    var htmlResponse;
    this.tokenListeners = (_this$tokenListeners = {}, _defineProperty(_this$tokenListeners, _TokenNames.TokenNames.STATEMENT_DEFINITION, function (request, response, token, parentNode) {
      var htmlId = utils.getHtmlId("statement", token.title, htmlResponse.htmlIds);
      htmlResponse.htmlIds[htmlId] = true;
      var classes = "definition statement-definition definiendum";

      if (parentNode.equivalenceClass && parentNode.equivalenceClass.sortedTags) {
        classes += " " + $.getCssClassesFromTags(response, parentNode.equivalenceClass.sortedTags);
      }

      htmlResponse.html += "<span id=".concat(htmlId, "\" class=\"").concat(classes, "\">[<span class=\"title statement-title\">").concat(_.escape(token.title), "</span>]: </span>");
    }), _defineProperty(_this$tokenListeners, _TokenNames.TokenNames.STATEMENT_REFERENCE, function (request, response, token, parentNode) {
      var htmlId = utils.getHtmlId("statement", token.title);
      var classes = "reference statement-reference";

      if (parentNode.equivalenceClass && parentNode.equivalenceClass.sortedTags) {
        classes += " " + $.getCssClassesFromTags(response, parentNode.equivalenceClass.sortedTags);
      }

      htmlResponse.html += "<a href=\"#".concat(htmlId, "\" class=\"").concat(classes, "\">[<span class=\"title statement-title\">").concat(_.escape(token.title), "</span>] </a>");
    }), _defineProperty(_this$tokenListeners, _TokenNames.TokenNames.STATEMENT_MENTION, function (request, response, token) {
      var equivalenceClass = response.statements[token.title];
      var classes = "mention statement-mention";

      if (equivalenceClass.sortedTags) {
        classes += " " + $.getCssClassesFromTags(response, equivalenceClass.sortedTags);
      }

      var htmlId = utils.getHtmlId("statement", token.title);
      htmlResponse.html += "<a href=\"#".concat(htmlId, "\" class=\"").concat(classes, "\">@[<span class=\"title statement-title\">").concat(_.escape(token.title), "</span>]</a>").concat(token.trailingWhitespace);
    }), _defineProperty(_this$tokenListeners, _TokenNames.TokenNames.ARGUMENT_MENTION, function (request, response, token) {
      var htmlId = utils.getHtmlId("argument", token.title);
      var classes = "mention argument-mention";
      var argument = response.arguments[token.title];

      if (argument.sortedTags) {
        classes += " " + $.getCssClassesFromTags(response, argument.sortedTags);
      }

      htmlResponse.html += "<a href=\"#".concat(htmlId, "\" class=\"").concat(classes, "\">@&lt;<span class=\"title argument-title\">").concat(_.escape(token.title), "</span>&gt;</a>").concat(token.trailingWhitespace);
    }), _defineProperty(_this$tokenListeners, _TokenNames.TokenNames.LINK, function (request, response, token) {
      var settings = $.getSettings(request);
      var linkUrl = settings.normalizeLink(token.url);
      var linkText = token.text;

      if (!settings.validateLink(linkUrl, settings.allowFileProtocol || false)) {
        linkUrl = "";
        linkText = "removed insecure url.";
      }

      htmlResponse.html += "<a href=\"".concat(linkUrl, "\">").concat(linkText, "</a>").concat(token.trailingWhitespace);
    }), _defineProperty(_this$tokenListeners, _TokenNames.TokenNames.TAG, function (request, response, node) {
      var token = node;

      if (token.text) {
        htmlResponse.html += "<span class=\"tag ".concat($.getCssClassesFromTags(response, [token.tag]), "\">").concat(_.escape(token.text), "</span>");
      }
    }), _this$tokenListeners);
    this.ruleListeners = (_this$ruleListeners = {}, _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.ARGDOWN + "Entry", function (request, response) {
      htmlRequest = request;
      htmlResponse = response;
      htmlResponse.html = "";
      htmlResponse.htmlIds = {};
      var settings = $.getSettings(request);

      if (!settings.headless) {
        var _head = settings.head;

        if (!_head) {
          _head = "<!doctype html><html lang=\"".concat(settings.lang, "\"><head><meta charset=\"").concat(settings.charset, "\"><title>").concat(settings.title, "</title>");

          if (settings.cssFile) {
            _head += "<link rel=\"stylesheet\" href=".concat(settings.cssFile, "\">");
          }

          _head += "</head>";
        }

        htmlResponse.html += _head;
        htmlResponse.html += "<body>";
      }

      htmlResponse.html += "<div class=\"argdown\">";
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.ARGDOWN + "Exit", function (request, response) {
      var settings = $.getSettings(request); // Remove htmlIds, because other plugins might create their own ones.
      // Ids only need to be unique within one document, not across documents.

      htmlResponse.htmlIds = null;
      htmlResponse.html += "</div>";

      if (!settings.headless) {
        htmlResponse.html += "</body></html>";
      }
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.STATEMENT + "Entry", function (request, response, node) {
      var classes = "statement";

      if (node.equivalenceClass && node.equivalenceClass.tags && node.equivalenceClass.sortedTags) {
        classes += " " + $.getCssClassesFromTags(response, node.equivalenceClass.sortedTags);
      }

      htmlResponse.html += "<div data-line=\"has-line ".concat(node.startLine, "\" class=\"").concat(classes, "\">");
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.STATEMENT + "Exit", function (request, response) {
      return htmlResponse.html += "</div>";
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.ARGUMENT_REFERENCE + "Entry", function (request, response, node) {
      var htmlId = utils.getHtmlId("argument", node.argument.title);
      var classes = "reference argument-reference";

      if (node.argument.tags && node.argument.sortedTags) {
        classes += " " + $.getCssClassesFromTags(response, node.argument.sortedTags);
      }

      htmlResponse.html += "<a href=\"#".concat(htmlId, "\" data-line=\"").concat(node.startLine, "\" class=\"has-line ").concat(classes, "\">&lt;<span class=\"title argument-title\">").concat(_.escape(node.argument.title), "</span>&gt; </a>");
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.ARGUMENT_DEFINITION + "Entry", function (request, response, node) {
      var htmlId = utils.getHtmlId("argument", node.argument.title, htmlResponse.htmlIds);
      htmlResponse.htmlIds[htmlId] = true;
      var classes = "definition argument-definition";

      if (node.argument.tags && node.argument.sortedTags) {
        classes += " " + $.getCssClassesFromTags(response, node.argument.sortedTags);
      }

      htmlResponse.html += "<div id=\"".concat(htmlId, "\" data-line=\"").concat(node.startLine, "\" class=\"has-line ").concat(classes, "\"><span class=\"definiendum argument-definiendum\">&lt;<span class=\"title argument-title\">").concat(_.escape(node.argument.title), "</span>&gt;: </span><span class=\"argument-definiens definiens description\">");
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.ARGUMENT_DEFINITION + "Exit", function (request, response) {
      return htmlResponse.html += "</span></div>";
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.INCOMING_SUPPORT + "Entry", function (request, response, node) {
      htmlResponse.html += "<div data-line=\"".concat(node.startLine, "\" class=\"has-line incoming support relation\"><div class=\"incoming support relation-symbol\"><span>+&gt;</span></div>");
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.INCOMING_SUPPORT + "Exit", function (request, response) {
      return htmlResponse.html += "</div>";
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.INCOMING_ATTACK + "Entry", function (request, response, node) {
      htmlResponse.html += "<div data-line=\"".concat(node.startLine, "\" class=\"has-line incoming attack relation\"><div class=\"incoming attack relation-symbol\"><span>-&gt;</span></div>");
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.INCOMING_ATTACK + "Exit", function (request, response) {
      return htmlResponse.html += "</div>";
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.INCOMING_UNDERCUT + "Entry", function (request, response, node) {
      htmlResponse.html += "<div data-line=\"".concat(node.startLine, "\" class=\"has-line incoming undercut relation\"><div class=\"incoming undercut relation-symbol\"><span>_&gt;</span></div>");
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.INCOMING_UNDERCUT + "Exit", function (request, response) {
      return htmlResponse.html += "</div>";
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.OUTGOING_SUPPORT + "Entry", function (request, response, node) {
      htmlResponse.html += "<div data-line=\"".concat(node.startLine, "\" class=\"has-line outgoing support relation\"><div class=\"outgoing support relation-symbol\"><span>+</span></div>");
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.OUTGOING_SUPPORT + "Exit", function (request, response) {
      htmlResponse.html += "</div>";
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.OUTGOING_ATTACK + "Entry", function (request, response, node) {
      htmlResponse.html += "<div data-line=\"".concat(node.startLine, "\" class=\"has-line outgoing attack relation\"><div class=\"outgoing attack relation-symbol\"><span>-</span></div>");
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.OUTGOING_ATTACK + "Exit", function (request, response) {
      htmlResponse.html += "</div>";
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.OUTGOING_UNDERCUT + "Entry", function (request, response, node) {
      htmlResponse.html += "<div data-line=\"".concat(node.startLine, "\" class=\"has-line outgoing undercut relation\"><div class=\"outgoing undercut relation-symbol\"><span>&lt;_</span></div>");
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.OUTGOING_UNDERCUT + "Exit", function (request, response) {
      htmlResponse.html += "</div>";
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.CONTRADICTION + "Entry", function (request, response, node) {
      htmlResponse.html += "<div data-line=\"".concat(node.startLine, "\" class=\"has-line contradiction relation\"><div class=\"contradiction relation-symbol\"><span>&gt;&lt;</span></div>");
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.CONTRADICTION + "Exit", function (request, response) {
      htmlResponse.html += "</div>";
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.RELATIONS + "Entry", function (request, response) {
      htmlResponse.html += "<div class=\"relations\">";
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.RELATIONS + "Exit", function (request, response) {
      htmlResponse.html += "</div>";
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.ORDERED_LIST + "Entry", function (request, response) {
      return htmlResponse.html += "<ol>";
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.ORDERED_LIST + "Exit", function (request, response) {
      return htmlResponse.html += "</ol>";
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.UNORDERED_LIST + "Entry", function (request, response) {
      return htmlResponse.html += "<ul>";
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.UNORDERED_LIST + "Exit", function (request, response) {
      return htmlResponse.html += "</ul>";
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.ORDERED_LIST_ITEM + "Entry", function (request, response, node) {
      return htmlResponse.html += "<li data-line=\"".concat(node.startLine, "\" class=\"has-line\">");
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.ORDERED_LIST_ITEM + "Exit", function (request, response) {
      return htmlResponse.html += "</li>";
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.UNORDERED_LIST_ITEM + "Entry", function (request, response, node) {
      return htmlResponse.html += "<li data-line=\"".concat(node.startLine, "\" class=\"has-line\">");
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.UNORDERED_LIST_ITEM + "Exit", function (request, response) {
      return htmlResponse.html += "</li>";
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.HEADING + "Entry", function (request, response, node) {
      var settings = $.getSettings(request);

      if (node.level === 1) {
        if (settings.title == "Argdown Document") {
          htmlResponse.html = htmlResponse.html.replace("<title>Argdown Document</title>", "<title>" + _.escape(node.text) + "</title>");
        }
      }

      var htmlId = utils.getHtmlId("heading", node.text, htmlResponse.htmlIds);
      htmlResponse.htmlIds[htmlId] = true;
      htmlResponse.html += "<h".concat(node.level, " data-line=\"").concat(node.startLine, "\" id=\"").concat(htmlId, "\" class=\"has-line heading\">");
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.HEADING + "Exit", function (request, response, node) {
      return htmlResponse.html += "</h" + node.level + ">";
    }), _defineProperty(_this$ruleListeners, "freestyleTextEntry", function freestyleTextEntry(request, response, node, parentNode) {
      if (parentNode && parentNode.name != "inferenceRules") {
        htmlResponse.html += _.escape(node.text);
      }
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.BOLD + "Entry", function (request, response) {
      return htmlResponse.html += "<b>";
    }), _defineProperty(_this$ruleListeners, "boldExit", function boldExit(request, response, node) {
      return htmlResponse.html += "</b>" + node.trailingWhitespace;
    }), _defineProperty(_this$ruleListeners, "italicEntry", function italicEntry(request, response) {
      return htmlResponse.html += "<i>";
    }), _defineProperty(_this$ruleListeners, "italicExit", function italicExit(request, response, node) {
      return htmlResponse.html += "</i>" + node.trailingWhitespace;
    }), _defineProperty(_this$ruleListeners, "pcsEntry", function pcsEntry(request, response, node) {
      var classes = "argument pcs";

      if (node.argument.sortedTags) {
        classes += " " + $.getCssClassesFromTags(response, node.argument.sortedTags);
      }

      htmlResponse.html += "<div class=\"".concat(classes, "\">");
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.PCS + "Exit", function (request, response) {
      return htmlResponse.html += "</div>";
    }), _defineProperty(_this$ruleListeners, "argumentStatementEntry", function argumentStatementEntry(request, response, node) {
      var statement = node.statement;

      if (statement && (0, _modelUtils.isConclusion)(statement) && statement.inference) {
        var inference = statement.inference;

        if (!inference.inferenceRules || inference.inferenceRules.length == 0) {
          htmlResponse.html += "<div data-line=\"".concat(inference.startLine, "\" class=\"has-line inference\">");
        } else {
          htmlResponse.html += "<div data-line=\"".concat(inference.startLine, "\" class=\"has-line inference with-data\">");
        }

        htmlResponse.html += "<span class=\"inference-rules\">";

        if (inference.inferenceRules && inference.inferenceRules.length > 0) {
          var i = 0;
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = inference.inferenceRules[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var inferenceRule = _step.value;
              if (i > 0) htmlResponse.html += ", ";
              htmlResponse.html += "<span class=\"inference-rule\">".concat(inferenceRule, "</span>");
              i++;
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

          htmlResponse.html += "</span> ";
        }

        htmlResponse.html += "</div>";
      }

      htmlResponse.html += "<div data-line=\"".concat(node.startLine, "\" class=\"has-line ").concat(node.statement.role, " argument-statement\"><div class=\"statement-nr\">(<span>").concat(node.statementNr, "</span>)</div>");
    }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.ARGUMENT_STATEMENT + "Exit", function (request, response) {
      return htmlResponse.html += "</div>";
    }), _this$ruleListeners);
  }

  _createClass(HtmlExportPlugin, [{
    key: "getCssClassesFromTags",
    value: function getCssClassesFromTags(response, tags) {
      var classes = "";

      if (!tags || !response.tagsDictionary) {
        return classes;
      }

      var index = 0;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = tags[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var tag = _step2.value;

          if (index > 0) {
            classes += " ";
          }

          index++;
          var tagData = response.tagsDictionary[tag];
          classes += tagData.cssClass;
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

      return classes;
    }
  }]);

  return HtmlExportPlugin;
}();

exports.HtmlExportPlugin = HtmlExportPlugin;
//# sourceMappingURL=HtmlExportPlugin.js.map