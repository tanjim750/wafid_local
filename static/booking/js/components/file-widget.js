$(document).ready(function () {
    let fileWidgetSelector = '.file-widget';

    let $previewImageModal = $('#preview-image-modal'),
        $previewImage = $('#preview-image');

    $(document).on('click', '.upload-btn', function () {
        $(this).closest(fileWidgetSelector).find('[type="file"]').click();
        return false;
    });

    $(document).on('click', '.clear_attachment', function () {
        $(this).closest(fileWidgetSelector).find('input').val('');
    });

    $(document).on('click', '.preview-btn', function () {
        let imageUrl = $(this).attr('href');
        $previewImage.attr('src', imageUrl);
        $previewImageModal.modal('show');
        return false;
    });

    $(document).on('change','[type="file"]', function () {
        $(this).closest(fileWidgetSelector).find('input[type="text"]').val($(this)[0].files[0].name);
    });

    $('[type="file"]').each(function () {
        if ($(this)[0].files.length) {
            $(this).closest(fileWidgetSelector).find('input[type="text"]').val($(this)[0].files[0].name);
        }
    });

});
