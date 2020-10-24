$(function () {
    $(".styled").uniform();
    addSpin('.tree-refresh');
    var promise = new Promise(async (res, rej) => {
        await generateFancyTree(false, false);
        res('');
    });
    promise.then(() => {
        initializeFTCalcGroupContextMenu();
        initializeFTCalcContextMenu();
        if (!getLocalStorage('fancytree_listview') || getLocalStorage('fancytree_listview') == null) {
            $('.fancytree-structure').removeClass('hide');
        }else{
            loadSideBarCalcGroupList();
        }
    });
});

// Load sidebar calc group list
async function loadSideBarCalcGroupList(calc_group_id = '', refresh = false) {    
    try {
        if (getLocalStorage('fancytree_listview')) {
            $('.ft-listview').trigger('click');
        }
        if (refresh) {
            var groupList = await getCalcGroupLists(refresh);
        } else {
            var groupList = await getCalcGroupLists();
        }
        $('.fancytree-calc-panel').addClass('hide');
        if (groupList !== null) {
            updateSideBarCalcGroupList(groupList);
        }
        if (calc_group_id != '') {
            $('.sidebar-calc-group-lists').val(calc_group_id);
            $('.sidebar-calc-group-lists').select2();
            loadSideBarCalcList(calc_group_id);
            if ($('.fancytree-calc-panel .fancytree-calc-group-title').html() == calc_group_id) {
                var calc_id = getParamCalcId();
                if (calc_id != '') {
                    $('.fancytree-calculation-table tr').removeClass('active-row');
                    $('.fancytree-calculation-table .row_' + calc_id).addClass('active-row');
                }
            }
        }
        return true;
    } catch (error) {
        displayCatchError('sidebar-calc-group-list');
        return false;
    }
}

// Update sidebar calc group list
function updateSideBarCalcGroupList(calcGroupLists) {
    try {
        if (typeof (calcGroupLists) !== 'undefined') {
            $(".sidebar-calc-group-lists").html('<option></option>');
            if (calcGroupLists !== null) {
                $.each(calcGroupLists, function (i, item) {
                    $(".sidebar-calc-group-lists").append('<option attr-model="' + item.PrimaryDobjectId + '" value="' + item.CalcGroupId + '">' + item.CalcGroupId + '</option>');
                });
            }
        }
        var active_node = getLocalStorage('active_fancytree_node');
        var calc_group_id = getParamCalcGroupId();
        if (calc_group_id == '') {
            if (active_node != null && active_node.length > 0) {
                active_node = active_node[0].tree;
                if (active_node[1] != '' && typeof (active_node[1]) != 'undefined') {
                    calc_group_id = active_node[1];
                }
            }
        }
        if (calc_group_id != '') {
            $('.sidebar-calc-group-lists').val(calc_group_id);
            $('.sidebar-calc-group-lists').select2();
            loadSideBarCalcList(calc_group_id);
        } else {
            $('.sidebar-calc-group-lists').val('');
            $('.sidebar-calc-group-lists').select2();
        }
        return true
    } catch (error) {
        displayCatchError('sidebar-calc-group-list');
        return false;
    }
}

// Activate fancytree calc group node
function ftActivateGroupNode() {
    try {
        $('.fancytree-calculation-table tr').removeClass('active-row');
        $('#param-calc-id').val('');
        var ft_key = $(".fancytree-structure li." + getParamModelId() + "_" + getParamCalcGroupId()).attr('key');
        if (typeof ft_key != 'undefined' && ft_key != 'undefined') {
            setActiveNode(ft_key);
            return true;
        } else {
            displayCatchError('calc-group-data');
            return false;
        }
    } catch (error) {
        displayCatchError('fancytree-activate-error');
        return false;
    }
}

// Initialize fancytree listview calc group context menu
function initializeFTCalcGroupContextMenu() {
    $.contextMenu({
        selector: '.fancytree-calc-group-options',
        trigger: 'left',
        className: 'ft-calc-context-menu',
        callback: function (key, options) {
            if ($(this).hasClass('fancytree-calc-group-options')) {
                var model_id = getParamModelId();
                var calc_group_id = getParamCalcGroupId();
                var promise = new Promise((res, rej) => {
                    if ($('.calculation-section')[0]) {
                        var ft_key = $("li." + getParamModelId() + "_" + getParamCalcGroupId()).attr('key');
                        res(setActiveNode(ft_key));
                    }
                    if (key == 'delete' || key === 'copy') {
                        if ($('#calc-group-overview').length <= 0) {
                            var ft_key = $("li.root_" + getParamModelId()).attr('key');
                            res(setActiveNode(ft_key));
                        }
                    }
                    res('');
                });
                promise.then(() => {
                    if (key == 'add_existing') {
                        addExistingCalculationsModal();
                    } else if (key == 'add_new') {
                        addNewCalculationsModal();
                    } else if (key === 'delete') {
                        deleteCalcGroup(calc_group_id);
                    } else if (key === 'copy') {
                        renameCalcGroup(calc_group_id, 'C');
                    } else if (key === 'rename') {
                        renameCalcGroup(calc_group_id, 'R');
                    } else if (key == 'audit') {
                        $('#param-audit-model').val(model_id);
                        $('#param-audit-calc-group-id').val(calc_group_id);
                        $("#drwn_pg_1008_100016").remove();
                        drwn_sidebar_item_click('1008_136');
                    } else if (key == 'run') {
                        runDebuggerScriptModal(model_id, calc_group_id);
                    }
                    showDataSourceTab();
                });
            }
        },
        items: {
            "add": {
                name: "Add New Calculation",
                icon: 'menu-add',
                items: {
                    "add_existing": {
                        name: "Select Existing",
                        icon: 'menu-add-existing',
                        disabled: function (key, opt) {
                            if (!hasWriteAccess()) {
                                return true;
                            }
                            return false;
                        }
                    },
                    "add_new": {
                        name: "Create New",
                        icon: 'menu-add-new',
                        disabled: function (key, opt) {
                            if (!hasWriteAccess()) {
                                return true;
                            }
                            return false;
                        }
                    }
                },
                disabled: function (key, opt) {
                    if (!hasWriteAccess()) {
                        return true;
                    }
                    return false;
                }
            },
            "rename": {
                name: "Rename",
                icon: 'menu-rename',
                disabled: function (key, opt) {
                    if (!hasWriteAccess()) {
                        return true;
                    }
                    return false;
                }
            },
            "copy": {
                name: "Copy",
                icon: 'menu-copy',
                disabled: function (key, opt) {
                    if (!hasWriteAccess()) {
                        return true;
                    }
                    return false;
                }
            },
            "delete": {
                name: "Delete",
                icon: 'menu-delete',
                disabled: function (key, opt) {
                    if (!hasWriteAccess()) {
                        return true;
                    }
                    return false;
                }
            },
            "audit": {
                name: "Audit",
                icon: 'menu-audit'
            },
            "run": {
                name: "Run",
                icon: 'menu-run'
            }
        }
    });
}

// Initialize fancytree listview calc context menu
function initializeFTCalcContextMenu() {
    $.contextMenu({
        selector: '.fancytree-calc-options',
        trigger: 'left',
        callback: function (key, options) {
            if ($(this).hasClass('fancytree-calc-options')) {
                var calculation_id = $(this).attr('attr-id');
                if (key === 'rename') {
                    var action = 'R';
                    var title = "Rename Calculation";
                    var is_row_modified = checkRowModification(this);
                    if (!is_row_modified) {
                        renameCalculation(calculation_id, action, title);
                    }
                } else if (key === 'copy') {
                    copyCalculation(calculation_id);
                } else if (key === 'where-used') {
                    calculationWhereUsed(calculation_id);
                } else if (key === 'remove') {
                    deleteCalculation(calculation_id, 'R');
                } else if (key === 'delete') {
                    deleteCalculation(calculation_id, 'D');
                } else if (key == 'audit') {
                    $('#param-audit-model').val(getParamModelId());
                    $('#param-audit-calc-group-id').val(getParamCalcGroupId());
                    $('#param-audit-calc-id').val($(this).attr('attr-id'));
                    $("#drwn_pg_1008_100016").remove();
                    drwn_sidebar_item_click('1008_136');
                }
                showDataSourceTab();
            }
        },
        items: {
            "rename": {
                name: "Rename",
                icon: 'menu-rename',
                disabled: function (key, opt) {
                    if (!hasWriteAccess()) {
                        return true;
                    }
                    return false;
                }
            },
            "copy": {
                name: "Copy",
                icon: 'menu-copy',
                disabled: function (key, opt) {
                    if (!hasWriteAccess()) {
                        return true;
                    }
                    return false;
                }
            },
            "remove": {
                name: "Remove",
                icon: 'menu-remove',
                disabled: function (key, opt) {
                    if (!hasWriteAccess()) {
                        return true;
                    }
                    return false;
                }
            },
            "where-used": {
                name: "Where-Used",
                icon: 'menu-where-used',
                disabled: function (key, opt) {
                    if (!hasWriteAccess()) {
                        return true;
                    }
                    return false;
                }
            },
            "delete": {
                name: "Delete",
                icon: 'menu-delete',
                disabled: function (key, opt) {
                    if (!hasWriteAccess()) {
                        return true;
                    }
                    return false;
                }
            },
            "audit": {
                name: "Audit",
                icon: 'menu-audit'
            }
        }
    });
}
