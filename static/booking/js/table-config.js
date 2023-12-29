$(function () {
    const HIDE_CSS_CLASS_NAME = "table2-hidden-column"

    function saveStatus(tblName) {
        let order = [];
        let statuses = {};
        let defaultHiddenColumns = [];
        let $customizeBlock = $('.customizable-table-block[data-table-name="' + tblName + '"]');
        let $table = $customizeBlock.parent().find('table');

        $customizeBlock.find('.c-tbl-checkbox input').each(function () {
            order.push($(this).val());
            statuses[$(this).val()] = $(this).is(":checked");

            if ($table.find('th.tbl-cfg-hidable-' + $(this).val()).hasClass('tbl-cfg-default-hidden')) {
                defaultHiddenColumns.push($(this).val());
            }
        });
        $.ajax('/dashboard/users/settings/tables/', {
            data: JSON.stringify({
                "table": tblName,
                "order": order,
                "statuses": statuses,
                "default_hidden": defaultHiddenColumns,
            }),
            success: function (response) {
            },
            contentType: 'application/json',
            type: 'POST',
        });

    }

    $(document).on('change', '.c-tbl-checkbox input', function (e) {
        let tblName = $(this).parents('.customizable-table-block').data("tableName");
        let colName = $(this).val();
        let onOffStatus = $(this).is(":checked");

        if (onOffStatus) {
            $(".tbl-cfg-hidable-" + colName).removeClass(HIDE_CSS_CLASS_NAME);
        } else {
            $(".tbl-cfg-hidable-" + colName).addClass(HIDE_CSS_CLASS_NAME);
        }

        saveStatus(tblName);
    });

    $('.customizable-table-block .gear').click(function () {
        $('.c-tbl-checkbox').each(function () {
            let $input = $(this).find("input");
            $input.prop('checked', !$(".tbl-cfg-hidable-" + $input.val()).hasClass(HIDE_CSS_CLASS_NAME));
        });

        $('.customizable-table-fields-list').toggleClass('hide');

        return false;
    });

    $(document).click(function (e) {
        if ($(e.target).parents(".customizable-table-fields-list").length === 0) {
            $('.customizable-table-fields-list').addClass('hide');
        }
    });

    var dragSrcEl = null;
    var savedCbState = null;
    var $tblListContaier = null;

    function handleDragStart(e) {
        dragSrcEl = this;


        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.outerHTML);

        $tblListContaier = $(dragSrcEl).parents('.customizable-table-fields-list');

        setTimeout(function () { // chrome bug hack
            dragSrcEl.classList.add('dragElem');

            $tblListContaier = $(dragSrcEl).parents('.customizable-table-fields-list');
            $tblListContaier.addClass('dragging');
            savedCbState = $(dragSrcEl).find('input').is(":checked");
        }, 10);
    }

    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        this.classList.add('over');
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDragEnter(e) {

    }

    function handleDragLeave(e) {
        this.classList.remove('over');
    }

    function handleDrop(e) {

        if (e.stopPropagation) {
            e.stopPropagation();
        }

        if (dragSrcEl != this) {
            let dragStartIndex = $(dragSrcEl).index();

            this.parentNode.removeChild(dragSrcEl);
            var dropHTML = e.dataTransfer.getData('text/html');
            this.insertAdjacentHTML('beforebegin', dropHTML);
            var dropElem = this.previousSibling;
            $(dropElem).find('input').prop('checked', savedCbState);
            addDnDHandlers(dropElem);

            let tblName = $(dropElem).parents('.customizable-table-block').data("tableName");
            saveStatus(tblName);
            reorderUi(tblName, dragStartIndex, $(dropElem).index());
        }
        this.classList.remove('over');
        return false;
    }

    function handleDragEnd(e) {
        this.classList.remove('over');
        this.classList.remove('dragElem');

        $tblListContaier.removeClass('dragging');

        if (e.stopPropagation) {
            e.stopPropagation();
        }
    }

    function reorderUi(tblName, startIndex, endIndex) {
        let order = [];

        $('.customizable-table-block[data-table-name="' + tblName + '"] .c-tbl-checkbox input').each(function () {
            order.push($(this).val());
        });

        if (startIndex < endIndex) {
            endIndex++;
        }

        $('.customizable-table-block[data-table-name="' + tblName + '"]')
            .parents('.table-container')
            .find('table')
            .find('tr,th')
            .each(function () {
                let tr = $(this), td1, td2;
                td1 = tr.find('.tbl-cfg-orderable:eq(' + startIndex + ')');
                td2 = tr.find('.tbl-cfg-orderable:eq(' + endIndex + ')');

                if (td2.length) {
                    td1.detach().insertBefore(td2);
                } else {
                    td2 = tr.find('.tbl-cfg-orderable:last');
                    td1.detach().insertAfter(td2);
                }
            });

    }

    function addDnDHandlers(elem) {
        elem.addEventListener('dragstart', handleDragStart, false);
        elem.addEventListener('dragenter', handleDragEnter, false)
        elem.addEventListener('dragover', handleDragOver, false);
        elem.addEventListener('dragleave', handleDragLeave, false);
        elem.addEventListener('drop', handleDrop, false);
        elem.addEventListener('dragend', handleDragEnd, false);
    }

    [].forEach.call(document.querySelectorAll('li.c-tbl-checkbox'), addDnDHandlers);

});
