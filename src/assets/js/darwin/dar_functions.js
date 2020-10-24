$(function(){
	getWsSpacesRBind('%', true, updateDrwnSpaces);
});

function drwn_sidebar_item_active(drwn_space_item) {	
	$('ul.navigation').find('li').removeClass('active');
	$('ul.navigation').find('li#'+drwn_space_item).addClass('active');
	updateURL(drwn_space_item);
}

function updateURL(strSidebarID) {
	var url = new URL(location);
	url.searchParams.set("drwn_space_item", strSidebarID);
	window.history.pushState(null, null, url.href);
}

function drwn_sidebar_item_click(strSidebarID, initialScreen, strClosable = '') 
{
	const strTabObjectID = 'drwn_tab_elements';
	const strTabContentID = "drwn_tab_content";

	if(initialScreen != true) {
		updateURL(strSidebarID);
	}

	var drwn_spaces = getLocalStorage('drwn_spaces', false);
	var drwn_space_items = getLocalStorage('drwn_space_items', false);
	var drwn_pages = getLocalStorage('drwn_pages', false);
	
	//Parse Sidebar ID:  Expected format xxxxx_%SPACE%_%SPACE_ITEM_ID%    Looks for the last two underscores to determine the IDs
	var intLocOfLastUnderscore = strSidebarID.lastIndexOf("_") ;
	var intLocOfSecLastUnderscore = strSidebarID.slice(0,intLocOfLastUnderscore-1).lastIndexOf("_");
	
	var intClickedSpaceID = strSidebarID.slice(intLocOfSecLastUnderscore + 1, intLocOfLastUnderscore);
	var intClickedSpaceItemID = strSidebarID.slice(intLocOfLastUnderscore + 1);
	var strClickedSpaceAndItemID = intClickedSpaceID + "_" + intClickedSpaceItemID;
	
	//get target space and target page
	if (drwn_space_items[strClickedSpaceAndItemID].ITEM_TYPE == 'PAGE_LINK') {
		var intTargetSpaceID = intClickedSpaceID;  //use the space from the clicked item
		var intTargetPageID = drwn_space_items[strClickedSpaceAndItemID].DARWIN_OBJECT_ID  //lookup the page in the space_item table
	} else {
		var intTargetSpaceID = drwn_space_items[strClickedSpaceAndItemID].DARWIN_OBJECT_ID  //lookup the space in the space_items table
		var intTargetPageID = drwn_spaces[intTargetSpaceID].DEFAULT_PAGE  //lookup the page in the space_items table
	}
			
	var strTabDivID = "drwn_tab_" + intTargetSpaceID;
	var strPageDivID = "drwn_pg_" + intTargetSpaceID + '_' + intTargetPageID;
	var strTabShortDescr = drwn_spaces[intTargetSpaceID].SPACE_SHORT_DESCR;
	var strTabIcon = drwn_spaces[intTargetSpaceID].SPACE_ICON;
	var strPagePath = drwn_pages[intTargetPageID].PATH;
	var strPage = drwn_pages[intTargetPageID].SHORT_DESCR;
	var strClosable = (strClosable) ? strClosable : drwn_space_items[strClickedSpaceAndItemID].CLOSABLE;
	
	var iconCross = '';
	//********************** Check to see home tab exist ************************
	if ( $('#drwn_tab_elements li').length >= 1 && strClosable != "") {
		iconCross = '<i attr-intTargetSpaceID='+intTargetSpaceID+' attr-strPageDivID='+strPageDivID+' class="icon-cross close-space-tab";></i>';
	}
	//******************check to see if tab exists, if tab doesn't exist, create it************************
	var tab_ref = document.getElementById(strTabDivID);
	
	if (tab_ref == null) {	  // tab doesn't exist, so create it
		$('#' + strTabObjectID).append('<li id="' + strTabDivID + '" onclick="drwn_update_sidebar_items(\'' + intTargetSpaceID + '\', \'' + strSidebarID + '\');"><a id="' + strTabDivID + '_a" href="#' + strPageDivID + '" data-toggle="tab" attr-space-item='+strTabShortDescr+'><i class="'+strTabIcon+'"></i> ' + strTabShortDescr + iconCross +'</a></li>');
	} else {
		var menuID = strSidebarID.split("_");
		currentMenuID = menuID[0];

		if(parseInt(currentMenuID) === parseInt(intTargetSpaceID)){
			$('#drwn_sb_'+intTargetSpaceID+ ' li').removeClass('active');
			$('#'+strSidebarID).addClass('active');
		}else{
			$('#drwn_sb_'+intTargetSpaceID+ ' li').removeClass('active');
			$('#drwn_sb_'+intTargetSpaceID+ ' li:nth-child(2)').addClass('active');
		}
		
		$('#'+strTabDivID + '_a').attr('href','#'+strPageDivID);
		$('#drwn_tab_content > .tab-pane').removeClass('active');

		//********************** update href to be current page ************************
		//document.getElementById(strTabDivID + '_a').setAttribute("href",strPageDivID);
	}
		
	
	// ****** if the page requested is on the active tab then remove the active class from the current PAGE (div section) ********
	if (document.getElementById(strTabDivID).className == "active" && initialScreen != true) {  //if the target tab is the active tab
		$('.active[id^="drwn_pg_"]').removeClass("active");            //remove the active class from all objects that start with drwn_pg and are currently active
	} 
	
			
	// ************************* check to see if the selected page exists *************************
	var page_ref = document.getElementById(strPageDivID);

	//**************** if page doesn't exist, create and activate it else just activate it *******************
	if (page_ref == null) {
		
		$('#' + strTabContentID).append('<div id="' + strPageDivID + '" class="tab-pane has-padding active">');
		$('#' + strPageDivID).load(strPagePath, function( response, status, xhr ) {
			if ( status == "error" ) {
				displayCatchError('maintenance');
				$('#' + strPageDivID).remove();
			}
		});
	} else {
		$('#' + strPageDivID).addClass("active");
	}
	
			
	//************* set the "Active" class on the selected sidebar item ***************
	//$("[id^=drwn_sb_]").removeClass("active");
	$("#_" + strSidebarID).addClass("active");
	
	
	//****************** if the requested tab is not active, select it (simulate click) ***********************
	if (document.getElementById(strTabDivID).className != "active") {
		document.getElementById(strTabDivID + '_a').click();
	}
	updatePageTitle(strTabShortDescr, strPage);
}

function drwn_update_sidebar_items(intSpaceID, strSidebarID)   //updates the sidebar after a "space" change (or at initialization)
{
	var drwn_spaces = getLocalStorage('drwn_spaces', false);
	var drwn_space_items = getLocalStorage('drwn_space_items', false);
	var drwn_pages = getLocalStorage('drwn_pages', false);

	var strSidebarDivID = 'drwn_sb_' + intSpaceID  // top level sidebar DIV id
	var objSpaceRef = document.getElementById(strSidebarDivID);
	var spaceTitle = drwn_spaces[intSpaceID].SPACE_SHORT_DESCR;
	var defaultPageID = drwn_spaces[intSpaceID].DEFAULT_PAGE;
	var pageTitle = drwn_pages[defaultPageID].SHORT_DESCR;
	
	//**************** if sidebar space doesn't exist, create and show it else just show it *******************
	if (objSpaceRef == null) {
		$("div:visible[id^='drwn_sb_']").hide();
		$('#drwn_sidebar').append('<div id="drwn_sb_' + intSpaceID + '" class="darwin-space-sidebar">' + drwn_create_sidebar_space(intSpaceID));
	} else {
		$("div:visible[id^='drwn_sb_']").hide();
		$(objSpaceRef).show();
	}

	if($.trim(strSidebarID) != "" && $('#drwn_tab_elements li').length > 1) {
		if($('#'+strSidebarDivID).find('.active').length > 0) {
			strSidebarID = $('#'+strSidebarDivID).find('.active').attr('id');
		} else {
			$('#'+strSidebarID).addClass('active');
		}
		updateURL(strSidebarID);
	}
	$('.navigation').find('li').has('ul').children('a').addClass('has-ul');
	$('.navigation').find('li > ul').hide();

	updatePageTitle(spaceTitle, pageTitle);
}



$(document).on('click',"#drwn_tab_elements .close-space-tab",function() {
	var space_name = $(this).closest('a').attr('attr-space-item');
	var close_attr_id = $(this).closest('a').attr('id');
	var target_id = $(this).attr('attr-intTargetSpaceID');
	var div_id = $(this).attr('attr-strPageDivID');
	if($('.calc-group-box .bk-yellow').length > 0) {
		$('#param-close-tab').val(1);
		$('#param-close-tab').attr('attr-id', close_attr_id);
		trackFormChanges();
		return false;
	}
	$("#dialog-confirm-close-space-item").removeClass('hide');
    $("#dialog-confirm-close-space-item").html('Please make sure you save all your work. Any unsaved work will be lost. Click OK to close this space');
    $("#dialog-confirm-close-space-item").dialog({
		title: `Close the ${space_name} space tab`,
        resizable: false,
        height: "auto",
        width: 550,
        modal: true,
        buttons: {  
            "Ok": function() {
                $("#dialog-confirm-close-space-item").addClass('hide');
				$( this ).dialog( "close" );  
				
				$("#drwn_tab_"+target_id).remove();
				$("#drwn_sb_"+target_id).remove();
				$('div[id*=drwn_pg_'+target_id+']').remove();
				if(!$('#drwn_tab_elements li').hasClass('active')){
					$('#drwn_tab_elements li:first-child > a').trigger('click');
				}else{
					var active_tab = $('#drwn_tab_elements .active a').attr('id');
					$('#'+active_tab).trigger('click');
				}

				$('ul.navigation').find('li').removeClass('active');
				$('ul.navigation').find('li:nth-child(2)').addClass('active');
				strSidebarID = $('ul.navigation').find('li:nth-child(2)').attr('id');
				updateURL(strSidebarID);    
            },         
            "Cancel": function() {
                $("#dialog-confirm-close-space-item").addClass('hide');
                $( this ).dialog( "close" );                    
            }
        }
    }); 
});

function get_footer_html() {

	return '&copy; 2018 <a href = "http://www.darwinepm.com">Darwin EPM</a>';
};


function drwn_build_page(page_id) 
{
	this[page_id]()			  	
}

function updateDrwnSpaces(response) {
	var drwn_spaces = {};
	$.each(response, function(i, item) {
		drwn_spaces[item.SpacesId] = {
			SPACE_SHORT_DESCR: item.SpaceShortDescr,
			DEFAULT_PAGE: item.DefaultPage,
			SPACE_ICON: item.SpaceIcon.toLowerCase()
		};
	});
	setLocalStorage('drwn_spaces', drwn_spaces, false);
	getWsSpaceItemsRBind('%', true, updateDrwnSpacesItems);
}

function updateDrwnSpacesItems(response) {
	var drwn_space_items = {};
	$.each(response, function(i, item) {
		drwn_space_items[item.SpaceItemsId] = {
			DARWIN_OBJECT_ID: item.DarwinObjectId,
			ITEM_TYPE: item.ItemType,
			POSITION_NUM: item.PositionNum,
			SPACE_ITEM_TEXT_OVR: item.SpaceItemTextOvr,
			SPACE_ITEM_ICON_OVR: item.SpaceItemIconOvr.toLowerCase(),
			PARENT: item.Parent,
			CLOSABLE: item.Closable
		};
	});
	setLocalStorage('drwn_space_items', drwn_space_items, false);
	getWsPageRBind('%', true, updateDrwnPages);
}

function updateDrwnPages(response) {
	var drwn_pages = {};
	$.each(response, function(i, item) {
		if(item.Path != 'javascript:void(0)') {
			var path = (item.Path.indexOf('assets') != -1) ? item.Path : 'assets/' + item.Path;
			path += '?'+(new Date()).getTime()
		}
		drwn_pages[item.PagesId] = {
			SHORT_DESCR: item.ShortDescr,
			ICON: item.Icon.toLowerCase(),
			PATH: path
		};
	});
	setLocalStorage('drwn_pages', drwn_pages, false);
	getWsSettingsRBind(true, updateDefaultHomeSpace);	
}

function updateDefaultHomeSpace(response) {
	drwn_sidebar_item_click(response.Value, true, 'not-closable');

	setTimeout(function() {
		var url = new URL(location);
		var drwn_space_item = url.searchParams.get("drwn_space_item");

		if(drwn_space_item != null) {
			drwn_sidebar_item_click(drwn_space_item, false);
			drwn_sidebar_item_active(drwn_space_item);
		}
	}, 1);
	$('.navigation').find('li').has('ul').children('a').addClass('has-ul');
	$('.navigation').find('li > ul').hide();	
}