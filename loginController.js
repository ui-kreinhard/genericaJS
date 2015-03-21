
exports.loginController = function(dataDaoHandler) {
    var dbHandler = require('./dbHandler.js');

    return {
        logout: function(sessionID) {
            dataDaoHandler.remove(sessionID);
        },
        login: function(username, password, sessionID, successHandler, errorHandler) {
            if (!dataDaoHandler.get(sessionID)) {
                var connection = dbHandler.dbHandler(username, password,
                        function() {
                            errorHandler();
                        },
                        function() {
                            var dataDao = require('./dataDao.js').dataDao(connection);
                            dataDaoHandler.add(sessionID, dataDao);
                            successHandler(connection);
                        }
                );
            }
        }
    };
};
