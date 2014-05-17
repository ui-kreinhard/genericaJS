var vows = require('vows');
var assert = require('assert');

vows.describe('test DB Handler').addBatch({
        'simpleConnect' : {
            topic: function() {
             
                return require('../dbHandler.js');
            },
            'connect': function(topic) {
                var conString = "postgres://postgres:hieWueS8@localhost:5432/stz";
                var client = topic.dbHandler(conString, function(err) {
                       assert.equal(false, true);
                }, function() {
                     assert.equal(true, true);
                     client.end();
                });
            }
        },
        'simpleQueries': {
            topic: function() {
                return require('../dbHandler.js');
            },
            'query': function(topic) {
                var conString = "postgres://postgres:hieWueS8@localhost:5432/stz";
                var client = topic.dbHandler(conString, function(err) {
                       assert.equal(false, true);
                }, function() {
                     assert.equal(true, true);
                      var query = client.query("SELECT * FROM information_schema.columns");
                      query.on('row', function(result) {
                        assert.equal(true, true);
                      });   
                      query.on('error', function() {
                        assert.equal(false, true);    
                      });
                      query.on('end', function() {
                        client.end();  
                      });
                });
            }
        },
        'failed': {
            topic: function() {
                return require('../dbHandler.js');
            },
            'queryfailed': function(topic) {
                var conString = "postgres://postgres:hieWueS8@localhost:5432/stz";
                var client = topic.dbHandler(conString, function(err) {
                       assert.equal(false, true);
                }, function() {
                     assert.equal(true, true);
                      var query = client.query("just wrong");
                      query.on('row', function(result) {
                        assert.equal(true, true);
                      });   
                     
                      query.on('end', function() {
                        client.end();  
                      });
                });
            }
        }
}).run();