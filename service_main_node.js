/* global __dirname */

//Master Service Node that exposes API Endpoint channels for data aquisition, parsing and upload
//Use express for endo point library
var express = require('express');
var bodyParser = require('body-parser');
var edge = require('edge');
var config = require('./lib/service-config');
var logger = require('./lib/logger')
var cp = require('child_process');

var configfilename = '';
var executionProcess = null;

require('node-sigint');

//wrap in async function called after service initinalization
initializeService(function () {

    //fork chiled process
    startExecutionProcess();


    app = express();

//the bodyParser objest are required post Express 4.x
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

//set the listening Port
    app.set('port', config.settings.internalApi.port);
//switch odbc lib path when debugging in .Net
//app.set('odbc_lib_path','C:\\Projects\\komodoApi\\Edge\\database.edge.lib\\database.edge.lib\\bin\\x64\\Debug\\');
    app.set('odbc_lib_path', 'bin/');

    app.post('/api/odbcQuery', function (req, res) {
        console.log('api attach - ' + req.body.dsn);

        var odbcInvoke = edge.func({
            assemblyFile: app.get('odbc_lib_path') + 'database.edge.lib.dll',
            typeName: 'database.edge.lib.OdbcConnector',
            methodName: 'Invoke'
        });

        odbcInvoke(req.body, function (error, result) {

            if (!error) {
                res.json(result);
            } else {
                //error
                res.status(500).send(error);
                console.log(error);
            }

        });


    });

    app.get('/api/odbcQuery/:dsn/:table', function (req, res) {
        console.log('api GET');

        var odbcInvoke = edge.func({
            assemblyFile: app.get('odbc_lib_path') + 'database.edge.lib.dll',
            typeName: 'database.edge.lib.OdbcConnector',
            methodName: 'Invoke'
        });

        odbcInvoke({dsn: req.params.dsn, table: req.params.table}, function (error, result) {

            if (!error) {
                res.json(result);
            } else {
                //error
                res.status(500).send(error);
                console.log(error);
            }

        });
    });

//MSSQL Specific Provider

    app.post('/api/mssqlQuery', function (req, res) {
        console.log('api attach - ' + req.body.server);

        var mssqlInvoke = edge.func({
            assemblyFile: app.get('odbc_lib_path') + 'database.edge.lib.dll',
            typeName: 'database.edge.lib.MsSqlConnector',
            methodName: 'Invoke'
        });

        mssqlInvoke(req.body, function (error, result) {

            if (!error) {
                res.json(result);
            } else {
                //error
                res.status(500).send(error);
                console.log(error);
            }

        });


    });

//logging
    app.post('/api/logging', function (req, res) {
        console.log('api logging attach - ' + req.body.server);
        var logger = require("./lib/logger");

        var entry = logger.createLogEntryObject();

        console.log(req);

        entry.logName = req.body.logName;
        entry.message = req.body.message;
        entry.level = req.body.level;
        entry.objectDate = req.body.objectData;
        entry.clientId = req.body.clientId;
        entry.persistTo = req.body.persistTo;
        entry.collectionId = req.body.collectioinId;

        logger.addLogEntry(entry, config.settings.logging.folder, function (error, success) {
            if (error) {
                res.status(500).send(error);
                console.log(error);
            } else {
                res.json({result: success});
            }

        });


    });
    
    //konfig
    app.get('/api/konfigfactory/:datasource', function (req, res) {
        console.log('api GET');
        
        try{
            var factory = require('./lib/collection-config-factory');
            var result = factory.Create('',req.params.datasource);
            res.setHeader('Content-Type', 'application/json');
            res.json(JSON.stringify(result));
        }catch(e){
            res.status(500).send(e);
            console.log(e);
        }
        
      });    


    app.listen(app.get('port'), function () {
        console.log('KomodoApi Service Started on port ' + app.get('port'));
    });


});

function startExecutionProcess(){
    
    //executionProcess = cp.fork('service_execution_child_node');
    
    executionProcess = cp.fork('service_execution_child_node',[],{silent:false, execArgv:['--debug=' + (40894)]});
    
    executionProcess.send({command:'START',serviceconfig:config});
    
    executionProcess.on('message' ,(m)=>{
            if(m.command==='START'){
                if(m.data.response === 'OK'){
                    logger.addLogQuickEntryLocal('service','Execution Process Start Pid:' + executionProcess.pid ,1,null,config.settings.logging.folder,(e,s)=>{});
                    console.log('Execution Process Start Pid:' + executionProcess.pid );
                    
                }else{
                    logger.addLogQuickEntryLocal('service','Execution Process Start Pid:' + executionProcess.pid ,1,null,config.settings.logging.folder,(e,s)=>{});
                    console.log('Execution Process Fail:' + m.data.error.message );
                }

            }else if(m.command === 'STOP'){

            }else if (m.command === 'ERROR'){

            }

        }
        
);

    
    
    
}

function shutdownExecutionProcess(){
    if(executionProcess){
        executionProcess.send({command:'STOP',serviceconfig:config});
    }
}


//include any startup code i.e. creating runtime folders, get settings, etc
function initializeService(initComplete) {

    var fse = require('fs-extra');
    var path = require('path');
    
    fse.mkdirpSync(__dirname + "/etc", '0777');

    
    configfilename = __dirname + "/etc/service.config.dat";
    config.load(configfilename, function (error) {
        if (error) {
            console.log("Config file not loaded:" + error.message + ". Using defaults");
        } else {
            //console.log(JSON.stringify(config));
        }
        //create tmp/logs under root
        var logfolder = __dirname + path.sep + "tmp" + path.sep + "logs";
        fse.mkdirpSync(logfolder, '0777');
        config.settings.logging.folder =logfolder;
        
        var procfolder = __dirname + path.sep +  "tmp" + path.sep + "processing";
        fse.mkdirpSync(procfolder, '0777');
        config.settings.processing.processfolder = procfolder;
        
        var konfigfolder = __dirname + path.sep + "etc" + path.sep + "konfig";
        fse.mkdirpSync(konfigfolder, '0777');
        config.settings.processing.konfigfolder = konfigfolder;
        
        
        var outboundfolder = __dirname +  path.sep + "tmp" + path.sep + "outbound";
        fse.mkdirpSync(outboundfolder, '0777');
        config.settings.processing.outboundfolder = outboundfolder;
        
        config.settings.runtime.basefolder = __dirname;
        config.settings.runtime.binfolder = __dirname + path.sep + 'bin';
        
        
        config.save(configfilename,(error,success)=>{
            initComplete();
        });
        
    });


}
