// Here you can add your custom js

//smooth scrolling
$('a').each(function() {
    var that = $(this);
    var viewport = $('html, body');

    that.on('click', function( e ) {
        console.log('carajo');
        var href = that.attr('href');

        if( href.charAt(0) === '#' && $(href).length > 0 ) {
            e.preventDefault();
            if( href === '#' ) {
                viewport.animate({scrollTop: 0}, 1000);
            } else {
                var height = $(href).offset().top;
                viewport.animate({scrollTop: height}, 1000);
            }
        }
    });
});