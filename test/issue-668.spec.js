import { expect } from 'chai';
import { ArgdownApplication, ParserPlugin } from '../src/index.js';

let app = new ArgdownApplication();

describe("ModelPlugin", function () {
    const parserPlugin = new ParserPlugin();
    app.addPlugin(parserPlugin, 'parse-input');

    it("can run without throwing an exception", function () {
        let source = `(1) asdsadd
----
(2)`;
        let result = app.run(['parse-input'], { input: source });
        expect(result.parserErrors.length).to.equal(1);
    });
});
