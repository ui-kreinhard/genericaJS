var dbHandler = require('./dbHandler.js');
var dataDao = require('./dataDao.js').dataDao();

var express = require('express');

var app = express();
var router = express.Router();

app.use('/view', express.static(__dirname + '/view'));
var bodyParser = require('body-parser');
// parse application/json and application/x-www-form-urlencoded
app.use(bodyParser());

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/json' }));


app.post('/insert_or_update', function(req, res) {

    var url = require('url');
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
    dataDao.insertOrUpdateRecord(query);
}
);

app.get('/formdata', function(req, res) {
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
    dataDao.readOutSchemaData(query);

});

app.get('/readout_table', function(req,res) {
    var url = require('url');
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var noneHandler = function(cmp, errorMessage) {
        return noneHandler;   
    }
    var errorHandler = function(cmp, errorMessage) {
        if(cmp) {
            res.statusCode = 500;
            console.log(errorMessage);
            res.send(errorMessage); 
            return noneHandler;
        }
        return errorHandler;
    }
    
    query.errorHandler = function(err) {
        res.statusCode = 500;
        console.log(err);
        res.send(err); 
    };
    query.successHandler = function(response) {
        res.statusCode = 200;
        res.send(response);
    };
    errorHandler(typeof query.tableName == 'undefined' || query.tableName==null || query.tableName =='', 'No table specified')
    (!query.pageSize, 'No pageSize specified')
    (!query.page, 'No page specified');
   
    if(query.orderBy) {
        if(query.orderByDirection) {
            if(typeof query.orderBy != 'string' && typeof query.orderByDirection != 'string') {
                if(query.orderBy.length!= query.orderByDirection.length) {
                    errorHandler(true, 'order direction do not match length of orderBy length');             
                } else {
                    for(var i=0;i<query.orderByDirection.length;i++) {
                        if(query.orderByDirection[i].toLowerCase()!='asc' && query.orderByDirection[i].toLowerCase()!='desc') {
                            errorHandler(true, 'invalid direction');                     
                        }
                    }
                }
            }
        }
    }
    dataDao.readOutTable(query);
});

var server = app.listen(8082, function() {
    console.log('Listening on port %d', server.address().port);
});
