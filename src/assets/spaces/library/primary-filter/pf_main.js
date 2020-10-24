$(document).ready(function() {
    getPrimaryFilters();
});

/**
 * Description: Get primary filters
 */
async function getPrimaryFilters() {
    try {
        var primaryFilters = await getIndexedDBStorage('primary-filters');
        if(!primaryFilters) {
            getWsPrimaryFilRBind(true, getPrimaryFilterFancytree);
            return false;
        }
        getPrimaryFilterFancytree(primaryFilters);
    } catch (error) {
        displayLibraryCatchError('primary-filters');
        return false;
    }
}

/**
 * Description: Get primary filter fancytree
 * @param {object} response 
 */
function getPrimaryFilterFancytree(response) {
    try {
        var primaryFilters = convertToMultipleArray(response);
        if(isArray(primaryFilters)) {
            var data = $.map(primaryFilters, function (c) {
                c.id = c.Name;
                c.title = c.Name;
                c.parent = '';
                c.folder = true;
                return c;
            });
            generatePrimaryFilterFancytree(data);
            return false;
        }
    } catch (error) {
        displayLibraryCatchError('primary-filters');
        return false;
    }
    $('.primary-filter-fancytree').html('<span class="text-red text-bold">No Primary Filter Found!</span>');
    loadHtmlContent('#page-content', 'assets/spaces/library/pg_main/pg_main.html');
    removeSpin($('.primary-filter-panel .primary-filter-refresh').find('.icon-loop3'));
}

/**
 * Description: Generate primary filter fancytree
 * @param {object} data 
 */
function generatePrimaryFilterFancytree(data) {
    try {
        setIndexedDBStorage('primary-filters', data);
        if(isArray(data)) {
            if(isPrimaryFilterTreeInitialized()) {
                $(".primary-filter-fancytree").fancytree('destroy');
            }
            $(".primary-filter-fancytree").fancytree({
                extensions: ["childcounter"],
                childcounter: {
                    deep: false,
                    hideZeros: false
                },
                source: data,
                activate: function (event, data) {
                    setParamPageId();
                    loadHtmlContent('#page-content', 'assets/spaces/library/pg_main/pg_main.html');
                },
                init: function(event, data, flag) {
                    setParamPageId('');
                    loadHtmlContent('#page-content', 'assets/spaces/library/pg_main/pg_main.html');
                }
            });
        }
    } catch (error) {
        displayLibraryCatchError('primary-filters');
        return false;
    }
    removeSpin($('.primary-filter-panel .primary-filter-refresh').find('.icon-loop3'));
}