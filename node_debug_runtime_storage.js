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
