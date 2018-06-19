"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StatementRole = exports.RangeType = exports.RelationType = exports.ArgdownTypes = void 0;

/**
 * All data objects stored in the [[IArgdownResponse]] are simple object literals implementing an interface.
 * You can simply instantiate an argument, statement or relation by creating an object literal and adding properties to it.
 *
 * To support runtime type checking, each of these objects has a required `obj.type` property with its own ArgdownTypes member as type.
 * Typescript will automatically narrow the type if you check if some object's type property is equal to a specific ArgdownTypes member.
 *
 * @example
 * ```javascript
 * // Instantiate a new statement by using an object literal:
 * const obj = {
 *  type: ArgdownTypes.STATEMENT,
 *  title: "Some title",
 *  text: "Some text"
 * }
 *
 * if(obj.type === ArgdownTypes.STATEMENT){
 *  // Because IStatement is the only type with ArgdownTypes.STATEMENT as type of its `type`property
 *  // Typescript will now know that obj is of type IStatement, you don't have to cast it explicitely.
 *  obj.tags = ["some tag"];
 *  obj.role = StatementRole.PREMISE;
 * }
 * ```
 */
var ArgdownTypes;
/**
 * The relation types of the Argdown syntax used in [[IRelation.relationType]].
 *
 * Note that ATTACK/CONTRARY and SUPPORT/ENTAILS are using the same relations symbols (- and +).
 * The difference lies in the source and target of the relations: attack and support relations
 * are dialectical relations from an argument/statement to an argument.
 *
 * An UNDERCUT is a dialectical relation between an argument/statement to an inference of an argument.
 *
 * ENTAILS, CONTRARY and CONTRADICTORY are logical relations between two statements.
 * Dialectical support and attack relations can be derived from logical statement-to-statement relations
 * if these statements are used as premises or main conclusions in arguments.
 *
 * Logical equivalence between statements is missing from this list of relation types because it is not modeled as an [[IRelation]],
 * but instead as an [[IEquivalenceClass]].
 *
 */

exports.ArgdownTypes = ArgdownTypes;

(function (ArgdownTypes) {
  ArgdownTypes["EQUIVALENCE_CLASS"] = "equivalence-class";
  ArgdownTypes["STATEMENT"] = "statement";
  ArgdownTypes["STATEMENT_REFERENCE"] = "statement-reference";
  ArgdownTypes["ARGUMENT"] = "argument";
  ArgdownTypes["RELATION"] = "relation";
  ArgdownTypes["INFERENCE"] = "inference";
  ArgdownTypes["STATEMENT_MAP_NODE"] = "statement-map-node";
  ArgdownTypes["ARGUMENT_MAP_NODE"] = "argument-map-node";
  ArgdownTypes["GROUP_MAP_NODE"] = "group-map-node";
  ArgdownTypes["MAP_EDGE"] = "map-edge";
  ArgdownTypes["SECTION"] = "section";
  ArgdownTypes["RULE_NODE"] = "rule-node";
  ArgdownTypes["TOKEN_NODE"] = "token-node";
})(ArgdownTypes || (exports.ArgdownTypes = ArgdownTypes = {}));

var RelationType;
/**
 * A formatted range of text.
 *
 * Used to save information about ranges containing bold and italic text, a mention, link or a tag.
 */

exports.RelationType = RelationType;

(function (RelationType) {
  RelationType["ATTACK"] = "attack";
  RelationType["SUPPORT"] = "support";
  RelationType["ENTAILS"] = "entails";
  RelationType["CONTRARY"] = "contrary";
  RelationType["CONTRADICTORY"] = "contradictory";
  RelationType["UNDERCUT"] = "undercut";
})(RelationType || (exports.RelationType = RelationType = {}));

var RangeType;
exports.RangeType = RangeType;

(function (RangeType) {
  RangeType["BOLD"] = "bold";
  RangeType["ITALIC"] = "italic";
  RangeType["LINK"] = "link";
  RangeType["TAG"] = "tag";
  RangeType["STATEMENT_MENTION"] = "statement-mention";
  RangeType["ARGUMENT_MENTION"] = "argument-mention";
})(RangeType || (exports.RangeType = RangeType = {}));

/**
 * The role of a statement occurrence in an Argdown document.
 *
 * If the statement is used in an argument's premise conclusion structure
 * it is either a PREMISE, PRELIMINARY_CONCLUSION or a CONCLUSION.
 *
 * If it is used to describe an argument in an argument definition, it is an ARGUMENT_DESCRIPTION.
 *
 * If it is used to define a relation it is a RELATION_STATEMENT and
 * if it is a standalone paragraph within the Argdown text it is a TOP_LEVEL_STATEMENT.
 */
var StatementRole;
/**
 * A statement used within an argument's premise-conclusion-structure ([[IArgument.pcs]])
 */

exports.StatementRole = StatementRole;

(function (StatementRole) {
  StatementRole["PREMISE"] = "premise";
  StatementRole["PRELIMINARY_CONCLUSION"] = "preliminary-conclusion";
  StatementRole["MAIN_CONCLUSION"] = "main-conclusion";
  StatementRole["ARGUMENT_DESCRIPTION"] = "argument-description";
  StatementRole["TOP_LEVEL_STATEMENT"] = "top-level-statement";
  StatementRole["RELATION_STATEMENT"] = "relation-statement";
})(StatementRole || (exports.StatementRole = StatementRole = {}));
//# sourceMappingURL=model.js.map