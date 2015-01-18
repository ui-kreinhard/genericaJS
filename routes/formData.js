"use strict";
exports.formData = function(app, dataDaoHandler) {
    var url = require('url');

    app.get('/formdata', function(req, res) {
        var dataDao = req.dataDao;

        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;
        query.errorHandler = function(err) {
            res.statusCode = 500;
            console.log(err);
            res.send(err);
        };
        query.successHandler = function(response) {
            res.statusCode = 200;
            res.send(response);
        };
        if (!query.id) {
            query.id = -1;
        }
        query.filter = {
            id: { term: query.id }
        };
        dataDao.readOutTable(query);
    });

};
