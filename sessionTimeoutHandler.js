exports.sessionTimeoutHandler = function(dataDaoHandler) {
    var cleanUpSessions = function() {
        var currentTime = new Date().getTime();
        var registeredSessions = dataDaoHandler.getSessions();
        for(var i=0;i<registeredSessions.length;i++) {
            var session = registeredSessions[i];
            if(Math.abs(currentTime - session.lastUpdateTime) > 60 * 1000) {
                console.log('cleaning up ' + session);
                dataDaoHandler.remove(session.sessionID);
            }
        }
    };
    
    console.log('constructed session timeout handler ... init');
    var CronJob = require('cron').CronJob;
    new CronJob('* * * * * *', function(){
        cleanUpSessions();
    }, null, true, "America/Los_Angeles");
    
    
}