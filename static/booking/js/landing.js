$(function () {
    $(".map-url-turkey").on("click", function (e) {
        e.preventDefault();
        $('.ui.modal.turkey-modal').modal('show');
    });

    $(".map-url-jordan").on("click", function (e) {
        e.preventDefault();
        $('.ui.modal.jordan-modal').modal('show');
    });

    $(".map-url-kenya").on("click", function (e) {
        e.preventDefault();
        $('.ui.modal.kenya-modal').modal('show');
    });

    $('.video-content').click(function () {
        $(".header__logo").text();

        $(".video-modal .header__text").text($(this).data('video-name'));
        $(".video-modal .video-content").html('<iframe src="https://www.youtube.com/embed/' + $(this).data('video-id') +
            '?loop=1&modestbranding=1" width="100%" style="min-height: 400px; width:100%; height:50vh;"' +
            'frameborder="0" allowfullscreen=""></iframe>');

        $('.video-modal').modal('show');
    });
    $('.video-modal').modal({
        onHide: function () {
            $(".video-modal .video-content").html('');
        },
    });

    $(".country-slide").on("click", function (e) {
        e.preventDefault();
        const id = $(this).data("modal-id");
        $("#" + id).modal('show');
    });


    var glide = new Glide('.videos-wrapper', {
        autoplay: 4000,
        type: 'carousel',
        startAt: 0,
        perView: 5,
        slidesToShow: 5
      }).mount();

    var glideCountries = new Glide('.countries-wrapper', {
        slidesToShow: 1,
      }).mount();
});


