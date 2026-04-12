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
const artfolder = "./lotsofartworks/"
const pathsToArtFiles=[]

if (realpathSync(modulePath) === realpathSync(mainPath)) {
    // Run main functionality here
    main();
}

//const p5functions = new Map()
async function main() {
    getArtFilesInFolder(artfolder)
        console.log(pathsToArtFiles.length)

    for(let art in pathsToArtFiles){
        //console.log(pathsToArtFiles[art])
    }
}


function getArtFilesInFolder(folder) {
    let filenames = fs.readdirSync(folder);
    filenames.forEach(file => {
        let stat = fs.statSync(folder + file)
        if (stat.isDirectory()) {
            let path = folder + file + '/'
            getArtFilesInFolder(path)
        }
        else {
            pathsToArtFiles.push(folder + file)
        }
    })
}
