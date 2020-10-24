$(document).ready(function() {

	var help_article_dataKeys, ha_datatTable;

	
	var application_list = ["DARCE","LIBRARY"];
	var area_list = {"DARCE": ["AUDIT","CALC GROUP","CALCULATION","DASHBOARD","DATA SOURCE","DEBUGGER","DRIVER","INSTALLED VERSION","STEP","UPLOAD DOWNLOAD","USERS","VARIABLE"],
			"LIBRARY": ["HELP ARTICLES"]};
	
	var isTableInit = false;
	
	var refreshButton = $("#help-article-main-pg").find("a.refresh");
	
	function fillUpHelpTable() {
		
		refreshButton.addClass("spin");
		var promiseDataLoad = dataHelpArticleRead();	
		
		promiseDataLoad.then(rs => {
			var help_article_data = rs;
			help_article_dataKeys = addKeysInList(help_article_data.map(x => { var xA = x;
					xA.deleted = false;
					xA.recentAdd = false;
					return xA;
				}),["AppItem","App","AppArea"]);
			
		    if (isTableInit) {
		    	ha_datatTable.destroy();
		    }
			ha_datatTable = $(".help-article-table").DataTable({
					data: help_article_data,
					dom:"t",
					aaSorting: [],
					pageLength: -1,				
					columns: [
						{data: 'AppItem', 
						 width: 240,
						 render: (data, type, row) => { 
							 var tmp = data + "|" + row["App"] + "|" + row["AppArea"];
							 return `<a href='javascript:void(0)' class="right-click hyperlink" data-id="${tmp}" data-type='help-article'>${data}</a>`;
						 }},
						{data: 'App', width: 200},
						{data: 'AppArea', width: 200},
						{data: 'UserIdLastChange', width: 150},
						{data: 'DateTimeLastChanged', 
							width: 250, 
							render: (data) => {
								$.fn.dataTable.moment( 'M/D/YYYY, h:mm:ss A' );
								return getFormattedDateTime(data);
								}
							}
				] });	
			
		    $.contextMenu({
		        selector: '.right-click',
		        callback: function(key, options) {
		        	//console.log(key,options,$(this));
		        	switch (key) {
		        	case "view":
		        		$(this).click();
		        		break;
		        	case "copy":
		        		copyArticleModal(this);
		        		break;
		        	case "delete":
		        		deleteArticleModal(this);
		        	}
		        },
		        items: {
		            "view": {
		                name: "View",
		                icon: 'menu-rename'
		            },
		            "copy": {
		                name: "Copy",
		                icon: 'menu-copy'
		            },
		            "delete": {
		                name: "Delete",
		                icon: 'menu-delete'
		            }
		        }
		    });
		    
			isTableInit = true;
			$(".help-article-table").off("click");
			$(".help-article-table").on("click",".hyperlink",e => {
				if (ha_datatTable) {
					var $articleModalBox = $("#help-article-view-modal");
					var $articleLabel = $articleModalBox.find(".article-switch > div");
					var $target= $(e.currentTarget);
					//$articleLabel.text($target.text());
					var row = ha_datatTable.row($target.closest("tr")).index();
					$articleModalBox.attr("data-id", $target.attr("data-id"));
					$articleModalBox.attr("data-index", row);
					var data = help_article_dataKeys[$target.attr("data-id")];
					
					$articleModalBox.find("#select-ha-application-field").val(data['App']);
					$articleModalBox.find("#select-ha-area-field").val(data['AppArea']);
					$articleModalBox.find("#select-ha-name-field").val(data['AppItem']);
					
					//create a copy and save to attributes for comparison if need to save or not
					$articleModalBox.find("#select-ha-application-field").attr("data-value",data['App']);
					$articleModalBox.find("#select-ha-area-field").attr("data-value",data['AppArea']);
					$articleModalBox.find("#select-ha-name-field").attr("data-value",data['AppItem']);
					
					var $editorBox = $articleModalBox.find(".contents-editor");
					$editorBox.summernote('destroy');
					
					//get the html
					$editorBox.html("");
					dataHelpArticleRead(data['App'],data['AppArea'],data['AppItem'],"").then(rs => {
						$editorBox.html(rs['HelpHtml']);
						$(".form-check-input-switch").bootstrapSwitch("disabled",false);
					});
					//$editorBox.html(data['HelpHtml']);
					//console.log(data, ha_datatTable.data(), $articleModalBox.find("#select-ha-name-field").val());
					$articleModalBox.modal();
					$articleModalBox.draggable({
						handle: ".modal-header"
					});
					$articleModalBox.css("z-index","1041");
					$(".modal-backdrop").addClass("first-modal");	
					
					//view-help-article-modal
					//$(".form-check-input-switch").bootstrapSwitch("destroy",true);
					$(".form-check-input-switch").bootstrapSwitch("state",true);
					var articleSwitch = $(".form-check-input-switch").bootstrapSwitch({});
					$(".form-check-input-switch").bootstrapSwitch("disabled",true);
					articleSwitch.on('switchChange.bootstrapSwitch', (event, state) => {
						var $articleModalBox = $("#help-article-view-modal");
						//var $editorBox = $articleModalBox.find(".contents-editor");
						if (state) { //view
							$editorBox.summernote('destroy');
						}
						else { //edit
							 $editorBox.summernote({
								height: 350,
								focus: true});
							 var $recentColorBtn = $editorBox.parent().find(".note-editor button").filter('[data-original-title="Recent Color"]');
							 $recentColorBtn.attr("data-backcolor","inherit");
							 $recentColorBtn.attr("data-forecolor","#636363");
							 $recentColorBtn.find("i").css("background-color", "inherit").css("color", "rgb(99, 99, 99)");
						}
					});
					$articleModalBox.find("button.accept").removeClass("btn-primary");
				}
			});
			
			refreshButton.removeClass("spin");
		});

	}
	
	fillUpHelpTable();
	
	
	$("#help-article-view-modal").on("click",".modal-content-input > a", e => {
		var $target= $(e.currentTarget);
		var $sourceInputBox =  $target.parent().find("input");
		var name = $target.data("modal-name");
		var $modalBox = $("#view-help-article-" + name + "-modal");
		var $destInputBox = $modalBox.find("input");
		$destInputBox.val($sourceInputBox.val());
		if ($target.data("modal-name") == 'area') {
			var application = $("#help-article-view-form-application-input > input").val();
			var list = area_list[application];
			//console.log(list, area_list, application);
			if (list) {
				$modalBox.find(".modal-body input").autocomplete({
					source: list,
					appendTo: "#view-help-article-" + name + "-modal"
				});							
			}
			else {
				$modalBox.find(".modal-body input").autocomplete("destroy");
			}
		}
		$modalBox.modal();
		$modalBox.attr("data-target","#help-article-view-form-" + name + "-input > input");
		$modalBox.draggable({
			handle: ".modal-header"
		});
		$(".modal-backdrop").not(".first-modal").css("z-index","1042");
	});
	
	$("#view-help-article-application-modal").find(".modal-body input").autocomplete({
		source: application_list,
		appendTo: name
	});
	
	//ok button on edit application / area / name
	$(".modals-mini").on("click",'.btn-primary', e => {
		var $modalBox = $(e.currentTarget).closest("div.modal");
		//var field = $modalBox.attr("data-field");
		var target = $modalBox.attr("data-target");
		if (target) {
			var $target = $(target);
			var $source = $modalBox.find("input.input");
			if ($target.val() != $source.val()) {
				var btn = $target.closest("div.modal").find("button.accept");
				btn.addClass("btn-primary");
			}
			$target.val($source.val());
		}
	});	
	
	//summer note change event
	$("#help-article-view-modal").on("summernote.change", $(".contents-editor").closest("div").find(".note-editable")[0], e => {
		var $modalBox = $("#help-article-view-modal");
		var btn = $modalBox.find("button.accept");
		if (!btn.hasClass("btn-primary")) {
			btn.addClass("btn-primary");
		}
		
	});
	
	//save button
	$("#help-article-view-modal").on("click",".btn-primary.accept", e => {
		//update the variable
		var $target = $(e.currentTarget);
		var $modalBox = $("#help-article-view-modal");
		var application = $modalBox.find("#select-ha-application-field").val();
		var applicationO = $modalBox.find("#select-ha-application-field").attr("data-value");
		var area = $modalBox.find("#select-ha-area-field").val();
		var areaO = $modalBox.find("#select-ha-area-field").attr("data-value");
		var name = $modalBox.find("#select-ha-name-field").val();
		var nameO = $modalBox.find("#select-ha-name-field").attr("data-value");
		var $editorBox = $modalBox.find(".contents-editor");
		$editorBox.summernote("destroy"); //to update the contents back to the textbox
		var content = $editorBox.html();
		var id = name + "|" + application + "|" + area;
		var item = help_article_dataKeys[id];
		var index = $modalBox.attr("data-index");
		if (item) {
			//item.Application = application;
			//item.Area = area;
			item["HelpHtml"] = content;
			item.deleted = false; //in case of renaming back the id
			if (area != areaO || name != nameO || application != applicationO){ //have to mark the old id from renamed id
				var tmp = nameO + "|" + applicationO + "|" + areaO;
				if (help_article_dataKeys[tmp]) {
					help_article_dataKeys[tmp].deleted = true;
					var promiseDataSave = dataHelpArticleUpdateDelete(item, help_article_dataKeys[tmp]);
				}
			}
			else {
				var promiseDataSave = dataHelpArticleUpdateDelete(item);
			}
		}
		else { //if name is changed, set the delete flag
			var oldName = $modalBox.attr("data-id");
			var oldItem = help_article_dataKeys[oldName];
			if (oldItem) { //just in case
				oldItem.deleted = true;
				var temp = $.extend(true,{},oldItem);
			}
			else {
				var temp = {};
			}
			//create a new item
			temp["AppItem"] = name;
			temp["AppArea"] = area;
			temp["App"] = application;
			temp["HelpHtml"] = content;
			temp.deleted = false;
			temp.recentAdd = true;
			help_article_dataKeys[id] = temp;
			item = temp;
			
			var promiseDataSave = dataHelpArticleUpdateDelete(item,oldItem);
			
		}

		promiseDataSave.then(rs => {
			//retrieve the current date
			var prRetrieve = dataHelpArticleRead(item.App,item.AppArea,item.AppItem);
			prRetrieve.then(rs => {
				if (ha_datatTable) {
					item["DateTimeLastChanged"] = rs.DateTimeLastChanged;
					item["UserIdLastChange"] = rs.UserIdLastChange;
					//help_article_dataKeys[id]["DateTimeLastChanged"] = rs.DateTimeLastChanged;
					//help_article_dataKeys[id]["UserIdLastChange"] = rs.UserIdLastChange;
					ha_datatTable.row(index).data(rs).draw(true);
				}								
			})
		});
		
		
		
		//$("#help-article-overview-save-btn").addClass("btn-primary");
		//console.log(help_article_dataKeys,item);
		//save to the server
	});
	
	$("#help-article-main-pg").on("click",".refresh", e => {
		fillUpHelpTable();
	});
	
    $('#help-article-main-pg').on("keyup", ".search input", e => {
    	if (ha_datatTable) {
    		ha_datatTable.search($(e.currentTarget).val()).draw();
    	}
    });
    
    //new article
    $('#help-article-main-pg').on("click", ".article-new > a > span", e=> {
    	var $modalBox = $("#help-article-new-modal");
    	var $editorBox = $modalBox.find(".contents-editor");
    	//clear contents
    	$modalBox.find("input").each((i,d) => {
    		$(d).val("");
    	});
    	$editorBox.summernote("destroy");
    	$editorBox.html("");
    	$editorBox.summernote({
			height: 350});
		var $recentColorBtn = $editorBox.parent().find(".note-editor button").filter('[data-original-title="Recent Color"]');
		$recentColorBtn.attr("data-backcolor","inherit");
		$recentColorBtn.attr("data-forecolor","#636363");
		$recentColorBtn.find("i").css("background-color", "inherit").css("color", "rgb(99, 99, 99)");    	
    	$modalBox.modal();
    	
    	var $appTextBox = $modalBox.find("#select-ha-application-field");
    	//console.log($appTextBox);
    	$appTextBox.autocomplete({
			source: application_list,
			appendTo: '#help-article-new-modal',
			select: (e, u) => {
				setTimeout(() => helpArticleNewAreaAutoComplete($appTextBox[0]),1);
			}
		});
		$modalBox.draggable({
			handle: ".modal-header"
		});    	
    	$modalBox.find("button.accept").removeClass("btn-primary");
    });
    
    //new article change text event
    $('#help-article-new-modal').on("keyup","input", e => {
    	var $modalBox = $("#help-article-new-modal");
    	var $app = $modalBox.find("#select-ha-application-field");
    	var $area = $modalBox.find("#select-ha-area-field");
    	var $name = $modalBox.find("#select-ha-name-field");
    	if ($app.val() && $area.val() && $name.val()) {
    		$modalBox.find("button.accept").addClass("btn-primary");
    	}
    	else {
    		$modalBox.find("button.accept").removeClass("btn-primary");
    	}
    })
    
    $('#help-article-new-modal').on("keyup", "#select-ha-application-field", e => {
    	helpArticleNewAreaAutoComplete(e.currentTarget);
    });
    
    //new article save
    $('#help-article-new-modal').on("click",".btn-primary.accept", e => { 
		var $modalBox = $("#help-article-new-modal");
		var application = $modalBox.find("#select-ha-application-field").val();
		var area = $modalBox.find("#select-ha-area-field").val();
		var name = $modalBox.find("#select-ha-name-field").val();
		var $editorBox = $modalBox.find(".contents-editor");
		var id = name + "|" + application + "|" + area;
		var item = help_article_dataKeys[id];	
		//console.log(id,item)
		if (item) {
			//send warning
			alert("Application, Area, and Name combination exists, please enter another.");
		}
		else { //if name is changed, set the delete flag
			refreshButton.addClass("spin");
			$editorBox.summernote("destroy"); //to update the contents back to the textbox
			var content = $editorBox.html();
			
			
			//pattern for new row, get the first item
			var tmpte = help_article_dataKeys[Object.keys(help_article_dataKeys)[0]];
			if (tmpte) { //just in case
				var temp = $.extend(true,{},tmpte);
			}
			else {
				var temp = {};
			}
			//create a new item
			temp["AppItem"] = name;
			temp["AppArea"] = area;
			temp["App"] = application;
			temp["HelpHtml"] = content;
			temp.deleted = false;
			temp.recentAdd = true;
			help_article_dataKeys[id] = temp;
			//item = temp;
			var itemNew = help_article_dataKeys[id];
			
			var promiseDataAdd = dataHelpArticleUpdateDelete(itemNew);
			promiseDataAdd.then(rs => {
				//retrieve the current date
				var prRetrieve = dataHelpArticleRead(itemNew.App,itemNew.AppArea,itemNew.AppItem);
				prRetrieve.then(rs => {
					if (ha_datatTable) {
						itemNew["DateTimeLastChanged"] = rs.DateTimeLastChanged;
						itemNew["UserIdLastChange"] = rs.UserIdLastChange;
						ha_datatTable.row.add(temp).draw(true);
						refreshButton.removeClass("spin");
					}								
				})
			});						
			$modalBox.modal('toggle');
		}
		//update the table
 	
    });
    
    //delete confirm (save)
    $("#delete-help-article-confirm").on("click",".accept.btn-primary", e => {
    	var $modalBox = $("#delete-help-article-confirm");
    	var id = $modalBox.attr("data-id");
    	var index = $modalBox.attr("data-index");
    	var data = help_article_dataKeys[id];
    	if (data) {
    		data.deleted = true;
    		
    		refreshButton.addClass("spin");
    		var promiseDataDelete = dataHelpArticleUpdateDelete(null,data);
    		
    		promiseDataDelete.then(rs => {
    			//retrieve the current date
				if (ha_datatTable) {
					ha_datatTable.row(index).remove().draw(true);
					refreshButton.removeClass("spin");
				}								
    		});    		
    	}
    	
    });
    
    //copy article change event
    $("#copy-help-article-modal").on("keyup","input", e => {
    	var $modalBox = $("#copy-help-article-modal");
    	var $app0 = $modalBox.find("#copy-ha-application-field0");
    	var $area0 = $modalBox.find("#copy-ha-area-field0");
    	var $name0 = $modalBox.find("#copy-ha-name-field0");
    	var $app = $modalBox.find("#copy-ha-application-field");
    	var $area = $modalBox.find("#copy-ha-area-field");
    	var $name = $modalBox.find("#copy-ha-name-field");
    	var same = ($app0.val() == $app.val() && $area0.val() == $area.val() && $name0.val() == $name.val()) ? true : false ;
    	var blank = ($app.val() == "" || $area.val() == "" || $name.val() == "") ? true : false;
    	if (same || blank) {
    		$modalBox.find("button.accept").removeClass("btn-primary");
    	}
    	else {
    		$modalBox.find("button.accept").addClass("btn-primary");
    	}
    });
    
    $("#copy-help-article-modal").on("keyup","#copy-ha-application-field", e => {
		helpArticleCopyAreaAutoComplete(e.currentTarget);
    });
    
    //copy article save event
    $("#copy-help-article-modal").on("click",".accept.btn-primary", e => {
		var $modalBox = $("#copy-help-article-modal");
		var application = $modalBox.find("#copy-ha-application-field").val();
		var area = $modalBox.find("#copy-ha-area-field").val();
		var name = $modalBox.find("#copy-ha-name-field").val();
    	var app0 = $modalBox.find("#copy-ha-application-field0").val();
    	var area0 = $modalBox.find("#copy-ha-area-field0").val();
    	var name0 = $modalBox.find("#copy-ha-name-field0").val();		
		var id = name + "|" + application + "|" + area;
		var item = help_article_dataKeys[id];	
		var passed = true;
		if (item) {
			if (!item.deleted) {
				passed = false;
				alert("Application, Area, and Name combination exists, please enter another.");
			}
		}
		if (passed) { //if name is changed, set the delete flag
			//pattern for new row, get the first item
			var tmpte = help_article_dataKeys[name0 + "|" + app0 + "|" + area0];
			if (tmpte) { //just in case
				var temp = $.extend(true,{},tmpte);
				//create a new item
				temp["AppItem"] = name;
				temp["AppArea"] = area;
				temp["App"] = application;
				temp.deleted = false;
				temp.recentAdd = true;
				help_article_dataKeys[id] = temp;
				
				var promiseDataCopy = dataHelpArticleCopyRename(tmpte, temp, "C");
				refreshButton.addClass("spin");
				promiseDataCopy.then(rs => {
					//retrieve the current date
					var prRetrieve = dataHelpArticleRead(temp.App,temp.AppArea,temp.AppItem);
					prRetrieve.then(rs => {
						if (ha_datatTable) {
							temp["DateTimeLastChanged"] = rs.DateTimeLastChanged;
							temp["UserIdLastChange"] = rs.UserIdLastChange;
							ha_datatTable.row.add(temp).draw(true);
							refreshButton.removeClass("spin");
						}								
					})
				});				
				$modalBox.modal('toggle');				
			}
		}
    })
    
    function helpArticleNewAreaAutoComplete(e) {
    	var $modalBox = $("#help-article-new-modal");
    	var $area = $modalBox.find("#select-ha-area-field");
    	var $app = $(e);
    	var list = area_list[$app.val()];
    	
    	if (list) {
    		$area.autocomplete({
    			source: list,
    			appendTo: '#help-article-new-modal'
    		})
    	}    
    	else {
    		if ($area.autocomplete()) {
    			$area.autocomplete("destroy");
    		}
    	}
    }
    
    function helpArticleCopyAreaAutoComplete(e) {
    	var $modalBox = $("#copy-help-article-modal");
    	var $area = $modalBox.find("#copy-ha-area-field");
    	var $app = $(e);
    	var list = area_list[$app.val()];
    	
    	if (list) {
    		$area.autocomplete({
    			source: list,
    			appendTo: '#copy-help-article-modal'
    		})
    	}    
    	else {
    		if ($area.autocomplete()) {
    			$area.autocomplete("destroy");
    		}
    	}
    }    
	
    function deleteArticleModal(e) {
		var $modalBox = $("#delete-help-article-confirm");
		var id = $(e).attr("data-id");
		var data = help_article_dataKeys[id];
		var row = ha_datatTable.row($(e).closest("tr")).index();
		var $message = $modalBox.find("#warning-intersection");
		$message.text("ARTICLE NAME = " + data["AppItem"] + ", APPLICATION = " + data["App"] + ", AREA = " + data["AppArea"]);
		$modalBox.attr("data-index", row); 
		$modalBox.attr("data-id",id);
		$modalBox.modal();
		$modalBox.draggable({
			handle: ".modal-header"
		});					
    }
    
    function copyArticleModal(e) {
		var $modalBox = $("#copy-help-article-modal");
		var $name0 = $modalBox.find("#copy-ha-name-field0"), $name = $modalBox.find("#copy-ha-name-field");
		var $app0 = $modalBox.find("#copy-ha-application-field0"), $app = $modalBox.find("#copy-ha-application-field");
		var $area0 = $modalBox.find("#copy-ha-area-field0"), $area = $modalBox.find("#copy-ha-area-field");
		var id = $(e).attr("data-id");
		var data = help_article_dataKeys[id];
		$modalBox.attr("data-id", id);
		
		if (data) {
			$name0.val(data["AppItem"]);
			$name.val(data["AppItem"]);
			$app0.val(data["App"]);
			$app.val(data["App"]);
			$area0.val(data["AppArea"]);
			$area.val(data["AppArea"]);
			$modalBox.find("button.accept").removeClass("btn-primary");
			$modalBox.modal();
			$modalBox.draggable({
				handle: ".modal-header"
			});			
			helpArticleCopyAreaAutoComplete($app[0])
			//application_list'
			$app.autocomplete({
				source: application_list,
				appendTo: "#copy-help-article-modal",
				select: (e, u) => {
					setTimeout(() => helpArticleCopyAreaAutoComplete($app[0]),1);
				}
			});
		}
		else {
			alert("No data exists");
		}
		    	
    }
    
});

function dataHelpArticleRead(app = '%',area = '%', item = '%', no_content = 'X') {
	var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarHelpR>
               <App>${app}</App>
               <AppArea>${area}</AppArea>
               <AppItem>${item}</AppItem>
               <NoHtmlContent>${no_content}</NoHtmlContent>
           </tns:ZdarHelpR>`;
    return new Promise((rs,rj) => {
    	try {
            function callBack(data) {
            	rs(data);
            }
            callWebService(url, request, 'ZdarHelpRResponse',true, callBack);        	        		
    	}
    	catch(err) {
    		rj(err);
    	}
    });
}

function dataHelpArticleUpdateDelete(data = null, dataDel = null) {
	var url = getConfig('zdar_calc_engine_bind');
	var request = `<tns:ZdarHelpW>`;
	
	if (data) {
		request += `<Tmodify>`;
		if (!Array.isArray(data)) {
			var dataR = [data];
		}
		else {
			var dataR = data;
		}
		dataR.forEach(d => {
			request += `<item><App>${d.App}</App>
            <AppArea>${d.AppArea}</AppArea>
            <AppItem>${d.AppItem}</AppItem>
            <HelpHtml>${escapeHTML(d.HelpHtml)}</HelpHtml></item>`;
		});
		request += `</Tmodify>`;
	}
	else {
		request += `<Tmodify></Tmodify>`;
	}
	if (dataDel) {
		request += `<Tdelete>`;
		if (!Array.isArray(dataDel)) {
			var dataDelR = [dataDel];
		}
		else {
			var dataDelR = dataDel;
		}
		dataDelR.forEach(d => {
			request += `<item><App>${d.App}</App>
            <AppArea>${d.AppArea}</AppArea>
            <AppItem>${d.AppItem}</AppItem>
            <HelpHtml>${escapeHTML(d.HelpHtml)}</HelpHtml></item>`;
		});
		request += `</Tdelete>`;			
	}
	else {
		request += `<Tdelete></Tdelete>`;
	}
		
	request += `</tns:ZdarHelpW>`;
	
	return new Promise((rs,rj) => {
		try {
			function callBack(cdata) {
				//recall the data service to return date created
				rs(true);
			}
			callWebService(url, request, 'ZdarHelpWResponse', true, callBack);
		}
		catch(err) {
			rj(err);
		}
	});
}

function dataHelpArticleCopyRename(data0, data1, action = 'R') {
	var url = getConfig('zdar_calc_engine_bind');
	var request = `<tns:ZdarHelpC>`;
	
	request += `<Action>${action}</Action>
		<Fromapp>${data0.App}</Fromapp>
        <Fromapparea>${data0.AppArea}</Fromapparea>
        <Fromappitem>${data0.AppItem}</Fromappitem>
        <Toapp>${data1.App}</Toapp>
        <Toapparea>${data1.AppArea}</Toapparea>
        <Toappitem>${data1.AppItem}</Toappitem>`;
	
	request += `</tns:ZdarHelpC>`;
	
	console.log(request);
	
	return new Promise((rs,rj) => {
		try {
			function callBack(cdata) {
				//recall the data service to return date created
				rs(true);
			}
			callWebService(url, request, 'ZdarHelpCResponse', true, callBack);
		}
		catch(err) {
			rj(err);
		}
	});
}	

function escapeHTML(text) {
    return text.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&apos;');
  };  
