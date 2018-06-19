"use strict";

require("core-js/modules/es6.function.name");

var _chai = require("chai");

var _index = require("../src/index");

var app = new _index.ArgdownApplication();
describe("MetaDataPlugin", function () {
  var parserPlugin = new _index.ParserPlugin();
  var modelPlugin = new _index.ModelPlugin();
  var metaDataPlugin = new _index.MetaDataPlugin();
  app.addPlugin(parserPlugin, "parse-input");
  app.addPlugin(metaDataPlugin, "build-model");
  app.addPlugin(modelPlugin, "build-model");
  it("can parse metadata", function () {
    var source = "\n===\nauthor: Christian Voigt\ntitle: My first front matter\nlist: [1,2,3,4]\ntestBool: true\n===\n\n# Heading 1 {hello: world}\n\n[A]: text {guten: tag}\n\n[A] {\n    prop1:\n        - 1\n        - 2\n        - 3\n    prop2:\n        a: 1\n        b: 2\n        c: 3\n    }\n\n<B>: text {myObject: {name: Klaus, list: [1,2,3]}}\n\n<B> {auf: wiedersehen}\n        ";
    var request = {
      process: ["parse-input", "build-model"],
      input: source,
      logLevel: "error",
      testBool: false
    };
    var result = app.run(request); // console.log(JSON.stringify(request));

    (0, _chai.expect)(request["testBool"]).to.be.true;
    (0, _chai.expect)(request.title).to.equal("My first front matter");
    (0, _chai.expect)(result.parserErrors.length).to.equal(0);
    (0, _chai.expect)(result.lexerErrors.length).to.equal(0);
    (0, _chai.expect)(result.ast.metaData.author).to.equal("Christian Voigt");
    (0, _chai.expect)(result.ast.metaData.title).to.equal("My first front matter");
    (0, _chai.expect)(result.frontMatter.author).to.equal("Christian Voigt");
    (0, _chai.expect)(result.frontMatter.title).to.equal("My first front matter");
    (0, _chai.expect)(result.frontMatter.list.length).to.equal(4);
    (0, _chai.expect)(result.sections[0].metaData.hello).to.equal("world");
    (0, _chai.expect)(result.statements["A"].members[0].metaData.guten).to.equal("tag");
    (0, _chai.expect)(result.statements["A"].metaData.guten).to.equal("tag");
    (0, _chai.expect)(result.statements["A"].metaData.prop1.length).to.equal(3);
    (0, _chai.expect)(result.statements["A"].metaData.prop1[2]).to.equal(3);
    (0, _chai.expect)(result.statements["A"].metaData.prop2["c"]).to.equal(3);
    (0, _chai.expect)(result.arguments["B"].metaData.myObject.name).to.equal("Klaus");
    (0, _chai.expect)(result.arguments["B"].metaData.myObject.list[1]).to.equal(2);
    (0, _chai.expect)(result.arguments["B"].metaData.myObject.list.length).to.equal(3);
    (0, _chai.expect)(result.arguments["B"].metaData.auf).to.equal("wiedersehen");
  });
});
//# sourceMappingURL=MetaDataPlugin.spec.js.map