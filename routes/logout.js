exports.logout = function(app,dataDaoHandler) {

    app.get('/logout', function(req, res) {
        dataDaoHandler.remove(req.sessionID);
        req.session.destroy();
        res.end();
    });
};