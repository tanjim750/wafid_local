var SELECT_ALL_LIMIT = 100;
$(function () {
    $('.multiple-dropdown.dropdown').dropdown({placeholder: 'Select...'});

    let adapterDefined = false;
    let defineAdapter = function () {
        if (adapterDefined) {
            return;
        }
        adapterDefined = true;

        $.fn.select2.amd.define('select2/selectAllAdapter', [
            'select2/utils',
            'select2/dropdown',
            'select2/dropdown/attachContainer',
        ], function (Utils, DropdownAdapter, AttachContainer) {

            function SelectAll() {
            }

            SelectAll.prototype.render = function (decorated) {
                var self = this,
                    $rendered = decorated.call(this),
                    $selectAll = $(
                        '<button class="mini ui button select-all-btn" type="button"><i class="icon check square"></i> Select All</button>'
                    ),
                    $btnContainer = $('<div style="margin-top:3px;">').append($selectAll);

                if (!this.$element.prop("multiple")) {
                    return $rendered;
                }

                $btnContainer.insertBefore($rendered.find('.select2-results'));

                $selectAll.on('click', function (e) {
                    var $results = $rendered.find('.select2-results__option[aria-selected=false]');
                    $results.each(function () {
                        $(this).mousedown();
                        $(this).mouseup();
                    });

                    self.$element.select2("close");

                });

                return $rendered;
            };

            return Utils.Decorate(
                    Utils.Decorate(
                        DropdownAdapter,
                        AttachContainer
                ), SelectAll
            );
        });
    }

    $('select[multiple][data-select-all-option=true]').each(function () {
        defineAdapter();
        let options = $(this).data().select2.options.options;
        options["dropdownAdapter"] = $.fn.select2.amd.require('select2/selectAllAdapter');
        $(this).select2(options);
    });

});
