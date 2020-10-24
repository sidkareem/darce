$(document).ready(function() {
    getInstalledVersionsDetail();
});

$('#search-installed-versions').keyup(function() {
    $('.installed-versions-main-table').DataTable().search($(this).val()).draw();
});

$('.installed-versions-refresh-btn').on('click', function() {
    getInstalledVersionsDetail();
});

// Get installed versions detail
function getInstalledVersionsDetail() {
    try {
        $('.installed-versions-refresh-btn').children().addClass('spin');
        getWsVersionsDarceRBind(true, getInstalledVersionsTableRowData);
    } catch (error) {
        displayCatchError('iv-table');
        return false;
    }
}

// Get installed versions table row data
function getInstalledVersionsTableRowData(ivLists = []) {
    var list = '';
    var installedVersionsLists = [];
    if(typeof(ivLists) !== 'undefined' && !$.isArray(ivLists)){
        installedVersionsLists.push(ivLists);
    }else{
        installedVersionsLists = ivLists;
    }
    if(typeof(installedVersionsLists) !== 'undefined' && installedVersionsLists !== '') {
        $.each(installedVersionsLists, function(i, item) {
            list += `
                <tr>
                    <td>${item.Version}</td>
                    <td>${item.Descr}</td>
                    <td>${(moment(item.ReleaseDate).isValid()) ? moment(item.ReleaseDate).format('MM/DD/YYYY') : '00/00/0000'}</td>
                    <td>${(moment(item.InstalledDate).isValid()) ? moment(item.InstalledDate).format('MM/DD/YYYY') : '00/00/0000'}</td>
                </tr>
            `;
        });
    }
    loadInstalledVersionsTable(list);
}

// Load installed versions table
function loadInstalledVersionsTable(ivLists = []) {
    destroyDataTableInstance('installed-versions-main-table');
    $('.installed-versions-main-table').find('tbody').html(ivLists);
    initializeInstalledVersionsTable('installed-versions-main-table');
    $('.installed-versions-refresh-btn').children().removeClass('spin');
}