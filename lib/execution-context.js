/*
 * ExecutionContext - Respsible for scheduling and motioring events for a processing a data collection
 * Contructor: KomodoAPI Config Object, execution-manager notifactionCallBack
 * 
 * 
 */


function ExecutionContext(config,serviceConfig,notificationCallback){
    
    
    var self = this;
//    var _config = config;
//    var _notifcationCallback = notificationCallback;
     self._files = [];
     self._timeout = 0;
     self.isExecuting = false;
     
     self._isFolderWatch = false;
    
    self.NotificationCallBack = notificationCallback;
    self.CollectionConfig = config;
    self.version = "1.0.0.0";
    self.ServiceConfig = serviceConfig;
    self.fileWatcher  =null;
    self.cron  =null;
    
    
    self.executionFunc = require('./execution-processor-factory').Create(config.dataSourceType);
    
    this.IsExecuting = function(){return self.isExecuting;}
    
    
    
    
    
    this.Start = function(callback){
        var fs = require('fs-extra');
        
        try{
            
            //figure out if this is scheduled of folder watch
            
            if(self.CollectionConfig.schedule !==null || self.CollectionConfig.schedule !== 'undefined'){
                if(self.CollectionConfig.schedule.trigger !== 'manual'){
                    startSchedule((error,success)=>{
                        if(error){
                            self.NotificationCallBack('EXECFATALERROR', {error: error,exec: self , operation:'failed to schedule ' +  self.CollectionConfig.name  });
                            return callback(error,false,this);
                        }else{
                            self._isFolderWatch = false;
                            return callback(null,true,this);
                        }
                        
                    });
                }
            }
            
            if(self.CollectionConfig.dataSourceType === 'xls' || self.CollectionConfig.dataSourceType === 'csv' ){
                if(self.CollectionConfig.dataSource.folderToWatch !==''){
                    //make sure folder is avaialable
                    if(fs.existsSync(self.CollectionConfig.dataSource.folderToWatch)){
                        startFolderWatch((error,success)=>{
                            if(error){
                                self.NotificationCallBack('EXECFATALERROR', {error: error,exec: self , operation:'failed to watch folder ' +  self.CollectionConfig.name  });
                                return callback(error,false,this);
                            }else{
                                self._isFolderWatch = true;
                                return callback(null,true,this);
                            }
                        });
                    }else{
                        
                        return self.NotificationCallBack('EXECFATALERROR', {error: new Error('Target folder ' + self.CollectionConfig.dataSource.folderToWatch + ' does not exist')
                            ,exec: self
                            , operation:'failed to create folder watch ' +  self.CollectionConfig.name  });
                    }
                                        
                }else{
                    //purely manual...not sure what to do
                }
            }
        }catch(e){
            self.NotificationCallBack('EXECFATALERROR', {error: e,exec: self , operation:'failed to start ' +  self.CollectionConfig.name  });
            callback(e,false,this);
        }
        
        
    }
    
    this.Halt = function(callback){
        try{
            //do graceful cleanup
            console.log('Halt'); 
            stopFolderWatch() 
            self.NotificationCallBack = null;
            callback(null,true)
        }catch(e){
            callback(e,false);
        }
    }
    
    this.Execute = function(callback){
        //stop folder watch or pause schedule;
        stopFolderWatch()
        
        //actually execute the data extraction routine
        if (self._files.length > 0){
            while(self._files.length){
                var f = self._files.shift();
                var fs = require('fs-extra');
                var path = require('path');
                var target = f.path + '.processing';
                var processingTarget = self.ServiceConfig.settings.processing.processfolder + '\\' + path.basename(f.path)
                //rename to .processing
                fs.renameSync(f.path,target);
                //copy to processing folder
                fs.copySync(target,processingTarget);
                //process
                self.executionFunc(self,processingTarget,(error,success,data)=>{
                    
                    if(error){
                        self.NotificationCallBack('RUNTIMEERROR', {error: error, exec: self, operation: 'Error extracitng data for ' + self.CollectionConfig.name});
                    }else{
                        if(data){
                            //write to file
                            console.log(JSON.stringify(data));
                            var moment = require('moment');
                            var outfilename = self.ServiceConfig.settings.processing.outboundfolder + '/' + moment().format('x') + '.kdat';
                            var fs = require('fs-extra');
                            
                            fs.writeJson(outfilename,data, function(err) {
                                var iserror = false;
                                if(err){
                                    self.NotificationCallBack('RUNTIMEERROR', {error: error, exec: self, operation: 'Error saving output file ' + self.CollectionConfig.name});
                                    iserror = true;
                                }
                                //do post file operatins
                                
                                postFileOperation(target,processingTarget,iserror)
                                
                              });

                            
                        }
                    }
                    
                });
                //on complete dela with file
                
                console.log(f.path);
            }
            
            if (self._isFolderWatch) { //resume watching folder
                startFolderWatch((error, success) => {
                    if (error) {
                        self.NotificationCallBack('EXECFATALERROR', {error: error, exec: self, operation: 'failed to watch folder ' + self.CollectionConfig.name});
                        return callback(error, false, this);
                    } else {
                        return callback(null, true, this);
                    }
                });
            }
            
        }else{
        //else DB Querry
            //get runtime var for operation
            //post querry
            //onsuucess. update runtime var
        //
           
        }
            


        //oncomplete _notificationCallback("CONTEXTEXECUTED",error:null; datapackage: {config: config,datatable})
        
        //post file operation
        
    }
    
    function startSchedule(callback) {
        //console.log(self.CollectionConfig);
    }
    
    function startFolderWatch(callback) {
        //console.log(self.CollectionConfig);
        
        if(self.fileWatcher){  //something went wrong.  Shutdown.  We'll unfuck it later
            try{
                self.fileWatcher.close();
            }finally{
                self.fileWatcher = null;
            }

        }
        
        
        var chokadir = require('chokidar');
        var filespec = null;
        
        try{
            self.CollectionConfig.dataSource.fileSpec = self.CollectionConfig.dataSource.fileSpec.replace(/ +/g, "");
            self.CollectionConfig.dataSource.fileSpec = self.CollectionConfig.dataSource.fileSpec.replace(/[,;] +/g, "|");

            if(self.CollectionConfig.dataSource.fileSpec === ''){
                filespec= ['*.*'];
            }else{
                filespec = self.CollectionConfig.dataSource.fileSpec.split('|'); 
            }


            var fullWatchGlob = filespec.map((f)=>{
                return self.CollectionConfig.dataSource.folderToWatch + '/' + f;
            });
            
            console.log(fullWatchGlob);
            self.fileWatcher = chokadir.watch(fullWatchGlob, {ignored: /[\/\\]\./, persistent: true ,ignoreInitial:false,awaitWriteFinish:true,depth:1  });
            //self.fileWatcher.add(fullWatchGlob);

            self.fileWatcher.on('add',onWatchedFolderAdd);
            self.fileWatcher.on('error',onWatchedFoldeError);
            
            return callback(null,true);
        }catch(e){
            callback(e,false);
        }
    }
    
    function onWatchedFolderAdd(path,stat){
        console.log('Add file: ' +  path);
        self._files.push({path:path,ctime:stat.ctime})
        self._timeout = Date.now();
        waitForComplete();
    }

    function waitForComplete() {
        if (Date.now() - self._timeout < 100) {
            setTimeout(waitForComplete, 500);
        } else {
            if (self._timeout !== 0) {
                console.log(self._files.length + ' processed');
                self._timeout = 0;

                self._files.sort(function (a, b) {
                    if (a.ctime < b.ctime)
                        return -1;
                    if (a.ctime > b.ctime)
                        return 1;
                    return 0;
                });

                setTimeout(self.Execute((error, success) => {
                    startFolderWatch((e, s) => {
                    });
                }), 1000);
            }
        }
    }
    
    
    function onWatchedFoldeError(error){
     //log error   
        self.notificationCallback('RUNTIMEERROR', {error: error,exec: self, operation:'file watcher error'  });
        console.log('Error file: ' +  error);
    }
    
    function stopSchedule(callback) {
        //console.log(self.CollectionConfig);
    }
    
    function stopFolderWatch() {
        if(!self.fileWatcher){return true;}
        
        try{
            self.fileWatcher.close();
            return true;
        }catch(e){
            return false;
        }finally{
            self.fileWatcher = null;
            console.log("Cotext File Watcher Stopped");
        }
        
        
    }
    
    /**
     * @function postFileOperation
     * @param {string} originalFile  the .processed version of the file from original source folder
     * @param {string} processedFile  the complete file in the tmp/processing folder
     * @param {boolean} isError indicator if there was an error writing out data
     * @param {string} operation    'move|delete|rename' 
     * @param {string} moveToFolder location of folder (can be relative)
     * @param {string} renameExtention  last character to change file to i.e. '_'
     * @param {{error,success} callback async callback
     * @returns {null}
     */
    function postFileOperation(originalFile,processedFile,isError,operation,moveToFolder,renameExtention,callback){

    }
    
    
}


module.exports = ExecutionContext;