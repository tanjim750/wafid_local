$(document).ready(function() {

  const widgetSelector = '.number-input-widget';

  const $decreaseControl = $('.number-input-decrease'),
    $increaseControl = $('.number-input-increase');

  $decreaseControl.on('click', function () {
    const $input = $(this).closest(widgetSelector).find('input');
    if ($input[0].hasAttribute("disabled")) {
      return;
    }
    let newValue = +$input.val() - 1;
    let min = $input.attr("min");
    let max = $input.attr("max");
    newValue = validateInputMinMaxValue(newValue, min, max);
    $input.val(newValue.toFixed(0));
  });

  $increaseControl.on('click', function () {
    const $input = $(this).closest(widgetSelector).find('input');
    if ($input[0].hasAttribute("disabled")) {
      return;
    }
    let newValue = +$input.val() + 1;
    let min = $input.attr("min");
    let max = $input.attr("max");
    newValue = validateInputMinMaxValue(newValue, min, max);
    $input.val(newValue.toFixed(0));
  });

  $(widgetSelector).on("input", "input", function () {
    let min = $(this)[0].hasAttribute("min") ? $(this).attr("min"): null;
    let max = $(this)[0].hasAttribute("max") ? $(this).attr("max"): null;
    let value = $(this).val();
    value = validateInputMinMaxValue(value, min, max);
    $(this).val(value);
  });

  function validateInputMinMaxValue(value, min, max) {
    value = parseInt(value);
    if (isNaN(value)) {
      return
    }
    if (min) {
      min = parseInt(min);
      if (value < min) {
        return min;
      }
    }
    if (max) {
      max = parseInt(max);
      if (value > max) {
        return max;
      }
    }
    return value;
  }
});
