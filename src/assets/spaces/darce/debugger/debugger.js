
$(function() {
    $('#debugger-calc-group-parameters-list').select2();
    $("input[type=file]").on('change', function() {
        alert(this.files[0].name);
    });
    loadEnvironment('#debugger-environment-field');
    listModelOptions('#debugger-model-field');
    loadDebuggerScript();
    $('.styled').uniform();
    $(".modal").draggable({
        handle: ".modal-header",
    });
    $('#debugger-model-field, .debugger-query-parameters-table .select2').select2({
        minimumResultsForSearch: Infinity    
    });
    listModelOptions('.debugger-query-parameters-table [name=OUTPUT_MINI_CUBES]', '', [{value:'NO',option:'NO'},{value:'%%ALL%%',option:'%%ALL%%'}]);
    listModelOptions('.debugger-query-parameters-table [name=OUTPUT_RESULTS]', '', [{value:'NO',option:'NO'},{value:'%%ALL%%',option:'%%ALL%%'}]);
    listModelOptions('.debugger-query-parameters-table [name=OUTPUT_WRITE_BACK_TBLS]', '', [{value:'NO',option:'NO'},{value:'%%ALL%%',option:'%%ALL%%'}, {value:'%%SNAP%%',option:'%%SNAP%%'}, {value:'%%DELTA%%',option:'%%DELTA%%'}]);
    $('.debugger-query-parameters-table select.datasource-list').multiselect({
        nonSelectedText: 'Default = &lt;blank&gt;',
        // enableFiltering: true,
        // enableCaseInsensitiveFiltering: true
    });   
    getOverallCalcList();
});

// Escape regular expression
function escapeRegExp(string){
    return string.replace(new RegExp('/[.*+?^${}()|[\]\\]', 'g'), '\\$&');
}

// Replace string
function replaceAll(str, term, replacement) {
    return str.replace(new RegExp(escapeRegExp(term), 'g'), replacement);
}

$('.debugger-content #output > .tab-content').scroll(function (event) {
    $(this).find('.active').attr('scroll-pos', $(this).scrollTop());
    return false;
});

// Get skeleton script
function getSkeletonScript(name) {
    switch (name) {
        case "darce":
            return '*XDIM_MEMBERSET [dimension] = [members]\n' +
                '*XDIM_MEMBERSET [dimension] = [members]\n' +
                '\n' +
                '*START_BADI DARCE\n' +
                'QUERY = OFF\n' +
                'CALC_GROUP_ID = [calc groups]\n' +
                'DEBUG_Y_N = Y\n' +
                'LARGE_DATASET_Y_N = Y\n' +
                'DARCE_DIRECT_WRITE_Y_N = Y\n' +
                'DARCE_VERSION = 6.2\n' +
                '*END_BADI\n'
            break;
        case "copy":
            return '*START_BADI DARCE\n' +
                'QUERY = OFF\n' +
                'DARCE_FUNCTION=COPY\n' +
                'USE_OPEN_REQUEST=Y\n' +
                'PROCESS_COMMENTS=Y\n' +
                'FROM:[source dimension]=[source member]\n' +
                'TO:[target dimension]=[target member]\n' +
                '*END_BADI'
            break;
        case "move":
            return '*START_BADI DARCE\n' +
                'QUERY = OFF\n' +
                'DARCE_FUNCTION=MOVE\n' +
                'USE_OPEN_REQUEST=Y\n' +
                'PROCESS_COMMENTS=Y\n' +
                'FROM:[source dimension]=[source member]\n' +
                'TO:[target dimension]=[target member]\n' +
                '*END_BADI'
            break;
        case "clear":
            return '*START_BADI DARCE\n' +
                'QUERY = OFF\n' +
                'DARCE_FUNCTION=CLEAR\n' +
                'USE_OPEN_REQUEST=Y\n' +
                'PROCESS_COMMENTS=Y\n' +
                'FROM:[dimension]=[member]\n' +
                '*END_BADI'
    }

}

var DarCEDebuggerVisible = true;

// Clicky
function clicky() {
    DarCEDebuggerVisible = !DarCEDebuggerVisible;
    if (DarCEDebuggerVisible) {
        $("#settings").show();
    } else {
        $("#settings").hide();
    }
}

// Get DarCE script
function getDarCEScript() {
    runDebuggerScriptModal('', '', true);
}

// Get copy script
function getCopyScript() {
    $("#script").val(getSkeletonScript("copy"));
    $("#script-default").val(getSkeletonScript("copy"));
    $('.debugger-content .debugger-run-simulation, .debugger-content .debugger-temporary-data, .debugger-content .debugger-sql-queries').trigger('change');
}

// Get move script
function getMoveScript() {
    $("#script").val(getSkeletonScript("move"));
    $("#script-default").val(getSkeletonScript("move"));
    $('.debugger-content .debugger-run-simulation, .debugger-content .debugger-temporary-data, .debugger-content .debugger-sql-queries').trigger('change');
}

// Get clear script
function getClearScript() {
    $("#script").val(getSkeletonScript("clear"));
    $("#script-default").val(getSkeletonScript("clear"));
    $('.debugger-content .debugger-run-simulation, .debugger-content .debugger-temporary-data, .debugger-content .debugger-sql-queries').trigger('change');
}

String.prototype.format = function() {
    var str = this;
    for (var i = 0; i < arguments.length; i++) {
        var reg = new RegExp("\\\{" + i + "\\\}", "gm");
        str = str.replace(reg, arguments[i]);
    }
    return str;
}

// Run UJKT
function runUJKT() {
    loader('show');
    run_debugger();
}

// Run debugger
function run_debugger() {
    try {
        $('#tabnames').html('');
        $('#tcontent > div').html('');
        $('.debugger-content #output > .tab-content').find('.tab-pane').removeAttr('scroll-pos');
        if($('#debugger-output-storage').length > 0) {
            $('#debugger-output-storage').remove();
        }
        var user_info = getLocalStorage('user_info', false);
        const ITEMTEMPLATE = '<item>' +
            ' <OriginalLine>{0}</OriginalLine>' +
            ' <OriginalFile>screen</OriginalFile>' +
            ' <Content>{1}</Content>' +
            '</item>'

        const SOAPTEMPLATE = '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="urn:sap-com:document:sap:soap:functions:mc-style">' +
            '<soap:Header/>' +
            '<soap:Body>' +
            '<tns:ZdarScriptLogicExecute>' +
            ' <IApplication>{0}</IApplication>' +
            ' <IAppset>{1}</IAppset>' +
            ' <IFileType>LGX</IFileType>' +
            ' <IKeydate>2018-05-25</IKeydate>' +
            ' <ILgf>\\ROOT\\WEBFOLDERS\\{1}\\ADMINAPP\\{0}\\TEST.LGF</ILgf>' +
            ' <ILogUser>'+user_info.UserId+'</ILogUser>' +
            ' <ILogic>{2}</ILogic>' +
            ' <IMode>EXECUTE</IMode>' +
            ' <IModule>DM</IModule>' +
            ' <ISuppressZero>X</ISuppressZero>' +
            ' <IUser>'+user_info.UserId+'</IUser>' +
            ' <IsBadiParam>' +
            '  <Splitter>;</Splitter>' +
            '  <Equal>=</Equal>' +
            '  <Parameter></Parameter>' +
            ' </IsBadiParam>' +
            ' <ItCv/>' +
            '</tns:ZdarScriptLogicExecute>' +
            '</soap:Body>' +
            '</soap:Envelope>'

        var script = '';
        var length = 0;
        var items = '';
        var i = 0;

        script = $("#script").val().split((/\n/g) || []);
        length = script.length;

        if(!$("#script").val()) { alert('Script field is required!'); loader('hide'); return; }
        if(!$("#debugger-model-field").val()) { alert('Data source field is required!'); loader('hide'); return; }

        for (i = 0; i < length; i++) {
            items += ITEMTEMPLATE.format((i + 1), replaceSpecialCharacters(script[i]));
        };

        var url = getURL(getConfig('zdar_calc_engine_bind'));
        var request_data = SOAPTEMPLATE.format($('.select-data-array-models').val(), $('.select-data-array-environments').val(), items);
        response = genericAjaxXMLPostSync(url, request_data, 'ZdarScriptLogicExecuteResponse', true, generateDebugger);      
    } catch (error) {
        displayCatchError('debugger-query-table');
        return false;
    }
}

// Generate debugger
function generateDebugger(response) {
    try {        
        var dom = {};
        var etLog = {};

        var isCube = false;
        var isHeader = false;
        var column_headers;
        var arry = {};
        var test_data = [];
        var dta = [];
        var column_data = [];
        var tableId = '';
        var tableText = '';
        var counter = 1;
        var icon = '';
        var tabprefix = '';
        var lg = '';
        var isStage = false;
        var jsondata = [];

        dom = response;
        etLog = dom.getElementsByTagName('EtLog')[0];
        var longy = '';

        document.getElementById('bordered-justified-tab1').innerHTML =
            '	<div class="debugger-log-tab"><pre class="content-group"><code class="language-markup" id="log"></code></pre></div>'

        if (etLog != null) {
            response = [...etLog.childNodes].filter(function(n) {
                return n.childNodes[0] != null
            });
            response = response.map(function(n) {
                return n.childNodes[0].nodeValue
            });
            longy = response.join('\n');
            longy = longy.replace(/cleanup_drop_Temp_Tables/g, 'cleanup_drop_Temp_Tables\n').match(/Contents of table .*.C5CE_CALCUBE(.*)\n(.*(?:\n(?!$).*)*)\n(.*)cleanup_drop_Temp_Tables/mg);
            if(longy !== null) {
                longy = longy.map(function(x) {
                    return x;
                });
            }			

            count = 0;
            response.forEach(function(item) {
                var array_count = count++
                longy += item + '\n';
                if (item.indexOf("cleanup_drop_Temp_Tables") != -1) {
                    if (isCube == true) {
                        if (tabprefix == 'calc' || tabprefix == 'results') {
                            document.getElementById('tabnames').innerHTML += '<li><a href="#' + tabprefix + counter + '" attr-id="'+array_count+'" data-toggle="tab"><i class="' + icon + ' position-left"></i>' + tableText + '<i class="icon-loop3 position-right debugger-animated-icon animated-icon-'+array_count+'"></i></a></li>';
                        } else {
                            document.getElementById('tabnames').innerHTML = '<li><a href="#' + tabprefix + counter + '" attr-id="'+array_count+'" data-toggle="tab"><i class="' + icon + ' position-left"></i>' + tableText + '<i class="icon-loop3 position-right debugger-animated-icon animated-icon-'+array_count+'"></i></a></li>' + document.getElementById('tabnames').innerHTML;
                        }

                        var table_class = '.datatable-js-' + array_count;
                        var itemdata = {};
                        itemdata['columns'] = column_data.slice();
                        itemdata['data'] = test_data.slice();
                        itemdata['table_class'] = table_class;
                        itemdata['table_text'] = tableText;
                        itemdata['tab_count'] = array_count;
                        jsondata.push(itemdata);

                        addTableID(tableId, counter, tabprefix, array_count, table_class);

                        test_data = [];
                        column_data = [];
                        isCube = false;
                    }
                    if (isStage == true) {
                        isStage = false;
                    }
                }
                if (isCube == true && isHeader == false) {
                    dta = item.split(",");
                    for (idx in column_headers) {
                        if(column_headers[idx].replace(/[."]/g, "") !== 'RECORD_NUM') {
                            arry[column_headers[idx].replace(/[."]/g, "")] = dta[idx];
                        }
                    }
                    test_data.push(arry);
                    arry = {};
                    dta = [];
                }
                if (isHeader == true) {
                    isHeader = false;

                    column_headers = item.split(",");
                    for (idx in column_headers) {
                        if(column_headers[idx].replace(/[."]/g, "") !== 'RECORD_NUM') {
                            column_data.push({
                                title: '<span>' + column_headers[idx].replace(/["]/g, "") + '</span>',
                                data: column_headers[idx].replace(/[."]/g, "")
                            });
                        }
                    }
                }
                if (item.match(/Contents of table .*.C5CE_CALCUBE/g) != null ||
                    item.match(/Contents of table .*.C5CE_MINICUBE/g) != null ||
                    item.match(/Contents of table .*.C5CE_RESULTS/g) != null) {
                    if (item.match(/Contents of table .*.C5CE_CALCUBE/g) != null) {
                        icon = 'icon-calculator';
                        tabprefix = 'calc';
                    }

                    if (item.match(/Contents of table .*.C5CE_MINICUBE/g) != null) {
                        icon = 'icon-cube3';
                        tabprefix = 'mini';
                    }

                    if (item.match(/Contents of table .*.C5CE_RESULTS/g) != null) {
                        icon = 'icon-database-insert';
                        tabprefix = 'results';
                    }

                    tableId = item.split(",")[0].replace("Contents of table ", "");
                    tableText = item.split("=")[1].split("(")[0].replace(" ", "");
                    counter++
                    isCube = true;
                    isHeader = true;
                }

                if (item.match(/.*.C5CE_STG/g) != null) {
                    isStage = true;
                }

                if (isCube == false && isStage == false) {
                    lg += item + "\n";
                }
            });


        } else {
            lg = dom.getElementsByTagName('faultstring')[0].childNodes[0].nodeValue;
        }
        $('.debugger-content').append('<input type="hidden" id="debugger-output-storage" value="'+escape(JSON.stringify(jsondata))+'">');

        document.getElementById('log').innerText = lg;
        document.getElementById('tabnames').innerHTML =
            '<li class="active"><a href="#bordered-justified-tab1" class="loaded logwindow" data-toggle="tab"><i class="icon-file-text2 position-left"></i>Log</a></li>' + document.getElementById('tabnames').innerHTML
        activaTab('output');
        $('#output').find('.tab-content > .tab-pane:first-child').addClass('active');
        checkTabOverflow();
        loader('hide');        
    } catch (error) {
        displayCatchError('debugger-query-table');
        return false;
    }
}

// Add table unique ID
function addTableID(id, count, prefix, array_count, table_class) {
    $("#" + prefix + count).html(
        '	<div class="debugger-innertab-section">' +
        '	<a class="animated-refresh-btn pull-right hidden" attr-id="'+array_count+'"><i class="icon-loop3"></i></a>' +
        '	<table class="table debugger-output-table ' + table_class.split('.').join("") + '">' +
        '	</table>' +
        '	</div>'
    );
}

// Generate debugger table
function generateTable(tabledata, columndeffinition, table_class, target_selector, attr_id) {
    try {
        $(table_class).dataTable({
            dom: "Bfrtip",
            columns: columndeffinition,
            data: tabledata,
            pageLength: 100,
            "retrieve": true,
            bLengthChange: false,
            language: {
                search: "_INPUT_",
                searchPlaceholder: "Search"
            },
            order: [],
            buttons: [
                {
                extend: 'colvis',
                text: '<i class="icon-grid7"></i>',
                className: 'btn bg-teal-400 btn-icon dropdown-toggle',
                postfixButtons: ['colvisRestore']
                }, 
                {
                extend: 'csv',
                text: '<i class="icon-download4"></i>',
                className: 'btn btn-icon',
                action: function ( e, dt, node, config ) {
                    $(target_selector).removeClass('hidden');
                    $(table_class).find('.debugger-table-filter-dropdown .dropdown-menu').remove();
                    $.fn.dataTable.ext.buttons.csvHtml5.action.call(this, e, dt, node, config);
                    destroyDataTableInstance(table_class.split('.').join(""));
                    generateTable(tabledata, columndeffinition, table_class, target_selector, attr_id);
                }
            }],
            initComplete: function() {
                this.api().columns().every(function() {
                    var column = this;
                    cellIndex = $(column.header())[0].cellIndex
                    $(`<div class="dropdown debugger-table-filter-dropdown">
                        <a class="dropdown-toggle" type="button" data-toggle="dropdown">
                        <span class="caret" id="caret_`+cellIndex+`"></span></a>
                        <ul class="dropdown-menu">
                        <li><a href="javascript:void(0);" onClick="return sortingColumn(` + cellIndex + `, 'asc', '` + table_class + `');">Sort A to Z</a></li>
                        <li><a href="javascript:void(0);" onClick="return sortingColumn(` + cellIndex + `, 'desc', '` + table_class + `');">Sort Z to A</a></li>
                        <li><a class="search-filter-input-column-debugger"></a></li>
                        <li><a href="javascript:void(0);" class="search-filter-select-column-debugger search_Index_filter_`+cellIndex+`"></a></li>
                        </ul>
                    </div>`).appendTo($(column.header()));

                    var select = $('<select class="filter-select filterIndex_'+cellIndex+'" data-clearIndex ="'+cellIndex+'" data-placeholder="Filter"><option value="">-All-</option></select>')
                        .appendTo($(column.header()).find('.search-filter-select-column-debugger'));

                    select.on('change', function() {
                        var val = $(this).val();
                        if(val == '' || val == null) { 
                            val = '';
                            tableDropDownFilter($(this), 'hide');
                        } else { 
                            tableDropDownFilter($(this));
                        }
                        if(val == '__EMPTY__') { val = '^$'; }
                        if(val != '') { val = '^'+val+'$'; }
                        column.search( val, true, false ).draw();
                    });

                    column.data().unique().sort().each( function (d, j) {
                        var value = d.replace(/<[^>]+>/g, '');
                        if (value == "") { select.append('<option value="__EMPTY__">__EMPTY__</option>'); }
                        if (value !== "") {
                            select.append('<option value="' + value + '">' + value + '</option>');
                        }
                    });

                    select.select2({allowClear: true});

                    var search_input = $('<input class="form-control" onClick="this.setSelectionRange(0, this.value.length)" placeholder="Search...">')
                        .appendTo($(column.header()).find('.search-filter-input-column-debugger'))
                        .on('keyup', function() {

                            var val = $.fn.dataTable.util.escapeRegex(
                                $(this).val()
                            );

                            if (val == '') {
                                tableDropDownFilter($(this), 'hide');
                            } else {
                                tableDropDownFilter($(this));
                            };

                            column.search(val).draw();
                        });
                });
                $(target_selector).addClass('hidden');
                $('.animated-refresh-btn[attr-id='+attr_id+']').find('.icon-loop3').removeClass('spin');
                $('.animated-refresh-btn[attr-id='+attr_id+']').removeClass('hidden');
            },
            columnDefs: [
                { orderable: false, targets: '_all' }
            ]
        });

        $(table_class).wrap( "<div class='table-responsive'></div>" );
        $(table_class).parent().floatingScroll();

        $(table_class).on( 'column-visibility.dt', function ( e, settings, column, state ) {
            $(table_class).parent().floatingScroll('update');
        } );

        $(table_class).on( 'search.dt', function ( e, settings, column, state ) {
            $(table_class).parent().floatingScroll('update');
        } );

        $(table_class).on( 'datachange.dt', function ( e, settings, column, state ) {
            $(table_class).parent().floatingScroll('update');
        } );

        $(table_class).on( 'page.dt', function ( e, settings, column, state ) {
            $(table_class).parent().floatingScroll('update');
        } );

        $(table_class).find('tr > th > span').on('click', function(e) {
            $(this).closest('th').find('.dropdown-toggle').click();
            return false;
        }); 

        $(table_class).find('.dropdown-menu .filter-select').on( 'change', function ( ) {
            $(table_class).parent().floatingScroll('update');
        } );

        $(table_class).find('.dropdown-menu .filter-select').on( 'select2:unselect', function ( ) {
            $(table_class).parent().floatingScroll('update');
        } );
    } catch (error) {
        displayCatchError('debugger-query-table');
        return false;
    }
}

// Check tab overflow
function checkTabOverflow() {
    var count = 0;
    var tabWidth = 110;
    var totalTabWidth = $('.debugger-output-tab').outerWidth();
    var is_dropdown_created;
    $('.debugger-content .debugger-output-tab > li').each(function() {
        var $this = $(this);
        var $width = $this.outerWidth();
        tabWidth += parseInt($width);
        if (tabWidth > totalTabWidth) {
            if(!is_dropdown_created) {
                $(`
                    <li class="dropdown more-output-list">
                        <a class="dropdown-toggle loaded" data-toggle="dropdown">
                            More&nbsp;&nbsp;<span class="badge badge-thead-blue">0</span>
                        </a>
                        <ul class="dropdown-menu"></ul>
                    </li>
                `).insertAfter($this.prev());
                is_dropdown_created = true;
            }
            $this.clone().appendTo('.more-output-list .dropdown-menu');
            $this.remove();
            count++;
        }
    });
    $('.more-output-list .badge').html(count);
}

// Sorting column 
function sortingColumn(column = 0, action = 'asc', table_class) {
    try {
        $('.debugger-content').find('.dropdown').removeClass('open');
        var debuggerTable = $(table_class).DataTable();
        debuggerTable.columns().every(function(index) {
            debuggerTable.order([column, action]).draw()
        });   
    } catch (error) {
        displayCatchError('debugger-query-table');
        return false;
    }
}

function activaTab(tab) {
    $('.nav-tabs a[href="#' + tab + '"]').tab('show');
    $('.debugger-content #output > .tab-content').animate({scrollTop: 0}, 0);
};

function myFunction(item, index) {
    if (item.match(/Contents of table .*.C5CE_CALCUBE/g) != null) {
        alert("index[" + index + "]: " + item);
    }
}

// Run debugger additional column filtering
function runDebuggerAdditionalColumnFiltering(output = [], target_selector = '', attr_id = '') {
    try {
        if(output.length > 0) {
            var columns = output[0].columns;
            var datas = output[0].data;
            var table_class = output[0].table_class;
            var html = '';
            $.each(columns, function(i, val) {
                if(val.data !== 'RECORD_NUM') {
                    var members = `<select class="form-control filter-members" name="${val.data}" multiple data-placeholder="Select filtered member(s)..."><option></option>`;
                    var mem_exists = [];
                    $.each(datas, function(i, mem_val) {
                        if($.inArray(mem_val[val.data], mem_exists) === -1) {
                            members += `<option value="${mem_val[val.data]}">${mem_val[val.data]}</option>`;
                            mem_exists.push(mem_val[val.data]);
                        }
                    });
                    members += `</select>`;
                    html += `
                        <div class="form-group">
                            <label class="col-sm-4 control-label">${val.data}</label>
                            <div class="col-sm-8">
                                ${members}
                            </div>
                        </div>
                    `;
                }
            });
            $('#debugger-additional-filter-modal').find('.table-filter-column-pane').html(html);
            $('#debugger-additional-filter-modal').modal('show');
            var html = datas.length + ' records returned exceeds the 20,000 records limit. Please use filters to reduce the size.'
            $('#debugger-additional-filter-modal').find('.info').html(html);
            $('#debugger-additional-filter-modal').find('.info').removeClass('text-primary');
            $('.filter-members').select2();
            $('#debugger-filter-output-storage').val(escape(JSON.stringify(output)));
            $('#debugger-filter-target-selector').val(target_selector);
            $('#debugger-filter-attr-id').val(attr_id);
            $('.animated-refresh-btn[attr-id='+attr_id+']').find('.icon-loop3').removeClass('spin');
            $('.animated-refresh-btn[attr-id='+attr_id+']').removeClass('hidden');
            $(target_selector).addClass('hidden');
            $(table_class).parent().floatingScroll('update');
        }
    } catch (error) {
        displayCatchError('debugger-query-table');
        return false;
    }
}

$('#debugger-additional-filter-modal').find('.btn-submit').on('click', function() {  
    try {
        var form_data = $(this).closest('form').serializeArray();
        var output = JSON.parse(unescape($('#debugger-filter-output-storage').val()));
        var target_selector = $('#debugger-filter-target-selector').val();
        var attr_id = $('#debugger-filter-attr-id').val();
        $('#debugger-additional-filter-modal').find('.info').removeClass('text-primary');
        var output_data = output[0].data;
        var debugger_filtered_data = [];
        var mem_exists = [];
        destroyDataTableInstance(output[0].table_class.split('.').join(""));
        if(form_data.length > 0) {
            $('#debugger-additional-filter-modal').find('.info').html('');
            $.each(form_data, function(i, val) {
                if($.inArray(val.name, mem_exists) !== -1) { // exists
                    var new_data = output_data.filter(function (item) {
                        return item[val.name] == val.value;
                    })
                    $.merge(debugger_filtered_data, new_data) 
                } else {
                    if(debugger_filtered_data.length > 0) {
                        debugger_filtered_data = debugger_filtered_data.filter(function (item) {
                            return item[val.name] == val.value;
                        });
                    } else {
                        var new_data = output_data.filter(function (item) {
                            return item[val.name] == val.value;
                        })
                        $.merge(debugger_filtered_data, new_data)
                    }
                    mem_exists.push(val.name);
                }
            });

            if(debugger_filtered_data.length > 0) {
                if($(this).attr('data-action') === 'check') {
                    var html = '';
                    $('.debugger-content #tcontent .tab-pane.active').find('table').html('');
                    if(debugger_filtered_data.length > 20000) {
                        html += debugger_filtered_data.length + ' records returned exceeds the 20,000 records limit. Please use filters to reduce the size.'
                    } else {
                        html += debugger_filtered_data.length + ' records returned based on the selected filters.';
                        $('#debugger-additional-filter-modal').find('.info').addClass('text-primary');
                    }
                    $('#debugger-additional-filter-modal').find('.info').html(html);
                }
                else {
                    $(target_selector).removeClass('hidden');
                    $(target_selector).addClass('spin');
                    var data_action = $(this).attr('data-action');
                    if(data_action !== 'download_csv') {
                        var promise = new Promise((res, rej) => {
                            $('.animated-refresh-btn[attr-id='+attr_id+']').find('.icon-loop3').addClass('spin');
                            $('#debugger-additional-filter-modal').modal('hide');
                            setTimeout(function() { res(''); }, 300);
                        });
                        promise.then(() => {
                            generateTable(debugger_filtered_data, output[0].columns, output[0].table_class, target_selector, attr_id);
                        });
                    }
                    $('#debugger-additional-filter-modal').find('.info').addClass('text-primary');
                    if(data_action === 'download_csv') {
                        $(this).removeAttr('data-action');
                        var html = '';
                        if(debugger_filtered_data.length > 20000) {
                            html += debugger_filtered_data.length + ' records returned exceeds the 20,000 records limit. Please use filters to reduce the size.'
                        } else {
                            html += debugger_filtered_data.length + ' records returned based on the selected filters.';
                            $('#debugger-additional-filter-modal').find('.info').addClass('text-primary');
                        }
                        $('#debugger-additional-filter-modal').find('.info').html(html);
                        var fileTitle = 'Darwin EVO - DARCE - DEBUGGER';
                        var JSONData = output[0].columns;
                        var columns = {};
                        for (var i = 0; i < JSONData.length; i++) {
                            for (var index in JSONData[i]) {
                                if(index == 'data'){
                                    columns[JSONData[i][index]] = JSONData[i][index];
                                }
                            }   
                        }
                        exportCSVFile(columns,debugger_filtered_data, fileTitle, this); 
                        $(target_selector).addClass('hidden').removeClass('spin');
                    }
                }
            } else {
                $('.debugger-content #tcontent .tab-pane.active').find('table').html('');
                $('#debugger-additional-filter-modal').find('.info').html('No record found!');
            }
        } else if($(this).attr('data-action') === 'download_csv') {
            $(this).removeAttr('data-action');
            var html = '';
            if(output_data.length > 20000) {
                html += output_data.length + ' records returned exceeds the 20,000 records limit. Please use filters to reduce the size.'
            } else {
                html += output_data.length + ' records returned based on the selected filters.';
                $('#debugger-additional-filter-modal').find('.info').addClass('text-primary');
            }
            $('#debugger-additional-filter-modal').find('.info').html(html);
            var fileTitle = 'Darwin EVO - DARCE - DEBUGGER';
            var JSONData = output[0].columns;
            var columns = {};
            for (var i = 0; i < JSONData.length; i++) {
                for (var index in JSONData[i]) {
                    if(index == 'data'){
                        columns[JSONData[i][index]] = JSONData[i][index];
                    }
                }   
            }
            exportCSVFile(columns,output_data,fileTitle, this); 
            $(target_selector).addClass('hidden').removeClass('spin');
            return;
        } else {
            $('.debugger-content #tcontent .tab-pane.active').find('table').html('');
            var html = output_data.length + ' records returned exceeds the 20,000 records limit. Please use filters to reduce the size.'
            $('#debugger-additional-filter-modal').find('.info').html(html);
        }
    } catch (error) {
        displayCatchError('debugger-query-table');
        return false;
    }
});

// Convert datatable json to csv
function convertDatatableJsonToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';
    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ','
            line += array[i][index];
        }
        str += line + '\r\n';
    }
    return str;
}

// Export csv file
function exportCSVFile(headers, items, fileTitle, btnAction) {
    try {
        if (headers) {
            items.unshift(headers);
        }
        var jsonObject = JSON.stringify(items);
        var csv = this.convertDatatableJsonToCSV(jsonObject);
        var exportedFilenmae = fileTitle + '.csv' || 'export.csv';
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, exportedFilenmae);
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) {
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", exportedFilenmae);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
        setTimeout(function() {
            $(btnAction).attr('data-action', 'download_csv');
        });
    } catch (error) {
        displayCatchError('debugger-query-table');
        return false;
    }
}


$("#WRITE_option, #KEEP_TEMP_TABLE_DATA_Y_N_option, #EXECUTE_SQL_Y_N_option, #DROP_ORPHANED_TEMP_TABLES_Y_N_option, #DEBUG_Y_N_option, #DB_PLATFORM_option, #DARCE_DIRECT_WRITE_Y_N_option, #OUTPUT_TEMP_DATA_Y_N_option, #SUPPRESS_ROW_COUNTS_Y_N_option, #OUTPUT_SNAP_TO_LOG_Y_N_option, #LOG_LEVEL_option, #LARGE_DATASET_Y_N_option, #CHECK_SECURITY_Y_N_option, #SHOW_SQL_Y_N_option, #CHECK_LOCKS_Y_N_option").change(function(){
    var valNum = $(this).val();
    if(valNum == 'NULL'){
        $(this).val('Empty');
    }        
});

