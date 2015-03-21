exports.formElementsOrder = function(app) {
    app.post('/update_formelements_order', function(req, res) {
        var errorHandler = require('../modules/errorHandler.js').errorHandler;
        var isNotDefined = require('../modules/utils.js').utils.isNotDefined;
   
        var dataDao = req.dataDao;

        var table_name = req.body.table_name;
        var table_schema = req.body.table_schema;
        var formElements = req.body.formElements;
        errorHandler(req, res)
                (isNotDefined(table_name), 'No tablename specifed')
                (isNotDefined(table_schema), 'No schema specified')
                (isNotDefined(formElements), 'No elements specified', function() {
                    var deleteParams = {};
                    deleteParams.tableName = 'formelements_order';
                    deleteParams.errorHandler = function(err) {
                        res.statusCode = 500;
                        res.send(err);
                    };
                    deleteParams.filter = {
                        table_name: { term: req.body.table_name},
                        schema_name: {term: req.body.table_schema}
                    };
                    deleteParams.successHandler = function(response) {
                        var i = 0;
                        var length = formElements.length;

                        var insertNextRecord = function() {
                            var formElement = formElements[i];
                            var query = {};
                            query.data = {
                                column_name: formElement.column_name,
                                table_name: formElement.table_name,
                                schema_name: formElement.table_schema
                            };

                            query.tableName = 'formelements_order';

                            query.errorHandler = function(err) {
                                res.statusCode = 500;
                                console.log(err);
                                res.send(err);
                            };
                            query.validationErrorHandler = function(response) {
                                res.statusCode = 412;
                                res.send({
                                    errors: response
                                });
                            };
                            query.successHandler = function(response) {
                                i++;
                                if (i < length) {
                                    insertNextRecord();
                                } else {
                                    res.statusCode = 200;
                                    res.send();
                                }
                            };
                            dataDao.insertOrUpdateRecord(query);
                        };
                        insertNextRecord();
                    };
                    dataDao.deleteRecord(deleteParams);
                });

    });
};