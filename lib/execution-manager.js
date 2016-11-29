/*
 * 
 * Module:  ExecutionManager
 * Responsibility: Load configuration files from disk into array of executionContext objects and manage state
 *                 Includes managing add, change and delete of configurations in realtime
 *                 
 * Lifecycle:
 * 1)Init => config cache location
 * 2)Start  
 * 3)Event Handler Add/Update/Delete config
 * 4)Halt
 * 4)Destroy
 */

var EXECMANAGER = {};
(function make_module(EXECMANAGER) {


    EXECMANAGER.version = "1.0.0.0";


})(typeof exports !== 'undefined' ? exports : EXECMANAGER);