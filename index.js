/* Documentation
- https://github.com/acornjs/acorn
- https://github.com/benjamn/recast
- https://astexplorer.net/
*/
const acorn = require("acorn")
const recast = require('recast');
const fs = require('node:fs');
const artfolder = "./artworks"

let acornconfig = {
    ecmaVersion: 9,
    sourceType: "script",
    allowReturnOutsideFunction: true
}

let p5functions = []
if (require.main === module) {
    main();
}

async function main() {
    // all p5 elements are documented in a single json object, here: https://p5js.org/reference/data.json
    const response = await fetch('https://p5js.org/reference/data.json');
    const p5api = await response.json();
    for (i in p5api.classitems) {
        p5functions.push(p5api.classitems[i].name)
    }
    fs.readdir(artfolder, (err, files) => {
        files.forEach(file => {
            let functionsInvokedInArtwork = getInvokedFunctions(artfolder+"/"+file)
            let invokedp5functions = p5functions.filter((element) => functionsInvokedInArtwork.includes(element));
            console.log(invokedp5functions)
        });
    });
}

// returns the names of all functions invoked in filename
// filename must the name of one javascript file (a script)
function getInvokedFunctions(filename) {
    const code = fs.readFileSync(filename).toString();
    const ast = acorn.parse(code, acornconfig).body;
    let functionNames = [];
    recast.visit(
        ast,
        {
            visitCallExpression: (path) => {
                if (path.node.callee.name) { functionNames.push(path.node.callee.name) }
                return false;
            }
        }
    )
    return functionNames
}


// recast.visit(
//     ast,
//     {
//         visitFunctionDeclaration: (path) => {
//             console.log(path.node.id.name); // will print "FunctionDeclaration"
//             functionNames.push(path.node.id.name); // will add the name of the function to the array

//             // return false to avoid looking inside of the functions body
//             // we stop our search at this level
//             return false;
//         }
//     }
// )
