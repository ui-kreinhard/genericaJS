"use strict";
exports.delete = function(app, dataDaoHandler) {
    app.post('/delete', function(req, res) {
        var dataDao = req.dataDao;
        var url = require('url');
        var errorHandler = require('../modules/errorHandler.js').errorHandler;
        var isNotDefined = require('../modules/utils.js').utils.isNotDefined;

        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;

        var tableName = req.body.tableName;
        var id = req.body.id;
        errorHandler(req, res)
                (isNotDefined(tableName), 'No tablename specified')
                (isNotDefined(id), 'No id specified', function() {
                    query.id = id;
                    query.tableName = tableName;
                    query.errorHandler = function(err) {
                        res.statusCode = 500;
                        console.log(err);
                        res.send(err);
                    };
                    query.successHandler = function(response) {
                        res.statusCode = 200;
                        res.send(response);
                    };
                    dataDao.deleteRecord(query);
                });
    });
};