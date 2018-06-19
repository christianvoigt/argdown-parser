"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParserPlugin = void 0;

require("core-js/modules/es6.function.name");

var argdownLexer = _interopRequireWildcard(require("../lexer"));

var _parser = require("../parser");

var chevrotain = _interopRequireWildcard(require("chevrotain"));

var _ArgdownPluginError = require("../ArgdownPluginError");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var tokenMatcher = chevrotain.tokenMatcher;
/**
 * The ParserPlugin is the most basic building block of an ArgdownApplication.
 * It takes a string provided in [[IArgdownRequest.input]]
 * and scans it for tokens. The resulting tokens list is added to the [[IArgdownResponse.tokens]] response property.
 * The tokens are parsed into an abstract syntax tree (AST).
 * The AST is added to the [[IArgdownResponse.ast]] response property.
 *
 * The AST is then used by the [[ModelPlugin]] to build the basic data model used by most other plugins.
 *
 * Lexer errors are added to [[IArgdownResponse.lexerErrors]] response property. Parser errors are added to the [[IArgdownResponse.parserErrors]] response property.
 * These errors can be used to build an Argdown linter.
 */

var ParserPlugin =
/*#__PURE__*/
function () {
  function ParserPlugin() {
    _classCallCheck(this, ParserPlugin);

    _defineProperty(this, "name", "ParserPlugin");
  }

  _createClass(ParserPlugin, [{
    key: "run",
    value: function run(request, response, logger) {
      if (!request.input) {
        throw new _ArgdownPluginError.ArgdownPluginError(this.name, "No input field in request.");
      }

      var lexResult = argdownLexer.tokenize(request.input);
      response.tokens = lexResult.tokens;
      response.lexerErrors = lexResult.errors;
      _parser.parser.input = lexResult.tokens;
      response.ast = _parser.parser.argdown();
      response.parserErrors = _parser.parser.errors;

      if (response.lexerErrors && response.lexerErrors.length > 0) {
        logger.log("verbose", "[ParserPlugin]: Lexer returned errors.\n" + JSON.stringify(response.lexerErrors));
      }

      if (response.parserErrors && response.parserErrors.length > 0) {
        logger.log("verbose", "[ParserPlugin]: Parser returned errors.\n" + JSON.stringify(response.parserErrors));
      } // if (response.parserErrors && response.parserErrors.length > 0) {
      //   // //add location if token is EOF
      //   var lastToken = _.last(response.tokens);
      //   for (let error of response.parserErrors) {
      //     if (error.token && tokenMatcher(error.token, chevrotain.EOF)) {
      //       const startLine = lastToken.endLine;
      //       const endLine = startLine;
      //       const startOffset = lastToken.endOffset;
      //       const endOffset = startOffset;
      //       const startColumn = lastToken.endColumn;
      //       const endColumn = startColumn;
      //       const newToken = chevrotain.createTokenInstance(
      //         chevrotain.EOF,
      //         "",
      //         startOffset,
      //         endOffset,
      //         startLine,
      //         endLine,
      //         startColumn,
      //         endColumn
      //       );
      //       error.token = newToken;
      //     }
      //   }
      // }


      return response;
    }
  }]);

  return ParserPlugin;
}();

exports.ParserPlugin = ParserPlugin;
//# sourceMappingURL=ParserPlugin.js.map