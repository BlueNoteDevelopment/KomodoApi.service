var assert = require('chai').assert;
var mocha = require('mocha');
mocha.ui = 'tdd';

suite('ExecutionContext Module Tests', function () {
    
    var libFileLocation = '../lib/execution-context';
    var libConfigLocation = '../lib/collection-config-factory';
    
    
    test('should get version from ExecutionContext', function (done) {
        var ExecutionContext = require(libFileLocation);
        
        var context = new ExecutionContext({name:"object1", dataSourceType:'csv'});
        assert(context.version === '1.0.0.0');
        done();
    });
 
    test('should get 2 different ExecutionContext objects', function (done) {
        var ExecutionContext = require(libFileLocation);
        
        var context1 = new ExecutionContext({name:"object1", dataSourceType:'csv'});
        var context2 = new ExecutionContext({name:"object2", dataSourceType:'csv'});
        
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
        context1.Start((e,s)=>{});
        
        //console.log(context1.CollectionConfig.name);
       // console.log(JSON.stringify(config));
        
        assert(context1.CollectionConfig.name === 'Test Config' );
        assert(context1.CollectionConfig.dataSourceType === 'xls' );
        done();
    });
    
        
    test('should create 2 ExecutionContext objects for xls data type and start', function (done) {
        var ExecutionContext = require(libFileLocation);
        var ConfigFactory = require(libConfigLocation);
       
        var config = ConfigFactory.Create('Test Config','xls');
        var context1 = new ExecutionContext(config);
        
         var config2 = ConfigFactory.Create('Test Config 2','xls');
        var context2 = new ExecutionContext(config2);       
        
        context1.Start((e,s)=>{});
        context2.Start((e,s)=>{});
        context1.Start((e,s)=>{});
        
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
    var config = require('../lib/service-config');
    
    var pathConfigFiles = __dirname + '/konfig/';
    var pathProcessing = __dirname + "/temp/processing"

    var maxTestFiles = 50;
    suiteSetup(function () {
        fs = require('fs-extra');
        fs.emptyDirSync(pathConfigFiles);
        
        fs.mkdirpSync(pathProcessing, '0777');
        fs.emptyDirSync(pathProcessing);
        
        
        var ConfigFactory = require(libConfigLocation);
        
        for(i=1;i<=maxTestFiles;i++){
            var config = ConfigFactory.Create('Test Config' + i,'xls');
            config.dataSource.folderToWatch = pathProcessing;
            fs.writeJsonSync(pathConfigFiles + 'TestConfig' + i + '.konfig',config,{encoding: 'utf-8'});
        }

        
    });

    test('should get version from ExecutionManager', function (done) {
        var ExecutionManager = require(libFileLocation);
    
        assert(ExecutionManager.version === '1.0.0.0');
        done();
    });
 
    test('should get load all files from konfig folder', function (done) {
        var exec = require(libFileLocation);
        config.settings.processing.konfigfolder = pathConfigFiles;
        
        exec.init(config,function(evt,data){
            
            //console.log(evt);
            if(evt === 'INITCOMPLETE'){
                //console.log(JSON.stringify(data));
                assert(exec.getExecutionContextCount() ===maxTestFiles);
                
            }
            
            done();
        });
        

        
    });
    
    
    test('should throw error reading directory', function (done) {
    var exec = require(libFileLocation);
    config.settings.processing.konfigfolder = 'X:\\';
    exec.init(config,function(evt,data){

        //console.log(evt);
        if(evt === 'INITCOMPLETE'){
            assert(3===5); //fail
        }else if(evt === 'ERROR' ){
            //console.log(JSON.stringify(data));
            assert(data.operation ==='load konfig directory')
        }

        done();
    });
        

        
    });

});