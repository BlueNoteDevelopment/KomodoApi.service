/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var rs = require('./lib/runtimestorage');


var sucess = rs.saveSettingSync('./tmp/settings.txt','TestSection','TestName',202);

var sucess = rs.saveSettingSync('./tmp/settings.txt','TestSection2','TestName',202);