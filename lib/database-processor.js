/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function DatabaseProcessor(dbType, serviceConfig){
    //node modules
    var _self = this;
    //var path = require('path');
    var _fs = require('fs-extra');// Promise.promisifyAll();
    var _path = require('path');
    var _edge = require('edge');
   
    _self.version = "1.0.0.0";
    
    _self.createConnectionObject = null;
    
    //setup
    if(dbType==='odbc'){
        //setup create connectionObject
        _self.createDbCommandObject = function(){
            return {
                dsn: '',
                command: '',
                params: []
            }
        }
        
        //callback (error,success,data)
        _self.executeSQL = function(command,callback){
            var odbcInvoke = _edge.func({
                        assemblyFile: app.get('odbc_lib_path') + 'database.edge.lib.dll',
                        typeName: 'database.edge.lib.OdbcConnector',
                        methodName: 'Invoke'
                    });

                    odbcInvoke(command, function (error, result) {

                        if (!error) {
                            return callback(null,true,result);
                        } else {
                            console.log(error);
                            return callback(error,false,null);
                        }

                    });
            
        }
        
        
        
    }else if (dbType==='mssql'){
        
         _self.createDbCommandObject = function(){
            return {
                server: '.',
                database: '',
                user: '',
                password: '',
                command: '',
                params: []
            }
        }
    }else{
        throw new Error('Unsuported database type')
    }
    
    

}


module.exports = DatabaseProcessor;