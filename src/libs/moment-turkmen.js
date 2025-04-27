import moment from 'moment';

moment.updateLocale('tk', {
    months: 'Ýanwar_Fewral_Mart_Aprel_Maý_Iýun_Iýul_Awgust_Sentýabr_Oktýabr_Noýabr_Dekabr'.split('_'),
    monthsShort: 'Ýan_Few_Mar_Apr_Maý_Iýun_Iýul_Awg_Sen_Okt_Noý_Dek'.split('_'),
    weekdays: 'Duşenbe_Sişenbe_Çarşenbe_Penşenbe_Anna_Şenbe_Yekşenbe'.split('_'),
    weekdaysShort: 'Duş_Siş_Çar_Pen_Ann_Şen_Yek'.split('_'),
    weekdaysMin: 'Du_Si_Ça_Pe_An_Şe_Ýe'.split('_'),
    longDateFormat: {
        LT: 'HH:mm',
        LTS: 'HH:mm:ss',
        L: 'DD/MM/YYYY',
        LL: 'D MMMM YYYY',
        LLL: 'D MMMM YYYY HH:mm',
        LLLL: 'dddd, D MMMM YYYY HH:mm'
    },
    calendar: {
        sameDay: '[Şu gün] LT',
        nextDay: '[Ertir] LT',
        nextWeek: 'dddd [sagat] LT',
        lastDay: '[Düýn] LT',
        lastWeek: '[Geçen] dddd [sagat] LT',
        sameElse: 'L'
    },
    relativeTime: {
        future: '%s soň',
        past: '%s öň',
        s: 'birnäçe sekunt',
        m: 'bir minut',
        mm: '%d minut',
        h: 'bir sagat',
        hh: '%d sagat',
        d: 'bir gün',
        dd: '%d gün',
        M: 'bir aý',
        MM: '%d aý',
        y: 'bir ýyl',
        yy: '%d ýyl'
    },
    week: {
        dow: 1, // Monday is the first day of the week.
        doy: 4  // The week that contains Jan 4th is the first week of the year.
    }
});

export default moment;