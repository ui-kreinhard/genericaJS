"use strict";
exports.readOutTableData = function(app, dataDaoHandler) {
    var url = require('url');
    var errorHandler = require('../modules/errorHandler.js').errorHandler;
    var isNotDefined = require('../modules/utils.js').utils.isNotDefined;
    
    app.post('/readout_table', function(req, res) {
        var dataDao = req.dataDao;
        var url_parts = url.parse(req.url, true);
        var query = req.body;

        query.errorHandler = function(err) {
            res.statusCode = 500;
            res.send(err);
        };
        query.successHandler = function(response) {
            res.statusCode = 200;
            res.send(response);
        };

        var validateOrderBy = function() {
            var orderByDirections;
            if (typeof query.orderByDirection == 'undefined') {
                return false;
            }
            if (typeof query.orderByDirection == 'string') {
                orderByDirections = [];
                orderByDirections.push(query.orderByDirection);
            } else {
                orderByDirections = query.orderByDirection;
            }

            for (var i = 0; i < orderByDirections.length; i++) {
                if (orderByDirections[i].toLowerCase() != 'asc' && orderByDirections[i].toLowerCase() != 'desc') {
                    return true;
                }
            }
            return false;
        };

        errorHandler(req, res)(isNotDefined(query.tableName) || query.tableName == '', 'No table specified')
                (!query.pageSize, 'No pageSize specified')
                (!query.page, 'No page specified')
                (validateOrderBy, 'invalid direction', function() {
                    dataDao.readOutTable(query);
                });
    });

};