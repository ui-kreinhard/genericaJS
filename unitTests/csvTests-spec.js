try {
    var scribe = require('scribe-js')();
    process.scribe = scribe;
    var console = process.console;
} catch (exception) {
}
require('sugar')
function login(username, password) {
    var ret = {
        connected: false,
        dataDao: null,
        login: function(done) {
            var loginController = require('../loginController.js');
            var config = require('../config.js').config();
            var dataDaoHandler = require('../dataDaoHandler.js').dataDaoHandler();
            expect(config).toNotBe(null);
            expect(dataDaoHandler).toNotBe(null);
            expect(loginController).toNotBe(null);
            loginControllerBuilt = loginController.loginController(dataDaoHandler);
            loginControllerBuilt.login(username, password, 'mySession', function() {
                ret.connected = true;
                ret.dataDao = dataDaoHandler.get('mySession');
                done();
            }, function() {
                ret.connected = false;
                done();
            });
        }
    };

    return ret;
}

xdescribe("insert or update tests-", function() {
    var db = login('postgres', 'aaaaa');
    beforeEach(db.login);
    var ret = {};
    var rand = Math.floor((Math.random() * 1000000) + 2);
    var csv = [ { id: 2, a: rand, b: rand-1 } ];
    describe('update', function() {
        beforeEach(function(done) {
            var tableName = 'unit_tests.constraints';

            var csvImport = require('../csvHandler.js').csvHandler(db.dataDao);
            csvImport.insertRecords(csv, function(response) {
                ret.csvImportResponse = response;
                var params = {
                    orderBy: ['id'],
                    orderByDirection: ['asc'],
                    errorHandler: function(err) {
                        ret.response = null;
                        ret.error = err;
                        done();
                    },
                    successHandler: function(responseP) {
                        ret.response = responseP;
                        done();
                    },
                    tableName: tableName
                };

                db.dataDao.readOutTable(params);
            }, tableName);
        });

        it('should insert data', function() {
            expect(ret).toBeDefined();
            expect(ret.response).toBeDefined();
            expect(
                ret.response.data.any(csv[0])
            ).toBe(true);
        });
    });
    describe('insert', function() {
        var rand = Math.floor((Math.random() * 1000000) + 2);
        var csv = [ { id: null, a: rand, b: rand-1 } ];
        beforeEach(function(done) {
           

            var csvString = '"id","a","b"\n,' + rand + ',2';
            var tableName = 'unit_tests.constraints';

            var csvImport = require('../csvHandler.js').csvHandler(db.dataDao);
            csvImport.insertRecords(csv, function(response) {
                ret.csvImportResponse = response;
                var params = {
                    orderBy: ['id'],
                    orderByDirection: ['asc'],
                    errorHandler: function(err) {
                        ret.response = null;
                        ret.error = err;
                        done();
                    },
                    successHandler: function(responseP) {
                        ret.response = responseP;
                        done();
                    },
                    tableName: tableName
                };

                db.dataDao.readOutTable(params);
            }, tableName);
        });

        it('should insert data', function() {
            delete csv.id;
            expect(ret).toBeDefined();
            expect(ret.response).toBeDefined();
            console.log();
            expect(ret.response.data.find(function(n) {
                return n.a == csv.first().a && n.b==csv.first().b
            })).not.toBe(0);
        });
    });
});
