'use strict';

module.exports = function(grunt) {
  // Load all grunt tasks matching the `grunt-*` pattern.
  require('load-grunt-tasks')(grunt);

  var LIVERELOAD_PORT = 35729;
  var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
  var mountFolder = function( connect, dir ) {
    return connect.static(require('path').resolve(dir));
  };

  // Project configuration.
  grunt.initConfig({
    // wiki url
    //wiki_url: 'https://github.com/gruntjs/grunt-docs.git',
    // If local is true retrieve the docs from the local
    // grunt-docs which is expected to sit in the
    // same dir as this one.
    local: true,
    // wiki file check, file that exists in the wiki for sure
    wiki_file: 'grunt.md',
    // clean directories
    clean: {
      build: ['build/'],
      tmp: ['tmp/']
    },
    // compile less -> css
    less: {
      development: {
        options: {
          paths: ['src/less']
        },
        files: {
          'build/css/main.css': 'src/less/main.less'
        }
      },
      production: {
        options: {
          paths: ['src/less'],
          yuicompress: true
        },
        files: {
          'build/css/main.css': 'src/less/main.less'
        }
      }
    },

    watch: {
      options: {
        livereload: LIVERELOAD_PORT
      },
      less: {
        files: 'src/less/*.less',
        tasks: ['less:development']
      },
      tmpl: {
        files: 'src/tmpl/**/*.jade',
        tasks: ['default']
      },
      js: {
        files: 'src/js/**',
        tasks: ['concat']
      },
      other: {
        files: 'src/img/**',
        tasks: ['default']
      },
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: ['default']
      },
      content: {
        files: 'content/**',
        tasks: ['default']
      }
    },

    concat: {
      // if we add more js, modify this properly
      vendor: {
        src: [
          'bower_components/modernizr/modernizr.js'
        ],
        dest: 'build/js/vendor.js'
      },
      page: {
        src: [
          'src/js/*.js'
        ],
        dest: 'build/js/page.js'
      }
    },
    jshint: {
      all: ['Gruntfile.js', 'tasks/*.js'],
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        node: true,
        es5: true
      }
    },

    // copy site source files
    copy: {
      assets: {
        files: [
          {expand: true, cwd: 'src/', src: ['img/**'], dest: 'build/'}
        ]
      },
      root: {
        files: [
          {expand: true, cwd: 'src/', src: ['*'], dest: 'build/', filter: 'isFile'}
        ]
      }
    },
    nodeunit: {
      all: ['test/*_test.js']
    },

    // Server
    connect: {
      options: {
        port: 9000,
        hostname: 'localhost'
      },
      page: {
        options: {
          middleware: function( connect ) {
            return [
              lrSnippet, mountFolder(connect, 'build')
            ];
          }
        }
      }
    },
    // Open the local server.
    open: {
      dev: {
        path: 'http://localhost:<%= connect.options.port %>/'
      }
    }
  });

  // Load grunt tasks
  // All npm tasks are loaded via Sindre's load-grunt-tasks.

  // Load local tasks
  grunt.loadTasks('tasks'); // getWiki, docs tasks

  grunt.registerTask('build', ['clean', 'copy', 'docs', 'blog', 'concat']);
  grunt.registerTask('default', ['build', 'less:production']);
  grunt.registerTask('dev', ['build', 'less:development', 'jshint', 'connect', 'open', 'watch']);
  grunt.registerTask('test', ['nodeunit']);};
