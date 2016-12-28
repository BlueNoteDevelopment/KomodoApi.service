/*jslint node: true */


////*Logger module - used to log error/warning/and info messages
//*uses API calls contained in service_main_node.js*/

/**
*@exports logger
*@modue logger
*/
var LOGGER = {};
(function make_parser(LOGGER) {
    'use strict';
    
    var api = require('restler');

    /*properties*/
    /**
     * @property {string} version 
     */
    LOGGER.version = "1.0.0.0";
    
    /**
     * @property {string} baseApiUrl 
     */
    LOGGER.baseApiUrl = 'http://localhost:18963';


    //private functions
   /**
    * 
    * @function createLogEntryObject
    * @returns {LogEntryObject}
    * @description Creates a new instance of a LogEntryObject with default values 
    */ 
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

/**
 * @function addLogQuickEntryLocal
 * @param {string} logname
 * @param {string} message
 * @param {int} level
 * @param {object} data 
 * @param {string} logpath
 * @param {callback(error,sucess)} callback
 * @returns {null}
 */
    function addLogQuickEntryLocal(logname, message, level,data, logpath, callback) {
        var entry = createLogEntryObject();
        entry.message = message;

        if (level === null || level === undefined) {
            level = 1;
        }
        if (logname === null || logname === undefined || logname === '') {
            logname = 'service';
        }
        entry.objectData = data;
        entry.logName = logname;
        entry.level = level;
        entry.persistTo = 'local';
        addLogEntry(entry, logpath, callback);
    }



    /**
     * 
     * @function addLogEntry
     * @param {LogEntryObject} entry
     * @param {string} logpath
     * @param {function(Error,Success)} callback
     * @returns {null}
     * 
     * @description Adds a New log entry either local, server or both <br/>
     * Use createLogEntryObject() to create a default LogEntryObject
     **/
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

/**
 * @private
 * @function addLogEntryToFile
 * @param {LogEntryObject} entry
 * @param {string} logpath
 * @param {function(Error,Success)} callback
 * @returns {null}
 */
    function addLogEntryToFile(entry, logpath, callback) {
        var fs = require('fs-extra');
        var util = require('./utility');
        var filename = entry.logName + util.getDateYYYMMDD() + '.log';
        
        try {
            var message = entry.utcDateTime + '\t'
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
            } else {
                throw e;
            }
        }

    }

    function postLogEntryToServer(entry, callback) {
        //post to Expres API
    }


    LOGGER.addLogEntry = addLogEntry;
    LOGGER.createLogEntryObject = createLogEntryObject;
    LOGGER.addLogQuickEntryLocal = addLogQuickEntryLocal;

})(typeof exports !== 'undefined' ? exports : LOGGER);



