var pfio = require('piface-node');
pfio.init();
var doorSensorPin = 7;
exports.sensors = {
    readDoor: function(sensorHigh, sensorLow) {
        var ret = pfio.digital_read(7);
        if (!ret) {
            sensorHigh();
        } else {
            sensorLow();
        }
        return ret;
    },
    startPiezo: function() {
	pfio.digital_write(0,1)
    },
    stopPiezo: function() {
	pfio.digital_write(0,0)
    }
};
