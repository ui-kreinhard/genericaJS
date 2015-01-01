exports.dataDaoHandler = function() {
    var console = process.console;

    var dataDaos = {};
    return {
        add: function(sessionID, dataDao) {
            if (!dataDaos[sessionID]) {
                dataDaos[sessionID] = {
                    holdedDataDao: dataDao,
                    lastAction: new Date(),
                    updateLastAction: function() {
                        this.lastAction = new Date().getTime();
                    }
                };
            }
        },
        getLastUpdate: function(sessionID) {
            return dataDaos[sessionID].lastAction;
        },
        get: function(sessionID) {
            console.tag("SESSION").log('Refreshed Session ' + sessionID);

            if (dataDaos[sessionID] == null) {
                return null;
            }
            dataDaos[sessionID].updateLastAction();
            return dataDaos[sessionID].holdedDataDao;
        },
        remove: function(sessionID) {
            var dataDaoOfSession = dataDaos[sessionID];
            dataDaoOfSession.holdedDataDao.closeConnection();
            delete dataDaos[sessionID];
        },
        getSessions: function() {
            var ret = [];
            for (var sessionID in dataDaos) {
                if (typeof sessionID != 'function') {
                    var lastUpdateTime = this.getLastUpdate(sessionID);
                    ret.push({
                        sessionID: sessionID,
                        lastUpdateTime: lastUpdateTime
                    });
                }
            }
            return ret;
        }
    }
};