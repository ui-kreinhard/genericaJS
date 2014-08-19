var dbHandler = require('../dbHandler.js');
var config = require('../config.js').config();
var userConfig = require('./userConfig.js').config();

var username=userConfig.username;
var password=userConfig.password;

var hardwareId = '';
var removeAdd = 'add';

var hardwareIdIndex = process.argv.length - 1;
var removeAddIndex = process.argv.length - 2;
process.argv.forEach(function (val, index, array) {
	if(index==hardwareIdIndex) {
		hardwareId = val;
	} else if(index==removeAddIndex) {
		removeAddIndex = val;
	}
});
var sql = ''; 
if(removeAddIndex == 'add') {
   sql = "select add_keyring('" + hardwareId + "')";
} else {
   sql = "select remove_keyring('" + hardwareId + "')";
}

var successOfConnection = function(connection) {
	connection.query("select add_keyring('" + hardwareId + '")');	
};

var connection = dbHandler.dbHandler(username, password,
	function() {
		// fail
	console.log('db connection failed');
        }, 
	function() {
            connection.query(sql,
	    function(result) {
            },
            function(err) {
		console.log(err);
	    },
            function() {
		console.log('updated');
		connection.end();
            });
	}
);

