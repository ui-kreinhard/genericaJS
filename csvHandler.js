exports.csvHandler = function(dataDao) {
    return {
        insertRecords: function(csvConvertedObject, finishedHandler, tableName) {
console.log(csvConvertedObject);
            var i = 0;
            var overallResponse = {
                errors: [],
                success: []
            };
            var length = csvConvertedObject.length;

            var insertNextRecord = function() {
                var query = {};
                query.data = csvConvertedObject[i];
                
                query.tableName = tableName;

                query.errorHandler = function(err) {
                    err.recordNumber = i + 1;
                    i++;
                    overallResponse.errors.push(err);
                    if (i < length) {
                        insertNextRecord();
                    } else {
                        finishedHandler(overallResponse);
                    }
                };
                query.validationErrorHandler = function(response) {
                    response.recordNumber = i + 1;
                    i++;
                    overallResponse.errors.push(response);
                    if (i < length) {
                        insertNextRecord();
                    } else {
                        finishedHandler(overallResponse);


                    }
                };
                query.successHandler = function(response) {
                    response.recordNumber = i + 1;
                    overallResponse.success.push(response);
                    i++;
                    if (i < length) {
                        insertNextRecord();
                    } else {
                        finishedHandler(overallResponse);
                    }
                };
                dataDao.insertOrUpdateRecord(query);
            };
            insertNextRecord();
        }
    }
};