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
    //node modules

    var __async__ = require('asyncawait/async');
    var __await__ = require('asyncawait/await');
    var Promise = require('bluebird');
    var path = require('path');
    var fs = Promise.promisifyAll(require('fs-extra'));
    var watcher = require('chokidar');
    
    
    EXECMANAGER.version = "1.0.0.0";
    
    //internal variables
    var _contexts=[];
    var _notificationCallback = null;
    
    
    //configPath = folder where *.konfig files are stored
    //notificationCallback => (Event,Data)  Event = INITCOMPLETE|LOG|ERROR|START|STOP|
    EXECMANAGER.init = __async__ (function(configPath, notificationCallback){
        _notificationCallback = notificationCallback;
        //clear array
        _contexts.length = 0;
        
        fs.readdir(configPath,function(err,files){
           if(err){
               return notificationCallback('ERROR', err);
           }else{
               files.forEach(file => {
                   fs.readJson(file,{encoding: 'utf-8', passParsingErrors: true}, (error,object)=>{
                       if(error){
                           notificationCallback('ERROR', error);
                       }else{
                           object.filename = path.basename(file);
                          _contexts.push(object) 
                       }
                   });
              });            
           }
            
            
            
        });
        
        
                
    });
    
    //get count of loaded execution contexts
    EXECMANAGER.getExecutionContextCount = function(){
        if(_contexts){
            return _contexts.length;
        }else{
            return 0;
        }
    }
    
        //get count of loaded execution contexts
    EXECMANAGER.hasExecutionInProgress = function(){
        if(_contexts){
            //TODO: cycle through contexts and check if activly processing a file
            for (var i = 0; i < _contexts.length; i++) {
                if(_contexts[i].IsExecuting()===true) {return true;}
            }
            
            return false;
        }else{
            return false;
        }
    }
    
    //callback => (Error,Success)
    EXECMANAGER.start = function(callback){
        
    }
    
    //callback => (Error,Success)
    EXECMANAGER.halt = function(callback){
        
    }  
    
    function _destroy(){
        
    }
    function onConfigAdd(path){
        
    }
    
    function onConfigChange(path){
        
    }
    
    function onConfigRemove(path){
        
    }
    
    
    
})(typeof exports !== 'undefined' ? exports : EXECMANAGER);