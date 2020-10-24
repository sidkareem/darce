$(document).ready(function() {   
    // loadPageTagInputContextMenu();
// if($(this).hasClass(''))
    // $('tbody').sortable();
    // $( ".tagsinput-ACCOUNT_ALLOC-dimension" ).draggable();
    $.fn.stepy.defaults.legend = false;
    $.fn.stepy.defaults.transition = 'fade';
    $.fn.stepy.defaults.duration = 150;
    $.fn.stepy.defaults.backLabel = '<i class="icon-arrow-left13 position-left"></i> Previous';
    $.fn.stepy.defaults.nextLabel = 'Next <i class="icon-arrow-right14 position-right"></i>';
    // Page form selector
    var pageForm = $('.pages-detail-panel .stepy-pages-detail-form');
    pageForm.stepy({
        titleClick: true,
        enter: false,
        back: function(index) {
            return pageDetailTemplateFormValidation();
        },
        next: function(index) {            
            return pageDetailTemplateFormValidation();
        },
        select: function(index) {
            $('.pages-detail-panel .stepy-pages-detail-form input').blur();
            drawCallbackDataTable();
        }
    });
    pageForm.find('.select2').select2();
    pageForm.find('.styled').uniform();
    pageForm.find('fieldset').removeAttr('title');
    pageForm.find('.button-next').addClass('btn btn-primary');
    pageForm.find('.button-back').addClass('btn btn-default');
    initializeCodeMirror('PageDataFilter');
    setDimensionProperty();
    getPageDetail();
});

// Page form selector
var pageForm = $('.pages-detail-panel .stepy-pages-detail-form');

// default tag color for newly created tag
var defaultTagColor = '#546e7a';

// Tag pallete colors
var tagPaletteColors = [
    ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
    ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
    ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
    ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
];

/**
 * Description: Validate page detail template form
 */
function pageDetailTemplateFormValidation(){
    let isvalid = true;
    $('span.error').html('');
    var templateId = $(".pages-detail-panel .stepy-pages-detail-form").find('select[name=TemplateId]').val();
    if(!templateId){
        $('span.templateid-error').html('Select template.');
        isvalid = false;
    }

    if(templateId == 3) {
        $('.pages-detail-advanced').addClass('hidden');
        $('.pages-detail-mass-upload').removeClass('hidden');
    } else {
        $('.pages-detail-advanced').removeClass('hidden');
        $('.pages-detail-mass-upload').addClass('hidden');
    }
    return isvalid;
}

/**
 * Description: Get page detail
 */
async function getPageDetail() {
    try {
        await getPagePrimaryFiltersDropdown();
        await getPageIconsDropdown();
        await getPageTagsDropdown();
        await getPageOwnersDropdown();
        await getPageSecurityDropdown();
        await getPageTemplatesDropdown();
        listModelOptions(pageForm.find('select[name=DobjectId]'), true);
        listDimensions('', pageForm.find('select[name=DimensionId]'), true, false);
        
        //Apply Data Profile Security 
        getDataProfileDropdownField();
        var pagelinks = [{id:'1',Name:'ADD TEMPLATE 1'},
                        {id:'2',Name:'ADD TEMPLATE 2'},
                        {id:'3',Name:'ADD TEMPLATE 3'},]
        getDataProfilePageLinkDropdownField(pagelinks);
        $('.pages-detail-panel .stepy-pages-detail-form .pages-detail-advanced #dataProfileSecurity').trigger('change');
        listDimensions('', $('.pages-detail-panel .stepy-pages-detail-form .pages-detail-advanced').find('select[name=DobjectId]'), true, false);
        var pageData = await getIndexedDBStorage('pages');        
        if(isArray(pageData)) {
            var pageDetail = pageData.find(page => { return page.ObjectId === getParamPageId(); });            
            updatePageDetail(pageDetail);
        }  
        updatePageDetailTable(); 
    } catch (error) {
        displayLibraryCatchError('page-detail-form');
        return false;
    }
}

/**
 * Description: Get page primary filters dropdown
 */
async function getPagePrimaryFiltersDropdown() {
    try {
        var response = await getIndexedDBStorage('primary-filters');
        if(!response) {
            getWsPrimaryFilRBind(true, updatePagePrimaryFiltersDropdown);
            return false;
        }
        updatePagePrimaryFiltersDropdown(response);   
    } catch (error) {
        displayLibraryCatchError('page-detail-primary-filters');
        return false;
    }
}

/**
 * Description: Update page primary filters dropdown
 */
async function updatePagePrimaryFiltersDropdown(response) {
    try {
        var response = convertToMultipleArray(response);
        if(isArray(response)) {
            var data = $.map(response, function (c) {
                c.id = c.Name;
                c.title = c.Name;
                c.parent = '';
                c.folder = true;
                return c;
            });
            setIndexedDBStorage('primary-filters', data);
        }
        var option = '<option></option>';
        if(isArray(response)) {
            $.each(response, function(i, item) {
                option += `<option value="${item.PrimaryFilterId}">${item.Name}</option>`;
            });
        }
        pageForm.find('select[name=PrimaryFilterId]').html(option).select2();   
    } catch (error) {
        displayLibraryCatchError('primary-filters');
        return false;
    }
}

/**
 * Description: Get page icons dropdown
 */
async function getPageIconsDropdown() {
    try {
        var response = await getIndexedDBStorage('icons');
        if(!response) {
            getWsPageIconsRBind(true, updatePageIconsDropdown);
            return false;
        }
        updatePageIconsDropdown(response);   
    } catch (error) {
        displayLibraryCatchError('page-detail-icons');
        return false;
    }
}

/**
 * Description: Update page icons dropdown
 */
function updatePageIconsDropdown(response) {
    try {
        var response = convertToMultipleArray(response);
        setIndexedDBStorage('icons', response);
        pageForm.find('select[name=Icon]').select2({
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
                        id: 'ACTION_TO_OPEN_MODAL',
                        text: '... More Icons'
                    });
                    return {
                        results: resp
                    };
                },
                cache: true
            },            
            templateResult: formatPageIcon,
            templateSelection: formatPageIcon
        });
    } catch (error) {
        displayLibraryCatchError('page-detail-icons');
        return false;
    }
}

/**
 * Description: Get page tags dropdown
 */
async function getPageTagsDropdown() {
    try {
        var response = await getIndexedDBStorage('tags');
        if(!response && getParamPageId()) {
            getWsTagsRBind(getParamPageId(), true, updatePageTagsDropdown);
            return false;
        }
        updatePageTagsDropdown(response);
    } catch (error) {
        displayLibraryCatchError('page-detail-tags');
        return false;
    }
}

/**
 * Description: Update page tags dropdown
 * @param {object} response 
 */
function updatePageTagsDropdown(response) {
    try {
        var tagsInputs = convertToMultipleArray(response);
        setIndexedDBStorage('tags', response);
        // if(isArray(tagsInputs)) {
            // Use Bloodhound engine
            var engine = new Bloodhound({
                local: response,
                datumTokenizer: function(d) {
                    return Bloodhound.tokenizers.whitespace(d.Name);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                templates: {
                    suggestion: function(data) {
                        return '<div>'+ data.Name +'</div>';
                    }
                }
            });
    
            // Initialize engine
            engine.initialize();
    
            // Initialize tags input
            $('.stepy-pages-detail-form .tags-input').tagsinput({
                itemValue: 'Name',
                typeaheadjs: {
                    displayKey: 'Name',
                    source: engine.ttAdapter(),
                    templates: {
                        notFound: function(data) { 
                            return `
                                <div class="tt-suggestion" onclick="addCustomTagsInput('${data.query}')">
                                    <icon class="icon-plus3"></icon> Create tag for 
                                    <span class="new-tag">"${data.query}"</span>
                                </div>
                            `;
                        },
                        suggestion: function(data) {
                            var bgColor = data.Color ? data.Color: defaultTagColor;
                            return `<div><span class="exist-tag" style="background-color: ${bgColor};">${data.Name}</span></div>`;
                        }
                    }
                },
                tagClass: function(item){
                    var tag_class = item.Name.replace(/ /g,"-");
                    return `tagsinput-${tag_class}-palette`;
                }
            });
    
            $('.stepy-pages-detail-form .tags-input').on('itemAdded', function(data) {
                // addColorPickerTagsInput(data);
                checkPageDetailFormChanges(data);
            });
    
            $('.stepy-pages-detail-form .tags-input').on('itemRemoved', function(data) {
                checkPageDetailFormChanges(data);
            });
        // }
    } catch (error) {
        displayLibraryCatchError('page-detail-tags');
        return false;
    }
}

/**
 * Description: Get page owners dropdown
 */
async function getPageOwnersDropdown() {
    try {
        var response = await getIndexedDBStorage('owners');
        if(!response) {
            getWsUsersAndTeamsRBind(true, updatePageOwnersDropdown);
            return false;
        }
        updatePageOwnersDropdown(response);
    } catch (error) {
        displayLibraryCatchError('page-detail-owners');
        return false;
    }
}

/**
 * Description: Update page owners dropdown
 * @param {object} response 
 */
function updatePageOwnersDropdown(response) {
    try {
        var ownerLists = convertToMultipleArray(response);
        setIndexedDBStorage('owners', ownerLists);
        var option = '<option></option>';
        option += '<option>No Owner</option>';
        if(isArray(ownerLists)) {
            $.each(ownerLists, function(i, item) {
                option += `<option value="${item.UserId}">${item.UserId}</option>`;
            });
        }
        pageForm.find('select[name=Owner]').html(option).select2();
    } catch (error) {
        displayLibraryCatchError('page-detail-owners');
        return false;
    }
}

/**
 * Description: Get page security dropdown
 */
async function getPageSecurityDropdown() {
    try {
        var response = await getIndexedDBStorage('security');
        if(!response) {
            getWsUsersAndTeamsRBind(true, updatePageSecurityDropdown);
            return false;
        }
        updatePageSecurityDropdown(response);
    } catch (error) {
        displayLibraryCatchError('page-detail-security');
        return false;
    }
}

/**
 * Description: Update page security dropdown
 * @param {object} response 
 */
function updatePageSecurityDropdown(response) {
    try {
        var securityLists = convertToMultipleArray(response);
        setIndexedDBStorage('security', securityLists);
        var option = '<option></option>';
        option += '<option>No Security</option>';
        if(isArray(securityLists)) {
            $.each(securityLists, function(i, item) {
                option += `<option value="${item.Name}">${item.Name}</option>`;
            });
        }
        pageForm.find('select[name=Security]').html(option).select2();
    } catch (error) {
        displayLibraryCatchError('page-detail-security');
        return false;
    }
}

/**
 * Description: Get page templates dropdown
 */
async function getPageTemplatesDropdown() {
    try {
        var templates = await getIndexedDBStorage('templates');
        if(!templates) {
            getWsZdarTmpltRBind(true, updatePageTemplatesDropdown);
            return false;
        }
        updatePageTemplatesDropdown(templates);   
    } catch (error) {
        displayLibraryCatchError('page-detail-templates');
        return false;
    }
}

/**
 * Description: Update page templates dropdown
 * @param {object} response 
 */
function updatePageTemplatesDropdown(response) {
    try {
        var templateLists = convertToMultipleArray(response);
        setIndexedDBStorage('templates', templateLists);
        var option = '<option></option>';
        if(isArray(templateLists)) {
            $.each(templateLists, function(i, item) {
                option += `<option value="${item.TemplateId}">${item.Name}</option>`;
            });
        }
        pageForm.find('select[name=TemplateId]').html(option).select2();
    } catch (error) {
        displayLibraryCatchError('page-detail-templates');
        return false;
    }
}


/**
 * Description: Update  Data Page link Dropdown Field
 * @param {object} options 
 */
function getDataProfilePageLinkDropdownField(options) {
    var option = '<option></option>';
    option += '<option>No Page Link</option>';
    if(isArray(options)) {
        $.each(options, function(i, item) {
            option += `<option value="${item.id}">${item.Name}</option>`;
        });
    }
    pageForm.find('.profile-page-link').html(option).select2();
    
}


/**
 * Description: Update  Data Profile Dropdown Field
 * @param {object} options 
 */
async function getDataProfileDropdownField() {
    var response = await getIndexedDBStorage('security');
    if(!response) {
        getWsUsersAndTeamsRBind(true, updatePageSecurityDropdown);
        return false;
    }
    var option = '<option></option>';
    option += '<option>No Profile</option>';
    if(isArray(response)) {
        $.each(response, function(i, item) {
            option += `<option value="${item.TeamId}">${item.Name}</option>`;
        });
    }
    pageForm.find('.apply-data-profile').html(option).select2();
    
}

/**
 * Description: Update page detail
 * @param {object} response 
 */
async function updatePageDetail(response) {
    try {
        if(typeof response !== 'undefined') {
            pageForm.find('h1').html('Edit Page');
            pageForm.find('.CodeMirror').remove();
            
            // General
            pageForm.find('input[name=Name]').val(response.Name);
            pageForm.find('select[name=Icon]').select2("trigger", "select", {
                data: { id: response.Icon, text: response.Icon }
            });
            addMissingMemberLists('select[name=PrimaryFilterId]', response.PrimaryFilterId);
            pageForm.find('select[name=PrimaryFilterId]').val(response.PrimaryFilterId).select2();
            addMissingMemberLists('select[name=TemplateId]', response.TemplateId);
            pageForm.find('select[name=TemplateId]').val(response.TemplateId).select2();
            pageForm.find('textarea[name=Description]').val(response.Description);
            pageForm.find('input[name=Tags]').val(response.Tags);
            
            // Update owner and security detail
            updatePageOwnerSecurityDetail();
    
            // Advanced
            addMissingMemberLists('select[name=DobjectId]', response.DobjectId);
            pageForm.find('select[name=DobjectId]').val(response.DobjectId).select2();

            var helpLink = response.HelpLink;
            // addMissingMemberLists('select[name=HelpLink]', helpLink);
            $('select[name=HelpLink]').append('<option value="' + helpLink + '">' + helpLink + '</option>');
            pageForm.find('select[name=HelpLink]').val(helpLink).select2();
            
            initializeCodeMirror('PageDataFilter');
        }
    } catch (error) {
        displayLibraryCatchError('page-detail-form');
        return false;
    }    
    updatePageDetailSaveButton();
}



/**
 * Description: Update page owner/security detail
 */
function updatePageOwnerSecurityDetail() {
    var pageId = getParamPageId();
    getWsZdarObjSecRBind(pageId, true, async (res) => {
        var pageData = await getIndexedDBStorage('pages');
        if(res) {
            if(isArray(pageData)) {       
                addMissingMemberLists('select[name=Owner]', res.Owner);
                pageForm.find('select[name=Owner]').val(res.Owner).select2();
                addMissingMemberLists('select[name=Security]', res.Team);
                pageForm.find('select[name=Security]').val(res.Team).select2();
                var pageDetail = pageData.map(page => {
                    if(page.ObjectId === pageId) {
                        page.Owner = res.Owner;
                        page.Security = res.Team;
                    }
                    return page;
                });   
            } 
        } else {
            var pageDetail = pageData.map(page => {
                // if(page.ObjectId === pageId) {
                //     page.Owner = '';
                //     page.Security = '';
                // }
                return page;
            });
        }
        setIndexedDBStorage('pages', pageDetail);
    });
}

/**
 * Description: Update page detail table
 */
function updatePageDetailTable() {
    var list = '';
    var response = [{property:'ID',description:'ID', picklist:'', info: 'Member ID - Unique ID for the member', readonly:'Y'},
                    {property:'DESCRIPTION',description:'Description', picklist:'', info: 'Member Description', readonly:'Y'},
                    {property:'ACCTYPE',description:'Account Type', picklist:'INC, EXP', info: 'To control data signage and aggregation in general BPC reporting', readonly:'N'},
                    {property:'ACCT_SUB_TYPE',description:'Account Sub Type', picklist:'INC, EXP, AST, LIA, EQU', info: 'A further breakdown of account type for logical, reporting and organizational purposes', readonly:'N'},
                    {property:'RATETYPE',description:'Account Rate Type', picklist:'AVG, END, HIST, NOTRANS, COPYLC', info: 'Defines FX calculation behavior based on type (Average, End, Historical, No Trans, etc.)', readonly:'N'}];
    try {
        if(isArray(response)) {            
            $.each(response, function(i, item) {
                list += `
                    <tr>
                        <td>
                            <span class="column-field-id ">
                                <a data-val="${escape(JSON.stringify(item))}" href="" data-id="${item.property}" class="page-detail-title edit-page-detail property-data">${item.property}</a>
                                <span class="column-field-page-option icon-menu pull-right"></span>
                            </span>
                        </td>
                        <td><span class="column-field-description">${item.description}</span></td>
                        <td><span class="column-field-picklist-definition">${item.picklist}</span></td>
                        <td><span class="column-field-description">${item.info}</span></td>
                        <td><span class="column-field-read-only">${item.readonly}</span></td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        displayLibraryCatchError('page-detail-table');
        return false;
    }
    setTimeout(function() { loadPagesDetailTable(list); }, 1000);
}

/**
 * Description: Load pages main table
 * @param {string} pgLists 
 */
function loadPagesDetailTable(pgLists = '') {
    try {
        destroyDataTableInstance('pages-detail-table');
        $('.pages-detail-panel .pages-detail-table').find('tbody').html(pgLists);
        $('.column-field-picklist-definition .select2').select2();
        initializePagesDetailDataTable('pages-detail-table');
        drawCallbackDataTable();
        loadPagesDetailTableContextMenu();
    } catch (error) {
        displayLibraryCatchError('page-detail-table');
        return false;
    }
}

/**
 * Description: Check page detail form changes
 * @param {array} event 
 */
async function checkPageDetailFormChanges(event) {
    try {
        var attrName = event.target.name;
        var attrValue = event.target.value;
        var pageData = await getIndexedDBStorage('pages');
        if(pageData) {
            pageData = pageData.find(page => { return page.ObjectId === getParamPageId() });
        }
        pageData = (pageData === undefined) ? {} : pageData;
        if(attrValue !== pageData[attrName] && attrValue) {
            if(event.type == 'itemAdded' || event.type == 'itemRemoved' || $(event.target).hasClass('tt-input')) { //tags input
                $(event.target).prev('.bootstrap-tagsinput').addClass('bk-yellow');
                // $(event.target).prev('.bootstrap-tagsinput').addClass('dropdown-menu-sortable');
            } else if(event.target.tagName === 'SELECT') { //select2
                $(event.target).next('.select2-container').find('.select2-selection').addClass('bk-yellow');
            } else {
                $(event.target).addClass('bk-yellow');
            }
        } else {
            if(event.type == 'itemAdded' || event.type == 'itemRemoved' || $(event.target).hasClass('tt-input')) { //tags input
                $(event.target).prev('.bootstrap-tagsinput').removeClass('bk-yellow');
            } else if(event.target.tagName === 'SELECT') { //select2
                $(event.target).next('.select2-container').find('.select2-selection').removeClass('bk-yellow');
            } else {
                $(event.target).removeClass('bk-yellow');
            }
        }
        updatePageDetailSaveButton();
    } catch (error) {
        alert(error);
        displayLibraryCatchError('page-detail-form');
        return false;
    }
}

/**
 * Description: Add custom tags input
 * @param {string} new_tag 
 */
function addCustomTagsInput(new_tag = '') {
    try {
        $('.pages-detail-panel .stepy-pages-detail-form .tags-input').tagsinput('add', {Name: new_tag});   
    } catch (error) {
        displayLibraryCatchError('page-detail-tags-colorpicker');
        return false;
    }
}

/**
 * Description: Add color picker tags input
 * @param {object} data 
 */
function addColorPickerTagsInput(data) {
    try {
        var new_tag = data.item.Name;
        var color_code = data.item.Color ? data.item.Color : defaultTagColor;
        var new_tag_class = new_tag.replace(/ /g,"-");
        $(`.tagsinput-${new_tag_class}-palette`).html(`<span class="palette">${new_tag}</span><span data-role="remove"></span>`);
        $(`.tagsinput-${new_tag_class}-palette .palette`).spectrum({
            color: color_code,
            showPalette: true,
            showPaletteOnly: true,
            showInitial: true,
            palette: tagPaletteColors,
            move: function(c) {
                $(this).parent().css('background-color', c.toHexString());
                $(this).parent().attr('label-color-code', c.toHexString());
            }
        });
        $(`.tagsinput-${new_tag_class}-palette`).css('background-color', color_code);
        $(`.tagsinput-${new_tag_class}-palette`).attr('label-color-code', color_code);
        setTimeout(function() {$(`.tagsinput-${new_tag_class}-palette .palette`).click();});   
    } catch (error) {
        displayLibraryCatchError('page-detail-tags-colorpicker');
        return false;
    }
}

/**
 * Description: Load pages detail table context menu
 */
function loadPagesDetailTableContextMenu() {
    try {
        $.contextMenu({
            selector: '.pages-detail-panel .pages-detail-table > tbody > tr > td span.column-field-page-option',
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
 * Page Name field keyup update
 */
$('.stepy-pages-detail-form').on('keyup','input[name=Name]', function (){    
    pageForm.find('input[name=Name]').val($(this).val());
});


function loadPageTagInputContextMenu() {    
    $.contextMenu({
        selector: '.bootstrap-tagsinput span',
        callback: function(key, options) {   
            // console.log('options',options.$trigger.context.innerText)               
            if(key === 'showhide'){                                               
                var TagValue = options.$trigger.context.innerText;  
                var classN = $('.tagsinput-'+TagValue+'-dimension i:first').attr('class');                
                if(classN == 'icon-eye2'){
                    $('.tagsinput-'+TagValue+'-dimension i:first').removeClass('icon-eye2');  
                    $('.tagsinput-'+TagValue+'-dimension i:first').addClass('icon-eye-blocked2');
                }else{
                    $('.tagsinput-'+TagValue+'-dimension i:first').removeClass('icon-eye-blocked2');  
                    $('.tagsinput-'+TagValue+'-dimension i:first').addClass('icon-eye2');
                }                
            }  
            if(key === 'lockunlock'){
                var TagValue = options.$trigger.context.innerText;                
                var classN = $('.tagsinput-'+TagValue+'-dimension i:last').attr('class');                
                if(classN == 'icon-unlocked2'){
                    $('.tagsinput-'+TagValue+'-dimension i:last').removeClass('icon-unlocked2');  
                    $('.tagsinput-'+TagValue+'-dimension i:last').addClass('icon-lock2');
                }else{
                    $('.tagsinput-'+TagValue+'-dimension i:last').removeClass('icon-lock2');  
                    $('.tagsinput-'+TagValue+'-dimension i:last').addClass('icon-unlocked2');
                }                              
            }    
            if(key === 'defaultmember'){
                var TagValue = options.$trigger.context.innerText;
                $('[data-id="' + TagValue + '"]').focus();
            }              
        },
        items: {
            "showhide": {
                name: "Show/Hide",
                icon: 'eye2',
                disabled: function(key, opt) {                    
                    if(!hasWriteAccess()){
                        return true;
                    }
                    return false;
                }
            },
            "lockunlock": {
                name: "Lock/Unlock",
                icon: 'lock2',
                disabled: function(key, opt) {
                    if(!hasWriteAccess()){
                        return true;
                    }
                    return false;
                }
            },
            "defaultmember": {
                name: "Default Memeber",
                icon: 'pencil7',
                disabled: function(key, opt) {
                    if(!hasWriteAccess()){
                        return true;
                    }
                    return false;
                }
            },            
        }
    });
}
function page_draganddrop(){
    var containers = $('.dropdown-menu-sortable').toArray(); 
    var drake = dragula(containers);
drake.on('drop', function (el, target, source, sibling) {
    mirrorContainer: document.querySelector('.dropdown-menu-sortable');
    $('.page_header').find('.dimension_values').addClass('Drag_Page');
    $('.row_header').find('.dimension_values').addClass('Drag_Row');
    $('.col_header').find('.dimension_values').addClass('Drag_Col');
//   console.log(el.children.length);
  if ($('.dimension_values').hasClass('Drag_Row')){    
    $('.row_header').find('.right_dim_value').hide();
    $('.row_header').find('.dim_colon').hide();         
    $('.row_header').find('.action').hide();            
    $('.row_header').find('.dimension_values').removeClass('Drag_Row');  
  }
  if ($('.dimension_values').hasClass('Drag_Col')){  
    $('.col_header').find('.dim_colon').show();                 
    $('.col_header').find('.right_dim_value').show();
    $('.col_header').find('.icon-eye2').hide();
    $('.col_header').find('.icon-unlocked2').hide();
    $('.col_header').find('.action').show();   
    $('.col_header').find('.dimension_values').removeClass('Drag_Col');  
  }
  if ($('.dimension_values').hasClass('Drag_Page')){    
    $('.page_header').find('.dim_colon').show();                 
    $('.page_header').find('.right_dim_value').show();
    $('.page_header').find('.action').show();   
    $('.page_header').find('.icon-eye2').show();
    $('.page_header').find('.icon-unlocked2').show();
    $('.page_header').find('.dimension_values').removeClass('Drag_Page');  
  }
}); 
}
