"use strict";

var _mocha = require("mocha");

var _chai = require("chai");

var fs = _interopRequireWildcard(require("fs"));

var lexer = _interopRequireWildcard(require("../src/lexer"));

var chevrotain = _interopRequireWildcard(require("chevrotain"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var i = 0;
var currentTokens = [];

function expectToken(tokenType) {
  //expect(currentTokens[i]).to.be.an.instanceof(tokenType);
  (0, _chai.expect)(chevrotain.tokenMatcher(currentTokens[i], tokenType)).to.be.true;
  i++;
}

function expectTokenLocation(startOffset, endOffset, startLine, endLine, startColumn, endColumn) {
  var token = currentTokens[i];
  (0, _chai.expect)(token.startOffset).to.equal(startOffset);
  (0, _chai.expect)(token.endOffset).to.equal(endOffset);
  (0, _chai.expect)(token.startLine).to.equal(startLine);
  (0, _chai.expect)(token.endLine).to.equal(endLine);
  (0, _chai.expect)(token.startColumn).to.equal(startColumn);
  (0, _chai.expect)(token.endColumn).to.equal(endColumn);
  i++;
}

function startTest(tokens) {
  currentTokens = tokens;
  i = 0;
}

(0, _mocha.describe)("Lexer", function () {
  it("recognizes incoming and outgoing relations", function () {
    var source = fs.readFileSync("./test/lexer-relations.argdown", "utf8");
    var result = lexer.tokenize(source); //console.log(lexer.tokensToString(result.tokens));

    startTest(result.tokens);
    expectToken(lexer.OutgoingSupport);
    expectToken(lexer.OutgoingAttack);
    expectToken(lexer.OutgoingSupport);
    expectToken(lexer.OutgoingAttack);
    expectToken(lexer.IncomingSupport);
    expectToken(lexer.IncomingAttack);
    expectToken(lexer.Contradiction);
    expectToken(lexer.IncomingUndercut);
    expectToken(lexer.OutgoingUndercut);
  });
  it("can distinguish between Emptyline and Newline", function () {
    var source = fs.readFileSync("./test/lexer-emptyline.argdown", "utf8");
    var result = lexer.tokenize(source);
    startTest(result.tokens);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Emptyline);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Emptyline);
    expectToken(lexer.Freestyle);
  });
  it("can lex mentions", function () {
    var source = fs.readFileSync("./test/lexer-mentions.argdown", "utf8");
    var result = lexer.tokenize(source);
    startTest(result.tokens);
    expectToken(lexer.HeadingStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.ArgumentMention);
    expectToken(lexer.StatementMention);
    expectToken(lexer.Emptyline);
    expectToken(lexer.Freestyle);
    expectToken(lexer.UnusedControlChar);
    expectToken(lexer.ArgumentMention);
    expectToken(lexer.StatementMention);
  });
  it("can lex headings", function () {
    var source = fs.readFileSync("./test/lexer-heading.argdown", "utf8");
    var result = lexer.tokenize(source);
    startTest(result.tokens);
    expectToken(lexer.HeadingStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Emptyline);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Emptyline);
    expectToken(lexer.HeadingStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Emptyline);
    expectToken(lexer.Freestyle);
  });
  it("can lex ordered and unordered lists", function () {
    var source = fs.readFileSync("./test/lexer-lists.argdown", "utf8");
    var result = lexer.tokenize(source); // console.log(lexer.tokensToString(result.tokens));

    startTest(result.tokens);
    expectToken(lexer.Indent);
    expectToken(lexer.UnorderedListItem);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Indent);
    expectToken(lexer.UnorderedListItem);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Indent);
    expectToken(lexer.OrderedListItem);
    expectToken(lexer.Freestyle);
    expectToken(lexer.OrderedListItem);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Dedent);
    expectToken(lexer.Dedent);
    expectToken(lexer.Dedent);
    expectToken(lexer.Emptyline);
    expectToken(lexer.Indent);
    expectToken(lexer.OrderedListItem);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Indent);
    expectToken(lexer.OrderedListItem);
    expectToken(lexer.Freestyle);
    expectToken(lexer.OrderedListItem);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Dedent);
    expectToken(lexer.OrderedListItem);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Indent);
    expectToken(lexer.UnorderedListItem);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Dedent);
    expectToken(lexer.Dedent);
  });
  it("can lex an argument reconstruction", function () {
    var source = fs.readFileSync("./test/lexer-argument.argdown", "utf8");
    var result = lexer.tokenize(source); // console.log(lexer.tokensToString(result.tokens));

    startTest(result.tokens);
    expectToken(lexer.StatementNumber);
    expectToken(lexer.Freestyle);
    expectToken(lexer.StatementNumber);
    expectToken(lexer.Freestyle);
    expectToken(lexer.InferenceStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.ListDelimiter);
    expectToken(lexer.Freestyle);
    expectToken(lexer.MetaData);
    expectToken(lexer.InferenceEnd);
    expectToken(lexer.StatementNumber);
    expectToken(lexer.Freestyle);
  });
  it("can dedent on Emptyline", function () {
    var source = fs.readFileSync("./test/lexer-emptyline-dedent.argdown", "utf8");
    var result = lexer.tokenize(source);
    startTest(result.tokens);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Indent);
    expectToken(lexer.OutgoingSupport);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Dedent);
    expectToken(lexer.Emptyline);
    expectToken(lexer.Freestyle);
  });
  it("can ignore Newlines in relations", function () {
    var source = fs.readFileSync("./test/lexer-linebreak.argdown", "utf8");
    var result = lexer.tokenize(source);
    startTest(result.tokens);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Indent);
    expectToken(lexer.OutgoingSupport);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Freestyle);
    expectToken(lexer.OutgoingAttack);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Freestyle);
    expectToken(lexer.OutgoingSupport);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Dedent);
  });
  it("can lex bold and italic text", function () {
    var source = fs.readFileSync("./test/lexer-italic-bold.argdown", "utf8");
    var result = lexer.tokenize(source);
    startTest(result.tokens); // console.log(lexer.tokensToString(result.tokens));

    expectToken(lexer.Freestyle);
    expectToken(lexer.UnderscoreBoldStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.UnderscoreBoldEnd);
    expectToken(lexer.UnderscoreItalicStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.UnderscoreItalicEnd);
    expectToken(lexer.AsteriskBoldStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.AsteriskBoldEnd);
    expectToken(lexer.AsteriskItalicStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.AsteriskItalicEnd);
    expectToken(lexer.AsteriskBoldStart);
    expectToken(lexer.AsteriskItalicStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.AsteriskItalicEnd);
    expectToken(lexer.AsteriskBoldEnd);
    expectToken(lexer.UnderscoreBoldStart);
    expectToken(lexer.UnderscoreItalicStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.UnderscoreItalicEnd);
    expectToken(lexer.UnderscoreBoldEnd);
    expectToken(lexer.UnderscoreBoldStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.AsteriskItalicStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.AsteriskItalicEnd);
    expectToken(lexer.UnderscoreBoldEnd);
    expectToken(lexer.AsteriskItalicStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.UnderscoreBoldStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.UnderscoreBoldEnd);
    expectToken(lexer.AsteriskItalicEnd);
    expectToken(lexer.AsteriskBoldStart);
    expectToken(lexer.AsteriskBoldStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.AsteriskBoldEnd);
    expectToken(lexer.AsteriskBoldEnd);
    expectToken(lexer.UnusedControlChar);
    expectToken(lexer.AsteriskItalicStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.AsteriskItalicEnd);
    expectToken(lexer.UnusedControlChar);
    expectToken(lexer.AsteriskItalicStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.AsteriskItalicEnd);
    expectToken(lexer.Freestyle);
    expectToken(lexer.AsteriskItalicStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.AsteriskItalicEnd);
    expectToken(lexer.UnusedControlChar);
    expectToken(lexer.UnderscoreItalicStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.UnderscoreItalicEnd);
    expectToken(lexer.UnusedControlChar);
    expectToken(lexer.AsteriskBoldStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.AsteriskBoldEnd);
    expectToken(lexer.UnusedControlChar);
    expectToken(lexer.UnderscoreBoldStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.UnderscoreBoldEnd);
    expectToken(lexer.UnusedControlChar);
    expectToken(lexer.AsteriskItalicStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.AsteriskItalicEnd);
    expectToken(lexer.UnusedControlChar);
    expectToken(lexer.UnderscoreItalicStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.UnderscoreItalicEnd);
    expectToken(lexer.UnusedControlChar);
    expectToken(lexer.AsteriskBoldStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.AsteriskBoldEnd);
    expectToken(lexer.UnusedControlChar);
    expectToken(lexer.UnderscoreBoldStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.UnderscoreBoldEnd);
    expectToken(lexer.UnusedControlChar);
  });
  it("can lex complex indentation", function () {
    var source = fs.readFileSync("./test/lexer-indentation.argdown", "utf8");
    var result = lexer.tokenize(source);
    startTest(result.tokens);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Indent);
    expectToken(lexer.OutgoingSupport);
    expectToken(lexer.Freestyle);
    expectToken(lexer.OutgoingAttack);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Indent);
    expectToken(lexer.OutgoingSupport);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Indent);
    expectToken(lexer.OutgoingAttack);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Indent);
    expectToken(lexer.IncomingSupport);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Dedent);
    expectToken(lexer.Dedent);
    expectToken(lexer.Dedent);
    expectToken(lexer.IncomingAttack);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Dedent);
  });
  it("can recognize argument and statement references and definitions", function () {
    var source = fs.readFileSync("./test/lexer-definitions-references.argdown", "utf8");
    var result = lexer.tokenize(source);
    startTest(result.tokens);
    expectToken(lexer.StatementReference);
    expectToken(lexer.StatementDefinition);
    expectToken(lexer.ArgumentReference);
    expectToken(lexer.ArgumentDefinition);
    expectToken(lexer.Freestyle);
  });
  it("can ignore comments", function () {
    var source = fs.readFileSync("./test/lexer-comment.argdown", "utf8");
    var result = lexer.tokenize(source);
    startTest(result.tokens);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Emptyline);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Freestyle);
  });
  it("can recognize links and tags", function () {
    var source = fs.readFileSync("./test/lexer-links-and-tags.argdown", "utf8");
    var result = lexer.tokenize(source);
    startTest(result.tokens); //console.log(lexer.tokensToString(result.tokens));

    expectToken(lexer.StatementDefinition);
    expectToken(lexer.UnusedControlChar);
    expectToken(lexer.Freestyle);
    expectToken(lexer.UnusedControlChar);
    expectToken(lexer.Link);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Tag);
    expectToken(lexer.Tag);
    expectToken(lexer.Tag);
  });
  it("can ignore trailing Emptyline before comment", function () {
    var source = fs.readFileSync("./test/lexer-trailing-emptyline.argdown", "utf8");
    var result = lexer.tokenize(source);
    startTest(result.tokens);
    (0, _chai.expect)(result.tokens.length).to.equal(3);
    expectToken(lexer.Emptyline);
    expectToken(lexer.StatementDefinition);
    expectToken(lexer.Freestyle);
  });
  it("can lex Windows line endings", function () {
    var source = fs.readFileSync("./test/lexer-windows-line-endings.argdown", "utf8");
    var result = lexer.tokenize(source);
    startTest(result.tokens); //console.log(lexer.tokensToString(result.tokens));
    //expect(result.tokens.length).to.equal(5);

    expectToken(lexer.Freestyle);
    expectToken(lexer.Indent);
    expectToken(lexer.OutgoingSupport);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Dedent);
    expectToken(lexer.Emptyline);
    expectToken(lexer.StatementNumber);
    expectToken(lexer.Freestyle);
    expectToken(lexer.InferenceStart);
    expectToken(lexer.InferenceEnd);
    expectToken(lexer.StatementNumber);
    expectToken(lexer.Freestyle);
  });
  it("can lex escaped chars", function () {
    var source = fs.readFileSync("./test/lexer-escaped-chars.argdown", "utf8");
    var result = lexer.tokenize(source);
    startTest(result.tokens); //console.log(lexer.tokensToString(result.tokens));
    //expect(result.tokens.length).to.equal(5);

    expectToken(lexer.Freestyle);
    expectToken(lexer.EscapedChar);
    expectToken(lexer.Freestyle);
    expectToken(lexer.EscapedChar);
    expectToken(lexer.Freestyle);
    expectToken(lexer.EscapedChar);
    expectToken(lexer.Freestyle);
    expectToken(lexer.EscapedChar);
    expectToken(lexer.EscapedChar);
    expectToken(lexer.Freestyle);
  });
  it("can save correct token location data", function () {
    var source = fs.readFileSync("./test/lexer-token-locations.argdown", "utf8");
    var result = lexer.tokenize(source);
    startTest(result.tokens); //console.log(lexer.tokenLocationsToString(result.tokens));

    expectTokenLocation(0, 0, 1, 1, 1, 1);
    expectTokenLocation(2, 2, 2, 2, 1, 1); //offset = 2 because of ignored line break

    expectTokenLocation(4, 5, 3, 3, 1, 2);
    expectTokenLocation(6, 6, 3, 3, 3, 3);
    expectTokenLocation(7, 11, 3, 3, 4, 8); //@[A]

    expectTokenLocation(12, 12, 3, 3, 9, 9); //ItalicStart

    expectTokenLocation(13, 13, 3, 3, 10, 10);
    expectTokenLocation(14, 14, 3, 3, 11, 11); //ItalicEnd

    expectTokenLocation(15, 16, 3, 4, 12, 1); //Emptyline

    expectTokenLocation(17, 20, 5, 5, 1, 4); //<B>:

    expectTokenLocation(22, 22, 5, 5, 6, 6); //skipped whitespace at offset 21

    expectTokenLocation(24, 27, 6, 6, 1, 4); // Indent (4 spaces)

    expectTokenLocation(24, 28, 6, 6, 1, 5); // + (including 4 spaces for indentation)

    expectTokenLocation(30, 30, 6, 6, 7, 7);
    expectTokenLocation(32, 39, 7, 7, 1, 8); // Indent (8 spaces)

    expectTokenLocation(32, 41, 7, 7, 1, 10); // -> including spaces

    expectTokenLocation(43, 43, 7, 7, 12, 12); // skipped whitespace at offset 42

    expectTokenLocation(43, 43, 7, 7, 12, 12); // Dedent is always at last column of current line

    expectTokenLocation(43, 43, 7, 7, 12, 12); // Dedent is always at last column of current line
  });
  it("can save correct token location data if first line is empty", function () {
    var source = fs.readFileSync("./test/lexer-token-locations-first-line-empty.argdown", "utf8");
    var result = lexer.tokenize(source);
    startTest(result.tokens); //console.log(lexer.tokenLocationsToString(result.tokens));
    //expect(result.tokens.length).to.equal(5);

    expectTokenLocation(1, 1, 2, 2, 1, 1); //First newline skipped

    expectTokenLocation(3, 3, 3, 3, 1, 1); //Second newline skipped
  });
  it("can lex relation after empty line", function () {
    var source = fs.readFileSync("./test/lexer-relation-after-emptyline.argdown", "utf8");
    var result = lexer.tokenize(source);
    startTest(result.tokens); //console.log(lexer.tokensToString(result.tokens));
    //expect(result.tokens.length).to.equal(5);

    expectToken(lexer.Freestyle);
    expectToken(lexer.Emptyline);
    expectToken(lexer.Indent);
    expectToken(lexer.OutgoingSupport);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Dedent);
  });
  it("can lex frontmatter", function () {
    var source = "\n    ===\n    some: front matter\n    ===\n    \n    [title]: text\n    ";
    var result = lexer.tokenize(source);
    startTest(result.tokens); //console.log(lexer.tokensToString(result.tokens));
    //expect(result.tokens.length).to.equal(5);

    expectToken(lexer.FrontMatter);
    expectToken(lexer.Emptyline);
    expectToken(lexer.StatementDefinition);
    expectToken(lexer.Freestyle);
  });
  it("can lex meta data", function () {
    var source = "\n    # heading {some: meta data}\n\n    [title]: text {some: meta data}\n\n    [title] {some: meta data}\n\n    <argument>: text {some: meta data}\n\n    <argument> {some: meta data}\n    ";
    var result = lexer.tokenize(source);
    startTest(result.tokens); // console.log(lexer.tokensToString(result.tokens));
    //expect(result.tokens.length).to.equal(5);

    expectToken(lexer.HeadingStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.MetaData);
    expectToken(lexer.Emptyline);
    expectToken(lexer.StatementDefinition);
    expectToken(lexer.Freestyle);
    expectToken(lexer.MetaData);
    expectToken(lexer.Emptyline);
    expectToken(lexer.StatementReference);
    expectToken(lexer.MetaData);
    expectToken(lexer.Emptyline);
    expectToken(lexer.ArgumentDefinition);
    expectToken(lexer.Freestyle);
    expectToken(lexer.MetaData);
    expectToken(lexer.Emptyline);
    expectToken(lexer.ArgumentReference);
    expectToken(lexer.MetaData);
  }); // it("can lex statement references, definitions and mentions by number", function () {
  //   let source = fs.readFileSync("./test/lexer-statements-by-number.argdown", 'utf8');
  //   const result = lexer.tokenize(source);
  //   startTest(result.tokens);
  //   console.log(lexer.tokensToString(result.tokens));
  //   //expect(result.tokens.length).to.equal(5);
  //   expectToken(lexer.StatementDefinitionByNumber);
  //   expectToken(lexer.Freestyle);
  //   expectToken(lexer.StatementReferenceByNumber);
  //   expectToken(lexer.StatementMentionByNumber);
  //   // expectToken(lexer.Dedent);
  // });
});
//# sourceMappingURL=lexer.spec.js.map