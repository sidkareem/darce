// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE
(function (mod) {
	if (typeof exports == "object" && typeof module == "object") // CommonJS
		mod(require("codemirror"));
	else if (typeof define == "function" && define.amd) // AMD
		define(["codemirror"], mod);
	else // Plain browser env
		mod(CodeMirror);
})(async function (CodeMirror) {
	"use strict";
	var dimensions = ''; var dimension_properties = '';
	var dimensionsMap = {}, dimension_propertiesMap = {}, calc_variablesMap = {}, ntdimension_propertiesMap = {};
	//var calc_driversMap = {};
	var calc_variables_rpt_Map = {};
	var calc_steps_Map = {}, calc_drv_Map = {};
	var endLoop = false;
	//try {
		while(!endLoop) {
			dimensions = await getIndexedDBStorage('dimensions');
			dimension_properties = await getIndexedDBStorage('properties');
			if(dimensions != '' && dimension_properties != '') {
				if (dimensions) {
					dimensions.forEach(item => {
						if (!dimensionsMap[item.Dimension]) {
							dimensionsMap[item.Dimension] = {};
						}
						dimensionsMap[item.Dimension].NumHier= item.NumHier;
					});
					dimension_properties.forEach(item => {
						dimension_propertiesMap[item.Dimension.toUpperCase() + '|' + item.Name.toUpperCase()] = true;
						ntdimension_propertiesMap[item.Name.toUpperCase()] = true;
					});
				}
				endLoop = true;				
			}
		}		
	//}
	//catch(err) {
	//	alert("Syntax highlighting may not work properly because dimension meta data was either missing or not downloaded successfully");
	//}

	var darce_syntax = {
		'ENTITY1': true,
		'ENTITY2': true,
		'HIER': true,
		'ROPERTY': true,
		'PARENT_DIMS': true,
		'SUPPRESS_NO_MATCH': true,
		'SINGLE_QUERY': true
	};	
	
	var sql_syntax = { 
			'AND': true,
			'AS': true, 
			'AVG': true, 
			'BETWEEN': true, 
			'CASE': true, 
			'COUNT': true,  
			'DELETE': true,  
			'HAVING': true,  
			'INSERT': true,  
			'LIKE': true, 
			'LIMIT': true, 
			'MAX': true, 
			'MIN': true, 
		 	'OR': true, 
			'ROUND': true, 
			'SELECT': true, 
			'SUM': true, 
			'UPDATE': true, 
			'WHERE': true, 
			'WITH': true, 
			'NOT': true, 
			'AMOUNT': true, 
			'IN': true,
			'WHEN': true,
			'THEN': true,
			'ELSE': true,
			'END': true,
			'IF': true,
			'RTRIM': true,
			'SUBSTR' : true,
			'LENGTH' : true,
			'CAST' : true,
			'INT' : true,
			'LEFT' : true,
			'RIGHT' : true,
			'ABS' : true,
			'REPLACE' : true,
			'LTRIM' : true}
	
	var sql_syntax_w1sp = {
			'ALTER TABLE': true, 
			'CREATE TABLE': true, 
			'GROUP BY': true, 
			'INNER JOIN': true, 
			'IS NULL': true, 
			'ORDER BY': true, 
			'OUTER JOIN': true, 
			'SELECT DISTINCT': true}
	
	var sql_syntax_w2sp = {
			'IS NOT NULL': true, 
	}
	
	var models, modelsMap = {};
	
	CodeMirror.defineMode("custom", function (config, parserConfig) {
		var indentUnit = config.indentUnit;
		var statementIndent = parserConfig.statementIndent;
		var jsonldMode = parserConfig.jsonld;
		var jsonMode = parserConfig.json || jsonldMode;
		var isTS = parserConfig.typescript;
		var wordRE = parserConfig.wordCharacters || /[\w$\xa1-\uffff]/;
		var prevTokenText = ''; //used to store the previous text (e.g. dimension and properties matching) 
		var funcToken = {}; //used to process function tokens (e.g. @BAS)
		var calcIdUndsc = '', calcGrpIdVarVal = '';
		var calcIdStep = '', calcIdDrv = '';
		// Tokenizer
		var isJsonldKeyword = /^@(context|id|value|language|type|container|list|set|reverse|index|base|vocab|graph)"/;
		// Used as scratch variables to communicate multiple values without
		// consing up tons of objects.
		var type, content;
		
		function ret(tp, style, cont) {
			type = tp;
			content = cont;
			return style;
		}

		function tokenBase(stream, state) {
			try {
				var ch = stream.next();
				if (state.lastType == 'sof') {
					funcToken.name = ''; //reset 
					models = getLocalStorage('models');
					prevTokenText = '';
					modelsMap = {};
					if (models) {
						if (models.length) {
							var modelsAry = models;
						}
						else {
							var modelsAry = [models];
						}
						modelsAry.forEach(item => {
							modelsMap[item.DobjectId.toUpperCase()] = true;
						});					
					}
				}		
				funcToken.processed = false; //reset the function token process flag used to skip optional parameters
				if (ch == "'") {
					state.tokenize = tokenString(ch);
					return state.tokenize(stream, state);
				} else if (ch == "%" && stream.eat("%")) {
	                state.tokenize = tokenPercentage;
	                return tokenPercentage(stream, state);
				} else if (ch == "@") {
					state.tokenize = tokenAtSign;
					return tokenAtSign(stream, state);
				} else if (ch == '_') {  //new
					state.tokenize = tokenUnderscore;
					return tokenUnderscore(stream, state);	
				} else if (ch == ".") {
					stream.eatWhile(wordRE);
					var word = stream.current();
					word = word.substr(1);
					
					if (funcToken.name) { //prioritize the function parameters
						if (funcToken.pIncr >= funcToken.param.length) {
							funcToken.pIncr = funcToken.param.length - 1;
						}					
						var paramN = funcToken.param[funcToken.pIncr];
						var optionalSl = paramN.indexOf('/');
						if (paramN == 'hier/o') { //dimension with optional hierarchy
							var heir = false;
							var hTest = /^[Hh][0-9]$/g;
							if (hTest.test(word)) {
								var hierNum = word.substr(1);
								if (funcToken.dimension) {
									if (dimensionsMap[funcToken.dimension]) {
										var dim = dimensionsMap[funcToken.dimension];
										var hierMax = dim.NumHier;
										if (!isNaN(hierMax) && !isNaN(hierNum)){
											if (Number(hierMax) >= Number(hierNum) && Number(hierNum) > 0) {
												heir = true;
											}										
										}
									}
								}
								if (heir) {
									funcToken.pIncr++;
									funcToken.processed = true;
									return "dimensions";
								}
								else {
									funcToken.name = '';
									return "invalid-syntax";
								}
							}
							else {
								funcToken.name = '';
								return "invalid-syntax";
							}
						}
					}
					
					var prop_exists = false, dim_exists = false;
	            	if (dimension_propertiesMap[prevTokenText + "|" + word.toUpperCase()]) {
	            		prop_exists = true;
	            	}
	                if (dimensionsMap[word.toUpperCase()]) {
	                	dim_exists = true;
	                }            	
	            	
					if (prop_exists) {
						return 'dimension-properties';
					} else if(darce_syntax[word.toUpperCase()]) {
						return "percentage";
					} else if(dim_exists) {
						return "dimensions";
					} else if(stream.peek() == ')' || stream.peek() == ',') {
						var regExp = /@[a-zA-Z]+\(.*?\,.*?\)/g;
						var matches;
						while(matches = regExp.exec(stream.string)) {
							if(matches !== null) {
								var word = matches[0];
								var pos = word.indexOf("(") + 1;
								var trim_word = word.slice(pos, word.lastIndexOf(")"));
								var split_word = trim_word.split(',');
								var word = split_word[0];
								var member_set = split_word[1];
				                if(dimensionsMap[word.toUpperCase()] || (member_set === stream.current())) {
									return "quotes";
								}
							}
						}
					} else if (!checkIsValid(word) && !$.isNumeric(word)) {
	                    return ret("invalid-syntax", "invalid-syntax", word)
	                }
				} else if (ch == ',') {
					if (stream.peek() == ")") {
						stream.eat(')');
						funcToken.name = '';
						return "invalid-syntax";
					}
				} else if (wordRE.test(ch)) {
					stream.eatWhile(wordRE);
					var word = stream.current();
					
					//function parameters
					if (funcToken.name) { //prioritize the function parameters
						if (funcToken.pIncr >= funcToken.param.length) {
							funcToken.pIncr = funcToken.param.length - 1;
						}
						var paramN = funcToken.param[funcToken.pIncr];
						var optionalSl = paramN.indexOf('/o');
						var optionalVal = paramN.substr(optionalSl);
						if (optionalSl > -1) {
							funcToken.pIncr++;
							paramN = funcToken.param[funcToken.pIncr];
						}
						var optionalSl = paramN.indexOf('/');
						var param = paramN.substr(0,optionalSl);
						if (paramN == 'dimension') { //dimension with optional hierarchy
							var dim_exists = false;
			                if (dimensionsMap[word.toUpperCase()]) {
			                	dim_exists = true;
			                } 						
							
							if (stream.peek() == ')') {
								funcToken.name = ''; //end of the function
							}
							
							if (dim_exists) {
								if (optionalVal != 'c') {
									funcToken.pIncr++;
								}
								funcToken.dimension = word.toUpperCase();
								funcToken.processed = true;
								return "dimensions";
							}
							else {
								funcToken.name = '';
								return "invalid-syntax";
							}
						}
						else if (param == 'member') { //or percentage
							
							if (stream.peek() == '.') { //include the dot as member
								stream.eat('.');
								stream.eatWhile(wordRE);
								var word = stream.current();
							}
													
							if (optionalVal != 'c') {
								funcToken.pIncr++;
							}
							
							if (stream.peek() == ')') {
								funcToken.name = ''; //end of the function
							}
							
							funcToken.processed = true;
							return "quotes";
						}
						/*else if (param == 'qmember') {
							if (stream.peek() == "'") { //must enclosed by quotation mark
								while ((next = stream.next()) != null) {
									if (stream.peek() == "'") break;
								}
								
								if (optionalVal != 'c') {
									funcToken.pIncr++;
								}
								if (stream.peek() == ')') {
									funcToken.name = ''; //end of the function
								}
								funcToken.processed = true;
								return 'quotes';
							}
							else {
								funcToken.name = "";
								return "invalid-syntax";
							}
							
						}*/
						
					}
					
					if (state.lastType != ".") {
						word = word.toUpperCase();
						if (dimensionsMap[word.toUpperCase()] || word == 'SCOPE') {
							if (word == 'SCOPE') {
								if (stream.peek() == '.') {
									stream.next();
								}
								return "percentage";
							}
							if($.isNumeric(word)) {
								stream.next();
							}
							var pattern=/^[a-zA-Z0-9]*$/;
							if((!pattern.test(stream.peek()) || typeof(stream.peek()) == 'undefined') && stream.peek() != ')') {
								prevTokenText = word.toUpperCase();
								return "dimensions";
							} else {
								return "quotes";
							}
	                    }
						if (word == "async" && stream.match(/^(\s|\/\*.*?\*\/)*[\[\(\w]/, false)) return ret("async", "keyword", word)
					}
					stream.eatWhile(/\w/);
					
					if (modelsMap[word.toUpperCase()]) {
						return "models";
					}

					if (sql_syntax[word.toUpperCase()]) {
						return "valid-syntax";
					}


					if (stream.peek() == ' ') { //for two words
						stream.eatSpace();
						stream.eatWhile(wordRE);
						var tmp = stream.current().split(' ');
						if (tmp.length > 1) {
							var word2 = word + ' ' + tmp[1];
							if (sql_syntax_w1sp[word2.toUpperCase()]) {
								return "valid-syntax";
							}
							else {
								stream.backUp(tmp[1].length);
							}						
						}
					}
					
					if ($.isNumeric(word)) {
						if(stream.peek() == '.') {
							return 'quotes';
						} 
						return "variable";
	                }
	                if(checkVariablePropValid(word) && $('.calc-group-stepy-variable').is(':visible')) {
	                    return ret("dimension-properties", "dimension-properties", word)
					}
					
					if(checkSourceAmountDataAlias(word) || darce_syntax[word.toUpperCase()]) { // checkIsValid(word) || 
						return "percentage";
					}

					if (!$('.cg-detail-form-content').is(':visible')) {
						if(checkIsValid(word)) {
							return "percentage";
						}
					}

					if(config.selector.id === 'pre-run-scope-adj') { // PRE RUN SCOPE ADJUSTMENT
						return 'quotes';
					}

					// calc driver lone property
					if ($("#driver-modal").is(':visible')) {
						var $dimSelector = $("#driver-modal #driver-dimension");
						var dimDrv = $dimSelector.val();
						var flag = false;
						if (dimDrv) {
							if (dimension_propertiesMap[dimDrv.toUpperCase() + '|' + word.toUpperCase()]) {
								flag = true;
							}
						}
						if (flag) {
							return "dimension-properties";
						}
					}
					
					if(stream.peek() == ')' || stream.peek() == ',' || stream.peek() == '.') {
						var regExp = /@[a-zA-Z]+\(.*?\,.*?\)/g;
						var matches;
						while(matches = regExp.exec(stream.string)) {
							stream.next();
							if(matches !== null) {
								var word = matches[0];
								var pos = word.indexOf("(") + 1;
								var trim_word = word.slice(pos, word.lastIndexOf(")"));
								var split_word = trim_word.split(',');
								var word = split_word[0];
								var member_set = split_word[1];
								if(dimensionsMap[word.toUpperCase()] || (member_set === stream.current())) {
									return "quotes";
								}
							}
						}
					}

					if(!ntdimension_propertiesMap[word.toUpperCase()] && !dimensionsMap[word.toUpperCase()]) {
						return ret("invalid-syntax", "invalid-syntax", word)
					}
				}
				
				
			}
			catch(err){
				alert("Syntax highlighting may not work properly because dimension meta data was either missing or not downloaded successfully");
			}
		}	
        
        function checkVariablePropValid(word) {
        	try {
                var editor = config.selector.id;
                var dimension = $('#'+editor).closest('#variable-modal-form').find('.dimension-list').val();
                if(typeof(dimension) !== 'undefined') {
                	if (dimension_propertiesMap[dimension.toUpperCase() + "|" + word.toUpperCase()]) {
                		return true;
                	}
                }
                return false;        		
        	}
        	catch(err) {
        		alert("Syntax highlighting may not work properly because dimension meta data was either missing or not downloaded successfully");
        		return false; 
        	}
        }

		function checkSourceAmountDataAlias(word) {
			if ($('#calc-data-alias').val() == word) {
				return true;
			}
			return false;
		}

		function tokenString(quote) {
			return function (stream, state) {
				var escaped = false,
					next;
				if (jsonldMode && stream.peek() == "@" && stream.match(isJsonldKeyword)) {
					state.tokenize = tokenBase;
					return ret("jsonld-keyword", "meta");
				}
				while ((next = stream.next()) != null) {
					if (next == quote && !escaped) break;
					escaped = !escaped && next == "\\";
				}
				if (!escaped) state.tokenize = tokenBase;
				return ret("quotes", "quotes");
			};
		}

		function tokenPercentage(stream, state) {
			var maybeEnd = false,
				ch;
			while (ch = stream.next()) {
				if (ch == "%" && maybeEnd) {
					state.tokenize = tokenBase;
					break;
				}
				maybeEnd = (ch == "%");
			}
			var word = stream.current().replace(/%/g, '');
			
			//function parameters
			if (funcToken.name) { //prioritize the function parameters
				if (funcToken.pIncr >= funcToken.param.length) {
					funcToken.pIncr = funcToken.param.length - 1;
				}
				var paramN = funcToken.param[funcToken.pIncr];
				var optionalSl = paramN.indexOf('/o');
				var optionalVal = paramN.substr(optionalSl);
				if (optionalSl > -1) {
					funcToken.pIncr++;
					paramN = funcToken.param[funcToken.pIncr];
				}
				var optionalSl = paramN.indexOf('/');
				var param = paramN.substr(0,optionalSl);
				if (param == 'member') { //or percentage
															
					if (optionalVal != 'c') {
						funcToken.pIncr++;
					}
					
					if (stream.peek() == ')') {
						funcToken.name = ''; //end of the function
					}
					
					funcToken.processed = true;
					//return "percentage";
				}
			}			
			
			prevTokenText = word.toUpperCase();
			if (checkIsValid(word)) {
				return ret("percentage", "percentage");
			} else {
				return ret("invalid-syntax", "invalid-syntax");
			}
		}

		function tokenUnderscore(stream, state) { //new
			
			try {
				var calcIdtmp = getParamCalcId();
				
				//repeat step variable
				var repeatVar = $('#repeat-step-modal #repeat-step').val(); 

				//repeat variables
				var calcgrp = getParamCalcGroupId();
				if (calcGrpIdVarVal != calcgrp) {
					calcGrpIdVarVal = calcgrp;
					var variables = getCalcGroupDetailLocalCache('VARIABLE_DATA', getParamCalcGroupId());
					calc_variablesMap = {};
					calc_variables_rpt_Map = {};
					variables.forEach(item => {
						calc_variablesMap[item.VariableId.toUpperCase()] = true;
						if (item.VariableType.toUpperCase() == 'REPEAT') {
							calc_variables_rpt_Map[item.VariableId.toUpperCase()] = true;
						}
					});
				}			

				stream.eatWhile(wordRE);
				var word = stream.current().substr(1);				
				var pass = false
				state.tokenize = tokenBase;
				
				pass = driverCheck(word.toUpperCase());
				if (!pass) {
					pass = stepCheck(word.toUpperCase(), true);
				}
				
				if (pass) {
					if (prevTokenText == 'REPEAT_ID') {
						return ret("percentage", "percentage");
					}
					else if ('%%' + prevTokenText + '%%' == repeatVar && $('#step-modal').is(':visible')) {
						return ret("percentage", "percentage");
					}
					else if (calc_variables_rpt_Map[prevTokenText]){
						return ret("percentage", "percentage");
					}
					else {
						return ret("invalid-syntax", "invalid-syntax");
					}				
				}
				else {
					return ret("invalid-syntax", "invalid-syntax");
				}				
			}
			catch(err) {
				alert("Syntax highlighting may not work properly because dimension meta data was either missing or not downloaded successfully");
			}
		}
		
		function tokenAtSign(stream, state) { //new
			stream.eatWhile(wordRE);
			var word = stream.current();
			if (word) {
				word = word.substr(1);
			}
			if (word) {
				var flag = false;
				state.tokenize = tokenBase;
				switch (word.toUpperCase()) {
				case 'BAS': //first parameter is a dimension with Hn and next parameters are members
					flag = true;
					funcToken.name = word.toUpperCase();
					funcToken.param = ['dimension','hier/o','member/c'];
					funcToken.pIncr = 0;
					break;
				case 'MIN':
					flag = true;
					funcToken.name = word.toUpperCase();
					funcToken.param = ['variable/o','qmember/c'];
					funcToken.pIncr = 0;
					break;
				case 'MAX':
					flag = true;
					funcToken.name = word.toUpperCase();
					funcToken.param = ['variable/o','qmember/c'];
					funcToken.pIncr = 0;
					break;
				default:
					funcToken.name = '';
					funcToken.pIncr = 0;
				}
				if (flag) {
					return ret("percentage", "percentage");
				}
				else {
					return ret("invalid-syntax", "invalid-syntax");
				}
			}
			else {
				state.tokenize = tokenBase;
				funcToken.name = '';
				funcToken.pIncr = 0;
				return ret("invalid-syntax", "invalid-syntax");
			}
		}
		
		function checkIsValid(word) {
			var flag = false;
			var calcgrp = getParamCalcGroupId();
			
			try {
				if (calcGrpIdVarVal != calcgrp) {
					calcGrpIdVarVal = calcgrp;
					var variables = getCalcGroupDetailLocalCache('VARIABLE_DATA', getParamCalcGroupId());
					calc_variablesMap = {};
					calc_variables_rpt_Map = {};
					if (variables.length) {
						variables.forEach(item => {
							calc_variablesMap[item.VariableId.toUpperCase()] = true;
							if (item.VariableType.toUpperCase() == 'REPEAT') {
								calc_variables_rpt_Map[item.VariableId.toUpperCase()] = true;
							}
						});					
					}
					else {
						if (variables.VariableId) {
							calc_variablesMap[variables.VariableId.toUpperCase()] = true;
							if (variables.VariableType.toUpperCase() == 'REPEAT') {
								calc_variables_rpt_Map[variables.VariableId.toUpperCase()] = true;
							}
							
						}
					}
				}
				
				if ($('.cg-detail-form-content').is(':visible')) {
					if (calc_variablesMap[word.toUpperCase()]) {
						flag = true;
					}
					
	                if(word.slice(-4, word.length) === '_SET') {
	                    word = word.replace('_SET', '');
	                    if (dimensionsMap[word.toUpperCase()]) {
	                    	flag = true;
	                    }
	                }
	            }

	            if ($('.calculation-section').is(':visible')) {
	                if(word.slice(-4, word.length) === '_SET') {
	    				if (calc_variablesMap[word.toUpperCase()]) {
	    					flag = true;
	    				}                	
	                    word = word.replace('_SET', '');
	                    if (dimensionsMap[word.toUpperCase()]) {
	                    	flag = true;
	                    }                    
	                }
	                else {
	                	
	                    if (word.toLowerCase() == 'repeat_id') {
	                		flag = true;
	                	}
	                    else {
	                    	try {
	                    		//driver check
	                			if($("li." + getParamModelId()+"_"+getParamCalcGroupId() + " li." + getParamCalcId() + "_Drivers li.Drivers_"+word).length) {
	        						flag = true;
	        					}
	                			if (stepCheck(word.toUpperCase())){
	                				flag = true;
	                			};
	                    	}
	                    	catch (e) {

	                    	}
	                    	
	        				if (calc_variablesMap[word.toUpperCase()]) {
	        					flag = true;
	        				}                 	                    	
	                    }
	                }
				}
				return flag;				
			}
			catch(err) {
				alert("Syntax highlighting may not work properly because dimension meta data was either missing or not downloaded successfully");
			}
			

		}
		
		function stepCheck(word, bcheckRepeat) {
			
			var checkRepeat = bcheckRepeat ? true : false;
			
			try {
				var calcidTmp = getParamCalcId();
				var currentStepId = $('#step-modal #step-id').val().toUpperCase();
				var pos = -1;
				if (calcIdStep != calcidTmp) {
					calcIdStep = calcidTmp;
					var hdr = getCalcDetailLocalCache('STEP_DATA', calcIdStep);
					calc_steps_Map = {};
					if (hdr.length) {
						hdr.forEach(item => {
							calc_steps_Map[item.StepId.toUpperCase()] = item;
						});
					}
				}
				if (calc_steps_Map) {
					if (calc_steps_Map[currentStepId]) {
						var tmp = calc_steps_Map[currentStepId].StepOrder;
						if (!isNaN(tmp)) {
							pos = Number(tmp); //get the step order of current step
						}
					}
					if (calc_steps_Map[word]) {
						var st = calc_steps_Map[word];
						var tmp = st.StepOrder;
						if (!isNaN(tmp)) {
							var cPos = Number(tmp);
							if ((cPos < pos) || pos == -1) { // check the step order, or it is a new step
								//if (st.ReuseResultsInCalc == '-1' && st.RepeatStep != '') {
								if (checkRepeat) {
									if (st.ReuseResultsInCalc == '-1' && st.RepeatStep != '') {
										return true;
									}										
								}
								else {
									if (st.ReuseResultsInCalc == '-1' ) {
										return true;
									}									
								}

							}
						}					
					}
				}
				return false;				
			}
			catch(err) {
			//	alert("5. Syntax highlighting may not work properly because dimension meta data was either missing or not downloaded successfully");
			}
		}
		
		function driverCheck(word) {
			
			try {
				var calcidTmp = getParamCalcId();
				if (calcIdDrv != calcidTmp) {
					calcIdDrv = calcidTmp;
					var drv = getCalcDetailLocalCache('DRIVER_DATA', calcIdStep);
					calc_drv_Map = {};
					if (drv.length) {
						drv.forEach(item => {
							calc_drv_Map[item.DriverId.toUpperCase()] = item;
						});
					}
				}
				
				if (calc_drv_Map) {
					if (calc_drv_Map[word]) {
						var st = calc_drv_Map[word];
						if (st.RepeatDriver != '') {
							return true;
						}
					}
				}
				
				return false;				
			}
			catch(err) {
				alert("Syntax highlighting may not work properly because dimension meta data was either missing or not downloaded successfully");
			}
			

		}

		function tokenComment(stream, state) {
			var maybeEnd = false,
				ch;
			while (ch = stream.next()) {
				if (ch == "%" && maybeEnd) {
					state.tokenize = tokenBase;
					break;
				}
				maybeEnd = (ch == "%");
			}
			var word = stream.current().replace(/%/g, '');
			if (checkIsValid(word)) {
				return ret("percentage", "percentage");
			} else {
				return ret("invalid-syntax", "invalid-syntax");
			}
			//   return ret("percentage", "percentage");
		}

		function tokenQuasi(stream, state) {
			var escaped = false,
				next;
			while ((next = stream.next()) != null) {
				if (!escaped && (next == "`" || next == "$" && stream.eat("{"))) {
					state.tokenize = tokenBase;
					break;
				}
				escaped = !escaped && next == "\\";
			}
			return ret("quasi", "string-2", stream.current());
		}
		var brackets = "([{}])";
		// This is a crude lookahead trick to try and notice that we're
		// parsing the argument patterns for a fat-arrow function before we
		// actually hit the arrow token. It only works if the arrow is on
		// the same line as the arguments and there's no strange noise
		// (comments) in between. Fallback is to only notice when we hit the
		// arrow, and not declare the arguments as locals for the arrow
		// body.
		function findFatArrow(stream, state) {
			if (state.fatArrowAt) state.fatArrowAt = null;
			var arrow = stream.string.indexOf("=>", stream.start);
			if (arrow < 0) return;
			if (isTS) { // Try to skip TypeScript return type declarations after the arguments
				var m = /:\s*(?:\w+(?:<[^>]*>|\[\])?|\{[^}]*\})\s*$/.exec(stream.string.slice(stream.start, arrow))
				if (m) arrow = m.index
			}
			var depth = 0,
				sawSomething = false;
			for (var pos = arrow - 1; pos >= 0; --pos) {
				var ch = stream.string.charAt(pos);
				var bracket = brackets.indexOf(ch);
				if (bracket >= 0 && bracket < 3) {
					if (!depth) {
						++pos;
						break;
					}
					if (--depth == 0) {
						if (ch == "(") sawSomething = true;
						break;
					}
				} else if (bracket >= 3 && bracket < 6) {
					++depth;
				} else if (wordRE.test(ch)) {
					sawSomething = true;
				} else if (/["'\/]/.test(ch)) {
					return;
				} else if (sawSomething && !depth) {
					++pos;
					break;
				}
			}
			if (sawSomething && !depth) state.fatArrowAt = pos;
		}
		// Parser
		var atomicTypes = {
			"atom": true,
			"number": true,
			"variable": true,
			"string": true,
			"regexp": true,
			"this": true,
			"jsonld-keyword": true
		};

		function JSLexical(indented, column, type, align, prev, info) {
			this.indented = indented;
			this.column = column;
			this.type = type;
			this.prev = prev;
			this.info = info;
			if (align != null) this.align = align;
		}

		function inScope(state, varname) {
			for (var v = state.localVars; v; v = v.next)
				if (v.name == varname) return true;
			for (var cx = state.context; cx; cx = cx.prev) {
				for (var v = cx.vars; v; v = v.next)
					if (v.name == varname) return true;
			}
		}

		function parseJS(state, style, type, content, stream) {
			var cc = state.cc;
			// Communicate our context to the combinators.
			// (Less wasteful than consing up a hundred closures on every call.)
			cx.state = state;
			cx.stream = stream;
			cx.marked = null, cx.cc = cc;
			cx.style = style;
			if (!state.lexical.hasOwnProperty("align")) state.lexical.align = true;
			while (true) {
				var combinator = cc.length ? cc.pop() : jsonMode ? expression : statement;
				if (combinator(type, content)) {
					while (cc.length && cc[cc.length - 1].lex) cc.pop()();
					if (cx.marked) return cx.marked;
					if (type == "variable" && inScope(state, content)) return "variable-2";
					return style;
				}
			}
		}
		// Combinator utils
		var cx = {
			state: null,
			column: null,
			marked: null,
			cc: null
		};

		function pass() {
			for (var i = arguments.length - 1; i >= 0; i--) cx.cc.push(arguments[i]);
		}

		function cont() {
			pass.apply(null, arguments);
			return true;
		}

		function inList(name, list) {
			for (var v = list; v; v = v.next)
				if (v.name == name) return true
			return false;
		}

		function register(varname) {
			var state = cx.state;
			cx.marked = "variable";
			if (state.context) {
				if (state.lexical.info == "var" && state.context && state.context.block) {
					// FIXME function decls are also not block scoped
					var newContext = registerVarScoped(varname, state.context)
					if (newContext != null) {
						state.context = newContext
						return
					}
				} else if (!inList(varname, state.localVars)) {
					state.localVars = new Var(varname, state.localVars)
					return
				}
			}
			// Fall through means this is global
			if (parserConfig.globalVars && !inList(varname, state.globalVars)) state.globalVars = new Var(varname, state.globalVars)
		}

		function registerVarScoped(varname, context) {
			if (!context) {
				return null
			} else if (context.block) {
				var inner = registerVarScoped(varname, context.prev)
				if (!inner) return null
				if (inner == context.prev) return context
				return new Context(inner, context.vars, true)
			} else if (inList(varname, context.vars)) {
				return context
			} else {
				return new Context(context.prev, new Var(varname, context.vars), false)
			}
		}

		function isModifier(name) {
			return name == "public" || name == "private" || name == "protected" || name == "abstract" || name == "readonly"
		}
		// Combinators
		function Context(prev, vars, block) {
			this.prev = prev;
			this.vars = vars;
			this.block = block
		}

		function Var(name, next) {
			this.name = name;
			this.next = next
		}
		var defaultVars = new Var("this", new Var("arguments", null))

		function pushcontext() {
			cx.state.context = new Context(cx.state.context, cx.state.localVars, false)
			cx.state.localVars = defaultVars
		}

		function pushblockcontext() {
			cx.state.context = new Context(cx.state.context, cx.state.localVars, true)
			cx.state.localVars = null
		}

		function popcontext() {
			cx.state.localVars = cx.state.context.vars
			cx.state.context = cx.state.context.prev
		}
		popcontext.lex = true

		function pushlex(type, info) {
			var result = function () {
				var state = cx.state,
					indent = state.indented;
				if (state.lexical.type == "stat") indent = state.lexical.indented;
				else
					for (var outer = state.lexical; outer && outer.type == ")" && outer.align; outer = outer.prev) indent = outer.indented;
				state.lexical = new JSLexical(indent, cx.stream.column(), type, null, state.lexical, info);
			};
			result.lex = true;
			return result;
		}

		function poplex() {
			var state = cx.state;
			if (state.lexical.prev) {
				if (state.lexical.type == ")") state.indented = state.lexical.indented;
				state.lexical = state.lexical.prev;
			}
		}
		poplex.lex = true;

		function expect(wanted) {
			function exp(type) {
				if (type == wanted) return cont();
				else if (wanted == ";" || type == "}" || type == ")" || type == "]") return pass();
				else return cont(exp);
			};
			return exp;
		}

		function statement(type, value) {
			if (type == "var") return cont(pushlex("vardef", value), vardef, expect(";"), poplex);
			if (type == "keyword a") return cont(pushlex("form"), parenExpr, statement, poplex);
			if (type == "keyword b") return cont(pushlex("form"), statement, poplex);
			if (type == "keyword d") return cx.stream.match(/^\s*$/, false) ? cont() : cont(pushlex("stat"), maybeexpression, expect(";"), poplex);
			if (type == "debugger") return cont(expect(";"));
			if (type == "{") return cont(pushlex("}"), pushblockcontext, block, poplex, popcontext);
			if (type == ";") return cont();
			if (type == "if") {
				if (cx.state.lexical.info == "else" && cx.state.cc[cx.state.cc.length - 1] == poplex) cx.state.cc.pop()();
				return cont(pushlex("form"), parenExpr, statement, poplex, maybeelse);
			}
			if (type == "function") return cont(functiondef);
			if (type == "for") return cont(pushlex("form"), forspec, statement, poplex);
			if (type == "class" || (isTS && value == "interface")) {
				cx.marked = "keyword";
				return cont(pushlex("form"), className, poplex);
			}
			if (type == "variable") {
				if (isTS && value == "declare") {
					cx.marked = "keyword"
					return cont(statement)
				} else if (isTS && (value == "module" || value == "enum" || value == "type") && cx.stream.match(/^\s*\w/, false)) {
					cx.marked = "keyword"
					if (value == "enum") return cont(enumdef);
					else if (value == "type") return cont(typeexpr, expect("operator"), typeexpr, expect(";"));
					else return cont(pushlex("form"), pattern, expect("{"), pushlex("}"), block, poplex, poplex)
				} else if (isTS && value == "namespace") {
					cx.marked = "keyword"
					return cont(pushlex("form"), expression, block, poplex)
				} else if (isTS && value == "abstract") {
					cx.marked = "keyword"
					return cont(statement)
				} else {
					return cont(pushlex("stat"), maybelabel);
				}
			}
			if (type == "switch") return cont(pushlex("form"), parenExpr, expect("{"), pushlex("}", "switch"), pushblockcontext, block, poplex, poplex, popcontext);
			if (type == "case") return cont(expression, expect(":"));
			if (type == "default") return cont(expect(":"));
			if (type == "catch") return cont(pushlex("form"), pushcontext, maybeCatchBinding, statement, poplex, popcontext);
			if (type == "export") return cont(pushlex("stat"), afterExport, poplex);
			if (type == "import") return cont(pushlex("stat"), afterImport, poplex);
			if (type == "async") return cont(statement)
			if (value == "@") return cont(expression, statement)
			return pass(pushlex("stat"), expression, expect(";"), poplex);
		}

		function maybeCatchBinding(type) {
			if (type == "(") return cont(funarg, expect(")"))
		}

		function expression(type, value) {
			return expressionInner(type, value, false);
		}

		function expressionNoComma(type, value) {
			return expressionInner(type, value, true);
		}

		function parenExpr(type) {
			if (type != "(") return pass()
			return cont(pushlex(")"), expression, expect(")"), poplex)
		}

		function expressionInner(type, value, noComma) {
			if (cx.state.fatArrowAt == cx.stream.start) {
				var body = noComma ? arrowBodyNoComma : arrowBody;
				if (type == "(") return cont(pushcontext, pushlex(")"), commasep(funarg, ")"), poplex, expect("=>"), body, popcontext);
				else if (type == "variable") return pass(pushcontext, pattern, expect("=>"), body, popcontext);
			}
			var maybeop = noComma ? maybeoperatorNoComma : maybeoperatorComma;
			if (atomicTypes.hasOwnProperty(type)) return cont(maybeop);
			if (type == "function") return cont(functiondef, maybeop);
			if (type == "class" || (isTS && value == "interface")) {
				cx.marked = "keyword";
				return cont(pushlex("form"), classExpression, poplex);
			}
			if (type == "keyword c" || type == "async") return cont(noComma ? expressionNoComma : expression);
			if (type == "(") return cont(pushlex(")"), maybeexpression, expect(")"), poplex, maybeop);
			if (type == "operator" || type == "spread") return cont(noComma ? expressionNoComma : expression);
			if (type == "[") return cont(pushlex("]"), arrayLiteral, poplex, maybeop);
			if (type == "{") return contCommasep(objprop, "}", null, maybeop);
			if (type == "quasi") return pass(quasi, maybeop);
			if (type == "new") return cont(maybeTarget(noComma));
			if (type == "import") return cont(expression);
			return cont();
		}

		function maybeexpression(type) {
			if (type.match(/[;\}\)\],]/)) return pass();
			return pass(expression);
		}

		function maybeoperatorComma(type, value) {
			if (type == ",") return cont(expression);
			return maybeoperatorNoComma(type, value, false);
		}

		function maybeoperatorNoComma(type, value, noComma) {
			var me = noComma == false ? maybeoperatorComma : maybeoperatorNoComma;
			var expr = noComma == false ? expression : expressionNoComma;
			if (type == "=>") return cont(pushcontext, noComma ? arrowBodyNoComma : arrowBody, popcontext);
			if (type == "operator") {
				if (/\+\+|--/.test(value) || isTS && value == "!") return cont(me);
				if (isTS && value == "<" && cx.stream.match(/^([^>]|<.*?>)*>\s*\(/, false)) return cont(pushlex(">"), commasep(typeexpr, ">"), poplex, me);
				if (value == "?") return cont(expression, expect(":"), expr);
				return cont(expr);
			}
			if (type == "quasi") {
				return pass(quasi, me);
			}
			if (type == ";") return;
			if (type == "(") return contCommasep(expressionNoComma, ")", "call", me);
			if (type == ".") return cont(property, me);
			if (type == "[") return cont(pushlex("]"), maybeexpression, expect("]"), poplex, me);
			if (isTS && value == "as") {
				cx.marked = "keyword";
				return cont(typeexpr, me)
			}
			if (type == "regexp") {
				cx.state.lastType = cx.marked = "operator"
				cx.stream.backUp(cx.stream.pos - cx.stream.start - 1)
				return cont(expr)
			}
		}

		function quasi(type, value) {
			if (type != "quasi") return pass();
			if (value.slice(value.length - 2) != "${") return cont(quasi);
			return cont(expression, continueQuasi);
		}

		function continueQuasi(type) {
			if (type == "}") {
				cx.marked = "string-2";
				cx.state.tokenize = tokenQuasi;
				return cont(quasi);
			}
		}

		function arrowBody(type) {
			findFatArrow(cx.stream, cx.state);
			return pass(type == "{" ? statement : expression);
		}

		function arrowBodyNoComma(type) {
			findFatArrow(cx.stream, cx.state);
			return pass(type == "{" ? statement : expressionNoComma);
		}

		function maybeTarget(noComma) {
			return function (type) {
				if (type == ".") return cont(noComma ? targetNoComma : target);
				else if (type == "variable" && isTS) return cont(maybeTypeArgs, noComma ? maybeoperatorNoComma : maybeoperatorComma)
				else return pass(noComma ? expressionNoComma : expression);
			};
		}

		function target(_, value) {
			if (value == "target") {
				cx.marked = "keyword";
				return cont(maybeoperatorComma);
			}
		}

		function targetNoComma(_, value) {
			if (value == "target") {
				cx.marked = "keyword";
				return cont(maybeoperatorNoComma);
			}
		}

		function maybelabel(type) {
			if (type == ":") return cont(poplex, statement);
			return pass(maybeoperatorComma, expect(";"), poplex);
		}

		function property(type) {
			if (type == "variable") {
				cx.marked = "property";
				return cont();
			}
		}

		function objprop(type, value) {
			if (type == "async") {
				cx.marked = "property";
				return cont(objprop);
			} else if (type == "variable" || cx.style == "keyword") {
				cx.marked = "property";
				if (value == "get" || value == "set") return cont(getterSetter);
				var m // Work around fat-arrow-detection complication for detecting typescript typed arrow params
				if (isTS && cx.state.fatArrowAt == cx.stream.start && (m = cx.stream.match(/^\s*:\s*/, false))) cx.state.fatArrowAt = cx.stream.pos + m[0].length
				return cont(afterprop);
			} else if (type == "number" || type == "string") {
				cx.marked = jsonldMode ? "property" : (cx.style + " property");
				return cont(afterprop);
			} else if (type == "jsonld-keyword") {
				return cont(afterprop);
			} else if (isTS && isModifier(value)) {
				cx.marked = "keyword"
				return cont(objprop)
			} else if (type == "[") {
				return cont(expression, maybetype, expect("]"), afterprop);
			} else if (type == "spread") {
				return cont(expressionNoComma, afterprop);
			} else if (value == "*") {
				cx.marked = "keyword";
				return cont(objprop);
			} else if (type == ":") {
				return pass(afterprop)
			}
		}

		function getterSetter(type) {
			if (type != "variable") return pass(afterprop);
			cx.marked = "property";
			return cont(functiondef);
		}

		function afterprop(type) {
			if (type == ":") return cont(expressionNoComma);
			if (type == "(") return pass(functiondef);
		}

		function commasep(what, end, sep) {
			function proceed(type, value) {
				if (sep ? sep.indexOf(type) > -1 : type == ",") {
					var lex = cx.state.lexical;
					if (lex.info == "call") lex.pos = (lex.pos || 0) + 1;
					return cont(function (type, value) {
						if (type == end || value == end) return pass()
						return pass(what)
					}, proceed);
				}
				if (type == end || value == end) return cont();
				return cont(expect(end));
			}
			return function (type, value) {
				if (type == end || value == end) return cont();
				return pass(what, proceed);
			};
		}

		function contCommasep(what, end, info) {
			for (var i = 3; i < arguments.length; i++) cx.cc.push(arguments[i]);
			return cont(pushlex(end, info), commasep(what, end), poplex);
		}

		function block(type) {
			if (type == "}") return cont();
			return pass(statement, block);
		}

		function maybetype(type, value) {
			if (isTS) {
				if (type == ":") return cont(typeexpr);
				if (value == "?") return cont(maybetype);
			}
		}

		function mayberettype(type) {
			if (isTS && type == ":") {
				if (cx.stream.match(/^\s*\w+\s+is\b/, false)) return cont(expression, isKW, typeexpr)
				else return cont(typeexpr)
			}
		}

		function isKW(_, value) {
			if (value == "is") {
				cx.marked = "keyword"
				return cont()
			}
		}

		function typeexpr(type, value) {
			if (value == "keyof" || value == "typeof") {
				cx.marked = "keyword"
				return cont(value == "keyof" ? typeexpr : expressionNoComma)
			}
			if (type == "variable" || value == "void") {
				cx.marked = "type"
				return cont(afterType)
			}
			if (type == "string" || type == "number" || type == "atom") return cont(afterType);
			if (type == "[") return cont(pushlex("]"), commasep(typeexpr, "]", ","), poplex, afterType)
			if (type == "{") return cont(pushlex("}"), commasep(typeprop, "}", ",;"), poplex, afterType)
			if (type == "(") return cont(commasep(typearg, ")"), maybeReturnType)
			if (type == "<") return cont(commasep(typeexpr, ">"), typeexpr)
		}

		function maybeReturnType(type) {
			if (type == "=>") return cont(typeexpr)
		}

		function typeprop(type, value) {
			if (type == "variable" || cx.style == "keyword") {
				cx.marked = "property"
				return cont(typeprop)
			} else if (value == "?") {
				return cont(typeprop)
			} else if (type == ":") {
				return cont(typeexpr)
			} else if (type == "[") {
				return cont(expression, maybetype, expect("]"), typeprop)
			}
		}

		function typearg(type, value) {
			if (type == "variable" && cx.stream.match(/^\s*[?:]/, false) || value == "?") return cont(typearg)
			if (type == ":") return cont(typeexpr)
			return pass(typeexpr)
		}

		function afterType(type, value) {
			if (value == "<") return cont(pushlex(">"), commasep(typeexpr, ">"), poplex, afterType)
			if (value == "|" || type == "." || value == "&") return cont(typeexpr)
			if (type == "[") return cont(expect("]"), afterType)
			if (value == "extends" || value == "implements") {
				cx.marked = "keyword";
				return cont(typeexpr)
			}
		}

		function maybeTypeArgs(_, value) {
			if (value == "<") return cont(pushlex(">"), commasep(typeexpr, ">"), poplex, afterType)
		}

		function typeparam() {
			return pass(typeexpr, maybeTypeDefault)
		}

		function maybeTypeDefault(_, value) {
			if (value == "=") return cont(typeexpr)
		}

		function vardef(_, value) {
			if (value == "enum") {
				cx.marked = "keyword";
				return cont(enumdef)
			}
			return pass(pattern, maybetype, maybeAssign, vardefCont);
		}

		function pattern(type, value) {
			if (isTS && isModifier(value)) {
				cx.marked = "keyword";
				return cont(pattern)
			}
			if (type == "variable") {
				register(value);
				return cont();
			}
			if (type == "spread") return cont(pattern);
			if (type == "[") return contCommasep(eltpattern, "]");
			if (type == "{") return contCommasep(proppattern, "}");
		}

		function proppattern(type, value) {
			if (type == "variable" && !cx.stream.match(/^\s*:/, false)) {
				register(value);
				return cont(maybeAssign);
			}
			if (type == "variable") cx.marked = "property";
			if (type == "spread") return cont(pattern);
			if (type == "}") return pass();
			return cont(expect(":"), pattern, maybeAssign);
		}

		function eltpattern() {
			return pass(pattern, maybeAssign)
		}

		function maybeAssign(_type, value) {
			if (value == "=") return cont(expressionNoComma);
		}

		function vardefCont(type) {
			if (type == ",") return cont(vardef);
		}

		function maybeelse(type, value) {
			if (type == "keyword b" && value == "else") return cont(pushlex("form", "else"), statement, poplex);
		}

		function forspec(type, value) {
			if (value == "await") return cont(forspec);
			if (type == "(") return cont(pushlex(")"), forspec1, expect(")"), poplex);
		}

		function forspec1(type) {
			if (type == "var") return cont(vardef, expect(";"), forspec2);
			if (type == ";") return cont(forspec2);
			if (type == "variable") return cont(formaybeinof);
			return pass(expression, expect(";"), forspec2);
		}

		function formaybeinof(_type, value) {
			if (value == "in" || value == "of") {
				cx.marked = "keyword";
				return cont(expression);
			}
			return cont(maybeoperatorComma, forspec2);
		}

		function forspec2(type, value) {
			if (type == ";") return cont(forspec3);
			if (value == "in" || value == "of") {
				cx.marked = "keyword";
				return cont(expression);
			}
			return pass(expression, expect(";"), forspec3);
		}

		function forspec3(type) {
			if (type != ")") cont(expression);
		}

		function functiondef(type, value) {
			if (value == "*") {
				cx.marked = "keyword";
				return cont(functiondef);
			}
			if (type == "variable") {
				register(value);
				return cont(functiondef);
			}
			if (type == "(") return cont(pushcontext, pushlex(")"), commasep(funarg, ")"), poplex, mayberettype, statement, popcontext);
			if (isTS && value == "<") return cont(pushlex(">"), commasep(typeparam, ">"), poplex, functiondef)
		}

		function funarg(type, value) {
			if (value == "@") cont(expression, funarg)
			if (type == "spread") return cont(funarg);
			if (isTS && isModifier(value)) {
				cx.marked = "keyword";
				return cont(funarg);
			}
			return pass(pattern, maybetype, maybeAssign);
		}

		function classExpression(type, value) {
			// Class expressions may have an optional name.
			if (type == "variable") return className(type, value);
			return classNameAfter(type, value);
		}

		function className(type, value) {
			if (type == "variable") {
				register(value);
				return cont(classNameAfter);
			}
		}

		function classNameAfter(type, value) {
			if (value == "<") return cont(pushlex(">"), commasep(typeparam, ">"), poplex, classNameAfter)
			if (value == "extends" || value == "implements" || (isTS && type == ",")) {
				if (value == "implements") cx.marked = "keyword";
				return cont(isTS ? typeexpr : expression, classNameAfter);
			}
			if (type == "{") return cont(pushlex("}"), classBody, poplex);
		}

		function classBody(type, value) {
			if (type == "async" || (type == "variable" && (value == "static" || value == "get" || value == "set" || (isTS && isModifier(value))) && cx.stream.match(/^\s+[\w$\xa1-\uffff]/, false))) {
				cx.marked = "keyword";
				return cont(classBody);
			}
			if (type == "variable" || cx.style == "keyword") {
				cx.marked = "property";
				return cont(isTS ? classfield : functiondef, classBody);
			}
			if (type == "[") return cont(expression, maybetype, expect("]"), isTS ? classfield : functiondef, classBody)
			if (value == "*") {
				cx.marked = "keyword";
				return cont(classBody);
			}
			if (type == ";") return cont(classBody);
			if (type == "}") return cont();
			if (value == "@") return cont(expression, classBody)
		}

		function classfield(type, value) {
			if (value == "?") return cont(classfield)
			if (type == ":") return cont(typeexpr, maybeAssign)
			if (value == "=") return cont(expressionNoComma)
			return pass(functiondef)
		}

		function afterExport(type, value) {
			if (value == "*") {
				cx.marked = "keyword";
				return cont(maybeFrom, expect(";"));
			}
			if (value == "default") {
				cx.marked = "keyword";
				return cont(expression, expect(";"));
			}
			if (type == "{") return cont(commasep(exportField, "}"), maybeFrom, expect(";"));
			return pass(statement);
		}

		function exportField(type, value) {
			if (value == "as") {
				cx.marked = "keyword";
				return cont(expect("variable"));
			}
			if (type == "variable") return pass(expressionNoComma, exportField);
		}

		function afterImport(type) {
			if (type == "string") return cont();
			if (type == "(") return pass(expression);
			return pass(importSpec, maybeMoreImports, maybeFrom);
		}

		function importSpec(type, value) {
			if (type == "{") return contCommasep(importSpec, "}");
			if (type == "variable") register(value);
			if (value == "*") cx.marked = "keyword";
			return cont(maybeAs);
		}

		function maybeMoreImports(type) {
			if (type == ",") return cont(importSpec, maybeMoreImports)
		}

		function maybeAs(_type, value) {
			if (value == "as") {
				cx.marked = "keyword";
				return cont(importSpec);
			}
		}

		function maybeFrom(_type, value) {
			if (value == "from") {
				cx.marked = "keyword";
				return cont(expression);
			}
		}

		function arrayLiteral(type) {
			if (type == "]") return cont();
			return pass(commasep(expressionNoComma, "]"));
		}

		function enumdef() {
			return pass(pushlex("form"), pattern, expect("{"), pushlex("}"), commasep(enummember, "}"), poplex, poplex)
		}

		function enummember() {
			return pass(pattern, maybeAssign);
		}
		// Interface
		return {
			startState: function (basecolumn) {
				var state = {
					tokenize: tokenBase,
					lastType: "sof",
					cc: [],
					lexical: new JSLexical((basecolumn || 0) - indentUnit, 0, "block", false),
					localVars: parserConfig.localVars,
					context: parserConfig.localVars && new Context(null, null, false),
					indented: basecolumn || 0
				};
				if (parserConfig.globalVars && typeof parserConfig.globalVars == "object") state.globalVars = parserConfig.globalVars;
				return state;
			},
			token: function (stream, state) {
				if (stream.sol()) {
					if (!state.lexical.hasOwnProperty("align")) state.lexical.align = false;
					state.indented = stream.indentation();
					findFatArrow(stream, state);
				}
				if (state.tokenize != tokenComment && stream.eatSpace()) return null;
				var style = state.tokenize(stream, state);
				if (type == "comment") return style;
				state.lastType = type == "operator" && (content == "++" || content == "--") ? "incdec" : type;
				return parseJS(state, style, type, content, stream);
			},
		};
	});
});
