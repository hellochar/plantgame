module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-wiredep');
    grunt.loadNpmTasks('grunt-open');
 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            server: {
                options: {
                    port: 8080,
                    base: './'
                }
            }
        },
        typescript: {
            base: {
                src: ['src/**/*.ts'],
                dest: 'js/main.js',
                options: {
                    module: 'amd',
                    target: 'es5'
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
                path: 'http://localhost:8080/index.html'
            }
        },
        wiredep: {
            target: {
                src: ['index.html'],
                options: {
                    dependencies: true
                }
            }
        }
    });
 
    grunt.registerTask('default', ['connect', 'open', 'watch']);
 
}

