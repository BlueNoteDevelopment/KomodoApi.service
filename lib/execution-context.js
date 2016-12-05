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
            
        }catch(e){
            callback(e,null,this);
        }
        
        
    }
    
    
    
}

module.exports = ExecutionContext;