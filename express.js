
var config = require('./config.js').config();

var dataDaoHandler = function() {
    var dataDaos = {};
    return {
        add: function(sessionID, dataDao) {
            if (!dataDaos[sessionID]) {
                dataDaos[sessionID] = dataDao;
            }
        },
        get: function(sessionID) {
            return dataDaos[sessionID];
        },
        remove: function(sessionID) {
            delete dataDaos[sessionID];
        }
    }
}();

var express = require('express');
var url = require('url');
var app = express();
var router = express.Router();


var errorHandler = function(req,res) {
	
	var noneHandler = function(cmp, errorMessage) {
        return noneHandler;
    };
	return function(cmp, errorMessage, successHandler) {
	 var resultOfCheck;
	 if(typeof cmp == 'function') {
		 resultOfCheck = cmp();
	 } else {
		 resultOfCheck = cmp;
	 }
     if (resultOfCheck) {
         res.statusCode = 500;
         console.log(errorMessage);
         res.send(errorMessage);
	//	 res.end();
         return noneHandler;
     } else {
		 if( successHandler && typeof successHandler == 'function') {
			 successHandler();
		 }
     }
     return errorHandler(req,res);
    }
}

var cookieParser = require('cookie-parser');
var session = require('express-session');
app.use(cookieParser()); 
app.use(session({
    secret: 'keyboard cat',
    proxy: true 
}));

app.use('/view', express.static(__dirname + '/view'));
var bodyParser = require('body-parser');
// parse application/json and application/x-www-form-urlencoded
app.use(bodyParser());

// parse application/vnd.api+json as json
app.use(bodyParser.json({type: 'application/json'}));

app.use(function(req, res, next) {
	
    if(req.originalUrl=='/logout'||req.originalUrl == '/login' || req.originalUrl.indexOf('/view')==0 ) {
        next();
        return;
    }
    if (req.sessionID && dataDaoHandler.get(req.sessionID)) {
        req.dataDao = dataDaoHandler.get(req.sessionID);
    	next();
        return;
    }
    // unauthorized access
    res.statusCode = 401;
	res.send();
});


app.get('/logout', function(req,res) {
	dataDaoHandler.remove(req.sessionID);
	req.session.destroy();
	res.end();
});

app.post('/login', function(req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    query.data = req.body.data;
	
    var username = query.data.username;
    var password = query.data.password;
    if (!dataDaoHandler.get(req.sessionID)) {
        var sessionID = req.sessionID;
        var dbHandler = require('./dbHandler.js');
        var config = require('./config.js').config();
        var connection = dbHandler.dbHandler(username, password,
                function() {
                    res.statusCode = 401;
	                res.end();
                }, function() {
                    var dataDao = require('./dataDao.js').dataDao(connection);
                    dataDaoHandler.add(sessionID, dataDao);
                    res.end();
                }
        );
    }

    
});

app.post('/delete', function(req, res) {
	var dataDao = req.dataDao;
	var url = require('url');
    console.log(req.session);
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
	
	var tableName = req.body.tableName;
	var id = req.body.id;
	errorHandler(req, res)
	(typeof tableName == 'undefined' || tableName == null,'No tablename specified' )
	(typeof id === 'undefined' || id==null, 'No id specified', function() {
		query.id = id;
		query.tableName = tableName;
		query.errorHandler = function(err) {
        	res.statusCode = 500;
        	console.log(err);
        	res.send(err);
    	};
    	query.successHandler = function(response) {
        	res.statusCode = 200;
        	res.send(response);
	    };
		dataDao.deleteRecord(query);
	});
	
   
});

app.post('/insert_or_update', function(req, res) {
    var dataDao = req.dataDao;

    
    var dataDao = req.dataDao;
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    query.data = req.body.data;
    query.tableName = req.body.tableName;

    query.errorHandler = function(err) {
        res.statusCode = 500;
        console.log(err);
        res.send(err);
    };
    query.successHandler = function(response) {
        res.statusCode = 200;
        res.send(response);
    };
    query.validationErrorHandler = function(response) {
	res.statusCode = 412;
        res.send({
		errors: response
	});
    };
    dataDao.insertOrUpdateRecord(query);
}
);

app.get('/formdata', function(req, res) {
    var dataDao = req.dataDao;


    var url = require('url');
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    query.errorHandler = function(err) {
        res.statusCode = 500;
        console.log(err);
        res.send(err);
    };
    query.successHandler = function(response) {
        res.statusCode = 200;
        res.send(response);
    };
    if (!query.id) {
        query.id = -1;
    }
    query.filter = {
        id: query.id
    };
    dataDao.readOutTable(query)
});

app.get('/readout_table', function(req, res) {
    var dataDao = req.dataDao;

    var url = require('url');
    console.log(req.session);
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    
 

    query.errorHandler = function(err) {
        res.statusCode = 500;
        console.log(err);
        res.send(err);
    };
    query.successHandler = function(response) {
        res.statusCode = 200;
        res.send(response);
    };

	var validateOrderBy = function() {

		var orderByDirections;
		if(typeof query.orderByDirection =='undefined') {
			return false;
		}
		if(typeof query.orderByDirection == 'string') {
			orderByDirections = [];
			orderByDirections.push(query.orderByDirection);
		} else {
			orderBy = query.orderByDirection;
		}
		
		for (var i = 0; i < orderByDirections.length; i++) {
			if (orderByDirections[i].toLowerCase() != 'asc' && orderByDirections[i].toLowerCase() != 'desc') {
				return true;
			}
		}
		return false;
	};

    errorHandler(req, res)(typeof query.tableName == 'undefined' || query.tableName == null || query.tableName == '', 'No table specified')
            (!query.pageSize, 'No pageSize specified')
            (!query.page, 'No page specified')
			(validateOrderBy,'invalid direction', function() {
				dataDao.readOutTable(query);
			});
});

var server = app.listen(8082, function() {
    console.log('Listening on port %d', server.address().port);
});
