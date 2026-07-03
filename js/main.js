(function () {
    "use strict";

    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var isParallaxActive = true;

    function initScrollButton() {
        var button = document.querySelector(".hero__scroll");
        var target = document.querySelector(".intro");

        if (!button || !target) {
            return;
        }

        button.addEventListener("click", function () {
            target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
        });
    }

    function initPlanets() {
        if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        var hero = document.querySelector(".hero");
        var wrappers = document.querySelectorAll(".planet-wrapper");
        var sunWrapper = document.querySelector(".planet-wrapper--sun");
        var blueWrapper = document.querySelector(".planet-wrapper--blue");
        var redWrapper = document.querySelector(".planet-wrapper--red");

        if (!hero || !wrappers.length || prefersReducedMotion) {
            return;
        }

        // 1. Появление планет 
        wrappers.forEach(function (wrapper, index) {
            var delay = 0.2 + index * 0.15;
            gsap.fromTo(
                wrapper,
                { opacity: 0, scale: 0.8 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 1.2,
                    delay: delay,
                    ease: "power3.out",
                    overwrite: "auto"
                }
            );
        });

        // Определяем мобильный режим (ширина меньше 768px)
        var isMobile = window.innerWidth < 768;

        // 2. Разлёт планет при скролле по всей странице
        if (sunWrapper) {
            gsap.to(sunWrapper, {
                x: isMobile ? "-50vw" : "-40vw",
                y: isMobile ? "70vh" : "75vh",
                ease: "none",
                scrollTrigger: {
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1,
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
        if (blueWrapper) {
            gsap.to(blueWrapper, {
                x: isMobile ? "-20vw" : "-30vw",
                y: isMobile ? "-30vh" : "-45vh",
                ease: "none",
                scrollTrigger: {
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1
                }
            });
        }
        if (redWrapper) {
            gsap.to(redWrapper, {
                x: isMobile ? "5vw" : "30vw",
                y: isMobile ? "20vh" : "0vh",
                ease: "none",
                scrollTrigger: {
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1
                }
            });
        }

        // 3. Исчезновение заголовка и кнопки при скролле
        gsap.to(".hero__titles, .hero__scroll", {
            opacity: 0,
            y: -30,
            ease: "none",
            scrollTrigger: {
                trigger: hero,
                start: "20% top",
                end: "60% top",
                scrub: true
            }
        });

        // 4. Параллакс от мыши 
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
        var slider = document.querySelector("[data-gallery-slider]");
        var track = slider;
        var dots = document.querySelectorAll(".gallery__dot");
        var cards = track && track.querySelectorAll(".card-l");

        if (!track || !cards.length || window.matchMedia("(min-width: 1024px)").matches) {
            return;
        }

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

        track.addEventListener(
            "scroll",
            function () {
                window.requestAnimationFrame(function () {
                    setActiveDot(getActiveIndex());
                });
            },
            { passive: true }
        );

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