(function () {
    ("use strict");
    const select = (el, all = false) => {
        el = el.trim();
        if (all) {
            return [...document.querySelectorAll(el)];
        } else {
            return document.querySelector(el);
        }
    };

    const on = (type, el, listener, all = false) => {
        let selectEl = select(el, all);
        if (selectEl) {
            if (all) {
                selectEl.forEach((e) => e.addEventListener(type, listener));
            } else {
                selectEl.addEventListener(type, listener);
            }
        }
    };

    const timer = (from, where, text) => {
        // Set the date we're counting down to
        var countDownDate = new Date(from).getTime();
        // Update the count down every 1 second
        var x = setInterval(function () {
            // Get today's date and time
            var now = new Date().getTime();

            // Find the distance between now and the count down date
            var distance = countDownDate - now;

            // Time calculations for days, hours, minutes and seconds
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor(
                (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            var minutes = Math.floor(
                (distance % (1000 * 60 * 60)) / (1000 * 60)
            );
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById(where).innerHTML =
                days +
                "nap " +
                hours +
                "óra " +
                minutes +
                "perc " +
                seconds +
                "mp ";

            if (distance < 0) {
                clearInterval(x);
                document.getElementById(where).innerHTML = text;
            }
        }, 1000);
    };

    window.addEventListener("DOMContentLoaded", function () {
        timer("Dec 24, 2022 18:00:00", "counter", "Már karcsony van!");
    });
})();
