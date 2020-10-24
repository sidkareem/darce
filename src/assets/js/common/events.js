
$(document).on('click', '.calc-group-refresh', function () {
    addSpin('.calc-group-refresh');
    if (!$(this).hasClass('active')) {
        setTimeout(function () {
            $('.calc-group-refresh').addClass('active');
            if ($('.calc-group-detail .nav-tabs li.calc-tab').hasClass('active')) {
                $('#param-load-calculation').val(1);
            } else if ($('.calc-group-detail .nav-tabs li.var-tab').hasClass('active')) {
                $('#param-load-variable').val(1);
            }
            var load_page = trackFormChanges('', true);
            if (load_page) {
                setLocalStorage('calc_group_detail_local_cache', '');
                var node = $(".fancytree-structure").fancytree("getActiveNode");
                $('#param-calc-group-id').val('');
                if (typeof node != 'undefined' && node != 'undefined' && node != null) {
                    node.tree.reactivate();
                } else {
                    var ft_key = $('#param-active-node-key').val();
                    setActiveNode(ft_key);
                }
            } else {
                addSpin('.tree-refresh');
            }
        }, 1);
    }
});
$(document).on('click', '.calc-group-list-refresh', function (e) {
    e.preventDefault();
    if (!$(this).hasClass('active')) {
        addSpin('.calc-group-list-refresh');
        $(this).addClass('active');
        setTimeout(async function () {
            await getCalcGroupLists(true);
            var node = $(".fancytree-structure").fancytree("getActiveNode");
            if (typeof node != 'undefined' && node != 'undefined' && node != null) {
                node.tree.reactivate();
            } else {
                var ft_key = $('#param-active-node-key').val();
                setActiveNode(ft_key);
            }
        }, 1);
    }
});
$(document).on('click', '.calculation-refresh', function () {
    $(this).addClass('active');
    addSpin('.calculation-refresh');
    var load_page = trackFormChanges('', true);
    if (load_page) {
        setLocalStorage('calc_detail_local_cache', '');
        if ($('#calculation-form-header .stepy-active span').html() == 'Driver') {
            var node = $(".fancytree-structure").fancytree("getActiveNode");
            if (typeof node != 'undefined' && node != 'undefined' && node != null) {
                node.tree.reactivate();
            } else {
                var ft_key = $("li." + getParamModelId() + "_" + getParamCalcGroupId() + " li." + getParamCalcId() + "_Drivers").attr('key');
                setActiveNode(ft_key);
            }
        } else if ($('#calculation-form-header .stepy-active span').html() == 'Step') {
            var node = $(".fancytree-structure").fancytree("getActiveNode");
            if (typeof node != 'undefined' && node != 'undefined' && node != null) {
                node.tree.reactivate();
            } else {
                var ft_key = $("li." + getParamModelId() + "_" + getParamCalcGroupId() + " li." + getParamCalcGroupId() + "_" + getParamCalcId() + " li." + getParamCalcId() + "_Steps").attr('key');
                setActiveNode(ft_key);
            }
        } else {
            calculationFancytreeReload();
            var node = $(".fancytree-structure").fancytree("getActiveNode");
            if (typeof node != 'undefined' && node != 'undefined' && node != null) {
                node.tree.reactivate();
            } else {
                var ft_key = $('#param-active-node-key').val();
                setActiveNode(ft_key);
            }
        }
    }
});

$(document).on('click', '.connect-environment-table > tbody > tr', function () {
    if (!$(this).hasClass('selected')) {
        $(this).closest('.connect-environment-table').find('.selected').removeClass('selected').removeAttr('env_change_trigger');
        $(this).addClass('selected').attr('env_change_trigger', 1);
    } else {
        $(this).removeClass('selected');
    }
});
$(document).on('click', '#environment_connecttion_change', function () {
    $('#connect-to-an-environment-modal').modal('hide');
    var user_info = getLocalStorage('user_info', false);
    var formtrack = true;
    if (user_info != null) {
        formtrack = trackFormChanges();
    }
    if (formtrack || user_info == null) {
        changeEnvironmentDialog();
    }
});
$(document).on('click', '#proceed_environment_connection', function () {
    var selected_evironment = $('table.connect-environment-table tr.selected td:first').html();
    var env_menu_list = getLocalStorage('env_menu_list', false);
    setLocalStorage('current_environment', selected_evironment, false);
    var new_env_menu_list = new Object();
    new_env_menu_list[0] = selected_evironment;
    if (env_menu_list) {
        $.each(env_menu_list, function (i, item) {
            if (_.size(new_env_menu_list) < 5 && !_isContains(new_env_menu_list, item)) {
                new_env_menu_list[++i] = item;
            }
        });
    }
    setLocalStorage('env_menu_list', new_env_menu_list, false);
    updateEnvironmentDropDown();
    $('#change-environment-modal').modal('hide');
    locationReload();
});
$(document).on('click', '.connect-environment ul.dropdown-menu .env a', function () {
    var selected_evironment = $(this).html();
    var environment_list = getLocalStorage('environment_list', false);
    if (selected_evironment != '') {
        var userHasAccess = environment_list.filter(function (calculation) { return calculation.Environment == selected_evironment });
        if (userHasAccess.length <= 0) {
            $('#dialog-sufficient-access-confirm').attr('cur-env', selected_evironment);
            sufficientAccessEnvironmentDialog();
        } else {
            $('table.connect-environment-table tr.selected').removeClass('selected');
            $('table.connect-environment-table tr#row_' + selected_evironment).addClass('selected').attr('env_change_trigger', 1);
            $('#environment_connecttion_change').trigger('click');
        }
    }
});
$(document).on('keyup', '#add-new-calc-group-modal #add-new-calc-group-id', function () {
    $(".calc-group-id-error").text('');
    if ($(this).val() != '') {
        $(this).addClass('bk-yellow');
    } else {
        $(this).removeClass('bk-yellow');
    }
    if (validateID(this, $(this).val())) {
        $('#add-new-calc-group-modal .btn-submit').removeClass('disabled');
        removeTooltip('#add-new-calc-group-modal .btn-submit');
        var check_exist = checkCalcGroupExist($(this).val());
        if (check_exist) {
            $("#add-new-calc-group-modal .calc-group-id-error").text(check_exist);
            $('#add-new-calc-group-modal .btn-submit').addClass('disabled');
            setTooltip('Saving is not allowed because some of the required fields are still left blank!', '#add-new-calc-group-modal .btn-submit');
            return true;
        }
    } else {
        $('#add-new-calc-group-modal .btn-submit').addClass('disabled');
        setTooltip('Saving is not allowed because some of the required fields are still left blank!', '#add-new-calc-group-modal .btn-submit');
    }
});
$(document).on('keyup', '#rename-copy-calc-group-id', function () {
    $(".calc-group-id-error").text('');
    if (validateID(this, $(this).val())) {
        $('#rename-calc-group-modal .btn-submit').removeClass('disabled');
        var FromCalcGroupId = $('#default-calc-group-id').val();
        var ToCalcGroupId = $(this).val();
        if (FromCalcGroupId != ToCalcGroupId) {
            $(this).addClass('bk-yellow');
            updateToPrimaryBtn('#rename-calc-group-modal .btn-submit');
            removeTooltip('#rename-calc-group-modal .btn-submit');
            var check_exist = checkCalcGroupExist($(this).val());
            if (check_exist) {
                $("#rename-calc-group-modal .calc-group-id-error").text(check_exist);
                $('#rename-calc-group-modal .btn-submit').addClass('disabled');
                setTooltip('Saving is not allowed because some of the required fields are still left blank!', '#rename-calc-group-modal .btn-submit');
            }
        } else {
            if ($('#calc-group-action').val() === 'R') {
                $(this).removeClass('bk-yellow');
                updateToGreyBtn('#rename-calc-group-modal .btn-submit');
                removeTooltip('#rename-calc-group-modal .btn-submit');
            }
            if ($('#calc-group-action').val() === 'C') {
                var check_exist = checkCalcGroupExist($(this).val());
                if (check_exist) {
                    $("#rename-calc-group-modal .calc-group-id-error").text(check_exist);
                    $('#rename-calc-group-modal .btn-submit').addClass('disabled');
                    setTooltip('Saving is not allowed because some of the required fields are still left blank!', '#rename-calc-group-modal .btn-submit');
                }
            }
        }
    } else {
        $('#rename-calc-group-modal .btn-submit').addClass('disabled');
        updateToPrimaryBtn('#rename-calc-group-modal .btn-submit');
        setTooltip('Saving is not allowed because some of the required fields are still left blank!', '#rename-calc-group-modal .btn-submit');
    }
    return true;
});

// Main navigation
$(document).on('click', '.navigation-main li > a.has-ul ', function (e) {
    e.preventDefault();

    // Collapsible
    $(this).parent('li').not('.disabled').not($('.sidebar-xs').not('.sidebar-xs-indicator').find('.navigation-main').children('li')).toggleClass('active').children('ul').slideToggle(250);

    // Accordion
    if ($('.navigation-main').hasClass('navigation-accordion')) {
        $(this).parent('li').not('.disabled').not($('.sidebar-xs').not('.sidebar-xs-indicator').find('.navigation-main').children('li')).siblings(':has(.has-ul)').removeClass('active').children('ul').slideUp(250);
    }
});

//Fancy Tree Page Script Start
$(document).on('click', '.tree-refresh:not(.spin)', function (e) {
    e.preventDefault();
    addSpin('.tree-refresh');
    resetDefaultWizardStep();
    if ($('.calculation-section')[0]) {
        calculationFancytreeReload(true);
    } else if ($('.cg-detail-form-content')[0]) {
        calcGroupFancytreeReload(true);
    } else if ($('.calc-group-overview')[0]) {
        calcModelFancytreeReload(true);
    }
    $("#param-form-track").val(1);
    asyncGenerateFancyTree();
});
//Fancy Tree Page Script End

// Calc Group Main Page Script Start
$(document).on("click", ".add-calc-group", function () {
    $('.sidebar-calc-group-lists').select2();
    if (getLocalStorage('fancytree_listview')) {
        var ft_key = $(".fancytree-structure li.root_" + getParamModelId()).attr('key');
        if (typeof ft_key != 'undefined' || ft_key != 'undefined') {
            setActiveNode(ft_key);
        }
    }
    $('#add-new-calc-group-modal .text-red').html('');
    $('#add-new-calc-group-modal').modal('show');
    $('#calc-group-modal-form [name="CalcGroupId"]').removeClass('bk-yellow');
    $('#calc-group-modal-form [name="CalcGroupId"]').val('');
    var calc_group_modal_form = $('#calc-group-modal-form');
    calc_group_modal_form.find('select[name=DsourceId]').val(getParamModelId());
    calc_group_modal_form.find('select[name=DsourceId]').select2();
    calc_group_modal_form.find('select[name=DsourceId]').trigger('change');
    calc_group_modal_form.find('.btn-submit').addClass('disabled');
    updateToPrimaryBtn(calc_group_modal_form.find('.btn-submit'));
    setTooltip('Saving is not allowed because some of the required fields are still left blank!', calc_group_modal_form.find('.btn-submit'));
});

$(document).on("click", ".edit-calc-group", function () {
    try {
        var calc_group_id = $(this).attr('attr-id');
        var ft_key = $("li." + getParamModelId() + "_" + calc_group_id).attr('key');
        if (ft_key !== '') {
            setActiveNode(ft_key);
        }
    } catch (error) {
        displayCatchError('fancytree-activate-error');
        return false;
    }
});

$(document).on("click", ".copy-calc-group", function () {
    renameCalcGroup($(this).attr('attr-id'));
});

$(document).on("click", ".delete-calc-group", function () {
    deleteCalcGroup($(this).attr('attr-id'));
});

$(document).on('click', '#rename-calc-group-modal .btn-submit.btn-primary:not(.disabled)', function (e) {
    e.preventDefault();
    loader('show');
    setTimeout(function () {
        try {
            $(".calc-group-id-error").text('');
            var Fromcalcgroupid = $("#default-calc-group-id").val();
            var Tocalcgroupid = $("#rename-copy-calc-group-id").val();
            var check_exist = checkCalcGroupExist($("#rename-copy-calc-group-id").val(), true);
            if (check_exist) {
                $(".calc-group-id-error").text(check_exist);
                return true;
            }
            var action = $("#calc-group-action").val();
            var form_values = {};
            var promise;
            form_values.Action = action;
            form_values.Fromcalcgroupid = Fromcalcgroupid;
            form_values.Tocalcgroupid = Tocalcgroupid;
            form_values.Model = getParamModelId();
            form_values.Page = 'assets/js/common/event.js';
            if ($('.cg-detail-form-content').length > 0) {
                promise = new Promise((res, rej) => {
                    if (action === 'R') {
                        var response = WsCalcGrpC(form_values);
                        if (response) {
                            var ft_key = $("li." + getParamModelId() + "_" + form_values.Fromcalcgroupid).attr('key');
                            if (typeof ft_key != 'undefined' || ft_key != 'undefined') {
                                ftRenameNode(ft_key, form_values.Tocalcgroupid, false, false);
                            }
                            $("#calc-group-id").val(form_values.Tocalcgroupid);
                            $('.calc-group-header .calc-group-heading').html(form_values.Tocalcgroupid);
                            $('#param-calc-group-id').val(form_values.Tocalcgroupid);
                            calcGroupFancytreeReload();
                            res('');
                        }
                        $("#rename-calc-group-modal").modal('hide');
                    }
                });
            } else {
                promise = new Promise(async (res, rej) => {
                    if (action === 'R') {
                        var response = WsCalcGrpC(form_values, true);
                        if (response) {
                            var updatedTr = await addCalcGroupTableRow(response);
                            updateDataTableRow('.calc-group-table', $('.calc-group-table .row_' + Fromcalcgroupid), updatedTr, '');
                            var ft_key = $("li." + getParamModelId() + "_" + form_values.Fromcalcgroupid).attr('key');
                            if (typeof ft_key != 'undefined' || ft_key != 'undefined') {
                                ftRenameNode(ft_key, form_values.Tocalcgroupid, false, false);
                            }
                            $('.calc-group-table .row_' + form_values.Fromcalcgroupid).removeClass('row_' + form_values.Fromcalcgroupid).addClass('row_' + form_values.Tocalcgroupid);
                            res('');
                        }
                    } else {
                        WsCalcGrpC(form_values);
                        var ft_key = $("li." + getParamModelId() + "_" + form_values.Fromcalcgroupid).attr('key');
                        if (typeof ft_key != 'undefined' || ft_key != 'undefined') {
                            var copied_key = ftCopyNode(ft_key, form_values.Tocalcgroupid, false, false, false);
                            res(setActiveNode(copied_key));
                        }
                    }
                });
                $("#rename-calc-group-modal #rename-copy-calc-group-id").removeClass('bk-yellow');
            }
            promise.then(() => {
                new Promise(async (resolve, reject) => {
                    await setFancyTree(true, true, generateFancyTreeCallback);
                    resolve('');
                }).then(() => {
                    getWsCalcGroupRBind(getParamModelId(), '%', true, updateOverAllCalcGroupList);
                    setLocalStorage('calc_group_detail_local_cache', '');
                    setLocalStorage('calc_detail_local_cache', '');
                });
            });
        } catch (error) {
            displayCatchError('rename-calc-group-error');
            return false;
        }
        loader('hide');
    }, 1);
    $('#rename-calc-group-modal').modal('hide');
});
// Calc Group Main Page Script End 

// Calc Group Detail Page Script Start
$(document).on('click', '.calc-group-back', function () {
    try {
        $(this).addClass('active');
        if ($('.calc-group-detail .nav-tabs li.calc-tab').hasClass('active')) {
            $('#param-load-calculation').val(1);
        }
        var node = $(".fancytree-structure").fancytree("getActiveNode");
        if (node !== null && node.getLevel() > 1) {
            setActiveNode(node.parent.key);
        } else {
            var ft_key = $("li." + getParamModelId() + "_" + getParamCalcGroupId()).attr('key');
            $('#param-calc-group-id').val('');
            setActiveNode(ft_key);
        }
    } catch (error) {
        displayCatchError('back-navigation');
        return false;
    }
});

$(document).on('click', '.helptext-btn', function () {
    $('#helptext-modal').find('#helptext-content').html('');
    var data_app = $(this).attr('data-app');
    var data_app_area = $(this).attr('data-app-area');
    var data_app_item = $(this).attr('data-app-item');
    var help_block = getHelpBlock(data_app, data_app_area, data_app_item);
    $('#helptext-modal').find('#helptext-content').html(help_block);
    $('#helptext-modal').modal('show');
});

$(document).on('click', '.update-run-criteria-btn', function () {
    var update_temp_field = false;
    if ($(this).hasClass('btn-primary')) {
        update_temp_field = true;
        updateButtonColor('run-criteria-btn', ['run-criteria']);
        eventupdateSaveButton();
    }
    if (!$(this).attr('data-dismiss')) {
        setPopover('RUN CRITERIA', $('#run-criteria').val(), '.run-criteria-btn', 'top');
    }
    updateFieldValue('run-criteria-btn', ['run-criteria'], update_temp_field, true);
});

$(document).on('click', '.run-criteria-btn', function () {
    $('#run-criteria-modal').modal({ backdrop: 'static', keyboard: false });
});

$(document).on('click', '.update-scope-adj-btn', function () {
    var update_temp_field = false;
    if ($(this).hasClass('btn-primary')) {
        update_temp_field = true;
        updateButtonColor('scope-adj-btn', ['pre-run-scope-adj', 'post-run-scope-adj']);
        eventupdateSaveButton();
    }
    if (!$(this).attr('data-dismiss')) {
        setPopover2('PRE RUN SCOPE ADJUSTMENT', $('#pre-run-scope-adj').val(), 'POST RUN SCOPE ADJUSTMENT', $('#post-run-scope-adj').val(), '.scope-adj-btn', 'top', 'custom');
    }
    updateFieldValue('scope-adj-btn', ['pre-run-scope-adj', 'post-run-scope-adj'], update_temp_field, true);
});

$(document).on('click', '.scope-adj-btn', function () {
    $('#scope-adjustment-modal').modal({ backdrop: 'static', keyboard: false });
});

$(document).on('click', '.update-index-dim-btn', function () {
    var update_temp_field = false;
    var tab = $(this).parent().closest('.modal-content').attr('attr-tab');
    if ($(this).hasClass('btn-primary')) {
        update_temp_field = true;
        updateButtonColor('index-dim-btn-' + tab, ['index-dim-' + tab]);
        eventupdateSaveButton();
    }
    if (!$(this).attr('data-dismiss')) {
        var selected = [];
        $('#index-dim-' + tab + ' option:selected').each(function () {
            selected.push([$(this).val(), $(this).data('order')]);
        });

        selected.sort(function (a, b) {
            return a[1] - b[1];
        });

        var IndexDims = '';
        for (var i = 0; i < selected.length; i++) {
            IndexDims += selected[i][0] + ', ';
        }
        IndexDims = IndexDims.substring(0, IndexDims.length - 2);
        setPopover('INDEX DIMENSIONS', IndexDims, '.index-dim-btn-' + tab, 'bottom');
    }
    updateFieldValue('index-dim-btn-' + tab, ['index-dim-' + tab], update_temp_field, false);
});

$(document).on('click', '.update-agg-dim-btn', function () {
    var update_temp_field = false;
    var tab = $(this).parent().closest('.modal-content').attr('attr-tab');
    var AggDims = $('#agg-dim-' + tab).val();

    AggDims = (AggDims !== null) ? AggDims.join(', ') : '';

    if ($(this).hasClass('btn-primary')) {
        update_temp_field = true;
        updateButtonColor('agg-dim-btn-' + tab, ['agg-dim-' + tab]);
        eventupdateSaveButton();
    }
    if (!$(this).attr('data-dismiss')) {
        setPopover('AGGREGATE DIMENSIONS', AggDims, '.agg-dim-btn-' + tab, 'bottom');
    }
    updateFieldValue('agg-dim-btn-' + tab, ['agg-dim-' + tab], update_temp_field, false);
});

$(document).on('keyup', '.input-field', function () {
    var default_value = this.defaultValue;
    if ($("#" + $(this).attr('id') + '-default').length > 0) {
        var default_value = $("#" + $(this).attr('id') + '-default').val();
    }

    if (this.value !== default_value) {
        $(this).addClass('bk-yellow');
    } else {
        $(this).removeClass('bk-yellow');
    }
    if ($(this).attr('attr-save-btn') != 'disable') {
        eventupdateSaveButton();
    }
});

$(document).on('change', '.select-field', function () {
    var change_background = false;
    if ($("#" + $(this).attr('id') + '-default').length > 0) {
        if (this.value !== $("#" + $(this).attr('id') + '-default').val()) {
            change_background = true;
        } else {
            change_background = false;
        }
    } else {
        if (!this.options[this.selectedIndex].defaultSelected) {
            change_background = true;
        } else {
            change_background = false;
        }
    }
    if (change_background) {
        $(this).next('.select2-container').find('.select2-selection').addClass('bk-yellow');
    } else {
        $(this).next('.select2-container').find('.select2-selection').removeClass('bk-yellow');
    }
    if ($(this).attr('attr-save-btn') != 'disable') {
        eventupdateSaveButton();
    }
});

$(document).on('change', '.datasources-tab .datasource-list', async function () {
    try {
        var selected_data = $(this).val();
        $(this).addClass('active');
        if (checkDataSourceExist(selected_data) && selected_data !== '') {
            alert('Datasource already exist.');
            $(this).val('');
            $(this).select2();
            updateSaveButton();
        } else {
            var model_id = $(this).val();
            var scope_dims_id = $(this).closest('.tab-pane').find('.dsource-form-groups .dimension-list').attr('id');
            var agg_dims_id = $(this).closest('.tab-pane').find('.advanced-options>div .col-xs-6:first-child .modal .dimension-list').attr('id');
            var index_dims_id = $(this).closest('.tab-pane').find('.advanced-options>div .col-xs-6:last-child .modal .dimension-list').attr('id');
            await listDimensions(model_id, '#' + scope_dims_id);
            await listDimensions(model_id, '#' + agg_dims_id);
            await listDimensions(model_id, '#' + index_dims_id);
            if ($(this).attr('id') === 'datasource-dsource-id-1') {
                await listDimensions('', '#variable-dimension');
                sortAscDropdownList('#variable-dimension');
            }
        }
        $(this).removeClass('active');
    } catch (error) {
        displayCatchError('dimension-list');
        return false;
    }
});

$(document).on('change', '.multiselect-field', function () {
    var new_val = $(this).val();
    var change_background = false;
    if ($("#" + $(this).attr('id') + '-default').length > 0) {
        var default_val = $("#" + $(this).attr('id') + '-default').val();
        if (default_val !== '') {
            default_val = default_val.split(",");
        } else {
            default_val = null;
        }
        if (new_val === null || default_val === null) {
            if (new_val !== default_val) {
                change_background = true;
            }
        } else {
            var new_val_length = new_val.length;
            var default_val_length = default_val.length;
            if (new_val_length === default_val_length) {
                $.each(new_val, function (event, val) {
                    if ($.inArray(val, default_val) === -1) {
                        change_background = true;
                        return false;
                    }
                });
            } else {
                change_background = true;
            }
        }
    } else {
        if (new_val !== null) {
            change_background = true;
        }
    }
    if (change_background) {
        $(this).closest('.multiselect-native-select').find('.multiselect').addClass('bk-yellow');
    } else {
        $(this).closest('.multiselect-native-select').find('.multiselect').removeClass('bk-yellow');
    }

    if ($(this).attr('attr-save-btn') != 'disable') {
        updateSaveButton();
    }
});

$(document).on("click", ".edit-variable", function () {
    try {
        var variable_id = $(this).attr('attr-id');
        if (variable_id !== '') {
            $("#param-variable-id").val(variable_id);
            $('#variable-modal').find('.bk-yellow').removeClass('bk-yellow');
            $('#variable-modal').find('.btn-primary').removeAttr('disabled');

            $('#variable-modal .CodeMirror').remove();
            addVariableIdField('edit');
            if (!hasWriteAccess()) {
                $('.input-group-addon').addClass('hide');
                disableFormInputModal('#variable-modal', 'View Variable');
            } else {
                $("#variable-modal .modal-title").html('Edit Variable');
            }
            $("#variable-id").val(variable_id);
            $("#variable-filter").val('');
            $("#variable-type").val('STANDARD');
            $("#variable-dimension").val('');
            $("#variable-action").val('E');
            $(".property-list").html('<option value="" selected="selected">&nbsp;</option>');
            $("#variable-property").val('');
            initializeCodeMirror("variable-filter");
            $('#variable-modal').modal({ backdrop: 'static', keyboard: false });
            $("#variable-modal .select-field").select2();
            $('#variable-modal .btn-submit').removeClass('btn-primary').removeClass('disabled').addClass('btn-grey');
            removeTooltip('#variable-modal .btn-submit');
            loadVariables();
        }
    } catch (error) {
        displayCatchError('cg-variable-data');
        return false;
    }
});

$(document).on("click", ".delete-variable", function () {
    try {
        var variable_id = $(this).attr('attr-id');
        var is_row_modified = checkRowModification(this);
        if (variable_id !== '' && !is_row_modified) {
            deleteVariable(variable_id);
        }
    } catch (error) {
        displayCatchError('delete-variable-error');
        return false;
    }
});

$(document).on("click", ".copy-variable", function () {
    copyVariable(this);
});

$(document).on("click", ".close-variable-modal", function () {
    $('#variable-modal').find('.bk-yellow').removeClass('bk-yellow');
    updateSaveButton();
    $('#variable-modal').modal('hide');
});

$(document).on('click', '#rename-calc-group-btn', function () {
    if (!hasWriteAccess()) {
        return true;
    }
    var from_calc_group_id = $('form#calc-group-detail-form').find('input[name=CalcGroupId]').val();
    renameCalcGroup(from_calc_group_id, 'R');
});

$(document).on('click', '#rename-calc-btn', function () {
    if (!hasWriteAccess()) {
        return true;
    }
    var from_calc_group_id = $('#calc-id').val();
    var action = 'R';
    var title = "Rename Calculation";
    renameCalculation(from_calc_group_id, action, title);
});

$(document).on('click', '.driver-id-rename', function () {
    if (!hasWriteAccess()) {
        return true;
    }
    var from_driver_id = $("#driver-id").val();
    $("#driver-modal").modal('hide');
    var action = 'R';
    var title = "Rename Driver";
    renameDriver(from_driver_id, action, title);
});

$(document).on('click', '#rename-variable-btn', function () {
    if (!hasWriteAccess()) {
        return true;
    }
    var from_variable_id = $("#variable-id").val();
    $("#variable-modal").modal('hide');
    var action = 'R';
    var title = "Rename Variable";
    renameVariable(from_variable_id, action, title);
});

$(document).on('click', '#variable-add-btn', function () {
    try {
        $('#variable-modal .CodeMirror').remove();
        $('#variable-modal').find('.bk-yellow').removeClass('bk-yellow');
        addVariableIdField('add');
        $("#variable-modal .modal-title").html('Add New Variable');
        $("#variable-id").val('');
        $("#variable-filter").val('');
        $("#variable-type").val('STANDARD');
        $("#variable-dimension").val('');
        $("#variable-action").val('A');
        $(".property-list").html('<option value="" selected="selected">&nbsp;</option><option value="ID">ID</option>');
        $("#variable-property").val('ID');
        var check_default_field_exist = true;
        createDefaultValues("variable-id", '', check_default_field_exist);
        createDefaultValues("variable-filter", '', check_default_field_exist);
        createDefaultValues("variable-type", 'STANDARD', check_default_field_exist);
        createDefaultValues("variable-dimension", '', check_default_field_exist);
        createDefaultValues("variable-property", '', check_default_field_exist);
        initializeCodeMirror("variable-filter");
        $('#variable-modal').modal({ backdrop: 'static', keyboard: false });
        // $('#variable-modal').find('.btn-primary').attr('disabled', 'disabled');
        $("#variable-modal .select-field").select2();
        $("#variable-dimension").select2({ allowClear: true });
        $("#variable-property").select2({ allowClear: true });
        $("#variable-property").trigger('change');
        $("#variable-id").trigger('keyup');
        $('#variable-modal .btn-submit').addClass('btn-primary').addClass('disabled').removeClass('btn-grey');
        setTooltip('Saving is not allowed because some of the required fields are still left blank!', '#variable-modal .btn-submit');
    } catch (error) {
        displayCatchError('add-variable-form-error');
        return false;
    }
});

$(document).on('click', '#calculation-driver-add-btn', function () {
    if ($('.calculation-driver-table').find('.bk-yellow').length > 0 || $('.calculation-step-table .bk-yellow').length > 0) {
        $("#param-context-menu-action").val('new-driver');
        var driverAddParams = new Object()
        if ($('.calculation-step-table').find('.bk-yellow').length > 0) {
            driverAddParams.selector = 'calculation-step-table'
            driverAddParams.selectorLen = $('.calculation-step-table').find('.bk-yellow').length
        } else if ($('.calculation-driver-table').find('.bk-yellow').length > 0) {
            driverAddParams.selector = 'calculation-driver-table'
            driverAddParams.selectorLen = $('.calculation-driver-table').find('.bk-yellow').length
        } else if ($('.calculation-driver-table').find('.bk-yellow').length > 0 && $('.calculation-step-table').find('.bk-yellow').length > 0) {
            driverAddParams.selector = 'calculation-driver-table'
            driverAddParams.selector_1 = 'calculation-step-table'
            driverAddParams.selectorLen = $('.calculation-driver-table').find('.bk-yellow').length
        }
        trackFormChanges('', false, true, driverAddParams);
        return false;
    }
    openDriverForm('', 'add');
});

$(document).on('click', '#calculation-select-existing-btn', function () {
    try {
        if ($('#param-calculations-sort-order').val() > 0 || $('.calculations-table').find('.bk-yellow').length > 0) {
            $('#param-calc-add-existing').val(1);
            trackFormChanges();
            return false;
        }
        $('#select-existing-calculation-modal').modal({ backdrop: 'static', keyboard: false });
        var option = '';
        var datasource_list = getCalcGroupDetailLocalCache('DOBJECT_DATA', getParamCalcGroupId());
        var data_sources = [];
        if (typeof (datasource_list) !== 'undefined' && !$.isArray(datasource_list)) {
            data_sources.push(datasource_list);
        } else {
            data_sources = datasource_list;
        }
        $.each(data_sources, function (i, item) {
            option += `<option value="${item.DobjectId}">${item.DobjectId}</option>`;
        });
        $("#select-existing-calc-model-field").html(option);
        $("#select-existing-calc-model-field").val(getParamModelId());
        $("#select-existing-calc-model-field").select2();
        $("#select-existing-calc-model-field").trigger('change');
    } catch (error) {
        displayCatchError('add-existing-calculation-form-error');
        return false;
    }
});

$(document).on('click', '.scroller.scroller-left', function () {
    tabScroller('left');
});

$(document).on('click', '.scroller.scroller-right', function () {
    tabScroller('right');
});

$(document).on('click', '.calc-tab, .var-tab', function () {
    $('.calculations-tab, .variables-tab').floatingScroll('update');
});


$(document).on('click', '.calc-group-save', function () {
    $(this).addClass('active');
    if ($('.calc-group-detail .nav-tabs li.calc-tab').hasClass('active')) {
        $('#param-load-calculation').val(1);
    }
    if ($(this).hasClass('btn-primary') && !$(this).hasClass('disabled')) {
        loader('show', saveCalcGroup);
    }
});

$(document).on('click', '.calculation-save', function () {
    if ($(this).hasClass('btn-primary') && !$(this).hasClass('disabled')) {
        loader('show', saveCalculation);
    }
});

$(document).on('change', "#variable-dimension", async function () {
    var dimension_id = $(this).val();
    $('#variable-modal #variable-property').val('');
    $('#variable-modal #variable-property').next('.select2-container').find('.select2-selection').removeClass('bk-yellow');
    if (dimension_id !== '') {
        await listProperties(dimension_id);
        sortAscDropdownList('#variable-modal #variable-property')
        if ($("#variable-dimension-default").val() === $("#variable-modal #variable-dimension").val()) {
            $("#variable-property").val($("#variable-property-default").val()).select2();
        } else {
            $("#variable-property").val('ID').select2();
        }
        $("#variable-property").trigger('change');
    }
});
// Calc Group Detail Page Script End

// Calculation Detail Page Script Start
function loadCalculationForm() {
    $("#content").load('assets/spaces/darce/cg_detail/calc_detail.html?' + Math.random());
    loadFormContent('assets/spaces/darce/forms/step_form.html?' + Math.random(), 'step-modal');
    loadFormContent('assets/spaces/darce/forms/driver_form.html?' + Math.random(), 'driver-modal');
}

$(document).on("click", ".edit-calculation, .fancytree-calculation-table td.sidebar-calc-data", function () {
    if ($('.fancytree-calc-structure').is(':visible')) {
        var calculation_id = $(this).parent().attr('attr-id');
        var calcItemData = JSON.parse(unescape($(".fancytree-calculation-table .calc_" + calculation_id).val()));
    } else {
        var calculation_id = $(this).attr('attr-id');
        var calcItemData = JSON.parse(unescape($(".calculations-table #calc_" + calculation_id).val()));
    }
    $('.fancytree-calculation-table tr').removeClass('active-row');
    $('.fancytree-calculation-table .row_' + calculation_id).addClass('active-row');
    if (typeof calcItemData.isNew != 'undefined' && calcItemData.isNew == 1) {
        confirmCalcEditDialog();
    } else {
        var ft_key = $("li." + getParamModelId() + "_" + getParamCalcGroupId() + " li." + getParamCalcGroupId() + "_" + calculation_id).attr('key');
        if (typeof ft_key != 'undefined' || ft_key != 'undefined') {
            try {
                setActiveNode(ft_key);
            } catch (error) {
                displayCatchError('fancytree-activate-error');
                return false;
            }
        }
    }
    return true;
});
$(document).on('click', '.calculation-back', function () {
    try {
        calculation_id = getParamCalcId();
        $(this).addClass('active');
        if (calculation_id !== '') {
            var ft_key = $("li." + getParamModelId() + "_" + getParamCalcGroupId()).attr('key');
            if (typeof ft_key != 'undefined' && ft_key != 'undefined') {
                setActiveNode(ft_key);
            }
        } else {
            $(".fancytree-structure").fancytree("getTree").reactivate();
        }
        $('#param-load-calculation').val(1);
    } catch (error) {
        displayCatchError('back-navigation');
        return false;
    }
});
$(document).on("click", ".copy-calculation", function () {
    var calculation_id = $(this).attr('attr-id');
    copyCalculation(calculation_id);
});
$(document).on("click", ".delete-calculation", function () {
    var calculation_id = $(this).attr('attr-id');
    var is_row_modified = checkRowModification(this);
    if (calculation_id !== '' && !is_row_modified) {
        deleteCalculation(calculation_id);
    }
});
$(document).on("change", "#driver-type", function () {
    $('.dependent-data').removeClass('hidden');
    $('.dependent-data').addClass('hidden');
    if (this.value === 'MASTER_DATA') {
        $('.master-data').removeClass('hidden');
    } else {
        $('.data-object').removeClass('hidden');
    }
});
$(document).on('click', '#calculation-step-add-btn', function () {
    if ($('#param-calculations-sort-order').val() > 0 || ($('.calculation-step-table').find('.bk-yellow').length > 0 || $('.calculation-driver-table').find('.bk-yellow').length > 0)) {
        $("#param-context-menu-action").val('new-step');
        var stepAddParams = new Object()
        if ($('.calculation-step-table').find('.bk-yellow').length > 0) {
            stepAddParams.selector = 'calculation-step-table'
            stepAddParams.selectorLen = $('.calculation-step-table').find('.bk-yellow').length
        } else if ($('.calculation-driver-table').find('.bk-yellow').length > 0) {
            stepAddParams.selector = 'calculation-driver-table'
            stepAddParams.selectorLen = $('.calculation-driver-table').find('.bk-yellow').length
        } else if ($('.calculation-driver-table').find('.bk-yellow').length > 0 && $('.calculation-step-table').find('.bk-yellow').length > 0) {
            stepAddParams.selector = 'calculation-driver-table'
            stepAddParams.selector_1 = 'calculation-step-table'
            stepAddParams.selectorLen = $('.calculation-driver-table').find('.bk-yellow').length
        }
        trackFormChanges('', false, true, stepAddParams);
        return false;
    }
    openStepForm('', 'add');
});

$(document).on('click', '#step-modal .btn-submit.btn-primary:not(.disabled)', function (e) {
    e.preventDefault();
    loader('show', false);
    setTimeout(function () {
        try {
            var step_form_values = $("#step-form").serializeArray();
            step_form_values = getArrayKeyValuePair(step_form_values, false);
            step_form_values.Enabled = (step_form_values.Enabled == 'on') ? '-1' : '0';
            step_form_values.ReuseResultsInCalc = (step_form_values.ReuseResultsInCalc == 'on') ? '-1' : '0';
            step_form_values.ReuseResultsInGrp = (step_form_values.ReuseResultsInGrp == 'on') ? '-1' : '0';
            step_form_values.WriteResults = (step_form_values.WriteResults == 'on') ? '-1' : '0';
            if (step_form_values.step_action === 'add') {
                var check_step_exist = checkStepIdExist(step_form_values.StepId, true);
                if (check_step_exist) {
                    $('.step-error-message').html(check_step_exist);
                    loader('hide');
                    return false;
                }
            }

            if (step_form_values.step_action == 'edit') {
                delete step_form_values['step_action'];
                var originalStepData = JSON.parse(unescape($('.calculation-step-table #step_' + step_form_values.StepId).val()));
                var updated = false;
                step_form_values['StepOrder'] = originalStepData['StepOrder'];
                jQuery.each(originalStepData, function (i, key) {
                    if (originalStepData[i] !== step_form_values[i]) {
                        updated = true;
                    }
                });
                if (updated) {
                    var stepItemData = {};
                    stepItemData[0] = step_form_values;
                    WsCalcDtlW(stepItemData, 'M');
                }
            } else if (step_form_values.step_action === 'add') {
                step_form_values.StepId = formattedID(step_form_values.StepId);
                var newStepOrder = getMaxStepOrderNumber() + 1;
                step_form_values.StepOrder = ("0000" + newStepOrder).substr(-4, 4);
                var stepItemData = {};
                stepItemData[0] = step_form_values;
                var promise = new Promise((res, rej) => {
                    res(WsCalcDtlW(stepItemData, 'M'));
                });
                promise.then(() => {
                    var ft_key = $("li." + getParamModelId() + "_" + getParamCalcGroupId() + " li." + getParamCalcGroupId() + "_" + getParamCalcId() + " li." + getParamCalcId() + '_Steps').attr('key');
                    ftaddNode(ft_key, step_form_values.StepId, 'icon-make-group', true);
                    updateFancyTreeGroup(getParamCalcGroupId(), getParamModelId(), '', { calc_id: getParamCalcId(), action: 'U' }, false);
                });
            }
            $('#step-modal').modal('hide');
            updateStepDataTable();
            scrollToBottom('.calculation-step-table-responsive', '.calculation-step-table');
        } catch (error) {
            displayCatchError('step-save-error');
            return false;
        }
    }, 1);
});

$(document).on('click', '#driver-modal .btn-submit.btn-primary:not(.disabled)', function (e) {
    e.preventDefault();
    calculationFancytreeReload(true);
    loader('show', false);
    setTimeout(function () {
        try {
            var driver_id = $('#driver-id').val();
            var form_values = $("#driver-form").serializeArray();
            var driver_form_vaules = getArrayKeyValuePair(form_values, false);
            if ($.trim(driver_id) === '') {
                $(".driver-error-message").text('Please enter Driver ID.');
                return false;
            }
            driver_id = formattedID(driver_id);
            if (driver_form_vaules['DriverAction'] === 'add') {
                var check_exist = checkDriverExist(driver_id, true);
                if (check_exist) {
                    $(".driver-error-message").text(check_exist);
                    return false;
                }
            }
            driver_form_vaules.DriverId = driver_id;
            if (driver_form_vaules.DriverType === 'MASTER_DATA') {
                driver_form_vaules.SourceId = '';
            } else {
                driver_form_vaules.Dimension = '';
                driver_form_vaules.DimAttribute = '';
            }
            $(".driver-error-message").text('');
            if ($('#driver-modal').find('.bk-yellow').length > 0) {
                if (driver_form_vaules['DriverAction'] === 'edit') {
                    driver_form_vaules.DriverId = driver_form_vaules.DriverId;
                    driver_form_vaules.CalcId = getParamCalcId();
                    driverItemData = JSON.parse(unescape($("#driver_" + driver_id).val()));
                    driver_form_vaules.Enabled = driverItemData.Enabled;
                    var requestDriverItem = [];
                    requestDriverItem[0] = driver_form_vaules;
                    WsCalcDrvW(requestDriverItem, 'M');
                } else if (driver_form_vaules['DriverAction'] === 'add') {
                    driver_form_vaules.DriverId = driver_form_vaules.DriverId;
                    driver_form_vaules.Enabled = 'Y';
                    driver_form_vaules.CalcId = getParamCalcId();
                    var requestDriverItem = [];
                    requestDriverItem[0] = driver_form_vaules;
                    var promise = new Promise((res, rej) => {
                        res(WsCalcDrvW(requestDriverItem, 'M'));
                    });
                    promise.then(() => {
                        var ft_key = $("li." + getParamModelId() + "_" + getParamCalcGroupId() + " li." + getParamCalcGroupId() + "_" + getParamCalcId() + " li." + getParamCalcId() + '_Drivers').attr('key');
                        ftaddNode(ft_key, driver_form_vaules.DriverId, 'icon-percent', true, true);
                        updateFancyTreeGroup(getParamCalcGroupId(), getParamModelId(), '', { calc_id: getParamCalcId(), action: 'U' }, false);
                    })
                }
                $("#driver-modal").modal('hide');
                updateDriverDataTable();
                loader('hide', false);
                $('#driver-modal').find('.bk-yellow').removeClass('bk-yellow');

            } else {
                $("#driver-modal").modal('hide');
            }
        } catch (error) {
            displayCatchError('driver-save-error');
            return false;
        }
        loader('hide');
    }, 1);
});
$(document).on('click', '#rename-driver-modal .btn-submit.btn-primary:not(.disabled)', function (e) {
    e.preventDefault();
    var Todriverid = $("#rename-copy-driver-id").val();
    var action = $("#driver-modal-action").val();
    Todriverid = formattedID(Todriverid);// remove whitespace from ID; 
    Fromdriverid = $("#default-driver-id").val();
    loader('show', false);
    setTimeout(function () {
        try {
            $(".rename-driver-error-message").text('');
            var check_driver_exist = checkDriverExist(Todriverid, true);
            if (check_driver_exist) {
                $(".rename-driver-error-message").text(check_driver_exist);
                return false;
            }

            var form_values = {};
            form_values.Action = action
            form_values.CalcId = getParamCalcId();
            form_values.Fromdriverid = Fromdriverid;
            form_values.DriverId = Todriverid;

            driverItemData = JSON.parse(unescape($('.calculation-driver-table #driver_' + form_values.Fromdriverid).val()));
            driverItemData.DriverId = form_values.DriverId;
            var promise = new Promise((res, rej) => {
                res(WsCalcDrvC(form_values));
            });
            promise.then(() => {
                var ft_key = $("li." + getParamModelId() + "_" + getParamCalcGroupId() + " li." + getParamCalcGroupId() + "_" + getParamCalcId() + " li.Drivers_" + Fromdriverid).attr('key');
                if (action === 'R') {
                    ftRenameNode(ft_key, form_values.DriverId, true);
                } else {
                    ftCopyNode(ft_key, form_values.DriverId, false, true);
                }
                updateFancyTreeGroup(getParamCalcGroupId(), getParamModelId(), '', { calc_id: getParamCalcId(), action: 'U' }, false);
            });
            $('#rename-driver-modal #rename-copy-driver-id').removeClass('bk-yellow');
            $('#rename-driver-modal').modal('hide');
            updateDriverDataTable();
            loader('hide');
        } catch (error) {
            displayCatchError('driver-rename-error');
            return false;
        }
    }, 1);
});
$(document).on('click', '#rename-step-modal .btn-submit.btn-primary:not(.disabled)', function (e) {
    e.preventDefault();
    loader('show', false);
    setTimeout(function () {
        try {
            var Fromstepid = $('#default-step-id').val();
            var Tostepid = $('#rename-copy-step-id').val();
            Tostepid = formattedID(Tostepid)// remove whitespace from ID;
            var stepModalAction = $('#rename-step-modal-action').val();
            $('#rename-step-modal .step-error-message').html('');
            if (Fromstepid != Tostepid) {
                var check_step_exist = checkStepIdExist(Tostepid, true);
                if (check_step_exist) {
                    $('#rename-step-modal .step-error-message').html(check_step_exist);
                    return false;
                }
            }

            if (Fromstepid != Tostepid) {
                stepItemData = JSON.parse(unescape($('.calculation-step-table #step_' + Fromstepid).val()));
                stepItemData.StepId = Tostepid;
                stepItemData.Fromstepid = Fromstepid;
                stepItemData.Action = stepModalAction;

                var requestStepData = {};
                if (stepModalAction === 'C') {
                    var newStepOrder = getMaxStepOrderNumber() + 1;
                    stepItemData.StepOrder = ("0000" + newStepOrder).substr(-4, 4);
                    requestStepData[0] = stepItemData;
                } else if (stepModalAction === 'R') {
                    stepItemData.StepOrder = '';
                    requestStepData[0] = stepItemData;
                }

                var promise = new Promise((res, rej) => {
                    res(WsCalcDtlC(requestStepData));
                });
                promise.then(() => {
                    var ft_key = $("li." + getParamModelId() + "_" + getParamCalcGroupId() + " li." + getParamCalcGroupId() + "_" + getParamCalcId() + " li.Steps_" + Fromstepid).attr('key');
                    if (stepModalAction === 'C') {
                        ftCopyNode(ft_key, stepItemData.StepId, true);
                    } else if (stepModalAction === 'R') {
                        ftRenameNode(ft_key, stepItemData.StepId);
                    }
                    updateFancyTreeGroup(getParamCalcGroupId(), getParamModelId(), '', { calc_id: getParamCalcId(), action: 'U' }, false);
                });
                $('#rename-step-modal #rename-copy-step-id').removeClass('bk-yellow');
                $('#rename-step-modal').modal('hide');
                updateStepDataTable();
                scrollToBottom('.calculation-step-table-responsive', '.calculation-step-table');
            }
            loader('hide');
        } catch (error) {
            displayCatchError('step-rename-error');
            return false;
        }
    }, 1);
});

/* Step Criteria/Calcualtion/Destination Enlarge Modal*/
$(document).on('click', '.codemirror-enlarge-view', function () {
    try {
        var content_id = $(this).attr('data-content');
        $($(this).attr('data-target') + ' .CodeMirror').remove();
        $('#' + content_id + '-cm').val($('#' + content_id).val());
        initializeCodeMirror(content_id + '-cm');
        if ($('#' + content_id).next('.CodeMirror').hasClass('bk-yellow')) {
            $('#' + content_id + '-cm').next('.CodeMirror').addClass('bk-yellow');
        }
        $($(this).attr('data-target')).modal({ backdrop: 'static', keyboard: false });
    } catch (error) {
        displayCatchError('cm-error');
        return false;
    }
});
$(document).on('click', '#step-criteria-modal .update-btn, #step-calculation-modal .update-btn, #step-result-dim-ovr-modal .update-btn', function () {
    try {
        if (!$(this).hasClass('close-modal')) {
            var target_id = $(this).attr('attr-id');
            $('#' + target_id).next('.CodeMirror').remove();
            $('#' + target_id).val($('#' + target_id + '-cm').val());
            initializeCodeMirror(target_id);
            if ($('#' + target_id + '-cm').next('.CodeMirror').hasClass('bk-yellow')) {
                $('#' + target_id).next('.CodeMirror').addClass('bk-yellow');
            }
        }
        $(this).closest('.modal').find('.bk-yellow').removeClass('bk-yellow');
        $(this).closest('.modal').modal('hide');
        eventupdateSaveButton();
    } catch (error) {
        displayCatchError('cm-error');
        return false;
    }
});
// Calculation Detail Page Script End

$(document).on('click', '.step-id-rename', function () {
    if ($('#step-form')[0]) {
        var step_id = $('#step-id').val();
        $('#rename-step-modal .step-error-message').html('');
        $('#step-modal').modal('hide');
        renameStep(step_id, 'R', 'Rename Step');
    }
});

/*Calculation step form validation end*/
$(document).on('change', '#driver-form select', function () {
    validateForm('#driver-modal .btn-submit', validateDriverForm);
    updateDriverFormButton();
});
$(document).on('change', '#driver-modal #driver-dimension', async function () {
    try {
        var dimension_id = $(this).val();
        $('#driver-modal #dim-attribute').val('');
        $('#driver-modal #dim-attribute').next('.select2-container').find('.select2-selection').removeClass('bk-yellow');
        if (dimension_id !== '') {
            await listProperties(dimension_id);
        }
        validateForm('#driver-modal .btn-submit', validateDriverForm);
    } catch (error) {
        displayCatchError('property-list');
        return false;
    }
});
$(document).on('change', '#variable-modal #variable-property, #driver-modal #dim-attribute', function () {
    if ($.trim($(this).val()) === '') {
        $(this).next('.select2-container').find('.select2-selection').removeClass('bk-yellow');
    }
});

$(document).on('click', '.user-logout-btn', function (e) {
    e.preventDefault();
    $.get(location.protocol + '//' + location.host + "/sap/public/bc/icf/logoff", function (data, status) { });
    document.location.reload();
});

$(document).on('change', '#run-calc-group-modal .dimension-list', function () {
    var script_builder_cache = getLocalStorage('script_builder_cache', false);
    try {
        if (script_builder_cache !== null && script_builder_cache !== '') {
            var dimension_id = $(this).val();
            var datalist = `<datalist id="datalist_${dimension_id}">`;
            var env_id = getEnvironment();
            if (env_id) {
                var local_datas = script_builder_cache.filter(obj => obj.env == env_id && obj.dimension_id == dimension_id);
                $.each(local_datas, function (i, item) {
                    datalist += `<option value="${item.dimension_value}">`;
                });
            }
            datalist += '</datalist>';
            $(this).closest('.debugger-form-group').find('.debugger-local-datalist input').attr('list', 'datalist_' + dimension_id);
            $(this).closest('.debugger-form-group').find('.debugger-local-datalist').append(datalist);
        }
        if ($(this).closest('.form-group').is(':last-child')) {
            var model_id = $(this).attr('data-model');
            addDimentionsSectionToDebuggerRunModal(model_id);
        }
    } catch (error) {
        displayCatchError('dimension-list');
        return false;
    }
});

$(document).on('submit', '#run-calc-group-modal-form', function (e) {
    e.preventDefault();
    if (typeof ($('.debugger-content #script').val()) === 'undefined' || $('.debugger-content #script').val() == "") {
        runDebuggerScriptFromCalcGroupBuilder();
    } else {
        showDebuggerScriptDialog();
    }
});
$(document).on("select2:select", "#select-existing-calc-calculation-field, #debugger-calc-group-lists", function (evt) {
    $('#select-existing-calculation-modal').find('.text-red').html('');
    var element = evt.params.data.element;
    var $element = $(element);
    $element.detach();
    $(this).append($element);
    $(this).trigger("change");
});
$(document).on("select2:unselecting", "#select-existing-calc-calculation-field", function (evt) {
    $('#select-existing-calculation-modal').find('.text-red').html('');
});

$(document).on('click', '#variable-modal .btn-submit:not(.disabled)', function (evt) {
    evt.preventDefault();
    var variable_form = $(this).closest('form');
    var variable_id = $('#variable-modal #variable-id').val();
    if ($.trim(variable_id) !== '' && typeof (variable_id) !== 'undefined' && !$(this).hasClass('btn-grey')) {
        loader('show', false);
        setTimeout(function () {
            try {
                var form_values = variable_form.serializeArray();
                var variable_form_values = getArrayKeyValuePair(form_values, false);
                var exist = false;
                if (variable_form_values['Action'] === 'A' || variable_form_values['Action'] === 'E') {
                    if (variable_form_values['Action'] === 'A') {
                        var exist = checkVariableExist(variable_id, true);
                    }
                    if (!exist) {
                        var request_item = getVariableModifyItemData(variable_form_values);
                        var response = WsCgVarsW(request_item, 'M');
                        if (response) {
                            setLocalStorage('MODEL_REFRESH_TIME', '');
                            $('#variable-modal').modal('hide');
                        }
                    } else {
                        variable_form.find('input[name=VariableId]').next('.text-red').html(exist);
                        variable_form.find('.btn-submit').addClass('disabled');
                    }
                }
            } catch (error) {
                displayCatchError('variable-save-error');
                return false;
            }
            loader('hide', false);
        }, 1);
    }
});

$(document).on('click', '#rename-variable-modal .btn-submit:not(.disabled)', function (evt) {
    evt.preventDefault();
    var variable_form = $(this).closest('form');
    var variable_id = $('#rename-variable-modal input[name="VariableId"]').val();
    if ($.trim(variable_id) !== '' && typeof (variable_id) !== 'undefined' && validateID(variable_form.find('input[name=VariableId]'), variable_id)) {
        loader('show', false);
        setTimeout(function () {
            try {
                var form_values = variable_form.serializeArray();
                var variable_form_values = getArrayKeyValuePair(form_values, false);
                var exist = false;
                if (variable_form_values['Action'] === 'R' || variable_form_values['Action'] === 'C') {
                    var fromVariableId = variable_form_values['Fromvariableid'];
                    if (variable_id !== fromVariableId) {
                        exist = checkVariableExist(variable_id, true);
                        if (!exist) {
                            variable_form_values['Tovariableid'] = variable_form_values['VariableId'];
                            var temp_variable_id = variable_form.find('input[name=Tempvariableid]').val();
                            if (temp_variable_id != '') {
                                variable_form_values['Fromvariableid'] = temp_variable_id;
                            }
                            delete variable_form_values['VariableId'];
                            delete variable_form_values['Tempvariableid'];
                            var request_item = getVariableCopyItemData(variable_form_values);
                            var response = WsCgVarsC(request_item);
                            if (response) {
                                setLocalStorage('MODEL_REFRESH_TIME', '');
                                $('#rename-variable-modal').modal('hide');
                            }
                        } else {
                            variable_form.find('input[name=VariableId]').next('.text-red').html(exist);
                            variable_form.find('.btn-submit').addClass('disabled');
                        }
                    } else {
                        $('#rename-variable-modal').modal('hide');
                    }
                }
            } catch (error) {
                displayCatchError('rename-variable-error');
                return false;
            }
        }, 1);
    }
});

$(document).on('click', '#calculation-modal .btn-submit:not(.disabled)', function (evt) {
    evt.preventDefault();
    var calc_form = $(this).closest('form');
    var calc_id = calc_form.find('input[name=CalcId]').val();
    if ($.trim(calc_id) !== '' && typeof (calc_id) !== 'undefined' && !$(this).hasClass('disabled')) {
        loader('show');
        setTimeout(function () {
            try {
                var form_values = calc_form.serializeArray();
                var calc_form_values = getArrayKeyValuePair(form_values, false);
                var exist = false;
                if (calc_form_values['Action'] === 'A' || calc_form_values['Action'] === 'E') {
                    if (calc_form_values['Action'] === 'A') {
                        exist = checkCalculationExist(calc_id, true);
                    }
                    if (!exist) {
                        var response = WsCalcHdrW(calc_form_values);
                        if (response) {
                            var calc_form_values_write = [];
                            calc_form_values_write.push(calc_form_values);
                            var promise = new Promise((res, rej) => {
                                WsCgCalcsW(calc_form_values_write, 'M', false);
                                res(updateFancyTreeGroup(getParamCalcGroupId(), getParamModelId(), '', false));
                            });
                            promise.then(() => {
                                getWsCgCalcsRBind(getParamCalcGroupId(), '%', true, updateCalculationsLocalCacheData);
                            });
                            $('#calculation-modal').modal('hide');
                            scrollToBottom('.calc-group-detail', '.calculations-table');
                            loader('hide');
                        }
                    } else {
                        calc_form.find('input[name=CalcId]').next('.text-red').html(exist);
                        calc_form.find('.btn-submit').addClass('disabled');
                    }
                }
            } catch (error) {
                displayCatchError('calculation-save-error');
                return false;
            }
        }, 1);
    }
});

$(document).on('click', '#rename-calculation-modal .btn-submit.btn-primary:not(.disabled)', function (evt) {
    evt.preventDefault();
    var calc_form = $(this).closest('form');
    var calc_id = calc_form.find('input[name=CalcId]').val();
    if ($.trim(calc_id) !== '' && typeof (calc_id) !== 'undefined' && validateID(calc_form.find('input[name=CalcId]'), calc_id) && !$(this).hasClass('disabled')) {
        loader('show');
        setTimeout(function () {
            try {
                var form_values = calc_form.serializeArray();
                var calc_form_values = getArrayKeyValuePair(form_values, false);
                var exist = false;
                if (calc_form_values['Action'] === 'R' || calc_form_values['Action'] === 'C') {
                    var fromCalcId = calc_form_values['Fromcalcid'];
                    if (calc_id !== fromCalcId) {
                        exist = checkCalculationExist(calc_id, true);
                        if (!exist) {
                            calc_form_values['Tocalcid'] = calc_form_values['CalcId'];
                            var temp_calc_id = calc_form.find('input[name=Tempcalcid]').val();
                            if (temp_calc_id != '') {
                                calc_form_values['Fromcalcid'] = temp_calc_id;
                            }
                            delete calc_form_values['CalcId'];
                            delete calc_form_values['Tempcalcid'];
                            if (calc_form_values['Action'] !== 'R') {
                                if (calc_form_values['CalcOrder'] == 1) { // to confirm the calc order
                                    calc_form_values['CalcOrder'] = parseInt(getMaxCalculationOrderNumber()) + 1;
                                }
                                calc_form_values['Calcorder'] = calc_form_values['CalcOrder'];
                            }

                            var promise = new Promise((res, rej) => {
                                WsCalcHdrC(calc_form_values, false);
                                res(updateFancyTreeGroup(getParamCalcGroupId(), getParamModelId(), '', { calc_id: calc_form_values['Tocalcid'], action: 'U' }, true));
                            });
                            promise.then(() => {
                                if (calc_form_values['Action'] === 'R') {
                                    if ($('.calculation-header-form').length > 0) {
                                        $('.calculation-header-form').find('input[name=CalcId]').val(calc_form_values['Tocalcid']);
                                        setParamCalcId(calc_form_values['Tocalcid']);
                                        $(".calculation-section .calc-heading").html(calc_id);
                                        calculationFancytreeReload(true);
                                    }
                                }
                                getWsCgCalcsRBind(getParamCalcGroupId(), '%', true, updateCalculationsLocalCacheData);
                                setLocalStorage('calc_detail_local_cache', '');
                            });
                            $('#rename-calculation-modal').modal('hide');
                            loader('hide');
                        } else {
                            calc_form.find('input[name=CalcId]').next('.text-red').html(exist);
                            calc_form.find('.btn-submit').attr('disabled', 'disabled');
                        }
                    } else {
                        $('#rename-calculation-modal').modal('hide');
                    }
                }
            } catch (error) {
                displayCatchError('rename-calculation-error');
                return false;
            }
            loader('hide');
        }, 1);
    }
});

$(document).on('click', '#select-existing-calculation-modal .btn-submit:not(.disabled)', function (evt) {
    evt.preventDefault();
    var existing_calc_form = $(this).closest('form');
    existing_calc_form.find('.text-red').html('');
    var calc_id_arr = existing_calc_form.find('select[name=CalcIds]').val();
    if (calc_id_arr !== null) {
        var exist = false;
        var is_exists = [];
        calc_id_arr.forEach(calc_id => {
            exist = checkCalculationExist(calc_id, true, true);
            if (exist) {
                is_exists.push(calc_id);
            }
        });
        if (is_exists.length === 0) {
            loader('show');
            setTimeout(async function () {
                try {
                    var countCalcOrder = parseInt(getMaxCalculationOrderNumber()) + 1;
                    var calc_form_values_write = [];
                    calc_id_arr.forEach(calc_id => {
                        var maxCalcOrder = countCalcOrder++;
                        var form_values = {};
                        form_values.CalcGroupId = getParamCalcGroupId();
                        form_values.CalcId = calc_id;
                        form_values.CalcInstance = 1;
                        form_values.Enabled = 'Y';
                        form_values.CalcOrder = maxCalcOrder;
                        calc_form_values_write.push(form_values);
                    });

                    var promise = new Promise((res, rej) => {
                        WsCgCalcsW(calc_form_values_write, 'M', false);
                        res(updateFancyTreeGroup(getParamCalcGroupId(), $('#select-existing-calc-model-field').val(), '', { calc_id: calc_id_arr, action: 'EC' }));
                    });
                    promise.then(() => {
                        getWsCgCalcsRBind(getParamCalcGroupId(), '%', true, updateCalculationsLocalCacheData);
                    });
                    setLocalStorage('MODEL_REFRESH_TIME', '');
                    existing_calc_form.find('select[name=CalcIds]').val('');
                    existing_calc_form.find('select[name=CalcIds]').select2();
                    existing_calc_form.find('.text-red').html('');
                    scrollToBottom('.calc-group-detail', '.calculations-table');
                    $('#select-existing-calculation-modal').modal('hide');
                } catch (error) {
                    displayCatchError('existing-calculation-save-error');
                    return false;
                }
                loader('hide');
            }, 1);
        } else {
            var exists_data = '';
            var count = 0;
            is_exists.forEach(calc_id => {
                if (count) { exists_data += ', '; }
                exists_data += calc_id;
                count++;
            });
            existing_calc_form.find('.text-red').html(exists_data + ' already exists!');
        }
    }
});

$(document).on("click", "#calculation-add-btn", function () {
    try {
        if ($('#param-calculations-sort-order').val() > 0 || $('.calculations-table').find('.bk-yellow').length > 0) {
            $('#param-calc-add-new').val(1);
            trackFormChanges();
            return false;
        }
        $('#calculation-modal').modal('show');
        var calc_modal_form = $('#calculation-modal-form');
        calc_modal_form.find('.btn-submit').removeAttr('disabled');
        calc_modal_form.find('.bk-yellow').removeClass('bk-yellow');
        calc_modal_form.find('select[name=SourceId], select[name=TargetId]').val(getParamModelId());
        calc_modal_form.find('select[name=SourceId], select[name=TargetId]').select2();
        calc_modal_form.find('select[name=SourceId], select[name=TargetId]').trigger('change');
        calc_modal_form.find('input[name=CalcId]').val('');
        calc_modal_form.find('input[name=CalcId]').trigger('keyup');
        var calc_order = parseInt(getMaxCalculationOrderNumber()) + 1;
        calc_modal_form.find('input[name=CalcOrder]').val(calc_order);
    } catch (error) {
        displayCatchError('add-calculation-form-error');
        return false;
    }
});

$(document).on('keyup', '#calculation-modal .primary-id, #rename-calculation-modal .primary-id', function () {
    if (validateID(this, $(this).val())) {
        var Fromcalcid = ($(this).closest('form').find('input[name=Action]').val() === 'R') ? $(this).closest('form').find('input[name=Fromcalcid]').val() : '';
        var exist = checkCalculationExist($(this).val());
        if (exist && Fromcalcid !== $(this).val()) {
            $(this).next('.text-red').html(exist);
            $(this).closest('form').find('.btn-submit').addClass('disabled');
            setTooltip('Saving is not allowed because some of the required fields are still left blank!', '#calculation-modal .btn-submit');
        } else {
            if ($(this).closest('form').find('.btn-submit').hasClass('disabled')) {
                $(this).closest('form').find('.btn-submit').removeClass('disabled');
                removeTooltip($(this).closest('form').find('.btn-submit'));
            }
        }

        if (Fromcalcid === $(this).val() && Fromcalcid !== '') {
            $(this).removeClass('bk-yellow');
            if ($(this).closest('form').find('input[name=Action]').val() === 'R') {
                updateToGreyBtn("#rename-calculation-modal .btn-submit");
            }
        } else {
            $(this).addClass('bk-yellow');
            if ($(this).closest('form').find('input[name=Action]').val() === 'R') {
                updateToPrimaryBtn("#rename-calculation-modal .btn-submit");
            }
        }
    } else {
        updateToPrimaryBtn("#rename-calculation-modal .btn-submit");
        $(this).closest('form').find('.btn-submit').addClass('disabled btn-primary');
        setTooltip('Saving is not allowed because some of the required fields are still left blank!', $(this).closest('form').find('.btn-submit'));
    }
});

$(document).on('keyup', '#variable-modal .primary-id, #rename-variable-modal .primary-id', function () {
    if (validateID(this, $(this).val())) {
        var Fromvariableid = ($(this).closest('form').find('input[name=Action]').val() === 'R') ? $(this).closest('form').find('input[name=Fromvariableid]').val() : '';
        var exist = checkVariableExist($(this).val());
        if (exist && Fromvariableid !== $(this).val()) {
            $(this).next('.text-red').html(exist);
            $(this).closest('form').find('.btn-submit').addClass('disabled');
            setTooltip('Saving is not allowed because some of the required fields are still left blank!', $(this).closest('form').find('.btn-submit'));
        } else {
            $(this).closest('form').find('.btn-submit').removeClass('disabled');
            removeTooltip($(this).closest('form').find('.btn-submit'));
        }

        if (Fromvariableid === $(this).val() && Fromvariableid !== '') {
            $(this).removeClass('bk-yellow');
            if ($(this).closest('form').find('input[name=Action]').val() === 'R') {
                updateToGreyBtn("#rename-variable-modal .btn-submit");
            }
        } else {
            $(this).addClass('bk-yellow');
            if ($(this).closest('form').find('input[name=Action]').val() === 'R') {
                updateToPrimaryBtn("#rename-variable-modal .btn-submit");
            }
        }
    } else {
        $(this).closest('form').find('.btn-submit').addClass('disabled').addClass('btn-primary').removeClass('btn-grey');
        setTooltip('Saving is not allowed because some of the required fields are still left blank!', $(this).closest('form').find('.btn-submit'));
    }
    return false;
});
$(document).on('keyup', '#driver-modal #driver-id, #rename-driver-modal #rename-copy-driver-id', function () {
    if (!$(this).is('[readonly]')) {
        var Fromdriverid = ($(this).closest('.modal-body').find('#driver-modal-action').val() === 'R') ? $(this).closest('.modal-body').find('#default-driver-id').val() : '';
        if (validateID($(this), $(this).val())) {
            var action_arr = ['R', 'C'];
            var driverid = $(this).val();
            var check_driver_exist = checkDriverExist(driverid);
            if (check_driver_exist && Fromdriverid != driverid) {
                $(".rename-driver-error-message, .driver-error-message").text(check_driver_exist);
                $(this).closest('.modal').find('.btn-submit').addClass('disabled');
            } else {
                $(this).closest('.modal').find('.btn-submit').removeClass('disabled');
                updateDriverFormButton();
            }
            if (Fromdriverid !== '' && Fromdriverid === driverid) {
                $(this).removeClass('bk-yellow');
                if (action_arr.includes($(this).closest('.modal-body').find('#driver-modal-action').val())) {
                    updateToGreyBtn("#rename-driver-modal .btn-submit");
                }
            } else {
                $(this).addClass('bk-yellow');
                if (action_arr.includes($(this).closest('.modal-body').find('#driver-modal-action').val())) {
                    updateToPrimaryBtn("#rename-driver-modal .btn-submit");
                }
            }
        } else {
            $(this).closest('.modal').find('.btn-submit').addClass('disabled');
        }
    }
});
$(document).on('keyup', '#step-modal #step-id, #rename-step-modal #rename-copy-step-id', function () {
    if (!$(this).is('[readonly]')) {
        var Fromstepid = ($(this).closest('.modal-body').find('#rename-step-modal-action').val() === 'R') ? $(this).closest('.modal-body').find('#default-step-id').val() : '';
        if (validateID($(this), $(this).val())) {
            var action_arr = ['R', 'C'];
            var stepid = $(this).val();
            var check_step_exist = checkStepIdExist(stepid);
            if (check_step_exist && Fromstepid != stepid) {
                $(".step-error-message").text(check_step_exist);
                $(this).closest('.modal').find('.btn-submit').addClass('disabled');
            } else {
                $(this).closest('.modal').find('.btn-submit').removeClass('disabled');
                updateStepFormButton();
            }
            if (Fromstepid !== '' && Fromstepid === stepid) {
                $(this).removeClass('bk-yellow');
                if (action_arr.includes($(this).closest('.modal-body').find('#rename-step-modal-action').val())) {
                    updateToGreyBtn("#rename-step-modal .btn-submit");
                }
            } else {
                $(this).addClass('bk-yellow');
                if (action_arr.includes($(this).closest('.modal-body').find('#rename-step-modal-action').val())) {
                    updateToPrimaryBtn("#rename-step-modal .btn-submit");
                }
            }
        } else {
            $(this).closest('.modal').find('.btn-submit').addClass('disabled');
        }
    }
});
$(document).on('click', '.tree-timemachine', function (e) {
    e.preventDefault();
    $('.timemachine-tooltip').hide();
    $('#timemachine-form .btn-submit').trigger('click');
});

$(document).on('click', '#timemachine-form .btn-submit', function (e) {
    e.preventDefault();
    try {
        var timemachine_form = $(this).closest('form');
        var timemachine_date = timemachine_form.find('input[name=timemachine_date]').val();
        var timemachine_time = timemachine_form.find('input[name=timemachine_time]').val();
        timemachine_form.find('.text-red').html('');
        var flag = true;
        var error_message = '';
        if (timemachine_date === '' || timemachine_date === null) {
            flag = false;
            error_message = 'Please pick a date';
        }
        else if (!isValidDate(timemachine_date)) {
            flag = false;
            error_message = 'Invalid date';
        }
        else if (timemachine_time === '' || timemachine_time === null) {
            timemachine_time = '23:59';
            timemachine_form.find('input[name=timemachine_time]').val(timemachine_time);
        }
        else if (!isValidTime(timemachine_time)) {
            flag = false;
            error_message = 'Invalid time';
        }

        if (flag) {
            var formatted_date = timemachine_date + ' ' + timemachine_time;
            timemachine_date = timemachine_date.replace(/-/ig, '');
            timemachine_time = timemachine_time.replace(/:/ig, '');
            var timemachine_datetime = timemachine_date + timemachine_time;
            $('#param-date-time-last-changed').val(timemachine_datetime);
            timemachineRefresh(true);
            setLocalStorage('timemachine_datetime', timemachine_datetime);
            if ($('.calc-group-box .bk-yellow').length > 0) {
                trackFormChanges('', false, false);
                updateSaveButton();
                return false;
            }
            $('#content').html('<div class="calc-group-overview"></div>');

            if ($('.fancytree-form').find('.tree-timemachine').length > 0) {
                $('.input-group-addon').removeClass('hide');
                $('.tree-timemachine').removeClass('icon-history').addClass('icon-loop3').removeAttr('title').addClass('tree-refresh').removeClass('tree-timemachine');
            }

            $('.tree-refresh').addClass('spin');
            $('#timemachine-modal').hide();
            setTimeout(function () {                
                $('#param-fancytree-render').val(1);
                updateLocalStorage();            
                //generateFancyTree(false, true);            
                var formatted_date_title = moment(new Date(formatted_date)).format('MMM DD, YYYY hh:mm a');
                $('.timemachine-tooltip').html('DarCE Rewind mode is set as of ' + formatted_date_title);
            }, 1);
        } else {
            timemachine_form.find('.text-red').html(error_message);
        }
    } catch (error) {
        displayCatchError('timestamp-form-error');
        return false;
    }
});

$(document).on('mouseover', '.tree-timemachine', function () {
    if ($('.timemachine-tooltip').html() !== '') {
        $('.timemachine-tooltip').fadeIn('slow');
    }
});

$(document).on('mouseleave', '.tree-timemachine', function () {
    $('.timemachine-tooltip').fadeOut('slow');
});

$(document).on('mouseenter', '.sidebar-calc-title', function (e) {
    if (!$(this).closest('tr').hasClass('active-row') && typeof ($(this).attr('data-title')) !== 'undefined' && typeof ($(this).attr('data-content')) !== 'undefined') {
        var html = `
            <p><strong>${$(this).attr('data-title')}</strong></p>
            <p>${$(this).attr('data-content')}</p>
        `;
        var e_offset_top = parseInt($(this).offset().top) - 95;
        var e_offset_left = 130 + parseInt($(this).width());
        $('.fancytree-sidebar-tooltip').html(html);
        $('.fancytree-sidebar-tooltip').css('top', e_offset_top);
        $('.fancytree-sidebar-tooltip').css('left', e_offset_left);
    }
});

$(document).on('mouseout, mousemove', '.sidebar-calc-title', function () {
    $('.fancytree-sidebar-tooltip').hide();
});

$(document).on('click', '.tree-timestamp', function () {
    $('#timemachine-modal').toggle();
    $('#timemachine-modal .input-group-addon').removeClass('hide');
});

$(document).on('change', '.timemachine-switch', function () {
    try {
        if ($('#timemachine-check').val() === '0') {
            if ($(this).is(':checked')) {
                $('#timemachine-mode-off').hide();
                $('#timemachine-mode-on').show();
                $('#timemachine-form')[0].reset();
            } else {
                $('#timemachine-mode-on').hide();
                $('#timemachine-mode-off').show();
                if ($('#param-date-time-last-changed').val() !== '' && $('#param-date-time-last-changed').val() !== null) {
                    $('#param-date-time-last-changed').val('');
                    setLocalStorage('CALC_REFRESH_TIME', '');
                    setLocalStorage('CALCGROUP_REFRESH_TIME', '');
                    setLocalStorage('MODEL_REFRESH_TIME', '');
                    setLocalStorage('PROPERTIES_REFRESH_TIME', '');
                    setLocalStorage('FANCYTREE_REFRESH_TIME', '');
                    setLocalStorage('timemachine_datetime', null);
                    $('.tree-timemachine').removeClass('icon-history').addClass('icon-loop3').addClass('spin').removeAttr('title');
                    $('.tree-timemachine').removeClass('tree-timemachine').addClass('tree-refresh');
                    $('.tree-timestamp').click();
                    $('#content').html('');
                    setTimeout(function () {
                        $('#param-fancytree-render').val(1);
                        updateLocalStorage();
                        //generateFancyTree(false, true);
                    }, 1);
                }
            }
        } else {
            $('#timemachine-mode-on').hide();
            $('#timemachine-mode-off').show();
            $('#timemachine-check').val(0);
        }
    } catch (error) {
        displayCatchError('timestamp-form-error');
        return false;
    }
});

$(document).mouseover(function (e) {
    var container = $('.sidebar-calc-title');
    if (!container.is(e.target) && container.has(e.target).length === 0 && !$(e.target).hasClass('sidebar-calc-title')) {
        $('.fancytree-sidebar-tooltip').hide();
    }
});

$(document).mouseup(function (e) {
    var container = $("#timemachine-modal");
    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target) && container.has(e.target).length === 0 && !$(e.target).hasClass('available') && !$(e.target).hasClass('AnyTime-btn') && !$(e.target).hasClass('icon-arrow-left32') && !$(e.target).hasClass('icon-arrow-right32')) {
        container.hide();
        if ($('#param-date-time-last-changed').val() === '' || $('#param-date-time-last-changed').val() === null) {
            if ($('.timemachine-switch').is(':checked')) {
                $('.timemachine-switch').prop('checked', false);
                $('#timemachine-check').val(1);
                updateSwitchery('.timemachine-switch', false);
                $('#timemachine-form').find('.text-red').html('');
            }
        }
    }

    if ($('.calc-group-stepy-variable').is(':visible') || $('#calculation-form-step-1').is(':visible') || $('#calculation-form-step-2').is(':visible')) {
        var popup_container = $(".popover");
        if (!popup_container.is(e.target) &&
            popup_container.has(e.target).length === 0 &&
            !$(e.target).hasClass('text-overflow-description') &&
            !$(e.target).hasClass('label-lite-green')
        ) {
            popup_container.prev('.text-overflow-description').css('color', '#333');
            popup_container.prev('.label-lite-green').css('color', '#FFF');
            popup_container.popover('hide');
        }
    }
});

$(document).on('keypress', 'form input', function (e) {
    return e.which !== 13;
});

$(document).ready(function () {
    document.addEventListener("mousemove", checkSession, false);
    document.addEventListener("mousedown", checkSession, false);
    document.addEventListener("keypress", checkSession, false);
    document.addEventListener("touchmove", checkSession, false);
    checkSession();
});

var timeOut;
var timeKeep;

function reopenSession() {
    var url;
    url = getConfig('zdar_calc_engine_bind');
    url = getURL(url);
    url += '?sap-sessioncmd=open';
    $.ajax({
        url: location.protocol + '//' + location.host + '/sap/bc/bsp/sap/zevo/webcontent/min.html?sap-sessioncmd=open',
        type: 'GET',
        async: false
    });
    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'text/xml',
        data: '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="urn:sap-com:document:sap:soap:functions:mc-style"><soap:Header/><soap:Body><tns:ZdarMin/></soap:Body></soap:Envelope>',
        dataType: 'xml',
        async: false,
        success: (response) => { console.log(response); },
        error: (jqXHR, textStatus, errorThrown) => { console.log(jqXHR.responseText); }
    });
};

function keepAlive() {

    clearTimeout(timeKeep);

    timeKeep = setTimeout(function () {
        reopenSession();
        keepAlive();
    }, 60000);

};

function checkSession() {

    clearTimeout(timeOut);

    timeOut = setTimeout(function () {
        reopenSession();
        keepAlive();
//        $('#modal_iconified').modal('show');
        checkSession();
    }, 60000 * 20);

};

$(document).on('click', '.user-keepopen-btn', function (e) {
    e.preventDefault();
    reopenSession();
    clearTimeout(timeKeep);
    checkSession();
});

$(document).on('change', '.calculations-table input[type=checkbox], .calculation-driver-table input[type=checkbox]', function () {
    try {
        var json_data = $(this).closest('tr').find('input[type=hidden]').val();
        if (json_data === '' || json_data === null) { return false; }
        json_data = JSON.parse(unescape(json_data));
        var attrVal = $(this).attr('attr-value');
        if (!$(this).attr('data-default')) {
            if (json_data[attrVal] === '-1' || json_data[attrVal] === 'Y') {
                json_data[attrVal] = 'Y';
            } else {
                json_data[attrVal] = 'N';
            }
            $(this).attr('data-default', json_data[attrVal]);
        }
        json_data[attrVal] = $(this).prop('checked') ? 'Y' : 'N';
        $(this).closest('tr').find('input[type=hidden]').val(escape(JSON.stringify(json_data)));
        if ($(this).attr('data-default') !== json_data[attrVal]) {
            $(this).closest('tr').addClass('bk-yellow');
        } else {
            $(this).closest('tr').removeClass('bk-yellow');
        }
        updateSaveButton();
    } catch (error) {
        displayCatchError('calculation-table');
        return false;
    }
});

$(document).on('change', '.calculation-step-table input[type=checkbox]', function () {
    try {
        var json_data = $(this).closest('tr').find(':hidden').val();
        if (json_data === '' || json_data === null) { return false; }
        var old_json_data = JSON.parse(unescape(json_data));
        json_data = JSON.parse(unescape(json_data));
        var attrVal = $(this).attr('attr-value');
        if (!$(this).attr('data-default')) {
            if (json_data[attrVal] === '-1' || json_data[attrVal] === 'Y') {
                json_data[attrVal] = '-1';
            } else {
                json_data[attrVal] = '0';
            }
            $(this).attr('data-default', json_data[attrVal]);
        }
        json_data[attrVal] = $(this).prop('checked') ? '-1' : '0';
        old_json_data[attrVal] = $(this).prop('checked') ? '-1' : '0';
        var index = parseInt($(this).closest('tr').index()) + 1;
        var flag = false;
        $('.calculation-step-table > tbody > tr:nth-child(' + index + ') input[type=checkbox]').each(function (item) {
            var attrVal = $(this).attr('attr-value');
            if (typeof $(this).attr('data-default') != 'undefined' && $(this).attr('data-default') !== old_json_data[attrVal] && !flag) {
                flag = true;
            }
        });

        if (flag) {
            $(this).closest('tr').addClass('bk-yellow');
        } else {
            $(this).closest('tr').removeClass('bk-yellow');
        }

        $(this).closest('tr').find('input[type=hidden]').val(escape(JSON.stringify(json_data)));
        updateSaveButton();
        return false;
    } catch (error) {
        displayCatchError('calculation-step-table');
        return false;
    }
});

$(document).on('change', '.fancytree-calculation-table input[type=checkbox]', function () {
    try {
        var calc_data = [];
        var calc_data_json = $(this).closest('tr').find('.calc_data').val();
        if (calc_data_json === '' || calc_data_json === null) { return false; }
        calc_data_json = JSON.parse(unescape(calc_data_json));
        calc_data_json['Enabled'] = $(this).prop('checked') ? 'Y' : 'N';
        calc_data.push(calc_data_json);
        WsCgCalcsW(calc_data, 'M');
    } catch (error) {
        displayCatchError('calculation-table');
        return false;
    }
});

$(document).on('click', '.sidebar-calc-group-title', function () {
    $(this).addClass('active');
});

$(document).on('click', '.dialog-environment-confirm .ui-dialog-titlebar-close', function () {
    $('table.connect-environment-table tr').removeAttr('env_change_trigger');
    $('table.connect-environment-table tr').removeClass('selected');
});

$(document).on('click', '#add-new-calc-group-modal .btn-submit:not(.disabled)', function () {
    loader('show');
    setTimeout(function () {
        try {
            $("#add-new-calc-group-modal .calc-group-id-error").text('');
            form_values = {};
            form_values.CalcGroupId = $('#calc-group-modal-form [name="CalcGroupId"]').val();
            if (form_values.CalcGroupId == '') {
                $("#add-new-calc-group-modal .calc-group-id-error").text('Enter Calculation Group ID');
                return false;
            }
            var check_exist = checkCalcGroupExist(form_values.CalcGroupId, true);
            if (check_exist) {
                $("#add-new-calc-group-modal .calc-group-id-error").text(check_exist);
                return false;
            } else {
                form_values.PrimaryDobjectId = $('#calc-group-modal-form [name="DsourceId"]').val();
                form_values.CalcGroupDescr = '';
                form_values.PreRunScopeAdj = '';
                form_values.PostRunScopeAdj = '';
                form_values.RunCriteria = '';
                $('#param-model-id').val(form_values.PrimaryDobjectId);
                $('#param-calc-group-id').val(form_values.CalcGroupId);
                var promise = new Promise((res, rej) => {
                    WsCalcGrpW(form_values);
                    calcGroupFancytreeReload(activation = true);
                    var dsource_data = {};
                    dsource_data.DobjectId = form_values.PrimaryDobjectId;
                    dsource_data.CalcGroupId = form_values.CalcGroupId;
                    dsource_data.DobjectOrder = 1;
                    dsource_data.ScopeDims = '';
                    dsource_data.AggDims = '';
                    dsource_data.IndexDims = '';
                    var requestDobjectsItem = [];
                    requestDobjectsItem[0] = dsource_data;
                    WsCgDobjectsW(requestDobjectsItem, 'M', '', false);
                    $("#add-new-calc-group-modal").modal('hide');
                    var ft_key = $("li.root_" + getParamModelId()).attr('key');
                    if (ft_key != '' && typeof (ft_key) != 'undefined') {
                        var calcGroup_nkey = ftaddNode(ft_key, form_values.CalcGroupId, 'icon-tree6', false);
                        setActiveNode(calcGroup_nkey);
                        res('');
                    }
                });
                promise.then(() => {
                    new Promise(async (resolve, reject) => {
                        await setFancyTree(true, true, generateFancyTreeCallback);
                        resolve('');
                    }).then(() => {
                        getWsCalcGroupRBind(getParamModelId(), '%', true, updateOverAllCalcGroupList);
                    });
                });
            }
        } catch (error) {
            displayCatchError('calc-group-save-error');
            return false;
        }
        loader('hide');
        return false;
    }, 1);
});

$(document).on('click', '.help-about-evo-btn', function () {
    var version = 'Version ' + getConfig('cache_version');
    $('#help-about-evo-modal .modal-dialog .modal-body > p').html(version);
    $('#help-about-evo-modal').modal('show');
});
// $(function () {
//     $("body").on("click", ".modal", function (e) {
//         if ($(e.target).hasClass('modal')) {
//             var hidePopup = $(e.target).attr('id');
//             $('#' + hidePopup).find('.btn-link').trigger('click');
//         }
//     });
// });

/**
 * USERS
 */
$(document).on('click', '.edit-user', function (e) {
    e.preventDefault();
    try {
        var user_id = $(this).attr('attr-id');
        var json_response = $(this).next('.users_local_data').val();
        if (typeof json_response != "undefined" && json_response != "undefined") {
            response = JSON.parse(unescape(json_response));
        } else {
            response = getUsersDetail(user_id);
        }
    } catch (error) {
        displayCatchError('user-data');
        return false;
    }
});

/**
 * FANCYTREE
 */
$(document).on('focus', '.fancytree-calc-group-selection-field .select2-selection', function () {
    if (!$('#select2-sidebar-calc-group-lists-results').parent().parent().find('.evo-group-add-link')[0]) {
        $('#select2-sidebar-calc-group-lists-results').parent().parent().prepend('<span class="evo-group-add-link add-calc-group"><i class="icon-plus2"></i> NEW CALC GROUP</span>');
    }
});

$(document).on('change', '#sidebar-calc-group-lists', function () {
    if($('.calc-group-detail .bk-yellow').length > 0) {
        $('#param-load-sidebar-calc-group').val(1);
        trackFormChanges();
        return false;
    }
    $('.fancytree-calculation-table tbody').html('');
    $('#content').html('');
    $('param-calc-id').val('');
    var calc_group_id = $(this).val();
    var model_id = $(this).find(":selected").attr('attr-model');
    $('#param-model-id').val(model_id);
    $('#param-calc-group-id').val(calc_group_id);
    $('.fancytree-calc-group-title').html(calc_group_id);
    setTimeout(function () {
        ftActivateGroupNode();
    }, 1);
});

$(document).on('click', '.fancytree-content .fancytree-calc-panel-section', function () {
    ftActivateGroupNode();
});

$(document).on('click', '.ft-listview', function () {
    $('#param-ft-view').val('listview');
    $('.fancytree-content .fancytree-form .fancytree-section-title').html('CALC LIST VIEW');
    $('.fancytree-control-icons').removeClass('active');
    $('.fancytree-calc-structure').removeClass('hide');
    $('.fancytree-structure').addClass('hide');
    $(this).addClass('active');
    showCalculationTab(false);
    setLocalStorage('fancytree_listview', true);
});

$(document).on('click', '.ft-treeview', function () {
    $('#param-ft-view').val('treeview');
    $('.fancytree-content .fancytree-form .fancytree-section-title').html('CALC GROUP TREE VIEW');
    $('.fancytree-control-icons').removeClass('active');
    $('.fancytree-structure').removeClass('hide');
    $('.fancytree-calc-structure').addClass('hide');
    $(this).addClass('active');
    showCalculationTab();
    setLocalStorage('fancytree_listview', false);
});

/**
 * DEBUGGER PAGE
 */
$(document).on('click', '.debugger-content .dropdown-menu, .select2-container .select2-search', function (e) {
    e.stopPropagation();
});

$(document).on('click', '#debugger-query-parameters-modal label.parameters-collapse', function (e) {
    if($(this).find('icon').hasClass('icon-arrow-right22')) {
        $(this).find('icon').removeClass('icon-arrow-right22').addClass('icon-arrow-down22');
    } else {
        $(this).find('icon').removeClass('icon-arrow-down22').addClass('icon-arrow-right22');
    }
});

$(document).bind('paste', '.debugger-content #script', function (e) {
    setTimeout(function() {
        $('.debugger-content #script').trigger('keyup');
    });
});

$(document).on('keyup', '.debugger-content #script', function (e) {
    var debugger_query = $(this).val();
    $('#script-default').val(debugger_query);
    var debugger_query = debugger_query.split((/\n/g) || []);
    var length = debugger_query.length;
    var flag_run_simulation = flag_temporary_data = flag_sql_queries = true;
    var run_simulation, temporary_data, sql_queries;
    for (i = 0; i < length; i++) {
        var query = debugger_query[i].replace(/ +/g, "");
        if(debugger_query[i].search('WRITE') === 0) {
            if(query.search("WRITE=OFF") === 0) {
                run_simulation = $(".debugger-run-simulation").prop("checked", true);
                flag_run_simulation = false;
            }
        }
        else if(debugger_query[i].search('OUTPUT_TEMP_DATA_Y_N') === 0) {
            if(query.search("OUTPUT_TEMP_DATA_Y_N=Y") === 0) {
                temporary_data = $(".debugger-temporary-data").prop("checked", true);
                flag_temporary_data = false;
            }
        }
        else if(debugger_query[i].search('SHOW_SQL_Y_N') === 0) {
            if(query.search("SHOW_SQL_Y_N=Y") === 0) {
                sql_queries = $(".debugger-sql-queries").prop("checked", true);
                flag_sql_queries = false;
            }
        }
    }

    if(flag_run_simulation) {
        run_simulation = $(".debugger-run-simulation").prop("checked", false);
    }

    if(flag_temporary_data) {
        temporary_data = $(".debugger-temporary-data").prop("checked", false);
    }

    if(flag_sql_queries) {
        sql_queries = $(".debugger-sql-queries").prop("checked", false);
    }

    $.uniform.update(run_simulation);
    $.uniform.update(temporary_data);
    $.uniform.update(sql_queries);
});

$(document).on('change', '.debugger-content .debugger-run-simulation, .debugger-content .debugger-temporary-data, .debugger-content .debugger-sql-queries', function (e) {
    var debugger_query = ($('#script-default').val()) ? $('#script-default').val() : $('#script').val();
    var debugger_query = debugger_query.split((/\n/g) || []);
    var length = debugger_query.length;
    var items = '';
    var flag_run_simulation = flag_temporary_data = flag_sql_queries = true;

    for (i = 0; i < length; i++) {
        var query = debugger_query[i].replace(/ +/g, "");
        if(query.search('WRITE') === 0 && e.target.className.includes('debugger-run-simulation') && flag_run_simulation) {
            var checked = $(this).is(':checked') ? 'OFF' : 'ON';
            debugger_query[i] = 'WRITE = ' + checked;
            flag_run_simulation = false;
        }
        else if(query.search('OUTPUT_TEMP_DATA_Y_N') === 0 && e.target.className.includes('debugger-temporary-data') && flag_temporary_data) {
            var checked = $(this).is(':checked') ? 'Y' : 'N';
            debugger_query[i] = 'OUTPUT_TEMP_DATA_Y_N = ' + checked;
            flag_temporary_data = false;
        }
        else if(query.search('SHOW_SQL_Y_N') === 0 && e.target.className.includes('debugger-sql-queries') && flag_sql_queries) {
            var checked = $(this).is(':checked') ? 'Y' : 'N';
            debugger_query[i] = 'SHOW_SQL_Y_N = ' + checked;
            flag_sql_queries = false;
        }

        if(debugger_query[i] != '') { items += debugger_query[i] + '\n'; }
    }

    if(flag_run_simulation || flag_temporary_data || flag_sql_queries) {
        for (i = 0; i < length; i++) {
            if(flag_sql_queries && e.target.className.includes('debugger-sql-queries') && debugger_query[i].search('OUTPUT_TEMP_DATA_Y_N') === 0) {
                var checked = $(this).is(':checked') ? 'Y' : 'N';
                debugger_query.splice(i+1, 0, 'SHOW_SQL_Y_N = ' + checked);
                flag_sql_queries = false;
            }
            else if(flag_temporary_data && e.target.className.includes('debugger-temporary-data') && debugger_query[i].search('CALC_GROUP_ID') === 0) {
                var checked = $(this).is(':checked') ? 'Y' : 'N';
                debugger_query.splice(i+1, 0, 'OUTPUT_TEMP_DATA_Y_N = ' + checked);
                flag_temporary_data = false;
            }
            else if(flag_run_simulation && e.target.className.includes('debugger-run-simulation') && debugger_query[i].search('QUERY') === 0) {
                var checked = $(this).is(':checked') ? 'OFF' : 'ON';
                debugger_query.splice(i+1, 0, 'WRITE = ' + checked);
                flag_run_simulation = false;
            }
        }
    }

    debugger_query = debugger_query.join('\n');
    $('#script, #script-default').val(debugger_query);
});

$(document).on('click', '.debugger-content .more-debugger-parameters-btn', function(){    
    $('#debugger-query-parameters-modal').modal('show');
    var debugger_query = ($('#script-default').val()) ? $('#script-default').val() : $('#script').val();

    // if(debugger_query) {
        $('.debugger-query-parameters-table').find('input:text').val('');
        $('.debugger-query-parameters-table').find('select.select2:not([name=QUERY])').val('').select2({
            minimumResultsForSearch: Infinity
        });
        $('.debugger-query-parameters-table').find('select.multiselect').val('').multiselect('destroy');
        $('.debugger-query-parameters-table').find('select.multiselect').multiselect();
        removePopover('.debugger-query-parameters-table [name=CALC_GROUP_ID]');
        removePopover('.debugger-query-parameters-table [name=OUTPUT_CALC_CUBES]');
    // }

    var debugger_query = debugger_query.split((/\n/g) || []);
    var length = debugger_query.length;
    for (i = 0; i < length; i++) {
        var query = debugger_query[i].replace(/ +/g, "");
        var splitQuery = query.split('=');
        if(splitQuery.length > 1) {
            var attr = splitQuery[0];
            var attrVal = splitQuery[1];
            var tableSelector = $('.debugger-query-parameters-table');
            var attrSelector = tableSelector.find(`[name=${attr}]`);
            if(attrSelector.hasClass('select2')) {
                attrSelector.val(attrVal).select2({
                    minimumResultsForSearch: Infinity
                });
            } else if(attrSelector.hasClass('multiselect')) {
                attrSelector.multiselect('destroy');
                attrSelector.val(attrVal.split(',')).multiselect('destroy');
                attrSelector.multiselect();
            } else {
                attrSelector.val(attrVal);
            }

            if(attr === 'CALC_GROUP_ID' || attr === 'OUTPUT_CALC_CUBES') { // set popover
                setPopover(attr, attrVal, `#debugger-query-parameters-modal input[name=${attr}]`);
            }
        }
    }
});

$(document).on('click', '#debugger-query-parameters-modal input[name=CALC_GROUP_ID]', async function(){
    var value = $(this).val();
    $('#debugger-calc-group-parameters-modal').modal('show');
    $('#debugger-calc-group-parameters-list').multiselect('destroy');
    await loadCalcGroupListstoDebuggerScriptModal('#debugger-calc-group-parameters-list');
    $('#debugger-calc-group-parameters-list').select2();
    $('#debugger-calc-group-parameters-list').val(value.split(','));
    $('#debugger-calc-group-parameters-list').select2();
    // $('#debugger-calc-group-parameters-list').val(value.split(',')).multiselect();
});

$(document).on('click', '#debugger-query-parameters-modal input[name=OUTPUT_CALC_CUBES]', async function(){
    var value = $(this).val();
    $('#debugger-output-calc-tubes-parameters-modal').modal('show');
    $('#debugger-output-calc-tubes-parameters-list').multiselect('destroy');
    var group_ids = $('#debugger-calc-group-parameters-list').val();    
    if(group_ids == null){
        var calcLists = await getOverallCalcList();
    }else{
        var calcLists = getCalcListByGroupId(group_ids); 
    }    
    // console.log('calcLists',calcLists);
    var option = '';
    var pushCalcs = [];
    calcLists.forEach(calc => {
        if(pushCalcs.indexOf(calc) === -1) {
            pushCalcs.push(calc);
            option += `<option value="${calc}">${calc}</option>`;
        }
    });
    
    $('#debugger-output-calc-tubes-parameters-list').html(option);
    $('#debugger-output-calc-tubes-parameters-list').select2();
    $('#debugger-output-calc-tubes-parameters-list').val(value.split(','));
    $('#debugger-output-calc-tubes-parameters-list').select2();

    // $('#debugger-output-calc-tubes-parameters-list').val(value.split(',')).multiselect();
});

$(document).on('click', '#debugger-calc-group-parameters-modal .btn-submit', function(){
    $('#debugger-calc-group-parameters-modal').modal('hide');
    $('#debugger-query-parameters-modal input[name=CALC_GROUP_ID]').val($('#debugger-calc-group-parameters-list').val());
    setPopover('CALC_GROUP_ID', $('#debugger-query-parameters-modal input[name=CALC_GROUP_ID]').val(), '#debugger-query-parameters-modal input[name=CALC_GROUP_ID]');
});

$(document).on('click', '#debugger-output-calc-tubes-parameters-modal .btn-submit', function(){
    $('#debugger-output-calc-tubes-parameters-modal').modal('hide');
    $('#debugger-query-parameters-modal input[name=OUTPUT_CALC_CUBES]').val($('#debugger-output-calc-tubes-parameters-list').val());
    setPopover('OUTPUT_CALC_CUBES', $('#debugger-query-parameters-modal input[name=OUTPUT_CALC_CUBES]').val(), '#debugger-query-parameters-modal input[name=OUTPUT_CALC_CUBES]');
});

$(document).on('click', '#debugger-query-parameters-modal .update-btn', function(){
    var table_inputs = $('.debugger-query-parameters-table :input').serializeArray();    
    var multiselect_fields = ['OUTPUT_MINI_CUBES', 'OUTPUT_RESULTS', 'OUTPUT_WRITE_BACK_TBLS'];
    var input_arr = [];
    var debugger_query = '*START_BADI DARCE \n';
    table_inputs.forEach((inputField) => {        
        if(input_arr.indexOf(inputField.name) === -1) {
            var flag = true;
            // if(inputField.name === '1OUTPUT_CALC_CUBES') { // add multiselect field after this field
            //     debugger_query += `${inputField.name} = ${inputField.value}\n`;
            //     multiselect_fields.forEach(field => {
            //         let is_exists = table_inputs.filter(inp => {
            //             return inp.name === field;
            //         });
            //         if(is_exists.length === 0) {            
            //            // debugger_query += `${field} = \n`;
            //         }
                    
            //     });            
            //     flag = false;
            
            // }
            var filtered_inputs = table_inputs.filter(checkInput => {
                return checkInput.name === inputField.name;
            });
            var filter_query = [];
            filtered_inputs.forEach(filter_input => {                   
                var filter_input_value = filter_input.value;
                if(!filter_input_value || filter_input_value == 'NULL') {
                    // filter_input_value = getDebuggerDefaultParameterValues(filter_input.name);
                    flag = false; 
                }                
                if(filter_input_value == '' || filter_input_value == 'NULL'){
                     flag = false;                    
                }
                filter_query.push(filter_input_value);            
                
            });
            if(flag) {
                debugger_query += `${inputField.name} = ${filter_query.join(', ')} \n`;
            }
            input_arr.push(inputField.name);
        }
    
    });
    debugger_query += `*END_BADI`;    

    if($(this).hasClass('copy-clipboard-btn')) {
        $('<textarea id="copy-clipboard-textarea">').val(debugger_query).appendTo('body').select();
        document.execCommand('copy');
        $('#copy-clipboard-textarea').remove();
        setTooltip('Parameter values have been copied to Clipboard.', $(this), 'top');
        $(this).trigger('mouseover');
        setTimeout(function() {
            removeTooltip('.copy-clipboard-btn');
            $(this).trigger('mouseover');
        }, 1000);
    } else {
        trackDebuggerFormChanges(() => {
            $('.debugger-content #script, .debugger-content #script-default').val(debugger_query);
            $('#debugger-query-parameters-modal').modal('hide');
        })
    }
});

$(document).on('click', '.debugger-content .animated-refresh-btn', function (e) {
    try {
        var attr_id = $(this).attr('attr-id');
        $(this).find('.icon-loop3').addClass('spin');
        $(this).next('div').remove();
        if ($('.datatable-js-' + attr_id).length === 0) {
            $('<table class="table debugger-output-table datatable-js-' + attr_id + '">').insertAfter($(this));
        }
        $('ul.debugger-output-tab li > a[attr-id=' + attr_id + ']').removeClass('loaded');
        $('ul.debugger-output-tab li > a[attr-id=' + attr_id + ']').find('.icon-loop3').removeClass('hidden');
        $('ul.debugger-output-tab li > a[attr-id=' + attr_id + ']').trigger('click');
    } catch (error) {
        displayCatchError('debugger-query-table');
        return false;
    }
});

$(document).on('click', 'ul.debugger-output-tab li > a', function (e) {
    try {
        var target_id = $(this).attr('href');
        var scroll_pos = $(target_id).attr('scroll-pos');
        $('.debugger-content #output > .tab-content').animate({ scrollTop: scroll_pos }, 0);
        if (!$(this).hasClass('loaded')) {
            var attr_id = $(this).attr('attr-id');
            var target_selector = '.animated-icon-' + attr_id;
            $(target_selector).removeClass('hidden');
            $(target_selector).addClass('spin');
            $(this).addClass('loaded');
            setTimeout(function () {
                var debugger_output = JSON.parse(unescape($('#debugger-output-storage').val()));
                var output = $.grep(debugger_output, function (n, i) {
                    return n.tab_count == attr_id;
                });
                if (output.length > 0) {
                    if (output[0].data.length > 20000) {
                        runDebuggerAdditionalColumnFiltering(output, target_selector, attr_id);
                        $(target_selector).addClass('hidden').removeClass('spin');
                    } else {
                        generateTable(output[0].data, output[0].columns, output[0].table_class, target_selector, attr_id);
                    }
                } else {
                    alert("The web service call cannot reach the server. Please check your network connectivity and try again. If this issue continues to happen, please contact your technical support team for further assistance.");
                    $(target_selector).removeClass('spin');
                }
            }, 1);
        }
    } catch (error) {
        displayCatchError('debugger-query-table');
        return false;
    }
});

$(document).on('click', '.debugger-content .buttons-colvis', function () {
    if (!$('.dt-button-collection .dt-button:first-child').hasClass('buttons-colvisRestore')) {
        $('.dt-button-collection').prepend($('.dt-button-collection .dt-button:last-child'));
        $('.dt-button-collection .dt-button:first-child').find('span').html('<b>Show All Columns</b>');
    }
});

/**
 * DATASOURCES
 */

$(document).on('click', '.add-datasources-btn', function () {
    var dsForm = $('#datasources-form');
    dsForm[0].reset();
    dsForm.find('select[name=DobjectType]').val(null);
    dsForm.find('input[name=Action]').val('A');
    dsForm.find('.bk-yellow').removeClass('bk-yellow');
    dsForm.find('.modal-title').html('Add Data Source');
    dsForm.find('.no-input-group').removeClass('hidden');
    dsForm.find('.input-group').addClass('hidden');
    addDatasourceIdField();
    initializeSelect2('.settings-main-section #datasources-modal .datasources-type');
    initializeModal('.settings-main-section #datasources-modal');
    var check_default_field_exist = true;
    createDefaultValues("ds-dobject-id", '', check_default_field_exist);
    createDefaultValues("ds-dobject-descr", '', check_default_field_exist);
    createDefaultValues("ds-dobject-type", '', check_default_field_exist);
    createDefaultValues("ds-dobject-detail", '', check_default_field_exist);
    updateDatasourceSaveButton();
});

$(document).on('click', '.edit-datasource', function (e) {
    e.preventDefault();
    try {
        var datasource_id = $(this).attr('attr-id');
        var response = JSON.parse(unescape($('.datasources-main-table #datasource_' + datasource_id).val()));
        if (typeof response != "undefined" && response != "undefined") {
            var dsForm = $('#datasources-form');
            dsForm[0].reset();
            addDatasourceIdField('edit');
            dsForm.find('input[name=DobjectId]').val(response.DobjectId);
            dsForm.find('input[name=Action]').val('E');
            dsForm.find('.bk-yellow').removeClass('bk-yellow');
            dsForm.find('textarea[name=DobjectDescr]').val(response.DobjectDescr);
            dsForm.find('select[name=DobjectType]').val(response.DobjectType);
            dsForm.find('textarea[name=DobjectDetail]').val(response.DobjectDetail);
            dsForm.find('.no-input-group').addClass('hidden');
            dsForm.find('.input-group').removeClass('hidden');
            dsForm.find('.modal-title').html('Edit Data Source');
            initializeSelect2('.settings-main-section #datasources-modal .datasources-type');
            initializeModal('.settings-main-section #datasources-modal', 'show', 'static', false);
            var check_default_field_exist = true;
            createDefaultValues("ds-dobject-id", response.DobjectId, check_default_field_exist);
            createDefaultValues("ds-dobject-descr", response.DobjectDescr, check_default_field_exist);
            createDefaultValues("ds-dobject-type", response.DobjectType, check_default_field_exist);
            createDefaultValues("ds-dobject-detail", response.DobjectDetail, check_default_field_exist);
        }
        updateDatasourceSaveButton();
    } catch (error) {
        displayCatchError('edit-datasource-error');
        return false;
    }
});

$(document).on('click', '#rename-datasource-btn', function () {
    if (!hasWriteAccess()) {
        return true;
    }
    var from_variable_id = $("#ds-dobject-id").val();
    $("#datasources-modal").modal('hide');
    var action = 'R';
    var title = "Rename Datasource";
    renameDataSource(from_variable_id, action, title);
});

$(document).on('change', '#datasources-modal select[name=DobjectType]', function () {
    updateDatasourceSaveButton();
});

$(document).on('keyup', '#datasources-modal #ds-dobject-descr, #datasources-modal #ds-dobject-detail', function () {
    updateDatasourceSaveButton();
});

$(document).on('keyup', '#datasources-modal .primary-id, #rename-datasource-modal .primary-id', function () {
    if (validateID(this, $(this).val(), false)) {
        var Fromdobjectid = ($(this).closest('form').find('input[name=Action]').val() === 'R') ? $(this).closest('form').find('input[name=Fromdobjectid]').val() : '';
        var exist = checkDatasourceExist($(this).val());
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
        updateDatasourceSaveButton('rename');
    } else {
        updateDatasourceSaveButton();
    }
});

$(document).on('click', '#datasources-modal .btn-submit.btn-primary:not(.disabled)', function () {
    var datasource_form = $(this).closest('form');
    var datasource_id = datasource_form.find('input[name=DobjectId]').val();
    loader('show', false);
    setTimeout(function () {
        try {
            if ($.trim(datasource_id) !== '' && typeof (datasource_id) !== 'undefined') {
                var form_values = datasource_form.serializeArray();
                var datasource_form_values = getArrayKeyValuePair(form_values, false);
                var exist = false;
                if (datasource_form_values['Action'] === 'A' || datasource_form_values['Action'] === 'E') {
                    if (datasource_form_values['Action'] === 'A') {
                        var exist = checkDatasourceExist(datasource_id, true);
                    }
                    if (!exist) {
                        var request_item = getDatasourceModifyItemData(datasource_form_values);
                        var response = WsDsourceW(request_item, 'M');
                        if (response) {
                            var table_row = getDataSourcesTableRowData(datasource_form_values, true);
                            if (datasource_form_values['Action'] === 'A') {
                                addDataTableRow('.datasources-main-table', table_row, true);
                            } else {
                                updateDataTableRow('.datasources-main-table', $('.datasources-main-table .row_' + datasource_id), table_row);
                            }
                            setModels();
                            setDimensionProperty();
                            setLocalStorage('active_fancytree_node', '');
                            setIndexedDBStorage('overall_calc_group_list', '');
                            setFancyTree(true, true, generateFancyTreeCallback);
                            $('#drwn_pg_1008_100010').remove();
                            $('#datasources-modal').modal('hide');
                        }
                    } else {
                        datasource_form.find('input[name=DobjectId]').next('.text-red').html(exist);
                        updateDatasourceSaveButton();
                    }
                }
            }
        } catch (error) {
            displayCatchError('datasource-save-error');
            return false;
        }
        loader('hide');
    }, 1);
});

$(document).on('click', '#rename-datasource-modal .btn-submit.btn-primary:not(.disabled)', function (evt) {
    evt.preventDefault();
    loader('show', false);
    var datasource_form = $(this).closest('form');
    var datasource_id = datasource_form.find('input[name=DobjectId]').val();
    setTimeout(function () {
        try {
            if ($.trim(datasource_id) !== '' && typeof (datasource_id) !== 'undefined' && validateID(datasource_form.find('input[name=DobjectId]'), datasource_id, false)) {
                var form_values = datasource_form.serializeArray();
                var datasource_form_values = getArrayKeyValuePair(form_values, false);
                var exist = false;
                if (datasource_form_values['Action'] === 'R' || datasource_form_values['Action'] === 'C') {
                    var fromDobjectId = datasource_form_values['Fromdobjectid'];
                    if (datasource_id !== fromDobjectId) {
                        exist = checkDatasourceExist(datasource_id, true);
                        if (!exist) {
                            datasource_form_values['Todobjectid'] = datasource_form_values['DobjectId'];
                            var temp_datasource_id = datasource_form.find('input[name=Tempdobjectid]').val();
                            if (temp_datasource_id != '') {
                                datasource_form_values['Fromdobjectid'] = temp_datasource_id;
                            }
                            delete datasource_form_values['DobjectId'];
                            delete datasource_form_values['Tempdobjectid'];
                            var request_item = getDatasourceCopyItemData(datasource_form_values);
                            var response = WsDsourceC(request_item);
                            if (response) {
                                var datasource_item_data = JSON.parse(unescape($('.datasources-main-table #datasource_' + fromDobjectId).val()));
                                datasource_item_data.DobjectId = datasource_form_values['Todobjectid'];
                                table_row = getDataSourcesTableRowData(datasource_item_data, true);
                                if (datasource_form_values['Action'] === 'R') {
                                    setLocalStorage('active_fancytree_node', '');
                                    setIndexedDBStorage('overall_calc_group_list', '');
                                    updateDataTableRow('.datasources-main-table', $('.datasources-main-table .row_' + fromDobjectId), table_row);
                                    $('.datasources-main-table tr.row_' + fromDobjectId).attr('id', 'row_' + datasource_item_data.DobjectId);
                                    $('.datasources-main-table tr#row_' + datasource_item_data.DobjectId).removeClass('row_' + datasource_item_data.fromDobjectId).addClass('row_' + datasource_item_data.DobjectId);;
                                } else {
                                    addDataTableRow('.datasources-main-table', table_row, true);
                                }                                                                   
                                setModels();                                
                                setDimensionProperty();
                                setFancyTree(true, true, generateFancyTreeCallback);
                                $('#drwn_pg_1008_100010').remove();
                                $('#rename-datasource-modal').modal('hide');                                                                             
                            }
                        } else {
                            datasource_form.find('input[name=DobjectId]').next('.text-red').html(exist);
                            updateDatasourceSaveButton();
                        }
                    } else {
                        $('#rename-datasource-modal').modal('hide');
                    }
                }
            }
        } catch (error) {
            displayCatchError('rename-datasource-error');
            return false;
        }
        loader('hide');
    }, 1);
});

/**
 * Calc detail page
 */
// $(document).on("click", '#calculation-form-head-1 >div', function () {
//     updateFancyTreeByStepy(2);
// });
// $(document).on('click', '#calculation-form-head-2 > div', function () {
//     updateFancyTreeByStepy(3);
// });
$(document).on("click", ".calculation-step-table .edit-step", function (e) {
    try {
        var step_id = $(this).attr('attr-id');

        var ft_key = $("li." + getParamModelId() + "_" + getParamCalcGroupId() + " li." + getParamCalcGroupId() + "_" + getParamCalcId() + " li.Steps_" + step_id).attr('key');
        var node = $(".fancytree-structure").fancytree("getActiveNode");
        if ($('#Action').val() == 'add') {
            openStepForm(step_id);
            return true;
        }
        if ($('#param-calculations-sort-order').val() > 0 || ($('.calculation-step-table').find('.bk-yellow').length > 0 || $('.calculation-driver-table').find('.bk-yellow').length > 0)) {
            var stepEditParams = new Object()
            stepEditParams.step_id = step_id
            stepEditParams.saveChange = 'edit-steps';
            $("#param-context-menu-action").val(stepEditParams.saveChange)
            if ($('.calculation-step-table').find('.bk-yellow').length > 0) {
                stepEditParams.selector = 'calculation-step-table'
                stepEditParams.selectorLen = $('.calculation-step-table').find('.bk-yellow').length
            } else if ($('.calculation-driver-table').find('.bk-yellow').length > 0) {
                stepEditParams.selector = 'calculation-driver-table'
                stepEditParams.selectorLen = $('.calculation-driver-table').find('.bk-yellow').length
            } else if ($('.calculation-driver-table').find('.bk-yellow').length > 0 && $('.calculation-step-table').find('.bk-yellow').length > 0) {
                stepEditParams.selector = 'calculation-driver-table'
                stepEditParams.selector_1 = 'calculation-step-table'
                stepEditParams.selectorLen = $('.calculation-driver-table').find('.bk-yellow').length
            }
            trackFormChanges('', false, true, stepEditParams);
            return false;
        }
        else if (node.key != ft_key) {
            if (typeof ft_key != 'undefined' && ft_key != 'undefined') {
                $(".fancytree-structure").fancytree("getTree").getNodeByKey(ft_key).setActive();
            }
        } else {
            openStepForm(step_id);
        }
    } catch (error) {
        displayCatchError('calc-step-data');
        return false;
    }
});
$(document).on("click", ".calculation-driver-table .edit-driver", function () {
    try {
        var driver_id = $(this).attr('attr-id');
        ft_key = $("li." + getParamModelId() + "_" + getParamCalcGroupId() + " li." + getParamCalcGroupId() + "_" + getParamCalcId() + " li.Drivers_" + driver_id).attr('key');
        var node = $(".fancytree-structure").fancytree("getActiveNode");
        if ($('#Action').val() == 'add') {
            openDriverForm(driver_id);
            return true;
        }
        if ($('#param-calculations-sort-order').val() > 0 || ($('.calculation-step-table').find('.bk-yellow').length > 0 || $('.calculation-driver-table').find('.bk-yellow').length > 0)) {
            var driveEditParams = new Object()
            driveEditParams.driver_id = driver_id
            driveEditParams.saveChange = 'edit-drivers';
            $("#param-context-menu-action").val(driveEditParams.saveChange)
            if ($('.calculation-step-table').find('.bk-yellow').length > 0) {
                driveEditParams.selector = 'calculation-step-table'
                driveEditParams.selectorLen = $('.calculation-step-table').find('.bk-yellow').length
            } else if ($('.calculation-driver-table').find('.bk-yellow').length > 0) {
                driveEditParams.selector = 'calculation-driver-table'
                driveEditParams.selectorLen = $('.calculation-driver-table').find('.bk-yellow').length
            } else if ($('.calculation-driver-table').find('.bk-yellow').length > 0 && $('.calculation-step-table').find('.bk-yellow').length > 0) {
                driveEditParams.selector = 'calculation-driver-table'
                driveEditParams.selector_1 = 'calculation-step-table'
                driveEditParams.selectorLen = $('.calculation-driver-table').find('.bk-yellow').length
            }
            trackFormChanges('', false, true, driveEditParams);
            return false;
        }
        else if (node.key != ft_key) {
            if (typeof ft_key != 'undefined' && ft_key != 'undefined') {
                $(".fancytree-structure").fancytree("getTree").getNodeByKey(ft_key).setActive();
            }
        } else {           
            openDriverForm(driver_id);
        }
    } catch (error) {
        displayCatchError('calc-driver-data');
        return false;
    }
});

$(document).on('change', '#calc-agg-modal #aggregate-dims', function () {
    var aggregate_dims = $(this).val();
    if (aggregate_dims == null || aggregate_dims == '') {
        $('#aggregate-function').attr('disabled', 'disabled');
    } else {
        $('#aggregate-function').removeAttr('disabled');
    }
});

$(document).on('submit', 'form#rename-calc-group', function (e) {
    e.preventDefault();
    var editCalcGroupId = $(this).find('input[name=editCalcGroupId]').val();
    var defaultCalcGroupId = $(this).find('input[name=defaultCalcGroupId]').val();
    $('.calc-group-table').find("a[attr-id=" + defaultCalcGroupId + "]").html(editCalcGroupId);
    $('form#calc-group-detail-form').find('input[name=CalcGroupId]').val(editCalcGroupId);
    $('#rename-calc-group-modal').modal('hide');
});
/*CALC DEATAIL PAGE Driver/step close event action */
$(document).on('click','#driver-modal .add-modify-driver, #driver-modal .close-driver-form, #step-modal .add-modify-step, #step-modal .close-step-form', function () {        
    eventDriverStepFromClose();
});
$(document).on('click', '#driver-form .close, #step-form .close', function(){    
    eventDriverStepFromClose();
});
// $('#driver-modal').modal({
//     backdrop: 'static',
//     keyboard: false
// });
$('.modal').modal({
    backdrop: 'static',
    keyboard: false  // to prevent closing with Esc button (if you want this too)
});
