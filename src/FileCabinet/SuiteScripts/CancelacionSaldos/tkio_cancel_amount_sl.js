/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/ui/serverWidget', 'N/task', 'N/redirect', 'N/file', 'N/runtime', 'N/record'],
    /**
     * @param {search} search
     * @param {serverWidget} serverWidget
     * @param {redirect} redirect
     */
    function (search, serverWidget, task, redirect, file, runtime, record) {

        const CUSTOM_FIELDS = {};
        CUSTOM_FIELDS.SELECT_CURRENT = 'custpage_select_current'; // Campo exclusivo de Vinoteca
        CUSTOM_FIELDS.PAGE = 'custpage_page'; // Campo exclusivo de Vinoteca
        CUSTOM_FIELDS.SELECT_ALL = 'custpage_select_all'; // Campo exclusivo de Vinoteca
        CUSTOM_FIELDS.CUSTOMER = 'custpage_customer';
        CUSTOM_FIELDS.CUSTOMER_CATEGORY = 'custpage_customer_category'; // Campo exclusivo de GNC
        CUSTOM_FIELDS.SUBSIDIARY = 'custpage_subsidiary';
        CUSTOM_FIELDS.TRAN_TYPE = 'custpage_transaction_type';
        CUSTOM_FIELDS.TRAN_DATE = 'custpage_trandate';
        CUSTOM_FIELDS.START_DATE = 'custpage_startdate';
        CUSTOM_FIELDS.END_DATE = 'custpage_enddate';
        CUSTOM_FIELDS.START_AMT = 'custpage_start_amt';
        CUSTOM_FIELDS.END_AMT = 'custpage_end_amt';
        CUSTOM_FIELDS.REASON = 'custpage_reason';
        CUSTOM_FIELDS.PRIMARY = 'custpage_primaryfilters';
        CUSTOM_FIELDS.SECONDARY = 'custpage_secondaryfilters';
        CUSTOM_FIELDS.FILE = 'custpage_file';
        CUSTOM_FIELDS.TOTAL_TRANS = 'custpage_total_trans'; // Campo exclusivo de Vinoteca
        CUSTOM_FIELDS.MESSAGE = 'custpage_message'; // Campo exclusivo de Vinoteca
        CUSTOM_FIELDS.DEPARTMENT = 'custpage_department'; // Campo exclusivo de GNC
        CUSTOM_FIELDS.CLASS = 'custpage_class'; // Campo exclusivo de GNC

        const CUSTOM_LISTS = {};
        CUSTOM_LISTS.LIST_ID = 'custpage_transactions';
        CUSTOM_LISTS.SELECT = 'custpage_list_select';
        CUSTOM_LISTS.DATE = 'custpage_list_date';
        CUSTOM_LISTS.SUBSIDIARY_ID = 'custpage_list_subsidiary_id'; // Campo exclusivo de Vinoteca
        CUSTOM_LISTS.SUBSIDIARY = 'custpage_list_subsidiary';
        CUSTOM_LISTS.NUMBER = 'custpage_list_number';
        CUSTOM_LISTS.NAME = 'custpage_list_customer';
        CUSTOM_LISTS.AMOUNT = 'custpage_list_amount';
        CUSTOM_LISTS.AMOUNT_REMAINING = 'custpage_list_amount_remaining';
        CUSTOM_LISTS.INTERNAL_ID = 'custpage_list_internalid';
        CUSTOM_LISTS.ACCOUNT = 'custpage_list_account';
        CUSTOM_LISTS.TRANS_TYPE = 'custpage_list_tran_type';
        CUSTOM_LISTS.IS_INACTIVE = 'custpage_is_inactive'; // Campo exclusivo de Vinoteca
        CUSTOM_LISTS.TYPE_ENTITY = 'custpage_entity_type'; // Campo exclusivo de Vinoteca
        CUSTOM_LISTS.PAYMENT_METHOD = 'custpage_list_payment_method'; // Campo exclusivo de GNC
        CUSTOM_LISTS.DEPARTMENT = 'custpage_list_department'; // Campo exclusivo de GNC
        CUSTOM_LISTS.CLASS = 'custpage_list_class'; // Campo exclusivo de GNC
        CUSTOM_LISTS.INTERCOMPANY = 'custpage_list_intercompany'; // Campo exclusivo de GNC

        CUSTOM_FIELDS.LISTS = CUSTOM_LISTS;

        const RECORDS = {};
        RECORDS.SUBSIDIARY = 'subsidiary';
        RECORDS.CUSTOMER = 'customer';
        RECORDS.CUSTOMER_CATEGORY = 'customercategory';// Campo exclusivo de GNC
        RECORDS.INVOICE = 'invoice';
        RECORDS.INVOICE_SHORT = 'CustInvc';
        RECORDS.CREDITMEMO_SHORT = 'CustCred'; // Campo exclusivo de Vinoteca
        RECORDS.CREDITMEMO = 'creditmemo'; // Campo exclusivo de Vinoteca
        RECORDS.CREDITBILL_SHORT = 'VendCred'; // Campo exclusivo de Vinoteca
        RECORDS.CREDITBILL = 'CustCred'; // Campo exclusivo de Vinoteca
        RECORDS.BILL_SHORT = 'VendBill'; // Campo exclusivo de Vinoteca
        RECORDS.BILL = 'bill'; // Campo exclusivo de Vinoteca
        RECORDS.CUSTOMER_PAYMENT = 'customerpayment';
        RECORDS.CUSTOMER_PAYMENT_SHORT = 'CustPymt';
        RECORDS.TRANSACTION = 'transaction';
        RECORDS.ACCOUNT = 'account';

        const TRANSACTION_BODY = {};
        TRANSACTION_BODY.TYPE = 'type';
        TRANSACTION_BODY.TYPE_ENTITY = 'typeentity'; // Campo exclusivo de Vinoteca
        TRANSACTION_BODY.INTERNAL_ID = 'internalid';
        TRANSACTION_BODY.MAINLINE = 'mainline';
        TRANSACTION_BODY.TRANDATE = 'trandate';
        TRANSACTION_BODY.TRAN_NUMBER = 'transactionnumber';
        TRANSACTION_BODY.TRAN_ID = 'tranid';
        TRANSACTION_BODY.ENTITY = 'entity';
        TRANSACTION_BODY.NAME = 'name'; // Campo exclusivo de Vinoteca
        TRANSACTION_BODY.AMOUNT = 'amount';
        TRANSACTION_BODY.SUBSIDIARY = 'subsidiary';
        TRANSACTION_BODY.AMOUNT_REMAINING = 'amountremaining';
        TRANSACTION_BODY.AMOUNT_REMAINING_ZERO = 'amountremainingisabovezero';
        TRANSACTION_BODY.CUSTOMER_MAIN = 'customer'; // Campo exclusivo de Vinoteca
        TRANSACTION_BODY.NAME = 'name';
        TRANSACTION_BODY.ACCOUNT = 'account';
        TRANSACTION_BODY.TYPE = 'type';
        TRANSACTION_BODY.IS_INACTIVE = 'isinactive'; // Campo exclusivo de Vinoteca
        TRANSACTION_BODY.VENDOR = 'vendor'; // Campo exclusivo de Vinoteca
        TRANSACTION_BODY.CLASS = 'class'; // Campo exclusivo de GNC
        TRANSACTION_BODY.DEPARTMENT = 'department'; // Campo exclusivo de GNC
        TRANSACTION_BODY.INTERCOMPANY = 'csegefxintercompani'; // Campo exclusivo de GNC
        TRANSACTION_BODY.PAYMENT_METHOD = 'custbody_efx_db_pay_category'; // Campo exclusivo de GNC
        TRANSACTION_BODY.CUSTOMER_CATEGORY = 'custtype'; // Campo exclusivo de GNC

        const SCRIPTS = {};
        SCRIPTS.SCHEDULED_SCRIPT = {};
        SCRIPTS.SCHEDULED_SCRIPT.SCRIPT_ID = 'customscript_tkio_cs_cancel_amount_me'; //'customscript_ss_closinh_balances';
        SCRIPTS.SCHEDULED_SCRIPT.DEPLOY_ID = 'customdeploy_tkio_cancel_amount_mr'; //'customdeploy_ss_closinh_balances';

        const BALCANCE_CANCELLATION = {};
        BALCANCE_CANCELLATION.RECORD_ID = 'customrecord_efx_cs_tracing_can';
        BALCANCE_CANCELLATION.NAME = 'name';
        BALCANCE_CANCELLATION.TRANSACTION_TO_PROCESS = 'custrecord_efx_cs_transactions_to';
        BALCANCE_CANCELLATION.PROCESSED_TRANSACTIONS = 'custrecord_efx_cs_transactions_after';
        BALCANCE_CANCELLATION.TASK_ID = 'custrecord_efx_cs_task_id';
        BALCANCE_CANCELLATION.ADVANCE_PERCENT = 'custrecord_efx_cs_percent';
        BALCANCE_CANCELLATION.NOTES = 'custrecord_efx_cs_notes';

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {
            try {
                var serverRequest = context.request;
                var serverResponse = context.response;

                var isGNC = runtime.getCurrentScript().getParameter({ name: 'custscript_tkio_is_gnc' });
                log.debug({ title: 'Parameter isGNC:', details: isGNC });
                log.debug({ title: 'Parameter type isGNC:', details: typeof isGNC });
                if (!isGNC) {
                    var taskid = runtime.getCurrentScript().getParameter({ name: 'custscript_tkio_tak' });
                    var deploymentscriptid = runtime.getCurrentScript().deploymentId;
                    var scriptscriptid = runtime.getCurrentScript().id;
                    log.debug("deploymentscriptid", deploymentscriptid);

                    var searchDeployment = search.create({
                        type: search.Type.SCRIPT_DEPLOYMENT,
                        filters: [['scriptid', search.Operator.IS, deploymentscriptid]],
                        columns: [{ name: 'scriptid' }]
                    });
                    log.debug("searchDeployment", searchDeployment);
                    var searchResults = searchDeployment.run().getRange(0, 10);
                    var deploymentId = searchResults[0].id;

                    var status = 0;

                    if (taskid) {
                        status = task.checkStatus({
                            taskId: taskid
                        });
                    }

                    log.debug("status", status);
                    log.debug("deploymentId", deploymentId);
                    log.debug("parameters", serverRequest.parameters);

                }
                var form = serverWidget.createForm({
                    title: 'Cancelación de Saldos'
                });

                form.clientScriptModulePath = './tkio_cancel_amount_cs.js';

                form = createPanel(isGNC, form, serverRequest, status)
                var subList = AddSublist(form, isGNC);
                
                log.debug({title: 'form', details: form.title});
                if (serverRequest.parameters[CUSTOM_FIELDS.SUBSIDIARY] && serverRequest.parameters[CUSTOM_FIELDS.TRAN_TYPE] &&
                    serverRequest.parameters[CUSTOM_FIELDS.START_DATE] && serverRequest.parameters[CUSTOM_FIELDS.END_AMT] &&
                    serverRequest.parameters[CUSTOM_FIELDS.END_DATE]) {

                    var params = serverRequest.parameters;
                    log.debug('params', params);
                    log.debug('params[CUSTOM_FIELDS.TRAN_TYPE]', params[CUSTOM_FIELDS.TRAN_TYPE]);

                    var transType = params[CUSTOM_FIELDS.TRAN_TYPE] || '';
                    transType = transType.split('');
                    var flagCondition = false;
                    log.debug('transType', transType);
                    var searchParams;
                    if (isGNC && serverRequest.method === 'POST') {
                        let searchParamsAux = {
                            'customer': params[CUSTOM_FIELDS.CUSTOMER],
                            'customerCategory': params[CUSTOM_FIELDS.CUSTOMER_CATEGORY],
                            'subsidiary': params[CUSTOM_FIELDS.SUBSIDIARY],
                            'transaction_type': transType,
                            'trandate': params[CUSTOM_FIELDS.TRAN_DATE],
                            'startdate': params[CUSTOM_FIELDS.START_DATE],
                            'enddate': params[CUSTOM_FIELDS.END_DATE],
                            'start_amt': params[CUSTOM_FIELDS.START_AMT],
                            'end_amt': params[CUSTOM_FIELDS.END_AMT],
                            'reason': params[CUSTOM_FIELDS.REASON],
                            'file': params[CUSTOM_FIELDS.FILE]
                        }
                        searchParams = searchParamsAux;
                        log.debug('searchParams', searchParams);
                        log.debug({title: 'form', details: form.title});
                        form = setValueSelect(form, searchParams);
                        log.debug({title: 'form', details: form.title});
                        flagCondition = true;
                    } else if (isGNC && serverRequest.method === 'POST') {
                        flagCondition = false;
                    } else {
                        var customer = '';
                        if (serverRequest.method !== 'POST') {
                            transType = (transType) ? JSON.parse(transType) : [];
                            customer = (params[CUSTOM_FIELDS.CUSTOMER]) ? JSON.parse(params[CUSTOM_FIELDS.CUSTOMER]) : ''
                        }
                        let searchParamsAux = {
                            'customer': customer,
                            'subsidiary': params[CUSTOM_FIELDS.SUBSIDIARY],
                            'transaction_type': transType,
                            'startdate': params[CUSTOM_FIELDS.START_DATE],
                            'enddate': params[CUSTOM_FIELDS.END_DATE],
                            'end_amt': params[CUSTOM_FIELDS.END_AMT]
                        };
                        searchParams = searchParamsAux;
                        log.debug('searchParams', searchParams);
                        flagCondition = true;
                    }

                    if (flagCondition) {
                        // get line count
                        var lineCount = serverRequest.getLineCount({
                            group: CUSTOM_FIELDS.LISTS.LIST_ID
                        });
                        log.debug({ title: 'lineCount', details: lineCount });

                        if (lineCount > 0 && searchParams.file !== 'T') {
                            // process to create a journal entry
                            var lines = [];
                            var csv = '';
                            if (isGNC) {
                                csv = 'ID interno, Fecha, No. Transaccion, Tipo, Subsidiaria, Cliente, Cuenta, Monto, Monto adeudado \r\n';
                            } else {
                                csv = 'ID interno, Fecha, No. Transaccion, Tipo, Subsidiaria, Cliente, Cuenta, Metodo de pago, Monto, Monto adeudado \r\n';
                            }

                            for (var line = 0; line < lineCount; line++) {
                                var isSelected = serverRequest.getSublistValue({
                                    group: CUSTOM_FIELDS.LISTS.LIST_ID,
                                    name: CUSTOM_FIELDS.LISTS.SELECT,
                                    line: line
                                }) === 'T';

                                if (isSelected) {
                                    var lineItems = {};
                                    lineItems[TRANSACTION_BODY.INTERNAL_ID] = serverRequest.getSublistValue({
                                        group: CUSTOM_FIELDS.LISTS.LIST_ID,
                                        name: CUSTOM_FIELDS.LISTS.INTERNAL_ID,
                                        line: line
                                    });

                                    log.debug({
                                        title: 'lineItems[TRANSACTION_BODY.INTERNAL_ID]',
                                        details: lineItems[TRANSACTION_BODY.INTERNAL_ID]
                                    });

                                    var name = serverRequest.getSublistValue({
                                        group: CUSTOM_FIELDS.LISTS.LIST_ID,
                                        name: CUSTOM_FIELDS.LISTS.TRANS_TYPE,
                                        line: line
                                    });
                                    var type = 0;
                                    var typeentity = 0;
                                    switch (name) {
                                        case 'Factura de venta':
                                            type = 7;
                                            typeentity = 1;
                                            break;
                                        case 'Pago de cliente':
                                            type = 9;
                                            typeentity = 1;
                                            break;
                                        case 'Nota de crédito cliente':
                                            type = 11;
                                            typeentity = 1;
                                            break;
                                        case 'Factura de proveedor':
                                            type = 13;
                                            typeentity = 2;
                                            break;
                                        case 'Nota de crédito proveedor':
                                            type = 15;
                                            typeentity = 2;
                                            break;
                                    }


                                    lineItems[TRANSACTION_BODY.TYPE] = type;
                                    lineItems[TRANSACTION_BODY.TYPE_ENTITY] = typeentity;

                                    lineItems[TRANSACTION_BODY.NAME] = serverRequest.getSublistValue({
                                        group: CUSTOM_FIELDS.LISTS.LIST_ID,
                                        name: CUSTOM_FIELDS.LISTS.NAME,
                                        line: line
                                    });

                                    lineItems[TRANSACTION_BODY.ACCOUNT] = serverRequest.getSublistValue({
                                        group: CUSTOM_FIELDS.LISTS.LIST_ID,
                                        name: CUSTOM_FIELDS.LISTS.ACCOUNT,
                                        line: line
                                    });
                                    log.debug({
                                        title: 'lineItems[TRANSACTION_BODY.ACCOUNT]',
                                        details: lineItems[TRANSACTION_BODY.ACCOUNT]
                                    });

                                    lineItems[TRANSACTION_BODY.AMOUNT_REMAINING] = serverRequest.getSublistValue({
                                        group: CUSTOM_FIELDS.LISTS.LIST_ID,
                                        name: CUSTOM_FIELDS.LISTS.AMOUNT_REMAINING,
                                        line: line
                                    });
                                    if (isGNC) {
                                        log.audit({ title: 'TRANSACTION_BODY.PAYMENT_METHOD', details: TRANSACTION_BODY.PAYMENT_METHOD });
                                        lineItems[TRANSACTION_BODY.PAYMENT_METHOD] = serverRequest.getSublistValue({
                                            group: CUSTOM_FIELDS.LISTS.LIST_ID,
                                            name: CUSTOM_FIELDS.LISTS.PAYMENT_METHOD,
                                            line: line
                                        });
                                        lineItems[TRANSACTION_BODY.DEPARTMENT] = serverRequest.getSublistValue({
                                            group: CUSTOM_FIELDS.LISTS.LIST_ID,
                                            name: CUSTOM_FIELDS.LISTS.DEPARTMENT,
                                            line: line
                                        });

                                        lineItems[TRANSACTION_BODY.CLASS] = serverRequest.getSublistValue({
                                            group: CUSTOM_FIELDS.LISTS.LIST_ID,
                                            name: CUSTOM_FIELDS.LISTS.CLASS,
                                            line: line
                                        });
                                        lineItems[TRANSACTION_BODY.INTERCOMPANY] = serverRequest.getSublistValue({
                                            group: CUSTOM_FIELDS.LISTS.LIST_ID,
                                            name: CUSTOM_FIELDS.LISTS.INTERCOMPANY,
                                            line: line
                                        });
                                        lineItems[TRANSACTION_BODY.SUBSIDIARY] = params[CUSTOM_FIELDS.SUBSIDIARY]
                                    }
                                    else {
                                        lineItems[TRANSACTION_BODY.TRAN_ID] = serverRequest.getSublistValue({
                                            group: CUSTOM_FIELDS.LISTS.LIST_ID,
                                            name: CUSTOM_FIELDS.LISTS.NUMBER,
                                            line: line
                                        });

                                        var inactive = serverRequest.getSublistValue({
                                            group: CUSTOM_FIELDS.LISTS.LIST_ID,
                                            name: CUSTOM_FIELDS.LISTS.IS_INACTIVE,
                                            line: line
                                        });
                                        lineItems[TRANSACTION_BODY.IS_INACTIVE] = (inactive == 'No' || inactive == 'NO') ? false : true;
                                        lineItems[TRANSACTION_BODY.SUBSIDIARY] = serverRequest.getSublistValue({
                                            group: CUSTOM_FIELDS.LISTS.LIST_ID,
                                            name: CUSTOM_FIELDS.LISTS.SUBSIDIARY_ID,
                                            line: line
                                        });
                                    }

                                    lines.push(lineItems);
                                }
                                log.debug({title: 'lines', details: lines});
                                csv += serverRequest.getSublistValue({
                                    group: CUSTOM_FIELDS.LISTS.LIST_ID,
                                    name: CUSTOM_FIELDS.LISTS.INTERNAL_ID,
                                    line: line
                                });
                                csv += ',' + serverRequest.getSublistValue({
                                    group: CUSTOM_FIELDS.LISTS.LIST_ID,
                                    name: CUSTOM_FIELDS.LISTS.DATE,
                                    line: line
                                });

                                csv += ',' + serverRequest.getSublistValue({
                                    group: CUSTOM_FIELDS.LISTS.LIST_ID,
                                    name: CUSTOM_FIELDS.LISTS.NUMBER,
                                    line: line
                                });

                                var trantype = serverRequest.getSublistValue({
                                    group: CUSTOM_FIELDS.LISTS.LIST_ID,
                                    name: CUSTOM_FIELDS.LISTS.TRANS_TYPE,
                                    line: line
                                });

                                csv += ',' + trantype;

                                csv += ',' + serverRequest.getSublistValue({
                                    group: CUSTOM_FIELDS.LISTS.LIST_ID,
                                    name: 'inpt_custpage_subsidiary', //CUSTOM_FIELDS.LISTS.SUBSIDIARY,
                                    line: line
                                });

                                csv += ',' + serverRequest.getSublistValue({
                                    group: CUSTOM_FIELDS.LISTS.LIST_ID,
                                    name: CUSTOM_FIELDS.LISTS.NAME,
                                    line: line
                                }).toString().replace(/,/gi, ';');

                                csv += ',' + serverRequest.getSublistValue({
                                    group: CUSTOM_FIELDS.LISTS.LIST_ID,
                                    name: CUSTOM_FIELDS.LISTS.ACCOUNT,
                                    line: line
                                });
                                if (isGNC) {
                                    csv += ',' + serverRequest.getSublistValue({
                                        group: CUSTOM_FIELDS.LISTS.LIST_ID,
                                        name: CUSTOM_FIELDS.LISTS.PAYMENT_METHOD,
                                        line: line
                                    });
                                }
                                csv += ',' + serverRequest.getSublistValue({
                                    group: CUSTOM_FIELDS.LISTS.LIST_ID,
                                    name: CUSTOM_FIELDS.LISTS.AMOUNT,
                                    line: line
                                });

                                csv += ',' + serverRequest.getSublistValue({
                                    group: CUSTOM_FIELDS.LISTS.LIST_ID,
                                    name: CUSTOM_FIELDS.LISTS.AMOUNT_REMAINING,
                                    line: line
                                });
                                csv += '\r\n';

                            }

                            //Send filters as object using a parameter
                            var objparam1 = JSON.stringify(lines);
                            var objparam2 = JSON.stringify(searchParams);


                            if (searchParams.file !== 'T') {
                                log.debug({title: 'objparam1', details: objparam1});
                                log.debug({title: 'objparam2', details: objparam2});
                                //Create task to call scheduled script
                                var shTask = task.create({
                                    taskType: task.TaskType.MAP_REDUCE,
                                    scriptId: SCRIPTS.SCHEDULED_SCRIPT.SCRIPT_ID,
                                    deploymentId: SCRIPTS.SCHEDULED_SCRIPT.DEPLOY_ID,
                                    params: {
                                        "custscript_ss_lines": objparam1, //"custscript_params1": objparam1,
                                        "custscript_ss_params": objparam2, //"custscript_params2": objparam2
                                        "custscript_tkio_is_gnc_mr": isGNC
                                    }
                                });
                                if (isGNC) {
                                    shTask.submit();
                                    redirect.toTaskLink({
                                        id: 'LIST_MAPREDUCESCRIPTSTATUS'
                                    });
                                } else {
                                    var idtask = shTask.submit();
                                    var otherId = record.submitFields({
                                        type: record.Type.SCRIPT_DEPLOYMENT,
                                        id: deploymentId,
                                        values: {
                                            'custscript_tkio_tak': idtask
                                        }
                                    });
                                    redirect.toSuitelet({
                                        scriptId: 'customscript_tkio_cs_cancel_amount_sl',
                                        deploymentId: 'customdeploy_tkio_cs_cancel_amount_sl'
                                    });
                                }
                            }
                        } else {
                            var csv = '';
                            if (isGNC) {
                                csv = ' ID interno, Fecha, No. Transaccion, Tipo, Subsidiaria, Cliente, Cuenta, Método de pago, Monto, Monto adeudado \r\n';
                            } else {
                                csv = ' ID interno, Fecha, No. Transaccion, Tipo, Subsidiaria, Cliente, Cuenta, Monto, Monto adeudado \r\n';
                            }
                            var tranResults = GetTransactions(searchParams, isGNC);
                            log.audit({ title: 'tranResults', details: tranResults });
                            log.debug({title: 'form', details: form.title});
                            if (!isGNC) {
                                var totalTransactions = form.getField({
                                    id: CUSTOM_FIELDS.TOTAL_TRANS
                                })
                                totalTransactions.defaultValue = tranResults.length;
                            }
                            if (tranResults.length && isGNC) {
                                subList.addButton({
                                    id: 'custpage_excel',
                                    label: 'Descargar Archivo',
                                    functionName: 'excel'
                                });
                                subList.addButton({
                                    id: 'custpage_check_all',
                                    label: 'Macar todo',
                                    functionName: 'checkAll'
                                });
                                subList.addButton({
                                    id: 'custpage_uncheck_all',
                                    label: 'Desmarcar todo',
                                    functionName: 'uncheckAll'
                                });
                            }
                            log.debug({ title: 'tranResults', details: tranResults });
                            for (var t = 0; t < tranResults.length; t++) {
                                log.debug({ title: 'fieldObject[' + t + ']', details: fieldObject });
                                var fieldObject = tranResults[t];
                                for (var key in fieldObject) {
                                    log.debug({ title: 'fieldObject[' + key + ']', details: fieldObject[key] });
                                    if (fieldObject[key] && isGNC) {
                                        subList.setSublistValue({
                                            id: key,
                                            line: t,
                                            value: fieldObject[key]
                                        });
                                    } else {
                                        subList.setSublistValue({
                                            id: key,
                                            line: t,
                                            value: fieldObject[key]
                                        });
                                    }
                                }

                                csv += fieldObject[CUSTOM_FIELDS.LISTS.INTERNAL_ID];
                                csv += ',' + fieldObject[CUSTOM_FIELDS.LISTS.DATE];
                                csv += ',' + fieldObject[CUSTOM_FIELDS.LISTS.NUMBER];
                                csv += ',' + fieldObject[CUSTOM_FIELDS.LISTS.TRANS_TYPE];
                                csv += ',' + fieldObject[CUSTOM_FIELDS.LISTS.SUBSIDIARY];
                                csv += ',' + fieldObject[CUSTOM_FIELDS.LISTS.NAME + "_text"];
                                csv += ',' + fieldObject[CUSTOM_FIELDS.LISTS.ACCOUNT + "_text"];
                                if (isGNC) {
                                    csv += ',' + fieldObject[CUSTOM_FIELDS.LISTS.PAYMENT_METHOD];
                                }
                                csv += ',' + fieldObject[CUSTOM_FIELDS.LISTS.AMOUNT];
                                csv += ',' + fieldObject[CUSTOM_FIELDS.LISTS.AMOUNT_REMAINING];
                                csv += '\r\n';
                            }
                            if (searchParams.file === 'T') {
                                log.debug('csv', csv);
                                var fileObj = file.create({
                                    name: 'resultados.csv',
                                    fileType: file.Type.CSV,
                                    encoding: file.Encoding.WINDOWS_1252,
                                    contents: csv
                                });
                                fileObj.folder = -15;
                                var idfile = fileObj.save();
                                var loadedfile = file.load({
                                    id: idfile
                                });
                                log.debug("file content", loadedfile.getContents());

                                serverResponse.writeFile({
                                    file: loadedfile,
                                    isInline: false
                                });
                            }
                        }
                    }
                }
                log.debug({title: 'form', details: form.title});
                if (!searchParams) {
                    // serverResponse.writePage(form);
                    serverResponse.writePage({ pageObject: form });
                } else if (searchParams.file !== 'T') {
                    // serverResponse.writePage(form);
                    serverResponse.writePage({ pageObject: form });
                }else{
                    serverResponse.writePage({ pageObject: form });
                }
            } catch (error) {
                log.error({ title: 'Error onRequest: ', details: error });
            }
        }

        function createPanel(isGNC, form, serverRequest, status) {
            try {
                //add principal filters
                form.addFieldGroup({
                    id: CUSTOM_FIELDS.PRIMARY,
                    label: 'Filtros principales'
                });
                //add secondary filters || pagination
                form.addFieldGroup({
                    id: CUSTOM_FIELDS.SECONDARY,
                    label: (isGNC ? 'Filtros secundarios' : 'Paginación')
                });
                //Validatio for instance GNC
                if (isGNC) {
                    // add customer
                    var customerField = form.addField({
                        id: CUSTOM_FIELDS.CUSTOMER,
                        type: serverWidget.FieldType.SELECT,
                        label: 'Cliente',
                        source: RECORDS.CUSTOMER,
                        container: CUSTOM_FIELDS.PRIMARY
                    });
                    // add subsidiary || company
                    var subsidiaryField = form.addField({
                        id: CUSTOM_FIELDS.SUBSIDIARY,
                        type: serverWidget.FieldType.SELECT,
                        label: 'Compañia',
                        source: RECORDS.SUBSIDIARY,
                        container: CUSTOM_FIELDS.PRIMARY
                    });
                    //add category
                    var customerCategoryField = form.addField({
                        id: CUSTOM_FIELDS.CUSTOMER_CATEGORY,
                        type: serverWidget.FieldType.SELECT,
                        label: 'Categoría de Cliente',
                        source: RECORDS.CUSTOMER_CATEGORY,
                        container: CUSTOM_FIELDS.PRIMARY
                    });
                    // add transaction types
                    var transactionTypeField = form.addField({
                        id: CUSTOM_FIELDS.TRAN_TYPE,
                        type: serverWidget.FieldType.MULTISELECT,
                        label: 'Tipo de transacción',
                        container: CUSTOM_FIELDS.PRIMARY
                    });
                    //add date ranges
                    var tranDateField = form.addField({
                        id: CUSTOM_FIELDS.TRAN_DATE,
                        type: serverWidget.FieldType.DATE,
                        label: 'Fecha contable',
                        container: CUSTOM_FIELDS.PRIMARY
                    });

                    tranDateField.isMandatory = true;
                    tranDateField.defaultValue = new Date();
                    // add date ranges
                    var startDateField = form.addField({
                        id: CUSTOM_FIELDS.START_DATE,
                        type: serverWidget.FieldType.DATE,
                        label: 'Fecha inicio',
                        container: CUSTOM_FIELDS.PRIMARY
                    });
                    var endDateField = form.addField({
                        id: CUSTOM_FIELDS.END_DATE,
                        type: serverWidget.FieldType.DATE,
                        label: 'Fecha fin',
                        container: CUSTOM_FIELDS.PRIMARY
                    });
                    // add amount ranges
                    var startAmountField = form.addField({
                        id: CUSTOM_FIELDS.START_AMT,
                        type: serverWidget.FieldType.CURRENCY,
                        label: 'Monto Inicio',
                        container: CUSTOM_FIELDS.SECONDARY
                    });
                    startAmountField.isMandatory = true;

                    var endAmountField = form.addField({
                        id: CUSTOM_FIELDS.END_AMT,
                        type: serverWidget.FieldType.CURRENCY,
                        label: 'Monto Fin',
                        container: CUSTOM_FIELDS.SECONDARY
                    });
                    var reasonField = form.addField({
                        id: CUSTOM_FIELDS.REASON,
                        type: serverWidget.FieldType.TEXTAREA,
                        label: 'Razones',
                        container: CUSTOM_FIELDS.SECONDARY
                    });

                    var fileField = form.addField({
                        id: CUSTOM_FIELDS.FILE,
                        type: serverWidget.FieldType.TEXTAREA,
                        label: 'Generar archivo',
                        container: CUSTOM_FIELDS.SECONDARY
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.HIDDEN
                    });

                    form.addSubmitButton({
                        label: 'Ejecutar'
                    });
                } else {
                    // add subsidiary || company
                    var subsidiaryField = form.addField({
                        id: CUSTOM_FIELDS.SUBSIDIARY,
                        type: serverWidget.FieldType.SELECT,
                        label: 'Subsidiaria',
                        source: RECORDS.SUBSIDIARY,
                        container: CUSTOM_FIELDS.PRIMARY
                    });
                    subsidiaryField.defaultValue = (serverRequest.parameters[CUSTOM_FIELDS.SUBSIDIARY]) ? serverRequest.parameters[CUSTOM_FIELDS.SUBSIDIARY] : '';

                    // add transaction types
                    var transactionTypeField = form.addField({
                        id: CUSTOM_FIELDS.TRAN_TYPE,
                        type: serverWidget.FieldType.MULTISELECT,
                        label: 'Tipo de transacción',
                        container: CUSTOM_FIELDS.PRIMARY
                    });
                    // add subsidiary
                    var customerField = form.addField({
                        id: CUSTOM_FIELDS.CUSTOMER,
                        type: serverWidget.FieldType.MULTISELECT,
                        label: 'Cliente',
                        source: RECORDS.CUSTOMER,
                        container: CUSTOM_FIELDS.PRIMARY
                    });
                    // add date ranges
                    var startDateField = form.addField({
                        id: CUSTOM_FIELDS.START_DATE,
                        type: serverWidget.FieldType.DATE,
                        label: 'Fecha inicio',
                        container: CUSTOM_FIELDS.PRIMARY
                    });
                    startDateField.defaultValue = (serverRequest.parameters[CUSTOM_FIELDS.START_DATE]) ? serverRequest.parameters[CUSTOM_FIELDS.START_DATE] : '';

                    var endDateField = form.addField({
                        id: CUSTOM_FIELDS.END_DATE,
                        type: serverWidget.FieldType.DATE,
                        label: 'Fecha fin',
                        container: CUSTOM_FIELDS.PRIMARY
                    });
                    endDateField.defaultValue = (serverRequest.parameters[CUSTOM_FIELDS.END_DATE]) ? serverRequest.parameters[CUSTOM_FIELDS.END_DATE] : '';

                    var endAmountField = form.addField({
                        id: CUSTOM_FIELDS.END_AMT,
                        type: serverWidget.FieldType.CURRENCY,
                        label: 'Rango tolerancia',
                        container: CUSTOM_FIELDS.PRIMARY
                    });

                    var defaulttolerance = runtime.getCurrentScript().getParameter({ name: 'custscript_tkio_cs_tolerancia' });
                    log.audit({ title: 'defaulttolerance', details: defaulttolerance });
                    log.debug({ title: 'serverRequest.parameters', details: serverRequest.parameters });
                    endAmountField.defaultValue = (serverRequest.parameters[CUSTOM_FIELDS.END_AMT]) ? serverRequest.parameters[CUSTOM_FIELDS.END_AMT] : defaulttolerance;

                    var totalTransactions = form.addField({
                        id: CUSTOM_FIELDS.TOTAL_TRANS,
                        type: serverWidget.FieldType.INTEGER,
                        label: 'Total de transacciones',
                        container: CUSTOM_FIELDS.PRIMARY
                    });
                    totalTransactions.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });

                    var message = form.addField({
                        id: CUSTOM_FIELDS.MESSAGE,
                        type: serverWidget.FieldType.TEXT,
                        label: 'Mensajes',
                        container: CUSTOM_FIELDS.PRIMARY
                    });
                    message.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });

                    log.debug("status", status);
                    // add submit button
                    if ((status.status == "COMPLETE" || status.status == "FAILED" || !status.status) && !status.stage) {
                        form.addSubmitButton({
                            label: 'Ejecutar'
                        });
                    }
                    else {
                        message.defaultValue = "Se está ejecutando un proceso de cancelación, espere un momento por favor";
                    }
                    // add reset button
                    form.addButton({
                        id: 'custpage_filter',
                        label: 'Filtrar',
                        functionName: 'filter'
                    });
                }
                log.debug("TRAN_TYPE", serverRequest.parameters[CUSTOM_FIELDS.TRAN_TYPE]);
                transactionTypeField = addValuesTransactionTypeField(transactionTypeField, customerField, isGNC, serverRequest);
                subsidiaryField.isMandatory = true;
                transactionTypeField.isMandatory = true;
                startDateField.isMandatory = true;
                endDateField.isMandatory = true;
                endAmountField.isMandatory = true;

                // add reset button
                form.addButton({
                    id: 'custpage_reload',
                    label: 'Reiniciar',
                    functionName: 'reload'
                });
                return form
            } catch (error) {
                log.error({ title: 'Error createPanel: ', details: error });
            }
        }

        //Set selected values
        function setValueSelect(form, searchParams) {
            try {
                // set selected values
                var customerField = form.getField(CUSTOM_FIELDS.CUSTOMER);
                customerField.defaultValue = searchParams.customer;
                var customerCategoryField = form.getField(CUSTOM_FIELDS.CUSTOMER_CATEGORY);
                customerCategoryField.defaultValue = searchParams.customerCategory;
                var subsidiaryField = form.getField(CUSTOM_FIELDS.SUBSIDIARY);
                subsidiaryField.defaultValue = searchParams.subsidiary;
                var transactionTypeField = form.getField(CUSTOM_FIELDS.TRAN_TYPE);
                transactionTypeField.defaultValue = searchParams.transaction_type;
                var tranDateField = form.getField(CUSTOM_FIELDS.TRAN_DATE);
                tranDateField.defaultValue = searchParams.trandate;
                var startDateField = form.getField(CUSTOM_FIELDS.START_DATE);
                startDateField.defaultValue = searchParams.startdate;
                var endDateField = form.getField(CUSTOM_FIELDS.END_DATE);
                endDateField.defaultValue = searchParams.enddate;
                var startAmountField = form.getField(CUSTOM_FIELDS.START_AMT);
                startAmountField.defaultValue = searchParams.start_amt;
                var endAmountField = form.getField(CUSTOM_FIELDS.END_AMT);
                endAmountField.defaultValue = searchParams.end_amt;
                var reasonField = form.getField(CUSTOM_FIELDS.REASON);
                reasonField.defaultValue = searchParams.reason;
                return form

            } catch (error) {
                log.error({ title: 'Error setValueSelect: ', details: error });
            }
        }
        //Add all types of transactions
        function addValuesTransactionTypeField(transactionTypeField, customerField, isGNC, serverRequest) {
            try {
                log.debug("TRAN_TYPE", serverRequest.parameters[CUSTOM_FIELDS.TRAN_TYPE]);
                transactionTypeField.addSelectOption({
                    value: '7',
                    text: 'Factura de venta'
                });
                transactionTypeField.addSelectOption({
                    value: '9',
                    text: 'Pago de cliente'
                });
                if (!isGNC) {
                    transactionTypeField.addSelectOption({
                        value: '11',
                        text: 'Nota de crédito cliente'
                    });
                    transactionTypeField.addSelectOption({
                        value: '13',
                        text: 'Factura de proveedor'
                    });
                    transactionTypeField.addSelectOption({
                        value: '15',
                        text: 'Nota de crédito proveedor'
                    });
                    log.debug("TRAN_TYPE", serverRequest.parameters[CUSTOM_FIELDS.TRAN_TYPE]);
                    if (serverRequest.method === 'POST') {
                        transactionTypeField.defaultValue = serverRequest.parameters[CUSTOM_FIELDS.TRAN_TYPE]
                        customerField.defaultValue = serverRequest.parameters[CUSTOM_FIELDS.CUSTOMER]
                    }
                    else {
                        transactionTypeField.defaultValue = (serverRequest.parameters[CUSTOM_FIELDS.TRAN_TYPE]) ? JSON.parse(serverRequest.parameters[CUSTOM_FIELDS.TRAN_TYPE]) : '';
                        customerField.defaultValue = (serverRequest.parameters[CUSTOM_FIELDS.CUSTOMER]) ? JSON.parse(serverRequest.parameters[CUSTOM_FIELDS.CUSTOMER]) : '';
                    }
                }
                return transactionTypeField;
            } catch (error) {
                log.error({ title: 'Error addValuesTransactionTypeField: ', details: error });
            }
        }

        function AddSublist(form, isGNC) {
            try {
                var transactionList = form.addSublist({
                    id: CUSTOM_FIELDS.LISTS.LIST_ID,
                    type: serverWidget.SublistType.LIST,
                    label: 'Transacciones'
                });
                if (isGNC) {
                    // Sublist Fields
                    transactionList.addField({
                        id: CUSTOM_FIELDS.LISTS.SELECT,
                        type: serverWidget.FieldType.CHECKBOX,
                        label: 'Select'
                    });
                    transactionList.addField({
                        id: CUSTOM_FIELDS.LISTS.DATE,
                        type: serverWidget.FieldType.DATE,
                        label: 'Date'
                    }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
                    transactionList.addField({
                        id: CUSTOM_FIELDS.LISTS.NUMBER,
                        type: serverWidget.FieldType.TEXT,
                        label: 'Número de transacción'
                    }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
                    transactionList.addField({
                        id: CUSTOM_FIELDS.LISTS.TRANS_TYPE,
                        type: serverWidget.FieldType.TEXT,
                        label: 'Tipo de transacción'
                    }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
                    transactionList.addField({
                        id: CUSTOM_FIELDS.LISTS.SUBSIDIARY,
                        type: serverWidget.FieldType.TEXT,
                        label: 'Subsidiaria'
                    }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
                    transactionList.addField({
                        id: CUSTOM_FIELDS.LISTS.INTERNAL_ID,
                        type: serverWidget.FieldType.TEXT,
                        label: 'ID Interno'
                    }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
                    transactionList.addField({
                        id: CUSTOM_FIELDS.LISTS.NAME,
                        type: serverWidget.FieldType.SELECT,
                        label: 'Cliente',
                        source: RECORDS.CUSTOMER
                    }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
                    transactionList.addField({
                        id: CUSTOM_FIELDS.LISTS.ACCOUNT,
                        type: serverWidget.FieldType.SELECT,
                        label: 'Cuenta',
                        source: RECORDS.ACCOUNT
                    }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
                    transactionList.addField({
                        id: CUSTOM_FIELDS.LISTS.PAYMENT_METHOD,
                        type: serverWidget.FieldType.TEXT,
                        label: 'Método de pago'
                    }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
                    transactionList.addField({
                        id: CUSTOM_FIELDS.LISTS.AMOUNT,
                        type: serverWidget.FieldType.CURRENCY,
                        label: 'Monto'
                    }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
                    transactionList.addField({
                        id: CUSTOM_FIELDS.LISTS.AMOUNT_REMAINING,
                        type: serverWidget.FieldType.CURRENCY,
                        label: 'Monto adeudado'
                    }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
                    transactionList.addField({
                        id: CUSTOM_FIELDS.LISTS.DEPARTMENT,
                        type: serverWidget.FieldType.SELECT,
                        label: 'Centro de responsabilidad',
                        source: 'department'
                    }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
                    transactionList.addField({
                        id: CUSTOM_FIELDS.LISTS.CLASS,
                        type: serverWidget.FieldType.SELECT,
                        label: 'Adicional',
                        source: 'classification'
                    }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
                    transactionList.addField({
                        id: CUSTOM_FIELDS.LISTS.INTERCOMPANY,
                        type: serverWidget.FieldType.SELECT,
                        label: 'Intercompañía',
                        source: 'customrecord_csegefxintercompani'
                    }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
                } else {
                    transactionList.addMarkAllButtons();
                    // Sublist Fields
                    transactionList.addField({
                        id: CUSTOM_FIELDS.LISTS.SELECT,
                        type: serverWidget.FieldType.CHECKBOX,
                        label: ' '
                    });
                    transactionList.addField({
                        id: CUSTOM_FIELDS.LISTS.TRANS_TYPE,
                        type: serverWidget.FieldType.TEXT,
                        label: 'Tipo de transacción'
                    }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
                    transactionList.addField({
                        id: CUSTOM_FIELDS.LISTS.NUMBER,
                        type: serverWidget.FieldType.TEXT,
                        label: 'Número de transacción'
                    }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
                    transactionList.addField({
                        id: CUSTOM_FIELDS.LISTS.NAME,
                        type: serverWidget.FieldType.SELECT,
                        label: 'Entidad',
                        source: RECORDS.CUSTOMER
                    }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
                    transactionList.addField({
                        id: CUSTOM_FIELDS.LISTS.IS_INACTIVE,
                        type: serverWidget.FieldType.TEXT,
                        label: 'Entidad inactivo',
                    }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
                    transactionList.addField({
                        id: CUSTOM_FIELDS.LISTS.DATE,
                        type: serverWidget.FieldType.DATE,
                        label: 'Fecha'
                    }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
                    transactionList.addField({
                        id: CUSTOM_FIELDS.LISTS.SUBSIDIARY,
                        type: serverWidget.FieldType.TEXT,
                        label: 'Empresa'
                    }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
                    transactionList.addField({
                        id: CUSTOM_FIELDS.LISTS.SUBSIDIARY_ID,
                        type: serverWidget.FieldType.TEXT,
                        label: 'Empresa ID'
                    }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
                    transactionList.addField({
                        id: CUSTOM_FIELDS.LISTS.INTERNAL_ID,
                        type: serverWidget.FieldType.TEXT,
                        label: 'ID Interno'
                    }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
                    transactionList.addField({
                        id: CUSTOM_FIELDS.LISTS.ACCOUNT,
                        type: serverWidget.FieldType.SELECT,
                        label: 'Cuenta',
                        source: RECORDS.ACCOUNT
                    }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
                    transactionList.addField({
                        id: CUSTOM_FIELDS.LISTS.AMOUNT,
                        type: serverWidget.FieldType.CURRENCY,
                        label: 'Monto'
                    }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
                    transactionList.addField({
                        id: CUSTOM_FIELDS.LISTS.AMOUNT_REMAINING,
                        type: serverWidget.FieldType.CURRENCY,
                        label: 'Monto adeudado'
                    }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });

                }
                return transactionList;
            } catch (error) {
                log.error({ title: 'Error AddSublist: ', details: error });
            }
        }

        function GetTransactions(searchParams, isGNC) {
            try {
                var results = [];

                var searchFilters = [
                    [TRANSACTION_BODY.AMOUNT_REMAINING_ZERO, search.Operator.IS, "T"]
                ];

                if (searchParams.customer) {
                    searchFilters.push("AND", [TRANSACTION_BODY.NAME, search.Operator.ANYOF, searchParams.customer]);
                }
                if (searchParams.customerCategory) {
                    searchFilters.push("AND", [TRANSACTION_BODY.CUSTOMER_CATEGORY, search.Operator.ANYOF, searchParams.customerCategory]);
                }
                if (searchParams.subsidiary) {
                    searchFilters.push("AND", [TRANSACTION_BODY.SUBSIDIARY, search.Operator.ANYOF, searchParams.subsidiary]);
                }

                if (searchParams.startdate && searchParams.enddate) {
                    searchFilters.push("AND", [TRANSACTION_BODY.TRANDATE, search.Operator.WITHIN, searchParams.startdate, searchParams.enddate])
                }
                if (searchParams.start_amt && searchParams.end_amt && isGNC) {
                    searchFilters.push("AND", [TRANSACTION_BODY.AMOUNT_REMAINING, search.Operator.BETWEEN, searchParams.start_amt, searchParams.end_amt]);
                }
                if (searchParams.end_amt && !isGNC) {
                    searchFilters.push("AND", [TRANSACTION_BODY.AMOUNT_REMAINING, search.Operator.LESSTHANOREQUALTO, searchParams.end_amt]);
                }

                var recordType = '';
                var searchOneMoreTime = false;

                if (searchParams.transaction_type && searchParams.transaction_type.length === 1) {
                    recordType = searchParams.transaction_type[0];
                }

                if (searchParams.transaction_type && searchParams.transaction_type.length > 1) {
                    recordType = searchParams.transaction_type[0];
                    searchOneMoreTime = true;
                }

                var recordFilters = [];
                var auxrecord = [TRANSACTION_BODY.TYPE, search.Operator.ANYOF];

                log.debug({ title: 'searchParams.transaction_type', details: searchParams.transaction_type });
                if (searchParams.transaction_type.indexOf("7") != -1) {
                    if (isGNC) {
                        recordFilters.push("AND", [TRANSACTION_BODY.TYPE, search.Operator.ANYOF, RECORDS.INVOICE_SHORT]);
                        recordFilters.push("AND", [TRANSACTION_BODY.MAINLINE, search.Operator.IS, "T"]);
                    } else {
                        auxrecord.push(RECORDS.INVOICE_SHORT);
                    }
                }
                if (searchParams.transaction_type.indexOf("11") != -1) {
                    auxrecord.push(RECORDS.CREDITMEMO_SHORT);
                }
                if (searchParams.transaction_type.indexOf("13") != -1) {
                    auxrecord.push(RECORDS.BILL_SHORT);
                }
                if (searchParams.transaction_type.indexOf("15") != -1) {
                    auxrecord.push(RECORDS.CREDITBILL_SHORT);
                }
                if (!isGNC) {
                    recordFilters.push("AND", [TRANSACTION_BODY.TYPE, search.Operator.ANYOF, auxrecord]);
                    recordFilters.push("AND", [TRANSACTION_BODY.MAINLINE, search.Operator.IS, "T"]);
                }


                var invSearchFilters = searchFilters.concat(recordFilters)
                var searchObj = CreateSearch(invSearchFilters, isGNC);

                log.debug("searchObj", searchObj);
                log.debug("recordFilters", recordFilters);

                var results1 = GetResults(searchObj, isGNC);
                results = results.concat(results1);
                log.debug({ title: 'Results Obtain: ', details: 'FLAG' });
                if (searchParams.transaction_type.indexOf("9") != -1) {
                    recordType = searchParams.transaction_type[1];
                    recordFilters = [];

                    recordFilters.push("AND", [TRANSACTION_BODY.TYPE, search.Operator.ANYOF, RECORDS.CUSTOMER_PAYMENT_SHORT])
                    recordFilters.push("AND", [TRANSACTION_BODY.MAINLINE, search.Operator.IS, "F"]);

                    var paymentSearchFilters = searchFilters.concat(recordFilters)
                    log.debug("recordFilters", recordFilters);
                    searchObj = CreateSearch(paymentSearchFilters, isGNC);

                    var results2 = GetResults(searchObj, isGNC);
                    results = results.concat(results2);
                }

                return results;

                function CreateSearch(searchFilters, isGNC) {
                    try {
                        log.debug("CreateSearch filters", searchFilters);
                        log.debug("Instancia", isGNC);
                        if (isGNC) {
                            return search.create({
                                type: RECORDS.TRANSACTION,
                                filters: searchFilters,
                                columns:
                                    [
                                        search.createColumn({
                                            name: TRANSACTION_BODY.TRANDATE,
                                            sort: search.Sort.ASC
                                        }),
                                        search.createColumn({ name: TRANSACTION_BODY.TRAN_ID }),
                                        search.createColumn({ name: TRANSACTION_BODY.SUBSIDIARY }),
                                        search.createColumn({ name: TRANSACTION_BODY.ENTITY }),
                                        search.createColumn({ name: TRANSACTION_BODY.ACCOUNT }),
                                        search.createColumn({ name: TRANSACTION_BODY.PAYMENT_METHOD }),
                                        search.createColumn({ name: TRANSACTION_BODY.AMOUNT }),
                                        search.createColumn({ name: TRANSACTION_BODY.AMOUNT_REMAINING }),
                                        search.createColumn({ name: TRANSACTION_BODY.TYPE }),
                                        search.createColumn({ name: TRANSACTION_BODY.CLASS }),
                                        search.createColumn({ name: TRANSACTION_BODY.DEPARTMENT }),
                                        search.createColumn({ name: TRANSACTION_BODY.INTERCOMPANY })
                                    ]
                            });
                        } else {
                            return search.create({
                                type: RECORDS.TRANSACTION,
                                filters: searchFilters,
                                columns:
                                    [
                                        search.createColumn({
                                            name: TRANSACTION_BODY.TRANDATE,
                                            sort: search.Sort.ASC
                                        }),
                                        search.createColumn({ name: TRANSACTION_BODY.TRAN_ID }),
                                        search.createColumn({ name: TRANSACTION_BODY.SUBSIDIARY }),
                                        search.createColumn({ name: TRANSACTION_BODY.ENTITY }),
                                        search.createColumn({ name: TRANSACTION_BODY.ACCOUNT }),
                                        search.createColumn({ name: TRANSACTION_BODY.AMOUNT }),
                                        search.createColumn({ name: TRANSACTION_BODY.AMOUNT_REMAINING }),
                                        search.createColumn({ name: TRANSACTION_BODY.IS_INACTIVE, join: TRANSACTION_BODY.CUSTOMER_MAIN }),
                                        search.createColumn({ name: TRANSACTION_BODY.IS_INACTIVE, join: TRANSACTION_BODY.VENDOR }),
                                        search.createColumn({ name: TRANSACTION_BODY.TYPE })
                                    ]
                            });
                        }
                    } catch (error) {
                        log.error({ title: 'Error CreateSearch: ', details: error });
                    }
                }

                function GetResults(searchObj, isGNC) {
                    try {
                        log.debug({ title: 'isGNC', details: isGNC });
                        var results = [];
                        var searchResultCount = searchObj.runPaged().count;
                        if (searchResultCount > 0) {
                            searchObj.run().each(function (result) {
                                // .run().each has a limit of 4,000 results

                                log.debug({ title: 'result', details: result });
                                var res = {};
                                res[CUSTOM_FIELDS.LISTS.SELECT] = 'T';
                                res[CUSTOM_FIELDS.LISTS.INTERNAL_ID] = result.id || '';
                                res[CUSTOM_FIELDS.LISTS.NUMBER] = result.getValue(TRANSACTION_BODY.TRAN_ID) || '';
                                res[CUSTOM_FIELDS.LISTS.DATE] = result.getValue(TRANSACTION_BODY.TRANDATE) || '';
                                res[CUSTOM_FIELDS.LISTS.SUBSIDIARY] = result.getText(TRANSACTION_BODY.SUBSIDIARY) || '';
                                res[CUSTOM_FIELDS.LISTS.NAME] = result.getValue(TRANSACTION_BODY.ENTITY) || '';
                                res[CUSTOM_FIELDS.LISTS.NAME + "_text"] = (isGNC ? (result.getText(TRANSACTION_BODY.ENTITY)).toString().replace(/,/gi, ' ') || '' : (result.getText(TRANSACTION_BODY.ENTITY)).toString().replace(',', ';') || '');
                                res[CUSTOM_FIELDS.LISTS.ACCOUNT] = result.getValue(TRANSACTION_BODY.ACCOUNT) || '';
                                res[CUSTOM_FIELDS.LISTS.ACCOUNT + "_text"] = (isGNC ? (result.getText(TRANSACTION_BODY.ACCOUNT)).toString().replace(/,/gi, ' ') || '' : (result.getText(TRANSACTION_BODY.ACCOUNT)).toString().replace(',', ';') || '');
                                res[CUSTOM_FIELDS.LISTS.AMOUNT] = result.getValue(TRANSACTION_BODY.AMOUNT) || '';
                                res[CUSTOM_FIELDS.LISTS.AMOUNT_REMAINING] = result.getValue(TRANSACTION_BODY.AMOUNT_REMAINING) || 0;
                                if (isGNC) {
                                    res[CUSTOM_FIELDS.LISTS.DEPARTMENT] = result.getValue(TRANSACTION_BODY.DEPARTMENT) || '';
                                    res[CUSTOM_FIELDS.LISTS.CLASS] = result.getValue(TRANSACTION_BODY.CLASS) || '';
                                    res[CUSTOM_FIELDS.LISTS.INTERCOMPANY] = result.getValue(TRANSACTION_BODY.INTERCOMPANY) || '';
                                    res[CUSTOM_FIELDS.LISTS.DATE] = result.getValue(TRANSACTION_BODY.TRANDATE) || '';
                                    res[CUSTOM_FIELDS.LISTS.PAYMENT_METHOD] = result.getText(TRANSACTION_BODY.PAYMENT_METHOD) || ' ';
                                    res[CUSTOM_FIELDS.LISTS.AMOUNT] = (res[CUSTOM_FIELDS.LISTS.AMOUNT] < 0) ? res[CUSTOM_FIELDS.LISTS.AMOUNT] * -1 : res[CUSTOM_FIELDS.LISTS.AMOUNT];
                                    res[CUSTOM_FIELDS.LISTS.AMOUNT_REMAINING] = (res[CUSTOM_FIELDS.LISTS.AMOUNT_REMAINING] < 0) ? res[CUSTOM_FIELDS.LISTS.AMOUNT_REMAINING] * -1 : res[CUSTOM_FIELDS.LISTS.AMOUNT_REMAINING];
                                } else {
                                    res[CUSTOM_FIELDS.LISTS.SUBSIDIARY_ID] = result.getValue(TRANSACTION_BODY.SUBSIDIARY) || '';
                                }
                                var type = result.getValue(TRANSACTION_BODY.TYPE) || '';
                                var typeentity = 0;
                                switch (type) {
                                    case RECORDS.CUSTOMER_PAYMENT_SHORT:
                                        type = 'Pago de cliente';
                                        typeentity = 1;
                                        break;
                                    case RECORDS.INVOICE_SHORT:
                                        type = 'Factura de venta';
                                        typeentity = 1;
                                        break;
                                    case RECORDS.BILL_SHORT:
                                        type = 'Factura de proveedor';
                                        typeentity = 2;
                                        break;
                                    case RECORDS.CREDITMEMO_SHORT:
                                        type = 'Nota de crédito cliente';
                                        typeentity = 1;
                                        break;
                                    case RECORDS.CREDITBILL_SHORT:
                                        type = 'Nota de crédito proveedor';
                                        typeentity = 2;
                                        break;
                                }

                                res[CUSTOM_FIELDS.LISTS.TRANS_TYPE] = type;

                                var isinactivecustomer = result.getValue({ name: TRANSACTION_BODY.IS_INACTIVE, join: TRANSACTION_BODY.CUSTOMER_MAIN });
                                var isinactivevendor = result.getValue({ name: TRANSACTION_BODY.IS_INACTIVE, join: TRANSACTION_BODY.VENDOR });

                                if (!isGNC) {
                                    res[CUSTOM_FIELDS.LISTS.IS_INACTIVE] = (!isinactivecustomer || isinactivecustomer == 'F') ? "NO" : "SI";
                                    if (typeentity == 2) {
                                        res[CUSTOM_FIELDS.LISTS.IS_INACTIVE] = (!isinactivevendor || isinactivevendor == 'F') ? "NO" : "SI";
                                    }
                                }
                                results.push(res);
                                return true;
                            });
                        }
                        log.debug("getresults result", results);
                        return results;
                    } catch (e) {
                        log.error({ title: 'Error GetResults:', details: e });
                    }
                }
            } catch (e) {
                log.error({ title: 'Error GetTransactions: ', details: e });
            }
        }

        return {
            onRequest: onRequest
        };
    });