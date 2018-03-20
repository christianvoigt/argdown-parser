import { expect } from 'chai';
import {ArgdownApplication, ParserPlugin} from '../src/index.js';

const app = new ArgdownApplication();
const parserPlugin = new ParserPlugin();
app.addPlugin(parserPlugin, 'parse-input');

describe("Application", function() {
  it("can add, get, call and remove plugins", function(){
    let source = "Hello World!";
    let statements = 0;
    let plugin = {
      name: "TestPlugin",
      argdownListeners : {
        statementEntry: ()=>statements++
      },
      run(request, response){
        response.testRunCompleted = true;
        return response;
      }
    };
    app.addPlugin(plugin, 'test');
    expect(app.getPlugin(plugin.name, 'test')).to.equal(plugin);
    let result = app.run({process: ['parse-input','test'], input:source});
    expect(statements).to.equal(1);
    expect(result.testRunCompleted).to.be.true;
    statements = 0;
    app.removePlugin(plugin, 'test');
    result = app.run({process: ['parse-input','test'], input:source});
    expect(statements).to.equal(0);
    expect(result.testRunCompleted).to.be.undefined;
  });
  it("can run async", function () {
    let plugin1 = {
      name: "TestPlugin2",
      runAsync: (request, response)=>{
        return new Promise((resolve)=>{
          setTimeout(()=>{
            response.asyncRunCompleted = true;
            resolve(response);
          }, 500);
        });
      }
    };
    let plugin2 = {
      name: "TestPlugin1",
      run(request, response) {
        if(response.asyncRunCompleted){
          response.syncRunCompleted = true;
        }
        return response;
      }
    };
    app.addPlugin(plugin1, 'test');
    app.addPlugin(plugin2, 'test');
    return app.runAsync({ process: ['test'], input: 'Hallo Welt!', logLevel: "verbose"})
      .then((response)=>{
        expect(response.asyncRunCompleted).to.be.true;
        expect(response.syncRunCompleted).to.be.true;
      });
  });
});
