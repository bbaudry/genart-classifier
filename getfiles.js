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
const artfolder = "./artinfolders/"

if (realpathSync(modulePath) === realpathSync(mainPath)) {
    // Run main functionality here
    main();
}

//const p5functions = new Map()
async function main() {
//    getFileInFolder(artfolder,0)
    fs.readdir(artfolder, (err, files) => {
        files.forEach(file => {
            getFileInFolder(artfolder+file+'/',0)
        });
    })

}

function getFileInFolder(folder,dep) {
    let path = folder
    console.log("analyzing "+folder+" at depth "+dep)
    fs.readdir(folder, (err, files) => {
        files.forEach(file => {
                    console.log(file)
            fs.stat(folder + file, (err, stat) => {
                if (err) {
                    console.error('Error reading path:', err);
                    return;
                }
                if(stat.isDirectory()){
                    path=path+file+'/'
                    let d=dep+1
                    console.log("go further")
                    getFileInFolder(path,d)
                }
                else{
                    console.log(path+file)
                }
            })
        });
    })

}