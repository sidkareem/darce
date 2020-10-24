/* Darwin Dashboard functions
 * 
 * 
 * 
 */


function sliceIntersectData(dataS, filter = null, replc = null, memIntrx = null, valCol = "Value", sumType = "sum", scaling = null) {
	
	//use to extract, slice, and aggregrate JSON type intersections values
	/*parameters:
	 	dataS - data in JSON format (e.g. [{"Account":"REVENUE","VERSION":"ACTUAL","COST_CENTER":"10000","Value":1000},[{"Account":"REVENUE",...}])
	 	filter - filter data by keys (e.g. {"Account": "REVENUE", "VERSION":"BUDGET"), prefix with '/' to use RegExp for filtering (e.g. {"Account": "/REV*"})
	 	replc - replace all indicated key into a single values and aggregate the replaced keys (e.g.  {"Account": "TOTAL-ACCOUNT"}) or customized / selected replacement (e.g. {"Account": foo(item)}, where the foo is a function}
	 	valCol - key value used for aggregation, default is "Value"
	 	memIntrx - list of member intersection, if mebers doesn't match the intersection will removed while doesn't found will generate zero
	 	sumType - if the total is in sum or average
	 	scaling - multiple values by amount
	 output:
	 	same format as the dataS, filtered and possible aggregated.
	*/
	
	var returnVal = [];
	var filterVal = [];
	var boolPass = false;
	var data = $.extend(true, [], dataS); //create a deep copy
	//do data filtering
	data.forEach(item => {
		if (typeof filter === 'object') {
			boolPass=true;
			for (var key in filter) {
				if (filter.hasOwnProperty(key) && item.hasOwnProperty(key)) {
					if (Array.isArray(filter[key])) {
						boolPass=false;
						for (var i = 0; i < filter[key].length; i++) {
							if (filter[key][i] == item[key]) {
								boolPass=true;
								break;
							} 
						}
					}
					else if (filter[key][0]==="/") {
						var regFilter = new RegExp(filter[key].substr(1));
						if (!item[key].match(regFilter)){
							boolPass=false;
						}    							
					}
					else {
						if (item[key] !== filter[key]){
							boolPass=false;
						}    							    							
					}
				}
			}
			if (boolPass) {
				filterVal.push(item);
			}
		}
		else {
			filterVal.push(item);
		}
	});
	//do ID replacement 
	var aggrVal = [], index;
	var aggrValCount = [];
	if (replc) {
		if (typeof replc === 'object') {
			//replace the member to mark for easy do summation
	    	filterVal.forEach(item => {
	    		for (var key in replc) {
	    			if (replc.hasOwnProperty(key) && item.hasOwnProperty(key)) {
	    				if (typeof replc[key] == 'function') {
	    					item[key] = replc[key](item[key],item);
	    				}
	    				else {
	    					item[key] = replc[key];
	    				}
						
	    			}
	    		}
	    	});

	    	//do aggregration based on duplicate intersection
	    	filterVal.forEach(item => {
	    		index = -1;
	    		var existVal = aggrVal.filter((f,i)=>{
	    			if (aggrVal.length){
	        			var pass = true;
	        			for (var key in item) {
	        				if (key !== valCol) {
		        				if (item[key] !== f[key]) {
		        					pass = false;
		        				}
	        				}
	        			}
	        			if (pass) {
	        				index = i;
	        			}
	        			return pass;
	    			}
	    		});
	    		if (existVal.length) {
	    			if (index > -1) {
	    				if (isNaN(item[valCol])) {
	    					aggrVal[index][valCol] += item[valCol];
	    				}
	    				else {
	    					aggrVal[index][valCol] += Number(item[valCol]);
	    				}
	    				aggrValCount[index]++;
	    			}
	    		}
	    		else {
	    			//aggrVal.push(item);
	    			var itemX = {};
	    			for (var key in item) {
	    				if (item.hasOwnProperty(key)) {
	    					itemX[key] = item[key]; 
	    				}
	    			}
	    			if (!isNaN(itemX[valCol])) {
	    				itemX[valCol] = Number(itemX[valCol]);
	    			}
	    			aggrVal.push(itemX);
	    			aggrValCount.push(1);
	    		}
	    	});
	    	
	    	switch (sumType) {
	    	case "average":
	    		if (aggrVal) {
	    			aggrVal.forEach((item,i) => {
	    				item[valCol] /= aggrValCount[i];
	    			});
	    		}
	    		break;
	    	}
		}
		//delete those total is blank member as mark for deletion
		for (var key in replc) {
			if (replc.hasOwnProperty(key)) {
				if (replc[key] == "" || replc[key] == null) {
					aggrVal.forEach(item => {
						delete item[key];
					});
				}
			}
		}
	}

	if (aggrVal.length > 0) {
		returnVal = aggrVal;
	}
	else {
		returnVal = filterVal;
	}
	
	//intersection fill up
	var IsFillUpEmpty = true;
	if (memIntrx) {
		if (typeof memIntrx === 'object') {
			if (returnVal.length){
				var interxMembers = {};
				var interxMembersStat = {};
				var interxDims = [];
				var interxComb = [];
				var numOfComb = 1;				
				for (var key in memIntrx) {
					if (memIntrx.hasOwnProperty(key) && returnVal[0].hasOwnProperty(key)) {
						if (Array.isArray(memIntrx[key])) {
							interxMembers[key] = memIntrx[key];
						}
						else {
							var tmp = memIntrx[key].split(",").map(item => item.trim());
							interxMembers[key] = tmp; 
						}
						numOfComb *= interxMembers[key].length;
						interxMembersStat[key] = {"length": interxMembers[key].length , "count": 0};
						interxDims.push(key);
					}
				}
				
				//create a combination
				for (var i = 0; i < numOfComb; i++) {
					var tmp = {};
					interxDims.forEach((dim,j) => {
						var ixMS = interxMembersStat[dim];
						var count = ixMS.count; //retrieve the temp count 
						tmp[dim] = interxMembers[dim][count] //retrieve the member from array
						if (j == interxDims.length - 1) { //do the checking when in the last dim array
							
							//when on the last item, check if the count exceeds
							if (ixMS.count >= (ixMS.length - 1)) { //iterate up
								//ixMS.count = 0
								//var carry = 1;
								for (var k = interxDims.length - 1; k >= 0 ; k--) {
									var ixMS2 = interxMembersStat[interxDims[k]];
									ixMS2.count++;
									if (ixMS2.count >= ixMS2.length) {
										//carry = 1;
										ixMS2.count = 0;
									}
									else {
										//carry = 0;
										break;
									}
								}
							}
							else {
								ixMS.count++; //increment only the last item
							}
							
						}
					});
					interxComb.push(tmp);
				}			
				//create an object with keys as combination of arrays for quick search
				var interxCombInKeys = {}, returnValInKeys = {};
				var otherDims = [];
				for (var key in returnVal[0]) { /*pick one intersection (first item for sinplicity) 
												and used to get the keys, assume all the data have the same intersection */
					var found = false;
					if (key != valCol) {
						for (var j = 0; j < interxDims.length; j++) {
							if (interxDims[j] == key) {
								found = true;
								break;
							}
						}
						if (!found) {
							otherDims.push(key);
						}					
					}
				}
				interxComb.forEach((item,i) => {
					var newKey = "";
					interxDims.forEach((dim,j) => { 
						newKey += item[dim] + "|";
					});
					interxCombInKeys[newKey] = null;
				});
				returnVal.forEach((item,i) => {
					var newKey = "";
					interxDims.forEach((dim, j) => {
						newKey += item[dim] + "|";
					});
					if (!returnValInKeys[newKey]) {
						returnValInKeys[newKey] = [];
					}
					returnValInKeys[newKey].push(item);
				});
				
				 
				var existingInterx = {};
				//match the two
				for (var key in interxCombInKeys) {
					var tmp = null;
					if (returnValInKeys[key]) {
						tmp = {};
						returnValInKeys[key].forEach(item => {
							var dimKey = "";
							otherDims.forEach(dim => {
								dimKey += item[dim] + "|";
							});
							tmp[dimKey] = item;
							//collect all the unique keys used for blank intersections
							existingInterx[dimKey] = true; 
						});
						 
					}
					//get the item with same intersection from the data
					interxCombInKeys[key] = tmp;
				}
				
				//to fill up empty intersection
				
				for (var keyI in interxCombInKeys) {
					var inX = interxCombInKeys[keyI];
					if (inX) {
						for (var keyEx in existingInterx) {
							if (!inX[keyEx]) {
								var tmp = {};
								var mem1 = keyEx.slice(0,-1).split("|");
								mem1.forEach((mem,j) => {
									tmp[otherDims[j]] = mem;
								});
								var mem2 = keyI.slice(0,-1).split("|");
								mem2.forEach((mem,j) => {
									tmp[interxDims[j]] = mem;
								});
								tmp[valCol] = 0;
								if(!interxCombInKeys[keyI]){
									interxCombInKeys[keyI] = {};
								}
								interxCombInKeys[keyI][keyEx + "n"] = tmp; //marked the new items
							}
						}
					}
					else { //if the intersection is empty, always fill
						for (var keyEx in existingInterx) { 
							var tmp = {};
							//compose data with value of zero
							var mem1 = keyEx.slice(0,-1).split("|");
							mem1.forEach((mem,j) => {
								tmp[otherDims[j]] = mem;
							});
							var mem2 = keyI.slice(0,-1).split("|");
							mem2.forEach((mem,j) => {
								tmp[interxDims[j]] = mem;
							});
							tmp[valCol] = 0;
							if(!interxCombInKeys[keyI]){
								interxCombInKeys[keyI] = {};
							}
							interxCombInKeys[keyI][keyEx + "n"] = tmp; //marked the new items
						}
					}
				}
				
				//collect all the items and store in return variable
				var resultVal = [];
				for (var key in interxCombInKeys){
					var d1 = interxCombInKeys[key];
					for (var key2 in d1) {
						resultVal.push(d1[key2]);
					}
				}
				
				returnVal = resultVal; //replace the return value				
			}
			else {//if there is no filtered data to compare, create a 'dummy' data
				var interxFill = {};
				var interxMembers = {};
				var numOfComb = 1;
				var interxDims = [];
				var interxMembersStat = {};
				if (typeof filter == 'object') {
					for (var key in filter) {
						if (filter[key][0]!=="/") {
							interxFill[key] = filter[key];
						}
					}
				}
				if (typeof replc == 'object') {
					for (var key in replc) {
						interxFill[key] = replc[key];
					}
				}
				for (var key in memIntrx) {
					if (memIntrx.hasOwnProperty(key)) {
						if (Array.isArray(memIntrx[key])) {
							interxMembers[key] = memIntrx[key];
						}
						else {
							var tmp = memIntrx[key].split(",").map(item => item.trim());
							interxMembers[key] = tmp; 
						}
						numOfComb *= interxMembers[key].length;
						interxMembersStat[key] = {"length": interxMembers[key].length , "count": 0};
						interxDims.push(key);
					}
				}
				var interxComb = [];
				//create a combination
				for (var i = 0; i < numOfComb; i++) {
					var tmp = {};
					interxDims.forEach((dim,j) => {
						var ixMS = interxMembersStat[dim];
						var count = ixMS.count; //retrieve the temp count 
						tmp[dim] = interxMembers[dim][count] //retrieve the member from array
						if (j == interxDims.length - 1) { //do the checking when in the last dim array
							
							//when on the last item, check if the count exceeds
							if (ixMS.count >= (ixMS.length - 1)) { //iterate up
								//ixMS.count = 0
								//var carry = 1;
								for (var k = interxDims.length - 1; k >= 0 ; k--) {
									var ixMS2 = interxMembersStat[interxDims[k]];
									ixMS2.count++;
									if (ixMS2.count >= ixMS2.length) {
										//carry = 1;
										ixMS2.count = 0;
									}
									else {
										//carry = 0;
										break;
									}
								}
							}
							else {
								ixMS.count++; //increment only the last item
							}
							
						}
					});
					interxComb.push(tmp);
				}
				
				var returnVal = [];
				interxComb.forEach(inx => {
					var item = $.extend(true,{},inx,interxFill);
					item[valCol] = 0;
					returnVal.push(item);
				});
			}
 
		}		
	}
	
	if (scaling) {
		returnVal = returnVal.map(d => {
			d[valCol] *= scaling;
			return d;
			});
	}

	return returnVal;
}

function extractValue(arrayItems, objKeysVal, colValue, distinct = false) {
	
	//creates an array of values from JSON data form based on the filter keys (intersection)
	//parameters:
//		arrayItems - object with keys, JSON formatted values
//		objKeysVal - object with keys, valid keys in arrayItems used to filter the arrayItems based on matched onKeysVal, it is an object type (e.g. {"TIME": "2010.JAN", "ACC": "OPEX"})
	//  colValue - string, a valid key in arrayItem as an output
	//return value: array data type
	
	var returnVal = [];
	var keys = [];

	var boolPass;
	if (typeof objKeysVal === 'object') {
    	for (var key in objKeysVal) {
    		if (objKeysVal.hasOwnProperty(key)) {
    			keys.push(key);
    			//keyVal.push(objKeysVal[key]);
    		}
    	}
    	arrayItems.forEach(item => {
    		boolPass = true;
    		keys.forEach(key => {
    			if (objKeysVal[key][0] === "/") {
    				var regFilter = new RegExp(objKeysVal[key].substr(1));
    				if (!item[key].match(regFilter)) {
    					boolPass = false;
    				}
    			}
    			else { 
	    			if (item[key] !== objKeysVal[key]) {
	    				boolPass = false;
	    			}
    			}
    		});
    		if (boolPass) {
    			returnVal.push(item[colValue]);
    		}
    	});
	}
	else {
		arrayItems.forEach(item => {
			returnVal.push(item[colValue]);
		});
	}
	
	if (distinct) {
		var temp = [];
		returnVal.forEach(item => {
			
    		var existVal = temp.filter((f,i) => {
    			if (temp.length) {
    				var pass = true;
    				if (item !== f) {
    					pass = false;
    				}
    				return pass;
    			}
    		});
    		if (!existVal.length) {
    			temp.push(item);
    		}
		});
		return temp;
	}
	else {
		return returnVal;
	}
	
}

function addHexColor(c1, c2, pad = 0) {
	  var hexStr = (parseInt(c1, 16) + parseInt(c2, 16)).toString(16);
	  while (hexStr.length < pad) { hexStr = '0' + hexStr; } // Zero pad.
	  return hexStr;
}    

function miniCharts(arg) {
	/*Creates multiple charts in one go
	 *arg - element: strings, required, name of the element
	 *		defaultOptions: object, optional, options applied as default parameter of kpiBarChart, same parameter as kpiBarChart
	 *		selection: array, required, array of kpiBarChart arg objects
	 * */
	var element = "#" + arg.element;
	var globalOptions = arg.defaultOptions ? arg.defaultOptions : null;
	var selections = arg.selections;
	arg._selections = $.extend(true,[],selections);
	
	//apply globalOptions to selection
	for (var key in globalOptions) {
		if (globalOptions.hasOwnProperty(key)) {
			selections.forEach(sel => {
				if (!sel.hasOwnProperty(key)) {
					sel[key] = globalOptions[key]; 
				}
				else {
					if (key == 'barChart' || key == 'lineChart') { //because some of parameters are objects, need to loop inside the objects
						var tmp = globalOptions[key];
						for (var keyC in tmp) {
							if (tmp.hasOwnProperty(keyC)) {
								sel[key][keyC] = tmp[keyC];
							}
						}
					}
				} 
			});
		}
	}
	
	
	var d3Container = d3.select(element);
	selections.forEach((sel,i) => {
		//add selections which is reference to itself and other selections
		sel.selections = selections;
		
		//build charts
		var chartName = arg.element + "_" + i
		var addnClass = "";
		switch (i) {
		case 0:
			addnClass = "first";
			break;
		case selections.length - 1:
			addnClass = "last";
		}
		var chartBox = d3Container.append("div")
							.attr("class","kpi-chart-block " + addnClass)
							.append("div")
								.attr("class","panel text-center kpi-chart")
								.attr("id",chartName);
							
		sel.element = chartName;
		sel.index = i;
		kpiBarChart(sel);
		
	});
	
    arg.refresh = function(index = 0, data = null, others = null){
    	if (isNaN(index)) {
    		for (var i = 0; i < selections.length; i++) {
    			if (selections[i].name.toUpperCase() == index.toUpperCase()) {    				
    				var sel = selections[i];
    				break;
    			}
    		}
    	}
    	else {
    		var sel = selections[index];
    	}
    	
    	if (sel) {
        	var param = {};
        	if (data) {
        		param.data = data;
        	}
        	
        	if (others) {
            	var chartlist = ["barChart", "lineChart"];
            	
            	chartlist.forEach(d => {
                	if (others[d] && sel[d]) {
                		var bChart = others[d];
                		param[d] = {};
            			param[d].data = bChart;
                	}    		
            	});    		
        	}
        	    	
        	sel.refresh(param);    		
    	}
    	return arg;
    };
    
    arg.refreshAll = function(arg2 = null) {
    	var paramInKeys = {};
    	if (arg2) {
    		if (Array.isArray(arg2)) { //convert the arg2 arrays into keyed objects for easy search
    			arg2.forEach(d => {
    				paramInKeys[d.name] = d; 
    			});
    		}
    	}
    	
    	//re-apply the global options
    	var globalOptions = arg.defaultOptions ? arg.defaultOptions : globalOptions;
    	for (var key in globalOptions) {
    		if (globalOptions.hasOwnProperty(key)) {
    			selections.forEach((sel,i) => {
    				var _sel = arg._selections[i];
    				if (!_sel.hasOwnProperty(key)) {
    					sel[key] = globalOptions[key]; 
    				}
    				else {
    					if (key == 'barChart' || key == 'lineChart') { //because some of parameters are objects, need to loop inside the objects
    						var tmp = globalOptions[key];
    						for (var keyC in tmp) {
    							if (tmp.hasOwnProperty(keyC)) {
    								sel[key][keyC] = tmp[keyC];
    							}
    						}
    					}
    				} 
    			});
    		}
    	}    	
    	
    	selections.forEach(s => {
    		if (paramInKeys[s.name]) {
    			var tmp = paramInKeys[s.name]; 
	        	for (var key in tmp) {
	        		if (tmp.hasOwnProperty(key)) {
	        			if (key === "barChart" || key === "lineChart") {
	        				var tmp2 = tmp[key];
	        				for (var key2 in tmp2) {
	        					if (tmp2.hasOwnProperty(key2)) {
	        						s[key][key2] = tmp2[key2];
	        					}
	        				}    				
	        			}
	        			else {
	        				if (key !== 'title') {
	        					s[key] = tmp[key];
	        				}
	        			}
	        		}
	        	}     			
    		}
    		s.refresh();
    	})
    	
    	return arg;
    }
    
    if (!arg.activeEvents) {
    	arg.activeEvents = [];
    }
    //arg._onDone = null;
    var countDoneSuccess = 0;
    var countDoneEvent = 0;

    var countDoneDSuccess = 0;
    var countDoneDEvent = 0;
    
    //event fucntion setting
    arg.on = (e, f) => {//parameters: e -> event name, f -> function callback
    	switch(e) {
    	case 'done':
    		arg._onDone = f;
    		arg.selections.forEach(sel => {
    			var f2 = (e, f) => {
    				countDoneSuccess++;
    				if (typeof f == 'function') {
    					f(e,f);
    				}
    				if (countDoneEvent <= countDoneSuccess) {
    					countDoneSuccess = 0;
    			    	if (typeof arg._onDone == 'function') {
    			    		arg._onDone(arg,true);
    			    	}			
    				}
    			}
    			if (sel.on) {
    				countDoneEvent++;
    				sel.on(e,f2);
    			}
    			if (sel.barChart) {
					countDoneEvent++;
					if (!sel.barChart._on) {
						sel.barChart._on = [];
					}
					sel.barChart._on.push([e,f2]);
    			}
    		});    			
    		break;
    	case "bars:click":
    	case "mainbars:click":
    		arg.selections.forEach(sel => {
    			sel.on("bars:click",f);
    		});
    		if (e != 'bars:click') {
    			break;
    		}
    	case "subbars:click": 
			arg.selections.forEach(sel => {
				if (sel.barChart) {
					sel.barChart._name = sel.name;
					if (!sel.barChart._on) {
						sel.barChart._on = [];
					}					
					sel.barChart._on.push(["bars:click",f]);
				}
			})
			break;
    	case "click": 
    		arg.selections.forEach(sel => {
    			sel.on("click",f);
    		});
			break;			
    	case 'data:done':
    		arg._onDataDone = f;
    		arg.selections.forEach(sel => {
    			var f2 = (e, f) => {
    				countDoneDSuccess++;
    				if (typeof f == 'function') {
    					f(e,f);
    				}
    				if (countDoneDEvent <= countDoneDSuccess) {
    					countDoneDSuccess = 0;
    			    	if (typeof arg._onDataDone == 'function') {
    			    		arg._onDataDone(arg,true);
    			    	}			
    				}
    			}
    			if (sel.on) {
    				countDoneDEvent++;
    				sel.on(e,f2);
    			}
    			if (sel.barChart) {
					countDoneDEvent++;
					if (!sel.barChart._on) {
						sel.barChart._on = [];
					}
					sel.barChart._on.push([e,f2]);
    			}
    		});    			
    		break;    		
    	}
    	arg.activeEvents.push(e);
    	return arg;
    }       
	
	return arg;
}

function kpiBarChart(arg) {
	/* arg-	element: string, required, element ID in HTML
	 * 		data: object, required, can be data in JSON format or promise with JSON format as return
	 * 		name: string, description appears on the title and selector
	 * 		titleIcon: string, optional, icomoon ico name appears next to the title
	 * 		xDimension: string default, x axis dimension
	 * 		staticMembers: optional, similar to sliceIntersectData memIntrx parameter	 * 
	 * 		valueDimension: string, key in data contains numeric value; default = "Value"
	 * 		colors: array, bar colors, im array format (e.g. ['#9cc3e7','#ffdb63','#f7b284'] for three bars)
	 * 		height: number, height of the graph; default = 120
	 * 		filter: optional, filter data by keys (e.g. {"Account": "REVENUE", "VERSION":"BUDGET"), prefix with '/' to use RegExp for filtering (e.g. {"Account": "/REV*"})
	 * 		sumDimensions: optional, sum up based on intersection and overrides the member, similar to replc in sliceIntersectData
	 * 		sumType: optional, if the result from sumDimension do total or average, valid values = sum, average. 
	 * 		scaling: optional, multiply values by amount.
	 *    	measureDisplay: string, number format for values, defalut "default", valid values = default, short, percent 
	 * 		tooltip: object, bar tooltips, default null (no tooltip), (e.g. {"DIM1":"MEM1","DIM2":"MEM2"}
	 * 		labelBar: object, labels in grapth (e.g. {"top": "DIM1", "bottom": "DIM1", "top-in": "DIM2"}); default {"top": valueDimension,"bottom":"Version", "format": measureDisplay}; set labelBar = null to disable labels
	 * 			top: string, label text located above bar
	 * 			bottom: string, label text located below bar 
	 * 			top-in: string, label text located just below the top of the bar
	 * 			format: number format of values, if indicated in label text; default = measureDisplay
	 * 			valueText: overrides the display values, default = {value}
	 * 		largeText: object, large text above the graph, default null (retrieve first value); default is the first value
	 * 			text: string, text override, can use values as {value} (e.g. "$ {value} in Revenue")
	 *			valueDimension: string, value key in the data if want to retrieve other than in valueDimension; default = valueDimension
	 *			index: number, index number value based on the graph bar position; default = 0 (first bar)  
	 *			format: number format of values, if indicated in label text; default = measureDisplay
	 *		smallText: object, small text below the large text, default null (no small text)
	 *			text: string, text override, can use values as {value} and increase / decrease indicators as  {sign} (e.g. "{value} {sign} PY)
	 *			valueDimension: string, value key in the data if want to retrieve other than in valueDimension; default = valueDimension
	 *			amount: number, another value used for calculating percentage; default is first value
	 *			index: number, index number value based on the graph bar position; default = 1 (second bar) or 0 (have only one bar)
	 *			sign: increase / decrease indicators
	 *				positive: increase indicator; default = "▲"
	 *				negative: decrease indicator; default = "▼"
	 *				neutral: no movement indicator; default = "-"
	 *			format: number format of values, if indicated in label text; default = measureDisplay
	 *			mapVal: used to change the calculations, the default is ([value(index)] - [amount]) / [amount] 
	 * 		margin: object, margin of the entire chart
	 * 			top: default = 10
	 * 			right: default = 20
	 * 			bottom: default = 15
	 * 			left: default = 20
	 * 		lineChart: object, generates line chart below the bar chart, do not indicate lineChart or set to null to prevent line chart generation (check for kpiLineChart function for arg details)
	*/
	
	//initialize variables
	var element = "#" + arg.element;
	var filter = arg.filter ? arg.filter : null;
	//arg._currentFilter = filter;
	var sumDimensions = arg.sumDimensions ? arg.sumDimensions : null;
	var sumType = arg.sumType ? arg.sumType : null;
	var scaling = arg.scaling ? arg.scaling : null;
	var staticMembers = arg.staticMembers ? arg.staticMembers : null;
	var valCol = arg.hasOwnProperty("valueDimension") ? arg.valueDimension : "Value";	
	var data = arg.data;
	var dataPromise = null;
	var dataMap = arg.dataMap ? arg.dataMap : null;
	var xDimension = arg.xDimension ? arg.xDimension : "Version";
	var enableDebugReport = arg.hasOwnProperty("enableDebugReport") ? arg.enableDebugReport : false;
	var selectionOptions = arg.selectionOptions ? arg.selectionOptions : null;

    //event variables
    //arg._onDone = null;
    if (!arg.activeEvents) {
    	arg.activeEvents = [];
    }
    
    //event fucntion setting
    arg.on = (e, f) => {//parameters: e -> event name, f -> function callback
    	switch(e) {
    	case 'done':
    		arg._onDone = f;
    		break;
    	case 'bars:click':
    		arg._onBarsClick = f;
    		break;
    	case 'click':
    		arg._onClick = f;
    		break;
    	}
    	arg.activeEvents.push(e);
    	return arg;
    }   	
	
	if (data) {
		if (data instanceof Promise) {
			dataPromise = data;
			var dataPromise2 = new Promise((response,reject) => {
				dataPromise.then(rs => {
					arg.data = rs;
					if (filter || sumDimensions || staticMembers || scaling) {
						data = sliceIntersectData(rs, filter, sumDimensions, staticMembers, valCol, sumType, scaling);
					}
					else {
						data = rs;
					}
			    	if (typeof arg._onDataDone == 'function') {
			    		arg._onDataDone(arg,true);
			    	}					
					response(rs);
				},rj => {
			    	if (typeof arg._onDataDone == 'function') {
			    		arg._onDataDone(arg,false, rj);
			    	}										
				});
			});			
		}
		else {
			var dataPromise2 = new Promise((response,reject) => { //dummy promise to simplify coding
				if (filter || sumDimensions || staticMembers || scaling) {
					data = sliceIntersectData(arg.data, filter, sumDimensions, staticMembers, valCol, sumType, scaling);
				}
				else {
					data = arg.data;
				}
		    	if (typeof arg._onDataDone == 'function') {
		    		arg._onDataDone(arg,true);
		    	}				
				response(arg.data);
			},rj => {
		    	if (typeof arg._onDataDone == 'function') {
		    		arg._onDataDone(arg,false,rj);
		    	}
			})
		}

	}
	
	var measureDisplay = arg.hasOwnProperty("measureDisplay") ? arg.measureDisplay : "default";
	var colors = ["#aaaaaa"]; //arg.colors;
	if (arg.hasOwnProperty("colors")) { 
		colors = arg.colors;
	}    	
	if (typeof colors === 'string') {
		colors = [colors]; //convert into array
	}
	
	var height = arg.height ? arg.height : 115;
	var tooltip = arg.hasOwnProperty("tooltip") ? arg.tooltip : "" ;
	
	var labelBar;
	if (arg.hasOwnProperty("labelBar")) { 
		labelBar = arg.labelBar;
		if (!labelBar.hasOwnProperty("format")) {
			labelBar["format"] = measureDisplay;
		}
		if (!labelBar.hasOwnProperty("top") && !labelBar.hasOwnProperty("bottom") && !labelBar.hasOwnProperty("top-in")) {
			labelBar["top"] = valCol;
			labelBar["bottom"] = xDimension;
		} 
	}
	else {
		labelBar = {"top": valCol,"bottom":xDimension, "format": measureDisplay};
	}
	
	
	var largeText = {};
	if (arg.hasOwnProperty("largeText")) { 
		var tmp = arg["largeText"];
		if (typeof tmp !== 'object') {
			largeText["text"] = tmp;
		} 
		else {
			largeText = tmp;
		}
	};
	if (!largeText.hasOwnProperty("text")) { 
		largeText["text"] = "{value}"; 
	}
	if (!largeText.hasOwnProperty("valueDimension")) {
		largeText["valueDimension"] = valCol;
	}
	if (!largeText.hasOwnProperty("index")) {
		largeText["index"] = 0;
	}    	
	if (!largeText.hasOwnProperty("format")) {
		largeText["format"] = measureDisplay;
	}    	
	
	
	var smallText = {};
	if (arg.hasOwnProperty("smallText")) { 
		var tmp = arg["smallText"];
		if (typeof tmp !== 'object') {
			smallText["text"] = tmp;
		} 
		else {
			smallText = tmp;
		}    		
	}
	if (!smallText.hasOwnProperty("text")) { 
		smallText["text"] = "{sign} {value}"; 
	}
	if (!smallText.hasOwnProperty("valueDimension")) {
		smallText["valueDimension"] = valCol;
	}

	if (!smallText.hasOwnProperty("sign")) {
		smallText["sign"] = {"positive": "▲",
				  "negative": "▼",
			      "neutral": "-"};
	}  
	if (!smallText.hasOwnProperty("format")) {
		smallText["format"] = "percent";
	}   	
	if (!smallText.hasOwnProperty("mapVal")) {
		smallText["mapVal"] = ((i,j) => { 
			if (i > 0) {	
				return (i-j)/i; }
			else {
				return 1;
			}});
	}     	
    var title = "", name = "";
	if (arg.hasOwnProperty("name")) { 
		name = arg["name"];
		if (!arg.hasOwnProperty("title")) {
			title = name;
		}
	}
	
	if (arg.hasOwnProperty("title")) { 
		title = arg["title"];
		if (!name) {
			name = title;
		}
	}    	
	else {	
		if (data) {
			for (var key in data[0]){
				if (data[0].hasOwnProperty(key)) {
					title = data[0][key];
					if (name === "") {
						name = data[0][key];
					}
					break;
				}
			}			
		} 
		else {
			if (!title) { //no name and no title
				var ic = "";
				if (arg.index) {
					ic = arg.index;
				}
				title = "TITLE" + ic;
				if (name === "") {
					name = "TITLE" + ic;
				}				
			}
		}
	}
	arg._currentName = name;
	
	var titlecn = arg.hasOwnProperty("titleIcon") ? arg["titleIcon"] : "";
	var margin = {"top":10, "right":30, "bottom":15, "left":30};
	if (arg.hasOwnProperty("margin")) {
		var mg = arg["margin"];
		if (mg.hasOwnProperty("top")) {
			margin.top = mg.top;
		}
		if (mg.hasOwnProperty("right")) {
			margin.right = mg.right + 15;
		}
		if (mg.hasOwnProperty("bottom")) {
			margin.bottom = mg.bottom;
		}    		
		if (mg.hasOwnProperty("left")) {
			margin.left = mg.left + 15;
		}
		
	}
	var responsive = arg.hasOwnProperty("responsive") ? arg.responsive : false;
	var chooseList = arg.selections;
	
	//line chart arguments
	var lineChart = arg.lineChart;
	var barChart = arg.barChart;

    // Set value formatting
	// ------------------------------
    
    var format = d3.format(",f"), format2 = d3.format(",f"), formatPct = d3.format("%");
    format = measureFormat(measureDisplay)
    
	var lf = labelBar.format;
    format2 = measureFormat(lf, measureDisplay);

    var d3Container = d3.select(element),
    margin = {"top": margin.top, "right": margin.right, "bottom": margin.bottom, "left": margin.left},
    height = height - margin.top - margin.bottom - 5;
    
    // Clean the content first
    d3Container.selectAll("div").remove();

    // Create top box
    var topBox = d3Container.append("div").attr("class","top");
    var middleBox = d3Container.append("div").attr("class","middle");
    var bottomBox = d3Container.append("div").attr("class","bottom");
    
    if (arg.hasOwnProperty("width")) { 
		middleBox.style("width",arg.width + "px");
		var width = d3Container.node().getBoundingClientRect().width - margin.left - margin.right;
    }
    else {
    	middleBox.style("width","221.5px");
    	var width = 221.5 - margin.left - margin.right;
    }
    
	// Title
	// ------------------------------
    var titleBar = topBox.append("div")
    	.attr("class","ddb-kpi-title graph-title")
    var titleIcon;
    if (titlecn !== '') {
    	var addC = title === '' ? "no-desc": "has-desc";
    	titleIcon = titleBar.append("i")
    		.attr("class", titlecn + " " + addC);
    }
    var titleDesc = titleBar.append("h1")
		.text(title);
    
	// Dropdown Icons
	// ------------------------------
    
    var tmp = titleBar.append("ul").attr("class","icons-list small-chart-list")
    	.append("li").attr("class","dropdown text-muted");
    
    
    $(titleDesc[0][0]).on('click', e => {
    	if (typeof arg._onClick == 'function') {
    		arg._onClick(arg, e, name);
    	}    	
     });      
    
    $(bottomBox[0][0]).on('click', e => {
    	if (typeof arg._onClick == 'function') {
    		arg._onClick(arg, e, name);
    	}     	
     }); 
    
    $(middleBox[0][0]).on('click', e => {
    	if (typeof arg._onClick == 'function') {
    		arg._onClick(arg, e, name);
    	}     	
     });      
    
    
    var titleDDIcons = tmp.append("a").attr("class","dropdown-toggle").attr("aria-expanded","false").attr("data-toggle","dropdown")
    	
	titleDDIcons.append("i").attr("class","icon-more2").style("opacity","0");
	titleDDIcons.append("span").attr("class","icon-more2 right-click");
    	
    // dropdown items
    var dropdownItems = tmp.append("ul").attr("class","dropdown-menu dropdown-menu-right");
      
    //choose KPI
    
    if (chooseList) {
    	var dropdownItem = dropdownItems.append("li").attr("class","dropdown-submenu");
    	var isLeft = false, ishOrFunc = false;
    	if (selectionOptions) {
    		if (selectionOptions.hOrientation) {
        		if (typeof selectionOptions.hOrientation == 'function') {
        			ishOrFunc = true;
        		}
        		else if (selectionOptions.hOrientation == 'left') {
            		$(dropdownItem[0][0]).addClass("dropdown-submenu-left");
            		isLeft = true;
            	}    			
    		}
    	}
    	if (!isLeft) {
    		$(dropdownItem[0][0]).removeClass("dropdown-submenu-left");
    	}
    	
    	dropdownItem.append("a").attr("href","#").text("Choose KPI").append("i").attr("class", "icon-list-unordered");
    	d3Container.style("overflow","visible");
    	var tmp = dropdownItem.append("ul").attr("class","dropdown-menu");
    	var tmp2;
    	chooseList.forEach ( (d,i) => {
    		tmp2 = tmp.append("li").append("a").attr("class","dropdown-item").text(d.name).attr("data-index",i);
    		var nm = d.name;
    		if (nm) {
    			if (nm.toUpperCase() === name.toUpperCase()) {
    				$(tmp2[0][0]).addClass("selected");
    			}
    		}
    		$(tmp2[0][0]).on("click",e => {chooseKpiClick(e)})
    	});
    	
    	if (ishOrFunc) {
    		$(dropdownItem[0][0]).on("mouseover", e => {
    			var val = selectionOptions.hOrientation(e,arg);
    			if (val == 'left') {
    				$(dropdownItem[0][0]).addClass("dropdown-submenu-left");
    			}
    			else {
    				$(dropdownItem[0][0]).removeClass("dropdown-submenu-left");
    			}
    		});
    	}
    }
    
    var elementChartL = element + "-mn-line"
    var elementChartB = element + "-mn-bar"
    arg.elementChartL = element + "-mn-line"
    arg.elementChartB = element + "-mn-bar"
    
    //dummy contents when the promise data still waiting
    //var width = d3Container.node().getBoundingClientRect().width - margin.left - margin.right;
    d3Container.attr("data-width",width);
    var labelBoxTmp = middleBox.append("div")
    	.attr("class","label-box loading-label")
    	.append("h2")
    		.attr("class","ddb-kpi-bigtext")
    		.text("LOADING");
    labelBoxTmp.append("p")
		.attr('class',"ddb-kpi-smalltext")
		.style("visibility","hidden")
		.text("  ");   
    middleBox.append("svg")
    	.attr("width",width + margin.left + margin.right)
    	.attr("height",height + margin.top + margin.bottom);
    var smHeight = 58;
    
    bottomBox.append("svg")
    	.attr("height",smHeight - 5)
    	.attr("width", width);
    //loading screen
    var estTop = 0, estLeft = ((width + margin.left + margin.right) / 2) - 40;
    middleBox.append("div")
    	.attr("class","loading-screen")
    	.style("position","absolute")
    	.style("width","inherit")
    	.append("div");
 
    
    //generate contents
    dataPromise2.then(rs => {
    	middleBox.selectAll('*').remove();
    	bottomBox.selectAll('*').remove();
    	
    	var data0Val = 0;
    	if (data.length) {
    		data0Val = data[0][largeText["valueDimension"]];
    	}
    	
        if (enableDebugReport) {
        	var debugReportOptions = arg.hasOwnProperty("debugReportOptions") ? arg.debugReportOptions : {
        		'data': arg.data,
        		'filter': filter,
        		//'valCol': valCol
        	};
        	
        	if (!debugReportOptions.data) {
        		debugReportOptions.data = arg.data;
        	}
        	if (!debugReportOptions.filter) {
        		debugReportOptions.filter = filter;
        	}
        	if (!debugReportOptions.delCol) {
        		debugReportOptions.delCol = null;
        	}
        	//if (!debugReportOptions.valCol) {
        	//	debugReportOptions.valCol = valCol;
        	//}
        	if (!debugReportOptions.renameCol) {
        		debugReportOptions.renameCol = null;
        	}
        	
        	if (debugReportOptions.data instanceof Promise) {
        		debugReportOptions.data.then(respond => {
        			rightClickDebug(element + ' .icons-list .right-click',
        										respond,
        										debugReportOptions.filter,
        										debugReportOptions.delCol,
        										debugReportOptions.renameCol);
        		});
        	}
        	else {
        		rightClickDebug(element + ' .icons-list .right-click',
        							debugReportOptions.data,
        							debugReportOptions.filter,
        							debugReportOptions.delCol,
        							debugReportOptions.renameCol);
        	}
        	
        }
    	
    	
		if (colors.length < data.length) {
			var tmp = colors[colors.length - 1];
			for (var i = colors.length; i < data.length; i++) {
				var newColor = tmp.substring(1), ci = 20;
				var redN = newColor.substring(0,2), greenN = newColor.substring(2,4), blueN = newColor.substring(4,6); 
				var redN2 = addHexColor(redN,ci), greenN2 = addHexColor(greenN,ci), blueN2 = addHexColor(blueN,ci);
				if (parseInt("0x" + redN2) > 0xFF){
					redN2 = redN;
				}
				if (parseInt("0x" + greenN2) > 0xFF){
					greenN2 = greenN;
				}
				if (parseInt("0x" + blueN2) > 0xFF){
					blueN2 = blueN;
				}
				newColor = "#" + redN2 + greenN2 + blueN2;
				tmp = newColor;
				colors.push(newColor);
			}
		}
		
		 
		if (!smallText.hasOwnProperty("amount")) {
			var smallTextAmt = data0Val;
		}
		else {
			var smallTextAmt = smallText["amount"];
		}
		if (!smallText.hasOwnProperty("index")) {
			smallText["index"] = (data.length > 1) ? 1 : 0 ;
		}
		
		if (dataMap) {
			data.map(d => {
				return dataMap(d,data);
			});
		}
		
    	var dataset = extractValue(data,null,valCol);
    	//convert the dataset into values
    	dataset = dataset.map(item => {
    		if (!isNaN(item)) {
    			return Number(item);
    		}
    		else {
    			return item;
    		}
    	});
    	
    	// Big text
    	// ------------------------------
        
        var formatlargeText = "";
        
        formatlargeText = measureFormat(largeText.format, measureDisplay);
        
        var topLabelValue;
        var largeTextVal, largeTextDesc = "", largeTextValInit = "";
        
        //check if it has value on largeText
    	var lg = largeText["valueDimension"];
    	var li = 0;
    	//check if the value is numeric (want to have different amount)
    	if (typeof lg === 'number') {
    		largeTextValInit = 0;
    		largeTextVal = lg;
    	}
    	else {        		
        	//if it has index on largeText
    		li = largeText["index"];
    		if (data.length) {
            	if ($.isNumeric(li)) {
            		largeTextVal = extractValue(data,null,lg)[li];
            	}
            	else {
            		var lobj = {};
            		lobj[lg] = li;
            		largeTextVal = extractValue(data,lobj,lg)[0];
            	}    			
    		}
    		else {
    			largeTextVal = 0;
    		}
    		
        	if (typeof largeTextVal === 'number') {
        		largeTextValInit = 0
        	}
        	else {
        		largeTextValInit = largeTextVal;
        	}
    	}
        
        //if it has map on largeText
        if (largeText.hasOwnProperty("mapVal")) {
        	if (typeof largeTextVal === 'number'){
        		var param = [largeTextVal];
        		dataset.forEach(item => {
        			param.push(item);
        		});
        		largeTextVal = largeText.mapVal.apply(this, param);
        	}
        	
        }
                
        //text on largeText
    	largeTextValInit = largeText["text"].replace("{value}", largeTextValInit);
        
    	//create text html
    	var labelBox = middleBox.append("div").attr("class","label-box");
        var topLabel = labelBox.append("h2")
    		.attr("class","ddb-kpi-bigtext")
    		.text(largeTextValInit);
        
        
    	// Bottom label
    	// ------------------------------
    	
        if (smallText !== null) {
            var bottomLabel, bottomLabelValue;
            var formatsmallText = d3.format(",f");
        	
            formatsmallText = measureFormat(smallText.format, measureDisplay);
            
            var smallTextVal, smallTextDesc = "", smallTextValInit = "";
            
            //check if it has value on smallText
        	var lg = smallText["valueDimension"];
        	var li = 0;
        	//check if the value is numeric (want to have different amount)
        	
        	if (typeof lg === 'number') {
        		smallTextValInit = 0;
        		smallTextVal = lg;
        	}
        	else {        		
            	//if it has index on largeText
        		if (data.length) {
            		li = smallText["index"];
                	if ($.isNumeric(li)) {
                		smallTextVal = extractValue(data,null,lg)[li];
                	}
                	else {
                		var lobj = {};
                		lobj[lg] = li;
                		smallTextVal = extractValue(data,lobj,lg)[0];
                	}        			
        		}
        		else {
        			smallTextVal = 0;
        		}
            	
            	if (typeof smallTextVal === 'number') {
            		smallTextValInit = 0
            	}
            	else {
            		smallTextValInit = smallTextVal;
            	}
        	}
            
            //if it has map on smallText
        	if (typeof smallTextVal === 'number'){
        		var param = [smallTextVal, smallTextAmt];
        		dataset.forEach(item => {
        			param.push(item);
        		});
        		smallTextVal = smallText.mapVal.apply(this, param);
        	}
            
            //if it has text on smallText
        	smallTextValInit = smallText["text"].replace("{value}", formatsmallText(smallTextValInit));
            //if it has sign on smallText
            var smallTextSign = "";
        	var sp, sn, so;
    		sp = smallText["sign"]["positive"];
    		sn = smallText["sign"]["negative"];
    		so = smallText["sign"]["neutral"];
            	
        	smallTextSign =  smallTextVal > 0 ? sp : smallTextVal < 0 ? sn : so;
        	smallTextValInit = smallTextValInit.replace("{sign}", smallTextSign);
        	
            //var diffPoint = "";
            
        	var cp, cn, co;
    		cp = 'positive'; // "#00aa00";
    		cn = 'negative'; //"#cc0000";
    		co = 'neutral'; //"#000000";
        	var smallTextColor =  smallTextVal > 0 ? cp : smallTextVal < 0 ? cn : co;
            
        	//diffPoint = diff >= 0 ? "▲" : "▼";
        	bottomLabel = labelBox.append("p")
        		.attr('class',smallTextColor + " ddb-kpi-smalltext")
            		//.text(smallTextValInit);
        		.text(smallTextValInit);
        }        
        
            // Animate path
        
        function updateProgress(progress, topVal) {
        	
        	if (typeof largeTextVal === 'number') {
        		var fProgress = formatlargeText(progress);
        		if (largeText.format === 'short') { //add space between number and suffix
        			fProgress = fProgress.replace("G","B");
        			if (fProgress[fProgress.length - 1].search(/[a-z]/i) >= 0) {
        				fProgress = fProgress.substring(0,fProgress.length - 1) + " " + fProgress[fProgress.length - 1];
        			}
        		}
            	var valProgress = largeText["text"].replace("{value}", fProgress);
                topLabel.text(valProgress);
        	}
        	if (smallText !== null) {
        		if (topVal != 0) {
            		var fProgress = formatsmallText((progress)/topVal * Math.abs(smallTextVal));
            		if (smallText.format === 'short') { //add space between number and suffix
            			fProgress = fProgress.replace("G","B");
            			if (fProgress[fProgress.length - 1].search(/[a-z]/i) >= 0) {
            				fProgress = fProgress.substring(0,fProgress.length - 1) + " " + fProgress[fProgress.length - 1];
            			}
            		}
            		var smallProg = smallText["text"].replace("{value}", fProgress).replace("{sign}", smallTextSign);
            		bottomLabel.text(smallProg);        			
        		}
        	}
        }
        
        // Animate text
        var progress = 0;
        if (typeof largeTextVal === 'number') {
        	var ct0 = largeTextVal;
        }
        else {
        	var ct0 = 100;
        }
        var ct = ct0;
        var step = ct / 90;
        (function loops() {
            if (ct > 0) {
                ct -= step;
                progress += step;
                setTimeout(loops, 10);
            }
            else if (ct < 0) {
            	progress = ct0;
            }
            updateProgress(progress, ct0);
        })();    
        
        // Define main variables
        var spacePct = 0.42;
        //width = d3Container.node().getBoundingClientRect().width - margin.left - margin.right;
        width = Number(d3Container.attr("data-width"));
        // Horizontal
        var x = d3.scale.ordinal()
            .domain(d3.range(dataset.length))
            .rangeRoundBands([-20, width+20], spacePct);

        // Vertical
        var yMinVal =  d3.max(dataset) ?  d3.max(dataset) : 100;
        var y = d3.scale.linear()
            .domain([yMinVal * (-0.02), yMinVal])
            .range([0, height]);
        
        // Create axes
        // ------------------------------

        // Horizontal
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");



        // Create chart
        // ------------------------------

        // Add SVG element
        var container = middleBox.append("svg");

        // Add SVG group
        var svg = container
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("overflow","visible")
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Add tooltip
        // ------------------------------

        // Create tooltip
        if (tooltip !== null) {
        	if (typeof tooltip === "string"){
        		if (tooltip === '') {
        			var tip = d3.tip()
        			.attr('class', 'd3-tip')
        			.offset([-10, 0])
    	            .html(function(d,i) { 
    	            	var content = "";
    	            	for (var key in data[i]) {
    	            		if (data[i].hasOwnProperty(key)) {
                				if (key === valCol) {
                					var fValue = format2(data[i][key]);
                	        		if (lf === 'short') { //add space between number and suffix
                	        			fValue = fValue.replace("G","B");
                	        			if (fValue[fValue.length - 1].search(/[a-z]/i) >= 0) {
                	        				fValue = fValue.substring(0,fValue.length - 1) + " " + fValue[fValue.length - 1];
                	        			}
                	        		}
                					content += key + ": " + fValue + ", ";
                				}
                				else {
                					content += key + ": " + data[i][key] + ", ";
                				}
    	            		}
    	            	}
    	            	if (content.length) {
    	            		content = content.trim().replace(/,+$/,"")
    	            	}
    	            	return content;
    	            });	           			
        		}
        		else {
            		var tip = d3.tip()
    		            .attr('class', 'd3-tip')
    		            .offset([-10, 0])
    		            .html(d => {
    		            	return tooltip;
    	            });
        		}
        	}
        	else {
    	        var tip = d3.tip()
    	            .attr('class', 'd3-tip')
    	            .offset([-10, 0])
    	            .html(function(d,i) { 
    	            	var content = "";
    	            	for (var key in data[i]) {
    	            		if (data[i].hasOwnProperty(key)) {
    	            			if (tooltip.hasOwnProperty(key)) {
    	            				if (key === valCol) {
    	            					content += tooltip[key] + ": " + format2(data[i][key]) + ", ";
    	            				}
    	            				else {
    	            					content += tooltip[key] + ": " + data[i][key] + ", ";
    	            				}
    	            			}
    	            		}
    	            	}
    	            	if (content.length) {
    	            		content = content.trim().replace(/,+$/,"")
    	            	}
    	            	return content;
    	            });
        	}
            // Initialize tooltip
            svg.call(tip);
            if (labelBar.hasOwnProperty("bottom")) {
            	if (typeof labelBar.bottom == 'object') {
            		var lb = labelBar.bottom;
            		var ldim = xDimension;
            		if (lb.dimension) {
            			ldim = lb.dimension;
            		}
            		var ltp = '{value}';
            		if (lb.tooltip) {
            			ltp = lb.tooltip;
            		}
            		var datasetA = (extractValue(data,null,ldim));
        	        var tipLabel = d3.tip()
	                	.attr("class",'d3-tip label-tip')
	                	.html((d,i) => {
	                		if (typeof ltp == 'function') {
	                			var ret = ltp(datasetA[i],i);
	                		}
	                		else {
	                			var ret = ltp.replace('{value}',datasetA[i]); 
	                		}
	                		return ret;
	                	});
        	        svg.call(tipLabel);	        	            		        	        
            	}
            	else {
                	var datasetA = (extractValue(data,null,labelBar["bottom"]));
        	        var tipLabel = d3.tip()
	                	.attr("class",'d3-tip label-tip')
	                	.html((d,i) => {
	                		return datasetA[i];
	                	});
        	        svg.call(tipLabel);	        	            		
            	}
            }
        }
        //
        // Append chart elements
        //

        // Append bars
        // ------------------------------

        // Add bars
        var drawBars = svg.selectAll(".d3-bar")
            .data(dataset)
            .enter()
            .append("rect")
                .attr("class", "d3-bar")
                .attr("x", function(d, i) { return x(i) })
                .attr("width", x.rangeBand())
                .attr("height", 0)
                .attr("y", height)
                .attr("fill", function(d, i) {return colors[i]; })
                .style("cursor", "pointer")
                .on('mouseover', ((tooltip!==null) ? tip.show: null))
                .on('mouseout', ((tooltip!==null) ? tip.hide: null))

        // Add bar transition
        drawBars.transition()
            .delay(200)
            .duration(1000)
            .attr("height", function(d) { return y(d)})
            .attr("y", function(d) { return height - y(d) });

        //adds click event
        if (Array.isArray(drawBars)){
        	drawBars.forEach(bar => {
                $(bar).on("click", e => {
                	if (typeof arg._onBarsClick == 'function') {
                		arg._onBarsClick(arg, e, name);
                	}
                });        		
        	});
        }
        else {
        	$(drawBars).on("click", e => {
            	if (typeof arg._onBarsClick == 'function') {
            		arg._onBarsClick(arg, e, name); //arg - return parameters, e - click event, name - name of graph
            	}        		
        	})
        }

        // Add text labels
        var drawLabels = {};
        if (labelBar === null) {

        }
        else {
        	var count = 0
        	for (var key in labelBar) {
        		if (labelBar.hasOwnProperty(key)) {
        			var lb = labelBar[key];
        			var lbdim = "";
        			if (typeof lb == 'object') {
        				 if (lb.dimension) {
        					 lbdim = lb.dimension;
        				 }
        				 else {
        					 switch (key){
        					 case "top":
        						 lbdim = valCol;
        						 break;
        					 case "bottom":
        						 lbdim =  xDimension;
        					 }
        				 }
        			}
        			else {
        				lbdim = lb;
        			}
        			var datasetX = (extractValue(data,null,lbdim));
    		        drawLabels[key] = svg.selectAll(".value-label" + count)
    		        	.data(dataset)
    		            .enter()
    		            .append("text")
    		                .attr("class", "ddb-kpi-label " + key)
    		                .attr("x", function(d, i) {return x(i) + x.rangeBand() / 2 })
    		                .attr("y", function(d) {
    		        			var yOffset = y(d);
    		        			switch (key) {
    		        			case "top":
    		        				yOffset += 8;
    		        				break;
    		        			case "bottom":
    		        				yOffset = -10;
    		        				break;
    		        			case "top-in":
    		        				yOffset -= 15;
    		        				break;
    		        			}			                
    		                	return height - yOffset; 
    		                	})
    		                .style('opacity', 0)
    		                .text(function(d,i) {
    		                	
    		                	if (labelBar[key] === valCol) {
    		                		var fValue = format(datasetX[i]);
    		                		if (measureDisplay === 'short') { //add space between number and suffix
    		                			fValue = fValue.replace("G","B");
    		                			if (fValue[fValue.length - 1].search(/[a-z]/i) >= 0) {
    		                				fValue = fValue.substring(0,fValue.length - 1) + " " + fValue[fValue.length - 1];
    		                			}
    		                		}
    		                		if (labelBar.valueText && key !== "bottom") {
    		                			fValue = labelBar.valueText.replace("{value}",fValue)
    		                		}
    		                		return fValue;
    		                	}
    		                	else {
    		                		if (key === "bottom") {
    			                		if (datasetX.length > 4) {
    			                			var tmp = datasetX[i];
    		                				return tmp.substr(0,4) + (tmp.length > 4?"…":"");
    			                		}
    			                		else {
    			                			return datasetX[i];
    			                		}			                			
    		                		}
    		                	}
    		                	
    		                });
    		        if (key === "bottom") {
    		        	drawLabels[key]
    	                	.on('mouseover', ((tooltip!==null) ? tipLabel.show: null))
    	                	.on('mouseout', ((tooltip!==null) ? tipLabel.hide: null));			        	
    		        }
    	
    		        // Add text label transition
    		        drawLabels[key].transition()
    		            .delay(1000)
    		            .duration(500)
    		            .style('opacity', 1);
    		        count += 1;
        		}
        	}
        }
        // Create axes
        // ------------------------------
        var drawLines = svg.append("line")
        	.attr("x1", -10)
        	.attr("y1", height)
        	.attr("x2", width + 10)
        	.attr("y2", height)
        	.attr("class", "ddb-kpi-hline")
        	
        // Horizontal
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        // Create mini charts below
        if (lineChart) {
        	
        	if (!lineChart.hasOwnProperty("element")) {
        		lineChart["element"] = elementChartL;
        	}
    		bottomBox.append("div")
    			.attr("id",elementChartL.substr(1));
        	if (!lineChart.hasOwnProperty("data")) {
        		lineChart["data"] = data;
        	}
        	if (!lineChart.hasOwnProperty("margin")) {
        		lineChart["margin"] = {};
        		lineChart["margin"].top = 10;
        		lineChart["margin"].bottom = 10;
        		lineChart["margin"].left = margin.left - 10;
        		lineChart["margin"].right = margin.right - 10;
        	}
        	lineChart["responsive"] = responsive;
        	lineChart.height = smHeight;
        	kpiMiniLineChart(lineChart);
        }
        // Create mini charts below
        if (barChart) {
        	if (!barChart.hasOwnProperty("element")) {
        		barChart["element"] = elementChartB;
        	}
    		var mbarBox = bottomBox.append("div")
    			.attr("id",elementChartB.substr(1));
    		mbarBox.attr("data-width",width - 45);
        	if (!barChart.hasOwnProperty("data")) {
        		barChart["data"] = data;
        	}
        	if (!barChart.hasOwnProperty("margin")) {
        		barChart["margin"] = {};
        		barChart["margin"].top = 10;
        		barChart["margin"].bottom = 5;
        		barChart["margin"].left = margin.left + 20;
        		//barChart["margin"].right = margin.right + 20;
        	}
        	
        	if (!barChart.hasOwnProperty("color")) { 
        		barChart["color"]  = colors[0];
        	}
        	barChart["responsive"] = responsive;
        	barChart.height = smHeight;
        	kpiMiniBarChart(barChart);
        }
            
        // Call function on window resize
        if (responsive) {
        	$(window).on('resize click', resize);
        }
        

        function resize() {

            width = d3Container.node().getBoundingClientRect().width - margin.left - margin.right;
            
            container.attr("width", width + margin.left + margin.right);
            svg.attr("width", width + margin.left + margin.right);
            
            x.rangeRoundBands([-20, width+20], spacePct);
            svg.selectAll('.d3-axis-horizontal').call(xAxis);
            for (var key in drawLabels) {
            	if (drawLabels.hasOwnProperty(key)) {
            		drawLabels[key].attr("x", function(d, i) {return x(i) + x.rangeBand() / 2 })
            	}
            }
            drawLines.attr("x2", width + 10)
            
            svg.selectAll('.d3-bar').attr("x", function(d, i) { return x(i) }).attr("width", x.rangeBand())
            svg.selectAll(".value-label").attr("x", function(d, i) { return x(i) + x.rangeBand() / 2 });
        }
        
    	if (typeof arg._onDone == 'function') {
    		arg._onDone(arg,true);
    	}        
    }, rj => {
    	if (typeof arg._onDone == 'function') {
    		arg._onDone(arg,false, rj);
    	}            	
    });    

    function chooseKpiClick(event) {
    	$e = $(event.currentTarget);
    	selected = chooseList[$e.data("index")];
    	var info = {};
    	for (var key in arg) {
    		if (arg.hasOwnProperty(key)) {
    			if (key === "barChart" || key === "lineChart") {
					info[key] = {};
    				var tmp = arg[key];
    				for (var key2 in tmp) {
    					if (tmp.hasOwnProperty(key2)) {
    						info[key][key2] = tmp[key2];
    					}
    				}    				
    			}
    			else {
    				if (key === 'title' && !selected.hasOwnProperty("title")){
    					//do nothing
    				}
    				else {
    					info[key] = arg[key];
    				}
    				
    			}
    		}
    	}

    	//remove data
    	if (!selected.data) {
    		delete info.data;
    	}
    	
    	for (var key in selected) {
    		if (selected.hasOwnProperty(key)) {
    			if (key === "barChart" || key === "lineChart") {
    				var tmp = selected[key];
    				for (var key2 in tmp) { 
    					if (tmp.hasOwnProperty(key2)) { }
    					info[key][key2] = tmp[key2];
    				}
    				
    	        	if (!selected[key].hasOwnProperty("color")) {
    	        		var c = colors[0];
    	        		if (selected.hasOwnProperty("colors")){
    	        			c = selected.colors;
    	        		}
    	            	if (typeof c !== 'string') {
    	            		c = c[0]; //convert into array
    	            	}        	        		
    	        		info[key]["color"]  = c;
    	        	}        	        				
    			}
    			else {
    				info[key] = selected[key];
    			}
    		}
    	}

    	//need to override the element name
    	if (info.element) {
    		info.element = arg.element;
    	}
    	if (info.lineChart) {
    		info.lineChart.element = arg.elementChartL;
    	}
    	if (info.barChart) {
    		info.barChart.element = arg.elementChartB;
    	}
    	
    	arg._currentName = selected.name;
    	//arg._currentFilter = selected.filter;
        kpiBarChart(info);          	
    } 
    
    function measureFormat(ms, df = null) {
    	if (!df) {
    		df = ms;
    	}
        switch (ms)
        {
        case "default":
        	return d3.format(",f"); 
        case "short":
        	return d3.format(",.3s");
        	break;
        case "percent":
        	return d3.format(".1%");
        	break;
        default:
        	if (ms) {
        		return d3.format(df);
        	}
        }    	
    }
    
    //methods
    arg.refresh = function(arg2 = null){
    	//remove the data and dataPromise
    	if (arg.name !== arg._currentName) {
    		var cur = null;
    		for (var i = 0; i < chooseList.length; i++) {
    			if (chooseList[i].name == arg._currentName) {
    				//create a deep copy
    				cur = {};
    				var tmp = chooseList[i];
    	        	for (var key in tmp) {
    	        		if (tmp.hasOwnProperty(key)) {
    	        			if (key === "barChart" || key === "lineChart") {
    	    					cur[key] = {};
    	        				var tmp2 = tmp[key];
    	        				for (var key2 in tmp2) {
    	        					if (tmp2.hasOwnProperty(key2)) {
    	        						cur[key][key2] = tmp2[key2];
    	        					}
    	        				}    				
    	        			}
    	        			else {
    	        				if (key !== 'title') {
    	        					cur[key] = tmp[key];
    	        				}
    	        			}
    	        		}
    	        	}  
    				//cur = chooseList[i];
    				break;
    			}
    		}  		
    		if (cur) {
            	if (arg2) {
                	if (arg2.dataPromise) {
                		delete cur.data;
                	}
                	else {
                		delete cur.dataPromise;
                	}
                	for (var key in arg2) {
                		if (arg2.hasOwnProperty(key)) {
                			cur[key] = arg2[key];
                		}
                	}    		
        		}
            	//need to override the element name
            	if (cur.element) {
            		cur.element = arg.element;
            	}
            	if (cur.lineChart) {
            		cur.lineChart.element = arg.elementChartL;
            	}
            	if (cur.barChart) {
            		cur.barChart.element = arg.elementChartB;
            	}
            	
            	kpiBarChart(cur);
    		}
    	}
    	else {
        	if (arg2) {
        		
            	if (arg2.dataPromise) {
            		delete arg.data;
            	}
            	else {
            		delete arg.dataPromise;
            	}
            	for (var key in arg2) {
            		if (arg2.hasOwnProperty(key)) {
            			arg[key] = arg2[key];
            		}
            	}    		
    		}
    		kpiBarChart(arg);
    	}
    	
    	return arg;
    };
    
    return arg;
}    

function kpiMiniLineChart(arg) {
	 /* arg-element: string, required, element ID in HTML
	 * 		data: object, required, data in JSON format
	 * 		valueColumn: string, key in data contains numeric value; default = "Value"
	 * 		colors: string, color number in hex #RRGGBB; default = "" (black), can be configure in css using .ddb-kpi-area
	 * 		height: number, height of the graph ; default = 60
	 * 		measureDisplay: string, number format for values; defalut = "default"; valid values = "default", "short", "percent"
	 * 		margin: object, margin of the entire chart
	 * 			top: default = 10
	 * 			right: default = 0
	 * 			bottom: default = 5
	 * 			left: default = 0
	 */
	
	//initialize variables
	var element = arg.element;
	var data = arg.data;
	var measureDisplay = "default";
	var valCol = "Value"
    	if (arg.hasOwnProperty("valueColumn")) {
    		valCol = arg.valueColumn;
    	};
	
	var height = 70;
	if (arg.hasOwnProperty("height")) {
		height = arg.height;
	}

	var color = "", colorL = "";
	if (arg.hasOwnProperty("color")) {
		color = arg.color;
		colorL = addHexColor(color.substring(1),"-101010");
		if (parseInt("0x" + colorL) < 0) {
			colorL = "0";
		}
	}
	var margin = {"top":10, "right":0, "bottom":5, "left":0};
	if (arg.hasOwnProperty("margin")) {
		var mg = arg["margin"];
		if (mg.hasOwnProperty("top")) {
			margin.top = mg.top;
		}
		if (mg.hasOwnProperty("right")) {
			margin.right = mg.right;
		}
		if (mg.hasOwnProperty("bottom")) {
			margin.bottom = mg.bottom;
		}    		
		if (mg.hasOwnProperty("left")) {
			margin.left = mg.left;
		}
		
	}    	
	var tooltip = "";
	if (arg.hasOwnProperty("tooltip")){
		tooltip = arg.tooltip;
	}
    var format = d3.format(",f");
    switch (measureDisplay)
    {
    case "default":
    	format = d3.format(",f"); 
    	break;
    case "short":
    	format = d3.format(",.3s");
    	break;
    case "percent":
    	format = d3.format(".0%");
    	break;
    default:
    	if (measureDisplay) {
    		format = d3.format(measureDisplay);
    	}
    }
	var responsive = false;
	if (arg.hasOwnProperty("responsive")) {
		responsive = arg.responsive;
	}
    // Demo data set
    var dataset = extractValue(data,null,valCol);
    dataset = dataset.concat(dataset[dataset.length - 1]);

    // Basic setup
    // ------------------------------

    // Define main variables
	
    var d3Container = d3.select(element);
    if (!d3Container[0][0]) {
 	   arg._loading = "failed";
 	   return arg;
    }    
    var margin = {"top": margin.top, "right": margin.right, "bottom": margin.bottom, "left": margin.left},
        width = d3Container.node().getBoundingClientRect().width - margin.left - margin.right,
        height = height - margin.top - margin.bottom - 5;

    // Construct scales
    // ------------------------------

    // Horizontal   
    var x = d3.scale.ordinal()
    	.domain(d3.range(dataset.length - 1))
    	.rangePoints([0,width]);
    
    // Vertical
    var y = d3.scale.linear()
    	.domain([0, d3.max(data, function(d) {return d[valCol]; })])
        .range([height, 0]);

    // Colors

    // Create axes
    // ------------------------------

    // Horizontal
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
    	.scale(y);
    
    var container = d3Container.append("svg");

    var svg = container
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("overflow","visible")
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var area = d3.svg.area()
        .x(function(d,i) {return x(i); })
        .y0(height)
        .y1(height);
    
    
    var drawArea = svg.append("path")
    	.datum(data)
    	.attr("class", "d3-area ddb-kpi-area")
    	.attr("d", area);           
       	
    if (color !== '') {
    	drawArea.style("fill", color);
    	drawArea.style("stroke", colorL);
    }
    
    // Add bar transition
    drawArea.transition()
        .delay(200)
        .duration(1000)
        .attr("d", d3.svg.area()
    	        .x(function(d, i) {return x(i); })
    	        .y0(height)
    	        .y1(function(d) { return y(d.Value); })
        );

    
    if (tooltip !== null) {
    	if (typeof tooltip === 'object') {
	        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d,i) { 
            	var content = "";
            	for (var key in data[i]) {
            		if (data[i].hasOwnProperty(key)) {
            			if (tooltip.hasOwnProperty(key)) {
        					var fValue = format(data[i][key]);
        	        		if (measureDisplay === 'short') { //add space between number and suffix
        	        			fValue = fValue.replace("G","B");
        	        			if (fValue[fValue.length - 1].search(/[a-z]/i) >= 0) {
        	        				fValue = fValue.substring(0,fValue.length - 1) + " " + fValue[fValue.length - 1];
        	        			}
        	        		} 	            				
            				if (key === valCol) {
            					content += tooltip[key] + ": " + fValue + ", ";
            				}
            				else {
            					content += tooltip[key] + ": " + data[i][key] + ", ";
            				}
            			}
            		}
            	}
            	if (content.length) {
            		content = content.trim().replace(/,+$/,"")
            	}
            	return content;
            });
	        svg.call(tip);
    	}
    	else {
			var tip = d3.tip()
				.attr('class', 'd3-tip trend-graph-tip')
				.offset([-5,0])
				.html((d,i) => { 
					var content = "";
	            	for (var key in data[i]) {
	            		if (data[i].hasOwnProperty(key)) {
	        				if (key === valCol) {
	        					var fValue = format(data[i][key]);
	        	        		if (measureDisplay === 'short') { //add space between number and suffix
	        	        			fValue = fValue.replace("G","B");
	        	        			if (fValue[fValue.length - 1].search(/[a-z]/i) >= 0) {
	        	        				fValue = fValue.substring(0,fValue.length - 1) + " " + fValue[fValue.length - 1];
	        	        			}
	        	        		}        					
	        					content += key + ": " + fValue + ", ";
	        				}
	        				else {
	        					content += key + ": " + data[i][key] + ", ";
	        				}
	            		}
	            	}
	            	if (content.length) {
	            		content = content.trim().replace(/,+$/,"")
	            	}
	            	return content;				
				});
			svg.call(tip);
    	}
    }
	
	var tipOverlay = svg.selectAll(".d3-tip-overlay")
		.data(data)
		.enter()
		.append("circle")
		.attr("class", "d3-tip-overlay")
            .attr("cx", function(d, i) { return x(i) })
            .attr("r", 5)
            .attr("fill", "#aaa")
            .attr("opacity","0")
            .style("cursor", "pointer")
            .attr("stroke-width","0")
            .attr("cy", function(d) { return y(d[valCol]) })         
            .on('mouseover',((tooltip!==null) ? tip.show: null))
            .on('mouseout', ((tooltip!==null) ? tip.hide: null))
    	
    // Horizontal
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
        
	if (responsive) {
		$(window).on('resize click', resize);
	}
	
    function resize() {

        // Layout variables
        width = d3Container.node().getBoundingClientRect().width - margin.left - margin.right;
        container.attr("width", width + margin.left + margin.right);
        svg.attr("width", width + margin.left + margin.right)
        x.rangeRoundBands([-5, width + 25], 0);
        drawArea.attr("d", d3.svg.area()
        		.x(function(d, i) {return x(i); })
        		.y0(height)
        		.y1(function(d) { return y(d.Value); })
        		);
    }

	arg.loading = "success";
	return arg;    
}      

function kpiMiniBarChart(arg) {
 /* arg-element: string, required, element ID in HTML
 * 		data: object, required, data in JSON format
 * 		xDimension: string default, x axis dimension
 * 		valueColumn: string, key in data contains numeric value; default = "Value"
 * 		filter: optional, filter data by keys (e.g. {"Account": "REVENUE", "VERSION":"BUDGET"), prefix with '/' to use RegExp for filtering (e.g. {"Account": "/REV*"})
 * 		sumDimensions: optional, sum up based on intersection and overrides the member, similar to replc in sliceIntersectData
 * 		sumType: optional, if the result from sumDimension do total or average, valid values = sum, average. 
 * 		scaling: optional, multiply values by amount. 
 * 		staticMembers: optional, similar to sliceIntersectData memIntrx parameter
 * 		colors: string, color number in hex #RRGGBB; default = "" (black), can be configure in css using .ddb-kpi-area
 * 		height: number, height of the graph ; default = 60
 * 		measureDisplay: string, number format for values; defalut = "default"; valid values = "default", "short", "percent"
 * 		margin: object, margin of the entire chart
 * 			top: default = 10
 * 			right: default = 0
 * 			bottom: default = 5
 * 			left: default = 0
 */

//initialize variables
	var element = arg.element;
	var data = arg.data;
	var filter = arg.filter ? arg.filter : null;
	var staticMembers = arg.staticMembers ? arg.staticMembers : null;
	var sumDimensions = arg.sumDimensions ? arg.sumDimensions : null;
	var sumType = arg.sumType ? arg.sumType : null;
	var scaling = arg.scaling ? arg.scaling : null;	
	var valCol = arg.hasOwnProperty("valueDimension")? arg.valueDimension: "Value";	
	var dataPromise = null;
	if (arg.data) {
		if (data instanceof Promise) { 
			dataPromise = data;
			var dataPromise2 = new Promise((response,reject) => {
				dataPromise.then(rs => {
					arg.data = rs;
					if (filter || sumDimensions || staticMembers || scaling) {
						data = sliceIntersectData(rs, filter, sumDimensions, staticMembers, valCol, sumType, scaling);
					}
					else {
						data = rs;
					}
					response(true);
				});
			});				
		}
		else {
			var dataPromise2 = new Promise((response, reject) => {
				if (filter || sumDimensions || staticMembers || scaling) {
					data = sliceIntersectData(arg.data, filter, sumDimensions, staticMembers, valCol, sumType, scaling);
				}
				else {
					data = arg.data;
				}
				response(true);
			})			
		}
	}
	
	
	var measureDisplay = arg.measureDisplay ? arg.measureDisplay: "default";
	var height = arg.hasOwnProperty("height") ? arg.height : 58;
	var color = arg.hasOwnProperty("color") ? arg.color : "";
	var margin = {"top":10, "right":0, "bottom":5, "left":0};
	if (arg.hasOwnProperty("margin")) {
		var mg = arg["margin"];
		if (mg.hasOwnProperty("top")) {
			margin.top = mg.top;
		}
		if (mg.hasOwnProperty("right")) {
			margin.right = mg.right;
		}
		if (mg.hasOwnProperty("bottom")) {
			margin.bottom = mg.bottom;
		}    		
		if (mg.hasOwnProperty("left")) {
			margin.left = mg.left;
		}
		
	}    	
	var tooltip = arg.hasOwnProperty("tooltip") ? arg.tooltip : "";
	var responsive = arg.hasOwnProperty("responsive") ? arg.responsive : false;
	var format = d3.format(",f");
	switch (measureDisplay)
	{
	case "default":
	format = d3.format(",f"); 
	   	break;
	   case "short":
	format = d3.format(",.3s");
	   	break;
	   case "percent":
	format = d3.format(".0%");
	       	break;
	       default:
	       	if (measureDisplay) {
	       		format = d3.format(measureDisplay);
	       	}
	   }

   var d3Container = d3.select(element).append("div").attr("class","mini-bar-graph");
   if (!d3Container[0][0]) {
	   arg._loading = "failed";
	   return arg;
   }

  
   var fixedWidth = Number(d3.select(element).attr("data-width"));
   var margin = {"top": margin.top, "right": margin.right, "bottom": margin.bottom, "left": margin.left},
       height = height - margin.top - margin.bottom - 5;
   var width = (arg.width ? arg.width : d3Container.node().getBoundingClientRect().width) - margin.left - margin.right;
   if (fixedWidth) {
	   width = fixedWidth ;
   }
   
   var loadingScreen = d3Container.append("div")
   		.attr("class","loading-screen");
   loadingScreen.append("div");
   loadingScreen.append("svg")
       .attr("width", width + margin.left + margin.right)
	   .attr("height", height + margin.top + margin.bottom);
   
   //event variables
   //arg._onDone = null;
   if (!arg.activeEvents) {
	   arg.activeEvents = [];
   }
   
   //event fucntion setting
   arg.on = (e, f) => { //parameters: e -> event name, f -> function callback
	   	switch(e) {
	   	case 'done':
	   		arg._onDone = f;
	   		break;
	   	case 'bars:click':
	   		arg._onBarsClick = f;
	   		break;
	   	}
	   	arg.activeEvents.push(e);
	   	return arg;
   }
   
   if (arg._on) { //store the on events because the chart is not yet initialized, used by the parent function
	   arg._on.forEach(d => {
		   arg.on(d[0],d[1]);
	   });
	   delete arg._on;
   }

   dataPromise2.then(rs => {
	   loadingScreen.style("display","none");
	   // Horizontal
	   var dataset = extractValue(data,null,valCol);
	   	//convert the dataset into values
	   	dataset = dataset.map(item => {
	   		if (!isNaN(item)) {
	   			return Number(item);
	   		}
	   		else {
	   			return item;
	   		}
	   	})	   
	   var spacePct = 0.55;
	   var x = d3.scale.ordinal()
	   		.domain(d3.range(dataset.length))
	   		.rangeRoundBands([-20, width+20], spacePct);
	   
	   // Vertical
	   var yMin = d3.max(dataset) ? d3.max(dataset) : 100;
	   var y = d3.scale.linear()
		   .domain([yMin * (-0.02), yMin])
		   .range([0, height]);

	   var xAxis = d3.svg.axis()
	       .scale(x)
	       .orient("bottom");

	   var yAxis = d3.svg.axis()
	   	.scale(y);	   
	   
	   var container = d3Container.append("svg");

	   var svg = container
	       .attr("width", width + margin.left + margin.right)
	       .attr("height", height + margin.top + margin.bottom)
	       .style("overflow","visible")
	       .append("g")
	           .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	   
	   // Create tooltip
	   if (tooltip !== null) {
	   		if (typeof tooltip === 'object') {
		        var tip = d3.tip()
		            .attr('class', 'd3-tip')
		            .offset([-10, 0])
		            .html(function(d,i) {
		            	var content = "";
			            	for (var key in data[i]) {
			            		if (data[i].hasOwnProperty(key)) {
			            			if (tooltip.hasOwnProperty(key)) {
			            				if (key === valCol) {
				        					var fValue = format(data[i][key]);
				        	        		if (measureDisplay === 'short') { //add space between number and suffix
				        	        			fValue = fValue.replace("G","B");
				        	        			if (fValue[fValue.length - 1].search(/[a-z]/i) >= 0) {
				        	        				fValue = fValue.substring(0,fValue.length - 1) + " " + fValue[fValue.length - 1];
				        	        			}
				        	        		} 			            					
			            					content += tooltip[key] + ": " + fValue + ", ";
			            				}
			            				else {
			            					content += tooltip[key] + ": " + data[i][key] + ", ";
			            				}
			            			}
			            		}
			            	}
			            	if (content.length) {
			            		content = content.trim().replace(/,+$/,"")
			            	}	            		
			            	return content;
		            });
		        svg.call(tip);
	   		}
	   		else if (typeof tooltip === 'function') {
	   			var tip = d3.tip()
		            .attr('class', 'd3-tip')
		            .offset([-10, 0])
		            .html(function(d,i) { 
		            	var ret = tooltip(d,i,data[i]);
		            	if (ret.search("{value}") > 0){
		            		var fValue = format(data[i][valCol]);
        	        		if (measureDisplay === 'short') { //add space between number and suffix
        	        			fValue = fValue.replace("G","B");
        	        			if (fValue[fValue.length - 1].search(/[a-z]/i) >= 0) {
        	        				fValue = fValue.substring(0,fValue.length - 1) + " " + fValue[fValue.length - 1];
        	        			}
        	        		}
        	        		ret = ret.replace("{value}",fValue);
		            	}
		            	return ret;
		            });
	   			svg.call(tip);
	   		}
	   		else {
				var tip = d3.tip()
					.attr('class', 'd3-tip trend-graph-tip')
					.offset([-5,0])
					.html((d,i) => { 
						var content = "";
		            	for (var key in data[i]) {
		            		if (data[i].hasOwnProperty(key)) {
		        				if (key === valCol) {
		        					var fValue = format(data[i][key]);
		        	        		if (measureDisplay === 'short') { //add space between number and suffix
		        	        			fValue = fValue.replace("G","B");
		        	        			if (fValue[fValue.length - 1].search(/[a-z]/i) >= 0) {
		        	        				fValue = fValue.substring(0,fValue.length - 1) + " " + fValue[fValue.length - 1];
		        	        			}
		        	        		}        					
		        					content += key + ": " + fValue + ", ";
		        				}
		        				else {
		        					content += key + ": " + data[i][key] + ", ";
		        				}
		            		}
		            	}
		            	if (content.length) {
		            		content = content.trim().replace(/,+$/,"")
		            	}
		            	return content;				
					});
				svg.call(tip);
	   		}
	   }	
	   
	   // Append bars
	   var drawBars = svg.selectAll(".d3-bar")
	       .data(dataset)
	       .enter()
	       .append("rect")
	           .attr("class", "d3-bar")
	           .attr("x", function(d, i) { return x(i) })
	           .attr("width", x.rangeBand())
	           .attr("height", 0)
	           .attr("y", height)
	           .attr("fill", function(d, i) {return color ? color: null; })
	           .style("cursor", "pointer")
	           .on('mouseover', ((tooltip!==null) ? tip.show: null))
	           .on('mouseout', ((tooltip!==null) ? tip.hide: null))     
	           
	    // Add bar transition
	    drawBars.transition()
	        .delay((d,i) => {return 500 * (i / data.length)})
	        .duration(1000)
	        .attr("height", function(d) { return y(d)})
	        .attr("y", function(d) { return height - y(d) })	           

        if (Array.isArray(drawBars)){
        	drawBars.forEach(bar => {
                $(bar).on("click", e => {
                	if (typeof arg._onBarsClick == 'function') {
                		arg._onBarsClick(arg, e, arg._name);
                	}
                });        		
        	});
        }
        else {
        	$(drawBars).on("click", e => {
            	if (typeof arg._onBarsClick == 'function') {
            		arg._onBarsClick(arg, e, arg._name); //arg - return parameters, e - click event, name - name of graph
            	}        		
        	})
        }	        
	        
	   // Horizontal
	   var xAxis = d3.svg.axis()
	       .scale(x)
	       .orient("bottom");
	       
	   // Call function on window resize
	   if (responsive) {
		   $(window).on('resize click', resize);
	   }
	   
	   function resize() {

	       width = d3Container.node().getBoundingClientRect().width - margin.left - margin.right;
	       container.attr("width", width + margin.left + margin.right);
	       svg.attr("width", width + margin.left + margin.right)
	       x.rangeRoundBands([-20, width+20], spacePct);
	       
	       svg.selectAll('.d3-bar').attr("x", function(d, i) { return x(i) }).attr("width", x.rangeBand())
	       
       	}	   
	   	if (typeof arg._onDone == 'function') {
			arg._onDone(arg,true);
		}        
	}, rj => {
		if (typeof arg._onDone == 'function') {
			arg._onDone(arg,false);
		}            	
	}); 
   		
   		arg.loading = "success";
   		return arg;
   }      
    
function trendCharts(arg) {
    	
    var element = "#" + arg.element;
	var tmp = arg.chartGroup, chartGroup = [];
	var margin = {"top":35, "right":25, "bottom":0, "left":50};
	var hasAmountOptions = arg.hasOwnProperty("hasAmountOptions") ? arg.hasAmountOptions : true; 
	var hasSideButtons = arg.hasOwnProperty("hasSideButtons") ? arg.hasSideButtons: true;
	if (arg.hasOwnProperty("margin")) {
		var mg = arg["margin"];
		if (mg.hasOwnProperty("top")) {
			margin.top = mg.top;
		}
		if (mg.hasOwnProperty("right")) {
			margin.right = mg.right + 15;
		}
		if (mg.hasOwnProperty("bottom")) {
			margin.bottom = mg.bottom;
		}    		
		if (mg.hasOwnProperty("left")) {
			margin.left = mg.left + 15;
		}
	}     	
	
	//merge global and local parameters
	arg.chartGroup.forEach(chartGrp => {
		var selections = chartGrp.selections;
		chartGrp._selections = $.extend(true,[],selections);
    	for (var key in chartGrp) {
    		if (chartGrp.hasOwnProperty(key)) {
    			if (key !== "name" && key !== "selected" && key !== "selections" && key !== "_selections") {
    				selections.forEach(item => { 
    					if (key !== "chartParam" && key !== "defaultOptions") {
    						if (!item.hasOwnProperty(key)) {
    							item[key] = chartGrp[key];
    						}
    					}
    					else {
    						var cPrm = chartGrp.defaultOptions ? chartGrp.defaultOptions : chartGrp.chartParam;
    						for (var key2 in cPrm) {
    							if (cPrm.hasOwnProperty(key2)) {
    								if (!item.chartParam.hasOwnProperty(key2)) {
    									item.chartParam[key2] = cPrm[key2];
    								}
    							}
    						}
    					}
    				});
    			}
    		}
    	}    	    		
	});
	
    var d3Container = d3.select(element),
    margin = {"top": margin.top, "right": margin.right, "bottom": margin.bottom, "left": margin.left},
    width = d3Container.node().getBoundingClientRect().width - margin.left - margin.right,
    height = height - margin.top - margin.bottom - 5;
    
    if (Array.isArray(tmp)) {
    	chartGroup.push(tmp);
    }
    else {
    	chartGroup = chartGroup.concat(tmp);
    }
    
    var topBox = d3Container.append("div").attr("class","top trend-top");
    var middleBox = d3Container.append("div").attr("class","middle trend-middle");
    var bottomBox = d3Container.append("div").attr("class","bottom trend-bottom");
    
    //build title and right buttons
    var titleBar = topBox.append("div")
    	.attr("class","ddb-trend-title graph-title")
    var titleIcon;
    
    var titleBarItems = titleBar.append("div").attr("class","title-container");
    var titleDesc = titleBarItems.append("h1");    
    
    //stores selected items
    var selGraphGrp = null, selGraphItem = null; selXAxis = null; selYAxis = null	    
    var periodBtns, titleBarBn, titleBarDD, hasGroupButtons;
    var graphCName = arg.element + "-gc";
    //build bottom buttons, process graph group
    buildMainButtons()
    
    function buildMainButtons() {
    	        
    	titleDesc.text("TEMP TITLE");         
    	titleBarItems.selectAll("div").remove();
    	
        titleBarDD = titleBarItems.append("div").attr("class","title-dropdown-box");
        titleBarBn = titleBarItems.append("div").attr("class","title-button-box");
        
        hasGroupButtons = chartGroup[0].length > 1;
        
	    var hasBtnDefSelect = false;
	    var btns = titleBarBn.append("ul").attr("class","nav nav-tabs nav-tabs-bottom bottom-divided trend-buttons");
	    chartGroup[0].forEach((argx,i)=> {
	    	var name = "CHART " + (i+1);
	    	var color = null, width = null, s = "";
	    	if (typeof argx === 'object') {
	        	if (argx.hasOwnProperty("name")){
	        		name = argx.name;
	        	}
	        	if (argx.hasOwnProperty("selected")){
	        		if (argx.selected) {
	        			s = "active";
	        			hasBtnDefSelect = true;
	        		} 
	        	}
	        	
	    	}
			if (hasGroupButtons) {
				var btn = btns.append("li")
					.attr("class","trend-button chart-select chart-select" + i)
					.attr("data-value", name);
				$(btn[0][0]).addClass(s);
				btn.append("a").attr("data-toggle","tab").text(name);
				$(btn[0][0]).on("click", d => {
					selGraphGrp = argx;
					buttonGGClickEvent(d,argx);
				})
			}
			if (s === "selected ") {
				selGraphGrp = argx;
			}
		});
	    
	    //if there is no selected indicated in chart group, set the first item as default
	    if (!hasBtnDefSelect) {
	    	selGraphGrp = chartGroup[0][0];
	    	$button = $(titleBarBn[0][0]).find("li");
	    	$($button[0]).addClass("active");        	
	    }
	    
	    //check button selection (hard coded)
	    topBox.selectAll("div.trend-y-select").remove();
	    if (hasAmountOptions) {
		    var optButtons = topBox.append("div")
		    	.attr("class","trend-y-select");
		    
		    optButtons.append("label")
		    	.attr("class","radio-inline")
		    	.text("AMOUNT")
		    	.append("div")
		    		.attr("class","choice")
		    		.append("span")
		    			.attr("class","checked")
		    			.append("input")
		    				.attr("type","radio")
		    				.attr("name","y-selection")
		    				.attr("class","styled");
		    
		    optButtons.append("label")
		    	.attr("class","radio-inline")
		    	.text("% INCREASE PY")
		    	.append("div")
		    		.attr("class","choice")
		    		.append("span")
		    			.attr("class","")
		    			.append("input")
		    				.attr("type","radio")
		    				.attr("name","y-selection")
		    				.attr("class","styled");
		    
		    optButtons.append("label")
		    	.attr("class","radio-inline")
		    	.text("% OF REVENUE")
		    	.append("div")
		    		.attr("class","choice")
		    		.append("span")
		    			.attr("class","")
		    			.append("input")
		    				.attr("type","radio")
		    				.attr("name","y-selection")
		    				.attr("class","styled");   
		    
		    $(optButtons[0][0]).find("label").on("click",d => valueOptClick(d));	    	
	    }
	    else {
		    var optButtons = topBox.append("div")
	    		.attr("class","trend-y-select empty");	    	
	    }
	    
	    d3Container.selectAll(graphCName).remove();
	    d3Container.selectAll("svg").remove();
	    
	    bottomBox.selectAll('*').remove();
	    var bottomBox2 = bottomBox.append("div")
	    if (hasSideButtons) {
		    var planButton = bottomBox2.append("div")
		    	.attr("class","trend-plan-button bottom-buttons");
		    planButton.append("span").append("i")
				.attr("class","icon-pencil3");	    	
		    
		    var planButton = bottomBox2.append("div")
				.attr("class","trend-more-button bottom-buttons");
			planButton.append("span").append("i").attr("class","icon-grid5");
		    
	    }
	    
	    /*var svgBottom = bottomBox.append("svg")
			.style("position","absolute")
			.style("bottom","-30px")
			.style("opacity","0.2")
			.attr("width",width +  margin.left + margin.right)
			.attr("transform","translate(0," + -margin.top + ")");      
	    
	    var tipPlan = d3.tip()
	    	.attr("class","d3-tip")
	    	.offset([-10,0])
	    	.html("Open Planning Input Screen");
	    svgBottom.call(tipPlan);        
	    
	    svgBottom.append("rect")
			.attr("width", "135")
	    	.attr("height", "135")
	    	.on("mouseover",tipPlan.show)
	    	.on("mouseout",tipPlan.hide);*/

	    //var tipMore = d3.tip()
		//	.attr("class","d3-tip")
		//	.html("Open for More Reporting Analytics");
	    //d3Container.call(tipMore);
	    				
		//bottom buttons
	    periodBtns = bottomBox2.append("div")
	    	.attr("class","bottom-selector")
	    	.style("margin-top",(-1* margin.bottom + 30) + "px")
	    	.style("margin-bottom", margin.bottom + "px")
	    	.append("ul")
	    		.attr("class","nav nav-tabs nav-tabs-top bottom-divided trend-buttons");
	    //create dummy button to fix the height
	    var btn = periodBtns.append("li").attr("class","x-axis-button trend-button")
	    	.style("visibility","hidden").style("width","1px").style("margin","0");
	    btn.append("a").attr("data-toggle","tab").text("TMP");
	    
	   
	    middleBox.selectAll("*").remove();
	    var graphContainer = middleBox.append("div").attr("id",graphCName);
	    
	    if (selGraphGrp !== null) {
	    	selectedChartGroup(selGraphGrp);
	    }
	    
	    if (typeof arg._onDataDone == 'function') {
	    	arg._onDataDone();
	    }
    }
    
    function valueOptClick(d) {
    	var $target = $(d.currentTarget);
    	var $parent = $target.parent();
    	$parent.find("span.checked").removeClass("checked");
    	$target.find("span").addClass("checked");
    }
    

     
    //generate dropdown, process graph selection
    function selectedChartGroup(chartGrp) {
    	var selections = chartGrp.selections;
    	var hasDropDown = selections.length > 1;
    	var hasSelected = false, chart, param, title = "";   
    	
    	//generate dropdown
    	titleBar.selectAll("ul.trend-select").remove();
    	
    	if (hasDropDown) {
    		
            var tmp = titleBar.append("ul").attr("class","icons-list trend-select")
        		.append("li").attr("class","dropdown text-muted");	    		
            var titleDDIcons = tmp.append("a").attr("href","#").attr("class","dropdown-toggle").attr("aria-expanded","false").attr("data-toggle","dropdown");
        	
        	titleDDIcons.append("i").attr("class","icon-more2").style("opacity","0");
        	titleDDIcons.append("span").attr("class","icon-more2 right-click");
        	
            // dropdown items
            var dropdownItems = tmp.append("ul").attr("class","dropdown-menu dropdown-menu-right");	        	

            // dropdown item selections
    		var chartDefault = "bar-line";
    		selections.forEach((item,i)=>{
    			var selected = null, value = "value" + i;
    			if (item["selected"]){
    				selected = item.selected;
    				hasSelected = true;
    				selGraphItem = i;
    				if (item.hasOwnProperty("chart")){
    					chart = item.chart;
    				}
    				else {
    					chart = chartDefault;
    				}
    				param = item.chartParam;
	    			if (item.hasOwnProperty("title")){
	    				title = item.title;
	    			}
	    			else {
	    				if (item.hasOwnProperty("value")){
	    					title = item.value;
	    				}
	    				else {
	    					title = value;
	    				}
	    			}
    			}
    			if (item.hasOwnProperty("value")){
    				value = item.value;
    			}
    			
    			var tmp = dropdownItems.append("li").attr("data-value",value);
    			tmp.append("a")
    				.attr("class",selected?"selected":null)
    				.attr("data-index",i)
    				.text(value);
    			
    			$(tmp[0][0]).on("click",d => {
    				selGraphItem = i;
    				dropDownChangeEvent(d, item);
    			});
    		});
    		
    		if (!hasSelected) {
    			if (selections[0].hasOwnProperty("chart")){
    				chart = selections[0].chart;
    			}
    			else {
    				chart = chartDefault;
    			}
    			param = selections[0].chartParam;
    			if (selections[0].hasOwnProperty("title")){
    				title = selections[0].title;
    			}
    			else {
    				title = selections[0].value;
    			}
    		}
    	}
    	else {
			if (selections[0].hasOwnProperty("chart")){
				chart = selections[0].chart;
			}
			else {
				chart = chartDefault;
			}	    	
			param = selections[0].chartParam;
			if (selections[0].hasOwnProperty("title")){
				title = selections[0].title;
			}
			else {
				title = selections[0].value;
			}    			
    	}
    	
    	
    	//generate x axis selection
    	hasSelected = false
    	
    	periodBtns.selectAll("li.valid").remove();
    	var $btnDefault;
    	if (Array.isArray(param.x)) {
    		param.x.forEach((d,i) => {
    			var btn = periodBtns.append("li").attr("class","x-axis-button trend-button valid");
    			if (d["selected"]){
    				$(btn[0][0]).addClass("active");
    				hasSelected = true;
    			}
    			if (i===0) {
    				$btnDefault = $(btn[0][0]);	    			
    			}
    			btn.append("a").attr("data-toggle","tab").text(d.name);
    			//btn.attr("data-index",i);
    			$(btn[0][0]).on("click", d => {
    				selXAxis = i;
    				buttonXAxisClickEvent(d);
    			});
    		});
    		if (!hasSelected) {
    			$btnDefault.addClass("active");
    		}
    	}
    	
    	//set the _active = false to other not selected charts
    	chartGroup[0].forEach(chtG => {
    		if (chtG.name != chartGrp.name) {
    			chtG.selections.forEach(chtGsel => {
    				chtGsel.chartParam["_active"] = false;
    			});
    		}
    	});
    	
    	//run the graph
    	param["_active"] = true;
		selectedChart(chart,param);
		titleDesc.text(title);
    }
    
    //generate graph
    function selectedChart(chart, cParam) {
    	switch (chart) {
    	case "bar-line":
    		cParam["element"] = graphCName; 
    		trendBarLineChart(cParam);
    	}
    }
    
    //events
    function dropDownChangeEvent(d, sel) {
    	var selected = $(d.currentTarget);
    	selected.parent().find("a").removeClass("selected");
    	selected.find("a").addClass("selected"); 
    	var title = ""
		//transfer the selected
		selGraphGrp.selections.forEach(di => {
    		if (di["selected"]) {
    			delete di["selected"];
    			di.chartParam["_active"] = false;
    		}				
		});
    	sel["selected"] = true;
    	sel.chartParam["_active"] = true;
    	
    	selectedChart(sel.chart,sel.chartParam);
		if (sel.hasOwnProperty("title")){
			title = sel.title;
		}
		else {
			title = sel.value;
		}	
		titleDesc.text(title);		
    }
    
    function buttonGGClickEvent(d,sel) {
    	$button = $(titleBarBn[0][0]).find("li.trend-button")
    	$button.each((i,item) => {
    		$(item).removeClass("selected");
    		$(item).removeClass("active");
    	});
    	$(d.currentTarget).addClass("selected");
    	$(d.currentTarget).addClass("active");
    	selectedChartGroup(sel);
    }
    
    function buttonXAxisClickEvent(d) {
    	var selected = $(d.currentTarget);
    	if (selGraphGrp.hasOwnProperty("chart")) {
    		var chart = selGraphGrp.chart;
    	}
    	else {
    		var chart = "bar-line";
    	}
    	var param = selGraphGrp.selections[selGraphItem].chartParam;
    	param.x.forEach(d => {
    		if (d["selected"]) {
    			d["selected"] = null;
    		}
    	});
    	param.x[selXAxis]["selected"] = true;
    	selectedChart(chart,param);
    }
    
    //methods
    arg.refresh = function() {
    	//remerge the global parameters
    	arg.chartGroup.forEach(chartGrp => {
    		var selections = chartGrp.selections;
        	for (var key in chartGrp) {
        		if (chartGrp.hasOwnProperty(key)) {
        			if (key !== "name" && key !== "selected" && key !== "selections" && key !== "_selections") {
        				selections.forEach((item,i) => { 
        					if (key !== "chartParam" && key !== "defaultOptions") {
        						if (!item.hasOwnProperty(key)) {
        							item[key] = chartGrp[key];
        						}
        					}
        					else {
        						var cPrm = chartGrp.defaultOptions ? chartGrp.defaultOptions : chartGrp.chartParam;
        						for (var key2 in cPrm) {
        							if (cPrm.hasOwnProperty(key2)) {
        								if (!chartGrp._selections[i].chartParam.hasOwnProperty(key2)) {
        									item.chartParam[key2] = cPrm[key2];
        								}
        							}
        						}
        					}
        				});
        			}
        		}
        	}
        	selections.forEach((sel,i) => {
        		if (sel.chartParam._hasPromised) {
        			var scp = sel.chartParam;
        			delete scp._hasPromised;
        			if (scp.x) {
        				var scpx = scp.x;
        				if (!Array.isArray(scpx)) {
        					scpx = [scp.x];
        				}
        				scpx.forEach(ex => {
        					if (ex._hasPromised) {
        						delete ex._hasPromised;
        					}
        				});
        			}
        		}
        	});
    	});
    	
    	buildMainButtons();
		//selectedChartGroup(selGraphGrp);
    };
    
    arg.selectionsClick = function(cg, nme) {
    	var sel, currTgt, cgSel, currCG;
    	if (cg) {
        	for (var i = 0; i < arg.chartGroup.length; i++) {
        		if (arg.chartGroup[i].name == cg) {
        			cgSel = arg.chartGroup[i];
        		}
        	}    		
    	}
    	else {
    		for (var i = 0; i < arg.chartGroup.length; i++) {
    			if (arg.chartGroup[i]._active) { 
    				cgSel = arg.chartGroup[i];
    			}
    		}
    	}
    	if (!cgSel) {
    		cgSel = arg.chartGroup[0];
    	}
    	for (var i = 0; i < cgSel.selections.length; i++) {
    		if (cgSel.selections[i].value == nme) {
    			sel = cgSel.selections[i];
    			currCG = $(titleBar[0]).find("div.title-button-box li").filter('[data-value="' + cg + '"]');
    			currTgt = $(titleBar[0]).find("ul.trend-select li").filter('[data-value="' + nme + '"]');
    			break;
    		}
    	}
    	if (sel) {
    		var selections = cgSel.selections;
    		selections.forEach((item,i) => {
    			item.selected = false
    			if (item.value == sel.value) {
    				item.selected = true;
    			}
    		});
    		if (cg) {
    			$(currCG).click();
    		}
    		else {
    			//var d = {};
    			//d.currentTarget = currTgt;
    			$(currTgt).click();
    			//dropDownChangeEvent(d,sel);
    		}
    	}
    };
    
    arg.activeEvents = [];
    
    //event fucntion setting
    arg.on = (e, f) => {//parameters: e -> event name, f -> function callback
    	switch(e) {
    	case 'done':
    		arg.chartGroup.forEach(cg => {
        		cg.selections.forEach(sel => {
        			if (sel.chartParam.on) {
        				sel.chartParam.on(e,f);
        			}
        		});    			
    		})
    		break;
    	case 'data:done':
    		
    		var f2 = () => {
        		var countDtaDoneSuccess = 0;
        		var countDtaDoneEvent = 0;    			
        		arg.chartGroup.forEach(cg => {
            		cg.selections.forEach(sel => {
            			if (sel.chartParam) {
            				var ch = sel.chartParam;
            				if (ch.data){
            					if (ch.data instanceof Promise) {
            						countDtaDoneEvent++;
            						ch.data.then(rs => {
            							countDtaDoneSuccess++;
            							if (countDtaDoneEvent <= countDtaDoneSuccess) {
                    						if (typeof arg._onDataDone == 'function') {
                    							countDtaDoneSuccess = 0;
                    							f(arg, true);
                    						}        							        								
            							}
            						},rj => {
                						if (typeof arg._onDataDone == 'function') {
                							countDtaDoneSuccess = 0;
                							f(arg, false, rj);
                						}        							
            						});
            					}
            					else {
            						if (typeof arg._onDataDone == 'function') {
            							f(arg, true);
            						}
            					}
            				}
            			}
            		});    			
        		});    			
    		};
    		
    		arg._onDataDone = f2;
    		break;
    	}
    	arg.activeEvents.push(e);
    	
	    if (typeof arg._onDataDone == 'function') {
	    	arg._onDataDone();
	    }
    	
    	return arg;
    }    
    
    return arg;
}

function trendBarLineChart(arg) {
	/* arg	element: string, required, element ID in HTML
	 * 		data: object, required, data in JSON format
	 * 		valueColumn: string, key in data contains numeric value; default = "Value"
	 * 		xDimension: string default, x axis dimension
	 * 		staticMembers: optional, similar to sliceIntersectData memIntrx parameter	  
	 * 		valueDimension: string, key in data contains numeric value; default = "Value"
	 * 		sumType: optional, if the result from sumDimension do total or average, valid values = sum, average. 
	 * 		scaling: optional, multiply values by amount.	  
	 * 		colors: array, bar colors, im array format (e.g. ['#9cc3e7','#ffdb63','#f7b284'] for three z axis bars); default = "#bbb"
	 * 		height: number, height of the graph ; default = 400
	 * 		z: object, name of dimension (or key) display as multple bars / lines per x-axis (appear on legend)
	 * 			dimension: string, required, name of dimension (key)
	 * 			type: array of string, either bar or line type graph (e.g ['bar','line']); default = 'bar'
	 * 		x: object, x-axis parameters
	 * 			dimension: string, required, name of dimension (key)
	 * 			label: string, x-axis label that will appear in either three positions by labelPosition
	 * 			labelPosition: string, position of label; default = "center"; valid values = "center","left","right"
	 * 			sumDimensions: string, used to merge all the members in dimension as totals
	 * 			text: string or function, override display text on horizontal ticks
	 * 		y: object, y-axis parameters
	 * 			label: string, y-axis label that will appear in either three positions by labelPosition
	 * 			labelPosition: string, position of label; default = "top"; valid values = "top","center","bottom"
	 * 			measureDisplay: string, y-axis tick number formatting; default = measureDisplay
	 * 			ticks: number, number of ticks; default = 8
	 * 		tooltip: object, bar tooltips (if not indicated, the tooltip will automatically created)
	 * 			type: string, can be simple or full; default = "simple"; valid values = "simple","full"
	 * 			measureDisplay: string, tooltip value number format; default = measureDisplay 
	 * 		measureDisplay: string, number format for values; defalut = "default"; valid values = "default", "short", "percent"
	 * 		margin: object, margin of the entire chart
	 * 			top: default = 35
	 * 			right: default = 52
	 * 			bottom: default = 60
	 * 			left: default = 50
	 */
	var element = "#" + arg.element;
	var filter = arg.filter ? arg.filter : null;
	var sumDimensions = arg.sumDimensions ? arg.sumDimensions : null;
	var staticMembers = arg.staticMembers ? arg.staticMembers : null;
	var sumType = arg.sumType ? arg.sumType : null;
	var scaling = arg.scaling ? arg.scaling : null;		
	var autoFill = arg.autoFill ? arg.autoFill : true;
	var data = arg.data;
	var dataPromise = null, dataPromise2 = null;
	var valueCol = arg.hasOwnProperty("valueColumn") ? arg.valueColumn : "Value";	
	var enableDebugReport = arg.hasOwnProperty("enableDebugReport") ? arg.enableDebugReport : false;
	
    //event variables
    //arg._onDone = null;
    if (!arg.activeEvents) {
    	arg.activeEvents = [];
    }
    
    //event function setting
    arg.on = (e, f) => {//parameters: e -> event name, f -> function callback
    	switch(e) {
    	case 'done':
    		arg._onDone = f;
    		break;
    	case 'data:done':
    		arg._onDataDone = f;
    		break;
    	}
    	arg.activeEvents.push(e);
    	return arg;
    }
	if (data) {
		if (data instanceof Promise) {
			dataPromise = data;
			data = null;
			if (!arg._hasPromised) {
				dataPromise2 = new Promise((response,reject) => {
					dataPromise.then(rs => {
						arg.data = rs;
						if (filter || sumDimensions || staticMembers || scaling) {
							data = sliceIntersectData(rs, filter, sumDimensions, staticMembers, valueCol, sumType, scaling);
						}
						else {
							data = rs;
						}
				    	//if (typeof arg._onDataDone == 'function') {
				    	//	arg._onDataDone(arg,true);
				    	//}							
						response(rs);
					});
				},rj => {
			    	if (typeof arg._onDataDone == 'function') {
			    		arg._onDataDone(arg,false, rj);
			    	}										
				});
				arg._hasPromised = true;
			}
		}
		else {
			dataPromise2 = new Promise((response,reject) => { //dummy promise to simplify coding
				if (filter || sumDimensions || staticMembers || scaling) {
					data = sliceIntersectData(arg.data, filter, sumDimensions, staticMembers, valueCol, sumType, scaling);
				}
				else {
					data = arg.data;
				}
		    	//if (typeof arg._onDataDone == 'function') {
		    	//	arg._onDataDone(arg,true);
		    	//}											
				response(arg.data);
			},rj => {
		    	if (typeof arg._onDataDone == 'function') {
		    		arg._onDataDone(arg,false, rj);
		    	}										
			});		
		}
	}
	
	var measureDisplay = arg.hasOwnProperty("measureDisplay") ? arg.measureDisplay : "default";
	var height = arg.hasOwnProperty("height") ? arg.height : 200;
	var margin = {"top":35, "right":25, "bottom":0, "left":70};
	if (arg.hasOwnProperty("margin")) {
		var mg = arg["margin"];
		if (mg.hasOwnProperty("top")) {
			margin.top = mg.top;
		}
		if (mg.hasOwnProperty("right")) {
			margin.right = mg.right + 15;
		}
		if (mg.hasOwnProperty("bottom")) {
			margin.bottom = mg.bottom;
		}    		
		if (mg.hasOwnProperty("left")) {
			margin.left = mg.left + 15;
		}
	}     	
	var tooltip = "simple", toolTipMDisplay = measureDisplay;
	if (arg.hasOwnProperty("tooltip")) {
		var tt = arg["tooltip"];
		if (tt !== null) {
    		if (typeof tt === 'object') {
        		if (tt.hasOwnProperty("measureDisplay")) {
        			toolTipMDisplay = tt.measureDisplay;
        		}
        		if (tt.hasOwnProperty("type")) {
        			tooltip = tt.type;
        		}
    		}
    		else {
    			if (tt === false) {
    				tooltip = null;
    			}
    		}    			
		}
	}
	var format = d3.format(",f");
	format = measureFormat(measureDisplay);
	
	var formatTip = d3.format(",f");
	formatTip = measureFormat(toolTipMDisplay);
	
	var responsive = arg.hasOwnProperty("responsive") ? responsive = arg.responsive :false;	
    var d3Container = d3.select(element),
	    margin = {"top": margin.top, "right": margin.right, "bottom": margin.bottom, "left": margin.left},
	    height = height - margin.top - margin.bottom - 5;
	var width = (arg.width ? arg.width : d3Container.node().getBoundingClientRect().width) - margin.left - margin.right;
    d3Container.selectAll(".loading-bg").remove();
    d3Container.selectAll("svg").remove();
    var loadingScreen = d3Container.append("div").attr("class","loading-bg");
    
    var loadingSvg = loadingScreen.append("svg")
    					.attr("height",height + margin.top + margin.bottom);
    
    var estTop = 0, estLeft = ((width + margin.left + margin.right) / 2) - 40;
    loadingScreen.append("div")
    	.attr("class","loading-screen")
    	.style("position","absolute")
    	.append("div");    
        
    if (dataPromise2) {
		dataPromise2.then(rs => {
			var _active = arg.hasOwnProperty("_active") ? arg._active : true;
			if (_active) {
				
				var yDim = valueCol;
				var yLabel = "", yLabelPos = "top", yTicks = 5, yHasBands = true;
				var yFormatValue = measureDisplay;
				var yMinValue = 100;
				if (arg.hasOwnProperty("y")){
					var ya = arg.y;
					var bPass = false;
					if (ya.hasOwnProperty("label")) {
						yLabel = ya.label;
						bPass = true;
					}
					if (ya.hasOwnProperty("measureDisplay")) {
						yFormatValue = ya.measureDisplay;
						bPass = true;
					}
					if (ya.hasOwnProperty("labelPosition")) {
						yLabelPosition = ya.labelPosition;
						bPass = true;
					}    			 
					if (ya.hasOwnProperty("ticks")) {
						yTicks = ya.ticks;
						bPass = true;
					}
					if (ya.hasOwnProperty("bands")) {
						yHasBands = ya.bands;
						bPass = true;
					}
					if (ya.hasOwnProperty("minValue")) {
						yMinValue = ya.minValue;
						bPass = true;
					}
					if (!bPass) {
						if (typeof ya !== 'object') {
							yDim = ya;
						}
					}
				}  	
				
				var lgDim = "Version";
				var lgDimType = ["bar","bar",'line','line','line'];
				var lgStaticMembers = null;
				if (arg.hasOwnProperty("z")) {
					var lg = arg.z;
					if (lg.hasOwnProperty("dimension")) {
						lgDim = lg.dimension;
						if (lg.hasOwnProperty("type")) {
							lgDimType = lg.type;
						}
					}
					else {
						if (typeof lg !== 'object') {
							lgDim = lg;
						}
					}
					if (lg.staticMembers) {
						lgStaticMembers = lg.staticMembers;
					}
				}    	
				
				
				var xDim = "TIME";
				var xLabel = "", xLabelPos = "center", xHasBands = true;
				var xDimStaticMembers = null;
				var xTickLabel, xTickLabel2;
				var xDataPromise;
				if (arg.hasOwnProperty("x")) {
			    	//check if it is an array of x's
					var argX = arg.x
			    	if (!Array.isArray(argX)) {
			    		argX = [arg.x];
			    	}
		    		var hasSel = false;
		    		arg.x.forEach((d,i) => {
		    			if (d["selected"]) {
		    				hasSel = true;
		    				argX = d;
		    			}
		    		});
		    		if (!hasSel) {
		    			argX = arg.x[0]; //default
		    		}
		    		
		    		var fil = null;
		    		if (argX.hasOwnProperty("filter")) {
		    			fil = argX.filter;
		    		}
		    		
		    		var a = {}, akey = "";
		    		if (argX.hasOwnProperty("sumDimension")) {
		    			akey = "sumDimension";
		    		}
		    		else if (argX.hasOwnProperty("sumDimensions")) {
		    			akey = "sumDimensions";
		    		}
		    		
		    		if (akey) {
		    			var sumD = argX[akey];
		    			if (Array.isArray(sumD)) {
		    				sumD.forEach(d => {
		    					a[d] = "TOTAL";
		    				});
		    			}
		    			else if (typeof sumD == 'object') {
		    				a = sumD;
		    			}
		    			else {
		    				a[sumD] = "TOTAL";
		    			}
		    		}
		    		
		    		if (argX.staticMembers) {
		    			xDimStaticMembers = argX.staticMembers;
		    			if (!Array.isArray(xDimStaticMembers)) {
		    				xDimStaticMembers = [xDimStaticMembers];
		    			}
		    		}
		    		
		    		if (argX.data) { //overrides x-axis data
		    			if (argX.data instanceof Promise) {
		    				if (!argX._hasPromised) {
			    				data = null;
			    				xDataPromise = new Promise((response,reject) => {
			    					argX.data.then(rs => {
			    						argX.data = rs;
			    						if (filter || sumDimensions || staticMembers || scaling) {
			    							data = sliceIntersectData(rs, filter, sumDimensions, staticMembers, valueCol, sumType, scaling);
			    						}
			    						else {
			    							data = rs;
			    						}
			    				    	if (typeof arg._onDataDone == 'function') {
			    				    		arg._onDataDone(arg,true);
			    				    	}							
			    						response(rs);			    						
			    					});
			    				},rj => {
			    			    	if (typeof arg._onDataDone == 'function') {
			    			    		arg._onDataDone(arg,false, rj);
			    			    	}
			    				});
			    				argX._hasPromised = true;
		    				}
		    			}
		    			else {
			    			xDataPromise = new Promise((response,reject) => {
			    				data = sliceIntersectData(argX.data, filter, sumDimensions, staticMembers, valueCol, sumType, scaling);
	    				    	if (typeof arg._onDataDone == 'function') {
	    				    		arg._onDataDone(arg,true);
	    				    	}			    							    				
			    				response(argX.data);
			    			})		    				
		    			}
		    		}
		    		else {
		    			//dummy promise
		    			xDataPromise = new Promise((response,reject) => {
    				    	if (typeof arg._onDataDone == 'function') {
    				    		arg._onDataDone(arg,true);
    				    	}			    						    				
		    				response(rs);
		    			});
		    		}
		    		
		    		xDataPromise.then(rs => {
			    		if (data.length) {
			    			data = sliceIntersectData(data, fil, a, null, valueCol);
			    		}
			    		else {
			    			if (argX.staticMembers){
			    				var fil2 = $.extend(true,{},fil,filter);
			    				$.extend(true,fil2)
			    				var a2 = $.extend(true,{},a,sumDimensions);
			    				var xDim2 = argX.dimension ? argX.dimension : xDim;
			    				var staticMembers2 = {};
			    				staticMembers2[xDim2] = argX.staticMembers;
			    				if (lgStaticMembers) {
			    					staticMembers2[lgDim] = lgStaticMembers;
			    				}
			    				data = sliceIntersectData(data, fil2, a2, staticMembers2, valueCol);
			    				arg.data = data;
			    			} 
			    		}		    			
		    		});
					
					var xa = argX;
					if (xa.hasOwnProperty("dimension")) {
						xDim = xa.dimension;
						if (xa.hasOwnProperty("label")) {
							xLabel = xa.label;
						}
						if (xa.hasOwnProperty("labelPosition")) {
							xLabelPosition = xa.labelPosition;
						}
						if (xa.hasOwnProperty("bands")) {
							xHasBands = xa.bands;
						}        			
					}
					else {
						if (typeof xa !== 'object') {
							xDim = xa;
						}
					}
					xTickLabel = xa.text ? xa.text : null;
					xTickLabel2 = xa.text2 ? xa.text2 : null;
				}		
				else {
					//dummy promise
					var xDataPromise = new Promise((response) => {
				    	if (typeof arg._onDataDone == 'function') {
				    		arg._onDataDone(arg,true);
				    	}						
						response(rs)
					})
				}
				
				xDataPromise.then(rs=> {
					d3Container.selectAll(".loading-bg").remove();
					
			        if (enableDebugReport) {
			        	var $containerParent = $(element).parent().parent();
			        	var rightClickButton = "#" + $containerParent.attr("id") + ' .icons-list .right-click';
			        	rightClickDebug(rightClickButton, rs, filter);
			        }					
					
					var colors = ["#bbb"]; //arg.colors;
					if (arg.hasOwnProperty("colors")) { 
						colors = arg.colors;
					}    	
					if (typeof colors === 'string') {
						colors = [colors]; //convert into array
					}
					if (colors.length < data.length) {
						var tmp = colors[colors.length - 1];
						for (var i = colors.length; i < data.length; i++) {
							var newColor = tmp.substring(1), ci = 20;
							var redN = newColor.substring(0,2), greenN = newColor.substring(2,4), blueN = newColor.substring(4,6); 
							var redN2 = addHexColor(redN,ci), greenN2 = addHexColor(greenN,ci), blueN2 = addHexColor(blueN,ci);
							if (parseInt("0x" + redN2) > 0xFF){
								redN2 = redN;
							}
							if (parseInt("0x" + greenN2) > 0xFF){
								greenN2 = greenN;
							}
							if (parseInt("0x" + blueN2) > 0xFF){
								blueN2 = blueN;
							}
							newColor = "#" + redN2 + greenN2 + blueN2;
							tmp = newColor;
							colors.push(newColor);
						}
					}    		
					
					//data slice by compare.dimension
					if (xDimStaticMembers) {
						var xDimList = xDimStaticMembers;
					}
					else {
						var xDimList = extractValue(data,{},xDim,true);
					}	
					
					var zDimList = extractValue(data,{},lgDim,true);
					var zDimListBar = [], zDimListLine = [];				
					var dataSliceBar = [], dataSliceLine = [], colorBar = [], colorLine = [];
					var numOfBars = 0, numOfBarsPerSlice = 0;
					var firstIntrx;
					var newData = [];
					zDimList.forEach((item, i) => { //divide the data into groups based on z.dimension
						var filterA = {}, colorQ = "";
						filterA[lgDim] = item;
						var tmp = sliceIntersectData(data,filterA, null, null, valueCol);
						//has static dimensions
						if (xDimStaticMembers) {
							if (i == 0) {
								var tmpR = [];
								xDimStaticMembers.forEach(ix => {
									var ixfilter = {};
									ixfilter[xDim] = ix;
									var tmp2 = sliceIntersectData(tmp,ixfilter, null, null, valueCol);
									if (tmp2.length) {
										tmpR.push(tmp2[0]);
									}
									else {
										ixfilter = $.extend(true, {}, tmp[0]);
										ixfilter[lgDim] = item;
										ixfilter[xDim] = ix;
										ixfilter[valueCol] = 0;
										tmpR.push(ixfilter);
									}
								});
								tmp = tmpR;
								//if has static members, it will automatically do autoFill
								autoFill = true;
							}
						}
						
						//autofill
						if (autoFill) {
							if (i == 0) {
								firstIntrx = tmp;
							}
							else {
								var tmpR = [];
								firstIntrx.forEach(ix => {
									var tmpRBlank = []
									var ixfilter = {};
									for (var ixdim in ix) {
										if (ixdim != lgDim && ixdim != valueCol) {
											ixfilter[ixdim] = ix[ixdim];
											tmpRBlank[ixdim] = ix[ixdim]
										}
										else {
											if (ixdim == lgDim) {
												tmpRBlank[lgDim] = item;
											}
										}
									}
									ixfilter[lgDim] = item;
									var tmp2 = sliceIntersectData(tmp,ixfilter, null, null, valueCol);
									if (tmp2.length) {
										tmpR.push(tmp2[0]);
									}
									else {
										tmpRBlank[valueCol] = 0;
										tmpR.push(tmpRBlank);
									}
								});
								tmp = tmpR;
							}
						}
						
						if (colors.length > i ){
							colorQ = colors[i];
						}
						if (lgDimType.length > i){
							if (lgDimType[i] === 'bar') {
								dataSliceBar.push(tmp);
								colorBar.push(colorQ);
								zDimListBar.push(item);
							}
							else {
								dataSliceLine.push(tmp);
								colorLine.push(colorQ);
								zDimListLine.push(item);
							}
						}
						else {
							lgDimType.push('bar'); //add missing item
							dataSliceBar.push(tmp);
							colorBar.push(colorQ);
							zDimListBar.push(item);
						}
						newData = newData.concat(tmp);
					});
				    // Define main variables
					var dataset = extractValue(newData,null,valueCol); //to be used to size the y axis
			    	dataset = dataset.map(item => {
			    		if (!isNaN(item)) {
			    			return Number(item);
			    		}
			    		else {
			    			return item;
			    		}
			    	});
				    var xSpacePct = 0, zSpacePct = 0;
				    var barMaxWidth = 17;
				    // Construct scales
				    // ------------------------------
				    // Horizontal
				    var x = d3.scale.ordinal()
				        .domain(d3.range(xDimList.length))
				        .rangeRoundBands([0, width], xSpacePct);
				    
				    var xLeft = x(0);
				    
				    // Vertical
				    var yDomainValue = d3.max(dataset) != 0 ? d3.max(dataset) : yMinValue;
				    var y = d3.scale.linear()
				        .domain([0, yDomainValue])
				        .range([0, height]);
				    

				    var zWidth = x.range().length > 1 ? x.range()[1] - x.range()[0] : width;
				    var zBarWidthEst = barMaxWidth * dataSliceBar.length;
				    var zBarWidthTotalMax = zWidth * 0.9;
				    var zBarWidthTotal = zBarWidthEst > zBarWidthTotalMax ? zBarWidthTotalMax : zBarWidthEst;
				    var zWidthAdj = (zWidth - zBarWidthTotal) / 2.0;  
				    var z = d3.scale.ordinal()
				    	.domain(d3.range(dataSliceBar.length))
				    	.rangeRoundBands([zWidthAdj, zWidth - zWidthAdj], zSpacePct)					
				    	
				    // Create axes
				    // ------------------------------
		
				    // Horizontal
		
				    var xAxisScale = d3.scale.ordinal()
				        .domain(xDimList)
				        .rangeRoundBands([-5, width - 5], xSpacePct);
				        
				    var xAxis = d3.svg.axis()
				        .scale(xAxisScale)
				        .tickSize(height)
				        .orient("bottom");
				    
				    if (xTickLabel) {
				    	xAxis.tickFormat((d,i) => {
				    		if (typeof xTickLabel == 'function') {
				    			var ret = xTickLabel(d,i,xDimList.length);
				    		}
				    		else if (typeof xTickLabel == 'string') {
				    			var ret = xTickLabel.replace("{value}",d);
				    		}
				    		else {
				    			var ret = xTickLabel;
				    		}
				    		return ret;
				    	});
				    }
				    
				    
				    var yAxisScale = d3.scale.linear()
				        .domain([yDomainValue / 0.95,0])
				        .range([0, height]);
				    
				    var yAxis = d3.svg.axis()
				    	.scale(yAxisScale)
				    	.ticks(yTicks) 
				    	.tickSize(-width)
				    	.tickFormat(d => { 
				    		var tmp = format(d);
				    		if (measureDisplay === 'short') {
				    			tmp = tmp.replace("G","B");
				    			if (tmp[tmp.length - 1].search(/[a-z]/i) >= 0) {
				    				tmp = tmp.substring(0,tmp.length - 1) + " " + tmp[tmp.length - 1];
				    			}
				    			else if (d === 0) {
				    				tmp = "0";
				    			}
				    		}
				    		return tmp;
				    	})
				    	.orient("left");

				    // Create chart
				    // ------------------------------
				    // Add SVG element
				    var container = d3Container.append("svg");
		
				    // Add SVG group
				    var svg = container
				        .attr("width", width + margin.left + margin.right)
				        .attr("height", height + margin.top + margin.bottom)
				        .style("overflow","visible")
				        .append("g")
				            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
				            .attr("class","trend-chart");
				   
				    
				    // Add axis elements
				    // ------------------------------
				    
				    //add y-axis
				    var yAxisObj = svg.append("g").call(yAxis)
				    	.attr("class", "y-axis axis");
				    
				    var yAxisObjTick = yAxisObj.selectAll(".tick text")
				    	.attr("class", "chart-tick y-axis trend-text")
				    	.attr("transform","translate(-5,0)");
				    	//.attr("x","5");
				    
				    var yAxisObjLines = yAxisObj.selectAll(".tick line")
				    	.attr("class", "chart-grid-line y-axis-line")
				    	.attr("x1",x(0));
				    
				    // add x-axis
				    var xAxisObj = svg.append("g").call(xAxis).attr("class", "x-axis axis");

				    var xAxisObjTick = xAxisObj.selectAll(".tick text")
				    	.attr("class", "chart-tick x-axis trend-text text1")
				    	.attr("x","5");
			    			    			    
				    if (xTickLabel2) {
					    var xAxis2 = d3.svg.axis()
					        .scale(xAxisScale)
					        .tickSize(height)
					        .orient("bottom");
				    
				    	xAxis2.tickFormat((d,i) => {
				    		if (typeof xTickLabel2 == 'function') {
				    			var ret = xTickLabel2(d,i,xDimList.length);
				    		}
				    		else if (typeof xTickLabel2 == 'string') {
				    			var ret = xTickLabel2.replace("{value}",d);
				    		}
				    		else {
				    			var ret = xTickLabel2;
				    		}
				    		return ret;
				    	});
				    	
				    	var xAxisObj2 = svg.append("g").call(xAxis2).attr("class", "x-axis axis");
					    var xAxisObjTick2 = xAxisObj2.selectAll(".tick text")
					    	.attr("class", "chart-tick x-axis trend-text text2")
					    	.attr("x","5");
				    	
				    }
				    var xAxisObjLines = xAxisObj.selectAll(".tick line").attr("class", "chart-grid-line x-axis-line")
			    	.attr("x1", zWidth * (0.5 + xSpacePct ))
			    	.attr("x2", zWidth * (0.5 + xSpacePct ));
				            
				    // add border
				    var yAxisVerLine = yAxisObj.append("line")
				    	.attr("x1", x(0))
				    	.attr("y1", 0)
				    	.attr("x2", x(0))
				    	.attr("y2", height)
				    	.attr("class", "y-bar", "bar");
				    
				    var tmpWidth = d3.select(xAxisObjLines[0][xAxisObjLines[0].length - 1]).node().getBoundingClientRect().left - yAxisVerLine.node().getBoundingClientRect().left;
				    // add y-axis bar
				    var border = yAxisObj.append("path")
				    	.attr("d", "M" + xLeft + " 0 l0 " + height + " l" + tmpWidth + " 0" +  " l0 " + -height + " Z")
				    	.attr("class", "border trend-border")
				    	.attr("fill", "none");
				    
				    //if (tmpWidth > 0) {
				    //	yAxisObjLines.attr("x2", tmpWidth + xLeft);
				    //}
				    
				    //set the x and y axis domain background fill to none
				    svg.selectAll(".domain").attr("fill","none");
				    
				    // add horizontal and vertical background row bands
				    if (yHasBands) {
				        var tmpHeight = 0;
				        if (yAxisObjLines[0].length > 1) {
				        	tmpHeight = d3.select(yAxisObjLines[0][0]).node().getBoundingClientRect().top - d3.select(yAxisObjLines[0][1]).node().getBoundingClientRect().top;
				        }
				        else {
				        	tmpHeight = height;
				        }
				        
				        var yAxisObjRowBand = yAxisObj.append("g").attr("class","trend-y-bands")
				        yAxisObj.selectAll("g.tick")[0].forEach((x,i) => { 
				        	var tmp = $(x).attr("transform");
				        	var wd = tmpWidth;
				        	if (!wd) {
				        		wd = width;
				        		if (wd < 0) {
				        			wd = 0;
				        		}
				        	}
				        	tmp = tmp.substr(tmp.search(","));
				        	tmp = tmp.substr(1,tmp.length - 2);
				        	var oddEven = ((i+1) % 2) === 1 ? "odd " : "even"
				        	if (i === yAxisObj.selectAll("g.tick")[0].length -1) {
				        		tmpHeight = d3.select(x).node().getBoundingClientRect().top - border.node().getBoundingClientRect().top + 10;
				        		if (tmpHeight < 0) {
				        			tmpHeight = 0;
				        		}
				        	}
				        	yAxisObjRowBand.append("rect")
				        		.attr("height",tmpHeight)
				        		.attr("width",wd)
				        		.attr("transform","translate(" + xLeft + "," + (tmp - tmpHeight) + ")")
				        		.attr("class", "trend-y-band " + oddEven)
				        		.attr("test",i);
				        });        	
				    }					    
				    if (xHasBands) {
				        tmpWidth = yAxisObjLines.node().getBoundingClientRect().left;
				        var tmpLeft = xLeft;
				        var xAxisObjRowBand = xAxisObj.append("g").attr("class","trend-x-bands")
				        xAxisObj.selectAll("g.tick")[0].forEach((x,i) => { 
				        	var tmp = $(x).attr("transform");
				        	tmp = tmp.substr(0,tmp.search(","));
				        	tmp = tmp.substr(tmp.search(/\(/) + 1);
				        	var oddEven = ((i+1) % 2) === 1 ? "odd " : "even"
				        	tmpWidth = d3.select(xAxisObjLines[0][i]).node().getBoundingClientRect().left - tmpWidth;
				        	xAxisObjRowBand.append("rect")
				        		.attr("height",height)
				        		.attr("width",tmpWidth)
				        		.attr("transform","translate(" + tmpLeft + "," + 0 + ")")
				        		.attr("class", "trend-x-band " + oddEven);
				        	tmpWidth = d3.select(xAxisObjLines[0][i]).node().getBoundingClientRect().left;
				    		tmpLeft = parseInt(tmp) + parseInt($(x).find(".x-axis-line").attr("x2"));        	
				        });
				    }        
				    // add labels
				    var yAxisObjTickWidth = d3.select(yAxisObjTick[0][yAxisObjTick[0].length - 1]).node().getBoundingClientRect().width
				    //var xAxisObjTickHeight = d3.select(xAxisObjTick[0][xAxisObjTick[0].length - 1]).node().getBoundingClientRect().height;
				    var xAxisObjTickHeight = height + 20;
				    //xAxisObjTickHeight += parseInt($(xAxisObjTick[0][xAxisObjTick[0].length - 1]).attr("y"));          
				    
				    var yAxisObjLabels = {}; xAxisObjLabels = {};
				    var xtmp = 0, ytmp = 0, xf = "";
				    
				    d3Container.selectAll(".trend-axis-labels").remove();
				    d3Container.selectAll(".trend-axis-label").remove();
				    
				    var yAxisLabels = d3Container.append("div")
				    	.attr("class","trend-axis-labels");
				    
				    if (!Array.isArray(yLabel)){
				    	yLabel = [yLabel];
				    }
				    
				    yLabel.forEach((lbl,i) => {
					    var yAxisLabel = yAxisLabels.append("div")
					    	.attr("class","trend-axis-label y-label trend-text label" + i)
					    	.style("position","relative")
					    	.style("left","26px")
					    	.style("top", -(xAxisObjTickHeight + 5) + "px")
					    	.text(lbl);				    	
				    });
				    /*var yAxisObjg = yAxisObj.append("g")
				    yAxisObjLabels[yLabelPos] = yAxisObjg.append("text")
				    	.attr("id","y-axis-text")
				    	.style("font-weight","bold")
				    	.style("font-size","8px")
				    	.style("font-family", "Segoe UI")
				    	.attr("class", "trend-axis-label y-label trend-text")
				    	.text(yLabel);
				    switch (yLabelPos)
				    {
				    case "top":
				    	xtmp = -40;
				    	ytmp = -12;
				    	break;
				    case "center":
				    	xtmp = -height / 2;
				    	ytmp = -yAxisObjTickWidth;   	
				    	xf = "rotate(-90)";
				        break;
				    case "bottom":
				    	xtmp = -yAxisObjTickWidth;
				    	ytmp = xAxisObjTickHeight;   	        	
				    }
				    
				    yAxisObjLabels[yLabelPos].attr("x", xtmp)
				    	.attr("y",ytmp)
				    	.attr("transform",xf);
				    
				    if (yLabelPos) {
				    	var bx = yAxisObjLabels[yLabelPos].node().getBoundingClientRect();
				    	yAxisObjg.append("rect")
				    		.attr("class", "trend-axis-label-box y-label-box")
				    		.attr("width",bx.width + 10)
				    		.attr("height",bx.height + 8)
				    		.attr("x",xtmp - 6)
				    		.attr("y",ytmp - bx.height);
				    	yAxisObjg.append("use").attr("xlink:href","#y-axis-text");
				    }
				    */
				    switch (xLabelPos)
				    {
				    case "center":
				        var tmp = xAxisObj.append("g").append("text")
					    	//.attr("x", width / 2)
					    	.attr("y", xAxisObjTickHeight + 15)
					    	.attr("class", "trend-axis-label x-label trend-text")
					    	.text(xLabel);
				        tmp.attr("x", (width - tmp.node().getBoundingClientRect().width) / 2);
				        xAxisObjLabels["center"] = tmp;
				    	break;
				    case "right":
				    	var tmp = xAxisObj.append("g").append("text")
					    	//.attr("x", width - 30)
					    	.attr("y", xAxisObjTickHeight + 15)
					    	.attr("class", "trend-axis-label x-label trend-text")
					    	.text(xLabel);
				    	
				    	tmp.attr("x", width - tmp.node().getBoundingClientRect().width);
				    	xAxisObjLabels["right"] = tmp;
				    	break;
				    case "left":
				    	xAxisObjLabels["left"] = xAxisObj.append("g").append("text")
					    	.attr("x", 0)
					    	.attr("y", xAxisObjTickHeight + 15)
					    	.attr("class", "trend-axis-label x-label trend-text")
					    	.text(xLabel);            	
				    }
				    if (xLabelPos) {
				    	xAxisObj.append("rect").attr("class", "trend-axis-label-box x-label-box");;
				    }
					
				    // Add Legend
				    // ------------------------------
					var legend = svg.append("g")
						.attr("class", "trend-legend")
						.attr("transform","translate(" + (width / 2) + ",-55)");
					
					var lwd = 0;
					var ctL = 0, ctB = 0;
					zDimList.forEach((d,i) => {
						var legendTextPct = null, legendTextLine = null, legendTextCircle;
						var legendG = legend.append("g")
							.attr("class","legend-item")
							.style("cursor", "pointer");
						
						$(legendG[0]).on("mouseover",legendMouseOver);
						$(legendG[0]).on("mouseout",legendMouseOut);
						$(legendG[0]).on("click",legendClick);
		
						if (lgDimType[i] === 'bar') { 
							legendG.attr("data-target","d3-bar" + ctB);
							ctB++;
						}
						else {
							legendG.attr("data-target","d3-line" + ctL);
							ctL++;
						}
						legendTextPct = legendG.append("circle")
							.attr("class", "trend-legend-point trend-point")
							.attr("stroke", colors[i])
							.attr("fill", colors[i])
							.attr("r","6");    
						
						
						var legendTextPcs = legendG.append("text")
							.attr("class", "trend-legend-text trend-text")
							.text(d);
						//var lht = legendTextPcs.node().getBoundingClientRect().height;
						
						legendTextPct.attr("transform","translate(" + lwd + ",-5)");
						lwd += 15;
		
						legendTextPcs.attr("transform","translate(" + lwd + ",0)");
						//lwd += legendTextPcs.node().getBoundingClientRect().width + 30;
						lwd += (d.length * 4.5) + 30;
					});
					
					legend.attr("transform","translate(" + ((width - lwd) / 2) + ",-55)");
					//legend.attr("transform","translate(" + ((width - legend.node().getBoundingClientRect().width) / 2) + ",-55)");				    
				    // Add Tooltip
				    // ------------------------------
					var tipsB = [], tipsL = [];
					if (tooltip !== null) {
						if (tooltip === 'full') {
							var tmp = [];
							var tmpData = dataSliceBar.concat(dataSliceLine);
							xDimList.forEach((lst,l) => {
								var tmp2 = "", hd1 = "", hd2 = "";
								if (xTickLabel) {
									if (typeof xTickLabel == 'function') {
										hd1 = xTickLabel(lst,l,xDimList.length);
									}
						    		else if (typeof xTickLabel == 'string') {
						    			hd1 = xTickLabel.replace("{value}",lst);
						    		}
						    		else {
						    			hd1 = xTickLabel;
						    		}
								}
								if (xTickLabel2) {
									if (typeof xTickLabel2 == 'function') {
										hd2 = xTickLabel2(lst,l,xDimList.length);
									}
						    		else if (typeof xTickLabel2 == 'string') {
						    			hd2 = xTickLabel2.replace("{value}",lst);
						    		}
						    		else {
						    			hd2 = xTickLabel2;
						    		}								
								}
								if (hd1 || hd2) {
									tmp2 = '<div class="tip-header">' + hd1 + " " + hd2 + "</div>";
								}
								
								tmpData.forEach((item,j) => { 
					    			var fValue = formatTip(item[l][valueCol])
					        		if (toolTipMDisplay === 'short') { //add space between number and suffix
					        			fValue = fValue.replace("G","B");
					        			if (fValue[fValue.length - 1].search(/[a-z]/i) >= 0) {
					        				fValue = fValue.substring(0,fValue.length - 1) + " " + fValue[fValue.length - 1];
					        			}
					        		}
									tmp2 += "<div>" + item[l][lgDim] + ": " + fValue + "</div>";
								})
								tmp.push(tmp2);
							});
							if (dataSliceBar.length > 0) {
				    			dataSliceBar.forEach((item,j) => {
				    				var tip = d3.tip()
				    					.attr('class', 'd3-tip trend-graph-tip')
				    					.offset([-10,0])
				    					.html((d,i) => { 
				    						var tmp2 = tmp[i];
				    						tmp2 = tmp2.replace("<div>" + item[i][lgDim],'<div class="tip-highlight">' + item[i][lgDim])
				    						return tmp2;
				    					});
				    				svg.call(tip);
				    				tipsB.push(tip);
				    			});
							}
							if (dataSliceLine.length > 0) {
				    			dataSliceLine.forEach((item,j) => {
				    				var tip = d3.tip()
				    					.attr('class', 'd3-tip trend-graph-tip')
				    					.offset([-10,0])
				    					.html((d,i) => { 
				    						var tmp2 = tmp[i];
				    						tmp2 = tmp2.replace("<div>" + item[i][lgDim],'<div class="tip-highlight">' + item[i][lgDim])	    						
				    						return tmp2;
				    					});
				    				svg.call(tip);
				    				tipsL.push(tip);
				    			});
							}
						}
						else {
				    		if (dataSliceBar.length > 0) {
					    		if (tooltip === 'full') {
					    		}
					    		else {
						    		dataSliceBar.forEach((item,j) => {
						    	    	var tip = d3.tip()
								    		.attr('class', 'd3-tip')
								    		.offset([-10,0])
								    		.html((d,i) => {
								    			var fValue = formatTip(d)
						    	        		if (toolTipMDisplay === 'short') { //add space between number and suffix
						    	        			fValue = fValue.replace("G","B");
						    	        			if (fValue[fValue.length - 1].search(/[a-z]/i) >= 0) {
						    	        				fValue = fValue.substring(0,fValue.length - 1) + " " + fValue[fValue.length - 1];
						    	        			}
						    	        		}		    			
								    			var content = lgDim + ": " + zDimListBar[j] + ", " + valueCol + ": " + fValue;
								    			return content;
								    		});
							    	    	// Initialize tooltip
						    	    	svg.call(tip);    
							    	    tipsB.push(tip);
						    		});
					    		}
					    	}
					    	
					    	if (dataSliceLine.length > 0) {
					    		dataSliceLine.forEach((item,j) => {
					    	    	var tip = d3.tip()
							    		.attr('class', 'd3-tip')
							    		.offset([-10,0])
							    		.html((d,i) => {
							    			var fValue = formatTip(d)
					    	        		if (toolTipMDisplay === 'short') { //add space between number and suffix
					    	        			fValue = fValue.replace("G","B");
					    	        			if (fValue[fValue.length - 1].search(/[a-z]/i) >= 0) {
					    	        				fValue = fValue.substring(0,fValue.length - 1) + " " + fValue[fValue.length - 1];
					    	        			}
					    	        		}			    			
							    			var content = lgDim + ": " + zDimListLine[j] + ", " + valueCol + ": " + fValue;
							    			return content;
							    		});
					    	    	// Initialize tooltip
					    	    	svg.call(tip);    
					    	    	tipsL.push(tip);    			
					    		});
					    	}
				    	}
					}				    
				    // Append bars
				    // ------------------------------
		
				    // Add bars 
				    
				    var drawBars = [];
				    var delay = 500 / dataSliceBar.length 
				    if (dataSliceBar.length > 0) {
				    	var barsvg = svg.append("g").attr("class", "trend-bars");
				    	dataSliceBar.forEach((item,j) => {
				        	dataset = extractValue(item,null,valueCol);
				        	var barWidth = z.rangeBand()>barMaxWidth?barMaxWidth:z.rangeBand();
					        var drawBar = barsvg.selectAll(".d3-bar" + j)
					            .data(dataset)
					            .enter()
					            .append("rect")
					                .attr("class", "d3-bar" + j + " trend-bar")
					                .attr("x", function(d, i) {
					                	return x(i) + z(j);
					                	})
					                .attr("width", barWidth)
					                .attr("height", 0)
					                .attr("y", height)
					                //.attr("filter",'url(#f1)')
					                .style("cursor", "pointer")
					                .on('mouseover', ((tooltip!==null) ? tipsB[j].show: null))
					                .on('mouseout', ((tooltip!==null) ? tipsB[j].hide: null));
					                
					                if (colorBar[j] !== '') {
					                	drawBar.attr("fill", function(d, i) {return colorBar[j]; });
					                }
					                
					        // Add bar transition
					        drawBar.transition()
					            .delay(100 + delay * j)
					            .duration(1000)
					            .attr("height", function(d) { return y(d) * 0.95})
					            .attr("y", function(d) { return height - y(d) * 0.95 })     	                
					        drawBars.push(drawBar);
				        });
				    }
				    
				    // Add lines
				    var drawLines = [];
				    var drawCicles = [];
				    // Horizontal
				    
				    if (dataSliceLine.length > 0) {
				    	dataSliceLine.forEach((item,j) => {
				    		var linesvg = svg.append("g").attr("class", "trend-lines");
				    		dataset = extractValue(item,null,valueCol);
				            var line = d3.svg.line()
				            	.x(function(d,i) {return x(i) + zWidth / 2;})
				            	.y(function(d) {return height - y(d) * 0.95;})
				            	.interpolate("monotone");
				            var flatline = d3.svg.line()
				            	.x(function(d,i) {return x(i) + zWidth / 2;})
				            	.y(height)
				            	.interpolate("monotone");
				            var drawArea = linesvg.append("path")
				            	.datum(dataset)
				            	.attr("class", "d3-line trend-line d3-line" + j)
				            	.attr("d", flatline);
				            	                
				            var drawCircle = linesvg.selectAll(".d3-point" + j)
				            	.data(dataset)
				            	.enter()
				            	.append("circle")
				            		.attr("class", "d3-point" + j + " trend-point")
				                	.attr("cx",function(d,i) {return x(i) + zWidth / 2;})
				                	.attr("cy",height)
				                	.attr("r","0")
					                .style("cursor", "pointer")
					                .on('mouseover', ((tooltip!==null) ? tipsL[j].show: null))
					                .on('mouseout', ((tooltip!==null) ? tipsL[j].hide: null));                
				            if (colorLine[j] !== '') {
				            	drawArea.attr("stroke", colorLine[j]);
				            	drawCircle.attr("stroke", colorLine[j])
				            	drawCircle.attr("fill", colorLine[j]);
				            }
				            
				            drawArea.transition()
					            .delay(200 + delay * dataSliceBar.length)
					            .duration(1000)
					            .attr("d", line);
				            drawCircle.transition()
					            .delay(200 + delay * dataSliceBar.length)
					            .duration(1000)
					            .attr("r", "3")
					            .attr("cy",function(d,i) {return height - y(d) * 0.95;});
				            
				            drawLines.push(drawArea);
				            drawCicles.push(drawCircle);
				            
				    	});			    	
				    }
				    
				    // Call function on window resize
				    if (responsive) {
				    	$(window).on('resize', resize_trend);
				    	$(window).on('click', d => {
				    		$e = $($(d3Container[0][0]));
				    		if ($e.is(":visible") && $e.find(d.target).length === 0) {
				    			resize_trend();
				    		}
				    	})
				    };	
				    var opacity = 0.7
					function legendMouseOver(t) {
						var target = d3.select(t.currentTarget);
						target.attr("data-isclicked")
						if (target.attr("data-isclicked") === null) {
				    		var selected = $(t.currentTarget).data("target");
				    		var sType = selected.substr(0,6);
				    		if (sType === "d3-bar") {
				    			var index = parseInt(selected.substr(6));
				    		}
				    		else {
				    			var sType = selected.substr(0,7);
				    			var index = parseInt(selected.substr(7));
				    		}
				    		
				    		setBarLineProperty(index,sType,"opacity",opacity);    			
						}
					}
				    
		
					function legendMouseOut(t) {
						var target = d3.select(t.currentTarget);
						if (target.attr("data-isclicked") === null) {
							setBarLineProperty(0,"","opacity",null);
						}
					}
		
					var barHCount = drawBars.length;
					function legendClick(t) {
						var selected = $(t.currentTarget).data("target");
						var siblings = $(t.currentTarget).parent().children();
						var target = d3.select(t.currentTarget);
						var sType = selected.substr(0,6);
						if (sType === "d3-bar") {
							var index = parseInt(selected.substr(6));
						}
						else {
							var sType = selected.substr(0,7);
							var index = parseInt(selected.substr(7));
						}
						
						if (target.attr("data-isclicked") === null) {
							target.attr("opacity","0.2").attr("data-isclicked","1");
							if (sType === "d3-bar") {
								barHCount--;
							}
							else {
								setBarLineProperty(0,"","opacity",null);
								setBarLineProperty(index,sType,"display","none",false);
							}
						}
						else {
							target.attr("opacity",null).attr("data-isclicked",null);
							if (sType === "d3-bar") {
								barHCount++;
							}
							else {
								setBarLineProperty(index,sType,"display",null,false);
							}
							
						}
				        var z1 = d3.scale.ordinal()
				    		.domain(d3.range(barHCount))
				    		.rangeRoundBands([zWidthAdj, zWidth - zWidthAdj], zSpacePct);  
				        var c = 0;
				        drawBars.forEach((drawBar,j)=>{
				        	var isClk = d3.select(siblings[j]).attr("data-isclicked");
				        	if (isClk===null) {
				        		c++;
				        	}            	
				        	var barWidth = z.rangeBand()>barMaxWidth?barMaxWidth:z.rangeBand();
				        	var barWidthX = barWidth * (drawBars.length/barHCount);
				        	var bw = isClk===null?barWidthX:0;
				        	
				        	drawBar.transition()
				            	.duration(800)            	
				            	.attr("x", (d,i) => {
				            		var val = isClk===null?z1(c-1):z(j);
				            		return x(i) + val;
				        			})
				        		.attr("width", bw)
				        		.attr("height", function(d) { 
				        			var val = isClk===null?y(d):0;
				        			return val * 0.95;
				        		})
				        		.attr("y", function(d) {
				        			var val = isClk===null?height - y(d) * 0.95:height;
				        			return val;
				        		});
				        });
					}
					
					function setBarLineProperty(index,type,prop,val,rev = true) {
						if (!rev) {
				    		drawBars.forEach((d,j)=>{
				    			if (index === j && type ==="d3-bar"){
				    				d.attr(prop,val);
				    			}
				    		})
				    		drawLines.forEach((d,j)=>{
				    			if (index === j && type ==="d3-line"){
				    				d.attr(prop,val);
				    			}        			
				    		});
				    		drawCicles.forEach((d,j)=>{
				    			if (index === j && type ==="d3-line"){
				    				d.attr(prop,val);
				    			}        			
				    		});       		    			    			
						}
						else {
				    		drawBars.forEach((d,j)=>{
				    			if (index !== j || type !=="d3-bar"){
				    				d.attr(prop,val);
				    			}
				    		})
				    		drawLines.forEach((d,j)=>{
				    			if (index !== j || type !=="d3-line"){
				    				d.attr(prop,val);
				    			}        			
				    		});
				    		drawCicles.forEach((d,j)=>{
				    			if (index !== j || type !=="d3-line"){
				    				d.attr(prop,val);
				    			}        			
				    		});       		    			
						}
					}					
				    // Resize function
				    // 
				    // Since D3 doesn't support SVG resize by default,
				    // we need to manually specify parts of the graph that need to 
				    // be updated on window resize
				    function resize_trend() {
		
				        // Layout variables
				        width = d3Container.node().getBoundingClientRect().width - margin.left - margin.right;
				        // Layout
				        // -------------------------
		
				        // Main svg width
				        container.attr("width", width + margin.left + margin.right);
		
				        // Axes
				        // -------------------------
		
				        // Horizontal
				        x.rangeRoundBands([0, width], xSpacePct);
				                   
				        zWidth = x.range().length > 1 ? x.range()[1] - x.range()[0] : width;
				        zBarWidthEst = barMaxWidth * dataSliceBar.length;
				        zBarWidthTotalMax = zWidth * 0.9;
				        zBarWidthTotal = zBarWidthEst > zBarWidthTotalMax ? zBarWidthTotalMax : zBarWidthEst;
				        zWidthAdj = (zWidth - zBarWidthTotal) / 2.0; 
				        z.rangeRoundBands([zWidthAdj, zWidth - zWidthAdj], zSpacePct);
				        // Horizontal axis
				        // Chart elements
				        // -------------------------
		
				        // Bars
				        
				        var z1 = d3.scale.ordinal()
				    		.domain(d3.range(barHCount))
				    		.rangeRoundBands([zWidthAdj, zWidth - zWidthAdj], zSpacePct);  
				        var c = 0;
				        var siblings = $(legend[0]).children();
				        drawBars.forEach((drawBar,j)=>{
				        	var isClk = d3.select(siblings[j]).attr("data-isclicked");
				        	if (isClk===null) {
				        		c++;
				        	}            	
				        	var barWidth = z.rangeBand()>barMaxWidth?barMaxWidth:z.rangeBand();
				        	var barWidthX = barWidth * (drawBars.length/barHCount);
				        	var bw = isClk===null?barWidthX:0;
				            drawBar.attr("x", (d,i) => {
				            		var val = isClk===null?z1(c-1):z(j);
				            		return x(i) + val;
				        			})
				        		.attr("width", bw)
				        		.attr("height", function(d) { 
				        			var val = isClk===null?y(d):0;
				        			return val * 0.95;
				        		})
				        		.attr("y", function(d) {
				        			var val = isClk===null?height - y(d) * 0.95:height;
				        			return val;
				        		});
				        });            
				        
				        drawLines.forEach((drawLine)=>{
				            var line = d3.svg.line()
				        		.x(function(d,i) {return x(i) + zWidth / 2;})
				        		.y(function(d) {return height - y(d) * 0.95;})
				        		.interpolate("monotone");              	
				        	drawLine.attr("d", line);
				        });
				        
				        drawCicles.forEach((drawCicle)=>{
				        	drawCicle.attr("cx",function(d,i) {return x(i) + zWidth / 2;});
				        });   
				        
				        // Text label
				        xAxisScale.rangeRoundBands([0, width], xSpacePct);                                   
				        xAxis.scale(xAxisScale);
				        yAxis.tickSize(-width).scale(yAxisScale);
				        
				        xAxisObj.call(xAxis);
				        var tmp = xAxisObj.selectAll(".tick line")
				        	.attr("x1", zWidth * (0.5 + xSpacePct ))
				        	.attr("x2", zWidth * (0.5 + xSpacePct ));
				        
				        tmpWidth = d3.select(tmp[0][tmp[0].length - 1]).node().getBoundingClientRect().left - yAxisVerLine.node().getBoundingClientRect().left;
				        
				        yAxisObj.call(yAxis);
				        yAxisObjLines.attr("x2",tmpWidth + xLeft);
				        yAxisObjTick.attr("transform","translate(5,0)");
				        border.attr("d", "M" + xLeft + " 0 l0 " + height + " l" + tmpWidth + " 0" +  " l0 " + -height + " Z");;
				        
				        //row and column bands
				        if (yHasBands) {
				        	yAxisObjRowBand.selectAll("rect").attr("width",tmpWidth);
				        }
				        
				        if (xHasBands) {
				            tmpLeft = xLeft;
				            tmpWidth = yAxisObjLines.node().getBoundingClientRect().left;
				            var tmpTicks = xAxisObj.selectAll("g.tick")[0];
				            xAxisObjRowBand.selectAll("rect")[0].forEach((x,i) => { 
				            	var tmp = $(tmpTicks[i]).attr("transform");
				            	tmp = tmp.substr(0,tmp.search(","));
				            	tmp = tmp.substr(tmp.search(/\(/) + 1);
				            	var oddEven = ((i+1) % 2) === 1 ? "odd " : "even";
				            	tmpWidth = d3.select(xAxisObjLines[0][i]).node().getBoundingClientRect().left - tmpWidth;
				            	d3.select(x).attr("width",tmpWidth)
				            		.attr("transform","translate(" + tmpLeft + "," + 0 + ")");
				            	tmpWidth = d3.select(xAxisObjLines[0][i]).node().getBoundingClientRect().left;
				        		tmpLeft = parseInt(tmp) + parseInt($(tmpTicks[i]).find(".x-axis-line").attr("x2"));              	
				            });            
				        }
				        
				        switch (xLabelPos)
				        {
				        case "center":
				        	xAxisObjLabels["center"].attr("x", (width - tmp.node().getBoundingClientRect().width) / 2);
				        	break;
				        case "right":
				        	xAxisObjLabels["right"].attr("x", width - tmp.node().getBoundingClientRect().width);
				        }
				        
				        legend.attr("transform","translate(" + ((width - legend.node().getBoundingClientRect().width) / 2) + ",-55)");
				    }					
			    	if (typeof arg._onDone == 'function') {
			    		arg._onDone(arg,true);
			    	}				
				});
			}
		},rj => {
	    	if (typeof arg._onDone == 'function') {
	    		arg._onDone(arg,false, rj);
	    	}			
		});
    }

    function measureFormat(ms, df = null) {
    	if (!df) {
    		df = ms;
    	}
        switch (ms)
        {
        case "default":
        	return d3.format(",f"); 
        case "short":
        	return d3.format(",.3s");
        	break;
        case "percent":
        	return d3.format(".1%");
        	break;
        default:
        	if (ms) {
        		return d3.format(df);
        	}
        }    	
    }
        
    return arg;
}

function periodExpansion(firstId, numPeriod, type = "month", increment = 1, customList = []) {
	var year = firstId.substr(0,4);
	var suffix = firstId.substr(5);
	var monthNumList = ["01","02","03","04","05","06","07","08","09","10","11","12"];
	var monthNameList = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
	var qrtNameList = ["Q1","Q2","Q3","Q4"];
	var allList = [monthNumList,monthNameList,qrtNameList];
	var allListIndex = 0;
	var ret = [];	
	if (!isNaN(year)) {
		year = parseInt(year);
	}
	
	if (suffix || type != "year") {
		var index = 0, list;
		if (customList.length) {
			list = customList;
			for (var i = 0; i < customList.length; i++) {
				if (customList[i] == suffix) {
					index = i;
					break;
				}
			}
		}
		else {
			var bFound = false;
			for (var j = 0; j < allList.length; j++) {
				var tmp = allList[j];
				for (var i = 0; i < tmp.length; i++) {
					if (tmp[i] == suffix) {
						index = i;
						list = tmp;
						allListIndex = j;
						bFound = true;
						break;
					}
				}
				if (bFound) {
					break;
				}
			}
		}
		//if found
		if (bFound) {
			var count = index;
			var yearCount = 0;
			for (var i = 0; i < numPeriod; i += increment) {
				var newYear = year + yearCount;
				var tmp = newYear + "." + list[count];
				count += 1 + (type == 'quarter' && allListIndex != 2 ? 2 : 0);
				if (count >= list.length) {
					count = 0 + (type == 'quarter' && allListIndex != 2 ? index % 3 : 0);
					yearCount++;
				}
				ret.push(tmp);
			}			
		}
		return ret;
	}
	else { //it just list of year
		for (var i = 0; i < numPeriod; i += increment) {
			var newYear = year + i;
			if (suffix) {
				newYear += "." + suffix;
			}
			ret.push(newYear);
		}
	}
	return ret;
}

function periodExpansionB(first, last = "", type = "day", increment = 1, numPeriod = 12) {
	var f = first.toString();
	var year0 = f.substr(0,4)
	var month0 = f.length > 4 ? f.substr(4,2) : "01";
	var day0 = f.length > 6 ? f.substr(6,2) : "00";
	var date0 = new Date(year0 + "-" + month0 + "-" + day0 + " GMT+0000");
	//var date0 = new Date(Date.UTC(year0,month0,day0));
	var ret = [];
	if (last) {
		var l = last.toString();
		var year1 = l.substr(0,4)
		var month1 = l.length > 4 ? l.substr(4,2) : "01";
		var day1 = l.length > 6 ? l.substr(6,2) : "01";
		var date1 = new Date(year1 + "-" + month1 + "-" + day1);
		var count = 0;
		switch (type) {
		case "month":
			count = (Number(month1) - Number(month0)) + (Number(year1) - Number(year0)) * 12;
			for (var i = 0; i <= count; i += increment) {
				var yearX = (Number(year0) + Math.floor((Number(month0) + i - 1) / 12)).toString();
				var monthX = (((Number(month0) + i - 1) % 12) + 1).toString();
				var dateC = new Date(yearX + "-" + monthX + "-" + day0 + " 08:00:00");
				ret.push(dateC);
			}
			break;
		case "quarter":
			count = (Number(month1) - Number(month0)) + (Number(year1) - Number(year0)) * 12;
			var quarterO = -1;
			for (var i = 0; i <= count; i += increment) {
				var yearX = (Number(year0) + Math.floor((Number(month0) + i - 1) / 12)).toString();
				var monthX = (((Number(month0) + i - 1) % 12) + 1).toString();
				var quarter = (Math.floor((Number(monthX) - 1) / 3) + 1) * 3;
				var dateC = new Date(yearX + "-" + quarter + "-" + day0 + " 08:00:00");
				if (quarterO != quarter) {
					ret.push(dateC);
					quarterO = quarter;
				}
				
			}
			break;
		case "year":
			count = Number(year1) - Number(year0);
			for (var i = 0; i <= count; i += increment) {
				var yearX = (Number(year0) + i).toString();
				var dateC = new Date(yearX + "-" + month0 + "-" + day0 + " 08:00:00");
				ret.push(dateC);
			}
			break;
		default:
			count = Math.ceil(Math.abs(Number(date1) - Number(date0)) / (1000 * 3600 * 24));
			var dateC = new Date(year0 + "-" + month0 + "-" + day0);
			for (var i = 0; i <= count; i += increment) {
				var x = new Date(dateC);
				ret.push(x);
				dateC.setDate(dateC.getDate() + increment)
				if (Number(dateC.getUTCHours()) > 0) { //caused by saving time 
					dateC.setHours(dateC.getHours() + 1);
				}
			}
		}		
	}
	else {
		switch (type) {
		case "month":
			for (var i = 0; i < numPeriod; i += increment) {
				var yearX = (Number(year0) + Math.floor((Number(month0) + i - 1) / 12)).toString();
				var monthX = (((Number(month0) + i - 1) % 12) + 1).toString();
				var dateC = new Date(yearX + "-" + monthX + "-" + day0 + " 08:00:00");
				ret.push(dateC);
			}
			break;
		case "year":
			for (var i = 0; i < numPeriod; i += increment) {
				var yearX = (Number(year0) + i).toString();
				var dateC = new Date(yearX + "-" + month0 + "-" + day0 + " 08:00:00");
				ret.push(dateC);
			}
			break;
		default:
			var dateC = new Date(year0 + "-" + month0 + "-" + day0);
			for (var i = 0; i < numPeriod; i += increment) {
				var x = new Date(dateC);
				ret.push(x);
				dateC.setDate(dateC.getDate() + increment)
				if (Number(dateC.getUTCHours()) > 0) { //caused by saving time 
					dateC.setHours(dateC.getHours() + 1);
				}
			}
		}		
	}
	
	var retC = [];
	ret.forEach(d => {
		var tmp = d.getUTCFullYear().toString() + 
			(d.getUTCMonth() >= 9 ? "" : "0") + (d.getUTCMonth() + 1).toString() + 
			(type == "day" || type == "" ? (d.getUTCDate() > 9 ? "" : "0") + d.getUTCDate().toString() : "");
		retC.push(tmp);
	});
	return retC;
}

function rightClickDebug(selector, data, filter, del, renameCol) {
	$(selector).contextMenu("destroy");
    $.contextMenu({
    	//selector: "#" + $containerParent.attr("id") + ' .icons-list .right-click',
    	selector: selector,
    	items: {"debug" : {
    		"name" : "Detail Report"
    	}},
    	callback: (key, opt) => {
    		var newWindow = window.open();
    		var newW = d3.select(newWindow.document.body);
    		var newWHead = d3.select(newWindow.document.head);
    		var newWContainer = newW.append("div")
    			.attr("class","settings-main-section")
    			.style("width", "1000px")
    			.style("margin","50px 20px");
    		var newWTable = newWContainer.append("table")
    			.style("width","100%")
    			.attr("class","table table-striped settings-main-table users-main-table dataTable no-footer")
    			.attr("id","report-table");
    		var html = "<style>";
    		
    		//add css
    		$.ajax({
    			url: "assets/css/bootstrap.css",
    			dataType: "text",
    			async: true,
    			success: response => {
    				$.ajax({
    					url: "assets/css/darce.css",
    					dataType: "text",
    					async: true,
    					success: response2 => {
    						$.ajax({
    							url: "assets/css/components.min.css",
    							dataType: "text",
    							async: true,
    							success: response3 => { 
    								$.ajax({
    									url: "assets/css/icons/icomoon/styles.css",
    									dataType: "text",
    									async: true,
    									success: response4 => {
    	            						var addt = `.settings-main-section .settings-main-table > thead > tr > th {
    											font-size: 16px;
    										}
    										.settings-main-section div.dt-buttons {
    											float: left;
    											border: #b5b5b5 1px solid;
    											padding: 4px 10px;
    											border-radius: 4px;
    										}
    										#report-table.dataTable thead .sorting_asc:after {
    	            							content: '^';
    	            							color: #999;
    	            							font-size: 18px;
    	            							margin-right: -10px;
    										}
    										#report-table.dataTable thead .sorting_desc:after {
    	            							content: '^';
    	            							color: #999;
    	            							transform: rotate(180deg);
    	            							font-size: 18px;
    	            							margin-right: -10px;
    										}
    										#report-table.dataTable thead .sorting:before {
    	            							content: '^';
    	            							margin-top: -6px;
    	            							transform: rotate(180deg);
    	            							font-size: 18px;
    	            							margin-right: -10px;
    										}
    	            						#report-table.dataTable thead .sorting:after {
    	            							content: '^';
    	            							margin-top: -12px;
    	            							font-size: 18px;
    	            							margin-right: -10px;
    										}
    										#report-table_filter {
    	            							display: inherit;
    										}
    										#report-table_filter>label:after {
    	            							content: '';
    										}
    										#report-table_filter>label>input {
    	            							margin-left: 10px;
    										}
    										#report-table > thead > tr > th {
    	            							padding-right: 30px;
    										}`
    		                        		html += response + response2 + response3 + response4 + addt + "</style>";
    		                        		newWHead.html(html);            				            						            								    										
    									}
    								})
    							}
    						});            						            						
    					}
    				});
    			}
    		});
    		

			
    		var newData = sliceIntersectData(data, filter);
    		if (del) {
    			newData = removeDataColumn(newData,del);
    		}
    		
    		//load data to table
    		var cols = [];
    		for (var k in newData[0]) {
    			if (newData[0].hasOwnProperty(k)) {
    				if (renameCol) {
    					var flg = false;
    					for (var rk in renameCol) {
    						if (rk == k) {
    							flg = true;
    							cols.push({"data": k, "title": renameCol[k]});
    						}
    					}
    					if (!flg) {
    						cols.push({"data": k, "title": k});
    					}
    				}
    				else {
    					cols.push({"data": k, "title": k});
    				}
    				
    			}
    		}
    		
    		if (cols.length) {
        		$(newWTable[0][0]).DataTable({
        			data: newData,
        			dom: 'Blpfrti',
        			pageLength: 20,
        			"lengthMenu": [[20, 100, 250, 500, -1], [20, 100, 250, 500, "All"]],
        			buttons: ['csv'],
        			columns: cols
        		});    			
    		}
    		else {
    			//no content
    			var newWNoContent = newWContainer.append("div")
    					.attr("class","no-content")
    					.style('font-size','20px')
    					.text("No contents or values extracted from the server.");
    		}
    	}
    })    		
}

function removeDataColumn(dataS,columnsS) {
	var data = $.extend(true, [], dataS); //create a deep copy
	if (Array.isArray(columnsS)) {
		var columns = columnsS;
	}
	else {
		var columns = [columnsS];
	}
	if (columns) {
		if (data) {
			data.forEach(item => {
				columns.forEach(col => {
					if (item[col]) {
						delete item[col];
					}
				})
			})
		}		
	}
	
	return data;

}


