
$(document).on('click', '.add-projects-btn', function () {
    var dsForm = $('#projects-form');
    dsForm[0].reset();
    dsForm.find('input[name=Action]').val('A');
    dsForm.find('.bk-yellow').removeClass('bk-yellow');
    dsForm.find('.modal-title').html('Add Project');
    dsForm.find('.no-input-group').removeClass('hidden');
    dsForm.find('.input-group').addClass('hidden');
    addProjectIdField();
    initializeSelect2('.projects-main-section #projects-modal .projects-type');
    initializeModal('.projects-main-section #projects-modal');
    var check_default_field_exist = true;
    createDefaultValues("project-id", '', check_default_field_exist);
    createDefaultValues("project-descr", '', check_default_field_exist);
    updateProjectSaveButton();
});

$(document).on('click', '.edit-project', function (e) {
    e.preventDefault();
    try {
        var project_id = $(this).attr('attr-id');
        var response = JSON.parse(unescape($('.projects-main-table #project_' + project_id).val()));
        if (typeof response != "undefined" && response != "undefined") {
            var dsForm = $('#projects-form');
            dsForm[0].reset();
            addProjectIdField('edit');
            dsForm.find('input[name=ProjectId]').val(response.Id);
            dsForm.find('input[name=Action]').val('E');
            dsForm.find('.bk-yellow').removeClass('bk-yellow');
            dsForm.find('textarea[name=ProjectDescription]').val(response.Description);
            dsForm.find('.no-input-group').addClass('hidden');
            dsForm.find('.input-group').removeClass('hidden');
            dsForm.find('.modal-title').html('Edit Project');
            initializeSelect2('.projects-main-section #projects-modal .projects-type');
            initializeModal('.projects-main-section #projects-modal', 'show', 'static', false);
            var check_default_field_exist = true;
            createDefaultValues("project-id", response.Id, check_default_field_exist);
            createDefaultValues("project-descr", response.Description, check_default_field_exist);
        }
        updateProjectSaveButton();
    } catch (error) {
        displayCatchError('edit-project-error');
        return false;
    }
});

$(document).on('click', '#rename-project-btn', function () {
    if (!hasWriteAccess()) {
        return true;
    }
    var from_variable_id = $("#project-id").val();
    $("#projects-modal").modal('hide');
    var action = 'R';
    var title = "Rename Project";
    renameProject(from_variable_id, action, title);
});

$(document).on('keyup', '#projects-modal #project-description', function () {
    updateProjectSaveButton();
});

$(document).on('keyup', '#projects-modal .primary-id, #rename-project-modal .primary-id', function () {
    if (validateID(this, $(this).val(), false)) {
        var Fromdobjectid = ($(this).closest('form').find('input[name=Action]').val() === 'R') ? $(this).closest('form').find('input[name=Fromdobjectid]').val() : '';
        var exist = checkProjectExist($(this).val());
        if (exist && Fromdobjectid !== $(this).val()) {
            $(this).next('.text-red').html(exist);
        }
    }

    if (Fromdobjectid === $(this).val() && Fromdobjectid !== '') {
        $(this).removeClass('bk-yellow');
    } else {
        $(this).addClass('bk-yellow');
    }

    if ($(this).closest('form').find('input[name=Action]').val() === 'R' || $(this).closest('form').find('input[name=Action]').val() === 'C') {
        updateProjectSaveButton('rename');
    } else {
        updateProjectSaveButton();
    }
});

$(document).on('click', '#projects-modal .btn-submit.btn-primary:not(.disabled)', function () {
    var project_form = $(this).closest('form');
    var project_id = project_form.find('input[name=ProjectId]').val();
    loader('show', false);
    setTimeout(function () {
        try {
            if ($.trim(project_id) !== '' && typeof (project_id) !== 'undefined') {
                var form_values = project_form.serializeArray();
                var project_form_values = getArrayKeyValuePair(form_values, false);
                var exist = false;
                if (project_form_values['Action'] === 'A' || project_form_values['Action'] === 'E') {
                    if (project_form_values['Action'] === 'A') {
                        // var exist = checkProjectExist(project_id, true);
                        var exist = false;
                    }
                    if (!exist) {
                        project_form_values['Id'] = project_form_values['ProjectId'];
                        project_form_values['Description'] = project_form_values['ProjectDescription'];
                        var request_item = getProjectModifyItemData(project_form_values);
                        var response = WsZdarDimInfoW(request_item);
                        if (response) {
                            var table_row = getProjectsTableRowData(project_form_values, true);
                            if (project_form_values['Action'] === 'A') {
                                addDataTableRow('.projects-main-table', table_row, true);
                            } else {
                                updateDataTableRow('.projects-main-table', $('.projects-main-table .row_' + project_id), table_row);
                            }
                        }
                    } else {
                        project_form.find('input[name=ProjectId]').next('.text-red').html(exist);
                        updateProjectSaveButton();
                    }
                }
            }
        } catch (error) {
            displayCatchError('project-save-error');
            return false;
        }
        $('#projects-modal').modal('hide');
        loader('hide');
    }, 1);
});

$(document).on('click', '#rename-project-modal .btn-submit.btn-primary:not(.disabled)', function (evt) {
    evt.preventDefault();
    loader('show', false);
    var project_form = $(this).closest('form');
    var project_id = project_form.find('input[name=ProjectId]').val();
    setTimeout(function () {
        try {
            if ($.trim(project_id) !== '' && typeof (project_id) !== 'undefined' && validateID(project_form.find('input[name=ProjectId]'), project_id, false)) {
                var form_values = project_form.serializeArray();
                var project_form_values = getArrayKeyValuePair(form_values, false);
                var exist = false;
                if (project_form_values['Action'] === 'R' || project_form_values['Action'] === 'C') {
                    var fromDobjectId = project_form_values['Fromdobjectid'];
                    if (project_id !== fromDobjectId) {
                        exist = checkProjectExist(project_id, true);
                        if (!exist) {
                            project_form_values['Todobjectid'] = project_form_values['DobjectId'];
                            var temp_project_id = project_form.find('input[name=Tempdobjectid]').val();
                            if (temp_project_id != '') {
                                project_form_values['Fromdobjectid'] = temp_project_id;
                            }
                            delete project_form_values['DobjectId'];
                            delete project_form_values['Tempdobjectid'];
                            var request_item = getProjectCopyItemData(project_form_values);
                            var response = WsDsourceC(request_item);
                            if (response) {
                                var project_item_data = JSON.parse(unescape($('.projects-main-table #project_' + fromDobjectId).val()));
                                project_item_data.DobjectId = project_form_values['Todobjectid'];
                                table_row = getProjectsTableRowData(project_item_data, true);
                                if (project_form_values['Action'] === 'R') {
                                    setLocalStorage('active_fancytree_node', '');
                                    setIndexedDBStorage('overall_calc_group_list', '');
                                    updateDataTableRow('.projects-main-table', $('.projects-main-table .row_' + fromDobjectId), table_row);
                                    $('.projects-main-table tr.row_' + fromDobjectId).attr('id', 'row_' + project_item_data.DobjectId);
                                    $('.projects-main-table tr#row_' + project_item_data.DobjectId).removeClass('row_' + project_item_data.fromDobjectId).addClass('row_' + project_item_data.DobjectId);;
                                } else {
                                    addDataTableRow('.projects-main-table', table_row, true);
                                }                                                                   
                                setModels();                                
                                setDimensionProperty();
                                setFancyTree(true, true, generateFancyTreeCallback);
                                $('#drwn_pg_1008_100010').remove();
                                $('#rename-project-modal').modal('hide');                                                                             
                            }
                        } else {
                            project_form.find('input[name=DobjectId]').next('.text-red').html(exist);
                            updateProjectSaveButton();
                        }
                    } else {
                        $('#rename-project-modal').modal('hide');
                    }
                }
            }
        } catch (error) {
            displayCatchError('rename-project-error');
            return false;
        }
        loader('hide');
    }, 1);
});