"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toJSON = void 0;

var _model = require("./model");

var _lodash = require("lodash");

var prepareStatementForJSON = function prepareStatementForJSON(s) {
  var copy = (0, _lodash.clone)(s);

  if (copy.section) {
    copy.section = copy.section.id;
  }

  return copy;
};
/**
 * Substitutes sections with their ids.
 */


var prepareArgumentForJSON = function prepareArgumentForJSON(a) {
  var copy = (0, _lodash.clone)(a);

  if (copy.section) {
    copy.section = copy.section.id;
  }

  return copy;
};

var prepareMapEdgeForJSON = function prepareMapEdgeForJSON(e) {
  var edge = {
    id: e.id,
    type: e.type,
    relationType: e.relationType
  };

  if (e.from) {
    edge.from = e.from.id;
  }

  if (e.to) {
    edge.to = e.to.id;
  }

  if (e.fromEquivalenceClass) {
    edge.fromEquivalenceClass = e.fromEquivalenceClass.title;
  }

  if (e.toEquivalenceClass) {
    edge.toEquivalenceClass = e.toEquivalenceClass.title;
  }

  return edge;
};

var prepareMapNodeForJSON = function prepareMapNodeForJSON(n) {
  var node = {
    id: n.id,
    title: n.title,
    type: n.type,
    labelTitle: n.labelTitle,
    labelText: n.labelText
  };
  return node;
};

var prepareGroupMapNodeForJSON = function prepareGroupMapNodeForJSON(n) {
  var node = {
    id: n.id,
    title: n.title,
    type: n.type,
    labelTitle: n.labelTitle,
    labelText: n.labelText,
    children: n.children,
    parent: n.parent
  };
  return node;
};

var prepareRelationForJSON = function prepareRelationForJSON(r) {
  var rel = {
    type: r.type,
    relationType: r.relationType
  };

  if (r.from) {
    rel.from = r.from.title;
    rel.fromType = r.from.type;
  }

  if (r.to) {
    rel.to = r.to.title;
    rel.toType = r.to.type;
  }

  return rel;
};
/**
 * Substitutes parent with parent's id.
 */


var prepareSectionForJSON = function prepareSectionForJSON(s) {
  var copy = (0, _lodash.clone)(s);

  if (copy.parent) {
    copy.parent = copy.parent.id;
  }

  if (copy.heading) {
    delete copy.heading;
  }

  return copy;
};

var jsonReplacer = function jsonReplacer(key, value) {
  if (value && value.type) {
    switch (value.type) {
      case _model.ArgdownTypes.ARGUMENT:
        return prepareArgumentForJSON(value);

      case _model.ArgdownTypes.ARGUMENT_MAP_NODE:
        return prepareMapNodeForJSON(value);

      case _model.ArgdownTypes.EQUIVALENCE_CLASS:
        return value;

      case _model.ArgdownTypes.GROUP_MAP_NODE:
        return prepareGroupMapNodeForJSON(value);

      case _model.ArgdownTypes.INFERENCE:
        return value;

      case _model.ArgdownTypes.MAP_EDGE:
        return prepareMapEdgeForJSON(value);

      case _model.ArgdownTypes.RELATION:
        return prepareRelationForJSON(value);

      case _model.ArgdownTypes.RULE_NODE:
        return value;

      case _model.ArgdownTypes.SECTION:
        return prepareSectionForJSON(value);

      case _model.ArgdownTypes.STATEMENT:
        return prepareStatementForJSON(value);

      case _model.ArgdownTypes.STATEMENT_MAP_NODE:
        return prepareMapNodeForJSON(value);

      default:
        return value;
    }
  }

  return value;
};

var toJSON = function toJSON(obj, replacer, space) {
  var wrapper = function wrapper(key, value) {
    if (replacer) {
      return jsonReplacer(key, replacer(key, value));
    }

    return jsonReplacer(key, value);
  };

  return JSON.stringify(obj, wrapper, space);
};

exports.toJSON = toJSON;
//# sourceMappingURL=toJSON.js.map