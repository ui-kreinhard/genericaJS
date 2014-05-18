exports.dbHandler = function(connectionString, errorHandler, successHandler) {
    var pg = require('pg');
    var client = new pg.Client(connectionString);
	console.log(connectionString);
    client.connect(function(err, client, done) {
        if(err) {
            client.end();
            errorHandler(err);
        } else {
            successHandler();   
        }
    });
    
    client.oldQuery = client.query;
    client.query = function(query, successHandlerQuery, errorHandlerQuery, endQuery) {
        console.log(query);
        var retQuery = client.oldQuery(query, 
        function(err) {
            if(err!=null) {            
                errorHandlerQuery(err);
            }
        });    
        retQuery.on('row', successHandlerQuery);
        retQuery.on('end', endQuery);
    };
    return client;
};
