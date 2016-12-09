var logTableToConsole = true;
var assert = require('chai').assert;
var mocha = require('mocha');
var rest = require('restler');
mocha.ui = 'tdd';

suite('LOGGER Module Tests', function () {
    
    var libFileLocation = '../lib/logger';
    
    setup(function() {
        
    });
    
    
    
    test('should get version from logger', function (done) {
        var log = require(libFileLocation);
        assert(log.version === '1.0.0.0');
        done();
    });
 
    test('should create an empty logentry object', function (done) {
        var log = require(libFileLocation);
        var obj = log.createLogEntryObject();
       // console.log(JSON.stringify(obj));
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


    test('should write a logentry object to file', function (done) {
        var log = require(libFileLocation);
        var obj = log.createLogEntryObject();
        obj.level = 1;

        /*
         * 
         * logName:'service', //name of the log to write to.  if persistTo = local, then this will be the prfix file name
            utcDateTime: d.toUTCString(), //utc datetime (required)
            timezoneOffset: -1* (d.getTimezoneOffset()/60), //+/- 11
            level: 0, //1=message,2=warning,3=error,4=critical
            message:'', //display message
            objectData:null, //optional json object to store as string
            computerName:'', //optional system client name
            collectionId:'', //identifier for collection error originates from
            clientId:'', //client account id
            persistTo:'both' //server,local,both
         */    

         obj.logName = "test";
         obj.message = "test message";
         obj.clientid = 'test'
         obj.persistTo = 'local';
         
         log.addLogEntry(obj,'./tmp/logs',function(error,success){
            if(error){
                console.log(JSON.stringify(error));
            }
            assert(success === true);
            done();   
             
         });
    });

    test('should write a quick logentry object to file', function (done) {
        var log = require(libFileLocation);
    
        log.addLogQuickEntryLocal('test','Test Message Quick',1,{data:'test',value:1},'./tmp/logs',function(error,success){
            if(error){
                console.log(JSON.stringify(error));
            }
            assert(success === true);
            done();   
             
         });
    });
    
    var base = 'http://localhost:18963';
     
    test('should write a logentry object to file via API', function (done) {
        var log = require(libFileLocation);
        var obj = log.createLogEntryObject();
        obj.level = 1;

        obj.logName = "apitest";
        obj.message = "api test message";
        obj.clientid = 'api test'
        obj.persistTo = 'local';
         

        rest.post(base + '/api/logging', {data: obj}).on('complete', function (data) {
            //console.log(JSON.stringify(data));
            assert(data.Error === undefined);
            assert(data.result === true);
            done();
        });

         
         
         
  
    });
    
    
    
});
