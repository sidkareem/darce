//Stores dimension members used for field validation.
var validations = {};
var storage = [];
var gridOptions;
var gridDiv;

//->Column Defs (used temporarily, will be pulled from webservice based on page definitions).
var obj = {};
obj["headers"] = [];
obj.headers.push({name: "VERSION",
                 default: "BUDGET_FY20_1",
                 visible: true,
                 editable: true,
                 measures: false});
obj.headers.push({name: "CURRENCY",
                 default: "USD",
                 visible: true,
                 editable: true,
                 measures: false});
obj.headers.push({name: "DATASRC_PRJ",
                 default: "ACTUAL_DS",
                 visible: false,
                 editable: false,
                 measures: false});
obj.headers.push({name: "LINE_ITEM",
                 default: "NO_LINE_ITEM",
                 visible: false,
                 editable: false,
                 measures: false});
obj.headers.push({name: "PROGRAM_PRJ",
                 default: "NO_PROGRAM",
                 visible: true,
                 editable: true,
                 measures: false});
obj.headers.push({name: "PURCHASE_ORDER",
                 default: "NO_PO",
                 visible: false,
                 editable: false,
                 measures: false});
obj.headers.push({name: "REASON_CODE",
                 default: "NO_REASON_CODE",
                 visible: false,
                 editable: false,
                 measures: false});
obj.headers.push({name: "SUPPLIER",
                 default: "NO_SUPPLIER",
                 visible: false,
                 editable: false,
                 measures: false});
obj.headers.push({name: "COST_CENTER_E",
                default: "FIN",
                visible: true,
                editable: true,
                 measures: false});
//obj.headers.push({name: "MEASURES",
//                 default: "PERIODIC",
//                 visible: false,
//                 editable: false,
//                 measures: true});

obj["rows"] = [];
obj.rows.push({headerName: "PROJECT",
                 field: "project"});
obj.rows.push({headerName: "COST_CENTER_E",
                 field: "cost_center_e"});
obj.rows.push({headerName: "ACCOUNT_PRJ",
                 field: "account_prj"});

obj["columns"] = [];
obj.columns.push({headerName: "2020.01",
                 field: "period1",
                 dimension: "TIME"});
obj.columns.push({headerName: "2020.02",
                 field: "period2",
                 dimension: "TIME"});
obj.columns.push({headerName: "2020.03",
                 field: "period3",
                 dimension: "TIME"});
obj.columns.push({headerName: "2020.04",
                 field: "period4",
                 dimension: "TIME"});
obj.columns.push({headerName: "2020.05",
                 field: "period5",
                 dimension: "TIME"});
obj.columns.push({headerName: "2020.06",
                 field: "period6",
                 dimension: "TIME"});
obj.columns.push({headerName: "2020.07",
                 field: "period7",
                 dimension: "TIME"});
obj.columns.push({headerName: "2020.08",
                 field: "period8",
                 dimension: "TIME"});
obj.columns.push({headerName: "2020.09",
                 field: "period9",
                 dimension: "TIME"});
obj.columns.push({headerName: "2020.10",
                 field: "period10",
                 dimension: "TIME"});
obj.columns.push({headerName: "2020.11",
                 field: "period11",
                 dimension: "TIME"});
obj.columns.push({headerName: "2020.12",
                 field: "period12",
                 dimension: "TIME"});
//<-Column Defs (used temporarily, will be pulled from webservice based on page definitions).

var sent_count = 0;
var cell_count = 0;

//->Create column defs object used to create ag-grid headers.
var columnDefs = [];
columnDefs.push({headerName: "",
                 field: "rownumber",
                 cellStyle: {'border-right': '1px solid Gainsboro'},
                 pinned: 'left',
                 width: 44,
                 sortable: false,
                 editable: false,
                 cellClass: function(params) {
                   return 'ag-header-style'
                 }
                // headerComponentParams: {menuIcon: 'icon-flag3'}
                });
var check='<input type="checkbox"/>'
columnDefs.push({headerName: "flag",
                 field: "flag",
                 cellStyle: {'border-right': '1px solid Gainsboro'},
                 pinned: 'left',
                 width: 40,
                 sortable: true,
                 editable: false,
                 headerComponentParams: {menuIcon: 'icon-flag3'},
                 cellClass: function(params) {
                    // console.log('params',params);
                    //return 'icon-warning';
                    let flag = checkIsValidRow(params.node,params.node.id);
                    //params.setDataValue('flag', flag);
                    return  flag ? '' : 'icon-warning';
               },
               valueFormatter:function(params) {
                return '';
               }
              });

columnDefs.push({headerName: '',
                 field: "check",
                 headerCheckboxSelection: true,
                 headerCheckboxSelectionFilteredOnly: true,
                 checkboxSelection: true,
                //  pivot: true,
                 cellStyle: {'border-right': '1px solid Gainsboro'},
                 pinned: 'left',                 
                //  checkboxSelection: true, 
                //  aggFunc: 'sum',
                 width: 40,
                //  headerComponentParams: {menuIcon: 'icon-checkbox-unchecked'}
                });


//<-Create column defs object used to create ag-grid headers.

var html = '<div class="row">';
var html_copy = '';
obj.headers.forEach(header => {
  if(!header.measures) {
    html += `
      <div class="col-xs-3 ${(!header.visible) ? 'hidden' : ''}">
        <div class="form-fields">
          <label for="" class="col-xs-4 control-label text-right text-semibold">${header.name}</label>
          <div class="col-xs-8 form-input">
              <input class="form-control prj-plan-page-header-field" name="${header.name}" value="${header.default}" ${(!header.editable) ? 'readonly' : ''}>
              <a class="member-selector icon-arrow-down5"></a>
          </div>
        </div>
      </div>
    `;
    html_copy += `<div class="${(!header.visible) ? 'hidden' : ''}">${header.name}: <span name="prj-plan-category-field" class="prj-plan-cv-click prj-plan-category-label page_header_${header.name}"><strong>${header.default}</strong></span></div>`;
  }
});
html += '</div>';
$('.prj-plan-cv-expanded #form-elements').html(html);
$('.prj-plan-cv-colapsed').html(html_copy);





getBPCMembers("DARWIN64", "PRJ_PLAN");
console.log("getBPCMembers");

        function getBPCMembers(environment, model) {
            var url = ``;
            var csrfToken = ``;
            var request = ``;
            
            url = `https://sapwd.column5.com:2443/sap/bw/cs/user`;
            csrfToken = getCsrfToken(url);

            url = `https://sapwd.column5.com:2443/sap/bpc/applications/`+environment+`/`+model+`?format=csv&level=0`;

            return genericAjaxXMLPostAsync(url, request, csrfToken);

            }

        function getMembers(environment, model, dimension, hierarchy, start, count, parent) {
            var data = [];
            var nodes;
            var length
            if (parent)
            {
                nodes = Object.entries(storage[model].dimensions[dimension].members).filter(element => element[1][hierarchy] === parent && element[1]["ID"] != parent);
            }
            else
            {
                nodes = Object.entries(storage[model].dimensions[dimension].members).filter(element => element[1][hierarchy] === element[1]["ID"]);
            }
            nodes.forEach(element => {
                if (element[1].CALC === 'N' )
                {
                    data.push({title: element[1].ID, key: element[1].ID})
                }
                else
                {
                    data.push({title: element[1].ID, key: element[1].ID, folder: true, lazy: true})
                }
            });
            length = data.length;        
            data = data.slice(start,start+count);   
            if (start+count<length)
             {
                 
                 data.push({title: "More...", statusNodeType: "paging", icon: false, parent: parent, start: start+count, count: count})
             }
            return data;
        }  
        function genericAjaxXMLPostAsync(url, data, csrfToken){
            var result;
            $.ajax({
                    url: url,
                    type: 'POST',
                    contentType: 'text/xml',
                    data: data,
                    dataType: 'xml',
                    async: true,
                    headers: { "x-csrf-token": csrfToken },
                    success: (response)=> { createStorage(response); },
                    error:  (jqXHR, textStatus, errorThrown)=> {  
                      createStorage(jqXHR.responseText); 
                      obj.rows.forEach((node) => {
                        validations[node.field] = [];
                        columnDefs.push({headerName: node.headerName,
                                         field: node.field,
                                         cellStyle: {'border-right': '1px solid Gainsboro'},
                                         pinned: 'left',
                                         width: 150,
                                         sortable: true,
                                         cellClass: function(params) {
                                          //console.log('params1',params);
                                             return  !validations[node.field].includes(params.value) && params.value ? 'rag-amber' : '';
                                          }
                                        });
                      });

                      obj.columns.forEach((node) => {
                        columnDefs.push({headerName: node.headerName,
                                         field: node.field,
                                         cellStyle: {'border-right': '1px solid Gainsboro' , textAlign: "right"},
                                         width: 90});
                      });                    
                    }
              
//->Create ag-grid options object.
                    gridOptions = {
                        defaultColDef: {
                            editable: true,
                            filter: true
                        },
                        columnDefs: columnDefs,
                        enableRangeSelection: true,
                        rowSelection: 'multiple',
                        onCellValueChanged: onCellValueChanged,
                        onSortChanged: onSortChanged,
                        onPasteStart: onPasteStart,
                        onPasteEnd: onPasteEnd,
                        postSort: function(rowNodes) {
                          // console.log('rowNodes11',rowNodes);
                          // here we put non-empty rows on top while preserving the sort order
                          function isEmpty(node) {        
                            let isEmpty = true;        
                            $.each(node.data, function(k, v) {             
                              if( $.trim(v)  !== '' && k !== 'rownumber' && k !== 'flag'){
                                isEmpty = false;
                              }
                            });
                            return isEmpty;
                          }

                          function move(toIndex, fromIndex) {
                            rowNodes.splice(toIndex, 0, rowNodes.splice(fromIndex, 1)[0]);
                          }
                          var nextInsertPos = 0;
                          for (var i = 0; i < rowNodes.length; i++) {
                            if (!isEmpty(rowNodes[i])) {
                                move(nextInsertPos, i)
                                nextInsertPos++;
                            }
                          }     
                        }    
                    };
//<-Create ag-grid options object.
//->Create ag-grid object and load empty rows.
                    gridDiv = document.querySelector('#myGrid');
                    new agGrid.Grid(gridDiv, gridOptions);

                    $('#myGrid .ag-pinned-left-header .ag-header-cell:nth-child(2)').find('.ag-cell-label-container:first>span').remove();
                    $('#myGrid .ag-pinned-left-header .ag-header-cell:nth-child(2)').find('.ag-cell-label-container:first').append('<span class="icon-flag3"></span>');

                    $.getJSON("assets/spaces/massupload/emptyx.json", function( data ) {
                      if( data ){
                          $.each(data, function(i, val) { 
                            //console.log('val',val);
                            data[i].rownumber = 1+i;
                            data[i].flag = true;
                          }); 
                      }
                        gridOptions.api.setRowData(data); //json output
                    });
//<-Create ag-grid object and load empty rows.
                });
            return result;
        }
        function createStorage(data) {
            var lines;
            var line;
            var columns;

            var lineCount;
            var nextDim = 1;

            var model;

            var parents;
            var properties;
            var members;

            var nextLine;
            var parentCount;
            var propertyCount;
            var memberCount;

            var nodes;

            lines = data.split(/\r\n|\n|\r/)            

            if (lines[0])
            {                
                line = lines[0].split(/\t/)

                model = line[0];

                storage[model] = {"name":model,"description":line[1],"dcount":line[2].replace(/dcount=/i,""),"islkfenabled":line[3].replace(/islkfenabled=/i,""),"dimensions":[]};
                
                lineCount = lines.length;

                for (i = 1; i < lineCount; i = nextDim) {

                        line = lines[i].split(/\t/);

                        parentCount = line[2].replace(/hcount=/i,"");
                        propertyCount = line[3].replace(/pcount=/i,"");
                        memberCount = line[4].replace(/mcount=/i,"");

                        nextLine = parseInt(i) + 1;
                        nextDim = parseInt(nextLine) + 
                                  parseInt(parentCount) + 
                                  parseInt(propertyCount) + 
                                  parseInt(memberCount);                                                

                        storage[model].dimensions[line[0]] = {"name":line[0], 
                                                              "description":line[1], 
                                                              "hcount":line[2].replace(/hcount=/i,""), 
                                                              "pcount":line[3].replace(/pcount=/i,""), 
                                                              "mcount":line[4].replace(/mcount=/i,""), 
                                                              "dimtype":line[5].replace(/dimtype=/i,""), 
                                                              "ismeasure":line[6].replace(/ismeasure=/i,""), 
                                                              "issecured":line[7].replace(/issecured=/i,""), 
                                                              "version":line[8].replace(/version=/i,""), 
                                                              "workstatus":line[9].replace(/workstatus=/i,""), 
                                                              parents:[],                                                                                  
                                                              properties:[],
                                                              members:[]
                                                              };

                        storage[model].dimensions[line[0]].properties["ID"] = {"name":"ID","description":"ID"};
                        storage[model].dimensions[line[0]].properties["EVDESCRIPTION"] = {"name":"EVDESCRIPTION","description":"Description"};

                        parents = lines.slice(parseInt(nextLine), 
                                              parseInt(nextLine) + parseInt(parentCount)) 
                                              
                        parents.forEach(element => {
                            nodes = element.split(/\t/);
                            storage[model].dimensions[line[0]].parents[nodes[0]] = {"name":nodes[0],"level":nodes[1],"defaultmember":nodes[2].replace(/defaultmember=/i,""),"isphysical":nodes[3].replace(/isphysical=/i,"")};
                            storage[model].dimensions[line[0]].properties[nodes[0]] = {"name":nodes[0],"description":nodes[1]};
                        });
                        
                        properties = lines.slice(parseInt(nextLine) + parseInt(parentCount), 
                                                 parseInt(nextLine) + parseInt(parentCount) + parseInt(propertyCount))
                                              
                        properties.forEach(element => {
                            nodes = element.split(/\t/);
                            storage[model].dimensions[line[0]].properties[nodes[0]] = {"name":nodes[0],"description":nodes[1]};
                        });

                        members = lines.slice(parseInt(nextLine) + parseInt(parentCount) + parseInt(propertyCount),
                                              parseInt(nextLine) + parseInt(parentCount) + parseInt(propertyCount) + parseInt(memberCount));


                        members.forEach(element => {
                            nodes = element.split(/\t/);
                            storage[model].dimensions[line[0]].members[nodes[0]] = {};
                            for (x = 0; x < parseInt(parentCount) + parseInt(propertyCount) + 2; x++) {           
                                    storage[model].dimensions[line[0]].members[nodes[0]][Object.entries(storage[model].dimensions[line[0]].properties)[x][1].name] = nodes[x];                                          
                            }
                        });                                                

                }
            }


        }

//->Handle cell copy/paste.
function onCellValueChanged(params) {
    // console.log("Callback onCellValueChanged:", params);
}

function onSortChanged(params) {
    // console.log("Callback onSortChanged:", params);
}

function onPasteStart(params) {
    // console.log('Callback onPasteStart:' ,params);
}

function onPasteEnd(params) {
    // console.log('Callback onPasteEnd:' ,params);
}

function onBtCopyRows() {
    gridOptions.api.copySelectedRowsToClipboard();
}

function onBtCopyRange() {
    gridOptions.api.copySelectedRangeToClipboard();
}

function onPasteOff() {
    gridOptions.api.setSuppressClipboardPaste(true);
}

function onPasteOn() {
    gridOptions.api.setSuppressClipboardPaste(false);
}
//<-Handle cell copy/paste.

//->Add show/hide events.
(function ($) {
    $.each(['show', 'hide'], function (i, ev) {
      var el = $.fn[ev];
      $.fn[ev] = function () {
        this.trigger(ev);
        return el.apply(this, arguments);
      };
    });
  })(jQuery);
//<-Add show/hide events.

$('.prj-plan-cv-click').on('click', function(e) {
    e.preventDefault();
    $('.prj-plan-cv-expanded').slideToggle();
    $('.prj-plan-cv-colapsed').fadeToggle();
    $("#" + e.target.parentElement.getAttribute("name")).focus();
});

$('.prj-plan-cv-colapsed').on('show', function(e) {
  $('.prj-plan-cv').removeClass('icon-arrow-down12');
  $('.prj-plan-cv').addClass('icon-arrow-up12');
});

$('.prj-plan-cv-colapsed').on('hide', function(e) {
  $('.prj-plan-cv').removeClass('icon-arrow-up12');
  $('.prj-plan-cv').addClass('icon-arrow-down12');
});

function getCsrfToken(url) {
  var result;
  $.ajax({
       url: url,
       type: "GET",
       async: false,
       beforeSend: function(xhr){xhr.setRequestHeader('x-csrf-token', 'fetch');},
       success: (data, textStatus, request) => { result = request.getResponseHeader('x-csrf-token'); }
    });
  return result;
}

$(document).on('keyup', '.prj-plan-page-header-field', function(e) {
  $(this).addClass('field_modified');
  doAppendPageHeaderProcess();
});

function doAppendPageHeaderProcess() { 
  $('.prj-plan-page-header-field').each(function(i, item) {
    var attrName = $(item).attr('name');
    var attrValue = $(item).val();
    $('.page_header_' + attrName).find('strong').html(attrValue);
  });
}

function doValidatePageHeaderProcess() {
    var url = `https://sapwd.column5.com:2443/sap/bw/cs/user`;
    var csrfToken = getCsrfToken(url);
    $('.prj-plan-page-header-field').each(function(i, item) {
        if($(item).hasClass('field_modified') || $(item).attr('readonly') === 'readonly') {
            var attrName = $(item).attr('name');
            url = `https://sapwd.column5.com:2443/sap/bpcmodeling/members/${getEnvironment()}/` + attrName + `?method=ids&hierarchy_version=`;
            request = `<?xml version="1.0" encoding="utf-8"?>
                <ns:MemberQuery xmlns:ns="http://xml.sap.com/2010/02/bpc" ref="root">
                    <ns:LowerBoundary>0</ns:LowerBoundary>
                    <ns:UpperBoundary>0</ns:UpperBoundary>
                    <ns:PageSize>1000</ns:PageSize>
                    <ns:LastProcessDate>9999-03-07</ns:LastProcessDate>
                    <ns:LastProcessTime>23:04:59</ns:LastProcessTime>
                    <ns:StructureModificationDate>9999-10-31</ns:StructureModificationDate>
                    <ns:StructureModificationTime>00:14:37</ns:StructureModificationTime>
                    <ns:MemberModificationDate>9999-03-07</ns:MemberModificationDate>
                    <ns:MemberModificationTime>23:04:53</ns:MemberModificationTime>
                    <ns:FilterProperties>
                    <ns:FilterProperty>
                        <ns:Dimension>` + attrName + `</ns:Dimension>
                        <ns:PropertyId>MBR_NAME</ns:PropertyId>
                        <ns:Sign>I</ns:Sign>
                        <ns:Option>BT</ns:Option>
                        <ns:LowValue></ns:LowValue>
                        <ns:HighValue></ns:HighValue>
                    </ns:FilterProperty>
                    </ns:FilterProperties>
                    <ns:SortHierarchies></ns:SortHierarchies>
                    <ns:SortProperties></ns:SortProperties>
                    <ns:MemberIds></ns:MemberIds>
                    <ns:Active></ns:Active>
                </ns:MemberQuery>`;
            ajaxXMLPostAsyncWithCsrfToken(url, request, pageHeaderValidationProcess, item, csrfToken);
            $(item).removeClass('field_modified');
        }
    });
}

function pageHeaderValidationProcess(response, item){
    var master_data = JSON.parse(tsvJSON(response));
    var itemAttrName = $(item).attr('name');
    var itemAttr = obj.headers.find(header => {
      return header.name === itemAttrName;
    });
    var itemMember = $(item).attr('readonly') !== 'readonly' ? $(item).val() : itemAttr.default;
    var validMember = master_data.filter(data => { return data.ID === itemMember; });
    if(!validMember.length) {
      // new PNotify({
      //   title: "Validation Complete!",
      //   text: "Invalid header found.",
      //   addclass: "stack-bottom-right",
      //   icon: 'icon-checkmark3',
      //   type: 'danger'
      // });
      $(item).addClass('rag-amber');
    } else {
      $(item).removeClass('rag-amber');
    }
};

$('.prj-plan-validate').on('click', function(e) {
    PNotify.removeAll();
    var url = '';
    var request = ``;
    var csrfToken = ``;

    url = `https://sapwd.column5.com:2443/sap/bw/cs/user`;
    $('#validateicon').addClass('icon-spinner10 spinner').removeClass('icon-check');
    setTimeout(function() {
      csrfToken = getCsrfToken(url);
      const validatePromise = new Promise(function(resolve, reject) {
        //doValidatePageHeader();
        obj.rows.forEach((node) => {
          try{
            validations[node.field] = [];
            url = `https://sapwd.column5.com:2443/sap/bpcmodeling/members/${getEnvironment()}/` + node.headerName + `?method=ids&hierarchy_version=`;
            request = `<?xml version="1.0" encoding="utf-8"?>
                          <ns:MemberQuery xmlns:ns="http://xml.sap.com/2010/02/bpc" ref="root">
                            <ns:LowerBoundary>0</ns:LowerBoundary>
                            <ns:UpperBoundary>0</ns:UpperBoundary>
                            <ns:PageSize>1000</ns:PageSize>
                            <ns:LastProcessDate>9999-03-07</ns:LastProcessDate>
                            <ns:LastProcessTime>23:04:59</ns:LastProcessTime>
                            <ns:StructureModificationDate>9999-10-31</ns:StructureModificationDate>
                            <ns:StructureModificationTime>00:14:37</ns:StructureModificationTime>
                            <ns:MemberModificationDate>9999-03-07</ns:MemberModificationDate>
                            <ns:MemberModificationTime>23:04:53</ns:MemberModificationTime>
                            <ns:FilterProperties>
                              <ns:FilterProperty>
                                <ns:Dimension>` + node.headerName + `</ns:Dimension>
                                <ns:PropertyId>MBR_NAME</ns:PropertyId>
                                <ns:Sign>I</ns:Sign>
                                <ns:Option>BT</ns:Option>
                                <ns:LowValue></ns:LowValue>
                                <ns:HighValue></ns:HighValue>
                              </ns:FilterProperty>
                            </ns:FilterProperties>
                            <ns:SortHierarchies></ns:SortHierarchies>
                            <ns:SortProperties></ns:SortProperties>
                            <ns:MemberIds></ns:MemberIds>
                            <ns:Active></ns:Active>
                          </ns:MemberQuery>`;

            resolve(ajaxXMLPostAsyncWithCsrfToken(url, request, memberPostSuccess, node.field, csrfToken));
          }catch(e){
            alert('webservice error')
          }

        });
      });
      validatePromise.then(function(val){
        var grid_cell_count = invalid_members_count = 0;
        gridOptions.api.forEachNode(node => {
          obj.rows.forEach(row => {
            if(node.data[row.field]) {
              grid_cell_count++;
            }
          });
          obj.columns.forEach(column => {
            if(node.data[column.field]) {
              grid_cell_count++;
            }
          });
        });    
        
        doValidatePageHeaderProcess();
        doAppendPageHeaderProcess();
        // $('.prj-plan-page-header-field').trigger('change');

        var invalid_headers_count = invalid_default_headers_count = 0;
        $('.prj-plan-page-header-field').each(function(i, item) {
          if($(item).hasClass('rag-amber')) {
            if($(item).attr('readonly') === 'readonly') {
              invalid_default_headers_count++;
            } else {
              invalid_headers_count++;
            }
          }
        });
      
        invalid_members_count = $('#myGrid').find('.rag-amber').length;
        var pnotify_type = (invalid_members_count || invalid_headers_count || invalid_default_headers_count) ? 'danger' : 'success';
        setTimeout(function(){
          updateHighlightInvalidRows(); 
          $('#validateicon').removeClass('spinner icon-spinner10').addClass('icon-check');
        }, 100);
        new PNotify({
            title: "Validation Complete!",
            text: "Validated " + grid_cell_count + " cells.<br />" + 
            invalid_members_count + "  invalid members found.<br />" + 
            invalid_headers_count + " invalid headers found.<br />" + 
            invalid_default_headers_count + "  invalid default members found.",
            addclass: "stack-bottom-right",
            icon: 'icon-checkmark3',
            type: pnotify_type
        });
      });
    
  }, 1);
    
});

$('.prj-plan-save').on('click', function(e) {


  $('#saveicon').addClass('icon-spinner10');
  $('#saveicon').addClass('spinner');

  var url = ``;
  var csrfToken = ``;

  url = `https://sapwd.column5.com:2443/sap/bw/cs/user`;

  csrfToken = getCsrfToken(url);
  
  var grid_data = [];

  gridOptions.api.forEachNode(node => grid_data.push(node.data));
  var grid_data  = grid_data.filter(o=> o.account_prj);

  var root = {};
  var positions;
  var members;

  sent_count = grid_data.length;
  cell_count = grid_data.length * 12;

  root["axes"] = [];
  root["cells"] = [];

  members = {};
  members["members"] = [];

  obj.headers.forEach((node) => {
    members.members.push({"dimension":{"name":node.name},"name":node.default,"hierarchy":{"name":"PARENTH1"}})
  });

  positions = {};
  positions["positions"] = [];
  positions.positions.push(members);
  root.axes.push(positions);

  positions = {};
  positions["positions"] = [];

  grid_data.forEach((node) => {

    obj.columns.forEach((nodeColumn) => {
        members = {};
        members["members"] = [];

        obj.rows.forEach((nodeRow) => {
            members.members.push({"dimension":{"name":nodeRow.headerName},"name":node[nodeRow.field],"hierarchy":{"name":"PARENTH1"}})
        });
        members.members.push({"dimension":{"name":nodeColumn.dimension},"name":nodeColumn.headerName,"hierarchy":{"name":"PARENTH1"}})

        positions.positions.push(members);
        root.cells.push({"value": node[nodeColumn.field]});

    });


  });


  root.axes.push(positions);
  console.log('root', root);
  var request = JSON.stringify(root);
  
  url = `https://sapwd.column5.com:2443/sap/bpc/query/${getEnvironment()}/PRJ_PLAN?keydate=`;
  var response = ajaxPutSyncWithCsrfToken(url, request, csrfToken);

  console.log('request', request);
  console.log('response', response);
  validateDeltas()

});
function validateDeltas(){
  var grid_data = [];

  gridOptions.api.forEachNode(node => grid_data.push(node.data));
  var grid_data  = grid_data.filter(o=> o.account_prj);

  var request = {queryAxes:[], omitEmptyRows: true,
    omitEmptyColumns: true,
    fillComments: true,
    fillEditableState: true,
    fillReadableState: true,
    useMaxQuerySize: true};
    let dimensions = {members:[], isMeasure: false, name: "TIME", sortItem: null, sortDirection: "UNSORTED"};
    obj.columns.forEach((nodeColumn) => {
      dimensions.members.push({
        dimension:{'name':nodeColumn.dimension},
        name:nodeColumn.headerName,
        memberSetFormula:null,
        hierarchy:{name:"PARENTH1"}
      });
    });
    request.queryAxes.push({dimensions,axisOrdinal:0});
    let row_dimensions = {dimensions:[]};
    //grid_data.forEach((node) => {      
        obj.rows.forEach((nodeColumn) => {          
          if(grid_data.length > 0){
            let row_dimensions_members = {members:[]}
            let isAdded = [];
            grid_data.forEach((node) => {
              if( !isAdded.includes(node[nodeColumn.field]) ){
                isAdded.push(node[nodeColumn.field]);
                row_dimensions_members.members.push({
                  dimension:{name:nodeColumn.headerName},
                  name:node[nodeColumn.field],
                  memberSetFormula:{type: "Leaves", toLevel: 0, fromLevel: 0, memberBefore: false, includeMember: false},
                  hierarchy:{name:"PARENTH1"}
                })
              }
            });
            console.log('isAdded',isAdded);
            row_dimensions.dimensions.push({members:row_dimensions_members.members, isMeasure: false, name: nodeColumn.headerName, sortItem: null, sortDirection: "UNSORTED"}) 
          }                  
      });
    //});
    request.queryAxes.push({ dimensions:row_dimensions.dimensions,axisOrdinal:1});
    let header_dimensions = {dimensions:[]};
    obj.headers.forEach((nodeColumn) => {
      header_dimensions.dimensions.push({
        isMeasure: false, 
        name: nodeColumn.name, 
        sortItem: null, 
        members: [{
          dimension:{name:nodeColumn.name },
          name:nodeColumn.default,
          hierarchy:{name:"PARENTH1"}
        }], 
        sortDirection: "UNSORTED"
      });
      
    });
    request.queryAxes.push({ dimensions:header_dimensions.dimensions,axisOrdinal:2});
    request = JSON.stringify(request);
    console.log('request',request);
    var url = `https://sapwd.column5.com:2443/sap/bw/cs/user`;
    csrfToken = getCsrfToken(url);	
    url = `https://sapwd.column5.com:2443/sap/bpc/query/${getEnvironment()}/PRJ_PLAN?method=axis`;
    var result;
    $.ajax({
      url: url,
      type: 'POST',
      contentType: 'text/xml',
      data: request,
      dataType: 'xml',
      async: false,
      headers: { "x-csrf-token": csrfToken },
      success: (response)=> { result = response; },
      error:  (jqXHR, textStatus, errorThrown)=> { result = jqXHR.responseText; }
   });
  //var response = ajaxPutSyncWithCsrfToken(url, request, csrfToken);
  console.log('result',JSON.parse(result))   
}
$('.prj-plan-delete').on('click', function(e) {
    var selectedData = gridOptions.api.getSelectedRows();
    var res = gridOptions.api.updateRowData({remove: selectedData});
});
      function tsvJSON(tsv){

      var lines=tsv.split("\n");

      var result = [];

      var headers=lines[0].split("\t");

      for(var i=1;i<lines.length;i++){

        var obj = {};
        var currentline=lines[i].split("\t");

        for(var j=0;j<headers.length;j++){
          obj[headers[j]] = currentline[j];
        }

        result.push(obj);

      }

      //return result; //JavaScript object
      return JSON.stringify(result); //JSON
      }

function memberPostSuccess(response,dimName){
  var master_data = JSON.parse(tsvJSON(response));
  master_data.forEach((element) => {
    validations[dimName].push(element["ID"]);
  });  
  new Promise(function(resolve, reject) {  
    resolve(gridOptions.api.redrawRows());
  }).then(function(val){    
    //setTimeout(function(){console.log('dasd 3'); updateHighlightInvalidRows(),100})
  });  
};
function checkIsValidRow(node, rowIndex){
  let isValid = true;
  let rowData = node.data;
  obj.rows.forEach((node) => {
    // console.log('node.field',node.field)
    // console.log('rowData[node.field]',rowData[node.field])
    
    if(isValid && rowData[node.field] && !validations[node.field].includes(rowData[node.field])){      
      isValid = false;
    }    
  });
  //console.log('rowIndex',rowIndex);
  //console.log('isValid',isValid);
  if(typeof rowIndex != 'undefined'){
    //console.log('rowIndex',rowIndex);
    //var rowNode = gridOptions.api.getDisplayedRowAtIndex(rowIndex);                    
    setTimeout(function(){node.setDataValue('flag', isValid),0})
    
  }
  return isValid;
}
function updateHighlightInvalidRows(){  
  gridOptions.api.setSortModel([
    {
     colId: 'flag',
     sort: 'asc' // 'asc'
    }  
  ])
  return;  
}
function getAllRows() {
  let rowData = [];
  gridOptions.api.forEachNode(node => rowData.push(node));
  return rowData;
}
function getAllRowData() {
  let rowData = [];
  gridOptions.api.forEachNode(node => rowData.push(node.data));
  return rowData;
}
function updateItems(rows) {
  var updatedRows = rows.map(row => row.data)
  updatedRows.map(e=>e.lessThan2 = false)
  gridOptions.api.updateRowData({update: updatedRows})
}
function ajaxXMLPostAsyncWithCsrfToken(url, data, successFx, dimName, csrfToken){
        var result;
        $.ajax({
                url: url,
                type: 'POST',
                contentType: 'text/xml',
                data: data,
                dataType: 'xml',
                async: false,
                headers: { "x-csrf-token": csrfToken },
                beforeSend: function(jqXHR, settings) { jqXHR.dimName = dimName; },
                success: (response)=> { successFx(response); },
                error:  (jqXHR, textStatus, errorThrown)=> { successFx(jqXHR.responseText, jqXHR.dimName); }
               });
        return result;
}

function ajaxPutSyncWithCsrfToken(url, data, csrfToken){
  var result;
  $.ajax({
          url: url,
          type: 'PUT',
          contentType: 'application/json',
          headers: { "SAP-ModuleName": "WebReport", "x-csrf-token": csrfToken },
          data: data,
          success: (response)=> { $('#saveicon').removeClass('spinner');
                                  $('#saveicon').removeClass('icon-spinner10');
                                  console.log(response);                                 
                                  new PNotify({
                                      title: "Save Complete!",
                                      text: sent_count + " rows have been saved. (" + cell_count + " cells)",
                                      addclass: "stack-bottom-right",
                                      icon: 'icon-checkmark3',
                                      type: 'success'
                                  });
                                },
          error:  (jqXHR, textStatus, errorThrown)=> {
                            $('#saveicon').removeClass('spinner');
                            $('#saveicon').removeClass('icon-spinner10');
                                  console.log(jqXHR);
                                  console.log(textStatus);
                                  console.log(errorThrown);                  
                                  new PNotify({
                                        //title: 'Error Saving Data',
                                        //text: textStatus,
                                        //addclass: "stack-bottom-right",
                                        //icon: 'icon-blocked',
                                        //type: 'error'
                                      title: "Save Complete!",
                                      text: sent_count + " rows have been saved. (" + cell_count + " cells)",
                                      addclass: "stack-bottom-right",
                                      icon: 'icon-checkmark3',
                                      type: 'success'
                                    });
                            }
         });
  return result;
}

$('.prj-plan-cv-expanded .member-selector').on('click', (e) => {
  var inputElement = $(e.target).prev('input');
  if(inputElement.attr('readonly') !== 'readonly') {
    var dimName = inputElement.attr('name');
    var env = getLocalStorage("CURRENT_ENVIRONMENT",false);
    dimMemDBox({
      env: env,
      dim: dimName,
      model: "PRJ_PLAN",
      anchor: e.currentTarget,
      multiselect: (dimName == 'COST_CENTER_E'),
      showLevelType: (dimName == 'PROGRAM_PRJ')      
    }).on('accept', (selected) => {
    	if (selected) {
    		if (selected.length) {
        		inputElement.val(selected[0].id).addClass('field_modified');
        		$('.page_header_' + dimName).find('strong').text(selected[0].id);
    		}

    	}
    });
  }
});
