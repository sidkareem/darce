$(document).ready(function() {
    getProjectsDetail();
    loadProjectContextMenu();
});

$('#search-projects').keyup(function() {
    $('.projects-main-table').DataTable().search($(this).val()).draw();
});

$('.projects-refresh-btn').on('click', function() {
    $('#search-projects').val('');
    getProjectsDetail();
});

// Add project id field
function addProjectIdField(action = 'add'){
    if(action === 'add'){
        $("#projects-modal .input-field-group").html('<input type="text" name="ProjectId" id="project-id" class="form-control input-field primary-id" placeholder="Please enter the project id here...">');
    }else{
        var rename_project_btn = '<span class="input-group-addon" id="rename-project-btn"><i class="icon-pencil7"></i></span>';
        var input_html = '<div class="input-group"><input type="text" name="ProjectId" id="project-id" class="form-control input-field" readonly>'+rename_project_btn+'</div>';
        $("#projects-modal .input-field-group").html(input_html);
    }
    $("#projects-modal .input-field-group").append('<span class="text-red project-error-message"></span>');
}

// Update project save button
function updateProjectSaveButton(action = 'add') {
    try {
        var flag = false;    
        if(action == 'add') {
            var projectForm = $('form#projects-form');
            var projectFormAction = projectForm.find('input[name=Action]').val();
            var ProjectId = projectForm.find('input[name=ProjectId]').val();
            var ProjectDescription = projectForm.find('select[name=ProjectDescription]').val();
            var ProjectIdError = projectForm.find('input[name=ProjectId]').closest('div').find('.text-red').html();
            var projectFormChanges = projectForm.find('.bk-yellow');
            if(ProjectId !== '' && ProjectDescription !== null && (ProjectIdError === '' || typeof(ProjectIdError) === 'undefined') && projectFormChanges.length > 0) {
                flag = true;
            }
    
            if(!flag) {
                if(projectFormAction === 'A' || projectFormChanges.length > 0) {
                    projectForm.find('.btn-submit').addClass('disabled').addClass('btn-primary').removeClass('btn-grey');
                    setTooltip('Saving is not allowed because some of the required fields are still left blank!', projectForm.find('.btn-submit'));
                } else {
                    projectForm.find('.btn-submit').addClass('btn-grey').removeClass('disabled').removeClass('btn-primary');
                    removeTooltip(projectForm.find('.btn-submit'));
                }
            } else {
                projectForm.find('.btn-submit').removeClass('btn-grey').removeClass('disabled').addClass('btn-primary');
                removeTooltip(projectForm.find('.btn-submit'));
            }
        } else if(action === 'rename' || action === 'copy') {
            var projectModalRename = $('#rename-project-modal');
            var projectModalRenameChanges = projectModalRename.find('.bk-yellow');
            var ProjectId = projectModalRename.find('input[name=ProjectId]').val();
            var ProjectIdError = projectModalRename.find('input[name=ProjectId]').closest('div').find('.text-red').html();
            if(ProjectId !== '' && $('#rename-copy-project-id').val() !== $('#default-project-id').val() && projectModalRenameChanges.length > 0 && (ProjectIdError === '' || typeof(ProjectIdError) === 'undefined')) {
                flag = true;
            }
    
            if(!flag) {
                if(projectModalRenameChanges.length === 0 && ProjectIdError.length === 0) {
                    projectModalRename.find('.btn-submit').addClass('btn-grey').removeClass('btn-primary').removeClass('disabled');
                    removeTooltip(projectModalRename.find('.btn-submit'));
                } else {
                    projectModalRename.find('.btn-submit').addClass('disabled').addClass('btn-primary').removeClass('btn-grey');
                    setTooltip('Saving is not allowed because some of the required fields are still left blank!', projectModalRename.find('.btn-submit'));
                }
            } else {
                projectModalRename.find('.btn-submit').removeClass('disabled').removeClass('btn-grey').addClass('btn-primary');
                removeTooltip(projectModalRename.find('.btn-submit'));
            }
        }
    } catch (error) {
        displayCatchError('project-save-error');
        return false;
    }
}

// Load project context menu
function loadProjectContextMenu() {
    try {
        $.contextMenu({
            selector: '.project-title',
            callback: function(key, options) {
                if(key === 'rename'){
                    renameProject($(this).attr('attr-id'), 'R', 'Rename Project');
                }else if(key === 'copy'){                  
                    renameProject($(this).attr('attr-id'), 'C', 'Copy Project');
                }else if(key === 'delete'){
                    deleteProject($(this).attr('attr-id'));
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

// Get projects detail
function getProjectsDetail(Dimension = 'PROJECTS') {
    try {
        $('.projects-refresh-btn').children().addClass('spin');
        getWsZdarDimInfoRBind(Dimension, '', true, getProjectsTableRowData);
    } catch (error) {
        displayCatchError('project-table');
        return false;
    }
}

// Get projects table row data
function getProjectsTableRowData(proLists = [], return_item = false) {
    var list = '';
    var projectLists = [];
    if(typeof(proLists) !== 'undefined' && !$.isArray(proLists)){
        projectLists.push(proLists);
    }else{
        projectLists = proLists;
    }
    if(typeof(projectLists) !== 'undefined' && projectLists !== '') {
        $.each(projectLists, function(i, item) {
            list += `
                <tr id="row_${item.Id}" class="row_${item.Id}">
                    <td>
                        <a href="" class="project-title edit-project" attr-id="${item.Id}">${item.Id}</a>
                        <input type="hidden" class="project_data" id="project_${item.Id}" value="${escape(JSON.stringify(item))}">
                    </td>
                    <td>${item.Description}</td>
                </tr>
            `;
        });
    }
    if(return_item) {
        return list;
    } else {
        loadProjectsTable(list);
    }
}

// Load projects table
function loadProjectsTable(proLists = []) {
    destroyDataTableInstance('projects-main-table');
    $('.projects-main-table').find('tbody').html(proLists);
    initializeProjectTable('projects-main-table');
    $('.projects-refresh-btn').children().removeClass('spin');
}

// Check project alredy exist
function checkProjectExist(project_id = '', ws_check = false){
    try {
        var exist = false;
        if($.trim(project_id) !== '' && typeof(project_id) !== 'undefined') {
            // client validation
            if(!ws_check) {
                if(typeof($('.projects-main-table tr#row_'+ project_id).html()) !== 'undefined'){
                    exist = `${project_id} already exists!`;
                }
            }
            // server validation
            if(!exist && ws_check) {
                var response = getWsDObjectsRBind(project_id);
                // var dsLists = [];
                // if(typeof(response) !== 'undefined' && !$.isArray(response)){
                //     dsLists.push(response);
                // }else{
                //     dsLists = response;
                // }
                // var projects_item_values = $.grep(dsLists, function (project, index) {
                //     return (project.DobjectId == project_id);
                // });
                if(typeof(response) !== 'undefined') {
                // if(projects_item_values.length > 0) {
                    // exist = `${project_id} already exists - user!`;
                    // exist = `${project_id} was already created by ${response.UserIdLastChange} on ${getFormattedDateTime(response.DateTimeLastChanged)}`;
                }
            }
        }
        return exist;
    } catch (error) {
        displayCatchError('project-data');
        return false;
    }
}

// Get project modify item data
function getProjectModifyItemData(item) {
    return `
        <tns:ZdarDimInfoW>
            <Page></Page>
            <Tmodify>
                <item>
                    <Environment>${getEnvironment()}</Environment>
                    <Dimension>PROJECTS</Dimension>
                    <Id>${item.Id}</Id>
                    <Description>${item.Description}</Description>
                </item>
            </Tmodify>
        </tns:ZdarDimInfoW>
    `;
}

// Get project copy item data
function getProjectCopyItemData(data) {
    return `<tns:ZdarDobjectsC>
        <Action>${data.Action}</Action>
        <Env>${getConfig('environment')}</Env>
        <Fromdobjectid>${data.Fromdobjectid}</Fromdobjectid>
        <Todobjectid>${data.Todobjectid}</Todobjectid>
        <Page>assets/js/common/common.js</Page>
    </tns:ZdarDobjectsC>`;
}

// Rename project
function renameProject(from_project_id,action,title) {
    try {
        if(from_project_id != '') {
            var copy_project_id = from_project_id;
            if(action == 'C'){
                var copy_id = '';
                var current_id = from_project_id;
                while(copy_id == ''){               
                    copy_id = getCopyID(current_id);
                    var exist = checkProjectExist(copy_id);
                    if(!exist){                    
                        copy_project_id = copy_id;
                    }else{
                        current_id = copy_id;
                        copy_id = '';
                    }
                }
            }
            $("#rename-project-modal .modal-title").html(title); 
            var check_default_field_exist = true;
            createDefaultValues("ds-dobject-id",copy_project_id,check_default_field_exist);
            $("#rename-copy-project-id").val(copy_project_id);
            $("#rename-copy-project-id").removeClass('bk-yellow');
            $("#default-project-id").val(from_project_id);        
            $("#project-modal-action").val(action);
            $(".project-error-message").text('');
            $('#rename-project-modal').modal({backdrop: 'static', keyboard: false});
            if(action == 'C'){
                $("#rename-copy-project-id").trigger('keyup');
            }
            updateProjectSaveButton('rename');
        }
    } catch (error) {
        displayCatchError('rename-project-error');
        return false;
    }
}

// Web service - project write
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

// Webservice - project copy
function WsDsourceC(requestData){
    var url = getConfig('zdar_calc_engine_bind');
    var response = callWebService(url, requestData, 'ZdarDobjectsCResponse');

    if(response) {
        return true;
    }
    return false;
}

// Confirm delete project
function confirmDeleteProject(project_id) {    
    loader('show',false);
    setTimeout(function() {
        try {
            if($('.projects-main-table tr.row_'+project_id)[0]){
                removeDataTableRow('.projects-main-table','.projects-main-table tr.row_'+project_id);
            }
            var form_values = [];
            form_values[0] = {'name':'DobjectId',value:project_id};
            var project_form_values = getArrayKeyValuePair(form_values);
            var request_items = getProjectModifyItemData(project_form_values);
            WsDsourceW(request_items, "D");
            setModels();
            setDimensionProperty();
            setLocalStorage('active_fancytree_node', '');
            setIndexedDBStorage('overall_calc_group_list', '');
            setFancyTree(true, true, generateFancyTreeCallback);
            $('#drwn_pg_1008_100010').remove();
        }
        catch (error) {
            displayCatchError('delete-project-error');
            return false;
        }
        loader('hide');
    },1);
}

// Delete project
function deleteProject(project_id = ''){    
    confirmDeletionDialog('<p>Are you sure want to delete this project?</p>', confirmDeleteProject, project_id);    
}