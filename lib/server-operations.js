/*jslint node: true */


////*Logger module - used to log error/warning/and info messages
//*uses API calls contained in service_main_node.js*/

/**
*@exports logger
*@modue logger
*/
var SERVEROPS = {};
(function make_object(SERVEROPS) {
    'use strict';

    /*properties*/
    /**
     * @property {string} version 
     */
    SERVEROPS.version = "1.0.0.0";
    
    /**
     * @property {string} baseApiUrl 
     */
    SERVEROPS.baseApiUrl = 'http://localhost:18963';


/**
 * @public
 * @function postLogEntryToServer
 * @param {LogEntryObject} entry
 * @param {string} logpath
 * @param {function(Error,Success)} callback
 * @returns {null}
 */

    function getKonfigFilesFromServer(hostname,config, callback) {
        //post to Server API
        //console.log('api server sync ops ' + hostname);

        if(config.settings.externalApi.token === undefined || config.settings.externalApi.token === ''){
            return callback(new Error('Invalid Request'),false);
        }

        var request = require('request');
        var options = {
            url: config.settings.externalApi.baseUrl + '/api/configuration/' + hostname + '/active' + '?XDEBUG_SESSION_START=netbeans-xdebug&a=1',
            headers: {
              'Authorization': 'bearer ' + config.settings.externalApi.token
            },
            json : true,
            strictSSL : false
          };
        
        request.get(options, function(error, response, body){
            if(error){
                callback(error,null);
            }else{
                if(response.statusCode === 201 || response.statusCode === 200){
                    callback(null,body)
                }else{
                    var errMessage = '';
                    if(!response.body.error){
                        errMessage = response.body;
                    }else{
                        errMessage = response.body.error[0];
                    }
                                        
                    callback(new Error(errMessage,null));
                }
            }
        });
        
    }

    SERVEROPS.getKonfigFilesFromServer = getKonfigFilesFromServer;

})(typeof exports !== 'undefined' ? exports : SERVEROPS);