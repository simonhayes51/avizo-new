<?php
/**
 * The main template file
 *
 * @package QuizMasterGeneral
 */

get_header();
?>

<main id="primary" class="site-main">
    <div class="content-area">
        <?php
        if (have_posts()) :

            if (is_home() && !is_front_page()) : ?>
                <header>
                    <h1 class="page-title"><?php single_post_title(); ?></h1>
                </header>
            <?php endif;

            /* Start the Loop */
            while (have_posts()) :
                the_post();
                ?>
                <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                    <header class="entry-header">
                        <?php
                        if (is_singular()) :
                            the_title('<h1 class="entry-title">', '</h1>');
                        else :
                            the_title('<h2 class="entry-title"><a href="' . esc_url(get_permalink()) . '" rel="bookmark">', '</a></h2>');
                        endif;
                        ?>
                    </header>

                    <?php if (has_post_thumbnail()) : ?>
                        <div class="post-thumbnail">
                            <?php the_post_thumbnail(); ?>
                        </div>
                    <?php endif; ?>

                    <div class="entry-content">
                        <?php
                        if (is_singular()) :
                            the_content();
                        else :
                            the_excerpt();
                        endif;

                        wp_link_pages(array(
                            'before' => '<div class="page-links">Pages:',
                            'after'  => '</div>',
                        ));
                        ?>
                    </div>

                    <?php if (!is_singular()) : ?>
                        <footer class="entry-footer">
                            <a href="<?php the_permalink(); ?>" class="btn btn-primary">Read More</a>
                        </footer>
                    <?php endif; ?>
                </article>
                <?php
            endwhile;

            the_posts_navigation();

        else :
            ?>
            <section class="no-results">
                <header class="page-header">
                    <h1 class="page-title">Nothing Found</h1>
                </header>
                <div class="page-content">
                    <p>It seems we can't find what you're looking for. Perhaps try searching?</p>
                    <?php get_search_form(); ?>
                </div>
            </section>
            <?php
        endif;
        ?>
    </div>
</main>

<?php
get_footer();
