function handleMarketerTracking() {
    try {
        const e = new URLSearchParams(window.location.search).get("ref");
        if (e) {
            localStorage.setItem("optiline_marketer_ref", e);
            const t = new Date();
            t.setTime(t.getTime() + 5184e6);
            const o = "expires=" + t.toUTCString();
            document.cookie = `optiline_ref=${encodeURIComponent(e)}; ${o}; path=/; samesite=lax`;
        }
    } catch (e) {
        console.warn("OPTILINE TRACKING: Error.", e);
    }
}
function loadGoogleAnalytics() {
    if (document.getElementById('ga-script-id')) return;
    const gaId = 'G-W9EYDHHCW0'; 
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script1.id = 'ga-script-id'; 
    document.head.appendChild(script1);
    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    `;
    document.head.appendChild(script2);
    console.log("Google Analytics Loaded"); 
}
function initCookieConsent() {
    const e = document.getElementById("cookie-banner");
    const t = document.getElementById("accept-cookies");
    const o = document.getElementById("reject-cookies");
    const n = "optiline_cookie_consent";
    if (localStorage.getItem(n) === "accepted") {
        loadGoogleAnalytics();
        if (e) e.style.display = "none";
    } else if (localStorage.getItem(n) === "rejected") {
        if (e) e.style.display = "none";
    } else {
        if (!e || !t || !o) return;
        setTimeout(() => {
            if (!localStorage.getItem(n)) {
                e.style.display = "flex";
            }
        }, 2000);
    }
    if (!e || !t || !o) return;
    t.addEventListener("click", () => {
        localStorage.setItem(n, "accepted");
        loadGoogleAnalytics(); 
        e.style.display = "none";
    });
    o.addEventListener("click", () => {
        localStorage.setItem(n, "rejected");
        e.style.display = "none";
    });
}
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}
function enhanceMobileExperience() {
    const tableArrows = document.querySelectorAll('.comparison-table-wrapper .arrow');
    tableArrows.forEach(arrow => arrow.remove());
    if (window.innerWidth <= 768) {
        const iconItems = document.querySelectorAll('.icon-item');
        const iconCircles = document.querySelectorAll('.icon-circle');
        iconCircles.forEach(circle => {
            circle.addEventListener('touchstart', function() {
                this.classList.add('active-touch');
            }, {
                passive: true
            });
            circle.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.classList.remove('active-touch');
                }, 200);
            }, {
                passive: true
            });
            circle.addEventListener('touchcancel', function() {
                this.classList.remove('active-touch');
            }, {
                passive: true
            });
        });
        iconItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.style.webkitTapHighlightColor = 'transparent';
            item.style.outline = 'none';
        });
        const ctaButtons = document.querySelectorAll('.cta-button, .upsell-button');
        ctaButtons.forEach(btn => {
            btn.style.minHeight = '44px';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
            btn.style.webkitTapHighlightColor = 'transparent';
        });
    }
}
function initMobileCardExpansion() {
    const pricingCards = document.querySelectorAll('.pricing-card');
    function isMobile() {
        return window.innerWidth <= 768;
    }
    pricingCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (!isMobile()) return;
            if (e.target.closest('.cta-button')) return;
            const isExpanded = this.classList.contains('expanded');
            pricingCards.forEach(c => c.classList.remove('expanded'));
            if (!isExpanded) {
                this.classList.add('expanded');
                setTimeout(() => {
                    this.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest'
                    });
                }, 100);
            }
        });
    });
    document.addEventListener('click', function(e) {
        if (!isMobile()) return;
        if (!e.target.closest('.pricing-card')) {
            pricingCards.forEach(card => {
                card.classList.remove('expanded');
            });
        }
    });
    window.addEventListener('resize', function() {
        if (!isMobile()) {
            pricingCards.forEach(card => {
                card.classList.remove('expanded');
            });
        }
    });
}
function updateDynamicYears() {
    const currentYear = new Date().getFullYear();
    document.querySelectorAll('[data-year]').forEach(el => el.textContent = currentYear);
    document.querySelectorAll('.copyright p').forEach(el => {
        if (el.textContent.includes('2025')) {
            el.textContent = el.textContent.replace('2025', currentYear);
        }
    });
}
document.addEventListener("DOMContentLoaded", function() {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false, 
        touchMultiplier: 2,
    });
    if (typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(1000, 16);
    } else {
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                const header = document.getElementById("header");
                const hamburger = document.querySelector(".hamburger");
                const navLinks = document.querySelector(".nav-links");
                if (navLinks && navLinks.classList.contains("active")) {
                    hamburger.classList.remove("active");
                    navLinks.classList.remove("active");
                    document.body.classList.remove("no-scroll");
                }
                lenis.scrollTo(targetId, {
                    offset: 0,
                    duration: 1.5,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    });
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
        setTimeout(() => ScrollTrigger.refresh(), 500);
        initAnimations();
    }
    handleMarketerTracking();
    initCookieConsent();
    initMobileCardExpansion();
    updateDynamicYears();
    const e = document.getElementById("header");
    const t = document.querySelector(".hamburger");
    const o = document.querySelector(".nav-links");
    let n = 0;
    if (e) {
        const r = () => {
            let r = window.pageYOffset || document.documentElement.scrollTop;
            const a = r > 50;
            const isMenuOpen = o && o.classList.contains("active");
            if (isMenuOpen) {
                e.classList.remove("header-hidden");
                e.classList.add("scrolled"); 
            } else {
                e.classList.toggle("scrolled", a);
                if (window.innerWidth <= 768) {
                    const shouldHide = r > n && r > 100;
                    e.classList.toggle("header-hidden", shouldHide);
                }
            }
            n = r <= 0 ? 0 : r;
        };
        window.addEventListener("scroll", throttle(r, 20));
    }
    if (t && o) {
        t.addEventListener("click", () => {
            t.classList.toggle("active");
            o.classList.toggle("active");
            document.body.classList.toggle("no-scroll");
        });
    }
document.addEventListener('click', (e) => {
    const navLinks = document.querySelector(".nav-links");
    const hamburger = document.querySelector(".hamburger");
    if (navLinks && navLinks.classList.contains("active")) {
        if (e.target.closest('.nav-links a') || (!navLinks.contains(e.target) && !hamburger.contains(e.target))) {
            hamburger.classList.remove("active");
            navLinks.classList.remove("active");
            document.body.classList.remove("no-scroll");
        }
    }
});
    function initAnimations() {
        gsap.utils.toArray(".anim-group").forEach(e => {
            if (!e.closest('.article-section')) {
                const t = e.querySelectorAll("h1, h2, h3, h4, .cta-button, .logo-grid i, .service-card, .stat-card, .testimonial-card, .team-member, .faq-item, .process-step, .feature-card, .work-item, .blog-post-card, .view-all-work-btn, .service-image, .service-content > *, .service-features li, .industry-card, .filter-buttons, .filter-btn, .portfolio-item, .portfolio-item-feed, .pricing-card, .icon-item, .contact-wrapper > *, .step-item, .job-card, .no-openings, .payment-icons-wrapper, .payment-icons i, .hero-icons, .comparison-table-wrapper");
                if (t.length > 0) {
                    gsap.from(t, {
                        y: 50,
                        opacity: 0,
                        duration: .6,
                        ease: "power2.out",
                        stagger: .05,
                        scrollTrigger: {
                            trigger: e,
                            start: "top 85%",
                            toggleActions: "play none none none"
                        }
                    });
                }
            }
        });
        const r = document.querySelectorAll(".stat-number");
        if (r.length > 0) {
            r.forEach(e => {
                gsap.to(e, {
                    innerText: +e.dataset.target,
                    duration: 2.5,
                    roundProps: "innerText",
                    ease: "power2.inOut",
                    scrollTrigger: {
                        trigger: e,
                        start: "top 90%",
                        toggleActions: "play none none none"
                    }
                });
            });
        }
        const a = document.querySelectorAll(".filter-btn");
        if (a.length > 0) {
            const e = gsap.utils.toArray(".portfolio-item");
            a.forEach(t => {
                if (!t.hasAttribute('data-blog-filter')) {
                    t.addEventListener("click", () => {
                        const o = t.getAttribute("data-filter");
                        a.forEach(e => e.classList.remove("active"));
                        t.classList.add("active");
                        e.forEach(e => {
                            const t = e.dataset.category;
                            const n = "all" === o || t === o;
                            gsap.killTweensOf(e);
                            gsap.to(e, {
                                duration: .5,
                                opacity: n ? 1 : 0,
                                scale: n ? 1 : .95,
                                display: n ? "block" : "none",
                                ease: "power2.out",
                                delay: .1
                            });
                        });
                    });
                }
            });
        }
        const s = document.querySelectorAll(".pricing-card");
        if (s.length > 0) {
            s.forEach(e => {
                e.addEventListener("click", () => {
                    if (window.innerWidth > 768) {
                        s.forEach(card => card.classList.remove("selected"));
                        e.classList.add("selected");
                    }
                });
            });
            document.querySelectorAll(".icon-item").forEach(e => {
                const t = parseFloat(e.getAttribute("data-delay")) || 0;
                gsap.fromTo(e, {
                    opacity: 0,
                    y: 30
                }, {
                    opacity: 1,
                    y: 0,
                    duration: .6,
                    delay: .5 + t,
                    ease: "back.out(1.7)"
                });
            });
        }
        const c = document.querySelectorAll(".faq-item");
        if (c.length > 0) {
            c.forEach(e => {
                const t = e.querySelector(".faq-question");
                const o = e.querySelector(".faq-answer");
                gsap.set(o, {
                    maxHeight: 0,
                    opacity: 0
                });
                t.addEventListener("click", () => {
                    c.forEach(t => {
                        if (t !== e && t.classList.contains("active")) {
                            t.classList.remove("active");
                            gsap.to(t.querySelector(".faq-answer"), {
                                maxHeight: 0,
                                opacity: 0,
                                duration: .2,
                                ease: "power1.inOut"
                            });
                        }
                    });
                    e.classList.toggle("active");
                    if (e.classList.contains("active")) {
                        gsap.to(o, {
                            maxHeight: o.scrollHeight + "px",
                            opacity: 1,
                            duration: .3,
                            ease: "power2.out"
                        });
                    } else {
                        gsap.to(o, {
                            maxHeight: 0,
                            opacity: 0,
                            duration: .2,
                            ease: "power1.inOut"
                        });
                    }
                });
            });
        }
        const comparisonItem = document.querySelector(".comparison-item");
        if (comparisonItem) {
            const question = comparisonItem.querySelector(".comparison-question");
            const answer = comparisonItem.querySelector(".comparison-answer");
            gsap.set(answer, {
                maxHeight: 0,
                opacity: 0
            });
            question.addEventListener("click", () => {
                comparisonItem.classList.toggle("active");
                if (comparisonItem.classList.contains("active")) {
                    gsap.to(answer, {
                        maxHeight: answer.scrollHeight + "px",
                        opacity: 1,
                        duration: .4,
                        ease: "power2.out"
                    });
                    gsap.to(question.querySelector("i"), {
                        rotation: 180,
                        duration: .3
                    });
                } else {
                    gsap.to(answer, {
                        maxHeight: 0,
                        opacity: 0,
                        duration: .3,
                        ease: "power1.inOut"
                    });
                    gsap.to(question.querySelector("i"), {
                        rotation: 0,
                        duration: .3
                    });
                }
            });
        }
        const i = document.getElementById("scrollTopBtn");
        if (i) {
            window.addEventListener("scroll", throttle(() => {
                if (window.pageYOffset > 300) {
                    i.style.display = "flex";
                    gsap.to(i, {
                        opacity: .7,
                        scale: 1,
                        duration: .3
                    });
                } else {
                    gsap.to(i, {
                        opacity: 0,
                        scale: .8,
                        duration: .3,
                        onComplete: () => {
                            i.style.display = "none";
                        }
                    });
                }
            }, 100));
            i.addEventListener("click", () => {
                lenis.scrollTo(0, {
                    duration: 1.5,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            });
        }
        const blogElements = document.querySelectorAll(".article-text, .article-image, .key-takeaway, blockquote");
        if (blogElements.length > 0) {
            gsap.utils.toArray(blogElements).forEach(el => {
                gsap.from(el, {
                    y: 40,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 85%",
                        toggleActions: "play none none none"
                    }
                });
            });
        }
    }
    const l = document.querySelector(".footer-about p");
    if (l) l.textContent = "Elevated growth assets tailored for clarity and strength";
    enhanceMobileExperience();
    window.addEventListener('resize', throttle(enhanceMobileExperience, 250));
    if (window.innerWidth <= 768) {
        document.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('touchstart', function() {
                this.style.fontSize = '16px';
            });
        });
    }
});
if (window.navigator && navigator.serviceWorker) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for (let registration of registrations) {
            registration.unregister();
            console.log("Service Worker unregistered to fix caching issues.");
        }
    });
}
if (document.getElementById('year')) {
    document.getElementById('year').textContent = new Date().getFullYear();
}
document.addEventListener('DOMContentLoaded', function() {
    const CONTACT_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxfuiy21_nqqRs_8fGM4J4X_cxDavoz5n52o6GymuRgCUzwd3oMa7BLF1xbTnONkjFg/exec";
    const pageLoadTime = new Date().getTime();
    const form = document.getElementById('contact-form');
    const submitButton = document.getElementById('submit-button');
    const successMessage = document.getElementById('form-success');
    const errorMessage = document.getElementById('form-error');
    const countdownTimer = document.getElementById('countdown-timer');
    const countdownDisplay = document.getElementById('countdown-display');
    let countdownInterval = null;
    const COUNTDOWN_DURATION = 120;
    function startCountdown() {
        let timeLeft = COUNTDOWN_DURATION;
        if (countdownTimer) {
            countdownTimer.style.display = 'block';
            countdownDisplay.textContent = timeLeft;
            countdownInterval = setInterval(() => {
                timeLeft--;
                countdownDisplay.textContent = timeLeft;
                if (timeLeft <= 0) {
                    clearInterval(countdownInterval);
                    countdownTimer.style.display = 'none';
                    submitButton.disabled = false;
                    submitButton.style.display = 'block';
                    submitButton.textContent = 'Submit Message';
                }
            }, 1000);
        }
    }
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            successMessage.style.display = 'none';
            errorMessage.style.display = 'none';
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            const formData = new FormData(form);
            const timeToSubmit = new Date().getTime() - pageLoadTime;
            formData.append('timeToSubmit', timeToSubmit);
            try {
                const response = await fetch(CONTACT_WEBHOOK_URL, {
                    method: 'POST',
                    body: formData,
                    mode: 'cors'
                });
                if (!response.ok) {
                    let errorMsg = `HTTP error! status: ${response.status}`;
                    try {
                        const errResult = await response.json();
                        if (errResult.message) errorMsg = errResult.message;
                    } catch (jsonErr) {}
                    throw new Error(errorMsg);
                }
                const result = await response.json();
                if (result.status === 'ok') {
                    form.reset();
                    submitButton.style.display = 'none';
                    successMessage.textContent = `Thanks, ${name}. We received your message and will respond shortly.`;
                    successMessage.style.display = 'block';
                    startCountdown();
                } else {
                    throw new Error(result.message || 'Unknown error from script.');
                }
            } catch (err) {
                console.error('Contact Form Error:', err);
                errorMessage.textContent = err.message;
                errorMessage.style.display = 'block';
                submitButton.style.display = 'none';
                setTimeout(() => {
                    submitButton.textContent = 'Submit Message';
                    submitButton.disabled = false;
                    submitButton.style.display = 'block';
                    errorMessage.style.display = 'none';
                }, 5000);
                try {
                    if (typeof turnstile !== 'undefined') turnstile.reset();
                } catch (resetErr) {
                    console.error('Failed to reset turnstile:', resetErr);
                }
            }
        });
    }
});
window.addEventListener("scroll", function() {
    const progressBar = document.getElementById("progress-bar");
    if (progressBar) {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        progressBar.style.width = scrollPercent + "%";
    }
});
