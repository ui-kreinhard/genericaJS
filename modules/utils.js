exports.utils = {
    isNotDefined: function(value) {
        return typeof value == 'undefined' || value == null;
    },
    generateSessionCrypto: function() {
        var len = 512;

        var crypto = require('crypto');
        var ret = crypto.randomBytes(Math.ceil(len / 2))
                .toString('hex') // convert to hexadecimal format
                .slice(0, len);   // return required number of characters
        return ret;
    }
};