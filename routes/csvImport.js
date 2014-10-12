exports.csvImport = function(app) {
    var url = require('url');
    var errorHandler = require('../modules/errorHandler.js').errorHandler;
    var isNotDefined = require('../modules/utils.js').utils.isNotDefined;

    app.post('/csv_import', function(req, res) {
        var fs = require('fs');
        var Converter = require("csvtojson").core.Converter;
        var csvConverter = new Converter({constructResult: true});
        var url_parts = url.parse(req.url, true);
        var parseAndInsert;

        var tableName = req.body.view_name;
        errorHandler(req, res)
                (isNotDefined(tableName), 'No tablename specifed')
                (isNotDefined(req.files.file), 'No CSV file given', function() {
                    var insertRecords = function(csvConvertedObject) {
                        var dataDao = req.dataDao;
                        var i = 0;
                        var overallResponse = {
                            errors: [],
                            success: []
                        };
                        var length = csvConvertedObject.length;

                        var insertNextRecord = function() {
                            var query = {};
                            query.data = csvConvertedObject[i];

                            query.tableName = tableName;

                            query.errorHandler = function(err) {
                                err.recordNumber = i + 1;
                                i++;
                                overallResponse.errors.push(err);
                                if (i < length) {
                                    insertNextRecord();
                                } else {
                                    res.statusCode = 200;
                                    res.send(overallResponse);
                                }
                            };
                            query.validationErrorHandler = function(response) {
                                response.recordNumber = i + 1;
                                i++;
                                overallResponse.errors.push(response);
                                if (i < length) {
                                    insertNextRecord();
                                } else {
                                    res.statusCode = 200;
                                    res.send(overallResponse);
                                }
                            };
                            query.successHandler = function(response) {
                                response.recordNumber = i + 1;
                                overallResponse.success.push(response);
                                i++;
                                if (i < length) {
                                    insertNextRecord();
                                } else {
                                    res.statusCode = 200;
                                    res.send(overallResponse);
                                }
                            };
                            dataDao.insertOrUpdateRecord(query);
                        };
                        insertNextRecord();
                    };

                    // get the temporary location of the file
                    var csvFileName = req.files.file.path;

                    var fileStream = fs.createReadStream(csvFileName);
                    csvConverter.on("end_parsed", insertRecords);
                    fileStream.pipe(csvConverter);
                });
    });

};