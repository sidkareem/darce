$(document).ready(function() {
    $('.copy-config-main-section .styled').uniform();
    loadEnvironment('#copy-config-source-field', true);    
    loadEnvironment('#copy-config-target-field', true);
    loadEnvironment('#convert-config-source-field', true);    
    loadEnvironment('#delete-config-environment-field', true);
    var promise = new Promise((res, rej) => {
        loadEnvironment('#convert-config-target-field', true);        
        res('');
    });
    promise.then(() => {
        $('#convert-config-target-field').trigger('change');
    });
});

// Check copy config validation
function checkCopyConfigValidation(source, target, target_el, equal_state = false) {
    try {
        $(target_el).closest('.target-field').find('.text-red').remove();
        var flag = true;
        if(target !== null) {
            var ID = target;
            //ID = ID.toUpperCase();
            //$(target_el).val(ID)
            var primaryIdRegExp = /^[A-Z]+[A-Z0-9_]*$/g;    
            if(ID === '') {
                $(target_el).closest('.target-field').find('.text-red').remove();
                flag = false;
            }
            else if(ID.length > 32) {
                ID = ID.substring(0,32);
                var validationMessage = 'Please enter no more than 32 characters for the ID.';
                $(target_el).closest('.target-field').append('<span class="text-red">'+validationMessage+'<span>');
                flag = false;
            }
            // else if(!ID.match(primaryIdRegExp)) {
            //     var validationMessage = 'First character of the ID should be A-Z. <br />Only A-Z characters, 0-9 numbers <br /> underscore "_" character are accepted';
            //     $(target_el).closest('.target-field').append('<span class="text-red">'+validationMessage+'<span>');
            //     flag = false;
            // }
            else if(source === '') {
                flag = false;
            }
            else if(source === target && equal_state) {
                flag = false;
            }
        } else {
            $(target_el).closest('.target-field').find('.text-red').remove();
            //flag = false;
        }
    
        return flag;
    } catch (error) {
        displayCatchError('copy-config-error');
        return false;
    }
}

$('#copy-config-source-field, #copy-config-target-field').on('change', function() {
    $('.copy-config-result .text-success').fadeOut();
    var source = $('#copy-config-source-field').val();
    var target = $('#copy-config-target-field').val();
    var target_el = $('#copy-config-target-field');
    flag = checkCopyConfigValidation(source, target, target_el, true);    
    if(flag) {
        $('.copy-config-main-section .copy-tab-pane fieldset > button').addClass('btn-primary').removeClass('btn-default-grey');
    } else {
        $('.copy-config-main-section .copy-tab-pane fieldset > button').removeClass('btn-primary').addClass('btn-default-grey');
    }
});

$('#convert-config-source-field, #convert-config-target-field').on('change', function() {
    $('.convert-config-result .text-success').fadeOut();
    var source = $('#convert-config-source-field').val();
    var target = $('#convert-config-target-field').val();
    var target_el = $('#convert-config-target-field');
    flag = checkCopyConfigValidation(source, target, target_el);
    if(flag) {
        $('.copy-config-main-section .convert-tab-pane fieldset > button').addClass('btn-primary').removeClass('btn-default-grey');
    } else {
        $('.copy-config-main-section .convert-tab-pane fieldset > button').removeClass('btn-primary').addClass('btn-default-grey');
    }
});

$('#delete-config-environment-field').on('change', function() {
    $('.delete-config-result .text-success').fadeOut();
    if($(this).val() !== "") {
        $('.copy-config-main-section .delete-tab-pane fieldset > button').addClass('btn-primary').removeClass('btn-default-grey');
    } else {
        $('.copy-config-main-section .delete-tab-pane fieldset > button').removeClass('btn-primary').addClass('btn-default-grey');
    }
});

$('.copy-config-form .btn-submit').on('click', function(e) {
    e.preventDefault();
    $('#copy-config-source-field').trigger('change');    
    if($(this).hasClass('btn-primary')) {
        var form_values = getArrayKeyValuePair($(this).closest('form').serializeArray(), false);        
        confirmDeletionDialog(`<p>Are you sure want to copy DarCE configurations from ${form_values.SourceEnvironment} to ${form_values.TargetEnvironment}?</p>`, confirmCopyConfig, form_values, 'Confirm copy action');
    }
});

$('.convert-config-form .btn-submit').on('click', function(e) {
    e.preventDefault();
    $('#convert-config-source-field').trigger('change');
    if($(this).hasClass('btn-primary')) {
        var form_values = getArrayKeyValuePair($(this).closest('form').serializeArray(), false);
        confirmDeletionDialog(`<p>Are you sure want to convert DarCE configurations from ${form_values.SourceEnvironment} to ${form_values.TargetEnvironment}?</p>`, confirmConvertConfig, form_values, 'Confirm convert action');
    }
});

$('.delete-config-form .btn-submit').on('click', function() {
    $('#delete-config-environment-field').trigger('change');
    if($(this).hasClass('btn-primary')) {
        var environment = $('#delete-config-environment-field').val();
        var form_values = getArrayKeyValuePair($(this).closest('form').serializeArray(), false);        
        confirmDeletionDialog(`<span class="text-red">Warning: This action cannot be reverted!</span><p>Are you sure want to delete DarCE configurations in ${environment}?</p>`, confirmDeleteConfig, form_values, 'Confirm delete action');
    }
});

// Refresh copy config data
function copyConfigClearRefreshData(targetEnvironment) { 
    setLocalStorage('CALC_REFRESH_TIME','',true, targetEnvironment);
    setLocalStorage('CALCGROUP_REFRESH_TIME','',true, targetEnvironment);
    setLocalStorage('MODEL_REFRESH_TIME','',true, targetEnvironment);
    setLocalStorage('PROPERTIES_REFRESH_TIME','',true, targetEnvironment);
    setLocalStorage('FANCYTREE_REFRESH_TIME','',true, targetEnvironment);
    setIndexedDBStorage('fancytree-structure', '', true, targetEnvironment);
}

// Confirm copy config
function confirmCopyConfig(form_values = []) {
    if(!$.isEmptyObject(form_values)) {
        loader('show',false);
        setTimeout(function() {       
            try {
                form_values.DeleteZRecords = (form_values.data_option == 0)?'':'z';        
                var response = WsCopyEnvironmentBind(form_values);
                if(response == 0) {            
                    if(getEnvironment() === form_values.TargetEnvironment) {
                        $("#drwn_pg_1008_100010").remove();
                    }
                    $('.copy-config-result').html('<span class="text-success"><i class="icon-checkmark3"></i> Copy configurations was successful!</span>');
                    $('#copy-config-target-field').val('').select2();
                    copyConfigClearRefreshData(form_values.TargetEnvironment);
                }else{
                    $('.copy-config-result').html('<span class="text-red"><i class="icon-cross2"></i> Copy configurations failed with Error code = '+response+'</span>');
                }
            } catch (error) {
                displayCatchError('copy-config-error');
                return false;
            }  
            loader('hide');
        },1);
    }
}

// Confirm convert config
function confirmConvertConfig(form_values = []) {
    if(!$.isEmptyObject(form_values)) {
        loader('show',false);
        setTimeout(function() {
            try {
                var response = WsConvEnvironmentBind(form_values);
                if(response == 0) {            
                    if(getEnvironment() === form_values.TargetEnvironment) {
                        $("#drwn_pg_1008_100010").remove();
                    }
                    $('#convert-config-source-field, #convert-config-target-field').val('');
                    $('#convert-config-source-field, #convert-config-target-field').select2();
                    $('.convert-config-result').html('<span class="text-success"><i class="icon-checkmark3"></i> Conversion of Configuration was successful!</span>');
                    copyConfigClearRefreshData(form_values.TargetEnvironment);
                } else {
                    $('.convert-config-result').html('<span class="text-red"><i class="icon-cross2"></i> Conversion of Configuration failed with Error code = '+response+'</span>');
                }
            } catch (error) {
                displayCatchError('convert-config-error');
                return false;
            }
            loader('hide');
        },1);
    }
}

// Confirm delete config
function confirmDeleteConfig(form_values = []) {    
    if(!$.isEmptyObject(form_values)) {
        loader('show',false);
        setTimeout(function() { 
            try {
                var response = WsDeleteEnvironmentBind(form_values); 
                if(response == 0) { 
                    removeEnvCache(form_values.TargetEnvironment);            
                    if(getEnvironment() === form_values.TargetEnvironment) {
                        $("#drwn_pg_1008_100010").remove();
                    }
                    $('#delete-config-environment-field').val('').select2().trigger('change');
                    $('.delete-config-result').html('<span class="text-success"><i class="icon-checkmark3"></i> Configuration was successfully deleted!</span>');
                    copyConfigClearRefreshData(form_values.TargetEnvironment);
                }else{
                    $('.delete-config-result').html('<span class="text-red"><i class="icon-cross2"></i> Delete Configuration failed with Error code = '+response+'</span>');
                }
            } catch (error) {
                displayCatchError('delete-config-error');
                return false;
            }
            loader('hide');
        },1);   
    }
}

// Get copy config item data
function getCopyConfigItemData(requestData) {
    var request = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="urn:sap-com:document:sap:soap:functions:mc-style">
                <soap:Header/>
                <soap:Body>
                <tns:ZdarCopyEnvironment>
                        <DelEnvironmentOnly></DelEnvironmentOnly>
                        <DeleteZRecords>${requestData['DeleteZRecords']}</DeleteZRecords>
                        <SourceEnvironment>${requestData['SourceEnvironment']}</SourceEnvironment>
                        <TargetEnvironment>${requestData['TargetEnvironment']}</TargetEnvironment>
                </tns:ZdarCopyEnvironment>
                </soap:Body>
                </soap:Envelope>`;
    return request;
}

// Get copy convert item data
function getCopyConvertItemData(requestData) {
    var request = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="urn:sap-com:document:sap:soap:functions:mc-style">
                    <soap:Header/>
                    <soap:Body>
                    <tns:ZdarConvEnvironment>
                        <SourceEnvironment>${requestData['SourceEnvironment']}</SourceEnvironment>
                        <TargetEnvironment>${requestData['TargetEnvironment']}</TargetEnvironment>
                    </tns:ZdarConvEnvironment>
                    </soap:Body>
                    </soap:Envelope>`;
    return request;
}

// Get delete config item data
function getDeleteConfigItemData(requestData) {
    var request = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="urn:sap-com:document:sap:soap:functions:mc-style">
                <soap:Header/>
                <soap:Body>
                <tns:ZdarCopyEnvironment>
                        <DelEnvironmentOnly>Y</DelEnvironmentOnly>
                        <DeleteZRecords></DeleteZRecords>
                        <SourceEnvironment></SourceEnvironment>
                        <TargetEnvironment>${requestData['TargetEnvironment']}</TargetEnvironment>
                </tns:ZdarCopyEnvironment>
                </soap:Body>
                </soap:Envelope>`;
    return request;
}
