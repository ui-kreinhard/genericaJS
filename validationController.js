
exports.validatonController = function(dataDao) {
	var privateMethods = {
		encloseInTicks: function(stringToBeTicked) {
			return "'" + stringToBeTicked + "'";
		},
		readOutValidations: function(tableName, successHandlerReadout, errorHandlerReadout) {
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
			for(var i=0;i<rawCheckConditions.length;i++) {
				var singleValue = rawCheckConditions[i];
				values.push({
					columnName: singleValue.column_name,
					value: valuesP[singleValue.column_name],
					checkCondition: singleValue.check_clause,
					createWithPart: function() {
                                                var returnStr = privateMethods.encloseInTicks(this.value) + '::text' + ' as ' + this.columnName;
                                                return returnStr;
                                        },
                                        createSelectPart: function() {
                                                var returnStr = 'select count(*) as is_error, ' + privateMethods.encloseInTicks(this.columnName) + ' as column_to_check from ' + 'to_check ' + ' where ' + this.checkCondition;
                                                return returnStr;
                                        }
				});
			}	
			console.log();
			console.log(values);
			
			
			return function() {
				var returnStr = "with to_check as (select 'dummyValue' as dummy";
				for(var i=0;i<values.length;i++) {
					var singleValue = values[i];
					returnStr += ',' + singleValue.createWithPart(); 
				}	
				returnStr += ') ';
				
				// create selects
				returnStr += "select 1 as check, 'columName' as column_to_check where 1<>1";
				for(var i=0;i<values.length;i++) {
					var singleValue = values[i];
					returnStr += ' union all ' + singleValue.createSelectPart();	
				}
				return returnStr;
			}	
		}
	};

	return {
		validate: function(dataToBeValidated) {
			var values = dataToBeValidated.values;
			var tableName = dataToBeValidated.tableName;
			privateMethods.readOutValidations(tableName, function(response) {
				console.log(response);
				var sql = privateMethods.createCheckSQL(response.data, values)();
				console.log(sql);
			});
		}

	};
};