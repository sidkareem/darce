$(function () {
    resetCalcGroupDetailLocalStorage();
    listDataSourceOptions('.cg-detail-form-content');
    $('#param-calc-id').val('');
    $('.default_values').html('');
    if ($("#param-load-calculation").val() == 1 && $('.ft-treeview.icon-lan2').hasClass('active')) {
        $('.calc-group-stepy-wizard').stepy('step', 4);
        $("#param-load-calculation").val(0);
    }
    if ($("#param-load-variable").val() == 1) {
        $('.calc-group-stepy-wizard').stepy('step', 3);
        $("#param-load-variable").val(0);
    }
    var active_node = getLocalStorage('active_fancytree_node');    
    if (active_node != null && active_node !== '') {
        $('#calc-group-detail-form-header li').each(function(index) {
            var current_tab = $(this).children('span').html();        
            if(active_node[0].tab == current_tab ){
                $('.calc-group-stepy-wizard').stepy('step', index+1 );  
            }
        });
    }
    var calc_group_id = getParamCalcGroupId();
    if (calc_group_id !== '') {
        $('.calc-group-refresh').removeClass('hide');
        getCalcGroupDetail(calc_group_id);
        getCalcGroupDataSourcesDetail(calc_group_id);
        getCalcGroupCalculationsData(calc_group_id);
        getCalcGroupVariablesData(calc_group_id);
    }
    $('.CodeMirror').resizable();
    $('.calculations-tab, .variables-tab').floatingScroll();
    $(".modal").draggable({
        handle: ".modal-header",
    });
    $(".add-data-source").on('click', function () {
        addDataSourceTab(true, true, true);
    });
    if (!hasWriteAccess()) {
        $('span.icon-database-add').remove();
        $('a.evo-group-add-link').remove();
        $('.input-group-addon').addClass('hide');
        $('#datasources-tab').addClass('user-ro');
    }
    tabScroller('left');
    $('.styled').uniform();
    updateSaveButton();
    if ($('.ft-listview').hasClass('active')) {
        showCalculationTab(false);
    } else {
        showCalculationTab();
    }
    $('.sidebar-calc-group-title').addClass('active');
    $('.sidebar-calc-title').closest('tr').removeClass('active-row');
    $("#param-calc-node-key").val('');

});

/**
 * Check datasource already exist
 */
function checkDataSourceExist(selected_data) {
    var has_error = false;
    $('#calc-group-detail-form [id^="datasource-dsource-id-"]').each(function () {
        if ($.trim($(this).val()) === selected_data && !$(this).hasClass('active')) {
            has_error = true;
        }
    });
    return has_error;
}

$('#calc-group-detail-form-header').on('click', '#calc-group-detail-form-head-3', function () {
    var calc_group_id = getParamCalcGroupId();
    if (calc_group_id != '') {
        var node = $(".fancytree-structure").fancytree("getActiveNode");
        var ft_key = $("li." + getParamModelId() + "_" + getParamCalcGroupId()).attr('key');
        if ((node.getLevel() == 2)) {
            $(".fancytree-structure").fancytree("getTree").getNodeByKey(ft_key).setExpanded();
        }
    }
});

/**
 * Get calc group detail
 */
function getCalcGroupDetail(calc_group_id = '') {
    try {
        var response = getCalcGroupDetailLocalCache('CALC_GROUP_DATA', calc_group_id);
        if (!response) {
            var model_id = getParamModelId();
            getWsCalcGroupRBind(model_id, calc_group_id, true, updateCalcGroupDetail);
        } else {
            updateCalcGroupDetail(response, false);
        }
    } catch (error) {
        displayCatchError('cg-header-data');
        return false;
    }
    return true;
}

/**
 * Update calc group detail
 */
function updateCalcGroupDetail(response, updateLocalGroupData) {
    try {
        if (updateLocalGroupData === undefined) {
            updateLocalGroupData = true;
        }
        if (updateLocalGroupData) {
            updateCalcGroupDetailLocalCache('CALC_GROUP_DATA', response);
        }
        if (typeof (response) !== 'undefined') {
            if (typeof (response.CalcGroupId) !== 'undefined') {
                $(".calc-group-heading").html(response.CalcGroupId);
                $("input[name=CalcGroupId]").val(response.CalcGroupId);
                $("textarea[name=CalcGroupDescr]").val(replaceSpecialCharacters(response.CalcGroupDescr, true));
                $("textarea[name=RunCriteria]").val(replaceSpecialCharacters(response.RunCriteria, true));
                $("textarea[name=PreRunScopeAdj]").val(replaceSpecialCharacters(response.PreRunScopeAdj, true));
                $("textarea[name=PostRunScopeAdj]").val(replaceSpecialCharacters(response.PostRunScopeAdj, true));
                $('#run-criteria,#pre-run-scope-adj,#post-run-scope-adj').next('CodeMirror').remove();
                initializeCodeMirror("run-criteria");
                initializeCodeMirror("pre-run-scope-adj");
                initializeCodeMirror("post-run-scope-adj");
                updateCalcGroupDefaultValues(true, true, false);
            }
        }
    } catch (error) {
        displayCatchError('cg-header-data');
        return false;
    }
}

/**
 * Get calc group datasource detail
 */
function getCalcGroupDataSourcesDetail(calc_group_id = '%') {
    try {
        var response = getCalcGroupDetailLocalCache('DOBJECT_DATA', calc_group_id);
        if (!response) {
            getWsCgDObjectsRBind('%', calc_group_id, true, updateCalcGroupDataSourcesDetail);
        } else {
            updateCalcGroupDataSourcesDetail(response, false);
        }
    } catch (error) {
        displayCatchError('cg-dobject-data');
        return false;
    }
    return true;
}

/**
 * Update calc group datasource detail
 */
function updateCalcGroupDataSourcesDetail(response, updateLocalGroupData) {
    try {
        if (updateLocalGroupData === undefined) {
            updateLocalGroupData = true;
        }
        if (updateLocalGroupData) {
            updateCalcGroupDetailLocalCache('DOBJECT_DATA', response);
        }
        var data_sources = [];
        if (typeof (response) !== 'undefined' && !$.isArray(response)) {
            data_sources.push(response);
        } else {
            data_sources = response;
        }
        if (typeof (data_sources) !== 'undefined' && data_sources !== '') {
            data_sources.sort(function (a, b) {
                return a.DobjectOrder - b.DobjectOrder;
            });
            var tab = 1
            for (item of data_sources) {
                if (tab > 1) {
                    addDataSourceTab(false);
                }
                addMissingMemberLists("#datasource-dsource-id-" + tab, item.DobjectId);
                $("#datasource-dsource-id-" + tab).val(item.DobjectId).select2();

                $("textarea[name='dataSources[" + tab + "][Criteria]']").val(replaceSpecialCharacters(item.Criteria, true));
                $("#datasource-criteria-" + tab).next('.CodeMirror').remove();
                initializeCodeMirror("datasource-criteria-" + tab);
                tab++;
            }
        }
    } catch (error) {
        displayCatchError('cg-dobject-data');
        return false;
    }
}

/**
 * Load variables
 */
async function loadVariables() {
    try {
        var calc_group_id = getParamCalcGroupId();
        var variable_id = $("#param-variable-id").val();
        if (calc_group_id !== '' && variable_id !== '') {
            var response = JSON.parse(unescape($('.variables-table #variable_' + variable_id).val()));
            addVariableIdField('edit');
            if (!hasWriteAccess()) {
                $('.input-group-addon').addClass('hide');
            }
            $("#variable-id").val(response.VariableId);
            $("#variable-filter").val(replaceSpecialCharacters(response.VariableFilter, true));
            $("#variable-type").val(response.VariableType);

            if (response.Dimension) {
                addMissingMemberLists('#variable-dimension', response.Dimension);
                $("#variable-dimension").val(response.Dimension);
            }

            await listProperties(response.Dimension);
            if (response.Property) {
                addMissingMemberLists('#variable-property', response.Property);
                $("#variable-property").val(response.Property);
            }

            var check_default_field_exist = true;
            createDefaultValues("variable-id", response.VariableId, check_default_field_exist);
            createDefaultValues("variable-filter", response.VariableFilter, check_default_field_exist);
            createDefaultValues("variable-type", response.VariableType, check_default_field_exist);

            createDefaultValues("variable-dimension", response.Dimension, check_default_field_exist);
            createDefaultValues("variable-property", response.Property, check_default_field_exist);

            $('#variable-modal .CodeMirror').remove();
            initializeCodeMirror("variable-filter");
            $("#variable-type").select2();
            $("#variable-dimension").select2({ allowClear: true });
            $("#variable-property").select2({ allowClear: true });
        }
    } catch (error) {
        displayCatchError('cg-variable-data');
        return false;
    }
}

/**
 * Add datasource tab
 */
function addDataSourceTab(code_mirror = true, active_tab = false, is_new = false) {
    try {
        var tab_link = $('.clone_data_source_link').html();
        var tab_content = $('.clone_data_source_tab').html();

        var total_data_source_tabs = parseInt($(".calc-group-detail .nav-tabs-list ul li:not(.add-data-source)").length) + 1;
        $("#total-data-source-tabs").val(total_data_source_tabs + 1);
        tab_link = tab_link.replace(/__/ig, total_data_source_tabs);
        tab_content = tab_content.replace(/__/ig, total_data_source_tabs);

        $("#datasources-tab .tab-content").append(tab_content);
        $(tab_link).insertBefore(".add-data-source");

        if (is_new) {
            $('#datasource-tab-' + total_data_source_tabs).addClass('datasource-new-tab');
        }

        $('#datasource-tab-' + total_data_source_tabs + ' .multiselect').multiselect();
        $('#datasource-tab-' + total_data_source_tabs + ' .datasource-list').select2();

        createTempValues('agg-dim-' + total_data_source_tabs, '', true);
        createTempValues('index-dim-' + total_data_source_tabs, '', true);

        if (code_mirror) {
            initializeCodeMirror("datasource-criteria-" + total_data_source_tabs);
            $('.CodeMirror').resizable();
        }
        updateTabTitle();
        updateSaveButton();
        if (active_tab) {
            $('.datasources-tab .nav-tabs a[href="#datasource-tab-' + total_data_source_tabs + '"]').tab('show');
        }
        tabScroller('right');
    } catch (error) {
        displayCatchError('add-datasource-form-error');
        return false;
    }
}

// Remove datasource
function removeDataSourceTab(tab_id) {
    try {
        if($("#datasource-dsource-id-"+tab_id+"-default").val()) {
            var calculation_group_data = getLocalStorage('calculation_group_data');
            dsource_data = {};
            dsource_data['DobjectId'] = $("#datasource-dsource-id-" + tab_id).val();
            dsource_data['ScopeDims'] = ($("#datasource-scope-dims-" + tab_id).val() !== null) ? $("#datasource-scope-dims-" + tab_id).val().join(', ') : '';
            dsource_data['AggDims'] = ($("#agg-dim-" + tab_id).val() !== null) ? $("#agg-dim-" + tab_id).val().join(', ') : '';;
            dsource_data['IndexDims'] = ($("#index-dim-" + tab_id).val() !== null) ? $("#index-dim-" + tab_id).val().join(', ') : '';;
            dsource_data['Criteria'] = $("#datasource-criteria-" + tab_id).val();
            dsource_data['CalcGroupId'] = $("#calc-group-id").val();
            dsource_data['DobjectOrder'] = '';

            calculation_group_data[0].delete_datasources.push(dsource_data);
            $('.calc-group-save').removeClass('btn-grey');
            $('.calc-group-save').addClass('btn-primary');
            setLocalStorage('calculation_group_data', calculation_group_data);
        }

        $('.datasource-tab-' + tab_id).remove();
        $('#datasource-tab-' + tab_id).remove();
        if (!$('#datasources-tab .nav-tabs-highlight li').hasClass('active')) {
            $('.datasource-tab-1').addClass('active');
            $('#datasource-tab-1').addClass('active');
        }
        updateTabTitle();
        tabScroller('left');
        updateSaveButton();
    } catch (error) {
        displayCatchError('remove-datasource-error');
        return false;
    }
}

// Update datasource tab title
function updateTabTitle() {
    jQuery('.datasource-tab-title').each(function (index) {
        if (index > 0) {
            $(this).text('DATA SOURCE ' + (index + 1));
        }
    });
}

// Add variable ID Field
function addVariableIdField(action = 'add') {
    if (action === 'add') {
        $("#variable-modal .variable-id-input-field .input-field").html('<input type="text" name="VariableId" id="variable-id" class="form-control primary-id">');
    } else {
        var rename_variable_btn = '<span id="rename-variable-btn" class="input-group-addon" id="rename-variable-btn"><i class="icon-pencil7"></i></span>';
        var input_html = '<div class="input-group"><input type="text" name="VariableId" id="variable-id" class="form-control input-field primary-ids-max-val" readonly>' + rename_variable_btn + '</div>';
        $("#variable-modal .variable-id-input-field .input-field").html(input_html);
    }
    $("#variable-modal .variable-id-input-field .input-field").append('<span class="text-red variable-error-message"></span>');
}

// Confirm delete variable
function confirmDeleteVariable(variable_id) {
    loader('show');
    setTimeout(function () {
        try {
            var form_values = [];
            form_values[0] = { 'name': 'VariableId', value: variable_id };
            var variable_form_values = getArrayKeyValuePair(form_values);
            var request_items = getVariableModifyItemData(variable_form_values);
            WsCgVarsW(request_items, "D");
            setLocalStorage('MODEL_REFRESH_TIME', '');
        } catch (error) {
            displayCatchError('delete-variable-error');
            return false;
        }
        loader('hide');
    }, 1);
}

// Delete variable
function deleteVariable(variable_id = '') {
    confirmDeletionDialog('<p>Are you sure you want to delete variable ID ' + variable_id + '?</p>', confirmDeleteVariable, variable_id);
}

// Update datasource order
function updateDataSourceOrder() {
    var DobjectOrder = 1;
    var saveEnabled = false;
    $(".datasources-tab .nav-tabs-list ul li").each(function (index) {
        var tab_id = $(this).attr('class');
        if (tab_id !== 'add-data-source' && typeof (tab_id) !== 'undefined') {
            tab_id = tab_id.replace('datasource-tab-', '');
            tab_id = parseInt(tab_id.replace(' active', ''));
            i = tab_id;
            if ($(this).find('.datasource-tab-title')[0]) {
                DobjectOrder = $(this).find('.datasource-tab-title').html();
                DobjectOrder = parseInt(DobjectOrder.replace('DATA SOURCE ', ''));
            }
            if (tab_id != parseInt($('#datasource-dobjectOrder-' + i + '-default').val())) {
                saveEnabled = true;
            }
        }
    });
    if (saveEnabled) {
        $('#param-datasourceorder-changed').val(1);
        $('.calc-group-save').removeClass('btn-grey active btn-primary');
        $('.calc-group-save').addClass('btn-primary');
        removeTooltip('.calc-group-save');
    }
}

// Save calc group
function saveCalcGroup(activate_key = '') {
    if ($('.calc-group-save').hasClass('btn-primary') && !validateCGDetailForm()) {
        try {
            var new_model_id = '';
            var cur_model_id = getParamModelId();
            if ($.trim(getParamCalcGroupId()) !== '') {
                var fancytree_refresh = false;
                // Calc group header
                if ($('#calc-group-detail-form .calc-group-stepy-header .bk-yellow').length > 0) {
                    var cg_detailed_data = $("#calc-group-detail-form").serializeArray();
                    var cg_detailed_result = {};
                    $.each(cg_detailed_data, function () {
                        cg_detailed_result[this.name] = this.value;
                        cg_detailed_result.CalcGroupId = getParamCalcGroupId();
                        cg_detailed_result.PrimaryDobjectId = getParamModelId();
                    });
                    WsCalcGrpW(cg_detailed_result, true);
                }

                // Datasource delete
                var calculation_group_data = getLocalStorage('calculation_group_data');
                var delete_datasources = calculation_group_data[0]['delete_datasources'];

                if (
                    $('.calc-group-detail .datasources-tab .bk-yellow').length > 0 ||
                    delete_datasources.length > 0 ||
                    $('#param-datasourceorder-changed').val() === '1'
                ) {
                    var data_sources = [];

                    // modification
                    $(".calc-group-detail .datasources-tab > .tab-content > .tab-pane").each(function (index) {
                        var dsource_data = [];
                        var tab_id = index + 1;
                        var dsource_id = $('#datasource-dsource-id-' + tab_id + '-default').val();
                        var dobject_order = $('#datasource-dobjectOrder-' + tab_id + '-default').val();
                        if ((tab_id != dobject_order || $(this).find('.bk-yellow').length)) {
                            dsource_data['DobjectId'] = $("#datasource-dsource-id-" + tab_id).val();
                            var ScopeDims = $("#datasource-scope-dims-" + tab_id).val();
                            dsource_data['ScopeDims'] = (ScopeDims !== null && typeof ScopeDims !== 'undefined') ? ScopeDims.join(', ') : '';
                            var AggDims = $("#agg-dim-" + tab_id).val();
                            dsource_data['AggDims'] = (AggDims !== null && typeof AggDims !== 'undefined') ? AggDims.join(', ') : '';
                            dsource_data['IndexDims'] = getCalcGroupIndexDimension(tab_id);
                            dsource_data['Criteria'] = $("#datasource-criteria-" + tab_id).val();
                            dsource_data['CalcGroupId'] = getParamCalcGroupId();
                            dsource_data['DobjectOrder'] = tab_id;
                            data_sources.push(dsource_data);

                            var datasources_exists_in_delete = delete_datasources.filter(ds => { return ds.DobjectId == dsource_id; });
                            if (dsource_id != dsource_data['DobjectId'] && typeof dsource_id !== 'undefined' && datasources_exists_in_delete.length == 0) {
                                var data_sources_to_delete = [];
                                $.extend(data_sources_to_delete, dsource_data);
                                data_sources_to_delete['DobjectId'] = dsource_id;
                                delete_datasources.push(data_sources_to_delete);
                            }
                        }
                    });

                    if (data_sources.length > 0 || delete_datasources.length > 0) {
                        if (getParamModelId() != $('#datasource-dsource-id-1').val()) {
                            fancytree_refresh = true;
                            new_model_id = $('#datasource-dsource-id-1').val()
                            cur_model_id = getParamModelId();
                            $('#param-model-id').val($('#datasource-dsource-id-1').val());
                        }
                        setLocalStorage('MODEL_REFRESH_TIME', '');
                        WsCgDobjectsW(data_sources, 'U', delete_datasources);
                    }
                    $('#param-datasourceorder-changed').val(0);
                }

                if ($('#param-calculations-sort-order').val() > 0) {
                    var order_calculations = getCgCalculationsTableModifiedData();
                    WsCgCalcsW(order_calculations, 'M');
                    update_calc_dataTable = true;
                    fancytree_refresh = true;
                } else if ($('.calculations-table').find('.bk-yellow').length > 0) {
                    var status_calculations = getCalculationsTableModifiedData('.bk-yellow');
                    update_calc_dataTable = true;
                    WsCgCalcsW(status_calculations, 'M');
                }

                resetCalcGroupDetailLocalStorage();

                $("#param-calculations-sort-order").val(0);
                $('.bk-yellow').removeClass('bk-yellow');
                $('.cm-yellow').removeClass('cm-yellow');
                $('.calculations-table').find('.order-changed').removeClass('order-changed');
                $('.calculations-table').find('input[type=checkbox]').removeAttr('data-default');
                updateSaveButton();
                if ($('.calc-group-refresh').hasClass('active')) {
                    fancytree_refresh = true;
                }
                if ($('.calc-group-back').hasClass('active')) {
                    calcModelFancytreeReload();
                    if (fancytree_refresh) {
                        updateFancyTreeGroup(getParamCalcGroupId(), cur_model_id, new_model_id);
                    } else {
                        activateFancytreeNode(true);
                    }
                }
                if (fancytree_refresh && ($('.connect-environment-table .selected').attr('env_change_trigger') != '1' || activate_key != '')) {
                    if (activate_key != '') {
                        setActiveNodeFancytree(activate_key);
                    } else {
                        calcGroupFancytreeReload();
                    }
                    updateFancyTreeGroup(getParamCalcGroupId(), cur_model_id, new_model_id);
                } else if (activate_key != '') {
                    setActiveNode(activate_key);
                }
            }
        } catch (error) {
            displayCatchError('save-calc-group');
            return false;
        }
    } else {
        loader('hide');
    }
}

// Copy variable
function copyVariable(obj) {
    var from_variable_id = $(obj).attr('attr-id');
    var action = 'C';
    var title = "Copy Variable";
    renameVariable(from_variable_id, action, title);
}

$('#existing-calculation-add-modal-form').find('#select-existing-calc-model-field').on('change', async function () {
    try {
        var model_id = $(this).val();
        var option = '';
        if (model_id !== '') {
            var calculationLists = await getCalculationFromFancyTree(model_id);
            if (typeof (calculationLists) !== 'undefined') {
                $.each(calculationLists, function (i, item) {
                    option += `<option value="${item.title}">${item.title}</option>`;
                });
            }
        }
        $('#existing-calculation-add-modal-form').find('#select-existing-calc-calculation-field').html(option);
        sortAscDropdownList('#select-existing-calc-calculation-field');
        $('#existing-calculation-add-modal-form').find('#select-existing-calc-calculation-field').select2({
            sorter: function (data) {
                return data.sort(function (a, b) {
                    return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
                });
            }
        });
        $('#existing-calculation-add-modal-form').find('.text-red').html('');
    } catch (error) {
        displayCatchError('calculation-from-fancytree');
        return false;
    }
});

// Get calc group calculations table modified data
function getCgCalculationsTableModifiedData() {
    try {
        var calculationLists = [];
        var count = 1;
        $('.calculations-table > tbody > tr .calc_data').each(function () {
            var calculationData = JSON.parse(unescape($(this).val()));
            calculationData['CalcOrder'] = count;
            calculationLists.push(calculationData);
            $(this).closest('tr').attr('attr-order', count);
            count++;
        });
        return calculationLists;
    }
    catch (err) {
        displayCatchError('calculation-table');
        return false;
    }
}

// Get calculations table modified data
function getCalculationsTableModifiedData(action_class = '') {
    try {
        var calculationLists = [];
        var count = 0;
        $('.calculations-table > tbody > tr' + action_class + ' .calc_data').each(function () {
            var calculationData = JSON.parse(unescape($(this).val()));
            calculationData['Environment'] = getConfig('environment');
            calculationData['CalcGroupId'] = getParamCalcGroupId();
            if (action_class !== '.bk-yellow' && action_class !== '.order-changed') {
                calculationData['CalcOrder'] = count + 1;
                count++;
            } else {
                calculationData['CalcOrder'] = parseInt($(this).closest('tr').index()) + 1;
                $(this).closest('tr').attr('attr-index', $(this).closest('tr').index());
            }

            calculationData['DateTimeLastChanged'] = getLastChangedDateTime();
            calculationData['UserIdLastChange'] = getConfig('logged_user');
            calculationLists.push(calculationData);
        });
        return calculationLists;
    }
    catch (err) {
        displayCatchError('calculation-table');
        return false;
    }
}