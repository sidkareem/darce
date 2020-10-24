$(function() {  
    if(!hasWriteAccess()){
        $('a.add-calc-group').remove();
    }
    $(".modal").draggable({
        handle: ".modal-header"
    });
    $('#search-calc-group').keyup(function() {
        $('.calc-group-table').DataTable().search($(this).val()).draw();
    });
    
    var promise = new Promise((res, rej) => {
        if(typeof $("li.root_" + getParamModelId()+" > ul").html() == 'undefined'){
            var ft =  $(".fancytree-structure").fancytree("getTree");           
            var model_node_key = $("li.root_" + getParamModelId()).attr('key');                 
            var model_group_node =  ft.getNodeByKey(model_node_key);
            model_group_node.render(true, true);
        }
        res('');
    });
    promise.then(() => {
        getCalcGroups();
    });
});

// Get calc groups
async function getCalcGroups() {
    try {
        destroyDataTableInstance('calc-group-table');
        if($("#param-load-calc-group").val()){
            var model = getParamModelId();
            if(model == '') {
                model = '%';
            }      
            var response = await getCalcGroupLists(false,model);                
            if(!response) {               
                response = await getCalcGroupLists(true,model);
            }
            listCalcGroups(response);
        }else{
            initializeCalcGrpTable();
        }
        removeSpin('.calc-group-list-refresh');   
    } catch (error) {
        displayCatchError('calc-group-table');
        return false;
    }
}

// List calc groups
async function listCalcGroups(calcGrpLists) {
    try {
        var calcGroupLists = [];
        if(calcGrpLists !== null) {
            if(typeof(calcGrpLists) !== 'undefined' && !$.isArray(calcGrpLists)){
                calcGroupLists.push(calcGrpLists);
            }else{
                calcGroupLists = calcGrpLists;
            }
            var list = '';    
            if(typeof(calcGroupLists) !== 'undefined'){        
                calcGroupLists = calcGroupLists.sort(function(a, b) {
                    return a.CalcGroupId.localeCompare(b.CalcGroupId)
                });
                for (item of calcGroupLists) {
                    list += await addCalcGroupTableRow(item);
                }
            }
            $('.calc-group-table').find('tbody').html(list);
        }
        initializeCalcGrpTable();
    
        var context_menu_action = $("#param-context-menu-action").val();
        if(context_menu_action !== ''){
            var node_title = $("#param-context-menu-title").val();
            if(context_menu_action === 'delete'){
                deleteCalcGroup(node_title);
            }else if(context_menu_action === 'copy'){
                renameCalcGroup(node_title, 'C');
            }else if(context_menu_action === 'rename'){            
                renameCalcGroup(node_title, 'R');
            }
            $("#param-context-menu-action").val('');
            $("#param-context-menu-title").val('');
        }   
    } catch (error) {
        displayCatchError('calc-group-table');
        return false;
    } 
}

// Add calc group table row
async function addCalcGroupTableRow(item, rowClass = ''){
    try {
        var calc_count = 0;
        var ft = $(".fancytree-structure").fancytree("getTree");        
        var calculations_count = await getIndexedDBStorage('calculations_count');             
        if(typeof(calculations_count[item.CalcGroupId]) !== 'undefined'){
            calc_count = calculations_count[item.CalcGroupId];
        }   
        var ft_CalculationKey = $("li." + item.PrimaryDobjectId + "_" + item.CalcGroupId).attr('key');        
        if (typeof ft_CalculationKey != 'undefined') {
            var ft_CalculationNode = ft.getNodeByKey(ft_CalculationKey);            
            calc_count = ft_CalculationNode.countChildren(false);
        }
        //Cleanup the item for json string
        jQuery.each( ['Environment','PostRunScopeAdj','PreRunScopeAdj','RunCriteria','CalcGroupDescr'], function( i, key ) {
            if(key in item){
                delete item[key];           
            }       
        });   
        list = '<tr class="row_'+item.CalcGroupId+' '+rowClass+'">';
        list += '<td width="40%" class="text-left"> <input type="hidden" class="calcgroup_data" id="calcgroup_'+item.CalcGroupId+'" value="'+escape(JSON.stringify(item))+'" >';
        list += '<a href="javascript:void(0);" class="calc-group-title edit-calc-group" attr-id="' + item.CalcGroupId + '" attr-model="' + item.PrimaryDobjectId + '" ><span class="text-overflow">' + item.CalcGroupId + '</span></a>';
        list += '</td>';
        list += '<td width="10%" class="text-center">';
        list += '<span class="label label-success">'+calc_count+'</span>';
        list += '</td>';
        list += '<td width="20%" class="text-left">' + item.UserIdLastChange + '</td>';
        list += '<td width="20%" class="text-left">' + getFormattedDateTime(item.DateTimeLastChanged) + '</td>';
        list += '</tr>';    
        return list;   
    } catch (error) {
        displayCatchError('calc-group-table');
        return false;
    }
}

// Initialize calc group table
function initializeCalcGrpTable(){
    var columns = [
        null,
        { "orderable": false },
        null,
        null
    ];
    initializeCalcGrpDataTable('calc-group-table', columns);
}