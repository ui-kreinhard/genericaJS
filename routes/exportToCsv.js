exports.exportToCsv = function(app) {
    app.get('/exportToCsv', function(req, res) {
        var dataDao = req.dataDao;
        var json2csv = require('json2csv');
        var url = require('url');
        var errorHandler = require('../modules/errorHandler.js').errorHandler;
        var isNotDefined = require('../modules/utils.js').utils.isNotDefined;
        
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;

        query.errorHandler = function(err) {
            res.statusCode = 500;
            console.log(err);
            res.send(err);
        };
        query.successHandler = function(response) {
            res.statusCode = 200;

            var attributes = Object.keys(response.data[0]);
            json2csv({
                data: response.data,
                fields: attributes
            }, function(err, csv) {
                if (err) {
                    query.errorHandler(err);
                    return;
                }
                res.setHeader('Content-disposition', 'attachment; filename=' + query.tableName + '.csv');
                res.send(csv);
            });
        };
        errorHandler(req, res)(isNotDefined(query.tableName) || query.tableName == '', 'No table specified', function() {
            dataDao.readOutTableQ(query).then(function(response) {
                res.statusCode = 200;

                var attributes = Object.keys(response.data[0]);
                json2csv({
                    data: response.data,
                    fields: attributes
                }, function(err, csv) {
                    if (err) {
                        query.errorHandler(err);
                        return;
                    }
                    res.setHeader('Content-disposition', 'attachment; filename=' + query.tableName + '.csv');
                    res.send(csv);
                });
            }).
            catch(function(err) {
                    res.statusCode = 500;
                    console.log(err);
                    res.send(err);
                });
        });
    });
};