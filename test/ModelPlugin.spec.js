import { expect } from 'chai';
import {ArgdownApplication, ParserPlugin, ModelPlugin} from '../src/index.js';
import fs from 'fs';

let app = new ArgdownApplication();

describe("ModelPlugin", function() {
  const parserPlugin = new ParserPlugin();
  let modelPlugin = new ModelPlugin();
  app.addPlugin(parserPlugin, 'parse-input');
  app.addPlugin(modelPlugin,'build-model');

  it("can create statements dictionary and save statement by title", function(){
    let source = "[Test]: Hello _World_!";
    let result = app.run({process: ['parse-input','build-model'], input:source, logLevel: "verbose"});
    expect(result.statements['Test']).to.exist;
    expect(result.statements['Test'].members[0].text).to.equal('Hello World!');
    expect(result.statements['Test'].getCanonicalStatement().text).to.equal('Hello World!');
    expect(result.statements['Test'].getCanonicalText()).to.equal('Hello World!');
    expect(result.statements['Test'].members[0].ranges.length).to.equal(1);
    expect(result.statements['Test'].members[0].ranges[0].type).to.equal('italic');
    expect(result.statements['Test'].members[0].ranges[0].start).to.equal(6);
    expect(result.statements['Test'].members[0].ranges[0].stop).to.equal(10);
  });
  it("can create arguments dictionary and save argument by title", function(){
    let source = "<Test>: Hello _World_!";
    let result = app.run({process: ['parse-input','build-model'], input:source});
    expect(result.arguments['Test']).to.exist;
    expect(result.arguments['Test'].descriptions.length).to.equal(1);
    let description = result.arguments['Test'].descriptions[0];
    expect(result.arguments['Test'].getCanonicalDescription()).to.equal(description);
    expect(description.text).to.equal('Hello World!');
    expect(description.ranges.length).to.equal(1);
    expect(description.ranges[0].type).to.equal('italic');
    expect(description.ranges[0].start).to.equal(6);
    expect(description.ranges[0].stop).to.equal(10);
  });
  it("can create statement relations and ignore duplicates", function(){
    let source = `
    [A]: The Beatles are the best!
      + [B]: The Beatles made 'Rubber Soul'!
      -> <C>: The Rolling Stones were cooler!
        
    [A]
      + [B]
      -> <C>
    `;
    let result = app.run({process: ['parse-input','build-model'], input:source});

    expect(Object.keys(result.statements).length).to.equal(2);
    expect(Object.keys(result.arguments).length).to.equal(1);
    expect(result.relations.length).to.equal(2);

    expect(result.statements['A']).to.exist;
    expect(result.statements['A'].relations.length).to.equal(2);
    expect(result.statements['A'].relations[0].type).to.equal('entails');
    expect(result.statements['A'].relations[0].to).to.equal(result.statements['A']);
    expect(result.statements['A'].relations[0].from).to.equal(result.statements['B']);
    expect(result.statements['A'].relations[0].status).to.equal('reconstructed');
    expect(result.statements['B']).to.exist;
    expect(result.statements['B'].relations.length).to.equal(1);
    expect(result.arguments['C']).to.exist;
    expect(result.arguments['C'].relations.length).to.equal(1);
    expect(result.arguments['C'].relations[0].type).to.equal('attack');
    expect(result.arguments['C'].relations[0].from).to.equal(result.statements['A']);
    expect(result.arguments['C'].relations[0].to).to.equal(result.arguments['C']);
    expect(result.arguments['C'].relations[0].status).to.equal('sketched');
  });
  it("can ignore duplicates of argument relations", function(){
    let source = `
    [A]: text
      + <Argument 1>
    
    <Argument 1>
    
    (1) text
    (2) text
    ----
    (3) [B]: text
      +> [A]
    `;
    let result = app.run({process: ['parse-input','build-model'], input:source});
    expect(Object.keys(result.statements).length).to.equal(4);
    expect(Object.keys(result.arguments).length).to.equal(1);
    expect(result.relations.length).to.equal(1);
  });  
  it("can create sketched argument relations", function(){
    let source = "<A>: The Beatles are the best!\n  +<B>: The Beatles made 'Rubber Soul'!\n  ->[C]: The Rolling Stones were cooler!";
    let result = app.run({process: ['parse-input','build-model'], input:source});
    expect(result.arguments['A']).to.exist;
    expect(result.arguments['A'].relations.length).to.equal(2);
    expect(result.arguments['A'].relations[0].type).to.equal('support');
    expect(result.arguments['A'].relations[0].to).to.equal(result.arguments['A']);
    expect(result.arguments['A'].relations[0].from).to.equal(result.arguments['B']);
    expect(result.arguments['A'].relations[0].status).to.equal('sketched');
    expect(result.arguments['B']).to.exist;
    expect(result.arguments['B'].relations.length).to.equal(1);
    expect(result.statements['C']).to.exist;
    expect(result.statements['C'].relations.length).to.equal(1);
    expect(result.statements['C'].relations[0].type).to.equal('attack');
    expect(result.statements['C'].relations[0].from).to.equal(result.arguments['A']);
    expect(result.statements['C'].relations[0].to).to.equal(result.statements['C']);
    expect(result.statements['C'].relations[0].status).to.equal('sketched');
  });
  it("does not add empty statements as members to equivalence class", function(){
    let source = `[A]: B
    
    [A]`;
    let result = app.run({process: ['parse-input','build-model'], input:source});
    expect(result.statements['A']).to.exist;
    expect(result.statements['A'].members.length).to.equal(1);
  });  
  it("does not create duplicate relations for contradictions", function(){
    let source = `[A]: A
      >< [B]: B
    
    [B]
      >< [A]`;
    let result = app.run({process: ['parse-input','build-model'], input:source});
    expect(result.parserErrors.length).to.equal(0);
    expect(Object.keys(result.statements).length).to.equal(2);
    expect(Object.keys(result.relations).length).to.equal(1);
  });
  it("can parse undercuts", function () {
    let source = `[A]: A
      _> <B>
    
    <B>
      <_ [D]`;
    let result = app.run({process: ['parse-input', 'build-model'], input: source });
    //console.log(parserPlugin.parser.astToString(result.ast));
    //console.log(result.parserErrors[0]);
    expect(result.parserErrors.length).to.equal(0);
    expect(Object.keys(result.statements).length).to.equal(2);
    expect(Object.keys(result.relations).length).to.equal(2);
    expect(result.relations[0].type).to.equal("undercut");
    expect(result.relations[0].from.title).to.equal("A");
    expect(result.relations[0].to.title).to.equal("B");
    expect(result.relations[1].type).to.equal("undercut");
    expect(result.relations[1].from.title).to.equal("D");
    expect(result.relations[1].to.title).to.equal("B");
  });      
  it("can process a single argument", function(){
    let source = "(1) [s1]: A\n(2) [s2]: B\n----\n(3) [s3]: C";
    let result = app.run({process: ['parse-input','build-model'], input:source});
    expect(result.arguments['Untitled 1']).to.exist;
    expect(result.statements['s1']).to.exist;
    expect(result.statements['s2']).to.exist;
    expect(result.statements['s3']).to.exist;
  });  

  it("can create argument reconstructions", function(){
  let source = `<Reconstructed Argument>
  
  (1) [A]: text
    -<Sketched Argument 1>
    +[E]
  (2) B
  ----
  (3) C
  -- Modus Ponens (uses:1,2; depends on: 1) --
  (4) [D]: text
    ->[E]: text
    +><Sketched Argument 1>: text
    
<Reconstructed Argument>
  ->[F]: text
  +><Sketched Argument 2>`;
  let result = app.run({process: ['parse-input','build-model'], input:source});
  expect(Object.keys(result.arguments).length).to.equal(3);
  expect(Object.keys(result.statements).length).to.equal(6);

  let argument = result.arguments['Reconstructed Argument'];
  //console.log(util.inspect(argument));
  expect(argument).to.exist;
  expect(argument.pcs.length).to.equal(4);
  expect(argument.relations.length).to.equal(0); //all relations get transformed to relations of conclusion

  expect(argument.pcs[0].role).to.equal('premise');
  expect(argument.pcs[1].role).to.equal('premise');
  expect(argument.pcs[2].role).to.equal('conclusion');
  expect(argument.pcs[3].role).to.equal('conclusion');
  expect(result.statements[argument.pcs[0].title]).to.exist;
  expect(result.statements[argument.pcs[1].title]).to.exist;
  expect(result.statements[argument.pcs[2].title]).to.exist;
  expect(result.statements[argument.pcs[3].title]).to.exist;

  let premise = result.statements[argument.pcs[0].title];
  expect(premise.isUsedAsPremise).to.be.true;
  expect(premise.isUsedAsConclusion).to.be.false;
  expect(premise.isUsedAsRootOfStatementTree).to.be.false;
  expect(premise.isUsedAsChildOfStatementTree).to.be.false;
  expect(premise.relations.length).to.equal(2);

  expect(premise.relations[0].from.title).to.equal('Sketched Argument 1');
  expect(premise.relations[0].to.title).to.equal('A');
  expect(premise.relations[0].type).to.equal('attack');
  expect(premise.relations[0].status).to.equal('sketched');

  expect(premise.relations[1].from.title).to.equal('E');
  expect(premise.relations[1].to.title).to.equal('A');
  expect(premise.relations[1].type).to.equal('entails');
  expect(premise.relations[1].status).to.equal('reconstructed');

  expect(argument.pcs[3].title).to.equal('D');
  let conclusion = result.statements[argument.pcs[3].title];
  expect(conclusion.isUsedAsConclusion).to.be.true;
  expect(conclusion.isUsedAsPremise).to.be.false;
  expect(conclusion.isUsedAsRootOfStatementTree).to.be.false;
  expect(conclusion.isUsedAsChildOfStatementTree).to.be.false;
  expect(conclusion.relations.length).to.equal(4); //with transformed relations from the argument

  expect(conclusion.relations[0].status).to.equal('reconstructed');
  expect(conclusion.relations[0].from.title).to.equal('D');
  expect(conclusion.relations[0].to.title).to.equal('E');
  expect(conclusion.relations[0].type).to.equal('contrary');

  expect(conclusion.relations[1].status).to.equal('sketched');
  expect(conclusion.relations[1].from.title).to.equal('D');
  expect(conclusion.relations[1].to.title).to.equal('Sketched Argument 1');
  expect(conclusion.relations[1].type).to.equal('support');


  expect(conclusion.relations[2].type).to.equal("contrary");
  expect(conclusion.relations[2].from.title).to.equal("D");
  expect(conclusion.relations[2].to.title).to.equal("F");
  expect(conclusion.relations[2].status).to.equal("reconstructed");

  expect(conclusion.relations[3].type).to.equal("support");
  expect(conclusion.relations[3].from.title).to.equal("D");
  expect(conclusion.relations[3].to.title).to.equal("Sketched Argument 2");
  expect(conclusion.relations[3].status).to.equal("sketched");


  let inference = argument.pcs[3].inference;
  expect(inference).to.exist;
  expect(inference.inferenceRules.length).to.equal(1);
  expect(inference.inferenceRules[0]).to.equal('Modus Ponens');
  expect(inference.metaData['uses'].length).to.equal(2);
  expect(inference.metaData['uses'][0]).to.equal('1');
  expect(inference.metaData['uses'][1]).to.equal('2');
  expect(inference.metaData['depends on']).to.equal('1');

  let statement = result.statements['E'];
  expect(statement).to.exist;
  expect(statement.isUsedAsRootOfStatementTree).to.be.false;
  expect(statement.isUsedAsChildOfStatementTree).to.be.false;
  expect(statement.isUsedAsConclusion).to.be.false;
  expect(statement.isUsedAsPremise).to.be.false;
  expect(statement.relations.length).to.equal(2);

  let sketchedArgument = result.arguments['Sketched Argument 1'];
  expect(sketchedArgument).to.exist;
  expect(sketchedArgument.relations.length).to.equal(2);

});
it("can create the section hierarchy and set section property of statements and arguments", function(){
  let source = `# Section 1
  
  ## Section 2
  
  [A]: Text
  
  ### Section 3
  
  <B>: Text
  
  ## Section 4
  
  <B>
  
  (1) p
  (2) q
  ----
  (3) r
  `;
  let result = app.run({process: ['parse-input','build-model'], input:source});
  //console.log(JSON.stringify(result.sections,null,2));
  expect(result.sections).to.exist;
  expect(result.sections.length).to.equal(1);
  expect(result.sections[0].title).to.equal('Section 1');
  expect(result.sections[0].children).to.exist;
  expect(result.sections[0].children.length).to.equal(2);
  expect(result.sections[0].children[0].title).to.equal('Section 2');
  expect(result.sections[0].children[0].children.length).to.equal(1);
  expect(result.sections[0].children[0].children[0].title).to.equal('Section 3');
  expect(result.sections[0].children[0].children[0].children.length).to.equal(0);
  expect(result.sections[0].children[1].title).to.equal('Section 4');
  expect(result.sections[0].children[1].children.length).to.equal(0);
  
  expect(result.statements['A']).to.exist;
  expect(result.statements['A'].members[0].section).to.exist;
  expect(result.statements['A'].members[0].section.title).to.equal('Section 2');  
  
  expect(result.arguments['B']).to.exist;
  expect(result.arguments['B'].section).to.exist;
  expect(result.arguments['B'].section.title).to.equal('Section 4');
  expect(result.arguments['B'].descriptions[0].section).to.exist;
  expect(result.arguments['B'].descriptions[0].section.title).to.equal('Section 3');
}); 
it("can create tags lists", function(){
  let source = `[Statement 1]: #tag-1 text
  
  [Statement 2]: text #tag-1 #(tag 2)
  
  <Argument 1>: text #tag-1 #tag3 #tag4
  
  [Statement 1]: #tag-5 #tag-6 
  `;
  let result = app.run({process: ['parse-input','build-model'], input:source});
  expect(result.tags).to.exist;
  expect(result.tags.length).to.equal(6);
  expect(result.statements["Statement 1"].tags.length).to.equal(3);
  expect(result.statements["Statement 2"].members[result.statements["Statement 2"].members.length - 1].text).to.equal("text #tag-1 #(tag 2)");
  expect(result.statements["Statement 2"].tags.length).to.equal(2);
  expect(result.arguments["Argument 1"].tags.length).to.equal(3);
});
it("can identify duplicates in outgoing relations of reconstructed argument and main conclusion", function(){
  let source = `<A1>: A1
  - <A2>: A2
    
<A2>

 (1) P
 (2) P
 ----
 (3) C
   -> <A1> 
  `;
  let result = app.run({process: ['parse-input','build-model'], input:source});
  expect(result.relations).to.exist;
  expect(result.relations.length).to.equal(1);
});
it("can create section titles from headings with mentions, tags and ranges", function(){
  let source = `# @[A] @<B> #tag **bold** _italic_
  
  [A]
  
  <B>
  `;
  let result = app.run({process: ['parse-input','build-model'], input:source});
  expect(result.sections).to.exist;
  expect(result.sections.length).to.equal(1);
  expect(result.sections[0].title).to.equal("@[A] @<B> #tag bold italic");
  expect(result.sections[0].tags.length).to.equal(1);
  expect(result.sections[0].ranges.length).to.equal(5);
  expect(result.arguments['B']).to.exist;
  expect(result.statements['A']).to.exist;
});
  it("can parse escaped chars", function () {
    let source = fs.readFileSync("./test/model-escaped-chars.argdown", 'utf8');
    
    //let source = `[A]: \\[text\\] text`;
    let result = app.run({process: ['parse-input', 'build-model'], input: source });
    expect(result.statements['A']).to.exist;
    expect(result.statements['A'].getCanonicalText()).to.equal('[text] text');
  });
  it("can return error with token location for incomplete reconstruction", function () {
    let source = `sdsadad

(1) adasdasd`;
    let result = app.run({process: ['parse-input'], input: source });
    //console.log(result.parserErrors[0]);
    expect(result.parserErrors[0].previousToken.startLine).to.equal(3);
    expect(result.parserErrors[0].previousToken.startColumn).to.equal(5);
  });
});

