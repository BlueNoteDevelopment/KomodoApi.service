/**
 *@module   QueryParamParser
 */
var QUERYPARAM = {};
(function make_module(QUERYPARAM) {


    /**
     * @@function   resolveParam
     * @param {string} param
     * @returns {string}
     */
    function resolveParam(param){
        var regex = /([dt]{1,2}):([a-z]+)(?:\[([+-\d\.a-z]*)\])?/g;
        var match = regex.exec(param);
        
        var valueType = match[match.index];
        var paramType = match[match.index+1];
        var paramOption = '';
        var returnValue = '';
        
        if(match[match.index+2] === undefined){
            paramOption = '';
        }else{
            paramOption = match[match.index+2];
        }
            
        console.log(valueType + ',' + paramType + ',' + paramOption)
        
        switch (valueType){
            
            case 'dt':
                
                break;
            default:
                returnValue = null;
                break;
        }
        return returnValue;
    }

    /**
     * @property {string} Version 
     */
    QUERYPARAM.version = "1.0.0.0";
    
    QUERYPARAM.resolveParam = resolveParam;


})(typeof exports !== 'undefined' ? exports : QUERYPARAM);


