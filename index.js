/* Documentation
- https://github.com/acornjs/acorn
- https://github.com/benjamn/recast
- https://astexplorer.net/
- https://saehm.github.io/DruidJS/api/classes/TSNE.html
*/
import * as acorn from "acorn"
import * as recast from "recast";
import * as fs from 'node:fs';
import * as druid from "@saehrimnir/druidjs";
import { fileURLToPath } from 'url';
import { realpathSync } from 'fs';

const modulePath = fileURLToPath(import.meta.url);
const mainPath = process.argv[1];
const artfolder = "./artworks/"
const p5API = JSON.parse(fs.readFileSync('./p5API.json'));
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


//const p5functions = new Map()
async function main() {
    // all p5 elements are documented in a single json object, here: https://p5js.org/reference/data.json
    // classitems lists all the methods
    // uncomment the following block to update the p5API.json file
    // const response = await fetch('https://p5js.org/reference/data.json');
    // const p5api = await response.json();
    // for (let i in p5api.classitems) {
    //     if (p5api.classitems[i].itemtype == "method") {
    //         p5functions.set(p5api.classitems[i].name, i)
    //         p5functionsnames.push(p5api.classitems[i].name)
    //     }
    // }
    // fs.writeFileSync("p5API.json", JSON.stringify(Array.from(p5functions.entries())), function (err) {
    //     if (err) throw err;
    //     console.log('complete');
    // });
    let p5map=new Map()
    for(let x in p5API){
        p5map.set(p5API[x][0], p5API[x][1])
    }
    console.log(p5map)
    let p5InAllartworks = [] // will contain one json object per artwork
    fs.readdir(artfolder, (err, files) => {
        files.forEach(file => {
            let p5FunctionsInvokedInArtwork = getInvokedP5Functions(file,p5map)
            p5InAllartworks.push(p5FunctionsInvokedInArtwork)
        });
        fs.writeFileSync("p5InArtworks.json", JSON.stringify(p5InAllartworks), function (err) {
            if (err) throw err;
            console.log('complete');
        }
        );
    });

    // will contain one json object per artwork, each object stores the name of the artwork
    // as well as the complete list of functions in the p5 API, and the number of times the artwork invokes them (0 or more)
    let p5VectorsForAllArtworks = [] 
    fs.readdir(artfolder, (err, files) => {
        files.forEach(file => {
            let p5VectorArtwork = getP5FunctionsVector(file,p5map)
            p5VectorsForAllArtworks.push(p5VectorArtwork)
        });
        fs.writeFileSync("p5VectorsArtworks.json", JSON.stringify(p5VectorsForAllArtworks), function (err) {
            if (err) throw err;
            console.log('complete');
        }
        );
        // here we extract one numerical vector per artwork from p5VectorsForAllArtworks
        // each vector has the same size (the number of p5 functions), and the numerical values correspond to the number of invocations
        // we also build the labels array with the names of the artworks
        let vectorsOfP5 = []
        let labels = []
        for (let art in p5VectorsForAllArtworks) {
            let onevector = []
            let currentartwork = p5VectorsForAllArtworks[art]
            for (let f in currentartwork.p5functions) {
                onevector.push(currentartwork.p5functions[f])
            }
            vectorsOfP5.push(onevector)
            labels.push(currentartwork.artwork)
        }
        // compute t-SNE in 2D with the vectors, label each point in the 2D space with the corresponding artwork name
        // the coordinates of the points, and their labels, are stored on disk
        getembedding(vectorsOfP5, labels)
    });
}

// returns the names of the p5 functions invoked in filename
// filename must be the name of one javascript file (a script)
function getInvokedP5Functions(filename,p5functions) {
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
function getP5FunctionsVector(filename,p5functions) {
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

// data: set of numerical vectors, all the same size
// labels: set of names, one per vector
// result: the 2D embedding for the vectors, stored with labels in a json file 
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
