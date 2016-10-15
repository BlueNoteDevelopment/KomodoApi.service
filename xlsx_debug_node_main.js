/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var parser = require('./lib/xlsparser');

console.log(parser.version);

function openfile() {
    var parser = require('./xlsparser');
    var filename = './tests/datafiles/simple_table.xlsx';
    var workbook = parser.openExcelFile(filename);
    var opt = parser.createOptionObject();

    opt.startRow = 1;
    opt.startCol = 1;

    parser.extractTablularDataBrickToTable(workbook,opt);
    return true;
}

function openfileFloat() {
    var parser = require('./xlsparser');
    var filename = './tests/datafiles/simple_table.xlsx';
    var workbook = parser.openExcelFile(filename);
    var opt = parser.createOptionObject();

    opt.sheet = 'FloatingTable';
    opt.anchorText = 'Weekly Sales';
    opt.offsetRow = 2;
    opt.headerRow = 1;
    opt.startRow = 1;
    opt.endRow = 0;

    parser.extractFloatingDataBrickToTable(workbook,opt);
    return true;
}

function testMerge() {
    var parser = require('./lib/xlsparser');
    var filename = './tests/datafiles/simple_table.xlsx';
    var workbook = parser.openExcelFile(filename);
      var options = parser.createOptionObject();

        options.sheet = 'Pick';
        options.anchorText = 'Net Sales';
        options.offsetRow = 0;
        options.offsetCol = 1;
        
        var tables=[];
        tables.push(parser.extractSingleDataCellToTable(workbook,options));

        options.anchorText = 'Commission';
        tables.push(parser.extractSingleDataCellToTable(workbook,options));
        
        options.anchorText = 'Total Sales';
        tables.push(parser.extractSingleDataCellToTable(workbook,options));
        
        var mergedTable = parser.mergeSingleCellTables(tables);
        return mergedTable;
}


//openfileFloat();
testMerge();
