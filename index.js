#!/usr/bin/env node
const { transpileSchema } = require('graphql-s2s').graphqls2s;
//const { makeExecutableSchema } = require('graphql-tools');
const minimist = require('minimist');
const meow = require('meow');
const fs = require('fs');

const args = meow(`
  Usage
    $ graphqls2s-transpiler
  Options
    --file, -f  Input file to transpile
    --output, -o  Output file for transpiled code optional if not given will print output to console
`, {
  flags: {
    file: {
      type: "string",
      alias: "f"
    },
    output: {
      type: "string",
      alias: "o"
    }
  }
});

const checkForError = (err)=>{
  if(err){
    console.error(err);
    process.exit();
  }
};

const outputSchema = (data)=>{
  outputFile = args.flags.output;
  data = transpileSchema(data);
  if(!args.flags.output){
    console.log(data);
    return;
  }
  fs.writeFile(outputFile, data, function(err) {
    if(err) {
      console.error(err);
      process.exit();
    }
  });
};

inputFile = args.flags.file;
if(!inputFile){
  console.log("Please check the help to provide right parameters");
  console.log(args.help);
  return;
}

fs.readFile(inputFile, "utf8", function(err, contents){
  checkForError(err);
  outputSchema(contents);
});
