/* Documentation
- https://github.com/acornjs/acorn
- https://github.com/benjamn/recast
- https://astexplorer.net/
- https://saehm.github.io/DruidJS/api/classes/TSNE.html
*/
//const acorn = require("acorn")
//const recast = require('recast');
//const fs = require('node:fs');
const artfolder = "./artworks/"
import * as acorn from "acorn"
import * as recast from "recast";
import * as fs from 'node:fs';
import * as druid from "@saehrimnir/druidjs";
import { fileURLToPath } from 'url';
import { realpathSync } from 'fs';

const modulePath = fileURLToPath(import.meta.url);
const mainPath = process.argv[1];

if (realpathSync(modulePath) === realpathSync(mainPath)) {
    console.log('This module is being run as the main script.');
    // Run main functionality here
    main();
}
let acornconfig = {
    ecmaVersion: 9,
    sourceType: "script",
    allowReturnOutsideFunction: true
}


let p5functions = new Map()
async function main() {
    // all p5 elements are documented in a single json object, here: https://p5js.org/reference/data.json
    // classitems lists all the methods
    const response = await fetch('https://p5js.org/reference/data.json');
    const p5api = await response.json();
    for (let i in p5api.classitems) {
        if (p5api.classitems[i].itemtype == "method") {
            p5functions.set(p5api.classitems[i].name, i)
        }
    }
    let p5InAllartworks = [] // will contain one json object per artwork
    fs.readdir(artfolder, (err, files) => {
        files.forEach(file => {
            let p5FunctionsInvokedInArtwork = getInvokedP5Functions(file)
            p5InAllartworks.push(p5FunctionsInvokedInArtwork)
        });
        fs.writeFileSync("p5InArtworks.json", JSON.stringify(p5InAllartworks), function (err) {
            if (err) throw err;
            console.log('complete');
        }
        );
    });

    let p5VectorsForAllArtworks = [] // will contain one json object per artwork
    fs.readdir(artfolder, (err, files) => {
        files.forEach(file => {
            let p5VectorArtwork = getP5FunctionsVector(file)
            p5VectorsForAllArtworks.push(p5VectorArtwork)
        });
        fs.writeFileSync("p5VectorsArtworks.json", JSON.stringify(p5VectorsForAllArtworks), function (err) {
            if (err) throw err;
            console.log('complete');
        }
        );
        let vectorsOfP5 = []
        let labels = []
        for (let art in p5VectorsForAllArtworks) {
            let onevector = []
            let artwork = p5VectorsForAllArtworks[art]
            for (let f in artwork.p5functions) {
                onevector.push(artwork.p5functions[f])
            }
            vectorsOfP5.push(onevector)
            labels.push(artwork.artwork)
        }
        getembedding(vectorsOfP5, labels)
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
                    let index = p5functions.get(functionname)
                    p5FunctionsInFile.push({
                        name: functionname,
                        id: index
                    }
                    )
                }
                return false;
            }
        }
    )
    return { artwork: filename, p5functions: p5FunctionsInFile }
}



// returns the list of p5 methods. If the method is invoked, the values is the number of invocations
// filename must be the name of one javascript file (a script)
function getP5FunctionsVector(filename) {
    const code = fs.readFileSync(artfolder + filename).toString();
    const ast = acorn.parse(code, acornconfig).body;
    let p5FunctionsInFile = [];
    let functionname, p5function, p5vector, val
    // initialize a map with all p5 methods as keys, and 0 as value
    p5vector = p5functions
    for (let v of p5vector.entries()) {
        p5vector.set(v[0], 0);
    }
    recast.visit(
        ast,
        {
            visitCallExpression: (path) => {
                functionname = path.node.callee.name
                p5function = p5vector.has(functionname)
                // if a p5 method is found in the sketch, we increment its corresponding value in p5vector
                if (functionname && p5function) {
                    val = p5vector.get(functionname)
                    p5vector.set(functionname, val + 1)
                }
                return false;
            }
        }
    )
    return { artwork: filename, p5functions: Object.fromEntries(p5vector) }
}

function getembedding(data, labels) {
    const tsne = new druid.TSNE(data, {
        perplexity: 30,
        epsilon: 10,
        d: 2,
        seed: 42
    });

    const embedding = tsne.transform(500); // 500 iterations
    console.log(embedding)
    console.log(labels)
    const JSONembed = { "embedding": embedding, "labels": labels }
    fs.writeFileSync("artworksEmbedding.json", JSON.stringify(JSONembed), function (err) {
        if (err) throw err;
        console.log('complete');
    })

}
