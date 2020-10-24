$(document).ready(function() {
    var promise = new Promise(async(response,reject) => {
		var treeData = await getFancyTreeData();
		if (treeData) {
			treeData.forEach((item1,i1) => {
				if (item1.icon) {
					item1.icon = item1.icon.replace("fancytree-icon", ""); 
				}
				if (!item1.key) {
					item1.key = item1.id;
				}
				if (item1.children) {
					item1.children.forEach((item2,i2) => {
						delete item2.children;
						if (item2.icon) {
							item2.icon = item2.icon.replace("fancytree-icon", "");
						}
					if (!item2.key) {
						item2.key = item2.id;
					}
					});
				}
			});
			response(treeData);				
		}
		else {
			response(null);
		}
    });
	
	
	
    var switches = Array.prototype.slice.call(document.querySelectorAll('.switch'));
    switches.forEach(function(html) {
        var switchery = new Switchery(html, {color: '#4CAF50'});
    });
    
    var done1 = false, done2 = false;
    
    var model_calc_grp_lst_data = [
    	{"id": "AST_PLAN", "title": "AST_PLAN", "parent": "", "icon": "icon-cube3"},
    	{"id": "REV_PLAN", "title": "REV_PLAN", "parent": "", "icon": "icon-cube3"},
    	{"id": "HC_PLAN", "title": "HC_PLAN", "parent": "", "icon": "icon-cube3"},
    	{"id": "MGMT_RPT", "title": "MGMT_PLAN", "parent": "", "icon": "icon-cube3"},
    	{"id": "HCM", "title": "HCM", "parent": "", "icon": "icon-cube3"},
    	{"id":"AST_ACTUAL_CALCS","title":"AST_ACTUAL_CALCS","parent":"AST_PLAN","folder":"false","icon":"icon-tree6"},
    	{"id":"AST_CLEAR_VERSION","title":"AST_CLEAR_VERSION","parent":"AST_PLAN","folder":"false","icon":"icon-tree6"},
    	{"id":"AST_DIM_CHANGE_CALCS","title":"AST_DIM_CHANGE_CALCS","parent":"AST_PLAN","folder":"false","icon":"icon-tree6"},
    	{"id":"AST_FX_TRANS","title":"AST_FX_TRANS","parent":"AST_PLAN","folder":"false","icon":"icon-tree6"},
    	{"id":"AST_FX_TRANSLATION","title":"AST_FX_TRANSLATION","parent":"AST_PLAN","folder":"false","icon":"icon-tree6"},
    	{"id":"AST_PREPARE_PLAN_VERSION","title":"AST_PREPARE_PLAN_VERSION","parent":"AST_PLAN","folder":"false","icon":"icon-tree6"},
    	{"id":"AST_PRE_POP_VERSION_OLD","title":"AST_PRE_POP_VERSION_OLD","parent":"AST_PLAN","folder":"false","icon":"icon-tree6"},   
    	{"id":"REV_ACTUAL_CALCS_COPY","title":"REV_ACTUAL_CALCS_COPY","parent":"REV_PLAN","folder":"false","icon":"icon-tree6"},
    	{"id":"REV_ACTUAL_CALCS_COPY2","title":"REV_ACTUAL_CALCS_COPY2","parent":"REV_PLAN","folder":"false","icon":"icon-tree6"},
    	{"id":"REV_ACTUAL_CALCS_COPY3","title":"REV_ACTUAL_CALCS_COPY3","parent":"REV_PLAN","folder":"false","icon":"icon-tree6"},
    	{"id":"REV_ACTUAL_CALCS_COPY4","title":"REV_ACTUAL_CALCS_COPY4","parent":"REV_PLAN","folder":"false","icon":"icon-tree6"},
    	{"id":"REV_ACTUAL_CALCS_COPY6","title":"REV_ACTUAL_CALCS_COPY6","parent":"REV_PLAN","folder":"false","icon":"icon-tree6"},
    	{"id":"REV_ACTUAL_CALCS_COPY7","title":"REV_ACTUAL_CALCS_COPY7","parent":"REV_PLAN","folder":"false","icon":"icon-tree6"},
    	{"id":"REV_BASIC_DISAGG","title":"REV_BASIC_DISAGG","parent":"REV_PLAN","folder":"false","icon":"icon-tree6"},
    	{"id":"REV_CALCS_CLEAR","title":"REV_CALCS_CLEAR","parent":"REV_PLAN","folder":"false","icon":"icon-tree6"},
    	{"id":"HCPL_ALL_CALCS","title":"HCPL_ALL_CALCS","parent":"HC_PLAN","folder":"false","icon":"icon-tree6"},
    	{"id":"HCPL_ALL_CALCS_BHSUCOPY","title":"HCPL_ALL_CALCS_BHSUCOPY","parent":"HC_PLAN","folder":"false","icon":"icon-tree6"},
    	{"id":"HCPL_ALL_CALCS_BHSUCOPY1","title":"HCPL_ALL_CALCS_BHSUCOPY1","parent":"HC_PLAN","folder":"false","icon":"icon-tree6"},
    	{"id":"HCPL_ALL_CALCS_BHSUCOPY2","title":"HCPL_ALL_CALCS_BHSUCOPY2","parent":"HC_PLAN","folder":"false","icon":"icon-tree6"},
    	{"id":"MGMT_RPT_DISAGG","title":"MGMT_RPT_DISAGG","parent":"MGMT_RPT","folder":"false","icon":"icon-tree6"},
    	{"id":"MR_ACTUAL_CALCS","title":"MR_ACTUAL_CALCS","parent":"MGMT_RPT","folder":"false","icon":"icon-tree6"},
    	{"id":"MR_ASSIGN_PL_LINE","title":"MR_ASSIGN_PL_LINE","parent":"MGMT_RPT","folder":"false","icon":"icon-tree6"},
    	{"id":"MR_DISAGG","title":"MR_DISAGG","parent":"MGMT_RPT","folder":"false","icon":"icon-tree6"},
    	{"id":"MR_DISAGG_TEST","title":"MR_DISAGG_TEST","parent":"MGMT_RPT","folder":"false","icon":"icon-tree6"},
    	{"id":"MR_FX","title":"MR_FX","parent":"MGMT_RPT","folder":"false","icon":"icon-tree6"},  
    	{"id":"ACTUAL_CALCS","title":"ACTUAL_CALCS","parent":"HCM","folder":"false","icon":"icon-tree6"},
    	{"id":"ACTUAL_CALCS_DM","title":"ACTUAL_CALCS_DM","parent":"HCM","folder":"false","icon":"icon-tree6"},
    	{"id":"AD_HOC_CLEAR","title":"AD_HOC_CLEAR","parent":"HCM","folder":"false","icon":"icon-tree6"},
    	{"id":"ALL_HCM_CALCS","title":"ALL_HCM_CALCS","parent":"HCM","folder":"false","icon":"icon-tree6"},
    	{"id":"CONVERT_DIM_PROPERTY","title":"CONVERT_DIM_PROPERTY","parent":"HCM","folder":"false","icon":"icon-tree6"},
    	{"id":"COPY_ACT_TO_FCST","title":"COPY_ACT_TO_FCST","parent":"HCM","folder":"false","icon":"icon-tree6"},
    	{"id":"COPY_PRIOR_TO_CURR","title":"COPY_PRIOR_TO_CURR","parent":"HCM","folder":"false","icon":"icon-tree6"},
    	{"id":"COST_CENTER_RECALC","title":"COST_CENTER_RECALC","parent":"HCM","folder":"false","icon":"icon-tree6"},
    	{"id":"DIM_CHANGE_CALCS","title":"DIM_CHANGE_CALCS","parent":"HCM","folder":"false","icon":"icon-tree6"},
    	{"id":"FCST_BATCH_CALCS","title":"FCST_BATCH_CALCS","parent":"HCM","folder":"false","icon":"icon-tree6"}   	
    ];
    
    var hours_lst_data = [
    	{"id":"AM", "title": "AM", "parent": "","icon":"icon-watch2"},
    	{"id":"PM", "title": "PM", "parent": "","icon":"icon-watch2"},
    	{"id":"00", "title": "12 AM", "parent": "AM","icon":"icon-watch2"},
    	{"id":"01", "title": "1 AM", "parent": "AM","icon":"icon-watch2"},
    	{"id":"02", "title": "2 AM", "parent": "AM","icon":"icon-watch2"},
    	{"id":"03", "title": "3 AM", "parent": "AM","icon":"icon-watch2"},
    	{"id":"04", "title": "4 AM", "parent": "AM","icon":"icon-watch2"},
    	{"id":"05", "title": "5 AM", "parent": "AM","icon":"icon-watch2"},
    	{"id":"06", "title": "6 AM", "parent": "AM","icon":"icon-watch2"},
    	{"id":"07", "title": "7 AM", "parent": "AM","icon":"icon-watch2"},
    	{"id":"08", "title": "8 AM", "parent": "AM","icon":"icon-watch2"},
    	{"id":"09", "title": "9 AM", "parent": "AM","icon":"icon-watch2"},
    	{"id":"10", "title": "10 AM", "parent": "AM","icon":"icon-watch2"},
    	{"id":"11", "title": "11 AM", "parent": "AM","icon":"icon-watch2"},
    	{"id":"12", "title": "12 PM", "parent": "PM","icon":"icon-watch2"},
    	{"id":"13", "title": "1 PM", "parent": "PM","icon":"icon-watch2"},
    	{"id":"14", "title": "2 PM", "parent": "PM","icon":"icon-watch2"},
    	{"id":"15", "title": "3 PM", "parent": "PM","icon":"icon-watch2"},
    	{"id":"16", "title": "4 PM", "parent": "PM","icon":"icon-watch2"},
    	{"id":"17", "title": "5 PM", "parent": "PM","icon":"icon-watch2"},
    	{"id":"18", "title": "6 PM", "parent": "PM","icon":"icon-watch2"},
    	{"id":"19", "title": "7 PM", "parent": "PM","icon":"icon-watch2"},
    	{"id":"20", "title": "8 PM", "parent": "PM","icon":"icon-watch2"},
    	{"id":"21", "title": "9 PM", "parent": "PM","icon":"icon-watch2"},
    	{"id":"22", "title": "10 PM", "parent": "PM","icon":"icon-watch2"},
    	{"id":"23", "title": "11 PM", "parent": "PM","icon":"icon-watch2"},
    ];
    
    
    var selectedMembers = {"MODEL_CALC_GRP": "ALL_MODELS",
    					"DS_TIME": [moment().subtract(1,'month').startOf('month').format("YYYYMMDD000000"), 
    						moment().subtract(1,'month').endOf('month').format("YYYYMMDD999999")],
    					"HOURS":"ALL_HOURS"};
    
    function formatDateFPick(date) {
    	var ret = "";
    	var from = new Date(date[0].substr(0,4) + "/" + date[0].substr(4,2) + "/" + date[0].substr(6,2));
    	var to = new Date(date[1].substr(0,4) + "/" + date[1].substr(4,2) + "/" + date[1].substr(6,2));
    	ret = moment(from).format('MMMM D, YYYY') + " - " + moment(to).format('MMMM D, YYYY');
    	return ret;
    }
    
    function getPreviousDates(d1,d2) {
    	var adj = 0;
    	if (moment(d1).diff(moment(d1).startOf('year'),'days') == 0 && moment(d2).diff(moment(d2).endOf('year'),"days") == 0){
    		var years = moment(d2).diff(moment(d1),"year");
    		var ndate1 = moment(d1).subtract(years + 1,'year').startOf('year');
    		var ndate2 = moment(d2).subtract(years + 1,'year').endOf('year');
    		adj = moment(d2).diff(moment(d1),"month");
    	}
        else if (moment(d1).diff(moment(d1).startOf('month'),'days') == 0 && moment(d2).diff(moment(d2).endOf('month'),"days") == 0){
    		var months = moment(d2).diff(moment(d1),"month");
    		var ndate1 = moment(d1).subtract(months + 1,'month').startOf('month');
    		var ndate2 = moment(d2).subtract(months + 1,'month').endOf('month');
    		if (months < 1) {
    			adj = ndate2.diff(ndate1,"days");
    		}
    		else {
    			adj = months;
    		}
    	}    	
    	else {
        	var days = moment(d2).diff(moment(d1),"days");
        	var ndate1 = moment(d1).subtract(days + 1,'days');
        	var ndate2 = moment(d2).subtract(days + 1,'days');
        	adj = days;
    	}
    	return [ndate1.format("YYYYMMDD000000"),ndate2.format("YYYYMMDD999999"),adj + 1];
    }
    
    
    var dselector = primarySelector({
    	element: "dar-context-selector",
    	selection: [
    		{
    			name: "MODEL_CALC_GRP",
    			description:  "MODEL / CALC GROUP",
    			currentMember: selectedMembers['MODEL_CALC_GRP'],
    			recent: [{"id": "ALL_MODELS", "title": "All Models", "expanded": true, "icon": "icon-cube4", "parent": ""}],
    			topNode: {"id": "ALL_MODELS", "title": "All Models", "expanded": true, "icon": "icon-cube4", "parent": ""},
    			idCol: "id",
    			parentCol: "parent",
    			data: promise
    		},{
    			name: "DS_TIME",
    			description: "TIME",
    			currentMember: formatDateFPick(selectedMembers["DS_TIME"]),
    			type: "date-picker"
    		}
    	],
    	secondarySelection: [
    		{
    			name: "HOURS",
    			currentMember: selectedMembers['HOURS'],
    			recent: [{"id": "ALL_HOURS","title": "All Hours", "expanded": true,"icon":"icon-watch"},
    				{"id":"00", "title": "12 AM", "parent": "AM","icon":"icon-watch2"}, 
    				{"id":"12", "title": "12 PM", "parent": "PM","icon":"icon-watch2"}],
    			topNode: {"id": "ALL_HOURS","title": "All Hours", "expanded": true,"icon":"icon-watch"},
    			data: hours_lst_data
    		}
    	]
    }).on("browsemore:click","MODEL_CALC_GRP", d => {
    	promise.then(async function(rs) {
    		var treeData2 = await getIndexedDBStorage('fancytree-structure');
    		treeData2.forEach((item1,i1) => {
        		if (item1.icon) {
        			item1.icon = item1.icon.replace("fancytree-icon", ""); 
        		}
        		if (!item1.key) {
        			item1.key = item1.id;
        		}
        		if (item1.children) {
        			item1.children.forEach((item2,i2) => {
        				delete item2.children;
        				if (item2.icon) {
        					item2.icon = item2.icon.replace("fancytree-icon", "");
        				}
        	    		if (!item2.key) {
        	    			item2.key = item2.id;
        	    		}
        			});
        		}
        	});
    		d.data = treeData2;
    		d.refresh();
    	});
    }).on("refresh", (d , v)=> {
    	var sel = d.getCurrentMembers();
    	//get the time differences
    	var from = sel.DS_TIME.dateFrom;
    	var to = sel.DS_TIME.dateTo;
    	var hrs = sel.HOURS.id;
    	
    	var model = sel.MODEL_CALC_GRP.parent ? sel.MODEL_CALC_GRP.parent : sel.MODEL_CALC_GRP.id;
    	var cg = sel.MODEL_CALC_GRP.parent ? sel.MODEL_CALC_GRP.id : '%';
    	
    	var year0 = from.getFullYear();
    	var month0 = from.getMonth();
    	var day0 = from.getDate();
    	var year1 = to.getFullYear();
    	var month1 = to.getMonth();
    	var day1 = to.getDate();
    	var toPlusDay = new Date();
    	toPlusDay.setDate(to.getDate()+1);
    	var day2 = toPlusDay.getDate();
    	
    	var doByMonth = false;
    	var doByQuarter = false;
    	
    	if (month0 != month1) {
    		if (Math.abs(month1 - month0)> 1) { //more than one month
    			doByMonth = true;
    		}
    		else { //one month range
    			if (year0 != year1) { //more than a year
    				doByMonth = true;
    				doByQuarter = true;
    			}
    			else { //month between has one month
    				if (day0 == 1) { //starting month
    					doByMonth = true;
    				}
    				else if (day2 < day1) { //end of month
    					doByMonth = true;
    				}				
    			}
    		}    
    		if (Math.abs(month1 - month0)> 3) { //more than six months
    			doByQuarter = true;
    		}    		
    	}
    	else {		
    		if (year0 != year1) { //more than a year
    			doByMonth = true;
    			doByQuarter = true;
    		}
    	}
    	
    	prevDates = getPreviousDates(from,to);    	
    	var db_perf_dataX_raw = dataPerfDashRead(model,getLocalStorage("CURRENT_ENVIRONMENT",false),[
        	{Bar: "CURR", TimeFrom:moment(from).format("YYYYMMDD000000") , TimeTo: moment(to).format("YYYYMMDD999999")},
        	{Bar: "PREV", TimeFrom:prevDates[0] , TimeTo: prevDates[1]}]
        	,hrs,doByMonth?"MONTH":"DAY",cg);
    	    	    	
        var db_perf_dataX = new Promise((response,reject) => {
        	var data = [];
        	db_perf_dataX_raw.then(rs => {
        		data = rs;
        		if (!doByMonth) {
        			if (data) {
                    	data.map(d => {
                    		var ret = d;
                    		if (d.Bar == "PREV") {
                    			if (d.Time != "TOTAL" && d.Time != "") {
                    				d.Time = moment(d.Time).add(prevDates[2],"days").format("YYYYMMDD");
                    			}
                    		}
                    		return ret;
                    	});        			        				
        			}
        			else {
        				data = [];
        			}
        		}
        		else {
        			
        			if (data) {
                    	data.map(d => {
                    		var ret = d;
                    		if (d.Bar == "PREV") {
                    			if (d.Time != "TOTAL" && d.Time != "") {
                    				d.Time = moment(d.Time + '01').add(prevDates[2],"month").format("YYYYMM");
                    			}
                    		}
                    		return ret;
                    	});        			        				
        			}
        			else {
        				data = [];
        			}        			
        		}
            	response(data);    		
        	});
        });
        
    	var db_pref_dataX_det_raw = dataPerfDashDtlRead(model,getLocalStorage("CURRENT_ENVIRONMENT",false),[
        	{Bar: "CURR", TimeFrom:moment(from).format("YYYYMMDD000000") , TimeTo: moment(to).format("YYYYMMDD999999")},
        	{Bar: "PREV", TimeFrom:prevDates[0] , TimeTo: prevDates[1]}]
        	,hrs,doByMonth?"MONTH":"DAY",cg);
    	
        var db_perf_dataX_det = new Promise((response,reject) => {
        	var data = [];
        	db_pref_dataX_det_raw.then(rs => {
        		data = rs;
        		//console.log(data,'data2');
        		if (!doByMonth) {
        			if (data) {
                    	data.map(d => {
                    		var ret = d;
                    		if (d.Bar == "PREV") {
                    			if (d.Time != "TOTAL" && d.Time != "") {
                    				d.Time = moment(d.Time).add(prevDates[2],"days").format("YYYYMMDD");
                    			}
                    		}
                    		return ret;
                    	});        			        				
        			}
        			else {
        				data = [];
        			}
        		}
        		else {
        			
        			if (data) {
                    	data.map(d => {
                    		var ret = d;
                    		if (d.Bar == "PREV") {
                    			if (d.Time != "TOTAL" && d.Time != "") {
                    				d.Time = moment(d.Time + '01').add(prevDates[2],"month").format("YYYYMM");
                    			}
                    		}
                    		return ret;
                    	});        			        				
        			}
        			else {
        				data = [];
        			}        			
        		}
            	response(data);    		
        	});
        });

    	
    	var db_perf_data_hourX = dataPerfDashRead(model,getLocalStorage("CURRENT_ENVIRONMENT",false),[
        	{Bar: "CURR", TimeFrom:moment(from).format("YYYYMMDD000000") , TimeTo: moment(to).format("YYYYMMDD999999")},
        	{Bar: "PREV", TimeFrom:prevDates[0] , TimeTo: prevDates[1]}]
        	,hrs,"HOUR",cg);
    	
    	var db_perf_data_w_totalavg = calcTotalValues(db_perf_dataX);
    	
    	dcharts.defaultOptions.data = db_perf_dataX;
    	dcharts.defaultOptions.barChart.data = db_perf_dataX;
    	dcharts.defaultOptions.barChart.staticMembers = {"Time":periodExpansionB(moment(from).format("YYYYMMDDhhmmss"),
    															moment(to).format("YYYYMMDDhhmmss"), doByMonth?"month":"")};
    	dcharts.selections[2].data = db_perf_data_w_totalavg;
    	dcharts.selections[3].data = db_perf_data_w_totalavg;
    	
    	for (var ic = 0; ic < dcharts.selections.length; ic++) {
    		dcharts.selections[ic].debugReportOptions.data = db_perf_dataX_det;
    	}
    	
    	dcharts.refreshAll();
    	    	
    	dtrend.chartGroup[0].defaultOptions.data = db_perf_dataX;
    	dtrend.chartGroup[0].defaultOptions.x[0].data = db_perf_data_hourX;
    	if (doByMonth){
    		dtrend.chartGroup[0].defaultOptions.x[1].staticMembers = periodExpansionB(moment(from).format("YYYYMMDDhhmmss"),
					moment(to).format("YYYYMMDDhhmmss"),"month");
    		dtrend.chartGroup[0].defaultOptions.x[2].staticMembers = periodExpansionB(moment(from).format("YYYYMMDDhhmmss"),
					moment(to).format("YYYYMMDDhhmmss"),"month");    
    	}
    	else {
    		dtrend.chartGroup[0].defaultOptions.x[1].staticMembers = periodExpansionB(moment(from).format("YYYYMMDDhhmmss"),
					moment(to).format("YYYYMMDDhhmmss"));
    		dtrend.chartGroup[0].defaultOptions.x[2].staticMembers = periodExpansionB(moment(from).format("YYYYMMDDhhmmss"),
					moment(to).format("YYYYMMDDhhmmss"));        		
    		
    	}
    	if (doByQuarter) {
    		dtrend.chartGroup[0].defaultOptions.x[2].sumDimensions = {"Time": (e,dt) => {
    			var ret = "";
    			var month = Number(e.substr(4,2));
    			var qrt = (Math.floor((Number(month) - 1) / 3) + 1) * 3;
    			qrt = (qrt.toString().length < 2 ? "0" : "") + qrt.toString();
    			ret = e.substr(0,4) + qrt;
    			return ret;
    		}};
    		dtrend.chartGroup[0].defaultOptions.x[2].staticMembers = periodExpansionB(moment(from).format("YYYYMMDDhhmmss"),
					moment(to).format("YYYYMMDDhhmmss"),"quarter"); 
    		dtrend.chartGroup[0].defaultOptions.x[2].text2 = (e, i, c) => {
    			var qrtValue = Number(e.substr(4,6));
    			var qrt = "Q" + (Math.floor((qrtValue - 1) / 3) + 1).toString();
    			return qrt;
			};
    		
    	}
    	else {
    		delete dtrend.chartGroup[0].defaultOptions.x[2].sumDimensions;
    		dtrend.chartGroup[0].defaultOptions.x[2].text2 = (e, i, c) => {
    			if (e.length <= 6) { //monthly
    				return dateFormat0(e,"M");
    			}
    			else { //daily
    				return dateFormat0(e,"d");
    			}
    		};
    	}

    	dtrend.refresh();
    	
    	done1 = false;
    	done2 = false;
		var $refresh = $("#dar-context-selector > div > div > a");
		$refresh.addClass("spin");
    });
    
    var $refresh = $("#dar-context-selector > div > div > a");
	$refresh.addClass("spin");    
	
	var prevDates = getPreviousDates(selectedMembers.DS_TIME[0].substr(0,8),selectedMembers.DS_TIME[1].substr(0,8));
	
    var db_perf_data_raw = dataPerfDashRead(selectedMembers.MODEL_CALC_GRP,getLocalStorage("CURRENT_ENVIRONMENT",false),[
    	{Bar: "CURR", TimeFrom:selectedMembers.DS_TIME[0] , TimeTo: selectedMembers.DS_TIME[1]},
    	{Bar: "PREV", TimeFrom:prevDates[0] , TimeTo: prevDates[1]}]
    	,selectedMembers.HOURS,"DAY");
    
    var db_perf_data = new Promise((response,reject) => {
    	var data = [];
    	db_perf_data_raw.then(rs => {
    		data = rs;
    		if (data) {
            	data.map(d => {
            		var ret = d;
            		if (d.Bar == "PREV") {
            			if (d.Time != "TOTAL" && d.Time != "") {
            				d.Time = moment(d.Time).add(prevDates[2],"days").format("YYYYMMDD");
            			}
            		}
            		return ret;
            	});
            	response(data);
    		}
    		else {
    			response([]);
    		}
    	});
    });
    
    
	var db_pref_dataX_det_raw = dataPerfDashDtlRead(selectedMembers.MODEL_CALC_GRP,getLocalStorage("CURRENT_ENVIRONMENT",false),[
    	{Bar: "CURR", TimeFrom:selectedMembers.DS_TIME[0] , TimeTo: selectedMembers.DS_TIME[1]},
    	{Bar: "PREV", TimeFrom:prevDates[0] , TimeTo: prevDates[1]}]
    	,selectedMembers.HOURS,"DAY");
	
    var db_perf_dataX_det = new Promise((response,reject) => {
    	var data = [];
    	db_pref_dataX_det_raw.then(rs => {
    		data = rs;
    		//console.log(data,'data1');
    		if (data) {
            	data.map(d => {
            		var ret = d;
            		if (d.Bar == "PREV") {
            			if (d.Time != "TOTAL" && d.Time != "") {
            				d.Time = moment(d.Time).add(prevDates[2],"days").format("YYYYMMDD");
            			}
            		}
            		return ret;
            	});
            	response(data);
    		}
    		else {
    			response([]);
    		}
    	});
    });
    
    
    var db_perf_data_hour = dataPerfDashRead(selectedMembers.MODEL_CALC_GRP,getLocalStorage("CURRENT_ENVIRONMENT",false),[
    	{Bar: "CURR", TimeFrom:selectedMembers.DS_TIME[0] , TimeTo: selectedMembers.DS_TIME[1]},
    	{Bar: "PREV", TimeFrom:prevDates[0] , TimeTo: prevDates[1]}]
    	,selectedMembers.HOURS,"HOUR");
    
    function calcTotalValues(dataO) {
    	return new Promise((rs,rj) => {
        	dataO.then(respond => {
        		var data = sliceIntersectData(respond, 
        								{Account: ["ACTIVITY","TOTAL RUNTIME","ROWS PROCESSED"]});
        		var totalActivity = sliceIntersectData(data, {Account: "ACTIVITY"}, {Time: "TOTAL"}, {"Bar":["CURR","PREV"]});
        		var totalDataUpdate = sliceIntersectData(data, {Account: "ROWS PROCESSED"}, {Time: "TOTAL"}, {"Bar":["CURR","PREV"]});
        		//var totalRunTime = sliceIntersectData(data, {Account: "TOTAL RUNTIME"}, {Time: "Total"}, {"Bar":["CURR","PREV"]});
        		var totalRunTime = sliceIntersectData(data, {Account: "TOTAL RUNTIME", Time: "TOTAL"}, null, {"Bar":["CURR","PREV"]});
        		var avgRunTime = [];
        		totalActivity.forEach(d => {
        			var index = -1;
        			var nw = $.extend(true,{},d);
        			nw.Account = "AVG RUNTIME ";
        			var value = 0;
        			for (var i = 0; i < totalRunTime.length; i++) {
        				var pass = true;
        				for (var key in totalRunTime[i]) {
        					if (totalRunTime[i][key] != d[key]) {
        						if (key !== "Account" && key !== "Value") {
            						pass = false;
            						break;    							
        						}
        					}
        				}
        				if (pass) {
        					index = i;
        				}
        			}
        			if (index != -1) {
        				if (Number(d.Value) != 0) {
        					value = Number(totalRunTime[index].Value) / Number(d.Value);
        				}
        			}
        			nw.Value = value;
        			avgRunTime.push(nw);
        		});
        		data = data.concat(avgRunTime);
        		
        		var recSec = [];
        		totalDataUpdate.forEach(d => {
        			var index = -1;
        			var nw = $.extend(true,{},d);
        			nw.Account = "RECS / SEC ";
        			var value = 0;
        			for (var i = 0; i < totalRunTime.length; i++) {
        				var pass = true;
        				for (var key in totalRunTime[i]) {
        					if (totalRunTime[i][key] != d[key]) {
        						if (key !== "Account" && key !== "Value") {
            						pass = false;
            						break;    							
        						}
        					}
        				}
        				if (pass) {
        					index = i;
        				}
        			}
        			if (index != -1) {
        				if (Number(totalRunTime[index].Value) != 0) {
        					value = Number(d.Value) / Number(totalRunTime[index].Value);
        				}
        			}
        			nw.Value = value;
        			recSec.push(nw);
        		});
        		
        		data = data.concat(recSec);
        		rs(data);
        	});
        });
    }
    
    var db_perf_data_w_totalavg = calcTotalValues(db_perf_data);
    var $canvass = $("#drwn_tab_content");
    
    var dcharts = miniCharts({
    	element: "darce-small-charts",
    	defaultOptions: {
    		data: db_perf_data,
    		measureDisplay: "short",
    		staticMembers: {"Bar":["CURR","PREV"]},
        	sumDimensions: {"Time": ""},
        	smallText: {mapVal: (i,j) => {return (j-i)/j}},
        	selectionOptions: {hOrientation: (a,b) => {
        		var index = b.element.substr(b.element.lastIndexOf("_")+1);
        		var cWidth = $canvass.width();
        		var ret = "right";
        		switch (index) {
        		case '4':
        			if (cWidth < 1380) {
        				ret = "left";
        			}
        			break;
        		case '3':
        			if (cWidth < 1150) {
        				ret = "left";
        			}
        			break;
        		case '2':
        			if (cWidth < 900) {
        				ret = "left";
        			}
        			break;
        		case '1':
        			if (cWidth < 650) {
        				ret = "left";
        			}
        		}
        		return ret;}},
    		xDimension: "Bar",
    		labelBar:{top: "Value", bottom: {tooltip: (d,i) => {
    				var gc = dselector.getCurrentMembers();
    				var ret = "";
					switch (i) {
					case 0:
						ret = moment(gc.DS_TIME.dateFrom).format('MMMM DD, YYYY') + ' - ' + moment(gc.DS_TIME.dateTo).format('MMMM DD, YYYY') ;
						break;
					case 1:
						var pd = getPreviousDates(gc.DS_TIME.dateFrom,gc.DS_TIME.dateTo);
						ret = moment(pd[0].substr(0,8)).format('MMMM DD, YYYY') + ' - ' + moment(pd[1].substr(0,8)).format('MMMM DD, YYYY')
					}
					return ret;
				}}},
    		enableDebugReport: true,
    		barChart: {	data: db_perf_data, 
    					staticMembers: {"Time":periodExpansionB(selectedMembers.DS_TIME[0],selectedMembers.DS_TIME[1])},
    					tooltip: (val,i,data) => {
    						var text = "Time: " + dateFormat0(data["Time"],"M-d") + ", Value: {value}"; 
    						return text;
    					}}
    	},
    	selections: [{
        	name: "Activity",
        	colors: "#4273C5",
        	filter: {Account: "ACTIVITY"},
        	measureDisplay: "default",
        	selectionOptions: {hOrientation: "right"},
        	debugReportOptions: {'data':db_perf_dataX_det,'delCol':['Account','Value'],'renameCol':{'Data1':"Log Id", 'Data2': "User", 'Time': 'Date', 'Startdate': 'Time', 'Calcgrpid': 'Calc Grp Id'}},
        	barChart: {filter: {Account: "ACTIVITY", Bar: "CURR"}}
        },{
        	name: "Data Updates",
        	colors: "#00D19F",
        	filter: {Account: "DATA UPDATES"},
        	//smallText: {mapVal: (i,j) => {return (j-i)/j}},
        	debugReportOptions: {'data':db_perf_dataX_det,'delCol':['Account'],'renameCol':{'Data1':"Log Id", 'Data2': "User", 'Time': 'Date', 'Startdate': 'Time', 'Calcgrpid': 'Calc Grp Id'}},
        	barChart: {filter: {Account: "DATA UPDATES", Bar: "CURR"}}
        },{
        	name: "Avg Runtime",
        	colors: "#9F81DB",
        	data: db_perf_data_w_totalavg,
        	filter: {Account: ["AVG RUNTIME","AVG RUNTIME ","TOTAL RUNTIME"]}, //AVG RUNTIME, ACTIVITY, and TOTAL RUNTIME is included to show data in debug report
        	largeText: {text: "{value} s"},
        	staticMembers: {"Bar":["CURR","PREV"], "Account": ["AVG RUNTIME "]},
        	debugReportOptions: {'data':db_perf_dataX_det,'renameCol':{'Data1':"Log Id", 'Data2': "User", 'Time': 'Date', 'Startdate': 'Time', 'Calcgrpid': 'Calc Grp Id'}},
        	barChart: {filter: {Account: "AVG RUNTIME", Bar: "CURR"}, 
        				measureDisplay: ".2f"}
        },{
        	name: "Recs / Sec",
        	colors: "#E87503",
        	data: db_perf_data_w_totalavg,
        	filter: {Account: ["RECS / SEC","RECS / SEC ","ROWS PROCESSED","TOTAL RUNTIME"]}, //AVG RUNTIME, ACTIVITY, and TOTAL RUNTIME is included to show data in debug report
        	staticMembers: {"Bar":["CURR","PREV"], "Account": ["RECS / SEC "]},
        	debugReportOptions: {'data':db_perf_dataX_det,'renameCol':{'Data1':"Log Id", 'Data2': "User", 'Time': 'Date', 'Startdate': 'Time', 'Calcgrpid': 'Calc Grp Id'}},
        	barChart: {filter: {Account: "RECS / SEC", Bar: "CURR"}}  	
        }, {
        	name: "# Users",
        	colors: "#E456D0",
        	filter: {Account: "# USERS","Time": "TOTAL"},
        	measureDisplay: "default",
        	debugReportOptions: {'data':db_perf_dataX_det,'filter': {"Account":"# USERS"},'delCol':['Account','Data1','Value'],'renameCol':{'Data2': "User", 'Time': 'Date', 'Startdate': 'Time', 'Calcgrpid': 'Calc Grp Id'}},
        	//smallText: {mapVal: (i,j) => {return (j-i)/j}},
        	barChart: {filter: {Account: "# USERS", Bar: "CURR"}} 	    	
        }]
    }).on("done", (e,s) => {
    	done1 = true;
    	if (done1 && done2) {
    		var $refresh = $("#dar-context-selector > div > div > a");
    		$refresh.removeClass("spin");
    	}
    }).on("click", (a, e, n) => {
    	dtrend.selectionsClick("",n);
    });
    

    
    //trend graph
    var trendColor = ['#9cc3e7','#ffdb63','#f7b284', '#c7b2c4', '#aaaa11'];
    var timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
    var trendBarAct = {
    	colors: "#4273C5",			
		measureDisplay: 'short',
		filter: {Account: "ACTIVITY"},
		y: {label: ["Activity", "Time Zone: " + timeZone]}
    };
    
    var trendBarDUpt = {
    	colors: "#00D19F",	   
    	filter: {Account: "DATA UPDATES"},
    	y: {label: ["Data", "Time Zone: " + timeZone]}
    };   
    
    var trendBarRData = {
    	colors: "#9F81DB",
    	filter: {Account: "AVG RUNTIME"},
    	y: {label: ["Seconds", "Time Zone: " + timeZone]},
    	measureDisplay: 'default',
    };    
    
    var trendBarRecs = {
		//data: trendRecsData,
    	colors: "#E87503",
    	filter: {Account: "RECS / SEC"},
    	measureDisplay: 'default',
    	y: {label: ["Records", "Time Zone: " + timeZone]},
    }; 
    
    var trendBarUsers = {
    	colors: "#E456D0",    	
    	y: {label: "Heads"},  
    	filter: {Account: "# USERS"},
    	y: {label: ["Users","Time Zone: " + timeZone]},
    };    
    
    var dtrend = trendCharts({
    	element: 'dar_trend_line_bar',
    	hasAmountOptions: false,
    	hasSideButtons: false,
    	chartGroup: [{
			name:"TREND",
			chart: "bar-line",
			defaultOptions: {
						measureDisplay: 'short',
						responsive: false,
						data: db_perf_data,
						enableDebugReport: true,
						width: 1194, //fixed width to fix bug when the dashboard is loaded out of focus cause a negative width
						tooltip: {measureDisplay:"default", type:"full"},
			        	x: [{name: "HOUR",
			        		 dimension: "Time",
			        		 data: db_perf_data_hour,
			        		 text: (e, i, c) => {
			        			 var ret;
			        			 if (Number(e) < 12) {
			        				 if (e == '00') {
			        					 ret = "12 AM";
			        				 }
			        				 else {
			        					 ret = Number(e).toString() + " AM";
			        				 }
			        			 }
			        			 else {
			        				 if (e == '12'){
			        					 ret = "12 PM";
			        				 }
			        				 else{
			        					 var p = Number(e) - 12;
			        					 ret = p.toString() + " PM";
			        				 }
			        			 }
			        			 return ret;
			        			 },
			        		 //text2: (e, i, c) => {return dateFormat0(e,"d");},		        			 
			        		 staticMembers: ["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23"]
			        		 },
			        		{name: "MONTH",
			        		 dimension: "Time",
			        		 text: (e, i, c) => {
			        			 if (e.length <= 6) { //monthly
			        				 return dateFormat0(e,"yy");
			        			 }
			        			 else { //daily
			        				 return dateFormat0(e,"M");
			        			 }
			        		 },
	        			 	 text2: (e, i, c) => {
			        			 if (e.length <= 6) { //monthly
			        				 return dateFormat0(e,"M");
			        			 }
			        			 else { //daily
			        				 return dateFormat0(e,"d");
			        			 }	        			 		 
	        			 	 },
			        		 staticMembers: periodExpansionB(selectedMembers.DS_TIME[0],selectedMembers.DS_TIME[1])
	        			 	 },
			        		{name: "QUARTER",
			        	     dimension: "Time",
			        		 text: (e, i, c) => {
			        			 if (e.length <= 6) { //monthly
			        				 return dateFormat0(e,"yy");
			        			 }
			        			 else { //daily
			        				 return dateFormat0(e,"M");
			        			 }
			        		 },
	        			 	 text2: (e, i, c) => {
			        			 if (e.length <= 6) { //monthly
			        				 return dateFormat0(e,"M");
			        			 }
			        			 else { //daily
			        				 return dateFormat0(e,"d");
			        			 }	        			 		 
	        			 	 },
			        	     staticMembers: periodExpansionB(selectedMembers.DS_TIME[0],selectedMembers.DS_TIME[1])
			        	    }
			        	],
			        	z: {dimension: "Bar",
			        		staticMembers: ["CURR","PREV"]}
			        	},
			selections: [{
				title: "ACTIVITY TREND",
				value: "Activity",			
				selected: true,
				chartParam: trendBarAct
					},{
				title: "DATA UPDATES TREND",
				value: "Data Updates",		
				chartParam: trendBarDUpt
					},{
				title: "AVG RUNTIME TREND",
				value: "Avg Runtime",		
				chartParam: trendBarRData     					
					},{
				title: "RECS / SECOND TREND",
				value: "Recs / Sec",			
				chartParam: trendBarRecs
					},{
				title: "# USERS TREND",
				value: "# Users",
				chartParam: trendBarUsers
				}]
			}]
    }).on("data:done", (e,s) => {
    	done2 = true;
    	if (done1 && done2) {
    		var $refresh = $("#dar-context-selector > div > div > a");
    		$refresh.removeClass("spin");
    	}
    });
    
    function genericAjaxXMLPostSync(url, data){
        var result;
        $.ajax({
                url: url,
                type: 'POST',
                contentType: 'text/xml',
                data: data,
                dataType: 'xml',
                async: false,
                success: (response)=> { result = response; },
                error:  (jqXHR, textStatus, errorThrown)=> { result = jqXHR.responseText; }
               });
        return result;
    }    
    
    function xmlToJson(xml) {
    	  // Create the return object
    	  var obj = {};
    	  if (xml.nodeType == 1) { // element
    	    // do attributes
    	    if (xml.attributes.length > 0) {
    	    obj["@attributes"] = {};
    	      for (var j = 0; j < xml.attributes.length; j++) {
    	        var attribute = xml.attributes.item(j);
    	        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
    	      }
    	    }
    	  } else if (xml.nodeType == 3) { // text
    	    obj = xml.nodeValue;
    	  }
    	  // do children
    	  // If just one text node inside
    	  if (xml.hasChildNodes() && xml.childNodes.length === 1 && xml.childNodes[0].nodeType === 3) {
    	    obj = xml.childNodes[0].nodeValue;
    	  }
    	  else if (xml.hasChildNodes()) {
    	    for(var i = 0; i < xml.childNodes.length; i++) {
    	      var item = xml.childNodes.item(i);
    	      var nodeName = item.nodeName;
    	      if (typeof(obj[nodeName]) == "undefined") {
    	        obj[nodeName] = xmlToJson(item);
    	      } else {
    	        if (typeof(obj[nodeName].push) == "undefined") {
    	          var old = obj[nodeName];
    	          obj[nodeName] = [];
    	          obj[nodeName].push(old);
    	        }
    	        obj[nodeName].push(xmlToJson(item));
    	      }
    	    }
    	  }
    	  return obj;
	}    
    
    
});

//web services functions
function dataPerfDashRead(model, env, items, hrs = "", view = "DAY", cg, tz) {
	//var url = `zdar_proc_perf_dash_r_svc/100/zdar_proc_perf_dash_r_svcn/zdar_proc_perf_dash_r_bind`;
	var url = getConfig('zdar_calc_engine_bind');
	var modelA = model ? model : '%';
	modelA = modelA == 'ALL_MODELS' ? "" : modelA;
	var envA = env ? env : '%';
	var cgA = cg ? cg: '%'; 
	var tzA = tz ? tz: new Date().getTimezoneOffset().toString();
    var request = `<tns:ZdarProcPerfDashR>
           <Model>${modelA}</Model>
    	   <Env>${envA}</Env>
    	   <Calcgroupid>${cgA}</Calcgroupid>
    	   <Timezone>${tzA}</Timezone>
           <View>${view}</View><Tdata>`
    if (Array.isArray(items)) {
    	var itemsA = items;
    }
    else {
    	var itemsA = [items];
    }
    
    items.forEach(d => {
    	var acc = d.Account ? d.Account : "";
    	var bar = d.Bar ? d.Bar : "";
    	var from = d.TimeFrom ? d.TimeFrom : "";
    	var to = d.TimeTo ? d.TimeTo : "";
    	var hrsA = hrs == "ALL_HOURS" ? "" : hrs;
    	hrsA = d.Hrs ? d.Hrs : hrsA;
    	request += `<item><Account>${acc}</Account>
                    <Bar>${bar}</Bar>
                	<TimeFrom>${from}</TimeFrom>
                    <TimeTo>${to}</TimeTo>
                    <Hrs>${hrsA}</Hrs></item>`;
    });
    
	request += `</Tdata></tns:ZdarProcPerfDashR>`; 
    return new Promise((rs,rj) => {
    	try {
            function callBack(data) {
            	rs(data);
            }
            callWebServiceD(url, request, 'ZdarProcPerfDashRResponse',true, callBack);
    	}
    	catch(err) {
    		rj(err);
    	}
    });    

}


function callWebServiceD(url, request, responseHead, async = false, callback) {
	/* json data */
	// var response = getJSON(responseHead);
    // if(response) {
    //     if(async && callback) {
    //         callback(response);
    //     }
    //     return response;
	// }
	/* -- end */
    url = getURL(url);
    request = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="urn:sap-com:document:sap:soap:functions:mc-style">
                         <soap:Header/>
                         <soap:Body>
                         `+request+`
                         </soap:Body>
                       </soap:Envelope>`;
	var response = genericAjaxXMLPostSyncD(url, request, responseHead, async, callback);	
    if(!async){
        var header = "n0:"+responseHead;
        var output = {colHeaders: {}, columns: [], data: []}
        var result = xmlToJson(response);
        loader('hide');
        if(typeof(result["soap-env:Envelope"]["soap-env:Body"][header]["Tmonth"]) !== 'undefined'){
            var items =  result["soap-env:Envelope"]["soap-env:Body"][header]["Tmonth"]["item"];
            return items;
        }else{
            if(typeof(result["soap-env:Envelope"]["soap-env:Body"][header]['StatusMsgText']) !== 'undefined'){
                return result["soap-env:Envelope"]["soap-env:Body"][header]['StatusMsgText'];
            }else{
                return true;
            }
        }
    }
}

function genericAjaxXMLPostSyncD(url, data, responseHead, async = false, callback) {
    var result;
    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'text/xml',
        data: data,
        dataType: 'xml',
        async: async,
        success: (response) => {
            if(async){
                if(callback){
                    var header = "n0:"+responseHead;
                    //var output = {colHeaders: {}, columns: [], data: []}
                    result = xmlToJson(response);
                    //loader('hide');
                    var items;
                    if(typeof(result["soap-env:Envelope"]["soap-env:Body"][header]["Tmonth"]) !== 'undefined'){
                        items =  result["soap-env:Envelope"]["soap-env:Body"][header]["Tmonth"]["item"];
                        //return items;
                    }else{
                        if(typeof(result["soap-env:Envelope"]["soap-env:Body"][header]['StatusMsgText']) !== 'undefined'){
                            items =  result["soap-env:Envelope"]["soap-env:Body"][header]['StatusMsgText'];
                        }else{
                            items = true;
                        }
                    }
                    callback(items);
                }
            }else{
                result = response;
            }
        },
        error: (jqXHR, textStatus, errorThrown) => {
			result = jqXHR.responseText;
			if (jqXHR.status === 401) {
                displayCatchError('unauthorized',responseHead);
			}else if (jqXHR.status === 503 ) {
                displayCatchError('maintenance');
            }
            else if(url.indexOf('_c_') != -1 || url.indexOf('_w_') != -1){
                alert("Data was not saved successfully. Please try again, and report to your tech support if you continue to experience issues saving data");
            }
            else if(url.indexOf('_script_logic_execute_') != -1 ){
                alert("The web service call cannot reach the server. Please check your network connectivity and try again. If this issue continues to happen, please contact your technical support team for further assistance.");
                loader('hide');
			}
			setWebserviceOffline();
        }
    });
    if(!async){
        return result;
    }
}

function dateFormat0(date,format) {
	//convert yyyymmdd into readable date
	var year = date.substr(0,4);
	var month = date.substr(4,2);
	var day = date.substr(6);
	var cnDate = new Date(year + "/" + month + "/" + day);
	return $.datepicker.formatDate(format, cnDate);
}



function dashboardTrendSetMonth(from, to, x, param = null, type = "month") {
	var year0 = from.getFullYear();
	var month0 = from.getMonth();
	var day0 = from.getDate();
	var year1 = to.getFullYear();
	var month1 = to.getMonth();
	var day1 = to.getDate();
	var toPlusDay = new Date();
	toPlusDay.setDate(to.getDate()+1);
	var day2 = toPlusDay.getDate();
	
	var doByMonth = false;
	var doByQuarter = false;
	
	if (month0 != month1) {
		if (Math.abs(month1 - month0)> 1) { //more than one month
			doByMonth = true;
		}
		else { //one month range
			if (year0 != year1) { //more than a year
				doByMonth = true;
				doByQuarter = true;
			}
			else {
				if (day0 == 1) { //starting month
					doByMonth = true;
				}
				else if (day2 < day1) { //end of month
					doByMonth = true;
				}				
			}
		}
		
		if (Math.abs(month1 - month0)> 3) { //more than six months
			doByQuarter = true;
		}
	}
	else {		
		if (year0 != year1) { //more than a year
			doByMonth = true;
			doByQuarter = true;
		}
	}
	
	if (x) {
		var xOptions = x;
	}
	else {
		var xOptions = {};
	}
	
	if (param) {
		$.extend(true,xOptions,param);
	}
	
	if (!doByQuarter) {
		xOptions.sumDimensions = {"Time": e => {
			var ret = "";
			if (doByMonth) {
				ret = e.substr(0,6) + day0; //cut off days
			}
			else {
				ret = e;
			}
			return ret;
		}};		
	}
	else{
		if (type == 'quarter') {
			xOptions.sumDimensions = {"Time": e => {
				var ret = "";
				var month = Number(e.substr(4,2));
				var qrt = (Math.floor((Number(month) - 1) / 3) + 1) * 3;
				qrt = (qrt.toString().length < 2 ? "0" : "") + qrt.toString();
				ret = e.substr(0,4) + qrt + day0.toString();
				return ret;
			}};					
		}
	}
	
	if (doByQuarter && type == 'quarter') {
		xOptions.staticMembers = periodExpansionB(moment(from).format("YYYYMMDDhhmmss"),
				moment(to).format("YYYYMMDDhhmmss"), "quarter");
		xOptions.text = (e, i, c) => {return e.substr(0,4);}
		xOptions.text2 = (e, i, c) => {
			var ret = "";
			switch (e.substr(4,2)) {
			case "03":
				ret = "Q1";
			case "06":
				ret = "Q2";
			case "09":
				ret = "Q3";
			case "12":
				ret = "Q4";
			}
			return ret;
		}				
	}
	else if (doByMonth) {
		xOptions.staticMembers = periodExpansionB(moment(from).format("YYYYMMDDhhmmss"),
				moment(to).format("YYYYMMDDhhmmss"), "month");
		xOptions.text = (e, i, c) => {return dateFormat0(e,"yy");}
		xOptions.text2 = (e, i, c) => {return dateFormat0(e,"M");}		
	}
	else {
		xOptions.staticMembers = periodExpansionB(moment(from).format("YYYYMMDDhhmmss"),
				moment(to).format("YYYYMMDDhhmmss"));
		xOptions.text = (e, i, c) => {return dateFormat0(e,"M");}
		xOptions.text2 = (e, i, c) => {return dateFormat0(e,"d");}
	}
	
	return xOptions;
}


function dataPerfDashDtlRead(model, env, items, hrs = "", view = "DAY", cg, tz) {
	//var url = `zdar_proc_perf_dash_r_svc/100/zdar_proc_perf_dash_r_svcn/zdar_proc_perf_dash_r_bind`;
	var url = getConfig('zdar_calc_engine_bind');
	var modelA = model ? model : '%';
	modelA = modelA == 'ALL_MODELS' ? "" : modelA;
	var envA = env ? env : '%';
	var cgA = cg ? cg: '%'; 
	var tzA = tz ? tz: new Date().getTimezoneOffset().toString();
    var request = `<tns:ZdarProcPerfDashDtlR>
           <Model>${modelA}</Model>
    	   <Env>${envA}</Env>
    	   <Calcgroupid>${cgA}</Calcgroupid>
    	   <Timezone>${tzA}</Timezone>
           <View>${view}</View><Tdata>`
    if (Array.isArray(items)) {
    	var itemsA = items;
    }
    else {
    	var itemsA = [items];
    }
    
    items.forEach(d => {
    	var acc = d.Account ? d.Account : "";
    	var bar = d.Bar ? d.Bar : "";
    	var from = d.TimeFrom ? d.TimeFrom : "";
    	var to = d.TimeTo ? d.TimeTo : "";
    	var hrsA = hrs == "ALL_HOURS" ? "" : hrs;
    	hrsA = d.Hrs ? d.Hrs : hrsA;
    	request += `<item><Account>${acc}</Account>
                    <Bar>${bar}</Bar>
                	<TimeFrom>${from}</TimeFrom>
                    <TimeTo>${to}</TimeTo>
                    <Hrs>${hrsA}</Hrs></item>`;
    });
    
	request += `</Tdata></tns:ZdarProcPerfDashDtlR>`; 
    return new Promise((rs,rj) => {
    	try {
            function callBack(data) {
            	rs(data);
            }
            callWebServiceD(url, request, 'ZdarProcPerfDashDtlRResponse',true, callBack);
    	}
    	catch(err) {
    		rj(err);
    	}
    });    

}
