"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

var _Statement = require("../model/Statement.js");

var _Argument = require("../model/Argument.js");

var _Relation = require("../model/Relation.js");

var _Section = require("../model/Section.js");

var _EquivalenceClass = require("../model/EquivalenceClass.js");

var _chevrotain = require("chevrotain");

var _ArgdownLexer = require("./../ArgdownLexer.js");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RelationObjectTypes = Object.freeze({
  STATEMENT: Symbol("STATEMENT"),
  RECONSTRUCTED_ARGUMENT: Symbol("RECONSTRUCTED ARGUMENT"),
  SKETCHED_ARGUMENT: Symbol("SKETCHED ARGUMENT")
});

var ModelPlugin = function () {
  _createClass(ModelPlugin, [{
    key: "getSettings",
    value: function getSettings(request) {
      if (!request.model) {
        request.model = {};
      }
      return request.model;
    }
  }, {
    key: "prepare",
    value: function prepare(request) {
      _.defaultsDeep(this.getSettings(request), this.defaults);
    }
  }, {
    key: "run",
    value: function run(request, response) {
      if (response.relations) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = response.relations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var relation = _step.value;

            var fromType = this.getElementType(relation.from);
            var toType = this.getElementType(relation.to);

            // For reconstructed arguments: change outgoing argument relations
            // to outgoing relations of the main conclusion, removing duplicates
            if (fromType == RelationObjectTypes.RECONSTRUCTED_ARGUMENT) {
              //change relation.from to point to the argument's conclusion
              var argument = relation.from;

              //remove from argument
              var index = _.indexOf(argument.relations, relation);
              argument.relations.splice(index, 1);

              var conclusionStatement = argument.pcs[relation.from.pcs.length - 1];
              var equivalenceClass = response.statements[conclusionStatement.title];
              //change to relation of main conclusion
              relation.from = equivalenceClass;

              //check if this relation already exists
              var relationExists = false;
              var _iteratorNormalCompletion3 = true;
              var _didIteratorError3 = false;
              var _iteratorError3 = undefined;

              try {
                for (var _iterator3 = equivalenceClass.relations[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                  var existingRelation = _step3.value;

                  if (relation.to == existingRelation.to && relation.type == existingRelation.type) {
                    relationExists = true;
                    break;
                  }
                }
              } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion3 && _iterator3.return) {
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
                relation.to.relations.splice(_index, 1);
                //remove relation from relations
                _index = _.indexOf(response.relations, relation);
                response.relations.splice(_index, 1);
              }
            }
            //Add relation status: "Reconstructed" for statement-to-statement relations, "sketched" for all others
            if (fromType == RelationObjectTypes.SKETCHED_ARGUMENT || toType == RelationObjectTypes.RECONSTRUCTED_ARGUMENT || toType == RelationObjectTypes.SKETCHED_ARGUMENT) {
              relation.status = "sketched";
            } else if (fromType == RelationObjectTypes.STATEMENT || fromType == RelationObjectTypes.RECONSTRUCTED_ARGUMENT) {
              relation.status = "reconstructed";
            }
          }
          //Change dialectical types of statement-to-statement relations to semantic types
          //Doing this in a separate loop makes it easier to identify duplicates in the previous loop,
          //even though it is less efficient.
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
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

            if (_relation.status == "sketched") {
              continue;
            }
            if (_relation.type == "support") {
              _relation.type = "entails";
            } else if (_relation.type == "attack") {
              _relation.type = "contrary";
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }

      return response;
    }
  }, {
    key: "getElementType",
    value: function getElementType(obj) {
      if (obj instanceof _Argument.Argument) {
        if (obj.pcs && obj.pcs.length > 0) {
          return RelationObjectTypes.RECONSTRUCTED_ARGUMENT;
        } else {
          return RelationObjectTypes.SKETCHED_ARGUMENT;
        }
      } else if (obj instanceof _EquivalenceClass.EquivalenceClass) {
        return RelationObjectTypes.STATEMENT;
      }
      return null;
    }
  }]);

  function ModelPlugin(config) {
    _classCallCheck(this, ModelPlugin);

    var defaultSettings = {
      removeTagsFromText: false
    };
    this.defaults = _.defaultsDeep({}, config, defaultSettings);
    this.name = "ModelPlugin";
    var $ = this;

    var statementReferencePattern = /\[(.+)\]/;
    var statementDefinitionPattern = /\[(.+)\]\:/;
    var statementMentionPattern = /\@\[(.+)\](\s?)/;
    var argumentReferencePattern = /\<(.+)\>/;
    var argumentDefinitionPattern = /\<(.+)\>\:/;
    var argumentMentionPattern = /\@\<(.+)\>(\s?)/;
    // const statementReferenceByNumberPattern = /\<(.+)\>\((.+)\)/;
    // const statementDefinitionByNumberPattern = /\<(.+)\>\((.+)\)\:/;
    // const statementMentionByNumberPattern = /\@\<(.+)\>\((.+)\)/;
    var linkPattern = /\[(.+)\]\((.+)\)/;
    var tagPattern = /#(?:\(([^\)]+)\)|([a-zA-z0-9-\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+))/;

    var uniqueTitleCounter = 0;
    function getUniqueTitle() {
      uniqueTitleCounter++;
      return "Untitled " + uniqueTitleCounter;
    }
    function getEquivalenceClass(response, title) {
      if (!title) {
        return null;
      }
      var ec = null;
      ec = response.statements[title];
      if (!ec) {
        ec = new _EquivalenceClass.EquivalenceClass();
        ec.title = title;
        response.statements[title] = ec;
      }
      return ec;
    }

    var currentStatement = null;
    var currentStatementOrArgument = null;
    var currentArgument = null;
    var currentArgumentReconstruction = null;
    var currentInference = null;
    var rangesStack = [];
    var parentsStack = [];
    var currentRelation = null;
    var inStatementTree = false;
    var currentHeading = null;
    var currentSection = null;
    var sectionCounter = 0;

    function onArgdownEntry(request, response) {
      if (request.model) {
        $.config = request.model;
      }
      response.statements = {};
      response.arguments = {};
      response.sections = [];
      response.relations = [];
      response.tags = [];
      uniqueTitleCounter = 0;
      currentHeading = null;
      currentSection = null;
      currentStatementOrArgument = null;
      currentArgumentReconstruction = null;
      currentInference = null;
      currentArgument = null;
      rangesStack = [];
      parentsStack = [];
      currentRelation = null;
      inStatementTree = false;
      sectionCounter = 0;
    }
    function onStatementEntry(request, response, node, parentNode) {
      currentStatement = new _Statement.Statement();
      if (parentNode.name == "argdown") {
        currentStatement.isRootOfStatementTree = true;
        inStatementTree = true;
      } else if (inStatementTree) {
        currentStatement.isChildOfStatementTree = true;
      }
      currentStatementOrArgument = currentStatement;
      node.statement = currentStatement;
    }
    function onStatementExit(request, response, node) {
      var statement = node.statement;
      statement.startLine = node.startLine;
      statement.startColumn = node.startColumn;
      statement.endLine = node.endLine;
      statement.endColumn = node.endColumn;
      if (!statement.title || statement.title == "") {
        statement.title = getUniqueTitle();
      }
      if (statement.isRootOfStatementTree) {
        inStatementTree = false;
      }
      // //If we are in an argument reconstruction, we have to get argument title and statement number
      // //getEquivalenceClass will look for equivalenceClasses that were already defined by using a reference to this argumentStatement

      // if (currentArgumentReconstruction && !currentRelation) {
      //   node.argumentTitle = currentArgumentReconstruction.title;
      //   node.statementNumber = currentArgumentReconstruction.pcs.length + 1;
      // }
      var equivalenceClass = getEquivalenceClass(response, statement.title);
      node.equivalenceClass = equivalenceClass;
      if (statement.tags) {
        addTags(statement.tags, equivalenceClass);
      }
      if (!_.isEmpty(statement.text)) {
        if (currentSection) {
          statement.section = currentSection;
        }
        equivalenceClass.members.push(statement);
      }
      if (statement.isRootOfStatementTree) {
        equivalenceClass.isUsedAsRootOfStatementTree = true; //members are used outside of argument reconstructions (not as premise or conclusion)
      } else if (statement.isChildOfStatementTree) {
        equivalenceClass.isUsedAsChildOfStatementTree = true;
      }
      currentStatement = null;
    }
    function onStatementDefinitionEntry(request, response, node, parentNode) {
      var match = statementDefinitionPattern.exec(node.image);
      if (match != null) {
        currentStatement.title = match[1];
        node.title = currentStatement.title;
        parentNode.statement = currentStatement;
      }
    }
    // function onStatementDefinitionByNumberEntry(node){
    //   let match = statementDefinitionByNumberPattern.exec(node.image);
    //   if (match != null) {
    //     node.statementUsedInArgument = match[1];
    //     node.statementNumber = match[2];
    //     node.statement = currentStatement;
    //   }
    // }
    function onStatementReferenceEntry(request, response, node, parentNode) {
      var match = statementReferencePattern.exec(node.image);
      if (match != null) {
        currentStatement.title = match[1];
        node.title = currentStatement.title;
        parentNode.statement = currentStatement;
      }
    }
    // function onStatementReferenceByNumberEntry(node) {
    //   let match = statementReferenceByNumberPattern.exec(node.image);
    //   if (match != null) {
    //     node.statementUsedInArgument = match[1];
    //     node.statementNumber = match[2];
    //     node.statement = currentStatement;
    //   }
    // }
    function onStatementMentionExit(request, response, node) {
      var target = currentHeading ? currentHeading : currentStatement;
      var match = statementMentionPattern.exec(node.image);
      if (match) {
        node.title = match[1];
        if (node.image[node.image.length - 1] == " ") {
          node.trailingWhitespace = " ";
        } else {
          node.trailingWhitespace = "";
        }
        if (target) {
          var range = {
            type: "statement-mention",
            title: node.title,
            start: target.text.length
          };
          target.text += node.image;
          range.stop = target.text.length - 1;
          target.ranges.push(range);
        }
      }
    }
    // function onStatementMentionByNumberExit(node) {
    //   const target = (currentHeading) ? currentHeading : currentStatement;
    //   let match = statementMentionByNumberPattern.exec(node.image);
    //   if (match) {
    //     node.argumentTitle = match[1];
    //     node.statementNumber = match[2];
    //     if (node.image[node.image.length - 1] == " ") {
    //       node.trailingWhitespace = ' ';
    //     } else {
    //       node.trailingWhitespace = '';
    //     }
    //     if (target) {
    //       let range = { type: 'statement-mention-by-number', argumentTitle: node.title, statementNumber: node.statementNumber, start: target.text.length };
    //       target.text += node.image;
    //       range.stop = target.text.length - 1;
    //       target.ranges.push(range);
    //     }
    //   }
    // }
    function updateArgument(response, title) {
      if (title) {
        currentArgument = response.arguments[title];
      }
      if (!title || !currentArgument) {
        currentArgument = new _Argument.Argument();
        if (!title) {
          currentArgument.title = getUniqueTitle();
        } else {
          currentArgument.title = title;
        }
        response.arguments[currentArgument.title] = currentArgument;
      }
      currentStatementOrArgument = currentArgument;
      return currentArgument;
    }
    function addTags(tags, object) {
      if (!object.tags) {
        object.tags = [];
      }
      object.tags = _.union(object.tags, tags);
    }
    function onArgumentDefinitionEntry(request, response, node, parentNode) {
      var match = argumentDefinitionPattern.exec(node.image);
      if (match != null) {
        var title = match[1];
        updateArgument(response, title);
        currentStatement = new _Statement.Statement();
        currentStatement.startLine = node.startLine;
        currentStatement.endLine = node.endLine;
        currentStatement.startColumn = node.startColumn;
        currentStatement.endColumn = node.endColumn;
        currentStatement.role = "argument-description";
        if (currentSection) {
          currentStatement.section = currentSection;
        }
        currentArgument.descriptions.push(currentStatement);
        node.title = title;
        parentNode.argument = currentArgument;
      }
    }
    function onArgumentDefinitionExit(request, response, node) {
      if (node.argument) {
        var description = _.last(node.argument.descriptions);
        if (description.tags) {
          addTags(description.tags, node.argument);
        }
      }
      currentStatement = null;
      currentArgument = null;
    }
    function onArgumentReferenceEntry(request, response, node, parentNode) {
      var match = argumentReferencePattern.exec(node.image);
      if (match != null) {
        var title = match[1];
        updateArgument(response, title);
        node.title = title;
        parentNode.argument = currentArgument;
      }
    }
    function onArgumentReferenceExit() {
      currentStatement = null;
      currentArgument = null;
    }
    function onArgumentMentionExit(request, response, node) {
      var target = currentHeading ? currentHeading : currentStatement;
      var match = argumentMentionPattern.exec(node.image);
      if (match) {
        node.title = match[1];
        if (node.image[node.image.length - 1] == " ") {
          node.trailingWhitespace = " ";
        } else {
          node.trailingWhitespace = "";
        }
        if (target) {
          var range = {
            type: "argument-mention",
            title: node.title,
            start: target.text.length
          };
          target.text += node.image;
          range.stop = target.text.length - 1;
          target.ranges.push(range);
        }
      }
    }
    function onFreestyleTextEntry(request, response, node) {
      var target = currentHeading ? currentHeading : currentStatement;
      node.text = "";
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = node.children[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var child = _step4.value;

          if ((0, _chevrotain.tokenMatcher)(child, _ArgdownLexer.ArgdownLexer.EscapedChar)) {
            node.text += child.image.substring(1, child.image.length);
          } else {
            node.text += child.image;
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      if (target) {
        target.text += node.text;
      }
    }
    function onLinkEntry(request, response, node) {
      var target = currentHeading ? currentHeading : currentStatement;
      if (!target) {
        return;
      }
      var match = linkPattern.exec(node.image);
      var linkRange = { type: "link", start: target.text.length };
      node.url = match[2];
      node.text = match[1];
      target.text += node.text;
      linkRange.stop = target.text.length - 1;
      linkRange.url = node.url;
      target.ranges.push(linkRange);
      if (node.image[node.image.length - 1] == " ") {
        target.text += " ";
        node.trailingWhitespace = " ";
      } else {
        node.trailingWhitespace = "";
      }
    }
    function onTagEntry(request, response, node) {
      var target = currentHeading ? currentHeading : currentStatement;
      if (!target) {
        return;
      }
      var match = tagPattern.exec(node.image);
      var tag = match[1] || match[2];
      var settings = $.getSettings(request);
      node.tag = tag;
      if (!settings.removeTagsFromText) {
        var tagRange = { type: "tag", start: target.text.length };
        node.text = node.image;
        target.text += node.text;
        tagRange.stop = target.text.length - 1;
        tagRange.tag = node.tag;
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
    }
    function onBoldEntry() {
      var target = currentHeading ? currentHeading : currentStatement;
      if (!target) {
        return;
      }
      var boldRange = { type: "bold", start: target.text.length };
      rangesStack.push(boldRange);
      target.ranges.push(boldRange);
    }
    function onBoldExit(request, response, node) {
      var target = currentHeading ? currentHeading : currentStatement;
      if (!target) {
        return;
      }
      var boldEnd = _.last(node.children);
      if (boldEnd.image[boldEnd.image.length - 1] == " ") {
        target.text += " ";
        node.trailingWhitespace = " ";
      } else {
        node.trailingWhitespace = "";
      }
      var range = _.last(rangesStack);
      range.stop = target.text.length - 1;
      rangesStack.pop();
    }
    function onItalicEntry() {
      var target = currentHeading ? currentHeading : currentStatement;
      if (!target) {
        return;
      }
      var italicRange = { type: "italic", start: target.text.length };
      rangesStack.push(italicRange);
      target.ranges.push(italicRange);
    }
    function onItalicExit(request, response, node) {
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
      range.stop = target.text.length - 1;
      rangesStack.pop();
    }

    function onRelationExit(request, response, node) {
      var relation = node.relation;
      var contentNode = node.children[1];
      var content = contentNode.argument || contentNode.statement;
      var target = getRelationTarget(response, content);
      if (relation) {
        if (relation.from) {
          relation.to = target;
        } else {
          relation.from = target;
        }
        var relationExists = false;
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = relation.from.relations[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var existingRelation = _step5.value;

            if (relation.to == existingRelation.to && relation.type == existingRelation.type) {
              relationExists = true;
              break;
            } else if (relation.type == "contradictory" && relation.type == existingRelation.type && relation.from == existingRelation.to && relation.to == existingRelation.from) {
              relationExists = true;
              break;
            }
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }

        if (!relationExists) {
          response.relations.push(relation);
          relation.from.relations.push(relation);
          relation.to.relations.push(relation);
        }
      }
    }
    function onIncomingSupportEntry(request, response, node) {
      var target = _.last(parentsStack);
      currentRelation = new _Relation.Relation("support", node);
      currentRelation.from = target;
      node.relation = currentRelation;
    }
    function onIncomingAttackEntry(request, response, node) {
      var target = _.last(parentsStack);
      currentRelation = new _Relation.Relation("attack");
      currentRelation.from = target;
      node.relation = currentRelation;
    }
    function onOutgoingSupportEntry(request, response, node) {
      var target = _.last(parentsStack);
      currentRelation = new _Relation.Relation("support");
      currentRelation.to = target;
      node.relation = currentRelation;
    }
    function onOutgoingAttackEntry(request, response, node) {
      var target = _.last(parentsStack);
      currentRelation = new _Relation.Relation("attack");
      currentRelation.to = target;
      node.relation = currentRelation;
    }
    function onContradictionEntry(request, response, node) {
      var target = _.last(parentsStack);
      currentRelation = new _Relation.Relation("contradictory");
      currentRelation.from = target;
      node.relation = currentRelation;
    }
    function onIncomingUndercutEntry(request, response, node) {
      var target = _.last(parentsStack);
      currentRelation = new _Relation.Relation("undercut");
      currentRelation.from = target;
      node.relation = currentRelation;
    }
    function onOutgoingUndercutEntry(request, response, node) {
      var target = _.last(parentsStack);
      currentRelation = new _Relation.Relation("undercut");
      currentRelation.to = target;
      node.relation = currentRelation;
    }

    function onRelationsEntry(request, response) {
      parentsStack.push(getRelationTarget(response, currentStatementOrArgument));
    }
    function getRelationTarget(response, statementOrArgument) {
      var target = statementOrArgument;
      if (statementOrArgument instanceof _Statement.Statement) {
        if (!statementOrArgument.title) statementOrArgument.title = getUniqueTitle();
        target = getEquivalenceClass(response, statementOrArgument.title);
      }
      return target;
    }
    function onRelationsExit() {
      currentRelation = null;
      parentsStack.pop();
    }

    function onArgumentEntry(request, response, node, parentNode, childIndex) {
      var argument = null;
      if (childIndex > 0) {
        var precedingSibling = parentNode.children[childIndex - 1];
        if (precedingSibling.name == "argumentReference" || precedingSibling.name == "argumentDefinition") {
          argument = precedingSibling.argument;
        } else if ((0, _chevrotain.tokenMatcher)(precedingSibling, _ArgdownLexer.ArgdownLexer.Emptyline)) {
          precedingSibling = parentNode.children[childIndex - 2];
          if (precedingSibling.name == "argumentReference" || precedingSibling.name == "argumentDefinition") {
            argument = precedingSibling.argument;
          }
        }
      }
      if (!argument) {
        argument = updateArgument(response);
      }
      if (currentSection) {
        argument.section = currentSection;
      }
      //if there is a previous reconstruction, overwrite it
      if (argument.pcs.length > 0) {
        //TODO: throw error
        argument.pcs = [];
      }
      node.argument = argument;
      currentArgumentReconstruction = argument;
    }
    function onArgumentExit(request, response, node) {
      var argument = node.argument;
      argument.startLine = node.startLine;
      argument.startColumn = node.startColumn;
      argument.endLine = node.endLine;
      argument.endColumn = node.endColumn;
      currentStatement = null;
      currentArgument = null;
      currentArgumentReconstruction = null;
    }
    function onArgumentStatementExit(request, response, node, parentNode, childIndex) {
      if (node.children.length > 1) {
        //first node is ArgdownLexer.ArgumentStatementStart
        var statementNode = node.children[1];
        var statement = statementNode.statement;
        var ec = getEquivalenceClass(response, statement.title);
        statement.role = "premise";
        if (childIndex > 0) {
          var precedingSibling = parentNode.children[childIndex - 1];
          if (precedingSibling.name == "inference") {
            statement.role = "conclusion";
            ec.isUsedAsConclusion = true;
            statement.inference = precedingSibling.inference;
          }
        }
        if (statement.role == "premise") {
          ec.isUsedAsPremise = true;
        }
        currentArgumentReconstruction.pcs.push(statement);
        node.statement = statement;
        node.statementNr = currentArgumentReconstruction.pcs.length;
      }
    }
    function onInferenceEntry(request, response, node) {
      currentInference = {
        inferenceRules: [],
        metaData: {},
        startLine: node.startLine,
        startColumn: node.startColumn,
        endLine: node.endLine,
        endColumn: node.endColumn
      };
      node.inference = currentInference;
    }
    function onInferenceRulesExit(request, response, node) {
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = node.children[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var child = _step6.value;

          if (child.name == "freestyleText") {
            currentInference.inferenceRules.push(child.text.trim());
          }
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }
    }
    function onMetadataStatementExit(request, response, node) {
      var key = node.children[0].text;
      var value = null;
      if (node.children.length == 2) {
        value = node.children[1].text;
      } else {
        value = [];
        for (var i = 1; i < node.children.length; i++) {
          value.push(node.children[i].text);
        }
      }
      currentInference.metaData[key] = value;
    }
    function onHeadingEntry(request, response, node) {
      currentHeading = node;
      currentHeading.text = "";
      currentHeading.ranges = [];
    }
    function onHeadingExit(request, response, node) {
      var headingStart = node.children[0];
      currentHeading.level = headingStart.image.length - 1; //number of # - whitespace
      sectionCounter++;
      var sectionId = "s" + sectionCounter;
      var newSection = new _Section.Section(sectionId, currentHeading.level, currentHeading.text, currentHeading.ranges, currentHeading.tags);
      newSection.startLine = node.startLine;
      newSection.startColumn = node.startColumn;
      newSection.heading = currentHeading;

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

    this.argdownListeners = {
      argdownEntry: onArgdownEntry,
      headingEntry: onHeadingEntry,
      headingExit: onHeadingExit,
      statementEntry: onStatementEntry,
      statementExit: onStatementExit,
      argumentEntry: onArgumentEntry,
      argumentExist: onArgumentExit,
      argumentStatementExit: onArgumentStatementExit,
      inferenceEntry: onInferenceEntry,
      inferenceRulesExit: onInferenceRulesExit,
      metadataStatementExit: onMetadataStatementExit,
      StatementDefinitionEntry: onStatementDefinitionEntry,
      // StatementDefinitionByNumberEntry : onStatementDefinitionByNumberEntry,
      StatementReferenceEntry: onStatementReferenceEntry,
      // StatementReferenceByNumberEntry : onStatementReferenceByNumberEntry,
      StatementMentionExit: onStatementMentionExit,
      // StatementMentionByNumberExit : onStatementMentionByNumberExit,
      ArgumentDefinitionEntry: onArgumentDefinitionEntry,
      ArgumentReferenceEntry: onArgumentReferenceEntry,
      ArgumentMentionExit: onArgumentMentionExit,
      argumentDefinitionExit: onArgumentDefinitionExit,
      argumentReferenceExit: onArgumentReferenceExit,
      incomingSupportEntry: onIncomingSupportEntry,
      incomingSupportExit: onRelationExit,
      incomingAttackEntry: onIncomingAttackEntry,
      incomingAttackExit: onRelationExit,
      outgoingSupportEntry: onOutgoingSupportEntry,
      outgoingSupportExit: onRelationExit,
      outgoingAttackEntry: onOutgoingAttackEntry,
      outgoingAttackExit: onRelationExit,
      contradictionEntry: onContradictionEntry,
      contradictionExit: onRelationExit,
      outgoingUndercutEntry: onOutgoingUndercutEntry,
      outgoingUndercutExit: onRelationExit,
      incomingUndercutEntry: onIncomingUndercutEntry,
      incomingUndercutExit: onRelationExit,
      relationsEntry: onRelationsEntry,
      relationsExit: onRelationsExit,
      freestyleTextEntry: onFreestyleTextEntry,
      italicEntry: onItalicEntry,
      italicExit: onItalicExit,
      boldEntry: onBoldEntry,
      boldExit: onBoldExit,
      LinkEntry: onLinkEntry,
      TagEntry: onTagEntry
    };
  }

  _createClass(ModelPlugin, [{
    key: "logRelations",
    value: function logRelations(response) {
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = Object.keys(response.statements)[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var statementKey = _step7.value;

          var statement = response.statements[statementKey];
          var _iteratorNormalCompletion9 = true;
          var _didIteratorError9 = false;
          var _iteratorError9 = undefined;

          try {
            for (var _iterator9 = statement.relations[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
              var relation = _step9.value;

              if (relation.from == statement) {
                console.log("Relation from: " + relation.from.title + " to: " + relation.to.title + " type: " + relation.type);
              }
            }
          } catch (err) {
            _didIteratorError9 = true;
            _iteratorError9 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion9 && _iterator9.return) {
                _iterator9.return();
              }
            } finally {
              if (_didIteratorError9) {
                throw _iteratorError9;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }

      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = Object.keys(response.arguments)[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var argumentKey = _step8.value;

          var argument = response.arguments[argumentKey];
          var _iteratorNormalCompletion10 = true;
          var _didIteratorError10 = false;
          var _iteratorError10 = undefined;

          try {
            for (var _iterator10 = argument.relations[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
              var _relation2 = _step10.value;

              if (_relation2.from == argument) {
                console.log("Relation from: " + _relation2.from.title + " to: " + _relation2.to.title + " type: " + _relation2.type);
              }
            }
          } catch (err) {
            _didIteratorError10 = true;
            _iteratorError10 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion10 && _iterator10.return) {
                _iterator10.return();
              }
            } finally {
              if (_didIteratorError10) {
                throw _iteratorError10;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8.return) {
            _iterator8.return();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
          }
        }
      }
    }
  }]);

  return ModelPlugin;
}();

module.exports = {
  ModelPlugin: ModelPlugin,
  RelationObjectTypes: RelationObjectTypes
};
//# sourceMappingURL=ModelPlugin.js.map