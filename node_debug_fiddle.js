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

/*
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
*/

var parser = require('./lib/query-param-parser');

var param = parser.resolveParam('{dt:lm[f]}');
console.log(param);

param = parser.resolveParam('{dt:lm[f,sod]}');
console.log(param);

param = parser.resolveParam('{dt:lm[f,eod]}');
console.log(param);

 param = parser.resolveParam('{dt:lm[l]}');
console.log(param);

param = parser.resolveParam('{dt:lm[l,sod]}');
console.log(param);

param = parser.resolveParam('{dt:lm[l,eod]}');
console.log(param);

param = parser.resolveParam('{dt:lm[l,sod]}', new Date(2017,2,12));
console.log(param);

console.log('--current--')
param = parser.resolveParam('{dt:cm[f]}');
console.log(param);

param = parser.resolveParam('{dt:cm[f,sod]}');
console.log(param);

param = parser.resolveParam('{dt:cm[f,eod]}');
console.log(param);

param = parser.resolveParam('{dt:cm[l]}');
console.log(param);

param = parser.resolveParam('{dt:cm[l,sod]}');
console.log(param);

param = parser.resolveParam('{dt:cm[l,eod]}');
console.log(param);

console.log('--datepart--')
param = parser.resolveParam('{dp:yr[]}');
console.log(param);
param = parser.resolveParam('{dp:yr[prev]}');
console.log(param);
param = parser.resolveParam('{dp:mo[]}');
console.log(param);
param = parser.resolveParam('{dp:mo[prev]}');
console.log(param);
param = parser.resolveParam('{dp:dy[]}');
console.log(param);
param = parser.resolveParam('{dp:dy[prev]}');
console.log(param);

console.log('--date last week--')
param = parser.resolveParam('{dt:lw[f]}');
console.log(param);

param = parser.resolveParam('{dt:lw[l]}');
console.log(param);

console.log('--date current week--')
param = parser.resolveParam('{dt:cw[f]}');
console.log(param);

param = parser.resolveParam('{dt:cw[l]}');
console.log(param);

console.log('--date last week monday--')
param = parser.resolveParam('{dt:lw[f,mon]}');
console.log(param);

param = parser.resolveParam('{dt:lw[l,mon]}');
console.log(param);

console.log('--date current week monday--')
param = parser.resolveParam('{dt:cw[f,mon]}');
console.log(param);

param = parser.resolveParam('{dt:cw[l,mon]}');
console.log(param);


console.log('--SQL last week--')

var sql = 'SELECT * FROM USERS WHERE dateAdded <=\'{dt:lm[f]}\'';
console.log(parser.processSQLStatement(sql));

var sql = 'SELECT * FROM USERS WHERE dateAdded BETWEEN \'{dt:lm[f,sod]}\' AND \'{dt:lm[l,eod]}\'';
console.log(parser.processSQLStatement(sql,'2016-05-28'));

var sql = 'SELECT * FROM USERS';
console.log(parser.processSQLStatement(sql));
