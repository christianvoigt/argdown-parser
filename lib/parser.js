"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parser = void 0;

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.object.set-prototype-of");

require("core-js/modules/es6.string.bold");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

var _chevrotain = _interopRequireWildcard(require("chevrotain"));

var lexer = _interopRequireWildcard(require("./lexer"));

var _ArgdownErrorMessageProvider = require("./ArgdownErrorMessageProvider");

var _modelUtils = require("./model/model-utils");

var _RuleNames = require("./RuleNames");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ArgdownParser =
/*#__PURE__*/
function (_chevrotain$Parser) {
  _inherits(ArgdownParser, _chevrotain$Parser);

  function ArgdownParser() {
    var _this;

    _classCallCheck(this, ArgdownParser);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ArgdownParser).call(this, [], lexer.tokenList, {
      errorMessageProvider: new _ArgdownErrorMessageProvider.ArgdownErrorMessageProvider(),
      recoveryEnabled: true
    })); // very important to call this after all the rules have been defined.
    // otherwise the parser may not work correctly as it will lack information
    // derived during the self analysis phase.

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "c1", void 0);

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "c2", void 0);

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "c3", void 0);

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "argdown", _this.RULE(_RuleNames.RuleNames.ARGDOWN, function () {
      _this.OPTION1(function () {
        _this.CONSUME1(lexer.Emptyline);
      });

      var children = [];

      _this.OPTION2(function () {
        children.push(_this.CONSUME2(lexer.FrontMatter));

        _this.CONSUME2(lexer.Emptyline);
      }); // OR caching. see: http://sap.github.io/chevrotain/docs/FAQ.html#major-performance-benefits


      var atLeastOne = _this.AT_LEAST_ONE_SEP({
        SEP: lexer.Emptyline,
        DEF: function DEF() {
          return _this.OR(_this.c1 || (_this.c1 = [{
            ALT: function ALT() {
              return _this.SUBRULE(_this.heading);
            }
          }, {
            ALT: function ALT() {
              return _this.SUBRULE(_this.statement);
            }
          }, {
            ALT: function ALT() {
              return _this.SUBRULE(_this.pcs);
            }
          }, {
            ALT: function ALT() {
              return _this.SUBRULE(_this.argumentDefinition);
            }
          }, {
            ALT: function ALT() {
              return _this.SUBRULE(_this.argumentReference);
            }
          }, {
            ALT: function ALT() {
              return _this.SUBRULE(_this.orderedList);
            }
          }, {
            ALT: function ALT() {
              return _this.SUBRULE(_this.unorderedList);
            }
          }]));
        }
      });

      children.push.apply(children, _toConsumableArray(atLeastOne.values));
      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.ARGDOWN, children);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "heading", _this.RULE(_RuleNames.RuleNames.HEADING, function () {
      var children = [];
      children.push(_this.CONSUME1(lexer.HeadingStart));

      _this.AT_LEAST_ONE({
        DEF: function DEF() {
          return children.push(_this.SUBRULE(_this.statementContent));
        }
      });

      _this.OPTION(function () {
        children.push(_this.CONSUME2(lexer.MetaData));
      });

      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.HEADING, children);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "pcs", _this.RULE(_RuleNames.RuleNames.PCS, function () {
      var children = [];
      children.push(_this.SUBRULE1(_this.argumentStatement));

      _this.AT_LEAST_ONE({
        DEF: function DEF() {
          children.push(_this.SUBRULE2(_this.pcsTail));
        }
      });

      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.PCS, children);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "pcsTail", _this.RULE(_RuleNames.RuleNames.PCS_TAIL, function () {
      var children = [];

      _this.MANY({
        DEF: function DEF() {
          children.push(_this.SUBRULE1(_this.argumentStatement));
        }
      });

      children.push(_this.SUBRULE2(_this.inference));
      children.push(_this.SUBRULE3(_this.argumentStatement));
      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.PCS_TAIL, children);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "argumentStatement", _this.RULE(_RuleNames.RuleNames.ARGUMENT_STATEMENT, function () {
      var children = [];
      children.push(_this.CONSUME(lexer.StatementNumber));
      children.push(_this.SUBRULE(_this.statement));
      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.ARGUMENT_STATEMENT, children);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "inference", _this.RULE(_RuleNames.RuleNames.INFERENCE, function () {
      var children = [];
      children.push(_this.CONSUME1(lexer.InferenceStart));

      _this.OPTION1(function () {
        children.push(_this.SUBRULE1(_this.inferenceRules));
      });

      _this.OPTION2(function () {
        children.push(_this.CONSUME2(lexer.MetaData));
      });

      children.push(_this.CONSUME3(lexer.InferenceEnd));

      _this.OPTION3(function () {
        children.push(_this.SUBRULE2(_this.inferenceRelations));
      });

      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.INFERENCE, children);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "inferenceRules", _this.RULE(_RuleNames.RuleNames.INFERENCE_RULES, function () {
      var children = [];

      _this.AT_LEAST_ONE_SEP1({
        SEP: lexer.ListDelimiter,
        DEF: function DEF() {
          return children.push(_this.SUBRULE(_this.freestyleText));
        }
      });

      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.INFERENCE_RULES, children);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "orderedList", _this.RULE(_RuleNames.RuleNames.ORDERED_LIST, function () {
      var children = [];
      children.push(_this.CONSUME(lexer.Indent));

      _this.AT_LEAST_ONE(function () {
        return children.push(_this.SUBRULE(_this.orderedListItem));
      });

      children.push(_this.CONSUME(lexer.Dedent));
      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.ORDERED_LIST, children);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "unorderedList", _this.RULE(_RuleNames.RuleNames.UNORDERED_LIST, function () {
      var children = [];
      children.push(_this.CONSUME(lexer.Indent));

      _this.AT_LEAST_ONE(function () {
        return children.push(_this.SUBRULE(_this.unorderedListItem));
      });

      children.push(_this.CONSUME(lexer.Dedent));
      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.ORDERED_LIST, children);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "unorderedListItem", _this.RULE(_RuleNames.RuleNames.UNORDERED_LIST_ITEM, function () {
      var children = [];
      children.push(_this.CONSUME(lexer.UnorderedListItem));
      children.push(_this.SUBRULE(_this.statement));
      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.UNORDERED_LIST_ITEM, children);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "orderedListItem", _this.RULE(_RuleNames.RuleNames.ORDERED_LIST_ITEM, function () {
      var children = [];
      children.push(_this.CONSUME(lexer.OrderedListItem));
      children.push(_this.SUBRULE(_this.statement));
      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.ORDERED_LIST_ITEM, children);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "argumentReference", _this.RULE(_RuleNames.RuleNames.ARGUMENT_REFERENCE, function () {
      var children = [];
      children.push(_this.CONSUME(lexer.ArgumentReference));

      _this.OPTION1(function () {
        children.push(_this.CONSUME(lexer.MetaData));
      });

      _this.OPTION2(function () {
        children.push(_this.SUBRULE(_this.relations));
      });

      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.ARGUMENT_REFERENCE, children);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "argumentDefinition", _this.RULE(_RuleNames.RuleNames.ARGUMENT_DEFINITION, function () {
      var children = [];
      children.push(_this.CONSUME1(lexer.ArgumentDefinition));
      children.push(_this.SUBRULE2(_this.statementContent));

      _this.OPTION1(function () {
        children.push(_this.CONSUME2(lexer.MetaData));
      });

      _this.OPTION2(function () {
        children.push(_this.SUBRULE(_this.relations));
      });

      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.ARGUMENT_DEFINITION, children);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "statement", _this.RULE(_RuleNames.RuleNames.STATEMENT, function () {
      var children = [];
      children[0] = _this.OR([{
        ALT: function ALT() {
          return _this.SUBRULE1(_this.statementContent);
        }
      }, {
        ALT: function ALT() {
          return _this.CONSUME1(lexer.StatementReference);
        }
      }, {
        ALT: function ALT() {
          var children = [];
          children.push(_this.CONSUME2(lexer.StatementDefinition));
          children.push(_this.SUBRULE3(_this.statementContent));
          return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.STATEMENT_DEFINITION, children);
        }
      }]);

      _this.OPTION1(function () {
        children.push(_this.CONSUME3(lexer.MetaData));
      });

      _this.OPTION2(function () {
        children.push(_this.SUBRULE(_this.relations));
      });

      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.STATEMENT, children);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "inferenceRelations", _this.RULE("inferenceRelations", function () {
      var children = [];
      children.push(_this.CONSUME(lexer.Indent)); // OR caching. see: http://sap.github.io/chevrotain/docs/FAQ.html#major-performance-benefits

      var atLeastOne = _this.AT_LEAST_ONE(function () {
        return _this.SUBRULE(_this.outgoingUndercut);
      });

      children = children.concat(atLeastOne);
      children.push(_this.CONSUME(lexer.Dedent));
      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.RELATIONS, children);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "relations", _this.RULE(_RuleNames.RuleNames.RELATIONS, function () {
      var children = [];
      children.push(_this.CONSUME(lexer.Indent)); // OR caching. see: http://sap.github.io/chevrotain/docs/FAQ.html#major-performance-benefits

      var atLeastOne = _this.AT_LEAST_ONE(function () {
        return _this.OR(_this.c2 || (_this.c2 = [{
          ALT: function ALT() {
            return _this.SUBRULE(_this.incomingSupport);
          }
        }, {
          ALT: function ALT() {
            return _this.SUBRULE(_this.incomingAttack);
          }
        }, {
          ALT: function ALT() {
            return _this.SUBRULE(_this.outgoingSupport);
          }
        }, {
          ALT: function ALT() {
            return _this.SUBRULE(_this.outgoingAttack);
          }
        }, {
          ALT: function ALT() {
            return _this.SUBRULE(_this.contradiction);
          }
        }, {
          ALT: function ALT() {
            return _this.SUBRULE(_this.incomingUndercut);
          }
        }, {
          ALT: function ALT() {
            return _this.SUBRULE(_this.outgoingUndercut);
          }
        }]));
      });

      children = children.concat(atLeastOne);
      children.push(_this.CONSUME(lexer.Dedent));
      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.RELATIONS, children);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "incomingSupport", _this.RULE(_RuleNames.RuleNames.INCOMING_SUPPORT, function () {
      var children = [];
      children.push(_this.CONSUME(lexer.IncomingSupport));

      _this.OR({
        DEF: [{
          ALT: function ALT() {
            return children.push(_this.SUBRULE(_this.statement));
          }
        }, {
          ALT: function ALT() {
            return children.push(_this.SUBRULE(_this.argumentDefinition));
          }
        }, {
          ALT: function ALT() {
            return children.push(_this.SUBRULE(_this.argumentReference));
          }
        }]
      });

      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.INCOMING_SUPPORT, children);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "incomingAttack", _this.RULE(_RuleNames.RuleNames.INCOMING_ATTACK, function () {
      var children = [];
      children.push(_this.CONSUME(lexer.IncomingAttack));

      _this.OR({
        DEF: [{
          ALT: function ALT() {
            return children.push(_this.SUBRULE(_this.statement));
          }
        }, {
          ALT: function ALT() {
            return children.push(_this.SUBRULE(_this.argumentDefinition));
          }
        }, {
          ALT: function ALT() {
            return children.push(_this.SUBRULE(_this.argumentReference));
          }
        }]
      });

      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.INCOMING_ATTACK, children);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "incomingUndercut", _this.RULE(_RuleNames.RuleNames.INCOMING_UNDERCUT, function () {
      var children = [];
      children.push(_this.CONSUME(lexer.IncomingUndercut));

      _this.OR({
        DEF: [{
          ALT: function ALT() {
            return children.push(_this.SUBRULE(_this.argumentDefinition));
          }
        }, {
          ALT: function ALT() {
            return children.push(_this.SUBRULE(_this.argumentReference));
          }
        }]
      });

      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.INCOMING_UNDERCUT, children);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "outgoingUndercut", _this.RULE(_RuleNames.RuleNames.OUTGOING_UNDERCUT, function () {
      var children = [];
      children.push(_this.CONSUME(lexer.OutgoingUndercut));

      _this.OR({
        DEF: [{
          ALT: function ALT() {
            return children.push(_this.SUBRULE(_this.statement));
          }
        }, {
          ALT: function ALT() {
            return children.push(_this.SUBRULE(_this.argumentDefinition));
          }
        }, {
          ALT: function ALT() {
            return children.push(_this.SUBRULE(_this.argumentReference));
          }
        }]
      });

      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.OUTGOING_UNDERCUT, children);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "outgoingSupport", _this.RULE(_RuleNames.RuleNames.OUTGOING_SUPPORT, function () {
      var children = [];
      children.push(_this.CONSUME(lexer.OutgoingSupport));

      _this.OR({
        DEF: [{
          ALT: function ALT() {
            return children.push(_this.SUBRULE(_this.statement));
          }
        }, {
          ALT: function ALT() {
            return children.push(_this.SUBRULE(_this.argumentDefinition));
          }
        }, {
          ALT: function ALT() {
            return children.push(_this.SUBRULE(_this.argumentReference));
          }
        }]
      });

      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.OUTGOING_SUPPORT, children);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "outgoingAttack", _this.RULE(_RuleNames.RuleNames.OUTGOING_ATTACK, function () {
      var children = [];
      children.push(_this.CONSUME(lexer.OutgoingAttack));

      _this.OR({
        DEF: [{
          ALT: function ALT() {
            return children.push(_this.SUBRULE(_this.statement));
          }
        }, {
          ALT: function ALT() {
            return children.push(_this.SUBRULE(_this.argumentDefinition));
          }
        }, {
          ALT: function ALT() {
            return children.push(_this.SUBRULE(_this.argumentReference));
          }
        }]
      });

      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.OUTGOING_ATTACK, children);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "contradiction", _this.RULE(_RuleNames.RuleNames.CONTRADICTION, function () {
      var children = [];
      children.push(_this.CONSUME(lexer.Contradiction));
      children.push(_this.SUBRULE(_this.statement));
      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.CONTRADICTION, children);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "bold", _this.RULE(_RuleNames.RuleNames.BOLD, function () {
      var children = [];

      _this.OR([{
        ALT: function ALT() {
          children.push(_this.CONSUME(lexer.UnderscoreBoldStart));
          children.push(_this.SUBRULE1(_this.statementContent));
          children.push(_this.CONSUME(lexer.UnderscoreBoldEnd));
        }
      }, {
        ALT: function ALT() {
          children.push(_this.CONSUME(lexer.AsteriskBoldStart));
          children.push(_this.SUBRULE2(_this.statementContent));
          children.push(_this.CONSUME(lexer.AsteriskBoldEnd));
        }
      }]);

      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.BOLD, children);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "italic", _this.RULE(_RuleNames.RuleNames.ITALIC, function () {
      var children = [];

      _this.OR([{
        ALT: function ALT() {
          children.push(_this.CONSUME(lexer.UnderscoreItalicStart));
          children.push(_this.SUBRULE3(_this.statementContent));
          children.push(_this.CONSUME(lexer.UnderscoreItalicEnd));
        }
      }, {
        ALT: function ALT() {
          children.push(_this.CONSUME(lexer.AsteriskItalicStart));
          children.push(_this.SUBRULE4(_this.statementContent));
          children.push(_this.CONSUME(lexer.AsteriskItalicEnd));
        }
      }]);

      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.ITALIC, children);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "statementContent", _this.RULE(_RuleNames.RuleNames.STATEMENT_CONTENT, function () {
      var children = []; // OR caching. see: http://sap.github.io/chevrotain/docs/FAQ.html#major-performance-benefits

      var atLeastOne = _this.AT_LEAST_ONE(function () {
        return _this.OR(_this.c3 || (_this.c3 = [{
          ALT: function ALT() {
            return _this.SUBRULE(_this.freestyleText);
          }
        }, {
          ALT: function ALT() {
            return _this.CONSUME(lexer.Link);
          }
        }, {
          ALT: function ALT() {
            return _this.SUBRULE(_this.bold);
          }
        }, {
          ALT: function ALT() {
            return _this.SUBRULE(_this.italic);
          }
        }, {
          ALT: function ALT() {
            return _this.CONSUME(lexer.Tag);
          }
        }, {
          ALT: function ALT() {
            return _this.CONSUME(lexer.ArgumentMention);
          }
        }, {
          ALT: function ALT() {
            return _this.CONSUME(lexer.StatementMention);
          } // , {
          //     ALT: () => children.push(this.CONSUME(lexer.StatementMentionByNumber))
          // }

        }]));
      });

      children = atLeastOne;
      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.STATEMENT_CONTENT, children);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "freestyleText", _this.RULE(_RuleNames.RuleNames.FREESTYLE_TEXT, function () {
      var children = [];

      _this.AT_LEAST_ONE(function () {
        return _this.OR([{
          ALT: function ALT() {
            return children.push(_this.CONSUME(lexer.Freestyle));
          }
        }, {
          ALT: function ALT() {
            return children.push(_this.CONSUME(lexer.UnusedControlChar));
          }
        }, {
          ALT: function ALT() {
            return children.push(_this.CONSUME(lexer.EscapedChar));
          }
        }]);
      });

      return (0, _modelUtils.createRuleNode)(_RuleNames.RuleNames.FREESTYLE_TEXT, children);
    }));

    _chevrotain.Parser.performSelfAnalysis(_assertThisInitialized(_assertThisInitialized(_this)));

    return _this;
  } //caches


  return ArgdownParser;
}(_chevrotain.default.Parser);

var parser = new ArgdownParser();
exports.parser = parser;
//# sourceMappingURL=parser.js.map