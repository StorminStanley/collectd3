'use strict';
module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      server: ['lib/**/*.js', 'test/**/*.js', '*.js'],
      client: {
        options: {
          jshintrc: 'web/.jshintrc'
        },
        files: {
          src: ['web/apps/**/*.js', 'web/directives/**/*.js', 'web/*.js']
        }
      }
    },
    shell: {
      test: {
        command: 'npm test'
      },
      run: {
        command: 'node server.js',
        options: {
          async: true
        }
      }
    },
    watch: {
      server: {
        files: ['lib/**/*.js', 'test/**/*.js', 'config/**/*.yml', '*.js'],
        tasks: ['jshint', 'shell:test', 'shell:run'],
        options: {
          interrupt: true
        }
      },
      clientjs: {
        files: ['web/apps/**/*.js', 'web/directives/**/*.js', 'web/*.js'],
        tasks: ['jshint:client']
      },
      clientcss: {
        files: ['web/less/**/*.less'],
        tasks: ['less:development']
      }
    },
    less: {
      development: {
        files: {
          'web/css/style.css': 'web/less/style.less'
        }
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-shell-spawn');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  
  grunt.registerTask('default', ['jshint', 'less', 'shell:test', 'shell:run', 'watch']);
  
};