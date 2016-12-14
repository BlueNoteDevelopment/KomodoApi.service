/*
 * ExecutionContext - Respsible for scheduling and motioring events for a processing a data collection
 * Contructor: KomodoAPI Config Object
 * 
 * 
 */

function ExecutionContext(config){
    

    
    var _config = config;
    
    var _isExecuting = false;
    
    this.CollectionConfig = _config;
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
            callback(null,true)
        }catch(e){
            callback(e,false);
        }
        
        
    }
    
    
}

module.exports = ExecutionContext;