function primarySelector(arg) {
	var element = "#" + arg.element;
	var primary = arg.selection;
	if (!Array.isArray(primary)) {
		primary = [primary];
	}
	var secondary = null;
	if (arg.secondarySelection) {
		if (Array.isArray(arg.secondarySelection)) {
			secondary = arg.secondarySelection;
		}
		else {
			secondary = [arg.secondarySelection];
		}
	}
	var options = {};
	if (arg.options) {
		options = arg.options;
	}
	if (!options.hasOwnProperty("hasRefresh")) {
		options.hasRefresh = true;
	}
	
	//event function variables
	var onRefresh = null;
	
	//create a panel for primary box
	var containter = d3.select(element);
	containter.selectAll("div").remove();
	
	if (options.hasRefresh) {
		var optionsBox = containter.append("div")
			.attr("class","easy-access-items")
				.append("div"); 
		var autoRefreshBox = optionsBox.append("div")
			.attr("class","switchery-xs autorefresh");
		autoRefreshBox.append("label").text("Auto Refresh");
		var autoRefreshChkBox = autoRefreshBox.append("input")
			.attr("type","checkbox")
			.attr("class","switchery")
			.attr("checked","checked")
		var autoRefreshButton = optionsBox.append("a")
			.attr("href","javascript:void(0)")
			.attr("class","icon-loop3");
		
		$(autoRefreshButton[0][0]).on("click", 
			d => {
				if (typeof onRefresh == 'function') {
					onRefresh(arg);							
				}
		});			
	}
	
	var switchColor = '#64BD63';
	var refreshSwitchery = new Switchery(autoRefreshChkBox[0][0], { color: switchColor });
	
	var primaryContainer = containter.append("div")
		.attr("class","panel primary-box");
	
	var filterIcon = primaryContainer.append("div")
		.append("i")
			.attr("class", "filter icon-filter4");
	
	//loop through primary
	var selectItems = [];
	primary.forEach((item,i) => {
		selectItems.push(createSelection(item,i,primaryContainer));
	});
	
	if (secondary) {
    	var pSecondaryButton = primaryContainer.append("div")
    		.append("i")
				.attr("class", "secondary icon-equalizer2 show-secondary");
    	
    	var secondaryContainer = containter.append("div")
    		.attr("class", "panel secondary-box");
    	
        secondary.forEach((item,i) => {
    		selectItems.push(createSelection(item,i,secondaryContainer));
		});	
        
        var sSecondaryButton = secondaryContainer.append("div")
        	.append("i")
        		.attr("class", "secondary icon-x hide-secondary");
        
        //secondary icon in primary box click event
        $(element).find("i.show-secondary").on("click", d => {
        	$secondary = $(element).find(".secondary-box");
        	$target = $(d.currentTarget);
        	$target.hide();
        	//$secondary.animate({display: "inline-block"});
        	$secondary.css({display: "inline-block"});
        });	     
        
        //secondary icon in secondary box click event	        
        $(element).find("i.hide-secondary").on("click", d => {
        	$secondary = $(element).find(".secondary-box");
        	$target = $(element).find("i.show-secondary");
        	$target.show();
        	$secondary.hide();
        });  	        
        
        //hide the secondary
        $(element).find(".secondary-box").hide();	        
	}
	
	arg.refresh = (name, data = null) => {
		for (var i = 0; i < selectItems.length; i++) {
			if (selectItems[i].item.name == name) {
				selectItems[i].refresh(data);
				break;
			}
		}
		return arg;
	};
	
	arg.refreshAll = (arg2) => {
    	var paramInKeys = {};
    	if (arg2) {
    		if (Array.isArray(arg2)) { //convert the arg2 arrays into keyed objects for easy search
    			arg2.forEach(d => {
    				paramInKeys[d.name] = d; 
    			});
    		}
    	}
		for (var i = 0; i < selectItems.length; i++) {
			var nm = selectItems[i].item.name;
			if (paramInKeys[nm]) {
				if (paramInKeys[nm].data){
					selectItems[i].refresh(paramInKeys[nm].data);
				}
			}
		}
		return arg;
	}
	
	//return list of members
	arg.getCurrentMembers = () => {
		var ret = {};
		if (arg.selection) {
			arg.selection.forEach((d) => {
				if (d.hasOwnProperty("_currentMember")) {
					ret[d.name] = d._currentMember;
				}
				else {
					ret[d.name] = {"dateTo": d._dateTo, "dateFrom": d._dateFrom};
				}
			});				
		}
		if (arg.secondarySelection) {
			arg.secondarySelection.forEach((d) => {
				if (d.hasOwnProperty("_currentMember")) {
					ret[d.name] = d._currentMember;
				}
				else {
					ret[d.name] = {"dateTo": d._dateTo, "dateFrom": d._dateFrom};
				}
			});							
		}
		return ret;
	};
		
	
	//events
	arg.activeEvents = [];
	//var changeEventAutoCreate = false;
	arg.on = (e, i, d) => { //parameters: e -> event name, i -> index or name of the selector (can be null to select all), d -> function callback
		switch (e) {
		case 'refresh':
			var param = d;
			if (!d) {
				param = i;
			}
			onRefresh = param; 
			//add on change with dummy callback
			var hasChangeEvent = false;
			for (var i = 0; i < arg.activeEvents.length; i++) {
				if (arg.activeEvents[i] == 'change') {
					hasChangeEvent = true;
					break;
				}
			}
			//console.log(hasChangeEvent,"hasChangeEvent")
			if (!hasChangeEvent) {
				//changeEventAutoCreate = true;
				arg.on("change",null,(x,y)=>{});
				//changeEventAutoCreate = false;
			}
			break;
		default:
			if (i) {
				if (isNaN(i)) {
					for (var j = 0; j < selectItems.length; j++) {
						if (selectItems[j].item.name == i) {
							selectItems[j].on(e, d);
							break;
						}
					}			
				}
				else {
					if (i < selectItems.length) {
						selectItems[i].on(e, d);
					}
				}			
			}
			else {
				var d2 = d;
				if (e=='change') { //do autorefresh
					var sw = refreshSwitchery.switcher;
					var $sw = $(sw).find("small");
					if ($sw[0]) {
						d2 = (x,y) => {
							var ret = d(x,y);
							if (y.success || y.acceptInvalid) {
								if ($sw.css("left") != "0px") {
									if (typeof onRefresh == 'function') {
										onRefresh(arg);
									}
								}															
							}
						};
					}
					
				}				
				selectItems.forEach(f => {
					f.on(e,d2);
				});
			}
		}
		arg.activeEvents.push(e);
		return arg; //can be chained
	};
	
	return arg;
}

function createSelection(item,i,primaryContainer) {
	//item: primarySelection's selection object
	//i: index, used for naming
	//primaryContainer: container box where the selection is located
	
	//initialize parameters
	
	var returnVal = {};
	returnVal.item = item;
	returnVal.index = i;
	returnVal.primaryContainer = primaryContainer;	
	
	var name = item.name ? item.name : "SELECTION " + i;
	var description = item.description ? item.description : name;
	var placeHolder = item.placeHolder ? item.placeHolder : "Enter " + description + " ID or description";
	var idCol = item.idCol ? item.idCol : "id";
	var idCaseSensitive = item.hasOwnProperty("idCaseSensitive") ? item.idCaseSensitive : false;
	var descCol = item.descCol ? item.descCol : "descr";
	var parentCol = item.parentCol ? item.parentCol : "parent";
	var childrenCol = item.childrenCol ? item.childrenCol : "children"
	var topNode = item.topNode;
	if (topNode) {
		if (!topNode.key) {
			topNode.key = topNode[idCol];
		}	
		if (!topNode[descCol]) {
			topNode[descCol] = topNode.title;
		}		
	}
	var view = item.view ? item.view : "desc";
	var type = item.type ? item.type : "normal";
	var acceptInvalid = item.acceptInvalid ? item.acceptInvalid : false;
	var emptyText = item.emptyText ? item.emptyText : "<empty>"; 
	//immediate data

	var data = item.data;
	var dataPromise = null, overrideDataFlag = false;;	
	var datalistValues = {};
	var dataInKeys = {};
	if (data) {
		if (data instanceof Promise) {
			dataPromise = item.data;
			var dataPromise2 = new Promise((response,reject) => {
				dataPromise.then(rs => {
					var res = false;
					if (rs) {
						if (!overrideDataFlag) {
							data = rs;
							returnVal.data = data;
							refreshDataList();			
						}	
						res = (rs.length > 0);
					}
					response(res);
				});
			});			
		}
		else {
			returnVal.data = data;
			var dataPromise2 = new Promise((response,reject) => {
				refreshDataList();
				var ret = false;
				if (data) {
					ret = (data.length > 0);
				}
				response(ret);
			});			
		}
	}
	
	var modalSection = primaryContainer.selectAll("div.modal-section");
	if (!modalSection[0][0]) {
		modalSection = primaryContainer.append("div").attr("class","modal-section");
	}
	
	//process recent values
	var recent = item.recent;
	if (recent) {
		if (!Array.isArray(recent)) {
			recent = [recent]; //force a single item into array
		}
	}
	else {
		recent = [];
	}
	//var env = convertSpecialChars(getLocalStorage('CURRENT_ENVIRONMENT'),"");
	var elem = convertSpecialChars(item.name, "_");
	//var lStoreName = env + "_SELECTOR_" + elem + "_RECENT";
	var lStoreName = "_SELECTOR_" + elem + "_RECENT";
	
	var recentLS = getLocalStorage(lStoreName);
	if (recentLS) {
		recent = JSON.parse(recentLS); //for now
	}
	setLocalStorage(lStoreName, JSON.stringify(recent));
	
	var currentMember = "";
	if (item.currentMember) {
		currentMember = item.currentMember;
	}
	else {
		if (recent) {
			if (Array.isArray(recent)){
				var rc = recent[0];
			}
			else {
				var rc = recent;
			}
			if (rc[idCol]) {
				currentMember = rc[idCol];
			}
			else {
				currentMember = rc;
			}
		}
		else {
			currentMember = "..."
		}
	}
	
	//event variables
	var onBrowseClick = null;
	var onDropDownClick = null;
	var onChange = null;
	
	//create selector box
	var selectorBox = primaryContainer.append("div")
		.attr("class", "selector form-control " + type);
	
	//label
	var label = selectorBox.append("span")
		.attr("class","dropdown-selectable")
		.text(description);
	
	var fancyTreeFlag = false;
		
	switch (type) {
	case "normal":
		//create dropdown
		var dropdown; 
		initDropDown();

		//input box and member label
		var inputSection = selectorBox.append("form")
			.attr("action", "javascript:void(0)")
			.attr("class","selector-input ui-front");
		var inputSectionLabel = inputSection.append("span")
			.style("display","block");
		
		if (data.length) {
			inputSectionLabel.attr("data-id",currentMember).attr("data-desc",idDescText(currentMember))
			if (idDescText(currentMember)) {
				inputSectionLabel.text(idDescText(currentMember));
			}			
		}
		else {
			inputSectionLabel.attr("data-id",emptyText).attr("data-desc",emptyText)
			inputSectionLabel.text(emptyText);
		}
		
		var placeHolderMinWidth = placeHolder.length > 24 ? placeHolder.length - 4 : 20; 
		var inputSectionInput = inputSection.append("input")
			.attr("type","text")
			.attr("placeholder",placeHolder)
			.attr("size",placeHolderMinWidth)
			.style("display","none");
		
		//crete the suggestion list for input box
		dataPromise2.then(rs => {
			if (rs) {
				initDropDown();
				inputSectionLabel.attr("data-id",currentMember).attr("data-desc",idDescText(currentMember))
				if (idDescText(currentMember)) {
					inputSectionLabel.text(idDescText(currentMember));
				}	
				
				var suggestionList = [];
				
				if (typeof currentMember == 'string') {
					if (dataInKeys[currentMember]) {
						item.currentMember = dataInKeys[currentMember];
					}
				}
				item._currentMember = item.currentMember;
				
				//update the input section
				if (idDescText(currentMember)) {
					inputSectionLabel.text(idDescText(currentMember));
					inputSectionLabel.attr("data-id", getIDFromDesc(currentMember));
					inputSectionLabel.attr("data-desc", idDescText(currentMember));
				}

				datalistValues.forEach((d) => {
					//id first
					var tmp = {
							label: d[idCol],
							value: d[idCol]
					}
					suggestionList.push(tmp);
					//description
					if (d[idCol].toUpperCase() != dataInKeys[d[idCol]][descCol].toUpperCase()){
						var tmp = {
								label: dataInKeys[d[idCol]][descCol],
								value: d[idCol]
						}
						suggestionList.push(tmp);					
					}
					//console.log(suggestionList,"suggestionList")
				});
				$(inputSectionInput[0][0]).autocomplete({
					source: suggestionList,
					select: (event, ui) => {
						var origEvent = event;
				        while (origEvent.originalEvent !== undefined){
				            origEvent = origEvent.originalEvent;
				        }
			        	setTimeout(function () { //seems there is a bug in autocomplete where the clicked item needs some delay to apply in the input
			        		$(inputSectionInput[0][0]).val(ui.item.label);
			        		$(inputSection[0][0]).submit(); },1);
					}					
				});				
			}
			else {
				
			}
				
		});
		
		var caret = selectorBox.append("span")
			.attr("class","dropdown-selectable caret");
		
	    //create modal section
	    $modalSection = $(modalSection[0][0]);
	    var modalBox;
	    if ($modalSection[0] || data.length) {
	    	modalBox = d3.select($modalSection[0]).append("div")
	    		.attr("class", "modal fade")
	    		.attr("data-filtered",false);
	    	var modalBoxContent = modalBox
	    		.append("div")
	    		.attr("class", "modal-dialog")
	    		.append("div")
	    			.attr("class","modal-content");
	    	
	    	var tmp = modalBoxContent.append("div")
	    		.attr("class","modal-header");
	    	
	    	tmp.append("button")
				.attr("class","close")
				.attr("data-dismiss","modal")
				.text('×');
	    	tmp.append("h5")
	    		.attr("class","modal-title")
	    		.text("Select " + toProperCase(description));
	    	
	    	var ddIdDesc = tmp.append("select")
	    		.attr("class","id-desc-dropdown");
	    	
	    	var ddIdDescA = ddIdDesc.append("option").attr("value","id").text("ID");
	    	var ddIdDescB = ddIdDesc.append("option").attr("value","desc").text("Description");
	    	var ddIdDescC = ddIdDesc.append("option").attr("value","id - desc").text("ID - Description");
	    	
	    	switch (view) {
	    	case "desc":
	    		ddIdDescB.attr("selected","true");
	    		break;
	    	case "id - desc":
	    		ddIdDescC.attr("selected","true");
	    		break;
	    	default:
	    		ddIdDescA.attr("selected","true");
	    	}	    	
	    	
	    	$(ddIdDesc[0][0]).select2(
    			{
    				theme: "id-desc",
    				minimumResultsForSearch: Infinity
    			}).on("select2:select", d => {
    				var $selValueBox = $(ddIdDesc[0][0]).find("option:selected");
    				var $mBox = $(modalBox[0][0]);
    				var $treeBox = $mBox.find(".selection-fancy-tree");
    				view = $selValueBox.attr("value");
    				/*if (data) {
    					changeTitleForFancyTree(); //update the title based on current view	
    				}*/
    				var tree2 = $treeBox.fancytree("getTree");
    				/*if (datalistValues) {
        				datalistValues.forEach(d => {
        					var node  = tree2.getNodeByKey(d.key.toString());
        					if (node) {
        						node.setTitle(idDescText(d[idCol]));
        					}
        				});
    				}*/
					dataPromise2.then(rs => {
						changeTitleForFancyTree(); //update the title based on current view
        				datalistValues.forEach(d => {
        					var node  = tree2.getNodeByKey(d.key.toString());
        					if (node) {
        						node.setTitle(idDescText(d[idCol]));
        					}
        				});    					
					});
			});
	    	
	    	var searchBox = tmp.append("div").attr("class","search-box");
	    	var searchBoxInp = searchBox.append("input")
	    		.attr("type","input")
	    		.attr("placeholder", "Search for ID or Description");
	    	var searchBoxButton = searchBox.append("button").attr("class","search-find");
	    	searchBoxButton.append("i").attr("class","icon-search4");
	    	var searchBoxX = searchBox.append("button")
	    		.attr("class","search-close")
	    		.style("display","none")
	    		.text('×');

	    	var modalTree = modalBoxContent.append("div")
    			.attr("class","modal-body")
    			.append("div")
    				.attr("class","selection-fancy-tree");

	    	tmp = modalBoxContent.append("div")
    			.attr("class","modal-footer");
	    	
	    	var closeButton = tmp.append("button")
	    		.attr("type","button")
	    		.attr("class", "btn btn-link")
	    		.attr("data-dismiss","modal")
	    		.text("Close");
	    	
	    	var acceptButton = tmp.append("button")
	    		.attr("type","button")
	    		.attr("class", "btn btn-primary")
	    		.text("Apply");
	    }
	    
		//create dropdown
	    function initDropDown() {
	    	selectorBox.selectAll("select.select-dropdown").remove();
	    	if (data.length) {
				dropdown = selectorBox.append("select")
					.attr("class","select select-dropdown")
				if (recent.length > 0) {
					var dropdownG = dropdown.append("optgroup")
						.attr("label","Recently Selected Members")
						.style("text-transform","unset");
					recent.forEach(d => {
						var idVal = d;
						if (d[idCol]){ //check if recent list is in simple array or object array
							idVal = d[idCol]; 
						}
						var dropdownI = dropdownG.append("option")
							.attr("value",idVal)
							.text(idDescText(idVal));
					});
				}
				dataPromise2.then(rs => {
					dropdown.selectAll("option.browse-more").remove();
					var dropdownM = dropdown.append("option")
						.attr("value","*BrowseMore*")
						.attr("class","browse-more")
						.text("Browse More...");					
				});
				
				//select2 initialization of the dropdown
				//
				$(dropdown[0][0]).select2({
			    	minimumResultsForSearch: Infinity,
			    	dropdownCssClass: "p-selector-select2",
	    	    	}).on("select2:open", d => {
	    				var $selector = $(dropdown[0][0]).closest(".selector");
	    				var $dropdown = $selector.find(".select2-container");    	    		
	    	    		var pos = $selector.position();
	    	    		$dropdown.css({
	    	    			display: "block",
	    	    			left: pos.left + 5,
	    	    			top: pos.top + 5,
	    	    			width: $selector.outerWidth(),
	    	    		});
	    	    		$(dropdown[0][0]).val([]);
	    	    	}).on("select2:close" , d => {
	    				var $selector = $(dropdown[0][0]).closest(".selector");
	    				var $dropdown = $selector.find(".select2-container");    	    		
	    	    		$dropdown.css({
	    	    			display: ""
	    	    		});
	    	    	}).on("select2:select", d => {
	    				var $selector = $(dropdown[0][0]).closest(".selector");
	    				var $dropdown = $selector.find(".select2-container");    	    		
	    	    		var $selValueBox = $(dropdown[0][0]).find("option:selected");
	    	    		var value = $selValueBox.attr("value");
	    	    		var $destBox = $selector.find(".selector-input").children("span");
	    	    		if (value !== "*BrowseMore*") {
	    	    			var oldVal = $destBox.attr("data-id");
	    	    			$destBox.text(idDescText(value));
	    	    			$destBox.attr("data-id", value);
	    	    			$destBox.attr("data-desc", idDescText(value));
				    		updateRecentList(value);
				    		if (dataInKeys[value]) {
				    			item._currentMember = dataInKeys[value];
				    		} 
				    		else {
				    			item._currentMember = value;
				    		}
				    		
				    		onChangeExec(value, oldVal);
	    	    		}
	    	    		else {
	    	    			if (modalBox) {
	    	    				if (typeof onBrowseClick == "function") { //execute event
	    	    					onBrowseClick(returnVal);
	    	    					//returnVal.refresh(returnVal.data);
	    	    				}
	    	    				var $mBox = $(modalBox[0][0]);
	    	    				$mBox.modal();
	    	    				$mBox.draggable({
	    	    					handle: ".modal-title"
	    	    				});
	    	    				var $treeBox = $mBox.find(".selection-fancy-tree");
	    	    				if ($(modalBox[0][0]).attr("data-filtered") == "true") { //remove the filter first
	    	    					$(modalBox[0][0]).find(".search-box > button.search-close").click();
	    	    				}
		    					dataPromise2.then(rs => {
	        	    				changeTitleForFancyTree(); //update the title based on current view
	        	    				if (fancyTreeFlag) {
	        	    					$treeBox.fancytree("destroy");
	        	    				}
	    	    					generateFancyTree({
	    	    						element: $treeBox,
	    	    						data: data});
	    	    					fancyTreeFlag = true;
	        	    				var selected = $(selectorBox[0][0]).find(".selector-input > span").attr("data-id");
	        	    				if (!selected) {
	        	    					selected = $(selectorBox[0][0]).find(".selector-input > span").text();
	        	    				}
	        	    				var tree = $treeBox.fancytree("getTree");
	        	    				var idKey = dataInKeys[selected];
	        	    				if (idKey) {
	        	    					if (idKey.key) {
	        	    						var node  = tree.getNodeByKey(idKey.key.toString());
	        	    					}
	        	    					else {
	        	    						var node  = tree.getNodeByKey(selected.toString());
	        	    					}
	            	        	        if (node) {
	            	        	        	node.setActive(true);
	            	        	        }         	    				        	    					
	        	    				}    	    					            	    				
		    					});   	    				
	    	    			}
	    	    		}
		    	});   		    		
	    	}
	    	else {
				dropdown = selectorBox.append("select")
					.attr("class","select select-dropdown");

				var dropdownG = dropdown.append("optgroup")
					.attr("label"," - EMPTY LIST -")
					.style("text-transform","unset");
				
				$(dropdown[0][0]).select2({
			    	minimumResultsForSearch: Infinity,
			    	dropdownCssClass: "p-selector-select2" 
			    }).on("select2:open", d => {
    				var $selector = $(dropdown[0][0]).closest(".selector");
    				var $dropdown = $selector.find(".select2-container");    	    		
    	    		var pos = $selector.position();
    	    		$dropdown.css({
    	    			display: "block",
    	    			left: pos.left + 5,
    	    			top: pos.top + 5,
    	    			width: $selector.outerWidth(),
    	    		});
    	    		$(dropdown[0][0]).val([]);
    	    	}).on("select2:close" , d => {
    				var $selector = $(dropdown[0][0]).closest(".selector");
    				var $dropdown = $selector.find(".select2-container");    	    		
    	    		$dropdown.css({
    	    			display: ""
    	    		});
    	    	});
	    	}
			//dropdown click event
		    $(selectorBox[0][0]).on("click",".dropdown-selectable", d => {
		    	$target = $(d.currentTarget);
		    	$selector = $target.closest(".selector");
		    	$selector.find(".select-dropdown").select2("open");
		    }); 	    	
	    }
		
	    //set up fancy tree parameters
	    function generateFancyTree(arg) {
	    	var $element = arg.element;
	    	var data = arg.data;
	        $element.fancytree({
	        	quicksearch: true,
	        	source: data
	        });
	    }
	    
	    //retrieve id / description / id - desc, of the id based on display
	    function idDescText(id) {
	    	var returnVal = "";
	    	var desc = id;
	    	if (dataInKeys[id]) {
		    	if (dataInKeys[id][descCol]) {
		    		desc = dataInKeys[id][descCol];
		    	}	    		
	    	}
	    	switch (view) {
		    	case "id":
		    		returnVal = id;
		    		break;
		    	case "desc":
		    		returnVal = desc;
		    		break;
		    	case "id - desc":
		    		returnVal = id + " - " + desc;
		    		break;
		    	default:
		    		returnVal = id;
	    	}
	    	return returnVal;
	    }
	    
	    //retrieve id from the id or description, used to detect if typed text is valid id or description
	    function getIDFromDesc(text) {
	    	var returnVal = "";
	    	for (var i = 0; i < datalistValues.length; i++) {
	    		var id = datalistValues[i][idCol];
	    		if (id) {
		    		var text2 = text;
	    			if (!idCaseSensitive) {
		    			//for case insensitive    				
	    				id = id.toUpperCase();
	    				text2 = text.toUpperCase();
	    			}	    		
		    		if (id === text2) { //check for id match
		    			returnVal = datalistValues[i][idCol]; 
		    			break;
		    		}
		    		else { //check for description match
		    			var test = "";
		    			if (datalistValues[i][descCol]) {
		    				test = datalistValues[i][descCol].toUpperCase();
		    				if (test === text.toUpperCase()) {
		    	    			returnVal = datalistValues[i][idCol]; 
		    	    			break;	    					
		    				}
		    				//check if it is in id - desc
		    				test = id + " - " + test;
		    				if (test === text.toUpperCase()) {
		    	    			returnVal = datalistValues[i][idCol]; 
		    	    			break;	    					
		    				}	    				
		    			}
		    			else if (datalistValues[i].title) {
		    				test = datalistValues[i].title.toUpperCase();
		    				if (test === text.toUpperCase()) {
		    	    			returnVal = datalistValues[i][idCol]; 
		    	    			break;	    					
		    				}	    				
		    			}
		    		}	    			
	    		}
	    	}
	    	return returnVal;
	    }
	    
	    //modify the title of the array to change the display in fancy tree
	    function changeTitleForFancyTree() {
	    	var listOnProcess = data;
	    	do {
	        	var newList = [];
	        	listOnProcess.forEach(d => {
	        		if (d[childrenCol]) { //if it has children
	        			newList = newList.concat(d[childrenCol]);
	        		}
	        		var newTitle = "";
	        		var idVal = "", descVal = ""
	        		if (d[idCol]) {
	        			idVal = d[idCol];
	        		}
	        		if (d[descCol]) {
	        			descVal = d[descCol];
	        		}
	    	    	switch (view) {
			    	case "id":
			    		newTitle = idVal;
			    		break;
			    	case "desc":
			    		newTitle = descVal;
			    		break;
			    	case "id - desc":
			    		newTitle = idVal + " - " + descVal;
			    		break;
			    	default:
			    		newTitle = idVal;
	    	    	}
	        		d.title = newTitle;
	        	});
	        	listOnProcess = newList;
	    	}
	    	while (listOnProcess.length > 1);
	    }
	    
	    //update recent list
	    function updateRecentList(val) {
    		var recList = JSON.parse(getLocalStorage(lStoreName));
    		if (dataInKeys[val]) {
    			var newVal = dataInKeys[val];
    			var newValId = newVal[idCol];
    		}
    		else {
    			var newVal = val;
    			var newValId = newVal;
    		}
    		var recListNew = [newVal], count = 0;
    		if (recList) {			    		
	    		if (!Array.isArray(recList)) {
	    			recList = [recList];
	    		}
	    		recList.forEach((d, i) => {
	    			if (count < 4) {
	    				if (d[idCol]) {
	    					if (d[idCol] !== newValId) {
			    				recListNew.push(d);
			    				count++;	    						
	    					}
	    				}
	    				else {
			    			if (d !== newValId) {
			    				recListNew.push(d);
			    				count++;
			    			}			    							    					    					
	    				}
	    			}
	    		});				    		
    		}			    		
    		setLocalStorage(lStoreName,JSON.stringify(recListNew));
    		recent = recListNew;
    		$(dropdown[0][0]).select2("destroy");
    		initDropDown();
	    }
	    
	    //textbox click event
	    $(selectorBox[0][0]).find(".selector-input").on("click", d => {
	    	if (data.length) {
		    	$label = $(d.currentTarget).children('span');
		    	$input = $(d.currentTarget).children('input[type="text"]');
		    	$label.css({
		    		display: "none"
		    	})
		    	$input.val($label.text());
		    	$input.css({
		    		display: "block"
		    	});
		    	$input.select();	    		
	    	}
	    });
	    
	    //press enter event on textbox
	    $(selectorBox[0][0]).find('input[type="text"]').keypress(d => {
	    	var keycode = (d.keyCode ? d.keyCode : d.which);
	    	if(keycode == '13'){ //enter key
	        	var $target = $(selectorBox[0][0]).find(".selector-input");
	        	var $label = $target.children('span');
	        	var $input = $target.children('input[type="text"]');
	
	        	updateInputLabelText($input,$label);
	        	
	        	$label.css({
	        		display: "block"
	        	})
	        	$input.css({
	        		display: "none"
	        	});    	    		
	    	}
	    });
	    
	    $(selectorBox[0][0]).find('input[type="text"]').keydown(d => { 
	    	if (d.key == 'Escape') { //cancel changes
	        	var $target = $(selectorBox[0][0]).find(".selector-input");
	        	var $label = $target.children('span');
	        	var $input = $target.children('input[type="text"]');	
	        	$label.css({
	        		display: "block"
	        	})
	        	$input.css({
	        		display: "none"
	        	});   	        	
	    	}
	    })
	    
	    //lost focus textbox event
	    $(document).on("click", d => {
	    	if (typeof onDropDownClick == 'function') {
	    		onDropDownClick(returnVal);
	    		//refreshDataList();
	    	}
	    	var $target = $(selectorBox[0][0]).find(".selector-input");
	    	var $label = $target.children('span');
	    	var $input = $target.children('input[type="text"]');
	    	if (typeof $target.find(d.target)[0] === "undefined") {
	    		updateInputLabelText($input,$label);
	        	$label.css({
	        		display: "block"
	        	})
	        	$input.css({
	        		display: "none"
	        	});    	    		
	    	}
	    });	    
	    
	    function updateInputLabelText($input,$label) {
    		if ($input.css("display") !== "none") {
    			if ($input.val()) {
    				var value = $input.val();
    				var valueID = value;
    				var oldValue = $label.attr("data-id");
    				var idVal = getIDFromDesc(value);
    				if (idVal) { //if id is valid, write the value
    					var valueDesc = idDescText(idVal);
    					$label.text(valueDesc); 
    					$label.attr("data-id",idVal);
    					$label.attr("data-desc",valueDesc);
    					valueID = idVal;
	    				//update the recent list
    					updateRecentList(idVal);
    					d3.select($label[0]).attr("class",null);
        				//execute change event
    		    		if (dataInKeys[value]) {
    		    			item._currentMember = dataInKeys[value];
    		    		} 
    		    		else {
    		    			item._currentMember = value;
    		    		}    				
    		    		onChangeExec(valueID, oldValue);
    				}
    				else {
    					//if the input is invalid
    					var d3Label = d3.select($label[0]);
    					var c = d3Label.attr("class");
    					if (c) {
    						d3Label.attr("class",c + " invalid")
    						if (!acceptInvalid) {
	    						d3Label.transition()
	    							.delay(500)
	    							.duration(1000)
	    							.attr("class",c);	    							
    						}
    					}
    					else {
    						d3Label.attr("class"," invalid")
    						if (!acceptInvalid) {
	    						d3Label.transition()
	    							.delay(500)
	    							.duration(1000)
	    							.attr("class",null);	    							    							
    						}
    					} //accepts invalid input
    					if (acceptInvalid) {
	    					$label.text(value); 
	    					$label.attr("data-id",value);
	    					$label.attr("data-desc",value);
	    					updateRecentList(value);
	        				//execute change event
	    		    		if (dataInKeys[value]) {
	    		    			item._currentMember = dataInKeys[value];
	    		    		} 
	    		    		else {
	    		    			item._currentMember = value;
	    		    		}    				
	    		    		onChangeExec(valueID, oldValue);
    					}
    				}
					
    			}
    		}	    	
	    }
	    
	    //apply click on select model 
	    if (modalBox) {
		    $(modalBox[0][0]).on("click","button.btn-primary", e => {
		    	var $caller = $(selectorBox[0][0]);
		    	var $tree = $(modalBox[0][0]).find(".selection-fancy-tree");
		    	var selected = $tree.fancytree("getTree").getActiveNode();
		    	if (selected) {
			    	var $destBox = $caller.find(".selector-input > span");
			    	var id = selected.data[idCol];
			    	var oldVal = $destBox.attr("data-id"); 
			    	$destBox.text(idDescText(id));
	    			$destBox.attr("data-id", id);
	    			$destBox.attr("data-desc", idDescText(id));		    	
			    	if (lStoreName) {
			    		updateRecentList(id);
			    	}
			    	$(modalBox[0][0]).modal('toggle');

		    		if (dataInKeys[id]) {
		    			item._currentMember = dataInKeys[id];
		    		} 
		    		else {
		    			item._currentMember = value;
		    		}
		    		
    				onChangeExec(id, oldVal);
		    	}
		    	else {
		    		//if there is no selected item
		    	}
		    });	
		    
		    //search button
		    $(modalBox[0][0]).on("click",".search-box > button.search-find", e => {
		    	var $textbox = $(modalBox[0][0]).find(".search-box > input");
		    	var $closeButton = $(modalBox[0][0]).find(".search-box > button.search-close");
		    	var value = $textbox.val();
		    	var $tree = $(modalBox[0][0]).find(".selection-fancy-tree");
		    	var treeBox = $tree.fancytree("getTree");
		    	var selected = treeBox.getActiveNode();
		    	var selectedKey;
		    	if (selected) {
		    		selectedKey = selected.key;		    		
		    	}		    	
		    	if (value) {
			    	var searchResults = []; 
			    	datalistValues.forEach(d => {
			    		d.title = idDescText(d[idCol])
		    	    	switch (view) {
				    	case "id":
				    		if (d[idCol].search(new RegExp(value, "i"))>=0) {
				    			searchResults.push(d);
				    		}
				    		break;
				    	case "desc":
				    		if (d[descCol].search(new RegExp(value, "i"))>=0) {
				    			searchResults.push(d);
				    		}			    		
				    		break;
				    	case "id - desc":
				    		var searchText = d.id + " - " + d.descr;
				    		if (searchText.search(new RegExp(value, "i"))>=0) {
				    			searchResults.push(d);
				    		}			    		
				    		break;
				    	default:
				    		if (d.id.search(new RegExp(value, "i"))>=0) {
				    			searchResults.push(d);
				    		}			    		
		    	    	}		
			    	});
			    	$tree.fancytree("destroy");
					generateFancyTree({
						element: $tree,
						data: searchResults});
					$closeButton.css("display","inline");
					$(modalBox[0][0]).attr("data-filtered",true);
		    	}
		    	else {
			    	$tree.fancytree("destroy");
					generateFancyTree({
						element: $tree,
						data: data});
					$closeButton.css("display","none");
					$(modalBox[0][0]).attr("data-filtered",false);
		    	}
		    	if (selectedKey) {
		    		treeBox = $tree.fancytree("getTree");
		    		var mustSelect = treeBox.getNodeByKey(selectedKey.toString());
		    		if (mustSelect) {
		    			mustSelect.setActive(true);
		    		}
		    	}
		    });
		    
		    $(modalBox[0][0]).on("click",".search-box > button.search-close", e => {
		    	var $textbox = $(modalBox[0][0]).find(".search-box > input");
		    	var $tree = $(modalBox[0][0]).find(".selection-fancy-tree");
		    	var treeBox = $tree.fancytree("getTree");
		    	var selected = treeBox.getActiveNode();
		    	var selectedKey;
		    	if (selected) {
		    		selectedKey = selected.key;		    		
		    	}				    	
		    	$tree.fancytree("destroy");
				generateFancyTree({
					element: $tree,
					data: data});
		    	if (selectedKey) {
		    		treeBox = $tree.fancytree("getTree");
		    		var mustSelect = treeBox.getNodeByKey(selectedKey.toString());
		    		if (mustSelect) {
		    			mustSelect.setActive(true);
		    		}
		    	}
		    	$textbox.val(null);
				$(e.currentTarget).css("display","none");
				$(modalBox[0][0]).attr("data-filtered",false);
		    });
		    
		    $(modalBox[0][0]).on("keypress", ".search-box > input", d => {
		    	var keycode = (d.keyCode ? d.keyCode : d.which);
		    	if (keycode == '13') { //enter key
		    		$(modalBox[0][0]).find(".search-box > button.search-find").click();
		    	}
		    });
	    }
	    
		break;
	case "date-picker":
		var inputSection = selectorBox.append("div")
			.attr("class","selector-input");
		
		var dateFormat = 'MMMM D, YYYY';
		var dashPos = currentMember.search(' - ');
		var dateValOldPrt = {
				"from": moment(new Date(currentMember.substring(0,dashPos))),
				"to": moment(new Date(currentMember.substring(dashPos)))
			};		
		var dateValOld = dateValOldPrt.from.format(dateFormat) + ' - ' + dateValOldPrt.to.format(dateFormat);
		var inputSectionLabel = inputSection.append("span")
			.text(dateValOld);
		
		item._dateFrom =new Date(currentMember.substring(0,dashPos));
		item._dateTo = new Date(currentMember.substring(dashPos));

		//console.log(dateValOldPrt,dateValOld);
		
		//add click event to show date picker
		$(selectorBox[0][0]).daterangepicker(
            {
                startDate: dateValOldPrt.from,
                endDate: dateValOldPrt.to,
                minDate: '01/01/1950',
                maxDate: '12/31/2100',
                //dateLimit: { days: 60 },
                ranges: {
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                    'Last Month': [moment().subtract(1,'month').startOf('month'), moment().subtract(1,'month').endOf('month')],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],                    
                    'This Year': [moment().startOf('year'), moment().endOf('year')]
                },
                opens: 'right',
                applyClass: 'btn-small bg-slate-600',
                cancelClass: 'btn-small btn-default'
            },
            function(start, end) {
                var dateValNewPrt = {
            		"from": start,
            		"to": end
                }            	
                $('.date-picker div span').html(start.format(dateFormat) + '&nbsp;-&nbsp;' + end.format(dateFormat));
                                
                //change event
                var r = {};
                r.oldValue = dateValOld;
                r.value = start.format(dateFormat) + ' - ' + end.format(dateFormat);
                r.success = true;
                r.oldValueParts = dateValOldPrt;
                r.valueParts = dateValNewPrt;

        		item._dateFrom = new Date(start);
        		item._dateTo = new Date(end);                
                
                if (r.value != r.oldValue) {
                	onChange(returnVal, r);
                }
                
                dateValOldPrt = dateValNewPrt;
                dateValOld = r.value;
                
            }    					
		);
	}

    function onChangeExec(val, oVal) {
		if (typeof onChange == "function") {
			//console.log(val,oVal,"C")
			if (val != oVal) {
				var success = false;
				var r = {};					
				if (dataInKeys[val]){
					r.value = dataInKeys[val]; 
					success = true;
				}
				else {
					r.value = val;
				}
				
				if (dataInKeys[oVal]){
					r.oldValue = dataInKeys[oVal]; 
				}
				else {
					r.oldValue = oVal;
				}
				r.success = success;
				onChange(returnVal, r);
			}
			
		}	    	
    }	
	
	//refresh list
	function refreshDataList() {
		datalistValues = convertHierToList(returnVal.data,childrenCol);
		if (type === "normal") {
			if (topNode) {
				data = transformJSONToFancytreeData(datalistValues, topNode, parentCol, childrenCol);
			}
			else {
				data = transformJSONToFancytreeData(datalistValues, null, parentCol, childrenCol);
			}
		}
		if (topNode) {
			datalistValues = datalistValues.concat(topNode); 
		}
		dataInKeys = addKeysInList(datalistValues); //list the member as single object with ID as keys	   		
	}
	
	//methods
	returnVal.refresh = function(pdata = null) {
		if (pdata) {
			if (type == "normal") {				
				if (pdata instanceof Promise) {
					var newPromise = new Promise((response,reject) => { 
						pdata.then(rs => {
							data = rs;
							returnVal.data = data;
							response(true);
						});
					});
				}
				else {
					var newPromise = new Promise((response,reject) => {
						data = pdata;
						returnVal.data = data;
						response(true);
					});
				}
				overrideDataFlag = true;
				newPromise.then(rs => {
					refreshDataList();				
				});
				
			}
		}
		else {
			refreshDataList();
		}
		return returnVal;
	};
	
	returnVal.activeEvents = [];
	returnVal.on = function(e, f) {
		switch(e) {
		case 'browsemore:click':
			onBrowseClick = f;
			break;
		case 'dropdown:click':
			onDropDownClick = f;
			break;
		case 'change':
			onChange = f;
		}
		returnVal.activeEvents.push(e);
		return returnVal;
	};
	
	returnVal.element = selectorBox[0][0];
	return returnVal;
}

function addKeysInList(dataX, keyID = "id") {
	//create a deep copy of the dataX
	var tmp = {};
	dataX.forEach((d,i) => {
		if (Array.isArray(keyID)) {
			var tmpID = ""
				keyID.forEach((c,j) => {
					tmpID += d[c] + (j < keyID.length - 1 ? "|" : ""); 
				});
			tmp[tmpID] = {};
			var tmpD = tmp[tmpID];
		}
		else {
			tmp[d[keyID]] = {};
			var tmpD = tmp[d[keyID]];
		}
		for (var key in d) {
			if (d.hasOwnProperty(key)) {
				tmpD[key] = d[key];
			}
		}
	});	
	return tmp;
}

function toProperCase(s)
{
  return s.toLowerCase().replace(/^(.)|\s(.)/g, 
          function($1) { return $1.toUpperCase(); });
}    

function convertHierToList(dataX, childrenKey) {
	var data = [];
	var listOnProcess = dataX;
	var level = 1;
	
	do {
    	var newList = [];
    	listOnProcess.forEach(d => {
    		var tmp = {};
    		
    		//create a hard copy for each array elements
    		for (var key in d) {
    			if (d.hasOwnProperty(key)) {
    				if (key !== childrenKey) {
    					tmp[key] = d[key];
    					//add key and descr
    					if (key === "id" && !d.key) {
    						tmp["key"] = d[key];
    					}
    					if (key === "title" && !d.descr) {
    						tmp["descr"] = d[key];
    					}    					
    				}
    			}
    		}
    		tmp.level = level;
    		if (d[childrenKey]) { //if it has children
    			newList = newList.concat(d[childrenKey]);
    		}
    		data.push(tmp);
    	});
    	listOnProcess = newList;
		level++;
	}
	while (listOnProcess.length > 1);
	return data;
}  

function transformJSONToFancytreeData(dataX, topNode = null, parentID = "parent", childrenID = "children", id = "id", descr = "descr") {
	//create a deep copy of the dataX
	var data = [];
	dataX.forEach((d,i) => {
		var tmp = {};
		for (var key in d) {
			if (d.hasOwnProperty(key)) {
				tmp[key] = d[key];
			}
		}
		if (d[id] && !d.key) {
			tmp["key"] = d[id];
		}
		if (d["title"] && !d[descr]) {
			tmp[descr] = d["title"];
		}		
		data.push(tmp);
	});
	var result = [];
	var parentGroup = {};
	var members = {};
	data.forEach((item,i) => {
		members[item[id]] = {};
		members[item[id]]["data"] = item;
		//set up parent group
		if (item[parentID]) {
			if (!parentGroup[item[parentID]]) {
				parentGroup[item[parentID]] = [];
			}
			parentGroup[item[parentID]].push(item);
		}
		else {
			if (!parentGroup["_0"]) {
				parentGroup["_0"] = [];
			}
			parentGroup["_0"].push(item);
		}
	});
	members["_0"] = {};
	for (var key in parentGroup) {
		if (members[key]) {
			members[key][childrenID] = parentGroup[key];
		}
	}
	//set up member - parents
	var tmp = {};
	tmp[id] = "_0";
	tmp["data"] = members["_0"];
	var list = [tmp];
	do {
		var addList = [];
		for (var i = list.length; i > 0; i--) {
			var ls = list.pop();
			if (ls[id] !== "_0") {
				if (parentGroup[ls[id]]) { //if it has children
					ls.data[childrenID] = parentGroup[ls[id]];
					 //loop through children and add to list to be checked
					ls.data[childrenID].forEach((d,j) => {
						var tmp = {};
						tmp[id] = d[id];
						tmp.data = d;
						addList.push(tmp);
					});
				}
			}
			else {
    			if (members[ls[id]][childrenID]) { //the first heirarchy flagged as "_0"
    				if (topNode) {
    					var topNodeCopy = {};  //create a hard copy of topNode so it won;t modify
    					for (var key in topNode) {
    						if (topNode.hasOwnProperty(key)) {
    							topNodeCopy[key] = topNode[key];		    				
    						}
    					}
	    				if (topNode[id] && !topNode.key) {
	    					topNodeCopy["key"] = topNode[id];
	    				}
	    				if (topNode["title"] && !topNode[descr]) {
	    					topNodeCopy[descr] = topNode["title"];
	    				}    
	    				
    					result.push(topNodeCopy);
    					topNodeCopy[childrenID] = parentGroup[ls[id]];
    					topNodeCopy[childrenID].forEach((d,j) => {  
    						var tmp = {};
    						tmp[id] = d[id];
    						tmp.data = d;    						
    						addList.push(tmp);
    					});
    				}
    				else {
        				members[ls[id]][childrenID].forEach((d,j) => {
        					result.push(d);
    						var tmp = {};
    						tmp[id] = d[id];
    						tmp.data = result[result.length -1];          					
        					addList.push(tmp)
        					//add topNode parent
        				});
    				}
    			}    				
			}
		}
		list = list.concat(addList);
	}
	while (list.length > 0)
	return result;
}  

function convertSpecialChars(t, s) {
	return t.replace(/[&\/\\#,+()$~%.'":*?<>{} ]/g,s);
}
    
 
    
