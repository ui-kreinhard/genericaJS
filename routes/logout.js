exports.logout = function(app,dataDaoHandler) {
    var loginController = require('../loginController.js').loginController(dataDaoHandler);

    app.get('/logout', function(req, res) {
        loginController.logout(req.sessionID);
    });
};