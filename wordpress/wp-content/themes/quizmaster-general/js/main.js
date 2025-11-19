/**
 * Quiz Master General Theme JavaScript
 */

(function() {
    'use strict';

    // Mobile Menu Toggle
    function initMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', function() {
                navMenu.classList.toggle('active');
                const expanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
                menuToggle.setAttribute('aria-expanded', !expanded);
            });

            // Close menu when clicking outside
            document.addEventListener('click', function(event) {
                const isClickInsideNav = navMenu.contains(event.target);
                const isClickOnToggle = menuToggle.contains(event.target);

                if (!isClickInsideNav && !isClickOnToggle && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });

            // Close menu when window is resized above mobile breakpoint
            window.addEventListener('resize', function() {
                if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }

    // Smooth Scrolling for Anchor Links
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');

        links.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');

                // Skip if href is just "#"
                if (href === '#') {
                    e.preventDefault();
                    return;
                }

                const target = document.querySelector(href);

                if (target) {
                    e.preventDefault();

                    // Close mobile menu if open
                    const navMenu = document.querySelector('.nav-menu');
                    const menuToggle = document.querySelector('.menu-toggle');
                    if (navMenu && navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                        if (menuToggle) {
                            menuToggle.setAttribute('aria-expanded', 'false');
                        }
                    }

                    // Scroll to target
                    const headerHeight = document.querySelector('.site-header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Add active class to current menu item on scroll
    function initScrollSpy() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');

        if (sections.length === 0 || navLinks.length === 0) {
            return;
        }

        function highlightNavOnScroll() {
            const scrollPosition = window.scrollY + 100;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    navLinks.forEach(link => {
                        link.parentElement.classList.remove('current-menu-item');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.parentElement.classList.add('current-menu-item');
                        }
                    });
                }
            });
        }

        window.addEventListener('scroll', highlightNavOnScroll);
    }

    // Add animation to elements on scroll
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.service-card, .testimonial-card');

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '0';
                        entry.target.style.transform = 'translateY(30px)';
                        entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

                        setTimeout(() => {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        }, 100);

                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1
            });

            animatedElements.forEach(element => {
                observer.observe(element);
            });
        }
    }

    // Sticky Header Effect
    function initStickyHeader() {
        const header = document.querySelector('.site-header');
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
            } else {
                header.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
            }

            lastScroll = currentScroll;
        });
    }

    // Back to Top Button
    function initBackToTop() {
        // Create back to top button
        const backToTop = document.createElement('button');
        backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
        backToTop.setAttribute('aria-label', 'Back to top');
        backToTop.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--primary-color);
            color: white;
            border: none;
            cursor: pointer;
            font-size: 1.2rem;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        `;

        document.body.appendChild(backToTop);

        // Show/hide button on scroll
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTop.style.opacity = '1';
                backToTop.style.visibility = 'visible';
            } else {
                backToTop.style.opacity = '0';
                backToTop.style.visibility = 'hidden';
            }
        });

        // Scroll to top on click
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Hover effect
        backToTop.addEventListener('mouseenter', () => {
            backToTop.style.background = 'var(--secondary-color)';
            backToTop.style.transform = 'translateY(-5px)';
        });

        backToTop.addEventListener('mouseleave', () => {
            backToTop.style.background = 'var(--primary-color)';
            backToTop.style.transform = 'translateY(0)';
        });
    }

    // Initialize all functions when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initMobileMenu();
        initSmoothScroll();
        initScrollSpy();
        initScrollAnimations();
        initStickyHeader();
        initBackToTop();

        console.log('Quiz Master General theme loaded successfully!');
    });

})();
