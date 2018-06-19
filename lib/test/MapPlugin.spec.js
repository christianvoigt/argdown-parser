"use strict";

var _chai = require("chai");

var _index = require("../src/index");

var app = new _index.ArgdownApplication();
var parserPlugin = new _index.ParserPlugin();
app.addPlugin(parserPlugin, "parse-input");
var modelPlugin = new _index.ModelPlugin();
app.addPlugin(modelPlugin, "build-model");
var mapPlugin = new _index.MapPlugin({
  statementSelectionMode: _index.StatementSelectionMode.ALL
});
app.addPlugin(mapPlugin, "make-map");
describe("MapPlugin", function () {
  it("selects statement with title if statementSelectionMode is 'with-title'", function () {
    var source = "\n        [S1]: test\n            - [S2]: test\n\n        Another Statement\n\n        <A1>: Test\n\n        (1) A\n        (2) B\n        ----\n        (3) [S2]\n    ";
    var request = {
      process: ["parse-input", "build-model", "make-map"],
      input: source,
      map: {
        statementSelectionMode: _index.StatementSelectionMode.WITH_TITLE,
        excludeDisconnected: false
      }
    };
    var result = app.run(request); // console.log(toJSON(result.map!, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    //console.log(result.arguments);

    var mapResponse = result;
    (0, _chai.expect)(mapResponse.map.nodes.length).to.equal(3);
    (0, _chai.expect)(mapResponse.map.nodes[0].title).to.equal("S1");
    (0, _chai.expect)(mapResponse.map.nodes[0].labelTitle).to.equal("S1");
    (0, _chai.expect)(mapResponse.map.nodes[0].labelText).to.equal("test");
    (0, _chai.expect)(mapResponse.map.nodes[1].title).to.equal("S2");
    (0, _chai.expect)(mapResponse.map.nodes[2].title).to.equal("A1");
  });
  it("selects top-level statement if statementSelectionMode is 'top-level'", function () {
    var source = "\n        [S1]: test\n            - [S2]: test\n\n        <A>: Test\n\n        (1) A\n        (2) B\n        ----\n        (3) [S2]\n    ";
    var request = {
      process: ["parse-input", "build-model", "make-map"],
      input: source,
      map: {
        statementSelectionMode: _index.StatementSelectionMode.TOP_LEVEL,
        excludeDisconnected: false
      },
      logLevel: "error"
    };
    var result = app.run(request); // console.log(toJSON(result.map!, null, 2));
    // console.log(toJSON(result.statements!, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    //console.log(result.arguments);

    var mapResponse = result;
    (0, _chai.expect)(mapResponse.map.nodes.length).to.equal(2);
    (0, _chai.expect)(mapResponse.map.nodes[0].title).to.equal("S1");
  });
  it("can create map from one statement and two argument definitions", function () {
    var source = "\n    <Argument 1>\n      + [Statement 1]: Hello World!\n          + <Argument 2>: Description\n    ";
    var result = app.run({
      process: ["parse-input", "build-model", "make-map"],
      input: source
    }); //console.log(JSON.stringify(result.map, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    //console.log(result.arguments);

    var mapResponse = result;
    (0, _chai.expect)(mapResponse.map.nodes.length).to.equal(3);
    (0, _chai.expect)(mapResponse.map.nodes[0].title).to.equal("Statement 1");
    (0, _chai.expect)(mapResponse.map.nodes[1].title).to.equal("Argument 1");
    (0, _chai.expect)(mapResponse.map.nodes[2].title).to.equal("Argument 2");
    (0, _chai.expect)(mapResponse.map.edges.length).to.equal(2);
  });
  it("can create a map from two argument reconstructions", function () {
    var source = "<Argument 1>\n\n(1)[Statement 1]: A\n(2)[Statement 2]: B\n----\n(3)[Statement 3]: C\n\n<Argument 2>\n\n(1)[Statement 4]: A\n(2)[Statement 5]: B\n----\n(3)[Statement 6]: C\n    ->[Statement 1]";
    var request = {
      process: ["parse-input", "build-model", "make-map"],
      input: source,
      map: {
        statementSelectionMode: _index.StatementSelectionMode.WITH_RELATIONS
      }
    };
    var result = app.run(request); //console.log(toJSON(result.map!, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    //console.log(result.map.edges);

    (0, _chai.expect)(result.map.nodes.length).to.equal(4);
    (0, _chai.expect)(result.map.edges.length).to.equal(3);
    (0, _chai.expect)(result.map.edges[0].relationType).to.equals(_index.RelationType.ATTACK);
    (0, _chai.expect)(result.map.edges[0].from.title).to.equals("Statement 6");
    (0, _chai.expect)(result.map.edges[0].to.title).to.equals("Statement 1");
    (0, _chai.expect)(result.map.edges[1].relationType).to.equals(_index.RelationType.SUPPORT);
    (0, _chai.expect)(result.map.edges[1].from.title).to.equals("Argument 2");
    (0, _chai.expect)(result.map.edges[1].to.title).to.equals("Statement 6");
    (0, _chai.expect)(result.map.edges[2].relationType).to.equals(_index.RelationType.SUPPORT);
    (0, _chai.expect)(result.map.edges[2].from.title).to.equals("Statement 1");
    (0, _chai.expect)(result.map.edges[2].to.title).to.equals("Argument 1");
  });
  it("adds arguments a, b and support to map if a's conclusion is b's premise ", function () {
    var source = "<Argument 1>\n\n(1)[Statement 1]: A\n(2)[Statement 2]: B\n----\n(3)[Statement 3]: C\n\n<Argument 2>\n\n(1)[Statement 3]: A\n(2)[Statement 4]: B\n----\n(3)[Statement 5]: C";
    var request = {
      process: ["parse-input", "build-model", "make-map"],
      input: source,
      map: {
        statementSelectionMode: "statement-trees"
      }
    };
    var result = app.run(request); // console.log(JSON.stringify(result.map, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    //console.log(result.map.edges);

    (0, _chai.expect)(result.map.nodes.length).to.equal(2);
    (0, _chai.expect)(result.map.edges.length).to.equal(1);
    (0, _chai.expect)(result.map.edges[0].relationType).to.equals(_index.RelationType.SUPPORT);
    (0, _chai.expect)(result.map.edges[0].from.title).to.equals("Argument 1");
    (0, _chai.expect)(result.map.edges[0].to.title).to.equals("Argument 2");
  });
  it("selects argument if premises or conclusions are selected as statement nodes", function () {
    var source = "<!--Hier wird das Argument nicht richtig gezeichnet.-->\n\n[ZT]: ZT\n\n[T1]: T1\n\n<Argument 1>: Argument 1.\n\n(1) [T1]\n(2) P2\n-- Inference rule --\n(3) [ZT]";
    var request = {
      process: ["parse-input", "build-model", "make-map"],
      input: source,
      map: {
        statementSelectionMode: _index.StatementSelectionMode.WITH_TITLE
      }
    };
    var result = app.run(request);
    (0, _chai.expect)(result.map.nodes.length).to.equal(3);
    (0, _chai.expect)(result.map.edges.length).to.equal(2);
  });
  it("adds attack edges if statement is contradictory to premise", function () {
    var source = "\n[T1]: T1\n\n[T2]: T2\n\n(1) P1\n  >< [T1]\n(2) P2\n----\n(3) C1 \n  >< [T2]";
    var request = {
      process: ["parse-input", "build-model", "make-map"],
      input: source,
      map: {
        statementSelectionMode: _index.StatementSelectionMode.TOP_LEVEL
      }
    };
    var result = app.run(request);
    (0, _chai.expect)(result.map.nodes.length).to.equal(3);
    (0, _chai.expect)(result.map.edges.length).to.equal(2);
  });
  it("does not add duplicate arrows for contradictions", function () {
    var source = "<A>\n\n(1) A\n----\n(2) [T1]: C\n  >< [T2]: B\n\n";
    var request = {
      process: ["parse-input", "build-model", "make-map"],
      input: source,
      map: {
        statementSelectionMode: _index.StatementSelectionMode.WITH_RELATIONS
      }
    };
    var result = app.run(request); //console.log(toJSON(result.map!, null, 2));

    (0, _chai.expect)(result.map.edges.length).to.equal(3);
    (0, _chai.expect)(result.map.nodes.length).to.equal(3);
  });
  it("can create groups from sections", function () {
    var source = "\n# Section 1\n  \n  [A]: text\n    + [B]\n  \n## Section 2\n  \n  [B]: text\n    - <C>\n  \n### Section 3\n  \n  <C>: text\n  \n  ";
    var result = app.run({
      process: ["parse-input", "build-model", "make-map"],
      input: source
    }); //console.log(toJSON(result.map!, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    //console.log(result.arguments);

    (0, _chai.expect)(result.map.nodes.length).to.equal(2);
    (0, _chai.expect)(result.map.nodes[0].title).to.equal("A");
    (0, _chai.expect)(result.map.nodes[1].title).to.equal("Section 2");
    (0, _chai.expect)(result.map.edges.length).to.equal(2);
    var section2 = result.map.nodes[1];
    (0, _chai.expect)(section2.children.length).to.equal(2);
    (0, _chai.expect)(section2.children[0].title).to.equal("B");
    var section3 = section2.children[1];
    (0, _chai.expect)(section3.title).to.equal("Section 3");
    (0, _chai.expect)(section3.children.length).to.equal(1);
    (0, _chai.expect)(section3.children[0].title).to.equal("C");
  });
  it("can create groups with only other groups as children", function () {
    var source = "\n# Section 1\n\n## Section 2\n\n### Section 3\n\n<A>: text\n      - <B>: text\n  \n  ";
    var result = app.run({
      process: ["parse-input", "build-model", "make-map"],
      input: source,
      map: {
        statementSelectionMode: _index.StatementSelectionMode.ALL
      }
    }); //console.log(toJSON(result.map!.nodes, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    //console.log(result.arguments);

    (0, _chai.expect)(result.map.nodes.length).to.equal(1);
    (0, _chai.expect)(result.map.nodes[0].title).to.equal("Section 2");
    var section2 = result.map.nodes[0];
    (0, _chai.expect)(section2.children.length).to.equal(1);
    (0, _chai.expect)(section2.children[0].title).to.equal("Section 3");
    var section3 = section2.children[0];
    (0, _chai.expect)(section3.title).to.equal("Section 3");
    (0, _chai.expect)(section3.children.length).to.equal(2);
    (0, _chai.expect)(section3.children[0].title).to.equal("A");
    (0, _chai.expect)(section3.children[1].title).to.equal("B");
  });
  it("can create edges from undercuts", function () {
    var source = "\n<A>: text\n    <_ [B]: text\n\n<C>\n\n(1) text\n(2) text\n----\n    <_ [D]: text\n(3) text\n\n<E>\n\n(1) text\n(2) text\n----\n(3) text\n    <_ <Z>\n  ";
    var result = app.run({
      process: ["parse-input", "build-model", "make-map"],
      input: source,
      logLevel: "error",
      map: {
        statementSelectionMode: _index.StatementSelectionMode.WITH_RELATIONS
      }
    }); //console.log(toJSON(result.relations!, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);

    var d = result.statements["D"]; // for (let relation of d.relations!) {
    //   console.log(relation.toString());
    // }
    // for (let relation of result.relations!) {
    //   console.log(relation.toString());
    // }
    // for (let edge of result.map!.edges) {
    //   console.log(edge.toString());
    // }

    (0, _chai.expect)(result.map.edges.length).to.equal(3); // expect(result.map!.nodes[0].title).to.equal("Section 2");
    // let section2 = result.map!.nodes[0];
    // expect(section2.children!.length).to.equal(1);
    // expect(section2.children![0].title).to.equal("Section 3");
    // let section3 = section2.children![0];
    // expect(section3.title).to.equal("Section 3");
    // expect(section3.children!.length).to.equal(2);
    // expect(section3.children![0].title).to.equal("A");
    // expect(section3.children![1].title).to.equal("B");
  });
});
//# sourceMappingURL=MapPlugin.spec.js.map