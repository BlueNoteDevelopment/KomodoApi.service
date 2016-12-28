'use strict';

var runtimeStorage = {};
(function make_parser(runtimeStorage) {
    if (typeof require !== 'undefined')
        var fs = require('fs-extra');
    /*properties*/
    runtimeStorage.version = "1.0.0.0";

    //filename is full file path to settings file


    function saveSettingSync(filename, section, name, value) {
        var base = null;

        if ((name === undefined || name === null || name === '')) {
            throw new Error('Setting Name Was Not Supplied');
        }

        try {
            base = fs.readJsonSync(filename, {encoding: 'utf-8', passParsingErrors: true});
        } catch (e) {
            base = {};
        }
        if (base === null) {
            base = {};
        }

        if (!(section === "." || section === '')) {
            if (!base.hasOwnProperty(section)) {
                base[section] = {};
            }

            base[section][name] = value;

        } else {
            base[name] = value;
        }


        try {
            fs.writeJsonSync(filename, base, {encoding: 'utf-8'});
            return true;
        } catch (e) {
            throw e;
        }
    }

    function getSettingSync(filename, section, name, defaultvalue) {
        var base = null;
        var value = null;

        if (defaultvalue === undefined) {
            defaultvalue = null;
        }

        if ((name === undefined || name === null || name === '')) {
            throw new Error('Setting Name Was Not Supplied');
        }

        try {
            base = fs.readJsonSync(filename, {encoding: 'utf-8', passParsingErrors: true});
        } catch (e) {
            base = {};
        }
        if (base === null) {
            return defaultvalue;
        }

        if (!(section === "." || section === '')) {
            if (!base.hasOwnProperty(section)) {
                return defaultvalue;
            }

            value = base[section][name];

        } else {
            value = base[name];
        }

        if ((value === undefined || value === null)) {
            return defaultvalue;
        } else {
            return value;
        }


    }

    function saveSetting(filename, section, name, value, callback) {
        var base = null;

        if ((name === undefined || name === null || name === '')) {
            if (callback) {
                return callback(new Error('Setting Name Was Not Supplied'), false);
            } else {
                throw new Error('Setting Name Was Not Supplied');
            }
        }

        fs.readJson(filename, {encoding: 'utf-8', passParsingErrors: true}, function (err, jsonObj) {

            if (err) {
                base = {};
            } else {
                if (jsonObj) {
                    base = jsonObj;
                }
            }

            if (base === null) {
                base = {};
            }

            if (!(section === "." || section === '')) {
                if (!base.hasOwnProperty(section)) {
                    base[section] = {};
                }

                base[section][name] = value;

            } else {
                base[name] = value;
            }

            fs.writeJson(filename, base, {encoding: 'utf-8'}, function (err2) {
                if (err2) {
                    if (callback) {
                        return callback(err2, false);
                    } else {
                        throw err2;
                    }
                } else {
                    if (callback) {
                        return callback(null, true)
                    }
                    ;
                }
            });
        });

    }

    function getSetting(filename, section, name, defaultvalue, callback) {
        var base = null;
        var value = null;
        
        if (defaultvalue === undefined) {
            defaultvalue = null;
        }

        if ((name === undefined || name === null || name === '')) {
            if (callback) {
                return callback(new Error('Setting Name Was Not Supplied'), false);
            } else {
                throw new Error('Setting Name Was Not Supplied');
            }
        }

        fs.readJson(filename, {encoding: 'utf-8', passParsingErrors: true}, function (err, jsonObj) {

            if (err) {
                base = {};
            } else {
                if (jsonObj) {
                    base = jsonObj;
                }
            }

            if (base === null) {
                if (callback) {
                    return callback(null, defaultvalue)
                } else {
                    return defaultvalue;
                }
            }

            if (!(section === "." || section === '')) {
                if (!base.hasOwnProperty(section)) {
                    if (callback) {
                        return callback(null, defaultvalue)
                    } else {
                        return defaultvalue;
                    }
                }

                value = base[section][name];

            } else {
                value = base[name];
            }

            if ((value === undefined || value === null)) {
                if (callback) {
                    return callback(null, defaultvalue)
                } else {
                    return defaultvalue;
                }
            } else {
                if (callback) {
                    return callback(null, value)
                } else {
                    return value;
                }
            }
        });
    }


    runtimeStorage.saveSettingSync = saveSettingSync;
    runtimeStorage.getSettingSync = getSettingSync;
    runtimeStorage.saveSetting = saveSetting;
    runtimeStorage.getSetting = getSetting;

})(typeof exports !== 'undefined' ? exports : runtimeStorage);