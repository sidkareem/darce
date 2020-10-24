$(function() {
	
	var uploadOpt = -1;
	var dataUploadRaw, dataUpload;
	var bUploadFile = false, bUploadOption = false, bEnv = false;
	
    var $importSelBtn = $("#upl_dwnl_main_pg #select-model-btn");
    var $uploadBtn = $("#upl_dwnl_main_pg #upload-config");
	var uploadEnv = '';
	var selFileName = '';
	var uploadDate, uploadDateFin,uploadMessage, uploadLogFile, uploadUser;
	var selectedList;
	var uploadStatusResult;
	
    var xCalcGrpList, xCgDobjectsList, xEnv, xCgDobjectsSrch = {};
    var $uplValidateBtn = $("#upl_dwnl_main_pg #upload-val-btn");
    var validateMessage, validateLogFile;
	
    const separator = '-----------------------------------------------------------------------------------\r\n';
    
	var DropzoneUploader = function() { 
		
	    if (typeof Dropzone == 'undefined') {
	        console.warn('Warning - dropzone.min.js is not loaded.');
	        return;
	    }
	    	    	    
	    Dropzone.options.uploadDz = {
	            paramName: "file", // The name that will be used to transfer the file
	            //maxFilesize: 100, // MB
	            maxFiles: 1,
	            height: 100,
	            acceptedFiles: ".json",
	            dictDefaultMessage: 'Drop file to upload <span>or CLICK</span>',
	            autoProcessQueue: true,
	            init: function() {
	                this.on('addedfile', function(file){
	                    if (this.fileTracker) {
	                    	this.removeFile(this.fileTracker);
	                    }
	                    this.fileTracker = file;
	                    toggleButton($importSelBtn,false);
	                    bUploadFile = false;
	                    var pass = bUploadFile && bUploadOption && bEnv;
	                    if (!pass) {
	                    	toggleButton($uploadBtn,false);
	                    }                    
	                });
	            },
	            reject: event => {
	            	console.log("Reject"); 
		        	$('#ud_upload .upload-message').hide();
		        	$('#upload-validate-message .inv-json-message').show();
		        	toggleButton($importSelBtn,false);
		        	toggleButton($uplValidateBtn,false);
	            },
	            accept: function(done) {
	            	selFileName = done.name;
	            	var reader = new FileReader();
	            	var text = '';
	            	reader.readAsText(done);
	            	$('#upload-validate-message .upload-message').hide();
	            	$('#upload-validate-message .inv-json-message').hide();
	            	selectedList = null;
	            	reader.addEventListener('loadend', (e) => {
	            		  text = e.srcElement.result;
	            		  toggleButton($importSelBtn,true);
	            		  if (isJsonValid(text)) { //check if the json syntax is valid
		                      dataUploadRaw = JSON.parse(text);
		                      allCapsnAddFlags(dataUploadRaw);
		                      dataUpload = convertToTreeData(dataUploadRaw);
		                      bUploadFile = true;
		                      var pass = bUploadFile && bUploadOption && bEnv;
		                      toggleButton($uploadBtn,pass);
		                      toggleButton($uplValidateBtn,true);
	            		  }
	            		  else { //create an error
	            			  toggleButton($uploadBtn,false);
	            			  Dropzone.options.uploadDz.reject();
	            		  }
	            		});
	            	$importSelBtn.attr("data-init","1");
	            	$("#select-model-input").val("<ALL>");
	            	reader.addEventListener('error', (e) => {
	            		console.log('Error reading file.');
	          		});
	            },
	        };
	    return {
	        init: function() {
	            //_componentDropzone();
	        }
	    }    
	}();
	
	$(".upl-dwnl-main-section .styled").uniform();
	var dpz = $("div#upload_dz").dropzone({url:"/file/post"});
	DropzoneUploader.init();
	
	dpz.on("complete", file => {
		console.log("Upload complete");
	});
	
	var env_list = getLocalStorage('environment_list', false);
	var $env_select_u = $("#upl_dwnl_main_pg #upl-env-field");
	var $env_select_d = $("#upl_dwnl_main_pg #dwnl-env-field");
	var $env_select = $("#upl_dwnl_main_pg .env-field");
	var bfancyTreeInit = false;
	
	var currentEnv = getLocalStorage('CURRENT_ENVIRONMENT', false);
	var $searchBox = $("#upl_dwnl_main_pg .modal-section .search-box");	
	
	//dimension list
	env_list.forEach((item,i) => {
		var selected = item.Environment == currentEnv ? 'selected' : '';
		$env_select_d.append(`<option value=${item.Environment} ${selected}>${item.Environment}</option>`);
		if (item.Useraccess.toUpperCase() == 'DARCE_RW') {
			//$env_select_u.append($('<option>',{value: item.Environment, 
			//	 text: item.Environment}));
			$env_select_u.append(`<option value=${item.Environment} ${selected}>${item.Environment}</option>`);
		}
	});
	
	//environment dropdown select
	
	$env_select_d.select2({
		tags: true,
		maximumInputLength: 20
	}).on("select2:select", d => {
		var $target = $(d.currentTarget);
		var $button = $("#upl_dwnl_main_pg #download-config");
		if ($target.val()){
			toggleButton($button,true);
		}
		else {
			toggleButton($button,false);
		}
	});
	
	toggleButton($("#upl_dwnl_main_pg #download-config"),true);
	bEnv = true;
	
	//$env_select_u.val(null);
	$env_select_u.select2({
		maximumInputLength: 20
	}).on("select2:select", d => {
		var $target = $(d.currentTarget);
		var $button = $("#upl_dwnl_main_pg #upload-config"); 
		bEnv = $target.val() ? true : false;
		var pass = bUploadFile && bUploadOption && bEnv;
		if ($target.val() && pass){
			toggleButton($button,true);
		}
		else {
			toggleButton($button,false);
		}
		uploadEnv = $target.val();
	});
	uploadEnv = $env_select_u.val();
	
	//model selector modal form
	var $treeBox = $("#upl-sel-model-ftree");
	var storeSelected = [];
	$("#select-model-btn").on("click", e => {
		if (!($(e.currentTarget).hasClass('btn-default-grey'))) {
			$("#selection-model-modal").modal();
			
			$searchBox.attr('data-search',"0")  //clear the search
			$searchBox.find("input").val(null);
			$searchBox.find(".button.search-close").css("display","none");
			
			if (dataUpload) {
	    		if (bfancyTreeInit){
	    			$treeBox.fancytree("destroy");
	    		}
	    		
	    		generateFancyTree({
	    			element: $treeBox,
	    			data: dataUpload
	    		});
	    		
	    		//check if fancy tree content is initially changed
	    		var $importSelBtn = $("#upl_dwnl_main_pg #select-model-btn");
	    		if ($importSelBtn.attr("data-init") == "1") {
	    			$importSelBtn.attr("data-init","0");
	    			var tree = $treeBox.fancytree("getTree");
	    			//var node = tree.getNodeByKey("0"); //set the All Models as default
	    			
	    			tree.visit(node => {
	    				node.setSelected(true);
	    			});
	    			selectedList = tree.getSelectedNodes();
	    		}
	    		else {
	    			var tree = $treeBox.fancytree("getTree");
	    			if (selectedList) {
	    				selectedList.forEach(selected => {
	    					var node = tree.getNodeByKey(selected.key);
	    					if (node) {
	    						node.setSelected(true);
	    					}
	    				});
	    			}
	    		}
	    		
	    		// ID / Desc dropdown
	    		var treeDataList = convertHierToList(dataUpload,'children'); //used for mapping to replace id / desc
	    		var $idDestDropDown = $("#selection-model-modal .id-desc-dropdown");
	    		var view = 'desc';
	    		$idDestDropDown.val(view);
	    		
	    		if (!bfancyTreeInit) {
		    		$idDestDropDown.select2({
		    			theme: "id-desc",
		    			minimumResultsForSearch: Infinity,
		    		}).on("select2:select", d => {
		    			if (d.params) {
		    				if (d.params.data) {
		    					if (d.params.data.id) {
		    						view = d.params.data.id;
		    						var tree2 = $treeBox.fancytree("getTree");
		    						treeDataList.forEach(e => {
		    	    					var node  = tree2.getNodeByKey(e.key.toString());
		    	    					if (node) {
		    	    						switch (d.params.data.id){
		    	    						case 'id':
		    	    							node.setTitle(e.id.toString());
		    	    							break;
		    	    						case 'desc':
		    	    							node.setTitle(e.title.toString());
		    	    							break;
		    	    						default:
		    	    							node.setTitle(e.id.toString() + " - " + e.title.toString());
		    	    						}
		    	    					}
		    	    				}); 
	    	    					flagNewCGFancyTree();
		    					}
		    				}
		    			}
		    		});	    			
	    		}
	
	    		bfancyTreeInit = true;
			}			
		}
	});

	//apply button click event
	$("#selection-model-modal").on("click","button.btn-primary", e => {
		
		if ($searchBox.attr('data-search') == '1'){ //if it is in search mode, clear the search first
			$searchBox.find("button.search-close").click();
		}
		
    	var $destBox = $("#upl_dwnl_main_pg #select-model-input");
    	var selected = $treeBox.fancytree("getTree").getSelectedNodes();
    	selectedList = selected;
    	//var selectedFinal = [];
    	var skipId = {};
    	var count = 0;
    	if (selected) {
    		if (selected.length) {
	    		var text = '';
	    		
		    	selected.forEach(item => { //do not include children on the list if parent is selected
		    		if (item.children) {
		    			item.children.forEach(ch => {
		    				skipId[ch.data.id] = true;
		    			});
		    		}
		    	});
		    	
		    	selected.forEach(item => {
		    		if (!skipId[item.data.id]) {
		    			//selectedFinal.push(item);
		    			text += "," + item.data.id;
		    			count++;
		    		}
		    	});
		    	
		    	if (count <= 5) {
			    	if (text) {
			    		text = text.substr(1);
			    	}				    		
		    	}
		    	else {
		    		text = count.toString() + ' SELECTED';
		    	}
		    	$destBox.val(text);
		    	bUploadFile = true;
    		}
    		else {
    			$destBox.val('<EMPTY>');
    			bUploadFile = false;
    		}

    	}
    	else {
    	}
        var pass = bUploadFile && bUploadOption && bEnv;
        toggleButton($uploadBtn,pass);
    });	    		
	
	//search box
	$searchBox.find("input").val("");
	var $closeButton = $searchBox.find("button.search-close");
	$closeButton.css("display","none");
	var filterNodes, selectedNodes;
	var searchTBoxClear = true;
	
	$searchBox.on("click","button.search-find", e => {
		
    	var $textbox = $searchBox.find("input");		
		var value = $textbox.val();
		if ($searchBox.attr('data-search') == '1'){
			searchTBoxClear = false;
			$searchBox.find("button.search-close").click();
			searchTBoxClear = true;
		}
		
		var treeDataList = convertHierToList(dataUpload,'children'); //used for mapping to replace id / desc
    	var treeBox = $treeBox.fancytree("getTree");
    	var view = $("#selection-model-modal .id-desc-dropdown").val();
    	
    	//var selected = treeBox.getSelectedNodes();
    	selectedNodes = treeBox.getSelectedNodes();
    	
    	if (value) {
	    	var searchResults = []; 
	    	treeDataList.forEach(d => {
	    		//d.title = idDescText(d[idCol])
    	    	switch (view) {
		    	case "id":
		    		if (d['id'].search(new RegExp(value, "i"))>=0) {
		    			searchResults.push(d);
		    		}
		    		break;
		    	case "desc":
		    		if (d['title'].search(new RegExp(value, "i"))>=0) {
		    			searchResults.push(d);
		    		}			    		
		    		break;
		    	case "id - desc":
		    		var searchText = d.id + " - " + d.title;
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
	    	
	    	$treeBox.fancytree("destroy");
			generateFancyTree({
				element: $treeBox,
				data: searchResults});
			$closeButton.css("display","inline");
    	}
    	else {
    		/*$treeBox.fancytree("destroy");
			generateFancyTree({
				element: $treeBox,
				data: dataUpload});
			$closeButton.css("display","none");*/
    		$searchBox.find("button.search-close").click();
    	}
    	
		treeDataList.forEach(e => {
			var node  = $treeBox.fancytree("getTree").getNodeByKey(e.key.toString());
			if (node) {
				switch (view){
				case 'id':
					node.setTitle(e.id.toString());
					break;
				case 'desc':
					node.setTitle(e.title.toString());
					break;
				default:
					node.setTitle(e.id.toString() + " - " + e.title.toString());
				}
			}
		}); 					
    	
		filterNodes = []; //collect the filtered nodes
		if (searchResults) {
			searchResults.forEach(du => {
				var node = treeBox.getNodeByKey(du.key);
				filterNodes.push(node);
			});			
		}
		
    	if (selectedNodes) {
    		treeBox = $treeBox.fancytree("getTree");
    		selectedNodes.forEach(s => {
				var node = treeBox.getNodeByKey(s.key);
				if (node) {
					node.setSelected(true);
				}
			});
			
    	}
    	
    	$searchBox.attr('data-search','1');
    	
    });
	
	$searchBox.on("keypress", "input", d => {
    	var keycode = (d.keyCode ? d.keyCode : d.which);
    	if (keycode == '13') { //enter key
    		$searchBox.find("button.search-find").click();
    	}
    });
	
	$searchBox.on("click","button.search-close", e => {
		var $textbox = $searchBox.find("input");
		var treeBox = $treeBox.fancytree("getTree");
    	var selected = treeBox.getSelectedNodes();
    	$treeBox.fancytree("destroy");
    	
		generateFancyTree({
			element: $treeBox,
			data: dataUpload});
		
		//reset first before activate
		treeBox = $treeBox.fancytree("getTree");
		
		if (selectedNodes) { //set back the selected nodes outside the filter
			selectedNodes.forEach(s => {
				var node = treeBox.getNodeByKey(s.key);
				if (node) {
					node.setSelected(true);
				}
			});
		}
		
		var pELst = {};
		if (filterNodes) { //reset the nodes in the filter
			filterNodes.forEach(s => {
				var node = treeBox.getNodeByKey(s.key);
				if (node) {
					node.setSelected(false);
				}
				//create a dependence map with flag
				if (s.children) {
					pELst[s.key] = {};
				}
				else {
					
				}
			});
			
			//on the dependence flag map, check the children and set the flag
			filterNodes.forEach(s => {
				if (!s.children) {
					if (pELst[s.parent.key]) {
						pELst[s.parent.key][s.key] = false;
						if (selected) {
							for (var i = 0; i < selected.length; i++) {
								if (s.key == selected[i].key) {
									pELst[s.parent.key][s.key] = true;
									break;
								}
							}
						}
					}
				}
			});
		}
		
		//collect the parent and children
		var selectedParent = [], selectedChild = [];
		if (selected) {
			selected.forEach(s => {
				if (s.folder == "true") {
					selectedParent.push(s);
				}
				else {
					selectedChild.push(s);
				}
			});
		}
		if (selectedChild) {
			selectedChild.forEach(s => {
				var node = treeBox.getNodeByKey(s.key);
				if (node) {
					node.setSelected(true);
				}
			})
		}
		if (selectedParent) {
			selectedParent.forEach(s => {
				var flag = true;
				if (pELst[s.key]) {
					for (var key in pELst[s.key]) {
						if (pELst[s.key].hasOwnProperty(key)) {
							flag = flag && pELst[s.key][key];
						}
					}
				}
				var node = treeBox.getNodeByKey(s.key);
				if (node) {
					node.setSelected(flag);
				}
			})

		}
		
		if (searchTBoxClear) {
	    	$textbox.val(null);
			$(e.currentTarget).css("display","none");			
		}
		$searchBox.attr('data-search','0');
		//$(modalBox[0][0]).attr("data-filtered",false);
    });   
	
	//download button click	
	$("#upl_dwnl_main_pg div #download-config").on("click", d => {
		var $target = $(d.currentTarget);
		var env = $env_select_d.val();
		
		var downloadResponseCB = (res) => {
			var fileName = 'default';
			var jsonTables = xmlToJson(res)["soap-env:Envelope"]["soap-env:Body"]["n0:ZdarConfigDownloadResponse"];
			if (jsonTables["@attributes"]) {
				delete jsonTables["@attributes"];
			}
			console.log(jsonTables);
			var date = new Date();
			if (env) {
				fileName = env + '_' + date.getFullYear().toString() + 
										(date.getMonth()+1).toString().padStart(2,'0') + 
										date.getDate().toString().padStart(2,'0') +
										date.getHours().toString().padStart(2,'0') +
										date.getMinutes().toString().padStart(2,'0') +
										date.getSeconds().toString().padStart(2, '0');
			}
			//fileName += '.xml';
			//download(fileName,new XMLSerializer().serializeToString(xmlTables));
			fileName += '.json';
			download(fileName,JSON.stringify(jsonTables));
		};

		if ($target.hasClass('btn-primary')) {
			//var download_url = 'zdar_config_download_svc/100/zdar_config_download_svcn/zdar_config_download_bind'; 
			var download_url = getConfig('zdar_calc_engine_bind');
			var request = `<tns:ZdarConfigDownload>
                            	<Env>${env}</Env>
	        	                <Model>%</Model>
	        	                <Table></Table>	   
						</tns:ZdarConfigDownload>`;
			
		    request = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="urn:sap-com:document:sap:soap:functions:mc-style">
	                <soap:Header/>
	                <soap:Body>
	                `+request+`
	                </soap:Body>
	              </soap:Envelope>`;			
			//callWebService(download_url, request, 'ZdarConfigDownloadResponse',true, downloadResponseCB);
			genericAjaxXMLPostSyncSpc(getURL(download_url), request, 'ZdarConfigDownloadResponse', downloadResponseCB);
		}
	});	
		
	/*$("#upl_dwnl_main_pg div #upload-config").on("click", d => {
		var $target = $(d.currentTarget);
		if ($target.hasClass('btn-primary')) {
		}
	});*/
	
	//option button event
	$("#upl_dwnl_main_pg #upload-options input[type=radio]").on("change", e => {
		var $target = $(e.currentTarget);
		if ($target.parent().hasClass('checked')) {
			bUploadOption = true;
			uploadOpt = $target.val();
			if (uploadOpt == 1) {				
				var $prefix = $('#upload-prefix-field');
				bUploadOption = $prefix.val().length > 0 ? true : false;
			}
			var pass = bUploadFile && bUploadOption && bEnv;
        	toggleButton($uploadBtn,pass);
		}
	});
	
	//option prefix input box
	$('#upload-prefix-field').on('keyup', e => {
		var $target = $(e.currentTarget);
		if (uploadOpt == 1) {
			bUploadOption = $target.val().length > 0 ? true : false;
			var pass = bUploadFile && bUploadOption && bEnv;
        	toggleButton($uploadBtn,pass);			
		}
	});
	
	//upload button
	$uploadBtn.on("click", e => {
		var $target = $(e.currentTarget);
		if ($target.hasClass('btn-primary')) {
			confirmDeletionDialog(`<span class="text-red">Warning: This action cannot be reverted!</span>
						<p>Are you sure you want to import <i>${selFileName}</i> into <b>${uploadEnv}</b>?</p>`, 
					() => {
						$('#ud_upload .upload-message').hide();
		    			if (dataUploadRaw) {
		    				//loader('show');
		    				uploadDate = new Date();
		    				var url = getConfig('zdar_calc_engine_bind');
		    				var action = '';
		    				//uploadStatusResult = uploadValidation(dataUploadRaw);
		    				loadDObjects().then((response) => { //we don't need the response because the data is stored as global variable
			    				var dataUploadFiltered = filterItems(dataUploadRaw, uploadOpt == '2');
			    				//uploadStatusResult = uploadValidation(dataUploadFiltered, true);
			    				uploadValidation(dataUploadFiltered, true).then(response => {
			    					uploadStatusResult = response;
				    				if (uploadStatusResult.status != 'F'){
					    				switch (uploadOpt) {
					    				case '0':
					    					action = 'O';
					    					var xmlText = jsonToXml(dataUploadFiltered);
					    					//var xmlText = jsonToXml(dataUploadRaw);
					    					break;
					    				case '1':
					    					action = 'O';
					    					var $prefix = $('#upload-prefix-field');
					    					if ($prefix.val()) {
					    						var prefix = $prefix.val(); 
					    					}
					    					else {
					    						var prefix = "NEW_";
					    					}
					    					var xmlText = jsonToXml(addPrefix(dataUploadFiltered,prefix));
					    					break;					
					    				case '2':
					    					action = 'F';
					    					var xmlText = jsonToXml(dataUploadFiltered);
					    					//var xmlText = jsonToXml(dataUploadRaw);
					    				}
					    				var env = uploadEnv;
					    				if (env && action) {
					    					console.log("uploading");
					    				    var request = `<tns:ZdarConfigUpload>
					    			               <Action>${action}</Action>
					    			               <Env>${env}</Env>
					    				    		${xmlText}
					    			           </tns:ZdarConfigUpload>`;
					    				    try {
						    		            callWebService(url, request, 'ZdarConfigUploadResponse',true,callBackUpload);
						    		            loader('show');
						    				    //callBackUpload('Success');			    		 		    	
					    				    }
					    				    catch (e) {
					    				    	uploadMessage = 'Failed\r\n' + separator + 'Details:\r\n' + e.message;
					    				    	createUploadLog(uploadMessage);
					    			        	$('#ud_upload .upload-message').hide();
					    			        	$('#upload-error-message .error-message').show();				    				    	
					    				    }
					    				}		    					
				    				}
				    				else {
				    			        loader('hide');
				    			        uploadDateFin = new Date();		    					
				    			        uploadMessage = 'Failed\r\n' + separator + 'Details:\r\n' + uploadStatusResult.errorMessage;
				    			        createUploadLog(uploadMessage);	
				    			        $('#ud_upload .upload-message').hide();
				    		        	$('#upload-error-message .error-message').show();		    			        
				    				}
			    				});		    					
		    				});

		    				
		    			};						
					}, '', 'Confirm import action');
		}
	});
	
	//upload message download
	$("#upl_dwnl_main_pg #upload-error-message a").on("click", e => {
		if (uploadLogFile) {
			createUploadLog(uploadMessage,false);
		}
		
	});
	
	$uplValidateBtn.on("click", e => {
		var $target = $(e.currentTarget);
		if ($target.hasClass('btn-primary')) { 
			loadDObjects().then((response) => { 
				var dataUploadFiltered = filterItems(dataUploadRaw,false);
				//uploadStatusResult = uploadValidation(dataUploadFiltered);
				uploadValidation(dataUploadFiltered).then(response => {
					uploadStatusResult = response;
					$('#ud_upload .upload-message').hide();
					switch (uploadStatusResult.status) {
					case 'F':
						$('#upload-validate-message .error-message').show();
						validateMessage = 'Failed\r\n' + separator + 'Details:\r\n' + uploadStatusResult.errorMessage;
						createValidationLog(validateMessage);	
						break;
					case 'W':
						$('#upload-validate-message .warning-message').show();
						validateMessage = 'Warnings\r\n' + separator + 'Details:\r\n' + uploadStatusResult.warningMessage;
						createValidationLog(validateMessage);
						break;
					default:
						$('#upload-validate-message .success-message').show();
					}
				});				
			});
		}
	});
	
	$("#upl_dwnl_main_pg #upload-validate-message a").on("click", e => {
		if (validateLogFile) {
			createValidationLog(validateMessage,false);
		}
		
	});	
	
	function callBackUpload(e) {
		loader('hide');
		
        if (e.substr(0,7) == 'Success') {
        	$('#ud_upload .upload-message').hide();
            var tmp = e.toString().replace(/[|]/g,'\r\n');
            var tmp2 = e.toString().split('|');
            uploadMessage = tmp2[0] + '\r\n' + separator + 'Details:' + tmp.substr(8);        	
        	if (uploadStatusResult.status != 'W') {
        		$('#upload-error-message .success-message').show();
        	}
        	else {
        		$('#upload-error-message .warning-message').show();
        		uploadMessage += '\r\n' + uploadStatusResult.warningMessage;
        	}
        }
        else {
        	$('#ud_upload .upload-message').hide();
        	$('#upload-error-message .error-message').show();
        	uploadMessage = "Failed\r\n' + separator + 'Details:\r\nThere was a problem running web service." 
        }
        uploadDateFin = new Date();
        xEnv = ''; //to refresh the new flags in calg group selector
        createUploadLog(uploadMessage);
        
	}
	
	function uploadValidation(json, pisUpload) {
		var isUpload = pisUpload ? true : false;
		var ret = {};
		var errors = [];
    	var warnings = [];
    	var tableList = ['TzdarCalcGrp','TzdarCgDobjects','TzdarCgVars','TzdarCalcDrv','TzdarCalcDtl','TzdarCalcHdr','TzdarCgCalcs','TzdarDobjects'];
    	var tableListName = ['ZDAR_CALC_GRP','ZDAR_CG_DOBJECTS','ZDAR_CG_VARS','ZDAR_CALC_DRV','ZDAR_CALC_DTL','ZDAR_CALC_HDR','ZDAR_CG_CALCS','ZDAR_DOBJECTS'];
    	var idNameList = [['CalcGroupId','PrimaryDobjectId'],
    						['CalcGroupId','DobjectId'],
    						['CalcGroupId','VariableId'],
    						['CalcId','DriverId'],
    						['CalcId','StepId'],
    						['CalcId'],
    						['CalcGroupId','CalcId'],
    						['DobjectId']];
    	var idDuplList =  [['CalcGroupId'],
							['CalcGroupId','DobjectId'],
							['CalcGroupId','VariableId'],
							['CalcId','DriverId'],
							['CalcId','StepId'],
							['CalcId'],
							['CalcGroupId','CalcId','CalcInstance'],
							['DobjectId']];
    	var idPrimary = [['Environment','CalcGroupId','PrimaryDobjectId'],
			['Environment','CalcGroupId','DobjectId'],
			['Environment','CalcGroupId','VariableId'],
			['Environment','CalcId','DriverId'],
			['Environment','CalcId','StepId'],
			['Environment','CalcId'],
			['Environment','CalcGroupId','CalcId'],
			['Environment','DobjectId']];    	
    	var tableReqdList = ['TzdarCalcGrp','TzdarCgDobjects','TzdarDobjects'];
    	var dobjectID = {}, calcgroupID = {}, calcID = {}; //used to check which are orphan
    	var dobjectIDAuto = [], dobjectIDFI = {};
    	
    	function errorMsgCmps(index, item) {
    		var errorMsgTmp2 = '';
    		idPrimary[index].forEach(idp => {
    			if (item[idp]) {
    				errorMsgTmp2 += ', ' + idp + ' = ' + item[idp];
    			}
    		});
    		if (errorMsgTmp2.length) {
    			errorMsgTmp2 = errorMsgTmp2.substr(2);
    		}
    		return errorMsgTmp2;
    	}
    	
    	tableList.forEach((table,ti) => {
    		var tableN = tableListName[ti];
    		if (json[table]) {
    			if (json[table].item.length) {
    				var items = json[table].item;
    			}
    			else {
    				var items = [json[table].item];
    			}
        		var duplList = {}, duplListEnv = {};
        		var duplListErr = {}, duplListEnvErr = {};
    			items.forEach((item,ii) => {
    				idNameList[ti].forEach(idCol => {
    					var testId = item[idCol]; 
    					if (testId) {
    						if (testId.length > 32) {//32 characters checking
    							errors.push(idCol + ' ' + testId + ' exceeds 32 characters at ' + errorMsgCmps(ti,item) + ' in table ' + tableN + ' item #' + ii +'.');
    						}
    						if (!isNaN(testId.substr(0,1))) {//first character is a number
    							//errors.push('Invalid id ' + testId + ' at ' + table + '.' + idCol + ' item ' + ii);
    							errors.push('Invalid ' + idCol + ' ' + testId + ' at ' + errorMsgCmps(ti,item) + ' in table ' + tableN + ' item #' + ii + ', the first character must be non-numeric.');
    						}
    						if (testId.search(/[!@#$%^&*(),?":{}|<>\[\]\\\/']/g) > 0){
    							//errors.push('Invalid special character at ' + table + '.' + idCol + ' item ' + ii);
    							errors.push(idCol + ' ' + testId + ' contains special characters at ' + errorMsgCmps(ti,item) + ' in table ' + tableN + ' item #' + ii +'.');
    						}
    						
    						switch (table) { //store ids for later use
    						case 'TzdarCalcGrp':
    							calcgroupID[testId] = true;
    							break;
    						case 'TzdarCalcHdr':
    							calcID[testId] = true;
    							break;
    						case 'TzdarDobjects':
    							if (!item.__forceInsert) {
        							dobjectID[testId] = true;   								
    							}
    							else{
    								dobjectIDFI[testId] = true;
    							}
    							if (item.__autoAdd) {
    								dobjectIDAuto.push([item.__autoAdd,testId,item.Environment])
    							}
    							break;
    						}
    					}
    					else { //missing id
							errors.push('Null ' + idCol + ' at ' + errorMsgCmps(ti,item) + ' in table ' + tableN + ' item #' + ii + '.');
    						//errors.push('Missing id at ' + table + '.' + idCol + ' item ' + ii);
    					}
    					
    				});
    				if (idDuplList[ti].length) {
    					var testCmb = '';
    					var msgtmp = '', count = 0;
    					
        				idDuplList[ti].forEach(idCol => {
        					testCmb += item[idCol] + ',';
        					msgtmp += ', ' + idCol + ' = ' + item[idCol];
        					//count++;
        				});
        				if (msgtmp.length) {
        					msgtmp = msgtmp.substr(2);
        				}
    					if (!duplList[testCmb]) {
    						duplList[testCmb] = [];
    						duplListErr[testCmb] = [];
    					}
    					
    					duplList[testCmb].push(item);
    					var errMsg = '';
						if (count > 1) {
							errMsg = 'Duplicate id combination ' + msgtmp + ' at Environment = ' + item.Environment + ' table ' + tableN + ' item #' + ii + '.';
						}
						else {
							errMsg = 'Duplicate id ' + msgtmp + ' at Environment = ' + item.Environment + ' table ' + tableN + ' item #' + ii + '.';
						}
    					duplListErr[testCmb].push(errMsg);
    					
    					var combChk = item.Environment + "|" + testCmb;
    					if (!duplListEnv[combChk]) {
    						duplListEnv[combChk] = [];
    						duplListEnvErr[combChk] = [];
    					}
    					
    					duplListEnv[combChk].push(item);
						if (count > 1) {
							errMsg = 'Duplicate id / env combination Environment = ' + item.Environment + ' ' + msgtmp + ' at ' + tableN + ' item #' + ii + '.';
						}
						else {
							errMsg = 'Duplicate id / env Environment = ' + item.Environment + ' ' + msgtmp + ' at ' + tableN + ' item #' + ii + '.';
						}       						
						duplListEnvErr[combChk].push(errMsg);
    					
    				}
    			});
				if (duplList) {
					for (var id in duplList) {
						if (duplList[id].length > 1) {
							duplList[id].forEach((itemx,i) => {
								warnings.push(duplListErr[id][i]);
							})
						}
					}
				}
				
				if (duplListEnv) {
					for (var id in duplListEnv) {
						if (duplListEnv[id].length > 1) {
							duplListEnv[id].forEach((itemx,i) => {
								errors.push(duplListEnvErr[id][i]);
							})
						}
					}
				}        			    			
    		}
    		else {
    			var flagz = false;
    			for (var iz = 0; iz < tableReqdList.length; iz++) {
    				if (table == tableReqdList[iz]) {
    					flagz = true;
    				}
    			}
    			if (flagz) {
    				errors.push('Missing ' + table);
    			}
    			else {
    				warnings.push('Missing ' + table);
    			}
    			
    		}
    	});
    	
    	
    	//diplay datasources that are added for calc group
    	if (dobjectIDAuto.length) {
    		dobjectIDAuto.forEach(dob => {
    			//console.log(dob)
    			warnings.push('Data source ' + dob[1] + ' is used by the CalcGroupId ' + dob[0] + ' in Environment ' + dob[2] + _
    					(pisUpload? ', the data source is automatically included': '') + '.');
    		});
    	}
    	
    	//check for orphan
    	var idNameOpList = [['PrimaryDobjectId'],
    						['CalcGroupId'],
    						['CalcGroupId'],
    						['CalcId'],
    						['CalcId'],
    						[],
    						['CalcGroupId'],
    						[]];
    	var idLabel4OpList = [['CalcGroupId'],
			['DobjectId'],
			['VariableId'],
			['DriverId'],
			['StepId'],
			['CalcId'],
			['CalcId'],
			['DobjectId']];
    	
    	//orphan datasource in calc group flag as error
    	if (json['TzdarCalcGrp']) {
    		if (json['TzdarCalcGrp'].item.length) {
    			var items = json['TzdarCalcGrp'].item;
    		}
    		else {
    			var items = [json['TzdarCalcGrp'].item];
    		}
    		items.forEach((item,i) => {
    			if (!dobjectID[item.PrimaryDobjectId]) {
    				errors.push('Orphan data source ' + item.PrimaryDobjectId + ' at Environment = ' + item.Environment + ', CalcGroupId = ' + item.CalcGroupId + ' at ZDAR_CALC_GRP item ' + i +'.');
    			}
    		})
    	}
    	
    	var prefixMsg = isUpload ? 'Not imported! ' : '';

    	tableList.forEach((table,ti) => {
    		if (json[table]) {
        		if (idNameOpList[ti].length) {
            		if (json[table].item.length) {
            			var items = json[table].item;
            		}
            		else {
            			var items = [json[table].item];
            		}

        			items.forEach((item,ii) => {
        				idNameOpList[ti].forEach(idCol => {
        					switch (idCol) {
        					case 'PrimaryDobjectId','DobjectId':
        						if (!dobjectID[item[idCol]]) {
        							//warnings.push('DobjectID ' + item[idCol] + ' of ' + table + ' item ' + ii + ' was not in the TzdarDobjects list');
        							warnings.push(prefixMsg + idLabel4OpList[ti] + ' ' + item[idLabel4OpList[ti]] + ' (item ' + ii + ') in ' + tableListName[ti] +
        								' table was detected with orphaned DObjectID ' + item[idCol] + '.');
        						}
        						break;
        					case 'CalcGroupId':
        						if (!calcgroupID[item[idCol]]) {
        							//warnings.push('CalcGroupID ' + item[idCol] + ' of ' + table + ' item ' + ii + ' was not in the TzdarCalcGrp list');
        							warnings.push(prefixMsg + idLabel4OpList[ti] + ' ' + item[idLabel4OpList[ti]] + ' (item ' + ii + ') in ' + tableListName[ti] +
            								' table was detected with orphaned CalcGroupID ' + item[idCol] + '.');
        						}            						
        						break;
        					case 'CalcId':
        						if (!calcID[item[idCol]]) {
        							//warnings.push('CalcID ' + item[idCol] + ' of ' + table + ' item ' + ii + ' was not in the TzdarCalcHdr list');
        							warnings.push(prefixMsg + idLabel4OpList[ti] + ' ' + item[idLabel4OpList[ti]] + ' (item ' + ii + ') in ' + tableListName[ti] +
            								' table was detected with orphaned CalcID ' + item[idCol] + '.');        							
        						}            						            						
        					}
        				});
        			});
    			
        		}    			
    		};
    	});
    	
    	//orphan datasource from ZDAR_CG_DOBJECTS
    	//retrieve the selected env's datasources  	
    	
    	var env = uploadEnv;
    	var needToDobj = false;
    	
    	return new Promise((response, reject) => {
        	if (env) {
        		if (xEnv != env) {
        			needToDobj = true;
        			xEnv = env;
        		}
        		if (!xCgDobjectsList) {
        			needToDobj = true;
        		}    		
        		if (needToDobj) {
        			// run webservices
        			var url = getConfig('zdar_calc_engine_bind');
        			var request = `<tns:ZdarDobjectsR>
    					<Dobjectid>%</Dobjectid>
    					<DateTimeLastChanged></DateTimeLastChanged>
    					<Env>${env}</Env>
    					<Page></Page>
    					<Status>%</Status>
    				</tns:ZdarDobjectsR>`;    			
        			var promiseDo = new Promise((res,rej) => {
        				try {
            				callWebService(url,request,'ZdarDobjectsRResponse',true,
            						(data) => {
            							xCgDobjectsList = data;
            							res(data);
            						})    					
        				}
        				catch (e) {
        					rej(e);
        				}
        			});    			
        		}
        		else {
        			var promiseDo = new Promise((res,rej) => {
        				res(xCgDobjectsList);
        			})
        		}
        		promiseDo.then(res => {
        			var resDobj = {};
        			if (Array.isArray(res)) {
        				var resx = res;
        			}
        			else {
        				var resx = [res];
        			}
        			resx.forEach(item => {
        				resDobj[item.DobjectId] = true;
        			});
                	if (json['TzdarCgDobjects']) {
                		if (json['TzdarCgDobjects'].item.length) {
                			var items = json['TzdarCgDobjects'].item;
                		}
                		else {
                			var items = [json['TzdarCgDobjects'].item];
                		}
                		items.forEach((item,i) => {
                			if (!dobjectID[item.DobjectId]) {
                				//warnings.push('Orphan data source ' + item.DobjectId + ' at Environment = ' + item.Environment + ', CalcGroupId = ' + item.CalcGroupId + ' at ZDAR_CG_DOBJECTS item ' + i);
                				if (resDobj[item.DobjectId]) {
                					if (!pisUpload) {
                    					warnings.push('CalcGroupID ' + item.CalcGroupId + ' > ' + item.DobjectId + " data source is not selected / found in the source upload file but does exist in the target environment.");
                					}
                					else {
                						if (dobjectIDFI[item.DobjectId]) {
                							warnings.push(item.DobjectId + " data source is re-added from the target environment for the CalcGroupID " + item.CalcGroupId + '.');
                						}
                					}
                				}
                				else  {
                					errors.push('CalcGroupID ' + item.CalcGroupId + ' > ' + item.DobjectId + " data source is neither selected / found in the source upload file nor existing in the target environment.");
                				}
                			}
                		})   		
                	}  
                	setReturn();
                	response(ret);
        		});
        		 		
        	}
        	else {
            	if (json['TzdarCgDobjects']) {
            		if (json['TzdarCgDobjects'].item.length) {
            			var items = json['TzdarCgDobjects'].item;
            		}
            		else {
            			var items = [json['TzdarCgDobjects'].item];
            		}
            		items.forEach((item,i) => {
            			if (!dobjectID[item.DobjectId]) {
            				//warnings.push('Orphan data source ' + item.DobjectId + ' at Environment = ' + item.Environment + ', CalcGroupId = ' + item.CalcGroupId + ' at ZDAR_CG_DOBJECTS item ' + i);
            				warnings.push(item.CalcGroupId + ' primary key ID ' + item.DobjectId + ' data source is not selected / found in the source upload file');
            			}
            		})   		
            	}   
            	setReturn();
            	response(ret);
        	}    		
    	})
    	
    	
    	function setReturn() {
    		ret.errors = errors;
    		ret.errorMessage = errors.length ? errors.join('\r\n') : 'No errors found.';
    		ret.warnings = warnings;
    		ret.warningMessage = warnings.length ? warnings.join('\r\n') : 'No warnings.';
    		ret.status = errors.length ? 'F' : (warnings.length ? 'W' : 'P');
    	}
    			
	}
	
	function allCapsnAddFlags(json) {
    	var tableList = ['TzdarCalcGrp','TzdarCgDobjects','TzdarCgVars','TzdarCalcDrv','TzdarCalcDtl','TzdarCalcHdr','TzdarCgCalcs','TzdarDobjects'];
    	/*var idNameList = [['CalcGroupId','PrimaryDobjectId'],
    						['CalcGroupId','DobjectId'],
    						['CalcGroupId','VariableId'],
    						['CalcId','DriverId'],
    						['CalcId','StepId'],
    						['CalcId'],
    						['CalcGroupId','CalcId'],
    						['DobjectId']];*/
    	var idNameList = [['CalcGroupId'],
			['CalcGroupId'],
			['CalcGroupId','VariableId'],
			['CalcId','DriverId'],
			['CalcId','StepId'],
			['CalcId'],
			['CalcGroupId','CalcId'],
			[]];
    	tableList.forEach((table,ti) => {
    		if (json[table]) { 
    			var items = json[table].item;
        		if (items.length > 0) {
        			items.forEach((item,ii) => {
        				idNameList[ti].forEach(idCol => { 
        					var testId = item[idCol]; 
        					if (testId) {
        						item[idCol] = testId.toUpperCase();
        					}
        				});
        				//add include flag
        				item.__included = 'true';
        			});
        		};
    		};
    	});
	}
	
	function filterItems(json, puplDODest) {
    	var tableList = ['TzdarCalcGrp','TzdarCgDobjects','TzdarCgVars','TzdarCalcDrv','TzdarCalcDtl','TzdarCalcHdr','TzdarCgCalcs','TzdarDobjects'];
    	var jsonCopy = $.extend(true,{},json);
    	var model = {}, cg = {}, una = {}; // model - <env>:<model>, cg - <env>:<cg>
    	var uplDODest = puplDODest ? true: false;
    	//construct the selected list in object for faster search
    	//console.log(selectedList,jsonCopy,'selectedList')
    	if (selectedList) { //goes to the Import selection
        	selectedList.forEach(s => {
        		var env = s.data.Environment;
        		switch (s.data.tbl) {
        		case 'TzdarDobjects':
        			if (!model[env]) {
        				model[env] = {};
        			}
        			model[env][s.data.DobjectId] = true;
        			break;
        		case 'TzdarCalcGrp':
        			if (!cg[env]) {
        				cg[env] = {};
        			}
        			if (!model[env]) {
        				model[env] = {};
        			}
        			var mod = s.data.PrimaryDobjectId;
        			model[env][mod] = true;
        			cg[env][s.data.CalcGroupId] = true;
        			break;
        		case '<unassign>':
        			if (!una[env]) {
        				una[env] = {};
        			}
        			if (!model[env]) {
        				model[env] = {};
        			}
        			model[env][s.data.parent] = true;
        			if (s.data.CalcId) {
        				s.data.CalcId.forEach(sd => {
        					una[env][sd] = true;
        				});
        			}
        		}
        	});
        	
    		//filter TzdarDobjects    	
        	if (jsonCopy['TzdarDobjects']) {
        		if (jsonCopy['TzdarDobjects']['item']){
        			if (jsonCopy['TzdarDobjects']['item'].length) {
            			jsonCopy['TzdarDobjects']['item'].forEach(item => { //reset the flag
            				item.__included = 'false';
            			});
            			
            			jsonCopy['TzdarDobjects']['item'].forEach(item => {
            				if (model[item.Environment]) {
                				if (model[item.Environment][item.DobjectId]) {
                					item.__included = 'true';
                				}        					
            				}
            			});        				
        			}
        			else {
        				var item = jsonCopy['TzdarDobjects']['item']; 
        				item.__included = 'false';
        				if (model[item.Environment]) {
            				if (model[item.Environment][item.DobjectId]) {
            					item.__included = 'true';
            				}        					
        				}        				
        			}		
        		}
        	};
        	
        	//filter TzdarCalcGrp and dependents
        	var tableTmpList = ['TzdarCalcGrp','TzdarCgDobjects','TzdarCgVars'];
        	var cg_dsource = {};
        	
        	tableTmpList.forEach(tbl => {
            	if (jsonCopy[tbl]) {
            		if (jsonCopy[tbl]['item']){
	            		if (Array.isArray(jsonCopy[tbl]['item'])){
	            			jsonCopy[tbl]['item'].forEach(item => { //reset the flag
	            				item.__included = 'false';
	            			});
	            			
	            			jsonCopy[tbl]['item'].forEach(item => {
	            				if (cg[item.Environment]) {
	                				if (cg[item.Environment][item.CalcGroupId]) {
	                					item.__included = 'true';
	                					//include the data source selected by cg dobjects
	                					if (tbl == 'TzdarCgDobjects') {
	                						if (!cg_dsource[item.Environment]) {
	                							cg_dsource[item.Environment] = {};
	                						}
	                						if (model[item.Environment]) {
	                							//console.log(item.DobjectId,model[item.Environment][item.DobjectId],'dobjectid');
	                							if (!model[item.Environment][item.DobjectId]) {
	                								//console.log(item.DobjectId,'pass')
	                								cg_dsource[item.Environment][item.DobjectId] = item.CalcGroupId;
	                							}
	                							else {
	                								//console.log(item.DobjectId,'pass2');
	                							}
	                						}
	                						else {
	                							cg_dsource[item.Environment][item.DobjectId] = item.CalcGroupId;
	                						}
	                						
	                					}
	                				}    					    						
	            				}
	            			});	    			
	            		}
	            		else {
	            			var item = jsonCopy[tbl]['item'];
	            			item.__included = 'false';
            				if (cg[item.Environment]) {
                				if (cg[item.Environment][item.CalcGroupId]) {
                					item.__included = 'true';
                					//include the data source selected by cg dobjects
                					if (tbl == 'TzdarCgDobjects') {
                						if (!cg_dsource[item.Environment]) {
                							cg_dsource[item.Environment] = {};
                						}
                						if (model[item.Environment]) {
                							//console.log(item.DobjectId,model[item.Environment][item.DobjectId],'dobjectid');
                							if (!model[item.Environment][item.DobjectId]) {
                								//console.log(item.DobjectId,'pass')
                								cg_dsource[item.Environment][item.DobjectId] = item.CalcGroupId;
                							}
                							else {
                								//console.log(item.DobjectId,'pass2');
                							}
                						}
                						else {
                							cg_dsource[item.Environment][item.DobjectId] = item.CalcGroupId;
                						}
                						
                					}
                				}    					    						
            				}
	            		}
	            	}
            	};    	    		
        	});
        	
        	//console.log(cg_dsource,model,'cg_dsource');
        	
        	//include data source not included but used like cg_dobject's data source
        	if (jsonCopy['TzdarDobjects']) {
        		if (jsonCopy['TzdarDobjects']['item']){
        			if (jsonCopy['TzdarDobjects']['item'].length) {
            			jsonCopy['TzdarDobjects']['item'].forEach(item => {
            				if (cg_dsource[item.Environment]) {
                				if (cg_dsource[item.Environment][item.DobjectId]) {
                					item.__included = 'true';
                					item.__autoAdd = cg_dsource[item.Environment][item.DobjectId];
                					cg_dsource[item.Environment][item.DobjectId] = 'ok';
                				}        					
            				}
            			});        				
        			}
        			else {
        				var item = jsonCopy['TzdarDobjects']['item']; 
        				if (cg_dsource[item.Environment]) {
            				if (cg_dsource[item.Environment][item.DobjectId]) {
            					item.__included = 'true';
            					item.__autoAdd = cg_dsource[item.Environment][item.DobjectId];
            					cg_dsource[item.Environment][item.DobjectId] = 'ok';
            				}        					
        				}        				
        			}		
        		}
        	};       	
        	

        	//filter TzdarCgCalcs and dependents
        	var cgcalc = {};
        	if (jsonCopy['TzdarCgCalcs']) {
        		if (jsonCopy['TzdarCgCalcs']['item']){
        			if (jsonCopy['TzdarCgCalcs']['item'].length){ 
	        			jsonCopy['TzdarCgCalcs']['item'].forEach(item => { //reset the flag
	        				item.__included = 'false';
	        			});
	        			
	        			jsonCopy['TzdarCgCalcs']['item'].forEach(item => {
	        				if (cg[item.Environment]) {
	            				if (cg[item.Environment][item.CalcGroupId]) {
	            					item.__included = 'true';
	            					
	            					if (!cgcalc[item.Environment]){
	            						cgcalc[item.Environment] = {};
	            					}
	            					cgcalc[item.Environment][item.CalcId] = true;
	            					
	            				}    					    						
	        				}
	        			});        				
        			}
        			else {
        				var item = jsonCopy['TzdarCgCalcs']['item'];
        				item.__included = 'false';
        				if (cg[item.Environment]) {
            				if (cg[item.Environment][item.CalcGroupId]) {
            					item.__included = 'true';
            					
            					if (!cgcalc[item.Environment]){
            						cgcalc[item.Environment] = {};
            					}
            					cgcalc[item.Environment][item.CalcId] = true;
            					
            				}    					    						
        				}
        			}
        		}
        	};

        	var tableTmpList = ['TzdarCalcDrv','TzdarCalcDtl','TzdarCalcHdr'];
        	
        	tableTmpList.forEach(tbl => {
            	if (jsonCopy[tbl]) {
            		if (jsonCopy[tbl]['item']){
            			if (jsonCopy[tbl]['item'].length) {
                			jsonCopy[tbl]['item'].forEach(item => { //reset the flag
                				item.__included = 'false';
                			});
                			
                			jsonCopy[tbl]['item'].forEach(item => {
                				if (cgcalc[item.Environment]) {
                    				if (cgcalc[item.Environment][item.CalcId]) {
                    					item.__included = 'true';
                    				} 
                    				if (una[item.Environment]) {
                        				if (una[item.Environment][item.CalcId]) {
                        					item.__included = 'true';
                        				}                					
                    				}
                				}
                			});            				
            			}
            			else {
            				var item = jsonCopy[tbl]['item'];
            				item.__included = 'false';
            				if (cgcalc[item.Environment]) {
                				if (cgcalc[item.Environment][item.CalcId]) {
                					item.__included = 'true';
                				} 
                				if (una[item.Environment]) {
                    				if (una[item.Environment][item.CalcId]) {
                    					item.__included = 'true';
                    				}                					
                				}
            				}
            			}		
            		}
            		
            	};    	    		
        	}); 
        	
        	//add data source on CG_DObject
        	
  	    		
    	}
    	
    	//process the filter
    	tableList.forEach((table,ti) => {
    		if (json[table]) { 
    			var items = json[table].item;
        		if (items.length > 0) {
        			items.forEach((item,ii) => {
        				if (item.hasOwnProperty('__included')) {
        					
        					if (jsonCopy[table]['item'][ii].__included == 'false') {
        						delete jsonCopy[table]['item'][ii];
        					}
        					else {
        						delete jsonCopy[table]['item'][ii].__included;
        					}
        				}
        			});
        		};
    		};
    	});
    	
    	//insert the datasource from the destination if required
    	//check if there is missing datasource used
    	if (jsonCopy['TzdarDobjects']) {
    		//console.log(uplDODest,'uplDODest');
        	if (uplDODest) {
            	var flag = false;
            	for (var envx in cg_dsource) {
            		for (var dsox in cg_dsource[envx]) {
            			if (cg_dsource[envx][dsox] == 'ok') {
            				delete cg_dsource[envx][dsox];
            			}
            			else {
            				flag = true;
            			}
            		}
            	}
            	if (flag) {
            		if (xCgDobjectsList) {
            			xCgDobjectsList.forEach(dobj => {
            				if (cg_dsource[dobj.Environment][dobj.DobjectId]) {
            					var dobjCopy = $.extend(true,{},dobj);
            					dobjCopy.__forceInsert = 'true';
            					jsonCopy['TzdarDobjects'].item.push(dobjCopy);
            				}
            			});
            		}	
            	}            	        		
        	}     		
    	} 
    	return jsonCopy;
	}	
	
    //set up fancy tree parameters
    function generateFancyTree(arg) {
    	var $element = arg.element;
    	var data = arg.data;
        $element.fancytree({   	
        	quicksearch: true,
        	source: data,
        	checkbox: true,
        	selectMode: 3,
        	init: (e,data) => {
       		
        	},
        	expand: function(e, data){
        		//check if the expanding node is model
        		var model = data.node.data.DobjectId;
        		var orphan = data.node.data.orphan;
        		if (model) {
        			if (xCgDobjectsList) {
        				var $modelNode = $treeBox.find('span[data-model="' + model + '"]');
        				if (!$modelNode.attr("data-aexpand")) {
        					$modelNode.attr("data-aexpand","true");
        					var children = data.node.children;
        					var childrenNodes = $modelNode.siblings("ul").children();
        					if (children) {
        						children.forEach((child,index) => {
        							if (xCgDobjectsSrch[child.data.CalcGroupId]) {
        								$(childrenNodes[index]).children("span.fancytree-node").attr("data-cg-exists","true");
        							}
        						});
        					}
        					$modelNode.siblings("ul").find("span.icon-folder").parent().attr("data-cg-exists","true"); //unassigned
        					$modelNode.siblings("ul").find("span.fancytree-node:not([data-cg-exists])").append(`<span class="fancy-flag fancy-flag-new label">New</span>`);
        				}
        			}
        		}
        		else if (orphan) {
        			
        		}
        		else { //expand by env
        			flagNewCGFancyTree();
        		}
              }        	
        });
        
        flagNewCGFancyTree();

    	//add data-id on fancytree element for faster search
        var $modelNodes = $element.find("li");
        $modelNodes.each((i,node) => {
        	var key = $(node).children(".fancytree-node").children("span.fancytree-title").text();
        	var type = $(node).children(".fancytree-node").children("span.fancytree-custom-icon");

        	
        	if (type.hasClass("tree-model")) {
        		$(node).children().attr("data-model",key);
        	}
        	
        });
    }
    
    function genericAjaxXMLPostSyncSpc(url, data, responseHead, callback) {
        var result;
        $.ajax({
            url: url,
            type: 'POST',
            contentType: 'text/xml',
            data: data,
            dataType: 'xml',
            async: true,
            xhrFields: {
                withCredentials: true
            },
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            success: (response) => {
                if(callback){
                    callback(response);
                }
                else{
                    result = response;
                }
            },
            error: (jqXHR, textStatus, errorThrown) => {
                result = jqXHR.responseText;
                if(url.indexOf('_c_') != -1 || url.indexOf('_w_') != -1){
                    alert("Data was not saved successfully. Please try again, and report to your tech support if you continue to experience issues saving data");
                }
                if(url.indexOf('_script_logic_execute_') != -1 ){
                    alert("The web service call cannot reach the server. Please check your network connectivity and try again. If this issue continues to happen, please contact your technical support team for further assistance.");
                    loader('hide');
                }
                if(data.indexOf('ZdarAuditLogR') != -1 ){
                    alert("Warning! Data could not be retrieved at the criteria selection. Please try again and report to your support team if this issue continues.");
                    loader('hide');
                }
            }
        });
    }
    
    function escCharXml(text) {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");    	
    }
        
    function download(filename, text) {
	  	  var element = document.createElement('a');
	  	  element.download = filename;
	  	  var bb = new Blob([text], {type: 'text/plain'});
	  	  element.setAttribute('href', window.URL.createObjectURL(bb));
	  	  element.dataset.downloadurl = ['text/plain', element.download, element.href].join(':');
	  	  element.style.display = 'none';
	  	  document.body.appendChild(element);
	
	  	  element.click();
	
	  	  document.body.removeChild(element);
  	}      

    function convertToTreeData(data) {
    	var ret = [];
    	var models = {}, tree = {}; //tree has format {<env>: {<model>: {<calcgrp>: <calcinfo>}}}

    	//collect the environment / model
    	if (data['TzdarDobjects']['item']) {
    		if (data['TzdarDobjects']['item'].length) {
    			var zdarobj = data['TzdarDobjects']['item']; 
    		}
    		else {
    			var zdarobj = [data['TzdarDobjects']['item']];
    		}
    		//data['TzdarDobjects']['item'].forEach((item,i) => {
    		zdarobj.forEach((item,i) => {
    			var env = item.Environment;
    			if (env) {
    				if (!tree[env]) {
    					tree[env] = {};
    				}
    				tree[env][item.DobjectId] = [];
    				
    				var tmp = {};
    				tmp.id = item.DobjectId; tmp.folder = 'true'; tmp.icon = 'icon-cube3 tree-model';
    				tmp.key = item.DobjectId; tmp.parent = env; tmp.title = item.DobjectId;
    				tmp.tbl = 'TzdarDobjects';
    				//tmp.item = {TzdarDobjects: i};
    				tmp.data = item;
    				
    				if (!models[env]) {
    					models[env] = {};
    				}
    				models[env][item.DobjectId] = tmp;
    			}
    		});
    	}

    	

    	if (data['TzdarCalcGrp']['item']) {   		
    		if (data['TzdarCalcGrp']['item'].length) {
    			var tzdarcg = data['TzdarCalcGrp']['item'];
    		}
    		else {
    			var tzdarcg = [data['TzdarCalcGrp']['item']];
    		}
 	    	//collect all the calc groups and separate by model
    		tzdarcg.forEach((item,i) => {
    			var model = item.PrimaryDobjectId;
    			var env = item.Environment;    			
    			if (model && env) {
    				var tmp = {};
    				tmp.id = item.CalcGroupId; tmp.folder = 'false'; tmp.icon = 'icon-tree6 tree-cg';
    				tmp.key = item.CalcGroupId; tmp.parent = model; tmp.title = item.CalcGroupId;
    				tmp.tbl = 'TzdarCalcGrp';
    				tmp.data = item;      				
    				if (tree[env]){  					
    					if (tree[env][model]) {
    	    				tree[env][model].push(tmp);  						
    					}
    					else { //orphan model
    						if (!tree[env].hasOwnProperty("*" + model)) {
    							tree[env]["*" + model] = [];
    						}
    						tree[env]["*" + model].push(tmp);
    					}
    				}
    				else{ //no env/model combination
    					var envX = "*" + env;
    					if (!tree.hasOwnProperty(envX)) {
    						tree[envX] = {};
    					}
    					if (!tree[envX][model]) {
    						tree[envX][model] = [];
    					}
    					tree[envX][model].push(tmp);
    				}
    			}
    		});
    	}
    	
    	//check for unassigns
    	var cgCalc = {};
    	if (data['TzdarCgCalcs']['item']) {
    		if (data['TzdarCgCalcs']['item'].length) {
    			var tzdarcgc = data['TzdarCgCalcs']['item'];
    		}
    		else {
    			var tzdarcgc = [data['TzdarCgCalcs']['item']];
    		}    		
    		tzdarcgc.forEach((item,i) => {
    			var env = item.Environment;
    			if (!cgCalc[env]) {
    				cgCalc[env] = {};
    			}
    			cgCalc[env][item.CalcId] = true;
    		});
    	};
    	
    	var modUnasgn = {};
    	if (data['TzdarCalcHdr']['item']){
    		if (data['TzdarCalcHdr']['item'].length) {
    			var tzdarchd = data['TzdarCalcHdr']['item'];
    		}
    		else {
    			var tzdarchd = [data['TzdarCalcHdr']['item']];
    		}    		
    		tzdarchd.forEach((item,i) => {
    			var env = item.Environment;
    			if (!cgCalc[env][item.CalcId]) {
    				if (!modUnasgn[env]) {
    					modUnasgn[env] = {}
    				}
    				if (!modUnasgn[env][item.SourceId]){
    					modUnasgn[env][item.SourceId] = [];
    				}
    				modUnasgn[env][item.SourceId].push(item.CalcId); //store the models has unassigned calc groups
    			}
    		});   		
    	};
    	
    	var unassign = {
    		id: 'unassigned', folder: 'false', icon: 'icon-folder',
    		key: '', parent: '', title: 'unassigned', tbl: '<unassign>'
    	};
    	
    	var firstEnv = true;
    	for (var envkey in tree) {
    		if (tree.hasOwnProperty(envkey)) {
    			var etree = tree[envkey];
    			var retM = [];
    			for (var modelkey in etree) {
    				if (etree.hasOwnProperty(modelkey)) {

    					if (models[envkey]) {
    						if (models[envkey][modelkey]) {
    							var tmp = models[envkey][modelkey];
    							tmp.children = etree[modelkey];
    							if (modUnasgn[envkey]) {
        							if (modUnasgn[envkey][modelkey]) {
        								var uTmp = $.extend(true,{},unassign);
        								uTmp.key = envkey + '.' + modelkey + '.unassigned';
        								uTmp.CalcId = modUnasgn[envkey][modelkey];
        								uTmp.parent = modelkey;
        								uTmp.Environment = envkey;
        								tmp.children.push(uTmp);
        							}    								
    							}
    							retM.push(tmp);
    						}
    						else { //orphan models
    							var tmp = {};
    							var modelT = modelkey.substr(1); //remove asterisk
    							tmp.id = modelT; tmp.folder = 'true'; tmp.icon = 'icon-cube3 orphan';
    							tmp.key = modelT; tmp.parent = envkey; tmp.title = modelT;
    							tmp.children = etree[modelkey];
    							tmp.orphan = true;
    							retM.push(tmp);    							
    						}
    					}
    					else { //no environment
    						
    					}
    				}
    				
    			}
        		var tmp2 = {};
    			tmp2.id = envkey; tmp2.folder = 'true'; tmp2.icon = 'icon-database';
    			tmp2.key = "0" + envkey; tmp2.expanded = firstEnv; tmp2.parent = "";
    			tmp2.title = envkey; tmp2.children = retM;
    			ret.push(tmp2);
    			firstEnv = false;
    		}
    	}
    	
    	return ret;
    }
    
    function addPrefix(json,pf) {
    	var ret = {};
    	//var tableList = ['TzdarCalcGrp','TzdarCgDobjects','TzdarCgVars','TzdarCalcDrv','TzdarCalcDtl','TzdarCalcHdr','TzdarCgCalcs'];
    	//var idNameList = ['CalcGroupId','CalcGroupId'];
    	var calcGrpMap = {}, calcGrpDCount = {};
    	//create a deep copy
    	$.extend(true,ret,json);
    	
    	//calc groups
    	if (ret['TzdarCalcGrp']['item']) {
        	if (ret['TzdarCalcGrp']['item'].length) {
        		ret['TzdarCalcGrp']['item'].forEach(item => {
        			var length = item['CalcGroupId'].length;
        			var cgO = item['CalcGroupId'];
        			if ((length + pf.length) > 32) {
        				var cgTmp = (pf + cgO).substr(0,32 - 3);
        				if (calcGrpDCount[cgTmp]) { //collect the count
        					calcGrpDCount[cgTmp]++;
        				}
        				else {
        					calcGrpDCount[cgTmp] = 1;
        				}
        				cgN = cgTmp + '_' + calcGrpDCount[cgTmp].toString().padStart(2,'0');
        			}
        			else {
        				cgN = pf + cgO; 
        			}
        			
        			item['CalcGroupId'] = cgN;
        			calcGrpMap[cgO] = cgN; 
        		});
        	}
        	else {
        		var item = ret['TzdarCalcGrp']['item'];
    			var length = item['CalcGroupId'].length;
    			var cgO = item['CalcGroupId'];
    			if ((length + pf.length) > 32) {
    				var cgTmp = (pf + cgO).substr(0,32 - 3);
    				if (calcGrpDCount[cgTmp]) { //collect the count
    					calcGrpDCount[cgTmp]++;
    				}
    				else {
    					calcGrpDCount[cgTmp] = 1;
    				}
    				cgN = cgTmp + '_' + calcGrpDCount[cgTmp].toString().padStart(2,'0');
    			}
    			else {
    				cgN = pf + cgO; 
    			}
    			
    			item['CalcGroupId'] = cgN;
    			calcGrpMap[cgO] = cgN;         		
        	}
    	}
    	
    	//dobject
    	if (ret['TzdarCgDobjects']['item']) {
        	if (ret['TzdarCgDobjects']['item'].length) {
        		ret['TzdarCgDobjects']['item'].forEach(item => {
        			var cg = item['CalcGroupId'];
        			if (calcGrpMap[cg]) {
        				item['CalcGroupId'] = calcGrpMap[cg];
        			}
        		});
        	}
        	else {
        		var item = ret['TzdarCgDobjects']['item'];
    			var cg = item['CalcGroupId'];
    			if (calcGrpMap[cg]) {
    				item['CalcGroupId'] = calcGrpMap[cg];
    			}        		
        	}
        		
    	}
	
    	//cg vars
    	if (ret['TzdarCgVars']['item']) {
        	if (ret['TzdarCgVars']['item'].length) {
        		ret['TzdarCgVars']['item'].forEach(item => {
        			var cg = item['CalcGroupId'];
        			if (calcGrpMap[cg]) {
        				item['CalcGroupId'] = calcGrpMap[cg];
        			}
        		});
        	}
        	else {
        		var item = ret['TzdarCgVars']['item'];
    			var cg = item['CalcGroupId'];
    			if (calcGrpMap[cg]) {
    				item['CalcGroupId'] = calcGrpMap[cg];
    			}        		
        	}
    	}
    	
    	//cg calcs
    	var calcHMap = {}, calcHDCount = {};
    	if (ret['TzdarCgCalcs']['item']) {
        	if (ret['TzdarCgCalcs']['item'].length) {
        		ret['TzdarCgCalcs']['item'].forEach(item => {
        			var cg = item['CalcGroupId'];
        			item['CalcGroupId'] = calcGrpMap[cg];

        			var length = item['CalcId'].length;
        			var cgO = item['CalcId'];
        			if (!calcHMap[cgO]) {
            			if ((length + pf.length) > 32) {
            				var cgTmp = (pf + cgO).substr(0,32 - 3);
            				if (calcHDCount[cgTmp]) { //collect the count
            					calcHDCount[cgTmp]++;
            				}
            				else {
            					calcHDCount[cgTmp] = 1;
            				}
            				cgN = cgTmp + '_' + calcHDCount[cgTmp].toString().padStart(2,'0');
            			}
            			else {
            				cgN = pf + cgO; 
            			}
            			calcHMap[cgO] = cgN;
        			}
        			else {
        				cgN = calcHMap[cgO];
        			}
        			
        			item['CalcId'] = cgN;
        			
        		});
        	}   
        	else {
        		var item = ret['TzdarCgCalcs']['item'];
    			var cg = item['CalcGroupId'];
    			item['CalcGroupId'] = calcGrpMap[cg];

    			var length = item['CalcId'].length;
    			var cgO = item['CalcId'];
    			if (!calcHMap[cgO]) {
        			if ((length + pf.length) > 32) {
        				var cgTmp = (pf + cgO).substr(0,32 - 3);
        				if (calcHDCount[cgTmp]) { //collect the count
        					calcHDCount[cgTmp]++;
        				}
        				else {
        					calcHDCount[cgTmp] = 1;
        				}
        				cgN = cgTmp + '_' + calcHDCount[cgTmp].toString().padStart(2,'0');
        			}
        			else {
        				cgN = pf + cgO; 
        			}
        			calcHMap[cgO] = cgN;
    			}
    			else {
    				cgN = calcHMap[cgO];
    			}
    			
    			item['CalcId'] = cgN;
        	}
    	}
    	
    	//calc header
    	if (ret['TzdarCalcHdr']['item']) {
        	if (ret['TzdarCalcHdr']['item'].length) {
        		ret['TzdarCalcHdr']['item'].forEach(item => {
        			var cg = item['CalcId'];
        			if (calcHMap[cg]){
        				item['CalcId'] = calcHMap[cg];
        			}
        			else { //orphan data
        				var length = item['CalcId'].length;
        				var cgO = item['CalcId'];
            			if (!calcHMap[cgO]) {
                			if ((length + pf.length) > 32) {
                				var cgTmp = (pf + cgO).substr(0,32 - 3);
                				if (calcHDCount[cgTmp]) { //collect the count
                					calcHDCount[cgTmp]++;
                				}
                				else {
                					calcHDCount[cgTmp] = 1;
                				}
                				cgN = cgTmp + '_' + calcHDCount[cgTmp].toString().padStart(2,'0');
                			}
                			else {
                				cgN = pf + cgO; 
                			}
                			calcHMap[cgO] = cgN;
            			}
            			item['CalcId'] = cgN;
        			}
        		});
        	}
        	else {
        		var item = ret['TzdarCalcHdr']['item'];
    			var cg = item['CalcId'];
    			if (calcHMap[cg]){
    				item['CalcId'] = calcHMap[cg];
    			}
    			else { //orphan data
    				var length = item['CalcId'].length;
    				var cgO = item['CalcId'];
        			if (!calcHMap[cgO]) {
            			if ((length + pf.length) > 32) {
            				var cgTmp = (pf + cgO).substr(0,32 - 3);
            				if (calcHDCount[cgTmp]) { //collect the count
            					calcHDCount[cgTmp]++;
            				}
            				else {
            					calcHDCount[cgTmp] = 1;
            				}
            				cgN = cgTmp + '_' + calcHDCount[cgTmp].toString().padStart(2,'0');
            			}
            			else {
            				cgN = pf + cgO; 
            			}
            			calcHMap[cgO] = cgN;
        			}
        			item['CalcId'] = cgN;
    			}
        	}
    	}
    	
    	//calc driver
    	//var calcDrvMap = {}, calcDrvDCount = {};
    	if (ret['TzdarCalcDrv']['item']) {
        	if (ret['TzdarCalcDrv']['item'].length) {
        		ret['TzdarCalcDrv']['item'].forEach(item => {
        			var cg = item['CalcId'];
        			
        			if (calcHMap[cg]){
        				item['CalcId'] = calcHMap[cg];
        			}
        			else { //orphan data
        				var length = item['CalcId'].length;
        				var cgO = item['CalcId'];
            			if (!calcHMap[cgO]) {
                			if ((length + pf.length) > 32) {
                				var cgTmp = (pf + cgO).substr(0,32 - 3);
                				if (calcHDCount[cgTmp]) { //collect the count
                					calcHDCount[cgTmp]++;
                				}
                				else {
                					calcHDCount[cgTmp] = 1;
                				}
                				cgN = cgTmp + '_' + calcHDCount[cgTmp].toString().padStart(2,'0');
                			}
                			else {
                				cgN = pf + cgO; 
                			}
                			calcHMap[cgO] = cgN;
            			}
            			item['CalcId'] = cgN;
        			}
        		
        		});
        	}  
        	else {
        		var item = ret['TzdarCalcDrv']['item'];
    			var cg = item['CalcId'];
    			
    			if (calcHMap[cg]){
    				item['CalcId'] = calcHMap[cg];
    			}
    			else { //orphan data
    				var length = item['CalcId'].length;
    				var cgO = item['CalcId'];
        			if (!calcHMap[cgO]) {
            			if ((length + pf.length) > 32) {
            				var cgTmp = (pf + cgO).substr(0,32 - 3);
            				if (calcHDCount[cgTmp]) { //collect the count
            					calcHDCount[cgTmp]++;
            				}
            				else {
            					calcHDCount[cgTmp] = 1;
            				}
            				cgN = cgTmp + '_' + calcHDCount[cgTmp].toString().padStart(2,'0');
            			}
            			else {
            				cgN = pf + cgO; 
            			}
            			calcHMap[cgO] = cgN;
        			}
        			item['CalcId'] = cgN;
    			}
        	}
    	} 	
    	
    	//calc steps
    	//var calcStepMap = {}, calcStepDCount = {};
    	if (ret['TzdarCalcDtl']['item']) {
        	if (ret['TzdarCalcDtl']['item'].length) {
        		ret['TzdarCalcDtl']['item'].forEach(item => {
        			var cg = item['CalcId'];
        			
        			if (calcHMap[cg]){
        				item['CalcId'] = calcHMap[cg];
        			}
        			else { //orphan data
        				var length = item['CalcId'].length;
        				var cgO = item['CalcId'];
            			if (!calcHMap[cgO]) {
                			if ((length + pf.length) > 32) {
                				var cgTmp = (pf + cgO).substr(0,32 - 3);
                				if (calcHDCount[cgTmp]) { //collect the count
                					calcHDCount[cgTmp]++;
                				}
                				else {
                					calcHDCount[cgTmp] = 1;
                				}
                				cgN = cgTmp + '_' + calcHDCount[cgTmp].toString().padStart(2,'0');
                			}
                			else {
                				cgN = pf + cgO; 
                			}
                			calcHMap[cgO] = cgN;
            			}
            			item['CalcId'] = cgN;
        			}	
        		});
        	}  
        	else {
        		var item = ret['TzdarCalcDtl']['item'];
    			var cg = item['CalcId'];
    			
    			if (calcHMap[cg]){
    				item['CalcId'] = calcHMap[cg];
    			}
    			else { //orphan data
    				var length = item['CalcId'].length;
    				var cgO = item['CalcId'];
        			if (!calcHMap[cgO]) {
            			if ((length + pf.length) > 32) {
            				var cgTmp = (pf + cgO).substr(0,32 - 3);
            				if (calcHDCount[cgTmp]) { //collect the count
            					calcHDCount[cgTmp]++;
            				}
            				else {
            					calcHDCount[cgTmp] = 1;
            				}
            				cgN = cgTmp + '_' + calcHDCount[cgTmp].toString().padStart(2,'0');
            			}
            			else {
            				cgN = pf + cgO; 
            			}
            			calcHMap[cgO] = cgN;
        			}
        			item['CalcId'] = cgN;
    			}
        	}
    	}

    	return ret;
    }
    
    function createUploadLog(text, newName = true) {
    	const tab = '   ';
    	var user = getLocalStorage('user_info', false);
    	if (user) {
    		uploadUser = user;
    	}
    	else {
    		if (!uploadUser) {
    			uploadUser = {};
    			uploadUser.UserId = '';
    		}
    	}
    	
    	var message = 'User: ' + uploadUser.UserId + '\r\n';
    	if (uploadEnv) {
    		message += 'Environment: ' + uploadEnv + '\r\n';
    	}
    	if (selFileName) {
    		message += 'File Name: ' + selFileName + '\r\n';
    	}
    	if (uploadDate) {
    		message += 'Start Date: ' + uploadDate + '\r\n';
    	}
    	if (uploadDateFin) {
    		message += 'Completion Date: ' + uploadDateFin + '\r\n';
    	}
    	if (uploadDate && uploadDateFin) {
    		message += 'Runtime in seconds: ' + ((uploadDateFin - uploadDate)/1000).toString()  + '\r\n'; 
    	}
    	message += separator;
    	if (uploadOpt > -1) {
    		message += 'Upload Option: ';
	    	switch (uploadOpt) {
	    	case '0':
	    		message += $('#upload-opt-c1').text() + '\r\n';
	    		break;
	    	case '1':
	    		message += $('#upload-opt-c2').text() + '\r\n';
	    		message += 'Prefix: ' + $("#upload-prefix-field").val() + '\r\n'; 
	    		break;
	    	case '2':
	    		message += $('#upload-opt-c3').text() + '\r\n';
	    		break;
	    	default:
	    		message += 'Unknown \r\n';
	    	}
	    	message += '\r\n';
    	}
    	
    	if (selectedList) {
    		
    		var hier = {};
    		if (selectedList.length) {
    			selectedList.forEach(s => {
    				if (!s.data.parent) { //env
    					hier[s.data.id] = {}
    				}
    				else if (s.data.DobjectId) { //data source
    					var envr = s.data.parent;
    					if (!hier[envr]) {
    						hier[envr] = {}
    					}
    					hier[envr][s.data.DobjectId] = [];
    				}
    				else if (s.data.CalcGroupId) {
    					var dobj = s.data.parent;
    					var envr = s.data.Environment;
    					if (!hier[envr]) {
    						hier[envr] = {}
    					}
    					if (!hier[envr][dobj]) {
    						hier[envr][dobj] = [];
    					}
    					hier[envr][dobj].push(s.data.CalcGroupId);
    				}
    			});
    		}
    		var hierMessage = '';
    		for (var envr in hier) {
    			hierMessage += tab + envr + '\r\n';
    			for (var dobj in hier[envr]) {
    				hierMessage += tab + tab + dobj + '\r\n';
    				hier[envr][dobj].forEach(cg => {
    					hierMessage += tab + tab + tab + cg + '\r\n';
    				});
    			}
    		}
    		
    		if (selectedList.length) { /*
    			var listdo = [], listcg = [];
    			var listdoX = {};
    			selectedList.forEach(s => {
    				switch (s.data.tbl) {
    				case 'TzdarDobjects':
    					if (!listdoX[s.data.id]) {
    						listdo.push(s.data.id);
    					}
    					listdoX[s.data.id] = true;
    					break;
    				case 'TzdarCalcGrp':
    					listcg.push(s.data.id);
    					if (!listdoX[s.data.PrimaryDobjectId]) {
    						listdo.push(s.data.PrimaryDobjectId);
    						listdoX[s.data.PrimaryDobjectId] = true;
    					}
    				}
    				
    			});
    			message += 'Import Selection: \r\n    Data Source: ' + listdo.join(', ') + '\r\n    Calc Group: ' + listcg.join(', ') + '\r\n';
    			*/
    			message += 'Import Selection: \r\n' + hierMessage + '\r\n';
    		}
    		else {
    			message += 'Import Selection: <Nothing>\r\n';
    		}
    	}
    	else {
    		message += 'Selected List: <ALL> \r\n';
    	}
    	if (text) {
    		message += 'Status Message: ' + text + '\r\n';
    	}
    	
    	var date = new Date();
    	
    	if (newName) {
        	uploadLogFile = "logUpload_" + date.getFullYear().toString() + 
			(date.getMonth()+1).toString().padStart(2,'0') + 
			date.getDate().toString().padStart(2,'0') +
			date.getHours().toString().padStart(2,'0') +
			date.getMinutes().toString().padStart(2,'0') +
			date.getSeconds().toString().padStart(2, '0') + 
			date.getMilliseconds().toString().padStart(3, '0');
    	}
    	
    	download(uploadLogFile,message);
    }
    
    function createValidationLog(text, newName = true) {
    	var user = getLocalStorage('user_info', false);
    	if (user) {
    		uploadUser = user;
    	}
    	else {
    		if (!uploadUser) {
    			uploadUser = {};
    			uploadUser.UserId = '';
    		}
    	}
    	
    	var message = 'User: ' + uploadUser.UserId + '\r\n';    
    	if (uploadEnv) {
    		message += 'Environment: ' + uploadEnv + '\r\n';
    	}
    	if (selFileName) {
    		message += 'File Name: ' + selFileName + '\r\n';
    	}
    	
    	if (text) {
    		message += 'Status Message: ' + text + '\r\n';
    	}
    	
    	var date = new Date();
    	
    	if (newName) {
    		validateLogFile = "logUplValidate_" + date.getFullYear().toString() + 
			(date.getMonth()+1).toString().padStart(2,'0') + 
			date.getDate().toString().padStart(2,'0') +
			date.getHours().toString().padStart(2,'0') +
			date.getMinutes().toString().padStart(2,'0') +
			date.getSeconds().toString().padStart(2, '0') + 
			date.getMilliseconds().toString().padStart(3, '0');
    	}
    	download(validateLogFile,message);
    }
    
    
    
    
    
    function isJsonValid(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
    
    function flagNewCGFancyTree() {
    	//use two webservices zdar_calc_grp_r and zdar_dobject_r
    	var env = uploadEnv;
    	var needToCG = false, needToDobj;
    	
    	if (env) {
    		if (xEnv != env) {
    			needToCG = true;
    			needToDobj = true;
    		}
    		if (!xCalcGrpList) {
    			needToCG = true;
    		}
    		if (!xCgDobjectsList) {
    			needToDobj = true;
    		}
    		if (needToCG) {
    			//run webservices
    			var url = getConfig('zdar_calc_engine_bind');
    			var request = `<tns:ZdarCalcGrpR>
    							<Calcgroupid>%</Calcgroupid>
    							<DateTimeLastChanged></DateTimeLastChanged>
    							<Env>${env}</Env>
    							<Page></Page>
    							<Model>%</Model>
    						</tns:ZdarCalcGrpR>`;
    			var promiseCg = new Promise((res,rej) => {
    				try {
    					xCgDobjectsSrch = {};
        				callWebService(url,request,'ZdarCalcGrpRResponse',true,
        						(data) => {
        							xCalcGrpList = data;
        							res(data);
        						})    					
    				}
    				catch (e) {
    					rej(e);
    				}
    			});
    		}
    		else {
    			var promiseCg = new Promise((res,rej) => {
    				res(xCalcGrpList);
    			})
    		}
    		if (needToDobj) {
    			// run webservices
    			var url = getConfig('zdar_calc_engine_bind');
    			var request = `<tns:ZdarDobjectsR>
					<Dobjectid>%</Dobjectid>
					<DateTimeLastChanged></DateTimeLastChanged>
					<Env>${env}</Env>
					<Page></Page>
					<Status>%</Status>
				</tns:ZdarDobjectsR>`;    			
    			var promiseDo = new Promise((res,rej) => {
    				try {
        				callWebService(url,request,'ZdarDobjectsRResponse',true,
        						(data) => {
        							xCgDobjectsList = data;
        							res(data);
        						})    					
    				}
    				catch (e) {
    					rej(e);
    				}
    			});    			
    		}
    		else {
    			var promiseDo = new Promise((res,rej) => {
    				res(xCgDobjectsList);
    			})
    		}
    		promiseCg.then(val => {
    			if (val.length) {
    				var valx = val;
    			}
    			else {
    				var valx = [val];
    			}
    			valx.forEach(item => {
    				xCgDobjectsSrch[item.CalcGroupId] = true;
    			});
    			var $idDestDropDown = $("#selection-model-modal .id-desc-dropdown");
    			$treeBox.find("span.tree-cg").each((i,item) => {
    				var value = $(item).parent().children(".fancytree-title").text();
    				switch ($idDestDropDown.val()) {
    				case 'id':
    					var tmp = value;
    					break;
    				case 'id - desc':
    					var tmp = value.substr(0, value.indexOf(' - '));
    					break;
    				default:
    					var tmp = value;
    				}
    				
    				if (xCgDobjectsSrch[tmp]) {
    					$(item).attr("data-cg-exists","true");
    				}
    				else {
    					if (!$(item).parent().find('.fancy-flag').length) {
    						$(item).parent().append(`<span class="fancy-flag fancy-flag-new label">New</span>`);
    					}
    				}
    			});
    		});
    		promiseDo.then(val => {
    			if (val.length) {
    				var valx = val;
    			}
    			else {
    				var valx = [val];
    			}
    			val.forEach(item => {
    				var node = $treeBox.find('span[data-model="' + item.DobjectId + '"]');
					$(node).attr("data-model-exists","true");
    			});
    			$treeBox.find("span[data-model]:not([data-model-exists])").each((i, element) => {
    				if (!$(element).children('.fancy-flag').length) {
    					$(element).append(`<span class="fancy-flag fancy-flag-new label">New</span>`);
    				}
    			}); 
    			//$treeBox.find("span[data-model]:not([data-model-exists])").append(`<span class="fancy-flag fancy-flag-new label">New</span>`);
    		});
    		$treeBox.find(".orphan").parent().each((i,element) => {
    			if (!$(element).children('.fancy-flag').length) {
    				$treeBox.find(".orphan").parent().append(`<span class="fancy-flag fancy-flag-orphan label">N/A</span>`);
    			}
    		})
			
    	}
    	xEnv = env;
    }
    
    function loadDObjects(penv) {
    	
    	var needToDobj = false;
    	var env = penv ? penv : uploadEnv;
    	return new Promise((response, reject) => {
        	if (env) {
        		if (xEnv != env) {
        			needToDobj = true;
        			xEnv = env;
        		}
        		if (!xCgDobjectsList) {
        			needToDobj = true;
        		}    		
        		if (needToDobj) {
        			// run webservices
        			var url = getConfig('zdar_calc_engine_bind');
        			var request = `<tns:ZdarDobjectsR>
    					<Dobjectid>%</Dobjectid>
    					<DateTimeLastChanged></DateTimeLastChanged>
    					<Env>${env}</Env>
    					<Page></Page>
    					<Status>%</Status>
    				</tns:ZdarDobjectsR>`;    			

    				callWebService(url,request,'ZdarDobjectsRResponse',true,
    						(data) => {
    							xCgDobjectsList = data;
    							//console.log(data, "yey!");
    							response(data);
    						})    					
  			
        		}
        		else {
        			//console.log(xCgDobjectsList, "yey!");
    				response(xCgDobjectsList);
        		}
        		 		
        	}  	
        	else {
        		response(null);
        	}
    	})            		
    	
    	
    }
    
    
});

function toggleButton($btn, enable) {
	if (enable) {
		$btn.addClass('btn-primary');
		$btn.removeClass('btn-default-grey');				
	}
	else {
		$btn.removeClass('btn-primary');
		$btn.addClass('btn-default-grey');		
	}
}

