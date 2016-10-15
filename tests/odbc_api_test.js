/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var http = require('http');
var assert = require('chai').assert;
var rest = require('restler');
var mocha = require('mocha');

mocha.ui = 'tdd';

suite('API Tests', function () {

    var base = 'http://localhost:18963';

    var odbc = {
        dsn: 'Test1',
        command: 'SELECT * FROM Users',
        params: [{value: '1'}]
    };

    var mssql = {
        server: '.',
        database: 'KomodoTest',
        user: '',
        password: '',
        command: 'SELECT * FROM Users',
        params: [{value: '1'}]
    };

    test('should fail odbc', function (done) {

        odbc.dsn = "NoTExist";

        rest.post(base + '/api/odbcQuery', {data: odbc}).on('complete', function (data) {
            //console.log(data);
            assert(data.Errors !== 'undefined');
            done();
        });


    });



    test('should POST odbc query and return rows', function (done) {

        odbc.dsn = "Test1";
        rest.post(base + '/api/odbcQuery', {data: odbc}).on('complete', function (data) {
            //var result = JSON.parse(data);
            assert(data.Cols.length > 0);
            done();
        });


    });

    test('should GET table odbc data and return rows', function (done) {
        var dsn = 'Test1';
        var table = 'users';
        rest.get(base + '/api/odbcQuery/' + dsn + "/" + table).on('complete', function (data) {
            //console.log(data);
            assert(data.Cols.length > 0);
            done();

        });


    });


    test('should POST mssql query with Bad Query and Fail', function (done) {

        mssql.command = "SELECT * FROM BadtablName";

        rest.post(base + '/api/mssqlQuery', {data: mssql}).on('complete', function (data) {
            //var result = JSON.parse(data);
            assert(data.Errors !== 'undefined');
            done();
        });


    });

    test('should POST mssql query and return rows', function (done) {
        mssql.command = 'SELECT * FROM Users'

        rest.post(base + '/api/mssqlQuery', {data: mssql}).on('complete', function (data) {
            //var result = JSON.parse(data);
            assert(data.Cols.length > 0);
            done();
        });


    });


});

