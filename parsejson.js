#!/usr/bin/env node

var nameReadFile = process.argv[2];
var nameSaveFile = process.argv[3];

var fs = require('fs');

formatingFile();

function formatingFile() {
    var obj;

    fs.readFile(nameReadFile, 'utf8', function (err, data) {
        if (err) throw err;
        
        obj = JSON.parse(data);

        var request = chooseRequest(obj.log.entries);
        saveFile(request);
    });
};

function saveFile(request) {
    var data = JSON.stringify(request, "", 4);  
    fs.writeFileSync(nameSaveFile, `/* tslint:disable */\nexport const mock = ${data}`); 
}

function chooseRequest(data) {
    let saved = data.filter(element => element.request.headers.filter((header) =>  header.name === 'content-type' && header.value.match(/application\/json/)).length > 0);
    saved.forEach(key => {
        console.log(key.request.headers[0].value);
    });
    return saved
            .map(element => ({
                request: {
                    method: element.request.method,
                    path: element.request.headers.filter((header) =>  header.name === ':path')[0].value,
                    postData: element.request.postData ? JSON.parse(element.request.postData.text) : {}
                },
                response: {
                    status: element.response.status,
                    content: JSON.parse(element.response.content.text !== '' ? element.response.content.text : '""')
                }
            }));
}
