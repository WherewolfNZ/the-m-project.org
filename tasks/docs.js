/*
 * grunt docs
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 grunt contributors
 * Licensed under the MIT license.
 */

module.exports = function( grunt ) {
    'use strict';

    var fs = require('fs'), exec = require('child_process').exec, jade = require('jade'), highlighter = require('highlight.js'), docs = require('./lib/docs').init(grunt);

    /**
     * Custom task to generate grunt documentation
     */
    grunt.registerTask('docs', 'Compile Documentation to HTML', function() {
        var done = this.async();

        /**
         * generate the docs based on the github wiki
         */
        function generateDocs() {
            /**
             *
             * Helper Functions
             *
             */

            var base = 'content/docs/';

            /**
             * Generate grunt guides documentation
             */
            function generateGuides() {
                grunt.log.ok('Generating Guides...');

                // API Docs
                var sidebars = [];
                var names = grunt.file.expand({cwd: base, filter: 'isFile'}, ['*']);

                sidebars[0] = getSidebarSection('## Guides');
                sidebars[1] = getSidebarSection('### Tools');
                sidebars[2] = getSidebarSection('### API');

                names.forEach(function( name ) {

                    var title = name.replace(/-/g, ' ').replace('.md', ''),
                        segment = name.replace(/ /g, '-').replace('.md', '').toLowerCase(),
                        src = base + name,
                        filename = name.replace('.md', '').toLowerCase(),
                        dest = 'build/docs/' + filename + ((filename === 'index') ? '' : '/index') + '.html';

                    grunt.file.copy(src, dest, {
                        process: function( src ) {

                            var regexMDImage = new RegExp(/(!\[.*?\]\()generator-m\/(.+?)(\))/g);
                            src = src.replace(regexMDImage, '$1$2$3');
                            try {
                                var file = 'src/tmpl/docs.jade', templateData = {
                                        page: 'docs',
                                        rootSidebar: true,
                                        pageSegment: 'docs/' + segment,
                                        title: title,
                                        content: docs.anchorFilter(marked(docs.wikiAnchors(src))),
                                        sidebars: sidebars
                                    };
                                return jade.compile(grunt.file.read(file), {filename: file})(templateData);
                            } catch( e ) {
                                grunt.log.error(e);
                                grunt.fail.warn('Jade failed to compile.');
                            }
                        }
                    });
                });
                grunt.log.ok('Created ' + names.length + ' files.');
            }

            /**
             * Get sidebar list for section from _submenu.md
             */
            function getSidebarSection( section, iconClass ) {
                var rMode = false, l, items = [];

                // read the _submenu.md of the wiki, extract the section links
                var lines = fs.readFileSync(base + '_submenu.md').toString().split(/\r?\n/);
                for( l in lines ) {
                    var line = lines[l];

                    // choose a section of the file
                    if( line === section ) {
                        rMode = true;
                    }
                    // end of section
                    else if( line.substring(0, 2) === '##' ) {
                        rMode = false;
                    }

                    if( rMode && line.length > 0 ) {
                        var item = line.replace(/#/g, '').replace(']]', '').replace('* [[', ''), url = 'docs/' + item;

                        if( item[0] === ' ' ) {
                            // TODO: clean this up...
                            if( iconClass ) {
                                items.push({name: item.substring(1, item.length), icon: iconClass});
                            } else {
                                items.push({name: item.substring(1, item.length)});
                            }
                        } else {
                            items.push({name: item, url: url.replace(/ /g, '-').toLowerCase()});
                        }
                    }
                }
                return items;
            }

            // marked markdown parser
            var marked = require('marked');
            // Set default marked options
            marked.setOptions({
                gfm: true,
                anchors: true,
                base: '/',
                pedantic: false,
                sanitize: true,
                // callback for code highlighter
                highlight: function( code ) {
                    return highlighter.highlight('javascript', code).value;
                }
            });

            // grunt guides - wiki articles that are not part of the grunt api
            generateGuides();

            done(true);
        }

        // clean the wiki directory, clone a fresh copy
        var wiki_url;
        // If the config option local is set to true, get the docs from
        // the local grunt-docs repo.
        if( grunt.config.get('local') === true ) {
            generateDocs('local');
        } else {
            wiki_url = grunt.config.get('wiki_url');

            exec('git clone ' + wiki_url + ' tmp/wiki', function( error ) {
                if( error ) {
                    grunt.log.warn('Warning: Could not clone the wiki! Trying to use a local copy...');
                }

                if( grunt.file.exists('tmp/wiki/' + grunt.config.get('wiki_file')) ) {
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