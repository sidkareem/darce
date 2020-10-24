$(function () {
    $('.default_values').html('');
    resetCalculationDetailLocalStorage();
    resetCalculationPopover();
    var model_id = getParamModelId();
    var calc_group_id = getParamCalcGroupId();
    var calculation_id = getParamCalcId();
    var load_tab = 'Header';
    var node_key = $('#param-active-node-key').val();
    var ft = $(".fancytree-structure").fancytree("getTree");
    var current_node = ft.getNodeByKey(node_key);
    var node_level = current_node.getLevel();
    if (node_level == 4) {
        load_tab = current_node.title;
    } else if (node_level == 5) {
        load_tab = current_node.parent.title;
    }
    // if (load_tab == 'Drivers') {
    //     $('.stepy-wizard').stepy('step', 2);
    // } else if (load_tab == 'Steps') {
    //     $('.stepy-wizard').stepy('step', 3);
    // }
    var active_node = getLocalStorage('active_fancytree_node');            
    if (active_node != null && active_node !== '') {
        $('#calculation-form-header li').each(function(index) {
            var current_tab = $(this).children('span').html();          
            if(active_node[0].tab == current_tab ){
                $('.stepy-wizard').stepy('step', index+1 );  
            }
        });
    }
    listDataSourceOptions('', false, true);
    loadDriverTypes();
    getCalcVariablesData(getParamCalcGroupId());
    if (calculation_id !== '') {
        $('.calculation-refresh').removeClass('hide');
        if (load_tab == 'Header') {
            loadCalculationHeader(calculation_id, true);
            removeSpin('.calculation-refresh');
            loadCalculationDriver(calculation_id, true);
            loadCalculationStep(calculation_id, true);
            $('.calculation-driver-table-responsive, .calculation-step-table-responsive').floatingScroll();
        } else if (load_tab == 'Drivers') {
            loadCalculationDriver(calculation_id, true);
            $('.calculation-driver-table-responsive, .calculation-step-table-responsive').floatingScroll();
            removeSpin('.calculation-refresh');
            loadCalculationHeader(calculation_id, true);
            loadCalculationStep(calculation_id, true);
            $('.calculation-driver-table-responsive, .calculation-step-table-responsive').floatingScroll();
        }
        else if (load_tab == 'Steps') {
            loadCalculationStep(calculation_id, true);
            $('.calculation-driver-table-responsive, .calculation-step-table-responsive').floatingScroll();
            removeSpin('.calculation-refresh');
            loadCalculationDriver(calculation_id, true);
            loadCalculationHeader(calculation_id, true);
            $('.calculation-driver-table-responsive, .calculation-step-table-responsive').floatingScroll();
        }
        updateSaveButton(true);
        $('.calculation-save').removeClass('disabled');
        $('#Action').val('edit');
    }
    $('.sidebar-calc-group-title').removeClass('active');
    $(".modal").draggable({
        handle: ".modal-header",
    });
});


/**
 * Reset calculation popover
 */
function resetCalculationPopover() {
    removePopover('.calculation-section .source-id-btn');
    removePopover('.calculation-section .target-id-btn');
    removePopover('.calculation-section .calc-data-alias-btn');
    removePopover('.calculation-section .calc-ytd-btn');
    removePopover('.calculation-section .aggregate-dims-btn');
}
/**
 * Update fancytree by stepy 
 */
function updateFancyTreeByStepy(index) {
    try {
        if (index == 1) {
            var calc_id = getParamCalcId();
            if (calc_id != '') {
                var node = $(".fancytree-structure").fancytree("getActiveNode");
                var ft_key = $("li." + getParamModelId() + "_" + getParamCalcGroupId() + " li." + getParamCalcGroupId() + '_' + getParamCalcId()).attr('key');
                if ((node == null || node.getLevel() != 3)) {
                    setActiveNode(ft_key);
                }
            }
        } else if (index == 2) {
            var calc_id = getParamCalcId();
            var promise = new Promise((res, rej) => {
                if (calc_id != '') {
                    var node = $(".fancytree-structure").fancytree("getActiveNode");
                    var ft_key = $("li." + getParamModelId() + "_" + getParamCalcGroupId() + " li." + getParamCalcId() + "_Drivers").attr('key');
                    if (node == null || (node.getLevel() != 4 && node.getLevel() != 5) || (node.title != 'Drivers')) {
                        res(setActiveNode(ft_key));
                    }
                } else {
                    res('');
                }
            });
            promise.then(() => {
                $('.calculation-driver-table-responsive, .calculation-step-table-responsive').floatingScroll('update');
            });
        } else if (index == 3) {
            var calc_id = getParamCalcId();
            var promise = new Promise((res, rej) => {
                if (calc_id != '') {
                    var node = $(".fancytree-structure").fancytree("getActiveNode");
                    var ft_key = $("li." + getParamModelId() + "_" + getParamCalcGroupId() + " li." + getParamCalcGroupId() + "_" + getParamCalcId() + " li." + getParamCalcId() + "_Steps").attr('key');
                    if (node == null || (node.getLevel() != 4 && node.getLevel() != 5) || (node.title != 'Steps')) {
                        res(setActiveNode(ft_key));
                    }
                } else {
                    res('');
                }
            });
            promise.then(() => {
                $('.calculation-driver-table-responsive, .calculation-step-table-responsive').floatingScroll('update');
            });
        }
        calculationFancytreeReload();
    } catch (error) {
        displayCatchError('fancytree-load-incomplete');
        return false;
    }
}
/**
 * Load calculation header data
 */
async function loadCalculationHeaderData(response, update = true) {
    try {
        await loadSideBarCalcGroupList(getParamCalcGroupId());
        if (update) {
            updateCalcDetailLocalCache('CALCULATION_DATA', response);
        }

        var calc_form = $('form#calculation-form');
        var calcIdInputField = `<div class="input-group">
            <input type="text" class="form-control primary-ids-max-val" id="calc-id" name="CalcId" value="" readonly="readonly">
            <span id="rename-calc-btn" class="input-group-addon"><i class="icon-pencil7"></i></span>
        </div>`;
        calc_form.find('#calc-id-input-field').html(calcIdInputField);
        if (!hasWriteAccess()) {
            $('a.evo-group-add-link').remove();
            $('.input-group-addon').addClass('hide');
        }
        $("#calc-id").val(response.CalcId);
        $(".calc-heading").html(response.CalcId);
        await listDimensions(response.SourceId, '#aggregate-dims');
        calc_form.find('input[name=CalcDataAlias]').val(response.CalcDataAlias);
        calc_form.find('textarea[name=CalcDescr]').val(replaceSpecialCharacters(response.CalcDescr, true));
        calc_form.find('textarea[name=CalcDataFilter]').val(replaceSpecialCharacters(response.CalcDataFilter, true));
        addMissingMemberLists('form#calculation-form select[name=SourceId]', response.SourceId);
        calc_form.find('select[name=SourceId]').val(response.SourceId);
        calc_form.find('select[name=SourceId]').select2();
        addMissingMemberLists('form#calculation-form select[name=TargetId]', response.TargetId);
        calc_form.find('select[name=TargetId]').val(response.TargetId);
        calc_form.find('select[name=CalcYtd]').val(response.CalcYtd);
        calc_form.find('select[name=CalcYtd]').select2();
        if (response.RemDataFromMini === 'Y') {
            calc_form.find(".radio-styled-box input[value=Y]").prop('checked', true);
        } else {
            calc_form.find(".radio-styled-box input[value=N]").prop('checked', true);
        }
        calc_form.find('.radio-styled-box input[name=RemDataFromMini]').uniform();

        var agg_dims = response.AggregateDims.split(",").map(function (i) {
            return i.trim();
        });
        var check_default_field_exist = true;
        createDefaultValues('calc-id', response.CalcId, check_default_field_exist);
        createDefaultValues('calc-descr', response.CalcDescr, check_default_field_exist);
        createDefaultValues('calc-data-filter', response.CalcDataFilter, check_default_field_exist);
        createDefaultValues('source-id', response.SourceId, check_default_field_exist);
        createDefaultValues('target-id', response.TargetId, check_default_field_exist);
        createDefaultValues('calc-data-alias', response.CalcDataAlias, check_default_field_exist);
        createDefaultValues('calc-ytd', response.CalcYtd, check_default_field_exist);
        createDefaultValues('rem-data', (response.RemDataFromMini === 'Y') ? response.RemDataFromMini : 'N', check_default_field_exist);
        var aggregate_function = 'SUM';
        if (response.AggregateDims !== '') {
            $("#aggregate-dims").val(agg_dims);
            $("#aggregate-dims").multiselect('refresh');
            aggregate_function = agg_dims[0].split("=");
            if (typeof aggregate_function[1] !== 'undefined' && aggregate_function[1] != '') {
                aggregate_function = aggregate_function[1];
                var agg_option_exist = false
                $('#aggregate-function  option').each(function () {
                    if (this.value == aggregate_function) {
                        agg_option_exist = true;
                    }
                });
                if (!agg_option_exist) {
                    $("#aggregate-function").append('<option value="' + aggregate_function + '">' + aggregate_function + '</option>');
                }
                $("#aggregate-function").val(aggregate_function);
                agg_dims.shift();
            } else {
                aggregate_function = 'SUM';
            }
            createDefaultValues('aggregate-dims', agg_dims.join(','));
            createDefaultValues('aggregate-function', aggregate_function);
        }
        setPopover('DATA SOURCE', response.SourceId, '.calculation-section .source-id-btn', 'top');
        setPopover('DATA TARGET', response.TargetId, '.calculation-section .target-id-btn', 'top');
        setPopover('SOURCE AMOUNT DATA ALIAS', response.CalcDataAlias, '.calculation-section .calc-data-alias-btn', 'top');
        setPopover('YTD DATA FORMAT', calc_form.find('select[name=CalcYtd] option:selected').text(), '.calculation-section .calc-ytd-btn', 'top')
        setPopover('AGGREGATE DIMENSIONS', response.AggregateDims, '.calculation-section .aggregate-dims-btn', 'top');
        if ($('.rem-data:checked').val() === 'Y') {
            var rem_data_content = 'Yes (Remove any incoming data queried by this Calc)';
        } else {
            var rem_data_content = 'No (Keep all data queried by this Calc)';
        }
        setPopover('REMOVE CALC SOURCE DATA IN DATA SOURCE CUBE', rem_data_content, '.calculation-section .rem-data-btn', 'top');

        createTempValues('calc-id', response.CalcId, check_default_field_exist);
        createTempValues('calc-descr', response.CalcDescr, check_default_field_exist);
        createTempValues('calc-data-filter', response.CalcDataFilter, check_default_field_exist);
        $('.calculation-header-form .CodeMirror').remove();
        initializeCodeMirror('calc-data-filter');
        createTempValues('source-id', response.SourceId, check_default_field_exist);
        createTempValues('target-id', response.TargetId, check_default_field_exist);
        createTempValues('calc-data-alias', response.CalcDataAlias, check_default_field_exist);
        createTempValues('calc-ytd', response.CalcYtd, check_default_field_exist);
        createTempValues('rem-data', (response.RemDataFromMini === 'Y') ? response.RemDataFromMini : 'N', check_default_field_exist);
        createTempValues('aggregate-dims', agg_dims.join(','), check_default_field_exist);
        createTempValues('aggregate-function', aggregate_function, check_default_field_exist);

        updateButtonColor('source-id-btn', ['source-id']);
        updateButtonColor('target-id-btn', ['target-id']);
        updateButtonColor('calc-data-alias-btn', ['calc-data-alias']);
        updateButtonColor('calc-ytd-btn', ['calc-ytd']);
        updateButtonColor('aggregate-dims-btn', ['aggregate-dims']);
        if ($('.rem-data:checked').val() === 'Y') {
            updateButtonColor('rem-data-btn', ['rem-data'], true);
        }
        $('.calculation-section .select2').select2();
        if (response.AggregateDims === '') {
            $('#aggregate-function').attr('disabled', 'disabled');
        }
        var params = { tags: true, maximumSelectionLength: '' };
        $("#aggregate-function").siblings(".select2-container").remove();
        $('#aggregate-function').select2(params);
        if($('#param-calc-step-modal').val() == "1") {
            initializeStepFormCodeMirror();
            $('#param-calc-step-modal').val('');
        }
        if($('#param-calc-driver-modal').val() == "1") {
            initializeDriverFormCodeMirror();
            $('#param-calc-driver-modal').val('');
        }
    }
    catch (error) {
        displayCatchError('calc-header-data');
        return false; 
    }
}

/**
 * Update calc order
 */
function updateCalcOrder(response, update = true) {
    $("#CalcOrder").val(response.CalcOrder);
    $("#CalcInstance").val(response.CalcInstance);
    $("#Enabled").val(response.Enabled);
    if (update) {
        updateCalcDetailLocalCache('CALC_HEADER_DATA', response);
    }
}

/**
 * Load calculation header 
 */
function loadCalculationHeader(calculation_id, async = false) {
    try {
        if (!calculation_id) { return; }
        var response = getCalcDetailLocalCache('CALCULATION_DATA', calculation_id);
        if (!response) {
            var response = getWsCalcHdrRBind(calculation_id, async, loadCalculationHeaderData);
            if (!async) {
                loadCalculationHeaderData(response, true);
            }
        } else {
            loadCalculationHeaderData(response, false);
            updateCalcOrder(getCalcDetailLocalCache('CALC_HEADER_DATA', calculation_id), false);
        }
    } catch (error) {
        displayCatchError('calc-header-data');
        return false;
    }
}

/**
 * Update calculation driver table
 */
function updateCalculationDriverTable(responseData, update = true) {
    if (update) {
        updateCalcDetailLocalCache('DRIVER_DATA', responseData);
    }
    var list = getCalculationDriverTableRowData(responseData);
    $('.calculation-driver-table').find('tbody').html(list);
    initializeDriverTable('calculation-driver-table');
    $('.calculation-driver-table .styled').uniform();
    var context_menu_action = $("#param-context-menu-action").val();
    if (context_menu_action !== '' && $('#calculation-form-header .stepy-active span').html() == 'Driver') {
        var driver_id = $("#param-context-menu-title").val();
        if (context_menu_action === 'rename') {
            var action = 'R';
            var title = "Rename Driver";
            renameDriver(driver_id, action, title);
        } else if (context_menu_action === 'copy') {
            copyDriver(driver_id);
        } else if (context_menu_action === 'delete') {
            deleteDriver(driver_id);
        }
        $("#param-context-menu-action").val('');
        $("#param-context-menu-title").val('');
    }
    updateCursorIcon('.calculation-section .calculation-driver-table > tbody > tr > td > span.text-overflow-description');
    updateCursorIcon('.calculation-section .calculation-driver-table > tbody > tr > td .label-lite-green');
    initializeCustomPopover('[data-popup=driver-popover-custom]');
}

/**
 * Load calculation driver
 */
function loadCalculationDriver(calculation_id, async = false) {
    try {
        if (!calculation_id) { return; }
        var localDriverData = getCalcDetailLocalCache('DRIVER_DATA', calculation_id);
        if (!localDriverData) {
            if (async) {
                var response = getWsCalcDrvRBind(calculation_id, '%', async, updateCalculationDriverTable);
            } else {
                var response = getWsCalcDrvRBind(calculation_id);
                updateCalculationDriverTable(response);
            }
        } else {
            updateCalculationDriverTable(localDriverData, false);
        }
    } catch (error) {
        displayCatchError('calc-driver-data');
        return false;
    }
}

/**
 * Update calc local cache
 */
function updateCalcLocalCache(calculation_id = '', action = 'STEP') {
    if (action == 'STEP') {
        getWsCalcDtlRBind(calculation_id, '%', true, updateCalculationStep);
    }
    else if (action == 'DRIVER') {
        getWsCalcDrvRBind(calculation_id, '%', true, updateCalculationDriver);
    }
}

/**
 * Update calculation step  
 */
function updateCalculationStep(responseData) {
    updateCalcDetailLocalCache('STEP_DATA', responseData);
}

/**
 * Update calculation driver
 */
function updateCalculationDriver(responseData) {
    updateCalcDetailLocalCache('DRIVER_DATA', responseData);
}

/**
 * Update calculation step table 
 */
function updateCalculationStepTable(responseData, update = true) {
    if (update) {
        updateCalcDetailLocalCache('STEP_DATA', responseData);
    }
    var list = getCalculationStepTableRowData(responseData);
    $('.calculation-step-table').find('tbody').html(list);
    initializeStepTable('.calculation-step-table');
    $('.calculation-step-table .styled').uniform();
    var context_menu_action = $("#param-context-menu-action").val();
    if (context_menu_action !== '' && $('#calculation-form-header .stepy-active span').html() == 'Step') {
        var step_id = $("#param-context-menu-title").val();
        if (context_menu_action === 'rename') {
            renameStep(step_id, 'R', 'Rename Step');
        } else if (context_menu_action === 'copy') {
            renameStep(step_id, 'C', 'Copy Step');
        } else if (context_menu_action === 'delete') {
            deleteStep(step_id);
        }
        $("#param-context-menu-action").val('');
        $("#param-context-menu-title").val('');
    }
    updateCursorIcon('.calculation-section .calculation-step-table > tbody > tr > td > span.text-overflow-description');
    updateCursorIcon('.calculation-section .calculation-step-table > tbody > tr > td .label-lite-green');
    initializeCustomPopover('[data-popup=step-popover-custom]');
}

/**
 * Load calculation step
 */
function loadCalculationStep(calculation_id, async = false) {
    try {
        if (!calculation_id) { return; }
        var localStepData = getCalcDetailLocalCache('STEP_DATA', calculation_id);
        if (!localStepData) {
            if (async) {
                var response = getWsCalcDtlRBind(calculation_id, '%', async, updateCalculationStepTable);
            } else {
                var response = getWsCalcDtlRBind(calculation_id);
                updateCalculationStepTable(response);
            }
        } else {
            updateCalculationStepTable(localStepData, false);
        }
    } catch (error) {
        displayCatchError('calc-step-data');
        return false;
    }
}

/**
 * Get calculation driver table row data
 */
function getCalculationDriverTableRowData(calcDriverLists = [], rowClass = '', disabled = '') {
    var list = '';
    var calculationDriverLists = [];
    if (typeof (calcDriverLists) !== 'undefined' && !$.isArray(calcDriverLists)) {
        calculationDriverLists.push(calcDriverLists);
    } else {
        calculationDriverLists = calcDriverLists;
    }
    calculationDriverLists.sort(function (a, b) {
        if (a.DriverId > b.DriverId) return 1;
        if (a.DriverId < b.DriverId) return -1;
    });
    if (typeof (calculationDriverLists) !== 'undefined' && calculationDriverLists !== '') {
        $.each(calculationDriverLists, function (i, item) {
            list += addDriverTableRow(item, rowClass);
        });
    }
    return list;
}

/**
 * Get calculations step table row data
 */
function getCalculationStepTableRowData(calcStepLists = [], rowClass = '') {
    var list = '';
    var calculationStepLists = [];
    if (typeof (calcStepLists) !== 'undefined' && !$.isArray(calcStepLists)) {
        calculationStepLists.push(calcStepLists);
    } else {
        calculationStepLists = calcStepLists;
    }

    if (typeof (calculationStepLists) !== 'undefined' && calculationStepLists !== '') {
        calculationStepLists.sort(function (a, b) {
            return a.StepOrder - b.StepOrder;
        });
        $.each(calculationStepLists, function (i, item) {
            list += addStepTableRow(item, i, rowClass);
        });
    }
    return list;
}

/**
 * Get calculation driver type
 */
function getCalculationDriverType(driverType = '') {
    var driverTypeObj = {};
    switch (driverType) {
        case 'CUBE_DATA':
            driverTypeObj = {
                name: 'CUBE',
                class: 'label-cube'
            };
            break;
        case 'MASTER_DATA':
            driverTypeObj = {
                name: 'MASTER',
                class: 'label-master'
            }
            break;
        case 'HIER_DATA':
            driverTypeObj = {
                name: 'HIER',
                class: 'label-hier'
            }
            break;
        case 'SPREAD_DATA':
            driverTypeObj = {
                name: 'SPREAD',
                class: 'label-spread'
            }
            break;
        case 'FIRST_CP':
            driverTypeObj = {
                name: 'FIRST_CP',
                class: 'label-first-cp'
            }
            break;
    }
    return driverTypeObj;
}

/**
 * Webservice - Calc Driver Copy
 */
function WsCalcDrvC(requestData) {
    var drivers_rename_copy_url = getConfig('zdar_calc_engine_bind');
    if (requestData.Action == 'R') {
        var request = getRenameCopyDriversItemData(requestData);
        return callWebService(drivers_rename_copy_url, request, 'ZdarCalcDrvCResponse');
    } else if (requestData.Action == 'C') {
        var request = getRenameCopyDriversItemData(requestData);
        return callWebService(drivers_rename_copy_url, request, 'ZdarCalcDrvCResponse');
    }
}

/**
 * Webservice - Calc Driver Write
 */
function WsCalcDrvW(requestData, action = '') {
    var drivers_write_url = getConfig('zdar_calc_engine_bind');
    var request_items = getDriverItemData(requestData);
    var emptyItem = `<item>
                        <Environment></Environment>
                        <CalcId></CalcId>
                        <DriverId></DriverId>
                        <DriverDescr></DriverDescr>
                        <DriverType></DriverType>
                        <SourceId></SourceId>
                        <Dimension></Dimension>
                        <DimAttribute></DimAttribute>
                        <DriverLookupOverride></DriverLookupOverride>
                        <DimsToIgnoreInLkup></DimsToIgnoreInLkup>
                        <CalcYtd></CalcYtd>
                        <RepeatDriver></RepeatDriver>
                        <DriverOptions></DriverOptions>
                        <Enabled></Enabled>
                        <DateTimeLastChanged></DateTimeLastChanged>
                        <UserIdLastChange></UserIdLastChange>
                    </item>`;
    if (action === "M") {
        var request = `<tns:ZdarCalcDrvW>
                            <Tdelete>`+ emptyItem + `</Tdelete>
                            <Tmodify>`+ request_items + `</Tmodify>
                        </tns:ZdarCalcDrvW>`;
    } else if (action === "D") {
        var request = `<tns:ZdarCalcDrvW>
                            <Tdelete>`+ request_items + `</Tdelete>
                            <Tmodify>`+ emptyItem + `</Tmodify>
                        </tns:ZdarCalcDrvW>`;
    }
    return callWebService(drivers_write_url, request, 'ZdarCalcDrvWResponse');
}

/**
 * Webservice - Calc Step Copy
 */
function WsCalcDtlC(requestData) {
    var response = false;
    var steps_rename_copy_url = getConfig('zdar_calc_engine_bind');
    $.each(requestData, function (index, data) {
        if (data.Action == 'R') {
            var request = getRenameCopyStepsItemData(data);
            response = callWebService(steps_rename_copy_url, request, 'ZdarCalcDtlCResponse');
        }
    });
    $.each(requestData, function (index, data) {
        if (data.Action == 'C') {
            var request = getRenameCopyStepsItemData(data);
            response = callWebService(steps_rename_copy_url, request, 'ZdarCalcDtlCResponse');
        }
    });
    return response;
}

/**
 * Webservice - Calc Step Write
 */
function WsCalcDtlW(requestData, action = '') {
    var request_items = getStepsItemData(requestData);
    var steps_write_url = getConfig('zdar_calc_engine_bind');
    var emptyItem = `<item>
                        <Environment></Environment>
                        <CalcId></CalcId>
                        <StepId></StepId>
                        <StepDescr></StepDescr>
                        <StepOrder></StepOrder>
                        <Criteria></Criteria>
                        <Calculation></Calculation>
                        <ResultDimOvr></ResultDimOvr>
                        <WriteResults></WriteResults>
                        <ReuseResultsInCalc></ReuseResultsInCalc>
                        <ReuseResultsInGrp></ReuseResultsInGrp>
                        <RepeatStep></RepeatStep>
                        <Enabled></Enabled>
                        <DateTimeLastChanged></DateTimeLastChanged>
                        <UserIdLastChange></UserIdLastChange> 
                    </item>`;

    if (action === "M") {
        var request = `<tns:ZdarCalcDtlW>
                                <Tdelete>`+ emptyItem + `</Tdelete>
                                <Tmodify>`+ request_items + `</Tmodify>                      
                            </tns:ZdarCalcDtlW>`;
    } else if (action === "D") {
        var request = `<tns:ZdarCalcDtlW>
                                <Tdelete>`+ request_items + `</Tdelete>
                                <Tmodify>`+ emptyItem + `</Tmodify>                      
                            </tns:ZdarCalcDtlW>`;
    }
    return callWebService(steps_write_url, request, 'ZdarCalcDtlWResponse');
}

/**
 * Save calculation
 */
function saveCalculation(activate_key = '') {
    var context_menu_action = $("#param-context-menu-action").val();
    var node_title = $("#param-context-menu-title").val();
    if ($('.calculation-save').hasClass('btn-primary') && !validateCalculationForm()) {
        try {
            if ($.trim(getParamCalcId()) === '') {
                var check_exist = getWsCalcHdrRBind($("#calc-id").val());
                if (typeof (check_exist) !== 'undefined') {
                    $(".calc-error-message").text('Calculation Already Exist');
                    loader('hide');
                } else {
                    $(".calc-error-message").text('');
                    $("#param-calc-id").val($("#calc-id").val());
                }
            }
            if ($.trim(getParamCalcId()) !== '') {
                var calculation_data = getLocalStorage('calculation_data');
                resetCalculationDetailLocalStorage();
                var calc_data = $("#calculation-form").serializeArray();
                var fancytree_load = false;
                var update_calc_header = false;
                var calc_result = {};
                $.each(calc_data, function () {
                    calc_result[this.name] = this.value;
                });
                calc_result['AggregateDims'] = ($("#aggregate-dims").val() !== null) ? $("#aggregate-dims").val().join(', ') : '';
                var aggregate_function = $("#aggregate-function").val();
                if ($("#aggregate-dims").val() !== null && aggregate_function !== 'SUM') {
                    calc_result['AggregateDims'] = 'AGG_FUNCTION=' + aggregate_function + ', ' + calc_result['AggregateDims'];
                }
                calc_result['RemDataFromMini'] = (calc_result['RemDataFromMini'] === 'N') ? '' : calc_result['RemDataFromMini'];
                if ($('#calculation-form-step-0 .bk-yellow').length > 0) {
                    WsCalcHdrW(calc_result);
                    if ($('#source-id').val() != $('#source-id-default').val()) {
                        fancytree_load = true;
                    }
                    update_calc_header = true;
                    $('#rem-data-default').val($('.rem-data:checked').val());
                    $('#rem-data-temp').val($('.rem-data:checked').val());
                    getWsCalcHdrRBind(getParamCalcId(), true, loadCalculationHeaderData);
                }
                calc_result.GroupId = getParamCalcGroupId();
                var driverItemData = getModifiedDriverData();
                if (driverItemData.length > 0) {
                    WsCalcDrvW(driverItemData, 'M');
                    updateDriverDataTable();
                }

                var fancytree_reorder_update = false;
                if ($('.calculation-step-table .bk-yellow').length > 0 || $('#param-calculations-sort-order').val() > 0) {
                    if ($('#param-calculations-sort-order').val() > 0) {
                        var stepItemData = getModifiedStepData('order');
                        fancytree_reorder_update = true;
                    } else {
                        var stepItemData = getModifiedStepData();
                    }
                    WsCalcDtlW(stepItemData, 'M');

                    /* Fancytree update for step re-order */
                    if (fancytree_reorder_update) {
                        ftReorderNode('step');
                    }

                    updateStepDataTable();
                    $('#param-calculations-sort-order').val(0);
                }
                if (context_menu_action == 'new-step') {
                    openStepForm('', 'add');
                }
                if (context_menu_action === 'step-rename') {
                    renameStep(node_title, 'R', 'Rename Step');
                } else if (context_menu_action === 'step-copy') {
                    renameStep(node_title, 'C', 'Copy Step');
                }
                if ($('.connect-environment-table .selected').attr('env_change_trigger') != '1') {
                    if (activate_key != '') {
                        setActiveNodeFancytree(activate_key);
                    } else {
                        calculationFancytreeReload();
                    }
                    if (fancytree_load) {
                        updateFancyTreeGroup(getParamCalcGroupId(), getParamModelId(), '');
                    }
                }
                if (update_calc_header) {
                    var calc_group_id = getParamCalcGroupId();
                    getWsCgCalcsRBind(calc_group_id, '%', true, updateCalculationsLocalCacheData);
                }

                $('.bk-yellow').removeClass('bk-yellow');
                $('.cm-yellow').removeClass('cm-yellow');
                $("#param-calculations-sort-order").val(0);
                $('.calculation-step-table [type=checkbox]').removeAttr("disabled");
                $('.calculation-driver-table [type=checkbox]').removeAttr("disabled");
                $('.calculation-driver-table .checker,.calculation-step-table .checker').removeClass('disabled');
                $('.calculation-save').removeClass('btn-primary');
            }
        } catch (error) {
            displayCatchError('calculation-save-error');
            return false;
        }
    } else {
        loader('hide');
    }
}

/**
 * Get modified driver data
 */
function getModifiedDriverData(action = '') {
    try {
        var items = [];
        var CalcId = getParamCalcId();
        $('.calculation-driver-table > tbody > tr.bk-yellow .driver_data').each(function () {
            var driverData = JSON.parse(unescape($(this).val()));
            driverData.CalcId = CalcId;
            items.push(driverData);
        });
        return items;
    } catch (error) {
        displayCatchError('calculation-driver-table');
        return false;
    }
}

/**
 * Get driver item data
 */
function getDriverItemData(items = []) {
    var return_items = '';
    $.each(items, function (index, data) {
        return_items += `<item>
                <Environment>${getEnvironment()}</Environment>
                <CalcId>${data.CalcId}</CalcId>
                <DriverId>${data.DriverId}</DriverId>
                <DriverDescr>${replaceSpecialCharacters(data.DriverDescr)}</DriverDescr>
                <DriverType>${data.DriverType}</DriverType>
                <SourceId>${data.SourceId}</SourceId>
                <Dimension>${data.Dimension}</Dimension>
                <DimAttribute>${data.DimAttribute}</DimAttribute>
                <DriverLookupOverride>${replaceSpecialCharacters(data.DriverLookupOverride)}</DriverLookupOverride>
                <DimsToIgnoreInLkup>${replaceSpecialCharacters(data.DimsToIgnoreInLkup)}</DimsToIgnoreInLkup>
                <CalcYtd></CalcYtd>
                <RepeatDriver>${replaceSpecialCharacters(data.RepeatDriver)}</RepeatDriver>
                <DriverOptions>${replaceSpecialCharacters(data.DriverOptions)}</DriverOptions>
                <Enabled>${data.Enabled}</Enabled>
                <DateTimeLastChanged>${getLastChangedDateTime()}</DateTimeLastChanged>
                <UserIdLastChange>${getCurrentUserName()}</UserIdLastChange>
            </item>`;
    });
    return return_items;
}

/**
 * Get rename copy drivers item data
 */
function getRenameCopyDriversItemData(item) {
    return `<tns:ZdarCalcDrvC>
                <Action>${item.Action}</Action>
                <Env>${getEnvironment()}</Env>
                <Calcid>${item.CalcId}</Calcid>
                <Fromdriverid>${item.Fromdriverid}</Fromdriverid>
                <Todriverid>${item.DriverId}</Todriverid>
            </tns:ZdarCalcDrvC>`;
}

/**
 * Get modified step data
 */
function getModifiedStepData(action = '') {
    try {
        var items = [];
        var CalcId = getParamCalcId();
        var tr_calss = '.bk-yellow';
        if (action === 'all' || action === 'order') {
            tr_calss = '';
        }
        var i = 1;
        $('.calculation-step-table > tbody > tr' + tr_calss + ' .step_data').each(function () {
            var stepData = JSON.parse(unescape($(this).val()));
            stepData.CalcId = CalcId;
            if (action == 'order') {
                stepData.StepOrder = ("0000" + i).substr(-4, 4);
                i++;
            }
            items.push(stepData);
        });
        return items;
    } catch (error) {
        displayCatchError('calculation-step-table');
        return false;
    }
}

/**
 * Get steps item data
 */
function getStepsItemData(items = []) {
    var return_items = '';
    var CalcId = getParamCalcId();
    var UserIdLastChange = getCurrentUserName();
    var StepOrder = 1;
    $.each(items, function (index, data) {
        return_items += `<item>
                <Environment>${getEnvironment()}</Environment>
                <CalcId>${CalcId}</CalcId>
                <StepId>${data.StepId}</StepId>
                <StepDescr>${replaceSpecialCharacters(data.StepDescr)}</StepDescr>
                <StepOrder>${data.StepOrder}</StepOrder>
                <Criteria>${replaceSpecialCharacters(data.Criteria)}</Criteria>
                <Calculation>${replaceSpecialCharacters(data.Calculation)}</Calculation>
                <ResultDimOvr>${replaceSpecialCharacters(data.ResultDimOvr)}</ResultDimOvr>
                <WriteResults>${data.WriteResults}</WriteResults>
                <ReuseResultsInCalc>${data.ReuseResultsInCalc}</ReuseResultsInCalc>
                <ReuseResultsInGrp>${data.ReuseResultsInGrp}</ReuseResultsInGrp>
                <RepeatStep>${data.RepeatStep}</RepeatStep>
                <Enabled>${data.Enabled}</Enabled>
                <DateTimeLastChanged>${getLastChangedDateTime()}</DateTimeLastChanged>
                <UserIdLastChange>${UserIdLastChange}</UserIdLastChange>                      
            </item>`;
    });
    return return_items;
}

/**
 * Get rename copy steps item data
 */
function getRenameCopyStepsItemData(item) {
    return `<tns:ZdarCalcDtlC>
                <Action>${item.Action}</Action>
                <Env>${getConfig('environment')}</Env>
                <Calcid>${getParamCalcId()}</Calcid>
                <Fromstepid>${item.Fromstepid}</Fromstepid>
                <Tostepid>${item.StepId}</Tostepid>
                <Steporder>${item.StepOrder}</Steporder>
            </tns:ZdarCalcDtlC>`;
}

/**
 * Get calculation write item data
 */
function getCalculationWriteItemData(data) {
    return `<item>
            <Environment>${getConfig('environment')}</Environment>
            <CalcId>${data.CalcId}</CalcId>
            <CalcDescr>${replaceSpecialCharacters(data.CalcDescr)}</CalcDescr>
            <SourceId>${data.SourceId}</SourceId>
            <TargetId>${data.TargetId}</TargetId>
            <CalcDataAlias>${data.CalcDataAlias}</CalcDataAlias>
            <CalcDataFilter>${replaceSpecialCharacters(data.CalcDataFilter)}</CalcDataFilter>
            <AggregateDims>${data.AggregateDims}</AggregateDims>
            <CalcYtd>${data.CalcYtd}</CalcYtd>
            <RemDataFromMini></RemDataFromMini>
            <Enabled>Y</Enabled>
            <DateTimeLastChanged>${getLastChangedDateTime()}</DateTimeLastChanged>
            <UserIdLastChange>${getConfig('logged_user')}</UserIdLastChange>	
        </item>`;
}

/**
 * Add step id field
 */
function addStepIdField(action = 'add') {
    $('.step-error-message').html('');
    if (action === 'add') {
        $('.step-id-rename').addClass('hide');
        $('#step-id').removeAttr('readonly');
    } else {
        $('.step-id-rename').removeClass('hide');
        $('#step-id').attr('readonly');
    }
    $('#step-form #step_action').val(action);
}

/**
 * Add driver table row
 */
function addDriverTableRow(item, tr_calss = '', disabled = '') {
    jQuery.each(['Environment'], function (i, key) {
        if (key in item) {
            delete item[key];
        }
    });
    var checked = '';
    var repeatDriverClass = driverOptionsClass = dimsToIgnoreInLkupClass = 'label-lite-grey';
    var repeatDriverPopover = driverOptionsPopover = dimsToIgnoreInLkupPopover = '';
    var driverType = getCalculationDriverType(item.DriverType);
    if (item.Enabled == "-1" || item.Enabled == "Y") { checked = "checked" }
    if (item.RepeatDriver !== '') {
        repeatDriverClass = 'label-lite-green';
        repeatDriverPopover = `data-popup="driver-popover-custom" data-title="REPEAT DRIVER" data-placement="left" data-content="${item.RepeatDriver}"`;
    }
    if (item.DriverOptions !== '') {
        driverOptionsClass = 'label-lite-green';
        driverOptionsPopover = `data-popup="driver-popover-custom" data-title="DRIVER OPTIONS" data-placement="left" data-content="${item.DriverOptions}"`;
    }
    if (item.DimsToIgnoreInLkup !== '') {
        dimsToIgnoreInLkupClass = 'label-lite-green';
        dimsToIgnoreInLkupPopover = `data-popup="driver-popover-custom" data-title="DIMENSIONS TO IGNORE IN LOOKUP" data-placement="left" data-content="${item.DimsToIgnoreInLkup}"`;
    }
    list = '';
    list += `<tr class="text-center ${tr_calss} row_${item.DriverId}">
        <td class="text-center"><div class="checker">
        <input type="hidden" class="driver_data" id="driver_${item.DriverId}" value="${escape(JSON.stringify(item))}">
        <input type="checkbox" ${checked} attr-id="${item.DriverId}" class="styled driver-enable-checkbox" attr-value="Enabled" ${disabled}></div>
        </td>
        <td><a href="javascript:void(0);" class="driver-title edit-driver" attr-id="${item.DriverId}"><span class="text-overflow">${item.DriverId}</span></a></td>
        <td><span class="label ${driverType.class} label-block">${driverType.name}</span></td>
        <td width="100px">
            <div class="advanced-options text-center">
                <span class="label ${repeatDriverClass}" ${repeatDriverPopover}>R</span>
                <span class="label ${driverOptionsClass}" ${driverOptionsPopover}>O</span>
                <span class="label ${dimsToIgnoreInLkupClass}" ${dimsToIgnoreInLkupPopover}>N</span>
            </div>
        </td>`;
    if ($.trim(item.DriverType) == "MASTER_DATA") {
        list += `<td>${item.Dimension}</td>
                <td>${item.DimAttribute}</td>
                <td>`;
    } else {
        list += `<td>${item.SourceId}</td>
                <td></td>
                <td>`;
    }
    if ($.trim(item.DriverLookupOverride)) {
        list += `<span class="text-overflow-description" data-title="LOOKUP OVERRIDE" data-popup="driver-popover-custom" data-placement="left" data-content="${item.DriverLookupOverride}">${item.DriverLookupOverride}</span>`;
    }
    list += `</td></tr>`;
    return list;
}

/**
 * Add step table row
 */
function addStepTableRow(item, index = '', tr_calss = '', disabled = '') {
    jQuery.each(['Environment'], function (i, key) {
        if (key in item) {
            delete item[key];
        }
    });
    var repeatStepPopover = criteriaPopover = calculationPopover = resultDimOvrPopover = '';
    if ((item.RepeatStep !== "")) {
        repeatStepPopover = `data-popup="step-popover-custom" data-placement="left" data-title="REPEAT STEP PARAMETER" data-content="${item.RepeatStep}"`;
    }
    if (item.Criteria !== "") {
        criteriaPopover = `data-popup="step-popover-custom" data-placement="left" data-title="CRITERIA" data-content="${item.Criteria}"`;
    }
    if (item.Calculation !== "") {
        calculationPopover = `data-popup="step-popover-custom" data-placement="left" data-title="CALCULATION" data-content="${item.Calculation}"`;
    }
    if (item.ResultDimOvr !== "") {
        resultDimOvrPopover = `data-popup="step-popover-custom" data-placement="left" data-title="DESTINATION" data-content="${item.ResultDimOvr}"`;
    }
    var tr_row = `<tr id="row_${item.StepId}" class="steporder ${tr_calss} row_${item.StepId}" attr-index="${index}">               
                <td class="text-center drag-bar" data-id="${index}"><i class="icon-three-bars"></i></td>
                <td class="text-center"><div class="checker"><input type="hidden" class="step_data" id="step_${item.StepId}" value="${escape(JSON.stringify(item))}">
                <input type="checkbox" ${(item.Enabled == '-1' || item.Enabled == 'Y') ? 'checked' : ''} class="styled" attr-value="Enabled" ${disabled}></div></td>
                <td><a href="javascript:void(0);" class="step-title edit-step" attr-id="${item.StepId}"><span class="text-overflow">${item.StepId}</span></a></td>
                <td class="text-center"><div class="checker"><input type="checkbox" ${(item.WriteResults == '-1') ? 'checked' : ''} class="styled" attr-value="WriteResults" ${disabled}></div></td>
                <td class="text-center"><div class="checker"><input type="checkbox" ${(item.ReuseResultsInCalc == '-1') ? 'checked' : ''} class="styled" attr-value="ReuseResultsInCalc" ${disabled}></div></td>
                <td class="text-center"><div class="checker"><input type="checkbox" ${(item.ReuseResultsInGrp == '-1') ? 'checked' : ''} class="styled" attr-value="ReuseResultsInGrp" ${disabled}></div></td>
                <td><span ${repeatStepPopover} class="label ${(item.RepeatStep !== '') ? 'label-lite-green' : 'label-grey'} label-block">RPT</span></td>
                <td><span class="text-overflow-description" ${criteriaPopover}>${item.Criteria}</span></td>
                <td><span class="text-overflow-description" ${calculationPopover}>${item.Calculation}</span></td>
                <td><span class="text-overflow-description" ${resultDimOvrPopover}>${item.ResultDimOvr}</span></td>
            </tr>`;
    return tr_row;
}

/**
 * Copy driver
 */
function copyDriver(from_driver_id) {
    var action = 'C';
    var title = "Copy Driver";
    renameDriver(from_driver_id, action, title);
}

/**
 * Rename driver
 */
function renameDriver(from_driver_id, action, title) {
    try {
        if ($('.calculation-driver-table').find('.bk-yellow').length > 0 || $('.calculation-step-table .bk-yellow').length > 0) {
            var DriverParams = new Object()
            DriverParams.action = action
            DriverParams.title = title
            DriverParams.from_driver_id = from_driver_id
            DriverParams.saveChange = 'copyDriverE'
            if ($('.calculation-step-table').find('.bk-yellow').length > 0) {
                DriverParams.selector = 'calculation-step-table'
                DriverParams.selectorLen = $('.calculation-step-table').find('.bk-yellow').length
            } else if ($('.calculation-driver-table').find('.bk-yellow').length > 0) {
                DriverParams.selector = 'calculation-driver-table'
                DriverParams.selectorLen = $('.calculation-driver-table').find('.bk-yellow').length
            }
            trackFormChanges('', false, true, DriverParams);
            return false;
        }
        $("#rename-driver-modal #rename-copy-driver-id").removeClass('bk-yellow');
        if (from_driver_id != '') {
            var copy_driver_id = from_driver_id;
            if (action == 'C') {
                var copy_id = '';
                var current_id = from_driver_id;
                var response = '';
                while (copy_id == '') {
                    copy_id = getCopyID(current_id);
                    var exist = checkDriverExist(copy_id);
                    if (!exist) {
                        copy_driver_id = copy_id;
                    } else {
                        current_id = copy_id;
                        copy_id = '';
                    }
                }

                $("#rename-driver-modal #rename-copy-driver-id").addClass('bk-yellow');
                updateToPrimaryBtn("#rename-driver-modal .btn-submit");
            } else {
                updateToGreyBtn("#rename-driver-modal .btn-submit");
            }
            $("#rename-driver-modal .modal-title").html(title);
            $("#rename-copy-driver-id").val(copy_driver_id);
            $("#default-driver-id").val(from_driver_id);
            $("#driver-modal-action").val(action);
            $(".rename-driver-error-message").text('');
            $('#rename-driver-modal .text-red').html('');
            $('#rename-driver-modal').modal({ backdrop: 'static', keyboard: false });
        }
    } catch (error) {
        displayCatchError('driver-rename-error');
        return false;
    }
}

/**
 * Confirm delete driver
 */
function confirmDeleteDriver(driver_id) {
    loader('show', false);
    setTimeout(function () {
        try {
            var driver_form_vaules = JSON.parse(unescape($("#driver_" + driver_id).val()));
            driver_form_vaules.CalcId = getParamCalcId();
            var requestDriverItem = [];
            requestDriverItem[0] = driver_form_vaules;
            var promise = new Promise((res, rej) => {
                res(WsCalcDrvW(requestDriverItem, 'D'));
            });
            promise.then(() => {
                var ft_key = $("li." + getParamModelId() + "_" + getParamCalcGroupId() + " li." + getParamCalcGroupId() + "_" + getParamCalcId() + " li.Drivers_" + driver_id).attr('key');
                if (typeof ft_key != 'undefined' && ft_key != 'undefined' && getParamCalcId() != '') {
                    ftDeleteNode(ft_key);
                }
                updateDriverDataTable();
                updateFancyTreeGroup(getParamCalcGroupId(), getParamModelId(), '', { calc_id: getParamCalcId(), action: 'U' }, false);
            });
            loader('hide');
        } catch (error) {
            displayCatchError('delete-driver-error');
            return false;
        }
    }, 1);
}

/**
 * Delete driver
 */
function deleteDriver(driver_id = '') {
    try {
        if ($('.calculation-driver-table').find('.bk-yellow').length > 0 || $('.calculation-step-table .bk-yellow').length > 0) {
            var stepDelDriver = new Object()
            stepDelDriver.driver_id = driver_id
            stepDelDriver.saveChange = 'DeleteDriverE';
            if ($('.calculation-step-table').find('.bk-yellow').length > 0) {
                stepDelDriver.selector = 'calculation-step-table'
                stepDelDriver.selectorLen = $('.calculation-step-table').find('.bk-yellow').length
            } else if ($('.calculation-driver-table').find('.bk-yellow').length > 0) {
                stepDelDriver.selector = 'calculation-driver-table'
                stepDelDriver.selectorLen = $('.calculation-driver-table').find('.bk-yellow').length
            }
            trackFormChanges('', false, true, stepDelDriver);
            return false;
        }
        confirmDeletionDialog('<p>Are you sure you want to delete driver ID ' + driver_id + '?</p>', confirmDeleteDriver, driver_id);
    } catch (error) {
        displayCatchError('calc-driver-data');
        return false;
    }
}

/**
 * Rename step
 */
function renameStep(step_id, action, title) {
    try {
        if ($('.calculation-step-table ').find('.bk-yellow').length > 0 || $('.calculation-driver-table .bk-yellow').length > 0) {
            var stepParams = new Object()
            stepParams.action = action
            stepParams.title = title
            stepParams.step_id = step_id
            stepParams.saveChange = 'copyStepE';
            if ($('.calculation-step-table').find('.bk-yellow').length > 0) {
                stepParams.selector = 'calculation-step-table'
                stepParams.selectorLen = $('.calculation-step-table').find('.bk-yellow').length
            } else if ($('.calculation-driver-table').find('.bk-yellow').length > 0) {
                stepParams.selector = 'calculation-driver-table'
                stepParams.selectorLen = $('.calculation-driver-table').find('.bk-yellow').length
            }
            trackFormChanges('', false, true, stepParams);
            return false;
        }

        if ($('#param-calculations-sort-order').val() > 0) {
            if (action == 'R') {
                $("#param-context-menu-action").val('rename');
                trackFormChanges('', false, true, stepParams);
                return false
            } else {
                $("#param-context-menu-action").val('copy');
            }
            $("#param-context-menu-title").val(step_id);
            return false;
        }
        $("#rename-step-modal #rename-copy-step-id").removeClass('bk-yellow');
        if (step_id != '') {
            var copy_step_id = '';
            if (action == 'C') {
                var current_step_id = step_id;
                while (copy_step_id == '') {
                    copy_step_id = getCopyID(current_step_id);
                    current_step_id = copy_step_id;
                    if (!checkStepIdExist(current_step_id)) {
                        copy_step_id = current_step_id;
                    } else {
                        copy_step_id = '';
                    }
                }
                $("#rename-step-modal #rename-copy-step-id").addClass('bk-yellow');
                updateToPrimaryBtn("#rename-step-modal .btn-submit");
            } else {
                copy_step_id = step_id;
                updateToGreyBtn("#rename-step-modal .btn-submit");
            }
            $("#temp-step-id").val('');
            if (action == 'R') {
                stepItemData = JSON.parse(unescape($('.calculation-step-table #step_' + step_id).val()));
                if (typeof stepItemData.Fromstepid != 'undefined' && stepItemData.Fromstepid != '') {
                    $("#temp-step-id").val(step_id);
                    step_id = stepItemData.Fromstepid;
                }
            }
            $("#rename-step-modal .modal-title").html(title);
            $("#rename-copy-step-id").val(copy_step_id);
            $("#default-step-id").val(step_id);
            $("#rename-step-modal-action").val(action);
            $(".step-error-message").text('');

            $('#rename-step-modal .text-red').html('');
            $('#rename-step-modal').modal({ backdrop: 'static', keyboard: false });
        }
    } catch (error) {
        displayCatchError('step-rename-error');
        return false;
    }
}
/**
 * Confirm delete step 
 */
function confirmDeleteStep(step_id) {
    if ($('.calculation-step-table tr.row_' + step_id)[0]) {
        loader('show', false);
        setTimeout(function () {
            try {
                stepItemData = JSON.parse(unescape($('.calculation-step-table #step_' + step_id).val()));
                var requestStepItem = [];
                requestStepItem[0] = stepItemData;
                var promise = new Promise((res, rej) => {
                    res(WsCalcDtlW(requestStepItem, 'D'));
                });
                promise.then(() => {
                    var ft_key = $("li." + getParamModelId() + "_" + getParamCalcGroupId() + " li." + getParamCalcGroupId() + "_" + getParamCalcId() + " li.Steps_" + step_id).attr('key');
                    if (typeof ft_key != 'undefined' && ft_key != 'undefined' && getParamCalcId() != '') {
                        ftDeleteNode(ft_key);
                    }
                    updateStepDataTable();
                    updateFancyTreeGroup(getParamCalcGroupId(), getParamModelId(), '', { calc_id: getParamCalcId(), action: 'U' }, false);
                });
                loader('hide');
            } catch (error) {
                displayCatchError('delete-step-error');
                return false;
            }
        }, 1);
    }

}
/**
 * Delete step 
 */
function deleteStep(step_id) {
    try {
        if ($('.calculation-step-table ').find('.bk-yellow').length > 0 || $('.calculation-driver-table .bk-yellow').length > 0) {
            var stepDelParams = new Object()
            stepDelParams.step_id = step_id
            stepDelParams.saveChange = 'DeleteStepE';
            if ($('.calculation-step-table').find('.bk-yellow').length > 0) {
                stepDelParams.selector = 'calculation-step-table'
                stepDelParams.selectorLen = $('.calculation-step-table').find('.bk-yellow').length
            } else if ($('.calculation-driver-table').find('.bk-yellow').length > 0) {
                stepDelParams.selector = 'calculation-driver-table'
                stepDelParams.selectorLen = $('.calculation-driver-table').find('.bk-yellow').length
            }
            trackFormChanges('', false, true, stepDelParams);
            return false;
        }

        confirmDeletionDialog('<p>Are you sure you want to delete step ID ' + step_id + '?</p>', confirmDeleteStep, step_id);
    } catch (error) {
        displayCatchError('calc-step-data');
        return false;
    }
}

