exports.sessionTimeoutHandler = function(dataDaoHandler, sessionTimeOut) {
    var console = process.console;


    function cleanUpSessions () {
        var currentTime = new Date().getTime();
        dataDaoHandler.getSessions().map(function(session) {
            if (Math.abs(currentTime - session.lastUpdateTime) > sessionTimeOut) {
                console.tag("SESSION").log('cleaning up ' + session);
                dataDaoHandler.remove(session.sessionID);
            }
        });
    }
    cleanUpSessions.every(1000 * 60);
};