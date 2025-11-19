<?php
/**
 * The front page template file
 *
 * This is the template for the home page
 *
 * @package QuizMasterGeneral
 */

get_header();
?>

<!-- Hero Section -->
<section class="hero-section">
    <div class="hero-content">
        <h1 class="hero-title">The Quiz Master General</h1>
        <p class="hero-subtitle">North East England's Premier Quiz & Entertainment Provider</p>
        <p style="font-size: 1.2rem; margin-bottom: 2rem;">Bringing Fun, Laughter, and Competition to Venues Across the Region</p>
        <div class="cta-buttons">
            <a href="#services" class="btn btn-primary">Our Services</a>
            <a href="<?php echo esc_url(home_url('/contact')); ?>" class="btn btn-secondary">Book Now</a>
        </div>
    </div>
</section>

<!-- Services Section -->
<section id="services" class="services-section">
    <div class="services-container">
        <h2 class="section-title">What We Offer</h2>
        <div class="services-grid">
            <div class="service-card">
                <div class="service-icon">🎯</div>
                <h3>Quiz Nights</h3>
                <p>Engaging quiz nights tailored to your venue. From pub quizzes to corporate events, we bring the questions, the fun, and the competition!</p>
                <p><strong>Perfect for:</strong> Pubs, bars, social clubs, and corporate team building</p>
            </div>

            <div class="service-card">
                <div class="service-icon">🏇</div>
                <h3>Race Nights</h3>
                <p>Exciting race nights that get everyone involved! Place your bets, cheer on your horse, and enjoy an evening of thrilling entertainment.</p>
                <p><strong>Perfect for:</strong> Fundraising events, social gatherings, and community celebrations</p>
            </div>

            <div class="service-card">
                <div class="service-icon">🎉</div>
                <h3>Special Events</h3>
                <p>Custom entertainment packages for your special occasions. Music rounds, picture quizzes, themed nights - we do it all!</p>
                <p><strong>Perfect for:</strong> Private parties, charity events, and festive celebrations</p>
            </div>
        </div>
    </div>
</section>

<!-- Why Choose Us Section -->
<section class="contact-section">
    <div class="contact-container">
        <h2 class="section-title">Why Choose Quiz Master General?</h2>

        <div class="services-grid" style="margin-top: 2rem;">
            <div style="text-align: center; padding: 1.5rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⭐</div>
                <h4>Experienced Host</h4>
                <p>Professional, engaging, and guaranteed to keep your crowd entertained</p>
            </div>

            <div style="text-align: center; padding: 1.5rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📝</div>
                <h4>Fresh Content</h4>
                <p>New questions every time - no repeats, always current and relevant</p>
            </div>

            <div style="text-align: center; padding: 1.5rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🎵</div>
                <h4>Professional Equipment</h4>
                <p>Quality sound system and everything needed for a seamless event</p>
            </div>
        </div>

        <div style="text-align: center; margin-top: 3rem; padding: 2rem; background: var(--light-bg); border-radius: 15px;">
            <h3 style="color: var(--primary-color); margin-bottom: 1rem;">Operating Across North East England</h3>
            <p style="font-size: 1.1rem;">Serving Newcastle, Gateshead, Durham, Sunderland, and surrounding areas</p>
        </div>
    </div>
</section>

<!-- Testimonials Section -->
<section class="testimonials-section">
    <div class="testimonials-container">
        <h2 class="section-title">What Venues Say About Us</h2>
        <div class="testimonials-grid">
            <div class="testimonial-card">
                <p class="testimonial-text">"The Quiz Master General has been running our weekly quiz for over a year now. Our customers love it and it's become our busiest night of the week!"</p>
                <p class="testimonial-author">Sarah M.</p>
                <p class="testimonial-venue">The Crown & Anchor, Newcastle</p>
            </div>

            <div class="testimonial-card">
                <p class="testimonial-text">"Professional, entertaining, and always reliable. The race night was a huge success and raised fantastic funds for our charity."</p>
                <p class="testimonial-author">John D.</p>
                <p class="testimonial-venue">Durham Cricket Club</p>
            </div>

            <div class="testimonial-card">
                <p class="testimonial-text">"Great atmosphere, well-organized, and the questions are pitched perfectly. Highly recommend for any venue looking to add a regular event."</p>
                <p class="testimonial-author">Lisa K.</p>
                <p class="testimonial-venue">The Red Lion, Gateshead</p>
            </div>
        </div>
    </div>
</section>

<!-- Contact CTA Section -->
<section class="contact-section">
    <div class="contact-container">
        <h2 class="section-title">Ready to Book?</h2>
        <p class="text-center" style="font-size: 1.2rem; margin-bottom: 2rem;">
            Get in touch today to discuss your quiz night, race night, or special event requirements.
        </p>
        <div class="contact-info">
            <div class="contact-item">
                <i class="fas fa-envelope"></i>
                <span><strong>Email:</strong> <a href="mailto:info@thequizmastergeneral.com">info@thequizmastergeneral.com</a></span>
            </div>
            <div class="contact-item">
                <i class="fas fa-phone"></i>
                <span><strong>Phone:</strong> Get in touch via email for booking enquiries</span>
            </div>
            <div class="contact-item">
                <i class="fas fa-map-marker-alt"></i>
                <span><strong>Coverage:</strong> North East England (Newcastle, Durham, Sunderland & surrounding areas)</span>
            </div>
        </div>
        <div style="text-align: center; margin-top: 2rem;">
            <a href="<?php echo esc_url(home_url('/contact')); ?>" class="btn btn-primary">Contact Us</a>
        </div>
    </div>
</section>

<?php
get_footer();
