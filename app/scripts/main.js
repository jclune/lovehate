/*
 * 20140522
 *
 * Copyright (c) 2014 Justin Clune
 */
(function($, window, document) {
    $(function() {

        var ul = document.getElementById("photos");
        //start out in full screen
        var width = 310;
        var marginLeft = 5;

        //-----------------GET THE PHOTOS!-----------------
        var options = {};
        options.url = 'https://api.flickr.com/services/rest/';
        options.method = 'GET';
        options.params = {
            method: 'flickr.photos.search',
            per_page: 15,
            text: 'beach',
            api_key: '3e53c0f0f82059213050c4e8f2ad111d',
            format: 'json',
            nojsoncallback: 1
        };

        function requestSearch(options) {
            console.log("start ajax with search: " + options.params.text);
            $.ajax({
                type: options.method,
                url: options.url,
                data: options.params,
            }).done(function(data) {
                getPhotos(data);
            }).error(function() {
                var h2 = document.createElement("h2");
                h2.innerHTML = "API error";
                document.getElementById("container").appendChild(h2);
            });
        }
        requestSearch(options);

        var refresh = 0; //counter for first 2 li
        function getPhotos(data) {
            // get the photo array and append images. reset if theres an old arrray
            var photos = data.photos.photo;
            photos.forEach(function(i) {
                var img = document.createElement("img");
                //img.style.width = width + "px";
                img.src = "http://farm" + i.farm + ".staticflickr.com/" +
                    i.server + "/" + i.id + "_" + i.secret + "_z.jpg";

                var li;
                //append images to first li (to see gray canvas with load bar)   
                if (refresh++ === 0) {
                    console.log("refresh is " + refresh);
                    li = document.getElementById("loading");
                    li.appendChild(img);
                    li.removeAttribute("style");
                } else {
                    //console.log("normal li");
                    li = document.createElement("li");
                    ul.appendChild(li);
                    li.appendChild(img);
                }
                li.style.height = img.style.height;
                li.className = li.className + " boxShadow";

                //must have marginLeft defined
                //console.log(li.style.marginLeft);
                if (!li.style.marginLeft) {
                    li.style.marginLeft = marginLeft + "px";
                }
                if (!li.style.marginTop) {
                    li.style.marginTop = marginLeft + "px";
                }
                //console.log(li.style.marginLeft);
                addListeners(li);
            });
        }

        //-----------------PLAY WITH PHOTOS!-----------------

        var startX;
        var startY;
        var startML;
        var startMT;
        var touch;

        function buttonListeners() {
            var menuRight = document.getElementById("menuRight");
            menuRight.addEventListener("click", function() {
                toggleView();
            }, false);
            var menuLeft = document.getElementById("search");
            menuLeft.addEventListener("click", function(event) {
                settings();
            }, false);
            var love = document.getElementsByClassName("pure-button-primary");
            love[0].addEventListener("click", function() {
                //console.log(ul.children[0]);
                lovehate(ul.children[0], -1);
            }, false);
            var hate = document.getElementsByClassName("pure-button-secondary");
            hate[0].addEventListener("click", function() {
                //console.log(ul.children[0]);
                lovehate(ul.children[0], 1);
            }, false);
        }
        buttonListeners();

        function addListeners(element) {
            element.addEventListener("touchstart", function() {
                touchstart(event, element);
            }, false);
            element.addEventListener("touchmove", function() {
                touchmove(event, element);
            }, false);
            element.addEventListener("touchend", function() {
                touchend(event, element);
            }, false);
        }

        function touchstart(event, element) {
            //console.log(element.style.marginLeft);
            touch = event.changedTouches[0] || event.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            startML = parseInt(element.style.marginLeft);
            startMT = parseInt(element.style.marginTop);
            // event.preventDefault();
            // event.stopPropagation();
        }

        function touchmove(event, element) {
            touch = event.changedTouches[0] || event.touches[0];
            var x = touch.clientX - startX;
            var y = touch.clientY - startY;
            element.style.marginLeft = (startML + x) + "px";

            var threshold = 20;
            if (Math.abs(x) > threshold) {
                event.preventDefault();
                element.style.marginTop = (startMT + y) + "px";
                var deg = Math.atan(y / x) * 180 / Math.PI;
                if (deg < -30) {
                    deg = -30;
                } else if (deg > 30) {
                    deg = 30;
                }
                //element.style.webkitTransform = "rotate(" + -deg / 4 + "deg)";
                var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
                z = z / width / 2 + 1;
                //console.log("scale(" + z + ", " + z + ")");
                element.style.webkitTransform = "scale(" + z + ", " + z + ")" + " rotate(" + -deg / 4 + "deg)";
                //console.log(deg);

            }
            event.stopPropagation();
        }

        function touchend(event, element) {
            touch = event.changedTouches[0] || event.touches[0];
            var x = touch.clientX - startX;
            var y = touch.clientY - startY;
            var threshold = 100;
            var deg = Math.atan(y / x) * 180 / Math.PI;
            if (deg < -30) {
                deg = -30;
            } else if (deg > 30) {
                deg = 30;
            }

            if (Math.abs(x) < threshold) {
                nudge(element, deg);
            } else {
                lovehate(element);
            }
        }

        function nudge(element, deg) {
            if (!startML) {
                startML = 0;
            }
            if (!startMT) {
                startMT = 0;
            }
            var $elem = $(element);

            $elem.animate({
                "marginLeft": startML,
                "marginTop": startMT
            }, {
                step: function(now, fx) {
                    if ((deg) && (Math.abs(deg) >= 0)) {
                        //$elem.css("-webkit-transform", "scale(1,1) rotate(" + 0 + "deg)");
                        deg = deg * 0.9;
                        $elem.css("-webkit-transform", "scale(1,1) rotate(" + -deg + "deg)");
                        //console.log("-webkit-transform", "scale(1,1) rotate(" + -deg + "deg)");
                    }
                },
                "duration": 500,
                "specialEasing": "easeOutQuad",
                complete: function() {
                    console.log("animation done!");
                }
            });

        }

        function lovehate(element, buttonSign) {
            var sign;

            if (buttonSign) {
                sign = buttonSign;
            } else if (touch) {
                sign = 1 * ((touch.clientX - startX) > 0) || -1 * ((touch.clientX - startX) < 0);
            } else {
                console.log("ran lovehate without an event");
            }

            $(element).animate({
                "marginLeft": sign * (width + 20) + "px"
            }, {
                "duration": 200,
                "specialEasing": "easeInExpo",
                complete: function() {
                    //console.log("animation done!");
                    if (element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                }
            });

            //infinite supply of photos
            console.log(ul.children.length);
            if (ul.children.length === 10) {
                options.params.per_page = 6;
                requestSearch(options);
                console.log("another API");
            }
        }

        function toggleView() {
            var isThumb = ul.className.search(" thumbnails");
            console.log(isThumb);
            if (isThumb >= 0) {
                ul.className = ul.className.substring(0, isThumb);
            } else {
                ul.className = ul.className + " thumbnails";
            }
            console.log(ul.className);
            //ul.getElementsByClassName("p1")[0].style.
        }

        var lastInput;

        function settings() {
            console.log("settings");
            var header = document.getElementsByTagName("header")[0];
            var isSettings = header.className.search(" settings");
            console.log(isSettings);
            if (isSettings >= 0) {
                var input = document.forms["searchForm"]["search"].value;
                if (input && input !== lastInput) {
                    search(input);
                    lastInput = input;
                } else {
                    header.className = header.className.substring(0, isSettings);
                }
            } else {
                header.className = header.className + " settings";
            }
        }

        function search(input) {
            console.log("search!");
            options.params.text = input;
            for (var i = ul.children.length - 1; i >= 0; i--) {
                ul.removeChild(ul.children[i]);
            }
            ul.innerHTML = '<li id="loading" style="width:320px; height:320px;"></li>';
            ul.children[0].style.background = " gray url('/images/load.gif') no-repeat center center";
            console.log(ul.children[0]);
            refresh = 0;
            options.params.per_page = 15;
            requestSearch(options);
        }

        document.onkeydown = function(evt) {
            var keyCode = evt ? (evt.which ? evt.which : evt.keyCode) : event.keyCode;
            if (keyCode === 13) {
                // For Enter.
                var input = document.forms["searchForm"]["search"].value;
                if (input && input !== lastInput) {
                    search(input);
                    lastInput = input;
                }
            }
            if (keyCode === 27) {
                // For Escape.
            } else {
                return true;
            }
        };

        //landscape vs portrait mode

        function portrait() {
            console.log("portrait");
            var title = document.getElementById("header");
            title.style.display = "inline-block";
            var sideBySide = document.getElementsByClassName("sidebyside")[0];
            sideBySide.style.width = "100%";
            sideBySide.style.marginTop = "0";
            sideBySide.children[0].style.float = "clear";
            sideBySide.children[1].style.float = "clear";
            ul.style.marginTop = "0";
            var search = document.getElementById("menuLeft");
            search.style.display = "block";
        }

        function landscape() {
            console.log("landscape");
            var title = document.getElementById("header");
            title.style.display = "none";
            var sideBySide = document.getElementsByClassName("sidebyside")[0];
            sideBySide.style.width = "100%";
            sideBySide.style.marginTop = "75px";
            sideBySide.children[0].style.float = "left";
            sideBySide.children[1].style.float = "right";
            ul.style.marginTop = "-218px";
            var search = document.getElementById("menuLeft");
            search.style.display = "none";

        }
        var $win = $(window);
        var startOrient = ($win.width() > $win.height());
        if (startOrient) {
            landscape();
        } else {
            portrait();
        }

        $win.on("resize", function() {
            var orient = ($win.width() > $win.height());
            if (orient) {
                landscape();
            } else {
                portrait();
            }
        });

    });
    /*

Secret:
90efb560e4da8730
*/
    // The rest of the code goes here!
}(window.jQuery, window, document));