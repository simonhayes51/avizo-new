    </div><!-- #content -->

    <footer id="colophon" class="site-footer">
        <div class="footer-container">
            <?php if (is_active_sidebar('footer-1')) : ?>
                <?php dynamic_sidebar('footer-1'); ?>
            <?php else : ?>
                <div class="footer-section">
                    <h3>About Us</h3>
                    <p>The Quiz Master General is the leading quiz provider in North East England, bringing fun and entertainment to venues across the region.</p>
                </div>
            <?php endif; ?>

            <?php if (is_active_sidebar('footer-2')) : ?>
                <?php dynamic_sidebar('footer-2'); ?>
            <?php else : ?>
                <div class="footer-section">
                    <h3>Quick Links</h3>
                    <p><a href="<?php echo esc_url(home_url('/')); ?>">Home</a></p>
                    <p><a href="<?php echo esc_url(home_url('/about')); ?>">About</a></p>
                    <p><a href="<?php echo esc_url(home_url('/contact')); ?>">Contact</a></p>
                </div>
            <?php endif; ?>

            <?php if (is_active_sidebar('footer-3')) : ?>
                <?php dynamic_sidebar('footer-3'); ?>
            <?php else : ?>
                <div class="footer-section">
                    <h3>Contact</h3>
                    <p><i class="fas fa-envelope"></i> info@thequizmastergeneral.com</p>
                    <p><i class="fas fa-phone"></i> Contact us for bookings</p>
                    <p><i class="fas fa-map-marker-alt"></i> Serving North East England</p>
                </div>
            <?php endif; ?>
        </div>

        <div class="footer-bottom">
            <p>&copy; <?php echo date('Y'); ?> <?php bloginfo('name'); ?>. All rights reserved.</p>
        </div>
    </footer>
</div><!-- #page -->

<?php wp_footer(); ?>

</body>
</html>
