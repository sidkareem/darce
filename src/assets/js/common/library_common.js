/**
 * Description: Display library catch error
 * @param {string} action 
 */
function displayLibraryCatchError(action = '') {
    switch(action) {
        case "pages-main-table": 
            alert('Page table may not work properly because page meta data was either missing or not downloaded successfully.')
            break;
        case "type-filters": 
            alert('Type filters may not work properly because type filters meta data was either missing or not downloaded successfully.')
            break;
        case "sub-type-filters": 
            alert('Sub-type filters may not work properly because sub-type filters meta data was either missing or not downloaded successfully.')
            break;
        case "context-menu": 
            alert('Context menu may not work properly because context menu meta data was either missing or not downloaded successfully.')
            break;
        case "page-detail-form": 
            alert('Page detail form may not work properly because page detail meta data was either missing or not downloaded successfully.')
            break;
        case "page-detail-icons": 
            alert('Page detail icons may not work properly because page detail icons meta data was either missing or not downloaded successfully.')
            break;
        case "page-detail-primary-filters": 
            alert('Page detail primary filters may not work properly because page detail primary filters meta data was either missing or not downloaded successfully.')
            break;
        case "page-detail-tags": 
            alert('Tags may not work properly because tags meta data was either missing or not downloaded successfully.')
            break;
        case "page-detail-tags-colorpicker": 
            alert('Color picker may not work properly because color picker was not loaded successfully.')
            break;
        case "page-detail-owners": 
            alert('Owners may not work properly because owners meta data was either missing or not downloaded successfully.')
            break;
        case "page-detail-security": 
            alert('Security may not work properly because security meta data was either missing or not downloaded successfully.')
            break;
        case "page-detail-templates": 
            alert('Templates may not work properly because templates meta data was either missing or not downloaded successfully.')
            break;
        case "page-detail-table": 
            alert('Page detail table may not work properly because page detail meta data was either missing or not downloaded successfully.')
            break;
        case "primary-filters": 
            alert('Primary filters may not work properly because primary filter meta data was either missing or not downloaded successfully.')
            break;
        default:            
            alert('The web service call cannot reach the server. Please check your network connectivity and try again. If this issue continues to happen, please contact your technical support team for further assistance.');
        break;
    }
}

/**
 * Description: Call primary filter read bind webservice
 * @param {boolean} async 
 * @param {string} callback 
 */
function getWsPrimaryFilRBind(async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarPrimaryFilR>
                        <Env>${getEnvironment()}</Env>
                        <Name>%</Name>
                    </tns:ZdarPrimaryFilR>`;
    return callWebService(url, request, 'ZdarPrimaryFilRResponse', async, callback);
}

/**
 * Description: Call object type filter read bind webservice
 * @param {boolean} async 
 * @param {string} callback 
 */
function getWsOTypeFilterRBind(async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarOTypeFilR>
                        <Env>${getEnvironment()}</Env>
                        <Name>%</Name>
                    </tns:ZdarOTypeFilR>`;
    return callWebService(url, request, 'ZdarOTypeFilRResponse', async, callback);
}

/**
 * Description: Call object sub-type filter read bind webservice
 * @param {boolean} async 
 * @param {string} callback 
 */
function getWsOSubTypeFilterRBind(async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarSoTypeFilR>
                        <Env>${getEnvironment()}</Env>
                        <Name>%</Name>
                    </tns:ZdarSoTypeFilR>`;
    return callWebService(url, request, 'ZdarSoTypeFilRResponse', async, callback);
}

/**
 * Description: Call templates read bind webservice
 * @param {boolean} async 
 * @param {string} callback 
 */
function getWsZdarTmpltRBind(async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarTmpltR>
                        <Env>${getEnvironment()}</Env>
                        <Name>%</Name>
                    </tns:ZdarTmpltR>`;
    return callWebService(url, request, 'ZdarTmpltRResponse', async, callback);
}

/**
 * Description: Call object/page read bind webservice
 * @param {boolean} async 
 * @param {string} callback 
 */
function getWsObjectERBind(async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarObjER>
                        <Env>${getEnvironment()}</Env>
                        <Name>%</Name>
                    </tns:ZdarObjER>`;
    return callWebService(url, request, 'ZdarObjERResponse', async, callback);
}

/**
 * Description: Call tags read bind webservice
 * @param {string} Objectid 
 * @param {boolean} async 
 * @param {string} callback 
 */
function getWsTagsRBind(Objectid = '%', async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarTagsR>
                        <Objectid>${Objectid}</Objectid>
                    </tns:ZdarTagsR>`;
    return callWebService(url, request, 'ZdarTagsRResponse', async, callback);
}

/**
 * Description: Call page icons read webservice
 * @param {boolean} async 
 * @param {string} callback 
 */
function getWsPageIconsRBind(async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarPageIconsR>
                        <Env>${getEnvironment()}</Env>
                        <Name>%</Name>
                    </tns:ZdarPageIconsR>`;
    return callWebService(url, request, 'ZdarPageIconsRResponse', async, callback);
}

/**
 * Description: Call users and teams read webservice
 * @param {boolean} async 
 * @param {string} callback 
 */
function getWsUsersAndTeamsRBind(async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarUsersAndTeamsR>
                        <Env>${getEnvironment()}</Env>
                        <Name>%</Name>
                    </tns:ZdarUsersAndTeamsR>`;
    return callWebService(url, request, 'ZdarUsersAndTeamsRResponse', async, callback);
}

/**
 * Description: Call owners and security read web service
 * @param {string} Objectid 
 * @param {boolean} async 
 * @param {string} callback 
 */
function getWsZdarObjSecRBind(Objectid = '%', async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarObjSecR>
                        <Objectid>${Objectid}</Objectid>
                    </tns:ZdarObjSecR>`;
    return callWebService(url, request, 'ZdarObjSecRResponse', async, callback);
}

/**
 * Description: Initialize Pages Datatable
 * @param {string} tableClass 
 */
function initializePagesDataTable(tableClass = '') {
    $('.pages-main-table').removeAttr('width').DataTable( {
        sDom: 'Bfrtip',
        scrollY:       "calc(100vh - 330px)",
        scrollX:        true,
        sort: true,
        scrollCollapse: true,
        paging:         false,
        columnDefs: [
                {
                    targets: [3],
                    visible: false
                },
            { width: '250px', targets: 0 },
            { width: '90px', targets: 1 },
            { width: '120px', targets: 2 },
            { width: '120px', targets: 3 },
            { width: '120px', targets: 4 },
            { width: '200px', targets: 5 }, 
        ],
        fixedColumns: true,
buttons: [
            {
                extend: 'colvis',
                text: '<span class="pages-table-column-visibility"><icon class="icon-more2"></icon></span>'
            }
        ],
    } );
    // $('.' + tableClass).dataTable({
    //     //sDom: 'Bfrtip',
    //     paging: false, 
    //     info: false, 
    //     retrieve: true,
    //     sort: true,
    //     autoWidth: false,
    //     buttons: [
    //         {
    //             extend: 'colvis',
    //             text: '<span class="pages-table-column-visibility"><icon class="icon-more2"></icon></span>'
    //         }
    //     ],
    //     columnDefs: [
    //         {
    //             targets: [3],
    //             visible: false
    //         },
    //         { width: '100px', targets: 0 },
    //         { width: '100px', targets: 1 },
    //         { width: '100px', targets: 2 },
    //         { width: '100px', targets: 3 },
    //         { width: '100px', targets: 4 },
    //         { width: '200px', targets: 5 }, 
    //     ],
    //     //responsive: false,
    //     "scrollY": "calc(100vh - 330px)",
    //     "scrollCollapse": true
    // });
}

/**
 * Description: Initialize Pages Detail Datatable
 * @param {string} tableClass 
 */
function initializePagesDetailDataTable(tableClass = '') {
    $('.' + tableClass).dataTable({
        // sDom: 'Bfrtip',
        paging: false, 
        info: false, 
        retrieve: true,
        order: [],
        // sort: false,
        // buttons: [],
        responsive: true,
        // "scrollY": "calc(100vh - 400px)",
        // "scrollCollapse": true
    })
}

/**
 * Description: Convert single object to multidimentional array
 * @param {object} response 
 */
function convertToMultipleArray(response) {
    var res = [];
    if(typeof(response) !== 'undefined' && !$.isArray(response)){
        res.push(response);
    }else{
        res = response;
    }
    return res;
}

/**
 * Description: Load html content
 * @param {string} selector 
 * @param {string} url 
 * @param {string} callback 
 */
function loadHtmlContent(selector = '', url = '', callback = '') {
    $(selector).load(url+'?' + Math.random(), function( response, status, xhr ) {
        if ( status == "error" ) {
          displayLibraryCatchError();
          return false;
        }
    });
}

/**
 * Description: Get param page id
 */
function getParamPageId() {
    return $('#param-page-id').val();
}

/**
 * Description: Set param page id
 */
function setParamPageId(pageId = '') {
    $('#param-page-id').val(pageId);
}

/**
 * Description: Format page icon
 * @param {string} opt 
 */
function formatPageIcon(opt) {
    if (!opt.id) {
        return opt.text.toUpperCase();
    } 

    var opt_icon = opt.text;
    if(!opt_icon){
       return opt.text.toUpperCase();
    } else {
        var $opt = $(
           '<span><icon class="' + opt_icon.toLowerCase() + '"></icon> &nbsp;' + opt.text.toUpperCase() + '</span>'
        );
        return $opt;
    }
}

/**
 * Description: Check if the variable is an array
 * @param {array|string} str 
 */
function isArray(str) {
    return Array.isArray(str);
}

/**
 * Description: Check primary filter fancytree is initialized
 */
function isPrimaryFilterTreeInitialized() {
    return $(".primary-filter-fancytree .fancytree-container").length;
}

/**
 * Description: Clear page indexed db storage
 */
function clearPageIndexedDBStorage() {    
    setIndexedDBStorage('pages', '');
    setIndexedDBStorage('primary-filters', '');
    setIndexedDBStorage('type-filters', '');
    setIndexedDBStorage('sub-type-filters', '');
    setIndexedDBStorage('templates', '');
}

/**
 * Description: Redraw datatable
 * @param {string} selector 
 */
function drawCallbackDataTable(timeOut = 300) {
    setTimeout(function() {
        $($.fn.dataTable.tables( true ) ).css('width', '100%');
        $($.fn.dataTable.tables( true ) ).DataTable().columns.adjust().draw();
    }, timeOut);
}

/**
 * Description: Track page detail form changes
 */
function trackPageDetailFormChanges(callbackYes = '', selector = '#dialog-confirm', callbackNo = null) {
    var cbNo = callbackNo == null ? callbackYes : callbackNo;
    var len = $('.pages-detail-panel .stepy-pages-detail-form').find('.bk-yellow').length;    
    if(len > 1) {
        $(selector).dialog({
            resizable: false,
            height: "auto",
            width: 400,
            modal: true,
            buttons: {
                "Yes": function () {
                    $(selector).dialog('close');
                    callbackYes();
                },
                "No": function () {
                    $(selector).dialog('close');
                    cbNo();
                },
                "Cancel": function () {
                    $(selector).dialog('close');
                }
            }
        }).removeClass('hide');
    } else {
        callbackYes();
    }
}

/**
 * Description: Track page detail overwrite
 */
function trackPageDetailOverwrite(callback = '', selector = '#dialog-confirm') {
    var len = $('.pages-detail-panel .stepy-pages-detail-form').find('.bk-yellow').length;
    if(len > 1) {
        $(selector).dialog({
            resizable: false,
            height: "auto",
            width: 400,
            modal: true,
            buttons: {
                "Yes": function () {
                    $(selector).dialog('close');
                    callback();
                },
                "Cancel": function () {
                    $(selector).dialog('close');
                }
            }
        }).removeClass('hide');
    } else {
        callback();
    }
}

/**
 * Description: Get page variables
 * @param {boolean} forceReload 
 */
function getPageVariables(forceReload = false) {
    getPagePrimaryFilters(forceReload);
    getPageIcons(forceReload);
    // getPageTags(forceReload);
    getPageOwnersSecurity(forceReload);
    getPageTemplates(forceReload);
}

/**
 * Description: Get page primary filters
 * @param {boolean} forceReload 
 */
async function getPagePrimaryFilters(forceReload = false) {
    try {
        var response = await getIndexedDBStorage('primary-filters');
        if(!response || forceReload) {
            getWsPrimaryFilRBind(true, (res) => {
                var primaryFilters = convertToMultipleArray(res);
                if(isArray(primaryFilters)) {
                    var data = $.map(primaryFilters, function (c) {
                        c.id = c.Name;
                        c.title = c.Name;
                        c.parent = '';
                        c.folder = true;
                        return c;
                    });
                    setIndexedDBStorage('primary-filters', data);
                }
            });
            return false;
        }
    } catch (error) {
        displayLibraryCatchError('primary-filters');
        return false;
    }
}

/**
 * Description: Get page icons
 * @param {boolean} forceReload 
 */
async function getPageIcons(forceReload = false) {
    try {
        var response = await getIndexedDBStorage('icons');
        if(!response || forceReload) {
            getWsPageIconsRBind(true, (res) => {
                var response = convertToMultipleArray(res);
                setIndexedDBStorage('icons', response);
            });
        }
    } catch (error) {
        displayLibraryCatchError('page-detail-icons');
        return false;
    }
}

/**
 * Description: Get page tags
 * @param {boolean} forceReload 
 */
async function getPageTags(forceReload = false) {
    try {
        var response = await getIndexedDBStorage('tags');
        if(!response || forceReload) {
            getWsTagsRBind('%', true, (res) => {
                var response = convertToMultipleArray(res);
                setIndexedDBStorage('tags', response);
            });
        }
    } catch (error) {
        displayLibraryCatchError('page-detail-tags');
        return false;
    }
}

/**
 * Description: Get page owners & security
 * @param {boolean} forceReload 
 */
async function getPageOwnersSecurity(forceReload = false) {
    try {
        var response = await getIndexedDBStorage('security');
        if(!response || forceReload) {
            getWsUsersAndTeamsRBind(true, (res) => {
                var owners = res.Tusers.item;
                var security = res.Tteams.item;
                owners = convertToMultipleArray(owners);
                security = convertToMultipleArray(security);
                setIndexedDBStorage('owners', owners);
                setIndexedDBStorage('security', security);
            });
        }
    } catch (error) {
        displayLibraryCatchError('page-detail-security');
        return false;
    }
}

/**
 * Description: Get page templates
 * @param {boolean} forceReload 
 */
async function getPageTemplates(forceReload = false) {
    try {
        var response = await getIndexedDBStorage('templates');
        if(!response || forceReload) {
            getWsZdarTmpltRBind(true, (res) => {
                var response = convertToMultipleArray(res);
                setIndexedDBStorage('templates', response);
            });
        }
    } catch (error) {
        displayLibraryCatchError('page-detail-templates');
        return false;
    }
}

/**
 * Description: Set active sidebar
 * @param {string} action 
 */
function setActiveSidebar(action = '') {
    switch(action) {
        case "PAGE": 
            $('#drwn_pg_1003_100029').remove();
            $('#1003_102').click();
            break;
        default:
            $('#drwn_pg_1003_100029').remove();
            $('#1003_101').click();
            break;
    }
    drawCallbackDataTable(0);
}

/**
 * Description: Update page detail save button
 */
function updatePageDetailSaveButton() {
    let controlWizard = $('.pages-detail-panel .page-control-wizard');
    var len  = $('.stepy-pages-detail-form .bk-yellow').length;        
    if(len > 1) {
        controlWizard.find('.btn-action.page-save').addClass('btn-primary').removeClass('btn-grey disabled');
    } else {
        controlWizard.find('.btn-action.page-save').removeClass('btn-primary').addClass('btn-grey disabled');
    }
}

async function libPagesAdd() {
	var data = {};
	data.Name = $('.stepy-pages-detail-form input[name=Name]').val();
	
	var icon = $('.stepy-pages-detail-form select[name=Icon]').siblings('span').find('span.select2-selection__rendered').attr('title');
	
	data.Icon = icon == undefined || icon == null ? '' : icon.toUpperCase();
	data.Description =  $('.stepy-pages-detail-form textarea[name=Description]').val();
	data.Path = 'test path';
	
    var primaryFilter = $('.stepy-pages-detail-form select[name=PrimaryFilterId]').siblings('span').find('span.select2-selection__rendered').attr('title');
    if (primaryFilter) {
    	var primaryFilterLst = await getIndexedDBStorage('primary-filters');
    	
        if(!primaryFilterLst) {
        	getPagePrimaryFilters(false);
        	primaryFilterLst = await getIndexedDBStorage('primary-filters');
        }
        
        if (primaryFilterLst) {
        	if (primaryFilterLst.length) {
        		for (var i = 0; i < primaryFilterLst.length; i++) {
        			if (primaryFilter == primaryFilterLst[i].Name) {
        				data.PrimaryFilterId = primaryFilterLst[i].PrimaryFilterId;
        			}
        		}
        	}
        }
    }
    
    if (!data.PrimaryFilterId) {
    	data.PrimaryFilterId = '';
    }

	data.SoTypeFilId = '2';
	data.TemplateId = '3';
	data.DobjectId = 'HC_PLAN';
	data.HelpLink = 'help link';
	data.Popularity = '99';
	
	var tags = [
		{
			Name: 'tag_2',
			Description: 'test tag #2'
		},{
			Name: 'tag_3',
			Description: 'test tag #3'
		},{
			Name: 'tag_4',
			Description: 'test tag #4'
		}
	];
	
	//console.log(data,tags);
	
	/*var ret = updateWsPageBind(data,null,'',tags);
	ret.then(rs => {
		console.log(rs);
	})*/
	updateWsPageBind(data,null,'',tags);
}

function updateWsPageBind(TModify = null,TDelete = null,page,Ttags,callback) {
	var url = getConfig('zdar_calc_engine_bind');
	var request = `<tns:ZdarPagesEW>`;
	
	request += `<Page>${page}</Page>`;
	
	if (TDelete != null) {
		request += `<Tdelete>
			<PagesId>${TDelete.PagesId}</PagesId>
			<Environment>${getEnvironment()}</Environment>
			<Name>${TDelete.Name}</Name>
			<Icon></Icon>
			<Description></Description>
			<Path></Path>
			<PrimaryFilterId></PrimaryFilterId>
			<SoTypeFilId></SoTypeFilId>
			<TemplateId></TemplateId>
			<CreatedBy></CreatedBy>
			<CreatedOn></CreatedOn>
			<ModifiedBy></ModifiedBy>
			<ModifiedOn></ModifiedOn>
			<DobjectId></DobjectId>
			<HelpLink></HelpLink>
			<Popularity></Popularity>
		</Tdelete>`;	
	}
	else {
		request += ` <Tdelete>
		 </Tdelete>`;
	}
	
	if (TModify != null) {
		request += `<Tmodify>
			<PagesId>0</PagesId>
			<Environment>${getEnvironment()}</Environment>
			<Name>${TModify.Name}</Name>
			<Icon>${TModify.Icon}</Icon>
			<Description>${TModify.Description}</Description>
			<Path>${TModify.Path}</Path>
			<PrimaryFilterId>${TModify.PrimaryFilterId}</PrimaryFilterId>
			<SoTypeFilId>${TModify.SoTypeFilId}</SoTypeFilId>
			<TemplateId>${TModify.TemplateId}</TemplateId>
			<CreatedBy>X</CreatedBy>
			<CreatedOn>0</CreatedOn>
			<ModifiedBy>X</ModifiedBy>
			<ModifiedOn>0</ModifiedOn>
			<DobjectId>${TModify.DobjectId}</DobjectId>
			<HelpLink>${TModify.HelpLink}</HelpLink>
			<Popularity>${TModify.Popularity}</Popularity>
		</Tmodify>`;		
	}
	else {
		request += `<Tmodify></Tmodify>`;
	}
	
	if (Ttags) {
		if (Ttags.length) {
			request += `<Ttags>`;
			for (var i = 0; i < Ttags.length; i++) {
				request += `<item>
						<TagId>0</TagId>
						<Environment>${getEnvironment()}</Environment>
						<Name>${Ttags[i].Name}</Name>
						<Description>${Ttags[i].Description}</Description>
					</item>`;
			}
			request += `</Ttags>`;
		}
		else {
			request += `<Ttags></Ttags>`;
		}
	}
	else {
		request += `<Ttags></Ttags>`;
	}
	
	
	request += `</tns:ZdarPagesEW>`;
	
	return callWebService(url, request, 'ZdarPagesEWResponse', true, callback);
	
	/*return new Promise((rs,rj) => {
		try {
			function callBack(cdata) {
				//recall the data service to return date created
				rs(true);
			}
			callWebService(url, request, 'ZdarPagesEWResponse', true, callBack);
			
		}
		catch(err) {
			rj(err);
		}
	});*/
}

/**
 * Description: Pre fill mass upload tags input data
 */
function preFillMassUploadTagsInputData() {    
    // preFillMassUploadPageAxisData();
    // preFillMassUploadColumnAxisData();
    // preFillMassUploadRowAxisData();    
    // alert()
    // $('.page_taginput_class').append('<i class="icon-eye2"></i>'); 
    // $('.page_taginput_class').append('<i class="icon-unlocked2"></i>');
    // $('.page_taginput_class').append('<i class="caret drop_dw"></i>'); 
   
    // $('.pages-detail-panel .stepy-pages-detail-form .pages-detail-mass-upload-table input[name=HIDE]').trigger('change');
    page_draganddrop();
    $('.pages-detail-mass-upload-table-section').removeClass('hidden');    
}


// setTimeout(function(){
//     if ( $('.row_header' ).find( ".vertical-top" ) ) {
//         alert()
//         }
// }, 3000);
/**
 * Description: Pre fill mass upload page axis data
 */
function preFillMassUploadPageAxisData() {    
    var tableData = $('.pages-detail-mass-upload-table :input').serializeArray();
    $('.pages-detail-mass-upload-table-section').find('.page-axis').tagsinput('removeAll');
    $('.pages-detail-mass-upload-table-section').find('.bootstrap-tagsinput').addClass('dropdown-menu-sortable');
    
    // $('.dropdown-menu-sortable').add( "<p id='new'>new paragraph</p>" )
    // .css( "background-color", "red" );
    page_draganddrop();
    tableData.forEach(data => {
        if(data.name === 'PAGE') {            
            if(data.value == 'MEASURES'){
                $('.pages-detail-mass-upload-table-section').find('.page-axis').tagsinput('add', data.value+': PERIODIC');      
            }else if(data.value == 'TIME'){
                $('.pages-detail-mass-upload-table-section').find('.page-axis').tagsinput('add', data.value+': 2020.TOTAL');      
            }else if(data.value == 'VERSION'){
                $('.pages-detail-mass-upload-table-section').find('.page-axis').tagsinput('add', data.value+': ACTUAL');      
            }else{
                $('.pages-detail-mass-upload-table-section').find('.page-axis').tagsinput('add', data.value+': ALL_');  
            }           
        }
    });     
    
}

/**
 * Description: Pre fill mass upload column axis data
 */
function preFillMassUploadColumnAxisData() {
    var tableData = $('.pages-detail-mass-upload-table :input').serializeArray();
    $('.pages-detail-mass-upload-table-section').find('.column-axis').tagsinput('removeAll');
    tableData.forEach(data => {
        if(data.name === 'COLUMN') {
            $('.pages-detail-mass-upload-table-section').find('.column-axis').tagsinput('add', data.value);
        }
    });    
}

/**
 * Description: Pre fill mass upload row axis data
 */
function preFillMassUploadRowAxisData() {
    // alert()
    var tableData = $('.pages-detail-mass-upload-table :input').serializeArray();
    $('.pages-detail-mass-upload-table-section').find('.row-axis').tagsinput('removeAll');
    
    tableData.forEach(data => {
        if(data.name === 'ROW') {
            $('.pages-detail-mass-upload-table-section').find('.row-axis').tagsinput('add', data.value);
            // $('.tagsinput-'+TagValue+'-dimension i:first').removeClass('icon-eye2');
            // alert()
            // $('.dropdown-menu-sortable').find('span').remove();  
        }
    });    
}