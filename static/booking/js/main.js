function catchBarcodeScan($field, cb) {

    let lastGccSlipNoKeyUpEvent = 0;
    let maxDelayBarcodeDetection = 800;
    let lastTimeout = null;
    var gccSlipHash;

    let startSearch = function (hash) {
        $.ajax({
            url: location.origin + hash,
            type: 'get',
            success: cb,
            error: function (e) {
                console.error(e);
            }
        });
    };

    let isBarcodeUrl = function (value) {
        if (value.indexOf("://") > 0) {
            value = value.split("://")[1];
        }

        if (value.indexOf(location.host) > 0) { // not url-like
            return false;
        }
        let urlParts = value.split(location.host);

        if (urlParts.length !== 2 || urlParts[0] !== '') {
            return false;
        }

        return true;
    };

    $field.on('keydown', function (e) {
        if (e.keyCode == 13) { // enter
            let inpValue = $(this).val();

            if (isBarcodeUrl(inpValue)) {
                return false;
            }
        }
    });

    $field.on('paste keyup', function (e) {
        let inpValue = $(this).val();
        if (!isBarcodeUrl(inpValue)) {
            return;
        }

        let currentEvTime = e.timeStamp;
        gccSlipHash = inpValue.split(location.host)[1];

        if (currentEvTime - lastGccSlipNoKeyUpEvent > maxDelayBarcodeDetection) {
            if (lastTimeout) {
                window.clearTimeout(lastTimeout);
            }
            lastTimeout = window.setTimeout(function () {
                startSearch(gccSlipHash);
            }, maxDelayBarcodeDetection);
        }

        lastGccSlipNoKeyUpEvent = e.timeStamp;
    });
}

function disableSpaces(e) {
    if (e.keyCode === 32) { // space
        e.preventDefault();
    }
}

function ensureNoSpaces(e) {
    let val = $(this).val();
    if (val.indexOf(' ') > -1) {
        $(this).val(val.split(' ').join(''));
    }
}


$(function () {
    let onMasterFieldChange = function (id) {
        let $field = $('#' + id);

        if ($field.is(':checked')) {
            $(".depends-on-" + id).show();
        } else {
            $(".depends-on-" + id).hide();
        }
    };

    $('*[data-depends-on]').each(function () {
        $('#' + $(this).data('depends-on')).change(function () {
            onMasterFieldChange($(this).attr('id'));
        });
        onMasterFieldChange($(this).data('depends-on'));
    });

    $('.js-btn-delete').click(function (e) {
        e.preventDefault();

        let confirmMsd = $(this).data('confirm');
        let delUrl = $(this).data('del-url');
        let csrftoken = Cookies.get('csrftoken');
        let redirect = $(this).data('redirect') || "follow";
        let dataSuccessUrl = $(this).data('delete-success-url');

        if (confirmMsd && !confirm(confirmMsd)) {
            return;
        }
        // using fetch as jquery.post isn't working here
        fetch(delUrl, {
            method: "POST",
            body: JSON.stringify({"action": "delete"}),
            headers: {
                "X-CSRFToken": csrftoken,
                "X-Requested-With": "XMLHttpRequest",
            },
            redirect: redirect
        }).then(res => {
            if (res.redirected) {
                document.location = res.url;
            } else if (res.type === "opaqueredirect") {
                if (dataSuccessUrl) {
                    window.location.href = dataSuccessUrl;
                } else {
                    location.reload();
                }
            }
        });

        return false;
    });

    $(".ui.search .search.link.icon").click(function (e) {
        $(this).closest("form").submit();
    });

    $('.show-certificate-modal').click(function (e) {
        $('.certificate-modal').modal('show');
        $('.cert-loader').show();
        $('.certificate-modal .main-content').html('');

        $.get($(this).data('load-url'), {}, function (res) {
            $('.cert-loader').hide();
            $('.certificate-modal .main-content').html(res);
        }, 'html');

        e.stopPropagation();
        return false;
    });

    $('.autosubmit-form-js').change(function () {
        $(this).submit();
    });

    let preventSemanticEvents = function () {
        let element = $('.gcc-submenu').get(0);//.off();
        element.outerHTML = element.outerHTML;

        mobileMenu();
    }
    $('#menubutton').click(function () {
        if ($(this).hasClass('opened')) {
            $(this).removeClass('opened');
            $('.gcc-submenu-wrapper').removeClass('opened');
            $('body').removeClass('has-opened-menu');
        } else {
            $(this).addClass('opened');
            $('.gcc-submenu-wrapper').addClass('opened');
            $('body').addClass('has-opened-menu');
            preventSemanticEvents();
        }
    });

    $('.scroll-with-shadow .content').scroll(function (e) {
        let $element = $(e.target);
        let $parent = $(this).parent();

        let scrollPercent = $element.scrollLeft() / ($element[0].scrollWidth - $element.width()) * 100;

        if ($element[0].scrollWidth == $element.width()) {
            return;
        }

        if (scrollPercent == 100) {
            $parent.addClass('has-left-shadow');
            $parent.removeClass('has-right-shadow');
        } else if (scrollPercent == 0) {
            $parent.addClass('has-right-shadow');
            $parent.removeClass('has-left-shadow');
        } else {
            $parent.addClass('has-right-shadow');
            $parent.addClass('has-left-shadow');
        }

    }).scroll();
});

function showAcceptLicenceAgreementDialog() {
    $('.accept-la').modal('show');

    $('#accept-la-button').click(function () {
        let acceptLaAgreementUrl = $(this).data('url');
        let laId = $(this).data('id');

        $.post(acceptLaAgreementUrl, {id: laId}, function (data) {
            if (data.success) {
                $('.accept-la').modal('hide');
            }
        }, 'json');
    });
}

function printPdfByUrl(url) {
    let iframe = document.createElement('iframe');
    document.body.appendChild(iframe);

    iframe.style.display = 'none';
    iframe.onload = function () {
        setTimeout(function () {
            iframe.focus();
            iframe.contentWindow.print();
        }, 1);
    };

    iframe.src = url;
}

function certificateDlByUrl(url) {
    window.open(url, '_self')
}

function certificatePrintByUrl(url) {
    printPdfByUrl(url)
}

function isAppleDevice() {
    return (
        (navigator.userAgent.toLowerCase().indexOf("ipad") > -1) ||
        (navigator.userAgent.toLowerCase().indexOf("iphone") > -1) ||
        (navigator.userAgent.toLowerCase().indexOf("ipod") > -1)
    );
}

let mobileMenuActive = false;

function mobileMenu() {
    if (mobileMenuActive) {
        return;
    }

    $('.gcc-submenu .dropdown .menu div.ui.item').click(function (e) {
        if ($(e.target).is('a')) {
            return ;
        }

        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            $(this).removeClass('visible');
            $(this).find('.menu:first').hide();
        } else {
            $(this).addClass('active');
            $(this).addClass('visible');
            $(this).find('.menu:first').show();
        }

        return false;
    });


    $('.gcc-submenu .dropdown').click(function () {
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            $(this).removeClass('visible');

            $(this).find('.menu:first').hide();
        } else {
            $(this).addClass('active');
            $(this).addClass('visible');
            $('.gcc-submenu .active.visible .menu').hide();
            $(this).find('.menu:first').show();
        }

    });

    mobileMenuActive = true;
}