/*global module:false*/
module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    grunt.initConfig({
        config: {
            app: 'app',
            dist: 'dist'
        },
        watch: {
            js: {
                files: ['<%= config.app %>/scripts/{,*/}*.js'],
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            // compass: {
            //     files: ['<%= config.app %>/styles/{,*/}*.{scss,sass}'],
            //     tasks: ['compass:server', 'autoprefixer']
            // },
            sass: {
                files: ['<%= config.app %>/sass/{,*/}*.{scss,sass}'],
                tasks: ['newer:sass', 'autoprefixer']
            },
            // styles: {
            //     files: ['<%= config.app %>/styles/{,*/}*.css'],
            //     tasks: ['autoprefixer']
            // },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= config.app %>/{,*}*.html',
                    '<%= config.app %>/styles/{,*/}*.css',
                    '<%= config.app %>/images/{,*}*'
                ]
            }
        },
        bowerInstall: {
            app: {
                src: ['<%= config.app %>/*.html'],
                ignorePath: '<%= config.app %>/',
                exclude: ['<%= config.app %>/bower_components/fontawesome/', '<%= config.app %>/bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap.js']
            }
        },
        connect: {
            options: {
                port: 9000,
                livereload: 35729,
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    open: true,
                    base: [
                        '<%= config.app %>'
                    ]
                }
            },
            dist: {
                options: {
                    open: true,
                    base: '<%= config.dist %>',
                    livereload: false
                }
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '<%= config.dist %>/*',
                        '!<%= config.dist %>/.git*'
                    ]
                }]
            },
        },
        jshint: {
            // via http://www.jshint.com/docs/options/
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                unused: false,
                boss: true,
                eqnull: true,
                browser: true,
                strict: false,
                laxbreak: true,
                devel: true,
                globals: {
                    jQuery: true,
                    require: true
                },
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= config.app %>/scripts/{,*/}*.js',
                '!<%= config.app %>/scripts/vendor/*',
                'test/spec/{,*/}*.js'
            ]
        },
        compass: {
            options: {
                sassDir: '<%= config.app %>/sass',
                cssDir: '<%= config.app %>/styles',
                generatedImagesDir: '<%= config.app %>/images/generated',
                imagesDir: '<%= config.app %>/images',// The directory where you keep your images.
                javascriptsDir: '<%= config.app %>/scripts',// The directory where you keep your JavaScript files.
                fontsDir: '<%= config.app %>/styles/fonts',// The directory where you keep your fonts.
                importPath: '<%= config.app %>/bower_components',
                httpImagesPath: '/images',
                httpGeneratedImagesPath: '/images/generated',
                httpFontsPath: '/styles/fonts',
                relativeAssets: false,
                assetCacheBuster: false
            },
            dist: {
                options: {
                    debugInfo: false,
                    generatedImagesDir: '<%= config.dist %>/images/generated'
                }
            },
            server: {
                options: {
                    debugInfo: true
                }
            }
        },
        sass: {
            dist: {
                options: {
                    style: 'expanded',
                    sourcemap: true
                },
                files: {
                    '<%= config.app %>/styles/main.css': ['<%= config.app %>/sass/main.scss']
                }
            }
        },
        autoprefixer: {
            options: {
                browsers: ['last 2 version', 'ie 8', 'ie 9'],
                map: true
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/styles/',
                    src: '{,*/}*.css',
                    dest: '<%= config.app %>/styles/'
                }]
            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/images',
                    src: '{,*/}*.{gif,jpeg,jpg,png}',
                    dest: '<%= config.dist %>/images'
                }]
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= config.app %>',
                    dest: '<%= config.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        'images/{,*/}*.webp',
                        '{,*/}*.html',
                        'styles/fonts/{,*/}*.*',
                        'data/*.*',
                        'bower_components/{,*/}*.js'
                    ]
                }]
            }
        },
        concat: {
            dist: {
                files: {
                    '<%= config.dist %>/scripts/main.js': ['<%= config.app %>/scripts/main.js']
                }
            }
        },
        cssmin: {
            dist: {
                files: {
                    '<%= config.dist %>/styles/main.css': ['<%= config.app %>/styles/main.css']
                }
            }
        },
        uglify: {
            dist: {
                files: '<%= concat.dist.files %>'
            }
        },
    });

    grunt.registerTask('serve', function(target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'bowerInstall',
            'autoprefixer',
            'connect:livereload',
            'watch'
        ]);
    });
    
    grunt.registerTask('build', [
        'bowerInstall',
        'clean:dist',
        'sass',
        'autoprefixer',
        'concat',
        'cssmin',
        'imagemin',
        'uglify',
        'copy:dist'
    ]);

    grunt.registerTask('default', [
        'newer:jshint',
        'build'
    ]);
};
