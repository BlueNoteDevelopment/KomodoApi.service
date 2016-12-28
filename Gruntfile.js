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
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
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
                    {src: ['./lib/*.js'], dest: '/dist/lib/', filter: 'isFile'}
                ]           
            }
        }
        
            
        }
    );
    
    grunt.registerTask('default', ['jsdoc','copy']);
    
};
