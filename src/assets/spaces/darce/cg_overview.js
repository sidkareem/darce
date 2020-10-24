$(document).ready(function() {
    $(".styled").uniform();
    $("#fancytree").load('assets/spaces/darce/fancytree/fancytree.html?'+Math.random());
    $('#select-existing-calc-model-field, #select-existing-calc-calculation-field').select2();
    $('#timemachine-date-group').daterangepicker({
        singleDatePicker: true
    });
    timemachineModalUpdate();
    initializeContextMenu();
    resetCalcGroupDetailLocalStorage();
    listDataSourceOptions();
});

$('#timemachine-date-group').on('apply.daterangepicker', function(ev, picker) {
    $('#timemachine-date').val(picker.startDate.format('YYYY-MM-DD'));
    $('#timemachine-date').trigger('change');
});

$('#timemachine-time-group').on('click', function (e) {
    e.preventDefault();
    if(!$('#timemachine-time').hasClass('active')) {
        $('#timemachine-time').AnyTime_picker({
            format: "%H:%i"
        }).focus();
        $('#timemachine-time').addClass('active');
    } else {
        $('#timemachine-time').focus();
    }
});

$("#timemachine-date, #timemachine-time").change(function(e) {
    e.preventDefault();
    $('#timemachine-modal').show();
});

$('#timemachine-time').on('click', function (e) {
    e.preventDefault();
    $(this).AnyTime_noPicker();
    $(this).removeClass('active');
});

/**
 * Initialize Context Menu
 */
function initializeContextMenu(){
    loadCalcGroupContextMenu();
    loadCalculationContextMenu();
    loadVariableDriverStepContextMenu();
}

/**
 * Load Calc Group Context Menu
 */
function loadCalcGroupContextMenu() {
    $.contextMenu({
        selector: '.calc-group-title, .calc-group-fancytree-title',
        callback: function(key, options) {            
            if($(this).hasClass('calc-group-title')){
                if(key === 'delete'){
                    deleteCalcGroup($(this).attr('attr-id'));
                }else if(key === 'copy'){                  
                    renameCalcGroup($(this).attr('attr-id'), 'C');
                }else if(key === 'rename'){
                    renameCalcGroup($(this).attr('attr-id'), 'R');
                }else if(key == 'audit') {
                    if(typeof($('#param-audit-query').val()) === 'undefined' || $('#param-audit-query').val() == '') {
                        $('#param-audit-model').val($(this).attr('attr-model'));
                        $('#param-audit-calc-group-id').val($(this).attr('attr-id'));
                        $("#drwn_pg_1008_100016").remove();
                        drwn_sidebar_item_click('1008_136');
                    } else {
                        if($('#param-audit-query').val() != '') {
                            $("#dialog-confirm-deletion").removeClass('hide');
                            $("#dialog-confirm-deletion").html('We\'ve detected that Audit page already has some audit results. Do you want to clear current result and rerun audit again?');
                            var title =  'Confirm audit action';
                            var attr_id = $(this).attr('attr-id');
                            var attr_model = $(this).attr('attr-model');
                            $("#dialog-confirm-deletion").dialog({
                                title: title,
                                resizable: false,
                                height: "auto",
                                width: 550,
                                modal: true,
                                buttons: {  
                                    "Yes": function() {
                                        $('#param-audit-model').val(attr_model);
                                        $('#param-audit-calc-group-id').val(attr_id);
                                        $("#drwn_pg_1008_100016").remove();
                                        drwn_sidebar_item_click('1008_136');
                                        $("#dialog-confirm-deletion").addClass('hide');
                                        $( this ).dialog( "close" );    
                                    },         
                                    "No": function() {
                                        $("#dialog-confirm-deletion").addClass('hide');
                                        $( this ).dialog( "close" );                    
                                    }
                                }
                            }); 
                        }
                    }
                }else if(key == 'run') {
                    runDebuggerScriptModal($(this).attr('attr-model'), $(this).attr('attr-id'));
                }
            }else if($(this).hasClass('calc-group-fancytree-title')){
                var node = $.ui.fancytree.getNode(options.$trigger);
                if(node.getLevel() === 2){
                    var load_table = false;
                    if(node.parent.title !== getParamModelId()){
                        load_table = true;
                    }
                    if(($('.calc-group-overview-content').length <= 0 || load_table) && key !== 'audit' && key !== 'run'){
                        $("#param-context-menu-action").val(key);
                        $("#param-context-menu-title").val(node.title);
                        setActiveNode(node.parent.key);
                    }else{
                        if(key === 'delete'){                            
                            deleteCalcGroup(node.title);                            
                        }else if(key === 'copy'){
                            renameCalcGroup(node.title,'C');
                        }else if(key === 'rename'){
                            renameCalcGroup(node.title,'R');
                        }else if(key == 'audit') {
                            if(typeof($('#param-audit-query').val()) === 'undefined' || $('#param-audit-query').val() == '') {
                                $('#param-audit-model').val(node.parent.title);
                                $('#param-audit-calc-group-id').val(node.title);
                                $("#drwn_pg_1008_100016").remove();
                                drwn_sidebar_item_click('1008_136');
                            } else {
                                if($('#param-audit-query').val() != '') {
                                    $("#dialog-confirm-deletion").removeClass('hide');
                                    $("#dialog-confirm-deletion").html('We\'ve detected that Audit page already has some audit results. Do you want to clear current result and rerun audit again?');
                                    var title =  'Confirm audit action';
                                    $("#dialog-confirm-deletion").dialog({
                                        title: title,
                                        resizable: false,
                                        height: "auto",
                                        width: 550,
                                        modal: true,
                                        buttons: {  
                                            "Yes": function() {
                                                $('#param-audit-model').val(node.parent.title);
                                                $('#param-audit-calc-group-id').val(node.title);
                                                $("#drwn_pg_1008_100016").remove();
                                                drwn_sidebar_item_click('1008_136');
                                                $("#dialog-confirm-deletion").addClass('hide');
                                                $( this ).dialog( "close" );    
                                            },         
                                            "No": function() {
                                                $("#dialog-confirm-deletion").addClass('hide');
                                                $( this ).dialog( "close" );                    
                                            }
                                        }
                                    }); 
                                }
                            }
                        }else if(key == 'run') {
                            runDebuggerScriptModal(node.parent.title, node.title);
                        }
                    }
                }
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

/**
 * Load Calculation Context Menu
 */
function loadCalculationContextMenu() {
    $.contextMenu({
        selector: '.calculation-title, .calculation-fancytree-title',
        callback: function(key, options) {      
            if($(this).hasClass('fancytree-node')){
                var node = $.ui.fancytree.getNode(options.$trigger);
                if(key !== 'where-used') {
                    $("#param-load-calculation").val(1);                    
                    setActiveNode(node.parent.key);
                }

                if(node.getLevel() === 3){                    
                    var load_table = false;
                    if(node.parent.title !== getParamCalcGroupId()){
                        load_table = true;
                    }     
                    if((load_table || ($('.cg-detail-form-content').length <= 0) )){
                        calculation_id = node.title;
                        if(key === 'rename'){
                            var action = 'R';
                            var title = "Rename Calculation";
                            renameCalculation(calculation_id,action,title);
                        }else if(key === 'copy'){
                            copyCalculation(calculation_id);
                        }
                        else if(key === 'remove'){  
                            deleteCalculation(calculation_id, 'R');
                        }else if(key === 'where-used'){                    
                            calculationWhereUsed(calculation_id);
                        }
                        else if(key === 'delete'){
                            deleteCalculation(calculation_id, 'D');                            
                        }else if(key == 'audit'){
                            if(typeof($('#param-audit-query').val()) === 'undefined' || $('#param-audit-query').val() == '') {
                                $('#param-audit-model').val(node.parent.parent.title);
                                $('#param-audit-calc-group-id').val(node.parent.title);
                                $('#param-audit-calc-id').val(node.title);
                                $("#drwn_pg_1008_100016").remove();
                                drwn_sidebar_item_click('1008_136');
                            } else {
                                if($('#param-audit-query').val() != '') {
                                    $("#dialog-confirm-deletion").removeClass('hide');
                                    $("#dialog-confirm-deletion").html('We\'ve detected that Audit page already has some audit results. Do you want to clear current result and rerun audit again?');
                                    var title =  'Confirm audit action';
                                    $("#dialog-confirm-deletion").dialog({
                                        title: title,
                                        resizable: false,
                                        height: "auto",
                                        width: 550,
                                        modal: true,
                                        buttons: {  
                                            "Yes": function() {
                                                $('#param-audit-model').val(node.parent.parent.title);
                                                $('#param-audit-calc-group-id').val(node.parent.title);
                                                $('#param-audit-calc-id').val(node.title);
                                                $("#drwn_pg_1008_100016").remove();
                                                drwn_sidebar_item_click('1008_136');
                                                $("#dialog-confirm-deletion").addClass('hide');
                                                $( this ).dialog( "close" );    
                                            },         
                                            "No": function() {
                                                $("#dialog-confirm-deletion").addClass('hide');
                                                $( this ).dialog( "close" );                    
                                            }
                                        }
                                    }); 
                                }
                            }
                        }else{
                            $("#param-context-menu-action").val(key);
                            $("#param-context-menu-title").val(node.title);
                            $("#param-active-node-key").val(node.key);
                            setActiveNode(node.parent.key);
                        }                        
                    }else{
                        if($('.cg-detail-form-content').length > 0){
                            if(!$('.ft-listview').hasClass('active')){
                                jQuery('.nav-tabs li.calc-tab').find('a').trigger('click');
                            }
                            calculation_id = node.title;
                            if(key === 'rename'){
                                var calculation_id = node.title;
                                var action = 'R';
                                var title = "Rename Calculation";
                                renameCalculation(calculation_id,action,title);
                            }else if(key === 'copy'){
                                copyCalculation(calculation_id);
                            }else if(key === 'remove'){  
                                deleteCalculation(calculation_id, 'R');
                            }else if(key === 'where-used'){                    
                                calculationWhereUsed(calculation_id);
                            }else if(key === 'delete'){  
                                deleteCalculation(calculation_id, 'D');
                            }else if(key == 'audit') {
                                if(typeof($('#param-audit-query').val()) === 'undefined' || $('#param-audit-query').val() == '') {
                                    $('#param-audit-model').val(node.parent.parent.title);
                                    $('#param-audit-calc-group-id').val(node.parent.title);
                                    $('#param-audit-calc-id').val(calculation_id);
                                    $("#drwn_pg_1008_100016").remove();
                                    drwn_sidebar_item_click('1008_136');
                                } else {
                                    if($('#param-audit-query').val() != '') {
                                        $("#dialog-confirm-deletion").removeClass('hide');
                                        $("#dialog-confirm-deletion").html('We\'ve detected that Audit page already has some audit results. Do you want to clear current result and rerun audit again?');
                                        var title =  'Confirm audit action';
                                        $("#dialog-confirm-deletion").dialog({
                                            title: title,
                                            resizable: false,
                                            height: "auto",
                                            width: 550,
                                            modal: true,
                                            buttons: {  
                                                "Yes": function() {
                                                    $('#param-audit-model').val(node.parent.parent.title);
                                                    $('#param-audit-calc-group-id').val(node.parent.title);
                                                    $('#param-audit-calc-id').val(calculation_id);
                                                    $("#drwn_pg_1008_100016").remove();
                                                    drwn_sidebar_item_click('1008_136');
                                                    $("#dialog-confirm-deletion").addClass('hide');
                                                    $( this ).dialog( "close" );    
                                                },         
                                                "No": function() {
                                                    $("#dialog-confirm-deletion").addClass('hide');
                                                    $( this ).dialog( "close" );                    
                                                }
                                            }
                                        }); 
                                    }
                                }
                            }
                        }
                    }
                }
            } else if($(this).hasClass('calculation-title')){
                var calculation_id = $(this).attr('attr-id');
                if(key === 'rename'){             
                    var action = 'R';
                    var title = "Rename Calculation";
                    renameCalculation(calculation_id,action,title);
                }else if(key === 'copy'){
                    copyCalculation(calculation_id);
                }else if(key === 'remove'){                    
                    deleteCalculation(calculation_id, 'R');
                }else if(key === 'where-used'){                    
                    calculationWhereUsed(calculation_id);
                }else if(key === 'delete'){                    
                    deleteCalculation(calculation_id, 'D');
                }else if(key == 'audit') {
                    if(typeof($('#param-audit-query').val()) === 'undefined' || $('#param-audit-query').val() == '') {
                        $('#param-audit-model').val(getParamModelId());
                        $('#param-audit-calc-group-id').val(getParamCalcGroupId());
                        $('#param-audit-calc-id').val($(this).attr('attr-id'));
                        $("#drwn_pg_1008_100016").remove();
                        drwn_sidebar_item_click('1008_136');
                    } else {
                        if($('#param-audit-query').val() != '') {
                            $("#dialog-confirm-deletion").removeClass('hide');
                            $("#dialog-confirm-deletion").html('We\'ve detected that Audit page already has some audit results. Do you want to clear current result and rerun audit again?');
                            var title =  'Confirm audit action';
                            var calculation_id = $(this).attr('attr-id');
                            $("#dialog-confirm-deletion").dialog({
                                title: title,
                                resizable: false,
                                height: "auto",
                                width: 550,
                                modal: true,
                                buttons: {  
                                    "Yes": function() {
                                        $('#param-audit-model').val(getParamModelId());
                                        $('#param-audit-calc-group-id').val(getParamCalcGroupId());
                                        $('#param-audit-calc-id').val(calculation_id);
                                        $("#drwn_pg_1008_100016").remove();
                                        drwn_sidebar_item_click('1008_136');
                                        $("#dialog-confirm-deletion").addClass('hide');
                                        $( this ).dialog( "close" );    
                                    },         
                                    "No": function() {
                                        $("#dialog-confirm-deletion").addClass('hide');
                                        $( this ).dialog( "close" );                    
                                    }
                                }
                            }); 
                        }
                    }
                }
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
            "remove": {
                name: "Remove",
                icon: 'menu-remove',
                disabled: function(key, opt) {
                    if(!hasWriteAccess()){
                        return true;
                    }
                    return false;
                },
                visible: function(key, opt){        
                    // Hide this item if the menu was triggered on a div
                    if(opt.$trigger.context.parentElement.className.indexOf('unassigned') != -1) {
                        return false;
                    }
                    return true;
                }           
            },
            "where-used": {
                name: "Where-Used",
                icon: 'menu-where-used',
                disabled: function(key, opt) {
                    if(!hasWriteAccess()){
                        return true;
                    }
                    return false;
                },
                visible: function(key, opt){        
                    // Hide this item if the menu was triggered on a div
                    if(opt.$trigger.context.parentElement.className.indexOf('unassigned') != -1) {
                        return false;
                    }
                    return true;
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
            },
            "audit": {
                name: "Audit",
                icon: 'menu-audit'
            }
        }
    });
}

/**
 * Load Variable, Driver, Step Context Menu 
 */
function loadVariableDriverStepContextMenu() {
    $.contextMenu({
        selector: '.variable-title, .driver-title, .step-title',
        callback: function(key, options) {            
            if($(this).hasClass('fancytree-node')){
                var node = $.ui.fancytree.getNode(options.$trigger);
                if(node.getLevel() === 5){
                    var load_table = false;
                    if(typeof renameStep === 'undefined'){
                        load_table = true;
                    }
                    var calc_child_node =node.getParent();
                    var calc_node = calc_child_node.getParent();
                    if(calc_node.title !== getParamCalcId()){ // Check is different calc
                        load_table = true;
                    }
                    if((load_table || ($('.calculation-section').length <= 0) )){
                        if(key === 'audit'){
                            $('#param-audit-model').val(calc_node.parent.parent.title);
                            $('#param-audit-calc-group-id').val(calc_node.parent.title);
                            $('#param-audit-calc-id').val(calc_node.title);
                            $('#param-audit-variable-driver-step-id').val(node.title);
                            $("#drwn_pg_1008_100016").remove();
                            drwn_sidebar_item_click('1008_136');
                        }else{
                            $("#param-context-menu-action").val(key);
                            $("#param-context-menu-title").val(node.title);
                            $("#param-active-node-key").val(node.key);
                            setActiveNode(node.key);
                        }
                    }else{
                        if(node.parent.title === 'Drivers'){   
                            var driver_id = node.title;    
                            if(key === 'rename'){                                   
                                var action = 'R';
                                var title = "Rename Driver";                                
                                renameDriver(driver_id,action,title);
                            }else if(key === 'copy'){
                                copyDriver(driver_id);
                            }else if(key === 'delete'){                                                                  
                                if(driver_id !== ''){
                                    deleteDriver(driver_id);
                                }
                            }else if(key === 'audit'){
                                if(typeof($('#param-audit-query').val()) === 'undefined' || $('#param-audit-query').val() == '') {   
                                    $('#param-audit-model').val(getParamModelId());
                                    $('#param-audit-calc-group-id').val(getParamCalcGroupId());
                                    $('#param-audit-calc-id').val(calc_node.title);
                                    $('#param-audit-variable-driver-step-id').val(node.title);
                                    $("#drwn_pg_1008_100016").remove();
                                    drwn_sidebar_item_click('1008_136');
                                } else {
                                    if($('#param-audit-query').val() != '') {
                                        $("#dialog-confirm-deletion").removeClass('hide');
                                        $("#dialog-confirm-deletion").html('We\'ve detected that Audit page already has some audit results. Do you want to clear current result and rerun audit again?');
                                        var title =  'Confirm audit action';
                                        $("#dialog-confirm-deletion").dialog({
                                            title: title,
                                            resizable: false,
                                            height: "auto",
                                            width: 550,
                                            modal: true,
                                            buttons: {  
                                                "Yes": function() {               
                                                    $('#param-audit-model').val(getParamModelId());
                                                    $('#param-audit-calc-group-id').val(getParamCalcGroupId());
                                                    $('#param-audit-calc-id').val(calc_node.title);
                                                    $('#param-audit-variable-driver-step-id').val(node.title);
                                                    $("#drwn_pg_1008_100016").remove();
                                                    drwn_sidebar_item_click('1008_136');
                                                    $("#dialog-confirm-deletion").addClass('hide');
                                                    $( this ).dialog( "close" );    
                                                },         
                                                "No": function() {
                                                    $("#dialog-confirm-deletion").addClass('hide');
                                                    $( this ).dialog( "close" );                    
                                                }
                                            }
                                        }); 
                                    }
                                }
                            }
                        }else if(node.parent.title === 'Steps'){   
                            var step_id = node.title;                
                            if(key === 'rename'){
                                renameStep(step_id,'R','Rename Step');
                            }else if(key === 'copy'){                 
                                renameStep(step_id,'C','Copy Step');
                            }else if(key === 'delete'){     
                                deleteStep(step_id);                                   
                            }else if(key === 'audit'){
                                if(typeof($('#param-audit-query').val()) === 'undefined' || $('#param-audit-query').val() == '') {  
                                    $('#param-audit-model').val(getParamModelId());
                                    $('#param-audit-calc-group-id').val(getParamCalcGroupId());
                                    $('#param-audit-calc-id').val(calc_node.title);
                                    $('#param-audit-variable-driver-step-id').val(node.title);
                                    $("#drwn_pg_1008_100016").remove();
                                    drwn_sidebar_item_click('1008_136');
                                } else {
                                    if($('#param-audit-query').val() != '') {
                                        $("#dialog-confirm-deletion").removeClass('hide');
                                        $("#dialog-confirm-deletion").html('We\'ve detected that Audit page already has some audit results. Do you want to clear current result and rerun audit again?');
                                        var title =  'Confirm audit action';
                                        $("#dialog-confirm-deletion").dialog({
                                            title: title,
                                            resizable: false,
                                            height: "auto",
                                            width: 550,
                                            modal: true,
                                            buttons: {  
                                                "Yes": function() {               
                                                    $('#param-audit-model').val(getParamModelId());
                                                    $('#param-audit-calc-group-id').val(getParamCalcGroupId());
                                                    $('#param-audit-calc-id').val(calc_node.title);
                                                    $('#param-audit-variable-driver-step-id').val(node.title);
                                                    $("#drwn_pg_1008_100016").remove();
                                                    drwn_sidebar_item_click('1008_136');
                                                    $("#dialog-confirm-deletion").addClass('hide');
                                                    $( this ).dialog( "close" );    
                                                },         
                                                "No": function() {
                                                    $("#dialog-confirm-deletion").addClass('hide');
                                                    $( this ).dialog( "close" );                    
                                                }
                                            }
                                        }); 
                                    }
                                }
                            }
                        }
                    }
                }
            }else if($(this).hasClass('variable-title')){
                if(key === 'rename'){
                    var from_variable_id = $(this).attr('attr-id');
                    var action = 'R';
                    var title = "Rename Variable";
                    renameVariable(from_variable_id,action,title);
                }else if(key === 'copy'){
                    copyVariable(this);
                }else if(key === 'delete'){
                    var variable_id = $(this).attr('attr-id');
                    deleteVariable(variable_id);
                }else if(key === 'audit'){
                    if(typeof($('#param-audit-query').val()) === 'undefined' || $('#param-audit-query').val() == '') { 
                        var variable_id = $(this).attr('attr-id');
                        $('#param-audit-model').val(getParamModelId());
                        $('#param-audit-calc-group-id').val(getParamCalcGroupId());
                        $('#param-audit-calc-id').val(getParamCalcId());
                        $('#param-audit-variable-driver-step-id').val(variable_id);
                        $("#drwn_pg_1008_100016").remove();
                        drwn_sidebar_item_click('1008_136');
                    } else {
                        if($('#param-audit-query').val() != '') {
                            $("#dialog-confirm-deletion").removeClass('hide');
                            $("#dialog-confirm-deletion").html('We\'ve detected that Audit page already has some audit results. Do you want to clear current result and rerun audit again?');
                            var title =  'Confirm audit action';
                            var variable_id = $(this).attr('attr-id');
                            $("#dialog-confirm-deletion").dialog({
                                title: title,
                                resizable: false,
                                height: "auto",
                                width: 550,
                                modal: true,
                                buttons: {  
                                    "Yes": function() {             
                                        $('#param-audit-model').val(getParamModelId());
                                        $('#param-audit-calc-group-id').val(getParamCalcGroupId());
                                        $('#param-audit-calc-id').val(getParamCalcId());
                                        $('#param-audit-variable-driver-step-id').val(variable_id);
                                        $("#drwn_pg_1008_100016").remove();
                                        drwn_sidebar_item_click('1008_136');
                                        $("#dialog-confirm-deletion").addClass('hide');
                                        $( this ).dialog( "close" );    
                                    },         
                                    "No": function() {
                                        $("#dialog-confirm-deletion").addClass('hide');
                                        $( this ).dialog( "close" );                    
                                    }
                                }
                            }); 
                        }
                    }
                }
            }else if($(this).hasClass('driver-title')){
                var driver_id = $(this).attr('attr-id');
                if(key === 'rename'){                    
                    var action = 'R';
                    var title = "Rename Driver";
                    renameDriver(driver_id,action,title);
                }else if(key === 'copy'){
                    copyDriver(driver_id);
                }else if(key === 'delete'){
                    if(driver_id !== '' ){
                        deleteDriver(driver_id);
                    }
                }else if(key === 'audit'){
                    if(typeof($('#param-audit-query').val()) === 'undefined' || $('#param-audit-query').val() == '') { 
                        $('#param-audit-model').val(getParamModelId());
                        $('#param-audit-calc-group-id').val(getParamCalcGroupId());
                        $('#param-audit-calc-id').val(getParamCalcId());
                        $('#param-audit-variable-driver-step-id').val(driver_id);
                        $("#drwn_pg_1008_100016").remove();
                        drwn_sidebar_item_click('1008_136');
                    } else {
                        if($('#param-audit-query').val() != '') {
                            $("#dialog-confirm-deletion").removeClass('hide');
                            $("#dialog-confirm-deletion").html('We\'ve detected that Audit page already has some audit results. Do you want to clear current result and rerun audit again?');
                            var title =  'Confirm audit action';
                            $("#dialog-confirm-deletion").dialog({
                                title: title,
                                resizable: false,
                                height: "auto",
                                width: 550,
                                modal: true,
                                buttons: {  
                                    "Yes": function() {             
                                        $('#param-audit-model').val(getParamModelId());
                                        $('#param-audit-calc-group-id').val(getParamCalcGroupId());
                                        $('#param-audit-calc-id').val(getParamCalcId());
                                        $('#param-audit-variable-driver-step-id').val(driver_id);
                                        $("#drwn_pg_1008_100016").remove();
                                        drwn_sidebar_item_click('1008_136');
                                        $("#dialog-confirm-deletion").addClass('hide');
                                        $( this ).dialog( "close" );    
                                    },         
                                    "No": function() {
                                        $("#dialog-confirm-deletion").addClass('hide');
                                        $( this ).dialog( "close" );                    
                                    }
                                }
                            }); 
                        }
                    }
                }
            }else if($(this).hasClass('step-title')){                
                var step_id = $(this).attr('attr-id');                
                if(key === 'rename'){
                    renameStep(step_id,'R','Rename Step');
                }else if(key === 'copy'){                 
                    renameStep(step_id,'C','Copy Step');
                }else if(key === 'delete'){     
                    deleteStep(step_id);                                   
                }else if(key === 'audit'){
                    if(typeof($('#param-audit-query').val()) === 'undefined' || $('#param-audit-query').val() == '') {
                        $('#param-audit-model').val(getParamModelId());
                        $('#param-audit-calc-group-id').val(getParamCalcGroupId());
                        $('#param-audit-calc-id').val(getParamCalcId());
                        $('#param-audit-variable-driver-step-id').val(step_id);
                        $("#drwn_pg_1008_100016").remove();
                        drwn_sidebar_item_click('1008_136');
                    } else {
                        if($('#param-audit-query').val() != '') {
                            $("#dialog-confirm-deletion").removeClass('hide');
                            $("#dialog-confirm-deletion").html('We\'ve detected that Audit page already has some audit results. Do you want to clear current result and rerun audit again?');
                            var title =  'Confirm audit action';
                            $("#dialog-confirm-deletion").dialog({
                                title: title,
                                resizable: false,
                                height: "auto",
                                width: 550,
                                modal: true,
                                buttons: {  
                                    "Yes": function() {             
                                        $('#param-audit-model').val(getParamModelId());
                                        $('#param-audit-calc-group-id').val(getParamCalcGroupId());
                                        $('#param-audit-calc-id').val(getParamCalcId());
                                        $('#param-audit-variable-driver-step-id').val(step_id);
                                        $("#drwn_pg_1008_100016").remove();
                                        drwn_sidebar_item_click('1008_136');
                                        $("#dialog-confirm-deletion").addClass('hide');
                                        $( this ).dialog( "close" );    
                                    },         
                                    "No": function() {
                                        $("#dialog-confirm-deletion").addClass('hide');
                                        $( this ).dialog( "close" );                    
                                    }
                                }
                            }); 
                        }
                    }
                }
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
            },
            "audit": {
                name: "Audit",
                icon: 'menu-audit'
            }
        }
    });
}