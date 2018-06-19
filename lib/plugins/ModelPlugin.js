"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ModelPlugin = void 0;

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.array.find");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.function.name");

var _ = _interopRequireWildcard(require("lodash"));

var _chevrotain = require("chevrotain");

var argdownLexer = _interopRequireWildcard(require("./../lexer"));

var _ArgdownPluginError = require("../ArgdownPluginError");

var _model = require("../model/model");

var _modelUtils = require("../model/model-utils");

var _RuleNames = require("../RuleNames");

var _TokenNames = require("../TokenNames");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var isModelRequest = function isModelRequest(r) {
  return r.model !== undefined;
};

var defaultSettings = {
  removeTagsFromText: false
};
/**
 * The ModelPlugin builds the basic data model from the abstract syntax tree (AST) in the [[IArgdownResponse.ast]] response property that is provided by the [[ParserPlugin]].
 * This includes the following response object properties:
 *
 *  - [[IArgdownResponse.statements]]
 *  - [[IArgdownResponse.arguments]]
 *  - [[IArgdownResponse.relations]]
 *  - [[IArgdownResponse.sections]]
 *
 * Most of the other plugins depend on the data produced by this plugin. Whenever possible plugins should use the
 * data processed by this plugin instead of working with the AST nodes directly.
 *
 * depends on data from: [[ParserPlugin]]
 */

var ModelPlugin = function ModelPlugin(config) {
  var _this = this,
      _this$tokenListeners,
      _this$ruleListeners;

  _classCallCheck(this, ModelPlugin);

  _defineProperty(this, "name", "ModelPlugin");

  _defineProperty(this, "defaults", {});

  _defineProperty(this, "ruleListeners", void 0);

  _defineProperty(this, "tokenListeners", void 0);

  _defineProperty(this, "getSettings", function (request) {
    var r = request;

    if (!r.model) {
      r.model = {};
    }

    return r.model;
  });

  _defineProperty(this, "prepare", function (request, response, logger) {
    _.defaultsDeep(_this.getSettings(request), _this.defaults);
  });

  _defineProperty(this, "run", function (request, response, logger) {
    if (!response.ast) {
      throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "No AST field in response.");
    }

    if (!response.statements) {
      throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "No statements field in response.");
    }

    if (!response.arguments) {
      throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "No arguments field in response.");
    }

    if (!response.relations) {
      throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "No relations field in response.");
    }

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = response.relations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var relation = _step.value;

        if (!relation.from) {
          throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "Relation without source.");
        }

        if (!relation.to) {
          throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "Relation without target.");
        }

        var fromIsReconstructedArgument = relation.from.type === _model.ArgdownTypes.ARGUMENT && (0, _modelUtils.isReconstructed)(relation.from);
        var toIsReconstructedArgument = relation.to.type === _model.ArgdownTypes.ARGUMENT && (0, _modelUtils.isReconstructed)(relation.to); // For reconstructed arguments: change outgoing argument relations
        // to outgoing relations of the main conclusion, removing duplicates

        if (fromIsReconstructedArgument) {
          //change relation.from to point to the argument's conclusion
          var argument = relation.from; //remove from argument

          var index = _.indexOf(argument.relations, relation);

          argument.relations.splice(index, 1);
          var conclusionStatement = argument.pcs[argument.pcs.length - 1];
          var equivalenceClass = response.statements[conclusionStatement.title]; //change to relation of main conclusion

          relation.from = equivalenceClass; //check if this relation already exists

          var relationExists = false;
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = equivalenceClass.relations[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var existingRelation = _step3.value;

              if (relation.to == existingRelation.to && relation.type === existingRelation.type) {
                var _existingRelation$occ;

                relationExists = true;

                (_existingRelation$occ = existingRelation.occurrences).push.apply(_existingRelation$occ, _toConsumableArray(relation.occurrences));

                break;
              }
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

          if (!relationExists) {
            equivalenceClass.relations.push(relation);
          } else {
            //remove relation from target
            var _index = _.indexOf(relation.to.relations, relation);

            relation.to.relations.splice(_index, 1); //remove relation from relations

            _index = _.indexOf(response.relations, relation);
            response.relations.splice(_index, 1);
          }
        } // For reconstructed arguments: change incoming undercut relations
        // to incoming relations of last inference, removing duplicates


        if (toIsReconstructedArgument) {
          var _argument = relation.to;

          var inference = _.last(_argument.pcs).inference;

          relation.to = inference; // remove relation from argument

          var _index2 = _.indexOf(_argument.relations, relation);

          _argument.relations.splice(_index2, 1);

          var _relationExists = false;
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = inference.relations[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var _existingRelation = _step4.value;

              if (relation.from == _existingRelation.from && relation.type === _existingRelation.type) {
                var _existingRelation$occ2;

                _relationExists = true;

                (_existingRelation$occ2 = _existingRelation.occurrences).push.apply(_existingRelation$occ2, _toConsumableArray(relation.occurrences));

                break;
              }
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
                _iterator4.return();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }

          if (!_relationExists) {
            inference.relations.push(relation);
          } else {
            //remove relation from source
            var _index3 = _.indexOf(relation.from.relations, relation);

            relation.from.relations.splice(_index3, 1); //remove relation from relations

            _index3 = _.indexOf(response.relations, relation);
            response.relations.splice(_index3, 1);
          }
        }
      } //Change dialectical types of statement-to-statement relations to semantic types
      //Doing this in a separate loop makes it easier to identify duplicates in the previous loop,
      //even though it is less efficient.

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

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = response.relations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var _relation = _step2.value;

        if (_relation.from.type === _model.ArgdownTypes.ARGUMENT || _relation.to.type === _model.ArgdownTypes.ARGUMENT) {
          continue;
        }

        if (_relation.relationType === _model.RelationType.SUPPORT) {
          _relation.relationType = _model.RelationType.ENTAILS;
        } else if (_relation.relationType === _model.RelationType.ATTACK) {
          _relation.relationType = _model.RelationType.CONTRARY;
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

    return response;
  });

  this.defaults = _.defaultsDeep({}, config, defaultSettings);
  this.name = "ModelPlugin";
  var $ = this;
  var statementReferencePattern = /\[(.+)\]/;
  var statementDefinitionPattern = /\[(.+)\]\:/;
  var statementMentionPattern = /\@\[(.+)\](\s?)/;
  var argumentReferencePattern = /\<(.+)\>/;
  var argumentDefinitionPattern = /\<(.+)\>\:/;
  var argumentMentionPattern = /\@\<(.+)\>(\s?)/; // const statementReferenceByNumberPattern = /\<(.+)\>\((.+)\)/;
  // const statementDefinitionByNumberPattern = /\<(.+)\>\((.+)\)\:/;
  // const statementMentionByNumberPattern = /\@\<(.+)\>\((.+)\)/;

  var linkPattern = /\[(.+)\]\((.+)\)/;
  var tagPattern = /#(?:\(([^\)]+)\)|([a-zA-z0-9-\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+))/;
  var uniqueTitleCounter = 0;

  function getUniqueTitle() {
    uniqueTitleCounter++;
    return "Untitled " + uniqueTitleCounter;
  }

  var currentStatement = null;
  var currentRelationParent = null;
  var currentArgument = null;
  var currentPCS = null;
  var currentInference = null;
  var rangesStack = [];
  var relationParentsStack = [];
  var currentRelation = null;
  var currentHeading = null;
  var currentSection = null;
  var sectionCounter = 0;

  var getRelationMember = function getRelationMember(response, relationParent) {
    var target = relationParent;

    if (relationParent.type === _model.ArgdownTypes.STATEMENT) {
      if (!relationParent.title) relationParent.title = getUniqueTitle();
      return getEquivalenceClass(response.statements, relationParent.title);
    } else {
      return target;
    }
  };

  var updateArgument = function updateArgument(argumentsDict, title) {
    if (title) {
      currentArgument = argumentsDict[title];
    }

    if (!title || !currentArgument) {
      currentArgument = {
        type: _model.ArgdownTypes.ARGUMENT,
        title: title,
        relations: [],
        descriptions: [],
        pcs: []
      };

      if (!title) {
        currentArgument.title = getUniqueTitle();
      } else {
        currentArgument.title = title;
      }

      argumentsDict[currentArgument.title] = currentArgument;
    }

    currentRelationParent = currentArgument;
    return currentArgument;
  };

  var addTags = function addTags(tags, object) {
    if (!object.tags) {
      object.tags = [];
    }

    object.tags = _.union(object.tags, tags);
  };

  var onRelationExit = function onRelationExit(request, response, node, _ref, _ref2, logger) {
    _objectDestructuringEmpty(_ref);

    _objectDestructuringEmpty(_ref2);

    var relation = node.relation;

    if (!node.children || node.children.length < 2) {
      throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "Relation without children.");
    }

    var contentNode = node.children[1];
    var content = contentNode.argument || contentNode.statement;

    if (!content) {
      throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "Relation member not found.");
    }

    var target = getRelationMember(response, content);

    if (relation) {
      if (relation.from) {
        relation.to = target;
      } else {
        relation.from = target;
      }

      var relationExists = false;
      var relationSource = relation.from;
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = relationSource.relations[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var existingRelation = _step5.value;

          if (relation.to === existingRelation.to && relation.type === existingRelation.type) {
            var _existingRelation$occ3;

            relationExists = true;

            (_existingRelation$occ3 = existingRelation.occurrences).push.apply(_existingRelation$occ3, _toConsumableArray(relation.occurrences));

            break;
          } else if (relation.relationType === _model.RelationType.CONTRADICTORY && relation.relationType === existingRelation.relationType && relation.from === existingRelation.to && relation.to === existingRelation.from) {
            var _existingRelation$occ4;

            relationExists = true;

            (_existingRelation$occ4 = existingRelation.occurrences).push.apply(_existingRelation$occ4, _toConsumableArray(relation.occurrences));

            break;
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      if (!relationExists) {
        if (!relation.from || !relation.to) {
          throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "Missing relation source or target.");
        }

        response.relations.push(relation);
        relation.from.relations.push(relation);
        relation.to.relations.push(relation);
      }
    }
  };

  this.tokenListeners = (_this$tokenListeners = {}, _defineProperty(_this$tokenListeners, _TokenNames.TokenNames.STATEMENT_DEFINITION, function (_ref3, _ref4, token, parentNode) {
    _objectDestructuringEmpty(_ref3);

    _objectDestructuringEmpty(_ref4);

    var match = statementDefinitionPattern.exec(token.image);

    if (match != null && currentStatement) {
      currentStatement.title = match[1];
      token.title = currentStatement.title;
      parentNode.statement = currentStatement;
    }
  }), _defineProperty(_this$tokenListeners, _TokenNames.TokenNames.STATEMENT_REFERENCE, function (request, response, token, parentNode) {
    var match = statementReferencePattern.exec(token.image);

    if (match != null && currentStatement) {
      currentStatement.title = match[1];
      currentStatement.isReference = true;
      token.title = currentStatement.title;
      parentNode.statement = currentStatement;
    }
  }), _defineProperty(_this$tokenListeners, _TokenNames.TokenNames.STATEMENT_MENTION, function (_ref5, _ref6, token) {
    _objectDestructuringEmpty(_ref5);

    _objectDestructuringEmpty(_ref6);

    var match = statementMentionPattern.exec(token.image);

    if (match) {
      token.title = match[1];

      if (token.image[token.image.length - 1] == " ") {
        token.trailingWhitespace = " ";
      } else {
        token.trailingWhitespace = "";
      }

      var target = currentHeading || currentStatement;

      if (target) {
        var previousText = target.text || "";
        var newText = previousText + token.image;
        target.text = newText;

        if (!target.ranges) {
          target.ranges = [];
        }

        var range = {
          type: _model.RangeType.STATEMENT_MENTION,
          title: token.title,
          start: previousText.length,
          stop: newText.length - 1
        };
        target.ranges.push(range);
      }
    }
  }), _defineProperty(_this$tokenListeners, _TokenNames.TokenNames.ARGUMENT_DEFINITION, function (_ref7, response, token, parentNode) {
    _objectDestructuringEmpty(_ref7);

    var match = argumentDefinitionPattern.exec(token.image);

    if (match != null) {
      var title = match[1];
      updateArgument(response.arguments, title);
      currentStatement = {
        type: _model.ArgdownTypes.STATEMENT,
        text: ""
      };
      currentStatement.startLine = token.startLine;
      currentStatement.endLine = token.endLine;
      currentStatement.startColumn = token.startColumn;
      currentStatement.endColumn = token.endColumn;
      currentStatement.role = _model.StatementRole.ARGUMENT_DESCRIPTION;

      if (currentSection) {
        currentStatement.section = currentSection;
      }

      currentArgument.descriptions.push(currentStatement);

      if (currentArgument.section === undefined) {
        currentArgument.section = currentStatement.section;
      }

      token.title = title;
      parentNode.argument = currentArgument;
    }
  }), _defineProperty(_this$tokenListeners, _TokenNames.TokenNames.ARGUMENT_REFERENCE, function (request, response, token, parentNode) {
    var match = argumentReferencePattern.exec(token.image);

    if (match != null) {
      var title = match[1];
      updateArgument(response.arguments, title);
      token.title = title;
      parentNode.argument = currentArgument;
    }
  }), _defineProperty(_this$tokenListeners, _TokenNames.TokenNames.ARGUMENT_MENTION, function (_ref8, _ref9, token) {
    _objectDestructuringEmpty(_ref8);

    _objectDestructuringEmpty(_ref9);

    var target = currentHeading ? currentHeading : currentStatement;
    var match = argumentMentionPattern.exec(token.image);

    if (match) {
      token.title = match[1];

      if (token.image[token.image.length - 1] == " ") {
        token.trailingWhitespace = " ";
      } else {
        token.trailingWhitespace = "";
      }

      if (target) {
        var previousText = target.text || "";
        var newText = previousText + token.image;
        target.text = newText;

        if (!target.ranges) {
          target.ranges = [];
        }

        var range = {
          type: _model.RangeType.ARGUMENT_MENTION,
          title: token.title,
          start: previousText.length,
          stop: newText.length - 1
        };
        target.ranges.push(range);
      }
    }
  }), _defineProperty(_this$tokenListeners, _TokenNames.TokenNames.LINK, function (_ref10, _ref11, token, _ref12, _ref13, logger) {
    _objectDestructuringEmpty(_ref10);

    _objectDestructuringEmpty(_ref11);

    _objectDestructuringEmpty(_ref12);

    _objectDestructuringEmpty(_ref13);

    var target = currentHeading ? currentHeading : currentStatement;

    if (!target) {
      return;
    }

    var match = linkPattern.exec(token.image);

    if (!match || match.length < 3) {
      throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "Could not match link.");
    }

    token.url = match[2];
    token.text = match[1];
    var oldText = target.text || "";
    var newText = oldText + token.text;
    target.text = newText;
    var linkRange = {
      type: "link",
      start: oldText.length,
      stop: newText.length - 1
    };
    linkRange.url = token.url;

    if (!target.ranges) {
      target.ranges = [];
    }

    target.ranges.push(linkRange);

    if (token.image[token.image.length - 1] == " ") {
      target.text += " ";
      token.trailingWhitespace = " ";
    } else {
      token.trailingWhitespace = "";
    }
  }), _defineProperty(_this$tokenListeners, _TokenNames.TokenNames.TAG, function (request, response, token, _ref14, _ref15, logger) {
    _objectDestructuringEmpty(_ref14);

    _objectDestructuringEmpty(_ref15);

    var target = currentHeading ? currentHeading : currentStatement;

    if (!target) {
      return;
    }

    var match = tagPattern.exec(token.image);

    if (!match || match.length < 2) {
      throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "Could not parse tag.");
    }

    var tag = match[1] || match[2];
    var settings = $.getSettings(request);
    token.tag = tag;

    if (!settings.removeTagsFromText) {
      var oldText = target.text || "";
      var newText = oldText + token.image;
      var tagRange = {
        type: _model.RangeType.TAG,
        start: oldText.length,
        stop: newText.length - 1
      };
      token.text = token.image;
      target.text = newText;
      tagRange.tag = token.tag;

      if (!target.ranges) {
        target.ranges = [];
      }

      target.ranges.push(tagRange);
    }

    target.tags = target.tags || [];
    var tags = target.tags;

    if (target.tags.indexOf(tag) == -1) {
      tags.push(tag);
    }

    if (response.tags.indexOf(tag) == -1) {
      response.tags.push(tag);
    }
  }), _this$tokenListeners);
  this.ruleListeners = (_this$ruleListeners = {}, _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.ARGDOWN + "Entry", function (_ref16, response) {
    _objectDestructuringEmpty(_ref16);

    response.statements = {};
    response.arguments = {};
    response.sections = [];
    response.relations = [];
    response.tags = [];
    uniqueTitleCounter = 0;
    currentHeading = null;
    currentSection = null;
    currentRelationParent = null;
    currentPCS = null;
    currentInference = null;
    currentArgument = null;
    rangesStack = [];
    relationParentsStack = [];
    currentRelation = null;
    sectionCounter = 0;
  }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.HEADING + "Entry", function (_ref17, _ref18, node) {
    _objectDestructuringEmpty(_ref17);

    _objectDestructuringEmpty(_ref18);

    currentHeading = node;
    currentHeading.text = "";
    currentHeading.ranges = [];
  }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.HEADING + "Exit", function (_ref19, response, node, _ref20, _ref21, logger) {
    _objectDestructuringEmpty(_ref19);

    _objectDestructuringEmpty(_ref20);

    _objectDestructuringEmpty(_ref21);

    if (!currentHeading) {
      throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "Missing heading.");
    }

    if (node.children) {
      var headingStart = node.children[0];
      currentHeading.level = headingStart.image.length - 1; //number of # - whitespace

      sectionCounter++;
      var sectionId = "s" + sectionCounter;
      var newSection = {
        type: _model.ArgdownTypes.SECTION,
        id: sectionId,
        level: currentHeading.level,
        title: currentHeading.text || "",
        children: []
      };
      newSection.tags = currentHeading.tags;
      newSection.ranges = currentHeading.ranges;
      newSection.startLine = node.startLine;
      newSection.startColumn = node.startColumn;
      newSection.heading = currentHeading;
      newSection.metaData = currentHeading.metaData;

      if (newSection.level > 1 && currentSection) {
        var parentSection = currentSection;

        while (parentSection.parent && parentSection.level >= newSection.level) {
          parentSection = parentSection.parent;
        }

        parentSection.children.push(newSection);
        newSection.parent = parentSection;
      } else {
        response.sections.push(newSection);
      }

      currentSection = newSection;
      currentHeading.section = newSection;
      currentHeading = null;
    }
  }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.STATEMENT + "Entry", function (_ref22, _ref23, node, parentNode) {
    _objectDestructuringEmpty(_ref22);

    _objectDestructuringEmpty(_ref23);

    currentStatement = {
      type: _model.ArgdownTypes.STATEMENT
    };

    if (parentNode.name === "argdown") {
      currentStatement.role = _model.StatementRole.TOP_LEVEL_STATEMENT;
    } else if (currentRelation) {
      currentStatement.role = _model.StatementRole.RELATION_STATEMENT;
    }

    currentRelationParent = currentStatement;
    node.statement = currentStatement;
  }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.STATEMENT + "Exit", function (_ref24, response, node) {
    _objectDestructuringEmpty(_ref24);

    var statement = node.statement;

    if (!statement) {
      return;
    }

    statement.startLine = node.startLine;
    statement.startColumn = node.startColumn;
    statement.endLine = node.endLine;
    statement.endColumn = node.endColumn;
    statement.metaData = node.metaData;

    if (!statement.title || statement.title == "") {
      statement.title = getUniqueTitle();
    }

    var equivalenceClass = getEquivalenceClass(response.statements, statement.title);
    node.equivalenceClass = equivalenceClass;

    if (statement.tags) {
      addTags(statement.tags, equivalenceClass);
    }

    if (statement.metaData) {
      equivalenceClass.metaData = _.merge(equivalenceClass.metaData, statement.metaData);
    }

    if (currentSection) {
      statement.section = currentSection;
    }

    equivalenceClass.members.push(statement);

    if (equivalenceClass.section === undefined && !statement.isReference) {
      equivalenceClass.section = statement.section;
    }

    if (statement.role === _model.StatementRole.TOP_LEVEL_STATEMENT) {
      equivalenceClass.isUsedAsTopLevelStatement = true; //members are used outside of argument reconstructions (not as premise or conclusion)
    } else if (statement.role === _model.StatementRole.RELATION_STATEMENT) {
      equivalenceClass.isUsedAsRelationStatement = true;
    }

    currentStatement = null;
  }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.PCS + "Entry", function (request, response, node, parentNode, childIndex, logger) {
    var argument = null;

    if (childIndex !== null && childIndex > 0 && parentNode && parentNode.children) {
      var precedingSibling = parentNode.children[childIndex - 1];

      if ((0, _modelUtils.isRuleNode)(precedingSibling) && (precedingSibling.name === _RuleNames.RuleNames.ARGUMENT_REFERENCE || precedingSibling.name === _RuleNames.RuleNames.ARGUMENT_DEFINITION)) {
        argument = precedingSibling.argument;
      } else if ((0, _modelUtils.isTokenNode)(precedingSibling) && (0, _chevrotain.tokenMatcher)(precedingSibling, argdownLexer.Emptyline)) {
        var precedingSibling2 = parentNode.children[childIndex - 2];

        if ((0, _modelUtils.isRuleNode)(precedingSibling2) && (precedingSibling2.name === _RuleNames.RuleNames.ARGUMENT_REFERENCE || precedingSibling2.name === _RuleNames.RuleNames.ARGUMENT_DEFINITION)) {
          argument = precedingSibling2.argument;
        }
      }
    }

    if (!argument) {
      argument = updateArgument(response.arguments);
    }

    if (currentSection) {
      argument.section = currentSection;
    } //if there is a previous reconstruction, overwrite it


    if (!argument.pcs) {
      argument.pcs = [];
    }

    if (argument.pcs.length > 0) {
      logger.log("warning", "[ModelPlugin]: Overwriting duplicate pcs: " + argument.title);
      argument.pcs = [];
    }

    node.argument = argument;
    currentPCS = argument;
  }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.PCS + "Exit", function (_ref25, response, node, _ref26, _ref27, logger) {
    _objectDestructuringEmpty(_ref25);

    _objectDestructuringEmpty(_ref26);

    _objectDestructuringEmpty(_ref27);

    var argument = node.argument;

    if (!argument) {
      throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "Missing argument.");
    }

    if (argument.pcs.length == 0) {
      throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "Missing argument statements.");
    }

    var lastStatement = argument.pcs[argument.pcs.length - 1];

    if (lastStatement.role === _model.StatementRole.PRELIMINARY_CONCLUSION) {
      lastStatement.role = _model.StatementRole.MAIN_CONCLUSION;
      var ec = response.statements[lastStatement.title];
      ec.isUsedAsMainConclusion = true;

      if (!ec.members.find(function (s) {
        return s.role === _model.StatementRole.PRELIMINARY_CONCLUSION;
      })) {
        ec.isUsedAsPreliminaryConclusion = false;
      }
    } else {
      throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "Missing main conclusions.");
    }

    argument.startLine = node.startLine;
    argument.startColumn = node.startColumn;
    argument.endLine = node.endLine;
    argument.endColumn = node.endColumn;
    currentStatement = null;
    currentArgument = null;
    currentPCS = null;
  }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.ARGUMENT_STATEMENT + "Exit", function (request, response, node, parentNode, childIndex, logger) {
    if (!currentPCS) {
      throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "Missing argument reconstruction.");
    }

    if (node.children && node.children.length > 1) {
      //first node is ArgumentStatementStart
      var statementNode = node.children[1];
      var statement = statementNode.statement;

      if (!statement) {
        throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "Missing statement.");
      }

      var ec = getEquivalenceClass(response.statements, statement.title);
      statement.role = _model.StatementRole.PREMISE;
      statement.argumentTitle = currentPCS.title;

      if (childIndex !== null && childIndex > 0 && parentNode && parentNode.children) {
        var precedingSibling = parentNode.children[childIndex - 1];

        if (precedingSibling.name === _RuleNames.RuleNames.INFERENCE) {
          // We first assume that this is a preliminary conclusion
          // If we exit the argument we will change the role of the last statement in the pcs
          statement.role = _model.StatementRole.PRELIMINARY_CONCLUSION;
          var conclusion = statement;
          ec.isUsedAsPreliminaryConclusion = true;
          conclusion.inference = precedingSibling.inference;
          conclusion.inference.conclusionIndex = currentPCS.pcs.length;
          conclusion.inference.argumentTitle = currentPCS.title;
        }
      }

      if (statement.role == _model.StatementRole.PREMISE) {
        ec.isUsedAsPremise = true;
      }

      currentPCS.pcs.push(statement);
      node.statement = statement;
      node.statementNr = currentPCS.pcs.length;
    }
  }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.INFERENCE + "Entry", function (_ref28, _ref29, node) {
    _objectDestructuringEmpty(_ref28);

    _objectDestructuringEmpty(_ref29);

    currentInference = {
      type: _model.ArgdownTypes.INFERENCE,
      relations: []
    };
    currentInference.relations = [];
    currentInference.inferenceRules = [];
    currentInference.metaData = {};
    currentInference.startLine = node.startLine;
    currentInference.startColumn = node.startColumn;
    currentInference.endLine = node.endLine;
    currentInference.endColumn = node.endColumn;
    node.inference = currentInference;
    currentRelationParent = currentInference;
    relationParentsStack.push(currentInference);
  }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.INFERENCE_RULES + "Exit", function (request, response, node) {
    if (node.children && currentInference !== null) {
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = node.children[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var child = _step6.value;

          if ((0, _modelUtils.isRuleNode)(child) && child.name == _RuleNames.RuleNames.FREESTYLE_TEXT) {
            if (!currentInference.inferenceRules) {
              currentInference.inferenceRules = [];
            }

            var text = child.text ? child.text.trim() : "";
            currentInference.inferenceRules.push(text);
          }
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }
    }
  }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.ARGUMENT_DEFINITION + "Exit", function (_ref30, _ref31, node) {
    _objectDestructuringEmpty(_ref30);

    _objectDestructuringEmpty(_ref31);

    if (node.argument) {
      var description = _.last(node.argument.descriptions);

      if (description && description.tags) {
        addTags(description.tags, node.argument);
      }

      node.argument.metaData = _.merge(node.argument.metaData, node.metaData);
    }

    currentStatement = null;
    currentArgument = null;
  }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.ARGUMENT_REFERENCE + "Exit", function (request, response, node) {
    var ruleNode = node;

    if (ruleNode.argument) {
      ruleNode.argument.metaData = _.merge(ruleNode.argument.metaData, node.metaData);
    }

    currentStatement = null;
    currentArgument = null;
  }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.INCOMING_SUPPORT + "Entry", function (request, response, node) {
    var target = _.last(relationParentsStack);

    currentRelation = {
      type: _model.ArgdownTypes.RELATION,
      relationType: _model.RelationType.SUPPORT,
      occurrences: [node]
    };
    currentRelation.from = target;
    node.relation = currentRelation;
  }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.INCOMING_SUPPORT + "Exit", onRelationExit), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.INCOMING_ATTACK + "Entry", function (request, response, node) {
    var target = _.last(relationParentsStack);

    currentRelation = {
      type: _model.ArgdownTypes.RELATION,
      relationType: _model.RelationType.ATTACK,
      occurrences: [node]
    };
    currentRelation.from = target;
    node.relation = currentRelation;
  }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.INCOMING_ATTACK + "Exit", onRelationExit), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.OUTGOING_SUPPORT + "Entry", function (request, response, node) {
    var target = _.last(relationParentsStack);

    currentRelation = {
      type: _model.ArgdownTypes.RELATION,
      relationType: _model.RelationType.SUPPORT,
      occurrences: [node]
    };
    currentRelation.to = target;
    node.relation = currentRelation;
  }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.OUTGOING_SUPPORT + "Exit", onRelationExit), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.OUTGOING_ATTACK + "Entry", function (_ref32, _ref33, node) {
    _objectDestructuringEmpty(_ref32);

    _objectDestructuringEmpty(_ref33);

    var target = _.last(relationParentsStack);

    currentRelation = {
      type: _model.ArgdownTypes.RELATION,
      relationType: _model.RelationType.ATTACK,
      occurrences: [node]
    };
    currentRelation.to = target;
    node.relation = currentRelation;
  }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.OUTGOING_ATTACK + "Exit", onRelationExit), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.CONTRADICTION + "Entry", function (request, response, node) {
    var target = _.last(relationParentsStack);

    currentRelation = {
      type: _model.ArgdownTypes.RELATION,
      relationType: _model.RelationType.CONTRADICTORY,
      occurrences: [node]
    };
    currentRelation.from = target;
    node.relation = currentRelation;
  }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.CONTRADICTION + "Exit", onRelationExit), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.OUTGOING_UNDERCUT + "Entry", function (_ref34, _ref35, node) {
    _objectDestructuringEmpty(_ref34);

    _objectDestructuringEmpty(_ref35);

    var target = _.last(relationParentsStack);

    currentRelation = {
      type: _model.ArgdownTypes.RELATION,
      relationType: _model.RelationType.UNDERCUT,
      occurrences: [node]
    };

    if (currentRelationParent && currentRelationParent.type === _model.ArgdownTypes.STATEMENT) {
      //const inference = (<Statement>currentRelationParent).inference!; // this is not working as statement has no inference yet
      if (currentInference) {
        currentRelation.to = currentInference;
      } else {
        throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "Missing inference.");
      }
    } else {
      currentRelation.to = target;
    }

    node.relation = currentRelation;
  }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.OUTGOING_UNDERCUT + "Exit", onRelationExit), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.INCOMING_UNDERCUT + "Entry", function (_ref36, _ref37, node) {
    _objectDestructuringEmpty(_ref36);

    _objectDestructuringEmpty(_ref37);

    var target = _.last(relationParentsStack);

    currentRelation = {
      type: _model.ArgdownTypes.RELATION,
      relationType: _model.RelationType.UNDERCUT,
      occurrences: [node]
    };
    currentRelation.from = target;
    node.relation = currentRelation;
  }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.INCOMING_UNDERCUT + "Exit", onRelationExit), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.RELATIONS + "Entry", function (_ref38, response, _ref39, _ref40, _ref41, logger) {
    _objectDestructuringEmpty(_ref38);

    _objectDestructuringEmpty(_ref39);

    _objectDestructuringEmpty(_ref40);

    _objectDestructuringEmpty(_ref41);

    if (!currentRelationParent) {
      throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "Parent of relation missing.");
    }

    relationParentsStack.push(getRelationMember(response, currentRelationParent));
  }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.RELATIONS + "Exit", function () {
    currentRelation = null;
    relationParentsStack.pop();
  }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.FREESTYLE_TEXT + "Entry", function (request, response, node) {
    var target = currentHeading ? currentHeading : currentStatement;
    node.text = "";

    if (node.children) {
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = node.children[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var child = _step7.value;

          if ((0, _modelUtils.isTokenNode)(child) && child.image !== undefined) {
            if ((0, _chevrotain.tokenMatcher)(child, argdownLexer.EscapedChar)) {
              node.text += child.image.substring(1, child.image.length);
            } else {
              node.text += child.image;
            }
          }
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return != null) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }
    }

    if (target) {
      target.text = target.text || "";
      target.text += node.text;
    }
  }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.ITALIC + "Entry", function () {
    var target = currentHeading ? currentHeading : currentStatement;

    if (!target) {
      return;
    }

    var startPos = target.text ? target.text.length : 0;
    var italicRange = {
      type: _model.RangeType.ITALIC,
      start: startPos,
      stop: startPos
    };
    rangesStack.push(italicRange);

    if (!target.ranges) {
      target.ranges = [];
    }

    target.ranges.push(italicRange);
  }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.ITALIC + "Exit", function (_ref42, _ref43, node) {
    _objectDestructuringEmpty(_ref42);

    _objectDestructuringEmpty(_ref43);

    var target = currentHeading ? currentHeading : currentStatement;

    if (!target) {
      return;
    }

    var italicEnd = _.last(node.children);

    if (italicEnd.image[italicEnd.image.length - 1] == " ") {
      target.text += " ";
      node.trailingWhitespace = " ";
    } else {
      node.trailingWhitespace = "";
    }

    var range = _.last(rangesStack);

    if (range) {
      range.stop = target.text ? target.text.length - 1 : 0;
      rangesStack.pop();
    }
  }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.BOLD + "Entry", function () {
    var target = currentHeading ? currentHeading : currentStatement;

    if (!target) {
      return;
    }

    var text = target.text || "";
    var boldRange = {
      type: _model.RangeType.BOLD,
      start: text.length,
      stop: text.length
    };
    rangesStack.push(boldRange);

    if (!target.ranges) {
      target.ranges = [];
    }

    target.ranges.push(boldRange);
  }), _defineProperty(_this$ruleListeners, _RuleNames.RuleNames.BOLD + "Exit", function (request, response, node) {
    var target = currentHeading ? currentHeading : currentStatement;

    if (!target) {
      return;
    }

    var ruleNode = node;

    var boldEnd = _.last(ruleNode.children);

    if (boldEnd && boldEnd.image[boldEnd.image.length - 1] == " ") {
      target.text += " ";
      ruleNode.trailingWhitespace = " ";
    } else {
      ruleNode.trailingWhitespace = "";
    }

    var range = _.last(rangesStack);

    if (range) {
      range.stop = target.text ? target.text.length - 1 : 0;
      rangesStack.pop();
    }
  }), _this$ruleListeners);
};

exports.ModelPlugin = ModelPlugin;

var getEquivalenceClass = function getEquivalenceClass(statements, title) {
  var ec = null;
  ec = statements[title];

  if (!ec) {
    ec = (0, _modelUtils.createEquivalenceClass)(title);
    statements[title] = ec;
  }

  return ec;
};
//# sourceMappingURL=ModelPlugin.js.map