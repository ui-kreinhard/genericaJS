exports.login = function(app, dataDaoHandler) {
    var url = require('url');
    var loginController = require('../loginController.js').loginController(dataDaoHandler);

    app.post('/login', function(req, res) {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;
        query.data = req.body.data;

        var username = query.data.username;
        var password = query.data.password;
        var sessionID = req.sessionID;

        loginController.login(username, password, sessionID, function() {
            res.end();
        }, function() {
            res.statusCode = 401;
            res.end();
        });
    });
};
