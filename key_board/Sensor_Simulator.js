exports.sensors = {
    readDoor: function(sensorHigh, sensorLow) {
        var ret = Math.floor((Math.random() * 2) + 0);
        console.log(ret);
        if (ret) {
            sensorHigh();
        } else {
            sensorLow();
        }
        return ret;
    },
    startPiezo: function() {
        console.log('started piezo');
    },
    stopPiezo: function() {
        console.log('stopped piezo');
    }
};
