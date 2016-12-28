/*jslint node: true */


function DatabaseProcessor(dbType, serviceConfig){
    'use strict';
    //node modules
    var _self = this;
    var _edge = require('edge');
    var _param = require('./query-param-parser');
   
    _self.version = "1.0.0.0";
    _self.serviceConfig = serviceConfig;
    _self.createConnectionObject = null;
    
    //setup
    if(dbType==='odbc'){
        //setup create connectionObject
        _self.createDbCommandObject = function(){
            return {
                type: 'odbc',
                dsn: '',
                command: '',
                params: []
            };
        };
        
        //callback (error,success,data)
        _self.executeSQL = function(command,callback){
            var odbcInvoke = _edge.func({
                        assemblyFile: _self.serviceConfig.settings.runtime.binfolder  + '/database.edge.lib.dll',
                        typeName: 'database.edge.lib.OdbcConnector',
                        methodName: 'Invoke'
                    });
                    
                    //handle esolving sql directivs {dt:lastmonth[first]}
                    //may need to do shallow copy
                    var procCommand = JSON.parse(JSON.stringify(command));
                    procCommand.command = _param.processSQLStatement(command.command);
                    
                    odbcInvoke(procCommand, function (error, result) {

                        if (!error) {
                            return callback(null,true,result);
                        } else {
                            console.log(error);
                            return callback(error,false,null);
                        }

                    });
            
        };
        
        
        
    }else if (dbType==='mssql'){
        
         _self.createDbCommandObject = function(){
            return {
                type: 'mssql',
                server: '.',
                database: '',
                user: '',
                password: '',
                command: '',
                params: []
            };
        };
        
        _self.executeSQL = function(command,callback){
            var odbcInvoke = _edge.func({
                        assemblyFile: _self.serviceConfig.settings.runtime.binfolder  + '/database.edge.lib.dll',
                        typeName: 'database.edge.lib.MsSqlConnector',
                        methodName: 'Invoke'
                    });

                    var procCommand = JSON.parse(JSON.stringify(command));
                    procCommand.command = _param.processSQLStatement(command.command);
                    
                    odbcInvoke(procCommand, function (error, result) {

                        if (!error) {
                            return callback(null,true,result);
                        } else {
                            console.log(error);
                            return callback(error,false,null);
                        }

                    });
            
        };
        
        
        
    }else{
        throw new Error('Unsuported database type');
    }
    
    

}


module.exports = DatabaseProcessor;