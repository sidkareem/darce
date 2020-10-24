$(document).ready(function() {
    $("#dim_overview_tab").addClass("active");
    // $('.dimension-main-table').DataTable({        
    //     sort: true,
    //     // paging: false,
    // });
    loadDimFxDatatable();     
    $('#dimension-main-table').on('click', '.edit-dim-member-id .fancytree-title', function () {
        //response = JSON.parse(unescape(json_response));
        var memberData = $(this).parent().parent('.edit-dim-member-id').attr('val');
        memberData = JSON.parse(unescape(memberData));
        //console.log('memberData',memberData);
        $('#field-instructions').val('Update the fields for the selected account');
        $('#field-member-id').val(memberData.id);
        $('#field-member-id').attr('readonly','readonly');
        $('#field-evdesc').val(memberData.desc);
        $('#field-acctype').val(memberData.ACCTYPE);
        $('#field-acc_sub_type').val(memberData.ACC_SUB_TYPE);
        $('#field-rate_type').val(memberData.RATETYPE);
        $('#dim-member-id-modal').modal({ backdrop: 'static', keyboard: false });
        $("#dim-member-id-modal .select-field").select2();
   });   
});

function loadDimFxDatatable() {    
    // $('.dimension-main-table').dataTable({        
    //     searching: false,
    //     paging: false,         
    //     sort: true,
    //     paging:         false,
    // });
    var dimTableData = getDimJSONData();
    //console.log('dimTableData',dimTableData);
    $("#dimension-main-table").fancytree({
        extensions: ["table"],        
        //checkbox: true,
        table: {
            indentation: 20,      // indent 20px per node level
            nodeColumnIdx: 0,     // render the node title into the 2nd column
            sort: true,
            //checkboxColumnIdx: 0  // render the checkboxes into the 1st column
        },
        source: dimTableData,  
        renderColumns: function(event, data) {
            var node = data.node,            
            $tdList = $(node.tr).find(">td");
            var level = data.node.getLevel();
            // console.log('level',level);
            // console.log('node',node);
            $tdList.eq(1).text(node.data.desc);
            $tdList.eq(2).text(node.data.ACCTYPE);
            $tdList.eq(3).text(node.data.ACC_SUB_TYPE);
            $tdList.eq(4).text(node.data.RATETYPE);
            $tdList.eq(0).addClass('edit-dim-member-id');
            $tdList.eq(0).attr('val',escape(JSON.stringify(node.data)));
            if(level == 6){
                $tdList.eq(0).addClass('dim-member-id');                
            }
            // (index #0 is rendered by fancytree by adding the checkbox)
            //$tdList.eq(0).text(node.getIndexHier()).addClass("alignRight");

            // (index #2 is rendered by fancytree)
            //$tdList.eq(0).text(node.key);
            $tdList.eq(4).addClass('text-center').html("END");

            // Style checkboxes
            //$(".styled").uniform({radioClass: 'choice'});
        }
    });
   
}