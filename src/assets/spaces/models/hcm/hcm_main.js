$(document).ready(function(){

	$('.hcm-main-page [data-toggle="tooltip"]').tooltip();
	// Setting datatable defaults
  

	

	$('.hcm-main-page .dataTables_length select').select2({
        minimumResultsForSearch: Infinity,
        width: 'auto'
    });
    $('.hcm-main-page .custom_select').select2({
    	minimumResultsForSearch: Infinity,
    	width: 'auto',
    });

	function iformat(icon) {
    var originalOption = icon.element;
	    return $('<span><i class="' + $(originalOption).data('icon') + '"></i>' + icon.text + '</span>');
	}

    $('.hcm-main-page .custom_select_wicon').select2({
    	minimumResultsForSearch: Infinity,
    	width: 'auto',
    	templateSelection: iformat,
    	templateResult: iformat,
    	allowHtml: true
    });

//Data table

//   $.extend( $.fn.dataTable.defaults, {
        
//     });


   var groupColumn = null;

	$('.hcm-main-page .budget_table').DataTable({
		"paging":   false,
        "info":     false,
        "order": [],
        "columnDefs": [{
          "targets": 'no-sort',
          "orderable": false,
        }],
        autoWidth: false,
        columnDefs: [{ 
            orderable: false,
            width: '100px',
            targets: [ 5 ]
        }],
        dom: '<"datatable-header"fl><"datatable-scroll"t><"datatable-footer"ip>',
        language: {
            search: '<span>Filter:</span> _INPUT_',
            searchPlaceholder: 'Type to filter...',
            lengthMenu: '<span>Show:</span> _MENU_',
            paginate: { 'first': 'First', 'last': 'Last', 'next': '&rarr;', 'previous': '&larr;' }
        },
        drawCallback: function () {
            $(this).find('tbody tr').slice(-3).find('.dropdown, .btn-group').addClass('dropup');
        },
        preDrawCallback: function() {
            $(this).find('tbody tr').slice(-3).find('.dropdown, .btn-group').removeClass('dropup');
        }
	});

	$('.hcm-main-page .budget_table tbody').on('click', 'td.accordion_column .toggle_btn', function(){
		
	    $(this).parent().closest('tbody[class*=parent_]').next('tbody[class*=child_]').slideToggle();
	});
    $(".hcm-main-page .toggle_btn").click(function(){
        $(this).toggleClass('shown');
        var classname = $(this).attr('attr-class');
        $('.'+classname+'_child').slideToggle();
    })
});