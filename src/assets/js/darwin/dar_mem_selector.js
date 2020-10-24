/* Darwin Member selector
 *
 *
 *
 */
var _storage = [];

function dimMemSelector(arg) {
	
}


//dimMemDBox - generates a member selector dialog consists of dimension members in fancy tree

function dimMemDBox(arg) {
  /* parameters:
   *    name: name of the dialog box container element
   *    env: environment
   *    dim: dimenson name
   *  data: use json formatted data instead of from webservice, will skip both env and dim parameters
   *  placeholderMember: initial member if there is not stored member cache
   *  initialMember: initial member selected
   *
   * return value:
   *	arg parameter variable with additional features  
   *		<return value>.on: event function used to run some codes after the event is triggered, similar to .on functiom in html elements
   *			events:
   *				onAccept: the accept button is clicked, used to retrieved the clicked data, the callback function is func(clicked_data)
   *				onCancel: the cancel button is clicked
   *				onClose: the dialog box is closed.
   * the selected member is stored in <env + '_' + dim + '_' + fname> local storage
   */
  var _env = arg.env; //required
  var _dim = arg.dim; //required
  var _model = arg.model; //required
  
  var _user = getCurrentUserName();
  var _name = arg.hasOwnProperty('name') ? arg.name : `ms0-${_env}-${_dim}`; 
  var _data = arg.hasOwnProperty('data') ? arg.data : null;
  var _currentView = arg.hasOwnProperty('view') ? arg.view : 'id';
  //var fancyTreeKeys = [];
  var _initHier = arg.hasOwnProperty('hier') ? arg.hier : '';
  
  var _suffix = _user ? '-' + _user: '';
  var _localStName = _env + '_MEMSELECTION_' + (arg.name ? arg.name : `ms0-${_dim}${_suffix}`);
  var _title = arg.hasOwnProperty('title') ? arg.title : "Select a " + _dim;
  
  var _forceRefresh = arg.hasOwnProperty('forceRefresh') ? arg.forceRefresh : false;

  var _placeholderMember = arg.hasOwnProperty('placeholderMember') ? arg.placeholderMember : null;
  var _initialMember = arg.hasOwnProperty('initialMember') ? arg.initialMember : null;
  var _initMem;
  if (_initialMember) {
	  _initMem = _initialMember;
  }
  else  {
	  if (_placeholderMember) {
		  var currentItem = getLocalStorage(_localStName);
		  if (!currentItem) {
			  _initMem = _placeholderMember;
		  }	  		  
	  }
  }
  
  var _anchor = arg.anchor;
  var _showLevelType = arg.hasOwnProperty('showLevelType') ? arg.showLevelType : false;

  //events
  arg.on = (e , f) => {
	  switch(e) {
	  case 'accept':
		  arg._onAccept = f;
		  break;
	  case 'cancel':
		  arg._onCancel = f;
		  break;
	  case 'close':
		  arg._onClose = f;
		  break;
	  }
  }

  var _showRecent = arg.hasOwnProperty('showRecent') ? arg.showRecent : true;
  var _maxRecentItems = arg.recentMaxItems ? arg.recentMaxItems : 5;
  var _recentStName = _env + '_MEMSELECTION_' + (arg.name ? arg.name : `ms0-${_dim}${_suffix}`) + '_RECENT';
  var _multiselect = arg.hasOwnProperty('multiselect') ? arg.multiselect : false;
  
  var _start = 0;
  var _maxCountMem = 10;
 
  
  if (_showRecent) {
	  //var dd = d3.select('body').selectAll("._modal-dim-member-recentbox select.recentbox-list");
	  var mX = memberSelectorRecentBox();
	  mX.on('click:browse', () => {
		  var members = _data == null ? getDimMemberList(_env,_model,_dim) : _data;
		  var viewS = getLocalStorage(_localStName + "_OPTIONS");
		  var view = viewS ? viewS.view : _currentView;
		  var param = {
				  'data': members,
				  'name': _name,
				  'localStName': _localStName,
				  'initMem': _initMem,
				  'view': view,
				  'title': _title,
				  'recentStoreName': _recentStName,
				  'recentMaxItem': _maxRecentItems,
				  'multiselect': _multiselect,
				  'parent': '',
				  'start': _start,
				  'count': _maxCountMem,
				  'hier': _initHier,
				  'model': _model,
				  'dimension': _dim,
				  'environment': _env,
				  'showLevelType': _showLevelType
		  };
		  memberSelectorDBox(param);
	  });
	  mX.on('click:recent', (e) => {
		  var recentList = getLocalStorage(_recentStName);
		  if (recentList) {
			  for (i = 0; i < recentList.length; i++) {
				  if (recentList[i].key == e || recentList[i].id == e) {
					  var rec = [];
					  rec.push(recentList[i]);
					  updateRecentList(_recentStName, _maxRecentItems, rec);
					  setLocalStorage(_localStName,rec);
					  arg._onAccept(rec);
					  break;
				  }
			  } 
		  }
	  });
	  
  }
  else {
	  var members = _data == null ? getDimMemberList(_env,_model,_dim) : _data;
	  //var convertResult = convertBPCToFancytree(members);
	  //var membersFT = convertResult.data;
	  //var membersFlat = convertResult.flatData;
	  //memberSelectorDBox(membersFT, name, membersFlat, localStName, initMem, view, title, recentStName, maxRecentItems, multiselect);
	  var viewS = getLocalStorage(_localStName + "_OPTIONS");
	  var view = viewS ? viewS.view : _currentView;
	  var param = {
			  'data': members,
			  'name': _name,
			  'localStName': _localStName,
			  'initMem': _initMem,
			  'view': view,
			  'title': _title,
			  'recentStoreName': _recentStName,
			  'recentMaxItem': _maxRecentItems,
			  'multiselect': _multiselect,
			  'parent': '',
			  'start': _start,
			  'count': _maxCountMem,
			  'hier': _initHier,
			  'model': _model,
			  'dimension': _dim,
			  'environment': _env,
			  'showLevelType': _showLevelType
	  };
	  memberSelectorDBox(param);
  }

  
  //
  
  /////////////////////////////////////////////////////////////////////////////
  //functions
  /////////////////////////////////////////////////////////////////////////////
  
  //show dropdown recent list
  function memberSelectorRecentBox() {
	  
	  var viewS = getLocalStorage(_localStName + "_OPTIONS");
	  var view = viewS ? viewS.view : _currentView;
	  
	  var maxItems = _maxRecentItems;
	  var recentStName = _recentStName;
	  var anc = _anchor;
	  
	  var ret = {};
	  
	  //events
	  ret.on = (e , f) => {
		  switch(e) {
		  case 'click:browse':
			  ret._onClickB = f;
			  break;
		  case 'click:recent':
			  ret._onClickR = f;
			  break;
		  }
	  }
	  
	  d3.select('body').selectAll("._modal-dim-member-recentbox").remove();
	  var dropdown = d3.select('body').append('div')
	  	.attr('class','recentbox-selection _modal-dim-member-recentbox')
	  	.style('position','absolute')
	  	.style('top','0')
	  	.style('float','left')
	  	.style('visibility','hidden');
	  //$(dropdown[0][0]).css('display','none');
	  var ddlist = dropdown.append("select")
	  	.attr('class','recentbox-list');
	  
	  var ddlistRecentG = ddlist.append("optgroup")
		.attr("label","Recently Selected Members")
		.style("text-transform","unset");
	  
	  var recent = getLocalStorage(recentStName);
	  var hasRecent = false;
	  
	  if (recent) {
		  if (recent.length > 0) {
			  for (i = recent.length - 1; i >= 0; i--) {
				  var value = '';
				  var r = recent[i];
				  var key = r.key;

				  switch (view) {
				  case 'desc':
					 value = r.descr;
					 break;
				  case 'id - desc':
					 value = r.id + ' - ' + r.descr;
					 break;
				  default:
					 value = r.id;
				  }
				  
				  ddlistRecentG.append("option").attr("value",key)
				  	.text(value);
				  hasRecent = true;
			  }
		  }
	  }
	  
	  if (!hasRecent) {
		  ddlistRecentG.append("option").attr("value",null)
		  	.text('<No Recent Selected>'); 
	  }
	  
	  ddlist.append("option")
		.attr("value","*BrowseMore*")
		.attr("class","browse-more")
		.text("Browse More...");
	  
	  
	  //select2
	  
	  var $ddlist = $(ddlist[0][0]);
	  $ddlist.select2(
			{
				theme: "memselect-recent",
				width: '40%',
				minimumResultsForSearch: Infinity
			}).on('select2:open', d => {
				if (anc) {
					var $selector = $(anc);
					var $dropdown = $('.select2-container--memselect-recent');
					var $dropdownX = $dropdown.children('.select2-dropdown--above');
		    		var pos = $selector.offset();
		    		$dropdown.css({
		    			width: '255px',
		    			left: pos.left - 250 + $selector.width(),
		    			top: pos.top - 10
		    		});
				}

	    		//ddlist.attr("data-open",1);
			}).on("select2:select", d => {
				var $selector = $(dropdown[0][0]).closest(".selector");
				var $dropdown = $selector.find(".select2-container");    	    		
	    		var $selValueBox = $(dropdown[0][0]).find("option:selected");
	    		var value = $selValueBox.attr("value");
	    		var $destBox = $selector.find(".selector-input").children("span");
	    		if (value !== "*BrowseMore*") {
	    			if (typeof ret._onClickR == 'function') {
	    				ret._onClickR(value);
	    			}
	    		}
	    		else {
	    			
	    			if (typeof ret._onClickB == 'function') {
	    				ret._onClickB(value);
	    			}	
	    		}
			});
	  $ddlist.select2('open');
	  
	  return ret;
  }


  // show member selector dialog box
  function memberSelectorDBox(p) {
	  /*parameters:
	   *    data: object data with heirarchy compatible with fancytree
	   *    name: name of the new created member selector box div
	   *    flatData: object data with same contents as data, but not in heirarchy format (flat format)
	   *    lStoreName: name of the local storage used to store selected members
	   *    initMem: initial selected member
	   *    title: title of the dialog box
	   *    initView: initial view
	   *    recentStoreName: name of the local storage used to store list of recent members
	   *    recentMaxItem: max number of recent list
	   *    isMultiSelect: multiselect flag
	   */
	// var data = p.data;
	 var name = p.name;
	 var flatData = p.flatData;
	 var lStoreName = p.localStName;
	 var initMem = p.initMem;
	 var title = p.title;
	 var initView = p.initView;
	 var recentStoreName = p.recentStoreName;
	 var recentMaxItem = p.recentMaxItem;
	 var isMultiselect = p.hasOwnProperty('multiselect') ? p.multiselect : false;
	 var start = p.start;
	 var count = p.count;
	 var hier = p.hier;
	 var model = p.model;
	 var dim = p.dimension;
	 var env = p.environment;
	 var xparent = p.parent;
	 var showLevelType = p.hasOwnProperty('showLevelType') ? p.showLevelType : false;
	 
	 var view = initView ? initView : 'id';
	 var tl = title ? title : "Select a member";
	 
	 var lStoreNameOpt = lStoreName + "_OPTIONS";
	 var options = getLocalStorage(lStoreNameOpt);
	 if (options) {
		 if (!initView && options.view) {
			 view = options.view;
		 }
	 }
	  
     d3.select('body').selectAll("._modal-dim-member-selector").remove();
     var modalSection = d3.select('body').append("div")
     	.attr("class","modal-section _modal-dim-member-selector member-selector")
     	.attr("id", "member-select-" + name);
     var $modalSection = $(modalSection[0][0]);
     var modalBox = d3.select($modalSection[0]).append("div")
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
       .text(tl);

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
			width: '40%',
			minimumResultsForSearch: Infinity
		}).on("select2:select", d => {
        var $selValueBox = $(ddIdDesc[0][0]).find("option:selected");
        var $mBox = $(modalBox[0][0]);
        var $treeBox = $mBox.find(".selection-fancy-tree");
        var view = $selValueBox.attr("value");

        var tree2 = $treeBox.fancytree("getTree");
        setFancyTreeTitle(tree2, view);
	});;
	
	
      
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
	
	var secndDiv = tmp.append("div").attr("class","top-hz-mid").style("display","none"); 

     var modalTree = modalBoxContent.append("div")
       .attr("class","modal-body")
       .append("div")
         .attr("class","selection-fancy-tree")
         .style("height","400px")
         .style("overflow","scroll")
         .style("border","solid 1px #eee");

     var $tree = $(modalTree[0][0])

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
	
	var currentItem = getLocalStorage(lStoreName);
	var sItem, sHn;
	
	if (isMultiselect) { //if multiselect is active, the selected items can be more than one
		sItem = [];
		sHn = [];
		if (initMem) {
			var initMemX;
			if (initMem.length) {
				initMemX = initMem;
			}
			else {
				initMemX = [initMem];
			}
			
			for (j = 0; j < initMemX.length; j++) {
				for (i = 0; i < flatData.length; i++) {
					var item = flatData[i];
					var desc = item.descr.toUpperCase();
					if (item.rid == initMemX[j] || desc == initMemX[j].toUpperCase().trim()) {
						sItem.push(item.id);
						break;
					}
					var p = initMemX[j].split(' - ');
					if (p.length > 1) {
						if(item & " = " & desc ==  p[0] + ' - ' + p[1].toUpperCase().trim()) {
							sItem.push(item.id);
							break;	
						}	
					}
				}
			}
		}
		else {
			if (currentItem) {
				if (currentItem.length) {
					currentItem.forEach(c => {
						sItem.push(c.id);
						sHn.push(c.key.split('|')[0]);
					});
				}
				else {
					sItem.push(currentItem.id);
					sHn.push(currentItem.key.split('|')[0]);
				}
			}
		}
	}
	else {
		if (initMem) { //initMem can be array (multiselect) or single item caused of switching from multi 
			var initMem0;
			if (initMem.length) {
				initMem0 = initMem[0];
			}
			else {
				initMem0 = initMem;
			}

			for (i = 0; i < flatData.length; i++) {
				var item = flatData[i];
				var desc = item.descr.toUpperCase();
				if (item.rid == initMem || desc == initMem.toUpperCase().trim()) {
					sItem = item.id;
					break;
				}
				var p = initMem.split(' - ');
				if (p.length > 1) {
					if(item & " = " & desc ==  p[0] + ' - ' + p[1].toUpperCase().trim()) {
						sItem = item.id;
						break;	
					}	
				}
			}
		}
		else {
			if (currentItem) { //currentItem (selected item stored locally) can be array (multiselect) or single item
				if (currentItem.length) {
					sItem = currentItem[0].id;
					if (currentItem[0].key) {
						sHn = currentItem[0].key.split("|")[0];
					}
					
				}
				else {
					sItem = currentItem.id;
					if (currentItem.key) {
						sHn = currentItem.key.split("|")[0];
					}
				}
				
			}
		}
	}
	
	var dimHirCount = parseInt(_storage[env].models[model].dimensions[dim].hcount);
	var hierSel = -1;
	if (dimHirCount) {
		secndDiv.style("display",null); 
		var hierBox = secndDiv.append("select")
			.attr("class", "hier-dropdown");
		var hierBoxT = [], hierBoxTA;
		for (var i = 1; i <= dimHirCount; i++) {
			hierBoxT.push(hierBox.append("option").attr("value",i).text("H" + i));
		}
		if (dimHirCount > 1) {
			hierBoxTA = hierBox.append("option").attr("value",-1).text("ALL");
		}

		
		if (Array.isArray(sHn)) {
			if (sHn.length > 1) {
				if (hierBoxTA) {
					hierBoxTA.attr("selected","true");
				}
			}
			else {
				var h = sHn[0].replace("PARENTH","").replace("H","");
				if (!isNaN(h)) {
					hierSel = parseInt(h);
					hierBoxT[hierSel - 1].attr("selected","true");
				}
			}
		}
		else {
			var hNum = '';
			
			if (sHn) {
				hNum = sHn.replace("PARENTH","").replace("H","");
			}
			else {
				hNum = 1; //if there is no recent selected item
			}
			
			
			if (!isNaN(hNum)) {
				hierSel = parseInt(hNum);
				hierBoxT[hierSel - 1].attr("selected","true");
			}
		}
		
		
		$(hierBox[0][0]).select2(
				{
					theme: "hir",
					width: '15%',
					minimumResultsForSearch: Infinity
				}
			).on("select2:select", d => {
		        var $selValueBox = $(ddIdDesc[0][0]).find("option:selected");
		        var $mBox = $(modalBox[0][0]);
		        var $treeBox = $mBox.find(".selection-fancy-tree");
		        var view = $selValueBox.attr("value");
		        var hr = [];
		        if (d.params.data.id == '-1') {
					for (var j = 1; j <= dimHirCount; j++) {
						hr.push("PARENTH" + j);
					}
		        }
		        else {
		        	hr.push("PARENTH" + d.params.data.id);
		        }
		        
		        //var tree2 = $treeBox.fancytree("getTree");
		        $treeBox.fancytree("destroy");
		        fdata = [];
	        	hr.forEach(h => {
	        		var dt = getMembers(env, model, dim, h, start, count, xparent, sItem);
	        		fdata = fdata.concat(dt);
	        	});
	        	if (!isMultiselect) {
	        		$treeBox = createTree($tree,fdata, isMultiselect, sHn + "|" + sItem);
	        	}
	        	else {
	        		var sel = [];
	        		sItem.forEach((s,i) => {
	        			sel.push(sHn[i] + '|' + s);
	        		});
	        		$treeBox = createTree($tree,fdata, isMultiselect, sel);
	        	}
		        setFancyTreeTitle($treeBox, view);
			});
	}
	
	if (showLevelType) {
		var hlevelType = secndDiv.append("select");
		var hlevelTypeSelf = hlevelType.append("option").attr("value",'self').text("Self");
		var hlevelTypeCh = hlevelType.append("option").attr("value",'child').text("Children");
		var hlevelTypeBse = hlevelType.append("option").attr("value",'base').text("Leaves");
		var hlevelTypeParent = hlevelType.append("option").attr("value",'parent').text("Parent");
		var hlevelTypeSibling = hlevelType.append("option").attr("value",'sibling').text("Siblings");
		var hlevelTypeDLvl = hlevelType.append("option").attr("value",'deplvl').text("Descendants");
		
		var hlevelTypeDLvlNum = secndDiv.append("input").attr("class","dlvl-input")
				.style("display","none");
		
		$(hlevelTypeDLvlNum[0][0]).val("2");
		
		$(hlevelType[0][0]).select2(
				{
					theme: 'level-type',
					width: '24%',
					minimumResultsForSearch: Infinity
				}).on("select2:select", d => {
					var value = d.params.data.id;
					if (value == 'deplvl') {
						hlevelTypeDLvlNum.style("display",null);
					}
					else {
						hlevelTypeDLvlNum.style("display","none");
					}
				});
	}

	
	var hierX = [];
	if (hier) {
		hierX.push(hier);
	}
	else {
		if (hierSel == -1) {
			if (dimHirCount) { 
				for (var i = 1; i <= dimHirCount; i++) {
					hierX.push("PARENTH" + i);
				}
			}
		}
		else {
			hierX.push("PARENTH" + hierSel);
		}
	}
	
	if (!hierX.length) {
		hierX.push('PARENTH1'); //default
	}
	
	var fdata = [];
	hierX.forEach(h => {
		var dt = getMembers(env, model, dim, h, start, count, xparent, sItem);
		fdata = fdata.concat(dt);
	});
	
	var tree;
	if (!isMultiselect) {
		tree = createTree($tree,fdata, isMultiselect, sHn + "|" + sItem);
	}
	else {
		var sel = [];
		sItem.forEach((s,i) => {
			sel.push(sHn[i] + '|' + s);
		});
		tree = createTree($tree,fdata, isMultiselect, sel);
	}
	
 	
 	if (view == 'desc' || view == 'id - desc') {
 		setFancyTreeTitle(tree, view);
 	}
 	

	//var storeTempItemsMS = {}; //stores multiselected items when the search is toggled off 
	var storeSelectedItem = {}, snode; 
	if (isMultiselect) {
		snode = tree.getSelectedNodes();
	}
	else {
		snode = tree.getActiveNode();
	}
	
	if (snode) {
		if (isMultiselect) {
			
		}
		else {
			storeSelectedItem[snode.key] = {selected: true};
		}
	}

	$(acceptButton[0][0]).on('click', () => {
		
		var $selValueBox = $(ddIdDesc[0][0]).find("option:selected");
		var opt = getLocalStorage(lStoreNameOpt);
		if (!opt) {
			opt = {};
		}
		opt.view = $selValueBox.attr("value");
		setLocalStorage(lStoreNameOpt, opt);
		
		var levelType = 'self';
		if (showLevelType) {
			levelType = $(hlevelType[0][0]).find("option:selected").attr("value");
		}
		
		var data = [];
		if (isMultiselect) {
			var selected  = $tree.fancytree('getTree').getSelectedNodes();
			if (selected) {
				//var data = [];
				selected.forEach(s => {
					data.push({
						id: s.data.id,
						descr: s.data.descr,
						key: s.key
					});
				});
				setLocalStorage(lStoreName, data);
				//update the recent list
				updateRecentList(recentStoreName, recentMaxItem, data);
			}
		}
		else {
			
			var selected  = $tree.fancytree('getTree').getActiveNode();
			
			if (selected) {
				
				if (levelType == 'self') {
					data.push({
						id: selected.data.id,
						descr: selected.data.descr,
						key: selected.key
					});
				}
				else {

					var deep = $(hlevelTypeDLvlNum[0][0]).val();
					var tmp = getMemberByHier(env,model,dim,selected['key'].split("|")[0],selected['key'].split("|")[1],levelType,deep);
					if (tmp.length) {
						data = tmp;
					}
				}
				
				if (data) {
					setLocalStorage(lStoreName, data);
					
					//update the recent list
					updateRecentList(recentStoreName, recentMaxItem, data);
				}

			}

			
		}
		
		$(modalBox[0][0]).modal('toggle');
		
		if (arg._onAccept) {
			if (typeof arg._onAccept === 'function') {
				if (selected) {
					arg._onAccept(data);
				}
				else {
					arg._onAccept(null);
				}
			}
		}
	});
	
	$(closeButton[0][0]).on('click', () => {
		if (arg._onCancel) {
			if (typeof arg._onCancel === 'function') {
				arg._onCancel();
			}
		}
	});
	
	$(modalBox[0][0]).modal();
	$(modalBox[0][0]).draggable({
		handle: ".modal-header"
	});
       
    //search box - find
	
	$(modalBox[0][0]).on("click",".search-box > button.search-find", e => {
		
		
		var alreadyFilter = ($(modalBox[0][0]).attr('data-filtered') == 'true');
			//$(modalBox[0][0]).find(".search-box > button.search-close").click();
		
		var $textbox = $(modalBox[0][0]).find(".search-box > input");
		var $closeButton = $(modalBox[0][0]).find(".search-box > button.search-close");
		var value = $textbox.val();
		var $tree = $(modalBox[0][0]).find(".selection-fancy-tree");
		var treeBox = $tree.fancytree("getTree");
		var $selValueBox = $(ddIdDesc[0][0]).find("option:selected");
		var view = $selValueBox.attr("value");
		
		var selectedKey, selected;
		
		if (value) {
			
			var tree = $tree.fancytree('getTree');
			if (isMultiselect) {
				
			}
			else {
				node = tree.getActiveNode();
				if (node) {
					storeSelectedItem = {}; //clear
					storeSelectedItem[node.key] = {selected: true};
				}

			}
			
			var searchResults = searchMembers(env, model, dim, hier, start, count, value);
			$tree.fancytree("destroy");
			
			$closeButton.css("display","inline");
			$(modalBox[0][0]).attr("data-filtered",true);
			
			if (isMultiselect) {
				
			}
			else {
				var treeBoxUpd = createTree($tree, searchResults, false, Object.keys(storeSelectedItem)[0]);
				setFancyTreeTitle(treeBoxUpd,view);
			}

		}
		
	});
	
	//search box - close
    $(modalBox[0][0]).on("click",".search-box > button.search-close", e => {
    	var $textbox = $(modalBox[0][0]).find(".search-box > input");
    	var $tree = $(modalBox[0][0]).find(".selection-fancy-tree");
    	var treeBox = $tree.fancytree("getTree");
    	var $selValueBox = $(ddIdDesc[0][0]).find("option:selected");
        var view = $selValueBox.attr("value");
    	var selectedKey, selected;
    	
    	if (isMultiselect) {
    		
    	}
    	else {
    		selected = treeBox.getActiveNode();
    	}
    	
    	$tree.fancytree("destroy");
    	
    	if (isMultiselect) {
    		
    	}
    	else {
    		if (selected) {
    			selectedKey = selected.key;
    		}
    		else {
    			selectedKey = Object.keys(storeSelectedItem)[0];
    		}
        	treeBox = createTree($tree, fdata, false, selectedKey);
        	setFancyTreeTitle(treeBox, view)   		
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
  
  function updateRecentList(recentName, maxNum, sel) {
	//update the recent list
	var recentItem = getLocalStorage(recentName);
	var needsUpdate = false;
	// recentStoreName, recentMaxItem
	var selArray = [];
	if (Array.isArray(sel)) {
		selArray = sel;
	}
	else {
		selArray.push(sel);
	}
	
	selArray.forEach(s => {
		if (!recentItem) {
			recentItem = [s];
			needsUpdate = true;
		}
		
		else {

			for (i = 0; i < recentItem.length; i++) {
				if (recentItem[i].id == s.id) {
					recentItem.splice(i,1);
					break;
				}
			}
			
			if (recentItem.length >= maxNum) {
				recentItem.shift();
			}
			recentItem.push(s);
			needsUpdate = true

		}
	});

	
	if (needsUpdate) {
		setLocalStorage(recentName,recentItem);
	}

  }
  
  function setFancyTreeTitle(tree2, view) {
	  tree2.visit(node=> {
		if (node.statusNodeType != 'paging') {
	    	var idVal = node.data.id;
	      	var descVal = node.data.descr ? node.data.descr : node.data.id;
	  		switch (view) {
	  		case 'id':
	  			node.setTitle(idVal);
	  			break;
	  		case 'desc':
	  			node.setTitle(descVal);
	  			break;
	  		default:
	  			node.setTitle(idVal + " - " + descVal);
	  		}
		}

	  });
  }
  
  function locationPrefix() {
	  if (location.host == 'darwinepm.github.io' || location.host == '172.16.0.114' || location.protocol == 'file:') {
	      return 'https://sapwd.column5.com:2443';
	  } else {
	      return location.protocol + '//' + location.host;
	  }  	  
  }


  function getDimMemberList() {
     
     if (_forceRefresh || !_storage[_env]) {
    	 createStorage(_env,_model);
     }
     else if (_storage[_env]){
    	 if (!_storage[_env]['models'][_model]) {
    		 createStorage(_env,_model);
    	 }
     }

     return _storage[_env]['models'][_model]['dimensions'][_dim]['members'];
  }
  
  function getCsrfToken(url) {
	  var result;
	  $.ajax({
	       url: url,
	       type: "GET",
	       async: false,
	       username: getCurrentUserName(),
	       beforeSend: function(xhr){xhr.setRequestHeader('x-csrf-token', 'fetch');},
	       success: (data, textStatus, request) => { result = request.getResponseHeader('x-csrf-token'); }
	    });
	  return result;
	}  
  
  function genericAjaxXMLPostSync(url, data, csrfToken){
      var result;
      $.ajax({
              url: url,
              type: 'POST',
              contentType: 'text/xml',
              data: data,
              dataType: 'xml',
              async: false,
              headers: { "x-csrf-token": csrfToken },
              success: (response)=> { result = response; },
              error:  (jqXHR, textStatus, errorThrown)=> { result = jqXHR.responseText; }
          });

      return result;
  }

  function getBPCMembers(environment, model) {
      var url = ``;
      var csrfToken = ``;
      var request = ``;
      
      url = `${locationPrefix()}/sap/bw/cs/user`;
      csrfToken = getCsrfToken(url);

      url = `${locationPrefix()}/sap/bpc/applications/`+environment+`/`+model+`?format=csv&level=0`;

      return genericAjaxXMLPostSync(url, request, csrfToken);

      }

  function getMembers(environment, model, dimension, hierarchy, start, count, parent, include) {
      var data = [];
      var nodes;
      var length;

      if (parent)
      {
          nodes = Object.entries(_storage[environment]['models'][model].dimensions[dimension].members).filter(element => element[1][hierarchy] === parent && element[1]["ID"] != parent);
      }
      else
      {
          nodes = Object.entries(_storage[environment]['models'][model].dimensions[dimension].members).filter(element => element[1][hierarchy] === element[1]["ID"]);
      }
      nodes.forEach(element => {
          if (element[1].CALC === 'N' )
          {
              data.push({id: element[1].ID,
            	  descr: element[1].EVDESCRIPTION,
            	  title: element[1].ID, 
            	  key: hierarchy + "|" + element[1].ID});
          }
          else
          {
              data.push({id: element[1].ID,
            	  title: element[1].ID, 
            	  descr: element[1].EVDESCRIPTION,
            	  key: hierarchy + "|" + element[1].ID, 
            	  folder: true, 
            	  lazy: true});
          }
      });
      length = data.length;        
      data = data.slice(start,start+count);   
      if (start+count<length)
       {
           
           data.push({title: "More...", 
        	   statusNodeType: "paging", 
        	   icon: false, 
        	   parent: parent, 
        	   start: start+count, 
        	   count: count, 
        	   'hier': hierarchy});
       }
      
      if (include) { //additional code to include the selected node, even deep in the tree
    	  
    	  var includeX, includeXParent = {};
    	  if (Array.isArray(include)){
    		  includeX = include;
    	  }
    	  else {
    		  includeX = [include];
    	  }
    	  
    	  var includeParentAffected = {};
    	  includeX.forEach(iX => {
              var includeInfo = _storage[environment]['models'][model].dimensions[dimension].members[iX.toString()];;
              var pass;
              var subnode;
              if (includeInfo) {
            	  includeXParent[includeInfo[hierarchy]] = true;
            	  var hlevel = parseInt(includeInfo.HLEVEL);
            	  var hlevelp = 1;
            	  if (parent) { //if parent is indicated, no need to go to the top level hierarchy, stop only to the 'parent' param
            		  var tmp = _storage[environment]['models'][model].dimensions[dimension].members[parent];
            		  if (tmp) {
            			  hlevelp = parentInt(tmp.HLEVEL); 
            		  }
            	  }
                  while (!pass){
                	  if (includeInfo[hierarchy] === includeInfo.ID || includeInfo[hierarchy] === parent || hlevel <= hlevelp) {
                		  pass = true; //exit loop when the top node, gone to the 'parent' variable node, and HLEVEL of the 'parent'
                	  }
                	  else { 
                		  /*if (includeTrace.search(includeInfo[hierarchy] + ';') == -1) {
                    		  includeTrace += includeInfo[hierarchy] + ';'; //write the list of parent and ancestors up to the top or 'parent' param
                		  }*/
                		  includeParentAffected[includeInfo[hierarchy]] = true;
                		  includeInfo = _storage[environment]['models'][model].dimensions[dimension].members[includeInfo[hierarchy]];
                	  }
                	  hlevel--;
                  }  
              }
    	  });

          /*subnodes = Object.entries(_storage[environment]['models'][model].dimensions[dimension].members).filter(element => includeTrace.search(element[1][hierarchy] + ';') > -1
        		  																&& element[1]["ID"] != element[1][hierarchy]);*/
    	  
    	  subnodes = Object.entries(_storage[environment]['models'][model].dimensions[dimension].members).filter(element => includeParentAffected[element[1][hierarchy]] 
    			  									&& element[1]["ID"] != element[1][hierarchy]);
          
          //var includeTraceList = includeTrace.split(";");
          var includeTraceChildContent = {};
          var includeParent = []; //get the parent of the include member, to create paging
          

          for (var prt in includeParentAffected) {
        	  if (!includeTraceChildContent[prt]) {
        		  includeTraceChildContent[prt] = [];
        	  }
              subnodes.forEach(element => {
            	  //var isLazy = includeTrace.search(element[1].ID + ";") < 0;
            	  var isLazy = includeParentAffected[element[1].ID] ? false : true;
            	  if (element[1][hierarchy] == prt) {
            		  includeTraceChildContent[prt].push({
            			  id: element[1].ID,
                    	  title: element[1].ID, 
                    	  descr: element[1].EVDESCRIPTION,
                    	  key: hierarchy + "|" + element[1].ID, 
                    	  folder: (element[1].CALC != 'N'),
                    	  lazy: (element[1].CALC === 'N' ? false : isLazy)
            		  });
            	  }
            	  
            	  /*if (Array.isArray(include)) {
            		  
            	  }
            	  else {
                	  if (element[1].ID == include) {
                		  includeParent.push(element[1][hierarchy]);
                	  } 
            	  }*/
              });
          }
          
          //includeParent.forEach(iP => {
          var includeXFS = {};
          
          includeX.forEach(iX => {
        	  includeXFS[iX] = true;
          });
          
          for (var iP in includeXParent) {
        	  var includeIndex = 0;
              if (includeTraceChildContent[iP]) {
            	  for (var i = 0; i < includeTraceChildContent[iP].length; i++) {
            		  /*if (includeTraceChildContent[iP][i].id == include) {
            			  includeIndex = i;
            			  
            		  }*/
            		  if (includeXFS[includeTraceChildContent[iP][i].id]) {
            			  includeIndex = (includeIndex < i ? i  : includeIndex); 
            		  }
            	  }
            	  
            	  
            	  
                  length = includeTraceChildContent[iP].length;  
            	  var max = -1;
            	  if (count <= includeIndex ) {
            		  max = includeIndex + 1;
            	  }
            	  else if (length > count) {
            		  max = count;
            	  }
            	  
                  if (max > -1) {
                	  includeTraceChildContent[iP] = includeTraceChildContent[iP].slice(0,max);  
                	  if (includeIndex < (length - 1)) {
                    	  includeTraceChildContent[iP].push({title: "More...", 
                          	   statusNodeType: "paging", 
                          	   icon: false, 
                          	   parent: iP, 
                          	   start: max, 
                          	   count: count, 
                          	   'hier': hierarchy});
                	  }
                  }
              }
          }

          //});
          
          for (var key in includeTraceChildContent) {
        	  var tmp = includeTraceChildContent[key];
        	  tmp.forEach(t => {
            	  if (!t.lazy && t.folder) {
            		  t.children = includeTraceChildContent[t.id];
            	  }
        	  });
          }
          
          var topNode = Object.entries(_storage[environment]['models'][model].dimensions[dimension].members).filter(element => element[1][hierarchy] === element[1]["ID"]);
          max = -1;
          for (var key in includeParentAffected) { //if the selected node's top parent is not included
        	  for (var i = 0; i < topNode.length; i++) {
        		  if (topNode[i][0] == key.toString()) {
        			  if (i >= count) {
        				  max = i + 1;
        				  break;
        			  }
        		  }
        	  }
          }
          
          if (max > 0) { //re-expand the top node to include the selected node outside the count
        	  data = getMembers(environment, model, dimension, hierarchy, start, max);
          }
          
          data.forEach(d => {
        	  if (includeParentAffected[d.id]) {
        		  d.lazy = false;
        		  var child = $.extend(true, includeTraceChildContent[d.id], []);
        		  d.children =  child;
        	  }
          });

      }

      return data;
  }  

  function searchMembers(environment, model, dimension, hierarchy, start, count, id, view, include) {
      var data = [];
      var nodes;
      var length
      var re = new RegExp(id,"gi");

      if (id)
      {
    	  switch (view) {
    	  case 'desc':
    		  nodes = Object.entries(_storage[environment]['models'][model].dimensions[dimension].members).filter(element => element[1]["EVDESCRIPTION"].search(re) > -1);
    		  break;
    	  case 'id - desc':
    		  nodes = Object.entries(_storage[environment]['models'][model].dimensions[dimension].members).filter(
    				  element => (element[1]["ID"] + ' - ' + element[1]["EVDESCRIPTION"]).search(re) > -1);
    		  break;
		  default:
			  nodes = Object.entries(_storage[environment]['models'][model].dimensions[dimension].members).filter(element => element[1]["ID"].search(re) > -1);	  
    	  }
      }
      
      nodes.forEach(element => {
          if (element[1].CALC === 'N' )
          {
              data.push({id: element[1].ID,
            	  descr: element[1].EVDESCRIPTION,
            	  title: element[1].ID, 
            	  key: hierarchy + "|" + element[1].ID});
          }
          else
          {
              data.push({id: element[1].ID,
            	  title: element[1].ID, 
            	  descr: element[1].EVDESCRIPTION,
            	  key: hierarchy + "|" + element[1].ID, 
            	  folder: true, 
            	  lazy: true});
          }
      });
      length = data.length;        
      data = data.slice(start,start+count);   
      if (start+count<length)
       {
          data.push({title: "More...", 
       	   statusNodeType: "paging", 
       	   icon: false, 
       	   parent: parent, 
       	   start: start+count, 
       	   count: count, 
       	   'hier': hierarchy});
       }
      return data;
  } 
  
  function createStorage() {
      var data;
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

      data = getBPCMembers(_env, _model);

      lines = data.split(/\r\n|\n|\r/) 

      if (lines[0])
      {                
          line = lines[0].split(/\t/)

          model = line[0];

          _storage[_env] = {"name": _env, "models": {}};
          _storage[_env]['models'][model] = {"name":model,"description":line[1],"dcount":line[2].replace(/dcount=/i,""),"islkfenabled":line[3].replace(/islkfenabled=/i,""),"dimensions":[]};
          
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

                  _storage[_env]['models'][model].dimensions[line[0]] = {"name":line[0], 
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

                  _storage[_env]['models'][model].dimensions[line[0]].properties["ID"] = {"name":"ID","description":"ID"};
                  _storage[_env]['models'][model].dimensions[line[0]].properties["EVDESCRIPTION"] = {"name":"EVDESCRIPTION","description":"Description"};

                  parents = lines.slice(parseInt(nextLine), 
                                        parseInt(nextLine) + parseInt(parentCount)) 
                                        
                  parents.forEach(element => {
                      nodes = element.split(/\t/);
                      _storage[_env]['models'][model].dimensions[line[0]].parents[nodes[0]] = {"name":nodes[0],"level":nodes[1],"defaultmember":nodes[2].replace(/defaultmember=/i,""),"isphysical":nodes[3].replace(/isphysical=/i,"")};
                      _storage[_env]['models'][model].dimensions[line[0]].properties[nodes[0]] = {"name":nodes[0],"description":nodes[1]};
                  });
                  
                  properties = lines.slice(parseInt(nextLine) + parseInt(parentCount), 
                                           parseInt(nextLine) + parseInt(parentCount) + parseInt(propertyCount))
                                        
                  properties.forEach(element => {
                      nodes = element.split(/\t/);
                      _storage[_env]['models'][model].dimensions[line[0]].properties[nodes[0]] = {"name":nodes[0],"description":nodes[1]};
                  });

                  members = lines.slice(parseInt(nextLine) + parseInt(parentCount) + parseInt(propertyCount),
                                        parseInt(nextLine) + parseInt(parentCount) + parseInt(propertyCount) + parseInt(memberCount));


                  members.forEach(element => {
                      nodes = element.split(/\t/);
                      _storage[_env]['models'][model].dimensions[line[0]].members[nodes[0]] = {};
                      for (x = 0; x < parseInt(parentCount) + parseInt(propertyCount) + 2; x++) {           
                    	  _storage[_env]['models'][model].dimensions[line[0]].members[nodes[0]][Object.entries(_storage[_env]['models'][model].dimensions[line[0]].properties)[x][1].name] = nodes[x];                                          
                      }
                  });                                                

          }
      }

  	}
  
  
  function changeTitle(data, view) {
	  data.forEach(d => {
		  if (d.statusNodeType != 'paging') {
			  switch (view) {
			  case 'desc':
				  d.title = d.descr;
				  break;
			  case 'id - desc':
				  d.title = d.id + ' - ' + d.descr;
				  break;
			  default:
				  d.title = d.id;
			  }
		  }
	  });
  }

  function createTree(tree, data, isMultiselect, selected) {
	    var $ddIdDesc = $('._modal-dim-member-selector .id-desc-dropdown');
		tree.fancytree({
	    	 quicksearch: true,
	    	 checkbox: isMultiselect,
	    	 activeVisible: true,
	    	 source: data,
	    	 lazyLoad: (event, data) => {
	    		 var hier = data.node.key.split("|")[0];
	    		 var dr = getMembers(_env, _model, _dim, hier, _start, _maxCountMem, data.node.data.id);
	    		 var view = $ddIdDesc.select2('data')[0].id;
	    		 changeTitle(dr,view);
	    		 data.result = dr;
	    	 },
	    	 clickPaging: (event, data) => {
	    		 var hier = data.node.key.split("|")[0];
	    		 var view = $ddIdDesc.select2('data')[0].id;
	    		 var dr = getMembers(_env, _model, _dim, data.node.data.hier, data.node.data.start, data.node.data.count, data.node.data.parent);
	    		 changeTitle(dr,view);
	    		 data.node.replaceWith(dr).done(function(){
	    			 				//setFancyTreeTitle(tree, view);
	    		 				});    
	    		 
	    	 }
		});
		
		if (selected) {
			if (isMultiselect) {
				var sel = [];
				if (!Array.isArray(selected)) {
					sel.push(selected);
				}
				else {
					sel = selected;
				}
				sel.forEach(s => {
					
					var mustSelect = tree.fancytree("getTree").getNodeByKey(s.toString());
		    		if (mustSelect) {
		    			mustSelect.setActive(true);
		    			mustSelect.setSelected(true);
		    		}
				});
			}
			else {
				var sel;
				if (Array.isArray(selected)) {
					sel = selected[0];
				}
				else {
					sel = selected;
				}
	    		var mustSelect = tree.fancytree("getTree").getNodeByKey(sel.toString());
	    		if (mustSelect) {
	    			mustSelect.setActive(true);
	    		}
			}
		}
		
	 return tree.fancytree("getTree");
  }   
  
  function getMemberByHier(environment, model, dimension, hierarchy, member, type, ideep) {
      var data = [];
      var nodes;
      var storage = _storage[environment]['models'][model].dimensions[dimension].members;
      //console.log('A',environment, model, dimension, hierarchy, member, type, ideep, storage)
      switch (type) {
      case 'parent':
    	  //var tmp = _storage[environment]['models'][model].dimensions[dimension].members;
    	  //nodes = [];
    	  if (storage[member]) {
    		  var pr = storage[member][hierarchy];
    		  nodes = [];
    		  if (pr) {
    			  nodes.push([pr, storage[pr]]);
    		  }
    		  
    	  }
    	  break;
      case 'child':
    	  
    	  nodes = Object.entries(storage).filter(element => {
				return element[1][hierarchy] != element[1]["ID"] && element[1][hierarchy] == member});
    	  break;
      case 'base':
    	  var flag = true;
    	  var tparents = [member];
    	  var baseMbr = {};
    	  while (flag) {
    		  var tmpnodes;
    		  var children = [];
			  for (var i = 0; i < tparents.length; i++) {
				  tmpnodes = Object.entries(storage).filter(element => 
					  element[1][hierarchy] != element[1]["ID"] && element[1][hierarchy] == tparents[i]
				  );
				  if (tmpnodes.length) {
					  tmpnodes.forEach(t => {
						  if (t[1].CALC == "N") {
							  baseMbr[t[0]] = t[1];
						  }
						  else {
							  children.push(t[0]);
						  }
					  });
				  }
				  else {
					  baseMbr[tparents[i]] = storage[tparents[i]];
				  }
			  }
			  if (children.length) {
				  tparents = children;
			  }
			  else {
				  flag = false;
			  }
			  
    	  }
    	  nodes = Object.entries(baseMbr);
    	  break;
      case 'sibling':
    	  if (storage[member]) {
    		  var pr = storage[member][hierarchy];
    		  if (pr) {
    			  nodes = Object.entries(storage).filter(element => {
    				  return element[1][hierarchy] != element[1]["ID"] && element[1][hierarchy] == pr && element[1]["ID"] != member;
    			  });
    		  }
    		  
    	  }
    	  break;
      case 'sibling-self':
    	  if (storage[member]) {
    		  var pr = storage[member][hierarchy];
    		  if (pr) {
    			  nodes = Object.entries(storage).filter(element => {
    				  return element[1][hierarchy] != element[1]["ID"] && element[1][hierarchy] == pr;
    			  });
    		  }
    		  
    	  }
    	  break;
      case 'deplvl':
    	  var deep = 1;
    	  var depMem = {};
    	  var tparents = [member];
    	  if (!isNaN(ideep)) {
    		  deep = ideep;
    	  }
    	  while (deep > 0) {
    		  var tmpnodes;
    		  var children = [];
    		  for (var i = 0; i < tparents.length; i++) {
				  tmpnodes = Object.entries(storage).filter(element => 
				  	element[1][hierarchy] != element[1]["ID"] && element[1][hierarchy] == tparents[i]
				  );
				  if (tmpnodes.length) {
					  tmpnodes.forEach(t => {
						  children.push(t[0]);
					  });
				  }
    		  }
    		  if (children.length) {
    			  tparents = children;
    		  }
    		  
    		  if (!tparents.length) {
    			  break;
    		  }
    		  if (deep == 1) {
    			  children.forEach(c => {
    				  depMem[c] = storage[c];
    			  });
    		  }
    		  deep--;
    	  }
    	  nodes = Object.entries(depMem);
      }

      nodes.forEach(element => {
          data.push({id: element[1].ID,
        	  descr: element[1].EVDESCRIPTION,
        	  title: element[1].ID, 
        	  key: hierarchy + "|" + element[1].ID});
      });

      return data;
  }

  return arg;
}
