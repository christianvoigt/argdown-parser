"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isArgumentStatement = exports.isConclusion = exports.isReconstructed = exports.createEquivalenceClass = exports.isTokenNode = exports.isRuleNode = exports.createRuleNode = exports.relationToString = exports.edgeToString = exports.getCanonicalDescriptionText = exports.getCanonicalDescription = exports.getCanonicalMemberText = exports.getCanonicalMember = void 0;

var _model = require("./model");

/**
 * Provides a default statement that can be used to reqpresent this equivalence class.
 * The statement chosen is the one that occurs last in the Argdown source code.
 */
var getCanonicalMember = function getCanonicalMember(ec) {
  if (!ec.members || ec.members.length <= 0) {
    return undefined;
  }

  for (var i = ec.members.length - 1; i >= 0; i--) {
    var current = ec.members[i];

    if (!current.isReference) {
      return current;
    }
  }
};
/**
 * Convenience method that directly returns the text of the equivalence class's canonical statement.
 */


exports.getCanonicalMember = getCanonicalMember;

var getCanonicalMemberText = function getCanonicalMemberText(ec) {
  var statement = getCanonicalMember(ec);

  if (statement) {
    return statement.text;
  }
};
/**
 * Provides a default description.
 * Chooses the last description defined in the Argdown source code.
 */


exports.getCanonicalMemberText = getCanonicalMemberText;

var getCanonicalDescription = function getCanonicalDescription(a) {
  if (!a.descriptions || a.descriptions.length <= 0) {
    return undefined;
  }

  return a.descriptions[a.descriptions.length - 1];
};

exports.getCanonicalDescription = getCanonicalDescription;

var getCanonicalDescriptionText = function getCanonicalDescriptionText(a) {
  var s = getCanonicalDescription(a);

  if (s) {
    return s.text;
  }
};

exports.getCanonicalDescriptionText = getCanonicalDescriptionText;

var edgeToString = function edgeToString(e) {
  return "Edge(type: ".concat(e.type, " from: ").concat(e.from.title, " to: ").concat(e.to.title, ")");
};

exports.edgeToString = edgeToString;

var relationToString = function relationToString(r) {
  return "Relation(from: ".concat(r.from.title, ", to: ").concat(r.to.title, ", type: ").concat(r.type, ")");
};

exports.relationToString = relationToString;

var createRuleNode = function createRuleNode(name, children) {
  var firstChild = children[0];
  var lastChild = children[children.length - 1];
  return {
    type: _model.ArgdownTypes.RULE_NODE,
    name: name,
    startLine: firstChild.startLine,
    startColumn: firstChild.startColumn,
    endLine: lastChild.endLine,
    endColumn: lastChild.endColumn,
    children: children
  };
};

exports.createRuleNode = createRuleNode;

var isRuleNode = function isRuleNode(n) {
  return n.type === _model.ArgdownTypes.RULE_NODE;
};

exports.isRuleNode = isRuleNode;

var isTokenNode = function isTokenNode(n) {
  return !n.type && n.tokenType != null;
};

exports.isTokenNode = isTokenNode;

var createEquivalenceClass = function createEquivalenceClass(title) {
  return {
    type: _model.ArgdownTypes.EQUIVALENCE_CLASS,
    title: title,
    relations: [],
    members: []
  };
};

exports.createEquivalenceClass = createEquivalenceClass;

var isReconstructed = function isReconstructed(a) {
  return a.pcs !== undefined && a.pcs.length > 0;
};

exports.isReconstructed = isReconstructed;

var isConclusion = function isConclusion(s) {
  return (s.role === _model.StatementRole.PRELIMINARY_CONCLUSION || s.role === _model.StatementRole.MAIN_CONCLUSION) && s.inference != undefined;
};

exports.isConclusion = isConclusion;

var isArgumentStatement = function isArgumentStatement(s) {
  return s.role === _model.StatementRole.PREMISE || s.role === _model.StatementRole.PRELIMINARY_CONCLUSION || s.role == _model.StatementRole.MAIN_CONCLUSION;
};

exports.isArgumentStatement = isArgumentStatement;
//# sourceMappingURL=model-utils.js.map