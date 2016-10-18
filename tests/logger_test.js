var logTableToConsole = true;
var assert = require('chai').assert;
var mocha = require('mocha');
mocha.ui = 'tdd';

suite('LOGGER Module Tests', function () {
    
    var libFileLocation = '../lib/logger';
    
    test('should get version from logger', function (done) {
        var log = require(libFileLocation);
        assert(log.version === '1.0.0.0');
        done();
    });
 
    test('should create an empty logentry object', function (done) {
        var log = require(libFileLocation);
        var obj = log.createLogEntryObject();
        //console.log(JSON.stringify(obj));
        assert.isNotNull(obj);
        done();
    });

    test('should create unique logentry object', function (done) {
        var log = require(libFileLocation);
        var obj = log.createLogEntryObject();
        obj.level = 1;
        var obj2 = log.createLogEntryObject();
        assert(obj.level !== obj2.level);
        done();
    });

    
});
