$(document).ready(function() {
    getPageVariables();
})

/* ---------------------------------------------------------------------------------------------
                                        PRIMARY FILTERS
 ---------------------------------------------------------------------------------------------*/

/**
 * Description: Get page detail based on the type filters dropdown
 */
$(document).on('click', '.primary-filter-panel .primary-filter-refresh', function() {
    addSpin($(this).find('.icon-loop3'));
    clearPageIndexedDBStorage();
    getPrimaryFilters();
});

/* ---------------------------------------------------------------------------------------------
                                            PAGE MAIN
 ---------------------------------------------------------------------------------------------*/

/**
 * Description: Get pages detail based on the type filters tabs
 */
$(document).on('click', '.page-type-filters-panel ul > li:not(.active) > a', function() {
    $('.select-item-types').val($(this).text()).select2();
    getPagesList();
});

/**
 * Description: Get page detail based on the type filters dropdown
 */
$(document).on('change', '.page-type-filters-panel .select-item-types', function() {
    var typeFilterId = $('.select-item-types option:selected').attr('attr-field-type-id');
    $(`.page-type-filters-panel .nav-tabs a[attr-field-type-id=${typeFilterId}]`).tab('show');
    getPagesList();
});

/**
 * Description: Context menu action items
 */
$(document).on("contextmenu", "span.column-field-page-option", function(e){
    //alert('Context Menu event has fired!');
    $(this).addClass('active');
    return false;
});

/**
 * Description: Navigate to page detail when click on page title
 */
$(document).on("click", ".pages-main-panel .pages-main-table > tbody > tr > td .page-main-title", function(e){
    e.preventDefault();
    let attrId = $(this).attr('data-id');
    trackPageDetailOverwrite(() => {
        setParamPageId(attrId);
        setActiveSidebar('PAGE');
    }, '#dialog-page-editor-confirm');
});

/**
 * Description: Show property editor click on add new page detail button
 */
$(document).on("click", ".pages-detail-panel .stepy-pages-detail-form  .pages-detail-advanced .pages-detail-table-properties .btn-action.btn-add-new-page-detail", function(e){
    e.preventDefault();    
    // $('#propertyEditorModal').modal('show').find('.select2').select2();
});

/**
 * Description: Show property editor click on page detail title
 */
$(document).on("click", ".pages-detail-panel .pages-detail-table > tbody > tr > td .page-detail-title", function(e){
    e.preventDefault();      
    var property_detail = $(this).data('val');   
    property_detail = JSON.parse(unescape(property_detail));      
    $('#propertyEditorModal').modal('show').find('.select2').select2();
    $('#propertyEditorModal #property_id').val(property_detail.property);
    $('#propertyEditorModal #property_description').val(property_detail.description);
    $('#propertyEditorModal #property_picklist').val(property_detail.picklist);
    $('#propertyEditorModal #property_info').val(property_detail.info);
    $('#propertyEditorModal #property_readonly').val(property_detail.readonly);
    $('#propertyEditorModal').modal('show').find('.select2').select2();


});

/* ---------------------------------------------------------------------------------------------
                                            PAGE DETAIL
 ---------------------------------------------------------------------------------------------*/

/**
 * Description: Navigate to library when back button click
 */
$(document).on('click', '.pages-detail-panel .page-control-wizard .btn-action.page-back', function() {
    trackPageDetailFormChanges(() => {
        setParamPageId();
        setActiveSidebar();
    });
});

/**
 * Description: Save page details when save button click
 */
$(document).on('click', '.pages-detail-panel .page-control-wizard .btn-action.page-save:not(.disabled)', function() {
    trackPageDetailFormChanges(() => {
    	libPagesAdd();
        setParamPageId();
        setActiveSidebar();
    }
    ,'#dialog-confirm', 
	function() {
	    trackPageDetailFormChanges(() => {
	        setParamPageId();
	        setActiveSidebar();
	    });
	}
    );
});

/**
 * Description: Track page detail form changes on input keyup
 */
$(document).on('keyup change', '.pages-detail-panel .stepy-pages-detail-form input, .pages-detail-panel .stepy-pages-detail-form textarea:not(.default-tags-input)', function(event) {
    if(!$(event.target).parent().hasClass('bootstrap-tagsinput')) {
        checkPageDetailFormChanges(event);
    }
});

/**
 * Description: Track page detail form changes on select change
 */
$(document).on('change', '.pages-detail-panel .stepy-pages-detail-form select', function(event) {
    checkPageDetailFormChanges(event);
});

/**
 * Description: Append the selected icon into the page detail form icon dropdown
 */
$(document).on('click', '.pages-detail-panel .glyphs > div', async function(event) {
    event.preventDefault();
    let response = await getIndexedDBStorage('icons');
    let newIcon = $(this).find('i').attr('class');
    let pageFormIconSelector = $('.pages-detail-panel .stepy-pages-detail-form select[name=Icon]');           
    pageFormIconSelector.select2('destroy');
    pageFormIconSelector.select2({
        ajax: {
            url: "assets/icons/icomoon-icons.json",
            dataType: 'json',
            data: function (params) {
              return {
                q: params.term
              };
            },
            processResults: function (resp, params) {
                if(params.term) {
                    resp = resp.filter(res => {
                        return res.id.includes(params.term);
                    });
                } else {
                    resp = response.map(res => {
                        return {
                            id: res.Icon,
                            text: res.Icon
                        }
                    });
                }
                resp.push({
                    id: newIcon,
                    text: newIcon
                });
                resp.push({
                    id: 'ACTION_TO_OPEN_MODAL',
                    text: '... More Icons'
                });
                return {
                    results: resp
                };
            }
        },            
        templateResult: formatPageIcon,
        templateSelection: formatPageIcon
    });
    pageFormIconSelector.select2("trigger", "select", {
        data: { id: newIcon, text: newIcon }
    });
    $('#pageIconsModal').modal('hide');
    event.stopPropagation();
});

/**
 * Description: Show more page icons modal on select icon change (Add New)
 */
$(document).on('change', '.pages-detail-panel .stepy-pages-detail-form select[name=Icon]', function(event) {
    if($(this).val() === 'ACTION_TO_OPEN_MODAL') {
        $.getJSON( "assets/icons/icomoon-icons.json", function( icons ) {
            var html = '<div class="glyphs">';
            icons.forEach(icon => {
                html += `<div class="col-sm-4"><i class="${icon.text}"></i> ${icon.text}</div>`;
            });
            html += '</div>';
            $('#pageIconsModal .modal-body').html(html);
            $('#pageIconsModal').modal('show');
        });
        event.preventDefault();
        event.stopPropagation();
    }else{
        $(this).attr('current-val', $(this).val());    
    }
});

/**
 * Description: Set icon dropdown to null on modal close
 */
$(document).on('hidden.bs.modal', '#pageIconsModal', function() {
    let pageFormIconSelector = $('.pages-detail-panel .stepy-pages-detail-form select[name=Icon]'); 
    if( pageFormIconSelector.val() === 'ACTION_TO_OPEN_MODAL'){   
        let current_icon = pageFormIconSelector.attr('current-val');        
        if(typeof current_icon === 'undefined'){
            current_icon = 'icon-home';
        }        
        pageFormIconSelector.select2("trigger", "select", {
            data: { id: current_icon, text: current_icon}
        });
    }
});

/**
 * Description: Bind sidebar main toggle with Pages table
 */
$(document).on('click', '.sidebar-main-toggle, .sidebar ul.navigation > li', function() {
    $($.fn.dataTable.tables( true ) ).css('width', '100%');
    $($.fn.dataTable.tables( true ) ).DataTable().columns.adjust().draw();
}); 

/**
 * Description: Bind sidebar main toggle with Pages table
 */
$(document).on('keyup', '.pages-detail-panel .stepy-pages-detail-form .bootstrap-tagsinput input.tt-input', function(event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    event.stopPropagation();
    event.preventDefault(); 
    if(keycode == '13'){
        $('.tt-suggestion').trigger('click');
        return false;
	}
}); 

/**
 * Description: List dimensions based on the data source selection
 */
$(document).on('change', '.pages-detail-panel .stepy-pages-detail-form .pages-detail-mass-upload select[name=DobjectId]', async function(event) {
    var dimLists = await getIndexedDBStorage('dimensions');
    var tableSection = $('.pages-detail-panel .pages-detail-mass-upload-table-section');
    var dimValue = $(this).val();
    dimLists = convertToMultipleArray(dimLists);
    dimLists = dimLists.filter(dim => { return dim.Model === dimValue; });
    if(dimLists.length === 0)  {
        alert('No dimensions found!'); 
        if(!tableSection.hasClass('hidden')) {
            tableSection.addClass('hidden');
        }
        return;
    }
    var html = '';
    // dimLists.forEach(dim => {
    //     html += `<tr class="row_${dim.Dimension}">
    //         <td>${dim.Dimension}</td>
    //         <td>
    //             <input type="checkbox" class="styled" name="ROW" value="${dim.Dimension}">
    //         </td>
    //         <td>
    //             <input type="checkbox" class="styled" name="COLUMN" value="${dim.Dimension}">
    //         </td>
    //         <td>
    //             <input type="checkbox" class="styled" checked name="PAGE" value="${dim.Dimension}">
    //         </td>
    //         <td>
    //             <input type="text" class="form-control" name="DEFAULT_MEMBER">
    //         </td>
    //         <td>
    //             <input type="checkbox" class="styled" name="LOCK" value="${dim.Dimension}">
    //         </td>
    //         <td>
    //             <input type="checkbox" class="styled" name="HIDE" value="${dim.Dimension}">
    //         </td>
    //     </tr>`;
    // });
    // dimLists.forEach(dim => {
    //     html += `<tr class="row_${dim.Dimension}">
    //         <td>${dim.Dimension}</td>                      
    //         <td>
    //             <input type="text" class="form-control" data-id="${dim.Dimension}" name="DEFAULT_MEMBER">
    //         </td>           
    //         <td>
    //             <input type="hidden" class="styled" checked name="PAGE" value="${dim.Dimension}">
    //         </td>           
    //     </tr>`;    
    // });
    // tableSection.removeClass('hidden');
    // tableSection.find('.pages-detail-mass-upload-table tbody').html(html);
    // tableSection.find('.pages-detail-mass-upload-table .styled').uniform();
    
    
    // tableSection.find('.defaut-tags-input').tagsinput('add', {id:1, label:"blah blah"});
    // tableSection.find('.defaut-tags-input').tagsinput({        
    //     tagClass: function(item){
    //         var tag_class = item.replace(/ /g,"-");
    //         return `label label-primary tagsinput-${tag_class}-dimension page_taginput_class page_taginput_lock page_taginput_class1`;
    //     },                 
    // });    
    // console.log('dimLists',dimLists);       
    dimLists.forEach(dim => {
        if(dim.Dimension == 'TIME'){
            html += `<div class="dimension_values" data-id="${dim.Dimension}" data-val="">${dim.Dimension}<span class="dim_colon"> :</span>  <span class="right_dim_value">2020.TOTAL</span><div class="action"><i class="icon-eye2"></i><i class="icon-unlocked2"></i><i class="caret drop_dw"></i></div></div>` ;
        }else if(dim.Dimension == 'VERSION'){
            html += `<div class="dimension_values" data-id="${dim.Dimension}" data-val="">${dim.Dimension}<span class="dim_colon"> :</span>  <span class="right_dim_value">ACTUAL</span><div class="action"><i class="icon-eye2"></i><i class="icon-unlocked2"></i><i class="caret drop_dw"></i></div></div>` ;
        }else if(dim.Dimension == 'MEASURES'){
            html += `<div class="dimension_values" data-id="${dim.Dimension}" data-val="">${dim.Dimension}<span class="dim_colon"> :</span>  <span class="right_dim_value">PERIODIC</span><div class="action"><i class="icon-eye2"></i><i class="icon-unlocked2"></i><i class="caret drop_dw"></i></div></div>` ;
        }else{
        html += `<div class="dimension_values" data-id="${dim.Dimension}" data-val="">${dim.Dimension}<span class="dim_colon"> :</span>  <span class="right_dim_value">ALL_${dim.Dimension}</span><div class="action"><i class="icon-eye2"></i><i class="icon-unlocked2"></i><i class="caret drop_dw"></i></div></div>` ;
        }
    });
    tableSection.find('.page_header .dropdown-menu-sortable').html(html);
    preFillMassUploadTagsInputData();
});

/**
 * Description: Update page axis field based on the PAGE checkbox selection
 */
$(document).on('change', '.pages-detail-panel .stepy-pages-detail-form .pages-detail-mass-upload-table input[name=PAGE]', function(event) {
    if(!$(this).is(':checked')) {
        $(this).closest('tr').find('input[name=DEFAULT_MEMBER], input[name=LOCK], input[name=HIDE]').attr('disabled', 'disabled');
        $(this).closest('tr').find('input:text').val('').trigger('keyup');
    } else {
        $(this).closest('tr').find('input[name=DEFAULT_MEMBER], input[name=LOCK], input[name=HIDE]').removeAttr('disabled');
        $(this).closest('tr').find('input[name=ROW], input[name=COLUMN]').prop('checked', false);
    }
    $.uniform.update();
    preFillMassUploadTagsInputData();
});

/**
 * Description: Update column axis field based on the COLUMN checkbox selection
 */
$(document).on('change', '.pages-detail-panel .stepy-pages-detail-form .pages-detail-mass-upload-table input[name=COLUMN]', function(event) {
    if($(this).is(':checked')) {
        $(this).closest('tr').find('input[name=ROW], input[name=HIDE]').prop('checked', false);
        $(this).closest('tr').find('input[name=PAGE]').prop('checked', false).trigger('change');
        $.uniform.update();
    }
    preFillMassUploadTagsInputData();
});

/**
 * Description: Update row axis field based on the ROW checkbox selection
 */
$(document).on('change', '.pages-detail-panel .stepy-pages-detail-form .pages-detail-mass-upload-table input[name=ROW]', function(event) {
    if($(this).is(':checked')) {
        $(this).closest('tr').find('input[name=COLUMN], input[name=HIDE]').prop('checked', false);
        $(this).closest('tr').find('input[name=PAGE]').prop('checked', false).trigger('change');
        $.uniform.update();
    }
    preFillMassUploadTagsInputData();
});

/**
 * Description: Update hide axis field based on the HIDE checkbox selection
 */
$(document).on('change', '.pages-detail-panel .stepy-pages-detail-form .pages-detail-mass-upload-table input[name=HIDE]', function(event) {
    var tagClassName = `.tagsinput-${$(this).val()}-dimension`;
    if($(this).is(':checked')) {
        $(tagClassName).addClass('tags-input-hidden');
    } else {
        $(tagClassName).removeClass('tags-input-hidden');
    }
});

/**
 * Description: Update Data Profile Security option based on checkbox selection
 */
$(document).on('change', '.pages-detail-panel .stepy-pages-detail-form .pages-detail-advanced #dataProfileSecurity', function(event) {   
    if($(this).is(':checked')) { 
        $('.page-configure-action-table input[name=applyDataEnable]').removeAttr('disabled');    
    // if($(this).prop('checked') == true){
    //         alert()
    //     }      
        // $('.pages-detail-advanced .apply-data-profile, .pages-detail-advanced .profile-page-link').removeAttr('disabled');
        // $('.page-configure-action-table input[name=applyDataEnable]').removeAttr('disabled');
    } else {
        $('.pages-detail-advanced .apply-data-profile, .pages-detail-advanced .profile-page-link').attr('disabled','disabled');
        $('.page-configure-action-table input[name=applyDataEnable]').attr('disabled','disabled');
    }
    $.uniform.update();
});

$(document).on('change', '.pages_add_check', function(event) {   
    if($(this).is(':checked')) {                
        $('.pages-detail-advanced .add-page-profile, .pages-detail-advanced .add-page-link').removeAttr('disabled');
    }else{
        $('.pages-detail-advanced .add-page-profile, .pages-detail-advanced .add-page-link').attr('disabled','disabled');
    }
    $.uniform.update();
});
$(document).on('change', '.pages_update_check ', function(event) {   
    if($(this).is(':checked')) {                
        $('.pages-detail-advanced .update-page-profile, .pages-detail-advanced .update-page-link').removeAttr('disabled');
    }else{
        $('.pages-detail-advanced .update-page-profile, .pages-detail-advanced .update-page-link').attr('disabled','disabled');
    }
    $.uniform.update();
});
$(document).on('change', '.pages_delete_check ', function(event) {   
    if($(this).is(':checked')) {                
        $('.pages-detail-advanced .delete-page-profile, .pages-detail-advanced .delete-page-link').removeAttr('disabled');
    }else{
        $('.pages-detail-advanced .delete-page-profile, .pages-detail-advanced .delete-page-link').attr('disabled','disabled');
    }
    $.uniform.update();
});