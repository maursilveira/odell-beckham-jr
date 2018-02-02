module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat : {
      dist: {
        src: [
          'js/modules/*.js',
          'js/main.js'
        ],
        dest: 'js/build/production.js'
      }
    },

    uglify : {
      build: {
        src: 'js/build/production.js',
        dest: 'js/build/production.min.js'
      }
    },

    sass: {
      dist: {
        options: {
          style: 'compressed',
          sourcemap: 'none',
          debugInfo : true,
          noCache: true
        },
        files : {
          'css/main.css' : 'scss/main.scss'
        }
      }
    },

    postcss: {
      options: {
        map: false,
        processors: [
          require('pixrem')(), // add fallbacks for rem units
          require('autoprefixer')({browsers: 'last 2 versions'}), // add vendor prefixes
          require('cssnano')() // minify the result
        ]
      },
      dist: {
        src: 'css/main.css'
      }
    },

    watch : {
      scripts : {
        files : ['js/main.js', 'js/modules/*.js'],
        tasks : ['concat', 'uglify'],
        options : {
          spawn : false
        }
      },
      sass: {
        files: ['scss/*.scss'],
        tasks: ['sass','postcss'],
        options: {
            spawn: false,
        }
      }
    }
  });

  //load pluings
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-contrib-watch');

  //when loaded, run
  grunt.registerTask('default', ['concat', 'uglify', 'sass', 'watch']);

};
