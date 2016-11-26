
var CSVPARSER = {};
(function make_parser(CSVPARSER) {
    if (typeof require !== 'undefined')
        CSV = require('js-csvparser');

    /*properties*/
    CSVPARSER.version = "1.0.0.0";
    
    //all options are 1 based for row/col coordinates
    function createOptionObject() {
        return {
            delimiter: 'auto',
            startRow: 0, 
            startCol: 0, 
            endRow: 0, 
            endCol: 0, 
            noHeader: false, 
            headerRow: 1,
            preserveFormat:true,
            maxRows: 0
        };
    }
    
    function loadCSVFile(filename,callback){
        var fs = require('fs');
        if(callback===null || callback===undefined){
            return fs.readFileSync(filename,'utf-8');
        }else{
            fs.readFile(filename,'utf-8',callback);
        }
    }

    function extractDataBrickToTable(csvdata,options) {
        //set default options
        if (!options) {
            options = createOptionObject();
        }
        
        if(csvdata===''){
            throw new Error('No Data Available to Parse');
        }
        //set up options
        var csvOptions = {skipEmptyLines:true,maxRows:options.maxRows};
        if(options.delimter !== '' || options.delimter.toLower() !== 'auto' ){
            csvOptions.delimiter = options.delimiter;
        }
        
        if(options.noHeader){
            csvOptions.header = false;
        }
        
        var csv = CSV(csvdata,csvOptions);
        var table = {Cols: [], Rows: []};
        
        if(csv){
            var cols = options.endCol===0?csv.header[0].length:options.endCol;
            if(cols>csv.header[0].length){cols=csv.header[0].length;}
                        
            for(var c=(options.startCol===0?0:options.startCol-1); c < cols ;c++){
                table.Cols.push({Name:csv.header[0][c], DataType:'s'});
            }
            var rows = options.endRow===0?csv.data.length:options.endRow;
            
            if(rows > csv.data.length ){rows=csv.data.length;}
            
            for(var i=(options.startRow===0?0:options.startRow-1); i < rows ;i++){
                table.Rows.push(csv.data[i].slice(options.startCol,cols));
            }
            
        }else{
            throw new Error("Could not Process CSV Data");
        }
        
        return table;
    }
    
    CSVPARSER.loadCSVFile = function(filename,callback){
        if(callback===null || callback===undefined){
            return loadCSVFile(filename);
        }else{
            
            loadCSVFile(filename, function(error,data){
               if(error){
                   callback(error,'');
                   return;
               }else{
                    return callback(null,data);
               }
            });
        }
        

    }
    
    CSVPARSER.createOptionObject =  createOptionObject;
    CSVPARSER.extractDataBrickToTable =  extractDataBrickToTable;
    
    
})(typeof exports !== 'undefined' ? exports : CSVPARSER);