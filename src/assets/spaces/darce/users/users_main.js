$(document).ready(function() {
    getUsersDetail();
});

$('#search-users').keyup(function() {
    $('.users-main-table').DataTable().search($(this).val()).draw();
});

$('.users-refresh-btn').on('click', function() {
    getUsersDetail();
});

// Get users detail
function getUsersDetail() {
    try {
        $('.users-refresh-btn').children().addClass('spin');
        getWsUserRBind('A', true, getUsersTableRowData);
    } catch (error) {
        displayCatchError('users-table');
        return false;
    }
}

// Get users table row data
function getUsersTableRowData(usrLists = []) {
    var list = '';
    var usersLists = [];
    var users = [];
    var userIds = [];
    if(typeof(usrLists) !== 'undefined' && !$.isArray(usrLists)){
        usersLists.push(usrLists);
    }else{
        usersLists = usrLists;
    }
    if(typeof(usersLists) !== 'undefined' && usersLists !== '') {
        $.each(usersLists, function(i, item) {
            if($.inArray(item.UserId, userIds) === -1) {
                list += `
                    <tr>
                        <td>
                            <span>${item.UserId}</span>
                            <a href="" class="user-title edit-user" attr-id="${item.UserId}"></a>
                            <input type="hidden" class="users_local_data" value="${escape(JSON.stringify(item))}">
                        </td>
                        <td></td>
                        <td>${getUserAccessLevel(item.Useraccess)}</td>
                    </tr>
                `;
                users.push(item.UserId);
                userIds.push(item.UserId);
            }
        });
    }
    loadUsersTable(list);
}

// Load users table
function loadUsersTable(usrLists = []) {
    destroyDataTableInstance('users-main-table');
    $('.users-main-table').find('tbody').html(usrLists);
    initializeUsersTable('users-main-table');
    $('.users-refresh-btn').children().removeClass('spin');
}

// Get user access levelCG
function getUserAccessLevel(useraccess = '') {
    switch(useraccess) {
        case 'DARCE_RO': 
            return 'Read Only';
        case 'DARCE_RW':
            return 'Full';
        default:
            return '';
    }
}