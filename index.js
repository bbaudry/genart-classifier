/* Documentation
- https://github.com/acornjs/acorn
- https://github.com/benjamn/recast
- https://astexplorer.net/
*/
const acorn = require("acorn")
const recast = require('recast');
const fs = require('node:fs');
const artfolder = "./artworks/"

let acornconfig = {
    ecmaVersion: 9,
    sourceType: "script",
    allowReturnOutsideFunction: true
}

if (require.main === module) {
    main();
}

let p5functions = new Map()
async function main() {
    // all p5 elements are documented in a single json object, here: https://p5js.org/reference/data.json
    const response = await fetch('https://p5js.org/reference/data.json');
    const p5api = await response.json();
    for (i in p5api.classitems) {
        if (p5api.classitems[i].itemtype == "method") {
            p5functions.set(p5api.classitems[i].name, i)
        }
    }
    let p5InAllartworks = []
    fs.readdir(artfolder, (err, files) => {
        files.forEach(file => {
            let p5FunctionsInvokedInArtwork = getInvokedP5Functions(file)
            p5InAllartworks.push(p5FunctionsInvokedInArtwork)
            console.log(JSON.stringify(p5InAllartworks))
        });
        fs.writeFileSync("p5InArtworks.json", JSON.stringify(p5InAllartworks), function (err) {
            if (err) throw err;
            console.log('complete');
        }
        );
    });

}

// returns the names of the p5 functions invoked in filename
// filename must be the name of one javascript file (a script)
function getInvokedP5Functions(filename) {
    const code = fs.readFileSync(artfolder + filename).toString();
    const ast = acorn.parse(code, acornconfig).body;
    let p5FunctionsInFile = [];
    let functionname, p5function
    recast.visit(
        ast,
        {
            visitCallExpression: (path) => {
                functionname = path.node.callee.name
                p5function = p5functions.has(functionname)
                if (functionname && p5function) {
                    p5FunctionsInFile.push({
                        name: path.node.callee.name,
                        id: p5functions.get(functionname)
                    }
                    )
                }
                return false;
            }
        }
    )
    return { artwork: filename, p5functions: p5FunctionsInFile }
}