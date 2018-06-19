"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RuleNames = void 0;

/**
 * The names of the Argdown syntax rules.
 * The parser plugin returns an abstract syntax tree in [[IArgdownResponse.ast]] in which each node is either an [[IRuleNode]] with one of these names or an [[ITokenNode]].
 * These names can be used to register [[IArgdownPlugin.ruleListeners]]:
 * You can register listeners for each `[RuleName.SOME_RULE + "Entry"]` or `[RuleName.SOME_RULE + "Exit"]`.
 */
var RuleNames;
exports.RuleNames = RuleNames;

(function (RuleNames) {
  RuleNames["ARGDOWN"] = "argdown";
  RuleNames["HEADING"] = "heading";
  RuleNames["PCS"] = "pcs";
  RuleNames["PCS_TAIL"] = "pcsTail";
  RuleNames["ARGUMENT_STATEMENT"] = "argumentStatement";
  RuleNames["INFERENCE"] = "inference";
  RuleNames["INFERENCE_RULES"] = "inferenceRules";
  RuleNames["ORDERED_LIST"] = "orderedList";
  RuleNames["UNORDERED_LIST"] = "unorderedList";
  RuleNames["ORDERED_LIST_ITEM"] = "orderedListItem";
  RuleNames["UNORDERED_LIST_ITEM"] = "unorderedListItem";
  RuleNames["ARGUMENT_REFERENCE"] = "argumentReference";
  RuleNames["ARGUMENT_DEFINITION"] = "argumentDefinition";
  RuleNames["STATEMENT_REFERENCE"] = "statementReference";
  RuleNames["STATEMENT"] = "statement";
  RuleNames["STATEMENT_CONTENT"] = "statementContent";
  RuleNames["STATEMENT_DEFINITION"] = "statementDefinition";
  RuleNames["RELATIONS"] = "relations";
  RuleNames["INCOMING_ATTACK"] = "incomingAttack";
  RuleNames["INCOMING_SUPPORT"] = "incomingSupport";
  RuleNames["INCOMING_UNDERCUT"] = "incomingUndercut";
  RuleNames["CONTRADICTION"] = "contradiction";
  RuleNames["OUTGOING_ATTACK"] = "outgoingAttack";
  RuleNames["OUTGOING_SUPPORT"] = "outgoingSupport";
  RuleNames["OUTGOING_UNDERCUT"] = "outgoingUndercut";
  RuleNames["BOLD"] = "bold";
  RuleNames["ITALIC"] = "italic";
  RuleNames["FREESTYLE_TEXT"] = "freestyleText";
})(RuleNames || (exports.RuleNames = RuleNames = {}));
//# sourceMappingURL=RuleNames.js.map