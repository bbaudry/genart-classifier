const acorn = require("acorn")
const recast = require('recast');
const fs = require('node:fs');

let acornconfig={
    ecmaVersion: 9,
    sourceType: "script",
    allowReturnOutsideFunction: true
}

const code = fs.readFileSync('./plein019.js').toString();
const ast =acorn.parse(code, acornconfig).body;
const functionNames = [];

if (require.main === module) {
  main();
}

function main() {
  getInvokedFunctions()
}

function getInvokedFunctions(){
recast.visit(
  ast,
  {
    visitFunctionDeclaration: (path) => {
      console.log(path.node.id.name); // will print "FunctionDeclaration"
      functionNames.push(path.node.id.name); // will add the name of the function to the array

      // return false to avoid looking inside of the functions body
      // we stop our search at this level
      return false;
    }
  }
)


recast.visit(
  ast,
  {
    visitCallExpression: (path) => {
      console.log(path.node.callee.name); // will print "FunctionDeclaration"
      //functionNames.push(path.node.id.name); // will add the name of the function to the array

      // return false to avoid looking inside of the functions body
      // we stop our search at this level
      return false;
    }
  }
)
}