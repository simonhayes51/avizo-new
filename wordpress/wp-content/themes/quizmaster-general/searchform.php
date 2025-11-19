<?php
/**
 * Search form template
 *
 * @package QuizMasterGeneral
 */
?>

<form role="search" method="get" class="search-form" action="<?php echo esc_url(home_url('/')); ?>">
    <div style="display: flex; gap: 0.5rem; max-width: 500px; margin: 1rem auto;">
        <input
            type="search"
            class="search-field"
            placeholder="Search..."
            value="<?php echo get_search_query(); ?>"
            name="s"
            style="flex: 1; padding: 0.75rem 1rem; border: 2px solid var(--primary-color); border-radius: 5px; font-size: 1rem;"
        />
        <button
            type="submit"
            class="search-submit btn btn-primary"
            style="padding: 0.75rem 1.5rem;"
        >
            <i class="fas fa-search"></i> Search
        </button>
    </div>
</form>
