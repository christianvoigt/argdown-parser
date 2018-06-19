"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TokenNames = void 0;

/**
 * The names of the tokens returned by the Argdown lexer.
 * These can be used to register [[IArgdownPlugin.tokenListeners]].
 */
var TokenNames;
exports.TokenNames = TokenNames;

(function (TokenNames) {
  TokenNames["INCOMING_SUPPORT"] = "IncomingSupport";
  TokenNames["INCOMING_ATTACK"] = "IncomingAttack";
  TokenNames["INCOMING_UNDERCUT"] = "IncomingUndercut";
  TokenNames["CONTRADICTION"] = "Contradiction";
  TokenNames["OUTGOING_SUPPORT"] = "OutgoingSupport";
  TokenNames["OUTGOING_ATTACK"] = "OutgoingAttack";
  TokenNames["OUTGOING_UNDERCUT"] = "OutgoingUndercut";
  TokenNames["FREESTYLE"] = "Freestyle";
  TokenNames["UNUSED_CONTROL_CHAR"] = "UnusedControlChar";
  TokenNames["EMPTYLINE"] = "Emptyline";
  TokenNames["NEWLINE"] = "Newline";
  TokenNames["INFERENCE_START"] = "InferenceStart";
  TokenNames["INFERENCE_END"] = "InferenceEnd";
  TokenNames["STATEMENT_DEFINITION"] = "StatementDefinition";
  TokenNames["STATEMENT_REFERENCE"] = "StatementReference";
  TokenNames["STATEMENT_MENTION"] = "StatementMention";
  TokenNames["ARGUMENT_DEFINITION"] = "ArgumentDefinition";
  TokenNames["ARGUMENT_REFERENCE"] = "ArgumentReference";
  TokenNames["ARGUMENT_MENTION"] = "ArgumentMention";
  TokenNames["INDENT"] = "Indent";
  TokenNames["DEDENT"] = "Dedent";
  TokenNames["FRONT_MATTER"] = "FrontMatter";
  TokenNames["META_DATA"] = "MetaData";
  TokenNames["ORDERED_LIST_ITEM"] = "OrderedListItem";
  TokenNames["UNORDERED_LIST_ITEM"] = "UnorderedListItem";
  TokenNames["HEADING_START"] = "HeadingStart";
  TokenNames["LIST_DELIMITER"] = "ListDelimiter";
  TokenNames["STATEMENT_NUMBER"] = "StatementNumber";
  TokenNames["ASTERISK_BOLD_START"] = "AsteriskBoldStart";
  TokenNames["ASTERISK_BOLD_END"] = "AsteriskBoldEnd";
  TokenNames["ASTERISK_ITALIC_START"] = "AsteriskItalicStart";
  TokenNames["ASTERISK_ITALIC_END"] = "AsteriskItalicEnd";
  TokenNames["UNDERSCORE_BOLD_START"] = "UnderscoreBoldStart";
  TokenNames["UNDERSCORE_BOLD_END"] = "UnderscoreBoldEnd";
  TokenNames["UNDERSCORE_ITALIC_START"] = "UnderscoreItalicStart";
  TokenNames["UNDERSCORE_ITALIC_END"] = "UnderscoreItalicEnd";
  TokenNames["COMMENT"] = "Comment";
  TokenNames["TAG"] = "Tag";
  TokenNames["LINK"] = "Link";
  TokenNames["ESCAPED_CHAR"] = "EscapedChar";
  TokenNames["SPACES"] = "Spaces";
})(TokenNames || (exports.TokenNames = TokenNames = {}));
//# sourceMappingURL=TokenNames.js.map