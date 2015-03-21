var async = require('async');
var pg = require('pg');
var request = require('request');
var CronJob = require('cron').CronJob;

var config = require('../config.js').config();
var userConfig = require('./userConfig.js').config();

var configPg = {
    user: userConfig.username,
    database: config.db.dbName,
    port: config.db.port,
    host: config.db.hostname,
    password:  userConfig.password
};


var httpHandler = function(methodConfiguration) {
    return function(err, client) {


        function handlePayload(payload, callback) {
            var query = client.query("update " + methodConfiguration.tableName + " set status = 'RUNNING', started = current_timestamp where id = " + payload.id);
            query.on('end', function() {
                methodConfiguration.method(
                        {
                            url: payload.url,
                            form: payload.post_data
                        },
                function(err, httpResponse, body) {
                    if (!err) {
                        var sql = "update " + methodConfiguration.tableName + " set retry_counter = retry_counter + 1, response = $$" + body + "$$, status = 'COMPLETED',response_statuscode='" + httpResponse.statusCode + "', completed = current_timestamp where id = " + payload.id;
                        client.query(sql,
                                function(result) {

                                },
                                function(error) {
                                    if (error) {
                                        var sql = "update " + methodConfiguration.tableName + " set retry_counter = retry_counter + 1,status='APPLICATION_ERROR', error=$$" + JSON.stringify(error) + "$$ where id = " + payload.id;
                                        client.query(sql);
                                    }
                                });
                    } else {
                        var sql = "update " + methodConfiguration.tableName + " set retry_counter = retry_counter + 1, status='HTTP_ERROR', error=$$" + JSON.stringify(err) + "$$ where id = " + payload.id;
                        client.query(sql);
                    }
                    callback();
                }
                );
            });
        }

        var queue = async.queue(handlePayload, 32);

        var handleStartupQuery = client.query("select * from " + methodConfiguration.tableName + " where status IN ('RUNNING', 'QUEUED')");
        handleStartupQuery.on('row', function(result) {
            queue.push(result, function() {
            });
        });

        client.on('notification', function(msg) {
            var payload = JSON.parse(msg.payload);
            queue.push(payload, function() {
            });
            queue.resume();
        });
        client.query("LISTEN " + methodConfiguration.queueName);
    };
};


function addCronJobs(err, client) {
    new CronJob('0 * * * * *', function() {
        console.log('updating failed ones');
        var sql = "update http.http_request set status = 'QUEUED' where (status = 'HTTP_ERROR' or response_statuscode <> 200) and retry_counter < 5";
        client.query(sql);
    }, null, true, "America/Los_Angeles");
}
var methodConfigurationPost = {
    queueName: 'watchers_http_post',
    tableName: 'http.http_request_post',
    method: request.post
};

var methodConfigurationGet = {
    queueName: 'watchers_http_get',
    tableName: 'http.http_request_get',
    method: request.get
};

new pg.Client(configPg).connect(httpHandler(methodConfigurationPost));
new pg.Client(configPg).connect(httpHandler(methodConfigurationGet));
new pg.Client(configPg).connect(addCronJobs);
