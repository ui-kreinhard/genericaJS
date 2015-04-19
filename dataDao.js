
exports.dataDao = function(connection) {
    function getFilter(params) {
        var filter = ' WHERE 1=1 ';
        if (params.filter) {
            for (var property in params.filter) {
                var filterObject = params.filter[property];
                var term = filterObject.term;
                switch (filterObject.operator) {
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
    }

    function getOrderBy(params) {
        var orderByString = '';

        if (params.orderBy) {
            if (typeof params.orderBy == 'string') {
                orderByString = ' ORDER BY ' + params.orderBy + ' ' + params.orderByDirection;
            } else if (params.orderBy.length > 0) {
                var newOrderByArray = [];
                for (var i = 0; i < params.orderBy.length; i++) {
                    newOrderByArray.push(params.orderBy[i] + ' ' + params.orderByDirection[i]);
                }
                orderByString = ' ORDER BY ' + newOrderByArray.join(',');
            }
        }
        return orderByString;
    }

    function getOffset(params) {
        var offset = '';
        if (params.pageSize && params.page) {
            offset = ' LIMIT ' + params.pageSize + ' OFFSET ' + (params.pageSize * (params.page - 1));
        }
        return offset;
    }

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
                        function() {

                        },
                        params.errorHandler,
                        endQuery
                        );
            },
            getCount: function() {
                return connection.queryP('select count(*) as "dataCount" from ' + params.tableName + getFilter(params)).then(function(result) {
                    response.dataCount = result[0];
                })
            },
            getTableActions: function() {
                return connection.queryP("select * from custom_table_actions where source_table_name = '" + params.tableName + "'").
                    then(function(results) {
                        response.tableActions = {}
                        results.forEach(function(result) {
                            response.tableActions[result.action_name] = result;
                        });
                    });
            },
            getRights: function() {
                connection.queryP("select * from table_rights where table_name = '" + params.tableName + "'").
                    then(function(results) {
                        response.rights = {
                            canRead: false,
                            canInsert: false,
                            canUpdate: false,
                            canDelete: false,
                            canCustomize: false
                        }
                        results.forEach(function(result) {
                            response.rights.canRead |= result.priv == 'SELECT';
                            response.rights.canInsert |= result.priv == 'INSERT';
                            response.rights.canUpdate |= result.priv == 'UPDATE';
                            response.rights.canDelete |= result.priv == 'DELETE';
                            response.rights.canCustomize |= result.can_customize;
                        })
                    })
            },
            getSchema: function() {
                return connection.queryP('select * from schema_and_translation where table_name = \'' + params.tableName + '\' ').
                    then(function(result) {
                        response.schema = result;
                    })
            },
            getData: function() {
                var filter = getFilter(params);
                var orderByString = getOrderBy(params);
                var offset = getOffset(params);

                return connection.queryP('select * from ' + params.tableName + filter + orderByString + offset).then(function(result) {
                    response.data = result
                })
            }
        };
    };
    function readOutTableQ(params, response) {

        var local = localFunctions(params, response);

        return local.getTableActions().
                then(local.getRights).
                then(local.getSchema).
                then(local.getData).
                then(local.getCount);
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
            var response = {
                schema: [],
                data: []
            };
            var local = localFunctions(params, response);


            function buildSql(response) {
                var queryString;

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
            }


            var validatonController = require('./validationController.js').validatonController(this, connection);
            var dataToInsert = params.data;
            var tableName = params.tableName;

            validatonController.
                validatePromise({
                    tableName: tableName,
                    values: dataToInsert
                }, params.validationErrorHandler).
                then(local.getSchema).
                then(buildSql, params.validationErrorHandler).
                catch (params.errorHandler);
        },
        readOutTable: function(params) {

            var response = {
                schema: [],
                data: []
            };
            var local = localFunctions(params, response);

            readOutTableQ(params, response).
                catch (function(err) {
                    response = null;
                    params.errorHandler(err);
                }).
                done(function() {
                   params.successHandler(response);
            });
        },
        readOutTableQ: readOutTableQ
    };
    return returnValue;
};
