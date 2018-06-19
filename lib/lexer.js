"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tokenize = exports.EOF = exports.UnusedControlChar = exports.Freestyle = exports.EscapedChar = exports.Spaces = exports.Newline = exports.Tag = exports.Link = exports.Comment = exports.UnderscoreItalicEnd = exports.UnderscoreItalicStart = exports.AsteriskItalicEnd = exports.AsteriskItalicStart = exports.UnderscoreBoldEnd = exports.UnderscoreBoldStart = exports.AsteriskBoldEnd = exports.AsteriskBoldStart = exports.HeadingStart = exports.ArgumentMention = exports.ArgumentReference = exports.ArgumentDefinition = exports.StatementNumber = exports.StatementMention = exports.StatementReference = exports.StatementDefinition = exports.Dedent = exports.Indent = exports.Emptyline = exports.UnorderedListItem = exports.OrderedListItem = exports.InferenceEnd = exports.ListDelimiter = exports.MetaData = exports.FrontMatter = exports.InferenceStart = exports.OutgoingUndercut = exports.IncomingUndercut = exports.Contradiction = exports.OutgoingAttack = exports.OutgoingSupport = exports.IncomingAttack = exports.IncomingSupport = exports.NEWLINE_GROUP = exports.tokenList = void 0;

var chevrotain = _interopRequireWildcard(require("chevrotain"));

var _ = _interopRequireWildcard(require("lodash"));

var _TokenNames = require("./TokenNames");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var createToken = chevrotain.createToken;
var createTokenInstance = chevrotain.createTokenInstance;
var tokenMatcher = chevrotain.tokenMatcher;
// State required for matching the indentations
var indentStack = []; // State required for matching bold and italic ranges in the right order

var rangesStack = [];
var tokenList = [];
exports.tokenList = tokenList;
var NEWLINE_GROUP = "NL_GROUP";
exports.NEWLINE_GROUP = NEWLINE_GROUP;

var init = function init() {
  indentStack = [0];
  rangesStack = [];
};

var getCurrentLine = function getCurrentLine(tokens, groups) {
  var nlGroup = groups[NEWLINE_GROUP];

  var matchedTokensIsEmpty = _.isEmpty(tokens);

  var nlGroupIsEmpty = _.isEmpty(nlGroup);

  if (matchedTokensIsEmpty && nlGroupIsEmpty) return 1;

  var lastToken = _.last(tokens);

  var lastNl = _.last(nlGroup);

  var currentLine = lastToken ? lastToken.endLine : 1;

  if (lastToken && chevrotain.tokenMatcher(lastToken, Emptyline)) {
    currentLine++;
  }

  if (lastNl && lastNl.endLine + 1 > currentLine) {
    currentLine = lastNl.endLine + 1;
  }

  return currentLine;
};

var getCurrentEndOffset = function getCurrentEndOffset(tokens, groups) {
  var nlGroup = groups[NEWLINE_GROUP];

  var matchedTokensIsEmpty = _.isEmpty(tokens);

  var nlGroupIsEmpty = _.isEmpty(nlGroup);

  if (matchedTokensIsEmpty && nlGroupIsEmpty) return 0;

  var lastToken = _.last(tokens);

  var lastNl = _.last(nlGroup);

  var tokenEndOffset = lastToken ? lastToken.endOffset : 0;
  var nlEndOffset = lastNl ? lastNl.endOffset : 0;
  return tokenEndOffset > nlEndOffset ? tokenEndOffset : nlEndOffset;
};

var lastTokenIsNewline = function lastTokenIsNewline(lastToken, groups) {
  var newlineGroup = groups[NEWLINE_GROUP];

  var lastNl = _.last(newlineGroup);

  return lastNl && (!lastToken || lastNl.endOffset > lastToken.endOffset);
};

var emitRemainingDedentTokens = function emitRemainingDedentTokens(matchedTokens, groups) {
  if (indentStack.length <= 1) {
    return;
  }

  var lastToken = _.last(matchedTokens);

  var startOffset = getCurrentEndOffset(matchedTokens, groups);
  var endOffset = startOffset;
  var startLine = getCurrentLine(matchedTokens, groups);
  var endLine = startLine;
  var startColumn = lastToken && lastToken.endColumn ? lastToken.endColumn : 0;
  var endColumn = startColumn; //add remaining Dedents

  while (indentStack.length > 1) {
    matchedTokens.push(createTokenInstance(Dedent, "", startOffset, endOffset, startLine, endLine, startColumn, endColumn));
    indentStack.pop();
  }
};

var emitIndentOrDedent = function emitIndentOrDedent(matchedTokens, groups, indentStr) {
  var currIndentLevel = indentStr.length;
  var lastIndentLevel = _.last(indentStack) || 0;
  var image = "";
  var startOffset = getCurrentEndOffset(matchedTokens, groups) + 1;
  var endOffset = startOffset + indentStr.length - 1;
  var startLine = getCurrentLine(matchedTokens, groups);
  var endLine = startLine;
  var startColumn = 1;
  var endColumn = startColumn + indentStr.length - 1;

  if (currIndentLevel > lastIndentLevel) {
    indentStack.push(currIndentLevel);
    var indentToken = createTokenInstance(Indent, image, startOffset, endOffset, startLine, endLine, startColumn, endColumn);
    matchedTokens.push(indentToken);
  } else if (currIndentLevel < lastIndentLevel) {
    while (indentStack.length > 1 && currIndentLevel < lastIndentLevel) {
      indentStack.pop();
      lastIndentLevel = _.last(indentStack) || 0;
      var dedentToken = createTokenInstance(Dedent, image, startOffset, endOffset, startLine, endLine, startColumn, endColumn);
      matchedTokens.push(dedentToken);
    }
  }
};

var matchRelation = function matchRelation(text, offset, tokens, groups, pattern) {
  var remainingText = text.substr(offset || 0);

  var lastToken = _.last(tokens);

  var afterNewline = lastTokenIsNewline(lastToken, groups);
  var afterEmptyline = lastToken && tokenMatcher(lastToken, Emptyline);

  if (_.isEmpty(tokens) || afterEmptyline || afterNewline) {
    //relations after Emptyline are illegal, but we need the token for error reporting
    var match = pattern.exec(remainingText);

    if (match !== null && match.length == 3) {
      var indentStr = match[1];
      emitIndentOrDedent(tokens, groups, indentStr);
      return match;
    }
  }

  return null;
}; //relations start at BOF or after a newline, optionally followed by indentation (spaces or tabs)


var matchIncomingSupport = _.partialRight(matchRelation, /^([' '\t]*)(\+>)/);

var matchIncomingAttack = _.partialRight(matchRelation, /^([' '\t]*)(->)/);

var matchOutgoingSupport = _.partialRight(matchRelation, /^([' '\t]*)(<?\+)/);

var matchOutgoingAttack = _.partialRight(matchRelation, /^([' '\t]*)(<?-)/);

var matchContradiction = _.partialRight(matchRelation, /^([' '\t]*)(><)/);

var matchIncomingUndercut = _.partialRight(matchRelation, /^([' '\t]*)(_>)/);

var matchOutgoingUndercut = _.partialRight(matchRelation, /^([' '\t]*)(<_)/);

var IncomingSupport = createToken({
  name: _TokenNames.TokenNames.INCOMING_SUPPORT,
  pattern: matchIncomingSupport,
  line_breaks: true,
  label: "+> (Incoming Support)",
  start_chars_hint: [" ", "\t", "+"]
});
exports.IncomingSupport = IncomingSupport;
tokenList.push(IncomingSupport);
var IncomingAttack = createToken({
  name: _TokenNames.TokenNames.INCOMING_ATTACK,
  pattern: matchIncomingAttack,
  line_breaks: true,
  label: "-> (Incoming Attack)",
  start_chars_hint: [" ", "\t", "-"]
});
exports.IncomingAttack = IncomingAttack;
tokenList.push(IncomingAttack);
var OutgoingSupport = createToken({
  name: _TokenNames.TokenNames.OUTGOING_SUPPORT,
  pattern: matchOutgoingSupport,
  line_breaks: true,
  label: "<+ (Outgoing Support)",
  start_chars_hint: [" ", "\t", "<"]
});
exports.OutgoingSupport = OutgoingSupport;
tokenList.push(OutgoingSupport);
var OutgoingAttack = createToken({
  name: _TokenNames.TokenNames.OUTGOING_ATTACK,
  pattern: matchOutgoingAttack,
  line_breaks: true,
  label: "<- (Outgoing Attack)",
  start_chars_hint: [" ", "\t", "<"]
});
exports.OutgoingAttack = OutgoingAttack;
tokenList.push(OutgoingAttack);
var Contradiction = createToken({
  name: _TokenNames.TokenNames.CONTRADICTION,
  pattern: matchContradiction,
  line_breaks: true,
  label: ">< (Contradiction)",
  start_chars_hint: [" ", "\t", ">"]
});
exports.Contradiction = Contradiction;
tokenList.push(Contradiction);
var IncomingUndercut = createToken({
  name: _TokenNames.TokenNames.INCOMING_UNDERCUT,
  pattern: matchIncomingUndercut,
  line_breaks: true,
  label: "_> (Incoming Undercut)",
  start_chars_hint: [" ", "\t", "_"]
});
exports.IncomingUndercut = IncomingUndercut;
tokenList.push(IncomingUndercut);
var OutgoingUndercut = createToken({
  name: _TokenNames.TokenNames.OUTGOING_UNDERCUT,
  pattern: matchOutgoingUndercut,
  line_breaks: true,
  label: "<_ (Outgoing Undercut)",
  start_chars_hint: [" ", "\t", "<"]
});
exports.OutgoingUndercut = OutgoingUndercut;
tokenList.push(OutgoingUndercut);
var inferenceStartPattern = /^[' '\t]*-{2}/;

var matchInferenceStart = function matchInferenceStart(text, offset, tokens, groups) {
  var remainingText = text.substr(offset || 0);

  var lastToken = _.last(tokens);

  var afterNewline = lastTokenIsNewline(lastToken, groups);

  if (_.isEmpty(tokens) || afterNewline) {
    var match = inferenceStartPattern.exec(remainingText);

    if (match != null) {
      emitRemainingDedentTokens(tokens, groups);
      return match;
    }
  }

  return null;
};

var InferenceStart = createToken({
  name: _TokenNames.TokenNames.INFERENCE_START,
  pattern: matchInferenceStart,
  push_mode: "inference_mode",
  line_breaks: true,
  label: "-- (Inference Start)",
  start_chars_hint: [" ", "\t", "-"]
});
exports.InferenceStart = InferenceStart;
tokenList.push(InferenceStart);
var FrontMatter = createToken({
  name: _TokenNames.TokenNames.FRONT_MATTER,
  pattern: /===[^=]*===/,
  label: "Front Matter (YAML)"
});
exports.FrontMatter = FrontMatter;
tokenList.push(FrontMatter);
var metaDataPattern = /{((?!}\s[^\,}])(.|\n))*}(?!\s*(\,|}))/; // const metaDataOpeningBracketPattern = /^[^}]*?{/;
// const metaDataClosingBracketPattern = /^[^{]*?}/;
// const matchMetaData: chevrotain.CustomPatternMatcherFunc = (text, offset, tokens, groups) => {
//   if (text.charAt(offset) !== "{" && text.length >= offset + 1) {
//     return null;
//   }
//   let remainingText = text.substr(offset + 1);
//   let result = "{";
//   let nrOfOpenBrackets = 1;
//   while (nrOfOpenBrackets > 0 && remainingText.length > 0) {
//     const nextOpeningBracket = metaDataOpeningBracketPattern.exec(remainingText);
//     if (nextOpeningBracket) {
//       result += remainingText.substr(0, nextOpeningBracket[0].length);
//       remainingText = remainingText.substr(nextOpeningBracket[0].length);
//       nrOfOpenBrackets++;
//     } else {
//       const nextClosingBracket = metaDataClosingBracketPattern.exec(remainingText);
//       if (nextClosingBracket) {
//         result += remainingText.substr(0, nextClosingBracket[0].length);
//         remainingText = remainingText.substr(nextClosingBracket[0].length);
//         nrOfOpenBrackets--;
//       } else {
//         return null;
//       }
//     }
//   }
//   if (nrOfOpenBrackets > 0) {
//     return null;
//   }
//   let match: any = [result];
//   match.index = 0;
//   let rArray = <RegExpExecArray>match;
//   return rArray;
// };

var MetaData = createToken({
  name: _TokenNames.TokenNames.META_DATA,
  pattern: /{((?!}\s[^\,}])(.|\n))*}(?!\s*(\,|}))/,
  label: "Meta Data (YAML)"
});
exports.MetaData = MetaData;
tokenList.push(MetaData);
var ListDelimiter = createToken({
  name: _TokenNames.TokenNames.LIST_DELIMITER,
  pattern: /,/,
  label: ","
});
exports.ListDelimiter = ListDelimiter;
tokenList.push(ListDelimiter); // export const Colon = createToken({
//   name: "Colon",
//   pattern: /:/,
//   label: ":"
// });
// tokens.push(Colon);
// export const MetadataStatementEnd = createToken({
//   name: "MetadataStatementEnd",
//   pattern: /;/,
//   label: ";"
// });
// tokens.push(MetadataStatementEnd);
// export const MetadataStart = createToken({
//   name: "MetadataStart",
//   pattern: /\(/,
//   label: "("
// });
// tokens.push(MetadataStart);
// export const MetadataEnd = createToken({
//   name: "MetadataEnd",
//   pattern: /\)/,
//   label: ")"
// });
// tokens.push(MetadataEnd);

var InferenceEnd = createToken({
  name: _TokenNames.TokenNames.INFERENCE_END,
  pattern: /-{2,}/,
  pop_mode: true,
  label: "-- (Inference End)"
});
exports.InferenceEnd = InferenceEnd;
tokenList.push(InferenceEnd);

var matchListItem = function matchListItem(text, offset, tokens, groups, pattern) {
  var remainingText = text.substr(offset || 0);

  var last = _.last(tokens);

  var afterNewline = lastTokenIsNewline(last, groups);
  var afterEmptyline = last && tokenMatcher(last, Emptyline);

  if (_.isEmpty(tokens) || afterEmptyline || afterNewline) {
    var match = pattern.exec(remainingText);

    if (match !== null) {
      var indentStr = match[1];
      emitIndentOrDedent(tokens, groups, indentStr);
      return match;
    }
  }

  return null;
};

var orderedListItemPattern = /^([' '\t]+)\d+\.(?=\s)/;

var matchOrderedListItem = _.partialRight(matchListItem, orderedListItemPattern);

var OrderedListItem = createToken({
  name: _TokenNames.TokenNames.ORDERED_LIST_ITEM,
  pattern: matchOrderedListItem,
  line_breaks: true,
  label: "{Indentation}{number}. (Ordered List Item)",
  start_chars_hint: [" ", "\t"]
});
exports.OrderedListItem = OrderedListItem;
tokenList.push(OrderedListItem); //whitespace + * + whitespace (to distinguish list items from bold and italic ranges)

var unorderedListItemPattern = /^([' '\t]+)\*(?=\s)/;

var matchUnorderedListItem = _.partialRight(matchListItem, unorderedListItemPattern);

var UnorderedListItem = createToken({
  name: _TokenNames.TokenNames.UNORDERED_LIST_ITEM,
  pattern: matchUnorderedListItem,
  line_breaks: true,
  label: "{Indentation}* (Unordered List Item)",
  start_chars_hint: [" ", "\t"]
});
exports.UnorderedListItem = UnorderedListItem;
tokenList.push(UnorderedListItem); //This does not work with \r\n|\n||r as a simple CRLF linebreak will be interpreted as an Emptyline
//Instead we drop the last alternative (\r?\n would work as well)

var emptylinePattern = /^((?:\r\n|\n)[ \t]*(?:\r\n|\n)+)/; //two or more linebreaks

var matchEmptyline = function matchEmptyline(text, offset, tokens, groups) {
  var remainingText = text.substr(offset || 0);

  var last = _.last(tokens); //ignore Emptylines after first one (relevant for Emptylines after ignored comments)


  if (last && tokenMatcher(last, Emptyline)) return null;
  var match = emptylinePattern.exec(remainingText);

  if (match !== null && match[0].length < remainingText.length) {
    //ignore trailing linebreaks
    emitRemainingDedentTokens(tokens, groups); //TODO: emitRemainingRanges (to be more resistant against unclosed bold and italic ranges)

    return match;
  }

  return null;
};

var Emptyline = createToken({
  name: _TokenNames.TokenNames.EMPTYLINE,
  pattern: matchEmptyline,
  line_breaks: true,
  label: "{linebreak}{linebreak} (Empty Line)",
  start_chars_hint: ["\r", "\n"]
});
exports.Emptyline = Emptyline;
tokenList.push(Emptyline); //Indent and Dedent are never matched with their own patterns, instead they get matched in the relations custom patterns

var Indent = createToken({
  name: _TokenNames.TokenNames.INDENT,
  pattern: chevrotain.Lexer.NA
});
exports.Indent = Indent;
tokenList.push(Indent);
var Dedent = createToken({
  name: _TokenNames.TokenNames.DEDENT,
  pattern: chevrotain.Lexer.NA
});
exports.Dedent = Dedent;
tokenList.push(Dedent);
var StatementDefinition = createToken({
  name: _TokenNames.TokenNames.STATEMENT_DEFINITION,
  pattern: /\[.+?\]\:/,
  label: "[Statement Title]: (Statement Definition)"
});
exports.StatementDefinition = StatementDefinition;
tokenList.push(StatementDefinition); // $.StatementDefinitionByNumber = createToken({
//     name: "StatementDefinitionByNumber",
//     pattern: /\<(.+?)\>\((\d+)\)\:/
// });
// $.tokens.push($.StatementDefinitionByNumber);

var StatementReference = createToken({
  name: _TokenNames.TokenNames.STATEMENT_REFERENCE,
  pattern: /\[.+?\]/,
  label: "[Statement Title] (Statement Reference)"
});
exports.StatementReference = StatementReference;
tokenList.push(StatementReference); // $.StatementReferenceByNumber = createToken({
//     name: "StatementReferenceByNumber",
//     pattern: /\<(.+?)\>\(\d+\)/
// });
// $.tokens.push($.StatementReferenceByNumber);

var StatementMention = createToken({
  name: _TokenNames.TokenNames.STATEMENT_MENTION,
  pattern: /\@\[.+?\][ \t]?/,
  label: "@[Statement Title] (Statement Mention)"
});
exports.StatementMention = StatementMention;
tokenList.push(StatementMention); // $.StatementMentionByNumber = createToken({
//     name: "StatementMentionByNumber",
//     pattern: /\@\<(.+?)\>\(\d+\)/
// });
// $.tokens.push($.StatementMentionByNumber);

var statementNumberPattern = /^[' '\t]*\(\d+\)/;

var matchStatementNumber = function matchStatementNumber(text, offset, tokens, groups) {
  var remainingText = text.substr(offset || 0);

  var last = _.last(tokens);

  var afterNewline = lastTokenIsNewline(last, groups);
  var afterEmptyline = last && tokenMatcher(last, Emptyline); //Statement in argument reconstruction:

  if (_.isEmpty(tokens) || afterEmptyline || afterNewline) {
    var match = statementNumberPattern.exec(remainingText);

    if (match !== null) {
      emitRemainingDedentTokens(tokens, groups);
      return match;
    }
  }

  return null;
};

var StatementNumber = createToken({
  name: _TokenNames.TokenNames.STATEMENT_NUMBER,
  pattern: matchStatementNumber,
  line_breaks: true,
  label: "(Number) (Statement Number)",
  start_chars_hint: [" ", "\t", "("]
});
exports.StatementNumber = StatementNumber;
tokenList.push(StatementNumber);
var ArgumentDefinition = createToken({
  name: _TokenNames.TokenNames.ARGUMENT_DEFINITION,
  pattern: /\<.+?\>\:/,
  label: "<Argument Title>: (Argument Definition)"
});
exports.ArgumentDefinition = ArgumentDefinition;
tokenList.push(ArgumentDefinition);
var ArgumentReference = createToken({
  name: _TokenNames.TokenNames.ARGUMENT_REFERENCE,
  pattern: /\<.+?\>/,
  label: "<Argument Title> (Argument Reference)"
});
exports.ArgumentReference = ArgumentReference;
tokenList.push(ArgumentReference);
var ArgumentMention = createToken({
  name: _TokenNames.TokenNames.ARGUMENT_MENTION,
  pattern: /\@\<.+?\>[ \t]?/,
  label: "@<Argument Title> (Argument Mention)"
});
exports.ArgumentMention = ArgumentMention;
tokenList.push(ArgumentMention);
var headingPattern = /^(#+)(?: )/;

var matchHeadingStart = function matchHeadingStart(text, offset, tokens, groups) {
  var remainingText = text.substr(offset || 0);

  var last = _.last(tokens);

  var afterEmptyline = last && tokenMatcher(last, Emptyline);

  if (!last || afterEmptyline) {
    var match = headingPattern.exec(remainingText);

    if (match) {
      return match;
    }
  }

  return null;
};

var HeadingStart = createToken({
  name: _TokenNames.TokenNames.HEADING_START,
  pattern: matchHeadingStart,
  label: "# (Heading Start)",
  start_chars_hint: ["#"]
});
exports.HeadingStart = HeadingStart;
tokenList.push(HeadingStart); //BOLD and ITALIC ranges

var matchBoldOrItalicStart = function matchBoldOrItalicStart(text, offset, tokens, groups, pattern, rangeType) {
  var remainingText = text.substr(offset || 0);
  var match = pattern.exec(remainingText);

  if (match != null) {
    rangesStack.push(rangeType);
    return match;
  }

  return null;
};

var matchBoldOrItalicEnd = function matchBoldOrItalicEnd(text, offset, tokens, groups, pattern, rangeType) {
  var lastRange = _.last(rangesStack);

  if (lastRange != rangeType) return null; //first check if the last match was skipped Whitespace

  var skipped = groups ? groups[chevrotain.Lexer.SKIPPED] : null;

  var lastSkipped = _.last(skipped);

  var lastMatched = _.last(tokens);

  if (!lastMatched || lastSkipped && lastSkipped.endOffset > lastMatched.endOffset) {
    return null;
  }

  var remainingText = text.substr(offset || 0);
  var match = pattern.exec(remainingText);

  if (match != null) {
    rangesStack.pop();
    return match;
  }

  return null;
};

var matchAsteriskBoldStart = _.partialRight(matchBoldOrItalicStart, /^\*\*(?!\s)/, "AsteriskBold");

var matchAsteriskBoldEnd = _.partialRight(matchBoldOrItalicEnd, /^\*\*(?:[ \t]|(?=\n|\r|\)|\}|\_|\.|,|!|\?|;|:|-|\*|$))/, "AsteriskBold");

var matchUnderscoreBoldStart = _.partialRight(matchBoldOrItalicStart, /^__(?!\s)/, "UnderscoreBold");

var matchUnderscoreBoldEnd = _.partialRight(matchBoldOrItalicEnd, /^__(?:[ \t]|(?=\n|\r|\)|\}|\_|\.|,|!|\?|;|:|-|\*|$))/, "UnderscoreBold");

var matchAsteriskItalicStart = _.partialRight(matchBoldOrItalicStart, /^\*(?!\s)/, "AsteriskItalic");

var matchAsteriskItalicEnd = _.partialRight(matchBoldOrItalicEnd, /^\*(?:[ \t]|(?=\n|\r|\)|\}|\_|\.|,|!|\?|;|:|-|\*|$))/, "AsteriskItalic");

var matchUnderscoreItalicStart = _.partialRight(matchBoldOrItalicStart, /^\_(?!\s)/, "UnderscoreItalic");

var matchUnderscoreItalicEnd = _.partialRight(matchBoldOrItalicEnd, /^\_(?:[ \t]|(?=\n|\r|\)|\}|\_|\.|,|!|\?|;|:|-|\*|$))/, "UnderscoreItalic");

var AsteriskBoldStart = createToken({
  name: _TokenNames.TokenNames.ASTERISK_BOLD_START,
  pattern: matchAsteriskBoldStart,
  label: "** (Bold Start)",
  start_chars_hint: ["*"]
});
exports.AsteriskBoldStart = AsteriskBoldStart;
tokenList.push(AsteriskBoldStart);
var AsteriskBoldEnd = createToken({
  name: _TokenNames.TokenNames.ASTERISK_BOLD_END,
  pattern: matchAsteriskBoldEnd,
  label: "** (Bold End)",
  start_chars_hint: ["*"]
});
exports.AsteriskBoldEnd = AsteriskBoldEnd;
tokenList.push(AsteriskBoldEnd);
var UnderscoreBoldStart = createToken({
  name: _TokenNames.TokenNames.UNDERSCORE_BOLD_START,
  pattern: matchUnderscoreBoldStart,
  label: "__ (Bold Start)",
  start_chars_hint: ["_"]
});
exports.UnderscoreBoldStart = UnderscoreBoldStart;
tokenList.push(UnderscoreBoldStart);
var UnderscoreBoldEnd = createToken({
  name: _TokenNames.TokenNames.UNDERSCORE_BOLD_END,
  pattern: matchUnderscoreBoldEnd,
  label: "__ (Bold End)",
  start_chars_hint: ["_"]
});
exports.UnderscoreBoldEnd = UnderscoreBoldEnd;
tokenList.push(UnderscoreBoldEnd);
var AsteriskItalicStart = createToken({
  name: _TokenNames.TokenNames.ASTERISK_ITALIC_START,
  pattern: matchAsteriskItalicStart,
  label: "* (Italic Start)",
  start_chars_hint: ["*"]
});
exports.AsteriskItalicStart = AsteriskItalicStart;
tokenList.push(AsteriskItalicStart);
var AsteriskItalicEnd = createToken({
  name: _TokenNames.TokenNames.ASTERISK_ITALIC_END,
  pattern: matchAsteriskItalicEnd,
  label: "* (Italic End)",
  start_chars_hint: ["*"]
});
exports.AsteriskItalicEnd = AsteriskItalicEnd;
tokenList.push(AsteriskItalicEnd);
var UnderscoreItalicStart = createToken({
  name: _TokenNames.TokenNames.UNDERSCORE_ITALIC_START,
  pattern: matchUnderscoreItalicStart,
  label: "_ (Italic Start)",
  start_chars_hint: ["_"]
});
exports.UnderscoreItalicStart = UnderscoreItalicStart;
tokenList.push(UnderscoreItalicStart);
var UnderscoreItalicEnd = createToken({
  name: _TokenNames.TokenNames.UNDERSCORE_ITALIC_END,
  pattern: matchUnderscoreItalicEnd,
  label: "_ (Italic End)",
  start_chars_hint: ["_"]
});
exports.UnderscoreItalicEnd = UnderscoreItalicEnd;
tokenList.push(UnderscoreItalicEnd);
var Comment = createToken({
  name: _TokenNames.TokenNames.COMMENT,
  pattern: /(?:<!--(?:.|\n|\r)*?-->)|(?:\/\*(?:.|\n|\r)*?\*\/)|(?:\/\/.*?(?=\r\n|\n|\r))/,
  group: chevrotain.Lexer.SKIPPED,
  line_breaks: true,
  label: "// or /**/ or <!-- --> (Comment)"
});
exports.Comment = Comment;
tokenList.push(Comment);
var Link = createToken({
  name: _TokenNames.TokenNames.LINK,
  pattern: /\[[^\]]+?\]\([^\)]+?\)[ \t]?/,
  label: "[Title](Url) (Link)"
});
exports.Link = Link;
tokenList.push(Link);
var Tag = createToken({
  name: _TokenNames.TokenNames.TAG,
  pattern: /#(?:\([^\)]+\)|[a-zA-z0-9-\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)[ \t]?/,
  label: "#tag-text or #(tag text) (Tag)"
});
exports.Tag = Tag;
tokenList.push(Tag);
var Newline = createToken({
  name: _TokenNames.TokenNames.NEWLINE,
  pattern: /(?:\r\n|\n|\r)/,
  group: "NL_GROUP",
  line_breaks: true,
  label: "{linebreak} (New Line)"
});
exports.Newline = Newline;
tokenList.push(Newline);
var Spaces = createToken({
  name: _TokenNames.TokenNames.SPACES,
  pattern: /( |\t)+/,
  group: chevrotain.Lexer.SKIPPED
});
exports.Spaces = Spaces;
tokenList.push(Spaces);
var EscapedChar = createToken({
  name: _TokenNames.TokenNames.ESCAPED_CHAR,
  pattern: /\\.(?: )*/,
  label: "\\{character} (Escaped Character)"
});
exports.EscapedChar = EscapedChar;
tokenList.push(EscapedChar); //The rest of the text that is free of any Argdown syntax

var Freestyle = createToken({
  name: _TokenNames.TokenNames.FREESTYLE,
  pattern: /[^\\\@\#\*\_\[\]\,\:\;\<\/\>\-\r\n\(\)\{\}]+/,
  line_breaks: true,
  label: "Text Content"
});
exports.Freestyle = Freestyle;
tokenList.push(Freestyle); //Freestyle text needs to be "cut up" by these control characters so that the other rules get a chance to succeed.
//Otherwise, every line would simply be lexed as a single Freestyle token.
//If these chars are not consumed by other rules, they are lexed as "useless" UnusedControlChars. The parser then has to combine Freestyle and UnusedControlChar tokens back together to get "normal text" token sequences.
//Note that some "meaningful" characters (like +) are not listed here, as they are only meaningful after a linebreak and freestyle text already gets "cut up" by each line break.

var UnusedControlChar = createToken({
  name: _TokenNames.TokenNames.UNUSED_CONTROL_CHAR,
  pattern: /[\@\#\*\_\[\]\,\:\;\<\/\>\-\(\)\{\}][ \t]?/,
  label: "Text Content (Special Characters)"
});
exports.UnusedControlChar = UnusedControlChar;
tokenList.push(UnusedControlChar);
var EOF = chevrotain.EOF;
exports.EOF = EOF;
var lexerConfig = {
  modes: {
    default_mode: [Comment, FrontMatter, MetaData, EscapedChar, //must come first after $.Comment
    Emptyline, Newline, // Relation tokens must appear before Spaces, otherwise all indentation will always be consumed as spaces.
    // Dedent must appear before Indent for handling zero spaces dedents.
    Dedent, Indent, InferenceStart, //needs to be lexed before OutgoingAttack (- vs --)
    IncomingSupport, IncomingAttack, OutgoingSupport, OutgoingAttack, Contradiction, IncomingUndercut, OutgoingUndercut, HeadingStart, //$.ArgumentStatementStart,
    StatementNumber, OrderedListItem, UnorderedListItem, //The ends of Bold and italic ranges need to be lexed before the starts
    AsteriskBoldEnd, //BoldEnd needs to be lexed before ItalicEnd (** vs *)
    UnderscoreBoldEnd, //BoldEnd needs to be lexed before ItalicEnd (__ vs _)
    AsteriskItalicEnd, UnderscoreItalicEnd, //The starts of Bold and italic ranges need to be lexed after the ends
    AsteriskBoldStart, //BoldStart needs to be lexed before ItalicStart (** vs *)
    UnderscoreBoldStart, //BoldStart needs to be lexed before ItalicStart (__ vs _)
    AsteriskItalicStart, UnderscoreItalicStart, Link, //needs to be lexed before StatementReference
    Tag, // $.StatementDefinitionByNumber, // needs to be lexed before ArgumentReference
    // $.StatementReferenceByNumber, // needs to be lexed before ArgumentReference
    // $.StatementMentionByNumber, // needs to be lexed before ArgumentReference
    StatementDefinition, StatementReference, StatementMention, ArgumentDefinition, ArgumentReference, ArgumentMention, Spaces, Freestyle, UnusedControlChar],
    inference_mode: [Newline, Comment, InferenceEnd, MetaData, ListDelimiter, Spaces, Freestyle, UnusedControlChar]
  },
  defaultMode: "default_mode"
};
var lexer = new chevrotain.Lexer(lexerConfig);

var tokenize = function tokenize(text) {
  init();
  var lexResult = lexer.tokenize(text);

  if (lexResult.errors && lexResult.errors.length > 0) {
    throw new Error("sad sad panda lexing errors detected");
  } //remove trailing Emptyline (parser cannot cope with it)


  var lastToken = _.last(lexResult.tokens);

  if (lastToken && tokenMatcher(lastToken, Emptyline)) {
    lexResult.tokens.pop();
  }

  emitRemainingDedentTokens(lexResult.tokens, lexResult.groups);
  return lexResult;
};

exports.tokenize = tokenize;
//# sourceMappingURL=lexer.js.map