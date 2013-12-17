/*
 * grunt docs
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 grunt contributors
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {
  'use strict';

  var fs = require('fs'),
    exec = require('child_process').exec,
    jade = require('jade'),
    highlighter = require('highlight.js'),
    docs = require('./lib/docs').init(grunt);

  /**
   * Custom task to generate grunt documentation
   */
  grunt.registerTask('docs', 'Compile Grunt Docs to HTML', function () {
    var done = this.async();

    /**
     * generate the docs based on the github wiki
     */
    function generateDocs(local) {
      /**
       *
       * Helper Functions
       *
       */

      var base = local ? 'content/' : 'tmp/';

      /**
       * Generate grunt guides documentation
       */
      function generateGuides() {
        grunt.log.ok('Generating Guides...');

        var headlines = {
          getting_started: { //same for overview, the generator and roadmap
            headline_title: 'Getting started with The-M-Project',
            headline_subtitle: 'How to install and use The-M-Project, basic tutorials and templates for building a native app.',
            headline_bottom: 'Get started with The-M-Project:',
            headline_bottom_link: {
              text: 'Read The-M-Project docs',
              link: 'http://www.the-m-project.org/docs/absinthe/'
            }
          },

          bikini: {
            headline_title: 'Bikini',
            headline_subtitle: 'An implementation of a model/server connectivity to write real-time, collaborative apps.',
            headline_bottom: 'Everything a model needs:',
            headline_bottom_link: {
              text: 'Get a glimpse of Bikini',
              link: 'https://github.com/mwaylabs/The-M-Project#bikini'
            }
          },

          kitchensink: {
            headline_title: 'Examples',
            headline_subtitle: 'The-M-Project lets you quickly prototype and create apps through a library of components with a high device coverage.',
            headline_bottom: 'Start developing apps:',
            headline_bottom_link: {
              text: 'Read the Readme at GitHub',
              link: 'https://github.com/mwaylabs/The-M-Project#the-m-project-20-absinthe-beta-release--'
            }
          },

          community: {
            headline_title: 'Community',
            headline_subtitle: 'Join us on GitHub or Google Groups, track bugs, discuss new features or even send pull requests.',
            headline_bottom: 'Be a part of the discussion:',
            headline_bottom_link: {
              text: 'Start at Google Groups',
              link: 'https://groups.google.com/forum/#!forum/themproject'
            }
          }

        };

        //same for overview, the generator and roadmap
        headlines.overview = headlines.the_generator = headlines.roadmap = headlines.getting_started;
        headlines.addressbook = headlines.kitchensink;

        // API Docs
        var sidebars = [];
        var names = grunt.file.expand({cwd:base}, ['*', '!Blog-*', '!grunt*.md', '!*.js']);

        //These are just the title of the navigation, they will be hidden with css because they do not provide linking
        sidebars[0] = getSidebarSection('## Overview');
        sidebars[1] = getSidebarSection('## Bikini');
        sidebars[2] = getSidebarSection('## Examples');
        sidebars[3] = getSidebarSection('## Community');
        sidebars[4] = getSidebarSection('## Getting started');
        sidebars[5] = getSidebarSection('## The generator');
        sidebars[6] = getSidebarSection('## Roadmap');
        sidebars[7] = getSidebarSection('## Addressbook');
        sidebars[8] = getSidebarSection('## Kitchensink');

        names.forEach(function (name) {

          if(name.indexOf('.png') > -1) {
            grunt.file.copy(base + name, 'build/' + name);
            return;
          }

          var title = name.replace(/-/g,' ').replace('.md', ''),
            segment = name.replace(/-/g,'_').replace('.md', '').toLowerCase(),
            src = base + name,
            dest = 'build/' + name.replace('.md', '').toLowerCase() + '.html';

            var sb = [];
            sidebars.forEach(function(sidebar){
                if(sidebar && sidebar[0] && sidebar[0].name){
                    if(sidebar[0].name === title){
                        sb = sidebar;
                    }
                  }
            });

          grunt.file.copy(src, dest, {
            process:function (src) {
              try {
                var file = 'src/tmpl/docs.jade',
                  templateData = {
                    page:'docs',
                    rootSidebar: true,
                    pageSegment: segment,
                    headline_title: headlines && headlines[segment] && headlines[segment].headline_title? headlines[segment].headline_title : '',
                    headline_subtitle: headlines && headlines[segment] && headlines[segment].headline_subtitle? headlines[segment].headline_subtitle : '',
                    headline_bottom: headlines && headlines[segment] && headlines[segment].headline_bottom? headlines[segment].headline_bottom : '',
                    headline_bottom_link: headlines && headlines[segment] && headlines[segment].headline_bottom_link? headlines[segment].headline_bottom_link : '',
                    content: docs.anchorFilter( marked( docs.wikiAnchors(src) ) ),
                    sidebar: sb
                  };
                return jade.compile(grunt.file.read(file), {filename:file})(templateData);
              } catch (e) {
                grunt.log.error(e);
                grunt.fail.warn('Jade failed to compile.');
              }
            }
          });
        });
        grunt.log.ok('Created ' + names.length + ' files.');
      }


      /**
       * Generate grunt API documentation
       */
      function generateAPI() {
        grunt.log.ok('Generating API Docs...');
        // API Docs
        var sidebars = [];
        var names = grunt.file.expand({cwd:base}, ['grunt.*.md', '!*utils*']);

        names = names.map(function (name) {
          return name.substring(0, name.length - 3);
        });

        // the default api page is special
        names.push('grunt');
        // TODO: temporary store for these
        names.push('Inside-Tasks');

        // get docs sidebars
        sidebars[0] = getSidebarSection('## API', 'icon-cog');
        sidebars[1] = getSidebarSection('### Other');

        names.forEach(function (name) {
          var src = base + name + '.md',
            dest = 'build/api/' + name.toLowerCase() + '.html';
          grunt.file.copy(src, dest, {
            process:function (src) {
              try {
                var file = 'src/tmpl/docs.jade',
                  templateData = {
                    page:'api',
                    pageSegment: name.toLowerCase(),
                    title:name.replace(/-/g,' '),
                    content: docs.anchorFilter( marked( docs.wikiAnchors(src) ) ),
                    sidebars: sidebars
                  };

                return jade.compile(grunt.file.read(file), {filename:file})(templateData);
              } catch (e) {
                grunt.log.error(e);
                grunt.fail.warn('Jade failed to compile.');
              }
            }
          });
        });
        grunt.log.ok('Created ' + names.length + ' files.');
      }

      /**
       * Get sidebar list for section from Home.md
       */
      function getSidebarSection(section, iconClass) {
        var rMode = false,
          l,
          items = [];

        // read the Home.md of the wiki, extract the section links
        var lines = fs.readFileSync(base + 'Home.md').toString().split(/\r?\n/);
        for(l in lines) {
          var line = lines[l];

          // choose a section of the file
          if (line === section) { rMode = true; }
          // end of section
          else if (line.substring(0,2) === '##') { rMode = false; }

          if (rMode && line.length > 0) {
            var item = line.replace(/#/g,'').replace(']]', '').replace('* [[', ''),
              url = item;
            if (item[0] === ' ') {
              // TODO: clean this up...
              if (iconClass) {
                items.push({name: item.substring(1,item.length), icon: iconClass});
              } else {
                items.push({name: item.substring(1,item.length)});
              }
            } else {
              items.push({name: item, url: url.replace(/ /g,'-').toLowerCase()});
            }
          }
        }
        return items;
      }

      // marked markdown parser
      var marked = require('marked');
      // Set default marked options
      marked.setOptions({
        gfm:true,
        anchors: true,
        base: '/',
        pedantic:false,
        sanitize:true,
        // callback for code highlighter
        highlight:function (code) {
          return highlighter.highlight('javascript', code).value;
        }
      });

      // grunt guides - wiki articles that are not part of the grunt api
      generateGuides();
      // grunt api docs - wiki articles that start with 'grunt.*'
      generateAPI();

      done(true);
    }

    // clean the wiki directory, clone a fresh copy
    var wiki_url;
    // If the config option local is set to true, get the docs from
    // the local grunt-docs repo.
    if (grunt.config.get('local') === true) {
      generateDocs('local');
    }
    else {
      wiki_url = grunt.config.get('wiki_url');

      exec('git clone ' + wiki_url + ' tmp/wiki', function (error) {
        if (error) {
          grunt.log.warn('Warning: Could not clone the wiki! Trying to use a local copy...');
        }

        if (grunt.file.exists('tmp/wiki/' + grunt.config.get('wiki_file'))) {
          // confirm the wiki exists, if so generate the docs
          generateDocs();
        } else {
          // failed to get the wiki
          grunt.log.error('Error: The wiki is missing...');
          done(false);
        }
      });
    }


  });

};
