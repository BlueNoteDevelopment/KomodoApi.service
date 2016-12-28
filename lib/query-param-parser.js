'use strict';
/**
 *@module   QueryParamParser
 */
var QUERYPARAM = {};
(function make_module(QUERYPARAM) {


    function processSQLStatement(sql,date){
        var regex = /{[a-z]{1,2}:[a-z]*(?:\[[\w\d,-]*])*\}/g;
  
        return sql.replace(regex,function ($0){ 
            return resolveParam($0,date);
          });
        
    }
    
    /**
     * @description creates a runtime parameter that is calulated based on the current date or setting
     * @function   resolveParam
     * @param {string} param
     * @param {date|string} date Date to base calculating off of.  if null then use current date in local timezone
     * @returns {string}
     */
    function resolveParam(param,date){
        var moment = require('moment');
        var regex = /([a-z]{1,2}):([a-z]+)(?:\[([+-\d\.,a-z]*)\])?/g;
        var match = regex.exec(param);
        
        if(!match){return null;}
        
        
        var valueType = match[match.index];
        var paramType = match[match.index+1];
        var paramOption = '';
        
        var returnValue = null;
        
        paramType = paramType.toLowerCase().trim();
        
        if(match[match.index+2] === undefined){
            paramOption = '';
        }else{
            paramOption = match[match.index+2];
            paramOption = paramOption.replace(/\s/g,'');
        }
        var opt = paramOption.split(',');    
        //console.log(valueType + ',' + paramType + ',' + paramOption)
        
        switch (valueType){
            
            case 'dt':
                //date time
                //create relative date to calc from
                var paramDate = moment();
                if(!(date === null || date=== undefined || date === '')){
                    
                    if(!moment(date).isValid()){paramDate = moment();}else{paramDate = moment(date);}
                }
                //normalize time;
                paramDate.hours(0).minutes(0).seconds(0).milliseconds(0);
                //get options
               
                
                if(paramType === 'lm' || paramType==='lastmonth' ){
                    //last month
                    paramDate.add(-1,'months');
                    
                    if(hasOption(opt,'f','first')){
                        paramDate.date(1);
                    }
                    
                    if(hasOption(opt,'l','last')){
                        paramDate.endOf('month');
                    }
                    
                    returnValue = applyTimeOptionAndFormat(opt,paramDate);
                    
                }else if (paramType === 'cm' || paramType==='currentmonth' ){

                    if(hasOption(opt,'f','first')){
                        paramDate.date(1);
                    }

                    if(hasOption(opt,'l','last')){
                        paramDate.endOf('month');
                    }

                    returnValue = applyTimeOptionAndFormat(opt,paramDate);  
                }else if (paramType === 'lw' || paramType==='lastweek' ){
                    
                    paramDate.add(-7,'days');
                    
                    if(hasOption(opt,'f','first')){
                        if(hasOption(opt,'mon','startonmonday')){
                            paramDate.startOf('isoweek');
                        }else{
                            paramDate.startOf('week');
                        }
                    }

                    if(hasOption(opt,'l','last')){
                        if(hasOption(opt,'mon','startonmonday')){
                            paramDate.endOf('isoweek');
                        }else{
                            paramDate.endOf('week');
                        }
                    }
                    returnValue = applyTimeOptionAndFormat(opt,paramDate); 
                }else if (paramType === 'cw' || paramType==='currentweek' ){
                    if(hasOption(opt,'f','first')){
                        if(hasOption(opt,'mon','startonmonday')){
                            paramDate.startOf('isoweek');
                        }else{
                            paramDate.startOf('week');
                        }
                    }

                    if(hasOption(opt,'l','last')){
                        if(hasOption(opt,'mon','startonmonday')){
                            paramDate.endOf('isoweek');
                        }else{
                            paramDate.endOf('week');
                        }
                    }
                    returnValue = applyTimeOptionAndFormat(opt,paramDate); 
                }
                
                
                break;
            case 'dp': //date part
                var paramDate = moment();
                if(!(date === null || date=== undefined || date === '')){
                    
                    if(!moment(date).isValid()){paramDate = moment();}else{paramDate = moment(date);}
                }
                //normalize time;
                paramDate.hours(0).minutes(0).seconds(0).milliseconds(0);
                
                if(paramType === 'yr' || paramType==='year' ){
                    if(hasOption(opt,'prev','previous')){paramDate.add(-1,'years');}
                    returnValue = paramDate.format('YYYY')
                }
                if(paramType === 'mo' || paramType==='month' ){
                    if(hasOption(opt,'prev','previous')){paramDate.add(-1,'months');}
                    returnValue = paramDate.format('MM')
                }
                if(paramType === 'dy' || paramType==='day' ){
                    if(hasOption(opt,'prev','previous')){paramDate.add(-1,'days');}
                    returnValue = paramDate.format('DD')
                }
            
                break;
            default:
                returnValue = null;
                break;
        }
        return returnValue;
    }

/*
 * @description Takes a moment object ,normalizes time to either begin or dend of the day and returns formated string.  !Manipulates orginal moment!
 * 
 * @function applyTimeOptionAndFormat
 * @param {array} opt
 * @param {moment} paramDate
 * @returns {string}
 */
    function applyTimeOptionAndFormat(opt,paramDate){
        var returnValue;
        if(hasOption(opt,'sod','startofday')){
            paramDate.hours(0).minutes(0).seconds(0).milliseconds(0);
            returnValue = paramDate.format('YYYY-MM-DD HH:mm:ss')
        }else if(hasOption(opt,'eod','endofday')){
            paramDate.hours(23).minutes(59).seconds(59).milliseconds(999);
            returnValue = paramDate.format('YYYY-MM-DD HH:mm:ss')
        }else{
            returnValue = paramDate.format('YYYY-MM-DD')
        }
        
        return returnValue;
    }

    function hasOption(options,shortCode,longCode){
        if(!options){return false;}
        
        if(longCode===null || longCode===undefined){shortCode=longCode};
        
        if(options.indexOf(shortCode) >=0 || options.indexOf(longCode)>=0){return true;}
        
        return false;
        
        
    }
    /**
     * @property {string} Version 
     */
    QUERYPARAM.version = "1.0.0.0";
    
        /**
     * @@function   resolveParam
     * @param {string} param
     * @returns {string}
     */
    QUERYPARAM.resolveParam = resolveParam;
    QUERYPARAM.processSQLStatement = processSQLStatement;

})(typeof exports !== 'undefined' ? exports : QUERYPARAM);


