const fs = require('fs');
const contentFilePath = '.content.json';

function save(content){
    const contentFile = JSON.stringify(content);
    return fs.writeFileSync(contentFilePath,contentFile)
}

function load(){
    const contentFile = fs.readFileSync(contentFilePath,'utf-8');
    const contenJson = JSON.parse(contentFile);
    return contenJson;
}

module.exports = {
    save,
    load
}