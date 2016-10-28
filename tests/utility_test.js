
var assert = require('chai').assert;
var mocha = require('mocha');
mocha.ui = 'tdd';

suite('LOGGER Module Tests', function () {
    
    var libFileLocation = '../lib/utility';
    
    test('should get version from utility', function (done) {
        var util = require(libFileLocation);
        assert(util.version === '1.0.0.0');
        done();
    });
 
    test('should return a 8 char date value from getDateYYYMMDD', function (done) {
        var util = require(libFileLocation);
        var output = util.getDateYYYMMDD();
        
        console.log(output);
        assert(output.length===8);
        done();
    });

    test('should return a 8 char date from a custom date value from getDateYYYMMDD', function (done) {
        var util = require(libFileLocation);
        //remember that date.month is 0 based
        var output = util.getDateYYYMMDD(new Date(1974, 5, 1));
        
        console.log(output);
        assert(output === '19740601');
        done();
    });

    
});


