var scribe = require('scribe-js')();
var config = require('./config.js').config();

process.scribe = scribe;
var console = process.console;

var dataDaoHandler = require('./dataDaoHandler.js').dataDaoHandler();
require('./sessionTimeoutHandler.js').sessionTimeoutHandler(dataDaoHandler, config.session.sessionTimeOut);

var compress = require('compression')
var express = require('express');
var url = require('url');
var app = express();
var router = express.Router();
var cookieParser = require('cookie-parser');
var session = require('express-session');
var generateSessionCrypto = require('./modules/utils.js').utils.generateSessionCrypto;
app.use(compress());  
app.use(cookieParser());
app.use(session({
    secret: generateSessionCrypto(),
    proxy: true
}));
app.use(scribe.express.logger());
app.use('/logs', scribe.webPanel());


var errorHandler = require('./modules/errorHandler.js').errorHandler;

var isNotDefined = require('./modules/utils.js').utils.isNotDefined;

app.use('/view', express.static(__dirname + '/view'));
var bodyParser = require('body-parser');
var multer = require('multer')

// parse application/json and application/x-www-form-urlencoded
app.use(bodyParser({limit: '50mb'}));
// parse application/vnd.api+json as json
app.use(bodyParser.json({type: 'application/json'}));
app.use(multer({dest: './uploads/'}));
app.use(function(req, res, next) {

    if (req.originalUrl == '/logout' || req.originalUrl == '/login' || req.originalUrl.indexOf('/view') == 0) {
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

require("fs").readdirSync("./routes").forEach(function(file) {
    var module = require("./routes/" + file);

    module[function() {
        for (var k in module)
            return k
    }()](app, dataDaoHandler);
    console.tag("NodeJsModules").log("loading module " + file + "....done");

});


var server = app.listen(8082, function() {
    console.log('Listening on port %d', server.address().port);
});
