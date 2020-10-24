function getDimJSONData(){
    return [
        {"title": "TB000" , icon : '', id:"TB000" , desc: "Trial Balance", "ACCTYPE":"INC" , "ACC_SUB_TYPE":"AST" , "RATETYPE":"END" ,"expanded": true, "folder": true, "children": [
            { "title": "B0000", icon : '', id:"B0000", desc: "Balance Sheet", "ACCTYPE":"INC" , "ACC_SUB_TYPE":"AST" , "RATETYPE":"END", "expanded": true, "children": [
                {"title": "B1000", icon : '', id:"B1000", desc: "Total Assets", "ACCTYPE":"EXP" , "ACC_SUB_TYPE":"AST" , "RATETYPE":"END",  "children": [
                    {"title": "B1100", icon : '', id:"B1100", desc: "Current Assets", "ACCTYPE":"EXP" , "ACC_SUB_TYPE":"AST" , "RATETYPE":"END", "children": [
                        { "title": "B1110", icon : '', id:"B1110", desc: "Cash", "ACCTYPE":"EXP" , "ACC_SUB_TYPE":"AST" , "RATETYPE":"END", "children": [
                            { "title": "10000", icon : '', id:"10000", desc: "Beginning Cash", "ACCTYPE":"EXP" , "ACC_SUB_TYPE":"AST" , "RATETYPE":"END", "active": true, "focused": true, }, 
                            { "title": "10100", icon : '', id:"10100",  desc: "Operating Account - Main", "ACCTYPE":"EXP" , "ACC_SUB_TYPE":"AST" , "RATETYPE":"END", }, 
                        ]},                
                    ]},                    
                ]},
                {"title": "B2000", icon : '', id:"B2000", desc: "Total Liabilities and Equity", "ACCTYPE":"INC" , "ACC_SUB_TYPE":"LIA", "RATETYPE":"END", "expanded": true, "children": [
                    {"title": "B2100", icon : '', id:"B2100", desc: "Total Liabilities", "ACCTYPE":"INC" , "ACC_SUB_TYPE":"LIA", "RATETYPE":"END", "expanded": true,"children": [
                        { "title": "B2200", icon : '', id:"B2200", desc: "Total  Current Liabilities", "ACCTYPE":"INC" , "ACC_SUB_TYPE":"LIA", "RATETYPE":"END", "children": [
                            { "title": "10000", icon : '', id:"10000", desc: "Operating Account - Main", "ACCTYPE":"INC" , "ACC_SUB_TYPE":"LIA", "RATETYPE":"END", "focused": true, }, 
                            { "title": "10100", icon : '', id:"10000", desc: "Operating Account - Main", "ACCTYPE":"INC" , "ACC_SUB_TYPE":"LIA", "RATETYPE":"END", }, 
                        ]}, 
                        { "title": "B2300", icon : '', id:"B2300", desc: "Long Term Dert", "ACCTYPE":"INC" , "ACC_SUB_TYPE":"LIA", "RATETYPE":"END", "children": [
                            { "title": "10000", icon : '',id:"10000", desc: "Operating Account - Main", "ACCTYPE":"INC" , "ACC_SUB_TYPE":"LIA", "RATETYPE":"END", "focused": true, }, 
                            { "title": "10100", icon : '',id:"10100", desc: "Operating Account - Main", "ACCTYPE":"INC" , "ACC_SUB_TYPE":"LIA", "RATETYPE":"END", }, 
                        ]},             
                    ]},  
                    {"title": "B3100", icon : '', id:"B3100", desc: "Total Equity", "ACCTYPE":"INC" , "ACC_SUB_TYPE":"EQU" , "RATETYPE":"END", "expanded": '',"children": [
                        { "title": "B3200", icon : '', id:"B3200", desc: "Operating Account - Main", "ACCTYPE":"INC" , "ACC_SUB_TYPE":"LIA", "RATETYPE":"END", "children": [
                            { "title": "10000", icon : '', id:"10000", desc: "Operating Account - Main", "ACCTYPE":"INC" , "ACC_SUB_TYPE":"AST", "RATETYPE":"END", "focused": true, }, 
                            { "title": "10100", icon : '', id:"10000", desc: "Operating Account - Main", "ACCTYPE":"INC" , "ACC_SUB_TYPE":"AST", "RATETYPE":"END", }, 
                        ]}, 
                        { "title": "B3300", icon : '', id:"B3300", desc: "Operating Account - Main", "ACCTYPE":"INC" , "ACC_SUB_TYPE":"EQU", "RATETYPE":"END", "children": [
                            { "title": "10000", icon : '', id:"10000", desc: "Operating Account - Main", "ACCTYPE":"INC" , "ACC_SUB_TYPE":"AST", "RATETYPE":"END", "focused": true, }, 
                            { "title": "10100", icon : '', id:"10000", desc: "Operating Account - Main", "ACCTYPE":"INC" , "ACC_SUB_TYPE":"EQU", "RATETYPE":"END", }, 
                        ]},             
                    ]},                    
                ]},
            ]}
        ]}
    ]
}