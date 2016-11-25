var config = {};

config.settings = {};
config.settings.internalApi = {};
config.settings.externalApi = {};
config.settings.logging = {};

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
            if(callback){callback(null);}
        }else{
            
            if(err.code === 'ENOENT'){
                config.save(filename,callback);
            }else{
                if(callback){callback(err);}
            }
            
            
        }
      });
    
}


config.save = function(filename,callback){
    var fse = require('fs-extra');
    
    fse.writeJson(filename,config.settings, function(err) {
        if(!err){
            if(callback){callback(null);}
        }else{
            if(callback){callback(err);}
        }
      });
}




module.exports = config;