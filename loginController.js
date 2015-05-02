var Q = require('q')
exports.loginController = function(dataDaoHandler) {
    var dbHandler = require('./dbHandler.js');

    return ret = {
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
        },
        loginQ: function(username, password, sessionID) {
            var defer = Q.defer();
            ret.login(username, password, sessionID, defer.resolve, defer.reject);
            return defer.promise;
        }

    };
};
