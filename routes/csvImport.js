exports.csvImport = function(app) {
    var url = require('url');
    var errorHandler = require('../modules/errorHandler.js').errorHandler;
    var isNotDefined = require('../modules/utils.js').utils.isNotDefined;
   
    app.post('/csv_import', function(req, res) {
        var csvHandler = require('../csvHandler.js').csvHandler(req.dataDao);
        var fs = require('fs');
        var Converter = require("csvtojson").core.Converter;
        var csvConverter = new Converter({constructResult: true});
        var url_parts = url.parse(req.url, true);
        var parseAndInsert;

        var tableName = req.body.view_name;
        errorHandler(req, res)
                (isNotDefined(tableName), 'No tablename specifed')
                (isNotDefined(req.files.file), 'No CSV file given', function() {

                    var csvImport = require('../csvHandler.js').csvHandler(req.dataDao);
                    function finished(overallResponse) {
                        res.statusCode = 200;
                        res.send(overallResponse);
                    }

                    // get the temporary location of the file
                    var csvFileName = req.files.file.path;

                    var fileStream = fs.createReadStream(csvFileName);
                    csvConverter.on("end_parsed", csvImport.insertRecords.fill(undefined, finished, req.body.view_name));
                    fileStream.pipe(csvConverter);
                });
    });

};