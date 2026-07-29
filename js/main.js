(function () {
    "use strict";

    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var isParallaxActive = true;

    function initScrollButton() {
        var button = document.querySelector(".hero__scroll");
        var target = document.querySelector(".intro");
        if (!button || !target) return;
        button.addEventListener("click", function () {
            target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
        });
    }

    function initPlanets() {
        if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
        gsap.registerPlugin(ScrollTrigger);

        var hero = document.querySelector(".hero");
        var wrappers = document.querySelectorAll(".planet-wrapper");
        var sun = document.querySelector(".planet-wrapper--sun");
        var blue = document.querySelector(".planet-wrapper--blue");
        var red = document.querySelector(".planet-wrapper--red");
        var intro = document.querySelector(".intro");

        if (!hero || !wrappers.length || prefersReducedMotion) return;

        wrappers.forEach(function (el, i) {
            gsap.fromTo(el,
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1, duration: 1.2, delay: 0.2 + i * 0.15, ease: "power3.out" }
            );
        });

        var isMobile = window.innerWidth < 768;

        function createFlight(element, x, y) {
            if (!element) return;
            gsap.to(element, {
                x: x,
                y: y,
                ease: "none",
                scrollTrigger: {
                    trigger: hero,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 0.4, 
                    invalidateOnRefresh: true,
                    onUpdate: function(self) {
                        if (self.progress > 0) {
                            isParallaxActive = false;
                        } else {
                            isParallaxActive = true;
                        }
                    }
                }
            });
        }

        createFlight(sun, isMobile ? "-50vw" : "-40vw", isMobile ? "70vh" : "75vh");
        createFlight(blue, isMobile ? "-20vw" : "-30vw", isMobile ? "-30vh" : "-45vh");
        createFlight(red, isMobile ? "5vw" : "30vw", isMobile ? "20vh" : "0vh");

        gsap.to(".hero__titles, .hero__scroll", {
            opacity: 0,
            y: -30,
            ease: "none",
            scrollTrigger: {
                trigger: hero,
                start: "top top",
                end: "bottom bottom",
                scrub: 1
            }
        });

        if (intro) {
            gsap.set(intro, { opacity: 0, y: 40 });
            ScrollTrigger.create({
                trigger: hero,
                start: "bottom bottom",
                onEnter: function() {
                    gsap.to(intro, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" });
                },
                once: true
            });
        }

        if (!prefersReducedMotion && wrappers.length) {
            var maxOffset = 30;

            function updateMouseParallax(e) {
                if (!isParallaxActive) return;
                var x = (e.clientX / window.innerWidth) * 2 - 1;
                var y = (e.clientY / window.innerHeight) * 2 - 1;
                wrappers.forEach(function (wrapper) {
                    var factor = parseFloat(wrapper.dataset.factor) || 0.5;
                    var offsetX = -x * factor * maxOffset;
                    var offsetY = -y * factor * maxOffset;
                    gsap.set(wrapper, { x: offsetX, y: offsetY, overwrite: "auto" });
                });
            }

            document.addEventListener("mousemove", updateMouseParallax);
        }
    }

    function initGallerySlider() {
        var track = document.querySelector("[data-gallery-slider]");
        var dots = document.querySelectorAll(".gallery__dot");
        var cards = track && track.querySelectorAll(".card-l");
        if (!track || !cards.length || window.matchMedia("(min-width: 1024px)").matches) return;

        function setActiveDot(index) {
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function getActiveIndex() {
            var scrollLeft = track.scrollLeft;
            var firstCard = cards[0];
            var cardWidth = firstCard.offsetWidth;
            var style = window.getComputedStyle(track);
            var gap = parseFloat(style.gap) || 8;
            var step = cardWidth + gap;
            return Math.round(scrollLeft / step);
        }

        track.addEventListener("scroll", function () {
            window.requestAnimationFrame(function () {
                setActiveDot(getActiveIndex());
            });
        }, { passive: true });

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                var firstCard = cards[0];
                var cardWidth = firstCard.offsetWidth;
                var style = window.getComputedStyle(track);
                var gap = parseFloat(style.gap) || 8;
                var step = cardWidth + gap;
                track.scrollTo({ left: step * index, behavior: prefersReducedMotion ? "auto" : "smooth" });
                setActiveDot(index);
            });
        });

        var resizeTimer;
        window.addEventListener("resize", function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                setActiveDot(getActiveIndex());
            }, 200);
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initScrollButton();
        initPlanets();
        initGallerySlider();
    });
})();