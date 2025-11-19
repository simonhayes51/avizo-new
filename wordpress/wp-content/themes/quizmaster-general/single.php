<?php
/**
 * The template for displaying all single posts
 *
 * @package QuizMasterGeneral
 */

get_header();
?>

<main id="primary" class="site-main">
    <div class="content-area">
        <?php
        while (have_posts()) :
            the_post();
            ?>
            <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                <header class="entry-header">
                    <?php the_title('<h1 class="entry-title">', '</h1>'); ?>
                    <div class="entry-meta">
                        <span class="posted-on">
                            <i class="far fa-calendar"></i>
                            <?php echo get_the_date(); ?>
                        </span>
                        <span class="byline">
                            <i class="far fa-user"></i>
                            <?php the_author(); ?>
                        </span>
                    </div>
                </header>

                <?php if (has_post_thumbnail()) : ?>
                    <div class="post-thumbnail">
                        <?php the_post_thumbnail(); ?>
                    </div>
                <?php endif; ?>

                <div class="entry-content">
                    <?php
                    the_content();

                    wp_link_pages(array(
                        'before' => '<div class="page-links">Pages:',
                        'after'  => '</div>',
                    ));
                    ?>
                </div>

                <footer class="entry-footer">
                    <?php
                    $categories_list = get_the_category_list(', ');
                    if ($categories_list) {
                        echo '<span class="cat-links"><i class="fas fa-folder"></i> ' . $categories_list . '</span>';
                    }

                    $tags_list = get_the_tag_list('', ', ');
                    if ($tags_list) {
                        echo '<span class="tags-links"><i class="fas fa-tags"></i> ' . $tags_list . '</span>';
                    }
                    ?>
                </footer>
            </article>

            <nav class="post-navigation">
                <div class="nav-links">
                    <?php
                    previous_post_link('<div class="nav-previous">%link</div>', '<i class="fas fa-arrow-left"></i> Previous Post');
                    next_post_link('<div class="nav-next">%link</div>', 'Next Post <i class="fas fa-arrow-right"></i>');
                    ?>
                </div>
            </nav>

            <?php
            // If comments are open or we have at least one comment, load up the comment template.
            if (comments_open() || get_comments_number()) :
                comments_template();
            endif;

        endwhile;
        ?>
    </div>
</main>

<?php
get_footer();
