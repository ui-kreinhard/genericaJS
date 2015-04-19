try {
    var scribe = require('scribe-js')();
    process.scribe = scribe;
    var console = process.console;
} catch(exception) {
}

function login(username, password) {
    var ret = {
        connected: false,
        dataDao: null,
        validationController: null,
        login: function(done) {
            var loginController = require('../loginController.js');
            var config = require('../config.js').config();
            var dataDaoHandler = require('../dataDaoHandler.js').dataDaoHandler();
            expect(config).toNotBe(null);
            expect(dataDaoHandler).toNotBe(null);
            expect(loginController).toNotBe(null);
            loginControllerBuilt = loginController.loginController(dataDaoHandler);
            loginControllerBuilt.login(username, password, 'mySession', function(connection) {
                ret.connected = true;
                ret.dataDao = dataDaoHandler.get('mySession');
                var validationControllerConstructor = require('../validationController.js');

                ret.validationController = validationControllerConstructor.validatonController(ret.dataDao, connection);

                done();
            }, function() {
                ret.connected = false;
                done();
            });
        }
    };

    return ret;
}
describe("validation controller tests", function() {
    var db = login('postgres', 'aaaaa');
    beforeEach(db.login);

    describe("isValidful validation", function() {
        var isValid = false;
        beforeEach(function(done) {
            var dataToBeValidated = {
                tableName: 'unit_tests.constraints',
                values: {
                    a: 2,
                    b: 1
                }
            };
            db.validationController.validate(dataToBeValidated, function() {
                isValid = true;
                done();
            }, function() {
                done();

            });
        });
        it("should be valid", function() {
            expect(isValid).toBe(true);
        });
    });


    describe("unisValidful validation", function() {
        var isValid = true;
        beforeEach(function(done) {
            var dataToBeValidated = {
                tableName: 'unit_tests.constraints',
                values: {
                    a: 1,
                    b: 1
                }
            };
            db.validationController.validate(dataToBeValidated, function() {
                isValid = true;
                done();
            }, function() {
                isValid = false;
                done();

            });
        });
        it("should be invalid", function() {
            expect(isValid).toBe(false);
        });
    });
        describe("invalid validation wiht not null columns", function() {
        var isValid = true;
        beforeEach(function(done) {
            var dataToBeValidated = {
                tableName: 'unit_tests.not_null_constraints',
                values: {
			a: null                 
			
                }
            };
            db.validationController.validate(dataToBeValidated, 
            function() {
                isValid = true;
                done();
            }, function() {
                isValid  = false;
                done();

            });
        });
        it("should be valid", function() {
            expect(isValid).toBe(false);
        });
    });
    
});
