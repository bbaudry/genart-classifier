/* Documentation
- https://github.com/acornjs/acorn
- https://github.com/benjamn/recast
- https://astexplorer.net/
*/
const acorn = require("acorn")
const recast = require('recast');
const fs = require('node:fs');

let acornconfig = {
    ecmaVersion: 9,
    sourceType: "script",
    allowReturnOutsideFunction: true
}

const code = fs.readFileSync('./plein019.js').toString();
const ast = acorn.parse(code, acornconfig).body;
const functionNames = [];
let p5api
if (require.main === module) {
    main();
}

function main() {
    loadp5functions()
    getInvokedFunctions()
    
}

// all p5 elements are documented in a single json object, here: https://p5js.org/reference/data.json
async function loadp5functions(){
    const response = await fetch('https://p5js.org/reference/data.json');
    const p5api = await response.json();
    console.log(p5api.classitems[555].name)
}

function getInvokedFunctions() {
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
                console.log(path.node.callee.name+"   "+path.node.arguments.length)
                return false;
            }
        }
    )
}