var config = {};

config.settings = {};
config.settings.internalApi = {};
config.settings.externalApi = {};
config.settings.logging = {};

config.version = "1.0.0.0";

//defaults
config.settings.internalApi.port = 18963;
config.settings.logging.folder = './tmp/logs';
config.settings.externalApi.baseUrl = "https://komodoapi.evergrid.io/";

config.load = function(filename,callback){
    var fse = require('fs-extra');
    
    fse.readJson(filename, function(err, jsonObj) {
        if(jsonObj){
            console.log(JSON.stringify(jsonObj));
            config.settings = jsonObj;
            if(callback){return callback(null);}
        }else{
            
            if(err.code === 'ENOENT'){
                config.save(filename,callback);
            }else{
                if(callback){return callback(err);}
            }
            
            
        }
      });
    
}


config.save = function(filename,callback){
    var fse = require('fs-extra');
    
    fse.writeJson(filename,config.settings, function(err) {
        if(!err){
            if(callback){return callback(null);}
        }else{
            if(callback){return callback(err);}
        }
      });
}




module.exports = config;