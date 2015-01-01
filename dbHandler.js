

exports.dbHandler = function(username, password, errorHandler, successHandler) {
    var config = require('./config.js').config();
    var Stopwatch = require('timer-stopwatch');
    var pg = require('pg');


    var scribe = process.scribe;

    var logger = scribe.console({
        console: {
            colors: 'white'
        },
        logWriter: {
            rootPath: 'sql_logs'
        }
    });


    var connectionString = "postgres://" + username + ":" + password + "@" + config.db.hostname + ":" + config.db.port + "/" + config.db.dbName;

    var client = new pg.Client(connectionString);
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
