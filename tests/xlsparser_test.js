/*
 * Test Module for XLSPARSER 
 * 
 * 
 * cmd:  mocha tests\xlsparser_test.js -u tdd
 */
var logTableToConsole = true;
var assert = require('chai').assert;
var mocha = require('mocha');
mocha.ui = 'tdd';



suite('XLSPARSER Module Tests', function () {


    test('should get Version from parser', function (done) {
        var parser = require('../lib/xlsparser');
        assert(parser.version === '1.0.0.0');
        done();
    });


    test('should open a XLSX worksheet', function (done) {
        var parser = require('../lib/xlsparser');
        var filename = './tests/datafiles/simple_table.xlsx';
        try {
            var workbook = parser.openExcelFile(filename);
            assert.isNotNull(workbook);

        } catch (e) {
            assert.fail(false, true, e.message);
        } finally {
        }
        done();
    });



    test('should create an empty options object', function (done) {
        var parser = require('../lib/xlsparser');
        var obj = parser.createOptionObject();
        //console.log(JSON.stringify(obj));
        assert.isNotNull(obj);
        done();
    });

    test('should create unique options object', function (done) {
        var parser = require('../lib/xlsparser');
        var obj = parser.createOptionObject();
        obj.startRow = 1;
        var obj2 = parser.createOptionObject();
        //console.log(JSON.stringify(obj));
        assert(obj.startRow !== obj2.startRow);
        done();
    });

    test('should retrun rolcol object 1,1 for cell address B2', function (done) {
        var parser = require('../lib/xlsparser');
        var c = parser.convertCellToRowCol('A1');
        console.log(JSON.stringify(c));
        assert(c.row === 1);
        assert(c.col === 1);
        done();
    });

    //extract data tests
    test('should throw an error if extract data a workbook is not open', function (done) {
        var parser = require('../lib/xlsparser');
        assert.throws(parser.extractDataBrickToTable, Error, "No Workbook is Open");
        done();
    });

    test('should return 119 rows for simple table xlsx', function (done) {
        var parser = require('../lib/xlsparser');
        var filename = './tests/datafiles/simple_table.xlsx';
        var workbook = parser.openExcelFile(filename);
        var options = parser.createOptionObject();

        options.startRow = 1;
        options.startCol = 1;
        var table = parser.extractDataBrickToTable(workbook,options);
        if (logTableToConsole) {
            console.log(JSON.stringify(table))
        }
        ;
        assert(table.Rows.length === 119);
        done();
    });

    test('should return 119 rows for simple table xlsx with start as A1', function (done) {
        var parser = require('../lib/xlsparser');
        var filename = './tests/datafiles/simple_table.xlsx';
        var workbook = parser.openExcelFile(filename);
        var options = parser.createOptionObject();

        options.startCell = 'A1';
        var table = parser.extractDataBrickToTable(workbook,options);
        if (logTableToConsole) {
            console.log(JSON.stringify(table))
        }
        ;
        assert(table.Rows.length === 119);
        done();
    });

    test('should return 119 rows for simple table xlsx with start as A1 and header row=1', function (done) {
        var parser = require('../lib/xlsparser');
        var filename = './tests/datafiles/simple_table.xlsx';
        var workbook = parser.openExcelFile(filename);
        var options = parser.createOptionObject();

        options.startCell = 'A1';
        options.headerRow = 1;
        var table = parser.extractDataBrickToTable(workbook,options);
        if (logTableToConsole) {
            console.log(JSON.stringify(table))
        }
        ;
        assert(table.Rows.length === 119);
        done();
    });

    test('should return 4 rows for simple table xlsx with start as A1 and End Row = 5', function (done) {
        var parser = require('../lib/xlsparser');
        var filename = './tests/datafiles/simple_table.xlsx';
        var workbook=parser.openExcelFile(filename);
        var options = parser.createOptionObject();

        options.startCell = 'A1';
        options.endRow = 5;
        var table = parser.extractDataBrickToTable(workbook,options);

        //console.log('' + table.Rows.length);
        if (logTableToConsole) {
            console.log(JSON.stringify(table))
        }
        ;
        assert(table.Rows.length === 4);
        done();
    });


    test('should return 1 rows for simple table xlsx with start as 5 and End Row = 5 Header Row=1', function (done) {
        var parser = require('../lib/xlsparser');
        var filename = './tests/datafiles/simple_table.xlsx';
        var workbook = parser.openExcelFile(filename);
        var options = parser.createOptionObject();

        options.headerRow = 1;
        options.startRow = 5;
        options.endRow = 5;

        var table = parser.extractDataBrickToTable(workbook,options);

        //console.log('' + table.Rows.length);
        if (logTableToConsole) {
            console.log(JSON.stringify(table))
        }
        ;
        assert(table.Rows.length === 1);
        assert(table.Rows[0][0] === "10");
        done();
    });

    //FloatingTable
    test('should return 7 rows for floating table xlsx with anchor text Weekly Sales', function (done) {
        var parser = require('../lib/xlsparser');
        var filename = './tests/datafiles/simple_table.xlsx';
        var workbook = parser.openExcelFile(filename);
        var options = parser.createOptionObject();

        options.sheet = 'FloatingTable';
        options.anchorText = 'Weekly Sales';
        options.offsetRow = 2;
        options.headerRow = 1;
        options.startRow = 1;
        options.endRow = 0;

        var table = parser.extractFloatingDataBrickToTable(workbook,options);

        if (logTableToConsole) {
            console.log(JSON.stringify(table));
        }
        
        assert(table.Rows.length === 7);
        assert(table.Cols.length === 3);
        done();
    });

    //Pick
    test('should return 1 cell with anchor text Net Sales using extractFloatingDataBrickToTable', function (done) {
        var parser = require('../lib/xlsparser');
        var filename = './tests/datafiles/simple_table.xlsx';
        var workbook = parser.openExcelFile(filename);
        var options = parser.createOptionObject();

        options.sheet = 'Pick';
        options.anchorText = 'Net Sales';
        options.offsetRow = 0;
        options.offsetCol = 1;
        options.noHeader = true;
        options.startRow = 1;
        options.endRow = 1;
        options.endCol = 1;
        var table = parser.extractFloatingDataBrickToTable(workbook,options);

        if (logTableToConsole) {
            console.log(JSON.stringify(table))
        }
        ;
        assert(table.Rows.length === 1);
        assert(table.Cols.length === 1);
        done();
    });

    test('should return 1 cell with anchor text Net Sales using extractSingleDataCellToTable', function (done) {
        var parser = require('../lib/xlsparser');
        var filename = './tests/datafiles/simple_table.xlsx';
        var workbook = parser.openExcelFile(filename);
        var options = parser.createOptionObject();

        options.sheet = 'Pick';
        options.anchorText = 'Net Sales';
        options.offsetRow = 0;
        options.offsetCol = 1;

        var table = parser.extractSingleDataCellToTable(workbook,options);

        if (logTableToConsole) {
            console.log(JSON.stringify(table))
        }
        ;
        assert(table.Rows.length === 1);
        assert(table.Cols.length === 1);
        done();
    });

    test('should return table from 2 merged single cell Tables', function (done) {
        var parser = require('../lib/xlsparser');
        var filename = './tests/datafiles/simple_table.xlsx';
        var workbook = parser.openExcelFile(filename);
        var options = parser.createOptionObject();

        options.sheet = 'Pick';
        options.anchorText = 'Net Sales';
        options.offsetRow = 0;
        options.offsetCol = 1;

        var tables = [];
        tables.push(parser.extractSingleDataCellToTable(workbook,options));

        options.anchorText = 'Commission';
        tables.push(parser.extractSingleDataCellToTable(workbook,options));

        options.anchorText = 'Total Sales';
        tables.push(parser.extractSingleDataCellToTable(workbook,options));

        var mergedTable = parser.mergeSingleCellTables(tables);

        if (logTableToConsole) {
            console.log(JSON.stringify(mergedTable))
        }
        ;
        assert(mergedTable.Rows.length === 1);
        assert(mergedTable.Rows[0].length === 3);
        assert(mergedTable.Cols.length === 3);

        done();
    });

    test('should throw error if tables_array paramter is not an array', function (done) {
        var parser = require('../lib/xlsparser');
        var tables = 1223;
        assert.throws(function () {
            parser.mergeSingleCellTables(tables);
        }, Error, "Invalid argument. tables_array must be an Array");
        done();
    });

    test('should return original table from 1 merged single cell Tables', function (done) {
        var parser = require('../lib/xlsparser');
        var filename = './tests/datafiles/simple_table.xlsx';
        var workbook = parser.openExcelFile(filename);
        var options = parser.createOptionObject();

        options.sheet = 'Pick';
        options.anchorText = 'Net Sales';
        options.offsetRow = 0;
        options.offsetCol = 1;

        var tables = [];
        tables.push(parser.extractSingleDataCellToTable(workbook,options));

        var mergedTable = parser.mergeSingleCellTables(tables);

        if (logTableToConsole) {
            console.log(JSON.stringify(mergedTable))
        }
        ;
        assert(mergedTable.Rows.length === 1);
        assert(mergedTable.Rows[0].length === 1);
        assert(mergedTable.Cols.length === 1);

        done();
    });

    test('should throw error if tables are not single cell Tables', function (done) {
        var parser = require('../lib/xlsparser');
        var filename = './tests/datafiles/simple_table.xlsx';
        var workbook = parser.openExcelFile(filename);
        var options = parser.createOptionObject();

        options.sheet = 'Pick';
        options.anchorText = 'Net Sales';
        options.offsetRow = 0;
        options.offsetCol = 1;

        var tables = [];
        tables.push(parser.extractSingleDataCellToTable(workbook,options));

        options.sheet = 'FloatingTable';
        options.anchorText = 'Weekly Sales';
        options.offsetRow = 2;
        options.headerRow = 1;
        options.startRow = 1;
        options.endRow = 0;
        options.endCol = 0;

        tables.push(parser.extractFloatingDataBrickToTable(workbook,options));

        assert.throws(function () {
            parser.mergeSingleCellTables(tables);
        }, Error, "Tables must contain only 1 row and 1 column");
        done();
    });

});