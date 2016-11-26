/* 
 * CollectioinConfigFactory
 * Create() => factory meothod to generate a default object for config based on dataSourceType
 */


//dataSourceType = xls | csv |odbc | mssql

var CollectionConfigFactory = {};


    CollectionConfigFactory.version = "1.0.0.0";

    CollectionConfigFactory.Create = function(configName,dataSourceType){
        
        
        var obj = {};
        
        obj.name = configName ==='' ? 'New Configuration' : configName;
        obj.dataSourceType = dataSourceType;
        obj.isActive = true;
        obj.postProcess = 'delete'; //delete | move | rename | none
        switch(dataSourceType.toLowerCase()){
            
            case 'xls':
                
                obj.dataSource = {
                  fileSpec : '*.xls|*.xlsx',
                  folderToWatch : '',
                  columns:[],
                  dataBricks:[]
                };
                
                obj.postProcess = 'rename';
                break;
             
            case 'csv':
                
                  obj.dataSource = {
                  fileSpec : '*.csv',
                  folderToWatch : '',
                  delimiter:'auto',
                  columns:[],
                  dataBricks:[]
                };
                
                obj.postProcess = 'rename';
                
                
                break;
                
            case 'odbc':
                
            case 'mssql':
                
            default:
                break;
        }
            
        obj.schedule = {
            trigger:'manual',//mnual|poll|daily|weekly|mothly
            interval:5,
            timeToRun:'00:00',
            daysOfWeek:'Mon,Tue,Wed,Thr,Fri',
            dayOfMonth:1
        };
        

        
        return obj;
        
        
        
        
    }

module.exports = CollectionConfigFactory;
