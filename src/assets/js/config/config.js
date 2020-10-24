function getConfig(key) {
    if (!key) {
        key = '';
    }
    var config = [];

    //Webservice URL's
    config['zdar_calc_engine_bind'] = 'zdar_calc_engine_svc/%client_no%/zdar_calc_engine_svcn/zdar_calc_engine_bind';

    //Webservice URL's

    config['driver_types'] = [{ 'name': 'CUBE', 'value': 'CUBE_DATA' },
    { 'name': 'MASTER', 'value': 'MASTER_DATA' },
    { 'name': 'HIER', 'value': 'HIER_DATA' },
    { 'name': 'SPREAD', 'value': 'SPREAD_DATA' },
    { 'name': 'FIRST_CP', 'value': 'FIRST_CP' }
    ];

    config['environment'] = getEnvironment();
    config['logged_user'] = 'Test CG';
    config['cache_version'] = 'v.1.2.platform.beta.20191230';
    config['development_mode'] = 'off';

    if (key !== '') {
        return config[key];
    }
    return config;
}

function displayCatchError(msgID, code) {
    if(code == undefined){
        code = '';
    }
    if($('#param-webservice-error').val() !== '') { return; }
    switch (msgID) {
        case 'indexeddb-storage-error':
            alert('IndexedDB may not work properly. Please hard refresh your browser and try again.');
            break;
        case 'driver-types':
            alert('Driver types may not work properly because driver type meta data was either missing or incorrect.');
            break;
        case 'environment-list':
            alert('Environment list may not work properly because environment meta data was either missing or not downloaded successfully.');
            break;
        case 'datasource-list':
            alert('Datasource list may not work properly because datasource meta data was either missing or not downloaded successfully.');
            break;
        case 'calc-group-list':
            alert('Calc group list may not work properly because calc group meta data was either missing or not downloaded successfully.');
            break;
        case 'user-list':
            alert('User list may not work properly because user meta data was either missing or not downloaded successfully.');
            break;
        case 'dimension-list':
            alert('Dimension list may not work properly because dimension meta data was either missing or not downloaded successfully.');
            break;
        case 'property-list':
            alert('Property list may not work properly because property meta data was either missing or not downloaded successfully.');
            break;
        case 'sidebar-calc-group-list':
            alert('Sidebar calc group list may not work properly because calc group meta data was either missing or not downloaded successfully.');
            break;
        case 'sidebar-calc-list-error':
            alert('Sidebar calculation list may not work properly because calculation meta data was either missing or not downloaded successfully.');
            break;
        case 'calc-header-data':
            alert('Calc header data may not load properly because calc header meta data was either missing or not downloaded successfully.');
            break;
        case 'calc-driver-data':
            alert('Calc driver data may not load properly because calc driver meta data was either missing or not downloaded successfully.');
            break;
        case 'calc-step-data':
            alert('Calc step data may not load properly because calc step meta data was either missing or not downloaded successfully.');
            break;
        case 'step-rename-error':
            alert('Step rename/copy form may not load properly because calc step meta data was either missing or not downloaded successfully.');
            break;
        case 'driver-rename-error':
            alert('Driver rename/copy may not work properly because driver meta data was either missing or not downloaded successfully.');
            break;
        case 'delete-step-error':
            alert('Step deletion may not work properly because step meta data was either missing or incorrect.');
            break;
        case 'add-driver-form-error':
            alert('Driver add may not work properly because syntax highlighting was either initialized more than once or not initialized correctly.');
            break;
        case 'add-step-form-error':
            alert('Step add may not work properly because syntax highlighting was either initialized more than once or not initialized correctly.');
            break;
        case 'delete-driver-error':
            alert('Driver deletion may not work properly because driver meta data was either missing or incorrect.');
            break;
        case 'driver-save-error':
            alert('Driver data save may not work properly because driver meta data was either missing or incorrect.');
            break;
        case 'step-save-error':
            alert('Step data save may not work properly because step meta data was either missing or incorrect.');
            break;
        case 'fancytree-load-incomplete':
            alert('Fancytree may not load properly because fancytree meta data was either missing or incorrect.');
            break;
        case 'fancytree-data':
            alert('Fancytree may not work properly because fancytree meta data was either missing or not downloaded successfully.');
            break;
        case 'fancytree-activate-error':
            alert('Fancytree activate may not work properly because fancytree meta key was either missing or incorrect.');
            break;
        case 'calculation-from-fancytree':
            alert('Calculation list may not load properly because fancytree meta data was either missing or not downloaded successfully.');
            break;
        case 'calc-group-table':
            alert('Calc group table may not work properly because calc group meta data was either missing or not downloaded successfully.');
            break;
        case 'datasource-table':
            alert('Datasource table may not work properly because datasource meta data was either missing or not downloaded successfully.');
            break;
        case 'calc-group-data':
            alert('Calc group may not work properly because calc group meta data was either missing or not downloaded successfully.');
            break;
        case 'cg-header-data':
            alert('Calc group header may not load properly because calc group header meta data was either missing or not downloaded successfully.');
            break;
        case 'cg-dobject-data':
            alert('Calc group datasource may not load properly because calc group datasource meta data was either missing or not downloaded successfully.');
            break;
        case 'cg-datasource-tab-data':
            alert('Calc group datasource may not load properly because dimension meta data was either missing or not downloaded successfully.');
            break;
        case 'cg-variable-data':
            alert('Calc group variable may not load properly because calc group variable meta data was either missing or not downloaded successfully.');
            break;
        case 'cg-calc-data':
            alert('Calculation may not load properly because calculation meta data was either missing or not downloaded successfully.');
            break;
        case 'calc-where-used-error':
            alert('Calculation where used may not work properly because calc group meta data was either missing or not downloaded successfully.');
            break;
        case 'add-datasource-form-error':
            alert('Datasource form may not work properly because syntax highlighting was either initialized more than once or not initialized.');
            break;
        case 'delete-calc-group-error':
            alert('Calc group deletion may not work properly because calc group meta data was either missing or incorrect.');
            break;
        case 'delete-variable-error':
            alert('Variable deletion may not work properly because variable meta data was either missing or not downloaded successfully.');
            break;
        case 'rename-calc-group-error':
            alert('Calc group rename may not work properly because calc group meta data was either missing or not downloaded successfully.');
            break;
        case 'add-existing-calculation-form-error':
            alert('Existing calculation add may not work properly because datasource meta data was either missing or not downloaded successfully.');
            break;
        case 'add-calculation-form-error':
            alert('Calculation add may not work properly because datasource meta data was either missing or not downloaded successfully.');
            break;
        case 'edit-datasource-error':
            alert('Datasource update may not work properly because datasource data was either missing or incorrect.');
            break;
        case 'rename-calculation-error':
            alert('Calculation rename/copy may not work properly because calculation meta data was either missing or not downloaded successfully.');
            break;
        case 'rename-datasource-error':
            alert('Datasource rename/copy may not work properly because datasource meta data was either missing or not downloaded successfully.');
            break;
        case 'remove-datasource-error':
            alert('Datasource remove may not work properly because calc group datasource meta data was either missing or not downloaded successfully.');
            break;
        case 'datasource-data':
            alert('Datasource may not load properly because datasource meta data was either missing or not downloaded successfully.');
            break;
        case 'environment-data':
            alert('Environment data may not load properly because environment meta data was either missing or not downloaded successfully.');
            break;
        case 'delete-calculation-error':
            alert('Calculation deletion/remove may not work properly because calculation meta data was either missing or not downloaded successfully.');
            break;
        case 'delete-datasource-error':
            alert('Datasource deletion may not work properly because datasource meta data was either missing or not downloaded successfully.');
            break;
        case 'datasource-remove':
            alert('Datasource remove may not work properly because calc group datasource meta data was either missing or not downloaded successfully.');
            break;
        case 'add-variable-form-error':
            alert('Variable add may not work properly because syntax highlighting was either initialized more than once or not initialized correctly.');
            break;
        case 'variable-save-error':
            alert('Variable save may not work properly because variable datas was either missing or incorrect.');
            break;
        case 'datasource-save-error':
            alert('Datasource save may not work properly because datasource datas was either missing or incorrect.');
            break;
        case 'calculation-save-error':
            alert('Calculation save may not work properly because calculation datas was either missing or incorrect.');
            break;
        case 'calc-group-save-error':
            alert('Calc group save may not work properly because calc group datas was either missing or incorrect.');
            break;
        case 'existing-calculation-save-error':
            alert('Existing calculation save may not work properly because existing calculation datas was either missing or incorrect.');
            break;
        case 'rename-variable-error':
            alert('Variable rename/copy may not work properly because variable meta data was either missing or not downloaded successfully.');
            break;
        case 'helptext-error':
            alert('Help text may not work properly because help text data was either missing or not downloaded successfully.');
            break;
        case 'back-navigation':
            alert('Back action may not work properly because fancytree meta key was either missing or incorrect.');
            break;
        case 'save-calc-group':
            alert('Calc group save action may not work properly because calc group/dobject/calculation data was either missing or incorrect.');
            break;
        case 'calculation-table':
            alert('Calculation table may not work properly because calculation meta data was either missing or not downloaded successfully.');
            break;
        case 'variable-table':
            alert('Variable table may not work properly because variable meta data was either missing or not downloaded successfully.');
            break;
        case 'debugger-query-table':
            alert('Debugger table may not work properly because debugger meta data was either missing or not downloaded successfully.');
            break;
        case 'iv-table':
            alert('Installed versions table may not work properly because installed version meta data was either missing or not downloaded successfully.');
            break;
        case 'calculation-driver-table':
            alert('Calculation driver table may not work properly because calculation driver meta data was either missing or not downloaded successfully.');
            break;
        case 'calculation-step-table':
            alert('Calculation step table may not work properly because calculation step meta data was either missing or not downloaded successfully.');
            break;
        case 'users-table':
            alert('Users table may not load properly because user meta data was either missing or not downloaded successfully.');
            break;
        case 'environment-change':
            alert('Change environment may not work properly because environment meta data was either missing or not downloaded successfully.');
            break;
        case 'user-data':
            alert('User data may not load properly because user meta data was either missing or not downloaded successfully.');
            break;
        case 'cm-error':
            alert('Syntax highlighting may not work properly because it was either initialized more than once or not initialized correctly.');
            break;
        case 'context-menu-error':
            alert('Context menu may not work properly because it was either initialized more than once or not initialized correctly.');
            break;
        case 'timestamp-form-error':
            alert('DarCE Rewind may not work properly because timestamp date/time was either missing or incorrect.');
            break;
        case 'copy-config-error':
            alert('Copy config action may not work properly because environment data was either missing or incorrect.');
            break;
        case 'convert-config-error':
            alert('Convert config action may not work properly because environment data was either missing or incorrect.');
            break;
        case 'delete-config-error':
            alert('Delete config action may not work properly because environment data was either missing or incorrect.');
            break;
        case 'audit-table-error':
            alert('Audit table may not work properly because table data was either missing or incorrect.');
            break;
        case 'debugger-query-error':
            alert('Debugger query may not work properly because debugger query meta data was either missing or incorrect.');
            break;
        case 'save-action-error':
            alert('Save action may not work properly because required data was either missing or incorrect.');
            break;
        case 'timestamp-error':
            alert('Local storage update may not work properly because timestamp meta data was either missing or not downloaded successfully.');
            break;
        case 'calc-group-local-storage-error':
            alert('Calculation group detail local storage update may not work properly because calc group meta data was either missing or not downloaded successfully.');
            break;
        case 'calc-local-storage-error':
            alert('calc detail local storage update may not work properly because calculation meta data was either missing or not downloaded successfully.');
            break;
        case 'popover-error':
            alert('Popover may not work properly because popover meta data was either missing or not downloaded successfully.');
            break;
        case 'maintenance':
            alert('The server is temporarily unable to service your request due to maintenance downtime or capacity problems. Please try again later');
            break;
        case 'unauthorized':
            alert('Unauthorized webservice call '+ code +'.Please try again later');
            setWebserviceOffline();
            break;
        default:
            alert('The web service call cannot reach the server. Please check your network connectivity and try again. If this issue continues to happen, please contact your technical support team for further assistance.');
            setWebserviceOffline();
            break;
    }
    removeSpin('');
}