/* 
 *@module ExecutionProcessorFactory
 *
 */
var ExecutionProcessorFactory = {};
    
    

    ExecutionProcessorFactory.version = "1.0.0.0";

/**
 * @function Create factory method to create function responsible processing a particualr datasource
 * @param {string} dataSourceType xls | csv |odbc | mssql
 * @returns {function (context, path}) 
 */
    ExecutionProcessorFactory.Create = function(dataSourceType){
        
        
        var func = {};
        
        switch(dataSourceType.toLowerCase()){
            
            case 'xls':
                
                func = new function(context,path){
                    var xls = require('./xlsparser');  
                    
                    
                    
                    
                    
                    
                }

                break;
             
            case 'csv':
                func = new function(context,path){
                    var csv = require('./csvparser'); 
                    
                    
                    
                    
                    
                    
                }   
                break;
                
            case 'odbc':
                func = new function(context,path){
                    var csv = require('./csvparser'); 
                    
                    
                    
                    
                    
                    
                }   
                break;
            case 'mssql':
                
            default:
                throw new Error('Unsupported DataSourceType: ' + dataSourceType);
                break;
        }
        
        return func;
        
        
        
        
    }

module.exports = ExecutionProcessorFactory;


