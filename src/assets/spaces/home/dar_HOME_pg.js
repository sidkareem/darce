$(function() {    
    // Switchery toggles
    // ------------------------------

    var switches = Array.prototype.slice.call(document.querySelectorAll('.switch'));
    switches.forEach(function(html) {
        var switchery = new Switchery(html, {color: '#4CAF50'});
    });



    // Bar charts with random data
    // ------------------------------

    // Initialize charts


    // trend line-bar charts
    // -------------------------------
    
    var trend_data = [
    	
			    	{"Account": "OPEX", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.JAN", "Value": 397740590},
			    	{"Account": "OPEX", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.FEB", "Value": 396356748},
			    	{"Account": "OPEX", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.MAR", "Value": 398381262},
			    	{"Account": "OPEX", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.APR", "Value": 394791951},
			    	{"Account": "OPEX", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.MAY", "Value": 401357276},
			    	{"Account": "OPEX", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.JUN", "Value": 394753300},
			    	{"Account": "OPEX", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.JUL", "Value": 397682838},
			    	{"Account": "OPEX", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.AUG", "Value": 401794363},
			    	{"Account": "OPEX", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.SEP", "Value": 401505484},
			    	{"Account": "OPEX", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.OCT", "Value": 402093285},
			    	{"Account": "OPEX", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.NOV", "Value": 397211524},
			    	{"Account": "OPEX", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.DEC", "Value": 397062358},
			    	
			    	{"Account": "OPEX", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.JAN", "Value": 331591110},
			    	{"Account": "OPEX", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.FEB", "Value": 340574520},
			    	{"Account": "OPEX", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.MAR", "Value": 349647770},
			    	{"Account": "OPEX", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.APR", "Value": 331591110},
			    	{"Account": "OPEX", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.MAY", "Value": 340574520},
			    	{"Account": "OPEX", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.JUN", "Value": 340574520},
			    	{"Account": "OPEX", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.JUL", "Value": 349647770},
			    	{"Account": "OPEX", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.AUG", "Value": 331591110},
			    	{"Account": "OPEX", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.SEP", "Value": 340574520},
			    	{"Account": "OPEX", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.OCT", "Value": 331591110},
			    	{"Account": "OPEX", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.NOV", "Value": 340574520},
			    	{"Account": "OPEX", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.DEC", "Value": 349647770},
			    	
			    	{"Account": "OPEX", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.JAN", "Value": 307583679},
			    	{"Account": "OPEX", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.FEB", "Value": 304884388},
			    	{"Account": "OPEX", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.MAR", "Value": 307614447},
			    	{"Account": "OPEX", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.APR", "Value": 303562044},
			    	{"Account": "OPEX", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.MAY", "Value": 311809783},
			    	{"Account": "OPEX", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.JUN", "Value": 303503601},
			    	{"Account": "OPEX", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.JUL", "Value": 307641286},
			    	{"Account": "OPEX", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.AUG", "Value": 311022512},
			    	{"Account": "OPEX", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.SEP", "Value": 311715524},
			    	{"Account": "OPEX", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.OCT", "Value": 311860461},
			    	{"Account": "OPEX", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.NOV", "Value": 306531846},
			    	{"Account": "OPEX", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.DEC", "Value": 305220931},
			    	
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.JAN", "Value": 634488022},
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.FEB", "Value": 629720001},
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.MAR", "Value": 641540066},
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.APR", "Value": 655073019},
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.MAY", "Value": 659718021},
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.JUN", "Value": 668410054},
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.JUL", "Value": 664734012},
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.AUG", "Value": 669870045},
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.SEP", "Value": 677798063},
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.OCT", "Value": 679502066},
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.NOV", "Value": 684851058},
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.DEC", "Value": 701573038},
			    	
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.JAN", "Value": 765096069},
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.FEB", "Value": 763256084},
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.MAR", "Value": 760539082},
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.APR", "Value": 761931085},
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.MAY", "Value": 754738077},
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.JUN", "Value": 761691044},
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.JUL", "Value": 756379083},
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.AUG", "Value": 765208002},
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.SEP", "Value": 757282014},
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.OCT", "Value": 762131002},
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.NOV", "Value": 763455007},
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.DEC", "Value": 761149065},
			    	
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.JAN", "Value": 667115.98},
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.FEB", "Value": 660573.17},
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.MAR", "Value": 664412.94},
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.APR", "Value": 663280.34},
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.MAY", "Value": 671163.75},
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.JUN", "Value": 664716.45},
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.JUL", "Value": 658858.43},
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.AUG", "Value": 661773.34},
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.SEP", "Value": 668128.99},
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.OCT", "Value": 662537.1},
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.NOV", "Value": 665836.27},
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.DEC", "Value": 662047.15},
			    	
			    	{"Account": "MARGIN", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.JAN", "Value": 397740590},
			    	{"Account": "MARGIN", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.FEB", "Value": 396356748},
			    	{"Account": "MARGIN", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.MAR", "Value": 398381262},
			    	{"Account": "MARGIN", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.APR", "Value": 394791951},
			    	{"Account": "MARGIN", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.MAY", "Value": 401357276},
			    	{"Account": "MARGIN", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.JUN", "Value": 394753300},
			    	{"Account": "MARGIN", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.JUL", "Value": 397682838},
			    	{"Account": "MARGIN", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.AUG", "Value": 401794363},
			    	{"Account": "MARGIN", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.SEP", "Value": 401505484},
			    	{"Account": "MARGIN", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.OCT", "Value": 402093285},
			    	{"Account": "MARGIN", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.NOV", "Value": 397211524},
			    	{"Account": "MARGIN", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.DEC", "Value": 397062358},
			    	
			    	{"Account": "MARGIN", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.JAN", "Value": 331591110},
			    	{"Account": "MARGIN", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.FEB", "Value": 340574520},
			    	{"Account": "MARGIN", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.MAR", "Value": 349647770},
			    	{"Account": "MARGIN", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.APR", "Value": 331591110},
			    	{"Account": "MARGIN", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.MAY", "Value": 340574520},
			    	{"Account": "MARGIN", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.JUN", "Value": 340574520},
			    	{"Account": "MARGIN", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.JUL", "Value": 349647770},
			    	{"Account": "MARGIN", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.AUG", "Value": 331591110},
			    	{"Account": "MARGIN", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.SEP", "Value": 340574520},
			    	{"Account": "MARGIN", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.OCT", "Value": 331591110},
			    	{"Account": "MARGIN", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.NOV", "Value": 340574520},
			    	{"Account": "MARGIN", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.DEC", "Value": 349647770},
			    	
			    	{"Account": "MARGIN", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.JAN", "Value": 291541007},
			    	{"Account": "MARGIN", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.FEB", "Value": 295929002},
			    	{"Account": "MARGIN", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.MAR", "Value": 298827044},
			    	{"Account": "MARGIN", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.APR", "Value": 303027755},
			    	{"Account": "MARGIN", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.MAY", "Value": 309555339},
			    	{"Account": "MARGIN", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.JUN", "Value": 311343874},
			    	{"Account": "MARGIN", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.JUL", "Value": 308154761},
			    	{"Account": "MARGIN", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.AUG", "Value": 315212606},
			    	{"Account": "MARGIN", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.SEP", "Value": 313104104},
			    	{"Account": "MARGIN", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.OCT", "Value": 319381988},
			    	{"Account": "MARGIN", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.NOV", "Value": 325935056},
			    	{"Account": "MARGIN", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.DEC", "Value": 327003131},
			    	
			    	{"Account": "EBITDA", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.JAN", "Value": 277237532},
			    	{"Account": "EBITDA", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.FEB", "Value": 298924803},
			    	{"Account": "EBITDA", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.MAR", "Value": 301055446},
			    	{"Account": "EBITDA", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.APR", "Value": 270860220},
			    	{"Account": "EBITDA", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.MAY", "Value": 296782933},
			    	{"Account": "EBITDA", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.JUN", "Value": 298275508},
			    	{"Account": "EBITDA", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.JUL", "Value": 273308113},
			    	{"Account": "EBITDA", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.AUG", "Value": 298921168},
			    	{"Account": "EBITDA", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.SEP", "Value": 208380704},
			    	{"Account": "EBITDA", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.OCT", "Value": 210543696},
			    	{"Account": "EBITDA", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.NOV", "Value": 215475086},
			    	{"Account": "EBITDA", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.DEC", "Value": 216823196},
			    	
			    	{"Account": "EBITDA", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.JAN", "Value": 247357517},
			    	{"Account": "EBITDA", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.FEB", "Value": 275647500},
			    	{"Account": "EBITDA", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.MAR", "Value": 275945924},
			    	{"Account": "EBITDA", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.APR", "Value": 238036910},
			    	{"Account": "EBITDA", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.MAY", "Value": 266360710},
			    	{"Account": "EBITDA", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.JUN", "Value": 273129464},
			    	{"Account": "EBITDA", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.JUL", "Value": 241881189},
			    	{"Account": "EBITDA", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.AUG", "Value": 269275309},
			    	{"Account": "EBITDA", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.SEP", "Value": 120038460},
			    	{"Account": "EBITDA", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.OCT", "Value": 106411160},
			    	{"Account": "EBITDA", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.NOV", "Value": 121709028},
			    	{"Account": "EBITDA", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.DEC", "Value": 124608210},
			    	
			    	{"Account": "EBITDA", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.JAN", "Value": 216396948},
			    	{"Account": "EBITDA", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.FEB", "Value": 230681756},
			    	{"Account": "EBITDA", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.MAR", "Value": 235373236},
			    	{"Account": "EBITDA", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.APR", "Value": 212403240},
			    	{"Account": "EBITDA", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.MAY", "Value": 237655158},
			    	{"Account": "EBITDA", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.JUN", "Value": 232164497},
			    	{"Account": "EBITDA", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.JUL", "Value": 214684135},
			    	{"Account": "EBITDA", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.AUG", "Value": 237756145},
			    	{"Account": "EBITDA", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.SEP", "Value": 207718500},
			    	{"Account": "EBITDA", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.OCT", "Value": 228345056},
			    	{"Account": "EBITDA", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.NOV", "Value": 221326487},
			    	{"Account": "EBITDA", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.DEC", "Value": 219696647},
			    	
			    	{"Account": "HEADCOUNT", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.JAN", "Value": 13024},
			    	{"Account": "HEADCOUNT", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.FEB", "Value": 13011},
			    	{"Account": "HEADCOUNT", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.MAR", "Value": 13110},
			    	{"Account": "HEADCOUNT", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.APR", "Value": 13196},
			    	{"Account": "HEADCOUNT", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.MAY", "Value": 13272},
			    	{"Account": "HEADCOUNT", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.JUN", "Value": 13360},
			    	{"Account": "HEADCOUNT", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.JUL", "Value": 13331},
			    	{"Account": "HEADCOUNT", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.AUG", "Value": 13303},
			    	{"Account": "HEADCOUNT", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.SEP", "Value": 13329},
			    	{"Account": "HEADCOUNT", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.OCT", "Value": 13329},
			    	{"Account": "HEADCOUNT", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.NOV", "Value": 13329},
			    	{"Account": "HEADCOUNT", "Version": "ACTUAL", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.DEC", "Value": 13329},
			    	
			    	{"Account": "HEADCOUNT", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.JAN", "Value": 13022},
			    	{"Account": "HEADCOUNT", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.FEB", "Value": 13009},
			    	{"Account": "HEADCOUNT", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.MAR", "Value": 13108},
			    	{"Account": "HEADCOUNT", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.APR", "Value": 13194},
			    	{"Account": "HEADCOUNT", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.MAY", "Value": 13270},
			    	{"Account": "HEADCOUNT", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.JUN", "Value": 13358},
			    	{"Account": "HEADCOUNT", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.JUL", "Value": 13327},
			    	{"Account": "HEADCOUNT", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.AUG", "Value": 13299},
			    	{"Account": "HEADCOUNT", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.SEP", "Value": 13329},
			    	{"Account": "HEADCOUNT", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.OCT", "Value": 13329},
			    	{"Account": "HEADCOUNT", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.NOV", "Value": 13329},
			    	{"Account": "HEADCOUNT", "Version": "TARGET", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.DEC", "Value": 13329},
			    	
			    	{"Account": "HEADCOUNT", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.JAN", "Value": 16009},
			    	{"Account": "HEADCOUNT", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.FEB", "Value": 16026},
			    	{"Account": "HEADCOUNT", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q1", "TIME": "2018.MAR", "Value": 16174},
			    	{"Account": "HEADCOUNT", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.APR", "Value": 16154},
			    	{"Account": "HEADCOUNT", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.MAY", "Value": 16358},
			    	{"Account": "HEADCOUNT", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q2", "TIME": "2018.JUN", "Value": 16525},
			    	{"Account": "HEADCOUNT", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.JUL", "Value": 16326},
			    	{"Account": "HEADCOUNT", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.AUG", "Value": 16340},
			    	{"Account": "HEADCOUNT", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q3", "TIME": "2018.SEP", "Value": 13264},
			    	{"Account": "HEADCOUNT", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.OCT", "Value": 13291},
			    	{"Account": "HEADCOUNT", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.NOV", "Value": 13242},
			    	{"Account": "HEADCOUNT", "Version": "FCST", "YEAR": "2018", "QUARTER": "2018.Q4", "TIME": "2018.DEC", "Value": 13423},
			    	
			    	/*{"Account": "OPEX", "Version": "ACT1", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.JAN", "Value": 291570302},
			    	{"Account": "OPEX", "Version": "ACT1", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.FEB", "Value": 255540482},
			    	{"Account": "OPEX", "Version": "ACT1", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.MAR", "Value": 238907036},
			    	{"Account": "OPEX", "Version": "ACT1", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.APR", "Value": 403008675},
			    	{"Account": "OPEX", "Version": "ACT1", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.MAY", "Value": 508803108},
			    	{"Account": "OPEX", "Version": "ACT1", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.JUN", "Value": 410557703},
			    	{"Account": "OPEX", "Version": "ACT1", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.JUL", "Value": 308028917},
			    	{"Account": "OPEX", "Version": "ACT1", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.AUG", "Value": 314402290},
			    	{"Account": "OPEX", "Version": "ACT1", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.SEP", "Value": 312431825},
			    	{"Account": "OPEX", "Version": "ACT1", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.OCT", "Value": 318554887},
			    	{"Account": "OPEX", "Version": "ACT1", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.NOV", "Value": 325672035},
			    	{"Account": "OPEX", "Version": "ACT1", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.DEC", "Value": 126769530},
			    	
			    	{"Account": "OPEX", "Version": "ACT2", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.JAN", "Value": 191570302},
			    	{"Account": "OPEX", "Version": "ACT2", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.FEB", "Value": 155540482},
			    	{"Account": "OPEX", "Version": "ACT2", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.MAR", "Value": 138907036},
			    	{"Account": "OPEX", "Version": "ACT2", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.APR", "Value": 103008675},
			    	{"Account": "OPEX", "Version": "ACT2", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.MAY", "Value": 108803108},
			    	{"Account": "OPEX", "Version": "ACT2", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.JUN", "Value": 210557703},
			    	{"Account": "OPEX", "Version": "ACT2", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.JUL", "Value": 208028917},
			    	{"Account": "OPEX", "Version": "ACT2", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.AUG", "Value": 314402290},
			    	{"Account": "OPEX", "Version": "ACT2", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.SEP", "Value": 412431825},
			    	{"Account": "OPEX", "Version": "ACT2", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.OCT", "Value": 518554887},
			    	{"Account": "OPEX", "Version": "ACT2", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.NOV", "Value": 125672035},
			    	{"Account": "OPEX", "Version": "ACT2", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.DEC", "Value": 226769530},  */
    	
    				{"Account": "OPEX", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.JAN", "Value": 291570302},
			    	{"Account": "OPEX", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.FEB", "Value": 295540482},
			    	{"Account": "OPEX", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.MAR", "Value": 298907036},
			    	{"Account": "OPEX", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.APR", "Value": 303008675},
			    	{"Account": "OPEX", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.MAY", "Value": 308803108},
			    	{"Account": "OPEX", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.JUN", "Value": 310557703},
			    	{"Account": "OPEX", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.JUL", "Value": 308028917},
			    	{"Account": "OPEX", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.AUG", "Value": 314402290},
			    	{"Account": "OPEX", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.SEP", "Value": 312431825},
			    	{"Account": "OPEX", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.OCT", "Value": 318554887},
			    	{"Account": "OPEX", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.NOV", "Value": 325672035},
			    	{"Account": "OPEX", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.DEC", "Value": 1326769530},
			    	
			    	{"Account": "OPEX", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.JAN", "Value": 373524884},
			    	{"Account": "OPEX", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.FEB", "Value": 370254060},
			    	{"Account": "OPEX", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.MAR", "Value": 372043767},
			    	{"Account": "OPEX", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.APR", "Value": 375173041},
			    	{"Account": "OPEX", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.MAY", "Value": 367387451},
			    	{"Account": "OPEX", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.JUN", "Value": 368209629},
			    	{"Account": "OPEX", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.JUL", "Value": 372502529},
			    	{"Account": "OPEX", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.AUG", "Value": 372932925},
			    	{"Account": "OPEX", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.SEP", "Value": 374356248},
			    	{"Account": "OPEX", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.OCT", "Value": 380559416},
			    	{"Account": "OPEX", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.NOV", "Value": 379159730},
			    	{"Account": "OPEX", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.DEC", "Value": 372121276},
			    	
			    	{"Account": "OPEX", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.JAN", "Value": 307606689},
			    	{"Account": "OPEX", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.FEB", "Value": 304880142},
			    	{"Account": "OPEX", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.MAR", "Value": 307677854},
			    	{"Account": "OPEX", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.APR", "Value": 303585566},
			    	{"Account": "OPEX", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.MAY", "Value": 311863917},
			    	{"Account": "OPEX", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.JUN", "Value": 303567676},
			    	{"Account": "OPEX", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.JUL", "Value": 307686968},
			    	{"Account": "OPEX", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.AUG", "Value": 311065232},
			    	{"Account": "OPEX", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.SEP", "Value": 411804962},
			    	{"Account": "OPEX", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.OCT", "Value": 511919164},
			    	{"Account": "OPEX", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.NOV", "Value": 406584586},
			    	{"Account": "OPEX", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.DEC", "Value": 305308399},
			    	
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.JAN", "Value": 634507202},
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.FEB", "Value": 639317001},
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.MAR", "Value": 647786066},
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.APR", "Value": 656534019},
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.MAY", "Value": 665018021},
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.JUN", "Value": 668752504},
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.JUL", "Value": 668655102},
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.AUG", "Value": 676763405},
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.SEP", "Value": 677863603},
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.OCT", "Value": 689137660},
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.NOV", "Value": 694230580},
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.DEC", "Value": 703886380},
			    	
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.JAN", "Value": 768646609},
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.FEB", "Value": 762861084},
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.MAR", "Value": 766749082},
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.APR", "Value": 769146085},
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.MAY", "Value": 761371077},
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.JUN", "Value": 761369044},
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.JUL", "Value": 765318003},
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.AUG", "Value": 766665020},
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.SEP", "Value": 766733014},
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.OCT", "Value": 771896002},
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.NOV", "Value": 771429007},
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.DEC", "Value": 765076065},
			    	
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.JAN", "Value": 670174098},
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.FEB", "Value": 665197017},
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.MAR", "Value": 668597094},
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.APR", "Value": 663004034},
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.MAY", "Value": 674897075},
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.JUN", "Value": 666177045},
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.JUL", "Value": 668167043},
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.AUG", "Value": 670859034},
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.SEP", "Value": 674502099},
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.OCT", "Value": 671543100},
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.NOV", "Value": 665824027},
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.DEC", "Value": 664617015},
			    	
			    	{"Account": "MARGIN", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.JAN", "Value": 221570302},
			    	{"Account": "MARGIN", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.FEB", "Value": 293540482},
			    	{"Account": "MARGIN", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.MAR", "Value": 268007036},
			    	{"Account": "MARGIN", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.APR", "Value": 303018675},
			    	{"Account": "MARGIN", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.MAY", "Value": 318803108},
			    	{"Account": "MARGIN", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.JUN", "Value": 300557703},
			    	{"Account": "MARGIN", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.JUL", "Value": 248020917},
			    	{"Account": "MARGIN", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.AUG", "Value": 310402290},
			    	{"Account": "MARGIN", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.SEP", "Value": 312401825},
			    	{"Account": "MARGIN", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.OCT", "Value": 310554887},
			    	{"Account": "MARGIN", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.NOV", "Value": 295672035},
			    	{"Account": "MARGIN", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.DEC", "Value": 286769530},
			    	
			    	{"Account": "MARGIN", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.JAN", "Value": 373524884},
			    	{"Account": "MARGIN", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.FEB", "Value": 320254060},
			    	{"Account": "MARGIN", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.MAR", "Value": 322043767},
			    	{"Account": "MARGIN", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.APR", "Value": 375173041},
			    	{"Account": "MARGIN", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.MAY", "Value": 367387451},
			    	{"Account": "MARGIN", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.JUN", "Value": 378209629},
			    	{"Account": "MARGIN", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.JUL", "Value": 372502529},
			    	{"Account": "MARGIN", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.AUG", "Value": 372932925},
			    	{"Account": "MARGIN", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.SEP", "Value": 374356248},
			    	{"Account": "MARGIN", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.OCT", "Value": 380559416},
			    	{"Account": "MARGIN", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.NOV", "Value": 399159730},
			    	{"Account": "MARGIN", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.DEC", "Value": 392121276},
			    	
			    	{"Account": "MARGIN", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.JAN", "Value": 291541007},
			    	{"Account": "MARGIN", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.FEB", "Value": 295929002},
			    	{"Account": "MARGIN", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.MAR", "Value": 298827044},
			    	{"Account": "MARGIN", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.APR", "Value": 303027755},
			    	{"Account": "MARGIN", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.MAY", "Value": 309555339},
			    	{"Account": "MARGIN", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.JUN", "Value": 311343874},
			    	{"Account": "MARGIN", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.JUL", "Value": 308154761},
			    	{"Account": "MARGIN", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.AUG", "Value": 315212606},
			    	{"Account": "MARGIN", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.SEP", "Value": 313104104},
			    	{"Account": "MARGIN", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.OCT", "Value": 319381988},
			    	{"Account": "MARGIN", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.NOV", "Value": 325935056},
			    	{"Account": "MARGIN", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.DEC", "Value": 327003131},
			    	
			    	{"Account": "EBITDA", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.JAN", "Value": 116286852},
			    	{"Account": "EBITDA", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.FEB", "Value": 153768021},
			    	{"Account": "EBITDA", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.MAR", "Value": 154097388},
			    	{"Account": "EBITDA", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.APR", "Value": 123014851},
			    	{"Account": "EBITDA", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.MAY", "Value": 154754028},
			    	{"Account": "EBITDA", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.JUN", "Value": 167927296},
			    	{"Account": "EBITDA", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.JUL", "Value": 127732509},
			    	{"Account": "EBITDA", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.AUG", "Value": 159317724},
			    	{"Account": "EBITDA", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.SEP", "Value": 140444441},
			    	{"Account": "EBITDA", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.OCT", "Value": 139630484},
			    	{"Account": "EBITDA", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.NOV", "Value": 155931755},
			    	{"Account": "EBITDA", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.DEC", "Value": 151041090},
			    	
			    	{"Account": "EBITDA", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.JAN", "Value": 195488788},
			    	{"Account": "EBITDA", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.FEB", "Value": 226124486},
			    	{"Account": "EBITDA", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.MAR", "Value": 224023900},
			    	{"Account": "EBITDA", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.APR", "Value": 191811695},
			    	{"Account": "EBITDA", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.MAY", "Value": 209471986},
			    	{"Account": "EBITDA", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.JUN", "Value": 221673364},
			    	{"Account": "EBITDA", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.JUL", "Value": 187780469},
			    	{"Account": "EBITDA", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.AUG", "Value": 214262744},
			    	{"Account": "EBITDA", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.SEP", "Value": 197103746},
			    	{"Account": "EBITDA", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.OCT", "Value": 196415396},
			    	{"Account": "EBITDA", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.NOV", "Value": 205398587},
			    	{"Account": "EBITDA", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.DEC", "Value": 191286853},
			    	
			    	{"Account": "EBITDA", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.JAN", "Value": 186516933},
			    	{"Account": "EBITDA", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.FEB", "Value": 207404453},
			    	{"Account": "EBITDA", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.MAR", "Value": 210263714},
			    	{"Account": "EBITDA", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.APR", "Value": 179579930},
			    	{"Account": "EBITDA", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.MAY", "Value": 207232935},
			    	{"Account": "EBITDA", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.JUN", "Value": 207018453},
			    	{"Account": "EBITDA", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.JUL", "Value": 183257211},
			    	{"Account": "EBITDA", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.AUG", "Value": 208110286},
			    	{"Account": "EBITDA", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.SEP", "Value": 119376256},
			    	{"Account": "EBITDA", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.OCT", "Value": 124212520},
			    	{"Account": "EBITDA", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.NOV", "Value": 127560429},
			    	{"Account": "EBITDA", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.DEC", "Value": 127481661},
			    	
			    	{"Account": "HEADCOUNT", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.JAN", "Value": 14556},
			    	{"Account": "HEADCOUNT", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.FEB", "Value": 14555},
			    	{"Account": "HEADCOUNT", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.MAR", "Value": 14560},
			    	{"Account": "HEADCOUNT", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.APR", "Value": 14565},
			    	{"Account": "HEADCOUNT", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.MAY", "Value": 14567},
			    	{"Account": "HEADCOUNT", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.JUN", "Value": 14566},
			    	{"Account": "HEADCOUNT", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.JUL", "Value": 14566},
			    	{"Account": "HEADCOUNT", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.AUG", "Value": 14567},
			    	{"Account": "HEADCOUNT", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.SEP", "Value": 14568},
			    	{"Account": "HEADCOUNT", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.OCT", "Value": 14569},
			    	{"Account": "HEADCOUNT", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.NOV", "Value": 14570},
			    	{"Account": "HEADCOUNT", "Version": "ACTUAL", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.DEC", "Value": 14570},
			    	
			    	{"Account": "HEADCOUNT", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.JAN", "Value": 14793},
			    	{"Account": "HEADCOUNT", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.FEB", "Value": 14792},
			    	{"Account": "HEADCOUNT", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.MAR", "Value": 14817},
			    	{"Account": "HEADCOUNT", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.APR", "Value": 14817},
			    	{"Account": "HEADCOUNT", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.MAY", "Value": 14945},
			    	{"Account": "HEADCOUNT", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.JUN", "Value": 14985},
			    	{"Account": "HEADCOUNT", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.JUL", "Value": 14985},
			    	{"Account": "HEADCOUNT", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.AUG", "Value": 15070},
			    	{"Account": "HEADCOUNT", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.SEP", "Value": 15070},
			    	{"Account": "HEADCOUNT", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.OCT", "Value": 15070},
			    	{"Account": "HEADCOUNT", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.NOV", "Value": 15070},
			    	{"Account": "HEADCOUNT", "Version": "TARGET", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.DEC", "Value": 15070},
			    	
			    	{"Account": "HEADCOUNT", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.JAN", "Value": 15992},
			    	{"Account": "HEADCOUNT", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.FEB", "Value": 15993},
			    	{"Account": "HEADCOUNT", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q1", "TIME": "2019.MAR", "Value": 16113},
			    	{"Account": "HEADCOUNT", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.APR", "Value": 16235},
			    	{"Account": "HEADCOUNT", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.MAY", "Value": 16336},
			    	{"Account": "HEADCOUNT", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q2", "TIME": "2019.JUN", "Value": 16429},
			    	{"Account": "HEADCOUNT", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.JUL", "Value": 16380},
			    	{"Account": "HEADCOUNT", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.AUG", "Value": 16362},
			    	{"Account": "HEADCOUNT", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q3", "TIME": "2019.SEP", "Value": 13329},
			    	{"Account": "HEADCOUNT", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.OCT", "Value": 13329},
			    	{"Account": "HEADCOUNT", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.NOV", "Value": 13329},
			    	{"Account": "HEADCOUNT", "Version": "FCST", "YEAR": "2019", "QUARTER": "2019.Q4", "TIME": "2019.DEC", "Value": 13329},
			    	
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2020", "QUARTER": "2020.Q4", "TIME": "2020.DEC", "Value": 7734488022},
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2021", "QUARTER": "2021.Q4", "TIME": "2021.DEC", "Value": 7834488022},
			    	{"Account": "REVENUE", "Version": "ACTUAL", "YEAR": "2022", "QUARTER": "2022.Q4", "TIME": "2022.DEC", "Value": 8034488022},
			    	
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2020", "QUARTER": "2020.Q4", "TIME": "2020.DEC", "Value": 7634488022},
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2021", "QUARTER": "2021.Q4", "TIME": "2021.DEC", "Value": 8634488022},
			    	{"Account": "REVENUE", "Version": "TARGET", "YEAR": "2022", "QUARTER": "2022.Q4", "TIME": "2022.DEC", "Value": 8634488022},
			    	
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2020", "QUARTER": "2020.Q4", "TIME": "2020.DEC", "Value": 8634488022},
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2021", "QUARTER": "2021.Q4", "TIME": "2021.DEC", "Value": 8634488022},
			    	{"Account": "REVENUE", "Version": "FCST", "YEAR": "2022", "QUARTER": "2022.Q4", "TIME": "2022.DEC", "Value": 8634488022}			    	
    					];
    
    
    //mini bar graph KPI
    var kpiRevData = sliceIntersectData(trend_data,{"TIME":"/2019.*","Account": "REVENUE"}, {"TIME": "TOTAL", "QUARTER":"TOTAL"})
    var kpiRevLineData = sliceIntersectData(trend_data,{"TIME":"/2019.*","Account": "REVENUE","Version": "ACTUAL"});
    var kpiOpexData = sliceIntersectData(trend_data,{"TIME":"/2019.*","Account": "OPEX"}, {"TIME": "TOTAL", "QUARTER":"TOTAL"})
    var kpiOpexLineData = sliceIntersectData(trend_data,{"TIME":"/2019.*","Account": "OPEX","Version": "ACTUAL"});
    var kpiOpexLineData2 = sliceIntersectData(trend_data,{"TIME":"/2019.*","Account": "OPEX","Version": "ACT1"});
    var kpiOpexLineData3 = sliceIntersectData(trend_data,{"TIME":"/2019.*","Account": "OPEX","Version": "ACT2"});
    var kpiOpexLineDataMany = kpiOpexLineData.concat(kpiOpexLineData2).concat(kpiOpexLineData3).slice(0,31);

    var kpiEbitdaData = sliceIntersectData(trend_data,{"TIME":"/2019.*","Account": "EBITDA"}, {"TIME": "TOTAL", "QUARTER":"TOTAL"})
    var kpiEbitdaLineData = sliceIntersectData(trend_data,{"TIME":"/2019.*","Account": "EBITDA","Version": "ACTUAL"});
    
    var kpiMarginData = sliceIntersectData(trend_data,{"TIME":"/2019.*","Account": "MARGIN"}, {"TIME": "TOTAL", "QUARTER":"TOTAL"})
    var kpiMarginLineData = sliceIntersectData(trend_data,{"TIME":"/2019.*","Account": "MARGIN","Version": "ACTUAL"});   
    
    var kpiHCData = sliceIntersectData(trend_data,{"TIME":"/2019.*","Account": "HEADCOUNT"}, {"TIME": "TOTAL", "QUARTER":"TOTAL"})
    var kpiHCLineData = sliceIntersectData(trend_data,{"TIME":"/2019.*","Account": "HEADCOUNT","Version": "ACTUAL"});
    
    miniCharts({
    	element: "home-small-charts",
    	defaultOptions: {
    		measureDisplay: "short"
    	},
    	selections: [{
        	name: "Revenue",
        	data: kpiRevData,
        	colors: "#4273C5",
        	barChart: {data: kpiRevLineData, tooltip: {"TIME": "Time","Value": "Value"}}
        },{
        	name: "Margin",
        	data: kpiMarginData,
        	colors: "#00D19F",
        	barChart: {data: kpiMarginLineData, tooltip: {"TIME": "Time","Value": "Value"}}
        },{
        	name: "OPEX",
        	data: kpiOpexData,
        	colors: "#9F81DB",
        	barChart: {data: kpiOpexLineDataMany, tooltip: {"TIME": "Time","Value": "Value"}}
        },{
        	name: "EBITDA",
        	data: kpiEbitdaData,
        	colors: "#E87503",
        	barChart: {data: kpiEbitdaLineData, tooltip: {"TIME": "Time","Value": "Value"}}  	
        }, {
        	name: "Headcount",
        	data: kpiHCData,
        	//title: "HEADCOUNT TREND",
        	colors: "#E456D0",
        	barChart: {data: kpiHCLineData, tooltip: {"TIME": "Time","Value": "Value"}} 	    	
        }]
    });
    
    //trend graph
    var trendOpexData = sliceIntersectData(trend_data, {"Account":"OPEX"});
    var trendRevData = sliceIntersectData(trend_data, {"Account":"REVENUE"});
    var trendEbitdaData = sliceIntersectData(trend_data, {"Account":"EBITDA"});
    var trendHCData = sliceIntersectData(trend_data, {"Account":"HEADCOUNT"});
    var trendMarginData = sliceIntersectData(trend_data, {"Account":"MARGIN"});
    var trendTestData = sliceIntersectData(trend_data, {"TESTACC":"REVENUE"});
    var trendColor = ['#9cc3e7','#ffdb63','#f7b284', '#c7b2c4', '#aaaa11'];
    
    var trendOpexPriorDataA = sliceIntersectData(trend_data, {"TIME": "/2019.*","Account":"OPEX","Version": "ACTUAL"},{"Version":"2019"});
    var trendOpexPriorDataB = sliceIntersectData(trend_data, {"TIME": "/2018.*","Account":"OPEX","Version": "ACTUAL"},{"Version":"2018"});
    var trendOpexPriorData = trendOpexPriorDataA.concat(trendOpexPriorDataB);
    trendOpexPriorData.map(item => {item.TIME = item.TIME.substr(5); })
    
    trendBarOpex = {
		data: trendOpexData,
    	colors: "#9F81DB",			
		measureDisplay: 'short',
    	z: {dimension: "Version", type:["bar","bar",'bar','bar','line']}		
    };
    
    trendBarRevenue = {
    	colors: "#4273C5",	    		
		data: trendRevData
    };   
    
    trendBarEbitda = {
    	colors: "#E87503",	    		
		data: trendEbitdaData
    };    
    
    trendBarHC = {
		data: trendHCData,
    	colors: "#E456D0",				
		y: {label: "Heads"},  	
    	measureDisplay: 'default'
    }; 
    
    trendBarMargin = {
    	colors: "#00D19F",		    		
		data: trendMarginData
    };    
    
    trendBarPrior = {
		data: trendOpexPriorData,
		colors: "#9F81DB",
		measureDisplay: 'short',
		tooltip: {measureDisplay:"default", type:"full"},
		y: {label: "Dollars"}
    }
    
    trendCharts({
    	element: 'trend_line_bar',
    	chartGroup: [{
			name:"TREND",
			chart: "bar-line",
			chartParam: {
						measureDisplay: 'short',
						responsive: false,
						tooltip: {measureDisplay:"default", type:"full"},
			        	//x: {dimension: "TIME"},
			        	x: [
			        		{name: "MONTH",
			        		 dimension: "TIME",
			        		 filter: {"YEAR": "2019"}},
			        		{name: "QUARTER",
			        	     dimension: "QUARTER",
			        	     sumDimension: "TIME",
			        	     filter: {"YEAR": "/^(2018|2019)$"}
			        	    },
			        	    {name: "YEAR",
			        	     dimension: "YEAR",
			        	     sumDimension: ["TIME","QUARTER"],
			        	     }
			        	],
			        	y: {label: "Dollars", ticks: 5},  
			        	z: {dimension: "Version"}
			        	},
			selections: [{
				title: "REVENUE TREND",
				value: "Revenue",			
				selected: true,
				chartParam: trendBarRevenue
					},{
				title: "OPEX TREND",
				value: "OPEX",		
				chartParam: trendBarOpex
					},{
				title: "MARGIN TREND",
				value: "Margin",		
				chartParam: trendBarMargin     					
					},{
				title: "EBITDA TREND",
				value: "EBITDA",			
				chartParam: trendBarEbitda
					},{
				title: "HEADCOUNT TREND",
				value: "Headcount",
				chartParam: trendBarHC
				}]
			},{
			name: "PRIOR",
			chart: "bar-line",
			chartParam: {responsive: false},
			selections: [{
				title: "OPEX PRIOR COMPARISON",
				value: "Prior",
				chartParam: trendBarPrior
				}]
			}]
    })
    
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
    	{"id":"12 AM", "title": "12 AM", "parent": "AM","icon":"icon-watch2"},
    	{"id":"1 AM", "title": "1 AM", "parent": "AM","icon":"icon-watch2"},
    	{"id":"2 AM", "title": "2 AM", "parent": "AM","icon":"icon-watch2"},
    	{"id":"3 AM", "title": "3 AM", "parent": "AM","icon":"icon-watch2"},
    	{"id":"4 AM", "title": "4 AM", "parent": "AM","icon":"icon-watch2"},
    	{"id":"5 AM", "title": "5 AM", "parent": "AM","icon":"icon-watch2"},
    	{"id":"6 AM", "title": "6 AM", "parent": "AM","icon":"icon-watch2"},
    	{"id":"7 AM", "title": "7 AM", "parent": "AM","icon":"icon-watch2"},
    	{"id":"8 AM", "title": "8 AM", "parent": "AM","icon":"icon-watch2"},
    	{"id":"9 AM", "title": "9 AM", "parent": "AM","icon":"icon-watch2"},
    	{"id":"10 AM", "title": "10 AM", "parent": "AM","icon":"icon-watch2"},
    	{"id":"11 AM", "title": "11 AM", "parent": "AM","icon":"icon-watch2"},
    	{"id":"12 PM", "title": "12 PM", "parent": "PM","icon":"icon-watch2"},
    	{"id":"1 PM", "title": "1 PM", "parent": "PM","icon":"icon-watch2"},
    	{"id":"2 PM", "title": "2 PM", "parent": "PM","icon":"icon-watch2"},
    	{"id":"3 PM", "title": "3 PM", "parent": "PM","icon":"icon-watch2"},
    	{"id":"4 PM", "title": "4 PM", "parent": "PM","icon":"icon-watch2"},
    	{"id":"5 PM", "title": "5 PM", "parent": "PM","icon":"icon-watch2"},
    	{"id":"6 PM", "title": "6 PM", "parent": "PM","icon":"icon-watch2"},
    	{"id":"7 PM", "title": "7 PM", "parent": "PM","icon":"icon-watch2"},
    	{"id":"8 PM", "title": "8 PM", "parent": "PM","icon":"icon-watch2"},
    	{"id":"9 PM", "title": "9 PM", "parent": "PM","icon":"icon-watch2"},
    	{"id":"10 PM", "title": "10 PM", "parent": "PM","icon":"icon-watch2"},
    	{"id":"11 PM", "title": "11 PM", "parent": "PM","icon":"icon-watch2"},
    ];
    
    /*
    primarySelector({
    	element: "home-context-selector",
    	selection: [
    		{
    			name: "MODEL / CALC GROUP",
    			currentMember: "All Models",
    			recent: ["REV_PLAN","HC_PLAN","MGMT_RPT"],
    			topNode: {"id": "All Models", "title": "All Models", "expanded": true, "icon": "icon-cube4"},
    			idCol: "id",
    			descCol: "title",
    			parentCol: "parent",
    			placeHolder: "Type Model or Calc Group",
    			data: model_calc_grp_lst_data
    		},{
    			name: "TIME",
    			currentMember: "December 27, 2018 - January 27, 2019",
    			type: "date-picker"
    		}
    	],
    	secondarySelection: [
    		{
    			name: "HOURS",
    			currentMember: "All Hours",
    			recent: ["All Hours","12 AM", "12 PM"],
    			topNode: {"id": "All Hours","title": "All Hours", "expanded": true,"icon":"icon-watch"},
    			placeHolder: "Type Hours",
    			data: hours_lst_data
    		}
    	]
    });*/
    
});

