var logTableToConsole = true;
var assert = require('chai').assert;
var mocha = require('mocha');
var rest = require('restler');
mocha.ui = 'tdd';


suite('SERVEROPS Module Tests', function () {
    
    var libFileLocation = '../lib/server-operations';
    
    setup(function() {
        
    });
       
    
    test('should get version from server ops', function (done) {
        var srv = require(libFileLocation);
        assert(srv.version === '1.0.0.0');
        done();
    });
 

    test('should get at least 1 configuration from server', function (done){
       var srv = require(libFileLocation);
       
       var configfilename = "./etc/service.config.dat";
       var config = require('../lib/service-config');
       var os = require('os');
        
       config.load(configfilename, function (error) {
           console.log(error);
           srv.getKonfigFilesFromServer(os.hostname(),config,function(error,success){
                
               if(logTableToConsole){
                   console.log(error);
                   console.log(success);
               }
               
               assert(success !== null);
                done();
           }); 
       });
       
        
       
        
    });



});