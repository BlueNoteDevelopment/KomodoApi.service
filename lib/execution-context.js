/*jslint node: true */


/*
 * @module ExecutionContext - Respsible for scheduling and motioring events for a processing a data collection
 * @exports ExecutionContext
 */
function ExecutionContext(config,serviceConfig,notificationCallback){
    'use strict';
     /* @constructor KomodoAPI Config Object, execution-manager notifactionCallBack
    */
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
    self.scheduler = null;
    self.cron  =null;
    
    
    self.executionFunc = require('./execution-processor-factory').Create(config.dataSourceType);
    
    this.IsExecuting = function(){return self.isExecuting;};
    
    this.Start = function(callback){
        var fs = require('fs-extra');
        
        try{
            
            //figure out if this is scheduled of folder watch
            
            if(self.CollectionConfig.schedule !==null || self.CollectionConfig.schedule !== 'undefined'){
                if(self.CollectionConfig.schedule.trigger !== 'manual'){
                    startSchedule((error,success)=>{
                        if(error){
                            self.NotificationCallBack('EXECFATALERROR', {error: error,exec: self , operation:'failed to schedule ' +  self.CollectionConfig.name  });
                            return callback(error,false,self);
                        }else{
                            self._isFolderWatch = false;
                            return callback(null,true,self);
                        }
                        
                    });
                    //we are scheduled, so do not bother with file watching
                    return null;
                }

            }
            
            if(self.CollectionConfig.dataSourceType === 'xls' || self.CollectionConfig.dataSourceType === 'csv' ){
                if(self.CollectionConfig.dataSource.folderToWatch !==''){
                    //make sure folder is avaialable
                    if(fs.existsSync(self.CollectionConfig.dataSource.folderToWatch)){
                        startFolderWatch((error,success)=>{
                            if(error){
                                self.NotificationCallBack('EXECFATALERROR', {error: error,exec: self , operation:'failed to watch folder ' +  self.CollectionConfig.name  });
                                return callback(error,false,self);
                            }else{
                                self._isFolderWatch = true;
                                return callback(null,true,self);
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
            callback(e,false,self);
        }
    };
    
    this.Halt = function(callback){
        try{
            //do graceful cleanup
            console.log('Halt'); 
            stopFolderWatch(); 
            if(self.scheduler){
                self.scheduler.destroy();
            }
            self.NotificationCallBack = null;
            callback(null,true);
        }catch(e){
            callback(e,false);
        }
    };
    
    this.Execute = function(callback){
        //stop folder watch or pause schedule;
        stopFolderWatch();
        stopSchedule();
        //actually execute the data extraction routine
        if (self._files.length > 0){
            while(self._files.length){
                var f = self._files.shift();
                var fs = require('fs-extra');
                var path = require('path');
                var originalFile = f.path + '.processing'; //name of the orginal file to be processed
                
                var processingTarget = self.ServiceConfig.settings.processing.processfolder + path.sep + path.basename(f.path); //name of the file that will actually opened and processed
                //rename to .processing
                fs.renameSync(f.path,originalFile);
                //copy to processing folder
                fs.copySync(originalFile,processingTarget);
                //process
                self.executionFunc(self,processingTarget,originalFile,(error,success,data)=>{
                    console.log(processingTarget);
                    if(error){
                        self.NotificationCallBack('RUNTIMEERROR', {error: error, exec: self, operation: 'Error extracitng data for ' + self.CollectionConfig.name});
                    }else{
                        if(data){
                            //write to file
                            //console.log(JSON.stringify(data));
                            var moment = require('moment');
                            var outfilename = self.ServiceConfig.settings.processing.outboundfolder + '/' + self.CollectionConfig.name.replace(/[^\w\s]/gi, '') + '_' + moment().format('x') + '.kdat';
                            var fs = require('fs-extra');
                            
                            fs.writeJson(outfilename,data, function(err) {
                                var iserror = false;
                                if(err){
                                    self.NotificationCallBack('RUNTIMEERROR', {error: error, exec: self, operation: 'Error saving output file ' + self.CollectionConfig.name});
                                    iserror = true;
                                }
                                //do post file operatins
                                
                                postFileOperation(success.originalfile,success.targetfile,iserror, self.CollectionConfig.postProcess,self.CollectionConfig.moveToFolder,self.CollectionConfig.renameExtention,(error,success)=>{
                                    if(error){
                                        self.NotificationCallBack('RUNTIMEERROR', {error: error, exec: self, operation: 'Error post-processing data source for '  + self.CollectionConfig.name});
                                    }else{
                                        self.NotificationCallBack('EXECSUCCESS', {error: null, exec: self, operation: 'Data source sucessfully processed ' + self.CollectionConfig.name});
                                    }
                                });
                                
                              });

                            
                        }
                    }
                    
                });
                
                console.log(f.path);
            }
            
            if (self._isFolderWatch) { //resume watching folder
                startFolderWatch((error, success) => {
                    if (error) {
                        self.NotificationCallBack('EXECFATALERROR', {error: error, exec: self, operation: 'failed to watch folder ' + self.CollectionConfig.name});
                        return callback(error, false, self);
                    } else {
                        return callback(null, true, self);
                    }
                });
            }else{ //schedule .. schedule is self starting with callback

                
            }
            
        }else{
                //odbc and mssql.  Note this assumes that database calls will share same prototype.  May need to be refactord if requirements change
                self.executionFunc(self,(error,success,data)=>{
                    console.log(data.config.name);
                    if(error){
                        self.NotificationCallBack('RUNTIMEERROR', {error: error, exec: self, operation: 'Error extracitng data for ' + self.CollectionConfig.name});
                        return callback(error,false,this);
                    }else{
                        if(data){
                            //write to file
                            //console.log(JSON.stringify(data));
                            var moment = require('moment');
                            var outfilename = self.ServiceConfig.settings.processing.outboundfolder + '/' + self.CollectionConfig.name.replace(/[^\w\s]/gi, '') + '_' + moment().format('x') + '.kdat';
                            var fs = require('fs-extra');
                            
                            fs.writeJson(outfilename,data, function(err) {
                                var iserror = false;
                                if(err){
                                    self.NotificationCallBack('RUNTIMEERROR', {error: error, exec: self, operation: 'Error saving output file ' + self.CollectionConfig.name});
                                    iserror = true;
                                }
                                             
                              });
                        }
                        data = null;
                        return callback(null,true,self);
                    }
                    
                });
           
        }
            


        //oncomplete _notificationCallback("CONTEXTEXECUTED",error:null; datapackage: {config: config,datatable})
        
        //post file operation
        
    };
    
    function startSchedule(callback) {
        //console.log(self.CollectionConfig);
        var crontab = '* * * * *';
        var cron = require('node-cron'); 
        
        if (self.scheduler) {
            self.scheduler.destroy();
            self.scheduler = null;
        }

        try {
            if (self.CollectionConfig.schedule) {
                if (self.CollectionConfig.schedule.trigger.toLowerCase() === 'interval') {
                    if (self.CollectionConfig.schedule.intervalMinute <= 0) {
                        self.CollectionConfig.schedule.intervalMinute = 5;
                    }
                    if (self.CollectionConfig.schedule.intervalHour <= 0) {
                        self.CollectionConfig.schedule.intervalHour = 0;
                    }

                    if (self.CollectionConfig.schedule.intervalHour > 0) {
                        crontab = '* */' + self.CollectionConfig.schedule.intervalHour + ' * * *';
                    } else if (self.CollectionConfig.schedule.intervalMinute > 0) {
                        crontab = '*/' + self.CollectionConfig.schedule.intervalMinute + ' * * * *';
                    }

                } else if (self.CollectionConfig.schedule.trigger.toLowerCase() === 'daily' ||
                        self.CollectionConfig.schedule.trigger.toLowerCase() === 'monthly') {
                    var time = Array.prototype.split(self.CollectionConfig.schedule.timeToRun, ':');

                    if (time.length !== 2) {
                        //something went wrong
                        time.length = 0;
                        time = ['12', '00'];  //default to noon
                    }

                    if (self.CollectionConfig.schedule.trigger.toLowerCase() === 'daily') {
                        crontab = time[0] + ' ' + time[1] + ' * * ';

                        if (self.CollectionConfig.schedule.daysOfWeek.trim() === '') {
                            crontab = crontab + '*';
                        } else {
                            crontab = crontab + convertDowToCron(self.CollectionConfig.schedule.daysOfWeek);
                        }
                    }

                    if (self.CollectionConfig.schedule.dayOfMonth <= 0) {
                        self.CollectionConfig.schedule.dayOfMonth = 1;
                    }

                    if (self.CollectionConfig.schedule.trigger.toLowerCase() === 'monthly') {
                        crontab = time[0] + ' ' + time[1] + ' ' + self.CollectionConfig.schedule.dayOfMonth + ' * *';
                    }
                } else {
                    if (self.CollectionConfig.schedule.intervalMinute <= 0) {
                        self.CollectionConfig.schedule.intervalMinute = 5;
                    }
                }


                self.scheduler  = cron.schedule(crontab, function(){
                    self.Execute((error, success) => {
                        self.scheduler.stop();
                        self.scheduler.start();
                    });
                }, false);
                //actually fire off task    
                self.scheduler.start();
                return callback(null, true);
            }
        } catch (e) {
            return callback(e, false);
        }
    }

    function convertDowToCron(dowstring) {
        var out = [];

        var dow = Array.prototype.split(dowstring, ',');

        for (var i = 0; i < dow.length; i++) {
            var day = dow[i].toString().trim().toLowerCase();

            if (day === 'sun' || day === 'sunday') {
                out.push(0);
                break;
            }

            if (day === 'mon' || day === 'monday') {
                out.push(1);
                break;
            }

            if (day === 'tue' || day === 'tuesday') {
                out.push(2);
                break;
            }

            if (day === 'wed' || day === 'wednesday') {
                out.push(3);
                break;
            }

            if (day === 'thu' || day === 'thursday') {
                out.push(4);
                break;
            }

            if (day === 'fri' || day === 'friday') {
                out.push(5);
                break;
            }

            if (day === 'sat' || day === 'saturday') {
                out.push(6);
                break;
            }

        }

        return out.join(',').replace(/\s/g, '');


    }

    function startFolderWatch(callback) {
        //console.log(self.CollectionConfig);

        if (self.fileWatcher) {  //something went wrong.  Shutdown.  We'll unfuck it later
            try {
                self.fileWatcher.close();
            } finally {
                self.fileWatcher = null;
            }

        }


        var chokadir = require('chokidar');
        var filespec = null;

        try {
            self.CollectionConfig.dataSource.fileSpec = self.CollectionConfig.dataSource.fileSpec.replace(/ +/g, "");
            self.CollectionConfig.dataSource.fileSpec = self.CollectionConfig.dataSource.fileSpec.replace(/[,;] +/g, "|");

            if (self.CollectionConfig.dataSource.fileSpec === '') {
                filespec = ['*.*'];
            } else {
                filespec = self.CollectionConfig.dataSource.fileSpec.split('|');
            }


            var fullWatchGlob = filespec.map((f) => {
                return self.CollectionConfig.dataSource.folderToWatch + '/' + f;
            });

            console.log(fullWatchGlob);
            self.fileWatcher = chokadir.watch(fullWatchGlob, {ignored: /[\/\\]\./, persistent: true, ignoreInitial: false, awaitWriteFinish: true, depth: 1});
            //self.fileWatcher.add(fullWatchGlob);

            self.fileWatcher.on('add', onWatchedFolderAdd);
            self.fileWatcher.on('error', onWatchedFoldeError);

            return callback(null, true);
        } catch (e) {
            callback(e, false);
        }
    }

    function onWatchedFolderAdd(path, stat) {
        console.log('Add file: ' + path);
        self._files.push({path: path, ctime: stat.ctime});
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


    function onWatchedFoldeError(error) {
        //log error   
        self.notificationCallback('RUNTIMEERROR', {error: error, exec: self, operation: 'file watcher error'});
        console.log('Error file: ' + error);
    }

    function stopSchedule(callback) {
        //console.log(self.CollectionConfig);
        if (self.scheduler) {
            self.scheduler.stop();
        }
    }

    function stopFolderWatch() {
        if (!self.fileWatcher) {
            return true;
        }

        try {
            self.fileWatcher.close();
            return true;
        } catch (e) {
            return false;
        } finally {
            self.fileWatcher = null;
            console.log("Cotext File Watcher Stopped");
        }


    }

    /**
     * 
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
        var fs = require('fs-extra');
        var path = require('path');
        var moment = require('moment');
        var pathInfo = null;
        var moveToPath = '';
        
        if(isError){
            //right now, move to an errors folder in root of source
            var moveToErrorFolder = './error';
            moveToPath = '';
            
            pathInfo = path.parse(originalFile);
            
            if (!path.isAbsolute(moveToErrorFolder)){
                moveToPath = path.resolve(pathInfo.dir,moveToErrorFolder)+ path.sep + pathInfo.base.replace('.processing','');
            }else{
                moveToPath = moveToErrorFolder + path.sep + pathInfo.base.replace('.processing','');
            }

            pathInfo = path.parse(moveToPath);

            moveToPath = pathInfo.dir + path.sep + pathInfo.name + '-' + moment().format('x') + path.ext;

            //make folder
            fs.mkdirpSync(pathInfo.dir);
            fs.move(originalFile, moveToPath,{clobber:true}, function (e) {
                    if(e){
                        return callback(e,false);
                    }else{
                        fs.unlink(processedFile,(e)=>{
                            return callback(null,true);
                        });
                    }
            });

        }else{
            
            if(operation.toLowerCase() === 'delete'){
                fs.unlink(processedFile,(e)=>{
                    fs.unlink(originalFile,(e)=>{
                        if(e){return callback(e,false);}else{return callback(null,true);}
                    });
                });
            }else if(operation.toLowerCase()==='move'){
                if(moveToFolder==='' || moveToFolder === "." || moveToFolder==='./'  || moveToFolder==='.\\' || moveToFolder==='/'  || moveToFolder==='\\'){
                    moveToFolder = './done';
                }
                
                pathInfo = path.parse(originalFile);
                
                moveToPath = '';
                
                if (!path.isAbsolute(moveToFolder)){
                    moveToPath = path.resolve(pathInfo.dir,moveToFolder)+ path.sep + pathInfo.base.replace('.processing','');
                }else{
                     moveToPath = moveToFolder + path.sep + pathInfo.base.replace('.processing','');
                }
                
                pathInfo = path.parse(moveToPath);
                
                if(renameExtention !==''){
                    if(renameExtention.length ===1){
                        moveToPath = moveToPath.substring(0, moveToPath.length - 1) + renameExtention;
                    }else{
                        moveToPath = pathInfo.dir + path.sep + pathInfo.base + '.' + renameExtention;
                    }
                }
                //make folder
                fs.mkdirpSync(pathInfo.dir);
                fs.move(originalFile, moveToPath,{clobber:true}, function (e) {
                        if(e){
                            return callback(e,false);
                        }else{
                            fs.unlink(processedFile,(e)=>{
                                return callback(null,true);
                            });
                        }
                });
                
                
            }else if(operation.toLowerCase()==='rename'){
                pathInfo = path.parse(originalFile);
                                
                var renamedFile = pathInfo.dir + path.sep +  pathInfo.base.replace('.processing','');
                pathInfo = path.parse(renamedFile);
                
                if(renameExtention !==''){
                    if(renameExtention.length ===1){
                        renamedFile = renamedFile.substring(0, renamedFile.length - 1) + renameExtention;
                    }else{
                        renamedFile = pathInfo.dir + path.sep + pathInfo.name + '.' + renameExtention;
                    }
                }
                
                fs.rename(originalFile, renamedFile, function (e) {
                        if(e){
                            return callback(e,false);
                        }else{
                            fs.unlink(processedFile,(e)=>{
                                return callback(null,true);
                            });
                        }
                });
                
                
                
            }else{
                //???
                return callback(new Error('Unknown operation: ' + operation),false);
            }
           
        }
    }
    
    
}


module.exports = ExecutionContext;