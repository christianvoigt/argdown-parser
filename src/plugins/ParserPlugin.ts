import * as _ from "lodash";
import * as argdownLexer from "../lexer";
import { parser } from "../parser";
import * as chevrotain from "chevrotain";
import { IArgdownPlugin } from "../IArgdownPlugin";
import { IArgdownRequest } from "../IArgdownRequest";
import { IArgdownResponse } from "../IArgdownResponse";
import { IArgdownLogger } from "../IArgdownLogger";
import { ArgdownPluginError } from "../ArgdownPluginError";

const tokenMatcher = chevrotain.tokenMatcher;

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
export class ParserPlugin implements IArgdownPlugin {
  name: string = "ParserPlugin";
  run(request: IArgdownRequest, response: IArgdownResponse, logger: IArgdownLogger) {
    if (!request.input) {
      throw new ArgdownPluginError(this.name, "No input field in request.");
    }

    let lexResult = argdownLexer.tokenize(request.input);
    response.tokens = lexResult.tokens;
    response.lexerErrors = lexResult.errors;
    parser.input = lexResult.tokens;
    response.ast = parser.argdown();
    response.parserErrors = parser.errors;

    if (response.lexerErrors && response.lexerErrors.length > 0) {
      logger.log("verbose", "[ParserPlugin]: Lexer returned errors.\n" + JSON.stringify(response.lexerErrors));
    }
    if (response.parserErrors && response.parserErrors.length > 0) {
      logger.log("verbose", "[ParserPlugin]: Parser returned errors.\n" + JSON.stringify(response.parserErrors));
    }
    // if (response.parserErrors && response.parserErrors.length > 0) {
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
}
