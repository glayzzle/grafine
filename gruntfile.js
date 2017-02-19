module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      options: {
        banner: '/*! <%= pkg.name %> - BSD3 License - <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        alias: {
          'grafine': './index.js'
        }
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.js': 'index.js' // ['src/*.js', 'src/**/*.js']
        }
      }
    },
    documentation: {
      graph: {
        options: {
          destination: "docs/",
          format: "md",
          version: "<%= pkg.version %>",
          name: "<%= pkg.name %>",
          filename: "graph.md",
          shallow: false
        },
        files: [{
          src: ['src/graph.js']
        }]
      },
      index: {
        options: {
          destination: "docs/",
          format: "md",
          version: "<%= pkg.version %>",
          name: "<%= pkg.name %>",
          filename: "index.md",
          shallow: false
        },
        files: [{
          src: ['src/index.js']
        }]
      },
      point: {
        options: {
          destination: "docs/",
          format: "md",
          version: "<%= pkg.version %>",
          name: "<%= pkg.name %>",
          filename: "point.md",
          shallow: false
        },
        files: [{
          src: ['src/point.js']
        }]
      },
      shard: {
        options: {
          destination: "docs/",
          format: "md",
          version: "<%= pkg.version %>",
          name: "<%= pkg.name %>",
          filename: "shard.md",
          shallow: true
        },
        files: [{
          src: ['src/shard.js']
        }]
      }
    },
    uglify: {
      options: {
        compress: {
          keep_fnames: true
        },
        sourceMap: true,
        mangle: false,
        maxLineLen: 1024
      },
      dist: {
        src: 'dist/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    }
  });

  // Load the plugin
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-documentation');

  // Default task(s).
  grunt.registerTask('default', ['browserify', 'uglify']);
  grunt.registerTask('doc', ['documentation']);

};
