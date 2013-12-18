/*
 * grunt blog, rss, index pages
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 grunt contributors
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {
  'use strict';

  var jade = require('jade'),
    highlighter = require('highlight.js'),
    marked = require('marked'),
    blog = require('./lib/blog').init(grunt);

  /**
   * Custom task to generate the grunt blog
   */
  grunt.registerTask('blog', 'Compile Grunt Blog', function () {
    grunt.log.ok('Generating blog...');

    // Set default marked options
    marked.setOptions({
      gfm:true,
      anchors:true,
      base:'/',
      pedantic:false,
      sanitize:true,
      // callback for code highlighter
      highlight:function (code) {
        return highlighter.highlight('javascript', code).value;
      }
    });

    var names;
    var shortList = [];
    var articleList = [];
    var base = 'content/blog/';
    var files = grunt.file.expand({cwd:base, filter: 'isFile'}, ['*.md']);

    names = files.map(function (name) {
      return name.substring(5, name.length - 3);
    }).reverse();

    // REVERSE the list, generate short article list
    files.reverse().forEach(function (file, i) {
      var name = names[i],
        postTitle = name.substring(10, name.length).replace(/-/g, ' '),
        postDate = name.substring(0, 10),
        destName = name.toLowerCase() + '.html';

      articleList.push({
        url:destName,
        title:postTitle,
        postDate:blog.formatDate(postDate)
      });
    });

    files.forEach(function (file, i) {

      var name = names[i],
        postTitle = name.substring(10, name.length).replace(/-/g, ' '),
        postDate = name.substring(0, 10),
        destName = name.toLowerCase(),
        src = base + file,
        dest = 'build/blog/' + destName + '.html';

      grunt.file.copy(src, dest, {
        process:function (src) {
          var file = 'src/tmpl/blog.jade',
            templateData = {
              page:'news',
              singlePost:true,
              url:destName,
              title:postTitle,
              postDate:blog.formatDate(postDate),
              postRawDate:postDate,
              articleList:articleList,
              content:marked(src),
              rawSrc:src
            };
          shortList.push(templateData);

          return jade.compile(grunt.file.read(file), {filename:file})(templateData);
        }
      });
    });

    /**
     * Generate the blog page with a list of posts
     */
    grunt.log.ok('Generating blog front page..');
    var blogTpl = 'src/tmpl/blog.jade';
    var blogOut = jade.compile(grunt.file.read(blogTpl), {filename:blogTpl})({
      page:'blog',
      title:'The Grunt Blog',
      content:shortList,
      articleList:articleList
    });
    grunt.file.write('build/blog/index.html', blogOut);

    /**
     * Generate imprint
     */
    grunt.log.ok('Generating imprint page...');
    var imprintTpl = 'src/tmpl/imprint.jade';
    var imprintOut = jade.compile(grunt.file.read(imprintTpl), {filename:imprintTpl})({
      page:'imprint',
      news:shortList.splice(0, 5)
    });
    grunt.file.write('build/imprint.html', imprintOut);

    /**
     * Generate the front page
     */
    grunt.log.ok('Generating the front page...');
    var indexTpl = 'src/tmpl/index.jade';
    var indexOut = jade.compile(grunt.file.read(indexTpl), {filename:indexTpl})({
      page:'index',
      news:shortList.splice(0, 5)
    });
    grunt.file.write('build/index.html', indexOut);
  });
};
