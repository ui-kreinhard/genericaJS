var username = 'postgres';
var password = 'hieWueS8';
var config = require('../config.js');
var connection = require('../dbHandler.js');
var dbHandler = connection.dbHandler(username, password, function() {
	console.log('connection failure');
}, function() {
	var dataDao = require('../dataDao.js').dataDao(dbHandler);
	var validationController = require('../validationController.js').validatonController(dataDao, dbHandler);
	validationController.validate({
		tableName: 'worktimes',
		values: {
			date_start: '2013',
			date_end: '2012'
		}
	}, function(result) {
		console.log(result);
	}
	);
});


