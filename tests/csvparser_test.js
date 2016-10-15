
var logTableToConsole = true;
var assert = require('chai').assert;
var mocha = require('mocha');
mocha.ui = 'tdd';



suite('CSVPARSER Module Tests', function () {
    
    var libFileLocation = '../lib/csvparser';
    
    test('should get version from parser', function (done) {
        var parser = require(libFileLocation);
        assert(parser.version === '1.0.0.0');
        done();
    });
    
    test('should create an empty options object', function (done) {
        var parser = require(libFileLocation);
        var obj = parser.createOptionObject();
        //console.log(JSON.stringify(obj));
        assert.isNotNull(obj);
        done();
    });

    test('should create unique options object', function (done) {
        var parser = require(libFileLocation);
        var obj = parser.createOptionObject();
        obj.startRow = 1;
        var obj2 = parser.createOptionObject();
        assert(obj.startRow !== obj2.startRow);
        done();
    });
    
    
    test('should load csv file sync and return data', function (done) {
        var parser = require(libFileLocation);
        var filename = './tests/datafiles/csv_test.csv';
        
        var data = parser.loadCSVFile(filename);
        
        assert(data !=='' && data!==undefined);
        done();
    });
    
        test('should load csv file async and return data', function (done) {
        var parser = require(libFileLocation);
        var filename = './tests/datafiles/csv_test.csv';
        
        parser.loadCSVFile(filename, (function(error,data){
            if(error){
                throw error;
            }
            
            assert(data !=='' && data!==undefined);
        }));
        done();
    });
    
    
    
});
