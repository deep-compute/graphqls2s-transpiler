#!/usr/bin/env node
/*jshint esversion: 6 */

const { transpileSchema } = require("graphql-s2s").graphqls2s;
//const { makeExecutableSchema } = require('graphql-tools');
const minimist = require("minimist");
const meow = require("meow");
const fs = require("fs");
const path = require("path");

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
  // writing the output to a file
  fs.writeFile(outputFile, data, function(err) {
    if(err) {
      console.error(err);
      process.exit();
    }
  });
};

inputFile = args.flags.file;
if(!Array.isArray(inputFile)){
  inputFile = [inputFile];
}

let inputFiles = [];
let inputPromises = [];

function checkForDirectories(){
  // Iterating over inputFiles to check if any of them are directories
  inputFile.forEach((file_path)=>{
    if(!fs.statSync(file_path).isDirectory()){
      inputFiles.push(file_path);
    return;
    }
    inputPromises.push(new Promise((resolve, reject)=>{
      fs.readdir(file_path, (error, files)=>{
        checkForError(error);
        files.forEach((file_name)=>{
        if(!file_name.endsWith(".graphql")){
          return;
        }
        file_name = path.join(file_path, file_name);
        console.log(typeof file_name);
        inputFiles.push(file_name);
        resolve();
        });
      });
    }));
  });
}

checkForDirectories();

Promise.all(inputPromises).then(()=>{

  if(!inputFiles){
    console.log("Please check the help to provide right parameters");
    console.log(args.help);
    return;
  }

  let promisses = [];
  inputFiles.forEach((file)=>{
    // Using promises so that we can wait for all the files being read
    promisses.push(new Promise((resolve, reject)=>{
      fs.readFile(file, "utf8", function(err, contents){
        checkForError(err);
        resolve(contents);
      });
    }));
  });

  // waiting for all the files being read
  Promise.all(promisses).then((...args)=>{
    outputSchema(args[0].join("\n"));
  });
});
