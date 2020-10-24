$(document).ready(function() {
    getDataSourcesDetail();
    loadDatasourceContextMenu();
});

$('#search-datasources').keyup(function() {
    $('.datasources-main-table').DataTable().search($(this).val()).draw();
});

$('.datasources-refresh-btn').on('click', function() {
    $('#search-datasources').val('');
    getDataSourcesDetail();
});

// Add datasource id field
function addDatasourceIdField(action = 'add'){
    if(action === 'add'){
        $("#datasources-modal .input-field-group").html('<input type="text" name="DobjectId" id="ds-dobject-id" class="form-control input-field primary-id">');
    }else{
        var rename_datasource_btn = '<span class="input-group-addon" id="rename-datasource-btn"><i class="icon-pencil7"></i></span>';
        var input_html = '<div class="input-group"><input type="text" name="DobjectId" id="ds-dobject-id" class="form-control input-field" readonly>'+rename_datasource_btn+'</div>';
        $("#datasources-modal .input-field-group").html(input_html);
    }
    $("#datasources-modal .input-field-group").append('<span class="text-red datasource-error-message"></span>');
}

// Update datasource save button
function updateDatasourceSaveButton(action = 'add') {
    try {
        var flag = false;    
        if(action == 'add') {
            var dsForm = $('form#datasources-form');
            var dsFormAction = dsForm.find('input[name=Action]').val();
            var DobjectId = dsForm.find('input[name=DobjectId]').val();
            var DobjectType = dsForm.find('select[name=DobjectType]').val();
            var DobjectDetail = dsForm.find('textarea[name=DobjectDetail]').val();
            var DobjectIdError = dsForm.find('input[name=DobjectId]').closest('div').find('.text-red').html();
            var dsFormChanges = dsForm.find('.bk-yellow');
            if(DobjectId !== '' && DobjectType !== null && DobjectDetail !== '' && (DobjectIdError === '' || typeof(DobjectIdError) === 'undefined') && dsFormChanges.length > 0) {
                flag = true;
            }
    
            if(!flag) {
                if(dsFormAction === 'A' || dsFormChanges.length > 0) {
                    dsForm.find('.btn-submit').addClass('disabled').addClass('btn-primary').removeClass('btn-grey');
                    setTooltip('Saving is not allowed because some of the required fields are still left blank!', dsForm.find('.btn-submit'));
                } else {
                    dsForm.find('.btn-submit').addClass('btn-grey').removeClass('disabled').removeClass('btn-primary');
                    removeTooltip(dsForm.find('.btn-submit'));
                }
            } else {
                dsForm.find('.btn-submit').removeClass('btn-grey').removeClass('disabled').addClass('btn-primary');
                removeTooltip(dsForm.find('.btn-submit'));
            }
        } else if(action === 'rename' || action === 'copy') {
            var dsModalRename = $('#rename-datasource-modal');
            var dsModalRenameChanges = dsModalRename.find('.bk-yellow');
            var DobjectId = dsModalRename.find('input[name=DobjectId]').val();
            var DobjectIdError = dsModalRename.find('input[name=DobjectId]').closest('div').find('.text-red').html();
            if(DobjectId !== '' && $('#rename-copy-datasource-id').val() !== $('#default-datasource-id').val() && dsModalRenameChanges.length > 0 && (DobjectIdError === '' || typeof(DobjectIdError) === 'undefined')) {
                flag = true;
            }
    
            if(!flag) {
                if(dsModalRenameChanges.length === 0 && DobjectIdError.length === 0) {
                    dsModalRename.find('.btn-submit').addClass('btn-grey').removeClass('btn-primary').removeClass('disabled');
                    removeTooltip(dsModalRename.find('.btn-submit'));
                } else {
                    dsModalRename.find('.btn-submit').addClass('disabled').addClass('btn-primary').removeClass('btn-grey');
                    setTooltip('Saving is not allowed because some of the required fields are still left blank!', dsModalRename.find('.btn-submit'));
                }
            } else {
                dsModalRename.find('.btn-submit').removeClass('disabled').removeClass('btn-grey').addClass('btn-primary');
                removeTooltip(dsModalRename.find('.btn-submit'));
            }
        }
    } catch (error) {
        displayCatchError('datasource-save-error');
        return false;
    }
}

// Load datasource context menu
function loadDatasourceContextMenu() {
    try {
        $.contextMenu({
            selector: '.datasource-title',
            callback: function(key, options) {
                if(key === 'rename'){
                    renameDataSource($(this).attr('attr-id'), 'R', 'Rename Datasource');
                }else if(key === 'copy'){                  
                    renameDataSource($(this).attr('attr-id'), 'C', 'Copy Datasource');
                }else if(key === 'delete'){
                    deleteDataSource($(this).attr('attr-id'));
                }
            },
            items: {
                "rename": {
                    name: "Rename",
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
        displayCatchError('context-menu-error');
        return false;
    }
}

// Get datasources detail
function getDataSourcesDetail(datasource_id = '%') {
    try {
        $('.datasources-refresh-btn').children().addClass('spin');
        getWsDObjectsRBind(datasource_id, true, getDataSourcesTableRowData);
    } catch (error) {
        displayCatchError('datasource-table');
        return false;
    }
}

// Get datasources table row data
function getDataSourcesTableRowData(dsLists = [], return_item = false) {
    var list = '';
    var dataSourcesLists = [];
    if(typeof(dsLists) !== 'undefined' && !$.isArray(dsLists)){
        dataSourcesLists.push(dsLists);
    }else{
        dataSourcesLists = dsLists;
    }
    if(typeof(dataSourcesLists) !== 'undefined' && dataSourcesLists !== '') {
        $.each(dataSourcesLists, function(i, item) {
            list += `
                <tr id="row_${item.DobjectId}" class="row_${item.DobjectId}">
                    <td>
                        <a href="" class="datasource-title edit-datasource" attr-id="${item.DobjectId}">${item.DobjectId}</a>
                        <input type="hidden" class="datasource_data" id="datasource_${item.DobjectId}" value="${escape(JSON.stringify(item))}">
                    </td>
                    <td>${item.DobjectDescr}</td>
                    <td>${item.DobjectType}</td>
                    <td>${item.DobjectDetail}</td>
                </tr>
            `;
        });
    }
    if(return_item) {
        return list;
    } else {
        loadDataSourcesTable(list);
    }
}

// Load datasources table
function loadDataSourcesTable(dsLists = []) {
    destroyDataTableInstance('datasources-main-table');
    $('.datasources-main-table').find('tbody').html(dsLists);
    initializeDataSourceTable('datasources-main-table');
    $('.datasources-refresh-btn').children().removeClass('spin');
}

// Check datasource alredy exist
function checkDatasourceExist(datasource_id = '', ws_check = false){
    try {
        var exist = false;
        if($.trim(datasource_id) !== '' && typeof(datasource_id) !== 'undefined') {
            // client validation
            if(!ws_check) {
                if(typeof($('.datasources-main-table tr#row_'+ datasource_id).html()) !== 'undefined'){
                    exist = `${datasource_id} already exists!`;
                }
            }
            // server validation
            if(!exist && ws_check) {
                var response = getWsDObjectsRBind(datasource_id);
                // var dsLists = [];
                // if(typeof(response) !== 'undefined' && !$.isArray(response)){
                //     dsLists.push(response);
                // }else{
                //     dsLists = response;
                // }
                // var datasources_item_values = $.grep(dsLists, function (datasource, index) {
                //     return (datasource.DobjectId == datasource_id);
                // });
                if(typeof(response) !== 'undefined') {
                // if(datasources_item_values.length > 0) {
                    // exist = `${datasource_id} already exists - user!`;
                    // exist = `${datasource_id} was already created by ${response.UserIdLastChange} on ${getFormattedDateTime(response.DateTimeLastChanged)}`;
                }
            }
        }
        return exist;
    } catch (error) {
        displayCatchError('datasource-data');
        return false;
    }
}

// Get datasource modify item data
function getDatasourceModifyItemData(data) {
    return `<item>
        <Environment>${getConfig('environment')}</Environment>
        <DobjectId>${data.DobjectId}</DobjectId>
        <DobjectDescr>${replaceSpecialCharacters(data.DobjectDescr)}</DobjectDescr>
        <DobjectType>${(typeof(data.DobjectType) !== 'undefined') ? data.DobjectType : ''}</DobjectType>
        <DobjectDetail>${data.DobjectDetail}</DobjectDetail>
        <DobjectAttr></DobjectAttr>
        <DateTimeLastChanged>${getLastChangedDateTime()}</DateTimeLastChanged>
        <UserIdLastChange>${getCurrentUserName()}</UserIdLastChange>
        <Page>assets/js/common/common.js</Page>                 			                            
    </item>`;
}

// Get datasource copy item data
function getDatasourceCopyItemData(data) {
    return `<tns:ZdarDobjectsC>
        <Action>${data.Action}</Action>
        <Env>${getConfig('environment')}</Env>
        <Fromdobjectid>${data.Fromdobjectid}</Fromdobjectid>
        <Todobjectid>${data.Todobjectid}</Todobjectid>
        <Page>assets/js/common/common.js</Page>
    </tns:ZdarDobjectsC>`;
}

// Rename datasource
function renameDataSource(from_datasource_id,action,title) {
    try {
        if(from_datasource_id != '') {
            var copy_datasource_id = from_datasource_id;
            if(action == 'C'){
                var copy_id = '';
                var current_id = from_datasource_id;
                while(copy_id == ''){               
                    copy_id = getCopyID(current_id);
                    var exist = checkDatasourceExist(copy_id);
                    if(!exist){                    
                        copy_datasource_id = copy_id;
                    }else{
                        current_id = copy_id;
                        copy_id = '';
                    }
                }
            }
            $("#rename-datasource-modal .modal-title").html(title); 
            var check_default_field_exist = true;
            createDefaultValues("ds-dobject-id",copy_datasource_id,check_default_field_exist);
            $("#rename-copy-datasource-id").val(copy_datasource_id);
            $("#rename-copy-datasource-id").removeClass('bk-yellow');
            $("#default-datasource-id").val(from_datasource_id);        
            $("#datasource-modal-action").val(action);
            $(".datasource-error-message").text('');
            $('#rename-datasource-modal').modal({backdrop: 'static', keyboard: false});
            if(action == 'C'){
                $("#rename-copy-datasource-id").trigger('keyup');
            }
            updateDatasourceSaveButton('rename');
        }
    } catch (error) {
        displayCatchError('rename-datasource-error');
        return false;
    }
}

// Web service - datasource write
function WsDsourceW(requestData, action = ''){
    var url = getConfig('zdar_calc_engine_bind');
    var emtpyItem =`<item>
            <Environment></Environment>
            <DobjectId></DobjectId>
            <DobjectDescr></DobjectDescr>
            <DobjectType></DobjectType>
            <DobjectDetail></DobjectDetail>
            <DobjectAttr></DobjectAttr>
            <DateTimeLastChanged></DateTimeLastChanged>
            <UserIdLastChange></UserIdLastChange>			                            
        </item>`;
    if(action == 'M'){
        var request = `<tns:ZdarDobjectsW>
                        <Tdelete>
                            `+emtpyItem+`
                        </Tdelete>
                        <Tmodify>`+requestData+`</Tmodify>
                        </tns:ZdarDobjectsW>`;
    }else if(action === "D"){
        var request = `<tns:ZdarDobjectsW>
                        <Tdelete>
                            `+requestData+`
                        </Tdelete>
                        <Tmodify>`+emtpyItem+`</Tmodify>
                        </tns:ZdarDobjectsW>`;
    }
    var response = callWebService(url, request, 'ZdarDobjectsWResponse');
    if(response) {
        return true;
    }
    return false;
}

// Webservice - datasource copy
function WsDsourceC(requestData){
    var url = getConfig('zdar_calc_engine_bind');
    var response = callWebService(url, requestData, 'ZdarDobjectsCResponse');

    if(response) {
        return true;
    }
    return false;
}

// Confirm delete datasource
function confirmDeleteDataSource(datasource_id) {    
    loader('show',false);
    setTimeout(function() {
        try {
            if($('.datasources-main-table tr.row_'+datasource_id)[0]){
                removeDataTableRow('.datasources-main-table','.datasources-main-table tr.row_'+datasource_id);
            }
            var form_values = [];
            form_values[0] = {'name':'DobjectId',value:datasource_id};
            var datasource_form_values = getArrayKeyValuePair(form_values);
            var request_items = getDatasourceModifyItemData(datasource_form_values);
            WsDsourceW(request_items, "D");
            setModels();
            setDimensionProperty();
            setLocalStorage('active_fancytree_node', '');
            setIndexedDBStorage('overall_calc_group_list', '');
            setFancyTree(true, true, generateFancyTreeCallback);
            $('#drwn_pg_1008_100010').remove();
        }
        catch (error) {
            displayCatchError('delete-datasource-error');
            return false;
        }
        loader('hide');
    },1);
}

// Delete datasource
function deleteDataSource(datasource_id = ''){    
    confirmDeletionDialog('<p>Are you sure want to delete this datasource?</p>', confirmDeleteDataSource, datasource_id);    
}