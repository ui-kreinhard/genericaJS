exports.dataDao = function (connection) {
    require('sugar')
    require('arguments')
    var Q = require('q')

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

    function deleteRecord(params) {
        var filter = '';
        if (params.filter) {
            filter = getFilter(params);
        } else {
            filter = " where id IN (" + params.id.join() + ')';
        }
        return connection.queryP("delete from " + params.tableName + filter);
    }

    function getCount(params) {
        return connection.queryP('select count(*) as "dataCount" from ' + params.tableName + getFilter(params)).then(function (result) {
            return result[0].dataCount;
        })
    }

    function getData(params) {
        var filter = getFilter(params);
        var orderByString = getOrderBy(params);
        var offset = getOffset(params);

        return connection.queryP('select * from ' + params.tableName + filter + orderByString + offset)
    }

    function getSchema(tableName) {
        return connection.queryP('select * from schema_and_translation where table_name = \'' + tableName + '\' ')
    }

    function getRights(tableName) {
        return connection.queryP("select * from table_rights where table_name = '" + tableName + "'").
            then(function (results) {
                var rights = {
                    canRead: false,
                    canInsert: false,
                    canUpdate: false,
                    canDelete: false,
                    canCustomize: false
                }
                results.forEach(function (result) {
                    rights.canRead |= result.priv == 'SELECT';
                    rights.canInsert |= result.priv == 'INSERT';
                    rights.canUpdate |= result.priv == 'UPDATE';
                    rights.canDelete |= result.priv == 'DELETE';
                    rights.canCustomize |= result.can_customize;
                })
                return rights;
            })
    }

    function getTableActions(tableName) {
        return connection.queryP("select * from custom_table_actions where source_table_name = '" + tableName + "'").
            then(function (results) {
                var tableActions = {}
                results.forEach(function (result) {
                    tableActions[result.action_name] = result;
                });
                return tableActions
            });
    }

    function readOutTableQ(params) {
        return Q.all([
            getTableActions.cfillFromObject(params),
            getRights.cfillFromObject(params),
            getSchema.cfillFromObject(params),
            getData(params),
            getCount(params)
        ]).spread(function (tableActions, rights, schema, data, dataCount) {
            return arguments.pack()
        })
    }

    var returnValue = {
        closeConnection: function () {
            connection.end();
        },
        deleteRecord: function (params) {
            return deleteRecord(params).
                catch(params.errorHandler).
                done(params.successHandler)

        },
        insertOrUpdateRecord: function (params) {
            function buildSql() {
                var queryString;

                var columns = [];
                var values = [];
                var fillColumnsAndValues = function () {
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
                    concatOperator = function () {
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
                connection.query(queryString, function () {
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
                then(getSchema.fill(tableName)).
                then(buildSql, params.validationErrorHandler).
                catch(params.errorHandler);
        },
        readOutTable: function (params) {
            var response = {
                schema: [],
                data: []
            };

            readOutTableQ(params, response).
                catch(function (err) {
                    response = null;
                    params.errorHandler(err);
                }).
                done(function () {
                    params.successHandler(response);
                });
        },
        readOutTableQ: readOutTableQ
    };
    return returnValue;
};
