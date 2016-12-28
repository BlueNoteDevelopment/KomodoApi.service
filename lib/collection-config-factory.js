/*jslint node: true */
'use strict';

/* 
 * CollectioinConfigFactory
 * Create() => factory meothod to generate a default object for config based on dataSourceType
 */


//dataSourceType = xls | csv |odbc | mssql

var CollectionConfigFactory = {};
    
    

    CollectionConfigFactory.version = "1.0.0.0";

    CollectionConfigFactory.Create = function(configName,dataSourceType){
        var DatabaseProcessor = require('./lib/database-processor');
        var brick = null;
        
        var obj = {};
        
        obj.name = configName ==='' ? 'New Configuration' : configName;
        obj.dataSourceType = dataSourceType;
        obj.isActive = true;
        obj.postProcess = 'none'; //delete | move | rename | none
        obj.moveToFolder = '';  //path or releative path to move to (./old will move to subfolder old)
        obj.renameExtention = '_'; //either literal bak,old, etc or _ for change last char in extestion to '_' (i.e. xl_
        
        obj.schedule = {
            trigger:'manual',//mnual|interval|daily|monthly
            intervalMinutes:5,
            intervalHours:0,
            timeToRun:'00:00',
            daysOfWeek:'Mon,Tue,Wed,Thr,Fri',
            dayOfMonth:1
        };
        
        
        switch(dataSourceType.toLowerCase()){
            
            case 'xls':
                var xls = require('./xlsparser');
                brick = xls.createOptionObject();
                
                obj.dataSource = {
                  fileSpec : '*.xls|*.xlsx',
                  folderToWatch : '',
                  mergeSingleCellToTable:false,
                  columns:[],
                  dataBricks:[brick]
                };
                
                obj.postProcess = 'rename';
                break;
             
            case 'csv':
                var csv = require('./csvparser');
                brick = csv.createOptionObject();
                
                obj.dataSource = {
                    fileSpec : '*.csv',
                    folderToWatch : '',
                    delimiter:'auto',
                    columns:[],
                    dataBricks:[brick]
                };
                
                obj.postProcess = 'rename';
                
                
                break;
                
            case 'odbc':
                var odbc = new DatabaseProcessor('odbc',null);
                obj.dataSource = odbc.createDbCommandObject();
                obj.dataSource.columns = [];
                obj.postProcess = '';
                obj.schedule.trigger = 'interval';
                break;
            case 'mssql':
                var mssql = new DatabaseProcessor('mssql',null);
                obj.dataSource = mssql.createDbCommandObject();
                obj.dataSource.columns = [];
                obj.postProcess = '';
                obj.schedule.trigger = 'interval';
                break;
            default:
                throw new Error('Unsupported DataSourceType: ' + dataSourceType);
        }
            

        

        
        return obj;
        
        
        
        
    };

module.exports = CollectionConfigFactory;
