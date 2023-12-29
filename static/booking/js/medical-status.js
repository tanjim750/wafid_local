$(function () {
  const $passportRadio = $('#id_search_variant_0'),
        $gccSlipNumberRadio = $('#id_search_variant_1'),
        $passportFields = $('#id_passport').closest('div.fields'),
        $gccSlipNoFields = $('#id_gcc_slip_no').closest('div.fields');

  function passportRadioChecked() {
    $passportFields.show();
    $gccSlipNoFields.hide();
  }

  function $gccSlipNumberRadioChecked() {
    $passportFields.hide();
    $gccSlipNoFields.show();
  }

  $passportRadio.on('change', function() {
    if ($(this).is(':checked')) {
      passportRadioChecked();
    }
  });
  $gccSlipNumberRadio.on('change', function() {
    if ($(this).is(':checked')) {
      $gccSlipNumberRadioChecked();
    }
  });

  $passportRadio.change();
  $gccSlipNumberRadio.change();

  catchBarcodeScan($('#id_gcc_slip_no'), function (result) {
    $('#id_gcc_slip_no').val(result.slip_number);
    $('#med-status-form-submit').click();
  });
});
