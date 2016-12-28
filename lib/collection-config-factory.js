'use strict';

/* 
 * CollectioinConfigFactory
 * Create() => factory meothod to generate a default object for config based on dataSourceType
 */


//dataSourceType = xls | csv |odbc | mssql

var CollectionConfigFactory = {};
    var xls = require('./xlsparser');
    var csv = require('./csvparser');

    CollectionConfigFactory.version = "1.0.0.0";

    CollectionConfigFactory.Create = function(configName,dataSourceType){
        
        
        var obj = {};
        
        obj.name = configName ==='' ? 'New Configuration' : configName;
        obj.dataSourceType = dataSourceType;
        obj.isActive = true;
        obj.postProcess = 'none'; //delete | move | rename | none
        obj.moveToFolder = '';  //path or releative path to move to (./old will move to subfolder old)
        obj.renameExtention = '_'; //either literal bak,old, etc or _ for change last char in extestion to '_' (i.e. xl_)
                
        switch(dataSourceType.toLowerCase()){
            
            case 'xls':
                var brick = xls.createOptionObject();
                
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
                  var brick = csv.createOptionObject();
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
                
            case 'mssql':
                
            default:
                throw new Error('Unsupported DataSourceType: ' + dataSourceType);
                break;
        }
            
        obj.schedule = {
            trigger:'manual',//mnual|interval|daily|monthly
            intervalMinutes:5,
            intervalHours:0,
            timeToRun:'00:00',
            daysOfWeek:'Mon,Tue,Wed,Thr,Fri',
            dayOfMonth:1
        };
        

        
        return obj;
        
        
        
        
    }

module.exports = CollectionConfigFactory;
