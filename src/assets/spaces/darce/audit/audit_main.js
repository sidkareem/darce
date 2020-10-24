$(function() {
    $('#audit-daterange-from').daterangepicker({
        singleDatePicker: true,
        startDate: moment().subtract(90, 'days'),
        // autoUpdateInput: false
    }, () => {
        $('.audit-datetime-field[value=1]').prop('checked', true);
        $('.audit-content .styled').uniform();
    });
    $('#audit-daterange-to').daterangepicker({
        singleDatePicker: true,    
        startDate: moment()
    }, () => {
        $('.audit-datetime-field[value=1]').prop('checked', true);
        $('.audit-content .styled').uniform();
    });
    listModelOptions('#audit-model-field');
    loadAuditUserList();
    if($('#param-audit-calc-group-id').val()) {
        $('.audit-datetime-field[value=1]').prop('checked', true);
        $('.audit-content .styled').uniform();
        loadAudit();
    } else {
        InitializeAuditTable();
    }
    $(".styled").uniform();
    $('#audit-model-field').select2({tags: true, maximumSelectionLength: 1});
    $('#audit-action-field').select2({tags: true});
    $('.timezone-field').html('<strong>'+moment(new Date()).format('MMM DD, YYYY hh:mm a')+' | '+Intl.DateTimeFormat().resolvedOptions().timeZone+'</strong>');
});

// Load audit user list
function loadAuditUserList() {
    getWsUserRBind('A', true, updateAuditUserList);
}

// Update audit user list
function updateAuditUserList(response) {
    try {
        var html = '';
        var users = [];
        var ids = [];
        $.each(response, function(i, val) {
            if($.inArray(val.UserId, ids) === -1) {
                html += `<option value="${val.UserId}">${val.Fullname}</option>`;
                users.push(val.UserId);
                ids.push(val.UserId);
            }
        });
        $('#audit-user-field').html(html).select2({tags: true, maximumSelectionLength: 1});
    } catch (error) {
        displayCatchError('user-list');
        return false;
    }
}

// Webservice - Audit Log read
function WsAuditLogR(requestData, maxCount = false){            
    if(typeof requestData.Action == 'undefined' || requestData.Action == ''){
        requestData.Action = '%';
    }
    if(typeof requestData.Datefrom == 'undefined' || requestData.Datefrom == ''){
        requestData.Datefrom = '00000000000000';
    }
    if(typeof requestData.Dateto == 'undefined' || requestData.Dateto == ''){
        requestData.Dateto = '99999999999999';
    }
    if(typeof requestData.Dtrecordid == 'undefined' || requestData.Dtrecordid == ''){
        requestData.Dtrecordid = '%';
    }
    if(typeof requestData.Model == 'undefined' || requestData.Model == ''){
        requestData.Model = '%';
    }
    if(typeof requestData.Recordid == 'undefined' || requestData.Recordid == ''){
        requestData.Recordid = '%';
    }
    if(typeof requestData.User == 'undefined' || requestData.User == ''){
        requestData.User = '%';
    }
    var request = `<tns:ZdarAuditLogR>`;
    request += `<Action>${requestData.Action}</Action>`;    
    request += `<Datefrom>${requestData.Datefrom}</Datefrom>`;
    request += `<Dateto>${requestData.Dateto}</Dateto>`;  
    request += `<Dtrecordid>${requestData.Dtrecordid}</Dtrecordid>`;
    request += `<Env>`+getConfig('environment')+`</Env>`;
    request += `<Model>${requestData.Model}</Model>`;
    request += `<Recordid>${requestData.Recordid}</Recordid>`;
    request += `<User>${requestData.User}</User>`;
    if(maxCount) {
        request += `<Maxcount>20000</Maxcount>`;
    }
    request += `</tns:ZdarAuditLogR>`;
    //request = '<tns:ZdarAuditLogR><Action>%</Action><Datefrom>20190404000000</Datefrom><Dateto>20190404999999</Dateto><Dtrecordid>%</Dtrecordid><Env>DARWIN63</Env><Model>EMP_PLAN</Model><Recordid>EMP_COMP_STANDARD_1</Recordid><User>%</User><Maxcount>20000</Maxcount></tns:ZdarAuditLogR>';
    var response =  callWebService(getConfig('zdar_calc_engine_bind'), request, 'ZdarAuditLogRResponse', false, '', maxCount);    
    return response;
}

$('.filter-type').on('click', function(e) {
    e.preventDefault();
    if($(this).find('span:last-child').hasClass('icon-arrow-up12')) {
        $(this).find('span:last-child').removeClass('icon-arrow-up12');
        $(this).find('span:last-child').addClass('icon-arrow-down12');
    } else {
        $(this).find('span:last-child').removeClass('icon-arrow-down12');
        $(this).find('span:last-child').addClass('icon-arrow-up12');
    }
    $('.filter-form').slideToggle();
    $('.search-info').fadeToggle();
});

$('.search-info').find('span').on('click', function() {
    switch($(this).attr('class')) {
        case 'model-field':
            showFilterInfo();
            setTimeout(function() { $("#audit-model-field").next('div').addClass('open'); }, 1);
            break;
        case 'calc-group-field':
            showFilterInfo();
            $("#audit-calc-group-field").focus();
            break;
        case 'datetime-field':
            showFilterInfo();
            var dateRange = $('.audit-datetime-field:checked').val();
            if(dateRange == 1) {
                $('#audit-daterange-from').click();
            }
            break;
        case 'calculation-field':
            showFilterInfo();
            $("#audit-calculation-field").focus();
            break;
        case 'user-field':
            showFilterInfo();
            setTimeout(function() { $("#audit-user-field").next('div').addClass('open'); }, 1);
            break;
        case 'action-field':
            showFilterInfo();
            setTimeout(function() { $("#audit-action-field").next('div').addClass('open'); }, 1);
            break;
    }
});
     
$('.refresh-audit').on('click', function() {
    try {
        destroyDataTableInstance('audit-table');
        InitializeAuditTable();
        loadAudit();
        showSearchInfo();
    }
    catch (error) {
        displayCatchError('audit-table-error');
        return false;
    }
});

$('.print-audit').on('click', function() {
    window.print();
});

$('.export-audit-pdf').on('click', function() {
    loader('show', false);    
    setTimeout(function () { auditGeneratePDF(); }, 10);
});

$('.export-audit-csv').on('click', function() {
    try {
        $('.audit-table-filter-dropdown .dropdown-menu').remove();
        $('.audit-table-section .buttons-csv').trigger('click');
        destroyDataTableInstance('audit-table', false);
        InitializeAuditTable();
    }
    catch (error) {
        displayCatchError('audit-table-error');
        return false;
    }
});

async function auditGeneratePDF(){
    try {
        var action_replace = {'I':'Add','C':'Copy','D':'Delete','R':'Rename','M':'Update'};
        let customize_tableData = [];
        customize_tableData.push([
            {text:"Model",style: "tableHeader",fillColor: "#2d4154"},
            {text:"Calc Grp/Calc ID",style: "tableHeader",fillColor: "#2d4154"},
            {text:"Section",style: "tableHeader",fillColor: "#2d4154"},
            {text:"Section Item ID",style: "tableHeader",fillColor: "#2d4154"},
            {text:"Field",style: "tableHeader",fillColor: "#2d4154"},
            {text:"User",style: "tableHeader",fillColor: "#2d4154"},
            {text:"Action",style: "tableHeader",fillColor: "#2d4154"},
            {text:"Date",style: "tableHeader",fillColor: "#2d4154"}]);
        var dataTable = $('table#audit-table').DataTable();        
        var audit_detail_arr =  dataTable.rows( {search:'applied'} ).data().pluck(0);
        var audit_detail_count = 0;
        //var audit_detail_count =  dataTable.rows( {search:'applied'} ).data().count();        
        audit_detail_arr.each(function(value, index) {           
            audit_detail_count++;
            var audit_detail = $(value).data('val');
            audit_detail = JSON.parse(unescape(audit_detail));                  
            let fillColor = '';
            if(index % 2 == 0){   
                fillColor =  '#f3f3f3'; 
            }
            customize_tableData.push([
                {text:audit_detail.Model,fillColor: fillColor},
                {text:audit_detail.RecordId,fillColor: fillColor},
                {text:audit_detail.TableName,fillColor: fillColor},
                {text:((typeof(audit_detail.DtRecordId) !== 'undefined') ? audit_detail.DtRecordId : ''),fillColor: fillColor},
                {text:audit_detail.Field,fillColor: fillColor,alignment: "left"},
                {text:audit_detail.UserIdLastChange,fillColor: fillColor,alignment: "left"},
                {text:action_replace[audit_detail.Action],fillColor: fillColor,alignment: "left"},
                {text:getFormattedDateTime(audit_detail.DateTimeLastChange),fillColor: fillColor}]);                                        
            customize_tableData.push([{text:'Old Value: ',bold: true, fillColor:fillColor, alignment: 'right',},{text: audit_detail.OldValue.replace(/[\r\n]/g, ' '), fillColor:fillColor, alignment: 'left', colSpan: 7},{}, {}, {}, {}, {}, {}]);
            customize_tableData.push([{text:'New Value: ',bold: true, fillColor:fillColor, alignment: 'right',},{text: audit_detail.NewValue.replace(/[\r\n]/g, ' '), fillColor:fillColor, alignment: 'left', colSpan: 7},{}, {}, {}, {}, {}, {}]);                                                    
        });
        var doc = {
            content: [
                {
                    layout: 'noBorders',
                    table: {
                        layout: "noBorders",                         
                        headerRows: 1,
                        heights: 15,
                        body:getPdfHeaderText(),
                        widths:['100%'],    
                        margin:[0,0,0,52]                    
                    }
                },                
              {
                layout: 'noBorders',
                table: {
                    layout: "noBorders",
                    headerRows: 1, 
                    body: []
                }
              }
            ],
            pageMargins:[20,60,20,30],
            defaultStyle:{fontSize:9},
            styles:{
                tableBodyOdd:{fillColor:"#f3f3f3"},
                tableFooter: {bold: true, fontSize: 11, color: "white", fillColor: "#2d4154"},
                tableHeader: {bold: true, fontSize: 10, color: "white", fillColor: "#2d4154", alignment: "center"},
                title: {alignment: "center", fontSize: 15}
            },
            pageSize: 'A3',
            pageOrientation: 'landscape',
          };
        doc['header']=(function() {
            return {
                columns: [                                                       
                    {
                        alignment: 'center',
                        fontSize: 14,
                        text: 'Audit'
                    }
                ],
                margin: 20
            }
        });
        doc['footer']=(function(page, pages) {
            return {
                columns: [                            
                    {
                        alignment: 'center',
                        text: ['page ', { text: page.toString() },	' of ',	{ text: pages.toString() }],
                        fontSize: 10,
                    }
                ],
                margin: 10
            }
        
            
        });
        doc.content[1].table.body = customize_tableData;
        doc.content[1].table.widths = [ '9%', '19%', '19%', '19%', '10%', '10%', '4%', '10%'];       
        // download the PDF
        pdfMake.createPdf(doc).download($('title').text()+'.pdf',function () {            
            loader('hide');
        });
        
        // $('.audit-table-filter-dropdown .dropdown-menu').remove();
        // $('.audit-table-section .buttons-pdf').trigger('click');
        // destroyDataTableInstance('audit-table', false);
        // InitializeAuditTable();

       
    }
    catch (error) {
        displayCatchError('audit-table-error');
        return false;
    }
}

$('.clear-audit').on('click', function() {
    try {
        $('#audit-model-field, #audit-calc-group-field').val(null);
        $("#audit-user-field, #audit-action-field").val(null).trigger("change");
        $('.audit-datetime-field[value=0]').prop("checked", true);
        $.uniform.update();
        $('#audit-search-form')[0].reset();
        $('#audit-model-field, #audit-user-field, #audit-action-field').select2({tags: true, maximumSelectionLength: 1});
        $('#param-audit-variable-driver-step-id').val('');
        destroyDataTableInstance('audit-table');
        InitializeAuditTable('audit-table');
        loadSearchInfo();
        showSearchInfo();
    }
    catch (error) {
        displayCatchError('audit-table-error');
        return false;
    }
});

$(window).resize(function() {
    $('.audit-content .table-responsive').floatingScroll('update');
});

function showSearchInfo() {
    $('.filter-form').hide();
    $('.search-info').show();
}

function showFilterInfo() {
    $('.filter-form').show();
    $('.search-info').hide();
}

function loadAudit() {
    try {
        $('.additional-filter-result').addClass('hide');
        if($('#param-audit-model-id').val() && typeof($('#param-audit-model-id').val()) !== 'undefined') {
            var model_param = $('#param-audit-model').val();
            if(model_param != '') {
                $('#audit-model-field').val(model_param.split(','));
                $("#audit-model-field").select2({tags: true, maximumSelectionLength: 1});
                $('#param-audit-model').val('');
            }
        }
        if($('#param-audit-calc-group-id').val()) {
            var calc_group_param = $('#param-audit-calc-group-id').val();
            $('#audit-calc-group-field').val(calc_group_param);
            $('#param-audit-calc-group-id').val('');
        }
        if($('#param-audit-calc-id').val()) {
            var calc_param = $('#param-audit-calc-id').val();
            $('#audit-calculation-field').val(calc_param);
            $('#param-audit-calc-id').val('');
        }
        var Datefrom = '';
        var Dateto = '';
        
        var requestData = {Action:''};
        // var dateRange = $("input[name='time']:checked").val();   
        var dateRange = $('.audit-datetime-field:checked').val();
        if(dateRange == 1){
            var date_from = $('#audit-daterange-from').val();
            var date_to = $('#audit-daterange-to').val();
            Datefrom = $.datepicker.formatDate('yymmdd', new Date(date_from))+'000000';
            Dateto = $.datepicker.formatDate('yymmdd', new Date(date_to))+'999999';
            requestData.Datefrom = Datefrom;
            requestData.Dateto = Dateto;
        }
        var model = $('#audit-model-field').val();
        if(model != null){
            requestData.Model = model.join();
        }
        var calc_group = $('#audit-calc-group-field').val();
        if(calc_group != ''){
            requestData.Recordid = calc_group;
        }
        var calculation = $('#audit-calculation-field').val();
        if(calculation != ''){
            requestData.Recordid = calculation;
        }
        var action = $('#audit-action-field').val();
        if(action != null){
            var ws_action = [];
            var action_replace = {'Add':'I','Copy':'C','Delete':'D','Rename':'R','Update':'M'};
            $.each(action,function(i,item){           
                ws_action.push(action_replace[item]);
            });
            requestData.Action = ws_action.join();
        }
        var user = $('#audit-user-field').val();    
        if(user != null){
            requestData.User = user.join();
        }
        loadSearchInfo();
        loader('show');
        setTimeout(function() {
            try {
                var response = WsAuditLogR(requestData, true);
                if(typeof(response) !== 'undefined') {
                    if(response.Count > 20000) {
                        showFilterInfo();
                        $('.additional-filter-result').removeClass('hide');
                        $('.additional-filter-result').find('#threshold-records').html(response.Count);
                        response = false;
                    } else {
                        showSearchInfo();
                        // response = WsAuditLogR(requestData);
                        response = response.Tdata.item;
                    }
                }
                if(response) {
                    destroyDataTableInstance('audit-table');
                    $('.audit-content').append('<input type="hidden" id="audit-filter-output-storage" value="'+escape(JSON.stringify(response))+'">');
                    if($('#param-audit-calc-group-id').val()) { 
                        $('#param-audit-model').val(null);
                        $('#param-audit-calc-group-id').val(null);
                        $('#param-audit-calc-id').val(null);
                        showSearchInfo();
                    }
                    loadAuditTable(response);
                    if($('#param-audit-variable-driver-step-id').val() == '') { 
                        tableDropDownFilter($('.audit-table th:nth-child(4)').find('input'), 'hide'); 
                    } else {  
                        $('.audit-table th:nth-child(4)').find('input').val($('#param-audit-variable-driver-step-id').val());
                        tableDropDownFilter($('.audit-table th:nth-child(4)').find('input'));
                    };
                    $('.audit-table th:nth-child(4)').find('input').trigger('keyup');
                    $('#param-audit-query').val('run');
                } else {
                    loader('hide');
                    destroyDataTableInstance('audit-table');
                    loadAuditTable([]);
                }
                $('#param-audit-variable-driver-step-id').val('');                    
            } catch (error) {
                displayCatchError('audit-table-error');
                return false;
            }
        }, 1);
    }
    catch (error) {
        displayCatchError('audit-table-error');
        return false;
    }
}

function loadAuditTable(data) {    
    var list = '';  
    var action_replace = {'I':'Add','C':'Copy','D':'Delete','R':'Rename','M':'Update'};
    if(typeof data != 'undefined'){
        $.each(data, function(i, item){
            list += '<tr class="auditorder show-details">';
            list += '<td><span class="text-overflow audit-data" style="min-width: 100px"  data-val="'+ escape(JSON.stringify(item)) +'">' + item.Model + '</span></td>';
            list += '<td><span class="text-overflow" style="min-width: 100px">' + item.RecordId + '</span></td>';
            list += '<td><span class="text-overflow" style="min-width: 100px">' + item.TableName + '</span></td>';
            list += '<td><span class="text-overflow" style="min-width: 180px">' + ((typeof(item.DtRecordId) !== 'undefined') ? item.DtRecordId : '') + '</span></td>';
            list += '<td><span class="text-overflow" style="min-width: 80px">' + item.Field + '</span></td>';
            list += '<td><span class="text-overflow" style="min-width: 80px">' + item.UserIdLastChange + '</span></td>';
            list += '<td><span class="text-overflow" style="min-width: 60px">' + action_replace[item.Action] +'</span></td>';
            list += '<td><span class="text-overflow" style="min-width: 130px">' + getFormattedDateTime(item.DateTimeLastChange) + '</span></td>';
            list += '<td style="min-width: 100px">';
            if(item.OldValue) {
                list += '<span class="text-overflow" data-title="OLD VALUE" data-popup="popover" data-placement="left" data-trigger="hover" data-content="'+item.OldValue+'">' + item.OldValue + '</span>';
            }
            list += '</td>';
            list += '<td style="min-width: 100px">';
            if(item.NewValue) {
                list += '<span class="text-overflow" data-title="NEW VALUE" data-popup="popover" data-placement="left" data-trigger="hover" data-content="'+item.NewValue+'">' + item.NewValue + '</span>';
            }
            list += '</td>';
            list += '</tr>';
        });
    }
    $('.audit-table').find('tbody').html(list);
    $('.audit-table-print').find('tbody').html(list);
    InitializeAuditTable();
    initializePopover();
    updateCursorIcon('.audit-table tbody tr');
}

function loadSearchInfo() {
    // MODEL
    var model = $('#audit-model-field').val();
    model = (model == null) ? 'ALL' : model.join(', ');

    // CALC GROUP
    var calc_group = ($('#audit-calc-group-field').val()) ? $('#audit-calc-group-field').val() : 'ALL';

    // CALCULATION
    var calculation = ($('#audit-calculation-field').val()) ? $('#audit-calculation-field').val() : 'ALL';

    // USER
    var user = $("#audit-user-field").val();
    user = (user == null || user == '') ? 'ALL' : user.join(', ');

    // ACTION
    var action = $("#audit-action-field").val();
    action = (action == null || action == '') ? 'ALL' : action.join(', ');

    // DATETIME
    var datetime = $(".audit-datetime-field:checked").val();
    if(datetime == 1) {
        var date_from = $("#audit-daterange-from").val();
        var date_to = $("#audit-daterange-to").val();
        datetime = date_from + ' and ' + date_to;
    } else {
        datetime = 'Anytime';
    }

    var search_info = $('.search-info');
    search_info.find('.model-field').html(model);
    search_info.find('.calc-group-field').html(calc_group);
    search_info.find('.calculation-field').html(calculation);
    search_info.find('.user-field').html(user);
    search_info.find('.action-field').html(action);
    search_info.find('.datetime-field').html(datetime);
}

function InitializeAuditTable() {
    try {
        $('#audit-table-section').find('.dropdown').remove();    
        var auditTable = $('.audit-table').DataTable({
            dom: 'B<"clear">lfrtip',
            "autoWidth": false,
            language: {
                search: "_INPUT_",
                searchPlaceholder: "Search"
            },
            bLengthChange: false,
            bInfo: true,
            bPaginate: true,
            bSorting: false,
            "retrieve": true,
            "order": [],
            pageLength: 100,
            "paging": true,
            "bAutoWidth": false,	
            buttons: ['csv', 'print',
            {
                extend: 'csvHtml5',
                customize: function (csv) {
                    return  getCSVHeaderText()+  csv;
                }
            },
            {
                extend : 'pdfHtml5',
                footer: true,
                //message: getPdfHeaderText(),
                title : function() {
                    return document.title;
                },
                orientation : 'landscape',
                pageSize : 'A3',
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
                },
                customize: function (doc) {
                    //Remove the title created by datatTables
                    doc.content.splice(0,1);
                    //Create a date string that we use in the footer. Format is dd-mm-yyyy
                    var now = new Date();
                    var jsDate = now.getDate()+'-'+(now.getMonth()+1)+'-'+now.getFullYear();                
                    // It's important to create enough space at the top for a header !!!
                    doc.pageMargins = [20,60,20,30];
                    // Set the font size fot the entire document
                    doc.defaultStyle.fontSize = 9;
                    // Set the fontsize for the table header
                    doc.styles.tableHeader.fontSize = 10;
                    // Create a header object
                    // center side: A document title
                    doc['header']=(function() {
                        return {
                            columns: [                                                       
                                {
                                    alignment: 'center',
                                    fontSize: 14,
                                    text: 'Audit'
                                }
                            ],
                            margin: 20
                        }
                    });
                    // Create a footer object with 2 columns
                    // Left side: report creation date
                    // Right side: current page and total pages
                    doc['footer']=(function(page, pages) {
                        return {
                            columns: [                            
                                {
                                    alignment: 'center',
                                    text: ['page ', { text: page.toString() },	' of ',	{ text: pages.toString() }],
                                    fontSize: 10,
                                }
                            ],
                            margin: 10
                        }
                    
                    });
                    doc.content[1].table.widths = [ '10%', '20%', '20%', '10%', '10%', '15%', '5%', '10%','5%', '10%'];
                }
            }],
            initComplete: function () {                
                this.api().columns().every( function () {
                    var column = this;        
                    cellIndex = $(column.header())[0].cellIndex
                    $(`<div class="dropdown audit-table-filter-dropdown">
                        <a class="dropdown-toggle" type="button" data-toggle="dropdown">
                        <span class="caret" id="caret_`+cellIndex+`"></span></a>
                        <ul class="dropdown-menu">
                        <li><a href="javascript:void(0);" onClick="return sortingColumn(`+cellIndex+`, 'asc');">Sort A to Z</a></li>
                        <li><a href="javascript:void(0);" onClick="return sortingColumn(`+cellIndex+`, 'desc');">Sort Z to A</a></li>
                        <li><a class="search-filter-input-column"></a></li>
                        <li><a href="javascript:void(0);" class="search-filter-select-column search_Index_filter_`+cellIndex+`" data-clearIndex ="`+cellIndex+`"></a></li>
                        </ul>
                    </div>`).appendTo($(column.header()));

                    var select = $('<select class="filter-select filterIndex_'+cellIndex+'" data-clearIndex ="'+cellIndex+'" data-placeholder="Filter"><option value="">-All-</option></select>')
                        .appendTo($(column.header()).find('.search-filter-select-column'));

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

                        setTimeout(function() {
                            $('.audit-content .table-responsive').floatingScroll('update');
                        }, 100);
                    });

                    column.data().unique().sort().each( function (d, j) {
                        var value = d.replace(/<[^>]+>/g, '');
                        if (value == "") { select.append('<option value="__EMPTY__">__EMPTY__</option>'); }
                        if (value !== "") {
                            select.append('<option value="' + value + '">' + value + '</option>');
                        }
                    });

                    select.select2({allowClear: true});

                    var search_input = $('<input type="text" class="form-control" onClick="this.setSelectionRange(0, this.value.length)" placeholder="Search...">')
                        .appendTo($(column.header()).find('.search-filter-input-column'))
                        .on('keyup', function(e) {
                            
                        var val = $.fn.dataTable.util.escapeRegex(
                            ($(this).val() != '')?$(this).val():''
                        );

                        if (val == '') {
                            tableDropDownFilter($(this), 'hide');
                        } else {
                            tableDropDownFilter($(this));
                        }

                        if($(this).closest('th').is(':nth-child(4)')) {
                            $('#param-audit-variable-driver-step-id').val($(this).val());
                        }

                        column
                        .search( val )
                        .draw();

                        setTimeout(function() {
                            $('.audit-content .table-responsive').floatingScroll('update');
                        }, 100);
                    });
                });
            },
            "columns": [
                { "orderable": false },
                { "orderable": false },
                { "orderable": false },
                { "orderable": false },
                { "orderable": false },
                { "orderable": false },
                { "orderable": false },
                { "orderable": false },
                { "orderable": false },
                { "orderable": false }
            ],
        });
        var thHeight = $('.audit-table th:first').height();
        $('.audit-table th').resizable({
            handles: "e",
            minHeight: thHeight,
            maxHeight: thHeight,
            resize: function (event, ui) {
                var sizerID = "#" + $(event.target).attr("id") + "-sizer";
                $(sizerID).width(ui.size.width);
            },
            stop: function(event, ui) {
                $('.audit-content .table-responsive').floatingScroll('update');
            }
        });

        $('.audit-table').wrap( "<div class='table-responsive'></div>" );
        $('.audit-content .table-responsive').floatingScroll();

        $('.audit-table').on( 'column-visibility.dt', function ( e, settings, column, state ) {
            $('.audit-table').parent().floatingScroll('update');
        } );

        $('.audit-table').on( 'search.dt', function ( e, settings, column, state ) {
            $('.audit-table').parent().floatingScroll('update');
        } );

        $('.audit-table').on( 'datachange.dt', function ( e, settings, column, state ) {
            $('.audit-table').parent().floatingScroll('update');
        } );

        $('.audit-table').on( 'page.dt', function ( e, settings, column, state ) {
            $('.audit-table').parent().floatingScroll('update');
            setTimeout(function() {                
                updateCursorIcon('.audit-table tbody tr');
            });
        } );

        $('.audit-table').find('.dropdown-menu .filter-select').on( 'change', function ( ) {
            $('.audit-table').parent().floatingScroll('update');
        } );

        $('.audit-table').find('.dropdown-menu .filter-select').on( 'select2:unselect', function ( ) {
            $('.audit-table').parent().floatingScroll('update');
        } );
    } 
    catch (error) {
        displayCatchError('audit-table-error');
        return false;
    }
}

$('#audit-table-section').find('table th > span').on('click', function(e) {
    $(this).closest('th').find('.dropdown-toggle').click();
    return false;
});

$(document).on('click', '.audit-content .dropdown-menu, .select2-container .select2-search', function (e) {
    e.stopPropagation();
});

function sortingColumn(column = 0, action = 'asc') {
    try {
        $('#audit-table-section').find('.dropdown').removeClass('open');
        var auditTable = $('.audit-table').DataTable();
        auditTable.columns().every(function (index) {
            auditTable.order([column, action]).draw()
        });
    } catch (error) {
        displayCatchError('audit-table-error');
        return false;
    }
}

function getCSVHeaderText() {    
    var dataTable = $('table#audit-table').DataTable();    
    var pageinfo = dataTable.page.info();
    let header_data = '';
    var text = "Model: "+$('.search-info .model-field').text();
    text +="; Calc Group: "+$('.search-info .calc-group-field').text();
    text +="; Calculation: "+$('.search-info .calculation-field').text();
    text +="; User: "+$('.search-info .user-field').text();
    text +="; Action: "+$('.search-info .action-field').text();
    text +="; Time Zone: "+$('.search-info .timezone-field ').text();
    text +="; Changed Date between: "+$('.search-info .datetime-field').text()+";";

    header_data += 'Environment: '+getEnvironment()+'\n';
    header_data += text+'\n';
    header_data += 'Exported Record Count: '+ pageinfo.recordsDisplay+'\n\n';    
    return header_data;
}

function getPdfHeaderText() {    
    var dataTable = $('table#audit-table').DataTable();    
    var pageinfo = dataTable.page.info();
    let header_data = [];
    var text = "Model: "+$('.search-info .model-field').text();
    text +="; Calc Group: "+$('.search-info .calc-group-field').text();
    text +="; Calculation: "+$('.search-info .calculation-field').text();
    text +="; User: "+$('.search-info .user-field').text();
    text +="; Action: "+$('.search-info .action-field').text();
    text +="; Time Zone: "+$('.search-info .timezone-field ').text();
    text +="; Changed Date between: "+$('.search-info .datetime-field').text()+";";
    header_data.push([
        {text: 'Environment: '+getEnvironment(), bold: true }        
    ]);
    header_data.push([
        {text: text}        
    ]);
    header_data.push([
        {text: 'Exported Record Count: '+ pageinfo.recordsDisplay, bold: true }
    ]);
    
    return header_data;
}
$(document).on('click', '#audit-table tbody tr', function(e) {
    var action_replace = {'I':'Add','C':'Copy','D':'Delete','R':'Rename','M':'Update'};
    var audit_detail = $(this).find('.audit-data').data('val');   
    audit_detail = JSON.parse(unescape(audit_detail));  
    // console.log('audit_detail',audit_detail)  
    $('#audit-row-detail-modal #au-date').val(getFormattedDateTime(audit_detail.DateTimeLastChange));
    $('#audit-row-detail-modal #au-user').val(audit_detail.UserIdLastChange);
    $('#audit-row-detail-modal #au-calc-grp-calc-id').val(audit_detail.RecordId);
    $('#audit-row-detail-modal #au-section-item-id').val(audit_detail.DtRecordId);
    $('#audit-row-detail-modal #au-field').val(audit_detail.Field);
    $('#audit-row-detail-modal #au-action').val(action_replace[audit_detail.Action]);
    // $('#audit-row-detail-modal #au-old-value').val(audit_detail.OldValue);
    // $('#audit-row-detail-modal #au-new-value').val(audit_detail.NewValue);
    $('#audit-row-detail-modal #au-old-value span').html(audit_detail.OldValue);
    $('#audit-row-detail-modal #au-new-value span').html(audit_detail.NewValue);
    $('#audit-old-new-value-modal #au-old-value-el').val(audit_detail.OldValue);
    $('#audit-old-new-value-modal #au-new-value-el').val(audit_detail.NewValue);
    var old_value = audit_detail.OldValue;
    var new_value = audit_detail.NewValue;
    var diffText = htmldiff(old_value, new_value);
    var old_diffText = htmldiff(new_value, old_value);
    $('#au-old-value span').html(old_diffText);
    $('#au-new-value span').html(diffText);
    
    // highlightParagraph($('#audit-row-detail-modal #au-new-value'), $('#audit-row-detail-modal #au-old-value'));

    $('#audit-row-detail-modal').modal({ backdrop: 'static', keyboard: false });
});
$(document).on('click', '#audit-row-detail-modal .close-modal', function(e) {
    $('#audit-row-detail-modal').modal('hide');
});
$(document).on('click', '#audit-old-new-value-modal .close-modal', function(e) {
    $('#audit-old-new-value-modal').modal('hide');
});
$(document).on('click', '#audit-row-detail-modal .icon-enlarge', function () {
    $($(this).attr('data-target')).modal({ backdrop: 'static', keyboard: false });
});
function limitPerLineChar(value,charCount)
{
    var str = value;
    var result = '';
    var i = 0
    var formattedText = '';
    //number of lines needed
    var limit = 20;    
    var limitPerLine = charCount;
    while (str.length > 0 && i < limit) 
    {
        i++;
        formattedText += str.substring(0, limitPerLine);
        str = str.substring(limitPerLine);
        //only add a new line if we're not at the end of the content
        if(str.length > 0 && i < limit)
        {
            formattedText += '\n';
        }
    }   
    return formattedText;
}