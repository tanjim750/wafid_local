$(function () {

    if ($("select[name='visa_type']").find('option:selected').attr('value') == 'fv') {
        $("select[name='applied_position']").prev("label").find(".optional").show();
    } else {
        $("select[name='applied_position']").prev("label").find(".optional").hide();
    }
    $("select[name='visa_type']").on('change', function(event){
        if ($(this).children("option:selected").attr('value') == "fv"){
            $("select[name='applied_position']").prev("label").find(".optional").show()
        }
        else{
            $("select[name='applied_position']").prev("label").find(".optional").hide()
        }
    });


    const optionTpl = '<option value="__val__">__label__</option>';

    const mcUnavailableInCity = '<div class="field-error-message mc-unavailable-error-js">' +
        '<i class="times circle icon"></i>' +
        gettext("No medical centers available in your city, " +
                "please select a different city or check again later")	+
    '</div>';
    const mcUnavailableInCountry = '<div class="field-error-message mc-unavailable-error-js">' +
        '<i class="times circle icon"></i>' +
        gettext("No medical center available for booking an " +
                "appointment right now, please check again later")	+
    '</div>';
    const successIcon = '<span class="success-icon">' +
        '<i class="check circle icon"></i> ' + gettext('Success') + '</span>';
    const infoIcon = '<span class="info-icon">' +
        '<i class="info circle icon"></i> ' +
        gettext('Medical center has been assigned automatically') + '</span>';

    // Cache form controls.
    const $countryControl = $('#id_country');
    const $cityControl = $('#id_city');
    const $countryTravellingToControl = $('#id_traveled_country');
    const $nationalityControl = $('#id_nationality');
    const $passportControl = $('#id_passport');
    const $confirmPassportControl = $('#id_confirm_passport');
    const $medicalCenterControl = $('#id_medical_center');
    const $medicalCenterField = $('.medical-center-field-js');
    const $medicalCenterLabel = $medicalCenterField.find('label');
    const $dobControl = $('#id_dob');
    const $visaTypeControl = $('#id_visa_type');
    const $nationalIdControl = $('#id_national_id');


    // Listen to DOM events.
    $countryControl.on('change', function () {
        removeErrors($countryControl);
        initCityControl();
        setDefaultNationality();
        initMedicalCenterControl();
    });

    $cityControl.on('change', function () {
        removeErrors($cityControl);
        removeErrors($medicalCenterControl);
        toggleMedicalCenterField();
        toggleMCControl();
        initMedicalCenterControl();
        toggleUnavailableInCityError();
        toggleUnavailableInCountryError();
        toggleMCAssignedMsg();
    });

    $countryTravellingToControl.on('change', function () {
        removeErrors($countryTravellingToControl);
        removeErrors($medicalCenterControl);
        toggleMedicalCenterField();
        toggleMCControl();
        initMedicalCenterControl();
        toggleUnavailableInCityError();
        toggleUnavailableInCountryError();
        toggleMCAssignedMsg();
    });

    $nationalityControl.on('change', function () {
        removeErrors($nationalityControl);
    });

    $medicalCenterControl.on('change', function () {
        removeErrors($medicalCenterControl);
    });

    // Forbid copy/paste for Confirm Passport No. field.
    $confirmPassportControl.on('paste', function (e) {
        e.preventDefault();
    });

    $passportControl.on('keydown', disableSpaces);
    $confirmPassportControl.on('keydown', disableSpaces);
    $passportControl.on('change paste', ensureNoSpaces);
    $confirmPassportControl.on('change paste', ensureNoSpaces);

    $dobControl.on('change', buildVisaTypeChoices);
    //handle issue with change event for callendar widget
    $("body").on('mousedown', buildVisaTypeChoices);

    toggleMedicalCenterField();
    toggleMCControl();
    toggleMCAssignedMsg();

    /* Handlers */
    function initCityControl() {
        const val = $countryControl.val();
        const $firstOption = $cityControl.find('option').first();
        $firstOption.nextAll().remove();

        if (!val) {
            return
        }

        // Allowed cities.
        const cities = CITIES[val];

        if (!cities) {
            return
        }

        // Render options.
        let options = buildOptions(cities);
        $firstOption.after(options);
        $cityControl.change();
    }

    function setDefaultNationality() {
        const val = $countryControl.val();
        let defaultVal = '';
        if (val) {
            // Default nationality.
            defaultVal = NATIONALITIES[val] ? NATIONALITIES[val][0] : '';
        }

        $nationalityControl.val(defaultVal);
        $nationalityControl.change();
    }

    function initMedicalCenterControl() {
        const $firstOption = $medicalCenterControl.find('option').first();

        $firstOption.nextAll().remove();

        // Render options.
        const mc = getCityMedicalCenters();
        let options = buildOptions(mc);
        $firstOption.after(options);
        if (mc && mc.length) {
            $medicalCenterControl.val(mc[0]);
            $medicalCenterControl.change();
        }
    }

    function toggleMedicalCenterField() {
        if ($cityControl.val() && $countryTravellingToControl.val()) {
            showMedicalCenterField();
        } else {
            hideMedicalCenterField();
        }
    }

    function toggleUnavailableInCountryError() {
        const countryMC = getCountryMedicalCenters();

        if (!countryMC || !countryMC.length) {
            showMCUnavailableError(mcUnavailableInCountry);
        }
    }

    function toggleUnavailableInCityError() {
        const countryMC = getCountryMedicalCenters();
        const cityMC = getCityMedicalCenters();

        if ((!cityMC || !cityMC.length) && countryMC && countryMC.length) {
            showMCUnavailableError(mcUnavailableInCity);
        }
    }

    function toggleMCAssignedMsg() {
        const mc = getCityMedicalCenters();
        if (!countryHasManualMC($countryControl.val()) && mc && mc.length) {
            showAutomaticallyAssignedMsg();
        } else {
            hideAutomaticallyAssignedMsg();
        }
    }

    function toggleMCControl() {
        if (countryHasManualMC($countryControl.val())) {
            $medicalCenterControl.show();
            $medicalCenterLabel.css('opacity', 1);
        } else {
            $medicalCenterControl.hide();
            $medicalCenterLabel.css('opacity', 0);
        }
    }

    function removeErrors($control) {
        let $field = $control.closest('.field');
        $field.removeClass('error');
        $field.find('.field-error-message').remove();
        $field.nextAll().filter($('.field-error-message')).remove();
    }

    /* Success icons */

    $countryControl.on('change', function () {
        toggleSuccessIcon($countryControl);
    });
    toggleSuccessIcon($countryControl);

    $cityControl.on('change', function () {
        toggleSuccessIcon($cityControl);
    });
    toggleSuccessIcon($cityControl);

    $countryTravellingToControl.on('change', function () {
        toggleSuccessIcon($countryTravellingToControl);
    });
    toggleSuccessIcon($countryTravellingToControl);
    if ($("#id_traveled_country").next().is(".field-error-message")) {
        hideSuccessIcon($countryTravellingToControl);
    }

    $nationalityControl.on('change', function () {
        toggleSuccessIcon($nationalityControl);
    });
    toggleSuccessIcon($nationalityControl);

    function toggleSuccessIcon($control) {
        if ($control.val()) {
            showSuccessIcon($control);
        } else {
            hideSuccessIcon($control);
        }
    }


    $countryTravellingToControl.on('change', function () {
        nationalIdOptionalLabelCheck();
    });
    $countryControl.on('change', function () {
        nationalIdOptionalLabelCheck();
    });
    $("select[name='nationality']").on('change', function () {
        nationalIdOptionalLabelCheck();
    });
    function nationalIdOptionalLabelCheck() {
        let cFrom = $countryControl.val();
        let cTo = $countryTravellingToControl.val();
        let checkArray = APPOINTMENT_NATIONAL_ID_REQUIRED_MAP[cTo];

        let $nationalId = $("input[name='national_id']");
        let $nationality = $("select[name='nationality']");

        if (checkArray && checkArray.indexOf(cFrom) > -1) {
            $nationalIdControl.closest('.field').find('.optional').hide();
        } else {
            if ($nationality.children("option:selected").attr('data-required') == "True"){
                $nationalId.prev("label").find(".optional").hide()
            } else {
                $nationalId.prev("label").find(".optional").show()
            }
        }
    }
    nationalIdOptionalLabelCheck();

    /* Helpers */

    function showMedicalCenterField() {
        $medicalCenterField.show();
        const countryVal = $countryControl.val();
        if (countryHasManualMC(countryVal)) {
            $medicalCenterField.removeClass("disabled");
        } else {
            $medicalCenterField.addClass("disabled");
        }
    }

    function hideMedicalCenterField() {
        $medicalCenterField.hide();
    }

    function showMCUnavailableError(error) {
        const $mcError = $('.mc-unavailable-error-js');

        if (!$mcError.length) {
            $medicalCenterField.append($(error));
        } else {
            $mcError.show();
        }
    }

    function showAutomaticallyAssignedMsg() {
        if (!$medicalCenterField.find('.info-icon').length) {
            $medicalCenterField.append($(infoIcon));
        } else {
            $medicalCenterField.find('.info-icon').show();
        }
    }

    function hideAutomaticallyAssignedMsg() {
        $medicalCenterField.find('.info-icon').hide();
    }

    function showSuccessIcon($control) {
        const $field = $control.closest('.field');

        if (!$field.find('.success-icon').length) {
            $field.append($(successIcon));
        } else {
            $field.find('.success-icon').show();
        }
    }

    function hideSuccessIcon($control) {
        const $field = $control.closest('.field');
        $field.find('.success-icon').hide();
    }

    /* Utils */

    function getCityMedicalCenters() {
        const cityVal = $cityControl.val();
        const countryTravellingToVal = $countryTravellingToControl.val();

        let mc = CITY_MEDICAL_CENTERS[cityVal];

        if (mc) {
            mc = mc.filter(function(mc_info) {
                return mc_info[3] == countryTravellingToVal
            });
        }
        return mc;
    }

    function getCountryMedicalCenters() {
        const countryVal = $countryControl.val();
        const countryTravellingToVal = $countryTravellingToControl.val();

        let mc = COUNTRY_MEDICAL_CENTER[countryVal];

        if (mc) {
            mc = mc.filter(function(mc_info) {
                return mc_info[3] == countryTravellingToVal
            });
        }
        return mc;
    }

    function countryHasManualMC(country) {
        return MANUAL_MEDICAL_CENTER_COUNTRIES.indexOf(country) !== -1
    }

    function buildOptions(items) {
        let options = '';

        if (!items) {
            return options;
        }

        items.map(function (item) {
            options += optionTpl
                .replace('__val__', item[0])
                .replace('__label__', item[1]);
        });
        return options;
    }

    var old_dob_val = "";
    function buildVisaTypeChoices() {
        const val = $dobControl.val();
        if (old_dob_val === val) {
            return
        }
        old_dob_val = $dobControl.val();
        const check_date = moment().add(-18, 'years');
        const old_selected = $visaTypeControl.val();
        if ((val !== "") && (moment(val, "DD-MM-YYYY") > check_date)) {
            $visaTypeControl.html('<option value="">Select Visa Type</option><option value="fv">Family Visa</option>')
        } else {
            $visaTypeControl.html('<option value="">Select Visa Type</option><option value="wv">Work Visa</option><option value="fv">Family Visa</option>')
        }
        if ( $("#id_visa_type option[value='" + old_selected + "']").val() !== undefined) {
            $visaTypeControl.val(old_selected).change();
        }
    }
    buildVisaTypeChoices();

});
