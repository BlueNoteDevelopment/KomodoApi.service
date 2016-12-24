var assert = require('chai').assert;
var mocha = require('mocha');
mocha.ui = 'tdd';

suite('Database Connection Tests', function () {

    var libFileLocation = '../lib/database-processor';

    
    suiteSetup(function () {
        fs = require('fs-extra');
        
        //fs.emptyDirSync('./tests/temp/');
        
    });


    test('should get version from DatabaseProcessor', function (done) {
        var DatabaseProcessor = require(libFileLocation);
        var context = new DatabaseProcessor('odbc',null);
        assert(context.version === '1.0.0.0');
        done();
    });
    
    test('should throw exception for unsupported db type', function (done) {
        var DatabaseProcessor = require(libFileLocation);
        assert.throws(function(){var context = new DatabaseProcessor(null);},Error,'Unsuported database type');
        done();
    });
    
    test('should return a connection object of type odbc', function (done) {
        var sc = require('../lib/service-config');
        var DatabaseProcessor = require(libFileLocation);
        
        var configfilename = __dirname + "/temp/test.config.dat";

        sc.load(configfilename,function(e,s){
            if(!e){
               var db = new DatabaseProcessor('odbc',sc);
               
               var o = db.createDbCommandObject();
               assert(o.type === 'odbc');
            }
            
            done();
        });
    });
    
    
    test('should return a datatable object of type odbc', function (done) {
        var sc = require('../lib/service-config');
        var DatabaseProcessor = require(libFileLocation);
        
        var configfilename = __dirname + "/temp/test.config.dat";

        sc.load(configfilename,function(e,s){
            if(!e){
               var db = new DatabaseProcessor('odbc',sc);
               
               var o = db.createDbCommandObject();
               o.dsn = 'Test1';
               o.command = 'SELECT * FROM Users';

               db.executeSQL(o,(error,success,data)=>{
                   
                   assert(data.Cols.length > 0);
                   done();
               })
            }
            
            
        });
    });
    
    
    
});