"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ArgdownErrorMessageProvider = void 0;

require("core-js/modules/es6.string.ends-with");

var chevrotain = _interopRequireWildcard(require("chevrotain"));

var ArgdownLexer = _interopRequireWildcard(require("./lexer"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

//import * as _ from 'lodash';
var defaultParserErrorProvider = chevrotain.defaultParserErrorProvider;
var tokenMatcher = chevrotain.tokenMatcher; //const EOF = chevrotain.EOF;

var MISSING_TEXT_CONTENT_ERROR = "Missing text content. " + "Please add a line of text or refer to an existing statement or argument instead by replacing the content in this line with [Statement Title] or <Argument Title> (without a colon). " + "If you want to define a statement ([Statement Title]:) or argument (<Argument Title>:), the defining text content has to follow the defined element title without any empty lines in between.";
var INVALID_INFERENCE_ERROR = "Invalid inference. Inferences can either be marked by four hyphens (----) or have the following format: " + "--Inference Rule 1, Inference Rule 2 (my meta data property 1: 1, 2, 3; my meta data property 2: value) --";
var INVALID_RELATION_ERROR = "Invalid relation syntax. This may either be caused by a) an invalid relation parent or b) invalid indentation. a) Invalid relation parent: Only statements and arguments can have relations as child elements. b) Invalid Indentation tree: Please check that if there are preceding relations in this paragraph, there is at least one with equal or less indentation.";
var INVALID_INDENTATION_ERROR = "Invalid indentation.";
var MISSING_RELATION_CONTENT_ERROR = "Missing relation content. Please define or refer to a statement or argument (you can define a statement by simply adding a line of text).";
var MISSING_INFERENCE_END_ERROR = "Invalid inference syntax. Please end your inference with two hyphens (--)";
var INVALID_INFERENCE_POSITION_ERROR = "Invalid inference position. An inference may only occur within an argument reconstruction, in which it is preceded by a premise and followed by a conclusion (both of which have to be numbered statements: '(1) Statement').";
var MISSING_INFERENCE_ERROR = "Missing inference. Use four hyphens (----) between two numbered statements to insert an inference in your reconstruction and mark the latter statement as a conclusion.";
var MISSING_CONCLUSION_ERROR = "Missing conclusion. Please add a numbered statement after the inference.";
var ARGUMENT_RECONSTRUCTION_POSITION_ERROR = "Invalid position of argument reconstruction. Make sure the argument reconstruction is preceded by an empty line.";
var INVALID_ARGUMENT_STATEMENT_CONTENT_ERROR = "Invalid statement content. An argument reference (<Argument Title>) or definition (<Argument Title>:) can not be used as premise or conclusion within an argument reconstruction. Use statement references ([Statement Title]) or definitions ([Statement Title]:) instead.";
var INCOMPLETE_ARGUMENT_RECONSTRUCTION_ERROR = "Incomplete argument reconstruction. An argument reconstruction has to consist of at least one premise (a numbered statement: '(1) Statement Text'), one inference (marked by four hyphens ----) and one conclusion (a numbered statement after an inference). There may no be any empty lines between these elements.";

var GetParagraphStartTokenDescription = function GetParagraphStartTokenDescription(token) {
  if (tokenMatcher(token, ArgdownLexer.OutgoingSupport)) {
    return "an outgoing support relation (+ or <+)";
  } else if (tokenMatcher(token, ArgdownLexer.IncomingSupport)) {
    return "an incoming support relation (+>)";
  } else if (tokenMatcher(token, ArgdownLexer.OutgoingAttack)) {
    return "an outgoing attack relation (- or <-)";
  } else if (tokenMatcher(token, ArgdownLexer.IncomingAttack)) {
    return "an incoming attack relation (->)";
  } else if (tokenMatcher(token, ArgdownLexer.Contradiction)) {
    return "a contradictory relation (><)";
  } else if (tokenMatcher(token, ArgdownLexer.IncomingUndercut)) {
    return "an incoming undercut relation (_>)";
  } else if (tokenMatcher(token, ArgdownLexer.OutgoingUndercut)) {
    return "an incoming undercut relation (<_)";
  }
};

var isRelationToken = function isRelationToken(token) {
  return tokenMatcher(token, ArgdownLexer.IncomingSupport) || tokenMatcher(token, ArgdownLexer.OutgoingSupport) || tokenMatcher(token, ArgdownLexer.IncomingAttack) || tokenMatcher(token, ArgdownLexer.OutgoingAttack) || tokenMatcher(token, ArgdownLexer.IncomingUndercut) || tokenMatcher(token, ArgdownLexer.OutgoingUndercut) || tokenMatcher(token, ArgdownLexer.Contradiction);
};

var isRelationRule = function isRelationRule(ruleName) {
  return ruleName.endsWith("Support") || ruleName.endsWith("Attack") || ruleName.endsWith("Undercut") || ruleName == "Contradiction";
};

var ArgdownErrorMessageProvider =
/*#__PURE__*/
function () {
  function ArgdownErrorMessageProvider() {
    _classCallCheck(this, ArgdownErrorMessageProvider);
  }

  _createClass(ArgdownErrorMessageProvider, [{
    key: "buildMismatchTokenMessage",
    value: function buildMismatchTokenMessage(options) {
      if (options.ruleName == "inference") {
        if (options.expected == ArgdownLexer.InferenceStart) {
          return MISSING_INFERENCE_ERROR;
        } else if (options.expected == ArgdownLexer.InferenceEnd) {
          return MISSING_INFERENCE_END_ERROR;
        }
      } else if (options.expected == ArgdownLexer.Dedent && (options.ruleName == "statementRelations" || options.ruleName == "argumentRelations")) {
        if (tokenMatcher(options.actual, ArgdownLexer.ArgumentReference)) {
          return "Invalid relation text content. An argument reference (<Argument Title>) may not be preceded or followed by other content. If you want to start a new paragraph, insert an empty line before the reference. If you want to mention a statement or argument, without directly using it, use @[Statement Title] or @<Argument Title>.";
        } else if (tokenMatcher(options.actual, ArgdownLexer.ArgumentDefinition)) {
          return "Invalid relation text content. An argument definition (<Argument Title>:) may not be preceded by other content. If you want to start a new paragraph, insert an empty line before the definition. If you want to mention a statement or argument, without directly using it, use @[Statement Title] or @<Argument Title>.";
        } else if (tokenMatcher(options.actual, ArgdownLexer.StatementReference)) {
          return "Invalid relation text content. A statement reference ([Statement Title]) may not be preceded or followed by other content.  If you want to start a new paragraph, insert an empty line before the reference. If you want to mention a statement or argument, without directly using it, use @[Statement Title] or @<Argument Title>.";
        } else if (tokenMatcher(options.actual, ArgdownLexer.StatementDefinition)) {
          return "Invalid relation text content. A statement definition ([Statement Title]:) may not be preceded by other content.  If you want to start a new paragraph, insert an empty line before the definition. If you want to mention a statement or argument, without directly using it, use @[Statement Title] or @<Argument Title>.";
        } else {
          return "Invalid relation text content. Check that the content is not preceded by a statement reference ([Statement Title]) or argument reference (<Argument Title>). If you want to mention a statement or argument, without directly using it, use @[Statement Title] or @<Argument Title>.";
        }
      } else if (options.ruleName == "argumentStatement") {
        if (options.expected == ArgdownLexer.StatementNumber) {
          return MISSING_CONCLUSION_ERROR;
        }
      }

      return defaultParserErrorProvider.buildMismatchTokenMessage(options);
    }
  }, {
    key: "buildNotAllInputParsedMessage",
    value: function buildNotAllInputParsedMessage(options) {
      var tokenDescription = "";

      if (tokenMatcher(options.firstRedundant, ArgdownLexer.Indent) || isRelationToken(options.firstRedundant)) {
        return INVALID_RELATION_ERROR;
      } else if (tokenMatcher(options.firstRedundant, ArgdownLexer.InferenceStart)) {
        return INVALID_INFERENCE_POSITION_ERROR;
      } else if (tokenMatcher(options.firstRedundant, ArgdownLexer.StatementNumber)) {
        return ARGUMENT_RECONSTRUCTION_POSITION_ERROR;
      } else if (tokenMatcher(options.firstRedundant, ArgdownLexer.ArgumentReference)) {
        tokenDescription = "An argument reference (<Argument Title>)";
      } else if (tokenMatcher(options.firstRedundant, ArgdownLexer.ArgumentDefinition)) {
        tokenDescription = "An argument definition (<Argument Title>:)";
      } else if (tokenMatcher(options.firstRedundant, ArgdownLexer.StatementReference)) {
        tokenDescription = "A statement reference ([Statement Title])";
      } else if (tokenMatcher(options.firstRedundant, ArgdownLexer.StatementDefinition)) {
        tokenDescription = "A statement  definition ([Statement Title]:)";
      } else if (tokenMatcher(options.firstRedundant, ArgdownLexer.Freestyle)) {
        tokenDescription = "Invalid position of text content. Make sure it is not preceded by a statement reference ([Statement Title]) or argument reference (<Argument Title>).";
      } else {
        return defaultParserErrorProvider.buildNotAllInputParsedMessage(options);
      }

      return "Invalid element position. ".concat(tokenDescription, " may only occur at the beginning of a line or after a relation symbol.");
    }
  }, {
    key: "buildNoViableAltMessage",
    value: function buildNoViableAltMessage(options) {
      var tokens = options.actual;

      if (options.ruleName == "argdown" && tokens.length > 0) {
        var tokenDescription = "";

        if (tokens.length >= 2 && tokenMatcher(tokens[0], ArgdownLexer.Indent)) {
          var secondToken = tokens[1];
          tokenDescription = GetParagraphStartTokenDescription(secondToken) || "";
        } else if (tokens.length > 0) {
          tokenDescription = GetParagraphStartTokenDescription(tokens[0]) || "";
        }

        return "Invalid paragraph start. Argdown paragraphs may not start with ".concat(tokenDescription, ". If you do not want to start a new paragraph, remove any empty lines above this one. If you do want to start a new paragraph, try starting with normal text, a statement title, argument title or a list item (using * for unordered or 1. for ordered lists).");
      } else if (isRelationRule(options.ruleName)) {
        return MISSING_RELATION_CONTENT_ERROR;
      } else if (options.ruleName == "statement") {
        if (tokens.length > 0 && (tokenMatcher(tokens[0], ArgdownLexer.ArgumentReference) || tokenMatcher(tokens[0], ArgdownLexer.ArgumentDefinition))) {
          return INVALID_ARGUMENT_STATEMENT_CONTENT_ERROR;
        }

        return MISSING_TEXT_CONTENT_ERROR;
      }

      return defaultParserErrorProvider.buildNoViableAltMessage(options);
    }
  }, {
    key: "buildEarlyExitMessage",
    value: function buildEarlyExitMessage(options) {
      var firstToken = options.actual.length > 0 ? options.actual[0] : null;

      if (options.ruleName == "argdown") {
        if (firstToken && isRelationToken(firstToken)) {
          return INVALID_RELATION_ERROR;
        } else if (firstToken && tokenMatcher(firstToken, ArgdownLexer.InferenceStart)) {
          return INVALID_INFERENCE_POSITION_ERROR;
        }
      } else if (options.ruleName == "statementContent") {
        return MISSING_TEXT_CONTENT_ERROR;
      } else if (options.ruleName == "pcs") {
        if (firstToken && isRelationToken(firstToken)) {
          return INVALID_INDENTATION_ERROR;
        }

        return INCOMPLETE_ARGUMENT_RECONSTRUCTION_ERROR;
      } else if (options.ruleName == "metadata") {
        return INVALID_INFERENCE_ERROR;
      } else if (firstToken && tokenMatcher(firstToken, ArgdownLexer.InferenceEnd)) {
        return INVALID_INFERENCE_ERROR;
      }

      return defaultParserErrorProvider.buildEarlyExitMessage(options);
    }
  }]);

  return ArgdownErrorMessageProvider;
}();

exports.ArgdownErrorMessageProvider = ArgdownErrorMessageProvider;
//# sourceMappingURL=ArgdownErrorMessageProvider.js.map