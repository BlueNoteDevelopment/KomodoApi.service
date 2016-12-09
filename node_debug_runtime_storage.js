/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



var rs = require('./lib/runtime-storage');


var sucess = rs.saveSettingSync('./tmp/settings.txt','TestSection','TestName',202);

var sucess = rs.saveSettingSync('./tmp/settings.txt','TestSection2','TestName',202);


var ExecutionContext = require("./lib/execution-context");

var context1 = new ExecutionContext({name:"object1"});
var context2 = new ExecutionContext({name:"object2"});

o = context1.CollectionConfig;

console.log(context1.CollectionConfig.name);
console.log(context2.CollectionConfig.name);

context2.Start(function(a,b,c){});

var EventEmitter = require('events');

var e = new EventEmitter();

e.on('stuff',(message)=>{
    console.log(message);
    if(_running){
            setTimeout(function() {
            cnt++;
            e.emit('stuff', cnt )
        }, 1000);
    }
});


var _running = true;

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
            runner(callback);
        }
    });
}

startPollLoop();

var cnt = 0;

setTimeout(function() {
    cnt++;
    e.emit('stuff', cnt )
}, 1000);


setTimeout(function() {
    console.log('Setting to fales');
    _running = false;
}, 10000);