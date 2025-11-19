<?php
/**
 * Quiz Master General Theme Functions
 *
 * @package QuizMasterGeneral
 */

// Theme Setup
function quizmaster_setup() {
    // Add default posts and comments RSS feed links to head
    add_theme_support('automatic-feed-links');

    // Let WordPress manage the document title
    add_theme_support('title-tag');

    // Enable support for Post Thumbnails on posts and pages
    add_theme_support('post-thumbnails');
    set_post_thumbnail_size(1200, 675, true);

    // Register navigation menus
    register_nav_menus(array(
        'primary' => __('Primary Menu', 'quizmaster-general'),
        'footer' => __('Footer Menu', 'quizmaster-general'),
    ));

    // Switch default core markup to output valid HTML5
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
    ));

    // Add theme support for Custom Logo
    add_theme_support('custom-logo', array(
        'height'      => 100,
        'width'       => 100,
        'flex-height' => true,
        'flex-width'  => true,
    ));

    // Add support for responsive embedded content
    add_theme_support('responsive-embeds');

    // Add support for editor styles
    add_theme_support('editor-styles');
}
add_action('after_setup_theme', 'quizmaster_setup');

// Enqueue scripts and styles
function quizmaster_scripts() {
    // Theme stylesheet
    wp_enqueue_style('quizmaster-style', get_stylesheet_uri(), array(), '1.0');

    // Custom JavaScript
    wp_enqueue_script('quizmaster-script', get_template_directory_uri() . '/js/main.js', array(), '1.0', true);

    // Font Awesome for icons
    wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css', array(), '6.4.0');
}
add_action('wp_enqueue_scripts', 'quizmaster_scripts');

// Register Widget Areas
function quizmaster_widgets_init() {
    register_sidebar(array(
        'name'          => __('Footer Widget 1', 'quizmaster-general'),
        'id'            => 'footer-1',
        'description'   => __('Add widgets here to appear in your footer.', 'quizmaster-general'),
        'before_widget' => '<div id="%1$s" class="footer-section widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ));

    register_sidebar(array(
        'name'          => __('Footer Widget 2', 'quizmaster-general'),
        'id'            => 'footer-2',
        'description'   => __('Add widgets here to appear in your footer.', 'quizmaster-general'),
        'before_widget' => '<div id="%1$s" class="footer-section widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ));

    register_sidebar(array(
        'name'          => __('Footer Widget 3', 'quizmaster-general'),
        'id'            => 'footer-3',
        'description'   => __('Add widgets here to appear in your footer.', 'quizmaster-general'),
        'before_widget' => '<div id="%1$s" class="footer-section widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ));
}
add_action('widgets_init', 'quizmaster_widgets_init');

// Custom excerpt length
function quizmaster_excerpt_length($length) {
    return 30;
}
add_filter('excerpt_length', 'quizmaster_excerpt_length');

// Custom excerpt more
function quizmaster_excerpt_more($more) {
    return '...';
}
add_filter('excerpt_more', 'quizmaster_excerpt_more');

// Add custom classes to body
function quizmaster_body_classes($classes) {
    if (!is_front_page()) {
        $classes[] = 'internal-page';
    }
    return $classes;
}
add_filter('body_class', 'quizmaster_body_classes');

// Custom navigation walker for mobile menu
class Quizmaster_Walker_Nav_Menu extends Walker_Nav_Menu {
    function start_lvl(&$output, $depth = 0, $args = null) {
        $indent = str_repeat("\t", $depth);
        $output .= "\n$indent<ul class=\"sub-menu\">\n";
    }
}
