exports.dbHandler = function(connectionString, errorHandler, successHandler) {
    var pg = require('pg');
    var client = new pg.Client(connectionString);
    client.connect(function(err, client, done) {
        if(err) {
            client.end();
            errorHandler(err);
        } else {
            successHandler();   
        }
    });
    
    client.oldQuery = client.query;
    client.query = function(query, successHandlerQuery, errorHandlerQuery, endQuery, transformationRules) {
        console.log(query);
        var retQuery = client.oldQuery(query, 
        function(err) {
            if(err!=null) {            
                errorHandlerQuery(err);
            }
        });    
        if(transformationRules) {
            retQuery.on('row', function(result) {
               for(var i=0;i<transformationRules.length;i++) {
                   var rule = transformationRules[i];
                   result = rule(result);
               } 
               successHandlerQuery(result);
            });
        } else {
            retQuery.on('row', successHandlerQuery);
        }
        retQuery.on('end', endQuery);
        
    };
    return client;
};
