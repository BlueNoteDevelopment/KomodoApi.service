var logToConsole = true;
var assert = require('chai').assert;
var mocha = require('mocha');
var rest = require('restler');
mocha.ui = 'tdd';
/**
 * Test Suite: API Konfig Module Tests
 * Tests GET/POST API verbs for creating and saving konfig objects 
 * @returns {null}
 */
suite('API Konfig Module Tests', function () {
    
   
    setup(function() {
        
    });
    
    var base = 'http://localhost:18963';
    
    test('should get konfig object of type xls from API', function (done) {
        var datasource = 'xls';

        rest.get(base + '/api/konfigfactory/' + datasource).on('complete', function (data) {
            if(logToConsole){console.log(data)};
            var obj = JSON.parse(data);
            assert(obj.dataSourceType === datasource );
            assert(obj.dataSource.dataBricks[0].sheet === '' );
            done();

        });

    });
    
    
    
    
    });