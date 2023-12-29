$(function () {
    // Event bus.
    const EventManager = {
        subscribe: function (event, fn) {
            $(this).on(event, fn);
        },
        unsubscribe: function (event, fn) {
            $(this).off(event, fn);
        },
        publish: function (event, data) {
            $(this).trigger(event, data);
        }
    };

    const EVENTS = {
        COUNTRY_CHANGE: 'country.change',
    };

    // Cache form controls.
    const $countryControl = $('#id_country');
    const $cityControl = $('#id_city');
    let initCityID = $cityControl.val();
    const $resetButton = $('#reset-btn');

    $resetButton.on('click', function (e) {
        window.location.href = $resetButton[0]['baseURI'].split('medical-center/search')[0] + 'medical-center/search/';
    });

    $countryControl.on('change', function (ev) {
        EventManager.publish(EVENTS.COUNTRY_CHANGE, $(this).val());
    });

    EventManager.subscribe(EVENTS.COUNTRY_CHANGE, initCityControl);

    window.EventManager = EventManager;

    /* Handlers */
    const optionTpl = '<option value="__val__">__label__</option>';

    function initCityControl(e, val) {
        if (!('CITIES' in window)) {
            return;
        }

        const $firstOption = $cityControl.find('option').first();
        $firstOption.nextAll().remove();

        // Allowed cities.
        const cities = CITIES[val];

        if (!val || !cities) {
            return
        }

        // Render options.
        let options = '';
        cities.map(function (item) {
            options += optionTpl
                .replace('__val__', item[0])
                .replace('__label__', item[1]);
        });

        $firstOption.after(options);
        if (initCityID) {
            $cityControl.val(initCityID);
            initCityID = null;
        }
    }
    if ('CITIES' in window) {
        EventManager.publish(EVENTS.COUNTRY_CHANGE, $($countryControl).val());
    }
});
