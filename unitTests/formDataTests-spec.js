var Q = require('q')
try {
    var scribe = require('scribe-js')();
    process.scribe = scribe;
    var console = process.console;
} catch (exception) {
}

function loginQ(username, password) {
    var defer = Q.defer()
    var loginController = require('../loginController.js');
    var config = require('../config.js').config();
    var dataDaoHandler = require('../dataDaoHandler.js').dataDaoHandler();
    expect(config).toNotBe(null);
    expect(dataDaoHandler).toNotBe(null);
    expect(loginController).toNotBe(null);
    loginControllerBuilt = loginController.loginController(dataDaoHandler);
    loginControllerBuilt.login(username, password, 'mySession', defer.resolve, defer.reject);
    return defer.promise;
}

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

describe("insert or update tests-", function() {
    var db = login('postgres', 'aaaaa');
    beforeEach(db.login);
    describe("simple insert data set to language", function() {
        var success = false;
        beforeEach(function(done) {
            var query = {
                tableName: 'languages',
                data: {
                    language_name: 'aaa'
                }
            };
            query.errorHandler = function(err) {
                done();
            };
            query.successHandler = function(response) {
                success = true;
                done();
            };
            query.validationErrorHandler = function(response) {
                done();
            };

            db.dataDao.insertOrUpdateRecord(query);
        });
        it('should be executed', function() {
            expect(db.connected).toBe(true);
            expect(success).toBe(true);
        });
        describe('update', function() {
            var success = false;
            beforeEach(function(done) {
                var query = {
                    tableName: 'languages',
                    data: {
                        id: 1,
                        language_name: 'dummy'
                    }
                };
                query.errorHandler = function(err) {
                    done();
                };
                query.successHandler = function(response) {
                    success = true;
                    done();
                };
                query.validationErrorHandler = function(response) {
                    done();
                };

                db.dataDao.insertOrUpdateRecord(query);
            });
            it('should be able to upate the dummy record', function() {
                expect(db.connected).toBe(true);
                expect(success).toBe(true);
            });
        });
    });


});

describe("formdata tests", function() {
    var db = login('k4l', 'bbbbb');
    beforeEach(db.login);

    function createArgs(tableNameP, filterP) {
        var params = {
            orderBy: ['id'],
            orderByDirection: ['asc'],
            tableName: tableNameP
        };
        if (filterP) {
            params.filter = filterP;
        }
        return params;
    }

    function createResponse() {
        return  {
            schema: [],
            data: []
        }
    }

    describe('readOutTableQ', function() {
        it("retrieval of available languages", function(done) {
           var response = createResponse();
           db.dataDao.readOutTableQ(createArgs('languages'), response).finally(function() {
               expect(response.schema).toNotBe(undefined);
               expect(response.data).toNotBe(undefined);
               expect(response.tableActions).toNotBe(undefined);
               expect(response.rights).toNotBe(undefined);

               expect(response.rights.canRead).toNotBe(undefined);
               expect(response.rights.canInsert).toNotBe(undefined);
               expect(response.rights.canUpdate).toNotBe(undefined);
               expect(response.rights.canDelete).toNotBe(undefined);


               expect(response.dataCount).toNotBe(undefined);
               done()
           })
        });

        it("expected data of existing table", function(done) {
            db.dataDao.readOutTableQ(createArgs('_____'), createResponse()).catch(function(err) {
                expect(err).not.toBeNull();
                done()
            });
        });

        it("investigate data part", function(done) {
            var response = createResponse();
            db.dataDao.readOutTableQ(createArgs('languages'), response).finally(function() {
                expect(response).toNotBe(null);

                expect(response.data.length > 0).toBe(true);
                expect(response.data[0].id).toBe(1);
                expect(response.data[0].language_name).toBe('dummy');

                expect(response.data[1].id).toBe(2);
                expect(response.data[1].language_name).toBe('english');
                done();
            });
        });


        it("investigate data part", function(done) {
            var response = createResponse();
            db.dataDao.readOutTableQ(createArgs('languages', {id: {term: 3}}), response).finally(function() {
                expect(response.data.length > 0).toBe(true);
                expect(response.data[0].id).toBe(3);
                expect(response.data[0].language_name).toBe('german');

                done();
            })
        });
    })

});
