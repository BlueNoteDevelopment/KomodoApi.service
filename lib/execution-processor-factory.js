/* 
 *@module ExecutionProcessorFactory
 *
 */
var ExecutionProcessorFactory = {};
    
    

    ExecutionProcessorFactory.version = "1.0.0.0";

/**
 * @function Create factory method to create function responsible processing a particualr datasource
 * @param {string} dataSourceType xls | csv |odbc | mssql
 * @returns {function (context, path)}
 */
    ExecutionProcessorFactory.Create = function(dataSourceType){
        
        

        
        switch(dataSourceType.toLowerCase()){
            
            case 'xls':
                
                return function(context,path,originalfile,callback){
                    var xls = require('./xlsparser');  
                    var p = require('path');
                    
                    console.log('Process: ' + path );
                    
                    try {
                        var workbook = xls.openExcelFile(path);
                        var tables = [];

                        for (var i = 0; i < context.CollectionConfig.dataSource.dataBricks.length; i++) {
                            var brick = context.CollectionConfig.dataSource.dataBricks[i];
                            var table = null;

                            if (brick.anchorText !== '') {
                                table = xls.extractFloatingDataBrickToTable(workbook, brick);
                            } else if (brick.startRow === 1 && brick.endRow === 1 && brick.startCol === 1 && brick.endCol === 1) {
                                //single data cell
                                table = xls.extractSingleDataCellToTable(workbook, brick);
                            } else { //single table
                                table = xls.extractDataBrickToTable(workbook, brick);
                            }

                            if (table) {tables.push(table);}

                        }

                        if(context.CollectionConfig.dataSource.mergeSingleCellToTable){
                            var merged = xls.mergeSingleCellTables(tables);
                            if(merged){
                                tables.length = 0;
                                tables.push(merged)
                            }
                        }
                        var final = makeDataExport(context.CollectionConfig,tables,p.basename(path));

                        if(callback){
                            return callback(null,{result:true,targetfile:path,originalfile:originalfile},final)
                        }else{
                            return final;    
                        }


                    } catch (e) {
                        if(callback){
                            return callback(e,{result:false,targetfile:path,originalfile:originalfile},null)
                        }else{
                            throw(e)    
                        }

                    } finally {

                    }
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
        
        function makeDataExport(config,datatables,sourcefile){
            return {
                
                config:config,
                source:sourcefile,
                data:datatables
            }
        }
        
    }

module.exports = ExecutionProcessorFactory;


