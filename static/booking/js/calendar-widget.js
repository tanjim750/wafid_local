$(function () {
    $('.calendar-js').each(function () {
        $(this).calendar({
            type: 'date',
            formatter: {
                date: function (date, settings) {
                    if (!date) return '';

                    var day = date.getDate();
                    var month = date.getMonth() + 1;
                    var year = date.getFullYear();
                    return day + '/' + month + '/' + year;
                }
            },
            parser: {
                date: function (text, settings) {
                    if (!text) {
                        return null;
                    }
                    text = ('' + text).trim().toLowerCase();
                    if (text.length === 0) {
                        return null;
                    }

                    var i, j, k;
                    var minute = -1, hour = -1, day = -1, month = -1, year = -1;
                    var isAm = undefined;

                    var isTimeOnly = settings.type === 'time';
                    var isDateOnly = settings.type.indexOf('time') < 0;

                    var words = text.split(settings.regExp.dateWords);
                    var numbers = text.split(settings.regExp.dateNumbers);

                    if (!isDateOnly) {
                        //am/pm
                        isAm = $.inArray(settings.text.am.toLowerCase(), words) >= 0 ? true :
                            $.inArray(settings.text.pm.toLowerCase(), words) >= 0 ? false : undefined;

                        //time with ':'
                        for (i = 0; i < numbers.length; i++) {
                            var number = numbers[i];
                            if (number.indexOf(':') >= 0) {
                                if (hour < 0 || minute < 0) {
                                    var parts = number.split(':');
                                    for (k = 0; k < Math.min(2, parts.length); k++) {
                                        j = parseInt(parts[k]);
                                        if (isNaN(j)) {
                                            j = 0;
                                        }
                                        if (k === 0) {
                                            hour = j % 24;
                                        } else {
                                            minute = j % 60;
                                        }
                                    }
                                }
                                numbers.splice(i, 1);
                            }
                        }
                    }

                    if (!isTimeOnly) {
                        //textual month
                        for (i = 0; i < words.length; i++) {
                            var word = words[i];
                            if (word.length <= 0) {
                                continue;
                            }
                            word = word.substring(0, Math.min(word.length, 3));
                            for (j = 0; j < settings.text.months.length; j++) {
                                var monthString = settings.text.months[j];
                                monthString = monthString.substring(0, Math.min(word.length, Math.min(monthString.length, 3))).toLowerCase();
                                if (monthString === word) {
                                    month = j + 1;
                                    break;
                                }
                            }
                            if (month >= 0) {
                                break;
                            }
                        }


                        //day
                        for (i = 0; i < numbers.length; i++) {
                            j = parseInt(numbers[i]);
                            if (isNaN(j)) {
                                continue;
                            }
                            if (1 <= j && j <= 31) {
                                day = j;
                                numbers.splice(i, 1);
                                break;
                            }
                        }

                        //numeric month
                        if (month < 0) {
                            for (i = 0; i < numbers.length; i++) {
                                k = i > 1 || settings.monthFirst ? i : i === 1 ? 0 : 1;
                                j = parseInt(numbers[k]);
                                if (isNaN(j)) {
                                    continue;
                                }
                                if (1 <= j && j <= 12) {
                                    month = j;
                                    numbers.splice(k, 1);
                                    break;
                                }
                            }
                        }

                        //year > 59
                        for (i = 0; i < numbers.length; i++) {
                            j = parseInt(numbers[i]);
                            if (isNaN(j)) {
                                continue;
                            }
                            if (j > 59) {
                                year = j;
                                numbers.splice(i, 1);
                                break;
                            }
                        }

                        //year <= 59
                        if (year < 0) {
                            for (i = numbers.length - 1; i >= 0; i--) {
                                j = parseInt(numbers[i]);
                                if (isNaN(j)) {
                                    continue;
                                }
                                if (j < 99) {
                                    j += 2000;
                                }
                                year = j;
                                numbers.splice(i, 1);
                                break;
                            }
                        }
                    }

                    if (!isDateOnly) {
                        //hour
                        if (hour < 0) {
                            for (i = 0; i < numbers.length; i++) {
                                j = parseInt(numbers[i]);
                                if (isNaN(j)) {
                                    continue;
                                }
                                if (0 <= j && j <= 23) {
                                    hour = j;
                                    numbers.splice(i, 1);
                                    break;
                                }
                            }
                        }

                        //minute
                        if (minute < 0) {
                            for (i = 0; i < numbers.length; i++) {
                                j = parseInt(numbers[i]);
                                if (isNaN(j)) {
                                    continue;
                                }
                                if (0 <= j && j <= 59) {
                                    minute = j;
                                    numbers.splice(i, 1);
                                    break;
                                }
                            }
                        }
                    }

                    if (minute < 0 && hour < 0 && day < 0 && month < 0 && year < 0) {
                        return null;
                    }

                    if (minute < 0) {
                        minute = 0;
                    }
                    if (hour < 0) {
                        hour = 0;
                    }
                    if (day < 0) {
                        day = 1;
                    }
                    if (month < 0) {
                        month = 1;
                    }
                    if (year < 0) {
                        year = new Date().getFullYear();
                    }

                    if (isAm !== undefined) {
                        if (isAm) {
                            if (hour === 12) {
                                hour = 0;
                            }
                        } else if (hour < 12) {
                            hour += 12;
                        }
                    }

                    var date = new Date(year, month - 1, day, hour, minute);
                    if (date.getMonth() !== month - 1 || date.getFullYear() !== year) {
                        //month or year don't match up, switch to last day of the month
                        date = new Date(year, month, 0, hour, minute);
                    }
                    return isNaN(date.getTime()) ? null : date;
                }
            }
        });
    })
});
