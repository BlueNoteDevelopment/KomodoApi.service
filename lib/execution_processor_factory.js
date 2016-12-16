/* 
 *@module ExecutionProcessorFactory
 *
 */
var ExecutionProcessorFactory = {};
    
    var csv = require('./csvparser');

    CollectionConfigFactory.version = "1.0.0.0";

/**
 * @function Create factory method to create function responsible processing a particualr datasource
 * @param {string} dataSourceType xls | csv |odbc | mssql
 */
    ExecutionProcessorFactory.Create = function(dataSourceType){
        
        
        var func = {};
        
        switch(dataSourceType.toLowerCase()){
            
            case 'xls':
                
                func = new function(context){
                    var xls = require('./xlsparser');  
                    
                    
                    
                    
                    
                    
                }

                break;
             
            case 'csv':
                
                break;
                
            case 'odbc':
                
            case 'mssql':
                
            default:
                throw new Error('Unsupported DataSourceType: ' + dataSourceType);
                break;
        }
        
        return func;
        
        
        
        
    }

module.exports = ExecutionProcessorFactory;


