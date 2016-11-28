//Master Service Node that exposes API Endpoint channels for data aquisition, parsing and upload
//Use express for endo point library
var express = require('express');
var bodyParser = require('body-parser');
var edge = require('edge');
var config = require('./lib/service-config');


//wrap in async function called after service initinalization
initializeService(function () {


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


    app.listen(app.get('port'), function () {
        console.log('KomodoApi Service Started on port ' + app.get('port'));
    });


});




//include any startup code i.e. creating runtime folders, get settings, etc
function initializeService(initComplete) {

    var fse = require('fs-extra');
    //create tmp/logs under root
    fse.mkdirpSync(__dirname + "/tmp/logs", '0777', function (error) {
        if (error) {
            if (error.code !== 'EEXIST') {
                console.log(error.message);
            }
        }
    });
    
    fse.mkdirpSync(__dirname + "/tmp/processing", '0777', function (error) {
        if (error) {
            if (error.code !== 'EEXIST') {
                console.log(error.message);
            }
        }
    });

    fse.mkdirpSync(__dirname + "/etc", '0777', function (error) {
        if (error) {
            if (error.code !== 'EEXIST') {
                console.log(error.message);
            }
        }
    });
    
    fse.mkdirpSync(__dirname + "/etc/config", '0777', function (error) {
        if (error) {
            if (error.code !== 'EEXIST') {
                console.log(error.message);
            }
        }
    });
    

    config.load(__dirname + "/etc/service.config.dat", function (error) {
        if (error) {
            console.log("Config file not loaded:" + error.message + ". Using defaults");
        } else {
            //console.log(JSON.stringify(config));
        }

        initComplete();


    });


}
