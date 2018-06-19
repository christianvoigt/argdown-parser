"use strict";

var _chai = require("chai");

var _index = require("../src/index");

var app = new _index.ArgdownApplication();
var parserPlugin = new _index.ParserPlugin();
app.addPlugin(parserPlugin, "parse-input");
var modelPlugin = new _index.ModelPlugin();
app.addPlugin(modelPlugin, "build-model");
var mapPlugin = new _index.MapPlugin();
var dotExport = new _index.DotExportPlugin();
app.addPlugin(mapPlugin, "create-map");
app.addPlugin(dotExport, "export-dot");
describe("DotExport", function () {
  it("sanity test", function () {
    var source = "\n    # Section 1\n    \n    <Argument with a very very long title 1>\n      + [Statement with a very very long title 1]: Hello World!\n          +<Argument 2>: Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.\n            -[\xC4\xFC\xF6'quotes']: Some text\n                -<A very convincing argument>:Too complicated to explain\n                  +>[And yet another statement]: Some more text\n                    +<Another Argument>: Some more text\n    \n    ## Section 2\n    \n    <Argument with a very very long title 1>: text\n      - [And yet another statement]\n      \n    ### Section 3\n    \n    [And yet another statement]\n      + <Argument>\n        - text\n    ";
    var result = app.run({
      process: ["parse-input", "build-model", "create-map", "export-dot"],
      input: source,
      logLevel: "error"
    });
    (0, _chai.expect)(result.dot).to.exist;
  });
});
//# sourceMappingURL=DotExportPlugin.spec.js.map