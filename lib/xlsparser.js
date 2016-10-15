/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var XLSPARSER = {};
(function make_parser(XLSPARSER) {
    if (typeof require !== 'undefined')
        XLSX = require('xlsx');

    /*properties*/
    XLSPARSER.version = "1.0.0.0";

    //returns workbook object
    XLSPARSER.openExcelFile = function (filename,password) {

        try {
            var options = {cellDates:true,password:password};
            return XLSX.readFile(filename,options);
        } catch (e) {
            throw e;
        }
    };

    XLSPARSER.createOptionObject = createOptionObject;

    //convert cell A1 to {row:1,col:1}
    XLSPARSER.convertCellToRowCol = function (cell) {
        var obj = XLSX.utils.decode_cell(cell);

        if (obj) {
            return {row: obj.r + 1, col: obj.c + 1};
        } else {
            throw new Error('Invalid Cell Notation');
        }
    }

    XLSPARSER.mergeSingleCellTables = function(tables_array){
        
        if(!Array.isArray(tables_array)){throw new Error("Invalid argument. tables_array must be an Array");}
        
        if(tables_array.length===1){return tables_array[0];}
        
        var outTable = {Cols: [], Rows: []};
        outTable.Rows.push([]);
        for (var i = 0, len = tables_array.length; i < len; i++) {
            
            if(tables_array[i].Rows.length!==1 && tables_array[i].Cols.length!==1 ){
                throw new Error("Tables must contain only 1 row and 1 column");
            }
            outTable.Cols = outTable.Cols.concat(tables_array[i].Cols);
            outTable.Rows[0] = outTable.Rows[0].concat(tables_array[i].Rows[0]);
        }
        return outTable;
        
    } 
            
    function extractSingleDataCellToTable(workbook,options){
        if (!options) {
            options = createOptionObject();
        }
        
        options.startRow=1;
        options.endRow=1;
        options.startCol=1;
        options.endCol=1;
        options.noHeader = true;
        
        return extractFloatingDataBrickToTable(workbook,options);
    }
    
    function extractFloatingDataBrickToTable(workbook,options) {
        if (!options) {
            options = createOptionObject();
        }

        if (options.anchorText === '') {
            throw new Error('No Anchor Text Specified');
        }

        if (options.offsetRow === 0 && options.offestCol === 0) {
            //default to 1 col right of anchor text
            options.offestCol = 1;
        }

        var worksheet = getWorksheet(workbook,options);

        if (worksheet) {
            //see if we have anchor. if true then locate start coordinates and setup options object
            var wkrange = worksheet['!ref'];

            if (wkrange === '') {
                wkrange = 'A1:Z1000';
            }//create a reasonable search zone.  This should not happen

            var range = XLSX.utils.decode_range(wkrange);
            var anchorCell = null;
            for (var c = range.s.c; c <= range.e.c; c++) {
                
                for (var r = range.s.r; r <= range.e.r; r++) {
                    var target = worksheet[XLSX.utils.encode_cell({r: r, c: c})];
                    if (target) {
                        if (target.v.toString().toUpperCase().trim() === options.anchorText.toUpperCase().trim()) {
                            anchorCell = {r: r, c: c};
                            break;
                        }
                    }
                }
                if(anchorCell){break;}
            }
            if (!anchorCell) {
                throw new Error('Anchor text not located');
            }
            var extractOptions = createOptionObject();
            extractOptions.sheet = options.sheet;
            extractOptions.startRow = anchorCell.r + 1 + options.offsetRow;
            extractOptions.startCol = anchorCell.c + 1 + options.offsetCol;
            extractOptions.noHeader = options.noHeader;
            if (options.endCol > 0) {
                extractOptions.endCol = extractOptions.startCol + options.endCol - 1;
            }
            if (options.endRow > 0) {
                extractOptions.endRow = extractOptions.startRow + options.endRow - 1;
            }
            //once start data has been esablished, call extractTablularDataBrickToTable generate table
            var table = extractDataBrickToTable(workbook,extractOptions);
            
            if(table){
                if(table.Rows.length===1 && table.Cols.length===1 && extractOptions.noHeader ){
                    //single value.  Setcol name == Anchor
                    var target = worksheet[XLSX.utils.encode_cell(anchorCell)];
                    table.Cols[0].Name= XLSX.utils.format_cell(target);
                }
                return table;
            }
            
        }
        return null;
    }

    function extractDataBrickToTable(workbook,options) {
        //set default options
        if (!options) {
            options = createOptionObject();
        }

        var worksheet = getWorksheet(workbook,options);

        if (worksheet) {
            if (options.startCell !== '') {
                var rowcol = this.convertCellToRowCol(options.startCell);
                options.startRow = rowcol.row;
                options.startCol = rowcol.col;
            }
            var a = worksheet['A1'];
            //make sure we are starting at A1 if not specified correctly
            if (options.startRow === 0) {
                options.startRow = 1;
            }
            if (options.startCol === 0) {
                options.startCol = 1;
            }
            //got to start x,y if EndCol not specified then walk columns until ''
            if (options.endCol === 0) {
                var endValue = '';
                //header row is fixed.  header col is incremented until val =''
                //XLSX is 0 based
                var h_row = options.headerRow === 0 ? options.startRow - 1 : options.headerRow - 1;
                var h_col = options.startCol - 1;
                do {

                    var c = worksheet[XLSX.utils.encode_cell({r: h_row, c: h_col})];
                    if (c) {
                        endValue = c.v;
                    } else {
                        endValue = '';
                    }
                    h_col++;

                } while (endValue !== '')

                options.endCol = h_col - 1;
            }

            var table = {Cols: [], Rows: []};
            //begin data extraction
            //get headers (h). If noHeader==true, then use default notation
            var h_row = options.headerRow === 0 ? options.startRow - 1 : options.headerRow - 1;

            for (h = options.startCol-1; h < options.endCol; h++) {
                var c = worksheet[XLSX.utils.encode_cell({r: h_row, c: h})];
                if (c || !options.noHeader) {
                    table.Cols.push({Name: XLSX.utils.format_cell(c), DataType: c.t});
                } else {
                    table.Cols.push({Name: 'Column' + XLSX.utils.encode_col(h), DataType: 's'});
                }
            }
            //we are 1 based, so XLSX will starton the next row below the header
            //unless head row is specified, meaning that we are extracting from the middle of the dataset
            var _row = options.headerRow === 0 || options.headerRow === options.startRow ? options.startRow : options.startRow - 1;
            if (options.noHeader) {
                _row = options.startRow - 1;
            }

            for (var r = _row; ; r++) {
                var data = [];
                for (var h = options.startCol-1; h < options.endCol; h++) {
                    var c = worksheet[XLSX.utils.encode_cell({r: r, c: h})];
                    if (c) {
                        data.push (options.preserveFormat ? XLSX.utils.format_cell(c).trim():c.v);
                    } else {
                        data.push('');
                    }
                }
                //empty row - stop processing
                //TODO: make option to alow X blank rows before deciding brick is complete
                //console.log(data.join(''));
                if (data.join('') === '') {
                    break;
                } else {
                    table.Rows.push(data);
                }
                if (options.endRow > 0 && r >= options.endRow - 1) {
                    break;
                }

                data = [];
            }
            return table;
        }

        return null;

    }
    //private functions
    function createOptionObject() {
        return {sheet: '', startRow: 0, startCol: 0, startCell: '', endRow: 0, endCol: 0, noHeader: false, headerRow: 0,preserveFormat:true, anchorText: '', offsetCol: 0, offsetRow: 0};
    }

    function getWorksheet(workbook,options) {
        if (workbook === null || workbook===undefined) {
            throw new Error('No Workbook is Open');
        }

        if (options.sheet === '') {
            options.sheet = workbook.SheetNames[0];
        }
        var worksheet = workbook.Sheets[options.sheet];
        return worksheet;
    }
    //Extracts Data in a table (contiguous row,col) structure to Komodo Table Object
    XLSPARSER.extractDataBrickToTable = extractDataBrickToTable;
    XLSPARSER.extractFloatingDataBrickToTable = extractFloatingDataBrickToTable;
    XLSPARSER.extractSingleDataCellToTable = extractSingleDataCellToTable;
            



})(typeof exports !== 'undefined' ? exports : XLSPARSER);





