//*Logger module - used to log error/warning/and info messages
//*uses API calls contained in service_main_node.js*/

var LOGGER = {};
(function make_parser(LOGGER) {
    if (typeof require !== 'undefined')
        api = require('restler');

    /*properties*/
    LOGGER.version = "1.0.0.0";
    LOGGER.baseApiUrl = 'http://localhost:18963';

    
    //private functions
    function createLogEntryObject() {
        return {
            logName:'service', //name of the log to write to.  if persistTo = local, then this will be the prfix file name
            utcDateTime: null, //utc datetime (required)
            timezoneOffset: 0, //+/- 11
            level: 0, //1=message,2=warning,3=error,4=critical
            message:'', //display message
            objectData:null, //optional json object to store as string
            computerName:'', //optional system client name
            collectionId:'', //identifier for collection error originates from
            clientId:'', //client account id
            persistTo:'both' //server,local,both
            };
    }
    
    function createLogFolder(name,relativepath){
        
    }
    
    //callback => function(Error,Success)  (Error Object, Bool)
    function addLogEntry(entry,callback){
        
    }
    
    function addLogEntryToFile(entry,callback){
        
    }
    
    function postLogEntryToServer(entry,callback){
        
    }
    
    LOGGER.addLogEntry = addLogEntry;
    
    LOGGER.createLogEntryObject = createLogEntryObject;


})(typeof exports !== 'undefined' ? exports : LOGGER);



