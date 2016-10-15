/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var parser = require('./lib/csvparser');

console.log(parser.version);

function loadCSVFileSync(){
        var filename = './tests/datafiles/csv_test.csv';
        var data = parser.loadCSVFile(filename);
        
        return data;
        
}

function loadCSVFileASync(){
        var filename = './tests/datafiles/csv_test.csv';
        parser.loadCSVFile(filename,function(error,data){
            if(error){
                throw error;
            }
            console.log(data);
        });
        
        
        
}

//loadCSVFileASync();

var data = loadCSVFileSync();

var table = parser.extractDataBrickToTable(data)