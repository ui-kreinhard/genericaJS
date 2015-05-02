"use strict";
exports.formData = function(app, dataDaoHandler) {
    var url = require('url');
    require('arguments')

    app.get('/formdata', function(req, res) {
        var dataDao = req.dataDao;

        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;

        if (!query.id) {
            query.id = -1;
        }
        query.filter = {
            id: { term: query.id }
        };

        dataDao.readOutTableQ(query).then(function(resp) {
            res.statusCode = 200;
            res.send(resp);
        }).catch(function(err) {
            res.statusCode = 500;
            console.log(err);
            res.send(err);
        })
    });

};
