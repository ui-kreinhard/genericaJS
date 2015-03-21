
exports.validatonController = function(dataDao, connection) {
    var Q = require('q');
    var isNotDefined = require('./modules/utils.js').utils.isNotDefined;

    function encloseInTicks(stringToBeTicked) {
        return "'" + stringToBeTicked + "'";
    }
    
    function readOutValidations(tableName, successHandlerReadout, errorHandlerReadout) {
        var defer = Q.defer();

       dataDao.readOutTable({
            tableName: 'check_constraints',
            successHandler: defer.resolve,
            errorHandler: defer.reject,
            filter: {
                table_name: {term: tableName, field: 'table_name'}
            }
        });
        return defer.promise;
    }
    
    function createCheckSQL(rawCheckConditions, valuesP) {

        var values = [];
        var checkConditionsIndexed = {};

        for (var i = 0; i < rawCheckConditions.length; i++) {
            var singleValue = rawCheckConditions[i];
            checkConditionsIndexed[singleValue.column_name] = singleValue;
        }

	var alreadyInWithPart = [];
        for (var i = 0; i < rawCheckConditions.length; i++) {
            var singleValue = rawCheckConditions[i];

            values.push({
                errorMessage: singleValue.error_msg,
                columnName: singleValue.column_name,
                value: valuesP[singleValue.column_name],
                checkCondition: singleValue.check_clause,
                dataType: singleValue.data_type,
                createWithPart: function() {
		    if(alreadyInWithPart.indexOf(this.columnName)!=-1) {
			return '';
		    }
		    alreadyInWithPart.push(this.columnName);
                    var value = encloseInTicks(this.value);
                    if (this.columnName == null) {
                        return;
                    }
                    if (isNotDefined(this.value)) {
                        value = null;
                    }
                    var returnStr = value + '::' + this.dataType + ' as ' + this.columnName;
                    return returnStr;
                },
                createSelectPart: function() {
                    var isError = '1-count(*)';
                    if (this.checkCondition == null) {
                        isError = 0;
                    }
                    var returnStr = 'select ' + isError + ' as is_error, ' + encloseInTicks(this.columnName) + ' as column_to_check,' + encloseInTicks(this.errorMessage) + ' as errorMessage' + ' from ' + 'to_check ' + ' where ' + this.checkCondition;
                    return returnStr;
                }
            });
        }


        return function() {
            var defer = Q.defer();
            var returnStr = "with to_check as (select 'dummyValue' as dummy";
            for (var i = 0; i < values.length; i++) {
                var singleValue = values[i];
		var withPart = singleValue.createWithPart();
                returnStr += withPart!=''?',' + withPart:''; 
            }
            returnStr += ') ';

            // create selects
            returnStr += "select 1 as check, 'columName' as column_to_check, 'dummy error' as errorMessage where 1<>1";
            for (var i = 0; i < values.length; i++) {
                var singleValue = values[i];
                returnStr += ' union all ' + singleValue.createSelectPart();
            }
            return returnStr;
        };
    }
    
    function buildSql(values) {
        return        function(response) {
            var defer = Q.defer();
            var sql = createCheckSQL(response.data, values)();
            defer.resolve(sql);
            return defer.promise;
        };
    }
    
    function fireSql(sql) {
        var defer = Q.defer();
        connection.query(sql, function(resultRow) {
        }, defer.reject,
                defer.resolve
                );
        return defer.promise;

    }
    
    function handleResponse(response) {
        var defer = Q.defer();

        var result = response.rows;
        var isOk = true;
        for (var i = 0; i < result.length; i++) {
            var resultElement = result[i];
            if (resultElement.check == 1) {
                isOk = false;
                break;
            }
        }
        if (isOk) {
            defer.resolve(result);
        } else {
            defer.reject(result);
        }
        return defer.promise;
    }
    

    return {
        validate: function(dataToBeValidated, successHandler, errorHandler, endQuery) {
            var values = dataToBeValidated.values;
            var tableName = dataToBeValidated.tableName;
            readOutValidations(tableName).
                    then(buildSql(values)).
                    then(fireSql).
                    then(handleResponse).
                    then(successHandler).
                    catch (errorHandler);
        },
        validatePromise: function(dataToBeValidated) {
            var defer = Q.defer();
            this.validate(dataToBeValidated, defer.resolve, defer.reject);
            return defer.promise;
        }
    };
};
