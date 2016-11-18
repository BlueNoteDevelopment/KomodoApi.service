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
        var d = new Date();
        var os = require('os');

        return {
            logName: 'service', //name of the log to write to.  if persistTo = local, then this will be the prfix file name
            utcDateTime: d.toUTCString(), //utc datetime (required)
            timezoneOffset: -1 * (d.getTimezoneOffset() / 60), //+/- 11
            level: 0, //1=message,2=warning,3=error,4=critical
            message: '', //display message
            objectData: null, //optional json object to store as string
            computerName: os.hostname(), //optional system client name
            collectionId: '', //identifier for collection error originates from
            clientId: '', //client account id
            persistTo: 'both' //server,local,both
        };
    }


    //callback => function(Error,Success)  (Error Object, Bool)
    function addLogEntry(entry, logpath, callback) {
        if (entry === undefined || entry === null) {
            throw new Error('entry object cannot be null');
        }


        if (entry.utcDateTime === null) {
            var d = new Date();
            entry.utcDateTime = d.toUTCString();
            entry.timezoneOffset = -1 * (d.getTimezoneOffset() / 60);
        }

        //if local the write to log
        if (entry.persistTo.toLowerCase() === 'both' || entry.persistTo.toLowerCase() === 'local' || entry.persistTo.toLowerCase() === '') {
            if (logpath === undefined || logpath === null || logpath === '') {
                logpath = '../';
            }
            addLogEntryToFile(entry, logpath, callback);
        }

        //server || both then upload to server
        if (entry.persistTo.toLowerCase() === 'both' || entry.persistTo.toLowerCase() === 'server') {

        }

    }

    function addLogEntryToFile(entry, logpath, callback) {
        var fs = require('fs-extra');
        var util = require('./utility');
        var filename = entry.logName + util.getDateYYYMMDD() + '.log';

        try {
            message = entry.utcDateTime + '\t'
                    + entry.timezoneOffset + '\t'
                    + entry.computerName + '\t'
                    + entry.level + '\t'
                    + entry.message + '\t'
                    + JSON.stringify(entry.objectData)
                    + '\n';

            var fullpath = logpath + '//' + filename;

            if (!fs.existsSync(fullpath)) {
                message = 'Log Date' + '\t' + 'TZ' + '\t' + 'Host' + '\t' + 'Level' + '\t' + 'Message' + '\t' + 'Data' + '\n' + message;
            }

            fs.appendFile(fullpath, message, {encoding: 'utf-8'}, function (e) {
                if (e) {
                    if (callback) {
                        callback(e, false);
                    }
                } else {
                    if (callback) {
                        callback(null, true);
                    }
                }
            });
        } catch (e) {
             if (callback) {
                callback(e, false);
            }else{
                throw e;
            }
        }

    }

    function postLogEntryToServer(entry, callback) {

    }

    LOGGER.addLogEntry = addLogEntry;
    LOGGER.createLogEntryObject = createLogEntryObject;


})(typeof exports !== 'undefined' ? exports : LOGGER);


