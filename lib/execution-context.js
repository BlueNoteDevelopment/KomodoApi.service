/*
 * ExecutionContext - Respsible for scheduling and motioring events for a processing a data collection
 * Contructor: KomodoAPI Config Object, execution-manager notifactionCallBack
 * 
 * 
 */


function ExecutionContext(config,notificationCallback){
    

    
//    var _config = config;
//    var _notifcationCallback = notificationCallback;
    var _isExecuting = false;
    
    this.NotificationCallBack = notificationCallback;
    this.CollectionConfig = config;
    this.version = "1.0.0.0";
    
    this.IsExecuting = function(){return _isExecuting;}
    
    this.Start = function(callback){
        try{
            callback(null,true,this)
            
        }catch(e){
            callback(e,false,this);
        }
        
        
    }
    
    this.Halt = function(callback){
        try{
            //do graceful cleanup
            console.log('Halt'); 
            this._notificationCallback = null;
            callback(null,true)
        }catch(e){
            callback(e,false);
        }
        
        
    }
    
    this.Execute = function(callback){
        //actually execute the data extraction routine
        
        //oncomplete _notificationCallback("CONTEXTEXECUTED",error:null; datapackage: {config: config,datatable})
        
        //post file operation
        
    }
    
    
}

module.exports = ExecutionContext;