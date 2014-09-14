module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-wiredep');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-usemin');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            server: {
                options: {
                    port: process.env.PORT || 8080,
                    base: './'
                }
            }
        },
        typescript: {
            base: {
                src: ['src/box2d.ts',
                      'src/main.ts'
                     ],
                dest: 'js/main.js',
                options: {
                    module: 'amd',
                    target: 'es5',
                    basePath: 'src',
                }
            }
        },
        watch: {
            ts: {
                files: '**/*.ts',
                tasks: ['typescript'],
                options: {
                    livereload: true
                }
            },
            htmlAndCss: {
                files: ['**/*.html', '**/*.css'],
                options: {
                    livereload: true
                },
            }
        },
        open: {
            dev: {
                path: 'http://localhost:8080'
            }
        },
        wiredep: {
            target: {
                src: ['index.html'],
                options: {
                    dependencies: true
                }
            }
        },
        copy: {
          dist: {
            files: [
              {src: 'index.html', dest: 'dist/index.html'},
              {src: 'style.css', dest: 'dist/style.css'}
            ]
          }
        },

        'useminPrepare': {
          options: {
            dest: 'dist'
          },
          html: 'index.html'
        },

        usemin: {
          html: ['dist/index.html']
        }
    });
 
    grunt.registerTask('default', ['connect', 'open', 'watch']);
    grunt.registerTask('dist', ['wiredep', 'useminPrepare', 'copy', 'concat', 'uglify', 'usemin']);
 
}

