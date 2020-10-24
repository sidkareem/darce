/**
 * Description: Call dimension | project read bind webservice
 * @param {string} Dimension 
 * @param {string} Page 
 * @param {boolean} async 
 * @param {string} callback
 */
function getWsZdarDimInfoRBind(Dimension, Page, async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    var request = `<tns:ZdarDimInfoR>
                        <Env>${getEnvironment()}</Env>
                        <Dimension>${Dimension}</Dimension>
                        <Page>${Page}</Page>
                    </tns:ZdarDimInfoR>`;
    return callWebService(url, request, 'ZdarDimInfoRResponse', async, callback);
}

/**
 * Description: Initialize Project Datatable
 * @param {string} tableClass 
 */
function initializeProjectTable(tableClass = '') {
    $('.' + tableClass).dataTable({
        paging: false, 
        info: false, 
        retrieve: true,
        order: [],
        responsive: true
    })
}

/**
 * Description: Write Dimensions Info Web Service
 * @param {array} requestData 
 * @param {*} async 
 * @param {*} callback 
 */
function WsZdarDimInfoW(request, async = false, callback = '') {
    var url = getConfig('zdar_calc_engine_bind');
    return callWebService(url, request, 'ZdarDimInfoWResponse');
}