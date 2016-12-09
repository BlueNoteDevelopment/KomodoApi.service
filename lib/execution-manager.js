/*
 * 
 * @Module:  ExecutionManager
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



/**
*@exports execution-manager
*@modue execution-manager
*/
var EXECMANAGER = {};
(function make_module(EXECMANAGER) {
    //node modules

    //var path = require('path');
    var fs = require('fs-extra');// Promise.promisifyAll();
    var _chokidar = require('chokidar');
    var _configWatcher = null;
    var _isRunning = false;
    var _ExecutionContext = require("./execution-context");
    
    EXECMANAGER.version = "1.0.0.0";
    
    //internal variables
    var _contexts=[];
    var _notificationCallback = null;
    var _configPath = '';
    
    //configPath = folder where *.konfig files are stored
    //notificationCallback => (Event,Data)  Event = INITCOMPLETE|LOG|ERROR|START|STOP|
    EXECMANAGER.init = function(configPath, notificationCallback){
        _configPath = '';
        _notificationCallback = notificationCallback;
        //clear array
        _contexts.length = 0;
        var hasErrors = false;
        
        fs.readdir(configPath,(function(err,files){
           if(err){
               return notificationCallback('ERROR', {error: err,path: configPath, operation:'load konfig directory'  });
           }else{
               _configPath = configPath; //set the config path now that we know its readable
               files = files.filter(f => !(/(^|\/)\.[^\/\.]/g).test(f)); //get rid of . and  ..
               var loopCount =0;
               
               if(files.length===0){
                    //notify of success
                    notificationCallback('INITCOMPLETE', {count: _contexts.length, hasErrors: hasErrors} );
                }
               
               
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
                               var context2 = new _ExecutionContext(object);
                                
                               _contexts.push(context2);
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
    
    /**
     * get count of loaded execution contexts
     * @exports execution-manager
     * @function getExecutionContextCount()
     * @returns {_contexts.length|Number}
     */
    EXECMANAGER.getExecutionContextCount = function(){
        if(_contexts){
            return _contexts.length;
        }else{
            return 0;
        }
    }
    /**
     * 
     * @returns {make_module._isRunning|Boolean}
     */
    EXECMANAGER.isExecutionRunning = function(){
        return _isRunning;
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
        if(_configPath===''){
            return callback(new Error("ExecutionManager not Initialized"),null);
        }
        //setup watch on config folder
        stopConfigFileWatcher();
        
        try{
            _configWatcher = _chokidar.watch(_configPath, {ignored: /[\/\\]\./, persistent: false ,ignoreInitial:true,awaitWriteFinish:true,depth:1  });
            _configWatcher.add('*.konfig');

            _configWatcher.on('add',onConfigAdd);
            _configWatcher.on('change',onConfigChange);
            _configWatcher.on('unlink',onConfigRemove);
            _configWatcher.on('error',onConfigError);
        }catch(e){
            if(_notificationCallback){_notificationCallback('ERROR', {error: e,path:'' , operation:'start config file watcher'  });}
            return callback(e,null);
        }

        if(_contexts.length===0){
            //notify of success
            _isRunning = true;
            if(_notificationCallback){_notificationCallback('START', {count: _contexts.length, hasErrors: false} );}
            return callback(null,true);
        }
       
        //for each c in _config
        var hasErrors = false;
        var loopCount =0;
        for(i=0;i < _contexts.length;i++){
            //start schedule / file watch

            _contexts[i].Start(function(err,succcess,target){
                if(err){
                    hasErrors = true;
                    if(_notificationCallback){_notificationCallback('ERROR', {error: err,path:'' , operation:'start'  });}
                }else{
                    
                }
                loopCount++;
                if(_contexts.length===loopCount){
                    //notify of success
                    _isRunning = true;
                    if(_notificationCallback){_notificationCallback('START', {count: _contexts.length, hasErrors: hasErrors} );}
                    return callback(null,true);
                }
                
            });
        }
            
        
    }
    
    function stopConfigFileWatcher(){
        if(!_configWatcher){return true;}
        
        try{
            _configWatcher.close();
        }catch(e){
            return false;
        }finally{
            _isRunning = false;
            _configWatcher = null;
            console.log("Config Watcher Stopped");
        }
        
        return true;
    }
    
    
    
    //callback => (Error,Success)
    EXECMANAGER.halt = function(callback){
//        if(_configPath===''){
//            //return callback(new Error("ExecutionManager not Initialized"),null);
//            //technically, if this was the case then nothing was loaded
//            return callback(null,true);
//        }
        //remove watch on config folder
        stopConfigFileWatcher();
        //for each item set .notifyWhenComplete callback to fire when execution is complete
        
        if(_notificationCallback){_notificationCallback('STOP', null );}
    }  
    
    function _dispose(){
    //drop the hammer
        stopConfigFileWatcher();
        _configPath = '';
        _notificationCallback = null;
        _contexts.length = 0;
    }
    
    function onConfigAdd(path){
        console.log('Add file: ' +  path)
    }
    
    function onConfigChange(path){
        console.log('change file: ' +  path)
    }
    
    function onConfigRemove(path){
        
    }
    
    function onConfigError(error){
     //log error   
     console.log('Error file: ' +  error)
    }
    
    
})(typeof exports !== 'undefined' ? exports : EXECMANAGER);