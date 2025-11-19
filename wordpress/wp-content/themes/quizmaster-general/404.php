<?php
/**
 * The template for displaying 404 pages (not found)
 *
 * @package QuizMasterGeneral
 */

get_header();
?>

<main id="primary" class="site-main">
    <section class="error-404 not-found">
        <div style="text-align: center; padding: 4rem 2rem;">
            <div style="font-size: 8rem; margin-bottom: 1rem;">❓</div>
            <h1 class="page-title" style="font-size: 3rem; color: var(--primary-color);">Oops! Page Not Found</h1>
            <p style="font-size: 1.2rem; margin: 2rem 0;">
                Looks like this page doesn't exist. Maybe it wandered off to answer a quiz question?
            </p>

            <div style="max-width: 600px; margin: 3rem auto;">
                <h3>Try These Instead:</h3>
                <div style="margin: 2rem 0;">
                    <a href="<?php echo esc_url(home_url('/')); ?>" class="btn btn-primary" style="margin: 0.5rem;">
                        <i class="fas fa-home"></i> Go Home
                    </a>
                    <a href="<?php echo esc_url(home_url('/services')); ?>" class="btn btn-secondary" style="margin: 0.5rem;">
                        <i class="fas fa-list"></i> View Services
                    </a>
                    <a href="<?php echo esc_url(home_url('/contact')); ?>" class="btn btn-secondary" style="margin: 0.5rem;">
                        <i class="fas fa-envelope"></i> Contact Us
                    </a>
                </div>
            </div>

            <div style="margin-top: 3rem;">
                <h3>Or Search Our Site:</h3>
                <?php get_search_form(); ?>
            </div>

            <div style="margin-top: 3rem; padding: 2rem; background: var(--light-bg); border-radius: 15px; max-width: 600px; margin: 3rem auto;">
                <h4 style="color: var(--primary-color);">Quiz Question of the Day:</h4>
                <p style="font-style: italic; margin: 1rem 0;">
                    "In what year was WordPress first released?"
                </p>
                <details>
                    <summary style="cursor: pointer; color: var(--accent-color); font-weight: bold;">Click for Answer</summary>
                    <p style="margin-top: 1rem;">2003! WordPress was released on May 27, 2003.</p>
                </details>
            </div>
        </div>
    </section>
</main>

<?php
get_footer();
