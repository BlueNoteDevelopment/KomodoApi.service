//Master Service Node that exposes API Endpoint channels for data aquisition, parsing and upload
//Use express for endo point library
var express = require('express');
var bodyParser = require('body-parser');
var edge = require('edge');

app = express();

//the bodyParser objest are required post Express 4.x
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//set the listening Port
app.set('port',18963);
//switch odbc lib path when debugging in .Net
//app.set('odbc_lib_path','C:\\Projects\\komodoApi\\Edge\\database.edge.lib\\database.edge.lib\\bin\\x64\\Debug\\');
app.set('odbc_lib_path','bin/');

app.post('/api/odbcQuery',function(req,res){
    console.log('api attach - ' + req.body.dsn);
    
    var odbcInvoke = edge.func({
        assemblyFile: app.get('odbc_lib_path') + 'database.edge.lib.dll',
        typeName: 'database.edge.lib.OdbcConnector',
        methodName: 'Invoke' 
    });
    
    odbcInvoke(req.body, function (error, result) { 
        
        if(!error){
            res.json(result);
        }else{
            //error
            res.status(500).send(error);
            console.log(error);
        }
    
    });
    
    
});

app.get('/api/odbcQuery/:dsn/:table',function(req,res){
        console.log('api GET');
    
        var odbcInvoke = edge.func({
        assemblyFile: app.get('odbc_lib_path') + 'database.edge.lib.dll',
        typeName: 'database.edge.lib.OdbcConnector',
        methodName: 'Invoke' 
        });
    
        odbcInvoke({dsn: req.params.dsn, table: req.params.table}, function (error, result) { 
        
        if(!error){
            res.json(result);
        }else{
            //error
            res.status(500).send(error);
            console.log(error);
        }
    
    });
});

//MSSQL Specific Provider

app.post('/api/mssqlQuery',function(req,res){
    console.log('api attach - ' + req.body.server);
    
    var mssqlInvoke = edge.func({
        assemblyFile: app.get('odbc_lib_path') + 'database.edge.lib.dll',
        typeName: 'database.edge.lib.MsSqlConnector',
        methodName: 'Invoke' 
    });
    
    mssqlInvoke(req.body, function (error, result) { 
        
        if(!error){
            res.json(result);
        }else{
            //error
            res.status(500).send(error);
            console.log(error);
        }
    
    });
    
    
});

//logging
app.post('/api/logging',function(req,res){
    console.log('api logging attach - ' + req.body.server);
    var logger = require("lib/logger");
    

   
    
});



/*SQL Command Object
 * {
 * "sql": "SELECT * FROM Table WHERE derp={1};
 * "params":["value":"x"];
 * }
 * 
 * 
 */





app.listen(app.get('port'),function(){
    console.log('ODBC Connection Manager Started on port ' + app.get('port') );    
});
