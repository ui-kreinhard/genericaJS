
exports.dataDao = function(connection) {
    var Q = require('q');
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
                var defer = Q.defer();
                connection.query('select count(*) as "dataCount" from ' + params.tableName + getFilter(params),
                        function(result) {
                            response.dataCount = result.dataCount;
                        },
                        defer.reject,
                        defer.resolve
                        );
                return defer.promise;
            },
            getTableActions: function(endQuery) {

                var defer = Q.defer();
                response.tableActions = {};
                connection.query("select * from custom_table_actions where source_table_name = '" + params.tableName + "'",
                        function(result) {
                            response.tableActions[result.action_name] = result;
                        },
                        defer.reject,
                        defer.resolve
                        );
                return defer.promise;
            },
            getRights: function(endQuery) {

                var defer = Q.defer();
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
                        defer.reject,
                        defer.resolve
                        );
                return defer.promise;
            },
            getSchema: function(endQuery) {
                var defer = Q.defer();
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
                        defer.reject,
                        defer.resolve,
                        transformationRules);
                return defer.promise;
            },
            getData: function(endQuery) {
                var defer = Q.defer();
                var orderByString = '';
                var filter = getFilter(params);
                orderByString = getOrderBy(params);

                var offset = getOffset(params);

                connection.query('select * from ' + params.tableName + filter + orderByString + offset,
                        function(result) {
                            response.data.push(result);
                        },
                        defer.reject,
                        defer.resolve
                        );
                return defer;
            }

        };
    };

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
                    connection.query(queryString, function() {}, params.errorHandler, params.successHandler);
                }
            
         
            var validatonController = require('./validationController.js').validatonController(this, connection);
            var dataToInsert = params.data;
            var tableName = params.tableName;
            
            validatonController.validatePromise({
                tableName: tableName,
                values: dataToInsert
            },  params.validationErrorHandler).then(local.getSchema).
                    then(buildSql, params.validationErrorHandler).
                    catch(params.errorHandler);
        },
        readOutTable: function(params) {

            var response = {
                schema: [],
                data: []
            };
            var local = localFunctions(params, response);

            local.getTableActions().
                    then(local.getRights).
                    then(local.getSchema).
                    then(local.getData).
                    then(local.getCount).
                    catch (
                    function(err) {
                        response = null;
                        params.errorHandler(err);
                    }
            ).done(function() {
                params.successHandler(response);
            });
        }
    };
    return returnValue;
};
