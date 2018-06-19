"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MapPlugin = exports.GroupMode = exports.LabelMode = exports.StatementSelectionMode = void 0;

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.map");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.string.starts-with");

require("core-js/modules/es6.number.constructor");

require("core-js/modules/es6.array.find");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.function.name");

var _ = _interopRequireWildcard(require("lodash"));

var _ArgdownPluginError = require("../ArgdownPluginError");

var _utils = require("../utils");

var _model = require("../model/model");

var _modelUtils = require("../model/model-utils");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * The StatementSelectionMode in the [[IMapSettings]] determines which statements will be added as nodes to the argument map.
 */
var StatementSelectionMode;
exports.StatementSelectionMode = StatementSelectionMode;

(function (StatementSelectionMode) {
  StatementSelectionMode["ALL"] = "all";
  StatementSelectionMode["TOP_LEVEL"] = "top-level";
  StatementSelectionMode["WITH_TITLE"] = "with-title";
  StatementSelectionMode["WITH_RELATIONS"] = "with-relations";
  StatementSelectionMode["NOT_USED_IN_ARGUMENT"] = "not-used-in-argument";
  StatementSelectionMode["WITH_MORE_THAN_ONE_RELATION"] = "with-more-than-one-relation";
})(StatementSelectionMode || (exports.StatementSelectionMode = StatementSelectionMode = {}));

var LabelMode;
exports.LabelMode = LabelMode;

(function (LabelMode) {
  LabelMode["HIDE_UNTITLED"] = "hide-untitled";
  LabelMode["TITLE"] = "title";
  LabelMode["TEXT"] = "text";
})(LabelMode || (exports.LabelMode = LabelMode = {}));

var GroupMode;
/**
 * The settings for the [[MapPlugin]].
 */

exports.GroupMode = GroupMode;

(function (GroupMode) {
  GroupMode["HEADING"] = "heading";
  GroupMode["TAG"] = "tag";
  GroupMode["NONE"] = "none";
})(GroupMode || (exports.GroupMode = GroupMode = {}));

var defaultSettings = {
  statementSelectionMode: StatementSelectionMode.WITH_TITLE,
  argumentLabelMode: LabelMode.HIDE_UNTITLED,
  statementLabelMode: LabelMode.HIDE_UNTITLED,
  excludeDisconnected: true,
  selectElementsWithoutSection: true,
  selectElementsWithoutTag: true,
  groupMode: GroupMode.HEADING,
  groupDepth: 2,
  addTags: true
};

var MapPlugin =
/*#__PURE__*/
function () {
  function MapPlugin(config) {
    var _this = this;

    _classCallCheck(this, MapPlugin);

    _defineProperty(this, "name", "MapPlugin");

    _defineProperty(this, "defaults", void 0);

    _defineProperty(this, "getSettings", function (request) {
      var r = request;

      if (r.map) {
        return r.map;
      } else {
        r.map = {};
        return r.map;
      }
    });

    _defineProperty(this, "prepare", function (request, response) {
      if (!response.statements) {
        throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "No statements field in response.");
      }

      if (!response.arguments) {
        throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "No arguments field in response.");
      }

      if (!response.relations) {
        throw new _ArgdownPluginError.ArgdownPluginError(_this.name, "No relations field in response.");
      }

      _.defaultsDeep(_this.getSettings(request), _this.defaults);
    });

    _defineProperty(this, "run", function (request, response) {
      var mapResponse = response;
      mapResponse.map = _this.makeMap(request, response);
      return mapResponse;
    });

    this.defaults = _.defaultsDeep({}, config, defaultSettings);
  }

  _createClass(MapPlugin, [{
    key: "makeMap",
    value: function makeMap(request, response) {
      var settings = this.getSettings(request); // 1) Preselection round: Select elements by intrinsic criteria
      // 1.1) Preselect statements by tag and section

      var selectedStatements = Object.keys(response.statements).map(function (title) {
        return response.statements[title];
      }).filter(isPreselected(settings));
      var selectedStatementsMap = (0, _utils.reduceToMap)(selectedStatements, function (curr) {
        return curr.title;
      }); // 1.2) Preselect arguments by tag and section

      var allArguments = Object.keys(response.arguments).map(function (title) {
        return response.arguments[title];
      }); // const selectedArguments = allArguments.filter(isArgumentSelected(settings, response));

      var selectedArguments = allArguments.filter(isPreselected(settings));
      var selectedArgumentsMap = (0, _utils.reduceToMap)(selectedArguments, function (curr) {
        return curr.title;
      }); // 2) Selection round: Select elements by extrinsic criteria, taking intrinsic preselection into account
      // 2.1) Select statements from preselection based on statementSelectionMode, taking preselection into account

      selectedStatements = selectedStatements.filter(isStatementSelected(settings, selectedStatementsMap, selectedArgumentsMap));
      selectedStatementsMap = (0, _utils.reduceToMap)(selectedStatements, function (curr) {
        return curr.title;
      }); // 2.2) Select arguments from preselection, taking argument preselection and statement selection into account

      selectedArguments = selectedArguments.filter(isArgumentSelected(settings, response, selectedStatementsMap, selectedArgumentsMap));
      selectedArgumentsMap = (0, _utils.reduceToMap)(selectedArguments, function (curr) {
        return curr.title;
      }); // 3) Create nodes
      // 3.1) Create statement nodes

      var nodeCount = 0;
      var statementNodes = selectedStatements.map(createStatementNode(settings, response, nodeCount));
      var statementNodesMap = (0, _utils.reduceToMap)(statementNodes, function (curr) {
        return curr.title;
      });
      nodeCount += statementNodes.length; // 3.2) Create argument nodes

      var argumentNodes = selectedArguments.map(createArgumentNode(settings, response, nodeCount));
      var argumentNodesMap = (0, _utils.reduceToMap)(argumentNodes, function (curr) {
        return curr.title;
      });
      nodeCount += argumentNodes.length; // 3.3) Create group nodes and node tree structure

      var nodes = createMapNodeTree(settings, response, statementNodes.concat(argumentNodes)); // 4) Select relations

      var selectedRelations = response.relations.filter(isRelationSelected(response, settings, selectedStatementsMap, selectedArgumentsMap)); // 5) Create edges
      // 5.1) Create edges from relations

      var edges = selectedRelations.reduce(createEdgesFromRelation(statementNodesMap, argumentNodesMap), []); // 5.2) Create edges from equivalences

      edges.push.apply(edges, _toConsumableArray(createSupportEdgesFromEquivalences(response, edges.length, statementNodes, statementNodesMap, argumentNodes, argumentNodesMap)));
      return {
        nodes: nodes,
        edges: edges
      };
    }
  }]);

  return MapPlugin;
}();

exports.MapPlugin = MapPlugin;

var isPreselected = function isPreselected(settings) {
  return function (el) {
    var sectionSelected = !settings.selectedSections || !el.section && settings.selectElementsWithoutSection || el.section && settings.selectedSections.indexOf(el.section.title) > -1;
    var tagSelected = !settings.selectedTags || !el.tags && settings.selectElementsWithoutTag || el.tags && el.tags.find(function (t) {
      return settings.selectedTags.indexOf(t) > -1;
    });
    return sectionSelected && tagSelected;
  };
};

var untitledPattern = /^Untitled/;

var isStatementSelected = function isStatementSelected(settings, selectedStatements, selectedArguments) {
  return function (equivalenceClass) {
    var withRelations = equivalenceClass.relations.length > 0 && undefined !== equivalenceClass.relations.find(function (r) {
      return otherRelationMemberIsInSelection(r, equivalenceClass, selectedStatements, selectedArguments);
    });
    var usedInArgument = equivalenceClass.members.find(isUsedInSelectedArgument(selectedArguments));
    var inSelection = false;

    switch (settings.statementSelectionMode) {
      case StatementSelectionMode.ALL:
        inSelection = true;

      case StatementSelectionMode.WITH_TITLE:
        inSelection = !usedInArgument && withRelations || !untitledPattern.exec(equivalenceClass.title);
        break;

      case StatementSelectionMode.TOP_LEVEL:
        inSelection = !usedInArgument && withRelations || !!equivalenceClass.isUsedAsTopLevelStatement;
        break;

      case StatementSelectionMode.WITH_RELATIONS:
        inSelection = withRelations;
        break;

      case StatementSelectionMode.NOT_USED_IN_ARGUMENT:
        inSelection = !usedInArgument;
        break;

      case StatementSelectionMode.WITH_MORE_THAN_ONE_RELATION:
        var nrOfRelationPartners = equivalenceClass.relations.reduce(function (acc, r) {
          return countOtherRelationMembersInSelection(acc, r, equivalenceClass, selectedStatements, selectedArguments);
        }, 0);
        inSelection = withRelations && (!usedInArgument || nrOfRelationPartners > 1);
        break;
    }

    return (!settings.excludeDisconnected || usedInArgument || withRelations) && inSelection;
  };
};

var isUsedInSelectedArgument = function isUsedInSelectedArgument(selectedArguments) {
  return function (statement) {
    if ((0, _modelUtils.isArgumentStatement)(statement) && statement.role !== _model.StatementRole.PRELIMINARY_CONCLUSION) {
      return selectedArguments.get(statement.argumentTitle) !== undefined;
    }

    return false;
  };
};

var isArgumentStatementConnectedByEquivalence = function isArgumentStatementConnectedByEquivalence(response, s, selectedStatements, selectedArguments) {
  if (s.role === _model.StatementRole.MAIN_CONCLUSION || s.role === _model.StatementRole.PREMISE) {
    var requiredRole = _model.StatementRole.MAIN_CONCLUSION;

    if (s.role === _model.StatementRole.MAIN_CONCLUSION) {
      requiredRole = _model.StatementRole.PREMISE;
    }

    if (selectedStatements.get(s.title) !== undefined) {
      return true;
    }

    var ec = response.statements[s.title];
    return undefined !== ec.members.find(function (s) {
      return s.role === requiredRole && selectedArguments.get(s.argumentTitle) !== undefined;
    });
  }

  return false;
};
/**
 * Selects arguments if
 *  - either settings.excludeDisconnected is false
 *  - or one of the following conditions applies:
 *    - argument.relations is not empty
 *    - a premise is supported/attacked by another argument or selected statement
 *    - the main conclusion is supporting/attacking another argument or selected statement
 *    - an inference is undercut by an argument or a selected statement
 *    - implicit support: a premise is equivalent with a main conclusion of another argument or a selected statement
 *    - implicit support: the main conclusion is equivalent with a premise of another argument or a selected statement
 */


var isArgumentSelected = function isArgumentSelected(settings, response, selectedStatements, selectedArguments) {
  return function (argument) {
    if (!settings.excludeDisconnected) {
      return true;
    }

    var hasConnections = false;

    if (argument.relations && argument.relations.length > 0) {
      hasConnections = undefined !== argument.relations.find(function (r) {
        return otherRelationMemberIsInSelection(r, argument, selectedStatements, selectedArguments);
      });
    }

    if (hasConnections) {
      return true;
    }

    if (argument.pcs && argument.pcs.length > 0) {
      hasConnections = undefined !== argument.pcs.find(function (s) {
        var hasConnections = false;

        if ((0, _modelUtils.isConclusion)(s) && s.inference.relations.length > 0) {
          var inference = s.inference;
          hasConnections = undefined !== inference.relations.find(function (r) {
            return otherRelationMemberIsInSelection(r, inference, selectedStatements, selectedArguments);
          });
        }

        if (hasConnections) {
          return true;
        }

        var equivalenceClass = response.statements[s.title];

        if (equivalenceClass.relations) {
          hasConnections = undefined !== equivalenceClass.relations.find(function (r) {
            return otherRelationMemberIsInSelection(r, equivalenceClass, selectedStatements, selectedArguments);
          });

          if (hasConnections) {
            return true;
          }
        }

        if (hasConnections) {
          return true;
        }

        return isArgumentStatementConnectedByEquivalence(response, s, selectedStatements, selectedArguments);
      });
    }

    return hasConnections;
  };
};

var countOtherRelationMembersInSelection = function countOtherRelationMembersInSelection(currentCount, relation, relationMember, selectedStatements, selectedArguments) {
  var other = relation.from === relationMember ? relation.to : relation.from;

  if (other.type === _model.ArgdownTypes.EQUIVALENCE_CLASS) {
    if (selectedStatements.get(relationMember.title) === undefined) {
      return currentCount;
    }

    var role = _model.StatementRole.MAIN_CONCLUSION;

    if (relation.to === other) {
      role = _model.StatementRole.PREMISE;
    }

    return other.members.reduce(function (acc, s) {
      return s.role === role && selectedArguments.get(s.argumentTitle) !== undefined ? currentCount + 1 : currentCount;
    }, currentCount);
  } else if (other.type === _model.ArgdownTypes.ARGUMENT && selectedArguments.get(other.title) !== undefined) {
    return currentCount + 1;
  } else if (other.type === _model.ArgdownTypes.INFERENCE && selectedArguments.get(other.argumentTitle) !== undefined) {
    return currentCount + 1;
  }

  return currentCount;
};

var otherRelationMemberIsInSelection = function otherRelationMemberIsInSelection(relation, relationMember, selectedStatements, selectedArguments) {
  var other = relation.from === relationMember ? relation.to : relation.from;
  return relationMemberIsInSelection(relation, other, selectedStatements, selectedArguments);
};

var relationMemberIsInSelection = function relationMemberIsInSelection(relation, relationMember, selectedStatements, selectedArguments) {
  if (relationMember.type === _model.ArgdownTypes.EQUIVALENCE_CLASS) {
    if (selectedStatements.get(relationMember.title)) {
      return true;
    }

    var role = _model.StatementRole.MAIN_CONCLUSION;

    if (relation.to === relationMember) {
      role = _model.StatementRole.PREMISE;
    }

    return undefined !== relationMember.members.find(function (s) {
      return s.role === role && selectedArguments.get(s.argumentTitle) !== undefined;
    });
  } else if (relationMember.type === _model.ArgdownTypes.ARGUMENT && selectedArguments.get(relationMember.title)) {
    return true;
  } else if (relationMember.type === _model.ArgdownTypes.INFERENCE && selectedArguments.get(relationMember.argumentTitle)) {
    return true;
  }

  return false;
};

var isRelationSelected = function isRelationSelected(response, settings, selectedStatements, selectedArguments) {
  return function (relation) {
    return relationMemberIsInSelection(relation, relation.from, selectedStatements, selectedArguments) && relationMemberIsInSelection(relation, relation.to, selectedStatements, selectedArguments);
  };
};

var isConnectedByEquivalence = function isConnectedByEquivalence(response) {
  return function (a) {
    // a) For all premises: find out if there is an equivalent conclusion
    // b) For the main conclusion: find out if there is an equivalent premise
    if (a.pcs) {
      return undefined !== a.pcs.find(function (s1) {
        var ec1 = response.statements[s1.title];

        if (s1.role === _model.StatementRole.MAIN_CONCLUSION && ec1.isUsedAsPremise) {
          // b)
          return true;
        }

        if (s1.role === _model.StatementRole.PRELIMINARY_CONCLUSION) {
          return false;
        } // a) s1 is premise. find equivalent main conclusions


        return undefined !== ec1.members.find(function (s2) {
          if (s2.role === _model.StatementRole.MAIN_CONCLUSION) {
            return true;
          }

          return false;
        });
      });
    }

    return false;
  };
};

var createStatementNode = function createStatementNode(settings, response, initialNodeCount) {
  return function (ec, index) {
    var node = {
      type: _model.ArgdownTypes.STATEMENT_MAP_NODE,
      title: ec.title,
      id: "n" + Number(initialNodeCount + index)
    };

    if (settings.statementLabelMode !== LabelMode.TEXT || _.isEmpty(node.labelText)) {
      if (settings.statementLabelMode === LabelMode.TITLE || !ec.title.startsWith("Untitled")) {
        node.labelTitle = ec.title;
      }
    }

    if (settings.statementLabelMode !== LabelMode.TITLE) {
      node.labelText = (0, _modelUtils.getCanonicalMemberText)(ec) || undefined;
    }

    if (settings.addTags && ec.sortedTags) {
      node.tags = ec.sortedTags;
    }

    return node;
  };
};

var createArgumentNode = function createArgumentNode(settings, response, initialNodeCount) {
  return function (a, index) {
    var node = {
      title: a.title,
      type: _model.ArgdownTypes.ARGUMENT_MAP_NODE,
      id: "n" + Number(initialNodeCount + index)
    };

    if (settings.argumentLabelMode != LabelMode.TITLE) {
      node.labelText = (0, _modelUtils.getCanonicalDescriptionText)(a) || undefined;
    }

    if (settings.argumentLabelMode !== LabelMode.TEXT || _.isEmpty(node.labelText)) {
      if (!a.title.startsWith("Untitled") || settings.argumentLabelMode == LabelMode.TITLE) {
        node.labelTitle = a.title;
      }
    }

    if (settings.addTags && a.sortedTags) {
      node.tags = a.sortedTags;
    }

    return node;
  };
};

var createEdgesFromRelation = function createEdgesFromRelation(statementNodesMap, argumentNodesMap) {
  return function (acc, rel) {
    var froms = [];
    var tos = [];

    if (rel.from.type === _model.ArgdownTypes.ARGUMENT) {
      froms.push(argumentNodesMap.get(rel.from.title));
    } else if (rel.from.type === _model.ArgdownTypes.EQUIVALENCE_CLASS) {
      var statementNode = statementNodesMap.get(rel.from.title);

      if (statementNode) {
        froms.push(statementNode);
      } else {
        var ec = rel.from;
        ec.members.reduce(function (acc, s) {
          if (s.role === _model.StatementRole.MAIN_CONCLUSION) {
            var node = argumentNodesMap.get(s.argumentTitle);

            if (node) {
              acc.push(node);
            }
          }

          return acc;
        }, froms);
      }
    }

    if (rel.to.type === _model.ArgdownTypes.ARGUMENT) {
      tos.push(argumentNodesMap.get(rel.to.title));
    } else if (rel.to.type === _model.ArgdownTypes.INFERENCE) {
      var argumentNode = argumentNodesMap.get(rel.to.argumentTitle);
      tos.push(argumentNode);
    } else if (rel.to.type === _model.ArgdownTypes.EQUIVALENCE_CLASS) {
      var _statementNode = statementNodesMap.get(rel.to.title);

      if (_statementNode) {
        tos.push(_statementNode);
      } else {
        var _ec = rel.to;

        _ec.members.reduce(function (acc, s) {
          if (s.role === _model.StatementRole.PREMISE) {
            var node = argumentNodesMap.get(s.argumentTitle);

            if (node) {
              acc.push(node);
            }
          }

          return acc;
        }, tos);
      }
    }

    for (var _i = 0; _i < froms.length; _i++) {
      var from = froms[_i];

      for (var _i2 = 0; _i2 < tos.length; _i2++) {
        var to = tos[_i2];
        var edge1 = {
          type: _model.ArgdownTypes.MAP_EDGE,
          from: from,
          to: to,
          id: "e" + Number(acc.length + 1),
          relationType: rel.relationType
        };
        acc.push(edge1);

        if (rel.from.type === _model.ArgdownTypes.EQUIVALENCE_CLASS) {
          edge1.fromEquivalenceClass = rel.from;
        }

        if (rel.to.type === _model.ArgdownTypes.EQUIVALENCE_CLASS) {
          edge1.toEquivalenceClass = rel.to;
        }

        if (rel.relationType === _model.RelationType.CONTRADICTORY) {
          edge1.relationType = _model.RelationType.ATTACK;
          var edge2 = {
            type: _model.ArgdownTypes.MAP_EDGE,
            from: to,
            to: from,
            id: "e" + Number(acc.length + 1),
            relationType: _model.RelationType.ATTACK,
            fromEquivalenceClass: edge1.toEquivalenceClass,
            toEquivalenceClass: edge1.fromEquivalenceClass
          };
          acc.push(edge2);
        } else if (rel.relationType === _model.RelationType.CONTRARY) {
          edge1.relationType = _model.RelationType.ATTACK;
        } else if (rel.relationType === _model.RelationType.ENTAILS) {
          edge1.relationType = _model.RelationType.SUPPORT;
        }
      }
    }

    return acc;
  };
};
/**
 * Add implicit support edges derived from statement-statement equivalences:
 * 1. For all argument-nodes: Create support edges for conclusion-in-argument-node +> statement-node equivalences
 * 2. For all argument-nodes: Create support edges for conclusion-in-argument-node +> premise-in-argument-node
 * 3. For all statement-nodes: Create support edges for statement-node +> premise-in-argument-node equivalences
 **/


var createSupportEdgesFromEquivalences = function createSupportEdgesFromEquivalences(response, initialEdgeCount, statementNodes, statementNodesMap, argumentNodes, argumentNodesMap) {
  var edges = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = argumentNodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var argumentNode = _step.value;
      var argument = response.arguments[argumentNode.title];

      if (argument.pcs.length == 0) {
        continue;
      }

      var conclusion = argument.pcs[argument.pcs.length - 1];
      var ec = response.statements[conclusion.title];
      var statementNode = statementNodesMap.get(conclusion.title); // 1)

      if (statementNode) {
        edges.push({
          type: _model.ArgdownTypes.MAP_EDGE,
          relationType: _model.RelationType.SUPPORT,
          from: argumentNode,
          to: statementNode,
          fromEquivalenceClass: ec,
          toEquivalenceClass: ec,
          id: "n" + Number(initialEdgeCount + edges.length + 1)
        });
        continue;
      } // 2)


      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = ec.members[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var statement = _step3.value;

          if (statement.role === _model.StatementRole.PREMISE) {
            var argumentNode2 = argumentNodesMap.get(statement.argumentTitle);

            if (argumentNode2) {
              edges.push({
                type: _model.ArgdownTypes.MAP_EDGE,
                relationType: _model.RelationType.SUPPORT,
                from: argumentNode,
                to: argumentNode2,
                fromEquivalenceClass: ec,
                toEquivalenceClass: ec,
                id: "n" + Number(initialEdgeCount + edges.length + 1)
              });
            }
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

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = statementNodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _statementNode2 = _step2.value;
      var _ec2 = response.statements[_statementNode2.title];
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = _ec2.members[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var _statement = _step4.value;

          if (_statement.role === _model.StatementRole.PREMISE) {
            var _argumentNode = argumentNodesMap.get(_statement.argumentTitle); // 3)


            if (_argumentNode) {
              edges.push({
                type: _model.ArgdownTypes.MAP_EDGE,
                relationType: _model.RelationType.SUPPORT,
                from: _statementNode2,
                to: _argumentNode,
                fromEquivalenceClass: _ec2,
                toEquivalenceClass: _ec2,
                id: "e" + Number(initialEdgeCount + edges.length + 1)
              });
            }
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

  return edges;
};
/**
 * Creates group nodes and returns a tree structure containing all group, statement and argument nodes of the map.
 */


var createMapNodeTree = function createMapNodeTree(settings, response, nodes) {
  if (settings.groupMode && settings.groupMode === "none") {
    return _toConsumableArray(nodes);
  }

  var groupMap = createGroups(response, nodes);

  _toConsumableArray(groupMap.values()).reduce(createAncestorGroups, groupMap);

  var groups = _toConsumableArray(groupMap.values()); //normalize group levels


  var maxGroupLevel = groups.reduce(function (acc, curr) {
    return curr.level > acc ? curr.level : acc;
  }, 0);
  var minGroupLevel = maxGroupLevel - settings.groupDepth + 1;
  var nodesWithSection = normalizeGroupLevels(minGroupLevel, groups);
  var nodesWithoutSection = nodes.filter(function (n) {
    return findSection(response, n) === undefined;
  });
  return _toConsumableArray(nodesWithSection).concat(_toConsumableArray(nodesWithoutSection));
};

var createGroups = function createGroups(response, nodes) {
  var groupMap = new Map();
  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = nodes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var node = _step5.value;
      var section = findSection(response, node);

      if (section !== undefined) {
        var group = groupMap.get(section.id);

        if (!group) {
          group = {
            type: _model.ArgdownTypes.GROUP_MAP_NODE,
            id: section.id,
            title: section.title,
            labelTitle: section.title,
            children: [],
            level: section.level,
            section: section
          };
          groupMap.set(section.id, group);

          if (section.parent) {
            group.parent = section.parent.id;
          }
        }

        group.children.push(node);
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

  return groupMap;
};

var findSection = function findSection(response, node) {
  var section = null;

  if (node.type == _model.ArgdownTypes.ARGUMENT_MAP_NODE) {
    var argument = response.arguments[node.title];
    return argument.section;
  } else {
    var equivalenceClass = response.statements[node.title];
    return equivalenceClass.section;
  }
};

var normalizeGroupLevels = function normalizeGroupLevels(minGroupLevel, groups) {
  var nodes = [];
  var _iteratorNormalCompletion6 = true;
  var _didIteratorError6 = false;
  var _iteratorError6 = undefined;

  try {
    for (var _iterator6 = groups[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
      var group = _step6.value;
      group.level = group.level - minGroupLevel;
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

  var _iteratorNormalCompletion7 = true;
  var _didIteratorError7 = false;
  var _iteratorError7 = undefined;

  try {
    for (var _iterator7 = groups[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
      var _group = _step7.value;

      if (_group.level < 0) {
        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
          for (var _iterator8 = _group.children[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var node = _step8.value;

            if (node.type !== _model.ArgdownTypes.GROUP_MAP_NODE || node.level >= 0) {
              nodes.push(node);
            }
          }
        } catch (err) {
          _didIteratorError8 = true;
          _iteratorError8 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion8 && _iterator8.return != null) {
              _iterator8.return();
            }
          } finally {
            if (_didIteratorError8) {
              throw _iteratorError8;
            }
          }
        }
      } else if (!_group.parent) {
        nodes.push(_group);
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

  return nodes;
};
/**
 * Creates all ancestor groups of a group that are not already existing
 * @param acc A map of all groups so far
 * @param curr The group
 * @returns The original group map with the new groups added
 */


var createAncestorGroups = function createAncestorGroups(groupMap, group) {
  var currentGroup = group;

  while (currentGroup.parent) {
    var parentGroup = groupMap.get(currentGroup.parent);

    if (parentGroup) {
      parentGroup.children.push(currentGroup);
      break;
    }

    var parentSection = currentGroup.section.parent;

    if (parentSection) {
      parentGroup = {
        type: _model.ArgdownTypes.GROUP_MAP_NODE,
        id: parentSection.id,
        title: parentSection.title,
        labelTitle: parentSection.title,
        children: [currentGroup],
        level: parentSection.level,
        section: parentSection
      };

      if (parentSection.parent) {
        parentGroup.parent = parentSection.parent.id;
      }

      groupMap.set(currentGroup.parent, parentGroup);
      currentGroup = parentGroup;
    }
  }

  return groupMap;
};
//# sourceMappingURL=MapPlugin.js.map