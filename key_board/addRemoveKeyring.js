var scribe = require('scribe-js')();


var dbHandler = require('../dbHandler.js');
var config = require('../config.js').config();
var userConfig = require('./userConfig.js').config();
var fs = require('fs')


var username=userConfig.username;
var password=userConfig.password;

var hardwareId = '';
var removeAdd = 'add';

var removeAddIndex = process.argv.length - 1;
process.argv.forEach(function (val, index, array) {
	if(index==removeAddIndex) {
		removeAdd = val;
	}
});



var connection = dbHandler.dbHandler(username, password,
	function() {
		// fail
	console.log('db connection failed');
        }, 
	function() {
            
	}
);
var m = function() {
                console.log('waiting')
                var hw_id = fs.readFileSync(removeAdd);
                var sql = '';
                if(removeAdd=='add') {
                    sql = "select add_keyring('" + hw_id + "')"
                } else {
                    sql = "select remove_keyring('" + hw_id + "')"
                }
                    
                console.log("select add_keyring('" + hw_id + "')");
                connection.query(sql, function(result) {
                    console.log(result);
                }, function(err) {
                    console.log(err);
                }, function() {
                    console.log('updated');
                               setTimeout(m,1);
                })
            };
           setTimeout(m,1);