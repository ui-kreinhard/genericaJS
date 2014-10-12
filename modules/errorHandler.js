exports.errorHandler = function(req, res) {

    var noneHandler = function(cmp, errorMessage) {
        return noneHandler;
    };
    return function(cmp, errorMessage, successHandler) {
        var resultOfCheck;
        if (typeof cmp == 'function') {
            resultOfCheck = cmp();
        } else {
            resultOfCheck = cmp;
        }
        if (resultOfCheck) {
            res.statusCode = 500;
            console.log(errorMessage);
            res.send(errorMessage);
            return noneHandler;
        } else {
            if (successHandler && typeof successHandler == 'function') {
                successHandler();
            }
        }
        return exports.errorHandler(req, res);
    };
};
    