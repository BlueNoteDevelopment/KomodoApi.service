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
    var fs = require('fs-extra');// Promise.promisifyAll();
    var watcher = require('chokidar');
    
    
    EXECMANAGER.version = "1.0.0.0";
    
    //internal variables
    var _contexts=[];
    var _notificationCallback = null;
    
    
    //configPath = folder where *.konfig files are stored
    //notificationCallback => (Event,Data)  Event = INITCOMPLETE|LOG|ERROR|START|STOP|
    EXECMANAGER.init = function(configPath, notificationCallback){
        _notificationCallback = notificationCallback;
        //clear array
        _contexts.length = 0;
        var hasErrors = false;
        
        fs.readdir(configPath,__async__(function(err,files){
           if(err){
               return notificationCallback('ERROR', {error: err,path: configPath, operation:'load konfig directory'  });
           }else{
               files = files.filter(f => !(/(^|\/)\.[^\/\.]/g).test(f));
               var loopCount =0;
               
               files.forEach(file => {
                   //console.log(file);
                   var fullpath = configPath + '\\' + file;
                   fs.readJson(fullpath ,{encoding: 'utf-8', passParsingErrors: true}, (error,object)=>{
                       if(error){
                           //console.log(JSON.stringify(error));
                           hasErrors = true;
                           notificationCallback('ERROR', {error: error,path: fullpath, operation:'load .konfig file'  });
                       }else{
                           try{
                                object.filename = file;
                               _contexts.push(object);
                               //console.log(_contexts.length);
                           }catch(e){
                               console.log(JSON.stringify(e));
                               notificationCallback('ERROR', {error: e,path: fullpath, operation:'add config to array'  });
                           }finally{ }
                       }
                       loopCount++;
                       if(files.length===loopCount){
                           //notify of success
                           notificationCallback('INITCOMPLETE', {count: _contexts.length, hasErrors: hasErrors} );
                       }
                   });

              });

              
           }
            
            
            
        }));
        
        
                
    };
    
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