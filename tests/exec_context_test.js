var assert = require('chai').assert;
var mocha = require('mocha');
mocha.ui = 'tdd';

suite('ExecutionContext Module Tests', function () {
    
    var libFileLocation = '../lib/execution-context';
    var libConfigLocation = '../lib/collection-config-factory';
    
    var svcConfig = null;
    var dropFolder = '';
    suiteSetup(function () {
        fs = require('fs-extra');
        
        fs.mkdirpSync('./tests/temp/context/drop',777);
        fs.mkdirpSync('./tests/temp/context/processing',777);
        fs.mkdirpSync('./tests/temp/context/outbound',777);
        
        dropFolder = __dirname + '/' + 'temp/context/drop';
        console.log(dropFolder);
        
        svcConfig = require('../lib/service-config');
        svcConfig.settings.processing.outboundfolder =  __dirname + '/' + 'temp/context/outbound';
        svcConfig.settings.processing.processfolder  =  __dirname + '/' + 'temp/context/processing';
        //fs.emptyDirSync('./tests/temp/');
        
    });
    
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
    
    
    test('should get a new ExecutionContext objects for csv data type', function (done) {
        var ExecutionContext = require(libFileLocation);
        var ConfigFactory = require(libConfigLocation);
       
        var config = ConfigFactory.Create('Test Config CSV','csv');
        
        var context1 = new ExecutionContext(config);
        context1.Start((e,s)=>{});
        
        //console.log(context1.CollectionConfig.name);
       // console.log(JSON.stringify(config));
        
        assert(context1.CollectionConfig.name === 'Test Config CSV' );
        assert(context1.CollectionConfig.dataSourceType === 'csv' );
        done();
    });
    

    test('should get a new ExecutionContext objects for odbc data type', function (done) {
        var ExecutionContext = require(libFileLocation);
        var ConfigFactory = require(libConfigLocation);
       
        var config = ConfigFactory.Create('Test Config ODBC','odbc');
        
        var context1 = new ExecutionContext(config);
        context1.Start((e,s)=>{});
        
        //console.log(context1.CollectionConfig.name);
       // console.log(JSON.stringify(config));
        
        assert(context1.CollectionConfig.name === 'Test Config ODBC' );
        assert(context1.CollectionConfig.dataSourceType === 'odbc' );
        done();
    });

    test('should get a new ExecutionContext objects for mssql data type', function (done) {
        var ExecutionContext = require(libFileLocation);
        var ConfigFactory = require(libConfigLocation);
       
        var config = ConfigFactory.Create('Test Config mssql','mssql');
        
        var context1 = new ExecutionContext(config);
        context1.Start((e,s)=>{});
        
        //console.log(context1.CollectionConfig.name);
       // console.log(JSON.stringify(config));
        
        assert(context1.CollectionConfig.name === 'Test Config mssql' );
        assert(context1.CollectionConfig.dataSourceType === 'mssql' );
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
        var oldPath = config.settings.processing.konfigfolder ;
        config.settings.processing.konfigfolder = 'X:\\';
        exec.init(config,function(evt,data){

            //console.log(evt);
            if(evt === 'INITCOMPLETE'){
                assert(3===5); //fail
            }else if(evt === 'ERROR' ){
                //console.log(JSON.stringify(data));
                assert(data.operation ==='load konfig directory')
            }
            config.settings.processing.konfigfolder = oldPath;
            done();
        });
    });


    test('should load a new konfig file', function(done){
       var exec = require(libFileLocation);
        
       exec.init(config,function(evt,data){

            //console.log(evt);
            if(evt === 'INITCOMPLETE'){
                
                var serverOps = {};
                
                serverOps.getKonfigFilesFromServer = function(host,config,callback){
                    callback(null, [{id:1,configuration_name:'Test Load 1',is_enabled:true,data:{name:"Test Load 1",dataSourceType:"xls",isActive:true} }]);
                }
                
               exec.loadKonfigFromServer(serverOps,function(error,success){
                   console.log(JSON.stringify(error));
                   assert(success===true);
                   
               });
                
            }else if(evt === 'ERROR' ){
                assert(3===5); //fail
            }
            done();
        }); 
        
        
    });


});