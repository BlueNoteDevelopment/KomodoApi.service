/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
module.exports = function (grunt) {
    // Project configuration.
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint : {
            options:{
                reporter : require('jshint-stylish'),
                force :  true,
                esversion: 6,
                laxcomma : true,
                loopfunc: true,
                '-W014' : true
            },
          all: ['service_execution_child_node.js','service_main_node.js', './lib/*.js']  
        },
        clean : {
            dist: ['./dist/*']
            
        },
        jsdoc : {
            dist : {
                src: ['lib/*.js'],
                options: {
                    destination: './dist/doc',
                    configure: './jsdoc.json'
                    }
                }
            },
        copy : {
            dist: {
                
                files : [        
                    {src: ['package.json', 'service_execution_child_node.js', 'service_main_node.js'], dest: './dist/'},
                    {src: ['./lib/*.js'], dest: './dist/', filter: 'isFile'},
                    {src: ['./bin/*.dll'], dest: './dist/', filter: 'isFile'}
                ]           
            }
        },
        babel : {
            options: {
                sourceMap: false,
                presets: ['babel-preset-es2015']
            },
            dist: {
                files: {
                        './dist/lib/collection-config-factory.js': ['./dist/lib/collection-config-factory.js'],
                        './dist/lib/csvparser.js': ['./dist/lib/csvparser.js'],
                        './dist/lib/database-processor.js': ['./dist/lib/database-processor.js'],
                        './dist/lib/execution-context.js': ['./dist/lib/execution-context.js'],
                        './dist/lib/execution-manager.js': ['./dist/lib/execution-manager.js'],
                        './dist/lib/logger.js': ['./dist/lib/logger.js'],
                        './dist/lib/query-param-parser.js': ['./dist/lib/query-param-parser.js'],
                        './dist/lib/runtime-storage.js': ['./dist/lib/runtime-storage.js'],
                        './dist/lib/service-config.js': ['./dist/lib/service-config.js'],
                        './dist/lib/utility.js': ['./dist/lib/utility.js'],
                        './dist/lib/xlsparser.js': ['./dist/lib/xlsparser.js']
                }
            }
        },
        uglify :{
            options: {
                mangle: true
                },
                my_target: {
                    files: {
                        './dist/lib/collection-config-factory.js': ['./dist/lib/collection-config-factory.js'],
                        './dist/lib/csvparser.js': ['./dist/lib/csvparser.js'],
                        './dist/lib/database-processor.js': ['./dist/lib/database-processor.js'],
                        './dist/lib/execution-context.js': ['./dist/lib/execution-context.js'],
                        './dist/lib/execution-manager.js': ['./dist/lib/execution-manager.js'],
                        './dist/lib/logger.js': ['./dist/lib/logger.js'],
                        './dist/lib/query-param-parser.js': ['./dist/lib/query-param-parser.js'],
                        './dist/lib/runtime-storage.js': ['./dist/lib/runtime-storage.js'],
                        './dist/lib/service-config.js': ['./dist/lib/service-config.js'],
                        './dist/lib/utility.js': ['./dist/lib/utility.js'],
                        './dist/lib/xlsparser.js': ['./dist/lib/xlsparser.js']
                    }
            }
        }
        
            
        }
    );
    
    grunt.registerTask('default', ['jshint','clean','jsdoc','copy','babel','uglify']);
};
