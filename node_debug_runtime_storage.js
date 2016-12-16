/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


//
//var rs = require('./lib/runtime-storage');
//
//
//var sucess = rs.saveSettingSync('./tmp/settings.txt','TestSection','TestName',202);
//
//var sucess = rs.saveSettingSync('./tmp/settings.txt','TestSection2','TestName',202);
//
//
//var ExecutionContext = require("./lib/execution-context");
//
//var context1 = new ExecutionContext({name:"object1"});
//var context2 = new ExecutionContext({name:"object2"});
//
//o = context1.CollectionConfig;
//
//console.log(context1.CollectionConfig.name);
//console.log(context2.CollectionConfig.name);
//
//context2.Start(function(a,b,c){});
//
//var EventEmitter = require('events');
//
//var e = new EventEmitter();
//
//e.on('stuff',(message)=>{
//    console.log(message);
//    if(_running){
//            setTimeout(function() {
//            cnt++;
//            e.emit('stuff', cnt )
//        }, 1000);
//    }
//});
//
//
//var _running = true;
//
//function startPollLoop(){
//    console.log('listen for events');
//    
//    runner((cmd)=>{
//        console.log('listen for events stopped');
//    });
//    
//}
//
//function runner(callback){
//    
//    setImmediate(()=>{
//        if(!_running){
//            callback('stop');
//        }else{
//            runner(callback);
//        }
//    });
//}
//
//startPollLoop();
//
//var cnt = 0;
//
//setTimeout(function() {
//    cnt++;
//    e.emit('stuff', cnt )
//}, 1000);
//
//
//setTimeout(function() {
//    console.log('Setting to fales');
//    _running = false;
//}, 10000);


var cd = require('chokidar');

var fw = cd.watch('C:\Projects\\komodoApi\\KomodoApi.Service\\tests\\konfig\\', {ignored: /[\/\\]\./, persistent: true ,ignoreInitial:false,awaitWriteFinish:true,depth:1  });
fw.add('*.konfig');
fw.on('add',onWatchedFolderAdd);

 console.log('Fuvkfile: ' +  'path');

var files = [];
var timeout = 0;

function onWatchedFolderAdd(path,stat){
    console.log('Add file: ' +  path);
//    for(var i=0;i<1000000;i++){
//        if((i % 100000) ===0 ){
//            console.log('wait : ' + i + ' ' + path);
//        }
//    }
    files.push({path:path,ctime:stat.ctime})
    timeout = Date.now();
    waitForComplete();
}

function waitForComplete(){
    if(Date.now() - timeout < 100 ){
        setTimeout(waitForComplete,500);
    }else{
        if(timeout!==0){
            console.log(files.length + ' processed');
            timeout = 0;
            fw.close();
            
            files.sort(function(a,b){
                if (a.ctime < b.ctime)
                    return -1;
                if (a.ctime > b.ctime)
                    return 1;
                return 0;
            });
            
            for(var i=0;i< files.length;i++){
                console.log('proc file: ' +  files[i].path);
            }
            
        }

    }
}