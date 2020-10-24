var db;
var request = window.indexedDB.open("DarwinDB_Platform", 1);

request.onerror = function (event) {
    db.close();
};

request.onsuccess = function (event) {
    db = request.result;

};
request.onupgradeneeded = function (event) {
    var db = event.target.result;
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    var isEdge = !isIE && !!window.StyleMedia;
    if (isEdge) {
        db.createObjectStore("evo", { keyPath: "key" });
    } else {
        db.createObjectStore("evo", { keyPath: ["environment", "key"] });
    }
}

/**
 * Get indexed db storage
 */
function getIndexedDBStorage(key, evn) {
    if (typeof key === 'undefined') {
        return false;
    }
    if (typeof evn === 'undefined') {
        evn = true;
    }
    var transaction = (db && typeof (db.transaction(["evo"], 'readonly')) != undefined && (db.transaction(["evo"], 'readonly')) != null) ? db.transaction(["evo"], 'readonly') : null;

    if (typeof transaction != undefined && transaction != null) {
        var objectStore = transaction.objectStore("evo");
        var rtn;
        key = key.toUpperCase();
        key = getSessionTabID(key);
        if (evn) {
            var env = getEnvironment();
        }
        else {
            var env = '_';
        }
        if (key !== '') {
            env = (typeof env !== 'undefined') ? env : '';
            var isIE = /*@cc_on!@*/false || !!document.documentMode;
            var isEdge = !isIE && !!window.StyleMedia;
            if (isEdge) {
                key = env + '_' + key;
                rtn = objectStore.get(key);
            } else {
                rtn = objectStore.get([env, key]);
            }
            if (getConfig('development_mode') === 'on') {
                return new Promise(function (resolve) {
                    transaction.oncomplete = function (e) { resolve(rtn.result.value) };
                })
            } else {
                return new Promise(function (resolve) {
                    transaction.oncomplete = function (e) {
                        if (rtn.readyState === 'done') {
                            if (typeof rtn.result !== 'undefined') {
                                resolve(JSON.parse(LZString.decompressFromBase64(rtn.result.value)));
                            } else {
                                resolve('');
                            }
                        }
                    }
                })
            }
        } else {
            return false;
        }
    }
}

/**
 * Set indexed db storage
 */
async function setIndexedDBStorage(key = '', value = '', evn = true, evn_id = '') {
    var transaction = (db && typeof (db.transaction(["evo"], 'readwrite')) != undefined && (db.transaction(["evo"], 'readwrite')) != null) ? db.transaction(["evo"], 'readwrite') : null;
    if (typeof transaction != undefined && transaction != null) {
        var objectStore = transaction.objectStore("evo");
        var rtn;
        key = key.toUpperCase();
        key = getSessionTabID(key);
        if (evn) {
            if (evn_id) {
                var env = evn_id;
            } else {
                var env = getEnvironment();
            }
        }
        else {
            var env = '_'
        }
        if (key !== '') {
            var isIE = /*@cc_on!@*/false || !!document.documentMode;
            var isEdge = !isIE && !!window.StyleMedia;
            if (isEdge) {
                key = env + '_' + key;
            }
            if (getConfig('development_mode') === 'on') {
                if (isEdge) {
                    rtn = objectStore.put({ "key": key, "value": value });
                } else {
                    rtn = objectStore.put({ "environment": env, "key": key, "value": value });
                }
            } else {
                value = JSON.stringify(value);
                if (isEdge) {
                    rtn = objectStore.put({ "key": key, "value": LZString.compressToBase64(value) });
                } else {
                    rtn = objectStore.put({ "environment": env, "key": key, "value": LZString.compressToBase64(value) });
                }
            }
            return new Promise((resolve, reject) => {
                rtn.onsuccess = e => resolve(true);
            })
        } else {
            return false;
        }
    }
}
$(window).load(function () {
    $('li.connect-environment').removeClass('active');
});
$(document).ready(function () {
    // tab session id generated
    defineTabID();
    minWebserviceCall();
    resetDefaultWizardStep();
    $('.sidebar-category .category-content').html(get_top_menubar_html("landing"));
    timemachineRefresh();
    updateCacheVersion();
    updateUserEnvList();
    updateDisplayName();
    updateLocalStorage();
    updateClientNumber();
});

// Generate fancytree
async function generateFancyTree(refresh = false, destroyExist = false) {
    try {
        var response = await getFancyTreeData();
        if (!refresh) {
            if (response === '' || response === null) {
                response = await setFancyTree(true);
            }
        } else if (refresh) {
            response = await setFancyTree(true);
        }
        var ftFlag = true;
        if (response == null || response == '' || !response) {
            ftFlag = false;
        }
        if (Array.isArray(response)) {
            if (response[0] == 'DYNAMIC') {
                ftFlag = false;
            }
        }
        if (!ftFlag) {
            $('.fancytree-structure, .fancytree-calc-structure').html('<span class="text-red">Warning! No Calc Group found in this environment.</span>');
            removeSpin('.tree-refresh');
            $('.ft-treeview').trigger('click');
            return false;
        }
        if (destroyExist) {
            $(".fancytree-structure").fancytree("destroy");
        }
        var active_new_node = true;
        var load_content = true;
        $(".fancytree-structure").fancytree({
            extensions: ["childcounter"],
            childcounter: {
                deep: false,
                hideZeros: true
            },
            source: response,
            activeVisible: true,
            renderNode: function (event, data) {
                var node = data.node;
                var parentCls = node.parent.title;
                var nodeCls = node.title;
                if (parentCls == "(unassigned)") {
                    parentCls = 'unassigned';
                }
                if (nodeCls == "(unassigned)") {
                    nodeCls = 'unassigned';
                }
                $(node.li).addClass(parentCls + '_' + nodeCls).attr('key', data.node.key);
            },
            beforeActivate: function (event, data) {
                if (!check_connectivity()) {
                    return false;
                }
                $('.fancytree-structure').find('.fancytree-active').removeClass('fancytree-active');
                var title = data.node.title;
                if (title === 'DYNAMIC' || title === '(unassigned)') {
                    return false;
                }
                var current_node_key = $('#param-active-node-key').val();
                if (current_node_key) {
                    var ft = $(".fancytree-structure").fancytree("getTree");
                    var current_node = ft.getNodeByKey(current_node_key);
                    if (current_node) {
                        if ((current_node.getLevel() != data.node.getLevel()) && data.node.getLevel() <= 3 && current_node.getLevel() <= 3) {
                            resetDefaultWizardStep();
                        }
                    }
                }
                var level = data.node.getLevel();
                var form_track = $("#param-form-track").val();
                var current_calc_node_key = $("#param-calc-node-key").val();
                var formTrack = true;
                if (form_track == 1) {
                    formTrack = false;
                    $("#param-form-track").val('');
                }
                /* Check the node is calculation or step or driver to avoid trackFormChanges*/
                if (current_calc_node_key !== '') {
                    if (level == 3 && data.node.key == current_calc_node_key) {
                        formTrack = false;
                    }
                    if (level == 4) {
                        var act_calc_node = data.node.getParent();
                        if (act_calc_node.key == current_calc_node_key) {
                            formTrack = false;
                        }
                    }
                    if (level == 5) {
                        var act_calc_node = data.node.parent.getParent();
                        if (act_calc_node.key == current_calc_node_key) {
                            formTrack = false;
                        }
                    }
                }
                if (formTrack) {
                    active_new_node = trackFormChanges(data.node.key);
                    if (!active_new_node) {
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
            },
            click: function (event, data) {
                var node = data.node;
                var node_level = node.getLevel();
                if (event.which == 3) { /* RightClick add focus on selected node*/
                    $(".fancytree-structure .fancytree-node.fancytree-active").removeClass('fancytree-active');
                    $(node.span).addClass('fancytree-active');
                    return false;
                }
                if (event.button == 2) {
                    event.preventDefault();
                }
                switch (node_level) {
                    case 5:
                        var calc_child_node = (node_level === 5) ? data.node.getParent() : data.node;
                        var calc_node = calc_child_node.getParent();
                        var calc_grp_node = calc_node.getParent();
                        if (calc_grp_node.title != getParamCalcGroupId()) {
                            $('.calculation-section').remove();
                        }
                        if (calc_child_node.title == 'Steps' && node_level == 5) {
                            if ($('#step-form')[0]) {
                                //$('.calculation-step-table tr.row_' + data.node.title + ' .step-title').click();
                            }
                        }
                        if (calc_child_node.title == 'Drivers' && node_level == 5) {
                            if ($('#driver-form')[0]) {
                                //$('.calculation-driver-table tr.row_' + data.node.title + ' .driver-title').click();
                            }
                        }
                }

            },
            select: function (event, data) {
            },
            activate: function (event, data) {
                event.preventDefault();
                load_content = true;
                var node_level = data.node.getLevel();
                if ($("#param-context-menu-action").val() === '') {
                    $("#param-active-node-key").val(data.node.key);
                }
                var is_new_data = $("#param-new-cg").val();
                if ($.trim(is_new_data) === '') {
                    switch (node_level) {
                        case 1:
                            $("#param-model-id").val(data.node.title);
                            $("#param-calc-group-id").val('');
                            $("#param-calc-id").val('');
                            $("#param-load-calc-group").val(1);
                            var promise = new Promise((res, rej) => {
                                $("#content").load('assets/spaces/darce/cg_main/cg_main.html?' + Math.random());
                                calcModelFancytreeReload();
                                res('');
                            });
                            promise.then(() => {
                                loadSideBarCalcGroupList();
                            });
                            break;
                        case 2:
                            var node_parent = data.node.getParent();
                            $("#param-model-id").val(node_parent.title);
                            $("#param-load-calc-group").val(1);

                            if (data.node.title === getParamCalcGroupId()) {
                                load_content = false;
                            }
                            $("#param-calc-group-id").val(data.node.title);
                            if ($('.calc-group-refresh').hasClass('active') || $('.calculation-back').hasClass('active')) {
                                load_content = true;
                            }
                            if (load_content || !$('.cg-detail-form-content')[0]) {
                                if (load_content) removeLocalStorage('calc_group_detail_local_cache');

                                $("#content").load('assets/spaces/darce/cg_detail/cg_detail.html?' + Math.random());
                            }
                            break;
                        case 3:
                            $("#param-calc-id").val(data.node.title);
                            $("#param-calc-node-key").val(data.node.key);
                            var calc_grp = data.node.getParent();
                            $("#param-calc-group-id").val(calc_grp.title);
                            var group_model = calc_grp.getParent();
                            $("#param-model-id").val(group_model.title);
                            load_content = true;
                            if (data.node.title === $('#calc-id').val()) {
                                load_content = false;
                            }
                            if ($('.calculation-refresh').hasClass('active')) {
                                load_content = true;
                            }
                            if (load_content) {
                                loadCalculationContent(data.node);
                            } else {
                                $('#calculation-form-head-0').click();
                            }
                            break;
                        case 4:
                        case 5:
                            var calc_child_node = (node_level === 5) ? data.node.getParent() : data.node;
                            var calc_node = calc_child_node.getParent();

                            if (calc_node.title === getParamCalcId()) {
                                load_content = false;
                            }
                            var active_node = getLocalStorage('active_fancytree_node');
                            if (active_node != null && active_node !== '') {
                                var activation = active_node[0].activation;
                                active_node = active_node[0].tree;
                                if (active_node[2] != '' && typeof (active_node[2]) != 'undefined' && calc_node.title != active_node[2] && activation) {
                                    load_content = true;
                                }
                            }
                            if ($('.calculation-refresh').hasClass('active')) {
                                load_content = true;
                            }
                            if (calc_node.title !== getParamCalcId()) {
                                load_content = true;
                            }
                            if (load_content && $("#param-context-menu-action").val() !== '') { /* Trigger from right click*/
                                loadCalculationContent(calc_node);
                                load_content = false;
                            } else if (!$('.calculation-section')[0]) {
                                load_content = true;
                            }
                            $("#param-calc-id").val(calc_node.title);
                            $("#param-calc-node-key").val(calc_node.key);
                            var calc_grp = calc_node.getParent();
                            $("#param-calc-group-id").val(calc_grp.title);
                            var group_model = calc_grp.getParent();
                            $("#param-model-id").val(group_model.title);
                            if (load_content) {
                                var promise = new Promise((res, rej) => {
                                    loadFormContent('assets/spaces/darce/forms/step_form.html?' + Math.random(), 'step-modal');
                                    loadFormContent('assets/spaces/darce/forms/driver_form.html?' + Math.random(), 'driver-modal');
                                    if (calc_child_node.title == 'Steps' && node_level == 5) {
                                        if (!$('.calculation-section').length) { $('#param-calc-step-modal').val(1); }
                                        openStepForm(data.node.title, 'edit', calc_node.title);
                                    }
                                    if (calc_child_node.title == 'Drivers' && node_level == 5) {
                                        if (!$('.calculation-section').length) { $('#param-calc-driver-modal').val(1); }
                                        openDriverForm(data.node.title, 'edit', calc_node.title);
                                    }
                                    res('');
                                });
                                promise.then(() => {
                                    $("#content").load('assets/spaces/darce/cg_detail/calc_detail.html?' + Math.random(), function () {
                                        if (calc_child_node.title == 'Drivers') {
                                            $('.stepy-wizard').stepy('step', 2);

                                        } else if (calc_child_node.title == 'Steps') {
                                            $('.stepy-wizard').stepy('step', 3);
                                        }
                                    });
                                    //loadSideBarCalcGroupList(calc_grp.title);
                                });
                            } else {
                                if ($("#param-context-menu-action").val() === '') {
                                    if (calc_child_node.title == 'Steps' && node_level == 5) {
                                        if ($('.stepy-active span').html() != 'Step') {
                                            $('.stepy-wizard').stepy('step', 3);
                                        }
                                        if (!$('.calculation-section').length) { $('#param-calc-step-modal').val(1); }
                                        openStepForm(data.node.title, 'edit', calc_node.title);
                                    }
                                    else if (calc_child_node.title == 'Drivers' && node_level == 5) {
                                        if ($('.stepy-active span').html() != 'Driver') {
                                            $('.stepy-wizard').stepy('step', 2);
                                        }
                                        if (!$('.calculation-section').length) { $('#param-calc-driver-modal').val(1); }
                                        openDriverForm(data.node.title, 'edit', calc_node.title);
                                    }
                                }
                                if (data.node.title == 'Steps' && node_level == 4 && $('.stepy-active span').html() != 'Step') {
                                    $('.stepy-wizard').stepy('step', 3);
                                } else if (data.node.title == 'Drivers' && node_level == 4 && $('.stepy-active span').html() != 'Driver') {
                                    $('.stepy-wizard').stepy('step', 2);
                                }

                            }
                            break;
                    }
                } else {
                    $("#param-new-cg").val('');
                }
                setActiveNodeFancytree(data.node.key);
                if ($('#content .spin')[0]) {
                    $('#content .spin').removeClass('.spin');
                }
            },
        });
        var ft = $(".fancytree-structure").fancytree("getTree");
        ft.render(true, true);
        var ft = $(".fancytree-structure").fancytree("getTree");
        var model_id = getParamModelId();
        if (model_id != '') {
            activateFancytreeNode(load_content);
        } else {
            removeSpin('.tree-refresh');
        }
    } catch (error) {
        displayCatchError('fancytree-data');
        return false;
    }
}

function loadEnvironment(selector = '', placeholder = false, tags = true, length = '') {
    if (!selector) { return; }
    try {
        var EnvironmentIds = getEnvironmentLists();
        var EnvironmentLists = placeholder ? '<option></option>' : '';
        var selected;
        $.each(EnvironmentIds, function (i, EnvironmentIdVal) {
            if (EnvironmentIdVal.Useraccess === 'DARCE_RW') {
                selected = (EnvironmentIdVal.Environment == getConfig('environment') && !placeholder) ? 'selected' : '';
                EnvironmentLists += '<option value="' + EnvironmentIdVal.Environment + '" ' + selected + '>' + EnvironmentIdVal.Environment + '</option>';
            }
        });
        $(selector).html(EnvironmentLists);
        if (selector === '#copy-config-source-field' || selector === '#convert-config-target-field' || selector === '#convert-config-source-field') {
            $(selector).val(getEnvironment());
        }
        var params = { tags: tags, maximumSelectionLength: length };
        $(selector).select2(params);
    } catch (error) {
        displayCatchError('environment-list');
        return false;
    }
}

// Get environment lists
function getEnvironmentLists() {
    var response = getLocalStorage('environment_list', false);
    if (response === null) {
        response = getWsUserEnvacRBind();
    }
    return response;
}

// Get attributes
function getAttributes($node) {
    var attrs = {};
    $.each($node[0].attributes, function (index, attribute) {
        attrs[attribute.name] = attribute.value;
    });

    return attrs;
}

jQuery.fn.dataTable.Api.register('row.addByPos()', function (table_row, index) {
    var currentPage = this.page();
    this.row.add($(table_row)).draw(false);
    var rowCount = this.data().length - 1,
        insertedRow = this.row(rowCount).data(),
        tempRow;
    for (var i = rowCount; i >= index; i--) {
        tempRow = this.row(i - 1).data();
        var trDOM = this.row(i - 1).data(tempRow).node();
        var attributes = getAttributes($(trDOM));
        this.row(i).data(tempRow);
        var trDOM1 = this.row(i).data(tempRow).node();
        var insertedRowAttributes = getAttributes($(trDOM1));

        $.each(attributes, function (index, attr) {
            $(trDOM1).attr(index, attr);
        });
        this.row(i - 1).data(insertedRow);
        var insertedRow_trDOM = this.row(i - 1).data(insertedRow).node();
        $.each(insertedRowAttributes, function (index, attr) {
            $(insertedRow_trDOM).attr(index, attr);
        });
    }
    this.page(currentPage).draw(false);
});

// Get param model id
function getParamModelId() {
    var model_id = $('#param-model-id').val();
    if (model_id == '') {
        var active_node = getLocalStorage('active_fancytree_node');
        if (active_node != null && active_node.length > 0) {
            active_node = active_node[0].tree;
            if (typeof (active_node[0]) != 'undefined') {
                model_id = active_node[0];
            }
        }
    }
    return model_id;
}

// Get param calc group id
function getParamCalcGroupId() {
    var group_id = $('#param-calc-group-id').val();
    if (group_id == '') {
        var active_node = getLocalStorage('active_fancytree_node');
        if (active_node != null && active_node.length > 0) {
            active_node = active_node[0].tree;
            if (typeof (active_node[0]) != 'undefined' && typeof (active_node[1]) != 'undefined') {
                group_id = active_node[1];
            }
        }
    }

    return (group_id == "(unassigned)") ? group_id.replace(/[()]/g, '') : group_id;
}

// Get param calc id
function getParamCalcId() {
    var calc_id = $('#param-calc-id').val();
    if (calc_id == '') {
        var active_node = getLocalStorage('active_fancytree_node');
        if (active_node != null && active_node.length > 0) {
            active_node = active_node[0].tree;
            if (typeof (active_node[1]) != 'undefined' && typeof (active_node[2]) != 'undefined') {
                calc_id = active_node[2];
            }
        }
    }
    return calc_id;
}

// Get param date time last changed
function getParamDateTimeLastChanged(xml = true) {
    var dateTimeLastChangedParam = $('#param-date-time-last-changed').val();

    if (dateTimeLastChangedParam !== '' && dateTimeLastChangedParam !== null && typeof (dateTimeLastChangedParam) !== 'undefined') {
        dateTimeLastChangedXML = `<DateTimeLastChanged>` + getLastChangedDateTime(dateTimeLastChangedParam + '00') + `</DateTimeLastChanged>`;
    } else {
        dateTimeLastChangedXML = '';
    }
    if (xml) {
        return dateTimeLastChangedXML;
    } else {
        return dateTimeLastChangedParam;
    }

}

// Set param calc id
function setParamCalcId(value = '') {
    $('#param-calc-id').val(value);
}

// Load calculation content
function loadCalculationContent(node) {
    $("#param-calc-id").val(node.title);
    $("#param-calc-node-key").val(node.key);
    var calc_grp = node.getParent();
    $("#param-calc-group-id").val(calc_grp.title);
    var group_model = calc_grp.getParent();
    $("#param-model-id").val(group_model.title);
    $("#content").load('assets/spaces/darce/cg_detail/calc_detail.html?' + Math.random(), function () {
        loadFormContent('assets/spaces/darce/forms/step_form.html?' + Math.random(), 'step-modal');
        loadFormContent('assets/spaces/darce/forms/driver_form.html?' + Math.random(), 'driver-modal');
    });
}

// Location reload
function locationReload() {
    // var uri = window.location.toString();
    // if (uri.indexOf("?") > 0) {
    //     var clean_uri = uri.substring(0, uri.indexOf("?"));
    //     window.history.replaceState({}, document.title, clean_uri);
    // }
    location.reload();
}

// Sufficient access environment dialog
function sufficientAccessEnvironmentDialog() {
    $("#dialog-sufficient-access-confirm").removeClass('hide');
    $("#dialog-sufficient-access-confirm").dialog({
        resizable: false,
        height: "auto",
        width: 550,
        modal: true,
        dialogClass: 'dialog-sufficient-access-confirm',
        buttons: {
            "OK": function () {
                $(this).dialog("close");
                removeEnvCache($('#dialog-sufficient-access-confirm').attr('cur-env'));
                $('#connect-to-an-environment-modal').modal('show');
            },
        }
    });
}

// Change environment dialog
function changeEnvironmentDialog() {
    $("#dialog-environment-confirm").removeClass('hide');
    $("#dialog-environment-confirm").dialog({
        resizable: false,
        height: "auto",
        width: 550,
        modal: true,
        dialogClass: 'dialog-environment-confirm',
        buttons: {
            "OK": function () {
                loader('show', false);
                $("#dialog-environment-confirm").dialog('close');
                setTimeout(function () {
                    try {
                        if ($('#param-date-time-last-changed').val() != '') {
                            timemachineRefresh(true);
                        }
                        var selected_evironment = $('table.connect-environment-table tr.selected td:first').html();
                        var env_menu_list = getLocalStorage('env_menu_list', false);
                        setLocalStorage('current_environment', selected_evironment, false);
                        var new_env_menu_list = new Object();
                        new_env_menu_list[0] = selected_evironment;
                        if (env_menu_list) {
                            $.each(env_menu_list, function (i, item) {
                                if (_.size(new_env_menu_list) < 5 && !_isContains(new_env_menu_list, item)) {
                                    new_env_menu_list[++i] = item;
                                } else {
                                    if (_.size(new_env_menu_list) == 5) {
                                        removeEnvCache(item);
                                    }
                                }
                            });
                        }
                        setLocalStorage('env_menu_list', new_env_menu_list, false);
                        updateEnvironmentDropDown();
                        $('#change-environment-modal').modal('hide');
                        locationReload();
                    } catch (error) {
                        displayCatchError('environment-change');
                        return false;
                    }
                }, 1);
            },
            "Cancel": function () {
                $("#dialog-environment-confirm").addClass('hide');
                $('table.connect-environment-table tr').removeAttr('env_change_trigger');
                $('table.connect-environment-table tr').removeClass('selected');
                $(this).dialog("close");
            }
        }
    });
}

// Has write access
function hasWriteAccess(datetime = true) {
    try {
        var user_info = getLocalStorage('user_info', false);
        if (!datetime) {
            if (user_info.Useraccess == "DARCE_RO") {
                return false;
            } else if (user_info.Useraccess == "DARCE_RW") {
                return true;
            }
        } else {
            if (user_info.Useraccess == "DARCE_RO" || $('#param-date-time-last-changed').val()) {
                return false;
            } else if (user_info.Useraccess == "DARCE_RW") {
                return true;
            }
        }
    } catch (error) {
        displayCatchError('user-data');
        return false;
    }
}
/* Debug code*/
var localStorageSpace = function () {
    var data = '';
    console.log('Current local storage: ');
    for (var key in window.localStorage) {
        if (window.localStorage.hasOwnProperty(key)) {
            data += window.localStorage[key];
            console.log(key + " = " + ((window.localStorage[key].length * 16) / (8 * 1024)).toFixed(2) + ' KB');
        }
    }
    console.log(data ? '\n' + 'Total space used: ' + ((data.length * 16) / (8 * 1024)).toFixed(2) + ' KB' : 'Empty (0 KB)');
    console.log(data ? 'Approx. space remaining: ' + (10240 - ((data.length * 16) / (8 * 1024)).toFixed(2)) + ' KB' : '5 MB');
};
/* End Debug code*/
// Update display name
function updateDisplayName() {
    try {
        var userData = getWsUserRBind('I');
        if (typeof userData == 'undefined') {
            return false;
        }
        var user_info;
        if (userData.length > 1) {
            user_info = userData.find(function (element) {
                if (element.Useraccess == "DARCE_RW") {
                    return element;
                } else if (element.Useraccess == "DARCE_RO") {
                    return element;
                }
            });
        } else {
            user_info = userData;
        }
        if (user_info.Fullname !== 'undefined') {
            $('a#user_display_name span').html(getDisplayName(user_info.Fullname));
            setLocalStorage('user_info', user_info, false);
        } else {
            setLocalStorage('user_info', '', false);
        }
    } catch (error) {
        displayCatchError('user-data');
        return false;
    }
}

// Get display name
function getDisplayName(displayName) {
    if (displayName.length >= 30) {
        displayName = displayName.substring(0, 27) + '...';
    }
    return displayName;
}
/*ID remove over 32 char*/
// Validate unique ID - validation
function validateID(ele, ID, isUpperCase = true) {
    // ID = formattedID(ID);   
    if (isUpperCase) {
        ID = ID.toUpperCase();
        var primaryIdRegExp = /^[A-Z]+[A-Z0-9_]*$/g;
    } else {
        var primaryIdRegExp = /^[A-Za-z]+[A-Za-z0-9_]*$/g;
    }
    $(ele).val(ID)
    if (ID == '') {
        $(ele).next('.text-red').html('');
        return false;
    }
    else if (ID.length > 32) {
        ID = ID.substring(0, 32);
        var validationMessage = 'Please enter no more than 32 characters for the ID.';
        if ($(ele).next('.text-red')[0]) {
            $(ele).next('.text-red').html(validationMessage);
        } else {
            $(ele).after('<span class="text-red">' + validationMessage + '</span>');
        }
        return false;
    }
    else if (!ID.match(primaryIdRegExp)) {
        var validationMessage = 'First character of the ID should be A-Z. <br />Only A-Z characters, 0-9 numbers <br /> underscore "_" character are accepted';
        if ($(ele).next('.text-red')[0]) {
            $(ele).next('.text-red').html(validationMessage);
        } else {
            $(ele).after('<span class="text-red">' + validationMessage + '</span>');
        }
        return false;
    }
    else {
        $(ele).next('.text-red').html('');
        return true;
    }
}

// _iscontains
function _isContains(json, value) {
    let contains = false;
    Object.keys(json).some(key => {
        contains = typeof json[key] === 'object' ? _isContains(json[key], value) : json[key] === value;
        return contains;
    });
    return contains;
}

// Update environment dropdown
function updateEnvironmentDropDown(user_env_list = '') {
    try {
        var userEnvLists = [];
        if (typeof (user_env_list) !== 'undefined' && !$.isArray(user_env_list)) {
            userEnvLists.push(user_env_list);
        } else {
            userEnvLists = user_env_list;
        }
        var env_menu_list = getLocalStorage('env_menu_list', false);
        var current_environment = getLocalStorage('current_environment', false);
        var environment_list = getLocalStorage('environment_list', false);
        var env_menu_li = '';
        if (env_menu_list == null) {
            env_menu_list = [];
            env_menu_list.push(userEnvLists[0].Environment);
        }

        if (current_environment == null || current_environment == '') {
            current_environment = userEnvLists[0].Environment;
        }

        $('.connect-environment> a span').html(current_environment);
        if (env_menu_list) {
            $.each(env_menu_list, function (i, item) {
                var cls = '';
                if (current_environment == item) {
                    cls = ` active`;
                }
                var evnHasAccess = environment_list.filter(function (env) { return env.Environment == item });
                if (evnHasAccess.length > 0) {
                    env_menu_li += `<li class="env` + cls + `"><a href="#">` + item + `</a></li>`;
                } else {
                    delete env_menu_list[i];
                }
            });
        }
        env_menu_li += `<li class="divider"></li>
         <li><a href="#" class="text-bolder" data-toggle="modal" data-target="#connect-to-an-environment-modal">More Environments...</a></li>`;
        $('.connect-environment .dropdown-menu').html(env_menu_li);
        setLocalStorage('current_environment', current_environment, false);
        setLocalStorage('env_menu_list', env_menu_list, false);
    } catch (error) {
        displayCatchError('environment-list');
        return false;
    }
}

// Update user environment list
function updateUserEnvList() {
    try {
        responseData = getWsUserEnvacRBind();
        var response = [];
        if (typeof (responseData) !== 'undefined' && !$.isArray(responseData)) {
            response.push(responseData);
        } else {
            response = responseData;
        }
        setLocalStorage('environment_list', response, false);
        var current_environment = getLocalStorage('current_environment', false);
        var userHasAccess = response.filter(function (calculation) { return calculation.Environment == current_environment });
        if (userHasAccess.length <= 0) {
            removeEnvCache(current_environment);
            setLocalStorage('current_environment', '', false);
        }
        updateEnvironmentDropDown(response);
        var table_row = '';
        destroyDataTableInstance('connect-environment-table', false);
        var j = 0;
        $.each(response, function (i, item) {
            var Useraccess = '';
            if (item.Useraccess == 'DARCE_RW') {
                Useraccess = 'Full';
            } else if (item.Useraccess == 'DARCE_RO') {
                Useraccess = 'Read';
            }
            table_row += `<tr id="row_` + item.Environment + `"><td>` + item.Environment + `</td>
                <td><span class="text-overflow-description">`+ item.Descr + `</span></td>
                <td><span class="user-access">`+ Useraccess + `</span></td></tr>`;
        });
        $('.connect-environment-table > tbody').html(table_row);
        initializeConnectEnvironmentTable('connect-environment-table');
        setModels();
    } catch (error) {
        displayCatchError('environment-list');
        return false;
    }
}

// Update cache version
async function updateCacheVersion() {
    if (localStorage.getItem(getSessionTabID('CACHE_VERSION')) !== getConfig('cache_version')) {        
        localStorage.setItem(getSessionTabID('CACHE_VERSION'), getConfig('cache_version'));
        localStorage.setItem("EP_TABID", 1);
        var doNot = { 'cache_version': false, 'TABID': false};
        clearAllLocalcache(doNot);
        window.indexedDB.deleteDatabase("DarwinDB_Platform");
        //location.reload(true);
    }
}

// Remove environment cache
function removeEnvCache(item = '') {
    if (item != '') {
        for (var key in window.localStorage) {
            if (key.startsWith(item)) {
                localStorage.removeItem(key);
            }
        }
        return true;
    }
    return false;
}

// Clear all local cache
function clearAllLocalcache(doNot = []) {
    if (doNot.length === 0) {
        doNot = {
            'env_menu_list': false,
            'current_environment': false,
            'cache_version': false,
            'TABID': false
        };
    }
    var restoreData = {};
    $.each(doNot, function (i, item) {
        if (i == 'cache_version' || i == 'TABID') {
            restoreData[i] = { "env": item, "val": localStorage.getItem(getSessionTabID(i.toUpperCase())) };
        } else {
            restoreData[i] = { "env": item, "val": getLocalStorage(i, item) };
        }
    });
    removeEnvCache(getEnvironment()+'_EP_');
    removeEnvCache('EP_');    
    //localStorage.clear();
    $.each(restoreData, function (i, item) {
        if (i == 'cache_version' || i == 'TABID') {
            localStorage.setItem(getSessionTabID(i.toUpperCase()), item.val);
        } else {
            setLocalStorage(i, item.val, item.env);
        }
    });
}

// Calc model fancytree reload
function calcModelFancytreeReload(activation = true) {
    var active_fancytree_node = [{ tree: [], activation: '' }];
    active_fancytree_node[0].tree.push(getParamModelId());
    active_fancytree_node[0].activation = activation;
    setLocalStorage('active_fancytree_node', active_fancytree_node);
}

// Calc group fancytree reload
function calcGroupFancytreeReload(activation = true) {
    var active_node = getLocalStorage('active_fancytree_node');
    var active_fancytree_node = [{ tree: [], activation: '', tab: '' }];
    active_fancytree_node[0].tree.push(getParamModelId());
    active_fancytree_node[0].tree.push(getParamCalcGroupId());
    if (!$('.calc-group-save').hasClass('active')) {
        active_fancytree_node[0].activation = activation;
    }
    var active_tab = $('.cg-detail-form-content .stepy-active span').html();
    if (active_tab != '') {
        active_fancytree_node[0].tab = active_tab;
    }
    setLocalStorage('active_fancytree_node', active_fancytree_node);
}

// Calculation fancytree reload
function calculationFancytreeReload(activation = true) {
    var active_node = getLocalStorage('active_fancytree_node');
    var active_fancytree_node = [{ tree: [], activation: '', tab: '' }];
    active_fancytree_node[0].tree.push(getParamModelId());
    active_fancytree_node[0].tree.push(getParamCalcGroupId());
    if ($('#calc-id-input-field #calc-id').hasClass('bk-yellow')) {
        active_fancytree_node[0].tree.push($("#calc-id-input-field #calc-id").attr('attr-fromcalcid'));
    } else {
        active_fancytree_node[0].tree.push(getParamCalcId());
    }
    active_fancytree_node[0].activation = activation;
    if ($('.stepy-active span').html() == 'Driver') {
        active_fancytree_node[0].tree.push('Drivers');
    } else if ($('.stepy-active span').html() == 'Step') {
        active_fancytree_node[0].tree.push('Steps');
    }
    var active_tab = $('.calculation-section .stepy-active span').html();
    if (active_tab != '') {
        active_fancytree_node[0].tab = active_tab;
    }
    setLocalStorage('active_fancytree_node', active_fancytree_node);
}
// Reset default Wizard Step
function resetDefaultWizardStep() {
    var active_node = getLocalStorage('active_fancytree_node');
    if (active_node != null && active_node !== '') {
        setLocalStorage('active_fancytree_node', [{ tree: active_node[0].tree, activation: active_node[0].activation, tab: '' }]);
    }
}
// Set active node fancytree
function setActiveNodeFancytree(key, activation = true) {
    try {
        var active_node = getLocalStorage('active_fancytree_node');
        var current_tab = '';
        if (active_node != null && active_node !== '') {
            if (active_node[0].tab) {
                current_tab = active_node[0].tab;
            }
        }
        var ft = $(".fancytree-structure").fancytree("getTree");
        var node = ft.getNodeByKey(key);
        if (node === null) { return false; }
        var node_level = node.getLevel();
        var active_fancytree_node = [{ tree: [], activation: '', tab: current_tab }];
        switch (node_level) {
            case 1:
                active_fancytree_node[0].tree.push(node.title);
                break;
            case 2: var calc_model = node.getParent();
                active_fancytree_node[0].tree.push(calc_model.title);
                active_fancytree_node[0].tree.push((node.title == "(unassigned)") ? node.title.replace(/[()]/g, '') : node.title);
                break;
            case 3: var calc_group = node.getParent();
                var calc_model = calc_group.getParent();
                active_fancytree_node[0].tree.push(calc_model.title);
                active_fancytree_node[0].tree.push((calc_group.title == "(unassigned)") ? calc_group.title.replace(/[()]/g, '') : calc_group.title);
                active_fancytree_node[0].tree.push(node.title);
                break;
            case 4: var calc = node.getParent();
                var calc_group = calc.getParent();
                var calc_model = calc_group.getParent();
                active_fancytree_node[0].tree.push(calc_model.title);
                active_fancytree_node[0].tree.push((calc_group.title == "(unassigned)") ? calc_group.title.replace(/[()]/g, '') : calc_group.title);
                active_fancytree_node[0].tree.push(calc.title);
                active_fancytree_node[0].tree.push(node.title);
                active_fancytree_node[0].tab = node.title.slice(0, -1);
                break;
            case 5: var calc_level4 = node.getParent();
                var calc = calc_level4.getParent();
                var calc_group = calc.getParent();
                var calc_model = calc_group.getParent();
                active_fancytree_node[0].tree.push(calc_model.title);
                active_fancytree_node[0].tree.push((calc_group.title == "(unassigned)") ? calc_group.title.replace(/[()]/g, '') : calc_group.title);
                active_fancytree_node[0].tree.push(calc.title);
                active_fancytree_node[0].tree.push(calc_level4.title);
                active_fancytree_node[0].tab = calc_level4.title.slice(0, -1);
                break;
        }
        active_fancytree_node[0].activation = activation;
        setLocalStorage('active_fancytree_node', active_fancytree_node);
    } catch (error) {
        displayCatchError('fancytree-data');
        return false;
    }
}

// Destroy datatable instance
function destroyDataTableInstance(tableClassName = '', removeTableBody = true) {
    if (tableClassName) {
        if ($.fn.DataTable.isDataTable('.' + tableClassName)) {
            $('.' + tableClassName).DataTable().destroy();
        }
        if (removeTableBody) {
            $('.' + tableClassName + ' tbody').empty();
        }
    }
}

// Initialize datatable
function initializeDataTable(tableClassName = '', columns = [], scrollY = 285, row_reorder = false) {
    if (row_reorder) {
        $('.' + tableClassName).DataTable({
            "retrieve": true,
            "autoWidth": false,
            columns: columns,
            bLengthChange: false,
            bInfo: false,
            bPaginate: false,
            bSort: false
        });
        $('.' + tableClassName + " tbody").sortable({
            handle: 'td.calculation-drag-bar',
            update: function (event, ui) {
                var is_order_changed = false;
                $("#param-calculations-sort-order").val(0);
                $('.calcorder').removeClass('order-changed');
                $('.calcorder').each(function (index) {
                    if (index !== parseInt($(this).attr('attr-index'))) {
                        /* To check calculation order changes*/
                        is_order_changed = true;
                        $(this).addClass('order-changed');
                    }
                });
                if (is_order_changed) {
                    $("#param-calculations-sort-order").val(1);
                }
                updateSaveButton();
            },
            start: function (event, ui) {
            },
            stop: function (event, ui) {
            },
            sort: function (e) {
            }
        });
        /* Initialize table column resizable*/
        var thHeight = $('.' + tableClassName + ' th:first').height();
        $('.' + tableClassName + ' th').resizable({
            handles: "e",
            minHeight: thHeight,
            maxHeight: thHeight,
            resize: function (event, ui) {
                var sizerID = "#" + $(event.target).attr("id") + "-sizer";
                $(sizerID).width(ui.size.width);
            },
            stop: function (event, ui) {
                $('.calculations-tab').floatingScroll('update');
            }
        });
    } else {
        $('.' + tableClassName).DataTable({
            responsive: true,
            "dom": 'Zlfrtip',
            "colResize": {
                "tableWidthFixed": false,
                "resizeCallback": function (column) {
                    $('.variables-tab').floatingScroll('update');
                }
            },
            "autoWidth": false,
            columns: columns,
            bLengthChange: false,
            bInfo: false,
            bPaginate: false
        });
    }
}

// Initialize calc group table
function initializeCalcGrpDataTable(tableClass = '', columns = {}) {
    $('.' + tableClass).DataTable({
        responsive: true,
        "retrieve": true,
        "dom": 'Zlfrtip',
        order: [],
        "colResize": {
            "tableWidthFixed": false,
            "resizeCallback": function (column) {
                // 
            }
        },
        "autoWidth": false,
        bLengthChange: false,
        bInfo: false,
        bPaginate: false,
        columnDefs: [{
            targets: 3,
            render: $.fn.dataTable.moment('M/D/YYYY, h:mm:ss A')
        }],
    });
}

// Initialize connect environment table
function initializeConnectEnvironmentTable(tableClass = '') {
    $('.' + tableClass).dataTable({
        bInfo: false,
        bPaginate: false,
        searching: false,
        "dom": 'Zlfrtip',
        "order": [],
        "autoWidth": false,
    });
}

// Initialize driver table
function initializeDriverTable(tableClass = 'calculation-driver-table') {
    var selector = '.' + tableClass;
    $(selector).DataTable({
        responsive: true,
        "retrieve": true,
        "dom": 'Zlfrtip',
        "colResize": {
            "tableWidthFixed": false,
            "resizeCallback": function (column) {
                // $('.calculation-driver-table-responsive').floatingScroll('update');
            }
        },
        "autoWidth": false,
        searching: false,
        "order": [],
        bLengthChange: false,
        bInfo: false,
        bPaginate: false
    });
}

//Initialize step table
function initializeStepTable(selector = '') {
    var columns = [
        { "orderable": false },
        { "orderable": false },
        { "orderable": false },
        { "orderable": false },
        { "orderable": false },
        { "orderable": false },
        { "orderable": false },
        { "orderable": false },
        { "orderable": false },
        { "orderable": false },
    ];
    var stepDataTable = $(selector).DataTable({
        "retrieve": true,
        "autoWidth": false,
        bLengthChange: false,
        bInfo: false,
        bPaginate: false,
        bSort: false,
        searching: false,
    });
    /* Initialize table column resizable*/
    var thHeight = $(selector + ' th:first').height();
    $(selector + ' th').resizable({
        handles: "e",
        minHeight: thHeight,
        maxHeight: thHeight,
        resize: function (event, ui) {
            var sizerID = "#" + $(event.target).attr("id") + "-sizer";
            $(sizerID).width(ui.size.width);
        },
        stop: function (event, ui) {
        }
    });
    tableSortable(selector);
}

// table sortable
function tableSortable(selector) {
    var stepSortable = $(selector + ' tbody').sortable({
        handle: 'td.drag-bar',
        update: function (event, ui) {
            var is_order_changed = false;
            $("#param-calculations-sort-order").val(0);
            $('.calcorder').removeClass('order-changed');
            $('.steporder').each(function (index) {
                if (index !== parseInt($(this).attr('attr-index'))) {
                    /* To check calculation order changes*/
                    is_order_changed = true;
                    $(this).addClass('order-changed');
                }
            });
            if (is_order_changed) {
                $("#param-calculations-sort-order").val(1);
            }
            updateSaveButton();
        }
    });
    $('.calculation-step-table tbody').sortable("refresh");
}

// Initialize datasource table
function initializeDataSourceTable(tableClass = '') {
    $('.' + tableClass).dataTable({
        bInfo: false,
        bPaginate: false,
        "dom": 'Zlfrtip',
        "autoWidth": false,
        "order": []
    });
}

// Initialize users table
function initializeUsersTable(tableClass = '') {
    $('.' + tableClass).dataTable({
        bInfo: false,
        bPaginate: false,
        "dom": 'Zlfrtip',
        "autoWidth": false,
        "order": []
    });
}


// Initialize Installed versions table
function initializeInstalledVersionsTable(tableClass = '') {
    $('.' + tableClass).dataTable({
        bInfo: false,
        bPaginate: false,
        "dom": 'Zlfrtip',
        "autoWidth": false,
        "order": []
    });
}
/* Data Table Functions*/

/*Code Mirror Functions Start*/
function initializeCodeMirror(id) {
    try {
        if ($('#' + id).length) {
            var readOnlyParam = false;
            if (!hasWriteAccess()) {
                readOnlyParam = true;
            }
            CodeMirror.fromTextArea(document.getElementById(id), {
                mode: "custom",
                autoRefresh: true,
                lineWrapping: true,
                matchBrackets: true,
                autoCloseBrackets: true,
                readOnly: readOnlyParam,
                selector: document.getElementById(id)
            }).on('change', editor => {
                document.getElementById(id).value = editor.getValue();
                var element = document.getElementById(id);

                var default_value = element.defaultValue;
                if ($("#" + id + '-default').length > 0) {
                    var default_value = $("#" + id + '-default').val();
                }
                if (element.value !== default_value) {
                    $("#" + id).nextAll('.CodeMirror:first').addClass('bk-yellow cm-yellow');
                } else {
                    $("#" + id).nextAll('.CodeMirror:first').removeClass('bk-yellow cm-yellow');
                }
                if ($('#' + id).attr('attr-save-btn') != 'disable') {
                    eventupdateSaveButton();
                }
            }, 'keyup', editor => {
                if ($('#' + id).attr('attr-save-btn') != 'disable') {
                    eventupdateSaveButton();
                }
            });
        }
    } catch (error) {
        displayCatchError('cm-error');
        return false;
    }
}

/*code Mirror Functions End*/
// Add spin
function addSpin(selector) {
    $(selector).addClass('spin');
}

// Remove spin
function removeSpin(selector) {
    if (selector == '.tree-refresh' && getLocalStorage('timemachine_datetime') !== null) {
        $('.tree-refresh').addClass('icon-history').removeClass('icon-loop3');
        $('.tree-refresh').addClass('tree-timemachine').removeClass('tree-refresh').removeClass('spin');
    } else {
        if (selector != '') {
            $(selector).removeClass('spin');
        } else {
            $('.spin').removeClass('spin');
        }
    }
}

// Tab scroller
function tabScroller(action = 'left') {
    if (!window.matchMedia('(max-width: 767px)').matches) {
        var li_width = 0;
        var ul_width = $('.datasources-tab .nav-tabs-list ul').outerWidth(true);
        var ul_left = parseInt($('.nav-tabs-list ul').css('margin-left'));
        $('.datasources-tab .nav-tabs-list ul > li').each(function () {
            li_width += $(this).outerWidth(true);
        });
        var ul_diff_width = ul_width - li_width;
        if (action == 'left') {
            if (ul_left) {
                $('.calc-group-detail .datasources-tab').find('.scroller').show();
                $('.datasources-tab .nav-tabs-list ul').animate({ marginLeft: (ul_left + 150) + 'px' });
            } else {
                if (ul_diff_width > ul_left) {
                    $('.calc-group-detail .datasources-tab').find('.scroller').hide();
                }
            }
        } else {
            if (ul_diff_width < ul_left) {
                $('.calc-group-detail .datasources-tab').find('.scroller').show();
                $('.datasources-tab .nav-tabs-list ul').animate({ marginLeft: (ul_left - 150) + 'px' });
            } else {
                if (!ul_left) {
                    $('.calc-group-detail .datasources-tab').find('.scroller').hide();
                }
            }
        }
    }
}

// Rename calc group
function renameCalcGroup(from_calc_group_id, action, key = '') {
    try {
        $("#rename-calc-group-modal #rename-copy-calc-group-id").removeClass('bk-yellow');
        if (from_calc_group_id != '') {
            var copy_calc_group_id = from_calc_group_id;
            if (action == 'C') {
                var copy_id = '';
                var current_id = from_calc_group_id;
                while (copy_id == '') {
                    copy_id = getCopyID(current_id);
                    var exist = checkCalcGroupExist(copy_id);
                    if (!exist) {
                        copy_calc_group_id = copy_id;
                    } else {
                        current_id = copy_id;
                        copy_id = '';
                    }

                }
            }
            if (action == 'R') {
                var title = "Rename Calculation Group";
            } else if (action == 'C') {
                var title = "Copy Calculation Group";
                $("#rename-calc-group-modal #rename-copy-calc-group-id").addClass('bk-yellow');
            }

            $("#rename-calc-group-modal .modal-title").html(title);
            $("#rename-copy-calc-group-id").val(copy_calc_group_id);
            $("#default-calc-group-id").val(from_calc_group_id);
            $("#calc-group-action").val(action);
            $(".calc-group-id-error").text('');
            $('#rename-calc-group-modal').modal({ backdrop: 'static', keyboard: false });
            $("#rename-copy-calc-group-id").trigger('keyup');
        }
    } catch (error) {
        displayCatchError('rename-calc-group-error');
        return false;
    }
}

// Rename variable
function renameVariable(from_variable_id, action, title) {
    try {
        if (from_variable_id != '') {
            var copy_variable_id = from_variable_id;
            if (action == 'C') {
                var copy_id = '';
                var current_id = from_variable_id;
                var response = '';
                while (copy_id == '') {
                    copy_id = getCopyID(current_id);
                    var calculation_group_data = getLocalStorage('calculation_group_data');
                    var exist = checkVariableExist(copy_id);
                    if (!exist) {
                        copy_variable_id = copy_id;
                    } else {
                        current_id = copy_id;
                        copy_id = '';
                    }
                }
            }
            $("#temp-variable-id").val('');
            if (action == 'R') {
                variableItemData = JSON.parse(unescape($('.variables-table #variable_' + from_variable_id).val()));
                if (typeof variableItemData.Fromvariableid != 'undefined' && variableItemData.Fromvariableid != '') {
                    $("#temp-variable-id").val(from_variable_id);
                    from_variable_id = variableItemData.Fromvariableid;
                }

            }

            $("#rename-variable-modal .modal-title").html(title);
            $("#rename-copy-variable-id").val(copy_variable_id);
            $("#default-variable-id").val(from_variable_id);
            $("#variable-modal-action").val(action);
            $(".variable-error-message").text('');
            $('#rename-variable-modal').modal({ backdrop: 'static', keyboard: false });
            $("#rename-copy-variable-id").trigger('keyup');
        }
    } catch (error) {
        displayCatchError('rename-variable-error');
        return false;
    }
}

// Copy calculation
function copyCalculation(calculation_id) {
    var from_calculation_id = calculation_id;
    var action = 'C';
    var title = "Copy Calculation";
    renameCalculation(from_calculation_id, action, title);
}

// Rename calculation
function renameCalculation(from_calculation_id, action, title) {
    try {
        if ($('#param-calculations-sort-order').val() > 0 || $('.calculations-table, .calculation-header-form').find('.bk-yellow').length > 0) {
            if (action == 'C') {
                $('#param-calc-copy').val(from_calculation_id);
            } else {
                $('#param-calc-rename').val(from_calculation_id);
            }
            trackFormChanges();
            return false;
        }
        if (from_calculation_id != '' && typeof from_calculation_id != 'undefined') {
            var copy_calculation_id = from_calculation_id;
            if (action == 'C') {
                var copy_id = '';
                var current_id = from_calculation_id;
                var response = '';
                while (copy_id == '') {
                    copy_id = getCopyID(current_id);
                    if (!checkCalculationExist(copy_id)) {
                        copy_calculation_id = copy_id;
                    } else {
                        current_id = copy_id;
                        copy_id = '';
                    }
                }
                var countCalcOrder = parseInt(getMaxCalculationOrderNumber()) + 1;
                var calc_modal_form = $('#rename-calculation-modal');
                calc_modal_form.find('input[name=CalcOrder]').val(countCalcOrder);
            }
            $("#rename-calculation-modal .modal-title").html(title);
            $("#rename-copy-calculation-id").val(copy_calculation_id);
            $("#default-calculation-id").val(from_calculation_id);
            $("#calculation-modal-action").val(action);
            $(".calculation-error-message").text('');
            $('#rename-calculation-modal').modal({ backdrop: 'static', keyboard: false });
            $("#rename-copy-calculation-id").trigger('keyup');
        }
    } catch (error) {
        displayCatchError('rename-calculation-error');
        return false;
    }
}

// Check calc group already exist
function checkCalcGroupExist(copy_id, ws_check = false) {
    try {
        var exist = false;
        // client validation
        var ft_key = $("li." + getParamModelId() + "_" + copy_id).attr('key');
        if (!ws_check && typeof ft_key != 'undefined') {
            exist = true;
            return copy_id + ' already exists!';
        }
        // server validation  
        if (!exist && ws_check) {
            var response = getWsCalcGroupRBind(getParamModelId(), copy_id);
            if (typeof (response) !== 'undefined') {
                exist = true;
            }
        }
        // return error message if exist = true
        if (exist) {
            return response.CalcGroupId + ' ID was already created by ' + response.UserIdLastChange + ' on ' + getFormattedDateTime(response.DateTimeLastChanged) + ' date';
        } else {
            return exist;
        }
    } catch (error) {
        displayCatchError('calc-group-data');
        return false;
    }
}

// Check calculation already exist
function checkCalculationExist(calculation_id = '', ws_check = false, existing_calc = false) {
    var exist = false;
    try {
        if ($.trim(calculation_id) !== '' && typeof (calculation_id) !== 'undefined') {
            // client validation
            if (!ws_check) {
                if (existing_calc) {
                    var ft_key = $("li." + getParamModelId() + "_" + getParamCalcGroupId() + " li." + getParamCalcGroupId() + "_" + calculation_id).attr('key');
                    if (typeof ft_key !== 'undefined') {
                        exist = `${calculation_id} already exists!`;
                    }
                } else {
                    if ($('.fancytree-structure .ft_calc_title_' + calculation_id).length > 0) {
                        exist = `${calculation_id} already exists!`;
                    }
                }
            }
            // server validation
            if (!exist && ws_check) {
                if (existing_calc) {
                    var ft_key = $("li." + getParamModelId() + "_" + getParamCalcGroupId() + " li." + getParamCalcGroupId() + "_" + calculation_id).attr('key');
                    if (typeof ft_key !== 'undefined') {
                        exist = `${calculation_id} already exists!`;
                    }
                } else {
                    var response = getWsCalcHdrRBind(calculation_id);
                    if (typeof (response) !== 'undefined') {
                        exist = `${calculation_id} was already created by ${response.UserIdLastChange} on ${getFormattedDateTime(response.DateTimeLastChanged)}`;
                    }
                }
            }
        }
        return exist;
    } catch (error) {
        displayCatchError('cg-calc-data');
        return false;
    }
}

// Check variable already exist
function checkVariableExist(variable_id = '', ws_check = false) {
    try {
        var exist = false;
        if ($.trim(variable_id) !== '' && typeof (variable_id) !== 'undefined') {
            // client validation
            if (!ws_check) {
                if (typeof ($('.variables-table tr.row_' + variable_id).html()) !== 'undefined') {
                    exist = `${variable_id} already exists!`;
                }
            }
            // server validation
            if (!exist && ws_check) {
                var response = getWsCgVarsRBind(getParamCalcGroupId(), variable_id);
                if (typeof (response) !== 'undefined') {
                    exist = `${variable_id} was already created by ${response.UserIdLastChange} on ${getFormattedDateTime(response.DateTimeLastChanged)}`;
                }
            }
        }
        return exist;
    } catch (error) {
        displayCatchError('cg-variable-data');
        return false;
    }
}

// Check driver already exist
function checkDriverExist(driver_id, ws_check = false) {
    var exist = false;
    try {
        // client validation
        if (!ws_check && typeof $('.calculation-driver-table tr.row_' + driver_id).html() != 'undefined') {
            exist = true;
            var response = JSON.parse(unescape($('.calculation-driver-table tr.row_' + driver_id + ' .driver_data').val()));
            return response.DriverId + ' already exists!';
        }
        // server validation
        if (!exist && ws_check) {
            var response = getWsCalcDrvRBind(getParamCalcId(), driver_id);
            if (typeof (response) !== 'undefined') {
                exist = true;
            }
        }
        // return error message if exist = true
        if (exist) {
            return response.DriverId + ' ID was already created by ' + response.UserIdLastChange + ' on ' + getFormattedDateTime(response.DateTimeLastChanged) + ' date';
        }
        return exist;
    } catch (error) {
        displayCatchError('calc-driver-data');
        return false;
    }
}

// Check step already exist
function checkStepIdExist(step_id, ws_check = false) {
    try {
        var exist = false;
        // client validation
        if (!ws_check && typeof $('.calculation-step-table tr.row_' + step_id).html() != 'undefined') {
            exist = true;
            var response = JSON.parse(unescape($('.calculation-step-table tr.row_' + step_id + ' .step_data').val()));
            return response.StepId + ' already exists!';
        }
        // server validation
        if (!exist && ws_check) {
            var response = getWsCalcDtlRBind(getParamCalcId(), step_id);
            if (typeof (response) !== 'undefined') {
                exist = true;
            }
        }
        // return error message if exist = true
        if (exist) {
            return response.StepId + ' ID was already created by ' + response.UserIdLastChange + ' on ' + getFormattedDateTime(response.DateTimeLastChanged) + ' date';
        }
        return exist;
    } catch (error) {
        displayCatchError('calc-step-data');
        return false;
    }
}

// Create default values
function createDefaultValues(id, val, check_default_field_exist = false) {
    var create_field = false;
    if (check_default_field_exist) {
        if ($("#" + id + "-default").length > 0) {
            $("#" + id + "-default").val(val);
        } else {
            create_field = true;
        }
    }
    if (!check_default_field_exist || create_field) {
        $('.default_values').append('<input type="hidden" class="hidden-default-values" id="' + id + '-default" value="' + val + '">');
    }
}

// Create temporary values
function createTempValues(id, val, check_default_field_exist = false) {
    var create_field = false;
    if (check_default_field_exist) {
        if ($("#" + id + "-temp").length > 0) {
            $("#" + id + "-temp").val(val);
        } else {
            create_field = true;
        }
    }
    if (!check_default_field_exist || create_field) {
        $('.default_values').append('<input type="hidden" class="hidden-temp-values" id="' + id + '-temp" value="' + val + '">');
    }
}

// Track form changes
function trackFormChanges(activate_key = '', sync = false, datetime = true, saveDialogParams = '') {
    if (!hasWriteAccess(datetime)) {
        return true;
    }
    var formUpdate = false;
    var calculation_group_data = getLocalStorage('calculation_group_data');
    if (calculation_group_data !== null) {
        if (calculation_group_data[0].delete_variables.length > 0) {
            formUpdate = true;
        }
        if (calculation_group_data[0].delete_datasources.length > 0) {
            formUpdate = true;
        }
    }
    var selector = "#content";
    if ($('#calculation-form')[0]) {
        selector = '#calculation-form';
    }
    if ($(selector + ' .bk-yellow').length > 0 || formUpdate || $('#param-calculations-sort-order').val() > 0) {
        $("#dialog-confirm").dialog({
            resizable: false,
            height: "auto",
            width: 400,
            modal: true,
            buttons: {
                "Yes": function () {
                    loader('show');
                    setTimeout(function () {
                        $('#dialog-confirm').dialog("close");
                        if ($('.back-btn').hasClass('calculation-back') && $('.back-btn').hasClass('active')) {
                            calcGroupFancytreeReload();
                        }
                        if ($('.back-btn').hasClass('calc-group-back') && $('.back-btn').hasClass('active')) {
                            calcModelFancytreeReload();
                        }
                        if ($('.calculation-section').is(':visible') && ($('#param-calculations-sort-order').val() > 0 || $('.calculation-step-table .bk-yellow').length > 0 || $('.calculation-driver-table .bk-yellow').length > 0)) {
                            if ($('#calculation-form-header .stepy-active span').html() == 'Step') {
                                if ($("#param-context-menu-action").val() == 'rename') {
                                    $("#param-context-menu-action").val('step-rename');
                                } else if ($("#param-context-menu-action").val() == 'copy') {
                                    $("#param-context-menu-action").val('step-copy');
                                }
                            }
                        }
                        if ($('.calculation-section').is(':visible') && ($('.calculation-driver-table .bk-yellow').length > 0) || $('.calculation-step-table .bk-yellow').length > 0) {
                            if ($('#calculation-form-header .stepy-active span').html() == "Driver") {
                                if ($("#param-context-menu-action").val() == 'new-driver') {
                                    updateSaveButton()
                                    openDriverForm('', 'add');
                                }
                            }
                        }

                        if ($('.calc-group-detail').length > 0) {
                            saveCalcGroup(activate_key);
                        } else if ($('.calculation-section').length > 0) {
                            saveCalculation(activate_key);
                            activateFancytreeNode(true);
                        }
                        $('.bk-yellow').removeClass('bk-yellow');
                        if ($('#param-date-time-last-changed').val()) {
                            $('#timemachine-form .btn-submit').trigger('click');
                            return false;
                        }
                        $('#param-calculations-sort-order').val(0);
                        $('#dialog-confirm').dialog("close");
                        if ($('.connect-environment-table .selected').attr('env_change_trigger') == '1') {
                            changeEnvironmentDialog();
                        }
                        if ($('#param-load-sidebar-calc-group').val()) {
                            $('#param-load-sidebar-calc-group').val('');
                            $('#sidebar-calc-group-lists').trigger('change');
                            return false;
                        }
                        if ($('#param-calc-add-new').val() == 1) {
                            $('#param-calc-add-new').val(0);
                            $('#calculation-add-btn').click();
                        }
                        if ($('#param-calc-add-existing').val() == 1) {
                            $('#param-calc-add-existing').val(0);
                            $('#calculation-select-existing-btn').click();
                        }
                        if ($('#param-calc-copy').val() != 0) {
                            copyCalculation($('#param-calc-copy').val());
                            $('#param-calc-copy').val(0);
                        }
                        if ($('#param-calc-rename').val() != 0) {
                            renameCalculation($('#param-calc-rename').val(), 'R', 'Rename Calculation');
                            $('#param-calc-rename').val(0);
                        }
                        if ($('#param-calc-remove').val() != 0) {
                            deleteCalculation($('#param-calc-remove').val(), 'R');
                            $('#param-calc-remove').val(0);
                        }
                        if ($('#param-calc-delete').val() != 0) {
                            deleteCalculation($('#param-calc-delete').val(), 'D');
                            $('#param-calc-delete').val(0);
                        }
                        if (Object.keys(saveDialogParams).length > 0) {
                            saveChangesActionPopUpdate('Yes', saveDialogParams)
                        }
                        updateSaveButton();
                        //Close Space Tab
                        if ($('#param-close-tab').val()) {
                            $("#drwn_tab_elements #" + $('#param-close-tab').attr('attr-id') + " .close-space-tab").trigger('click');
                            return false;
                        }
                        if ($('#param-clear-cache').val()) {
                            deleteIndexedDB();
                            return false;
                        }
                        loader('hide');
                    }, 1);
                },
                "No": function () {
                    loader('show');
                    setTimeout(function () {
                        $('#dialog-confirm').dialog("close");
                        $("#param-form-track").val(1);
                        if (!sync) {
                            resetCalcGroupDetailLocalStorage();
                        }
                        if ($("#param-context-menu-action").val() == 'new-calc' && !$('.back-btn').hasClass('calculation-back')) { //check user clicked the new calc
                            $("#param-context-menu-action").val('');
                            loadCalculationForm();
                            return true;
                        }
                        if ($('.calc-group-detail').is(':visible')) {
                            getCalcGroupCalculationsData(getParamCalcGroupId());
                        }
                        if ($('.calculation-section').is(':visible') && ($('#param-calculations-sort-order').val() > 0 || $('.calculation-step-table .bk-yellow').length > 0 || $('.calculation-driver-table .bk-yellow').length > 0)) {
                            if ($('#calculation-form-header .stepy-active span').html() == 'Step') {
                                if ($("#param-context-menu-action").val() == 'new-step') {
                                    openStepForm('', 'add');
                                    $('#step-form').find('.btn-submit').addClass('disabled');
                                    if ($('#param-calculations-sort-order').val() > 0 && ($('.calculation-step-table .bk-yellow').length > 0 || $('.calculation-driver-table .bk-yellow').length > 0)) {
                                        saveDialogParams.selector_1 = 'calculation-step-table';
                                        saveChangPopUpReload(saveDialogParams)
                                    } else if ($('#param-calculations-sort-order').val() > 0) {
                                        destroyDataTableInstance('calculation-step-table');
                                        loadCalculationStep(getParamCalcId(), false);
                                    } else {
                                        saveChangPopUpReload(saveDialogParams)
                                    }
                                } else if ($("#param-context-menu-action").val() == 'rename') {

                                }
                            }
                        }
                        if ($('.calculation-section').is(':visible') && ($('.calculation-driver-table .bk-yellow').length > 0 || $('.calculation-step-table .bk-yellow').length > 0)) {
                            if ($('#calculation-form-header .stepy-active span').html() == "Driver") {
                                if ($("#param-context-menu-action").val() == "new-driver") {
                                    openDriverForm('', 'add');
                                    $('#driver-form').find('.btn-submit').addClass('disabled');
                                    saveChangPopUpReload(saveDialogParams)
                                }
                            }
                        }

                        if ($('.connect-environment-table .selected').attr('env_change_trigger') == '1') {
                            changeEnvironmentDialog();
                        } else {
                            if (sync) {
                                if ($('.back-btn').hasClass('calc-group-back')) {
                                    calcGroupFancytreeReload();
                                    generateFancyTree(true);
                                }
                                if ($('.back-btn').hasClass('calculation-back') || $('.calculation-save').hasClass('btn-primary')) {
                                    calculationFancytreeReload();
                                    generateFancyTree(true);
                                }
                                if ($('.calc-group-list-refresh').hasClass('active')) {
                                    calcModelFancytreeReload(true);
                                    generateFancyTree(true);
                                }
                            } else {
                                if ($('.back-btn').hasClass('calc-group-back') && $('.back-btn').hasClass('active')) {
                                    calcModelFancytreeReload();
                                    activateFancytreeNode(true);
                                } else if ($('.back-btn').hasClass('calculation-back') && $('.back-btn').hasClass('active')) {
                                    calcGroupFancytreeReload();
                                    activateFancytreeNode(true);
                                } else if ($('.calculation-control-btn').not('.active').length == 1 || $('.calc-group-control-btn').not('.active').length == 1) {
                                    if (activate_key != '' && $('#param-close-tab').val() === '0' && !$('#param-date-time-last-changed').val() && $("#param-context-menu-action").val() == '') {
                                        setActiveNodeFancytree(activate_key);
                                        setActiveNode(activate_key);
                                    }
                                }
                            }
                        }
                        loader('hide');
                        $("#param-form-track").val('');
                        $('#param-calculations-sort-order').val(0);
                        removeSpin('.calc-group-refresh, .tree-refresh');
                        $('.bk-yellow').removeClass('bk-yellow');

                        if ($('#param-load-sidebar-calc-group').val()) {
                            $('#param-load-sidebar-calc-group').val('');
                            $('#sidebar-calc-group-lists').trigger('change');
                            return false;
                        }

                        //Clear Cache
                        if ($('#param-clear-cache').val()) {
                            deleteIndexedDB();
                            return false;
                        }

                        if ($('#param-date-time-last-changed').val()) {
                            $('#timemachine-form .btn-submit').trigger('click');
                            return false;
                        }

                        if ($('#param-calc-add-new').val() == 1) {
                            $('#param-calc-add-new').val(0);
                            $('#calculation-add-btn').click();
                        }
                        if ($('#param-calc-add-existing').val() == 1) {
                            $('#param-calc-add-existing').val(0);
                            $('#calculation-select-existing-btn').click();
                        }
                        if ($('#param-calc-copy').val() != 0) {
                            copyCalculation($('#param-calc-copy').val());
                            $('#param-calc-copy').val(0);
                        }
                        if ($('#param-calc-rename').val() != 0) {
                            renameCalculation($('#param-calc-rename').val(), 'R', 'Rename Calculation');
                            $('#param-calc-rename').val(0);
                            loadCalculationHeader(getParamCalcId(), true);
                        }
                        if ($('#param-calc-remove').val() != 0) {
                            deleteCalculation($('#param-calc-remove').val(), 'R');
                            $('#param-calc-remove').val(0);
                        }
                        if ($('#param-calc-delete').val() != 0) {
                            deleteCalculation($('#param-calc-delete').val(), 'D');
                            $('#param-calc-delete').val(0);
                        }
                        if (Object.keys(saveDialogParams).length > 0) {
                            saveChangesActionPopUpdate('No', saveDialogParams)
                        }
                        updateSaveButton();

                        //Close Space Tab
                        if ($('#param-close-tab').val()) {
                            $("#drwn_tab_elements #" + $('#param-close-tab').attr('attr-id') + " .close-space-tab").trigger('click');
                            return false;
                        }

                    }, 1);
                },
                "Cancel": function () {
                    $(this).dialog("close");
                    $("#param-context-menu-action").val('');
                    $(".calculation-back").removeClass('active');
                    $('#param-calc-add-new').val(0);
                    $('#param-calc-add-existing').val(0);
                    $('#param-calc-copy').val(0);
                    $('#param-calc-rename').val(0);
                    $('#param-calc-remove').val(0);
                    $('#param-calc-delete').val(0);
                    removeSpin('.calc-group-refresh, .tree-refresh');
                    if (getParamCalcGroupId()) {
                        $('#sidebar-calc-group-lists').val(getParamCalcGroupId()).select2();
                    }
                }
            }
        });
        var form_has_error = false;
        if ($('.calc-group-save').length > 0) {
            if (validateCGDetailForm()) {
                form_has_error = true;
            }
        } else if ($('.calculation-save').length > 0) {
            if (validateCalculationForm()) {
                form_has_error = true;
            }
        }
        if (form_has_error) {
            $(".ui-dialog-buttonset button:first-child").attr("disabled", 'disabled');
        }
        return false;
    } else {
        return true;
    }
}

// Alert confirmation
function alertConfirmation(message) {
    if (confirm(message)) {
        return true;
    } else {
        return false;
    }
}

// Get formatted date time
function getFormattedDateTime(val) {
    if (val == '' || val == null) {
        return true;
    }
    val = val.toString();
    var formatteddatetime = val.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1-$2-$3 $4:$5:$6");
    return moment(moment.utc(formatteddatetime).toDate()).local().format('MM/DD/YYYY, hh:mm:ss A');

}

// Set activate fancytree node
function setActiveNode(activate_key = '') {
    if (typeof activate_key != 'undefined' && activate_key != 'undefined' && activate_key !== '') {
        $(".fancytree-structure").fancytree("getTree").getNodeByKey(activate_key).setActive();
    }
    return true;
}

// Get last changed date time
function getLastChangedDateTime(d = '') {
    if (d == '') {
        return moment().utc().format('YYYYMMDDHHmmss');
    } else {
        val = d.toString();
        var formatteddatetime = val.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1-$2-$3 $4:$5:$6");
        return moment(formatteddatetime).utc().format('YYYYMMDDHHmmss');
    }

}

// List dimensions
async function listDimensions(model = '', selector = '', add_empty_value = false, is_multiselect = true) {
    try {
        var dimLists = await getIndexedDBStorage('dimensions');
        var dimensionLists = [];
        if (typeof (dimLists) !== 'undefined' && !$.isArray(dimLists)) {
            dimensionLists.push(dimLists);
        } else {
            dimensionLists = dimLists;
        }
        if (typeof (dimensionLists) !== 'undefined' && dimensionLists !== '') {
            selector = (selector) ? selector : '.dimension-list';
            if (add_empty_value) {
                $(selector).html('<option></option>');
            } else {
                $(selector).html('');
            }
            if (model == '') {
                var model_arr = [];
                $.each(dimensionLists, function (i, item) {
                    if ($.inArray(item.Dimension, model_arr) === -1) {
                        $(selector).append('<option value="' + item.Dimension + '">' + item.Dimension + '</option>');
                        model_arr.push(item.Dimension);
                    }
                });
            } else {
                $.each(dimensionLists, function (i, item) {
                    if (item.Model === model) {
                        $(selector).append('<option value="' + item.Dimension + '">' + item.Dimension + '</option>');
                    }
                });
            }

            if (is_multiselect) {
                if (selector) {
                    if (selector.indexOf('#index-dim') !== -1) {
                        $(selector).multiselect('destroy');
                        initializeMultiSelectForOrder(selector);
                    } else {
                        if (selector.indexOf('#variable-dimension') === -1) {
                            $(selector).multiselect('destroy');
                            $(selector).multiselect();
                        }
                    }
                } else {
                    $('#calc-group-detail-form .multiselect, #calculation-form .multiselect').multiselect('destroy');
                    $('#calc-group-detail-form .multiselect, #calculation-form .multiselect').multiselect();
                }
            }
        }
    } catch (error) {
        displayCatchError('dimension-list');
        return false;
    }
}

// Initialize multiselect for order
function initializeMultiSelectForOrder(selector) {
    var orderCount = 0;
    $(selector).multiselect({
        buttonText: function (options) {
            if (options.length == 0) {
                return 'None selected';
            }
            else if (options.length > 3) {
                return options.length + ' selected';
            }
            else {
                var selected = [];
                options.each(function () {
                    selected.push([$(this).text(), $(this).data('order')]);
                });

                selected.sort(function (a, b) {
                    return a[1] - b[1];
                });

                var text = '';
                for (var i = 0; i < selected.length; i++) {
                    text += selected[i][0] + ', ';
                }

                return text.substr(0, text.length - 2);
            }
        },

        onChange: function (option, checked) {
            orderCount = getMaxOrderCountIndexDimension(selector);
            if (checked) {
                orderCount++;
                $(option).data('order', orderCount);
            }
            else {
                $(option).data('order', '');
            }
        }
    });
}

// Get max order count index dimension
function getMaxOrderCountIndexDimension(selector) {
    var orderNum = 0;
    $(selector + ' option').each(function () {
        var count = $(this).data('order');
        if (typeof count != 'undefined' && count != '') {
            if (orderNum < parseInt(count)) {
                orderNum = parseInt(count);
            }
        }
    });
    return (orderNum + 1);
}

// List model options
function listModelOptions(selector = '', placeholder = false, extraParams = []) {
    try {        
        if (placeholder) {
            $(selector).html('<option></option>');
        } else {
            $(selector).html('');
        }
        // $(selector).append('<option value="">BLANK</option>');
        if (extraParams.length > 0) {
            extraParams.forEach(param => {
                $(selector).append('<option value="' + param.value + '">' + param.option + '</option>');
            });
        }

        var DobjectIds = getLocalStorage('models');
        if (DobjectIds === '') {
            DobjectIds = getWsDObjectsRBind();
        }
        $.each(DobjectIds, function (i, DobjectIdVal) {
            $(selector).append('<option value="' + DobjectIdVal.DobjectId + '">' + DobjectIdVal.DobjectId + '</option>');
        });

        // extra parameters
        // if (extraParams.length > 0) {
        //     extraParams.forEach(param => {
        //         $(selector).append('<option value="' + param + '">' + param + '</option>');
        //     });
        // }
    } catch (error) {
        displayCatchError('datasource-list');
        return false;
    }
}

// List datasource options
function listDataSourceOptions(selector = '', multiselect = false, add_empty_value = false, search = false) {
    try {
        var response = getLocalStorage('models');
        if (response === '' || response == null) {
            response = getWsDObjectsRBind();
        }
        console.log('response',response)
        var DobjectIds = [];
        if (typeof (response) !== 'undefined' && !$.isArray(response)) {
            DobjectIds.push(response);
        } else {
            DobjectIds = response;
        }
        if (typeof (DobjectIds) !== 'undefined') {
            if (add_empty_value) {
                $(selector + " .datasource-list").append('<option value="" selected="selected">&nbsp;</option>');
            }
            $.each(DobjectIds, function (i, DobjectIdVal) {
                $(selector + " .datasource-list").append('<option value="' + DobjectIdVal.DobjectId + '">' + DobjectIdVal.DobjectId + '</option>');
            });
            if (multiselect) {
                if (search) {
                    $(selector + ' form .datasource-list').multiselect({
                        enableFiltering: true,
                        enableCaseInsensitiveFiltering: true,
                        templates: {
                            filter: '<li class="multiselect-item multiselect-filter"><i class="icon-search4"></i> <input class="form-control" type="text"></li>'
                        }
                    });
                } else {
                    $(selector + ' form .datasource-list').multiselect("refresh");
                }
            } else {
                $(selector + ' form .datasource-list').select2();
            }
        }
    } catch (error) {
        displayCatchError('datasource-list');
        return false;
    }
}

/**
 * Get calc variables data
 */
function getCalcVariablesData(calc_group_id = '%', variable_id = '%') {
    try {
        var response = getCalcGroupDetailLocalCache('VARIABLE_DATA', calc_group_id);
        if (!response) {
            getWsCgVarsRBind(calc_group_id, variable_id, true, updateCalcVariablesData);
            return false;
        }
        updateCalcVariablesData(response, false);
    } catch (error) {
        displayCatchError('variable-data');
        return false;
    }
}
/**
 * Update calc variables data
 */
function updateCalcVariablesData(response, updateLocalGroupData) {
    if (updateLocalGroupData === undefined) {
        updateLocalGroupData = true;
    }
    if (updateLocalGroupData) {
        updateCalcGroupDetailLocalCache('VARIABLE_DATA', response);
    }
}

// Get active data sources
function getActiveDataSources(calc_group_id = '%') {
    try {
        var response = getCalcGroupDetailLocalCache('DOBJECT_DATA', calc_group_id);
        if (!response) {
            response = getWsCgDObjectsRBind('%', calc_group_id);
            updateCalcGroupDetailLocalCache('DOBJECT_DATA', response);
        }
        return response;
    } catch (error) {
        displayCatchError('cg-dobject-data');
        return false;
    }
}

// Get environment
function getEnvironment() {
    try {
        var env = '';
        env = $('.connect-environment li.active a').html();
        if (typeof env == 'undefined' || env == 'undefined') {
            value = localStorage.getItem(getSessionTabID('CURRENT_ENVIRONMENT'));
            if (value != null) {
                env = JSON.parse(LZString.decompressFromBase64(value));
            }
        }
        if (typeof env != 'undefined' && env != 'undefined' && env != '') {
            return env;
        }
    } catch (error) {
        displayCatchError('environment-data');
        return false;
    }
}

// Get current user name
function getCurrentUserName() {
    try {
        var user_info = getLocalStorage('user_info', false);
        return user_info.UserId;

    } catch (error) {
        displayCatchError('user-data');
        return false;
    }
}

// Set local storage
function setLocalStorage(key = '', value = '', evn = true, env_id = '') {
    var env = getEnvironment();
    key = key.toUpperCase();
    key = getSessionTabID(key);
    if (evn) {
        if (env_id) {
            env = env_id;
        }
        key = env + '_' + key;
    }
    //key = getSessionTabID(key);
    if (key !== '') {
        if (getConfig('development_mode') === 'on') {
            return localStorage.setItem(key, JSON.stringify(value));
        } else {
            value = JSON.stringify(value)
            return localStorage.setItem(key, LZString.compressToBase64(value));
        }
    } else {
        return false;
    }
}

// remove local storage
function removeLocalStorage(key = '', env = true) {
    key = key.toUpperCase();
    if (env) {
        var environment = getEnvironment();
        key = environment + '_' + key;
    }
    localStorage.removeItem(key);
}

// Get local storage
function getLocalStorage(key = '', evn = true) {
    key = key.toUpperCase();
    key = getSessionTabID(key);
    if (evn) {
        var env = getEnvironment();
        key = env + '_' + key;
    }
    //key = getSessionTabID(key);
    if (key !== '') {
        if (getConfig('development_mode') === 'on') {
            return JSON.parse(localStorage.getItem(key));
        } else {
            value = localStorage.getItem(key);
            if (value !== null) {
                return JSON.parse(LZString.decompressFromBase64(value));
            }
            return value;
        }
    } else {
        return false;
    }
}

// Get copy id
function getCopyID(current_id = '') {
    if (current_id !== '') {
        var split_data = current_id.split("COPY");
        var data_length = split_data.length;
        var key = '';
        var last_index = data_length - 1;
        if ($.isNumeric(split_data[last_index])) {
            if (data_length > 2) {
                if (split_data[last_index] !== '') {
                    var key = parseInt(split_data[last_index]) + 1;
                    key = 'COPY' + key;
                } else {
                    var key = 'COPY1';
                }
                split_data.pop();
            } else if (data_length == 2) {
                if (split_data[last_index] !== '') {
                    var key = parseInt(split_data[last_index]) + 1;
                    key = 'COPY' + key;
                } else {
                    var key = 'COPY1';
                }
                split_data.pop();
            } else {
                var key = '_COPY1';
            }
            return split_data.join('COPY') + key;
        } else {
            return current_id + '_COPY1';
        }
    }
}

// List properties
async function listProperties(dimension_id = '') {
    try {
        var propLists = await getIndexedDBStorage('properties');
        var propertyLists = [];
        if (typeof (propLists) !== 'undefined' && !$.isArray(propLists)) {
            propertyLists.push(propLists);
        } else {
            propertyLists = propLists;
        }
        if (typeof (propertyLists) !== 'undefined' && propertyLists !== '') {
            $(".property-list").html('<option value="" selected="selected">&nbsp;</option>');
            $.each(propertyLists, function (i, item) {
                if (item.Dimension === dimension_id) {
                    $(".property-list").append('<option value="' + item.Name + '">' + item.Name + '</option>');
                }
            });
        }
    } catch (error) {
        displayCatchError('property-list');
        return false;
    }
}

// Update fancytree group
async function updateFancyTreeGroup(group_id, model_id, new_model = '', calc = false, ft_load = true) {
    try {
        var group_ids = [];
        var ftRequestData = [];
        var promise;
        var ft = $(".fancytree-structure").fancytree("getTree");
        if (typeof (group_id) !== 'undefined' && !$.isArray(group_id)) {
            group_ids.push(group_id);
        } else {
            group_ids = group_id;
        }
        var calc_ids = [];
        if (typeof (calc.calc_id) !== 'undefined' && !$.isArray(calc.calc_id)) {
            calc_ids.push(calc.calc_id);
        } else {
            calc_ids = calc.calc_id;
        }
        var endLoop = true;
        while (endLoop) {
            var curFancytree = await getIndexedDBStorage('fancytree-structure');
            if (curFancytree && Array.isArray(curFancytree)) {
                if (curFancytree[0].hasOwnProperty('id')) {
                    endLoop = false;
                }
            }
        }

        if (typeof group_ids !== 'undefined') {
            ftRequestData.group_id = group_ids.join(',');
        }
        if (calc) {
            ftRequestData.calc_id = calc_ids.join(',');
        }
        var groupfancytree = getWsCgHierRBind(ftRequestData);
        if (groupfancytree) {
            var fancytreeGroupNode = prepareFancyTreeData(groupfancytree, group_id);
            var model_index = '';
            var group_index = '';
            var unassigned_index = '';
            if (new_model == '') {
                $.each(fancytreeGroupNode, function (i, modelNode) {
                    if (typeof modelNode.children != 'undefined') {
                        let model_id = modelNode.id;
                        $.each(modelNode.children, async function (j, GroupNode) {
                            group_id = GroupNode.id;
                            var existsGrp = fancytreeGroupNode.filter(function (ftnode) { return ftnode.id == model_id });
                            model_index = curFancytree.map(function (item) {
                                return item.id;
                            }).indexOf(model_id);
                            var curModelFancytree = curFancytree[model_index].children;
                            if (curFancytree[model_index] != null && typeof curFancytree[model_index].hasOwnProperty('children') != undefined) {
                                var curModelFancytree = curFancytree[model_index].children;
                            } else {
                                curFancytree = '';
                                curFancytree = await getIndexedDBStorage('fancytree-structure');
                                model_index = curFancytree.map(function (item) {
                                    return item.id;
                                }).indexOf(model_id);
                                var curModelFancytree = curFancytree[model_index].children;
                            }
                            group_index = curModelFancytree.map(function (item) {
                                return item.id;
                            }).indexOf(group_id);
                            unassigned_index = curModelFancytree.map(function (item) {
                                return item.id;
                            }).indexOf(model_id + model_id);
                            if ($.inArray(calc.action, ["R", "EC", 'U']) != -1 && group_ids.length >= 1) {
                                if (group_index >= 0) {
                                    if ('(unassigned)' === GroupNode.title) {
                                        if (unassigned_index > 0) {
                                            curFancytree[model_index].children[unassigned_index] = existsGrp[0].children[j];
                                        } else {
                                            curFancytree[model_index].children.push(existsGrp[0].children[j]);
                                        }
                                    } else {
                                        curFancytree[model_index].children[group_index] = existsGrp[0].children[j];
                                    }
                                } else {
                                    curFancytree[model_index].children.push(existsGrp[0].children[j]);
                                }
                            } else if (!calc || calc.action == 'D') {
                                if (group_index == -1) {
                                    curFancytree[model_index].children[curFancytree[model_index].children.length - 1] = existsGrp[0].children[j];
                                    (curFancytree[model_index].children).sort(function (currentNode, newNode) {
                                        var fancreeOldId = currentNode.id.toLowerCase(), fancytreeNewId = newNode.id.toLowerCase()
                                        if (fancreeOldId < fancytreeNewId)
                                            return -1
                                        if (fancreeOldId > fancytreeNewId)
                                            return 1
                                        return 0
                                    })
                                } else {
                                    curFancytree[model_index].children[group_index] = existsGrp[0].children[j];
                                }
                            }

                        });
                        /*if (calc.action == 'EC') {                            
                            curFancytree = cleanupUnassignedNode(model_id, curFancytree, calc_ids);
                        }*/
                    }
                });
                if (calc.action == 'EC') {
                    curFancytree = cleanupUnassignedNode(model_id, curFancytree, calc_ids);
                }
                if (calc.action == 'D') {
                    curFancytree = cleanupUnassignedNode(getParamModelId(), curFancytree, calc_ids);
                }

            } else if (model_id != new_model) {

                var existsGrp = fancytreeGroupNode.filter(function (ftnode) { return ftnode.id == new_model });
                var model_index_old = curFancytree.map(function (item) {
                    return item.id
                }).indexOf(model_id);
                model_index = curFancytree.map(function (item) {
                    return item.id
                }).indexOf(new_model);
                var curModelFancytree = curFancytree[model_index_old].children;
                group_index = curModelFancytree.map(function (item) {
                    return item.id;
                }).indexOf(group_id);
                curFancytree[model_index_old].children.splice(group_index, 1);
                curFancytree[model_index].children.push(existsGrp[0].children[0]);
                var current_model_node_key = $("li.root_" + model_id).attr('key');
                var new_model_node_key = $("li.root_" + new_model).attr('key');
                var current_group_node_key = $("li." + model_id + "_" + group_id).attr('key');
                if (typeof current_model_node_key != 'undefined' && typeof new_model_node_key != 'undefined' && typeof current_group_node_key != 'undefined') {
                    var current_model_node = ft.getNodeByKey(current_model_node_key);
                    var new_model_node = ft.getNodeByKey(new_model_node_key);
                    if (!current_model_node) return;
                    new_model_node.fromDict({
                        title: new_model,
                        children: curFancytree[model_index].children
                    });
                    promise = new Promise((res, rej) => {
                        new_model_node.render(true, true);
                        res('');
                    });
                    ftDeleteNode(current_group_node_key);
                }
            }
            await setIndexedDBStorage('fancytree-structure', curFancytree);

            $.each(fancytreeGroupNode, function (i, modelNode) {
                if (typeof modelNode.children != 'undefined') {
                    if (!ft_load) {
                        var curGroupId = getParamCalcGroupId();
                        $.each(modelNode.children, function (j, GroupNode) {
                            var group_id = GroupNode.title;
                            let model_id = GroupNode.parent;
                            if (curGroupId != group_id) {
                                if (group_id == '(unassigned)') {
                                    group_id = 'unassigned';
                                }
                                if (group_id != 'unassigned') {
                                    var calc_node_key = $("li." + model_id + "_" + group_id).attr('key');
                                    var current_group_node = ft.getNodeByKey(calc_node_key);
                                    if (!current_group_node) return;
                                    // Set node data and - optionally - replace children
                                    current_group_node.fromDict({
                                        title: GroupNode.title,
                                        children: GroupNode.children
                                    });
                                    promise = new Promise((res, rej) => {
                                        current_group_node.render(true, true);
                                        res('');
                                    });
                                }
                            }
                        });
                    } else {
                        $.each(modelNode.children, function (j, GroupNode) {
                            var group_id = GroupNode.title;
                            let model_id = GroupNode.parent;
                            if (group_id == '(unassigned)') {
                                group_id = 'unassigned';
                            }
                            var calc_node_key = $("li." + model_id + "_" + group_id).attr('key');
                            if (typeof calc_node_key != 'undefined') {
                                var current_group_node = ft.getNodeByKey(calc_node_key);
                                if (!current_group_node) return;
                                if (typeof GroupNode.children !== 'undefined') {
                                    current_group_node.fromDict({
                                        title: GroupNode.title,
                                        children: GroupNode.children
                                    });
                                } else {
                                    current_group_node.fromDict({
                                        title: GroupNode.title,
                                        children: []
                                    });
                                }
                                promise = new Promise((res, rej) => {
                                    current_group_node.render(true, true);
                                    res('');
                                });
                            } else if (group_id == 'unassigned') {
                                var model_node_key = $("li.root_" + model_id).attr('key');
                                var current_model_node = ft.getNodeByKey(model_node_key);
                                if (!current_model_node) return;
                                var new_group_node = current_model_node.addNode({
                                    title: GroupNode.title,
                                    children: GroupNode.children,
                                    folder: "false",
                                    icon: "icon-folder fancytree-icon",
                                    id: model_id + model_id,
                                    parent: model_id,
                                });
                                promise = new Promise((res, rej) => {
                                    new_group_node.render(true, true);
                                    res('');
                                });
                            }

                        });
                    }
                }
            });
            if (ft_load) {
                promise.then(() => {
                    var calc_node_key = $("li." + getParamModelId() + "_" + getParamCalcGroupId()).attr('key');
                    var current_group_node = ft.getNodeByKey(calc_node_key);
                    if (current_group_node) {
                        current_group_node.setExpanded();
                        activateFancytreeNode(true);
                    }
                });
            }
        }
        return true;
    } catch (error) {
        displayCatchError('fancytree-data');
        return false;
    }
}
//cleanup Unassigned Node in fancytree
function cleanupUnassignedNode(model_id, curFancytree, calc_ids) {
    var model_index = curFancytree.map(function (item) {
        return item.id;
    }).indexOf(model_id);
    var curModelFancytree = curFancytree[model_index].children;
    var unassigned_index = curModelFancytree.map(function (item) {
        return item.id;
    }).indexOf(model_id + model_id);
    var ft = $(".fancytree-structure").fancytree("getTree");
    var model_node_key = $("li ." + model_id + "_unassigned").attr('key');
    if (typeof model_node_key != 'undefined') {
        var current_model_node = ft.getNodeByKey(model_node_key);
        var unassigned_count = current_model_node.countChildren(false);
        $.each(calc_ids, function (i, calc) {
            var unassigned_calc_node_key = $("li." + model_id + "_unassigned li.unassigned_" + calc).attr('key');
            if (typeof unassigned_calc_node_key != 'undefined') {
                $(".fancytree-structure").fancytree("getTree").getNodeByKey(unassigned_calc_node_key).remove();
            }
        });

        unassigned_count = current_model_node.countChildren(false);
        if (unassigned_count == 0) {
            current_model_node.remove();
            curFancytree[model_index].children.splice(unassigned_index, 1);
        }
    }
    return curFancytree;
}
// Webservice - Fancytree Hier Read
function getWsCgHierRBind(requestData = '', async = false, callback) {
    var group_item = '';
    if (typeof requestData.group_id != 'undefined' && requestData.group_id != '') {
        group_item += '<CalcGroupId>' + requestData.group_id + '</CalcGroupId>';
    }
    if (typeof requestData.calc_id != 'undefined' && requestData.calc_id != '') {
        group_item += '<CalcId>' + requestData.calc_id + '</CalcId>';
    }
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarCgHierR>
                            <Calcgroupicon>icon-tree6</Calcgroupicon>
                            <Calcicon>icon-calculator3</Calcicon>
                            <Driverfldricon>icon-folder</Driverfldricon>
                            <Drivericon>icon-percent</Drivericon>
                            <Env>`+ getConfig('environment') + `</Env>
                            <Modelicon>icon-cube3</Modelicon>
                            <Stepfldricon>icon-folder</Stepfldricon>
                            <Stepicon>icon-make-group</Stepicon>
                            `+ group_item + `
                            `+ getParamDateTimeLastChanged() + `
                    </tns:ZdarCgHierR>`;
    return callWebService(url, request, 'ZdarCgHierRResponse', async, callback);
}

// Set fancytree
async function setFancyTree(response = false, async = false, callback) {
    var fancytree = await getIndexedDBStorage('fancytree-structure');
    if (response || !fancytree) {
        var data = getWsCgHierRBind('', async, callback);
    }
    if (!async) {
        data = prepareFancyTreeData(data);
        if (data && response) {
            return data;
        } else {
            return false;
        }
    } else {
        return true
    }
}

// Prepare fancytree data
function prepareFancyTreeData(response, group_id = '') {
    try {
        if (response == null || response == '' || response.Id === 'DYNAMIC') {
            return false;
        }
        var parent;
        var data = [];
        if (typeof (response) !== 'undefined' && !$.isArray(response)) {
            data.push(response);
        } else {
            data = response;
        }

        data = $.map(data, function (c) {
            c.icon += ' fancytree-icon';
            if (c.parent) {
                parent = data.find(x => x.id === c.parent);
                if (typeof (parent) !== 'undefined') {
                    if (parent.children) {
                        parent.children.push(c);
                    } else {
                        parent.children = [c];
                    }
                }
                return null;
            }
            return c;
        });
        data = transformParentChildToFancytree(data, group_id);
        if (group_id == '') {
            if (getLocalStorage('timemachine_datetime') === null) {
                setLocalStorage('FANCYTREE_REFRESH_TIME', getLastChangedDateTime());
            }
            setIndexedDBStorage('fancytree-structure', data);
        }
        return data;
    } catch (error) {
        displayCatchError('fancytree-data');
        return false;
    }
}

// Transform parent child to fancytree
function transformParentChildToFancytree(data, group_id = '') {
    try {
        var calculations_count = {};
        var drivers_count = {};
        var steps_count = {};
        var key = 1;
        $.each(data, function (i, val) {
            data[i].key = key++;
            if (val.hasOwnProperty('children')) {
                $.each(val.children, function (j, v) {
                    ft_cg_title = data[i].children[j].title;
                    if (ft_cg_title !== 'DYNAMIC' && ft_cg_title !== '(unassigned)') {
                        data[i].children[j].extraClasses = 'calc-group-fancytree-title';
                    }
                    if (v.hasOwnProperty('children')) {
                        calculations_count[v.title] = v.children.length;
                        $.each(v.children, function (k, v1) {
                            data[i].children[j].children[k].extraClasses = 'calculation-fancytree-title ft_calc_title_' + data[i].children[j].children[k].title;
                            if (v1.hasOwnProperty('children')) {
                                $.each(v1.children, function (l, v2) {
                                    if (v2.hasOwnProperty('children')) {
                                        if (v2.title == 'Drivers') {
                                            $.each(v2.children, function (m, v3) {
                                                data[i].children[j].children[k].children[l].children[m].extraClasses = 'driver-title';
                                            });
                                            drivers_count[v1.title] = v2.children.length;
                                        }
                                        if (v2.title == 'Steps') {
                                            $.each(v2.children, function (m, v3) {
                                                data[i].children[j].children[k].children[l].children[m].extraClasses = 'step-title';
                                            })
                                            steps_count[v1.title] = v2.children.length;
                                        }
                                    }
                                });
                            }
                        });
                    } else {
                        calculations_count[v.title] = 0;
                    }
                });
            }
        });
        if (group_id == '') {
            setIndexedDBStorage('calculations_count', calculations_count);
            setIndexedDBStorage('drivers_count', drivers_count);
            setIndexedDBStorage('steps_count', steps_count);
        } else {
            updateCGCalcCountData(calculations_count, drivers_count, steps_count);
        }
        return data;
    } catch (error) {
        displayCatchError('fancytree-data');
        return false;
    }
}

// Update CG calc count data
async function updateCGCalcCountData(calculations_count, drivers_count, steps_count) {
    await fancytreeCalcCountUpdate(calculations_count);
}

// Fancytree calc count update
async function fancytreeCalcCountUpdate(calculations_count) {
    var cur_calculations_count = await getIndexedDBStorage('calculations_count');
    $.each(calculations_count, function (i, val) {
        cur_calculations_count[i] = val;
    });
    await setIndexedDBStorage('calculations_count', cur_calculations_count);
}

// Generate fancytree callback
function generateFancyTreeCallback(response) {
    prepareFancyTreeData(response);
    if ($('#param-fancytree-render').val() == 1) {
        $('#param-fancytree-render').val(0);
        generateFancyTree(false, true);
    }
}

// Set model
function setModels() {
    getWsDObjectsRBind('%', true, updateModelsLocalStorage);
}

// Update model local storage
function updateModelsLocalStorage(response) {
    var models = [];
    if (typeof (response) !== 'undefined' && !$.isArray(response)) {
        models.push(response);
    } else {
        models = response;
    }
    setLocalStorage('models', models);
    updateDebuggerDatasourceField();
}

// Update dimensions local storage
async function updateDimensionLocalStorage(response) {
    try {
        var dimensionLists = [];
        if (typeof (response) !== 'undefined' && !$.isArray(response)) {
            dimensionLists.push(response);
        } else {
            dimensionLists = response;
        }
        await setIndexedDBStorage('dimensions', dimensionLists);
    } catch (error) {
        displayCatchError('dimension-list');
        return false;
    }
    getWsDimPrBind('%', true, updatePropertiesLocalStorage);
}

// Update properties local storage
function updatePropertiesLocalStorage(response) {
    try {
        var propertyLists = [];
        if (typeof (response) !== 'undefined' && !$.isArray(response)) {
            propertyLists.push(response);
        } else {
            propertyLists = response;
        }
        setIndexedDBStorage('properties', propertyLists);
        if (getLocalStorage('timemachine_datetime') === null) {
            setLocalStorage('PROPERTIES_REFRESH_TIME', getLastChangedDateTime());
        }
    } catch (error) {
        displayCatchError('property-list');
        return false;
    }
}

// set dimension property
function setDimensionProperty() {
    getWsDimensionRBind('%', true, updateDimensionLocalStorage);
}

// Get array key value pair
function getArrayKeyValuePair(result_array = [], extra_fields = true) {
    var result = {};
    if (extra_fields) {
        result['Environment'] = getConfig('environment');
        result['CalcGroupId'] = getParamCalcGroupId();
        result['DateTimeLastChanged'] = getLastChangedDateTime();
        result['UserIdLastChange'] = getCurrentUserName();
    }
    $.each(result_array, function (index, data) {
        result[data.name] = data.value;
    });
    return result;
}

// Check row modification
function checkRowModification(obj) {
    if ($(obj).closest('tr').hasClass('bk-yellow')) {
        alert('Only one operation allowed per row');
        return true;
    } else {
        return false;
    }
}

// Reset calc group detail local storage
function resetCalcGroupDetailLocalStorage() {
    var calculation_group_data = [{
        add_variables: [],
        modify_variables: [],
        delete_variables: [],
        copy_variables: [],
        rename_variables: [],
        delete_datasources: [],
        add_calculations: [],
        rename_calculations: [],
        remove_calculations: [],
        delete_calculations: [],
        calculation_group_rename: []
    }];
    setLocalStorage('calculation_group_data', calculation_group_data);
}

// Reset calculation detail local storage
function resetCalculationDetailLocalStorage() {
    var calculation_data = [{
        add_drivers: [],
        modify_drivers: [],
        delete_drivers: [],
        copy_drivers: [],
        rename_drivers: [],
        add_steps: [],
        modify_steps: [],
        delete_steps: [],
        copy_steps: [],
        rename_steps: []
    }];
    setLocalStorage('calculation_data', calculation_data);
}

// Replace special characters
function replaceSpecialCharacters(value = '', revert = false) {
    if (revert) {
        value = value.replace(/&gt;/ig, '>');
        value = value.replace(/&lt;/ig, '<');
        value = value.replace(/&quot;/ig, '"');
        value = value.replace(/&apos;/ig, '\'');
        value = value.replace(/&amp;/ig, '&');
    } else {
        value = value.replace(/&/ig, '&amp;');
        value = value.replace(/>/ig, '&gt;');
        value = value.replace(/</ig, '&lt;');
        value = value.replace(/"/ig, '&quot;');
        value = value.replace(/'/ig, '&apos;');
    }
    return value;
}

// Loader
function loader(action, callback, param) {
    if (action == 'show') {
        $('.ui_block').show();
    } else {
        $('.ui_block').hide();
    }
    if (callback) {
        setTimeout(function () { callback(param); }, 10);
    }
}

// Get calculation from fancytree
async function getCalculationFromFancyTree(model_id = '') {
    try {
        var calculations = [];
        var response = await getIndexedDBStorage('fancytree-structure');
        $.each(response, function (i, model) {
            if (model.id === model_id) {
                if (model.hasOwnProperty('children')) {
                    $.each(model.children, function (i, item) {
                        if (item.hasOwnProperty('children')) {
                            $.each(item.children, function (i, v) {
                                exists = calculations.filter(function (calculation) { return calculation.title == v.title });
                                if (exists.length === 0) {
                                    calculations.push(v);
                                }
                            });
                        }
                    });
                }
            }
        });
        return calculations;
    } catch (error) {
        displayCatchError('calculation-from-fancytree');
        return false;
    }
}

// Update field value
function updateFieldValue(btn_name, ids, update_temp_field, is_code_mirror = false, is_text_field = false, is_checkbox_field = false) {
    if (update_temp_field) {
        $.each(ids, function (i, id) {
            if (is_checkbox_field) {
                var field_val = $("." + id + ':checked').val();
            }
            else {
                var field_val = $("#" + id).val();
            }
            if (is_code_mirror) {
                $("#" + id + '-temp').val(field_val);
            } else {
                $("#" + id + '-temp').val('');
                if (field_val !== null && !is_text_field) {
                    // Multi Select Field
                    $("#" + id + '-temp').val(field_val.join(','));
                } else {
                    // Text or Select Field
                    $("#" + id + '-temp').val(field_val);
                }
            }
        });
    } else {
        $.each(ids, function (i, id) {
            if (is_checkbox_field) {
                var field_val = $("." + id + ':checked').val();
            }
            else {
                var field_val = $("#" + id + '-temp').val();
            }
            if (is_code_mirror) {
                $("#" + id).val(field_val);

                $("#" + id).next('.CodeMirror').remove();
                initializeCodeMirror(id);

                var element = document.getElementById(id);
                var default_value = element.defaultValue;
                if ($("#" + id + '-default').length > 0) {
                    var default_value = replaceSpecialCharacters($("#" + id + '-default').val(), true);
                }

                if (element.value !== default_value) {
                    $("#" + id).nextAll('.CodeMirror:first').addClass('bk-yellow');
                } else {
                    $("#" + id).nextAll('.CodeMirror:first').removeClass('bk-yellow');
                }
            } else {
                if (!is_checkbox_field) {
                    var temp_val = field_val;
                    if (temp_val !== '' && !is_text_field && temp_val !== null) {
                        temp_val = temp_val.split(",");
                    }
                    $("#" + id).val(temp_val);
                    if (!is_text_field) {
                        //Multi Select Field
                        $("#" + id).multiselect('refresh');
                    }
                    //Update Background
                    $("#" + id).trigger('change');
                    $("#" + id).trigger('keyup')
                } else {

                }
            }
            updateSaveButton();
        });
    }

    var current_modal = $('.' + btn_name).attr('data-target');
    $(current_modal).modal('hide');
}

// Update button color
function updateButtonColor(btn_name, input_ids, is_checkbox = false) {
    var field_values = false;
    if (is_checkbox) {
        $.each(input_ids, function (i, class_name) {
            if ($.trim($("." + class_name + ':checked').val())) {
                field_values = true;
            }
        });
    } else {
        $.each(input_ids, function (i, id) {
            if ($.trim($("#" + id).val()) !== '' && $.trim($("#" + id).val()) !== null && $.trim($("#" + id).val()) != 0 && ($.trim($("#" + id).val()) !== getParamModelId())) {
                field_values = true;
            }
        });
    }
    var current_modal = $('.' + btn_name).attr('data-target');
    $('.' + btn_name).removeClass('btn-grey');
    $('.' + btn_name).removeClass('btn-success');
    if (field_values) {
        $('.' + btn_name).addClass('btn-success');
    } else {
        $('.' + btn_name).addClass('btn-grey');
    }
    $(current_modal).modal('hide');
}

// Event update save button
function eventupdateSaveButton() {
    var updatebtn = true;
    if ($('.calculation-section')[0] && ($('#driver-modal').is(":visible") || $('#step-modal').is(":visible"))) {
        updatebtn = false;
        if ($('#driver-modal').is(":visible") && $('#driver_action').val() == 'edit' && !$('#repeat-driver-modal, #driver-options-modal, #dims-to-ignore-in-lkup-modal').is(":visible")) { //If this DRIVER edit form validate save btn.            
            updateDriverFormButton();
        }
        if ($('#step-modal').is(":visible") && ($('#step_action').val() == 'add' || $('#step_action').val() == 'edit') && !$('#repeat-step-modal').is(":visible")) { //If this STEP edit form validate save btn.            
            updateStepFormButton();
        }
    }
    if ($('.cg-detail-form-content')[0] && $('#variable-modal').is(":visible")) {
        updatebtn = false;
        if ($('#variable-modal').is(":visible")) { //If this VARIABLE edit form validate save btn.            
            updateVariableFormButton();
        }
    }
    if (updatebtn) {
        updateSaveButton();
    }
}

// Update save form button
function updateStepFormButton() {
    var flag = false;
    if ($('#step_action').val() == 'add' || $('#step_action').val() == 'edit') {
        var stepForm = $('form#step-form');
        var StepId = stepForm.find('input[name=StepId]').val();
        var Calculation = stepForm.find('textarea[name=Calculation]').val();
        var StepIdError = stepForm.find('input[name=StepId]').closest('div').find('.text-red').html();
        var stepFormChanges = stepForm.find('.bk-yellow');
        if (StepId !== '' && Calculation !== '' && typeof (Calculation) !== 'undefined' && (StepIdError === '' || typeof (StepIdError) === 'undefined') && stepFormChanges.length > 0) {
            flag = true;
        }
        if (!flag) {
            updateToPrimaryBtn('#step-modal .btn-submit');
            setTooltip('Saving is not allowed because some of the required fields are still left blank!', '.add-modify-step');
            if ($('#step_action').val() == 'edit' && stepFormChanges.length == 0) {
                updateToGreyBtn('#step-modal .btn-submit');
                removeTooltip('.add-modify-step');
            } else if ($('#step_action').val() == 'edit' && stepFormChanges.length > 0 && Calculation != '') {
                updateToPrimaryBtn('#step-modal .btn-submit');
            } else {
                stepForm.find('.btn-submit').addClass('disabled');
            }
        } else {
            updateToPrimaryBtn('#step-modal .btn-submit');
            if (stepForm.find('.btn-submit').hasClass('disabled')) {
                stepForm.find('.btn-submit').removeClass('disabled');
                removeTooltip('.add-modify-step');
            }
        }
    }
}

// Update driver form button
function updateDriverFormButton() {
    var flag = false;
    if ($('#driver_action').val() == 'add' || $('#driver_action').val() == 'edit') {
        var driverForm = $('form#driver-form');
        var DriverId = driverForm.find('input[name=DriverId]').val();
        var DriverType = driverForm.find('select[name=DriverType]').val();
        var SourceId = driverForm.find('select[name=SourceId]').val();
        var Dimension = driverForm.find('select[name=Dimension]').val();
        var DimAttribute = driverForm.find('select[name=DimAttribute]').val();
        var DriverIdError = driverForm.find('input[name=DriverId]').closest('div').find('.text-red').html();
        var driverFormChanges = driverForm.find('.bk-yellow');

        if (DriverId !== '' && DriverType !== '' && (DriverIdError === '' || typeof (DriverIdError) === 'undefined') && driverFormChanges.length > 0) {
            if (DriverType === 'MASTER_DATA' && Dimension !== '' && Dimension !== null && DimAttribute !== '' && DimAttribute !== null) {
                flag = true;
            }
            else if (DriverType !== 'MASTER_DATA' && SourceId !== '' && SourceId !== null) {
                flag = true;
            }
        }
        if (!flag) {
            updateToPrimaryBtn('#driver-modal .btn-submit');
            if ($('#driver_action').val() == 'edit' && driverFormChanges.length == 0) {
                updateToGreyBtn('#driver-modal .btn-submit');
            } else {
                driverForm.find('.btn-submit').addClass('disabled');
                setTooltip('Saving is not allowed because some of the required fields are still left blank!', '.add-modify-driver');
            }
        } else {
            updateToPrimaryBtn('#driver-modal .btn-submit');
            if (driverForm.find('.btn-submit').hasClass('disabled')) {
                driverForm.find('.btn-submit').removeClass('disabled');
                removeTooltip('.add-modify-driver');
            }
        }
    }
}

// Update variable form button
function updateVariableFormButton() {
    var flag = false;
    if ($('#variable-action').val() == 'A' || $('#variable-action').val() == 'E') {
        var variableForm = $('form#variable-modal-form');
        var VariableId = variableForm.find('input[name=VariableId]').val();
        var VariableType = variableForm.find('select[name=VariableType]').val();
        var Dimension = variableForm.find('select[name=Dimension]').val();
        var Property = variableForm.find('select[name=Property]').val();
        var VariableFilter = variableForm.find('textarea[name=VariableFilter]').val();
        var VariableIdError = variableForm.find('input[name=VariableId]').closest('div').find('.text-red').html();
        var variableFormChanges = variableForm.find('.bk-yellow');

        if (VariableId !== '' && VariableType !== '' && Dimension !== '' && Property !== '' && VariableFilter !== '' && (VariableIdError === '' || typeof (VariableIdError) === 'undefined') && variableFormChanges.length > 0) {
            flag = true;
        }

        if (!flag) {
            if ($('#variable-action').val() == 'E' && variableFormChanges.length == 0) {
                variableForm.find('.btn-submit').removeClass('btn-primary');
                variableForm.find('.btn-submit').addClass('btn-grey');
            } else {
                variableForm.find('.btn-submit').removeClass('btn-grey');
                variableForm.find('.btn-submit').addClass('btn-primary');
                variableForm.find('.btn-submit').removeClass('disabled');
                removeTooltip('#variable-modal .btn-submit');
            }
        } else {
            if ($('#variable-action').val() == 'E' && variableFormChanges.length > 0) {
                variableForm.find('.btn-submit').removeClass('btn-grey');
                variableForm.find('.btn-submit').addClass('btn-primary');
            } else {
                variableForm.find('.btn-submit').removeClass('disabled');
                removeTooltip('#variable-modal .btn-submit');
            }
        }
    }
}

// Update save button
function updateSaveButton(rmTooltip = false) {
    try {
        var is_field_value_changed = false;
        var class_name = '';
        if ($('.calculation-save').length > 0) {
            class_name = 'calculation-save';
            is_field_value_changed = ($('#calculation-form .bk-yellow').length > 0) ? true : false;
            if (!is_field_value_changed) {
                is_field_value_changed = ($("#param-calculations-sort-order").val() == 1) ? true : false;
            }
            var calculation_data = getLocalStorage('calculation_data');
            if (calculation_data !== null) {
                if (calculation_data[0].delete_steps.length > 0) {
                    is_field_value_changed = true;
                }
                if (calculation_data[0].delete_drivers.length > 0) {
                    is_field_value_changed = true;
                }
            }
            validateForm('calculation-save', validateCalculationForm);
        }
        if ($('.calc-group-save').length > 0) {
            class_name = 'calc-group-save';
            is_field_value_changed = ($('.cg-detail-form-content .bk-yellow').length > 0 || parseInt($('#param-calculations-sort-order').val()) === 1) ? true : false;
            var calculation_group_data = getLocalStorage('calculation_group_data');
            var delete_calculations = calculation_group_data[0]['delete_calculations'];
            if (delete_calculations.length > 0) {
                is_field_value_changed = true;
            }
            var delete_datasources = calculation_group_data[0]['delete_datasources'];
            if (delete_datasources.length > 0) {
                is_field_value_changed = true;
            }
            var remove_calculations = calculation_group_data[0]['remove_calculations'];
            if (remove_calculations.length > 0) {
                is_field_value_changed = true;
            }
            validateForm('calc-group-save', validateCGDetailForm);
        }

        if (class_name != '' && $('.' + class_name)[0]) {
            if (!hasWriteAccess()) {
                setTooltip('You do not have sufficient access to save changes.', '.' + class_name);
                $('.' + class_name).addClass('disabled');
                return false;
            }
            $('.' + class_name).removeClass('btn-grey active btn-primary');
            if (is_field_value_changed) {
                $('.' + class_name).addClass('btn-primary');
            } else {
                $('.' + class_name).addClass('btn-grey');
            }
        }

        if (rmTooltip) {
            removeTooltip('.' + class_name);
        }
        return true;
    } catch (error) {
        displayCatchError('save-action-error');
        return false;
    }
}

// Validate form
function validateForm(class_name, validate_function) {
    if (!validate_function()) {
        if (class_name == 'calc-group-save' || class_name == 'calculation-save') {
            removeTooltip('.' + class_name);
            $("." + class_name).removeClass('disabled');
        } else if (class_name == '#driver-modal .btn-submit') {
            removeTooltip(class_name);
            $(class_name).removeClass('disabled');
        } else {
            $(class_name).removeAttr('disabled');
        }
    } else {
        if (class_name == 'calc-group-save' || class_name == 'calculation-save') {
            setTooltip('Saving is not allowed because some of the required fields are still left blank!', '.' + class_name);
            $("." + class_name).addClass('disabled');
        } else if (class_name == '#driver-modal .btn-submit') {
            setTooltip('Saving is not allowed because some of the required fields are still left blank!', class_name);
            $(class_name).addClass('disabled');
        } else {

            $(class_name).attr('disabled', 'disabled');
        }
    }
}

// Validate CG detail form
function validateCGDetailForm() {
    var calc_group_id = $.trim($("#calc-group-id").val());
    var has_error = false;
    if (calc_group_id === '') {
        has_error = true;
    }
    $('#calc-group-detail-form [id^="datasource-dsource-id-"]').each(function () {
        if ($.trim($(this).val()) === '') {
            has_error = true;
        }
    });
    return has_error;
}

// Validate calculation form
function validateCalculationForm() {
    var calc_id = $.trim($("#calc-id").val());
    var source_id = $.trim($("#source-id").val());
    var target_id = $.trim($("#target-id").val());
    var has_error = false;
    if (calc_id === '') {
        has_error = true;
    }
    if (source_id === '') {
        has_error = true;
    }
    if (target_id === '') {
        has_error = true;
    }
    return has_error;
}

// Validate step form
function validateStepForm() {
    var step_id = $.trim($("#step-id").val());
    var step_calculation = $.trim($("#step-calculation").val());
    var has_error = false;
    if (step_id === '') {
        has_error = true;
    }
    if (step_calculation === '') {
        has_error = true;
    }
    return has_error;
}

// Validate driver form
function validateDriverForm() {
    var driver_id = $.trim($("#driver-modal #driver-id").val());
    var driver_type = $("#driver-modal #driver-type").val();
    var has_error = false;
    if (driver_id === '') {
        has_error = true;
    } else {
        if (!validateID($("#driver-modal #driver-id"), driver_id)) {
            has_error = true;
        }
    }
    if (driver_type === '') {
        has_error = true;
    }
    if (driver_type == 'MASTER_DATA') {
        var driver_dimension = $.trim($('#driver-modal #driver-dimension').val());
        var dim_attribute = $.trim($('#driver-modal #dim-attribute').val());
        if (driver_dimension === '') {
            has_error = true;
        }
        if (dim_attribute === '') {
            has_error = true;
        }
    } else {
        var driver_source_id = $.trim($('#driver-modal #driver-source-id').val());
        if (driver_source_id === '') {
            has_error = true;
        }
    }
    return has_error;
}

// Reset local storages
function resetLocalStorages() {
    setIndexedDBStorage('drivers_count', '');
    setIndexedDBStorage('steps_count', '');
    setIndexedDBStorage('dimensions', '');
    setIndexedDBStorage('properties', '');
    setLocalStorage('models', '');
    setLocalStorage('dimensions', '');
    setLocalStorage('properties', '');
    resetCalcGroupDetailLocalStorage();
    resetCalculationDetailLocalStorage();
}

$(document).on('shown.bs.popover', '.popover', function () {
    $(this).css({
        right: '0px',
    });
});

// Update cursor icon
function updateCursorIcon(selector = '') {
    if (selector == '') { return; }
    var canvas = document.createElement("canvas");
    canvas.width = 20;
    canvas.height = 20;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000000";
    ctx.font = "14px Icomoon";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("\ue98e", 12, 12);
    var dataURL = canvas.toDataURL('image/png');
    $(selector).css('cursor', 'url(' + dataURL + '), auto');
}

// Initialize custom popover
function initializeCustomPopover(selector) {
    var template = `<div class="popover" style="display: block; font-size: 11.5px;">
            <h3 class="popover-title"></h3>
            <div class="arrow"></div>
            <div class="popover-content"></div>
        </div>`;
    $(selector).popover({
        html: true,
        animation: false,
        trigger: 'manual',
        template: template
    }).on('click', function () {
        if ($('.popover').length > 0) {
            if ($(this).next('.popover').length > 0) {
                $('.popover').prev('.text-overflow-description').css('color', '#333');
                $('.popover').prev('.label-lite-green').css('color', '#FFF');
                $('.popover').popover('hide');
            } else {
                $('.popover').prev('.text-overflow-description').css('color', '#333');
                $('.popover').prev('.label-lite-green').css('color', '#FFF');
                $('.popover').popover('hide');
                $(this).popover("show");
                $(this).css('color', '#ddd');
            }
        } else {
            $(this).popover("show");
            $(this).css('color', '#ddd');
        }
    });
}

// Initialize Popover
function initializePopover(selector = '', template = '', trigger = 'manual') {
    selector = (selector) ? selector : '[data-popup=popover]';
    if ($.trim(template) === "") {
        template = `<div class="popover" style="display: block; font-size: 11.5px;">
            <h3 class="popover-title"></h3>
            <div class="arrow"></div>
            <div class="popover-content"></div>
        </div>`;
    }
    $(selector).popover({
        html: true,
        animation: false,
        trigger: trigger,
        template: template
    }).on("mouseenter", function () {
        var _this = this;
        $(this).popover("show");
        $(".popover").on("mouseleave", function () {
            $(_this).popover('hide');
        });
    }).on("mouseleave", function () {
        var _this = this;
        setTimeout(function () {
            if (!$(".popover:hover").length) {
                $(_this).popover("hide");
            }
        }, 100);
    });
}

// Initialize tooltip
function initializeTooltip(selector) {
    selector = (selector) ? selector : '[data-popup=tooltip]';
    $(selector).tooltip();
}

// Set popover
function setPopover(title = '', content = '', selector = '', placement = 'bottom') {
    removePopover(selector);
    if (content !== '' && content != 'None' && content != null) {
        $(selector).popover({
            title: title,
            content: content,
            html: true,
            animation: false,
            trigger: 'manual',
            placement: placement
        }).on("mouseenter", function () {
            var _this = this;
            $(this).popover("show");
            $(".popover").on("mouseleave", function () {
                $(_this).popover('hide');
            });
        }).on("mouseleave", function () {
            var _this = this;
            setTimeout(function () {
                if (!$(".popover:hover").length) {
                    $(_this).popover("hide");
                }
            }, 100);
        });
    }
}

// Set popover 2
function setPopover2(title = '', content = '', title2 = '', content2 = '', selector = '', placement = 'bottom', custom_template = '') {
    removePopover(selector);
    if (content !== '' || content2 !== '') {
        custom_template = `<div class="popover popover2" style="display: block; font-size: 11.5px;">
            <h3 class="popover-title">${title}</h3>
            <div class="arrow"></div>
            <div class="popover-content">${content}</div>
            <h3 class="popover-title2">${title2}</h3><div class="arrow"></div><div class="popover-content2">${content2}</div>
        </div>`;
        $(selector).popover({
            title: title,
            content: content,
            title2: title2,
            content2: content2,
            html: true,
            animation: false,
            trigger: 'manual',
            placement: placement,
            template: custom_template
        }).on("mouseenter", function () {
            var _this = this;
            $(this).popover("show");
            $(".popover").on("mouseleave", function () {
                $(_this).popover('hide');
            });
        }).on("mouseleave", function () {
            var _this = this;
            setTimeout(function () {
                if (!$(".popover:hover").length) {
                    $(_this).popover("hide");
                }
            }, 100);
        });
    }
}

// Remove popover
function removePopover(selector = '') {
    $(selector).popover('destroy');
}

// Set tooltip
function setTooltip(title = '', selector = '', placement = 'bottom') {
    if (title !== '' && title != 'None') {
        $(selector).attr('data-popup', 'tooltip');
        $(selector).attr('data-original-title', title);
        $(selector).attr('data-placement', placement);
    }
    initializeTooltip(selector);
}

// Remove tooltip
function removeTooltip(selector = '') {
    try {
        $(selector).tooltip('destroy');
    }
    catch (error) { }
}

// Get popover
function getPopover(title = '', content = '') {
    return `data-popup="popover" data-title="${title}" data-trigger="hover" data-placement="bottom" data-content="${content}"`;
}

// Update page title
function updatePageTitle(space_title = 'HOME', page_title = '') {
    page_title = (page_title && space_title != 'HOME') ? ' - ' + page_title : '';
    space_title = (space_title) ? ' - ' + space_title : '';
    document.title = 'Darwin EVO' + space_title + page_title;
}

// Table dropdown filter
function tableDropDownFilter(_this, action = 'show') {
    if (action == 'show') {
        if (!_this.closest('th').find('.caret').hasClass('icon-filter3')) {
            _this.closest('th').find('.caret').addClass('icon-filter3');
            _this.closest('th').find('.caret').removeClass('caret');
        }
    } else {
        _this.closest('th').find('.icon-filter3').addClass('caret');
        _this.closest('th').find('.icon-filter3').removeClass('icon-filter3');
    }
}

// Update to grey button
function updateToGreyBtn(selector) {
    $(selector).removeClass('btn-primary').addClass('btn-grey');
}

// Update to primary button
function updateToPrimaryBtn(selector) {
    $(selector).removeClass('btn-grey').addClass('btn-primary');
}
/* Step/Driver functions Start*/
// Open step form
function openStepForm(step_id, action = "edit", calc_id = '') {
    try {
        getCalcVariablesData(getParamCalcGroupId());
        if ($("#param-context-menu-action").val() != '') {
            return true;
        }
        $('#step-modal').find('.bk-yellow').removeClass('bk-yellow');
        $('#step-modal').find('.step-id-input-field .text-red').html('');

        $(".repeat-step-btn").removeClass('btn-success');
        $(".repeat-step-btn").addClass('btn-grey');
        $('.step-error-message').html('');
        if (action === 'add') {
            $('.step-id-rename').addClass('hide');
            $('#step-id').removeAttr('readonly');
            $("#step-modal .modal-title").html('Add New Step');
        } else {
            $('.step-id-rename').removeClass('hide');
            $('#step-id').attr('readonly', 'readonly');
            if (!hasWriteAccess()) {
                $('.input-group-addon').addClass('hide');
                disableFormInputModal('#step-modal', 'View Step');
            } else {
                $("#step-modal .modal-title").html('Edit Step');
            }
        }

        $('#step-form #step_action').val(action);

        $('#step-form')[0].reset();
        $("#write-results, #reuse-results-in-calc, #reuse-results-in-grp").prop("checked", false);
        updateSwitchery('#step-enabled', true);
        $('#step-modal .styled').uniform();

        $('#step-modal').modal({ backdrop: 'static', keyboard: false });
        // $('#step-modal .CodeMirror').remove();
        setPopover('REPEAT STEP PARAMETER', '', '.modal .repeat-step-btn');

        if (step_id !== '') {
            loadStep(step_id, calc_id);
        } else {
            initializeStepFormCodeMirror();
        }
        return true;
    } catch (error) {
        displayCatchError('add-step-form-error');
        return false;
    }
}

// initialize step form CodeMirror
function initializeStepFormCodeMirror() {
    $('#step-modal .CodeMirror').remove();
    initializeCodeMirror("step-criteria");
    initializeCodeMirror("step-calculation");
    initializeCodeMirror("result-dim-ovr");
    initializeCodeMirror("repeat-step");
}

// Load step
function loadStep(step_id, calc_id) {
    if (step_id !== '') {
        var json_response = $('.calculation-step-table #step_' + step_id).val();
        if (typeof json_response != "undefined" && json_response != "undefined") {
            response = JSON.parse(unescape(json_response));
            calc_id = getParamCalcId();
            if (response.CalcId != calc_id) {
                getWsCalcDtlRBind(calc_id, step_id, true, loadStepDetail);
                return false;
            }
        } else {
            getWsCalcDtlRBind(calc_id, step_id, true, loadStepDetail);
            return false;
        }
        loadStepDetail(response);
    }
}

// Load step detail
function loadStepDetail(response) {
    try {
        $("#step-id").val(response.StepId);
        $("#step-descr").val(replaceSpecialCharacters(response.StepDescr, true));
        /* Step Criteria/Calculation/Destination*/
        $("#repeat-step").val(response.RepeatStep);
        $('#hiddenFromstepid, #hiddenstepidAction').remove();
        if (response.Enabled === "0") {
            updateSwitchery('#step-enabled', false);
        }
        if (response.WriteResults !== "0") {
            $("#write-results").prop("checked", true);
        }
        if (response.ReuseResultsInCalc !== "0") {
            $("#reuse-results-in-calc").prop("checked", true);
        }
        if (response.ReuseResultsInGrp !== "0") {
            $("#reuse-results-in-grp").prop("checked", true);
        }
        $("#step-criteria-cm").val(response.Criteria);
        $("#step-calculation-cm").val(response.Calculation);
        $("#result-dim-ovr-cm").val(response.ResultDimOvr);
        $("#step-criteria").val(replaceSpecialCharacters(response.Criteria, true));
        $("#step-calculation").val(replaceSpecialCharacters(response.Calculation, true));
        $("#result-dim-ovr").val(replaceSpecialCharacters(response.ResultDimOvr, true));

        var check_default_field_exist = true;
        createDefaultValues("step-id", response.StepId, check_default_field_exist);
        createDefaultValues("step-descr", response.StepDescr, check_default_field_exist);
        createDefaultValues("step-criteria", response.Criteria, check_default_field_exist);
        createDefaultValues("step-calculation", response.Calculation, check_default_field_exist);
        createDefaultValues("result-dim-ovr", response.ResultDimOvr, check_default_field_exist);
        createDefaultValues("step-criteria-cm", response.Criteria, check_default_field_exist);
        createDefaultValues("step-calculation-cm", response.Calculation, check_default_field_exist);
        createDefaultValues("result-dim-ovr-cm", response.ResultDimOvr, check_default_field_exist);
        createDefaultValues("repeat-step", response.RepeatStep, check_default_field_exist);
        createTempValues("repeat-step", response.RepeatStep, check_default_field_exist);
        updateButtonColor('repeat-step-btn', ['repeat-step']);
        setPopover('REPEAT STEP PARAMETER', response.RepeatStep, '.modal .repeat-step-btn');
        if ($('#param-calc-step-modal').val() != "1") {
            initializeStepFormCodeMirror();
        }
        $('#step-modal .styled').uniform();
        if ($('#step-modal .btn-submit').hasClass('disabled')) {
            $('#step-modal .btn-submit').removeClass('disabled');
            removeTooltip('.add-modify-step');
        }
        updateStepFormButton();
    } catch (error) {
        displayCatchError('step-save-error');
        return false;
    }
}

// Webservice - Calc step read
function getWsCalcDtlRBind(calc_id = '%', step_id = '%', async = false, callback) {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarCalcDtlR>
                    <Env>${getEnvironment()}</Env>
                    <Calcid>${calc_id}</Calcid>
                    <Stepid>${step_id}</Stepid>
                    `+ getParamDateTimeLastChanged() + `
                </tns:ZdarCalcDtlR>`;
    return callWebService(url, request, 'ZdarCalcDtlRResponse', async, callback);
}

// Webservice - Calc driver read
function getWsCalcDrvRBind(calc_id = '%', driver_id = '%', async = false, callback) {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarCalcDrvR>
                    <Env>${getConfig('environment')}</Env>
                    <Calcid>${calc_id}</Calcid>
                    <Driverid>${driver_id}</Driverid>
                    `+ getParamDateTimeLastChanged() + `
                </tns:ZdarCalcDrvR>`;
    return callWebService(url, request, 'ZdarCalcDrvRResponse', async, callback);
}

/*CheckBox Switchery*/
function updateSwitchery(id, value) {
    var element = document.querySelector(id);
    element.checked = value;
    if (typeof Event === 'function' || !document.fireEvent) {
        var event = document.createEvent('HTMLEvents');
        event.initEvent('change', true, true);
        element.dispatchEvent(event);
    } else {
        element.fireEvent('onchange');
    }
}

/* Load Modal form */
function loadFormContent(req_url, modal_id = '') {
    if (!$('#' + modal_id)[0]) {
        var response;
        $.ajax({
            type: "GET",
            url: req_url,
            async: false,
            success: function (text) {
                response = text;
            }
        });
        $('#cg_overview_pg').prepend(response);
        if (modal_id == 'step-modal') {
            var elem = document.querySelector('.js-switch');
            var init = new Switchery(elem);
        }
    }
}

// Update driver dimensions
async function updateDriverDimensions(response = '') {
    try {
        if (!response) {
            getWsCgDObjectsRBind('%', getParamCalcGroupId(), true, updateDriverDimensions);
            return false;
        }
        var data_sources = [];
        var dimensionLists = [];
        var dimLists = await getIndexedDBStorage('dimensions');
        if (typeof (response) !== 'undefined' && !$.isArray(response)) {
            data_sources.push(response);
        } else {
            data_sources = response;
        }
        if (typeof (dimLists) !== 'undefined' && !$.isArray(dimLists)) {
            dimensionLists.push(dimLists);
        } else {
            dimensionLists = dimLists;
        }
        var driver_dimension_id = $('#driver-dimension').val();
        $('#driver-dimension').html('<option></option>');
        var model_arr = [];
        $.each(data_sources, function (i, itemDataSource) {
            if (typeof (dimensionLists) !== 'undefined' && dimensionLists !== '') {
                $.each(dimensionLists, function (i, item) {
                    if ($.inArray(item.Dimension, model_arr) === -1) {
                        $('#driver-dimension').append('<option value="' + item.Dimension + '">' + item.Dimension + '</option>');
                        model_arr.push(item.Dimension);
                    }
                });
            }
        });
        addMissingMemberLists("#driver-dimension", driver_dimension_id);
        sortAscDropdownList('#driver-dimension');
        $('#driver-dimension').val(driver_dimension_id);
        $('#driver-dimension').select2().on('select2:select', function (e) {
            $('#driver-modal .CodeMirror').remove();
            initializeCodeMirror("driver-lookup-override");
        });
    } catch (error) {
        displayCatchError('dimension-list');
        return false;
    }
}

// Open driver form
function openDriverForm(driver_id, action = "edit", calc_id = '') {
    loadDriverTypes();
    try {
        var option = '';
        var calc_group_id = getParamCalcGroupId();
        getCalcVariablesData(getParamCalcGroupId());
        var dsources = getActiveDataSources(calc_group_id);
        $(dsources).each(function (i, item) {
            option += `<option value="${item.DobjectId}">${item.DobjectId}</option>`;
        });
        $('#driver-source-id').html(option);
        $('#driver-modal .CodeMirror').remove();
        $('.dependent-data').removeClass('hidden');
        $('.dependent-data').addClass('hidden');
        $('#driver-modal').find('.bk-yellow').removeClass('bk-yellow');
        $('#driver-modal').find('.driver-id-input-field .text-red').html('');
        $("#driver-modal .advanced-options button").removeClass('btn-success');
        $("#driver-modal .advanced-options button").addClass('btn-grey');
        if (action === 'add') {
            $('.driver-id-rename').addClass('hide');
            $('#driver-id').removeAttr('readonly');
            $("#driver-modal .modal-title").html('Add New Driver');
        } else {
            $('.driver-id-rename').removeClass('hide');
            $('#driver-id').attr('readonly', 'readonly');
            if (!hasWriteAccess()) {
                $('.input-group-addon').addClass('hide');
                disableFormInputModal('#driver-modal', 'View Driver');
            } else {
                $("#driver-modal .modal-title").html('Edit Driver');
            }
        }

        $('#driver-form')[0].reset();
        $('#driver-form #driver_action').val(action);

        setPopover('REPEAT DRIVER', '', '#driver-modal .repeat-driver-btn', 'top');
        setPopover('DRIVER OPTIONS', '', '#driver-modal .driver-options-btn', 'top');
        setPopover('DIMENSIONS TO IGNORE IN LOOKUP', '', '#driver-modal .dims-to-ignore-in-lkup-btn', 'top');

        $('#driver-modal').modal({ backdrop: 'static', keyboard: false });
        $("#driver-modal .select-field").select2();
        if (driver_id !== '') {
            loadDriver(driver_id, calc_id);
        } else {
            initializeDriverFormCodeMirror();
        }
        updateDriverDimensions(dsources);
        return true;
    } catch (error) {
        displayCatchError('add-driver-form-error');
        return false;
    }
}

function initializeDriverFormCodeMirror() {
    $('#driver-modal .CodeMirror').remove();
    initializeCodeMirror("driver-lookup-override");
    initializeCodeMirror("repeat-driver");
    initializeCodeMirror("driver-options");
    initializeCodeMirror("dims-to-ignore-in-lkup");
}
// Load driver detail
async function loadDriverDetail(response) {
    try {
        $('#driver-source-id').select2();
        $('#driver-modal .CodeMirror').remove();
        $("#driver-id").val(response.DriverId);
        $("#driver-descr").val(replaceSpecialCharacters(response.DriverDescr, true));
        $("#driver-type").val(response.DriverType);
        addMissingMemberLists("#driver-dimension", response.Dimension);
        $("#driver-dimension").val(response.Dimension);
        addMissingMemberLists("#driver-source-id", response.SourceId);
        $("#driver-source-id").val(response.SourceId);
        await listProperties(response.Dimension);

        sortAscDropdownList('#dim-attribute');
        addMissingMemberLists("#dim-attribute", response.DimAttribute);
        $("#dim-attribute").val(response.DimAttribute);
        $("#driver-source-id").val(response.SourceId);
        $("#driver-lookup-override").val(replaceSpecialCharacters(response.DriverLookupOverride, true));
        $("#repeat-driver").val(replaceSpecialCharacters(response.RepeatDriver, true));
        $("#driver-options").val(replaceSpecialCharacters(response.DriverOptions, true));
        $("#dims-to-ignore-in-lkup").val(replaceSpecialCharacters(response.DimsToIgnoreInLkup, true));
        var check_default_field_exist = true;
        createDefaultValues("driver-id", response.DriverId, check_default_field_exist);
        createDefaultValues("driver-descr", response.DriverDescr, check_default_field_exist);
        createDefaultValues("driver-type", response.DriverType, check_default_field_exist);
        createDefaultValues("driver-dimension", response.Dimension, check_default_field_exist);
        createDefaultValues("dim-attribute", response.DimAttribute, check_default_field_exist);
        createDefaultValues("driver-source-id", response.SourceId, check_default_field_exist);
        createDefaultValues("driver-lookup-override", response.DriverLookupOverride, check_default_field_exist);

        createDefaultValues("repeat-driver", response.RepeatDriver, check_default_field_exist);
        createDefaultValues("driver-options", response.DriverOptions, check_default_field_exist);
        createDefaultValues("dims-to-ignore-in-lkup", response.DimsToIgnoreInLkup, check_default_field_exist);

        createTempValues("repeat-driver", response.RepeatDriver, check_default_field_exist);
        createTempValues("driver-options", response.DriverOptions, check_default_field_exist);
        createTempValues("dims-to-ignore-in-lkup", response.DimsToIgnoreInLkup, check_default_field_exist);

        if ($('#param-calc-driver-modal').val() != "1") {
            initializeDriverFormCodeMirror();
        }

        setPopover('REPEAT DRIVER', response.RepeatDriver, '#driver-modal .repeat-driver-btn', 'top');
        setPopover('DRIVER OPTIONS', response.DriverOptions, '#driver-modal .driver-options-btn', 'top');
        setPopover('DIMENSIONS TO IGNORE IN LOOKUP', response.DimsToIgnoreInLkup, '#driver-modal .dims-to-ignore-in-lkup-btn', 'top');

        updateButtonColor('repeat-driver-btn', ['repeat-driver']);
        updateButtonColor('driver-options-btn', ['driver-options']);
        updateButtonColor('dims-to-ignore-in-lkup-btn', ['dims-to-ignore-in-lkup']);
        $("#driver-modal .select-field").select2();
        $("#driver-type").trigger('change');
        updateToGreyBtn('#driver-modal .btn-submit');
    } catch (error) {
        displayCatchError('driver-save-error');
        return false;
    }
}

// Load driver
function loadDriver(driver_id, calc_id) {
    if (driver_id !== '') {
        var promise = new Promise((res, rej) => {
            var json_response = $('.calculation-driver-table #driver_' + driver_id).val();
            if (typeof json_response != "undefined" && json_response != "undefined") {
                response = JSON.parse(unescape(json_response));
                calc_id = getParamCalcId();
                if (response.CalcId != calc_id) {
                    response = getWsCalcDrvRBind(calc_id, driver_id);
                }
                res(response);
            } else {
                getWsCalcDrvRBind(calc_id, driver_id, true, loadDriverDetail);
                return false;
            }
        });
        promise.then(() => {
            loadDriverDetail(response);
        });
    }
}

// Load driver types
function loadDriverTypes() {
    try {
        var driver_types = getConfig('driver_types');
        if ($.trim($("#driver-type").html()) == '') {
            $("#driver-type").html('<option value="">&npsb</option>');
            $.each(driver_types, function (i, drivers) {
                $("#driver-type").append('<option value="' + drivers.value + '">' + drivers.name + '</option>');
            });
            $("#driver-type").select2();
        }
    } catch (error) {
        displayCatchError('driver-types');
        return false;
    }
}

$(document).on("click", "#driver-modal .update-btn,#repeat-step-modal .update-btn, .calculation-section .update-btn", function (e) {
    try {
        var update_temp_field = false;
        var attr_id = $(this).attr('attr-id');
        var field_id_arr = attr_id.split(',');
        if ($(this).hasClass('btn-primary')) {
            update_temp_field = true;
        }
        var data_dismiss = $(this).attr('data-dismiss');
        var data_dismiss_modal = $(this).hasClass('data-dismiss-modal');
        field_id_arr.forEach(function (field_id) {
            var text_or_select_field = true;
            var is_checkbox_field = false;
            var code_mirror = false;
            if (update_temp_field) {
                if (field_id == 'rem-data') {
                    if ($('.rem-data:checked').val() === 'Y') {
                        updateButtonColor(field_id + '-btn', [field_id], true);
                    } else {
                        $('.rem-data-btn').removeClass('btn-success');
                        $('.rem-data-btn').addClass('btn-grey');
                    }

                    if ($('.rem-data:checked').val() !== $("#rem-data-default").val()) {
                        $('.rem-data').addClass('bk-yellow');
                    } else {
                        $('.rem-data').removeClass('bk-yellow');
                    }
                    is_checkbox_field = true;
                } else {
                    updateButtonColor(field_id + '-btn', [field_id]);
                }
            }
            if (field_id === 'aggregate-dims') {
                text_or_select_field = false;
            }
            if (field_id === 'repeat-driver' || field_id === 'driver-options' || field_id === 'dims-to-ignore-in-lkup') {
                code_mirror = true;
            }
            if (field_id === 'source-id' && !data_dismiss) {
                setPopover('DATA SOURCE', $('#source-id').val(), '.calculation-section .source-id-btn', 'top');
            }
            if (field_id === 'target-id' && !data_dismiss) {
                setPopover('DATA TARGET', $('#target-id').val(), '.calculation-section .target-id-btn', 'top');
            }
            if (field_id === 'calc-data-alias' && !data_dismiss) {
                setPopover('SOURCE AMOUNT DATA ALIAS', $('#calc-data-alias').val(), '.calculation-section .calc-data-alias-btn', 'top');
            }
            if (field_id === 'calc-ytd' && !data_dismiss) {
                setPopover('YTD DATA FORMAT', $('#calc-ytd option:selected').text(), '.calculation-section .calc-ytd-btn', 'top');
            }
            if (field_id === 'aggregate-dims' && !data_dismiss) {
                var AggDims = $('#aggregate-dims').val();
                AggDims = (AggDims !== null) ? AggDims.join(',') : '';
                var aggregate_function = $("#aggregate-function").val();
                if (AggDims !== '' && aggregate_function !== 'SUM') {
                    AggDims = 'AGG_FUNCTION=' + aggregate_function + ', ' + AggDims;
                }
                setPopover('AGGREGATE DIMENSIONS', AggDims, '.calculation-section .aggregate-dims-btn', 'top');
            }
            if (field_id === 'repeat-driver' && !data_dismiss_modal) {
                setPopover('REPEAT DRIVER', $('#repeat-driver').val(), '#driver-modal .repeat-driver-btn', 'top');
            }
            if (field_id === 'driver-options' && !data_dismiss_modal) {
                setPopover('DRIVER OPTIONS', $('#driver-options').val(), '#driver-modal .driver-options-btn', 'top');
            }
            if (field_id === 'dims-to-ignore-in-lkup' && !data_dismiss_modal) {
                setPopover('DIMENSIONS TO IGNORE IN LOOKUP', $('#dims-to-ignore-in-lkup').val(), '#driver-modal .dims-to-ignore-in-lkup-btn', 'top');
            }
            if (field_id === 'repeat-step' && !data_dismiss_modal) {
                setPopover('REPEAT STEP PARAMETER', $('#repeat-step').val(), '.modal .repeat-step-btn');
            }

            if (field_id === 'rem-data' && !data_dismiss) {
                if ($('.rem-data:checked').val() === 'Y') {
                    var rem_data_content = 'Yes (Remove any incoming data queried by this Calc)';
                } else {
                    var rem_data_content = 'No (Keep all data queried by this Calc)';
                }
                setPopover('REMOVE CALC SOURCE DATA IN DATA SOURCE CUBE', rem_data_content, '.calculation-section .rem-data-btn', 'top');
            } else {
                var calc_form = $('form#calculation-form');
                if ($("#rem-data-temp").val() === 'Y') {
                    calc_form.find(".radio-styled-box input[value='Y']").prop('checked', true);
                } else {
                    calc_form.find(".radio-styled-box input[value='N']").prop('checked', true);
                }
                calc_form.find('.radio-styled-box input[name=RemDataFromMini]').uniform();
            }
            updateFieldValue(field_id + '-btn', [field_id], update_temp_field, code_mirror, text_or_select_field, is_checkbox_field);
            eventupdateSaveButton();
        });
    } catch (error) {
        displayCatchError('popover-error');
        return false;
    }
});
$(".modal").draggable({
    handle: ".modal-header",
});
$(document).bind('click', '#driver-modal .update-btn', function () {
    updateDriverFormButton();
});
$(document).bind('click', '#repeat-step-modal .update-btn', function () {
    updateStepFormButton();
});
$(document).on('change', '#step-modal input[type="checkbox"]', function () {
    if ($('#step-modal').is(":visible")) {
        if ($('.calculation-step-table #step_' + $('#step-modal #step-id').val())[0]) {
            var stepItemData = JSON.parse(unescape($('.calculation-step-table #step_' + $('#step-modal #step-id').val()).val()));
            $(this).removeClass('bk-yellow')
            if ($(this).prop("checked") == true) {
                if (stepItemData[$(this).attr('name')] != '-1') {
                    $(this).addClass('bk-yellow');
                }
            } else {
                if (stepItemData[$(this).attr('name')] != '0') {
                    $(this).addClass('bk-yellow');
                }
            }
            updateStepFormButton();
        }
    }
});

// Add missing member lists
function addMissingMemberLists(selector = '', value = '') {
    if (!value) { return; }
    if (!Array.isArray(value)) {
        if ($(selector + ' option[value=' + value + ']').length) {
            $(selector).val(value);
        } else {
            $(selector).append('<option value="' + value + '">' + value + '</option>');
        }
    } else {
        $.each(value, function (i, val) {
            if ($.trim(val) != '') {
                if ($(selector + ' option[value=' + val + ']').length) {
                    $(selector).val(val);
                } else {
                    $(selector).append('<option value="' + val + '">' + val + '</option>');
                }
            }
        });
    }
    sortAscDropdownList(selector);
}

// Sort asc dropdown list
function sortAscDropdownList(selector = '') {
    if (selector) {
        var options = $(selector + ' option');
        var arr = options.map(function (_, o) {
            return {
                t: $(o).text(),
                v: o.value
            };
        }).get();
        arr.sort(function (o1, o2) {
            return o1.t > o2.t ? 1 : o1.t < o2.t ? -1 : 0;
        });
        options.each(function (i, o) {
            o.value = arr[i].v;
            $(o).text(arr[i].t);
        });
    }
}
/* Step/Driver functions End*/
// Fancytree add node
function ftaddNode(nkey, new_title, ft_icon = '', lastchild = false, sort_asc = false) {
    if (typeof nkey != 'undefined' && nkey != 'undefined') {
        var ft = $(".fancytree-structure").fancytree("getTree");
        var node = ft.getNodeByKey(nkey);
        var node_level = node.getLevel();
        var extraClass = '';
        switch (node_level) {
            case 1:
            case 2:
                extraClass = 'calc-group-fancytree-title';
                break;
            case 3:
                extraClass = 'calculation-fancytree-title ft_calc_title_' + node.title;
                break;
            case 4:
                if (node.title == 'Steps') {
                    extraClass = 'step-title';
                } else {
                    extraClass = 'driver-title';
                }
                break;
            default:
                break;
        }
        var newNode = node.addNode({
            title: new_title,
            icon: 'fancytree-icon ' + ft_icon,
            extraClasses: extraClass,
            key: null // make sure, a new key is generated
        }, 'child');
        node.render(true, true);
        $(newNode.li).find('.fancytree-node').addClass('bk-yellow');
        if (lastchild) {
            newNode.moveTo(node, 'child');
        } else {
            newNode.moveTo(node, 'firstChild');
        }

        if (sort_asc && (extraClass == 'driver-title' || extraClass == 'calc-group-fancytree-title')) {
            var node = $(".fancytree-structure").fancytree("getActiveNode");
            if (node.extraClasses == 'driver-title' || extraClass == 'calc-group-fancytree-title') { node = node.parent; }
            node.sortChildren(null, true);
        }

        if (node.extraClasses == 'driver-title' || node.extraClasses == 'step-title') {
            node.parent.setExpanded();
        } else {
            node.setExpanded();
        }
        return newNode.key;
    }
}

// Fancytree copy node
function ftCopyNode(nkey, new_title, lastchild = false, sort_asc = false) {
    if (typeof nkey == 'undefined' && nkey == 'undefined') {
        return true;
    } else {
        var ft = $(".fancytree-structure").fancytree("getTree");
        var node = ft.getNodeByKey(nkey);

        var new_sibling = ft.getNodeByKey(node.key).copyTo(node, 'after', function (n) {
            n.key = null; // make sure, a new key is generated
        });
        new_sibling.setTitle(new_title);
        new_sibling.render(true, true);
        if (lastchild) {
            new_sibling.moveTo(node.parent, 'child');
        } else {
            new_sibling.moveTo(node.parent, 'firstChild');
        }
        if (sort_asc && (new_sibling.extraClasses == 'driver-title' || new_sibling.title == 'Drivers')) {
            if (new_sibling.extraClasses == 'driver-title') {
                new_sibling = new_sibling.parent;
            }
            new_sibling.sortChildren(null, true);
        }
        if (new_sibling.extraClasses == 'driver-title' || new_sibling.extraClasses == 'step-title') {
            new_sibling.parent.setExpanded();
        } else {
            new_sibling.setExpanded();
        }
        return new_sibling.key;
    }
}

// Fancytree rename node
function ftRenameNode(nkey, new_title, sort_asc = false) {
    if (typeof nkey == 'undefined' && nkey == 'undefined') {
        return true;
    } else {
        var node = $(".fancytree-structure").fancytree("getTree").getNodeByKey(nkey);
        node.setTitle(new_title);
        var nodeLevel = node.getLevel();
        var parentCls = node.getParent().title;
        node.render(true, true);
        var nodeCls = node.title;
        if (parentCls == '(unassigned)') {
            parentCls = 'unassigned';
        }
        if (nodeCls == '(unassigned)') {
            nodeCls = 'unassigned';
        }
        $(node.li).attr('class', '');
        $(node.li).addClass(parentCls + '_' + nodeCls);
        if (sort_asc && (node.extraClasses == 'driver-title' || node.title == 'Drivers')) {
            if (node.extraClasses == 'driver-title') {
                node = node.parent;
            }
            node.sortChildren(null, true);
        }
    }
}

// Fancytree delete node
function ftDeleteNode(nkey) {
    if (typeof nkey != 'undefined' || nkey != 'undefined') {
        var node = $(".fancytree-structure").fancytree("getTree").getNodeByKey(nkey);
        parent = node.parent;
        $(".fancytree-structure").fancytree("getTree").getNodeByKey(nkey).remove();
        if (parent) {
            parent.render(true, true);
            parent.setExpanded();
        }
    }
}

// Fancytree reorder node
function ftReorderNode(table) {
    if (table == 'step') {
        var step_params = [];
        $('.calculation-step-table tbody tr').each(function () {
            var step_data = JSON.parse(unescape($(this).find('.step_data').val()));
            step_params.push({
                extraClasses: "step-title",
                folder: "false",
                icon: "icon-make-group fancytree-icon",
                id: step_data.StepId,
                parent: getParamCalcId() + getParamCalcGroupId() + "_STEPS",
                title: step_data.StepId
            });
        });

        var ft_key = $("li." + getParamModelId() + "_" + getParamCalcGroupId() + " li." + getParamCalcGroupId() + "_" + getParamCalcId() + " li." + getParamCalcId() + "_Steps").attr('key');
        if (typeof ft_key != 'undefined') {
            var promise = new Promise((res, rej) => {
                var stepNode = $(".fancytree-structure").fancytree("getTree").getNodeByKey(ft_key)
                stepNode.removeChildren();
                stepNode.addChildren(step_params);
                stepNode.setExpanded();
                stepNode.render(true, true);
                res('');
            });
            promise.then(() => {
                updateFancyTreeGroup(getParamCalcGroupId(), getParamModelId(), '', { calc_id: getParamCalcId(), action: 'U' }, false);
            });
        }
    }
}

// Formatted ID
function formattedID(id) {
    id = $.trim(id);
    return id.replace(/\s/g, '_');
}

// Add datatable row
function addDataTableRow(selector, table_row, top = false) {
    var table = $(selector).DataTable();
    if (top) {
        table.row.addByPos(table_row, 1);
        table.row(0).data(TrToData(table_row)).node();
    } else {
        table.rows.add($(table_row)).draw(false);
    }
}

// Update datatable row
function updateDataTableRow(selector, old_row, new_row, rowclass = '') {
    var table = $(selector).DataTable();
    var index = table.row($(old_row)).index();
    var trDOM = table.row($(old_row)).data(TrToData(new_row)).node();
    $(trDOM).addClass(' ' + rowclass);
}

// Trtodata
function TrToData(row) {
    return $(row).find('td').map(function (i, el) {
        return el.innerHTML;
    }).get();
}

// Remove datatable row
function removeDataTableRow(selector, table_row) {
    var table = $(selector).DataTable();
    table.row($(table_row)).remove().draw(false);
}

// Update calc group detail local cache
function updateCalcGroupDetailLocalCache(action = '', response = []) {
    try {
        var data = {};
        var local_cache_data = getLocalStorage('calc_group_detail_local_cache');
        if (local_cache_data === null || local_cache_data === "") {
            var local_cache_data = [{
                CALC_GROUP_DATA: [],
                CALCULATION_DATA: [],
                VARIABLE_DATA: [],
                DOBJECT_DATA: []
            }];
        }
        if (action == 'CALC_GROUP_DATA') {
            data[getParamCalcGroupId()] = response;
            local_cache_data[0].CALC_GROUP_DATA = data;
        }
        else if (action == 'CALCULATION_DATA') {
            var calculationLists = [];
            if (typeof (response) !== 'undefined' && !$.isArray(response)) {
                calculationLists.push(response);
            } else {
                calculationLists = response;
            }
            data[getParamCalcGroupId()] = calculationLists;
            local_cache_data[0].CALCULATION_DATA = data;
        }
        else if (action == 'VARIABLE_DATA') {
            var variableLists = [];
            if (typeof (response) !== 'undefined' && !$.isArray(response)) {
                variableLists.push(response);
            } else {
                variableLists = response;
            }
            data[getParamCalcGroupId()] = variableLists;
            local_cache_data[0].VARIABLE_DATA = data;
        }
        else if (action == 'DOBJECT_DATA') {
            data[getParamCalcGroupId()] = response;
            local_cache_data[0].DOBJECT_DATA = data;
        }
        if (getLocalStorage('timemachine_datetime') === null) {
            setLocalStorage('CALCGROUP_REFRESH_TIME', getLastChangedDateTime());
        }
        setLocalStorage('calc_group_detail_local_cache', local_cache_data);
    } catch (error) {
        displayCatchError('calc-group-local-storage-error');
        return false;
    }
}

// Update calc detail local cache
function updateCalcDetailLocalCache(action = '', response = []) {
    try {
        if (response.length === 0 || action === '') { return false; }
        var data = {};
        var local_cache_data = getLocalStorage('calc_detail_local_cache');
        if (local_cache_data === null || local_cache_data === "") {
            var local_cache_data = [{
                CALCULATION_DATA: [],
                DRIVER_DATA: [],
                STEP_DATA: []
            }];
        }
        if (action == 'CALC_HEADER_DATA') {
            data[response.CalcId] = response;
            local_cache_data[0].CALC_HEADER_DATA = data;
        } else if (action == 'CALCULATION_DATA') {
            data[response.CalcId] = response;
            local_cache_data[0].CALCULATION_DATA = data;
        }
        else if (action == 'DRIVER_DATA') {
            var driverLists = [];
            if (typeof (response) !== 'undefined' && !$.isArray(response)) {
                driverLists.push(response);
            } else {
                driverLists = response;
            }
            data[driverLists[0].CalcId] = driverLists;
            local_cache_data[0].DRIVER_DATA = data;
        }
        else if (action == 'STEP_DATA') {
            var stepLists = [];
            if (typeof (response) !== 'undefined' && !$.isArray(response)) {
                stepLists.push(response);
            } else {
                stepLists = response;
            }
            data[stepLists[0].CalcId] = stepLists;
            local_cache_data[0].STEP_DATA = data;
        }
        if (getLocalStorage('timemachine_datetime') === null) {
            setLocalStorage('CALC_REFRESH_TIME', getLastChangedDateTime());
        }
        setLocalStorage('calc_detail_local_cache', local_cache_data);
    } catch (error) {
        displayCatchError('calc-local-storage-error');
        return false;
    }
}

// Get calc detail local cache
function getCalcDetailLocalCache(action = '', calc_id = '') {
    try {
        if (calc_id === '') { calc_id = getParamCalcId(); }
        var local_cache_data = getLocalStorage('calc_detail_local_cache');
        if (local_cache_data !== null && local_cache_data !== "") {
            if (local_cache_data.length > 0) {
                if (action == 'CALCULATION_DATA') {
                    return typeof local_cache_data[0].CALCULATION_DATA[calc_id] !== 'undefined' ? local_cache_data[0].CALCULATION_DATA[calc_id] : '';
                }
                else if (action == 'DRIVER_DATA') {
                    return typeof local_cache_data[0].DRIVER_DATA[calc_id] !== 'undefined' ? local_cache_data[0].DRIVER_DATA[calc_id] : '';
                }
                else if (action == 'STEP_DATA') {
                    return typeof local_cache_data[0].STEP_DATA[calc_id] !== 'undefined' ? local_cache_data[0].STEP_DATA[calc_id] : '';
                }
            }
        }
        return false;
    } catch (error) {
        displayCatchError('calc-local-storage-error');
        return false;
    }
}

// Get calc group detail local cache
function getCalcGroupDetailLocalCache(action = '', calcGroupId = '') {
    try {
        var response = false;
        if (calcGroupId === '') { calcGroupId = getParamCalcGroupId(); }
        var local_cache_data = getLocalStorage('calc_group_detail_local_cache');
        if (local_cache_data !== null && local_cache_data !== "") {
            if (local_cache_data.length > 0) {
                if (action == 'CALC_GROUP_DATA') {
                    response = local_cache_data[0].CALC_GROUP_DATA[calcGroupId] ? local_cache_data[0].CALC_GROUP_DATA[calcGroupId] : false;
                }
                else if (action == 'CALCULATION_DATA') {
                    response = local_cache_data[0].CALCULATION_DATA[calcGroupId] ? local_cache_data[0].CALCULATION_DATA[calcGroupId] : false;
                }
                else if (action == 'VARIABLE_DATA') {
                    response = local_cache_data[0].VARIABLE_DATA[calcGroupId] ? local_cache_data[0].VARIABLE_DATA[calcGroupId] : false;
                }
                else if (action == 'DOBJECT_DATA') {
                    response = local_cache_data[0].DOBJECT_DATA[calcGroupId] ? local_cache_data[0].DOBJECT_DATA[calcGroupId] : false;
                }
            }
        }
        return response;
    } catch (error) {
        displayCatchError('calc-group-local-storage-error');
        return false;
    }
}

// Webservice - dobjects read
function getWsDObjectsRBind(dobject_id = '%', async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarDobjectsR>
                <Env>`+ getConfig('environment') + `</Env>
                <Dsourceid>`+ dobject_id + `</Dsourceid>
                `+ getParamDateTimeLastChanged() + `
            </tns:ZdarDobjectsR>`;
    return callWebService(url, request, 'ZdarDobjectsRResponse', async, callback);
}

// Webservice - Dimensions read
function getWsDimensionRBind(model_id = '%', async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarDimension>
                        <Env>`+ getConfig('environment') + `</Env>
                        <Model>`+ model_id + `</Model>
                    </tns:ZdarDimension>`;
    return callWebService(url, request, 'ZdarDimensionResponse', async, callback);
}

// Webservice - Dimensions property read
function getWsDimPrBind(dimension_id = '%', async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarDimPr>
                    <Env>`+ getConfig('environment') + `</Env>
                    <Dimension>`+ dimension_id + `</Dimension>
                </tns:ZdarDimPr>`;
    return callWebService(url, request, 'ZdarDimPrResponse', async, callback);
}

// Webservice - CG calcs read
function getWsCgCalcsRBind(calc_group_id = '%', calc_id = '%', async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarCgCalcsR>
                        <Calcgroupid>`+ calc_group_id + `</Calcgroupid>
                        <Env>`+ getConfig('environment') + `</Env>
                        <Calcid>`+ calc_id + `</Calcid>
                        `+ getParamDateTimeLastChanged() + `
                    </tns:ZdarCgCalcsR>`;
    return callWebService(url, request, 'ZdarCgCalcsRResponse', async, callback);
}

// Webservice - Calc header read
function getWsCalcHdrRBind(calc_id = '%', async = false, callback) {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarCalcHdrR>
                    <Env>${getConfig('environment')}</Env>
                    <Calcid>${calc_id}</Calcid>
                    `+ getParamDateTimeLastChanged() + `
                </tns:ZdarCalcHdrR>`;
    return callWebService(url, request, 'ZdarCalcHdrRResponse', async, callback);
}

// Webservice - CG variable read
function getWsCgVarsRBind(calc_group_id = '%', variable_id = '%', async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarCgVarsR>
                        <Calcgroupid>`+ calc_group_id + `</Calcgroupid>
                        <Env>`+ getConfig('environment') + `</Env>
                        <Variableid>`+ variable_id + `</Variableid>
                        `+ getParamDateTimeLastChanged() + `
                    </tns:ZdarCgVarsR>`;
    return callWebService(url, request, 'ZdarCgVarsRResponse', async, callback);
}
/* Dobjects API*/
// Webservice - CG dobjects read
function getWsCgDObjectsRBind(model_id = '%', calc_group_id = '%', async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarCgDobjectsR>
                        <Calcgroupid>${(calc_group_id == 'unassigned') ? '%' : calc_group_id}</Calcgroupid>
                        <Env>`+ getConfig('environment') + `</Env>
                        <Model>`+ model_id + `</Model>
                        `+ getParamDateTimeLastChanged() + `
                    </tns:ZdarCgDobjectsR>`;
    return callWebService(url, request, 'ZdarCgDobjectsRResponse', async, callback);
}

// Webservice - help read
function getWsHelpRBind(app = '%', app_area = '%', app_item = '%', async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarHelpR>
                        <App>${app}</App>
                        <AppArea>${app_area}</AppArea>
                        <AppItem>${app_item}</AppItem>
                        <NoHtmlContent></NoHtmlContent>
                    </tns:ZdarHelpR>`;
    return callWebService(url, request, 'ZdarHelpRResponse', async, callback);
}

// Webservice - dobjects write
function WsCgDobjectsW(requestData, action = '', deleteData = '', updateLocal = true) {
    var datasource_write_url = getConfig('zdar_calc_engine_bind');
    var emptyItem = `<item>
                        <Environment></Environment>
                        <CalcGroupId></CalcGroupId>
                        <DobjectId></DobjectId>
                        <DobjectOrder></DobjectOrder>
                        <ScopeDims></ScopeDims>
                        <AggDims></AggDims>
                        <Criteria></Criteria>
                        <IndexDims></IndexDims>
                        <DateTimeLastChanged></DateTimeLastChanged>
                        <UserIdLastChange></UserIdLastChange>
                    </item>`;
    if (action === "M") {
        var request = `<tns:ZdarCgDobjectsW>
                        <Tdelete>
                            `+ emptyItem + `
                        </Tdelete>
                        <Tmodify>
                        `+ getDataSourceItemData(requestData) + `
                        </Tmodify>
                    </tns:ZdarCgDobjectsW>`;
        callWebService(datasource_write_url, request, 'ZdarCgDobjectsWResponse');
    } else if (action === "D") {
        var request = `<tns:ZdarCgDobjectsW>
                        <Tdelete>
                            `+ getDataSourceItemData(requestData) + `
                        </Tdelete>
                        <Tmodify>
                        `+ emptyItem + `
                        </Tmodify>
                    </tns:ZdarCgDobjectsW>`;
        callWebService(datasource_write_url, request, 'ZdarCgDobjectsWResponse');
    } else if (action === "U") {
        var deleteItem = getDataSourceItemData(deleteData);
        var modifyItem = getDataSourceItemData(requestData);
        if (modifyItem == '') {
            modifyItem = emptyItem;
        }
        if (deleteItem == '') {
            deleteItem = emptyItem;
        }
        var request = `<tns:ZdarCgDobjectsW>
                        <Tdelete>
                            `+ deleteItem + `
                        </Tdelete>
                        <Tmodify>
                            `+ modifyItem + `
                        </Tmodify>
                    </tns:ZdarCgDobjectsW>`;
        // return request;
        callWebService(datasource_write_url, request, 'ZdarCgDobjectsWResponse');
    }

    if (updateLocal) {
        var calc_group_id = getParamCalcGroupId();
        getWsCgDObjectsRBind('%', calc_group_id, true, updateCalcGroupDObjectsData);
    }
}

// Get datasource item data
function getDataSourceItemData(items) {
    var return_items = '';
    $.each(items, function (index, data) {
        return_items += `<item>
                            <Environment>${getConfig('environment')}</Environment>
                            <CalcGroupId>${data.CalcGroupId}</CalcGroupId>
                            <DobjectId>${data.DobjectId}</DobjectId>
                            <DobjectOrder>${data.DobjectOrder}</DobjectOrder>
                            <ScopeDims>${data.ScopeDims}</ScopeDims>
                            <AggDims>${data.AggDims}</AggDims>
                            <Criteria>${replaceSpecialCharacters(data.Criteria)}</Criteria>
                            <IndexDims>${data.IndexDims}</IndexDims>
                            <DateTimeLastChanged>${getLastChangedDateTime()}</DateTimeLastChanged>
                            <UserIdLastChange>${getCurrentUserName()}</UserIdLastChange>
                        </item>`;
    });
    return return_items;
}
// update calc group header data
function updateCalcGroupDObjectsData(response) {
    updateDObjectsLocalCacheData(response);
    updateCalcGroupDefaultValues();
}

// Update dobjects local cache data
function updateDObjectsLocalCacheData(response) {
    updateCalcGroupDetailLocalCache('DOBJECT_DATA', response);
}
/* End Dobjects API*/

// Webservice - User envac read
function getWsUserEnvacRBind(async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarUserEnvacR>
                    </tns:ZdarUserEnvacR>`;
    return callWebService(url, request, 'ZdarUserEnvacRResponse', async, callback);
}

// Webservice - user read
function getWsUserRBind(return_type = 'A', async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarUserR>
                        <Env>`+ getEnvironment() + `</Env>
                        <Returntype>`+ return_type + `</Returntype>
                    </tns:ZdarUserR>`;
    return callWebService(url, request, 'ZdarUserRResponse', async, callback);
}

// Webservice - Versions darce read
function getWsVersionsDarceRBind(async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarVersionsDarceR>
                </tns:ZdarVersionsDarceR>`;
    return callWebService(url, request, 'ZdarVersionsDarceRResponse', async, callback);
}

// Webservice - Spaces Read
function getWsSpacesRBind(space_id = '%', async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarSpacesR>
                        <Spacesid>${space_id}</Spacesid>
                    </tns:ZdarSpacesR>`;
    return callWebService(url, request, 'ZdarSpacesRResponse', async, callback);
}

// Webservice - Space Items Read
function getWsSpaceItemsRBind(space_item_id = '%', async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarSpaceItmsR>
                        <Spaceitemid>${space_item_id}</Spaceitemid>
                    </tns:ZdarSpaceItmsR>`;
    return callWebService(url, request, 'ZdarSpaceItmsRResponse', async, callback);
}

// Webservice - Page read
function getWsPageRBind(page_id = '%', async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarPagesR>
                        <Pagesid>${page_id}</Pagesid>
                    </tns:ZdarPagesR>`;
    return callWebService(url, request, 'ZdarPagesRResponse', async, callback);
}

// Webservice - Settings read
function getWsSettingsRBind(async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarSettingsR>
                        <AppArea>GENERAL</AppArea>
                        <AppSubArea>WEB</AppSubArea>
                        <Environment></Environment>
                        <Model></Model>
                        <Param>DRWN_SPACE_ITEM</Param>
                        <Value></Value>
                    </tns:ZdarSettingsR>`;
    return callWebService(url, request, 'ZdarSettingsRResponse', async, callback);
}

/* Calc group API*/
// Webservice - Calc group read
function getWsCalcGroupRBind(model_id = '%', calc_group_id = '%', async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarCalcGrpR>
                        <Calcgroupid>`+ calc_group_id + `</Calcgroupid>
                        <Env>`+ getEnvironment() + `</Env>
                        <Model>`+ model_id + `</Model>
                        `+ getParamDateTimeLastChanged() + `
                        <Page>assets/js/common/common.js</Page>
                    </tns:ZdarCalcGrpR>`;
    var response = callWebService(url, request, 'ZdarCalcGrpRResponse', async, callback);
    if (model_id == '%' && calc_group_id == '%') {
        overallCalcGroupListLocalCache(response);
    }
    return response;
}

// Overall calc group list local cache
function overallCalcGroupListLocalCache(response, isLoad = false) {
    try {
        if (typeof (response) !== 'undefined' && response != null && response != '') {
            var resLists = [];
            if (typeof (response) !== 'undefined' && !$.isArray(response)) {
                resLists.push(response);
            } else {
                resLists = response;
            }
            response = resLists;
            response = response.sort(function (a, b) {
                if (a.CalcGroupId > b.CalcGroupId) return 1;
                if (a.CalcGroupId < b.CalcGroupId) return -1;
            });
            if (getLocalStorage('timemachine_datetime') === null) {
                setLocalStorage('MODEL_REFRESH_TIME', getLastChangedDateTime());
            }
            setIndexedDBStorage('overall_calc_group_list', response);
            if (isLoad) {
                loadSideBarCalcGroupList();
            }
        } else {
            response = null;
        }
    } catch (error) {
        displayCatchError('calc-group-list');
        return false;
    }
}

// Webservice - Convert environment 
function WsConvEnvironmentBind(requestData, async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = getCopyConvertItemData(requestData);
    var response = genericAjaxXMLPostSync(getURL(url), request);
    var jsonData = xmlToJson(response);
    var returnCode = jsonData["soap-env:Envelope"]["soap-env:Body"]["n0:ZdarConvEnvironmentResponse"]["ReturnCode"];
    var logId = jsonData["soap-env:Envelope"]["soap-env:Body"]["n0:ZdarConvEnvironmentResponse"]["LogId"];
    return returnCode;
}

// Webservice - Copy environment 
function WsCopyEnvironmentBind(requestData) {
    var url = getConfig('zdar_calc_engine_bind');
    var request = getCopyConfigItemData(requestData);
    var response = genericAjaxXMLPostSync(getURL(url), request);
    var jsonData = xmlToJson(response);
    var returnCode = jsonData["soap-env:Envelope"]["soap-env:Body"]["n0:ZdarCopyEnvironmentResponse"]["ReturnCode"];
    var logId = jsonData["soap-env:Envelope"]["soap-env:Body"]["n0:ZdarCopyEnvironmentResponse"]["LogId"];
    return returnCode;
}

// Webservice - Delete environment 
function WsDeleteEnvironmentBind(requestData) {
    var url = getConfig('zdar_calc_engine_bind');
    var request = getDeleteConfigItemData(requestData);
    var response = genericAjaxXMLPostSync(getURL(url), request);
    var jsonData = xmlToJson(response);
    var returnCode = jsonData["soap-env:Envelope"]["soap-env:Body"]["n0:ZdarCopyEnvironmentResponse"]["ReturnCode"];
    return returnCode;
}

// Webservice - Calc group copy
function WsCalcGrpC(requestData, return_response = false) {
    var url = getConfig('zdar_calc_engine_bind');
    var request = getCGOverviewRenameCopyItemData(requestData);
    var response = callWebService(url, request, 'ZdarCalcGrpCResponse');
    if (response && return_response) {
        return getWsCalcGroupRBind(requestData.Model, requestData.Tocalcgroupid);
    }
    return response;
}

// Webservice - Calc Group delete
function WsCalcGrpD(item) {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarCalcGrpW>
                    <Tdelete>`+ getCGOverviewDeleteItemData(item) + `</Tdelete>
                <Tmodify>
                        <item>
                            <Environment></Environment>
                            <CalcGroupId></CalcGroupId>
                            <CalcGroupDescr></CalcGroupDescr>
                            <PreRunScopeAdj></PreRunScopeAdj>
                            <PostRunScopeAdj></PostRunScopeAdj>
                            <RunCriteria></RunCriteria>
                            <DateTimeLastChanged></DateTimeLastChanged>
                            <UserIdLastChange></UserIdLastChange>
                            <PrimaryDobjectId></PrimaryDobjectId>
                        </item>
                </Tmodify>
                </tns:ZdarCalcGrpW>`;
    return callWebService(url, request, 'ZdarCalcGrpWResponse');
}

// Webservice - Calc Group write
function WsCalcGrpW(requestData, updateLocal = false) {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarCalcGrpW>
                        <Tdelete>
                            <item>
                                <Environment></Environment>
                                <CalcGroupId></CalcGroupId>
                                <CalcGroupDescr></CalcGroupDescr>
                                <PreRunScopeAdj></PreRunScopeAdj>
                                <PostRunScopeAdj></PostRunScopeAdj>
                                <RunCriteria></RunCriteria>
                                <DateTimeLastChanged></DateTimeLastChanged>
                                <UserIdLastChange></UserIdLastChange>
                                <PrimaryDobjectId></PrimaryDobjectId>
                            </item>
                    </Tdelete>
                    <Tmodify>`+ getCalcGroupItemData(requestData) + `</Tmodify>
                    </tns:ZdarCalcGrpW>`;
    var response = callWebService(url, request, 'ZdarCalcGrpWResponse');
    if (updateLocal) {
        getWsCalcGroupRBind(getParamModelId(), getParamCalcGroupId(), true, updateCalcGroupLocalCacheData);
    }
    return response;
}

// Update overall calc group list
async function updateOverAllCalcGroupList(response) {
    try {
        var resLists = [];
        if (typeof (response) !== 'undefined' && !$.isArray(response)) {
            resLists.push(response);
        } else {
            resLists = response;
        }
        response = resLists;
        var endLoop = true;
        while (endLoop) {
            var overall_calc_group_list = await getIndexedDBStorage('overall_calc_group_list');
            if (Array.isArray(overall_calc_group_list)) {
                var overall_calc_group_list_check = overall_calc_group_list.map(function (item) {
                    if (item.hasOwnProperty('CalcGroupId')) {
                        return item;
                    }
                });
                if (Array.isArray(overall_calc_group_list_check)) { endLoop = false; }
            }
        }
        var filtered_data = overall_calc_group_list.filter(function (model) {
            return model.PrimaryDobjectId !== getParamModelId();
        });
        $.extend(filtered_data, response);
        overallCalcGroupListLocalCache(filtered_data, true);
    } catch (error) {
        displayCatchError('calc-group-list');
        return false;
    }
}

// Get CG overview delete item data
function getCGOverviewDeleteItemData(item) {
    var return_items = '';
    return_items = `<item>
                        <Environment>${getEnvironment()}</Environment>
                        <CalcGroupId>${item.CalcGroupId}</CalcGroupId>
                        <PrimaryDobjectId>${item.PrimaryDobjectId}</PrimaryDobjectId>
                        <Page>${item.Page}</Page>
                    </item>`;
    return return_items;
}

// Get CG overview rename copy item data
function getCGOverviewRenameCopyItemData(item) {
    return `<tns:ZdarCalcGrpC>
                <Action>${item.Action}</Action>
                <Env>${getEnvironment()}</Env>
                <Fromcalcgroupid>${item.Fromcalcgroupid}</Fromcalcgroupid>
                <Model>${item.Model}</Model>
                <Tocalcgroupid>${item.Tocalcgroupid}</Tocalcgroupid>
            </tns:ZdarCalcGrpC>`;
}
/* End Calc group API*/
// Webservice - CG variable copy
function WsCgVarsC(requestData) {
    var url = getConfig('zdar_calc_engine_bind');
    var response = callWebService(url, requestData, 'ZdarCgVarsCResponse');

    if (response) {
        getWsCgVarsRBind(getParamCalcGroupId(), '%', true, updateCalcGroupVariables);
        return true;
    }
    return false;
}

// Webservice - Calc Header copy
function WsCalcHdrC(requestData, updateLocal = true) {
    var url = getConfig('zdar_calc_engine_bind');
    var request = getCalculationCopyItemData(requestData);
    var response = callWebService(url, request, 'ZdarCalcHdrCResponse');

    if (updateLocal) {
        var calc_group_id = getParamCalcGroupId();
        getWsCgCalcsRBind(calc_group_id, '%', true, updateCalculationsLocalCacheData);
    }

    if (response) {
        return true;
    }
    return false;
}

// Webservice - CG variable write
function WsCgVarsW(requestData, action = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var emtpyItem = `<item>
                <Environment></Environment>
                <CalcGroupId></CalcGroupId>
                <VariableId></VariableId>
                <VariableType></VariableType>
                <Dimension></Dimension>
                <Property></Property>
                <VariableFilter></VariableFilter>
                <DateTimeLastChanged></DateTimeLastChanged>
                <UserIdLastChange></UserIdLastChange>
            </item>`;
    if (action == 'M') {
        var request = `<tns:ZdarCgVarsW>
                        <Tdelete>
                            `+ emtpyItem + `
                        </Tdelete>
                        <Tmodify>`+ requestData + `</Tmodify>
                        </tns:ZdarCgVarsW>`;
    } else if (action === "D") {
        var request = `<tns:ZdarCgVarsW>
                        <Tdelete>
                            `+ requestData + `
                        </Tdelete>
                        <Tmodify>`+ emtpyItem + `</Tmodify>
                        </tns:ZdarCgVarsW>`;
    }
    var response = callWebService(url, request, 'ZdarCgVarsWResponse');
    if (response) {
        getWsCgVarsRBind(getParamCalcGroupId(), '%', true, updateCalcGroupVariables);
        return true;
    }
    return false;
}
// Update variables on calc group
function updateCalcGroupVariables(response) {
    updateCalcGroupVariablesData(response, false);
}

// Update variables local cache data
function updateVariablesLocalCacheData(response) {
    updateCalcGroupDetailLocalCache('VARIABLE_DATA', response);
}

// Get variable modify item data
function getVariableModifyItemData(data) {
    return `<item>		                            
            <Environment>${getConfig('environment')}</Environment>
            <CalcGroupId>${getParamCalcGroupId()}</CalcGroupId>
            <VariableId>${data.VariableId}</VariableId>
            <VariableType>${(typeof (data.VariableType) !== 'undefined') ? data.VariableType : ''}</VariableType>
            <Dimension>${(typeof (data.Dimension) !== 'undefined') ? data.Dimension : ''}</Dimension>
            <Property>${(typeof (data.Property) !== 'undefined') ? data.Property : ''}</Property>
            <VariableFilter>${(typeof (data.VariableFilter) !== 'undefined') ? replaceSpecialCharacters(data.VariableFilter) : ''}</VariableFilter>
            <DateTimeLastChanged>${getLastChangedDateTime()}</DateTimeLastChanged>
            <UserIdLastChange>${getCurrentUserName()}</UserIdLastChange>
            <Page>assets/js/common/common.js</Page>
        </item>`;
}

// Get calculation copy item data
function getCalculationCopyItemData(data) {
    var item_data = `<tns:ZdarCalcHdrC>
        <Action>${data.Action}</Action>
        <Calcgroupid>${getParamCalcGroupId()}</Calcgroupid>
        <Env>${getConfig('environment')}</Env>
        <Fromcalcid>${data.Fromcalcid}</Fromcalcid>
        <Tocalcid>${data.Tocalcid}</Tocalcid>`;
    if (typeof (data.Calcorder) !== 'undefined') {
        item_data += `<Calcorder>${data.Calcorder}</Calcorder>`;
    }
    item_data += `<Page>assets/js/common/common.js</Page></tns:ZdarCalcHdrC>`;
    return item_data;
}

// Get variable copy item data
function getVariableCopyItemData(data) {
    return `<tns:ZdarCgVarsC>
            <Action>${data.Action}</Action>
            <Env>${getConfig('environment')}</Env>
            <Calcgroupid>${getParamCalcGroupId()}</Calcgroupid>
            <Fromvariableid>${data.Fromvariableid}</Fromvariableid>
            <Tovariableid>${data.Tovariableid}</Tovariableid>
            <Page>assets/js/common/common.js</Page>
        </tns:ZdarCgVarsC>`;
}

// Update calc grop local cache data
function updateCalcGroupLocalCacheData(response) {
    updateCalcGroupDetailLocalCache('CALC_GROUP_DATA', response);
    updateCalcGroupDefaultValues(true, true, false);
}

// Get calc group item data
function getCalcGroupItemData(data) {
    return `<item>
            <Environment>${getEnvironment()}</Environment>
            <CalcGroupId>${data.CalcGroupId}</CalcGroupId>
            <CalcGroupDescr>${replaceSpecialCharacters(data.CalcGroupDescr)}</CalcGroupDescr>
            <PreRunScopeAdj>${replaceSpecialCharacters(data.PreRunScopeAdj)}</PreRunScopeAdj>
            <PostRunScopeAdj>${replaceSpecialCharacters(data.PostRunScopeAdj)}</PostRunScopeAdj>
            <RunCriteria>${replaceSpecialCharacters(data.RunCriteria)}</RunCriteria>
            <DateTimeLastChanged>${getLastChangedDateTime()}</DateTimeLastChanged>
            <UserIdLastChange>${getCurrentUserName()}</UserIdLastChange>
            <PrimaryDobjectId>${data.PrimaryDobjectId}</PrimaryDobjectId>
            <Page>assets/js/common/common.js</Page>
        </item>`;
}

// Get calculation modify item data
function getCalculationModifyItemData(items, action = 'M') {
    var return_items = '';
    if (action == 'M') {
        $.each(items, function (index, data) {
            return_items += `<item>
                    <Environment>${getConfig('environment')}</Environment>
                    <CalcGroupId>${getParamCalcGroupId()}</CalcGroupId>
                    <CalcId>${data.CalcId}</CalcId>
                    <CalcInstance>${(typeof (data.CalcInstance) !== 'undefined') ? data.CalcInstance : ''}</CalcInstance>
                    <CalcOrder>${(typeof (data.CalcOrder) !== 'undefined') ? data.CalcOrder : ''}</CalcOrder>
                    <Enabled>${(typeof (data.Enabled) !== 'undefined') ? data.Enabled : ''}</Enabled>
                    <DateTimeLastChanged>${getLastChangedDateTime()}</DateTimeLastChanged>
                    <UserIdLastChange>${getCurrentUserName()}</UserIdLastChange>
                    <Page>assets/js/common/common.js</Page>
                </item>`;
        });
    } else if (action == 'R') {
        $.each(items, function (index, data) {
            return_items += `<item>
                    <Environment>${getConfig('environment')}</Environment>
                    <CalcGroupId>${getParamCalcGroupId()}</CalcGroupId>
                    <CalcId>${data.CalcId}</CalcId>
                    <CalcInstance>${(typeof (data.CalcInstance) !== 'undefined') ? data.CalcInstance : ''}</CalcInstance>
                    <CalcOrder>${(typeof (data.CalcOrder) !== 'undefined') ? data.Property : ''}</CalcOrder>
                    <Enabled>${(typeof (data.Enabled) !== 'undefined') ? data.Property : ''}</Enabled>
                    <DateTimeLastChanged>${getLastChangedDateTime()}</DateTimeLastChanged>
                    <UserIdLastChange>${getConfig('logged_user')}</UserIdLastChange>
                    <Page>assets/js/common/common.js</Page>
                </item>`;
        });
    } else if (action == 'D') {
        $.each(items, function (index, data) {
            return_items += `<item>
                    <Environment>${getConfig('environment')}</Environment>
                    <CalcGroupId>%</CalcGroupId>
                    <CalcId>${data.CalcId}</CalcId>
                    <CalcInstance>${(typeof (data.CalcInstance) !== 'undefined') ? data.CalcInstance : ''}</CalcInstance>
                    <CalcOrder>${(typeof (data.CalcOrder) !== 'undefined') ? data.Property : ''}</CalcOrder>
                    <Enabled>${(typeof (data.Enabled) !== 'undefined') ? data.Property : ''}</Enabled>
                    <DateTimeLastChanged>${getLastChangedDateTime()}</DateTimeLastChanged>
                    <UserIdLastChange>${getConfig('logged_user')}</UserIdLastChange>
                    <Page>assets/js/common/common.js</Page>
                </item>`;
        });
    }
    return return_items;
}

// Get calculation header modify item data
function getCalculationHeaderModifyItemData(data) {
    return `<item>
            <Environment>${getConfig('environment')}</Environment>
            <CalcId>${data.CalcId}</CalcId>
            <CalcDescr>${(typeof (data.CalcDescr) !== 'undefined') ? replaceSpecialCharacters(data.CalcDescr) : ''}</CalcDescr>
            <SourceId>${data.SourceId}</SourceId>
            <TargetId>${data.TargetId}</TargetId>
            <CalcDataAlias>${(typeof (data.CalcDataAlias) !== 'undefined') ? data.CalcDataAlias : ''}</CalcDataAlias>
            <CalcDataFilter>${replaceSpecialCharacters(data.CalcDataFilter)}</CalcDataFilter>
            <AggregateDims>${(typeof (data.AggregateDims) !== 'undefined') ? data.AggregateDims : ''}</AggregateDims>
            <CalcYtd>${(typeof (data.CalcYtd) !== 'undefined') ? data.CalcYtd : ''}</CalcYtd>
            <RemDataFromMini>${(typeof (data.RemDataFromMini) !== 'undefined') ? data.RemDataFromMini : ''}</RemDataFromMini>
            <Enabled>${data.Enabled}</Enabled>
            <DateTimeLastChanged>${getLastChangedDateTime()}</DateTimeLastChanged>
            <UserIdLastChange>${getCurrentUserName()}</UserIdLastChange>
            <Page>assets/js/common/common.js</Page>
        </item>`;
}

// Webservice - CG calculation write
function WsCgCalcsW(requestData, action = '', updateLocal = true) {
    var calcs_write_url = getConfig('zdar_calc_engine_bind');
    var emptyItem = `<item>
                        <Environment></Environment>
                        <CalcGroupId></CalcGroupId>
                        <CalcId></CalcId>
                        <CalcInstance></CalcInstance>
                        <CalcOrder></CalcOrder>
                        <Enabled></Enabled>
                        <DateTimeLastChanged></DateTimeLastChanged>
                        <UserIdLastChange></UserIdLastChange>
                    </item>`;
    if (action == 'M') {
        var request = `<tns:ZdarCgCalcsW>
            <Tdelete>`+ emptyItem + `</Tdelete>
            <Tmodify>                
                    `+ getCalculationModifyItemData(requestData, 'M') + `                
            </Tmodify>
        </tns:ZdarCgCalcsW>`;
        callWebService(calcs_write_url, request, 'ZdarCgCalcsWResponse');
    } else if (action === "R") {
        var request = `<tns:ZdarCgCalcsW>
            <Tdelete>`+ getCalculationModifyItemData(requestData, 'R') + `</Tdelete>
            <Tmodify>
                    `+ emptyItem + `
            </Tmodify>
        </tns:ZdarCgCalcsW>`;
        callWebService(calcs_write_url, request, 'ZdarCgCalcsWResponse');
    } else if (action === "D") {
        var request = `<tns:ZdarCgCalcsW>
            <Tdelete>`+ getCalculationModifyItemData(requestData, 'D') + `</Tdelete>
            <Tmodify>
                    `+ emptyItem + `
            </Tmodify>
        </tns:ZdarCgCalcsW>`;
        callWebService(calcs_write_url, request, 'ZdarCgCalcsWResponse');
    }

    if (updateLocal) {
        var calc_group_id = getParamCalcGroupId();
        getWsCgCalcsRBind(calc_group_id, '%', true, updateCalculationsLocalCacheData);
    }
}

// Update calculations local cache data
function updateGroupCalculationsLocalCacheData(response) {
    updateCalcGroupDetailLocalCache('CALCULATION_DATA', response);
}

// Update calculations local cache data
function updateCalculationsLocalCacheData(response) {
    updateCalcGroupDetailLocalCache('CALCULATION_DATA', response);
    getCalcGroupCalculationsData(getParamCalcGroupId());
    loadSideBarCalcList(getParamCalcGroupId());
}

// Webservice - Calc Header Write
function WsCalcHdrW(requestData, action = "M") {
    var url = getConfig('zdar_calc_engine_bind');
    var request_items = getCalculationHeaderModifyItemData(requestData);
    var emptyItem = ` <item>
                        <Environment></Environment>
                        <CalcId></CalcId>
                        <CalcDescr></CalcDescr>
                        <SourceId></SourceId>
                        <TargetId></TargetId>
                        <CalcDataAlias></CalcDataAlias>
                        <CalcDataFilter></CalcDataFilter>
                        <AggregateDims></AggregateDims>
                        <CalcYtd></CalcYtd>
                        <RemDataFromMini></RemDataFromMini>
                        <Enabled></Enabled>
                        <DateTimeLastChanged></DateTimeLastChanged>
                        <UserIdLastChange></UserIdLastChange>			                            
                    </item>`;
    if (action === "M") {
        var request = `<tns:ZdarCalcHdrW>
                          <Tdelete>`+ emptyItem + `</Tdelete>
                          <Tmodify>`+ request_items + `</Tmodify>
                        </tns:ZdarCalcHdrW>`;
    } else if (action === "D") {
        var request = `<tns:ZdarCalcHdrW>
                          <Tdelete>`+ request_items + `</Tdelete>
                          <Tmodify>`+ emptyItem + `</Tmodify>
                        </tns:ZdarCalcHdrW>`;
    }
    return callWebService(url, request, 'ZdarCalcHdrWResponse');
}

// Initiailize Select2 
function initializeSelect2(selector = '', action = '') {
    if (!selector) { return; }
    $(selector).select2(action);
}

// Initialize Modal
function initializeModal(selector = '', action = 'show', backdrop = true, keyboard = true) {
    if (!selector) { return; }
    if (action == 'show') {
        action = { backdrop: backdrop, keyboard: keyboard }
    } else {
        action = 'hide';
    }
    $(selector).modal(action);
}

// Get calc group lists
async function getCalcGroupLists(refresh = false, modelId = '') {
    try {
        var response = await getIndexedDBStorage('overall_calc_group_list');
        if (response === null || refresh || response === '') {
            response = getWsCalcGroupRBind('%', '%');
            var resLists = [];
            if (typeof (response) !== 'undefined' && !$.isArray(response)) {
                resLists.push(response);
            } else {
                resLists = response;
            }
            response = resLists;
        }
        if (modelId != '' && response !== null && response) {
            response = response.filter(obj => obj.PrimaryDobjectId == modelId);
        }
        return response;
    } catch (error) {
        displayCatchError('calc-group-list');
        return false;
    }
}

// Load calc group lists to debugger script modal
async function loadCalcGroupListstoDebuggerScriptModal(selector = '#debugger-calc-group-lists') {
    try {
        var response = await getCalcGroupLists();
        var option = '';
        $.each(response, function (i, item) {
            option += `<option attr-model="${item.PrimaryDobjectId}" value="${item.CalcGroupId}">${item.CalcGroupId}</option>`;
        });
        $(selector).html(option);
    } catch (error) {
        displayCatchError('calc-group-list');
        return false;
    }
}

// Load data objects to debugger script modal
function loadDataObjectstoDebuggerScriptModal(response) {
    try {
        var data_sources = [];
        var dimensions_form_group_data = ``;
        if (typeof (response) !== 'undefined' && !$.isArray(response)) {
            data_sources.push(response);
        } else {
            data_sources = response;
        }
        $('.debugger-dimensions-section .form-group').remove();
        if (typeof (data_sources) !== 'undefined') {
            if (data_sources[0].ScopeDims != "") {
                var scopeDims = data_sources[0].ScopeDims.split(',');
                $.each(scopeDims, function (i, val) {
                    var env_id = getEnvironment();
                    var dimension_id = $.trim(val);
                    var datalist = `<datalist id="datalist_${dimension_id}">`;
                    var script_builder_cache = getLocalStorage('script_builder_cache', false);
                    if (env_id && script_builder_cache !== null && script_builder_cache !== '') {
                        var local_datas = script_builder_cache.filter(obj => obj.env == env_id && obj.dimension_id == dimension_id);
                        $.each(local_datas, function (i, item) {
                            datalist += `<option value="${item.dimension_value}">`;
                        });
                    }
                    datalist += '</datalist>';
                    dimensions_form_group_data += `
                        <div class="form-group debugger-form-group">
                            <label for="" class="control-label col-xs-4">${dimension_id}</label>
                            <div class="col-xs-8 debugger-local-datalist">
                                <input type="hidden" class="debugger-dimensions-ids" value="${dimension_id}">
                                <input type="text" list="datalist_${dimension_id}" class="form-control debugger-dimensions-values" placeholder="Enter dimension members here...">
                                ${datalist}
                            </div>
                        </div>
                    `;
                });
                $('.debugger-dimensions-section').html(dimensions_form_group_data);
            }
            $('#run-calc-group-modal-form').find('#debugger-calc-group-lists').val(response.CalcGroupId);
        }
        initializeSelect2('#debugger-calc-group-lists', {
            tags: true,
            sorter: function (data) {
                return data.sort(function (a, b) {
                    return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
                });
            }
        });
        var model_id = $('#param-debugger-model').val();
        $('#run-calc-group-modal').modal('show');
        $('#run-calc-group-modal').find('.styled').uniform();
        var showSqlQuery = $('#run-calc-group-modal-form').find('input[name=showSqlQueryDebugger]').prop('checked', false);
        var outputTemporaryData = $('#run-calc-group-modal-form').find('input[name=outputTemporaryDataDebugger]').prop('checked', false);
        $.uniform.update(showSqlQuery);
        $.uniform.update(outputTemporaryData);
        addDimentionsSectionToDebuggerRunModal(model_id);
    } catch (error) {
        displayCatchError('dimension-list');
        return false;
    }
}

// Run debugger script modal
async function runDebuggerScriptModal(model_id = '', calc_group_id = '') {
    try {
        await loadCalcGroupListstoDebuggerScriptModal();
        $('#run-calc-group-modal-form').find('#debugger-calc-group-lists').val(calc_group_id);
        initializeSelect2('#debugger-calc-group-lists', {
            tags: true
        });
        if (model_id !== '') {
            $('#param-debugger-script-page').remove();
            $('#param-debugger-model').val(model_id);
            getWsCgDObjectsRBind(model_id, calc_group_id, true, loadDataObjectstoDebuggerScriptModal);
        } else {
            $('.debugger-dimensions-section').html('<input type="hidden" value="1" id="param-debugger-script-page">');
            loadDataObjectstoDebuggerScriptModal();
        }
    } catch (error) {
        displayCatchError('calc-group-list');
        return false;
    }
}

// Add dimensions section to debugger run modal
async function addDimentionsSectionToDebuggerRunModal(model_id = '') {
    try {
        var dimensions_form_group_data = `
            <div class="form-group debugger-form-group">
                <div class="col-xs-4">
                    <select class="form-control dimension-list debugger-dimensions-ids" data-model="${model_id}" data-placeholder="Add an dimension..."></select>
                </div>
                <div class="col-xs-8 debugger-local-datalist">
                    <input type="text" class="form-control debugger-dimensions-values" placeholder="Enter dimension members here...">
                </div>
            </div>
        `;
        $('.debugger-dimensions-section').append(dimensions_form_group_data);
        await listDimensions(model_id, '#run-calc-group-modal .form-group:last-child .dimension-list', true, false);
        var dimensions_ids = $(".debugger-dimensions-ids").map(function () { return $(this).val(); }).get();
        $.each(dimensions_ids, function (i, val) {
            if ($.trim(val) != "") {
                var option_val = $('#run-calc-group-modal .form-group:last-child .dimension-list option[value=' + val + ']');
                if (option_val.length > 0) {
                    option_val.remove();
                }
            }
        });
        sortAscDropdownList('#run-calc-group-modal .form-group:last-child .dimension-list');
        initializeSelect2('#run-calc-group-modal .form-group:last-child .dimension-list');
    } catch (error) {
        displayCatchError('dimension-list');
        return false;
    }
}

// Run debugger script from calc group builder
function runDebuggerScriptFromCalcGroupBuilder() {
    var debugger_query = ``;
    try {
        var calc_group_ids = $('#run-calc-group-modal-form').find('#debugger-calc-group-lists').val();
        var script_builder_cache = (getLocalStorage('script_builder_cache', false) === null) ? [] : getLocalStorage('script_builder_cache', false);
        var script_builder_cache_limit = 5;
        var sql_query_debugger = ($('#run-calc-group-modal-form').find('input[name=showSqlQueryDebugger]').is(':checked')) ? 'Y' : 'N';
        var output_temporary_data = ($('#run-calc-group-modal-form').find('input[name=outputTemporaryDataDebugger]').is(':checked')) ? 'Y' : 'N';
        $('.debugger-dimensions-section .debugger-form-group').each(function (i, val) {
            var dimension_id = $.trim($(this).find('.debugger-dimensions-ids').val());
            var dimension_value = $.trim($(this).find('.debugger-dimensions-values').val());
            if (dimension_id && dimension_value) {
                debugger_query += `*XDIM_MEMBERSET ${dimension_id} = ${dimension_value}\n`;
                if (env_id = getEnvironment()) {
                    is_exist = script_builder_cache.filter(obj => obj.env == env_id && obj.dimension_id == dimension_id && obj.dimension_value == dimension_value);
                    if (is_exist.length === 0) {
                        total_arr = script_builder_cache.filter(obj => obj.env != env_id || obj.dimension_id != dimension_id);
                        filtered_arr = script_builder_cache.filter(obj => obj.env == env_id && obj.dimension_id == dimension_id);
                        if (filtered_arr.length >= script_builder_cache_limit) { filtered_arr.shift(); }
                        var script_builder = {
                            env: env_id,
                            dimension_id: dimension_id,
                            dimension_value: dimension_value
                        }
                        filtered_arr.push(script_builder);
                        script_builder_cache = $.merge(total_arr, filtered_arr);
                    }
                }
            }
        });
        setLocalStorage('script_builder_cache', script_builder_cache, false)
        // debugger_query += `\n`;
        debugger_query += `*START_BADI DARCE\n`;
        debugger_query += `QUERY = OFF\n`;
        debugger_query += `WRITE = ON\n`;
        if (calc_group_ids !== "" && calc_group_ids !== null) {
            debugger_query += `CALC_GROUP_ID = ${calc_group_ids}\n`;
        } else {
            debugger_query += `CALC_GROUP_ID = \n`;
        }
        // debugger_query += `DEBUG_Y_N = N\n`;
        // debugger_query += `LARGE_DATASET_Y_N = Y\n`;
        // debugger_query += `DARCE_DIRECT_WRITE_Y_N = Y\n`;
        // debugger_query += `OUTPUT_TEMP_DATA_Y_N = ${output_temporary_data}\n`;
        // debugger_query += `SHOW_SQL_Y_N = ${sql_query_debugger}\n`;
        debugger_query += `*END_BADI`;

        $('#param-debugger-query').val(escape(JSON.stringify(debugger_query)));
        $('#run-calc-group-modal').modal('hide');

        if (output_temporary_data == 'Y') {
            $.uniform.update($(".debugger-temporary-data").prop("checked", true));
        }

        if (sql_query_debugger == 'Y') {
            $.uniform.update($(".debugger-sql-queries").prop("checked", true));
        }

        if ($('#param-debugger-script-page').val() == 1) {
            loadDebuggerScript();
        } else {
            $("#drwn_pg_1008_100012").remove();
            drwn_sidebar_item_click('1008_130');
        }
    } catch (error) {
        displayCatchError('dimension-list');
        return false;
    }
}

function loadDebuggerScript() {
    try {
        if (typeof ($('#param-debugger-query').val()) !== 'undefined' && $.trim($('#param-debugger-query').val()) != "") {
            var debugger_query = JSON.parse(unescape($('#param-debugger-query').val()));
            var debugger_model_id = $('#param-debugger-model').val();
            $('#script').val(debugger_query);
            $('#script-default').val(debugger_query);
            if (typeof (debugger_model_id) !== 'undefined' && debugger_model_id !== '') {
                $('#debugger-model-field').val(debugger_model_id);
                $('#debugger-model-field').select2();
            }
            $('#param-debugger-query').val(null);
            $('#param-debugger-model').val(null);
            $('#script').trigger('keyup');
        }
    } catch (error) {
        displayCatchError('debugger-query-error');
        return false;
    }
}

function getDebuggerDefaultParameterValues(filter_input_name = '') {
    switch (filter_input_name) {
        case "QUERY":
            filter_input_value = 'OFF'; //default value
            break;
        case "WRITE":
            filter_input_value = 'ON'; //default value
            break;
        case "OUTPUT_TEMP_DATA_Y_N":
            filter_input_value = 'N'; //default value
            break;
        case "SHOW_SQL_Y_N":
            filter_input_value = 'N'; //default value
            break;
        case "CHECK_LOCKS_Y_N":
            filter_input_value = 'Y'; //default value
            break;
        case "CHECK_SECURITY_Y_N":
            filter_input_value = 'N'; //default value
            break;
        case "DARCE_DIRECT_WRITE_Y_N":
            filter_input_value = 'N'; //default value
            break;
        case "DEBUG_Y_N":
            filter_input_value = 'N'; //default value
            break;
        case "DROP_ORPHANED_TEMP_TABLES_Y_N":
            filter_input_value = 'N'; //default value
            break;
        case "EXECUTE_SQL_Y_N":
            filter_input_value = 'Y'; //default value
            break;
        case "KEEP_TEMP_TABLE_DATA_Y_N":
            filter_input_value = 'N'; //default value
            break;
        case "LARGE_DATASET_Y_N":
            filter_input_value = 'Y'; //default value
            break;
        case "LOG_LEVEL":
            filter_input_value = 'SUMMARY'; //default value
            break;
        case "OUTPUT_SNAP_TO_LOG_Y_N":
            filter_input_value = 'Y'; //default value
            break;
        case "SNAPSHOT_PCT":
            filter_input_value = '50'; //default value
            break;
        case "SNAPSHOT_THRESHOLD":
            filter_input_value = '5000'; //default value
            break;
        case "SUPPRESS_ROW_COUNTS_Y_N":
            filter_input_value = 'N'; //default value
            break;
        default:
            filter_input_value = ''; //default value
            break;
    }
    return filter_input_value;
}

function confirmDeletionDialog(message = '', callback = '', response = '', title = '') {
    $("#dialog-confirm-deletion").removeClass('hide');
    $("#dialog-confirm-deletion").html(message);
    if (!title) {
        title = 'Confirm delete action';
    }
    $("#dialog-confirm-deletion").dialog({
        title: title,
        resizable: false,
        height: "auto",
        width: 550,
        modal: true,
        buttons: {
            "Yes": function () {
                callback(response);
                $("#dialog-confirm-deletion").addClass('hide');
                $(this).dialog("close");
            },
            "No": function () {
                $("#dialog-confirm-deletion").addClass('hide');
                $(this).dialog("close");
            }
        }
    });
}

function confirmCalcEditDialog(message = '', callback = '', response = '') {
    $("#dialog-confirm-calcedit").removeClass('hide');
    if (message != '') {
        $("#dialog-confirm-calcedit").html(message);
    }
    $("#dialog-confirm-calcedit").dialog({
        resizable: false,
        height: "auto",
        width: 550,
        modal: true,
        buttons: {
            "OK": function () {
                $(this).dialog("close");
            }
        }
    });
}

// Confirm delete calc group
function confirmDeleteCalcGroup(calc_group_id) {
    try {
        var form_values = {};
        form_values.CalcGroupId = calc_group_id;
        form_values.PrimaryDobjectId = getParamModelId();
        form_values.Page = 'assets/spaces/darce/cg_main/cg_main.js';
        var promise = new Promise((res, rej) => {
            res(WsCalcGrpD(form_values));
        });
        promise.then((response) => {
            if (response) {
                ft_key = $("li." + getParamModelId() + "_" + form_values.CalcGroupId).attr('key');
                if (typeof ft_key != 'undefined' || ft_key != 'undefined') {
                    ftDeleteNode(ft_key, false);
                }
                if ($('.fancytree-calc-structure').is(':visible')) {
                    calcModelFancytreeReload(false);
                    $('#param-calc-group-id').val('');
                    $('.fancytree-calc-panel').addClass('hide');
                }
                new Promise(async (resolve, reject) => {
                    //await setFancyTree(true, true, generateFancyTreeCallback);           
                    addSpin('.tree-refresh');
                    await getWsCalcGroupRBind(getParamModelId(), '%', true, updateOverAllCalcGroupList);
                    resolve('');
                }).then(async () => {
                    removeDataTableRow('.calc-group-table', '.calc-group-table tr.row_' + calc_group_id);
                    calcModelFancytreeReload(false);
                    await asyncGenerateFancyTree();
                    setLocalStorage('calc_group_detail_local_cache', '');
                    setLocalStorage('calc_detail_local_cache', '');
                    var ft = $(".fancytree-structure").fancytree("getTree");
                    var ft_key = $("li.root_" + getParamModelId()).attr('key');
                    ft.getNodeByKey(ft_key).setExpanded();
                });
            }
        })
    } catch (error) {
        displayCatchError('delete-calc-group-error');
        return false;
    }
}

// Delete calc group
function deleteCalcGroup(calc_group_id) {
    confirmDeletionDialog('<p>Are you sure you want to delete calculation group ID ' + calc_group_id + '?</p>', confirmDeleteCalcGroup, calc_group_id);
}

// Confirmation of overwritting debugger script
function showDebuggerScriptDialog() {
    $("#dialog-debugger-script-confirm").removeClass('hide');
    $("#dialog-debugger-script-confirm").dialog({
        resizable: false,
        height: "auto",
        width: 550,
        modal: true,
        buttons: {
            "Yes": function () {
                $("#dialog-debugger-script-confirm").addClass('hide');
                $(this).dialog("close");
                runDebuggerScriptFromCalcGroupBuilder();
            },
            "No": function () {
                $("#dialog-debugger-script-confirm").addClass('hide');
                $(this).dialog("close");
            }
        }
    });
}

// Scroll to bottom
function scrollToBottom(selector, table_selector) {
    var scrollBottom = Math.max($(table_selector).height(), 0);
    $(selector).animate({ scrollTop: scrollBottom }, 1000);
}

// Disable form input modal
function disableFormInputModal(selector, title) {
    $(selector + " .modal-title").html(title);
    $(selector + " text, " + selector + " textarea, " + selector + " select").attr('disabled', 'disabled');
    $(selector + " text, " + selector + " textarea, " + selector + " select").attr('disabled', 'disabled');
    $(selector + " .modal-footer").remove();
}

// Activate fancytree node
function activateFancytreeNode(load_content) {
    try {
        var active_node = getLocalStorage('active_fancytree_node');
        var ft = $(".fancytree-structure").fancytree("getTree");
        if (active_node != null && active_node.length > 0 && load_content) {
            var ft_key = '';
            var activation = active_node[0].activation;
            active_node = active_node[0].tree;
            if (typeof (active_node[0]) != 'undefined') {
                ft_key = $('li.root_' + active_node[0]).attr('key');
            }
            if (typeof (active_node[0]) != 'undefined' && typeof (active_node[1]) != 'undefined') {
                ft_key = $('li.' + active_node[0] + '_' + active_node[1]).attr('key');
            }
            if (typeof (active_node[0]) != 'undefined' && typeof (active_node[1]) != 'undefined' && typeof (active_node[2]) != 'undefined') {
                ft_key = $('li.' + active_node[0] + '_' + active_node[1] + ' li.' + active_node[1] + '_' + active_node[2]).attr('key');
            }
            if (typeof (active_node[0]) != 'undefined' && typeof (active_node[1]) != 'undefined' && typeof (active_node[2]) != 'undefined' && typeof (active_node[3]) != 'undefined') {
                ft_key = $('li.' + active_node[0] + '_' + active_node[1] + ' li.' + active_node[1] + '_' + active_node[2]).attr('key');
                if (active_node[3] != '' && active_node[3] == 'Drivers') {
                    ft_key = $('li.' + active_node[0] + '_' + active_node[1] + ' li.' + active_node[1] + '_' + active_node[2] + ' li.' + active_node[2] + '_Drivers').attr('key');
                    calc_level4 = 'Drivers';
                } else if (active_node[3] != '' && active_node[3] == 'Steps') {
                    ft_key = $('li.' + active_node[0] + '_' + active_node[1] + ' li.' + active_node[1] + '_' + active_node[2] + ' li.' + active_node[2] + '_Steps').attr('key');
                    calc_level4 = 'Steps';
                }
            }
            if (typeof ft_key != 'undefined') {
                if (activation) {
                    ft.getNodeByKey(ft_key).setActive();
                } else {
                    ft.getNodeByKey(ft_key).setExpanded();
                }
            }
            $('#param-active-node-key').val(ft_key);
            removeSpin('.tree-refresh');
        } else {
            removeSpin('.tree-refresh');
        }
        removeSpin('.calculation-refresh, .calc-group-refresh');
    } catch (error) {
        displayCatchError('fancytree-load-incomplete');
        return false;
    }
}

// Get calculations
function getCalculations(calc_group_id = '%', calc_id = '%') {
    try {
        var response = getCalcGroupDetailLocalCache('CALCULATION_DATA', calc_group_id);
        if (!response) {
            response = getWsCgCalcsRBind(calc_group_id, calc_id);
            updateCalcGroupDetailLocalCache('CALCULATION_DATA', response);
        }
        return response;
    } catch (error) {
        displayCatchError('cg-calc-data');
        return false;
    }
}

// Is valid date
function isValidDate(dateString) {
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false;  // Invalid format
    var d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return false; // Invalid date
    return d.toISOString().slice(0, 10) === dateString;
}

// Is valid time
function isValidTime(timeString) {
    return (timeString.search(/^\d{2}:\d{2}$/) != -1) &&
        (timeString.substr(0, 2) >= 0 && timeString.substr(0, 2) <= 24) &&
        (timeString.substr(3, 2) >= 0 && timeString.substr(3, 2) <= 59);
}

// add existing calculation modal
function addExistingCalculationsModal() {
    try {
        $('#select-existing-calculation-modal').modal({ backdrop: 'static', keyboard: false });
        var dataSources = getActiveDataSources(getParamCalcGroupId());
        var option = '';
        var data_sources = [];
        if (typeof (dataSources) !== 'undefined' && !$.isArray(dataSources)) {
            data_sources.push(dataSources);
        } else {
            data_sources = dataSources;
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
}

// add new calculation modal
function addNewCalculationsModal() {
    try {
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
        showDataSourceTab();
    } catch (error) {
        displayCatchError('add-calculation-form-error');
        return false;
    }
}

// Show calculation tab
function showCalculationTab(show = true) {
    if (show) {
        $('#calc-group-detail-form-head-3').show();
        $('#calc-group-detail-form-head-2').removeClass('hideAfter');
        $('#calc-group-detail-form-step-2').find('.button-next').show();
        $('.calc-tab').show();
    } else {
        $('#calc-group-detail-form-head-3').hide();
        $('#calc-group-detail-form-head-2').addClass('hideAfter');
        $('#calc-group-detail-form-step-2').find('.button-next').hide();
        if ($('.calc-group-stepy-wizard')[0] && !$('#calc-group-detail-form-step-0').is(':visible')) {
            $('.calc-group-stepy-wizard').stepy('step', 1);
        }
        $('.calc-tab').hide();
    }
    return true;
}

// Show datasource tab
function showDataSourceTab() {
    $('.nav-tabs a[href="#datasources-tab"]').tab('show');
    $('.datasources-tab').addClass('active');
}

// Get help block
function getHelpBlock(app = '', app_area = '', app_item = '') {
    try {
        if (app !== '' && app_area !== '' && app_item !== '') {
            var help_block = getWsHelpRBind(app, app_area, app_item);
            if (help_block) {
                return help_block.HelpHtml;
            } else {
                return '';
            }
        }
        return false;
    } catch (error) {
        displayCatchError('helptext-error');
        return false;
    }
}

// Webservice - Timestamp read
function getTimestampsRBind(environment, async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarTimestampsR>
                        <Env>`+ environment + `</Env>
                    </tns:ZdarTimestampsR>`;
    return callWebService(url, request, 'ZdarTimestampsRResponse', async, callback);
}

// Load sidebar calc list
function loadSideBarCalcList(calc_group_id) {
    try {
        $('.fancytree-calc-group-title').html(calc_group_id);
        var calcLists = getCalculations(calc_group_id);
        var list = getSideBarCalcList(calcLists);
        $('.fancytree-calculation-table').find('tbody').html(list);
        $('.fancytree-calculation-table .styled').uniform();
        $('.fancytree-calc-panel').removeClass('hide');

        var calc_id = getParamCalcId();
        var active_fancytree_node = getLocalStorage('active_fancytree_node');
        if (calc_id == '' && active_fancytree_node != null && active_fancytree_node.length > 0) {
            active_node = active_fancytree_node[0].tree;
            if (typeof (active_node[2]) != 'undefined') {
                calc_id = active_node[2];
            }
        }
        if (calc_id != '' && !$('.fancytree-calculation-table .row_' + calc_id + '.active-row')[0]) {
            $('.fancytree-calculation-table tr').removeClass('active-row');
            $('.fancytree-calculation-table .row_' + calc_id).addClass('active-row');
        }
        $('.fancytree-calculation-table tbody').sortable({
            handle: 'td.ft-calculation-drag-bar',
            update: function (event, ui) {
                $('.fancytree-calculation-table').css('pointer-events', 'none');
                var calc_data = [];
                $('.ft-calcorder').removeClass('order-changed');
                $('.ft-calcorder').each(function (index) {
                    if (index !== parseInt($(this).attr('attr-index'))) {
                        var calc_data_json = $(this).find('.calc_data').val();
                        if (calc_data_json === '' || calc_data_json === null) { return false; }
                        calc_data_json = JSON.parse(unescape(calc_data_json));
                        calc_data_json['CalcOrder'] = index + 1;
                        calc_data.push(calc_data_json);
                    }
                    $(this).closest('tr').attr('attr-index', $(this).closest('tr').index());
                });
                var promise = new Promise((res, rej) => {
                    setTimeout(function () {
                        WsCgCalcsW(calc_data, 'M');
                        res('');
                    }, 100);
                });
                promise.then(async () => {
                    await updateFancyTreeGroup(getParamCalcGroupId(), getParamModelId(), '', false);
                    $('.fancytree-calculation-table').css('pointer-events', 'all');
                });
            },
            start: function (event, ui) {
            },
            stop: function (event, ui) {
            },
            sort: function (e) {
            }
        });
    } catch (error) {
        displayCatchError('sidebar-calc-list-error');
        return false;
    }
}

// Get sidebar calc list
function getSideBarCalcList(calcLists) {
    var tr_row = '';
    var calculationLists = [];
    if (typeof (calcLists) !== 'undefined' && !$.isArray(calcLists)) {
        calculationLists.push(calcLists);
    } else {
        calculationLists = calcLists;
    }
    if (typeof calculationLists !== 'undefined' && calculationLists.length > 0) {
        $.each(calculationLists, function (i, item) {
            var checked = resultCalcDesc = '';
            if (item.Enabled === "Y" || item.Enabled === "-1") {
                checked = "checked"
            }
            if (item.CalcDescr !== "") {
                resultCalcDesc = `data-title="CALC DESCRIPTION" data-content="${item.CalcDescr}"`;
            }
            tr_row += '<tr attr-index="' + i + '" class="row_' + item.CalcId + ' ft-calcorder"  attr-id="' + item.CalcId + '"><td class="ft-calculation-drag-bar"><i class="icon-three-bars"></i></td>';
            tr_row += '<td><input type="hidden" class="calc_data calc_' + item.CalcId + '" value="' + escape(JSON.stringify(item)) + '"><input type="checkbox" ' + checked + ' class="styled"></td>';
            tr_row += '<td class="sidebar-calc-data"><span class="sidebar-calc-title" ' + resultCalcDesc + ' attr-id="' + item.CalcId + '">' + item.CalcId + '</span></td>';
            tr_row += '<td><span  attr-id="' + item.CalcId + '" class="fancytree-calc-options"><i class="icon-more2 text-muted"></i></span></td></tr>';
        });
    }
    return tr_row;
}

// Update local storage
function updateLocalStorage() {
    try {
        var timeStamps = getTimestampsRBind(getEnvironment());
        var PROPERTIES_REFRESH_TIME_ARR = [];
        var FANCYTREE_REFRESH_TIME_ARR = [];
        var CALCGROUP_REFRESH_TIME_ARR = [];
        var CALC_REFRESH_TIME_ARR = [];
        var MODEL_REFRESH_TIME_ARR = [];
        $.each(timeStamps, function (i, item) {
            if (jQuery.inArray(item.Object, ["ZDAR_DOBJECTS", "ZDAR_CALC_GRP", "ZDAR_CG_DOBJECTS", "ZDAR_CG_VARS", "ZDAR_CG_CALCS", "ZDAR_CALC_HDR", "ZDAR_CALC_DTL", "ZDAR_CALC_DRV"]) === -1) {
                PROPERTIES_REFRESH_TIME_ARR.push(item.DateTimeLastChanged);
            } else {
                FANCYTREE_REFRESH_TIME_ARR.push(item.DateTimeLastChanged);
                if (item.Object == 'ZDAR_CALC_GRP') {
                    MODEL_REFRESH_TIME_ARR.push(item.DateTimeLastChanged);
                }
                if (jQuery.inArray(item.Object, ["ZDAR_CALC_GRP", "ZDAR_CG_DOBJECTS", "ZDAR_CG_VARS", "ZDAR_CG_CALCS"]) > -1) {
                    CALCGROUP_REFRESH_TIME_ARR.push(item.DateTimeLastChanged);

                }
                if (jQuery.inArray(item.Object, ["ZDAR_CALC_HDR", "ZDAR_CALC_DTL", "ZDAR_CALC_DRV"]) > -1) {
                    CALC_REFRESH_TIME_ARR.push(item.DateTimeLastChanged);

                }
            }

        });
        var FANCYTREE_REFRESH_TIME = getLocalStorage('FANCYTREE_REFRESH_TIME');
        var FANCYTREE_TIMESTAMP = Math.max.apply(Math, FANCYTREE_REFRESH_TIME_ARR);
        if (FANCYTREE_REFRESH_TIME < FANCYTREE_TIMESTAMP) {
            setFancyTree(true, true, generateFancyTreeCallback);
        }

        var PROPERTIES_REFRESH_TIME = getLocalStorage('PROPERTIES_REFRESH_TIME');
        var PROPERTIES_TIMESTAMP = Math.max.apply(Math, PROPERTIES_REFRESH_TIME_ARR);
        if (PROPERTIES_REFRESH_TIME < PROPERTIES_TIMESTAMP) {
            setDimensionProperty();
        }
        var activeNode = getLocalStorage('active_fancytree_node');
        if (activeNode != null && activeNode.length > 0) {
            activeNode = activeNode[0].tree;
            var ModelId = activeNode[0];
            var CalcGroupId = activeNode[1];
            var CalId = activeNode[2];

            var MODEL_REFRESH_TIME = getLocalStorage('MODEL_REFRESH_TIME');
            var MODEL_TIMESTAMP = Math.max.apply(Math, MODEL_REFRESH_TIME_ARR);
            if (MODEL_REFRESH_TIME < MODEL_TIMESTAMP) {
                getCalcGroupLists(true);
            }

            var CALCGROUP_REFRESH_TIME = getLocalStorage('CALCGROUP_REFRESH_TIME');
            var CALCGROUP_TIMESTAMP = Math.max.apply(Math, CALCGROUP_REFRESH_TIME_ARR);
            if (CALCGROUP_REFRESH_TIME < CALCGROUP_TIMESTAMP && CalcGroupId) {
                var response = getWsCalcGroupRBind(ModelId, CalcGroupId);
                updateCalcGroupDetailLocalCache('CALC_GROUP_DATA', response);
                getWsCgDObjectsRBind('%', CalcGroupId, true, updateDObjectsLocalCacheData);
                getWsCgVarsRBind(CalcGroupId, '%', true, updateVariablesLocalCacheData);
                getWsCgCalcsRBind(CalcGroupId, '%', true, updateGroupCalculationsLocalCacheData);
            }

            var CALC_REFRESH_TIME = getLocalStorage('CALC_REFRESH_TIME');
            var CALC_TIMESTAMP = Math.max.apply(Math, CALC_REFRESH_TIME_ARR);
            if (CALC_REFRESH_TIME < CALC_TIMESTAMP && CalId) {
                getWsCalcHdrRBind(CalId, true, updateCalcLocalCacheData);
                getWsCgCalcsRBind(CalcGroupId, CalId, true, updateCalcHdrLocalCacheData);
                getWsCalcDrvRBind(CalId, '%', true, updateCalcDriverLocalCacheData);
                getWsCalcDtlRBind(CalId, '%', true, updateCalcStepLocalCacheData);
            }
        }
        return true;
    } catch (error) {
        displayCatchError('timestamp-error');
        return false;
    }
}

// Update calc local cache data
function updateCalcLocalCacheData(response) {
    updateCalcDetailLocalCache('CALCULATION_DATA', response);
}

// Update calc header local cache data
function updateCalcHdrLocalCacheData(response) {
    updateCalcDetailLocalCache('CALC_HEADER_DATA', response);
}

// Update calc driver local cache data
function updateCalcDriverLocalCacheData(response) {
    updateCalcDetailLocalCache('DRIVER_DATA', response);
}

// Update calc step local cache data
function updateCalcStepLocalCacheData(response) {
    updateCalcDetailLocalCache('STEP_DATA', response);
}

// Update local storage by val
async function updateLocalStorageByVal(key, primaryId, newItem) {
    var response = await getIndexedDBStorage(key);
    var index = getIndexOf(response, primaryId, newItem.CalcGroupId);
    if (index) {
        response[index] = newItem;
        setIndexedDBStorage(key, response);
    }
    return response;
}

// Get index of
function getIndexOf(array, attr, value) {
    for (var i = 0; i < array.length; i += 1) {
        if (array[i][attr] === value) {
            return i;
        }
    }
    return -1;
}

// Timemachine refresh
function timemachineRefresh(refresh = false) {
    var timemachine_datetime = getLocalStorage('timemachine_datetime');
    if (timemachine_datetime != '' && !refresh) {
        setLocalStorage('timemachine_datetime', null);
    }
    if (refresh) {
        setLocalStorage('CALC_REFRESH_TIME', '');
        setLocalStorage('FANCYTREE_REFRESH_TIME', '')
        setLocalStorage('CALCGROUP_REFRESH_TIME', '');
        setLocalStorage('MODEL_REFRESH_TIME', '');
        setLocalStorage('PROPERTIES_REFRESH_TIME', '');
    }
}

// Asychronous prepare fancytree data
function asyncPrepareFancyTreeData(response) {
    var promise = new Promise((res, rej) => {
        if (typeof response != 'undefined') {
            res(prepareFancyTreeData(response));
        } else {
            setIndexedDBStorage('fancytree-structure', response);
            res('');
        }
    });
    promise.then(() => {
        generateFancyTree(false, true);
        var group_id = '';
        var calc_id = '';
        var active_node = getLocalStorage('active_fancytree_node');
        if (active_node != null && active_node.length > 0) {
            active_node = active_node[0].tree;
            if (typeof (active_node[0]) != 'undefined' && typeof (active_node[1]) != 'undefined') {
                group_id = active_node[1];
            }
            if (typeof (active_node[1]) != 'undefined' && typeof (active_node[2]) != 'undefined') {
                calc_id = active_node[2];
            }
        }
        getWsCalcGroupRBind('%', '%', true, asyncloadSideBarCalcGroupList);
        if (group_id != '') {
            getWsCgCalcsRBind(group_id, '%', true, asyncCalculationData);
        }

    }).catch((e) => {
        removeSpin('.tree-refresh');
    });
    return true;
}

// Asynchronous load sidebar calc group list
function asyncloadSideBarCalcGroupList(response) {
    overallCalcGroupListLocalCache(response);
    loadSideBarCalcGroupList();
}

// Asynchronous calculation data
function asyncCalculationData(response) {
    updateCalcGroupDetailLocalCache('CALCULATION_DATA', response);
    loadSideBarCalcList(getParamCalcGroupId());
}

// Asynchronous generate fancytree
function asyncGenerateFancyTree() {
    getWsCgHierRBind('', true, asyncPrepareFancyTreeData);
}

// Update client number
function updateClientNumber() {
    if (location.host != 'darwinepm.github.io' && location.host != '172.16.0.114' && location.host != '202.129.196.133') {
        $.ajax({
            url: location.protocol + '//' + location.host + `/sap/bc/bsp/sap/zevo/webcontent/client.html`,
            type: "get",
            async: false,
            success: function (client) {
                try {
                    client = $.trim(strPadDigits(client, 3));
                    setLocalStorage('api_client', client, false);
                } catch (error) {
                    displayCatchError();
                    return false;
                }
            }
        });
    }
}

// generate str_pad digits
function strPadDigits(str, max) {
    str = str.toString();
    return str.length < max ? strPadDigits("0" + str, max) : str;
}

// Delete indexed DB
function deleteIndexedDB() {
    if ($('.calc-group-box .bk-yellow').length > 0) {
        $('#param-clear-cache').val(1);
        trackFormChanges();
        return false;
    }
    $("#dialog-confirm-clear-cache").removeClass('hide');
    $("#dialog-confirm-clear-cache").html('This action will clear any DarCE EVO related local web file and automatically refresh DarCE EVO website. Click OK to Continue.');
    $("#dialog-confirm-clear-cache").dialog({
        title: `Proceed to clear and refresh local web files cache`,
        resizable: false,
        height: "auto",
        width: 550,
        modal: true,
        buttons: {
            "Ok": function () {
                loader('show');
                setTimeout(function () {
                    window.indexedDB.deleteDatabase("DarwinDB_Platform");
                    //localStorage.clear();
                    removeEnvCache(getEnvironment()+'_EP_');
                    removeEnvCache('EP_');
                    location.reload(true);
                }, 1);
            },
            "Cancel": function () {
                $("#dialog-confirm-clear-cache").addClass('hide');
                $(this).dialog("close");
            }
        }
    });
}

// Get max calculation order number
function getMaxCalculationOrderNumber() {
    var orderNum = 0;
    $('.fancytree-calculation-table > tbody > tr .calc_data').each(function () {
        var calcData = JSON.parse(unescape($(this).val()));
        if (orderNum < parseInt(calcData.CalcOrder)) {
            orderNum = parseInt(calcData.CalcOrder);
        }
    });
    return orderNum;
}

// Get max step order number
function getMaxStepOrderNumber(order_change = false) {
    var orderNum = 0;
    $('.calculation-step-table > tbody > tr > td .step_data').each(function () {
        var stepData = JSON.parse(unescape($(this).val()));
        if (order_change && $(this).parent('div').parent('td').parent('tr').hasClass('order-changed')) {
            return false
        }
        if (orderNum < parseInt(stepData.StepOrder)) {
            orderNum = parseInt(stepData.StepOrder);
        }
    });
    return orderNum;
}

// Update step data table
function updateStepDataTable() {
    //Empty the local step data.           
    var local_cache_data = getLocalStorage('calc_detail_local_cache');
    var data = {};
    data[getParamCalcId()] = '';
    local_cache_data[0].STEP_DATA = data;
    setLocalStorage('calc_detail_local_cache', local_cache_data);
    $('.calculation-step-table').DataTable().destroy();
    loadCalculationStep(getParamCalcId(), false);
}

/**
 * Update driver data table
 */
function updateDriverDataTable() {
    //Empty the local driver data.           
    var local_cache_data = getLocalStorage('calc_detail_local_cache');
    var data = {};
    data[getParamCalcId()] = '';
    local_cache_data[0].DRIVER_DATA = data;
    setLocalStorage('calc_detail_local_cache', local_cache_data);
    $('.calculation-driver-table').DataTable().destroy();
    loadCalculationDriver(getParamCalcId(), false);
}

/**
 * Get calc group calculations data
 */
function getCalcGroupCalculationsData(calc_group_id = '%', calc_id = '%') {
    try {
        var response = getCalcGroupDetailLocalCache('CALCULATION_DATA', calc_group_id);
        if (!response) {
            getWsCgCalcsRBind(calc_group_id, calc_id, true, updateCalcGroupCalculationsData);
        } else {
            updateCalcGroupCalculationsData(response, false);
        }
    } catch (error) {
        displayCatchError('calculation-table');
        return false;
    }
    return true;
}

/**
 * Update calc group calculations data
 */
function updateCalcGroupCalculationsData(response, updateLocalGroupData) {
    if (updateLocalGroupData === undefined) {
        updateLocalGroupData = true;
    }
    if (updateLocalGroupData) {
        updateCalcGroupDetailLocalCache('CALCULATION_DATA', response);
    }
    try {
        var list = getCalculationsTableRowData(response);
        $('.calculations-table').find('tbody').html(list);
        initializeCalculationsTable();
        $('.styled').uniform();

        var context_menu_action = $("#param-context-menu-action").val();
        if (context_menu_action !== '') {
            var node_title = $("#param-context-menu-title").val();
            jQuery('.nav-tabs li.calc-tab').find('a').trigger('click');
            var calculation_id = node_title;
            if (context_menu_action === 'rename') {
                var action = 'R';
                var title = "Rename Calculation";
                renameCalculation(calculation_id, action, title);
            } else if (context_menu_action === 'copy') {
                copyCalculation(calculation_id);
            } else if (context_menu_action === 'remove') {
                deleteCalculation(calculation_id, 'R');
            } else if (context_menu_action === 'delete') {
                deleteCalculation(calculation_id, 'D');
            }
            $("#param-context-menu-action").val('');
            $("#param-context-menu-title").val('');
        }
    } catch (error) {
        displayCatchError('calculation-table');
        return false;
    }
}

/**
 * Get calculations table row data
 */
function getCalculationsTableRowData(calcLists = [], rowClass = '', fromCalcId = '') {
    var list = '';
    var calculationLists = [];
    if (typeof (calcLists) !== 'undefined' && !$.isArray(calcLists)) {
        calculationLists.push(calcLists);
    } else {
        calculationLists = calcLists;
    }

    var ft = $(".fancytree-structure").fancytree("getTree");
    if (typeof (calculationLists) !== 'undefined' && calculationLists !== '') {
        calculationLists.sort(function (a, b) {
            return a.CalcOrder - b.CalcOrder;
        });
        $.each(calculationLists, function (i, item) {
            var checked = '';
            var attributes = '';
            if (item.Enabled === "Y" || item.Enabled === "-1") {
                checked = "checked"
            }
            var drv_count = stp_count = 0;
            var ft_StepKey = $("li." + getParamCalcGroupId() + "_" + item.CalcId + " li." + item.CalcId + '_Steps').attr('key');
            var ft_DriversKey = $("li." + getParamCalcGroupId() + "_" + item.CalcId + " li." + item.CalcId + '_Drivers').attr('key');
            if (typeof ft_DriversKey != 'undefined' && typeof ft_StepKey != 'undefined') {
                var ft_Drivernode = ft.getNodeByKey(ft_DriversKey);
                var ft_Stepnode = ft.getNodeByKey(ft_StepKey);
                drv_count = ft_Drivernode.countChildren();
                stp_count = ft_Stepnode.countChildren();
                jQuery.each(['Environment'], function (i, key) {
                    if (key in item) {
                        delete item[key];
                    }
                });
                attributes = 'attr-id="' + item.CalcId + '" attr-calc-instance="' + item.CalcInstance + '"';
                list += '<tr id="row_' + item.CalcId + '" class="' + item.CalcOrder + ' calcorder ' + rowClass + ' row_' + item.CalcId + '" attr-index="' + i + '" attr-val="' + item.CalcId + '">';
                list += '<td width="30px" class="calculation-drag-bar"><i class="icon-three-bars"></i></td>';
                list += '<td width="50px"><div class="checker"><input type="hidden" class="calc_data" id="calc_' + item.CalcId + '" value="' + escape(JSON.stringify(item)) + '">';
                list += '<input type="checkbox" ' + checked + ' class="styled" attr-value="Enabled"></div></td>';
                list += '<td width="200px">';
                list += '<a href="javascript:void(0);" class="calculation-title edit-calculation" ' + attributes + '><span class="text-overflow">' + item.CalcId + '</span></a>';
                list += '</td>';
                list += '<td width="50px"><span class="label label-success">' + drv_count + '</span></td>';
                list += '<td width="50px"><span class="label label-success">' + stp_count + '</span></td>';
                list += '<td><span class="text-overflow-description text-normalize">' + ((typeof (item.CalcDescr) !== 'undefined') ? item.CalcDescr : '') + '</span></td>';
                list += '</tr>';
            }
        });
    }
    return list;
}

/**
 * Intiailize calculations table
 */
function initializeCalculationsTable() {
    var scrollY = 285;
    var columns = [
        { "orderable": false },
        { "orderable": false },
        { "orderable": false },
        { "orderable": false },
        { "orderable": false },
        { "orderable": false }
    ];
    var row_reorder = true;
    initializeDataTable('calculations-table', columns, scrollY, row_reorder);
}

/**
 * Get calc group variables data
 */
function getCalcGroupVariablesData(calc_group_id = '%', variable_id = '%') {
    try {
        var response = getCalcGroupDetailLocalCache('VARIABLE_DATA', calc_group_id);
        if (!response) {
            getWsCgVarsRBind(calc_group_id, variable_id, true, updateCalcGroupVariablesData);
        } else {
            updateCalcGroupVariablesData(response, true, false);
        }
    } catch (error) {
        displayCatchError('variable-table');
        return false;
    }
    return true;
}

/**
 * Update calc group variables data
 */
function updateCalcGroupVariablesData(response, loadItems = true, updateLocalGroupData) {
    try {
        if (updateLocalGroupData === undefined) {
            updateLocalGroupData = true;
        }
        if (updateLocalGroupData) {
            updateCalcGroupDetailLocalCache('VARIABLE_DATA', response);
        }
        if ($('.calc-group-detail').is(':visible')) {
            var list = getVariablesTableRowData(response);
            $('.variables-table').find('tbody').html(list);
            initializeVariablesTable();
            updateCursorIcon('.variables-table > tbody > tr > td > span.text-overflow-description');
            initializeCustomPopover('[data-popup=variable-popover-custom]');
            if (loadItems) {
                updateCalcGroupDefaultValues();
                var promise = new Promise(async (res, rej) => {
                    await listDimensions('', "#variable-dimension", true);
                    await loadSideBarCalcGroupList(getParamCalcGroupId());
                    sortAscDropdownList('#variable-dimension');
                    res('');
                });
                promise.then(async () => {
                    await updateDataSourceTabProperties(parseInt($("#total-data-source-tabs").val()) - 1);
                    updateSaveButton();
                });
            }
            removeSpin('.calc-group-refresh');
            tabScroller('right');
        }
    } catch (error) {
        displayCatchError('variable-table');
        return false;
    }
}

/** 
 * Initialize variables table
 */
function initializeVariablesTable(update_save_button = true) {
    $('.variables-table').DataTable({
        responsive: true,
        "retrieve": true,
        "dom": 'Zlfrtip',
        "colResize": {
            "tableWidthFixed": false,
            "resizeCallback": function (column) {
                $('.variables-tab').floatingScroll('update');
            }
        },
        "autoWidth": false,
        "order": [],
        bLengthChange: false,
        bInfo: false,
        bPaginate: false
    });
    if (update_save_button) {
        updateSaveButton();
    }
}

/**
 * Get variables table row data
 */
function getVariablesTableRowData(variable_form_vaules = [], row_class = '') {
    var list = '';
    var variablesList = [];
    if (typeof (variable_form_vaules) !== 'undefined' && !$.isArray(variable_form_vaules)) {
        variablesList.push(variable_form_vaules);
    } else {
        variablesList = variable_form_vaules;
    }
    if (typeof (variablesList) !== 'undefined' && variablesList.length > 0) {
        $.each(variablesList, function (i, item) {
            var variable_type = variable_class = resultVariableFilter = '';
            variable_type = (item.VariableType === 'STANDARD') ? 'STD' : (item.VariableType == 'REPEAT' ? 'RPT' : item.VariableType);
            variable_class = (variable_type == 'RPT') ? 'label-lite-green' : 'label-primary';
            var row_details = '<input type="hidden" class="variable_data" id="variable_' + item.VariableId + '" value="' + escape(JSON.stringify(item)) + '">';
            list += '<tr id=row_' + item.VariableId + ' class="text-center ' + row_class + ' row_' + item.VariableId + '">';
            list += '<td width="200px">' + row_details + '<a href="javascript:void(0);" class="variable-title edit-variable" attr-id="' + item.VariableId + '"><span class="text-overflow">' + item.VariableId + '</span></a></td>';
            list += '<td><span class="label ' + variable_class + '">' + variable_type + '</span></td>';
            list += '<td><span class="text-overflow">' + ((typeof (item.Dimension) !== 'undefined') ? item.Dimension : '') + '</span></td>';
            list += '<td><span class="text-overflow">' + ((typeof (item.Property) !== 'undefined') ? item.Property : '') + '</span></td>';
            if (item.VariableFilter !== "") {
                resultVariableFilter = `data-popup="variable-popover-custom" data-trigger="hover" data-placement="left" data-title="VARIABLE FILTER" data-content="${item.VariableFilter}"`;
            }
            list += '<td><span class="text-overflow-description" ' + resultVariableFilter + '>' + item.VariableFilter + '</span></td>';
            list += '</tr>';
        });
    }
    return list;
}

/**
 * Update datasource tab properties
 */
async function updateDataSourceTabProperties(total_data_sources = 0) {
    try {
        var ScopeDims, AggDims, IndexDims;
        if (!total_data_sources) {
            total_data_sources = parseInt($("#total-data-source-tabs").val()) - 1;
        }
        for (i = 1; i <= total_data_sources; i++) {
            await listDimensions($("#datasource-dsource-id-" + i + '-default').val(), "#datasource-scope-dims-" + i);
            await listDimensions($("#datasource-dsource-id-" + i + '-default').val(), "#agg-dim-" + i);
            await listDimensions($("#datasource-dsource-id-" + i + '-default').val(), "#index-dim-" + i);

            ScopeDims = $("#datasource-scope-dims-" + i + '-default').val();
            AggDims = $("#agg-dim-" + i + '-default').val();
            IndexDims = $("#index-dim-" + i + '-default').val();

            if (ScopeDims != null) {
                $("#datasource-scope-dims-" + i).multiselect('destroy');
                addMissingMemberLists("#datasource-scope-dims-" + i, ScopeDims.split(","));
                $("#datasource-scope-dims-" + i).val(ScopeDims.split(","));
                $("#datasource-scope-dims-" + i).multiselect('refresh');
            }

            if (AggDims != null) {
                $("#agg-dim-" + i).multiselect('destroy');
                addMissingMemberLists("#agg-dim-" + i, AggDims.split(","));
                $("#agg-dim-" + i).val(AggDims.split(","));
                $("#agg-dim-" + i).multiselect('refresh');
                setPopover('AGGREGATE DIMENSIONS', AggDims, '.agg-dim-btn-' + i, 'bottom');
                updateButtonColor('agg-dim-btn-' + i, ['agg-dim-' + i]);
            }

            if (IndexDims != null && typeof IndexDims !== 'undefined' && IndexDims !== '') {
                addMissingMemberLists("#index-dim-" + i, IndexDims.split(","));
                $("#index-dim-" + i).val(IndexDims.split(","));
                $("#index-dim-" + i).multiselect('destroy');
                initializeMultiSelectForOrder("#index-dim-" + i);
                var IndexDimsOpt = IndexDims.split(",");
                var orderCount = 1;
                $.each(IndexDimsOpt, function (k, item) {
                    $("#index-dim-" + i + " option[value=" + item + "]").data('order', orderCount++);
                });
                setPopover('INDEX DIMENSIONS', IndexDims, '.index-dim-btn-' + i, 'bottom');
                updateButtonColor('index-dim-btn-' + i, ['index-dim-' + i]);
                updateFieldValue('index-dim-btn-' + i, ['index-dim-' + i], false, false);
            }
        }
    } catch (error) {
        displayCatchError('cg-datasource-tab-data');
        return false;
    }
}

/**
 * Calculation where used
 */
function calculationWhereUsed(calculation_id) {
    try {
        var calculationLists = [];
        var calcLists = getWsCgCalcsRBind('%', calculation_id);
        calcGroupData = [];
        if (typeof (calcLists) !== 'undefined' && !$.isArray(calcLists)) {
            calculationLists.push(calcLists);
        } else {
            calculationLists = calcLists;
        }
        if (typeof (calculationLists) !== 'undefined') {
            calculationLists.forEach(calc => {
                calcGroupData.push(calc.CalcGroupId);
            });
        }
        var body_message = `
            <p>
                Calc ID <strong>${calculation_id}</strong> is used in the following Calc Group(s). 
            </p>
        `;
        body_message += `<p>`;
        if (typeof (calculationLists) !== 'undefined' && calculationLists.length > 0) {
            body_message += `<div class="where-used-group-list"><ul>`;
            calcGroupData.forEach(CalcGroupId => {
                body_message += '<li>' + CalcGroupId + '</li>';
            });
            body_message += `</ul></div>`;
            body_message += `</p>`;
            $('#calc-where-used-modal .modal-body').html(body_message);
            $('#calc-where-used-modal').modal('show');
        }
    } catch (error) {
        displayCatchError('calc-where-used-error');
        return false;
    }
}

/**
 * Delete calculation 
 */
function deleteCalculation(calculation_id = '', action = 'R') {
    try {
        if ($('#param-calculations-sort-order').val() > 0 || $('.calculations-table, .calculation-header-form').find('.bk-yellow').length > 0) {
            if (action == 'R') {
                $('#param-calc-remove').val(calculation_id);
            } else {
                $('#param-calc-delete').val(calculation_id);
            }
            trackFormChanges();
            return false;
        }
        var calcData = {};
        calcData['calc_id'] = calculation_id;
        calcData['action'] = action;
        var calculationLists = [];
        if (getParamCalcGroupId() != 'unassigned') {
            var calcLists = getWsCgCalcsRBind('%', calculation_id);
            calcGroupData = [];
            if (typeof (calcLists) !== 'undefined' && !$.isArray(calcLists)) {
                calculationLists.push(calcLists);
            } else {
                calculationLists = calcLists;
            }
            if (typeof (calculationLists) !== 'undefined') {
                calculationLists.forEach(calc => {
                    calcGroupData.push(calc.CalcGroupId);
                });
                calcData['CalcGroupId'] = calcGroupData;
            }
        }
        if (action == 'R') {
            confirmDeletionDialog('<p>Are you sure you want to remove calculation ID ' + calculation_id + '?</p>', confirmDeleteCalculation, calcData, 'Confirm removal action');
        } else if (action == 'D') {
            var body_message = `
                <p>
                    Calc ID <strong>${calculation_id}</strong> is currently used in the following Calc Group(s). 
                    Are you sure want to permanantly delete it and remove it from any Calc Group? 
                </p>
            `;
            body_message += `<p>`;
            if (typeof (calculationLists) !== 'undefined' && calculationLists.length > 0) {
                body_message += calcGroupData.join(', ');
                body_message += `</p>`;
                confirmDeletionDialog(body_message, confirmDeleteCalculation, calcData, 'Confirm delete action');
            } else {
                confirmDeletionDialog('<p>Are you sure you want to remove calculation ID ' + calculation_id + '?</p>', confirmDeleteCalculation, calcData, 'Confirm deletion action');
            }
        }
        if ($('.ft-listview').hasClass('active')) {
            showDataSourceTab();
        }
        return true;
    } catch (error) {
        displayCatchError('delete-calculation-error');
        return false;
    }
}

/**
 * Confirm delete calculation
 */
function confirmDeleteCalculation(calcData = []) {
    if (calcData.length === 0) { return; }
    loader('show');
    setTimeout(function () {
        try {
            var calc_id = calcData.calc_id;
            if ($('.calculations-table tr#row_' + calc_id)[0]) {
                if ($('.fancytree-calculation-table')[0]) {
                    $('.fancytree-calculation-table .row_' + calc_id).remove();
                }
            }
            var form_values = [];
            form_values[0] = { 'name': 'CalcId', value: calc_id };
            form_values[1] = { 'name': 'CalcInstance', value: 1 };
            var calc_form_values = getArrayKeyValuePair(form_values);
            var calc_form_values_write = [];
            calc_form_values_write.push(calc_form_values);
            var ft_load = ($('.unassigned_' + calc_id)[0]) ? false : true;
            calc_form_values.CalcGroupId = (calc_form_values.CalcGroupId == "unassigned") ? "%" : calc_form_values.CalcGroupId;
            if (calcData.action === 'R') {
                var promise = new Promise((res, rej) => {
                    WsCgCalcsW(calc_form_values_write, calcData.action, false);
                    res('');
                });
                promise.then(async () => {
                    await updateFancyTreeGroup(getParamCalcGroupId(), getParamModelId(), '', calcData);
                    getWsCgCalcsRBind(getParamCalcGroupId(), '%', true, updateCalculationsLocalCacheData);
                });
            } else if (calcData.action === 'D') {
                calc_form_values.SourceId = '';
                calc_form_values.TargetId = '';
                calc_form_values.Enabled = '';
                var promise = new Promise((res, rej) => {
                    WsCalcHdrW(calc_form_values, calcData.action);
                    res('');
                });
                promise.then(async () => {
                    await updateFancyTreeGroup(calcData.CalcGroupId, getParamModelId(), '', calcData, ft_load);
                    getWsCgCalcsRBind(getParamCalcGroupId(), '%', true, updateCalculationsLocalCacheData);
                    setLocalStorage('calc_detail_local_cache', '');
                });
            }
        } catch (error) {
            displayCatchError('delete-calculation-error');
            return false;
        }
        loader('hide');
    }, 1);
}

/**
 * Save changes action popup update 
 */
function saveChangesActionPopUpdate(userAction, saveDialogParams) {
    if (userAction == 'No') {
        switch (saveDialogParams.saveChange) {
            case 'copyDriverE':
                updateSaveButton();
                renameDriver(saveDialogParams.from_driver_id, saveDialogParams.action, saveDialogParams.title);
                if (saveDialogParams.selectorLen > 0) {
                    saveChangPopUpReload(saveDialogParams)
                }
                break;
            case 'copyStepE':
                updateSaveButton();
                renameStep(saveDialogParams.step_id, saveDialogParams.action, saveDialogParams.title);
                if (saveDialogParams.selectorLen > 0) {
                    saveChangPopUpReload(saveDialogParams)
                }
                break;

            case 'DeleteDriverE':
                updateSaveButton();
                confirmDeletionDialog('<p>Are you sure you want to delete driver ID ' + saveDialogParams.driver_id + '?</p>', confirmDeleteDriver, saveDialogParams.driver_id);
                if (saveDialogParams.selectorLen > 0) {
                    saveChangPopUpReload(saveDialogParams)
                }
                break;
            case 'DeleteStepE':
                updateSaveButton();
                confirmDeletionDialog('<p>Are you sure you want to delete step ID ' + saveDialogParams.step_id + '?</p>', confirmDeleteStep, saveDialogParams.step_id);
                if (saveDialogParams.selectorLen > 0) {
                    saveChangPopUpReload(saveDialogParams)
                }
                break;
            case 'edit-steps':
                updateSaveButton();
                openStepForm(saveDialogParams.step_id);
                if (saveDialogParams.selectorLen > 0 && saveDialogParams.selector_1 != '') {
                    saveChangPopUpReload(saveDialogParams)
                } else {
                    saveChangPopUpReload(saveDialogParams)
                }
                break;
            case 'edit-drivers':
                updateSaveButton();
                openDriverForm(saveDialogParams.driver_id);
                if (saveDialogParams.selectorLen > 0 && saveDialogParams.selector_1 != '') {
                    saveChangPopUpReload(saveDialogParams)
                } else {
                    saveChangPopUpReload(saveDialogParams)
                }
                break;
        }
    } else if (userAction == 'Yes') {
        switch (saveDialogParams.saveChange) {
            case 'copyDriverE':
                updateSaveButton();
                renameDriver(saveDialogParams.from_driver_id, saveDialogParams.action, saveDialogParams.title);
                break;
            case 'copyStepE':
                updateSaveButton();
                renameStep(saveDialogParams.step_id, saveDialogParams.action, saveDialogParams.title);
                break;
            case 'DeleteDriverE':
                updateSaveButton();
                confirmDeletionDialog('<p>Are you sure you want to delete driver ID ' + saveDialogParams.driver_id + '?</p>', confirmDeleteDriver, saveDialogParams.driver_id);
                break;
            case 'DeleteStepE':
                updateSaveButton();
                confirmDeletionDialog('<p>Are you sure you want to delete step ID ' + saveDialogParams.step_id + '?</p>', confirmDeleteStep, saveDialogParams.step_id);
                break;
            case 'edit-steps':
                updateSaveButton();
                openStepForm(saveDialogParams.step_id);
                break;
            case 'edit-drivers':
                updateSaveButton();
                openDriverForm(saveDialogParams.driver_id);
                break;
        }
    }
}

/**
 * Save change popup reload 
 */
function saveChangPopUpReload(saveDialogParams) {
    if (saveDialogParams.selector_1 != '') {
        destroyDataTableInstance('calculation-step-table');
        destroyDataTableInstance('calculation-driver-table');
        loadCalculationStep(getParamCalcId(), false);
        loadCalculationDriver(getParamCalcId(), false);
        updateSaveButton();
    } else if (saveDialogParams.selector == 'calculation-step-table') {
        destroyDataTableInstance('calculation-step-table');
        loadCalculationStep(getParamCalcId(), false);
    } else if (saveDialogParams.selector == 'calculation-driver-table') {
        destroyDataTableInstance('calculation-driver-table');
        loadCalculationDriver(getParamCalcId(), false);
    }
}

/**
 * Get fancytree data
 */
async function getFancyTreeData() {
    try {
        var response = await getIndexedDBStorage('fancytree-structure');
        if (response === '' || response === null) {
            response = await setFancyTree(true);
        }
        return response;
    } catch (error) {
        displayCatchError('fancytree-data');
        return false;
    }
}

/**
 * cg-detail page form wizard func
 */
function loadCalcGroupStepyWizard($form_class) {
    $.fn.stepy.defaults.legend = false;
    $.fn.stepy.defaults.transition = 'fade';
    $.fn.stepy.defaults.duration = 150;
    $.fn.stepy.defaults.backLabel = '<i class="icon-arrow-left13 position-left"></i> Previous';
    $.fn.stepy.defaults.nextLabel = 'Next <i class="icon-arrow-right14 position-right"></i>';
    $($form_class).stepy({
        titleClick: true,
        next: function (index) {
            updateCalcGroupStepy(index);
        },
        back: function (index) {
            updateCalcGroupStepy(index);
        },
    });
    $($form_class).find('fieldset').removeAttr('title');
    $($form_class).find('.button-next').addClass('btn btn-primary');
    $($form_class).find('.button-back').addClass('btn btn-default');
    $($form_class).find('.stepy-finish').addClass('hidden');
}
/**
 * Update stepy 
 */

function updateCalcGroupStepy(params) {
    setTimeout(() => {
        calcGroupFancytreeReload();
    }, 100);
}

/**
 * calc-detail page form wizard func
 */
function loadCalcStepyWizard() {
    $.fn.stepy.defaults.legend = false;
    $.fn.stepy.defaults.transition = 'fade';
    $.fn.stepy.defaults.duration = 150;
    $.fn.stepy.defaults.backLabel = '<i class="icon-arrow-left13 position-left"></i> Previous';
    $.fn.stepy.defaults.nextLabel = 'Next <i class="icon-arrow-right14 position-right"></i>';
    $(".stepy-wizard").stepy({
        titleClick: true,
        next: function (index) {
            updateFancyTreeByStepy(index);
        },
        back: function (index) {
            updateFancyTreeByStepy(index);
        },
    });
    $('.stepy-wizard').find('fieldset').removeAttr('title');
    $('.stepy-wizard').find('.button-next').addClass('btn btn-primary');
    $('.stepy-wizard').find('.button-back').addClass('btn btn-default');
}

function getCalcGroupIndexDimension(tab_id) {
    var selected = [];
    $('#index-dim-' + tab_id + ' option:selected').each(function () {
        selected.push([$(this).val(), $(this).data('order')]);
    });

    selected.sort(function (a, b) {
        return a[1] - b[1];
    });

    var IndexDims = '';
    for (var k = 0; k < selected.length; k++) {
        IndexDims += selected[k][0] + ', ';
    }

    return IndexDims.substring(0, IndexDims.length - 2);
}

/**
 * Update calc group default values
 */
function updateCalcGroupDefaultValues(code_mirror = true, calc_group_data = true, dsource_data = true) {
    var calc_group_id = getParamCalcGroupId();
    if (typeof calc_group_id == 'undefined') {
        return true;
    }

    try {
        if (calc_group_data) {
            $('.default_values').html('');
            var response = getCalcGroupDetailLocalCache('CALC_GROUP_DATA', calc_group_id);
            if (typeof (response) === 'undefined') {
                return;
            }
            createDefaultValues('calc-group-id', response.CalcGroupId);
            createDefaultValues('calc-group-desc', response.CalcGroupDescr);
            createDefaultValues('run-criteria', response.RunCriteria);
            createDefaultValues('pre-run-scope-adj', response.PreRunScopeAdj);
            createDefaultValues('post-run-scope-adj', response.PostRunScopeAdj);

            setPopover('RUN CRITERIA', response.RunCriteria, '.run-criteria-btn', 'top');
            setPopover2('PRE RUN SCOPE ADJUSTMENT', response.PreRunScopeAdj, 'POST RUN SCOPE ADJUSTMENT', response.PostRunScopeAdj, '.scope-adj-btn', 'top', 'custom');

            createTempValues('run-criteria', response.RunCriteria);
            createTempValues('pre-run-scope-adj', response.PreRunScopeAdj);
            createTempValues('post-run-scope-adj', response.PostRunScopeAdj);

            updateButtonColor('run-criteria-btn', ['run-criteria']);
            updateButtonColor('scope-adj-btn', ['pre-run-scope-adj', 'post-run-scope-adj']);
        }
    } catch (error) {
        displayCatchError('cg-header-data');
        return false;
    }

    try {
        if (dsource_data) {
            dt_src = getActiveDataSources(calc_group_id);
            var data_sources = [];
            if (typeof (dt_src) !== 'undefined' && !$.isArray(dt_src)) {
                data_sources.push(dt_src);
            } else {
                data_sources = dt_src;
            }
            if (typeof (data_sources) !== 'undefined' && data_sources !== '') {
                data_sources.sort(function (a, b) {
                    return a.DobjectOrder - b.DobjectOrder;
                });
                tab = 1
                for (item of data_sources) {
                    var ScopeDims = item.ScopeDims.split(",").map(function (i) {
                        return i.trim();
                    });
                    var AggDims = item.AggDims.split(",").map(function (i) {
                        return i.trim();
                    });
                    var IndexDims = item.IndexDims.split(",").map(function (i) {
                        return i.trim();
                    });
                    createDefaultValues('datasource-dsource-id-' + tab, item.DobjectId);
                    createDefaultValues('datasource-dobjectOrder-' + tab, item.DobjectOrder);
                    if (ScopeDims !== '') {
                        createDefaultValues('datasource-scope-dims-' + tab, ScopeDims.join(','));
                    }
                    if (AggDims !== '') {
                        createDefaultValues('agg-dim-' + tab, AggDims.join(','));
                        setPopover('AGGREGATE DIMENSIONS', AggDims.join(', '), '.agg-dim-btn-' + tab, 'bottom');
                    }
                    if (IndexDims !== '') {
                        createDefaultValues('index-dim-' + tab, IndexDims.join(','));
                        setPopover('INDEX DIMENSIONS', IndexDims.join(', '), '.index-dim-btn-' + tab, 'bottom');
                    }

                    createTempValues('agg-dim-' + tab, AggDims.join(','), true);
                    createTempValues('index-dim-' + tab, IndexDims.join(','), true);

                    createDefaultValues('datasource-criteria-' + tab, item.Criteria);
                    $("#datasource-criteria-" + tab).next('.CodeMirror').remove();
                    initializeCodeMirror("datasource-criteria-" + tab);
                    tab++;
                }
            }
        }
    } catch (error) {
        displayCatchError('cg-dobject-data');
        return false;
    }
}

/**
 * Timemachine modal update
 */
function timemachineModalUpdate() {
    var timemachine_datetime = getLocalStorage('timemachine_datetime');
    var timemachine_date = '0000-00-00';
    var timemachine_time = '00:00';

    if (timemachine_datetime != '' && timemachine_datetime != null) {
        $('#param-date-time-last-changed').val(timemachine_datetime);
        var timemachine_str = timemachine_datetime.toString();
        timemachine_date = timemachine_str.substring(0, 4) + '-' + timemachine_str.substring(4, 6) + '-' + timemachine_str.substring(6, 8);
        timemachine_time = timemachine_str.substring(8, 10) + ':' + timemachine_str.substring(10, 12);
        var formatted_date_title = moment(new Date(timemachine_date + ' ' + timemachine_time)).format('MMM DD, YYYY hh:mm a');
        $('.tree-refresh').addClass('icon-history').removeClass('icon-loop3');
        $('.tree-refresh').addClass('tree-timemachine').removeClass('tree-refresh').removeClass('spin');
        $('.timemachine-tooltip').html('DarCE Rewind mode is set as of ' + formatted_date_title);
        $('.timemachine-switch').prop('checked', true);
        $('#timemachine-check').val(0);
        updateSwitchery('.timemachine-switch', true);
        $('#timemachine-date').val(timemachine_date);
        $('#timemachine-date').mask(timemachine_date);
        $('#timemachine-time').val(timemachine_time);
        $('#timemachine-time').mask(timemachine_time);
        $('#timemachine-form').find('.text-red').html('');
    }
    var warning = document.querySelector('.timemachine-switch');
    var switchery = new Switchery(warning, { color: '#FF7043' });
}

// set Webservice Offline param
function setWebserviceOffline() {
    $('#param-webservice-error').val(1);
    $('.spin').removeClass('spin');
    setTimeout(() => {
        $('#param-webservice-error').val('');
    }, 2000);
}
// check the internet connection
function check_connectivity() {
    var status = navigator.onLine;
    if (!status) {
        displayCatchError();
        return false;
    } else {
        return true;
    }
}
function minWebserviceCall() {
    callWebService(getConfig('zdar_calc_engine_bind'), '<tns:ZdarMin/>', 'ZdarMinResponse');
}

/**
 * event Driver and step form close
 */
function eventDriverStepFromClose() {
    if (($('#calculation-form-head-2').hasClass('stepy-active') && $('#step-form').find('input[name=step_action]').val() !== 'add') ||
        ($('#calculation-form-head-1').hasClass('stepy-active') && $('#driver-form').find('input[name=DriverAction]').val() !== 'add')) {
        var node = $(".fancytree-structure").fancytree("getActiveNode");
        node.parent.setActive();
    }
}

//Update debugger datasource selectdropdown
function updateDebuggerDatasourceField() {
    if ($('#debugger-model-field')[0]) {
        var currentDataSource = $('#debugger-model-field').val();
        listModelOptions('#debugger-model-field');
        $('#debugger-model-field').select2();
        if (currentDataSource) {
            $('#debugger-model-field').val(currentDataSource).trigger('change.select2');
        }
        if (!$('#debugger-model-field').val()) {
            $('#debugger-model-field option:eq(0)').prop('selected', true);
            $('#debugger-model-field').trigger('change.select2');
        }
    }
}
$(document).ready(function () {
    $(document).on('keypress', '.input-field', function (e) {
        var code = e.keyCode || e.which;
        if (code == 13) {
            e.preventDefault()
            e.stopPropagation()
            return false;
        }

    });
});

function highlightParagraph(newElem, oldElem) {
    var oldText = oldElem.text(),
        text = '';
    newElem.text().split('').forEach(function (val, i) {
        if (val != oldText.charAt(i))
            text += "<span class='highlight'>" + val + "</span>";
        else
            text += val;
    });
    newElem.html(text);
}

// Confirmation of overwritting debugger script
function trackDebuggerFormChanges(callback = '') {
    if ($('#script').val()) {
        $("#dialog-debugger-script-confirm").removeClass('hide');
        $("#dialog-debugger-script-confirm").dialog({
            resizable: false,
            height: "auto",
            width: 550,
            modal: true,
            buttons: {
                "Yes": function () {
                    $("#dialog-debugger-script-confirm").addClass('hide');
                    $(this).dialog("close");
                    callback();
                },
                "No": function () {
                    $("#dialog-debugger-script-confirm").addClass('hide');
                    $(this).dialog("close");
                }
            }
        });
    } else {
        callback();
    }
}

async function getOverallCalcList(forceReload = false) {
    var calcLists = await getIndexedDBStorage('overall_calc_list');
    if (forceReload || !calcLists) {
        getWsCgCalcsRBind('%', '%', true, response => {
            var calcLists = [];
            response.forEach(calc => {
                if (calcLists.indexOf(calc.CalcId) === -1) {
                    calcLists.push(calc.CalcId);
                }
            });
            setIndexedDBStorage('overall_calc_list', calcLists);
        });
    }
    return calcLists;
}

function getCalcListByGroupId(group_ids) {       
        if(typeof group_ids == 'undefined'){
            group_ids = '%';
        }        
        var response  = getWsCgCalcsRBind(group_ids, '%');
        //console.log('response',response)
        var responseList = [];
        if (typeof (response) !== 'undefined' && !$.isArray(response)) {
            responseList.push(response);
        }else{
            responseList = response;
        }
        //console.log('response',responseList)
        var calcLists = [];
        responseList.forEach(calc => {
            if (calcLists.indexOf(calc.CalcId) === -1) {
                calcLists.push(calc.CalcId);
            }
            
        }); 
        //console.log('calcLists',calcLists)
            // res(calcLists)           
            
    
    return calcLists;
}

function getDebuggerDefaultQuery() {
    return `*START_BADI DARCE\nQUERY = [QUERY]\nWRITE = [WRITE]\nCALC_GROUP_ID = [CALC_GROUP_ID]\nOUTPUT_TEMP_DATA_Y_N = [OUTPUT_TEMP_DATA_Y_N]\nSHOW_SQL_Y_N = [SHOW_SQL_Y_N]\n*END_BADI`;
}

function defineTabID() {
    var iPageTabID = sessionStorage.getItem("EP_TABID");
    // if it is the first time that this page is loaded
    if (iPageTabID == null) {
        var iLocalTabID = localStorage.getItem("EP_TABID");
        var iPageTabID = (iLocalTabID == null) ? 1 : Number(iLocalTabID) + 1;
        localStorage.setItem("EP_TABID", iPageTabID);
        sessionStorage.setItem("EP_TABID", iPageTabID);
    }
}

function getSessionTabID(param_key) {
    if (
        param_key === 'ACTIVE_FANCYTREE_NODE' ||
        param_key === 'CALC_GROUP_DETAIL_LOCAL_CACHE' ||
        param_key === 'CALC_DETAIL_LOCAL_CACHE' ||
        param_key === 'CALCULATION_GROUP_DATA' ||
        param_key === 'CURRENT_ENVIRONMENT' ||
        param_key === 'FANCYTREE-STRUCTURE'
    ) {
        var iPageTabID = sessionStorage.getItem("EP_TABID");
        param_key = iPageTabID + '_' + param_key;
    }
    param_key = 'EP_' + param_key;
    return param_key;
}