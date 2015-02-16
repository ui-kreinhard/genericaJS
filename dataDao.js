
exports.dataDao = function(connection) {
    var setSessionCommands = function() {
        connection.query("SET datestyle = 'MDY'", function(result) {
           console.log(result);

        },
              function() {},
                function() {});
    };
    setSessionCommands();
    
    var getFilter = function(params) {
        var filter = ' WHERE 1=1 ';
        if (params.filter) {
            for (var property in params.filter) {
                var filterObject = params.filter[property];
                var term = filterObject.term;                
                switch(filterObject.operator) {
                    case 'LIKE':
                        filter += ' AND ' + property + '::varchar LIKE ' + "'" + term + "%'";
                    break;
                    case '=':
                    default:
                        filter += ' AND ' + property + '=' + "'" + term + "'";    
                    break;
                }
            }
        }
        return filter;
    };
    var getOrderBy = function(params) {
        var orderByString = '';

        if (params.orderBy) {
            if (typeof params.orderBy == 'string') {
                orderByString = ' ORDER BY ' + params.orderBy + ' ' + params.orderByDirection;
            } else if(params.orderBy.length > 0){
                var newOrderByArray = [];
                for (var i = 0; i < params.orderBy.length; i++) {
                    newOrderByArray.push(params.orderBy[i] + ' ' + params.orderByDirection[i]);
                }
                orderByString = ' ORDER BY ' + newOrderByArray.join(',');
            }
        }
        return orderByString;
    };
    var getOffset = function(params) {
        var offset = '';
        if (params.pageSize && params.page) {
            offset = ' LIMIT ' + params.pageSize + ' OFFSET ' + (params.pageSize * (params.page - 1));
        }
        return offset;
    };

    var localFunctions = function(params, response) {
        return {
            deleteRecord: function(endQuery) {
                var filter = '';
                if (params.filter) {
                    filter = getFilter(params);
                } else {
                    filter = " where id IN (" + params.id.join() + ')';
                }
                connection.query("delete from " + params.tableName + filter,
                        function(result) {

                        },
                        params.errorHandler,
                        endQuery
                        );
            },
            getCount: function() {
                connection.query('select count(*) as "dataCount" from ' + params.tableName + getFilter(params),
                        function(result) {
                            response.dataCount = result.dataCount;
                        },
                        params.errorHandler,
                        function() {
                            params.successHandler(response);
                        }
                );
            },
            getTableActions: function(endQuery) {
                response.tableActions = {};
                connection.query("select * from custom_table_actions where source_table_name = '" + params.tableName + "'",
                        function(result) {
                            response.tableActions[result.action_name] = result;
                            
                        },
                        params.errorHandler,
                        endQuery
                        );
            },
            getRights: function(endQuery) {
                response.rights = {canRead: false, canInsert: false, canUpdate: false, canDelete: false};
                connection.query("select * from table_rights where table_name = '" + params.tableName + "'",
                        function(result) {
                            if (result.priv == 'SELECT') {
                                response.rights.canRead = true;
                            }
                            if (result.priv == 'INSERT') {
                                response.rights.canInsert = true;
                            }
                            if (result.priv == 'UPDATE') {
                                response.rights.canUpdate = true;
                            }
                            if (result.priv == 'DELETE') {
                                response.rights.canDelete = true;
                            }
                            if (result.can_customize) {
                                response.rights.canCustomize = true;
                            }
                        },
                        params.errorHandler,
                        endQuery
                        );
            },
            getSchema: function(endQuery) {
                var transformationRules = [
                    function(result) {
                        return result;
                    }
                ];
                connection.query(
                        'select * from schema_and_translation where table_name = \'' + params.tableName + '\' ',
                        function(result) {
                            response.schema.push(result);
                        },
                        params.errorHandler,
                        endQuery, transformationRules);
            },
            getData: function(endQuery) {
                var orderByString = '';
                var newOrderByArray = [];
                var filter = getFilter(params);
                orderByString = getOrderBy(params);

                var offset = getOffset(params);

                connection.query('select * from ' + params.tableName + filter + orderByString + offset,
                        function(result) {
                            response.data.push(result);
                        },
                        params.errorHandler,
                        function() {
                            endQuery();
                        }

                );
            }

        };
    }

    var returnValue = {
        closeConnection: function() {
            connection.end();
        },
        deleteRecord: function(params) {
            var local = localFunctions(params, response);
            var response = {};
            local.deleteRecord(function() {
                params.successHandler(response);
            });
        },
        insertOrUpdateRecord: function(params) {
            var validatonController = require('./validationController.js').validatonController(this, connection);
            var dataToInsert = params.data;
            var tableName = params.tableName;
            var response = {
                schema: [],
                data: []
            };
            validatonController.validate({
                tableName: tableName,
                values: dataToInsert
            }, function(result) {
                var local = localFunctions(params, response);
                local.getSchema(function(response) {
                    var queryString = 'select 1';

                    var columns = [];
                    var values = [];
                    var fillColumnsAndValues = function() {
                        for (var attributename in dataToInsert) {
                            var value = dataToInsert[attributename];
                            if (value != null) {
                                columns.push('"' + attributename + '"');
                                values.push("'" + value + "'");
                            } else {
                                columns.push('"' + attributename + '"');
                                values.push(null);
                            }
                        }
                    };
                    // recognize if we have an id - if so, it has to be an update
                    if (typeof dataToInsert.id == 'undefined' || dataToInsert.id == null || dataToInsert.id == 'null' || dataToInsert.id == '') {
                        if (typeof dataToInsert.id != 'undefined') {
                            delete dataToInsert.id;
                        }
                        fillColumnsAndValues();
                        queryString = 'INSERT INTO ' + tableName + '(' + columns.join() + ') VALUES (' + values.join() + ')';
                    } else {
                        fillColumnsAndValues();
                        queryString = 'UPDATE ' + tableName + ' SET ';
                        var whereCondition = ' where id=';
                        var called = false;
                        concatOperator = function() {
                            if (!called) {
                                called = true;
                                return '';
                            }
                            return ',';
                        };
                        for (var i = 0; i < columns.length; i++) {
                            if (columns[i] == '"id"') {
                                whereCondition += values[i];
                                continue;
                            }
                            queryString += concatOperator() + columns[i] + '=' + values[i];
                        }
                        queryString += whereCondition;
                    }
                    connection.query(queryString, function() {
                    }, params.errorHandler, params.successHandler);
                });
            }, function(err) {
                params.validationErrorHandler(err);
            });


        },
        readOutSchemaData: function(params) {
            var response = {
                schema: []
            };
            var local = localFunctions(params, response);

            local.getSchema(function() {
                params.successHandler(response);
            });
        },
        readOutTable: function(params) {

            var response = {
                schema: [],
                data: []
            };
            var local = localFunctions(params, response);
            local.getTableActions(function() {
                local.getRights(function() {
                    local.getSchema(
                            function() {
                                local.getData(function() {
                                    local.getCount();
                                });
                            }
                    );
                });
            });
        }
    };
    return returnValue;
};
