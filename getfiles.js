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
const artfolder = "./lotsofartworks/0cheesecoder0/"

if (realpathSync(modulePath) === realpathSync(mainPath)) {
    console.log('This module is being run as the main script.');
    // Run main functionality here
    main();
}

//const p5functions = new Map()
async function main() {
    getFileInFolder(artfolder)
}

function getFileInFolder(folder) {
    let path = folder
    fs.readdir(folder, (err, files) => {
    console.log(folder)
        files.forEach(file => {
            fs.stat(folder + file, (err, stat) => {
                if (err) {
                    console.error('Error reading path:', err);
                    return;
                }
                if(stat.isDirectory()){
                    path=path+file+'/'
                    getFileInFolder(path)
                }
                else{
                    console.log(path+file)
                }
            })
        });
    })

}