$(document).ready(function() {
    getOTypeFilters();
    getOSubTypeFilters();
});

/**
 * Description: Get pages list
 */
async function getPagesList() {
    try {
        var pagesData = await getIndexedDBStorage('pages');
        if(!pagesData) {
            getWsObjectERBind(true, getPagesMainTableRowData);
            return false;
        }
        getPagesMainTableRowData(pagesData);   
    } catch (error) {
        displayLibraryCatchError('pages-main-table');
        return false;
    }
}

/**
 * Description: Get pages main table row data
 * @param {object} response 
 */
async function getPagesMainTableRowData(response) {
    var list = '';
    try {
        var pagesLists = convertToMultipleArray(response);
        setIndexedDBStorage('pages', pagesLists);
        if(isArray(pagesLists)) {
            // Filter type filter dropdown
            // var typeFilterId = parseInt($('.select-item-types option:selected').attr('attr-field-type-id'));
            // if(typeFilterId) {
            //     pagesLists = pagesLists.filter(page => { return page.OTypeFilId == typeFilterId });
            // }
    
            // Filter type filter tabs
            var typeFilterId = parseInt($('.page-type-filters-panel ul > li.active > a').attr('attr-field-type-id'));
            if(typeFilterId) {
                pagesLists = pagesLists.filter(page => { return page.OTypeFilId == typeFilterId });
            }
                   
            // Filter primary filter fancytree
            var node = $(".primary-filter-fancytree").fancytree("getActiveNode");
            if(node) {
                pagesLists = pagesLists.filter(page => { return page.PrimaryFilterId === node.data.PrimaryFilterId });
            }
            for(item of pagesLists) {
                list += `
                    <tr>
                        <td>
                            <span class="column-field-name">
                                <icon class="${item.Icon.toLowerCase()}"></icon> 
                                <a href="" data-popup="tooltip" data-placement="right" title="Description here..." data-id="${item.ObjectId}" class="page-main-title edit-page">${item.Name}</a>
                                <span class="column-field-page-option icon-menu pull-right"></span>
                            </span>
                        </td>
                        <td><span class="column-field-type">${await getPageType(item.OTypeFilId)}</span></td>
                        <td><span class="column-field-sub-type">${await getPageSubType(item.SoTypeFilId)}</span></td>
                        <td><span class="column-field-created-by">${item.CreatedBy}</span></td>
                        <td><span class="column-field-updated-by">${item.ModifiedBy}</span></td>
                        <td><span class="column-field-updated-on">${getFormattedDateTime(item.ModifiedOn)}</span></td>
                    </tr>
                `;
            }
        }
        loadPagesMainTable(list);
        loadPagesAddNewContextMenu();
        loadPagesTableContextMenu();
    } catch (error) {
        displayLibraryCatchError('pages-main-table');
        return false;
    }
}

/**
 * Description: Load pages main table
 * @param {string} pgLists 
 */
function loadPagesMainTable(pgLists = '') {
    try {        
        destroyDataTableInstance('pages-main-table');
        $('.pages-main-table').find('tbody').html(pgLists);
        initializePagesDataTable('pages-main-table');          
    } catch (error) {        
        displayLibraryCatchError('page-main-table');
        return false;
    }
}

/**
 * Description: Get type filters
 */
async function getOTypeFilters() {
    try {
        var typeFilters = await getIndexedDBStorage('type-filters');
        if(!typeFilters) {
            getWsOTypeFilterRBind(true, getOTypeFilterMenus);
            return false;
        }
        getOTypeFilterMenus(typeFilters);
    } catch (error) {
        displayLibraryCatchError('type-filters');
        return false;
    }
}

/**
 * Description: Get type filters menu
 * @param {object} response 
 */
function getOTypeFilterMenus(response) {
    try {
        var typeFilters = convertToMultipleArray(response);
        setIndexedDBStorage('type-filters', typeFilters);
        if(isArray(typeFilters)) {
            var list = '';
            // var option = '';
            var i = 0;
            for(item of typeFilters) {
                list += `<li class="nav-item ${!i++ ? 'active' : ''}"><a href="#" attr-field-type-id="${item.SoTypeFilId}" class="nav-link" data-toggle="tab">${item.Name}</a></li>`;
                // option += `<option value="${item.Name}" attr-field-type-id="${item.SoTypeFilId}">${item.Name}</option>`;
            }
            list += `<li class="nav-item"><a href="#" attr-field-type-id="0" class="nav-link" data-toggle="tab">All</a></li>`;
            // option += `<option value="All" attr-field-type-id="0">ALL</option>`;
            // list += `<li class="nav-item select-dropdown pull-right">
            //     <select data-placeholder="Filter type..." class="form-control select-item-types">
            //         ${option}
            //     </select>
            // </li>`;
            $('.page-type-filters-panel > ul').html(list);
        }
        // $('.pages-main-panel .page-type-filters-panel .select-item-types').select2();
        $('.page-type-filters-panel ul > li.active > a').click();   
    } catch (error) {
        displayLibraryCatchError('type-filters');
        return false;
    }
    getPagesList();
}

/**
 * Description: Get sub-type filters
 */
async function getOSubTypeFilters() {
    try {
        var subTypeFilters = await getIndexedDBStorage('sub-type-filters');
        if(!subTypeFilters) {
            getWsOSubTypeFilterRBind(true, getOSubTypeFilterMenus);
            return false;
        }
        getOSubTypeFilterMenus(subTypeFilters);   
    } catch (error) {
        displayLibraryCatchError('sub-type-filters');
        return false;
    }
}

/**
 * Description: Get sub-type filters menu
 * @param {object} response 
 */
function getOSubTypeFilterMenus(response) {
    try {
        var subTypeFilters = convertToMultipleArray(response);
        setIndexedDBStorage('sub-type-filters', subTypeFilters);   
    } catch (error) {
        displayLibraryCatchError('sub-type-filters');
        return false;
    }
}

/**
 * Description: Get page type
 * @param {string} pageId 
 */
async function getPageType(filterTypeId = '') {
    try {
        var typeFilters = await getIndexedDBStorage('type-filters');
        if(isArray(typeFilters)) {
            typeFilters = typeFilters.find(type_filter => { return type_filter.SoTypeFilId === filterTypeId; });
            if(typeFilters) {
                return typeFilters.Name;
            }
        }
        return '';   
    } catch (error) {
        displayLibraryCatchError('type-filters');
        return false;
    }
}

/**
 * Description: Get page sub-type
 * @param {string} pageId 
 */
async function getPageSubType(filterTypeId = '') {
    try {
        var subTypeFilters = await getIndexedDBStorage('sub-type-filters');
        if(isArray(subTypeFilters)) {
            subTypeFilters = subTypeFilters.find(sub_type_filter => { return sub_type_filter.SoTypeFilId === filterTypeId; });
            if(subTypeFilters) {
                return subTypeFilters.Name;
            }
        }
        return '';   
    } catch (error) {
        displayLibraryCatchError('sub-type-filters');
        return false;
    }
}

/**
 * Description: Load pages add new context menu
 */
function loadPagesAddNewContextMenu() {
    try {
        $.contextMenu({
            selector: '.pages-main-panel .pages-main-table-panel .pages-main-table-properties .btn-add-new-page',
            trigger: 'left',
            callback: function(key, options) {            
                switch(key) {
                    case "page" : 
                        trackPageDetailOverwrite(() => {
                            setParamPageId();
                            setActiveSidebar('PAGE');
                        },'#dialog-page-editor-confirm');
                        break;
                    case "process" : 
                        // 
                        break;
                    case "space" : 
                        // 
                        break;
                    default : 
                        // 
                        break;
                }
            },
            items: {
                "page": {
                    name: "Page",
                    icon: 'menu-page',
                    disabled: function(key, opt) {                    
                        if(!hasWriteAccess()){
                            return true;
                        }
                        return false;
                    }
                },
                "process": {
                    name: "Process",
                    icon: 'menu-process',
                    disabled: function(key, opt) {
                        if(!hasWriteAccess()){
                            return true;
                        }
                        return false;
                    }
                },
                "space": {
                    name: "Space",
                    icon: 'menu-space',
                    disabled: function(key, opt) {
                        if(!hasWriteAccess()){
                            return true;
                        }
                        return false;
                    }
                }
            }
        });
    } catch (error) {
        displayLibraryCatchError('context-menu');
        return false;
    }
}

/**
 * Description: Load pages table context menu
 */
function loadPagesTableContextMenu() {
    try {
        $.contextMenu({
            selector: '.pages-main-panel .pages-main-table > tbody > tr > td span.column-field-page-option',
            trigger: 'left',
            callback: function(key, options) {               
                switch(key) {
                    case "edit":
                        $(this).closest('td').find('a').trigger('click');
                        break;
                    case "copy": 
                        // 
                        break;
                    case "delete": 
                        // 
                        break;
                    default : 
                        // 
                        break;
                }
            },
            items: {
                "edit": {
                    name: "Edit",
                    icon: 'menu-rename',
                    disabled: function(key, opt) {                    
                        if(!hasWriteAccess()){
                            return true;
                        }
                        return false;
                    }
                },
                "copy": {
                    name: "Copy",
                    icon: 'menu-copy',
                    disabled: function(key, opt) {
                        if(!hasWriteAccess()){
                            return true;
                        }
                        return false;
                    }
                },
                "delete": {
                    name: "Delete",
                    icon: 'menu-delete',
                    disabled: function(key, opt) {
                        if(!hasWriteAccess()){
                            return true;
                        }
                        return false;
                    }
                }
            }
        });
    } catch (error) {
        displayLibraryCatchError('context-menu');
        return false;
    }
}

/**
 * Description: Pages table keywords search
 */
$('.pages-main-panel .pages-main-table-properties .search-page-keywords').keyup(function() {
    $('.pages-main-table').DataTable().search($(this).val()).draw();
});

/**
 * Description: Pages table column visibility
 */
$('.pages-main-panel .pages-table-column-visibility').click(function() {
    $('.buttons-colvis').click();
});