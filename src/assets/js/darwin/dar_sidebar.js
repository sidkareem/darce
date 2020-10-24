function drwn_create_sidebar_space(intSpaceID) {

	var strSidebarDiv = '<ul id="drwn_sb_' + intSpaceID + '" class="navigation navigation-main navigation-accordion">\n';

	//<li class="navigation-header"><span>Main</span> <i class="icon-menu" title="Main pages"></i></li> 

	//loop through each of the SPACE_ITEMS, building the list based on the type of ITEM
	var strSidebarItem;
	var boolActiveSet = false;
	var intCurrentParentID = "";

	var drwn_space_items = getLocalStorage('drwn_space_items', false);
	var drwn_spaces = getLocalStorage('drwn_spaces', false);
	var drwn_pages = getLocalStorage('drwn_pages', false);
	
	for (strSidebarItem in drwn_space_items) {
		
		if (strSidebarItem.slice(0,4) == intSpaceID ) {
		
			var intItemParent = drwn_space_items[strSidebarItem].PARENT;
			var intSpaceItemID = strSidebarItem.slice(strSidebarItem.lastIndexOf("_")+1)
			var strTargetObject = drwn_space_items[strSidebarItem].DARWIN_OBJECT_ID;
			var strItemType = drwn_space_items[strSidebarItem].ITEM_TYPE;
			var strClass = "";
			var strIClass = "";
			var strDescr = drwn_space_items[strSidebarItem].SPACE_ITEM_TEXT_OVR;
			var strIconOvr = drwn_space_items[strSidebarItem].SPACE_ITEM_ICON_OVR
			

			if (intCurrentParentID != intItemParent && intCurrentParentID != "") {
				strSidebarDiv += "</ul></li>\n"
				intCurrentParentID = "";
			}

			switch (strItemType) {
			case "HEADING":
				strSidebarDiv += '<li id="' + strSidebarItem + '" class="navigation-header"><span>' + strDescr + '</span></li>\n' ;
				break;

			case "GROUPING":
				strSidebarDiv += '<li id="' + strSidebarItem + '"> <a href="#" title="'+strDescr+'"><i class="' + strIconOvr + '"></i><span>' + strDescr + '</span></a>\n<ul>' ;
				intCurrentParentID = intSpaceItemID;
				break;

			case "SPACE_LINK":
				if (strTargetObject != "") {
					if (drwn_spaces[strTargetObject].SPACE_ICON != "") {
						strIClass = ' class="' + drwn_spaces[strTargetObject].SPACE_ICON + '" ';
					}
					if (drwn_spaces[strTargetObject].SPACE_SHORT_DESCR != "") {
						strDescr = drwn_spaces[strTargetObject].SPACE_SHORT_DESCR;
					}
					if (boolActiveSet == false) {
						strClass = ' class = "active"';
						boolActiveSet = true
					}
				}
				strSidebarDiv += '<li id="' + strSidebarItem + '" ' + strClass + ' onclick="drwn_sidebar_item_click(this.id)"><a href="#" title="'+strDescr+'"><i ' + strIClass + '></i> <span>' + strDescr + '</span></a></li>\n' ;
				break;
				
			case "PAGE_LINK":
				if (strTargetObject != "") {
					var flag = true;
					$.each(drwn_space_items, function(i, item) {
						if(item.DARWIN_OBJECT_ID === strTargetObject) {
							if(item.SPACE_ITEM_ICON_OVR != '' && item.SPACE_ITEM_TEXT_OVR != '') {
								strIClass = ' class="' + item.SPACE_ITEM_ICON_OVR + '" ';
								strDescr = item.SPACE_ITEM_TEXT_OVR;
								flag = false;
							}
						}
					});
					if(flag) {
						if (drwn_pages[strTargetObject].ICON != "") {
							strIClass = ' class="' + drwn_pages[strTargetObject].ICON + '" ';
						}
						if (drwn_pages[strTargetObject].SHORT_DESCR != "") {
							strDescr = drwn_pages[strTargetObject].SHORT_DESCR;
						}
					}
					if (boolActiveSet == false) {
						strClass = ' class = "active" ';
						boolActiveSet = true
					}
				}
				strSidebarDiv += '<li id="' + strSidebarItem + '" ' + strClass + ' onclick="drwn_sidebar_item_click(this.id)"><a href="#" title="'+strDescr+'"><i ' + strIClass + '></i> <span>' + strDescr + '</span></a></li>\n' ;
			}
		}
	}

	if (intCurrentParentID != "") {
		strSidebarDiv += "</ul></li>\n"
	}
	
	strSidebarDiv += "</ul>";
	// console.log (strSidebarDiv);
	return strSidebarDiv;


}




function drwn_create_sidebar_spaceOLD(intSpaceID) 
{
	var strSidebarHTML;
	switch (intSpaceID) {
	case "1000":
			strSidebarHTML = `
			<ul id="drwn_sb_1000" class="navigation navigation-main navigation-accordion">

				<li class="navigation-header"><span>Main</span> <i class="icon-menu" title="Main pages"></i></li> 
				
				<li class="navigation-header"><span>Main2</span></li> 
				<li class="navigation-header"><span>MAIN</span></li>
				<li id="1000_101"  class="navigation-header"  onclick="drwn_sidebar_item_click(this.id)"><a href="#"><i "></i> <span>MAIN</span></a></li>
				
				
				<li id="drwn_sb_1000_102" class="active" onclick="drwn_sidebar_item_click(this.id)"><a href="#"><i class="icon-home4"></i> <span>HOME</span></a></li>
								
				<li id="drwn_sb_1000_103" onclick="drwn_sidebar_item_click(this.id)"><a href="#"><i class="icon-clipboard5"></i> <span>TASKS</span></a></li>
				<li id="drwn_sb_1001_104" onclick="drwn_sidebar_item_click(this.id)"><a href="#"><i class="icon-drawer3"></i> <span>LIBRARY</span></a></li>
				<li id="drwn_sb_1001_105" onclick="drwn_sidebar_item_click(this.id)"><a href="#"><i class="icon-cube3"></i> <span>MODELS</span></a></li>		
				<li id="drwn_sb_1001_106" onclick="drwn_sidebar_item_click(this.id)"><a href="#"><i class="icon-grid5"></i> <span>SPACES</span></a></li>	
				<li id="drwn_sb_1001_107" onclick="drwn_sidebar_item_click(this.id)"><a href="#"><i class="icon-database-menu"></i> <span>DATA</span></a></li>	
				<li id="drwn_sb_1001_108" onclick="drwn_sidebar_item_click(this.id)"><a href="#"><i class="icon-hammer-wrench"></i> <span>ADMIN</span></a></li>
			

								
				<li class="navigation-header"><span>QUICK LINKS</span> <i class="icon-menu" title="QUICK LINKS"></i></li> 
							
				<li><a href="#"><i class="icon-star-full2"></i> <span>FAVORITES</span></a>
				<li id="1000_110" <a href="#"><i class="icon-star-full2"></i><span></span></a>
					<ul>
						<li id="sb_HOME_DMR" onclick="drwn_sidebar_item_click(this.id)"><a href="#"><i class="icon-chart"></i> <span>DASHBRD - MGMT RPT</span></a></li>								
						<li id="sb_HOME_RGM" onclick="drwn_sidebar_item_click(this.id)"><a href="#"><i class="icon-table2"></i> <span>GROSS MARGIN RPT</span></a></li>
						<li id="sb_HOME_PEMP" onclick="drwn_sidebar_item_click(this.id)"><a href="#"><i class="icon-database-edit2"></i> <span>PLAN EMPLOYEES</span></a></li>
						<li id="sb_HOME_PCC" onclick="drwn_sidebar_item_click(this.id)"><a href="#"><i class="icon-database-edit2"></i> <span>PLAN COST CENTERS</span></a></li>
						<li id="sb_HOME_RPTWIZ" onclick="drwn_sidebar_item_click(this.id)"><a href="#"><i class="icon-magic-wand"></i> <span>REPORT WIZARD</span></a></li>
						<li id="sb_HOME_ASEC" onclick="drwn_sidebar_item_click(this.id)"><a href="#"><i class="icon-hammer-wrench"></i> <span>UPDATE SECURITY</span></a></li>
					</ul>	
				</li>
				
				<li><a href="#"><i class="icon-history"></i> <span>RECENT</span></a>
					<ul>
						<li><a href="#"><i class="icon-chart"></i> <span>DASHBRD - MGMT RPT</span></a></li>								
						<li><a href="colors_primary.html"><i class="icon-database-edit2"></i> <span>PLAN REV & GM</span></a></li>
						<li><a href="colors_primary.html"><i class="icon-database-edit2"></i> <span>PLAN EMPLOYEES</span></a></li>
						<li><a href="colors_primary.html"><i class="icon-database-edit2"></i> <span>PLAN COST CENTERS</span></a></li>
						<li><a href="colors_primary.html"><i class="icon-database-edit2"></i> <span>PLAN ASSETS</span></a></li>
						<li><a href="colors_primary.html"><i class="icon-database-edit2"></i> <span>PLAN PROJECTS</span></a></li>
					</ul>	
				</li>
			
				<li><a href="#"><i class="icon-stack-text"></i> <span>OPEN</span></a>
					<ul class="navigation navigation-main navigation-accordion">
						<li><a href="colors_primary.html"><i class="icon-database-edit2"></i> <span>PLAN EMPLOYEES</span></a></li>
						<li><a href="colors_primary.html"><i class="icon-database-edit2"></i> <span>PLAN COST CENTERS</span></a></li>
						<li><a href="colors_primary.html"><i class="icon-database-edit2"></i> <span>PLAN ASSETS</span></a></li>
						<li><a href="colors_primary.html"><i class="icon-database-edit2"></i> <span>PLAN PROJECTS</span></a></li>				
					</ul>
				</li>					
			</ul>
			`;
			break;
	case "1007":
		strSidebarHTML = `
		<ul id="dar_sb_1007" class="navigation navigation-main navigation-accordion">

			<li class="navigation-header"><span>System Status</span> <i class="icon-menu" title="Main pages"></i></li> 
			<li id="dar_sb_ADMIN_OVERVIEW" class="active" onclick="drwn_sidebar_item_click(this.id)"><a href="#"><i class="icon-home4"></i> <span>OVERVIEW</span></a></li>
			<li id="dar_sb_ADMIN_PERF" onclick="drwn_sidebar_item_click(this.id)"><a href="#"><i class="icon-drawer3"></i> <span>PERFORMANCE</span></a></li>
			
			
			<li class="navigation-header"><span>Application Setup</span> <i class="icon-menu" title="APP SETUP"></i></li> 
			<li id="dar_sb_ADMIN_APPS" onclick="drwn_sidebar_item_click(this.id)"><a href="#"><i class="icon-cube3"></i> <span>APPS</span></a></li>		
			<li id="dar_sb_ADMIN_DIMS" onclick="dar_open_page('DAR_DIMS','ADMIN')"><a href="#"><i class="icon-grid5"></i> <span>DIMENSIONS</span></a></li>	
			<li id="dar_sb_ADMIN_CALCS" onclick="dar_open_page('DAR_CALCS','ADMIN')"><a href="#"><i class="icon-grid5"></i> <span>CALCULATIONS</span></a></li>	


			<li class="navigation-header"><span>Security</span> <i class="icon-menu" title="SECURITY"></i></li> 
			<li id="dar_sb_ADMIN_SEC_DB" onclick="dar_open_page('DAR_SEC_DB','ADMIN')"><a href="#"><i class="icon-cube3"></i> <span>DASHBOARD</span></a></li>		
			<li id="dar_sb_ADMIN_USERS_TEAMS" onclick="dar_open_page('DAR_USERS_TEAMS','ADMIN')"><a href="#"><i class="icon-grid5"></i> <span>USERS & TEAMS</span></a></li>	
			<li id="dar_sb_ADMIN_ROLES" onclick="dar_open_page('DAR_ROLES','ADMIN')"><a href="#"><i class="icon-grid5"></i> <span>ROLES</span></a></li>				
		</ul>
		`;
		}								

	return strSidebarHTML;

    
}

