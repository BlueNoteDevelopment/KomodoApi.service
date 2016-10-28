//*Logger module - used to log error/warning/and info messages
//*uses API calls contained in service_main_node.js*/

var UTILITY = {};
(function make_module(UTILITY) {

    function getDateYYYMMDD(date) {
        var d = null;
        if(date===undefined){
            d = new Date();
        }else{
            d = date;
        }
        
        var mm = d.getMonth() + 1; // getMonth() is zero-based
        var dd = d.getDate();
        return [d.getFullYear(), mm<10 ? '0'+ mm: mm, dd<10 ? '0'+ dd : dd].join(''); // padding
    }

    UTILITY.getDateYYYMMDD = getDateYYYMMDD;
    UTILITY.version = "1.0.0.0";


})(typeof exports !== 'undefined' ? exports : UTILITY);



