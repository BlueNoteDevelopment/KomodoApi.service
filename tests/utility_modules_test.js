
var assert = require('chai').assert;
var mocha = require('mocha');
mocha.ui = 'tdd';

suite('Runtime Storage Module Sync Tests', function () {

    var libFileLocation = '../lib/runtime-storage';
    
    var filename = './tests/temp/settings.txt';
    suiteSetup(function () {
        fs = require('fs-extra');

        fs.emptyDirSync('./tests/temp/');

    });


    test('should get version from runtimestorage', function (done) {
        var rs = require(libFileLocation);
        assert(rs.version === '1.0.0.0');
        done();
    });

    test('should throw error if no name given on saveSetting', function (done) {
        var rs = require(libFileLocation);
        assert.throws(function () {
            rs.saveSettingSync(filename, 'TestSection', '', 202);
        }, Error, 'Setting Name Was Not Supplied');
        done();
    });

    test('should throw error if no name given on getSetting', function (done) {
        var rs = require(libFileLocation);
        assert.throws(function () {
            rs.getSettingSync(filename, 'TestSection', '', 202);
        }, Error, 'Setting Name Was Not Supplied');
        done();
    });


    test('should save a int value of 202 setting with section and name ', function (done) {
        var rs = require(libFileLocation);

        var sucess = rs.saveSettingSync(filename, 'TestSection', 'TestName', 202);

        assert(sucess === true);
        done();
    });

    test('should save a int setting in root and name ', function (done) {
        var rs = require(libFileLocation);

        var sucess = rs.saveSettingSync(filename, '.', 'RootValue', 101);

        assert(sucess === true);
        done();
    });

    test('should save a complex object setting in section with a name ', function (done) {
        var rs = require(libFileLocation);

        var obj = {
            propa: 'a',
            propb: 'a',
            proparray: [1, 2, 3, 4, 5]
        };
        var sucess = rs.saveSettingSync(filename, 'Complex', 'ComplexValue', obj);
        assert(sucess === true);
        done();
    });

    test('should get an int value of 202 setting with section = TestSection and name=TestName ', function (done) {
        var rs = require(libFileLocation);

        var sucess = rs.getSettingSync(filename, 'TestSection', 'TestName', null);

        assert(sucess === 202);
        done();
    });

    test('should get an int value of 101  with section = . and name=RootValue ', function (done) {
        var rs = require(libFileLocation);

        var sucess = rs.getSettingSync(filename, '.', 'RootValue', null);

        assert(sucess === 101);
        done();
    });

    test('should save a complex object setting in section with a name ', function (done) {
        var rs = require(libFileLocation);

        var objTest = {
            propa: 'a',
            propb: 'a',
            proparray: [1, 2, 3, 4, 5]
        };

        var sucess = rs.getSettingSync(filename, 'Complex', 'ComplexValue', null);
        assert(sucess.propa === objTest.propa);
        assert(sucess.propb === objTest.propb);
        assert(sucess.proparray.length === objTest.proparray.length);
        done();
    });

    test('should get an default value of 500 setting with section = TestSection and name=TestNameNe ', function (done) {
        var rs = require(libFileLocation);

        var sucess = rs.getSettingSync(filename, 'TestSection', 'TestNameNE', 500);

        assert(sucess === 500);
        done();
    });

    test('should get an default value of 500 setting with section = TestSectionNE and name=TestName ', function (done) {
        var rs = require(libFileLocation);

        var sucess = rs.getSettingSync(filename, 'TestSectionNE', 'TestName', 500);

        assert(sucess === 500);
        done();
    });

});

suite('Runtime Storage Module ASync Tests', function () {

    var libFileLocation = '../lib/runtime-storage';
    var filename = './tests/temp/settings_async.txt';
    suiteSetup(function () {
        fs = require('fs-extra');
        //fs.emptyDirSync('./tests/temp/');   
    });



    test('should throw error if no name given on saveSetting', function (done) {
        var rs = require(libFileLocation);

        rs.saveSetting(filename, 'TestSection', '', 202, function (error, success) {

            assert(error.message === 'Setting Name Was Not Supplied')
            assert(success === false);
            done();

        });
    });

    test('should throw error if no name given on getSetting', function (done) {
        var rs = require(libFileLocation);

        rs.getSetting(filename, 'TestSection', '', 202, function (error, success) {

            assert(error.message === 'Setting Name Was Not Supplied')
            assert(success === false);
            done();

        });


    });


    test('should save a int value of 202 setting with section and name ', function (done) {
        var rs = require(libFileLocation);

        rs.saveSetting(filename, 'TestSection', 'TestName', 202, function (error, sucess) {
            assert(sucess === true);
            done();
        });


    });

    test('should save a int setting in root and name ', function (done) {
        var rs = require(libFileLocation);

        rs.saveSetting(filename, '.', 'RootValue', 101, function (error, sucess) {
            assert(sucess === true);
            done();
        });
    });

    test('should save a complex object setting in section with a name ', function (done) {
        var rs = require(libFileLocation);

        var obj = {
            propa: 'a',
            propb: 'a',
            proparray: [1, 2, 3, 4, 5]
        };

        rs.saveSetting(filename, 'Complex', 'ComplexValue', obj, function (error, sucess) {
            assert(sucess === true);
            done();
        });
    });

    test('should get an int value of 202 setting with section = TestSection and name=TestName ', function (done) {
        var rs = require(libFileLocation);

        rs.getSetting(filename, 'TestSection', 'TestName', null, function (error, sucess) {
            assert(sucess === 202);
            done();
        });


    });

    test('should get an int value of 101  with section = . and name=RootValue ', function (done) {
        var rs = require(libFileLocation);

        rs.getSetting(filename, '.', 'RootValue', null, function (error, sucess) {
            assert(sucess === 101);
            done();
        });
    });

    test('should get a complex object setting in section with a name ', function (done) {
        var rs = require(libFileLocation);

        var objTest = {
            propa: 'a',
            propb: 'a',
            proparray: [1, 2, 3, 4, 5]
        };

        rs.getSetting(filename, 'Complex', 'ComplexValue', null, function (error, sucess) {
            assert(sucess.propa === objTest.propa);
            assert(sucess.propb === objTest.propb);
            assert(sucess.proparray.length === objTest.proparray.length);
            done();
        });

    });

    test('should get an default value of 500 setting with section = TestSection and name=TestNameNe ', function (done) {
        var rs = require(libFileLocation);

        rs.getSetting(filename, 'TestSection', 'TestNameNE', 500, function (error, sucess) {
            assert(sucess === 500);
            done();
        });


    });

    test('should get an default value of 500 setting with section = TestSectionNE and name=TestName ', function (done) {
        var rs = require(libFileLocation);

        rs.getSetting(filename, 'TestSectionNE', 'TestName', 500, function (error, sucess) {
            assert(sucess === 500);
            done();
        });
    });

});

suite('Utility Module Tests', function () {
    
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

suite('Query Parser Module Tests', function () {
    
    var libFileLocation = '../lib/query-param-parser';
    
    test('should get version from Query Parser', function (done) {
        var q = require(libFileLocation);
        assert(q.version === '1.0.0.0');
        done();
    });
 
 
    test('should get a return value from Query Parser', function (done) {
        var q = require(libFileLocation);
        
        var val = q.resolveParam('{dt:lm[f]}');
        console.log(val);
        assert(val !== '');
        done();
    });
    
    test('should get a return 2016-11-01 from Query Parser {dt:lm[f]}', function (done) {
        var q = require(libFileLocation);
        
        var val = q.resolveParam('{dt:lm[f]}',new Date(2016,11,26));  //month is 0 based, so this is 12/26/2016
        //console.log(val);
        assert(val === '2016-11-01');
        done();
    });

    test('should get a return 2016-11-01 00:00:00 from Query Parser {dt:lm[f,sod]}', function (done) {
        var q = require(libFileLocation);
        
        var val = q.resolveParam('{dt:lm[f,sod]}',new Date(2016,11,26));  //month is 0 based, so this is 12/26/2016
        //console.log(val);
        assert(val === '2016-11-01 00:00:00');
        done();
    });
    test('should get a return 2016-11-01 23:59:59 from Query Parser {dt:lm[f,eod]}', function (done) {
        var q = require(libFileLocation);
        
        var val = q.resolveParam('{dt:lm[f,eod]}',new Date(2016,11,26));  //month is 0 based, so this is 12/26/2016
        //console.log(val);
        assert(val === '2016-11-01 23:59:59');
        done();
    });
    
        test('should get a return 2016-11-30 from Query Parser {dt:lm[l]}', function (done) {
        var q = require(libFileLocation);
        
        var val = q.resolveParam('{dt:lm[l]}',new Date(2016,11,26));  //month is 0 based, so this is 12/26/2016
        //console.log(val);
        assert(val === '2016-11-30');
        done();
    });

    test('should get a return 2016-11-30 00:00:00 from Query Parser {dt:lm[l,sod]}', function (done) {
        var q = require(libFileLocation);
        
        var val = q.resolveParam('{dt:lm[l,sod]}',new Date(2016,11,26));  //month is 0 based, so this is 12/26/2016
        //console.log(val);
        assert(val === '2016-11-30 00:00:00');
        done();
    });
    test('should get a return 2016-11-30 23:59:59 from Query Parser {dt:lm[l,eod]}', function (done) {
        var q = require(libFileLocation);
        
        var val = q.resolveParam('{dt:lm[l,eod]}',new Date(2016,11,26));  //month is 0 based, so this is 12/26/2016
        //console.log(val);
        assert(val === '2016-11-30 23:59:59');
        done();
    });
    
    
    
    test('should get a return 2016-11-01 from Query Parser {dt:cm[f]}', function (done) {
        var q = require(libFileLocation);
        
        var val = q.resolveParam('{dt:cm[f]}',new Date(2016,10,26));  //month is 0 based, so this is 12/26/2016
        //console.log(val);
        assert(val === '2016-11-01');
        done();
    });

    test('should get a return 2016-11-01 00:00:00 from Query Parser {dt:cm[f,sod]}', function (done) {
        var q = require(libFileLocation);
        
        var val = q.resolveParam('{dt:cm[f,sod]}',new Date(2016,10,26));  //month is 0 based, so this is 12/26/2016
        //console.log(val);
        assert(val === '2016-11-01 00:00:00');
        done();
    });
    test('should get a return 2016-11-01 23:59:59 from Query Parser {dt:cm[f,eod]}', function (done) {
        var q = require(libFileLocation);
        
        var val = q.resolveParam('{dt:cm[f,eod]}',new Date(2016,10,26));  //month is 0 based, so this is 12/26/2016
        //console.log(val);
        assert(val === '2016-11-01 23:59:59');
        done();
    });
    
    
    
});