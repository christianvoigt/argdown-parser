'use strict';

var _chai = require('chai');

var _index = require('../src/index.js');

var app = new _index.ArgdownApplication();

describe("ModelPlugin", function () {
    var parserPlugin = new _index.ParserPlugin();
    app.addPlugin(parserPlugin, 'parse-input');

    it("can run without throwing an exception", function () {
        var source = '(1) asdsadd\n----\n(2)';
        var result = app.run(['parse-input'], { input: source });
        (0, _chai.expect)(result.parserErrors.length).to.equal(1);
    });
});
//# sourceMappingURL=issue-668.spec.js.map