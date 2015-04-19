var Q = require('q')
require('sugar')
try {
    var scribe = require('scribe-js')();
    process.scribe = scribe;
    var console = process.console;
} catch (exception) {

}
var loginControllerBuilt;
var loginController = require('../loginController.js');
var config = require('../config.js').config();
var dataDaoHandler = require('../dataDaoHandler.js').dataDaoHandler();

loginControllerBuilt = loginController.loginController(dataDaoHandler);


describe('loginController - q', function () {
    afterEach(function () {
        loginControllerBuilt.logout('mysession')
    })
    it('should suceeed', function (doneH, fail) {
        loginControllerBuilt.loginQ('postgres', 'aaaaa', 'mysession').catch(function () {
            expect(true).toBe(false)
        }).finally(doneH)
    })

    it('should fail', function (done) {
        loginControllerBuilt.loginQ('postgres', '123', 'mysession').catch(done);
    })

    it("simple login with a lot of strange signs in pw", function (done) {
        loginControllerBuilt.loginQ('strange_user', '!!$$\\', 'mysession').catch(function () {
            expect(true).toBe(false);
        }).finally(done)
    });
});