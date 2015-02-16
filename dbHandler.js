var scribe = process.scribe;

var logger = scribe.console({
    console: {
        colors: 'white'
    },
    logWriter: {
        rootPath: 'sql_logs'
    }
});


exports.dbHandler = function(username, password, errorHandler, successHandler) {
    var config = require('./config.js').config();
    var Stopwatch = require('timer-stopwatch');
    var pg = require('pg');

    // remap config in own object, avoids problems with the url fuck up
    var configPg = {
        user: username,
        database: config.db.dbName,
        port: config.db.port,
        host: config.db.hostname,
        password: password
    };
    var client = new pg.Client(configPg);
    client.connect(function(err, client, done) {
        if (err) {
            logger.error(err);
            errorHandler(err);
        } else {
            successHandler();
        }
    });

    client.oldQuery = client.query;
    client.query = function(query, successHandlerQuery, errorHandlerQuery, endQuery, transformationRules) {
        var stopwatch = new Stopwatch();


        stopwatch.start();
        var retQuery = client.oldQuery(query,
                function(err) {
                    if (err != null) {
                        logger.log(query);
                        errorHandlerQuery(err);
                    }
                });

        retQuery.on('end', function(result) {
            stopwatch.stop();
            logger.log(query + ' [' + stopwatch.ms + 'ms]');
        });
        if (transformationRules) {
            retQuery.on('row', function(result) {
                for (var i = 0; i < transformationRules.length; i++) {
                    var rule = transformationRules[i];
                    result = rule(result);
                }
                successHandlerQuery(result);
            });
        } else {
            retQuery.on('row', function(result) {
                successHandlerQuery(result);
            });
        }
        retQuery.on('end', endQuery);

    };
    return client;
};
