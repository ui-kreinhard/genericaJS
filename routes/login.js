exports.login = function(app, dataDaoHandler) {
    var url = require('url');
    var dbHandler = require('../dbHandler.js');

    app.post('/login', function(req, res) {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;
        query.data = req.body.data;

        var username = query.data.username;
        var password = query.data.password;
        if (!dataDaoHandler.get(req.sessionID)) {
            var sessionID = req.sessionID;
            var connection = dbHandler.dbHandler(username, password,
                    function() {
                        res.statusCode = 401;
                        res.end();
                    }, function() {
                var dataDao = require('../dataDao.js').dataDao(connection);
                dataDaoHandler.add(sessionID, dataDao);
                res.end();
            }
            );
        }
    });
}
