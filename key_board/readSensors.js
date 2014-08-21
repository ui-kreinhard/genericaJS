var sensors = require('./Sensor_Simulator.js').sensors;
var dbHandler = require('../dbHandler.js');
var config = require('../config.js').config();
var userConfig = require('./userConfig.js').config();
var username = userConfig.username;
var password = userConfig.password;
var lock = true;

var sql = 'select * from key_board.check_for_critical_key';
console.log(sensors);


var doOnHigh = null;
var doOnHighOrig = null;
var timeOutFunction = function() {
    sensors.stopPiezo();
    doOnHigh = doOnHighOrig;
    sensors.readDoor(doOnHighWrapper,timeOutFunction);
};

doOnHighOrig = function() {
    console.log('query db');
    connection.query(sql,
            function(result) {
                if (!result.is_key_taken) {
                    console.log(doOnHigh);
                    sensors.startPiezo();
                    setTimeout(timeOutFunction, 2500);
                } else {
                    timeOutFunction();
                }
            },
            function(err) {
                console.log(err);
            },
            function(result) {
           
            });
};

doOnHigh = doOnHighOrig;

var doOnHighWrapper = function() {
    doOnHigh();
    doOnHigh = function() {
    };
};

var connection = dbHandler.dbHandler(username, password,
        function() {
            // fail
            console.log('db connection failed');
        },
        function() {
            sensors.readDoor(doOnHighWrapper,timeOutFunction);
        });


