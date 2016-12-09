/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
module.exports = function (grunt) {
    // Project configuration.
    grunt.loadNpmTasks('grunt-jsdoc');
    
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jsdoc : {
            dist : {
                src: ['lib/*.js'],
                options: {
                    destination: 'doc',
                    configure: './jsdoc.json'
                    }
                }
            }
        }
    );
    
    grunt.registerTask('default', ['jsdoc']);
    
};
