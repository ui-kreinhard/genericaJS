exports.login = function(app, dataDaoHandler) {
    var loginController = require('../loginController.js').loginController(dataDaoHandler);

    app.post('/login', function(req, res) {
        var data = Object.merge({sessionID: req.sessionID}, req.body.data)

        loginController.loginQ.cfillFromObject(data).
            then(res.sendStatus.bind(res, 200)).
            catch(res.sendStatus.bind(res,401));
    });
};
