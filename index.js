const acorn = require("acorn")
const fs = require('node:fs');

let acornconfig={
    ecmaVersion: 9,
    sourceType: "script"
}
 
const code = fs.readFileSync('./plein019.js');
console.log(acorn.parse(code, acornconfig))