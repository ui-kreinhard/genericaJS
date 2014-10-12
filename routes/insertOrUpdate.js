exports.insertOrUpdate = function(app, dataDaoHandler) {
    app.post('/insert_or_update', function(req, res) {
        var dataDao = req.dataDao;
        var url = require('url');
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;

        query.data = req.body.data;
        query.tableName = req.body.tableName;

        query.errorHandler = function(err) {
            res.statusCode = 500;
            console.log(err);
            res.send(err);
        };
        query.successHandler = function(response) {
            res.statusCode = 200;
            res.send(response);
        };
        query.validationErrorHandler = function(response) {
            res.statusCode = 412;
            res.send({
                errors: response
            });
        };
        dataDao.insertOrUpdateRecord(query);
    }
    );
};