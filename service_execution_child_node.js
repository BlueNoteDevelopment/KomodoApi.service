/* 
* MODULE: service_execution_child_node.js
* Executes Service loop as a sub-process of main service
* Uses IPC channels to communicate with logging API, configuration changes, and process commands (START, STOP, etc)
 */

var _exec_manager = require('./lib/execution-manager');
var _logger = require('./lib/logger');

var _service_config = null;
var _running = true;




/*
 * message object:
 * 
 * {
 *      command: 'START', 'STOP' ,'PING',
 *      serviceconfig: {service config object !NULL on START},
 *      data: {object},
 * }
 * 
 */

process.on('message', (m)=>{
    console.log('Exec Node Message:' + JSON.stringify(m));
    if(m.command==='START'){
        initialize(m.serviceconfig,(error,success)=>{
            if(error){
                process.send({command:'START', data:{response:'ERROR',error:error}});
            }else{
                process.send({command:'START', data:{response:'OK'}});
            }
        });
    }else if(m.command === 'STOP'){
        shutdown((error,success)=>{
            process.send({command:'STOP', data:{response:'OK'}});
        });
    }else if (m.command === 'PING'){
        process.send({command:'PING', data:{response:'OK'}});
    }
    
});

//called from message from Executor
//callback (error,success)
function addLogEntry(entry,callback){
    
    if(!_service_config){
        if(callback){callback(new Error('service config was not supplied'),null);}
        return;  
    }
    
    _logger.addLogEntry(entry,_service_config.settings.logging.folder,(error,success)=>{
        if(callback){callback(error,success);}
    });
}
//callback (error,success)
function shutdown(callback){
    
    _exec_manager.halt((error,success)=>{
        _running = false;
       return callback(error,success)
    });

}
//callback (error,success)
function initialize(config,callback){
    if(config ===null || config === undefined){
        if(callback){callback(new Error('service config was not supplied'),null);}
        return;
    }
    
    if(_exec_manager.isExecutionRunning()===true){
        if(callback){callback(new Error('Execution Already Running.'),null);}
        return;  
    }
    
    _service_config = config;
    _exec_manager.init(_service_config.settings.processing.konfigfolder,notificationCallback);
    
    
    return callback(null,true);
    
}

function notificationCallback(event,data){
    console.log(event + "/" + JSON.stringify(data));
    if(event === 'INITCOMPLETE'){
        _exec_manager.start((error,success)=>{
            if(error){
                
            }else{
                
            }
        });
    }else if (event === 'ERROR'){
        var msg = data.error.message + " occured in operation: " + data.operation + " " + (data.path === null || data.path ===undefined) ? "" : " File Path: " + data.path;  ;
        _logger.addLogQuickEntryLocal('service',msg,3,data, _service_config.settings.logging.folder,(e,s)=>{});
    }else if(event === 'START'){
         var msg = "Execution Manager Started";
        _logger.addLogQuickEntryLocal('service',msg,1,data, _service_config.settings.logging.folder,(e,s)=>{});

    }else if(event==='CONFIGCHANGE'){
         var msg = "Execution Context Changed: "  + data.operation;
        _logger.addLogQuickEntryLocal('service',msg,1,data, _service_config.settings.logging.folder,(e,s)=>{});
    }
    
    
}

//set as running service
//this may not be awesome, but CPU is 0

function startPollLoop(){
    console.log('listen for events');
    
    runner((cmd)=>{
        console.log('listen for events stopped');
    });
    
}

function runner(callback){
    
    setImmediate(()=>{
        if(!_running){
            callback('stop');
        }else{
            setTimeout(function() {
                runner(callback);
            }, 10000);
        }
    });
}

startPollLoop();
