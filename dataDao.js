var dbHandler = require('./dbHandler.js');
var config = require('./config.js').config();

var conString = "postgres://" + config.db.username + ":" + config.db.password + "@localhost:" + config.db.port + "/" + config.db.dbName;
var connection = dbHandler.dbHandler(conString,
        function() {

        }, function() {

}
);
exports.dataDao = function() {
    var localFunctions = function(params, response) {
        return {
            getPrimaryKey: function(endQuery) {
                
            },
            getCount: function() {
                connection.query('select count(*) as "dataCount" from ' + params.tableName,
                        function(result) {
                            response.dataCount = result.dataCount;
                        },
                        params.errorHandler,
                        function() {
                            params.successHandler(response);
                        }
                );
            },
            getSchema: function(endQuery) {
                connection.query(
                        'select * from schema_and_translation where table_name = \'' + params.tableName + '\' ',
                        function(result) {
                            response.schema.push(result);
                        },
                        params.errorHandler,
                        endQuery);
            },
            getData: function(endQuery) {
                var orderByString = '';
                var newOrderByArray = [];
                if (params.orderBy) {
                    if (typeof params.orderBy == 'string') {
                        orderByString = ' ORDER BY ' + params.orderBy + ' ' + params.orderByDirection;
                    } else {
                        for (var i = 0; i < params.orderBy.length; i++) {
                            newOrderByArray.push(params.orderBy[i] + ' ' + params.orderByDirection[i]);
                        }
                        orderByString = ' ORDER BY ' + newOrderByArray.join(',');
                    }
                }
                connection.query('select * from ' + params.tableName + orderByString + ' LIMIT ' + params.pageSize + ' OFFSET ' + (params.pageSize * (params.page - 1)),
                        function(result) {
                            response.data.push(result);
                        },
                        params.errorHandler,
                        endQuery
                );
            }

        };
    }


    var returnValue = {
        insertOrUpdateRecord: function(params) {
            var dataToInsert = params.data;
            var tableName = params.tableName;
            var response = {
                schema: [],
                data: []
            };
            var local = localFunctions(params, response);
            local.getSchema(function(response) {
                var queryString = 'select 1';
                
                var columns = [];
                var values = [];
                for(var attributename in dataToInsert){
                     var value = dataToInsert[attributename];
             
                        columns.push('"'+ attributename + '"');
                        values.push("'" + value + "'");
             
                }
                if (typeof dataToInsert.id !== 'undefined' && dataToInsert.id !== null){
                    queryString = 'INSERT INTO ' + tableName + '(' + columns.join() + ') VALUES (' + values.join() +')';
                } else {
                  
                }
                connection.query(queryString, function() {}, params.errorHandler, params.successHandler);
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
            local.getSchema(
                    function() {
                        local.getData(function() {
                            local.getCount();
                        });
                    }
            );
        }
    };
    return returnValue;
}