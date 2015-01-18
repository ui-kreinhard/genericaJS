
exports.validatonController = function(dataDao, connection) {
        var isNotDefined = require('./modules/utils.js').utils.isNotDefined;

	var privateMethods = {
		encloseInTicks: function(stringToBeTicked) {
			return "'" + stringToBeTicked + "'";
		},
		readOutValidations: function(tableName, successHandlerReadout, errorHandlerReadout) {
			if(typeof tableName =='undefined') {
				console.log();
			}
			var constraints = dataDao.readOutTable({
				tableName: 'check_constraints',
				successHandler: successHandlerReadout,
				filter: {
					table_name: tableName
				}  
			});
		},
		createCheckSQL: function(rawCheckConditions, valuesP) {
                    
			var values = [];
                        var checkConditionsIndexed = {};
                        
                        for(var i=0;i<rawCheckConditions.length;i++) {
                            var singleValue = rawCheckConditions[i];
                            checkConditionsIndexed[singleValue.column_name] = singleValue;
                        }
                        
                        
			for(var i=0;i<rawCheckConditions.length;i++) {
				var singleValue = rawCheckConditions[i];
                                
				values.push({
					errorMessage: singleValue.error_msg,
					columnName: singleValue.column_name,
					value: valuesP[singleValue.column_name],
					checkCondition: singleValue.check_clause,
                                        dataType: singleValue.data_type,
					createWithPart: function() {
                                            var value = privateMethods.encloseInTicks(this.value);
                                                if(this.columnName==null) {
                                                    return;
                                                }
                                                if(isNotDefined(this.value)) {
                                                    value = null;
                                                }
                                                var returnStr = value + '::' + this.dataType + ' as ' + this.columnName;
                                                return returnStr;
                                        },
                                        createSelectPart: function() {
                                                var isError = '1-count(*)';
                                                if(this.checkCondition==null) {
                                                    isError = 0
                                                }
                                                var returnStr = 'select ' + isError + ' as is_error, ' + privateMethods.encloseInTicks(this.columnName) + ' as column_to_check,' + privateMethods.encloseInTicks(this.errorMessage) + ' as errorMessage'  +' from ' + 'to_check ' + ' where ' + this.checkCondition;
                                                return returnStr;
                                        }
				});
			}	
			
			
			return function() {
				var returnStr = "with to_check as (select 'dummyValue' as dummy";
				for(var i=0;i<values.length;i++) {
					var singleValue = values[i];
					returnStr += ',' + singleValue.createWithPart(); 
				}	
				returnStr += ') ';
				
				// create selects
				returnStr += "select 1 as check, 'columName' as column_to_check, 'dummy error' as errorMessage where 1<>1";
				for(var i=0;i<values.length;i++) {
					var singleValue = values[i];
					returnStr += ' union all ' + singleValue.createSelectPart();	
				}
				return returnStr;
			}	
		}
	};

	return {
		validate: function(dataToBeValidated,successHandler, errorHandler, endQuery) {
			var values = dataToBeValidated.values;
			var tableName = dataToBeValidated.tableName;
			privateMethods.readOutValidations(tableName, function(response) {
				var sql = privateMethods.createCheckSQL(response.data, values)();
				// fire sql
				var result = [];
				var resultOfValidation = connection.query(sql, function(resultRow) {
					result.push(resultRow);
				}, errorHandler,
				function() {
					var isOk = true;
					for(var i=0;i<result.length;i++) {
						var resultElement = result[i];
						if(resultElement.check==1) {
							isOk = false;
							break;
						}
					}
					if(isOk) {
						successHandler(result);	
					} else {
						errorHandler(result);
					}
					
				});
			}, errorHandler)
		}

	};
};
