var assert = require('chai').assert;
var mocha = require('mocha');
mocha.ui = 'tdd';

suite('ExecutionContext Module Tests', function () {
    
    var libFileLocation = '../lib/execution-context';
    var libConfigLocation = '../lib/collection-config-factory';
    
    
    test('should get version from ExecutionContext', function (done) {
        var ExecutionContext = require(libFileLocation);
        
        var context = new ExecutionContext(null);
        assert(context.version === '1.0.0.0');
        done();
    });
 
    test('should get 2 different ExecutionContext objects', function (done) {
        var ExecutionContext = require(libFileLocation);
        
        var context1 = new ExecutionContext({name:"object1"});
        var context2 = new ExecutionContext({name:"object2"});
        
        //console.log(context1.CollectionConfig.name);
        //console.log(context2.CollectionConfig.name);
        
        assert(context1.CollectionConfig.name !== context2.CollectionConfig.name );
        done();
    });
    
    
    test('should get a new ExecutionContext objects for xls data type', function (done) {
        var ExecutionContext = require(libFileLocation);
        var ConfigFactory = require(libConfigLocation);
       
        var config = ConfigFactory.Create('Test Config','xls');
        
        var context1 = new ExecutionContext(config);

        
        //console.log(context1.CollectionConfig.name);
       // console.log(JSON.stringify(config));
        
        assert(context1.CollectionConfig.name === 'Test Config' );
        assert(context1.CollectionConfig.dataSourceType === 'xls' );
        done();
    });
    
    
    
});


suite('Execution Manager Module Tests', function () {
    
    var libFileLocation = '../lib/execution-manager';
    var libConfigLocation = '../lib/collection-config-factory';
    var libExecContextLocation = '../lib/execution-context';
    var pathConfigFiles = __dirname + '/konfig/';
    var pathProcessing = __dirname + "/temp/processing"

    suiteSetup(function () {
        fs = require('fs-extra');
        fs.emptyDirSync(pathConfigFiles);
        
        fs.mkdirpSync(pathProcessing, '0777');
        fs.emptyDirSync(pathProcessing);
        
        
        var ConfigFactory = require(libConfigLocation);
       
        var config = ConfigFactory.Create('Test Config','xls');
        config.dataSource.folderToWatch = pathProcessing;
        
        fs.writeJsonSync(pathConfigFiles + 'TestConfig.konfig',config,{encoding: 'utf-8'});
        
    });

    test('should get version from ExecutionManager', function (done) {
        var ExecutionManager = require(libFileLocation);
    
        assert(ExecutionManager.version === '1.0.0.0');
        done();
    });
 
    test('should get load 1 file  from konfig folder', function (done) {
        var exec = require(libFileLocation);

        exec.init(pathConfigFiles,function(evt,data){
            
            if(evt = 'INITCOMPLETE'){
                assert(exec.getExecutionContextCount() ===1);
            }
            
            done();
        });
        

        
    });

});