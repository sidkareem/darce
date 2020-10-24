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
	// console.log('drwn_spaces',drwn_spaces);
	// console.log('drwn_space_items',drwn_space_items);
	// console.log('drwn_pages',drwn_pages);
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
		if(intClickedSpaceID !== '1040'){
		$('#' + strTabContentID).append('<div id="' + strPageDivID + '" class="tab-pane has-padding active">');		
			$('#' + strPageDivID).load(strPagePath, function( response, status, xhr ) {
				if ( status == "error" ) {
					displayCatchError('maintenance');
					$('#' + strPageDivID).remove();
				}
			});
		}
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
	if(intClickedSpaceID === '1040'){
		if(document.getElementById('dim_overview_tab') == null){			
			strPageDivID = 'dim_overview_tab';
			//strTabDivID = 'dim_overview_tab';
			$('#' + strTabContentID).append('<div id="dim_overview_tab" class="tab-pane has-padding active">');	
			$('#' + strTabContentID +' .tab-pane').load('assets/spaces/dimension/dimension.html?'+(new Date()).getTime());		
			setTimeout(function() {
				drwn_dim_sidebar_item_click(intClickedSpaceID,intClickedSpaceItemID);
			},100);
		}else{				
			drwn_dim_sidebar_item_click(intClickedSpaceID,intClickedSpaceItemID);
		}
		//return;
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
	// console.log('intSpaceID',intSpaceID)
	// console.log('strSidebarID',strSidebarID)
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
	updateDimensionSidebar();
}



$(document).on('click',"#drwn_dim_tab .close-dim-tab",function() {
	
	var div_id = $(this).attr('attr-strpagedivid');
	$(this).parent('a').parent('li').addClass('dasdsa');
	var newObj = null;
	if($(this).parent('a').parent('li').hasClass('active')){
		newObj = $(this).parent('a').parent('li').prev().children('a')
	}	
	var strTabDivID =  "#drwn_dim_tab_" + div_id;
	var strPageDivID = "#drwn_dim_pg_" + div_id;
	$(strTabDivID).remove();
	$(strPageDivID).remove();
	$(newObj).addClass('dasdsa');
	
	if(newObj != null){
		$(newObj).trigger('click');
	}
	
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
	//var drwn_spaces = getLocalStorage('drwn_spaces', false);
	drwn_spaces["1040"] = {
		SPACE_SHORT_DESCR: 'BPC DIM UPDATES',
		DEFAULT_PAGE: '100039',
		SPACE_ICON:'icon-cube3'
	};
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
	//var drwn_space_items = getLocalStorage('drwn_space_items', false);
	drwn_space_items['1040_101'] = {
		DARWIN_OBJECT_ID: '100039',
		ITEM_TYPE: "HEADING",
		POSITION_NUM: "0",
		SPACE_ITEM_TEXT_OVR: "CONFIG",
		SPACE_ITEM_ICON_OVR: "",
		PARENT: "",
		CLOSABLE: '-'
	};
	drwn_space_items['1040_102'] = {
		DARWIN_OBJECT_ID: '100040',
		ITEM_TYPE: "PAGE_LINK",
		POSITION_NUM: "1",
		SPACE_ITEM_TEXT_OVR: "INCOME STATEMENT",
		SPACE_ITEM_ICON_OVR: "",
		PARENT: "",
		CLOSABLE: 'x'
	};
	drwn_space_items['1040_103'] = {
		DARWIN_OBJECT_ID: '100041',
		ITEM_TYPE: "PAGE_LINK",
		POSITION_NUM: "1",
		SPACE_ITEM_TEXT_OVR: "BALANCE SHEET",
		SPACE_ITEM_ICON_OVR: "",
		PARENT: "",
		CLOSABLE: 'x'
	};
	drwn_space_items['1040_104'] = {
		DARWIN_OBJECT_ID: '100042',
		ITEM_TYPE: "PAGE_LINK",
		POSITION_NUM: "1",
		SPACE_ITEM_TEXT_OVR: "CASH FLOW",
		SPACE_ITEM_ICON_OVR: "",
		PARENT: "",
		CLOSABLE: 'x'
	};
	drwn_space_items['1040_105'] = {
		DARWIN_OBJECT_ID: '100043',
		ITEM_TYPE: "PAGE_LINK",
		POSITION_NUM: "1",
		SPACE_ITEM_TEXT_OVR: "FUNCATIONAL P&L",
		SPACE_ITEM_ICON_OVR: "",
		PARENT: "",
		CLOSABLE: 'x'
	};
	drwn_space_items['1040_106'] = {
		DARWIN_OBJECT_ID: '100044',
		ITEM_TYPE: "PAGE_LINK",
		POSITION_NUM: "1",
		SPACE_ITEM_TEXT_OVR: "FX",
		SPACE_ITEM_ICON_OVR: "",
		PARENT: "",
		CLOSABLE: 'x'
	};
	drwn_space_items['1040_107'] = {
		DARWIN_OBJECT_ID: '100045',
		ITEM_TYPE: "PAGE_LINK",
		POSITION_NUM: "1",
		SPACE_ITEM_TEXT_OVR: "TRADING PARTNERS",
		SPACE_ITEM_ICON_OVR: "",
		PARENT: "",
		CLOSABLE: 'x'
	};
	drwn_space_items['1040_108'] = {
		DARWIN_OBJECT_ID: '100046',
		ITEM_TYPE: "PAGE_LINK",
		POSITION_NUM: "1",
		SPACE_ITEM_TEXT_OVR: "CARRY FORWARD",
		SPACE_ITEM_ICON_OVR: "",
		PARENT: "",
		CLOSABLE: 'x'
	};
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
	drwn_pages['100039'] = {
		SHORT_DESCR: 'BPC DIM UPDATES',
		ICON: 'icon-cube3',
		PATH: '#'
	};
	drwn_pages['100040'] = {
		SHORT_DESCR: 'INCOME STATEMENT',
		ICON: 'icon-file-presentation',
		PATH: '#'
	};
	drwn_pages['100041'] = {
		SHORT_DESCR: 'BALANCE SHEET',
		ICON: 'fa fa-balance-scale',
		PATH: '#'
	};
	drwn_pages['100042'] = {
		SHORT_DESCR: 'CASH FLOW',
		ICON: 'icon-cash3',
		PATH: '#'
	};
	drwn_pages['100043'] = {
		SHORT_DESCR: 'FUNCATIONAL P&L',
		ICON: 'icon-file-presentation',
		PATH: '#'
	};
	drwn_pages['100044'] = {
		SHORT_DESCR: 'FX',
		ICON: 'icon-cash2',
		PATH: 'assets/spaces/dimension/fx/fx.html?'+(new Date()).getTime()
	};
	drwn_pages['100045'] = {
		SHORT_DESCR: 'TRADING PARTNERS',
		ICON: 'fa fa-exchange',
		PATH: '#'
	};	
	drwn_pages['100046'] = {
		SHORT_DESCR: 'CARRY FORWARD',
		ICON: 'fa fa-angle-double-right',
		PATH: '#'
	};		
	setLocalStorage('drwn_pages', drwn_pages, false);
	//getWsSettingsRBind(true, updateDefaultHomeSpace);	
	//drwn_sidebar_item_click('1040_106', false, 'not-closable');	
	updateDefaultHomeSpace();
}

function updateDefaultHomeSpace(response) {
	//drwn_sidebar_item_click(response.Value, true, 'not-closable');

	setTimeout(function() {
		var url = new URL(location);
		var drwn_space_item = url.searchParams.get("drwn_space_item");
		//console.log('drwn_space_item',drwn_space_item);
		if(drwn_space_item != null) {			
			drwn_sidebar_item_click(drwn_space_item, false);			
			drwn_sidebar_item_active(drwn_space_item);
		}
	}, 1);
	$('.navigation').find('li').has('ul').children('a').addClass('has-ul');
	$('.navigation').find('li > ul').hide();	
}
async function updateDimensionSidebar(model = 'CONSOL') {
	var drwn_spaces = getLocalStorage('drwn_spaces', false);
	var drwn_space_items = getLocalStorage('drwn_space_items', false);
	var drwn_pages = getLocalStorage('drwn_pages', false);
	// console.log('drwn_spaces',drwn_spaces);
	// console.log('drwn_space_items',drwn_space_items);
	// console.log('drwn_pages',drwn_pages);
	var dimLists = await getIndexedDBStorage('dimensions');
	var dimLists = getWsDimensionRBind(model);
	var dimensionLists = [];
	if (typeof (dimLists) !== 'undefined' && !$.isArray(dimLists)) {
		dimensionLists.push(dimLists);
	} else {
		dimensionLists = dimLists;
	}
	if(!$('.darwin-space-sidebar ul.dim_sidebar')[0]){
		$('.darwin-space-sidebar').append('<ul class="dim_sidebar navigation navigation-main navigation-accordion"></ul>');
	}
	$('.darwin-space-sidebar ul.dim_sidebar').html('<li class="navigation-header">ALL DIMENSIONS</li>');
	$.each(dimensionLists, function (i, item) {
		if (item.Model === model) {			
			$('.darwin-space-sidebar ul.dim_sidebar').append('<li><a href="#" title="' + item.Dimension + '"><i class="icon-cube3"></i> <span>' + item.Dimension + '</span></a></li>');
		}
	});	
	
}
function drwn_dim_sidebar_item_click(intClickedSpaceID,intClickedSpaceItemID) {
	const strTabObjectID = 'drwn_dim_tab';
	const strTabContentID = "drwn_dim_tab_content";
	var drwn_spaces = getLocalStorage('drwn_spaces', false);
	var drwn_space_items = getLocalStorage('drwn_space_items', false);
	var drwn_pages = getLocalStorage('drwn_pages', false);	
	// console.log('drwn_spaces',drwn_spaces);
	// console.log('drwn_space_items',drwn_space_items);
	// console.log('drwn_pages',drwn_pages);
	var strTabDivID =  "drwn_dim_tab_" + intClickedSpaceID + '_' + intClickedSpaceItemID;
	var strPageDivID = "drwn_dim_pg_" + intClickedSpaceID + '_' + intClickedSpaceItemID;
	var  strSidebarID = intClickedSpaceID + '_' + intClickedSpaceItemID;
	if (drwn_space_items[intClickedSpaceID + '_' + intClickedSpaceItemID].ITEM_TYPE == 'PAGE_LINK') {
		var intTargetSpaceID = intClickedSpaceID;  
		var intTargetPageID = drwn_space_items[intClickedSpaceID + '_' + intClickedSpaceItemID].DARWIN_OBJECT_ID 
	}
	var strTabShortDescr = drwn_pages[intTargetPageID].SHORT_DESCR;
	var strTabIcon = drwn_pages[intTargetPageID].ICON;
	var strPagePath = drwn_pages[intTargetPageID].PATH;
	var strPage = drwn_pages[intTargetPageID].SHORT_DESCR;
	var strClosable = (strClosable) ? strClosable : drwn_pages[intTargetPageID].CLOSABLE;

	var iconCross = '';
	//if ( strClosable != "") {
		iconCross = '<i attr-intTargetSpaceID='+intTargetSpaceID+' attr-strPageDivID='+strSidebarID+' class="icon-cross close-dim-tab";></i>';
	//}
	
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
		$('#'+strTabContentID+' > .tab-pane').removeClass('active');
	}

	var page_ref = document.getElementById(strPageDivID);		
	
	if (page_ref == null) {		
		$('#' + strTabContentID).append('<div id="' + strPageDivID + '" class="tab-pane has-padding active">');		
		if(strPagePath != '#'){
			$('#' + strPageDivID).load(strPagePath, function( response, status, xhr ) {
				if ( status == "error" ) {
					displayCatchError('maintenance');
					$('#' + strPageDivID).remove();
				}
			});
		}
	} else {
		$('#' + strPageDivID).addClass("active");
	}
	/************* set the "Active" class on the selected sidebar item ***************/
	$("#_" + strSidebarID).addClass("active");	
	$("#dim_overview_tab").addClass("active");	
	if(document.getElementById(strTabDivID) !== null){
		if (document.getElementById(strTabDivID).className != "active") {
			document.getElementById(strTabDivID + '_a').click();
		}
	}
	 updatePageTitle(strTabShortDescr, strPage);
}
