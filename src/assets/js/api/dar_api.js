/**
 * Call web service
 */
function callWebService(url, request, responseHead = '', async, callback, audit_count) {
    responseHead = responseHead || '';
    async = async || false;
    audit_count = audit_count || false;    
    /* json data */
    // var isIE = /*@cc_on!@*/false || !!document.documentMode;
    // var isEdge = !isIE && !!window.StyleMedia;
    // if(isEdge) {
    // if(responseHead !== 'ZdarPagesERResponse' && responseHead !== 'ZdarTypeFilterRResponse' && responseHead !== 'ZdarPrimaryFilRResponse') {
    //     var response = getJSON(responseHead);
    //     if(response) {
    //         if(async && callback) {
    //             callback(response);
    //         }
    //         return response;
    //     }
    // }
    // }
    /* -- end */
    url = getURL(url);
    var requestData = '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="urn:sap-com:document:sap:soap:functions:mc-style">';
    requestData += '<soap:Header/>';
    requestData += '<soap:Body>';
    requestData += request;
    requestData += '</soap:Body>';
    requestData += '</soap:Envelope>';
    var response = genericAjaxXMLPostSync(url, requestData, responseHead, async, callback);
    if (!async) {
        var header = "n0:" + responseHead;
        var output = { colHeaders: {}, columns: [], data: [] }
        if (typeof response !== 'undefined') {
            var result = xmlToJson(response);
            if (audit_count) {
                if (typeof (result["soap-env:Envelope"]["soap-env:Body"][header]) !== 'undefined') {
                    var items = result["soap-env:Envelope"]["soap-env:Body"][header];
                    return items;
                }
            } else if(responseHead == 'ZdarUsersAndTeamsRResponse') {
                return result["soap-env:Envelope"]["soap-env:Body"][header];
            } else {
                if (typeof (result["soap-env:Envelope"]["soap-env:Body"][header]["Tdata"]) !== 'undefined') {
                    var items = result["soap-env:Envelope"]["soap-env:Body"][header]["Tdata"]["item"];
                    return items;
                } else {
                    if (typeof (result["soap-env:Envelope"]["soap-env:Body"][header]['StatusMsgText']) !== 'undefined') {
                        return result["soap-env:Envelope"]["soap-env:Body"][header]['StatusMsgText'];
                    } else {
                        return true;
                    }
                }
            }
        } else {
            if ($('#param-webservice-error').val() !== '') { return; }
            alert("The web service call " + responseHead + " cannot reach the server. Please check your network connectivity and try again. If this issue continues to happen, please contact your technical support team for further assistance.");
            setWebserviceOffline();
        }
    }
    loader('hide');
}

/**
 * Get URL
 */
function getURL(url) {
    if (location.host == 'darwinepm.github.io' || location.host == '172.16.0.114') {
        url = url.replace('%client_no%', 100);
        return 'https://sapwd.column5.com:2443/sap/bc/srt/rfc/sap/' + url;
    } else {

        if (getLocalStorage('api_client', false) === null) {
            updateClientNumber();
        }
        var client_no = getLocalStorage('api_client', false);

        url = url.replace('%client_no%', client_no);
        return location.protocol + '//' + location.host + '/sap/bc/srt/rfc/sap/' + url;
    }
}

/**
 * Generic Ajax XML Post Sync
 */
function genericAjaxXMLPostSync(url, data, responseHead, async, callback) {
    responseHead = responseHead || '';
    async = async || false;
    if ($('#param-webservice-error').val() !== '') { return; }
    var result;
    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'text/xml',
        data: data,
        dataType: 'xml',
        async: async,
        xhrFields: {
            withCredentials: true
        },
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        success: function (response) {
            if (async) {
                if (callback) {
                    var items;
                    if (responseHead == 'ZdarScriptLogicExecuteResponse') {
                        items = response;
                    } else {
                        var header = "n0:" + responseHead;
                        result = xmlToJson(response);
                        if (typeof (result["soap-env:Envelope"]["soap-env:Body"][header]["Tdata"]) !== 'undefined') {
                            items = result["soap-env:Envelope"]["soap-env:Body"][header]["Tdata"]["item"];
                        } else if(responseHead == 'ZdarUsersAndTeamsRResponse') {
                            items = result["soap-env:Envelope"]["soap-env:Body"][header];
                        } else {
                            if (typeof (result["soap-env:Envelope"]["soap-env:Body"][header]['StatusMsgText']) !== 'undefined') {
                                items = result["soap-env:Envelope"]["soap-env:Body"][header]['StatusMsgText'];
                            } else {
                                items = true;
                            }
                        }
                    }
                    callback(items);
                }
            } else {
                result = response;
            }
            loader('hide');
        },
        error: function (jqXHR, textStatus, errorThrown) {
            result = jqXHR.responseText;
            if (jqXHR.status === 401) {
                displayCatchError('unauthorized',responseHead);
            }else if (jqXHR.status === 503 || data.indexOf('ZdarMin') != -1) {
                displayCatchError('maintenance');
            }
            else if (url.indexOf('_c_') != -1 || url.indexOf('_w_') != -1) {
                alert("Data was not saved successfully. Please try again, and report to your tech support if you continue to experience issues saving data");
            }
            else if (url.indexOf('_script_logic_execute_') != -1) {
                alert("The web service " + responseHead + " call cannot reach the server. Please check your network connectivity and try again. If this issue continues to happen, please contact your technical support team for further assistance.");
            }
            else if (data.indexOf('ZdarAuditLogR') != -1) {
                alert("Warning! Data could not be retrieved at the criteria selection. Please try again and report to your support team if this issue continues.");
            }
            else {
                alert("The web service " + responseHead + " call cannot reach the server. Please check your network connectivity and try again. If this issue continues to happen, please contact your technical support team for further assistance.");
            }
            setWebserviceOffline();
            loader('hide');
        }
    });
    if (!async) {
        return result;
    }
}

/**
 * XML to JSON
 */
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
    } else if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof (obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof (obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }

    if (JSON.stringify(obj) === "{}") {
        obj = "";
    }
    return obj;

}

/**
 * JSON to XML
 */
function jsonToXml(obj) {
    var xml = '';
    for (var prop in obj) {
        if (obj[prop] instanceof Array) {
            for (var array in obj[prop]) {
                xml += '<' + prop + '>';
                xml += jsonToXml(new Object(obj[prop][array]));
                xml += '</' + prop + '>';
            }
        } else {
            xml += '<' + prop + '>';
            typeof obj[prop] == 'object' ? xml += jsonToXml(new Object(obj[prop])) : xml += obj[prop].replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
            //.replace(/'/g, '&apos;');
            xml += '</' + prop + '>';
        }
    }
    var xml = xml.replace(/<\/?[0-9]{1,}>/g, '');
    return xml;
}
