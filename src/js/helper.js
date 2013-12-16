// Here you can add your custom js

$(function() {

  //smooth scrolling
  $('a').each(function() {
    var that = $(this);
    var viewport = $('html, body');

    that.on('click', function( e ) {
      var href = that.attr('href');

      if( href.charAt(0) === '#' && that.length > 0 ) {
        e.preventDefault();
        if( href === '#' ) {
          viewport.animate({scrollTop: 0}, 1000);
        } else {
          var height = that.offset().top;
          viewport.animate({scrollTop: height}, 1000);
        }
      }
    });
  });

});