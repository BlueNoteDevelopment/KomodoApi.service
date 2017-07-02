/*jslint node: true */


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
    'use strict';
    //node modules

    //var path = require('path');
    var fs = require('fs-extra');// Promise.promisifyAll();
    var _path = require('path');
    
    var _chokidar = require('chokidar');
    var _configWatcher = null;
    var _isRunning = false;
    var _ExecutionContext = require("./execution-context");
    
    EXECMANAGER.version = "1.0.0.0";
    
    //internal variables
    var _contexts=[];
    var _notificationCallback = null;
    var _configPath = '';
    var _serviceConfig=null;
    
    //configPath = folder where *.konfig files are stored
    //notificationCallback => (Event,Data)  Event = INITCOMPLETE|LOG|ERROR|START|STOP|
    EXECMANAGER.init = function(serviceConfig, notificationCallback){
        
        
        _serviceConfig = serviceConfig;
        _configPath = '';
        _notificationCallback = notificationCallback;
        //clear array
        _contexts.length = 0;
        var hasErrors = false;
        
        fs.readdir(_serviceConfig.settings.processing.konfigfolder,(function(err,files){
           if(err){
               return _notificationCallback('ERROR', {error: err,path: _serviceConfig.settings.processing.konfigfolder, operation:'load konfig directory'  });
           }else{
               _configPath = _serviceConfig.settings.processing.konfigfolder; //set the config path now that we know its readable
               files = files.filter(f => !(/(^|\/)\.[^\/\.]/g).test(f)); //get rid of . and  ..
               var loopCount =0;
               
               if(files.length===0){
                    //notify of success
                    _notificationCallback('INITCOMPLETE', {count: _contexts.length, hasErrors: hasErrors} );
                }
               
               
               files.forEach(file => {
                   //console.log(file);
                   var fullpath = _configPath + '\\' + file;
                   fs.readJson(fullpath ,{encoding: 'utf-8', passParsingErrors: true}, (error,object)=>{
                       if(error){
                           //console.log(JSON.stringify(error));
                           hasErrors = true;
                           _notificationCallback('ERROR', {error: error,path: fullpath, operation:'load .konfig file'  });
                       }else{
                           try{
                               object.filename = file;
                               var context2 = new _ExecutionContext(object,_serviceConfig,_notificationCallback);
                                
                               _contexts.push(context2);
                              // console.log("Loaded config: " + object.name );
                           }catch(e){
                               console.log(JSON.stringify(e));
                               _notificationCallback('ERROR', {error: e,path: fullpath, operation:'add config to array f'  });
                           }finally{ }
                       }
                       loopCount++;
                       if(files.length===loopCount){
                           //notify of success
                           _notificationCallback('INITCOMPLETE', {count: _contexts.length, hasErrors: hasErrors} );
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
    };
    /**
     * 
     * @returns {make_module._isRunning|Boolean}
     */
    EXECMANAGER.isExecutionRunning = function(){
        return _isRunning;
    };
    
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
    };
    
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
        for(var i=0;i < _contexts.length;i++){
            //start schedule / file watch

            _contexts[i].Start(function(err,succcess,target){
                if(err){
                    hasErrors = true;
                    if(_notificationCallback){_notificationCallback('ERROR', {error: err,path:'' , operation:'start'  });}
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
            
        
    };
    
    //callback => (Error,Success)
    
    /**
     * load konfig files from remote server
     * 
     * @exports execution-manager
     * @function    loadKonfigFromServer
     * @param {SERVEROPS} serverOps Used for unit testing.  If NULL, uses server-operations module
     * @param {callback(error,success)} callback
     * @returns {void}
     */
    EXECMANAGER.loadKonfigFromServer = function(serverOps,callback){
        var os = require('os');
        var path = require("path");
        var fs = require("fs-extra");
        
        if(!serverOps){
            serverOps = require("./server-operations");
        }
        
        serverOps.getKonfigFilesFromServer(os.hostname,_serviceConfig,function(error,konfigArray){
            if(error){
                callback(error,null);
                return;
            }else if (konfigArray){

                for(var i=0;i < konfigArray.length;i++){

                    var konfig = konfigArray[i];
                    var target = _serviceConfig.settings.processing.konfigfolder + path.sep + konfig.configuration_name + '.konfig';
                    if(konfig.is_enabled){
                        //save
                        try{
                            fs.writeFileSync(target,JSON.stringify(konfig.data));
                        }catch(e){
                            _notificationCallback('ERROR', {error: e,path: target, operation:'konfig load from server'  });
                        }
                    }else{
                        //delete
                        if(fs.existsSync(target)){
                            try{
                                fs.unlinkSync(target);
                            }finally{}   
                        }
                    }
                }
                callback(null,true);
                return;
            }
        });        
    };
    
    
    
    
        //callback => (Error,Success)
    /**
     * Stop watching for changes in konfig folder.  Stop all active contexts.  Manager can be started without re-initializing
     * @function halt
     * @param {callback(error,success)} callback
     * @returns {undefined}
     */
    EXECMANAGER.halt = function(callback){
       //remove watch on config folder
        stopConfigFileWatcher();
        //for each item set .notifyWhenComplete callback to fire when execution is complete
         if(_notificationCallback){_notificationCallback('STOP', null );}
    }; 
    
       
    /**
     * Stops file watch activities
     * @private
     * @function stopConfigFileWatcher
     * @returns {Boolean}
     */
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
    
        
 
    
    /**
     * @function _dispose
     * @private
     * @returns {void}
     */
    function _dispose(){
    //drop the hammer
        stopConfigFileWatcher();
        _configPath = '';
        _notificationCallback = null;
        _contexts.length = 0;
    }
    
    function onConfigAdd(path,stat){
        console.log('Add file: ' +  path);
        addConfigFromPath(path,true);
    }
    
    function onConfigChange(path,stat){
        
        removeConfigFromPath(path);
        addConfigFromPath(path,false);
        
        console.log('change file: ' +  path);
        console.log(JSON.stringify(stat));
    }
    
    function onConfigRemove(path){
        console.log('remove file: ' +  path);
        removeConfigFromPath(path);
    }
       
    function onConfigError(error){
     //log error   
        _notificationCallback('ERROR', {error: error,path: '', operation:'konfig watcher error'  });
        console.log('Error file: ' +  error);
    }
    
    //add, remove, update
    
    /**
     * given a path of a konfig file, load a object and insert into execution array
     * @function addConfigFromPath
     * @param {string} configPath
     * @param {boolean} isNew   true if file is added or renamed, false if modified
     * @returns {boolean}
     */

    function addConfigFromPath(configPath,isNew){
        var c = null;
        var file = _path.basename(configPath);
        
        fs.readJson(configPath ,{encoding: 'utf-8', passParsingErrors: true}, (error,object)=>{
            if(error){
                _notificationCallback('ERROR', {error: error,path: configPath, operation:'load .konfig file'  });
            }else{
                try{
                    object.filename = file;
                    var context = new _ExecutionContext(object,_serviceConfig,_notificationCallback);

                    _contexts.push(context);
                    
                    context.Start(function (err, succcess, target) {
                        if (err) {
                            hasErrors = true;
                            if (_notificationCallback) {
                                _notificationCallback('ERROR', {error: err, path: '', operation: 'start'});
                            }
                        } else {
                            _notificationCallback('CONFIGCHANGE', {error: null, path: file, operation: (isNew)?'Add Configuration ' : 'Change Configuration ' + context.CollectionConfig.name});
                        }
                    });
                    
                }catch(e){
                    console.log(JSON.stringify(e));
                    _notificationCallback('ERROR', {error: e,path: configPath, operation:'add config to array 2'  });
                }finally{ }
            }
        });
        
        
    }
    
    /**
     * given a path of a konfig file, remove a config from execution array
     * @function removeConfigFromPath
     * @param {string} configPath
     * @returns {boolean}
     */
    function removeConfigFromPath(configPath){
        var c = null;
        
        var file = _path.basename(configPath);
        
        for (var i=0; i < _contexts.length; i++ ){
            if(_contexts[i].CollectionConfig.filename ===file ){
                 c = _contexts[i];
                _contexts.splice(i,1);
                break;
            }
        }
        
        if (c){
            c.Halt((error,success)=>{
                if(error){
                    _notificationCallback('ERROR', {error: error,path: configPath, operation:'halt ' + c.CollectionConfig.name  });
                }else{
                    //sweet, don't care
                    _notificationCallback('CONFIGCHANGE', {error: null, path: file, operation: 'Remove Configuration ' + c.CollectionConfig.name});
    
                    console.log('config file removed');
                }
            });
        }
    }
    
    
})(typeof exports !== 'undefined' ? exports : EXECMANAGER);