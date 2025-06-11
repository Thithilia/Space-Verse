"use strict";

jQuery(document).ready(function($) {
    $('h3.accordion-title').click(function() {
        if ($(this).attr('aria-expanded') == 'false') {
            $(this).addClass('open').attr('aria-expanded', 'true');
            $(this).next('.accordion-content').slideDown();
        } else {
            $(this).removeClass('open');
            $(this).attr('aria-expanded', 'false');
            $(this).next('.accordion-content').slideUp();
        }
    });
});
"use strict";

jQuery(document).ready(function($) {
    // Keep dropdown menu open when clicking inside of it.
    $('.dropdown-menu').on('click', function(e) {
        e.stopPropagation();
    });
});
"use strict";

jQuery(document).ready(function($) {
    var options = {
        valueNames: ['name', 'title']
    };
    var directory = new List('directory-list', options);
});
"use strict";

jQuery(document).ready(function($) {
    // Remove filter when pill is clicked.
    $('.exposed-filter-pill').on('click', function(e) {
        e.preventDefault();
        $('input[value="' + $(this).attr('data-filter') + '"]').click();
        $(this).parents('.query-wrangler').find('input[value="Filter"]').click();
    }); // Clear filter form.

    $('input[value="Clear"]').click(function(e) {
        e.preventDefault();
        window.location = window.location.href.split("?")[0];
    });
    $('.query-checkbox').each(function() {
        var checkbox = $(this).children();
        var newID = checkbox.attr('value');
        $(this).children().attr('id', 'checkbox_' + newID);
        $(this).attr('for', 'checkbox_' + newID);
        checkbox.parent().before(checkbox);
    });
    $('h2.query-exposed__heading').click(function(e) {
        e.preventDefault();
        $(this).toggleClass('open');
        $(this).next('form').toggle();
        $('.query-pills').toggle();
    });
});
"use strict";

jQuery(document).ready(function($) {
    $('.frm_checkbox label').each(function() {
        var checkbox = $(this).children();
        checkbox.parent().before(checkbox);
    });
    $('.frm_radio label').each(function() {
        var radio = $(this).children();
        radio.parent().before(radio);
    });
    $('.frm_forms select').wrap("<div class='select-wrapper'></div>");
    $('.frm_forms textarea').wrap("<div class='input-wrapper'></div>");
    $('.frm_forms input[type="text"]').wrap("<div class='input-wrapper'></div>");
    $('.frm_forms input[type="password"]').wrap("<div class='input-wrapper'></div>");
    $('.frm_forms input[type="number"]').wrap("<div class='input-wrapper'></div>");
    $('.frm_forms input[type="url"]').wrap("<div class='input-wrapper'></div>");
    $('.frm_forms input[type="tel"]').wrap("<div class='input-wrapper'></div>");
    $('.frm_forms input[type="search"]').wrap("<div class='input-wrapper'></div>");
    $('.frm_forms input[type="email"]').wrap("<div class='input-wrapper'></div>");
});
"use strict";

jQuery(document).ready(function($) {
    $('.breadcrumb_last').prev().prev().addClass('show-on-mobile');
});
"use strict";

jQuery(document).ready(function($) {
    var waypoint = new Waypoint({
        element: document.getElementById('sticky-main-nav'),
        handler: function handler(direction) {
            if (direction == 'down') {
                $('#sticky-main-nav').addClass('fixed-top');
            } else if (direction == 'up') {
                $('#sticky-main-nav').removeClass('fixed-top');
            }
        }
    });
    $('#main-nav').on('keyup', function(e) {
        if (e.keyCode === 27) {
            $('li.has-submenu').children('button').attr('aria-expanded', "false");
            $('li.has-submenu').removeClass('open');
        }
    });
    $('#main-nav li.has-submenu button').click(function(e) {
        e.preventDefault();

        if ($(this).parent().hasClass('open')) {
            $(this).attr('aria-expanded', "false");
            $(this).parent().removeClass('open');
        } else {
            $(this).attr('aria-expanded', "true");
            $(this).parent().addClass('open');
        }
    });
    $('#main-nav li.has-submenu').on('mouseleave', function() {
        $(this).children('button').attr('aria-expanded', "false");
        $(this).removeClass('open');
    });
    $('#main-nav li.has-submenu').on('mouseenter', function() {
        $(this).children('button').attr('aria-expanded', "true");
        $(this).addClass('open');
    });
    $('#main-nav li.has-submenu .mega-menu > .container > .row > .col:last-child > *:last-child > *:last-child > *:last-child > a, #main-nav li.has-submenu .mega-menu > .container > .row > .col:last-child > *:last-child > *:last-child > a, #main-nav li.has-submenu .mega-menu > .container > .row > .col:last-child > *:last-child > a').on('keydown', function(e) {
        // detect if we are tabbing
        if (e.which === 9) {
            //detect if the shift key is down
            if (e.shiftKey === true) {
                return true;
            } else {
                $(this).parents('.has-submenu').removeClass('open');
                $(this).parents('.has-submenu').children('button').attr('aria-expanded', "false");
            }
        }
    });
});
"use strict";

jQuery(document).ready(function($) {
    $('.mobile-menu-wrapper a.caret').click(function(e) {
        e.preventDefault();

        if ($(this).attr('aria-expanded') == 'false') {
            $(this).attr('aria-expanded', 'true').next().show();
        } else {
            $(this).attr('aria-expanded', 'false').next().hide();
        }
    });
    $('#navbar-toggler').click(function(e) {
        if ($(this).attr('aria-expanded') == 'true') {
            $('#mobile-navigation').removeClass('show');
            $(this).attr('aria-expanded', false);
            $('html').removeClass('noscroll');
            $('body').removeClass('noscroll');
        } else {
            $('#mobile-navigation').addClass('show');
            $(this).attr('aria-expanded', true);
            $('html').addClass('noscroll');
            $('body').addClass('noscroll');
        }
    });
});
"use strict";

jQuery(document).ready(function($) {
    function bgSwap() {
        // define panel and media queries
        var panel = $('[data-imgbg]'),
            hiDPI = 'screen and (min-resolution: 2dppx), screen and (-webkit-min-device-pixel-ratio: 2), screen and (min--moz-device-pixel-ratio: 2), screen and (min-resolution: 250dpi)',
            mobile = '(max-width: 539px)',
            mobileHiDPI = 'screen and ' + mobile + ' and (min-resolution: 2dppx), screen and ' + mobile + ' and (-webkit-min-device-pixel-ratio: 2), screen and ' + mobile + ' and (min--moz-device-pixel-ratio: 2), screen and ' + mobile + ' and (min-resolution: 250dpi)',
            narrow = '(min-width: 540px) and (max-width: 719px)',
            narrowHiDPI = 'screen and ' + narrow + ' and (min-resolution: 2dppx), screen and ' + narrow + ' and (-webkit-min-device-pixel-ratio: 2), screen and ' + narrow + ' and (min--moz-device-pixel-ratio: 2), screen and ' + narrow + ' and (min-resolution: 250dpi)',
            wide = '(min-width: 720px) and (max-width: 959px)',
            wideHiDPI = 'screen and ' + wide + ' and (min-resolution: 2dppx), screen and ' + wide + ' and (-webkit-min-device-pixel-ratio: 2), screen and ' + wide + ' and (min--moz-device-pixel-ratio: 2), screen and ' + wide + ' and (min-resolution: 250dpi)',
            xWide = '(min-width: 960px) and (max-width: 1279px)',
            xWideHiDPI = 'screen and ' + xWide + ' and (min-resolution: 2dppx), screen and ' + xWide + ' and (-webkit-min-device-pixel-ratio: 2), screen and ' + xWide + ' and (min--moz-device-pixel-ratio: 2), screen and ' + xWide + ' and (min-resolution: 250dpi)',
            xxWide = '(min-width: 1280px)',
            xxWideHiDPI = 'screen and ' + xxWide + ' and (min-resolution: 2dppx), screen and ' + xxWide + ' and (-webkit-min-device-pixel-ratio: 2), screen and ' + xxWide + ' and (min--moz-device-pixel-ratio: 2), screen and ' + xxWide + ' and (min-resolution: 250dpi)'; // loop through available panels

        panel.each(function() {
            // grab images
            var thisMobileImg = $(this).data('imgbg-mobile'),
                thisMobileImg2x = $(this).data('imgbg-mobile2x'),
                thisNarrowImg = $(this).data('imgbg-narrow'),
                thisNarrowImg2x = $(this).data('imgbg-narrow2x'),
                thisWideImg = $(this).data('imgbg-wide'),
                thisWideImg2x = $(this).data('imgbg-wide2x'),
                thisXWideImg = $(this).data('imgbg-xwide'),
                thisXWideImg2x = $(this).data('imgbg-xwide2x'),
                thisXXWideImg = $(this).data('imgbg-xxwide'),
                thisXXWideImg2x = $(this).data('imgbg-xxwide2x'),
                thisPanel = $(this);

            function replaceImg(img) {
                thisPanel.css('background-image', 'url("' + img + '")');
            } // run enquire against media queries


            enquire.register('screen and ' + mobile, {
                match: function match() {
                    replaceImg(thisMobileImg);
                }
            }).register(hiDPI, {
                match: function match() {
                    replaceImg(thisMobileImg2x);
                }
            }).register('screen and ' + narrow, {
                match: function match() {
                    replaceImg(thisNarrowImg);
                }
            }).register(narrowHiDPI, {
                match: function match() {
                    replaceImg(thisNarrowImg2x);
                }
            }).register('screen and ' + wide, {
                match: function match() {
                    replaceImg(thisWideImg);
                }
            }).register(wideHiDPI, {
                match: function match() {
                    replaceImg(thisWideImg2x);
                }
            }).register('screen and ' + xWide, {
                match: function match() {
                    replaceImg(thisXWideImg);
                }
            }).register(xWideHiDPI, {
                match: function match() {
                    replaceImg(thisXWideImg2x);
                }
            }).register('screen and ' + xxWide, {
                match: function match() {
                    replaceImg(thisXXWideImg);
                }
            }).register(xxWideHiDPI, {
                match: function match() {
                    replaceImg(thisXXWideImg2x);
                }
            });
        });
    }

    bgSwap();
});
"use strict";

jQuery(document).ready(function($) {
    if (window.location.hash) {
        setTimeout(function() {
            if ($(window.location.hash).length) {
                if ($(window.location.hash).attr('class') == 'wp-block-opus-core-block-rewrite-oa') {
                    var accordionTitle = $(window.location.hash).find($('h3.accordion-title'));

                    if (accordionTitle.attr('aria-expanded') == 'false') {
                        accordionTitle.click();
                    }
                }

                $('html, body').animate({
                    scrollTop: $(window.location.hash).offset().top - 100
                }, 600);
            }
        }, 500);
    }

    $("a[href^='#']").not('[href="#content"]').not('[href="#"]').not('[href="#0"]').click(function(e) {
        e.preventDefault();
        var target = $(this).attr('href');
        setTimeout(function() {
            if ($(target).attr('class') == 'wp-block-opus-core-block-rewrite-oa') {
                var accordionTitle = $(target).find($('h3.accordion-title'));

                if (accordionTitle.attr('aria-expanded') == 'false') {
                    accordionTitle.click();
                }
            }

            if ($(target).length) {
                $('html, body').animate({
                    scrollTop: $(target).offset().top - 100
                }, 600);
            }
        }, 100);
    });
    $('.smooth-scroll').on('click', function(event) {
        if (this.hash !== "") {
            event.preventDefault();
            var hash = this.hash;
            $('html, body').animate({
                scrollTop: $(hash).offset().top - 100
            }, 600);
        }
    });
});
"use strict";

jQuery.fn.blindRightToggle = function(duration, easing, complete) {
    return this.animate({
        marginRight: 0
    }, jQuery.speed(duration, easing, complete));
};

jQuery(document).ready(function($) {
    // toggle search form
    $(".utility-navigation input[type='text']").attr('placeholder', 'Search');
    $(".search-form-toggle").click(function() {
        $(this).attr("aria-expanded", "true");
        $(this).toggle();
        $(".searchform").toggleClass('active');
        $(".searchform input[type='text']").blindRightToggle();
        setTimeout(function() {
            $(".searchform input[type='text']").focus();
        }, 400);
    });
});
"use strict";

/**
 * File skip-link-focus-fix.js.
 *
 * Helps with accessibility for keyboard only users.
 *
 * Learn more: https://git.io/vWdr2
 */
(function() {
    var isIe = /(trident|msie)/i.test(navigator.userAgent);

    if (isIe && document.getElementById && window.addEventListener) {
        window.addEventListener('hashchange', function() {
            var id = location.hash.substring(1),
                element;

            if (!/^[A-z0-9_-]+$/.test(id)) {
                return;
            }

            element = document.getElementById(id);

            if (element) {
                if (!/^(?:a|select|input|button|textarea)$/i.test(element.tagName)) {
                    element.tabIndex = -1;
                }

                element.focus();
            }
        }, false);
    }
})();
"use strict";

jQuery(document).ready(function($) {
    $('.wp-block-table table').each(function() {
        if ($(this).find('thead').length) {
            $(this).basictable();
        } else {
            $(this).basictable({
                header: false
            });
        }
    });
});