"use strict";

require("core-js/modules/es6.function.name");

var _chai = require("chai");

var _index = require("../src/index");

var _ArgdownPluginError = require("../src/ArgdownPluginError");

var app = new _index.ArgdownApplication();
var parserPlugin = new _index.ParserPlugin();
app.addPlugin(parserPlugin, "parse-input");
describe("Application", function () {
  it("can add, get, call and remove plugins", function () {
    var source = "Hello World!";
    var statements = 0;
    var plugin = {
      name: "TestPlugin",
      ruleListeners: {
        statementEntry: function statementEntry() {
          return statements++;
        }
      },
      run: function run(request, response) {
        response.testRunCompleted = true;
        throw new _ArgdownPluginError.ArgdownPluginError("TestPlugin", "Test error.");
      }
    };
    app.addPlugin(plugin, "test");
    (0, _chai.expect)(app.getPlugin(plugin.name, "test")).to.equal(plugin);
    var result = app.run({
      process: ["parse-input", "test"],
      input: source,
      logExceptions: false
    });
    (0, _chai.expect)(statements).to.equal(1);
    (0, _chai.expect)(result.exceptions.length).to.equal(1);
    (0, _chai.expect)(result.exceptions[0].plugin).to.equal("TestPlugin");
    (0, _chai.expect)(result.testRunCompleted).to.be.true;
    statements = 0;
    app.removePlugin(plugin, "test");
    result = app.run({
      process: ["parse-input", "test"],
      input: source,
      logExceptions: false
    });
    (0, _chai.expect)(statements).to.equal(0);
    (0, _chai.expect)(result.testRunCompleted).to.be.undefined;
  });
});
//# sourceMappingURL=ArgdownApplication.spec.js.map